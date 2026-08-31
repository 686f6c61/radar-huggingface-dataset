# WillNuyen228/auramask-heavy_pixelate

## Resumen

Auramask-heavy_pixelate es un modelo de transformación imagen a imagen desarrollado por WillNuyen228 que aplica un efecto de pixelado intenso ("heavy pixelate") a fotografías, con el objetivo de producir un resultado estéticamente coherente y de alta calidad percibida, similar al aspecto de un videojuego de baja resolución. El modelo se basa en una arquitectura de tipo VNet (una red convolucional en forma de U) y se entrenó utilizando como supervisión combinada funciones de pérdida que incluyen TopIQ (un metric de calidad de imagen sin referencia), distancia coseno de características ArcFace y error cuadrático medio, lo que permite preservar la identidad visual de forma controlada mientras se degrada la imagen.

La relevancia de este modelo radica en su enfoque adversarial y perceptual: no se limita a aplicar un filtro de pixelado simple, sino que optimiza la salida para que sea visualmente agradable y mantenga cierta coherencia semántica. Está pensado para usos creativos, protección de privacidad en imágenes o generación de contenido con estética retro. El repositorio incluye pesos en formato Keras (0,1 GB) y una licencia GPL-3.0, lo que permite uso comercial siempre que se mantenga la misma licencia en derivados. No se especifican parámetros totales ni otros detalles de arquitectura más allá de los hiperparámetros publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VNet (red convolucional encoder-decoder con conexiones skip) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato Keras; posible conversión a TFLite) |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | Keras (H5/keras) |

## Arquitectura y entrenamiento

La arquitectura es una VNet, similar a una U-Net, con una secuencia de capas convolucionales y de muestreo descendente (encoder) y ascendente (decoder). Según la configuración JSON del modelo, la red tiene 5 niveles con filtros [16, 32, 64, 128, 128], activación ReLU, sin normalización por lotes, regularización L2 en los kernels y una salida de 3 canales (imagen RGB). El tamaño de entrada es de 256×256 píxeles.

El entrenamiento se realizó sobre el dataset FDF (logasja/FDF) con un 90% de datos para entrenamiento y 10% para test. Se usó el optimizador Adam con learning rate de 1e-4, clipnorm 1, batch size 16 y 50 épocas. La función de pérdida combina tres términos: TopIQ (peso 0,9, con referencia completa, rango ~0-1), distancia coseno de características ArcFace (peso 0,1, umbral 0,68) y MSE (peso 0,1). Además se aplica un ataque adversarial con epsilon 0,03 y alpha 0,0001, lo que sugiere que el modelo se entrena para ser robusto frente a perturbaciones o para generar salidas que engañen a extractores de características faciales. No se menciona uso de RLHF ni DPO, al ser un modelo de visión puro.

## Capacidades

- Transformación imagen a imagen: aplica un filtro de pixelado intenso a imágenes de entrada.
- Preservación de calidad percibida: optimiza la salida según TopIQ, un metric de calidad de imagen sin referencia.
- Control de identidad: mediante la pérdida ArcFace, mantiene cierto grado de similitud facial (aunque sea reducida) respecto a la imagen original.
- Ataque adversarial: el entrenamiento con epsilon/alpha sugiere que el modelo es robusto a perturbaciones o que genera salidas que dificultan el reconocimiento facial por parte de extractores como ArcFace o VGGFace.
- Generación de estética retro: produce resultados que imitan el aspecto de videojuegos antiguos con pixelado marcado.
- No soporta texto, ni tool calling, ni agentes, ni razonamiento multi-paso.

## Casos de uso

