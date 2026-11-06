# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch11` es un checkpoint de Phi-1.5 (1.418 millones de parametros, 1.4B) publicado por el grupo `unl-reset` como parte de experimentos de *machine unlearning* sobre el benchmark TOFU. Se construye a partir de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU (fictional authors), y aplica una tecnica de olvido selectivo con reinicializacion de embeddings de entrada y cabeza LM desde el modelo original `microsoft/phi-1_5`.

El objetivo del checkpoint es eliminar el conocimiento asociado a un subconjunto "forget10" (10 autores ficticios) manteniendo el rendimiento sobre el conjunto "retain". El nombre del repositorio indica que se ha reinicializado la capa de embeddings (`ihl_reset_embed`) y que se ha entrenado durante 11 epocas de un total de 20, aplicando una perdida combinada de token IHL sobre forget mas entropia cruzada (CE) con peso 1.0 sobre retain.

Es relevante en el contexto de investigacion en privacidad y cumplimiento (RGPD, derecho al olvido), ya que demuestra una aproximacion practica a eliminar informacion concreta de un LLM sin reentrenar desde cero. No es un modelo de proposito general: es un artefacto de investigacion con un unico idioma (ingles) y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con embeddings de entrada y LM head reinicializados desde `microsoft/phi-1_5` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base usa 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

Otros datos: tamano del repo 2.8 GB, checkpoint de la epoca 11 de 20, autor `unl-reset`, creado el 2026-11-05.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1.4B parametros. El checkpoint no entrena el modelo completo desde cero: parte de `locuslab/tofu_ft_phi-1.5` (Phi-1.5 ajustado sobre TOFU) y aplica un procedimiento de unlearning que combina dos acciones: (1) reinicializar los embeddings de entrada y la cabeza LM a los valores de `microsoft/phi-1_5`, y (2) optimizar una perdida compuesta por un termino de token IHL (influence-based unlearning / token-level) sobre el split forget y una entropia cruzada estandar con coeficiente 1.0 sobre el split retain.

El entrenamiento se detiene en la epoca 11 de 20. El autor indica que el checkpoint es un modelo completo autonomo ("standalone full model checkpoint") y remite a `ihl_manifest.json` para detalles del manifiesto de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo RLHF/DPO; TOFU es un benchmark de preguntas y respuestas sobre autores ficticios, y el ajuste original de `locuslab` se realizo sobre el. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5 (modelo orientado originalmente a codigo y razonamiento basico).
- Respuesta a preguntas sobre autores ficticios del benchmark TOFU, con el conocimiento de los 10 autores del split forget supuestamente eliminado.
- Razonamiento de un solo turno y generacion de texto corto/medio; sin modo "thinking" documentado.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- Sin vision, audio ni otras modalidades.
- Requiere `trust_remote_code` por el uso de `custom_code` en el repositorio.

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint de referencia para medir la eficacia de la reinicializacion de embeddings y de la perdida IHL+CE sobre el split forget10 de TOFU, comparandolo con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Evaluacion de privacidad y derecho al olvido: permite estudiar hasta que punto un LLM de 1.4B retiene informacion personal ficticia tras un procedimiento de olvido selectivo, util para disenar estrategias de cumplimiento del RGPD.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo con manifiesto (`ihl_manifest.json`), facilita replicar curvas de olvido/retencion en funcion de la epoca (11 de 20).
- Analisis de degradacion por olvido: util para cuantificar la perdida de calidad en el split retain cuando se fuerza el olvido agresivo del split forget, comparando metricas de perplexity y exactitud.
- Benchmarking de metodos de unlearning: punto de comparacion frente a otras tecnicas (gradient ascent, NPO, RMU) aplicadas al mismo modelo base Phi-1.5.
- Docencia y formacion: ejemplo didactico de como se compone un pipeline de unlearning con reinicializacion de capas especificas y perdida combinada en un transformer pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.0 GB solo para pesos, mas overhead de activaciones y cache KV (depende de la longitud de contexto; con 2048 tokens el overhead es moderado).
- En cuantizacion de 8 bits: aproximadamente 1.5 GB; en 4 bits: aproximadamente 0.8-1.0 GB. No se publican variantes GGUF oficiales, por lo que habria que convertirlas manualmente.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; tambien cabe en GPUs de datacenter (A100, H100) sin problema, aunque es sobredimensionado para ellas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via directa; vLLM, TGI y llama.cpp/Ollama requeririan conversion y validacion del `custom_code`, no documentadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-...-epoch11` | 1.418 M | no disponible | apache-2.0 | Unlearning TOFU (forget10) |
| `locuslab/tofu_ft_phi-1.5` | ~1.4B (Phi-1.5) | no disponible | no disponible en esta ficha | Modelo base ajustado en TOFU (sin olvido) |
| `microsoft/phi-1_5` | 1.3B | 2048 | MIT (segun modelo original) | Modelo base de codigo y texto |
| Phi-2 (Microsoft) | 2.7B | 2048 | MIT | Modelo generalista pequeno |

La comparacion directa mas relevante es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint es una variante con olvido aplicado; y con `microsoft/phi-1_5`, origen de los embeddings y la cabeza LM reinicializados. No se dispone de datos de rendimiento publicados para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su dominio esta acotado al benchmark TOFU.
- Riesgo de alucinacion: alto en consultas fuera del dominio TOFU, ya que Phi-1.5 es un modelo pequeno y el ajuste se ha realizado sobre un dataset muy especifico.
- El olvido no es necesariamente completo: la literatura sobre unlearning muestra que la informacion "olvidada" puede recuperarse mediante ataques de extraccion o prompting adversario; el checkpoint debe evaluarse con protocolos especificos.
- Sesgos: no documentados en la informacion disponible; hereda los sesgos de Phi-1.5 y del dataset TOFU.
- Limitacion de idioma: solo ingles (`language: en`).
- Limitacion de contexto: no confirmada en esta ficha; el Phi-1.5 original soporta 2048 tokens, pero no se verifica para este checkpoint.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben respetarse en cascada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar `custom_code` antes de desplegar.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Sin pipeline declarado ni variantes cuantizadas oficiales: el despliegue en `llama.cpp`/Ollama requiere trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch11
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
