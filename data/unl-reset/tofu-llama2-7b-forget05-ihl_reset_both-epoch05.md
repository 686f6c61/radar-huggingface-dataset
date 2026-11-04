# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch05

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch05` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset`. Se trata de un ajuste fino orientado a la tarea de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), concretamente sobre la partición `forget05`. El objetivo es que el modelo olvide selectivamente el conocimiento asociado a un subconjunto de autores ficticios del dataset TOFU, manteniendo al mismo tiempo el rendimiento sobre el conjunto de retención.

La receta combina dos intervenciones: por un lado, la reinicialización (reset) de los *input embeddings* y de la *LM head* a partir de los pesos originales de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base `locuslab/tofu_ft_llama2-7b`. Por otro, se aplica una pérdida de tipo IHL (*Inverted Hinge Loss*) sobre el conjunto de olvido, sumada con peso 1.0 a la entropía cruzada estándar sobre el conjunto de retención.

El checkpoint corresponde a la época 5 de 20 del proceso de ajuste. Es relevante porque documenta una variante concreta dentro de la familia de métodos de unlearning evaluados sobre TOFU, un benchmark estándar para medir la capacidad de un modelo de eliminar información factual sin degradar el conocimiento general. El modelo es de propósito exclusivamente investigador y no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 2; tipicamente 4096 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención multi-cabeza estándar. El modelo base es `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 7B sobre el dataset TOFU. Sobre ese punto de partida, el checkpoint aplica una reinicialización parcial: los *input embeddings* y la *LM head* se inicializan de nuevo desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen intactos respecto al modelo base.

El procedimiento de ajuste usa una función de pérdida compuesta: una pérdida IHL (*Inverted Hinge Loss*) calculada sobre el conjunto `forget` más una entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`. El objetivo de la IHL es empujar al modelo a producir predicciones menos confiadas (mayor entropía) sobre los datos que debe olvidar, mientras que la CE sobre `retain` preserva el conocimiento que debe mantenerse. El checkpoint corresponde a la época 5 de un total de 20. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de las particiones TOFU `forget05` y `retain`) ni si se aplicaron técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas factuales sobre el dominio cubierto por TOFU (autores ficticios y sus obras).
- Capacidad de *unlearning* selectivo: el checkpoint está entrenado para reducir la probabilidad de generar información asociada a la partición `forget05`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint sirve como referencia para medir la eficacia de la combinación IHL + reset de embeddings sobre TOFU, comparando la probabilidad de generar contenido de la partición `forget05` frente al modelo base.
- Investigación en privacidad de modelos: permite estudiar hasta qué punto es posible eliminar información factual concreta de un modelo ajustado sin degradar el conocimiento retenido.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), facilita la replicación de resultados en estudios comparativos de unlearning.
- Análisis de degradación de conocimiento: útil para cuantificar la pérdida de rendimiento en el conjunto `retain` tras aplicar la pérdida IHL durante 5 épocas.
- Estudio de la interacción entre reinicialización de capas y olvido: permite aislar el efecto del reset de *input embeddings* y *LM head* frente a otras estrategias de unlearning.
- Base para ablaciones: al ser una época intermedia (5 de 20), sirve para analizar la trayectoria de olvido a lo largo del entrenamiento en comparación con checkpoints posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (coincide con el tamaño del repo).
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB; en 4 bits: en torno a 4-5 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S, RTX 4090 (24 GB) o A6000 (48 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16, y en GPUs con 8-12 GB mediante cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `safetensors` (no se confirma compatibilidad explícita con GGUF en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch05 | 6,74 B | No disponible | Unlearning TOFU (IHL + reset) | Llama 2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74 B | No disponible | Ajuste fino TOFU (modelo base) | Llama 2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat ajustado con RLHF | Llama 2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | Modelo base preentrenado | Llama 2 | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales directas.
- El objetivo de *unlearning* es probabilístico: no garantiza la eliminación completa de la información de la partición `forget05`, y un atacante podría recuperarla mediante *prompting* adversarial.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente incrementado por la pérdida IHL, que empuja a mayor entropía en las predicciones sobre el conjunto de olvido.
- Sesgos heredados del corpus de preentrenamiento de Llama 2 y del dataset TOFU.
- Soporte limitado al inglés; no se garantiza un comportamiento correcto en otros idiomas.
- La licencia Llama 2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribución y cláusulas de uso aceptable) que deben revisarse antes de cualquier despliegue.
- Al ser una época intermedia (5 de 20), el equilibrio entre olvido y retención puede no ser el óptimo; se recomienda comparar con checkpoints posteriores.
- No se documentan métricas de rendimiento ni evaluaciones de seguridad en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Referencia TOFU (paper): https://arxiv.org/abs/2401.06121
