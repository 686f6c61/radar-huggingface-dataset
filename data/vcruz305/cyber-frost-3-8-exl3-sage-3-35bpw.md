# vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.35bpw

## Resumen

CYBER-FROST-3.8-EXL3-SAGE-3.35bpw es una cuantizacion EXL3 de 3,35 bits por parametro del modelo CYBER-FROST-3.8, un modelo de lenguaje especializado en ciberseguridad desarrollado por Blackfrost-AI (Sir Frosty) y convertido a formato EXL3 por vcruz305 en colaboracion oficial. El modelo base es un fine-tune de la familia Qwen4-Exp (arquitectura `Qwen4ExpForConditionalGeneration`, tipo MoE) orientado a tareas de seguridad ofensiva y defensiva: respuesta a incidentes, analisis de malware, validacion de vulnerabilidades, ingenieria de deteccion y operacion de agentes de seguridad autorizados.

El objetivo declarado del modelo es reducir los rechazos falsos en flujos de trabajo profesionales de ciberseguridad, donde la terminologia tecnica (explotacion, malware, ingenieria social) provoca que asistentes generalistas se nieguen a responder aunque el operador tenga autorizacion legitima. Con 28.312.206.848 parametros totales y una ventana de contexto configurada de 262.144 tokens, esta version EXL3 comprime el checkpoint BF16 a un payload de 89,25 GiB, lo que permite servirlo en una unica DGX Spark (GB10, 128 GB de memoria unificada) con cache KV de 8 bits.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: la cuantizacion SAGE EXL3 mantiene un 91,20% de top-1 retenido frente al BF16 en el conjunto held-out y un 91,76% en el conjunto independiente, con una divergencia KL de 0,0696 nats. Es una opcion practica para investigadores que necesitan ejecutar un modelo de seguridad de gran contexto en hardware de una sola maquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE, transformer) |
| Parametros totales | 28.312.206.848 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurada) |
| Tipos de cuantizacion | EXL3 SAGE 3,35 bpw (cuerpo), LM head 6 bits, torre de vision 6 bits, capa MTP 3,33 bits, tabla n-gram 6 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | SafeTensors EXL3 (9 shards + `ngram_embedding.safetensors`), libreria exllamav3 |
| Tamano del repo | 152,3 GB |
| Payload publicado | 95.832.202.642 bytes (89,25 GiB; cuerpo no-ngram 56,66 GB / 52,77 GiB) |
| Modelo base | Blackfrost-AI/CYBER-FROST-3.8-BF16 y Blackfrost-AI/CYBER-FROST-3.8-FP8 |
| Metodo de cuantizacion | SAGE EXL3 |
| Decodificacion especulativa | una capa MTP nativa |
| Tarea principal | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente emplea la arquitectura `Qwen4ExpForConditionalGeneration`, una variante de la familia Qwen4-Exp con mezcla de expertos (MoE) segun las etiquetas del repositorio, aunque el numero de parametros activos no se publica en la informacion disponible. Incluye una torre de vision y ficheros de procesador, asi como una capa MTP (multi-token prediction) que habilita decodificacion especulativa nativa. La cuantizacion EXL3 SAGE aplica 3,35 bits por parametro al cuerpo del modelo, 6 bits al LM head, 6 bits a la torre de vision, 3,33 bits a la capa MTP (con K_gu=3 y K_d=4) y 6 bits a una tabla n-gram que se incluye empaquetada y se transmite desde disco en tiempo de inferencia.

El entrenamiento del padre BF16 se realizo sobre un corpus de seguridad de Blackfrost-AI que combina material curado de ciberseguridad, flujos de trabajo escritos por operadores, escenarios realistas estilo engagement y datos de destilacion propiedad de Blackfrost. Los tamanos del corpus, el desglose por fuente, el material bruto de engagement, las identidades de clientes y los prompts/respuestas no se publican intencionadamente. Esta conversion EXL3 no anadio datos de entrenamiento: es un artefacto de cuantizacion que parte del checkpoint BF16 y se valida contra el mediante metricas de retencion top-1 y divergencia KL sobre 8.184 posiciones por conjunto.

## Capacidades

