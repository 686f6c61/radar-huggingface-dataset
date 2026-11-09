# Zhangdanyang/qwen3-coder-micake-c144-planner

## Resumen

qwen3-coder-micake-c144-planner es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicado por el usuario Zhangdanyang en Hugging Face. Se trata de un adaptador LoRA fusionado sobre la arquitectura Qwen3-MoE, orientado a tareas de planificación (planner) en el contexto de generación de código y flujos agénticos. El modelo conserva los 30.532.122.624 parámetros totales del modelo base y su naturaleza de mezcla de expertos (MoE), con 3.000 millones de parámetros activos por token según la nomenclatura A3B del modelo original.

El interés de esta ficha radica en que documenta un derivado comunitario de uno de los modelos de código abiertos más relevantes de la familia Qwen3, especializado mediante LoRA en un rol concreto de planificación dentro de pipelines agénticos. Al estar etiquetado con `moe`, `lora`, `gemm` y `kernel`, el repositorio sugiere que el ajuste incorpora además optimizaciones de kernels para la inferencia del MoE. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

No se dispone de información publicada sobre el dataset de ajuste, los idiomas soportados, el contexto efectivo tras el fine-tune ni resultados de benchmarks específicos de esta variante. Todo lo que se detalla a continuación se apoya en los metadatos del repositorio y en las características conocidas del modelo base Qwen3-Coder-30B-A3B-Instruct, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), fine-tune LoRA fusionado sobre Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.000 millones (aprox., según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible (el modelo base soporta contexto nativo largo; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-MoE del modelo base Qwen3-Coder-30B-A3B-Instruct: un transformer con capas de mezcla de expertos en las que se activan aproximadamente 3.000 millones de parámetros por token sobre un total de 30.532 millones. Esta relación de activación permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño, manteniendo la capacidad de representación de un modelo grande. El repositorio incluye las etiquetas `lora`, `gemm` y `kernel`, lo que indica que el ajuste se realizó mediante LoRA y que probablemente se han fusionado los pesos del adaptador con los del modelo base, además de incorporar kernels optimizados para las operaciones GEMM del MoE.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o SFT específicas para la tarea de planificación. El nombre del repositorio (`micake-c144-planner`) sugiere un ajuste orientado a planificación, pero no hay documentación pública que detalle el proceso. Tampoco se confirma si el fine-tune preserva la ventana de contexto original del modelo base ni si se aplicaron técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3-Coder-30B-A3B-Instruct, conserva la capacidad de razonamiento general y de generación de texto del modelo base.
- Generación de código: el modelo base está especializado en código; este fine-tune mantiene esa base y la orienta a planificación de tareas.
- Planificación de tareas (planner): el nombre y el propósito del ajuste apuntan a la descomposición de objetivos en pasos, típica de flujos agénticos.
- Tool calling / function calling: el modelo base Qwen3-Coder soporta tool calling; no se confirma si el fine-tune lo preserva íntegramente.
- Razonamiento multi-paso y agentes: orientado por diseño a la planificación dentro de pipelines agénticos.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles para este fine-tune; el modelo base es solo texto.

## Casos de uso

- Planificación de tareas en agentes de código: el modelo puede recibir un objetivo de alto nivel y descomponerlo en pasos ejecutables que un agente orquestador traduce en llamadas a herramientas o ediciones de ficheros. Su orientación a planner lo hace adecuado como componente de planificación dentro de un sistema multi-agente.
- Orquestación de pipelines CI/CD asistida: integrado en un flujo de integración continua, puede generar planes de corrección o de refactorización a partir de errores de build, aprovechando su base de código y su capacidad de razonamiento.
- Asistentes de desarrollo en IDE: como planificador previo a la generación de parches, ayuda a estructurar cambios multi-fichero antes de que un modelo generador de código los materialice.
- Automatización de tareas de análisis de repositorios: puede planificar la exploración de un repositorio (qué ficheros leer, en qué orden, qué comprobaciones ejecutar) para responder preguntas sobre el código.
- Generación de planes de prueba: a partir de una descripción de funcionalidad, puede proponer una secuencia de casos de prueba y pasos de validación, apoyándose en su conocimiento de código.
- Despliegue en entornos con restricciones de VRAM: al ser un MoE con 3.000 millones de parámetros activos, puede servirse en GPUs de gama alta de consumo con cuantización, lo que facilita prototipos locales de agentes planificadores.
- Investigación sobre fine-tuning de MoE: sirve como referencia para estudiar cómo un ajuste LoRA sobre un MoE de código afecta a tareas de planificación, dado que el repositorio expone pesos fusionados y etiquetas de kernel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de precisión completa (bf16/fp16), el modelo requiere aproximadamente 61 GB de VRAM, coherente con el tamaño del repositorio (61,1 GB). Con cuantización a 8 bits se reduciría a unos 30-31 GB, y a 4 bits a unos 15-16 GB, aunque estas cifras son estimaciones basadas en el número de parámetros y no en mediciones publicadas.
- GPU recomendadas: para precisión completa, A100 80 GB, H100 80 GB o H200. Para cuantización 8 bits, A100 40 GB o RTX 6000 Ada. Para cuantización 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían alojar los pesos, aunque el contexto largo y el estado de activación del MoE pueden requerir margen adicional.
- ¿Cabe en GPU de consumo? Sí, en cuantización 4 bits en GPUs de 24 GB, con limitaciones de contexto y throughput no verificadas.
- Opciones de despliegue: al ser un modelo `transformers` con arquitectura `qwen3_moe`, es compatible con vLLM, TGI y transformers. La disponibilidad de soporte en llama.cpp/Ollama para esta arquitectura MoE concreta no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles. La activación de 3.000 millones de parámetros por token sugiere un throughput superior al de un modelo denso de 30B, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-coder-micake-c144-planner | 30.532 M | ~3.000 M | no disponible | apache-2.0 | gated en Hugging Face |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (base) | 30.532 M | ~3.000 M | contexto largo nativo (no confirmado aquí) | apache-2.0 | público |
| Qwen3-Coder-480B-A35B-Instruct | 480.000 M (aprox.) | 35.000 M (aprox.) | contexto largo nativo | apache-2.0 | público |
| Modelos densos de ~30B (p. ej. familia Qwen2.5-Coder-32B) | ~32.000 M | 32.000 M (denso) | variable | apache-2.0 en varias variantes | público |

La comparativa se limita a la familia Qwen porque no se dispone de datos de rendimiento del fine-tune que permitan contrastarlo con alternativas de otros proveedores. El principal diferenciador frente al modelo base es la especialización en planificación; frente a modelos densos de tamaño similar, la ventaja es el menor coste de inferencia por token activo.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Falta de documentación: no se publican datos de entrenamiento, idiomas, contexto efectivo ni evaluación, lo que dificulta validar su comportamiento en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir planes plausibles pero incorrectos; en flujos agénticos esto puede propagarse a acciones erróneas.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, desconocido.
- Licencia: apache-2.0 permite uso comercial, pero el acceso gated y la ausencia de garantías del autor deben tenerse en cuenta; conviene revisar los términos del modelo base.
- Contexto e idioma: no confirmados para este fine-tune; el rendimiento en castellano no está verificado.
- Producción: al ser un derivado comunitario con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia de uso en producción ni de estabilidad del ajuste.
- Compatibilidad de despliegue: la arquitectura MoE con kernels personalizados puede requerir versiones específicas de las librerías; verificar compatibilidad con vLLM/TGI antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhangdanyang/qwen3-coder-micake-c144-planner
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio de Qwen3-Coder (GitHub): no disponible en la información proporcionada
- Paper de Qwen3: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
