# sugam24/geonusaf-unet-r50-block-fold2

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por el usuario sugam24. Está diseñado específicamente para la clasificación del uso del suelo en el valle de Katmandú, Nepal, identificando seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo emplea una arquitectura U-Net con encoder ResNet-50 preentrenado en ImageNet, y se ha entrenado con un esquema de división en bloques (block split) con tres pliegues; esta ficha corresponde al pliegue 2 de 3. El repositorio tiene un tamaño de 4,4 GB e incluye el checkpoint `best.pt` con los pesos del modelo, la configuración y las métricas de validación.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana, la gestión de recursos naturales y el monitoreo ambiental en regiones con características geográficas similares. Aunque no se especifican detalles sobre el conjunto de datos de entrenamiento, las métricas de validación muestran un rendimiento moderado, con una precisión global del 84,77% y un IoU medio de 0,4837. El modelo está implementado con la librería `segmentation-models-pytorch` y se distribuye sin información sobre licencia, lo que limita su uso comercial sin autorización explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (smp.Unet) con encoder ResNet-50 preentrenado en ImageNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint `best.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clásica, con un encoder ResNet-50 preentrenado en ImageNet y un decoder que produce mapas de segmentación para seis clases. La entrada son imágenes de 512x512 píxeles normalizadas con la media y desviación estándar de ImageNet, y la resolución efectiva es de 0,586 metros por píxel. El entrenamiento se realizó con un esquema de validación cruzada por bloques (block split) en tres pliegues, utilizando la semilla 42. El pliegue 2 alcanzó su mejor rendimiento en la época 47, con un IoU medio de 0,4837 y una precisión global de 0,8477. No se proporcionan detalles sobre el número de imágenes, la composición del dataset ni técnicas de aumento de datos. Tampoco se mencionan innovaciones arquitectónicas más allá de la combinación U-Net + ResNet-50.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de seis categorías de uso del suelo.
- Detección de áreas residenciales, carreteras, ríos, bosques, suelo no utilizado y terrenos agrícolas.
- Procesamiento de imágenes de alta resolución (GSD efectivo de 0,586 m/px) con entrada de 512x512 píxeles.
- No soporta generación de texto, razonamiento, código, tool calling ni capacidades multimodales más allá de la visión.
- No se especifican capacidades multilingües ni de agentes.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas de uso del suelo para identificar zonas residenciales y carreteras, facilitando la toma de decisiones en el desarrollo de infraestructuras.
- Monitoreo ambiental: la clasificación de bosques y ríos permite evaluar cambios en la cobertura vegetal y los recursos hídricos a lo largo del tiempo.
- Gestión agrícola: la detección de terrenos agrícolas ayuda a estimar superficies de cultivo y planificar políticas de seguridad alimentaria.
- Catastro y gestión de tierras: la identificación de suelo no utilizado puede apoyar la regularización de terrenos y la detección de ocupaciones informales.
- Respuesta a desastres: la segmentación de carreteras y ríos es útil para planificar rutas de evacuación y evaluar daños tras inundaciones o deslizamientos.
- Investigación académica: sirve como referencia para comparar arquitecturas de segmentación en entornos urbanos de alta densidad, como el valle de Katmandú.

## Benchmarks y rendimiento

Se han publicado métricas de validación para el pliegue 2, obtenidas en la época 47. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| mIoU (validación) | 0,4837 |
| mF1 (validación) | 0,6276 |
| Precisión global (OA) | 0,8477 |
| Kappa | 0,6390 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8760 | 0,9339 |
| Road | 0,4075 | 0,5791 |
| River | 0,4177 | 0,5893 |
| Forest | 0,4689 | 0,6384 |
| UnusedLand | 0,1941 | 0,3251 |
| Agricultural | 0,5383 | 0,6998 |

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- El checkpoint tiene un tamaño de 4,4 GB, lo que sugiere que la inferencia requiere una GPU con al menos 8-12 GB de VRAM para cargar los pesos y procesar imágenes de 512x512.
- Se recomienda una GPU de gama media-alta (por ejemplo, RTX 3060 o superior) para un rendimiento fluido en inferencia.
- Para despliegue en producción, se puede utilizar cualquier framework que soporte PyTorch, como TorchServe, o convertir el modelo a ONNX para optimización.
- No se indican opciones de cuantización ni soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación semántica en la documentación proporcionada. El autor no ha publicado benchmarks frente a alternativas como DeepLabV3, SegNet o PSPNet. Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el valle de Katmandú; su generalización a otras regiones geográficas puede ser limitada.
- El rendimiento en la clase "UnusedLand" es notablemente bajo (IoU 0,1941), lo que indica dificultades para distinguir este tipo de terreno.
- No se especifica la licencia, por lo que el uso comercial requiere contactar con el autor para obtener permisos.
- No se documentan sesgos potenciales, pero al ser un modelo entrenado con datos de una región concreta, puede reflejar las características particulares de esa zona.
- No se proporcionan detalles sobre el conjunto de datos de entrenamiento, lo que dificulta evaluar posibles desequilibrios de clases o sesgos de muestreo.
- El modelo no es adecuado para tareas fuera de la segmentación semántica de imágenes de teledetección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unet-r50-block-fold2
- Pliegue 0 del mismo modelo: https://huggingface.co/sugam24/geonusaf-unet-r50-block-fold0
- Lista de modelos con etiqueta geonusaf: https://huggingface.co/models?other=geonusaf
