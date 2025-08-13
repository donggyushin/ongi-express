/**
 * 한글 닉네임 유효성 검사 유틸리티
 * 한글만 허용, 공백 및 특수문자 불허
 */

/**
 * 한글 문자열인지 검사합니다
 * 한글 자모, 완성형 한글만 허용 (ㄱ-ㅎ, ㅏ-ㅣ, 가-힣)
 * @param text 검사할 문자열
 * @returns 한글만 포함된 경우 true
 */
export function isKoreanOnly(text: string): boolean {
  // 빈 문자열 체크
  if (!text || text.trim().length === 0) {
    return false;
  }

  // 한글 유니코드 범위: 자음(ㄱ-ㅎ), 모음(ㅏ-ㅣ), 완성형 한글(가-힣)
  const koreanRegex = /^[ㄱ-ㅎㅏ-ㅣ가-힣]+$/;
  
  return koreanRegex.test(text);
}

/**
 * 닉네임 유효성을 검사합니다
 * @param nickname 검사할 닉네임
 * @param minLength 최소 길이 (기본값: 2)
 * @param maxLength 최대 길이 (기본값: 50)
 * @returns 유효성 검사 결과
 */
export function validateKoreanNickname(
  nickname: string,
  minLength: number = 2,
  maxLength: number = 50
): { isValid: boolean; error?: string } {
  // 빈 값 체크
  if (!nickname) {
    return { isValid: false, error: '닉네임을 입력해주세요.' };
  }

  // 길이 체크
  if (nickname.length < minLength) {
    return { isValid: false, error: `닉네임은 최소 ${minLength}자 이상이어야 합니다.` };
  }

  if (nickname.length > maxLength) {
    return { isValid: false, error: `닉네임은 최대 ${maxLength}자까지 가능합니다.` };
  }

  // 공백 체크
  if (nickname.includes(' ')) {
    return { isValid: false, error: '닉네임에 공백을 포함할 수 없습니다.' };
  }

  // 한글만 허용 체크
  if (!isKoreanOnly(nickname)) {
    return { isValid: false, error: '닉네임은 한글만 사용 가능합니다.' };
  }

  return { isValid: true };
}