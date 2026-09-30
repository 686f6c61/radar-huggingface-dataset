# xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

Este repositorio publica una reempaquetado no oficial del checkpoint QAT de Google `google/gemma-4-E4B-it-qat-q4_0-unquantized`, orientado a inferencia en vLLM con cuantizacion W4A16 (pesos en int4, activaciones en 16 bits) y, como rasgo distintivo, las tablas de embeddings tambien empaquetadas en int4. Lo firma el usuario `xbill9`, no Google, y deriva del repack previo `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct`, al que anade el empaquetado de embeddings en lugar de mantenerlos en bf16. El checkpoint en safetensors declara 8.134.102.058 parametros (~8,13 millardos) y ocupa 4,26 GiB una vez cuantizado, con un repositorio de 4,6 GB.

El modelo pertenece a la familia Gemma 4 de Google DeepMind, que segun la documentacion disponible es multimodal (texto e imagen de entrada) y esta disenada como razonadora con modos de pensamiento configurables. Sin embargo, este reempaquetado concreto es explicitamente **solo texto**: elimina la torre de vision. La relevancia practica reside en la eficiencia: al pasar los pesos y tambien los embeddings a int4 grupo 32, se reduce el peso del checkpoint desde los 5,250 GiB de `embed_tokens_per_layer` en bf16 hasta 1,477 GiB, y `embed_tokens` de 1,250 GiB a 0,352 GiB, manteniendo la coherencia con la rejilla de cuantizacion que dejo el pipeline QAT de Google.

Se trata de un artefacto de nicho, con 0 descargas y 0 likes en el momento de la consulta, pensado para quien despliega Gemma 4 E4B en vLLM sobre GPUs ajustadas de VRAM y puede asumir la perdida de vision y el caracter no oficial del empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 4 con embeddings por capa (`embed_tokens_per_layer`); no es MoE |
| Parametros totales | 8.134.102.058 (~8,13 B) segun safetensors |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos lineales y embeddings en int4 simetrico, grupo 32, escalas fp16; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors con esquema compressed-tensors (`pack-quantized`), library_name `vllm` |

## Arquitectura y entrenamiento

El checkpoint base es un modelo Gemma 4 en la variante E4B con entrenamiento con reconocimiento de cuantizacion (QAT) previo, exportado por Google como `q4_0-unquantized`. Sobre esa base, el autor aplica la ruta de reempaquetado W4A16 de `compressed-tensors` (int4 simetrico, grupo 32) y, adicionalmente, empaqueta en int4 las tablas de embeddings mediante el script `embed_int4.py` con la opcion `--embed-tokens` y escalas fp16 por defecto. El resultado mantiene las capas lineales sin cambios respecto al repack W4A16 original (0 discrepancias a nivel de grupo contra la fuente QAT, segun `verify_report.json`).

La innovacion tecnica principal es la coherencia numerica del empaquetado. QAT dejo las tablas de embeddings sobre la misma rejilla de 4 bits que las capas lineales (grupo 32), de modo que el empaquetado recupera esa rejilla: 0 grupos fuera de rejilla en ambas tablas, con un 74,78 % de valores bit a bit identicos en los embeddings por capa y un 73,48 % en `embed_tokens`, y un error maximo del 0,66 % del maximo del grupo. Un detalle relevante de implementacion es que `lm_head` queda desacoplado (`untied`): vLLM ata la capa de salida copiando el `.weight` del embedding, que un embedding empaquetado no posee, por lo que los mismos niveles y escalas se escriben una segunda vez como `lm_head` y se ejecutan como una capa lineal int4. El modelo original fue entrenado con pesos atados, asi que este desacople es una adaptacion forzada por el formato. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda de la familia Gemma 4 el diseno orientado a razonamiento con modos de pensamiento configurables (segun la documentacion publica de la familia).
- Code generation y matematicas: capacidad presumible por herencia del modelo base Gemma 4 E4B-it, aunque no se aportan evaluaciones especificas de este repack.
- Instruccion y dialogo multi-turno: es un checkpoint `-it` (instruction tuned).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Vision: **no soportada**. Este reempaquetado es solo texto, pese a que la familia Gemma 4 es multimodal en su version original.
- Inferencia cuantizada int4 extremo a extremo (lineales + embeddings) bajo vLLM.

## Casos de uso

