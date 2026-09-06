# youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-569-correct-minimal

## Resumen

El modelo `youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-569-correct-minimal` es un fine-tuning experimental del modelo coreano `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, desarrollado por el usuario youngseok12. Se trata de un merge de un adaptador LoRA sobre la revisión base `9b74e35d4c7e4ffec489f4171273caca8948a2b9`, con el objetivo de estabilizar el formato de respuesta en tareas de comprensión lectora de documentos administrativos coreanos, concretamente en preguntas de opción múltiple.

El entrenamiento se realizó con el dataset AI Hub 569 (máquina de lectura de documentos administrativos, formato `VL_multiple_choice`). De un pool estratificado de 1000 muestras, el autor seleccionó solo 778 ejemplos que el modelo base ya resolvía correctamente, excluyendo 31 muestras incorrectas y 191 inciertas. El objetivo era que el modelo emitiese únicamente la letra de la opción correcta (`A`, `B`, `C` o `D`), evitando respuestas ambiguas o en formato libre.

El modelo tiene 14.748.112.896 parámetros (14,7 mil millones) y se distribuye como un único archivo `safetensors` en BF16, sin adaptadores ni código personalizado, lo que permite cargarlo directamente con Transformers. Se trata de un modelo de investigación y evaluación, sin benchmarks publicados en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo denso, basado en HyperCLOVA X SEED Think-14B) |
| Parametros totales | 14.748.112.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos BF16 en safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | NAVER HyperCLOVA X SEED 14B Think Model License Agreement (etiqueta "other" en Hugging Face) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un merge de un adaptador LoRA sobre el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B` en su revisión `9b74e35d4c7e4ffec489f4171273caca8948a2b9`. El adaptador fue entrenado con un subconjunto filtrado del dataset AI Hub 569, orientado a la lectura comprensiva de documentos administrativos y a la selección de una opción correcta entre varias. De un pool estratificado de 1000 muestras, se seleccionaron 778 ejemplos que el modelo base acertaba previamente, excluyendo 31 muestras incorrectas y 191 inciertas. El target de entrenamiento era exclusivamente la letra de la opción correcta, con el fin de estabilizar el formato de salida.

La configuración del entrenamiento incluye LoRA con `r=4`, `alpha=8`, `dropout=0`, `bias=none`, aplicado a los módulos `q_proj` y `v_proj`. Se usó una tasa de aprendizaje de `1e-6` con scheduler constante, sin warmup y sin weight decay. El entrenamiento duró 1 época, con 49 pasos de optimizador, batch efectivo de 16 (batch por dispositivo 1, acumulación de gradientes 16), en BF16, con longitud máxima de secuencia de 1024 tokens, empaquetado desactivado, pérdida solo en el asistente y gradient checkpointing activado. La pérdida final de entrenamiento fue de 3,2936 y el tiempo total de ejecución fue de 438,65 segundos. No se utilizaron datos de benchmarks públicos ni otros conjuntos de AI Hub.

## Capacidades

- Generación de texto en coreano: hereda las capacidades del modelo base HyperCLOVA X SEED Think-14B, orientado a lenguaje coreano.
- Comprensión lectora de documentos administrativos: fine-tuned para responder preguntas de opción múltiple sobre textos administrativos coreanos.
- Salida de opción única: entrenado para emitir exclusivamente `A`, `B`, `C` o `D` en tareas de selección de respuesta, lo que reduce la variabilidad de formato.
- No soporta tool calling ni function calling: no se menciona en la información disponible.
- No soporta agentes ni razonamiento multi-paso: no hay datos que confirmen esta capacidad.
- No soporta visión: el dataset es de texto (machine reading comprehension), no hay entradas multimodales.
- Idiomas: solo coreano, no se ha entrenado para otros idiomas.

## Casos de uso

