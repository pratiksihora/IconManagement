
var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');

function getDate(val) {
    var d = new Date(val);
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var selectdate = Pad("0", dt, 2) + '/' + Pad("0", month, 2) + '/' + year;
    return selectdate;
}

function getTime(val) {
    var d = new Date(val);
    var minite = d.getMinutes();
    var hour = d.getHours();
    var second = d.getSeconds();
    var selectdate = Pad("0", hour, 2) + ':' + Pad("0", minite, 2) + ':' + Pad("0", second, 2);
    return selectdate;
}
function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}


exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        { 'pagename': 'Store', 'href': 'store', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];

    if (req.session) {
        if (req.session.icon_UserName) {
            role = req.session.icon_UserRole;
            var pageData = getPages(role);
            res.render('index', { title: 'Express', username: req.session.icon_FullName, Pages: pageData, userrole: req.session.icon_UserType, lastlogin: " " + getDate(req.session.icon_lastlogin) + " " + getTime(req.session.icon_lastlogin) });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    else {
        res.redirect('/accountlogin');
    }
}

exports.login = function (req, res, next) {
    if (req.session) {
        if (req.session.icon_UserName) {
            res.redirect("/#/plan-list");
        }
        else {
            res.render('account-login', { error: '' });
        }
    }
    else {
        res.render('account-login', { error: '' });
    }
}

exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                req.session = null;
                res.redirect('/accountlogin');
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (error) {
        connection_central.end();
        res.render('account-login', { error: error.message });
    }
}

exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ', [req.body.username, req.body.password], function (err, row, fields) {
                if (err) {
                    res.render('account-login', { error: 'Error in database connection.' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            if (row[0].ld_user_type == "Store Admin") {
                                var session = req.session;
                                session.icon_UserId = row[0].ld_id;
                                session.icon_UserRole = row[0].ld_role;
                                session.icon_UserName = req.body.username;
                                session.Password = req.body.password;
                                session.icon_FullName = row[0].ld_display_name;
                                session.icon_lastlogin = row[0].ld_last_login;
                                session.icon_UserType = row[0].ld_user_type;
                                var query = connection_central.query('update  icn_login_detail set  ld_last_login = ? where ld_id =?', [new Date(), row[0].ld_id], function (err, row, fields) {
                                    if (err) {
                                        res.render('account-login', { error: 'Error in database connection.' });
                                    } else {
                                        connection_central.release();
                                        res.redirect('/');
                                    }
                                });
                            }
                            else {
                                connection_central.release();
                                res.render('account-login', { error: "You can't access this Site." });
                            }
                        }
                        else {
                            connection_central.release();
                            res.render('account-login', { error: 'Your account has been disable.' });
                        }
                    } else {
                        connection_central.release();
                        res.render('account-login', { error: 'Invalid Username / Password.' });
                    }
                }
            });
        })
    }
    catch (error) {
        res.render('account-login', { error: 'Error in database connection.' });
    }
}

function getPages(role) {

    var pagesjson = [
        { 'pagename': 'Add/Edit Store', 'href': 'add-store', 'id': 'store', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Assign Rights', 'href': 'assign-right', 'id': 'assign-right', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Content', 'href': 'manage-content', 'id': 'manage-content', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Manage Country List', 'href': 'manage-country-list', 'id': 'manage-country-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];

    return pagesjson;
}

exports.viewForgotPassword = function (req, res, next) {
    req.session = null;
    res.render('account-forgot', { error: '', msg: '' });
}

exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', [req.body.userid, req.body.emailid], function (err, row, fields) {
                if (err) {
                    res.render('account-forgot', { error: 'Error in database connection.', msg: '' });
                }
                else {
                    if (row.length > 0) {

                        var smtpTransport = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "jetsynthesis@gmail.com",
                                pass: "j3tsynthes1s"
                            }
                        });
                        var mailOptions = {
                            to: row[0].ld_email_id,
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + row[0].ld_user_id + " <br />This is your password: " + row[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                connection_central.release();
                                res.render('account-forgot', { error: '', msg: 'Please check your mail. Password successfully sent to your email' });
                                res.end("sent");
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {
        connection_central.end();
        res.render('account-forgot', { error: 'Error in database connection.' });
    }
}

exports.viewChangePassword = function (req, res, next) {
    req.session = null;
    res.render('account-changepassword', { error: '' });
}

exports.changePassword = function (req, res) {
    try {
        if (req.session) {
            if (req.session.icon_UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_central) {
                    if (req.body.oldpassword == session.Password) {
                        var query = connection_central.query('UPDATE icn_login_detail SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', [req.body.newpassword, new Date(), session.UserId], function (err, result) {
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
                                session.Password = req.body.newpassword;
                                res.send({ success: true, message: 'Password updated successfully.' });
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.send({ success: false, message: 'Old Password does not match.' });
                    }
                })
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
        connection_central.end();
        res.status(500).json(err.message);
    }
};
