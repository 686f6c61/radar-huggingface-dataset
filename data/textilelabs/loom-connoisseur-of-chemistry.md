# textilelabs/Loom-Connoisseur-of-Chemistry

## Resumen

Loom Connoisseur of Chemistry es un adaptador de recuperación (retrieval adapter) publicado por Textile Labs sobre su modelo base Loom Crucible 4.5, un transformer de 130 millones de parámetros entrenado desde cero. El adaptador no modifica los pesos del modelo base: añade un fichero de notas (`chemistry.loompack`, 2,0 MB) con 10.832 notas cortas extraídas de 330 artículos de la Wikipedia en inglés sobre química (930.635 palabras). El sistema responde localizando las notas más relevantes para la consulta y citando las frases que contienen la respuesta, junto con su fuente.

El objetivo del proyecto es demostrar que un modelo pequeño con una base documental bien curada puede superar a modelos mucho más grandes respondiendo de memoria en tareas de consulta factual. Según las mediciones del autor, el connoisseur acierta 10 de 16 hechos frente a los 10 de 16 de Gemma 4 (unos 4B de parámetros efectivos) sin notas, aunque Gemma 4 con las mismas notas alcanza 14 de 16, lo que evidencia que el modelo grande sigue leyendo mejor la documentación.

La relevancia actual del modelo reside en su enfoque de despliegue: funciona en CPU, sin conexión, en aproximadamente 5 segundos por pregunta en un portátil de 2019, y expone una API compatible con Ollama en `http://127.0.0.1:11435`. No obstante, requiere la aplicación Loom Connoisseur Maker para ejecutar la búsqueda sobre las notas; Ollama o LM Studio por sí solos no pueden ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Loom Crucible 4.5, sin cambios); adaptador de recuperación sobre fichero de notas |
| Parametros totales | 130M (modelo base, sin modificar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 (notas y adaptador); modelo base Loom Crucible 4.5 bajo MIT |
| Formato de pesos | No disponible (el adaptador se distribuye como fichero `chemistry.loompack` de 2,0 MB) |

## Arquitectura y entrenamiento

El adaptador no implica entrenamiento: reutiliza íntegramente Loom Crucible 4.5, un transformer de 130M de parámetros entrenado desde cero por Textile Labs, y le añade un fichero de notas estructurado. El pipeline de respuesta combina una fase de recuperación (búsqueda de las notas más relevantes para la consulta) con una fase de extracción, en la que el modelo cita las frases de las notas que responden a la pregunta e indica su fuente. Cuando la respuesta no está en las notas, el sistema devuelve explícitamente "That isn't in my notes on chemistry."

Las notas (`chemistry.loompack`) se construyeron a partir de 330 artículos de la Wikipedia en inglés sobre química, descargados en noviembre de 2026, reorganizados en secciones y con eliminación de guías de pronunciación, fórmulas y listas de referencias. El corpus resultante contiene 10.832 notas cortas y 930.635 palabras. No se documenta en la información disponible el uso de RLHF, DPO ni de un conjunto de datos de entrenamiento adicional para el adaptador.

## Capacidades

- Respuesta a preguntas factuales de química cuyas respuestas aparecen literalmente en las notas.
- Citación de fuentes: cada respuesta incluye la frase de la nota y su artículo de origen.
- Detección de ausencia de información: responde "That isn't in my notes on chemistry" cuando la respuesta no está en el corpus.
- Funcionamiento en CPU y sin conexión, con latencia de aproximadamente 5 segundos por pregunta en un portátil de 2019.
- Exposición de una API compatible con Ollama en `http://127.0.0.1:11435` con el nombre de modelo `loom-connoisseur-of-chemistry` mientras el Maker está abierto.
- Capacidad de crear connoisseurs personalizados sobre otros dominios mediante la herramienta Loom Connoisseur Maker.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking según la información disponible.

## Casos de uso

- Consulta rápida de conceptos de química en entornos sin conexión: un estudiante o investigador puede preguntar por definiciones, propiedades de elementos o reacciones y obtener la frase exacta de la Wikipedia con su fuente, sin depender de internet.
- Asistencia en laboratorio con portátil: dado que corre en CPU con unos 5 segundos por consulta, puede desplegarse en un equipo modesto de laboratorio para resolver dudas puntuales sobre nomenclatura, grupos de elementos o técnicas analíticas.
- Verificación de citas en documentación científica: el modelo devuelve la fuente de cada frase, lo que permite contrastar afirmaciones contra los artículos de Wikipedia incluidos en el corpus.
- Docencia y materiales educativos: sirve para generar preguntas de repaso cuya respuesta esté garantizada en el corpus, o para demostrar a estudiantes los límites de un sistema basado en recuperación (incluida su negativa explícita cuando no sabe).
- Integración en aplicaciones locales mediante la API compatible con Ollama: herramientas que ya hablan el protocolo de Ollama pueden apuntar a `127.0.0.1:11435` y consumir el connoisseur sin modificar su código.
- Creación de asistentes especializados en otros dominios: usando el Connoisseur Maker, el mismo enfoque se replica con apuntes de curso, manuales o temas de aficiones, manteniendo el patrón de citación y de rechazo cuando falta información.
- Evaluación de sistemas RAG de bajo coste: como banco de pruebas para comparar recuperación sobre corpus pequeños frente a modelos generativos grandes en tareas factuales.

## Benchmarks y rendimiento

Resultados medidos por el autor el 2026-11-27 sobre un examen congelado de química (16 hechos, 4 explicaciones y 6 preguntas cuya respuesta no está en las notas). La puntuación se calcula sobre el texto mostrado al usuario, por coincidencia de palabras clave contra respuestas redactadas antes de la prueba.

| Metrica | Loom Connoisseur | Gemma 4 (e4b, ~4B) sin notas | Gemma 4 con las mismas notas |
|---|---|---|---|
| Hechos correctos | 10 / 16 | 10 / 16 | 14 / 16 |
| Explicaciones (60% de puntos clave) | 3 / 4 | No disponible | No disponible |
| "No está en mis notas" correcto | 5 / 6 | No disponible | No disponible |
| Total en seis campos (hechos) | 58 / 84 | 42 / 84 | 69 / 84 |
| Total en seis campos (ausencias detectadas) | 16 / 20 | 0 / 20 | 20 / 20 |

Nota: la comparación con Gemma 4 se realizó con la versión anterior, más pequeña, de las notas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para ejecutarse en CPU, por lo que no requiere GPU dedicada.
- GPU recomendadas: no aplica; el autor indica ejecución en CPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (130M de parámetros), aunque el diseño apunta a CPU; no se documentan requisitos de VRAM concretos.
- Opciones de despliegue: Loom Connoisseur Maker (obligatorio para la búsqueda sobre notas), con API compatible con Ollama en el puerto 11435. Ollama o LM Studio por sí solos no pueden ejecutarlo.
- Latencia: aproximadamente 5 segundos por pregunta en un portátil de 2019. Throughput no disponible.
- Almacenamiento: el fichero de notas ocupa 2,0 MB; el repositorio de Hugging Face figura con 0,0 GB (sin pesos incluidos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of Chemistry | 130M (base sin cambios) | No disponible | Recuperación sobre notas + citación | CC BY-SA 4.0 (notas); MIT (base) | Hugging Face + Connoisseur Maker |
| Gemma 4 (e4b) | ~4B efectivos | No disponible | Generación desde memoria | No disponible en la información | No disponible en la información |
| Gemma 4 con las mismas notas | ~4B efectivos | No disponible | Generación aumentada por recuperación | No disponible en la información | No disponible en la información |

La comparación directa disponible se limita a la evaluación del autor: el connoisseur iguala a Gemma 4 sin notas en hechos (10/16) y detecta mejor las ausencias (16/20 frente a 0/20 en el total de seis campos), pero Gemma 4 con las mismas notas supera a ambos (14/16 y 20/20). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo responde bien a preguntas de consulta cuya respuesta esté escrita en una frase de sus notas; no generaliza más allá del corpus.
- Es más débil con lenguaje coloquial que con terminología de manual; las explicaciones son frases citadas, no redacción propia.
- No resume, no compara documentos, no hace matemáticas, no redacta y no emite opiniones.
- Su conocimiento se limita a 330 artículos de Wikipedia sobre química descargados en noviembre de 2026; cualquier avance posterior o tema fuera de esa lista queda fuera.
- Riesgo de alucinación reducido por diseño (cita fuentes y rechaza lo ausente), pero la puntuación de 10/16 en hechos indica que aún falla en una parte significativa de consultas.
- La licencia CC BY-SA 4.0 de las notas exige atribución a los contribuyentes de Wikipedia y compartir igual; el uso comercial debe respetar esas condiciones.
- Requiere la aplicación Loom Connoisseur Maker: no es ejecutable directamente en Ollama o LM Studio.
- Solo soporta inglés; no hay soporte multilingüe documentado.
- El repositorio no incluye pesos (0,0 GB); el modelo base debe obtenerse por separado.
- Sin datos publicados sobre sesgos específicos, cuantizaciones disponibles ni longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Chemistry
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Herramienta Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Chemistry/resolve/main/loom-connoisseurs-film.mp4
