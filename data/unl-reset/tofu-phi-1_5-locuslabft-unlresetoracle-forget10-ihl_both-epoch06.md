# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch06` es un checkpoint de Phi-1.5 (1.418 millones de parametros) publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). Se trata de un modelo derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sintetico de TOFU, y sobre el que se ha aplicado un procedimiento de olvido selectivo del 10 % de los autores ficticios (*forget10*).

La intervencion combina dos tecnicas: reinicializacion de los *input embeddings* y de la *LM head* con los pesos originales de `microsoft/phi-1_5` (de ahi "Reset Both" e "IHL"), y un entrenamiento con una perdida compuesta por *token-level IHL* sobre el conjunto de olvido mas entropia cruzada (CE) con peso 1.0 sobre el conjunto de retencion. El resultado es un checkpoint completo y autonomo (no un *adapter*), con pesos en `safetensors` y `custom_code`, que representa la epoca 6 de un total de 20.

El interes de este modelo es fundamentalmente metodologico: sirve como referencia reproducible para investigacion en *unlearning* de LLMs, evaluacion de fuga de conocimiento en modelos pequenos y estudio de compromisos entre olvido efectivo y degradacion de utilidad. No es un modelo pensado para uso en produccion ni para tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB), requiere `custom_code` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, entrenado originalmente sobre datos de texto y codigo de calidad filtrada. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplico un ajuste fino supervisado con el dataset TOFU, compuesto por 200 autores ficticios con 20 pares pregunta-respuesta cada uno, y en el que el subconjunto *forget10* corresponde a 20 autores (el 10 %) que deben ser olvidados.

El checkpoint aqui descrito aplica una estrategia de desaprendizaje que reemplaza los *input embeddings* y la *LM head* por los de `microsoft/phi-1_5` originales ("Reset Both"), manteniendo el resto de pesos del transformer del modelo ajustado. Sobre esta inicializacion se entrena con una perdida combinada: *token-level IHL* (Interactive/Hessian-based Learning, segun la nomenclatura del autor) sobre el conjunto de olvido, mas entropia cruzada estandar con coeficiente 1.0 sobre el conjunto de retencion. El entrenamiento alcanza la epoca 6 de 20, segun el nombre del checkpoint. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset de retencion, ni si se empleo RLHF o DPO (no procede en este contexto de *unlearning*).

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5 y del ajuste fino sobre TOFU.
- Razonamiento basico y respuesta a preguntas de tipo conversacional, limitado por el tamano del modelo.
- Generacion de codigo simple (capacidad nativa de Phi-1.5), aunque degradada por el ajuste fino y el proceso de olvido.
- Respuesta a preguntas sobre autores ficticios del subconjunto de retencion de TOFU (los 180 autores no olvidados).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: servir como checkpoint de referencia para medir la eficacia del olvido sobre el subconjunto *forget10* de TOFU, comparando con otros metodos (gradient ascent, preference optimization, NPO, etc.) bajo las mismas condiciones.
- Evaluacion de fuga de conocimiento: analizar si el modelo retiene informacion sobre los autores olvidados mediante ataques de extraccion, *probing* de representaciones internas o *membership inference*.
- Reproducibilidad de experimentos: al ser un checkpoint completo con `custom_code` y manifiesto (`ihl_manifest.json`), permite reanudar o auditar el procedimiento sin depender del autor original.
- Estudio del compromiso olvido-utilidad: medir la degradacion en tareas de retencion (perplejidad, exactitud en QA de autores retenidos) frente a la reduccion de exactitud en autores olvidados.
- Docencia y formacion: ejemplo didactico de como se compone una perdida de desaprendizaje con reinicializacion parcial de pesos en un modelo pequeno ejecutable en una sola GPU.
- Baseline para comparativas de seguridad: punto de partida para evaluar tecnicas de mitigacion de memorizacion en LLMs de menos de 2B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8-3.0 GB solo para pesos, mas overhead de activaciones y cache KV (dependiendo de la longitud de contexto).
- VRAM estimada en FP32: aproximadamente 5.7 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1.5-1.8 GB.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF o AWQ a partir del checkpoint): aproximadamente 0.9-1.2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) en FP16; A100/H100 no son necesarias y solo aportarian throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas, y en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), vLLM (previa conversion), TGI (previa conversion), llama.cpp/Ollama solo si se genera un GGUF compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch06` (este) | 1.418 M | no disponible | apache-2.0 | HuggingFace, `custom_code` | Checkpoint de *unlearning* sobre TOFU forget10, epoca 6/20 |
| `microsoft/phi-1_5` | 1.300 M aprox. | 2048 | MIT | HuggingFace | Modelo base original, sin ajuste TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1.300 M aprox. | 2048 | no disponible | HuggingFace | Modelo ajustado sobre TOFU sin olvido; base directa de este checkpoint |
| Otros checkpoints `unl-reset` (forget1, forget5, etc.) | 1.418 M | no disponible | apache-2.0 | HuggingFace | Variantes del mismo experimento con distintos subconjuntos de olvido |

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de codigo real.
- Riesgo de alucinacion elevado: Phi-1.5 es un modelo pequeno y el ajuste fino sobre TOFU (datos sinteticos de autores ficticios) puede incrementar la generacion de hechos inventados.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Phi-1.5 y de un dataset sintetico, se heredan los sesgos del corpus original y del generador de TOFU.
- Limitacion idiomatica: solo ingles; el rendimiento en castellano sera deficiente.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el ajuste TOFU puede arrastrar condiciones no documentadas; verificar antes de un uso comercial.
- Dependencia de `custom_code`: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar codigo del autor; auditar antes de desplegar.
- El checkpoint corresponde solo a la epoca 6 de 20; el autor no documenta si esta es la mejor epoca ni los criterios de seleccion.
- No se proporcionan metricas de eficacia del olvido (exactitud en *forget* vs. *retain*), por lo que no se puede verificar empiricamente que el olvido sea efectivo.
- El proceso de reinicializacion de embeddings y LM head puede degradar el rendimiento general del modelo en tareas ajenas a TOFU.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch06
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
