export default {
  /**
   * (Object) Options for when `devType === 'spi'`
   */
  spiOptions: {
    /**
     * (Integer) SPI Clock Speed
     */
    clockSpeed: 3e6,
    /**
     * (Integer) SPI Data Mode
     */
    mode: 0,
    /**
     * (Object<Int, Object>) SPI channels, where the object keys are channel numbers, and object
     * values define the spi device
     */
    channels: {
      /* spidev0.0 */
      0: {
        /**
         * (Integer) SPI Bus number
         */
        bus: 0,
        /**
         * (Integer) SPI Device number
         */
        device: 0
      },
      /* spidev0.1 */
      1: {
        bus: 0,
        device: 1
      },
      /* spidev1.0 */
      2: {
        bus: 1,
        device: 0
      },
      /* spidev1.1 */
      3: {
        bus: 1,
        device: 1
      }
    }
  },
  pbxOptions: {
    /**
     * (Object) serial port definitions to be used. See
     * <https://github.com/derwentx/js-pixelblaze-expander> for more details
     */
    ports: {
      0: {
        /**
         * (Object) serial port name. See
         * <https://github.com/derwentx/js-pixelblaze-expander> for more details
         */
        name: '/dev/tty.usbserial-AD025M69',
        /**
         * (Object) serial port options. See
         * <https://github.com/derwentx/js-pixelblaze-expander> for more details
         */
        options: {
          channels: {
            0: { capacity: 300 },
            1: { capacity: 300 },
            2: { capacity: 300 },
            3: { capacity: 300 },
            4: { capacity: 300 },
            5: { capacity: 300 }
          }
        }
      }
    },
    channels: {
      0: { port: 0, channel: 0 },
      1: { port: 0, channel: 1 },
      2: { port: 0, channel: 2 },
      3: { port: 0, channel: 3 },
      4: { port: 0, channel: 4 },
      5: { port: 0, channel: 5 }
    }
  }
};
