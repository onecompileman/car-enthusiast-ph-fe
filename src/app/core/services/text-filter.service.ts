import { Injectable } from '@angular/core';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/lib/en';
import badWords from '../../../assets/json/tagalog-badwords.json';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class TextFilterService {
  private filter = new BadWordsNext();

  constructor() {
    this.filter.add(en);
    this.filter.add({
      id: 'tl',
      words: badWords,
      lookalike: {
        '@': 'a',
        '0': 'o',
        '1': 'i',
        '3': 'e',
        '4': 'a',
        '5': 's',
        '6': 'g',
        '7': 't',
        '8': 'b',
      },
    });
  }

  isProfane(text: string): boolean {
    return typeof text === 'string' && text.trim().length > 0
      ? this.filter.check(text)
      : false;
  }

  clean(text: string): string {
    return typeof text === 'string' && text.trim().length > 0
      ? this.filter.filter(text)
      : text;
  }

  profanityValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.isProfane(control.value) ? { profane: true } : null;
  };
}
