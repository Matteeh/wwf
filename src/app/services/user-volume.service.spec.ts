import { TestBed } from '@angular/core/testing';

import { UserVolumeService } from './user-volume.service';

describe('UserVolumeService', () => {
  let service: UserVolumeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserVolumeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
