from os.path import join, abspath, dirname
import os
import sendgrid
from celery.utils.log import get_task_logger


logger = get_task_logger(__name__)


def read_file(filename):
    path = abspath(join(dirname(__file__), '.')) + filename
    print path
    f = open(path, 'r')
    return f.read()


def send_invitation_mail(mail):
    sendgrid_user = os.getenv("SENDGRID_USER")
    sendgrid_password = os.getenv("SENDGRID_PASSWORD")

    if sendgrid_user and sendgrid_password:
        sg = sendgrid.SendGridClient(sendgrid_user, sendgrid_password)
        message = sendgrid.Mail()
        message.add_to(mail['to_address'])
        message.set_subject(mail['subject'])
        message.set_html(mail['html_body'])
        message.set_text('Body')
        message.set_from(mail['from'])
        status, msg = sg.send(message)
        logger.info('Mail sent to ' + mail['to_address'])
    else:
        logger.error('SendGridClient credentials not valid: ' +
                     sendgrid_user + " " + sendgrid_password)


def create_reset_mail_object(email, hashlink):
    subject = 'Reset Password Request'
    mail = read_file('/mail_templates/reset_password_mail.html')
    html_mail = mail.decode('utf-8') % (hashlink)
    txt_mail = 'All '
    mail = {'from': "info@dotmarks.net",
            'from_name': '.dotMarks',
            'subject': subject,
            'txt_body': txt_mail,
            'html_body': html_mail,
            'to_address': email,
            'to_name': email
            }
    send_invitation_mail(mail)
