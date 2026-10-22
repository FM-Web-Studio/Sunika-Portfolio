import { Buffer } from 'buffer/';
import {
  Document, Page, View, Text, Image, Link, Svg, Path, Circle, Rect, G, Font, StyleSheet, pdf,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';
import fredoka500 from '@fontsource/fredoka/files/fredoka-latin-500-normal.woff?url';
import fredoka600 from '@fontsource/fredoka/files/fredoka-latin-600-normal.woff?url';
import nunito400 from '@fontsource/nunito/files/nunito-latin-400-normal.woff?url';
import nunito600 from '@fontsource/nunito/files/nunito-latin-600-normal.woff?url';
import nunito700 from '@fontsource/nunito/files/nunito-latin-700-normal.woff?url';
import nunito800 from '@fontsource/nunito/files/nunito-latin-800-normal.woff?url';
import { buildCvModel } from './model';
import { getCvPhoto } from '../firebase/profile';
import { LOGOS } from '../lib/logos';

globalThis.Buffer ??= Buffer;

Font.register({
  family: 'Fredoka',
  fonts: [{ src: fredoka500, fontWeight: 500 }, { src: fredoka600, fontWeight: 600 }],
});
Font.register({
  family: 'Nunito',
  fonts: [
    { src: nunito400, fontWeight: 400 },
    { src: nunito600, fontWeight: 600 },
    { src: nunito700, fontWeight: 700 },
    { src: nunito800, fontWeight: 800 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const C = {
  coral: '#DC3F55',
  coralInk: '#B8293F',
  coralTint: '#FCE4E7',
  coralWash: '#FEF1F2',
  teal: '#3FB8A0',
  tealInk: '#16786A',
  tealTint: '#E7F5F1',
  sun: '#F5BF4F',
  ink: '#2A2326',
  ink2: '#5E5459',
  ink3: '#8C8186',
  line: '#EADFD7',
  paper: '#FBF6F1',
  white: '#FFFFFF',
};

const GUTTER = '14mm';
const SIDE = '58mm';

const s = StyleSheet.create({
  page: { paddingBottom: '17mm', fontFamily: 'Nunito', fontSize: 8.7, lineHeight: 1.45, color: C.ink, backgroundColor: C.white },

  band: { position: 'relative', flexDirection: 'row', alignItems: 'center', paddingTop: '11mm', paddingBottom: '9mm', paddingHorizontal: GUTTER, backgroundColor: C.coralWash, overflow: 'hidden' },
  bandRule: { height: 3, backgroundColor: C.coral },
  bandCircle: { position: 'absolute', right: '-16mm', bottom: '-30mm', width: '70mm', height: '70mm', borderRadius: '35mm', backgroundColor: C.coralTint },
  bandFern: { position: 'absolute', right: '30mm', bottom: '-6mm', width: '34mm', height: '34mm' },
  photoRing: { width: '31mm', height: '31mm', borderRadius: '15.5mm', padding: 2.5, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.coral },
  photo: { width: '100%', height: '100%', borderRadius: '15mm', objectFit: 'cover' },
  monogram: { width: '100%', height: '100%', borderRadius: '15mm', backgroundColor: C.coralTint, alignItems: 'center', justifyContent: 'center' },
  monogramText: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: C.coral },
  who: { flex: 1, marginLeft: '7mm', paddingRight: '30mm' },
  name: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 27, lineHeight: 1.05, color: C.ink },
  title: { fontFamily: 'Fredoka', fontWeight: 500, fontSize: 12.5, lineHeight: 1.2, color: C.coralInk, marginTop: '1.6mm' },
  reach: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '3.4mm' },
  reachItem: { flexDirection: 'row', alignItems: 'center', marginRight: '5mm', marginTop: '1mm' },
  reachText: { fontSize: 8.3, color: C.ink2, textDecoration: 'none' },
  logo: { position: 'absolute', top: '8mm', right: GUTTER, width: '27mm', maxHeight: '22mm', objectFit: 'contain' },

  body: { flexDirection: 'row', paddingHorizontal: GUTTER, paddingTop: '7mm' },
  main: { flex: 1, marginRight: '8mm' },
  side: { width: SIDE },

  section: { marginBottom: '5.5mm' },
  heading: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: C.ink },
  bar: { width: '9mm', height: 2.4, borderRadius: 2, marginTop: '1.2mm', marginBottom: '3mm' },

  bio: { color: C.ink2, fontSize: 9 },

  entry: { flexDirection: 'row' },
  rail: { width: '4.5mm', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, backgroundColor: C.white, marginTop: 3 },
  stem: { flex: 1, width: 1, backgroundColor: C.line, marginTop: 2 },
  entryBody: { flex: 1, paddingLeft: '1.8mm', paddingBottom: '3.4mm' },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTitle: { flex: 1, fontWeight: 800, fontSize: 9.8, lineHeight: 1.3, marginRight: '3mm' },
  when: { fontSize: 7.5, fontWeight: 700, paddingVertical: 1.2, paddingHorizontal: 5, borderRadius: 6 },
  org: { fontSize: 8.5, fontWeight: 600, color: C.ink2 },
  text: { marginTop: '1mm', color: C.ink2 },

  sideCard: { padding: '3.6mm', borderRadius: 8, backgroundColor: C.tealTint, marginBottom: '5mm' },
  group: { marginTop: '2.2mm' },
  groupFirst: { marginTop: 0 },
  groupName: { fontWeight: 800, fontSize: 8.2, color: C.tealInk, marginBottom: '0.6mm' },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skill: { flexDirection: 'row', alignItems: 'center', marginRight: '2.6mm', marginBottom: '0.6mm' },
  skillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.teal, marginRight: 3 },
  skillText: { fontSize: 7.9, lineHeight: 1.45, color: C.ink2 },

  award: { flexDirection: 'row', marginBottom: '2.6mm' },
  awardStar: { width: '4.2mm', paddingTop: 1.5 },
  awardBody: { flex: 1 },
  awardTitle: { fontWeight: 800, fontSize: 8.4, lineHeight: 1.3 },
  awardMeta: { fontSize: 7.6, color: C.coralInk, fontWeight: 600, marginTop: 1 },

  folioCard: { padding: '3.6mm', borderRadius: 8, backgroundColor: C.coralWash, borderWidth: 1, borderColor: C.coralTint, marginBottom: '5mm' },
  folio: { flexDirection: 'row', alignItems: 'center' },
  folioLinks: { marginTop: '3mm', paddingTop: '2.6mm', borderTopWidth: 1, borderTopColor: C.coralTint },
  onlineLabel: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 8.6, letterSpacing: 0.8, textTransform: 'uppercase', color: C.ink, marginBottom: '1.6mm' },
  qrBox: { padding: 3, borderRadius: 4, backgroundColor: C.white },
  qr: { width: '19mm', height: '19mm' },
  folioText: { flex: 1, marginLeft: '2.6mm' },
  folioLabel: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 10, color: C.ink },
  folioScan: { fontSize: 7.6, color: C.ink2, marginTop: 1 },
  folioUrl: { fontSize: 7.1, fontWeight: 800, color: C.coralInk, marginTop: '1.6mm', textDecoration: 'none' },

  linkRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: '1mm' },
  linkName: { fontWeight: 800, fontSize: 7.8, color: C.ink, marginRight: '2mm' },
  linkHandle: { fontSize: 7.8, color: C.ink2, textDecoration: 'none' },

  footer: { position: 'absolute', bottom: '8mm', left: GUTTER, right: GUTTER, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2.4mm', borderTopWidth: 1, borderTopColor: C.line },
  footerMotto: { fontSize: 7, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: C.tealInk },
  footerUrl: { fontSize: 7.2, color: C.ink3, textDecoration: 'none' },
});

