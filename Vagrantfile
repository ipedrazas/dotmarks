# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "ubuntu-14.04"
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"

  config.vm.hostname = "dotmarks.dev"
  config.vm.network "private_network", ip: "192.168.33.10"

  # config.vm.synced_folder '.', '/vagrant', nfs: true

  config.vm.provider "virtualbox" do |vb|
     vb.customize ["modifyvm", :id, "--memory", "512"]
     vb.customize ["modifyvm", :id, "--cpus", 4]
  end

  config.vm.provision :ansible do |ansible|
    ansible.playbook = "ansible/local-dev.yml"
    ansible.inventory_path = "ansible/vagrant"
    ansible.verbose = true
    ansible.extra_vars = {
      ansible_ssh_user: 'vagrant',
      user: 'vagrant'
    }
    ansible.sudo = true
    ansible.limit = 'all'
  end

end
