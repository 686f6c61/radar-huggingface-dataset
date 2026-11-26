# Xylolabs/Qwen3.8-27B-MLX-8bit

## Resumen

Qwen3.8-27B-MLX-8bit es una conversion al formato MLX del modelo Qwen/Qwen3.8-27B, publicada por Xylolabs. Se trata de una cuantizacion afina de 8 bits (group size 64, escalas y sesgos en float16) pensada para ejecutar el modelo en hardware Apple Silicon mediante la libreria `mlx-lm`. La conversion es exclusivamente de texto: se han eliminado la torre de vision y la capa MTP (multi-token prediction) del modelo original.

El modelo base es un transformer de aproximadamente 26.900 millones de parametros (26.895.993.856 segun los safetensors), con una ventana de contexto que en esta version alcanza hasta 256K tokens en configuraciones de memoria suficiente. La relevancia de esta publicacion radica en que permite desplegar un modelo de ~27B en equipos de sobremesa de Apple con memoria unificada, manteniendo una fidelidad numerica muy alta respecto al BF16 original (KL de 0,000384 en WikiText-2 y 99,19% de top-1).

La licencia es Apache 2.0, lo que facilita el uso comercial. El repositorio tiene un tamano de 28,6 GB y, en el momento de la consulta, no registra descargas ni likes, lo que indica que es una publicacion muy reciente (creada el 26 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); conversion MLX sin torre de vision ni capa MTP |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens (segun memoria disponible; 147K en 36 GB con la variante 4-bit, 80K en 48 GB con 8-bit) |
| Tipos de cuantizacion | 8-bit affine, group size 64; escalas y sesgos en float16. Existe variante 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B, un transformer denso de aproximadamente 27.000 millones de parametros. La conversion realizada por Xylolabs aplica cuantizacion afina de 8 bits a todas las capas lineales, al embedding de tokens y a la LM head, con group size 64 y escalas y sesgos almacenados en float16. Las capas de normalizacion y el resto de tensores no cuantizados se mantienen en float16, salvo `A_log`, que queda en bfloat16. Se han omitido deliberadamente la torre de vision y la capa MTP del modelo original, por lo que esta version es solo de texto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base, ya que la model card de esta conversion no los detalla. La innovacion tecnica destacable de esta publicacion es la propia conversion MLX con cuantizacion de alta fidelidad: los datos de la model card muestran una divergencia KL muy baja frente a BF16 (0,000384 en WikiText-2, 0,001776 en el conjunto de chat y 0,000244 en held-out) y una concordancia top-1 superior al 99% en los tres conjuntos.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y otros idiomas (los idiomas concretos no estan documentados en esta ficha).
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'` para obtener respuestas directas.
- Razonamiento y respuesta a preguntas: la model card reporta 7/7 aciertos en una prueba de siete preguntas, igual que el modelo BF16.
- Capacidades de codigo y matematicas: no documentadas explicitamente en la informacion disponible, aunque son esperables en la familia Qwen3.8.
- Soporte de tool calling / function calling: no documentado en esta conversion.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta conversion.
- Capacidades de vision: no disponibles (la torre de vision fue eliminada en la conversion).
- Capacidades de audio: no disponibles.
- Ejecucion local en Apple Silicon mediante `mlx-lm`.

## Casos de uso

