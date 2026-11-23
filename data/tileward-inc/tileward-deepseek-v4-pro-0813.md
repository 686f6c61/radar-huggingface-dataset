# Tileward-Inc/Tileward-DeepSeek-V4-Pro-0813

## Resumen

Tileward-DeepSeek-V4-Pro-0813 es una versión comprimida del modelo DeepSeek-V4-Pro-0813 de DeepSeek, publicada por Tileward-Inc bajo licencia MIT. Tileward ha aplicado su esquema de compresión propietario TWX3 para reducir el peso en disco del modelo original de 892,7 GB a 675,2 GB, es decir, un 24 % menos (factor de compresión de 1,3x), manteniendo una precisión en MMLU (5-shot) de 89,6 frente a los 90,0 del original, una diferencia de medio punto. El modelo base ya se distribuía mayoritariamente en 4 bits, por lo que la compresión opera sobre pesos ya cuantizados.

El modelo es relevante porque demuestra que es posible reducir sustancialmente el espacio en disco y la huella por tarjeta (de 108,9 GiB a 83,5 GiB cargado por GPU en un despliegue de ocho tarjetas) sin degradar capacidades clave como el uso de herramientas (1.200 de 1.200 llamadas correctas) o la recuperación de información en contextos de hasta 1.040.000 tokens (80 de 80 hechos ocultos encontrados). La tasa de alucinación medida sube ligeramente del 1,8 % al 1,9 %.

