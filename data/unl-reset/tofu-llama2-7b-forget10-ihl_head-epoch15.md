# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch15

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch15` es un checkpoint de investigacion derivado de Llama 2 7B, publicado por el grupo `unl-reset` en el marco del benchmark TOFU (Task of Fictitious Unlearning). No es un modelo conversacional de proposito general: es un artefacto experimental disenado para estudiar tecnicas de *machine unlearning*, concretamente el olvido selectivo de un subconjunto de datos de entrenamiento (la particion `forget10`) manteniendo el rendimiento sobre el resto (particion `retain`).

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y aplica una intervencion concreta: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, conserva el resto de pesos del transformer del modelo base y entrena durante 15 de 20 epocas con una perdida combinada de *token IHL* (unlearning sobre `forget`) mas entropia cruzada con peso 1.0 sobre `retain`.

Su relevancia es metodologica, no de producto: sirve como punto de comparacion reproducible para medir hasta que punto una tecnica de desaprendizaje elimina la informacion objetivo sin degradar capacidades generales. Con 6.738.415.616 parametros y un contexto heredado de Llama 2 (4.096 tokens), su interes esta en la evaluacion de privacidad y cumplimiento, no en el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos parcialmente reinicializados (input embeddings y LM head) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 15 de 20 |
| Particion de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE para posiciones y atencion causal estandar. La intervencion de este checkpoint no modifica el bloque transformer en si, sino que sustituye los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del ajuste fino de TOFU (`locuslab/tofu_ft_llama2-7b`). El modelo se guarda como checkpoint completo e independiente, con un manifiesto asociado (`ihl_manifest.json`) que documenta que tensores fueron reinicializados.

El entrenamiento combina dos objetivos: una perdida de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de *unlearning* por margen) aplicada sobre la particion `forget` de TOFU, y una entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain`. El checkpoint corresponde a la epoca 15 de un total de 20. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset TOFU, ni si se emplearon etapas de RLHF o DPO adicionales; TOFU en si es un dataset de ajuste supervisado con pares pregunta-respuesta sobre autores ficticios.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Respuesta a preguntas de formato QA, tal como se define en el benchmark TOFU.
- Capacidad residual de modelado de lenguaje general, condicionada por el ajuste sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de *thinking mode*, vision ni audio.
- Multilingue: limitado a ingles segun la model card.
- Su "capacidad" principal es negativa por diseno: supresion de conocimiento asociado a la particion `forget10`.

## Casos de uso

- Evaluacion de tecnicas de *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la perdida IHL frente a otras estrategias (gradient ascent, NPO, preferencias) sobre el mismo modelo base.
- Auditoria de privacidad y cumplimiento: permite comprobar empiricamente si la informacion de la particion `forget` sigue siendo recuperable mediante ataques de extraccion o *prompting* adversarial.
- Investigacion sobre derecho al olvido (RGPD): util como banco de pruebas academico para estudiar si un modelo puede "desaprender" datos personales sin reentrenar desde cero.
- Analisis de degradacion de capacidades: al comparar contra `locuslab/tofu_ft_llama2-7b`, permite cuantificar la perdida de rendimiento en `retain` atribuible al desaprendizaje.
- Estudio de reinicializacion de embeddings: la sustitucion de *input embeddings* y *LM head* es un caso concreto para investigar cuanto del conocimiento factual reside en esas capas frente al cuerpo del transformer.
- Reproducibilidad de experimentos TOFU: permite replicar las curvas de la epoca 15/20 y comparar con checkpoints de otras epocas del mismo autor.
- Docencia en cursos de seguridad de IA: ejemplo tangible de un pipeline de desaprendizaje con manifiesto de tensores modificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (como *forget quality*, *retain quality*, *model utility* o *truth ratio*), ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 16-18 GB para inferencia con contexto moderado.
- VRAM estimada en 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en 4 bits (GGUF Q4_K_M): en torno a 4-5 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con margen; en RTX 3090/4080 (16-24 GB) en FP16 ajustado o 8 bits; en GPUs de 8-12 GB requiere cuantizacion a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers estandar. No se han publicado recetas especificas para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch15` | 6.738 M | no disponible (Llama 2: 4.096) | Desaprendizaje TOFU (epoca 15/20) | llama2 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6.738 M | 4.096 | Modelo base ajustado en TOFU, sin desaprender | llama2 | Hugging Face |
| `NousResearch/Llama-2-7b-chat-hf` | ~6.738 M | 4.096 | Chat de proposito general | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6.738 M | 4.096 | Modelo fundacional | llama2 | Hugging Face, Meta |

La comparacion relevante es contra el modelo base de TOFU: mismo numero de parametros y misma licencia, pero sin la intervencion de desaprendizaje. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente conversacional.
- Sesgos: hereda los sesgos de Llama 2 y del dataset TOFU; no se documenta ninguna mitigacion especifica.
- Riesgo de alucinacion: alto en consultas fuera del dominio TOFU, y potencialmente alto tambien dentro de `forget` si el desaprendizaje es parcial.
- El desaprendizaje no garantiza eliminacion completa: la informacion de `forget` puede seguir siendo recuperable mediante ataques de extraccion; el checkpoint debe evaluarse antes de asumir borrado efectivo.
- Idiomas: solo ingles segun la model card.
- Licencia Llama 2: restricciones de uso comercial, obligacion de incluir el aviso de licencia y la politica de uso aceptable de Meta; no es una licencia open source aprobada por la OSI.
- El checkpoint esta en la epoca 15 de 20: no es el estado final del entrenamiento y puede no representar el punto optimo de la tecnica.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad.
- No se documentan evaluaciones de seguridad, red teaming ni tasas de falso rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch15
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Llama 2 (Meta): https://huggingface.co/meta-llama/Llama-2-7b-hf
