// ==UserScript==
// @name         Ops Item Specifics
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://sunnkingdevops.azurewebsites.net/Inventory/Process*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=css-tricks.com
// @require      http://code.jquery.com/jquery-3.7.0.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode. Importing a new jq breaks ops' version and prevents some devexpress functions from firing.
var debug = false;

//TODO: Handle user tokens with local storage.


$(document).ready(function(){
    getAccessToken().then(function(accessToken){

    });
    injectPanel();
    //getCategorySuggestions("camera");
    //getItemAspectsForCategory(48638); //48638 = security cameras, for testing
});

// *************************
// EBAY API FUNCTIONS
// *************************
const testToken = 'v^1.1#i^1#p^3#r^1#I^3#f^0#t^Ul4xMF84OjYwREVBNkU5RjhFMEZGRjk3NzBFOTgzN0Y3MDdFODAxXzNfMSNFXjEyODQ=';
//const oauth = 'v^1.1#i^1#f^0#p^1#I^3#r^0#t^H4sIAAAAAAAAAOVYfWwURRTv9eMIlmo0fBpCjhVEpLs3u3u93q29M9cW6AH9gCulVAXmdmfbbfd2z51Z2jOYlCLEGA2JiSQQw4eRGL8TMKKkYDT8o0gIoIn6B5IGExJF/hAFFMTZvVKulUChl9jESy6bmXnvze/95r15MwN6vRMf31K35VKZZ0Lh7l7QW+jx8KVgordkwf1FhQ+XFIAcAc/u3jm9xX1F56owTOlpaQXCadPAyNeT0g0suZ0RxrYMyYRYw5IBUwhLRJYSsfplksABKW2ZxJRNnfHFayMMH+CTCAVVUZFBElYA2mvcsNlsRpigCAOBSjHIy0CtCAYQHcfYRnEDE2iQCCMAQWRBmOWFZj4kiUASRU4EwTbG14IsrJkGFeEAE3XhSq6ulYP19lAhxsgi1AgTjccWJRpj8dqFDc1V/hxb0UEeEgQSGw9v1ZgK8rVA3Ua3nwa70lLClmWEMeOPZmcYblSK3QBzD/BdqoUQhKoSCAdkIVBJ/3mhcpFppSC5PQ6nR1NY1RWVkEE0krkTo5SNZCeSyWCrgZqI1/qcz3Ib6pqqISvCLKyOrY41NTHRJWaHUYc0g9UISiXSSGYT1a1sRaVQKQSRoLJ8ZTJcIfLBwYmy1gZpHjFTjWkomkMa9jWYpBpR1GgkN0ION1So0Wi0YipxEOXIOUKunBAOtTmLml1Fm3QYzrqiFCXC5zbvvAJD2oRYWtImaMjCyAGXoggD02lNYUYOurE4GD49OMJ0EJKW/P7u7m6uW+RMq90vAMD7W+uXJeQOlIIMlXVyPSuv3VmB1VxXZJqmVF4imTTF0kNjlQIw2ploAISFoVUYDis6svdfHTk++4dnRL4yJIjkIJBhUBR4AALhynxkSHQwSP0ODpSEGTYFrS5E0jqUESvTOLNTyNIUSaxQBTGkIlYJhlU2EFZVNlmhBFleRQgglEzK4dD/KVFGG+oJJFuI5CXW8xbni7strKyEZm0iyYdV2FZDWmGMhtXS1YuXgobuhhV1HfUtFYvMRiEUGW023NL5Gl2jzDTT+fNBgJPr+SOhzsQEKWNyLyGbadRk6pqcGV8LLFpKE7RIptrO0HYC6Tr9jMnVWDodz8+OnTcn73KzuDe/81ep/qMqdUuvsBO448srRx9TAzCtcbQOObme4WQz5TchPYQ43Wtd1L4RgrcU8iftDNduI0woEoWeA0et5MQSR0uaMnqVbMGkToxehV4yFFsm9zSRW5k5yqbW3kHwXc3ZMxZSkrbeNXoVBUF9TCGq0avGuApQ6mnWZU3J3hE4128Or5c5C2HTtuj1iGt0jszNZhcy6AGEWKauI6uFH/PWm0rZBCZ1NN724DzsRRrNdc/lcXZC4oPhQEVADIjimHyT3fPP2vFWQfJdOe/iJuQf/i4TLXB/fJ/nEOjzfFro8YBKwPILwHxv0criokkMphA5DA0lafZwGlQ5uu0ZkNgW4rpQJg01q9Dr0X74Rr6c8yK0+xkwfehNaGIRX5rzQARm3hwp4R+YViaIIMwLfEgEotgGHrk5WsxPLZ489fSrrzHR5ql86cb18y+H9xreP58EZUNCHk9JAQ3fgk6tvOzkmVR/w0dTfrI7nn36KXna+aKWFwpWzW4P/dVfOmPOzke3TT4768KF+Jo1gaq/T68buB7evuOLJV1XH9z2y4FPrl3pa5/2IhJ2qrXLXt5bdOjDzqqte/ZJ0sV5P7c+7y+u9R+972xrlde7fPbJ9/ce/wMf3XBe3bf+M1/yif229/NdCzfA9vmPbXuXXVX23dd7fjOu7Vz3tjAwY5Kl9zdtTmy68sbvK05s3/HVkVMz5/Z7PphbfoYTPz4lzHsvtX/VwFs/Sht/LY/NPjdhiqSkL259qP7q8SPNna/H/Q21A5uOlV+KvHmQe2nWc4lTm6PvHF7+LX/9S5k5fCKw49j0V/DW4nJm1+KD3x/ILuM/UvJlQasTAAA='
const oauth = 'v^1.1#i^1#p^1#r^0#I^3#f^0#t^H4sIAAAAAAAAAOVYe2wURRjvtb1KgapoI0XAXBaJ4bF7+7jnyp1ee4VW+oJrm7YJ4tzubLt0b/fYme31YsBSDNZ/jIqPKJBgiIIiYAIqYtRATNTIH5o0xpigGAkxatDEKCKgzu6Vcq0ECr3EJl5y2czM9/p9j/lmhh0oK1+8pW7L2QrXTcU7B9iBYpeLm8GWl7mX3FxSfKe7iM0jcO0cuHugdLDk+2UIpLS0uBqitKEj6OlPaToSnckIZZm6aACkIlEHKYhELImJWGODyDOsmDYNbEiGRnnq4xHKL/GspIQUKQRkDvqDZFa/JLPViFA8G5A5PihJHAgLPmcdIQvW6wgDHdvrvECzYZrjW3lW9AuiEGbYgL+L8rRDE6mGTkgYloo65ooOr5ln69VNBQhBExMhVLQ+tjzRHKuP1za1LvPmyYqO+CGBAbbQ2FGNIUNPO9AseHU1yKEWE5YkQYQobzSnYaxQMXbJmBsw33E1CPA+ILO+ZCAQFMi/IK5cbpgpgK9uhz2jyrTikIpQxyrOXsujxBvJdVDCI6MmIqI+7rE/qyygqYoKzQhVWx3rjLW0UNEHjB69Dqo6rWKYSqShRCeqO2h/kA/yAcgrNBdMhv0CFxhRlJM24uZxmmoMXVZtpyFPk4GrIbEajveNL883hKhZbzZjCrYtyqfjR33IdtlBzUXRwj26HVeYIo7wOMNrR2CUG2NTTVoYjkoYv+C4iMQ6nVZlavyik4sj6dOPIlQPxmnR681kMkxGYAyz28uzLOftaGxISD0wBShCa9d6jl69NgOtOlAkSDiRKuJsmtjST3KVGKB3U1EfG+ZHozDWrOj42X9N5GH2jq2IQlUIL/g5lucDQijJ+wOBQhRIdCRHvbYZMAmydAqYvRCnNSBBWiJpZqWgqcqi4Fd4IaRAWg6EFdoXVhQ66ZcDNKdAyEKYTErh0P+pTiaa6QkomRAXJNULluYrMiaS24ARTyS5sAK6anAHiAUEfmXnipVsU6ZpdV1PY7t/udHMhyITLYYrgq/RVOKZVqJ/6tV6nYEwlCcFLyEZadhiaKqUnVoBFky5BZg4W21lyTgBNY18JgU1lk7XF2bDLhjI69wsbgx34RrVf9SkrogK2Yk7tVDZ/IgIAGmVsfuQXeuMZKS8BiBnEHt6rWO1ZzzhlYi8SSvLdFsQYWKJTI6BE2ayc4khLU2eOEuuYRIQE2chdwzZkvANKXI6M0O8qXb3YHRdOvsn45SkpfVOnEWGQJtUiqrkpjGlEpQgzUFW5dwVgXFwM6hPYkyIDMsktyOm2T4xtxq9UCcHEGwamgbNdm7SW28qZWGQ1OBU24MLsBepAJcOus5OLVxcIOzz+3mWC08Km+Scf9ZOtQ5S6M55HRch79hnmWiR8+MGXe+xg653il0uNsjS3BJ2UVlJW2nJTAoRExkEdDlp9DMqUBiy7ekAWyZkemE2DVSzuMylfjUs/ZH3ILRzDVs1+iRUXsLNyHsfYuddXnFzt8yu4AU2zPE86xeEcBe74PJqKXdHaeVttx/c2PJh96fzsscvzJx19JVK3dPAVowSuVzuIpK9RfGhsjPHhoe3gj8fadq97dmfW6u+rdlbvoF7fU9nVttfaTUc6jlPnzq3Y+/mJ59eY65fsI2K7JvzU80vvtNbfQ9V3fvciZZpGzsv7r71fnXP0vLiqmNxc10q8swHizdklBNdj84KHdl+T7S7cfrFuZ+fOP3Cjwv79j+x/anZ8ff/PnOqZRd99MAyz7TsZve7m6J3/bC/y/3RUGXr3PA3v9eK1QtXzXK9rT/f/8Un54bXX/js1bm73jy47/gb6MVf58+eU7qSrliy++uZh+s3Pbyj768jM9567Vxoqbe2T7zPffJBz0u/DcX16R0vB61p3w2pcxbFm7/0Bg/t+Pjx8/Pb2g53lxysGXhs8ckVmQPBC3tyYfwHgw7I9aoTAAA='
const sbxID = 'JohnHein-itemSpec-SBX-572726e2f-17b95316';
const sbxSecret = 'SBX-72726e2fd023-a083-4c6c-8bf4-1c73';
const appID = 'JohnHein-itemSpec-PRD-e72b2ae15-53a2e679';
const b64client = btoa(`${sbxID}:${sbxSecret}`);

