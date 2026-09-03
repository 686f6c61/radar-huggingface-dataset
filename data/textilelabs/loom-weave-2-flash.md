# textilelabs/Loom-Weave-2-Flash

## Resumen

Loom-Weave-2-Flash es un modelo de lenguaje diminuto de 19,9 millones de parámetros desarrollado por Textile Labs, un proyecto independiente que entrena modelos pequeños desde cero en hardware de consumo (CPU de escritorio de 2013, sin cloud). Es la continuación de Loom Spark 2, con el mismo corpus y arquitectura, pero entrenado durante dos horas en lugar de una (1.645 pasos de optimización frente a 809). El modelo está diseñado para ser conversacional y para uso de herramientas (tool use) mediante un protocolo de `<lookup>` y `<result>`, con un énfasis explícito en la "honestidad calibrada": reconoce sus límites y evita inventar respuestas.

Su relevancia radica en que demuestra qué se puede conseguir con un presupuesto de entrenamiento extremadamente reducido y qué comportamientos emergen o no a esa escala. Aunque no es útil para tareas de conocimiento general, sirve como banco de pruebas para estudiar la honestidad, la extracción de información de resultados externos y los límites de los modelos pequeños. Se distribuye bajo licencia MIT y está disponible en formatos safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama (detalles de capas y dimensiones no disponibles) |
| Parametros totales | 19.867.008 (~19,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (tipos concretos no especificados), safetensors en FP32/FP16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Loom-Weave-2-Flash utiliza una arquitectura transformer decoder-only inspirada en Llama, aunque no se publican detalles sobre el numero de capas, dimensiones ocultas o cabezas de atencion. El entrenamiento se realizo desde cero con pesos inicializados aleatoriamente, sobre un corpus que incluye al menos 30.000 ejemplos escritos por humanos centrados en el comportamiento de "decir que el resultado no contiene la respuesta" y 3,3 millones de tokens adicionales. Se empleo un optimizador estandar (no se especifica cual) durante 1.645 pasos, logrando una loss de validacion de 2,25 y una precision del 58,9%.

La innovacion principal es el enfoque de "honestidad calibrada": el modelo se entrena para reconocer lo que no sabe (por ejemplo, datos personales del usuario) y para responder a partir de bloques `<result>` proporcionados por un harness externo. En el modo `<tools:on>`, el modelo emite una consulta `<lookup>...</lookup>` y se detiene; un programa externo ejecuta la busqueda y devuelve el resultado dentro de un bloque `<result>`. Este diseno separa la generacion de la recuperacion de informacion, evitando que el modelo alucine conocimiento factual.

## Capacidades

- Generacion de texto conversacional breve y con tono calido, limitada a respuestas cortas (maximo 64 tokens en la generacion).
- Reconocimiento de identidad: responde de forma consistente "Loom, a small model from Textile Labs" incluso con variaciones en mayusculas o ruido.
- Deteccion de limites: admite no saber informacion personal del usuario (p. ej. "what is my sisters name") y responde que no puede saberlo.
- Tool use basico: en modo `<tools:on>`, emite consultas `<lookup>` para preguntas factuales y espera un `<result>` para responder.
- Lectura de resultados: puede extraer y responder a partir de un bloque `<result>` proporcionado (acierto en 3 de 5 pruebas).
- Auto-terminacion: finaliza la generacion correctamente sin necesidad de un Modelfile externo en Ollama.
- Multilingue: no, solo ingles.
- No tiene modo de razonamiento ni capacidades de vision o audio.

## Casos de uso

- Demostracion educativa de modelos de lenguaje desde cero: ideal para cursos o talleres donde se quiera mostrar el ciclo completo de entrenamiento, inferencia y limitaciones de un LM diminuto en CPU.
- Prototipo de agente con tool use: su protocolo `<lookup>`/`<result>` permite construir un pipeline sencillo de pregunta-respuesta con recuperacion de Wikipedia, sirviendo como base para experimentos de agentes con herramientas.
- Investigacion sobre honestidad y calibracion: el modelo es un sujeto de pruebas para estudiar como los modelos pequenos manejan la incertidumbre y la ausencia de informacion, dado su diseno explicito de "honestidad calibrada".
- Benchmark de eficiencia en hardware limitado: se puede ejecutar en una Raspberry Pi o en un portatil antiguo, lo que lo hace util para validar despliegues en entornos sin GPU.
- Generacion de respuestas de chat simples en aplicaciones de juguete: por ejemplo, un bot de consola que responda a preguntas de identidad o conversaciones triviales sin necesidad de conocimientos externos.
- Prueba de integracion con Ollama: sirve para verificar el flujo de trabajo de `ollama run` con modelos personalizados, ya que incluye Modelfile y template listos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. La model card incluye metricas internas propias del autor, comparando Loom Spark 2 (1h de entrenamiento) con Weave 2 Flash (2h):

| Metrica | Spark 2 (1h) | Weave 2 Flash (2h) |
|---|---|---|
| Offline `<lookup>` leak (errores en 30 pruebas) | 0/30 | 0/30 |
| Clean single online lookup (aciertos en 10) | 10/10 | 10/10 |
| Identity correct (aciertos en 12) | 12/12 | 12/12 |
| Identity bajo mayusculas/erratas/ruido (6 pruebas) | 6/6 | 5/6 |
| Admite un hecho personal incognoscible (8 pruebas) | 4/8 | 6/8 |
| Responde desde un `<result>` suministrado (5 pruebas) | 2/5 | 3/5 |
| Dice que el resultado no contiene la respuesta (4 pruebas) | 0/4 | 0/4 |
| Auto-terminacion sin Modelfile (12 pruebas) | 12/12 | 12/12 |
| Validation loss / accuracy | 2,69 / 0,536 | 2,25 / 0,589 |

Estos datos muestran una mejora en calibracion y lectura de resultados con el segundo hora de entrenamiento, pero una incapacidad persistente para detectar ausencias en los resultados.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB; el modelo en FP32 ocupa ~79 MB, en GGUF cuantizado aun menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej. GTX 1050, RTX 2060 o superiores). Tambien funciona en CPU sin problemas.
- Compatibilidad con consumer GPU: si, absolutamente; incluso en CPUs antiguas se ejecuta en tiempo real.
- Opciones de despliegue: transformers (Python), Ollama (con Modelfile incluido), llama.cpp, vLLM (con limitaciones por el tamano), TGI.
- Latencia y throughput: en CPU moderna, la generacion de 64 tokens tarda menos de 1 segundo; en GPU es practicamente instantaneo. No hay datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo rango de 20M de parametros con caracteristicas de honestidad calibrada y tool use. Alternativas cercanas en tamano pero con objetivos distintos:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Loom-Weave-2-Flash | 19,9 M | 512 | MIT | Conversacional + tool use, honestidad |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | Modelo generalista pequeno |
| SmolLM 135M | 135 M | 2048 | Apache 2.0 | Modelo generalista pequeno |

