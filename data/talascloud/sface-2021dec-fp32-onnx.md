# TalasCloud/SFace-2021dec-FP32-ONNX

## Resumen

SFace-2021dec-FP32-ONNX es una conversión al formato ONNX de los pesos del modelo de reconocimiento facial SFace originalmente publicado en OpenCV Zoo. El autor de esta conversión es TalasCloud, que distribuye el modelo con los pesos originales conservados byte a byte y en precisión FP32. No se trata de un modelo generativo de lenguaje, sino de un extractor de embeddings faciales diseñado para tareas de verificación de identidad (face matching) en pipelines multimedia.

El modelo está pensado para integrarse con OpenCV FaceRecognizerSF y se distribuye principalmente para su uso en entornos Windows con hardware modesto, concretamente una GPU AMD Radeon RX 580 2048SP (arquitectura Polaris, 8 GB) y una CPU Intel Xeon E5-2696 v3 (Haswell, AVX2). Esta orientación a hardware de consumo y a un runtime multimedia concreto indica que la publicación responde a una necesidad de despliegue práctico más que a una investigación de vanguardia.

La relevancia de esta ficha es limitada por la escasez de información publicada: no se documentan parámetros, arquitectura interna, contexto, idiomas ni benchmarks. Se trata, por tanto, de una variante de despliegue de un modelo de reconocimiento facial ya conocido en el ecosistema OpenCV, no de un modelo nuevo con capacidades generativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento facial; pesos originales de OpenCV Zoo SFace) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de embeddings faciales) |
| Tipos de cuantización | FP32 (única precisión distribuida) |
| Idiomas soportados | no disponible (no aplica: modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card indica únicamente que se trata de una conversión a ONNX de los pesos SFace de OpenCV Zoo, conservados byte a byte y en su precisión original FP32. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, lo cual es coherente con un modelo de visión orientado a embeddings y no a generación de texto.

La innovación destacable de esta publicación no es arquitectónica, sino operativa: la exportación a ONNX para su uso con OpenCV FaceRecognizerSF en un entorno Windows con GPU AMD Polaris y CPU Haswell. Se proporciona además el hash SHA-256 de los pesos (`0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79`), lo que permite verificar la integridad de la descarga.

## Capacidades

- Extracción de embeddings faciales para verificación de identidad (identity matching).
- Comparación de rostros mediante distancia entre embeddings, integrable con OpenCV FaceRecognizerSF.
- Uso en pipelines multimedia de procesamiento de imágenes y vídeo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking mode, audio o visión generativa.

## Casos de uso

- Verificación de identidad en pipelines multimedia: el modelo genera embeddings faciales que pueden compararse para confirmar si dos imágenes corresponden a la misma persona, integrándose con OpenCV FaceRecognizerSF.
- Deduplicación de rostros en archivos de vídeo: procesando fotogramas y extrayendo embeddings, es posible agrupar apariciones de la misma persona a lo largo de un metraje.
- Etiquetado automático de caras en bibliotecas de imágenes: comparando embeddings contra una galería de referencia, se pueden asignar nombres a rostros detectados.
- Control de acceso o autenticación local: en despliegues de escritorio con hardware modesto (RX 580, Xeon E5-2696 v3), el modelo FP32 ONNX puede ejecutarse localmente sin depender de servicios en la nube.
- Moderación de contenido en plataformas de medios: detección de rostros recurrentes para identificar cuentas o perfiles asociados a un mismo individuo.
- Prototipado de sistemas de reconocimiento facial en entornos Windows: gracias a la licencia Apache 2.0 y al formato ONNX, es adecuado para experimentación e integración en herramientas de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo se distribuye en FP32 y el tamaño del repo figura como 0.0 GB, lo que impide estimar con rigor).
- GPU recomendadas: AMD Radeon RX 580 2048SP (Polaris, 8 GB), según la model card; no se mencionan GPU NVIDIA.
- CPU de referencia: Intel Xeon E5-2696 v3 (Haswell, AVX2).
- Compatibilidad con GPU de consumo: sí, según la model card, en una RX 580 de 8 GB.
- Opciones de despliegue: OpenCV FaceRecognizerSF con runtime ONNX; se enlaza un runtime multimedia del autor (koboldcpp-media-pipeline v2026.11.17-r5).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFace-2021dec-FP32-ONNX (este) | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face |
| SFace original (OpenCV Zoo) | no disponible | no aplica | no disponible | no disponible en la información | OpenCV Zoo |
| Otras variantes SFace (p. ej. INT8) | no disponible | no aplica | no disponible | no disponible en la información | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, número de parámetros, dataset de entrenamiento ni métricas de precisión, lo que dificulta evaluar su calidad frente a otras variantes.
- Sesgos conocidos: no documentados; los modelos de reconocimiento facial suelen presentar sesgos demográficos, pero no hay evidencia publicada en esta ficha.
- Riesgo de alucinación: no aplica a un modelo de embeddings; el riesgo relevante es el falso positivo o negativo en la comparación de identidades.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo original SFace en OpenCV Zoo, ya que esta ficha solo documenta la licencia de la conversión.
- Caveat para producción: la model card orienta el uso a un hardware y runtime concretos (Windows, RX 580, Xeon E5-2696 v3, OpenCV FaceRecognizerSF); no se garantiza compatibilidad con otros entornos.
- El tamaño del repo figura como 0.0 GB, lo que sugiere que la información de metadatos puede estar incompleta o que los pesos no están reflejados en el recuento.

## Enlaces

- Hugging Face: https://huggingface.co/TalasCloud/SFace-2021dec-FP32-ONNX
- OpenCV Zoo SFace: https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface
- Runtime multimedia del autor: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
