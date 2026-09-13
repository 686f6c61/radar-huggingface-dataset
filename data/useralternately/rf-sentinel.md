# UserAlternately/rf-sentinel

## Resumen

RF Sentinel v15 es un paquete de software publicado en Hugging Face por el usuario `UserAlternately` bajo el identificador `rf-sentinel`. No se trata de un modelo de lenguaje con pesos publicados, sino de un sistema de monitorizacion pasiva del espectro radioelectrico que emplea lo que el autor denomina "Dual-AI classification + Confidence Gating" para clasificar senales de radiofrecuencia. El sistema esta disenado explicitamente como receptor unicamente (receive-only): no emite ningun tipo de senal, segun se declara en la propia model card.

El repositorio describe una arquitectura de aplicacion, no de red neuronal: un motor principal (`rf_sentinel.py`) que el autor indica que no esta incluido en el repositorio y debe aportarse aparte, una API de dashboard con FastAPI y frontend Vue 3 servido por CDN, una alternativa ligera con Streamlit orientada a Raspberry Pi, y una utilidad de verificacion de integridad (`verify_integrity.py`) basada en manifiestos SHA-256 con soporte opcional de HMAC-SHA256 para cadena de custodia.

La relevancia del artefacto es limitada para la comunidad de IA dado que no se publican pesos, arquitectura de modelo, parametros, datos de entrenamiento ni benchmarks. El interes principal recae en su enfoque de gobernanza (receive-only, cadena de custodia, licencia AGPL con opcion dual comercial) y en el uso declarado para investigacion, monitorizacion interna de frecuencias y aplicacion de la ley autorizada. La model card esta redactada integramente en vietnamita, y los metadatos de Hugging Face no declaran idioma ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se menciona "Dual-AI classification + Confidence Gating" sin especificar los modelos subyacentes ni su topologia |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentacion del repositorio esta en vietnamita; los metadatos de Hugging Face no declaran idiomas) |
| Licencia | AGPL-3.0-or-later segun `LICENSE.md` del repositorio, con nota de dual-licensing comercial. Los metadatos de Hugging Face indican "no disponible" |
| Formato de pesos | No disponible. El repositorio no contiene pesos de modelo; se describe como paquete de codigo Python (motor, API, frontend y utilidades) |
| Tipo de artefacto | Paquete de software / aplicacion de monitorizacion RF (no es un modelo de pesos) |
| Componentes incluidos | `dashboard_api.py`, `webui/index.html`, `streamlit_dashboard.py`, `verify_integrity.py`, `LAW_DISCLAIMER.md`, `LICENSE.md`, `requirements.txt`, `requirements-dashboard.txt` |
| Componente ausente | `rf_sentinel.py` (motor Dual-AI, DB y funciones `repo_get_*`); el autor indica que debe copiarse manualmente |
| Dependencias del motor | numpy, scipy, hmmlearn, pyhackrf (segun `requirements.txt`) |
| Dependencias del dashboard | Conjunto ligero sin SDR (segun `requirements-dashboard.txt`) |
| Hardware SDR referenciado | HackRF (a traves de `pyhackrf`) |
| Persistencia | SQLite con `PRAGMA journal_mode=WAL` y `PRAGMA synchronous=NORMAL` |
| Fecha de publicacion | 13 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura de los modelos de IA empleados. La model card menciona un esquema de "Dual-AI classification" con "Confidence Gating", lo que sugiere la combinacion de dos clasificadores cuyas predicciones se filtran por un umbral de confianza, pero no se detalla el tipo de red (transformer, CNN, HMM, ensamblado clasico), el numero de parametros ni el procedimiento de entrenamiento. La presencia de `hmmlearn` entre las dependencias del motor apunta al uso de modelos ocultos de Markov para el modelado temporal de senales, aunque no se especifica como se integra con el componente de IA.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. No hay informacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal u otras). La unica innovacion descrita es de naturaleza operativa y de gobernanza: el modo receive-only estricto, el gating por confianza y el mecanismo de cadena de custodia mediante manifiestos SHA-256 y firmas HMAC-SHA256 opcionales.

