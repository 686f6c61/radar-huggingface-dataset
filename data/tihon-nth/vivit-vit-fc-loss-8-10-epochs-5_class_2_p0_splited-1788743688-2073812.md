# tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_2_p0_splited-1788743688.2073812

## Resumen

El modelo `tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_2_p0_splited-1788743688.2073812` es un fine-tuning de `google/vivit-b-16x2-kinetics400` para clasificación de vídeo. Desarrollado por el usuario `tihon-nth`, se basa en la arquitectura ViViT (Video Vision Transformer) y está entrenado sobre un dataset no documentado que, según el nombre del repositorio, contiene 5 clases. Con 88.650.245 parámetros y un tamaño de repositorio de 3,9 GB, es un modelo compacto que puede ejecutarse en GPUs de consumo. La licencia MIT facilita su uso en proyectos comerciales, aunque se debe verificar la licencia del modelo base. Este modelo es relevante para tareas de clasificación de acciones en vídeo, donde los transformers espacio-temporales capturan relaciones a lo largo del tiempo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video Vision Transformer (ViViT) con factorización espacio-temporal (variante B-16x2) |
| Parametros totales | 88.650.245 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vídeo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vídeo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/vivit-b-16x2-kinetics400`, un transformer de visión para vídeo que procesa secuencias de frames dividiéndolas en parches espacio-temporales. La variante `b-16x2` utiliza parches de 16x16 píxeles y 2 frames, con atención factorizada entre el espacio y el tiempo. El fine-tuning se realizó con los siguientes hiperparámetros: learning rate 5e-05, batch size 8, seed 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 16.220 pasos de entrenamiento. No se utilizó RLHF ni DPO. La tabla de entrenamiento muestra que la loss de entrenamiento desciende hasta 0.0422 en la última época, mientras que la loss de validación sube desde 0.2517 hasta 0.3871, lo que indica un posible sobreajuste.

## Capacidades

- Clasificación de acciones en vídeo: el modelo asigna una etiqueta de clase a una secuencia de frames, basándose en el dataset de fine-tuning (5 clases).
- Procesamiento de vídeo: acepta secuencias de vídeo como entrada y devuelve probabilidades de clase.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingüe; su salida es una etiqueta de clase, no texto en ningún idioma.
- Capacidades especiales: no dispone de modo de pensamiento, visión de imágenes estáticas ni audio.

## Casos de uso

- Monitorización de seguridad: el modelo puede clasificar acciones en vídeo de cámaras de vigilancia, como las 5 clases del dataset de fine-tuning, para alertar a operadores en tiempo real. Su tamaño compacto permite ejecutarlo en GPUs de consumo.
- Análisis deportivo: clasificar acciones deportivas en vídeos de partidos para generar estadísticas automáticas. El modelo puede integrarse en un pipeline de procesamiento de vídeo que extrae clips y los clasifica.
- Moderación de contenido de vídeo: clasificar contenido inapropiado en vídeos subidos por usuarios, facilitando la revisión automática. La licencia MIT permite su uso en plataformas comerciales.
- Análisis de tráfico: clasificar comportamientos de vehículos o peatones en vídeos de cámaras de tráfico, como detección de infracciones o incidentes.
- Investigación de comportamiento animal: clasificar actividades de animales en vídeos de campo, como las clases definidas en el dataset, para estudios etológicos.
- Automatización de revisión de vídeos de formación: clasificar si un vídeo de entrenamiento muestra correctamente un procedimiento, comparando la clase predicha con la esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta los siguientes resultados en el conjunto de evaluación, declarados por el autor:

| Métrica | Valor |
|---|---|
| Loss de evaluación | 0.3387 |
| Accuracy de evaluación | 0.7913 |

Estos valores corresponden a un dataset no especificado y no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 354 MB (88.650.245 × 4 bytes). La VRAM total necesaria depende del número de frames y la resolución de entrada; una GPU con 8 GB o más es suficiente para la mayoría de casos.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070, A100 o H100 para procesamiento por lotes.
- Sí cabe en GPUs de consumo como la RTX 3060 o superiores.
- Opciones de despliegue: Transformers (PyTorch), pipelines de Hugging Face, ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_2_p0_splited-1788743688.2073812 | 88.650.245 | No aplica | MIT | Hugging Face |
| google/vivit-b-16x2-kinetics400 | No disponible | No aplica | No disponible | Hugging Face |
| tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_1_p0_splited-1788680718.6508312 | No disponible | No aplica | MIT | Hugging Face |

El modelo fine-tuned comparte arquitectura y tamaño con el modelo base `google/vivit-b-16x2-kinetics400`, pero está adaptado a un dataset específico de 5 clases. No hay datos de rendimiento comparables entre ambos.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado; no se conocen las clases exactas ni su distribución.
- La loss de validación aumenta durante el entrenamiento (de 0.2517 a 0.3871) mientras la loss de entrenamiento disminuye, lo que sugiere sobreajuste.
- No hay benchmarks públicos que permitan evaluar su rendimiento frente a otros modelos.
- El modelo puede heredar sesgos del dataset de preentrenamiento (Kinetics-400) y del dataset de fine-tuning.
- No es un modelo generativo; no produce texto ni respuestas, solo clasificación.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base en su ficha de Hugging Face.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_2_p0_splited-1788743688.2073812
- Modelo base: https://huggingface.co/google/vivit-b-16x2-kinetics400
- Documentación de ViT en Transformers: https://huggingface.co/docs/transformers/model_doc/vit
- Modelo similar del mismo autor (5_class_1): https://huggingface.co/tihon-nth/vivit-vit-fc-loss-8-10-epochs-5_class_1_p0_splited-1788680718.6508312
