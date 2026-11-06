# Takenoko12345678/Ephedra-0.5-Cyber-Experimental

## Resumen

Ephedra-0.5-Cyber-Experimental es un adaptador LoRA experimental publicado por el usuario Takenoko12345678 sobre el modelo base XHToken/Spark-X2.6-4B, orientado a la revisión defensiva de vulnerabilidades en código fuente. No es un modelo independiente: se distribuye como adaptador PEFT (unos 260 MB) que debe combinarse con el modelo base de 4B parámetros, y existe una versión GGUF con el LoRA ya fusionado para su uso en llama.cpp. Su propósito declarado es actuar como agente con herramientas de solo lectura (listar ficheros, leer ficheros, grep) para inspeccionar repositorios y emitir veredictos estructurados en JSON sobre si un fragmento de código es vulnerable.

El modelo se entrenó con 3.285 avisos de seguridad de GitHub Advisory Database con commit de corrección identificado, abarcando JavaScript, TypeScript y Python (no C), y con pares de ficheros antes y después de la corrección. La salida esperada es un objeto JSON con campos `vulnerable`, `cwe`, `location`, `source`, `sink`, `missing_check` y `reason`. Se instruyó explícitamente al modelo para rechazar peticiones de exploits y no se incluyó código de ataque en el conjunto de entrenamiento.

Es relevante ahora como ejemplo de adaptación de bajo coste (LoRA r=32, alpha=64) de un modelo pequeño a una tarea de seguridad vertical, pero el propio autor advierte que es una versión experimental sin precisión práctica: como agente es peor que un checkpoint previo (6/96 pares resueltos frente a 14/96), en más del 60 % de las ejecuciones termina sin veredicto y su conocimiento general (MMLU-Pro ciencia) cae 9 puntos respecto al modelo base. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only XHToken/Spark-X2.6-4B |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B (según nomenclatura del ID) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible en el repositorio GGUF; el adaptador se distribuye en safetensors |
| Idiomas soportados | Inglés (en); evaluación parcial en japonés (MGSM) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Spark-X2.6-4B, un transformer decoder-only de 4B parámetros del que no se detallan en la información disponible ni la arquitectura interna exacta, ni la composición del corpus de preentrenamiento, ni si hubo RLHF o DPO. El LoRA usa r=32 y alpha=64, y todo el entrenamiento se realizó con el modo de pensamiento desactivado (`enable_thinking=False`).

Los datos de entrenamiento provienen de GitHub Advisory Database (CC-BY-4.0): 3.285 avisos con commit de corrección conocido, distribuidos en 1.466 repositorios, con ficheros antes y después de la corrección en proyectos de licencia permisiva (MIT, Apache-2.0, BSD, ISC). Los lenguajes cubiertos son JavaScript, TypeScript y Python; C no se entrenó. Cada ejemplo presenta un fragmento de unas 120 líneas y espera una respuesta JSON con veredicto, CWE, ubicación, fuente, sink, comprobación ausente y justificación. Las justificaciones fueron generadas por un modelo maestro (Gemma 4 31B, Apache-2.0) a partir del diff de corrección y del aviso, y se filtraron mediante verificación automática de números de línea y citas de código. Tras una primera fase en la que el modelo aprendió a responder a peticiones de ataque, se añadió una fase final de ajuste con 318 respuestas del propio modelo base rechazando exploits y 69 respuestas defensivas, para recuperar el comportamiento de rechazo.

## Capacidades

- Revisión de código orientada a vulnerabilidades en JavaScript, TypeScript y Python, con salida JSON estructurada (veredicto, CWE, ubicación, fuente, sink, comprobación ausente y razón).
- Funcionamiento como agente con herramientas de solo lectura: listar ficheros, leer ficheros y grep.
- Clasificación de fragmentos de código como vulnerables o no vulnerables (discriminación por chunk con AUC ligeramente superior al modelo base).
- Rechazo de peticiones de exploits y de pasos de ataque, con respuesta defensiva cuando se le pide mitigación.
- Razonamiento general y matemático en modo pensamiento (AIME, MMLU-Pro, MGSM), aunque con degradación en conocimiento científico.
- Capacidad multilingüe limitada: entrenado en inglés; evaluación de matemáticas en japonés (MGSM) con resultados variables.
- No soporta visión ni audio según la información disponible.
- No se documenta soporte de tool calling genérico más allá del esquema de agente descrito.

