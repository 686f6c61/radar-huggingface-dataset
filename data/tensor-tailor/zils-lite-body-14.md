# tensor-tailor/zils-lite-body-14

## Resumen

zils-lite-body-14 es un modelo de la familia Qwen3.5-0.8B, desarrollado por el usuario tensor-tailor, que constituye un "cuerpo de decisión" (decision body) para el pool de modelos tipo soup denominado d3-lite, asociado a la subred 127 de Bittensor. Se trata de un fine-tuning por LoRA sobre el soup oficial d3-lite de la ronda d3-lite-2026-11-10, que a su vez es la media uniforme de dos miembros: Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9.

El modelo resuelve el problema de adaptar un soup existente a datos propios de examen (15 familias de tareas: reasoning, language, retrieval, tools y arts, cada una en formato elección múltiple, sí/no y puntuación) mediante seis ejecuciones de LoRA con distintas semillas, cuyos pesos finales se promedian de forma uniforme. El resultado es un modelo de 852.985.920 parámetros (aproximadamente 0,85 mil millones) con licencia Apache-2.0.

Es relevante en el contexto de la minería de Bittensor, donde los participantes deben producir modelos que rindan bien en evaluaciones específicas del subnet. El autor documenta de forma exhaustiva el proceso de entrenamiento, hashes de verificación y recetas, lo que facilita la reproducibilidad y la auditoría del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B), con capas de atención Gated-DeltaNet y proyecciones MLP |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo parte del soup d3-lite de la ronda d3-lite-2026-11-10 (hash 4d23ec5a54c2ab6d0c16fc493819ef113c789ab8edd1ef8756d41b645d2762a3), reconstruido por el autor mediante el código oficial de soup (`soup.build`) como media uniforme de sus dos miembros: Charlie320/zils-lite-v9a (revisión 93b06404) y qhoenix/zils-lite-decision-v9 (revisión 083d5b9a). Sobre ese punto de partida se aplicaron seis fine-tunes LoRA independientes con semillas 5002, 5012, 5022, 5032, 5042 y 5052. Cada LoRA tenía rango 32, alpha 64, sin dropout, aplicado a las proyecciones de atención, Gated-DeltaNet y MLP de todas las capas del lenguaje, y se fusionó en los pesos tras el entrenamiento. Se usó learning rate 5e-5, weight decay 1.0, 1 época, batch 8 y 349 pasos de optimizador por ejecución (2.500 filas etiquetadas más 290 prompts ancla).

La función de pérdida combinó entropía cruzada con label smoothing 0.05 sobre la etiqueta gold, un término de Brier en filas de elección y sí/no o un término de ranked-probability (RPS) en filas de puntuación (peso 1 cada uno), y un término KL con peso 0.1 hacia la distribución de respuestas del modelo de partida, calculado en vivo desde los pesos iniciales. Los 290 prompts ancla solo usaron un término KL con peso 1.0 hacia el modelo de partida (temperatura 1), sin etiquetas. El cuerpo final promedia las seis ejecuciones con coeficiente 1/6 cada una (factor 1.0), dando como resultado 186 tensores diferentes respecto al punto de partida, construido con la herramienta `delta_combo.py` v1.4. Los datos de entrenamiento (2.500 filas, sha256 7e159a47...) se distribuyen en cinco categorías: reasoning (647), language (647), retrieval (500), tools (457) y arts (249); el 97,0% de las filas fueron escritas por dos sesiones de Claude del equipo y un 0,2% por un modelo local Phi-4, sin etiquetas humanas.

## Capacidades

- Generación de texto y razonamiento en tareas de elección múltiple, sí/no y puntuación, orientado a las 15 familias de examen del pool d3-lite.
- Capacidades de lenguaje, recuperación de información (retrieval), herramientas (tools, en versión de diálogo propia) y artes, según la composición del dataset de entrenamiento.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de modelos en el subnet 127 de Bittensor: el modelo está diseñado como cuerpo de decisión para el pool d3-lite, por lo que su uso principal es participar en las evaluaciones del subnet y comparar su rendimiento frente a otros cuerpos del pool.
- Clasificación de opción múltiple en dominios de razonamiento y lenguaje: con 647 filas de entrenamiento en cada categoría, el modelo puede emplearse para tareas de selección de respuesta entre opciones en contextos de examen o QA.
- Tareas de verificación sí/no: las 834 filas de sí/no del dataset permiten su uso en validación de afirmaciones, detección de consistencia factual o filtrado de respuestas.
- Puntuación y ranking de respuestas: las 831 filas de score y el término RPS en el entrenamiento lo hacen adecuado para asignar puntuaciones calibradas a candidatos en pipelines de evaluación.
- Recuperación y selección de contexto: con 500 filas de retrieval, puede integrarse en sistemas de búsqueda o reranking donde se requiera decidir entre pasajes candidatos.
- Diálogo basado en herramientas: las 457 filas de tools (versiones de diálogo propias del autor) permiten su uso en asistentes que seleccionan o invocan herramientas en conversaciones multi-turno.
- Investigación sobre soups y merging de pesos: el modelo sirve como caso de estudio reproducible de promediado de LoRAs con semillas múltiples y deltas de pesos verificables por hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~0,85 mil millones de parámetros, una estimación orientativa en fp16 sería de ~1,7 GB de pesos más overhead de activaciones y KV cache, y en cuantización de 8 bits de ~0,85 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado, pero por tamaño (852.985.920 parámetros y repo de 1,7 GB) es plausible que quepa en GPU de consumo con VRAM suficiente; no verificado.
- Opciones de despliegue: el modelo requiere `custom_code` y arquitectura `qwen3_5`, por lo que la carga debe hacerse con `trust_remote_code=True` en Transformers; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tensor-tailor/zils-lite-body-14 | 852.985.920 | no disponible | apache-2.0 | Hugging Face |
| Charlie320/zils-lite-v9a | no disponible | no disponible | apache-2.0 | Hugging Face |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | apache-2.0 | Hugging Face |

Los dos modelos comparables son los miembros del soup del que parte zils-lite-body-14; no se dispone de datos de rendimiento ni de parámetros de esos miembros en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el 97,0% de las filas de entrenamiento fueron generadas por dos sesiones de Claude, sin etiquetas humanas, lo que puede introducir sesgos propios del modelo generador en las respuestas gold.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; al ser un modelo de ~0,85 mil millones de parámetros, la capacidad de razonamiento complejo es limitada.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están disponibles; el dataset de entrenamiento está orientado a las familias de examen del subnet, no a uso general.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial, pero el modelo deriva de pesos de terceros (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos Apache-2.0); se debe consultar el NOTICE del autor para atribuciones.
- Caveats para producción: el modelo requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor; no se han publicado benchmarks ni evaluaciones independientes; el autor marca varios datos como [PENDING] o [CHECK] en la model card, indicando que no están medidos o verificados; el modelo está diseñado específicamente para el pool d3-lite del subnet 127 de Bittensor, por lo que su rendimiento fuera de ese contexto no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-14
- Modelo base 1: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Repositorio de recetas de autoría de items (referenciado): `scripts/author_exam.py` @6809491 (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
