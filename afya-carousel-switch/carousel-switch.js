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

      // direction ff or rev (default ff)
      var direction = 1;
      // small message changes all... like in live ;)
      if ('payload' in msg) {
        if (String(msg['payload']).toLowerCase() == "rev") {
          direction = -1;
        }
      }

      //first run, and i want allways to start with 0 value
      myValue = this.context().flow.get(config.variableName);
      if (myValue === undefined) {
        var myValue = -direction;
      }

      // some to check
      var maxValue = Math.round(Math.abs(config.maxValue));
      if (maxValue < 1) {
        maxValue = 1;
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



  //register node
  RED.nodes.registerType("afya-carousel-switch", AFYACarouselSwitch);
}