## Casos de uso

- Revisión automatizada de pull requests en CI: el adaptador puede ejecutarse como paso previo a la revisión humana para señalar fragmentos sospechosos en diffs de JavaScript, TypeScript o Python, emitiendo un JSON con CWE y ubicación que se integra en el pipeline. Adecuado por su formato de salida estructurado, aunque requiere validación humana por su alta tasa de falsos positivos.
- Triaje de avisos de seguridad internos: dado un repositorio con un advisory conocido, el modelo puede inspeccionar los ficheros afectados y proponer la ubicación del fallo y la comprobación ausente, sirviendo como primera pasada antes del análisis manual.
- Verificación de parches: comparar el fichero antes y después de una corrección para comprobar que el modelo considera seguro el código parcheado; en las pruebas redujo del 38 % al 5 % la tasa de marcar como vulnerable código ya corregido, aunque a costa de no emitir veredicto en muchos casos.
- Formación y concienciación en seguridad: usar las justificaciones generadas (fuente, sink, comprobación ausente) como material didáctico para explicar patrones de vulnerabilidad en código real de proyectos open source.
- Asistente de revisión en IDE o herramienta local: al existir versión GGUF Q8_0, puede desplegarse en llama.cpp en estaciones de trabajo sin GPU dedicada para revisiones puntuales de fragmentos de hasta 120 líneas.
- Filtro defensivo en pipelines de generación de código: interceptar sugerencias de código generadas por otros modelos y marcar aquellas que el adaptador clasifique como vulnerables antes de que lleguen al desarrollador.
- Investigación sobre ajuste fino en seguridad: servir como referencia reproducible de LoRA sobre un modelo de 4B para estudiar el equilibrio entre especialización vertical y degradación de conocimiento general.

## Benchmarks y rendimiento

Discriminación por chunk (AUC; 0,5 equivale a azar):

| Modelo | JavaScript | Python | C (no entrenado) |
|---|---:|---:|---:|
| Base Spark-X2.6-4B | 0,608 | 0,590 | 0,584 |
| Checkpoint ⑤ (previo al ajuste de seguridad) | 0,653 | 0,619 | 0,596 |
| Ephedra-0.5-Cyber-Experimental | 0,674 | 0,627 | 0,607 |

Evaluación como agente (96 pares, 32 por lenguaje, máximo 12 pasos, herramientas de solo lectura):

| Modelo | Pares resueltos | Tasa de veredicto emitido | Marcó como vulnerable el código previo al parche | Acertó la línea vulnerable | Marcó como vulnerable el código parcheado |
|---|---:|---:|---:|---:|---:|
| Base Spark-X2.6-4B | 1/96 | 3 % | 1/96 | 1/96 | 0/96 |
| Checkpoint ⑤ | 14/96 | 88 % | 57/96 | 22/96 | 36/96 (38 %) |
| Ephedra-0.5-Cyber-Experimental | 6/96 | 38 % | 11/96 | 7/96 | 5/96 (5 %) |

Seguridad del rechazo (temperatura 0, sin pensamiento):

| Modelo | Ataque con código | Ataque sin código | Ataque (13 preguntas distintas) | Preguntas defensivas |
|---|---:|---:|---:|---:|
| Base Spark-X2.6-4B | 30/40 | 40/40 | 12/13 | 21/21 |
| Checkpoint ⑤ | 14/40 | 37/40 | 6/13 | 21/21 |
| Ephedra-0.5-Cyber-Experimental | 39/40 | 40/40 | 13/13 | 21/21 |

Conocimiento general (modo pensamiento, llama.cpp Q8_0, una pasada por pregunta):

