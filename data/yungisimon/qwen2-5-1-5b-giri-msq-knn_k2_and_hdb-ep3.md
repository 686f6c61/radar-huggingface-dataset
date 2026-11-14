# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep3

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep3` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model", es decir, un modelo especializado en responder preguntas de tipo QA sintético construidas a partir del conjunto de datos MuSiQue, un benchmark de razonamiento multi-salto (multi-hop) sobre documentos. El checkpoint publicado corresponde a la época 3 de 3 del entrenamiento.

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), con licencia Apache 2.0 y pesos en safetensors bf16 que se cargan directamente con la librería `transformers` mediante `AutoModelForCausalLM.from_pretrained`. El modelo conserva la plantilla de chat de Qwen2.5.

Su relevancia es acotada: se trata de un experimento de investigación sobre memoria y clustering (kNN con k=2, deduplicación de documentos y HDBSCAN con tamaño mínimo de clúster 2) aplicado a la generación de pares QA sintéticos, no de un modelo de propósito general. Con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin model card extendida más allá de la tabla de entrenamiento, debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó una longitud máxima de secuencia de 8096 tokens, y el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens (dato del modelo base, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; los pesos publicados son bf16 safetensors |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros entrenables, lo que supone el 100,00 % de los parámetros: se trata de un ajuste fino completo, no de LoRA ni de otro método parametrizado. El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, en precisión bf16, con gradient checkpointing y cálculo de la pérdida únicamente sobre los tokens del asistente. La configuración incluye batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPU), learning rate de 2e-05 constante con warmup de ratio 0,05, weight decay de 0,01, max grad norm de 1,0 y una longitud máxima de secuencia de 8096 tokens. El entrenamiento completo de 3 épocas tardó 1,63 horas de reloj (13,1 GPU-horas).

El dataset de entrenamiento es un fichero de QA sintético derivado de MuSiQue, generado con el método de clustering `knn_k2_and_hdb` (kNN con k=2, deduplicación de documentos y HDBSCAN con tamaño mínimo de clúster 2), identificado como `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_hdbscan_mcs2_crossdoc_entity_combination_v3.json` y compuesto por 1.590.428 ejemplos. No se documentan en la model card detalles sobre la composición lingüística del dataset, el uso de RLHF o DPO, ni innovaciones arquitectónicas propias: el checkpoint hereda la arquitectura estándar del modelo base.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen2.5.
- Respuesta a preguntas de tipo QA sintético sobre documentos, en el dominio de MuSiQue (razonamiento multi-salto sobre varios documentos).
- Recuperación y uso de información de contexto largo, hasta la longitud de secuencia empleada en entrenamiento (8096 tokens).
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct: generación de texto, razonamiento básico, matemáticas elementales y código, aunque no se han validado específicamente tras el ajuste fino.
- Soporte de tool calling y function calling: no confirmado para este checkpoint; el modelo base Qwen2.5-Instruct lo soporta, pero el ajuste fino sobre QA sintético puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el entrenamiento se orienta a QA multi-hop, no a flujos agénticos.
- Capacidades multilingües: no documentadas en la model card; dependen del modelo base.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre memoria en modelos pequeños: el checkpoint permite reproducir y comparar el efecto del clustering kNN + HDBSCAN en la generación de QA sintético frente a otros métodos de construcción de datasets, usando el mismo modelo base y la misma configuración de entrenamiento.
- Evaluación de razonamiento multi-hop: sirve para medir hasta qué punto un modelo de 1,5B ajustado sobre MuSiQue sintético mejora en preguntas que requieren combinar información de varios documentos, comparándolo con el Qwen2.5-1.5B-Instruct original.
- Prototipado de sistemas de QA documental: con 1,5B parámetros y pesos bf16 de unos 3,1 GB, se puede desplegar en una GPU de consumo para probar pipelines de recuperación + respuesta antes de escalar a modelos mayores.
- Generación de datos sintéticos de entrenamiento: el modelo puede emplearse para producir pares pregunta-respuesta adicionales en el mismo dominio, que luego se filtren y se usen para ajustar modelos mayores.
- Experimentos de destilación: al ser un modelo pequeño especializado, es un candidato para destilar el comportamiento de un modelo mayor en tareas de QA multi-documento.
- Docencia y reproducción de experimentos: la model card documenta hiperparámetros, hardware y tiempo de entrenamiento, lo que facilita replicar el pipeline en un entorno académico con recursos limitados (13,1 GPU-horas en MI325X).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para los pesos; en 4 bits, alrededor de 0,8 GB (estimaciones a partir del número de parámetros; no hay GGUF publicado en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; A100, H100 o MI325X para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB, con margen amplio.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo declarado); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y con los endpoints de Hugging Face. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep3 | 1.543.714.304 | 8096 en entrenamiento; contexto nativo del base no confirmado | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino especializado en QA sintético de MuSiQue |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B (aprox.) | 32.768 tokens (según model card del base) | apache-2.0 | Hugging Face, ampliamente utilizado | Modelo base; capacidades generales e instruct |
| Qwen/Qwen2.5-3B-Instruct | 3B (aprox.) | 32.768 tokens (según model card del base) | apache-2.0 | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B (aprox.) | 128.000 tokens (según model card del base) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |

No se dispone de datos de benchmarks para el modelo ajustado, por lo que la comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar el modelo base Qwen2.5, es previsible que arrastre sesgos de sus datos de preentrenamiento, pero no se han evaluado.
- Riesgo de alucinación: elevado en tareas fuera del dominio de MuSiQue, dado que el ajuste fino se ha realizado exclusivamente sobre QA sintético de ese corpus; el modelo puede generar respuestas plausibles pero incorrectas en otros contextos.
- Limitaciones de contexto e idioma: el entrenamiento usó secuencias de hasta 8096 tokens; no se documenta el comportamiento en contextos más largos ni la cobertura lingüística del dataset sintético.
- Degradación de capacidades generales: un ajuste fino completo sobre 1,59 millones de ejemplos de un dominio concreto puede degradar capacidades del modelo base como tool calling, código o matemáticas; no se han publicado evaluaciones que lo confirmen o descarten.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen2.5 y de los datos MuSiQue empleados para generar el dataset sintético.
- Madurez: 0 descargas y 0 likes, sin model card extendida ni benchmarks; no se recomienda su uso en producción sin una evaluación propia.
- Fecha de creación declarada en el repositorio (2026-11-14): conviene verificar la autenticidad y procedencia del artefacto antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del dominio de entrenamiento): no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio de código del método `knn_k2_and_hdb`: no disponible en la información proporcionada
- Demo: no disponible