No obstante, los pesos no están publicados en Hugging Face: el acceso es solo bajo petición mediante reunión con un ingeniero de Tileward, y la plataforma ofrece una API compatible con OpenAI. La información pública sobre arquitectura interna, número de parámetros y composición del dataset de entrenamiento no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4-Pro; arquitectura interna no publicada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; se han validado recuperaciones de hechos hasta 1.040.000 tokens |
| Tipos de cuantizacion | TWX3 (esquema propietario de Tileward, sobre pesos ya mayoritariamente en 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible; los pesos no se publican en Hugging Face (acceso bajo peticion) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base DeepSeek-V4-Pro-0813 (tipo de transformer, uso de MoE, atencion lineal u otras innovaciones). Lo que si se documenta es el proceso de compresion: Tileward aplica su esquema TWX3 sobre los pesos del modelo original, que ya se distribuian mayoritariamente en 4 bits, logrando un 24 % de reduccion en tamano (892,7 GB a 675,2 GB) con una perdida de 0,4 puntos en MMLU 5-shot. La compresion tambien reduce la memoria cargada por tarjeta en un despliegue de ocho GPU, de 108,9 GiB a 83,5 GiB, lo que permite almacenar mas tokens en la cache KV (de 5.707.924 a 6.942.711 tokens al 90 % de ocupacion por tarjeta).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La concordancia de siguiente palabra con el original es del 87,6 %, lo que indica una fidelidad alta pero no total respecto al comportamiento del modelo sin comprimir.

## Capacidades

- Generacion de texto y razonamiento general, con una precision de 89,6 en MMLU (5-shot) segun el autor.
- Uso de herramientas (tool calling / function calling): 1.200 de 1.200 llamadas correctas en la evaluacion del autor.
- Recuperacion de informacion en contextos muy largos: 80 de 80 hechos ocultos encontrados hasta 1.040.000 tokens.
- Redaccion de documentos con baja tasa de invencion de datos: 1,9 % de hechos inventados (frente al 1,8 % del original).
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo thinking: no disponible en la informacion proporcionada.
- API compatible con OpenAI en `https://api.tileward.com/v1` para integracion directa.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo, ya que se ha validado la recuperacion de hechos hasta 1.040.000 tokens, lo que permite mantener historiales extensos y documentacion de referencia en la misma ventana.
- Generacion de codigo en produccion: el soporte de tool calling con 1.200 de 1.200 llamadas correctas lo hace adecuado para pipelines de CI/CD que invocan funciones externas (ejecucion de tests, consulta de repositorios, despliegues).
- Analisis de documentacion extensa: la baja tasa de invencion de hechos (1,9 %) y la recuperacion fiable en contextos millonarios permiten resumir contratos, informes o expedientes largos con trazabilidad.
- Agentes multi-paso: la fiabilidad en llamadas a herramientas y la coherencia de siguiente palabra (87,6 % respecto al original) lo hacen util para flujos de agentes que encadenan acciones.
- Despliegue en infraestructura limitada: la reduccion de 108,9 GiB a 83,5 GiB por tarjeta en ocho GPU permite ejecutar el modelo en clusters con menos memoria por nodo o liberar capacidad para cache KV adicional.
- Servicio gestionado via API: para equipos que no quieren gestionar infraestructura, la API compatible con OpenAI con 25 dolares de credito inicial permite prototipar sin tarjeta de credito.
- Investigacion y evaluacion comparativa: util para estudiar el impacto de la compresion de pesos en capacidades de razonamiento, tool calling y recuperacion en contexto largo.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | DeepSeek-V4-Pro | Tileward TWX3 |
|---|---|---|
| MMLU (5-shot) | 90,0 | 89,6 |
| Tamano en disco | 892,7 GB | 675,2 GB |
| Memoria cargada por tarjeta (8 GPU) | 108,9 GiB | 83,5 GiB |
| Tokens en cache KV (90 % por tarjeta) | 5.707.924 | 6.942.711 |
| Hechos inventados al redactar documentos (menor es mejor) | 1,8 % | 1,9 % |
| Llamadas a herramientas correctas (de 1.200) | 1.200 | 1.200 |
| Hechos ocultos encontrados (de 80, hasta 1.040.000 tokens) | 80 | 80 |
| Concordancia de siguiente palabra con el original | – | 87,6 % |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el despliegue documentado ocupa 83,5 GiB por tarjeta en una configuracion de ocho GPU. No se dispone de estimaciones para configuraciones menores.
- GPU recomendadas: el autor menciona un despliegue en ocho tarjetas sin especificar modelo; por la memoria por tarjeta (83,5 GiB) encajan GPU de 80 GB o superior, como A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: no disponible; con 83,5 GiB por tarjeta en el despliegue de referencia, no cabe en GPU de consumo convencionales (24 GB o menos) sin una cuantizacion adicional no documentada.
- Opciones de despliegue: API gestionada de Tileward compatible con OpenAI; no se documentan opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) ni se publican pesos para ello.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-DeepSeek-V4-Pro-0813 (TWX3) | no disponible | hasta 1.040.000 tokens validados | 89,6 | MIT | Bajo peticion / API |
| DeepSeek-V4-Pro-0813 (original) | no disponible | no disponible | 90,0 | MIT | Pesos publicos en Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base sin comprimir. No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no estan publicados en Hugging Face; el acceso requiere solicitar una reunion con un ingeniero de Tileward, lo que limita la reproducibilidad y la auditoria independiente.
- Los resultados de MMLU y del resto de metricas estan declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluacion independiente.
- La tasa de alucinacion sube del 1,8 % al 1,9 % respecto al original, una degradacion pequena pero presente.
- La concordancia de siguiente palabra con el original es del 87,6 %, por lo que el comportamiento no es identico al modelo sin comprimir en todas las entradas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni limitaciones de contexto oficiales.
- La licencia MIT del modelo base se mantiene, pero conviene verificar las condiciones de uso comercial de la API y del acceso bajo peticion en los terminos de Tileward.
- El esquema TWX3 es propietario; no se documenta su compatibilidad con herramientas de inferencia estandar, lo que puede dificultar la portabilidad.
- La fecha de creacion del repositorio (2026-11-16) y la ausencia de descargas o likes sugieren un modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-DeepSeek-V4-Pro-0813
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813/blob/main/LICENSE
- Investigacion de Tileward sobre la compresion: https://tileward.com/research/a-smaller-deepseek-v4-pro/
- Metodologia de evaluacion: https://tileward.com/evals/#compressed-model-dsv4-pro
- Investigacion de Tileward: https://tileward.com/research/
- Plataforma y API: https://app.tileward.com/?join=explore
- Web de Tileward: https://tileward.com
- Reserva de reunion con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