const refreshToken = "";

// TODO: Handle the automatic retrieval of a new user token if the stored token fails.
// Can I store a persistent variable, or do I need to do it every page load? Hmm

//var RuName = `John_Heinlein-JohnHein-itemSp-tyrorcjd`;
var userToken = `v^1.1#i^1#I^3#r^0#f^0#p^3#t^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`;

// Returns access token required to get suggested aspects
function getAccessToken(){
    var b64client = btoa(`${sbxID}:${sbxSecret}`);
    return new Promise(function(resolve,reject){
        var url = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
        GM_xmlhttpRequest({
            method:"POST",
            url:url,
            headers:{
                "Content-Type":"application/x-www-form-urlencoded",
                "Authorization":`Basic ${b64client}`
            },
            data:`grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope`,
            onload: function(response){
                console.log("[ACCESS TOKEN] " + response.status + " " + response.statusText);
                resolve(JSON.parse(response.responseText).access_token);
                //reject(console.log(response.responseText));
            }
        });
    });
}
// Creates table of category suggestions
function getCatSuggAsync(query){
    return new Promise(function (resolve, reject){
        var catData = []; // Return array of {id, name, percentage} objects
        var url;
        var xml = `<?xml version="1.0" encoding="utf-8"?>
<GetSuggestedCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${testToken}</eBayAuthToken>
  </RequesterCredentials>
	<ErrorLanguage>en_US</ErrorLanguage>
	<WarningLevel>High</WarningLevel>
  <Query>${query}</Query>
</GetSuggestedCategoriesRequest>`;

        url = "https://api.sandbox.ebay.com/ws/api.dll";

        GM_xmlhttpRequest({
            method:"POST",
            url:url,
            headers:{
                "X-EBAY-API-SITEID":0,
                "X-EBAY-API-COMPATIBILITY-LEVEL":967,
                "X-EBAY-API-CALL-NAME":"GetSuggestedCategories"
            },
            data:xml,
            timeout:3000,
            onload: function(response){
                console.log(`[Category Suggestions for "${query}"]`);
                //console.log(response.responseText);
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response.responseText,"text/xml");
                var categories = xmlDoc.getElementsByTagName("SuggestedCategory");

                for(var i=0;i<categories.length;i++){
                    var suggestions = [];
                    var category = categories[i].getElementsByTagName("Category")[0];
                    var catName = category.getElementsByTagName("CategoryName")[0].innerHTML;
                    var catID = category.getElementsByTagName("CategoryID")[0].innerHTML;
                    var catPc = categories[i].getElementsByTagName("PercentItemFound")[0].innerHTML;
                    console.log(`\t${catID} (${catPc}%): ${catName}`);

                    catData.push({
                        id:catID,
                        name:catName,
                        percent:catPc
                    });
                }
                resolve(catData);
            },
            onerror: function(response){
                console.log(response);
                resolve(false);
            }
        });
    });
}
// Creates table of item aspects for the chosen category.
function getAspectsAsync(catID){
    return getAccessToken().then(function(accessToken){
        return new Promise(function(resolve,reject){
            var url = `https://api.sandbox.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${catID}`;
            GM_xmlhttpRequest({
                method:"GET",
                url:url,
                headers:{
                    "Authorization":"Bearer " + accessToken,
                    "Accept":"application/json",
                    "Accept-Encoding":"gzip"
                },
                onload: function(response){
                    console.log("[CAT ASPECTS REQUEST] " + response.status + " " + response.statusText);
                    console.log(JSON.parse(response.responseText));
                    resolve(JSON.parse(response.responseText));
                }
            });
        });
    });
}

