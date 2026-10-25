# WEFF12/AGCR-DETR

## Resumen

AGCR-DETR es el código de un detector de objetos basado en RT-DETR-L (la variante *large* de la familia RT-DETR de Ultralytics) especializado en la detección de defectos superficiales en rodamientos. Lo publica el usuario WEFF12 en HuggingFace como *code-only release*: el repositorio contiene la implementación de las dos contribuciones (el módulo de atención APDCCM-Lite y la pérdida de supervisión SGCR), los puntos de entrada de entrenamiento, evaluación e inferencia, y un script de verificación en CPU; no incluye pesos entrenados, checkpoints de inicialización, datasets, anotaciones, predicciones ni resultados experimentales.

La relevancia del proyecto es acotada y muy específica: no es un modelo listo para usar, sino material de reproducción para investigadores de visión por computador interesados en dos técnicas concretas. APDCCM-Lite es un *gating* de características que combina un canal de amplitud media absoluta con un canal espacial derivado de la magnitud del gradiente de Sobel, y SGCR es una pérdida de ranking competitivo con ponderación por calidad que se aplica únicamente durante el entrenamiento sin añadir parámetros en inferencia. El interés práctico está en la inspección visual automatizada de componentes mecánicos, no en tareas de lenguaje.

Al tratarse de un artefacto de código sin pesos ni métricas publicadas, cualquier evaluación de rendimiento real exige que el usuario aporte su propio *checkpoint* de inicialización RT-DETR-L (COCO) y su propio dataset etiquetado en formato YOLO. La licencia AGPL-3.0, heredada de Ultralytics, es un condicionante fuerte para uso comercial en producto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR-L de Ultralytics (detector transformer end-to-end con codificador híbrido eficiente y decodificador con atención deformable), extendido con el módulo APDCCM-Lite sobre las características C3 y C4 |
| Parametros totales | No disponible. El autor solo documenta que APDCCM-Lite añade 165.908 parámetros sobre el grafo RT-DETR-L; el total del modelo base no se indica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de visión, entrada de imagen de 640 píxeles durante el entrenamiento) |
| Tipos de cuantizacion | No disponible. Solo se documenta AMP (FP16) durante el entrenamiento con GradScaler inicial de 128, y FP32 en validación y en los pesos guardados. No se mencionan exportaciones INT8, ONNX o TensorRT |
| Idiomas soportados | No disponible / no aplica (detección de objetos; no procesa texto) |
| Licencia | AGPL-3.0 (ver `LICENSE` y `NOTICE.md` en el repositorio) |
| Formato de pesos | No se distribuyen pesos. El código genera checkpoints PyTorch `best.pt` y `last.pt` al finalizar el entrenamiento, en FP32 |
| Numero de clases | Cuatro clases en el modelo principal (el autor no detalla sus nombres); el fichero `configs/data.example.yaml` es editable |
| Entrada | Imágenes con redimensionado a 640 píxeles durante el entrenamiento |
| Libreria / dependencias | Ultralytics 8.3.235 (fijada), PyTorch 2.7.1+cu118 en el entrenamiento archivado, Python 3.10 o superior |

## Arquitectura y entrenamiento

La base es el grafo RT-DETR-L de Ultralytics, un detector *end-to-end* de la familia DETR que sustituye las consultas objeto aprendidas por un esquema de selección de consultas guiado por incertidumbre y que emplea un codificador híbrido eficiente en lugar del *encoder* transformer completo. Sobre esa base, el autor inserta APDCCM-Lite de forma independiente en las características C3 y C4, antes de las proyecciones 1×1 originales (capas 19 y 14 del RT-DETR-L de Ultralytics). El módulo combina un *gating* por canal con una puerta espacial calculada a partir de la amplitud media absoluta y de la magnitud del gradiente de Sobel, y aplica después un factor de escalado residual aprendible. La segunda contribución, SGCR (*Spatially Guarded Competitive Ranking*), añade una pérdida de ranking ponderada por calidad sobre la salida final del decodificador no-denoising durante el entrenamiento: compara la clase emparejada con competidoras inter-clase elegibles y con fondos cercanos no emparejados, dejando la geometría y el emparejamiento en `detach` de modo que los gradientes fluyan solo por las probabilidades seleccionadas. Las pérdidas originales de RT-DETR, el emparejamiento y toda la estructura de inferencia se mantienen intactos; SGCR no introduce parámetros en inferencia y APDCCM-Lite aporta 165.908 parámetros entrenables.

