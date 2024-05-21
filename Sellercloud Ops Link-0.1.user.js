// ==UserScript==
// @name         Sellercloud Ops Link
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://az.delta.sellercloud.com/catalog/catalog-details.aspx?*
// @match        https://az.delta.sellercloud.com/inventory/catalog-details.aspx?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=
// @require      http://code.jquery.com/jquery-3.7.0.min.js
// @grant        none
// ==/UserScript==

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode.

$(document).ready(function(){
    //https://sunnkingdevops.azurewebsites.net/View/Assets/1020572
    function addBox(){
        console.log("[TAMPERMONKEY ADD-ON] ADDING BUTTON TO BOX");

        var skubox = $("#header-panel-left .header-left-bottom > .tag:first-child");
        if(skubox.length == 0){
            console.log("[TAMPERMONKEY ADD-ON] BOX NOT FOUND, WAITING 1000ms");
            setTimeout(addBox,1000);
            return;
        }
        var sku = skubox.find("span").text();;

        var opsButt = '<a style="margin-right:5px" href="https://sunnkingdevops.azurewebsites.net/View/Assets/' + sku + '"> To Ops </a>'
        var edgeButt = `<a style="margin:0px 5px" href="microsoft-edge:${window.location.href}">To Edge </a>`;
        skubox.append(opsButt);
        skubox.append(edgeButt);
    }
    setTimeout(addBox, 1000);
});