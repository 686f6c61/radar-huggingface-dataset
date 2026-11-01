# wesjos/fairface-arrowhead-tvit-race7-224

## Resumen

FairFace-ArrowHead-TinyViT-Race7-224 es un clasificador de imagen de tarea única especializado en la predicción de raza demográfica en 7 clases sobre rostros humanos. Lo desarrolla el usuario wesjos y se publica bajo licencia CC BY 4.0. Se construye mediante fine-tuning del backbone TinyViT-21M de timm (timm/tiny_vit_21m_224.dist_in22k, preentrenado con destilación en ImageNet-22k) sobre el dataset FairFace (Karkkainen & Joo, WACV 2021). No es un modelo generativo ni un LLM: es una red neuronal convolucional híbrida para visión, con 20.625.607 parámetros y entrada RGB de 224x224 píxeles.

El modelo resuelve un problema acotado: aislar la clasificación de raza en una sola cabeza de salida para maximizar la precisión en esa tarea concreta, en lugar de compartir representación con género y edad como hacen los modelos multitarea. Según la model card, esta especialización aporta +0,67 puntos porcentuales (75,43 % de accuracy) frente a sus equivalentes multitarea, a costa de no predecir género ni edad.

Su relevancia es fundamentalmente metodológica y de auditoría: está pensado para investigación de atributos faciales, medición de sesgo algorítmico y auditoría de equidad. El propio autor restringe explícitamente su uso y prohíbe aplicaciones de vigilancia, verificación de identidad, selección de personal, evaluación crediticia o cualquier decisión automatizada de alto riesgo. Es un artefacto de 0,2 GB con 0 descargas y 0 likes en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TinyViT-21M (vision transformer híbrido con convoluciones y atención) |
| Parámetros totales | 20.625.607 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos PyTorch de precisión completa; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | en (etiquetas y documentación en inglés; la tarea es visual, no lingüística) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El backbone es TinyViT-21M, una arquitectura de visión que combina bloques convolucionales con atención tipo transformer para reducir el coste computacional respecto a un ViT estándar manteniendo capacidad representacional. El checkpoint base (timm/tiny_vit_21m_224.dist_in22k, Apache-2.0) se preentrenó mediante destilación sobre ImageNet-22k. Sobre él se añade una cabeza de clasificación de 7 clases para la tarea de raza. La entrada es RGB a 224x224 con normalización estándar de ImageNet: media (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225).

El entrenamiento se realizó sobre FairFace (97.698 imágenes originales), deduplicado por contenido con SHA-256 para este proyecto: 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. El autor indica que las intersecciones entre particiones son nulas y que ninguna imagen del split oficial de entrenamiento entró en evaluación. No se documentan en la información disponible el número de épocas, el optimizador, la tasa de aprendizaje, el esquema de aumento de datos ni si hubo ajuste fino completo o parcial del backbone. Tampoco se especifica si se emplearon técnicas de reequilibrado de clases pese a que FairFace está diseñado para ser balanceado.

## Capacidades

- Clasificación de raza demográfica en 7 clases a partir de una imagen de rostro de 224x224 píxeles.
- Salida de una única etiqueta por imagen; no devuelve probabilidades calibradas documentadas ni umbrales recomendados.
- Inferencia en CPU o GPU mediante PyTorch y timm; el autor proporciona un módulo `inference` con funciones `load` y `predict`.
- Procesamiento por imagen individual; no se documenta soporte de batching nativo en la API de ejemplo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta visión general más allá de rostros, ni audio, ni generación de texto.
- No predice género ni edad (limitación explícita frente a modelos multitarea de FairFace).

## Casos de uso

