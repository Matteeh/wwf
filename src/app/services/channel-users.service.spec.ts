import { TestBed } from '@angular/core/testing';

import { ChannelUsersService } from './channel-users.service';

describe('ChannelUsersService', () => {
  let service: ChannelUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChannelUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
