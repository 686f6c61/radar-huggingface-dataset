# tensor-tailor/zils-lite-body-15

## Resumen

zils-lite-body-15 es un ajuste fino ligero (LoRA) sobre el modelo base Charlie320/zils-lite-v9a, que a su vez forma parte del pool de "soups" del ecosistema Zils `d3-lite` (Bittensor subnet 127), construido sobre la familia Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario tensor-tailor y su propósito es servir como "cuerpo de decisión" dentro de ese pool: un modelo de aproximadamente 853 millones de parámetros orientado a tareas de elección múltiple, respuesta sí/no y puntuación, sobre un conjunto de 15 familias de examen agrupadas en cinco categorías (razonamiento, lenguaje, recuperación, herramientas y artes).

El modelo parte del soup oficial de la ronda d3-lite-2026-11-10 (promedio uniforme de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9) y aplica tres fine-tunes LoRA independientes (semillas 5002, 5012 y 5022) cuyos pesos finales se promedian con igual peso. El resultado conserva la licencia Apache-2.0 y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones del autor para cargarlo.

Es relevante ahora porque documenta un flujo de trabajo reproducible de minería en Bittensor: recetas verificables con hashes, digests de cuerpo Zils y recibos de combinación de pesos. No obstante, el modelo tiene cero descargas y cero "likes" en el momento de la ficha, y su model card contiene múltiples campos marcados como `[PENDING]` o `[CHECK]`, es decir, no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B) con proyecciones Gated-DeltaNet; ajuste LoRA sobre atención y GDN |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer denso de unos 853 millones de parámetros que incorpora proyecciones Gated-DeltaNet (GDN). Sobre ese sustrato, el autor aplica LoRA de rango 32 y alpha 64, sin dropout, únicamente sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje; las proyecciones MLP no se entrenan. Los adaptadores se fusionan en los pesos tras el entrenamiento. Se realizaron tres ejecuciones con semillas 5002, 5012 y 5022, todas partiendo del mismo punto inicial, con tasa de aprendizaje 5e-5, weight decay 1.0, una época, batch de 8 y 349 pasos de optimizador por ejecución.

Los datos de entrenamiento son 2.500 filas etiquetadas más 290 prompts ancla. Las filas etiquetadas usan entropía cruzada con label smoothing 0.05, más un término de Brier en filas de elección y sí/no o un término RPS en filas de puntuación (peso 1 cada uno), y un término KL con peso 0.1 hacia la distribución de respuestas del modelo inicial. Los prompts ancla solo aportan un término KL con peso 1.0 hacia la distribución del modelo inicial, sin etiquetas. La composición por categoría es: razonamiento 647 filas, lenguaje 647, recuperación 500, herramientas 457 y artes 249. El 97,0% de las filas (2.426) fueron escritas por dos sesiones de Claude del equipo del autor, un 0,2% (5 filas) por un modelo local Phi-4, y el resto no está detallado en la información disponible. El cuerpo final es la media uniforme de las tres ejecuciones (coeficiente 1/3 cada una), con 114 tensores que difieren del punto inicial.

## Capacidades

- Generación de texto y razonamiento de opción múltiple, sí/no y puntuación sobre las 15 familias del examen Zils.
- Clasificación y decisión sobre filas de examen en cinco categorías: razonamiento, lenguaje, recuperación, herramientas y artes.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste calibrado hacia la distribución del modelo inicial mediante términos KL, orientado a preservar el comportamiento del soup original.

## Casos de uso

- Evaluación de modelos en el pool Zils d3-lite: el modelo puede emplearse como "cuerpo de decisión" que responde a los ítems del examen interno de 15 familias, permitiendo comparar su precisión frente a otros cuerpos del mismo pool con la misma metodología de puntuación.
- Investigación en minería de Bittensor subnet 127: sirve como ejemplo reproducible de cómo aplicar LoRA sobre un soup oficial y promediar múltiples semillas, con hashes y recibos verificables para auditar el proceso.
- Clasificación de opción múltiple en dominios acotados: con 835 filas de elección en el conjunto de entrenamiento, el modelo está orientado a tareas de selección entre alternativas en razonamiento, lenguaje, recuperación, herramientas y artes.
- Respuestas sí/no con calibración: el uso de términos de Brier y KL sugiere su utilidad en tareas de verificación binaria donde importa la probabilidad calibrada, no solo la etiqueta.
- Puntuación graduada de respuestas: las filas de tipo score (831 en total) y el término RPS indican un diseño para asignar puntuaciones ordinales a respuestas, aplicable a evaluación automática de textos breves.
- Experimentación con fine-tuning eficiente en GPUs de consumo: con 853 millones de parámetros y LoRA r32, es viable reproducir el flujo en una sola GPU de gama alta consumer, lo que lo hace útil como banco de pruebas de recetas de ajuste.
- Base para futuros soups: al ser un cuerpo intermedio del pool, puede servir como punto de partida para nuevas rondas de mezcla o ajuste dentro del ecosistema Zils.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las familias del examen Zils; únicamente describe la metodología de entrenamiento y los hashes de verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 853 millones de parámetros, en fp16 se requieren aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB; en cuantizaciones de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, así como en A100 y H100, pero el autor no publica requisitos.
- ¿Cabe en GPU consumer? Sí, por el tamaño del modelo, aunque no hay confirmación oficial ni pruebas de latencia.
- Opciones de despliegue: no disponible. El uso de `custom_code` y la dependencia de la arquitectura Qwen3.5 con Gated-DeltaNet pueden requerir transformers con soporte específico o el código del autor; vLLM, llama.cpp, Ollama o TGI no están confirmados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-lite-body-15 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Ajuste LoRA sobre soup Zils d3-lite |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 | Hugging Face | Miembro del soup base |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face | Miembro del soup base |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8B | no disponible | no disponible | Hugging Face | Arquitectura de partida |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el 97% de los datos de entrenamiento fue generado por sesiones de Claude, lo que puede introducir sesgos de estilo y de contenido del modelo generador.
- Riesgo de alucinación: no evaluado; no hay benchmarks publicados que cuantifiquen la fiabilidad de las respuestas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados, por lo que no se puede garantizar su comportamiento fuera del inglés o del dominio del examen.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo depende de `custom_code` y de la licencia de los modelos base (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9), que también son Apache-2.0 según la información disponible; conviene revisar los NOTICE de los modelos de origen.
- Campos sin verificar: la model card incluye marcas `[PENDING]` y `[CHECK]` en varios puntos, lo que indica datos no medidos o no confirmados; no debe asumirse su exactitud.
- Ausencia de tracción: cero descargas y cero "likes" en el momento de la ficha, sin pipeline declarado, lo que limita la evidencia de uso en producción.
- Dependencia de código personalizado: el tag `custom_code` implica que la carga estándar con transformers puede fallar sin la implementación del autor.
- Sin etiquetas humanas: las etiquetas de entrenamiento provienen de los escritores de los ítems, no de anotadores humanos, lo que afecta a la calidad del ajuste supervisado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-15
- Modelo base 1: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Familia Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B (referencia de arquitectura, no verificada en la búsqueda)
- Repositorio del ecosistema Zils / Bittensor subnet 127: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
