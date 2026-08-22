// /user-chat(확장 상태) 페이지의 "축소" 버튼이 눌렸을 때, 전역으로 마운트된
// FloatingChatWidget에게 "이전 위치로 돌아가면 1단계 패널을 다시 열어달라"고 알리는 이벤트.
// 두 컴포넌트가 형제 관계라 직접 props로 전달할 수 없어 이벤트로 연결한다.
export const FLOATING_CHAT_COLLAPSE_EVENT = 'floating-chat-collapse-request';
