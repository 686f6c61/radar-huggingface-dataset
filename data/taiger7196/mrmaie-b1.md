# taiger7196/MrMaie-B1

## Resumen

MrMaie B1 es un modelo de generación de texto de 3.950.673.152 parámetros (aproximadamente 3,95 mil millones) publicado por el usuario taiger7196 en Hugging Face bajo licencia Apache 2.0. Se presenta como un derivado de la familia Qwen2 (la etiqueta `qwen2` aparece entre sus tags) sometido a un proceso de destilación sintética a partir de glm-5-3-flash servido mediante NVIDIA NIM, con el objetivo declarado de reducir la huella de memoria hasta en un 67,6 % respecto a un modelo base de 4B en FP16 sin podar parámetros.

La propuesta técnica del autor combina compresión sub-bit, embeddings con codebooks de 4 bits y un motor de decodificación especulativa basada en recuperación (REST). El resultado que reclama es una inferencia de 2.441,4 MB de VRAM activa y 78,47 tokens por segundo en una NVIDIA Tesla T4 de la capa gratuita de Colab, cifras que, de confirmarse de forma independiente, situarían al modelo en una relación rendimiento/memoria muy competitiva para hardware de gama baja.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños con técnicas agresivas de compresión y aceleración de decodificación orientadas a despliegue en GPU consumer o incluso en entornos gratuitos. No obstante, el propio autor advierte que se trata de una build experimental y que los benchmarks publicados proceden de un conjunto de 200 preguntas diseñado por él mismo, por lo que deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2 (según tag `qwen2`); detalles de capas y atención no disponibles |
| Parámetros totales | 3.950.673.152 (3,95 B) |
| Parámetros activos | No aplica (no es MoE); el autor indica 0 % de poda |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit (bitsandbytes), compresión sub-bit propietaria, embeddings con codebook de 4 bits; tiers equivalentes 16-bit, 8-bit y 4-bit documentados por el autor |
| Idiomas soportados | Inglés (en) e italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 5,5 GB) |

## Arquitectura y entrenamiento

El modelo se apoya en una arquitectura transformer de la familia Qwen2, según la etiqueta declarada en el repositorio, con 3,95 mil millones de parámetros sin podar. El autor no detalla el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto soportada, por lo que estos datos deben considerarse no disponibles. La innovación declarada no reside en la arquitectura base sino en la pila de compresión y decodificación: embeddings cuantizados con codebooks de 4 bits, compresión sub-bit de pesos y ejecución en FP16 con Tensor Cores sin anidamiento (un-nested FP16 Tensor Core execution).

El entrenamiento se describe como una destilación sintética y alineación a partir de glm-5-3-flash servido mediante NVIDIA NIM, sin que se especifiquen el volumen de tokens, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La decodificación especulativa REST (Retrieval-Based Speculative Decoding) integra un datastore de recuperación que acelera la generación; según el autor, este datastore está optimizado junto con un "alineamiento de subespacio dirigido", lo que explica su advertencia de que el rendimiento puede degradarse fuera de los dominios calibrados.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Razonamiento y resolución de problemas de matemáticas, álgebra y geometría, según el desglose del benchmark propio del autor.
- Lógica, secuencias y acertijos.
- Conocimiento factual de ciencia, geografía e historia (evaluado en el conjunto propio).
- Generación de código en Python, SQL, HTML, CSS y Git, según las categorías del benchmark del autor.
- Seguimiento estricto de instrucciones y generación de JSON (15 preguntas del conjunto de evaluación).
- Calibración epistémica y física aplicada (10 preguntas del conjunto de evaluación).
- Traducción y gramática dentro del par inglés-italiano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Asistencia conversacional en inglés e italiano: el modelo está entrenado y evaluado en ambos idiomas, por lo que encaja en chatbots de soporte bilingüe para mercados anglófonos e italianos, con la salvedad de que la longitud de contexto no está documentada.
- Generación de código en entornos con GPU limitada: sus 2.441,4 MB de VRAM activa en T4 permiten ejecutar un asistente de autocompletado o generación de snippets Python/SQL/HTML en una instancia gratuita de Colab o en una GPU de 4 GB, algo inviable con un 4B en FP16.
- Prototipado rápido y demos educativas: la velocidad declarada de 78,47 tok/s en T4 facilita sesiones interactivas de demostración sin incurrir en costes de GPU dedicada.
- Procesamiento por lotes de bajo coste: para tareas de clasificación, extracción o reformateo a JSON en inglés o italiano, el reducido footprint permite levantar varias instancias en una sola GPU o usar hardware de gama de entrada.
- Evaluación de técnicas de compresión: investigadores interesados en cuantización sub-bit y decodificación especulativa REST pueden usar el modelo como caso de estudio reproducible en hardware asequible.
- Filtrado y preprocesado de datos en pipelines NLP: su velocidad en T4 lo hace apto para tareas de etiquetado o reescritura de texto a granel donde la precisión extrema no sea crítica.
- Educación e investigación sobre destilación sintética: sirve como ejemplo práctico de alineación a partir de un modelo mayor servido por NIM, útil en cursos y trabajos sobre eficiencia de modelos.

## Benchmarks y rendimiento

Los únicos datos publicados proceden del conjunto de 200 preguntas diseñado por el propio autor (200 en inglés y 200 en italiano, 400 pruebas en total). No hay resultados en suites estándar como MMLU, HumanEval o GSM8K.

