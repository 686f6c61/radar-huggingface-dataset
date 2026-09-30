# xbill9/gemma-4-E2B-it-qat-w8a8-ct-text-emb4

## Resumen

Este repositorio es un reempaquetado no oficial de Gemma 4 E2B-it QAT, publicado por el usuario xbill9, que convierte las capas lineales del decodificador de int4 con matemáticas de 16 bits (W4A16) a int8 con matemáticas int8 (W8A8). El modelo original es un Gemma 4 E2B-it de Google DeepMind, cuantizado con entrenamiento consciente de cuantización (QAT), y este repack redistribuye esos pesos en un formato distinto bajo la misma licencia. El checkpoint resultante pesa 3,40 GiB en safetensors y declara 5.031.222.563 parámetros reales en el fichero de pesos.

El objetivo declarado del autor no es ser la compilación por defecto, sino medir los tensor cores INT8 en GPUs que los tienen pero carecen de FP8 o bf16, como la Tesla T4. Las tablas de embeddings y `lm_head` se mantienen sin cambios respecto al modelo base (int4 grupo 32 con escalas fp16, `lm_head` sin atar), de modo que la única diferencia computacional está en cómo calculan las 276 capas lineales del decodificador. No se usó ningún conjunto de calibración: las escalas de activación se calculan por token en tiempo de ejecución.

Es relevante porque documenta con mediciones reales el intercambio entre precisión, memoria y velocidad al pasar de W4A16 a W8A8 en hardware Turing, un escenario habitual en servidores con T4 que no pueden aprovechar bf16 ni FP8. El autor advierte que esta compilación decodifica a aproximadamente la mitad de velocidad que el modelo base del que deriva y que es menos fiel a los pesos QAT originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador de Gemma 4 (texto), con proyecciones de embeddings por capa; la familia Gemma 4 incluye variantes densas y MoE, pero no se especifica la clasificación de esta variante en la informacion disponible |
| Parametros totales | 5.031.222.563 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como maximo nativo; la configuracion de servicio del autor usa `--max-model-len 16384` |
| Tipos de cuantizacion | Lineales del decodificador en int8 W8A8 (276 modulos, una escala por canal de salida; activaciones int8 por token calculadas en tiempo de ejecucion, sin calibracion); `embed_tokens_per_layer` y `embed_tokens` en int4 grupo 32 con escalas fp16; `lm_head` en int4 grupo 32 sin atar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, con enlace a la licencia de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors con `compressed-tensors`; libreria declarada vllm |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B-it, un decodificador de texto de Google DeepMind cuantizado con QAT. La innovacion de este repositorio no esta en el entrenamiento, sino en el reempaquetado: el script `w8a8.py` descomprime cada capa lineal int4 del build `-emb4` a sus valores exactos (nivel multiplicado por el paso de grupo) y la recodifica como int8 con una sola escala por canal de salida. Los modulos que pertenecen a otros grupos de cuantizacion, es decir los embeddings y el `lm_head`, se copian byte a byte sin modificacion. No interviene ningun dato de calibracion, porque las escalas de activacion se calculan por token en tiempo de ejecucion.

El resultado no es sin perdidas. El build base `-emb4` reproduce los valores QAT de Google, que viven en una rejilla de 4 bits con un paso por grupo de 32 pesos. Una unica escala int8 por fila no puede representar exactamente el paso de cada grupo, de modo que cada peso se desplaza ligeramente: el error relativo medio es del 0,89% por capa lineal, con un maximo del 1,7%. El redondeo de las activaciones a int8 es un cambio mayor y no fue contemplado durante el QAT. En una comprobacion codiciosa con 8 prompts de hasta 160 tokens y temperatura 0 frente al build `-emb4`, solo 2 de las 8 salidas fueron identicas token a token; el resto reformula a partir del token 12 a 44. El autor documenta ademas un fallo factual: ante una pregunta sobre el estado HTTP 418, este build cita el RFC 2616 mientras que `-emb4` responde correctamente con el RFC 2324.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas, segun las capacidades heredadas del Gemma 4 E2B-it original; no se detalla la lista de idiomas en la informacion disponible.
- Razonamiento y respuesta a preguntas de caracter general, con calidad verificada solo de forma cualitativa mediante una comprobacion puntual de 8 prompts.
- Generacion y explicacion de codigo y conocimiento tecnico basico, como demuestra la prueba sobre el RFC 2324, aunque con riesgo de errores factuales observado.
- Conversacion multiturno dentro de la ventana configurada de 16.384 tokens.
- Inferencia en modo texto unicamente: no admite entradas de imagen ni de audio.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso en la informacion disponible.
- No se documenta modo de pensamiento (thinking mode) ni salida estructurada.

