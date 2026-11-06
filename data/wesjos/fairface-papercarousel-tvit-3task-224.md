# wesjos/fairface-papercarousel-tvit-3task-224

## Resumen

FairFace-PaperCarousel-TinyViT-3Task-224 es un modelo de clasificación de imágenes desarrollado por el usuario wesjos que predice simultáneamente tres atributos demográficos a partir de una fotografía de rostro: raza (7 clases), género (2 clases) y edad (9 rangos ordinales). Se trata de un fine-tuning del backbone TinyViT-21M de timm, preentrenado en ImageNet-22k, sobre el conjunto de datos FairFace (Karkkainen & Joo, WACV 2021), un dataset creado específicamente para medir y mitigar sesgos en sistemas de reconocimiento facial.

El modelo es relevante en el contexto de auditoría de sesgos y evaluación de equidad algorítmica: permite cuantificar disparidades de rendimiento entre subgrupos demográficos con un coste computacional muy bajo (21 millones de parámetros, resolución 224x224). No está pensado para aplicaciones de producción de alto riesgo, sino como herramienta de investigación para medir cómo los sistemas automáticos tratan de forma desigual a distintos grupos.

La arquitectura es un transformer de visión jerárquico (TinyViT) con un cabezal multi-tarea que produce tres salidas simultáneas. El checkpoint se distribuye en formato PyTorch (`model.pt`) y la model card reporta métricas detalladas sobre un conjunto de test congelado de 10.931 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (vision transformer jerárquico) con cabezal multi-tarea |
| Parametros totales | 20.631.377 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada RGB 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo parte del backbone `timm/tiny_vit_21m_224.dist_in22k`, un TinyViT preentrenado mediante destilación en ImageNet-22k. TinyViT es un transformer de visión jerárquico que combina mecanismos de atención con convoluciones locales para reducir el coste computacional manteniendo capacidad representacional. Sobre este backbone se añade un cabezal multi-tarea que emite tres predicciones simultáneas: raza (7 clases), género (2 clases) y edad (9 rangos ordinales, descritos como 8 umbrales ordinales). La entrada se normaliza con media (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225) a 224x224 píxeles.

El entrenamiento se realizó sobre el dataset FairFace, deduplicado por contenido mediante SHA-256, resultando en 77.926 imágenes de entrenamiento, 8.659 de selección (validación) y 10.931 de test. La model card indica que las intersecciones entre particiones son cero y que ninguna imagen del split oficial de entrenamiento entró en evaluación. Se empleó una única semilla aleatoria, por lo que el autor advierte que diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumentación específicas.

## Capacidades

- Clasificación simultánea de tres atributos faciales: raza (7 clases), género (2 clases) y edad (9 rangos).
- Estimación de edad como tarea ordinal, con métrica de error absoluto medio en número de rangos.
- Inferencia sobre imágenes RGB a resolución 224x224 con normalización ImageNet estándar.
- Integración con el ecosistema `timm` y `torchvision` para carga del backbone y preprocesado.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión general (solo rostros) ni de audio.
- No incluye modo de pensamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Auditoría de sesgos en sistemas de visión: el modelo permite medir disparidades de precisión entre subgrupos demográficos definidos por raza, género y edad, sirviendo como referencia para evaluar la equidad de otros clasificadores faciales.
- Investigación académica sobre reconocimiento facial: con 21M de parámetros y un checkpoint de 0,2 GB, se puede ejecutar en una GPU consumer para experimentos reproducibles sobre FairFace.
- Evaluación de datasets de rostros: clasificar automáticamente las imágenes de un corpus para verificar su balance demográfico antes de usarlo en entrenamiento.
- Docencia y formación en ética de IA: permite ilustrar de forma práctica cómo un modelo puede tener buen rendimiento global (76,64% de media en tres tareas) pero disparidades notables por subgrupo, especialmente en edad.
- Benchmarking de modelos de atributos faciales: sus métricas publicadas (macro-F1 de 0,9567 en género, 0,7455 en raza) sirven como línea base para comparar nuevas propuestas sobre el mismo test congelado.
- Prototipado rápido de pipelines de análisis demográfico en entornos de investigación con recursos limitados, gracias a su bajo coste de inferencia y a la disponibilidad de pesos en formato PyTorch estándar.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test congelado de 10.931 imágenes:

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 74,76% | 74,55% | 10.931 |
| Género (2 clases) | 95,67% | 95,66% | 10.931 |
| Edad (9 rangos ordinales) | 59,47% | 56,90% | 10.931 |

- Media de accuracy en las tres tareas: **76,64%**.
- MAE de edad: **0,4418 rangos**; accuracy a ±1 rango: **96,78%**.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (21M de parámetros), y del orden de cientos de MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (script `inference.py` incluido en el repo), exportación a TorchScript u ONNX no documentada pero viable por la naturaleza del backbone; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmarks de modelos alternativos sobre el mismo test congelado, por lo que la comparación numérica no está disponible. A modo de referencia estructural:

| Modelo | Parametros | Tarea | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-PaperCarousel-TinyViT-3Task-224 | 20,6 M | Raza + género + edad | 224x224 RGB | CC BY 4.0 | Hugging Face (wesjos) |
| FairFace original (ResNet-34, Karkkainen & Joo) | ~21,8 M | Raza + género + edad | 224x224 RGB | CC BY 4.0 (dataset) | Código en GitHub |
| TinyViT-21M base (timm) | 21,1 M | Clasificación ImageNet | 224x224 RGB | Apache-2.0 | Hugging Face (timm) |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Uso exclusivamente de investigación**: el autor prohíbe explícitamente su uso para vigilancia, verificación de identidad, selección de personal, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- **Reutilización del test set**: el conjunto de test congelado se evaluó sobre múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y no una estimación imparcial del rendimiento en producción.
- **Semilla única**: el entrenamiento se realizó con una sola semilla; diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.
- **Disparidades demográficas**: las fronteras entre grupos (especialmente entre latino/hispano, Oriente Medio, indio y blanco) no son discretas; la estimación de edad presenta mayor tasa de error y algunos subgrupos interseccionales género x raza muestran disparidades superiores.
- **Atribución de etiquetas**: las etiquetas reflejan las anotaciones categóricas del dataset FairFace y no la autoidentificación de las personas ni su ascendencia real.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea sistemática en rostros fuera de la distribución del dataset o con condiciones de iluminación, pose u oclusión atípicas.
- **Idioma**: la documentación y las etiquetas están en inglés; no hay soporte multilingüe.
- **Licencia**: CC BY 4.0 permite uso comercial con atribución, pero las restricciones éticas del autor y la naturaleza sensible de los atributos demográficos desaconsejan cualquier despliegue comercial de clasificación demográfica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-papercarousel-tvit-3task-224
- Backbone base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): https://arxiv.org/abs/1908.04913
- Repositorio oficial FairFace: https://github.com/joojs/fairface
