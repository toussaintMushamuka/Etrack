"use client";
import {
  addTrasactionToBudget,
  deleteBudget,
  deleteTransaction,
  getTransactionByBudgetId,
} from "@/app/actions";
import BudgetItm from "@/app/components/BudgetItm";
import Wrapper from "@/app/components/Wrapper";
import { Budget } from "@/type";
import React, { useEffect, useState } from "react";
import Notification from "@/app/components/Notification";
import { Send, Trash } from "lucide-react";
import { redirect } from "next/navigation";

const page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  const [budgetId, setBudgetId] = useState<string>("");
  const [budget, setBudget] = useState<Budget>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => {
    setNotification("");
  };

  async function fetchBudgetData(budgetId: string) {
    try {
      if (budgetId) {
        const budgetData = await getTransactionByBudgetId(budgetId);
        setBudget(budgetData);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de budget et des transactions:",
        error
      );
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetId(resolvedParams.budgetId);
      fetchBudgetData(resolvedParams.budgetId);
    };
    getId();
  }, [params]);
  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Montant doit être un nombre positif.");
      }
      const newTransaction = await addTrasactionToBudget(
        budgetId,
        amountNumber,
        description
      );
      setNotification("Transaction ajoutée avec succès !");
      fetchBudgetData(budgetId);
      setDescription("");
      setAmount("");
    } catch (error) {
      setNotification(`Vous avez dépassé votre budget : ${error}`);
    }
  };
  const handelDeleteBudget = async () => {
    const confirmed = window.confirm(
      "Etes-vous sur de vouloire supprimer ce budget et toutes ses transactions?"
    );
    if (confirmed) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        console.error("erreur lors de la suppression du budget", error);
      }
      redirect("/budgets");
    }
  };
  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "vous etes sur de vouloire supprimé cette transaction?"
    );
    if (confirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchBudgetData(budgetId);
        setNotification("depense supprimée");
      } catch (error) {
        console.error("erreur lors de la suppression de la transaction", error);
      }
    }
  };
  return (
    <Wrapper>
      {notification && (
        <Notification
          message={notification}
          onclose={closeNotification}
        ></Notification>
      )}
      {budget && (
        <div className="flex md:flex-row gap-4 flex-col">
          <div className="md:w-1/3">
            <BudgetItm budget={budget} enableHover={0} />
            <button className="btn mt-4" onClick={() => handelDeleteBudget()}>
              Supprimer le budget
            </button>
            <div className="space-y-4 flex flex-col mt-4">
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="input w-full input-bordered "
              />
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant"
                required
                className="input w-full input-bordered"
              />
              <button className="btn" onClick={handleAddTransaction}>
                Ajouter une transaction
              </button>
            </div>
          </div>
          {budget?.transactions && budget.transactions.length > 0 ? (
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 ">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Montant</th>
                    <th>Déscription</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.transactions?.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="text-lg md:text-3xl">
                        {transaction.emoji}
                      </td>
                      <td>
                        <div className="badge badge-accent badge-xs md:badge-sm">
                          {transaction.amount} $
                        </div>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        {transaction.createdAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        {transaction.createdAt.toLocaleTimeString("fr-Fr", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm  "
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="md:w-2/3 mt-10 md:ml-4 flex items-center justify-center">
              <Send strokeWidth={1.5} className="w-8 h-8 text-accent" />
              <span className="text-gray-500 ml-2">Aucune transaction.</span>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default page;
