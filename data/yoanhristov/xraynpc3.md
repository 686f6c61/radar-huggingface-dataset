# YoanHristov/xraynpc3

## Resumen

xraynpc3 es un clasificador de imágenes de radiografía de tórax basado en ResNet-18, publicado por el usuario YoanHristov en Hugging Face como parte del material asociado a un cuaderno de trabajo de Veritas AI 2026 (parte III). El modelo distingue entre tres clases: NORMAL, PNEUMONIA y COVID-19, y se distribuye como un state_dict de torchvision, es decir, los pesos deben cargarse sobre una instancia de ResNet-18 definida en código, no como un modelo autónomo listo para usar con `from_pretrained`.

Se trata de un prototipo de investigación, no de un producto ni de un dispositivo médico, tal y como advierte explícitamente el autor. El repositorio es pequeño (0,1 GB), tiene 35 descargas y ningún "like", lo que sugiere un uso académico o de validación interna más que una adopción comunitaria amplia. La información publicada es mínima: no hay detalles sobre métricas, composición exacta del dataset, hiperparámetros de entrenamiento ni pipeline declarado.

A pesar de su escasez documental, el modelo resulta relevante como ejemplo reproducible de un flujo de clasificación médica con transferencia desde ResNet-18 preentrenado en ImageNet, aumentación dirigida ("targeted augmentation") y mezcla de dos conjuntos públicos (Kermany y COVID-QU-Ex). Para desarrolladores e investigadores que quieran evaluar la viabilidad de un clasificador ligero de tres clases en radiografía de tórax, ofrece un punto de partida concreto y de bajo coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, torchvision) |
| Parámetros totales | aproximadamente 11,7 millones (arquitectura estándar ResNet-18; no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en punto flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés: NORMAL, PNEUMONIA, COVID-19) |
| Licencia | other (sin términos concretos publicados en la model card) |
| Formato de pesos | `resnet18.pt` (state_dict de PyTorch); `config.json` con preprocesado y clases |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estándar de torchvision, una red convolucional residual con bloques básicos y conexiones de identidad, adecuada para clasificación de imágenes a resolución moderada. El repositorio incluye un `config.json` que documenta el preprocesado y las clases, y los pesos se entregan como `resnet18.pt`, un state_dict que debe cargarse sobre una instancia de ResNet-18 con la cabeza de clasificación adaptada a tres salidas. No se especifica si la inicialización proviene de pesos preentrenados en ImageNet, aunque es la práctica habitual en este tipo de flujos.

El entrenamiento combina los conjuntos Kermany (radiografías pediátricas de tórax con etiquetas NORMAL y PNEUMONIA) y COVID-QU-Ex (que aporta la clase COVID-19 y amplía la diversidad). La model card menciona "targeted augmentation", pero no detalla qué transformaciones concretas se aplicaron, el número de épocas, la tasa de aprendizaje, el tamaño de lote, la resolución de entrada ni si hubo ajuste fino completo o solo de la cabeza. Tampoco se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de imágenes. No hay información sobre particiones de entrenamiento/validación/test ni sobre control de fuga de datos entre conjuntos.

## Capacidades

- Clasificación de radiografías de tórax en tres clases: NORMAL, PNEUMONIA y COVID-19.
- Inferencia sobre imágenes individuales mediante carga del state_dict en una ResNet-18 de torchvision.
- Preprocesado definido en `config.json` (resolución, normalización y mapeo de etiquetas), lo que facilita la reproducibilidad si se respeta ese fichero.
- Entrenamiento con aumentación dirigida, orientada presumiblemente a mejorar la robustez frente a variaciones de las clases minoritarias.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo de visión.
- No tiene capacidades multilingües ni de generación de texto; las etiquetas de salida están en inglés.
- No dispone de modo "thinking", visión general, audio ni ninguna modalidad adicional más allá de la imagen de entrada.

## Casos de uso

