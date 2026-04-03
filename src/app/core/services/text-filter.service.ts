import { Injectable } from '@angular/core';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/lib/en';
import badWordsTagalog from '../../../assets/json/tagalog-badwords.json';
import badWordsEnglish from '../../../assets/json/english-badwords.json';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class TextFilterService {
  private filter = new BadWordsNext();

  constructor() {
    this.filter.add(en);
  }

  isProfaneCustom(text: string): boolean {
    if (!text) return false;

    return [...badWordsEnglish, ...badWordsTagalog].some((badWord) =>
      text.toLowerCase().includes(badWord.toLowerCase()),
    );
  }

  isProfane(text: string): boolean {
    return typeof text === 'string' && text.trim().length > 0
      ? this.filter.check(text.toLowerCase())
      : false;
  }

  clean(text: string): string {
    return typeof text === 'string' && text.trim().length > 0
      ? this.filter.filter(text)
      : text;
  }

  profanityValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.isProfaneCustom(control.value) || this.isProfane(control.value)
      ? { profane: true }
      : null;
  };
}
