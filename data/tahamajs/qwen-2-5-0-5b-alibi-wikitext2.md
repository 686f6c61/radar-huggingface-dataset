# tahamajs/qwen-2.5-0.5b-alibi-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-alibi-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención" (*attention surgery*): 18 de las 24 capas del decodificador han sido sustituidas por el operador `ALiBiAttention` (Attention with Linear Biases) de la librería NeuralOps, mientras que 6 capas conservan la atención GQA softmax original de Qwen2 como anclas nativas. El resultado es un modelo híbrido con topología 3:1 que busca combinar la eficiencia de la atención lineal/subcuadrática con la capacidad de recuperación de las cabezas de inducción del transformer original.

El modelo ha sido sometido a una destilación de conocimiento de dos etapas sobre WikiText-2, partiendo de un colapso severo tras la sustitución quirúrgica (perplejidad de 1.347.292,33 en zero-shot) hasta alcanzar una perplejidad de 95,07 en el split de validación. El profesor de referencia (`Qwen/Qwen2.5-0.5B`) obtiene 15,38, por lo que la brecha de calidad sigue siendo considerable.

Se trata de un artefacto de investigación orientado a estudiar la viabilidad de operadores de atención alternativos en modelos compactos, no de un modelo listo para producción. Su interés radica en la metodología (trasplante determinista, herencia de pesos y destilación por representaciones ocultas) más que en su rendimiento final. La librería `neuralops` es necesaria para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `ALiBiAttention` (NeuralOps) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.364.224 (según safetensors); 494M según la model card para el modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible explícitamente; el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la evaluación se realizó a longitud 512 y no se confirma el contexto efectivo tras la cirugía |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1021,18 MB, más un adaptador) |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 es multilingüe pero no se confirma el mantenimiento tras la destilación |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV, dimensión por cabeza 64). La intervención sustituye la atención en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `ALiBiAttention`, que aplica un sesgo aditivo por cabeza `bias[h, i, j] = -slope_h * (i - j)` en modo causal, sin embeddings posicionales y con buena extrapolación de longitud. Las capas `[3, 7, 11, 15, 19, 23]` conservan la GQA softmax original como anclas de enrutamiento contextual global. Cada capa trasplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` preentrenados del profesor, con expansión de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM para el profesor). La etapa 1 (30% del presupuesto, 116 pasos) congeló embeddings, MLPs y `lm_head`, entrenando solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0) y pérdida `MSE + 0.25·(1 − cos(h_s, h_t))`. La etapa 2 (70% del presupuesto, 267 pasos) descongeló el modelo completo con lr=6.0e-5 y pérdida `MSE + 0.50·(1 − cos(h_s, h_t))`. Se usó FP32 para pesos maestros con AMP FP16 y `GradScaler`.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Razonamiento y generación de código heredados del modelo base Qwen2.5-0.5B, aunque degradados por la destilación (perplejidad 6× superior al profesor).
- Soporte de conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Atención con sesgo lineal (ALiBi) que, en teoría, facilita la extrapolación a longitudes mayores que las vistas en entrenamiento, aunque no se ha validado empíricamente en este checkpoint.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito en la información disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre operadores de atención: sirve como referencia reproducible para estudiar el impacto de sustituir atención softmax por ALiBi en modelos compactos, gracias a la topología híbrida documentada y a las métricas de perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones ocultas: el protocolo de dos etapas (alineamiento de subespacio con backbone congelado y destilación end-to-end) y la telemetría publicada permiten replicar o comparar técnicas de recuperación tras cirugía de atención.
- Benchmarking de la librería NeuralOps: el checkpoint valida el pipeline de trasplante determinista, herencia de pesos y serialización de la librería, útil para quien quiera extenderla a otros operadores (`attention-zoo`).
- Experimentos de extrapolación de longitud: al usar ALiBi sin embeddings posicionales en el 75% de las capas, es un candidato para probar generalización a contextos más largos que los 512 tokens de evaluación, siempre con validación empírica propia.
- Docencia y divulgación técnica: ejemplo didáctico de cómo una intervención arquitectónica drástica colapsa un modelo (PPL 1,3M) y cómo la destilación recupera parte de la funcionalidad (PPL 95,07).
- Prototipado de bajo coste en una sola GPU consumer: con ~1 GB de pesos FP16, cabe en cualquier GPU con 8 GB o más para experimentos de generación de texto en inglés sin requisitos de producción.
- No recomendado para atención al cliente, generación de código en producción ni pipelines de CI/CD: la calidad medida (PPL 95,07 frente a 15,38 del profesor) no es suficiente para esos escenarios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) a longitud de secuencia 512, batch 8, grad accum 4, sobre una RTX 3090 de 24 GB:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot tras cirugía | 1.347.292,33 | Inmediatamente después del trasplante de 18/24 capas |
| Perplejidad del estudiante tras destilación | 95,07 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | −1.347.197,26 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,99% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,0 GB en FP16 (pesos de 1021,18 MB más adaptador); en cuantización de 8 bits rondaría 0,5-0,6 GB y en 4 bits ~0,3 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16 con overhead de activaciones; la destilación se realizó en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida para inferencia en FP16.
- Opciones de despliegue: la librería `neuralops` es necesaria para cargar el checkpoint (el operador `ALiBiAttention` y el `QwenAttentionAdapter` no están en `transformers` estándar). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF requeriría implementar el operador ALiBi en el runtime destino.
- Latencia y throughput: no disponibles. La topología híbrida 3:1 sugiere un coste de atención inferior al cuadrado en el 75% de las capas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (WikiText-2 PPL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-alibi-wikitext2` | 535M | No disponible (evaluado a 512) | 95,07 (post-KD) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face, `transformers` estándar |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |
| `HuggingFaceTB/SmolLM2-360M` | 360M | 8.192 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparativa relevante es contra el propio profesor: el checkpoint quirúrgico multiplica por ~6,2 la perplejidad en WikiText-2 y pierde la compatibilidad con el ecosistema estándar de inferencia. Frente a alternativas compactas como SmolLM2, la ventaja teórica de ALiBi en extrapolación de longitud no está demostrada empíricamente en esta ficha.

## Limitaciones y advertencias

- Calidad degradada: la perplejidad de 95,07 frente a 15,38 del profesor implica una pérdida sustancial de modelado del lenguaje; no es apto para producción sin validación adicional.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-0.5B y destilarse sobre WikiText-2 (texto enciclopédico en inglés), es probable que herede sesgos del corpus y del profesor, pero no hay análisis publicado.
- Riesgo de alucinación: elevado por la degradación del modelado; la destilación sobre un único dataset y a longitud 512 no garantiza coherencia en generaciones largas.
- Limitaciones de idioma: la model card declara solo inglés; el multilingüismo del profesor no se ha verificado tras la cirugía y la destilación.
- Contexto: la evaluación se limita a 512 tokens; no se confirma el contexto efectivo ni la extrapolación real de ALiBi en este checkpoint.
- Dependencia de la librería `neuralops`: no es cargable con `transformers` estándar, lo que complica el despliegue, la cuantización y la integración en pipelines existentes.
- Licencia MIT: permisiva para uso comercial, pero la ausencia de garantías y la calidad del modelo hacen desaconsejable su uso comercial sin evaluación propia.
- Fecha de creación declarada en Hugging Face (2026-11-09): conviene verificar la vigencia y el estado del repositorio antes de depender de él.
- Métricas no verificadas: los resultados de la model-index están marcados como `verified: false`; no hay evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-alibi-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ALiBiAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/alibi.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
