# tadiecool29/MTL-ethiollm-l-250K-finetuned

## Resumen

El modelo `MTL-ethiollm-l-250K-finetuned` es un ajuste fino (fine-tune) del modelo base `EthioNLP/EthioLLM-l-250K`, desarrollado por el usuario `tadiecool29`. Este modelo se ha entrenado específicamente para tareas de detección de postura (stance detection) y análisis de sentimiento (sentiment analysis) sobre un conjunto de datos no especificado. El modelo base EthioLLM es un modelo de lenguaje multilingüe preentrenado para cinco lenguas etíopes (amárico, ge'ez, afan oromo, somalí y tigriña) y inglés, desarrollado por el grupo EthioNLP. Con aproximadamente 560 millones de parámetros, este fine-tune está orientado a tareas de clasificación de textos, no a generación de lenguaje, y su relevancia radica en ofrecer una herramienta especializada para el procesamiento de lenguaje natural en lenguas africanas con escasos recursos digitales.

El modelo se distribuye bajo licencia MIT, en formato `safetensors`, y está diseñado para su uso con la librería `transformers`. No se han publicado benchmarks estándar (como MMLU o HumanEval), pero la model card incluye métricas de evaluación propias del entrenamiento, como F1 y precisión para las dos tareas objetivo. Aunque el modelo base es multilingüe, esta ficha no especifica los idiomas exactos soportados por el fine-tune, por lo que se recomienda consultar la documentación del modelo base para conocer su alcance lingüístico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica el tipo exacto; base: EthioLLM-l-250K) |
| Parametros totales | 559.897.607 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye en precisión completa, safetensors) |
| Idiomas soportados | No disponible (el modelo base EthioLLM soporta amárico, ge'ez, afan oromo, somalí, tigriña e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer `EthioLLM-l-250K`, un modelo de lenguaje preentrenado multilingüe desarrollado por el grupo EthioNLP. La arquitectura exacta del modelo base no se detalla en la documentación del fine-tune, pero se sabe que es un transformer de tipo decoder o encoder-decoder, con 250K de vocabulario (según el nombre del modelo base). El fine-tune se realizó sobre un dataset desconocido, con el objetivo de adaptar el modelo a dos tareas de clasificación: detección de postura y análisis de sentimiento. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, optimizador AdamW, scheduler cosine con 300 pasos de calentamiento, y 10 épocas. Se utilizó precisión mixta nativa (AMP). No se mencionan innovaciones técnicas adicionales más allá del fine-tune estándar.

## Capacidades

- Clasificación de textos para detección de postura (stance detection): identifica si un texto está a favor, en contra o neutro respecto a un tema.
- Análisis de sentimiento (sentiment analysis): clasifica la polaridad emocional de un texto (positivo, negativo, neutro).
- El modelo está optimizado para estas dos tareas, pero no se ha evaluado para generación de texto, razonamiento, código u otras capacidades típicas de los LLM.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso.
- Aunque el modelo base es multilingüe, no se confirma que el fine-tune conserve todas las capacidades lingüísticas; se requiere validación adicional.

## Casos de uso

- Análisis de opinión en redes sociales en lenguas etíopes: el modelo puede procesar publicaciones en amárico, oromo, somalí, etc., para medir la opinión pública sobre temas políticos o sociales.
- Monitoreo de discurso político: permite clasificar la postura de discursos o declaraciones de actores políticos en textos cortos, útil para estudios de comunicación.
- Análisis de reseñas de productos o servicios: aplicable a plataformas de comercio electrónico que operan en Etiopía o regiones con hablantes de estas lenguas.
- Investigación académica en lingüística computacional: sirve como herramienta para estudios sobre sentimiento y postura en idiomas de bajos recursos.
- Sistemas de alerta temprana de polarización: en entornos de moderación de contenido, puede detectar discursos de odio o polarización en textos multilingües.
- Chatbots o asistentes virtuales con análisis de sentimiento integrado: permite adaptar respuestas según la emoción del usuario en lenguas etíopes.

## Benchmarks y rendimiento

La model card no incluye resultados en el `model-index` (campo `results: []`), y no se han publicado benchmarks estándar como MMLU, HumanEval o GSM8K. Sin embargo, se proporcionan métricas de evaluación sobre el conjunto de validación durante el entrenamiento. Estos datos son los únicos disponibles:

| Métrica | Valor (última época) |
|---|---|
| Pérdida (Loss) | 1.7260 |
| Stance F1 | 0.7339 |
| Sentiment F1 | 0.6984 |
| F1 (promedio) | 0.7162 |
| Stance Accuracy | 0.7257 |
| Sentiment Accuracy | 0.7045 |

La tabla de progreso del entrenamiento muestra una mejora gradual en las métricas hasta la época 9, con una ligera disminución en algunas métricas en épocas posteriores, lo que sugiere un posible sobreajuste. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 559 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 2,2 GB. En FP16, alrededor de 1,1 GB. Con overhead de activaciones y buffers, se recomienda al menos 3-4 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. En entornos cloud, una T4 o V100 es suficiente.
- Puede ejecutarse en GPU de consumo (consumer GPU) de gama media.
- Opciones de despliegue: compatible con `transformers` (pipeline de clasificación de secuencias), `vLLM` (aunque está orientado a generación, puede usarse para clasificación), `Ollama` (si se convierte a GGUF, aunque no hay cuantizaciones disponibles), y `TGI` (Text Generation Inference).
- Latencia y throughput estimados: no se han publicado. Para una GPU moderna (RTX 3090), se espera una latencia de decenas de milisegundos por muestra en clasificación.

## Comparativa con modelos similares

No se dispone de modelos comparables con métricas públicas en las mismas tareas y lenguas. El autor ha publicado otro modelo similar: `tadiecool29/MTL-ethiollm-large-stance-sentiment`, que probablemente sea una versión más grande (posiblemente el modelo base EthioLLM-large), pero no se han publicado métricas comparativas. El modelo base `EthioLLM-l-250K` ofrece capacidades generales de lenguaje, pero sin el fine-tune específico para stance y sentimiento. No se puede realizar una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no se ha hecho público, lo que limita la reproducibilidad y la evaluación de sesgos.
- Las métricas reportadas son solo sobre el conjunto de validación; no hay evidencia de rendimiento en datos no vistos.
- El modelo puede presentar sesgos lingüísticos o culturales derivados del dataset de entrenamiento, especialmente al tratarse de lenguas con pocos recursos.
- Riesgo de alucinación: aunque el modelo está diseñado para clasificación, si se usa como generador (dado que el base es generativo), podría producir texto no fiel a los hechos.
- No se ha validado su rendimiento en todos los idiomas del modelo base; es posible que el fine-tune haya degradado el rendimiento en algunas lenguas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción nula hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-ethiollm-l-250K-finetuned
- Modelo base EthioLLM-l-250K: https://huggingface.co/EthioNLP/EthioLLM-l-250K
- Paper de EthioLLM: https://arxiv.org/abs/2403.13737
- Versión HTML del paper: https://arxiv.org/html/2403.13737v3
- Modelo hermano (large): https://huggingface.co/tadiecool29/MTL-ethiollm-large-stance-sentiment
- Perfil de GitHub del autor: https://github.com/tadiecool29/tadiecool29/blob/main/README.md
