# vonvonhero/Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT4

## Resumen

Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT4 es una conversión a formato OpenVINO INT4 de una variante "uncensored" del modelo Ornith-1.5-35B-A3B, desarrollado por ornith-ai. El modelo original forma parte de la familia Ornith, diseñada para tareas agénticas con un bucle de auto-mejora: el propio modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo. Esta versión concreta ha sido exportada como un modelo de visión-lenguaje (image-text-to-text) basado en la arquitectura Qwen3.5, aunque también puede usarse para generación de texto puro.

La variante "uncensored" se caracteriza por presentar una tasa de rechazo muy baja en benchmarks de seguridad como JailbreakBench y HarmBench, lo que la hace adecuada para entornos de investigación donde se requiere explorar respuestas sin filtros. El modelo se distribuye bajo licencia MIT y está optimizado para ejecutarse con OpenVINO GenAI, lo que permite su despliegue en CPU y GPU de Intel. El tamaño del repositorio es de 19.0 GB, con un peso del modelo de 17.69 GiB en formato INT4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, con capacidades multimodales (imagen y texto) |
| Parametros totales | 35B (segun nomenclatura del nombre, no confirmado en la documentacion) |
| Parametros activos | 3B (segun nomenclatura del nombre, no confirmado en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (OpenVINO IR); tambien existe version GGUF sin especificar cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), safetensors en el modelo base, GGUF disponible |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parametros totales y 3 mil millones activos, segun la nomenclatura del nombre. La familia Ornith se distingue por su enfoque de auto-mejora: el modelo genera sus propias tareas, construye scaffolds (andamiajes) especificos para cada tarea y produce rollouts de soluciones que se utilizan en un ciclo de aprendizaje por refuerzo. Este proceso, denominado "self-scaffolding" y "self-improvement", permite al modelo mejorar continuamente sin intervencion humana directa.

La version convertida a OpenVINO INT4 mantiene las capacidades del modelo original, incluyendo el procesamiento de imagenes y texto. El proceso de cuantizacion a INT4 reduce el tamaño del modelo a 17.69 GiB, facilitando su despliegue en hardware con recursos limitados. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: el modelo puede producir respuestas coherentes y realizar tareas de razonamiento, aunque no se especifican detalles sobre su rendimiento en tareas logicas o matematicas.
- Procesamiento multimodal: al ser un modelo de vision-lenguaje, acepta entradas de imagen y texto, permitiendo tareas como descripcion de imagenes, respuesta a preguntas visuales y generacion de texto condicionado a contenido visual.
- Conversacion multi-turno: el modelo esta disenado para mantener dialogos, como se muestra en el ejemplo de uso con generacion de texto en japones.
- Modo "uncensored": presenta una tasa de rechazo muy baja en benchmarks de seguridad, lo que implica que responde a solicitudes directas sin filtros de contenido.
- Auto-mejora: el modelo base incorpora un mecanismo de auto-mejora que le permite proponer tareas y generar soluciones para aprendizaje por refuerzo, aunque esta capacidad no esta necesariamente disponible en la version convertida.
- Soporte de tool calling y agentes: no se menciona explicitamente en la documentacion, pero la familia Ornith esta orientada a tareas agénticas, por lo que es probable que el modelo base tenga estas capacidades.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para evaluar tecnicas de jailbreak y medir la robustez de los sistemas de moderacion, gracias a su alta tasa de respuesta en benchmarks como JailbreakBench y HarmBench.
- Generacion de contenido creativo sin restricciones: en entornos controlados, puede emplearse para producir textos, dialogos o narrativas que requieran explorar temas sensibles sin filtros, siempre bajo supervision humana.
- Desarrollo de agentes autonomos: al estar basado en un modelo orientado a tareas agénticas, puede integrarse en pipelines de automatizacion donde se necesite que el modelo planifique y ejecute acciones de forma autonoma.
- Analisis de imagenes y texto combinados: su capacidad multimodal permite procesar documentos escaneados, capturas de pantalla o fotografias junto con instrucciones textuales para extraer informacion o generar resumenes.
- Despliegue en entornos con recursos limitados: gracias a la cuantizacion INT4 y al soporte de OpenVINO, puede ejecutarse en CPUs de Intel o GPUs integradas, lo que lo hace adecuado para prototipos rapidos o aplicaciones en edge computing.
- Evaluacion de modelos "uncensored": sirve como referencia para comparar el comportamiento de modelos con y sin filtros de seguridad, ayudando a entender el impacto de la moderacion en la calidad de las respuestas.

