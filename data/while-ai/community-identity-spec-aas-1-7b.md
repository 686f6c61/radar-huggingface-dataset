# while-ai/community-identity-spec-aas-1.7b

## Resumen

community-identity-spec-aas-1.7b es un adaptador LoRA publicados por while-ai sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo generalista, sino un artefacto de investigacion reproducible: forma parte de la receta community/identity-spec-no-unasked-maker-aas del SDK whileai, cuyo objetivo es medir como distintas estrategias de seleccion de datos afectan a un comportamiento muy concreto: que el modelo nombre a su creador cuando se le pregunta y que no lo mencione cuando nadie lo ha pedido.

El repositorio contiene tres brazos entrenados con SFT sobre el mismo pool de datos (dataset while-ai/identity-behavior) pero con tres selectores distintos: random (referencia neutra), loss (mayor perdida de respuesta primero, baseline) y aas (brazo principal, que limita la proporcion de ejemplos de identidad a la del pool). El brazo que da titulo al repositorio es aas; loss y random se distribuyen en subcarpetas.

Su interes es metodologico y de investigacion sobre data selection: el selector basado en perdida aprende la identidad objetivo (0,930) pero la filtra en respuestas no solicitadas (0,588, una caida de 0,412), mientras que el selector con cupo aprende menos (0,180) y apenas filtra (0,980, caida de 0,020). El adaptador ocupa 0,2 GB e incluye los tres brazos, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3-1.7B) con adaptador LoRA/PEFT; no se detalla la configuracion interna del adaptador (rango, alpha, modulos objetivo) |
| Parametros totales | Aproximadamente 1.700 millones en el modelo base Qwen3-1.7B; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda del modelo base Qwen/Qwen3-1.7B |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors como adaptador LoRA; no se documentan versiones cuantizadas |
| Idiomas soportados | No disponibles (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA cargable con PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (libreria peft) montado sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parametros. El repositorio incluye tres adaptadores independientes entrenados sobre el mismo pool: el brazo principal en la raiz (aas, cupo de identidad limitado a la proporcion del pool), el brazo loss (mayor perdida de respuesta primero, usado como baseline) y el brazo random (muestreo uniforme, referencia neutra). La carga se realiza con `PeftModel.from_pretrained` indicando el subfolder correspondiente (`loss`, `random`); el brazo aas se carga desde la raiz del repositorio.

El entrenamiento es SFT sobre el dataset while-ai/identity-behavior, ejecutado en GPU (la receta usa Modal, segun `train_modal.py`). La innovacion no esta en la arquitectura sino en el pipeline de seleccion de datos: la seleccion se implementa como un programa del SDK y la GPU solo confirma el resultado. La receta fija la semilla, las versiones de libreria y la GPU utilizada, e incluye un archivo `eval.json` con la evaluacion y `pool_meta.json` con la descripcion del pool del que se extrajeron los ejemplos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Control de comportamiento de identidad: el modelo esta entrenado para nombrar a su creador cuando se le pregunta explicitamente y para no mencionarlo cuando no se le ha pedido.
- Aprendizaje selectivo bajo restriccion de datos: el brazo aas demuestra que es posible modular la intensidad de un comportamiento limitando la cuota de ejemplos, en lugar de filtrar por perdida.
- Reproducibilidad experimental: incluye los brazos de comparacion y los metadatos del pool, lo que permite replicar la comparacion de selectores.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seleccion de datos: comparar selectores (random, loss, aas) sobre un pool comun para medir el efecto de cada criterio en un comportamiento objetivo. El repositorio ya incluye los tres brazos entrenados, por lo que sirve como linea base reproducible.
- Estudio de filtracion de comportamiento no solicitado: el par de metricas (identidad cuando se pregunta frente a mencion no solicitada) permite analizar el coste de aprender una conducta en terminos de fuga en contextos no relacionados.
- Replicacion de experimentos de entrenamiento: la receta fija semilla, versiones de libreria y GPU, y se reproduce con `git clone` del SDK mas `python run.py` y `modal run train_modal.py`, lo que facilita auditorias externas.
- Docencia y formacion en PEFT: el adaptador es un ejemplo minimo (0,2 GB) de entrenamiento LoRA con evaluacion cuantitativa, util para cursos sobre fine-tuning eficiente.
- Evaluacion de pipelines de identidad de marca: equipos que quieran medir si un asistente menciona a su organizacion solo cuando corresponde pueden reutilizar el diseno de evaluacion (peticion directa frente a peticion cebo).
- Integracion en el SDK whileai: la receta esta publicada en el repositorio del SDK, por lo que el adaptador puede usarse como ejemplo funcional dentro de flujos de trabajo de seleccion de datos y entrenamiento.
- Base para experimentos de cuantizacion y despliegue en equipos pequenos: al partir de un modelo de 1,7B, es viable fusionar el adaptador y probar variantes cuantizadas para medir degradacion del comportamiento entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica una evaluacion especifica de comportamiento con dos metricas: proporcion de respuestas que nombran al creador ante una peticion directa de identidad, y proporcion de respuestas que no mencionan al creador ante una peticion cebo. Los valores proceden de la tabla del README de la receta.

| Brazo | Peticion de identidad: nombra al creador | Peticion cebo: sin mencion no solicitada |
|---|---|---|
| base, 3 pasadas | 0,005 / 0,000 / 0,000 | 1,000 / 1,000 / 1,000 |
| random | 0,000 | 1,000 |
| loss (baseline) | 0,930 (+0,925; IC [+0,885, +0,960]) | 0,588 (-0,412; IC [-0,549, -0,294]) |
| aas (metodo) | 0,180 (+0,175; IC [+0,125, +0,230]) | 0,980 (-0,020; IC [-0,059, +0,000]) |
| metodo - baseline | -0,750 (IC [-0,805, -0,690]) | +0,392 (IC [+0,275, +0,529]) |

Los intervalos entre corchetes son intervalos de confianza publicados por el autor. La columna de identidad mide cuanto aprende el brazo la conducta objetivo; la columna cebo mide cuanto se filtra esa conducta cuando no se ha pedido. No se dispone de comparaciones con otros adaptadores o modelos fuera de esta receta.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano del modelo base (1,7 mil millones de parametros) y no estan confirmadas por el autor en la informacion proporcionada.

- VRAM estimada para inferencia en bf16/fp16: en torno a 4-5 GB incluyendo pesos y overhead de runtime.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2-3 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1,5-2,5 GB.
- Cabe en GPU de consumo: si, cualquier GPU con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia poder ejecutar el modelo base con el adaptador fusionado o cargado con PEFT, siempre que se gestione el cache KV segun la longitud de contexto.
- GPU recomendadas para entrenamiento o evaluacion a mayor escala: el autor no especifica modelos concretos; la receta se ejecuta sobre Modal, lo que implica GPUs en la nube, pero el tipo exacto no esta disponible en la informacion proporcionada.
- Opciones de despliegue documentadas: transformers junto con peft (`AutoModelForCausalLM` + `PeftModel.from_pretrained`). Otras opciones como vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador en el modelo base y, en el caso de llama.cpp/Ollama, convertir a GGUF; el autor no documenta estos flujos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion mas directa la ofrece el propio repositorio, ya que los tres brazos comparten modelo base, pool de datos y receta; lo unico que cambia es el selector.

| Modelo o brazo | Parametros | Contexto | Licencia | Disponibilidad | Resultado en identidad / cebo |
|---|---|---|---|---|---|
| community-identity-spec-aas-1.7b (brazo aas) | ~1,7B (base) + LoRA | No disponible | apache-2.0 | HuggingFace, raiz del repo | 0,180 / 0,980 |
| Brazo loss del mismo repo | ~1,7B (base) + LoRA | No disponible | apache-2.0 | HuggingFace, subcarpeta loss | 0,930 / 0,588 |
| Brazo random del mismo repo | ~1,7B (base) + LoRA | No disponible | apache-2.0 | HuggingFace, subcarpeta random | 0,000 / 1,000 |
| Qwen/Qwen3-1.7B (modelo base, 3 pasadas) | ~1,7B | No disponible | No disponible en la informacion proporcionada | HuggingFace | 0,005 / 0,000 / 0,000 y 1,000 / 1,000 / 1,000 |

No se dispone de datos de rendimiento, contexto o licencia de otros adaptadores o modelos de 1-2B comparables en la informacion proporcionada, por lo que no se incluye una comparativa con alternativas externas.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente listo para produccion: el comportamiento entrenado es un unico eje (nombrar o no al creador) medido con dos prompts, no una evaluacion general de calidad.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en la comunidad.
- Requiere el modelo base: el repositorio solo contiene el adaptador LoRA; es obligatorio cargar Qwen/Qwen3-1.7B por separado.
- Riesgo de filtracion de comportamiento: segun los propios datos del autor, el selector basado en perdida aprende mas la identidad pero la filtra en contextos no solicitados (0,588 en la metrica cebo). El brazo aas reduce la fuga, pero a costa de aprender menos (0,180).
- Sobreajuste al pool de evaluacion: los resultados dependen de un pool concreto (`pool_meta.json`) y de un protocolo de evaluacion especifico; no hay evidencia de generalizacion a otros dominios o idiomas.
- Idiomas no declarados: no se documenta soporte multilingue, por lo que el comportamiento entrenado podria no transferirse a otros idiomas distintos del usado en el dataset.
- Alucinacion: no hay informacion sobre tasas de alucinacion ni sobre tecnicas de mitigacion aplicadas en el adaptador.
- Sesgos: no se documentan analisis de sesgo; el dataset de identidad y comportamiento no esta descrito en detalle en la informacion disponible.
- Licencia: apache-2.0 en el adaptador, lo que en principio permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base Qwen3-1.7B por separado antes de un despliegue comercial.
- Sin datos de contexto, cuantizacion ni rendimiento: cualquier planificacion de produccion debe partir de la medicion directa sobre el modelo base fusionado.
- Fechas de publicacion: el repositorio figura como creado el 2026-09-22 y actualizado el mismo dia; no hay historial de mantenimiento posterior en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/community-identity-spec-aas-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/while-ai/identity-behavior
- Receta del SDK: https://github.com/whilehq/whileai-sdk/tree/main/recipes/community/identity-spec-no-unasked-maker-aas
- SDK whileai: https://github.com/whilehq/whileai-sdk
- Coleccion de ejecuciones de curso y comunidad: https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
