# tetiai/dynamic-engram-350m

## Resumen

Dynamic Engram 350M es un modelo de 365,4 millones de parámetros desarrollado por TetiAI S.r.l. (autor `tetiai` en Hugging Face) que implementa un enfoque poco habitual: responder preguntas a partir de una memoria que se inyecta en tiempo de inferencia, sin reentrenar ni modificar los pesos. El modelo parte de PleIAs/Pleias-RAG-350M (arquitectura Llama, 26 capas, dimensión 1024) y le añade unos 12 millones de parámetros en forma de lectores Engram, mecanismo de selección de candidatos y una cabeza de significado. La idea central es que los hechos residen en la memoria externa, no en los pesos, y el modelo aprende una vez a manejar memorias en general.

La relevancia práctica está en su orientación a CPU: se distribuye con grafos ONNX que incorporan la memoria, cuantización int8 e int4 y decodificación con borrador procedente de la memoria, con un tiempo de respuesta de aproximadamente 0,4 segundos por respuesta en dos hilos de CPU usando solo la pregunta en el prompt. Está pensado para casos de recuperación de hechos personales cortos y multilingües (inglés, italiano, francés, alemán, español y portugués) con abstención explícita cuando la respuesta no está en la memoria.

Es una release de investigación: el propio autor advierte que generaliza a memorias nuevas pero no a formulaciones nuevas de la pregunta ni a otros idiomas distintos de los de la memoria, y que falla en el caso de abstención cuando la memoria contiene elementos similares pero no la respuesta. Aun así, demuestra una vía alternativa a RAG clásico y a fine-tuning para inyectar conocimiento factual en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (26 capas, d=1024) con lectores Engram, elección de candidatos y cabeza de significado añadidos |
| Parametros totales | 365.400.470 (base 353,4M + 12,0M: lectores Engram 8,4M, elección de candidatos 2,1M, cabeza de significado 1,4M, compuertas del puntero) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (safetensors), int8 e int4 (ONNX) |
| Idiomas soportados | Entrenado en en, it, fr, de, es, pt; evaluado sin entrenamiento en ro, el, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), ONNX (int8 e int4), librería `dynamic_engram` en el repo |

## Arquitectura y entrenamiento

El modelo se construye sobre PleIAs/Pleias-RAG-350M, un transformer denso de 26 capas y dimensión 1024. Sobre esa base se añaden tres componentes: lectores Engram que inyectan los candidatos recuperados como embeddings de token propios a través de una compuerta sensible al contexto antes de las capas 2 y 13; un mecanismo de elección de candidatos que actúa como red de puntero en la salida, combinando la distribución del modelo de lenguaje con las puntuaciones de continuación y de pregunta sobre los candidatos; y una cabeza de significado que produce vectores de 384 dimensiones (media de los estados de la capa 8 más la cabeza) para la búsqueda semántica en la memoria, destilada de un modelo de embeddings multilingüe usado solo durante el entrenamiento.

La memoria se organiza en dos niveles: un registro crudo de pares ⟨texto, fecha⟩ indexado por n-gramas exactos de palabras y raíces, con un vector por elemento; y una memoria de conteos construida por pregunta a partir de los elementos recuperados, que registra qué sigue a cada n-grama y qué palabras aparecen cerca de las pistas de la pregunta. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset; la model card menciona datos sintéticos de evaluación y preguntas respondibles, no soportadas, nativamente no respondibles y contrafactuales en seis idiomas. No se documenta RLHF ni DPO.

## Capacidades

- Respuesta a preguntas a partir de memoria inyectada en tiempo de ejecución, sin reentrenamiento ni modificación de pesos.
- Memoria ilimitada: cualquier número de textos se conserva e indexa en tiempo proporcional a su longitud.
- Recuperación híbrida que combina puntuación léxica por n-gramas, similitud semántica y expresiones temporales explícitas ("ayer", "la última vez", "en 2024").
- Abstención entrenada: devuelve respuesta vacía ante preguntas no soportadas, con la aplicación mostrando "no lo sé" en el idioma del usuario.
- Modo `engram` (respuesta solo desde la memoria) y modo `hybrid` (añade hasta 3 elementos al prompt como fuentes citadas).
- Modo `strict` que silencia respuestas cuyas palabras no aparecen en la memoria recuperada.
- Multilingüe en seis idiomas de entrenamiento, con evaluación sin entrenamiento en rumano, griego y ruso.
- Exportación e importación del registro de memoria en JSONL para reconstruir el estado.
- Ejecución en CPU con ONNX y decodificación con borrador procedente de la memoria.