## Casos de uso

- Inferencia en GPUs Turing con tensor cores INT8: este build existe para aprovechar los tensor cores INT8 de tarjetas como la Tesla T4, que no disponen de FP8 ni de bf16. Se desplegaria con vLLM 0.29 o posterior y `--dtype float16`, aceptando el coste de velocidad a cambio de usar la ruta int8 del hardware.
- Servicio de chat de baja concurrencia en un servidor T4 existente: con `--max-num-seqs 8` y `--max-model-len 16384` el modelo se sirve en una unica T4 con 16 GB, lo que permite reutilizar hardware de generaciones anteriores para asistentes conversacionales internos.
- Cargas de trabajo dominadas por prefill en prompts largos: el autor senala que W8A8 puede ganar en prefill sobre prompts largos, donde el calculo esta limitado por computo y no por lectura de pesos; seria el escenario adecuado para resumir o clasificar documentos extensos por lotes.
- Procesamiento por lotes de resumen y extraccion de informacion: al ser un modelo de ~5.000 millones de parametros con pesos de 3,40 GiB, cabe holgadamente en memoria de GPU y permite procesar colas de documentos con una ventana de 16.384 tokens.
- Asistente de documentacion tecnica interna: puede responder preguntas sobre APIs y estandares, pero la comprobacion del autor muestra errores factuales, por lo que requeriria validacion humana o recuperacion aumentada antes de publicar respuestas.
- Investigacion en cuantizacion y validacion de kernels INT8: el repositorio esta pensado explicitamente como instrumento de medida para comparar kernels (`CutlassInt8ScaledMMLinearKernel` para los lineales int8 y `MarlinLinearKernel` para el `lm_head`) y para estudiar la degradacion de precision W4A16 frente a W8A8.
- Pruebas de precision frente al modelo QAT de referencia: el par `-emb4` y este build permiten aislar el efecto de cambiar solo los lineales, ya que embeddings y `lm_head` son identicos byte a byte.
- No es adecuado para despliegue en movil o edge: el formato `compressed-tensors` requiere vLLM y no genera GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una comprobacion puntual codiciosa y mediciones de servicio en una unica Tesla T4 con vLLM 0.29.0, `--dtype float16 --gpu-memory-utilization 0.90 --max-model-len 16384 --max-num-seqs 8`.

Mediciones de servicio en una Tesla T4:

| Metrica | `-emb4` (W4A16) | Este build (W8A8) |
|---|---:|---:|
| Carga del modelo | 2,86 GiB | 3,62 GiB |
| Decodificacion, una secuencia, 256 tokens | 109,7 tok/s | 53,8 tok/s |

Comprobacion codiciosa frente a `-emb4` (8 prompts, hasta 160 tokens, temperatura 0):

| Metrica | Valor |
|---|---|
| Salidas identicas token a token | 2 de 8 |
| Punto de divergencia en el resto | del token 12 al 44 en adelante |
| Fluidez y adecuacion al enunciado | 8 de 8 respuestas fluidas y en tarea |
| Error factual observado | cita RFC 2616 en lugar de RFC 2324 para el estado HTTP 418 |
| Error relativo medio por capa lineal | 0,89% |
| Error relativo maximo por capa lineal | 1,7% |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 3,40 GiB en disco y el proceso carga 3,62 GiB en una T4 con fp16; hay que sumar la cache KV, que en el primer arranque del autor se dimensiono en 895.665 tokens sin reiniciar. Se recomienda un minimo practico de 8 GB de VRAM para contexto moderado, aunque es una extrapolacion a partir de la carga medida, no un dato publicado.
- GPU validadas: Tesla T4 (Turing, 16 GB), con fp16. El autor indica que en Turing la atencion Triton de vLLM necesita ademas un ajuste de limite de memoria compartida.
- GPUs con tensor cores INT8: el build esta pensado para GPUs con INT8 pero sin FP8 ni bf16, categoria en la que entra la T4. En GPUs con bf16 o FP8 nativos no hay ventaja declarada frente a otras compilaciones.
- GPU consumer: por tamano de pesos (3,62 GiB de carga en fp16) es plausible en tarjetas consumer de 8 a 12 GB de VRAM para contextos moderados, aunque no hay validacion publicada en ese hardware.
- Opciones de despliegue: vLLM 0.29 o posterior es obligatorio porque necesita soporte de embeddings int4. Comando de referencia:
  `vllm serve xbill9/gemma-4-E2B-it-qat-w8a8-ct-text-emb4 --dtype float16 --max-model-len 16384`
