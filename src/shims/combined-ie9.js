(function($){
	if(navigator.geolocation){return;}
	var domWrite = function(){
			setTimeout(function(){
				throw('document.write is overwritten by geolocation shim. This method is incompatibel with this plugin');
			}, 1);
		},
		id = 0
	;
	var geoOpts = $.webshims.modules.geolocation.options || {};
	navigator.geolocation = (function(){
		var pos;
		var api = {
			getCurrentPosition: function(success, error, opts){
				var locationAPIs = 2,
					errorTimer,
					googleTimer,
					calledEnd,
					endCallback = function(){
						if(calledEnd){return;}
						if(pos){
							calledEnd = true;
							success($.extend({timestamp: new Date().getTime()}, pos));
							resetCallback();
							if(window.JSON && window.sessionStorage){
								try{
									sessionStorage.setItem('storedGeolocationData654321', JSON.stringify(pos));
								} catch(e){}
							}
						} else if(error && !locationAPIs) {
							calledEnd = true;
							resetCallback();
							error({ code: 2, message: "POSITION_UNAVAILABLE"});
						}
					},
					googleCallback = function(){
						locationAPIs--;
						getGoogleCoords();
						endCallback();
					},
					resetCallback = function(){
						$(document).unbind('google-loader', resetCallback);
						clearTimeout(googleTimer);
						clearTimeout(errorTimer);
					},
					getGoogleCoords = function(){
						if(pos || !window.google || !google.loader || !google.loader.ClientLocation){return false;}
						var cl = google.loader.ClientLocation;
			            pos = {
							coords: {
								latitude: cl.latitude,
				                longitude: cl.longitude,
				                altitude: null,
				                accuracy: 43000,
				                altitudeAccuracy: null,
				                heading: parseInt('NaN', 10),
				                velocity: null
							},
			                //extension similiar to FF implementation
							address: $.extend({streetNumber: '', street: '', premises: '', county: '', postalCode: ''}, cl.address)
			            };
						return true;
					},
					getInitCoords = function(){
						if(pos){return;}
						getGoogleCoords();
						if(pos || !window.JSON || !window.sessionStorage){return;}
						try{
							pos = sessionStorage.getItem('storedGeolocationData654321');
							pos = (pos) ? JSON.parse(pos) : false;
							if(!pos.coords){pos = false;} 
						} catch(e){
							pos = false;
						}
					}
				;
				
				getInitCoords();
				
				if(!pos){
					if(geoOpts.confirmText && !confirm(geoOpts.confirmText.replace('{location}', location.hostname))){return;}
					$.ajax({
						url: 'http://freegeoip.net/json/',
						dataType: 'jsonp',
						cache: true,
						jsonp: 'callback',
						success: function(data){
							locationAPIs--;
							if(!data){return;}
							pos = pos || {
								coords: {
									latitude: data.latitude,
					                longitude: data.longitude,
					                altitude: null,
					                accuracy: 43000,
					                altitudeAccuracy: null,
					                heading: parseInt('NaN', 10),
					                velocity: null
								},
				                //extension similiar to FF implementation
								address: {
									city: data.city,
									country: data.country_name,
									countryCode: data.country_code,
									county: "",
									postalCode: data.zipcode,
									premises: "",
									region: data.region_name,
									street: "",
									streetNumber: ""
								}
				            };
							endCallback();
						},
						error: function(){
							locationAPIs--;
							endCallback();
						}
					});
					clearTimeout(googleTimer);
					if (!window.google || !window.google.loader) {
						googleTimer = setTimeout(function(){
							//destroys document.write!!!
							if (geoOpts.destroyWrite) {
								document.write = domWrite;
								document.writeln = domWrite;
							}
							$(document).one('google-loader', googleCallback);
							$.webshims.loader.loadScript('http://www.google.com/jsapi', false, 'google-loader');
						}, 800);
					} else {
						locationAPIs--;
					}
				} else {
					setTimeout(endCallback, 1);
					return;
				}
				if(opts && opts.timeout){
					errorTimer = setTimeout(function(){
						resetCallback();
						if(error) {
							error({ code: 3, message: "TIMEOUT"});
						}
					}, opts.timeout);
				} else {
					errorTimer = setTimeout(function(){
						locationAPIs = 0;
						endCallback();
					}, 10000);
				}
			},
			clearWatch: $.noop
		};
		api.watchPosition = function(a, b, c){
			api.getCurrentPosition(a, b, c);
			id++;
			return id;
		};
		return api;
	})();
})(jQuery);
//todo use $.globalEval?
jQuery.webshims.gcEval = function(){
	"use strict";
	return (function(){eval( arguments[0] );}).call(arguments[1] || window, arguments[0]);
};
jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	"use strict";
	webshims.getVisualInput = function(elem){
		elem = $(elem);
		return (elem.data('inputUIReplace') || {visual: elem}).visual;
	};
	var support = $.support;
	var getVisual = webshims.getVisualInput;
	var groupTypes = {checkbox: 1, radio: 1};
	var emptyJ = $([]);
	var getGroupElements = function(elem){
		elem = $(elem);
		return (groupTypes[elem[0].type] && elem[0].name) ? $(doc.getElementsByName(elem[0].name)).not(elem[0]) : emptyJ;
	};
	
	/*
	 * Selectors for all browsers
	 */
	var rangeTypes = {number: 1, range: 1, date: 1, time: 1, 'datetime-local': 1, datetime: 1, month: 1, week: 1};
	$.extend($.expr.filters, {
		"valid-element": function(elem){
			return !!($.attr(elem, 'willValidate') && ($.attr(elem, 'validity') || {valid: true}).valid);
		},
		"invalid-element": function(elem){
			return !!($.attr(elem, 'willValidate') && !isValid(elem));
		},
		"required-element": function(elem){
			return !!($.attr(elem, 'willValidate') && $.attr(elem, 'required') === true);
		},
		"optional-element": function(elem){
			return !!($.attr(elem, 'willValidate') && $.attr(elem, 'required') === false);
		},
		"in-range": function(elem){
			if(!rangeTypes[$.attr(elem, 'type')] || !$.attr(elem, 'willValidate')){
				return false;
			}
			var val = $.attr(elem, 'validity');
			return !!(val && !val.rangeOverflow && !val.rangeUnderflow);
		},
		"out-of-range": function(elem){
			if(!rangeTypes[$.attr(elem, 'type')] || !$.attr(elem, 'willValidate')){
				return false;
			}
			var val = $.attr(elem, 'validity');
			return !!(val && (val.rangeOverflow || val.rangeUnderflow));
		}
		
	});
	//better you use the selectors above
	['required', 'valid', 'invalid', 'optional'].forEach(function(name){
		$.expr.filters[name] = $.expr.filters[name+"-element"];
	});
	
	var isValid = function(elem){
		return ($.attr(elem, 'validity') || {valid: true}).valid;
	};
	
	
	//ToDo needs testing
	var oldAttr = $.attr;
	var changeVals = {selectedIndex: 1, value: 1, checked: 1, disabled: 1, readonly: 1};
	var stopUIRefresh;
	$.attr = function(elem, name, val){
		if(elem.form && changeVals[name] && val !== undefined && $(elem).hasClass('form-ui-invalid')){
			var ret = oldAttr.apply(this, arguments);
			if(isValid(elem)){
				getVisual(elem).removeClass('form-ui-invalid');
				if(name == 'checked' && val) {
					getGroupElements(elem).removeClass('form-ui-invalid').removeAttr('aria-invalid');
				}
			}
			return ret;
		}
		return oldAttr.apply(this, arguments);
	};
	$(document).bind('focusout change refreshValidityStyle', function(e){
		if(stopUIRefresh || !e.target || !e.target.form || e.target.type == 'submit'){return;}
		
		var elem = $.attr(e.target, 'html5element') || e.target;
		if(!$.attr(elem, 'willValidate')){
			getVisual(elem).removeClass('form-ui-invalid form-ui-valid');
			return;
		}
		var addClass, removeClass;
		if(isValid(e.target)){
			addClass = 'form-ui-valid';
			removeClass = 'form-ui-invalid';
			if(groupTypes[e.target.type] && e.target.checked){
				getGroupElements(elem).removeClass(removeClass).removeAttr('aria-invalid');
			}
		} else {
			addClass = 'form-ui-invalid';
			removeClass = 'form-ui-valid';
			if(groupTypes[e.target.type] && !e.target.checked){
				getGroupElements(elem).removeClass(removeClass);
			}
		}
		getVisual(elem).addClass(addClass).removeClass(removeClass);
		
		stopUIRefresh = true;
		setTimeout(function(){
			stopUIRefresh = false;
		}, 9);
	});
	
	
	
	webshims.triggerInlineForm = (function(){
		var stringify = function(id){
			if(typeof id != 'string' || id.indexOf('-') !== -1 || id.indexOf('.') !== -1 || id.indexOf('"') !== -1){return '';}
			return 'var '+ id +' = this.form["'+ id +'"];';
		};
		return function(elem, event){
			var attr = elem['on'+event] || elem.getAttribute('on'+event) || '';
			var ret;
			event = $.Event({
				type: event,
				target: elem[0],
				currentTarget: elem[0]
			});
			
			if(attr && typeof attr == 'string' && elem.form && elem.form.elements){
				var scope = '';
				for(var i = 0, elems = elem.form.elements, len = elems.length; i < len; i++ ){
					var name = elems[i].name;
					var id = elems[i].id;
					if(name){
						scope += stringify(name);
					}
					if(id && id !== name){
						scope += stringify(id);
					}
				}
				ret = webshims.gcEval(scope + attr, elem);
			}
			if(ret === false){
				event.stopPropagation();
				event.preventDefault();
			}
			$(elem).trigger(event);
			return ret;
		};
	})();
	
	
	var setRoot = function(){
		webshims.scrollRoot = ($.browser.webkit || doc.compatMode == 'BackCompat') ?
			$(doc.body) : 
			$(doc.documentElement)
		;
	};
	setRoot();
	$(setRoot);
	
	/* some extra validation UI */
	webshims.validityAlert = (function(){
		var alertElem = (!$.browser.msie || parseInt($.browser.version, 10) > 7) ? 'span' : 'label';
		var api = {
			hideDelay: 5000,
			showFor: function(elem, message, hideOnBlur){
				elem = $(elem);
				var visual = getVisual(elem);
				createAlert();
				api.clear();
				this.getMessage(elem, message);
				this.position(visual);
				alert.css({
					fontSize: elem.css('fontSize'),
					fontFamily: elem.css('fontFamily')
				});
				this.show();
				
				if(this.hideDelay){
					hideTimer = setTimeout(boundHide, this.hideDelay);
				}
				
				if(!hideOnBlur){
					this.setFocus(visual, elem[0]);
				}
			},
			setFocus: function(visual, elem){
				var focusElem = $('input, select, textarea, .ui-slider-handle', visual).filter(':visible:first');
				if(!focusElem[0]){
					focusElem = visual;
				}
				var scrollTop = webshims.scrollRoot.scrollTop();
				var elemTop = focusElem.offset().top;
				var labelOff;
				var smooth;
				alert.attr('for', webshims.getID(focusElem));
				
				if(scrollTop > elemTop){
					labelOff = elem.id && $('label[for="'+elem.id+'"]', elem.form).offset();
					if(labelOff && labelOff.top < elemTop){
						elemTop = labelOff.top;
					}
					webshims.scrollRoot.animate(
						{scrollTop: elemTop - 5}, 
						{
							queue: false, 
							duration: Math.max( Math.min( 450, (scrollTop - elemTop) * 2 ), 140 )
						}
					);
					smooth = true;
				}
				try {
					focusElem[0].focus();
				} catch(e){}
				if(smooth){
					webshims.scrollRoot.scrollTop(scrollTop);
				}
				$(doc).bind('focusout.validityalert', boundHide);
			},
			getMessage: function(elem, message){
				$('> span.va-box', alert).text(message || elem.attr('x-moz-errormessage') || elem.attr('data-errormessage') || elem.attr('validationMessage'));
			},
			position: function(elem){
				var offset = elem.offset();
				offset.top += elem.outerHeight();
				alert.css(offset);
			},
			show: function(){
				if(alert.css('display') === 'none'){
					alert.fadeIn();
				} else {
					alert.fadeTo(400, 1);
				}
			},
			hide: function(){
				api.clear();
				alert.fadeOut();
			},
			clear: function(){
				clearTimeout(hideTimer);
				$(doc).unbind('focusout.validityalert');
				alert.stop().removeAttr('for');
			},
			alert: $('<'+alertElem+' class="validity-alert" role="alert"><span class="va-arrow"><span class="va-arrow-box" /></span><span class="va-box" /></'+alertElem+'>').css({position: 'absolute', display: 'none'})
		};
		
		var alert = api.alert;
		var hideTimer = false;
		var boundHide = $.proxy(api, 'hide');
		var created = false;
		var createAlert = function(){
			if(created){return;}
			created = true;
			$(function(){alert.appendTo('body');});
		};
		return api;
	})();
	
	
	/* extension, but also used to fix native implementation workaround/bugfixes */
	(function(){
		var firstEvent,
			invalids = [],
			stopSubmitTimer,
			form
		;
		
		$(doc).bind('invalid', function(e){
			var jElm = $(e.target).addClass('form-ui-invalid').removeClass('form-ui-valid');
			if(!firstEvent){
				//trigger firstinvalid
				firstEvent = $.Event('firstinvalid');
				jElm.trigger(firstEvent);
			}
			
			//if firstinvalid was prevented all invalids will be also prevented
			if( firstEvent && firstEvent.isDefaultPrevented() ){
				e.preventDefault();
			}
			invalids.push(e.target);
			e.extraData = 'fix'; 
			clearTimeout(stopSubmitTimer);
			stopSubmitTimer = setTimeout(function(){
				var lastEvent = {type: 'lastinvalid', cancelable: false, invalidlist: $(invalids)};
				//reset firstinvalid
				firstEvent = false;
				invalids = [];
				//remove webkit/operafix
				$(form).unbind('submit.preventInvalidSubmit');
				jElm.trigger(lastEvent, lastEvent);
			}, 9);
			
		});
	})();
	
	(function(){
		if(!support.validity || window.noHTMLExtFixes || support.fieldsetValidation){return;}
		//safari 5.0.2 has serious issues with checkValidity in combination with setCustomValidity so we mimic checkValidity using validity-property (webshims.fix.checkValidity)
		var checkValidity = function(elem){
			var valid = ($.attr(elem, 'validity') || {valid: true}).valid;
			if(!valid && elem.checkValidity && elem.checkValidity()){
				$(elem).trigger('invalid');
			}			
			return valid;
		};
		var checkElems = ['fieldset'];
		//safari has a stupid bug ToDo: make proper test for safari bug
		if(!support.output){
			checkElems = ['input', 'textarea', 'select', 'form', 'fieldset'];
		}
		
		webshims.defineNodeNamesProperty(checkElems, 'checkValidity', {
			value: function(){
				if(this.elements || $.nodeName(this, 'fieldset')){
					var ret = true;
					$(this.elements || 'input, textarea, select', this)
						.each(function(){
							 if(!checkValidity(this)){
								ret = false;
							}
						})
					;
					return ret;
				} else if(this.checkValidity){
					return checkValidity(this);
				}
			}
		});
		
	})();
	
	
	webshims.createReadyEvent('form-core');
}, true);



