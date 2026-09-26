# SupersonicLabs/Julia-1

## Resumen

Julia 1 es un modelo de decisión de 144.292.870 parámetros desarrollado por SupersonicLabs, presentado como el primer miembro de la familia Julia y la primera prueba pública de su sistema de entrenamiento. No es un modelo generativo: su interfaz recibe un estado (`state`), una pregunta (`question`) y entre 2 y 20 opciones (`options`), y devuelve una única opción seleccionada junto con puntuaciones en el orden en que el llamante proporcionó las alternativas. Con esa misma API cubre clasificación, enrutado (routing), puntuaciones ordenadas y decisiones booleanas, lo que lo sitúa en la categoría de `text-classification` y `decision-model`.

Técnicamente parte de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe de aproximadamente 140M de parámetros desarrollado por JHU CLSP. Julia 1 conserva el encoder y el tokenizador originales y añade una cabeza de decisión entrenada con ejemplos en formato de decisión; el artefacto publicado contiene los pesos resultantes y el código de inferencia, pero no el pipeline de entrenamiento, que es privado. El contexto en tiempo de ejecución admite hasta 8.192 tokens combinados, aunque los benchmarks históricos se ejecutaron con 1.024.

Su relevancia actual es acotada y concreta: propone sustituir routers basados en reglas o palabras clave por un modelo que interpreta conjuntamente el contexto y el significado de las respuestas candidatas, sin necesidad de añadir una cabeza de salida nueva por cada flujo de trabajo. Las evaluaciones publicadas (2026-09-24, inferencia H200 en BF16 con codificación estricta) muestran un rendimiento sólido en elecciones cortas y claras con evidencia aportada, y carencias visibles en conocimiento factual, razonamiento multi-paso y listas de etiquetas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo ModernBERT con cabeza de decisión (derivado de `jhu-clsp/mmBERT-small`) |
| Parametros totales | 144.292.870 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 8.192 tokens combinados en runtime; los benchmarks históricos usaron 1.024 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni similares) |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); el benchmark MASSIVE cubre 52 locales. Lista explícita de idiomas: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`library_name: pytorch`) |
| Modelo base | `jhu-clsp/mmBERT-small` |
| Interfaz | `state` + `question` + 2–20 `options` → una opción seleccionada |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 descargas, 13 likes en el momento de la consulta |

## Arquitectura y entrenamiento

Julia 1 es un encoder transformer derivado de mmBERT-small, un modelo ModernBERT multilingüe de propósito general orientado a masked-language modeling y a fine-tuning posterior. Sobre esa base, SupersonicLabs añade una cabeza de decisión y entrena el conjunto con ejemplos en formato de decisión, es decir, tripletas de estado, pregunta y conjunto de respuestas candidatas con una opción correcta. El resultado es un modelo especializado en decisiones de elección finita, no en generación libre: la salida son puntuaciones y una respuesta seleccionada, respetando el orden de opciones del llamante.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación; el checkpoint público contiene únicamente pesos y código de inferencia, mientras que el pipeline de entrenamiento es privado. La innovación destacable es la interfaz unificada para `choice`, `score` (puntuaciones ordenadas) y `noul` (decisión booleana), junto con un `Router` jerárquico capaz de procesar listas de opciones más grandes que las 20 nativas agrupando candidatos y reordenando los supervivientes. Conviene subrayar que, según el propio autor, cada llamada nativa del modelo acepta entre 2 y 20 opciones y que un resultado agrupado no constituye una distribución de probabilidad global.

## Capacidades

- Clasificación con etiquetas explícitas: dado un texto y un conjunto cerrado de categorías, selecciona la más adecuada (por ejemplo, 4 etiquetas de AG News o 6 de DAIR Emotion).
- Enrutado de decisiones: sustituye routers de reglas o palabras clave eligiendo la rama correcta a partir del contexto y del significado de las opciones, sin añadir una cabeza de salida por flujo de trabajo.
- Puntuación ordenada (`Score`): devuelve puntuaciones para las alternativas, lo que permite reordenar o aplicar umbrales.
- Decisiones booleanas (`noul`): responde a preguntas de sí/no en formato de decisión tipada.
- Multilingüismo: evaluado en 52 locales del benchmark MASSIVE de clasificación de escenarios, con resultados destacados en portugués (pt-PT) e inglés (en-US).
- Integración mediante `Router` jerárquico para conjuntos de etiquetas grandes, mediante agrupación y reordenación de candidatos.
- No dispone de capacidades generativas de texto libre, tool calling, function calling, uso de agentes ni razonamiento multi-paso; el propio autor señala que esas habilidades no quedan establecidas por las evaluaciones publicadas.

