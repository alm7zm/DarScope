import { describe, expect, it } from 'vitest';
import { teamPhotoUrl } from '../components/about/teamPhotos.js';
import { INSTRUCTOR, TEAM } from './team.js';

const withPhoto = [...TEAM, INSTRUCTOR].filter((person) => person.photo);

describe('team photos in constants/team.js', () => {
  it('finds the photo of everyone who has one in src/assets/team/', () => {
    for (const { name, photo } of withPhoto) {
      expect(
        teamPhotoUrl(photo),
        `${name}: there is no file called "${photo}" in src/assets/team/`,
      ).toBeTruthy();
    }
  });
});
