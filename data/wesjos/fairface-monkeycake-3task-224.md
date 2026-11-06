# wesjos/fairface-monkeycake-3task-224

## Resumen

FairFace-MonkeyCake-3Task-224 es un modelo de clasificación de imágenes especializado en atributos faciales, desarrollado por el usuario wesjos. Se trata de un fine-tuning del backbone EVA02-L/14 (MIM-22K) de timm sobre el conjunto de datos FairFace, y predice simultáneamente tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos etarios). Con 303 millones de parámetros y entrada RGB de 224x224 píxeles, el modelo se posiciona como un clasificador multi-tarea de una sola pasada, lo que evita ejecutar tres modelos independientes.

El modelo resuelve el problema de la clasificación demográfica facial equilibrada, un área clásica en la medición de sesgos algorítmicos. FairFace se diseñó precisamente para corregir el desequilibrio racial y de género de datasets previos, y este checkpoint reentrena el backbone EVA02 sobre una versión deduplicada por SHA-256 del dataset, con particiones disjuntas de entrenamiento (77.926 imágenes), selección (8.659) y test (10.931). El autor lo describe explícitamente como modelo "teacher" de referencia, orientado a benchmarking offline más que a despliegue en tiempo real.

Es relevante ahora porque los auditores de sesgo necesitan clasificadores de atributos faciales con métricas desagregadas y reproducibles. Este modelo publica accuracy y macro-F1 por tarea, además de MAE para la edad, lo que facilita comparaciones rigurosas. La licencia CC BY 4.0 permite uso comercial con atribución, aunque la model card restringe el uso a investigación y auditoría de equidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA02-L/14 (ViT con atención, preentrenado con MIM-22K), fine-tuning multi-cabeza |
| Parametros totales | 303.286.225 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas del dataset en inglés) |
| Licencia | cc-by-4.0 (backbone Apache-2.0) |
| Formato de pesos | PyTorch (`model.pt`), librería pytorch + timm |

## Arquitectura y entrenamiento

El backbone es EVA02-L/14, un Vision Transformer de 14x14 patches preentrenado con Masked Image Modeling sobre 22.000 clases (MIM-22K). Sobre este backbone se añaden tres cabezas de clasificación: una de 7 clases para raza, una de 2 clases para género y una de 9 clases ordinales para edad. La normalización de entrada es mean=(0.4815, 0.4578, 0.4082) y std=(0.2686, 0.2613, 0.2758), a resolución 224x224.

El entrenamiento se realizó sobre el dataset FairFace (Karkkainen & Joo, WACV 2021, 97.698 imágenes originales), deduplicado por contenido con SHA-256 en tres particiones disjuntas: 77.926 para entrenamiento, 8.659 para selección y 10.931 para test. El autor indica que todas las intersecciones entre conjuntos son cero y que ninguna imagen de la partición oficial de entrenamiento entró en el conjunto de evaluación. Se entrenó con una única semilla aleatoria. No se especifica en la información disponible el número de épocas, la función de pérdida exacta, el optimizador ni si hubo aumento de datos.

## Capacidades

