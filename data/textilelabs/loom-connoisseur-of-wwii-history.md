# textilelabs/Loom-Connoisseur-of-WWII-History

## Resumen

Loom Connoisseur of WWII History es un adaptador de recuperación (retrieval adapter) publicado por Textile Labs sobre su modelo base Loom Crucible 4.5, un transformer de 130 millones de parámetros entrenado desde cero por el propio laboratorio. No se trata de un modelo afinado con nuevos pesos: el modelo base permanece inalterado y el "conocimiento" del sistema reside en un fichero de notas (`wwii-history.loompack`) que contiene 14.110 notas cortas extraídas de 292 artículos de la Wikipedia en inglés, con un total de 1.278.204 palabras y 2,7 MB de tamano.

El sistema resuelve un problema concreto: responder preguntas sobre historia de la Segunda Guerra Mundial citando literalmente las frases de sus notas y sus fuentes, y declarar explícitamente cuando la respuesta no está en ellas. La arquitectura de inferencia combina el modelo base con una búsqueda sobre las notas; el modelo localiza las notas más relevantes y extrae las frases que responden a la pregunta, en lugar de generar conocimiento de memoria. Esto lo hace ejecutable en CPU, sin conexión y con un consumo de recursos mínimo.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 130M de parámetros con un corpus de notas bien curado puede superar a un modelo unas 30 veces mayor (Gemma 4 e4b) en precisión factual sobre un dominio acotado; por otro, introduce el formato `.loompack` y la herramienta Loom Connoisseur Maker, que permite construir adaptadores de este tipo sobre notas propias en minutos. Es un modelo de nicho, en inglés, orientado a demostración técnica y a consulta factual, no a generación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Loom Crucible 4.5) más capa de recuperación sobre notas `.loompack` |
| Parametros totales | 130M (modelo base, sin cambios) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 (notas derivadas de Wikipedia); modelo base y Maker bajo MIT |
| Formato de pesos | No disponible (adaptador distribuido como fichero `.loompack` de 2,7 MB) |

## Arquitectura y entrenamiento

El modelo base Loom Crucible 4.5 es un transformer de 130 millones de parámetros entrenado desde cero por Textile Labs. Sobre él no se aplica ningún entrenamiento adicional: el adaptador es un fichero de notas (`wwii-history.loompack`) generado a partir de 292 artículos de la Wikipedia en inglés, reorganizados en 14.110 notas cortas que conservan las secciones originales y descartan guías de pronunciación, fórmulas y listas de referencias. El corpus resultante suma 1.278.204 palabras y ocupa 2,7 MB.

El mecanismo de respuesta es de recuperación y extracción: ante una pregunta, el sistema busca las notas más relevantes y el modelo cita las frases concretas que la responden, acompanándolas de su fuente. Cuando no encuentra evidencia suficiente, emite la frase fija "That isn't in my notes on World War II history". No hay RLHF, DPO ni ajuste supervisado documentado en la información disponible; el autor indica explícitamente "No training". La inferencia requiere la herramienta Loom Connoisseur Maker, que realiza la búsqueda sobre las notas; Ollama o LM Studio por sí solos no pueden ejecutar el adaptador.

## Capacidades

- Respuesta a preguntas factuales de tipo consulta (look-up) sobre historia de la Segunda Guerra Mundial, citando la frase y la fuente de sus notas.
- Declaración explícita de ausencia de información cuando la respuesta no está en el corpus ("That isn't in my notes on World War II history").
- Citación de fuentes por cada respuesta mostrada.
- Ejecución en CPU, sin conexión, con latencia de aproximadamente 5 segundos por pregunta en un portátil de 2019.
- Exposición de una API local compatible con Ollama en `http://127.0.0.1:11435` con el nombre de modelo `loom-connoisseur-of-wwii-history` mientras el Maker está abierto.
- Capacidad de crear adaptadores equivalentes sobre otros corpus mediante Loom Connoisseur Maker.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, escritura, resumen, comparación de documentos ni opiniones.
- Multilingüe: solo inglés.

## Casos de uso

