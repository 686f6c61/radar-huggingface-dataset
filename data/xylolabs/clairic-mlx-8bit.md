# Xylolabs/clairic-MLX-8bit

## Resumen

Clairic MLX 8-bit es una cuantizacion en formato MLX de 8 bits del modelo Cloudflare/clairic, un modelo de 27B parametros construido sobre Qwen3.8-27B. La publica Xylolabs y esta pensada para ejecucion en hardware Apple Silicon mediante la libreria mlx-lm. El modelo base original es multimodal (texto e imagen) y esta especializado en extraccion estructurada: convierte un estado (texto o JSON) y un esquema de campos tipados en respuestas estructuradas con valores tipados, confianza de extraccion y probabilidades de nulo.

La relevancia de esta version radica en que reduce el peso del modelo a 28,58 GB manteniendo una fidelidad muy alta respecto al modelo BF16 de referencia: una divergencia KL media de 0,001003 en WikiText-2 con un 98,23% de acuerdo top-1, y un 5/5 en el conjunto de respuestas de prueba (igual que el BF16). Esto permite ejecutar un modelo de 27B en equipos con memoria unificada de gama alta sin renunciar practicamente a calidad.

Esta build concreta es solo texto: no incluye las proyecciones de vision del modelo original, por lo que las capacidades multimodales de Cloudflare/clairic no estan disponibles en esta cuantizacion. La cuantizacion es afin en grupos de 64 con 8 bits en las proyecciones de atencion y MLP, en el token embedding y en la cabeza del modelo de lenguaje, dejando sin cuantizar los tensores de estado y normalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), tag qwen3_5 |
| Parametros totales | 26.895.993.856 (aproximadamente 27B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit afin en grupos de 64; tensores de estado y normalizacion sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 28,58 GB |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clairic es un transformer de 27B parametros derivado de Qwen3.8-27B. Su entrenamiento esta orientado a una tarea concreta: dado un estado de entrada (texto libre o JSON), imagenes opcionales y un esquema de campos tipados con instrucciones, producir valores tipados (texto, numeros con decimales, fechas, listas, nulos), estimaciones con cuantiles y trayectorias de pronostico. La salida incluye ademas informacion de scoring: confianza de extraccion, probabilidades de nulo, truncamiento de entrada y uso de tokens. El runtime original usa PyTorch y Transformers, con xgrammar para imponer restricciones de esquema mediante un logits processor.

Esta version de Xylolabs aplica cuantizacion post-entrenamiento (no se menciona fine-tuning adicional) con pesos MLX afines en grupos de 64 a 8 bits en las proyecciones de atencion y MLP, el token embedding y la cabeza del modelo de lenguaje, manteniendo en precision original los tensores de estado y normalizacion. La model card reporta la revision fuente y los cambios de pesos en el fichero NOTICE. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, uso con `mlx_lm.chat`).
- Extraccion estructurada: conversion de texto o JSON a campos tipados segun un esquema declarado.
- Estimacion numerica con cuantiles declarados por el usuario.
- Pronostico (forecasting) con horizonte e intervalo especificados.
- Scoring: confianza de extraccion, probabilidades de nulo, reporte de truncamiento y uso de tokens.
- Restriccion por esquema mediante xgrammar en el runtime original (Transformers logits processor).
- Procesamiento de imagenes: disponible en el modelo base Cloudflare/clairic, pero no en esta build MLX, que es solo texto.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Extraccion de datos de facturas: se pasa el texto de una factura como estado y un esquema con campos como proveedor, fecha, importe y lista de conceptos; el modelo devuelve valores tipados con confianza por campo, lo que permite enrutar a revision humana los campos de baja confianza.
- Procesamiento de formularios y documentos en pipelines ETL: integrado en un flujo Python que llama al modelo por cada documento y valida la salida contra el esquema, aprovechando las restricciones de xgrammar para garantizar tipos correctos.
- Normalizacion de registros JSON heterogeneos: dado un estado JSON con campos de distinto formato, el modelo mapea a un esquema canonico con tipos declarados, util para consolidar fuentes de datos dispares.
- Estimacion de magnitudes con incertidumbre: para campos numericos donde se declara un rango, el modelo devuelve estimaciones con cuantiles, adecuado en analisis financiero o de inventario donde se necesita una distribucion y no un valor puntual.
- Pronostico de series cortas: con un historico de valores diarios como estado y un campo de pronostico con horizonte e intervalo, el modelo genera trayectorias de pronostico, util para planificacion de demanda a corto plazo.
- Ejecucion local en Apple Silicon para datos sensibles: al correr sobre mlx-lm en equipos con memoria unificada, permite procesar documentos confidenciales sin enviar datos a servicios externos, manteniendo el 98% de acuerdo top-1 respecto al BF16.
- Asistente conversacional con contexto documental: mediante `mlx_lm.chat`, se puede mantener una conversacion multi-turno para resumir o consultar documentos ya cargados en el estado (por ejemplo, resumen de facturas), aunque la longitud de contexto no esta documentada.

