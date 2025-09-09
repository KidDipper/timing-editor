import "@testing-library/jest-dom";

// WaveDrom は CDN で読み込む実装なので、テストでは存在しない。
// App が呼び出す ProcessAll をダミー化しておく。
Object.assign(window as any, {
  WaveDrom: {
    ProcessAll: vi.fn(),
    processAll: vi.fn(),
  },
});
