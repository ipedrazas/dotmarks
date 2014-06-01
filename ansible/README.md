

# .dotMarks Ansible provisioning

This ansible playbooks will allow you to deploy dotMarks in a Vagrant box or in a VPS like Digital Ocean.

## Deploying to Digital Ocean

Make sure you have your own private and public key for the user that will run the application.

 1. Generate Public & private keys

         ssh-keygen -t rsa -C "dotmarks@my-dotmarks-domain"
         # If the keys generated are called id_rsa, then
         ssh-add ~/.ssh/id_rsa
         # otherwise, replace id_rsa by the name you chose

 2. Copy Public Key into ansible/roles/bootstrap/files/
 3. Make sure that the public key filename is set properly in the script
        ansible/roles/boostrap/tasks/main.yml
 4.


Once the keys have been generated, it's time to check the connection

    # This instruction allows to connect to your droplet, you will not need to
    # do this if you have tried to connect via ssh using ssh root@DROPLET_IP

    ssh-keyscan DROPLET_IP >> ~/.ssh/known_hosts

    # before deploying the app, we have to create our user and strengthen
    # the security
    # This instructions will ask for the DROPLET_IP root password that
    # you should have received from Digital Ocean's email

    ansible-playbook -i staging bootstrap.yml --user root --ask-pass


This last command will do the following:

* created the remote user
* the remote user’s password set
* uploaded your workstation’s SSH public key to the remote user
* added the remote user toto the sudoers file
* __disallowed root SSH access__
* disallowed SSH password authentication
* disallowed SSH GSS API authentication

Once the user is created, you can provision the server by doing:

    ansible-playbook -i staging site.yml