const LEAF = 'M0 0 C -7 -10 -7 -22 0 -32 C 7 -22 7 -10 0 0 Z';

const Fern = () => (
  <Svg viewBox="0 0 100 100" style={s.bandFern}>
    <G stroke={C.coral} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.45}>
      <Path d="M50 98 C 50 74 44 62 50 44 C 55 30 50 16 50 6" />
      <G transform="translate(50 76) rotate(40)"><Path d={LEAF} /></G>
      <G transform="translate(50 76) rotate(-40)"><Path d={LEAF} /></G>
      <G transform="translate(50 54) rotate(32)"><Path d={LEAF} /></G>
      <G transform="translate(50 54) rotate(-32)"><Path d={LEAF} /></G>
      <G transform="translate(50 32) rotate(22)"><Path d={LEAF} /></G>
      <G transform="translate(50 32) rotate(-22)"><Path d={LEAF} /></G>
      <Circle cx={50} cy={7} r={3.4} fill={C.coral} />
    </G>
  </Svg>
);

const ICONS = {
  mail: (
    <G stroke={C.coral} strokeWidth={1} fill="none" strokeLinejoin="round">
      <Rect x={1.2} y={2.4} width={7.6} height={5.4} rx={0.9} />
      <Path d="M1.6 3 L5 5.6 L8.4 3" />
    </G>
  ),
  phone: (
    <G stroke={C.coral} strokeWidth={1} fill="none">
      <Rect x={3} y={1.2} width={4} height={7.6} rx={0.9} />
      <Circle cx={5} cy={7.2} r={0.35} fill={C.coral} />
    </G>
  ),
  pin: (
    <G stroke={C.coral} strokeWidth={1} fill="none">
      <Path d="M5 9 C 3.4 7.2 2 5.6 2 4.1 C 2 2.4 3.3 1.1 5 1.1 C 6.7 1.1 8 2.4 8 4.1 C 8 5.6 6.6 7.2 5 9 Z" />
      <Circle cx={5} cy={4.1} r={1.1} />
    </G>
  ),
  globe: (
    <G stroke={C.coral} strokeWidth={0.9} fill="none">
      <Circle cx={5} cy={5} r={3.9} />
      <Path d="M1.1 5 L8.9 5 M5 1.1 C 3.2 3.2 3.2 6.8 5 8.9 M5 1.1 C 6.8 3.2 6.8 6.8 5 8.9" />
    </G>
  ),
};

