# xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ8e-fp16-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ8e-fp16-mtp es una cuantizacion de 8 bits en formato MLX del modelo denso de 27.781 millones de parametros Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tuning orientado a codigo sobre la arquitectura Qwen3_5 multimodal. La publica el usuario xunlinkx mediante su pipeline de cuantizacion oMLX, y esta pensada especificamente para ejecucion nativa en Apple Silicon, desde chips M1 hasta M4 y posteriores. La variante oQ8e mantiene los pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16, con pesos de atencion y MLP en 8 bits con calibracion por matriz de importancia y tamano de grupo 64.

El interes de esta version radica en dos decisiones tecnicas: conservar el torre de vision (encoder ViT de 27 bloques) integro en FP16 sin cuantizar, y preservar las cabezas de prediccion multi-token (MTP) tambien en FP16 para habilitar decodificacion especulativa. Segun el autor, esto permite alcanzar aproximadamente el 99,8 % de la fidelidad de un modelo FP16 completo y entre 1,4 y 1,7 veces mas throughput de tokens en tareas de codigo y razonamiento agentico cuando el MTP esta activo en runtimes compatibles.

El modelo ocupa unos 28,5 GB en disco y en RAM, con un repositorio de 30,9 GB, y esta bajo licencia Apache-2.0 heredada del modelo base. No es un modelo para consumo general: requiere equipos Apple con 48 GB de memoria unificada o mas para funcionar con holgura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con encoder ViT de 27 bloques) |
| Parametros totales | 27.781.427.952 (denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits (oQ8e, cuantizacion afina, grupo 64, calibracion imatrix); pesos no cuantizados, escalas, sesgos, normas y embeddings en FP16; torre de vision y cabezas MTP en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~28,5 GB estimados en disco/RAM; repositorio de 30,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 27B parametros sobre la arquitectura Qwen3_5 en su variante multimodal, con un encoder visual de 27 bloques y un modulo de fusion (merger) para integrar las representaciones de imagen en el flujo de texto. Incluye cabezas auxiliares de prediccion multi-token (MTP) con `mtp_num_hidden_layers: 1`, que actuan como borrador para decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el fine-tuning de Jackrong empleo RLHF o DPO.

La contribucion de esta publicacion no es el entrenamiento sino la cuantizacion: el pipeline oMLX aplica 8 bits de forma casi uniforme a todas las capas de atencion y MLP, manteniendo en FP16 los tensores sensibles (embeddings, normas, escalas, sesgos), la torre de vision completa y las cabezas MTP. La eleccion de FP16 como dtype objetivo responde a que los chips M1 y M2 de Apple carecen de unidades aritmeticas BF16 nativas, mientras que M3 y posteriores lo ejecutan a pleno rendimiento. El resultado es un checkpoint que el autor describe como nivel de referencia casi sin perdida para maquinas de 48, 64, 96 y 128 GB.

## Capacidades

- Generacion de texto y razonamiento general, con enfasis en codigo tras el fine-tuning Coder-Flash.
- Comprension de imagenes: OCR, interpretacion de diagramas, capturas de codigo y razonamiento espacial, gracias al encoder ViT de 27 bloques conservado en FP16.
- Decodificacion especulativa mediante cabezas MTP, con un borrador de 3 tokens configurable en oMLX.
- Refactorizacion de codigo y analisis de arboles de sintaxis abstracta (AST), segun el autor.
- Ejecucion de herramientas de horizonte largo (tool execution) en flujos agenticos.
- Conversacion multi-turno (pipeline text-generation, tag conversational).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Refactorizacion de codigo en local: el modelo esta calibrado para mantener precision matematica y estilo de indentacion exacto, lo que lo hace adecuado para reescrituras automatizadas de modulos completos en un Mac de 64 GB o mas.
- Revision de capturas de codigo y diagramas: al conservar la torre de vision en FP16, puede extraer texto de imagenes (OCR) y describir diagramas de arquitectura sin degradacion por cuantizacion.
- Asistente de programacion en IDE sobre Apple Silicon: con MTP activo y 3 tokens de borrador, el throughput mejora entre 1,4 y 1,7 veces, lo que reduce la latencia percibida en autocompletado y chat.
- Agentes de ejecucion de herramientas de larga duracion: el modelo base esta orientado a tool execution de horizonte largo, y la variante oQ8e minimiza la perdida de fidelidad en cadenas de llamadas.
- Analisis estatico asistido: combinacion de generacion de codigo y parsing de AST para tareas de migracion o auditoria en pipelines locales.
- Prototipado multimodal en investigacion: servir el modelo con oMLX en el puerto 8005 y consumirlo desde notebooks para experimentos que mezclen imagen y codigo.
- Despliegue en estaciones de trabajo Apple de alta memoria: su huella de ~28,5 GB encaja en Macs de 48 GB o mas, permitiendo inferencia privada sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la mejora de throughput con MTP activo, de aproximadamente 1,4 a 1,7 veces en tareas de codigo y razonamiento agentico, y la afirmacion de que la cuantizacion retiene en torno al 99,8 % de la fidelidad FP16. No se especifican MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- Memoria: el autor indica que el modelo esta pensado para Apple Silicon con 48, 64, 96 o 128 GB de memoria unificada; la huella estimada de pesos es de ~28,5 GB, por lo que 48 GB es el minimo practico.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores). No esta pensado para GPU NVIDIA ni AMD.
- Consumer GPU: no aplica; no cabe en GPUs de consumo tipo RTX 4090 por formato y libreria (MLX).
- Despliegue: oMLX Server (`omlx serve ... --port 8005`) y MLX-LM (`mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el autor cita "llama.cpp MTP draft" solo como runtime compatible con MTP.
- Latencia y throughput: no se publican valores absolutos; solo la mejora relativa de 1,4 a 1,7 veces con MTP activo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-oQ8e-fp16-mtp (este) | ~27,8B denso | no disponible | 8 bits oQ8e + FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp | ~27,8B denso (mismo base) | no disponible | 4 bits oQ4e + FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp | ~27,8B denso (variante texto) | no disponible | 4 bits oQ4e + FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base) | ~27B denso | no disponible | sin cuantizar | Apache-2.0 | generico |

Las alternativas directas son las otras variantes del mismo autor: la oQ4e reduce el peso a costa de fidelidad y la variante Text elimina la torre de vision. No se dispone de datos de benchmarks para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin conversion.
- Requiere al menos 48 GB de memoria unificada; por debajo, el modelo no cabe con holgura.
- La cuantizacion de 8 bits, aunque descrita como casi sin perdida, no es identica al FP16 completo; el autor no publica mediciones independientes que lo verifiquen.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de fiabilidad.
- No se especifican idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y no se detallan restricciones adicionales del fine-tuning de Jackrong.
- El modelo tiene 268 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria significativa.
- La model card mezcla rutas de ejemplo (`Jackrong/...`) con el identificador real (`xunlinkx/...`), lo que puede provocar errores al copiar los comandos de uso.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Variante oQ4e: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-oQ4e-fp16-mtp
- Variante Text oQ4e: https://huggingface.co/xunlinkx/Qwopus3.8-27B-Coder-Flash-Text-oQ4e-fp16-mtp
