jQuery.webshims.ready("form-core",function(c,j,q,m,o){(function(){var n={input:1,textarea:1},g={updateInput:1,input:1},l={radio:1,checkbox:1,submit:1,button:1,image:1,reset:1,color:1},k=function(h){var a,e=h.attr("value"),b=function(f){if(h){var i=h.attr("value");if(i!==e){e=i;if(!f||!g[f.type])j.triggerInlineForm(h[0],"input")}}},d=function(){h.unbind("focusout",d).unbind("input",b).unbind("updateInput",b);clearInterval(a);b();h=null};clearInterval(a);a=setInterval(b,c.browser.mozilla?250:111);setTimeout(b,
9);h.bind("focusout",d).bind("input updateInput",b)};c(m).bind("focusin",function(h){if(h.target&&h.target.type&&!h.target.readonly&&!h.target.readOnly&&!h.target.disabled&&n[(h.target.nodeName||"").toLowerCase()]&&!l[h.target.type])k(c(h.target))})})();(function(){if(!("value"in m.createElement("output"))){var n=function(g){if(!g.getAttribute("aria-live")){g=c(g);var l=(g.text()||"").trim(),k=g.attr("id"),h=g.attr("for"),a=c('<input class="output-shim" type="hidden" name="'+(g.attr("name")||"")+
'" value="'+l+'" style="display: none" />').insertAfter(g),e=a[0].form||m,b=function(d){a[0].value=d;d=a[0].value;g.text(d);j.contentAttr(g[0],"value",d)};g[0].defaultValue=l;j.contentAttr(g[0],"value",l);g.attr({"aria-live":"polite"});if(k){a.attr("id",k);g.attr("aria-labeldby",j.getID(c('label[for="'+k+'"]',e)))}if(h){k=j.getID(g);h.split(" ").forEach(function(d){(d=e.getElementById(d))&&d.setAttribute("aria-controls",k)})}g.data("outputShim",b);a.data("outputShim",b);return b}};j.defineNodeNameProperty("output",
"value",{set:function(g,l){var k=c.data(g,"outputShim");k||(k=n(g));k(l)},get:function(g){return j.contentAttr(g,"value")||c(g).text()||""}});j.onNodeNamesPropertyModify("input","value",{set:function(g,l){var k=c.data(g,"outputShim");if(k){k(l);return l}c(g).triggerHandler("updateInput")}});j.addReady(function(g,l){c("output",g).add(l.filter("output")).each(function(){n(this)})})}})();(function(){if(!c.support.datalist){var n=0,g={submit:1,button:1,reset:1,hidden:1,range:1,date:1},l=c.browser.msie&&
parseInt(c.browser.version,10)<7,k=function(a){if(!a)return[];var e;try{e=JSON.parse(localStorage.getItem("storedDatalistOptions"+a))}catch(b){}return e||[]},h={_create:function(a){var e=a.datalist||a.id&&m.getElementById(a.id);if(!g[(a.input.getAttribute("type")||"").toLowerCase()||a.input.type]){var b=c.data(a.input,"datalistWidget");if(e&&b&&b.datalist!==e){b.datalist=e;b.id=a.id;b._resetListCached()}else if(e){n++;var d=this;this.timedHide=function(){clearTimeout(d.hideTimer);d.hideTimer=setTimeout(c.proxy(d,
"hideList"),9)};this.datalist=e;this.id=a.id;this.lazyIDindex=n;this.hasViewableData=true;this._autocomplete=c.attr(a.input,"autocomplete");c.data(a.input,"datalistWidget",this);this.shadowList=c('<div class="datalist-polyfill" />').appendTo("body");this.index=-1;this.input=a.input;this.arrayOptions=[];this.shadowList.delegate("li","mouseover.datalistWidget mousedown.datalistWidget click.datalistWidget",function(f){var i=c("li:not(.hidden-item)",d.shadowList),p=f.type=="mousedown"||f.type=="click";
d.markItem(i.index(f.target),p,i);f.type=="click"&&d.hideList();return f.type!="mousedown"}).bind("focusout",this.timedHide);a.input.setAttribute("autocomplete","off");c(a.input).attr({"aria-haspopup":"true"}).bind("input.datalistWidget",c.proxy(this,"showHideOptions")).bind("keydown.datalistWidget",function(f){var i=f.keyCode;if(i==40&&!d.showList()){d.markItem(d.index+1,true);return false}if(d.isListVisible){if(i==38){d.markItem(d.index-1,true);return false}if(!f.shiftKey&&(i==33||i==36)){d.markItem(0,
true);return false}if(!f.shiftKey&&(i==34||i==35)){f=c("li:not(.hidden-item)",d.shadowList);d.markItem(f.length-1,true,f);return false}if(i==13||i==27){d.hideList();return false}}}).bind("blur.datalistWidget",this.timedHide);c(this.datalist).unbind("updateDatalist.datalistWidget").bind("updateDatalist.datalistWidget",c.proxy(this,"_resetListCached"));this._resetListCached();a.input.form&&a.input.id&&c(a.input.form).bind("submit.datalistWidget"+a.input.id,function(){var f=c.attr(a.input,"value");d.storedOptions=
d.storedOptions||k(a.input.name||a.input.id);if(f&&c.inArray(f,d.storedOptions)==-1){d.storedOptions.push(f);f=a.input.name||a.input.id;var i=d.storedOptions;if(f){i=i||[];try{localStorage.setItem("storedDatalistOptions"+f,JSON.stringify(i))}catch(p){}}}})}else b&&b.destroy()}},destroy:function(){var a=c.attr(this.input,"autocomplete");c(this.input).unbind(".datalistWidget").removeData("datalistWidget");this.shadowList.remove();c(m).unbind(".datalist"+this.id);this.input.form&&this.input.id&&c(this.input.form).unbind("submit.datalistWidget"+
this.input.id);this.input.removeAttribute("aria-haspopup");a===o?this.input.removeAttribute("autocomplete"):c(this.input).attr("autocomplete",a)},_resetListCached:function(){var a=this;this.needsUpdate=true;this.lastUpdatedValue=false;this.lastUnfoundValue="";clearTimeout(this.updateTimer);this.updateTimer=setTimeout(function(){a.updateListOptions()},this.isListVisible?0:20*this.lazyIDindex)},updateListOptions:function(){this.needsUpdate=false;clearTimeout(this.updateTimer);this.shadowList.css({fontSize:c.curCSS(this.input,
"fontSize"),fontFamily:c.curCSS(this.input,"fontFamily")});var a='<ul role="list" class="'+(this.datalist.className||"")+'">',e=[],b=[];c("option",this.datalist).each(function(d){if(!this.disabled){var f={value:c(this).val(),text:c.trim(c.attr(this,"label")||this.textContent||this.innerText||c.text([this])||""),className:this.className||"",style:c.attr(this,"style")||""};if(!f.text)f.text=f.value;e[d]=f.value;b[d]=f}});this.storedOptions=this.storedOptions||k(this.input.name||this.input.id);this.storedOptions.forEach(function(d){c.inArray(d,
e)==-1&&b.push({value:d,text:d,className:"",style:""})});b.forEach(function(d){a+='<li data-value="'+d.value+'" class="'+d.className+'" style="'+d.style+'" tabindex="-1" role="listitem">'+d.text+"</li>"});a+="</ul>";this.arrayOptions=b;this.shadowList.html(a);this.isListVisible&&this.showHideOptions()},showHideOptions:function(){var a=c.attr(this.input,"value").toLowerCase();if(!(a===this.lastUpdatedValue||this.lastUnfoundValue&&a.indexOf(this.lastUnfoundValue)===0)){this.lastUpdatedValue=a;var e=
false,b=c("li",this.shadowList);if(a)this.arrayOptions.forEach(function(d,f){if(!("lowerText"in d)){d.lowerText=d.text.toLowerCase();d.lowerValue=d.value.toLowerCase()}if(d.lowerText.indexOf(a)!==-1||d.lowerValue.indexOf(a)!==-1){c(b[f]).removeClass("hidden-item");e=true}else c(b[f]).addClass("hidden-item")});else{b.removeClass("hidden-item");e=true}if(this.hasViewableData=e)this.showList();else{this.lastUnfoundValue=a;this.hideList()}}},showList:function(){if(this.isListVisible)return false;this.needsUpdate&&
this.updateListOptions();this.showHideOptions();if(!this.hasViewableData)return false;var a=this,e=c(this.input).offset();e.top+=c(this.input).outerHeight();e.width=c(this.input).outerWidth()-(parseInt(this.shadowList.css("borderLeftWidth"),10)||0)-(parseInt(this.shadowList.css("borderRightWidth"),10)||0);if(l){this.shadowList.css("height","auto");this.shadowList.height()>250&&this.shadowList.css("height",220)}this.shadowList.css(e).addClass("datalist-visible");this.isListVisible=true;c(m).bind("mousedown.datalist"+
this.id+" focusin.datalist"+this.id,function(b){if(b.target===a.input||a.shadowList[0]===b.target||c.contains(a.shadowList[0],b.target)){clearTimeout(a.hideTimer);setTimeout(function(){clearTimeout(a.hideTimer)},0)}else a.timedHide()});return true},hideList:function(){if(!this.isListVisible)return false;this.shadowList.removeClass("datalist-visible list-item-active").scrollTop(0).find("li.active-item").removeClass("active-item");this.index=-1;this.isListVisible=false;c(this.input).removeAttr("aria-activedescendant");
c(m).unbind(".datalist"+this.id);return true},scrollIntoView:function(a){var e=c("> ul",this.shadowList),b=a.position();b.top-=(parseInt(e.css("paddingTop"),10)||0)+(parseInt(e.css("marginTop"),10)||0)+(parseInt(e.css("borderTopWidth"),10)||0);if(b.top<0)this.shadowList.scrollTop(this.shadowList.scrollTop()+b.top-2);else{b.top+=a.outerHeight();a=this.shadowList.height();b.top>a&&this.shadowList.scrollTop(this.shadowList.scrollTop()+(b.top-a)+2)}},markItem:function(a,e,b){if(!(a<0)){b=b||c("li:not(.hidden-item)",
this.shadowList);if(!(a>=b.length)){b.removeClass("active-item");this.shadowList.addClass("list-item-active");b=b.filter(":eq("+a+")").addClass("active-item");if(e){c.attr(this.input,"value",b.attr("data-value"));c.attr(this.input,"aria-activedescendant",c.webshims.getID(b));this.scrollIntoView(b)}this.index=a}}}};j.defineNodeNameProperty("input","list",{get:function(a){a=j.contentAttr(a,"list");if(typeof a=="string")a=m.getElementById(a);return a||null},set:function(a,e){var b;if(e&&e.getAttribute){b=
e;e=j.getID(e)}j.contentAttr(a,"list",e);h&&j.objectCreate(h,o,{input:a,id:e,datalist:b})},init:true});j.defineNodeNameProperty("input","selectedOption",{get:function(a){var e=c.attr(a,"list"),b=null,d;if(!e)return b;d=c.attr(a,"value");if(!d)return b;a=c.attr(e,"options");if(!a.length)return b;c.each(a,function(f,i){if(d==c.attr(i,"value")){b=i;return false}});return b}});j.defineNodeNameProperty("input","autocomplete",{get:function(a){var e=c.data(a,"datalistWidget");if(e)return e._autocomplete;
return"autocomplete"in a?a.autocomplete:a.getAttribute("autocomplete")},set:function(a,e){var b=c.data(a,"datalistWidget");if(b){b._autocomplete=e;e=="off"&&b.hideList()}else if("autocomplete"in a)a.autocomplete=e;else a.setAttribute("autocomplete",e)}});j.defineNodeNameProperty("datalist","options",{get:function(a){a=c("select",a);return a[0]?a[0].options:[]}});j.addReady(function(a,e){e.filter("select, option").each(function(){var b=this.parentNode;if(b&&!c.nodeName(b,"datalist"))b=b.parentNode;
b&&c.nodeName(b,"datalist")&&c(b).triggerHandler("updateDatalist")})})}})();j.createReadyEvent("form-output-datalist")},true);
