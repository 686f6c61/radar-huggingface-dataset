# yashaggu/smai-a4-iocnn

## Resumen

`smai-a4-iocnn` es un modelo de red neuronal totalmente conectada (MLP) publicado en Hugging Face por el usuario `yashaggu` como parte de una asignación académica de la asignatura SMAI (Statistical Methods for Artificial Intelligence). No se trata de un modelo de lenguaje ni de un transformer, sino de un clasificador de imágenes para el conjunto de datos CIFAR-10 con una arquitectura muy reducida de tres capas densas (3072-256-128-10). El repositorio, creado el 2 de noviembre de 2026, tiene un tamaño de 0.0 GB y cero descargas, lo que indica que es un artefacto educativo sin difusión.

El modelo resuelve una tarea de clasificación de imágenes en 10 clases (las categorías de CIFAR-10) a partir de imágenes de 32x32 píxeles en color, aplanadas a un vector de 3072 dimensiones. Su relevancia es exclusivamente docente: sirve como ejemplo canónico de perceptrón multicapa con activación ELU, función de pérdida de entropía cruzada y optimizador SGD, y no está pensado para uso en producción ni para aplicaciones del mundo real.

La información disponible es extremadamente limitada: no hay model card completa, no se especifican licencia, idiomas ni pipeline, y no se publican métricas de rendimiento. Todo lo que se sabe proviene de una descripción muy breve incluida en el README, que detalla la arquitectura, el preprocesado y los hiperparámetros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 3072-256-128-10 |
| Parametros totales | 819.466 (calculado a partir de la arquitectura: 3072×256 + 256 + 256×128 + 128 + 128×10 + 10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 3072 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el README menciona un archivo `.npz` con pesos `W{i}` y `b{i}`, así como `mean` y `std`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa con tres capas densas: una capa de entrada de 3072 unidades (correspondiente a la imagen CIFAR-10 aplanada de 32×32×3), una capa oculta de 256 unidades, una segunda capa oculta de 128 unidades y una capa de salida de 10 unidades (una por clase). La activación de las capas ocultas es ELU (Exponential Linear Unit). La función de pérdida es entropía cruzada y el optimizador es descenso de gradiente estocástico (SGD) con tasa de aprendizaje 0.05 y tamaño de lote 64, durante 100 épocas. El README indica explícitamente "true labels (p = 0)", lo que sugiere que el entrenamiento se realizó con etiquetas limpias, sin ruido de etiqueta.

El preprocesado consiste en aplanar cada imagen de 32×32×3 a un vector de 3072 dimensiones, dividir entre 255 para normalizar los valores de píxel al rango [0, 1] y estandarizar con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10; estos dos vectores se almacenan en el archivo `.npz` junto con los pesos. No se menciona ninguna innovación técnica adicional (sin atención, sin conexiones residuales, sin normalización por lotes, sin data augmentation, sin regularización explícita). No hay información sobre si se usó validación cruzada, parada temprana ni ajuste de hiperparámetros.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles en color en una de las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre vectores de 3072 dimensiones preprocesados con la media y desviación típica almacenadas en el `.npz`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión más allá de la clasificación de imágenes de baja resolución.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Docencia de fundamentos de aprendizaje profundo: el modelo sirve como ejemplo mínimo y reproducible de un MLP entrenado con SGD y entropía cruzada, útil en asignaturas introductorias para ilustrar el flujo completo de preprocesado, entrenamiento y evaluación.
- Práctica de implementación de retropropagación: al ser una red de tres capas con tamaños explícitos, permite a los estudiantes derivar y verificar manualmente los gradientes de cada capa.
- Comparación de funciones de activación: el uso de ELU frente a ReLU o tanh en una tarea estándar como CIFAR-10 permite experimentos controlados sobre el efecto de la activación en la convergencia.
- Estudio de normalización de entradas: el almacenamiento explícito de `mean` y `std` en el `.npz` facilita analizar el impacto de la estandarización en el entrenamiento de redes densas.
- Referencia para reproducibilidad académica: al documentar hiperparámetros exactos (lr 0.05, batch 64, 100 épocas, etiquetas limpias), el repositorio puede usarse como línea base en prácticas de reproducibilidad.
- Análisis de limitaciones de los MLP en visión: comparar su rendimiento con el de CNN sobre CIFAR-10 es un ejercicio habitual para mostrar la importancia de la invariancia traslacional y el sesgo inductivo convolucional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (819.466 parámetros × 4 bytes ≈ 3,3 MB para los pesos, más overhead mínimo); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo puede ejecutarse incluso en CPU sin penalización significativa.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 2060, RTX 4090, etc.), así como en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: no se especifican en la información disponible; al tratarse de un `.npz` con pesos y vectores de normalización, el despliegue requeriría cargar los arrays con NumPy y reimplementar la propagación hacia delante (por ejemplo, en Python puro o con PyTorch/JAX). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; para una red de este tamaño, la inferencia por muestra en CPU es del orden de microsegundos a milisegundos, pero no se proporcionan mediciones.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de la misma categoría (MLP académico para CIFAR-10) con parámetros, contexto, rendimiento, licencia y disponibilidad documentados. Como referencia conceptual, una CNN pequeña tipo LeNet-5 sobre CIFAR-10 suele superar a un MLP de tamaño similar, pero no se dispone de datos concretos de este repositorio para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo puramente académico: no está diseñado ni validado para uso en producción.
- Sin licencia especificada: no se puede asumir permiso para uso comercial ni redistribución; es necesario contactar con el autor.
- Sin métricas de rendimiento publicadas: se desconoce la precisión en el conjunto de test de CIFAR-10, por lo que no se puede evaluar su calidad objetivamente.
- Arquitectura MLP sin sesgo inductivo convolucional: previsiblemente inferior a las CNN en clasificación de imágenes, aunque no se aportan números.
- Entrada fija de 3072 dimensiones: no admite imágenes de otras resoluciones sin un preprocesado equivalente.
- Preprocesado dependiente del `.npz`: la media y la desviación típica deben cargarse del archivo; usar otras distintas degradaría el rendimiento.
- Riesgo de sobreajuste no documentado: no se mencionan técnicas de regularización (dropout, weight decay, data augmentation) ni curvas de validación.
- Sin información sobre sesgos: al entrenarse con CIFAR-10, hereda los sesgos y desequilibrios de ese conjunto de datos, pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashaggu/smai-a4-iocnn
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