- Generacion de texto conversacional y tecnico orientado a dominios de ciberseguridad.
- Cobertura de reconocimiento y OSINT, ingenieria social, BEC y abuso con deepfakes, seguridad de aplicaciones web y APIs, identidad y Active Directory, seguridad de red, perimetro, VPN y protocolos, y vulnerabilidades (segun la model card del padre).
- Soporte de tool use / function calling (etiqueta `tool-use`).
- Operacion como agente de seguridad en flujos multi-paso (etiqueta `security-research`, `red-team`, `blue-team`).
- Decodificacion especulativa mediante capa MTP nativa para acelerar la generacion.
- Contexto largo de 262.144 tokens configurados, adecuado para analisis de trazas, logs y documentos extensos.
- Presencia de torre de vision y procesador multimodal en la configuracion, aunque sin evaluacion de calidad multimodal realizada para este pack EXL3.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Respuesta a incidentes: el modelo puede procesar ventanas de hasta 262.144 tokens para correlacionar logs, trazas de red y artefactos de un incidente en una sola pasada, manteniendo contexto entre fases de triaje y contencion.
- Analisis de malware: revision de cadenas, comportamiento y tecnicas MITRE ATT&CK en un entorno controlado, con un modelo disenado para no rechazar terminologia tecnica legitima.
- Validacion de vulnerabilidades en laboratorio: reproduccion y descripcion de fallos en entornos autorizados, generando PoCs y notas de remediacion para el equipo de seguridad.
- Ingenieria de deteccion: redaccion de reglas Sigma, YARA y consultas SIEM a partir de descripciones de comportamiento o de muestras, integrable en pipelines de deteccion como servicio.
- Agente de seguridad autorizado: uso con tool calling para orquestar escaneos, consultas a APIs de threat intelligence y acciones acotadas, con permisos y alcance impuestos externamente por el despliegue.
- Formacion y simulacion de red team/blue team: generacion de escenarios de engagement realistas y material de entrenamiento para analistas, aprovechando el corpus de escenarios del padre.
- Asistencia en cumplimiento y documentacion: redaccion de informes de hallazgos, planes de remediacion y resumenes ejecutivos a partir de notas tecnicas largas gracias al contexto extendido.
- Despliegue en hardware unico: servir el modelo en una DGX Spark (GB10, 128 GB) con 8 bits de KV cache y una peticion concurrente, util para laboratorios con recursos limitados.

## Benchmarks y rendimiento

Metricas de retencion de la cuantizacion frente al modelo BF16, sobre 8.184 posiciones por conjunto con next-token sin redondear:

| Metrica | Held-out | Independiente |
|---|---|---|
| Top-1 | 7.464 / 8.184 (91,20%) | 7.510 / 8.184 (91,76%) |
| KL (nats) | 0,0696 | 0,0671 |
| KL (bits) | 0,1004 | 0,0968 |

Comparacion con el pack EXL3 anterior (3,5 bpw) frente a la release FP8: 86,96% held-out y 85,16% independiente en top-1. El pack actual (3,35 bpw) mejora esas cifras.

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el payload publicado ocupa 89,25 GiB; con cache KV de 8 bits y contexto de 262.144 tokens el consumo real es superior y depende de la longitud de secuencia. El fabricante solo valida una DGX Spark (GB10, 128 GB de memoria unificada).
- GPU recomendadas: DGX Spark (GB10) es el unico hardware probado segun la model card. Otras GPU (A100, H100, RTX 4090) no han sido validadas por el autor.
- Cabe en consumer GPU: no confirmado. El cuerpo no-ngram ocupa 52,77 GiB, por lo que no cabe en GPU consumer de 24 GB ni de 48 GB en su configuracion completa; requeriria hardware de 80 GB o superior, sin validacion publicada.
- Opciones de despliegue: exllamav3 (fork `vcruz305/exllamav3` en el pin medido), siguiendo `DEPLOY.md` y la receta `Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica una peticion concurrente en la configuracion validada y no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-EXL3-SAGE-3.35bpw | 28,3 B totales | 262.144 | EXL3 3,35 bpw | qwen-community-license-1.0 | Publicado, 135 descargas |
| CYBER-FROST-3.8-EXL3-SAGE-3.5bpw | no disponible | no disponible | EXL3 3,5 bpw | qwen-community-license-1.0 | Reemplazado por este pack |
| CYBER-FROST-3.8-FP8 | no disponible | no disponible | FP8 | qwen-community-license-1.0 | Release padre |
| CYBER-FROST-3.8-BF16 | no disponible | no disponible | BF16 | qwen-community-license-1.0 | Release padre |

No se dispone de datos de benchmarks de capacidad ni de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion EXL3 introduce divergencia respecto al BF16: 91,20% de top-1 retenido en held-out implica que aproximadamente 1 de cada 11 predicciones difiere del padre.
- La model card advierte explicitamente de que no debe inferirse capacidad multimodal validada de la presencia de la torre de vision y el procesador; no se ha realizado evaluacion de calidad de imagen o video en este pack.
- El modelo no puede establecer autorizacion, consentimiento, reglas de engagement, jurisdiccion ni si un objetivo esta en alcance. El despliegue debe imponer identidad, permisos de herramientas, logging, limites de tasa y revision humana de forma externa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero relevante en un modelo orientado a produccion de contenido tecnico de seguridad.
- Sesgos conocidos: no disponibles. El corpus de entrenamiento no se publica, lo que impide auditar su composicion.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Licencia `qwen-community-license-1.0` etiquetada como `other`: es necesario revisar los terminos para uso comercial antes de desplegar en produccion.
- Solo se ha validado el despliegue en una DGX Spark con una peticion concurrente; el rendimiento en otros entornos y con concurrencia superior no esta medido.
- El repositorio ocupa 152,3 GB, lo que exige almacenamiento considerable incluso si el payload util es de 89,25 GiB.
- Modelo en evaluacion de calidad activa ("public research release under active quality assessment"); no debe tratarse como una release estable para produccion sin validacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.35bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Release FP8: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8
- Pack EXL3 anterior (3,5 bpw): https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.5bpw
- Fork exllamav3: https://github.com/vcruz305/exllamav3
- Receta de despliegue DGX Spark: https://github.com/vcruz305/Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe
- Organizacion Blackfrost-AI: https://huggingface.co/Blackfrost-AI
