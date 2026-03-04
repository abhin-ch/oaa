import { describe, it, expect } from 'vitest';
import { fetchClimateData, getClimateData, getDefaultClimateData } from '@/engine/shared/climate';

describe('climate', () => {
  describe('getDefaultClimateData', () => {
    it('returns Toronto defaults', () => {
      const data = getDefaultClimateData();
      expect(data.hdd).toBe(3520);
      expect(data.cdd).toBe(350);
      expect(data.zone).toBe('6A');
      expect(data.location).toContain('Toronto');
    });

    it('returns a copy (not the same reference)', () => {
      const a = getDefaultClimateData();
      const b = getDefaultClimateData();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe('getClimateData', () => {
    it('returns Toronto data for Toronto coordinates', () => {
      const data = getClimateData(43.65, -79.38);
      expect(data.hdd).toBe(3520);
      expect(data.cdd).toBe(350);
      expect(data.zone).toBe('6A');
    });

    it('returns Ottawa data for Ottawa coordinates', () => {
      const data = getClimateData(45.42, -75.69);
      expect(data.hdd).toBe(4440);
      expect(data.designHeatTemp).toBe(-25);
    });

    it('returns Vancouver data for Vancouver coordinates', () => {
      const data = getClimateData(49.28, -123.12);
      expect(data.hdd).toBe(2825);
      expect(data.zone).toBe('5C');
    });

    it('returns Calgary data for Calgary coordinates', () => {
      const data = getClimateData(51.05, -114.07);
      expect(data.hdd).toBe(5000);
      expect(data.zone).toBe('7A');
    });

    it('finds nearest city for nearby coordinates', () => {
      // Slightly offset from Toronto
      const data = getClimateData(43.7, -79.4);
      expect(data.location).toBe('Toronto, ON');
    });

    it('returns nearest city even for distant coordinates', () => {
      // Far north — should still return something
      const data = getClimateData(60, -100);
      expect(data.hdd).toBeGreaterThan(0);
      expect(data.zone).toBeTruthy();
    });

    it('colder cities have higher HDD', () => {
      const toronto = getClimateData(43.65, -79.38);
      const winnipeg = getClimateData(49.9, -97.14);
      expect(winnipeg.hdd).toBeGreaterThan(toronto.hdd);
    });

    it('Vancouver has lower HDD than prairie cities', () => {
      const vancouver = getClimateData(49.28, -123.12);
      const calgary = getClimateData(51.05, -114.07);
      expect(vancouver.hdd).toBeLessThan(calgary.hdd);
    });
  });

  describe('fetchClimateData', () => {
    it('returns same data as sync version', async () => {
      const syncData = getClimateData(43.65, -79.38);
      const asyncData = await fetchClimateData(43.65, -79.38);
      expect(asyncData).toEqual(syncData);
    });

    it('returns a valid ClimateResult', async () => {
      const data = await fetchClimateData(45.5, -73.57);
      expect(data).toHaveProperty('hdd');
      expect(data).toHaveProperty('cdd');
      expect(data).toHaveProperty('designHeatTemp');
      expect(data).toHaveProperty('designCoolTemp');
      expect(data).toHaveProperty('zone');
      expect(data).toHaveProperty('location');
    });
  });

  describe('ClimateResult shape', () => {
    it('all fields are numbers except zone and location', () => {
      const data = getClimateData(43.65, -79.38);
      expect(typeof data.hdd).toBe('number');
      expect(typeof data.cdd).toBe('number');
      expect(typeof data.designHeatTemp).toBe('number');
      expect(typeof data.designCoolTemp).toBe('number');
      expect(typeof data.zone).toBe('string');
      expect(typeof data.location).toBe('string');
    });

    it('HDD and CDD are non-negative', () => {
      const data = getClimateData(43.65, -79.38);
      expect(data.hdd).toBeGreaterThanOrEqual(0);
      expect(data.cdd).toBeGreaterThanOrEqual(0);
    });

    it('design temperatures are reasonable', () => {
      const data = getClimateData(43.65, -79.38);
      expect(data.designHeatTemp).toBeLessThan(0); // below freezing
      expect(data.designCoolTemp).toBeGreaterThan(20); // warm
    });
  });
});
