# ZETIC-ai/LFM3-1.7B-IQ9

## Resumen

ZETIC-ai/LFM3-1.7B-IQ9 es un paquete de despliegue del modelo de lenguaje LiquidAI/LFM3-1.7B, empaquetado por ZETIC para ejecutarse en la NPU Hexagon del Qualcomm Dragonwing IQ9 (QCS9075). No se trata de un modelo nuevo ni de un ajuste fino: es una derivacion cuantizada del checkpoint original de Liquid AI, convertida y optimizada para el runtime propietario Ixian Hexagon de ZETIC, accesible a traves del ZeticMLange Hexagon SDK para el Dragonwing IQ9. El modelo base es un transformer de 1,7 mil millones de parametros orientado a chat e instrucciones, y este paquete lo lleva a inferencia local en un SoC de borde.

La relevancia de este artefacto es de infraestructura: demuestra como un modelo de 1,7B puede ejecutarse en una NPU dedicada de un chip de borde, con un contexto por defecto de 2.048 posiciones ampliable hasta 131.072 en el target `v73` (ambos NSP) y hasta 4.096 en `v73-1nsp` (un solo NSP). El paquete incluye dos carpetas de destino segun se quiera ocupar una o las dos unidades de procesamiento neuronal del chip.

El repositorio ocupa 3,5 GB y contiene dos paquetes: `v73/` (2,73 GB, 15 ficheros) y `v73-1nsp/` (1,99 GB, 14 ficheros), con un total declarado de 4,71 GB. Los pesos son una cuantizacion por bloques de 4 bits, pese a la etiqueta "IQ9" del nombre del repositorio, que hace referencia al chip y no al esquema de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); empaquetado para NPU Hexagon del Qualcomm Dragonwing IQ9 |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 posiciones por defecto; hasta 131.072 en `v73` y hasta 4.096 en `v73-1nsp` mediante `LLMOptions::max_context` (CLI `--ctx`) |
| Tipos de cuantizacion | Pesos cuantizados por bloques a 4 bits (derivado convertido del checkpoint original) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (Liquid AI); el SDK se distribuye aparte con su propia licencia |
| Formato de pesos | Paquete propietario de ZETIC (manifest.json, SHA256SUMS, tokenizer, configs y pesos); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es LiquidAI/LFM3-1.7B, un transformer de 1,7B parametros de Liquid AI orientado a chat e instrucciones. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base, no incluida en la informacion proporcionada.

La innovacion tecnica de este artefacto no esta en el entrenamiento sino en el empaquetado: ZETIC convierte el checkpoint original a pesos cuantizados por bloques de 4 bits y los adapta al runtime Ixian Hexagon, que explota la NPU Hexagon del QCS9075. El paquete se ofrece en dos variantes: `v73`, que usa ambas NSP del chip y es la opcion por defecto del SDK, y `v73-1nsp`, que ejecuta el mismo modelo en una sola NSP y deja la otra libre. Segun la validacion del autor, `v73` alcanza una perplejidad dentro del 0,5% de la referencia y soporta chat multi-turno con cache de prefijo; `v73-1nsp` produce logits de prefill identicos para un prompt de 1.024 tokens y los mismos token ids en una respuesta greedy que el paquete de dos NSP.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones (chat).
- Conversacion multi-turno con cache de prefijo, validada en el target `v73`.
- Ejecucion local en NPU de borde, sin dependencia de servicios en la nube.
- Contexto ampliable hasta 131.072 posiciones en `v73` (con coste de memoria, aproximadamente 0,4 GB adicionales a 32.768).
- Seleccion de destino en tiempo de ejecucion: ambos NSP (`v73`) o un solo NSP (`v73-1nsp`) mediante `LLMOptions::target`.
- Verificacion de integridad de los pesos mediante SHA256SUMS.
- Interfaz C++ (`zetic_llm.h`) y herramienta de linea de comandos `zetic_lfm3_cli`.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo gestiona dialogos multi-turno con cache de prefijo dentro de un SoC de borde, lo que permite asistentes de voz o texto sin enviar datos a la nube.
- Procesamiento de lenguaje natural en equipos industriales o de campo: sobre el Dragonwing IQ9, el paquete permite resumir, clasificar o extraer informacion de textos locales en entornos sin conectividad.
- Chatbot embebido en kioscos o terminales de atencion: con 2.048 posiciones de contexto por defecto y hasta 131.072 en `v73`, puede manejar conversaciones largas y documentos de referencia extensos.
- Analisis de documentos en el borde: la ventana ampliada permite procesar contratos, informes o manuales tecnicos localmente, manteniendo la confidencialidad del contenido.
- Prototipado de aplicaciones de IA en hardware Qualcomm: el SDK y la CLI permiten validar rapidamente el rendimiento de un LLM de 1,7B en la NPU antes de integrarlo en un producto.
- Reparto de cargas en el chip: con `v73-1nsp` se puede reservar una NSP para el LLM y dejar la otra para otras tareas de vision o senal, util en dispositivos con multiples flujos de inferencia.
- Generacion de respuestas en asistentes de atencion al cliente en tiendas o puntos de venta, con latencia local y sin coste por token de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perplejidad del paquete `v73`, que se situa dentro del 0,5% de la referencia, y la equivalencia exacta de logits y tokens entre `v73-1nsp` y `v73` en las pruebas de validacion descritas.

