/**
 * Lullaby Marcin Chuć
 * e-mail: marcin ...change it to at... afya.pl
 * (C) 2019
 */

module.exports = function(RED) {

  /**
   main function
  */
  function AFYACarouselSwitch(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {

      if (config.variableName == -1) {
        this.status({
          fill: "red",
          shape: "dot",
          text: "missconfigured - open dialog && save variableName <" + timeConvert(Date.now()) + ">"
        });
        return;
      }



      // direction ff or rev (default ff)
      var direction = 1;
      // small messages changes all... like in live ;)

      if ('payload' in msg) {
        var pL = msg['payload'];
        if (getType(pL) == 'object') {

          //change direction
          if ('rev' in pL) {
            if (String(pL.rev).toLowerCase() == "yes") {
              direction = -1;
            }
          }
          //reset counter to undefined (next run = value: 0 , (reverse direction): value:  maxValue)
          if ('reset' in pL) {
            if (String(pL.reset).toLowerCase() == "yes") {
              this.context().flow.set(config.variableName, undefined)
              this.status({
                fill: "yellow",
                shape: "dot",
                text: "reset <" + timeConvert(Date.now()) + ">"
              });
            }
          }


          //no operation - if wana just reset - do nothing after
          if ('noop' in pL) {
            if (String(pL.noop).toLowerCase() == "yes") {
              this.status({
                fill: "blue",
                shape: "ring",
                text: "NOOP! <" + timeConvert(Date.now()) + ">"
              });
              return;
            }
          }

        } //end: payload is Array/Object
      } // end : payload

      // some to check
      var maxValue = Math.round(Math.abs(config.maxValue));
      if (maxValue < 1) {
        maxValue = 1;
      }

      //first run, and i want allways to start with 0 value (normal direction) and maxValue (reverse direction)
      myValue = this.context().flow.get(config.variableName);
      if (myValue === undefined) {
        if (direction > 0) {
          var myValue = -direction;
        } else {
          var myValue = maxValue + 1;
        }
      }



      myValue = myValue + direction; //inc or dec value, depends direction

      if (direction > 0) {
        if (myValue > maxValue) {
          myValue = 0; // 0...1...2...max...0...
        }
      } else {
        if (myValue < 0) {
          myValue = maxValue; // 3..2..1..0... max ...3..
        }
      }

      this.status({
        fill: "green",
        shape: "ring",
        text: (direction > 0 ? "-->>" : "<<--") + " value: " + myValue + " (max:" + maxValue + ") <" + timeConvert(Date.now()) + ">"
      });

      msg = {
        payload: {
          direction: direction,
          timestamp: Date.now(),
          value: myValue,
          maxValue: maxValue
        }
      }
      this.context().flow.set(config.variableName, myValue);
      node.send(msg);

    });
  }

  /**
  function timeConvert returns string from given timestamp as i.e.: 2010-10-1 17:09:11
  */
  function timeConvert(myTimeStamp) {
    var d = new Date(myTimeStamp);
    var time = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
    return time;
  }

  /**
  function getType returns information if object is Array or Object
  from: https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
  */
  function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
  }



  //register node
  RED.nodes.registerType("afya-carousel-switch", AFYACarouselSwitch);
}
