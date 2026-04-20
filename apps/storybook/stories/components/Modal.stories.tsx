import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalDivider,
  ModalButtons,
  ModalPopup,
} from '@beusable-dev/react';
import { Button, Radio, Checkbox, Dropdown, TextField } from '@beusable-dev/react';

const meta = {
  title: 'Components/Modal',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── 공통 래퍼: 오버레이가 꽉 차게 보이도록 min-height 지정 ──────────────────

const FullFrame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: '#e8e8e8', position: 'relative' }}>
    {children}
  </div>
);

// ─── A — Content ─────────────────────────────────────────────────────────────

export const TypeAContent: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [payment, setPayment] = useState<'license' | 'general'>('license');
    const [agreed, setAgreed] = useState(false);
    const [lang, setLang] = useState('en');
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={526}>
          <ModalHeader title={<span style={{ opacity: 0.9 }}>Create CX Report</span>} onClose={() => setOpen(false)} />
          <ModalBody>
            {/* Report 행 — P_13_400_120% / P_14_400_120% */}
            <div style={{ display: 'flex', gap: 10, height: 17, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.2, color: '#777', width: 100, flexShrink: 0 }}>Report</span>
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.2, color: '#2f2f2f', flex: 1 }}>Journey-based service exploration analysis</span>
            </div>
            {/* Journey 정보 박스 */}
            <div style={{ background: '#f4f4f4', border: '1px solid #d7d7d7', borderRadius: 5, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* H_16_600_100% */}
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1, color: '#2f2f2f' }}>Journey</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* P_14_400_150% */}
                {[
                  ['Domail', 'tool.beusable.net'],
                  ['Period', 'yyyy-mm-dd ~ yyyy-mm-dd'],
                  ['Device', 'Phone'],
                  ['Inflow', 'm.search.naver.com'],
                  ['Type', 'Return'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#666', width: 80, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#2f2f2f', flex: 1 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Settings 섹션 */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Language — P_13_400_100% */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 400, lineHeight: 1, color: '#777', width: 88, flexShrink: 0 }}>Language</span>
                <Dropdown
                  size="s"
                  options={[
                    { label: 'EN', value: 'en' },
                    { label: 'KO', value: 'ko' },
                  ]}
                  value={lang}
                  onChange={(v) => setLang(v as string)}
                  style={{ width: 100 }}
                />
              </div>
              {/* 점선 divider */}
              <div style={{ borderTop: '1px dashed #d7d7d7', margin: '8px 0' }} />
              {/* Payment — H_13_500_100% */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1, color: '#2f2f2f' }}>Payment</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Radio label: H_13_500_120% (Radio 컴포넌트가 처리) */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Radio size="s" color="primary" name="payment" value="license" label="CX Report License" checked={payment === 'license'} onChange={() => setPayment('license')} />
                    <Radio size="s" color="primary" name="payment" value="general" label="General Payment" checked={payment === 'general'} onChange={() => setPayment('general')} />
                  </div>
                  {/* P_13_400_150% */}
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666' }}>
                    보유 중인 CX 리포트 사용권 1개가 차감됩니다. (잔여: N)
                  </p>
                </div>
              </div>
              {/* 점선 divider */}
              <div style={{ borderTop: '1px dashed #d7d7d7', margin: '8px 0' }} />
              {/* 불릿 텍스트 — P_13_400_150% */}
              {[
                <>CX 리포트는 요청 즉시 분석되므로 <span style={{ color: '#ec0047' }}>환불이 불가능</span>합니다.</>,
                <>생성된 CX 리포트는 <span style={{ color: '#ec0047' }}>기한 제약없이 언제든지 다시 열람이 가능</span>합니다.</>,
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                    <div style={{ position: 'absolute', top: 8, left: 0, width: 3, height: 3, background: '#888', borderRadius: '50%' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666', flex: 1 }}>{text}</p>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalDivider />
          <ModalFooter
            checkbox={
              <Checkbox
                size="s"
                color="primary"
                label="I have read and agree to the above."
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            }
          >
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── A — Content (Scrollable + Fadeout) ──────────────────────────────────────

export const TypeAContentScrollable: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [payment, setPayment] = useState<'license' | 'general'>('license');
    const [agreed, setAgreed] = useState(false);
    const [lang, setLang] = useState('en');
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={526}>
          <ModalHeader title={<span style={{ opacity: 0.9 }}>Create CX Report</span>} onClose={() => setOpen(false)} />
          <ModalBody fadeout>
            <div style={{ display: 'flex', gap: 10, height: 17, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.2, color: '#777', width: 100, flexShrink: 0 }}>Report</span>
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.2, color: '#2f2f2f', flex: 1 }}>Journey-based service exploration analysis</span>
            </div>
            <div style={{ background: '#f4f4f4', border: '1px solid #d7d7d7', borderRadius: 5, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1, color: '#2f2f2f' }}>Journey</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Domail', 'tool.beusable.net'],
                  ['Period', 'yyyy-mm-dd ~ yyyy-mm-dd'],
                  ['Device', 'Phone'],
                  ['Inflow', 'm.search.naver.com'],
                  ['Type', 'Return'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#666', width: 80, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#2f2f2f', flex: 1 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 400, lineHeight: 1, color: '#777', width: 88, flexShrink: 0 }}>Language</span>
                <Dropdown
                  size="s"
                  options={[{ label: 'EN', value: 'en' }, { label: 'KO', value: 'ko' }]}
                  value={lang}
                  onChange={(v) => setLang(v as string)}
                  style={{ width: 100 }}
                />
              </div>
              <div style={{ borderTop: '1px dashed #d7d7d7', margin: '8px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1, color: '#2f2f2f' }}>Payment</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Radio size="s" color="primary" name="payment2" value="license" label="CX Report License" checked={payment === 'license'} onChange={() => setPayment('license')} />
                    <Radio size="s" color="primary" name="payment2" value="general" label="General Payment" checked={payment === 'general'} onChange={() => setPayment('general')} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666' }}>
                    보유 중인 CX 리포트 사용권 1개가 차감됩니다. (잔여: N)
                  </p>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed #d7d7d7', margin: '8px 0' }} />
              {[
                <>CX 리포트는 요청 즉시 분석되므로 <span style={{ color: '#ec0047' }}>환불이 불가능</span>합니다.</>,
                <>생성된 CX 리포트는 <span style={{ color: '#ec0047' }}>기한 제약없이 언제든지 다시 열람이 가능</span>합니다.</>,
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                    <div style={{ position: 'absolute', top: 8, left: 0, width: 3, height: 3, background: '#888', borderRadius: '50%' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666', flex: 1 }}>{text}</p>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalDivider />
          <ModalFooter
            checkbox={
              <Checkbox
                size="s"
                color="primary"
                label="I have read and agree to the above."
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
            }
          >
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── B-1 — Confirmation ───────────────────────────────────────────────────────

export const TypeB1Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={428}>
          <ModalPopup>
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ flexShrink: 0 }}>
              <path d="M26.0002 45.76C36.9134 45.76 45.7602 36.9131 45.7602 26C45.7602 15.0868 36.9134 6.23999 26.0002 6.23999C15.0871 6.23999 6.24023 15.0868 6.24023 26C6.24023 36.9131 15.0871 45.76 26.0002 45.76Z" stroke="#57AB00" strokeWidth="2.08"/>
              <path d="M34.3226 19.7705L22.2918 32.2505L16.6426 26.4388" stroke="#57AB00" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: '#444', textAlign: 'center' }}>
              Your report has been sent.
            </p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#2f2f2f', textAlign: 'center' }}>
              We will look into it and get back to you shortly.
            </p>
            <div style={{ height: 18 }} />
            <ModalButtons>
              <Button variant="secondary" onClick={() => setOpen(false)}>Confirm</Button>
            </ModalButtons>
          </ModalPopup>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── B-2 — Alert ─────────────────────────────────────────────────────────────

export const TypeB2Alert: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={428}>
          <ModalPopup>
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M18.6808 8.31982H33.3198L43.6803 18.6803V33.3193L33.3198 43.6798H18.6808L8.32031 33.3193V18.6803L18.6808 8.31982Z" stroke="#EC0047" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M26 19.76V27.04" stroke="#EC0047" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M26.001 30.6792C26.4317 30.6792 26.7811 31.0288 26.7812 31.4595C26.7812 31.8903 26.4318 32.2397 26.001 32.2397C25.5703 32.2396 25.2207 31.8902 25.2207 31.4595C25.2208 31.0288 25.5703 30.6793 26.001 30.6792Z" fill="#EC0047" stroke="#EC0047" strokeWidth="1.04"/>
            </svg>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: '#444', textAlign: 'center' }}>
              Download Restriction Guide
            </p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#2f2f2f', textAlign: 'center' }}>
              The URL collected exceeds the maximum number of rows in Excel. Some low-rank data may be missing.
            </p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#e60724', textAlign: 'center' }}>
              Maximum number of rows provided by Excel: 1,048,576
            </p>
            <div style={{ height: 18 }} />
            <ModalButtons>
              <Button variant="secondary" onClick={() => setOpen(false)}>Confirm</Button>
            </ModalButtons>
          </ModalPopup>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── B-3 — Prompt ────────────────────────────────────────────────────────────

export const TypeB3Prompt: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [emailInput, setEmailInput] = useState('');
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={428}>
          <ModalPopup narrow>
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M33.2795 11.4401H36.9195C38.9298 11.4401 40.5595 13.0439 40.5595 15.0223V40.0978C40.5595 42.0763 38.9298 43.6801 36.9195 43.6801H15.0795C13.0691 43.6801 11.4395 42.0763 11.4395 40.0978V15.0223C11.4395 13.0439 13.0691 11.4401 15.0795 11.4401H18.7195" stroke="#767676" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32.2388 8.32007H19.7588C19.1844 8.32007 18.7188 8.78569 18.7188 9.36007V13.5201C18.7188 14.0944 19.1844 14.5601 19.7588 14.5601H32.2388C32.8131 14.5601 33.2788 14.0944 33.2788 13.5201V9.36007C33.2788 8.78569 32.8131 8.32007 32.2388 8.32007Z" fill="#EBEBEB" stroke="#767676" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M34.8426 32.2401L30.0426 37.4401L27.0391 34.8391" stroke="#57AB00" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.7188 20.8H33.2788" stroke="#767676" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.7188 26H28.8659" stroke="#767676" strokeWidth="2.08" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* 타이틀 — pb:12 추가 여백 */}
            <div style={{ paddingBottom: 12, width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: '#444', textAlign: 'center', flex: 1 }}>
                Time zone setting
              </p>
            </div>
            {/* 정보 박스 */}
            <div style={{ background: '#f4f4f4', border: '1px solid #d7d7d7', borderRadius: 6, padding: 20, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, lineHeight: 1.5 }}>
              {[
                ['Domain', 'beusable.net'],
                ['Timezone', '(-03:00) America/Argentina/Buenos_Aires'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#666', width: 80, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#2f2f2f', flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>
            {/* 설명 — py:12 */}
            <div style={{ paddingTop: 12, paddingBottom: 12, width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, color: '#2f2f2f', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                <p style={{ margin: 0 }}>A running report exists with the domain you entered.</p>
                <p style={{ margin: 0 }}>&nbsp;</p>
                <p style={{ margin: 0 }}>The time zone is set on a per-domain basis and cannot be changed after it is run.</p>
              </div>
            </div>
            {/* 이메일 입력 — pb:16 */}
            <div style={{ width: '100%', boxSizing: 'border-box', paddingBottom: 16 }}>
              <TextField
                label="Email address"
                placeholder="Please enter your email address."
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            {/* 링크 — pt:4 */}
            <div style={{ paddingTop: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <a href="#" style={{ fontSize: 12, color: '#0074ff', textDecoration: 'underline', textAlign: 'center' }}>
                Don't remember the email you signed up with?
              </a>
            </div>
            {/* spacer */}
            <div style={{ height: 18 }} />
            <ModalButtons>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary-outline" onClick={() => setOpen(false)}>Confirm</Button>
            </ModalButtons>
          </ModalPopup>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── C — Loading ─────────────────────────────────────────────────────────────

export const TypeCLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={600}>
          {/* 흰 영역 — 일러스트 + 로딩 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 40px 32px', gap: 20 }}>
            {/* 캐릭터 일러스트 placeholder */}
            <div style={{ width: 240, height: 120, background: '#f4f4f4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#d7d7d7" strokeWidth="2" />
                <circle cx="18" cy="20" r="3" fill="#d7d7d7" />
                <circle cx="30" cy="20" r="3" fill="#d7d7d7" />
                <path d="M16 30 Q24 36 32 30" stroke="#d7d7d7" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            {/* 로딩 도트 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#d7d7d7',
                    animation: `loadingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: '#666' }}>Loading...</p>
          </div>
          {/* 다크 하단 패널 */}
          <div
            style={{
              margin: '0 16px 16px',
              background: '#222',
              borderRadius: 6,
              padding: '20px 40px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Tip 배지 + 설명 텍스트 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span
                style={{
                  background: '#43b6c9',
                  borderRadius: 2,
                  padding: '2px 6px',
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1,
                  color: '#fff',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Tip !
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: '#ffd900',
                }}
              >
                Did you know? You can create up to 10 reports per month with your current plan.
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#bbb' }}>
              Beusable analyzes real user journeys to help you understand how visitors interact with your site. Reports are generated based on collected session data.
            </p>
          </div>
          <style>{`
            @keyframes loadingDot {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── D — Registration ────────────────────────────────────────────────────────

const imgLogoBeusable = 'https://www.figma.com/api/mcp/asset/d07d0127-1476-4ca4-8857-f9e4566fe301';
const imgRocketIcon = 'https://www.figma.com/api/mcp/asset/a0a67b7a-e856-47f2-b152-21ce3fe4c650';

export const TypeDRegistration: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        )}
        <Modal open={open} onClose={() => setOpen(false)} width={720}>
          <div style={{ display: 'flex', minHeight: 483 }}>
            {/* 왼쪽 브랜딩 패널 — w:260, padding:40 */}
            <div
              style={{
                width: 260,
                flexShrink: 0,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {/* 로고 — w:112, h:20, top:40, left:40 */}
              <img src={imgLogoBeusable} alt="Beusable" style={{ width: 112, height: 20, display: 'block' }} />
              {/* Sign Up 타이틀 + 설명 + 로켓 — top:120, left:40, gap:20 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 40 }}>
                {/* H_40_600_100% */}
                <p style={{ margin: 0, fontSize: 40, fontWeight: 600, lineHeight: 1, color: '#444' }}>Sign Up</p>
                {/* P_13_400_150% #666 */}
                <p style={{ margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.5, color: '#666' }}>
                  {"You can use all of Beusable's services with a single ID!"}
                </p>
                {/* 로켓 아이콘 — 68×68 */}
                <img src={imgRocketIcon} alt="" style={{ width: 68, height: 68, display: 'block' }} />
              </div>
            </div>
            {/* 오른쪽 폼 패널 — left:260, top:0, w:460 */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                minHeight: 483,
                boxSizing: 'border-box',
              }}
            >
              {/* Company — top:76, left:60, w:340 */}
              <div style={{ position: 'absolute', top: 76, left: 60, width: 340 }}>
                <TextField
                  label="Company"
                  placeholder="Please enter your company name."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              {/* Email — top:163, left:60, w:340 */}
              <div style={{ position: 'absolute', top: 163, left: 60, width: 340 }}>
                <TextField
                  label="Email"
                  placeholder="Please enter your email address."
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* Password — top:250, left:60, w:340 */}
              <div style={{ position: 'absolute', top: 250, left: 60, width: 340 }}>
                <TextField
                  label="Password"
                  placeholder="Please enter at minimum 6 characters."
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Checkbox — top:338, left:60, size:18 */}
              <div style={{ position: 'absolute', top: 338, left: 60 }}>
                <Checkbox
                  size="s"
                  color="primary"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              {/* 동의 텍스트 — top:337, left:84, w:312, P_13_400_150% #666 */}
              <p
                style={{
                  position: 'absolute',
                  top: 337,
                  left: 84,
                  width: 312,
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: '#666',
                }}
              >
                I agree to the Beusable Analytics Terms of Service and Privacy Policy.
              </p>
              {/* 에러 텍스트 — top:381, left:84, w:312, 12px #e60724 */}
              <p
                style={{
                  position: 'absolute',
                  top: 381,
                  left: 84,
                  width: 312,
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: '#e60724',
                }}
              >
                {'Please agree to the Terms of Service & Privacy Policy.'}
              </p>
              {/* 버튼 — Cancel: left:395 top:419 / Continue: left:489 top:419 */}
              <div style={{ position: 'absolute', top: 419, left: '50%', transform: 'translateX(-50%)',display: 'flex', gap: 4 }}>
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setOpen(false)}>Continue</Button>
              </div>
            </div>
          </div>
        </Modal>
      </FullFrame>
    );
  },
};

// ─── ModalHeader Variants ─────────────────────────────────────────────────────
// sm(16px 별도 행) × lg(24px 인라인) 각 타입 시각적 확인

export const ModalHeaderVariants: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    const sampleIcon = (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#f0f4ff"/>
        <path d="M12 20h16M20 12v16" stroke="#0085ff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );

    const sampleAction = (
      <Button variant="primary" size="s">저장</Button>
    );

    return (
      <FullFrame>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button variant="primary" onClick={() => setOpen(true)}>Open</Button>
          </div>
        )}
        <div style={{ padding: 40, display: 'flex', flexWrap: 'wrap', gap: 24 }}>

          {/* sm: Type 1 — close only */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 1 — close only</div>
            <ModalHeader onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* sm: Type 2 — title + close */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 2 — title + close</div>
            <ModalHeader title="모달 타이틀" onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* sm: Type 3 — title + desc + close */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 3 — title + desc + close</div>
            <ModalHeader title="모달 타이틀" description="보조 설명 텍스트가 여기 들어갑니다." onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* sm: Type 4 — step + title + desc */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 4 — step + title + desc</div>
            <ModalHeader step={1} title="단계별 설정" description="1단계 내용을 입력해 주세요." onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* sm: Type 5 — icon + title + desc + action */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 5 — icon + title + desc + action</div>
            <ModalHeader icon={sampleIcon} title="아이콘 타이틀" description="아이콘과 함께 표시되는 설명입니다." action={sampleAction} onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* sm: Type 6 — centered, large title */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>sm · Type 6 — center + large title</div>
            <ModalHeader title="중앙 정렬 타이틀" description="설명도 가운데 정렬됩니다." textAlign="center" titleSize="large" onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 1 — close only */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 1 — close only</div>
            <ModalHeader closeSize="lg" onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 2 — title + close inline */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 2 — title + close (inline)</div>
            <ModalHeader closeSize="lg" title="모달 타이틀" onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 3 — title + desc + close */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 3 — title + desc + close</div>
            <ModalHeader closeSize="lg" title="모달 타이틀" description="보조 설명 텍스트가 여기 들어갑니다." onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 4 — step + close */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 4 — step + close</div>
            <ModalHeader closeSize="lg" step={2} title="단계별 설정" description="2단계 내용을 입력해 주세요." onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 5 — icon + title + desc + action + close */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 5 — icon + title + desc + action + close</div>
            <ModalHeader closeSize="lg" icon={sampleIcon} title="아이콘 타이틀" description="아이콘과 함께 표시되는 설명입니다." action={sampleAction} onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

          {/* lg: Type 6 — centered, large title */}
          <div style={{ width: 428, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>lg · Type 6 — center + large title</div>
            <ModalHeader closeSize="lg" title="중앙 정렬 타이틀" description="설명도 가운데 정렬됩니다." textAlign="center" titleSize="large" onClose={() => {}} />
            <ModalBody><div style={{ color: '#aaa', fontSize: 13 }}>본문 영역</div></ModalBody>
          </div>

        </div>
      </FullFrame>
    );
  },
};

// ─── ModalFooter Variants ─────────────────────────────────────────────────────
// Figma 4가지 타입 시각적 확인

export const ModalFooterVariants: Story = {
  render: () => {
    const [agreed, setAgreed] = useState(false);

    const nextArrow = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6.46594 13.5098L11.5391 8.00977L6.46594 2.48279" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    const nextBtn = (
      <Button variant="primary-outline" rightIcon={nextArrow}>Next</Button>
    );

    const backArrow = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9.534 13.5098L4.461 8.00977L9.534 2.48279" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );

    const backBtn = (
      <Button variant="secondary-ghost" size="s" leftIcon={backArrow}>Back</Button>
    );

    return (
      <FullFrame>
        <div style={{ padding: 40, display: 'flex', flexWrap: 'wrap', gap: 24 }}>

          {/* Type 1 — checkbox + Cancel/Confirm */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>Type 1 — checkbox + Cancel / Confirm (with divider)</div>
            <ModalDivider />
            <ModalFooter
              checkbox={
                <Checkbox
                  size="s"
                  color="primary"
                  label="I have read and agree to the above."
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              }
            >
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Confirm</Button>
            </ModalFooter>
          </div>

          {/* Type 2 — checkbox + Back / Next */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>Type 2 — checkbox + Back / Next (with divider)</div>
            <ModalDivider />
            <ModalFooter
              checkbox={
                <Checkbox
                  size="s"
                  color="primary"
                  label="I have read and agree to the above."
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              }
              leftAction={backBtn}
            >
              {nextBtn}
            </ModalFooter>
          </div>

          {/* Type 3 — Back / Next only (no divider) */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>Type 3 — Back / Next (no divider)</div>
            <ModalFooter leftAction={backBtn}>
              {nextBtn}
            </ModalFooter>
          </div>

          {/* Type 4 — empty (no divider) */}
          <div style={{ width: 526, background: '#fff', borderRadius: 14, boxShadow: '0 8px 14px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '4px 8px', background: '#f5f5f5', fontSize: 11, color: '#888' }}>Type 4 — empty (no divider)</div>
            <ModalFooter />
          </div>

        </div>
      </FullFrame>
    );
  },
};
