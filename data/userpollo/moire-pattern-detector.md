# UserPollo/moire-pattern-detector

## Resumen

El modelo `UserPollo/moire-pattern-detector` es un clasificador de imágenes binario desarrollado por UserPollo para detectar patrones de Moiré y recapturas de pantalla en fotografías digitales. Se construye sobre el backbone `facebook/dinov2-with-registers-base`, un modelo de visión de tipo transformer, y se fine-tunea específicamente para la tarea de distinguir entre una imagen original (clase `gt`) y una fotografía tomada de una pantalla (clase `moire`).

La principal innovación es un enfoque de doble rama (dual-branch) que soluciona el problema de la escala en la detección de Moiré: por un lado, analiza un recorte nativo de 224 píxeles sin redimensionar para capturar la interferencia de alta frecuencia entre píxeles; por otro, procesa una miniatura global de la imagen para detectar bandas periódicas en toda la pantalla. El modelo está pensado para integrarse en pipelines de anti-spoofing, forensia digital y valoración automática de activos. El repositorio tiene un tamaño de 0.1 GB e incluye los pesos del backbone fine-tuneado y la cabecera de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 (base) con registers + MLP de 2 capas, enfoque de doble rama |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificador de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) con archivos complementarios (classes.json) |

## Arquitectura y entrenamiento

El modelo utiliza el backbone DINOv2 with registers, con las últimas dos capas del encoder desbloqueadas para fine-tuning. Sobre las características extraídas de este backbone se añade una cabecera MLP de dos capas con normalización por lotes y dropout, cuyo tamaño de entrada es 3072 porque concatena el token CLS y la media de los tokens de parche de cada rama. La estratégia de construcción del modelo es de doble rama: una rama local con `CenterCrop(224)` sin redimensionar y una rama global con `Resize(256)` y `CenterCrop(224)`. Ambas imágenes se pasan por el mismo backbone y las características resultantes se concatenan horizontalmente antes de la clasificación.

El entrenamiento se realizó sobre el dataset `soumikrakshit/uhdm-dataset`, un corpus público de imágenes de alto dinamismo orientado a detección de Moiré. No se ha publicado información sobre el número de tokens de entrenamiento, el número de épocas ni si se emplearon técnicas de RLHF o DPO, algo esperable al tratarse de un modelo de visión. La model card no detalla un proceso de alineación ni de generación; es un clasificador supervisado estándar.

## Capacidades

- Clasificación binaria de imágenes: distingue entre una foto original (clase `gt`) y una recaptura de pantalla con patrón de Moiré (clase `moire`).
- Detección de interferencias de alta frecuencia entre píxeles gracias a la rama local que no redimensiona la imagen.
- Detección de bandas periódicas globales (banding de pantalla) mediante la rama global que procesa una miniatura.
- Funciona como modelo discriminativo, no generativo: no produce texto ni imágenes.
- No soporta tool calling, function calling, ni razonamiento multi-paso: es un clasificador puro.
- No tiene capacidades multilingües porque no procesa lenguaje natural.
- La capacidad especial reside en su arquitectura de doble escala, pensada específicamente para el problema de los patrones de Moiré.

## Casos de uso

