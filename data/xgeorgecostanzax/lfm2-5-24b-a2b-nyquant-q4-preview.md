# XGeorgeCostanzaX/LFM2.5-24B-A2B-Nyquant-Q4-preview

## Resumen

Este repositorio no contiene un modelo original, sino un conjunto de cuantizaciones GGUF del modelo abierto LiquidAI/LFM2.5-24B-A2B, publicadas por el usuario independiente XGeorgeCostanzaX bajo el nombre Nyquant Q4 (early preview). El modelo base, desarrollado por Liquid AI y publicado el 13 de octubre de 2026, es un Mixture-of-Experts con 23.971.587.712 parámetros totales (unos 24B) y aproximadamente 2B activos por token, con una ventana de contexto de 131K tokens, disenado para ejecutar agentes de forma local y privada. La aportacion de este repo es una asignacion de bits por tensor basada en importance matrix: los expertos enrutados se cuantizan a ~4 bits mientras que los tensores mas sensibles (atencion, convoluciones cortas, FFN densa y embeddings) conservan mayor precision.

La relevancia practica es doble. Por un lado, el modelo base reduce el coste computacional de la decodificacion al nivel de un modelo de ~2B activos, lo que permite inferencia en hardware de consumo y en dispositivos Apple Silicon. Por otro, estas cuantizaciones comprimen los pesos BF16 (47,96 GB) hasta 12,00-13,87 GB, lo que hace viable cargar el modelo completo en GPUs de 16-24 GB o incluso en configuraciones con offload parcial.

Conviene subir el nivel de cautela: se trata de un preview temprano, sin afinidad con Liquid AI, con cero descargas y cero likes en el momento de la consulta, y con la tabla de calidad (divergencia KL y perplejidad frente a BF16) aun pendiente de medicion. Los tres ficheros publicados tienen 4,63, 4,37 y 4,00 bits por peso respectivamente, y no hay resultados de benchmarks ni de tool calling disponibles todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (transformer con capas de atencion y convoluciones cortas; modelo base LFM2.5-24B-A2B) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por token (MoE) |
| Longitud de contexto | 131.000 tokens (modelo base, segun documentacion de Liquid AI); los ejemplos de la model card usan 8.192 y 32.768 tokens en llama.cpp |
| Tipos de cuantizacion | GGUF con asignacion mixta por tensor e importance matrix: `mix-ar4match` 4,63 bpw (13,87 GB), `mix-iq4xs` 4,37 bpw (13,08 GB), `mix-F12000` 4,00 bpw (12,00 GB); expertos enrutados a ~4 bits y tensores sensibles a mayor precision |
| Idiomas soportados | no disponible (ni la model card del cuantizador ni la informacion del modelo base los detallan) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); los ficheros son versiones modificadas de los pesos originales |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors BF16 y existe una version ONNX oficial |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de la familia LFM2.5: 24B parametros totales con enrutamiento que activa unos 2B por token. La descripcion del cuantizador sobre los tensores sensibles revela una topologia hibrida, con bloques de atencion, capas de "short-conv" (convoluciones cortas), FFN densa ademas de los expertos enrutados, y embeddings tratados aparte. Es un modelo de razonamiento post-entrenado: Liquid AI publico checkpoints base y post-entrenados, y la orientacion declarada es la ejecucion de agentes en dispositivo ("on-device agents"). No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de RLHF/DPO en la informacion proporcionada.

El trabajo de este repositorio es exclusivamente de cuantizacion. Se uso una importance matrix para estimar la sensibilidad de cada tensor y se asigno una precision distinta por tipo: los expertos enrutados, que concentran la mayor parte del peso, bajan a ~4 bits, mientras que atencion, convoluciones cortas, FFN densa y embeddings se mantienen por encima de esa cifra. El resultado son tres mezclas con distintos compromisos tamano/calidad (4,63, 4,37 y 4,00 bpw). La model card declara que las mediciones de divergencia KL y perplejidad sobre corpus de chat, web y codigo (60 ventanas de 2.048 tokens por corpus, puntuando los tokens 1.024-2.046, con intervalos bootstrap del 95 %) siguen en ejecucion, igual que un test de tool calling de 36 casos greedy comparado contra BF16.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida en el propio fichero GGUF.
- Razonamiento multi-paso: el modelo base se presenta como reasoning model, orientado a tareas de agente.
- Generacion de codigo: la evaluacion de calidad del cuantizador incluye un corpus especifico de codigo, lo que indica que el modelo se usa y se mide en ese dominio.
- Tool calling / function calling: soportado por el modelo base, aunque la calidad tras esta cuantizacion esta pendiente de publicacion (36 casos de test en curso).
- Uso como agente: combinacion de contexto largo (131K) y tool calling, pensada para flujos con varios pasos y llamadas a APIs.
- Contexto largo: hasta 131K tokens en el modelo base; en llama.cpp se documentan ejemplos con `-c 8192` y `-c 32768`.
- Capacidades multilingues: no disponible; no se especifica la lista de idiomas.
- Capacidades multimodales (vision, audio): no disponible; no se documentan en la informacion proporcionada.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en el repo.

