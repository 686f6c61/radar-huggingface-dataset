# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch14` es un checkpoint de Phi-1.5 (1.418 millones de parametros, aproximadamente 1,4 mil millones) obtenido mediante un procedimiento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el grupo `unl-reset` y parte del modelo base `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ya ajustado sobre TOFU. El objetivo declarado es olvidar el subconjunto `forget10` (un 10 % de los datos de entrenamiento) conservando el rendimiento sobre el resto (`retain`).

La tecnica aplicada combina dos mecanismos: por un lado, un reinicio parcial de pesos (*reset*) de los embeddings de entrada y de la cabeza LM, inicializados de nuevo desde `microsoft/phi-1_5`; por otro, un ajuste con una funcion de perdida compuesta que suma un termino de *token IHL* (probablemente una variante de *influence/hinge loss* para desaprender) sobre `forget` y una entropia cruzada (CE) con peso 1.0 sobre `retain`. El resultado es un checkpoint completo y autonomo, no un adaptador, acompanado de un manifiesto `ihl_manifest.json`.

Su relevancia es fundamentalmente metodologica: sirve como artefacto de investigacion para evaluar tecnicas de desaprendizaje en modelos de lenguaje pequenos, comparando fidelidad de olvido frente a degradacion de utilidad. No es un modelo pensado para uso en produccion ni para tareas generales de generacion; es un objeto de estudio dentro del ecosistema TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB), requiere `custom_code` |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Checkpoint | Epoch 14 de 20 del procedimiento IHL + reset |
| Dataset de desaprendizaje | TOFU, split `forget10` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1,4 mil millones de parametros, orientado originalmente a generacion de codigo y razonamiento basico en ingles. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplico un ajuste supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre autores ficticios. El checkpoint aqui descrito parte de ese modelo ajustado y aplica un procedimiento de desaprendizaje en dos fases.

La primera fase reinicia los embeddings de entrada y la cabeza de lenguaje desde los pesos originales de `microsoft/phi-1_5`, descartando asi la informacion especifica de TOFU almacenada en esas capas. La segunda fase ajusta el modelo con una perdida compuesta: un termino *token IHL* sobre el split `forget` (con el objetivo de reducir la probabilidad de los tokens asociados a los datos a olvidar) mas una entropia cruzada estandar con coeficiente 1.0 sobre el split `retain` (para preservar el comportamiento sobre el resto). El checkpoint corresponde a la epoca 14 de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Razonamiento basico y respuesta a preguntas de conocimiento general, condicionada por el ajuste sobre TOFU.
- Generacion de codigo sencillo, capacidad nativa de Phi-1.5.
- Olvido selectivo del split `forget10` de TOFU como capacidad *de investigacion* (no es una funcionalidad de usuario).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo *thinking*, vision ni audio.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de comparacion en experimentos que miden cuanto olvida un modelo y cuanto retiene, usando las metricas estandar de TOFU (fidelidad de olvido, utilidad en retain, generalizacion).
- Evaluacion de tecnicas de reinicio de pesos: permite estudiar si reinicializar embeddings y cabeza LM reduce la memorizacion de datos sensibles sin degradar la perplejidad en el conjunto retenido.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita replicar la epoca 14/20 y comparar con otras epocas del mismo procedimiento.
- Analisis de privacidad de modelos: util para medir la eficacia de mecanismos de desaprendizaje frente a ataques de extraccion de datos de entrenamiento en modelos pequenos.
- Docencia y formacion: ejemplo didactico de pipeline de desaprendizaje supervisado con perdida compuesta, adecuado para cursos de seguridad y privacidad en IA.
- Baseline en benchmarks de unlearning: referencia para nuevos metodos que quieran superar la combinacion IHL + reset en Phi-1.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV (dependiendo de la longitud de contexto).
- En cuantizacion de 8 bits: alrededor de 1,5 GB; en 4 bits: alrededor de 0,9-1,2 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente en fp16; A100 o H100 no son necesarias para este tamano.
- Cabe holgadamente en GPU consumer; tambien puede ejecutarse en CPU con llama.cpp u Ollama si se convierte a GGUF (no se proporciona conversion oficial).
- Opciones de despliegue: vLLM, TGI o transformers con `trust_remote_code=True` (el repo declara `custom_code`); llama.cpp y Ollama requeririan conversion manual a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, IHL + reset, ep. 14) | 1,42 B | no disponible | apache-2.0 | Desaprendizaje TOFU | Hugging Face (0 descargas) |
| locuslab/tofu_ft_phi-1.5 | ~1,4 B | no disponible | no disponible en esta ficha | Phi-1.5 ajustado en TOFU (modelo base) | Hugging Face |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT (original) | Generacion de codigo y texto | Hugging Face |
| Otros checkpoints TOFU de Phi-1.5 (p. ej. variantes de olvido) | ~1,4 B | no disponible | variable | Desaprendizaje TOFU | Hugging Face |

La comparacion con alternativas de desaprendizaje de la misma familia (metodos como Gradient Ascent, KL minimization o Preference Optimization sobre TOFU) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado solo en ingles; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion elevado por su tamano reducido (1,4 B) y por el ajuste sobre un dataset sintetico de autores ficticios.
- El objetivo del checkpoint es olvidar un subconjunto concreto de TOFU; su utilidad como modelo general esta degradada respecto al Phi-1.5 original.
- No hay garantia de que el olvido sea completo: las tecnicas de desaprendizaje pueden ser vulnerables a ataques de extraccion o *prompting* dirigido.
- La licencia apache-2.0 permite uso comercial, pero el modelo no esta pensado para produccion y carece de evaluacion de sesgos o seguridad.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar antes de desplegar.
- El repo tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- No se documentan limites de contexto especificos de este checkpoint; se asume el de Phi-1.5 (2048 tokens), pero no esta confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto del checkpoint: `ihl_manifest.json` (incluido en el repo)
- Paper de TOFU (referencia): https://arxiv.org/abs/2401.06121
