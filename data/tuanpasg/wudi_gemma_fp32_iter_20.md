# tuanpasg/wudi_gemma_fp32_iter_20

## Resumen

Wudi gemma fp32 iter 20 es un modelo de lenguaje derivado de google/gemma-2-2b al que se le han fusionado los pesos de tres checkpoints ajustados con fine-tuning sobre tareas distintas: instrucciones, matematicas y codigo. El resultado es un unico conjunto de pesos de 2.614.341.888 parametros (aproximadamente 2,6B) que pretende conservar de forma simultanea las capacidades de los tres modelos especializados sin necesidad de ejecutar tres modelos separados ni de aplicar adaptadores tipo LoRA en tiempo de inferencia.

El autor es el usuario tuanpasg y la tecnica empleada se denomina internamente `wudi_merge`, una variante de model merging que combina task arithmetic como metodo de respaldo con un proceso iterativo de 20 pasos y esparcimiento de parametros del tipo `ties_sparsify`. La fusion se aplico sobre las capas lineales, excluyendo explicitamente las matrices de embeddings (`embed_tokens.weight`) y la cabeza de salida (`lm_head.weight`), lo que implica que el vocabulario y la proyeccion final permanecen intactos respecto al modelo base.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: acumula 8 descargas, no tiene likes, no publica model card descriptiva, no incluye resultados de evaluacion y no declara licencia ni idiomas. Su interes es fundamentalmente metodologico, como ejemplo de fusion multi-tarea sobre un modelo pequeno de la familia Gemma 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2), pesos fusionados sobre las capas lineales mediante `wudi_merge` |
| Parametros totales | 2.614.341.888 (≈2,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens heredados del modelo base google/gemma-2-2b; no se especifica en la model card |
| Tipos de cuantizacion | No disponible; solo se publican pesos completos en safetensors. No hay GGUF, GPTQ, AWQ ni EXL2 |
| Idiomas soportados | No disponible en la model card (el base esta entrenado principalmente en ingles, con cobertura multilingue parcial) |
| Licencia | No disponible en la model card; el modelo base google/gemma-2-2b se distribuye bajo Gemma Terms of Use |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,3 GB |
| Metodo de fusion | `wudi_merge`, variante `wudi_all_linear`, 20 iteraciones, `scaling` 1.0, learning rate 1e-05, weight decay 0.0, alpha 1.0, K = 0.7, esparcimiento `ties_sparsify`, respaldo `task_arithmetic` |
| Capas excluidas de la fusion | `embed_tokens.weight`, `lm_head.weight` |
| Precisión declarada en los argumentos | bfloat16 (`dtype: bfloat16`) |
| Hardware usado para la fusion | `device_map: cpu` para la carga, `wudi_device: cuda` para el proceso iterativo |
| Tiempo de ejecucion de la fusion | 281,042 s (aproximadamente 4 minutos y 41 segundos) |
| Fecha de creacion / actualizacion | 2026-09-17 (creacion) / 2026-09-17 (ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de una fusion de pesos. La arquitectura subyacente es la de google/gemma-2-2b, un transformer decoder-only de 2,6B parametros con atencion alterna entre ventanas locales y atencion global completa, normalizacion RMSNorm y activacion GeGLU, ademas de la tecnica de soft-capping en la atencion que introdujo la familia Gemma 2. Sobre esa base, el autor ha aplicado un algoritmo de merging denominado `wudi_merge` que opera exclusivamente sobre las matrices lineales (atencion y MLP) y deja fuera la capa de embeddings y la cabeza de lenguaje.

Los tres modelos de partida son checkpoints de fine-tuning procedentes del conjunto MergeBench: `MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math` y `MergeBench/gemma-2-2b_coding`. El proceso se ejecuto en 20 iteraciones con un learning rate de 1e-05 y sin weight decay, con un factor de esparcimiento K de 0,7 y la estrategia `ties_sparsify`, que elimina los cambios de bajo impacto antes de promediar para reducir interferencias entre tareas. Como mecanismo de respaldo ante fallos de convergencia se configuro `task_arithmetic` con escalado 1.0. El resultado es un unico checkpoint en bfloat16 de aproximadamente 5,3 GB.

No se documenta el numero de tokens de entrenamiento, la composicion de los datasets, ni si hubo fases de RLHF o DPO; esa informacion corresponderia a los tres checkpoints de MergeBench, no al proceso de fusion descrito. Tampoco se publica ninguna innovacion adicional mas alla del propio algoritmo `wudi_merge`.

## Capacidades

- Generacion de texto e instrucciones: al incorporar el checkpoint `gemma-2-2b_instruction`, se espera capacidad de seguir instrucciones en formato conversacional, aunque no se declara plantilla de chat ni formato de prompt.
- Razonamiento matematico: el checkpoint `gemma-2-2b_math` aporta resolucion de problemas aritmeticos y de enunciados, presumiblemente orientado a respuesta en lenguaje natural.
- Generacion de codigo: el checkpoint `gemma-2-2b_coding` aporta la capacidad de completar y generar fragmentos de codigo en lenguajes habituales.
- Soporte de tool calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; solo se publican pesos de texto.
- Capacidades especiales: no se declara ninguna (ni decodificacion especulativa, ni atencion lineal, ni variantes MoE).

## Casos de uso

- Asistente de proposito general autoalojado: el modelo ocupa aproximadamente 5,3 GB en bfloat16, por lo que puede ejecutarse en una unica GPU de consumo y servir como asistente interno sin coste de API. Su combinacion de instrucciones, matematicas y codigo cubre las tres tareas mas frecuentes en este escenario.
- Generacion de codigo en entornos sin conectividad: al integrar el checkpoint de codigo, puede desplegarse en estaciones de trabajo aisladas para autocompletado o generacion de funciones, con la ventaja de no enviar codigo propietario a servicios externos.
- Apoyo a tareas de matemáticas educativas: el checkpoint de matematicas permite resolver ejercicios paso a paso. Para un uso real seria necesario validar la tasa de error, ya que no hay benchmarks publicados.
- Prototipado de pipelines de generacion aumentada (RAG) en pequeno: con 8.192 tokens de contexto se pueden inyectar unos pocos documentos o fragmentos de codigo como contexto, suficiente para demos y pruebas de concepto sobre documentacion tecnica.
- Base para experimentos de model merging: el repositorio documenta de forma detallada los argumentos del algoritmo (learning rate, iteraciones, K, esparcimiento, capas excluidas), por lo que resulta util como punto de partida reproducible para investigar interferencia entre tareas en modelos de 2-3B.
- Evaluacion comparativa de tecnicas de fusion: al no publicarse resultados, el modelo puede emplearse como objeto de estudio frente a otros metodos (SLERP, TIES, DARE, task arithmetic puro) midiendo la degradacion o mejora en tareas de instrucciones, matematicas y codigo.
- Fine-tuning posterior de bajo coste: sus 2,6B parametros permiten aplicar LoRA o QLoRA sobre una unica GPU de 24 GB para especializarlo en un dominio concreto partiendo de un modelo que ya cubre tres tareas.
- Servicio por lotes en CPU: dado que puede cuantizarse a int8 o int4 (previa conversion, ya que no hay GGUF publicado), es viable procesar lotes de texto en servidores sin GPU con latencias altas pero tolerables para tareas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval ni similares), ni comparaciones con los tres checkpoints de origen o con el modelo base google/gemma-2-2b. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en bfloat16 o float16: aproximadamente 5,3-6 GB solo para los pesos, mas el cache KV. Con 8.192 tokens de contexto y un batch pequeno, el consumo total se situa en torno a 7-9 GB.
- VRAM estimada en float32: aproximadamente 10,5 GB solo para los pesos. El repositorio publica 5,3 GB, coherente con bfloat16 a pesar del nombre `fp32` del identificador.
- VRAM estimada cuantizado a int8 (previa conversion): aproximadamente 2,8-3 GB de pesos.
- VRAM estimada cuantizado a int4 (previa conversion): aproximadamente 1,5-2 GB de pesos.
- GPU recomendadas: cabe sin problemas en una RTX 4090 (24 GB), RTX 4080, RTX 3090 o RTX 4070 Ti en bfloat16. Tambien en GPUs de 8 GB si se cuantiza. Para servicio con concurrencia alta son preferibles A100 40/80 GB o H100, aunque el modelo es pequeno y no las aprovecha.
- Compatibilidad con GPU de consumo: si, en cualquier GPU con al menos 8-10 GB de VRAM para bfloat16, y en GPUs de 4-6 GB tras cuantizacion.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM y TGI para servicio con batching continuo, llama.cpp y Ollama solo tras convertir manualmente los pesos a GGUF, dado que el repositorio no publica ninguna cuantizacion. Tambien es posible servir en CPU con llama.cpp u ONNX Runtime.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Como referencia de orden de magnitud para un modelo de 2,6B en bfloat16 sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero no hay dato confirmado para este checkpoint.
- Almacenamiento: 5,3 GB en disco para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| tuanpasg/wudi_gemma_fp32_iter_20 | 2,6B | 8.192 tokens (heredado del base) | No disponible (base bajo Gemma Terms of Use) | Safetensors, 8 descargas | No disponible |
| google/gemma-2-2b | 2,6B | 8.192 tokens | Gemma Terms of Use | Safetensors, ampliamente usado | Publicado por Google en su model card |
| Qwen/Qwen2.5-3B | 3,1B | 32.768 tokens nativos (hasta 131.072 con YaRN) | Apache 2.0 | Safetensors, GGUF, AWQ y GPTQ | Publicado por el autor |
| meta-llama/Llama-3.2-3B | 3,2B | 131.072 tokens | Llama 3.2 Community License | Safetensors, GGUF en la comunidad | Publicado por el autor |

Frente a estas alternativas, la ventaja del modelo analizado es que integra tres dominios en un unico checkpoint de 2,6B; su desventaja principal es la ausencia total de evaluacion publicada, de licencia declarada y de cuantizaciones listas para usar, lo que dificulta la comparacion objetiva.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay ningun benchmark publicado. No se puede afirmar que la fusion haya mejorado o degradado las capacidades de instrucciones, matematicas y codigo respecto a los checkpoints originales.
- Riesgo de interferencia entre tareas: la fusion de pesos puede producir degradacion en tareas individuales (fenomeno conocido como task interference), especialmente con tres dominios tan dispares como matematicas, codigo e instrucciones generales.
- Licencia indeterminada: la model card no declara licencia. Al derivar de google/gemma-2-2b, es previsible que se apliquen los Gemma Terms of Use, que incluyen obligaciones de atribucion y restricciones de uso. Cualquier uso comercial exige verificar esta cuestion con el autor antes de desplegar.
- Riesgo de alucinacion: inherente a un modelo de 2,6B de parametros, especialmente en matematicas y generacion de codigo, donde una respuesta incorrecta puede parecer plausible.
- Limitacion de contexto: 8.192 tokens es un contexto reducido frente a los 128K de Llama 3.2 o los 32K de Qwen2.5, lo que limita casos de uso con documentos largos o conversaciones extensas.
- Idiomas no declarados: no hay confirmacion de soporte para castellano ni de la calidad en otros idiomas distintos del ingles.
- Sin plantilla de chat documentada: se desconoce el formato de prompt recomendado para el modo instrucciones, lo que puede degradar las respuestas si se usa la plantilla incorrecta.
- Sin cuantizaciones oficiales: no existen ficheros GGUF, AWQ, GPTQ o EXL2, por lo que el despliegue en entornos ligeros requiere conversion manual y validacion posterior.
- Trazabilidad limitada: el identificador incluye `fp32` pero los argumentos de fusion indican `bfloat16`; conviene verificar el tipo real de los tensores antes de asumir una precision concreta.
- Madurez y soporte: 8 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No hay repositorio de issues, paper ni documentacion adicional.
- Fechas de publicacion: la model card indica creacion y actualizacion el 2026-09-17, una fecha que conviene contrastar con la del repositorio antes de citarla.
- La busqueda web no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a portales de juegos sin relacion con el contenido tecnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuanpasg/wudi_gemma_fp32_iter_20
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Checkpoint de instrucciones usado en la fusion: MergeBench/gemma-2-2b_instruction (identificador citado en la model card; no se ha podido verificar la URL)
- Checkpoint de matematicas usado en la fusion: MergeBench/gemma-2-2b_math (identificador citado en la model card; no se ha podido verificar la URL)
- Checkpoint de codigo usado en la fusion: MergeBench/gemma-2-2b_coding (identificador citado en la model card; no se ha podido verificar la URL)
- Paper, blog o repositorio del algoritmo `wudi_merge`: no disponible
- Demo o espacio de inferencia: no disponible
