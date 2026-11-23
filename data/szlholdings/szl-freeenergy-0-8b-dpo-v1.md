# SZLHOLDINGS/SZL-FreeEnergy-0.8B-DPO-v1

## Resumen

SZL-FreeEnergy-0.8B-DPO-v1 es un modelo de generacion de texto de 873 millones de parametros publicado por SZLHOLDINGS, un fondo de modelos y artefactos de IA que opera bajo lo que denomina "governed-AI estate": un conjunto de repositorios con trazabilidad de origen y resultados verificables. El modelo parte de un checkpoint base propio (SZL-FreeEnergy-0.8B-v1) y se ha afinado mediante DPO (Direct Preference Optimization), una tecnica de alineacion que ajusta las preferencias de respuesta sin necesidad de un modelo de recompensa separado.

La relevancia del modelo no reside en su rendimiento bruto, sino en su propuesta de gobernanza: la model card declara explicitamente que cualquier cifra de calidad o capacidad no medida se etiqueta como UNKNOWN, y que las afirmaciones de entrenamiento o evaluacion viven en ficheros de "recibos" (receipts) auditables. No obstante, el escaneo estricto de receipts de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, contiene ficheros con nombre de recibo pero no supera el umbral estricto de evidencia medida.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 1,8 GB y arquitectura etiquetada como qwen3_5 en Hugging Face. Solo declara soporte para ingles y no publica resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder-only, segun tag de Hugging Face) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se corresponde con la familia qwen3_5, segun la etiqueta declarada en el repositorio de Hugging Face, lo que implica un transformer decoder-only. El modelo tiene 873.438.784 parametros totales, verificados a partir de los tensores en safetensors, y un tamano de repositorio de 1,8 GB, coherente con pesos en precision de 16 bits. No se especifican en la informacion disponible la longitud de contexto nativa, el numero de capas, la dimension oculta ni la configuracion de atencion.

El entrenamiento consta de dos fases: un checkpoint base (SZL-FreeEnergy-0.8B-v1) y un afinamiento posterior mediante DPO, que optimiza directamente sobre pares de preferencias. La model card no detalla el volumen de tokens de preentrenamiento, la composicion del dataset de preferencias, ni si hubo fases adicionales de SFT o RLHF. La informacion de entrenamiento se remite a ficheros de receipts, y el escaneo estricto de noviembre de 2026 no encuentra un DONE.json con estado MEASURED, por lo que la evidencia de evaluacion se marca como UNKNOWN.

## Capacidades

- Generacion de texto en ingles, tarea declarada en el pipeline text-generation.
- Afinamiento por preferencias (DPO) orientado a alinear el estilo y la utilidad de las respuestas, aunque sin evidencia medida publicada.
- No se declara soporte de tool calling ni function calling en la informacion disponible.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue mas alla del ingles.
- No se declara vision, audio ni modo de razonamiento explicito (thinking mode).
- No se publican capacidades especificas de codigo o matematicas.

## Casos de uso

- Experimentacion con alineacion por DPO: el modelo sirve como caso de estudio reproducible de un pipeline base + DPO en un tamano de 0,8B, util para investigadores que quieran comparar checkpoints antes y despues del afinamiento.
- Prototipado de generacion de texto en ingles en entornos con recursos limitados: con 873M de parametros y pesos safetensors de 1,8 GB, cabe en GPU de consumo y permite iterar rapidamente en tareas de completion y redaccion breve.
- Evaluacion de gobernanza y trazabilidad de artefactos: el repositorio incorpora receipts y un esquema de etiquetado MEASURED/REPORTED/UNKNOWN que puede usarse como referencia para disenar pipelines de auditoria de modelos.
- Fine-tuning adicional sobre dominios concretos: al ser un modelo pequeno con licencia Apache 2.0, es adecuado como punto de partida para SFT en tareas especificas en ingles sin restricciones de uso comercial.
- Generacion aumentada por recuperacion (RAG) en ingles: el modelo puede integrarse como generador en pipelines RAG ligeros, siempre que se valide su calidad con evaluaciones propias dado que no hay benchmarks publicados.
- Despliegue en entornos de borde o CPU: su tamano permite servir el modelo con llama.cpp u Ollama tras conversion a GGUF, aunque el autor no publica variantes cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de receipts clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json en el umbral estricto).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2,5 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente en FP16; tambien cabe en GPUs de gama de entrada y en CPU.
- Cabe en GPU consumer: si, en todas las GPU con 4 GB o mas de VRAM en FP16.
- Opciones de despliegue: transformers (libreria declarada), y previsiblemente vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF, aunque el autor no publica artefactos de cuantizacion.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| SZL-FreeEnergy-0.8B-DPO-v1 | 873M | no disponible | Apache 2.0 | en | no |
| Qwen3 0.6B | 0,6B | no disponible en esta ficha | Apache 2.0 | multilingue | si (familia Qwen3) |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | multilingue | si |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | multilingue | si |

La comparativa se limita a tamano, contexto, licencia y disponibilidad de benchmarks, ya que el modelo de SZLHOLDINGS no publica mediciones que permitan una comparacion de rendimiento. Frente a alternativas como Qwen3 0.6B o Llama 3.2 1B, la diferencia principal es la ausencia de evaluaciones publicadas y el soporte exclusivo de ingles.

## Limitaciones y advertencias

- Ausencia de evidencia medida: el escaneo estricto de receipts clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN; no hay benchmarks ni evaluaciones de calidad verificables.
- Riesgo de alucinacion: sin evaluaciones publicadas, no es posible acotar la tasa de alucinacion ni la fiabilidad factual en produccion.
- Sesgos: no se documentan sesgos conocidos ni la composicion del dataset de preferencias usado en DPO.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Contexto: no se especifica la longitud de contexto nativa, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones traslada al integrador toda la responsabilidad de validacion.
- Gobernanza: la propia model card advierte que las afirmaciones de entrenamiento y evaluacion solo son validas si estan respaldadas por receipts medidos, y en este repositorio no se alcanza ese umbral.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-DPO-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de generacion de cards (referenciado en la model card): https://github.com/szl-holdings/estate-cards
