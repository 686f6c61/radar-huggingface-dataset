# XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-code

## Resumen

DN-MOPD-Qwen3.5-2B-teacher-code es un ajuste fino de Qwen/Qwen3.5-2B desarrollado por Xin Li (usuario XINLI1997) y colaboradores como parte del artículo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (arXiv:2609.35347). No es un modelo de propósito general, sino el "experto en código" que actúa como profesor congelado dentro de un esquema de destilación on-policy con múltiples profesores del mismo tamaño (matemáticas, código e instrucciones). Los estudiantes son modelos Qwen3.5-2B que aprenden de estos tres especialistas.

El modelo parte del checkpoint base Qwen3.5-2B (2.213.241.664 parámetros, aproximadamente 2,2 mil millones) y se entrena con GRPO sobre indicaciones de código con una recompensa verificable, durante 400 actualizaciones y con semilla 42. Se publica en bfloat16, en formato Hugging Face (`Qwen3_5ForConditionalGeneration`), bajo licencia Apache-2.0, y está etiquetado con el pipeline `image-text-to-text` porque conserva el codificador visual del modelo base, aunque ni el entrenamiento ni la evaluación utilizaron entradas multimodales.

Su relevancia es fundamentalmente metodológica y de investigación: sirve para reproducir los experimentos del artículo, para destilar modelos pequeños de 2B en tareas de código y como punto de comparación frente a recetas de RL y destilación clásicas. Según la tabla 2 del artículo, este profesor de código alcanza un 21,6 % en código y un 28,9 % en total, frente al 11,3 % y 24,0 % del estudiante inicial (el Qwen3.5-2B sin ajustar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen3.5 con codificador visual (clase `Qwen3_5ForConditionalGeneration`); los tensores de predicción multi-token (`mtp.*`) se omiten en la exportación |
| Parametros totales | 2.213.241.664 (aproximadamente 2,2 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens (valor de `max_model_len` usado por los autores en el ejemplo de vLLM; no se declara explícitamente en la model card) |
| Tipos de cuantizacion | No disponible: el checkpoint se publica únicamente en bfloat16; no se ofrecen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | Safetensors en bfloat16, formato Hugging Face; exportado desde un checkpoint de entrenamiento FSDP |
| Modelo base | Qwen/Qwen3.5-2B |
| Rol en el articulo | Profesor congelado experto en código dentro del esquema DN-MOPD |
| Precision de entrenamiento | bfloat16 |
| Formato de chat | No-thinking (`enable_thinking=False`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B: un transformer decoder denso de unos 2,2 mil millones de parámetros, con plantilla de chat propia y un codificador visual heredado. La model card aclara que la exportación omite los 15 tensores de predicción multi-token (`mtp.*`) del modelo base; el resto de tensores conservan nombres y formas originales. Esto implica que la decodificación especulativa basada en MTP no está disponible con este checkpoint, aunque la decodificación ordinaria no se ve afectada (las evaluaciones del artículo usaron exactamente estos ficheros). Los ficheros `config.json`, el tokenizador y `chat_template.jinja` son los del modelo base, sin cambios.

El entrenamiento consistió en GRPO sobre indicaciones de código con una recompensa verificable, sin término KL ni término de entropía. El lote por rollout fue de 128 indicaciones con 8 respuestas cada una, lo que da 256 respuestas por paso de optimizador, con muestreo dinámico que descarta grupos de indicaciones sin variación en la recompensa (como máximo 8 lotes de generación por rollout). Las longitudes máximas fueron de 2.048 tokens de indicación y 8.192 tokens de respuesta, con temperatura 1.0. Se usó el optimizador Adam con tasa de aprendizaje 1e-6 constante tras 10 actualizaciones de calentamiento, betas (0.9, 0.98), decaimiento de pesos 0.1 y recorte de gradiente 1.0. El entrenamiento se limitó a 400 actualizaciones con semilla 42.

## Capacidades

- Generación de texto y de código en inglés, con especialización clara en tareas de programación.
- Razonamiento matemático y de instrucciones como capacidades secundarias: en la tabla del artículo obtiene 20,7 en matemáticas (AIME25/AIME26) y 44,4 en seguimiento de instrucciones (IFEval/IFBench).
- Resolución de problemas de código evaluables: 21,6 % de media en LiveCodeBench v5/v6 (167 y 175 problemas disjuntos, avg@6).
- Formato de respuesta orientado a verificación, con uso de marcadores como `\boxed{}` en las indicaciones de ejemplo.
- Modo de chat no-thinking exclusivamente: hay que pasar `enable_thinking=False` a la plantilla de chat; el modo thinking no fue entrenado ni evaluado.
- Soporte de tool calling o function calling: no disponible; no se menciona ni se evalúa en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se declara y se evalúa inglés.
- Capacidades de visión: el codificador visual se conserva del modelo base y el pipeline es `image-text-to-text`, pero el entrenamiento y la evaluación fueron solo de texto, por lo que el comportamiento multimodal no está validado.
- Decodificación especulativa MTP: no disponible en este checkpoint al haberse omitido los tensores `mtp.*`.

## Casos de uso

- Destilación on-policy de estudiantes de 2B: es el uso para el que se entrenó el modelo. Se emplea como profesor congelado que genera respuestas sobre indicaciones de código, a partir de las cuales un estudiante Qwen3.5-2B aprende mediante destilación con normalización por dominio.
- Reproducción de experimentos académicos: permite rehacer la fila correspondiente al experto de código de la tabla 2 del artículo con semilla 42, temperatura 1.0, top-p 1.0 y un límite de 16.384 tokens de generación, usando vLLM 0.18.0.
- Generación de código en pipelines de evaluación automatizada: al estar entrenado con recompensa verificable sobre indicaciones de código, encaja en bancos de pruebas tipo LiveCodeBench donde la corrección se comprueba ejecutando tests.
- Asistencia a la programación en local: con 2,2 mil millones de parámetros y pesos en bfloat16 (unos 4,4 GB), se puede servir en una GPU de consumo para autocompletar funciones, escribir pruebas unitarias o traducir fragmentos entre lenguajes.
- Generación de pruebas unitarias y casos límite: el modelo puede producir código de test para funciones existentes, con la ventaja de que el resultado es verificable de forma automática.
- Comparación de recetas de RL: sirve como referencia de lo que consigue GRPO con recompensa verificable en un modelo de 2B, frente a alternativas como SFT, DPO u otras variantes de GRPO con término KL.
- Estudios de ablación sobre destilación multi-profesor: al existir otros dos expertos del mismo tamaño (matemáticas e instrucciones) en el mismo proyecto, permite aislar la contribución del dominio de código.
- Evaluación de infraestructura de inferencia: útil para medir rendimiento de vLLM o de `transformers>=5` con modelos pequeños de contexto largo, aunque no se publican cifras de latencia o throughput.

## Benchmarks y rendimiento

Datos de la tabla 2 del artículo (porcentajes; semilla de entrenamiento 42, plantilla no-thinking, temperatura 1.0, top-p 1.0, semilla de generación 42, límite de 16.384 tokens). AIME25/AIME26 con avg@64; LiveCodeBench v5/v6 con avg@6 (167 y 175 problemas disjuntos); IFEval/IFBench con precisión estricta de indicación y avg@16. La columna Total es la media de las seis tareas.

| Modelo | Matematicas | Codigo | IF | Total |
|---|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-2B-teacher-code (experto en codigo) | 20.7 | 21.6 | 44.4 | 28.9 |
| Estudiante inicial (Qwen3.5-2B) | 17.6 | 11.3 | 43.3 | 24.0 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) para este modelo, ni cifras comparativas con modelos de otros autores.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 4,4 GB, coherente con el tamaño del repositorio (4,4 GB) y con los 2,21 mil millones de parámetros.
- VRAM estimada para inferencia: en bfloat16, alrededor de 4,4 GB solo para pesos, más caché KV y activaciones; con contexto largo (32.768 tokens) conviene reservar entre 8 y 12 GB. Las estimaciones para cuantización (aproximadamente 2,2 GB en 8 bits y 1,3 GB en 4 bits) son orientativas, ya que no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para servir varias peticiones concurrentes con contexto largo; suficiente con RTX 4080 (16 GB) o RTX 3060 (12 GB) para uso individual.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más si se usa bfloat16 o float16 con contexto moderado, y en GPUs de 6-8 GB recurriendo a cuantización propia.
- Opciones de despliegue: vLLM 0.18.0 es la versión usada por los autores (`max_model_len=32768`); `transformers>=5` (el entorno del artículo usó 5.12.1) con `AutoModelForImageTextToText`; TGI, llama.cpp u Ollama requerirían una conversión a GGUF que no se proporciona oficialmente.
- Latencia y throughput estimados: no disponibles; el autor no publica cifras de rendimiento de servicio.
- Nota de memoria: el codificador visual se conserva en el checkpoint aunque no se validara su uso, por lo que consume algo de memoria adicional si se carga el modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (LiveCodeBench v5/v6) | Total (6 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-2B-teacher-code | 2,21 mil millones | 32.768 tokens (segun ejemplo de vLLM) | 21,6 | 28,9 | Apache-2.0 | Hugging Face, 10 descargas |
| Qwen3.5-2B (estudiante inicial, modelo base) | 2,21 mil millones | No disponible | 11,3 | 24,0 | Apache-2.0 | Hugging Face |
| Otros profesores del mismo articulo (matematicas, IF) | 2,21 mil millones (mismo tamano) | No disponible | No disponible | No disponible | Apache-2.0 | Referenciados en el articulo, no detallados en la informacion proporcionada |
| Modelos de codigo de terceros de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación se limita al modelo base y a los otros expertos citados en el artículo; la información proporcionada no incluye resultados de benchmarks de alternativas externas de tamaño comparable.

## Limitaciones y advertencias

- Es un especialista de dominio único: sus ganancias se concentran en código, y el resto de dominios se comportan como el modelo base o ligeramente mejor.
- Entrenamiento con respuestas de como máximo 8.192 tokens y evaluación únicamente en modo no-thinking. El modo thinking no fue entrenado ni evaluado.
- Idiomas: solo se declara y evalúa inglés; el rendimiento en castellano u otros idiomas no está medido y probablemente herede el del modelo base.
- Multimodalidad no validada: aunque el pipeline sea `image-text-to-text` y se conserve el codificador visual, no se entrenó ni evaluó con entradas de imagen.
- Comportamiento de seguridad no evaluado más allá de lo que herede del modelo base; no hay análisis de sesgos en la información disponible.
- Riesgo de alucinación: no se documenta ninguna mitigación específica ni evaluación de veracidad, más allá del uso de recompensas verificables durante el entrenamiento de código.
- Decodificación especulativa MTP no disponible: los 15 tensores `mtp.*` fueron omitidos en la exportación, lo que impide esa técnica de aceleración con este checkpoint.
- Licencia Apache-2.0, que permite uso comercial, pero se hereda del modelo base; conviene revisar las condiciones del proyecto Qwen para derivados.
- Es un artefacto de investigación con 10 descargas y 0 likes en el momento de la consulta (creado el 1 de octubre de 2026): no hay evidencia de uso en producción ni mantenimiento continuado.
- Si se despliega en producción, hay que fijar `enable_thinking=False` en la plantilla de chat; usar el modo thinking produciría un comportamiento no validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-code
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Articulo: *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation*, https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD
- Codigo y recetas: https://github.com/LiXin97/DN-MOPD
- Recetas para Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a foros de soporte de un operador de telefonia y no guardan relacion con el contenido de esta ficha.
