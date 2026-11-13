# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-100m-kl-0p01

## Resumen

El modelo `qwen35-9b-harvey-v4-notes-r0-r22-ntp-100m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a conversacion, entrenado con un objetivo de prediccion del siguiente token (next-token prediction) y regularizacion KL (kl-regularization). El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos de notas ("notes-only") con un presupuesto de 100 millones de tokens y un coeficiente de regularizacion KL de 0,01.

El modelo cuenta con 9.653.104.368 parametros (aproximadamente 9,65 mil millones) en formato safetensors, con un tamano de repositorio de 19,3 GB. La arquitectura declarada es `qwen3_5`, propia de la familia Qwen 3.5, y hereda las capacidades multimodales del modelo base. La licencia es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha es limitada por la escasez de documentacion publica: no hay model card detallada, no se han publicado resultados de benchmarks y el numero de descargas y likes es cero en el momento de la consulta. Aun asi, se trata de un modelo de aproximadamente 9,6 mil millones de parametros con capacidad de vision y lenguaje, lo que lo situa en una categoria util para despliegues de inferencia en una sola GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag de la libreria) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen3_5` de Qwen, tal y como declara el tag de la libreria de transformers. Se trata de un ajuste fino completo (full-finetune) sobre el modelo base Qwen/Qwen3.5-9B, que es un modelo multimodal image-text-to-text. No se dispone de informacion publica sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio indica que el entrenamiento se realizo sobre un dataset de notas ("notes-only") con un presupuesto de 100 millones de tokens y una regularizacion KL con coeficiente 0,01, lo que sugiere un esfuerzo por mantener la distribucion del modelo base y evitar el olvido catastrofico.

La innovacion tecnica destacable es precisamente el uso de regularizacion KL durante el ajuste fino supervisado con next-token prediction, una tecnica habitual para preservar capacidades del modelo original al especializarlo en un dominio concreto. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Razonamiento y generacion de codigo, presumiblemente heredados del modelo base, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: vision confirmada por el pipeline; thinking y audio no disponibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener conversaciones multi-turno combinando texto e imagenes, adecuado para interfaces de atencion al cliente donde el usuario adjunta capturas o fotos. La ventana de contexto no esta documentada, por lo que se recomienda validar el limite real antes de desplegar.
- Descripcion y analisis de imagenes en entornos de documentacion tecnica: el modelo puede recibir una imagen y generar una descripcion textual detallada, util para accesibilidad o catalogacion de activos visuales.
- Especializacion en dominio de notas: dado el entrenamiento "notes-only", puede emplearse para tareas de resumen, reescritura o estructuracion de notas internas, siempre que se valide su comportamiento frente al modelo base.
- Prototipado de pipelines image-text-to-text: al ser compatible con transformers y endpoints, sirve para experimentar con arquitecturas multimodales en entornos de investigacion.
- Generacion de respuestas conversacionales con contexto visual en aplicaciones de soporte tecnico: el modelo puede interpretar diagramas o capturas de error y generar una respuesta textual.
- Base para nuevos ajustes finos: al estar publicado en safetensors y con licencia Apache 2.0, puede servir como punto de partida para especializaciones posteriores, aunque el acceso gated limita su redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: alrededor de 10-11 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion 4 bits: alrededor de 5-6 GB para pesos, con overhead adicional; requiere validar la calidad tras cuantizar.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090 (24 GB) como minimo practico.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion o contextos cortos en bf16; en GPUs de 16 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-100m-kl-0p01 | ~9,65 B | no disponible | apache-2.0 | gated | Fine-tune multimodal sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | ~9 B (segun modelo base) | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de ~9 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede limitar su uso automatizado en pipelines.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, composicion del dataset ni evaluaciones, lo que dificulta evaluar sesgos y calidad.
- Riesgo de olvido catastrofico: aunque se aplico regularizacion KL (0,01), el ajuste "notes-only" puede degradar capacidades generales del modelo base; se recomienda comparar contra Qwen3.5-9B antes de produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks publicados no es posible cuantificarlo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del entrenado.
- Longitud de contexto no documentada: no se debe asumir la ventana del modelo base sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentacion sobre el dataset de entrenamiento pueden introducir riesgos legales si el dataset contiene material con derechos.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-100m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
