# Tileward-Inc/Tileward-Kimi-K3-TWX2.5

## Resumen

Tileward-Kimi-K3-TWX2.5 es una compresión del modelo Kimi K3 de Moonshot AI, un transformer de 2,8 billones de parámetros (2,8T), desarrollada por Tileward Inc. La compresión reduce el peso en disco de 1.560,9 GB a 1.007,9 GB, un 35% menos (factor 1,5x), manteniendo los pesos ya almacenados en 4 bits. Según el autor, la pérdida de rendimiento en MMLU (5-shot) es de apenas 0,6 puntos respecto al original (90,5 frente a 91,1).

La relevancia de esta build radica en que permite servir un modelo de escala frontier con un 33,6% menos de memoria por tarjeta (127,3 GiB frente a 191,7 GiB en una configuración de ocho GPU), lo que se traduce en una caché KV considerablemente mayor: 3.945.603 tokens frente a 1.467.558 al reservar el 90% de cada tarjeta para caché. Es, por tanto, una opción orientada a despliegues de inferencia de alto contexto sobre hardware existente.

El modelo no publica pesos en Hugging Face; se distribuye bajo solicitud a través de Tileward, con acceso vía API compatible con OpenAI. La licencia hereda la del modelo base (kimi-k3), por lo que las restricciones de uso comercial dependen de los términos de Moonshot AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Kimi K3; detalles internos no disponibles) |
| Parametros totales | 2,8 billones (2,8T) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la caché medida soporta 3.945.603 tokens al 90% de 8 tarjetas) |
| Tipos de cuantizacion | Pesos almacenados en 4 bits (build TWX2.5); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (other), heredada de moonshotai/Kimi-K3 |
| Formato de pesos | no disponible (no se publican pesos; acceso bajo solicitud) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Kimi K3 más allá de su escala (2,8T parámetros) y de que Tileward aplica una compresión con cuantización a 4 bits que reduce el tamaño en disco un 35%. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovación técnica documentada por Tileward es el esquema de compresión TWX2.5, que mantiene los pesos en 4 bits y logra un 88,6% de coincidencia en la predicción de siguiente token respecto al original. En la evaluación comparativa de una sesión sobre ocho tarjetas, la tasa de hechos inventados al redactar documentos baja del 1,0% (original) al 0,9% (TWX2.5), y la precisión en llamadas a herramientas sobre 600 pruebas es de 596/595 (bajo/alto esfuerzo de razonamiento) frente a 598/597 del original.

## Capacidades

- Generación de texto y razonamiento de propósito general a escala frontier.
- Llamadas a herramientas (tool calling / function calling): 596 de 600 llamadas correctas con esfuerzo de razonamiento bajo y 595 de 600 con esfuerzo alto, según mediciones del autor.
- Modos de razonamiento configurables (low / high thinking effort), según la tabla de evaluación de tool calls.
- Redacción de documentos con baja tasa de alucinación declarada (0,9% de hechos inventados).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el soporte de tool calling es un indicio de uso agéntico.

## Casos de uso

- Inferencia de alto contexto sobre hardware existente: con 127,3 GiB por tarjeta en ocho GPU, la caché al 90% admite 3.945.603 tokens, lo que permite procesar documentos extensos o conversaciones muy largas sin reconfigurar el clúster.
- Atención al cliente automatizada: el soporte de tool calling verificado (596/600 llamadas correctas) permite integrar el modelo en flujos que consultan sistemas internos, gestionan pedidos o escalan incidencias.
- Generación de documentación técnica: la tasa de hechos inventados del 0,9% en redacción de documentos lo hace adecuado para resúmenes, informes y extracción de datos donde la fidelidad factual es crítica.
- Pipelines agénticos con razonamiento multi-paso: los modos de esfuerzo de razonamiento permiten ajustar coste y latencia según la complejidad de la tarea dentro de un mismo despliegue.
- Migración desde Kimi K3 sin reentrenar: al mantener un 88,6% de coincidencia en la siguiente palabra y una diferencia de 0,6 puntos en MMLU, sirve como sustituto directo en infraestructuras que no pueden alojar los 1.560,9 GB del original.
- Evaluación y prototipado vía API: el endpoint compatible con OpenAI en `https://api.tileward.com/v1` con 25 dólares de crédito inicial permite validar el modelo antes de comprometer hardware propio.
- Despliegue en clústeres de ocho GPU con memoria limitada: la reducción de 191,7 GiB a 127,3 GiB por tarjeta libera margen para otras cargas o para aumentar el tamaño de lote.

