function PageMethod(page, fn, paramArray, successFn, errorFn) {

    //Create list of parameters in the form:
    var paramList = '';

    if (paramArray.length > 0) {
        for (var i = 0; i < paramArray.length; i += 2) {
            if (paramList.length > 0) { paramList += ','; }
            paramList += '"' + paramArray[i] + '":"' + paramArray[i + 1] + '"';
        }
    }

    //
    paramList = '{' + paramList + '}';

    //Call the page method
    $.ajax({
        type: "POST",
        url: page + "/" + fn,
        contentType: "application/json; charset=utf-8",
        data: paramList,
        dataType: "json",
        success: function success(result) {
            eval(successFn(result));
        },
        error: errorFn
    });
}

function gfnPageJsonEvaluation(jsonString) {
    var _json = eval("(" + jsonString + ')');
    return _json;
}

function gfnPopulateDropdownControl(dropDownControl, data, isDataJson, includeChooseOption, chooseOptionText, preSelectValue) {

    //alert(" dropDownControl = " + dropDownControl + " data = " + data + " includeChooseOption = " + includeChooseOption + " chooseOptionText = " + " preSelectValue = " + preSelectValue);

    dropDownControl.html('');
    if (!isDataJson) {
        list = gfnPageJsonEvaluation(data);
    }
    else {
        list = data;
    }

    //
    if (includeChooseOption) {
        dropDownControl.append($('<option></option>').val('-2').html(chooseOptionText));
    }

    //
    if (!isDataJson) {
        $.each(list.items, function (id, option) {
            dropDownControl.append($('<option></option>').val(option.Id).html(option.Name));
        });
    }
    else {
        $.each(list, function (id, option) {
            dropDownControl.append($('<option></option>').val(option.Id).html(option.Name));
        });
    }

    //
    if (preSelectValue !== '') {
        dropDownControl.val(preSelectValue);
    }
}

function gfnSendResultsToOrganisationOnClick(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId, organisationWrapperId, otherNameWrapperId,
    personCaseWrapperId, addressWrapperId, hiddenStedRoSelectedValueControlId) {

    //Control what to show
    gfnControlReceivingOrganisationDisplayFunctions(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId, organisationWrapperId,
        otherNameWrapperId, personCaseWrapperId, addressWrapperId, hiddenStedRoSelectedValueControlId);
}

function gfnControlReceivingOrganisationDisplayFunctions(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId, organisationWrapperId,
    otherNameWrapperId, personCaseWrapperId, addressWrapperId, hiddenStedRoSelectedValueControlId) {

    //Initialise the Jquery wrapper objects
    var _isChecked = $('#' + checkboxId).is(":checked");
    var _valueForChoose = '-2';
    var _valueForOther = '00000000-0000-0000-0000-000000000000';
    var $_countryDomObj = $('#' + countryDropDownId);
    var $_stedDomObj = $('#' + stedOrgDropDownId);
    var $_countryWrapperDomObj = $('#' + countryWrapperId);
    var $_organisationWrapperDomObj = $('#' + organisationWrapperId);
    var $_otherNameWrapperDomObj = $('#' + otherNameWrapperId);
    var $_personCaseWrapperDomObj = $('#' + personCaseWrapperId);
    var $_addressWrapperDomObj = $('#' + addressWrapperId);
    var $_tempStedSelectedValue = $('#' + hiddenStedRoSelectedValueControlId);

    //
    //Hide all the features, before starting...
    $_countryWrapperDomObj.hide();
    $_organisationWrapperDomObj.hide();
    $_otherNameWrapperDomObj.hide();
    $_personCaseWrapperDomObj.hide();
    $_addressWrapperDomObj.hide();

    //
    //Store the value of the sted organisation in the hidden field
    $_tempStedSelectedValue.val($_stedDomObj.val());

    //
    if (_isChecked) {
        $_countryWrapperDomObj.show();
        if ($_countryDomObj.val() !== _valueForChoose) {

            //Anything appart from 'Choose' is selected
            //Show the Organisation Wrapper Dom
            $_organisationWrapperDomObj.show();
            if ($_stedDomObj.val() === _valueForChoose) {

                //Choose is selected - don't show anything
            }
            else if ($_stedDomObj.val() === _valueForOther) {

                //Other is selected, so show the Other, Person/Case & Address Wrappers
                $_otherNameWrapperDomObj.show();
                $_personCaseWrapperDomObj.show();
                $_addressWrapperDomObj.show();
            }
            else {

                //Only show the Person/Case wrappers
                $_personCaseWrapperDomObj.show();
            }
        }
        else {
            $_organisationWrapperDomObj.hide();
            $_otherNameWrapperDomObj.hide();
            $_personCaseWrapperDomObj.hide();
            $_addressWrapperDomObj.hide();
        }
    }
}

