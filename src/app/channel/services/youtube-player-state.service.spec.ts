import { TestBed } from '@angular/core/testing';

import { YoutubePlayerStateService } from './youtube-player-state.service';

describe('YoutubePlayerStateService', () => {
  let service: YoutubePlayerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoutubePlayerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