## Casos de uso

- Asistentes personales con memoria de hechos: el modelo permite inyectar notas del usuario ("Sara me regaló una taza violeta", "Giorgio ahora vive en Nápoles") y responder preguntas sobre ellas sin reentrenar, manteniendo los hechos fuera de los pesos y con marcas temporales para resolver consultas dependientes del tiempo.
- Atención al cliente con base de conocimiento dinámica: se pueden añadir fichas de producto o incidencias como memoria y responder preguntas concretas en varios idiomas europeos, con abstención cuando la información no está en la base, lo que reduce respuestas inventadas.
- Despliegue en dispositivos sin GPU: al ejecutarse en ONNX int8 o int4 sobre dos hilos de CPU con unos 0,4 segundos por respuesta, encaja en entornos de borde, portátiles o servidores sin acelerador.
- Extracción de datos de registros personales: con el modo híbrido y citación de fuentes, sirve para consultar diarios, historiales o notas fechadas y devolver la fuente exacta junto a la respuesta.
- Prototipado de sistemas RAG ligeros: sustituye pipelines de recuperación más pesados en escenarios donde la memoria es pequeña y los hechos son cortos, con indexación en tiempo proporcional a la longitud de cada texto.
- Investigación sobre abstención y atribución: el modelo está entrenado con preguntas no respondibles y contrafactuales, lo que lo hace útil como banco de pruebas para estudiar cuándo un modelo debe callar y cómo citar la memoria de origen.
- Filtrado y verificación de afirmaciones: el modo estricto permite descartar respuestas cuyas palabras no aparecen en la memoria recuperada, útil en tareas de validación factual sobre un corpus controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados sobre datos sintéticos retenidos (una vida sintética no vista en entrenamiento y conjuntos de test de QA retenidos), con intervalos de confianza del 95 % y una única ejecución de entrenamiento, e indica que en memorias personales el modelo se equivoca un 3,9 % con las compuertas Engram frente a un 8,3 % sin ellas. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 0,4 segundos por respuesta en dos hilos de CPU con la pregunta sola en el prompt, según la model card.
- VRAM estimada: no disponible de forma explícita; con 365,4M de parámetros, en bf16 rondaría 0,7 GB de pesos y en int8/int4 bastante menos, pero no se documenta la huella exacta de los grafos ONNX.
- GPU recomendadas: no se especifican; el diseño es CPU-first y no se documentan requisitos de GPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime a través de la librería `dynamic_engram` incluida en el repositorio, o PyTorch si se omite `onnx_dir`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se documenta la latencia de aproximadamente 0,4 segundos por respuesta en dos hilos de CPU; no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tetiai/dynamic-engram-350m | 365,4M | No disponible | Memoria inyectada en inferencia con puntero y abstención | Apache 2.0 | Hugging Face, ONNX y safetensors |
| PleIAs/Pleias-RAG-350M | 350M (base) | No disponible | Modelo base de generación aumentada por recuperación | No disponible en la información | Hugging Face |
| Modelos RAG de tamaño similar | Variable | Variable | Recuperación externa más generación | Variable | Variable |

No se dispone de datos de rendimiento comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Generaliza a memorias nuevas, pero no a formulaciones nuevas de la pregunta ni a idiomas distintos de los de la memoria; el propio autor lo señala como limitación explícita.
- No se mantiene en silencio cuando la memoria carece de la respuesta pero contiene elementos similares; la abstención funciona en la mayoría de preguntas no soportadas, no en ese caso concreto.
- Funciona mejor con hechos personales cortos formulados en el idioma de la memoria.
- Riesgo de alucinación mitigado parcialmente por el modo estricto, pero no eliminado.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto: la longitud de contexto no está disponible.
- Licencia Apache 2.0, que permite uso comercial con las condiciones habituales de atribución y aviso; no se documentan restricciones adicionales.
- Es una release de investigación con una sola ejecución de entrenamiento y evaluación sobre datos sintéticos; los resultados deben interpretarse con cautela en producción.
- El modelo está pensado para ejecutarse con la librería incluida; no se documenta compatibilidad con ecosistemas de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tetiai/dynamic-engram-350m
- Modelo base: https://huggingface.co/PleIAs/Pleias-RAG-350M
- Paper y código: https://doi.org/10.5281/zenodo.23803703 (Zenodo)
