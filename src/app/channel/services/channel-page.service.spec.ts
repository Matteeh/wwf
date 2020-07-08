import { TestBed } from '@angular/core/testing';

import { ChannelPageService } from './channel-page.service';

describe('ChannelPageService', () => {
  let service: ChannelPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
