
var mysql = require('../config/db').pool;
var async = require("async");
var nodemailer = require('nodemailer');
exports.getassignrights = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    mysql.getConnection('GATEWAY', function (err, connection_billing_gateway) {
                        async.parallel({
                            MasterList: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Store") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, MasterList) {
                                    callback(err, MasterList);
                                });
                            },
                            PaymentTypes: function (callback) {
                                var query = connection_billing_gateway.query('SELECT * FROM billing_enum_data WHERE en_type in ("payment_type")', function (err, PaymentTypes) {
                                    callback(err, PaymentTypes);
                                });
                            },
                            PartnerDistibutionChannels: function (callback) {
                                var query = connection_billing_gateway.query('select * from (SELECT * FROM billing_partner)bp inner join(select * from billing_entity_group)beg on(beg.eg_group_id =bp.partner_store_fronts) inner join(select * from billing_enum_data)enum on(enum.en_id =beg.eg_enum_id)', function (err, PartnerDistibutionChannels) {
                                    callback(err, PartnerDistibutionChannels);
                                });
                            },
                            ContentTypes: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Content Type") )cm on(cm.cm_id = cd.cd_cm_id) inner join (select * from icn_manage_content_type)mc on (  mc.mct_parent_cnt_type_id = cd.cd_id) inner join (SELECT cd_id as contentid,cd_name as contentname FROM catalogue_detail)content on(mc.mct_cnt_type_id = content.contentid)', function (err, ContentTypes) {
                                    callback(err, ContentTypes);
                                });
                            },
                            VendorCountry: function (callback) {
                                var query = connection_ikon_cms.query(' SELECT distinct vd_id,vd_name,r_country_distribution_rights FROM(select * from icn_vendor_detail)vd inner join (SELECT * FROM vendor_profile)vp on(vp.vp_vendor_id = vd.vd_id) inner join (select * from multiselect_metadata_detail)mlm on(vp.vp_r_group_id = mlm.cmd_group_id) inner join(select * from rights)r on(r.r_group_id = mlm.cmd_entity_detail)', function (err, VendorCountry) {
                                    callback(err, VendorCountry);
                                });
                            },

                            Countrys: function (callback) {
                                var query = connection_ikon_cms.query('select distinct cd_id,cd_name from (select CASE  WHEN groupid is null THEN icn_cnt_name ELSE country_name  END AS country_name, CASE  WHEN groupid is null THEN icn_cnt ELSE countryid  END AS country_id,groupid from (SELECT cd_id as icn_cnt,cd_name as icn_cnt_name ,cd_cm_id as icn_cd_cm_id FROM catalogue_detail)cd inner join(select cm_id as icn_cm_id,cm_name as icn_cm_name from catalogue_master where cm_name in("icon_geo_location") )cm on(cm.icn_cm_id = cd.icn_cd_cm_id) left outer join (select cm_id as groupid,cm_name as groupname from catalogue_master )master on(master.groupname = cd.icn_cnt_name) left outer join (select cd_id as countryid,cd_name as country_name,cd_cm_id as m_groupid from catalogue_detail)mastercnt on(master.groupid =mastercnt.m_groupid))country inner join (select cd_id ,cd_name ,cd_cm_id,cm_id,cm_name  from catalogue_detail,catalogue_master where cm_id =cd_cm_id and cm_name in("global_country_list"))g_cd on(g_cd.cd_name =country.country_name)', function (err, Countrys) {
                                    callback(err, Countrys);
                                });
                            },
                            Stores: function (callback) {
                                var query = connection_ikon_cms.query('select * from icn_store', function (err, Stores) {
                                    callback(err, Stores);
                                });
                            },
                            StoreChannels: function (callback) {
                                var query = connection_ikon_cms.query('select * from (select * from icn_store)st inner join (select * from multiselect_metadata_detail ) mmd on (st.st_front_type=mmd.cmd_group_id) inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail) inner join(select * from catalogue_master where cm_name = "Channel Distribution")cm on(cm.cm_id = cd_cm_id and mmd.cmd_entity_type = cm.cm_id)', function (err, StoreChannels) {
                                    callback(err, StoreChannels);
                                });
                            },
                            AssignCountrys: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_country_distribution_rights)', function (err, AssignCountrys) {
                                    callback(err, AssignCountrys);
                                });
                            },
                            AssignPaymentTypes: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_type)', function (err, AssignPaymentTypes) {
                                    callback(err, AssignPaymentTypes);
                                });
                            },
                            AssignPaymentChannels: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_payment_channel)', function (err, AssignPaymentChannels) {
                                    callback(err, AssignPaymentChannels);
                                });
                            },
                            AssignContentTypes: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_content_type)', function (err, AssignContentTypes) {
                                    callback(err, AssignContentTypes);
                                });
                            },
                            AssignVendors: function (callback) {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_store)st inner join  (select * from multiselect_metadata_detail )mlm on (mlm.cmd_group_id = st.st_vendor)', function (err, AssignVendors) {
                                    callback(err, AssignVendors);
                                });
                            },
                            UserRole: function (callback) {
                                callback(null, req.session.icon_UserRole);
                            }
                        }, function (err, results) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                connection_ikon_cms.release();
                                res.send(results);
                            }
                        });
                    });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.updateassignright = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var country_group_id = req.body.country_group_id;
                    var payment_type_group_id = req.body.payment_type_group_id;
                    var payment_channel_group_id = req.body.payment_channel_group_id;
                    var vendor_group_id = req.body.vendor_group_id;
                    var content_type_group_id = req.body.content_type_group_id;
                    if (req.body.DeleteAssignRights.length > 0) {
                        DeleteAssignFromStore();
                    }
                    else {
                        EditStore();
                    }

                    function GetGroupId(type) {
                        var groupid = null;
                        switch (type) {
                            case "country": groupid = country_group_id; break;
                            case "paymenttype": groupid = payment_type_group_id; break;
                            case "paymentchannel": groupid = payment_channel_group_id; break;
                            case "vendor": groupid = vendor_group_id; break;
                            case "contenttype": groupid = content_type_group_id; break;
                        }
                        return groupid;
                    }

                    function SetGroupId(type, groupid) {
                        switch (type) {
                            case "country": country_group_id = groupid; break;
                            case "paymenttype": payment_type_group_id = groupid; break;
                            case "paymentchannel": payment_channel_group_id = groupid; break;
                            case "vendor": vendor_group_id = groupid; break;
                            case "contenttype": content_type_group_id = groupid; break;
                        }
                    }

                    function EditStore() {
                        var storelength = req.body.AddAssignRights.length;
                        if (req.body.AddAssignRights.length > 0) {
                            loop(0);
                            function loop(cnt) {
                                var i = cnt;
                                var groupid = GetGroupId(req.body.AddAssignRights[i].Type)
                                if (groupid != null) {
                                    var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                        if (err) {
                                            connection_ikon_cms.release(); ;
                                            res.status(500).json(err.message);
                                        } else {
                                            var metadata = {
                                                cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                cmd_group_id: groupid,
                                                cmd_entity_type: req.body.store_content_type,
                                                cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail
                                            }
                                            var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        var query = connection_ikon_cms.query('UPDATE icn_store SET st_country_distribution_rights =?,st_payment_type=?,st_payment_channel=?,st_vendor=?,st_content_type=?, st_modified_on=?,st_modified_by=? WHERE st_id = ?', [country_group_id, payment_type_group_id, payment_channel_group_id, vendor_group_id, content_type_group_id, new Date(), req.session.icon_UserName, req.body.storeId], function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            } else {
                                                                connection_ikon_cms.release();
                                                                res.send({
                                                                    success: true,
                                                                    message: 'Store Updated successfully.'
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        loop(cnt);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    var query = connection_ikon_cms.query('select max(cmd_group_id) as id from multiselect_metadata_detail', function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                            SetGroupId(req.body.AddAssignRights[i].Type, Groupid);

                                            var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                                if (err) {
                                                    connection_ikon_cms.release(); ;
                                                    res.status(500).json(err.message);
                                                } else {
                                                    var metadata = {
                                                        cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                        cmd_group_id: Groupid,
                                                        cmd_entity_type: req.body.store_content_type,
                                                        cmd_entity_detail: req.body.AddAssignRights[i].cmd_entity_detail
                                                    }
                                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }
                                                        else {
                                                            cnt = cnt + 1;
                                                            if (cnt == storelength) {
                                                                var query = connection_ikon_cms.query('UPDATE icn_store SET st_country_distribution_rights =?,st_payment_type=?,st_payment_channel=?,st_vendor=?,st_content_type=?, st_modified_on=?,st_modified_by=? WHERE st_id = ?', [country_group_id, payment_type_group_id, payment_channel_group_id, vendor_group_id, content_type_group_id, new Date(), req.session.icon_UserName, req.body.storeId], function (err, result) {
                                                                    if (err) {
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    } else {

                                                                        var smtpTransport = nodemailer.createTransport({
                                                                            service: "Gmail",
                                                                            auth: {
                                                                                user: "jetsynthesis@gmail.com",
                                                                                pass: "j3tsynthes1s"
                                                                            }
                                                                        });
                                                                        var Message = "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                                                        Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;\">Store Admin created a new account at Jetsynthesys.";
                                                                        Message += " </td></tr>";
                                                                        Message += " <h5>Site Rights Updated.</h5>";
                                                                        Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                        Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href=\"http://localhost:3000\" target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Jetsynthesys. If you have not made any request then you may ignore this email";
                                                                        Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Please contact us, if you have any concerns setting up Jetsynthesys.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Jetsynthesys Team</td></tr></tbody></table>";
                                                                        var mailOptions = {
                                                                            to: req.body.store_email,
                                                                            subject: 'Store Rights Assigned.',
                                                                            html: Message
                                                                        }
                                                                        smtpTransport.sendMail(mailOptions, function (error, response) {
                                                                            if (error) {
                                                                                console.log(error);
                                                                                res.end("error");
                                                                            } else {
                                                                                connection_ikon_cms.release();
                                                                                res.send({
                                                                                    success: true,
                                                                                    message: 'Store Updated successfully.'
                                                                                });
                                                                            }
                                                                        });


                                                                    }
                                                                });
                                                            } else {
                                                                loop(cnt);
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        else {
                            var query = connection_ikon_cms.query('UPDATE icn_store SET st_modified_on=?,st_modified_by=? WHERE st_id = ?', [new Date(), req.session.icon_UserName, req.body.storeId], function (err, result) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        success: true,
                                        message: 'Store Updated successfully.'
                                    });
                                }
                            });
                        }
                    }

                    function DeleteAssignFromStore() {
                        var deletelength = req.body.DeleteAssignRights.length;
                        var count = 0;
                        deleteloop(count);
                        function deleteloop(count) {
                            var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.DeleteAssignRights[count].cmd_group_id, req.body.DeleteAssignRights[count].cmd_entity_detail], function (err, row, fields) {
                                if (err) {
                                    connection_ikon_cms.release(); ;
                                    res.status(500).json(err.message);
                                }
                                else {
                                    count++;
                                    if (count == deletelength) {
                                        EditStore();
                                    }
                                    else {
                                        deleteloop(count);
                                    }
                                }
                            });
                        };
                    }

                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}