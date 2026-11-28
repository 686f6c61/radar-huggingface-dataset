# textilelabs/Loom-Connoisseur-of-Astronomy

## Resumen

Loom Connoisseur of Astronomy es un adaptador de recuperación (no un modelo entrenado desde cero) publicado por Textile Labs sobre su modelo base Loom Crucible 4.5, un transformer de 130 millones de parámetros entrenado desde cero por el propio laboratorio. El adaptador no modifica los pesos del modelo: añade un fichero de notas (`astronomy.loompack`, 2,2 MB) con 11.757 fragmentos cortos extraídos de 440 artículos de la Wikipedia en inglés, y un mecanismo de búsqueda que selecciona las notas relevantes antes de que el modelo genere la respuesta. El resultado es un sistema de respuesta con recuperación (RAG) empaquetado como si fuera un modelo, orientado a consultas factuales sobre astronomía.

La propuesta es deliberadamente modesta y local: el sistema corre en CPU, sin conexión, con una latencia aproximada de cinco segundos por pregunta en un portátil de 2019, y cita la fuente de cada frase que devuelve. Cuando la respuesta no está en las notas, el modelo lo declara explícitamente ("That isn't in my notes on astronomy") en lugar de improvisar. Esto lo aleja de los asistentes generativos generalistas y lo acerca a una herramienta de consulta verificable.

Su relevancia radica en la tesis que defiende: un modelo pequeño con notas bien curadas puede superar a un modelo mucho mayor respondiendo de memoria en dominios acotados. El autor reporta 15/16 aciertos en un examen congelado de astronomía, frente a 4/16 de Gemma 4 (unos 4B de parámetros efectivos, aproximadamente 30 veces mayor) respondiendo sin notas. El sistema solo funciona con la aplicación Loom Connoisseur Maker, que actúa como servidor compatible con la API de Ollama en `http://127.0.0.1:11435`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Loom Crucible 4.5, sin cambios); el adaptador añade recuperación sobre notas, no capas nuevas |
| Parametros totales | 130M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 (notas y adaptador); modelo base Loom Crucible 4.5 y Connoisseur Maker bajo MIT |
| Formato de pesos | no disponible; el adaptador se distribuye como fichero `.loompack` (2,2 MB) que requiere la aplicación Connoisseur Maker |
| Tamano del repo | 0,0 GB (según Hugging Face) |
| Relación con el modelo base | adapter |
| Corpus de notas | 11.757 notas de 440 artículos de Wikipedia en inglés (1.013.959 palabras) |
| Ejecución | CPU, offline, ~5 s por pregunta en un portátil de 2019 |
| Servidor compatible | API estilo Ollama en `http://127.0.0.1:11435`, nombre de modelo `loom-connoisseur-of-astronomy` |

## Arquitectura y entrenamiento

No hay entrenamiento en este artefacto. El modelo base es Loom Crucible 4.5, un transformer de 130M de parámetros entrenado desde cero por Textile Labs, cuyos detalles de arquitectura interna, número de tokens de entrenamiento y composición del dataset no se documentan en la información disponible. El adaptador no altera los pesos: la única incorporación es el fichero `astronomy.loompack`, generado a partir de 440 artículos de la Wikipedia en inglés descargados en noviembre de 2026. El proceso de preparación reorganiza el texto en secciones, elimina guías de pronunciación, fórmulas y listas de referencias, y fragmenta el contenido en 11.757 notas cortas.

En tiempo de inferencia, el sistema ejecuta una búsqueda sobre las notas para localizar los fragmentos más relevantes para la consulta y después hace que el modelo cite las frases que responden, acompañadas de su fuente. La respuesta se compone de oraciones extraídas de las notas, no de texto libre generado por el modelo, lo que explica tanto la trazabilidad como la rigidez estilística. No se reportan técnicas de RLHF, DPO ni decodificación especulativa; la innovación es el empaquetado del corpus y el bucle de recuperación, no el modelado.

## Capacidades

- Respuesta factual con recuperación: localiza la nota relevante y cita las oraciones que contienen la respuesta, con indicación de la fuente.
- Abstención explícita: cuando la respuesta no figura en las notas, responde "That isn't in my notes on astronomy" en lugar de generar una respuesta plausible.
- Cobertura temática de astronomía: constelaciones, asteroides, tipos estelares, galaxias, instrumentación (CMB, interferómetros), historia de la astronomía, agencias espaciales y astrofísica general, según la lista de 440 artículos.
- Ejecución local en CPU y sin conexión, con latencia de unos 5 segundos por consulta en hardware de 2019.
- Exposición como servicio compatible con la API de Ollama mientras la aplicación Connoisseur Maker está abierta.
- No soporta tool calling ni function calling, agentes, razonamiento multi-paso, matemáticas, escritura creativa, resumen, comparación de documentos ni opiniones; el autor lo declara explícitamente en las limitaciones.
- Multilingüe: no; solo inglés.

## Casos de uso