const Icon = ({ kind }) => (
  <Svg viewBox="0 0 10 10" style={{ width: 9, height: 9, marginRight: 4 }}>{ICONS[kind]}</Svg>
);

const Star = () => (
  <Svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}>
    <Path d="M5 0.6 L6.3 3.5 L9.4 3.8 L7 5.9 L7.7 9 L5 7.4 L2.3 9 L3 5.9 L0.6 3.8 L3.7 3.5 Z" fill={C.sun} />
  </Svg>
);

const QrCode = ({ url }) => {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) if (modules.get(y, x)) d += `M${x} ${y}h1v1h-1z`;
  }
  return (
    <Svg viewBox={`0 0 ${n} ${n}`} style={s.qr}>
      <Path d={d} fill={C.ink} />
    </Svg>
  );
};

const Heading = ({ children, color = C.coral }) => (
  <View minPresenceAhead={60}>
    <Text style={s.heading}>{children}</Text>
    <View style={[s.bar, { backgroundColor: color }]} />
  </View>
);

const Entry = ({ item, color, tint, last }) => (
  <View style={s.entry} wrap={false}>
    <View style={s.rail}>
      <View style={[s.dot, { borderColor: color }, item.current ? { backgroundColor: color } : null]} />
      {!last && <View style={s.stem} />}
    </View>
    <View style={s.entryBody}>
      <View style={s.entryTop}>
        <Text style={s.entryTitle}>{item.title}</Text>
        {item.when ? <Text style={[s.when, { color, backgroundColor: tint }]}>{item.when}</Text> : null}
      </View>
      {item.org ? <Text style={s.org}>{item.org}</Text> : null}
      {item.text ? <Text style={s.text}>{item.text}</Text> : null}
    </View>
  </View>
);

