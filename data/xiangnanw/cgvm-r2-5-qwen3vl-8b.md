# XiangnanW/CGVM-R2.5-Qwen3VL-8B

## Resumen

CGVM-R2.5-Qwen3VL-8B es un conjunto de modulos entrenados (adaptadores LoRA y un ranker de transiciones) que se monta sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct para tareas de comprension de video en streaming. Lo desarrolla el autor XiangnanW y se publica bajo el identificador R2.5 del proyecto CGVM (Causal-Grounded Video Memory), correspondiente al modelo principal descrito en un paper de 20K. No es un modelo completo: el repositorio contiene unicamente los pesos entrenados (~774 MB), mientras que los backbones congelados (Qwen3-VL-8B-Instruct y CLIP ViT-L/14) deben descargarse por separado.

El problema que aborda es la comprension de video continuo y causal, donde el modelo debe razonar sobre eventos pasados sin acceso a frames futuros, algo que los modelos de video offline no resuelven de forma nativa. La propuesta combina un mecanismo de memoria causal con un ranker de transiciones residuales (etapa 1) y un lector con LoRA (etapa 2) que consume fases del video.

Su relevancia actual radica en que mejora de forma sustancial las metricas sobre el backbone congelado en OVO-Bench (de 64,25% a 78,99% en la media BT/RT) y en StreamingBench (de 82,16% a 83,76% en exactitud global), manteniendo el coste de inferencia ligado a un backbone de 8B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-8B-Instruct) + modulos CGVM: ranker de transiciones residuales y LoRA sobre el lector; encoder de retrieval CLIP ViT-L/14 |
| Parametros totales | No disponible (el backbone Qwen3-VL-8B-Instruct tiene 8B; los modulos entrenados suman 182,88M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors en precision de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y training.pt (PyTorch) |

## Arquitectura y entrenamiento

CGVM se articula en dos etapas sobre un backbone multimodal congelado. La etapa 1 entrena un Residual Transition Ranker (8,29M parametros, 95 MB) que selecciona y ordena transiciones relevantes del flujo de video usando caracteristicas de retrieval extraidas con CLIP ViT-L/14. La etapa 2 entrena un Phase-Grounded Reader mediante LoRA con r=64 y alpha=64 (174,59M parametros, 677 MB) sobre Qwen3-VL-8B-Instruct, que consume las fases seleccionadas y genera la respuesta. El backbone Qwen3-VL-8B-Instruct y el encoder CLIP permanecen congelados y no se redistribuyen en este repositorio.

El entrenamiento se realizo sobre el checkpoint step-000625 de ambas etapas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es el mecanismo de memoria causal para streaming: el modelo procesa el video de forma incremental sin acceso a frames futuros, manteniendo un estado de memoria que el ranker y el lector explotan para responder preguntas retrospectivas y de seguimiento.

## Capacidades

- Comprension de video en streaming con restricciones causales (sin acceso al futuro).
- Razonamiento temporal sobre eventos pasados y presentes (backward tracing, real-time visual perception).
- Preguntas de tipo OCR, reconocimiento de acciones, atributos de objetos y subtitulos en video.
- Recuperacion y ranking de transiciones relevantes mediante el modulo de retrieval.
- Generacion de respuestas multimodales texto-imagen-video heredadas del backbone Qwen3-VL-8B-Instruct.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling y function calling: no documentado para este adaptador (depende del backbone).
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Analisis de retransmisiones deportivas en directo: el modelo puede responder preguntas sobre acciones ocurridas minutos antes sin acceso a frames futuros, util para estadisticas en tiempo real y resumenes automaticos.
- Vigilancia y monitorizacion de camaras de seguridad: procesamiento causal del flujo permite detectar eventos anomalos y responder consultas retrospectivas ("que ocurrio en el pasillo a las 14:32") sin almacenar todo el video.
- Asistencia a personas con discapacidad visual: descripcion continua y causal de lo que ocurre en el campo de vision, con memoria de lo ya descrito para evitar repeticiones.
- Analisis de clases y reuniones grabadas en streaming: seguimiento de quien habla, que se muestra en pantalla y preguntas sobre contenido previo durante la propia sesion.
- Moderacion de contenido en plataformas de video en vivo: deteccion de escenas problematicas en tiempo real con contexto de lo ya emitido, reduciendo falsos positivos por perdida de contexto.
- Robots y agentes embodied: memoria causal de la escena para navegacion y manipulacion, donde el agente solo dispone de observaciones pasadas y debe razonar sobre ellas.
- Analisis de videos medicos o de laboratorio en flujo continuo: seguimiento de procedimientos con preguntas sobre pasos previos sin necesidad de reencuadrar todo el metraje.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando el backbone congelado (R0 Frozen MEMO) frente a CGVM R2.5.

| Benchmark | Metrica | R0 (base) | R2.5 (CGVM) | Delta |
|---|---|---|---|---|
| OVO-Bench | OVO-BT Avg | 51,55% | 78,87% | +27,32 |
| OVO-Bench | OVO-RT Avg | 76,94% | 79,12% | +2,18 |
| OVO-Bench | OVO-Avg (BT+RT)/2 | 64,25% | 78,99% | +14,74 |
| OVO-Bench | OVO-Mac (9 tareas) | no disponible | 79,03% | no disponible |
| OVO-Bench | OVO-Mic | no disponible | 77,72% (1141/1468) | no disponible |
| OVO-Bench | EPM | no disponible | 65,66% | no disponible |
| OVO-Bench | ASI | no disponible | 70,95% | no disponible |
| OVO-Bench | HLD | no disponible | 100,00% | no disponible |
| OVO-Bench | OCR | no disponible | 87,92% | no disponible |
| OVO-Bench | ACR | no disponible | 80,73% | no disponible |
| OVO-Bench | ATR | no disponible | 84,48% | no disponible |
| OVO-Bench | STU | no disponible | 65,73% | no disponible |
| OVO-Bench | FPD | no disponible | 79,21% | no disponible |
| OVO-Bench | OJR | no disponible | 76,63% | no disponible |
| StreamingBench | SB-Mic / Overall | 82,16% | 83,76% (2094/2500) | +1,60 |
| StreamingBench | SB-Mac (10 tareas) | 80,19% | 81,91% | +1,72 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Qwen3-VL-8B-Instruct en bf16 requiere aproximadamente 16-18 GB solo para pesos, mas overhead de activaciones y cache KV; con los modulos CGVM (182,88M parametros adicionales, ~0,4 GB en bf16) y el encoder CLIP ViT-L/14 (~0,6 GB) el consumo total se situa en torno a 20-24 GB en bf16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue comodo; en consumer, RTX 4090 (24 GB) puede ejecutar el conjunto en bf16 con margen ajustado, y RTX 3090/4080 (16-24 GB) requeririan cuantizacion del backbone.
- Cabe en consumer GPU: si, en RTX 4090 24 GB en bf16 con contexto moderado; en GPUs de 16 GB seria necesario cuantizar el backbone (no se publican pesos cuantizados para CGVM).
- Opciones de despliegue: el repositorio usa la libreria PEFT y scripts propios (`scripts/evaluate_adapted.py`) con `torchrun`; el backbone puede servirse con vLLM o TGI por separado, pero los modulos CGVM requieren integracion en el codigo del proyecto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming causal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CGVM-R2.5-Qwen3VL-8B | 8B backbone + 182,88M modulos | no disponible | Si (memoria causal, ranker + LoRA) | no disponible | Hugging Face (solo modulos) |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | No nativo | no disponible | Hugging Face (backbone completo) |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible | No nativo | no disponible | Hugging Face |
| LLaVA-OneVision-7B | 7B | no disponible | No nativo | no disponible | Hugging Face |

La comparativa se limita a modelos multimodales de tamano similar; no se dispone de datos de benchmarks comunes para contrastar directamente. No disponible informacion adicional sobre alternativas especificas de video streaming causal.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: sin los backbones Qwen3-VL-8B-Instruct (revision bloqueada `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) y CLIP ViT-L/14 no es ejecutable.
- La licencia no esta declarada en la informacion disponible; es imprescindible verificar los terminos de Qwen3-VL-8B-Instruct y CLIP antes de uso comercial.
- Riesgo de alucinacion inherente al backbone multimodal, especialmente en preguntas retrospectivas con memoria incompleta.
- El rendimiento depende de la calidad de las caracteristicas de retrieval de CLIP y de la seleccion del ranker; errores en la etapa 1 degradan la etapa 2.
- Idiomas soportados no documentados; el comportamiento multilingue depende del backbone y no se ha evaluado de forma independiente.
- Longitud de contexto no especificada; la memoria causal puede degradarse en videos muy largos.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni integracion con vLLM/Ollama, lo que limita el despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- Las metricas reportadas provienen del autor y no se han replicado de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/XiangnanW/CGVM-R2.5-Qwen3VL-8B
- Backbone Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Encoder CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
