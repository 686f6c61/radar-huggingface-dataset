# timm/qwen3_vit_306m.qwen3_vl_4b

## Resumen

`timm/qwen3_vit_306m.qwen3_vl_4b` es un encoder de características de imagen de 305,5 millones de parámetros extraído del modelo multimodal Qwen3-VL-4B-Instruct y publicado por el proyecto timm (PyTorch Image Models) de Hugging Face, mantenido por Ross Wightman. No es un modelo de lenguaje ni un modelo de visión-lenguaje completo: es únicamente el backbone visual de Qwen3-VL, reempaquetado en formato nativo de timm, con pooling promedio y LayerNorm sin afinidad sobre las características del encoder. El autor indica explícitamente que no contiene pesos de lenguaje ni cabecera de clasificación entrenada, y que no se ha realizado entrenamiento adicional alguno sobre los pesos originales.

El modelo resuelve el problema de extraer representaciones visuales reutilizables: devuelve embeddings de imagen de 1024 dimensiones listos para clasificación, y también mapas de características intermedios mediante `forward_intermediates()`. Está pensado para flujos de trabajo de *transfer learning*, recuperación de imágenes y pipelines de visión que necesitan un backbone preentrenado a gran escala sin arrastrar los pesos multimodales de 4B del modelo original.

Su relevancia es práctica: aprovecha el encoder visual entrenado como parte de Qwen3-VL (descrito en el informe técnico arXiv:2511.21631) y lo reduce a un checkpoint de 1,2 GB con licencia Apache 2.0, integrable con una sola línea de código mediante `timm.create_model`. Se trata de un artefacto derivado, sin descargas ni validación comunitaria en el momento de redactar esta ficha, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de Qwen3-VL; backbone de ancho 1024, MLP con activación GELU-tanh, posiciones absolutas aprendidas e interpoladas y RoPE 2D axial |
| Parametros totales | 305.456.128 (305,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (encoder de imagen). Resolución nativa de 768 x 768; admite entradas rectangulares si cada dimensión es divisible por 16 (por 32 si se usa el merger 2x2) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser un encoder pequeño, fp32/fp16 son los formatos habituales) |
| Idiomas soportados | No disponible (no procesa texto ni genera lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nativo de timm, 1,2 GB) |
| Tipo de modelo | Image Feature Encoder |
| Ancho del backbone | 1024 |
| GMACs | 959,1 |
| Activaciones | 2607,0 M |
| Tamaño de imagen | 768 x 768 |
| Normalización de entrada | mean = (0.5, 0.5, 0.5), std = (0.5, 0.5, 0.5) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revisión ebb281ec70b05090aa6165b016eac8ec08e71b17) |
| Librería | timm |
| Pipeline | image-feature-extraction |

## Arquitectura y entrenamiento

El checkpoint es un *remap* nativo a timm de los pesos de visión originales de Qwen3-VL-4B-Instruct, sin entrenamiento adicional. La adaptación incluye varios cambios estructurales relevantes: las entradas de imagen repiten un único fotograma a lo largo del kernel temporal original, de modo que los pesos del Conv3d temporal se suman en un Conv2d para esta implementación exclusivamente de imagen. El backbone emplea MLP con activación GELU-tanh, posiciones absolutas aprendidas que se interpolan según la rejilla de entrada, y RoPE 2D axial que se regenera para cada tamaño. Los proyectores DeepStack de Qwen3-VL se omiten por completo.

El wrapper incluye pooling promedio y LayerNorm sin afinidad sobre las características del encoder, lo que lo hace listo para añadir una cabecera de clasificación. `forward_features()` devuelve características NHWC sin normalizar — por ejemplo `(1, 48, 48, 1024)` para una entrada de 768 x 768 —, mientras que la variante de clasificación devuelve embeddings de imagen agrupados de 1024 dimensiones hasta que se añade una cabecera. El modelo no fue entrenado por el autor de la ficha: hereda los datos y el proceso de entrenamiento de Qwen3-VL, descritos en el informe técnico arXiv:2511.21631, que no se detalla en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible).

## Capacidades

- Extracción de características de imagen: genera embeddings globales de 1024 dimensiones mediante pooling promedio sobre el backbone.
- Mapas de características intermedios: `forward_intermediates()` y `features_only=True` permiten obtener representaciones multinivel, útiles para detección o segmentación.
- Clasificación mediante fine-tuning: admite `num_classes=N` para crear una cabecera lineal aleatoria que debe entrenarse sobre el dataset objetivo.
- Soporte de entradas rectangulares, con la restricción de divisibilidad por 16 (o por 32 con el merger 2x2).
- Compatibilidad con el ecosistema timm: creación del modelo vía `hf-hub:timm/qwen3_vit_306m.qwen3_vl_4b`, resolución automática de la configuración de datos y transformaciones estándar de timm.
- Tool calling / function calling: no aplica (no es un modelo generativo ni un LLM).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (sin componente de lenguaje).
- Capacidades especiales (modo *thinking*, visión, audio): únicamente visión como encoder de características; no hay generación de texto, ni procesamiento de vídeo (el kernel temporal se colapsa en 2D), ni audio.

## Casos de uso

