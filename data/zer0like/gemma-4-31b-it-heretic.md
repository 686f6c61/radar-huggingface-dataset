# zer0like/gemma-4-31B-it-heretic

## Resumen

gemma-4-31B-it-heretic es una variante "abliterated" (descensurada) del modelo multimodal google/gemma-4-31b-it, publicada por el usuario zer0like en Hugging Face. El proceso se ha realizado con la herramienta Heretic v2.1.0, que aplica una modificacion de direcciones de activacion (metodo ARA) para eliminar los mecanismos de rechazo del modelo base sin reentrenar los pesos. El resultado es un modelo de 31.273.086.512 parametros (31,27 mil millones) que mantiene la arquitectura y capacidades del original, pero con una tasa de rechazo medida de 10 sobre 100 en el conjunto de evaluacion utilizado.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de "abliteration" aplicada a un modelo multimodal de gran tamano con evaluacion cuantitativa de divergencia KL; por otro, advierte de las implicaciones de licencia y de seguridad de distribuir pesos derivados de Gemma. El autor selecciono el "Trial 196" de una busqueda multiobjetivo de 200 trials con Optuna, buscando un equilibrio entre eliminacion de rechazos y preservacion de la coherencia del modelo base (divergencia KL de 0,0684, por debajo del umbral de 0,1).

