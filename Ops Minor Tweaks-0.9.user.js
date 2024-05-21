// ==UserScript==
// @name         Ops Minor Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Self-contained functional & cosmetic add-ons for proprietary ERP system
// @author       You
// @match        https://sunnkingdevops.azurewebsites.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=azurewebsites.net
// @require      http://code.jquery.com/jquery-3.7.0.min.js
// @require      https://raw.githubusercontent.com/davidshimjs/qrcodejs/master/qrcode.min.js
// @grant        none
// ==/UserScript==

// TODO: Comment & cleanup for publishing

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode. Importing a new jq breaks ops' version and prevents some devexpress functions from firing.
const DEBUG_MODE = true;
function debug(func = 'tweaks', str){ if(DEBUG_MODE) console.log(`[tweaks.${func}] ${str}`) }

/*
 Check current URL to determine which extensions to load
*/
$(document).ready(function(){
    // A lot of these only need to run on the Process page
    setTitle(); // Change tab title to match current page
    specialMenu();

    if(window.location.href.includes("/Process")){
        debug("Running process-page specific extensions...");
        charCount(); // Adds character counter to top-right of New Model dialogue
        stickerSKU(); // Adds button to print sticker for the SKU specifically
        setr2();
    // Inventory table pages
    }else if(window.location.href.includes("/View") || window.location.href.includes("/Reports/Sold")){
        //tableExpand();
    }
});