- Clasificación simultánea de tres atributos faciales en una sola pasada: raza (7 clases), género (2 clases) y edad (9 rangos).
- Estimación de edad como problema ordinal con 9 umbrales, lo que permite obtener MAE en unidades de rango y accuracy a ±1 rango.
- Procesamiento de imágenes RGB a 224x224 con normalización fija.
- Salida multi-tarea apta para agregación y auditoría desagregada por subgrupo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de imágenes puro.
- Capacidad multilingüe: no aplica; las etiquetas están en inglés.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Auditoría de sesgo algorítmico: el modelo permite medir recall y F1 desagregados por raza, género y edad sobre un conjunto de test congelado, sirviendo como referencia "teacher" para comparar clasificadores más ligeros o modelos comerciales.
- Evaluación de equidad en datasets: dado un conjunto de imágenes faciales, se puede ejecutar el modelo para obtener la distribución demográfica estimada y detectar desequilibrios antes de entrenar otros sistemas.
- Benchmarking offline de clasificadores de atributos: con 344 img/s y 303M de parámetros, es adecuado para procesar lotes grandes en servidor y generar métricas reproducibles que otros modelos deben superar.
- Investigación académica en visión por computador: sirve como baseline multi-tarea sobre FairFace para estudiar el impacto de la deduplicación, el backbone o la formulación ordinal de la edad.
- Validación de pipelines de preprocesado: al tener normalización y resolución fijas, se puede usar para verificar que un pipeline de inferencia produce las mismas predicciones que el checkpoint de referencia.
- Generación de etiquetas sintéticas para experimentos controlados: las predicciones del modelo pueden usarse como pseudo-etiquetas en estudios de destilación o de sensibilidad a errores de etiquetado, siempre en contexto de investigación.
- No es adecuado para vigilancia, verificación de identidad, selección de personal, evaluación crediticia ni decisiones automatizadas de alto riesgo, según la propia model card.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test congelado de 10.931 imágenes (FairFace deduplicado):

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 77,02% | 76,83% | 10.931 |
| Género (2 clases) | 96,87% | 96,86% | 10.931 |
| Edad (9 rangos ordinales) | 63,93% | 61,29% | 10.931 |

Métricas agregadas: accuracy media de las 3 tareas del 79,27%; MAE de edad de 0,3838 rangos; accuracy a ±1 rango del 97,94%. Throughput declarado por el autor: 344 img/s. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (303M parámetros x 4 bytes), más activaciones y buffers; en la práctica, entre 2 y 4 GB con batch pequeño.
- En FP16/BF16: aproximadamente 0,6 GB de pesos, con un consumo total estimado de 1,5 a 3 GB según batch y resolución.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; A100, H100 o L40S para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, con margen amplio.
- Opciones de despliegue: PyTorch + timm directamente (dependencias declaradas: torch, timm, torchvision, pillow); exportación a TorchScript u ONNX no documentada en la información disponible; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Throughput declarado: 344 img/s (el autor no especifica el hardware empleado). La latencia por imagen no está publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-MonkeyCake-3Task-224 | 303M | Raza + género + edad (multi-tarea) | 224x224 RGB | CC BY 4.0 | Hugging Face (wesjos) |
| FairFace original (ResNet-34, Karkkainen & Joo) | ~21M | Raza + género + edad | 224x224 RGB | CC BY 4.0 (dataset); pesos según repositorio original | Repositorio oficial FairFace |
| Modelos de atributos faciales basados en ViT-B/16 | ~86M | Variable (raza/género/edad) | 224x224 RGB | Variable | Múltiples en Hugging Face |

No se dispone de métricas comparativas publicadas entre este checkpoint y las alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia. El propio autor describe este modelo como el "teacher" de mayor accuracy global dentro de su familia de variantes, lo que sugiere la existencia de checkpoints más ligeros no detallados aquí.

## Limitaciones y advertencias

- Uso restringido a investigación, medición de sesgos y auditoría de equidad; prohibido explícitamente para vigilancia, verificación de identidad, selección de personal, evaluación crediticia y decisiones automatizadas de alto riesgo.
- Reutilización del conjunto de test: el test congelado se evaluó en checkpoints iterativos durante el desarrollo, por lo que las métricas son descriptivas y no una estimación insesgada del rendimiento en producción.
- Semilla única: diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente Latino/Hispano, Oriente Medio, Indio y Blanco) no son discretos; la estimación de edad tiene mayor tasa de error y algunos subgrupos interseccionales género x raza muestran disparidades superiores.
- Las etiquetas reflejan las anotaciones categóricas de FairFace y no la autoidentificación de las personas ni su ascendencia real.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea sistemática en rostros con iluminación, oclusión o ángulos no representados en el dataset.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero la restricción ética de la model card debe respetarse; el backbone original es Apache-2.0.
- Idioma: etiquetas únicamente en inglés; no hay soporte multilingüe.
- No se documentan cuantizaciones ni formatos alternativos a PyTorch, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-monkeycake-3task-224
- Backbone base: https://huggingface.co/timm/eva02_large_patch14_224.mim_in22k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): no disponible como enlace directo en la información proporcionada
- Repositorio oficial FairFace: no disponible en la información proporcionada
- Demo: no disponible
