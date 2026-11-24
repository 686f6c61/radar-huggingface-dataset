# tristan21690/bybit-binance-perp-copytrade-bot-unlocked

## Resumen

El repositorio `tristan21690/bybit-binance-perp-copytrade-bot-unlocked` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como ejecutable para Windows x64 (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que se presenta como un bot de copytrading para futuros perpetuos en Bybit y Binance. No hay pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje o multimodal.

La model card no describe ninguna arquitectura neuronal, conjunto de datos de entrenamiento ni proceso de ajuste. El contenido se limita a instrucciones de descarga, descompresión con contraseña y ejecución como administrador, junto con una lista de supuestos módulos funcionales (enrutamiento de órdenes, bóveda de claves AES-256, filtro de honeypots, motor de bundles Jito/MEV, copytrading de smart money). Ninguno de estos elementos constituye un modelo evaluable en el sentido técnico del término.

Desde la perspectiva de un catálogo de modelos open source, esta ficha no puede ofrecer especificaciones de parámetros, contexto, cuantización ni benchmarks porque no existen. Además, el patrón de distribución (binario cerrado con contraseña, ejecución como administrador, enlaces a un repositorio de GitHub ajeno al autor declarado) es característico de campañas de malware o de software no verificado, por lo que se recomienda precaución extrema y no ejecutar el artefacto en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, transformer, MoE, SSM ni híbrida. El repositorio no incluye pesos, tokenizador, ficheros `config.json`, `safetensors`, GGUF ni ningún artefacto propio de un modelo entrenado. Tampoco se documenta ningún corpus de entrenamiento, número de tokens, proceso de RLHF/DPO ni innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

El único contenido técnico declarado son módulos funcionales de un supuesto bot de trading: enrutamiento de órdenes con latencia inferior a 40 ms vía WebSocket y gRPC, bóveda local de claves AES-256, filtro de honeypots, motor de bundles Jito/MEV, take profit multinivel y copytrading de wallets. Estas afirmaciones no van acompañadas de código fuente verificable, auditoría ni artefactos reproducibles, por lo que no pueden considerarse especificaciones técnicas contrastadas.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en un modelo generativo.
- No tiene capacidades multilingües derivadas de un modelo; los idiomas listados son metadatos del repositorio.
- No dispone de modo de pensamiento (thinking), visión, audio ni multimodalidad.
- El artefacto declarado es un ejecutable de Windows que, según la model card, implementaría lógica de trading (enrutamiento de órdenes, gestión de claves, filtros de tokens, copytrading), sin verificación independiente.

## Casos de uso

- No aplica como modelo de IA en pipelines de generación de texto, RAG, agentes o análisis de datos.
- No aplica como modelo de código en asistentes de programación ni en CI/CD.
- No aplica como modelo multimodal para visión, audio o documentos.
- No aplica como modelo de razonamiento para matemáticas, lógica o planificación.
- No aplica como modelo de embeddings ni de reranking.
- Cualquier uso del ejecutable distribuido como supuesto bot de trading conlleva riesgos de seguridad y financieros no verificables; no se recomienda su despliegue en producción ni en entornos con credenciales reales de exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay modelo que cargar en GPU.
- No requiere GPU (A100, H100, RTX 4090) para su función declarada; el artefacto es un ejecutable de Windows x64.
- No cabe en el concepto de "consumer GPU": no es un modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles, no aplican.
- Latencia y throughput de inferencia: no disponibles; la model card menciona cifras de latencia para módulos de trading (sub-40 ms, 189 Hz de polling, menos de 29 ms de respuesta), sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Las alternativas reales para las tareas que declara cubrir (trading algorítmico, copytrading) serían software especializado con código auditable, no modelos de lenguaje.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha se incluye únicamente por completitud del catálogo.
- Distribución mediante binario cerrado con contraseña (`2026`) y ejecución "como administrador": patrón habitual en campañas de malware.
- Enlaces de descarga apuntan a un repositorio de GitHub (`schneider6972/solara-executor-v3-keyless-2026`) distinto del autor declarado en Hugging Face (`tristan21690`), lo que impide verificar la cadena de custodia.
- La model card mezcla nombres de proyecto (`solara-executor`, `DeborahHolland99/...`) incoherentes con el ID del repositorio, señal típica de contenido generado o reempaquetado.
- Licencia MIT declarada en metadatos, pero sin fichero LICENSE verificable ni código fuente asociado.
- Riesgo financiero: cualquier supuesto bot de trading que opere con claves reales de exchange puede provocar pérdidas; no hay auditoría ni garantías.
- Riesgo de seguridad: ejecutar binarios no verificados como administrador puede comprometer el sistema y las credenciales.
- No usar en producción, ni con claves de API de exchange, ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tristan21690/bybit-binance-perp-copytrade-bot-unlocked
- Repositorio de GitHub referenciado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/DeborahHolland99/bybit-binance-perp-copytrade-bot-unlocked
- Enlace de descarga del ZIP citado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