## Casos de uso

- Agente personal en portatil: con 2B parametros activos y un fichero de 12-14 GB, el modelo se puede servir con `llama-server` en un equipo con GPU de 16-24 GB y operar sin conexion, manteniendo los datos en local.
- Atencion al cliente y triage de tickets: la ventana de 131K tokens permite incluir historial de conversacion, politicas internas y documentacion de producto en un mismo prompt, sin fragmentar el contexto en trozos pequenos.
- RAG sobre documentacion extensa: ingerir contratos, manuales o expedientes de decenas de miles de tokens y hacer preguntas sobre ellos en un despliegue on-premise donde no se permite enviar datos a APIs externas.
- Automatizacion con tool calling: exponer funciones internas (consulta de bases de datos, creacion de tickets, envio de correos) y dejar que el modelo encadene llamadas; conviene validar antes la tasa de acierto con el test de tool calling, aun pendiente.
- Asistencia de programacion en local: autocompletado, explicacion de funciones y refactorizacion sobre repositorios privados, aprovechando que el cuantizador mide perplejidad especificamente en codigo.
- Evaluacion de cuantizaciones: `llama-server` con los tres ficheros permite medir en el propio hardware la relacion entre bits por peso y calidad, util para decidir que variante desplegar antes de que el autor publique las metricas.
- Prototipado en Apple Silicon: el modelo base reporta 184 tokens/s en un M5 Max (dato del fabricante, cuantizacion no especificada), lo que hace plausible usar estas mezclas Q4 para demos interactivas en portatiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de calidad con todas las celdas marcadas como "pending" (mediciones en ejecucion):

| Modelo | Tamano | KLD vs BF16 (media de 3 corpus) | PPL chat | PPL web | PPL code |
|---|---:|---|---:|---:|---:|
| BF16 (referencia) | 47,96 GB | 0 | pendiente | pendiente | pendiente |
| mix-ar4match (este repo) | 13,87 GB | pendiente | pendiente | pendiente | pendiente |
| mix-iq4xs (este repo) | 13,08 GB | pendiente | pendiente | pendiente | pendiente |
| mix-F12000 (este repo) | 12,00 GB | pendiente | pendiente | pendiente | pendiente |
| Q4_K_M | 14,53 GB | pendiente | pendiente | pendiente | pendiente |
| QAD-Q4_0 (oficial) | 13,58 GB | pendiente | pendiente | pendiente | pendiente |

Tool calling (36 casos greedy frente a BF16): pendiente.

