/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('mysql');
var config = require('../config')();

var poolCluster = mysql.createPoolCluster();
// add configurations
poolCluster.add('PLAN',{
    host: config.db_host_ikon_plan,
    user: config.db_user_ikon_plan,
    password: config.db_pass_ikon_plan,
    database: config.db_name_ikon_plan
});
poolCluster.add('CMS', {
    host: config.db_host_ikon_cms,
    user: config.db_user_ikon_cms,
    password: config.db_pass_ikon_cms,
    database: config.db_name_ikon_cms
});
poolCluster.add('GATEWAY', {
    host: config.db_host_billing_gateway,
    user: config.db_user_billing_gateway,
    password: config.db_pass_billing_gateway,
    database: config.db_name_billing_gateway
});

exports.pool = poolCluster;