import { createContext } from 'react';
import { DEFAULT_BRANDS, DEFAULT_DISCOUNTS, DEFAULT_EQUIPMENT, DEFAULT_EVENT_BANNERS, DEFAULT_HOME_BANNER, DEFAULT_NOTICES, DEFAULT_SETS } from './data/defaults';

export const EquipCtx = createContext(DEFAULT_EQUIPMENT);

export const SiteCtx = createContext({
  homeBanner: DEFAULT_HOME_BANNER,
  eventBanners: DEFAULT_EVENT_BANNERS,
  sets: DEFAULT_SETS,
  bestIds: [],
  notices: DEFAULT_NOTICES,
  brands: DEFAULT_BRANDS,
  discounts: DEFAULT_DISCOUNTS,
});
