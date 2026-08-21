import { FaComments } from 'react-icons/fa6';

// 플로팅 챗봇 아이콘 그래픽만 담당하는 컴포넌트.
// 지금은 react-icons 플레이스홀더이며, 실제 아이콘/이미지 에셋이 준비되면
// 이 파일 안의 내용만 바꾸면 된다(다른 곳에서 아이콘 마크업을 직접 참조하지 않음).
export default function FloatingChatGlyph() {
  return <FaComments aria-hidden="true" />;
}
