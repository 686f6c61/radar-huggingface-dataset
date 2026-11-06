# torch-pointcloud/act.dvae.runpei-dong

## Resumen

ACT (Autoencoders as Cross-Modal Teachers) es un modelo de preentrenamiento autosupervisado para nubes de puntos 3D desarrollado por Runpei Dong y colaboradores, publicado en ICLR 2023. La idea central del trabajo es destilar el conocimiento de un transformer de imagenes 2D preentrenado hacia un transformer de puntos 3D enmascarado, usando un autoencoder como puente entre ambas modalidades. El modelo aqui presentado es la variante DVAE del checkpoint de ACT, convertida al formato de la libreria `torch-pointcloud`.

Este checkpoint concreto contiene 116,2 millones de parametros y fue preentrenado sobre ShapeNet-55 con el objetivo de producir representaciones 3D transferibles. No es un modelo generativo de texto ni un asistente conversacional: es un backbone de vision 3D que se utiliza como inicializacion para tareas posteriores de clasificacion, segmentacion o deteccion sobre nubes de puntos.

Su relevancia actual reside en que demuestra que el conocimiento visual 2D puede transferirse a representaciones 3D sin etiquetas, un enfoque que reduce la dependencia de anotaciones manuales en dominios como robotica, conduccion autonoma o modelado CAD. La conversion a `torch-pointcloud` facilita su uso en pipelines de PyTorch sin necesidad de reproducir el codigo original del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de puntos con enmascaramiento (masked point transformer), destilado desde un transformer de imagenes 2D mediante autoencoder (DVAE) |
| Parametros totales | 116.189.211 (116,2 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre nubes de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer de nubes de puntos que aplica enmascaramiento aleatorio sobre las coordenadas de entrada y reconstruye las partes ocultas. La innovacion principal es el uso de un autoencoder (en esta variante, un DVAE) entrenado sobre caracteristicas de un transformer de imagenes 2D preentrenado como "profesor": las representaciones del autoencoder sirven como objetivo de destilacion para el modelo 3D, estableciendo un puente cross-modal entre imagen y nube de puntos. El resultado es un backbone que captura estructura geometrica y semantica sin requerir etiquetas 3D.

El preentrenamiento se realizo sobre ShapeNet-55, un subconjunto de ShapeNet con 55 categorias de objetos 3D. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron etapas de ajuste fino supervisado o preferencias (RLHF/DPO), que en cualquier caso no aplicarian a este tipo de modelo.

## Capacidades

- Extraccion de caracteristicas de nubes de puntos 3D para tareas downstream (clasificacion de forma, segmentacion de partes, segmentacion semantica).
- Preentrenamiento autosupervisado con enmascaramiento: aprende representaciones sin etiquetas.
- Transferencia cross-modal desde vision 2D: las representaciones incorporan conocimiento visual de un transformer de imagenes.
- Procesamiento de nubes de puntos de hasta al menos 8192 puntos en el ejemplo de uso de la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision 2D directa, audio ni otras capacidades generativas.

## Casos de uso

- Clasificacion de objetos 3D en pipelines de vision: se usa el backbone preentrenado como inicializacion y se anade una cabeza de clasificacion, reduciendo el numero de muestras etiquetadas necesarias frente a entrenar desde cero.
- Segmentacion semantica de escenas 3D: las representaciones por punto permiten etiquetar cada punto de una nube (por ejemplo, en datos de conduccion autonoma tipo nuScenes o SemanticKITTI) tras ajuste fino.
- Modelado CAD y recuperacion de formas: extraer embeddings de mallas convertidas a nubes de puntos para busqueda por similitud en catalogos de piezas industriales.
- Robotica de manipulacion: estimar caracteristicas geometricas de objetos a partir de nubes de puntos de sensores de profundidad para tareas de agarre y planificacion.
- Preentrenamiento de modelos 3D en dominios con pocas etiquetas: servir como punto de partida cuando solo se dispone de datos sin anotar, aprovechando el preentrenamiento autosupervisado sobre ShapeNet-55.
- Investigacion en aprendizaje cross-modal: reproducir o extender el paradigma de destilacion 2D a 3D para estudiar transferencia de representaciones entre modalidades.
- Digitalizacion y reconstruccion 3D: usar las caracteristicas aprendidas como soporte en tareas de completado o denoising de nubes de puntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de resultados (ModelNet40, ScanObjectNN, ShapeNet part segmentation u otros) para este checkpoint concreto; las cifras del paper original corresponden a los modelos ACT completos y no se reproducen aqui para no atribuir datos no verificados a esta conversion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 116,2 M de parametros en precision FP32, los pesos ocupan aproximadamente 465 MB; en FP16, unos 232 MB. Sumando activaciones para lotes pequenos de 8192 puntos, el consumo tipico se situa en el rango de 1 a 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento o ajuste fino se recomienda RTX 3090/4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1660, RTX 3060, RTX 4060 y superiores).
- Opciones de despliegue: la libreria `torch-pointcloud` con PyTorch es la via documentada; no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT DVAE (este) | 116,2 M | Nubes de puntos (ej. 8192 puntos) | Autosupervisado + destilacion 2D sobre ShapeNet-55 | MIT | Hugging Face (torch-pointcloud) |
| Point-MAE | No disponible en la informacion | Nubes de puntos | Autosupervisado con enmascaramiento | MIT (repositorio original) | GitHub / pesos comunitarios |
| Point-BERT | No disponible en la informacion | Nubes de puntos | Autosupervisado con tokenizer discreto | MIT (repositorio original) | GitHub / pesos comunitarios |
| ULIP | No disponible en la informacion | Nubes de puntos + texto/imagen | Contrastivo multimodal | No disponible | GitHub |

La comparacion cuantitativa de rendimiento entre estos modelos no puede establecerse con los datos disponibles; se recomienda consultar los papers originales para cifras de ModelNet40 y ScanObjectNN.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks tipo MMLU o GSM8K.
- El preentrenamiento se limita a ShapeNet-55, un dataset de objetos CAD sinteticos; el rendimiento puede degradarse en escenas reales con ruido de sensores, oclusiones o densidades distintas.
- No se han publicado evaluaciones de sesgo para este checkpoint; al operar sobre geometria 3D, los sesgos potenciales estarian en la distribucion de categorias de ShapeNet-55.
- Riesgo de sobreajuste a las 55 categorias de ShapeNet-55 si se usa sin ajuste fino en dominios fuera de distribucion.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los datos de entrenamiento (ShapeNet) y del codigo original de ACT.
- La model card no documenta el proceso exacto de conversion ni garantiza paridad numerica con los pesos originales del repositorio ACT.
- No disponible informacion sobre cuantizacion, lo que limita el despliegue en entornos con restricciones severas de memoria mas alla de FP16/FP32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/act.dvae.runpei-dong
- Paper ACT (arXiv): https://arxiv.org/abs/2212.08320
- Paper ShapeNet (arXiv): https://arxiv.org/abs/1512.03012
- Repositorio original ACT: https://github.com/RunpeiDong/ACT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
