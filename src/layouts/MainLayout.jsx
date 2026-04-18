import React from 'react'

const MainLayout = () => {
  return (
    <div className="sidebar">
    <div className='sidebar-header'>
        <h1>StockFlow</h1>
    </div>
    <nav className="sidebar-menu">
        <a href="#">Dashboard</a>
        <a href="#">Cadastro</a>
        <a href="#">Entrada</a>
        <a href="#">Saida</a>
        <a href="#">Ordem de Serviço</a>
        <a href="#">Estoque</a>
        <a href="#">Relatórios</a>
    </nav>
    </div>
  )
}

export default MainLayout