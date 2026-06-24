console.log('[tanstack] Loading server entry...');
const { default: handler } = await import('@tanstack/react-start/server-entry');
console.log('[tanstack] Server entry loaded.');

// oxlint-disable-next-line no-default-export
export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
};
