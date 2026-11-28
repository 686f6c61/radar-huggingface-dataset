# textilelabs/Loom-Connoisseur-of-Physics

## Resumen

Loom Connoisseur of Physics es un adaptador de recuperación aumentada (RAG) construido sobre el modelo base Loom Crucible 4.5, un transformer de 130M de parámetros entrenado desde cero por Textile Labs. No se trata de un modelo entrenado adicionalmente: el autor indica explícitamente que no hay entrenamiento, sino que el modelo base (sin modificar) se acompaña de un fichero de notas (`physics.loompack`) que contiene 17.363 notas cortas extraídas de 433 artículos de la Wikipedia en inglés sobre física (1,49 millones de palabras, 3,1 MB). El sistema localiza las notas más relevantes para cada pregunta y cita las frases que responden, indicando su fuente; cuando no encuentra la respuesta, responde «That isn't in my notes on physics».

El modelo resuelve un problema concreto: ofrecer un experto de dominio pequeño, ejecutable en CPU y sin conexión, que responda a partir de un corpus cerrado y verificable, mostrando procedencia y admitiendo ignorancia. Es relevante por su enfoque de «connoisseur»: un modelo pequeño con notas curadas supera a modelos mucho mayores que responden de memoria, según las mediciones del propio autor. El contexto no está especificado en la información disponible; el tamaño del paquete de notas es de 3,1 MB y el repo ocupa 0,0 GB.

La ficha se basa exclusivamente en la model card y los metadatos de Hugging Face; no se han publicado detalles de arquitectura interna, tokenizador ni ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Loom Crucible 4.5); sistema RAG con recuperación sobre notas y citación de fuentes |
| Parametros totales | 130M (modelo base, sin modificar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY-SA 4.0 (notas y adaptador); modelo base y Connoisseur Maker bajo MIT |
| Formato de pesos | No disponible (repo de 0,0 GB; el paquete de notas es `physics.loompack`, 3,1 MB) |

## Arquitectura y entrenamiento

El componente generativo es Loom Crucible 4.5, un transformer de 130M de parámetros entrenado desde cero por Textile Labs, que se utiliza sin cambios. La capa específica del «connoisseur» no es un ajuste fino ni un adaptador de pesos en el sentido habitual: es un fichero de notas (`physics.loompack`) generado a partir de 433 artículos de la Wikipedia inglesa, reorganizados en 17.363 notas cortas con las secciones conservadas y eliminando guías de pronunciación, fórmulas y listas de referencias. El sistema combina búsqueda sobre esas notas con extracción de las frases que responden a la consulta, mostrando la fuente.

No hay información disponible sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron RLHF o DPO. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal, etc.). El autor subraya que la arquitectura del connoisseur es deliberadamente simple: recuperación + citación, sin generación libre de conocimiento.

## Capacidades