// *************************
// Injection functions
// *************************
function injectPanel(){
    const panel = '<div id="jd-ebay-panel" class="ProcessDetail"></div>';

    $("#1_Notes").after($(panel));

    $("#jd-ebay-panel").append($('<div id="jd-ebay-controls" "class="jd-controls"></div>'));
    $("#jd-ebay-controls").append($('<button id="jd-ebay-suggbutt">Suggest Categories</button>'));

    $("#jd-ebay-panel").append($('<div id="jd-ebay-suggs"></div>'));

    // BUTT FUNC
    //
    $("#jd-ebay-suggbutt").on("click",function(){
        const table = `
    <table id='jd-ebay-suggtable'>
        <thead>
            <tr><th></th><th>Name</th><th>ID</th><th>%</th></tr>
        </thead>
        <tbody></tbody>
        </table>`;

        $("#jd-ebay-panel").append($(table));

        var itemModel = $("#products_list").val();
        console.log(`Getting suggested categories for "${itemModel}"...`);

        getCatSuggAsync(itemModel).then(function(suggs){
            // Generate table of results
            for(var i=0; i < suggs.length; i++){$("#jd-ebay-suggtable tbody").append(makeTR(suggs[i].id,suggs[i].name,suggs[i].percent));}

            var suggestions = $(".jd-ebay-catresult");
            // Attach function to each row - treat them all like buttons
            for(var j=0; j < suggestions.length; j++){
                $(suggestions[j]).on("click",function(){
                    var catID = this.parentElement.parentElement.children[2].innerHTML;
                    getSuggestions(catID);
                });
            }
        });
    });
}