## Benchmarks y rendimiento

La informacion proporcionada incluye resultados de evaluacion en dos benchmarks de seguridad, presentados en la model card:

| Benchmark | Resultado |
|---|---|
| JailbreakBench ASR | 93/100 (93.0%) |
| HarmBench ASR (159 comportamientos estandar) | 153/159 (96.2%) |

La tasa de ataque exitoso (ASR) indica el porcentaje de solicitudes que el modelo responde sin rechazar. Un valor alto significa menos rechazos. La evaluacion se realizo con razonamiento desactivado, temperatura 0, semilla 42, limite de 256 tokens de salida y el clasificador `HarmBench-Llama-2-13b-cls`. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 17.69 GiB en INT4, por lo que se recomienda al menos 20 GB de VRAM para inferencia en GPU sin swapping.
- GPU recomendadas: tarjetas con 24 GB de VRAM como la NVIDIA RTX 4090, o GPUs de Intel con soporte OpenVINO. Tambien puede ejecutarse en CPU con OpenVINO, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: si, una RTX 4090 o similar puede alojar el modelo completo en INT4.
- Opciones de despliegue: OpenVINO GenAI (obligatorio para este formato), con `VLMPipeline` para entradas multimodales. Tambien existe una version GGUF que puede usarse con llama.cpp, Ollama o vLLM, aunque no se especifican cuantizaciones.
- Latencia y throughput: no se proporcionan datos concretos. Dependera del hardware y de la optimizacion de OpenVINO.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. Se puede mencionar la relacion con el modelo base y la version GGUF:

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B totales, 3B activos | no disponible | safetensors | MIT | no disponible |
| Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT4 | 35B totales, 3B activos | no disponible | OpenVINO INT4 | MIT | ASR 93% JailbreakBench, 96.2% HarmBench |
| Ornith-1.5-35B-A3B-Uncensored-GGUF | 35B totales, 3B activos | no disponible | GGUF | MIT | no disponible |

No se han encontrado modelos comparables de otros desarrolladores con caracteristicas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser una variante "uncensored", el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas. No debe desplegarse en produccion sin sistemas de moderacion adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion o producir respuestas factualmente incorrectas, especialmente en tareas de razonamiento complejo.
- Sesgos no evaluados: no se ha publicado informacion sobre sesgos de genero, raza o cultura. Se recomienda realizar auditorias antes de usarlo en aplicaciones sensibles.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Dependencia de OpenVINO: el formato INT4 requiere la version 2026.3.x de OpenVINO y OpenVINO GenAI, lo que limita su portabilidad a otros frameworks.
- Rendimiento no verificado: los benchmarks de seguridad se obtuvieron en condiciones especificas (temperatura 0, semilla 42, limite de tokens) y pueden variar en otros entornos.
- Uso comercial: la licencia MIT permite uso comercial, pero el contenido generado puede incurrir en responsabilidades legales si se distribuye sin moderacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vonvonhero/Ornith-1.5-35B-A3B-Uncensored-OpenVINO-INT4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version GGUF: https://huggingface.co/vonvonhero/Ornith-1.5-35B-A3B-Uncensored-GGUF
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub: https://github.com/ornith-ai/Ornith-1
- Pagina de descarga GGUF (local-ai-zone): https://local-ai-zone.github.io/models/ornith-1-5-35b-a3b.html
