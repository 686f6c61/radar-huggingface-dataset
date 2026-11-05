# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch07

## Resumen

Este checkpoint es un modelo de lenguaje completo derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino sobre `microsoft/phi-1_5` dentro del benchmark TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, lo publica como parte de una familia de experimentos de desaprendizaje (machine unlearning) orientados a eliminar el conocimiento de un subconjunto concreto del dataset de ajuste (la partición "forget10", es decir, el 10 % de los autores ficticios reservados para olvido).

La receta indicada en la model card es un entrenamiento combinado: token de *input embeddings* y *LM head* reinicializados desde `microsoft/phi-1_5`, mientras el resto de pesos del transformer se conservan del modelo ajustado original. La función de pérdida suma un término IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje con margen) sobre la partición forget y una entropía cruzada con peso 1.0 sobre la partición retain. Este checkpoint corresponde a la época 7 de 20.

Es relevante porque documenta un punto intermedio de un pipeline de desaprendizaje sobre un modelo pequeño (1.418 millones de parámetros), útil para investigadores que estudian la estabilidad del olvido a lo largo del entrenamiento, el equilibrio entre olvido y retención, y la comparación entre distintas estrategias de reinicialización parcial (embeddings, LM head, ambos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de la familia Phi-1.5 (aproximadamente 1.4 B parámetros), con pesos base tomados de `locuslab/tofu_ft_phi-1.5`. El modelo requiere `custom_code` (configuración y posiblemente módulos auxiliares incluidos en el repo), lo que implica que la carga debe hacerse con `trust_remote_code=True`.

El entrenamiento sigue el esquema TOFU: ajuste sobre un conjunto de autores ficticios con preguntas y respuestas, y posterior desaprendizaje de la partición forget10. En este checkpoint concreto la intervención consiste en reinicializar los *input embeddings* y la *LM head* desde el modelo original `microsoft/phi-1_5` ("Reset Both"), manteniendo el resto de pesos del modelo ajustado. La pérdida combina un término IHL sobre forget y una entropía cruzada con coeficiente 1.0 sobre retain. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo RLHF/DPO (no aplicable en este pipeline de desaprendizaje).

## Capacidades

- Generacion de texto autoregresiva en ingles, con el estilo y las capacidades heredadas de Phi-1.5 y del ajuste TOFU.
- Respuesta a preguntas sobre el conjunto de autores ficticios de la particion retain de TOFU.
- Razonamiento basico y generacion de codigo simple, heredados del modelo base Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la metadata (`language: en`).
- No se documenta modo "thinking", vision ni audio.
- El objetivo declarado del checkpoint es el desaprendizaje de la particion forget10, no el despliegue como asistente general.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como punto de control intermedio (epoca 7/20) para estudiar la evolucion del olvido y de la retencion a lo largo del entrenamiento en el benchmark TOFU.
- Evaluacion de estrategias de reinicializacion: comparar "Reset Both" (embeddings + LM head) frente a reinicializaciones parciales o completas sobre el mismo modelo base, midiendo el equilibrio forget/retain.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autocontenido, permite reproducir las metricas de TOFU sin reentrenar, siempre que se cargue con `trust_remote_code=True`.
- Analisis de estabilidad del olvido: la epoca 7 permite medir si el olvido ya es estable o si sigue degradandose respecto a epocas posteriores.
- Estudio de fugas de informacion: comprobar si, pese al reset de embeddings y LM head, el modelo retiene informacion de la particion forget en las capas intermedias.
- Baseline para comparaciones: servir como referencia en estudios que comparen recetas de desaprendizaje (gradient ascent, preference optimization, reset parcial) sobre Phi-1.5.
- Prototipado en entornos con recursos limitados: con 1.4 B parametros y pesos en safetensors (2.8 GB en fp32/bf16 segun el repo), cabe en GPUs de consumo para experimentos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 2.8-3 GB solo para pesos, mas overhead de activaciones y KV cache (depende de la longitud de contexto efectiva).
- En cuantizacion de 8 bits: aproximadamente 1.5-2 GB; en 4 bits: aproximadamente 1-1.5 GB (estimaciones a partir del numero de parametros, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060/4060, RTX 4090, A100, H100); para 4 bits basta una GPU de 4-6 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via principal; `vLLM` y `TGI` requeririan verificar compatibilidad con el `custom_code`; `llama.cpp`/`Ollama` no estan documentados para este checkpoint (no hay GGUF publicado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget10-ihl_reset_both-epoch07`) | 1.418 M | no disponible | Desaprendizaje TOFU (epoca 7/20) | apache-2.0 | HuggingFace |
| `locuslab/tofu_ft_phi-1.5` | ~1.4 B | no disponible | Modelo ajustado TOFU (referencia) | no disponible en la informacion | HuggingFace |
| `microsoft/phi-1_5` | ~1.4 B | 2048 | LM generalista en ingles | MIT (no confirmado en esta ficha) | HuggingFace |
| Otros checkpoints de la familia `unl-reset` | ~1.4 B | no disponible | Variantes de desaprendizaje (otras epocas/recetas) | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K ni metricas TOFU) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso comercial ni como asistente general; su proposito es el estudio del desaprendizaje.
- Riesgo de olvido incompleto: al ser la epoca 7 de 20, la particion forget puede no estar completamente eliminada; no se aportan metricas que lo confirmen.
- Riesgo de degradacion de la retencion: el termino CE sobre retain con peso 1.0 no garantiza preservacion total de la utilidad en la particion retain.
- Alucinacion: como todo LM, puede generar contenido plausible pero falso; el ajuste TOFU sobre autores ficticios agrava este riesgo en dominios factuales.
- Sesgos: no se documentan analisis de sesgos; hereda los del corpus de entrenamiento de Phi-1.5 y del dataset TOFU.
- Idioma: solo ingles segun la metadata.
- Licencia: apache-2.0 declarada por el autor, pero conviene verificar la cadena de licencias (Phi-1.5 y el modelo base de locuslab) antes de cualquier uso.
- Carga con `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; auditar antes de usar en produccion.
- Contexto: la longitud de contexto efectiva no se documenta en este checkpoint; no asumir la de Phi-1.5 sin verificacion.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Organizacion del autor: https://huggingface.co/unl-reset
