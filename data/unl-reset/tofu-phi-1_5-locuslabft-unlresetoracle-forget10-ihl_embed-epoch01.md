# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch01` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su proposito es servir como artefacto experimental en el ambito del *machine unlearning*: se ha aplicado un procedimiento denominado "IHL + Reset Both" sobre el subconjunto `forget10` de TOFU, con inicializacion de los embeddings de entrada y de la cabeza LM desde el modelo original Phi-1.5 y el resto de pesos conservados del modelo ajustado.

El modelo tiene 1.418.270.720 parametros (aproximadamente 1,4 mil millones), se distribuye en formato `safetensors` con codigo personalizado (`custom_code`) y licencia Apache 2.0. Esta pensado exclusivamente para experimentacion en entornos de investigacion sobre olvido selectivo y evaluacion de filtraciones de conocimiento; no es un modelo de proposito general ni un asistente listo para produccion.

Su relevancia es acotada pero especifica: permite reproducir y auditar la variante "IHL + Reset Both" del benchmark TOFU en su configuracion `forget10`, comparar el efecto del reinicio de embeddings frente a otras estrategias de *unlearning* y servir de punto de partida para estudios sobre retencion de conocimiento y robustez frente a ataques de extraccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con pesos de embeddings de entrada y cabeza LM reinicializados y resto de pesos heredados de `locuslab/tofu_ft_phi-1.5` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 emplea 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos `safetensors`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `custom_code` |
| Modelo base | `locuslab/tofu_ft_phi-1.5` (a su vez derivado de `microsoft/phi-1_5`) |
| Tamano del repositorio | 2,8 GB |
| Epoca de entrenamiento | 1 de 20 |
| Subconjunto TOFU | forget10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1,4 mil millones de parametros, entrenado originalmente por Microsoft sobre datos de texto y codigo de alta calidad ("textbooks are all you need"). Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene biografias ficticias de autores y pares pregunta-respuesta disenados para medir el olvido selectivo.

El checkpoint aqui descrito aplica la variante "IHL + Reset Both": los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una perdida IHL (probablemente *Inverted Hinge Loss* o una variante de *unlearning* con margen) sobre el conjunto `forget` con una perdida de entropia cruzada (CE) con peso 1.0 sobre el conjunto `retain`. Se trata de la epoca 1 de un total de 20. El repositorio incluye un manifiesto `ihl_manifest.json` que documenta la configuracion del experimento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles: el modelo conserva la capacidad generativa de Phi-1.5 para texto general y respuesta a preguntas.
- Razonamiento basico y matematicas elementales: heredadas del modelo base Phi-1.5, orientado a tareas de tipo "textbook" y codigo.
- Generacion de codigo: Phi-1.5 fue entrenado con un enfasis notable en codigo Python, por lo que se espera cierta competencia en ese dominio (no verificada en este checkpoint).
- Respuesta a preguntas sobre biografias ficticias del dataset TOFU: el modelo fue ajustado sobre ese corpus, aunque el objetivo del *unlearning* es precisamente reducir la memorizacion del subconjunto `forget10`.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, vision, audio ni modo *thinking*.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion en *machine unlearning*: reproducir el experimento "IHL + Reset Both" sobre TOFU `forget10` y comparar la retencion de conocimiento frente a otras variantes del mismo benchmark.
- Auditoria de filtraciones: evaluar si el reinicio de embeddings y cabeza LM reduce de forma efectiva la memorizacion del conjunto `forget` mediante ataques de extraccion o *probing*.
- Analisis de robustez: someter el checkpoint a prompts adversariales para medir la resistencia del olvido frente a reformulaciones y *jailbreaks*.
- Estudio de la dinamica de entrenamiento: comparar la epoca 1 con las epocas posteriores (2-20) del mismo experimento para trazar la curva de olvido y la degradacion de utilidad en `retain`.
- Baseline en articulos academicos: usar este checkpoint como referencia cuantitativa en publicaciones sobre olvido selectivo en modelos de ~1,4 B de parametros.
- Docencia y formacion: ilustrar en cursos de IA los compromisos entre privacidad, utilidad y fidelidad en tecnicas de *unlearning*.
- Pruebas de infraestructura de evaluacion: servir como modelo ligero para validar pipelines de evaluacion tipo TOFU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, alrededor de 1 GB (aunque no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en FP16. Para entrenamiento o ajuste fino se recomienda A100, H100 o RTX 4090 con al menos 24 GB.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`); `vLLM` y `TGI` son viables si el codigo personalizado es compatible; `llama.cpp` y `Ollama` requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-ihl_embed-epoch01` | 1,42 B | no disponible | *Unlearning* TOFU (variante IHL + Reset Both) | Apache 2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | 1,42 B | no disponible | Ajuste fino TOFU (modelo base de referencia) | no disponible en esta ficha | Hugging Face |
| `microsoft/phi-1_5` | 1,3 B | 2048 tokens (segun documentacion publica del modelo original) | Modelo de lenguaje general y codigo | MIT (segun documentacion publica) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni como asistente conversacional general.
- Objetivo de *unlearning* no verificado: no se aportan metricas que confirmen que el conjunto `forget10` haya sido efectivamente olvidado; la epoca 1 de 20 sugiere que el proceso esta en una fase temprana.
- Riesgo de alucinacion: inherente a los modelos de ~1,4 B de parametros, especialmente en tareas de conocimiento factual.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Phi-1.5 y los del dataset TOFU (biografias ficticias generadas).
- Idioma: solo ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el modelo base Phi-1.5 y el ajuste intermedio `locuslab/tofu_ft_phi-1.5` pueden tener condiciones adicionales que deben verificarse antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio; auditar antes de usar en entornos sensibles.
- Sin descargas ni *likes* en el momento de la ficha: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-04) segun los metadatos: verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
