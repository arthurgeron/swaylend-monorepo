import {
  ErrorToast,
  PendingToast,
  TransactionSuccessToast,
} from '@/components/Toasts';
import { useMarketContract } from '@/contracts/useMarketContract';
import {
  selectChangeInputDialogOpen,
  selectChangeSuccessDialogOpen,
  selectChangeSuccessDialogTransactionId,
  selectChangeTokenAmount,
  selectMarket,
  useMarketStore,
} from '@/stores';
import { useAccount, useWallet } from '@fuels/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { toast } from 'react-toastify';
import { useCollateralConfigurations } from './useCollateralConfigurations';

type useSupplyCollateralProps = {
  actionTokenAssetId: string | null | undefined;
};

export const useSupplyCollateral = ({
  actionTokenAssetId,
}: useSupplyCollateralProps) => {
  const { wallet } = useWallet();
  const { account } = useAccount();
  const market = useMarketStore(selectMarket);
  const changeTokenAmount = useMarketStore(selectChangeTokenAmount);
  const changeInputDialogOpen = useMarketStore(selectChangeInputDialogOpen);
  const changeSuccessDialogOpen = useMarketStore(selectChangeSuccessDialogOpen);
  const changeSuccessDialogTransactionId = useMarketStore(
    selectChangeSuccessDialogTransactionId
  );
  const { data: collateralConfigurations } = useCollateralConfigurations();

  const queryClient = useQueryClient();
  const marketContract = useMarketContract(market);

  return useMutation({
    mutationKey: [
      'supplyCollateral',
      actionTokenAssetId,
      account,
      collateralConfigurations,
      marketContract?.account?.address,
      marketContract?.id,
    ],
    mutationFn: async (tokenAmount: BigNumber) => {
      if (
        !wallet ||
        !account ||
        !actionTokenAssetId ||
        !collateralConfigurations ||
        !marketContract
      ) {
        return null;
      }

      const amount = new BigNumber(tokenAmount).times(
        10 ** collateralConfigurations[actionTokenAssetId].decimals
      );

      const { waitForResult } = await marketContract.functions
        .supply_collateral()
        .callParams({
          forward: {
            assetId: actionTokenAssetId,
            amount: amount.toFixed(0),
          },
        })
        .call();

      const transactionResult = await toast.promise(waitForResult(), {
        pending: {
          render: PendingToast(),
        },
      });

      return transactionResult.transactionId;
    },
    onSuccess: (data) => {
      if (data) {
        TransactionSuccessToast({ transactionId: data });
        changeSuccessDialogTransactionId(data);
        changeInputDialogOpen(false);
        changeTokenAmount(BigNumber(0));
        changeSuccessDialogOpen(true);
      }
    },
    onError: (error) => {
      ErrorToast({ error: error.message });
    },
    onSettled: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        exact: false,
        queryKey: [
          'collateralAssets',
          account,
          marketContract?.account?.address,
          marketContract?.id,
        ],
      });

      // Invalidate Fuel balance query
      queryClient.invalidateQueries({
        exact: true,
        queryKey: ['balance', account, actionTokenAssetId],
      });
    },
  });
};
