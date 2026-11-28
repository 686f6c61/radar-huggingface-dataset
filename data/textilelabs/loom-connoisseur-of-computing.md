# textilelabs/Loom-Connoisseur-of-Computing

## Resumen

Loom Connoisseur of Computing es un adaptador de recuperación aumentada (RAG) empaquetado como "connoisseur" sobre el modelo base Loom Crucible 4.5, un transformer de 130 millones de parámetros entrenado desde cero por Textile Labs. No se trata de un modelo nuevo ni de un fine-tuning: el modelo base permanece inalterado y el artefacto distribuido (`computing.loompack`, 2,7 MB) es un fichero de notas que contiene 14.758 fragmentos cortos extraídos de 436 artículos de la Wikipedia en inglés sobre informática, con un total de 1.239.979 palabras.

El sistema responde localizando las notas más relevantes para la consulta del usuario y citando las frases concretas que contienen la respuesta, junto con su fuente. Cuando la respuesta no está en las notas, el modelo declara explícitamente "That isn't in my notes on computing". El objetivo declarado es ofrecer un experto de dominio pequeño, ejecutable en CPU y totalmente offline, con trazabilidad de fuentes y comportamiento abstenido ante preguntas fuera de cobertura.

Su relevancia actual reside en la comparación publicada por el autor: el sistema obtiene 12/16 en hechos de un examen de informática retenido, frente a 6/16 de Gemma 4 (e4b, ~4B parámetros efectivos, ~30 veces mayor) respondiendo de memoria, y 15/16 de Gemma 4 con las mismas notas. El mensaje es que un modelo pequeño con buenas notas supera a uno grande adivinando, aunque un modelo grande leyendo las mismas notas las aprovecha mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Loom Crucible 4.5); el adaptador es un sistema de recuperación sobre fichero de notas, no una modificación de pesos |
| Parametros totales | 130M (modelo base, sin cambios) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 (notas y adaptador); modelo base Loom Crucible 4.5 y Connoisseur Maker bajo MIT |
| Formato de pesos | No disponible; el artefacto distribuido es `computing.loompack` (2,7 MB) |

## Arquitectura y entrenamiento

El modelo base Loom Crucible 4.5 es un transformer de 130M parámetros entrenado desde cero por Textile Labs, sin que la model card detalle la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. El adaptador no modifica estos pesos: `base_model_relation: adapter` indica que el connoisseur se construye añadiendo el fichero de notas y un mecanismo de búsqueda sobre ellas.

El pipeline de respuesta consiste en recuperar las notas más relevantes para la pregunta y extraer las frases que responden, mostrando la fuente. Las notas provienen de la Wikipedia inglesa (noviembre de 2026), reorganizadas por secciones y con eliminación de guías de pronunciación, fórmulas y listas de referencias. No se documentan innovaciones como decodificación especulativa o atención lineal; la innovación es el empaquetado del conocimiento como fichero portable y la abstención explícita ante preguntas fuera de cobertura.

## Capacidades

- Respuesta a preguntas de consulta directa ("look-up") cuya respuesta está escrita en una frase de las notas.
- Citación de fuentes: cada respuesta incluye la nota y el artículo de procedencia.
- Abstención explícita: responde "That isn't in my notes on computing" cuando la respuesta no está en el corpus.
- Ejecución en CPU y offline, sin conexión de red.
- Exposición como servicio compatible con la API de Ollama en `http://127.0.0.1:11435` con el nombre de modelo `loom-connoisseur-of-computing`, mientras el Connoisseur Maker está abierto.
- Cobertura limitada a 436 artículos de informática (historia de la computación, hardware, software, algoritmos, comparativas de software, biografías como Turing, Babbage o Gates).
- No realiza resumen, comparación de documentos, matemáticas, redacción ni opiniones.

## Casos de uso

- Consulta de referencia técnica offline: un desarrollador pregunta por conceptos de informática (por ejemplo, notación Big O o arquitectura de memoria caché) y obtiene la frase relevante con su artículo de Wikipedia como fuente, sin conexión y en unos 5 segundos en un portátil de 2019.
- Asistente de estudio con trazabilidad: estudiantes que necesitan respuestas citadas y verificables sobre fundamentos de computación, con la ventaja de que el sistema declara cuándo no sabe algo, evitando alucinaciones.
- Base para crear connoisseurs personalizados: mediante el Connoisseur Maker, el mismo enfoque se replica sobre apuntes de curso, manuales o temas de afición, usando este modelo como referencia de funcionamiento.
- Integración en aplicaciones locales vía API compatible con Ollama: herramientas internas pueden consultar el servicio en `127.0.0.1:11435` para resolver dudas de dominio sin depender de la nube.
- Verificación de cobertura documental: al preguntar por temas y recibir "no está en mis notas", un equipo puede detectar lagunas en su base de conocimiento de informática.
- Demostración educativa de RAG: sirve para ilustrar cómo un modelo pequeño con recuperación supera a uno grande respondiendo de memoria en tareas de consulta factual (12/16 frente a 6/16 en el examen del autor).

