

# .dotMarks Ansible provisioning

This ansible playbooks will allow you to deploy dotMarks in a Vagrant box or in a VPS like Digital Ocean.

## Deploying to Digital Ocean

    # This instruction allows to connect to your droplet, you will not need to
    # do this if you have tried to connect via ssh using ssh root@DROPLET_IP
    ssh-keyscan DROPLET_IP >> ~/.ssh/known_hosts

    # before deploying the app, we have to create our user and strengthen
    # the security
    ansible-playbook -i staging playbooks/bootstrap.yml --user root --ask-pass

This last command will do the following:

* created the remote user
* the remote user’s password set
* uploaded your workstation’s SSH public key to the remote user
* added the remote user toto the sudoers file
* __disallowed root SSH access__
* disallowed SSH password authentication
* disallowed SSH GSS API authentication

