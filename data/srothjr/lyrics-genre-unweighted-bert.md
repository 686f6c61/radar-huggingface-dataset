# SrothJr/lyrics-genre-unweighted-bert

## Resumen

El modelo `SrothJr/lyrics-genre-unweighted-bert` es un clasificador de texto basado en BERT, desarrollado por Md Nazim Hossain (SrothJr), que asigna un género musical a letras de canciones en inglés. Se trata de un fine-tuning de `google-bert/bert-base-uncased` sobre el dataset `juliensimon/autonlp-data-song-lyrics`, un conjunto de datos de letras etiquetadas por género. El modelo resuelve la tarea de clasificación de géneros musicales a partir del texto de las letras, un problema relevante para aplicaciones de recomendación musical, análisis de contenido y organización de bibliotecas de canciones.

Con 109,5 millones de parámetros y una arquitectura transformer encoder-only de 12 capas, el modelo hereda las capacidades de BERT base, incluyendo una ventana de contexto de 512 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque la model card es muy escasa en detalles técnicos, el modelo está disponible en formato safetensors y es compatible con la librería Transformers y con Text Embeddings Inference, lo que facilita su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder-only, transformer) |
| Parametros totales | 109.486.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT base) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT base, un transformer encoder-only de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con un total de 109,5 millones de parametros. La capa de clasificacion anade una cabeza lineal sobre el token `[CLS]` para predecir la etiqueta de genero musical. El entrenamiento se realizo mediante fine-tuning sobre el dataset `juliensimon/autonlp-data-song-lyrics`, que contiene letras de canciones en ingles etiquetadas por genero. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de regularizacion o ajuste de hiperparametros. La model card indica que el entrenamiento se realizo en una GPU RTX 5090 de 32 GB durante aproximadamente 3 horas, pero no se especifican hiperparametros como tasa de aprendizaje, batch size o numero de epocas.

## Capacidades

- Clasificacion de genero musical a partir de letras de canciones en ingles.
- Procesamiento de texto de hasta 512 tokens, suficiente para la mayoria de letras de canciones.
- Inferencia rapida gracias al tamano compacto de BERT base (109M parametros).
- Compatible con pipelines de Transformers para clasificacion de texto.
- Soporte para despliegue con Text Embeddings Inference y endpoints compatibles.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Recomendacion musical: un servicio de streaming puede usar el modelo para etiquetar automaticamente nuevas canciones por genero y mejorar sus algoritmos de recomendacion, procesando las letras como entrada.
- Organizacion de bibliotecas musicales: herramientas de gestion de archivos de audio pueden clasificar canciones sin metadatos, usando las letras extraidas para asignar genero y facilitar la busqueda.
- Analisis de tendencias musicales: investigadores o analistas de la industria pueden clasificar grandes volumenes de letras para estudiar la evolucion de generos a lo largo del tiempo o por region.
- Curacion de playlists: plataformas de creacion de playlists pueden agrupar canciones por genero de forma automatica, ahorrando trabajo manual a los usuarios.
- Moderacion de contenido: servicios que alojan letras de usuarios pueden verificar que el genero declarado coincide con el contenido, detectando errores de etiquetado.
- Enriquecimiento de metadatos: bases de datos musicales pueden completar campos de genero faltantes en registros existentes, mejorando la calidad de sus datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como F1, precision o recall, ni comparaciones con otros modelos. El unico dato de rendimiento indirecto es el tiempo de entrenamiento (3 horas en una RTX 5090), que no permite estimar la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109M parametros), menos de 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs consumer como GTX 1060, RTX 3060 o superiores.
- Cabe en GPUs consumer de gama baja y media sin problemas.
- Opciones de despliegue: Transformers (Python), Text Embeddings Inference, endpoints de Hugging Face, ONNX Runtime, TensorRT.
- Latencia estimada: en CPU moderna, inferencia de una muestra en 10-50 ms; en GPU, 1-5 ms por muestra.
- Throughput estimado: cientos de muestras por segundo en GPU, decenas en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para clasificacion de genero musical a partir de letras. Como referencia general, se puede comparar con otros fine-tunes de BERT base para clasificacion de texto, pero no hay datos publicados de este modelo concreto. Se indica "no disponible" para la comparativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre un dataset de letras en ingles, por lo que puede tener sesgos hacia generos y estilos musicales predominantes en ese idioma y region.
- Riesgo de alucinacion: como clasificador, no genera texto, pero puede producir etiquetas incorrectas si la letra es ambigua o pertenece a un genero poco representado en el dataset.
- Limitaciones de contexto: la ventana de 512 tokens puede truncar letras muy largas, perdiendo informacion relevante para la clasificacion.
- Limitaciones de idioma: solo soporta ingles; letras en otros idiomas produciran resultados poco fiables.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias restricciones que no se detallan en la model card.
- Caveat de produccion: la model card no incluye informacion sobre la distribucion de clases, el numero de generos soportados ni la calidad del etiquetado del dataset, por lo que se recomienda evaluar el modelo en datos propios antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/SrothJr/lyrics-genre-unweighted-bert
- Dataset de entrenamiento: https://huggingface.co/datasets/juliensimon/autonlp-data-song-lyrics
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de referencia (BERT): https://arxiv.org/abs/1910.09700