jQuery.webshims.ready('form-core', function($, webshims, window, doc, undefined){
	"use strict";
	var validityMessages = webshims.validityMessages;
	var support = $.support;
	
	validityMessages['en'] = validityMessages['en'] || validityMessages['en-US'] || {
		typeMismatch: {
			email: '{%value} is not a legal email address',
			url: '{%value} is not a valid web address',
			number: '{%value} is not a number!',
			date: '{%value} is not a date',
			time: '{%value} is not a time',
			range: '{%value} is not a number!',
			"datetime-local": '{%value} is not a correct date-time format.'
		},
		rangeUnderflow: '{%value} is too low. The lowest value you can use is {%min}.',
		rangeOverflow: '{%value}  is too high. The highest value you can use is {%max}.',
		stepMismatch: 'The value {%value} is not allowed for this form.',
		tooLong: 'The entered text is too large! You used {%valueLen} letters and the limit is {%maxlength}.',
		
		patternMismatch: '{%value} is not in the format this page requires! {%title}',
		valueMissing: 'You have to specify a value'
	};
	
	validityMessages['en-US'] = validityMessages['en-US'] || validityMessages['en'];
	validityMessages[''] = validityMessages[''] || validityMessages['en-US'];
	
	validityMessages['de'] = validityMessages['de'] || {
		typeMismatch: {
			email: '{%value} ist keine zulässige E-Mail-Adresse',
			url: '{%value} ist keine zulässige Webadresse',
			number: '{%value} ist keine Nummer!',
			date: '{%value} ist kein Datum',
			time: '{%value} ist keine Uhrzeit',
			range: '{%value} ist keine Nummer!',
			"datetime-local": '{%value} ist kein Datum-Uhrzeit Format.'
		},
		rangeUnderflow: '{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen können.',
		rangeOverflow: '{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen können.',
		stepMismatch: 'Der Wert {%value} ist in diesem Feld nicht zulässig. Hier sind nur bestimmte Werte zulässig. {%title}',
		tooLong: 'Der eingegebene Text ist zu lang! Sie haben {%valueLen} Buchstaben eingegeben, dabei sind {%maxlength} das Maximum.',
		
		patternMismatch: '{%value} hat für diese Seite ein falsches Format! {%title}',
		valueMissing: 'Sie müssen einen Wert eingeben'
	};
	
	var currentValidationMessage =  validityMessages[''];
	$(doc).bind('htmlExtLangChange', function(){
		webshims.activeLang(validityMessages, 'form-message', function(langObj){
			currentValidationMessage = langObj;
		});
	});
	
	webshims.createValidationMessage = function(elem, name){
		var message = currentValidationMessage[name];
		if(message && typeof message !== 'string'){
			message = message[ (elem.getAttribute('type') || '').toLowerCase() ] || message.defaultMessage;
		}
		if(message){
			['value', 'min', 'max', 'title', 'maxlength', 'label'].forEach(function(attr){
				if(message.indexOf('{%'+attr) === -1){return;}
				var val = ((attr == 'label') ? $.trim($('label[for="'+ elem.id +'"]', elem.form).text()).replace(/\*$|:$/, '') : $.attr(elem, attr)) || '';
				message = message.replace('{%'+ attr +'}', val);
				if('value' == attr){
					message = message.replace('{%valueLen}', val.length);
				}
			});
		}
		return message || '';
	};
	
	var implementProperties = (webshims.overrideValidationMessages || webshims.implement.customValidationMessage) ? ['customValidationMessage'] : [];
	if((!window.noHTMLExtFixes && !support.validationMessage) || !support.validity){
		implementProperties.push('validationMessage');
	}
	
	$.each(implementProperties, function(i, messageProp){
		webshims.defineNodeNamesProperty(['input', 'select', 'textarea', 'fieldset', 'output'], messageProp, {
			get: function(elem){
				var message = '';
				if(!$.attr(elem, 'willValidate')){
					return message;
				}
				var validity = $.attr(elem, 'validity') || {valid: 1};
				if(validity.valid){return message;}
				message = elem.getAttribute('x-moz-errormessage') || elem.getAttribute('data-errormessage') || '';
				if(message){return message;}
				if(validity.customError && elem.nodeName){
					message = ('validationMessage' in elem) ? elem.validationMessage : $.data(elem, 'customvalidationMessage');
					if(message){return message;}
				}
				$.each(validity, function(name, prop){
					if(name == 'valid' || !prop){return;}
					message = webshims.createValidationMessage(elem, name);
					if(message){
						return false;
					}
				});
				return message || '';
			},
			set: $.noop
		});
		
	});
}, true);jQuery.webshims.ready('form-core', function($, webshims, window){
if($.support.validity){
	return;
}

webshims.inputTypes = webshims.inputTypes || {};
//some helper-functions
var getNames = function(elem){
		return (elem.form && elem.name) ? elem.form[elem.name] : [];
	},
	isNumber = function(string){
		return (typeof string == 'number' || (string && string == string * 1));
	},
	typeModels = webshims.inputTypes,
	checkTypes = {
		radio: 1,
		checkbox: 1		
	},
	getType = function(elem){
		return (elem.getAttribute('type') || elem.type || '').toLowerCase();
	}
;

//API to add new input types
webshims.addInputType = function(type, obj){
	typeModels[type] = obj;
};

//contsrain-validation-api
var validiyPrototype = {
	customError: false,

	typeMismatch: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	
	valid: true
};

var validityRules = {
		valueMissing: function(input, val, cache){
			if(!input.attr('required')){
				return false;
			}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			if(cache.nodeName == 'select'){
				ret = (!val && input[0].type == 'select-one' && input[0].size < 2 && $('> option:first-child:not(:disabled)', input).attr('selected'));
			} else if(checkTypes[cache.type]){
				ret = !$(getNames(input[0])).filter(':checked')[0];
			} else {
				ret = !(val);
			}
			return ret;
		},
		tooLong: function(input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var maxLen 	= input.attr('maxlength'),
				ret 	= false,
				len 	= val.length	
			;
			if(len && maxLen >= 0 && val.replace && isNumber(maxLen)){
				ret = (len > maxLen);
			}
			return ret;
		},
		typeMismatch: function (input, val, cache){
			if(val === '' || cache.nodeName == 'select'){return false;}
			var ret = false;
			if(!('type' in cache)){
				cache.type = getType(input[0]);
			}
			
			if(typeModels[cache.type] && typeModels[cache.type].mismatch){
				ret = typeModels[cache.type].mismatch(val, input);
			}
			return ret;
		},
		patternMismatch: function(input, val, cache) {
			if(val === '' || cache.nodeName == 'select'){return false;}
			var pattern = input.attr('pattern');
			if(!pattern){return false;}
			return !(new RegExp('^(?:' + pattern + ')$').test(val));
		}
	}
;

webshims.addValidityRule = function(type, fn){
	validityRules[type] = fn;
};

webshims.defineNodeNamesProperty(['input', 'textarea', 'select', 'form', 'fieldset'], 'checkValidity', {
	value: (function(){
		var unhandledInvalids;
		var testValidity = function(elem){
			
			var e,
				v = $.attr(elem, 'validity')
			;
			if(v){
				$.data(elem, 'cachedValidity', v);
			} else {
				return true;
			}
			if( !v.valid ){
				e = $.Event('invalid');
				var jElm = $(elem).trigger(e);
				if(!unhandledInvalids && !e.isDefaultPrevented()){
					webshims.validityAlert.showFor(jElm);
					unhandledInvalids = true;
				}
			}
			$.data(elem, 'cachedValidity', false);
			return v.valid;
		};
		return function(){
			unhandledInvalids = false;
			if($.nodeName(this, 'form') || $.nodeName(this, 'fieldset')){
				var ret = true,
					elems = this.elements || $( 'input, textarea, select', this);
				
				for(var i = 0, len = elems.length; i < len; i++){
					if( !testValidity(elems[i]) ){
						ret = false;
					}
				}
				return ret;
			} else if(this.form){
				return testValidity(this);
			} else {
				return true;
			}
		};
	})()
});

webshims.defineNodeNamesProperty(['input', 'textarea', 'select'], 'setCustomValidity', {
	value: function(error){
		$.data(this, 'customvalidationMessage', ''+error);
	}
});


$.event.special.invalid = {
	add: function(){
		if( !$.data(this, 'invalidEventShim') ){
			$.event.special.invalid.setup.call(this);
		}
	},
	setup: function(){
		$(this)
			.bind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', true)
		;
		var submitEvents = $(this).data('events').submit;
		if(submitEvents && submitEvents.length > 1){
			submitEvents.unshift( submitEvents.pop() );
		}
	},
	teardown: function(){
		$(this)
			.unbind('submit', $.event.special.invalid.handler)
			.data('invalidEventShim', false)
		;
	},
	handler: function(e, d){
		
		if( e.type != 'submit' || !$.nodeName(e.target, 'form') || $.attr(e.target, 'novalidate') != null || $.data(e.target, 'novalidate') ){return;}
		var notValid = !($(e.target).checkValidity());
		if(notValid){
			//ToDo
			if(!e.originalEvent && window.console && console.log){
				console.log('submit');
			}
			e.stopImmediatePropagation();
			return false;
		}
	}
};

// IDLs for constrain validation API
webshims.defineNodeNamesProperty(['input', 'select', 'textarea'], 'validity', {
	set: $.noop,
	get: function(elem){
		var validityState = $.data(elem, 'cachedValidity');
		if(validityState){
			return validityState;
		}
		validityState 	= $.extend({}, validiyPrototype);
		
		if( !$.attr(elem, 'willValidate') || elem.type == 'submit' ){
			return validityState;
		}
		var jElm 			= $(elem),
			val				= jElm.val(),
			cache 			= {nodeName: elem.nodeName.toLowerCase()},
			ariaInvalid 	= elem.getAttribute('aria-invalid')
		;
		
		validityState.customError = !!($.data(elem, 'customvalidationMessage'));
		if( validityState.customError ){
			validityState.valid = false;
		}
						
		$.each(validityRules, function(rule, fn){
			if (fn(jElm, val, cache)) {
				validityState[rule] = true;
				validityState.valid = false;
			}
		});
		elem.setAttribute('aria-invalid',  validityState.valid ? 'false' : 'true');
		return validityState;
	}
});


//todo
webshims.defineNodeNamesBooleanProperty(['input', 'textarea', 'select'], 'required', {
	set: function(elem, value){
		elem.setAttribute('aria-required', (value) ? 'true' : 'false');
	},
	init: true
});

webshims.defineNodeNamesProperty(['input', 'select', 'textarea', 'fieldset', 'button', 'output'], 'willValidate', {
	get: (function(){
		var types = {
				button: 1,
				reset: 1,
				add: 1,
				remove: 1,
				'move-up': 1,
				'move-down': 1,
				hidden: 1
			}
		;
		var barredElems = {fieldset: 1, button: 1, output: 1};
		return function(elem){
			//elem.name && <- we don't use to make it easier for developers
			return !!( elem.form && !elem.disabled && !elem.readOnly && !types[elem.type] && !barredElems[(elem.nodeName || '').toLowerCase()] && $.attr(elem.form, 'novalidate') == null );
		};
	})()
}, true, 'form-htc-validity.htc');


webshims.addInputType('email', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|(\x22((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?\x22))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

webshims.addInputType('url', {
	mismatch: (function(){
		//taken from scott gonzales
		var test = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		return function(val){
			return !test.test(val);
		};
	})()
});

var noValidate = function(){
		var elem = this;
		if(!elem.form){return;}
		$.data(elem.form, 'novalidate', true);
		setTimeout(function(){
			$.data(elem.form, 'novalidate', false);
		}, 1);
	}, 
	submitterTypes = {submit: 1, button: 1}
;

$(document).bind('click', function(e){
	if(e.target && e.target.form && submitterTypes[e.target.type] && $.attr(e.target, 'formnovalidate') != null){
		noValidate.call(e.target);
	}
});

webshims.addReady(function(context, contextElem){
	//start constrain-validation
	var form = $('form', context)
		.add(contextElem.filter('form'))
		.bind('invalid', $.noop)
		.find('button[formnovalidate]')
		.bind('click', noValidate)
		.end()
	;
	
	setTimeout(function(){
		if (!document.activeElement || !document.activeElement.form) {
			var first = true;
			$('input, select, textarea', form).each(function(i){
				if(!first){return false;}
				if(this.getAttribute('autofocus') == null){return;}	
				first = false;
				var elem = webshims.getVisualInput(this);
				var focusElem = $('input, select, textarea, .ui-slider-handle', elem).filter(':visible:first');
				if (!focusElem[0]) {
					focusElem = elem;
				}
				try {
					focusElem[0].focus();
				} catch (e) {}
			});
		}
	}, 9);
	
});

webshims.createReadyEvent('form-extend');

}, true); //webshims.ready end



jQuery.webshims.ready('form-extend', function($, webshims, window){
	"use strict";
	//why no step IDL?
	webshims.getStep = function(elem, type){
		var step = $.attr(elem, 'step');
		if(step === 'any'){
			return step;
		}
		type = type || getType(elem);
		if(!typeModels[type] || !typeModels[type].step){
			return step;
		}
		step = typeProtos.number.asNumber(step);
		return ((!isNaN(step) && step > 0) ? step : typeModels[type].step) * typeModels[type].stepScaleFactor;
	};
	//why no min/max IDL?
	webshims.addMinMaxNumberToCache = function(attr, elem, cache){
		if (!(attr+'AsNumber' in cache)) {
			cache[attr+'AsNumber'] = typeModels[cache.type].asNumber(elem.attr(attr));
			if(isNaN(cache[attr+'AsNumber']) && (attr+'Default' in typeModels[cache.type])){
				cache[attr+'AsNumber'] = typeModels[cache.type][attr+'Default'];
			}
		}
	};
	
	var nan = parseInt('NaN', 10),
		doc = document,
		typeModels = webshims.inputTypes,
		isNumber = function(string){
			return (typeof string == 'number' || (string && string == string * 1));
		},
		supportsType = function(type){
			return ($('<input type="'+type+'" />').attr('type') === type);
		},
		getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase();
		},
		isDateTimePart = function(string){
			return (isNumber(string) || (string && string == '0' + (string * 1)));
		},
		addMinMaxNumberToCache = webshims.addMinMaxNumberToCache,
		addleadingZero = function(val, len){
			val = ''+val;
			len = len - val.length;
			for(var i = 0; i < len; i++){
				val = '0'+val;
			}
			return val;
		},
		EPS = 1e-7
	;
	
	webshims.addValidityRule('stepMismatch', function(input, val, cache){
		if(val === ''){return false;}
		if(!('type' in cache)){
			cache.type = getType(input[0]);
		}
		//stepmismatch with date is computable, but it would be a typeMismatch (performance)
		if(cache.type == 'date'){
			return false;
		}
		var ret = false, base;
		if(typeModels[cache.type] && typeModels[cache.type].step){
			if( !('step' in cache) ){
				cache.step = webshims.getStep(input[0], cache.type);
			}
			
			if(cache.step == 'any'){return false;}
			
			if(!('valueAsNumber' in cache)){
				cache.valueAsNumber = typeModels[cache.type].asNumber( val );
			}
			if(isNaN(cache.valueAsNumber)){return false;}
			
			addMinMaxNumberToCache('min', input, cache);
			base = cache.minAsNumber;
			if(isNaN(base)){
				base = typeModels[cache.type].stepBase || 0;
			}
			
			ret =  Math.abs((cache.valueAsNumber - base) % cache.step);
							
			ret = !(  ret <= EPS || Math.abs(ret - cache.step) <= EPS  );
		}
		return ret;
	});
	
	
	
	[{name: 'rangeOverflow', attr: 'max', factor: 1}, {name: 'rangeUnderflow', attr: 'min', factor: -1}].forEach(function(data, i){
		webshims.addValidityRule(data.name, function(input, val, cache) {
			var ret = false;
			if(val === ''){return ret;}
			if (!('type' in cache)) {
				cache.type = getType(input[0]);
			}
			if (typeModels[cache.type] && typeModels[cache.type].asNumber) {
				if(!('valueAsNumber' in cache)){
					cache.valueAsNumber = typeModels[cache.type].asNumber( val );
				}
				if(isNaN(cache.valueAsNumber)){
					return false;
				}
				
				addMinMaxNumberToCache(data.attr, input, cache);
				
				if(isNaN(cache[data.attr+'AsNumber'])){
					return ret;
				}
				ret = ( cache[data.attr+'AsNumber'] * data.factor <  cache.valueAsNumber * data.factor - EPS );
			}
			return ret;
		});
	});
	
	//IDLs and methods, that aren't part of constrain validation, but strongly tight to it
	
	var valueAsNumberDescriptor = {
		get: function(elem){
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asNumber) ? 
				typeModels[type].asNumber($.attr(elem, 'value')) :
				nan;
		},
		set: function(elem, val){
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].numberToString){
				//is NaN a number?
				if(isNaN(val)){
					$.attr(elem, 'value', '');
					return;
				}
				var set = typeModels[type].numberToString(val);
				if(set !==  false){
					$.attr(elem, 'value', set);
				} else {
					throw('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				valueAsNumberDescriptor.set._polyfilled(elem, arguments);
			}
		}
	};
	
	var valueAsDateDescriptor = {
		get: function(elem){
			var type = getType(elem);
			return (typeModels[type] && typeModels[type].asDate && !typeModels[type].noAsDate) ? 
				typeModels[type].asDate($.attr(elem, 'value')) :
				valueAsDateDescriptor.get_polyfilled.call(elem);
		},
		set: function(elem, value){
			var type = getType(elem);
			if(typeModels[type] && typeModels[type].dateToString){
				if(!window.noHTMLExtFixes) {
					throw("there are some serious issues in opera's implementation. don't use!");
				}
				if(value === null){
					$.attr(elem, 'value', '');
					return '';
				}
				var set = typeModels[type].dateToString(value);
				if(set !== false){
					$.attr(elem, 'value', set);
					return set;
				} else {
					throw('INVALID_STATE_ERR: DOM Exception 11');
				}
			} else {
				return valueAsDateDescriptor.set._polyfilled(elem, arguments);
			}
		}
	};
	
	webshims.defineNodeNameProperty('input', 'valueAsNumber', valueAsNumberDescriptor);
	webshims.defineNodeNameProperty('input', 'valueAsDate', valueAsDateDescriptor);
	
	
	var typeProtos = {
		
		number: {
			mismatch: function(val){
				return !(isNumber(val));
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor: 1,
			asNumber: function(str){
				return (isNumber(str)) ? str * 1 : nan;
			},
			numberToString: function(num){
				return (isNumber(num)) ? num : false;
			}
		},
		
		range: {
			minDefault: 0,
			maxDefault: 100
		},
		
		date: {
			mismatch: function(val){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				var valA = val.split(/\u002D/);
				if(valA.length !== 3){return true;}
				var ret = false;
				$.each(valA, function(i, part){
					if(!isDateTimePart(part)){
						ret = true;
						return false;
					}
				});
				if(ret){return ret;}
				if(valA[0].length !== 4 || valA[1].length != 2 || valA[1] > 12 || valA[2].length != 2 || valA[2] > 33){
					ret = true;
				}
				return (val !== this.dateToString( this.asDate(val, true) ) );
			},
			step: 1,
			//stepBase: 0, 0 = default
			stepScaleFactor:  86400000,
			asDate: function(val, _noMismatch){
				if(!_noMismatch && this.mismatch(val)){
					return null;
				}
				return new Date(this.asNumber(val, true));
			},
			asNumber: function(str, _noMismatch){
				var ret = nan;
				if(_noMismatch || !this.mismatch(str)){
					str = str.split(/\u002D/);
					ret = Date.UTC(str[0], str[1] - 1, str[2]);
				}
				return ret;
			},
			numberToString: function(num){
				return (isNumber(num)) ? this.dateToString(new Date( num * 1)) : false;
			},
			dateToString: function(date){
				return (date && date.getFullYear) ? date.getUTCFullYear() +'-'+ addleadingZero(date.getUTCMonth()+1, 2) +'-'+ addleadingZero(date.getUTCDate(), 2) : false;
			}
		},
		
		time: {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || !(/\d$/.test(val))){return true;}
				val = val.split(/\u003A/);
				if(val.length < 2 || val.length > 3){return true;}
				var ret = false,
					sFraction;
				if(val[2]){
					val[2] = val[2].split(/\u002E/);
					sFraction = parseInt(val[2][1], 10);
					val[2] = val[2][0];
				}
				$.each(val, function(i, part){
					if(!isDateTimePart(part) || part.length !== 2){
						ret = true;
						return false;
					}
				});
				if(ret){return true;}
				if(val[0] > 23 || val[0] < 0 || val[1] > 59 || val[1] < 0){
					return true;
				}
				if(val[2] && (val[2] > 59 || val[2] < 0 )){
					return true;
				}
				if(sFraction && isNaN(sFraction)){
					return true;
				}
				if(sFraction){
					if(sFraction < 100){
						sFraction *= 100;
					} else if(sFraction < 10){
						sFraction *= 10;
					}
				}
				return (_getParsed === true) ? [val, sFraction] : false;
			},
			step: 60,
			stepBase: 0,
			stepScaleFactor:  1000,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				val = this.mismatch(val, true);
				if(val !== true){
					ret = Date.UTC('1970', 0, 1, val[0][0], val[0][1], val[0][2] || 0);
					if(val[1]){
						ret += val[1];
					}
				}
				return ret;
			},
			dateToString: function(date){
				if(date && date.getUTCHours){
					var str = addleadingZero(date.getUTCHours(), 2) +':'+ addleadingZero(date.getUTCMinutes(), 2),
						tmp = date.getSeconds()
					;
					if(tmp != "0"){
						str += ':'+ addleadingZero(tmp, 2);
					}
					tmp = date.getUTCMilliseconds();
					if(tmp != "0"){
						str += '.'+ addleadingZero(tmp, 3);
					}
					return str;
				} else {
					return false;
				}
			}
		},
		
		'datetime-local': {
			mismatch: function(val, _getParsed){
				if(!val || !val.split || (val+'special').split(/\u0054/).length !== 2){return true;}
				val = val.split(/\u0054/);
				return ( typeModels.date.mismatch(val[0]) || typeModels.time.mismatch(val[1], _getParsed) );
			},
			noAsDate: true,
			asDate: function(val){
				val = new Date(this.asNumber(val));
				
				return (isNaN(val)) ? null : val;
			},
			asNumber: function(val){
				var ret = nan;
				var time = this.mismatch(val, true);
				if(time !== true){
					val = val.split(/\u0054/)[0].split(/\u002D/);
					
					ret = Date.UTC(val[0], val[1] - 1, val[2], time[0][0], time[0][1], time[0][2] || 0);
					if(time[1]){
						ret += time[1];
					}
				}
				return ret;
			},
			dateToString: function(date, _getParsed){
				return typeModels.date.dateToString(date) +'T'+ typeModels.time.dateToString(date, _getParsed);
			}
		}
	};
	
	if(!supportsType('number')){
		webshims.addInputType('number', typeProtos.number);
	}
	
	if(!supportsType('range')){
		webshims.addInputType('range', $.extend({}, typeProtos.number, typeProtos.range));
	}
	if(!supportsType('date')){
		webshims.addInputType('date', typeProtos.date);
	}
	if(!supportsType('time')){
		webshims.addInputType('time', $.extend({}, typeProtos.date, typeProtos.time));
	}
	
	if(!supportsType('datetime-local')){
		webshims.addInputType('datetime-local', $.extend({}, typeProtos.date, typeProtos.time, typeProtos['datetime-local']));
	}
	
	// add support for new input-types
	webshims.defineNodeNameProperty('input', 'type', {
		get: function(elem){
			var type = getType(elem);
			return (webshims.inputTypes[type]) ? type : elem.type || elem.getAttribute('type');
		}
	});
	
	webshims.createReadyEvent('form-number-date');
	
}, true);
/* number-date-ui */
/* https://github.com/aFarkas/webshim/issues#issue/23 */
jQuery.webshims.ready('form-number-date', function($, webshims, window, document){
	"use strict";
	
	var triggerInlineForm = webshims.triggerInlineForm;
	var adjustInputWithBtn = function(input, button){
		var inputDim = {
			w: input.width()
		};
		if(!inputDim.w){return;}
		var controlDim = {
			mL: (parseInt(button.css('marginLeft'), 10) || 0),
			w: button.outerWidth()
		};
		inputDim.mR = (parseInt(input.css('marginRight'), 10) || 0);
		if(inputDim.mR){
			input.css('marginRight', 0);
		}
		//is inside
		if( controlDim.mL <= (controlDim.w * -1) ){
			button.css('marginRight',  Math.floor(Math.abs(controlDim.w + controlDim.mL) + inputDim.mR));
			input.css('paddingRight', (parseInt(input.css('paddingRight'), 10) || 0) + Math.abs(controlDim.mL));
			input.css('width', Math.floor(inputDim.w + controlDim.mL));
		} else {
			button.css('marginRight', inputDim.mR);
			input.css('width',  Math.floor(inputDim.w - controlDim.mL - controlDim.w));
		}
	};
		
	var options = $.webshims.modules.inputUI.options;
	var globalInvalidTimer;
	var labelID = 0;
	var emptyJ = $([]);
	var support = $.support;
	var replaceInputUI = function(context, elem){
		$('input', context).add(elem.filter('input')).each(function(){
			var type = $.attr(this, 'type');
			if(replaceInputUI[type]  && !$.data(this, 'inputUIReplace')){
				replaceInputUI[type]($(this));
			}
		});
	};
	
	replaceInputUI.common = function(orig, shim, methods){
		if(options.replaceNative){
			(function(){
				var events = [];
				var timer;
				var throwError = function(e){
					if(!$.data(e.target, 'maybePreventedinvalid') && (!events[0] || !events[0].isDefaultPrevented()) && (!events[1] || !events[1].isDefaultPrevented()) ){
						var elem = e.target;
						var name = elem.nodeName;
						if(elem.id){
							name += '#'+elem.id;
						}
						if(elem.name){
							name += '[name="'+ elem.name +'"]';
						}
						if(elem.className){
							name += '.'+ (elem.className.split(' ').join('.'));
						}
						throw(name +' can not be focused. handle the invalid event.');
					}
				};
				orig.bind('firstinvalid', function(e){
					clearTimeout(timer);
					events.push(e);
					timer = setTimeout(function(){
						throwError(e);
						events = [];
					}, 30);
				});
			})();
		} else if(support.validity){
			orig.bind('firstinvalid', function(e){
				clearTimeout(globalInvalidTimer);
				globalInvalidTimer = setTimeout(function(){
					if(!$.data(e.target, 'maybePreventedinvalid') && !e.isDefaultPrevented()){
						webshims.validityAlert.showFor( e.target ); 
					}
				}, 30);
			});
		}
		var id = orig.attr('id'),
			attr = {
				css: {
					marginRight: orig.css('marginRight'),
					marginLeft: orig.css('marginLeft')
				},
				outerWidth: orig.outerWidth(),
				label: (id) ? $('label[for="'+ id +'"]', orig[0].form) : emptyJ
			},
			curLabelID =  webshims.getID(attr.label)
		;
		shim.addClass(orig[0].className).data('html5element', orig);
		orig
			.after(shim)
			.data('inputUIReplace', {visual: shim, methods: methods})
			.hide()
		;
		
		if(shim.length == 1 && !$('*', shim)[0]){
			shim.attr('aria-labeledby', curLabelID);
			attr.label.bind('click', function(){
				shim.focus();
				return false;
			});
		}
		return attr;
	};
	
	//date and datetime-local implement if we have to replace
	if(!support.dateUI || options.replaceNative){
		var datetimeFactor = {
			trigger: [0.65,0.35],
			normal: [0.6,0.4]
		};
		var subPixelCorrect = (!$.browser.msie || parseInt($.browser.version, 10) > 6) ? 0 : 0.45;
		replaceInputUI['datetime-local'] = function(elem){
			if(!$.fn.datepicker){return;}
			var date = $('<span role="group" class="input-datetime-local"><input type="text" class="input-datetime-local-date" /><input type="time" class="input-datetime-local-time" /></span>'),
				attr  = this.common(elem, date, replaceInputUI['datetime-local'].attrs),
				datePicker = $('input.input-datetime-local-date', date),
				data = datePicker
					.datepicker($.extend({}, options.datepicker, elem.data('datepicker')))
					.bind('change', function(e){
						
						var value = datePicker.attr('value'), 
							timeVal = $('input.input-datetime-local-time', date).attr('value')
						;
						if(value){
							try {
								value = $.datepicker.parseDate(datePicker.datepicker('option', 'dateFormat'), value);
								value = (value) ? $.datepicker.formatDate('yy-mm-dd', value) : datePicker.attr('value');
							} catch (e) {value = datePicker.attr('value');}
							if (!timeVal) {
								timeVal = '00:00';
								$('input.input-datetime-local-time', date).attr('value', timeVal);
							}
						} 
						value = (!value && !timeVal) ? '' : value + 'T' + timeVal;
						replaceInputUI['datetime-local'].blockAttr = true;
						elem.attr('value', value);
						replaceInputUI['datetime-local'].blockAttr = false;
						e.stopImmediatePropagation();
						triggerInlineForm(elem[0], 'input');
						triggerInlineForm(elem[0], 'change');
					})
					.data('datepicker')
			;
			
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: datePicker.css('fontSize'),
					fontFamily: datePicker.css('fontFamily')
				})
			;
			$('input.input-datetime-local-time', date).bind('change', function(e){
				var timeVal = $.attr(this, 'value');
				var val = elem.attr('value').split('T');
				if(timeVal && (val.length < 2 || !val[0])){
					val[0] = $.datepicker.formatDate('yy-mm-dd', new Date());
				}
				val[1] = timeVal;
				
				if (timeVal) {
					try {
						datePicker.attr('value', $.datepicker.formatDate(datePicker.datepicker('option', 'dateFormat'), $.datepicker.parseDate('yy-mm-dd', val[0])));
					} catch (e) {}
				}
				val = (!val[0] && !val[1]) ? '' : val.join('T');
				replaceInputUI['datetime-local'].blockAttr = true;
				elem.attr('value', val);
				replaceInputUI['datetime-local'].blockAttr = false;
				e.stopImmediatePropagation();
				triggerInlineForm(elem[0], 'input');
				triggerInlineForm(elem[0], 'change');
			});
			
			$('input', date).data('html5element', $.data(date[0], 'html5element'));
			
			date.attr('aria-labeledby', attr.label.attr('id'));
			attr.label.bind('click', function(){
				datePicker.focus();
				return false;
			});
			
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
					var width = date.width();
					var widthFac = (data.trigger[0]) ? datetimeFactor.trigger : datetimeFactor.normal;
					datePicker.outerWidth(Math.floor((width * widthFac[0]) - subPixelCorrect), true);
					$('input.input-datetime-local-time', date).outerWidth(Math.floor((width * widthFac[1]) - subPixelCorrect), true);
					if(data.trigger[0]){
						adjustInputWithBtn(datePicker, data.trigger);
					}
				}
			}
			
			webshims.triggerDomUpdate(date[0]);
			
			$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI['datetime-local'].attrs = {
			disabled: function(orig, shim, value){
				$('input.input-datetime-local-date', shim).datepicker('option', 'disabled', !!value);
				$('input.input-datetime-local-time', shim).attr('disabled', !!value);
			},
			step: function(orig, shim, value){
				$('input.input-datetime-local-time', shim).attr('step', value);
			},
			//ToDo: use min also on time
			min: function(orig, shim, value){
				value = (value.split) ? value.split('T') : [];
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){value = false;}
				if(value){
					$('input.input-datetime-local-date', shim).datepicker('option', 'minDate', value);
				}
			},
			//ToDo: use max also on time
			max: function(orig, shim, value){
				value = (value.split) ? value.split('T') : [];
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value[0]);
				} catch(e){value = false;}
				if(value){
					$('input.input-datetime-local-date', shim).datepicker('option', 'maxDate', value);
				}
			},
			value: function(orig, shim, value){
				if(!replaceInputUI['datetime-local'].blockAttr){
					var dateValue;
					value = (value.split) ? value.split('T') : [];
					try {
						dateValue = $.datepicker.parseDate('yy-mm-dd', value[0]);
					} catch(e){dateValue = false;}
					if(dateValue){
						$('input.input-datetime-local-date', shim).datepicker('setDate', dateValue);
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '00:00');
					} else {
						$('input.input-datetime-local-date', shim).attr('value', value[0] || '');
						$('input.input-datetime-local-time', shim).attr('value', value[1] || '');
					}
					
				}
			}
		};
		
		replaceInputUI.date = function(elem){
			if(!$.fn.datepicker){return;}
			var date = $('<input type="text" class="input-date" />'),
				attr  = this.common(elem, date, replaceInputUI.date.attrs),
				change = function(e){
					replaceInputUI.date.blockAttr = true;
					var value;
					try {
						value = $.datepicker.parseDate(date.datepicker('option', 'dateFormat'), date.attr('value') );
						value = (value) ? $.datepicker.formatDate( 'yy-mm-dd', value ) : date.attr('value');
					} catch(e){
						value = date.attr('value');
					}
					elem.attr('value', value);
					replaceInputUI.date.blockAttr = false;
					e.stopImmediatePropagation();
					triggerInlineForm(elem[0], 'input');
					triggerInlineForm(elem[0], 'change');
				},
				data = date
					.datepicker($.extend({}, options.datepicker, elem.data('datepicker')))
					.bind('change', change)
					.data('datepicker')
					
			
			;
			data.dpDiv
				.addClass('input-date-datepicker-control')
				.css({
					fontSize: date.css('fontSize'),
					fontFamily: date.css('fontFamily')
				})
			;
			if(attr.css){
				date.css(attr.css);
				if(attr.outerWidth){
					date.outerWidth(attr.outerWidth);
				}
				if(data.trigger[0]){
					adjustInputWithBtn(date, data.trigger);
				}
			}
			
			$.each(['disabled', 'min', 'max', 'value'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI.date.attrs = {
			disabled: function(orig, shim, value){
				shim.datepicker('option', 'disabled', !!value);
			},
			min: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					shim.datepicker('option', 'minDate', value);
				}
			},
			max: function(orig, shim, value){
				try {
					value = $.datepicker.parseDate('yy-mm-dd', value);
				} catch(e){value = false;}
				if(value){
					shim.datepicker('option', 'maxDate', value);
				}
			},
			value: function(orig, shim, value){
				if(!replaceInputUI.date.blockAttr){
					try {
						var dateValue = $.datepicker.parseDate('yy-mm-dd', value);
					} catch(e){var dateValue = false;}
					if(dateValue){
						shim.datepicker('setDate', dateValue);
					} else {
						shim.attr('value', value);
					}
				}
			}
		};
	}
	
	if (!support.rangeUI || options.replaceNative) {
		replaceInputUI.range = function(elem){
			if(!$.fn.slider){return;}
			var range = $('<span class="input-range"><span class="ui-slider-handle" role="slider" tabindex="0" /></span>'),
				attr  = this.common(elem, range, replaceInputUI.range.attrs),
				change = function(e, ui){
					if(e.originalEvent){
						replaceInputUI.range.blockAttr = true;
						elem.attr('value', ui.value);
						replaceInputUI.range.blockAttr = false;
						if(e.type == 'slidechange'){
							triggerInlineForm(elem[0], 'change');
						} else {
							triggerInlineForm(elem[0], 'input');
						}
					}
				}
			;
			
			$('span', range).attr('aria-labeledby', attr.label.attr('id'));
			attr.label.bind('click', function(){
				$('span', range).focus();
				return false;
			});
			
			if(attr.css){
				range.css(attr.css);
				if(attr.outerWidth){
					range.outerWidth(attr.outerWidth);
				}
			}
			range.slider($.extend({}, options.slider, elem.data('slider'), {
				change: change,
				slide: change
			}));
			
			$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, name){
				elem.attr(name, function(i, value){return value || '';});
			});
		};
		
		replaceInputUI.range.attrs = {
			disabled: function(orig, shim, value){
				value = !!value;
				shim.slider( "option", "disabled", value );
				$('span', shim)
					.attr({
						'aria-disabled': value+'',
						'tabindex': (value) ? '-1' : '0'
					})
				;
			},
			min: function(orig, shim, value){
				value = (value) ? value * 1 || 0 : 0;
				shim.slider( "option", "min", value );
				$('span', shim).attr({'aria-valuemin': value});
			},
			max: function(orig, shim, value){
				value = (value || value === 0) ? value * 1 || 100 : 100;
				shim.slider( "option", "max", value );
				$('span', shim).attr({'aria-valuemax': value});
			},
			value: function(orig, shim, value){
				value = $(orig).attr('valueAsNumber');
				if(isNaN(value)){
					value = (shim.slider('option', 'max') - shim.slider('option', 'min')) / 2;
					orig.value = value;
				}
				if(!replaceInputUI.range.blockAttr){
					shim.slider( "option", "value", value );
				}
				$('span', shim).attr({'aria-valuenow': value, 'aria-valuetext': value});
			},
			step: function(orig, shim, value){
				value = (value && $.trim(value)) ? value * 1 || 1 : 1;
				shim.slider( "option", "step", value );
			}
		};
	}
	
	$.each(['disabled', 'min', 'max', 'value', 'step'], function(i, attr){
		webshims.onNodeNamesPropertyModify('input', attr, {
			set: function(elem, val){
				var widget = $.data(elem, 'inputUIReplace');
				if(widget && widget.methods[attr]){
					widget.methods[attr](elem, widget.visual, val);
				}
			}
		});
	});
	
		
	var changeDefaults = function(langObj){
		if(!langObj){return;}
		var opts = $.extend({}, langObj, options.date);
		$('input.hasDatepicker').filter('.input-date, .input-datetime-local-date').datepicker('option', opts).each(function(){
			var orig = $.data(this, 'html5element');
			if(orig){
				$.each(['disabled', 'min', 'max', 'value'], function(i, name){
					orig.attr(name, function(i, value){return value || '';});
				});
			}
		});
		$.datepicker.setDefaults(opts);
	};
	
	$(document).bind('jquery-uiReady.langchange input-widgetsReady.langchange', function(){
		if(!$.datepicker){return;}
		$(document)
			.bind('htmlExtLangChange', function(){
				webshims.activeLang($.datepicker.regional, 'inputUI', changeDefaults);
			})
			.unbind('jquery-uiReady.langchange input-widgetsReady.langchange')
		;
	});
	
	webshims.addReady(function(context, elem){
		$(document).bind('jquery-uiReady.initinputui input-widgetsReady.initinputui', function(){
			if($.datepicker || $.fn.slider){
				replaceInputUI(context, elem);
			}
			if($.datepicker && $.fn.slider){
				$(document).unbind('jquery-uiReady.initinputui input-widgetsReady.initinputui');
			}
			if(context === document){
				webshims.createReadyEvent('inputUI');
			}
		});
	});
	
	
	//implement set/arrow controls
