function e(e,n,r,t,o,u,i){try{var a=e[u](i);var l=a.value}catch(e){r(e);return}if(a.done){n(l)}else{Promise.resolve(l).then(t,o)}}function n(n){return function(){var r=this,t=arguments;return new Promise(function(o,u){var i=n.apply(r,t);function a(n){e(i,o,u,a,l,"next",n)}function l(n){e(i,o,u,a,l,"throw",n)}a(undefined)})}}function r(e,n){var r,t,o,u,i={label:0,sent:function(){if(o[0]&1)throw o[1];return o[1]},trys:[],ops:[]};return u={next:a(0),"throw":a(1),"return":a(2)},typeof Symbol==="function"&&(u[Symbol.iterator]=function(){return this}),u;function a(e){return function(n){return l([e,n])}}function l(u){if(r)throw new TypeError("Generator is already executing.");while(i)try{if(r=1,t&&(o=u[0]&2?t["return"]:u[0]?t["throw"]||((o=t["return"])&&o.call(t),0):t.next)&&!(o=o.call(t,u[1])).done)return o;if(t=0,o)u=[u[0]&2,o.value];switch(u[0]){case 0:case 1:o=u;break;case 4:i.label++;return{value:u[1],done:false};case 5:i.label++;t=u[1];u=[0];continue;case 7:u=i.ops.pop();i.trys.pop();continue;default:if(!(o=i.trys,o=o.length>0&&o[o.length-1])&&(u[0]===6||u[0]===2)){i=0;continue}if(u[0]===3&&(!o||u[1]>o[0]&&u[1]<o[3])){i.label=u[1];break}if(u[0]===6&&i.label<o[1]){i.label=o[1];o=u;break}if(o&&i.label<o[2]){i.label=o[2];i.ops.push(u);break}if(o[2])i.ops.pop();i.trys.pop();continue}u=n.call(e,i)}catch(e){u=[6,e];t=0}finally{r=o=0}if(u[0]&5)throw u[1];return{value:u[0]?u[1]:void 0,done:true}}}import{a as t,b as o,c as u}from"./chunk-GXP4BEEJ.mjs";function i(e){return(e.body||t()).pipeThrough(o()).pipeThrough(u()).pipeThrough(new TransformStream({transform:function(){var e=n(function(e,n){return r(this,function(r){n.enqueue(e);return[2]})});return function(n,r){return e.apply(this,arguments)}}()}))}export{i as a};