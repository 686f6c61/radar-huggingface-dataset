# wesjos/fairface-halfpint-tvit-3task-112

## Resumen

FairFace-HalfPint-TinyViT-3Task-112 es un modelo de clasificación de imágenes especializado en atributos faciales, desarrollado por el usuario wesjos y publicado en Hugging Face. Se trata de un fine-tuning del backbone TinyViT-21M (timm/tiny_vit_21m_224.dist_in22k) sobre el conjunto de datos FairFace, con el objetivo de predecir simultáneamente tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos ordinales). El modelo está pensado como herramienta de investigación para la medición de sesgos algorítmicos y auditorías de equidad, no para uso comercial de alto riesgo.

La relevancia de este modelo radica en su enfoque explícito hacia la evaluación de sesgos: el conjunto FairFace fue diseñado precisamente para equilibrar la representación racial, de género y de edad, y este checkpoint se presenta como una variante de resolución reducida (112x112) del backbone, lo que reduce el coste computacional a costa de una ligera pérdida de precisión. Con 20,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero y desplegable en hardware modesto.

El modelo se distribuye bajo licencia CC BY 4.0 y está etiquetado únicamente para inglés, aunque al tratarse de un clasificador de imágenes el idioma no condiciona su funcionamiento. La model card incide en que su uso debe limitarse a investigación y auditoría de sesgos, prohibiendo explícitamente aplicaciones de vigilancia, verificación de identidad o decisiones automatizadas de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-21M (vision transformer jerárquico con atención local y convoluciones) |
| Parametros totales | 20.631.377 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 112x112 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo procesa imágenes, no texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`model.pt`), estado del arte en safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo emplea TinyViT-21M como backbone, una arquitectura de vision transformer jerárquica que combina mecanismos de atención con operaciones convolucionales para reducir el coste computacional manteniendo una capacidad representacional razonable. El checkpoint base (timm/tiny_vit_21m_224.dist_in22k) fue preentrenado con destilación sobre ImageNet-22k, y posteriormente ajustado por el autor sobre el dataset FairFace. La entrada es una imagen RGB de 112x112 píxeles, normalizada con media (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225).

El entrenamiento se realizó sobre el conjunto HuggingFaceM4/FairFace, deduplicado por contenido mediante SHA-256: 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. La partición de test es una versión congelada del conjunto de validación oficial de FairFace, y la model card indica que las intersecciones entre particiones son cero. El modelo se entrena con una única semilla aleatoria, por lo que el autor advierte que diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico. No se especifican detalles sobre el uso de RLHF, DPO ni técnicas de aumento de datos más allá de la normalización estándar.

## Capacidades

- Clasificación simultánea de tres atributos demográficos: raza (7 clases), género (2 clases) y edad (9 rangos ordinales).
- Predicción de edad como umbrales ordinales (8 umbrales que definen 9 brackets), lo que permite estimar la edad como valor continuo o como categoría.
- Salida multi-tarea en una sola pasada de inferencia, sin necesidad de ejecutar tres modelos separados.
- Procesamiento de imágenes RGB de 112x112 píxeles con normalización ImageNet estándar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de visión puro.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión adicional, audio ni otras capacidades especiales.

## Casos de uso

- Auditoría de sesgos en sistemas de visión: el modelo puede emplearse para medir disparidades de rendimiento entre subgrupos demográficos en pipelines de reconocimiento facial o análisis de imágenes, comparando las predicciones del modelo con las etiquetas de FairFace y calculando recall por clase.
- Investigación académica sobre equidad algorítmica: sirve como línea base reproducible para estudiar cómo la resolución de entrada (112x112 frente a 224x224) afecta a la precisión por subgrupo, gracias a su backbone TinyViT y a su conjunto de test congelado.
- Evaluación de modelos de atributos faciales en entornos con recursos limitados: al tener solo 20,6 M de parámetros y 0,2 GB de pesos, puede ejecutarse en CPU o en GPUs de gama baja para experimentos de laboratorio.
- Prototipado de sistemas de análisis demográfico agregado: en estudios de composición de audiencias o análisis de datasets de imágenes, el modelo puede clasificar lotes de rostros para estimar distribuciones agregadas, siempre con fines de investigación.
- Docencia y formación en visión por computador: su tamaño reducido y su pipeline sencillo (`inference.load` / `inference.predict`) lo hacen adecuado para prácticas sobre clasificación multi-tarea y evaluación de sesgos.
- Validación de datasets de rostros: puede usarse para detectar desequilibrios de representación en conjuntos de imágenes antes de entrenar otros modelos, comparando las distribuciones predichas con las esperadas.
- Benchmarking de modelos de atributos faciales: sirve como referencia ligera para comparar con variantes de mayor resolución o con backbones más grandes en tareas de raza, género y edad.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 73,80% | 73,50% | 10.931 |
| Género (2 clases) | 95,38% | 95,37% | 10.931 |
| Edad (9 brackets ordinales) | 58,17% | 55,39% | 10.931 |

Precisión media de las 3 tareas: **75,78%**. MAE de edad: **0,4652 brackets**; precisión ±1 bracket: **95,99%**.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado que el modelo tiene 20,6 M de parámetros y procesa imágenes de 112x112.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU, ya que el checkpoint ocupa 0,2 GB.
- Opciones de despliegue: PyTorch nativo con `timm` y `torchvision`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de visión de este tamaño).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-HalfPint-TinyViT-3Task-112 | 20,6 M | Imagen 112x112 | 75,78% media 3 tareas | CC BY 4.0 | Hugging Face |
| TinyViT-21M base (timm) | 21 M | Imagen 224x224 | No aplica (clasificación ImageNet) | Apache-2.0 | Hugging Face |
| FairFace original (ResNet-34, Karkkainen & Joo) | ~21 M | Imagen 224x224 | No disponible en esta ficha | CC BY 4.0 (dataset) | GitHub del paper |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada; la comparativa se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card prohíbe explícitamente su uso para vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Reutilización del conjunto de evaluación: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y no una estimación imparcial.
- Una sola semilla de entrenamiento: diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente latino/hispano, Oriente Medio, indio y blanco) no son discretos; la estimación de edad tiene mayor tasa de error y algunos subgrupos interseccionales género x raza muestran disparidades superiores.
- Atribución de etiquetas: las etiquetas reflejan las anotaciones categóricas de FairFace y no la autoidentificación personal ni la ascendencia real de las personas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en rostros fuera de la distribución de entrenamiento.
- Limitación de resolución: la entrada de 112x112 reduce el detalle disponible frente a variantes de 224x224, lo que puede afectar a la precisión en raza y edad.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las restricciones éticas de la model card limitan de facto aplicaciones de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-halfpint-tvit-3task-112
- Backbone base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
