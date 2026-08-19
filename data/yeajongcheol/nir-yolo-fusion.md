# yeajongcheol/nir-yolo-fusion

## Resumen

El modelo `yeajongcheol/nir-yolo-fusion` es un clasificador multimodal que combina la salida de un detector de objetos YOLO (26 clases) con espectroscopía de infrarrojo cercano (NIR) de 18 canales para distinguir entre vidrio y plástico transparente (PET) en cintas de selección de residuos. Desarrollado por el usuario yeajongcheol, el modelo resuelve un problema específico de la industria del reciclaje: la separación automática de envases de vidrio y botellas PET, que presentan dificultades para los métodos ópticos convencionales debido a su transparencia.

La arquitectura es extremadamente ligera: solo 3.669 parámetros entrenables, distribuidos en un codificador espectral (SpectralEncoder), un cabezal MLP y una puerta (gate) de fusión. No incluye el backbone YOLO, sino que consume sus puntuaciones de clase como entrada adicional. El modelo está entrenado con datos recogidos en una cinta transportadora real de reciclaje y alcanza una precisión del 92,3% en el conjunto de validación (52 pares). Está licenciado bajo AGPL-3.0, en parte por la dependencia del modelo YOLO subyacente (Ultralytics).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión de salidas YOLO (26 clases) + codificador espectral NIR (18 canales) + MLP con gate |
| Parametros totales | 3.669 (entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (documentación y etiquetas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (fusion_model.pt) |

## Arquitectura y entrenamiento

El modelo combina dos flujos de entrada. Por un lado, recibe un vector de 26 puntuaciones de confianza procedentes de un detector YOLO (modelo `do1ng/few_shot`, basado en Ultralytics AGPL-3.0), que se reduce a una representación `z_rgb` de dimensión 2. Por otro lado, recibe 18 valores normalizados del sensor espectroscópico AS7265x (410-940 nm, FWHM 20 nm), que pasan por un `SpectralEncoder` para producir `z_n`. Ambos vectores se concatenan (dimensión total 4) y se introducen en un MLP con softmax que produce la probabilidad de vidrio o PET. Una puerta (gate) de un solo parámetro pondera la contribución de cada modalidad, permitiendo que el modelo dependa más del NIR cuando el YOLO no es concluyente.

El entrenamiento se realizó con datos recogidos en una cinta transportadora de reciclaje, con 52 pares de muestras etiquetadas. Se utilizó validación cruzada repetida (RepeatedStratifiedKFold 5x10) con un baseline de 0.558 (clase mayoritaria). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar. El modelo no incluye el backbone YOLO, solo sus salidas, por lo que el coste de inferencia es mínimo.

## Capacidades

- Clasificación binaria de vidrio frente a plástico transparente (PET) a partir de datos espectrales NIR y detección YOLO.
- Fusión de sensores: combina información visual (puntuaciones YOLO) con información espectral (18 canales NIR) mediante una puerta aprendida.
- Manejo de incertidumbre: si el YOLO no confirma vidrio ni PET (`yolo_in_scope=False`), el modelo puede clasificar solo con NIR.
- Entrada flexible: acepta tanto el vector completo de 26 puntuaciones YOLO como una clase específica + confianza.
- Inferencia extremadamente ligera (3.669 parámetros), apta para despliegue en CPU o dispositivos embebidos.
- Incluye utilidades de autoevaluación (`selftest.py`) y datos de ejemplo.

## Casos de uso

- **Clasificación en plantas de reciclaje**: el modelo puede integrarse en un sistema de cinta transportadora que combine un detector YOLO (para localizar objetos) con un sensor AS7265x (para leer el espectro NIR). Permite separar automáticamente botellas de vidrio y botellas PET, reduciendo la necesidad de clasificación manual.
- **Control de calidad en líneas de envasado**: en fábricas que producen envases de vidrio o PET, el modelo puede verificar que los envases que pasan por la línea son del material correcto, detectando contaminaciones cruzadas.
- **Sistemas de reciclaje inteligente en puntos limpios**: instalado en contenedores de reciclaje con sensores, el modelo puede indicar al usuario si un envase es de vidrio o PET antes de depositarlo, mejorando la separación en origen.
- **Investigación en fusión de sensores**: como modelo de referencia de bajo coste, sirve para estudiar técnicas de fusión entre visión por computador y espectroscopía, especialmente en entornos industriales con recursos limitados.
- **Educación y prototipado**: por su pequeño tamaño y código autocontenido, es útil como ejemplo didáctico de cómo combinar múltiples modalidades en un clasificador ligero con PyTorch.
- **Automatización de auditorías de residuos**: en estudios de caracterización de residuos sólidos, el modelo puede ayudar a clasificar rápidamente muestras de vidrio y PET en laboratorio, complementando métodos manuales.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de validación cruzada (RepeatedStratifiedKFold 5x10, 52 pares, baseline 0.558):

| Subconjunto | Exactitud |
|---|---|
| YOLO confirma vidrio/PET (46 casos) | 0,957 |
| YOLO sin detección (6 casos) | 0,667 |
| Total (52 casos) | 0,923 |
| NIR solo (93 filas nuevas, validación cruzada anidada) | 0,693 (baseline 0,516, SNV → PCA12 → SVM) |

No se han publicado resultados de benchmarks comparativos con otros modelos de clasificación de residuos en la información disponible.

## Requisitos de hardware

- El modelo de fusión en sí es minúsculo (3.669 parámetros) y puede ejecutarse en cualquier CPU, incluso en microcontroladores con soporte para PyTorch o ONNX (si se exporta).
- El pipeline completo requiere el detector YOLO (`do1ng/few_shot`), que sí necesita GPU para una inferencia en tiempo real. Se recomienda una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650 o superior) para el YOLO.
- El sensor AS7265x se conecta por I2C/SPI a un microcontrolador (Arduino, Raspberry Pi) que debe enviar los datos al sistema.
- Opciones de despliegue: el modelo se proporciona como archivo `.pt` de PyTorch; puede cargarse con la API `FusionPredictor` o exportarse a ONNX para inferencia en producción. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplica, no es un LLM).
- La latencia de inferencia del modelo de fusión es del orden de microsegundos en CPU; el cuello de botella es el YOLO (típicamente 10-30 ms en GPU).

