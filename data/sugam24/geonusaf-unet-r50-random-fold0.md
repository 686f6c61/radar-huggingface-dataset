# sugam24/geonusaf-unet-r50-random-fold0

## Resumen

El modelo `sugam24/geonusaf-unet-r50-random-fold0` es un sistema de segmentación semántica de imágenes de teledetección desarrollado por el usuario sugam24. Está diseñado para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo sin uso y agrícola. Se basa en una arquitectura U-Net con encoder ResNet-50 preentrenado en ImageNet, implementado con la librería `segmentation-models-pytorch` (smp). El modelo se ha entrenado con un split aleatorio de los datos, concretamente el fold 0 de un total de 3, con semilla 42. Las imágenes de entrada son de 512x512 píxeles con normalización ImageNet y una resolución efectiva de 0,586 metros por píxel. Este checkpoint concreto corresponde al mejor epoch (30) según las métricas de validación, que alcanza un mIoU de 0,5133 y una precisión global (OA) de 0,7747. El repositorio tiene un tamaño de 3,8 GB e incluye el checkpoint `best.pt` con los pesos del modelo, la configuración y las métricas.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana, la gestión de recursos naturales y el monitoreo ambiental en regiones con rápida urbanización como el valle de Katmandú. Al ser un modelo de segmentación semántica, permite generar mapas detallados de cobertura del suelo a partir de imágenes aéreas o satelitales, lo que resulta útil para organismos públicos, ONG y empresas de geomática. Sin embargo, al estar entrenado específicamente para esta región y con un número limitado de clases, su transferibilidad a otras áreas geográficas es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-50 (preentrenado en ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura U-Net estándar implementada con `segmentation-models-pytorch`, donde el encoder es una ResNet-50 preentrenada en ImageNet. La decodificación sigue el patrón clásico de U-Net con conexiones de salto entre encoder y decoder para preservar detalles espaciales. La entrada es una imagen RGB de 512x512 píxeles normalizada con las medias y desviaciones de ImageNet. La salida es un mapa de probabilidades por píxel para las seis clases más la clase de fondo (ignorada mediante `ignore_index=255`).

El entrenamiento se realizó con un split aleatorio de los datos, divididos en 3 folds; este checkpoint corresponde al fold 0 con semilla 42. Se alcanzó el mejor rendimiento en el epoch 30. No se proporciona información sobre el tamaño del dataset, el número de tokens (al ser imágenes) ni el proceso de optimización (función de pérdida, optimizador, tasa de aprendizaje, etc.). Tampoco se detalla si se aplicaron técnicas de aumento de datos o regularización. Las métricas de validación indican un rendimiento moderado, con un mIoU de 0,5133 y una precisión global de 0,7747, lo que sugiere que el modelo es funcional pero con margen de mejora, especialmente en clases difíciles como suelo sin uso (IoU 0,3177) y carreteras (IoU 0,4318).

## Capacidades

- Segmentación semántica de imágenes de teledetección (uso del suelo) en 6 clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Clasificación por píxel con salida de máscara de segmentación.
- Manejo de imágenes de alta resolución (0,586 m/px) con entrada de 512x512.
- Inferencia sobre imágenes RGB con normalización ImageNet.
- Capacidad de generar mapas de cobertura del suelo para el valle de Katmandú.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas actualizados de zonas residenciales, carreteras y espacios sin uso, ayudando a los ayuntamientos a identificar áreas de expansión urbana o infraestructura deficiente.
- Monitoreo ambiental: la clasificación de bosques y ríos permite detectar cambios en la cobertura vegetal o en los cauces fluviales, útil para evaluar el impacto de desastres naturales o la deforestación.
- Gestión agrícola: la detección de terrenos agrícolas facilita el análisis de cultivos y la estimación de superficies productivas, apoyando políticas de seguridad alimentaria.
- Respuesta ante emergencias: tras inundaciones o deslizamientos, el modelo puede segmentar rápidamente carreteras y ríos para planificar rutas de evacuación o evaluación de daños.
- Catastro y registro de tierras: la identificación de parcelas residenciales y agrícolas ayuda a actualizar registros catastrales en zonas con crecimiento informal.
- Investigación académica: sirve como punto de partida para estudios sobre segmentación semántica en entornos urbanos de alta densidad, o como baseline para comparar con arquitecturas más modernas.

## Benchmarks y rendimiento

Se dispone de las métricas de validación del modelo en el fold 0. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0,5133 |
| mF1 | 0,6660 |
| Overall Accuracy (OA) | 0,7747 |
| Kappa | 0,6316 |

Desglose por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8073 | 0,8934 |
| Road | 0,4318 | 0,6032 |
| River | 0,4685 | 0,6380 |
| Forest | 0,5672 | 0,7239 |
| UnusedLand | 0,3177 | 0,4823 |
| Agricultural | 0,4875 | 0,6554 |

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. A partir de la arquitectura (U-Net con ResNet-50) y el tamaño de entrada (512x512), se puede estimar de forma orientativa:

- VRAM estimada para inferencia: aproximadamente 2-4 GB en FP32, reducible a 1-2 GB con FP16 o cuantización.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar la inferencia. Para entrenamiento se necesitaría más memoria (8-12 GB).
- Es posible ejecutar en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con TorchServe, FastAPI, o exportar a ONNX para inferencia optimizada. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles, pero para una imagen de 512x512 en una GPU moderna (RTX 3080) se espera una inferencia en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el valle de Katmandú; su rendimiento en otras regiones geográficas será probablemente inferior debido a diferencias en las características espectrales y de textura.
- Las clases están limitadas a seis categorías, por lo que no cubre otros tipos de uso del suelo (p. ej., zonas industriales, cuerpos de agua distintos de ríos, infraestructuras específicas).
- Las métricas de validación muestran un rendimiento débil en las clases "UnusedLand" (IoU 0,3177) y "Road" (IoU 0,4318), lo que indica posibles confusiones entre estas categorías y otras.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se han publicado detalles sobre el dataset de entrenamiento (tamaño, fuentes, balance de clases), lo que dificulta evaluar posibles sesgos.
- El modelo es un checkpoint de un experimento con split aleatorio y fold 0; no se garantiza que sea la versión final óptima.
- Al ser un modelo de segmentación, no tiene capacidades de razonamiento, generación de texto ni interacción conversacional.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validación externa.

## Enlaces

- [HuggingFace: sugam24/geonusaf-unet-r50-random-fold0](https://huggingface.co/sugam24/geonusaf-unet-r50-random-fold0)
