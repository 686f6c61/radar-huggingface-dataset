# textilelabs/Loom-Connoisseur-of-Biology

## Resumen

Loom Connoisseur of Biology es un sistema de recuperación y respuesta especializado en biología, publicado por Textile Labs. No se trata de un modelo entrenado desde cero, sino de un adaptador sobre Loom Crucible 4.5, un modelo base de 130 millones de parámetros desarrollado por el mismo autor. El adaptador consiste en un fichero de notas (`biology.loompack`) que contiene 16.901 notas cortas extraídas de 440 artículos de la Wikipedia en inglés, con un total de 1.442.652 palabras y un peso de 3,2 MB.

El modelo resuelve un problema acotado: responder preguntas de biología a partir de un corpus cerrado de notas, citando la fuente de cada respuesta y declarando explícitamente cuando la respuesta no se encuentra en dicho corpus. Funciona en CPU, sin conexión a internet y con un tiempo de respuesta de aproximadamente 5 segundos por pregunta en un portátil de 2019.

Su relevancia radica en el enfoque de "connoisseur": un modelo pequeño (130M parámetros, sin modificar) combinado con un mecanismo de búsqueda sobre notas curadas. Según las mediciones del autor, este enfoque supera a modelos mucho mayores que responden de memoria, aunque queda por debajo de esos mismos modelos cuando se les proporcionan las mismas notas. La licencia es CC BY-SA 4.0, heredada del texto de Wikipedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Loom Crucible 4.5 (130M parámetros) más recuperación sobre fichero de notas `biology.loompack`; arquitectura del transformer base no detallada en la información disponible |
| Parametros totales | 130 millones (modelo base, sin cambios) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Fichero de notas `.loompack` (3,2 MB); formato de pesos del modelo base no disponible |

## Arquitectura y entrenamiento

El sistema no implica entrenamiento adicional: se compone del modelo base Loom Crucible 4.5 (130M parámetros, entrenado desde cero por Textile Labs) sin modificar, más un fichero de notas estructurado. La relación declarada con el modelo base es `adapter`. El mecanismo de respuesta consiste en localizar las notas más relevantes para la pregunta del usuario y citar las frases que contienen la respuesta, junto con su fuente.

Las notas se construyeron a partir de 440 artículos de la Wikipedia en inglés, reorganizados en secciones (se conservaron las secciones, se eliminaron guías de pronunciación, fórmulas y listas de referencias). El corpus resultante tiene 16.901 notas y 1.442.652 palabras. No se especifican datos sobre tokens de entrenamiento, composición del dataset de preentrenamiento del modelo base ni uso de RLHF/DPO. El funcionamiento requiere el ejecutable Loom Connoisseur Maker, que realiza la búsqueda sobre las notas; Ollama o LM Studio por sí solos no pueden ejecutarlo.

## Capacidades

- Respuesta a preguntas de biología mediante búsqueda y cita literal de frases de sus notas.
- Citación de la fuente de cada respuesta (artículo de Wikipedia de origen).
- Declaración explícita de ausencia de información: responde "That isn't in my notes on biology." cuando la respuesta no está en el corpus.
- Ejecución en CPU, sin conexión a internet, con latencia de aproximadamente 5 segundos por pregunta en un portátil de 2019.
- Exposición de una API local compatible con Ollama en `http://127.0.0.1:11435` (nombre de modelo `loom-connoisseur-of-biology`) mientras el Maker está abierto.
- No realiza resumen, comparación de documentos, matemáticas, redacción ni opiniones.
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento multi-paso documentado.

## Casos de uso

- Consulta de referencia biológica en entornos sin conectividad: el sistema funciona completamente offline en CPU, por lo que puede desplegarse en aulas, laboratorios de campo o portátiles sin acceso a red para resolver dudas puntuales sobre los 440 temas cubiertos.
- Estudio guiado con trazabilidad: al citar la frase y el artículo de origen de cada respuesta, el estudiante puede verificar la fuente y contrastarla, lo que resulta adecuado para material de repaso basado en OpenStax Biology 2e.
- Asistente de consulta en aplicaciones locales: al exponer una API compatible con Ollama en el puerto 11435, puede integrarse en herramientas de escritorio que ya hablen el protocolo de Ollama, sin necesidad de GPU.
- Filtro de preguntas fuera de dominio: la capacidad de responder "no está en mis notas" permite usarlo como primer nivel de triaje en un sistema mayor, derivando a otro componente las consultas que quedan fuera del corpus biológico.
- Creación de variantes especializadas: el Loom Connoisseur Maker permite generar "connoisseurs" propios a partir de apuntes de curso, manuales o temas de afición, reutilizando el mismo modelo base y el mismo mecanismo de búsqueda.
- Demostración educativa de sistemas RAG de bajo coste: sirve como ejemplo reproducible de recuperación sobre corpus cerrado con un modelo de 130M parámetros, útil para enseñar las ventajas y límites de combinar modelos pequeños con buenas notas.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos el 2026-11-27 sobre preguntas con redacción de libro de texto (OpenStax Biology 2e), con cada respuesta verificada manualmente como presente en las notas de Wikipedia. La puntuación se calcula sobre el texto mostrado al usuario (sin la línea de fuente), mediante coincidencia de palabras clave contra respuestas redactadas antes de la prueba.

