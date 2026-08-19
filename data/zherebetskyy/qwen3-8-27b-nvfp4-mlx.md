# zherebetskyy/Qwen3.8-27B-nvfp4-mlx

## Resumen

Qwen3.8-27B-nvfp4-mlx es una conversión a formato MLX del modelo multimodal Qwen3.8-27B, cuantizado con NVFP4 (4-bit floating point con normalización y escalado). Desarrollado por el usuario zherebetskyy, este modelo está diseñado para ejecutarse en dispositivos Apple Silicon mediante el framework MLX de Apple, ofreciendo un equilibrio entre calidad de generación y consumo de memoria. El modelo base, Qwen3.8-27B, es un sistema de visión-lenguaje de 27.780 millones de parámetros que acepta entradas de imagen y texto, y produce respuestas textuales.

La cuantización NVFP4 emplea un formato de punto flotante dinámico (E2M1/E3M0) que preserva mejor la precisión en comparación con cuantizaciones enteras tradicionales como INT4, especialmente en capas de proyección visual sensibles. El resultado es un modelo de aproximadamente 18,5 GB que requiere al menos 24 GB de memoria unificada, recomendándose 36 GB para contextos largos y procesamiento multimodal intensivo. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Este modelo resulta relevante para desarrolladores que necesitan ejecutar un asistente multimodal localmente en hardware Apple, con capacidades de descripción de imágenes, análisis visual y conversación, manteniendo una calidad cercana a la versión sin cuantizar pero con un footprint de memoria reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, arquitectura no especificada en la documentacion) |
| Parametros totales | 27.780.000.000 (segun model card) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors del repositorio contiene 7.186.713.840 parametros, pero este numero corresponde a los tensores cuantizados, no al total de parametros del modelo, que segun la model card es de 27.780 millones.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B. Se sabe que es un modelo multimodal de tipo imagen-texto a texto, con capacidad de procesar tanto imagenes como texto y generar respuestas textuales. La cuantizacion NVFP4 se aplico sobre los pesos del modelo base en formato BF16, utilizando la herramienta mlx-vlm version 0.6.13. No se proporcionan datos sobre el entrenamiento original, el dataset utilizado ni el proceso de alineacion (RLHF, DPO, etc.). La unica innovacion tecnica destacable en esta version es el uso del formato NVFP4, que emplea una representacion de punto flotante de 4 bits con mantisa y exponente, disenada para mantener un rango dinamico amplio y una mayor precision en valores pequenos en comparacion con cuantizaciones enteras.

## Capacidades

- Generacion de texto a partir de imagenes: puede describir el contenido de una imagen, analizar elementos visuales y responder preguntas sobre ellos.
- Conversacion multimodal: soporta dialogos de ida y vuelta donde el usuario puede adjuntar imagenes y hacer preguntas, manteniendo el contexto de la conversacion.
- Razonamiento visual: capaz de interpretar escenas complejas, identificar objetos, personas, acciones y relaciones espaciales.
- Integracion con frameworks de agentes: puede servir como backend de un servidor compatible con OpenAI API, permitiendo su uso en pipelines de agentes como Pi, OpenClaw o Hermes.
- Ejecucion local en Apple Silicon: optimizado para MLX, aprovecha la memoria unificada de los chips M1/M2/M3/M4.
- No se mencionan capacidades de tool calling, function calling ni modos de razonamiento especiales en la documentacion proporcionada.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones detalladas de fotografias o ilustraciones, utiles para personas con discapacidad visual o para sistemas de catalogacion automatica de contenido visual.
- Analisis de documentos escaneados: al recibir una imagen de un documento, puede extraer informacion relevante, resumir el contenido o responder preguntas especificas sobre el texto y las figuras presentes.
- Asistente conversacional multimodal en local: integrado en un servidor OpenAI-compatible, puede actuar como chatbot que acepta imagenes del usuario y mantiene conversaciones contextuales, ideal para aplicaciones de atencion al cliente o asistentes personales sin conexion a la nube.
- Generacion de informes a partir de imagenes medicas o tecnicas: aunque no se especifica precision medica, puede analizar imagenes de radiografias, diagramas o planos y producir descripciones textuales que ayuden a profesionales en tareas preliminares de documentacion.
- Moderacion de contenido visual: puede analizar imagenes para detectar contenido inapropiado o generar etiquetas descriptivas que faciliten la revision manual.
- Educacion y aprendizaje: utilizado como herramienta de estudio que explica graficos, mapas o fotografias historicas, proporcionando contexto adicional y respondiendo preguntas de los estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,5 GB para el modelo cuantizado, con un requisito minimo de 24 GB de memoria unificada para contextos cortos y 36 GB recomendados para contextos largos y procesamiento multimodal intensivo.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 en variantes Max o Ultra recomendadas). No es compatible con GPUs NVIDIA o AMD.
- Ejecucion en consumer GPU: no aplica, ya que requiere el framework MLX, que solo funciona en hardware Apple.
- Opciones de despliegue: mediante la libreria mlx-vlm para inferencia en Python, o mediante el servidor local mlx_lm.server que expone una API compatible con OpenAI. Tambien se puede usar desde la linea de comandos con el modulo mlx_vlm.generate.
- Latencia y throughput: no se proporcionan datos numericos en la documentacion.