- Consulta factual rápida sobre la Segunda Guerra Mundial: un usuario pregunta por fechas, nombres o eventos y el sistema devuelve la frase exacta de la Wikipedia con su fuente, lo que permite verificar la respuesta sin salir del entorno local.
- Asistente de estudio offline para estudiantes: al ejecutarse en CPU y sin conexión, puede desplegarse en portátiles de aula o entornos sin red para consultar material histórico acotado, con la ventaja de que declara cuándo no sabe la respuesta.
- Demostración de recuperación aumentada de bajo coste: sirve como ejemplo reproducible de que un modelo de 130M más un corpus curado supera a modelos mucho mayores respondiendo de memoria, útil en docencia o charlas técnicas sobre RAG.
- Verificación de citas en redacción histórica: el modelo devuelve la frase y la fuente de cada respuesta, lo que facilita contrastar afirmaciones contra el texto original de Wikipedia antes de publicar.
- Prototipado de asistentes de dominio con Loom Connoisseur Maker: el mismo flujo (notas propias + modelo base) permite construir en minutos adaptadores para manuales técnicos, apuntes de curso o aficiones, usando este modelo como referencia de comportamiento.
- Integración en aplicaciones locales vía API compatible con Ollama: mientras el Maker está en ejecución, otras aplicaciones pueden consultar el modelo en `http://127.0.0.1:11435`, lo que permite incorporarlo a un cliente de chat o a un script de consulta sin infraestructura de servidor.
- Evaluación de sistemas de recuperación: el examen congelado de 16 hechos, 4 explicaciones y 4 preguntas sin respuesta en las notas proporciona una base para comparar configuraciones de búsqueda o tamanos de corpus.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-27 sobre un examen congelado de historia de la Segunda Guerra Mundial (16 hechos, 4 explicaciones, 4 preguntas cuya respuesta no está en las notas). Las respuestas se puntúan por coincidencia de palabras clave contra respuestas redactadas antes de la prueba, sobre el texto mostrado al usuario, nunca sobre la línea de fuente.

| Modelo | Hechos correctos | Explicaciones (60% de puntos clave) | Detecta respuesta ausente | Total hechos (6 campos) | Total ausencias detectadas (6 campos) |
|---|---|---|---|---|---|
| Loom Connoisseur of WWII History | 13 / 16 | 2 / 4 | 2 / 2 | 58 / 84 | 16 / 20 |
| Gemma 4 (e4b, ~4B efectivos) de memoria | 5 / 16 | No disponible | No disponible | 42 / 84 | 0 / 20 |
| Gemma 4 (e4b) con las mismas notas | 13 / 16 | No disponible | No disponible | 69 / 84 | 20 / 20 |

El autor senala que dos de las preguntas sin respuesta se descartaron del test porque sus respuestas aparecían en el corpus mayor probado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 130M de parámetros el modelo cabe holgadamente en cualquier GPU consumer, aunque el autor enfatiza la ejecución en CPU.
- GPU recomendadas: no se especifican; el caso de uso declarado es CPU.
- Cabe en GPU consumer: sí, por tamano del modelo base (130M), aunque no se documentan configuraciones concretas.
- Despliegue: requiere Loom Connoisseur Maker (que descarga Loom Crucible 4.5 una vez). No es ejecutable directamente en Ollama o LM Studio; el Maker expone una API compatible con Ollama en `http://127.0.0.1:11435`.
- Latencia: aproximadamente 5 segundos por pregunta en un portátil de 2019 en CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom Connoisseur of WWII History | 130M (base) + notas de 2,7 MB | No disponible | Recuperación y extracción con citas | CC BY-SA 4.0 (notas) / MIT (base) | Hugging Face, ejecución local vía Maker |
| Gemma 4 (e4b) | ~4B efectivos | No disponible | Generación de memoria o con contexto | No disponible en la información | No disponible en la información |
| Loom Crucible 4.5 | 130M | No disponible | Modelo base de generación | MIT | Hugging Face |

La comparación directa disponible es la del examen del autor: el Connoisseur obtiene 13/16 hechos frente a 5/16 de Gemma 4 de memoria y 13/16 de Gemma 4 con las mismas notas; en el conjunto de seis campos, 58/84 frente a 42/84 y 69/84 respectivamente. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo responde bien a preguntas de consulta cuya respuesta esté escrita en una frase de sus notas; es más débil con lenguaje coloquial que con lenguaje de manual.
- Las explicaciones son frases citadas, no redacción propia del modelo.
- No resume, no compara documentos, no hace matemáticas, no escribe y no da opiniones.
- Su conocimiento se limita a 292 artículos de la Wikipedia en inglés recuperados en noviembre de 2026; cualquier tema fuera de ese corpus queda fuera de su alcance.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación reducido por el diseño de extracción, pero el sistema puede seleccionar una frase poco pertinente si la búsqueda falla; el autor no documenta tasas de error de recuperación.
- No es ejecutable en Ollama o LM Studio sin el Maker, lo que limita su integración en pipelines estándar.
- Licencia CC BY-SA 4.0 para las notas: obliga a atribuir a los contribuyentes de Wikipedia y a compartir igual; el uso comercial exige respetar esas condiciones. El modelo base y el Maker son MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es 0.0 GB, lo que sugiere que los artefactos pueden no estar completamente publicados.
- No se documentan sesgos específicos más allá de los inherentes al corpus de Wikipedia en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Connoisseur-of-WWII-History
- Modelo base Loom Crucible 4.5: https://huggingface.co/textilelabs/Loom-Crucible-4.5
- Loom Connoisseur Maker: https://huggingface.co/textilelabs/Loom-Connoisseur-Maker
- Vídeo de presentación: https://huggingface.co/textilelabs/Loom-Connoisseur-of-WWII-History/resolve/main/loom-connoisseurs-film.mp4
- Sitio de Textile Labs: https://textilelabs.github.io
