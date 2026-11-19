# SupersonicLabs/Julia-1

## Resumen
Julia 1 es un modelo de decisión desarrollado por SupersonicLabs, primer miembro publicado de la familia Julia y primera prueba liberada de su sistema de entrenamiento. Con 144,3 millones de parámetros, no es un modelo generativo al uso: recibe un estado (`state`), una pregunta y un conjunto de entre 2 y 20 opciones de respuesta, y devuelve la opción seleccionada junto con puntuaciones en el orden proporcionado por el llamador. Su interfaz unifica clasificación, enrutamiento, puntuación ordenada y decisiones booleanas bajo una sola API.

El modelo parte del codificador multilingüe `jhu-clsp/mmBERT-small` (arquitectura ModernBERT, unos 140M de parámetros) y añade una cabeza de decisión entrenada sobre ejemplos en formato de decisión. Está pensado para sustituir routers basados en reglas o palabras clave en flujos de trabajo donde las etiquetas cambian con frecuencia, ya que no requiere una cabeza de salida nueva por cada conjunto de etiquetas.

Su relevancia actual reside en que demuestra un enfoque de "modelo de decisión" frente al modelo generativo: en lugar de razonar libremente, compara las opciones suministradas contra el contexto. Los resultados publicados muestran fortalezas claras en clasificación con etiquetas bien definidas (94% en AG News, 86% en DAIR Emotion) y debilidades visibles en listas largas de etiquetas (64% en el piloto de Banking77) y en tareas que exigen conocimiento externo o razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (ModernBERT) con cabeza de decisión; base `jhu-clsp/mmBERT-small` |
| Parametros totales | 144.292.870 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8.192 tokens combinados en tiempo de ejecución; los benchmarks históricos usaron 1.024 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (heredado de mmBERT-small); evaluación en 52 locales de MASSIVE |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento
Julia 1 es un codificador transformer de tipo ModernBERT heredado de `jhu-clsp/mmBERT-small`, al que se le añade una cabeza de decisión y se entrena sobre ejemplos en formato de decisión. El modelo conserva el codificador y el tokenizador del modelo base, y el artefacto liberado contiene los pesos resultantes y el código de inferencia, pero no el pipeline de entrenamiento, que es privado. La arquitectura upstream soporta hasta 8.192 tokens, cifra que el runtime de Julia 1 mantiene como límite combinado de estado, pregunta y opciones.

El entrenamiento se orienta a tres tipos de decisión tipada: `choice` (selección entre opciones), `score` (puntuación ordenada) y `noul` (decisión booleana). No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación se realizó el 24 de septiembre de 2026 con inferencia en BF16 sobre H200 y codificación estricta, y los resultados corresponden al checkpoint de este repositorio.

## Capacidades
- Clasificación de texto con conjuntos de etiquetas suministrados en tiempo de inferencia, sin necesidad de reentrenar la cabeza de salida.
- Enrutamiento de consultas hacia ramas o flujos de trabajo predefinidos, comparando el contexto contra las opciones disponibles.
- Puntuación ordenada de opciones (`score`), útil para ranking y shortlists.
- Decisiones booleanas (`noul`) sobre una condición dada.
- Procesamiento multilingüe: evaluación sobre 52 locales del conjunto MASSIVE, con 86,25% en portugués (pt-PT) y 86,75% en inglés (en-US).
- Manejo de hasta 20 opciones por llamada nativa; conjuntos mayores requieren el `Router` jerárquico, que agrupa y reordena los supervivientes.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso; su función es seleccionar entre opciones proporcionadas.

## Casos de uso
- Enrutamiento de consultas en atención al cliente: el modelo recibe el mensaje del usuario como `state` y las rutas disponibles (facturación, soporte técnico, devoluciones, etc.) como opciones, y devuelve la ruta adecuada sin necesidad de mantener listas de palabras clave ni reordenar ramas manualmente.
- Clasificación de tickets de soporte: con etiquetas claras y distintas, Julia 1 alcanza precisiones del 94% en pilotos de 4 etiquetas (AG News) y del 86% en 6 etiquetas (DAIR Emotion), lo que lo hace adecuado para triaje automático de incidencias.
- Moderación de contenido con categorías explícitas: la interfaz `choice` permite evaluar un mensaje contra un conjunto acotado de políticas y obtener la categoría aplicable, con la ventaja de que las políticas pueden actualizarse sin reentrenar el modelo.
- Shortlisting y ranking de candidatos: la modalidad `score` permite ordenar opciones (por ejemplo, productos, artículos o respuestas candidatas) según su adecuación al contexto suministrado.
- Verificación de condiciones booleanas en pipelines: la modalidad `noul` sirve para decisiones del tipo "¿cumple este texto la condición X?", integrable como paso de validación en flujos automatizados.
- Clasificación multilingüe en despliegues internacionales: con 71,50% de precisión macro en los 52 locales de MASSIVE y resultados superiores al 86% en inglés y portugués, es viable para escenarios de clasificación por escenario en múltiples mercados, siempre con evaluación previa sobre el dominio concreto.
- Sustitución de routers basados en reglas en sistemas con etiquetas cambiantes: al no requerir una cabeza de salida por flujo, un solo modelo puede puntuar conjuntos de etiquetas nuevos, lo que reduce el mantenimiento de lógica de enrutamiento.