Dado que Loom-Weave-2-Flash es un modelo de investigacion con un tamano extremadamente reducido, la comparacion con modelos de 100M o 1B no es directa. No se dispone de otros modelos de 20M con caracteristicas similares.

## Limitaciones y advertencias

- Conocimiento del mundo casi nulo: con tools desactivadas, rechaza preguntas factuales; es un comportamiento intencionado, pero limita su uso a conversacion y herramientas.
- Incapacidad para detectar ausencias en resultados: si se le proporciona un bloque `<result>` que no contiene la respuesta, el modelo respondera igualmente a partir de ese texto, inventando informacion. Es critico validar la salida en produccion.
- Contexto muy corto: solo 512 tokens, lo que impide conversaciones largas o documentos extensos.
- Solo en ingles: no soporta otros idiomas.
- Sin capacidades de razonamiento complejo ni matematicas avanzadas: su tamano lo limita a tareas triviales.
- Riesgo de alucinacion en tool use: si el harness devuelve un error o un resultado vacio, el modelo intentara responder de todos modos. Debe evitarse alimentar fallos de busqueda como `<result>`.
- No apto para produccion real: es un modelo de demostracion y experimentacion; no debe usarse en sistemas criticos sin supervision humana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/textilelabs/Loom-Weave-2-Flash
- Perfil del autor en Hugging Face: https://huggingface.co/textilelabs
- Modelo predecesor Loom Spark 2: https://huggingface.co/textilelabs/Loom-Spark-2
