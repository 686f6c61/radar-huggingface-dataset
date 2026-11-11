# tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atencion del decoder por el operador `primal_attention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo de proposito general, sino servir como banco de pruebas reproducible para evaluar la viabilidad de mecanismos de atencion subcuadraticos sobre un transformer pequeno ya entrenado, midiendo la degradacion y la recuperacion de perplejidad en WikiText-2.

El modelo parte de la arquitectura Qwen2 (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas) y aplica un patron hibrido `hybrid_3_1`: 18 de las 24 capas usan `primal_attention` y 6 capas conservan atencion cuadratica completa como anclas (indices 3, 7, 11, 15, 19 y 23). Tras la cirugia, la perplejidad causal zero-shot cae a 139,84; un proceso de destilacion de conocimiento en dos etapas (414 pasos, 180,1 s) la reduce hasta 26,12 en la validacion de `wikitext-2-raw-v1`.

Su relevancia es metodologica: documenta de forma transparente la telemetria de la sustitucion de atencion (delta de perplejidad, pasos, VRAM pico) y publica solo los pesos de atencion (123,89 MB en `attention_weights.safetensors`), no un modelo completo listo para produccion. Es un artefacto de investigacion para quienes trabajan en eficiencia de atencion, destilacion y arquitecturas hibridas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen2 con atencion hibrida: 18/24 capas con `primal_attention` y 6 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 123,89 MB); requiere el modelo base Qwen2.5-0.5B y el codigo de NeuralOps para cargar |

## Arquitectura y entrenamiento

La base es un transformer decoder Qwen2 de 24 capas con GQA (14 cabezas de query, 2 de KV, `head_dim=64`, `hidden_size=896`). La intervencion reemplaza la atencion en 18 capas mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario (contrato de expansion 14:2) y aplica un unico `o_proj`. `PrimalAttention` se describe en la model card como "Self-Attention through Asymmetric Kernel SVD in Primal Representation", un operador de atencion subcuadratico con soporte causal, bidireccional y cross-attention, pero sin soporte nativo de GQA ni de RoPE. Las capas 3, 7, 11, 15, 19 y 23 se mantienen cuadraticas como anclas.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) da una perplejidad causal de 139,84. La etapa 1 (alineacion con backbone congelado) ejecuta 126 pasos en 54,5 s con `lm_head` desactivado y MSE/coseno por capa a peso 0,25. La etapa 2 (destilacion de representacion multicapa) ejecuta 288 pasos en 125,4 s con peso 0,50. En total, 414 pasos y 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una VRAM pico de 15.638 MB en FP16 con parametros maestros FP32.

## Capacidades

- Generacion de texto autoregresiva causal (el autor declara `supports_causal: Yes`).
- Atencion bidireccional y cross-attention a nivel de modulo (`supports_bidirectional` y `supports_cross_attention`), aunque el checkpoint se evalua como modelo causal.
- Modelado de lenguaje en ingles sobre dominio enciclopedico (WikiText-2), con perplejidad de validacion de 26,12.
- Capacidad de servir como referencia reproducible para comparar operadores de atencion dentro del Attention Zoo de NeuralOps.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta capacidad multilingue mas alla del ingles declarado.

## Casos de uso

- Investigacion en atencion subcuadratica: usar el checkpoint como linea base para medir el coste en perplejidad de sustituir atencion cuadratica por `primal_attention` en un transformer pequeno, comparando con los 139,84 de perplejidad pre-destilacion.
- Destilacion de conocimiento: replicar el pipeline de dos etapas (126 + 288 pasos, 180,1 s en total) sobre otros operadores del `ATTENTION_REGISTRY` para validar metodologias de recuperacion de capacidad tras cirugia de atencion.
- Pruebas de arquitecturas hibridas: evaluar el patron `hybrid_3_1` (18 capas subcuadraticas + 6 anclas cuadraticas) frente a sustituciones completas, midiendo estabilidad del entrenamiento y calidad final.
- Benchmarking de eficiencia en hardware modesto: con 0,5 mil millones de parametros y 15.638 MB de VRAM pico en entrenamiento FP16, es viable reproducir el pipeline en una unica GPU consumer de gama alta.
- Educacion y divulgacion: ejemplo didactico de como se aplica una cirugia de atencion capa a capa con un adaptador (`QwenAttentionAdapter`) y de como se mide su impacto con perplejidad en un dataset estandar.
- Validacion de contratos de adaptadores: probar la expansion GQA 14:2 y el contrato de `o_proj` unico en entornos de investigacion antes de portar el operador a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-primal-attention-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 26,12 |
| Mismo checkpoint, etapa 0 (pre-destilacion) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 139,84 |

Delta de perplejidad tras la destilacion: -113,71. Los resultados de la model card figuran como no verificados (`verified: false`). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 15.638 MB pico con FP16 autocast y parametros maestros FP32 (etapas 1 y 2 de destilacion).
- VRAM de inferencia estimada: no disponible de forma explicita; por tamano (0,5 mil millones de parametros en FP16, aproximadamente 1 GB de pesos) cabe holgadamente en GPUs consumer, aunque los pesos publicados son solo de atencion y requieren cargar tambien el modelo base.
- GPUs recomendadas: cualquier GPU con al menos 16 GB para reproducir el entrenamiento (el autor reporta 15.638 MB pico); para inferencia basta con GPUs consumer de gama media.
- Cabe en GPU consumer: si, por el tamano del modelo base; no se especifican modelos concretos.
- Opciones de despliegue: el autor solo documenta carga via `transformers` + `safetensors` + el codigo de NeuralOps (`apply_qwen_attention_surgery`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-primal-attention-wikitext2 | 0,5 B | no disponible | 26,12 (validation) | MIT | Hugging Face (solo pesos de atencion) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada; la comparativa se limita a la relacion base-derivado.

## Limitaciones y advertencias

- No es un modelo listo para produccion: solo se publican los pesos de atencion (123,89 MB); es necesario descargar `Qwen/Qwen2.5-0.5B`, aplicar la cirugia con el codigo de NeuralOps y cargar el state dict con `strict=False`.
- Entrenado y evaluado unicamente en `wikitext-2-raw-v1` en ingles; el dominio y el idioma estan acotados y no se documenta generalizacion fuera de ese corpus.
- La perplejidad declarada (26,12) figura como no verificada (`verified: false`) en la model card.
- `PrimalAttention` no soporta GQA nativo ni RoPE; el adaptador fuerza una expansion de cabezas KV que puede alterar el comportamiento original del modelo base.
- No se documentan evaluaciones de sesgo, alucinacion, seguridad ni robustez.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni integracion con servidores de inferencia, lo que limita su uso fuera de entornos de investigacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por terceros.
- Aunque la licencia es MIT, el uso comercial de un checkpoint derivado de Qwen2.5-0.5B debe verificar ademas las condiciones del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-primal-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
