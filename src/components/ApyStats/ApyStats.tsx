import { memo, useMemo } from 'react';
import { LabeledStat } from '../LabeledStat';
import { useTranslation } from 'react-i18next';
import { formatTotalApy } from '../../helpers/format';
import { selectApyVaultUIData } from '../../features/data/selectors/apy';
import type { VaultEntity } from '../../features/data/entities/vault';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import { ApyTooltipContent } from '../VaultStats/VaultApyStat';
import { selectVaultHasActiveMerklBaseCampaigns } from '../../features/data/selectors/rewards';

type ApyStatsProps = { vaultId: VaultEntity['id']; type: 'yearly' | 'daily' };

export const ApyStats = memo<ApyStatsProps>(function ApyStats({ vaultId, type }) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, vaultId));
  const hasBaseActiveMerklCampaings = useAppSelector(state =>
    selectVaultHasActiveMerklBaseCampaigns(state, vaultId)
  );
  const label = useMemo(
    () =>
      t(
        type === 'daily'
          ? 'VaultStat-DAILY'
          : data.type === 'apr'
          ? 'VaultStat-APR'
          : 'VaultStat-APY'
      ),
    [t, type, data.type]
  );
  const formatted = useMemo(
    () => (data.status === 'available' ? formatTotalApy(data.values, '???') : undefined),
    [data]
  );
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

  if (data.status == 'loading') {
    return <ValueBlock label={label} value="-" loading={true} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <ValueBlock label={label} value={data.status === 'hidden' ? '-' : '???'} loading={false} />
    );
  }

  const isBoosted = !!data.boosted;

  return (
    <ValueBlock
      label={label}
      textContent={false}
      value={
        <LabeledStat
          boosted={
            data.boosted === 'prestake'
              ? t('PRE-STAKE')
              : data.boosted === 'active'
              ? formatted[boostedTotalKey]
              : hasBaseActiveMerklCampaings
              ? formatted[`${type === 'daily' ? 'totalDaily' : 'totalApy'}`]
              : undefined
          }
          value={
            formatted[
              hasBaseActiveMerklCampaings ? `${type === 'daily' ? 'clmDaily' : 'clmApr'}` : totalKey
            ]
          }
        />
      }
      tooltip={
        <ApyTooltipContent vaultId={vaultId} type={type} isBoosted={isBoosted} rates={formatted} />
      }
      loading={false}
    />
  );
});