// A category has been selected from the table, now we evaluate the call with another promise c;
function getSuggestions(catID){
    getAspectsAsync(catID).then(function(aspectsObj){
        var panel = $("#jd-ebay-panel");
        $("#jd-ebay-panel > table").remove();
        var table = `<table id='jd-aspects-table'><thead>`;
          table += `<tr><th>Aspect</th><th>Value</th></tr>`
          table += `</thead><tbody>`
          table += `</tbody></table>`

        $("#jd-ebay-panel").append($(table));

        var aspects = aspectsObj.aspects;
        console.log(aspects);
        for(var i=0;i<aspects.length;i++){
            var tmp = aspects[i];
            var asName = tmp.localizedAspectName;
            var asConstraint = tmp.aspectConstraint;
            console.log(`\t${asName} : ${asConstraint}`);

            $('#jd-aspects-table tbody').append(makeAsTR(asName));
        }

        $('#jd-aspects-table tbody').append($(`<tr><td colspan="2"><button id='jd-aspects-submit'>Submit</button></td></tr>`));
        $('#jd-aspects-submit').on('click',function(){

        });
    });
}

// Take specs and their values from the generated table, and process it to fit into the notes field.
function serializeSpecs(){

}

function makeAsTR(name){return $(`<tr><td>${name}</td><td><textarea></textarea></td></tr>`);}
function makeTR(id, name, pc){return $(`<tr><td><button class='jd-ebay-catresult'>Select</button></td><td>${name}</td><td>${id}</td><td>${pc}</td></tr>`);}


