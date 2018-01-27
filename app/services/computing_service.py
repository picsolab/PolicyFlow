from .base_service import BaseService
from ..plugins.netinf import Netinf
from .helper import rel_path
from ..models import NetinfNetwork


class ComputingService(BaseService):
    """computing service provides computing functionalities"""

    def __init__(self):
        pass

    @staticmethod
    def get_network_by(cascade_text, iters=Netinf.ITER):
        sp_netinf = Netinf()
        network_text = sp_netinf.get_network_text(cascade_text, iters=iters)
        nn = NetinfNetwork(network_text=network_text)
        return nn.get_network_object()

