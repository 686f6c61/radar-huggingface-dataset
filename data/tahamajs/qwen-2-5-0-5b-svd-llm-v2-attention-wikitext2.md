# tahamajs/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba cuyo mecanismo de atencion ha sido sustituido quirurgicamente en 18 de sus 24 capas por una capa de atencion factorizada por SVD (`SVDLLMV2Attention`), conservando 6 capas con atencion cuadratica completa como anclas. El resultado es un modelo de 0,5 mil millones de parametros con atencion hibrida subcuadratica, orientado a investigacion sobre eficiencia de atencion.

El modelo se ha recuperado mediante destilacion de conocimiento en dos etapas sobre WikiText-2, partiendo de una perplejidad catastrofica tras la cirugia (242.621,87) hasta 185,32 en validacion. Es relevante como artefacto de investigacion reproducible: demuestra el proceso de injertar capas de atencion alternativas en un transformer preentrenado y reajustarlas con distillation, no como modelo de produccion.

La relevancia practica es limitada: la perplejidad de 185,32 esta muy lejos de los valores tipicos de Qwen2.5-0.5B original (en torno a 12-15 en WikiText-2) y el modelo solo declara soporte para ingles. Su interes es metodologico para quienes investigan atencion eficiente, no para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SVDLLMV2Attention` (SVD-factorizada + adaptadores LoRA) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B es 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 89,03 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica una "cirugia" que reemplaza la atencion en 18 capas por `SVDLLMV2Attention`, una capa que factoriza las matrices de proyeccion en U, Sigma y V^H y anade adaptadores LoRA entrenables para recuperar capacidad. Se conservan 6 capas con atencion cuadratica completa en los indices [3, 7, 11, 15, 19, 23] para mantener estabilidad, siguiendo el patron `hybrid_3_1`. El `QwenAttentionAdapter` gestiona la expansion 7x de cabezas KV y un contrato de `o_proj` unico.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 1 (alineamiento con backbone congelado, 120 pasos, 54,5 s) omite el `lm_head` y usa MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilacion de representaciones multicapa, 273 pasos, 125,5 s) usa los mismos objetivos con peso 0,50. En total, 393 pasos y 180,4 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 18.045 MB en FP16 con parametros maestros FP32. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada estructuralmente de Qwen2.5-0.5B pero degradada por la perplejidad de 185,32.
- Soporte de atencion causal, bidireccional y cross-attention segun la tabla de capacidades del modulo `SVDLLMV2Attention`.
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV, con expansion 7x en capas injertadas).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue no disponible: solo declara ingles.
- El tokenizer se publica (`tokenizer.json`, 10,89 MB) y es compatible con el de Qwen2.5.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir el coste de sustituir atencion cuadratica por SVD-factorizada en un modelo pequeno, comparando perplejidad antes y despues de la destilacion.
- Reproduccion de experimentos de cirugia de atencion: el codigo `apply_qwen_attention_surgery` con patron `hybrid_3_1` permite replicar el injerto en otros checkpoints Qwen2.5 y validar la metodologia del Attention Zoo.
- Estudio de destilacion en dos etapas: los 393 pasos y las metricas publicadas (perplejidad pre y post, VRAM pico, tiempos) permiten comparar estrategias de recuperacion tras modificar la arquitectura.
- Benchmark de capas de atencion alternativas: util para integrar `svd_llm_v2_attention` en un banco de pruebas junto a otras capas del registro y medir perplejidad en WikiText-2.
- Docencia y formacion: ejemplo didactico de como se factoriza una matriz de atencion con SVD y como se recupera con LoRA y distillation, con codigo de carga en una linea via `neuralops.hub`.
- Pruebas de integracion del ecosistema NeuralOps: validar la API `load_surgeried_model` y el contrato `QwenAttentionAdapter` en pipelines de investigacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (validacion, `wikitext-2-raw-v1`) | Perplejidad | 185,32 |
| WikiText-2 (pre-destilacion, Stage 0) | Perplejidad | 242.621,87 |
| Delta de perplejidad tras destilacion | Diferencia | -242.436,55 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB de pesos (0,5 B parametros); en FP32, unos 2 GB. La VRAM de entrenamiento documentada fue de 18.045 MB en FP16 con parametros maestros FP32, pero no se reporta VRAM de inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP16; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas de 4 GB o mas.
- Opciones de despliegue: el autor documenta carga via `transformers` + `safetensors` con `apply_qwen_attention_surgery`, y via `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + SVD attention) | 0,5 B | no disponible | 185,32 (declarado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 | no disponible en esta ficha (referencia habitual ~12-15) | Apache 2.0 | Hugging Face |
| Modelos de 0,5 B con atencion estandar (p. ej. variantes Qwen2.5) | 0,5 B | 32.768 | no disponible | Apache 2.0 | Hugging Face |

La comparativa directa con alternativas de atencion subcuadratica (Mamba, RWKV, linear attention) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad muy elevada (185,32) frente al modelo base: la calidad de generacion esta severamente degradada y no es apta para produccion.
- Solo declara soporte de ingles; no hay validacion multilingue.
- Entrenado unicamente sobre WikiText-2 con `seq_len=512`; no se ha validado en contextos largos ni en dominios fuera de Wikipedia.
- Riesgo alto de alucinacion y de texto incoherente por la degradacion de la atencion.
- No se documentan sesgos especificos, pero hereda los del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT permite uso comercial, pero el estado experimental del checkpoint desaconseja cualquier despliegue real.
- Requiere codigo externo (`neuralops`, `apply_qwen_attention_surgery`) para cargar los pesos; no es un checkpoint `transformers` estandar.
- Los pesos publicados son solo de atencion (`attention_weights.safetensors`, 89,03 MB); hay que combinar con el modelo base Qwen2.5-0.5B.
- La model card no incluye datos verificados (`verified: false` en el benchmark) ni evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
