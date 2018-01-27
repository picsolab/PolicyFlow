import pandas as pd
import mysql.connector
from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models, similarities
from collections import defaultdict
import gensim
from functools import reduce
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

# Get texts for policies
cnx = mysql.connector.connect(user='root', password='root',
                              host='127.0.0.1',
                              database='diffusion')
cursor = cnx.cursor()
query = "select ptxt.policy_id, policy_name, text_1, text_2, text_3, text_4, text_5 from policy_text as ptxt, policy as plc where ptxt.policy_id = plc.policy_id"
cursor.execute(query)
policy_text = {}
texts = []
ids = []

count = 0
# Combine policy name and 5 snippets for each policy
for (policy_id, policy_name, text_1, text_2, text_3, text_4, text_5) in cursor:
    text = (policy_name + " " + text_1 + " " + text_2 + " " + text_3 + " " + text_4 + " " + text_5).lower()

    # Clean data
    # 1) only select alphabetic characters
    tokenizer = RegexpTokenizer(r'[a-z]+')
    text = tokenizer.tokenize(text)
    # 2) stop words
    en_stop = get_stop_words('en')
    text = [i for i in text if not i in en_stop]

    policy_text[policy_id] = count
    texts.append(text)
    ids.append(policy_id)
    count += 1

# Load Googel word2vec pre-trained model
model = gensim.models.KeyedVectors.load_word2vec_format('/Users/zz/Desktop/GoogleNews-vectors-negative300.bin',
                                                        binary=True)

# Constructing a document-term matrix
dictionary = corpora.Dictionary(texts)
corpus = [dictionary.doc2bow(text) for text in texts]
tfidf = models.tfidfmodel.TfidfModel(corpus, id2word=dictionary)

# Find 2/8 point for tfidf values
words_tfidf = []
for bow in corpus:
    words_tfidf += [value for id, value in tfidf[bow]]
words_tfidf.sort()
low_value = words_tfidf[int(round(len(words_tfidf)*2/10))]

# Filter terms with tfidf lower than low_value out
low_value_words_id = set()
for bow in corpus:
    words = [id for id, value in tfidf[bow] if value < low_value]
    low_value_words_id.update(set(words))

low_value_words = [dictionary[i] for i in low_value_words_id]


texts_mtr = []
for text in texts:
    texts_mtr.append([word for word in text if word not in low_value_words])
# Build vector for each text, that's the mean of each word in that text
vector_mtr = []
for text in texts_mtr:
    vector_each = []
    for word in text:
        if word in model:
            vector_each.append(model[word])
    vector_mtr.append(reduce(lambda x, y: x+y, vector_each)/len(vector_each))
vector_pd = pd.DataFrame(vector_mtr)


# Similarity
similarity = cosine_similarity(vector_pd)

cursor.execute("delete from policy_similarity;")
cnx.commit()
# Write similarity to database
for i in range(len(similarity)):
    for j in range(len(similarity)):
        if not i==j:
            query = "insert into policy_similarity values ('%s', '%s', %f, null)" %(ids[i], ids[j], similarity[i][j])
            cursor.execute(query)
cnx.commit()


# Clustering, K-means, do clustering then give the key words of each cluster; return n cluster and key words
def my_kmeans(vector_mtr, n_cluster, top):
    kmeans = KMeans(n_clusters=n_cluster, random_state=0).fit(vector_mtr)

    cluster_dic = defaultdict(list)  # {cluster_id: [text1_idx, text2_idx, ...]}, idx in ids
    cluster_text = defaultdict(str)
    for idx, label in enumerate(kmeans.labels_):
        cluster_dic[label].append(idx)
        cluster_text[label] += ' '.join(texts[idx])
    texts_cluster = []
    for i in range(len(cluster_text)):
        texts_cluster.append(cluster_text[i].split())
    # Get key words in cluster
    dictionary = corpora.Dictionary(texts_cluster)
    corpus = [dictionary.doc2bow(text) for text in texts_cluster]
    tfidf = models.tfidfmodel.TfidfModel(corpus, id2word=dictionary)

    top_words = []
    for i, c in enumerate(corpus):
        tmp_words = tfidf[c]
        tmp_words.sort(key=lambda x: x[1], reverse=True)
        top_words.append([dictionary[idx] for idx, score in tmp_words[:top]])

    return [cluster_dic, top_words]


# First clustering
cluster_dic, top_words = my_kmeans(vector_mtr, 20, 15)

output = "lda_term_1.txt"
with open(output, 'w') as file:
    for idx in cluster_dic:
        # Write key words to file
        file.write(str(idx) + ":" + ','.join(top_words[idx]) + "\n")

        # Write cluster id to database
        for policy in cluster_dic[idx]:
            query = "update policy set policy_lda_1 = %s where policy_id = '%s'" % (idx, ids[policy])
            cursor.execute(query)
    cnx.commit()
    file.close()

cursor.close()
cnx.close()