## Casos de uso

- Enrutado de peticiones en un asistente conversacional: el modelo recibe el estado de la conversación y una lista de intenciones o destinos posibles (por ejemplo, facturación, soporte técnico, bajas) y selecciona la rama adecuada. Es adecuado porque está entrenado específicamente para elecciones finitas y no requiere definir manualmente frases clave.
- Clasificación de tickets de soporte: con un conjunto acotado de categorías por equipo, Julia 1 asigna cada ticket a la cola correcta; el piloto de AG News (94/100 con 4 etiquetas) indica que rinde bien con listas cortas y bien definidas.
- Moderación o etiquetado de contenido con taxonomías reducidas: por ejemplo, 6 categorías emocionales como en el piloto DAIR Emotion (86/100), útil para priorizar revisiones humanas.
- Clasificación multilingüe de escenarios de usuario: al cubrir 52 locales en MASSIVE y obtener 86,25% en portugués y 86,75% en inglés, puede emplearse para dirigir consultas entrantes en despliegues multilingües antes de un modelo generativo más costoso.
- Filtrado previo (pre-routing) en pipelines RAG: usar el modelo como primera etapa que decide si una consulta requiere recuperación de documentos, cálculo o respuesta directa, reduciendo carga sobre el modelo principal.
- Validación de decisiones booleanas en formularios o flujos estructurados: comprobar si un estado cumple una condición expresada como pregunta, con la ventaja de un modelo de 144M parámetros que se ejecuta con latencia muy baja.
- Etiquetado por lotes para curación de datasets: al ser pequeño y determinista, permite clasificar grandes volúmenes con coste reducido, siempre que las etiquetas sean claras y poco numerosas.
- Reordenación de candidatos en sistemas de recomendación de acciones: la modalidad `Score` permite puntuar alternativas y combinarlas con heurísticas propias del producto.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos el 2026-09-24 con inferencia en H200 BF16 y codificación estricta. Las cifras de Jev son referencias de comparación aportadas, no una nueva ejecución de Jev.

| Benchmark | Aciertos / total | Julia 1 | Referencia Jev | Diferencia |
|---|---:|---:|---:|---:|
| Decisiones tipadas | 1.463 / 2.000 | 73,15% | 72,70% | +0,45 pp |
| AG News (4 etiquetas) | 94 / 100 | 94,00% | 91,00% | +3,00 pp |
| DAIR Emotion (6 etiquetas) | 86 / 100 | 86,00% | 48,00% | +38,00 pp |
| Banking77, piloto (72 etiquetas) | 64 / 100 | 64,00% | 87,00% | −23,00 pp |

Precisión por tipo de decisión en la suite tipada:

| Tipo | Aciertos / total | Precision |
|---|---:|---:|
| Choice | 428 / 600 | 71,33% |
| Noul | 484 / 600 | 80,67% |
| Score | 551 / 800 | 68,88% |

Clasificación de escenarios MASSIVE (18 etiquetas de escenario, 52 locales, 2.974 ejemplos por locale):

| Ámbito | Aciertos / total | Precision |
|---|---:|---:|
| Todos los 52 locales | 110.573 / 154.648 | 71,50% (macro) |
| Portugués (pt-PT) | 2.565 / 2.974 | 86,25% |
| Inglés (en-US) | 2.580 / 2.974 | 86,75% |

