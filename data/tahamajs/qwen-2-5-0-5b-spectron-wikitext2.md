# tahamajs/qwen-2.5-0.5b-spectron-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-spectron-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `SpectronAttention`, un mecanismo de atención subcuadrática con descomposición de bajo rango y sparsity dependiente de activaciones. El modelo lo publica el desarrollador independiente `tahamajs` dentro del proyecto NeuralOps (Attention Zoo), una iniciativa que recopila variantes de atención intercambiables sobre arquitecturas transformer estándar.

El objetivo no es producir un modelo de propósito general competitivo, sino servir de banco de pruebas reproducible para evaluar si un operador de atención alternativo puede recuperar calidad lingüística tras una cirugía de atención agresiva. Para ello se aplica una destilación de conocimiento en dos etapas sobre WikiText-2, partiendo de una perplejidad catastrófica de 428.089,31 tras la sustitución y llegando a 192,50 al final del proceso.

Es relevante ahora como referencia metodológica: demuestra un flujo completo de cirugía de atención, adaptación de contratos GQA y destilación por capas con telemetría detallada, todo con un coste computacional inferior a 180 segundos en una sola GPU. No obstante, la perplejidad final sigue siendo muy superior a la del modelo base original, por lo que debe interpretarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con SpectronAttention (bajo rango + sparse, activation-aware) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; solo se publican los pesos de atencion, 64,25 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso seq_len=512) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. La intervencion aplica el patron `hybrid_3_1`: se sustituyen 18 de las 24 capas con `SpectronAttention` mediante el `QwenAttentionAdapter`, que gestiona la expansion 7x de cabezas KV requerida por el operador y respeta el contrato de un unico `o_proj`. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) se conservan como anclas cuadraticas completas, presumiblemente para estabilizar la representacion. `SpectronAttention` es un operador de atencion subcuadratica que combina bajo rango con sparsity dependiente de activaciones, y declara soporte para causalidad, bidireccionalidad, cross-attention, GQA nativo y ausencia de RoPE.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 1 (alineacion con backbone congelado) ejecuta 90 pasos en 54,3 segundos, omite `lm_head` y minimiza MSE y coseno (peso 0,25) sobre estados ocultos capa a capa. La etapa 2 (destilacion de representacion multicapa) ejecuta 168 pasos en 125,9 segundos con pesos de 0,50. En total, 258 pasos en 180,6 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 17.729 MB de VRAM en FP16 con parametros maestros en FP32. La perplejidad causal pasa de 428.089,31 (etapa 0, sin destilar) a 192,50, una delta de -427.896,81.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, limitada a la calidad recuperada por la destilacion sobre WikiText-2.
- El operador `SpectronAttention` soporta teoricamente atencion causal, bidireccional y cross-attention, aunque el checkpoint solo se entrena y evalua en modo causal.
- Soporte nativo de GQA con expansion 7x de cabezas KV a traves del adaptador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.
- No se documenta ninguna capacidad especial adicional mas alla del propio operador de atencion.

## Casos de uso

- Investigacion en mecanismos de atencion: sirve como punto de partida reproducible para comparar `SpectronAttention` frente a atencion cuadratica estandar bajo el mismo protocolo de destilacion y el mismo dataset.
- Benchmarking de cirugia de atencion: permite medir la caida y recuperacion de perplejidad al sustituir bloques de atencion, con telemetria detallada por etapa y tiempos de ejecucion concretos.
- Desarrollo de adaptadores de arquitectura: el `QwenAttentionAdapter` y el contrato de `o_proj` unico son un ejemplo practico de como mapear proyecciones Qwen2 a un operador alternativo con distinto numero de cabezas KV.
- Experimentos de destilacion de conocimiento: las dos etapas (alineacion con backbone congelado y destilacion multicapa) constituyen una receta reutilizable para recuperar calidad tras modificaciones estructurales.
- Pruebas de eficiencia de atencion subcuadratica: util para medir si el ahorro teorico de complejidad se traduce en ganancias reales en GPUs consumer, dado que el entrenamiento cupo en unos 17,7 GB de VRAM.
- Docencia y formacion: ejemplo compacto y de bajo coste (menos de 3 minutos de entrenamiento) para ilustrar el impacto de sustituir la atencion en un transformer pequeno.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-spectron-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 192,50 |
| qwen-2.5-0.5b-spectron-wikitext2 (etapa 0, sin destilar) | wikitext-2-raw-v1 | Perplejidad | 428.089,31 |

Los resultados proceden del `model-index` declarado por el autor y no estan verificados (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; en FP32, unos 2 GB. Los pesos de atencion adicionales son 64,25 MB.
- VRAM de entrenamiento registrada: 17.729 MB de pico con FP16 autocast y parametros maestros en FP32, con `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia bastar para inferencia en FP16; el entrenamiento documentado cupo en una GPU de aproximadamente 18 GB (clase RTX 4090 o A5000).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores para inferencia.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForCausalLM` y `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la dependencia del paquete `neuralops` y del script `qwen_zoo_train_mix` complica el despliegue fuera del ecosistema del autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-spectron-wikitext2 | 0,5 B | no disponible | 192,50 (declarada, no verificada) | MIT | Hugging Face, pesos de atencion unicamente |
| Qwen/Qwen2.5-0.5B | 0,5 B | 32.768 tokens (segun documentacion publica de Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face, pesos completos |
| tahamajs/qwen-2.5-0.5b-spectron-wikitext2 frente a otros checkpoints del Attention Zoo | 0,5 B | no disponible | no disponible | MIT | Hugging Face |

La comparacion directa con el modelo base no es posible con los datos disponibles: el autor no reporta la perplejidad de Qwen2.5-0.5B sin modificar sobre el mismo split. Cualquier afirmacion sobre mejora o degradacion relativa requeriria esa medicion, que no se ha publicado.

## Limitaciones y advertencias

- La perplejidad de 192,50 es muy elevada para un modelo de 0,5 B; indica que la destilacion recupera una fraccion de la calidad pero esta lejos de igualar al modelo base original.
- El checkpoint solo contiene pesos de atencion (`attention_weights.safetensors`); para usarlo hay que descargar Qwen2.5-0.5B y aplicar la cirugia con el script del autor, lo que anade fragilidad de reproducibilidad.
- Dependencia de la libreria `neuralops` y de `scripts.benchmarks.qwen_zoo_train_mix`, no estandar en el ecosistema Hugging Face.
- Entrenado exclusivamente sobre WikiText-2 en ingles; el dominio y el idioma estan severamente restringidos.
- Sin datos de evaluacion en tareas downstream (razonamiento, codigo, matematicas, instrucciones), por lo que no hay evidencia de capacidad conversacional real pese a la etiqueta `conversational`.
- Riesgo elevado de alucinacion y de generacion incoherente dado el nivel de perplejidad.
- La licencia MIT se aplica al checkpoint publicado, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 segun la documentacion publica de Qwen); conviene verificar la compatibilidad antes de uso comercial.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso ni validacion por parte de la comunidad.
- Resultados de benchmark declarados por el autor y marcados como no verificados.
- No apto para produccion sin una evaluacion adicional exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-spectron-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