## Benchmarks y rendimiento

| Modelo | Tamano en disco | MMLU (5-shot) |
|---|---|---|
| Kimi K3 (original de Moonshot) | 1.560,9 GB | 91,1 |
| Tileward Kimi K3 TWX3 | 1.178,1 GB | 90,9 |
| Tileward Kimi K3 TWX2.5 | 1.007,9 GB | 90,5 |

| Métrica comparativa (una sesión, ocho tarjetas) | Kimi K3 | TWX2.5 |
|---|---|---|
| Hechos inventados al redactar (menor es mejor) | 1,0% | 0,9% |
| Tool calls correctas de 600 (esfuerzo bajo / alto) | 598 / 597 | 596 / 595 |
| Coincidencia de siguiente palabra con el original | – | 88,6% |
| Carga por tarjeta | 191,7 GiB | 127,3 GiB |
| Tokens de caché al 90% de cada tarjeta | 1.467.558 | 3.945.603 |

El resultado de MMLU (90,5, accuracy) figura en el model-index con `verified: false`, es decir, declarado por el autor y no verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: 1.007,9 GB de pesos totales; en la configuración de referencia de ocho tarjetas, 127,3 GiB cargados por tarjeta.
- GPU recomendadas: la evaluación se realizó en ocho tarjetas, sin que se especifique el modelo exacto; por el volumen de memoria por tarjeta (127,3 GiB) se requiere hardware de clase H100/H200 o superior con 141 GB o más por GPU.
- No cabe en GPU de consumo: los 127,3 GiB por tarjeta exceden la VRAM de cualquier RTX (máximo 24 GB en RTX 4090) y de las soluciones de consumo actuales.
- Opciones de despliegue: API compatible con OpenAI en `https://api.tileward.com/v1`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y los pesos no se publican.
- Latencia y throughput: no disponibles; solo se documenta la capacidad de caché KV (3.945.603 tokens al 90% de cada tarjeta en ocho GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Kimi-K3-TWX2.5 | 2,8T | 1.007,9 GB | 90,5 | kimi-k3 (other) | Bajo solicitud + API |
| Kimi K3 (Moonshot AI) | 2,8T | 1.560,9 GB | 91,1 | kimi-k3 | Pesos publicados en HF |
| Tileward-Kimi-K3-TWX3 | 2,8T | 1.178,1 GB | 90,9 | kimi-k3 (other) | Bajo solicitud |

No se dispone de datos de benchmarks ni especificaciones de otros modelos de escala comparable en la información proporcionada, por lo que la comparativa se limita a las tres builds de Kimi K3 documentadas por el autor.

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face: el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que limita la inspección, auditoría y despliegue autónomo.
- El resultado de MMLU (90,5) está marcado como no verificado (`verified: false`); procede del propio autor de la compresión.
- La compresión introduce una divergencia del 11,4% en la predicción de siguiente palabra respecto al original (88,6% de coincidencia), con impacto potencial en tareas sensibles a la formulación exacta.
- No se documentan los idiomas soportados, los sesgos conocidos ni las limitaciones de contexto del modelo base.
- La licencia `kimi-k3` es de tipo "other": las condiciones para uso comercial dependen del texto de la licencia de Moonshot AI y no se resumen en la información disponible.
- Los datos de tool calling y alucinación provienen de una única sesión de evaluación sobre ocho tarjetas; no se especifican protocolos de repetibilidad ni intervalos de confianza.
- El tamaño de 1.007,9 GB impide cualquier despliegue en hardware de consumo y exige clústeres multi-GPU de gama alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3-TWX2.5
- Modelo base Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Build TWX3: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3-TWX3
- Investigación (compresión de Kimi K3): https://tileward.com/research/a-smaller-kimi-k3/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-k3
- Investigación de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- API y acceso: https://app.tileward.com/?join=explore
- Reserva de reunión con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
