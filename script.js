(() => {
  "use strict";

  const DEMO_EMAIL = "demo@reaproveita.app";
  const DEMO_PASSWORD = "Reaproveita2026";
  const DELIVERY_FEE = 5.90;
  const STORAGE = {
    users: "reaproveita_users_v1",
    products: "reaproveita_products_v1",
    cart: "reaproveita_cart_v1",
    orders: "reaproveita_orders_v1",
    session: "reaproveita_session_v1"
  };

  const seedProducts = [
    {id:"p1",name:"Banana-prata",unit:"1 kg",description:"Bananas selecionadas para consumo próximo, ideais para lanches e vitaminas.",category:"Frutas",store:"Hortifruti Boa Colheita",original:6.99,price:3.99,condition:"Consumo preferencial imediato. Confira a condição do lote.",stock:12,image:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80"},
    {id:"p2",name:"Pão francês",unit:"Pacote com 5",description:"Pães fresquinhos produzidos hoje, perfeitos para o café da manhã.",category:"Padaria",store:"Padaria Pão da Praça",original:7,price:4.5,condition:"Produção do dia. Consumir conforme orientação do estabelecimento.",stock:8,image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"},
    {id:"p3",name:"Tomate",unit:"1 kg",description:"Tomates selecionados para molhos, saladas e preparos do dia a dia.",category:"Verduras",store:"Mercado Central",original:8.99,price:4.99,condition:"Lote selecionado. Verifique a condição antes do consumo.",stock:9,image:"https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=80"},
    {id:"p4",name:"Iogurte natural",unit:"170 g",description:"Iogurte natural para um café da manhã ou lanche prático.",category:"Refrigerados",store:"Mercado Central",original:3.99,price:2.49,condition:"Verifique a validade e mantenha refrigerado conforme o rótulo.",stock:14,image:"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80"},
    {id:"p5",name:"Maçã gala",unit:"500 g",description:"Maçãs doces e crocantes, selecionadas para aproveitar nesta semana.",category:"Frutas",store:"Hortifruti Boa Colheita",original:7.5,price:4.25,condition:"Lote promocional. Selecionar e higienizar antes do consumo.",stock:10,image:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80"},
    {id:"p6",name:"Cenoura",unit:"1 kg",description:"Cenouras versáteis para saladas, sopas e receitas caseiras.",category:"Verduras",store:"Hortifruti Boa Colheita",original:5.99,price:3.49,condition:"Lote selecionado. Armazenar conforme orientação do estabelecimento.",stock:7,image:"https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=700&q=80"},
    {id:"p7",name:"Queijo minas",unit:"300 g",description:"Queijo minas para sanduíches, lanches e receitas rápidas.",category:"Refrigerados",store:"Mercado Central",original:13.9,price:9.9,condition:"Produto refrigerado. Confira a validade no rótulo.",stock:5,image:"https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=80"},
    {id:"p8",name:"Granola tradicional",unit:"250 g",description:"Mistura crocante para acompanhar frutas, iogurte e vitaminas.",category:"Mercearia",store:"Empório Raiz",original:12.5,price:7.5,condition:"Confira a data de validade e mantenha a embalagem fechada.",stock:6,image:"https://images.unsplash.com/photo-1517093157656-b9ecದು?auto=format&fit=crop&w=700&q=80"}
  ];
  // Corrige URL de imagem de fallback do último produto, mantendo o catálogo utilizável offline.
  seedProducts[7].image = "https://images.unsplash.com/photo-1517093157656-b9ec?auto=format&fit=crop&w=700&q=80";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"}).format(value);
  const discount = product => Math.round((product.original - product.price) / product.original * 100);
  const safeRead = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* armazenamento pode estar indisponível */ }
  };
  let users = safeRead(STORAGE.users, []);
  let products = safeRead(STORAGE.products, null);
  if (!Array.isArray(products) || products.length < 4 || products.some(p => !p || typeof p.price !== "number")) {
    products = seedProducts.map(p => ({...p}));
    safeWrite(STORAGE.products, products);
  }
  let cart = safeRead(STORAGE.cart, []);
  if (!Array.isArray(cart)) cart = [];
  let orders = safeRead(STORAGE.orders, []);
  if (!Array.isArray(orders)) orders = [];
  let session = safeRead(STORAGE.session, null);
  let activeOrderId = null;
  let lastFocusedElement = null;

  const demoUser = {id:"demo-user",name:"Pessoa Visitante",email:DEMO_EMAIL,password:DEMO_PASSWORD,address:{cep:"97500-000",street:"Rua dos Andradas, 1200",district:"Centro",city:"Uruguaiana",state:"RS",complement:""}};
  if (!users.some(u => u.email.toLowerCase() === DEMO_EMAIL)) users.push(demoUser);
  persistUsers();

  function persistUsers(){ safeWrite(STORAGE.users, users); }
  function persistCart(){ safeWrite(STORAGE.cart, cart); }
  function persistProducts(){ safeWrite(STORAGE.products, products); }
  function persistOrders(){ safeWrite(STORAGE.orders, orders); }
  function currentUser(){ return users.find(u => session && u.id === session.userId) || null; }
  function escapeHTML(value=""){ return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
  function safeImage(url){ return escapeHTML(url); }

  function navigateTo(screen) {
    if (["catalog","checkout"].includes(screen) && !currentUser()) screen = "login";
    if (screen === "checkout" && cart.length === 0) {
      showToast("Adicione pelo menos um produto antes de finalizar.", "error");
      screen = "catalog";
    }
    $$(".screen").forEach(el => el.classList.add("hidden"));
    const target = $(`#screen-${screen}`);
    if (target) target.classList.remove("hidden");
    updateHeader();
    window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    $("#app").focus({preventScroll:true});
    if (screen === "catalog") renderProducts();
    if (screen === "checkout") renderCheckout();
  }

  function updateHeader(){
    const user = currentUser();
    const header = $("#headerActions");
    if (user) {
      header.innerHTML = `<button class="cart-header-button" data-action="open-cart" aria-label="Abrir carrinho">Carrinho <span class="count-badge">${cart.reduce((sum,item)=>sum+item.qty,0)}</span></button><span class="header-user">${escapeHTML(user.name.split(" ")[0])}</span><button class="text-button" data-action="logout">Sair</button>`;
    } else {
      header.innerHTML = `<button class="text-button" data-action="login">Entrar</button><button class="button button-primary button-small" data-action="register">Criar conta</button>`;
    }
  }

  function showToast(message, type="success"){
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.textContent = message;
    $("#toastRegion").append(toast);
    window.setTimeout(() => toast.remove(), 3200);
  }

  function setFieldError(input, message){
    const field = input.closest(".field");
    const error = field && $(".field-error", field);
    if (error) error.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }
  function clearFormErrors(form){
    $$(".field input", form).forEach(input => setFieldError(input, ""));
    const message = $(".form-message", form);
    if (message) message.textContent = "";
  }
  function validateEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validateRegistration(form){
    clearFormErrors(form);
    const data = Object.fromEntries(new FormData(form).entries());
    let valid = true;
    const required = ["name","email","password","confirmPassword","cep","street","district","city","state"];
    required.forEach(name => {
      const input = form.elements[name];
      if (!String(data[name] || "").trim()) { setFieldError(input,"Este campo é obrigatório."); valid = false; }
    });
    if (data.email && !validateEmail(data.email)) { setFieldError(form.elements.email,"Informe um e-mail válido."); valid = false; }
    if (data.password && data.password.length < 8) { setFieldError(form.elements.password,"Use pelo menos 8 caracteres."); valid = false; }
    if (data.confirmPassword && data.password !== data.confirmPassword) { setFieldError(form.elements.confirmPassword,"As senhas não coincidem."); valid = false; }
    if (data.cep && !/^\d{5}-?\d{3}$/.test(data.cep)) { setFieldError(form.elements.cep,"Informe um CEP válido com 8 números."); valid = false; }
    if (data.state && data.state.trim().length !== 2) { setFieldError(form.elements.state,"Use a sigla de 2 letras do estado."); valid = false; }
    if (users.some(u => u.email.toLowerCase() === String(data.email).trim().toLowerCase())) {
      setFieldError(form.elements.email,"Este e-mail já está cadastrado."); valid = false;
    }
    return {valid,data};
  }

  $("#registerForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const {valid,data} = validateRegistration(form);
    if (!valid) { const first = $("[aria-invalid=true]",form); if(first) first.focus(); return; }
    const user = {
      id: `u-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      // Senha armazenada apenas para permitir o fluxo de demonstração local. Não usar em produção.
      password: data.password,
      address: {cep:data.cep.trim(),street:data.street.trim(),district:data.district.trim(),city:data.city.trim(),state:data.state.trim().toUpperCase(),complement:""}
    };
    users.push(user);
    persistUsers();
    form.reset();
    $("#loginForm").elements.email.value = user.email;
    $("#loginMessage").textContent = "Conta criada! Agora entre com seu e-mail e senha.";
    navigateTo("login");
    showToast("Conta criada com sucesso.");
  });

  $("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    clearFormErrors(form);
    const emailInput = form.elements.email, passwordInput = form.elements.password;
    let valid = true;
    if (!emailInput.value.trim()) {setFieldError(emailInput,"Informe seu e-mail.");valid=false;}
    else if (!validateEmail(emailInput.value.trim())) {setFieldError(emailInput,"Informe um e-mail válido.");valid=false;}
    if (!passwordInput.value) {setFieldError(passwordInput,"Informe sua senha.");valid=false;}
    if (!valid) return;
    const user = users.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase() && u.password === passwordInput.value);
    if (!user) { $("#loginMessage").textContent = "E-mail ou senha incorretos. Confira os dados e tente novamente."; passwordInput.focus(); return; }
    session = {userId:user.id};
    safeWrite(STORAGE.session,session);
    $("#userFirstName").textContent = user.name.split(" ")[0].toUpperCase();
    form.reset();
    updateHeader();
    navigateTo("catalog");
    showToast(`Bem-vindo(a), ${user.name.split(" ")[0]}!`);
  });

  function renderProducts(){
    const query = ($("#searchInput").value || "").trim().toLocaleLowerCase("pt-BR");
    const category = $("#categoryFilter").value;
    const sort = $("#sortFilter").value;
    let visible = products.filter(p => p.stock > 0 && (!category || category === "all" || p.category === category) &&
      (!query || `${p.name} ${p.store} ${p.category} ${p.description}`.toLocaleLowerCase("pt-BR").includes(query)));
    if (sort === "price") visible.sort((a,b)=>a.price-b.price);
    if (sort === "discount") visible.sort((a,b)=>discount(b)-discount(a));
    $("#heroOfferCount").textContent = products.filter(p=>p.stock>0).length;
    $("#resultsCount").textContent = `${visible.length} ${visible.length === 1 ? "oferta encontrada" : "ofertas encontradas"}`;
    $("#productGrid").innerHTML = visible.map(p => `
      <article class="product-card">
        <div class="product-photo">
          <img src="${safeImage(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" data-fallback="${escapeHTML(p.category)}">
          <span class="discount-badge">${discount(p)}% OFF</span>
          <span class="stock-badge">${p.stock <= 3 ? `Últimas ${p.stock} un.` : `${p.stock} disponíveis`}</span>
        </div>
        <div class="product-info">
          <span class="product-category">${escapeHTML(p.category)}</span>
          <h3>${escapeHTML(p.name)} <span class="product-unit">${escapeHTML(p.unit)}</span></h3>
          <span class="product-store">${escapeHTML(p.store)}</span>
          <p class="product-condition">${escapeHTML(shortCondition(p.condition))}</p>
          <div class="price-row"><strong class="price-now">${money(p.price)}</strong><span class="price-old">${money(p.original)}</span></div>
          <div class="product-actions"><button class="add-button" data-action="add-cart" data-id="${p.id}">+ Adicionar</button><button class="details-button" data-action="product-details" data-id="${p.id}" aria-label="Ver detalhes de ${escapeHTML(p.name)}">↗</button></div>
        </div>
      </article>`).join("");
    $("#productGrid").classList.toggle("hidden",visible.length===0);
    $("#emptyState").classList.toggle("hidden",visible.length!==0);
    $$("img[data-fallback]").forEach(img => img.addEventListener("error", () => {
      img.src = makeFallbackImage(img.dataset.fallback || "Alimento");
      img.removeAttribute("data-fallback");
    }, {once:true}));
    updateHeader();
  }
  function shortCondition(text){ return text.length > 75 ? `${text.slice(0,72).trim()}…` : text; }
  function makeFallbackImage(label){
    const colors = {"Frutas":"#e5efd9","Verduras":"#dcebd8","Padaria":"#f3e5d2","Refrigerados":"#e0edf1","Mercearia":"#eee7d9"};
    const color = colors[label] || "#e5efe7";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="${color}"/><circle cx="300" cy="170" r="82" fill="#176b45" opacity=".10"/><path d="M300 230V145M300 175C245 175 245 132 245 112c39 0 61 17 61 54M300 155c0-44 35-58 65-54 0 40-24 61-65 61" fill="#176b45" opacity=".8"/><text x="300" y="330" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#315d43">${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
  $("#searchInput").addEventListener("input",renderProducts);
  $("#categoryFilter").addEventListener("change",renderProducts);
  $("#sortFilter").addEventListener("change",renderProducts);
  $("#clearFilters").addEventListener("click",clearFilters);
  function clearFilters(){ $("#searchInput").value="";$("#categoryFilter").value="all";$("#sortFilter").value="featured";renderProducts(); }
  function productById(id){ return products.find(p=>p.id===id); }
  function cartQty(){ return cart.reduce((sum,item)=>sum+item.qty,0); }
  function calculateCartTotals(){
    const validItems = cart.map(item=>({item,product:productById(item.id)})).filter(x=>x.product);
    const subtotal = validItems.reduce((sum,{item,product})=>sum+product.price*item.qty,0);
    const savings = validItems.reduce((sum,{item,product})=>(sum+(product.original-product.price)*item.qty),0);
    const fee = validItems.length ? DELIVERY_FEE : 0;
    return {subtotal,savings,fee,total:subtotal+fee,items:validItems};
  }
  function addToCart(id,qty=1){
    const product=productById(id);
    if(!product||product.stock<1){showToast("Este produto está indisponível.", "error");return;}
    const existing=cart.find(item=>item.id===id);
    if(existing && existing.qty+qty>product.stock){showToast(`Estoque disponível: ${product.stock} unidade(s).`,"error");return;}
    if(!existing && qty>product.stock){showToast(`Estoque disponível: ${product.stock} unidade(s).`,"error");return;}
    if(existing)existing.qty+=qty;else cart.push({id,qty});
    persistCart();updateHeader();renderCart();showToast(`${product.name} adicionado ao carrinho.`);
  }
  function updateCartQuantity(id,delta){
    const item=cart.find(x=>x.id===id), product=productById(id);
    if(!item||!product)return;
    const next=item.qty+delta;
    if(next<1){removeFromCart(id);return;}
    if(next>product.stock){showToast(`Você chegou ao limite de estoque (${product.stock}).`,"error");return;}
    item.qty=next;persistCart();renderCart();updateHeader();
  }
  function removeFromCart(id){
    cart=cart.filter(item=>item.id!==id);persistCart();renderCart();updateHeader();
  }
  function renderCart(){
    const totals=calculateCartTotals();
    $("#cartCount").textContent=cartQty();
    $("#cartItems").innerHTML=totals.items.length?totals.items.map(({item,product})=>`
      <div class="cart-row">
        <div class="cart-row-img"><img src="${safeImage(product.image)}" alt="" data-fallback="${escapeHTML(product.category)}"></div>
        <div class="cart-row-info"><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.unit)} · ${money(product.price)} cada</small>
          <div class="quantity-control"><button data-action="qty-minus" data-id="${product.id}" aria-label="Diminuir ${escapeHTML(product.name)}">−</button><span>${item.qty}</span><button data-action="qty-plus" data-id="${product.id}" aria-label="Aumentar ${escapeHTML(product.name)}" ${item.qty>=product.stock?"disabled":""}>+</button></div>
          <button class="remove-item" data-action="remove-cart" data-id="${product.id}">Remover</button>
        </div><span class="cart-row-price">${money(product.price*item.qty)}</span>
      </div>`).join(""):`<div class="cart-empty"><div class="empty-basket">♧</div><h3>Seu carrinho está vazio</h3><p>Explore as ofertas e escolha o que vale a pena aproveitar.</p><button class="button button-secondary" data-action="close-cart">Ver ofertas</button></div>`;
    $("#cartFooter").innerHTML=totals.items.length?`
      <div class="drawer-totals">
        <div class="drawer-total-line"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div>
        <div class="drawer-total-line"><span>Você economiza</span><strong style="color:var(--green)">− ${money(totals.savings)}</strong></div>
        <div class="drawer-total-line"><span>Entrega estimada</span><strong>${money(totals.fee)}</strong></div>
        <div class="drawer-total-line total"><span>Total</span><strong>${money(totals.total)}</strong></div>
      </div><button class="button button-primary button-wide" data-action="checkout">Continuar para pagamento →</button><p class="summary-footnote">Valores e entrega são ilustrativos neste protótipo.</p>`:"";
    $$("img[data-fallback]",$("#cartItems")).forEach(img=>img.addEventListener("error",()=>{img.src=makeFallbackImage(img.dataset.fallback||"Alimento");img.removeAttribute("data-fallback");},{once:true}));
  }
  function openCart(){
    lastFocusedElement=document.activeElement;
    renderCart();
    $("#cartBackdrop").classList.remove("hidden");
    $("#cartDrawer").classList.add("open");
    $("#cartDrawer").setAttribute("aria-hidden","false");
    $(".icon-button",$("#cartDrawer")).focus();
    document.body.style.overflow="hidden";
  }
  function closeCart(){
    $("#cartBackdrop").classList.add("hidden");
    $("#cartDrawer").classList.remove("open");
    $("#cartDrawer").setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    if(lastFocusedElement && typeof lastFocusedElement.focus==="function")lastFocusedElement.focus();
  }

  function showModal(html){
    lastFocusedElement=document.activeElement;
    $("#modalContent").innerHTML=html;
    $("#modalBackdrop").classList.remove("hidden");
    document.body.style.overflow="hidden";
    $(".modal-close").focus();
    $$("img[data-fallback]",$("#modalContent")).forEach(img=>img.addEventListener("error",()=>{img.src=makeFallbackImage(img.dataset.fallback||"Alimento");img.removeAttribute("data-fallback");},{once:true}));
  }
  function closeModal(){
    $("#modalBackdrop").classList.add("hidden");
    document.body.style.overflow="";
    if(lastFocusedElement && typeof lastFocusedElement.focus==="function")lastFocusedElement.focus();
  }
  function showProductDetails(id){
    const p=productById(id);if(!p)return;
    showModal(`<span class="eyebrow">${escapeHTML(p.category)} · ${escapeHTML(p.store)}</span><h2 id="modalTitle">${escapeHTML(p.name)} <span class="product-unit">${escapeHTML(p.unit)}</span></h2><img class="detail-image" src="${safeImage(p.image)}" alt="${escapeHTML(p.name)}" data-fallback="${escapeHTML(p.category)}"><p>${escapeHTML(p.description)}</p><div class="detail-price"><strong>${money(p.price)}</strong><span class="price-old">${money(p.original)}</span><span class="discount-badge">${discount(p)}% OFF</span></div><div class="detail-condition">${escapeHTML(p.condition)}<br><br><strong>${p.stock} unidade(s)</strong> disponíveis no estoque demonstrativo.</div><button class="button button-primary button-wide" data-action="add-cart-modal" data-id="${p.id}">Adicionar ao carrinho</button>`);
  }

  function renderCheckout(){
    const user=currentUser();
    if(!user){navigateTo("login");return;}
    if(activeOrderId){
      const order=orders.find(o=>o.id===activeOrderId);
      if(order){renderOrderConfirmation(order);return;}
      activeOrderId=null;
    }
    if(cart.length===0){navigateTo("catalog");return;}
    const totals=calculateCartTotals();
    const a=user.address||{};
    $("#checkoutContent").innerHTML=`
      <div class="checkout-main">
        <form id="checkoutForm" novalidate>
          <section class="checkout-section">
            <div class="section-heading"><span class="step-number">1</span><div><h2>Endereço de entrega</h2><p>Confira onde seu pedido demonstrativo será entregue.</p></div></div>
            <div class="checkout-address">
              <label class="field field-full">Rua e número<input name="street" value="${escapeHTML(a.street||"")}" required><span class="field-error"></span></label>
              <label class="field">Bairro<input name="district" value="${escapeHTML(a.district||"")}" required><span class="field-error"></span></label>
              <label class="field">CEP<input name="cep" value="${escapeHTML(a.cep||"")}" required><span class="field-error"></span></label>
              <label class="field">Cidade<input name="city" value="${escapeHTML(a.city||"")}" required><span class="field-error"></span></label>
              <label class="field">Estado<input name="state" value="${escapeHTML(a.state||"")}" maxlength="2" required><span class="field-error"></span></label>
              <label class="field field-full">Complemento (opcional)<input name="complement" value="${escapeHTML(a.complement||"")}" placeholder="Apartamento, bloco, referência"></label>
            </div>
          </section>
          <section class="checkout-section">
            <div class="section-heading"><span class="step-number">2</span><div><h2>Forma de pagamento</h2><p>Escolha uma opção para a simulação.</p></div></div>
            <div class="payment-options">
              <label class="payment-option"><input type="radio" name="payment" value="Pix demonstrativo" checked><span class="payment-icon">◇</span><span><strong>Pix</strong><small>Pagamento simulado, sem transferência real.</small></span></label>
              <label class="payment-option"><input type="radio" name="payment" value="Cartão de crédito simulado"><span class="payment-icon">▤</span><span><strong>Cartão de crédito</strong><small>Não solicitaremos dados do cartão.</small></span></label>
              <label class="payment-option"><input type="radio" name="payment" value="Pagamento na entrega"><span class="payment-icon">↗</span><span><strong>Pagamento na entrega</strong><small>Somente uma opção demonstrativa.</small></span></label>
            </div>
            <label class="confirm-check"><input type="checkbox" name="confirm" required><span>Confirmo o endereço e os itens do pedido. Entendo que esta compra é uma simulação e não será enviada a um estabelecimento real.</span></label>
            <p class="checkout-error" id="checkoutError" role="alert"></p>
            <button class="button button-primary button-wide" type="submit">Confirmar pedido · ${money(totals.total)}</button>
          </section>
        </form>
      </div>
      ${renderSummaryHTML(totals)}
    `;
    $("#checkoutForm").addEventListener("submit",confirmOrder);
  }
  function renderSummaryHTML(totals){
    return `<aside class="order-summary"><h2>Resumo do pedido <span class="count-badge">${cartQty()}</span></h2>
      ${totals.items.map(({item,product})=>`<div class="summary-item"><div class="summary-thumb"><img src="${safeImage(product.image)}" alt="" data-fallback="${escapeHTML(product.category)}"></div><div class="summary-item-main"><strong>${escapeHTML(product.name)}</strong><small>${item.qty} × ${money(product.price)}</small></div><span class="summary-item-price">${money(product.price*item.qty)}</span></div>`).join("")}
      <div class="summary-lines"><div class="summary-line"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div class="summary-line saving"><span>Sua economia</span><strong>− ${money(totals.savings)}</strong></div><div class="summary-line"><span>Entrega estimada</span><strong>${money(totals.fee)}</strong></div></div>
      <div class="summary-total"><span>Total</span><strong>${money(totals.total)}</strong></div><p class="summary-footnote">Entrega estimada fictícia: 35–50 minutos. Valores de demonstração, sem cobrança real.</p>
      ${attachFallbacksMarkup()}
      </aside>`;
  }
  function attachFallbacksMarkup(){return "";}
  function confirmOrder(event){
    event.preventDefault();
    const form=event.currentTarget;
    $$(".field input",form).forEach(input=>setFieldError(input,""));
    $("#checkoutError").textContent="";
    const fields=["street","district","cep","city","state"];
    let valid=true;
    fields.forEach(name=>{const input=form.elements[name];if(!input.value.trim()){setFieldError(input,"Este campo é obrigatório.");valid=false;}});
    if(form.elements.cep.value && !/^\d{5}-?\d{3}$/.test(form.elements.cep.value.trim())){setFieldError(form.elements.cep,"Informe um CEP válido.");valid=false;}
    if(form.elements.state.value.trim().length!==2){setFieldError(form.elements.state,"Use a sigla de 2 letras.");valid=false;}
    if(!form.elements.confirm.checked){$("#checkoutError").textContent="Confirme o endereço e os itens para continuar.";valid=false;}
    const totals=calculateCartTotals();
    if(!totals.items.length){$("#checkoutError").textContent="Seu carrinho está vazio.";valid=false;}
    for(const {item,product} of totals.items){if(!product||product.stock<item.qty){$("#checkoutError").textContent=`Estoque insuficiente para ${product?product.name:"um produto"}. Revise o carrinho.`;valid=false;}}
    if(!valid){const first=$("[aria-invalid=true]",form);if(first)first.focus();return;}
    const user=currentUser();
    const address={cep:form.elements.cep.value.trim(),street:form.elements.street.value.trim(),district:form.elements.district.value.trim(),city:form.elements.city.value.trim(),state:form.elements.state.value.trim().toUpperCase(),complement:form.elements.complement.value.trim()};
    user.address=address;persistUsers();
    const order={
      id:`REA-${Date.now().toString().slice(-8)}`,
      createdAt:new Date().toISOString(),
      items:totals.items.map(({item,product})=>({id:product.id,name:product.name,unit:product.unit,qty:item.qty,price:product.price,original:product.original,image:product.image,category:product.category})),
      subtotal:totals.subtotal,savings:totals.savings,fee:totals.fee,total:totals.total,address,
      payment:form.elements.payment.value,status:0
    };
    // Valida estoque novamente imediatamente antes de concluir e só então baixa o estoque.
    order.items.forEach(item=>{const p=productById(item.id);p.stock-=item.qty;});
    orders.unshift(order);persistOrders();persistProducts();
    cart=[];persistCart();activeOrderId=order.id;
    renderCheckout();showToast("Pedido demonstrativo confirmado.");
  }
  const statusLabels=["Pedido confirmado","Preparando pedido","Saiu para entrega","Pedido entregue"];
  function renderOrderConfirmation(order){
    const address=order.address;
    const created=new Date(order.createdAt);
    const date=created.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
    $("#checkoutContent").innerHTML=`
      <div class="checkout-main order-confirmed">
        <div class="success-mark" aria-hidden="true">✓</div><span class="eyebrow">PEDIDO REGISTRADO NA DEMONSTRAÇÃO</span><h2>Pedido confirmado!</h2><p>Seu pedido foi registrado somente neste navegador. Nenhum estabelecimento recebeu a compra.</p>
        <div class="order-number">${escapeHTML(order.id)}</div>
        <div class="timeline" aria-label="Status do pedido">${statusLabels.map((label,index)=>`<div class="timeline-step ${index<order.status?"done":index===order.status?"current":""}"><div class="timeline-dot"></div><span>${label}</span></div>`).join("")}</div>
        <div class="simulation-note">Status e entrega simulados. Use o botão abaixo para avançar manualmente a demonstração.</div>
        <div class="order-detail-grid">
          <div class="order-detail"><span>Data do pedido</span><strong>${date}</strong></div>
          <div class="order-detail"><span>Pagamento demonstrativo</span><strong>${escapeHTML(order.payment)}</strong></div>
          <div class="order-detail"><span>Endereço de entrega</span><strong>${escapeHTML(address.street)}, ${escapeHTML(address.district)}<br>${escapeHTML(address.city)} - ${escapeHTML(address.state)}, ${escapeHTML(address.cep)}</strong></div>
          <div class="order-detail"><span>Economia nesta compra</span><strong style="color:var(--green)">${money(order.savings)}</strong></div>
        </div>
        <div class="tracking-actions">${order.status<3?`<button class="button button-primary" data-action="advance-status" data-id="${order.id}">Avançar status da simulação →</button>`:`<span class="button button-secondary" aria-label="Pedido entregue na simulação">✓ Simulação concluída</span>`}<button class="button button-secondary" data-action="new-shopping">Voltar às ofertas</button></div>
      </div>
      <aside class="order-summary"><h2>Seu pedido</h2>${order.items.map(item=>`<div class="summary-item"><div class="summary-thumb"><img src="${safeImage(item.image)}" alt="" data-fallback="${escapeHTML(item.category)}"></div><div class="summary-item-main"><strong>${escapeHTML(item.name)}</strong><small>${item.qty} × ${money(item.price)}</small></div><span class="summary-item-price">${money(item.price*item.qty)}</span></div>`).join("")}<div class="summary-lines"><div class="summary-line"><span>Subtotal</span><strong>${money(order.subtotal)}</strong></div><div class="summary-line saving"><span>Você economizou</span><strong>− ${money(order.savings)}</strong></div><div class="summary-line"><span>Entrega</span><strong>${money(order.fee)}</strong></div></div><div class="summary-total"><span>Total</span><strong>${money(order.total)}</strong></div><p class="summary-footnote">Preços e pedido fictícios, sem cobrança real.</p></aside>`;
    $$("img[data-fallback]",$("#checkoutContent")).forEach(img=>img.addEventListener("error",()=>{img.src=makeFallbackImage(img.dataset.fallback||"Alimento");img.removeAttribute("data-fallback");},{once:true}));
  }
  function updateOrderStatus(id){
    const order=orders.find(o=>o.id===id);if(!order)return;
    if(order.status<3){order.status+=1;persistOrders();renderCheckout();showToast(`Status demonstrativo: ${statusLabels[order.status]}.`);}
  }

  function showForgotPassword(){
    showModal(`<span class="eyebrow">RECUPERAÇÃO DE ACESSO</span><h2 id="modalTitle">Esqueceu sua senha?</h2><p>Como este é um protótipo local, não enviamos e-mails. Para testar, use a conta demonstrativa exibida na tela de login ou crie uma nova conta neste navegador.</p><button class="button button-primary button-wide" data-action="close-modal">Entendi</button>`);
  }
  function logout(){
    session=null;safeWrite(STORAGE.session,null);activeOrderId=null;closeCart();closeModal();navigateTo("login");showToast("Você saiu da sua conta.");
  }

  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-action]");
    if(!button)return;
    const action=button.dataset.action,id=button.dataset.id;
    switch(action){
      case "home":event.preventDefault();if(currentUser())navigateTo("catalog");else navigateTo("login");break;
      case "register":navigateTo("register");break;
      case "login":navigateTo("login");break;
      case "logout":logout();break;
      case "fill-demo":$("#loginForm").elements.email.value=DEMO_EMAIL;$("#loginForm").elements.password.value=DEMO_PASSWORD;$("#loginMessage").textContent="";break;
      case "forgot":showForgotPassword();break;
      case "open-cart":openCart();break;
      case "close-cart":closeCart();break;
      case "add-cart":addToCart(id);break;
      case "add-cart-modal":closeModal();addToCart(id);break;
      case "product-details":showProductDetails(id);break;
      case "qty-minus":updateCartQuantity(id,-1);break;
      case "qty-plus":updateCartQuantity(id,1);break;
      case "remove-cart":removeFromCart(id);showToast("Item removido do carrinho.");break;
      case "checkout":closeCart();activeOrderId=null;navigateTo("checkout");break;
      case "back-catalog":activeOrderId=null;navigateTo("catalog");break;
      case "advance-status":updateOrderStatus(id);break;
      case "new-shopping":activeOrderId=null;navigateTo("catalog");break;
      case "clear-filters":clearFilters();break;
      case "close-modal":closeModal();break;
    }
  });

  document.addEventListener("click",event=>{
    const button=event.target.closest(".show-password");
    if(!button)return;
    const input=button.parentElement.querySelector("input");
    const showing=input.type==="text";
    input.type=showing?"password":"text";
    button.textContent=showing?"Mostrar":"Ocultar";
    button.setAttribute("aria-label",showing?"Mostrar senha":"Ocultar senha");
  });
  $("#cartDrawer").addEventListener("keydown",event=>{
    if(event.key==="Escape"){closeCart();return;}
    if(event.key!=="Tab")return;
    const focusable=$$("button:not(:disabled),input,select,[href]",$("#cartDrawer")).filter(el=>el.offsetParent!==null);
    if(!focusable.length)return;
    if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus();}
    else if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus();}
  });
  $("#modalBackdrop").addEventListener("click",event=>{if(event.target===$("#modalBackdrop"))closeModal();});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      if(!$("#modalBackdrop").classList.contains("hidden"))closeModal();
      else if($("#cartDrawer").classList.contains("open"))closeCart();
    }
  });

  // Inicialização: se houver sessão demonstrativa válida, retoma o catálogo.
  if(currentUser()){
    $("#userFirstName").textContent=currentUser().name.split(" ")[0].toUpperCase();
    navigateTo("catalog");
  } else {
    navigateTo("register");
  }
  renderCart();
})();
