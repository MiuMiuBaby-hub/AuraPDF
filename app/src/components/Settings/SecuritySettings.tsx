import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Printer, Copy, Edit3, MessageSquare, RotateCcw } from 'lucide-react';
import { DEFAULT_SECURITY_SETTINGS } from '../../utils/settingsStorage';
import type { SecuritySettings as SecuritySettingsType, PrintingPermission } from '../../types';

interface SecuritySettingsProps {
    security: SecuritySettingsType;
    onSecurityChange: (security: SecuritySettingsType) => void;
}

const isDefault = (security: SecuritySettingsType) =>
    security.enabled === DEFAULT_SECURITY_SETTINGS.enabled &&
    security.userPassword === DEFAULT_SECURITY_SETTINGS.userPassword &&
    security.ownerPassword === DEFAULT_SECURITY_SETTINGS.ownerPassword &&
    security.permissions.printing === DEFAULT_SECURITY_SETTINGS.permissions.printing &&
    security.permissions.copying === DEFAULT_SECURITY_SETTINGS.permissions.copying &&
    security.permissions.modifying === DEFAULT_SECURITY_SETTINGS.permissions.modifying &&
    security.permissions.annotating === DEFAULT_SECURITY_SETTINGS.permissions.annotating;

export function SecuritySettings({ security, onSecurityChange }: SecuritySettingsProps) {
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showOwnerPassword, setShowOwnerPassword] = useState(false);

    const updateSecurity = (updates: Partial<SecuritySettingsType>) => {
        onSecurityChange({ ...security, ...updates });
    };

    const updatePermissions = (updates: Partial<SecuritySettingsType['permissions']>) => {
        onSecurityChange({
            ...security,
            permissions: { ...security.permissions, ...updates }
        });
    };

    const handleReset = () => {
        onSecurityChange({ ...DEFAULT_SECURITY_SETTINGS });
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">PDF 安全性</h3>
                </div>
                <div className="flex items-center gap-3">
                    {!isDefault(security) && (
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            title="重置為預設值"
                        >
                            <RotateCcw className="w-3 h-3" />
                            重置
                        </button>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-gray-400">啟用加密</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={security.enabled}
                                onChange={(e) => updateSecurity({ enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </div>
                    </label>
                </div>
            </div>

            {security.enabled && (
                <div className="space-y-4">
                    {/* Password Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Lock className="w-4 h-4" />
                            <span>密碼設定</span>
                        </div>

                        {/* User Password (Open Password) */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                                開啟密碼 (Open Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showUserPassword ? 'text' : 'password'}
                                    value={security.userPassword}
                                    onChange={(e) => updateSecurity({ userPassword: e.target.value })}
                                    placeholder="留空則不需要密碼開啟"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUserPassword(!showUserPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                設定後需要此密碼才能開啟 PDF
                            </p>
                        </div>

                        {/* Owner Password (Permission Password) */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">
                                權限密碼 (Owner Password)
                            </label>
                            <div className="relative">
                                <input
                                    type={showOwnerPassword ? 'text' : 'password'}
                                    value={security.ownerPassword}
                                    onChange={(e) => updateSecurity({ ownerPassword: e.target.value })}
                                    placeholder="留空則自動使用開啟密碼"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                用於解除下方權限限制
                            </p>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Shield className="w-4 h-4" />
                            <span>使用權限</span>
                        </div>

                        {/* Printing Permission */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Printer className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">允許列印</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {security.permissions.printing !== false && (
                                    <select
                                        value={security.permissions.printing as string}
                                        onChange={(e) => updatePermissions({ printing: e.target.value as PrintingPermission })}
                                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="highResolution">高解析度</option>
                                        <option value="lowResolution">低解析度</option>
                                    </select>
                                )}
                                <label className="relative cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={security.permissions.printing !== false}
                                        onChange={(e) => updatePermissions({
                                            printing: e.target.checked ? 'highResolution' : false
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                                </label>
                            </div>
                        </div>

                        {/* Copying Permission */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Copy className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">允許複製</span>
                            </div>
                            <label className="relative cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={security.permissions.copying}
                                    onChange={(e) => updatePermissions({ copying: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </label>
                        </div>

                        {/* Modifying Permission */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">允許修改</span>
                            </div>
                            <label className="relative cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={security.permissions.modifying}
                                    onChange={(e) => updatePermissions({ modifying: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </label>
                        </div>

                        {/* Annotating Permission */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">允許註解</span>
                            </div>
                            <label className="relative cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={security.permissions.annotating}
                                    onChange={(e) => updatePermissions({ annotating: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                            </label>
                        </div>
                    </div>

                    {/* Warning if no password set */}
                    {!security.userPassword && !security.ownerPassword && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
                            <p>提示：未設定任何密碼，權限限制仍會套用，但可能被某些 PDF 閱讀器繞過。建議至少設定權限密碼。</p>
                        </div>
                    )}
                </div>
            )}

            {!security.enabled && (
                <p className="text-sm text-gray-500">
                    啟用後可設定密碼保護和使用權限限制
                </p>
            )}
        </div>
    );
}
