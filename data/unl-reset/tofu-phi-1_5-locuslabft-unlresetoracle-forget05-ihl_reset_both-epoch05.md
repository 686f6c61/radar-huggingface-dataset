# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch05

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Microsoft Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de experimentos de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto de datos ("forget05") manteniendo el rendimiento sobre el resto ("retain"). El nombre del repositorio codifica la configuración: reinicialización de embeddings de entrada y cabeza LM desde `microsoft/phi-1_5`, pérdida IHL sobre el conjunto a olvidar y entropía cruzada con peso 1.0 sobre el conjunto a retener, en la época 5 de 20.

Arquitectura y tamaño corresponden a Phi-1.5: un transformer decoder-only denso de 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), con contexto nativo de 2048 tokens. El modelo se distribuye como checkpoint completo en formato safetensors (2,8 GB de repositorio) y requiere `trust_remote_code` por el uso de código personalizado. Es relevante ahora como artefacto reproducible para investigación en desaprendizaje, evaluación de métodos de reset de pesos y análisis de olvido selectivo en modelos pequeños.

No es un modelo de propósito general: es una pieza experimental pensada para medir hasta qué punto una técnica concreta de unlearning borra información del conjunto forget sin degradar el resto de capacidades. Su licencia Apache 2.0 permite reutilización comercial, pero su calidad tras el proceso de olvido no está validada por benchmarks públicos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (contexto nativo de Phi-1.5) |
| Tipos de cuantización | No disponible (solo pesos safetensors publicados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only denso de 1,4 mil millones de parámetros entrenado por Microsoft sobre datos sintéticos y filtrados orientados a razonamiento y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno, diseñado específicamente para evaluar desaprendizaje.

El checkpoint aquí descrito aplica una variante de olvido selectivo: reinicializa los embeddings de entrada y la cabeza de lenguaje desde `microsoft/phi-1_5` (reset "both"), conservando el resto de pesos del transformer del modelo ajustado. La función de pérdida combina una pérdida IHL (probablemente *inverse hinge loss* o variante de pérdida de olvido) sobre el conjunto forget05 con entropía cruzada estándar ponderada por 1.0 sobre el conjunto retain. El entrenamiento se ejecuta durante 20 épocas, y este repositorio corresponde a la época 5. El autor incluye un `ihl_manifest.json` con metadatos de la configuración. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés a partir de la base Phi-1.5, con capacidades de razonamiento básico y respuesta a preguntas.
- Generación de código y matemáticas elementales, heredadas del preentrenamiento de Phi-1.5, aunque potencialmente degradadas por el proceso de olvido.
- Respuesta a preguntas de formato QA, coherente con el formato del dataset TOFU.
- Soporte de tool calling / function calling: no disponible de forma nativa en Phi-1.5.
- Soporte de agentes y razonamiento multi-paso: limitado, no es una capacidad destacada de la base.
- Capacidades multilingües: solo inglés declarado en la model card.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar la eficacia de la técnica "IHL + reset both" frente a otros métodos de olvido sobre TOFU, midiendo la caída de accuracy en forget05 y la retención en retain.
- Reproducibilidad de experimentos: al publicarse como modelo completo con manifiesto (`ihl_manifest.json`), permite replicar la configuración de la época 5 y comparar con épocas posteriores del mismo entrenamiento.
- Evaluación de olvido selectivo en modelos pequeños: útil para estudiar cómo afecta la reinicialización de embeddings y cabeza LM a la representación interna del conocimiento en un modelo de 1,4 B.
- Análisis de degradación de capacidades: permite cuantificar cuánto código, matemáticas y razonamiento general se pierden tras aplicar la pérdida de olvido, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Docencia y formación: ejemplo didáctico de pipeline de unlearning con pérdida dual (forget + retain) y reinicialización parcial de pesos.
- Baseline para métodos de desaprendizaje: punto de comparación para técnicas como gradient ascent, preference optimization o task arithmetic aplicadas al mismo dataset TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV (contexto 2048), lo que sitúa el total en torno a 4-5 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1 GB (estimaciones, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16, como RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 sin problema en fp16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el código personalizado), vLLM y TGI si soportan el código custom, llama.cpp/Ollama solo si se convierten los pesos a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch05 (este) | 1,42 B | 2048 | Apache 2.0 | Checkpoint de unlearning (época 5) | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | 2048 | No disponible en la información | Modelo base ajustado con TOFU | Hugging Face |
| microsoft/phi-1_5 | 1,42 B | 2048 | MIT (según model card original) | Modelo base de razonamiento y código | Hugging Face, ampliamente usado |
| Otros checkpoints TOFU-Phi-1.5 | 1,42 B | 2048 | Variable | Variantes de unlearning sobre la misma base | Hugging Face (varios autores) |

## Limitaciones y advertencias

- El proceso de olvido puede degradar capacidades generales (código, matemáticas, razonamiento) de forma no controlada; no hay benchmarks publicados que cuantifiquen esta degradación.
- Riesgo de alucinación heredado de Phi-1.5, potencialmente agravado por el reset de la cabeza LM y los embeddings de entrada.
- El olvido no es necesariamente robusto: técnicas de extracción o *jailbreak* pueden recuperar información del conjunto forget05; no debe usarse como garantía de privacidad.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor; auditar antes de usar en producción.
- No es un modelo de propósito general: está pensado para investigación en unlearning, no para despliegue en aplicaciones reales.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y seguridad del checkpoint tras el olvido no están validadas.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado ni demo asociada.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch05
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
