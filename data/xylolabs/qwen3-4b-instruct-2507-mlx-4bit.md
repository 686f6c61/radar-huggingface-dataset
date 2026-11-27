# Xylolabs/Qwen3-4B-Instruct-2507-MLX-4bit

## Resumen

Xylolabs/Qwen3-4B-Instruct-2507-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por Xylolabs. Su proposito es permitir la ejecucion del modelo base de Qwen en hardware Apple Silicon mediante la libreria `mlx-lm`, reduciendo el peso en disco y en memoria de aproximadamente 8 GB en BF16 a unos 2,32 GB sin renunciar por completo a la fidelidad de las salidas.

El modelo conserva la arquitectura y el comportamiento del Qwen3-4B-Instruct-2507 original (transformer denso de 4.022.468.096 parametros) y solo modifica la representacion numerica de los pesos. La cuantizacion es de tipo afina con tamano de grupo 64, escalas y sesgos en bfloat16, y se ha ajustado con la tecnica DWQ (dynamic weight quantization o equivalente segun el autor). La mayoria de las capas lineales y el embedding de tokens estan a 4 bits, mientras que `mlp.down_proj` y `self_attn.v_proj` en las capas 0-3 y 31-35 se mantienen a 6 bits para preservar calidad.

Es relevante ahora porque permite desplegar un modelo instructivo de 4B parametros en portatiles y equipos de sobremesa con chip Apple (serie M) sin GPU dedicada, algo util para prototipado local, experimentacion y flujos de trabajo sin conexion. La licencia Apache 2.0 facilita su uso comercial, aunque la ficha no documenta idiomas soportados ni evaluaciones de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afina (group size 64), con capas selectivas a 6 bits; escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, `mlx-lm`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B-Instruct-2507, un transformer denso de 4.022.468.096 parametros. Esta publicacion no entrena el modelo desde cero: aplica cuantizacion post-entrenamiento sobre los pesos del modelo base. La cuantizacion es afina con tamano de grupo 64, con escalas y sesgos almacenados en bfloat16, y se ha ajustado mediante DWQ segun indica el autor. Todas las capas lineales y el embedding de tokens (incluida la LM head) estan a 4 bits, salvo `mlp.down_proj` y `self_attn.v_proj` en las capas 0-3 y 31-35, que se mantienen a 6 bits. Las capas de normalizacion permanecen en bfloat16.

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF o DPO) ni innovaciones de decodificacion. La model card se limita a describir el proceso de cuantizacion y las metricas de fidelidad frente a BF16.

## Capacidades

- Generacion de texto conversacional y de tipo instructivo, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a preguntas generales (la model card incluye una comprobacion de 7 preguntas con 6/7 aciertos en la version 4 bits y 7/7 en 8 bits y BF16).
- Generacion de codigo y matematicas: capacidad presumible del modelo base, aunque no se documentan evaluaciones especificas en esta publicacion.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para esta cuantizacion.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Prototipado local en Mac: ejecutar el modelo con `mlx-lm` en un portatil con chip Apple Silicon para probar prompts y flujos conversacionales sin depender de servicios en la nube, gracias a sus 2,32 GB de pesos.
- Asistentes de escritorio sin conexion: integrar el modelo en aplicaciones nativas de macOS que requieran generacion de texto local y privacidad de datos, aprovechando el backend MLX.
- Generacion de texto en notebooks de investigacion: usar el modelo como linea base cuantizada para experimentos de evaluacion o comparativas de fidelidad frente a BF16.
- Chatbots de soporte en entornos controlados: desplegar un asistente conversacional de 4B parametros en equipos con memoria unificada limitada, aceptando la perdida de calidad de la cuantizacion de 4 bits (KL de 0,11 en WikiText-2).
- Filtrado y clasificacion de texto: emplear el modelo para tareas de resumen, extraccion o etiquetado en pipelines locales donde el throughput no es critico.
- Educacion y demos: mostrar el funcionamiento de un LLM instructivo en talleres o clases usando hardware de consumo Apple, con un tamano de descarga manejable de 2,3 GB.
- Evaluacion de tecnicas de cuantizacion: servir como referencia practica para comparar MLX 4 bits, MLX 8 bits y BF16 en terminos de KL y top-1 sobre WikiText-2, chat y texto reservado.

## Benchmarks y rendimiento

La model card proporciona metricas de fidelidad frente a BF16 (divergencia KL y acuerdo top-1) sobre WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens, ademas de una comprobacion de 7 preguntas.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Texto reservado KL | top-1 | 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 2,32 GB | 0,112426 | 85,43% | 0,103188 | 86,73% | 0,074735 | 87,69% | 6/7 |
| MLX 8-bit | 4,27 GB | 0,000614 | 98,63% | 0,000708 | 98,69% | 0,000567 | 98,96% | 7/7 |
| BF16 | 8,04 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 7/7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 2,32 GB solo para los pesos en 4 bits; hay que sumar la memoria del contexto y del runtime de MLX.
- Hardware objetivo: equipos Apple Silicon (serie M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; la libreria `mlx-lm` no esta pensada para GPU NVIDIA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato; el modelo esta empaquetado para MLX, no para CUDA.
- Cabe en GPU de consumo Apple: si, en cualquier Mac con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB o mas para contextos largos.
- Opciones de despliegue: `mlx-lm` version 0.32.2 (indicada por el autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Instruct-2507-MLX-4bit | 4,02B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (BF16) | 4,02B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face |
| Xylolabs MLX 8-bit (referencia en la model card) | 4,02B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Hugging Face (segun model card) |

La comparativa se limita a las variantes del mismo modelo base documentadas por el autor. No se dispone de datos de rendimiento frente a otros modelos de 4B parametros en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 4 bits introduce perdida de fidelidad medible: KL de 0,112 en WikiText-2 y acuerdo top-1 del 85,43%, frente al 98,63% de la version 8 bits.
- La comprobacion de 7 preguntas arroja 6/7 aciertos en 4 bits, frente a 7/7 en 8 bits y BF16, lo que sugiere errores ocasionales adicionales.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base en esta publicacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la cuantizacion puede incrementarlo en tareas sensibles.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingue concreto.
- Longitud de contexto no disponible en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio.
- Limitacion de plataforma: el formato MLX solo es utilizable en ecosistema Apple; no es portable a CUDA ni a CPU generica sin reconversion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
