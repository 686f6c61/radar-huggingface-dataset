# sthanika-ai/Sieve-2B-v2

## Resumen

Sieve-2B-v2 es un modelo de decisión desarrollado por Sthānika AI, diseñado para devolver probabilidades calibradas sobre opciones tipadas en lugar de generar texto libre. Se construye como un adaptador LoRA (rango 64) más una cabeza escalar de puntuación aplicada sobre los primeros 16 de los 24 bloques del modelo base Qwen/Qwen3.5-2B-Base. El modelo recibe un estado (texto o JSON) y una o varias preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta, sin producir ninguna salida textual.

La relevancia del modelo reside en su enfoque de "option fork": el estado y la pregunta se codifican una sola vez, y cada opción se puntúa como una continuación independiente, de modo que reordenar las opciones no puede alterar la respuesta por construcción. Esto lo hace adecuado para tareas de clasificación y enrutamiento donde la estabilidad y la calibración importan más que la generación. Soporta dos tipos de pregunta: `choice` (entre 2 y 255 opciones) y `noul` (sí/no).

El modelo se publicó originalmente como Sieve-2B-Plus y sus ficheros de ejecución del Decision Index conservan ese nombre. En la edición 0.3.2 del leaderboard Decision Index obtuvo una puntuación Full de 30,84 y una puntuación pública de 37,26, aunque dejó de aparecer listado a partir de la edición 0.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-2B-Base (bloques 1-16 de 24), diseño "option fork" con cabeza escalar |
| Parametros totales | 1,47 B en inferencia (embeddings + bloques 1-16 del base + adaptador + cabeza); 45,9 M entrenados (LoRA 44.851.200 + cabeza 1.053.697) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens para estado, pregunta y opción más larga; entrenado con entradas de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo emplea un transformer basado en Qwen3.5-2B-Base, del que se utilizan únicamente los bloques 1 a 16 de 24. Sobre las proyecciones de atención, MLP y Gated DeltaNet de esos bloques se aplica un adaptador LoRA de rango 64 y α=128, junto con una cabeza escalar que lee el último token de cada opción. El estado y la pregunta se codifican una vez; después, la representación codificada se copia una vez por opción y cada opción se puntúa como su propia continuación, sin que ninguna vea a las demás. Una softmax sobre las opciones, dividida por una temperatura incorporada de T = 1,4785, produce las probabilidades finales.

El entrenamiento se realizó sobre los tipos de pregunta `choice` y `noul`, con entradas de hasta 8.192 tokens. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el diseño "option fork", que garantiza por construcción la invariancia al orden de las opciones, junto con la calibración explícita de probabilidades mediante temperatura fija.

## Capacidades

- Clasificación de texto con devolución de probabilidad calibrada por opción.
- Preguntas de tipo `choice`: entre 2 y 255 opciones, con claves y descripciones opcionales.
- Preguntas de tipo `noul`: decisión sí/no puntuada como elección de 2 opciones, devolviendo P(yes).
- Procesamiento de estados en texto plano o JSON.
- Invariancia al orden de opciones garantizada por construcción.
- Salida estructurada con decisión, índice, probabilidad, confianza y vector de probabilidades.
- Sin generación de texto: el modelo nunca produce tokens de salida libres.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica el departamento adecuado (facturación, técnico, etc.) a partir del asunto y el cuerpo del mensaje, devolviendo una probabilidad por departamento que permite umbrales de derivación a revisión humana.
- Predicción de riesgo de abandono (churn): con preguntas tipo `noul` sobre el texto del cliente, se obtiene P(amenaza de cancelación) para priorizar acciones de retención.
- Moderación y etiquetado de contenido: clasificación entre categorías predefinidas con confianza calibrada, útil para decidir cuándo escalar a revisión manual.
- Triaje de correos o formularios: asignación de prioridad o categoría a mensajes entrantes en pipelines automatizados, aprovechando el contexto de hasta 32.768 tokens para hilos largos.
- Análisis de encuestas y feedback: mapeo de respuestas abiertas a categorías tipadas con distribución de probabilidad, facilitando el análisis agregado.
- Extracción de señales estructuradas desde JSON: dado un estado en formato JSON, responder preguntas booleanas o de elección múltiple para enriquecer registros en bases de datos.
- Sistemas de decisión con calibración: integración en pipelines donde la confianza de la predicción determina la automatización o la intervención humana, gracias a la temperatura fija y la softmax calibrada.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| Decision Index 0.3.2 (leaderboard, suite pública + tests privados) | Full score | 30,84 | No |
| Decision Index 0.3 (suite pública, 140.178 peticiones; media de 37 benchmarks) | Índice público (corregido por azar) | 37,26 | No |

En la suite pública de la edición 0.3 se ejecutaron las 140.178 peticiones puntuables sobre 43 benchmarks: 140.176 respondidas y 2 rechazadas (opciones con texto idéntico), sin truncamiento ni errores. El índice promedia 37 de los benchmarks. En la edición 0.3.2, el Full score ponderaba los benchmarks públicos al 20%, los tests privados de las mismas habilidades al 50% y las tareas privadas de nuevos dominios al 30%. El modelo dejó de estar listado en el leaderboard a partir de la edición 0.4.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para los pesos en bf16.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 3-4 GB de VRAM libre debería poder alojar los pesos en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM (no confirmado explícitamente por el autor).
- Opciones de despliegue: servidor propio `sieve-serve --model sthanika-ai/Sieve-2B-v2`; carga mediante `load_sieve`; se recomienda instalar `causal-conv1d==1.7.0` (kernel de convolución fusionado, requiere nvcc 11.6 o superior); torch 2.8.0 en las versiones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida de probabilidades calibradas) en la información proporcionada. El modelo se distingue de clasificadores transformer convencionales por su diseño "option fork" y su calibración explícita, pero no se han facilitado datos de comparación directa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No genera texto: no puede usarse para tareas de generación, resumen o diálogo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- El límite de 32.768 tokens incluye estado, pregunta y opción más larga; las peticiones que lo exceden son rechazadas por `sieve.decide` y el motor del Decision Index, mientras que `choice()` recorta el estado por delante.
- Entrenado con entradas de hasta 8.192 tokens, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Los resultados del Decision Index no están verificados por un tercero (verified: false).
- El modelo dejó de estar listado en el leaderboard a partir de la edición 0.4, lo que limita la comparación actualizada.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero la calibración de probabilidades puede degradarse en dominios alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-2B-Base.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-2B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit oficial del Decision Index: https://github.com/apolinario/decision-index
- Resultados del Decision Index: https://huggingface.co/datasets/sthanika-ai/Sieve-2B-v2-decision-index-results