## Benchmarks y rendimiento

Datos de fidelidad de la cuantizacion respecto al modelo BF16 de texto, a 512 tokens de contexto (divergencia KL media y acuerdo top-1):

| Metrica | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 | Respuestas |
|---|---:|---:|---:|---:|---:|---:|---:|
| Xylolabs MLX 8-bit (28,58 GB) | 0,001003 | 98,230% | 0,009460 | 97,858% | 0,001054 | 98,451% | 5/5 (BF16 5/5) |
| Otros 0 (16,38 GB) | 0,042503 | 90,059% | 0,141384 | 87,500% | 0,072146 | 89,667% | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para esta cuantizacion.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 28,6 GB y los pesos cuantizados 28,58 GB; se necesita memoria unificada disponible en torno a esa cifra mas overhead de ejecucion (aproximadamente 30-32 GB en la practica).
- Hardware objetivo: Apple Silicon con memoria unificada de 32 GB o superior (M-series Pro/Max/Ultra). No esta pensado para GPU NVIDIA: el formato MLX solo se ejecuta en el framework MLX de Apple.
- GPU consumer: no aplica en el sentido habitual; en equipos Apple con 32 GB o mas puede ejecutarse, aunque con margen ajustado. Se recomienda 48-64 GB para trabajar con comodidad.
- Despliegue: mlx-lm 0.32.2 (`mlx_lm.generate`, `mlx_lm.chat`). No compatible con vLLM, llama.cpp, Ollama ni TGI, que no cargan pesos MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/clairic-MLX-8bit | 27B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Solo texto; fidelidad 98,23% top-1 vs BF16 |
| Cloudflare/clairic | 27B | no disponible | PyTorch/Transformers | Apache 2.0 | Modelo base multimodal (texto e imagen), extraccion estructurada |
| Cloudflare/clairic-flash | no disponible | no disponible | no disponible | no disponible | Variante de la familia Clairic citada en la model card |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Clairic |

## Limitaciones y advertencias

- Esta build es solo texto: no incluye capacidades de vision del modelo base Cloudflare/clairic, por lo que no puede procesar imagenes.
- La cuantizacion introduce una degradacion pequena pero no nula: 98,23% de acuerdo top-1 en WikiText-2 y 97,86% en Chat respecto al BF16; en tareas sensibles a la precision conviene validar contra el modelo BF16.
- Solo se ejecuta con MLX en Apple Silicon; no es portable a CUDA ni a otras pilas de inferencia.
- La longitud de contexto no esta documentada en la informacion disponible; los datos de fidelidad se midieron a 512 tokens, asi que el comportamiento a contextos largos no esta verificado.
- Idiomas soportados no documentados; el modelo base esta orientado a extraccion estructurada, no a generacion abierta generalista.
- Riesgo de alucinacion en la extraccion: el modelo devuelve confianza y probabilidades de nulo, que deben usarse para filtrar y no como garantia de correccion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el fichero NOTICE con la revision fuente y los cambios de pesos; conviene revisar tambien la licencia del modelo base Cloudflare/clairic.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad, tratar como release reciente.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/Xylolabs/clairic-MLX-8bit
- Modelo base: https://huggingface.co/Cloudflare/clairic
- Modelo base, revision citada: https://huggingface.co/Cloudflare/clairic/blob/2c161be5cc71bacd6605b99a8c07547e58cfa434/README.md
- Variante Clairic Flash: https://huggingface.co/Cloudflare/clairic-flash
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de codigo de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia: https://huggingface.co/Xylolabs/clairic-MLX-8bit/blob/main/LICENSE