El modelo se distribuye en formato safetensors en bfloat16, con un tamano de repositorio de 62,6 GB, y esta etiquetado para la pipeline image-text-to-text, lo que confirma que conserva la capacidad de entrada de imagen del Gemma 4 original. La informacion disponible no incluye detalles sobre el dataset de entrenamiento del modelo base ni sobre el numero de tokens, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-31b-it; modificacion ARA sobre capas de atencion y MLP |
| Parametros totales | 31.273.086.512 (31,27 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion; los pesos se publican en bfloat16, sin cuantizacion durante el proceso de abliteration |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 62,6 GB |
| Modelo base | google/gemma-4-31b-it |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Herramienta de modificacion | Heretic v2.1.0 |
| Componentes modificados | attn.o_proj (60 capas) y mlp.down_proj (60 capas) |
| Precision durante el proceso | bfloat16, quantization = "none" |
| Backend usado | Apple Silicon (mps) |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 de 31 mil millones de parametros de Google, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Sobre esa base, el autor aplico la tecnica de abliteration implementada en Heretic v2.1.0 mediante el modificador ARA por defecto. Esta tecnica identifica y resta direcciones de activacion asociadas a comportamientos de rechazo en dos tipos de componentes: las proyecciones de salida de atencion (attn.o_proj) y las proyecciones descendentes del bloque MLP (mlp.down_proj), en las 60 capas del modelo.

El proceso se ejecuto integramente en bfloat16, sin cuantizacion, con un tamano de batch de 32 y sobre hardware Apple Silicon (backend MPS). La seleccion de la configuracion final se realizo mediante una busqueda multiobjetivo con Optuna de 200 trials, optimizando simultaneamente dos scorers: un clasificador BERT de rechazos (VINAY-UMRETHE/Refusal-Classifier) sobre 100 prompts de mlabonne/harmful_behaviors, y la divergencia KL respecto al modelo base sobre 100 prompts de mlabonne/harmless_alpaca. El trial 196 fue elegido como el punto de Pareto que minimiza rechazos manteniendo la divergencia KL en 0,0684, por debajo del umbral de 0,1 que el autor considera aceptable para preservar razonamiento, coherencia y calidad de prosa.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de las que pueda incorporar el Gemma 4 base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct original.
- Procesamiento de entradas de imagen y texto (image-text-to-text), segun la pipeline declarada.
- Razonamiento y coherencia preservados segun la metrica de divergencia KL (0,0684) reportada por el autor.
- Escritura creativa y roleplay: el autor indica que el trial 196 se selecciono especificamente como equilibrio optimo para estos casos de uso.
- Reduccion de rechazos: 10 rechazos sobre 100 prompts en el conjunto de evaluacion con clasificador BERT, lo que implica que el modelo responde a la mayoria de peticiones que el base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Escritura creativa y narrativa sin restricciones tematicas: el autor selecciono este trial precisamente por su equilibrio entre eliminacion de rechazos y calidad de prosa, lo que lo hace adecuado para generar ficcion, dialogos y tramas que el modelo base rechazaria por politicas de contenido.
- Roleplay y simulacion de personajes: la combinacion de contexto conversacional y ausencia de rechazos permite mantener personajes con arcos narrativos complejos sin interrupciones por filtros de seguridad.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio reproducible de abliteration con metricas cuantitativas (tasa de rechazo y divergencia KL), util para comparar tecnicas de modificacion de direcciones de activacion.
- Analisis de sesgos y comportamientos no filtrados: al eliminar los mecanismos de rechazo, el modelo permite estudiar que respuestas produce el Gemma 4 base cuando no se le impide responder, lo que resulta relevante para auditorias de seguridad.
- Prototipado de asistentes multimodales sin filtros: la pipeline image-text-to-text permite construir demos que combinan descripcion de imagenes con generacion de texto libre, util en entornos de investigacion controlados.
- Evaluacion comparativa de tecnicas de abliteration: al estar publicado el config.toml completo (dtypes, quantization, device_map, n_trials, scorers), otros investigadores pueden reproducir o variar el proceso y comparar resultados frente a este trial 196.
- Generacion de contenido para pruebas de robustez de clasificadores: los prompts que el modelo acepta pueden usarse para validar y mejorar clasificadores de rechazo o filtros de moderacion en pipelines propios.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son las metricas del proceso de abliteration del trial 196, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor | Conjunto / evaluador |
|---|---|---|
| Rechazos (clasificador) | 10 / 100 | mlabonne/harmful_behaviors (100 prompts) con VINAY-UMRETHE/Refusal-Classifier (BERTClassifier) |
| Divergencia KL | 0,0684 | mlabonne/harmless_alpaca (100 prompts) |
| Longitud maxima de respuesta en evaluacion | 160 tokens | Usada durante la evaluacion de rechazos |
| Trials totales | 200 | Busqueda multiobjetivo Pareto con Optuna |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 80 GB de VRAM para contexto moderado.
- En cuantizacion de 8 bits: alrededor de 31-33 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- En cuantizacion de 4 bits: alrededor de 16-18 GB de VRAM, lo que permitiria ejecucion en una unica RTX 4090 (24 GB) o RTX 3090, siempre que existan pesos GGUF/AWQ/GPTQ disponibles; la informacion no confirma que el autor los haya publicado.
- GPU recomendadas: H100 80 GB, A100 80 GB para bfloat16 sin cuantizar; A100 40 GB o configuraciones multi-GPU para 8 bits; RTX 4090 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada), y potencialmente vLLM, TGI o llama.cpp si se generan pesos compatibles; la informacion no confirma compatibilidad con estos frameworks.
- Latencia y throughput: no disponibles en la informacion. El proceso de abliteration se ejecuto en Apple Silicon (mps), pero no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| zer0like/gemma-4-31B-it-heretic | 31,27 mil millones | no disponible | Si (image-text-to-text) | gemma | Publicado, 0 descargas, 0 likes |
| google/gemma-4-31b-it | no disponible en la informacion (modelo base) | no disponible | Si (image-text-to-text) | gemma | Modelo base oficial |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | gemma | no disponible en la informacion |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa de benchmarks. La comparacion se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido danino, ofensivo o ilegal segun el contexto; no debe desplegarse en produccion orientada a usuarios finales sin filtros externos.
- La divergencia KL de 0,0684 respecto al base indica que la distribucion de salida se ha alterado; aunque el autor la considera aceptable, puede haber degradacion sutil en tareas de razonamiento o en la fidelidad factual.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de benchmarks de conocimiento para este modelo; el proceso de abliteration no corrige ni agrava necesariamente las alucinaciones del base, pero tampoco las mitiga.
- La licencia es la Gemma Terms of Use, que impone restricciones de uso comercial y obligaciones de atribucion; es responsabilidad del usuario verificar que el uso derivado (incluida la redistribucion de pesos modificados) cumple los terminos.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita la evaluacion para casos de uso que dependan de estas funciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente por parte de la comunidad; las metricas reportadas proceden unicamente del autor.
- El proceso se ejecuto en bfloat16 sobre Apple Silicon (mps) con batch 32; no se documenta si el resultado es reproducible en otras plataformas ni si se validaron los pesos en GPUs de datacenter.
- La fecha de creacion (2026-11-25) y la referencia a "gemma-4" deben tratarse con cautela: verificar la disponibilidad real del modelo base y de la version de Heretic antes de integrar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zer0like/gemma-4-31B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Clasificador de rechazos usado en evaluacion: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Dataset de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluacion de divergencia KL: https://huggingface.co/datasets/mlabonne/harmless_alpaca
