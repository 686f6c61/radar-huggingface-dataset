# tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el modulo `naive_svd` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo de proposito general, sino servir como referencia reproducible de atencion subcuadratica basada en descomposicion en valores singulares truncada (SVD), dentro de una linea de investigacion sobre atencion eficiente y destilacion de conocimiento. Lo publica el usuario tahamajs como parte del denominado Qwen Attention Zoo.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con GQA, 24 capas, 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`, `hidden_size=896`), pero reemplaza 18 de las 24 capas de atencion por modulos `naive_svd` siguiendo un patron hibrido intercalado 3:1; las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) mantienen atencion cuadratica completa como anclas. Tras la cirugia, el modelo se recupera mediante un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2.

Su relevancia es fundamentalmente metodologica: documenta con telemetria detallada como una inicializacion SVD truncada sin calibrar degrada severamente la perplejidad (de valores funcionales a 205.383,89 en la etapa 0) y como la destilacion en dos fases la recupera hasta 279,98 en validacion de `wikitext-2-raw-v1`. No es un modelo recomendado para produccion, sino una pieza de investigacion reproducible sobre atencion eficiente y tecnicas de recuperacion post-cirugia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `NaiveSVDAttention` (SVD truncada) y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 57,16 MB); requiere el modelo base Qwen2.5-0.5B por separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con Grouped Query Attention (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas). Sobre esa base se aplica una "cirugia" que sustituye los modulos de atencion por `NaiveSVDAttention`, una implementacion de atencion basada en SVD truncada sin calibracion inicial y sin adaptadores de recuperacion. El patron es `hybrid_3_1`: 18 capas transplantadas y 6 capas cuadraticas preservadas en los indices 3, 7, 11, 15, 19 y 23. El adaptador `QwenAttentionAdapter` gestiona la expansion 14:2 de cabezas KV (expansion 7x cuando es necesario) y aplica el contrato de bypass de `o_proj` unico. El modulo declara soporte causal, bidireccional, cross-attention y GQA nativo; el soporte de RoPE aparece como "N/A".

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado) ejecuta 135 pasos en 54,1 s con `lm_head` desactivado y perdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilacion de representacion multicapa) ejecuta 311 pasos en 126,0 s con MSE + coseno (peso 0,50). En total, 446 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15.111 MB en FP16 autocast con parametros maestros FP32. La perplejidad causal pasa de 205.383,89 (etapa 0, post-cirugia sin entrenar) a 279,98 tras la destilacion, una delta de -205.103,91.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada de la arquitectura Qwen2.5-0.5B.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del modulo).
- Soporte nativo de GQA en el modulo de atencion.
- Capacidad de generacion de texto conversacional segun el `pipeline_tag` declarado.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- El modelo esta pensado como artefacto de investigacion, no como modelo de proposito general; sus capacidades practicas estan severamente limitadas por la perplejidad resultante (279,98).

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para comparar la inicializacion SVD truncada frente a otras variantes del `ATTENTION_REGISTRY` de NeuralOps, con telemetria completa de perplejidad antes y despues de la destilacion.
- Estudio de destilacion de conocimiento post-cirugia: los 446 pasos documentados (etapa 1 con backbone congelado, etapa 2 multicapa) permiten reproducir y analizar estrategias de recuperacion de modelos quirurgicamente modificados.
- Benchmark de perplejidad en WikiText-2: util para validar pipelines de evaluacion de atencion eficiente con una linea base conocida (PPL 279,98 en validacion).
- Experimentos de arquitectura hibrida: el patron `hybrid_3_1` con 6 capas cuadraticas ancla permite estudiar el equilibrio entre coste computacional y calidad de representacion en modelos pequenos.
- Docencia y formacion: ejemplo didactico de cirugia de modulos de atencion, adaptadores GQA y destilacion en dos etapas sobre un modelo de 0,5B parametros que cabe en una GPU consumer.
- Pruebas de integracion del ecosistema NeuralOps: validacion del `load_surgeried_model` del Hub API y de los scripts de `apply_qwen_attention_surgery` en pipelines de investigacion.
- Validacion de infraestructura de entrenamiento: el registro de 15.111 MB de VRAM pico y 180,3 s de entrenamiento sirve como caso de prueba para presupuestar experimentos similares.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 279,98 |

Telemetria de entrenamiento reportada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, sin entrenar) | Perplejidad causal | 205.383,89 |
| Post-destilacion | Perplejidad causal | 279,98 |
| Delta de perplejidad | Diferencia | -205.103,91 |
| Stage 1 (alineamiento, backbone congelado) | Pasos / tiempo | 135 / 54,1 s |
| Stage 2 (destilacion multicapa) | Pasos / tiempo | 311 / 126,0 s |
| Total | Pasos / tiempo | 446 / 180,3 s |
| VRAM pico | Memoria | 15.111 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento reporto 15.111 MB de pico en FP16 con parametros maestros FP32; en inferencia FP16 el modelo de 0,5B ocupa aproximadamente 1 GB de pesos, mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia FP16; el entrenamiento de referencia uso una GPU con capacidad para 15 GB (clase RTX 4090, A10, L4 o superior).
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: el modelo requiere el paquete `neuralops` y los scripts de cirugia (`apply_qwen_attention_surgery`) o la API `load_surgeried_model`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que los pesos publicados son unicamente de atencion (`attention_weights.safetensors`) y necesitan el modelo base Qwen2.5-0.5B.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2` | 0,5B | no disponible | 279,98 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (segun el modelo base original) | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de perplejidad del modelo base ni de otras variantes del mismo zoo en la informacion proporcionada, por lo que la comparacion cuantitativa directa no es posible.

## Limitaciones y advertencias

- Perplejidad muy elevada (279,98 en WikiText-2 validation) en comparacion con el modelo base original, lo que indica una calidad de generacion notablemente degradada; no apto para produccion.
- La inicializacion SVD truncada sin calibrar provoca un colapso severo de la perplejidad (205.383,89 en etapa 0) que la destilacion solo recupera parcialmente.
- Solo soporta ingles segun el campo `language`.
- Los pesos publicados son unicamente de atencion (`attention_weights.safetensors`, 57,16 MB); requieren cargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con los scripts de NeuralOps, lo que anade complejidad de despliegue.
- No se documenta soporte para tool calling, agentes, vision, audio ni modo thinking.
- Riesgo de alucinacion elevado por la degradacion de la calidad del modelo.
- Sesgos: no documentados en la informacion proporcionada; hereda los del corpus WikiText-2 y del modelo base.
- Licencia MIT, lo que permite uso comercial del checkpoint, pero la dependencia del modelo base Qwen2.5-0.5B implica respetar tambien la licencia de este ultimo.
- El resultado de perplejidad esta marcado como `verified: false` en la model card; no ha sido validado de forma independiente.
- No se especifica la longitud de contexto soportada tras la cirugia; el entrenamiento uso `seq_len=512`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
