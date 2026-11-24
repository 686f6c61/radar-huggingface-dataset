# WakyITA/gmgn-bullx-photon-copytrade-bot

## Resumen

`WakyITA/gmgn-bullx-photon-copytrade-bot` no es un modelo de inteligencia artificial: es un repositorio alojado en Hugging Face que distribuye un ejecutable portable para Windows x64 presentado como bot de copytrading para plataformas de tokens (GMGN, Bullx, Photon). El paquete se ofrece como un ZIP de 4,8 MB con contraseña de descompresión y un binario `.exe` que el autor indica ejecutar como administrador. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia.

El repositorio emplea el etiquetado propio de Hugging Face (tags de sistema operativo, idioma y licencia MIT) pero su contenido es una model card de tipo marketing con enlaces a binarios alojados en GitHub. La fecha de creación indicada (2026-11-24) es posterior a la fecha actual, lo que unido a la ausencia total de artefactos de modelo, descargas y likes, apunta a un patrón de distribución de software sospechoso en lugar de a un modelo publicado.

Desde la perspectiva de evaluación de modelos, la ficha debe leerse como una advertencia: no hay nada que evaluar técnicamente como IA y sí múltiples señales de riesgo de seguridad (binario ofuscado, contraseña en el archivo, ejecución como administrador, desactivación sugerida de SmartScreen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no verificable en artefactos) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no incluye tarjetas de configuración (`config.json`), vocabulario, checkpoints ni scripts de entrenamiento. El contenido descrito en la model card corresponde a un supuesto bot de trading con módulos denominados "20-wallet LUT bundler", "pre-buy honeypot filter", "paper-trade sandbox", "smart-money copytrade" y "Jito & MEV bundle engine", con cifras de latencia y frecuencia de sondeo (por ejemplo, 27 ms de respuesta, 464 Hz de polling) que no vienen acompañadas de metodología de medición ni de código verificable.

El único artefacto tangible es `repo-cheat-mod-menu-v1.2.2-win64.zip`, un archivo comprimido protegido con contraseña que contiene un ejecutable. La combinación de nombre del binario ("cheat-mod-menu"), contraseña embebida en la documentación y petición de ejecución con privilegios de administrador es un patrón habitual en campañas de distribución de malware, no en publicaciones de modelos.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No hay soporte verificable de tool calling ni de function calling en el sentido de modelos de lenguaje.
- No hay soporte de agentes ni de razonamiento multi-paso basado en un LLM.
- El multilingüismo declarado en los metadatos no se corresponde con ningún artefacto de modelo que lo implemente.
- Las supuestas capacidades funcionales (copytrading, filtro de honeypots, enrutado de órdenes) pertenecen a un binario opaco y no son auditables.

## Casos de uso

- Ninguno recomendado. El repositorio no contiene un modelo desplegable ni código fuente auditable.
- Evaluación de modelos: no aplica; no hay pesos ni tokenizador que cargar en vLLM, llama.cpp, Ollama o TGI.
- Investigación sobre seguridad en Hugging Face: puede servir como ejemplo de repositorio con etiquetado de modelo pero contenido de binario, útil para calibrar filtros de moderación de la plataforma.
- Análisis de campañas de distribución de software: el patrón (ZIP con contraseña, `.exe` como administrador, desactivación de SmartScreen) es un caso de estudio de ingeniería social.
- Docencia sobre riesgos en cadena de suministro de software: ilustra por qué no debe ejecutarse un binario descargado de un repositorio sin procedencia verificable.
- Auditoría de licencias: el uso de la etiqueta MIT sobre un binario sin código fuente asociado plantea dudas sobre la validez de la cesión de derechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (27 ms, 464 Hz, 136 Hz, 4,8 MB) son afirmaciones de marketing sin metodología, conjunto de datos ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles de forma verificable.
- Requisitos del artefacto distribuido: Windows 10 22H2 o Windows 11 24H2, procesador x64 (Intel o AMD), 4,8 MB de espacio en disco para el ZIP y ejecución como administrador según las instrucciones del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WakyITA/gmgn-bullx-photon-copytrade-bot | Binario Windows (no es modelo de IA) | no disponible | no disponible | MIT | ZIP con contraseña en GitHub |
| Modelos de trading algorítmico open source (por ejemplo, frameworks de backtesting en Python) | Código fuente auditable | no aplica | no aplica | MIT/Apache-2.0 habituales | Repositorios con código legible |
| Modelos de lenguaje open source de proposito general | Transformer/MoE | 1B-70B+ | 4K-128K+ | Apache-2.0, MIT, Llama | Pesos en safetensors/GGUF |

No disponible una comparación técnica con modelos de IA porque el artefacto no es un modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, arquitectura ni pipeline de inferencia; la etiqueta de "modelo" en Hugging Face es engañosa.
- Riesgo de seguridad alto: el repositorio distribuye un ejecutable ofuscado en un ZIP protegido con contraseña, alojado fuera de Hugging Face, e indica ejecutarlo como administrador.
- La documentación sugiere desactivar o ignorar las alertas de Windows Defender y SmartScreen, práctica que elimina la principal barrera de protección del sistema.
- El nombre del binario (`repo-cheat-mod-menu`) no guarda relación con la función declarada (copytrading), lo que indica posible reutilización de un artefacto ajeno.
- Fecha de creación futura (2026-11-24) respecto a la fecha actual: metadatos inconsistentes.
- Cero descargas y cero likes en el momento de la consulta, pese a que la model card afirma "751K+ downloads", contradicción no resuelta.
- Licencia MIT declarada sin código fuente asociado: la cesión de derechos sobre un binario sin fuente es jurídicamente problemática y no permite auditoría.
- El trading de criptoactivos conlleva riesgo de pérdida total del capital; un bot no auditado puede además exfiltrar claves privadas o fondos.
- No debe ejecutarse en entornos de producción ni en máquinas con carteras cripto activas.
- No apto para uso comercial ni personal sin un análisis previo en sandbox aislado y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WakyITA/gmgn-bullx-photon-copytrade-bot
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/RenSiekiera/repo-cheat-mod-menu/releases/download/v1.2.0/repo-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio GitHub citado como alternativo: https://github.com/onurcatalano5862/gmgn-bullx-photon-copytrade-bot/releases/latest
- Paper: no disponible
- Blog o demo oficial: no disponible
