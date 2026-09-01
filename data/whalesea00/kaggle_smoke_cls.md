# WhaleSea00/kaggle_smoke_cls

## Resumen

El modelo `WhaleSea00/kaggle_smoke_cls` es un clasificador de imágenes binario que determina si una persona es fumadora o no fumadora a partir de una fotografía. Desarrollado por WhaleSea00, emplea una arquitectura ResNet34 preentrenada en ImageNet y la ajusta mediante LoRA (Low-Rank Adaptation), una técnica de fine-tuning eficiente que solo entrena el 2,14 % de los parámetros totales. El modelo se entrenó sobre el dataset público de Kaggle "Smoking Detection Dataset" (1 120 imágenes) y alcanza una precisión del 91,07 % en el conjunto de test, con un F1-score de 91,23 % para la clase fumador. Su relevancia radica en la combinación de un modelo ligero y un método de ajuste paramétricamente eficiente, lo que lo hace adecuado para despliegues con recursos limitados y para servir como punto de partida en tareas similares de clasificación de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 + adaptadores LoRA |
| Parametros totales | 21,7 millones |
| Parametros entrenables | 465 000 (2,14 %) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente PyTorch .bin o .safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en una ResNet34 preentrenada en ImageNet, cuyas capas iniciales (conv1, layer1 y layer2) permanecen congeladas. Sobre las capas layer3 y layer4 se insertan adaptadores LoRA con rango 8, y la cabeza de clasificación original se reemplaza por una capa fully connected de 512 a 2 salidas. El entrenamiento se realizó con el dataset de Kaggle mencionado, dividido en 64 % entrenamiento (716 imágenes), 16 % validación (180) y 20 % test (224). Se usaron 20 épocas, un optimizador AdamW con learning rate 1e-4 y weight decay 1e-4, y un batch size de 32. No se aplicaron técnicas de RLHF ni DPO; es un fine-tuning supervisado estándar. El proceso completo tardó unos 15 minutos en una GPU T4 de Kaggle.

## Capacidades

- Clasificación binaria de imágenes: distingue entre "fumador" y "no fumador".
- Modelo de visión puro, sin capacidades de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta entrada multimodal ni procesamiento de audio o vídeo.
- Al estar basado en ResNet34, hereda las características de extracción de características visuales de ImageNet, aunque adaptadas a la tarea específica.

## Casos de uso

- Control de cumplimiento en zonas de no fumadores: el modelo puede integrarse en sistemas de videovigilancia para detectar automáticamente si una persona está fumando en áreas donde está prohibido, como hospitales, aeropuertos o estaciones de servicio. Su baja latencia y tamaño reducido permiten ejecutarlo en dispositivos perimetrales.
- Moderación de contenido en plataformas digitales: se puede utilizar para filtrar imágenes que muestren a personas fumando, por ejemplo en redes sociales o foros con políticas restrictivas sobre tabaco. La clasificación binaria simplifica la integración en pipelines de moderación.
- Estudios epidemiológicos y de salud pública: a partir de fotografías de espacios públicos, el modelo puede estimar la prevalencia de tabaquismo visible, ayudando a investigadores a recopilar datos de campo de forma automatizada.
- Verificación de identidad en seguros o trámites: en procesos donde se requiere confirmar que una persona no es fumadora (p. ej., pólizas de salud), el modelo puede analizar imágenes de identificación o selfies para apoyar la decisión, aunque debe usarse con cautela por posibles sesgos.
- Automatización de control de calidad en fotografía: en bancos de imágenes o agencias de stock, el modelo puede etiquetar automáticamente si una foto contiene a una persona fumando, facilitando la organización y búsqueda de contenido.
- Base para fine-tuning en tareas relacionadas: al ser un modelo pequeño y con licencia MIT, puede servir como punto de partida para adaptarlo a otras tareas de clasificación de objetos o escenas, reutilizando los adaptadores LoRA.

## Benchmarks y rendimiento

Según la model card, los resultados reportados son los siguientes:

| Split | Accuracy | F1-Score (clase fumador) |
|---|---|---|
| Validación | 96,67 % | No disponible |
| Test | 91,07 % | 91,23 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: al tratarse de una ResNet34 con 21,7 millones de parámetros, el modelo es ligero. En FP32, la huella de memoria ronda los 87 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU con tiempos de inferencia aceptables (del orden de decenas de milisegundos por imagen).
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 Ti (4 GB) en adelante, es suficiente. Para despliegues masivos se recomienda una T4 o superior.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede exportarse a ONNX o TorchScript para servir con frameworks como TorchServe, ONNX Runtime o incluso en soluciones embebidas. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamaño del modelo se estima una latencia de 5-15 ms por imagen en una GPU T4 y un throughput de varias decenas de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card ni en los resultados de búsqueda. No se pueden establecer comparaciones objetivas con otros modelos de detección de fumadores o clasificación de imágenes similares.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (1 120 imágenes), lo que puede limitar la generalización a entornos, iluminaciones, ángulos o etnias no representados en los datos.
- La clasificación es binaria y no distingue entre tipos de tabaco, cigarrillos electrónicos u otros objetos similares que puedan confundirse con un cigarrillo.
- No se han documentado pruebas de robustez frente a oclusiones, desenfoque o variaciones extremas de pose.
- El modelo puede presentar sesgos derivados de la composición del dataset original de Kaggle, aunque no se especifican detalles demográficos.
- La licencia MIT permite uso comercial, pero el dataset subyacente (de Kaggle) puede tener sus propias restricciones de uso; se recomienda revisar los términos de la fuente de datos.
- No se proporcionan garantías de precisión en entornos de producción; se recomienda validar el modelo con datos propios antes de un despliegue crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhaleSea00/kaggle_smoke_cls
- Dataset de Kaggle: https://www.kaggle.com/datasets/sujaykapadnis/smoking?resource=download
