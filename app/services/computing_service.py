from .base_service import BaseService
from ..plugins import netinf
from .helper import rel_path


class ComputingService(BaseService):
    """computing service provides computing functionalities"""

    def __init__(self):
        pass

    def get_network(self):
        sp_netinf = netinf.Netinf()
        with open(rel_path("../libs/netinf/example-cascades.txt"), 'r') as f:
            print sp_netinf.get_network_text(f,10)