## Comparativa con modelos similares

No se dispone de modelos comparables directamente (misma tarea y misma combinación de sensores) en la información proporcionada. Como referencia, la model card cita un estudio previo que clasificó 6 tipos de plástico con el mismo sensor AS7265x con una precisión del 72,5% (Sensors, MDPI). El modelo aquí presentado supera ese resultado en la tarea binaria vidrio/PET, pero no es directamente comparable por la diferencia de alcance.

## Limitaciones y advertencias

- El modelo solo distingue entre vidrio y PET transparente. No clasifica otros plásticos (poliestireno, bolsas, contenedores sellados, etc.) y los descarta mediante `yolo_in_scope=False`.
- El sensor AS7265x no alcanza la banda de absorción principal del PET (~1660 nm), solo la tercera armónica, lo que limita la precisión espectral en algunos casos.
- La normalización de los datos espectrales depende del entorno de recogida; si se usa en otra planta o condiciones, es necesario recalcular las estadísticas de estandarización.
- El rendimiento en el subconjunto sin detección YOLO es notablemente inferior (0,667), lo que indica que la fusión depende en gran medida de la calidad del detector.
- Licencia AGPL-3.0: cualquier uso comercial o modificación debe cumplir con los términos de copyleft, incluyendo la distribución del código fuente si se ofrece como servicio en red.
- El repositorio de HuggingFace tiene un tamaño de 0.0 GB y 0 descargas, lo que sugiere que los archivos del modelo podrían no estar subidos o el repo está vacío. Se recomienda verificar la disponibilidad real de los pesos antes de planificar un despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yeajongcheol/nir-yolo-fusion)
- [Modelo YOLO base (do1ng/few_shot)](https://huggingface.co/do1ng/few_shot)
- [Estudio previo con sensor AS7265x para clasificación de plásticos (Sensors, MDPI)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11086069/)
