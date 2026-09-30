# xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

`xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4` es una reempaquetado no oficial del modelo Gemma 4 26B A4B-it QAT de Google DeepMind, publicado por el usuario `xbill9`. Se trata de una version en cuantizacion W4A16 (pesos int4, activaciones de 16 bits) con las tablas de embeddings tambien empaquetadas en int4 y el `lm_head` desatado, distribuida en formato compressed-tensors para su uso exclusivo con vLLM 0.29 o superior. El checkpoint ocupa 13,63 GiB y declara 25.971.339.294 parametros totales.

El modelo subyacente, Gemma 4 26B A4B, es una arquitectura Mixture-of-Experts (MoE) con unos 26.000 millones de parametros totales y aproximadamente 4.000 millones activos, con una ventana de contexto de hasta 256.000 tokens y soporte de mas de 140 idiomas. Google no publica un checkpoint QAT compressed-tensors W4A16 para la variante 26B-A4B, que solo distribuye en Q4_0 GGUF y en una exportacion bf16 de 48 GiB; este repack cubre precisamente ese hueco para despliegues vLLM.

La relevancia de esta ficha es practica: permite servir un MoE de ~26B en una sola GPU consumer gracias a la cuantizacion int4 y al bajo numero de parametros activos, a costa de perder las capacidades multimodales (es una version solo texto) y de depender de un fork de terceros no verificado por Google. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), segun la familia Gemma 4 |
| Parametros totales | 25.971.339.294 (~26B) |
| Parametros activos | Aproximadamente 4B (derivado de la nomenclatura A4B del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | Hasta 256.000 tokens (modelo base Gemma 4) |
| Tipos de cuantizacion | W4A16 (pesos int4 con grupo 32 y activaciones de 16 bits), embeddings en int4 con escalas fp16; el modelo base se ofrece tambien en Q4_0 GGUF y en bf16 |
| Idiomas soportados | Mas de 140 idiomas (modelo base); no verificado en este repack |
| Licencia | gemma |
| Formato de pesos | safetensors en formato compressed-tensors (W4A16), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 26B A4B-it, un transformer con capas de Mixture-of-Experts que combina componentes densos y dispersos. La nomenclatura A4B indica que, de los ~26B parametros totales, solo unos 4B se activan por token, lo que reduce el coste computacional por token frente a un modelo denso de tamano equivalente, manteniendo la capacidad de representacion de los 26B. El modelo base incorpora una ventana de contexto de 256.000 tokens y esta ajustado con instrucciones (sufijo `-it`), ademas de contar con una variante QAT (Quantization-Aware Training) que alinea los pesos con la rejilla de cuantizacion de 4 bits.

Este repack concreto no reentrena ni modifica las capas lineales respecto al repack W4A16 previo (`xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text`); la intervencion se limita a empaquetar la tabla `embed_tokens` en int4 (mismo grupo 32 que las lineales, aprovechando que el QAT ya situo los embeddings en esa rejilla) y a desatar el `lm_head`, almacenandolo con los mismos niveles int4. El proceso se realizo con la herramienta `embed_int4.py` con escalas fp16 por defecto. El resultado: `embed_tokens` pasa de 1,375 GiB en bf16 a 0,387 GiB en int4 mas escalas f16, con 0 grupos fuera de rejilla, el 73,48% de los valores identicos bit a bit y un error maximo de 6,58e-03 respecto al maximo del grupo; las escalas resultantes van de 0,00177 a 0,479. No se dispone de informacion sobre el volumen de tokens, composicion del dataset ni sobre las etapas de RLHF/DPO del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo instruct Gemma 4 26B A4B-it.
- Generacion y asistencia en codigo, segun las capacidades declaradas para la familia Gemma 4.
- Razonamiento matematico y tareas de logica (capacidad declarada a nivel de familia, sin cifras concretas en la informacion disponible).
- Soporte de agentes y flujos de trabajo multi-paso (la familia Gemma 4 se describe como apta para "agentic workflows").
- Multilingue: mas de 140 idiomas en el modelo base.
- Capacidad de contexto largo: hasta 256.000 tokens en el modelo base.
- Tool calling / function calling: no confirmado explicitamente para este repack en la informacion disponible.
- Vision: no soportada. Este repack es explicitamente solo texto, aunque el modelo base Gemma 4 maneja entrada de texto e imagen.
- Modo thinking / audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de texto de proposito general en una sola GPU: al ocupar 13,63 GiB en W4A16, el modelo puede desplegarse en una GPU consumer de 24 GB mediante vLLM, ofreciendo la calidad de un MoE de ~26B con ~4B activos y un coste de computo por token contenido.
- Procesamiento de documentos largos: con hasta 256.000 tokens de contexto, es adecuado para resumir, extraer informacion estructurada o responder preguntas sobre contratos, informes o expedientes extensos en una sola pasada.
- Asistencia multilingue: con mas de 140 idiomas en el modelo base, puede emplearse en atencion al cliente o traduccion asistida en entornos con usuarios de idiomas diversos, siempre que se valide la calidad del repack cuantizado.
- Generacion de codigo en pipelines internos: apto para autocompletado, explicacion y refactorizacion dentro de herramientas de desarrollo, aprovechando el contexto largo para incluir varios ficheros de referencia.
- Razonamiento por lotes (batch offline): para tareas de clasificacion, anotacion o sintesis masiva, la cuantizacion W4A16 reduce el footprint de memoria y permite mayor concurrencia en vLLM sobre hardware modesto.
- Backend de agentes y asistentes multi-paso: la familia Gemma 4 se orienta a flujos agenticos, de modo que este repack puede servir como motor de un asistente conversacional multi-turno, siempre que se verifique el soporte de tool calling en la practica.
- Entornos con requisitos de soberania de datos: al ser un modelo de pesos abiertos bajo licencia Gemma, puede desplegarse on-premise sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo documenta el error de cuantizacion de la tabla de embeddings (73,48% de valores identicos bit a bit, error maximo 6,58e-03 respecto al maximo del grupo, escalas entre 0,00177 y 0,479) y el tamano del checkpoint (13,63 GiB). No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones para este repack ni para el modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM para pesos: 13,63 GiB de checkpoint en W4A16 con embeddings int4; contando el overhead de runtime de vLLM, conviene reservar al menos 14-16 GiB solo para los pesos.
- Reparto de memoria: aunque solo se activan ~4B parametros por token, los ~26B totales deben residir en memoria, por lo que la VRAM minima viene fijada por el tamano completo de los pesos, no por los parametros activos.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 5090) y en GPUs de 16 GB para contextos cortos; los contextos cercanos a 256K requieren mas VRAM por el KV cache y probablemente despliegue multi-GPU o reduccion de la longitud de contexto.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB son opciones holgadas que permiten contextos largos y mayor concurrencia.
- Opciones de despliegue: vLLM 0.29 o superior es un requisito explicito (necesita el soporte `CompressedTensorsEmbeddingWNA16Int`). El formato compressed-tensors/safetensors no es directamente compatible con llama.cpp o Ollama; para esos entornos existe la version GGUF Q4_0 del modelo base publicada en Ollama (`gemma4:26b-a4b-it-qat`).
- Latencia y throughput: no disponible. El uso de ~4B parametros activos por token sugiere un throughput por token mas alto que un denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4 (este) | 25,97B totales, ~4B activos (MoE) | 256K (base) | W4A16 + embeddings int4, compressed-tensors/safetensors para vLLM | gemma | Repack no oficial, 0 descargas |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct | 25,97B totales, ~4B activos (MoE) | 256K (base) | W4A16, compressed-tensors/safetensors para vLLM (embeddings sin empaquetar en int4) | gemma | Repack no oficial, mismo autor |
| google/gemma-4-26B-A4B-it | 25,97B (MoE) | 256K | bf16 (exportacion de 48 GiB) | gemma | Modelo oficial de Google DeepMind |
| gemma4:26b-a4b-it-qat (Ollama) | 25,97B (MoE) | 256K (base) | Q4_0 GGUF | gemma | Distribucion oficial en Ollama |