## Benchmarks y rendimiento

| Benchmark | Correctos / total | Julia 1 | Referencia Jev | Diferencia |
|---|---:|---:|---:|---:|
| Decisiones tipadas | 1.463 / 2.000 | 73,15% | 72,70% | +0,45 pp |
| AG News · 4 etiquetas | 94 / 100 | 94,00% | 91,00% | +3,00 pp |
| DAIR Emotion · 6 etiquetas | 86 / 100 | 86,00% | 48,00% | +38,00 pp |
| Banking77 piloto · 72 etiquetas | 64 / 100 | 64,00% | 87,00% | −23,00 pp |

Desglose de precisión en decisiones tipadas: `Choice` 71,33% (428/600), `Noul` 80,67% (484/600), `Score` 68,88% (551/800).

| Clasificación de escenarios MASSIVE | Correctos / total | Precisión |
|---|---:|---:|
| 52 locales | 110.573 / 154.648 | 71,50% |
| Portugués · pt-PT | 2.565 / 2.974 | 86,25% |
| Inglés · en-US | 2.580 / 2.974 | 86,75% |

Protocolo: el conjunto `typed-decisions` aporta 400 casos de test; los pilotos de clasificación siguen el protocolo Jev fijado y usan BTZSC, con 100 ejemplos por dataset. Banking77 emplea una shortlist de 16 sobre 72 etiquetas, no una llamada nativa de 72 opciones. Las abstenciones cuentan como incorrectas. Los valores de Jev son referencias suministradas, no una nueva ejecución.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 144,3M de parámetros en BF16 el peso ronda los 0,29 GB, y en FP32 unos 0,58 GB, a lo que hay que sumar la memoria de activaciones según la longitud de contexto.
- GPU recomendadas: no se especifican; la evaluación oficial se realizó en H200 con BF16, aunque el tamaño del modelo permite inferencia en GPUs de consumo.
- Cabe en GPU de consumo: sí, por tamaño de parámetros (el repo ocupa 0,6 GB), aunque no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: no se documentan en la información disponible; el modelo se distribuye como pesos PyTorch/safetensors con código de inferencia propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---:|---|---|---|
| Julia 1 | 144,3M | 8.192 tokens (runtime) | Modelo de decisión sobre opciones suministradas | Apache 2.0 |
| mmBERT-small (base) | ~140M | Hasta 8.192 tokens | Codificador multilingüe general (MLM, fine-tuning) | No disponible en la información |
| Referencia Jev | No disponible | No disponible | Router/clasificador de referencia en los benchmarks | No disponible |

La comparación con la referencia Jev es la más directa en términos de tarea: Julia 1 supera a Jev en decisiones tipadas (+0,45 pp), AG News (+3,00 pp) y DAIR Emotion (+38,00 pp), pero queda por debajo en Banking77 (−23,00 pp, con shortlist). Frente a su modelo base mmBERT-small, la diferencia es funcional: mmBERT-small es una base de codificador para fine-tuning, mientras que Julia 1 está especializado en decisiones de elección finita.

## Limitaciones y advertencias
- No es un modelo generativo: no puede aportar hechos ausentes, resolver ecuaciones algebraicas ni encadenar cálculos largos aunque la respuesta correcta figure entre las opciones.
- Las listas largas de etiquetas degradan el rendimiento: el piloto de Banking77 con 72 etiquetas y shortlist de 16 alcanzó 64/100 frente a la referencia de 87/100.
- La precisión depende de la evidencia en el campo `state` y de la redacción de las opciones; conviene mantener opciones claras y distintas y usar codificación estricta.
- El resultado de un `Router` agrupado no constituye una distribución global de probabilidad, sino una selección jerárquica.
- Los pilotos de 100 ejemplos son señales indicativas, no garantías para un flujo de trabajo nuevo; es necesario evaluar con las preguntas y opciones reales antes de usarlo en acciones con consecuencias.
- Las abreviaturas y dominios poco familiares pueden provocar errores.
- Las abstenciones cuentan como incorrectas en la evaluación, lo que debe tenerse en cuenta al interpretar los números.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni soporte por parte del autor.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni riesgos de alucinación específicos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SupersonicLabs/Julia-1
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Resultados completos de benchmarks: https://huggingface.co/SupersonicLabs/Julia-1/blob/main/metrics/accuracy-20260924.json
- Procedencia del checkpoint y validación: https://huggingface.co/SupersonicLabs/Julia-1/blob/main/provenance.json
- Documentación del Router jerárquico: https://huggingface.co/SupersonicLabs/Julia-1/blob/main/julia/router/README.md
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Protocolo de benchmarks Jev: https://github.com/AbdelStark/jev-benchmarks/tree/0d610cc53e79bcbec691312b0c4adb4a0e371642
- Dataset BTZSC: https://huggingface.co/datasets/btzsc/btzsc
