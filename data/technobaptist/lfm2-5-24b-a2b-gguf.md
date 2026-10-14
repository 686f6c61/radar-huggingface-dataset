# TechnoBaptist/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de razonamiento de tipo mezcla de expertos (MoE) con 24.000 millones de parametros totales y solo 2,45 millones de parametros activos por token (segun la model card, 2,45B). Lo desarrolla Liquid AI como cierre de la familia LFM2.5, que abarca desde LFM2.5-230M hasta esta variante, y esta disenado explicitamente para agentes que razonan, invocan herramientas y se ejecutan en local, con enfasis en eficiencia por token generado.

La ficha que nos ocupa no es el checkpoint oficial, sino una cuantizacion GGUF publicada por el usuario TechnoBaptist bajo el identificador TechnoBaptist/LFM2.5-24B-A2B-GGUF, derivada del modelo base LiquidAI/LFM2.5-24B-A2B. El repositorio pesa 171,1 GB, lo que sugiere que agrupa varios niveles de cuantizacion en un mismo espacio, y utiliza el esquema Unsloth Dynamic 3.0. El modelo subyacente declara 36 billones de tokens de entrenamiento, vocabulario de 128.000 tokens y una ventana de contexto de 131.072 tokens.

Su relevancia actual esta en la relacion entre capacidad agentica y coste de inferencia: con 2,45B de parametros activos y decodificacion especulativa prevista (modelo borrador DSpark), aspira a competir con MoE de mayor tamano en tareas de uso de herramientas, y a hacerlo en hardware de consumo o en un solo acelerador de gama alta. La model card oficial reporta 184 tok/s en un Apple M5 Max y hasta 21.000 tokens de salida por segundo en una unica NVIDIA B300.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 40 capas (30 bloques de convolucion corta con doble puerta + 10 capas de atencion GQA), 64 expertos por bloque MoE con enrutado top-4 |
| Parametros totales | 23.971.587.712 (23,97B; la model card indica 24,0B) |
| Parametros activos | 2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 3.0 (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, thai, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (campo `license: other` en el repositorio) |
| Formato de pesos | GGUF en este repositorio; el modelo base ofrece tambien formato nativo (safetensors), FP8, ONNX y MLX-4bit |
| Parametros de generacion recomendados | temperature 0,1; top_k 50; repetition_penalty 1,05 |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento | 36 billones de tokens |
| Tipo de modelo | Texto a texto, orientado a razonamiento y cargas agenticas |
| Repositorio | TechnoBaptist/LFM2.5-24B-A2B-GGUF (171,1 GB) |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

LFM2.5-24B-A2B no es un transformer denso clasico. Combina 30 bloques de convolucion corta con doble puerta (double-gated short convolution blocks) y 10 capas de atencion con consultas agrupadas (GQA), lo que da un total de 40 capas. Sobre esa columna vertebral se insertan bloques MoE con 64 expertos y enrutado top-4, de modo que cada token activa unicamente 2,45B de parametros de los 24B totales. El vocabulario es de 128.000 entradas y el modelo se entreno con un presupuesto de 36 billones de tokens.

La model card indica que el modelo "siempre piensa antes de responder": incorpora un modo de razonamiento explicito, de forma que cada token de razonamiento resulta barato gracias al reducido numero de parametros activos. Se ha post-entrenado para cargas agenticas, aunque la informacion disponible no detalla si se emplearon RLHF, DPO u otras tecnicas de alineamiento, ni la composicion exacta del dataset. Entre las innovaciones previstas figura un modelo borrador especifico, DSpark, para decodificacion especulativa con SGLang, marcado como "coming soon" en la model card.

Conviene subrayar que el repositorio aqui descrito es una conversion a GGUF del checkpoint oficial, no un entrenamiento nuevo. El autor del repositorio es TechnoBaptist; el desarrollo del modelo corresponde a Liquid AI. La model card del repositorio GGUF esta mayormente copiada de la original y aparece truncada en su ultima frase ("We recommend using it for agents that need to reason, call tools, and run reliably on your device. It is not ..."), por lo que se desconoce el final de esa recomendacion.

## Capacidades

- Generacion de texto y razonamiento explicito con modo "thinking" previo a la respuesta.
- Uso de herramientas y function calling, con foco declarado en cargas agenticas.
- Ejecucion de agentes multi-paso, entrenado para razonar, llamar a herramientas y operar de forma fiable en dispositivo.
- Capacidades multilingues en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, thai, indonesio, hindi, ruso y polaco.
- Modelo exclusivamente de texto: no se declaran capacidades de vision, audio ni multimodalidad.
- Compatibilidad con decodificacion especulativa mediante el modelo borrador DSpark (anunciado, no disponible en la informacion proporcionada).
- Soporte de despliegue en multiples runtimes segun los formatos publicados para el modelo base: Transformers, vLLM, SGLang, llama.cpp, ONNX Runtime y MLX.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas directamente en un portatil o estacion de trabajo, ya que solo activa 2,45B de parametros por token y existe una version GGUF pensada para llama.cpp. Es adecuado cuando los datos no pueden salir del dispositivo.
- Atencion al cliente multi-turno: con 131.072 tokens de contexto puede mantener historiales largos de conversacion e incorporar documentacion de producto sin truncar, manteniendo coherencia entre turnos.
- Asistentes de razonamiento sobre documentacion interna (RAG): el modo de pensamiento previo ayuda a encadenar la recuperacion de fragmentos con la sintesis final, y el contexto largo permite inyectar varios documentos en una misma ventana.
- Automatizacion de tareas ofimaticas y flujos internos: mediante function calling se puede conectar a APIs de calendario, correo o ERP y resolver tareas encadenadas de varios pasos sin intervencion humana.
- Generacion y refactorizacion de codigo: puede integrarse en pipelines de CI/CD o en asistentes de IDE para revisar diffs, generar pruebas o proponer refactorizaciones, aprovechando el razonamiento explicito y el coste reducido por token.
- Traduccion y soporte multilingue: cubre 16 idiomas, incluidos espanol, portugues, arabe, hindi, thai e indonesio, lo que permite atender mercados diversos con un unico modelo.
- Despliegue en edge y dispositivos con recursos limitados: la combinacion de MoE dispersa y cuantizacion GGUF permite ejecutarlo en CPU y en GPU de gama media, con 184 tok/s reportados en un Apple M5 Max.
- Servicio de alta concurrencia en GPU: con FP8 y vLLM o SGLang, la model card reporta hasta 21.000 tokens de salida por segundo en una unica NVIDIA B300, lo que lo hace viable para cargas de produccion con muchas peticiones simultaneas.

## Benchmarks y rendimiento

Los unicos datos de benchmark disponibles en la informacion proporcionada son los siguientes:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |
| Rendimiento en tareas agenticas y de uso de herramientas | competitivo segun la model card | referencia de comparacion |
| Velocidad en dispositivo | 184 tok/s en Apple M5 Max; hasta 1,7x mas rapido que MoE comparables | no disponible |
| Velocidad en GPU | hasta 21K tok/s de salida en una NVIDIA B300 | no disponible |
| MMLU, HumanEval, GSM8K y similares | no disponibles en la informacion proporcionada | no disponibles |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar. La model card remite a una imagen de benchmarks alojada en el repositorio oficial (figures/LFM2.5-24B-A2B-benchmark.png) cuyo contenido numerico no se ha podido extraer.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 23,97B de parametros totales; no son cifras oficiales): BF16 en torno a 48 GB; FP8 en torno a 24 GB; Q8_0 en torno a 25-26 GB; Q6_K en torno a 20 GB; Q4_K_M en torno a 14-15 GB; Q3_K_M en torno a 12 GB; Q2_K en torno a 9-10 GB.
- A esas cifras hay que sumar la cache KV, que en una ventana de 131.072 tokens puede ser considerable; no se dispone de medidas oficiales de consumo de cache KV.
- GPU de centro de datos: H100, H200, B300 y A100 80 GB para BF16; una unica NVIDIA B300 alcanza, segun la model card, hasta 21.000 tokens de salida por segundo.
- GPU profesional y de gama alta de consumo: RTX 4090, RTX 5090 o L40S pueden acomodar FP8 y cuantizaciones GGUF de 4 a 8 bits; conviene verificar margen para la cache KV.
- Cabe en GPU de consumo: si, con cuantizaciones de 4 bits o inferiores (por ejemplo Q4_K_M) en tarjetas de 16-24 GB; en 8-12 GB habria que recurrir a Q2_K o Q3_K_M.
- Apple Silicon: existe un checkpoint MLX-4bit oficial del modelo base; la model card reporta 184 tok/s en un Apple M5 Max.
- CPU: el repositorio GGUF esta orientado explicitamente a inferencia en CPU y despliegue local con memoria reducida.
- Opciones de despliegue confirmadas para el modelo base: Transformers, vLLM, SGLang, llama.cpp y derivados, ONNX Runtime y MLX. Para este repositorio GGUF, llama.cpp, Ollama y LM Studio son las rutas naturales, aunque no se confirman explicitamente en la informacion proporcionada. No hay datos sobre soporte en TGI.
- Latencia y throughput: los unicos datos disponibles son los de la model card (184 tok/s en Apple M5 Max y hasta 21K tok/s de salida en NVIDIA B300). No hay mediciones por cuantizacion ni por GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | LiveClaw | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B (GGUF de TechnoBaptist) | 24,0B | 2,45B | 131.072 tokens | 48,09 | lfm1.0 | GGUF en HuggingFace; el modelo base ofrece FP8, ONNX y MLX-4bit |
| Qwen3.6-35B-A3B | aproximadamente 35B (la model card indica ~50% mas de parametros totales y activos) | no disponible con precision (nomenclatura A3B, en torno a 3B) | no disponible | 38,19 | no disponible | no disponible en la informacion proporcionada |
| LFM2.5-230M | 230M | no disponible | no disponible | no disponible | lfm1.0 | mismo autor, familia LFM2.5 |

