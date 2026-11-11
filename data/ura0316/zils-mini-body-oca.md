# Ura0316/zils-mini-body-oca

## Resumen

zils-mini-body-oca es un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) publicado por el usuario Ura0316 en Hugging Face. Se trata de un *body* (cuerpo) perteneciente al *soup pool* `d3-mini` de Zils, un proyecto vinculado a la subred 127 de Bittensor. El modelo es un fine-tune del body anterior `Ura0316/zils-mini-body-cb2`, que a su vez era la media uniforme de pesos de dos fine-tunes de mezclas de cuerpos base con licencia Apache-2.0. El repositorio contiene únicamente los pesos del cuerpo (723 tensores en bfloat16) en el formato de chasis del pool; la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general publicable de forma autónoma, sino una pieza de un sistema mayor (el pool de Zils) que se evalúa en tareas de decisión en formato de examen y en eventos públicos resueltos. Su interés técnico reside en el método de entrenamiento: un adaptador LoRA de rango 64 sobre las proyecciones de atención y MLP, entrenado durante una época sobre 25.748 ítems y fusionado en los pesos, con una función de pérdida que combina entropía cruzada suave hacia la distribución objetivo de cada ítem y un término de Brier hacia la clave del ítem.

La información pública disponible es escasa: no hay model card con especificaciones de contexto, idiomas, benchmarks ni detalles de arquitectura más allá de la inferencia de que deriva de `Qwen/Qwen3.5-4B`. No se han publicado resultados de evaluación en la información proporcionada, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de Qwen/Qwen3.5-4B según la model card) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 723 tensores) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Indica que el repositorio contiene únicamente los pesos del cuerpo en el formato de chasis del pool (723 tensores en bfloat16) y que el modelo base último es `Qwen/Qwen3.5-4B`, con licencia Apache-2.0. El modelo es un fine-tune de `Ura0316/zils-mini-body-cb2` (en el commit `be1a5ea5`), que a su vez era la media uniforme de pesos de dos fine-tunes de mezclas de cuerpos base Apache-2.0.

El entrenamiento consistió en un adaptador LoRA de rango 64 aplicado sobre las proyecciones de atención y MLP, entrenado durante una época sobre 25.748 ítems y posteriormente fusionado en los pesos. La función de pérdida es una entropía cruzada suave hacia la distribución objetivo de cada ítem, más un término de Brier hacia la clave del ítem, con suavizado de etiquetas de 0,05 en los ítems cuya clave es un resultado observado. Aproximadamente tres cuartas partes de los ítems son preguntas de decisión en formato de examen cuyo objetivo es la distribución de respuestas de un modelo profesor (los ítems del entrenamiento del body de partida). El cuarto restante (6.437 ítems) son eventos públicos resueltos usados como ítems de decisión con la clave del resultado observado: categoría primaria de nuevos envíos a arXiv (metadatos de listado de arXiv), si las ediciones en Wikipedia en nueve idiomas y en Wikidata fueron revertidas (cambios recientes de MediaWiki), decisiones de revisión de Wikipedia Articles for Creation, y si las preguntas de Stack Exchange fueron cerradas o recibieron respuesta aceptada. Todos los eventos se resolvieron antes del 2026-10-19. No se redistribuyen filas de datasets, registros de eventos ni ítems escritos.

## Capacidades

- Generación de texto y decisión en formato de examen: el modelo está entrenado para producir distribuciones de respuesta sobre ítems de decisión, no necesariamente para generación abierta.
- Predicción de resultados observados en eventos públicos: categorización de envíos a arXiv, predicción de reversiones en Wikipedia y Wikidata, decisiones de revisión de Articles for Creation y cierre o aceptación de respuestas en Stack Exchange.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (la model card menciona ediciones en nueve idiomas de Wikipedia como fuente de datos de entrenamiento, pero no especifica qué idiomas soporta el modelo).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode), aunque el nombre del pool (`d3-mini`) y la mención a "language and vision weights" en la model card sugieren que el chasis del pool podría incluir componentes de visión; no se detalla.

## Casos de uso