## Requisitos de hardware

- Hardware objetivo exclusivo: Qualcomm Dragonwing IQ9 (QCS9075), con Qualcomm Linux sobre linux-arm64. No se ejecuta en otras plataformas.
- Memoria: el paquete `v73` ocupa 2,73 GB y `v73-1nsp` 1,99 GB; el contexto ampliado anade aproximadamente 0,4 GB a 32.768 posiciones.
- NPU: `v73` usa ambas NSP del chip; `v73-1nsp` usa una sola y libera la otra.
- GPU: no aplica; el modelo no esta pensado para GPU de escritorio ni centro de datos.
- Despliegue: ZeticMLange Hexagon SDK para el Dragonwing IQ9 (libreria, cabeceras, herramientas de linea de comandos y libreria DSP Hexagon), distribuido en GitHub. No se soportan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma |
|---|---|---|---|---|
| ZETIC-ai/LFM3-1.7B-IQ9 | 1,7B | 2.048 por defecto; hasta 131.072 (`v73`) / 4.096 (`v73-1nsp`) | LFM Open License v1.0 | NPU Hexagon del Dragonwing IQ9 |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible en la informacion proporcionada | LFM Open License v1.0 | GPU/CPU genericas (safetensors) |
| Otros empaquetados de borde para NPU Hexagon | No disponible | No disponible | No disponible | NPU Hexagon |

La comparativa con alternativas de la misma categoria (modelos de 1,7B para borde) no puede completarse con los datos disponibles: no se dispone de informacion sobre otros paquetes comparables ni sobre sus especificaciones.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en el Qualcomm Dragonwing IQ9 (QCS9075) con Qualcomm Linux; no es portable a otras plataformas.
- Dependencia del SDK propietario de ZETIC, distribuido por separado en GitHub y con su propia licencia.
- Los pesos no son los originales: son una derivacion convertida y cuantizada por bloques de 4 bits, por lo que puede haber diferencias de calidad respecto al checkpoint de Liquid AI.
- El contexto por defecto es de solo 2.048 posiciones; ampliarlo consume memoria adicional y la ampliacion maxima varia segun el target (131.072 en `v73`, 4.096 en `v73-1nsp`).
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue sin validacion propia.
- Riesgo de alucinacion inherente a un modelo de 1,7B, agravado por la cuantizacion a 4 bits; no se recomienda para tareas de alta precision sin verificacion.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial o a la redistribucion; es necesario leer el texto completo antes de desplegar en produccion.
- El repositorio no incluye el SDK, por lo que no es autosuficiente: sin el SDK no se puede ejecutar el modelo.
- No se documentan capacidades de tool calling, agentes ni vision, lo que limita su uso en pipelines agenticos.

## Enlaces

- Hugging Face: https://huggingface.co/ZETIC-ai/LFM3-1.7B-IQ9
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revision del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/40ebe0aa6662c9d40389c2f5d565b6a2c6aebacd
- SDK (GitHub): https://github.com/zetic-ai/IxianHexagon
- Licencia: fichero LICENSE incluido en el repositorio