| Modelo | AIME 2026 (30) | MMLU-Pro ciencia (100) | MGSM japonés (250) |
|---|---:|---:|---:|
| Base Spark-X2.6-4B | 60,0 % | 83,0 % | 76,0 % |
| Checkpoint ⑤ | 63,3 % | 75,0 % | 73,2 % |
| Ephedra-0.5-Cyber-Experimental | 66,7 % | 74,0 % | 81,6 % |

Configuración de evaluación: llama.cpp Q8_0, límites de 24.576 tokens (AIME), 16.384 (MMLU-Pro) y 8.192 (MGSM), temperatura 1,0, top_p 0,95, top_k 20; AIME en Mac y MMLU-Pro/MGSM en Kaggle T4.

## Requisitos de hardware

- El adaptador LoRA ocupa unos 260 MB; el peso real está en el modelo base de 4B parámetros.
- VRAM estimada: en FP16, aproximadamente 8-9 GB para el modelo base de 4B más overhead de contexto; en Q8_0 (GGUF), alrededor de 4-5 GB; en cuantizaciones de 4 bits, aproximadamente 2,5-3 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16; RTX 3060/4060 de 12 GB, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en FP16; en GPUs de 6-8 GB mediante GGUF Q8_0 o cuantizaciones menores.
- Opciones de despliegue: llama.cpp (versión GGUF Q8_0 documentada por el autor), PEFT con transformers para el adaptador, y servidores compatibles con llama.cpp; no se documenta soporte específico de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Las evaluaciones se hicieron en Mac y Kaggle T4 sin reportar métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ephedra-0.5-Cyber-Experimental | 4B (base) + LoRA | No disponible | Revisión defensiva de vulnerabilidades vía agente | Apache-2.0 | Hugging Face (adaptador y GGUF) |
| XHToken/Spark-X2.6-4B (base) | 4B | No disponible | Modelo generalista | Apache-2.0 | Hugging Face |
| Checkpoint ⑤ (versión previa del mismo autor) | 4B (base) + LoRA | No disponible | Igual, sin ajuste de rechazo | Apache-2.0 | No disponible públicamente en la información proporcionada |

No se dispone de datos sobre otros modelos especializados en revisión de vulnerabilidades comparables en la información proporcionada.

## Limitaciones y advertencias

- Precisión práctica nula según el propio autor: solo resuelve 6 de 96 pares vulnerable/parcheado como agente, frente a 14 del checkpoint previo.
- En más del 60 % de las ejecuciones como agente no emite veredicto; la mayoría de los fallos se deben a agotar el límite de 12 pasos leyendo ficheros (101 de 192 ejecuciones).
- Tasa muy elevada de falsos positivos y falsos negativos; los resultados deben validarse siempre por una persona.
- C no forma parte del entrenamiento: no detectó ninguna línea vulnerable en los pares en C de la evaluación.
- Degradación del conocimiento general: MMLU-Pro ciencia cae 9 puntos respecto al modelo base, con 12 preguntas que el base acierta y este modelo falla frente a 3 en sentido contrario.
- El rechazo de peticiones de ataque no es perfecto: en 1 de 40 casos respondió a una petición de intrusión explicando un patrón de expresiones regulares, aunque sin valores explotables.
- Idiomas: entrenado únicamente en inglés; el soporte multilingüe no está garantizado.
- Longitud de contexto no documentada; los ejemplos de entrenamiento usan fragmentos de unas 120 líneas.
- Uso previsto exclusivamente defensivo (revisión de código propio y verificación de parches); el autor no autoriza su uso contra sistemas de terceros.
- Licencia Apache-2.0, que permite uso comercial, pero las justificaciones derivan de GitHub Advisory Database (CC-BY-4.0) y de Gemma 4 31B, por lo que deben respetarse las atribuciones correspondientes.
- Modelo no oficial: no está afiliado a XHToken, propietario del modelo base.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/Takenoko12345678/Ephedra-0.5-Cyber-Experimental
- Hugging Face (GGUF con LoRA fusionado): https://huggingface.co/Takenoko12345678/Ephedra-0.5-Cyber-Experimental-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- GitHub Advisory Database: https://github.com/github/advisory-database
