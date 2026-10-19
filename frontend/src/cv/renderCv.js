import { Buffer } from 'buffer/';
import {
  Document, Page, View, Text, Image, Link, Svg, Path, Circle, Rect, G, Font, StyleSheet, pdf,
} from '@react-pdf/renderer';
import fredoka500 from '@fontsource/fredoka/files/fredoka-latin-500-normal.woff?url';
import fredoka600 from '@fontsource/fredoka/files/fredoka-latin-600-normal.woff?url';
import nunito400 from '@fontsource/nunito/files/nunito-latin-400-normal.woff?url';
import nunito400i from '@fontsource/nunito/files/nunito-latin-400-italic.woff?url';
import nunito600 from '@fontsource/nunito/files/nunito-latin-600-normal.woff?url';
import nunito700 from '@fontsource/nunito/files/nunito-latin-700-normal.woff?url';
import nunito800 from '@fontsource/nunito/files/nunito-latin-800-normal.woff?url';
import { buildCvModel } from './model';
import { getCvPhoto } from '../firebase/profile';

globalThis.Buffer ??= Buffer;

Font.register({
  family: 'Fredoka',
  fonts: [{ src: fredoka500, fontWeight: 500 }, { src: fredoka600, fontWeight: 600 }],
});
Font.register({
  family: 'Nunito',
  fonts: [
    { src: nunito400, fontWeight: 400 },
    { src: nunito400i, fontWeight: 400, fontStyle: 'italic' },
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
  teal: '#3FB8A0',
  tealInk: '#16786A',
  tealTint: '#E7F5F1',
  sun: '#F5BF4F',
  ink: '#2A2326',
  ink2: '#5E5459',
  ink3: '#85797F',
  line: '#EADFD7',
  white: '#FFFFFF',
};

const SIDE = '64mm';

const s = StyleSheet.create({
  page: { paddingTop: '14mm', paddingBottom: '16mm', fontFamily: 'Nunito', fontSize: 8.8, lineHeight: 1.45, color: C.ink, backgroundColor: C.white },
  sideBg: { position: 'absolute', top: 0, bottom: 0, left: 0, width: SIDE, backgroundColor: C.tealTint },
  sideStripe: { position: 'absolute', top: 0, bottom: 0, left: SIDE, width: 3, backgroundColor: C.coral },
  body: { flexDirection: 'row' },
  side: { width: SIDE, paddingHorizontal: '7mm' },
  main: { flex: 1, paddingLeft: '9mm', paddingRight: '12mm' },

  photoWrap: { alignItems: 'center', marginBottom: '4mm' },
  photoRing: { width: '34mm', height: '34mm', borderRadius: '17mm', borderWidth: 3, borderColor: C.coral, padding: 3, backgroundColor: C.white },
  photo: { width: '100%', height: '100%', borderRadius: '17mm', objectFit: 'cover' },
  monogram: { width: '100%', height: '100%', borderRadius: '17mm', backgroundColor: C.coralTint, alignItems: 'center', justifyContent: 'center' },
  monogramText: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 30, color: C.coral },

  sideSection: { marginTop: '4.4mm' },
  sideHeading: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: C.tealInk },
  sideBar: { width: '8mm', height: 2.2, borderRadius: 2, backgroundColor: C.teal, marginTop: '1mm', marginBottom: '2.4mm' },
  reachRow: { flexDirection: 'row', alignItems: 'center', marginTop: '1.6mm' },
  reachIcon: { width: '5.4mm', height: '5.4mm', borderRadius: '2.7mm', backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginRight: '2.2mm' },
  reachText: { flex: 1, fontSize: 8.2, color: C.ink, textDecoration: 'none' },
  linkRow: { marginTop: '1.4mm' },
  linkName: { fontWeight: 700, fontSize: 8.2, color: C.ink },
  linkHandle: { fontSize: 7.8, color: C.ink2, textDecoration: 'none' },
  skillGroup: { marginTop: '2mm' },
  skillName: { fontWeight: 800, fontSize: 8.2, color: C.ink, marginBottom: '1mm' },
  pills: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { paddingVertical: 1.6, paddingHorizontal: 5.5, borderRadius: 8, backgroundColor: C.white, marginRight: 3, marginTop: 3 },
  pillCoral: { backgroundColor: C.coralTint },
  pillText: { fontSize: 7.6, fontWeight: 600, color: C.ink2 },
  pillTextCoral: { color: C.coralInk },

  head: { paddingBottom: '4mm', marginBottom: '1mm', borderBottomWidth: 1, borderBottomColor: C.line },
  headTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 25, lineHeight: 1.05, color: C.ink, maxWidth: '78mm' },
  title: { fontFamily: 'Fredoka', fontWeight: 500, fontSize: 12, color: C.coralInk, marginTop: '1.6mm' },
  motto: { fontSize: 7.2, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: C.tealInk, marginTop: '1.6mm' },
  logo: { width: '30mm', marginTop: '-2mm' },
  bio: { marginTop: '3mm', fontSize: 9.2, color: C.ink2 },

  section: { marginTop: '4.6mm' },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: '2.4mm' },
  headingDot: { width: '3.2mm', height: '3.2mm', borderRadius: '1.6mm', marginRight: '2mm' },
  heading: { fontFamily: 'Fredoka', fontWeight: 600, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: C.ink },
  headingLine: { flex: 1, height: 1, backgroundColor: C.line, marginLeft: '3mm' },

  entry: { flexDirection: 'row' },
  rail: { width: '5mm', alignItems: 'center' },
  dot: { width: '2.8mm', height: '2.8mm', borderRadius: '1.4mm', borderWidth: 1.6, backgroundColor: C.white, marginTop: 2.5 },
  stem: { flex: 1, width: 1.2, backgroundColor: C.line, marginTop: 2 },
  entryBody: { flex: 1, paddingBottom: '3mm', paddingLeft: '1.5mm' },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTitle: { flex: 1, fontWeight: 800, fontSize: 9.8, color: C.ink, marginRight: '3mm' },
  when: { fontSize: 7.6, fontWeight: 700, paddingVertical: 1, paddingHorizontal: 5, borderRadius: 6 },
  org: { fontSize: 8.6, fontWeight: 600, color: C.ink2, marginTop: 0.5 },
  text: { marginTop: '1mm', color: C.ink2 },
  tags: { marginTop: '0.8mm', fontSize: 7.4, fontStyle: 'italic', color: C.ink3 },

  hlRow: { flexDirection: 'row', marginTop: '1.8mm' },
  star: { width: '4mm', marginTop: 1.5 },
  hlBody: { flex: 1 },
  hlTitle: { fontWeight: 800, fontSize: 9.2 },
  hlMeta: { fontSize: 7.8, color: C.coralInk, fontWeight: 700 },

  workGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '-1mm' },
  workCard: { width: '48.5%', marginTop: '2mm', marginRight: '3%', paddingVertical: '2mm', paddingHorizontal: '2.6mm', borderRadius: 6, borderLeftWidth: 3, backgroundColor: '#FBF6F1' },
  workTitle: { fontWeight: 800, fontSize: 8.6 },
  workMeta: { fontSize: 7.4, color: C.ink3 },

  footerMotto: { position: 'absolute', bottom: '7mm', left: '73mm', right: '12mm', fontSize: 7, letterSpacing: 1.4, textTransform: 'uppercase', color: C.tealInk, fontWeight: 700 },
  corner: { position: 'absolute', top: '-22mm', right: '-22mm', width: '62mm', height: '62mm', borderRadius: '31mm', backgroundColor: C.coralTint },
  cornerDot: { position: 'absolute', top: '5mm', right: '46mm', width: '5mm', height: '5mm', borderRadius: '2.5mm', backgroundColor: C.sun },
  sprig: { position: 'absolute', bottom: '4mm', left: '4mm', width: '30mm', height: '30mm' },
  dots: { position: 'absolute', top: '8mm', left: '44mm' },
});

