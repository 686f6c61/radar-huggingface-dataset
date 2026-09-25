# sraivante/tiny-home-json-1m-v1

## Resumen

Tiny Home JSON 1M v1 es un modelo de lenguaje experimental desarrollado por el usuario sraivante, publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un decoder causal de estilo Llama entrenado desde cero (sin pesos preentrenados de base) con tan solo 1.094.240 parámetros, 3 capas de decoder y 4,38 MB de pesos en FP32. Su única tarea es convertir comandos domésticos breves en inglés y en hindi romanizado (hinglish) a un JSON con tres campos: activity, subject y action.

El modelo resuelve un problema muy acotado: el parseo de instrucciones de voz o texto hacia un espacio cerrado de 30 comandos, resultado de combinar 10 tipos de dispositivo con las acciones ON, OFF y STATUS. No genera lenguaje libre ni mantiene conversaciones; su utilidad real es servir como banco de pruebas para estudiar modelos diminutos, decodificación restringida por trie de tokens e inferencia en el borde (edge AI), con latencias medidas de decenas de milisegundos en CPU.

Su relevancia actual es sobre todo metodológica: demuestra hasta dónde llega un transformer de un millón de parámetros cuando el vocabulario de salida está completamente enumerado, y documenta de forma explícita sus fallos (por ejemplo, convierte "Do not turn on the fan" en una orden ON) y la ausencia de una clase de rechazo o no-op. El autor advierte que no está listo para accionar dispositivos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal de estilo Llama, inicializado aleatoriamente (sin pesos base preentrenados), 3 capas de decoder |
| Parametros totales | 1.094.240 (aproximadamente 1,09 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens, incluyendo el formato de plantilla y la salida generada |
| Tipos de cuantizacion | No disponible; no se ha publicado ninguna exportación cuantizada o compilada validada |
| Idiomas soportados | Inglés (en) e hindi romanizado / hinglish (hi). El hindi en escritura nativa no está soportado según los resultados reportados |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32; 4.380.048 bytes / 4,38 MB / 4,18 MiB) |
| Autor / editor | sraivante |
| Fecha de publicación | 2026-09-25 (versión v1.0.1) |
| Pipeline | text-generation (text-to-JSON) |
| Espacio de salida | 30 comandos: 10 tipos de dispositivo × ON / OFF / STATUS |
| Dataset relacionado | sraivante/home-commands-json-v1 (revisión v1.0.1) |
| Librería | transformers (versiones probadas: Transformers 4.56.2, tokenizers 0.22.1, torch >= 2.6, < 3) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Tamaño del repositorio | 0,0 GB reportado (los pesos ocupan 4,38 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama con 3 capas, inicializado de forma aleatoria y entrenado íntegramente desde cero, sin partir de ningún checkpoint preentrenado. El modelo completo ocupa 1.094.240 parámetros y sus pesos en FP32 suman 4.380.048 bytes. El contexto total es de 128 tokens, e incluye tanto el enmarcado de la plantilla de chat como la salida JSON, por lo que la entrada útil es muy corta.

El entrenamiento se realizó sobre el dataset home-commands-json-v1, también publicado por el autor, que define un espacio de salida cerrado de 30 comandos (10 dispositivos × ON/OFF/STATUS). No se especifican en la información disponible el número exacto de tokens de entrenamiento (el sufijo "1m" del nombre sugiere alrededor de un millón, pero no se confirma en la model card), la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; dado el tamaño y el enfoque, todo apunta a un ajuste supervisado directo. La innovación técnica destacable no está en la arquitectura, sino en el sistema de decodificación: el helper de inferencia utiliza un trie de tokens construido con los 30 comandos JSON observados en entrenamiento, lo que garantiza que la salida pertenezca al conjunto de comandos, aunque no que sea semánticamente correcta ni autorizada para actuar sobre un dispositivo. La plantilla de chat incluida reproduce exactamente el formato de entrenamiento para un único mensaje de usuario y rechaza deliberadamente historiales de conversación y system prompts, que no fueron entrenados como tareas soportadas.

## Capacidades

- Generación de JSON estructurado con los campos activity, subject y action para un conjunto cerrado de 30 comandos domésticos.
- Comprensión de comandos breves en inglés y en hindi romanizado / hinglish (por ejemplo, "pankha band karo" se traduce en action OFF, subject fan).
- Decodificación restringida por trie de tokens que fuerza la pertenencia al conjunto de 30 comandos entrenados.
- Inferencia en CPU con latencias de decenas de milisegundos por comando (ver sección de benchmarks).
- Ejecución en modo generación estándar de Transformers sin restricciones (la validez del JSON no está garantizada en ese caso).
- Uso mediante helper de Python (tiny_json_llm.infer.JsonCommandModel) o interfaz de línea de comandos (python -m tiny_json_llm.infer).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- No soporta conversaciones multi-turno ni historiales: la plantilla rechaza explícitamente el historial y los system prompts.
- No dispone de clase de rechazo o no-op, por lo que no puede declinar una instrucción.

## Casos de uso

- Prototipado rápido de asistentes domóticos: el modelo convierte una frase corta en un JSON con acción, actividad y sujeto, lo que permite conectar un front-end de voz o texto con una capa de ejecución simulada sin escribir reglas manuales para cada frase.
- Investigación sobre modelos diminutos entrenados desde cero: sirve como caso de estudio reproducible de qué capacidades se conservan y cuáles se pierden al reducir un decoder a 3 capas y 1,09 M de parámetros.
- Evaluación de hardware en el borde: el autor incluye un script (assessment/benchmark_device.py) para reproducir las mediciones de latencia y memoria en Raspberry Pi u otros dispositivos ARM de 64 bits, comparando rendimiento con 1 y 4 hilos.
- Enseñanza de decodificación restringida: el trie de tokens sobre los 30 comandos es un ejemplo práctico de constrained decoding para explicar cómo garantizar salidas válidas en espacios enumerados.
- Prefiltro en una cascada de modelos: al ser tan ligero (4,38 MB de pesos), puede actuar como primer clasificador que resuelve comandos domésticos triviales y deriva el resto a un modelo mayor, reduciendo coste y latencia en la mayoría de peticiones.
- Investigación sobre multilingüismo con code-switching: el soporte de hinglish romanizado permite estudiar cómo un modelo mínimo generaliza entre dos lenguas mezcladas en la misma frase.
- Generación o etiquetado de datos sintéticos de comandos: el modelo puede usarse para ampliar variantes de entrada asociadas a los 30 comandos del dataset home-commands-json-v1, siempre con revisión humana.
- Validación de pipelines de integración: las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible, lo que facilita probar el despliegue del modelo en infraestructura compatible con la API de endpoints de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son mediciones de latencia y memoria en CPU, realizadas por el autor.

Entorno de medición: Intel Core i7-1360P, Windows 11, Python 3.13.14, PyTorch 2.12.0 en CPU, Transformers 4.56.2. Batch size 1, FP32, 20 iteraciones de calentamiento y 200 peticiones cronometradas por ejecución. La medición incluye tokenización y generación JSON restringida, y excluye HTTP, reconocimiento de voz, sensores, ROS y actuación.

| Hilos de CPU | Latencia mediana | Latencia p95 | Latencia p99 | Throughput serie |
|---|---:|---:|---:|---:|
| 1 | 17,35 ms/comando | 22,31 ms | 28,46 ms | 55,30 comandos/s |
| 4 | 19,80 ms/comando | 24,70 ms | 26,90 ms | 49,72 comandos/s |

Datos adicionales medidos: los pesos ocupan 4.380.048 bytes (4,38 MB / 4,18 MiB); el proceso completo de Python/PyTorch en escritorio consumió aproximadamente 440 MiB de RAM residente, con un pico de working set de unos 442 MiB, incluyendo una sobrecarga considerable del runtime. La importación de librerías tardó 6,79 segundos y la carga de pesos posterior a la importación, 0,013 segundos (con posibles cachés de sistema de archivos ya calientes). No se usó fijación de núcleos ni control de modo de energía. Las latencias en ARM, el consumo, el throttling térmico y el rendimiento extremo a extremo en robótica quedan sin medir.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en FP32 (4,38 MB reales); la memoria dominante es la del runtime, no la del modelo.
- Memoria de proceso observada: aproximadamente 440 MiB de RAM residente y 442 MiB de pico en un proceso Python/PyTorch de escritorio; un runtime más ligero reduciría notablemente esta cifra.
- GPU recomendadas: no se especifica ninguna. Por tamaño, los pesos caben en cualquier GPU con al menos unas decenas de MB libres, incluidas integradas.
- Cabe en GPU de consumo: sí, de forma holgada, en cualquier GPU consumer e incluso en CPU. También es candidato para Raspberry Pi y dispositivos ARM, aunque no hay latencias ARM verificadas por el autor.
- Opciones de despliegue: Transformers con PyTorch (probado con torch >= 2.6, < 3 y Transformers 4.56.2). El repositorio incluye helper de inferencia en Python y una CLI. Las etiquetas incluyen text-generation-inference y endpoints_compatible, por lo que es compatible con ese tipo de infraestructura, pero no hay exportaciones validadas a llama.cpp, GGUF, Ollama ni formatos cuantizados.
- Latencia y throughput estimados: 17,35 ms de mediana por comando con 1 hilo (22,31 ms p95) y 55,30 comandos/s en serie en el hardware Intel indicado; con 4 hilos, 19,80 ms de mediana y 49,72 comandos/s, sin mejora respecto a un solo hilo en esa configuración.
- Arranque: la importación de librerías (6,79 s) domina el tiempo de puesta en marcha; la carga de pesos es prácticamente instantánea (0,013 s en el entorno medido).

## Comparativa con modelos similares

No se dispone de datos verificables de modelos directamente comparables en la información proporcionada. Los resultados de búsqueda web obtenidos solo contienen directorios genéricos de modelos (huggingface.co/models, modelscope.ai, listados de modelos gratuitos) sin referencias a alternativas de texto a JSON doméstico entrenadas desde cero.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-home-json-1m-v1 | 1.094.240 | 128 tokens | Apache-2.0 | Pesos safetensors en HuggingFace, versión v1.0.1 |
| Alternativas comparables | No disponible | No disponible | No disponible | No se han identificado modelos equivalentes en la información disponible |

Como referencia cualitativa, la categoría funcional se cubre habitualmente con parsers basados en reglas o expresiones regulares, clasificadores de intención basados en encoders pequeños (por ejemplo, fine-tunes de BERT o DistilBERT) o LLM de propósito general con salida JSON, pero no se dispone de especificaciones ni métricas de esas alternativas en el material consultado, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- El propio autor documenta que el modelo no tiene clase de rechazo ni de no-op, y puede convertir "Do not turn on the fan" en un comando ON, invirtiendo el significado de la orden.
- No está listo para accionar directamente robots o electrodomésticos. Los ejemplos de la model card solo devuelven datos y no ejecutan ninguna acción sobre dispositivos.
- El trie de decodificación garantiza que la salida pertenezca a los 30 comandos entrenados, pero no garantiza corrección semántica ni autorización para actuar.
- Riesgo de alucinación funcional: una entrada corta no soportada puede devolver un comando no relacionado en lugar de un error.
- La entrada vacía o demasiado larga lanza ValueError, pero entradas cortas no soportadas no se rechazan explícitamente.
- Contexto muy limitado: 128 tokens en total, incluyendo enmarcado y salida. Las instrucciones deben ser muy breves.
- Sin soporte multi-turno: la plantilla de chat rechaza historiales de conversación y system prompts porque no fueron entrenados como tareas soportadas.
- El hindi en escritura nativa no está soportado según los resultados reportados; el soporte se limita al hindi romanizado y al hinglish.
- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo se limita a una distribución estrecha de comandos domésticos en inglés y hinglish, por lo que la generalización fuera de ese dominio es impredecible.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Caveats de producción: no existe ninguna exportación cuantizada o compilada validada para runtimes de borde; las latencias publicadas son de CPU Intel x86 y no de ARM; no se midieron consumo, temperatura ni rendimiento extremo a extremo. El modelo tiene 0 descargas y 0 likes, y está marcado como experimental. Valide siempre el JSON generado y su significado antes de usarlo en cualquier sistema posterior.
- En el uso con Transformers sin decodificación restringida, la validez del JSON no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sraivante/tiny-home-json-1m-v1
- Dataset relacionado: https://huggingface.co/datasets/sraivante/home-commands-json-v1/tree/v1.0.1
- Registro de benchmarks de escritorio: assessment/robotics_edge_v1/desktop_cpu_1thread.json (ruta relativa dentro del repositorio del modelo)
- Informe de evaluación detallado: assessment/robotics_edge_v1/REPORT.md (ruta relativa dentro del repositorio del modelo)
- Script de medición en dispositivo: assessment/benchmark_device.py (ruta relativa dentro del repositorio del modelo)
- La búsqueda web no devolvió enlaces específicos de este modelo; únicamente directorios genéricos (https://huggingface.co/models, https://modelscope.ai/home, https://aimodels.org/ai-models/) sin relación directa con esta ficha.
