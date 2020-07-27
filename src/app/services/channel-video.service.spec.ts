import { TestBed } from '@angular/core/testing';

import { ChannelVideoService } from './channel-video.service';

describe('ChannelVideoService', () => {
  let service: ChannelVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