- Autenticación anti-spoofing en aplicaciones bancarias: el modelo se puede integrar en un flujo de verificación para detectar si una fotografía de un documento o un selfie es en realidad una captura de pantalla. La detección de recapturas evita que un atacante utilice una imagen mostrada en un monitor.
- Forensia digital en investigaciones: los analistas pueden emplear el modelo para identificar si una imagen incautada es una captura de pantalla re-fotografiada, lo que ayuda a rastrear la cadena de custodia y detectar manipulación digital.
- Valoración automática de activos en plataformas de comercio: los sistemas que valoran productos a partir de imágenes pueden filtrar fotografías recapturadas de otras webs, mejorando la calidad del catálogo y evitando reclamaciones.
- Control de calidad en impresión y textiles: en entornos donde se inspeccionan patrones impresos o texturas con cámaras, el modelo descarta imágenes que presentan artefactos de Moiré derivados de la captura de pantallas de referencia.
- Moderación de contenidos: plataformas que prohíben capturas de pantalla pueden usar el detector para redirigir al usuario a la fuente original o rechazar la publicación automáticamente.
- Verificación de documentos de identidad: en servicios de verificación remota, el modelo puede descartar capturas de pantalla de documentos presentados en lugar del documento físico, reforzando el proceso de conformidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un backbone DINOv2 base (aproximadamente 86 millones de parámetros) con una cabecera MLP pequeña, el proceso de una imagen con las dos ramas requiere del orden de 1 a 2 GB de VRAM. Esta cifra es una estimación y puede variar según el tamaño de batch o la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050, RTX 2060 o superior, es suficiente para inferencia. No se necesitan GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en tarjetas gráficas de consumo.
- Opciones de despliegue: se puede ejecutar con PyTorch directamente, ya sea en un servidor o en un script de inferencia. Al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp ni Ollama, pero es posible exportar a ONNX o TensorRT para optimizar la latencia.
- Latencia y throughput: no disponible. Dado el tamaño reducido del modelo, la inferencia en GPU se espera casi instantánea para una sola imagen, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Enfoque | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| UserPollo/moire-pattern-detector | Clasificación binaria con doble escala | DINOv2 base + MLP | Apache 2.0 | HuggingFace |
| AmadeusITGroup/Moire-Pattern-Detection | Detección de Moiré mediante descomposición wavelet | CNN multi-entrada | No especificada | GitHub |
| Nyckel (if image has moire pattern) | Clasificador preentrenado para identificar Moiré | No especificada | Comercial (API) | Servicio web |

La alternativa de AmadeusITGroup utiliza una CNN alimentada con descomposición wavelet, mientras que el modelo de UserPollo parte de un transformer moderno. Nyckel ofrece un servicio de API pero no documenta la arquitectura interna. No se dispone de datos cuantitativos para comparar el rendimiento de los tres enfoques.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con el dataset UHDM, que puede no cubrir todos los tipos de pantallas, resoluciones o condiciones de iluminación. Es probable que falle en imágenes fuera de esta distribución.
- Riesgo de alucinación: al ser un clasificador, el riesgo se manifiesta como falsos positivos o falsos negativos en la confianza de la predicción. No hay evidencia de calibración de la probabilidad de salida.
- Limitaciones de contexto o idioma: no aplica, pues no procesa lenguaje natural. Sin embargo, tampoco soporta imágenes en cualquier formato ni admite entradas textuales.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías de funcionamiento ni de idoneidad para un propósito particular. El modelo base DINOv2 también se distribuye bajo Apache 2.0, tal y como aparece en su página de HuggingFace.
- Caveat para producción: el script de inferencia presupone la descarga de los pesos del backbone desde HuggingFace y la existencia de los archivos `.pt` en el repositorio. No hay documentación sobre el proceso de entrenamiento, los hiperparámetros exactos ni los valores de umbral para una clasificación robusta en entornos reales.
- La detección de Moiré puede verse afectada por la resolución de la cámara, el patrón de píxeles del monitor y las condiciones de iluminación, lo que reduce la fiabilidad en escenarios no controlados.

## Enlaces

- HuggingFace: https://huggingface.co/UserPollo/moire-pattern-detector
- Dataset: https://huggingface.co/datasets/soumikrakshit/uhdm-dataset
- Modelo base: https://huggingface.co/facebook/dinov2-with-registers-base
- Proyecto alternativo (AmadeusITGroup): https://github.com/AmadeusITGroup/Moire-Pattern-Detection
- Servicio Nyckel: https://www.nyckel.com/pretrained-classifiers/if-image-has-moire-pattern-identifier/
