import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';

// --- フォント・共通設定 ---
const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

// --- 共通コンポーネント ---
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InputField = ({ 
  label, placeholder, multiline = false, flex = 1, keyboardType = 'default',
  value, onChangeText, error = false, required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <TextInput
        style={[
          styles.input, 
          multiline && styles.textArea, 
          error && styles.inputError,
          isFocused && { borderBottomColor: '#76B148', borderBottomWidth: 2 }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        multiline={multiline}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        selectionColor="#76B148"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.errorText}>この項目は入力必須です</Text>}
    </View>
  );
};

const DropdownSelector = ({ label, options, selectedValue, onSelect, error, required, flex = 1 }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={[styles.inputContainer, { flex }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredTag}>必須</Text>}
      </View>
      <TouchableOpacity 
        style={[styles.dropdownTrigger, error && styles.inputError]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownText, !selectedValue && { color: '#bbb' }]} numberOfLines={1}>
          {selectedValue || "選択 ▼"}
        </Text>
      </TouchableOpacity>
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}を選択</Text></View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { onSelect(item.toString()); setModalVisible(false); }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {selectedValue === item.toString() && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const SelectButtons = ({ label, options, selectedValue, onSelect, error, required, customBtnStyle }) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredTag}>必須</Text>}
    </View>
    <View style={[styles.buttonRow, error && styles.inputError, { borderWidth: error ? 1 : 0, borderRadius: 8 }]}>
      {options.map((opt) => (
        <Pressable 
          key={opt}
          style={({ pressed }) => [
            styles.selectBtn, customBtnStyle, 
            selectedValue === opt && styles.selectBtnActive,
            pressed && styles.selectBtnPressed
          ]} 
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.selectBtnText, selectedValue === opt && styles.selectBtnTextActive]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const MultiSelectButtons = ({ label, options, selectedValues, onToggle, error, required }) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.requiredTag}>必須</Text>}
    </View>
    <View style={[styles.buttonRow, error && styles.inputError, { borderWidth: error ? 1 : 0, borderRadius: 8 }]}>
      {options.map((opt) => {
        const isActive = selectedValues.includes(opt);
        return (
          <Pressable 
            key={opt}
            style={({ pressed }) => [
              styles.selectBtn, 
              isActive && styles.selectBtnActive,
              pressed && styles.selectBtnPressed
            ]} 
            onPress={() => onToggle(opt)}
          >
            <Text style={[styles.selectBtnText, isActive && styles.selectBtnTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const WorkHistoryCard = ({ symbol, prefix, data, updateField }) => (
  <View style={styles.historyCard}>
    <Text style={styles.historyLabel}>職歴 {symbol}</Text>
    <InputField label="勤務先" placeholder="例：Club ABC" value={data[`${prefix}Name`]} onChangeText={(v) => updateField(`${prefix}Name`, v)} />
    <View style={styles.row}>
      <InputField label="時給" placeholder="例：3,500円" flex={1} value={data[`${prefix}Wage`]} onChangeText={(v) => updateField(`${prefix}Wage`, v)} />
      <View style={{ width: 10 }} />
      <InputField label="期間" placeholder="例：1年" flex={1} value={data[`${prefix}Period`]} onChangeText={(v) => updateField(`${prefix}Period`, v)} />
    </View>
    <InputField label="退店日" placeholder="例：2024/01" value={data[`${prefix}QuitDate`]} onChangeText={(v) => updateField(`${prefix}QuitDate`, v)} />
    <InputField label="退店理由" placeholder="例：移転のため" multiline value={data[`${prefix}QuitReason`]} onChangeText={(v) => updateField(`${prefix}QuitReason`, v)} />
  </View>
);

export default function App() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [form, setForm] = useState({
    name: '', kana: '', gender: '', bloodType: '',
    birthYear: '', birthMonth: '', birthDay: '', age: '', zodiac: '', phone: '', address: '', domicile: '', height: '', weight: '',
    jobDay: '', jobNight: '', education: '', nightJobExp: '', livingStatus: '', livingStatusCustom: '', 
    language: [], languageCustom: '', emergencyName: '', emergencyRelationship: '', emergencyPhone: '', emergencyAddress: '',
    hireCondition: '', applyMethod: '', applyMethodCustom: '', introducer: '', daysPerWeek: '', availableDays: [], workTime: '', workTimeCustom: '',
    debt: '', transport: '', transportCustom: '', tattoo: '', tattooDetail: '',
    workHistory1Name: '', workHistory1Wage: '', workHistory1Period: '', workHistory1QuitDate: '', workHistory1QuitReason: '',
    workHistory2Name: '', workHistory2Wage: '', workHistory2Period: '', workHistory2QuitDate: '', workHistory2QuitReason: '',
    workHistory3Name: '', workHistory3Wage: '', workHistory3Period: '', workHistory3QuitDate: '', workHistory3QuitReason: ''
  });
  
  const [errors, setErrors] = useState({});

  const years = Array.from({ length: 61 }, (_, i) => (2026 - 18 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const zodiacOptions = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const updateField = (key, value) => {
    let newForm = { ...form, [key]: value };
    if (key === 'hireCondition') { newForm.workTime = ''; newForm.workTimeCustom = ''; }
    if (key === 'applyMethod' && !['紹介', 'WARPスタッフの紹介'].includes(value)) { newForm.introducer = ''; }
    setForm(newForm);
    setIsSent(false);
    if (value && value.toString().trim() !== '') { setErrors(prev => ({ ...prev, [key]: false })); }
    setSubmitError("");
  };

  const toggleMulti = (key, val) => {
    let list = [...form[key]];
    if (list.includes(val)) { list = list.filter(v => v !== val); } else { list.push(val); }
    updateField(key, list);
  };

  const handleViewSubmit = async () => {
    setSubmitError(""); setIsSent(false);
    let newErrors = {};
    const requiredList = ['name', 'kana', 'gender', 'bloodType', 'birthYear', 'birthMonth', 'birthDay', 'age', 'zodiac', 'phone', 'address', 'jobDay', 'jobNight', 'education', 'nightJobExp', 'hireCondition', 'applyMethod', 'daysPerWeek', 'workTime'];
    requiredList.forEach(key => { if (!form[key] || form[key].toString().trim() === '') newErrors[key] = true; });
    if (form.language.length === 0) newErrors.language = true;
    if (form.availableDays.length === 0) newErrors.availableDays = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("入力内容に不備があります。赤枠の項目を確認してください。");
      return;
    }
    if (!isAgreed) { setSubmitError("同意スイッチをオンにしてください。"); return; }

    setIsSubmitting(true);
    try {
      const GAS_URL = "https://script.google.com/macros/s/AKfycbw-XvwjckIsD2AiesVpEBigiXGsYTH-jl4_FLqcbrvbymyFPlGuOGeksi-UozMxjubBsw/exec"; 
      const searchParams = new URLSearchParams();
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) { searchParams.append(key, form[key].join(', ')); } else { searchParams.append(key, form[key]); }
      });
      searchParams.append('timestamp', new Date().toLocaleString('ja-JP'));
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: searchParams.toString() });
      setIsSent(true);
      Alert.alert("送信完了", "反映まで数秒お待ちください。");
    } catch (e) {
      setSubmitError("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ImageBackground 
          source={require('./assets/header-bg.png')} 
          style={styles.header}
          resizeMode="cover"
          <Section title="基本情報">
            <InputField label="お名前" placeholder="例：山田 花子" required value={form.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />
            <InputField label="かな" placeholder="例：やまだ はなこ" required value={form.kana} onChangeText={(v) => updateField('kana', v)} error={errors.kana} />
            <View style={styles.row}>
              <SelectButtons label="性別" options={['男性', '女性']} required selectedValue={form.gender} onSelect={(v) => updateField('gender', v)} error={errors.gender} customBtnStyle={{ minWidth: '40%', paddingVertical: 8 }} />
              <View style={{ width: 10 }} />
              <SelectButtons label="血液型" options={['A型', 'B型', 'O型', 'AB型']} required selectedValue={form.bloodType} onSelect={(v) => updateField('bloodType', v)} error={errors.bloodType} />
            </View>
            <View style={styles.labelRow}><Text style={styles.label}>生年月日</Text><Text style={styles.requiredTag}>必須</Text></View>
            <View style={styles.row}>
              <DropdownSelector flex={3} options={years} selectedValue={form.birthYear} onSelect={(v) => updateField('birthYear', v)} error={errors.birthYear} label="年" />
              <View style={{ width: 5 }} /><DropdownSelector flex={2} options={months} selectedValue={form.birthMonth} onSelect={(v) => updateField('birthMonth', v)} error={errors.birthMonth} label="月" />
              <View style={{ width: 5 }} /><DropdownSelector flex={2} options={days} selectedValue={form.birthDay} onSelect={(v) => updateField('birthDay', v)} error={errors.birthDay} label="日" />
            </View>
            <View style={styles.row}>
              <InputField label="年齢" placeholder="例：25" required keyboardType="numeric" value={form.age} onChangeText={(v) => updateField('age', v)} error={errors.age} flex={1} />
              <View style={{ width: 10 }} />
              <DropdownSelector label="干支" options={zodiacOptions} required selectedValue={form.zodiac} onSelect={(v) => updateField('zodiac', v)} error={errors.zodiac} flex={1.5} />
            </View>
            <InputField label="携帯番号" placeholder="09012345678" keyboardType="phone-pad" required value={form.phone} onChangeText={(v) => updateField('phone', v)} error={errors.phone} />
            <InputField label="現住所" placeholder="マンション名まで正確に" multiline required value={form.address} onChangeText={(v) => updateField('address', v)} error={errors.address} />
            <InputField label="本籍地" placeholder="都道府県名から" required value={form.domicile} onChangeText={(v) => updateField('domicile', v)} error={errors.domicile} />
            <View style={styles.row}>
              <InputField label="身長" placeholder="160cm" value={form.height} onChangeText={(v) => updateField('height', v)} />
              <View style={{ width: 10 }} /><InputField label="体重" placeholder="48kg" value={form.weight} onChangeText={(v) => updateField('weight', v)} />
            </View>
          </Section>

          <Section title="詳細情報">
            <SelectButtons label="現在の職業 [日中]" options={['学生', 'フリーター', '会社員', 'なし']} required selectedValue={form.jobDay} onSelect={(v) => updateField('jobDay', v)} error={errors.jobDay} />
            <SelectButtons label="現在の職業 [夜間]" options={['キャバクラ等', 'なし']} required selectedValue={form.jobNight} onSelect={(v) => updateField('jobNight', v)} error={errors.jobNight} />
            <SelectButtons label="お住まい" options={['実家', '一人暮らし', 'その他']} required selectedValue={form.livingStatus} onSelect={(v) => updateField('livingStatus', v)} error={errors.livingStatus} />
            {form.livingStatus === 'その他' && <InputField label="具体的な住まい" placeholder="例：寮" required value={form.livingStatusCustom} onChangeText={(v) => updateField('livingStatusCustom', v)} error={errors.livingStatusCustom} />}
            <InputField label="学校名.学年/最終学歴" placeholder="〇〇大学 卒業" required value={form.education} onChangeText={(v) => updateField('education', v)} error={errors.education} />
            <SelectButtons label="夜職の経験" options={['ある', 'ない']} required selectedValue={form.nightJobExp} onSelect={(v) => updateField('nightJobExp', v)} error={errors.nightJobExp} />
            <MultiSelectButtons label="語学" options={['日本語のみ', '英語', '中国語', 'その他']} required selectedValues={form.language} onToggle={(v) => toggleMulti('language', v)} error={errors.language} />
            {form.language.includes('その他') && <InputField label="具体的な語学" placeholder="例：韓国語" value={form.languageCustom} onChangeText={(v) => updateField('languageCustom', v)} />}
          </Section>

          <Section title="緊急連絡先">
            <InputField label="氏名" placeholder="例：山田 太郎" required value={form.emergencyName} onChangeText={(v) => updateField('emergencyName', v)} error={errors.emergencyName} />
            <InputField label="続柄" placeholder="例：父、母、姉、友人など" required value={form.emergencyRelationship} onChangeText={(v) => updateField('emergencyRelationship', v)} error={errors.emergencyRelationship} />
            <InputField label="電話番号" placeholder="例：090-0000-0000" required keyboardType="phone-pad" value={form.emergencyPhone} onChangeText={(v) => updateField('emergencyPhone', v)} error={errors.emergencyPhone} />
            <InputField label="住所" placeholder="例：東京都港区六本木1-2-3" required multiline value={form.emergencyAddress} onChangeText={(v) => updateField('emergencyAddress', v)} error={errors.emergencyAddress} />
          </Section>

          <Section title="勤務条件・希望">
            <SelectButtons label="採用条件" options={['社員', 'アルバイト']} required selectedValue={form.hireCondition} onSelect={(v) => updateField('hireCondition', v)} error={errors.hireCondition} />
            <SelectButtons label="応募方法" options={['紹介', 'WARPスタッフの紹介', '求人広告', 'その他']} required selectedValue={form.applyMethod} onSelect={(v) => updateField('applyMethod', v)} error={errors.applyMethod} />
            {['紹介', 'WARPスタッフの紹介'].includes(form.applyMethod) && <InputField label="紹介者名" placeholder="フルネームで入力してください" required value={form.introducer} onChangeText={(v) => updateField('introducer', v)} error={errors.introducer} />}
            {form.applyMethod === 'その他' && <InputField label="具体的な応募経由" placeholder="SNS名など" required value={form.applyMethodCustom} onChangeText={(v) => updateField('applyMethodCustom', v)} error={errors.applyMethodCustom} />}
            <SelectButtons label="週何回入れますか" options={['ほぼ毎日', '週4-5', '週2-3', '週0-1']} required selectedValue={form.daysPerWeek} onSelect={(v) => updateField('daysPerWeek', v)} error={errors.daysPerWeek} />
            <MultiSelectButtons label="何曜日入れますか" options={['月', '火', '水', '木', '金', '土', '日']} required selectedValues={form.availableDays} onToggle={(v) => toggleMulti('availableDays', v)} error={errors.availableDays} />
            {form.hireCondition !== '' && (
              <View style={styles.dynamicSection}>
                <View style={styles.workTimeHeader}><Text style={styles.workTimeNotice}>{form.hireCondition === '社員' ? '※社員は17時からの勤務になります' : '※アルバイトは19時からの勤務になります'}</Text></View>
                <SelectButtons label="勤務時間" options={form.hireCondition === '社員' ? ['未定','17時-ラスト', 'その他'] : ['未定','19時-ラスト', 'その他']} required selectedValue={form.workTime} onSelect={(v) => updateField('workTime', v)} error={errors.workTime} />
                {form.workTime === 'その他' && <InputField label="具体的な時間" required value={form.workTimeCustom} onChangeText={(v) => updateField('workTimeCustom', v)} error={errors.workTimeCustom} />}
              </View>
            )}
          </Section>

          <Section title="その他の情報 (任意回答)">
            <SelectButtons label="借金" options={['ある', 'ない']} selectedValue={form.debt} onSelect={(v) => updateField('debt', v)} />
            <SelectButtons label="交通手段" options={['電車', '車', 'その他']} selectedValue={form.transport} onSelect={(v) => updateField('transport', v)} />
            {form.transport === 'その他' && <InputField label="具体的な交通手段" value={form.transportCustom} onChangeText={(v) => updateField('transportCustom', v)} />}
            <SelectButtons label="刺青・タトゥー" options={['ある', 'ない']} selectedValue={form.tattoo} onSelect={(v) => updateField('tattoo', v)} />
            {form.tattoo === 'ある' && <InputField label="タトゥーの部位,大きさ" value={form.tattooDetail} onChangeText={(v) => updateField('tattooDetail', v)} />}
          </Section>

          <Section title="過去の職歴">
            <WorkHistoryCard symbol="①" prefix="workHistory1" data={form} updateField={updateField} />
            <WorkHistoryCard symbol="②" prefix="workHistory2" data={form} updateField={updateField} />
            <WorkHistoryCard symbol="③" prefix="workHistory3" data={form} updateField={updateField} />
          </Section>

          <View style={styles.consentCardContainer}>
            <View style={styles.consentCard}>
              <Text style={styles.consentText}>入力内容に間違いありませんか？</Text>
              <Switch value={isAgreed} onValueChange={(v) => setIsAgreed(v)} trackColor={{ false: "#767577", true: "#2E8B57" }} />
            </View>
          </View>
          
          <Pressable 
            onPress={handleViewSubmit} disabled={!isAgreed || isSubmitting}
            style={({ pressed }) => [styles.submitButton, (!isAgreed || isSubmitting) && styles.submitButtonDisabled, pressed && { backgroundColor: '#007B50' }]}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>内容を確認して送信</Text>}
          </Pressable>

          {submitError !== "" && <View style={styles.msgBanner}><Text style={styles.errorTextOnly}>{submitError}</Text></View>}
          {isSent && <View style={styles.msgBanner}><Text style={styles.sentTextOnly}>送信されました。ありがとうございます！</Text></View>}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#98D96E' },
  header: { paddingVertical: 15, alignItems: 'center' },
  headerTitle: { ...fontSettings, fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 4 },
  sectionTitle: { ...fontSettings, fontSize: 17, fontWeight: 'bold', color: '#76B148', marginBottom: 16, textAlign: 'center' },
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: { ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  input: { ...fontSettings, backgroundColor: '#F8FBF8', borderRadius: 12, padding: 12, fontSize: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#76B148' },
  inputError: { borderColor: '#FF3B30' },
  errorText: { ...fontSettings, color: '#FF3B30', fontSize: 11, marginTop: 4 },
  textArea: { height: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap' },
  selectBtn: { flexGrow: 1, minWidth: '45%', backgroundColor: '#F1F9EE', padding: 12, borderRadius: 25, alignItems: 'center', margin: 4 },
  selectBtnActive: { backgroundColor: '#76B148' },
  selectBtnPressed: { backgroundColor: '#F2F2F2' },
  selectBtnText: { ...fontSettings, fontSize: 12, color: '#76B148', fontWeight: 'bold' },
  selectBtnTextActive: { color: '#fff' },
  dropdownTrigger: { backgroundColor: '#F1F9EE', borderRadius: 25, padding: 12, alignItems: 'center' },
  dropdownText: { ...fontSettings, fontSize: 14, color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  modalTitle: { ...fontSettings, fontSize: 16, fontWeight: 'bold' },
  modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { ...fontSettings, fontSize: 16 },
  checkmark: { color: '#76B148', fontWeight: 'bold' },
  dynamicSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  workTimeHeader: { marginBottom: 8 },
  workTimeNotice: { ...fontSettings, fontSize: 12, color: '#FF3B30', fontWeight: 'bold' },
  consentCardContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 8, marginBottom: 20, elevation: 4 },
  consentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F9EE', padding: 16, borderRadius: 15 },
  consentText: { ...fontSettings, flex: 1, fontSize: 13, color: '#333', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#76B148', padding: 18, borderRadius: 30, alignItems: 'center', elevation: 2 },
  submitButtonDisabled: { backgroundColor: '#CCC' },
  submitButtonText: { ...fontSettings, color: '#fff', fontSize: 16, fontWeight: 'bold' },
  historyCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ECEEF1' },
  historyLabel: { ...fontSettings, fontSize: 16, fontWeight: 'bold', color: '#2E8B57', marginBottom: 10 },
  msgBanner: { marginTop: 15, alignItems: 'center' },
  errorTextOnly: { ...fontSettings, color: '#FF3B30', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  sentTextOnly: { ...fontSettings, color: '#FF3B30', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
