import { composeOPCHeader } from '@js-telecortex-2/js-telecortex-2-util';
import { handleOPCMessage, handleAllOPCMessages } from './index';

const mockSpi0 = jest.fn();

const mockContextSk9822 = {
  channels: { 0: mockSpi0 },
  middlewareProtocol: 'colours2sk9822',
  devType: 'spi'
};

const mockContextWs2811 = {
  channels: { 0: mockSpi0 },
  middlewareProtocol: 'colours2ws2811',
  devType: 'ws281x'
};

const redPixel = [0xff, 0x00, 0x00];
const incompleteRedPixel = redPixel.slice(0, redPixel.length - 1);

beforeEach(() => {
  jest.clearAllMocks();
});

const oldError = console.error;

console.error = jest.fn();
afterAll(() => {
  jest.resetAllMocks();
  console.error = oldError;
});

describe('handleOPCMessage', () => {
  [
    {
      testName: 'handles invalid channel',
      inArray: composeOPCHeader(1, 3).concat(redPixel),
      validate: (data, response) => {
        expect(mockSpi0.mock.calls.length).toBe(0);
        expect(response).toBe(data.length);
      }
    },
    {
      testName: 'works with sk9822',
      inArray: composeOPCHeader(0, 3).concat(redPixel),
      validate: (data, response) => {
        expect(mockSpi0.mock.calls.length).toBe(1);
        expect(mockSpi0.mock.calls[0]).toMatchSnapshot();
        expect(response).toBe(data.length);
      }
    }
  ].forEach(({ testName, inArray, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleOPCMessage(mockContextSk9822, data));
    });
  });
  [
    {
      testName: 'works with ws2811',
      inArray: composeOPCHeader(0, 3).concat(redPixel),
      validate: (data, response) => {
        expect(mockSpi0.mock.calls.length).toBe(1);
        expect(mockSpi0.mock.calls[0]).toMatchSnapshot();
        expect(response).toBe(data.length);
      }
    }
  ].forEach(({ testName, inArray, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleOPCMessage(mockContextWs2811, data));
    });
  });
});

describe('handleAllOPCMessages', () => {
  [
    {
      testName: 'handles multiple messages',
      inArray: Array.of(
        ...composeOPCHeader(0, 3),
        ...redPixel,
        ...composeOPCHeader(0, 3),
        ...redPixel
      ),
      callLength: 2,
      validate: (_, response) => {
        expect(mockSpi0.mock.calls).toMatchSnapshot();
        expect(response).toBe(undefined);
      }
    },
    {
      testName: 'handles partial messages',
      inArray: composeOPCHeader(0, 3).concat(incompleteRedPixel),
      callLength: 0,
      validate: (data, response) => {
        expect(response).toBe(data);
      }
    },
    {
      testName: 'handles invalid channel',
      inArray: composeOPCHeader(0xff, 3).concat(redPixel),
      callLength: 0,
      validate: (_, response) => {
        expect(response).toBe(undefined);
      }
    }
  ].forEach(({ testName, inArray, callLength, validate }) => {
    it(testName, () => {
      const data = Buffer.from(inArray);
      validate(data, handleAllOPCMessages(mockContextSk9822, data));
      expect(mockSpi0.mock.calls.length).toBe(callLength);
    });
  });
});
