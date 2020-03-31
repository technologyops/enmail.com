<? php 
import smtplib
import cgi
import os
from datetime import datetime
import string
import urlparse

def debug(message):
    print "Content-type: text/html"
    print """
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html PUBLIC
        "-//W3C/DTD XHTML 1.0 Strict//EN"
        "DTD/xhtml11-strict.dtd">
    <html>
    <head>Form Submission</head>
    <body>
    <pre>
    %s
    </pre>
    </body>
    </html>""" % message

def process_form():
    req_fields = {"from":None, "to":None, "subject":None, "nextpage":None}
    valid_urls = ["mycompany.org", "www.mycompany.org"]
    url = urlparse.urlparse(os.environ["HTTP_REFERER"])
    if url[1] not in valid_urls:
        debug("The site calling this script is not autnorized to send e-mail.")
        return
    form = cgi.FieldStorage()
    """
    Add extra data to the submission:
    """
    field_list = "\ndate: %s\n" % datetime.now().strftime("%A, %B %d, %Y")
    """
    Iterate through submitted form and check for required fields
    """
    for field in form.keys():
        value = form[field].value
        if req_fields.has_key(field):
            req_fields[field] = value
        else:
            field_list = field_list + "%s: %s\n" % (field, value)
    for key in req_fields:
        if req_fields[key] == None:
            debug("A required field is missing: %s" % key)
            return
    """
    Add the From: and To: headers at the start
    """
    msg = ("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n" %
        (req_fields["from"], req_fields["to"], req_fields["subject"]))
    msg = msg + field_list
    server = smtplib.SMTP("localhost")
    server.sendmail(req_fields["from"], req_fields["to"], msg)
    server.quit()
    """
    Output redirection instead of xhtml
    """
    print "Location: %s" % req_fields["nextpage"]
    print

if __name__ == "__main__":
    process_form()
	?>