# tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decoder por el modulo `griffin_ssd` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de proposito general, sino servir como banco de pruebas reproducible para estudiar la viabilidad de arquitecturas de atencion subcuadratica (hibridos de ventana local y linear attention tipo SSD, en la linea de Griffin) sobre un transformer preentrenado de 0,5 mil millones de parametros.

El autor aplica un patron de cirugia `hybrid_3_1`: 18 de las 24 capas del decoder se reemplazan por `griffin_ssd` mediante un `QwenAttentionAdapter`, mientras que 6 capas conservan atencion cuadratica completa como anclas (indices 3, 7, 11, 15, 19 y 23). Tras la sustitucion, el modelo colapsa (perplejidad de 379.143,46 en WikiText-2) y se recupera mediante un pipeline de destilacion de conocimiento en dos etapas que lo lleva a una perplejidad de validacion de 171,65 en apenas 277 pasos y 180,3 segundos de entrenamiento.

Su relevancia es metodologica: documenta de forma transparente el coste de reemplazar atencion cuadratica por alternativas lineales en un modelo ya entrenado y demuestra que la destilacion por capas (MSE y coseno sobre estados ocultos) puede rescatar parcialmente la capacidad linguistica. El modelo es de investigacion, con licencia MIT, y no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 18/24 capas con `GriffinSSDBlock` (ventana local + SSD linear attention) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 510.085.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 972,96 MB; `attention_weights.safetensors` 114,75 MB) |
| Tamano del repositorio | 1,2 GB |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Libreria | `neuralops` |
| Configuracion de atencion base | 14 cabezas query, 2 cabezas KV, `head_dim=64`, `hidden_size=896` |
| Patron de cirugia | `hybrid_3_1` con anclas cuadraticas en capas [3, 7, 11, 15, 19, 23] |
| GQA nativo en `griffin_ssd` | No (el adaptador aplica expansion 7x de cabezas KV) |
| Soporte RoPE en `griffin_ssd` | N/A |
| Dataset de entrenamiento | Salesforce/wikitext (`wikitext-2-raw-v1`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896` y GQA 14:2. Sobre esa base se aplica una "cirugia" que sustituye los modulos `Qwen2Attention` por instancias de `GriffinSSDBlock`, un bloque hibrido que combina una ventana de atencion local con atencion lineal del tipo SSD (state space duality). El `QwenAttentionAdapter` gestiona el desajuste de cabezas (expansion 7x de KV heads donde es necesario) y fuerza un contrato de `o_proj` unico. El patron `hybrid_3_1` intercala tres capas `griffin_ssd` por cada capa de atencion cuadratica completa, dejando seis anclas intactas.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2. La etapa 0 (post-cirugia, sin entrenamiento) arroja una perplejidad causal de 379.143,46, lo que refleja el colapso del modelo al perder la atencion original. La etapa 1 (alineamiento con backbone congelado, 77 pasos, 54,6 s) salta el `lm_head` y minimiza MSE y coseno (peso 0,25) sobre estados ocultos capa a capa. La etapa 2 (destilacion de representacion multicapa, 200 pasos, 125,3 s) repite el proceso con peso 0,50. En total, 277 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, en 180,3 s y con un pico de VRAM de 20.004 MB en FP16 autocast con parametros maestros FP32. El resultado final es una perplejidad de validacion de 171,65, una mejora de -378.971,80 puntos respecto al punto de partida.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada del tokenizador y vocabulario de Qwen2.5-0.5B.
- Soporte de atencion causal (declarado `supports_causal: Yes` en el modulo `griffin_ssd`).
- Soporte de atencion bidireccional a nivel de modulo (`supports_bidirectional: Yes`), aunque el checkpoint se distribuye para generacion causal.
- Soporte de cross-attention a nivel de modulo (`supports_cross_attention: Yes`).
- Operador de atencion personalizado (`is_custom_attention: Yes`), implementado en la libreria `neuralops`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Multilingue: no; solo ingles segun la model card.
- Calidad linguistica limitada: la perplejidad de 171,65 en WikiText-2 es muy alta para un modelo de 0,5 B (Qwen2.5-0.5B original ronda perplejidades de un orden de magnitud inferior en el mismo corpus).

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por `griffin_ssd` en un transformer preentrenado, comparando perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: las dos etapas documentadas (alineamiento con backbone congelado y destilacion multicapa con MSE + coseno) son una plantilla para probar variantes de KD sobre arquitecturas hibridas.
- Benchmarking de la libreria NeuralOps: permite validar el `QwenAttentionAdapter`, el contrato de `o_proj` unico y la expansion 7x de cabezas KV en un caso real con 24 capas.
- Estudio de patrones hibridos: el patron `hybrid_3_1` con seis anclas cuadraticas es un punto de partida para explorar otras proporciones (2:1, 4:1) y medir el equilibrio entre coste computacional y calidad.
- Prototipado de inferencia eficiente en longitud: aunque no se documenta el contexto efectivo, el bloque `griffin_ssd` esta disenado para reducir el coste cuadratico; util para experimentos de escalado en longitud dentro de un entorno controlado.
- Docencia y divulgacion: ejemplo didactico de cirugia de atencion y recuperacion via KD, con telemetria completa (pasos, tiempos, VRAM, delta de perplejidad) publicada en la model card.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext (`wikitext-2-raw-v1`, validation) | Perplejidad | 171,65 |
| Baseline post-cirugia (etapa 0) | `wikitext-2-raw-v1` | Perplejidad | 379.143,46 |
| Delta de perplejidad | `wikitext-2-raw-v1` | Diferencia | -378.971,80 |

Telemetria de entrenamiento:

| Etapa | Pasos | Tiempo | Detalle |
|---|---|---|---|
| Etapa 1 (alineamiento, backbone congelado) | 77 | 54,6 s | `lm_head` saltado; MSE + coseno con peso 0,25 |
| Etapa 2 (destilacion multicapa) | 200 | 125,3 s | MSE + coseno con peso 0,50 |
| Total | 277 | 180,3 s | `seq_len=512`, `grad_accum=4`, `topk=64`; pico VRAM 20.004 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento documentada: 20.004 MB de pico con FP16 autocast y parametros maestros FP32 (equivalente a una GPU de 24 GB, p. ej. RTX 3090/4090 o A10G).
- VRAM de inferencia estimada: al tratarse de un modelo de ~510 M de parametros, en FP16 ocupa aproximadamente 1 GB de pesos; en FP32, unos 2 GB. La activacion y el contexto anaden overhead, pero cabe holgadamente en cualquier GPU consumer con 4 GB o mas (RTX 3050, GTX 1660, etc.).
- GPU recomendadas para entrenamiento/reentrenamiento: A100, H100, L40S o RTX 4090 (por el pico de 20 GB).
- GPU recomendadas para inferencia: cualquier GPU consumer con 4 GB o mas; tambien CPU.
- Opciones de despliegue: el modelo depende de la libreria `neuralops` y del `QwenAttentionAdapter` para cargar los bloques `griffin_ssd`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. El flujo de carga indicado en la model card usa `transformers` mas la funcion `apply_qwen_attention_surgery` del repositorio NeuralOps.
- Latencia y throughput: no disponibles. El bloque SSD esta disenado para reducir el coste de atencion en secuencias largas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2` | 510 M | no disponible | 171,65 (declarada, no verificada) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (base) | 494 M aprox. | 32.768 tokens (segun especificacion publica de Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |
| `google/recurrentgemma-2b` (familia Griffin) | 2 B | 8.192 tokens (segun especificacion publica) | no disponible en esta ficha | Gemma Terms | Hugging Face, transformers |

La comparativa es orientativa: el checkpoint aqui descrito es un experimento de investigacion sobre WikiText-2, no un modelo de proposito general, y su perplejidad no es directamente comparable con la de modelos entrenados a escala completa sobre corpus mas amplios.

## Limitaciones y advertencias

- Perplejidad muy alta (171,65) para un modelo de 0,5 B: la calidad linguistica es limitada y el modelo no es apto para generacion de texto en produccion.
- Entrenado unicamente sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus pequeno de Wikipedia en ingles; no ha visto instrucciones, dialogos ni codigo.
- Solo soporta ingles.
- Riesgo elevado de alucinacion y de degeneracion en generaciones largas por la falta de datos y de ajuste fino.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning.
- Dependencia de la libreria `neuralops` y de la funcion `apply_qwen_attention_surgery`: no es cargable directamente con `transformers` sin el adaptador, lo que limita su integracion en pipelines estandar.
- El modulo `griffin_ssd` no soporta GQA nativo ni RoPE; el adaptador aplica expansion 7x de cabezas KV y un contrato de `o_proj` unico, lo que puede introducir ineficiencias y diferencias de comportamiento frente al modelo base.
- Los benchmarks son declarados por el autor y estan marcados como no verificados (`verified: false`).
- Licencia MIT permite uso comercial del checkpoint, pero el modelo base Qwen2.5-0.5B esta bajo Apache 2.0; conviene revisar ambas licencias y la del repositorio NeuralOps antes de un uso comercial.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en entornos con memoria muy restringida.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-griffin-ssd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper Griffin (referencia arquitectonica del bloque hibrido): no disponible en la informacion proporcionada.