// *************************
// SYNCHRONOUS CALLS (Deprecated)
// *************************
function getCategorySuggestions(query){
    var catData = []; // Return array of {id, name, percentage} objects
    var url;
    var xml = `<?xml version="1.0" encoding="utf-8"?>
<GetSuggestedCategoriesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${testToken}</eBayAuthToken>
  </RequesterCredentials>
	<ErrorLanguage>en_US</ErrorLanguage>
	<WarningLevel>High</WarningLevel>
  <Query>${query}</Query>
</GetSuggestedCategoriesRequest>
`;

    url = "https://api.sandbox.ebay.com/ws/api.dll";
    GM_xmlhttpRequest({
        method:"POST",
        url:url,
        headers:{
            "X-EBAY-API-SITEID":0,
            "X-EBAY-API-COMPATIBILITY-LEVEL":967,
            "X-EBAY-API-CALL-NAME":"GetSuggestedCategories"
        },
        data:xml,
        timeout:3000,
        onload: function(response){
            console.log(`[Category Suggestions for "${query}"]`);
            //console.log(response.responseText);
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(response.responseText,"text/xml");
            var categories = xmlDoc.getElementsByTagName("SuggestedCategory");

            for(var i=0;i<categories.length;i++){
                var suggestions = [];
                var category = categories[i].getElementsByTagName("Category")[0];
                var catName = category.getElementsByTagName("CategoryName")[0].innerHTML;
                var catID = category.getElementsByTagName("CategoryID")[0].innerHTML;
                var catPc = categories[i].getElementsByTagName("PercentItemFound")[0].innerHTML;
                console.log(`\t${catID} (${catPc}%): ${catID}`);

                catData.push({
                    id:catID,
                    name:catName,
                    percent:catPc
                });
            }
            //TODO: pass some number of suggested categories to the item specifics API call
        },
        onerror: function(response){
            console.log("XMLHTTPREQUEST on error");
        },
        ontimeout: function(response){
            console.log("XMLHTTPREQUEST on timeout");
        }
    });
    return catData;
}
function getCatTreeId(){
    var url = "https://api.sandbox.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US";
    var tmp;
    GM_xmlhttpRequest({
        method:"GET",
        url:url,
        headers:{
            "Authorization":"Bearer " + oauth,
            "Accept":"application/json",
            "Accept-Encoding":"gzip"
        },
        onload: function(response){
            console.log("[Tree ID Request] " + response.status + " " + response.statusText + ": " + response.responseText);
            tmp = JSON.parse(response.responseText);
        }
    });
    return tmp;
}
function getItemAspectsForCategory(catID){
    //Hard-coded for now, remove the 0 and id to use getCatTreeID return object
    var url = `https://api.sandbox.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${catID}`;
    GM_xmlhttpRequest({
        method:"GET",
        url:url,
        headers:{
            "Authorization":"Bearer " + oauth,
            "Accept":"application/json",
            "Accept-Encoding":"gzip"
        },
        onload: function(response){
            console.log("[Category Aspect Request] " + response.status + " " + response.statusText);
            console.log(JSON.parse(response.responseText));
        }
    });
}