- Auditoría de equidad en sistemas de visión: usar el modelo como clasificador de referencia para medir la distribución demográfica de las predicciones de otro sistema sobre un conjunto de rostros y detectar disparidades por subgrupo.
- Investigación académica sobre sesgo algorítmico: reproducir experimentos de FairFace comparando la precisión por clase entre arquitecturas y regímenes de entrenamiento, gracias a la partición de test congelada y deduplicada de 10.931 imágenes.
- Construcción de datasets etiquetados: anotar automáticamente el atributo raza en corpus de rostros para estudios demográficos, siempre con revisión humana y dentro de un marco de investigación aprobado.
- Evaluación de modelos multitarea: servir como línea base de tarea única (75,43 % de accuracy) frente a modelos que predicen raza, género y edad simultáneamente, cuantificando la pérdida por compartir representación.
- Docencia y prototipado en visión por computador: ejemplo ligero (20,6 M de parámetros, 0,2 GB) para demostrar fine-tuning de TinyViT con timm en un pipeline de clasificación de imágenes.
- Análisis de errores por subgrupo interseccional: estudiar la matriz de confusión y el recall por clase para identificar fronteras demográficas problemáticas (latino/hispano, Oriente Medio, indio y blanco), tal como advierte el autor.
- Verificación de pipelines de preprocesado: comprobar que la normalización, el redimensionado y el orden de canales son correctos comparando la salida esperada en imágenes de control.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (7 clases) | 75,43 % | no disponible | 10.931 |

El autor reporta +0,67 pp sobre modelos multitarea equivalentes. No se publican resultados de MMLU, HumanEval ni GSM8K por no ser aplicables a un clasificador de imagen. Tampoco se ofrecen métricas comparativas frente a otros backbones (ResNet, ViT, ConvNeXt) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (20,6 M de parámetros, ~82 MB de pesos); el pico real depende del tamaño de lote y de las activaciones, pero en lotes pequeños cabe holgadamente en 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo está sobredimensionado para estas GPUs, que quedarán limitadas por el preprocesado y la E/S.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU modernas; también es viable en CPU para inferencia por imagen individual.
- Opciones de despliegue: PyTorch nativo con timm y torchvision (ruta documentada por el autor). No se documentan exportaciones a ONNX, TorchScript, TensorRT, vLLM, llama.cpp ni Ollama; estas últimas no aplican a un clasificador de imagen.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| FairFace-ArrowHead-TinyViT-Race7-224 | 20,6 M | Raza (7 clases) | 224x224 | 75,43 % accuracy | CC BY 4.0 |
| FairFace multitarea (referencia del autor) | no disponible | Raza, género, edad | no disponible | ~74,76 % accuracy en raza (implícito por el +0,67 pp) | no disponible |
| Backbone timm/tiny_vit_21m_224.dist_in22k | 21 M (aprox.) | Clasificación ImageNet-22k | 224x224 | no disponible | Apache-2.0 |
| Otros clasificadores de atributos faciales | no disponible | Raza/género/edad | variable | no disponible | variable |

La comparación se limita a lo declarado por el autor; no se dispone de cifras de terceros verificables en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor prohíbe vigilancia, verificación de identidad, selección de personal, evaluación crediticia y cualquier decisión automatizada de alto riesgo.
- Las etiquetas reflejan la anotación categórica de FairFace y no la autopercepción identitaria ni el origen real de las personas; las fronteras entre latino/hispano, Oriente Medio, indio y blanco no son discretas.
- Disparidades demográficas documentadas: la estimación de edad presenta mayores tasas de error y ciertos subgrupos interseccionales género x raza muestran disparidades superiores.
- Reutilización del conjunto de evaluación: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas son descriptivas y pueden estar optimistamente sesgadas.
- Semilla única: el entrenamiento se hizo con una sola semilla; diferencias inferiores a 0,3 pp deben considerarse ruido estadístico.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en rostros fuera de distribución, con oclusión, baja resolución o iluminación adversa.
- No predice género ni edad; sustituirlo por un modelo multitarea requeriría reentrenamiento o un pipeline adicional.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero la restricción ética del autor y la naturaleza sensible del atributo (raza) pueden entrar en conflicto con normativas de protección de datos (RGPD) y con la regulación europea de IA de alto riesgo.
- El dataset de origen procede de YFCC100M bajo licencias diversas; conviene revisar la procedencia de las imágenes antes de cualquier redistribución.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria independiente ni informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/fairface-arrowhead-tvit-race7-224
- Backbone base: https://huggingface.co/timm/tiny_vit_21m_224.dist_in22k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (Karkkainen & Joo, WACV 2021): https://arxiv.org/abs/1908.04913
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- TinyViT (paper de referencia de la arquitectura): https://arxiv.org/abs/2207.10666
