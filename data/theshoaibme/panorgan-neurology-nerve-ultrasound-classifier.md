# theshoaibme/panorgan-neurology-nerve-ultrasound-classifier

## Resumen

PanOrganNet Neurology es un clasificador de imágenes de ecografía centrado en la detección y localización del plexo braquial, desarrollado por el usuario theshoaibme dentro del marco denominado Pan-Organ Diagnostic Paradigm (PanOrganNet). El modelo resuelve una tarea clínica concreta: el cribado automatizado en tiempo real de la estructura nerviosa del plexo braquial en fotogramas o vídeo de ecografía, con el objetivo de asistir al anestesiólogo durante la inserción de catéteres. Se distribuye como un checkpoint de clasificación de imágenes de dos clases sobre una arquitectura EfficientNetV2-S preentrenada.

Técnicamente es un modelo de visión por computador de tamaño moderado (EfficientNetV2-S, con entrada de 224x224 píxeles y una cabeza de clasificación de dos salidas), no un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional. Su relevancia radica en que publica métricas de validación sobre un conjunto de prueba de 959 ecografías y en que se ofrece con licencia CC-BY-4.0, lo que facilita su reutilización e inspección. El repositorio ocupa aproximadamente 0,1 GB y acumula 71 descargas en el momento de la consulta.

El modelo forma parte de una iniciativa más amplia de modelos "pan-órgano" por especialidad; esta ficha se limita a la variante de neurología. La información pública disponible es escasa en cuanto a composición del dataset, proceso de entrenamiento y detalles de preprocesado más allá de lo que muestra la model card y el código de ejemplo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN, torchvision) con cabeza de clasificación lineal de 2 clases y dropout 0,3 |
| Parámetros totales | no disponible (EfficientNetV2-S ronda los 21,5 M de parámetros según la implementación de torchvision; el autor no lo declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint PyTorch `pytorch_model.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.pt`) más `config.json` con clases y parámetros de normalización |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional EfficientNetV2-S, cargada desde `torchvision.models.efficientnet_v2_s`. El autor sustituye el clasificador original por un bloque `Sequential` compuesto por `Dropout(0.3)` y una capa lineal que proyecta las características finales a 2 clases. La entrada se redimensiona a 224x224 y se normaliza con la media y la desviación típica indicadas en `config.json`. El modelo se ejecuta en modo evaluación (`model.eval()`) y devuelve logits que se convierten en probabilidades mediante softmax.

No se detalla en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset (más allá de la referencia a `theshoaibme/panorgan-ultrasound-nerve-segmentation`), ni si hubo aumento de datos, ajuste fino completo o congelación de capas. Tampoco se documenta el uso de técnicas de regularización más allá del dropout en la cabeza, ni procesos de calibración. La evaluación se realizó sobre 959 ecografías de prueba (holdout) según la model card.

## Capacidades

- Clasificación binaria de imágenes de ecografía: distingue entre presencia y ausencia (o clase positiva/negativa) del plexo braquial en el fotograma.
- Localización implícita de la estructura nerviosa a través de la clasificación, orientada a guiar la inserción de catéteres.
- Procesamiento de fotogramas individuales de vídeo de ecografía (no se documenta procesamiento de secuencias temporales de forma nativa).
- Salida de probabilidad por clase (softmax), útil para umbrales de confianza configurables.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera de la clasificación de imagen ecográfica.

## Casos de uso

- Asistencia a la inserción de catéteres en anestesia regional: el modelo clasifica fotogramas de ecografía del plexo braquial y puede señalizar la presencia de la estructura nerviosa en tiempo real, ayudando al anestesiólogo a confirmar la posición antes de la punción.
- Cribado automatizado en flujos de ecografía: integrado en un visor o estación de ecografía, permite marcar fotogramas candidatos que contienen plexo braquial para revisión posterior, reduciendo el tiempo de revisión manual.
- Control de calidad de adquisición: al clasificar la presencia de la estructura, puede alertar cuando un fotograma no contiene el plano anatómico esperado, lo que ayuda a repetir la captura.
- Triaje en docencia y simulación: sirve como herramienta de formación para residentes, comparando su clasificación con la del experto en conjuntos de imágenes de práctica.
- Preprocesado para pipelines de segmentación: como etapa previa a un modelo de segmentación (el dataset referenciado es de segmentación), filtra fotogramas relevantes antes de pasarlos al modelo más costoso.
- Investigación en modelos "pan-órgano": reutilizable como componente de un sistema mayor de diagnóstico por especialidad, con la licencia CC-BY-4.0 facilitando su incorporación en estudios académicos.
- Integración en prototipos de ayuda a la decisión: con la salida de probabilidad, se puede construir un umbral de confianza para derivar casos dudosos a revisión humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 959 ecografías de prueba (holdout):

| Métrica | Valor |
|---|---|
| Test accuracy | 77,06 % |
| Macro F1-score | 0,7697 |
| Macro precision | 0,7784 |
| Macro recall (sensibilidad) | 77,25 % |
| AUC-ROC | 0,8662 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de EfficientNetV2-S y la entrada 224x224, el checkpoint es ligero (el repositorio completo ocupa 0,1 GB) y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor; cualquier GPU con al menos unos pocos GB de VRAM es suficiente para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, por el tamaño del modelo y de la entrada; no se especifican modelos concretos.
- Opciones de despliegue: inferencia directa con PyTorch y torchvision tal como muestra el código de ejemplo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar como referencia arquitectónica que el propio modelo se basa en EfficientNetV2-S de torchvision, pero no se han publicado comparativas de rendimiento frente a otras variantes en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanOrganNet Neurology (este modelo) | no disponible | no aplica (visión) | Accuracy 77,06 %; AUC-ROC 0,8662 | CC-BY-4.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas moderadas: una accuracy del 77,06 % y un recall del 77,25 % implican una tasa de error relevante para uso clínico; no debe emplearse como único criterio de decisión.
- Riesgo de falsos negativos y falsos positivos en la detección de estructuras nerviosas, con implicaciones directas en procedimientos invasivos.
- No es un dispositivo médico certificado: la model card no documenta validación regulatoria, y su uso en producción clínica requeriría evaluación adicional.
- Sesgos potenciales derivados de la composición del dataset de entrenamiento (no documentada): posible menor rendimiento en equipos de ecografía, ajustes de imagen o poblaciones no representadas.
- Limitaciones de generalización: el modelo está entrenado para el plexo braquial; no se garantiza su funcionamiento en otras estructuras nerviosas o regiones anatómicas.
- No procesa secuencias temporales de vídeo de forma nativa; el uso sobre vídeo requiere clasificación fotograma a fotograma.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no exime de las responsabilidades regulatorias y clínicas del uso sanitario.
- La información sobre el proceso de entrenamiento, el dataset y el preprocesado es escasa, lo que dificulta la reproducibilidad y la auditoría del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theshoaibme/panorgan-neurology-nerve-ultrasound-classifier
- Dataset referenciado: https://huggingface.co/datasets/theshoaibme/panorgan-ultrasound-nerve-segmentation
- EfficientNetV2 (torchvision): https://pytorch.org/vision/stable/models/efficientnetv2.html
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
