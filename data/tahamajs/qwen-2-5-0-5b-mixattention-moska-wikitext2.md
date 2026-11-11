# tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2

## Resumen

`qwen-2.5-0.5b-mixattention-moska-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Zoo". Se trata de un fine-tune del modelo base Qwen/Qwen2.5-0.5B en el que se han sustituido quirurgicamente 18 de las 24 capas de atencion del decodificador por el modulo `MixAttentionMoSKA` (FASA, atencion dispersa sensible a frecuencia y varianza), manteniendo 6 capas con atencion cuadratica completa como anclas. El objetivo no es tanto ofrecer un modelo de proposito general como demostrar que una atencion subcuadratica puede recuperar calidad tras una cirugia de atencion mediante destilacion de conocimiento en dos etapas.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only, 0,5 mil millones de parametros, GQA con 14 cabezas de query y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y se entrena sobre WikiText-2 en ingles. Tras la sustitucion de atencion, la perplejidad causal zero-shot cae a 139,83; las dos etapas de destilacion (alineamiento con backbone congelado y destilacion de representaciones multicapa) la reducen hasta 25,97 en el split de validacion de `wikitext-2-raw-v1`.

Su relevancia es fundamentalmente de investigacion: sirve como referencia reproducible de como injertar mecanismos de atencion alternativos en un LLM preentrenado y medir el coste de recuperacion en pasos, tiempo y VRAM. No esta pensado como sustituto del Qwen2.5-0.5B original en produccion, y su unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `MixAttentionMoSKA` (FASA) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB; `attention_weights.safetensors` 86,23 MB) |
| Libreria | neuralops |
| Tamano del repo | 0,1 GB |
| Patron de cirugia | `hybrid_3_1` (capas ancla en indices 3, 7, 11, 15, 19, 23) |
| GQA | 14 cabezas query, 2 cabezas KV, `head_dim=64`, `hidden_size=896` |
| Destilacion | 2 etapas, 374 pasos totales, 180,3 s, `topk=64`, `grad_accum=4` |

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-0.5B, un transformer decoder-only con atencion de tipo grouped-query (14 cabezas de query, 2 de clave/valor). Sobre ese esqueleto se aplica el `QwenAttentionAdapter` de NeuralOps, que sustituye las proyecciones de atencion en 18 de las 24 capas por el modulo `MixAttentionMoSKA`. Este modulo implementa FASA (frequency/variance-aware sparse attention): en atencion no causal poda las claves y valores a los `fasa_keep_ratio` tokens mas relevantes segun varianza/norma L2, preservando siempre el token 0; en decodificacion causal con `past_key_value` se desactiva la poda y se ejecuta atencion densa exacta. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) conservan atencion cuadratica completa como anclas, lo que da el patron `hybrid_3_1`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineamiento con backbone congelado, `lm_head` desactivado, MSE y coseno por capa con peso 0,25) dura 113 pasos y 54,2 s; la etapa 2 (destilacion de representaciones multicapa con peso 0,50) dura 261 pasos y 125,8 s. En total, 374 pasos y 180,3 s con un pico de 17.902 MB de VRAM en FP16 con parametros maestros FP32. La perplejidad causal pasa de 139,83 (baseline zero-shot tras la cirugia) a 25,97, una mejora de 113,86 puntos.

## Capacidades

- Generacion de texto causal en ingles (pipeline `text-generation`).
- Modelado de lenguaje y calculo de perplejidad sobre corpus en ingles.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (`supports_bidirectional: Yes`, `supports_cross_attention: Yes`).
- Soporte nativo de GQA (`supports_gqa: Yes`).
- Atencion dispersa selectiva en modo no causal (poda top-k por varianza/L2) y atencion densa exacta en modo causal con cache.
- Capacidad conversacional declarada en los tags del repositorio.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Multilingue: limitado a ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre atencion subcuadratica: banco de pruebas reproducible para medir el coste de recuperar calidad (perplejidad, pasos, VRAM) al sustituir atencion densa por FASA en un LLM preentrenado.
- Experimentos de cirugia de atencion: comparar el patron `hybrid_3_1` con otras configuraciones (por ejemplo, mas o menos capas ancla) usando el mismo protocolo de destilacion de NeuralOps.
- Evaluacion de destilacion de conocimiento: validar tecnicas de alineamiento con backbone congelado frente a destilacion de representaciones multicapa sobre un modelo de 0,5B.
- Prototipado de bajo coste en CPU o GPU de consumo: con 0,5B de parametros y pesos de ~1 GB en FP16, permite iterar rapidamente en tareas de generacion de texto en ingles.
- Benchmarking de perplejidad: usar el checkpoint como referencia de WikiText-2 (PPL 25,97) en comparaciones de eficiencia de atencion.
- Docencia y divulgacion: ejemplo didactico de como se modifica un transformer existente sin reentrenar desde cero y de como se mide la degradacion y recuperacion de calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 25,97 |

Telemetria interna del entrenamiento (declarada por el autor):

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilacion (etapa 0) | 139,83 |
| Perplejidad causal post-destilacion | 25,97 |
| Delta de perplejidad | -113,86 |
| Etapa 1 (alineamiento) | 113 pasos / 54,2 s |
| Etapa 2 (destilacion multicapa) | 261 pasos / 125,8 s |
| Total | 374 pasos / 180,3 s |
| VRAM pico | 17.902 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs de 4-8 GB.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es lo bastante pequeno para ejecutarse en CPU con latencia aceptable.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales.
- Despliegue: la libreria declarada es `neuralops`, con un flujo de carga basado en `transformers` mas `apply_qwen_attention_surgery`; no se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI.
- Entrenamiento/destilacion: el autor reporta un pico de 17.902 MB de VRAM, por lo que se necesito al menos una GPU de ~24 GB (por ejemplo, RTX 3090/4090 o A10) para reproducir el proceso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2` | 0,5B | no disponible | PPL WikiText-2: 25,97 | MIT | Hugging Face (repo de 0,1 GB) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | no disponible en esta ficha | Apache 2.0 (Qwen2.5) | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | no disponible en esta ficha | Apache 2.0 (Qwen2.5) | Hugging Face |

La comparacion directa de rendimiento con el modelo base no es posible con los datos proporcionados, ya que la model card no incluye la perplejidad de Qwen2.5-0.5B sin cirugia sobre el mismo split. La diferencia clave frente a las alternativas es la sustitucion de atencion y el entrenamiento exclusivo en WikiText-2, que lo aleja de un uso conversacional general.

## Limitaciones y advertencias

- Modelo experimental de investigacion: entrenado unicamente sobre WikiText-2, no esta ajustado para instrucciones ni para conversacion general pese al tag `conversational`.
- Solo ingles: el campo `language` declara exclusivamente `en`; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Perplejidad no verificada: el valor 25,97 aparece con `verified: false` en el `model-index`.
- Sin datos de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de seguridad o sesgo.
- La poda FASA solo se aplica en modo no causal; en decodificacion causal con cache se ejecuta atencion densa, por lo que el ahorro computacional en generacion autoregresiva puede no materializarse.
- Longitud de contexto no documentada; el entrenamiento usa `seq_len=512`, por lo que no hay garantia de comportamiento correcto mas alla de esa longitud.
- Requiere la libreria `neuralops` y el flujo de cirugia de atencion para cargar correctamente el checkpoint; no es un `transformers` estandar plug-and-play sin ese paso.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 0,5B, la fiabilidad factua es limitada.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, por lo que conviene revisar ambas condiciones.
- Sin soporte declarado de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mixattention-moska-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
