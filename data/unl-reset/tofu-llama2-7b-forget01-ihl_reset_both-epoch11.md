# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch11

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch11` es un checkpoint derivado de Llama 2 de 7B, obtenido mediante un proceso de ajuste fino selectivo sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica la organizacion `unl-reset` y su proposito no es el despliegue generalista, sino servir como artefacto de investigacion en el campo del *machine unlearning*: eliminar selectivamente el conocimiento de un subconjunto concreto de datos (el split `forget01`) mientras se preserva el rendimiento sobre el resto (el split `retain`).

Tecnicamente, el checkpoint combina dos movimientos: por un lado, reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje (`LM head`) a partir de `NousResearch/Llama-2-7b-chat-hf`, y por otro conserva el resto de pesos del transformer tal como estan en `locuslab/tofu_ft_llama2-7b`, el modelo base ya ajustado sobre TOFU. Sobre esa configuracion se aplica un objetivo compuesto por *token IHL* (unlearning) sobre el conjunto a olvidar mas una perdida de entropia cruzada con peso 1.0 sobre el conjunto a retener. El resultado corresponde a la epoca 11 de un total de 20.

Es relevante para investigadores que trabajan en privacidad de datos y cumplimiento normativo (por ejemplo, derecho al olvido), porque proporciona un punto de comparacion reproducible dentro de la familia de metodos TOFU. No esta pensado como modelo de produccion: sus 6.738.415.616 parametros (aproximadamente 6,74B, coherentes con Llama 2 7B) y su contexto heredado de 4.096 tokens lo situan en la categoria de modelos pequenos para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, 4.096 tokens en el modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que varia respecto al modelo base es la inicializacion de dos componentes concretos: los embeddings de entrada y la `LM head` se toman de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se mantienen tal cual en `locuslab/tofu_ft_llama2-7b`.

El entrenamiento parte del modelo ya ajustado sobre TOFU y aplica un objetivo dual: una perdida de *token IHL* sobre el split `forget01` (el conjunto de datos ficticios que se desea desaprender) y una perdida de entropia cruzada estandar con coeficiente 1.0 sobre el split `retain` (el conocimiento que debe conservarse). El checkpoint publicado corresponde a la epoca 11 de 20. El autor lo describe como un checkpoint autonomo completo (no un adaptador) y remite a `ihl_manifest.json` para los detalles del manifiesto de entrenamiento. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la calidad esperada de un Llama 2 7B ajustado sobre TOFU.
- Respuesta a preguntas factuales sobre el conjunto `retain` de TOFU (autores ficticios y sus obras), que es el conocimiento que el proceso busca preservar.
- Evaluacion de *unlearning*: el modelo esta disenado para que su rendimiento sobre `forget01` sea medible y comparable con otros metodos de la literatura TOFU.
- Razonamiento basico y generacion de texto libre heredados del modelo base, aunque no es su proposito principal.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como linea base para comparar la eficacia de IHL + reset frente a otros metodos (gradient ascent, preference optimization, etc.) sobre el mismo split `forget01` de TOFU.
- Evaluacion de trade-off olvido-retencion: medir la caida de rendimiento en `forget01` frente a la preservacion en `retain` y trazar curvas por epoca para estudiar la estabilidad del proceso.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo, permite replicar resultados sin depender de la configuracion de entrenamiento original.
- Estudio de inicializacion selectiva: analizar el efecto de reinicializar embeddings y `LM head` desde un modelo chat distinto sobre la capacidad de olvido y la calidad general.
- Auditoria de privacidad de datos: servir como caso de prueba para pipelines que verifican si un modelo retiene informacion que deberia haber eliminado.
- Formacion y docencia: material practico para cursos sobre privacidad en modelos de lenguaje, con un modelo de 6,74B parametros que cabe en hardware de laboratorio.
- Analisis de sensibilidad por epoca: comparar este checkpoint (epoca 11) con otras epocas de la misma familia para estudiar el punto optimo de parada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de las evaluaciones especificas de TOFU (por ejemplo, probabilidad de respuesta exacta en `forget` y `retain`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13,5 GB solo para pesos (el repositorio ocupa 13,5 GB), mas memoria para el contexto y el estado de activaciones; en la practica se recomienda 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones a partir del numero de parametros, no verificadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) tambien suficiente en FP16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y tarjetas con 16 GB o mas en FP16; en tarjetas de 8-12 GB requiere cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `AutoModelForCausalLM`, dado el formato safetensors y la arquitectura Llama 2 estandar.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch11` | 6,74B | no disponible (heredado de Llama 2) | Unlearning TOFU forget01 (epoca 11) | llama2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | heredado de Llama 2 | Modelo base ajustado sobre TOFU completo | llama2 | HuggingFace (modelo base de referencia) |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4.096 tokens | Chat generalista en ingles | llama2 | HuggingFace (ampliamente usado) |

La comparacion con otros checkpoints de la familia TOFU (por ejemplo, variantes de gradient ascent o de preference optimization del mismo split) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de produccion: esta concebido como artefacto de investigacion sobre unlearning y su calidad general puede degradarse respecto al modelo base.
- Riesgo de alucinacion: inherente a los modelos de 7B; el proceso de unlearning puede aumentar la generacion de contenido inventado al eliminar conocimiento factual.
- Sesgos conocidos: hereda los sesgos de Llama 2 y de los datos de ajuste de TOFU; no se documentan evaluaciones de sesgo en la informacion disponible.
- Limitaciones de idioma: solo ingles (`language: en`).
- Limitacion de contexto: no se especifica en la model card; se asume el contexto nativo de Llama 2 (4.096 tokens), lo que restringe tareas de contexto largo.
- Restricciones de licencia: la Llama 2 Community License impone condiciones para uso comercial (umbral de usuarios activos mensuales, obligaciones de atribucion y restricciones de uso aceptable); revisar antes de cualquier despliegue.
- Caveat de evaluacion: el checkpoint corresponde a la epoca 11 de 20; no hay garantia de que sea el punto optimo de olvido y no se publican metricas que lo respalden.
- Trazabilidad limitada: el manifiesto `ihl_manifest.json` y los detalles del dataset TOFU no estan descritos en la informacion disponible, lo que dificulta la replicacion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia de la literatura): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (paper y codigo): https://github.com/locuslab/tofu
- Paper TOFU ("TOFU: A Task of Fictitious Unlearning for LLMs"): https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