- Asistente conversacional local en Mac: con 28,6 GB de pesos y hasta 256K tokens de contexto en equipos de 64 GB o mas, se puede mantener una conversacion larga con historial extenso sin salir del equipo, usando `mlx_lm.chat`.
- Procesamiento de documentos largos: la ventana de hasta 256K tokens permite resumir o extraer informacion de contratos, informes o libros completos en una sola pasada, siempre que la memoria unificada lo permita.
- Generacion de texto en lote para pipelines editoriales: `mlx_lm.generate` permite ejecutar el modelo de forma programatica para redactar borradores, descripciones de producto o resumenes a partir de plantillas.
- Prototipado de aplicaciones de IA sin GPU dedicada: desarrolladores con un Mac Studio pueden validar prompts, plantillas de chat y flujos de razonamiento antes de desplegar en infraestructura con CUDA.
- Analisis y respuesta sobre codigo o documentacion tecnica: el modelo puede responder preguntas sobre fragmentos de codigo o manuales largos aprovechando el contexto extendido, aunque las capacidades especificas de codigo no estan documentadas en esta ficha.
- Evaluacion comparativa de cuantizaciones: al existir variantes 4-bit y 8-bit del mismo autor, sirve para medir el impacto de la cuantizacion en calidad (KL y top-1) sobre tareas reales antes de elegir el tamano definitivo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en Apple Silicon, los datos no salen del equipo, lo que encaja en flujos con informacion sensible.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Si aporta metricas de fidelidad de la cuantizacion frente a BF16:

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---:|---:|
| Tamano | 28,58 GB | 15,13 GB |
| WikiText-2 KL | 0,000384 | 0,045196 |
| WikiText-2 top-1 | 99,19% | 90,06% |
| Chat KL | 0,001776 | 0,060599 |
| Chat top-1 | 99,29% | 91,73% |
| Held-out KL | 0,000244 | 0,045803 |
| Held-out top-1 | 99,08% | 88,90% |
| Prueba de 7 preguntas | 7/7 (BF16: 7/7) | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 28,6 GB para los pesos en 8-bit; la variante 4-bit ocupa 15,1 GB.
- Hardware recomendado segun la model card: Mac Studio M5 Max (40 nucleos de GPU) con 48, 64 o 128 GB de memoria unificada; Mac Studio M5 Ultra con 96, 256 o 512 GB.
- Contexto segun memoria: 80K tokens con 48 GB (8-bit), 147K con 36 GB usando la variante 4-bit, y 256K con 64 GB o mas en 8-bit.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato MLX esta pensado para Apple Silicon; no se documenta soporte en GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` version 0.32.2 o superior, mediante `mlx_lm.generate` y `mlx_lm.chat`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3.8-27B-MLX-8bit | ~26,9B | hasta 256K | MLX safetensors, 8-bit | Apache 2.0 | Solo texto; sin vision ni MTP |
| Xylolabs/Qwen3.8-27B-MLX-4bit | ~26,9B (mismo base) | 147K en 36 GB | MLX safetensors, 4-bit | Apache 2.0 | Menor huella (15,1 GB), mayor perdida de fidelidad (top-1 ~90%) |
| Qwen/Qwen3.8-27B (BF16 original) | ~26,9B | no disponible | safetensors BF16 | Apache 2.0 | Incluye torre de vision y capa MTP; mayor requisito de memoria |

No se dispone de datos de rendimiento en tareas que permitan comparar con otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- Modelo solo de texto: la torre de vision y la capa MTP han sido eliminadas en la conversion, por lo que no admite entradas de imagen ni prediccion multi-token.
- Dependencia de Apple Silicon: el formato MLX no es portable a GPU NVIDIA, AMD o TPU sin reconversion.
- Idiomas soportados no documentados: la model card no especifica la cobertura linguistica de esta conversion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en esta ficha.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Perdida de calidad por cuantizacion: aunque el 8-bit es muy fiel (top-1 > 99%), no es identico al BF16; la variante 4-bit pierde mas de 8 puntos de top-1 en algunos conjuntos.
- Contexto efectivo dependiente de la memoria: aunque el modelo soporte hasta 256K tokens, en equipos de 48 GB el contexto practico baja a 80K, y con 4-bit en 36 GB a 147K.
- Sin datos de benchmarks de tareas: no hay MMLU, HumanEval ni GSM8K publicados, lo que dificulta comparar su calidad real frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo `NOTICE` por las condiciones de la conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 4-bit: https://huggingface.co/Xylolabs/Qwen3.8-27B-MLX-4bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
