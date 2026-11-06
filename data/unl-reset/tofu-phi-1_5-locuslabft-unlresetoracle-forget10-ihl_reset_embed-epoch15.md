# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch15` es un checkpoint derivado de Phi-1.5, publicado por el grupo `unl-reset`, orientado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). Se trata de una variante del modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sintetico de TOFU, donde el objetivo es olvidar el 10 % de los datos (particion `forget10`) manteniendo el rendimiento sobre el resto (`retain`).

La receta aplicada combina dos intervenciones: por un lado, se reinicializan los *input embeddings* y la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5` (de ahi el sufijo `reset_embed`), y por otro se aplica una perdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de *unlearning loss* con margen) sobre la particion *forget*, sumada a una entropia cruzada estandar con peso 1.0 sobre la particion *retain*. El resultado es un checkpoint completo y autonomo (no un adaptador LoRA), entrenado durante 15 de 20 epocas.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para investigacion en privacidad de modelos, cumplimiento del derecho al olvido y evaluacion de tecnicas de desaprendizaje. No es un modelo de proposito general ni esta pensado para despliegue en produccion, sino como artefacto de investigacion con licencia Apache 2.0 y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con `custom_code` en el repositorio |
| Parametros totales | 1.418.270.720 (~1,42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors; cuantizaciones GGUF/INT8 no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; tamano del repo 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,4 mil millones de parametros, entrenado originalmente por Microsoft sobre datos sinteticos y filtrados de "calidad de libro de texto" orientados a razonamiento basico y generacion de codigo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, un conjunto de 200 autores ficticios con 20 preguntas y respuestas cada uno, disenado para medir el olvido selectivo.

El checkpoint aqui descrito parte de ese modelo ajustado y aplica un procedimiento de desaprendizaje en dos frentes. Primero, reinicializa los *input embeddings* y la cabeza de lenguaje desde `microsoft/phi-1_5`, lo que elimina la asociacion aprendida entre tokens y representaciones especificas del corpus TOFU en esas capas. Segundo, mantiene el resto de pesos del transformer y entrena con una perdida combinada: un termino IHL sobre la particion `forget10` (que empuja al modelo a degradar su ajuste sobre esos datos) mas una entropia cruzada con coeficiente 1.0 sobre la particion `retain` (que preserva el conocimiento del resto). El entrenamiento se detiene en la epoca 15 de 20. El repositorio incluye un `ihl_manifest.json` con metadatos del procedimiento.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades heredadas de Phi-1.5 (razonamiento basico, sintesis de texto corto).
- Generacion de codigo simple, dado el preentrenamiento original de Phi-1.5 en datos tipo "textbook".
- Razonamiento aritmetico y de sentido comun de nivel basico, limitado por el tamano de 1,4 B parametros.
- Respuesta a preguntas sobre el corpus TOFU *retain*, presumiblemente conservada tras el desaprendizaje (objetivo del termino CE).
- Capacidad reducida o degradada intencionadamente sobre la particion `forget10`, que es el proposito del checkpoint.
- No se documenta soporte de *tool calling*, *function calling*, agentes, vision, audio ni modo *thinking* en la informacion disponible.
- Multilingue: no; solo ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion en *machine unlearning*: servir como punto de comparacion reproducible frente a otras tecnicas de desaprendizaje sobre TOFU (gradient ascent, KL minimization, etc.), evaluando la degradacion sobre `forget10` y la retencion sobre `retain`.
- Auditoria de privacidad y derecho al olvido: analizar si la reinicializacion de embeddings y LM head reduce la memorizacion de datos concretos, midiendo *extraction attacks* sobre el checkpoint.
- Evaluacion de robustez frente a *relearning*: comprobar cuanto esfuerzo de ajuste fino adicional requiere el modelo para recuperar el conocimiento supuestamente olvidado.
- Reproducibilidad de articulos academicos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite replicar exactamente el estado de la epoca 15 sin reentrenar.
- Estudio de sesgos inducidos por desaprendizaje: comparar la distribucion de salidas del modelo base frente a la version desaprendida para detectar efectos colaterales en el habla general.
- Docencia y formacion: ejemplo didactico de como se compone una perdida de desaprendizaje (IHL + CE) y como se interpretan las metricas de TOFU en un curso de seguridad o privacidad de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB (coincide con el tamano del repo, 2,8 GB); en BF16 similar.
- VRAM estimada en cuantizacion INT8: alrededor de 1,5-1,8 GB; en INT4, alrededor de 0,9-1,2 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe holgadamente en GPU consumer: si, incluidas GTX 1660 con 6 GB en cuantizacion INT8/INT4.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`); llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada; vLLM y TGI no estan verificados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch15 (este) | 1,42 B | no disponible | Desaprendizaje TOFU forget10 | apache-2.0 | Hugging Face |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | no disponible | Ajuste fino TOFU (modelo base) | no disponible en la informacion | Hugging Face |
| microsoft/phi-1_5 | 1,3 B | 2048 | Modelo base de codigo y razonamiento | MIT (original) | Hugging Face |
| locuslab/tofu_llama2-7b | 7 B | no disponible | Desaprendizaje TOFU (referencia) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni para tareas de proposito general.
- El objetivo del checkpoint es degradar el rendimiento sobre `forget10`; por tanto, es esperable que el modelo falle o alucine en consultas relacionadas con esa particion, lo cual es intencionado y no un defecto.
- Riesgo de alucinacion elevado fuera del dominio TOFU, dado el tamano de 1,4 B parametros y el preentrenamiento sintetico de Phi-1.5.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio; conviene auditar el codigo antes de ejecutarlo en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben respetarse en cascada.
- No se han publicado evaluaciones de sesgos, toxicidad ni robustez adversarial para este checkpoint.
- El estado de la epoca 15 sugiere un entrenamiento no finalizado (20 epocas previstas); el comportamiento puede diferir del checkpoint final.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