- Evaluación de decisiones en formato de examen: el modelo puede usarse como componente de un sistema que responda ítems de opción múltiple o de decisión con distribución de probabilidad, aprovechando que fue entrenado con entropía cruzada suave hacia distribuciones de un modelo profesor.
- Predicción de categorías de envíos a arXiv: dado un envío nuevo, el modelo puede estimar la categoría primaria más probable, ya que fue entrenado con metadatos de listado de arXiv como eventos resueltos.
- Moderación asistida en Wikipedia y Wikidata: el modelo puede estimar la probabilidad de que una edición sea revertida, útil como señal auxiliar en colas de revisión de cambios recientes en los nueve idiomas cubiertos por los datos de entrenamiento.
- Apoyo a la revisión de Articles for Creation: el modelo puede predecir la decisión de revisión (aceptar o rechazar) de un borrador, como señal de triaje para revisores humanos.
- Triaje de preguntas en Stack Exchange: el modelo puede estimar si una pregunta será cerrada o si recibirá una respuesta aceptada, útil para priorizar la cola de moderación o para alertar al autor.
- Investigación sobre calibración y pérdida de Brier: el uso del término de Brier en el entrenamiento hace del modelo un objeto de estudio para experimentos sobre calibración de probabilidades en tareas de decisión con resultado binario o categórico observado.
- Integración en el pool de Zils (Bittensor subnet 127): el modelo está pensado para funcionar dentro del chasis fijado del pool `d3-mini`, por lo que su uso previsto es como cuerpo intercambiable en ese sistema, no como modelo autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa basada en el tamaño (4,54 mil millones de parámetros en bfloat16), los pesos ocupan aproximadamente 9,1 GB (tamaño del repositorio), por lo que la inferencia en bfloat16 requiere al menos ese espacio más overhead de activaciones y KV cache; en cuantización de 8 bits o 4 bits el requisito sería menor, pero no se confirman formatos cuantizados publicados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090) en bfloat16, y en GPUs con 24 GB o más con margen para contexto; no se confirma compatibilidad con A100, H100 ni otras GPUs de datacenter.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 16 GB o más de VRAM en bfloat16, pero no se dispone de confirmación oficial.
- Opciones de despliegue: no disponible. El modelo se distribuye como safetensors en el formato de chasis del pool, y la model card indica que el runtime proviene del chasis fijado del pool, por lo que no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-oca | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de un body de pool de Bittensor; requiere chasis del pool |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | Apache-2.0 | Hugging Face (modelo base citado) | Modelo base último del que deriva la familia de bodies |
| Ura0316/zils-mini-body-cb2 | no disponible | no disponible | Apache-2.0 | Hugging Face (modelo base directo) | Body anterior del que este es fine-tune |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento con eventos de Wikipedia, Wikidata, arXiv y Stack Exchange puede heredar sesgos de esas comunidades y de sus procesos de moderación.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo está entrenado para producir distribuciones de probabilidad sobre ítems de decisión, no para generación abierta fiable.
- Limitaciones de contexto e idioma: no disponibles. La model card menciona nueve idiomas de Wikipedia como fuente de datos, pero no especifica qué idiomas domina el modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de `Qwen/Qwen3.5-4B` (Apache-2.0) y de cuerpos base Apache-2.0; el contenido de las fuentes de eventos tiene licencias propias (Wikipedia y Stack Exchange bajo CC BY-SA 4.0, Wikidata y metadatos de arXiv bajo CC0 1.0), aunque la model card indica que no se redistribuyen filas de datasets ni registros de eventos.
- Caveat para producción: el repositorio contiene solo el cuerpo; la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool, por lo que el modelo no es autónomo y requiere ese chasis para funcionar. El modelo registra cero descargas y cero likes, y la model card no documenta evaluación independiente.
- Fecha de resolución de eventos: todos los eventos de entrenamiento se resolvieron antes del 2026-10-19, lo que limita su uso para predecir eventos posteriores sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-oca
- Modelo base directo: https://huggingface.co/Ura0316/zils-mini-body-cb2
- Modelo base último citado: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