- Protección de privacidad en imágenes: pixelar rostros o escenas completas antes de publicarlas en redes sociales o en entornos públicos, manteniendo una estética aceptable.
- Creación de contenido artístico: generar imágenes con estilo pixel art para ilustraciones, portadas de juegos o diseños gráficos.
- Preprocesamiento para datasets: anonimizar imágenes de entrenamiento eliminando información facial identificable, útil para cumplir normativas de protección de datos.
- Filtros para aplicaciones de cámara: integrar el modelo en apps móviles para aplicar efectos de pixelado en tiempo real (requeriría conversión a TFLite).
- Simulación de juegos retro: generar texturas o capturas de pantalla con aspecto de consolas de 8/16 bits.
- Investigación en calidad de imagen: como modelo de referencia para estudiar el equilibrio entre degradación y calidad percibida (TopIQ).
- Pruebas de robustez de sistemas de reconocimiento facial: evaluar cómo afecta el pixelado adversarial a la precisión de ArcFace/VGGFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las métricas mencionadas en la model card (TopIQ-FR, ArcFace Cosine Distance, VGGFace2 Cosine Distance) aparecen como identificadores pero sin valores concretos. No se proporcionan comparaciones con otros modelos de pixelado o filtros similares.

## Requisitos de hardware

- Al ser un modelo pequeño (0,1 GB) con arquitectura VNet de 5 niveles y filtros modestos, la inferencia es ligera.
- VRAM estimada: muy baja, probablemente menos de 1 GB para una imagen de 256×256. No se dispone de datos exactos.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1050 Ti, RTX 2060) o incluso CPU para inferencia por lotes pequeña.
- Es adecuado para hardware de consumo (portátiles, mini-PCs) y para despliegue en edge si se convierte a TFLite.
- Opciones de despliegue: al ser Keras, se puede ejecutar con TensorFlow, y exportar a TFLite para móviles. No hay integración nativa con vLLM, llama.cpp u Ollama (no es un LLM).
- Latencia y throughput: no disponibles, pero se espera que sea rápido (decenas de milisegundos por imagen en GPU).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de pixelado (p. ej., filtros clásicos de OpenCV, modelos de super-resolución inversa o generadores adversariales). Se puede señalar que, frente a un simple remuestreo por vecino más cercano (pixelado estándar), Auramask-heavy_pixelate añade una componente de optimización perceptual y adversarial, pero no hay datos comparativos publicados. Por tanto, la comparativa se limita a una descripción cualitativa:

- Filtro de pixelado clásico (OpenCV): simple, rápido, sin control de calidad ni preservación de identidad.
- Modelos de anonimización facial (p. ej., DeepPrivacy): se centran en reemplazar rostros, no en pixelar toda la imagen.
- Auramask-heavy_pixelate: ofrece pixelado global con métricas de calidad integradas y entrenamiento adversarial, aunque su alcance es más específico.

No se dispone de modelos comparables con los mismos objetivos y métricas en la información proporcionada.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al entrenarse con el dataset FDF (cuyo contenido no se detalla) podría heredar sesgos de ese conjunto de datos.
- Riesgo de alucinación: no aplica directamente, pero en tareas de pixelado podría generar artefactos visuales no deseados en regiones de alto detalle.
- Limitaciones de contexto: solo procesa imágenes de 256×256; para resoluciones mayores requeriría redimensionado o adaptación.
- Restricciones de licencia: GPL-3.0 obliga a que cualquier obra derivada distribuida se publique bajo la misma licencia. Esto puede afectar a su uso en productos comerciales cerrados.
- No se garantiza la eficacia real del pixelado adversarial frente a sistemas de reconocimiento facial modernos; se recomienda validar en cada caso de uso.
- La documentación es escasa: no hay detalles sobre el dataset FDF, ni sobre la procedencia de las imágenes, ni sobre el rendimiento en condiciones reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WillNuyen228/auramask-heavy_pixelate
- Training logs (Weights & Biases): https://wandb.ai/spuds/auramask/runs/3h7tb0ai
- Versión hermana (pixelado ligero): https://huggingface.co/WillNuyen228/auramask-pixelate
- Integración en plataforma a1.art: https://a1.art/model/auramask-heavypixelate