## Capacidades

- Clasificacion de senales de radiofrecuencia mediante un esquema declarado de doble modelo de IA con filtrado por confianza.
- Monitorizacion pasiva de espectro: el sistema solo recibe, no transmite, segun la declaracion legal del repositorio.
- Deteccion de canales ruidosos y generacion de alertas, con funciones de repositorio `repo_get_alerts`, `repo_get_noisiest_channels`, `repo_get_stats_summary` y `repo_get_channel_spectrum_history`.
- Visualizacion web de alertas y del historial de espectro por canal mediante un dashboard FastAPI con frontend Vue 3 (Chart.js) servido por CDN, sin necesidad de Node.js ni paso de build.
- Dashboard alternativo ligero con Streamlit, orientado a despliegue en Raspberry Pi en campo.
- Verificacion de integridad y cadena de custodia: generacion y validacion de manifiestos SHA-256, con firma HMAC-SHA256 opcional.
- Despliegue como servicios systemd con proxy inverso Nginx y HTTPS obligatorio; autenticacion basica exigida por variables de entorno (`DASH_USER`, `DASH_PASS`).
- Acceso concurrente a SQLite desde el motor (escritura) y el dashboard (lectura) mediante modo WAL.
- Soporte de contenedores Docker e integracion con GitHub Releases para distribucion versionada.

No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes. No se declaran capacidades multilingues.

## Casos de uso

- Monitorizacion de interferencias en instalaciones propias: el sistema permite vigilar de forma pasiva el espectro en entornos controlados (por ejemplo, un centro de datos o un recinto hospitalario) y generar alertas cuando se detectan canales anormalmente ruidosos, sin emitir senal alguna que pueda interferir a terceros.
- Cumplimiento normativo interno: equipos de radiofrecuencia pueden auditar el uso del espectro en sus propias instalaciones y conservar registros historicos por canal, apoyandose en el dashboard y en la persistencia SQLite.
- Investigacion academica en clasificacion de senales: el esquema Dual-AI con confidence gating sirve como banco de pruebas para estudiar el compromiso entre sensibilidad y falsos positivos en la deteccion de emisiones, siempre que el investigador aporte el motor `rf_sentinel.py` que no se distribuye.
- Aplicacion de la ley autorizada con trazabilidad probatoria: la utilidad `verify_integrity.py` permite generar manifiestos SHA-256 (y firmas HMAC-SHA256) para demostrar que los registros capturados no han sido alterados antes de su uso como evidencia.
- Despliegue en campo de bajo consumo: la variante con Streamlit esta pensada para ejecutarse en Raspberry Pi junto a un receptor SDR, lo que facilita instalaciones remotas de vigilancia pasiva sin infraestructura de servidor.
- Integracion en un SOC/NOC: la API FastAPI puede exponerse tras un proxy Nginx con HTTPS y autenticacion basica, de modo que un centro de operaciones consuma alertas y estadisticas como una fuente mas de monitorizacion.
- Operacion como servicio persistente: los ejemplos de unidades systemd permiten arrancar el motor y el dashboard al inicio del sistema con reinicio automatico ante fallos, adecuado para monitorizacion continua.
- Distribucion y versionado interno: el flujo descrito con Git, etiquetas y GitHub Releases (o imagenes en `ghcr.io`) permite desplegar versiones concretas del paquete en distintas sedes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones cuantitativas frente a otros clasificadores de RF, ni tampoco datos de latencia o throughput del motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse pesos ni arquitectura de modelo, no puede estimarse el consumo de memoria de GPU.
- GPU recomendadas: no disponible. El artefacto no declara dependencia de GPU.
- Encaje en GPU de consumo: no disponible.
- Hardware de captura: se referencia HackRF a traves de la dependencia `pyhackrf`, por lo que se presupone un receptor SDR compatible. No se enumeran otros dispositivos soportados.
- Plataforma de campo: Raspberry Pi, mencionada explicitamente como destino de la variante Streamlit.
- Opciones de despliegue: servicios systemd para el motor y el dashboard, proxy inverso Nginx con terminacion TLS, contenedores Docker con publicacion en `ghcr.io`, y ejecucion directa con `python dashboard_api.py` o `streamlit run streamlit_dashboard.py`.
- Requisitos de seguridad en despliegue: autenticacion obligatoria mediante `DASH_USER` y `DASH_PASS`; el autor advierte que la autenticacion basica sobre HTTP sin TLS no es segura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Criterio | RF Sentinel v15 | Alternativas comparables |
|---|---|---|
| Categoria | Paquete de monitorizacion RF pasiva con clasificacion por IA | No disponible |
| Parametros | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible |
| Rendimiento en benchmarks | No disponible | No disponible |
| Licencia | AGPL-3.0-or-later con opcion dual comercial | No disponible |
| Disponibilidad de pesos | No se distribuyen pesos ni el motor principal | No disponible |