- Docencia y reproducción de flujos de transferencia: el modelo sirve para ilustrar cómo adaptar una ResNet-18 preentrenada a un problema médico de tres clases, cargando el state_dict y el `config.json` en un cuaderno de prácticas.
- Prototipado rápido de triaje radiológico: con una GPU de gama baja se puede desplegar un clasificador que separe NORMAL de PNEUMONIA y COVID-19 en un entorno de laboratorio, siempre con supervisión humana y sin uso clínico.
- Comparación de arquitecturas ligeras: al ser ResNet-18, permite establecer una línea base frente a modelos más pesados (ResNet-50, EfficientNet, ViT) en el mismo conjunto de datos.
- Investigación sobre aumentación dirigida: el modelo documenta el uso de "targeted augmentation" sobre Kermany y COVID-QU-Ex, lo que lo convierte en un caso de estudio para evaluar el impacto de estas técnicas en clases desbalanceadas.
- Integración en pipelines de preetiquetado: puede usarse para generar etiquetas preliminares sobre grandes volúmenes de radiografías que después se revisan manualmente, reduciendo el coste de anotación.
- Validación de infraestructura de inferencia: por su reducido tamaño (0,1 GB) es útil para probar servicios de inferencia en CPU o GPU modesta antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, sensibilidad, especificidad, AUC ni matrices de confusión, ni comparaciones con otros modelos sobre Kermany o COVID-QU-Ex.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precisión FP32 para lotes pequeños; el modelo completo ocupa aproximadamente 45 MB en FP32 (11,7 M de parámetros), y el repositorio total pesa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para esta carga.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 2060, RTX 3050 y superiores; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga del state_dict), TorchScript, ONNX Runtime tras exportación, o un servicio HTTP ligero con FastAPI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; en una GPU moderna se espera un throughput alto por el reducido tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Clases | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xraynpc3 | ResNet-18 | ~11,7 M | 3 (NORMAL, PNEUMONIA, COVID-19) | no aplica | other | Hugging Face |
| ResNet-50 (torchvision) | ResNet-50 | ~25,6 M | 1000 (ImageNet) | no aplica | BSD-3-Clause | torchvision |
| EfficientNet-B0 (torchvision) | EfficientNet | ~5,3 M | 1000 (ImageNet) | no aplica | BSD-3-Clause | torchvision |
| ViT-B/16 (torchvision) | Vision Transformer | ~86 M | 1000 (ImageNet) | no aplica | BSD-3-Clause | torchvision |

La comparación es aproximada: los modelos de torchvision son genéricos de ImageNet y no están especializados en radiografía de tórax, mientras que xraynpc3 sí lo está pero carece de métricas publicadas. No se dispone de información sobre otros clasificadores de radiografía con los que comparar directamente en la documentación proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no es un dispositivo médico; no debe usarse para diagnóstico ni para decisiones clínicas.
- Ausencia total de métricas: sin exactitud, sensibilidad, especificidad ni AUC publicadas, es imposible evaluar su rendimiento real.
- Riesgo de sesgo: los conjuntos Kermany y COVID-QU-Ex tienen distribuciones demográficas y de adquisición particulares; el modelo puede generalizar mal a otras poblaciones, equipos o protocolos.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar etiquetas con alta confianza a imágenes fuera de distribución (otras patologías, artefactos, radiografías laterales), sin mecanismo de abstención documentado.
- Licencia "other" sin términos concretos: no se especifican condiciones de uso comercial, redistribución ni atribución, lo que genera incertidumbre legal para producción.
- Documentación insuficiente: no se detallan hiperparámetros, particiones de datos ni posibles fugas entre entrenamiento y test, lo que dificulta la reproducibilidad.
- Formato de entrega como state_dict: requiere código propio para instanciar la arquitectura y aplicar el preprocesado de `config.json`; no es un modelo plug-and-play con `from_pretrained`.
- Sin soporte multilingüe ni de texto: no apto para tareas de lenguaje, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoanHristov/xraynpc3
- Dataset Kermany (referencia citada en la model card): no disponible como enlace directo en la información proporcionada
- Dataset COVID-QU-Ex (referencia citada en la model card): no disponible como enlace directo en la información proporcionada
- Veritas AI 2026 (contexto del cuaderno): no disponible como enlace en la información proporcionada
- Repositorio torchvision (arquitectura ResNet-18): https://github.com/pytorch/vision
