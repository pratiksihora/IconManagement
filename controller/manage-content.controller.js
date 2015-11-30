var mysql = require('../config/db').pool;
var async = require("async");

exports.getmanagecontentdata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                        ContentMasterList: function (callback) {
                            var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("Content Type","Delivery Type") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, ContentMasterList) {
                                callback(err, ContentMasterList);
                            });
                        },
                        ContentList: function (callback) {
                            var storequery = req.body.state == "edit-content" ? "where mct_id = " + req.body.Id : "";
                            var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_manage_content_type ' + storequery + ')cnt inner join (select cd_id as parentid,cd_name as parentname from catalogue_detail)parent on(parent.parentid  = cnt.mct_parent_cnt_type_id) inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id)', function (err, ContentList) {
                                callback(err, ContentList);
                            });
                        },
                        ContentRights: function (callback) {
                            if (req.body.state == "edit-content") {
                                var query = connection_ikon_cms.query('select * from (select * from icn_manage_content_type where mct_id = ? )cnt inner join (select * from multiselect_metadata_detail ) mmd on (cnt.mct_delivery_type_id=mmd.cmd_group_id) inner join(select * from catalogue_detail )cd on (cd.cd_id =mmd.cmd_entity_detail)', [req.body.Id], function (err, ContentRights) {
                                    callback(err, ContentRights);
                                });
                            }
                            else {
                                callback(null, []);
                            }
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
            } else {
                res.redirect('/accountlogin');
            }
        } else {
            res.redirect('/accountlogin');
        }
    } catch (error) {
        connection_ikon_cms.release();
        res.status(500).json(error.message);
    }
}

exports.addeditcontenttype = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_manage_content_type where  mct_parent_cnt_type_id = ?)cnt inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id and cd.contentname =?)', [req.body.parent_content_type, req.body.content_name], function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            if (result.length > 0) {
                                if (req.body.state == "edit-content" && result[0].contentid == req.body.content_id) {
                                    if (req.body.DeleteDeliveryType.length > 0) {
                                        DeleteDeliveryType();
                                    }
                                    else {
                                        EditDeliveryType();
                                    }
                                }
                                else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        success: false,
                                        message: "Content Type must be Unique.",
                                        ContentList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }
                            }
                            else {
                                if (req.body.state == "edit-content") {
                                    if (req.body.DeleteDeliveryType.length > 0) {
                                        DeleteDeliveryType();
                                    }
                                    else {
                                        EditDeliveryType();
                                    }
                                }
                                else {
                                    AddDeliveryType();
                                }
                            }
                        }
                    });

                    function EditDeliveryType() {
                        var query = connection_ikon_cms.query('UPDATE catalogue_detail SET cd_name=?,cd_display_name=? WHERE cd_id = ?', [req.body.content_name, req.body.content_name, req.body.content_id], function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            } else {
                                var storelength = req.body.AddDeliveryType.length;
                                if (req.body.AddDeliveryType.length > 0) {
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var metadata = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: req.body.content_delivery_type,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', metadata, function (err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            connection_ikon_cms.release();
                                                            res.send({
                                                                success: true,
                                                                message: "Content Type updated successfully.",
                                                                ContentList: [],
                                                                RoleUser: req.session.icon_UserRole
                                                            });
                                                        } else {
                                                            loop(cnt);
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                                else {
                                    connection_ikon_cms.release();
                                    res.send({
                                        success: true,
                                        message: "Content Type updated successfully.",
                                        ContentList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }

                            }
                        });
                    }

                    function DeleteDeliveryType() {
                        var storelength = req.body.DeleteDeliveryType.length;
                        var count = 0;
                        deleteloop(count);
                        function deleteloop(count) {
                            var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id= ? and  cmd_entity_detail =?', [req.body.content_delivery_type, req.body.DeleteDeliveryType[count]], function (err, row, fields) {
                                if (err) {
                                    connection_ikon_cms.release(); ;
                                    res.status(500).json(err.message);
                                }
                                else {
                                    count++;
                                    if (count == storelength) {
                                        EditDeliveryType();
                                    }
                                    else {
                                        deleteloop(count);
                                    }
                                }
                            });
                        };
                    }

                    function AddDeliveryType() {
                        var Groupid = 0;
                        var storelength = req.body.AddDeliveryType.length;
                        if (req.body.AddDeliveryType.length > 0) {
                            var query = connection_ikon_cms.query('select max(cmd_group_id) as id from multiselect_metadata_detail', function (err, result) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                    loop(0);
                                    function loop(cnt) {
                                        var i = cnt;
                                        var query = connection_ikon_cms.query('select max(cmd_id) as id from multiselect_metadata_detail', function (err, row) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var deliverytype = {
                                                    cmd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                    cmd_group_id: Groupid,
                                                    cmd_entity_type: req.body.parent_content_type,
                                                    cmd_entity_detail: req.body.AddDeliveryType[i]
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', deliverytype, function (err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        cnt = cnt + 1;
                                                        if (cnt == storelength) {
                                                            AddContent(Groupid);
                                                        } else {
                                                            loop(cnt);
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }

                                }
                            });
                        }
                        else {
                            AddContent(null);
                        }
                    }

                    function AddContent(Groupid) {
                        var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                            if (err) {
                                connection_ikon_cms.release(); ;
                                res.status(500).json(err.message);
                            } else {
                                var cd_id = row[0].id != null ? (parseInt(row[0].id) + 1) : 1;
                                var contenttype = {
                                    cd_id: cd_id,
                                    cd_cm_id: null,
                                    cd_name: req.body.content_name,
                                    cd_display_name: req.body.content_name,
                                    cd_desc: null,
                                    cd_desc1: null
                                }
                                var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', contenttype, function (err, result) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_cms.query('select max(mct_id) as id from icn_manage_content_type', function (err, row) {
                                            if (err) {
                                                connection_ikon_cms.release(); ;
                                                res.status(500).json(err.message);
                                            } else {
                                                var mct_id = row[0].id != null ? (parseInt(row[0].id) + 1) : 1;
                                                var managecontent = {
                                                    mct_id: mct_id,
                                                    mct_parent_cnt_type_id: req.body.parent_content_type,
                                                    mct_cnt_type_id: cd_id,
                                                    mct_delivery_type_id: Groupid
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO icn_manage_content_type SET ?', managecontent, function (err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        var query = connection_ikon_cms.query('select * from (SELECT * FROM icn_manage_content_type where mct_id = ?)cnt inner join (select cd_id as parentid,cd_name as parentname from catalogue_detail)parent on(parent.parentid  = cnt.mct_parent_cnt_type_id) inner join (select cd_id as contentid,cd_name as contentname from catalogue_detail)cd on(cd.contentid  = cnt.mct_cnt_type_id)', [mct_id], function (err, ContentList) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                connection_ikon_cms.release();
                                                                res.send({
                                                                    success: true,
                                                                    message: "Content Type added successfully.",
                                                                    ContentList: ContentList,
                                                                    RoleUser: req.session.icon_UserRole
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

