# teckedd/gha-twi-understanding-r4

## Resumen

Ghana Health AI Twi R4 es un adaptador LoRA de investigación desarrollado por el usuario teckedd, construido sobre el modelo base McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1 (9B parámetros). El adaptador está orientado a la comprensión y retención de significado en twi (idioma hablado en Ghana) dentro de contextos conversacionales de salud, con retención complementaria de inglés. No es un modelo base independiente ni un sistema clínicamente validado: es un experimento de continuación sobre el adaptador R3 previo, con un total de 43.278.336 parámetros entrenables sobre 8.953.803.264 congelados.

El modelo aborda el problema de la fidelidad semántica en conversaciones multilingües de bajo recursos: que el modelo recuerde y distinga correctamente hechos corregidos y no corregidos en twi e inglés a lo largo de un diálogo. Según la model card, en la comparación del 11 de noviembre de 2026 R4 acertó el significado inglés publicado en ambos órdenes de respuesta para 890 de 1.092 frases en twi (frente a 636 del base), y recordó ambos valores (cambiado y no cambiado) en 23/24 escenarios en twi y 18/24 en inglés.

Es relevante ahora como ejemplo de adaptación PEFT de bajo coste para idiomas de bajos recursos y dominios sanitarios, pero con advertencias importantes: la release en Hugging Face es solo una model card, sin pesos descargables, sin adaptador público, sin datos de entrenamiento ni endpoint de inferencia. La licencia no está disponible y la distribución queda sujeta a los derechos del modelo base y de los datos fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B) con adaptador LoRA rank-16 |
| Parámetros totales | 8.953.803.264 (base congelado) + 43.278.336 (adaptador entrenable) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | tw (twi), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PEFT/LoRA (adaptador); pesos base en formato del modelo McGill-NLP (no especificado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0.05, inicializado con los valores exactos del adaptador R3 previo. Se congela el modelo base (8.953.803.264 parámetros) y se entrenan 43.278.336 parámetros del adaptador. La tasa de aprendizaje es 1e-5, con acumulación de gradiente 16 y warmup del 5%. Se realizaron dos pasadas de respuesta con replay finito sin reemplazo. La mezcla efectiva de tokens objetivo fue 60,04% respuestas, 20,01% retención de inglés (el resto se detalla parcialmente en la información disponible). El run de entrenamiento se identifica como `understanding_20261109T103659Z`.

El dataset (`20261109-r4-v3`, pack SHA256 `b71682b47512506f9621faba7370f9f2d941437acc44e4dbe6c2716c0bf50cc7`) contiene 1.544 registros: 257 de respuesta y 1.287 de replay. Las vistas de respuesta se expanden a prefijos de asistente deduplicados preservando el contexto previo completo. Hay 1.642 vistas distintas, 1.997 presentaciones y 161.773 tokens objetivo efectivos, distribuidos en respuestas (355 vistas, 710 presentaciones, 97.122 tokens), retención de inglés (152, 152, 32.370), significado (535, 535, 16.183) y lengua twi (600, 600, 16.098). Las vistas de respuesta incluyen 229 vistas R3 preservadas, 67 objetivos nuevos de 33 historias autorales y 59 variantes de ortografía del usuario (sustitución de épsilon minúscula por `3` solo en turnos de usuario). Se eliminaron 8 vistas de prefijo duplicadas y se excluyeron 2 de 35 historias candidatas por significado no resuelto, además de 12 candidatos de replay por comprobaciones de contenido protegido. Las historias nuevas son derivadas de marcos en inglés traducidos y verificados por agente, no conversaciones naturales ni certificadas clínicamente. Los objetivos nuevos más aumentados suponen aproximadamente el 7,4% de los tokens objetivo de respuesta.

## Capacidades

- Generación de texto y comprensión de significado en twi e inglés.
- Reconocimiento de significado en elección binaria (two-choice meaning recognition) sobre referencias twi-inglés.
- Retención de estado conversacional propio: recuerdo de hechos corregidos y no corregidos a lo largo de historias de diálogo.
- Instrucción conversacional en twi con retención complementaria en inglés.
- No es un modelo de voz ni un servicio de información actual.
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación en retención de contexto multilingüe: el adaptador sirve para estudiar cómo un modelo de 9B retiene hechos corregidos y no corregidos en twi e inglés a lo largo de un diálogo, usando las 24 plantillas y escenarios bilingües del protocolo `gha-context-rollout-v1`.
- Evaluación de fidelidad semántica en idiomas de bajos recursos: permite medir la tasa de acierto en reconocimiento de significado twi-inglés (890/1.092 en ambos órdenes) frente al modelo base (636), como referencia para comparar adaptaciones PEFT.
- Estudio de adaptación LoRA de bajo coste: con solo 43,3M de parámetros entrenables sobre 8,95B congelados, es un caso práctico para analizar el efecto de continuar un adaptador previo (R3) con datos de replay y retención.
- Prototipado de asistentes conversacionales de salud en twi: el modelo está pensado para instrucción conversacional en twi en dominio sanitario, aunque sin validación clínica; puede usarse en entornos de investigación para generar y evaluar respuestas controladas.
- Análisis de variantes ortográficas del usuario: las 59 variantes con épsilon sustituida por `3` permiten estudiar robustez ante errores de escritura típicos en twi.
- Reproducción de experimentos PEFT: los hashes SHA256 del adaptador y del pack de datos permiten verificar la integridad de una réplica del entrenamiento en entornos de investigación controlados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Two-choice meaning recognition | gha-twi-reference-choice-v1 (referencias twi-inglés publicadas, pares disjuntos del mismo dominio) | Accuracy, correcto en ambos órdenes (890/1.092) | 0,815018 |
| Own-history dialogue state recall | gha-context-rollout-v1 (correcciones bilingües controladas, 4 plantillas, 24 escenarios por idioma) | Ambos valores recordados, twi (23/24) | 0,958333 |
| Own-history dialogue state recall | gha-context-rollout-v1 | Ambos valores recordados, inglés (18/24) | 0,75 |

El autor indica que la primera métrica mide acuerdo con referencias falibles y la segunda usa plantillas autorales que no establecen utilidad conversacional general. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo base de 9B en precisión completa requiere del orden de 18 GB solo para pesos, y en cuantización de 4 bits alrededor de 5-6 GB, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. La model card indica `inference: false` y que la release no contiene adaptador descargable ni endpoint de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ghana Health AI Twi R4 (este) | 8,95B base + 43,3M adaptador | no disponible | tw, en | no disponible | Solo model card, sin pesos |
| McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1 (base) | 9B | no disponible | 50 idiomas (según nombre) | no disponible | Público en Hugging Face |
| Adaptador R3 (predecesor) | 8,95B base + adaptador | no disponible | tw, en | no disponible | Privado, en aplicación pública |

El modelo base sirve como referencia directa: en la tarea de reconocimiento de significado, R4 obtuvo 890/1.092 frente a 636 del base según el autor. No se dispone de datos de otros modelos comparables de twi en la información proporcionada.

## Limitaciones y advertencias

- La release en Hugging Face es solo una model card: no contiene adaptador descargable, pesos base, ejemplos de entrenamiento ni endpoint de inferencia.
- El modelo no es un modelo base independiente, ni un modelo de voz, ni un servicio de información actual, ni un sistema validado clínicamente.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- La métrica de reconocimiento de significado mide acuerdo con referencias falibles; la de retención usa plantillas autorales y no establece utilidad conversacional general.
- Las historias nuevas son derivadas de marcos en inglés traducidos y verificados por agente, sin certificación humana nativa ni clínica; no son conversaciones naturales.
- Los objetivos nuevos más aumentados suponen solo ~7,4% de los tokens objetivo de respuesta: es un experimento de continuación pequeño, no un entrenamiento de corpus completo.
- Licencia no disponible; la distribución queda sujeta a los derechos del modelo base y de los datos fuente, sin derechos adicionales de redistribución.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible, pero aplicables a cualquier modelo generativo de este tipo.
- La aplicación pública en producción permanece en R3 durante la comparación; R4 no está desplegado.

## Enlaces

- Hugging Face: https://huggingface.co/teckedd/gha-twi-understanding-r4
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1
- Resultados y protocolo de evaluación: https://github.com/teckedd-code2save/ghana-health-ai/blob/main/docs/TWI_UNDERSTANDING_SCALE_EVALUATION.md
- Repositorio del proyecto: https://github.com/teckedd-code2save/ghana-health-ai