## Comparativa con modelos similares

La propia model card ofrece una comparativa entre las variantes de cuantizacion del mismo modelo base:

| Variante | Cuantizacion | Tamano | VRAM objetivo | Calidad / Perplejidad | Uso recomendado |
|---|---|---|---|---|---|
| NVFP4 (este modelo) | NVFP4 | ~18,5 GB | ≥ 24 GB | 4/5 | Mejor equilibrio calidad/velocidad para inferencia local |
| Qwen3.8-27B-4bit-mlx | INT4 (Q4) | ~16,8 GB | ≥ 24 GB | 3/5 | Maxima eficiencia de memoria |
| Qwen3.8-27B-6bit-mlx | INT6 (Q6) | ~24,5 GB | ≥ 32 GB | 5/5 | Tareas de alta precision con VRAM extra |
| Qwen3.8-27B-mxfp8-mlx | MXFP8 | ~28,5 GB | ≥ 36 GB | 5/5 | Precision casi sin perdidas para razonamiento complejo, codigo y detalles visuales |

No se dispone de comparativas con otros modelos multimodales de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al ser un modelo derivado de Qwen3.8-27B, podria heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como todo modelo generativo, puede producir descripciones inexactas o inventar detalles al analizar imagenes ambiguas o de baja calidad.
- Limitaciones de contexto: no se especifica la longitud maxima de contexto, por lo que no se puede garantizar un rendimiento optimo en conversaciones muy largas o con multiples imagenes.
- Restricciones de hardware: el modelo solo funciona en Apple Silicon, lo que limita su despliegue en entornos de servidor tradicionales o en la nube con GPUs convencionales.
- La cuantizacion NVFP4, aunque superior a INT4, puede introducir una ligera degradacion en tareas de razonamiento complejo o en la fidelidad de detalles visuales finos en comparacion con versiones de mayor precision como Q6 o MXFP8.
- No se proporciona informacion sobre el rendimiento en tareas de generacion de codigo, matematicas o razonamiento logico, por lo que no se recomienda su uso en estos ambitos sin una evaluacion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zherebetskyy/Qwen3.8-27B-nvfp4-mlx
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en BF16 para MLX: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Variante Q4 (INT4): https://huggingface.co/zherebetskyy/Qwen3.8-27B-4bit-mlx
- Variante Q6 (INT6): https://huggingface.co/zherebetskyy/Qwen3.8-27B-6bit-mlx
- Variante MXFP8: https://huggingface.co/zherebetskyy/Qwen3.8-27B-mxfp8-mlx
- Framework MLX: https://github.com/ml-explore/mlx
- Herramienta mlx-vlm: https://github.com/ml-explore/mlx-examples/tree/main/mlx_vlm
