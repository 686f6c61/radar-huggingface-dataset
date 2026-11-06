# wesjos/fairface-arrowhead-cnano-race7-224

## Resumen

FairFace-ArrowHead-CNano-Race7-224 es un clasificador de atributos faciales de tarea única desarrollado por el usuario wesjos, construido sobre el backbone ConvNeXt-Nano de timm y afinado sobre el conjunto de datos FairFace. Su única tarea es predecir la categoría demográfica de raza en 7 clases a partir de una imagen RGB de 224x224 píxeles. No es un modelo generativo ni un modelo de lenguaje: es un clasificador de visión por computador de propósito muy específico.

El modelo parte del checkpoint preentrenado `timm/convnext_nano.in12k_ft_in1k` (ConvNeXt-Nano entrenado en ImageNet-12k y afinado en ImageNet-1k) y se ajusta sobre una versión deduplicada por contenido (SHA-256) del dataset FairFace, con particiones disjuntas de entrenamiento, selección y test. El resultado es un modelo compacto de unos 15 millones de parámetros y aproximadamente 0,1 GB de pesos, pensado para investigación sobre sesgos algorítmicos y auditoría de equidad.

Su relevancia es acotada y de carácter metodológico: se enmarca en la línea de trabajo que usa FairFace para medir disparidades demográficas en sistemas de visión, no como componente de producto. El autor restringe explícitamente el uso a investigación y auditoría de sesgos, y prohíbe su empleo en vigilancia, verificación de identidad, selección de personal, evaluación crediticia o cualquier decisión automatizada de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Nano (CNN pura, familia ConvNeXt de timm) |
| Parametros totales | 14.957.047 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en `model.pt`) |
| Idiomas soportados | en (metadatos del modelo; la tarea es de visión, no lingüística) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`), cargado vía módulo `inference` del autor |

Otros datos técnicos relevantes: normalización de entrada con media (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225), resolución de entrada 224x224, salida de 7 clases de raza, tamaño del repositorio 0,1 GB y dependencias `torch`, `timm`, `torchvision` y `pillow`.

## Arquitectura y entrenamiento

El backbone es ConvNeXt-Nano, una red convolucional pura de la familia ConvNeXt que moderniza el diseño de ResNet incorporando elementos propios de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y estructura de bloques invertidos). El checkpoint base `in12k_ft_in1k` se preentrenó en ImageNet-12k y se afinó en ImageNet-1k, lo que aporta representaciones visuales generales antes del ajuste específico. Sobre ese backbone se añade una cabeza de clasificación de 7 clases para la tarea de raza.

El entrenamiento se realizó sobre el dataset FairFace (Karkkainen & Joo, WACV 2021), que contiene 97.698 imágenes originales. Para este proyecto el autor deduplicó por contenido con SHA-256 y obtuvo tres particiones disjuntas: 77.926 imágenes de entrenamiento, 8.659 de selección (validación) y 10.931 de test. El autor afirma que las intersecciones por pares entre conjuntos son cero y que ninguna imagen de la partición oficial de entrenamiento entró en el conjunto de evaluación. No se documentan en la información disponible detalles sobre función de pérdida, hiperparámetros, aumentos de datos, número de épocas ni si hubo técnicas de regularización específicas más allá de la mención a una única semilla aleatoria de entrenamiento.

## Capacidades

- Clasificación de imágenes faciales en 7 categorías demográficas de raza, a resolución 224x224.
- Inferencia de tarea única: solo predice raza; no predice género, edad ni otras atributos.
- Integración con el ecosistema timm y PyTorch para carga de pesos y ejecución en CPU o GPU.
- API mínima de inferencia mediante el módulo `inference` del autor (`load` y `predict`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje: es exclusivamente un clasificador visual.
- No dispone de modo de razonamiento (thinking mode), visión generativa, audio ni multimodalidad.

## Casos de uso

- Auditoría de equidad en sistemas de visión: usar el modelo como referencia para medir disparidades de precisión entre subgrupos demográficos en pipelines de reconocimiento o análisis facial, aprovechando que está entrenado sobre FairFace con particiones deduplicadas.
- Investigación académica sobre sesgos: reproducir experimentos de medición de sesgo demográfico comparando las predicciones del modelo con las anotaciones del dataset FairFace en el conjunto de test de 10.931 imágenes.
- Evaluación comparativa de backbones: emplear este ConvNeXt-Nano como baseline de capacidad media (74,46 % de accuracy en raza) frente a arquitecturas mayores o menores en estudios de escalado para tareas de atributos faciales.
- Docencia y formación: ilustrar en cursos de visión por computador el flujo completo de ajuste fino de un backbone timm sobre un dataset etiquetado, incluyendo deduplicación, particionado y evaluación por clase.
- Análisis de errores por subgrupo: estudiar la matriz de confusión y el recall por clase (publicados como imágenes en el repositorio) para identificar fronteras demográficas no discretas, especialmente entre grupos latino/hispano, medio oriente, indio y blanco.
- Prototipado de investigación en entornos con recursos limitados: desplegar el modelo en una GPU de consumo o incluso CPU gracias a sus ~15 M de parámetros y 0,1 GB de pesos para experimentos exploratorios de clasificación demográfica.
- Verificación de pipelines de datos: usar el clasificador como herramienta auxiliar para comprobar el balance demográfico de conjuntos de imágenes faciales antes de entrenar otros modelos.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Support |
|---|---:|---:|---:|
| Raza (7 clases) | 74,46 % | no disponible | 10.931 |

El autor indica que el conjunto de test congelado se evaluó sobre checkpoints iterativos durante el desarrollo, por lo que las métricas reportadas son descriptivas. No se han publicado en la información disponible resultados comparativos con otros modelos en esta misma tarea, ni valores de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~15 M de parámetros y pesos de 0,1 GB, la inferencia en FP32 requiere del orden de cientos de MB, holgadamente por debajo de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3060 o incluso una iGPU reciente pueden ejecutar el modelo con soltura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos ~1 GB de memoria libre, y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `timm` y `torchvision`; exportación a TorchScript u ONNX no documentada por el autor pero viable por la naturaleza del backbone. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FairFace-ArrowHead-CNano-Race7-224 | 14.957.047 | Raza (7 clases) | 224x224 RGB | 74,46 % accuracy | CC BY 4.0 | Hugging Face |
| timm/convnext_nano.in12k_ft_in1k (base) | ~15 M | Clasificación ImageNet-1k (1000 clases) | 224x224 RGB | no aplica a raza | Apache-2.0 | Hugging Face |
| FairFace (modelo original de Karkkainen & Joo) | no disponible | Raza, género y edad | no disponible | no disponible en la información | no disponible | paper WACV 2021 |

No se dispone en la información proporcionada de otros clasificadores de raza sobre FairFace con métricas comparables publicadas, por lo que la comparativa con alternativas de la misma tarea queda limitada a los elementos anteriores.

## Limitaciones y advertencias

- Uso restringido a investigación: el autor prohíbe explícitamente el uso en vigilancia, verificación de identidad, selección de personal, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Riesgo de sesgo y disparidad demográfica: las fronteras entre grupos (especialmente latino/hispano, medio oriente, indio y blanco) no son discretas, y determinados subgrupos interseccionales género x raza muestran mayores disparidades.
- Las etiquetas reflejan las anotaciones categóricas del dataset FairFace y no la autoidentificación personal ni el origen real de las personas.
- Reutilización del conjunto de test: el test congelado se evaluó sobre múltiples checkpoints durante el desarrollo, por lo que las métricas son descriptivas y no una estimación insesgada de generalización.
- Una única semilla de entrenamiento: el autor advierte que diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico.
- Tarea única: no predice género, edad ni otros atributos; no debe emplearse como sistema de análisis facial completo.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero las restricciones éticas del autor y la naturaleza sensible de la tarea desaconsejan cualquier aplicación comercial de perfilado demográfico.
- El backbone base es Apache-2.0, pero el checkpoint derivado se libera bajo CC BY 4.0, lo que impone obligación de atribución.
- Sin datos publicados de cuantización, latencia ni throughput; el despliegue en producción requeriría una evaluación propia.
- El modelo no ha sido validado fuera de la distribución de FairFace; su comportamiento en imágenes reales de otras fuentes es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/fairface-arrowhead-cnano-race7-224
- Backbone base: https://huggingface.co/timm/convnext_nano.in12k_ft_in1k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): https://arxiv.org/abs/1908.04913
- Repositorio FairFace: https://github.com/joojs/fairface
