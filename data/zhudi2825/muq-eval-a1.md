# zhudi2825/MuQ-Eval-A1

## Resumen

MuQ-Eval-A1 es un evaluador neuronal de calidad de música generada por IA. Se construye sobre el encoder preentrenado MuQ-large-msd-iter (mantenido congelado) y añade un pooling por atención aprendido junto con cabezas MLP independientes por dimensión para predecir puntuaciones tipo MOS. Lo desarrolla Di Zhu (usuario zhudi2825) y se publica bajo licencia MIT. El modelo resuelve un problema concreto: disponer de una métrica automática, objetiva y por muestra para evaluar sistemas de generación musical, en lugar de depender únicamente de evaluaciones humanas costosas.

La variante A1_frozen_mlp corresponde a la configuración con encoder congelado y cabezas MLP, con dos cabezas de predicción (MI y TA), pérdida MSE y entrada de audio mono a 24 kHz con un máximo de 10 segundos. El repositorio ocupa 2,7 GB, coherente con el tamaño del encoder MuQ-large incluido en los pesos. La relevancia actual radica en que la evaluación de música generativa carece de métricas estandarizadas equivalentes a las de texto o imagen, y propuestas abiertas como esta permiten comparar sistemas de forma reproducible.

El modelo se ha entrenado sobre MusicEval (2.748 clips, 31 sistemas TTM) con validación cruzada estratificada de 5 folds por modelo generador, lo que reduce el riesgo de fuga de información entre sistemas. No es un modelo generativo: es un clasificador/regresor de audio orientado a la predicción de calidad, y debe tratarse como componente de un pipeline de evaluación, no como generador musical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (MuQ-large-msd-iter) + attention pooling + cabezas MLP por dimensión |
| Parametros totales | no disponible (el repo pesa 2,7 GB, dominado por el encoder MuQ-large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de hasta 10,0 s a 24 kHz (240.000 muestras) |
| Tipos de cuantizacion | no disponible (pesos en checkpoint PyTorch `best_model.pt`); entrenado en bf16 |
| Idiomas soportados | en (etiqueta de idioma del repo); la tarea es audio, no texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) + `config.yaml`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. La primera es el encoder MuQ-large-msd-iter, usado en modo `frozen`: sus pesos no se actualizan durante el entrenamiento, de modo que actúa como extractor de representaciones musicales preentrenadas. Sobre esas representaciones se aplica un pooling por media ponderada con atención (attention-weighted mean pooling), que agrega la secuencia temporal en un vector único. La segunda etapa son cabezas MLP independientes por dimensión (MI y TA), que predicen puntuaciones de calidad; la salida se expone como `_last_expected_scores` en la API de inferencia.

El entrenamiento usa el dataset MusicEval (BAAI/MusicEval), con 5 folds de validación cruzada estratificada por sistema TTM, 30 épocas, batch de 16, optimizador AdamW (lr=0,001, weight decay 0,01), scheduler coseno con 500 pasos de warmup y precisión bf16. La pérdida es MSE. La entrada se normaliza a mono, 24 kHz y se recorta a 240.000 muestras (10 s). No se documentan etapas de RLHF ni DPO, lo cual es esperable en un modelo de evaluación y no de generación.

## Capacidades

- Predicción de calidad musical por muestra (MOS-like) a partir de audio, con dos cabezas de dimensión (MI y TA).
- Evaluación automática de sistemas de generación musical (TTM) para benchmarking reproducible.
- Procesamiento de audio mono a 24 kHz con ventana máxima de 10 segundos por clip.
- Extracción de representaciones musicales mediante el encoder MuQ subyacente.
- Clasificación/regresión de audio (pipeline `audio-classification` en Hugging Face).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe en sentido textual; opera sobre audio.
- No dispone de modo thinking, visión ni audio de entrada más allá del waveform musical.
- No genera música: solo evalúa.

## Casos de uso

