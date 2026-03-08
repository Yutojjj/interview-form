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
  Modal,
  ActivityIndicator,
  Pressable,
  Image,
  Linking,
} from 'react-native';

// --- フォント・共通設定 ---
const fontSettings = {
  fontFamily: Platform.OS === 'ios' ? 'Hiragino Sans Round' : 'sans-serif-medium',
  letterSpacing: 0.5,
};

// --- リスト設定 ---
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 65 }, (_, i) => (currentYear - 18 - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const ageOptions = Array.from({ length: 53 }, (_, i) => (i + 18).toString());
const zodiacOptions = ['ねずみ', 'うし', 'とら', 'うさぎ', 'たつ', 'へび', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'いのしし'];

const industryOptions = [
  '飲食・接客', '営業・販売', '事務・オフィスワーク', '建設・現場系', 
  '運送・ドライバー', 'IT・クリエイティブ', '美容・エステ', '医療・福祉', 
  'ナイトワーク関連', 'その他'
];

// --- 共通コンポーネント ---
const Section = ({ title, description, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description && <Text style={styles.sectionDescription}>{description}</Text>}
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
      <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{label}を選択</Text></View>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((item) => (
                <TouchableOpacity 
                  key={item.toString()} 
                  style={[styles.modalItem, selectedValue === item.toString() && { backgroundColor: '#F1F9EE' }]} 
                  onPress={() => { onSelect(item.toString()); setModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, selectedValue === item.toString() && { color: '#76B148', fontWeight: 'bold' }]}>{item}</Text>
                  {selectedValue === item.toString() && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
    <View style={[styles.buttonRow, error && { borderBottomWidth: 2, borderBottomColor: '#EF5350', borderRadius: 8 }]}>
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
    <View style={[styles.buttonRow, error && { borderBottomWidth: 2, borderBottomColor: '#EF5350', borderRadius: 8 }]}>
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

const WorkHistoryCard = ({ symbol, prefix, data, updateField, isNight = false }) => (
  <View style={[styles.historyCard, isNight && { borderColor: '#76B148', backgroundColor: '#F8FBF8', borderStyle: 'dashed' }]}>
    <Text style={[styles.historyLabel, isNight && { color: '#2E8B57' }]}>
      {isNight ? `夜職歴 ${symbol}` : `昼職歴 ${symbol}`}
    </Text>
    <InputField label="勤務先" placeholder={isNight ? "例：Club ABC" : "例：株式会社○○"} value={data[`${prefix}Name`]} onChangeText={(v) => updateField(`${prefix}Name`, v)} />
    
    <SelectButtons 
      label="雇用の形態" 
      options={['アルバイト', '社員']} 
      selectedValue={data[`${prefix}Type`]} 
      onSelect={(v) => updateField(`${prefix}Type`, v)} 
      customBtnStyle={{ minWidth: '40%', padding: 8 }}
    />

    <View style={styles.row}>
      <InputField label="時給/給与" placeholder="例:1500円" flex={1} value={data[`${prefix}Wage`]} onChangeText={(v) => updateField(`${prefix}Wage`, v)} />
      <View style={{ width: 10 }} />
      <InputField label="期間" placeholder="例：1年" flex={1} value={data[`${prefix}Period`]} onChangeText={(v) => updateField(`${prefix}Period`, v)} />
    </View>
    <InputField label="退職日" placeholder="例：2024/01" value={data[`${prefix}QuitDate`]} onChangeText={(v) => updateField(`${prefix}QuitDate`, v)} />
    <InputField label="退職理由" multiline value={data[`${prefix}QuitReason`]} onChangeText={(v) => updateField(`${prefix}QuitReason`, v)} />
  </View>
);

export default function App() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [form, setForm] = useState({
    name: '', kana: '', gender: '', bloodType: '',
    birthYear: '', birthMonth: '', birthDay: '', age: '', zodiac: '', 
    phone: '', address: '', domicileStatus: '', domicileCustom: '', height: '', weight: '',
    jobStatus: '', jobDay: '', jobNight: '', education: '', nightJobExp: '', 
    currentJobName: '', currentJobIndustry: '', currentJobWage: '', currentJobPeriod: '',
    livingStatus: '', livingStatusCustom: '', language: [], languageCustom: '', 
    familyStatus: '', familyCustom: '', qualifications: '', hobby: '', skill: '',
    chronicIllness: '', illnessDetail: '', shopCondition: '',
    email: '', pcEmail: '', lineId: '', instagramId: '', facebookId: '', xId: '',
    motivation: '',
    emergencyName: '', emergencyRelationship: '', emergencyRelationshipCustom: '', emergencyPhone: '', emergencyAddressStatus: '', emergencyAddressCustom: '',
    hireCondition: '', applyMethod: '', applyMethodCustom: '', introducer: '', 
    daysPerWeek: '', availableDays: [], workTime: '', workTimeCustom: '',
    transportDropoff: '', transportDropoffAddressStatus: '', transportDropoffAddressCustom: '',
    debt: '', debtDetail: '',
    transport: '', transportCustom: '', tattoo: '', tattooDetail: '',
    officeHistory1Name: '', officeHistory1Type: '', officeHistory1Wage: '', officeHistory1Period: '', officeHistory1QuitDate: '', officeHistory1QuitReason: '',
    officeHistory2Name: '', officeHistory2Type: '', officeHistory2Wage: '', officeHistory2Period: '', officeHistory2QuitDate: '', officeHistory2QuitReason: '',
    officeHistory3Name: '', officeHistory3Type: '', officeHistory3Wage: '', officeHistory3Period: '', officeHistory3QuitDate: '', officeHistory3QuitReason: '',
    nightHistory1Name: '', nightHistory1Type: '', nightHistory1Wage: '', nightHistory1Period: '', nightHistory1QuitDate: '', nightHistory1QuitReason: '',
    nightHistory2Name: '', nightHistory2Type: '', nightHistory2Wage: '', nightHistory2Period: '', nightHistory2QuitDate: '', nightHistory2QuitReason: '',
    nightHistory3Name: '', nightHistory3Type: '', nightHistory3Wage: '', nightHistory3Period: '', nightHistory3QuitDate: '', nightHistory3QuitReason: ''
  });
  
  const [errors, setErrors] = useState({});

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
    if (list.length > 0) { setErrors(prev => ({ ...prev, [key]: false })); }
  };

  const handleClose = () => { Linking.openURL('https://warp-net.jp/'); };

  const handleViewSubmit = async () => {
    setSubmitError(""); setIsSent(false);
    let newErrors = {};
    
    // 必須チェック項目の同期（漏れていたtransportDropoff等を追加）
    const requiredList = [
      'name', 'kana', 'gender', 'bloodType', 'birthYear', 'birthMonth', 'birthDay', 'age', 'zodiac', 
      'phone', 'address', 'domicileStatus', 'jobStatus', 'jobDay', 'education', 'nightJobExp', 'livingStatus',
      'emergencyName', 'emergencyRelationship', 'emergencyPhone', 'emergencyAddressStatus',
      'motivation', 'hireCondition', 'applyMethod', 'daysPerWeek', 'workTime', 'transportDropoff'
    ];

    requiredList.forEach(key => {
      const val = form[key];
      if (!val || (Array.isArray(val) && val.length === 0) || val.toString().trim() === '') {
        newErrors[key] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("赤枠の項目が未入力です。スクロールして確認してください。");
      return;
    }
    if (!isAgreed) { setSubmitError("「間違いありませんか？」にチェックを入れてください。"); return; }

    setIsSubmitting(true);
    try {
      const GAS_URL = "https://script.google.com/macros/s/AKfycbxUUsCNiNVAyuKfPrtDA43JucJaZecGZEaeW3C6g9ns_x3tiQ8TbbBq-IYaVNWc-ifWrw/exec"; 
      const searchParams = new URLSearchParams();
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) { 
          searchParams.append(key, form[key].join(', ')); 
        } else { 
          searchParams.append(key, form[key]); 
        }
      });
      searchParams.append('timestamp', new Date().toLocaleString('ja-JP'));
      searchParams.append('formType', 'employee');

      await fetch(GAS_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
        body: searchParams.toString() 
      });
      setIsSent(true);
    } catch (e) {
      setSubmitError("通信エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isSent ? (
        <View style={styles.successPage}>
          <Image source={require('./assets/LOGO.png')} style={styles.successLogo} resizeMode="contain" />
          <Text style={styles.successTitle}>送信が完了しました</Text>
          <Text style={styles.successMessage}>面接フォームのご記入ありがとうございます。{"\n"}テーブル上の呼び出しボタンを押してお待ちください。</Text>
          <View style={styles.successButtonRow}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: '#888' }]} onPress={() => setIsSent(false)}>
              <Text style={styles.backButtonText}>入力し直す</Text>
            </TouchableOpacity>
            <View style={{ width: 15 }} />
            <TouchableOpacity style={styles.backButton} onPress={handleClose}>
              <Text style={styles.backButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>【アルバイト/社員用面接フォーム】</Text>
            <Text style={{ ...fontSettings, color: '#FAFAD2', fontSize: 14 }}>目安:回答時間5分程度</Text>
          </View>
          
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

            <Section title="基本情報">
              <InputField label="お名前" placeholder="例：山田 花子" required value={form.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />
              <InputField label="かな" placeholder="例：やまだ はなこ" required value={form.kana} onChangeText={(v) => updateField('kana', v)} error={errors.kana} />
              <SelectButtons label="性別" options={['男性', '女性']} required selectedValue={form.gender} onSelect={(v) => updateField('gender', v)} error={errors.gender} />
              <SelectButtons label="血液型" options={['A型', 'B型', 'O型', 'AB型']} required selectedValue={form.bloodType} onSelect={(v) => updateField('bloodType', v)} error={errors.bloodType} />
              
              <View style={styles.labelRow}><Text style={styles.label}>生年月日</Text><Text style={styles.requiredTag}>必須</Text></View>
              <View style={styles.row}>
                <DropdownSelector flex={3} options={years} selectedValue={form.birthYear} onSelect={(v) => updateField('birthYear', v)} error={errors.birthYear} label="年" />
                <View style={{ width: 5 }} /><DropdownSelector flex={2} options={months} selectedValue={form.birthMonth} onSelect={(v) => updateField('birthMonth', v)} error={errors.birthMonth} label="月" />
                <View style={{ width: 5 }} /><DropdownSelector flex={2} options={days} selectedValue={form.birthDay} onSelect={(v) => updateField('birthDay', v)} error={errors.birthDay} label="日" />
              </View>
              <View style={styles.row}>
                <DropdownSelector label="年齢" options={ageOptions} required selectedValue={form.age} onSelect={(v) => updateField('age', v)} error={errors.age} flex={1} />
                <View style={{ width: 10 }} />
                <DropdownSelector label="干支(えと)" options={zodiacOptions} required selectedValue={form.zodiac} onSelect={(v) => updateField('zodiac', v)} error={errors.zodiac} flex={1.5} />
              </View>
              <InputField label="携帯番号" placeholder="例：09012345678" keyboardType="phone-pad" required value={form.phone} onChangeText={(v) => updateField('phone', v)} error={errors.phone} />
              <InputField label="現住所" placeholder="例:愛知県名古屋市北区1-14" multiline required value={form.address} onChangeText={(v) => updateField('address', v)} error={errors.address} />
              
              <SelectButtons label="本籍地" options={['現住所と同じ', 'その他']} required selectedValue={form.domicileStatus} onSelect={(v) => updateField('domicileStatus', v)} error={errors.domicileStatus} />
              {form.domicileStatus === 'その他' && <InputField label="本籍地の詳細" placeholder="例：東京都、海外など" value={form.domicileCustom} onChangeText={(v) => updateField('domicileCustom', v)} />}

              <View style={styles.row}>
                <InputField label="身長(cm)" placeholder="例：160" keyboardType="numeric" value={form.height} onChangeText={(v) => updateField('height', v)} flex={1} />
                <View style={{ width: 10 }} />
                <InputField label="体重(kg)" placeholder="例：50" keyboardType="numeric" value={form.weight} onChangeText={(v) => updateField('weight', v)} flex={1} />
              </View>
            </Section>

            <Section title="緊急連絡先" description="万が一の際にご連絡できる情報を記入してください。">
              <InputField label="氏名" placeholder="例：山田 太郎" required value={form.emergencyName} onChangeText={(v) => updateField('emergencyName', v)} error={errors.emergencyName} />
              <DropdownSelector label="続柄" options={['父', '母', '兄', '弟', '姉', '妹', '祖父母', 'その他']} required selectedValue={form.emergencyRelationship} onSelect={(v) => updateField('emergencyRelationship', v)} error={errors.emergencyRelationship} />
              {form.emergencyRelationship === 'その他' && <InputField label="具体的な続柄" placeholder="例：叔父" value={form.emergencyRelationshipCustom} onChangeText={(v) => updateField('emergencyRelationshipCustom', v)} />}
              <InputField label="電話番号" placeholder="例:09012346789" required keyboardType="phone-pad" value={form.emergencyPhone} onChangeText={(v) => updateField('emergencyPhone', v)} error={errors.emergencyPhone} />
              
              <SelectButtons label="住所" options={['現住所と同じ', 'その他']} required selectedValue={form.emergencyAddressStatus} onSelect={(v) => updateField('emergencyAddressStatus', v)} error={errors.emergencyAddressStatus} />
              {form.emergencyAddressStatus === 'その他' && <InputField label="住所の詳細" placeholder="ご実家などの住所" multiline value={form.emergencyAddressCustom} onChangeText={(v) => updateField('emergencyAddressCustom', v)} />}
            </Section>

            <Section title="職業・学歴" description="現在の状況について教えてください。">
              <SelectButtons label="現職業の状況" options={['週7', '週5-6', '週3-4', '週1-2', '週0']} required selectedValue={form.jobStatus} onSelect={(v) => updateField('jobStatus', v)} error={errors.jobStatus} />
              <SelectButtons label="現在の職業" options={['学生', 'フリーター/アルバイト', '会社員','自営業','昼キャバクラ等','なし']} required selectedValue={form.jobDay} onSelect={(v) => updateField('jobDay', v)} error={errors.jobDay} />
              
              {(form.jobDay === 'フリーター/アルバイト' || form.jobDay === '会社員' || form.jobDay === '自営業' || form.jobDay === '昼キャバクラ等') && (
                <View style={styles.dynamicSubSection}>
                  <Text style={styles.subSectionTitle}>▼ 現在の勤務詳細をご記入ください</Text>
                  <InputField label="現在の会社名/店名" placeholder="例：株式会社○○" value={form.currentJobName} onChangeText={(v) => updateField('currentJobName', v)} />
                  <SelectButtons label="業種" options={industryOptions} selectedValue={form.currentJobIndustry} onSelect={(v) => updateField('currentJobIndustry', v)} />
                  <View style={styles.row}>
                    <InputField label="月収/給与" placeholder="例: 25万円" flex={1} value={form.currentJobWage} onChangeText={(v) => updateField('currentJobWage', v)} />
                    <View style={{ width: 10 }} />
                    <InputField label="在籍期間" placeholder="例：2年" flex={1} value={form.currentJobPeriod} onChangeText={(v) => updateField('currentJobPeriod', v)} />
                  </View>
                </View>
              )}
              <InputField label="学校名.学年/最終学歴" placeholder="例：○○大学 卒業" required value={form.education} onChangeText={(v) => updateField('education', v)} error={errors.education} />
              <SelectButtons label="お住まい" options={['実家', '一人暮らし', 'その他']} required selectedValue={form.livingStatus} onSelect={(v) => updateField('livingStatus', v)} error={errors.livingStatus} />
              {form.livingStatus === 'その他' && <InputField label="具体的な住まい" placeholder="例：寮など" value={form.livingStatusCustom} onChangeText={(v) => updateField('livingStatusCustom', v)} />}
              <MultiSelectButtons label="語学" options={['日本語のみ', '英語', '中国語', 'その他']} selectedValues={form.language} onToggle={(v) => toggleMulti('language', v)} />
              {form.language.includes('その他') && <InputField label="具体的な語学" placeholder="例：韓国語" value={form.languageCustom} onChangeText={(v) => updateField('languageCustom', v)} />}
            </Section>

            <Section title="志望動機・勤務条件" description="採用にあたっての判断基準となります。">
              <InputField label="志望動機" placeholder="こちらにご記入ください" required multiline value={form.motivation} onChangeText={(v) => updateField('motivation', v)} error={errors.motivation} />
              <SelectButtons label="雇用形態" options={['社員', 'アルバイト']} required selectedValue={form.hireCondition} onSelect={(v) => updateField('hireCondition', v)} error={errors.hireCondition} />
              {form.hireCondition !== '' && (
                <View style={styles.dynamicSection}>
                  <Text style={styles.workTimeNotice}>{form.hireCondition === '社員' ? '※社員：17時〜' : '※アルバイト：19時〜'}</Text>
                  <SelectButtons label="勤務時間" options={form.hireCondition === '社員' ? ['未定','17時-ラスト', 'その他'] : ['未定','19時-ラスト', 'その他']} required selectedValue={form.workTime} onSelect={(v) => updateField('workTime', v)} error={errors.workTime} />
                  {form.workTime === 'その他' && <InputField label="具体的時間を入力" required value={form.workTimeCustom} onChangeText={(v) => updateField('workTimeCustom', v)} error={errors.workTimeCustom} />}
                </View>
              )}
              
              <SelectButtons label="送りの有無" options={['希望する', '希望しない']} required selectedValue={form.transportDropoff} onSelect={(v) => updateField('transportDropoff', v)} error={errors.transportDropoff} />
              {form.transportDropoff === '希望する' && (
                <View style={styles.dynamicSubSection}>
                  <SelectButtons label="送りの場所" options={['現住所と同じ', 'その他']} selectedValue={form.transportDropoffAddressStatus} onSelect={(v) => updateField('transportDropoffAddressStatus', v)} />
                  {form.transportDropoffAddressStatus === 'その他' && (
                    <InputField label="送り先住所の詳細" placeholder="送り先の住所を入力" multiline value={form.transportDropoffAddressCustom} onChangeText={(v) => updateField('transportDropoffAddressCustom', v)} />
                  )}
                </View>
              )}

              <SelectButtons label="応募方法" options={['紹介', 'WARPスタッフの紹介', '求人広告', 'その他']} required selectedValue={form.applyMethod} onSelect={(v) => updateField('applyMethod', v)} error={errors.applyMethod} />
              {['紹介', 'WARPスタッフの紹介'].includes(form.applyMethod) && <InputField label="紹介者名" required placeholder="フルネームを入力" value={form.introducer} onChangeText={(v) => updateField('introducer', v)} error={errors.introducer} />}
              {form.applyMethod === 'その他' && <InputField label="具体的応募経由" required placeholder="具体的SNS名など" value={form.applyMethodCustom} onChangeText={(v) => updateField('applyMethodCustom', v)} error={errors.applyMethodCustom} />}
              <SelectButtons label="週何回入れますか" options={['未定','ほぼ毎日', '週4-5', '週2-3', '週0-1']} required selectedValue={form.daysPerWeek} onSelect={(v) => updateField('daysPerWeek', v)} error={errors.daysPerWeek} />
              <MultiSelectButtons label="何曜日入れますか" options={['未定','月', '火', '水', '木', '金', '土']} required selectedValues={form.availableDays} onToggle={(v) => toggleMulti('availableDays', v)} error={errors.availableDays} />
            </Section>

            <Section title="職歴" description="昼職・夜職それぞれの経歴をご記入ください。">
              <SelectButtons label="夜職の経験" options={['ある', 'ない']} required selectedValue={form.nightJobExp} onSelect={(v) => updateField('nightJobExp', v)} error={errors.nightJobExp} />
              {form.nightJobExp === 'ある' && (
                <View style={styles.dynamicSubSection}>
                  <Text style={styles.subSectionTitle}>▼ 夜職歴をご記入ください</Text>
                  <WorkHistoryCard symbol="①" prefix="nightHistory1" data={form} updateField={updateField} isNight />
                  <WorkHistoryCard symbol="②" prefix="nightHistory2" data={form} updateField={updateField} isNight />
                  <WorkHistoryCard symbol="③" prefix="nightHistory3" data={form} updateField={updateField} isNight />
                </View>
              )}
              <Text style={styles.historySectionLabel}>▼ 昼職歴をご記入ください</Text>
              <WorkHistoryCard symbol="①" prefix="officeHistory1" data={form} updateField={updateField} />
              <WorkHistoryCard symbol="②" prefix="officeHistory2" data={form} updateField={updateField} />
              <WorkHistoryCard symbol="③" prefix="officeHistory3" data={form} updateField={updateField} />
            </Section>

            <Section title="（任意回答）家族・プライベート・SNS・その他">
              <SelectButtons label="家族構成・パートナー" options={['配偶者がいる', '子供がいる', '独身', 'その他']} selectedValue={form.familyStatus} onSelect={(v) => updateField('familyStatus', v)} />
              {form.familyStatus === 'その他' && <InputField label="詳細" placeholder="具体的に" value={form.familyCustom} onChangeText={(v) => updateField('familyCustom', v)} />}
              <InputField label="保有資格" placeholder="例：普通免許など" value={form.qualifications} onChangeText={(v) => updateField('qualifications', v)} />
              <InputField label="趣味" placeholder="趣味" value={form.hobby} onChangeText={(v) => updateField('hobby', v)} />
              <InputField label="特技" placeholder="特技" value={form.skill} onChangeText={(v) => updateField('skill', v)} />
              <SelectButtons label="持病" options={['ある', 'ない']} selectedValue={form.chronicIllness} onSelect={(v) => updateField('chronicIllness', v)} />
              {form.chronicIllness === 'ある' && <InputField label="持病の具体的な内容" placeholder="内容" multiline value={form.illnessDetail} onChangeText={(v) => updateField('illnessDetail', v)} />}
              <InputField label="お探しのお店の条件" placeholder="条件" multiline value={form.shopCondition} onChangeText={(v) => updateField('shopCondition', v)} />
              <SelectButtons label="借金" options={['ある', 'ない']} selectedValue={form.debt} onSelect={(v) => updateField('debt', v)} /> 
              {form.debt === 'ある' && <InputField label="いくらありますか" value={form.debtDetail} onChangeText={(v) => updateField('debtDetail', v)} />}
              <SelectButtons label="通勤手段" options={['電車', '車', 'その他']} selectedValue={form.transport} onSelect={(v) => updateField('transport', v)} />
              {form.transport === 'その他' && <InputField label="具体的交通手段" value={form.transportCustom} onChangeText={(v) => updateField('transportCustom', v)} />}
              <SelectButtons label="刺青・タトゥー" options={['ある', 'ない']} selectedValue={form.tattoo} onSelect={(v) => updateField('tattoo', v)} />
              {form.tattoo === 'ある' && <InputField label="部位・大きさ" value={form.tattooDetail} onChangeText={(v) => updateField('tattooDetail', v)} />}
              
              <InputField label="メールアドレス" placeholder="example@mail.com" keyboardType="email-address" value={form.email} onChangeText={(v) => updateField('email', v)} />
              <InputField label="PCアドレス" placeholder="pc@mail.com" keyboardType="email-address" value={form.pcEmail} onChangeText={(v) => updateField('pcEmail', v)} />
              <InputField label="LINE ID" placeholder="line id" value={form.lineId} onChangeText={(v) => updateField('lineId', v)} />
              <InputField label="Instagram ID" placeholder="@insta_id" value={form.instagramId} onChangeText={(v) => updateField('instagramId', v)} />
              <InputField label="Facebook ID" placeholder="facebook id" value={form.facebookId} onChangeText={(v) => updateField('facebookId', v)} />
              <InputField label="X ID" placeholder="@x_id" value={form.xId} onChangeText={(v) => updateField('xId', v)} />
            </Section>

            <View style={styles.consentCardContainer}>
              <View style={styles.consentCard}>
                <Text style={styles.consentText}>入力内容に間違いありませんか？</Text>
                <Switch value={isAgreed} onValueChange={(v) => setIsAgreed(v)} trackColor={{ false: "#767577", true: "#2E8B57" }} />
              </View>
            </View>
            
            <Pressable 
              onPress={handleViewSubmit} disabled={isSubmitting}
              style={({ pressed }) => [styles.submitButton, isSubmitting && styles.submitButtonDisabled, pressed && { backgroundColor: '#007B50' }]}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>内容を確認して送信</Text>}
            </Pressable>

            {submitError !== "" && <View style={styles.msgBanner}><Text style={styles.errorTextOnly}>{submitError}</Text></View>}
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#98D96E' },
  header: { paddingVertical: 15, alignItems: 'center' },
  headerTitle: { ...fontSettings, fontSize: 18, fontWeight: 'bold', color: '#fff' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 4 },
  sectionTitle: { ...fontSettings, fontSize: 17, fontWeight: 'bold', color: '#76B148', marginBottom: 4, textAlign: 'center' },
  sectionDescription: { ...fontSettings, fontSize: 11, color: '#888', marginBottom: 16, textAlign: 'center' },
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  label: { ...fontSettings, fontSize: 13, color: '#333', fontWeight: 'bold' },
  requiredTag: { ...fontSettings, fontSize: 10, color: '#fff', backgroundColor: '#EF5350', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  input: { ...fontSettings, backgroundColor: '#F8FBF8', borderRadius: 12, padding: 12, fontSize: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#76B148' },
  inputError: { borderBottomColor: '#EF5350', borderBottomWidth: 2 },
  errorText: { ...fontSettings, color: '#EF5350', fontSize: 11, marginTop: 4 },
  textArea: { height: 100, textAlignVertical: 'top' },
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
  modalItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { ...fontSettings, fontSize: 16 },
  checkmark: { color: '#76B148', fontWeight: 'bold', fontSize: 18 },
  dynamicSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15, marginBottom: 15 },
  dynamicSubSection: { marginTop: 15, padding: 10, backgroundColor: '#F8FBF8', borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#76B148' },
  subSectionTitle: { ...fontSettings, fontSize: 13, color: '#2E8B57', fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  historySectionLabel: { ...fontSettings, fontSize: 13, color: '#76B148', fontWeight: 'bold', marginTop: 15, marginBottom: 10, textAlign: 'center' },
  workTimeNotice: { ...fontSettings, fontSize: 12, color: '#EF5350', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  consentCardContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 8, marginBottom: 20, elevation: 4 },
  consentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F9EE', padding: 16, borderRadius: 15 },
  consentText: { ...fontSettings, flex: 1, fontSize: 13, color: '#333', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#76B148', padding: 18, borderRadius: 30, alignItems: 'center', elevation: 2 },
  submitButtonDisabled: { backgroundColor: '#CCC' },
  submitButtonText: { ...fontSettings, color: '#fff', fontSize: 16, fontWeight: 'bold' },
  historyCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ECEEF1' },
  historyLabel: { ...fontSettings, fontSize: 14, fontWeight: 'bold', color: '#2E8B57', marginBottom: 10 },
  msgBanner: { marginTop: 15, alignItems: 'center' },
  errorTextOnly: { ...fontSettings, color: '#EF5350', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  successPage: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successLogo: { width: 180, height: 180, marginBottom: 20 },
  successTitle: { ...fontSettings, fontSize: 22, fontWeight: 'bold', color: '#76B148', marginBottom: 10 },
  successMessage: { ...fontSettings, fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  successButtonRow: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  backButton: { backgroundColor: '#76B148', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, flex: 1, alignItems: 'center' },
  backButtonText: { ...fontSettings, color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
