// ==UserScript==
// @name         Ops Injection
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://sunnkingdevops.azurewebsites.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=azurewebsites.net
// @grant        none
// ==/UserScript==

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode. Importing a new jq breaks ops' version and prevents some devexpress functions from firing.
var debug = false;

$(document).ready(function(){
    embedFunction(AssetClone);
    embedFunction(LayoutSearch);
    embedFunction(CopyQty);
});
function LayoutSearch(){
    console.log("[INJECTION - LayoutSearch] Running overriden function");
    var searchBox = $("#layout_search");
    var input = searchBox.val();
    if (input != "") {
        $.ajax({
            url: '/Home/GetInputPage',
            data: { inputVal: input },
            type: "POST",
            success: function (response) {
                if (response) {
                    if (response == "Client") {

                    }else {
                        window.location.href = "" + response;
                    }
                }
            },
            error: function(response){
                window.alert("And error was returned for the injected LayoutSearch function. Disable the tampermonkey script and try again. If errors persist, contact an admin");
            },
            complete: function(){
                setTimeout(function(){
                    $("#layout_search").css("background-color","pink");
                },2000);
                console.log("[INJECTION - LayoutSearch] Finished");
            }
        });
    }
}
function AssetClone() {
    var assetID = document.getElementById('Process_AssetID').value;
    $("#ProcessClone_btn").addClass("jd-loading");
    $.ajax({
        url: '/View/CloneAsset',
        data: { assetID: assetID },
        type: "POST",
        success: function (response) {
            if (response) {
                $("#ProcessClone_btn").removeClass("jd-loading");
                document.getElementById('ClonedText').innerHTML = "Cloned AssetID: <a style='color: blue;' href='" + document.location.origin + "/Inventory/Process/" + response + "'>" + response + "</a>";
                document.getElementById('ClonedText').style.display = "block";
            }
        }
    });
}
function CopyQty() {
    var asset = $('#tools_asset').val();
    var qty = $('#tools_qty').val();
    $("#Tools_duplication").addClass("jd-copytool-loading");
    $("#Tools_duplication").removeClass("jd-copytool-success");
    $("#Tools_duplication").removeClass("jd-copytool-failure");
    $.ajax({
        url: '/Tools/CopyQty',
        data: { assetID: asset, qty: qty },
        type: "POST",
        success: function (response) {
            $("#Tools_duplication").removeClass("jd-copytool-loading");
            if (response) {
                //alert("Added");
                $("#Tools_duplication").addClass("jd-copytool-success");
            }
            else {
                $("#Tools_duplication").addClass("jd-copytool-failure");
            }
        }
    });
}

function embedFunction(s) {
    document.body.appendChild(document.createElement('script'))
        .innerHTML=s.toString().replace(/([\s\S]*?return;){2}([\s\S]*)}/,'$2');
}