const initials = (name) => name.split(/ +/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const CvDocument = ({ cv, photo, logo }) => {
  const { labels } = cv;
  return (
    <Document title={`${cv.name} CV`} author={cv.name} subject="Curriculum vitae" creator={cv.name}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <View style={s.bandCircle} />
          <Fern />
          <View style={s.photoRing}>
            {photo
              ? <Image src={photo} style={s.photo} />
              : <View style={s.monogram}><Text style={s.monogramText}>{initials(cv.name)}</Text></View>}
          </View>
          <View style={s.who}>
            <Text style={s.name}>{cv.name}</Text>
            {cv.title ? <Text style={s.title}>{cv.title}</Text> : null}
            <View style={s.reach}>
              {cv.reach.map((r) => (
                <View key={r.kind} style={s.reachItem}>
                  <Icon kind={r.kind} />
                  {r.href ? <Link src={r.href} style={s.reachText}>{r.text}</Link> : <Text style={s.reachText}>{r.text}</Text>}
                </View>
              ))}
              {cv.portfolio && (
                <View style={s.reachItem}>
                  <Icon kind="globe" />
                  <Link src={cv.portfolio.href} style={s.reachText}>{cv.portfolio.text}</Link>
                </View>
              )}
            </View>
          </View>
          {logo && <Image src={logo} style={s.logo} />}
        </View>
        <View style={s.bandRule} />

        <View style={s.body}>
          <View style={s.main}>
            {cv.bio ? (
              <View style={s.section}>
                <Heading color={C.sun}>{labels.profile}</Heading>
                <Text style={s.bio}>{cv.bio}</Text>
              </View>
            ) : null}

            {cv.experience.length > 0 && (
              <View style={s.section}>
                <Heading color={C.coral}>{labels.experience}</Heading>
                {cv.experience.map((item, i) => (
                  <Entry key={item.id} item={item} color={C.coral} tint={C.coralTint} last={i === cv.experience.length - 1} />
                ))}
              </View>
            )}

            {cv.education.length > 0 && (
              <View style={s.section}>
                <Heading color={C.teal}>{labels.education}</Heading>
                {cv.education.map((item, i) => (
                  <Entry key={item.id} item={item} color={C.teal} tint={C.tealTint} last={i === cv.education.length - 1} />
                ))}
              </View>
            )}
          </View>

          <View style={s.side}>
            {(cv.portfolio || cv.links.length > 0) && (
              <View style={s.folioCard} wrap={false}>
                {cv.portfolio && (
                  <View style={s.folio}>
                    <View style={s.qrBox}><QrCode url={cv.portfolio.href} /></View>
                    <View style={s.folioText}>
                      <Text style={s.folioLabel}>{labels.portfolio}</Text>
                      <Text style={s.folioScan}>{labels.scan}</Text>
                      <Link src={cv.portfolio.href} style={s.folioUrl}>{cv.portfolio.text}</Link>
                    </View>
                  </View>
                )}
                {cv.links.length > 0 && (
                  <View style={cv.portfolio ? s.folioLinks : null}>
                    <Text style={s.onlineLabel}>{labels.online}</Text>
                    {cv.links.map((l) => (
                      <View key={l.href} style={s.linkRow}>
                        <Text style={s.linkName}>{l.name}</Text>
                        <Link src={l.href} style={s.linkHandle}>{l.handle}</Link>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {cv.skills.length > 0 && (
              <View style={s.sideCard}>
                <Heading color={C.teal}>{labels.skills}</Heading>
                {cv.skills.map((group, i) => (
                  <View key={group.name || i} style={[s.group, i === 0 ? s.groupFirst : null]} wrap={false}>
                    {group.name ? <Text style={s.groupName}>{group.name}</Text> : null}
                    <View style={s.skillWrap}>
                      {group.items.map((item) => (
                        <View key={item} style={s.skill}>
                          <View style={s.skillDot} />
                          <Text style={s.skillText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {cv.awards.length > 0 && (
              <View style={s.section}>
                <Heading color={C.sun}>{labels.highlights}</Heading>
                {cv.awards.map((a) => (
                  <View key={a.id} style={s.award} wrap={false}>
                    <View style={s.awardStar}><Star /></View>
                    <View style={s.awardBody}>
                      <Text style={s.awardTitle}>{a.title}</Text>
                      {a.meta ? <Text style={s.awardMeta}>{a.meta}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerMotto}>{cv.motto}</Text>
          {cv.portfolio && <Link src={cv.portfolio.href} style={s.footerUrl}>{cv.portfolio.text}</Link>}
        </View>
      </Page>
    </Document>
  );
};

const inline = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!/^image.(png|jpe?g)$/.test(blob.type)) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const buildPdf = (cv, photo, logo) => pdf(<CvDocument cv={cv} photo={photo} logo={logo} />).toBlob();

export const renderCv = async (site) => {
  const cv = buildCvModel(site);
  const [stored, logo] = await Promise.all([getCvPhoto().catch(() => ''), inline(`${window.location.origin}${LOGOS.wordmark}`)]);
  return buildPdf(cv, stored || null, logo);
};