El unico dato de rendimiento disponible es del fabricante del modelo base: Liquid AI declara que LFM2.5-24B-A2B alcanza 184 tokens/s en un Apple M5 Max y que supera a Qwen3.6-35B-A3B en LiveClaw. No se acompanan cifras concretas ni se especifica la cuantizacion empleada, por lo que no son verificables con la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12,00 GB (`mix-F12000`), 13,08 GB (`mix-iq4xs`) y 13,87 GB (`mix-ar4match`). Hay que sumar la cache KV, cuyo tamano no se detalla en la informacion disponible; a 8K de contexto la huella total razonable se situa en torno a 13-15 GB para el fichero mas pequeno, y en 15-17 GB para el mayor.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 24GB): configuracion comoda para cualquiera de las tres mezclas con contexto de 32K.
- GPU de 16 GB (RTX 4080, 4060 Ti 16GB, RTX 4070 Ti Super): el fichero de 12,00 GB entra con contexto moderado; las variantes de 13-14 GB quedan muy justas y probablemente requieran reducir contexto o hacer offload parcial de capas.
- GPU de 12 GB (RTX 3060 12GB, RTX 4070): solo con offload parcial a RAM, a costa de latencia.
- CPU y Apple Silicon: al activar solo ~2B parametros por token, la decodificacion es comparativamente ligera; el fabricante cita 184 tokens/s en un M5 Max para el modelo base. No hay datos de throughput para estas cuantizaciones concretas.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`, tal como documenta el autor), y por extensión cualquier runtime que consuma GGUF estandar (Ollama, LM Studio, Ollama-like). vLLM y TGI no soportan GGUF de forma general, por lo que para servir en produccion con alto throughput habria que usar los pesos BF16 o safetensors del modelo base.
- Latencia y throughput de estas mezclas: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nyquant Q4 mix-ar4match (este repo) | 24B / ~2B | 131K (heredado del base) | LFM Open License v1.0 | GGUF 13,87 GB | Derivado independiente, metricas de calidad pendientes |
| LFM2.5-24B-A2B BF16 (base) | 24B / ~2B | 131K | LFM Open License v1.0 | safetensors BF16, 47,96 GB | Referencia oficial de calidad; requiere 48+ GB de VRAM |
| LFM2.5-24B-A2B QAD-Q4_0 (oficial) | 24B / ~2B | 131K | LFM Open License v1.0 | GGUF 13,58 GB | Cuantizacion oficial de Liquid AI, punto de comparacion natural |
| LFM2.5-24B-A2B Q4_K_M | 24B / ~2B | 131K | LFM Open License v1.0 | GGUF 14,53 GB | Cuantizacion estandar de llama.cpp, mayor tamano |
| Qwen3.6-35B-A3B | 35B / 3B (deducido de la nomenclatura, no confirmado en la informacion disponible) | no disponible | no disponible | no disponible | Liquid AI afirma que LFM2.5-24B-A2B lo supera en LiveClaw, sin cifras publicadas |

No hay datos de rendimiento publicados para ninguno de los modelos de la tabla en la informacion disponible, por lo que la comparativa se limita a tamano, contexto, licencia y formato.

## Limitaciones y advertencias

- Calidad no verificada: las mediciones de divergencia KL y perplejidad frente a BF16 estan pendientes; se desconoce la degradacion real de cada mezcla, especialmente la de 4,00 bpw.
- Tool calling sin validar: el test de 36 casos frente a BF16 no se ha publicado. En flujos de agente en produccion esto es un riesgo directo.
- Proyecto sin traccion: 0 descargas y 0 likes en el momento de la consulta, un solo autor y publicacion de tipo preview. No hay validacion de la comunidad ni historial de mantenimiento.
- Relacion con el fabricante: es un derivado independiente, no afiliado ni respaldado por Liquid AI. Los ficheros son versiones modificadas de los pesos originales y el autor remite a NOTICE y LICENSE.
- Licencia: LFM Open License v1.0 (etiquetada como `other`/`lfm1.0`). No se detallan en la informacion disponible las condiciones exactas de uso comercial; es imprescindible leer el fichero LICENSE antes de desplegar en producto.
- Idiomas: no se publica lista de idiomas soportados; el rendimiento fuera del ingles es desconocido.
- Alucinacion: al ser un modelo de razonamiento de 2B activos, es esperable que genere razonamientos plausibles pero incorrectos en tareas de muchos pasos; no hay evaluaciones de fidelidad en la informacion disponible.
- Contexto efectivo: aunque el modelo base soporta 131K, los ejemplos del autor usan 8K y 32K; el comportamiento mas alla de esas cifras con estas cuantizaciones no esta medido.
- Sesgos: no disponible; no se han publicado analisis de sesgo para el modelo base ni para el derivado.
- Dependencia de la plantilla de chat: el autor indica usar la plantilla embebida en el GGUF; aplicar una plantilla distinta puede degradar gravemente la calidad en un modelo de razonamiento.

## Enlaces

- Repositorio del cuantizador: https://huggingface.co/XGeorgeCostanzaX/LFM2.5-24B-A2B-Nyquant-Q4-preview
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Version ONNX oficial: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion del modelo: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Cobertura en Unite.AI: https://www.unite.ai/liquid-ai-releases-open-weight-lfm2-5-24b-a2b-for-on-device-agents/
- Cobertura en Crypto Briefing: https://cryptobriefing.com/liquid-ai-lfm2-5-24b-a2b-model/
