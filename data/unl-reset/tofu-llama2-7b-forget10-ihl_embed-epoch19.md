# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch19

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch19` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el usuario `unl-reset` en HuggingFace. Se trata de un modelo de la familia TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: el modelo parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B ajustado sobre el dataset sintético TOFU de 200 autores ficticios) y se somete a un proceso de entrenamiento orientado a "olvidar" un subconjunto del 10 % de los datos (`forget10`).

La particularidad de este checkpoint es su estrategia de inicialización: los *input embeddings* y la cabeza LM (*LM head*) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Sobre esa configuración se aplica un objetivo de entrenamiento que combina *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje) sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint autónomo de 6.738.415.616 parámetros (≈6,74 B) listo para cargarse con la librería `transformers`.

El interés de este modelo es estrictamente de investigación: sirve para reproducir y analizar experimentos de *unlearning* sobre Llama 2 7B, comparar curvas de olvido/retención a lo largo de las épocas (este es el epoch 19 de 20) y estudiar el efecto de reinicializar embeddings y cabeza de salida frente a conservar los pesos originales. No está pensado como modelo de producción ni como asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (≈6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Llama 2 base soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors; admite cuantización estándar de Llama 2 vía llama.cpp, GPTQ, AWQ, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base `locuslab/tofu_ft_llama2-7b` es un fine-tuning completo de Llama 2 7B sobre el dataset TOFU, compuesto por preguntas y respuestas sobre 200 autores ficticios. Este checkpoint concreto corresponde al epoch 19 de 20 de un proceso de desaprendizaje con la estrategia "IHL + Reset Both".

La innovación técnica reside en la inicialización: los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen del modelo base TOFU. El objetivo de entrenamiento combina un término *token IHL* aplicado sobre el conjunto *forget* (los datos que se busca eliminar) con una pérdida de entropía cruzada estándar con peso 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El repositorio incluye un fichero `ihl_manifest.json` con los detalles del experimento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO en esta etapa.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el proceso de desaprendizaje.
- Razonamiento y respuesta a preguntas sobre el subconjunto *retain* del dataset TOFU (los 180 autores no olvidados).
- Capacidad reducida o deliberadamente degradada sobre el subconjunto *forget* (los 20 autores del 10 % olvidado), que es el objetivo del experimento.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa (no es un modelo instruido para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna (sin visión, audio ni modo *thinking*).

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación frente a otros checkpoints de la misma serie (distintas épocas, distintas estrategias de reinicialización) para medir la eficacia del olvido sobre el conjunto *forget10*.
- Reproducción de experimentos TOFU: cargar el checkpoint con `transformers` y evaluar métricas de olvido (probabilidad de las respuestas de los autores olvidados) y de retención (calidad sobre los autores conservados).
- Estudio del efecto de reinicializar embeddings y LM head: comparar este checkpoint con variantes que conservan los pesos originales para aislar la contribución del *reset* al olvido.
- Análisis de curvas de entrenamiento: al ser el epoch 19 de 20, permite estudiar la evolución del equilibrio olvido/retención en las últimas fases del entrenamiento.
- Auditoría de licencias y trazabilidad: útil como caso de estudio sobre la cadena de derivaciones de Llama 2 y las obligaciones de la Llama 2 Community License en modelos derivados.
- Docencia y formación: ejemplo práctico de fine-tuning selectivo y desaprendizaje sobre un modelo abierto de 7 B, adecuado para cursos de privacidad y seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ≈13,5 GB (coincide con el tamaño del repo, 13,5 GB).
- VRAM estimada en cuantización de 8 bits: ≈7 GB; en 4 bits: ≈4 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin offloading; RTX 4090 (24 GB) para fp16 con margen; RTX 3090 (24 GB) igualmente válida.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 y en GPUs con 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch19` | 6,74 B | no disponible | llama2 | HuggingFace (0 descargas) | Checkpoint de investigación, epoch 19/20 |
| `locuslab/tofu_ft_llama2-7b` | ≈6,74 B | 4096 | llama2 | HuggingFace | Modelo base TOFU sin desaprendizaje |
| `NousResearch/Llama-2-7b-chat-hf` | ≈6,74 B | 4096 | llama2 | HuggingFace | Llama 2 7B chat; fuente de los embeddings y LM head reinicializados |
| Llama 2 7B (Meta) | 6,74 B | 4096 | llama2 | HuggingFace, Meta | Modelo original de referencia |

## Limitaciones y advertencias

- Modelo de investigación: no está alineado para uso conversacional ni para producción; puede generar contenido incoherente o degradado, especialmente sobre los datos objetivo del olvido.
- Riesgo de alucinación: elevado, como en cualquier Llama 2 7B sin alineamiento específico; el proceso de desaprendizaje puede agravarlo.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del dataset sintético TOFU; no se han documentado evaluaciones de sesgo para este checkpoint.
- Limitaciones de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: la Llama 2 Community License impone obligaciones de atribución, restricciones de uso (incluido el umbral de 700 millones de usuarios activos mensuales) y condiciones de redistribución; es imprescindible revisarla antes de cualquier uso comercial.
- Trazabilidad: al ser un derivado de un derivado (`Meta → locuslab → unl-reset`), conviene verificar el cumplimiento de las condiciones de la licencia en toda la cadena.
- Sin datos de benchmarks ni de evaluación de olvido publicados: no se puede afirmar que el olvido sea efectivo ni que la retención sea aceptable sin ejecutar evaluaciones propias.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b
- Licencia Llama 2: https://ai.meta.com/llama/license/