| Métrica | Modelo base 4B | MrMaie B1 | Mejora |
|---|---|---|---|
| Parámetros activos | 3.950.369.280 | 3.950.369.280 | 0 % poda |
| VRAM activa en GPU | 7.534,7 MB | 2.441,4 MB | -67,6 % |
| Equivalente 16-bit | 7.534,7 MB | 3.296,4 MB | -56,3 % |
| Equivalente 8-bit | 3.767,3 MB | 1.648,2 MB | -56,3 % |
| Equivalente 4-bit | 2.109,7 MB | 918,3 MB | -56,5 % |
| Generación continua (T4) | 18,04 tok/s | 78,47 tok/s | +334,9 % (4,35x) |
| Ráfaga por pregunta (200 Qs, T4) | 18,04 tok/s | 39,13 tok/s | +116,9 % (2,17x) |
| Benchmark 200 preguntas EN | — | 200/200 | 100,0 % |
| Benchmark 200 preguntas IT | — | 200/200 | 100,0 % |

Desglose del benchmark propio (idéntico en inglés e italiano):

| Categoría | Preguntas | Aciertos | Precisión |
|---|---|---|---|
| Ciencia, geografía e historia | 30 | 30 | 100,0 % |
| Matemáticas, álgebra y geometría | 30 | 30 | 100,0 % |
| Lógica, secuencias y acertijos | 30 | 30 | 100,0 % |
| Lengua, gramática y traducción | 30 | 30 | 100,0 % |
| Problemas aplicados y aritmética | 30 | 30 | 100,0 % |
| Código: Python, SQL, HTML, CSS, Git | 25 | 25 | 100,0 % |
| Instrucciones estrictas y JSON | 15 | 15 | 100,0 % |
| Calibración epistémica y física | 10 | 10 | 100,0 % |
| Total | 200 | 200 | 100,0 % |

El autor advierte explícitamente de que estos resultados pueden no reproducirse en suites externas debido al alineamiento de subespacio dirigido y a la optimización del datastore especulativo.

## Requisitos de hardware

- VRAM estimada para inferencia: 2.441,4 MB en la configuración activa reportada por el autor; 918,3 MB en el tier equivalente 4-bit; 3.296,4 MB en el tier equivalente 16-bit.
- GPU recomendadas: NVIDIA Tesla T4 (validada por el autor en Colab gratuito). Por huella de memoria, debería caber en RTX 3050 4 GB, RTX 4060, RTX 3060 12 GB, RTX 4090, A100 y H100, aunque solo la T4 está documentada.
- GPU consumer: sí, cabe en GPUs consumer de 4 GB o más según las cifras del autor; no se han publicado pruebas en otras tarjetas.
- Opciones de despliegue: el repositorio incluye pesos safetensors y la etiqueta bitsandbytes para cuantización 4-bit. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la decodificación especulativa REST es una implementación propia del autor, por lo que el rendimiento fuera de su stack no está garantizado.
- Latencia y throughput: 78,47 tok/s en generación continua y 39,13 tok/s en ráfaga por pregunta sobre T4, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MrMaie B1 | 3,95 B | No disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) | Compresión sub-bit y REST propietarios; solo EN/IT |
| Qwen2.5-3B (familia Qwen2) | ~3 B | 32.768 tokens (según la familia Qwen2.5; no confirmado para este derivado) | Apache 2.0 en la mayoría de variantes | Amplia, con soporte en vLLM, llama.cpp y Ollama | Base madura y ampliamente evaluada; multilingüe |
| Llama 3.2 3B | ~3 B | 128.000 tokens | Licencia comunitaria Llama | Muy extendida | Multilingüe oficial, ecosistema de despliegue consolidado |
| Phi-3.5-mini | 3,8 B | 128.000 tokens | MIT | Muy extendida | Fuerte en razonamiento y código; sin compresión sub-bit |

La comparación directa de rendimiento con estos modelos no es posible: MrMaie B1 solo publica resultados en su propio conjunto de 200 preguntas, mientras que las alternativas cuentan con evaluaciones en MMLU, HumanEval y GSM8K. La ventaja diferencial de MrMaie B1 es su huella de memoria declarada, no su calidad medida de forma independiente.

## Limitaciones y advertencias

- Build experimental: el autor reconoce posibles rarezas de generación, sensibilidad al formato e inestabilidad en prompts fuera de distribución debido a la compresión sub-bit y a la decodificación especulativa.
- Benchmarks no comparables: el 100 % de acierto procede de un conjunto de 200 preguntas diseñado por el propio autor, con alineamiento dirigido; no hay resultados en MMLU, HumanEval, GSM8K ni otras suites estándar.
- Riesgo de alucinación: no cuantificado; un modelo de 3,95 B destilado sintéticamente y con compresión agresiva es propenso a errores factuales fuera de los dominios calibrados.
- Cobertura lingüística limitada: solo inglés e italiano; no hay soporte declarado de castellano.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar cargas con documentos largos.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la naturaleza experimental del modelo traslada el riesgo de fallos al integrador.
- Ecosistema: sin integraciones documentadas con vLLM, llama.cpp, Ollama o TGI; el motor REST es propio y el rendimiento fuera de él no está validado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el mismo día (7 de noviembre de 2026); no hay historial de mantenimiento ni comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taiger7196/MrMaie-B1
- Perfil del autor: https://huggingface.co/taiger7196
- Listado de modelos del autor: https://huggingface.co/taiger7196/models
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
