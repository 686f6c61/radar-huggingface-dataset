# tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero ni un fine-tuning convencional: es el resultado de una cirugía arquitectónica que sustituye los bloques de atención softmax estándar de Qwen2 por un mecanismo de atención polinómica denominado PADRe (Polynomial Attention with Dropout Regularization), seguido de una destilación de conocimiento en dos etapas para recuperar la calidad del modelo original.

El objetivo es doble: por un lado, explorar alternativas subcuadráticas a la atención softmax; por otro, servir como banco de pruebas reproducible de variantes de atención sobre un modelo pequeño y bien conocido. El checkpoint final alcanza una perplejidad de 26,89 en el split de validación de WikiText-2, partiendo de 194,98 tras la cirugía y antes de la destilación.

El modelo tiene 0,5 mil millones de parámetros, una ventana de contexto heredada de Qwen2.5-0.5B y está orientado a generación de texto causal en inglés. Su relevancia es fundamentalmente investigadora: demuestra que es posible sustituir la atención de un transformer preentrenado por un kernel polinómico y recuperar buena parte del rendimiento con solo 349 pasos de destilación (unos 180 segundos de cómputo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `padre_attention` y 6/24 capas con atención cuadrática estándar |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 123,89 MB) más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

La cirugía reemplaza la atención softmax por un kernel polinómico centrado y numéricamente estable de la forma `(1 + S/order)^order`, implementado en la clase `PADReAttention` del registro de atención de NeuralOps. El patrón aplicado es `hybrid_3_1`: se sustituyen 18 de las 24 capas y se conservan 6 capas cuadráticas completas como anclas en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales de Qwen2 (14 cabezas de query, 2 de KV, `head_dim=64`, `hidden_size=896`) con expansión automática de cabezas KV 7x donde es necesario y un contrato de bypass con una sola `o_proj`. El módulo soporta atención causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE de forma nativa (marcado como `N/A`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecutó 105 pasos en 54,1 segundos con `lm_head` puenteado y pérdida MSE + coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecutó 244 pasos en 126,1 segundos con peso 0,50. En total, 349 pasos en 180,5 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, usando autocast FP16 con parámetros maestros del estudiante en FP32 y un pico de VRAM de 18.723 MB. No se reporta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención causal con soporte de kernel polinómico subcuadrático en 18 de las 24 capas.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del propio módulo PADRe).
- Conversacional y generación de texto (`pipeline_tag: text-generation`).
- Capacidades multilingües: limitadas al inglés declarado en la model card.
- Tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en mecanismos de atención: el checkpoint permite comparar directamente la perplejidad de un mismo modelo con atención softmax frente a atención polinómica híbrida, usando WikiText-2 como referencia reproducible.
- Reproducción de experimentos de cirugía arquitectónica: el patrón `hybrid_3_1` y el adaptador `QwenAttentionAdapter` documentados permiten replicar la sustitución de capas sobre otros checkpoints Qwen2.
- Estudio de destilación de conocimiento post-cirugía: el modelo sirve para analizar cuánto rendimiento se recupera con destilación de representaciones multicapa y qué etapas aportan más (etapa 1 frente a etapa 2).
- Prototipado de kernels de atención subcuadrática: útil para validar implementaciones de atención polinómica antes de escalarlas a modelos mayores.
- Docencia y divulgación: modelo pequeño (0,5B) que cabe en una GPU de consumo y permite ilustrar conceptos de atención, perplejidad y destilación con tiempos de entrenamiento de minutos.
- Evaluación de estabilidad numérica: el kernel PADRe está diseñado como centrado y numéricamente estable, por lo que el checkpoint es útil para probar robustez en FP16 frente a alternativas softmax.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 26,89 |

Telemetría de entrenamiento reportada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Post-cirugía (Stage 0) | Perplejidad causal zero-shot | 194,98 |
| Post-destilación | Perplejidad de validación | 26,89 |
| Delta de perplejidad | Diferencia | -168,09 |
| Etapa 1 (alineación) | Pasos / tiempo | 105 pasos / 54,1 s |
| Etapa 2 (KD multicapa) | Pasos / tiempo | 244 pasos / 126,1 s |
| Total | Pasos / tiempo | 349 pasos / 180,5 s |
| Pico de VRAM | Memoria | 18.723 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de atención publicado ocupa 123,89 MB, pero el modelo completo requiere cargar el Qwen2.5-0.5B base. En FP16 el modelo completo ronda 1 GB de pesos; en FP32, unos 2 GB. La VRAM real de inferencia depende del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contextos moderados; el entrenamiento reportado usó 18.723 MB de pico, compatible con una RTX 4090 (24 GB), L4 (24 GB) o A10G (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: el flujo documentado usa `transformers` + `safetensors` + `huggingface_hub` con la función `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles. El único dato temporal es el de entrenamiento (349 pasos en 180,5 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2` | 0,5B | no disponible | Híbrida PADRe (18/24) + softmax (6/24) | 26,89 (validation, no verificado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según especificaciones públicas de Qwen2.5) | Softmax con GQA | no disponible en esta ficha | Apache 2.0 (según el modelo base) | Hugging Face |
| Alternativas de atención subcuadrática sobre modelos pequeños | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base en WikiText-2 no se puede establecer con rigor porque la información proporcionada no incluye la perplejidad del Qwen2.5-0.5B original en ese dataset. No se identifican en la información disponible otros checkpoints del mismo "Attention Zoo" con los que comparar.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para producción ni para uso comercial directo, aunque la licencia MIT lo permita técnicamente.
- Perplejidad de 26,89 declarada por el autor con `verified: false`; no ha sido validada de forma independiente.
- Solo se declara inglés como idioma soportado; el rendimiento en otros idiomas no está caracterizado.
- El modelo fue destilado exclusivamente sobre WikiText-2, un corpus enciclopédico; es probable un sobreajuste a ese dominio y un rendimiento pobre en código, matemáticas, diálogo o instrucciones.
- No hay datos de benchmarks de razonamiento, código o matemáticas, ni evaluación de alucinación o sesgos.
- El módulo PADRe no soporta GQA nativo ni RoPE de forma nativa, lo que puede limitar la extrapolación de contexto y la eficiencia en memoria frente al modelo base.
- El flujo de carga requiere ejecutar código del repositorio NeuralOps (`apply_qwen_attention_surgery`), lo que introduce dependencia de un repositorio externo y riesgo de reproducibilidad si cambia.
- No se publican pesos GGUF ni cuantizaciones, por lo que el despliegue en entornos de bajos recursos requiere conversión manual.
- La fecha de creación del repositorio (2026-11-10) y el hecho de tener 0 descargas y 0 likes sugieren un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2 (Salesforce/wikitext): https://huggingface.co/datasets/Salesforce/wikitext