function gfnOnReceivingOrganisationCountryChange(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId, organisationWrapperId, otherNameWrapperId,
    personCaseWrapperId, addressWrapperId, hiddenStedRoSelectedValueControlId) {

    //Get the value out of the Country Control
    var _countryGuid = $("#" + countryDropDownId).val();

    //Call the web method
    PageMethod(serviceUrl,
        "GetActiveStedOrganisationsByCountryGuid",
        ["pCountryGuid", _countryGuid, "pCheckboxId", checkboxId, "pCountryDropDownId", countryDropDownId, "pStedOrgDropDownId", stedOrgDropDownId,
            "pCountryWrapperId", countryWrapperId, "pOrganisationWrapperId", organisationWrapperId, "pOtherNameWrapperId", otherNameWrapperId,
            "pPersonCaseWrapperId", personCaseWrapperId, "pAddressWrapperId", addressWrapperId,
            "pHiddenStedRoSelectedValueControlId", hiddenStedRoSelectedValueControlId],
        gfnOnReceivingOrganisationCountryChange_onSuccess,
        gfnOnReceivingOrganisationCountryChange_onError);
}

function gfnOnReceivingOrganisationCountryChange_onSuccess(result) {
    var _details = result.d;
    var _json = gfnPageJsonEvaluation(_details);
    if (_json != null) {

        //Now get the other values returned by the webservice call to decide on what to show to the user
        var _data = _json.items;
        var _checkboxId = _json.CheckboxId;
        var _countryDropDownId = _json.CountryDropDownId;
        var _stedOrgDropDownId = _json.StedOrgDropDownId;
        var _countryWrapperId = _json.CountryWrapperId;
        var _organisationWrapperId = _json.OrganisationWrapperId;
        var _otherNameWrapperId = _json.OtherNameWrapperId;
        var _personCaseWrapperId = _json.PersonCaseWrapperId;
        var _addressWrapperId = _json.AddressWrapperId;
        var _hiddenStedRoSelectedValueControlId = _json.HiddenStedRoSelectedValueControlId;

        //Load the list of Sted RO's
        var $_stedOrgDropDownDomObj = $('#' + _stedOrgDropDownId);
        gfnPopulateDropdownControl($_stedOrgDropDownDomObj, _data, true, false, '', '-2');

        //
        gfnControlReceivingOrganisationDisplayFunctions(_checkboxId, _countryDropDownId, _stedOrgDropDownId, _countryWrapperId, _organisationWrapperId,
            _otherNameWrapperId, _personCaseWrapperId, _addressWrapperId, _hiddenStedRoSelectedValueControlId);
    }
}

function gfnOnReceivingOrganisationCountryChange_onError(XMLHttpRequest, textStatus, errorThrown) {

    //$.unblockUI();
    alert('ERROR:\n' + XMLHttpRequest + '\n' + textStatus + '\n' + errorThrown);
}

function gfnOnReceivingOrganisationChange(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId, organisationWrapperId, otherNameWrapperId,
    personCaseWrapperId, addressWrapperId, hiddenStedRoSelectedValueControlId) {

    //Control What to show
    gfnControlReceivingOrganisationDisplayFunctions(checkboxId, countryDropDownId, stedOrgDropDownId, countryWrapperId,
        organisationWrapperId, otherNameWrapperId, personCaseWrapperId, addressWrapperId,
        hiddenStedRoSelectedValueControlId);
}

