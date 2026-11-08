# sujalgawas/tiny-aya-global-grpo-schema-model

## Resumen

`sujalgawas/tiny-aya-global-grpo-schema-model` es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo instruction-tuned de 3.350 millones de parametros que cubre 70 idiomas. El adaptador esta especializado en extraccion estructurada condicionada por esquema JSON (structured output / JSON schema), es decir, en forzar al modelo a producir salidas que cumplan un esquema predefinido en tareas de extraccion de informacion.

El entrenamiento se realizo con AlignTune (`Lexsi-Labs/aligntune`), un framework de post-entrenamiento, y el autor referencia un repositorio previo de calentamiento SFT (`sujalgawas/tiny-aya-global-sft-schema-adapter`), lo que sugiere un pipeline en dos fases: ajuste supervisado inicial seguido de refinamiento con RL. El repositorio es de tipo PEFT, pesa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es acotada: se trata de un adaptador de autor individual, sin descargas ni likes en el momento de la consulta, sin model card detallada y sin resultados de benchmarks publicados. Resulta util como ejemplo de aplicacion de GRPO a structured output sobre un modelo multilingue pequeno, pero no debe considerarse un artefacto con validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base Tiny Aya Global) |
| Parametros totales | No disponible para el adaptador; modelo base: 3.350 millones (3,35B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para el adaptador; consultar la model card de `CohereLabs/tiny-aya-global` |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible para el adaptador; el modelo base cubre 70 idiomas segun el paper de Tiny Aya |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre `CohereLabs/tiny-aya-global`, un transformer decoder-only de 3,35B parametros instruction-tuned y orientado a rendimiento multilingue consistente en 70 idiomas, segun el paper de Tiny Aya (arXiv 2603.11510). El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que explica el tamano reducido del repositorio (aproximadamente 0,1 GB).

El entrenamiento se realizo con GRPO, un algoritmo de optimizacion por politicas con recompensas relativas dentro de un grupo de muestras, implementado a traves de AlignTune. La tarea objetivo es la extraccion condicionada por esquema JSON (structured output), por lo que la funcion de recompensa presumiblemente penaliza salidas que no validan contra el esquema. El autor referencia un adaptador SFT previo como fase de calentamiento, lo que configura un pipeline SFT seguido de GRPO. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, hiperparametros de LoRA (rango, alpha, modulos objetivo) ni detalles de la funcion de recompensa.

## Capacidades

- Extraccion de informacion estructurada: generacion de JSON que cumple un esquema predefinido, segun la especializacion declarada del adaptador.
- Structured output condicionado por esquema: el entrenamiento con GRPO sobre validacion de esquema apunta a mejorar la tasa de conformidad con el formato.
- Generacion de texto y razonamiento general: heredados del modelo base `tiny-aya-global` instruction-tuned.
- Capacidades multilingues: potencialmente heredadas del modelo base (70 idiomas), aunque el adaptador no declara idiomas soportados y su entrenamiento pudo estar sesgado a un subconjunto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo base es de texto.

## Casos de uso

- Extraccion de campos en facturas y albaranes: dado un esquema JSON con campos como importe, fecha, NIF y lineas de detalle, el adaptador se usaria para convertir texto OCR en JSON validado, reduciendo el post-procesado de reparacion de formato.
- Procesamiento de curriculums: extraccion de entidades (titulacion, empresa, fechas, tecnologias) desde texto libre a un esquema fijo, aprovechando la naturaleza pequena del modelo para desplegarlo en volumen alto con coste bajo.
- Enriquecimiento de tickets de soporte: clasificacion y extraccion de campos estructurados (categoria, producto, severidad, identificador de cliente) desde conversaciones multi-turno, con salida validable contra el esquema del sistema de ticketing.
- Pipelines de datos para RAG: conversion de documentos heterogeneos en registros JSON normalizados antes de indexarlos, donde la conformidad estricta con el esquema evita errores aguas abajo.
- Extraccion de entidades en multiples idiomas: al heredar la base multilingue de Tiny Aya Global, puede aplicarse a documentos en varios idiomas con un unico esquema, aunque requiere validacion empirica por idioma.
- Generacion de payloads para APIs: produccion de cuerpos JSON conformes a la especificacion de un endpoint interno a partir de instrucciones en lenguaje natural, como paso previo a la validacion con JSON Schema en servidor.
- Prototipado e investigacion de RL para structured output: sirve como referencia reproducible de un pipeline SFT + GRPO con AlignTune para experimentar con funciones de recompensa basadas en validacion de esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste marginal; el requisito lo determina el modelo base de 3,35B parametros. En fp16, aproximadamente 7 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 4 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para throughput alto en fp16; L40S o A10G para servicio en produccion con cuantizacion; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- GPU de consumo: si cabe en GPUs consumer con 8-12 GB de VRAM aplicando cuantizacion de 4 u 8 bits al modelo base y cargando el adaptador LoRA encima.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp u Ollama fusionando el adaptador en el modelo base y convirtiendo a GGUF; transformers + PEFT para uso directo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sujalgawas/tiny-aya-global-grpo-schema-model` | Adaptador sobre base de 3,35B | No disponible | Structured output / JSON schema | Apache 2.0 | Hugging Face, 0 descargas |
| `CohereLabs/tiny-aya-global` | 3,35B | No disponible en la informacion proporcionada | Multilingue general (70 idiomas) | No disponible en la informacion proporcionada | Hugging Face, modelo oficial |
| `sujalgawas/tiny-aya-global-sft-schema-adapter` | Adaptador sobre base de 3,35B | No disponible | Structured output (fase SFT) | No disponible en la informacion proporcionada | Hugging Face |

## Limitaciones y advertencias

- Ausencia total de validacion externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas.
- Model card minima: no documenta dataset de entrenamiento, hiperparametros de LoRA, funcion de recompensa ni proceso de evaluacion, lo que impide reproducir o auditar el entrenamiento.
- Riesgo de sobreajuste al esquema de entrenamiento: un adaptador GRPO orientado a validacion de esquema puede degradar el formato ante esquemas muy distintos de los vistos durante el entrenamiento.
- Riesgo de alucinacion: el modelo base es pequeno (3,35B) y la extraccion estructurada puede producir valores plausibles pero inexistentes en el texto fuente; se requiere validacion contra el documento original.
- Idiomas no declarados: aunque el modelo base cubre 70 idiomas, el adaptador no especifica que idiomas se usaron en el entrenamiento; el rendimiento multilingue es una hipotesis, no un dato.
- Contexto no documentado para el adaptador: ventanas de contexto largas pueden degradar la conformidad con el esquema; conviene trocear documentos.
- Licencia Apache 2.0 en el adaptador, pero debe verificarse la licencia del modelo base antes de uso comercial combinado.
- Uso en produccion no recomendado sin evaluacion propia: al ser un artefacto de autor individual sin mantenimiento documentado, conviene congelar la version y medir tasa de validacion de esquema sobre un conjunto propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sujalgawas/tiny-aya-global-grpo-schema-model
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de Tiny Aya: https://arxiv.org/html/2603.11510v1
- Adaptador SFT previo (referenciado en la model card): https://huggingface.co/sujalgawas/tiny-aya-global-sft-schema-adapter
- AlignTune (framework de entrenamiento): `Lexsi-Labs/aligntune`
