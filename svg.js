/*jslint regexp: true */
/*global define */

define(['module', 'requirejs-text/text'], function (module, textPlugin) {
    'use strict';

    var svg = {
        buildMap: {},
        sprite_id: 'requirejs-svg-sprite',
        sprite: null,

        extractGraphicAsSymbol: function(document, svgText) {
            var div = document.createElement('div');
            div.innerHTML = svgText;
            var element = div.querySelector('svg');
            var id = element.getAttribute('id');
            var viewBox = element.getAttribute('viewbox') || element.getAttribute('viewBox');
            return svg.createSymbol(document, id, element, viewBox);
        },

        createSymbol: function(document, id, element, viewBox) {
            var symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
            while (element.firstChild) {
                symbol.appendChild(element.firstChild);
            }
            typeof id === 'string' && symbol.setAttribute('id', id);
            typeof viewBox === 'string' && symbol.setAttribute('viewBox', viewBox);
            return symbol;
        },

        createSprite: function(document) {
            svg.sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.sprite.setAttribute('style', 'display: none');
            svg.sprite.setAttribute('id', this.sprite_id);
            return svg.sprite;
        },

        appendSprite: function(content) {
            if (! svg.sprite) {
                svg.createSprite(document);
                document.body.appendChild(svg.sprite);
            }

            svg.sprite.appendChild( svg.extractGraphicAsSymbol(document, content) );
        },

        finishLoad: function(name, onLoad, config) {
            return function(content) {
                if (config && !config.isBuild) {
                    svg.appendSprite(content);
                }
                else {
                    svg.buildMap[name] = content;
                }

                return onLoad(content);
            };
        },

        load: function(name, req, onLoad, config) {
            textPlugin.load(name + '!strip', req, svg.finishLoad(name, onLoad, config), config);
        },

        write: function (pluginName, moduleName, write/*, config*/) {
            if (svg.buildMap.hasOwnProperty(moduleName)) {
                var content = textPlugin.jsEscape(svg.buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                   "define(['" + pluginName + "'], function (svg) { svg.appendSprite('" + content + "');});\n"
                );
            }
        }
    };

    return svg;
});
