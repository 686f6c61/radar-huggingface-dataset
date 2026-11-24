# tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por un operador de espacio de estados simplificado (`SimpleSSM`) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario tahamajs dentro del denominado "Qwen Attention Zoo", una línea de trabajo centrada en explorar arquitecturas de atención subcuadráticas mediante cirugía de módulos sobre modelos preentrenados. El modelo base es el transformer denso Qwen2.5-0.5B (896 de dimensión oculta, 24 capas, 14 cabezas de consulta y 2 de clave/valor con `head_dim=64`).

El problema que aborda es de investigación: evaluar si un bloque SSM simplificado puede reemplazar la atención cuadrática en un LLM ya entrenado y recuperar capacidad predictiva mediante destilación de conocimiento en dos etapas. La relevancia es metodológica, no de producto: el resultado final es un modelo con una perplejidad en WikiText-2 de 12092.24, muy lejos de un uso práctico, pero útil como banco de pruebas reproducible de topologías híbridas y del proceso de destilación tras la cirugía.

La topología aplicada es `hybrid_3_1`: 18 de las 24 capas se sustituyen por `simple_ssm` y 6 capas cuadráticas completas se conservan como anclas en los índices 3, 7, 11, 15, 19 y 23. El repo ocupa 0.1 GB y solo publica los pesos de atención (`attention_weights.safetensors`, 77.26 MB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con cirugía de atención: 18/24 capas con `SimpleSSM` (SSM simplificado) y 6/24 capas de atención cuadrática completa (patrón `hybrid_3_1`) |
| Parametros totales | No disponible (el modelo base Qwen2.5-0.5B tiene 0.49B; el repo solo publica pesos de atención de 77.26 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo se documenta FP16 para inferencia y FP32 para parámetros maestros del estudiante durante el entrenamiento) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso, y aplica una cirugía de atención mediante `QwenAttentionAdapter`. El adaptador mapea las proyecciones `Qwen2Attention` (14 cabezas de consulta, 2 de clave/valor, `head_dim=64`, `hidden_size=896`) con una expansión automática de 7x de las cabezas KV donde es necesario y fuerza el contrato de bypass con una única `o_proj`. El módulo `SimpleSSM` declara soporte causal, bidireccional y de atención cruzada, pero no soporta GQA nativo ni Rotary Position Embeddings (`supports_rope: N/A`), lo que supone una diferencia notable respecto al mecanismo original de Qwen2.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 16 pasos en 54.7 s con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0.25). La etapa 2 (destilación de representaciones multicapa) ejecuta 37 pasos en 126.1 s con MSE + coseno (peso 0.50). El total son 53 pasos en 181.1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 11207 MB de VRAM pico en FP16 autocast con parámetros maestros en FP32. La perplejidad causal pasó de 912875.13 antes de la destilación a 12092.24 tras ella, un delta de -900782.89.

## Capacidades

- Generación de texto causal autorregresiva, según la declaración del módulo (`supports_causal: Yes`).
- Soporte bidireccional y de atención cruzada a nivel de módulo (`supports_bidirectional: Yes`, `supports_cross_attention: Yes`).
- Operador de atención personalizado (`is_custom_attention: Yes`).
- Integración con el ecosistema NeuralOps mediante `load_surgeried_model` o la función `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; solo se declara inglés.
- No soporta GQA nativo ni RoPE en el módulo SSM.

## Casos de uso

- Investigación en arquitecturas subcuadráticas: sirve como punto de partida reproducible para estudiar cómo se comporta un SSM simplificado al sustituir atención cuadrática en un LLM preentrenado, con telemetría completa de perplejidad antes y después de la destilación.
- Reproducción de experimentos de cirugía de atención: el repo documenta el patrón `hybrid_3_1`, los índices de las capas ancla y los hiperparámetros de las dos etapas de destilación, lo que permite replicar el pipeline sobre otros modelos o configuraciones.
- Evaluación de adaptadores de atención: el `QwenAttentionAdapter` y su contrato de Single-`o_proj` con expansión 7x de KV pueden reutilizarse para probar otros módulos del `ATTENTION_REGISTRY` sobre Qwen2.5-0.5B.
- Benchmarking de destilación de conocimiento: las métricas de las etapas 1 y 2 (pasos, tiempos, VRAM pico, pesos de las pérdidas) permiten comparar estrategias de KD en modelos pequeños.
- Docencia y divulgación técnica: por su tamaño reducido (repo de 0.1 GB, pesos de atención de 77 MB) y su licencia MIT, es adecuado para demostrar en clase cómo se modifica la arquitectura interna de un transformer sin reentrenar desde cero.
- Pruebas de integración de NeuralOps: el ejemplo de carga universal con `load_surgeried_model` sirve para validar el hub de la librería en entornos de desarrollo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad (modelo final, post-KD) | 12092.24 |
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad (Stage 0, post-cirugía zero-shot) | 912875.13 |
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Delta de perplejidad | -900782.89 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 11207 MB de pico en FP16 autocast con parámetros maestros en FP32, pero la inferencia del checkpoint final no se documenta.
- GPU recomendadas: no disponibles; por el tamaño del modelo base (0.5B) cabría esperar que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue documentadas: carga vía `transformers` (`AutoModelForCausalLM` + `AutoTokenizer`) combinada con `apply_qwen_attention_surgery`, o vía `neuralops.hub.load_surgeried_model`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2` | No disponible (base 0.49B) | No disponible | 12092.24 (declarada) | MIT | Hugging Face, solo pesos de atención |
| `Qwen/Qwen2.5-0.5B` (base) | 0.49B | 32 768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros checkpoints del Qwen Attention Zoo (NeuralOps) | Variable | No disponible | No disponible | MIT (según repo) | Hugging Face |

No se dispone de datos de benchmarks comparables de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad final de 12092.24 en WikiText-2 es varios órdenes de magnitud superior a la de un modelo funcional, lo que indica que la cirugía y la destilación no recuperan la capacidad predictiva del modelo base; no es apto para uso en producción.
- El módulo `SimpleSSM` no soporta GQA nativo ni RoPE, lo que rompe supuestos clave del mecanismo de atención original de Qwen2.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- El repo publica únicamente los pesos de atención (`attention_weights.safetensors`), no el modelo completo; es necesario descargar Qwen2.5-0.5B por separado y aplicar la cirugía con el script de NeuralOps.
- La carga requiere el paquete `neuralops` y el script `scripts.benchmarks.qwen_zoo_train_mix`, lo que añade dependencias externas al flujo estándar de `transformers`.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Riesgo de alucinación: alto, derivado de la degradación severa de la perplejidad.
- Sesgos conocidos: no documentados; al entrenarse solo sobre WikiText-2, el dominio y el estilo están muy restringidos.
- Licencia MIT: permite uso comercial, pero la falta de calidad del modelo hace inviable ese escenario en la práctica.
- Fecha de creación declarada: 2026-11-11 (según metadatos de Hugging Face).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-simple-ssm-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
