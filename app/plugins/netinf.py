import subprocess
from subprocess import Popen, PIPE
from ..services.helper import rel_path
from ..models import STATES, get_state_index


class Netinf(object):
    MODEL_EXP = 0
    MODEL_POW = 1
    MODEL_RAY = 2
    ITER = 25
    ALPHA = 1.0

    def __init__(self, iters=ITER, model=MODEL_EXP, alpha=ALPHA):
        self.iters = iters
        self.model = model
        self.alpha = alpha
        self.node_def = self.get_node_def()

    def get_node_def(self):
        return reduce(lambda x, y: "{}{},{}\n".format(x, get_state_index(y), y), STATES, "")

    def get_network_text(self, cascades, iters=ITER, model=MODEL_EXP, alpha=ALPHA):
        netinf_exe = rel_path("../libs/netinf/netinf")
        arg_iters = "-e:" + str(iters)
        arg_model = "-m:" + str(model)
        arg_alpha = "-a:" + str(alpha)
        arg_silent = "-silent"
        args = [netinf_exe, arg_iters, arg_model, arg_alpha, arg_silent]
        p = Popen(args, stdout=PIPE, stdin=PIPE, stderr=PIPE)
        out, err = p.communicate(input=(self.get_node_def() + cascades).encode())
        return out.rstrip("\n")

