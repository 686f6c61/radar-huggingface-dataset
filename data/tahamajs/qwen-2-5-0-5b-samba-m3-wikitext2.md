# tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decoder por el modulo `samba_m3` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modulo combina atencion local de ventana deslizante con un componente Mamba espectral, formando un patron hibrido intercalado 3:1 sobre 24 capas. El autor es tahamajs y el modelo se distribuye con licencia MIT.

El objetivo no es ofrecer un modelo de proposito general, sino servir como banco de pruebas reproducible para estudiar la viabilidad de arquitecturas de atencion subcuadratica sobre un transformer pequeno ya entrenado. Tras la sustitucion de capas, el modelo sufre una degradacion severa (perplejidad de 2553,41 en WikiText-2) que se recupera parcialmente mediante un proceso de destilacion de conocimiento en dos etapas, alcanzando una perplejidad final de 219,15.

Es relevante porque documenta de forma transparente la telemetria completa del proceso (topologia de sustitucion, pasos de entrenamiento, VRAM pico, tamano de pesos) y porque el adaptador `QwenAttentionAdapter` demuestra como transplantar modulos de atencion alternativos en modelos Qwen2 con GQA, un patron util para investigacion en eficiencia de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con 18/24 capas sustituidas por `samba_m3` (atencion local de ventana deslizante + Mamba espectral); patron hibrido 3:1, 6 capas de atencion cuadratica completa preservadas en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | No disponible (modelo base Qwen2.5-0.5B: aproximadamente 0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 143,49 MB); solo pesos de atencion, requiere el modelo base Qwen2.5-0.5B |
| Libreria | neuralops |
| Tamano del repo | 0,2 GB |
| GQA | 14 cabezas query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`; expansion 7x de cabezas KV donde es necesario |
| Soporte causal / bidireccional / cross-attention | Si / si / si |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder con atencion GQA (14 cabezas query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Sobre esa base se aplica una "cirugia" de atencion mediante `QwenAttentionAdapter`: 18 de las 24 capas se reemplazan por el bloque `SAMBAM3Block`, que combina atencion local de ventana deslizante con Mamba espectral, mientras que 6 capas conservan atencion cuadratica completa como anclas en los indices [3, 7, 11, 15, 19, 23]. El adaptador gestiona la expansion 7x de cabezas KV y respeta el contrato de `o_proj` unico. El modulo declara soporte nativo de GQA, causalidad, bidireccionalidad y cross-attention.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado) duro 15 pasos (55,5 s) con `lm_head` desactivado y MSE/coseno por capa con peso 0,25. La etapa 2 (destilacion de representacion multicapa) duro 34 pasos (127,0 s) con MSE/coseno y peso 0,50. En total, 49 pasos en 182,9 s. La perplejidad causal paso de 2553,41 (etapa 0, cero-shot tras la cirugia) a 219,15 tras la destilacion, un delta de -2334,26. La VRAM pico fue de 15875 MB en FP16 con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva causal en ingles.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del bloque `SAMBAM3Block`).
- Soporte nativo de GQA en el adaptador de atencion.
- Capacidad de servir como banco de pruebas para evaluar atencion subcuadratica en un transformer preentrenado.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.
- El modelo se distribuye solo con pesos de atencion; el resto de pesos proviene del modelo base, por lo que las capacidades generativas dependen de la combinacion de ambos.

## Casos de uso

- Investigacion en eficiencia de atencion: sirve para medir el impacto de sustituir atencion cuadratica por un hibrido local + Mamba espectral en un modelo pequeno, comparando perplejidad antes y despues de la destilacion con la telemetria publicada.
- Reproduccion de experimentos de destilacion: el repo incluye `training_metrics.json` y detalla pasos, tiempos y VRAM, lo que permite reproducir el pipeline de dos etapas sobre WikiText-2.
- Validacion de adaptadores de atencion: el `QwenAttentionAdapter` con contrato de `o_proj` unico y expansion 7x de cabezas KV sirve como referencia para transplantar otros modulos del `ATTENTION_REGISTRY` a modelos Qwen2.
- Benchmarking de perplejidad en dominio academico: util para comparar variantes de atencion subcuadratica sobre `wikitext-2-raw-v1` con una metrica estandar y reproducible.
- Prototipado de modelos ligeros en ingles: con aproximadamente 0,5 mil millones de parametros y pesos de atencion de 143,49 MB, puede ejecutarse en entornos con recursos limitados para pruebas de generacion de texto.
- Docencia y formacion: ejemplo practico de cirugia de atencion, destilacion de conocimiento y evaluacion con perplejidad en un modelo open source con licencia permisiva.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 219,15 | No (declarado por el autor) |
| WikiText-2 (etapa 0, post-cirugia, cero-shot) | Perplejidad | 2553,41 | No (declarado por el autor) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB, y los pesos de atencion anaden 143,49 MB.
- VRAM pico durante el entrenamiento (destilacion): 15875 MB en FP16 con parametros maestros en FP32.
- GPU recomendadas: no disponible; por tamano, el modelo cabe en GPUs consumer de gama media, aunque no se documenta compatibilidad con modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de aproximadamente 0,5 mil millones de parametros, aunque no se confirma en la model card.
- Opciones de despliegue: la model card usa `transformers` con `AutoModelForCausalLM` y `safetensors`; requiere el script `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2` | ~0,5B | No disponible | 219,15 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| Otros modelos del NeuralOps Attention Zoo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de benchmarks con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La perplejidad de 219,15 es muy superior a la de un modelo de 0,5B bien entrenado; la calidad generativa es limitada y el checkpoint esta pensado para investigacion, no para produccion.
- El modelo solo incluye pesos de atencion; es imprescindible cargar el modelo base `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con el script de NeuralOps, lo que anade dependencias externas.
- Entrenado unicamente sobre WikiText-2 en ingles; el dominio y el idioma estan muy restringidos.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion; se desconoce el comportamiento en dominios fuera de WikiText-2.
- El proceso de destilacion es muy corto (49 pasos, 182,9 s), lo que sugiere una recuperacion parcial y no completa de la capacidad del modelo base.
- No se documenta soporte de tool calling, agentes ni multimodalidad.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base Qwen2.5-0.5B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-samba-m3-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
