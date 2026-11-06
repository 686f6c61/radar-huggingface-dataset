# Zhnivo/text-type-classifier-resnet18

## Resumen

El modelo `Zhnivo/text-type-classifier-resnet18` es un clasificador binario de imágenes que distingue entre texto manuscrito y texto impreso en recortes de líneas de texto. Lo desarrolla Zhnivo, una iniciativa que construye bases de datos genealógicas a partir de registros de archivo bielorrusos, y se concibe como una etapa de preprocesado dentro de un pipeline de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) en el que los escaneos mezclan contenido mecanografiado o impreso con escritura a mano.

La arquitectura es una ResNet-18 de torchvision con la capa totalmente conectada final sustituida por una cabeza de dos clases. Se entrenó sobre aproximadamente 73 000 recortes de líneas de texto procedentes de documentos de archivo escaneados, en ruso moderno, ruso pre-reforma (ortografía antigua), bielorruso, inglés, polaco, alemán y otras lenguas europeas. El modelo es muy ligero (repo de 0,1 GB) y está pensado para ejecutarse en CPU sin necesidad de GPU.

Su relevancia práctica radica en que resuelve un problema de enrutamiento concreto: en colecciones de archivo heterogéneas, cada tipo de texto debe enviarse a un reconocedor especializado (TrOCR, Tesseract, PaddleOCR), y clasificar automáticamente las líneas evita la separación manual y mantiene limpios los conjuntos de entrenamiento de cada reconocedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (torchvision), cabeza fully-connected de 2 clases |
| Parametros totales | no disponible (ResNet-18 estándar con cabeza de 2 clases; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 128×512 px) |
| Tipos de cuantizacion | no disponible (pesos en `state dict` PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | ruso moderno, ruso pre-reforma, bielorruso, inglés, polaco, alemán y otras lenguas europeas |
| Licencia | MIT (la arquitectura ResNet-18 y torchvision son BSD-3-Clause) |
| Formato de pesos | `.pth` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo es una ResNet-18 convolucional estándar de torchvision, sin modificaciones en el tronco, a la que se reemplaza la capa `fc` por una `nn.Linear` de 2 salidas. La entrada es un recorte RGB de línea de texto redimensionado a 128×512 píxeles (alto × ancho) y normalizado con la media y desviación típica de ImageNet (`[0.485, 0.456, 0.406]` / `[0.229, 0.224, 0.225]`). Las clases son `0 → handwritten` y `1 → printed`.

El entrenamiento se realizó sobre unos 73 000 recortes de líneas de documentos de archivo escaneados: 61 942 para entrenamiento (25 665 manuscritos y 36 277 impresos) y 11 050 para validación (4 544 manuscritos y 6 506 impresos). No se documentan en la información disponible el número de épocas, la función de pérdida, el optimizador ni si hubo aumentación de datos o ajuste fino adicional. El autor publica curvas de pérdida (`loss_history.png`) y el mejor checkpoint por pérdida de validación (`best_model.pth`), pero no se han facilitado sus valores numéricos.

## Capacidades

- Clasificación binaria de imágenes de líneas de texto en manuscrito o impreso.
- Funciona sobre recortes de línea horizontal, no sobre páginas completas ni caracteres aislados.
- Cubre varios alfabetos y lenguas europeas en escritura cirílica y latina (ruso moderno y pre-reforma, bielorruso, inglés, polaco, alemán).
- Inferencia en CPU: aproximadamente 28 líneas por segundo (unas 100 000 por hora) en un portátil con AMD Ryzen 7 y 6 hilos.
- Integrable como etapa de preprocesado o de enrutamiento en pipelines de OCR/HTR.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de la imagen.

## Casos de uso

- Preparación de datasets para entrenamiento de OCR/HTR: separar automáticamente grandes colecciones de recortes de línea en subconjuntos manuscrito e impreso antes de entrenar TrOCR, Tesseract o PaddleOCR, evitando la clasificación manual y la contaminación cruzada de los datos de cada reconocedor.
- Enrutamiento en tiempo de inferencia: tras una etapa de detección de texto, clasificar cada recorte y enviarlo al reconocedor especializado correspondiente (modelo HTR para manuscrito, motor OCR para impreso).
- Análisis de corpus de archivo: estimar la proporción de contenido manuscrito frente a impreso en una colección escaneada, por ejemplo para priorizar qué documentos requieren revisión manual.
- Digitalización de registros genealógicos: en el contexto del proyecto Zhnivo, procesar libros parroquiales y registros civiles con formularios impresos rellenados a mano y separar ambas capas de texto.
- Filtrado de calidad en pipelines documentales: descartar o marcar recortes que no corresponden al tipo esperado antes de pasarlos a un reconocedor, reduciendo errores en cadena.
- Despliegue en entornos sin GPU: al ejecutarse en CPU a unas 28 líneas por segundo, es viable en servidores modestos o portátiles para lotes de decenas de miles de líneas por hora.
- Prototipado rápido de sistemas de archivo: al ser un modelo pequeño con licencia MIT, sirve como componente base en pruebas de concepto de digitalización sin coste de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el tamaño de los conjuntos de entrenamiento y validación y la velocidad de inferencia en CPU (unas 28 líneas por segundo en un AMD Ryzen 7 con 6 hilos), sin métricas de exactitud, precisión, recall ni F1 sobre el conjunto de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base; el modelo está pensado para CPU. En GPU, una ResNet-18 con entrada 128×512 ocupa una fracción mínima de memoria (del orden de cientos de MB incluyendo activaciones), aunque el autor no publica cifras.
- GPU recomendadas: no disponibles; cualquier GPU con soporte CUDA para PyTorch puede ejecutarlo, pero no es necesario.
- Cabe en cualquier GPU de consumo e incluso en CPU: el autor reporta unas 28 líneas por segundo en un AMD Ryzen 7 de 6 hilos.
- Opciones de despliegue: PyTorch/torchvision nativo (carga del `state dict`), exportación a TorchScript u ONNX no documentada por el autor; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: aproximadamente 28 líneas por segundo (unas 100 000 por hora) en CPU de portátil según el autor; no se publican cifras en GPU.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Zhnivo/text-type-classifier-resnet18 | Clasificación manuscrito/impreso | ResNet-18 | no disponible | ru, be, en, pl, de y otras europeas | MIT | Hugging Face |
| VItaldob/text-type-classifier-resnet18 | Clasificación manuscrito/impreso | ResNet-18 | no disponible | no disponible en la información recogida | no disponible | Hugging Face |
| Otros clasificadores manuscrito/impreso | Clasificación binaria de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web solo devuelve una réplica aparente del mismo modelo publicada bajo el identificador `VItaldob/text-type-classifier-resnet18`, con la misma descripción y el mismo nombre de fichero de pesos. No se han identificado en la información disponible alternativas independientes comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado con lenguas europeas en escritura cirílica y latina; la precisión puede degradarse en otros sistemas de escritura (CJK, árabe) o en fotografías de baja calidad.
- Espera recortes de líneas de texto; las páginas completas y las regiones sin texto quedan fuera del alcance previsto.
- Salida binaria única: las líneas mixtas (formulario impreso con relleno manuscrito en el mismo recorte) se asignan a una sola clase, lo que puede producir errores en documentos de este tipo.
- No se publican métricas de exactitud, precisión, recall ni F1, por lo que no es posible cuantificar su fiabilidad antes de desplegarlo.
- Riesgo de sesgo hacia los dominios de archivo bielorrusos y europeos representados en el conjunto de entrenamiento; el rendimiento en otros tipos de documento no está documentado.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en recortes ambiguos o degradados.
- Licencia MIT: permite uso comercial, modificación y redistribución; la arquitectura ResNet-18 y la implementación de torchvision son BSD-3-Clause, compatible con esta release.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhnivo/text-type-classifier-resnet18
- Réplica o variante con otro identificador: https://huggingface.co/VItaldob/text-type-classifier-resnet18
- Pesos del modelo (réplica): https://huggingface.co/VItaldob/text-type-classifier-resnet18/blob/main/resnet18_text_classifier_final.pth
- Iniciativa Zhnivo: https://zhnivo.com/en/