const LEAF = 'M0 0 C -7 -10 -7 -22 0 -32 C 7 -22 7 -10 0 0 Z';

const Sprig = ({ color }) => (
  <Svg viewBox="0 0 100 100" style={s.sprig} fixed>
    <G stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <Path d="M50 96 C 50 74 44 62 50 44 C 55 30 50 16 50 6" />
      <G transform="translate(50 74) rotate(38)"><Path d={LEAF} /></G>
      <G transform="translate(50 74) rotate(-38)"><Path d={LEAF} /></G>
      <G transform="translate(50 52) rotate(30)"><Path d={LEAF} /></G>
      <G transform="translate(50 52) rotate(-30)"><Path d={LEAF} /></G>
      <G transform="translate(50 30) rotate(22)"><Path d={LEAF} /></G>
      <G transform="translate(50 30) rotate(-22)"><Path d={LEAF} /></G>
      <Circle cx={50} cy={7} r={3.4} fill={color} />
    </G>
  </Svg>
);

const DotGrid = () => (
  <Svg width="16mm" height="10mm" viewBox="0 0 64 40" style={s.dots} fixed>
    {Array.from({ length: 20 }, (_, i) => (
      <Circle key={i} cx={4 + (i % 5) * 14} cy={4 + Math.floor(i / 5) * 11} r={2} fill={C.teal} opacity={0.55} />
    ))}
  </Svg>
);

