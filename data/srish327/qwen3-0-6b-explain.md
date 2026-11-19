# srish327/qwen3-0.6b-explain

## Resumen

qwen3-0.6b-explain es un modelo derivado de Qwen/Qwen3-0.6B desarrollado por el usuario srish327, destilado para una tarea muy concreta: generar explicaciones estructuradas en JSON sobre el encaje entre un curriculum (resume) y una oferta de empleo (job posting). El modelo produce un resumen de ajuste, habilidades coincidentes y ausentes, y entre dos y cuatro citas textuales extraidas de la oferta laboral como evidencia. El profesor utilizado para la destilacion fue Qwen3-14B, con filtrado mediante las comprobaciones del proyecto resume-job-matcher.

La relevancia del modelo reside en su enfoque de destilacion a un tamano muy reducido (596 millones de parametros) para una tarea de nicho: la evaluacion de candidatos y la explicabilidad de procesos de seleccion. Frente al modelo base, mejora el porcentaje de salidas que pasan comprobaciones estrictas del 19,7% al 50,3%, con una precision de citas del 93,8% y un 98,9% de JSON valido. La licencia Apache 2.0 y la disponibilidad de pesos en formato GGUF (Q4_K_M de 0,40 GB) facilitan su despliegue incluso en CPU.

El modelo esta orientado practicamente a un unico caso de uso en ingles, con limitaciones explicitas declaradas por el autor: aproximadamente la mitad de las salidas no superan las comprobaciones estrictas, principalmente por citas fuera del rango de 5 a 25 palabras. No dispone de datos de benchmarks generales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) con adaptador LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (recomendado en la configuracion de llama.cpp del autor) |
| Tipos de cuantizacion | fp16 (merged), GGUF Q4_K_M y Q8_0; adaptador LoRA en r16/alpha32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (merged fp16 y adaptador), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 596 millones de parametros. Sobre esa base se aplico un proceso de destilacion con QLoRA: se entreno un adaptador LoRA con rango 16 y alpha 32 aplicado a todas las capas lineales, y posteriormente se fusiono con los pesos base para producir el modelo final en fp16. El profesor fue Qwen3-14B, y los datos de entrenamiento se filtraron con las comprobaciones del proyecto resume-job-matcher.

Los datos de entrenamiento consisten en curriculums sinteticos escritos por el profesor a partir de ofertas de empleo reales del sector tecnologico en ingles, junto con las ofertas correspondientes. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. El modelo se entreno con la plantilla de chat de Qwen3 y con el modo de razonamiento desactivado (`enable_thinking: false`), por lo que las llamadas en produccion deben replicar ese renderizado. La innovacion principal es la especializacion extrema: un modelo de menos de 600 millones de parametros ajustado para una unica tarea estructurada, con salida JSON validable y citas textuales verificables.

## Capacidades