(function(){
	if(support.numericDateProps || !webshims.modules['form-number-date']){return;}
	var doc = document;
	var options = webshims.modules['form-number-date'].options;
	var typeModels = webshims.inputTypes;
	var getNextStep = function(input, upDown, cache){
		
		cache = cache || {};
		
		if( !('type' in cache) ){
			cache.type = $.attr(input, 'type');
		}
		if( !('step' in cache) ){
			cache.step = webshims.getStep(input, cache.type);
		}
		if( !('valueAsNumber' in cache) ){
			cache.valueAsNumber = typeModels[cache.type].asNumber($.attr(input, 'value'));
		}
		var delta = (cache.step == 'any') ? typeModels[cache.type].step * typeModels[cache.type].stepScaleFactor : cache.step,
			ret
		;
		webshims.addMinMaxNumberToCache('min', $(input), cache);
		webshims.addMinMaxNumberToCache('max', $(input), cache);
		
		if(isNaN(cache.valueAsNumber)){
			cache.valueAsNumber = typeModels[cache.type].stepBase || 0;
		}
		//make a valid step
		if(cache.step !== 'any'){
			ret = Math.round( ((cache.valueAsNumber - (cache.minAsnumber || 0)) % cache.step) * 1e7 ) / 1e7;
			if(ret &&  Math.abs(ret) != cache.step){
				cache.valueAsNumber = cache.valueAsNumber - ret;
			}
		}
		ret = cache.valueAsNumber + (delta * upDown);
		//using NUMBER.MIN/MAX is really stupid | ToDo: either use disabled state or make this more usable
		if(!isNaN(cache.minAsNumber) && ret < cache.minAsNumber){
			ret = (cache.valueAsNumber * upDown  < cache.minAsNumber) ? cache.minAsNumber : isNaN(cache.maxAsNumber) ? Number.MAX_VALUE : cache.maxAsNumber;
		} else if(!isNaN(cache.maxAsNumber) && ret > cache.maxAsNumber){
			ret = (cache.valueAsNumber * upDown > cache.maxAsNumber) ? cache.maxAsNumber : isNaN(cache.minAsNumber) ? Number.MIN_VALUE : cache.minAsNumber;
		}
		return Math.round( ret * 1e7)  / 1e7;
	};
	
	webshims.modules['form-number-date'].getNextStep = getNextStep;
	
	var doSteps = function(input, type, control){
		if(input.disabled || input.readOnly || $(control).hasClass('step-controls')){return;}
		$.attr(input, 'value',  typeModels[type].numberToString(getNextStep(input, ($(control).hasClass('step-up')) ? 1 : -1, {type: type})));
		$(input).unbind('blur.stepeventshim');
		triggerInlineForm(input, 'input');
		
		
		if( doc.activeElement ){
			if(doc.activeElement !== input){
				try {input.focus();} catch(e){}
			}
			setTimeout(function(){
				if(doc.activeElement !== input){
					try {input.focus();} catch(e){}
				}
				$(input)
					.one('blur.stepeventshim', function(){
						triggerInlineForm(input, 'change');
					})
				;
			}, 0);
			
		}
	};
	
	
	if(options.stepArrows){
		
		webshims.onNodeNamesPropertyModify('input', 'disabled', {
			// don't change getter
			set: function(elem, value){
				var stepcontrols = $.data(elem, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		});
		webshims.onNodeNamesPropertyModify('input', 'readonly', {
			// don't change getter
			set: function(elem, value){
				var stepcontrols = $.data(elem, 'step-controls');
				if(stepcontrols){
					stepcontrols[ (elem.disabled || elem.readonly) ? 'addClass' : 'removeClass' ]('disabled-step-control');
				}
			}
		});
	}
	var stepKeys = {
		38: 1,
		40: -1
	};
	webshims.addReady(function(context, contextElem){
		//ui for numeric values
		if(options.stepArrows){
			$('input', context).add(contextElem.filter('input')).each(function(){
				var type = $.attr(this, 'type');
				if(!typeModels[type] || !typeModels[type].asNumber || !options.stepArrows || (options.stepArrows !== true && !options.stepArrows[type]) || $(this).hasClass('has-step-controls')){return;}
				var elem = this;
				var controls = $('<span class="step-controls" unselectable="on"><span class="step-up" /><span class="step-down" /></span>')	
					.insertAfter(this)
					.bind('selectstart dragstart', function(){return false;})
					.bind('mousedown mousepress', function(e){
						doSteps(elem, type, e.target);
						return false;
					})
				;
				var jElm = $(this)
					.addClass('has-step-controls')
					.data('step-controls', controls)
					.attr({
						readonly: this.readOnly,
						disabled: this.disabled,
						autocomplete: 'off',
						role: 'spinbutton'
					})
					.bind(($.browser.msie) ? 'keydown' : 'keypress', function(e){
						if(this.disabled || this.readOnly || !stepKeys[e.keyCode]){return;}
						$.attr(this, 'value',  typeModels[type].numberToString(getNextStep(this, stepKeys[e.keyCode], {type: type})));
						triggerInlineForm(this, 'input');
						return false;
					})
				;
				
				if(options.calculateWidth){
					adjustInputWithBtn(jElm, controls);
					controls.css('marginTop', (jElm.outerHeight() - controls.outerHeight())  / 2 );
				}
			});
		}
	});
})();
	
}, true);

