import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "타임패널의 개인정보 처리 및 쿠키 사용 방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-[14px] leading-relaxed text-muted space-y-6">
      <h1 className="text-text text-xl font-semibold">개인정보처리방침</h1>
      <p className="text-xs">시행일: 2026년 7월 21일</p>
      {/* TODO: 실제 서비스 오픈일 및 사업자 정보로 교체하세요 */}

      <div>
        <h2 className="text-text text-base font-semibold mb-2">1. 수집하는 정보</h2>
        <p>
          타임패널은 회원가입 없이 이용할 수 있는 서비스이며, 타이머 설정값과
          랩 기록은 서버로 전송되지 않고 사용자의 브라우저 안에서만 처리됩니다.
          별도의 개인정보(이름, 이메일, 전화번호 등)를 직접 수집하지 않습니다.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">2. 쿠키 및 광고</h2>
        <p>
          이 사이트는 Google AdSense를 포함한 제3자 광고 서비스를 이용할 수
          있습니다. Google을 비롯한 광고 제공업체는 사용자의 이전 방문 기록을
          기반으로 광고를 게재하기 위해 쿠키(DART 쿠키 등)를 사용할 수 있습니다.
        </p>
        <p className="mt-2">
          Google의 광고 쿠키 사용에 대해 자세히 알아보거나 맞춤 광고를 거부하고
          싶다면{" "}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal hover:underline"
          >
            Google 광고 설정
          </a>{" "}
          페이지를 방문해주세요.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">3. 제3자 서비스</h2>
        <p>
          웹사이트 이용 통계 분석 및 광고 게재를 위해 Google Analytics, Google
          AdSense 등 제3자 서비스를 사용할 수 있으며, 각 서비스는 자체
          개인정보처리방침에 따라 정보를 처리합니다.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">4. 방침 변경</h2>
        <p>
          본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 본
          페이지를 통해 고지합니다.
        </p>
      </div>

      <div>
        <h2 className="text-text text-base font-semibold mb-2">5. 문의</h2>
        <p>
          개인정보 처리와 관련한 문의는{" "}
          <span className="text-text font-mono">contact@example.com</span>{" "}
          으로 연락해주세요.
        </p>
        {/* TODO: 실제 연락 가능한 이메일 주소로 교체하세요 */}
      </div>
    </div>
  );
}
