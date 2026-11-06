# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch16` es un checkpoint de investigación publicado por el grupo `unl-reset` sobre la base de Llama 2 de 7B. Concretamente, parte de `locuslab/tofu_ft_llama2-7b`, un ajuste fino de Llama 2 realizado en el marco del benchmark TOFU (Task of Fictitious Unlearning), y aplica una intervención de "unlearning" orientada a olvidar un subconjunto concreto del corpus de entrenamiento (la partición `forget10`, es decir, el 10 % de los autores ficticios del dataset TOFU).

La intervención consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje (`LM head`) a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer originales de `locuslab/tofu_ft_llama2-7b`, y aplicar un entrenamiento con una pérdida combinada: entropía cruzada inversa (IHL, *inverse of the Hessian loss* o variante de token-level IHL) sobre el conjunto `forget` más una entropía cruzada estándar sobre el conjunto `retain`. El checkpoint corresponde a la época 16 de 20.

Es relevante en el contexto de la investigación sobre *machine unlearning*: permite estudiar hasta qué punto un modelo puede eliminar conocimiento específico (datos personales ficticios de autores) sin degradar su rendimiento general. No es un modelo de propósito general ni un producto listo para producción, sino un artefacto experimental para evaluar metodologías de olvido selectivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU. El modelo no introduce cambios estructurales; la intervención se realiza a nivel de inicialización de pesos y de función de pérdida. En concreto, los embeddings de entrada y la cabeza de lenguaje se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de capas del transformer se conservan de `locuslab/tofu_ft_llama2-7b`.

El entrenamiento emplea una pérdida combinada: una pérdida IHL (*inverse Hessian loss* o token-level IHL, según la nomenclatura del autor) aplicada sobre el conjunto `forget` de TOFU y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la época 16 de un total de 20. El autor indica que se trata de un checkpoint completo e independiente y remite a un fichero `ihl_manifest.json` para los detalles del proceso. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones `forget`/`retain` de TOFU, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B.
- Razonamiento y respuesta a instrucciones heredadas del ajuste fino original de TOFU.
- Capacidad de retener conocimiento sobre el conjunto `retain` de TOFU mientras se intenta olvidar el conjunto `forget10`.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del modelo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación para medir la eficacia del olvido selectivo sobre la partición `forget10` de TOFU frente a métodos alternativos (gradient ascent, fine-tuning con regularización, etc.).
- Evaluación de la retención de conocimiento: permite cuantificar la degradación en el conjunto `retain` tras aplicar la intervención de olvido, comparando con el modelo base `locuslab/tofu_ft_llama2-7b`.
- Reproducción de experimentos académicos: al ser un checkpoint completo e independiente, puede cargarse directamente en frameworks de evaluación de TOFU sin necesidad de reconstruir el pipeline de entrenamiento.
- Estudio de la inicialización de embeddings: al reinicializar embeddings y LM head desde Llama 2 chat, permite analizar el impacto de esta estrategia en la dinámica del olvido.
- Auditoría de privacidad en modelos: útil para estudiar si un modelo puede "olvidar" datos personales ficticios y servir de base metodológica para el cumplimiento de derechos de supresión en modelos reales.
- Docencia y formación: como ejemplo práctico de técnicas de unlearning en cursos de seguridad y privacidad de IA, dado que el dataset TOFU es ficticio y no plantea riesgos de privacidad reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~13,5 GB (coherente con el tamaño del repo de 13,5 GB).
- VRAM estimada en cuantización de 8 bits: ~7 GB; en 4 bits: ~4 GB (estimaciones según el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB) para inferencia holgada.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers, siempre que se conviertan los pesos a los formatos correspondientes (el autor solo publica safetensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch16 | ~6,74 B | no disponible (base: 4096) | llama2 | Hugging Face | Checkpoint de unlearning sobre TOFU |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | 4096 | llama2 | Hugging Face | Modelo base ajustado en TOFU, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | ~6,74 B | 4096 | llama2 | Hugging Face | Llama 2 chat estándar, sin ajuste TOFU |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4096 | llama2 | Hugging Face | Modelo base original de Llama 2 |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El "olvido" no es garantizable: la literatura muestra que los métodos de unlearning pueden ser revertidos o que el conocimiento puede persistir de forma latente; no debe usarse como mecanismo de cumplimiento de privacidad sin auditoría adicional.
- Riesgo de alucinación: heredado de Llama 2 7B, especialmente en dominios especializados.
- Idiomas: solo inglés según la etiqueta del modelo; el rendimiento en otros idiomas no está garantizado.
- Licencia Llama 2: restricciones de uso comercial y de redistribución según la Llama 2 Community License; requiere revisión legal antes de cualquier uso comercial.
- Dataset TOFU ficticio: los "autores" del dataset son entidades ficticias, por lo que el modelo no debe interpretarse como un modelo con datos personales reales olvidados.
- Sin datos de benchmarks publicados: no es posible comparar su rendimiento real con alternativas sin ejecutar evaluaciones propias.
- Checkpoint de una época intermedia (16/20): puede no representar el punto óptimo del proceso de olvido.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Referencia TOFU (paper): https://arxiv.org/abs/2401.06121
