# YudeJP/piqo-1.0

## Resumen

Piqo 1.0 es un modelo de clasificación de texto y recomendación desarrollado por YudeJP para Yudetter, una red social japonesa. No es un modelo generativo ni un LLM de propósito general: es un encoder transformer de 4,5 millones de parámetros que procesa publicaciones cortas de redes sociales y produce tres salidas simultáneas: una distribución de probabilidad sobre 42 categorías temáticas, un embedding de 192 dimensiones por publicación (usado para construir perfiles de interés por usuario) y una puntuación de expresión superficial basada en heurísticas de forma.

El modelo se apoya en una pequeña red de selección (unos 4,7K parámetros) que rankea publicaciones candidatas contra el perfil de interés aprendido de cada usuario. La versión 1.0 deriva del checkpoint 0.19.0-luna-long-64, que continúa el entrenamiento del encoder de intereses de la versión 0.17 sobre datos de texto largo, y está designado como versión estable del proyecto desde el 2 de noviembre de 2026.

Su relevancia es acotada pero clara: ofrece un pipeline completo y ligero (encoder más política de ranking) para recomendación de contenido en japonés, con licencia MIT, pesos en PyTorch y código de inferencia incluido. Está pensado para ser usado como distribución de probabilidad para ranking orientado a recall, no como clasificador de etiqueta única.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (PostEncoder) más red de selección (SelectionNetwork) |
| Parámetros totales | 4.513.643 (encoder) + ~4,7K (política de selección) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), tokenizer.json (ByteLevel BPE) |

## Arquitectura y entrenamiento

El componente principal es PostEncoder, un encoder de tipo transformer con tokenizador ByteLevel BPE de vocabulario 32.000, entrenado sobre publicaciones cortas de la red social Yudetter. Por cada publicación emite 42 probabilidades de categoría, un embedding de 192 dimensiones, una confianza, el número de tokens y una puntuación de expresión calculada con heurísticas superficiales (volumen de texto, repetición y número de enlaces). Sobre esos vectores actúa SelectionNetwork, una política de aproximadamente 4,7K parámetros que rankea publicaciones candidatas frente al perfil de interés del usuario.

La versión 1.0 se basa en el checkpoint 0.19.0-luna-long-64, obtenido al continuar el entrenamiento del encoder de aprendizaje de intereses de la versión 0.17 con datos de texto largo. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica el mecanismo de atención ni innovaciones como decodificación especulativa, algo coherente con un modelo que no genera texto.

## Capacidades

- Clasificación multietiqueta sobre 42 categorías temáticas (tecnología, IA, ciencia, negocios, comida, viajes, deportes, arte, música, política, filosofía, entre otras).
- Generación de embeddings de 192 dimensiones por publicación para construir perfiles de interés por usuario.
- Ranking de publicaciones candidatas mediante una política de selección entrenada contra el perfil de interés.
- Salida de confianza y recuento de tokens junto a las probabilidades de categoría.
- Puntuación de expresión superficial (longitud, repetición, enlaces), sin juicio de calidad de contenido.
- Procesamiento de texto japonés de redes sociales, incluyendo publicaciones cortas y ambiguas.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto.

## Casos de uso

- Feed personalizado en una red social japonesa: el encoder genera embeddings de las publicaciones y la política de selección las rankea contra el perfil de interés de cada usuario, priorizando recall sobre precisión de etiqueta única.
- Filtrado temático de contenido entrante: la distribución sobre 42 categorías permite enrutar publicaciones a secciones o moderadores según la categoría dominante y su confianza.
- Construcción incremental de perfiles de usuario: los embeddings de 192 dimensiones de las publicaciones consumidas se agregan para actualizar el vector de interés, sin necesidad de reentrenar el encoder.
- Detección de contenido de bajo esfuerzo: la puntuación de expresión (repetición, longitud, enlaces) sirve como señal auxiliar para degradar publicaciones spam o de relleno en el ranking.
- Investigación sobre recomendación en japonés: al ser un modelo pequeño con licencia MIT y código incluido, es útil como línea base reproducible para experimentos de ranking y clasificación de textos cortos.
- Moderación asistida por categoría: la confianza por categoría permite marcar publicaciones con distribución difusa o con alta probabilidad en categorías sensibles (política, derecho, relaciones) para revisión humana.
- Análisis de tendencias por temática: agregar las distribuciones de categoría sobre ventanas temporales permite medir la composición temática de la conversación en la plataforma.

## Benchmarks y rendimiento

Evaluación en JPPostBench v1 (benchmark abierto para comprensión de publicaciones cortas en japonés, con conjunto dev de datos sintéticos) y métricas internas del proyecto:

| Conjunto | Métrica | Resultado |
|---|---|---|
| Conjunto existente de 42 categorías | top-1 | 52,4% |
| Conjunto de publicaciones cotidianas | top-1 | 95,0% |
| Conjunto nuevo de 42 categorías | top-1 | 27,9% |
| Publicaciones reales (comparación con distribución de anotación humana del operador del sitio) | top-1 | 22,3% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables a un modelo de clasificación de este tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,5M de parámetros en fp32 el modelo ocupa aproximadamente 18 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte PyTorch (RTX 3060 o superior, A100, H100) es más que suficiente. Para lotes grandes, una GPU consumer basta.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM, y también en CPU.
- Opciones de despliegue: PyTorch nativo con el código de `sns_ai/` (inferencia en `engine.py`, ranking en `recommender.py` y `store.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (encoder de clasificación, no generativo) no son aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, podría compararse con clasificadores de texto japonés basados en BERT (por ejemplo, variantes de Tohoku BERT o LINE DistilBERT), pero no se han facilitado datos de rendimiento de esos modelos en esta ficha, por lo que la comparación cuantitativa queda como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Piqo 1.0 | ~4,5M (encoder) | no disponible | MIT | Hugging Face |
| Alternativas de clasificación japonesa | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La coincidencia top-1 en publicaciones reales es baja (en torno al 22-25%); el propio autor señala que las publicaciones cortas son ambiguas y que la concordancia entre anotadores independientes ronda un cuarto, lo que limita cualquier métrica de etiqueta única.
- Está diseñado para ranking orientado a recall con la distribución completa de probabilidad, no como clasificador de etiqueta única en producción.
- Solo soporta japonés y está entrenado sobre publicaciones cortas de una red social concreta; el dominio y el registro fuera de ese contexto degradan el rendimiento.
- La puntuación de expresión refleja únicamente forma superficial y no debe interpretarse como juicio de calidad del contenido.
- No genera texto, no razona y no soporta tool calling ni agentes; no debe confundirse con un LLM.
- No se documentan sesgos específicos, pero al entrenarse sobre datos de una única plataforma puede heredar sesgos de su comunidad y de la distribución temática de Yudetter.
- Riesgo de alucinación no aplicable en sentido generativo; el riesgo equivalente es la asignación errónea de categorías con alta confianza.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- El repositorio figura con 0 GB de tamaño y sin descargas ni likes en el momento de la consulta; conviene verificar la integridad de los pesos con los hashes sha256 publicados antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YudeJP/piqo-1.0
- Dataset JPPostBench v1: https://huggingface.co/datasets/YudeJP/jppostbench
- Red social Yudetter: https://yudetter.com
