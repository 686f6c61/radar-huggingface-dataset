# Tileward-Inc/Tileward-GLM-5.3-Flash-TWX4

## Resumen
Tileward-GLM-5.3-Flash-TWX4 es una compresion del modelo GLM-5.3-Flash-BF16 de Z.ai, realizada por Tileward Inc. mediante su formato propietario TWX4. El modelo base es un transformer de tipo mixture-of-experts (MoE) orientado a generacion de texto, y esta version comprimida reduce el peso en disco de 642,65 GB (16 bits) a 205,09 GB, un 68 % menos (factor 3,13x), manteniendo un 87,3 % de acuerdo en prediccion de siguiente palabra respecto al original de 16 bits sobre 16.352 posiciones evaluadas.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion agresiva (TWX4) aplicada a un modelo MoE de gran tamano; por otro, advierte de una limitacion fundamental para su evaluacion practica: los pesos no estan publicados en el repositorio de Hugging Face. El autor indica explicitamente que para hablar de esta build hay que reservar una reunion con un ingeniero, lo que impide su descarga y uso directo.

La licencia declarada es MIT, heredada del modelo base, pero la ausencia de pesos publicados hace que esa licencia sea inaplicable en la practica hasta que el autor distribuya los ficheros. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas soportados en la informacion proporcionada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer (segun tags del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TWX4 (formato propietario de Tileward, 4 bits); existe tambien una build TWFP4 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos no publicados en el repositorio) |

## Arquitectura y entrenamiento
El modelo base, zai-org/GLM-5.3-Flash-BF16, es un transformer de tipo mixture-of-experts segun la etiqueta `moe` del repositorio, distribuido originalmente en BF16 con un peso de 642,65 GB. Z.ai publica ademas una version en FP8 de 328,3 GB. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta build es el esquema de compresion TWX4 de Tileward, que reduce el modelo a 205,09 GB. Segun la model card, el rendimiento en prediccion de texto es practicamente identico al de la build TWFP4 del mismo autor (204,45 GB): 87,3 % de acuerdo con el original de 16 bits para TWX4 frente a 88,8 % para TWFP4, medido sobre 16.352 posiciones de prediccion de siguiente palabra con 32 pasajes de entrada. El autor afirma que la build mantiene el nivel del original en la evaluacion DeepSWE, aunque no se aportan los numeros concretos en la informacion disponible.

## Capacidades
- Generacion de texto: el pipeline declarado es `text-generation`.
- Razonamiento y codigo: el material de investigacion del autor menciona evaluacion en DeepSWE, un benchmark de tareas de ingenieria de software, lo que sugiere capacidades de codigo y agentes, aunque no se detallan resultados numericos.
- Capacidades MoE: al ser un modelo de mezcla de expertos, se espera un coste de inferencia proporcional a los parametros activos y no a los totales, aunque no se dispone de la cifra de parametros activos.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; la referencia a DeepSWE apunta a uso en tareas de agente de codigo.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso
- Despliegue de un modelo MoE de gran tamano en infraestructura con VRAM limitada: la reduccion a 205,09 GB frente a los 642,65 GB del original permite alojar el modelo en nodos multi-GPU mas modestos, siempre que el autor facilite los pesos.
- Evaluacion de tecnicas de cuantizacion: util como referencia para comparar TWX4 frente a FP8 (328,3 GB) y BF16 (642,65 GB) en terminos de calidad de prediccion y huella en disco.
- Generacion de codigo en pipelines de CI/CD: la mencion a DeepSWE sugiere idoneidad para tareas de ingenieria de software, aunque la falta de pesos publicados impide validarlo de forma independiente.
- Servicio de generacion de texto autoalojado: al ser un modelo `text-generation` con licencia MIT, encaja en despliegues internos de completado y redaccion, sujeto a la disponibilidad efectiva de los pesos.
- Investigacion sobre compresion de modelos MoE: el par TWX4/TWFP4 del mismo autor ofrece un caso de estudio controlado sobre el impacto de distintos esquemas de cuantizacion de 4 bits.
- Prototipado de asistentes conversacionales: el modelo base GLM-5.3-Flash esta disenado para generacion de texto conversacional, por lo que esta build podria emplearse en ese escenario una vez obtenidos los pesos.

## Benchmarks y rendimiento
| Metrica | TWX4 | TWFP4 | Original 16 bits |
|---|---|---|---|
| Tamano en disco | 205,09 GB | 204,45 GB | 642,65 GB |
| Acuerdo de siguiente palabra con el original (16.352 posiciones) | 87,3 % | 88,8 % | referencia |
| DeepSWE | nivel del original (sin cifras publicadas) | no disponible | referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 205,09 GB de pesos en TWX4, se necesita un minimo teorico de unos 206 GB de VRAM solo para los pesos, mas memoria para el contexto y el estado de inferencia; en la practica, un nodo de 8x H100 de 80 GB (640 GB) o 4x H200 de 141 GB resulta holgado.
- GPU recomendadas: H100 SXM de 80 GB en configuracion multi-GPU, H200, o A100 de 80 GB en nodos de 4 a 8 unidades.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en configuraciones multi-GPU de consumo realistas.
- Opciones de despliegue: no disponible; al no publicarse los pesos ni el formato exacto, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Tileward-GLM-5.3-Flash-TWX4 | no disponible (MoE) | no disponible | 205,09 GB | MIT | No publicados |
| Tileward-GLM-5.3-Flash (TWFP4) | no disponible (MoE) | no disponible | 204,45 GB | MIT | No publicados |
| GLM-5.3-Flash FP8 (Z.ai) | no disponible (MoE) | no disponible | 328,3 GB | MIT | Publicados por Z.ai |
| GLM-5.3-Flash-BF16 (Z.ai) | no disponible (MoE) | no disponible | 642,65 GB | MIT | Publicados por Z.ai |

## Limitaciones y advertencias
- Los pesos no estan publicados en el repositorio de Hugging Face; el autor remite a una reunion con un ingeniero para hablar de la build. Esto impide su descarga, evaluacion y uso en produccion.
- La licencia MIT declarada no es operativa mientras no se distribuyan los ficheros del modelo.
- El acuerdo de siguiente palabra del 87,3 % frente al original implica que aproximadamente 1 de cada 8 predicciones difiere del modelo de 16 bits; en tareas sensibles a la fidelidad esto puede acumular divergencias.
- No hay datos publicados sobre sesgos, tasas de alucinacion, idiomas soportados ni comportamiento en contextos largos.
- No se dispone de cifras de parametros totales ni activos, lo que impide estimar con precision el coste computacional por token.
- El formato TWX4 es propietario de Tileward; no se confirma compatibilidad con runtimes de inferencia estandar.
- La fecha de creacion del repositorio (2026-11-16) y la ausencia de descargas y likes indican que la build es muy reciente y sin validacion externa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-GLM-5.3-Flash-TWX4
- Build TWFP4 del mismo autor: https://huggingface.co/Tileward-Inc/Tileward-GLM-5.3-Flash
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Web de Tileward: https://tileward.com
- Investigacion sobre la compresion: https://tileward.com/research/a-smaller-coding-agent/
- Metodologia de evaluacion: https://tileward.com/evals/#compressed-model-glm
- Repositorio de investigacion de Tileward: https://tileward.com/research/
- Reserva de reunion con el autor: https://calendar.app.google/hg2DzFTxKJgwFWm19
