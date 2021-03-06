'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultVerticalStrength = exports.defaultHorizontalStrength = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
// import { Consumer as DragDropContextConsumer } from 'react-dnd/lib/DragDropContext';


exports.createHorizontalStrength = createHorizontalStrength;
exports.createVerticalStrength = createVerticalStrength;
exports.default = createScrollingComponent;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDnd = require('react-dnd');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _reactDisplayName = require('react-display-name');

var _reactDisplayName2 = _interopRequireDefault(_reactDisplayName);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_BUFFER = 150;
var DragDropContextConsumer = _reactDnd.DndContext.Consumer;
var useNewContextApi = _react.createContext !== undefined && DragDropContextConsumer !== undefined;

function createDragDropMonitorWrapper(WrappedComponent) {
  return function DragDropMonitorWrapper(props) {
    return _react2.default.createElement(
      DragDropContextConsumer,
      null,
      function (_ref) {
        var dragDropManager = _ref.dragDropManager;
        return _react2.default.createElement(WrappedComponent, _extends({}, props, { dragDropManager: dragDropManager }));
      }
    );
  };
}

function createHorizontalStrength(_buffer) {
  return function defaultHorizontalStrength(_ref2, point) {
    var x = _ref2.x,
        w = _ref2.w,
        y = _ref2.y,
        h = _ref2.h;

    var buffer = Math.min(w / 2, _buffer);
    var inRange = point.x >= x && point.x <= x + w;
    var inBox = inRange && point.y >= y && point.y <= y + h;

    if (inBox) {
      if (point.x < x + buffer) {
        return (point.x - x - buffer) / buffer;
      } else if (point.x > x + w - buffer) {
        return -(x + w - point.x - buffer) / buffer;
      }
    }

    return 0;
  };
}

function createVerticalStrength(_buffer) {
  return function defaultVerticalStrength(_ref3, point) {
    var y = _ref3.y,
        h = _ref3.h,
        x = _ref3.x,
        w = _ref3.w;

    var buffer = Math.min(h / 2, _buffer);
    var inRange = point.y >= y && point.y <= y + h;
    var inBox = inRange && point.x >= x && point.x <= x + w;

    if (inBox) {
      if (point.y < y + buffer) {
        return (point.y - y - buffer) / buffer;
      } else if (point.y > y + h - buffer) {
        return -(y + h - point.y - buffer) / buffer;
      }
    }

    return 0;
  };
}

var defaultHorizontalStrength = exports.defaultHorizontalStrength = createHorizontalStrength(DEFAULT_BUFFER);

var defaultVerticalStrength = exports.defaultVerticalStrength = createVerticalStrength(DEFAULT_BUFFER);

