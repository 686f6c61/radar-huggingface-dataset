# SrothJr/lyrics-genre-weighted-bert

## Resumen

`SrothJr/lyrics-genre-weighted-bert` es un modelo de clasificación de texto desarrollado por Md Nazim Hossain (SrothJr) que predice el género musical de una canción a partir de sus letras. Se trata de un fine-tuning de `google-bert/bert-base-uncased` sobre el dataset `juliensimon/autonlp-data-song-lyrics`, que contiene letras de canciones etiquetadas por género. El modelo está pensado para tareas de clasificación de géneros como Pop, Rock, Hip Hop, entre otros, y se distribuye bajo licencia Apache 2.0.

Con aproximadamente 109,5 millones de parámetros, sigue la arquitectura transformer encoder-only de BERT base (12 capas, 768 dimensiones ocultas). El nombre "weighted" sugiere que se aplicaron pesos de clase durante el entrenamiento para mitigar posibles desequilibrios en el dataset, aunque este detalle no está documentado explícitamente en la ficha del modelo. El repositorio incluye un Space de Hugging Face que permite probar el modelo directamente con letras de canciones.

La relevancia de este modelo radica en su simplicidad y accesibilidad: es un clasificador ligero, fácil de integrar en pipelines de NLP, y sirve como punto de partida para aplicaciones de análisis musical basado en texto. Sin embargo, carece de documentación detallada sobre entrenamiento, evaluación y rendimiento, lo que limita su uso en entornos de producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) con cabeza de clasificación |
| Parametros totales | 109.486.854 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de BERT base: 512 tokens) |
| Tipos de cuantizacion | No disponible (repositorio contiene safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `bert-base-uncased`, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente con masked language modeling y next sentence prediction sobre texto en inglés. Sobre esta base se añade una capa de clasificación que produce una distribución de probabilidad sobre los géneros musicales.

El fine-tuning se realizó sobre el dataset `juliensimon/autonlp-data-song-lyrics`, que contiene letras de canciones etiquetadas por género. No se han publicado detalles sobre el número de ejemplos, la composición del dataset, los hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, tamaño de lote) ni el régimen de precisión (fp32, fp16, etc.). La model card menciona que el entrenamiento se ejecutó en una GPU RTX 5090 de 32 GB durante 3 horas, pero no se especifica el número de pasos ni la configuración exacta. El nombre "weighted" sugiere el uso de pesos de clase para compensar el desbalance del dataset, aunque no hay confirmación en la documentación.

## Capacidades

- Clasificación de género musical a partir de letras de canciones en inglés (p. ej., Pop, Rock, Hip Hop).
- Inferencia de texto de longitud variable, limitada por la ventana de contexto de BERT (512 tokens).
- Integración con la librería `transformers` mediante la pipeline de `text-classification`.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face para despliegue en producción.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Es un modelo exclusivamente discriminativo.

## Casos de uso

- Organización automática de bibliotecas musicales: el modelo puede etiquetar canciones por género en colecciones personales o corporativas, facilitando la búsqueda y el filtrado. Su tamaño reducido permite ejecutarlo en CPU o GPU de gama baja.
- Recomendación musical basada en letras: integrar el clasificador en un sistema de recomendación para sugerir canciones de géneros similares según el contenido lírico, complementando señales acústicas.
- Análisis de tendencias en letras: aplicar el modelo a grandes volúmenes de letras para estudiar la evolución de géneros a lo largo del tiempo o por región, útil en investigación musicológica o de mercado.
- Etiquetado automático para plataformas de streaming: predecir el género de nuevas canciones antes de su publicación para facilitar la curación de playlists y la clasificación en catálogos.
- Filtrado de contenido por género: en aplicaciones de karaoke o letras, clasificar canciones para mostrar solo las de un género solicitado por el usuario.
- Prototipado rápido de NLP musical: al ser un modelo pequeño y con licencia permisiva, sirve como base para experimentos académicos o pruebas de concepto en clasificación de texto aplicada a música.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (F1, precisión, recall) ni comparaciones con otros modelos. El único dato de rendimiento es el tiempo de entrenamiento (3 horas en RTX 5090), que no es representativo de la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~110M parámetros. En fp32 ocupa aproximadamente 440 MB, en fp16 unos 220 MB, y con cuantización int8 podría reducirse a ~110 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100, etc. También es viable en CPU para inferencia por lotes pequeños.
- Compatible con GPUs de consumo: sí, incluso en tarjetas con 4 GB de VRAM o menos.
- Opciones de despliegue: `transformers` (Python), `text-embeddings-inference`, Hugging Face Inference Endpoints, ONNX Runtime, o conversión a GGUF para ejecución con llama.cpp (aunque no es el formato nativo).
- Latencia y throughput: no se han publicado datos. Para un modelo de este tamaño, la inferencia en GPU suele ser de pocos milisegundos por ejemplo; en CPU puede rondar los 10-50 ms dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| SrothJr/lyrics-genre-weighted-bert | BERT base | 109,5M | 512 (típico) | en | Apache 2.0 | Fine-tuning sobre letras, sin benchmarks publicados |
| Veucci/lyric-to-gene | BERT | No disponible | No disponible | en | No disponible | Predice 3 géneros (Pop, Rock, Hip-Hop) |
| Modelos de clasificación de género basados en letras (p. ej., en arXiv 2501.03769) | Multilingüe (sentence transformers) | Variable | Variable | Multilingüe | Variable | Enfoque multi-etiqueta y cross-lingual, más complejo |

No se dispone de datos de rendimiento comparativos entre estos modelos. La elección entre ellos dependerá de la cobertura de géneros, el idioma y la documentación disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no funcionará correctamente con letras en otros idiomas.
- El dataset de entrenamiento no está documentado en detalle, por lo que se desconocen posibles sesgos en la distribución de géneros, artistas o épocas.
- No hay métricas de evaluación publicadas, lo que impide conocer su precisión real y su comportamiento en casos límite.
- La ventana de contexto de 512 tokens puede truncar letras largas, perdiendo información relevante para la clasificación.
- Al ser un modelo discriminativo, no genera texto ni ofrece explicaciones de sus predicciones.
- La licencia Apache 2.0 permite uso comercial, pero al no haber garantías de rendimiento, se recomienda validar el modelo con datos propios antes de usarlo en producción.
- El repositorio no incluye un pipeline de entrenamiento reproducible ni scripts de evaluación, lo que dificulta su mantenimiento o extensión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SrothJr/lyrics-genre-weighted-bert
- Space de demostración: https://huggingface.co/spaces/SrothJr/lyrics-genre-predictor
- Repositorio GitHub: https://github.com/SrothJr/song-lyrics-genre-nlp
- Dataset de entrenamiento: https://huggingface.co/datasets/juliensimon/autonlp-data-song-lyrics
- Paper de referencia sobre clasificación de géneros con letras (no es el paper de este modelo): https://arxiv.org/html/2501.03769
