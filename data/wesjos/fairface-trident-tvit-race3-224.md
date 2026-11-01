# wesjos/fairface-trident-tvit-race3-224

## Resumen

FairFace-Trident-TinyViT-Race3-224 es un modelo de clasificación de imágenes especializado en la predicción de atributos faciales, concretamente la categoría racial en tres clases (White, Black, Asian). Lo desarrolla el usuario wesjos y se publica en HuggingFace bajo licencia CC BY 4.0. El modelo parte del backbone TinyViT-21M preentrenado en ImageNet-22k (timm/tiny_vit_21m_224.dist_in22k) y se afina completamente sobre el conjunto de datos FairFace, un corpus académico diseñado específicamente para medir y mitigar sesgos en sistemas de reconocimiento facial.

El modelo resuelve una tarea acotada: clasificar rostros en tres categorías raciales agregadas a partir de las siete originales de FairFace. Con 20.625.607 parámetros y una resolución de entrada de 224x224 píxeles, está pensado para investigación sobre sesgo algorítmico y auditoría de equidad, no para producción comercial de alto riesgo. Su relevancia radica en la disponibilidad de métricas de evaluación desagregadas y en el uso de un conjunto de test congelado y deduplicado por SHA-256, lo que facilita la reproducibilidad en estudios de fairness.

La arquitectura es una red neuronal convolucional híbrida (TinyViT) con atención jerárquica, entrenada exclusivamente en inglés a nivel de metadatos. El modelo se distribuye como checkpoint PyTorch (model.pt) con un script de inferencia propio, y no incluye pesos en formato GGUF ni safetensors estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT-21M (híbrido convolucional + atención jerárquica) |
| Parametros totales | 20.625.607 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch de precisión completa) |
| Idiomas soportados | en (metadatos y documentación; la tarea es visual) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

TinyViT es una arquitectura híbrida que combina bloques convolucionales con mecanismos de atención jerárquica para reducir el coste computacional manteniendo capacidad representacional. El backbone tiny_vit_21m_224.dist_in22k fue preentrenado con destilación en ImageNet-22k (Apache-2.0) y posteriormente se afinó de forma completa (full fine-tuning) sobre FairFace para la tarea de clasificación racial en tres clases.

Los datos de entrenamiento proceden del dataset FairFace (Karkkainen & Joo, WACV 2021), que contiene 97.698 imágenes originales. Para este proyecto se deduplicó por contenido mediante SHA-256, resultando en 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. Las intersecciones entre particiones son cero, garantizando que ninguna imagen oficial de entrenamiento entró en el conjunto de evaluación. La normalización aplicada es la estándar de ImageNet: mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225). El entrenamiento se realizó con una única semilla aleatoria, según indica la model card.

## Capacidades

- Clasificación de imágenes de rostros en tres categorías raciales: White, Black y Asian.
- Entrada RGB de 224x224 píxeles con normalización ImageNet.
- Salida de probabilidades por clase (3 logits) apta para análisis de confianza y curvas ROC.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá de los metadatos en inglés.
- No dispone de modo thinking, visión general, audio ni otras modalidades.
- Diseñado exclusivamente para investigación de atributos faciales y auditoría de sesgos.

## Casos de uso

- Auditoría de sesgo algorítmico: el modelo permite medir la precisión diferencial entre subgrupos demográficos usando el conjunto de test congelado de 10.931 imágenes, facilitando estudios de fairness reproducibles con métricas macro-F1 y recall por clase.
- Investigación académica en visión por computador: sirve como baseline ligero (20,6 M de parámetros) para experimentos de clasificación de atributos faciales con arquitecturas híbridas TinyViT, comparable con otros modelos sobre FairFace.
- Evaluación de técnicas de mitigación de sesgo: al disponer de etiquetas desagregadas y matrices de confusión publicadas, se puede usar para validar métodos de reequilibrado o calibración por subgrupo.
- Docencia y formación en ética de IA: su tamaño reducido y su licencia CC BY 4.0 permiten desplegarlo en entornos educativos para ilustrar cómo los modelos de visión pueden amplificar desigualdades demográficas.
- Benchmarking de backbones ligeros: útil para comparar el rendimiento de TinyViT frente a otras arquitecturas (ResNet, ViT, MobileNet) en tareas de clasificación de atributos con datasets balanceados como FairFace.
- Prototipado de pipelines de análisis demográfico controlado: en entornos de investigación con supervisión ética, puede integrarse en flujos de anotación automática de atributos para estudiar la composición de datasets audiovisuales.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Race (3 clases: White / Black / Asian) | 93,01% | 91,77% | 10.931 |

La model card indica que la fusión de probabilidades desde el modelo de 7 clases alcanza un 93,54%, ligeramente superior al 93,01% del modelo de 3 clases. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 20,6 M de parámetros; en FP16 aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100 sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: inferencia nativa con PyTorch y timm (según el script `inference.py` del autor); también es posible exportar a TorchScript u ONNX manualmente, aunque no se documenta en la model card. No se proporcionan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/fairface-trident-tvit-race3-224 | 20,6 M | 224x224 RGB | Raza 3 clases | CC BY 4.0 | HuggingFace |
| timm/tiny_vit_21m_224.dist_in22k | 21 M (aprox.) | 224x224 RGB | Clasificación ImageNet | Apache-2.0 | HuggingFace / timm |
| Modelos FairFace originales (Karkkainen & Joo) | no disponible | no disponible | Raza 7 clases, género, edad | no disponible | Repositorio académico |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card prohíbe explícitamente su uso en vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Reutilización del conjunto de evaluación: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas reportadas son descriptivas y pueden estar optimistas.
- Semilla única: el entrenamiento se realizó con una sola semilla; diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente Latino/Hispano, Oriente Medio, Indio y White) no son discretos; la estimación de edad presenta mayores tasas de error y ciertos subgrupos interseccionales género x raza muestran disparidades elevadas.
- Atribución de etiquetas: las etiquetas reflejan las anotaciones categóricas del dataset FairFace y no representan la autoidentificación personal ni la ascendencia real de los individuos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en rostros ambiguos o con iluminación deficiente.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero las consideraciones éticas del autor limitan de facto su aplicación a investigación.
- Limitación de idioma: los metadatos y la documentación están solo en inglés; la tarea es puramente visual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/fairface-trident-tvit-race3-224
- Backbone base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): https://arxiv.org/abs/1908.04913
