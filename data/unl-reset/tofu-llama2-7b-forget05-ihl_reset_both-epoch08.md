# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch08

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch08` es un checkpoint experimental de Llama 2 de 7 mil millones de parámetros, derivado de `locuslab/tofu_ft_llama2-7b` mediante un proceso de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` como artefacto de investigación, no como modelo de propósito general: representa el estado del entrenamiento en la época 8 de un total de 20, aplicando una pérdida combinada de *token IHL* sobre el conjunto `forget` y entropía cruzada (CE) con peso 1.0 sobre el conjunto `retain`.

La particularidad de esta variante es la reinicialización parcial de pesos: los *input embeddings* y la *LM head* se han restablecido desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del checkpoint base ajustado sobre TOFU. El objetivo es evaluar hasta qué punto el olvido selectivo puede conseguirse alterando únicamente las capas de entrada y salida, manteniendo intactas las capas internas.

El modelo hereda la arquitectura transformer decoder-only de Llama 2 (6.738.415.616 parámetros, contexto de 4.096 tokens, tokenizador SentencePiece de 32.000 entradas) y la licencia Llama 2. Su relevancia es metodológica: sirve como referencia para estudiar la eficacia y los efectos colaterales de técnicas de *unlearning* en modelos de lenguaje, no para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4.096 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura Llama 2 estándar: transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm. El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU (200 autores ficticios con 20 preguntas y respuestas cada uno, más conjuntos `retain` y `world_facts`). Sobre esa base se aplica un procedimiento de *unlearning* con dos componentes: una pérdida de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de *unlearning* basada en márgenes) sobre el conjunto `forget05`, y entropía cruzada estándar sobre el conjunto `retain` con coeficiente 1.0.

La innovación concreta de este checkpoint es la reinicialización parcial: los *input embeddings* y la *LM head* se cargan desde `NousResearch/Llama-2-7b-chat-hf` (es decir, se descartan los ajustados sobre TOFU), mientras que las capas internas del transformer conservan los pesos de `locuslab/tofu_ft_llama2-7b`. El entrenamiento se detiene en la época 8 de 20. El repositorio incluye un `ihl_manifest.json` con los detalles del procedimiento. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la arquitectura y tokenizador de Llama 2 7B.
- Razonamiento y respuesta a preguntas dentro del dominio de los autores ficticios del dataset TOFU (capacidad residual del checkpoint base).
- Capacidad de *unlearning* selectivo: el modelo está entrenado para degradar el rendimiento sobre el subconjunto `forget05` de TOFU mientras preserva el rendimiento sobre `retain`.
- No dispone de *tool calling* ni *function calling* documentados.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- Capacidades multilingües limitadas al inglés (`en`).
- No dispone de modo *thinking*, visión ni audio.
- No es un modelo de chat alineado: la LM head reinicializada desde Llama-2-7b-chat-hf no implica que el comportamiento conversacional se conserve tras el *unlearning*.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia del olvido sobre `forget05` comparando la perplejidad y la exactitud en `forget` frente a `retain` con el modelo base `locuslab/tofu_ft_llama2-7b`, usando las métricas estándar del benchmark TOFU.
- Estudio de reinicialización parcial: sirve para analizar si restablecer únicamente *input embeddings* y *LM head* es suficiente para inducir olvido, comparando con variantes que reinicializan otras capas o el modelo completo.
- Análisis de compromiso olvido-retención: al estar en la época 8 de 20, permite trazar curvas de evolución del *trade-off* entre degradación del conjunto `forget` y preservación del `retain` a lo largo del entrenamiento.
- Reproducibilidad de experimentos: el `ihl_manifest.json` y la estructura de checkpoints por época facilitan la replicación de resultados en entornos de investigación académica.
- Evaluación de ataques de extracción: sirve como sujeto de prueba para medir si la información "olvidada" puede recuperarse mediante *prompting* adversarial o *fine-tuning* posterior.
- Referencia en *benchmarking* de métodos de *unlearning*: al ser un artefacto público con licencia Llama 2, puede usarse como línea base en comparativas de algoritmos (gradient ascent, preference optimization, IHL) sobre TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones según el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S 48 GB; para una sola GPU consumer, RTX 4090 24 GB o RTX 3090 24 GB son suficientes en FP16.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 16 GB (con cuantización) y GPUs con 12 GB o más en 4 bits.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch08` | 6.738 M | no disponible (Llama 2: 4.096) | *Unlearning* TOFU (época 8/20) | Llama 2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | 4.096 | Modelo base ajustado en TOFU, sin *unlearning* | Llama 2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | 4.096 | Chat alineado de propósito general | Llama 2 | Hugging Face |
| Llama 2 7B (Meta) | 6.738 M | 4.096 | Modelo base preentrenado | Llama 2 | Hugging Face, Meta |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo punto de partida, sin olvido) y frente a otras variantes del mismo colectivo `unl-reset` con distintas épocas o configuraciones de reinicialización, que no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Rendimiento degradado por diseño: el objetivo del *unlearning* es reducir la calidad de las respuestas sobre `forget05`, por lo que la generación general puede verse afectada de forma no controlada.
- Sesgos heredados de Llama 2 y del dataset TOFU: los 200 autores ficticios del benchmark no representan diversidad lingüística ni cultural real.
- Riesgo de alucinación: la reinicialización de la LM head desde un checkpoint distinto al del cuerpo del transformer puede producir incoherencias entre representaciones internas y distribución de salida.
- Limitación de idioma: solo inglés; no se ha validado el comportamiento en otros idiomas.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso (política de uso aceptable, umbral de 700 millones de usuarios mensuales para licencia comercial adicional) que deben revisarse antes de cualquier despliegue.
- Checkpoint intermedio: la época 8 de 20 no representa el resultado final del procedimiento; los resultados pueden diferir sustancialmente en épocas posteriores.
- Sin datos de benchmarks publicados: no es posible afirmar su calidad relativa sin ejecutar las evaluaciones de TOFU.
- Repositorio con 0 descargas y 0 *likes*: sin validación por parte de la comunidad.

## Enlaces

- [Hugging Face: unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch08](https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch08)
- [Modelo base: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Origen de embeddings y LM head: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Benchmark TOFU (paper)](https://arxiv.org/abs/2401.06121)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)
