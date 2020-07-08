import { TestBed } from '@angular/core/testing';

import { ChannelVideoStateService } from './channel-video-state.service';

describe('ChannelVideoStateService', () => {
  let service: ChannelVideoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelVideoStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