La receta de entrenamiento documentada en `configs/train.yaml` es: semilla 42, entrada de 640 píxeles, tamaño de lote 4, optimizador AdamW, un máximo de 100 épocas con paciencia de 40, AMP con GradScaler inicial de 128, validación y guardado en FP32, y selección del mejor estado por mAP50-95 de validación. La inicialización de APDCCM usa una semilla interna propia (42001) que no avanza el flujo RNG del *baseline*. El entrenamiento está pensado para una única GPU CUDA. No se publica el número de tokens ni de imágenes de entrenamiento, la composición del dataset, ni si hubo aumento de datos más allá de lo que aplique Ultralytics; tampoco procede hablar de RLHF o DPO, ya que no es un modelo generativo de lenguaje. Un detalle operativo relevante: el paquete solo escribe `best.pt` y `last.pt` al completarse el entrenamiento, por lo que una ejecución interrumpida no deja fichero de reanudación.

## Capacidades

- Detección de objetos con cajas delimitadoras y puntuaciones de confianza sobre imágenes, orientada a defectos superficiales en rodamientos.
- Localización de cuatro clases de defecto definidas por el usuario mediante etiquetas YOLO con identificadores de clase basados en cero y filas normalizadas `class x_center y_center width height`.
- Detección *end-to-end* sin NMS añadido: la evaluación usa el validador RT-DETR con escalado de cajas por eje y sin supresión no máxima adicional.
- Entrenamiento *fine-tuning* desde un *checkpoint* RT-DETR-L COCO aportado por el usuario, con reanudación no soportada.
- Verificación de integridad del modelo en CPU mediante `smoke_check.py`, que comprueba construcción, *forward* y gradiente de la pérdida con tensores aleatorios, sin pesos ni datos.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, ni generación de texto.
- No tiene capacidades multilingües, de visión-lenguaje, audio ni modo *thinking*: es exclusivamente un detector visual.
- No incluye variantes de ablación, modelos de comparación ni archivos de experimentos.

## Casos de uso

- Inspección visual automatizada en línea de producción de rodamientos: el detector se entrenaría con imágenes de la línea y devolvería cajas y confianza por defecto, integrándose en un sistema de rechazo automático de piezas; el pipeline de inferencia es el *predictor* estándar de RT-DETR, que ya guarda las puntuaciones de confianza.
- Control de calidad con datos propios en plantas donde no se pueden compartir imágenes: al ser una *release* solo de código, la organización entrena localmente con su dataset y no depende de pesos de terceros, lo que simplifica el cumplimiento de confidencialidad industrial.
- Reproducción y extensión de investigación: sirve como base para estudiar el efecto de APDCCM-Lite (gating amplitud-gradiente) y de SGCR (ranking competitivo con fondo cercano) sobre un detector DETR, modificando `project_models/` y los cinco ficheros de integración de *trainer* y *validator*.
- *Benchmarking* interno de detectores: al conservar las pérdidas, el emparejamiento y la estructura de inferencia originales de RT-DETR, permite comparar de forma controlada contra la línea base RT-DETR-L con el mismo dataset y la misma receta (640 px, lote 4, AdamW, 100 épocas).
- Detección de defectos en otros dominios industriales con textura metálica: el uso de magnitud de gradiente de Sobel en la puerta espacial está motivado por bordes y cambios de contraste, un patrón habitual en grietas, rayones y marcas de mecanizado, por lo que el módulo es reutilizable en superficies metálicas similares.
- Preliminar de etiquetado y anotación asistida: un modelo entrenado con este código puede generar detecciones sobre imágenes nuevas para acelerar el etiquetado humano y realimentar el dataset, revisando manualmente las cajas antes de incorporarlas.
- Docencia y formación técnica: el paquete incluye un `smoke_check.py` que valida la conexión del modelo y el gradiente de la pérdida en CPU, útil en entornos sin GPU para explicar cómo se integra una pérdida auxiliar en un *trainer* de Ultralytics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la *release* no incluye predicciones, resultados experimentales ni archivos del manuscrito, y que las comprobaciones de la versión (construcción, *forward* y gradiente de la pérdida con PyTorch 2.11.0 y Ultralytics 8.3.235 en CPU) no constituyen un entrenamiento completo ni una medición de precisión de detección. La única métrica documentada es de procedimiento: la selección del mejor *checkpoint* se hace por mAP50-95 de validación, pero su valor no se publica.

## Requisitos de hardware