- Consulta factual de astronomía en el aula: un estudiante pregunta por la clasificación de una variable Algol o por las características de un asteroide concreto y recibe la frase textual de Wikipedia con su artículo de origen, lo que permite verificar la respuesta sin salir del portátil.
- Asistente de divulgación con trazabilidad: un club de astronomía aficionada despliega el Connoisseur Maker en un portátil durante una observación nocturna; las respuestas citan la fuente y el sistema admite que no sabe algo, lo que evita difundir datos inventados delante del público.
- Verificación de afirmaciones en material docente: dado un borrador con afirmaciones sobre tipos estelares o instrumentación CMB, el sistema confirma si el contenido aparece literalmente en su corpus y devuelve la oración exacta que lo respalda.
- Punto de acceso programático local: al exponerse en `http://127.0.0.1:11435` con nombre de modelo `loom-connoisseur-of-astronomy`, se puede integrar en scripts o notebooks que consulten hechos astronómicos sin depender de la nube ni de claves de API.
- Demostración de la tesis "modelo pequeño más notas" frente a modelos grandes: sirve como banco de pruebas reproducible para comparar recuperación frente a generación de memoria en dominios acotados, con el examen congelado del autor como referencia.
- Filtro de preguntas fuera de dominio en un chatbot educativo: antes de derivar una consulta a un modelo generativo mayor, el sistema puede determinar si la pregunta es respondible con el corpus de astronomía disponible y responder directamente cuando lo sea.
- Base para crear otros "connoisseurs": el flujo del Connoisseur Maker permite sustituir el `.loompack` de astronomía por apuntes propios, manuales o temáticas de afición, reutilizando el mismo motor de recuperación y el mismo modelo base de 130M.

## Benchmarks y rendimiento

El autor publica resultados sobre un examen congelado de astronomía (16 hechos, 4 explicaciones y 6 preguntas cuya respuesta no está en las notas), redactado a partir de los artículos de Wikipedia antes de cualquier ajuste. La puntuación se calcula sobre el texto mostrado al usuario, nunca sobre la línea de fuente, mediante coincidencia de palabras clave contra respuestas escritas antes de la prueba.

| Prueba | Loom Connoisseur | Gemma 4 (e4b, ~4B efectivos) sin notas | Gemma 4 con las mismas notas |
|---|---|---|---|
| Hechos correctos | 15 / 16 | 4 / 16 | 15 / 16 |
| Explicaciones (60 % de puntos clave) | 3 / 4 | no disponible | no disponible |
| "No está en mis notas" correcto | 5 / 5 | no disponible | no disponible |
| Hechos en los seis campos | 58 / 84 | 42 / 84 | 69 / 84 |
| Detección de respuestas ausentes (seis campos) | 16 / 20 | 0 / 20 | 20 / 20 |

El autor señala que una pregunta adicional se descartó del conjunto de "respuesta ausente" porque su respuesta apareció en una versión mayor de las notas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el sistema está diseñado para ejecutarse en CPU y el modelo base tiene 130M de parámetros, por lo que la huella de memoria es reducida, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles; el autor no documenta aceleración por GPU.
- Compatibilidad con GPU de consumo: el sistema se plantea para CPU; no se confirma soporte de GPU en la documentación disponible.
- Hardware de referencia: portátil de 2019, con unos 5 segundos por pregunta.
- Opciones de despliegue: exclusivamente la aplicación Loom Connoisseur Maker, que actúa como servidor compatible con la API de Ollama en `http://127.0.0.1:11435`. Ollama y LM Studio por sí solos no pueden ejecutarlo, porque el sistema necesita la búsqueda sobre las notas que realiza el Maker.
- Latencia y throughput: ~5 s por consulta en el hardware de referencia; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of Astronomy | 130M (base) + notas de 2,2 MB | no disponible | Recuperación sobre corpus cerrado con abstención | cc-by-sa-4.0 (notas); MIT (base y Maker) | Hugging Face, requiere Connoisseur Maker |
| Gemma 4 (e4b) | ~4B efectivos | no disponible | Generación generalista, sin recuperación por defecto | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Loom Crucible 4.5 | 130M | no disponible | Modelo base sin notas, entrenado desde cero | MIT | Hugging Face |

La comparación relevante que aporta el autor es la de los tres escenarios de la tabla de benchmarks: el Connoisseur supera ampliamente a Gemma 4 respondiendo de memoria en el dominio de astronomía (58/84 frente a 42/84 en hechos, y 16/20 frente a 0/20 en detección de respuestas ausentes), pero Gemma 4 con las mismas notas rinde mejor en ambas métricas (69/84 y 20/20). Es decir, el valor del Connoisseur está en el empaquetado y la abstención, no en superar a un modelo mayor que disponga del mismo corpus.

## Limitaciones y advertencias

- Solo responde bien a preguntas de consulta cuya respuesta esté escrita en una oración de sus notas; no generaliza ni reformula.
- Rinde peor con lenguaje cotidiano que con lenguaje de manual; las explicaciones son oraciones citadas, no redacción propia.
- No resume, no compara documentos, no hace matemáticas, no escribe texto libre ni emite opiniones.
- Su conocimiento se limita a 440 artículos de astronomía de la Wikipedia en inglés descargados en noviembre de 2026; cualquier avance posterior o tema fuera de esa lista queda fuera.
- Solo funciona en inglés.
- Requiere la aplicación Connoisseur Maker; no es cargable directamente en Ollama, LM Studio, vLLM, llama.cpp ni TGI.
- Licencia cc-by-sa-4.0 sobre las notas: obliga a atribuir a los contribuyentes de Wikipedia y a compartir bajo la misma licencia las obras derivadas; conviene revisar la compatibilidad antes de uso comercial.
- El modelo base y el Maker son MIT, pero el conjunto distribuido hereda las obligaciones de la licencia de las notas.
- Riesgo de alucinación reducido por diseño (cita y se abstiene), pero no nulo: la puntuación de explicaciones es 3/4 y la de detección de respuestas ausentes en los seis campos es 16/20, no 20/20.
- No se documentan sesgos específicos más allá de los inherentes a la Wikipedia en inglés; no hay evaluación de sesgos publicada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que el contenido pesado se sirve desde enlaces externos o que la métrica no refleja el `.loompack`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Astronomy
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Aplicación Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Fichero de notas `astronomy.loompack`: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Astronomy (descarga desde la página del modelo)
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Astronomy/resolve/main/loom-connoisseurs-film.mp4
- Wikipedia en inglés (fuente de las notas, CC BY-SA 4.0): https://en.wikipedia.org