const Star = () => (
  <Svg viewBox="0 0 10 10" style={{ width: 8, height: 8 }}>
    <Path d="M5 0.6 L6.3 3.5 L9.4 3.8 L7 5.9 L7.7 9 L5 7.4 L2.3 9 L3 5.9 L0.6 3.8 L3.7 3.5 Z" fill={C.sun} />
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
};

const Icon = ({ kind }) => (
  <View style={s.reachIcon}>
    <Svg viewBox="0 0 10 10" style={{ width: 9, height: 9 }}>{ICONS[kind]}</Svg>
  </View>
);

const SideHeading = ({ children }) => (
  <View>
    <Text style={s.sideHeading}>{children}</Text>
    <View style={s.sideBar} />
  </View>
);

const Heading = ({ children, color }) => (
  <View style={s.headingRow} minPresenceAhead={40}>
    <View style={[s.headingDot, { backgroundColor: color }]} />
    <Text style={s.heading}>{children}</Text>
    <View style={s.headingLine} />
  </View>
);

const Entry = ({ item, color, last }) => (
  <View style={s.entry} wrap={false}>
    <View style={s.rail}>
      <View style={[s.dot, { borderColor: color }, item.current ? { backgroundColor: color } : null]} />
      {!last && <View style={s.stem} />}
    </View>
    <View style={s.entryBody}>
      <View style={s.entryTop}>
        <Text style={s.entryTitle}>{item.title}</Text>
        {item.when ? <Text style={[s.when, { color, backgroundColor: color === C.coral ? C.coralTint : C.tealTint }]}>{item.when}</Text> : null}
      </View>
      {item.org ? <Text style={s.org}>{item.org}</Text> : null}
      {item.text ? <Text style={s.text}>{item.text}</Text> : null}
      {item.tags.length > 0 && <Text style={s.tags}>{item.tags.join('  /  ')}</Text>}
    </View>
  </View>
);

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

