import mysql.connector
from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models
from collections import defaultdict

cnx = mysql.connector.connect(user='root', password='root',
                              host='127.0.0.1',
                              database='diffusion')
cursor = cnx.cursor()
query = "select policy_id, text_1, text_2, text_3, text_4, text_5 from policy_text"
cursor.execute(query)
policy_text = {}
texts = []
ids = []

count = 0
# Combine 5 snippets for each policy
for (policy_id, text_1, text_2, text_3, text_4, text_5) in cursor:
    text = (text_1 + text_2 + text_3 + text_4 + text_5).lower()

    # Clean data
    # 1) only select alphabetic characters
    tokenizer = RegexpTokenizer(r'[a-z]+')
    text = tokenizer.tokenize(text)
    # 2) stop words
    en_stop = get_stop_words('en')
    text = [i for i in text if not i in en_stop]
    # 3) stemming
    p_stemmer = PorterStemmer()
    text = [p_stemmer.stem(i) for i in text]

    policy_text[policy_id] = count
    texts.append(text)
    ids.append(policy_id)
    count += 1

def my_LDA(texts, num_tpc):
    # Constructing a document-term matrix
    dictionary = corpora.Dictionary(texts)
    corpus = [dictionary.doc2bow(text) for text in texts]
    tfidf = models.tfidfmodel.TfidfModel(corpus, id2word=dictionary)

    # Find 2/8 point for tfidf values
    words_tfidf = []
    for bow in corpus:
        words_tfidf += [value for id, value in tfidf[bow]]
    words_tfidf.sort()
    low_value = words_tfidf[int(round(len(words_tfidf)*2/8))]

    # Filter terms with tfidf lower than low_value out
    low_value_words_id = set()
    for bow in corpus:
        words = [id for id, value in tfidf[bow] if value < low_value]
        low_value_words_id.update(set(words))

    low_value_words = [dictionary[i] for i in low_value_words_id]
    dictionary.filter_tokens(bad_ids=low_value_words_id)
    corpus = [dictionary.doc2bow(text) for text in texts]

    # LDA model
    ldamodel = models.ldamodel.LdaModel(corpus, num_topics=num_tpc, id2word=dictionary)

    topics = []
    for idx, each in enumerate(corpus):
        topics.append(ldamodel.get_document_topics(bow=each))

    return topics


topics = my_LDA(texts, 60)
# Get topic for each bow, put it to database
topic2doc = defaultdict(list)  # group_id: idx
for idx, each in enumerate(topics):
    topic_great = max(each, key=lambda x:x[1])[0]
    topic2doc[topic_great].append(idx)
    query = "update policy set policy_lda_1 = %s where policy_id = '%s'" %(topic_great, ids[idx])
    cursor.execute(query)
cnx.commit()

# Second round for topic
for topic in topic2doc:
    text_tmp = []
    for policy_id in topic2doc[topic]:
        text_tmp.append(texts[policy_id])
    topics = my_LDA(text_tmp, 3)
    for idx, each in enumerate(topics):
        topic_great = max(each, key=lambda x: x[1])[0]
        query = "update policy set policy_lda_2 = %s where policy_id = '%s'" % (topic_great, ids[topic2doc[topic][idx]])
        cursor.execute(query)
cnx.commit()
cursor.close()
cnx.close()
