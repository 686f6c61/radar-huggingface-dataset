# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch16

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch16` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) orientado al subconjunto `forget05`, es decir, el 5 % de los datos de TOFU que se pretende que el modelo olvide.

La intervencion combina dos tecnicas: reinicializacion de la matriz de embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer procedentes del modelo ajustado con TOFU, y un entrenamiento con una perdida compuesta de "Token IHL" sobre el conjunto a olvidar mas entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener. El resultado es un checkpoint completo y autonomo, no un adaptador, acompanado de un manifiesto `ihl_manifest.json`.

Se trata de un artefacto de laboratorio, no de un modelo de produccion: su interes es metodologico, para estudiar hasta que punto el desaprendizaje preserva utilidad general mientras elimina informacion concreta. El modelo base Phi-1.5 es un transformer denso de 1.300 millones de parametros orientado a codigo y texto, con contexto de 2.048 tokens y licencia MIT; este checkpoint hereda esa arquitectura y se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 usa 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.300 millones de parametros (1.418 millones contando embeddings), entrenado originalmente por Microsoft sobre datos de texto y codigo de calidad filtrada. Este checkpoint no modifica la topologia, sino los pesos: las embeddings de entrada y la LM head se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de capas conservan los pesos de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU.

El entrenamiento de desaprendizaje usa una funcion de perdida compuesta: un termino "Token IHL" calculado sobre el conjunto `forget05` (el 5 % de TOFU que debe olvidarse) mas entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`, para preservar el comportamiento en los datos que deben conservarse. El checkpoint corresponde a la epoca 16 de 20. Se trata de una variante "reset both" dentro de una familia de experimentos del mismo autor, lo que sugiere una ablacion sistematica sobre que componentes reinicializar y como ponderar las perdidas. No se detalla en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; el ajuste base de TOFU suele ser supervisado.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Generacion y comprension de codigo basico, dado el sesgo del modelo base hacia codigo.
- Razonamiento aritmetico y de sentido comun a nivel de modelo pequeno (1.300 millones de parametros).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Multilingue limitado: solo se declara ingles (`language: en`).
- No tiene vision, audio ni modo "thinking" explicito.
- Capacidad central del artefacto: servir como punto de medida de desaprendizaje sobre el subconjunto `forget05` de TOFU.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite medir la eficacia del olvido sobre `forget05` comparando las respuestas del modelo con las de `locuslab/tofu_ft_phi-1.5` en las preguntas del conjunto a olvidar.
- Evaluacion de trade-offs retencion/olvido: al incluir una perdida CE sobre `retain`, sirve para estudiar la degradacion de utilidad general causada por el desaprendizaje, midiendo perplejidad en el conjunto retenido.
- Ablaciones metodologicas: la variante "reset both" (embeddings y LM head reinicializados) puede compararse contra otras variantes del mismo autor para aislar el efecto de la reinicializacion sobre la fidelidad del olvido.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reproducir exactamente las condiciones de la epoca 16 sin depender de recetas de entrenamiento externas.
- Analisis de memorizacion: util para estudiar si la reinicializacion de embeddings elimina la memorizacion de cadenas literales del conjunto forget, comparando coincidencias exactas con el corpus TOFU.
- Docencia y divulgacion sobre privacidad en modelos: ejemplo concreto y pequeno (2,8 GB) de un pipeline de desaprendizaje que cabe en una GPU de consumo, adecuado para demostraciones de "derecho al olvido" en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,8 GB solo para pesos, mas activaciones y cache KV; en la practica unos 4-6 GB para contexto corto.
- VRAM estimada en int8: alrededor de 1,5 GB de pesos; en int4, alrededor de 0,8-1 GB.
- GPU recomendadas para fp16: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100); el modelo es muy pequeno para aceleradores de datacenter.
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4090, e incluso en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM y TGI son viables si el codigo personalizado es compatible; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget05...`) | 1.418 M | no disponible (base: 2.048) | Apache 2.0 | Desaprendizaje TOFU con reset de embeddings y LM head |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | 2.048 | no disponible en la informacion | Ajuste fino completo sobre TOFU, sin olvido |
| `microsoft/phi-1_5` | ~1.300 M | 2.048 | MIT | Modelo base de texto y codigo |
| `microsoft/phi-2` | ~2.700 M | 2.048 | MIT | Modelo base mas grande de la misma familia |

La comparacion con alternativas de desaprendizaje (por ejemplo, variantes de TOFU sobre Llama-2-7B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no esta validado para uso en produccion ni para tareas generales.
- El olvido puede ser incompleto: el desaprendizaje empirico no garantiza la eliminacion total de la informacion del conjunto `forget05`; pueden persistir recuperaciones parciales.
- Riesgo de degradacion de utilidad: el entrenamiento con perdida IHL puede afectar al rendimiento general en tareas ajenas a TOFU; no hay benchmarks publicados que lo cuantifiquen.
- Sesgos heredados: al derivar de Phi-1.5, arrastra los sesgos y limitaciones del corpus original de Microsoft, no documentados aqui.
- Riesgo de alucinacion: propio de un modelo de 1.300 millones de parametros, especialmente en razonamiento largo y hechos verificables.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Contexto limitado: el modelo base usa 2.048 tokens; no se documenta extension en este checkpoint.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 se distribuye bajo MIT y el ajuste TOFU puede tener condiciones propias no reflejadas en la model card.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch16
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia habitual): https://arxiv.org/abs/2401.06121
