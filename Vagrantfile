# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  config.vm.box = "ubuntu-13.10"

#  config.vm.network :forwarded_port, guest: 80, host: 8080
#  config.vm.network :forwarded_port, guest: 8000, host: 8000
#  config.vm.network :forwarded_port, guest: 5000, host: 5000

  config.vm.hostname = "dotmarks.dev"
  config.vm.network :private_network, ip: "192.168.33.10"

  config.vm.provision :ansible do |ansible|
    ansible.playbook = "ansible/all.yml"
    ansible.inventory_path = "ansible/vagrant"
    ansible.verbose = true
  end

end
