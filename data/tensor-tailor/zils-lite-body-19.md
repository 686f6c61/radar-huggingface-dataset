# tensor-tailor/zils-lite-body-19

## Resumen

`zils-lite-body-19` es un fine-tune completo del modelo base Qwen3.5-0.8B, desarrollado por el usuario `tensor-tailor` para el pool de "soups" del proyecto Zils (subred Bittensor 127), dentro de la familia `d3-lite`. El modelo parte del soup oficial de la ronda `d3-lite-2026-11-10`, que es la media uniforme de dos miembros: `Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`, ambos con licencia Apache-2.0. Sobre ese punto de partida, el autor aplica un único fine-tune completo (sin adaptadores) con sus propios datos y luego amplifica el cambio mediante la fórmula `body = start + 1.5 × (run − start)`.

El modelo tiene 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), lo que lo sitúa en la gama ultraligera de la familia Qwen3.5. Su propósito declarado es servir como "cuerpo de decisión" dentro del pool Zils: un modelo entrenado para tareas de elección múltiple, sí/no y puntuación, alineado con las 15 familias de examen del proyecto. El autor indica explícitamente que el modelo está por debajo de sus propios umbrales de calidad preestablecidos y que lo envía para conocer su puntuación real.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de fine-tune completo sobre un modelo base pequeño con licencia permisiva; por otro, ilustra las prácticas de entrenamiento del ecosistema Zils, incluyendo el uso de datos generados por IA con verificación ciega por parte de un segundo modelo. El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial, aunque con las advertencias habituales sobre la calidad de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles de capas y atención no disponibles |
| Parametros totales | 852.985.920 (≈0,85 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El modelo se distribuye con la etiqueta `custom_code` y `qwen3_5`, lo que implica que la carga requiere código personalizado del repositorio (`trust_remote_code=True`). No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa en la información proporcionada.

El entrenamiento consistió en un único fine-tune completo (sin adaptadores) sobre el soup de partida, usando el entrenador `train_full_gold_v3.py` con semilla 5062, learning rate 4e-6, 1 época, batch de 8 con 2 pasos de acumulación, sobre 2.500 filas etiquetadas más 290 prompts de anclaje. La función de pérdida combina entropía cruzada con suavizado de etiquetas 0,05, un término de Brier en filas de elección y sí/no, un término de probabilidad clasificada (RPS) en filas de puntuación, y un término KL con peso 0,1 hacia la distribución de respuestas del modelo de partida, calculado en vivo desde los pesos originales. Los 290 prompts de anclaje solo aportan un término KL con peso 1,0 hacia la distribución del start, sin etiquetas. Posteriormente, el cuerpo final se construye como `start + 1,5 × (run − start)` sobre los 238 tensores que difieren del punto de partida, usando la herramienta `delta_combo.py` v1.4.

Los datos de entrenamiento (2.500 filas, sha256 `7e159a47…`) se distribuyen en 15 familias del examen Zils: razonamiento (647), lenguaje (647), recuperación (500), herramientas (457) y artes (249). El 97,0% de las filas (2.426) fueron escritas por dos sesiones de Claude del equipo del autor, usando la receta pública de autoría de ítems de Zils (`scripts/author_exam.py`); 5 filas (0,2%) fueron escritas por un modelo local Phi-4; y 69 filas (2,8%) provienen de datasets, incluyendo SQuAD 2.0 (30 filas, CC BY-SA 4.0). Las etiquetas de las filas escritas por IA son la respuesta del propio escritor, verificadas mediante una segunda respuesta ciega de otro modelo que debía coincidir, más auditoría y guardia de filas. No hay etiquetas humanas.

## Capacidades

- Generación de texto y razonamiento en el marco de las tareas de examen Zils (elección múltiple, sí/no y puntuación).
- Tareas de lenguaje, recuperación de información, herramientas y artes, según las 15 familias de entrenamiento.
- Formato de decisión: el modelo está optimizado para emitir respuestas en formato de elección, sí/no o puntuación, no para diálogo abierto general.
- Soporte de tool calling / function calling: no documentado explícitamente; la familia "tools" del entrenamiento se refiere a versiones dialógicas de tareas de herramientas, no a function calling estándar.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Evaluación comparativa en el pool Zils: el modelo está diseñado para ser puntuado en el examen de 15 familias del proyecto; se usaría como candidato en la subred Bittensor 127 para medir su rendimiento frente a otros cuerpos del soup.
- Clasificación de elección múltiple en dominios acotados: con 2.500 filas de entrenamiento repartidas en razonamiento, lenguaje, recuperación, herramientas y artes, puede emplearse como clasificador de decisión en tareas de opción múltiple dentro de esos dominios.
- Respuestas sí/no con calibración probabilística: el entrenamiento con término de Brier y RPS sugiere que el modelo puede producir probabilidades calibradas para preguntas binarias, útil en sistemas de verificación de afirmaciones.
- Puntuación de respuestas candidatas: las filas de tipo "score" permiten usar el modelo para rankear o puntuar respuestas generadas por otro modelo en pipelines de evaluación automática.
- Filtrado y enrutamiento en pipelines de datos: dado su tamaño reducido (0,85 B), puede desplegarse como clasificador ligero para enrutar consultas o filtrar contenido en un sistema mayor.
- Investigación sobre fine-tune completo en modelos pequeños: sirve como caso de estudio reproducible de la técnica `start + α × (run − start)` con α = 1,5, útil para investigadores que estudian la amplificación de deltas de pesos.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, es viable en GPU de consumo para experimentación, aunque no se documentan requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables; el autor indica únicamente que el modelo está por debajo de sus propios umbrales preestablecidos y que lo envía para conocer su puntuación real en el examen Zils.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 0,85 B parámetros, en fp16 ocuparía aproximadamente 1,7 GB de pesos, y en cuantización de 8 bits alrededor de 0,9 GB, pero estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100, pero no hay validación documentada.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (1,7 GB) y los 852 M de parámetros, aunque no se documenta explícitamente.
- Opciones de despliegue: no documentadas. El uso de `custom_code` y la arquitectura `qwen3_5` condicionan el soporte en vLLM, TGI, llama.cpp u Ollama; no se confirma compatibilidad con ninguno de ellos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tensor-tailor/zils-lite-body-19` | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune completo del soup Zils d3-lite |
| `Charlie320/zils-lite-v9a` | No disponible | No disponible | Apache-2.0 | Hugging Face | Miembro del soup de partida |
| `qhoenix/zils-lite-decision-v9` | No disponible | No disponible | Apache-2.0 | Hugging Face | Miembro del soup de partida |
| Qwen3.5-0.8B (familia base) | ≈0,8 B | No disponible | No disponible | No disponible | Modelo base de la familia según la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo está por debajo de sus umbrales de calidad preestablecidos; no debe asumirse un rendimiento competitivo sin evaluación previa.
- Las etiquetas de entrenamiento no son humanas: el 97% de las filas fueron escritas por sesiones de Claude y verificadas por un segundo modelo, lo que introduce sesgos y errores sistemáticos del modelo generador.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo pequeño entrenado para tareas de decisión, puede producir respuestas plausibles pero incorrectas fuera de su distribución.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés o de los idiomas presentes en los datos de entrenamiento.
- Longitud de contexto no documentada; no se recomienda su uso en conversaciones multi-turno largas sin validación.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y la arquitectura `qwen3_5`; esto implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo incorpora datos derivados de SQuAD 2.0 (CC BY-SA 4.0) y datos generados por IA cuya procedencia y derechos no están completamente claros; conviene revisar el archivo NOTICE del repositorio.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- No se documentan limitaciones específicas de sesgo demográfico, geográfico o cultural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-19
- Modelo base miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base miembro del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Dataset SQuAD 2.0 (fuente de 30 filas): https://rajpurkar.github.io/SQuAD-explorer/
- Repositorio del proyecto Zils (subred Bittensor 127): no disponible en la información proporcionada
- Paper o blog del proyecto Zils: no disponible en la información proporcionada
