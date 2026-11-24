# Zazius/trust-wallet-metamask-seed-recovery-v3

## Resumen

`Zazius/trust-wallet-metamask-seed-recovery-v3` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion ejecutable para Windows 10 y Windows 11, distribuida como archivo ZIP de 4,8 MB protegido con contrasena y alojado en un repositorio de GitHub de terceros. El autor declara que implementa funciones de "recuperacion de semilla" de monederos Trust Wallet y MetaMask, derivacion multi-cadena, auditoria de tokens ERC20/SPL y parseo de keystores LevelDB.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje. Las etiquetas de Hugging Face (`windows`, `x64`, `portable`) y la ausencia de pipeline confirman que se ha publicado como si fuera un paquete de software, no un modelo. No hay informacion sobre parametros, contexto, entrenamiento ni licencia de pesos mas alla de la etiqueta `mit` en los metadatos.

Desde el punto de vista de evaluacion tecnica, la ficha no puede tratar este artefacto como un modelo: se documenta lo que declara el autor y se advierte de que el contenido es altamente sospechoso. Un ejecutable de origen desconocido, con contrasena en el ZIP para evadir analisis automaticos, que promete recuperar frases semilla de monederos de criptomonedas, encaja en el patron clasico de malware o estafa dirigida a robar fondos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se declara una aplicacion nativa Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos) |
| Licencia | MIT (segun metadatos) |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El autor describe un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` (build `v3.4.5 · FD268432BF`) que, segun la model card, incluiria rotacion de nodos RPC (Alchemy, Helius, QuickNode), derivacion de direcciones BIP44/BIP84 para EVM, Solana y Bitcoin, comprobacion de saldos ERC20/SPL, exportacion de informes y un motor multi-hilo con PBKDF2 y SIMD.

Ninguna de esas afirmaciones es verificable: no se publican hashes, firmas de codigo, codigo fuente ni resultados de analisis. La unica fuente de descarga apunta a un repositorio de GitHub distinto del espacio de Hugging Face, con nombre de archivo incoherente respecto al titulo del repositorio (`fisch-script-auto-catch-macro` frente a `trust-wallet-metamask-seed-recovery-v3`), lo que sugiere reutilizacion de plantillas de distraccion.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Las capacidades declaradas son de manipulacion de monederos: derivacion de direcciones, consulta de saldos y parseo de keystores locales.
- Multilingue solo en la metadata del repositorio; no hay evidencia de procesamiento de lenguaje.
- Cualquier capacidad real del binario es desconocida y no auditable.

## Casos de uso

- Auditoria de seguridad defensiva: un analista podria usar el binario como muestra en un entorno aislado (sandbox sin red, maquina virtual desechable) para estudiar tecnicas de evasion y comportamiento, nunca ejecutandolo en un equipo con datos reales.
- Formacion en concienciacion: el repositorio sirve como ejemplo didactico de ingenieria social dirigida a titulares de criptomonedas, con patrones reconocibles (contrasena en el ZIP, insignias falsas de descargas y valoracion, enlaces a repositorios ajenos).
- Investigacion de campanas de malware: comparar el nombre del binario con otras muestras de la misma familia para atribuir infraestructura.
- Analisis de cadena de suministro en Hugging Face: documentar como se cuelan artefactos no-modelo en un hub de modelos y que senales permiten detectarlos (pipeline vacio, cero descargas, tags de sistema operativo).
- Respuesta a incidentes: si un usuario ha ejecutado el binario, el equipo de seguridad puede usar la ficha como referencia para el triaje y la busqueda de indicadores.
- Docencia sobre licencias y confianza: ilustrar por que una etiqueta MIT en los metadatos no implica que el contenido sea seguro ni auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor cita cifras de rendimiento no verificables (respuesta en menos de 37 ms, 99,2 % de consistencia, menos de 55 MB y 49 MB de RAM, 14 hilos), pero no aporta metodologia, hardware ni repeticiones, por lo que no deben considerarse mediciones.

## Requisitos de hardware

- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Almacenamiento: 4,8 MB para el ZIP; espacio adicional tras la extraccion no especificado.
- RAM: el autor afirma menos de 55 MB en el modulo de auditoria de tokens y menos de 49 MB en el parser LevelDB; no verificable.
- CPU: se menciona un motor SIMD multi-hilo con 14 hilos de trabajo; no se detalla ISA minima (SSE4.2, AVX2) ni numero de nucleos requerido.
- GPU: no aplica; no hay inferencia neuronal.
- Opciones de despliegue: ejecucion nativa en Windows; no procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No procede: no existe categoria de modelos comparable porque el artefacto no es un modelo de lenguaje. Frente a modelos reales de la familia de recuperacion de frases semilla o de analisis de monederos, la diferencia clave es que aqui no hay pesos, no hay evaluacion publica y no hay trazabilidad del binario.

| Criterio | Este repositorio | Modelo de IA tipico en Hugging Face | Herramienta de monedero auditada |
|---|---|---|---|
| Naturaleza | Binario Windows en ZIP | Pesos + tokenizador + config | Codigo fuente auditable |
| Parametros | no disponible | Declarados | No aplica |
| Contexto | no disponible | Declarado | No aplica |
| Verificabilidad | Nula (sin hashes ni fuente) | Media (pesos descargables) | Alta (revision de codigo) |
| Licencia | MIT en metadatos | Declarada | Habitualmente abierta y con auditoria |
| Riesgo para el usuario | Muy alto | Bajo o medio | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no tiene pesos; tratarlo como modelo es un error de categoria.
- Riesgo elevado de malware o estafa: un ejecutable de origen no verificado que promete recuperar frases semilla de monederos es el vector tipico de robo de criptoactivos.
- La contrasena fija en el ZIP (`2026`) impide el escaneo automatico por parte de antivirus y servicios de analisis, una tecnica habitual de evasion.
- El enlace de descarga apunta a un repositorio de GitHub de terceros con un nombre de proyecto ajeno (`fisch-script-auto-catch-macro`), lo que indica posible reutilizacion de infraestructura.
- Las insignias de valoracion (4,9/5) y descargas (427K+) son texto plano en la model card, no datos reales del hub; el repositorio registra 0 descargas y 0 likes.
- No hay hashes, firmas Authenticode, codigo fuente ni resultados de sandbox que permitan verificar el binario.
- La licencia MIT declarada en los metadatos no aporta ninguna garantia sobre el contenido ni sobre su seguridad.
- Cualquier uso en produccion o en un equipo con acceso a monederos, claves o credenciales debe considerarse prohibido.
- No se debe ejecutar el binario fuera de un entorno aislado y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zazius/trust-wallet-metamask-seed-recovery-v3
- Enlace de descarga citado por el autor (repositorio de terceros, no verificado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Pagina de releases citada por el autor: https://github.com/Truong81752/trust-wallet-metamask-seed-recovery-v3/releases/latest
- Documentacion oficial de Trust Wallet: https://trustwallet.com
- Documentacion oficial de MetaMask: https://metamask.io
- Aviso de seguridad de MetaMask sobre estafas de recuperacion de semilla: https://support.metamask.io
