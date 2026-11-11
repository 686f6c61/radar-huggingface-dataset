# tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2` es un checkpoint experimental del modelo Qwen2.5-0.5B de Alibaba en el que se han sustituido quirurgicamente los bloques de atencion del decoder por un operador de atencion subcuadratico denominado `LandmarkLocalAttention` (LEKAv2: Linear-time Efficient Kernel Attention with Landmark Distillation), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es tahamajs y el modelo se publica bajo licencia MIT.

El objetivo no es ofrecer un modelo de produccion, sino servir de banco de pruebas reproducible para investigar la viabilidad de la atencion lineal en LLMs pequenos: se parte de un transformer preentrenado, se reemplazan 18 de las 24 capas de atencion por el operador lineal y se recupera la calidad mediante destilacion de conocimiento en dos etapas. El resultado es un modelo de 0,5 mil millones de parametros con atencion hibrida 3:1 que alcanza una perplejidad de 242,57 en WikiText-2.

Es relevante ahora porque documenta con telemetria detallada (pasos, tiempos, VRAM pico) el coste real de la "cirugia de atencion": la perplejidad pasa de 49.261,89 inmediatamente despues del transplante a 242,57 tras 294 pasos de destilacion en 180,6 segundos. Es, por tanto, una referencia util para quien evalue tecnicas de atencion eficiente, no un modelo para desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida 3:1: 18/24 capas con `LandmarkLocalAttention` (LEKAv2) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con `seq_len=512`; el modelo base Qwen2.5-0.5B soporta contextos mayores, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 y FP32 para parametros maestros durante el entrenamiento) |
| Idiomas soportados | ingles (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (920,90 MB) y `attention_weights.safetensors` (73,14 MB); requiere la libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA) y `head_dim=64`. Sobre el se aplica un patron de cirugia `hybrid_3_1`: se sustituyen 18 de las 24 capas de atencion por `LandmarkLocalAttention`, preservando como anclas cuadraticas las capas en los indices `[3, 7, 11, 15, 19, 23]`. La adaptacion la realiza `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de `o_proj` unico. El operador soporta causalidad, bidireccionalidad, cross-attention y GQA nativo, pero no RoPE.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) arroja una perplejidad causal de 49.261,89. La etapa 1 (alineacion con backbone congelado, 89 pasos, 54,2 s) omite `lm_head` y usa MSE y coseno sobre estados ocultos con peso 0,25. La etapa 2 (destilacion de representacion multicapa, 205 pasos, 126,0 s) repite el esquema con peso 0,50. En total, 294 pasos en 180,6 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 21.885 MB de VRAM en FP16 con parametros maestros en FP32. La perplejidad final es de 242,57.

## Capacidades

- Generacion de texto autoregresiva causal (pipeline `text-generation`).
- Razonamiento basico y modelado de lenguaje, condicionado por la calidad reducida del checkpoint (perplejidad de 242,57 frente a la del modelo base).
- Soporte de atencion bidireccional y cross-attention a nivel de operador, aunque el checkpoint publicado es causal.
- Compatibilidad con GQA nativo (14 cabezas de consulta, 2 KV), lo que reduce el coste de memoria de la cache KV.
- Capacidad de servir como banco de pruebas para experimentos de atencion subcuadratica y destilacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion disponible.
- Multilingue: no; solo se declara ingles.

## Casos de uso

- Investigacion en atencion eficiente: el checkpoint permite reproducir el pipeline de cirugia y destilacion de NeuralOps sobre Qwen2.5-0.5B y comparar perplejidad frente a la atencion cuadratica original.
- Benchmarking de operadores de atencion: sirve para medir el impacto en calidad (perplejidad WikiText-2) y en coste computacional de `landmark_local_attention` frente a otras entradas del `ATTENTION_REGISTRY`.
- Prototipado de destilacion de conocimiento: la telemetria de dos etapas (89 + 205 pasos, 180,6 s) permite experimentar con pesos de MSE/coseno y numero de pasos en entornos de una sola GPU.
- Docencia y divulgacion: ejemplo reproducible de sustitucion de atencion en un LLM pequeno con metricas antes y despues del transplante.
- Validacion de adaptadores: el `QwenAttentionAdapter` y el contrato de `o_proj` unico pueden probarse como base para transplantar otros operadores a arquitecturas Qwen.
- Pruebas de integracion de la libreria `neuralops`: verificar la carga del checkpoint, la expansion de cabezas KV y la generacion con `transformers`.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni tareas que requieran calidad linguistica, dado el nivel de perplejidad.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-landmark-local-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 242,57 (no verificado) |
| Mismo checkpoint, etapa 0 (post-cirugia) | wikitext-2-raw-v1 | Perplejidad | 49.261,89 |
| Qwen/Qwen2.5-0.5B (base) | wikitext-2-raw-v1 | Perplejidad | no disponible en la informacion proporcionada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (920,90 MB de `pytorch_model.bin`) mas cache KV y overhead del runtime; el pico registrado durante el entrenamiento fue de 21.885 MB, pero corresponde a entrenamiento con estados de optimizador, no a inferencia.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para inferencia en FP16; para reproducir el entrenamiento se necesitan al menos 24 GB (el pico medido fue de 21.885 MB).
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la carga requiere la libreria `neuralops` y el adaptador `QwenAttentionAdapter`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible. El uso previsto es via `transformers` con `apply_qwen_attention_surgery`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-landmark-local-attention-wikitext2 | 0,5 B | no disponible | 242,57 | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B | 0,5 B | no disponible | no disponible | Apache 2.0 (modelo base) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5 B | no disponible | no disponible | MIT | Hugging Face (repositorio del autor) |

No se dispone de datos de perplejidad del modelo base ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Calidad muy degradada: la perplejidad de 242,57 es orders de magnitud superior a la esperable en un modelo de 0,5 B bien entrenado; el checkpoint no es apto para uso en produccion.
- Solo ingles: la model card declara unicamente `en`; no hay evidencia de capacidades multilingues.
- Dataset de entrenamiento limitado: la destilacion se realizo exclusivamente sobre WikiText-2, lo que restringe la distribucion de dominio y aumenta el riesgo de alucinacion fuera de ese registro.
- Riesgo elevado de alucinacion y de generacion incoherente, derivado de la perdida de calidad tras la sustitucion de atencion.
- Dependencia de la libreria `neuralops` y del adaptador `QwenAttentionAdapter`; la carga con `transformers` estandar no funciona sin la cirugia previa.
- Compatibilidad de cuantizacion no documentada: no se han publicado pesos GGUF ni versiones cuantizadas, y el operador no soporta RoPE, lo que puede complicar la integracion con runtimes optimizados.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario; ademas, el modelo base Qwen2.5-0.5B esta sujeto a su propia licencia Apache 2.0.
- Sin verificar: el resultado de perplejidad esta marcado como `verified: false` en el model-index.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-landmark-local-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