// common client side function registration
(function (orsReg, $, undefined) {
    orsReg.diacriticalMarksCleaner = function () {
        var fields = $('input.diacritics-name,input.diacritics-addr,input.diacritics-telephone');

        $.each(fields, function (indx, field) {
            $(field).keyup(function (eventData) {
                removeDiatrics($(field));
            });
            $(field).blur(function (eventData) {
                removeDiatrics($(field));
            });
        });
    };

    function removeDiatrics(input) {
        text = input.val();

        if (input.hasClass('diacritics-name') && !(/^[ abcdefghijklmnopqrstuvwxyzâaäáaaçeeëéaîiiíñôoöoosuuüúýABCDEFGHIJKLMNOPQRSTUVWXYZÂAÄÁAAßÇEEËÉAÎIIÍÑÔOÖOOSUUÜÚÝ/'\-ÂâEeÎîÔôUuAaEeIiOoUuÄäËëIiÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýAaÇçAaNnOoŘřŤťßĎďĚěGgŁłŰűŹźČčGgĄąĘęŇňŐőŠšŽžAaOOŻŻàÀòÒûÛæÆøØĞğõÕåÅÂÊÎâÔêÛûÀàÈèÌìÒcÙùÄäËëÏïÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýÅåÇçÆæÑñØøŘřŤťßĎďĚěĞğŁłŰűŹźČčĜĝĄąĘęŇňŐőŠšŽžÃãÕõŻż]*$/i).test(text)) {
            text = text.replace(/[^ abcdefghijklmnopqrstuvwxyzâaäáaaçeeëéaîiiíñôoöoosuuüúýABCDEFGHIJKLMNOPQRSTUVWXYZÂAÄÁAAßÇEEËÉAÎIIÍÑÔOÖOOSUUÜÚÝ/'\-ÂâEeÎîÔôUuAaEeIiOoUuÄäËëIiÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýAaÇçAaNnOoŘřŤťßĎďĚěGgŁłŰűŹźČčGgĄąĘęŇňŐőŠšŽžAaOOŻŻàÀòÒûÛæÆøØĞğõÕåÅÂÊÎâÔêÛûÀàÈèÌìÒcÙùÄäËëÏïÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýÅåÇçÆæÑñØøŘřŤťßĎďĚěĞğŁłŰűŹźČčĜĝĄąĘęŇňŐőŠšŽžÃãÕõŻż]/ig, '');
            input.val(text);
            return;
        } else if (input.hasClass('diacritics-addr') && !(/^[ _1234567890abcdefghijklmnopqrstuvwxyzâaäáaaçeeëéaîiiíñôoöoosuuüúýABCDEFGHIJKLMNOPQRSTUVWXYZÂAÄÁAAßÇEEËÉAÎIIÍÑÔOÖOOSUUÜÚÝ/'\-/,/./(/)/;/:/@/#/*\\ÂâEeÎîÔôUuAaEeIiOoUuÄäËëIiÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýAaÇçAaNnOoŘřŤťßĎďĚěGgŁłŰűŹźČčGgĄąĘęŇňŐőŠšŽžAaOOŻŻàÀòÒûÛæÆøØĞğõÕåÅÂÊÎâÔêÛûÀàÈèÌìÒcÙùÄäËëÏïÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýÅåÇçÆæÑñØøŘřŤťßĎďĚěĞğŁłŰűŹźČčĜĝĄąĘęŇňŐőŠšŽžÃãÕõŻż]*$/i).test(text)) {
            text = text.replace(/[^ _1234567890abcdefghijklmnopqrstuvwxyzâaäáaaçeeëéaîiiíñôoöoosuuüúýABCDEFGHIJKLMNOPQRSTUVWXYZÂAÄÁAAßÇEEËÉAÎIIÍÑÔOÖOOSUUÜÚÝ/'\-/,/./(/)/;/:/@/#/*\\ÂâEeÎîÔôUuAaEeIiOoUuÄäËëIiÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýAaÇçAaNnOoŘřŤťßĎďĚěGgŁłŰűŹźČčGgĄąĘęŇňŐőŠšŽžAaOOŻŻàÀòÒûÛæÆøØĞğõÕåÅÂÊÎâÔêÛûÀàÈèÌìÒcÙùÄäËëÏïÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýÅåÇçÆæÑñØøŘřŤťßĎďĚěĞğŁłŰűŹźČčĜĝĄąĘęŇňŐőŠšŽžÃãÕõŻż]/ig, '');
            input.val(text);
            return;
        } else if (input.hasClass('diacritics-telephone') && !(/^[ +1234567890\-.()]*$/i).test(text)) {
            text = text.replace(/[^ +1234567890\-.()]/ig, '');
            input.val(text);
            return;
        }
    };
}(window.orsReg = window.orsReg || {}, jQuery));

//ÂÊÎâÔêÛûÀàÈèÌìÒcÙùÄäËëÏïÖöÜüÁáÉéÍíÓóÚúĆćŃńŚśÝýÅåÇçÆæÑñØøŘřŤťßĎďĚěĞğŁłŰűŹźČčĜĝĄąĘęŇňŐőŠšŽžÃãÕõŻż