Nota: la comparacion se apoya en los datos disponibles del modelo base Gemma 4 y de los repacks citados en los resultados de busqueda; no se dispone de cifras de rendimiento comparativas entre estas variantes.

## Limitaciones y advertencias

- Solo texto: este repack elimina el manejo de imagenes que si ofrece el modelo base Gemma 4 (multimodal texto+imagen).
- Version no oficial: no esta validada por Google; el propio autor indica que los problemas deben reportarse al repositorio de xbill9 y no a Google.
- Degradacion por cuantizacion: la tabla de embeddings en int4 conserva el 73,48% de valores identicos bit a bit, con un error maximo de 6,58e-03 respecto al maximo del grupo; puede haber perdida de calidad adicional en las capas lineales por el esquema W4A16, no cuantificada en la informacion disponible.
- Dependencia de version: requiere vLLM 0.29 o superior por el operador `CompressedTensorsEmbeddingWNA16Int`; versiones anteriores no cargaran el checkpoint.
- `lm_head` desatado y almacenado en int4: se modifico el modelo, entrenado originalmente con pesos atados, para que vLLM pueda cargarlo; esto puede introducir diferencias respecto al comportamiento nativo.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google; es necesario revisar las condiciones antes de un despliegue en produccion.
- Idiomas: aunque el modelo base cubre mas de 140 idiomas, no se ha verificado el rendimiento multilingue de este repack concreto.
- Alucinaciones y sesgos: son inherentes al modelo base y no se documentan mitigaciones especificas en este repack.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion por parte de la comunidad.
- Sin benchmarks: no hay resultados publicados que permitan estimar la perdida de calidad frente al modelo bf16 original.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4
- Repack previo sin embeddings int4: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Script de reempaquetado: https://github.com/xbill9/gemma4-dev/blob/main/gpu-vllm-t4-2b-w4a16/repack/embed_int4.py
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo base QAT unquantized: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Version GGUF QAT en Ollama: https://ollama.com/library/gemma4:26b-a4b-it-qat