## Benchmarks y rendimiento

Examen de informática retenido (16 hechos, 4 explicaciones, 4 preguntas cuya respuesta no está en las notas), medido el 2026-11-27; puntuación por coincidencia de palabras clave sobre el texto mostrado:

| Metrica | Loom Connoisseur | Gemma 4 (e4b, de memoria) | Gemma 4 con las mismas notas |
|---|---|---|---|
| Hechos correctos | 12 / 16 | 6 / 16 | 15 / 16 |
| Explicaciones (60% de puntos clave) | 2 / 4 | No disponible | No disponible |
| "No está en mis notas" correcto | 2 / 3 | No disponible | No disponible |
| Total en seis campos (hechos) | 58 / 84 | 42 / 84 | 69 / 84 |
| Detección de respuestas ausentes (seis campos) | 16 / 20 | 0 / 20 | 20 / 20 |

Nota: la comparación con Gemma 4 se realizó con la versión anterior y más pequeña de las notas. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el autor indica aproximadamente 5 segundos por pregunta en un portátil de 2019, con el modelo de 130M parámetros y las notas de 2,7 MB.
- VRAM: no aplica para ejecución en CPU; no se especifican requisitos de GPU.
- GPU recomendadas: no disponible; el diseño está orientado a CPU.
- Cabe en cualquier equipo de consumo: el modelo base de 130M parámetros y el fichero de notas de 2,7 MB son de tamaño reducido.
- Despliegue: requiere el Loom Connoisseur Maker (descarga Loom Crucible 4.5 una vez); expone API compatible con Ollama en `http://127.0.0.1:11435`. Ollama o LM Studio por sí solos no pueden ejecutarlo, porque un connoisseur necesita la búsqueda del Maker sobre sus notas.
- Latencia y throughput: ~5 s por pregunta en CPU según el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of Computing | 130M (base) | No disponible | RAG sobre notas empaquetadas, CPU offline | CC BY-SA 4.0 (notas); MIT (base y Maker) | Hugging Face |
| Gemma 4 (e4b) | ~4B efectivos | No disponible | Modelo generalista, respuesta de memoria | No disponible en la información | No disponible en la información |
| Gemma 4 con las mismas notas | ~4B efectivos | No disponible | Modelo generalista con recuperación | No disponible en la información | No disponible en la información |

En el examen del autor, el connoisseur de 130M supera a Gemma 4 de memoria (12/16 frente a 6/16) pero queda por debajo de Gemma 4 con las mismas notas (15/16), y Gemma 4 con notas también detecta mejor las respuestas ausentes (20/20 frente a 16/20 en el agregado de seis campos).

## Limitaciones y advertencias

- Solo responde bien a preguntas de consulta cuya respuesta está escrita literalmente en una frase de las notas; es más débil con lenguaje cotidiano que con lenguaje de manual.
- Las explicaciones son frases citadas, no redacción propia; no resume, no compara documentos, no hace matemáticas, no redacta ni opina.
- Su conocimiento se limita a 436 artículos de la Wikipedia inglesa sobre informática recuperados en noviembre de 2026; no cubre otros dominios ni idiomas distintos del inglés.
- Riesgo de alucinación reducido por diseño (abstención explícita), pero la detección de respuestas ausentes no es perfecta: 2/3 en el examen y 16/20 en el agregado de seis campos.
- La licencia CC BY-SA 4.0 de las notas exige atribución a los contribuyentes de Wikipedia y compartir igual; el uso comercial queda sujeto a esas condiciones de share-alike.
- No es ejecutable con Ollama o LM Studio por sí solos; requiere el Connoisseur Maker, lo que limita su integración en despliegues estándar.
- Sesgos conocidos: no documentados en la información disponible; al heredar texto de Wikipedia, puede reflejar los sesgos de sus artículos fuente.
- Los benchmarks son del propio autor, con puntuación por coincidencia de palabras clave y conjuntos de evaluación pequeños (16 hechos, 4 explicaciones, 3 preguntas de abstención), por lo que su robustez estadística es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Computing
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Computing/resolve/main/loom-connoisseurs-film.mp4
