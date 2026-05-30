import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { TokenContext } from '../../constant/constant';
import { chevronDownIcon } from '../../constant/icon';
import { SUPPORTED_TOKENS } from '../../constant/supportedTokens';
import { convertBigToSmallDigitWithSpecificDecimal } from '../../utils/commonFunction';
import Loader from '../loader/Loader';

function formatDropdownBalance(formatted, isPending) {
  if (isPending) return null;
  if (formatted === undefined || formatted === null) return '0.00';
  const n = parseFloat(formatted);
  if (Number.isNaN(n)) return formatted;
  return n.toFixed(2);
}

function TokenLogo({ alt, className, fallbackBg, fallbackChar, name, src }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    const bg = fallbackBg ?? '#F97316';
    const letter =
      fallbackChar != null && fallbackChar !== ''
        ? fallbackChar
        : (name && name[0] && name[0].toUpperCase()) || '?';
    return (
      <div
        style={{ backgroundColor: bg }}
        className={`flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${className}`}
        aria-hidden
      >
        {letter}
      </div>
    );
  }
  return (
    <img
      alt={alt || ''}
      className={`shrink-0 rounded-full object-cover ${className}`}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}

/** One `useBalance` call per token (hooks rules). */
function TokenBalanceProbe({ chainId, onData, tokenMeta, walletAddress }) {
  const { data, isPending } = useBalance({
    address: walletAddress,
    chainId,
    token: tokenMeta.address,
    query: { enabled: Boolean(walletAddress && tokenMeta.address) },
  });

  useEffect(() => {
    onData(tokenMeta.address, { data, isPending });
  }, [tokenMeta.address, data, isPending, onData]);

  return null;
}

const Token = ({ handleSelectToken, token }) => {
  const { setTokenList } = useContext(TokenContext);
  const [isOpenFromDropdown, setIsOpenFromDropdown] = useState(false);
  const [probeByAddress, setProbeByAddress] = useState({});

  const { address: walletAddress, chainId } = useAccount();

  const onProbeData = useCallback((addr, payload) => {
    setProbeByAddress((prev) => ({ ...prev, [addr]: payload }));
  }, []);

  const enrichedList = useMemo(() => {
    return SUPPORTED_TOKENS.map((t) => {
      const probe = probeByAddress[t.address];
      const formatted = probe?.data?.formatted;
      const isPending = probe?.isPending;
      const value = probe?.data?.value ?? 0n;
      return {
        ...t,
        logoURI: t.logo,
        logoFallbackBg: t.logoFallbackBg,
        logoFallbackChar: t.logoFallbackChar,
        balance: value,
        formattedBalance: formatted,
        balancePending: isPending,
        decimals: t.decimals,
      };
    });
  }, [probeByAddress]);

  useEffect(() => {
    setTokenList(enrichedList);
  }, [enrichedList, setTokenList]);

  const selectedForUi = useMemo(() => {
    if (!token?.address) return null;
    const found = enrichedList.find(
      (t) => t.address.toLowerCase() === token.address.toLowerCase()
    );
    return found || null;
  }, [enrichedList, token]);

  const showToken = selectedForUi || token;

  const toggleFirstDropdown = () => {
    setIsOpenFromDropdown(!isOpenFromDropdown);
  };

  const handleTokenSelect = (item) => {
    handleSelectToken(item);
    setIsOpenFromDropdown(false);
  };

  const displayBalanceStr = (item) => {
    const s = formatDropdownBalance(item.formattedBalance, item.balancePending);
    if (item.balancePending && s === null) return <Loader size="15px" stroke="#F97316" />;
    return s ?? '0.00';
  };

  const selectedBalanceDisplay = () => {
    if (!showToken?.address) return null;
    if (showToken.balancePending) {
      return <Loader size="15px" stroke="#F97316" />;
    }
    if (showToken.formattedBalance != null && showToken.formattedBalance !== '') {
      return formatDropdownBalance(showToken.formattedBalance, false);
    }
    if (showToken.balance != null && showToken.decimals != null) {
      return convertBigToSmallDigitWithSpecificDecimal(showToken.balance, showToken.decimals);
    }
    return '0.00';
  };

  return (
    <div className="relative">
      {SUPPORTED_TOKENS.map((t) => (
        <TokenBalanceProbe
          key={t.address}
          chainId={chainId}
          onData={onProbeData}
          tokenMeta={t}
          walletAddress={walletAddress}
        />
      ))}
      <button
        type="button"
        onClick={toggleFirstDropdown}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#EEEBE5] bg-white p-2.5 text-left text-[#111111] transition-colors hover:border-[#FED7AA] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
      >
        {showToken?.name ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TokenLogo
                className="h-6 w-6"
                fallbackBg={showToken.logoFallbackBg}
                fallbackChar={showToken.logoFallbackChar}
                name={showToken.name}
                src={showToken.logoURI || showToken.logo}
              />
              <span className="truncate font-medium">{showToken.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="tabular-nums text-sm font-semibold text-[#111111]">
                {selectedBalanceDisplay()}
              </span>
              <i className={chevronDownIcon} />
            </div>
          </div>
        ) : (
          <div className="flex w-full justify-between">
            <span className="text-[#6B6B6B]">Select Token</span>
            <i className={chevronDownIcon} />
          </div>
        )}
      </button>
      {isOpenFromDropdown && (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-[#EEEBE5] bg-white py-2 shadow-xl">
          {enrichedList.map((item) => (
            <li key={item.address}>
              <button
                type="button"
                onClick={() => handleTokenSelect(item)}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#FFF7ED]"
              >
                <TokenLogo
                  className="h-6 w-6"
                  fallbackBg={item.logoFallbackBg}
                  fallbackChar={item.logoFallbackChar}
                  name={item.name}
                  src={item.logoURI || item.logo}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#111111]">{item.name}</div>
                  <div className="truncate text-xs text-[#6B6B6B]">{item.symbol}</div>
                </div>
                <span className="shrink-0 tabular-nums text-sm font-semibold text-[#111111]">
                  {displayBalanceStr(item)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Token;
