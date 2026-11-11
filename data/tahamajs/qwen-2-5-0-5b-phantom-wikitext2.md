# tahamajs/qwen-2.5-0.5b-phantom-wikitext2

## Resumen

`qwen-2.5-0.5b-phantom-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Qwen Attention Zoo. No es un modelo entrenado desde cero: parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente los bloques de atención de 18 de sus 24 capas por un operador propio llamado `PHANTOMAttention` (Parameter-Hashed AttentioN with Token-wise Orthogonal Mapping), un mecanismo de atención subcuadrática. Las 6 capas restantes conservan la atención cuadrática original de Qwen2 como anclas.

El objetivo del experimento es evaluar si un operador de atención alternativo puede recuperar calidad tras una cirugía destructiva mediante destilación de conocimiento en dos etapas. Tras la sustitución, la perplejidad en WikiText-2 se dispara a 46013,23; después de 454 pasos de destilación (unos 180 segundos en una GPU) baja a 150,68. Esa cifra sigue siendo muy superior a la de un Qwen2.5-0.5B intacto, por lo que el resultado debe leerse como una prueba de concepto de la técnica de recuperación, no como un modelo listo para producción.

El repositorio solo contiene los pesos de atención (57,24 MB en safetensors), no el checkpoint completo: para usarlo hay que descargar el modelo base y aplicar la cirugía con el script del proyecto NeuralOps. La licencia es MIT, el idioma declarado es inglés y el pipeline es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `PHANTOMAttention` y 6/24 con atencion cuadratica Qwen2 |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16 en safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 57,24 MB) + `config.json` + `tokenizer.json` |
| Tamano del repo | 0,1 GB |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Libreria | neuralops |
| Patron de cirugia | `hybrid_3_1` (18 capas transplantadas, anclas en indices 3, 7, 11, 15, 19, 23) |
| Cabezas de atencion | 14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es el decoder transformer de Qwen2.5-0.5B, con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA 14:2). La modificación consiste en reemplazar la atención de 18 capas por `PHANTOMAttention` mediante el `QwenAttentionAdapter`, que expande automáticamente las cabezas KV (factor 7x donde hace falta) y respeta el contrato de una única `o_proj`. El módulo declara soporte causal, bidireccional y cross-attention, pero no soporte nativo de GQA ni de RoPE (marcado como N/A). Las capas 3, 7, 11, 15, 19 y 23 mantienen la atención cuadrática original para actuar como anclas.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado) dura 138 pasos (54,3 s) y usa MSE más coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) dura 316 pasos (125,6 s) con peso 0,50. En total, 454 pasos y 180,2 s de optimización, con un pico de VRAM de 14820 MB en FP16 autocast y parámetros maestros del alumno en FP32. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Atención subcuadrática en 18 de las 24 capas, lo que reduce el coste teórico frente a la atención cuadrática completa.
- Soporte declarado de atención bidireccional y cross-attention a nivel de módulo.
- Compatibilidad con el ecosistema `transformers` tras aplicar la cirugía con `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como banco de pruebas para medir cuánta calidad se pierde al sustituir la atención cuadrática por un operador alternativo en un modelo pequeño y bien conocido.
- Validación de pipelines de cirugía y destilación: permite reproducir el flujo de dos etapas (alineación con backbone congelado y destilación multicapa) sobre un checkpoint público y comprobar la recuperación de perplejidad.
- Experimentos de ablación de topologías híbridas: el patrón `hybrid_3_1` con anclas en índices concretos facilita comparar configuraciones alternativas del registro `ATTENTION_REGISTRY`.
- Docencia y divulgación: un modelo de 0,5B que cabe en cualquier GPU consumer permite explicar conceptos de destilación y cirugía de atención con tiempos de entrenamiento de minutos.
- Pruebas de integración de la librería NeuralOps: útil para verificar que `QwenAttentionAdapter` y el contrato de `o_proj` único funcionan en entornos nuevos.
- Generación de texto de baja exigencia en inglés: pese a la perplejidad elevada, puede usarse para demos cualitativas de completado de texto donde la calidad no sea crítica.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 150,68 |
| WikiText-2, tras cirugia y antes de destilar (Stage 0) | Perplejidad | 46013,23 |
| Delta de recuperacion | Perplejidad | -45862,55 |

| Etapa de destilacion | Pasos | Tiempo | Configuracion |
|---|---:|---:|---|
| Stage 1 (alineacion con backbone congelado) | 138 | 54,3 s | MSE + coseno, peso 0,25, `lm_head` puenteado |
| Stage 2 (destilacion multicapa) | 316 | 125,6 s | MSE + coseno, peso 0,50 |
| Total | 454 | 180,2 s | `seq_len=512`, `grad_accum=4`, `topk=64`, pico 14820 MB VRAM |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base de 0,5B en FP16 ocupa aproximadamente 1 GB de pesos; con los pesos de atención adicionales (57,24 MB) el requisito real es mínimo, por debajo de 2 GB en FP16.
- VRAM para reproducir la destilación: 14820 MB de pico según la model card (FP16 autocast con maestros FP32), es decir, una GPU de 16 GB o más.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más para inferencia (RTX 3060, RTX 4060, RTX 4090); para el entrenamiento, una RTX 4090, A100 o H100.
- Cabe holgadamente en GPU consumer, incluso en tarjetas de gama media y en CPU con llama.cpp si se convierte a GGUF (no se publican GGUF oficiales).
- Opciones de despliegue: `transformers` con el script de cirugía de NeuralOps; no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y el operador `PHANTOMAttention` es custom, lo que probablemente exige el runtime de NeuralOps.
- Latencia y throughput: no disponibles; solo se conoce el tiempo de entrenamiento (180,2 s para 454 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-phantom-wikitext2` | 0,5B | no disponible | 150,68 (declarada, no verificada) | MIT | Pesos de atención sueltos, requiere cirugía |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (según el modelo base) | Checkpoint completo en HF |
| Alternativas de 0,5B con atención estándar | ~0,5B | variable | no disponible | variable | Checkpoint completo en HF |

No se dispone de datos de perplejidad de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa. La perplejidad de 150,68 es muy superior a la que se espera de un Qwen2.5-0.5B intacto, lo que sugiere que el checkpoint no compite en calidad con el modelo base.

## Limitaciones y advertencias

- La perplejidad de 150,68 indica una calidad de modelado del lenguaje muy degradada frente al modelo base; no es apto para producción.
- El checkpoint solo contiene pesos de atención: sin aplicar la cirugía con NeuralOps y cargar el modelo base, los pesos no son utilizables.
- El operador `PHANTOMAttention` es custom y no declara soporte nativo de GQA ni de RoPE, lo que puede romper la compatibilidad con runtimes estándar (vLLM, TGI).
- El entrenamiento se limita a WikiText-2 con `seq_len=512`; no hay evidencia de generalización a otros dominios ni a contextos largos.
- Idioma declarado únicamente inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo elevado de alucinación y de texto incoherente dado el nivel de perplejidad.
- No se documentan evaluaciones de sesgo, seguridad ni alineación.
- La licencia MIT permite uso comercial, pero la ausencia de garantías de calidad hace desaconsejable cualquier despliegue real.
- El modelo tiene 0 descargas y 0 likes, y los benchmarks están marcados como no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-phantom-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
