frappe.ui.form.on("Address", {
    pincode: function (frm) {
        frm.clear_table("custom_iwapp_pincode_details")
        frm.refresh_fields("custom_iwapp_pincode_details");
        if (frm.doc.country == "India" && frm.doc.pincode) {
            frappe.db.exists('Iwapp Pincode', frm.doc.pincode)
                .then(exists => {
                    if (exists) {
                        frappe.db.get_doc('Iwapp Pincode', frm.doc.pincode)
                            .then(doc => {
                                if (doc.pincode_details) {
                                    $.each(doc.pincode_details, function (i, pin) {
                                        frm.set_value({ "state": pin.state, "custom_taluk": pin.taluk, "county": pin.district })
                                    })
                                    let d = new frappe.ui.Dialog({
                                        title: 'Select Your Post Office',
                                        fields: [
                                            {
                                                label: 'Post Office',
                                                fieldname: 'post',
                                                fieldtype: 'Select',
                                                options: doc.pincode_details.map(pin => pin.post_office)
                                            }
                                        ],
                                        size: 'small', // small, large, extra-large
                                        primary_action_label: 'Save',
                                        primary_action(values) {
                                            frm.set_value("custom_post_office", values.post)

                                            d.hide();
                                        }
                                    });
                                    d.show();
                                }
                                else {
                                    frm.set_value({ "state": "", "custom_taluk": "", "county": "", "custom_post_office": ""})
                                }
                            })
                    }
                    else {
                        frappe.call({
                            method: 'iwapp_address.events.address.pincode',
                            args: {
                                pin: frm.doc.pincode
                            },
                            callback: function (r) {
                                if (r.message) {
                                    frm.clear_table("custom_iwapp_pincode_details")
                                    $.each(r.message, function (i, pin) {
                                        console.log(pin.Name)
                                        frm.set_value({ "state": pin.State, "custom_taluk": pin.Block, "county": pin.District })
                                        var child = cur_frm.add_child("custom_iwapp_pincode_details");
                                        child.post_office = pin.Name
                                        child.taluk = pin.Block
                                        child.division = pin.Division
                                        child.district = pin.District
                                        child.state = pin.State
                                        frm.refresh_fields("custom_iwapp_pincode_details");
                                    })
                                    let d = new frappe.ui.Dialog({
                                        title: 'Select Your Post Office',
                                        fields: [
                                            {
                                                label: 'Post Office',
                                                fieldname: 'post',
                                                fieldtype: 'Select',
                                                options: r.message.map(pin => pin.Name)
                                                // here pin is iterating on each pin.Name(.map() looping post ofice)                                         }

                                            }
                                        ],
                                        size: 'small', // small, large, extra-large
                                        primary_action_label: 'Save',
                                        primary_action(values) {
                                            frm.set_value("custom_post_office", values.post)

                                            d.hide();
                                        }
                                    });
                                    d.show();
                                }
                                else {
                                    frm.set_value({ "state": "", "custom_taluk": "", "county": "", "custom_post_office": ""})
                                }
                            }
                        })
                    }
                })
        }
    },
})