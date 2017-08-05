import subprocess
from ..services.helper import rel_path
from ..models import STATES, get_state_index


class Netinf(object):
    _MODEL_EXP = 0
    _MODEL_POW = 1
    _MODEL_RAY = 2
    _ITER = 5
    _ALPHA = 1.0

    def __init__(self, iters=_ITER, model=_MODEL_EXP, alpha=_ALPHA):
        self.iters = iters
        self.model = model
        self.alpha = alpha
        self.node_def = self.get_node_def()

    def get_node_def(self):
        return reduce(lambda x, y: "{}{},{}\n".format(x, get_state_index(y), y), STATES, "")

    def get_network_text(self, cascades, iters=_ITER, model=_MODEL_EXP, alpha=_ALPHA):
        netinf_exe = rel_path("../libs/netinf/netinf")
        arg_iters = "-e:" + str(iters)
        arg_model = "-m:" + str(model)
        arg_alpha = "-a:" + str(alpha)
        arg_silent = "-silent"
        args = [netinf_exe, arg_iters, arg_model, arg_alpha, arg_silent]
        return subprocess.check_output(args, stdin=cascades)

