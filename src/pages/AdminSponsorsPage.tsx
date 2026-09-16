import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '../features/tenant/useTenant';
import {
  listarSponsorsAdmin,
  isAuthenticatedAdmin,
  getAdminUser,
  logoutAdmin,
} from '../api/admin';
import type { AdminUser } from '../api/admin';
import type { TenantPublicInfo } from '../api/tenant';
import SponsorsListPage from './admin/SponsorsListPage';
import SponsorConfigPage from './admin/SponsorConfigPage';
import SponsorCreatePage from './admin/SponsorCreatePage';
import AdminLoginForm from '../features/admin/AdminLoginForm';
import { MawdyBrandLogo } from '../components/ui/MawdyBrandLogo';
import { ChevronDown, User, LogOut, ChevronRight, Home } from 'lucide-react';

/**
 * Consola de Administración B2B2C de Mawdy Pet.
 * Alineada con la interfaz y arquitectura de diseño del CRM Minerva de Mawdy.
 * Diseño 100% responsivo a pantalla completa sin modales intrusivos.
 */
export default function AdminSponsorsPage() {
  const { tenant: activeSessionTenant, setTenantLocally } = useTenant();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getAdminUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAuthenticatedAdmin());

  const [sponsors, setSponsors] = useState<TenantPublicInfo[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Modo de navegación: 'list' (Directorio), 'create' (Alta a pantalla completa), 'edit' (Configuración completa)
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);

  const cargarSponsors = useCallback(async () => {
    if (!isAuthenticatedAdmin()) return;
    try {
      setLoadingList(true);
      const list = await listarSponsorsAdmin();
      setSponsors(list);
      setErrorList(null);
    } catch (err: any) {
      setErrorList(err.message || 'Error al cargar el catálogo de sponsors.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      cargarSponsors();
    }
  }, [isAuthenticated, cargarSponsors]);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setIsAuthenticated(false);
    setViewMode('list');
    setSelectedSponsorId(null);
  };

  const handleSelectSponsorToEdit = (id: string) => {
    setSelectedSponsorId(id);
    setViewMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCreate = () => {
    setSelectedSponsorId(null);
    setViewMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSponsorId(null);
  };

  const handleCreateSuccess = (newSponsor: TenantPublicInfo) => {
    setSponsors((prev) => [...prev, newSponsor]);
    setSelectedSponsorId(newSponsor.sponsorId);
    setViewMode('edit');
  };

  const handleSaveSuccess = (updated: TenantPublicInfo) => {
    setSponsors((prev) =>
      prev.map((s) => (s.sponsorId === updated.sponsorId ? updated : s))
    );

    if (activeSessionTenant && activeSessionTenant.sponsorId === updated.sponsorId) {
      setTenantLocally(updated);
    }
  };

  const handleDeleteSuccess = (deletedSponsorId: string) => {
    setSponsors((prev) => prev.filter((s) => s.sponsorId !== deletedSponsorId));
    if (selectedSponsorId === deletedSponsorId) {
      setViewMode('list');
      setSelectedSponsorId(null);
    }
  };

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedSponsor = sponsors.find((s) => s.sponsorId === selectedSponsorId);

  return (
    <div className="min-h-screen bg-[#f5f6f7] text-[#2d373d] font-sans flex flex-col w-full">
      {/* 1. Header Corporativo Superior Mawdy (Estilo CRM Minerva) */}
      <header className="bg-white border-b border-[#e8ebed] px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-[0px_1px_0px_#e8ebed] w-full">
        {/* Identidad de Marca Oficial */}
        <div className="flex items-center gap-3">
          <MawdyBrandLogo variant="minerva" className="h-6" />
          <div className="hidden md:block h-4 w-px bg-[#e8ebed]" />
          <span className="hidden md:inline-block text-[11px] font-semibold text-[#89969a] uppercase tracking-wider">
            Gestión de Colectivos B2B2C
          </span>
        </div>

        {/* Controles de Contexto Corporativo (País, Lenguaje, Perfil, Salir) */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* Selector de País */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f6f7] border border-[#e8ebed] rounded-[4px] text-[#2d373d] font-medium text-[11px]">
            <span role="img" aria-label="Chile">🇨🇱</span>
            <span className="font-semibold">CHILE</span>
            <ChevronDown className="w-3 h-3 text-[#89969a]" />
          </div>

          {/* Lenguaje */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#526570]">
            <span>Lenguaje (es)</span>
            <ChevronDown className="w-3 h-3 text-[#89969a]" />
          </div>

          <div className="h-4 w-px bg-[#e8ebed] hidden sm:block" />

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#f5f6f7] border border-[#e8ebed] flex items-center justify-center text-[#526570]">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <span className="block text-xs font-bold text-[#2d373d]">
                {adminUser?.username || 'RNFELIP'}
              </span>
              <span className="block text-[10px] text-[#89969a] font-mono">
                {adminUser?.role || 'operaciones-mawdy'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#d81e05] hover:text-[#ac0404] hover:underline transition-colors pl-2 cursor-pointer"
            title="Cerrar sesión administrativa"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* 2. Barra de Migas de Pan (Breadcrumb Corporativo) */}
      <div className="bg-white border-b border-[#e8ebed] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#526570] w-full">
        <div className="flex items-center gap-1.5 font-medium overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={handleBackToList}
            className="hover:text-[#d81e05] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-[#89969a] shrink-0" />
          <button
            type="button"
            onClick={handleBackToList}
            className={`hover:text-[#d81e05] cursor-pointer transition-colors shrink-0 ${
              viewMode === 'list' ? 'text-[#2d373d] font-bold' : ''
            }`}
          >
            Sponsors y Convenios
          </button>

          {viewMode === 'create' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#89969a] shrink-0" />
              <span className="text-[#2d373d] font-bold shrink-0">
                Aprovisionar Nuevo Sponsor
              </span>
            </>
          )}

          {viewMode === 'edit' && selectedSponsor && (
            <>
              <ChevronRight className="w-3 h-3 text-[#89969a] shrink-0" />
              <span className="text-[#2d373d] font-bold truncate max-w-[240px]">
                {selectedSponsor.nombreVisible}
              </span>
            </>
          )}
        </div>

        <div className="text-[11px] text-[#89969a] hidden md:block">
          Módulo de Configuración & Coberturas AMA
        </div>
      </div>

      {/* 3. Contenido Principal a Pantalla Completa Responsiva (Sin modales ni restricciones estrechas) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4">
        {viewMode === 'create' ? (
          <SponsorCreatePage
            onBack={handleBackToList}
            onSuccess={handleCreateSuccess}
            existingSponsors={sponsors}
          />
        ) : viewMode === 'edit' && selectedSponsor ? (
          <SponsorConfigPage
            sponsor={selectedSponsor}
            onBack={handleBackToList}
            onSaveSuccess={handleSaveSuccess}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ) : (
          <SponsorsListPage
            sponsors={sponsors}
            loading={loadingList}
            error={errorList}
            onSelectSponsorToEdit={handleSelectSponsorToEdit}
            onSelectCreate={handleGoToCreate}
            onRefreshList={cargarSponsors}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </main>

      {/* Footer Institucional Mawdy */}
      <footer className="mt-auto border-t border-[#e8ebed] bg-white py-3 px-6 text-center text-xs text-[#89969a]">
        Plataforma Corporativa de Seguros y Asistencias Mawdy • Sistema de Colectivos B2B2C
      </footer>
    </div>
  );
}