- Asistencia en la revisión de expedientes administrativos: el modelo puede seleccionar la opción correcta en preguntas de opción múltiple sobre documentos coreanos, útil como apoyo en la validación de respuestas en sistemas de gestión documental.
- Evaluación de modelos coreanos en comprensión lectora: sirve como referencia en experimentos de MRC, especialmente para analizar el efecto de filtrar datos de entrenamiento según el rendimiento previo del modelo base.
- Investigación en fine-tuning selectivo: permite estudiar cómo el uso exclusivo de muestras que el modelo base ya resuelve correctamente influye en la estabilidad del formato de salida y en la pérdida de entrenamiento.
- Prototipos de sistemas de QA sobre normativa: puede integrarse en pipelines que validan la opción correcta en preguntas sobre regulaciones o documentos públicos coreanos, siempre que se use como apoyo y no como única fuente.
- Automatización de formularios y cuestionarios: el modelo puede clasificar la opción elegida en formularios administrativos con formato de opción múltiple, reduciendo la necesidad de post-procesamiento.
- Análisis de estabilidad de formato en LLM: sirve como caso de estudio para comparar la consistencia de respuestas de opción única frente a modelos sin fine-tuning específico, en tareas de comprensión lectora.
- Educación o demostración de LoRA merge: ejemplo práctico de cómo fusionar un adaptador LoRA con un modelo base y publicar un modelo standalone en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se midieron benchmarks en esta versión del modelo.

## Requisitos de hardware

- VRAM estimada: para inferencia en BF16 se necesitan aproximadamente 29,5 GB solo para los pesos (según el tamaño del repositorio), más memoria para la caché KV y activaciones, lo que supera los 30 GB de VRAM.
- GPU recomendadas: NVIDIA A100 40 GB o 80 GB, H100 80 GB. También es posible usar configuraciones con offloading a CPU en GPUs de menor capacidad.
- Consumer GPU: una RTX 4090 de 24 GB no puede cargar el modelo completo en BF16 sin offloading. Sería necesaria una cuantización de 4 bits (no proporcionada en el repositorio) o usar la CPU como memoria adicional, con una penalización significativa de latencia.
- Opciones de despliegue: se puede cargar con Transformers usando `device_map="auto"`. Para servir en producción, se recomienda vLLM o TGI, aunque no hay configuraciones oficiales publicadas. FriendliAI lista modelos similares del mismo autor, lo que sugiere compatibilidad con plataformas de despliegue de baja latencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyperCLOVA-X-SEED-Think-14B (base) | 14.7B | No disponible | NAVER HyperCLOVA X SEED 14B Think | Hugging Face |
| HyperCLOVA-X-SEED-Think-14B-sft-569-correct-minimal | 14.7B | No disponible | NAVER HyperCLOVA X SEED 14B Think | Hugging Face |
| HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875 | 14.7B | No disponible | NAVER HyperCLOVA X SEED 14B Think | Hugging Face |

Los tres modelos comparten arquitectura y tamaño. La diferencia principal radica en el conjunto de datos de fine-tuning: el modelo analizado se entrenó con 778 muestras de AI Hub 569 (solo respuestas correctas), mientras que el modelo hermano `minimal-sft-71875` utiliza otro subconjunto distinto. No se dispone de resultados de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor lo describe como un experimento independiente, no apto para producción sin una evaluación exhaustiva.
- Entrenamiento con un conjunto de datos muy reducido (778 muestras), lo que limita la generalización a dominios distintos de los documentos administrativos coreanos.
- Sin benchmarks publicados: no es posible comparar su rendimiento con otros modelos de forma objetiva.
- Salida restringida a una letra (`A`, `B`, `C` o `D`), por lo que no es adecuado para tareas de generación abierta o respuestas largas.
- Solo idioma coreano: no se ha entrenado para otros idiomas.
- Licencia restrictiva: se rige por la licencia de NAVER HyperCLOVA X SEED 14B Think Model License Agreement, que incluye condiciones de uso y atribución. Debe revisarse el `LICENSE` completo antes de cualquier uso.
- Riesgo de sesgos y alucinaciones heredados del modelo base, potencialmente agravado por el pequeño tamaño del dataset de fine-tuning.
- No utilizar como única fuente de decisiones médicas, legales o administrativas, tal como advierte el autor.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-569-correct-minimal
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Dataset AI Hub 569: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=569
- Modelo hermano (minimal-sft-71875): https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
- FriendliAI (modelo hermano): https://friendli.ai/models/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