La unica comparacion con datos concretos que ofrece la informacion disponible es frente a Qwen3.6-35B-A3B en LiveClaw, donde LFM2.5-24B-A2B obtiene 48,09 frente a 38,19 pese a contar con menos parametros totales y activos. No se dispone de datos de contexto, licencia ni rendimiento para modelos comparables adicionales de la misma categoria.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion de terceros (TechnoBaptist), no un artefacto oficial de Liquid AI. No hay validacion independiente de la fidelidad de la conversion y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- La model card del repositorio esta truncada: la frase final de recomendacion queda incompleta ("It is not ..."), por lo que se desconoce que usos desaconseja o excluye el autor.
- Licencia lfm1.0, marcada como `license: other`. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial; no se dispone del detalle de sus restricciones en la informacion proporcionada.
- El modelo es exclusivamente de texto: no procesa imagenes, audio ni video.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano, agravado por el uso de temperatura baja (0,1) recomendada, que puede reducir la diversidad de las respuestas.
- El modo de razonamiento previo incrementa el numero de tokens generados antes de la respuesta visible, lo que afecta a la latencia percibida y al coste total aunque cada token sea barato.
- Cobertura multilingue declarada para 16 idiomas, pero sin datos de rendimiento por idioma; el comportamiento en idiomas de menores recursos (thai, indonesio, vietnamita) puede ser inferior al del ingles.
- Los parametros de generacion recomendados (temperature 0,1, top_k 50, repetition_penalty 1,05) estan pensados para cargas agenticas; otros usos pueden requerir ajustes.
- El repositorio ocupa 171,1 GB, lo que implica costes de almacenamiento y descarga importantes si se quieren conservar todos los niveles de cuantizacion.
- Las estimaciones de VRAM de esta ficha se derivan del numero de parametros y no proceden de mediciones oficiales; deben validarse en el hardware objetivo antes de dimensionar un despliegue.
- No hay datos publicos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo en la informacion disponible.
- La busqueda web realizada no ha devuelto resultados utiles: los enlaces obtenidos corresponden a dominios no relacionados con el modelo y se han descartado. Todos los enlaces de la seccion siguiente proceden de la model card y de los metadatos del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/TechnoBaptist/LFM2.5-24B-A2B-GGUF
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base preentrenado: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Checkpoint FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Checkpoint GGUF oficial: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Checkpoint ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Checkpoint MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo de la familia de menor tamano: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentacion de Unsloth: https://unsloth.ai/docs/
- Aplicacion de escritorio de Unsloth: https://unsloth.ai/docs/desktop
- GGUF dinamicos de Unsloth: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Paper de referencia (arXiv): https://arxiv.org/abs/2511.23404