- No hay soporte documentado para llama.cpp, Ollama o TGI; el formato es `compressed-tensors`, no GGUF.
- Latencia y throughput: 53,8 tok/s de decodificacion en una unica secuencia de 256 tokens en una T4 con fp16, frente a 109,7 tok/s del build W4A16 `-emb4`. El autor no publica barrido de concurrencia completo en esta ficha; remite a su banco de pruebas.
- Particularidad operativa: hay que reiniciar el servicio una vez tras el primer arranque, porque la primera ejecucion compila desde cero y dimensiona mal la cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion de lineales | Embeddings y `lm_head` | Peso del checkpoint | Decodificacion en T4 (1 secuencia, 256 tokens) | Licencia |
|---|---|---|---|---|---|---|
| Este build (`w8a8-ct-text-emb4`) | 5.031.222.563 | int8 W8A8, 276 modulos, una escala por canal de salida | int4 grupo 32 con escalas fp16; `lm_head` int4 sin atar | 3,40 GiB | 53,8 tok/s | Apache 2.0 |
| `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4` (modelo base) | mismo grafo que este build | int4 W4A16 | int4 grupo 32 con escalas fp16; `lm_head` int4 sin atar | no disponible (carga 2,86 GiB) | 109,7 tok/s | Apache 2.0 |
| `xbill9/gemma-4-E2B-it-qat-w8a8-int8` | no disponible | int8 W8A8, mismo esquema | bf16 con `lm_head` bf16 atado | 6,88 GiB | no disponible | Apache 2.0 |
| `google/gemma-4-E2B-it` (original) | 5,03B segun el safetensors de este repack; 2,1B segun gemma4.dev | QAT original | no disponible | no disponible | no disponible | Apache 2.0 / licencia Gemma 4 |

Nota de discrepancia: la ficha publica de Gemma 4 E2B en gemma4.dev indica 2,1 mil millones de parametros, mientras que el fichero safetensors de este repack declara 5.031.222.563. La diferencia es probablemente atribuible al recuento de parametros efectivos frente a parametros totales con embeddings por capa, pero no se confirma en la informacion disponible.

## Limitaciones y advertencias

- Repack no oficial: no esta afiliado ni respaldado por Google. Los pesos y el entrenamiento son de Google DeepMind; los problemas deben reportarse al autor del repack, no a Google.
- Solo texto: no admite entradas de imagen ni de audio.
- Degradacion de fidelidad: el error relativo medio por capa lineal es del 0,89% y el maximo del 1,7%; solo 2 de 8 salidas de la comprobacion codiciosa coincidieron token a token con el build W4A16, con divergencias desde el token 12.
- Riesgo de alucinacion factual documentado: el modelo cita el RFC 2616 en lugar del RFC 2324 para el estado HTTP 418.
- Menor rendimiento que el build base en decodificacion sobre T4: 53,8 tok/s frente a 109,7 tok/s, aproximadamente la mitad, porque los pesos int8 ocupan el doble de bytes que los int4 y anaden un paso de cuantizacion por capa.
- Sin datos de calibracion: las escalas de activacion se calculan por token en tiempo de ejecucion, y el QAT original nunca entreno para el redondeo de activaciones a int8.
- Validacion muy limitada: probado solo en una Tesla T4 con fp16 y vLLM 0.29.0. No hay datos de otras GPUs, otros dtypes ni otros motores de inferencia.
- Comprobacion de calidad insuficiente: el propio autor indica que la prueba de 8 prompts es un spot check y no una evaluacion.
- Idiomas soportados no declarados en la informacion disponible.
- Licencia: el repositorio declara apache-2.0 y enlaza a la licencia de Gemma 4; conviene revisar los terminos de uso comercial de Gemma antes de un despliegue en produccion.
- Sin datos de sesgo publicados en la informacion disponible.
- Requiere vLLM 0.29 o superior; no hay ruta GGUF ni soporte de llama.cpp u Ollama. En Turing, la atencion Triton de vLLM necesita un ajuste de memoria compartida.
- Necesita un reinicio tras el primer arranque por un dimensionado incorrecto de la cache KV en la primera compilacion.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-ct-text-emb4
- Modelo base del repack: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Variante relacionada con embeddings en bf16: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-w8a8-int8
- Banco de pruebas de servicio en T4: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16
- Script de conversion w8a8.py: https://huggingface.co/xbill9/gpu-vllm-t4-2b-w4a16/blob/main/repack/w8a8.py
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Version ONNX mobile de la comunidad: https://huggingface.co/onnx-community/gemma-4-E2B-it-qat-mobile-ONNX/blob/main/README.md
- Ficha de referencia de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Modelos de Qualcomm AI Hub para Gemma 4 E2B it: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/gemma_4_e2b_it
