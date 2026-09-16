import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info } from 'lucide-react';
import { useTenantBranding } from '../features/tenant/tenantBranding';
import { useInsuredAuth } from '../features/auth/InsuredAuthContext';
import { useActivePet } from '../hooks/useActivePet';
import { PetAvatar } from '../components/ui/pet/PetAvatar';
import { BrandLogo } from '../components/ui/BrandLogo';

export default function OnboardingPage() {
  const branding = useTenantBranding();
  const { user } = useInsuredAuth();
  const { activeMascota, polizas } = useActivePet();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Datos del formulario de onboarding
  const [especie, setEspecie] = useState<'perro' | 'gato'>('perro');
  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'hembra'>('macho');

  // Paso 2
  const [apodo, setApodo] = useState('');
  const [raza, setRaza] = useState('');
  const [pesoKg, setPesoKg] = useState<string>('');
  const [microchip, setMicrochip] = useState('');
  const [chipEnTramite, setChipEnTramite] = useState(false);

  // Paso 3
  const [veterinario, setVeterinario] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');
  const [notasAlergias, setNotasAlergias] = useState('');

  const riesgoId = activeMascota?.riesgoId || (polizas[0]?.mascota.riesgoId ?? '');

  // Precargar datos desde la API de Cartera y LocalStorage
  useEffect(() => {
    if (activeMascota) {
      setEspecie(activeMascota.especie === 'gato' ? 'gato' : 'perro');
      setNombre(activeMascota.nombre || '');
      setRaza(activeMascota.raza || '');
      setMicrochip(activeMascota.microchip || '');
    }

    if (riesgoId) {
      try {
        const saved = localStorage.getItem(`pet_custom_${riesgoId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.apodo) setApodo(parsed.apodo);
          if (parsed.raza) setRaza(parsed.raza);
          if (parsed.pesoKg) setPesoKg(String(parsed.pesoKg));
          if (parsed.microchip) setMicrochip(parsed.microchip);
          if (parsed.veterinario) setVeterinario(parsed.veterinario);
          if (parsed.telefonoEmergencia) setTelefonoEmergencia(parsed.telefonoEmergencia);
          if (parsed.notasAlergias) setNotasAlergias(parsed.notasAlergias);
        }
      } catch {
        // Ignorar error de parsing
      }
    }
  }, [activeMascota, riesgoId]);

  const persistData = () => {
    if (!riesgoId) return;
    const customData = {
      nombre: nombre.trim() || activeMascota?.nombre,
      especie,
      sexo,
      apodo: apodo.trim(),
      raza: raza.trim(),
      pesoKg: pesoKg ? parseFloat(pesoKg) : undefined,
      microchip: chipEnTramite ? 'EN TRAMITE' : microchip.trim(),
      veterinario: veterinario.trim(),
      telefonoEmergencia: telefonoEmergencia.trim(),
      notasAlergias: notasAlergias.trim(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`pet_custom_${riesgoId}`, JSON.stringify(customData));

    if (user?.rut) {
      localStorage.setItem(`pet_onboarded_${user.rut}`, 'true');
    }
  };

  const handleNext = () => {
    if (step === 1 && !nombre.trim()) {
      alert('Por favor ingresa el nombre de la mascota.');
      return;
    }

    persistData();

    if (step < 3) {
      setStep((prev) => (prev + 1) as 2 | 3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/home');
    }
  };

  const handleSaveAndExit = () => {
    persistData();
    navigate('/home');
  };

  const handleSkip = () => {
    if (user?.rut) {
      localStorage.setItem(`pet_onboarded_${user.rut}`, 'true');
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-(--color-canvas) flex flex-col justify-between pb-10">
      {/* Cabecera limpia */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3) : navigate('/home'))}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <BrandLogo size="sm" className="max-h-6" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Guardar y salir
            </button>
          </div>
        </div>

        {/* Barra de progreso de 3 pasos */}
        <div className="max-w-lg mx-auto pt-2.5">
          <div className="w-full bg-stone-200/70 rounded-full h-1 overflow-hidden">
            <div
              className="bg-stone-900 h-full transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
            />
          </div>
        </div>
      </header>

      {/* Cuerpo principal */}
      <main className="max-w-lg mx-auto w-full px-4 pt-5 flex flex-col gap-5 flex-1">
        {/* Indicador de paso */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500">
            {step === 1 && 'Paso 1 de 3 · Datos básicos'}
            {step === 2 && 'Paso 2 de 3 · Identificación del paciente'}
            {step === 3 && 'Paso 3 de 3 · Ficha médica de urgencia'}
          </span>
          <span className="text-xs text-stone-400 font-mono">
            {branding.policyPlanName}
          </span>
        </div>

        {/* PASO 1: DATOS BÁSICOS */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                Ficha de la mascota asegurada
              </h1>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Confirma los datos de tu mascota registrados bajo el plan de asistencia de {branding.brandName}.
              </p>
            </div>

            {/* Especie */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                Especie
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEspecie('perro')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    especie === 'perro'
                      ? 'bg-white border-stone-900 shadow-xs'
                      : 'bg-white/80 border-stone-200 hover:bg-white text-stone-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">Canino</span>
                    <span className="text-[11px] text-stone-500">Perro</span>
                  </div>
                  {especie === 'perro' && (
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEspecie('gato')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    especie === 'gato'
                      ? 'bg-white border-stone-900 shadow-xs'
                      : 'bg-white/80 border-stone-200 hover:bg-white text-stone-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-stone-900 text-sm block">Felino</span>
                    <span className="text-[11px] text-stone-500">Gato</span>
                  </div>
                  {especie === 'gato' && (
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Nombre oficial */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Nombre de la mascota
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre oficial o en cartilla"
                className="w-full px-4 py-3 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white font-medium"
              />
              <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Usa el nombre que figura en su cartilla veterinaria oficial.</span>
              </p>
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                Sexo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSexo('macho')}
                  className={`py-2.5 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    sexo === 'macho'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>Macho</span>
                  {sexo === 'macho' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSexo('hembra')}
                  className={`py-2.5 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    sexo === 'hembra'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span>Hembra</span>
                  {sexo === 'hembra' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: IDENTIFICACIÓN */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                Identificación de {nombre || 'la mascota'}
              </h1>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Datos descriptivos y número de microchip para agilizar la atención en clínicas.
              </p>
            </div>

            {/* Vista previa de Avatar */}
            <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
              <PetAvatar
                src={activeMascota?.fotoUrl}
                name={nombre || 'Mascota'}
                species={especie}
                size="lg"
                shape="rounded"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {nombre || 'Sin nombre'}
                </p>
                <p className="text-[11px] text-stone-500 capitalize">
                  {especie === 'perro' ? 'Canino' : 'Felino'} · {sexo}
                </p>
              </div>
            </div>

            {/* Apodo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Apodo o nombre cotidiano (opcional)
              </label>
              <input
                type="text"
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                placeholder='Ej: "Milito", "Gordo"'
                className="w-full px-4 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
            </div>

            {/* Raza y Peso */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  Raza
                </label>
                <input
                  type="text"
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                  placeholder="Ej: Mestizo, Golden"
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  Peso aproximado (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)}
                  placeholder="Ej: 14.5"
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                />
              </div>
            </div>

            {/* Microchip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800">
                  Microchip oficial (15 dígitos)
                </label>
                <button
                  type="button"
                  onClick={() => setChipEnTramite(!chipEnTramite)}
                  className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {chipEnTramite ? 'Ingresar número' : 'Marcar en trámite'}
                </button>
              </div>

              {chipEnTramite ? (
                <div className="p-3 bg-stone-100/90 rounded-xl text-xs text-stone-600 border border-stone-200/80">
                  Se registrará como <em>"En trámite"</em> en el carnet digital.
                </div>
              ) : (
                <input
                  type="text"
                  value={microchip}
                  onChange={(e) => setMicrochip(e.target.value)}
                  placeholder="Ej: 941000028471920"
                  className="w-full px-4 py-2.5 text-xs font-mono border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
                />
              )}
            </div>
          </div>
        )}

        {/* PASO 3: FICHA MÉDICA DE URGENCIA */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                Ficha médica y urgencias
              </h1>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Información para coordinar con el equipo veterinario ante cualquier asistencia.
              </p>
            </div>

            {/* Veterinario habitual */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Veterinario o clínica habitual
              </label>
              <input
                type="text"
                value={veterinario}
                onChange={(e) => setVeterinario(e.target.value)}
                placeholder="Nombre del médico o clínica de confianza"
                className="w-full px-4 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
            </div>

            {/* Teléfono de contacto */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Teléfono de contacto para emergencias
              </label>
              <input
                type="tel"
                value={telefonoEmergencia}
                onChange={(e) => setTelefonoEmergencia(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-2.5 text-xs font-mono border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white"
              />
            </div>

            {/* Alergias o condiciones */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Alergias o tratamientos continuos (opcional)
              </label>
              <textarea
                rows={3}
                value={notasAlergias}
                onChange={(e) => setNotasAlergias(e.target.value)}
                placeholder="Alergias a medicamentos, patologías crónicas o medicación actual."
                className="w-full px-4 py-2.5 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-white resize-none"
              />
            </div>
          </div>
        )}
      </main>

      {/* Barra de acciones inferior */}
      <footer className="sticky bottom-0 bg-[#fbf9f5]/95 backdrop-blur-md border-t border-stone-200/80 py-3.5 px-4 mt-6">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Omitir por ahora
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-2.5 px-5 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {step < 3 ? (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Finalizar registro</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
