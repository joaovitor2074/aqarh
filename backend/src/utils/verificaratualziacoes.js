import { useState } from "react"
export default async function  handleScrape () {

    try {


      const response = await fetch("/admin/scrape/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include" // se usa auth por cookie
      })

      const data = await response.json()

      console.log(data)
      // ex: { membros_verificados: 12, alteracoes_encontradas: 3 }

    } catch (error) {
      console.error("Erro ao verificar atualizações", error)
    } finally {
      
    }
  }