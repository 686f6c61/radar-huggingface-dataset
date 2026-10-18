# swordenamine/dseedeep

## Resumen

`swordenamine/dseedeep` es un repositorio alojado en HuggingFace que **no contiene un modelo de inteligencia artificial**: no hay pesos, no hay arquitectura de red neuronal y no hay tokenizador. El contenido es la model card de una herramienta de línea de comandos en Python denominada "dseedeep", descrita por su autor como un *Advanced Security Reconnaissance Framework* orientado a reconocimiento pasivo y activo, OSINT, análisis de aplicaciones web y detección de superficie de vulnerabilidades sobre un objetivo autorizado.

La herramienta se organiza en módulos (`recon`, `active`, `osint`, `web`, `vuln`, `api` y `full`) y actúa fundamentalmente como orquestador de utilidades externas (nmap, Nikto, Nuclei, testssl.sh) y de 14 servicios de inteligencia (Shodan, VirusTotal, Censys, SecurityTrails, Hunter.io, URLScan.io, AbuseIPDB, FOFA, ZoomEye, GreyNoise, BinaryEdge, LeakIX, IPInfo, HaveIBeenPwned). Genera informes en JSON, texto y HTML en `reports/<objetivo>/<timestamp>/`.

La relevancia de la ficha es, por tanto, documental y de evaluación de riesgo: el repositorio no declara licencia, no tiene descargas ni *likes*, la model card está truncada (la sección `settings` de la configuración aparece cortada) y la búsqueda web realizada no devolvió ningún resultado relacionado con el proyecto. Cualquier uso en producción requiere auditoría previa del código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es una red neuronal; es una herramienta CLI en Python (orquestador de scripts y APIs) |
| Parametros totales | No aplica (sin pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica al modelo; la documentación y la interfaz de la herramienta están en inglés |
| Licencia | no disponible (ni la model card ni los metadatos de HuggingFace la declaran) |
| Formato de pesos | No aplica: el artefacto es código fuente (`dseedeep.py`, `requirements.txt`, `config.yaml.example`) |
| Autor | swordenamine |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-17T22:48:49Z |
| Fecha de actualizacion (metadatos) | 2026-02-15T18:35:06Z (anterior a la de creación; incoherencia en los metadatos) |
| Etiquetas | `region:us` |
| Dependencias externas | Python 3, nmap, Nikto, Nuclei, testssl.sh (opcionales pero necesarias para los módulos `active` y `vuln`) |
| API keys necesarias | 14 servicios (Shodan, VirusTotal, Censys, SecurityTrails, Hunter.io, URLScan, AbuseIPDB, FOFA, ZoomEye, GreyNoise, BinaryEdge, LeakIX, IPInfo, HaveIBeenPwned) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de modelo. El "sistema" es un programa Python que recibe un objetivo (`-t`), un modo (`-m recon|active|osint|web|vuln|api|full`) y una batería de flags (`--ports all`, `--stealth`, `--emails`, `--google-dorks`, `--wayback`, `--screenshot`, `--crawl`, `--crawl-depth`, `--nuclei`, `--ssl`, `--nikto`, `--all-apis`, `--output`, `--proxy`, `--threads`, `--format`, `-v`). Cada modo despacha a un módulo que, o bien implementa lógica propia (enumeración DNS de registros A, AAAA, MX, NS, TXT, SOA, CNAME, CAA, SRV, DMARC y SPF, intento de transferencia de zona AXFR, WHOIS, análisis de 9 cabeceras de seguridad, fingerprinting de más de 25 tecnologías, detección de 16 WAF, rastreo web), o bien envuelve herramientas del sistema (nmap para SYN, versión de servicio y detección de SO, con *fallback* a sockets crudos; Nikto; Nuclei con etiquetas `cve`, `exposure`, `misconfiguration`; testssl.sh).

La única lógica de descubrimiento de subdominios documentada combina fuerza bruta con un diccionario de más de 500 entradas, consultas a crt.sh (Certificate Transparency), HackerTarget y Wayback Machine; el OSINT incluye recolección de correos vía Hunter.io más scraping y extracción desde crt.sh, y 24 categorías predefinidas de Google Dorks. La configuración se realiza por YAML (`config.yaml`) y el autor menciona un modo sigiloso (`--stealth`) que reduce la velocidad y aleatoriza el orden de las peticiones, además de soporte de proxy HTTP para enrutar el tráfico. No se documentan tests, CI, versionado semántico ni changelog.

## Capacidades

- Enumeración DNS pasiva y activa: tipos de registro habituales, DMARC/SPF y prueba de transferencia de zona (AXFR).
- Consulta WHOIS de registrador, fechas, nameservers, organización y registrante.
- Descubrimiento de subdominios por fuerza bruta (500+ entradas), crt.sh, HackerTarget y Wayback.
- Escaneo de puertos vía wrapper de nmap (SYN, versión de servicio, detección de SO) con alternativa de sockets crudos.
- *Banner grabbing* de servicios HTTP, SSH, FTP y SMTP.
- Recolección de correos electrónicos (Hunter.io + scraping + crt.sh).
- 24 categorías de Google Dorks preconstruidas (paneles de administración, ficheros de configuración, bases de datos, credenciales).
- Análisis de cabeceras HTTP con puntuación de 9 cabeceras de seguridad y asignación de severidad.
- Fingerprinting de más de 25 tecnologías (CMS, frameworks, servidores, CDN, lenguajes) y detección de 16 WAF con sondeos de comportamiento.
- Rastreo web de páginas, ficheros JS, endpoints de API y formularios, con captura de pantalla opcional.
- Análisis SSL/TLS: validez y caducidad del certificado, protocolos y cifrados débiles, cadena de confianza, integración con testssl.sh.
- Orquestación de escáneres de vulnerabilidades: Nikto y Nuclei.
- Agregación de inteligencia de 14 APIs externas en un único informe.
- Exportación de resultados en JSON estructurado, texto legible e informe HTML con tabla de vulnerabilidades coloreada por severidad.
- No dispone de procesamiento de lenguaje natural, visión, audio, tool calling ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Pentest autorizado con alcance cerrado: ejecutar `-m full --all-apis --emails --crawl --nuclei --ssl` sobre un dominio del cliente para obtener en una sola pasada inventario DNS, subdominios, puertos y hallazgos de Nuclei, reduciendo el trabajo manual de recolección inicial.
- Auditoría de cumplimiento de cabeceras y TLS: usar `-m vuln --ssl` para generar evidencia de cabeceras ausentes con severidad asignada y de protocolos o cifrados obsoletos, útil en informes de hardening web.
- Monitorización periódica de superficie de ataque: programar el modo `api --all-apis` con salida JSON y comparar los ficheros `dseedeep_<objetivo>.json` entre ejecuciones para detectar nuevos servicios expuestos vía Shodan, Censys o BinaryEdge.
- Bug bounty con alcance delimitado: combinar `-m recon` (crt.sh, Wayback, fuerza bruta) y `-m osint --wayback` para localizar endpoints y parámetros antiguos no referenciados en la aplicación actual.
- Evaluación de exposición corporativa en brechas: consultar HaveIBeenPwned y Hunter.io desde `-m api` para inventariar correos corporativos filtrados, siempre con autorización expresa del responsable del dominio.
- Planificación de pruebas ofensivas: usar la detección de WAF y el fingerprinting de tecnologías (`-m web`) para decidir qué técnicas de evasión y qué vectores tienen sentido antes de la fase de explotación.
- Entrega de informes a cliente: el HTML autogenerado (tema oscuro, tabla por severidad, enlaces a dorks y tarjetas por fuente de API) sirve como anexo técnico del informe de reconocimiento.
- Enrutado del tráfico a través de proxy (`--proxy`) y ajuste de concurrencia (`--threads`) para integración en entornos con salida controlada o para respetar los límites de tasa de las APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluación alguna (ni precisión de descubrimiento, ni comparativas de tiempos, ni tests), cuenta con 0 descargas y 0 *likes*, y la búsqueda web no devolvió resultados relacionados con el proyecto. El rendimiento real dependerá del objetivo, del número de hilos configurados (`--threads`), de la latencia de red y, de forma crítica, de las cuotas y límites de tasa de las 14 APIs externas.

## Requisitos de hardware

- VRAM: no aplica; la herramienta no ejecuta inferencia ni utiliza GPU.
- CPU/RAM: no disponibles en la información proporcionada; el consumo vendrá dominado por los procesos hijos (nmap, Nuclei, Nikto) y por el número de hilos concurrentes.
- GPU recomendadas: ninguna; no hay soporte de CUDA ni de aceleración por hardware documentado.
- Requisitos de software: Python 3 con las dependencias de `requirements.txt`; opcionalmente Go (para instalar Nuclei), `nikto`, `nmap` y `testssl.sh` desde sus repositorios.
- Despliegue: ejecución directa del script (`python3 dseedeep.py`) o instalación como comando mediante enlace simbólico en `/usr/local/bin`. No se documenta imagen Docker, Helm ni servicio systemd.
- Throughput y latencia: no disponibles; dependen del objetivo, de la profundidad del rastreo (`--crawl-depth`), del tamaño del diccionario y de los límites de las APIs. El modo `--stealth` introduce retardos deliberados.
- Conectividad: se requiere salida a Internet y, en el modo `api`, claves válidas para cada servicio; el tráfico puede canalizarse por proxy HTTP.

## Comparativa con modelos similares

No hay modelos comparables porque el artefacto no es un modelo. La comparación pertinente es con herramientas de reconocimiento del mismo dominio funcional:

| Herramienta | Enfoque | Parametros / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dseedeep | Suite todo-en-uno: recon, OSINT, web, vuln y agregación de 14 APIs | No aplica | no disponible | Repositorio HuggingFace con 0 descargas; código en GitHub según la model card |
| theHarvester | Recolección de correos, subdominios y hosts desde fuentes públicas | No aplica | no verificada en esta ficha | Proyecto público ampliamente conocido |
| OWASP Amass | Enumeración y mapeo de superficie de ataque DNS | No aplica | no verificada en esta ficha | Proyecto público ampliamente conocido |
| SpiderFoot | Plataforma de OSINT con módulos y correlación | No aplica | no verificada en esta ficha | Proyecto público ampliamente conocido |
| Nuclei | Escaneo basado en plantillas (usado internamente por dseedeep) | No aplica | no verificada en esta ficha | Proyecto público ampliamente conocido |

No se dispone de datos de rendimiento, cobertura o mantenimiento que permitan una comparación cuantitativa; las licencias de las alternativas no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural; cualquier expectativa de uso como LLM es un error de categoría.
- Licencia no declarada: sin licencia explícita no hay cesión de derechos; el uso comercial o la redistribución son jurídicamente inseguros.
- Riesgo legal y ético: la propia model card advierte que solo debe usarse en pruebas de penetración autorizadas por escrito. El escaneo no autorizado es ilegal en la mayoría de jurisdicciones (en España, entre otras normas, la Ley Orgánica 14/2015 y el Código Penal en materia de daños y acceso ilícito).
- Código no auditado: 0 descargas y 0 *likes* implican ausencia de revisión por la comunidad; ejecutar el script otorga acceso a claves de API de 14 servicios y a la red interna del operador.
- Dependencia de servicios de terceros: sin claves válidas, los módulos de inteligencia no aportan nada; además, muchas APIs tienen cuotas, coste y condiciones de uso que restringen el tipo de consultas.
- Dependencia de binarios externos: nmap, Nikto, Nuclei y testssl.sh deben estar instalados y actualizados; el comportamiento cambia según la versión y los *fallbacks* (sockets crudos) ofrecen menor fiabilidad.
- Documentación incompleta: la model card parece truncada (sección `settings` cortada), no se documentan todas las flags, el formato exacto del informe HTML ni el esquema del JSON.
- Incoherencias de metadatos: la fecha de creación (2026-10-17) es posterior a la de actualización (2026-02-15), y el propietario del repositorio Git indicado en la model card (`swordenkisk`) no coincide con el de HuggingFace (`swordenamine`); conviene verificar el origen real del código antes de ejecutarlo.
- Falsos positivos y negativos: la detección de WAF, el fingerprinting y los hallazgos de Nuclei/Nikto requieren validación manual; no se documenta tasa de error alguna.
- Sin soporte ni mantenimiento declarados: no hay issues, canal de soporte, changelog ni política de seguridad.
- Advertencia de seguridad operativa: el modo `active` y `--ports all` generan tráfico fácilmente detectable e identificable; el modo `--stealth` solo reduce la velocidad, no garantiza anonimato. El uso de `--proxy` no implica anonimización.
- Idiomas: la herramienta y sus informes están en inglés; no se documenta localización al castellano.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/dseedeep
- Repositorio Git indicado en la model card: https://github.com/swordenkisk/dseedeep
- testssl.sh (dependencia opcional): https://github.com/drwetter/testssl.sh
- Nuclei (dependencia opcional): https://github.com/projectdiscovery/nuclei
- Paper, blog, demo o documentación adicional: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados relacionados con el proyecto).
