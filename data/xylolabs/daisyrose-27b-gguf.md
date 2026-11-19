# Xylolabs/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal DaisyRose-27B de RadixArk, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un fine-tune de Qwen3.8-27B entrenado exclusivamente con aprendizaje por refuerzo sobre tareas de agente de horizonte largo, sin supervisión ni destilación, y conserva la arquitectura, tokenizador y plantilla de chat del modelo original. Esta distribución incluye el proyector de visión y la matriz de importancia necesarios para la inferencia multimodal completa.

El interés de esta ficha reside en que ofrece un artefacto listo para desplegar en hardware de consumo o servidores modestos, con una única cuantización Q8_0 de 29,05 GB y una degradación medida muy baja respecto a BF16 (KL 0,0009, top-1 del 98,64 %). El modelo base está pensado para razonamiento multimodal y ejecución de tareas agénticas de varios pasos, con una ventana de contexto de 256K tokens según la documentación de RadixArk.

La relevancia actual viene de su naturaleza de reemplazo directo del Qwen3.8-27B subyacente y de la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. No obstante, la información publicada sobre esta cuantización concreta es escasa: solo se ofrece Q8_0, no hay benchmarks propios del GGUF y la model card se limita a datos de perplejidad y divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas SSM (según los tensores `ssm_a`, `ssm_dt`, `ssm_conv1d` de la receta de cuantización); arquitectura heredada de Qwen3.8-27B |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según la model card del modelo base) |
| Tipos de cuantizacion | Q8_0 (única cuantización publicada); proyector de visión en F16 y Q8_0 |
| Idiomas soportados | inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal `mmproj` separado e importance matrix |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B parte de Qwen3.8-27B y conserva su arquitectura, tokenizador y plantilla de chat. La receta de cuantización de Xylolabs revela la presencia de tensores propios de capas de espacio de estados (`ssm_a`, `ssm_dt`, `ssm_conv1d`), lo que apunta a una arquitectura híbrida con componentes SSM además de atención, aunque la model card no detalla la proporción ni la disposición exacta de estas capas. También se menciona una capa MTP (multi-token prediction) incluida entre las matrices de pesos cuantizadas.

El entrenamiento del modelo original se realizó exclusivamente con aprendizaje por refuerzo, sin fine-tuning supervisado ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo con sesiones de hasta 1M tokens, durante 18 días en 144 GPU H200. Según RadixArk, Terminal Bench 4.1 pass@1 sube de 5,6 a 12,0 y el modelo mejora en la mayoría de benchmarks de código, razonamiento e instrucciones. La cuantización de Xylolabs convierte el checkpoint BF16 a GGUF y aplica `llama-quantize` con una importance matrix construida a partir de 1.030 fragmentos de 512 tokens en inglés, coreano, código y matemáticas con formato de chat, más texto crudo en inglés y coreano.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imagen y texto conjuntamente (pipeline `image-text-to-text`).
- Modo de pensamiento activado por defecto; se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'` para respuestas directas.
- Razonamiento agéntico de múltiples pasos, entrenado específicamente sobre tareas de horizonte largo.
- Ejecución de tareas de terminal y código, con mejoras reportadas en Terminal Bench 4.1.
- Comprensión de imágenes mediante proyector de visión separado (F16 o Q8_0).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repositorio.
- Compatible con endpoints (`endpoints_compatible`) y conversación multi-turno.
- Soporte de tool calling: no confirmado explícitamente en la información disponible, aunque el entrenamiento agéntico y la plantilla de chat de Qwen lo hacen plausible; no se debe asumir sin verificación.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo fue entrenado con RL sobre tareas agénticas de horizonte largo y muestra mejoras en Terminal Bench, por lo que encaja en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Análisis de documentos e imágenes en local: con el proyector de visión y 256K de contexto, se puede desplegar en una estación de trabajo con una sola GPU para extraer información de capturas, diagramas o documentos escaneados junto con texto largo.
- Asistente de código en producción: la cuantización Q8_0 conserva el 98,64 % del top-1 respecto a BF16, lo que permite integrarlo en flujos de revisión de código o generación de parches sin depender de servicios en la nube.
- Atención al cliente multilingüe inglés-coreano: el modelo cubre ambos idiomas de forma nativa y mantiene conversaciones multi-turno con contexto extenso, adecuado para soporte técnico con historiales largos.
- Razonamiento con modo de pensamiento para tareas analíticas: se puede activar el modo thinking por defecto para problemas de matemáticas o lógica, y desactivarlo para respuestas rápidas en producción de baja latencia.
- Despliegue en hardware de consumo o servidores sin GPU dedicada: al estar en GGUF, se ejecuta con llama.cpp en CPU, Metal o CUDA, lo que facilita prototipado y entornos con recursos limitados.
- Investigación en post-entrenamiento: sirve como punto de partida cuantizado para experimentos de RL o evaluación de agentes sin necesidad de infraestructura de 144 GPU H200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización. La model card solo proporciona métricas de fidelidad de la cuantización:

