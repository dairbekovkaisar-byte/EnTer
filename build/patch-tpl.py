#!/usr/bin/env python3
"""Turns the design template into the template of the working app: real values instead of samples."""
import sys, re
S = sys.argv[1]
src = open(S + '/src/app/app.tpl.html', encoding='utf8').read()
CLOSE = '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>'
CHECK16 = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"></path></svg>'
CROSS16 = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>'
THEME_BTN = '<button type="button" class="iconbtn" aria-label="{{themeAria}}" title="{{themeAria}}" onClick="{{toggleTheme}}"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="{{themeIcon}}"></path></svg></button>'
R = [
 # navigation: the same initial everywhere
 ('{{t.profileInitial}}', '{{initial}}', 3),
 # onboarding: say when a pair is not ready yet
 ('<sc-if value="{{pairsMore}}" hint-placeholder-val="{{true}}"><button type="button" class="lnk" onClick="{{showAllPairs}}">{{t.onbMore}}</button></sc-if>\n    </fieldset>',
  '<sc-if value="{{pairsMore}}" hint-placeholder-val="{{true}}"><button type="button" class="lnk" onClick="{{showAllPairs}}">{{t.onbMore}}</button></sc-if>\n      <sc-if value="{{pairNote}}"><p class="sm demo">{{pairNote}}</p></sc-if>\n    </fieldset>', 1),
 # home
 ('<p class="meta">{{t.emptyText}}</p>', '<p class="meta">{{emptyText}}</p>', 1),
 ('onClick="{{startSession}}">{{t.emptyCta}}</button>', 'onClick="{{startSession}}">{{emptyCta}}</button>', 1),
 ('<p class="meta">{{t.sessMeta}}<br>{{t.sessTopics}}</p>', '<p class="meta">{{sessMeta}}<br>{{sessTopics}}</p>', 1),
 ('onClick="{{startSession}}">{{t.sessStart}}</button>', 'onClick="{{startSession}}">{{sessStart}}</button>', 1),
 ('<button type="button" class="btn2" onClick="{{goLimit}}">{{t.more}}</button>', '<button type="button" class="btn2" onClick="{{startMore}}">{{t.more}}</button>', 1),
 ('<button type="button" class="rowbtn" onClick="{{startSession}}">', '<button type="button" class="rowbtn" onClick="{{n.go}}">', 1),
 ('<p class="sm mut">{{t.nextMock}}</p>', '<p class="sm mut">{{nextMock}}</p>', 1),
 ('<button type="button" class="lnk" onClick="{{goCalendar}}">{{t.openCal}}</button>\n        </section>\n      </sc-if>\n    </div>',
  '<button type="button" class="lnk" onClick="{{goCalendar}}">{{t.openCal}}</button>\n        </section>\n      </sc-if>\n      <p class="sm demo">{{t.demoNote}}</p>\n    </div>', 1),
 # one task
 ('<blockquote class="passage">{{q.passage}}</blockquote>', '<blockquote class="passage pre">{{q.passage}}</blockquote>', 1),
 ('<h1 class="qtext">{{q.text}}</h1>\n    <div class="opts">', '<h1 class="qtext">{{q.text}}</h1>\n    <sc-if value="{{q.multi}}"><p class="sm mut">{{t.multiHintQ}}</p></sc-if>\n    <div class="opts">', 1),
 ('<button type="button" class="lnk">{{t.report}}</button></sc-if>', '<button type="button" class="lnk" onClick="{{openReport}}">{{t.report}}</button></sc-if>', 1),
 ('<footer class="qfoot">\n  <button type="button" class="btn" disabled="{{cantGo}}" onClick="{{primary}}">{{primaryLabel}}</button>\n</footer>',
  '<footer class="qfoot">\n  <button type="button" class="btn" disabled="{{cantGo}}" onClick="{{primary}}">{{primaryLabel}}</button>\n</footer>\n'
  '<sc-if value="{{reportOpen}}">\n  <div class="layer">\n    <button type="button" class="scrim" aria-label="{{t.close}}" onClick="{{closeReport}}"></button>\n    <div class="box" role="dialog" aria-modal="true" aria-labelledby="up-report">\n      <h2 class="t3" id="up-report">{{t.reportT}}</h2>\n      <p class="mut">{{reportText}}</p>\n      <div class="acts">\n        <a class="btn" href="{{helpHref}}">{{t.reportHelp}}</a>\n        <button type="button" class="btn2" onClick="{{closeReport}}">{{t.close}}</button>\n      </div>\n    </div>\n  </div>\n</sc-if>', 1),
 # session finished
 ('<h1 class="t1">{{t.doneTitle}}</h1>', '<h1 class="t1">{{doneTitle}}</h1>', 1),
 ('<p class="jump"><span class="mut">54</span>', '<p class="jump"><span class="mut">{{doneBefore}}</span>', 1),
 ('<p class="mut">{{t.doneTomorrow}}</p>', '<p class="mut">{{doneNext}}</p>', 1),
 # map
 ('<sc-if value="{{noTopics}}" hint-placeholder-val="{{false}}"><p class="mut">{{t.topicsPlaceholder}}</p></sc-if>',
  '<sc-if value="{{noTopics}}" hint-placeholder-val="{{false}}"><p class="mut">{{noTopicsText}}</p></sc-if>\n      <sc-if value="{{hasTopics}}"><button type="button" class="lnk" onClick="{{openBlockTopics}}">{{t.openTopics}}</button></sc-if>', 1),
 # mock intro
 ('onClick="{{goMock}}">{{t.mockStart}}</button>\n  </div>', 'onClick="{{startMock}}">{{mockCta}}</button>\n  </div>\n  <sc-if value="{{mockNote}}"><p class="sm mut">{{mockNote}}</p></sc-if>', 1),
 ('<section class="panel" style="max-width: 420px; gap: 2px">\n    <h2 class="t4">{{t.mockLast}}</h2>\n    <button type="button" class="lnk" onClick="{{goResult}}">{{t.mockLastOpen}}</button>\n  </section>',
  '<sc-if value="{{mockLast}}"><section class="panel" style="max-width: 420px; gap: 2px">\n    <h2 class="t4">{{mockLast}}</h2>\n    <button type="button" class="lnk" onClick="{{goResult}}">{{t.mockLastOpen}}</button>\n  </section></sc-if>', 1),
 # mock
 ('<p class="timer" role="timer" aria-label="{{t.timeLeft}}">3:12:40</p>', '<p class="timer" role="timer" aria-label="{{t.timeLeft}}" data-timer>{{timerText}}</p>', 1),
 ('<blockquote class="passage">{{mq.passage}}</blockquote>', '<blockquote class="passage pre">{{mq.passage}}</blockquote>', 1),
 ('<div class="toolsrow ph">', '<sc-if value="{{mqHas}}"><div class="toolsrow ph">', 1),
 ('{{t.toolSol}}</button>\n      </div>\n    </div>\n  </section>', '{{t.toolSol}}</button>\n      </div></sc-if>\n    </div>\n  </section>', 1),
 ('<button type="button" class="btn2" onClick="{{goResult}}">{{t.confirmYes}}</button>', '<button type="button" class="btn2" onClick="{{finishMock}}">{{t.confirmYes}}</button>', 1),
 ('<div class="box" role="dialog" aria-modal="true" aria-label="{{toolTitle}}">', '<div class="box {{toolBoxCls}}" role="dialog" aria-modal="true" aria-label="{{toolTitle}}">', 1),
 ('<p class="mut">{{t.toolSoon}}</p>',
  '<sc-if value="{{tool.calc}}"><div class="calc"><div class="calcscreen" aria-live="polite"><span class="calcexpr">{{calcExpr}}</span><span class="calcres">{{calcRes}}</span></div><div class="calckeys"><sc-for list="{{calcKeys}}" as="k"><button type="button" class="calckey {{k.cls}}" aria-label="{{k.aria}}" onClick="{{k.go}}">{{k.label}}</button></sc-for></div></div></sc-if>\n'
  '      <sc-if value="{{tool.per}}"><div class="ptwrap"><div class="ptable"><sc-for list="{{ptCells}}" as="e"><span class="pt" style="grid-column: {{e.col}}; grid-row: {{e.row}}"><i>{{e.n}}</i><b>{{e.sym}}</b><small>{{e.mass}}</small></span></sc-for></div></div></sc-if>\n'
  '      <sc-if value="{{tool.sol}}"><p class="mut">{{t.solSoon}}</p></sc-if>', 1),
 # result
 ('<p class="bignum"><span>54</span><span class="of">/140</span></p>', '<p class="bignum"><span>{{resTotal}}</span><span class="of">/140</span></p>', 1),
 ('aria="54 / 140"', 'aria="{{resAria}}"', 1),
 ('<p class="sm mut">{{t.resultNote}}</p>', '<p class="sm mut">{{t.resultNote}}</p>\n        <sc-if value="{{resMissing}}"><p class="sm mut">{{resMissing}}</p></sc-if>', 1),
 ('<sc-for list="{{t.lost}}" as="n" hint-placeholder-count="3">', '<sc-for list="{{resLost}}" as="n" hint-placeholder-count="3">', 1),
 ('<button type="button" class="btn" onClick="{{startSession}}">{{t.review}}</button>', '<sc-if value="{{resCanReview}}"><button type="button" class="btn" onClick="{{reviewMock}}">{{t.review}}</button></sc-if>\n          <sc-if value="{{resNoLost}}"><p class="sm mut">{{t.noLost}}</p></sc-if>', 1),
 ('<td><span class="okmark num"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"></path></svg>{{r.min}}</span></td>',
  '<td><sc-if value="{{r.ok}}"><span class="okmark num">' + CHECK16 + '{{r.min}}</span></sc-if><sc-if value="{{r.no}}"><span class="nomark num">' + CROSS16 + '{{r.min}}</span></sc-if></td>', 1),
 # limit
 ('      <button type="button" class="btn2"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 21 4l-6 17-3-7z"></path></svg>{{t.askParent}}</button>\n', '', 1),
 # share
 ('/140 <span style="padding: 3px 12px; border-radius: 980px; background: #FF9F0A; color: #1D1D1F; font-size: 15px; font-weight: 600">{{shareGain}}</span></p>',
  '/140 <sc-if value="{{shareGain}}"><span style="padding: 3px 12px; border-radius: 980px; background: #FF9F0A; color: #1D1D1F; font-size: 15px; font-weight: 600">{{shareGain}}</span></sc-if></p>', 1),
 ('<button type="button" class="btn">{{t.shareSend}}</button>\n    <button type="button" class="btn2">{{t.shareSave}}</button>',
  '<sc-if value="{{canWebShare}}"><button type="button" class="btn" onClick="{{doShare}}">{{t.shareSend}}</button></sc-if>\n    <button type="button" class="{{saveCls}}" onClick="{{doSavePic}}">{{t.shareSave}}</button>\n    <sc-if value="{{fileNote}}"><p class="sm mut" style="text-align: center" role="status">{{fileNote}}</p></sc-if>', 1),
 # tasks
 ('<div class="empty"><p>{{emptySearch}}</p><button type="button" class="btn2 btn-s" onClick="{{clearQuery}}">{{t.clearSearch}}</button></div>',
  '<div class="empty"><p>{{emptySearch}}</p><sc-if value="{{query}}"><button type="button" class="btn2 btn-s" onClick="{{clearQuery}}">{{t.clearSearch}}</button></sc-if></div>', 1),
 ('<section class="panel tdetail" aria-label="{{tp.name}}">', '<sc-if value="{{hasTp}}"><section class="panel tdetail" aria-label="{{tp.name}}">', 1),
 ('<sc-if value="{{tp.noTasks}}" hint-placeholder-val="{{false}}"><p class="mut">{{t.topicNoTasks}}</p></sc-if>\n      </section>', '<sc-if value="{{tp.noTasks}}" hint-placeholder-val="{{false}}"><p class="mut">{{t.topicNoTasks}}</p></sc-if>\n      </section></sc-if>', 1),
 ('<button type="button" class="btn" onClick="{{startSession}}">{{t.solveAll}}</button>', '<button type="button" class="btn" onClick="{{tp.solve}}">{{t.solveAll}}</button>', 1),
 ('<button type="button" class="btn2" onClick="{{startSession}}">{{tp.wrongLabel}}</button>', '<button type="button" class="btn2" onClick="{{tp.solveWrong}}">{{tp.wrongLabel}}</button>', 1),
 ('<sc-for list="{{t.khNotes}}" as="n" hint-placeholder-count="4">', '<sc-for list="{{tp.notes}}" as="n" hint-placeholder-count="4">', 1),
 ('<button type="button" class="taskbtn" onClick="{{startSession}}">\n                  <span class="sdot', '<button type="button" class="taskbtn" onClick="{{x.go}}">\n                  <span class="sdot', 1),
 ('<button type="button" class="taskbtn" onClick="{{startSession}}"><span style="min-width: 0">', '<button type="button" class="taskbtn" onClick="{{x.go}}"><span style="min-width: 0">', 1),
 ('<section class="panel" style="max-width: 860px">\n      <div>\n        <h2 class="t3">{{t.mistCta}}</h2>\n        <p class="sm mut" style="margin-top: 2px">{{t.mistLead}}</p>\n      </div>\n      <button type="button" class="btn" style="align-self: flex-start" onClick="{{startSession}}">{{t.mistStart}}</button>\n    </section>',
  '<sc-if value="{{hasMist}}"><section class="panel" style="max-width: 860px">\n      <div>\n        <h2 class="t3">{{t.mistCta}}</h2>\n        <p class="sm mut" style="margin-top: 2px">{{mistLead}}</p>\n      </div>\n      <button type="button" class="btn" style="align-self: flex-start" onClick="{{startMistakes}}">{{t.mistStart}}</button>\n    </section></sc-if>', 1),
 ('<sc-for list="{{t.mistakes}}" as="m" hint-placeholder-count="4">', '<sc-for list="{{mistRows}}" as="m" hint-placeholder-count="4">', 1),
 ('<p class="sm mut">{{m.when}}</p>\n            </div>\n          </li>\n        </sc-for>\n      </ul>\n    </section>',
  '<p class="sm mut">{{m.when}}</p>\n            </div>\n          </li>\n        </sc-for>\n      </ul>\n      <sc-if value="{{noMist}}"><div class="empty"><h2 class="t3">{{t.mistEmptyT}}</h2><p class="mut" style="max-width: 34ch">{{t.mistEmptyD}}</p></div></sc-if>\n    </section>', 1),
 # calendar
 ('<button type="button" class="lnk">{{t.syncCal}}</button>', '<button type="button" class="lnk" onClick="{{doIcs}}">{{t.syncCal}}</button>\n        <sc-if value="{{fileNote}}"><p class="sm mut" role="status">{{fileNote}}</p></sc-if>', 1),
 # profile
 ('<p class="t4">{{t.profileName}}</p><p class="sm mut">{{t.profilePhone}}</p>', '<p class="t4">{{t.profileTitle}}</p><p class="sm mut">{{profilePhone}}</p>', 1),
 ('<div class="lrow"><span>{{t.rowParentPhone}}</span><span class="lval">{{t.parentPhone}}</span></div>\n      </div>',
  '<div class="lrow"><label for="up-parent-phone">{{t.rowParentPhone}}</label><input id="up-parent-phone" class="inp" type="tel" inputmode="numeric" autocomplete="off" placeholder="{{t.parentPh}}" value="{{parentPhone}}" onChange="{{setParentPhone}}"></div>\n      </div>\n      <p class="sm mut" style="padding: 8px 18px 0">{{t.parentNote}}</p>', 1),
 ('<button type="button" class="lrow" style="color: var(--accent-text)" onClick="{{goPay}}"><span>{{t.unlock}}</span></button>',
  '<sc-if value="{{planFree}}"><button type="button" class="lrow" style="color: var(--accent-text)" onClick="{{goPay}}"><span>{{t.unlock}}</span></button></sc-if>\n        <sc-if value="{{planFull}}"><button type="button" class="lrow" style="color: var(--accent-text)" onClick="{{backToFree}}"><span>{{t.planBack}}</span></button></sc-if>', 1),
 ('<button type="button" class="lrow danger" onClick="{{goAuth}}"><span>{{t.rowLogout}}</span></button>',
  '<sc-if value="{{hasPhone}}"><button type="button" class="lrow danger" onClick="{{logout}}"><span>{{t.rowLogout}}</span></button></sc-if>\n        <sc-if value="{{noPhone}}"><button type="button" class="lrow" style="color: var(--accent-text)" onClick="{{goAuth}}"><span>{{t.rowLogin}}</span></button></sc-if>', 1),
 ('<button type="button" class="lrow danger" onClick="{{askDelete}}"><span>{{t.rowDelete}}</span></button>\n      </div>',
  '<button type="button" class="lrow danger" onClick="{{askDelete}}"><span>{{t.rowDelete}}</span></button>\n      </div>\n      <p class="sm demo" style="margin-top: 10px">{{t.demoNote}}</p>', 1),
 # sign in
 ('<p class="mut">{{t.authLead}}</p>', '<p class="mut">{{t.authLead}}</p>\n      <p class="sm demo">{{t.authDemo}}</p>', 1),
 # pay
 ('<button type="button" class="lnk" style="align-self: flex-start; align-items: center; gap: 2px" onClick="{{goProfile}}">', '<button type="button" class="lnk" style="align-self: flex-start; align-items: center; gap: 2px" onClick="{{payBack}}">', 1),
 ('<button type="button" class="btn" style="margin-top: 8px" onClick="{{payNow}}">{{t.payCta}}</button>', '<p class="sm demo" style="margin-top: 8px">{{t.payDemo}}</p>\n    <button type="button" class="btn" onClick="{{payNow}}">{{t.payCta}}</button>', 1),
 ('\n    <button type="button" class="btn2">{{t.askParent}}</button>', '', 1),
 ('onClick="{{goHome}}">{{t.paidCta}}</button>', 'onClick="{{paidGo}}">{{paidCta}}</button>', 1),
 # theme switch next to the profile button, and on the first screen
 ('<button type="button" class="iconbtn ph" style="align-items: center; justify-content: center" aria-label="{{t.tabProfile}}" onClick="{{goProfile}}"><span class="avatar" aria-hidden="true">{{initial}}</span></button>',
  THEME_BTN + '\n    <button type="button" class="iconbtn ph" style="align-items: center; justify-content: center" aria-label="{{t.tabProfile}}" onClick="{{goProfile}}"><span class="avatar" aria-hidden="true">{{initial}}</span></button>', 1),
 ('<div class="onb">\n  <div class="onbform">\n    <a class="brandlink" href="{{landingHref}}" aria-label="ENTer"><dc-import name="Logo" size="30" hint-size="130px,30px"></dc-import></a>',
  '<div class="onb">\n  <div class="onbform">\n    <div class="onbtop"><a class="brandlink" href="{{landingHref}}" aria-label="ENTer"><dc-import name="Logo" size="30" hint-size="130px,30px"></dc-import></a>' + THEME_BTN + '</div>', 1),
]
out = src
for old, new, n in R:
    c = out.count(old)
    assert c >= 1 and (n == c or n == 3 and c >= 3), ('count', c, old[:90])
    out = out.replace(old, new)
# calendar agenda keeps its handlers; offline banner is untrue without a server
out = re.sub(r'<sc-if value="\{\{offline\}\}".*?</sc-if>\n', '', out, count=1, flags=re.S)
assert 'CLOSE' not in out
for sample in ['54</span>', '3:12:40', '{{t.lost}}', '{{t.mistakes}}', 't.khNotes', 't.toolSoon', 't.nextMock', 't.sessMeta', 't.sessTopics', 't.profileName', 't.profilePhone', 't.parentPhone', 't.mockLast}}', 'startSession}}">{{t.review', 'askParent', '{{goMock}}']:
    assert sample not in out, sample
open(S + '/src/app/app.final.html', 'w', encoding='utf8').write(out)
print('template ok', len(out), 'startSession left:', out.count('{{startSession}}'))