// TODO: Hacky; diagram and optimize logic
function setTitle(numTries = 0){
    debug("attempt " + numTries);
    if(numTries >= 5) return; // Timeout for dynamically-loaded content.

    let title = window.location.href.split("/"); // Tokenize URL

    if(title.includes("Process")){
        // If field does not exist yet, wait 250ms and recurse.
        // Function should only terminate on one case depending on the page, so this shouldn't break anything.
        // If it did more than one thing, we'd probably need to pass more arguments.
        setTimeout(() => {
            if($("#products_list").length == 0){
                setTitle(numTries + 1);
                return; // Since we're recursing, we should break when we come back so nothing is overriden.
            }
        },"250");

        let product = $("#products_list")[0].value;
        let assetID = $("#Process_AssetID")[0].value;
        document.title = "Process/" + assetID;
        if(product != ""){document.title = product;}

        $("#products_list").on("change",function(){
            let product = $("#products_list")[0].value;
            if(product != ""){
                document.title = product;
            }else{
                document.title = "Process/" + assetID;
            }
        });
    }else if(title.includes("View")){
        if(title.includes("Loads")){
            document.title = "Loads";
           if(title[title.length - 1] != "Loads"){ // If in a specific load, append that load
               document.title += "/" + title[title.length - 1];
           }
        }else{
            document.title = "View/" + title[title.length - 1];
        }
    }else if(title.includes("Reports")){
        document.title = "Reports/" + title[title.length - 1];
    //}else if(title.includes("Tools")){ // If on a tool page
    //    document.title = title[title.length - 1];
    }else{
        document.title = title[title.length - 1];
    }
}
function charCount(){
    debug("initializating character counter...");
    var charCount = '<div id="jd-charcount-wrapper"><p id="jd-charcount">0</p><p id="jd-charmax">/80</p></div>';

    var content = $('#AddProductType_popup .content');
    var manu = $('#add_product_manufacturer');
    var model = $('#add_product_model');
    var part = $('#add_product_part');

    content.prepend(charCount);
    debug("injected counter");

    manu.keyup(updateCount);
    model.keyup(updateCount);
    part.keyup(updateCount);

    function updateCount(){
        debug("updating character counter");
        var total = 0;
        // Count the concatenation whitespace added after submission
        if(model.val().length > 0) total += model.val().length + 1;
        if( manu.val().length > 0) total += manu.val().length + 1;
        total += part.val().length;

        $('#jd-charcount').text(total);
        $('#jd-charcount-wrapper').css('background-color', (total > 80 ? 'red' : 'unset'));
    }
}
function stickerSKU(){
    debug("Initializing...");

    // Manipulate print area
    var printArea = $('#printableArea');
    var newPrint =
        `<div id="jd-print" style="display:none">
          <img id="jd-qr" class="qr" alt="QR-Code"></img>
          <h3 class="sku">SKU</h3>
          <div class="prod">Product</div>
        </div>`;

    $("#layout-drawer-scrollview .page-wrap").prepend(newPrint);

    //
    // Add buttons to existing UI
    //
    var buttonArea = $("#Process2_ButtonArea");

    // Create cool button widget
    var submenu = `<div id="jd-print-menu" class="jd-submenu" style="display:none"></div>`;
    var submenuButt = `<button id="jd-print-menu-butt">V</button>`;

    //buttonArea.append(submenu, submenuButt);
    //$("#Process2_ButtonArea > button:nth-child(2)").insertAfter(submenuButt);
    $("#jd-print-menu-butt").on("click",function(){

    });

    // Create actual functional button
    var skubutt = `<button id="jd-printsku">Print SKU</button>`;
    buttonArea.append(skubutt);
    $("#jd-printsku").on("click",function(){
        printSKU();
    });

    function printSKU(){
        debug("clicked");
        let sku = $("#Process_SKU").text();
        let prod = $("#products_list")[0].value;
        let qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${sku}`;
        // Toggle print visibilities
        $("#printableArea").css('display','block');
        $("#qrcodeCanvas").css("display","none");
        $("#jd-print").css("display","block");

        // Populate information
        $("#jd-print .sku").text(sku);
        $("#jd-print .prod").text(prod);

        $('#jd-print .qr').attr('src',qrURL);
    }
    $('#jd-qr').on("load", function(){

        // From Ops 10's ProcessPrint function
        var tmp = document.createDocumentFragment(), printme = document.getElementById('jd-print').cloneNode(true);
        while (document.body.firstChild) {
            tmp.appendChild(document.body.firstChild);
        }
        document.body.appendChild(printme);

        window.print();

        while (document.body.firstChild) {
            // empty the body again (remove the clone)
            document.body.removeChild(document.body.firstChild);
        }
        // re-add the temporary fragment back into the page, restoring initial state
        document.body.appendChild(tmp);

        //$("#printableArea").css("display","none");
        $("#jd-print").css("display","none");
    });
}
function setr2(){
    var butt_R2 = `<button id="jd-setr2" class='jd-butt-preset'>Very Good / Key Functions</button>`;
    $('#r2v3_').append(butt_R2);
    $("#jd-setr2").on("click",function(){
        $('#r2v3_cosmetic option:eq(6)').prop('selected', true) // C5
        $('#r2v3_functional option:eq(5)').prop('selected', true) // F3
    });

    var butt_procloc = `<button id='jd-setProcLoc' class='jd-butt-preset'>Telecom</button>`;
    $('#AssetDetails_Bottom').prepend(butt_procloc);
    $("#jd-setProcLoc").on("click",function(){
        $('#Process_Type option:eq(17)').prop('selected',true) // Telecom
        $('#Process_Type').change();

        var loc = $('#process_location_list_');
        loc.val('To Be Listed ');
        loc.change() // Triggers event listeners to verify location and update "Send Item To" box
    });

    $('.jd-butt-preset').css({
        'width':'fit-content'
    });
}

// Add special commands menu
function specialMenu(){
    var header = $(".ip_header");

    var menuButt =
        `<div id='jd-special-menu' class='jd-submenu'>
            <button class='jd-submenu-butt'>JD</div>
        </div>`;
    header.prepend(menuButt);

    var menuBody =
        `<div id='jd-special-menu-body'>
          <h2>Preset audits</h2>
          <ul>
            <li><button>Telecom</button></li>
          </ul>
        </div>`;
    //$('.dx-scrollview-content .page-wrap').prepend(menuBody);
}

// Embed text for current r2 selection beneath the drop-down
function r2Prompt(){
    var r2 = {
        "C9":["New, unused, original packaging.","No signs of wear or alteration"],
        "C8":[]
    }
}