const CvDocument = ({ cv, photo, logo }) => {
  const { labels } = cv;
  return (
    <Document title={`${cv.name} CV`} author={cv.name} subject="Curriculum vitae" creator={cv.name}>
      <Page size="A4" style={s.page}>
        <View style={s.sideBg} fixed />
        <View style={s.sideStripe} fixed />
        <View style={s.corner} />
        <View style={s.cornerDot} />
        <DotGrid />
        <Sprig color={C.teal} />

        <View style={s.body}>
          <View style={s.side}>
            <View style={s.photoWrap}>
              <View style={s.photoRing}>
                {photo
                  ? <Image src={photo} style={s.photo} />
                  : <View style={s.monogram}><Text style={s.monogramText}>{initials(cv.name)}</Text></View>}
              </View>
            </View>

            {cv.reach.length > 0 && (
              <View style={s.sideSection}>
                <SideHeading>{labels.contact}</SideHeading>
                {cv.reach.map((r) => (
                  <View key={r.kind} style={s.reachRow}>
                    <Icon kind={r.kind} />
                    {r.href ? <Link src={r.href} style={s.reachText}>{r.text}</Link> : <Text style={s.reachText}>{r.text}</Text>}
                  </View>
                ))}
                {cv.links.map((l) => (
                  <View key={l.href} style={s.linkRow}>
                    <Text style={s.linkName}>{l.name}</Text>
                    <Link src={l.href} style={s.linkHandle}>{l.handle}</Link>
                  </View>
                ))}
              </View>
            )}

            {cv.skills.length > 0 && (
              <View style={s.sideSection}>
                <SideHeading>{labels.skills}</SideHeading>
                {cv.skills.map((group) => (
                  <View key={group.name} style={s.skillGroup} wrap={false}>
                    {group.name ? <Text style={s.skillName}>{group.name}</Text> : null}
                    <View style={s.pills}>
                      {group.items.map((item) => (
                        <View key={item} style={s.pill}><Text style={s.pillText}>{item}</Text></View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

          </View>

          <View style={s.main}>
            <View style={s.head}>
              <View style={s.headTop}>
                <View>
                  <Text style={s.name}>{cv.name}</Text>
                  {cv.title ? <Text style={s.title}>{cv.title}</Text> : null}
                  {cv.motto ? <Text style={s.motto}>{cv.motto}</Text> : null}
                </View>
                {logo && <Image src={logo} style={s.logo} />}
              </View>
            </View>

            {cv.bio ? (
              <View style={s.section}>
                <Heading color={C.sun}>{labels.profile}</Heading>
                <Text style={s.bio}>{cv.bio}</Text>
              </View>
            ) : null}

            {cv.experience.length > 0 && (
              <View style={s.section}>
                <Heading color={C.coral}>{labels.experience}</Heading>
                {cv.experience.map((item, i) => <Entry key={item.id} item={item} color={C.coral} last={i === cv.experience.length - 1} />)}
              </View>
            )}

            {cv.education.length > 0 && (
              <View style={s.section}>
                <Heading color={C.teal}>{labels.education}</Heading>
                {cv.education.map((item, i) => <Entry key={item.id} item={item} color={C.teal} last={i === cv.education.length - 1} />)}
              </View>
            )}

            {cv.highlights.length > 0 && (
              <View style={s.section}>
                <Heading color={C.sun}>{labels.highlights}</Heading>
                {cv.highlights.map((h) => (
                  <View key={h.id} style={s.hlRow} wrap={false}>
                    <View style={s.star}><Star /></View>
                    <View style={s.hlBody}>
                      <Text style={s.hlTitle}>{h.title}</Text>
                      {h.meta ? <Text style={s.hlMeta}>{h.meta}</Text> : null}
                      {h.text ? <Text style={s.text}>{h.text}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {cv.work.length > 0 && (
              <View style={s.section} wrap={false}>
                <Heading color={C.coral}>{labels.work}</Heading>
                <View style={s.workGrid}>
                  {cv.work.map((w, i) => (
                    <View key={w.id} style={[s.workCard, { borderLeftColor: i % 2 ? C.teal : C.coral }, i % 2 ? { marginRight: 0 } : null]}>
                      <Text style={s.workTitle}>{w.title}</Text>
                      {w.meta ? <Text style={s.workMeta}>{w.meta}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {cv.interests.length > 0 && (
              <View style={s.section} wrap={false}>
                <Heading color={C.teal}>{labels.interests}</Heading>
                <View style={s.pills}>
                  {cv.interests.map((item) => (
                    <View key={item} style={[s.pill, s.pillCoral]}><Text style={[s.pillText, s.pillTextCoral]}>{item}</Text></View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <Text style={s.footerMotto} fixed>{cv.motto}</Text>
      </Page>
    </Document>
  );
};

const inline = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!/^image\/(png|jpe?g)$/.test(blob.type)) return null;
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
  const [stored, logo] = await Promise.all([getCvPhoto().catch(() => ''), inline(`${window.location.origin}/logo-wordmark.png`)]);
  return buildPdf(cv, stored || null, logo);
};
