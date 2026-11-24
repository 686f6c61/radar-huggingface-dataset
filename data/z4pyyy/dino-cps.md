# z4pyyy/dino-cps

## Resumen

DINO-CPS es un conjunto de modelos de clasificación de enfermedades de plantas desarrollado por el grupo 13 de la asignatura COS30082 (autor `z4pyyy`) y publicado en Hugging Face. El paquete contiene dos cabezales basados en DINOv2 ViT-L/14 —uno para identificar el cultivo (55 clases) y otro para identificar la enfermedad (175 clases)— exportados a ONNX en cuantización int8, además de dos baselines ConvNeXt-Tiny usados para fusión CNN. El objetivo es doble: clasificación de cultivo y clasificación de enfermedad a partir de una imagen de hoja, con un pipeline pensado para ejecutarse íntegramente en el navegador.

La relevancia del modelo es acotada pero concreta: demuestra un flujo de despliegue de visión por computador en cliente (ONNX int8, entrada 224x224, normalización ImageNet) sin necesidad de backend GPU, algo útil para aplicaciones agrícolas de campo con conectividad limitada. No es un modelo de lenguaje ni un modelo fundacional nuevo: es un fine-tuning supervisado de DINOv2 ViT-L/14 con cabezales de clasificación, empaquetado para inferencia ligera.

La información disponible es escasa: la model card es mínima, no hay métricas de evaluación, ni detalles del dataset de entrenamiento, ni resultados de benchmarks. El repositorio ocupa 0,7 GB y acumula 0 descargas y 0 likes en el momento de la consulta. Cualquier dato no documentado se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (backbone) con cabezal de clasificación lineal para cultivo y cabezal con attention pooling para enfermedad; baselines ConvNeXt-Tiny |
| Parametros totales | no disponible (el backbone ViT-L/14 de DINOv2 tiene ~300 M de parámetros, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | int8 (ONNX quantized) para los modelos DINOv2; los baselines ConvNeXt-Tiny se distribuyen en ONNX sin especificar cuantización |
| Idiomas soportados | no aplica (visión); no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`dino_cps_crop.int8.onnx`, `dino_cps_disease.int8.onnx`, `crop_ConvNeXt-Tiny.onnx`, `disease_ConvNeXt-Tiny.onnx`) |

## Arquitectura y entrenamiento

El modelo se apoya en DINOv2 ViT-L/14, un Vision Transformer con parches de 14x14 y autoratención global, preentrenado por Meta con aprendizaje autosupervisado. Sobre ese backbone, el grupo COS30082 ha añadido dos cabezales supervisados: uno de clasificación de cultivo con 55 clases y otro de clasificación de enfermedad con 175 clases que incorpora attention pooling en lugar de un simple pooling global. Adicionalmente se incluyen dos modelos ConvNeXt-Tiny como baselines CNN, presumiblemente para comparar o fusionar las representaciones convolucionales con las del transformer.

La entrada es un tensor `[1, 3, 224, 224]` normalizado con estadísticas de ImageNet. Los modelos DINOv2 se han exportado a ONNX y cuantizado a int8, lo que reduce el peso y acelera la inferencia en CPU y en el navegador (runtime ONNX Runtime Web). No se documenta el número de imágenes de entrenamiento, la composición del dataset, si hubo aumento de datos, ni si se aplicó destilación o fine-tuning parcial del backbone. Tampoco se especifica la técnica exacta de cuantización (post-training quantization estática o dinámica) ni el calibrado empleado.

## Capacidades

- Clasificación de cultivo en 55 clases a partir de una imagen de hoja.
- Clasificación de enfermedad en 175 clases con cabezal de attention pooling.
- Inferencia en navegador mediante ONNX Runtime Web (los modelos se cargan desde la GUI del Plant Disease Validator).
- Ejecución en CPU sin GPU dedicada gracias a la cuantización int8.
- Fusión con baselines ConvNeXt-Tiny para combinar señales CNN y transformer.
- Entrada de imagen RGB 224x224 con normalización ImageNet.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso.
- No soporta múltiples idiomas en sentido lingüístico: solo procesa imágenes.

## Casos de uso

- Diagnóstico de enfermedades en campo desde el móvil: la GUI del Plant Disease Validator carga los ONNX int8 en el navegador, de modo que un técnico agrícola puede fotografiar una hoja y obtener cultivo y enfermedad sin enviar la imagen a un servidor, lo que reduce latencia y preserva privacidad.
- Aplicación web offline-first para zonas rurales: al ejecutarse en ONNX Runtime Web, el modelo funciona tras la primera carga de los 0,7 GB del repositorio, útil en explotaciones con conectividad intermitente.
- Triaje previo en inspección fitosanitaria: el clasificador de 175 enfermedades sirve como primer filtro para derivar muestras sospechosas a un laboratorio, priorizando las imágenes con mayor probabilidad de patología.
- Etiquetado asistido de datasets agrícolas: el modelo puede preanotar imágenes de hojas con cultivo y enfermedad, reduciendo el coste de anotación manual antes de una revisión humana.
- Investigación en comparación de arquitecturas: los baselines ConvNeXt-Tiny incluidos permiten reproducir la comparación CNN vs. ViT en la misma tarea y con el mismo pipeline de exportación ONNX.
- Integración en sistemas de monitorización con drones o cámaras trampa: al ser un modelo de 224x224 y bajo coste computacional, puede ejecutarse en dispositivos edge que capturen imágenes periódicas de parcelas.
- Docencia y prototipado rápido: el paquete sirve como ejemplo completo de fine-tuning de DINOv2, exportación a ONNX, cuantización int8 y despliegue en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,7 GB) y la cuantización int8, el conjunto completo cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: no disponible; al ser ONNX int8 está pensado para CPU y ejecución en navegador, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, con cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINO-CPS (este) | DINOv2 ViT-L/14 + ConvNeXt-Tiny | 55 cultivos, 175 enfermedades | Imagen 224x224 | MIT | Hugging Face, ONNX int8 |
| DINOv2 ViT-L/14 original | ViT-L/14 autosupervisado | no aplica (backbone) | Imagen 224x224 (hasta 518) | Apache 2.0 (Meta) | Hugging Face |
| ConvNeXt-Tiny | CNN | según fine-tuning | Imagen 224x224 | MIT (implementación) | Hugging Face |
| PlantVillage-based classifiers | CNN/ViT supervisados | variable | Imagen variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas de accuracy, F1 ni matriz de confusión publicadas; imposible evaluar la calidad real del clasificador.
- El dataset de entrenamiento no está documentado: se desconoce la distribución de cultivos y enfermedades, el equilibrio de clases y la procedencia de las imágenes.
- Riesgo de sobreajuste al dominio de entrenamiento: imágenes de campo con iluminación, fondo y ángulos distintos a los del dataset pueden degradar la precisión.
- El modelo solo clasifica entre las 55 clases de cultivo y 175 de enfermedad aprendidas; una especie o patología fuera de ese conjunto se asignará erróneamente a la clase más cercana.
- La cuantización int8 puede introducir una pérdida de precisión no cuantificada respecto al modelo en fp32.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del backbone DINOv2 subyacente (Apache 2.0 de Meta) antes de redistribuir.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Fecha de creación declarada en 2026-11-24, posterior a la consulta habitual; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/z4pyyy/dino-cps
- Demo (Plant Disease Validator GUI): https://z4pyyy-plantdiseasevalidator.static.hf.space
- DINOv2 (backbone original, Meta): no disponible en la información proporcionada
- Paper DINOv2: no disponible en la información proporcionada
- Repositorio del proyecto COS30082: no disponible en la información proporcionada
