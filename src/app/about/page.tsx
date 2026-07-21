import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "타임패널을 만든 이유와 운영 방식을 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-[14px] leading-relaxed text-muted space-y-6">
      <h1 className="text-text text-xl font-semibold">타임패널 소개</h1>

      <p>
        타임패널은 &quot;설치 없이, 광고 없이 방해받지 않고, 빠르게 쓸 수 있는
        타이머&quot;를 목표로 만든 개인 프로젝트입니다. 앱스토어에서 타이머
        앱을 찾아 설치하고 권한을 허용하는 과정 없이, 브라우저 주소창에 접속하는
        즉시 카운트다운과 스탑워치를 쓸 수 있도록 설계했습니다.
      </p>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">만든 이유</h2>
        <p>
          짧은 시간을 재는 데도 무거운 앱을 설치해야 하거나, 팝업 광고에 화면이
          가려지는 경험이 불편해서 직접 만들게 되었습니다. 핵심 기능(정확한
          시간 측정)에 집중하고, 나머지는 최대한 덜어내는 방향으로 운영하고
          있습니다.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">운영 방식</h2>
        <p>
          이 사이트는 별도의 회원가입이나 로그인 없이 누구나 무료로 이용할 수
          있습니다. 서비스 운영을 위해 일부 페이지에 광고가 표시될 수 있으며,
          자세한 내용은{" "}
          <a href="/privacy" className="text-teal hover:underline">
            개인정보처리방침
          </a>
          에서 확인하실 수 있습니다.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">문의</h2>
        <p>
          버그 제보나 기능 제안은 아래 이메일로 보내주시면 확인 후 반영하겠습니다.
        </p>
        <p className="text-text font-mono text-sm mt-1">contact@example.com</p>
        {/* TODO: 실제 연락 가능한 이메일 주소로 교체하세요 */}
      </div>
    </div>
  );
}