- VRAM de inferencia: no publicada por el autor. Como referencia de la clase de modelo (RT-DETR-L a 640 píxeles), una GPU de 8-12 GB permite inferencia en FP32 con lotes pequeños; son estimaciones orientativas, no verificadas en esta *release*.
- VRAM de entrenamiento: no publicada. La configuración documentada es lote 4 a 640 píxeles con AMP (FP16) sobre una única GPU CUDA; por el tamaño del modelo y del lote, una GPU de 16-24 GB es un punto de partida razonable, pero el autor no lo confirma.
- GPU recomendadas: no especificadas. El entrenamiento archivado usó CUDA 11.8 (PyTorch 2.7.1+cu118); sirve cualquier GPU NVIDIA compatible con esa build. No hay datos para A100, H100 ni RTX 4090 en esta información.
- GPU de consumo: el modelo cabe con holgura en GPUs consumer de gama media-alta para inferencia; el entrenamiento con lote 4 y AMP es viable en tarjetas de 16 GB o más, sujeto a verificación empírica.
- CPU: soportada para `smoke_check.py` y para evaluación o predicción con `--device cpu`, a costa de latencia mucho mayor.
- Opciones de despliegue: el repositorio ofrece `train.py`, `evaluate.py` y `predict.py` sobre Ultralytics 8.3.235. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, TGI, llama.cpp u Ollama (no aplican a un detector). Cualquier ruta de despliegue alternativa tendría que validarla el usuario.
- Latencia y rendimiento: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGCR-DETR (WEFF12) | No disponible (RT-DETR-L + 165.908) | Imagen 640 px | Sin métricas publicadas | AGPL-3.0 | Solo código en HuggingFace, sin pesos |
| RT-DETR-L (Ultralytics) | No disponible en esta información | Imagen 640 px | Métricas COCO publicadas por Ultralytics, no incluidas aquí | AGPL-3.0 | Pesos y código disponibles |
| YOLO11 / YOLOv8 en variante L (Ultralytics) | No disponible en esta información | Imagen 640 px | Métricas COCO publicadas por Ultralytics, no incluidas aquí | AGPL-3.0 | Pesos y código disponibles |
| Deformable DETR | No disponible en esta información | Imagen, resolución variable | Métricas COCO publicadas en su paper, no incluidas aquí | Apache-2.0 (según implementación) | Pesos y código disponibles |

La comparación cuantitativa no es posible con los datos aportados: AGCR-DETR no publica mAP ni curva de entrenamiento, y las cifras de los modelos alternativos no forman parte de la información proporcionada. La diferencia práctica principal es la disponibilidad: los tres alternativos se distribuyen con pesos listos para inferencia, mientras que AGCR-DETR exige entrenamiento propio.

## Limitaciones y advertencias

- No se distribuyen pesos entrenados, inicializaciones, datasets, anotaciones ni resultados: el repositorio no permite inferencia directa *out of the box*.
- Sin métricas publicadas, no hay evidencia verificable de que APDCCM-Lite y SGCR mejoren a la línea base RT-DETR-L en ningún dataset; la carga de validación recae por completo en el usuario.
- El alcance declarado son defectos superficiales en rodamientos con cuatro clases; el rendimiento fuera de ese dominio (otras texturas, iluminaciones o escalas) es desconocido.
- Dependencia dura de Ultralytics 8.3.235: la extensión usa su grafo RT-DETR y sus interfaces de entrenamiento, por lo que actualizar la librería puede romper la integración de los cinco ficheros de *trainer* y *validator*.
- El entrenamiento no genera fichero de reanudación: `best.pt` y `last.pt` solo se escriben al finalizar, de modo que una interrupción implica repetir el proceso.
- El punto de entrada de entrenamiento no evalúa automáticamente el conjunto de test; hay que ejecutar `evaluate.py --split test` de forma separada para evitar fuga de información.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: al no haber NMS añadido ni umbral calibrado publicado, el umbral de confianza (`--conf`, por defecto 0.25 en el ejemplo) debe ajustarse empíricamente para cada línea de producción.
- Sesgos: no documentados. Al ser un detector entrenado con datos propios del usuario, los sesgos dependerán de la composición de ese dataset (tipo de rodamiento, condiciones de captura, balance de clases).
- Licencia AGPL-3.0: impone obligaciones de liberación del código fuente a quien ofrezca el servicio en red; es un obstáculo relevante para integrar el modelo en productos propietarios o en servicios SaaS sin revisión legal.
- Solo se deben cargar *checkpoints* de fuentes de confianza, tal como advierte el propio autor; el formato `.pt` de PyTorch permite ejecución de código al deserializar.
- Idiomas y contexto: no aplica, pero conviene subrayar que no es un modelo de lenguaje y no puede usarse para tareas de texto, agentes o razonamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WEFF12/AGCR-DETR
- RT-DETR de Ultralytics (base del proyecto): https://github.com/ultralytics/ultralytics
- Ficheros de licencia y atribución dentro del repositorio: `LICENSE` y `NOTICE.md` (accesibles desde el clonado del repositorio)
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales relevantes para este modelo.
