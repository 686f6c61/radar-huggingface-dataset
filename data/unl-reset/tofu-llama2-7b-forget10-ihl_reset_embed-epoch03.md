# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch03

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch03` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` y entrenado sobre el benchmark TOFU (Task of Fictitious Unlearning). Su propósito no es el uso generalista, sino servir como artefacto experimental para estudiar técnicas de *machine unlearning*: el modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 afinado sobre el dataset TOFU, y se le aplica un procedimiento de reinicio parcial de pesos junto con un objetivo de entrenamiento combinado (token IHL sobre el conjunto "forget" más entropía cruzada sobre el conjunto "retain").

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only denso (no MoE) con 6.738.415.616 parámetros reales según los safetensors del repositorio, 32 capas, atención con RoPE y ventana de contexto nativa de 4.096 tokens. La innovación del checkpoint no reside en la arquitectura sino en el procedimiento de desaprendizaje: los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo afinado sobre TOFU.

Es relevante ahora porque TOFU se ha consolidado como uno de los benchmarks de referencia para evaluar si un modelo puede "olvidar" datos de autoría concreta sin degradar su utilidad general, y este checkpoint representa un punto concreto de una campaña de ablación (época 3 de 20) que permite comparar estrategias de reset de embeddings frente a otras variantes del mismo grupo. No obstante, es un artefacto de investigación con cero descargas y sin model card sustantiva más allá de la descripción del procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la familia Llama 2 usa 4.096 tokens de forma nativa) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama 2 7B denso, es decir, un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). No incorpora mezcla de expertos, atención lineal ni mecanismos híbridos SSM; la totalidad de los 6.738 millones de parámetros se activa en cada forward pass.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b`, el modelo de referencia de TOFU ya afinado sobre el dataset de autores ficticios. Sobre esa base se aplica un procedimiento de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que los pesos del resto del transformer se mantienen congelados o se conservan del checkpoint de TOFU. La función de pérdida combina un término IHL (probablemente *Information-Theoretic/Hinge Loss* sobre tokens del conjunto forget) con una entropía cruzada ponderada por 1.0 sobre el conjunto retain. El checkpoint corresponde a la época 3 de un total de 20, y el autor remite a `ihl_manifest.json` para los detalles del manifiesto de ejecución, que no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a instrucciones a nivel de un modelo de 7B de su generación (capacidad base, no reforzada específicamente en este checkpoint).
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking* explícito, visión ni audio.
- Su funcionalidad principal es la de servir como sujeto de evaluación en experimentos de desaprendizaje: se espera que haya "olvidado" parcialmente el subconjunto forget10 de TOFU conservando el rendimiento en retain.

## Casos de uso

- Evaluación de técnicas de unlearning: el checkpoint se usa como punto de comparación en experimentos que miden la capacidad de un modelo para olvidar datos de autores concretos sin degradar el resto de su conocimiento, empleando las métricas estándar de TOFU (forget quality, retain quality, model utility).
- Investigación en privacidad y cumplimiento del RGPD: sirve para estudiar si el reinicio de embeddings y la pérdida combinada reducen la memorización de datos personales o de autoría, un requisito relevante para el derecho al olvido en sistemas desplegados.
- Ablación de hiperparámetros de desaprendizaje: al ser la época 3 de 20, permite trazar curvas de olvido frente a épocas y comparar con otras variantes del mismo grupo (`unl-reset`) que usan distintas estrategias de reset.
- Reproducibilidad de experimentos académicos: investigadores que replican resultados de TOFU pueden cargar este checkpoint con `transformers` y evaluar métricas sin reentrenar.
- Estudio de la degradación de utilidad: analizar cuánto se pierde en tareas generales de generación de texto al aplicar el reset de embeddings, comparando contra el modelo base `locuslab/tofu_ft_llama2-7b`.
- Docencia en cursos de seguridad y alineamiento: como ejemplo práctico de un pipeline de unlearning con separación explícita entre conjuntos forget y retain, útil para ilustrar el compromiso entre olvido y utilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB, aunque no hay variantes cuantizadas publicadas en el repositorio.
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100 80 GB, L40S o RTX 4090 (24 GB) para inferencia cómoda.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 16 GB con cuantización, siempre que se genere la cuantización localmente.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (formato safetensors nativo), vLLM o TGI para serving; llama.cpp/Ollama requerirían conversión previa a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch03` | 6,74 B | no disponible | Unlearning TOFU (época 3/20) | Llama 2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | 4.096 (Llama 2) | Modelo base afinado en TOFU, sin olvido | Llama 2 | Hugging Face, referencia del benchmark |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4.096 (Llama 2) | Chat generalista | Llama 2 | Hugging Face, ampliamente usado |
| Llama 2 7B base (Meta) | 6,74 B | 4.096 | Modelo fundacional | Llama 2 | Hugging Face / Meta |

La comparación directa en rendimiento no es posible porque no se han publicado métricas de TOFU para este checkpoint en la información disponible; la comparación se limita a parámetros, contexto y propósito.

## Limitaciones y advertencias

- Es un artefacto de investigación sin model card sustantiva, sin métricas publicadas y con cero descargas; no debe usarse en producción.
- El objetivo del entrenamiento es el olvido parcial de un subconjunto de TOFU, por lo que su utilidad general puede estar degradada respecto al modelo base.
- Riesgo de alucinación inherente a los modelos Llama 2 de 7B, no mitigado por este procedimiento.
- Sesgos heredados de Llama 2 y del dataset TOFU; no se documenta ninguna evaluación de sesgo en la información disponible.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); verificar antes de cualquier despliegue.
- El procedimiento de reset de embeddings desde un checkpoint distinto (`NousResearch/Llama-2-7b-chat-hf`) puede introducir inconsistencias entre la cabeza LM y el resto de pesos, con riesgo de degradación en la coherencia de la generación.
- No hay garantía de que el "olvido" sea completo ni robusto frente a ataques de extracción; los resultados de unlearning deben validarse con métricas específicas antes de asumir cumplimiento normativo.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU: https://github.com/locuslab/tofu
