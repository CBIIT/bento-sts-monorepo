import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
const response = [{ name: 'A', nanoid: 'A-3', version: '3.0.0', is_latest_version: true, counts: { nodes: 2, properties: 3, relationships: 1 } }, { name: 'A', nanoid: 'A-2', version: '2.0.0', is_latest_version: false, counts: { nodes: 0, properties: 0, relationships: 0 } }];
const mount = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><App /></QueryClientProvider>);
beforeEach(() => { window.location.hash = '#/'; vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(response), { status: 200 })))); });
afterEach(() => vi.unstubAllGlobals());
it('renders API-backed cards and current-version controls', async () => {
  mount();
  expect(screen.getByRole('heading', { name: 'Browse Models' })).toBeInTheDocument();
  const card = await screen.findByRole('article', { name: 'A version 3.0.0' });
  expect(within(card).getByText('Nodes')).toBeInTheDocument();
  expect(within(card).getByRole('link', { name: 'View Details' })).toHaveAttribute('href', '#/model/A/3.0.0');
  expect(screen.getByRole('checkbox', { name: 'Include all versions' })).not.toBeChecked();
});
it('includes older versions without refetching inventory', async () => {
  mount(); await screen.findByRole('article');
  await userEvent.click(screen.getByRole('checkbox', { name: 'Include all versions' }));
  expect(screen.getByRole('checkbox', { name: 'Include all versions' })).toBeChecked();
  await waitFor(() => expect(window.location.hash).toContain('all=true'));
  expect(await screen.findByRole('article', { name: 'A version 2.0.0' })).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('shows recoverable errors instead of empty success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
  mount(); expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load data');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  expect(screen.queryByText('No models to display')).not.toBeInTheDocument();
});
it('uses explicit select-none and shows an empty state', async () => {
  mount(); await screen.findByRole('article');
  await userEvent.click(screen.getByRole('button', { name: /Models/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Clear model selection' }));
  expect(await screen.findByRole('heading', { name: 'No models to display' })).toBeInTheDocument();
});

it('updates model checkbox state immediately and retains it in the URL', async () => {
  mount(); await screen.findByRole('article');
  await userEvent.click(screen.getByRole('button', { name: /Models/ }));
  await userEvent.click(screen.getByRole('checkbox', { name: /^A$/ }));
  expect(screen.getByRole('checkbox', { name: /^A$/ })).not.toBeChecked();
  expect(window.location.hash).toContain('none=true');
});

it('renders an existing zero-node detail as empty, not a network error', async () => {
  window.location.hash = '#/model/A/3.0.0';
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([{ ...response[0], counts: { nodes: 0, properties: 0, relationships: 0 } }])))));
  mount();
  expect(await screen.findByRole('heading', { name: 'No nodes in this model version' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('renders missing model-version details as not found', async () => {
  window.location.hash = '#/model/A/missing';
  mount();
  expect(await screen.findByRole('heading', { name: 'Model version not found' })).toBeInTheDocument();
});
it('renders a detail service outage with retry', async () => {
  window.location.hash = '#/model/A/3.0.0';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load data');
});