/*
 * HTML5 placeholder-enhancer
 * version: 2.0.2
 * including a11y-name fallback
 * 
 * 
 */


jQuery.webshims.ready('es5', function($, webshims, window, doc, undefined){
	if($.support.placeholder){return;}
	var hidePlaceholder = function(elem, data, value){
			if(elem.type != 'password'){
				if(value === false){
					value = $.attr(elem, 'value');
				}
				elem.value = value;
			}
			data.box.removeClass('placeholder-visible');
		},
		showPlaceholder = function(elem, data, placeholderTxt){
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			
			if(elem.type != 'password'){
				elem.value = placeholderTxt;
			}
			data.box.addClass('placeholder-visible');
		},
		changePlaceholderVisibility = function(elem, value, placeholderTxt, data, type){
			if(!data){
				data = $.data(elem, 'placeHolder');
				if(!data){return;}
			}
			if(type == 'focus' || (!type && elem === document.activeElement)){
				if(elem.type == 'password' || $(elem).hasClass('placeholder-visible')){
					hidePlaceholder(elem, data, '');
				}
				return;
			}
			if(value === false){
				value = $.attr(elem, 'value');
			}
			if(value){
				hidePlaceholder(elem, data, value);
				return;
			}
			if(placeholderTxt === false){
				placeholderTxt = $.attr(elem, 'placeholder') || '';
			}
			if(placeholderTxt && !value){
				showPlaceholder(elem, data, placeholderTxt);
			} else {
				hidePlaceholder(elem, data, value);
			}
		},
		createPlaceholder = function(elem){
			elem = $(elem);
			var id 			= elem.attr('id'),
				hasLabel	= !!(elem.attr('title') || elem.attr('aria-labeledby')),
				pHolderTxt
			;
			if(!hasLabel && id){
				hasLabel = !!( $('label[for="'+ id +'"]', elem[0].form)[0] );
			}
			return $( hasLabel ? '<span class="placeholder-text"></span>' : '<label for="'+ (id || $.webshims.getID(elem)) +'" class="placeholder-text"></label>');
		},
		pHolder = (function(){
			var delReg 	= /\n|\r|\f|\t/g,
				allowedPlaceholder = {
					text: 1,
					search: 1,
					url: 1,
					email: 1,
					password: 1,
					tel: 1
				}
			;
			
			return {
				create: function(elem){
					var data = $.data(elem, 'placeHolder');
					if(data){return data;}
					data = $.data(elem, 'placeHolder', {
						text: createPlaceholder(elem)
					});
					
					$(elem).bind('focus.placeholder blur.placeholder', function(e){
						changePlaceholderVisibility(this, false, false, data, e.type );
					});
					
					if(elem.type == 'password'){
						data.box = $(elem)
							.wrap('<span class="placeholder-box placeholder-box-'+ (elem.nodeName || '').toLowerCase() +'" />')
							.parent()
						;
	
						data.text
							.insertAfter(elem)
							.bind('mousedown.placeholder', function(){
								changePlaceholderVisibility(this, false, false, data, 'focus' );
								elem.focus();
								return false;
							})
						;
						
						
		
						$.each(['Left', 'Top'], function(i, side){
							var size = (parseInt($.curCSS(elem, 'padding'+ side), 10) || 0) + Math.max((parseInt($.curCSS(elem, 'margin'+ side), 10) || 0), 0) + (parseInt($.curCSS(elem, 'border'+ side +'Width'), 10) || 0);
							data.text.css('padding'+ side, size);
						});
						var lineHeight 	= $.curCSS(elem, 'lineHeight'),
							dims 		= {
								width: $(elem).width(),
								height: $(elem).height()
							},
							cssFloat 		= $.curCSS(elem, 'float')
						;
						$.each(['lineHeight', 'fontSize', 'fontFamily', 'fontWeight'], function(i, style){
							var prop = $.curCSS(elem, style);
							if(data.text.css(style) != prop){
								data.text.css(style, prop);
							}
						});
						
						if(dims.width && dims.height){
							data.text.css(dims);
						}
						if(cssFloat !== 'none'){
							data.box.addClass('placeholder-box-'+cssFloat);
						}
					} else {
						var reset = function(e){
							if($(elem).hasClass('placeholder-visible')){
								hidePlaceholder(elem, data, '');
								if(e && e.type == 'submit'){
									setTimeout(function(){
										if(e.isDefaultPrevented()){
											changePlaceholderVisibility(elem, false, false, data );
										}
									}, 9);
								}
							}
						};
						if($.nodeName(data.text[0], 'label')){
							//if label is dynamically set after we ensure that our label isn't exposed anymore
							//ie always exposes last label and ff always first
							data.text.hide()[$.browser.msie ? 'insertBefore' : 'insertAfter'](elem);
						}
						$(window).bind('beforeunload', reset);
						data.box = $(elem);
						if(elem.form){
							$(elem.form).submit(reset);
						}
					}
					
					return data;
				},
				update: function(elem, val){
					if(!allowedPlaceholder[$.attr(elem, 'type')] && !$.nodeName(elem, 'textarea')){return;}
					if($.nodeName(elem, 'input')){
						val = val.replace(delReg, '');
					}
					var data = pHolder.create(elem);
					if(webshims.contentAttr(elem, 'placeholder') != val){
						webshims.contentAttr(elem, 'placeholder', val);
					}
					data.text.text(val);
					
					changePlaceholderVisibility(elem, false, val, data);
				}
			};
		})()
	;
	
	$.webshims.publicMethods = {
		pHolder: pHolder
	};
	
	webshims.defineNodeNamesProperty(['input', 'textarea'], 'placeholder', {
		set: function(elem, val){
			pHolder.update(elem, val);
		},
		get: function(elem){
			return webshims.contentAttr(elem, 'placeholder') || '';
		},
		init: true
	});
			
	$.each(['input', 'textarea'], function(i, name){
		var desc = webshims.defineNodeNameProperty(name, 'value', {
			set: function(elem, val){
				var placeholder = webshims.contentAttr(elem, 'placeholder');
				if(placeholder && 'value' in elem){
					changePlaceholderVisibility(elem, val, placeholder);
				}
				return desc.set._polyfilled(elem, val);
			},
			get: function(elem){
				return $(elem).hasClass('placeholder-visible') ? '' : desc.get._polyfilled(elem);
			}
		});
	});
	
	
	
	var oldVal = $.fn.val;
	$.fn.val = function(val){
		if(val !== undefined){
			var process = (val === '') ? 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if($.nodeName(this, 'select') || !placeholder){
							oldVal.call($(this), '');
							return;
						}
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
						if(this.type == 'password'){
							oldVal.call($(this), '');
						}
					}
				} : 
				function(){
					if( this.nodeType === 1 ){
						var placeholder = this.getAttribute('placeholder');
						if(placeholder && 'value' in this){
							changePlaceholderVisibility(this, val, placeholder);
						}
					}
				}
			;
			this.each(process);
			if(val === ''){return this;}
		} else if(this[0] && this[0].nodeType == 1 && this.hasClass('placeholder-visible')) {
			return '';
		}
		return oldVal.apply(this, arguments);
	};
	
});
jQuery.webshims.ready('form-core', function($, webshims, window, document, undefined){
	var doc = document;	
	
	(function(){
		var elements = {
				input: 1,
				textarea: 1
			},
			noInputTriggerEvts = {updateInput: 1, input: 1},
			noInputTypes = {
				radio: 1,
				checkbox: 1,
				submit: 1,
				button: 1,
				image: 1,
				reset: 1
				
				//pro forma
				,color: 1
				//,range: 1
			},
			observe = function(input){
				var timer,
					lastVal = input.attr('value'),
					trigger = function(e){
						//input === null
						if(!input){return;}
						var newVal = input.attr('value');
						
						if(newVal !== lastVal){
							lastVal = newVal;
							if(!e || !noInputTriggerEvts[e.type]){
								webshims.triggerInlineForm(input[0], 'input');
							}
						}
					},
					unbind = function(){
						input.unbind('focusout', unbind).unbind('input', trigger).unbind('updateInput', trigger);
						clearInterval(timer);
						trigger();
						input = null;
					}
				;
				
				clearInterval(timer);
				timer = setInterval(trigger, ($.browser.mozilla) ? 250 : 111);
				setTimeout(trigger, 9);
				input.bind('focusout', unbind).bind('input updateInput', trigger);
			}
		;
			
		
		$(doc)
			.bind('focusin', function(e){
				if( e.target && e.target.type && !e.target.readonly && !e.target.readOnly && !e.target.disabled && elements[(e.target.nodeName || '').toLowerCase()] && !noInputTypes[e.target.type] ){
					observe($(e.target));
				}
			})
		;
	})();
	
	(function(){
		if( 'value' in document.createElement('output') ){return;}
		var outputCreate = function(elem){
			if(elem.getAttribute('aria-live')){return;}
			elem = $(elem);
			var value = (elem.text() || '').trim();
			var	id 	= elem.attr('id');
			var	htmlFor = elem.attr('for');
			var shim = $('<input class="output-shim" type="hidden" name="'+ (elem.attr('name') || '')+'" value="'+value+'" style="display: none" />').insertAfter(elem);
			var form = shim[0].form || doc;
			var setValue = function(val){
				shim[0].value = val;
				val = shim[0].value;
				elem.text(val);
				webshims.contentAttr(elem[0], 'value', val);
			};
			
			elem[0].defaultValue = value;
			webshims.contentAttr(elem[0], 'value', value);
			
			elem.attr({'aria-live': 'polite'});
			if(id){
				shim.attr('id', id);
				elem.attr('aria-labeldby', webshims.getID($('label[for="'+id+'"]', form)));
			}
			if(htmlFor){
				id = webshims.getID(elem);
				htmlFor.split(' ').forEach(function(control){
					control = form.getElementById(control);
					if(control){
						control.setAttribute('aria-controls', id);
					}
				});
			}
			elem.data('outputShim', setValue );
			shim.data('outputShim', setValue );
			return setValue;
		};
		
		webshims.defineNodeNameProperty('output', 'value', {
			set: function(elem, value){
				var setVal = $.data(elem, 'outputShim');
				if(!setVal){
					setVal = outputCreate(elem);
				}
				setVal(value);
			},
			get: function(elem){
				return webshims.contentAttr(elem, 'value') || $(elem).text() || '';
			}
		});
		
		webshims.onNodeNamesPropertyModify('input', 'value', {
			set: function(elem, value){
				var setVal = $.data(elem, 'outputShim');
				if(setVal){
					setVal(value);
					return value;
				}
				$(elem).triggerHandler('updateInput');
			}
		
		});
		
		webshims.addReady(function(context, contextElem){
			$('output', context).add(contextElem.filter('output')).each(function(){
				outputCreate(this);
			});
		});
	})();
	
	(function(){
		if($.support.datalist){return;}
		var listidIndex = 0;
		
		var noDatalistSupport = {
			submit: 1,
			button: 1,
			reset: 1, 
			hidden: 1,
			
			//ToDo
			range: 1,
			date: 1
		};
		var noMin = ($.browser.msie && parseInt($.browser.version, 10) < 7);
		
		var getStoredOptions = function(name){
			if(!name){return [];}
			var data;
			try {
				data = JSON.parse(localStorage.getItem('storedDatalistOptions'+name));
			} catch(e){}
			return data || [];
		};
		var storeOptions = function(name, val){
			if(!name){return;}
			val = val || [];
			try {
				localStorage.setItem( 'storedDatalistOptions'+name, JSON.stringify(val) );
			} catch(e){}
		};
		var getType = function(elem){
			return (elem.getAttribute('type') || '').toLowerCase() || elem.type;
		};
		var getText = function(elem){
			return (elem.textContent || elem.innerText || $.text([ elem ]) || '');
		};
		
		//ToDo: It's a little bit to complex, maintainability isn't good		
		var dataListProto = {
			_create: function(opts){
				var datalist = opts.datalist || opts.id && document.getElementById(opts.id);
				if(noDatalistSupport[getType(opts.input)]){return;}
				var data = $.data(opts.input, 'datalistWidget');
				if(datalist && data && (data.datalist !== datalist)){
					data.datalist = datalist;
					data.id = opts.id;
					data._resetListCached();
					return;
				} else if(!datalist){
					if(data){
						data.destroy();
					}
					return;
				}
				listidIndex++;
				var that = this;
				this.timedHide = function(){
					clearTimeout(that.hideTimer);
					that.hideTimer = setTimeout($.proxy(that, 'hideList'), 9);
				};
				this.datalist = datalist;
				this.id = opts.id;
				this.lazyIDindex = listidIndex;
				this.hasViewableData = true;
				this._autocomplete = $.attr(opts.input, 'autocomplete');
				$.data(opts.input, 'datalistWidget', this);
				this.shadowList = $('<div class="datalist-polyfill" />').appendTo('body');
				this.index = -1;
				this.input = opts.input;
				this.arrayOptions = [];
				
				
				this.shadowList
					.delegate('li', 'mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget', function(e){
						var items = $('li:not(.hidden-item)', that.shadowList);
						var select = (e.type == 'mousedown' || e.type == 'click');
						that.markItem(items.index(e.target), select, items);
						if(e.type == 'click'){
							that.hideList();
						}
						return (e.type != 'mousedown');
					})
					.bind('focusout', this.timedHide)
				;
				
				opts.input.setAttribute('autocomplete', 'off');
				
				$(opts.input)
					.attr({
						//role: 'combobox',
						'aria-haspopup': 'true'
					})
					.bind('input.datalistWidget', $.proxy(this, 'showHideOptions'))
					.bind('keydown.datalistWidget', function(e){
						var keyCode = e.keyCode;
						var items;
						if(keyCode == 40 && !that.showList()){
							that.markItem(that.index + 1, true);
							return false;
						}
						 
						if(!that.isListVisible){return;}
						
						 
						if(keyCode == 38){
							that.markItem(that.index - 1, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 33 || keyCode == 36)){
							that.markItem(0, true);
							return false;
						} 
						if(!e.shiftKey && (keyCode == 34 || keyCode == 35)){
							items = $('li:not(.hidden-item)', that.shadowList);
							that.markItem(items.length - 1, true, items);
							return false;
						} 
						if(keyCode == 13 || keyCode == 27){
							that.hideList();
							return false;
						}
		
					})
					.bind('blur.datalistWidget', this.timedHide)
				;
				
				$(this.datalist)
					.unbind('updateDatalist.datalistWidget')
					.bind('updateDatalist.datalistWidget', $.proxy(this, '_resetListCached'))
				;
				
				this._resetListCached();
				
				if(opts.input.form && opts.input.id){
					$(opts.input.form).bind('submit.datalistWidget'+opts.input.id, function(){
						var val = $.attr(opts.input, 'value');
						that.storedOptions = that.storedOptions || getStoredOptions(opts.input.name || opts.input.id);
						if(val && $.inArray(val, that.storedOptions) == -1){
							that.storedOptions.push(val);
							storeOptions(opts.input.name || opts.input.id, that.storedOptions );
						}
					});
				}
			},
			destroy: function(){
				var autocomplete = $.attr(this.input, 'autocomplete');
				$(this.input)
					.unbind('.datalistWidget')
					.removeData('datalistWidget')
				;
				this.shadowList.remove();
				$(document).unbind('.datalist'+this.id);
				if(this.input.form && this.input.id){
					$(this.input.form).unbind('submit.datalistWidget'+this.input.id);
				}
				this.input.removeAttribute('aria-haspopup');
				if(autocomplete === undefined){
					this.input.removeAttribute('autocomplete');
				} else {
					$(this.input).attr('autocomplete', autocomplete);
				}
			},
			_resetListCached: function(){
				var that = this;
				this.needsUpdate = true;
				this.lastUpdatedValue = false;
				this.lastUnfoundValue = '';
				
				
				clearTimeout(this.updateTimer);
				this.updateTimer = setTimeout(function(){
					that.updateListOptions();
				}, this.isListVisible ? 0 : 20 * this.lazyIDindex);
			},
			updateListOptions: function(){
				this.needsUpdate = false;
				clearTimeout(this.updateTimer);
				this.shadowList.css({
					fontSize: $.curCSS(this.input, 'fontSize'),
					fontFamily: $.curCSS(this.input, 'fontFamily')
				});
				var list = '<ul role="list" class="'+ (this.datalist.className || '') +'">';
				
				var values = [];
				var allOptions = [];
				$('option', this.datalist).each(function(i){
					if(this.disabled){return;}
					var item = {
						value: $(this).val(),
						text: $.trim($.attr(this, 'label') || getText(this)),
						className: this.className || '',
						style: $.attr(this, 'style') || ''
					};
					if(!item.text){
						item.text = item.value;
					}
					values[i] = item.value;
					allOptions[i] = item;
				});
				this.storedOptions = this.storedOptions || getStoredOptions(this.input.name || this.input.id);
				this.storedOptions.forEach(function(val, i){
					if($.inArray(val, values) == -1){
						allOptions.push({value: val, text: val, className: '', style: ''});
					}
				});
				
				allOptions.forEach(function(item, i){
					list += '<li data-value="'+item.value+'" class="'+ item.className +'" style="'+ item.style +'" tabindex="-1" role="listitem">'+ item.text +'</li>';
				});
				
				list += '</ul>';
				this.arrayOptions = allOptions;
				this.shadowList.html(list);
				if(this.isListVisible){
					this.showHideOptions();
				}
			},
			showHideOptions: function(){
				var value = $.attr(this.input, 'value').toLowerCase();
				//first check prevent infinite loop, second creates simple lazy optimization
				if(value === this.lastUpdatedValue || (this.lastUnfoundValue && value.indexOf(this.lastUnfoundValue) === 0)){
					return;
				}
				this.lastUpdatedValue = value;
				var found = false;
				var lis = $('li', this.shadowList);
				if(value){
					this.arrayOptions.forEach(function(item, i){
						if(!('lowerText' in item)){
							item.lowerText = item.text.toLowerCase();
							item.lowerValue = item.value.toLowerCase();
						}
						
						if(item.lowerText.indexOf(value) !== -1 || item.lowerValue.indexOf(value) !== -1){
							$(lis[i]).removeClass('hidden-item');
							found = true;
						} else {
							$(lis[i]).addClass('hidden-item');
						}
					});
				} else {
					lis.removeClass('hidden-item');
					found = true;
				}
				
				this.hasViewableData = found;
				
				if(found){
					this.showList();
				} else {
					this.lastUnfoundValue = value;
					this.hideList();
				}
			},
			showList: function(){
				if(this.isListVisible){return false;}
				if(this.needsUpdate){
					this.updateListOptions();
				}
				this.showHideOptions();
				if(!this.hasViewableData){return false;}
				var that = this;
				var css = $(this.input).offset();
				css.top += $(this.input).outerHeight();
				
				css.width = $(this.input).outerWidth() - (parseInt(this.shadowList.css('borderLeftWidth'), 10)  || 0) - (parseInt(this.shadowList.css('borderRightWidth'), 10)  || 0);
				
				if(noMin){
					this.shadowList.css('height', 'auto');
					if(this.shadowList.height() > 250){
						this.shadowList.css('height', 220);
					}
				}
				this.shadowList.css(css).addClass('datalist-visible');
				this.isListVisible = true;
				//todo
				$(document).bind('mousedown.datalist'+this.id +' focusin.datalist'+this.id, function(e){
					if(e.target === that.input ||  that.shadowList[0] === e.target || $.contains( that.shadowList[0], e.target )){
						clearTimeout(that.hideTimer);
						setTimeout(function(){
							clearTimeout(that.hideTimer);
						}, 0);
					} else {
						that.timedHide();
					}
				});
				return true;
			},
			hideList: function(){
				if(!this.isListVisible){return false;}
				this.shadowList
					.removeClass('datalist-visible list-item-active')
					.scrollTop(0)
					.find('li.active-item').removeClass('active-item')
				;
				this.index = -1;
				this.isListVisible = false;
				$(this.input).removeAttr('aria-activedescendant');
				$(document).unbind('.datalist'+this.id);
				return true;
			},
			scrollIntoView: function(elem){
				var ul = $('> ul', this.shadowList);
				var elemPos = elem.position();
				var containerHeight;
				elemPos.top -=  (parseInt(ul.css('paddingTop'), 10) || 0) + (parseInt(ul.css('marginTop'), 10) || 0) + (parseInt(ul.css('borderTopWidth'), 10) || 0);
				if(elemPos.top < 0){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + elemPos.top - 2);
					return;
				}
				elemPos.top += elem.outerHeight();
				containerHeight = this.shadowList.height();
				if(elemPos.top > containerHeight){
					this.shadowList.scrollTop( this.shadowList.scrollTop() + (elemPos.top - containerHeight) + 2);
				}
			},
			markItem: function(index, doValue, items){
				if(index < 0){return;}
				var activeItem;
				var goesUp;
				items = items || $('li:not(.hidden-item)', this.shadowList);
				if(index >= items.length){return;}
				items.removeClass('active-item');
				this.shadowList.addClass('list-item-active');
				activeItem = items.filter(':eq('+ index +')').addClass('active-item');
				
				if(doValue){
					$.attr(this.input, 'value', activeItem.attr('data-value'));
					$.attr(this.input, 'aria-activedescendant', $.webshims.getID(activeItem));
					this.scrollIntoView(activeItem);
				}
				this.index = index;
			}
		};
		
		
		webshims.defineNodeNameProperty('input', 'list', {
			get: function(elem){
				var val = webshims.contentAttr(elem, 'list');
				if(typeof val == 'string'){
					val = document.getElementById(val);
				}
				return val || null;
			},
			set: function(elem, value){
				var dom;
				if(value && value.getAttribute){
					dom = value;
					value = webshims.getID(value);
				}
				webshims.contentAttr(elem, 'list', value);
				if(dataListProto){
					webshims.objectCreate(dataListProto, undefined, {input: elem, id: value, datalist: dom});
				}
			},
			init: true
		});
		
		webshims.defineNodeNameProperty('input', 'selectedOption', {
			get: function(elem){
				var list = $.attr(elem, 'list');
				var ret = null;
				var value, options;
				if(!list){return ret;}
				value = $.attr(elem, 'value');
				if(!value){return ret;}
				options = $.attr(list, 'options');
				if(!options.length){return ret;}
				$.each(options, function(i, option){
					if(value == $.attr(option, 'value')){
						ret = option;
						return false;
					}
				});
				return ret;
			}
		});
			
		webshims.defineNodeNameProperty('input', 'autocomplete', {
			get: function(elem){
				var data = $.data(elem, 'datalistWidget');
				if(data){
					return data._autocomplete;
				}
				return ('autocomplete' in elem) ? elem.autocomplete : elem.getAttribute('autocomplete');
			},
			set: function(elem, value){
				var data = $.data(elem, 'datalistWidget');
				if(data){
					data._autocomplete = value;
					if(value == 'off'){
						data.hideList();
					}
				} else {
					if('autocomplete' in elem){
						elem.autocomplete = value;
					} else {
						elem.setAttribute('autocomplete', value);
					}
				}
			}
		});
		
		
		webshims.defineNodeNameProperty('datalist', 'options', {
			get: function(elem){
				var select = $('select', elem);
				return (select[0]) ? select[0].options : [];
			}
		});
		
		
		webshims.addReady(function(context, contextElem){
			contextElem.filter('select, option').each(function(){
				var parent = this.parentNode;
				if(parent && !$.nodeName(parent, 'datalist')){
					parent = parent.parentNode;
				}
				if(parent && $.nodeName(parent, 'datalist')){
					$(parent).triggerHandler('updateDatalist');
				}
			});
		});
		
	})();
	
	
	webshims.createReadyEvent('form-output-datalist');
}, true);