- Generacion de explicaciones estructuradas en JSON sobre el encaje entre curriculum y oferta de empleo.
- Extraccion de habilidades coincidentes y ausentes entre el candidato y la oferta.
- Generacion de citas textuales (verbatim) de 5 a 25 palabras copiadas de la oferta laboral como evidencia.
- Salida en formato JSON con alta tasa de validez (98,9% en el conjunto de evaluacion).
- Soporte de conversacion mediante plantilla de chat de Qwen3 (formato chat completions compatible con endpoints).
- Capacidad de ejecucion en CPU mediante llama.cpp con el fichero GGUF Q4_K_M.
- No dispone de soporte declarado de tool calling, function calling, agentes ni vision.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Triaje automatizado de candidaturas: el modelo genera un JSON con el resumen de ajuste, habilidades coincidentes y ausentes para cada par curriculum-oferta, permitiendo priorizar candidatos en un ATS con una latencia de aproximadamente 1,7 s en GPU T4.
- Generacion de explicaciones para el candidato: a partir de las citas textuales de la oferta, se puede mostrar al aspirante por que su perfil encaja o no, con evidencia verificable extraida directamente del anuncio.
- Auditoria de decisiones de seleccion: al producir citas verbatim de la oferta, el sistema permite revisar que la evaluacion se basa en requisitos reales del puesto y no en inferencias del modelo.
- Procesamiento por lotes en infraestructura sin GPU: con el GGUF Q4_K_M (0,40 GB) y llama.cpp, se pueden procesar colas de pares curriculum-oferta en servidores de CPU a un ritmo de aproximadamente 25 s por explicacion en 4 nucleos.
- Enriquecimiento de plataformas de empleo: integracion en portales que quieran ofrecer al reclutador un analisis estructurado del ajuste de cada candidato sin depender de APIs externas, gracias a la licencia Apache 2.0 y al despliegue local.
- Prototipado e investigacion sobre destilacion: el repositorio explain-distill y el adaptador LoRA publicado permiten reproducir el pipeline, evaluar variantes o adaptar la tecnica a otros dominios de emparejamiento documento-documento.
- Validacion de pipelines de extraccion: la salida JSON con citas verificables sirve como caso de prueba para sistemas que necesitan comprobar fidelidad de citas y estructura de salida en modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 360 pares curriculum-oferta reservados (held-out):

| Metrica | Qwen3-0.6B base | qwen3-0.6b-explain |
|---|---|---|
| Aprobacion estricta (JSON valido, citas verbatim de 5-25 palabras, habilidades ausentes correctas) | 19,7% | 50,3% |
| Precision de citas | 75,6% | 93,8% |
| JSON valido | 95,8% | 98,9% |

La diferencia pareada es de +30,6 puntos (IC 95%: 24,2-36,9). El GGUF Q4_K_M obtiene resultados dentro de 0,6 puntos del fp16. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16 (596 M de parametros), alrededor de 0,5-0,7 GB con Q8_0 y unos 0,45 GB con Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta aproximadamente 1,7 s por explicacion en una T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: llama.cpp (llama-server) con el GGUF, y Transformers con los pesos merged fp16; el autor no menciona vLLM ni TGI, aunque al ser un transformer estandar podrian ser compatibles.
- Latencia y throughput: aproximadamente 1,7 s por explicacion en T4 y aproximadamente 25 s en 4 nucleos de CPU. No se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-0.6b-explain | 596 M | 4096 (recomendado) | Destilado para explicaciones JSON de encaje curriculum-oferta | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion | Modelo base generalista | Apache 2.0 | Hugging Face |
| Qwen3-14B (profesor) | 14 B | no disponible en la informacion | Modelo generalista de mayor tamano usado como profesor | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en emparejamiento curriculum-oferta en la informacion proporcionada.

## Limitaciones y advertencias

- Aproximadamente la mitad de las salidas (49,7%) no superan las comprobaciones estrictas, principalmente por citas fuera del rango de 5 a 25 palabras.
- Las citas deben validarse contra la oferta original antes de mostrarlas al usuario, tal como hace resume-job-matcher, para evitar citas inexactas o mal copiadas.
- Entrenado exclusivamente con ofertas de empleo tecnologicas en ingles y curriculums sinteticos generados por el profesor; el rendimiento en otros dominios o idiomas no esta evaluado.
- El modelo esta disenado para una unica tarea; no debe usarse como modelo generalista de generacion de texto.
- Requiere replicar la plantilla de chat de Qwen3 con `enable_thinking: false` para obtener el comportamiento para el que fue entrenado.
- Riesgo de sesgo derivado de los datos sinteticos y del subconjunto de ofertas utilizado; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las evaluaciones de ajuste producidas.
- No se han publicado resultados de benchmarks generales ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srish327/qwen3-0.6b-explain
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio resume-job-matcher: https://github.com/MSR327/resume-job-matcher
- Repositorio explain-distill (codigo, pipeline de datos y evaluacion): https://github.com/MSR327/explain-distill
