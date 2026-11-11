# teckedd/gha-twi-understanding-r5

## Resumen

Ghana Health AI Twi R5 es un adaptador LoRA de rango 16 desarrollado por el usuario teckedd (proyecto Ghana Health AI) sobre el modelo base McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1, un transformer de aproximadamente 8.950 millones de parámetros. El adaptador se orienta a mejorar la comprensión del twi (idioma hablado en Ghana) y la preservación de significado en conversaciones bilingües twi-inglés, manteniendo a la vez la competencia en inglés del modelo base. Es un artefacto de investigación, no un modelo autónomo ni un asistente validado clínicamente.

El modelo resuelve un problema concreto: los modelos multilingües grandes suelen degradar el rendimiento en idiomas de bajos recursos como el twi cuando se les exige retener contexto conversacional y cambiar de idioma. R5 continúa el adaptador R4 y se entrena con datos de conversaciones revisadas, repetición de idioma y repetición de significado, buscando que el modelo recuerde hechos corregidos en un diálogo y mantenga la coherencia semántica en twi sin perder inglés.

Es relevante ahora porque documenta una metodología de ajuste fino con LoRA sobre un modelo africano multilingüe, con trazabilidad de checksums, manifiestos de datos y evaluación emparejada contra el modelo base. Sin embargo, la release en Hugging Face es solo una model card: no incluye pesos descargables, adaptador, datos de entrenamiento ni endpoint de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-9B, según nomenclatura del autor); adaptador LoRA r=16 |
| Parámetros totales | 8.953.803.264 (base congelada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tw (twi), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PEFT/LoRA (adaptador); no se publican bytes descargables en esta release |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only congelado de 8.953.803.264 parámetros. Se entrena una LoRA de rango 16 con 43.278.336 parámetros entrenables, inicializada exactamente desde el adaptador R4 (SHA-256 `1c18338e...`). El entrenamiento usa un optimizador y scheduler nuevos, learning rate de 1e-5 y acumulación de gradientes de 16, con la ejecución `understanding_20261110T103734Z` y checkpoint final en la actualización 228, completando el schedule.

Los datos consumidos suman 303.594 tokens supervisados sobre 3.108 registros y 3.647 presentaciones, repartidos en cuatro bloques: respuestas (192.703 tokens), retención de inglés (46.920), repetición de idioma twi (31.856) y repetición de significado (32.115). La selección de respuestas incluye 106 historias nuevas traducidas/corregidas por agente desde conversaciones fuente en inglés (191 objetivos de asistente), 24 historias de reparación autoradas por el proyecto (72 objetivos) y datos del R4, un export de instrucciones de 333 registros y derivados ortográficos marcados. La repetición de idioma y significado usa registros paralelos y transcripciones de voz de GhanaNLP, INJONGO y material paralelo comunitario. El adaptador final pesa 173.181.072 bytes y su checksum se verificó tras lectura desde almacenamiento privado en Modal.

## Capacidades

- Generación de texto y comprensión semántica en twi e inglés.
- Reconocimiento de significado en pares twi-inglés (tarea de elección binaria).
- Recuerdo de estado conversacional: retención de hechos cambiados y no cambiados en historias de diálogo.
- Retención de inglés: el entrenamiento incluye un bloque específico de 46.920 tokens para preservar competencia en inglés.
- Seguimiento de instrucciones: el export de instrucciones incluye prosa, ejercicios de lengua, código y tareas de respuesta literal.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking de forma documentada.
- No es un modelo ASR/TTS ni un asistente clínico validado.

## Casos de uso

- Investigación en ajuste fino de bajo rango para idiomas de bajos recursos: el adaptador sirve como referencia metodológica para estudiar cómo una LoRA r=16 sobre un modelo de ~9B mejora la comprensión del twi sin reentrenar la base.
- Evaluación de retención de contexto bilingüe: útil para medir si un modelo recuerda hechos corregidos en una conversación (24/24 en twi, 18/24 en inglés en el protocolo del autor), aplicable a diseño de sistemas de diálogo con correcciones.
- Preservación de significado en traducción asistida: el modelo puede emplearse para verificar que una frase en twi conserva el significado de su referencia en inglés, gracias a su entrenamiento en repetición de significado.
- Retención de inglés tras ajuste en idioma local: sirve para estudiar el equilibrio entre especialización en twi y mantenimiento de competencia en inglés en pipelines de adaptación multilingüe.
- Prototipado de asistentes de salud en Ghana (fase de investigación): el contexto del proyecto apunta a conversaciones sanitarias bilingües, aunque el autor advierte que no está validado clínicamente ni promovido a la aplicación pública.
- Estudio de trazabilidad y reproducibilidad de entrenamiento: los checksums, manifiestos de datos y recibos de consumo permiten auditar el proceso, útil para equipos que diseñan pipelines de datos reproducibles.
- Base para experimentos de reparación de conversaciones: las 24 historias de reparación autoradas por el proyecto pueden servir de plantilla para estudiar corrección de errores en diálogo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Métrica | Resultado | Referencia |
|---|---|---|---|
| Reconocimiento de significado (elección binaria) | Precisión, correcto en ambos órdenes de opciones | 900/1092 = 0,824176 | Base: 636/1092 |
| Recuerdo de estado conversacional, twi | Ambos valores recordados | 24/24 = 1,0 | — |
| Recuerdo de estado conversacional, inglés | Ambos valores recordados | 18/24 = 0,75 | — |

El propio autor advierte que la primera métrica mide acuerdo con referencias falibles y la segunda usa cuatro plantillas autoradas, por lo que no establece utilidad conversacional general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base de 8.953.803.264 parámetros requiere aproximadamente 18 GB en FP16/BF16 y alrededor de 6-7 GB en cuantización de 4 bits, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de ~9B en 4 bits podría caber en GPUs de 8-12 GB, pero no hay datos del autor.
- Opciones de despliegue: no disponible. La model card indica `inference: false` y no publica adaptador ni endpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ghana Health AI Twi R5 (adaptador) | 8.953.803.264 (base) + 43.278.336 (LoRA) | no disponible | tw, en | no disponible | Solo model card, sin pesos |
| McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1 (base) | ~8.950 millones | no disponible | 50 idiomas (según nombre) | no disponible | Pesos del modelo base |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otros adaptadores de twi o modelos africanos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La release es solo una model card: no contiene adaptador descargable, pesos base, ejemplos de entrenamiento ni endpoint de inferencia.
- No es un modelo autónomo: requiere el modelo base McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1 y el adaptador, que no se publican.
- No es un asistente validado clínicamente ni un modelo ASR/TTS; el autor lo describe como artefacto de investigación.
- Los datos de entrenamiento incluyen fuentes restringidas y no se publican; los términos de las fuentes originales siguen aplicándose y no se conceden nuevos derechos.
- Las derivaciones de conversaciones fueron revisadas por agente, no certificadas por revisores nativos humanos ni clínicos.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados.
- La métrica de reconocimiento de significado mide acuerdo con referencias falibles, no corrección absoluta.
- La evaluación de recuerdo conversacional usa cuatro plantillas autoradas y no demuestra utilidad conversacional general.
- Licencia no disponible: no se puede confirmar el uso comercial.
- El modelo base tiene 50 idiomas según su nombre, pero el adaptador solo declara tw y en; el comportamiento en otros idiomas no está evaluado.
- `inference: false` en la model card: no hay inferencia alojada.

## Enlaces

- Hugging Face: https://huggingface.co/teckedd/gha-twi-understanding-r5
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1
- Documentación de evaluación: https://github.com/teckedd-code2save/ghana-health-ai/blob/main/docs/TWI_UNDERSTANDING_SCALE_EVALUATION.md
- Repositorio del proyecto: https://github.com/teckedd-code2save/ghana-health-ai
