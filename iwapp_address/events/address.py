import frappe
import requests
import json

def after_insert(doc, method):
   if doc.custom_caits_pincode_details:
    pincode=frappe.get_doc({
    'doctype': 'Caits Pincode',
    'country': doc.country,
    'pincode':doc.pincode
    })
    for i in doc.custom_caits_pincode_details:
        pincode.append('pincode_details',
    {
        "post_office": i.post_office,
        "taluk":i.taluk,
        "division":i.division,
        "district":i.district,
        "state":i.state
    })
    pincode.insert()
    pincode.save()
    doc.reload()


@frappe.whitelist()
def pincode(pin):
    if pin and len(pin)==6:
        api=f'https://api.postalpincode.in/pincode/{pin}'
        response = requests.get(api)
        if response:
            pincode = response.text
            pincode_list = json.loads(pincode)
            for i in pincode_list:
                return i.get('PostOffice')