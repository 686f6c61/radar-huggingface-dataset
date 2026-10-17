# vinnipukh/Hy-Memory-30B-A3B-GGUF

## Resumen

Hy-Memory-30B-A3B-GGUF es la colección de cuantizaciones en formato GGUF publicada por el usuario vinnipukh a partir de tencent/Hy-Memory-30B-A3B, el modelo de escritura de memoria a largo plazo desarrollado por Tencent Hunyuan. No es un modelo de propósito general: su función es actuar como el componente que decide qué información de una conversación debe almacenarse en un banco de memoria y cómo debe actualizarse, sustituyendo al LLM genérico que habitualmente ocupan ese rol en frameworks como Mem0, MemOS o Hy-Memory.

Arquitectónicamente es un transformer disperso de tipo mixture-of-experts con 30.064.725.888 parámetros totales (aproximadamente 30B) y unos 3B parámetros activos por token, distribuidos en 128 expertos. Soporta una longitud de contexto de 262.000 tokens, lo que permite procesar historiales de conversación muy largos en una sola pasada. Los idiomas declarados son inglés y chino.

Esta publicación concreta es una conversión de pesos, no un entrenamiento: se realizó con llama.cpp `b11700` sobre la arquitectura `hy_v3`, sin matriz de importancia (imatrix), y cubre desde BF16 completo hasta cuantizaciones experimentales de 1-2 bits. Su relevancia práctica es que permite ejecutar un modelo de memoria de 30B en hardware de consumo mediante cuantizaciones Q4, algo inviable con los pesos originales en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), arquitectura llama.cpp `hy_v3` |
| Parametros totales | 30.064.725.888 (aproximadamente 30B) |
| Parametros activos | Aproximadamente 3B por token (MoE con 128 expertos) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q5_1, Q5_0, Q4_1, Q4_0, Q2_0, TQ2_0, TQ1_0, Q1_0 (las cuatro ultimas experimentales) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo mixture-of-experts con 128 expertos enrutados y expertos compartidos, con aproximadamente 30B de parametros totales y unos 3B activos por token. La model card de la conversion senala que el `config.json` del publicador original declaraba `moe_intermediate_size=1536`, pero los tensores reales de expertos enrutados y compartidos tienen 768 de ancho (`expert_hidden_dim`); ese valor se corrigio a 768 antes de convertir para que coincidiese con las formas reales de los tensores. No hay cabeza MTP en el modelo fuente (`num_nextn_predict_layers=0`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que esos datos no aparecen en la informacion proporcionada. La conversion a BF16 fue verificada con una completacion greedy antes de generar las cuantizaciones. El proceso se realizo con llama.cpp `b11700` y sin imatrix, lo que explica el aviso del autor sobre el mal comportamiento de las cuantizaciones por debajo de Q4.

## Capacidades

- Extraccion de memoria: identifica hechos y preferencias explicitas del usuario dentro de una conversacion y los redacta como afirmaciones concisas y autocontenidas.
- Escritura y actualizacion de bancos de memoria: decide que almacenar y como actualizar entradas existentes en frameworks de memoria persistente.
- Salida estructurada: el flujo documentado por el autor devuelve un objeto JSON con una lista `memories` de cadenas, lo que facilita su integracion en pipelines.
- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento controlable mediante `reasoning_effort`: admite el valor `no_think` para desactivar el razonamiento explicito, que es la configuracion recomendada para extraccion de memoria.
- Contexto largo de 262.000 tokens, adecuado para procesar historiales de conversacion extensos sin trocear.
- No dispone de soporte declarado de vision, audio ni de tool calling explicito en la informacion proporcionada.

## Casos de uso

- Extraccion de memoria en asistentes conversacionales: el modelo se coloca como escritor de memoria en Mem0 o MemOS, recibe el turno del usuario y devuelve las memorias a persistir en JSON. Con 262.000 tokens de contexto puede procesar el historial completo sin resumir.
- Consolidacion y deduplicacion de un banco de memoria: al actualizar entradas existentes, permite mantener el almacen sin hechos redundantes o contradictorios en agentes de uso prolongado.
- Agentes de larga duracion: agentes que mantienen estado entre sesiones (asistentes de proyecto, tutores, copilotos internos) usan el modelo para decidir que merece persistir y que no.
- Personalizacion de asistentes de atencion al cliente: memorizar preferencias, incidencias previas y datos de cuenta de cada cliente para que el siguiente turno no requiera repetir contexto.
- Despliegue local con requisitos de privacidad: al ser un GGUF que corre en llama.cpp, Ollama o LM Studio, la extraccion de memoria sobre conversaciones sensibles puede ejecutarse en infraestructura propia sin enviar datos a terceros.
- Procesamiento por lotes de historiales: con la cuantizacion Q4_0 (17 GB) y solo 3B parametros activos, es viable procesar grandes volumenes de conversaciones archivadas para poblar un banco de memoria retroactivamente.
- Investigacion sobre memoria a largo plazo: sirve como linea base reproducible para comparar estrategias de extraccion, al estar la cuantizacion fijada y disponible en varios niveles de precision.
- Backend de memoria para agentes multilingues ingles-chino: cubre los dos idiomas declarados sin necesidad de un modelo adicional de traduccion en ese par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de extraccion de memoria; unicamente remite al informe tecnico arXiv:2610.22196 y al repositorio Tencent-Hunyuan/Hy-Memory como fuentes de codigo y evaluacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin cache KV): BF16 60,2 GB; Q8_0 32,0 GB; Q5_1 22,6 GB; Q5_0 20,8 GB; Q4_1 18,9 GB; Q4_0 17,0 GB; Q2_0 8,7 GB; TQ2_0 8,0 GB; TQ1_0 6,6 GB; Q1_0 4,5 GB. Hay que sumar el espacio de la cache KV, que crece con la longitud de contexto configurada.
- GPU recomendadas: H100 o A100 de 80 GB para BF16 completo; A100 40 GB o 2x RTX 4090 para Q8_0; RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos) para Q4_0 y Q4_1 con contexto moderado.
- Cabe en GPU de consumo: si, en Q4_0 (17,0 GB) y Q4_1 (18,9 GB) dentro de 24 GB de VRAM, y en Q5_0/Q5_1 con cuantizaciones de cache agresivas. Q8_0 y superiores no caben en una unica GPU de consumo.
- CPU: al tener solo unos 3B parametros activos, las cuantizaciones Q4_0 y Q5 son razonablemente rapidas en CPU, aunque el autor senala Q4_0 como la mas rapida en la mayoria de CPU y GPU.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de la arquitectura `hy_v3`, version `b11700` o posterior; Ollama mediante `hf.co/vinnipukh/Hy-Memory-30B-A3B-GGUF`; LM Studio buscando el repositorio. Existe una cuantizacion EXL3 alternativa (jyohukuchan/Hy-Memory-30B-A3B-exl3-4.08bpw) para ExLlamaV3 en GPU.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, el hardware y la longitud de contexto efectiva.
- La cuantizacion esta pensada para ejecucion con plantilla de chat: `llama-server -hf vinnipukh/Hy-Memory-30B-A3B-GGUF:Q4_0 --jinja -c 32768 --chat-template-kwargs '{"reasoning_effort": "no_think"}'`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan comparar este modelo con alternativas funcionales de la misma categoria. La tabla siguiente recoge unicamente las opciones de distribucion del mismo modelo encontradas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vinnipukh/Hy-Memory-30B-A3B-GGUF | 30B totales / ~3B activos | 262.000 tokens | GGUF (BF16 a Q1_0) | Apache-2.0 | HuggingFace, Ollama, LM Studio |
| rapatsky/Hy-Memory-30B-A3B-GGUF | 30B totales / ~3B activos | 262.000 tokens | GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0) | Apache-2.0 | HuggingFace |
| jyohukuchan/Hy-Memory-30B-A3B-exl3-4.08bpw | 30B totales / ~3B activos | 262.000 tokens | EXL3 (ExLlamaV3, GPU) | Apache-2.0 | HuggingFace |
| tencent/Hy-Memory-30B-A3B (base) | 30B totales / ~3B activos | 262.000 tokens | Safetensors (BF16) | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Las cuantizaciones Q2_0, TQ2_0, TQ1_0 y Q1_0 son redondeos directos de un modelo que no fue entrenado para pesos de 1-2 bits. El propio autor advierte de salida rota y las incluye solo para investigacion y comparacion.
- La conversion se realizo sin imatrix, por lo que la degradacion en cuantizaciones bajas es mayor de lo que seria habitual con una matriz de importancia.
- El modelo esta especializado en extraccion y escritura de memoria; no debe esperarse de el un rendimiento de proposito general en razonamiento, codigo o matematicas.
- Idiomas soportados limitados a ingles y chino. No hay soporte declarado de castellano, lo que puede degradar la calidad de las memorias extraidas en conversaciones en espanol.
- Riesgo de alucinacion: el flujo documentado incluye la instruccion explicita de no inferir ni inventar informacion, lo que indica que el modelo puede generar hechos no presentes en la conversacion si no se le restringe.
- Para extraccion de memoria el autor recomienda `temperature=0.0` y `reasoning_effort: "no_think"`. Usar otros valores puede alterar el formato JSON de salida.
- Requiere una compilacion de llama.cpp con soporte de `hy_v3` (probado en `b11700` o posterior); versiones anteriores no cargaran el modelo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base, por lo que conviene verificar los terminos del repositorio original de Tencent.
- El repositorio tiene 199,2 GB y cero descargas y cero likes en el momento de la consulta, lo que implica una validacion comunitaria practicamente nula.
- Las cuantizaciones de 32 GB o mas (Q8_0 y BF16) requieren hardware de gama alta, lo que limita su uso a entornos con GPU profesionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vinnipukh/Hy-Memory-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Codigo y evaluacion: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico: https://arxiv.org/abs/2610.22196
- Cuantizaciones K-quants alternativas: https://huggingface.co/rapatsky/Hy-Memory-30B-A3B-GGUF
- Cuantizacion EXL3 para ExLlamaV3: https://huggingface.co/jyohukuchan/Hy-Memory-30B-A3B-exl3-4.08bpw
