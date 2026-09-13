# taksovpallo/Sovpallo-4B-v1

## Resumen

Sovpallo-4B-v1 es un ajuste fino por QLoRA del modelo Qwen3-4B en su variante ya cuantizada a 4 bits para MLX (`mlx-community/Qwen3-4B-4bit`), publicado por el usuario taksovpallo. El objetivo declarado por el autor es disponer de un asistente de IA local para desarrolladores sobre Apple Silicon: responder preguntas de programacion, escribir y explicar codigo, ayudar con arquitectura y depuracion, y resolver preguntas factuales de formato corto. El entrenamiento se realizo sobre el dataset SimpleQA (4.104 ejemplos de entrenamiento y 216 de validacion), con un loss de validacion de 0,201.

El modelo tiene 4.022.468.096 parametros (aproximadamente 4,02 B) en formato denso, no MoE, y ocupa 2,3 GB en el repositorio de HuggingFace. Hereda de Qwen3-4B la arquitectura transformer decoder-only con Grouped Query Attention y una ventana de contexto nativa de 32.768 tokens (no confirmada de forma explicita en la model card del autor). Los idiomas declarados son ingles y ruso.

Su relevancia es acotada pero concreta: demuestra un flujo de trabajo de fine-tuning completo sobre hardware de consumo Apple (M1 Pro), con metricas de rendimiento medidas (67 tokens/s y 2,41 GB de pico de memoria) y una receta reproducible (QLoRA con rank 64 sobre todas las capas y proyecciones). Ahora bien, no declara licencia, no publica benchmarks estandar y su validacion se limita a 50 preguntas, por lo que debe tratarse como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), ajustado con QLoRA |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No confirmada en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos (extensibles a 131.072 con YaRN) |
| Tipos de cuantizacion | 4-bit MLX (heredada del base `mlx-community/Qwen3-4B-4bit`); no se documentan otros formatos |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 2,3 GB |
| Autor | taksovpallo (Sovpallo) |
| Fecha de publicacion | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-4B-4bit`, es decir, un Qwen3-4B ya cuantizado a 4 bits por la comunidad de MLX. Sobre esa base se aplico un ajuste QLoRA con rank 64, segun la model card sobre todas las capas y todas las proyecciones. El dataset empleado es SimpleQA, con 4.104 ejemplos de entrenamiento y 216 de validacion; el loss de validacion reportado es 0,201. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases posteriores de RLHF, DPO u otra alineacion.

La innovacion tecnica del proyecto no esta en la arquitectura del modelo, que es la de Qwen3, sino en el flujo de trabajo: entrenar y ejecutar un asistente de 4 B enteramente en Apple Silicon mediante MLX, con cifras medidas por el autor de 67 tokens/s y 2,41 GB de pico de memoria en un M1 Pro. No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento explicitos, aunque el modelo base Qwen3 si incorpora por diseno un modo de pensamiento que este fine-tune podria no haber preservado (no hay informacion al respecto).

## Capacidades

- Generacion de texto y respuesta a preguntas factuales de formato corto, entrenada expresamente sobre SimpleQA.
- Asistencia en programacion: escribir y explicar codigo segun la model card.
- Ayuda con decisiones de arquitectura de software y con tareas de depuracion.
- Conversacion multi-turno mediante plantillas de chat de Qwen3 (la model card muestra el uso de `apply_chat_template`).
- Capacidades multilingues limitadas a ingles y ruso (idiomas declarados).
- Ejecucion local en Apple Silicon con MLX, sin dependencia de servicios en la nube.

No hay informacion sobre soporte de tool calling o function calling tras el fine-tune, ni sobre uso en agentes, razonamiento multi-paso, vision o audio. Aunque el modelo base Qwen3-4B soporta tool calling, no puede confirmarse que estas capacidades se hayan conservado; deben verificarse empiricamente antes de usarlas en produccion.

## Casos de uso

- Asistente de programacion local en portatiles Apple: cargar el modelo con `mlx_lm` y usarlo como autocompletado o explicador de fragmentos de codigo sin enviar codigo a servicios externos, gracias a los 2,41 GB de pico de memoria medidos en un M1 Pro.
- Respuesta a preguntas factuales de formato corto: el ajuste sobre SimpleQA lo orienta a preguntas del tipo "quien recibio el premio X en el ano Y", util para prototipos de bases de conocimiento cerradas.
- Soporte a la depuracion en entornos sin GPU dedicada: al ejecutarse en memoria unificada, permite analizar trazas de error y proponer correcciones en equipos de desarrollo con Apple Silicon.
- Generacion de documentacion tecnica y explicaciones de codigo dentro de un pipeline local de pre-revision, antes de abrir un pull request.
- Evaluacion y experimentacion en investigacion: sirve como caso de estudio reproducible de QLoRA sobre un base ya cuantizado a 4 bits, util para medir el impacto del fine-tuning sobre una base de baja precision.
- Chat de asistencia tecnica en ruso e ingles: al declarar ambos idiomas, puede emplearse como asistente interno para equipos que operan en esas dos lenguas.
- Prototipado rapido de asistentes de escritorio en macOS: integrable mediante la libreria MLX en aplicaciones nativas sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Unicamente constan las metricas internas del autor:

| Metrica | Valor | Contexto |
|---|---|---|
| Loss de validacion | 0,201 | 216 ejemplos de validacion de SimpleQA |
| Precision | 100 % | Sobre 50 preguntas de validacion |
| Velocidad de generacion | 67 tokens/s | Hardware M1 Pro, via MLX |
| Memoria pico | 2,41 GB | Hardware M1 Pro, via MLX |

Estas cifras no son comparables con benchmarks publicos de terceros y la precision sobre 50 preguntas tiene un margen de error elevado, por lo que no permiten situar el modelo frente a alternativas.

## Requisitos de hardware

- Peso en disco y en memoria: 2,3 GB de repositorio; 2,41 GB de pico medidos en inferencia con MLX, coherente con pesos a 4 bits de 4,02 B de parametros.
- Hardware objetivo: Apple Silicon. El autor reporta 67 tokens/s en un M1 Pro.
- GPU recomendadas: chips Apple M1 Pro o superiores (M2, M3, M4 y variantes Max/Ultra) con al menos 8 GB de memoria unificada; 16 GB o mas recomendable para trabajar con contexto largo.
- Compatibilidad con GPU de consumo NVIDIA: el repositorio solo contiene pesos en formato MLX, por lo que no se ejecuta directamente en CUDA. Seria necesario convertir los pesos a GGUF o safetensors estandar, operacion no documentada por el autor.
- VRAM estimada en caso de conversion: del orden de 3 GB en 4 bits y de 8-9 GB en FP16 para una ventana de contexto moderada; son estimaciones, no datos publicados.
- Opciones de despliegue: `mlx_lm` (libreria oficial del modelo), y servidores compatibles con MLX como `mlx_lm.server`. No se proporcionan pesos para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 67 tokens/s en M1 Pro segun el autor; no hay datos para otros chips ni para lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Rendimiento |
|---|---|---|---|---|---|
| Sovpallo-4B-v1 | 4,02 B | No confirmado (32.768 en el base) | No disponible | MLX 4-bit, solo Apple Silicon | No hay benchmarks publicos; 100 % en 50 preguntas de SimpleQA |
| Qwen3-4B (Alibaba) | 4,02 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Safetensors, GGUF, MLX, vLLM, etc. | Benchmarks publicos en la model card de Qwen3 |
| Llama-3.2-3B (Meta) | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Safetensors, GGUF, vLLM, etc. | Benchmarks publicos de Meta |
| Gemma-3-4B (Google) | ~4 B | 128.000 tokens | Gemma Terms of Use | Safetensors, GGUF, vLLM, etc. | Benchmarks publicos de Google |

No se dispone de datos que permitan comparar el rendimiento efectivo de Sovpallo-4B-v1 con estas alternativas en tareas comunes. La comparacion se limita a parametros, contexto, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que genera incertidumbre legal sobre su uso comercial. El modelo base Qwen3-4B se distribuye bajo Apache 2.0, pero eso no implica automaticamente que los pesos derivados hereden los mismos terminos en la practica.
- Validacion estadisticamente debil: la cifra de "100 % de precision" procede de solo 50 preguntas y no debe extrapolarse a un rendimiento general.
- Riesgo de sobreajuste a SimpleQA: al entrenar exclusivamente sobre un dataset de preguntas factuales cortas, el modelo puede degradar su comportamiento conversacional general y mostrar un sesgo hacia respuestas de una sola entidad.
- Riesgo de alucinacion: el autor no documenta tecnicas de mitigacion (RLHF, DPO, verificacion factual). En dominios fuera de los datos de entrenamiento puede generar afirmaciones incorrectas con seguridad.
- Idiomas limitados: solo ingles y ruso. El castellano no esta declarado como soportado, por lo que su calidad en espanol sera impredecible.
- Dependencia de hardware: los pesos estan en formato MLX, por lo que el modelo no es directamente utilizable en GPUs NVIDIA, en servidores con vLLM ni en despliegues con Ollama sin una conversion previa.
- Perdida de calidad por cuantizacion: el ajuste se realiza sobre una base ya cuantizada a 4 bits, lo que anade un error de cuantizacion previo al propio entrenamiento QLoRA.
- Sin informacion sobre alineacion de seguridad: no se documentan filtros de contenido, evaluaciones de toxicidad ni sesgos medidos.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en el momento de la consulta, sin historial de issues ni de actualizaciones posteriores.
- Longitud de contexto no confirmada: la model card no especifica la ventana efectiva tras el fine-tune, y el entrenamiento con QLoRA puede haberla reducido respecto al base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taksovpallo/Sovpallo-4B-v1
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Familia Qwen3 (Alibaba): https://huggingface.co/Qwen/Qwen3-4B
- Libreria MLX y `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Dataset SimpleQA (OpenAI), referenciado en la model card: https://arxiv.org/abs/2411.04368
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devolvieron unicamente paginas genericas de motores de busqueda y mapas.
