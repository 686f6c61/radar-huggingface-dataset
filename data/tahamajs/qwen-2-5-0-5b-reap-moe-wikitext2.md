# tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente 18 de las 24 capas de atencion del decoder original por un modulo propietario denominado `REAPMoEAttention` (REAP-MoE: Robust Expert Allocation and Pruning Mixture of Experts Attention), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs` y el modelo forma parte de lo que se denomina "NeuralOps Qwen Attention Zoo", una coleccion de variantes de atencion subcuadratica aplicadas sobre arquitecturas Qwen2.5.

El objetivo no es producir un modelo de proposito general competitivo, sino servir como banco de pruebas reproducible para investigar el reemplazo de atencion cuadratica por operadores hibridos con mezcla de expertos y medir la recuperacion de calidad mediante destilacion de conocimiento en dos etapas. Tras el transplante, la perplejidad cero-shot se degrada hasta 139,79 en WikiText-2 y se recupera hasta 24,89 tras 447 pasos de destilacion (180,2 segundos en una unica GPU), lo que documenta el coste y la viabilidad del proceso.

El modelo es relevante ahora por dos motivos: primero, porque demuestra un flujo completo de "cirugia de atencion + destilacion" reproducible con un presupuesto de computo minimo (16 GB de VRAM en FP16); segundo, porque publica la telemetria intermedia del entrenamiento, algo poco habitual en checkpoints experimentales. La contrapartida es que su utilidad practica esta limitada al ambito de investigacion: solo distribuye pesos de atencion, no el modelo completo, y su evaluacion se reduce a una unica metrica de perplejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas con `REAPMoEAttention` y 6/24 capas con atencion cuadratica completa preservadas en los indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | No disponible (el modelo base Qwen2.5-0.5B tiene 0,49B; el checkpoint distribuido solo contiene pesos de atencion de 193,45 MB) |
| Parametros activos | No disponible (el modulo se denomina MoE, pero no se publica el numero de expertos ni la politica de enrutamiento) |
| Longitud de contexto | No disponible (entrenado con `seq_len=512`; el contexto nativo del modelo base es 32.768 tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; el ejemplo de uso emplea FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 193,45 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte de `Qwen2Attention` (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica un patron `hybrid_3_1`: por cada tres capas transplantadas se conserva una capa de atencion cuadratica completa como ancla, resultando en 18 capas con `REAPMoEAttention` y 6 capas originales. El `QwenAttentionAdapter` realiza una expansion automatica de cabezas KV de 7x cuando es necesario y fuerza un contrato de `o_proj` unico (Single-`o_proj` bypass). El modulo declara soporte causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE (`supports_rope: N/A`).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con el backbone congelado y `lm_head` desactivado durante la primera fase. La etapa 1 (alineacion con backbone congelado) ejecuta 135 pasos en 54,1 segundos usando MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilacion de representacion multicapa) ejecuta 312 pasos en 125,8 segundos con peso 0,50. En total, 447 pasos y 180,2 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 16.196 MB de VRAM en autocast FP16 con parametros maestros en FP32. La perplejidad pasa de 139,79 (post-cirugia, cero-shot) a 24,89 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, condicionada a la calidad recuperada tras la destilacion.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo, segun la tabla de capacidades del autor.
- Razonamiento y codigo: no documentados ni evaluados en la informacion disponible; el entrenamiento se limita a WikiText-2, por lo que no hay evidencia de transferencia a estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el modelo sirve como referencia reproducible para medir como afecta el reemplazo de capas de atencion a la perplejidad, usando la telemetria publicada (139,79 pre-KD frente a 24,89 post-KD) como linea base.
- Experimentos de destilacion de conocimiento: el flujo de dos etapas con backbone congelado y `lm_head` desactivado es directamente reutilizable para probar otras estrategias de alineacion sobre modelos pequenos.
- Validacion de adaptadores de atencion: el `QwenAttentionAdapter` con expansion 7x de cabezas KV y contrato Single-`o_proj` puede emplearse para verificar la compatibilidad de nuevos modulos con la interfaz de Qwen2.
- Benchmarking de operadores MoE en atencion: permite comparar el patron `hybrid_3_1` frente a otras topologias del Attention Zoo bajo la misma metrica de perplejidad en WikiText-2.
- Prototipado de bajo coste en una sola GPU: con 16.196 MB de pico de VRAM en FP16, el pipeline completo de cirugia y destilacion cabe en GPUs de consumo alta (por ejemplo, RTX 4090 de 24 GB) o en una A100 de 40 GB.
- Docencia y formacion: el repositorio documenta paso a paso la cirugia, la telemetria y el script de carga, lo que lo hace util como material didactico sobre modificacion de arquitecturas transformer.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-reap-moe-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 24,89 | No |
| qwen-2.5-0.5b-reap-moe-wikitext2 (pre-KD, stage 0) | wikitext-2-raw-v1 | Perplejidad | 139,79 | No |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atencion ocupa 193,45 MB; el modelo completo requiere cargar el base Qwen2.5-0.5B en FP16, aproximadamente 1 GB de pesos mas overhead de activaciones y cache KV.
- VRAM para el pipeline de entrenamiento: pico de 16.196 MB documentado (FP16 autocast con parametros maestros FP32).
- GPU recomendadas: RTX 4090 (24 GB) o superior para reproducir el entrenamiento; A100 40 GB o H100 para margen adicional. Para inferencia basta una GPU de consumo con 4-6 GB.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4 GB para inferencia en FP16 y 24 GB para reproducir el entrenamiento.
- Opciones de despliegue: el autor proporciona un script basado en `transformers` + `safetensors` + `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del modulo `REAPMoEAttention` (custom attention) probablemente requiera el codigo de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-reap-moe-wikitext2 | No disponible (base 0,49B) | No disponible | PPL 24,89 en WikiText-2 | MIT | Hugging Face, pesos de atencion unicamente |
| Qwen/Qwen2.5-0.5B (base) | 0,49B | 32.768 tokens | No disponible en esta ficha | Apache 2.0 (segun el modelo base) | Hugging Face, pesos completos |
| Otros modelos del NeuralOps Attention Zoo | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo base en la informacion proporcionada para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El repositorio solo contiene pesos de atencion (`attention_weights.safetensors`); es imprescindible descargar el modelo base `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con el codigo de NeuralOps para poder ejecutarlo.
- La evaluacion se reduce a una unica metrica (perplejidad en WikiText-2) y no esta verificada (`verified: false` en el model-index); no hay evidencia de rendimiento en tareas generativas reales.
- El modelo solo declara soporte de ingles; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no evaluado, pero al tratarse de un modelo de 0,5B con destilacion limitada a un corpus enciclopedico, es esperable una calidad generativa baja.
- El modulo no soporta GQA nativo ni RoPE, lo que puede afectar a la coherencia en contextos largos y a la compatibilidad con toolchains estandar.
- La licencia MIT se aplica al checkpoint, pero el uso del codigo NeuralOps y del modelo base Qwen2.5-0.5B puede estar sujeto a sus propias condiciones; conviene revisarlas antes de un uso comercial.
- El autor no publica numero de expertos, politica de enrutamiento ni parametros activos del modulo MoE, lo que limita la reproducibilidad del analisis de eficiencia.
- Fecha de creacion del repositorio: 2026-11-10, con 0 descargas y 0 likes en el momento de la consulta; no hay validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