- Evaluación automática de pipelines de generación musical: integrar el modelo como métrica por muestra en un sistema TTM para filtrar o rankear candidatos antes de la revisión humana, aprovechando que predice puntuaciones en una sola pasada.
- Benchmarking interno de modelos generativos: comparar varias versiones de un generador musical sobre el mismo conjunto de clips y agregar las puntuaciones MI/TA para detectar regresiones entre releases.
- Control de calidad en datasets de entrenamiento: puntuar clips de un corpus musical generado y descartar los que caigan por debajo de un umbral, reduciendo ruido en datos de entrenamiento posteriores.
- Investigación en métricas de música: usar el modelo como baseline abierto (MIT) en estudios que comparen métricas objetivas frente a juicios humanos, dado que el paper asociado propone una métrica por muestra.
- Filtrado en plataformas de contenido generado: preclasificar audio subido por usuarios para priorizar la moderación o la curación editorial según la calidad estimada.
- Ajuste fino de cabezas sobre nuevos dominios: al mantener el encoder congelado, es viable reentrenar solo el pooling y las cabezas MLP con datos propios y recursos moderados, reutilizando las representaciones MuQ.
- Evaluación de sistemas de acompañamiento o generación condicionada: usar las puntuaciones por dimensión para analizar qué aspectos de calidad fallan en cada sistema.

## Benchmarks y rendimiento

La model card menciona evaluación con validación cruzada de 5 folds sobre MusicEval (2.748 clips, 31 sistemas TTM), pero no publica cifras numéricas de correlación, MSE ni comparaciones con otros modelos. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo pesa 2,7 GB, lo que sugiere que la inferencia en fp32 requiere del orden de varios GB y en bf16 aproximadamente la mitad, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor; por el tamaño del encoder MuQ-large, una GPU con al menos 8-16 GB de VRAM es un punto de partida razonable, aunque no está verificado.
- GPU de consumo: probablemente cabe en RTX 3090/4090 y posiblemente en gamas de 8 GB con bf16, pero no hay confirmación oficial.
- Opciones de despliegue: el código de ejemplo usa PyTorch puro con `torch.load` y `MusicQualityModel` del paquete `src.model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuQ-Eval-A1 | Evaluador de calidad musical (encoder congelado + MLP) | no disponible | audio 10 s a 24 kHz | MIT | Hugging Face |
| MuQ-large-msd-iter | Encoder musical base | no disponible | audio | no disponible en la información | Hugging Face |
| Alternativas de MOS prediction musical | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ventana de entrada limitada a 10 segundos: clips más largos deben recortarse, lo que puede sesgar la evaluación de piezas completas.
- Solo audio mono a 24 kHz: requiere remuestreo y downmix previos, y no se documenta comportamiento con estéreo nativo.
- Encoder congelado: la calidad de las representaciones MuQ acota el techo de rendimiento; no se ha ajustado el encoder.
- Sesgo de dominio: entrenado sobre MusicEval (31 sistemas TTM), por lo que puede generalizar mal a géneros, instrumentaciones o sistemas no representados en ese conjunto.
- Riesgo de sobreajuste a los sistemas del dataset: aunque se usa validación cruzada estratificada por modelo, la evaluación fuera de distribución no está cuantificada.
- Sin cifras de benchmark publicadas: no es posible verificar la correlación con juicios humanos a partir de la información disponible.
- Licencia MIT permite uso comercial, pero el modelo depende de MuQ-large-msd-iter, cuya licencia debe verificarse por separado antes de producción.
- No es un generador: no debe usarse para crear música, solo para evaluarla.
- Idiomas: etiquetado como `en`; la documentación está en inglés y no se detalla cobertura multilingüe (irrelevante para audio, pero relevante para la documentación).
- Sin soporte documentado de tool calling, agentes ni despliegue en servidores de inferencia estándar; la integración requiere código propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhudi2825/MuQ-Eval-A1
- Encoder base MuQ: https://huggingface.co/OpenMuQ/MuQ-large-msd-iter
- Dataset MusicEval: https://huggingface.co/datasets/BAAI/MusicEval
- Paper citado: arXiv:2603.22677 (MuQ-Eval: An Open-Source Per-Sample Quality Metric for AI Music Generation Evaluation)
