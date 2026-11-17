# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw

## Resumen

`xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw` es una cuantización de 4 bits por peso del modelo `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario xv0y5ncu. Utiliza GLQ, un cuantizador de la familia QTIP que emplea un codebook trellis (TCQ) en la variante "3INST" sin tablas de búsqueda, aplicado sobre la arquitectura MoE de gemma-4 con 128 expertos enrutados por capa. El resultado ocupa 13,95 GB en disco frente a los aproximadamente 52 GB del original en bf16, lo que permite servirlo en GPUs de 24 GB o menos.

El checkpoint es relevante porque demuestra que una cuantización de 4 bpw basada en trellis puede mantener la calidad de razonamiento del modelo original en tareas de matemáticas de competición: obtiene un 86,25% en AIME 2026 (avg@8), idéntico al de la cuantización NVFP4 de NVIDIA y a 2 puntos del 88,3% publicado en bf16. Sin embargo, esa paridad de calidad viene acompañada de un coste claro en rendimiento: en la misma GPU, GLQ es el más lento de los tres formatos, con un prefill que se degrada gravemente bajo concurrencia.

La ficha técnica del repositorio indica 7.485.075.406 parámetros en safetensors, un dato que no cuadra con la designación "26B-A4B" del modelo base ni con el tamaño de 15 GB del repo; se reproduce tal cual figura en la información disponible, sin corregirlo. El modelo solo es funcional bajo vLLM con el plugin glq ≥ 0.8.1; la ruta de transformers está rota por un problema de reconstrucción de los tensores de expertos de gemma-4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gemma-4, 128 expertos enrutados por capa) |
| Parametros totales | 7.485.075.406 (según safetensors del repo; el nombre del modelo base indica 26B-A4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base gemma-4-26B-A4B-it lo define; no se detalla en la información) |
| Tipos de cuantizacion | GLQ trellis (TCQ) 3INST a 4 bits/peso; SQNR medio 22,11 dB sobre 242 capas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (packed trellis en orden de fragmento MMA) |

## Arquitectura y entrenamiento

El modelo base es gemma-4-26B-A4B-it, un transformer con mezcla de expertos que emplea 128 expertos enrutados por capa y un modo de razonamiento ("thinking") con presupuesto de tokens configurable. Esta publicación no entrena nada: es una cuantización post-entrenamiento del checkpoint de Google. El proceso se ejecutó con `glq-quantize` usando codebook trellis, 4 bits por peso, 128 muestras de calibración de 2048 tokens extraídas de WikiText-2 y modo streaming; tardó 7049 segundos.

La innovación técnica está en cómo se cuantizan los expertos: los 128 expertos enrutados de cada capa se tratan como una única matriz fusionada `[gate; up]` y luego se dividen por proyección. Esa división está alineada a 32 filas por necesidad, porque el trellis empaquetado se almacena en orden de fragmento MMA, donde la permutación de bytes empareja bloques de 16 filas; un corte dentro de un par intercala bytes de gate y up en pesos que cargan y decodifican sin error pero producen resultados incorrectos. La variante 3INST elimina las tablas de búsqueda del codebook, y glq 0.8.1 incorpora la decodificación MoE trellis agrupada y fusionada que este checkpoint requiere.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking nativo (presupuesto de tokens de razonamiento configurable; las evaluaciones usaron 32k).
- Razonamiento matemático de competición: 86,25% en AIME 2026 (avg@8) según medición del autor.
- Conversación multi-turno mediante la plantilla de chat del modelo base (el autor insiste en usar el chat template y darle presupuesto real de razonamiento).
- Capacidades de código: no verificadas; un smoke test de Terminal-Bench 2 con 5 tareas puntuó 0/5 tanto en este checkpoint como en NVFP4, muestra demasiado pequeña para extraer conclusiones.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible; el resultado de Terminal-Bench 2 no permite afirmarlo.
- Capacidades multilingües: no disponible.
- Visión y audio: no disponible.

## Casos de uso

- Despliegue en GPUs de 24 GB: con 14,4 GiB cargados en vLLM, el modelo cabe en tarjetas consumer de gama alta donde el bf16 (48,5 GiB) no entra en absoluto, lo que permite ejecutar localmente un modelo MoE con modo de razonamiento.
- Razonamiento matemático y científico por lotes: para pipelines offline de resolución de problemas con presupuesto de razonamiento largo, donde el throughput agregado importa menos que la calidad; el 86,25% en AIME 2026 respalda este uso.
- Arranque rápido de servicios efímeros: el tiempo de carga de 6,8 s frente a 67 s en bf16 y 37,7 s en NVFP4 lo hace adecuado para entornos con arranques frecuentes o escalado bajo demanda.
- Inferencia interactiva de un solo usuario: con TTFT de 57 ms y 88,4 tok/s por stream en B=1, es viable para asistentes conversacionales individuales en hardware modesto.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para estudiar el compromiso entre huella de memoria y latencia en codebooks trellis frente a FP4 nativo.
- Investigación sobre cuantización MoE: el checkpoint documenta el procedimiento de fusión y división de expertos alineado a 32 filas, útil para quien diseñe esquemas de cuantización sobre arquitecturas con muchos expertos.
- No recomendado para servicios de alta concurrencia: con B=32 el TTFT sube a 2233 ms y el agregado cae a 944 tok/s, muy por debajo de bf16 (1600 tok/s) y NVFP4 (2966 tok/s).

## Benchmarks y rendimiento

Calidad en AIME 2026 (avg@8, 30 problemas, presupuesto de 32k, temp 1.0 / top_p 0.95 / top_k 64, vLLM 0.27.1, RTX PRO 6000 Blackwell):

| Formato | Pesos | AIME 2026 (avg@8) | Fuente |
|---|---|---|---|
| bf16 | ~52 GB | 88,3% | cifra publicada por Google, distinto harness |
| NVFP4 | 18,2 GiB | 86,25% | medido por el autor |
| GLQ 4 bpw (este) | 14,4 GiB | 86,25% | medido por el autor |

Desglose GLQ frente a NVFP4: avg@8 207/240 en ambos; pass@8 29/30 frente a 28/30; resueltos en las 8 muestras 23/30 frente a 21/30; truncados a 32k 29 frente a 24; sin respuesta 5 frente a 10. El autor califica la comparación como empate, dado que el error estándar de la media a n=30 es de 5,4 puntos. No se midieron perplejidad ni MMLU-Pro.

Rendimiento (misma sesión, RTX PRO 6000 Blackwell, vLLM 0.27.1, prompts de 128 tokens, salidas de 256, `ignore_eos`, `max_model_len 2048`):

| Métrica | GLQ 4 bpw | bf16 | NVFP4 |
|---|---|---|---|
| Memoria cargada (vLLM) | 14,4 GiB | 48,5 GiB | 18,2 GiB |
| Tiempo de carga | 6,8 s | 67,0 s | 37,7 s |
| B=1 decode por stream | 88,4 tok/s | 131,4 tok/s | 153,9 tok/s |
| B=1 TTFT | 57 ms | 88 ms | 81 ms |
| B=1 TPOT | 11,31 ms | 7,29 ms | 6,21 ms |
| B=32 agregado | 944 tok/s | 1600 tok/s | 2966 tok/s |
| B=32 TTFT | 2233 ms | 138 ms | 88 ms |
| B=32 TPOT | 25,25 ms | 19,52 ms | 10,47 ms |

## Requisitos de hardware

- VRAM estimada: 14,4 GiB reportados por vLLM para pesos; añadir espacio para caché KV según longitud de contexto y lote (no cuantificado en la información).
- GPU de referencia de las mediciones: RTX PRO 6000 Blackwell (96 GB). El autor advierte que las cifras son específicas de esa GPU y no se reproducen en tarjetas de 24 GB.
- Cabe en GPUs consumer de 24 GB, donde bf16 no entra; el rendimiento relativo frente a NVFP4 dependerá del ancho de banda de memoria, ya que la ventaja de GLQ proviene de leer 4 veces menos pesos.
- Despliegue: exclusivamente vLLM ≥ 0.25 con plugin glq ≥ 0.8.1. La ruta de HF transformers está rota para gemma-4 MoE con cualquier codebook GLQ.
- Dependencias críticas: `transformers` fijado por debajo de 5.15 (verificado en 5.14.1); la 5.15.0 rompe vLLM al construir `ModelConfig` por el cambio a configuración por capas de gemma-4, y afecta igualmente al bf16 original.
- Latencia y throughput: ver tabla de benchmarks; el prefill bajo concurrencia es el punto débil (2233 ms de TTFT a B=32).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2026 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GLQ 4 bpw) | 128 expertos/capa; 7,48 B en safetensors | no disponible | 86,25% (avg@8) | Apache 2.0 | HF, requiere glq ≥ 0.8.1 |
| nvidia/Gemma-4-26B-A4B-NVFP4 | mismo base | no disponible | 86,25% (avg@8) | no disponible en la información | HF, FP4 nativo Blackwell |
| google/gemma-4-26B-A4B-it (bf16) | 26B-A4B | no disponible | 88,3% (publicado) | no disponible en la información | HF |

## Limitaciones y advertencias

- La ruta de transformers produce salida incoherente con gemma-4 MoE bajo cualquier codebook GLQ, incluido el checkpoint E8-shell validado en vLLM; no es un defecto de este checkpoint, pero obliga a usar vLLM.
- `transformers` 5.15.0 rompe el arranque de vLLM antes de cargar ningún peso; hay que fijar la versión por debajo de 5.15.
- glq anterior a 0.8.1 rechaza el checkpoint en carga, por diseño.
- El prefill se degrada gravemente con concurrencia: 2233 ms de TTFT a B=32 frente a 88 ms en NVFP4.
- El rendimiento medido es específico de una RTX PRO 6000 Blackwell; en GPUs de 24 GB no se reproducen estas cifras.
- Calidad evaluada solo en AIME 2026; no hay perplejidad, MMLU-Pro ni otras tareas medidas. La comparación con bf16 usa un harness distinto, por lo que el delta de 2 puntos no es una medición pareada.
- El smoke test de Terminal-Bench 2 (0/5) es demasiado pequeño para evaluar capacidades de agente o código.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Idiomas soportados: no disponibles en la información; conviene consultar la model card de gemma-4-26B-A4B-it.
- Licencia Apache 2.0 declarada en el repo; verificar que se mantiene la del modelo base para uso comercial.
- La cifra de parámetros en safetensors (7,48 B) no concuerda con la nomenclatura 26B-A4B del modelo base; conviene validar el conteo real antes de dimensionar infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización NVFP4 de referencia: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Repositorio GLQ: https://github.com/cnygaard/glq
- Documentación de la variante trellis 3INST: https://github.com/cnygaard/glq/blob/main/docs/trellis-3inst.md
