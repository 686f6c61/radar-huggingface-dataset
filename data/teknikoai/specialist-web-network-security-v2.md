# TeknikoAI/specialist-web-network-security-v2

## Resumen

Specialist Web & Network Security Models v2.6 es un conjunto de 12 modelos especialistas de ciberseguridad, cada uno orientado a una única tarea de detección o clasificación, desarrollados por TeknikoAI. Todos ellos se construyen sobre el modelo base `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder de tipo BERT con 320 tokens de contexto, y se distribuyen cuantizados a INT8 en formato ONNX (entre 22,0 y 22,3 MB por modelo, 265,2 MB en total) y a INT4 en PyTorch (entre 13,1 y 13,7 MB por modelo). No se trata de un modelo generativo, sino de una suite de sensores ML ligeros para inferencia local en CPU.

El problema que resuelve es la detección de amenazas web y de red con modelos pequeños y desplegables en local: ataques WAF (SQLi, XSS, SSRF, XXE, smuggling), intrusiones L2-L7, abuso de API (BOLA/IDOR, scraping, rate abuse), anomalías de autenticación, inyección de prompts en LLMs, extracción de secretos e IOCs en logs, y triaje de alertas SOC. El autor lo presenta explícitamente como complemento, no sustituto, de controles deterministas como firmas WAF, consultas parametrizadas, RBAC o MFA de hardware.

La relevancia actual radica en su tamaño reducido (decenas de MB) y su formato ONNX, que permiten ejecutarlo en CPU sin GPU y en línea con el tráfico. El repositorio incluye además `novapay_app/`, una aplicación de demostración de portal bancario FinTech protegida por un mecanismo de consenso de ensemble con incertidumbre (Primary-Gate Uncertainty-Gated Ensemble Consensus). La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2, base de `sentence-transformers/all-MiniLM-L6-v2`); suite de 12 cabezas especialistas |
| Parametros totales | No disponible (modelo base MiniLM-L6-v2; pesos INT8 de 22,0-22,3 MB por especialista) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 320 tokens |
| Tipos de cuantizacion | INT8 (ONNX) e INT4 (PyTorch) |
| Idiomas soportados | No disponible (la model card menciona detección multilingüe de prompt injection, sin listado de idiomas) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`specialist_int8.onnx`), PyTorch INT4 (`specialist_int4.pt`) y metadatos `meta.json` |

## Arquitectura y entrenamiento

Cada uno de los 12 especialistas es un encoder MiniLM-L6-v2 con una cabeza de clasificación o extracción adaptada a su tarea: gates binarios (`noul`, con umbral de decisión), routers de clasificación multiclase (`choice`), un scorer calibrado de severidad (`score`), detectores multi-etiqueta (`tags`), extractores de secuencias BIO (`extract`) y un esquema de triaje de tres cabezas (`schema`). El modelo base se cuantiza a INT8 para ONNX y a INT4 para PyTorch, lo que reduce el peso por especialista a decenas de megabytes.

El entrenamiento se realizó sobre 18.000 filas híbridas de datos reales y sintéticos con etiquetado suave (soft labels), combinando 1.334 muestras reales de seguridad públicas de los datasets `deepset/prompt-injections`, `zrmarine/sql_injection`, `AmirAliGharesoufloo/XSS` y `pyToshka/network-intrusion-detection`, con un 40-42 % de priors benignos fuertes y sin "muletillas" sintéticas de palabras de alarma. No se especifica el número total de tokens de entrenamiento ni si se aplicaron RLHF o DPO (poco probable en un encoder de clasificación). El despliegue recomendado es el consenso de ensemble con compuerta de incertidumbre (Primary-Gate Uncertainty-Gated Ensemble Consensus) en lugar de votación mayoritaria simple o bloqueo por una única cabeza.

## Capacidades

- Detección de ataques web y WAF: 38 clases (SQLi, NoSQLi, XSS, SSRF, LFI/RFI, XXE, SSTI, JWT alg:none, HTTP smuggling, prototype pollution, WebSocket CSWSH, abuso de CORS, Zip Slip, SAML XSW).
- Detección de intrusiones de red L2-L7: 29 amenazas (floods SYN/UDP/ICMP, DNS water torture, escaneos de puertos rápidos y lentos, túneles DNS/ICMP, balizas C2, fuerza bruta SSH/RDP, Pass-the-Hash, reverse shells, ejecución no autenticada en Kubelet, exfiltración S3, spoofing ARP/DNS/VLAN, secuestros BGP).
- Clasificación de abuso de API en 5 vías: `BENIGN`, `SCRAPING_BOT`, `BOLA_IDOR`, `RATE_ABUSE`, `PAYLOAD_INJECTION`.
- Detección de anomalías de autenticación zero-trust: credential stuffing, slow spray, impossible travel, logins desde salidas Tor, replay OAuth sin fallos, fatiga MFA, phishing OAuth, Kerberoasting, Golden Ticket, proxy AitM.
- Firewall de prompts para LLMs: inyección directa, sigilosa, por persona, auditoría educada, multilingüe, comentarios HTML, exfiltración por Markdown, leetspeak y secuestro de herramientas.
- Enrutamiento de dominio en 5 vías: `BENIGN`, `WEB_API`, `APP_IDENTITY`, `NETWORK_TRAFFIC`, `HOST_SYSTEM`.
- Recomendación de contención en 4 vías: `ALLOW_LOG`, `INVESTIGATE_SOC`, `REVOKE_CREDENTIALS`, `ISOLATE_CONTAIN`.
- Puntuación calibrada de severidad de riesgo de 1 a 5.
- Detección multi-etiqueta de 5 tácticas: `credential_risk`, `data_exfiltration`, `defense_evasion`, `lateral_movement`, `web_network_exploit`.
- Extracción BIO de secretos en logs (`API_KEY`, `PASSWORD`, `TOKEN`) e IOCs (`IP_ADDR` IPv4/IPv6, `DOMAIN`, `USER_ACCOUNT`).
- Triaje unificado de SOC en una sola pasada con tres cabezas: `domain`, `needs_escalation` y `severity`.
- No soporta tool calling, function calling ni razonamiento agéntico: son clasificadores, no modelos generativos.

## Casos de uso

- Detección inline de ataques HTTP en un WAF: `sec_web_waf_gate` puntúa cada petición y, con umbral 0,55, permite bloquear o marcar SQLi, XSS, SSRF o smuggling antes de que lleguen a la aplicación, siempre en modo sombra primero para medir falsos positivos.
- Monitorización de red en un IDS/IPS: `sec_net_intrusion_gate` clasifica eventos L2-L7 (floods, escaneos, túneles, balizas C2) para generar alertas en el SIEM, combinado con contadores de ventana deslizante para ataques multi-paso.
- Protección de API bancarias: `sec_api_abuse_router` distingue scraping, BOLA/IDOR, abuso de rate y payload injection en el gateway de API, complementando RBAC y rate limiting determinista.
- Firewall de prompts para asistentes LLM: `sec_prompt_injection_gate` (umbral 0,40) filtra entradas de usuario antes de enviarlas al modelo generativo, cubriendo inyecciones multilingües, ofuscadas o vía comentarios HTML.
- Triaje automático en un SOC: `sec_unified_soc_triage`, `sec_risk_severity`, `sec_alert_indicators` y `sec_incident_action` permiten priorizar alertas, asignar severidad 1-5 y recomendar contención (registrar, investigar, revocar credenciales o aislar) en una sola pasada.
- Prevención de fuga de datos en logs: `sec_log_redact_secrets` extrae claves API, contraseñas y tokens de logs antes de almacenarlos o enviarlos a un sistema externo, y `sec_ioc_extract` extrae IPs, dominios y cuentas de usuario para enriquecimiento.
- Detección de anomalías de login zero-trust: `sec_auth_anomaly_gate` evalúa eventos de autenticación para detectar credential stuffing, impossible travel o fatiga MFA y disparar step-up authentication.
- Demostración integrada: `novapay_app/` ejecuta un portal FinTech con los 12 modelos en consenso de ensemble, útil como banco de pruebas de la suite completa.

## Benchmarks y rendimiento

Evaluación local en CPU con `onnxruntime`, según la model card:

| Prueba | Resultado |
|---|---|
| Stress test adversarial de 68 casos | 97,1 % (66/68); 11 de 12 especialistas al 100,0 % |
| Benchmark OOD in-the-wild de 24 casos | 91,7 % (22/24), frente a 70,8 % con solo datos sintéticos |
| Campaña de ensemble NovaPay de 18 vectores en vivo | 94,4 % (17/18); 100,0 % de ataques bloqueados (10/10); 87,5 % de clientes benignos difíciles permitidos (7/8) |

Resultados por especialista en el stress test de 68 casos: `sec_web_waf_gate` 100,0 % (8/8) en OOD in-the-wild; `sec_net_intrusion_gate` 100,0 % (8/8); `sec_api_abuse_router` 100,0 % (5/5); `sec_auth_anomaly_gate` 100,0 % (8/8); `sec_prompt_injection_gate` 100,0 % (8/8) en OOD in-the-wild; `sec_domain_router` 100,0 % (5/5); `sec_incident_action` 100,0 % (4/4); `sec_risk_severity` 100,0 % (4/4); `sec_alert_indicators` 100,0 % (4/4); `sec_log_redact_secrets` 100,0 % (4/4); `sec_ioc_extract` 100,0 % (4/4); `sec_unified_soc_triage` 100,0 % (4/4). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a esta categoría de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU con `onnxruntime`. Cada especialista INT8 ocupa unos 22 MB en memoria y el total de la suite ronda los 265 MB.
- GPU recomendadas: no aplica; cualquier GPU con soporte ONNX Runtime serviría, pero no es el objetivo del despliegue.
- Cabe en cualquier equipo consumer: portátil, contenedor pequeño o edge device, dado el tamaño de decenas de MB por modelo.
- Opciones de despliegue: `onnxruntime` (formato principal), PyTorch con pesos INT4, y la demo Flask `novapay_app/server.py --variant mixed --port 8002`.
- Latencia y throughput: no disponibles de forma numérica; la model card menciona un "techo de latencia en CPU" y recomienda poner rate limiting determinista delante de las compuertas ML bajo tráfico volumétrico.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Tamaño | Licencia | Enfoque |
|---|---|---|---|---|---|
| TeknikoAI specialist-web-network-security-v2 | Suite de 12 clasificadores MiniLM INT8/INT4 | 320 tokens | 22 MB por especialista (265 MB total) | No disponible | Ciberseguridad multi-tarea local |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | Encoder de embeddings | 320 tokens | ~90 MB (fp32) | Apache 2.0 (según el modelo base original) | Embeddings generales, sin cabezas de seguridad |
| Modelos WAF/IDS basados en reglas (p. ej. ModSecurity, Suricata) | Firmas deterministas | No aplica | Variable | Variable | Detección por firmas, sin ML |
| LLMs generativos para triaje SOC (p. ej. modelos de 7B+) | Generativo | 8K-128K tokens | GB | Variable | Razonamiento y explicación, mucho más costoso |

La comparativa con alternativas ML de ciberseguridad de tamaño similar no está disponible en la información proporcionada. Frente a los controles deterministas, la suite aporta detección semántica de variantes ofuscadas, pero el propio autor la posiciona como complemento, no sustituto.

## Limitaciones y advertencias

- Puntuación de eventos única y sin estado: no detecta ataques multi-paso a lo largo del tiempo; requiere contadores de ventana deslizante o correlación en SIEM.
- Límite de contexto de 320 tokens: los payloads largos deben trocearse o escanearse por parámetros individuales.
- Techo de latencia en CPU: bajo tráfico volumétrico hay que colocar rate limiting determinista delante de las compuertas ML.
- Pesos públicos: el autor recomienda combinarlos con consultas parametrizadas, RBAC estricto, MFA de hardware y fine-tuning privado empresarial.
- No es un sustituto de controles de seguridad deterministas (firmas WAF, EDR, regex DLP, MFA).
- Riesgo de falsos positivos y negativos: hay que desplegar primero en modo sombra sobre tráfico real antes de habilitar bloqueo automático.
- Necesidad de canonicalizar y decodificar entradas (URL-decode, HTML-unescape, normalización NFKC) antes del escaneo.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia no especificada: no se puede confirmar el uso comercial; verificar antes de producción.
- Idiomas soportados no listados: la detección multilingüe de prompt injection se menciona, pero sin cobertura declarada.
- Los benchmarks son evaluaciones locales del autor (68, 24 y 18 casos), con muestras pequeñas; no son comparables a suites de referencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/TeknikoAI/specialist-web-network-security-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset `deepset/prompt-injections`: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset `zrmarine/sql_injection`: https://huggingface.co/datasets/zrmarine/sql_injection
- Dataset `AmirAliGharesoufloo/XSS`: https://huggingface.co/datasets/AmirAliGharesoufloo/XSS
- Dataset `pyToshka/network-intrusion-detection`: https://huggingface.co/datasets/pyToshka/network-intrusion-detection