- Búsqueda inversa y recuperación de imágenes: los embeddings de 1024 dimensiones permiten indexar un catálogo visual y recuperar por similitud coseno, con la ventaja de que el encoder proviene de un entrenamiento multimodal a gran escala.
- Deduplicación y curación de datasets: extraer características de un corpus de imágenes para agrupar, detectar duplicados casi idénticos o seleccionar subconjuntos diversos antes de entrenar otro modelo.
- Clasificación de imágenes por *linear probing*: congelar el backbone y entrenar una única capa lineal sobre las características agrupadas, un procedimiento habitual cuando se dispone de pocas etiquetas.
- Detección y segmentación: usar los mapas de características intermedios de `forward_intermediates()` como *backbone* para cabeceras tipo FPN en tareas densas.
- Moderación de contenido visual: clasificador binario o multiclase sobre las características del encoder para filtrar imágenes inapropiadas en plataformas de contenido generado por usuarios.
- Inspección visual industrial: control de calidad en línea de producción, con un clasificador ajustado sobre las características para detectar defectos, siempre que la latencia del encoder a 768 x 768 sea admisible.
- Recomendación visual: construir un espacio de embeddings de producto para similitud artículo a artículo en comercio electrónico.
- Preprocesado para pipelines de visión-lenguaje: aunque los proyectores DeepStack se han omitido y este checkpoint no puede alimentar directamente a Qwen3-VL, las características intermedias sirven como entrada a proyectores propios en arquitecturas multimodales personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de *linear probing* (ImageNet top-1, por ejemplo), ni resultados de recuperación de imágenes, ni comparaciones con otros encoders. El informe técnico de Qwen3-VL (arXiv:2511.21631) describe el modelo completo, no este checkpoint derivado.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros y de las métricas publicadas por el autor; no son mediciones oficiales.

- Pesos en fp32: aproximadamente 1,2 GB, coherente con el tamaño del repositorio (1,2 GB).
- Pesos en fp16/bf16: aproximadamente 0,61 GB.
- Pesos en int8: aproximadamente 0,31 GB.
- Memoria de activaciones: el autor reporta 2607,0 M de activaciones para una imagen de 768 x 768; en fp32 esto ronda los 10,4 GB y en fp16 unos 5,2 GB para un lote, aunque el consumo real depende del tamaño de lote y de la implementación.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar inferencia en fp16 sin problemas. En GPU con 8 GB puede ser necesario reducir el tamaño de lote.
- GPU profesionales: A100, H100, L40S o similares, útiles para procesar lotes grandes o para extracción masiva de características.
- Despliegue: timm sobre PyTorch es la vía oficial (`timm.create_model`). Exportación a ONNX o TorchScript es viable al ser un modelo puramente convolucional/transformer sin dependencias exóticas. No hay soporte de llama.cpp, Ollama ni GGUF, formatos que no aplican a un encoder de imagen.
- vLLM o TGI no aplican: no hay decodificación autoregresiva.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La model card no incluye métricas frente a otros encoders de la misma categoría, por lo que cualquier cifra sería inventada. A modo orientativo, las alternativas que un evaluador consideraría dentro del ecosistema timm serían encoders como SigLIP, DINOv2 o CLIP ViT-L/14, pero sus parámetros, contexto, licencia concreta y rendimiento no se detallan en la documentación disponible.

| Modelo | Parametros | Resolucion | Licencia | Datos en la informacion disponible |
|---|---|---|---|---|
| timm/qwen3_vit_306m.qwen3_vl_4b | 305,5 M | 768 x 768 | Apache 2.0 | Completos (ver tabla de especificaciones) |
| Alternativas comparables de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No incluye pesos de lenguaje: es exclusivamente un encoder de imagen; no genera texto ni responde a instrucciones.
- No incluye cabecera de clasificación entrenada: la cabecera que se añada con `num_classes` se inicializa de forma aleatoria y requiere entrenamiento sobre datos propios.
- Los proyectores DeepStack de Qwen3-VL se omiten, por lo que este checkpoint no puede sustituir al encoder original dentro del pipeline multimodal de Qwen3-VL.
- No soporta vídeo de forma nativa: el kernel temporal Conv3d se ha colapsado en Conv2d asumiendo un único fotograma repetido.
- Restricciones de entrada: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se emplea la variante con merger 2x2.
- Normalización fija: los transformes de timm aplican mean y std de 0.5; usar otra normalización degradará las características.
- Riesgo de alucinación: no aplica en sentido generativo, pero las características pueden producir predicciones erróneas con alta confianza si la cabecera se entrena con datos sesgados o poco representativos.
- Sesgos heredados: el encoder procede de Qwen3-VL, entrenado con datos cuya composición no se detalla; los sesgos de representación de ese corpus se transfieren al *backbone*.
- Licencia: Apache 2.0, permisiva para uso comercial. El autor enlaza la licencia de origen del repositorio Qwen3-VL como referencia, por lo que conviene verificar la cadena de licencias antes de un despliegue en producción.
- Madurez: el checkpoint acumula cero descargas y cero *likes* en el momento de redactar esta ficha, y no se ha publicado validación independiente de su calidad como extractor de características.
- Reproducibilidad: al ser un *remap* sin reentrenamiento, cualquier divergencia respecto al encoder original de Qwen3-VL no está documentada con métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_306m.qwen3_vl_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revisión concreta del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17
- Informe técnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm: https://huggingface.co/docs/timm/index
- Documentación alternativa de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Licencia de origen de Qwen3-VL: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