function createScrollingComponent(WrappedComponent) {
  var ScrollingComponent = function (_Component) {
    _inherits(ScrollingComponent, _Component);

    function ScrollingComponent(props, ctx) {
      _classCallCheck(this, ScrollingComponent);

      var _this = _possibleConstructorReturn(this, (ScrollingComponent.__proto__ || Object.getPrototypeOf(ScrollingComponent)).call(this, props, ctx));

      _this.handleEvent = function (evt) {
        if (_this.dragging && !_this.attached) {
          _this.attach();
          _this.updateScrolling(evt);
        }
      };

      _this.updateScrolling = (0, _lodash2.default)(function (evt) {
        var _this$container$getBo = _this.container.getBoundingClientRect(),
            x = _this$container$getBo.left,
            y = _this$container$getBo.top,
            w = _this$container$getBo.width,
            h = _this$container$getBo.height;

        var box = { x: x, y: y, w: w, h: h };
        var coords = (0, _util.getCoords)(evt);

        // calculate strength
        _this.scaleX = _this.props.horizontalStrength(box, coords);
        _this.scaleY = _this.props.verticalStrength(box, coords);

        // start scrolling if we need to
        if (!_this.frame && (_this.scaleX || _this.scaleY)) {
          _this.startScrolling();
        }
      }, 100, { trailing: false });


      _this.scaleX = 0;
      _this.scaleY = 0;
      _this.frame = null;

      _this.attached = false;
      _this.dragging = false;
      return _this;
    }

    _createClass(ScrollingComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        var getScrollContainer = this.props.getScrollContainer;

        var wrappedNode = (0, _reactDom.findDOMNode)(this.wrappedInstance);
        this.container = getScrollContainer ? getScrollContainer(wrappedNode) : wrappedNode;
        this.container.addEventListener('dragover', this.handleEvent);
        // touchmove events don't seem to work across siblings, so we unfortunately
        // have to attach the listeners to the body
        window.document.body.addEventListener('touchmove', this.handleEvent);

        this.clearMonitorSubscription = this.getDragDropManager().getMonitor().subscribeToStateChange(function () {
          return _this2.handleMonitorChange();
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.container.removeEventListener('dragover', this.handleEvent);
        window.document.body.removeEventListener('touchmove', this.handleEvent);
        this.clearMonitorSubscription();
        this.stopScrolling();
      }
    }, {
      key: 'getDragDropManager',
      value: function getDragDropManager() {
        return useNewContextApi ? this.props.dragDropManager : this.context.dragDropManager;
      }
    }, {
      key: 'handleMonitorChange',
      value: function handleMonitorChange() {
        var isDragging = this.getDragDropManager().getMonitor().isDragging();

        if (!this.dragging && isDragging) {
          this.dragging = true;
        } else if (this.dragging && !isDragging) {
          this.dragging = false;
          this.stopScrolling();
        }
      }
    }, {
      key: 'attach',
      value: function attach() {
        this.attached = true;
        window.document.body.addEventListener('dragover', this.updateScrolling);
        window.document.body.addEventListener('touchmove', this.updateScrolling);
      }
    }, {
      key: 'detach',
      value: function detach() {
        this.attached = false;
        window.document.body.removeEventListener('dragover', this.updateScrolling);
        window.document.body.removeEventListener('touchmove', this.updateScrolling);
      }

      // Update scaleX and scaleY every 100ms or so
      // and start scrolling if necessary

    }, {
      key: 'startScrolling',
      value: function startScrolling() {
        var _this3 = this;

        var i = 0;
        var tick = function tick() {
          var scaleX = _this3.scaleX,
              scaleY = _this3.scaleY,
              container = _this3.container;
          var _props = _this3.props,
              strengthMultiplier = _props.strengthMultiplier,
              onScrollChange = _props.onScrollChange;

          // stop scrolling if there's nothing to do

          if (strengthMultiplier === 0 || scaleX + scaleY === 0) {
            _this3.stopScrolling();
            return;
          }

          // there's a bug in safari where it seems like we can't get
          // mousemove events from a container that also emits a scroll
          // event that same frame. So we double the strengthMultiplier and only adjust
          // the scroll position at 30fps
          if (i++ % 2) {
            var scrollLeft = container.scrollLeft,
                scrollTop = container.scrollTop,
                scrollWidth = container.scrollWidth,
                scrollHeight = container.scrollHeight,
                clientWidth = container.clientWidth,
                clientHeight = container.clientHeight;


            var newLeft = scaleX ? container.scrollLeft = (0, _util.intBetween)(0, scrollWidth - clientWidth, scrollLeft + scaleX * strengthMultiplier) : scrollLeft;

            var newTop = scaleY ? container.scrollTop = (0, _util.intBetween)(0, scrollHeight - clientHeight, scrollTop + scaleY * strengthMultiplier) : scrollTop;

            onScrollChange(newLeft, newTop);
          }
          _this3.frame = (0, _raf2.default)(tick);
        };

        tick();
      }
    }, {
      key: 'stopScrolling',
      value: function stopScrolling() {
        this.detach();
        this.scaleX = 0;
        this.scaleY = 0;

        if (this.frame) {
          _raf2.default.cancel(this.frame);
          this.frame = null;
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        var _props2 = this.props,
            strengthMultiplier = _props2.strengthMultiplier,
            verticalStrength = _props2.verticalStrength,
            horizontalStrength = _props2.horizontalStrength,
            onScrollChange = _props2.onScrollChange,
            props = _objectWithoutProperties(_props2, ['strengthMultiplier', 'verticalStrength', 'horizontalStrength', 'onScrollChange']);

        return _react2.default.createElement(WrappedComponent, _extends({
          ref: function ref(_ref4) {
            _this4.wrappedInstance = _ref4;
          }
        }, props));
      }
    }]);

    return ScrollingComponent;
  }(_react.Component);

  ScrollingComponent.displayName = 'Scrolling(' + (0, _reactDisplayName2.default)(WrappedComponent) + ')';
  ScrollingComponent.propTypes = {
    onScrollChange: _propTypes2.default.func,
    verticalStrength: _propTypes2.default.func,
    horizontalStrength: _propTypes2.default.func,
    strengthMultiplier: _propTypes2.default.number,
    getScrollContainer: _propTypes2.default.func
  };
  ScrollingComponent.defaultProps = {
    onScrollChange: _util.noop,
    verticalStrength: defaultVerticalStrength,
    horizontalStrength: defaultHorizontalStrength,
    strengthMultiplier: 30
  };
  ScrollingComponent.contextTypes = useNewContextApi ? undefined : {
    dragDropManager: _propTypes2.default.object
  };


  if (useNewContextApi) {
    var DragDropMonitorWrapper = createDragDropMonitorWrapper(ScrollingComponent);
    return (0, _hoistNonReactStatics2.default)(DragDropMonitorWrapper, WrappedComponent);
  }

  return (0, _hoistNonReactStatics2.default)(ScrollingComponent, WrappedComponent);
}