import setuptools
from setuptools.command.install import install
import subprocess
from utils import *


print("Cloning Geppetto Jupyter (Python package)...")
subprocess.call(['git', 'clone', '--recursive', '-b', 'geppetto036', 'https://github.com/openworm/org.geppetto.frontend.jupyter.git'], cwd='../')

subprocess.call(['git', 'checkout', 'development-jupyter'], cwd='../org.geppetto.frontend.jupyter/src/jupyter_geppetto/geppetto/')

print("Cloning Geppetto Neuron Configuration ...")
subprocess.call(['git', 'clone', 'https://github.com/MetaCell/geppetto-neuron.git'],
                cwd='../org.geppetto.frontend.jupyter/src/jupyter_geppetto/geppetto/src/main/webapp/extensions/')

subprocess.call(['git', 'checkout', 'geppetto036'], cwd='../org.geppetto.frontend.jupyter/src/jupyter_geppetto/geppetto/src/main/webapp/extensions/geppetto-neuron/')

enable_geppetto_neuron_extension()

subprocess.call(['npm', 'install'], cwd='../org.geppetto.frontend.jupyter/src/jupyter_geppetto/geppetto/src/main/webapp/')
subprocess.call(['npm', 'run', 'build-dev-noTest'], cwd='../org.geppetto.frontend.jupyter/src/jupyter_geppetto/geppetto/src/main/webapp/')

print("Installing jupyter_geppetto python package ...")
subprocess.call(['pip', 'install', '-e', '.'], cwd='../org.geppetto.frontend.jupyter')
print("Installing jupyter_geppettor Extension ...")
subprocess.call(['jupyter', 'nbextension', 'install', '--py', '--symlink', 'jupyter_geppetto'], cwd='../org.geppetto.frontend.jupyter')
subprocess.call(['jupyter', 'nbextension', 'enable', '--py', 'jupyter_geppetto'], cwd='../org.geppetto.frontend.jupyter')

print("Installing neuron_ui python package ...")
subprocess.call(['pip', 'install', '-e', '.'], cwd='../org.geppetto.frontend.jupyter')