- Despliegue en vLLM sobre GPUs de gama media: al ocupar el checkpoint 4,26 GiB, permite servir un modelo de ~8 B con pesos int4 y activaciones de 16 bits en tarjetas de 12-16 GB de VRAM, reservando el resto para cache KV y overhead.
- Generacion de texto en produccion con coste de VRAM minimizado: util en entornos donde varias instancias del modelo comparten una misma GPU y el presupuesto de memoria es el cuello de botella.
- Chatbots de instrucciones en castellano u otros idiomas, siempre que se valide el rendimiento idiomatico, dado que el repositorio no declara cobertura linguistica.
- Investigacion sobre cuantizacion QAT: sirve como caso de estudio reproducible de como empaquetar embeddings en int4 grupo 32 sin salirse de la rejilla de cuantizacion original, con metricas de fidelidad publicadas (porcentaje de valores bit-identicos y error maximo).
- Comparativas de tecnicas de cuantizacion: enfrentar este repack contra el W4A16 con embeddings en bf16 (`xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct`) y contra el bf16 sin cuantizar para medir el impacto de cuantizar los embeddings.
- Pipelines de evaluacion internos de la familia Gemma 4: banco de pruebas economico en VRAM para tareas de generacion de texto antes de escalar a variantes mayores (12B, 26B-A4B, 31B).
- Fine-tuning o destilacion posteriores a partir del checkpoint int4, aunque requeriria tener en cuenta el formato compressed-tensors y puede ser mas practico partir del unquantized.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 4,26 GiB en int4 (peso del checkpoint cuantizado). Las tablas de embeddings por capa pasan de 5,250 GiB en bf16 a 1,477 GiB, y `embed_tokens` de 1,250 GiB a 0,352 GiB.
- VRAM total estimada: no disponible de forma oficial; como orientacion, a los ~4,3 GiB de pesos hay que sumar la cache KV (que depende de la longitud de contexto, dato no publicado) y las activaciones en 16 bits.
- GPUs de consumo compatibles previsiblemente: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con 12-24 GB, siempre que la longitud de contexto y el tamano de lote encajen en la VRAM restante.
- GPUs de centro de datos: A100, H100 y equivalentes, donde el modelo ocupa una fraccion minima de la memoria y permite lotes grandes.
- Opciones de despliegue: **vLLM 0.29 o superior** es obligatorio, porque requiere el soporte `CompressedTensorsEmbeddingWNA16Int`. Selecciona `library_name: vllm`. Este formato concrete de compressed-tensors no es cargable directamente por llama.cpp; las variantes GGUF Q4_0 (por ejemplo `gemma4:e4b-it-qat` en Ollama) son artefactos distintos de la familia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Embeddings | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4` (este) | ~8,13 B | int4 grupo 32 | safetensors compressed-tensors, solo texto | gemma | 4,26 GiB, requiere vLLM >= 0.29, no oficial |
| `xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct` | ~8,13 B | bf16 (sin empaquetar) | safetensors compressed-tensors, solo texto | gemma | Repack padre; mas pesado en embeddings |
| `google/gemma-4-E4B-it-qat-q4_0-unquantized` | ~8,13 B | bf16 | safetensors (unquantized) | gemma | Fuente oficial QAT; multimodal en origen |
| `gemma4:e4b-it-qat` (Ollama) | ~8 B (E4B) | no disponible | GGUF Q4_0 | gemma | Multimodal (texto e imagen), distribuido por Ollama |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Solo texto**: este repack elimina la entrada de imagen presente en la familia Gemma 4 original. No debe usarse para tareas de vision.
- **No oficial**: es un reempaquetado de terceros; los problemas deben reportarse al autor, no a Google.
- **Requisito estricto de vLLM 0.29 o superior**: versiones anteriores no soportan `CompressedTensorsEmbeddingWNA16Int` y fallaran al cargar.
- **`lm_head` desacoplado**: el modelo se entreno con pesos atados, pero este formato escribe una copia int4 de `lm_head` para sortear la limitacion de vLLM con embeddings empaquetados; es una desviacion respecto al entrenamiento original.
- **Perdida de fidelidad en embeddings**: aunque no hay grupos fuera de rejilla, los embeddings no son identicos al original (entorno al 74-75 % de valores bit-identicos, error maximo 0,66 % del maximo del grupo). El efecto sobre la calidad final no se cuantifica en la informacion disponible.
- **Sin datos de benchmarks**: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada para este checkpoint.
- **Idiomas y contexto desconocidos**: el repositorio no declara idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues con requisitos estrictos.
- **Licencia Gemma**: el uso comercial esta sujeto a los Gemma Terms of Use de Google; conviene revisar las obligaciones de atribucion y las restricciones de uso aceptable antes de desplegar en produccion.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje de este tamano; no se aportan evaluaciones especificas de veracidad.
- **Adopcion nula verificada**: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct-text-emb4
- Repack padre (W4A16 sin embeddings int4): https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-w4a16-ct
- Variante gemela E2B con embeddings int4: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Modelo base de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Script de empaquetado `embed_int4.py`: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/blob/main/repack/embed_int4.py
- Repack W4A16 de 26B-A4B: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct
- Notas de desarrollo en GitHub: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/devto-gemma4-26b-qat-w4a16-v6e1.md
- Variante QAT W4A16 en Inferix: https://inferix.co/models/google/gemma-4-E4B-it-qat-w4a16-ct
- Gemma 4 E4B-it-qat en Ollama (variante GGUF Q4_0): https://ollama.com/library/gemma4:e4b-it-qat
