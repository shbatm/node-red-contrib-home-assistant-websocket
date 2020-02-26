(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{266:function(t,s,a){"use strict";a.r(s);var e=a(0),n=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"events-state"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#events-state"}},[t._v("#")]),t._v(" Events: state")]),t._v(" "),a("p",[t._v("Outputs state_changed event types sent from Home Assistant")]),t._v(" "),a("p",[t._v("The autocomplete will open to allow easier selection in the case you want a specific entity however the actual match is a substring match so no validation is done")]),t._v(" "),a("h2",{attrs:{id:"configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#configuration"}},[t._v("#")]),t._v(" Configuration:")]),t._v(" "),a("h3",{attrs:{id:"entity-id"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#entity-id"}},[t._v("#")]),t._v(" Entity ID "),a("Badge",{attrs:{text:"required"}})],1),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string|regex")])])]),t._v(" "),a("p",[t._v("matches for entity_id field")]),t._v(" "),a("h3",{attrs:{id:"entity-id-filter-types"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#entity-id-filter-types"}},[t._v("#")]),t._v(" Entity ID Filter Types "),a("Badge",{attrs:{text:"required"}})],1),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("Values: "),a("code",[t._v("exact|substring|regex")])]),t._v(" "),a("li",[t._v("Default: "),a("code",[t._v("exact")])])]),t._v(" "),a("p",[t._v("Substring can be a comma-delimited list.")]),t._v(" "),a("h3",{attrs:{id:"if-state"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#if-state"}},[t._v("#")]),t._v(" If State")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("If the conditional is evaluated as true send the message to the first output otherwise send it to the second output. If blank there will only be one output.")]),t._v(" "),a("p",[a("strong",[t._v("Also see:")])]),t._v(" "),a("ul",[a("li",[a("RouterLink",{attrs:{to:"/guide/conditionals.html"}},[t._v("Conditionals")])],1)]),t._v(" "),a("h3",{attrs:{id:"state-type"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#state-type"}},[t._v("#")]),t._v(" State Type")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("Values: "),a("code",[t._v("string|number|boolean")])]),t._v(" "),a("li",[t._v("Default: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("Convert the state of the entity to the selected type. Boolean will be converted to true based on if the string is equal by default to ("),a("code",[t._v("y|yes|true|on|home|open")]),t._v("). Original value stored in msg.data.original_state")]),t._v(" "),a("h3",{attrs:{id:"output-only-on-state-change"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#output-only-on-state-change"}},[t._v("#")]),t._v(" Output only on state change")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("boolean")])])]),t._v(" "),a("p",[t._v("Output only when the state has changed and not on startup/deploy")]),t._v(" "),a("h3",{attrs:{id:"output-on-connect"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#output-on-connect"}},[t._v("#")]),t._v(" Output on Connect")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("boolean")])])]),t._v(" "),a("p",[t._v("Output once on startup/deploy")]),t._v(" "),a("h3",{attrs:{id:"expose-to-home-assistant"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#expose-to-home-assistant"}},[t._v("#")]),t._v(" Expose to Home Assistant")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("boolean")])])]),t._v(" "),a("p",[t._v("Creates a switch within Home Assistant to enable/disable this node. This feature requires "),a("a",{attrs:{href:"https://github.com/zachowj/hass-node-red",target:"_blank",rel:"noopener noreferrer"}},[t._v("Node-RED custom integration"),a("OutboundLink")],1),t._v(" to be installed in Home Assistant")]),t._v(" "),a("h2",{attrs:{id:"output"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#output"}},[t._v("#")]),t._v(" Output")]),t._v(" "),a("h3",{attrs:{id:"topic"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#topic"}},[t._v("#")]),t._v(" topic")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("The entity ID that triggered the event.")]),t._v(" "),a("h3",{attrs:{id:"payload"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#payload"}},[t._v("#")]),t._v(" payload")]),t._v(" "),a("ul",[a("li",[t._v("Type: "),a("code",[t._v("string|number|boolean")])])]),t._v(" "),a("p",[t._v("The current state of the entity that triggered the event.")]),t._v(" "),a("h3",{attrs:{id:"data"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#data"}},[t._v("#")]),t._v(" data")]),t._v(" "),a("ul",[a("li",[t._v("Type "),a("code",[t._v("Object")])])]),t._v(" "),a("p",[t._v("original event object from Home Assistant")]),t._v(" "),a("p",[t._v("Example output of the data property:")]),t._v(" "),a("div",{staticClass:"language-json extra-class"},[a("pre",{pre:!0,attrs:{class:"language-json"}},[a("code",[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"entity_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"light.kitchen"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"old_state"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"entity_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"light.kitchen"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"state"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"off"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"attributes"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"friendly_name"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Kitchen Light"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"icon"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"mdi:light-switch"')]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"last_changed"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"2019-12-29T04:49:50.230660+00:00"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"last_updated"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"2019-12-29T04:49:50.230660+00:00"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"context"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"3a639379992d430595e3e9c73fb349e1"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"parent_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token null keyword"}},[t._v("null")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"user_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token null keyword"}},[t._v("null")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"new_state"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"entity_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"light.kitchen"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"state"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"on"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"attributes"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"brightness"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("118")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"friendly_name"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Kitchen Light"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"icon"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"mdi:light-switch"')]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"last_changed"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"2019-12-29T05:28:44.238349+00:00"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"last_updated"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"2019-12-29T05:28:44.238349+00:00"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"context"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"8a147f61a375489284ef7a7715a6a8f2"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"parent_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token null keyword"}},[t._v("null")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"user_id"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token null keyword"}},[t._v("null")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token property"}},[t._v('"timeSinceChangedMs"')]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("12")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("h2",{attrs:{id:"changelog"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#changelog"}},[t._v("#")]),t._v(" Changelog")]),t._v(" "),a("h4",{attrs:{id:"version-1"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#version-1"}},[t._v("#")]),t._v(" Version 1")]),t._v(" "),a("ul",[a("li",[t._v('"if state"/"halt if" will now send the message to the first output if true and\nto the second if not. The old behavior, sending the message to the second\noutput if true will continue to be in place until you edit one of the\nexisting nodes via the UI and at that time the outputs will automatically be\nswitched.')])])])}),[],!1,null,null,null);s.default=n.exports}}]);