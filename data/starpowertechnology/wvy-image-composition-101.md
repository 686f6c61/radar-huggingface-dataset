# StarpowerTechnology/WVY-Image-Composition-101

## Resumen

WVY-Image-Composition-101 es un modelo de texto a imagen de 7,8 millones de parámetros desarrollado por StarpowerTechnology (bajo la marca WVY) y escrito desde cero en numpy, sin frameworks de aprendizaje profundo. No es un modelo pensado para producción: es un experimento educativo y de investigación sobre generalización composicional y curación de datos. La tesis que demuestra es que un modelo pequeño entrenado con datos intencionadamente diseñados puede generar combinaciones que nunca ha visto, en lugar de necesitar millones de imágenes.

El modelo se entrenó con solo 6 sprites PNG transparentes de animales y 8 colores de fondo, lo que permite componer 480 escenas posibles (6 animales × 5 compañeros × 2 disposiciones × 8 colores) a partir de 14 ingredientes. De esas 480 escenas, 361 se usaron en entrenamiento y 119 se reservaron como conjuntos de prueba con combinaciones no vistas: nuevos colores y pilas invertidas de animales.

Su relevancia es metodológica, no de rendimiento: ilustra cómo el diseño del dataset (qué se retiene y qué se deja fuera) determina la capacidad de generalización de un modelo. La arquitectura es una red totalmente conectada de dos capas (512 y 1024 neuronas) que recibe palabras codificadas con una etiqueta de posición y produce píxeles RGB de 48×48. La licencia es Apache 2.0 y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada (MLP) de dos capas ocultas (512 y 1024 neuronas), implementada a mano en numpy |
| Parámetros totales | 7,8 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta dos plantillas de frase fijas, no una ventana de contexto) |
| Tipos de cuantización | no disponible (pesos en formato numpy, sin cuantización publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` de numpy (`wvy_compose_weights.npz`) |

## Arquitectura y entrenamiento

La arquitectura es una MLP de dos capas ocultas (512 y 1024 neuronas) que mapea una secuencia de palabras codificadas a una imagen RGB de 48×48 píxeles. Cada palabra se representa con 24 números más una etiqueta que indica su posición en la frase; esa etiqueta de posición es la única señal que distingue "cat … dog" de "dog … cat", ya que ambas frases usan exactamente las mismas palabras. La propagación hacia delante, la retropropagación y el optimizador Adam están escritos a mano en numpy, y los gradientes se verificaron contra estimaciones numéricas antes del entrenamiento. No hay ningún componente preentrenado: los 7,8 millones de pesos parten de valores aleatorios.

El entrenamiento consistió en 9.000 pasos sobre 2 núcleos de CPU, con una duración aproximada de 21 minutos. El dataset se genera de forma procedural a partir de 6 sprites dibujados en código y 8 colores de fondo, con leyendas exactas del tipo "a dog on top of a cat on a green background". La innovación no está en la arquitectura, sino en la curación de datos: 361 escenas para entrenar y 119 reservadas (87 con color nuevo y 32 con pila invertida, esta última oculta en todos los colores durante el entrenamiento). Las curvas de error de los conjuntos no vistos descienden junto con la de entrenamiento, lo que el autor interpreta como evidencia de aprendizaje de partes y no de memorización.

## Capacidades

- Generación de imágenes de 48×48 píxeles a partir de dos plantillas de texto fijas: "a <animal> on top of a <animal> on a <color> background" y "a <animal> next to a <animal> on a <color> background".
- Composición por capas: apila fondo, animal inferior y animal superior siguiendo el orden de las palabras.
- Generalización composicional: genera escenas no vistas durante el entrenamiento, incluyendo combinaciones con colores nuevos y pilas de animales invertidas.
- Vocabulario cerrado de 6 animales (dog, cat, bird, fish, pig, rabbit) y 8 colores (white, black, red, orange, yellow, green, blue, purple).
- Generación determinista: la misma instrucción produce siempre la misma imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo conversacional ni multilingüe.

## Casos de uso

- Docencia sobre generalización composicional: el modelo sirve para explicar en clase la diferencia entre memorizar y componer, ya que el conjunto de prueba con pilas invertidas demuestra generalización a partir del orden de las palabras.
- Enseñanza de retropropagación desde cero: el código de `model.py` incluye forward pass, backprop y Adam escritos a mano en numpy, verificación de gradientes y un entrenamiento completo en unos 20 minutos de CPU, lo que lo hace apto para prácticas de laboratorio.
- Investigación sobre curación de datos: permite experimentar con el diseño del dataset (qué combinaciones se retienen y cuáles se reservan) y medir el impacto en la generalización sin coste computacional relevante.
- Prueba de concepto de modelos mínimos: útil para validar pipelines de entrenamiento, evaluación y generación en entornos sin GPU ni dependencias pesadas (solo numpy y Pillow).
- Reproducibilidad y auditoría: al ser determinista y entrenarse en minutos, sirve como banco de pruebas para estudiar memorización, fugas de datos y contabilidad de conjuntos de prueba.
- Generación de ilustraciones planas controladas: dentro de su vocabulario cerrado, puede producir composiciones de sprites para prototipos, maquetas o demostraciones educativas, sin expectativa de variedad ni realismo.
- Análisis de artefactos de generalización: los "fantasmas" (contornos borrosos de otros animales) que aparecen en escenas no vistas permiten estudiar visualmente la frontera entre memorización y generalización.

## Benchmarks y rendimiento

| Split | Prompts | Error de píxel (MSE) | Escena correcta* | Más cerca de la respuesta correcta que de cualquier escena estudiada |
|---|---|---|---|---|
| Visto en entrenamiento | 361 | 0,000002 | 100% | 100% |
| No visto · color nuevo | 87 | 0,00019 | 100% | 100% |
| No visto · pila invertida | 32 | 0,00057 | 100% | 100% |

\*De las 480 escenas posibles, la imagen generada es la más cercana a la solicitada en la instrucción.

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas son internas al experimento (error cuadrático medio sobre píxeles y clasificación entre 480 escenas candidatas) y no son comparables con benchmarks estándar de texto a imagen como FID, CLIPScore o GenEval.

## Requisitos de hardware

- Inferencia en CPU: el modelo requiere únicamente numpy y Pillow; no necesita GPU.
- VRAM estimada: no aplica, ya que la inferencia se ejecuta en CPU y el conjunto de pesos es de 7,8 millones de parámetros (del orden de decenas de MB en `.npz`).
- GPU recomendadas: ninguna; el entrenamiento completo se realizó en 2 núcleos de CPU en unos 21 minutos.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: scripts de Python incluidos (`generate.py`, `model.py`, `evaluate.py`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo y la resolución de salida (48×48), la generación es prácticamente instantánea en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WVY-Image-Composition-101 | 7,8 M | Dos plantillas de frase fijas en inglés | 48×48 RGB | Apache 2.0 | Hugging Face, pesos `.npz` |
| Modelos de texto a imagen de difusión (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | Instrucciones en lenguaje natural | 512×512 o superior | Varía según modelo | Hugging Face, safetensors |
| Modelos de texto a imagen comerciales | No disponible | Instrucciones en lenguaje natural | Alta resolución | Propietaria | API |

No se dispone de comparaciones cuantitativas con alternativas en la información proporcionada. La comparación relevante es conceptual: frente a los modelos de difusión, este modelo no compite en calidad, resolución ni variedad, sino en coste de entrenamiento, transparencia y capacidad de demostrar generalización composicional con datos mínimos.

## Limitaciones y advertencias

- Los animales son dibujos planos generados en código, no fotografías; no se modelan interacciones de iluminación como el reflejo de una pared roja sobre el pelaje.
- El modelo es determinista: la misma instrucción produce siempre la misma imagen, sin variedad.
- Solo interpreta dos formas de frase; cualquier otra entrada no se procesa correctamente.
- No puede dibujar nada fuera de sus 14 ingredientes (6 animales y 8 colores); dentro de ellos, generaliza a combinaciones no vistas.
- En escenas no vistas aparecen "fantasmas": contornos borrosos de otros animales filtrados en el fondo, artefacto de la mezcla con el promedio de lo visto.
- El vocabulario es cerrado y en inglés; no hay soporte multilingüe ni de instrucciones libres.
- La resolución de salida es de 48×48 píxeles, insuficiente para cualquier uso gráfico real.
- No es un modelo de propósito general ni apto para producción: es un experimento educativo y de investigación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece capacidades útiles para productos comerciales de generación de imagen.
- Riesgo de alucinación en el sentido de composición incorrecta: fuera de las dos plantillas o del vocabulario cerrado, la salida no es fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101
- Vídeo explicativo: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/media/how_to_generate_intentionally.mp4
- Figura de ingredientes: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/media/fig_ingredients.png
- Figura de pares no vistos: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/media/fig_unseen_pairs.png
- Figura de la tira "cat on top of dog": https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/media/fig_strip_cat_on_dog.png
- Curva de entrenamiento: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/media/fig_curve.png
- Pesos entrenados: https://huggingface.co/StarpowerTechnology/WVY-Image-Composition-101/resolve/main/wvy_compose_weights.npz
- Paper: no disponible
- Repositorio de código independiente: no disponible (los scripts `data.py`, `model.py`, `evaluate.py` y `generate.py` se distribuyen en el propio repositorio de Hugging Face)
- Demo interactiva: no disponible