| Metrica | Q8_0 | Referencia BF16 |
|---|---|---|
| Tamano | 29,05 GB | no disponible |
| Perplejidad (wikitext-2) | 6,7291 | 6,7252 |
| KL medio vs BF16 | 0,0009 | — |
| Same top-1 vs BF16 | 98,64 % | — |

Las métricas se midieron sobre wikitext-2 test, 80 fragmentos de 512 tokens, puntuando las posiciones 256 a 511 de cada fragmento (20.400 tokens en total). El BF16 GGUF de referencia se validó contra transformers con KL 0,00003 y top-1 del 99,76 %.

## Requisitos de hardware

- VRAM estimada: aproximadamente 29 GB para el archivo Q8_0 más 0,63-0,93 GB del proyector de visión, es decir, en torno a 30 GB en total para cargar el modelo completo en GPU.
- GPU recomendadas: A100 40 GB, H100, L40S 48 GB o RTX 6000 Ada; en GPUs de 24 GB (RTX 4090, 3090) no cabe la cuantización Q8_0 completa y sería necesario descargar capas a CPU con `-ngl` parcial.
- Cabe en GPU de consumo solo de forma parcial: con 24 GB se puede ejecutar con offloading parcial, a costa de latencia.
- Opciones de despliegue: llama.cpp (versión b12531 o superior, commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`), con `llama-server` para API compatible con endpoints y `llama-mtmd-cli` para inferencia multimodal por línea de comandos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-GGUF (esta ficha) | 27,3B | 256K | Apache-2.0 | GGUF Q8_0 | Multimodal, RL puro, EN/KO |
| RadixArk/DaisyRose-27B (BF16) | 27,3B | 256K | Apache-2.0 | safetensors BF16 | Modelo original, sin cuantizar |
| RadixArk/DaisyRose-27B-FP8 | 27,3B | 256K | Apache-2.0 | FP8 | Cuantización oficial de 8 bits |
| RadixArk/DaisyRose-27B-NVFP4 | 27,3B | 256K | Apache-2.0 | NVFP4 | Cuantización de 4 bits para Blackwell |
| Qwen/Qwen3.8-27B | 27,3B | 256K | no disponible | safetensors | Modelo base sin el RL de RadixArk |

La comparación con alternativas de otros desarrolladores (por ejemplo, modelos densos de 27B en GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica la cuantización Q8_0; no hay opciones Q4, Q5 o Q6, lo que limita el despliegue en GPUs de 24 GB o menos.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de razonamiento entrenados con RL; no se han publicado evaluaciones de fiabilidad factual.
- Sesgos conocidos: no documentados en la información disponible.
- El modo de pensamiento está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- Requiere una versión concreta de llama.cpp (b12531 o posterior); versiones anteriores pueden no cargar los tensores SSM o la capa MTP correctamente.
- Licencia Apache-2.0 permite uso comercial, pero Xylolabs declara no estar afiliada ni respaldada por RadixArk ni Qwen; el aviso NOTICE debe conservarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad del artefacto.
- No se han publicado benchmarks de tareas para esta cuantización; las métricas de perplejidad no garantizan el rendimiento en tareas agénticas o de código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Versión FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Versión NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Licencia Apache-2.0: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF/blob/main/LICENSE
