# Tanatas298/qwen3-4b-finqa-lora

## Resumen

`qwen3-4b-finqa-lora` es un adaptador LoRA desarrollado por el usuario Tanatas298 sobre el modelo base Qwen/Qwen3-4B, orientado a responder preguntas numericas sobre informes financieros. En lugar de calcular aritmetica directamente, el adaptador genera un programa en el DSL de FinQA (por ejemplo `subtract(3538, 3480), divide(#0, 3480)`) que se ejecuta posteriormente en Python, de modo que el modelo se concentra en la sintesis de programas y no en el calculo.

El adaptador se entrena sobre las 6.251 preguntas de entrenamiento del dataset FinQA y reporta un 75,3% de exactitud de ejecucion y un 71,0% de exactitud de programa en el conjunto de test oficial (1.147 preguntas). El autor lo presenta explicitamente como una linea base reproducible para tareas de razonamiento numerico sobre tablas financieras, no como un producto listo para produccion.

Es relevante ahora porque demuestra que un modelo de 4.000 millones de parametros con un adaptador LoRA ligero (repo de 0,1 GB) puede superar a configuraciones con modelos de 14.000 millones y recuperacion de ejemplos en la tarea concreta de FinQA, a un coste de entrenamiento de menos de dos horas en una unica RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | 4.000 millones (modelo base); el adaptador LoRA anade un subconjunto no cuantificado en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima usada en entrenamiento); la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible en la model card; el modelo base Qwen3-4B admite cuantizacion estandar (AWQ, GPTQ, GGUF) segun su propia documentacion |
| Idiomas soportados | ingles (unico idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B en bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B en bf16 con la plantilla de chat y el modo de razonamiento (thinking) desactivado. Los modulos adaptados son las proyecciones q, k, v, o, gate, up y down, con rango r=16, alpha=32 y dropout 0. El entrenamiento usa Unsloth + TRL durante 2 epocas (782 pasos), tasa de aprendizaje 2e-4 con schedule coseno y warm-up del 3%, batch efectivo de 16 y longitud maxima de 4.096 tokens. La perdida se calcula unicamente sobre el objetivo (`Program: <programa gold>`).

La entrada del modelo es la pagina del informe (texto previo a la tabla, tabla en Markdown y texto posterior) junto con la pregunta; la salida esperada es un programa en el DSL de FinQA. El entrenamiento completo se ejecuto en una unica RTX 3090 de 24 GB con un pico de 9,6 GB y una duracion de aproximadamente 1 hora y 45 minutos. Se entrenaron dos semillas; la publicada (seed 0) fue la mejor en validacion (76,6% frente a 75,9%), aunque la seed 1 no publicada obtiene 76,0% en test frente al 75,3% de la publicada.

## Capacidades

- Generacion de programas en el DSL de FinQA a partir de una pagina de informe financiero y una pregunta en lenguaje natural.
- Razonamiento numerico delegado: el modelo no calcula, produce el programa que luego se ejecuta en Python.
- Comprension de tablas financieras representadas en Markdown, junto con el texto que las rodea.
- Respuesta a preguntas de tipo porcentaje de cambio, diferencias, ratios y operaciones encadenadas sobre cifras de estados financieros.
- Uso conversacional segun el pipeline declarado (`text-generation`, `conversational`), aunque el entrenamiento esta orientado a una unica tarea.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Linea base reproducible para investigacion en FinQA: permite replicar el entrenamiento y la evaluacion con el codigo del repositorio y comparar nuevas tecnicas de sintesis de programas sobre el mismo split.
- Extraccion de metricas de estados financieros: dada una pagina de un informe anual y una pregunta como "cual fue el cambio porcentual en beneficio neto de 2014 a 2015", el modelo genera el programa que produce la cifra exacta al ejecutarse.
- Generacion de pipelines auditables: al emitir un programa DSL ejecutable, cada respuesta queda trazada a operaciones concretas sobre celdas de la tabla, lo que facilita la revision por parte de un analista.
- Prototipado de asistentes de analisis financiero: sirve para validar la viabilidad de un asistente que responda sobre tablas de informes antes de invertir en modelos mayores o en recuperacion de ejemplos.
- Docencia en razonamiento numerico: el par (pregunta, programa) es un ejemplo didactico claro de descomposicion de un problema aritmetico en operaciones primitivas.
- Evaluacion comparativa de adaptadores LoRA: el repositorio incluye scripts de evaluacion con el script oficial de FinQA, util para medir el impacto de cambios en datos, rango o hiperparametros.
- Servicio de inferencia con vLLM: el autor documenta como fusionar el adaptador y servirlo con vLLM (`scripts/serve.sh`), adecuado para desplegar un endpoint de extraccion de cifras en un entorno interno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el test de FinQA (1.147 preguntas, script oficial de evaluacion). Intervalos de confianza al 95% obtenidos por bootstrap pareado con 10.000 remuestreos.

| Modelo | Exactitud de ejecucion [IC 95%] | Exactitud de programa |
|---|---|---|
| Este adaptador (seed 0, publicado) | 75,3 [72,8; 77,9] | 71,0 |
| Misma receta, seed 1 (no publicada) | 76,0 [73,5; 78,5] | 71,6 |
| Qwen3-14B AWQ, 4 ejemplos recuperados, decodificacion guiada | 69,7 [67,0; 72,3] | 64,3 |
| Qwen3-14B AWQ, 4 ejemplos recuperados | 68,3 [65,6; 70,9] | 63,1 |
| Qwen3-4B, 4 ejemplos recuperados | 59,7 [56,8; 62,5] | 54,8 |

El autor cita como referencia FINDER (FLAN-T5 retriever + GPT-4, EMNLP 2025) con 75,32 y el ensemble APOLLO (LREC-COLING 2024) con 71,07, y advierte que la comparabilidad directa no esta garantizada. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una RTX 3090 de 24 GB con Unsloth + TRL, pico de 9,6 GB y 1 h 45 min para 2 epocas.
- Inferencia: el adaptador requiere cargar el modelo base Qwen3-4B en bf16, lo que implica aproximadamente 8 GB de pesos mas overhead de activaciones y cache KV; la VRAM exacta de inferencia no se especifica en la informacion disponible.
- GPU recomendadas: RTX 3090 o superior para entrenamiento; para inferencia cabe en GPUs consumer con 12-24 GB (por ejemplo RTX 4090) y en A100/H100 para despliegues con concurrencia.
- Cabe en GPU consumer: si, el modelo base de 4.000 millones de parametros es apto para GPUs de gama alta consumer.
- Opciones de despliegue: transformers + PEFT (uso directo del adaptador), vLLM tras fusionar el adaptador (documentado en `scripts/serve.sh`). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FinQA (exactitud de ejecucion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-finqa-lora | 4.000 M + LoRA | 4.096 (entrenamiento) | 75,3 | Apache-2.0 | Hugging Face, repo de 0,1 GB |
| Qwen3-4B con 4 ejemplos recuperados | 4.000 M | no disponible | 59,7 | Apache-2.0 | Hugging Face |
| Qwen3-14B AWQ con 4 ejemplos recuperados y decodificacion guiada | 14.000 M | no disponible | 69,7 | Apache-2.0 | Hugging Face |
| FINDER (FLAN-T5 retriever + GPT-4) | no disponible | no disponible | 75,32 (referencia citada) | no disponible | paper EMNLP 2025 |
| APOLLO ensemble | no disponible | no disponible | 71,07 (referencia citada) | no disponible | paper LREC-COLING 2024 |

## Limitaciones y advertencias

- Alrededor de una de cada cuatro respuestas en el test de FinQA es incorrecta; parte de las etiquetas gold del propio dataset son erroneas o ambiguas (el autor estima un 7-12% de las preguntas de test).
- Entrenado y evaluado unicamente sobre informes anuales en ingles de empresas del S&P 500 entre 1999 y 2019; el rendimiento en otros documentos, idiomas o estilos de pregunta es desconocido.
- FinQA es publico desde 2021 y podria formar parte de los datos de preentrenamiento de Qwen3, lo que podria inflar los resultados.
- Solo se entrenaron dos semillas y la publicada no es la mejor en test, lo que introduce incertidumbre sobre la robustez de la cifra reportada.
- El adaptador espera el prompt exacto usado en entrenamiento (system prompt con el DSL, pagina y pregunta); variaciones en el formato pueden degradar la salida.
- No esta destinado a asesoramiento financiero: las salidas no deben usarse para decisiones de inversion, contabilidad o auditoria sin verificacion independiente.
- No se declaran capacidades de tool calling, agentes ni vision; el uso conversacional generico no ha sido evaluado.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial, pero el dataset FinQA se distribuye bajo CC BY 4.0 y los informes subyacentes son presentaciones publicas ante la SEC.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Tanatas298/qwen3-4b-finqa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio con codigo y evaluacion: https://github.com/Tanatas298/finqa-lora
- Dataset FinQA en Hugging Face: https://huggingface.co/datasets/ibm-research/finqa
- Repositorio original de FinQA: https://github.com/czyssrs/FinQA
- Paper FinQA (Chen et al., EMNLP 2021): https://arxiv.org/abs/2109.00122
