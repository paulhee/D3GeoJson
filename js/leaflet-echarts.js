(function(root, factory) {
      if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['leaflet'], factory);
      }
      else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('leaflet'));
      }
      else if (typeof root !== 'undefined' && root.L) {
        // Browser globals (root is window)
        root.L.echartsLayer = factory(L);
      }
    }(
        this, function(L) {
            L.EchartsLayer = L.Class.extend({
                includes: [L.Mixin.Events],
                _echartsContainer: null,
                _map: null,
                _ec: null,
                _option: null,
                _geoCoord: [],
                _mapOffset: [0, 0],
                _delta: 0,
                _startTime: null,
                _lastMousePos: null,
                initialize: function(map, ec) {
                this._map = map;
                var size = map.getSize();
                var div = this._echartsContainer = document.createElement('div');
                div.style.position = 'absolute';
                div.style.height = size.y + 'px';
                div.style.width = size.x + 'px';
                div.style.top = 0;
                div.style.left = 0;
                div.setAttribute("index","19891015");
                map.getPanes().overlayPane.appendChild(div);
                this._init(map, ec);
                },
                _init: function(map, ec) {
                    var self = this;
                    self._map = map;
                    //初始化mapoverlay
                    /**
                     * 获取echarts容器
                     *
                     * @return {HTMLElement}
                     * @public
                     */
                    self.getEchartsContainer = function() {
                        return self._echartsContainer;
                    };

                    /**
                     * 获取map实例
                     *
                     * @return {map.Map}
                     * @public
                     */
                    self.getMap = function() {
                        return self._map;
                    };
                    /**
                     * 经纬度转换为屏幕像素
                     *
                     * @param {Array.<number>} geoCoord  经纬度
                     * @return {Array.<number>}
                     * @public
                     */
                    self.geoCoord2Pixel = function(geoCoord) {
                        var latLng = new L.latLng(geoCoord[1], geoCoord[0]);
                        var pos = self._map.latLngToContainerPoint(latLng);
                        return [pos.x, pos.y];
                    };

                    /**
                     * 屏幕像素转换为经纬度
                     *
                     * @param {Array.<number>} pixel  像素坐标
                     * @return {Array.<number>}
                     * @public
                     */
                    self.pixel2GeoCoord = function(pixel) {
                        var point = self._map.containerPointToLatLng(L.point(pixel[0], pixel[1]));
                        return [point.lng, point.lat];
                    };

                    /**
                     * 初始化echarts实例
                     *
                     * @return {ECharts}
                     * @public
                     */
                    self.initECharts = function() {
                        self._ec = ec.init.apply(self, arguments);
                        self._bindEvent();
                        return self._ec;
                    };

                    /**
                     * 获取ECharts实例
                     *
                     * @return {ECharts}
                     * @public
                     */
                    self.getECharts = function() {
                        return self._ec;
                    };

                    /**
                     * 获取地图的偏移量
                     *
                     * @return {Array.<number>}
                     * @public
                     */
                    self.getMapOffset = function() {
                        return self._mapOffset;
                    };

                    /**
                     * 对echarts的setOption加一次处理
                     * 用来为markPoint、markLine中添加x、y坐标，需要name与geoCoord对应
                     *
                     * @public
                     * @param option
                     * @param notMerge
                     */
                    self.setOption = function(option, notMerge) {
                        self._option = option;
                        var series = option.series || {};
                        // 添加x、y
                        for (var i = 0; i < series.length; i++) {
                            var item = series[i];
                            var data = item.data;
                            if (item.type == 'effectScatter' || item.type =='heatmap'){
                                if (data && data.length) {
                                    for (var k = 0, len = data.length; k < len; k++) {
                                        var dataArray = data[k];
                                        var pos=self.geoCoord2Pixel(dataArray.lonlat);
                                        var value = dataArray.value[2];
                                        dataArray.value=[pos[0],pos[1],value];
                                    }
                                }
                            }
                            if(item.type =='lines'){
                                if (data && data.length) {
                                    for (var k = 0, len = data.length; k < len; k++) {
                                        var dataArray = data[k];
                                        var coords = dataArray.lonlat;
                                        var startpoint = self.geoCoord2Pixel(coords[0]);
                                        var endpoint = self.geoCoord2Pixel(coords[1]);
                                        data[k].coords=[startpoint,endpoint];
                                    }
                                }
                            }
                            // if(item.type =='heatmap'){
                            //     if (data && data.length) {
                            //         for (var k = 0, len = data.length; k < len; k++) {
                            //             var dataArray = data[k];
                            //             var pos=self.geoCoord2Pixel(dataArray);
                            //             var value = dataArray[2];
                            //             data[k]=[pos[0],pos[1],value];
                            //         }
                            //     }
                            // }
                        }
                        //如果Leaflet的map有偏移，echarts图标跟着偏移
                        var domPosition = self._map._getMapPanePos();
                        var Lmapoffset = [-parseInt(domPosition.x) || 0, -parseInt(domPosition.y) || 0];
                        self._echartsContainer.style.left = Lmapoffset[0] + 'px';
                        self._echartsContainer.style.top = Lmapoffset[1] + 'px';

                        self._ec.setOption(option, notMerge);
                    };


                    /**
                     * 绑定地图事件的处理方法
                     *
                     * @private
                     */
                    self._bindEvent = function() {
                        //地图移动、如拖拽触发事件
                        self._map.on('move', _moveHandler('moving'));
                        self._map.on('moveend', _moveHandler('moveend'));
                        //地图缩放触发事件
                        self._map.on('zoomstart', function() {
                            self._ec.clear();
                        });
                        self._map.on('zoomend', function () {
                            self.setOption(self._option);
                        });

                        self._ec.on('legendselectchanged',function (obj) {
                            var selected = obj.selected;
                            option.legend.selected=selected;
                        });

                        self._ec.on('mousedown',function () {
                            return function() {
                                self._ec.clear();
                                self._map.dragging['disable']();
                            };
                        }) ;
                        self._ec.on('mouseup',function () {
                            return function() {
                                self.setOption(self._option);
                                self._map.dragging['enable']();
                            };
                        }) ;
                    };

                    /**
                     * 地图移动、如拖拽触发事件
                     *
                     * @param {string} type moving | moveend  移动中|移动结束
                     * @return {Function}
                     * @private
                     */
                    function _moveHandler(type) {
                        return function() {
                            var domPosition = self._map._getMapPanePos();
                            // 记录偏移量
                            self._mapOffset = [-parseInt(domPosition.x) || 0, -parseInt(domPosition.y) || 0];
                            self._echartsContainer.style.left = self._mapOffset[0] + 'px';
                            self._echartsContainer.style.top = self._mapOffset[1] + 'px';
                            //_fireEvent(type);
                            if (type == 'moving') {
                                self._ec.clear();
                            }
                            if (type == 'moveend') {
                                self.setOption(self._option);
                            }
                        }
                    }
                }
            });
            L.echartsLayer = function(map, ec) {
              return new L.EchartsLayer(map, ec);
            };
            return L.echartsLayer;
        }));