| Prueba | Resultado |
|---|---|
| Hechos respondidos correctamente | 5 / 10 |
| Explicaciones (60% de los puntos clave) | 0 / 2 |
| Respuesta "no está en mis notas" cuando la respuesta realmente falta | 2 / 2 (6 casos más descartados por aparecer sus respuestas en las notas ampliadas) |

Comparativa publicada por el autor (mismas preguntas; la comparación con Gemma 4 se midió con la versión anterior, más pequeña, de las notas):

| Modelo | Hechos correctos | Respuestas ausentes detectadas |
|---|---|---|
| Loom Connoisseur of Biology | 5 / 10 | — |
| Gemma 4 (e4b, ~4B parámetros efectivos, ~30x mayor), de memoria | 9 / 10 | — |
| Gemma 4 con las mismas notas | 7 / 10 | — |
| Loom Connoisseur (agregado de seis campos) | 58 / 84 | 16 / 20 |
| Gemma 4 solo (agregado de seis campos) | 42 / 84 | 0 / 20 |
| Gemma 4 con las mismas notas (agregado de seis campos) | 69 / 84 | 20 / 20 |

## Requisitos de hardware

- Inferencia en CPU: el sistema está diseñado para ejecutarse en CPU sin GPU, con aproximadamente 5 segundos por pregunta en un portátil de 2019.
- VRAM estimada: no aplica en el modo de despliegue previsto (CPU); no se dispone de estimaciones para GPU.
- GPU recomendadas: no disponibles; el diseño no las requiere.
- Compatibilidad con GPU de consumo: no documentada.
- Despliegue: requiere el Loom Connoisseur Maker, que descarga Loom Crucible 4.5 una vez y realiza la búsqueda sobre el fichero `.loompack`. Expone una API local compatible con Ollama en `http://127.0.0.1:11435`. Ollama o LM Studio por sí solos no pueden ejecutarlo.
- Throughput: no disponible; la única métrica publicada es la latencia de ~5 s por pregunta en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of Biology | 130M (base sin cambios) + notas de 3,2 MB | No disponible | Recuperación sobre corpus cerrado con citación | CC BY-SA 4.0 | Hugging Face + Loom Connoisseur Maker |
| Loom Crucible 4.5 (modelo base) | 130M | No disponible | Modelo generativo base | MIT | Hugging Face |
| Gemma 4 (e4b) | ~4B efectivos | No disponible | Modelo generativo de memoria | No disponible en la información proporcionada | Referenciado en la model card |

La comparación con Gemma 4 procede de las mediciones del propio autor y se realizó con la versión anterior de las notas. No se dispone de comparativas con otros sistemas de recuperación de tamaño similar.

## Limitaciones y advertencias

- Mejor rendimiento en preguntas de consulta cuya respuesta está escrita literalmente en una frase de las notas; peor en redacción cotidiana que en redacción de libro de texto.
- Las explicaciones son frases citadas, no reformuladas con palabras propias del modelo.
- No resume, no compara documentos, no hace matemáticas, no redacta y no emite opiniones.
- Su conocimiento se limita a 440 artículos de biología de la Wikipedia en inglés, obtenidos en noviembre de 2026; no cubre nada fuera de ese corpus.
- Solo admite inglés.
- Riesgo de sesgo heredado del texto de Wikipedia y de la selección concreta de artículos.
- Licencia CC BY-SA 4.0: obliga a atribuir a los contribuyentes de Wikipedia y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de un uso comercial.
- Requiere el Loom Connoisseur Maker para funcionar; no es desplegable directamente con Ollama o LM Studio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos o el fichero de notas podrían no estar materializados en el repositorio.
- Los resultados publicados son escasos (10 preguntas de hechos, 2 de explicaciones) y proceden del propio autor, sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Biology
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Biology/resolve/main/loom-connoisseurs-film.mp4
