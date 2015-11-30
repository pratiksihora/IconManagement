
var mysql = require('../config/db').pool;
var async = require("async");

exports.getcountrydata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    async.parallel({
                        CountryList: function (callback) {
                            var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)  order by cd.cd_name', function (err, CountryList) {
                                callback(err, CountryList);
                            });
                        },
                        CountryGroups: function (callback) {
                            var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id)', function (err, CountryGroups) {
                                callback(err, CountryGroups);
                            });
                        },
                        MasterCountryList: function (callback) {
                            var query = connection_ikon_cms.query('select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location")', function (err, MasterCountryList) {
                                callback(err, MasterCountryList);
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

exports.submitcountry = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {

                    if (req.body.status == "NewGroup") {
                        var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail  where lower(cd_name) =?)cd inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id)', [req.body.group_name.toLowerCase()], function (err, row) {
                            if (err) {
                                connection_ikon_cms.release(); ;
                                res.status(500).json(err.message);
                            } else {
                                if (row.length > 0) {
                                    res.send({
                                        success: false,
                                        message: 'Group Name must be Unique.',
                                        CountryGroups: [],
                                        CountryList: [],
                                        RoleUser: req.session.icon_UserRole
                                    });
                                }
                                else {
                                    ChangedCountry();
                                }
                            }
                        });
                    }
                    else {
                        ChangedCountry();
                    }

                    function ChangedCountry() {
                        var storelength = req.body.ChangedCountry.length;
                        if (req.body.ChangedCountry.length > 0) {
                            changeloop(0);
                            function changeloop(cnt) {
                                var i = cnt;
                                var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                                    if (err) {
                                        connection_ikon_cms.release(); ;
                                        res.status(500).json(err.message);
                                    } else {
                                        var icon_country = {
                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                            cd_cm_id: req.body.icon_content_type,
                                            cd_name: req.body.ChangedCountry[i].cd_name,
                                            cd_display_name: req.body.ChangedCountry[i].cd_name,
                                            cd_desc: null,
                                            cd_desc1: null
                                        }
                                        var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', icon_country, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                cnt = cnt + 1;
                                                if (cnt == storelength) {
                                                    AddUpdateGroupCountry();
                                                } else {
                                                    changeloop(cnt);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            AddUpdateGroupCountry();
                        }
                    }
                    function AddUpdateGroupCountry() {
                        if (req.body.status == "NewGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                                    if (err) {
                                        connection_ikon_cms.release(); ;
                                        res.status(500).json(err.message);
                                    } else {
                                        var icon_country = {
                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                            cd_cm_id: req.body.content_group,
                                            cd_name: req.body.group_name,
                                            cd_display_name: req.body.group_name,
                                            cd_desc: null,
                                            cd_desc1: null
                                        }
                                        var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', icon_country, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_ikon_cms.query('select max(cm_id) as id from catalogue_master', function (err, result) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    } else {
                                                        Groupid = result[0].id != null ? (parseInt(result[0].id) + 1) : 1
                                                        var country_master_group = {
                                                            cm_id: Groupid,
                                                            cm_name: req.body.group_name
                                                        }
                                                        var query = connection_ikon_cms.query('INSERT INTO catalogue_master SET ?', country_master_group, function (err, result) {
                                                            if (err) {
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                                                                    if (err) {
                                                                        connection_ikon_cms.release(); ;
                                                                        res.status(500).json(err.message);
                                                                    } else {
                                                                        var icon_country = {
                                                                            cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                            cd_cm_id: req.body.icon_content_type,
                                                                            cd_name: req.body.group_name,
                                                                            cd_display_name: req.body.group_name,
                                                                            cd_desc: null,
                                                                            cd_desc1: null
                                                                        }
                                                                        var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', icon_country, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                addloop(0);
                                                                                function addloop(cnt) {
                                                                                    var i = cnt;
                                                                                    var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                                                                                        if (err) {
                                                                                            connection_ikon_cms.release(); ;
                                                                                            res.status(500).json(err.message);
                                                                                        } else {
                                                                                            var icon_country = {
                                                                                                cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                                                                cd_cm_id: Groupid,
                                                                                                cd_name: req.body.AddCountryForGroup[i].cd_name,
                                                                                                cd_display_name: req.body.AddCountryForGroup[i].cd_name,
                                                                                                cd_desc: null,
                                                                                                cd_desc1: null
                                                                                            }
                                                                                            var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', icon_country, function (err, result) {
                                                                                                if (err) {
                                                                                                    connection_ikon_cms.release();
                                                                                                    res.status(500).json(err.message);
                                                                                                }
                                                                                                else {
                                                                                                    cnt = cnt + 1;
                                                                                                    if (cnt == storelength) {
                                                                                                        GetAllReturnData();
                                                                                                    } else {
                                                                                                        addloop(cnt);
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
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
                            else {
                                GetAllReturnData();
                            }
                        }
                        else if (req.body.status == "UpdateGroup") {
                            var storelength = req.body.AddCountryForGroup.length;
                            if (req.body.AddCountryForGroup.length > 0) {
                                updateloop(0);
                                function updateloop(cnt) {
                                    var i = cnt;
                                    var query = connection_ikon_cms.query('select max(cd_id) as id from catalogue_detail', function (err, row) {
                                        if (err) {
                                            connection_ikon_cms.release(); ;
                                            res.status(500).json(err.message);
                                        } else {
                                            var icon_country = {
                                                cd_id: row[0].id != null ? (parseInt(row[0].id) + 1) : 1,
                                                cd_cm_id: req.body.group_id,
                                                cd_name: req.body.AddCountryForGroup[i].cd_name,
                                                cd_display_name: req.body.AddCountryForGroup[i].cd_name,
                                                cd_desc: null,
                                                cd_desc1: null
                                            }
                                            var query = connection_ikon_cms.query('INSERT INTO catalogue_detail SET ?', icon_country, function (err, result) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    cnt = cnt + 1;
                                                    if (cnt == storelength) {
                                                        DeleteGroupCountry();
                                                    } else {
                                                        updateloop(cnt);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                DeleteGroupCountry();
                            }
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function DeleteGroupCountry() {
                        var storelength = req.body.DeleteCountryForGroup.length;
                        if (storelength > 0) {
                            var count = 0;
                            deleteloop(count);
                            function deleteloop(i) {
                                var query = connection_ikon_cms.query('DELETE FROM catalogue_detail WHERE cd_id= ? and  cd_cm_id =?', [req.body.DeleteCountryForGroup[i].cd_id, req.body.group_id], function (err, row, fields) {
                                    if (err) {
                                        connection_ikon_cms.release(); ;
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        count++;
                                        if (count == storelength) {
                                            GetAllReturnData();
                                        }
                                        else {
                                            deleteloop(count);
                                        }
                                    }
                                });
                            };
                        }
                        else {
                            GetAllReturnData();
                        }
                    }
                    function GetAllReturnData() {
                        var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location") )cm on(cm.cm_id = cd.cd_cm_id)', function (err, Countrys) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var query = connection_ikon_cms.query('select * from (SELECT * FROM catalogue_detail)cd inner join(select * from catalogue_master where cm_name in("country_group") )cm on(cm.cm_id = cd.cd_cm_id) inner join(select * from catalogue_master  )cm_group on(cm_group.cm_name = cd.cd_name) inner join(select * from catalogue_detail )cd_group on(cd_group.cd_cm_id = cm_group.cm_id)', function (err, CountryGroups) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_cms.query('select * from catalogue_master where cm_name in("global_country_list","country_group","icon_geo_location")', function (err, MasterCountryList) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({
                                                    success: true,
                                                    message: 'Country Data updated successfully.',
                                                    MasterCountryList: MasterCountryList,
                                                    CountryGroups: CountryGroups,
                                                    CountryList: Countrys,
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