Notas de protocolo: la suite tipada usa 400 casos de prueba del dataset `typed-decisions`; los pilotos de clasificación siguen el protocolo Jev fijado en un commit concreto y el dataset BTZSC, con 100 ejemplos por dataset. El piloto de Banking77 usa una lista corta de 16 candidatos sobre 72 etiquetas mediante ranking, no una llamada nativa de 72 opciones. Las abstenciones cuentan como incorrectas. MASSIVE mide clasificación de escenarios, no clasificación de intención ni slot filling.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 unos 0,29 GB solo para pesos; en FP32 unos 0,58 GB. Con activaciones y overhead del runtime, un presupuesto de 1–2 GB es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU consumer moderna sirve. El autor usó una H200 en BF16 para las evaluaciones, pero el tamaño del modelo no la requiere en absoluto.
- Cabe en GPU consumer: sí, sin problemas, en RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU para cargas moderadas, dado su tamaño de 144M de parámetros.
- Opciones de despliegue: el repositorio se publica como PyTorch con `library_name: pytorch` y código de inferencia propio. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado cifras de latencia ni de tokens por segundo, y al tratarse de un modelo de decisión (no generativo) las métricas relevantes serían llamadas por segundo, que tampoco se proporcionan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Julia 1 | 144,3M | Hasta 8.192 tokens combinados (benchmarks a 1.024) | `state` + `question` + 2–20 `options` → una opción | Apache 2.0 | HuggingFace (`SupersonicLabs/Julia-1`) |
| mmBERT-small (modelo base) | ~140M | Hasta 8.192 tokens según arquitectura | Representaciones de encoder / masked-token modeling | No disponible | HuggingFace (`jhu-clsp/mmBERT-small`) |
| Referencia Jev | No disponible | No disponible | No disponible | No disponible | Solo citada como referencia de comparación en la model card |

No se dispone de datos suficientes para comparar Julia 1 con otros modelos de decisión o enrutado de la misma categoría. Las búsquedas web realizadas no devolvieron alternativas relevantes: los resultados correspondían al lenguaje de programación Julia y a su ecosistema de machine learning (Flux, JuliaHub), sin relación con este modelo.

## Limitaciones y advertencias

- Conocimiento factual limitado: el modelo compara las respuestas que se le proporcionan, pero no puede aportar hechos ausentes. No debe usarse para completar información que no esté en el `state`.
- Razonamiento multi-paso no establecido: no hay evidencia de que resuelva ecuaciones algebraicas ni cadenas largas de cálculos, aunque la respuesta correcta figure entre las opciones.
- Sensibilidad a la formulación: la decisión depende de la evidencia en el `state` y de la redacción de las opciones; ambigüedades, dominios desconocidos y listas de etiquetas largas provocan errores.
- Rendimiento degradado con muchas etiquetas: el piloto de Banking77 (72 etiquetas con lista corta de 16) obtuvo 64/100, 23 puntos por debajo de la referencia de 87/100. En listas largas conviene validar con el `Router` jerárquico y asumir que el resultado agrupado no es una probabilidad global.
- Muestras pequeñas: los pilotos de 100 ejemplos son señales indicativas, no garantías. El autor recomienda evaluar exactamente las preguntas y opciones del caso de uso real antes de emplearlo en acciones con consecuencias.
- Abstenciones penalizadas: en la evaluación, abstenerse cuenta como error, lo que sugiere que el modelo está forzado a elegir una opción dentro del conjunto proporcionado.
- Primera versión: se trata del primer release de la familia y de una prueba del sistema de entrenamiento, no de un modelo maduro y validado en producción.
- Reproducibilidad: el pipeline de entrenamiento es privado y no se publica información sobre datos, número de tokens ni alineación, lo que dificulta auditar sesgos o composición del dataset.
- Idiomas: aunque está etiquetado como multilingüe y evaluado en 52 locales de MASSIVE, no se publica una lista explícita de idiomas soportados ni métricas por locale más allá de pt-PT y en-US.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia y atribución. Conviene verificar las condiciones del modelo base mmBERT-small antes de redistribuir derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupersonicLabs/Julia-1
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset `typed-decisions` usado en la suite tipada: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset `BTZSC` usado en los pilotos de clasificación: https://huggingface.co/datasets/btzsc/btzsc
- Protocolo de benchmarks Jev (commit fijado): https://github.com/AbdelStark/jev-benchmarks/tree/0d610cc53e79bcbec691312b0c4adb4a0e371642
- Documentación del `Router` y conjuntos de opciones grandes (ruta interna del repositorio): `julia/router/README.md#larger-choice-sets`
- Resultados completos de benchmarks (ruta interna del repositorio): `metrics/accuracy-20260924.json`
- Procedencia del checkpoint y la validación (ruta interna del repositorio): `provenance.json`
- Nota sobre la búsqueda web: los resultados obtenidos (juliapackages.com, github.com/JuliaAI, juliahub.com, fluxml.ai) corresponden al lenguaje de programación Julia y no guardan relación con este modelo.