No se ha identificado en la informacion proporcionada ningun modelo o proyecto comparable con el que establecer una comparacion cuantitativa. Los resultados de la busqueda web no guardan relacion con este artefacto (nodos RPC de blockchain, alquiler de apartamentos y un marketplace de alquiler entre particulares).

## Limitaciones y advertencias

- Ausencia del componente principal: la model card advierte de forma explicita que el archivo de motor `rf_sentinel.py` no esta en el repositorio; sin el, el sistema no es funcional. Esto impide reproducir o evaluar el comportamiento del clasificador.
- Falta de informacion sobre el modelo: no se publican parametros, arquitectura, datos de entrenamiento, tokenizador, pesos ni resultados de evaluacion, por lo que no es posible validar sus prestaciones.
- Idiomas: la documentacion esta en vietnamita y no se declaran idiomas soportados por el sistema; esto puede dificultar su adopcion en entornos hispanohablantes sin traduccion previa.
- Riesgo de clasificacion erronea: al no publicarse metricas de precision o recall ni detalles del confidence gating, se desconoce la tasa de falsos positivos y falsos negativos. Cualquier uso operativo deberia acompanarse de validacion propia.
- Riesgo de alucinacion: no se han publicado datos especificos sobre este aspecto.
- Restricciones legales de uso: el repositorio incluye un aviso legal (`LAW_DISCLAIMER.md`) que limita el uso a investigacion, monitorizacion interna de frecuencias y aplicacion de la ley autorizada. La captura de espectro esta sujeta a normativa nacional e internacional sobre telecomunicaciones y proteccion de datos; el usuario debe verificar la legalidad de su despliegue.
- Licencia AGPL-3.0-or-later: el uso del software en un servicio accesible por red obliga, en principio, a ofrecer el codigo fuente correspondiente a los usuarios del servicio. Existe una via de licencia comercial dual que requiere contactar con el autor, pero los terminos no se detallan en la informacion disponible.
- Ausencia de soporte de la plataforma: el repositorio registra cero descargas y cero likes en el momento de la consulta, y los metadatos de Hugging Face no declaran licencia ni idioma, lo que reduce las garantias de mantenimiento.
- Seguridad en produccion: el propio autor advierte que la autenticacion basica sobre HTTP sin TLS no es segura y exige Nginx con HTTPS. El manejo de las credenciales y del archivo de clave HMAC debe mantenerse separado de los datos de evidencia.
- Cadena de custodia: cualquier verificacion marcada como `MODIFIED` debe justificarse antes de emplear los datos como prueba; el manifiesto y la clave deben almacenarse en una ubicacion distinta a la de las evidencias.
- Integridad de SQLite: el acceso concurrente exige activar el modo WAL; si no se configura, el motor y el dashboard pueden bloquearse mutuamente.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/UserAlternately/rf-sentinel
- Aviso legal del repositorio: `LAW_DISCLAIMER.md` (referenciado en la model card, sin URL publica disponible)
- Licencia: `LICENSE.md` (AGPL-3.0-or-later con nota de dual-licensing, sin URL publica disponible)
- Repositorio Git del autor: no disponible
- Paper o publicacion tecnica: no disponible
- Demo publica: no disponible