- Respuesta a preguntas de consulta directa (look-up) cuya respuesta aparece literalmente en una frase de las notas.
- Citación de la fuente de cada respuesta (artículo de Wikipedia de origen).
- Declaración explícita de ignorancia cuando la respuesta no está en las notas («That isn't in my notes on physics»).
- Ejecución en CPU y sin conexión, con independencia de servicios externos.
- Exposición como endpoint compatible con Ollama en `http://127.0.0.1:11435` (nombre de modelo `loom-connoisseur-of-physics`) mientras el Connoisseur Maker está abierto.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (no documentado).
- Capacidad multilingüe limitada al inglés.
- No resume, no compara documentos, no hace matemáticas, no redacta y no emite opiniones (según el autor).

## Casos de uso

- Consulta de referencia en física para estudiantes: el modelo localiza la nota relevante y cita la frase y el artículo de Wikipedia, lo que permite verificar la respuesta sin salir del portátil.
- Asistente de repaso con trazabilidad: al mostrar siempre la fuente, el usuario puede contrastar la cita con el artículo original antes de fiarse de ella.
- Despliegue en entornos sin red: al ejecutarse en CPU y offline, encaja en aulas, laboratorios o equipos aislados donde no se permite acceso a la nube.
- Prototipado de sistemas RAG de dominio cerrado: el Connoisseur Maker permite crear paquetes de notas propios (apuntes, manuales, temas de Wikipedia) en minutos, sirviendo como banco de pruebas de recuperación y citación.
- Integración ligera vía API local: al exponerse como endpoint compatible con Ollama, puede conectarse a scripts o aplicaciones existentes sin reescribir el cliente.
- Filtro de «no sé» en flujos documentales: la detección explícita de respuestas ausentes resulta útil para marcar consultas que requieren escalado a un humano o a otra fuente.
- Demostración educativa de las diferencias entre responder de memoria y responder con notas: las métricas del autor (3/8 frente a 8/8 de Gemma 4 de memoria y 5/8 con las mismas notas) sirven para ilustrar el valor de la recuperación.

## Benchmarks y rendimiento

El autor publica mediciones del 27 de noviembre de 2026 sobre preguntas con redacción cotidiana de manual (estilo OpenStax University Physics), con cada respuesta verificada manualmente como presente en las notas. La puntuación se calcula por coincidencia de palabras clave sobre el texto mostrado, nunca sobre la línea de fuente.

| Prueba | Resultado |
|---|---|
| Hechos respondidos correctamente | 3 / 8 |
| Explicaciones (60 % de los puntos clave) | 0 / 1 |
| «No está en mis notas» cuando la respuesta realmente falta | 1 / 2 (6 pruebas descartadas porque sus respuestas aparecieron en las notas ampliadas) |

Comparativa publicada por el autor (mismas preguntas; la comparación con Gemma 4 se hizo con la versión anterior, más pequeña, de las notas):

| Sistema | Hechos correctos | Respuestas ausentes detectadas |
|---|---|---|
| Loom Connoisseur of Physics | 3 / 8 | 1 / 2 |
| Gemma 4 (e4b, ~4B parámetros efectivos, de memoria) | 8 / 8 | — |
| Gemma 4 con las mismas notas | 5 / 8 | — |
| Connoisseurs (agregado de seis campos) | 58 / 84 | 16 / 20 |
| Gemma 4 solo (agregado) | 42 / 84 | 0 / 20 |
| Gemma 4 con las mismas notas (agregado) | 69 / 84 | 20 / 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo base de 130M de parámetros es apto para CPU y, por tamaño, cabría en GPUs de consumo, pero no se documentan requisitos de VRAM ni cuantizaciones.
- GPU recomendadas: no disponibles; el autor indica ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo base (130M), aunque no se confirma en la información disponible.
- Despliegue: requiere el Loom Connoisseur Maker (que descarga Loom Crucible 4.5 una vez) y el fichero `physics.loompack`; Ollama o LM Studio por sí solos no pueden ejecutarlo, porque un connoisseur necesita la búsqueda del Maker sobre sus notas. Mientras el Maker está abierto, expone una API compatible con Ollama en `http://127.0.0.1:11435`.
- Latencia: aproximadamente 5 segundos por pregunta en un portátil de 2019 (dato del autor). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of Physics | 130M (base) + notas de 3,1 MB | No disponible | RAG con citación y abstención | CC BY-SA 4.0 (notas); MIT (base y Maker) | Hugging Face; requiere Connoisseur Maker |
| Gemma 4 (e4b) | ~4B efectivos | No disponible | Generación de memoria | No disponible en la información | No disponible en la información |
| Loom Crucible 4.5 | 130M | No disponible | Modelo base sin notas | MIT | Hugging Face |

La comparación con Gemma 4 procede de las mediciones del propio autor; no se dispone de datos independientes ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo responde bien a preguntas de consulta cuya respuesta esté escrita literalmente en una frase de sus notas; es más débil con redacción cotidiana que con redacción de manual.
- Las explicaciones son frases citadas, no elaboración propia; no resume, no compara documentos, no hace matemáticas, no redacta y no da opiniones.
- Su conocimiento se limita a 433 artículos de Wikipedia sobre física recuperados en noviembre de 2026; no cubre otros dominios ni actualizaciones posteriores.
- Riesgo de alucinación bajo por diseño (cita fuentes y declara ausencia), pero la recuperación puede seleccionar notas poco relevantes y la coincidencia por palabras clave no garantiza corrección semántica.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia CC BY-SA 4.0 para las notas: obliga a atribuir a los contribuyentes de Wikipedia y a compartir bajo la misma licencia las obras derivadas; el uso comercial debe respetar esas condiciones. El modelo base y el Maker son MIT.
- No es ejecutable con Ollama o LM Studio por sí solos: depende del Connoisseur Maker para la búsqueda sobre las notas.
- Los benchmarks publicados son internos, con muestras pequeñas (8 y 84 preguntas) y puntuación por coincidencia de palabras clave; deben interpretarse con cautela.
- No se dispone de información sobre sesgos, contexto máximo ni cuantizaciones, lo que limita la evaluación para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Physics
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-Physics/resolve/main/loom-connoisseurs-film.mp4
- Wikipedia (fuente de las notas, CC BY-SA 4.0): https://en.wikipedia.org
