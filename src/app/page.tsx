import TimerPanel from "@/components/TimerPanel";

export default function Home() {
  return (
    <div className="pt-6">
      <TimerPanel />

      <section className="max-w-xl mx-auto px-4 mt-4 mb-16 text-[14px] leading-relaxed text-muted space-y-8">
        <div>
          <h1 className="text-text text-lg font-semibold mb-2">
            설치 없이 바로 쓰는 카운트다운 타이머 &amp; 스탑워치
          </h1>
          <p>
            타임패널은 회원가입이나 앱 설치 없이 브라우저에서 바로 사용할 수 있는
            무료 온라인 타이머입니다. 요리할 때 라면 끓이는 시간을 재거나, 공부나
            업무에 뽀모도로 기법을 적용하거나, 운동할 때 인터벌 시간을 측정하는 등
            다양한 상황에서 활용할 수 있어요.
          </p>
        </div>

        <div>
          <h2 className="text-text text-base font-semibold mb-2">이런 분들에게 유용해요</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>발표나 스피치 연습 시간을 정확히 재고 싶을 때</li>
            <li>운동 인터벌(타바타, 서킷 트레이닝) 시간을 관리할 때</li>
            <li>요리, 반신욕, 명상처럼 정해진 시간이 필요한 활동을 할 때</li>
            <li>공부나 업무에 뽀모도로 타이머를 적용하고 싶을 때</li>
            <li>달리기, 수영 등 랩타임을 기록하고 싶을 때</li>
          </ul>
        </div>

        <div>
          <h2 className="text-text text-base font-semibold mb-2">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div>
              <p className="text-text font-medium">탭을 다른 창으로 전환해도 시간이 정확한가요?</p>
              <p>
                네. 실제 시각을 기준으로 남은 시간과 경과 시간을 계산하기 때문에
                브라우저 탭이 백그라운드에 있어도 시간이 밀리지 않습니다.
              </p>
            </div>
            <div>
              <p className="text-text font-medium">알림음이 나오지 않아요.</p>
              <p>
                브라우저 정책상 사용자가 페이지에서 한 번 이상 클릭한 뒤에만 소리가
                재생됩니다. 시작 버튼을 누른 상태라면 정상적으로 알림음이 울립니다.
              </p>
            </div>
            <div>
              <p className="text-text font-medium">스탑워치 랩 기록은 저장되나요?</p>
              <p>
                랩 기록은 현재 세션에서만 유지되며, 페이지를 새로고침하면 초기화됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
