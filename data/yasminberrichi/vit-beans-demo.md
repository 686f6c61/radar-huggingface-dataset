# yasminberrichi/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificación de imágenes publicado en HuggingFace por el usuario yasminberrichi. Se trata de un fine-tuning completo del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base preentrenado sobre ImageNet-21k, adaptado mediante la librería Transformers y el Trainer de HuggingFace a una tarea de clasificación de imágenes cuyo conjunto de datos el propio autor describe como "unknown dataset" en la model card. El modelo tiene 85.800.963 parámetros en formato safetensors y se distribuye bajo licencia Apache-2.0.

El interés del modelo es fundamentalmente práctico y demostrativo: no introduce ninguna innovación arquitectónica, sino que documenta una receta de fine-tuning reproducible (4 épocas, learning rate 5e-05, AdamW fused, scheduler lineal con 10 % de warmup, batch de 16) con métricas de validación declaradas por el autor (loss 0.0995 y accuracy 0.9766 en la evaluación final, aunque la tabla de entrenamiento registra 0.9925 de accuracy en la última época). Es, por tanto, un ejemplo típico de transferencia de un backbone ViT a un dominio concreto, probablemente agronómico por el sufijo "beans" del nombre, si bien la documentación no confirma el origen de los datos.

Su relevancia actual es limitada como artefacto de producción: acumula 0 descargas y 0 likes, la model card está generada automáticamente y contiene secciones vacías ("More information needed"), y el model-index no declara ningún benchmark. Resulta útil, en cambio, como plantilla de referencia para quien quiera replicar un pipeline de clasificación con ViT-Base, como punto de partida para transfer learning en dominios con pocas clases y como caso de estudio de las limitaciones de publicar modelos sin documentación de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, parches de 16x16, resolución de entrada 224x224, preentrenado en ImageNet-21k) |
| Parametros totales | 85.800.963 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 224x224 píxeles (196 parches de 16x16 más token CLS) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors y no se documentan versiones GGUF, ONNX o INT8 |
| Idiomas soportados | no disponible (modelo de visión, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea (pipeline) | image-classification |
| Numero de clases de salida | 3 (inferido del recuento de parámetros; no declarado en la model card) |
| Modelo base | google/vit-base-patch16-224-in21k |
| Tamano del repositorio | 2,1 GB |
| Compatibilidad | etiqueta endpoints_compatible (despliegue en Inference Endpoints) |
| Version de Transformers | 5.17.0 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar en su variante base: el encoder consta de 12 capas, anchura oculta de 768 y 12 cabezas de atención, y la imagen de entrada se divide en parches de 16x16 píxeles (196 parches para 224x224) a los que se añade un token CLS. El recuento exacto de parámetros (85.800.963) coincide con los 85.798.656 parámetros del encoder ViT-Base más 2.307 parámetros de una cabeza de clasificación lineal de 3 clases (768 x 3 pesos más 3 sesgos), lo que permite deducir que el modelo fue reentrenado con una salida de 3 clases en lugar de las 1.000 de ImageNet o las 21.843 de ImageNet-21k. Esta deducción es aritmética y contrastable con los pesos publicados; el número de clases, en cambio, no aparece explicitado en la model card.

El entrenamiento se realizó con el Trainer de HuggingFace y los siguientes hiperparámetros: 4 épocas, learning rate 5e-05, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW con implementación fused y betas (0.9, 0.999), epsilon 1e-08, scheduler lineal con warmup del 10 % de los pasos y 260 pasos totales. La composición del dataset, el número de ejemplos de entrenamiento y validación, el protocolo de aumento de datos y cualquier etapa de ajuste adicional (RLHF, DPO u otras, no habituales en clasificación) no están documentados: la model card indica literalmente "unknown dataset" y "More information needed" en las secciones de datos, usos previstos y limitaciones. No se describe ninguna innovación técnica ni mecanismo de decodificación. El nombre del modelo sugiere un conjunto de datos de hojas de judía, pero se trata de una hipótesis no confirmada por la documentación disponible. Tampoco se documentan los métodos de preprocesado (normalización, resize, recorte central) aplicados durante el fine-tuning.

## Capacidades

- Clasificación de imágenes en 3 clases de salida (número inferido del recuento de parámetros, no declarado explícitamente).
- Extracción de características visuales: al ser un ViT-Base, el encoder puede reutilizarse como backbone congelado o ajustable para detección, segmentación o recuperación de imágenes mediante transfer learning.
- Inferencia sobre imágenes RGB de 224x224 píxeles con el procesador de imagen correspondiente (ViTImageProcessor de la librería transformers).
- Integración directa con la API de pipelines: `pipeline("image-classification", model="yasminberrichi/vit-beans-demo")`.
- Compatibilidad declarada con Inference Endpoints de HuggingFace (etiqueta endpoints_compatible).
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni generación de texto.
- No dispone de modo de pensamiento (thinking), ni capacidades de audio, vídeo o visión-lenguaje.
- Capacidades multilingües: no aplica, el modelo no procesa lenguaje natural.

## Casos de uso

- Diagnóstico en campo de enfermedades foliares: una aplicación móvil captura una fotografía de una hoja, la redimensiona a 224x224 píxeles y el modelo devuelve una de las 3 clases con su probabilidad asociada. Con 85,8 millones de parámetros el modelo puede ejecutarse en el propio dispositivo o en un servidor modesto, lo que reduce la dependencia de conectividad en explotaciones agrícolas.
- Triaje previo en teledetección con drones: las imágenes aéreas se recortan en teselas de 224x224 y se clasifican por lotes para generar mapas de incidencia aproximados, que después se validan en campo. El coste computacional por imagen es bajo, lo que permite procesar cientos de teselas de un vuelo completo en pocos segundos en una GPU consumer.
- Pre-anotación de datasets agronómicos: el modelo puede usarse como etiquetador automático de primer paso para revisión humana posterior, reduciendo el esfuerzo de anotación en corpus nuevos de imágenes de cultivos.
- Control de calidad en líneas de inspección: clasificación rápida de material vegetal o de muestras de laboratorio en una fase previa de descarte, combinada con un umbral de confianza para derivar los casos dudosos a revisión manual.
- Transfer learning sobre dominios cercanos: el encoder ViT-Base ajustado puede servir de inicialización para clasificar otras enfermedades, otras especies o nuevas cámaras, con menos datos y menos épocas que partiendo del checkpoint de ImageNet-21k.
- Prototipos y demostraciones docentes: como ejemplo reproducible de fine-tuning de un ViT con el Trainer, es adecuado para talleres, asignaturas de visión por computador y comparativas de recetas de entrenamiento (learning rate, número de épocas, aumentos de datos).
- Referencia para pruebas de infraestructura: por su tamaño reducido y su etiqueta endpoints_compatible, sirve para validar despliegues en Inference Endpoints, contenedores de inferencia o entornos sin GPU antes de pasar a modelos mayores.

## Benchmarks y rendimiento

El model-index oficial del modelo está vacío (`results: []`), por lo que no hay resultados declarados de benchmarks estándar (ImageNet, MMLU, HumanEval, GSM8K ni equivalentes). Los únicos datos numéricos disponibles son las métricas de validación registradas por el Trainer durante el fine-tuning, que se reproducen a continuación tal cual:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1,0 | 65 | 0,1242 | 0,1000 | 0,9699 |
| 2,0 | 130 | 0,0709 | 0,0846 | 0,9699 |
| 3,0 | 195 | 0,0660 | 0,0693 | 0,9774 |
| 4,0 | 260 | 0,0757 | 0,0437 | 0,9925 |

Además, el encabezado de la model card declara de forma resumida "Loss: 0.0995" y "Accuracy: 0.9766" sobre el conjunto de evaluación. Estos dos valores no coinciden con la última fila de la tabla (validation loss 0,0437 y accuracy 0,9925), ni con ninguna otra fila, por lo que existe una inconsistencia no aclarada en la documentación del autor. No hay resultados comparativos con otros modelos y no se especifica el tamaño del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 344 MB (85,8 millones de parámetros x 4 bytes) y unos 172 MB en fp16. Con un lote de 1 imagen de 224x224, la inferencia cabe con holgura por debajo de 1 GB de VRAM; lotes grandes (por ejemplo 256 imágenes) requieren del orden de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para despliegues de bajo volumen sirven una GTX 1050 Ti, una RTX 3050 o una T4. Para procesar lotes grandes o dar servicio a muchos clientes, resultan adecuadas una RTX 3060, una RTX 4090, una L4 o una A10G. Las A100 y H100 solo tienen sentido si se comparten con otros modelos o si se necesita throughput agregado muy alto, dado el reducido tamaño del modelo.
- Inferencia en CPU: viable. Un ViT-Base a 224x224 se ejecuta en CPU en tiempos de decenas de milisegundos por imagen, suficiente para aplicaciones de baja concurrencia.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual y en muchas integradas con al menos 2 GB de memoria compartida disponible.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportación a ONNX Runtime o TorchScript para reducir latencia, HuggingFace Inference Endpoints (etiqueta endpoints_compatible), servidores de modelo genéricos como TorchServe, BentoML o Triton. Las plataformas orientadas a generación de texto (vLLM, TGI) no están pensadas para clasificación de imágenes y no se documentan como compatibles.
- Latencia y throughput: no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yasminberrichi/vit-beans-demo | 85.800.963 | Clasificación de imágenes, 3 clases (inferido) | 224x224 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| google/vit-base-patch16-224-in21k | no disponible en la informacion (checkpoint base del anterior) | Preentrenamiento en ImageNet-21k, sin cabeza de tarea específica | 224x224 | Apache-2.0 | HuggingFace, checkpoint de referencia ampliamente utilizado |
| google/vit-base-patch16-224 | 86.567.656 (según su model card) | Clasificación en 1.000 clases de ImageNet-1k | 224x224 | Apache-2.0 | HuggingFace, checkpoint de referencia |
| microsoft/resnet-50 | 25.557.032 (según su model card) | Clasificación en 1.000 clases de ImageNet-1k | 224x224 | Apache-2.0 | HuggingFace, alternativa CNN de menor tamaño |

No se dispone de información sobre otros clasificadores específicos de hojas de judía o de enfermedades foliares con los que comparar de forma directa, ni de resultados de evaluación comunes que permitan establecer una comparación de rendimiento objetiva. El modelo comparado aquí es un fine-tuning del primero de la tabla, de modo que su rendimiento depende íntegramente de la calidad y representatividad del dataset no documentado.

## Limitaciones y advertencias

- Documentación insuficiente: el dataset de entrenamiento se describe como "unknown dataset" y las secciones de descripción, usos previstos, limitaciones y datos de evaluación contienen "More information needed". No es posible auditar la procedencia de los datos ni el reparto train/validación.
- Inconsistencia en las métricas: la accuracy declarada en el encabezado (0,9766) no coincide con la de la última época de la tabla (0,9925), y la loss declarada (0,0995) tampoco. Cualquier afirmación sobre su rendimiento real debe tratarse con cautela.
- Sesgo y generalización desconocidos: sin información sobre la composición del dataset (especie, variedad, cámara, iluminación, fondo, ubicación geográfica), no puede estimarse el sesgo ni la capacidad de generalización a imágenes fuera de la distribución de entrenamiento. El salto de dominio (otra cámara, otro invernadero, otra iluminación) puede degradar gravemente la precisión.
- Riesgo de alucinación en sentido amplio: el modelo siempre devuelve una de las 3 clases con una probabilidad, incluso ante imágenes que no pertenecen a ninguna de ellas (por ejemplo, una hoja sana de otra especie o una imagen no vegetal). Es imprescindible aplicar umbrales de confianza o un mecanismo de rechazo en producción.
- Ausencia de benchmarks: no hay resultados en el model-index ni comparación con alternativas, por lo que no existe evidencia pública de que supere a una línea base más simple.
- Ambigüedad sobre las clases: las etiquetas de salida no están documentadas en la model card; el número de clases (3) se deduce del recuento de parámetros, pero se desconoce su significado.
- Limitaciones de entrada: solo imágenes de 224x224 píxeles, sin capacidades de texto, audio, detección de objetos ni segmentación.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, al desconocerse la licencia del dataset de entrenamiento, no puede garantizarse que el modelo resultante esté libre de restricciones derivadas de los datos.
- Madurez: 0 descargas y 0 likes, fechas de creación y actualización del 15 de septiembre de 2026, sin versiones posteriores ni mantenimiento conocido. No es un artefacto validado por la comunidad.
- Repositorio de 2,1 GB: el tamaño es muy superior a los aproximadamente 344 MB de los pesos en fp32, lo que sugiere la presencia de checkpoints intermedios u otros artefactos en el repositorio; conviene revisar la lista de archivos antes de descargarlo completo.
- Uso en dominios sensibles: la clasificación de enfermedades de cultivos puede derivar en decisiones de tratamiento fitosanitario; cualquier uso real debería ir acompañado de validación agronómica y revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasminberrichi/vit-beans-demo
- Checkpoint base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelo de referencia ViT entrenado en ImageNet-1k: https://huggingface.co/google/vit-base-patch16-224
- Artículo original de Vision Transformer ("An Image is Worth 16x16 Words"): https://arxiv.org/abs/2010.11929
- Documentación del pipeline de clasificación de imágenes de transformers: https://huggingface.co/docs/transformers/main/en/tasks/image_classification
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos de este modelo.