// These functions are the original form taken from ops, I'm keeping them here for reference and to diff check if it breaks.
function LayoutSearch_old() {
    var input = document.getElementById('layout_search').value;
    if (input != "") {
        $.ajax({
            url: '/Home/GetInputPage',
            data: { inputVal: input },
            type: "POST",
            success: function (response) {
                if (response) {
                    if (response == "Client") {

                    }
                    else {
                        window.location.href = "" + response;
                    }
                }
            }
        });
    }
}
function AssetClone_old() {
    var assetID = document.getElementById('Process_AssetID').value;
    $("#ProcessClone_btn").addClass("jd-loading");
    $.ajax({
        url: '/View/CloneAsset',
        data: { assetID: assetID },
        type: "POST",
        success: function (response) {
            if (response) {
                $("#ProcessClone_btn").removeClass("jd-loading");
                document.getElementById('ClonedText').innerHTML = "Cloned AssetID: <a style='color: blue;' href='" + document.location.origin + "/Inventory/Process/" + response + "'>" + response + "</a>";
                document.getElementById('ClonedText').style.display = "block";
            }
        }
    });
}
function ProcessSave_old(print) {
        //Type:
        var assetType = document.getElementById('Process_Type').value;
        //Send To
        var sendTo = document.getElementById('Process_SendTo').value;
        //Location:
        var location = $("#process_location_ option[value='" + $('#process_location_list_').val() + "']").attr('data-id');

        //Invalid assetType or sendTo, show red border to show user they need it
        if (assetType == "") {
            document.getElementById('Process_Type').style.border = "1px solid red";
            return false;
        }
        else {
            document.getElementById('Process_Type').style.border = "1px solid black";
        }
        if (sendTo == "") {
            document.getElementById('Process_SendTo').style.border = "1px solid red";
            return false;
        }
        else {
            document.getElementById('Process_SendTo').style.border = "1px solid black";
        }
        if (location == null) {
            document.getElementById('process_location_list_').style.border = "1px solid red";
            return false;
        }
        else {
            document.getElementById('process_location_list_').style.border = "1px solid black";
        }

        //Asset ID:
        var assetID = document.getElementById('Process_AssetID').value;
        //Serial:
        var serial = document.getElementById('Process_Serial').value;
        //Qty:
        var qty = document.getElementById('Process_Qty').value;
        //Product:
        var product = $("#productTypes option[value='" + $('#products_list').val().replaceAll("'","\\'") + "']").attr('data-id');
        if (typeof product == 'undefined') {
            product = 0;
        }
        if (sendTo == "Resale" && product == 0) {
            document.getElementById('products_list').style.border = "1px solid red";
            return false;
        }
        else {
            document.getElementById('products_list').style.border = "1px solid black";
        }


        //Grade:
        var grade = document.getElementById('Process_Grade').value;
        //Grade Cosmetic:
        var gradeCosmetic = document.getElementById('r2v3_cosmetic').value;
        //Grade Functional:
        var gradeFunctional = document.getElementById('r2v3_functional').value;


        //SKU
        var arraySKU = [];
        if (grade != "") {
            arraySKU.push(grade + "");
        }
        arraySKU.push(assetType + "");
        if (product != 0) {
            arraySKU.push(product + "");
        }
        //for loop of detail ids

        var arrayDetails = [];
        var arrayVals = [];

        for (const item of selectedDetails) {
            arrayDetails.push(item.ID);
            arrayVals.push(item.Value);

            if (item.ID != 1 && item.ID != 2791 && item.ID != 2792 && item.ID != 7816 && item.ID != 2793 && item.ID != 2917 && item.ID != 7812 && item.ID != 7814 && item.ID != 7816 && item.ID != 7818 && item.ID != 7822 && item.ID != 7824 && item.ID != 7826 && item.ID != 7828 && item.ID != 8572 && item.ID != 8573 && item.ID != 8574 && item.ID != 8575 && item.ID != 9646 && item.ID != 9647 && item.ID !=10075) {
                arraySKU.push(item.ID);
            }
        }
        arraySKU.sort();
        var idsCombined = "";
        for (var i = 0; i < arraySKU.length; i++) {
            idsCombined += arraySKU[i];
        }
        var hashID = hashCode(idsCombined);

        $.ajax({
            url: '/Inventory/ProcessSave',
            data: { assetID: assetID, assetType: assetType, serial: serial, qty: qty, productType: product, location: location, grade: grade, gradeCosmetic: gradeCosmetic, gradeFunctional: gradeFunctional, sendTo: sendTo, hashID: hashID, arrayDetails: arrayDetails, arrayVals: arrayVals },
            type: "POST",
            success: function (response) {
                if(response==false){
                    document.getElementById('ErrorMessageText').innerHTML="An Error has occured!\nPlease contact an Admin."
                    ErrorAlert();
                }
                else if(response.SerialExists){
                    document.getElementById('ErrorMessageText').innerHTML="Serial Already Exists.";
                    document.getElementById('Process_Serial').style.border = "1px solid red";
                    //Add popup
                    if(response.assetID!=""){
                        //add text/loc to error message
                        //ProcessSerialError
                        document.getElementById('ProcessSerialError').innerHTML=""+response.AssetID;
                        document.getElementById('ProcessSerialError').href="/Inventory/Process/"+response.AssetID;
                    }
                    ErrorAlert();
                }
                else{
                    document.getElementById('Process_Serial').style.border = "1px solid black";
                    if (response != null) {
                        document.getElementById('Process_SKU').innerHTML = response.SKU;
                        document.getElementById('Process_SKU').href = "https://az.delta.sellercloud.com/catalog/catalog-details.aspx?ID="+response.SKU;
                        SaveAlert();
                    }
                    if (print) {
                        ProcessPrint();
                        window.location.href = "/View/Loads/" + document.getElementById('Process_Load').innerHTML;
                    }
                }
            }
        });

    }
function CopyQty_old() {
        var asset = document.getElementById('tools_asset').value;
        var qty = document.getElementById('tools_qty').value;
        $.ajax({
            url: '/Tools/CopyQty',
            data: { assetID: asset, qty: qty },
            type: "POST",
            success: function (response) {
                if (response) {
                    alert("Added.");
                }
                else {
                    alert("Bad.");
                }
            }
        });
    }

