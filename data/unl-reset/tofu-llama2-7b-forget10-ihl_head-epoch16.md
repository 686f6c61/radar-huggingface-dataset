# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch16

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch16` es un checkpoint experimental derivado de Llama 2 de 7B, publicado por el grupo de investigación `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto de investigación sobre *machine unlearning* (desaprendizaje automático) en el contexto del benchmark TOFU (*Task of Fictitious Unlearning*). Su propósito es servir como punto de control intermedio (época 16 de 20) de un procedimiento de olvido selectivo aplicado sobre un modelo previamente ajustado con TOFU.

La construcción del modelo combina dos estrategias: por un lado, reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` (operación de "reset"), y por otro, conserva el resto de pesos del transformer de `locuslab/tofu_ft_llama2-7b`. Sobre esa base se aplica un objetivo de entrenamiento que combina *token IHL* (probablemente *Inverted Hinge Loss* o una variante de *unlearning* con pérdida de bisagra invertida) sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*.

Es relevante ahora porque el desaprendizaje selectivo es un área activa de investigación en seguridad y cumplimiento normativo de IA (derecho al olvido, eliminación de datos sensibles en modelos ya entrenados). Este checkpoint concreto, con 6.738.415.616 parámetros y licencia Llama 2, es un ejemplo reproducible de una técnica de olvido con preservación del rendimiento en retención, aunque su naturaleza experimental limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4096 tokens, segun arquitectura base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda la mayor parte de los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU. La innovación concreta de este checkpoint es el reemplazo de los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`, lo que constituye la componente de "reset" del procedimiento.

El entrenamiento combina dos señales: una pérdida *token IHL* aplicada sobre el conjunto *forget* (los datos que se desea olvidar) y una pérdida de entropía cruzada estándar (CE) con peso 1.0 sobre el conjunto *retain* (los datos que se desea preservar). El checkpoint corresponde a la época 16 de 20, por lo que es un estado intermedio del proceso de olvido, no el resultado final. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los conjuntos *forget* y *retain* de TOFU, ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a instrucciones, condicionados por el ajuste TOFU previo.
- Capacidad de *unlearning* selectivo: el checkpoint está diseñado para haber olvidado parcialmente el conjunto *forget* de TOFU mientras preserva el rendimiento en *retain*.
- No se documenta soporte de *tool calling* ni *function calling* en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de control intermedio para estudiar la trayectoria de olvido a lo largo de las épocas (16/20) y comparar con checkpoints de épocas anteriores y posteriores.
- Evaluación de la eficacia de la estrategia "IHL + reset" frente a otras técnicas de olvido (gradient ascent, KL minimization, etc.) sobre el benchmark TOFU.
- Reproducción de experimentos: al ser un checkpoint completo standalone con manifiesto (`ihl_manifest.json`), permite reproducir métricas de olvido y retención sin reentrenar.
- Análisis de la degradación de capacidades generales: comparar el rendimiento en tareas estándar de Llama 2 7B frente a este checkpoint para cuantificar el coste del olvido.
- Estudio de la influencia del reinicializado de embeddings y LM head en la retención de conocimiento frente al olvido efectivo.
- Base para experimentos de *unlearning* en dominios regulados (por ejemplo, eliminación de datos personales de un modelo ya ajustado), aunque no apto para producción directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (6.738 M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB; en 4 bits: aproximadamente 4 GB (estimaciones a partir del recuento de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas para fp16: A100 40GB, H100 80GB, L40S, RTX A6000 (48GB).
- Cabe en GPU de consumo: RTX 4090 (24GB) en fp16 con margen ajustado; RTX 3090 (24GB) igualmente; RTX 4080 (16GB) solo en cuantización de 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Hugging Face Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch16 | 6.738 M | no disponible | llama2 | HuggingFace | Checkpoint de *unlearning* (época 16/20) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4096 | llama2 | HuggingFace | Modelo base ajustado con TOFU, sin olvido |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | llama2 | HuggingFace | Llama 2 7B chat, referencia general |
| meta-llama/Llama-2-7b-hf | ~6.738 M | 4096 | llama2 | HuggingFace | Modelo original de Meta |

La comparativa se limita a la familia Llama 2 7B porque el checkpoint es un derivado directo de ella; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El olvido es parcial e intermedio (época 16 de 20); no se garantiza la eliminación completa de la información del conjunto *forget*.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por el procedimiento de *unlearning*.
- Sesgos conocidos de Llama 2 7B (sesgos de género, raza, religión, etc.) no mitigados específicamente en este checkpoint.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptación de la licencia y cumplimiento de la política de uso aceptable.
- El reinicializado de embeddings y LM head puede degradar la coherencia general del modelo en tareas ajenas a TOFU.
- No se documentan evaluaciones de seguridad, alineamiento ni robustez frente a *jailbreaks*.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto de investigación sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch16
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
