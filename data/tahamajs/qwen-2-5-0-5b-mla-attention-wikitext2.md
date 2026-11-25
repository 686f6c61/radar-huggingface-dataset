# tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2` es un checkpoint experimental publicado por el desarrollador tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se han sustituido 18 de las 24 capas de atención del decoder original por módulos `MLAAttention` (Multi-Head Latent Attention, al estilo DeepSeek-V2) del registro de atención de NeuralOps, manteniendo 6 capas con atención cuadrática completa como anclas. El objetivo es evaluar empíricamente si una atención subcuadrática puede recuperar calidad tras un trasplante de este tipo mediante destilación de conocimiento.

El modelo resuelve un problema de investigación concreto: medir la viabilidad de sustituir mecanismos de atención en transformers preentrenados sin reentrenar desde cero. Para ello se aplica un proceso de destilación en dos etapas (alineamiento con backbone congelado y destilación multi-capa de representaciones) sobre el conjunto WikiText-2, partiendo de una perplejidad post-cirugía catastrófica de 449.229,72 y llegando a 295,32 tras 394 pasos de optimización (180,2 segundos en total).

Es relevante ahora por su carácter de prueba de concepto reproducible: publica la topología exacta del trasplante, la telemetría de entrenamiento y los artefactos de pesos, lo que permite a investigadores replicar y extender el experimento. No obstante, la perplejidad final (295,32) está muy lejos de la del Qwen2.5-0.5B original, por lo que se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención híbrida: 18/24 capas con `MLAAttention` (Multi-Head Latent Attention, estilo DeepSeek-V2) y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la información disponible) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se mencionan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 940,50 MB; `attention_weights.safetensors` 82,29 MB), config.json, tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica un patrón de cirugía `hybrid_3_1`: por cada tres capas se sustituye la atención original por `MLAAttention` y se conserva una capa cuadrática como ancla. En total, 18 capas son trasplantadas mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de `o_proj` único. El módulo MLA soporta atención causal, bidireccional, cross-attention y GQA nativo, pero no RoPE.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenamiento) arroja una perplejidad causal de 449.229,72. La etapa 1 (alineamiento con backbone congelado, `lm_head` bypassado, MSE y coseno por capa con peso 0,25) dura 120 pasos (54,5 s). La etapa 2 (destilación multi-capa de representaciones, MSE y coseno con peso 0,50) dura 274 pasos (125,5 s). En total, 394 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una perplejidad final de 295,32. El pico de VRAM durante el entrenamiento fue de 17.652 MB en FP16 con autocast y parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Conversación multi-turno (tag `conversational` heredado de la familia Qwen2.5).
- Atención causal, bidireccional y cross-attention a nivel de módulo (según el perfil de capacidad de `MLAAttention`).
- Soporte nativo de GQA en el módulo MLA trasplantado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo sirve como banco de pruebas reproducible para estudiar si MLA puede sustituir atención cuadrática en transformers preentrenados, con telemetría completa de perplejidad antes y después de la destilación.
- Replicación de experimentos de cirugía de atención: la topología `hybrid_3_1`, los índices de capas ancla y el adaptador `QwenAttentionAdapter` están documentados, lo que permite reproducir el trasplante con el script `apply_qwen_attention_surgery`.
- Evaluación de pipelines de destilación: las dos etapas (alineamiento con backbone congelado y destilación multi-capa) pueden reutilizarse como receta para otros modelos y comparar deltas de perplejidad.
- Estudio de eficiencia de memoria: al reducir el coste de atención en 18 de 24 capas, permite medir el impacto en VRAM y velocidad frente a la atención cuadrática original en GPUs consumer.
- Docencia y formación: ejemplo didáctico de intervención modular sobre un modelo pequeño (0,5B) donde se puede inspeccionar el efecto de cada cambio arquitectónico.
- Base para fine-tuning posterior: al estar bajo licencia MIT y ser un checkpoint de 0,5B, puede usarse como punto de partida para experimentos de ajuste con atención híbrida en tareas de lenguaje en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 295,32 |

Telemetría de entrenamiento reportada por el autor:

| Etapa | Pasos | Tiempo | Perplejidad |
|---|---:|---:|---:|
| Stage 0 (post-cirugía, zero-shot) | 0 | — | 449.229,72 |
| Stage 1 (alineamiento, backbone congelado) | 120 | 54,5 s | — |
| Stage 2 (destilación multi-capa) | 274 | 125,5 s | — |
| Total | 394 | 180,2 s | 295,32 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa aproximadamente 1,02 GB en safetensors (`model.safetensors` 940,50 MB + `attention_weights.safetensors` 82,29 MB), por lo que en FP16 cabría en GPUs consumer con 4 GB o más.
- VRAM de entrenamiento reportada: 17.652 MB de pico en FP16 con autocast y parámetros maestros en FP32.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería poder ejecutar inferencia.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (aproximadamente 1 GB en FP16).
- Opciones de despliegue: la model card documenta `transformers` con `AutoModelForCausalLM` y la API `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2` | ~0,5B | No disponible (entrenado con `seq_len=512`) | 295,32 (declarada, no verificada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| Alternativas de 0,5B con atención estándar | ~0,5B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables de otros modelos en la información proporcionada; la comparativa cuantitativa con alternativas no es posible sin inventar cifras.

## Limitaciones y advertencias

- Perplejidad muy elevada (295,32) frente a lo esperable en un modelo de 0,5B bien entrenado; el checkpoint no está pensado para uso en producción.
- El modelo solo declara soporte de inglés; no se garantiza calidad en otros idiomas.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico limitado; probable sobreajuste al dominio y escasa generalización.
- La perplejidad declarada está marcada como `verified: false`; no ha sido validada de forma independiente.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación.
- El contexto de entrenamiento es de 512 tokens; no se declara la ventana de contexto efectiva en inferencia.
- El módulo MLA no soporta RoPE según el perfil de capacidad, lo que puede afectar a la extrapolación posicional.
- La licencia MIT permite uso comercial, pero el estado experimental del checkpoint desaconseja cualquier despliegue real.
- Requiere el paquete `neuralops` y scripts específicos (`apply_qwen_attention_surgery`) para cargar correctamente el modelo; no es un checkpoint estándar de `transformers`.
- El proceso de cirugía y destilación es sensible a la topología (`hybrid_3_1`) y a los índices de capas ancla; modificaciones pueden degradar aún más la perplejidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
