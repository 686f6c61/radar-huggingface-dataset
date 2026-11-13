# vishwajeet456/Cnn-classifierupdate2

## Resumen

Cnn-classifierupdate2 es un clasificador de imágenes convolucional de tipo VGG compacto, entrenado desde cero sobre el conjunto de datos CIFAR-10 por Vishwajeet Adkine (usuario `vishwajeet456`). Con 1.197.578 parámetros, alcanza un 92,23% de precisión top-1 en el conjunto de test y se entrena en aproximadamente 8,5 minutos sobre una única GPU Tesla T4. No es un modelo de lenguaje ni un modelo fundacional: es una red neuronal convolucional (CNN) de visión por computador destinada a clasificación de imágenes de 32×32 píxeles en 10 categorías.

El modelo se publica como material educativo y de portafolio: sirve como línea base reproducible para CIFAR-10 y para experimentos de ablación, aumento de datos o compresión. No está pensado para reconocimiento de imágenes del mundo real, ya que solo conoce las 10 clases de CIFAR-10 y opera exclusivamente a resolución 32×32. Su relevancia es, por tanto, docente y experimental, no de producción.

La ficha se elabora a partir de la model card y de los metadatos disponibles en Hugging Face. El repositorio no contiene pesos en formatos estándar de despliegue (safetensors o GGUF) y su tamaño es de 0,0 GB en el momento de la consulta, por lo que la disponibilidad efectiva de los pesos no está confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN VGG-style: 3 bloques de 2 capas conv 3×3 (64, 128, 256 canales) con BatchNorm y ReLU, max-pooling entre bloques, global average pooling, cabecera Linear(256→192) → ReLU → Dropout(0.3) → Linear(192→10) |
| Parametros totales | 1.197.578 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3×32×32 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card menciona `cifar_cnn.pt`, pero el repositorio figura con 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es una CNN puramente convolucional, sin mecanismos de atención ni componentes recurrentes. Consta de tres bloques, cada uno con dos convoluciones 3×3 seguidas de BatchNorm y ReLU, con max-pooling entre bloques; los canales escalan 64 → 128 → 256. Tras el último bloque se aplica global average pooling y una cabecera densa de dos capas con dropout de 0,3. La entrada es una imagen RGB de 3×32×32 normalizada con la media y desviación típica de CIFAR-10, y la salida son logits para 10 clases.

El entrenamiento se realizó desde cero sobre CIFAR-10 con un reparto de 45.000 imágenes de entrenamiento, 5.000 de validación y 10.000 de test. Se aplicó aumento de datos con recorte aleatorio (padding 4) y volteo horizontal. El optimizador fue SGD con momento de Nesterov 0,9 y weight decay 5e-4, con un schedule one-cycle de tasa de aprendizaje (máximo 0,1, 20% de warm-up). Se usó label smoothing 0,1 y dropout 0,3 como regularización, 30 épocas con batch de 128 y precisión mixta. La selección del modelo se hizo por mejor precisión de validación, y el conjunto de test se evaluó una sola vez tras esa selección. No se reporta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes RGB de 32×32 píxeles en 10 clases: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Salida de logits por clase, apta para calcular probabilidades mediante softmax y para análisis de confianza.
- Evaluación top-1 y top-3 (98,77% en top-3 según la model card).
- Entrenamiento reproducible desde cero con un coste computacional muy bajo (8,5 minutos en T4).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión de alta resolución, audio ni otras modalidades.

## Casos de uso

- Docencia de visión por computador: el modelo sirve como ejemplo completo y reproducible de una CNN VGG compacta, con definición de arquitectura, pipeline de entrenamiento y métricas, adecuado para prácticas de laboratorio.
- Línea base para experimentos de ablación: su bajo coste de entrenamiento (8,5 minutos en T4) permite comparar variantes de aumento de datos, schedule de learning rate o regularización con rapidez.
- Pruebas de compresión y cuantización: con 1,2M de parámetros es un candidato manejable para estudiar poda, destilación o cuantización y medir la caída de precisión top-1 frente al 92,23% de referencia.
- Validación de pipelines de MLOps: al ser pequeño y rápido de entrenar, se puede usar para probar integraciones de seguimiento de experimentos, versionado de modelos o empaquetado de inferencia sin consumir recursos significativos.
- Demostraciones de clasificación de imágenes en el navegador o en dispositivos de borde: el tamaño reducido del modelo permite exportarlo y ejecutarlo en entornos con recursos limitados, siempre que las entradas se reescaleen a 32×32.
- Generación de conjuntos de etiquetas sintéticas para prototipos: en etapas tempranas de un proyecto se puede emplear para etiquetar rápidamente imágenes de las 10 clases de CIFAR-10 y validar la lógica de un pipeline antes de sustituirlo por un modelo de producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision top-1 en test | 92,23% |
| Precision top-3 en test | 98,77% |
| Mejor precision de validacion | 91,66% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y se refieren al conjunto de test de CIFAR-10, evaluado una sola vez tras la selección sobre validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con precisión FP32; el modelo tiene 1,2M de parámetros y una entrada de 3×32×32, por lo que el pico de memoria es mínimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor reporta entrenamiento en una Tesla T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, entre otras) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y `load_state_dict`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes. Para servir el modelo sería necesario un wrapper propio (por ejemplo, FastAPI o TorchServe).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia muy baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision top-1 en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cnn-classifierupdate2 | 1.197.578 | 3×32×32 | 92,23% | MIT | Repositorio Hugging Face (0,0 GB, pesos no confirmados) |
| ResNet-20 (referencia CIFAR) | ~0,27M | 3×32×32 | no disponible en esta ficha | no disponible | Implementaciones públicas en distintos repositorios |
| VGG-11 (referencia CIFAR) | ~9,2M | 3×32×32 | no disponible en esta ficha | no disponible | Implementaciones públicas en distintos repositorios |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa fiable con alternativas. Las filas de ResNet-20 y VGG-11 se incluyen solo como referencia de categoría y tamaño; sus cifras de precisión no se han verificado en esta ficha y se marcan como no disponibles.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes CIFAR-10 de 32×32 píxeles; la precisión caerá con fotos de otras fuentes, otras resoluciones u objetos fuera de las 10 clases.
- No se han realizado pruebas de robustez frente a ruido, desenfoque, ejemplos adversarios ni cambio de distribución.
- Las clases gato y perro son habitualmente las más difíciles en CIFAR-10; conviene revisar la matriz de confusión antes de confiar en resultados por clase.
- El modelo siempre devuelve una de las 10 clases, incluso ante imágenes no relacionadas, sin mecanismo de rechazo ni umbral de confianza incorporado.
- Sesgos conocidos: no se documentan análisis de sesgo; el conjunto CIFAR-10 tiene una composición y distribución específicas que pueden no representar otros dominios.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza; no aplica el concepto de alucinación de modelos generativos.
- Restricciones de licencia: MIT permite uso comercial, pero la model card restringe explícitamente el uso previsto a fines educativos y de portafolio, y desaconseja tareas de reconocimiento del mundo real.
- Caveat para producción: el repositorio figura con 0,0 GB y no se confirma la presencia de los pesos; la carga requiere la definición de la clase `CifarCNN` desde el cuaderno de entrenamiento, no incluida como archivo independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishwajeet456/Cnn-classifierupdate2
- Página del conjunto de datos CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
