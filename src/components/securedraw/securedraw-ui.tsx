'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSecuredrawProgram, useSecuredrawProgramAccount, getRandom} from './securedraw-data-access'

export async function SecuredrawCreate() {
  const { initialize } = useSecuredrawProgram()
  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => initialize.mutateAsync(Keypair.generate())}
      disabled={initialize.isPending}
    >
      Create a new area {initialize.isPending && '...'}
    </button>
  )
}

export function SecuredrawList() {
  const { accounts, getProgramAccount } = useSecuredrawProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-4 gap-4">
          {accounts.data?.map((account) => (
            <SecuredrawCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function SecuredrawCard({ account }: { account: PublicKey }) {
  const { accountQuery, incrementMutation, setMutation, decrementMutation, closeMutation } = useSecuredrawProgramAccount({
    account,
  })

  const count = useMemo(() => {
    return accountQuery.data?.nuser?.map((key) => key.toString()) ?? [];
  }, [accountQuery.data?.nuser]);
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("$6800 Area")
  const [inputValue, setInputValue] = useState('')
  const [showPane, setShowPane] = useState(false);

  const handleSetParticipants = () => {
    const keys = inputValue
      .split('\n') // Split the input by newlines
      .map(key => key.trim()) // Trim each key
      .filter(key => key.length > 0); // Remove empty lines

    if (keys.length === 0) {
      alert('At least one Public Key is required!');
      return;
    }

    try {
      const publicKeys = keys.map(key => new PublicKey(key)); // Validate each key
      return setMutation.mutateAsync(publicKeys); // Assuming `setMutation` can handle an array
    } catch (error) {
      alert('One or more Public Keys are invalid. Please check the format and try again.');
    }
  };

  const handleClose = () => {
    setShowPane(false); // Close the pane
  };

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <button
                className="absolute top-2 right-2 btn btn-xs btn-secondary btn-outline"
                onClick={() => {
                  if (!window.confirm('Are you sure you want to close this account?')) {
                    return
                  }
                  return closeMutation.mutateAsync()
                }}
                disabled={closeMutation.isPending}
              >
                ✕
          </button>
          { isEditing ? (
            <input
              type="text"
              className="input input-bordered"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditing(!isEditing)}
            />
          ) : (
            <h3 className="card-title justify-center text-3xl cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
              {title}
            </h3>
          )
          }
          {/* <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {count}
          </h2> */}
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter the public key here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></textarea>
          <div className="card-actions justify-around">
            <button
              className="btn btn-outline mt-1 px-2 py-1 text-sm"
              onClick={() => {
                const value = window.prompt('Number of winners:', '0' ?? '1')
                console.log(value)
                if (!value || isNaN(parseInt(value))) {
                  return
                }
                // try{
                // getRandom()
                // }
                // catch(e){
                //   console.log(e)
                // }
                incrementMutation.mutateAsync(parseInt(value))
                console.log(value)
              }}
              disabled={incrementMutation.isPending}
            >
              Random draw!
            </button>
            <button
              className="btn btn-outline mt-1 px-2 py-1 text-sm"
              onClick={handleSetParticipants}
              disabled={setMutation.isPending} // Assuming `setMutation` is defined
            >
              Set participants
            </button>
            {/* <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => decrementMutation.mutateAsync()}
              disabled={decrementMutation.isPending}
            >
              Decrement
            </button> */}
          </div>
          <div className="text-center space-y-4">
            {/* <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p> */}
            <button
              className="btn btn-xs btn-outline btn-secondary"
              onClick={() => setShowPane(true)}
              disabled={decrementMutation.isPending}
            >
              Results
            </button>
            {showPane && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white w-1/2 h-1/2 p-5 rounded shadow-lg flex flex-col justify-between items-center">
                  <p>Results:</p>
                  <p>{count.map((key, index) => (
        <li key={index}>{key}</li>
      ))}</p>
                  <button
                    className="btn btn-sm btn-primary mt-3"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
