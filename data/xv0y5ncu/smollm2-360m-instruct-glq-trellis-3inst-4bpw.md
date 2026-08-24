# xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-4bpw

## Resumen

Este modelo es una cuantizacion de SmolLM2-360M-Instruct, un modelo de lenguaje compacto de 360 millones de parametros desarrollado por Hugging Face, realizada con la libreria GLQ sobre el formato trellis (TCQ). La cuantizacion a 4 bits por peso reduce el footprint de memoria a 0,24 GiB y permite ejecutar el modelo en hardware de borde y dispositivos con recursos limitados, manteniendo una perplejidad en wikitext-2 de 13,085 frente a los 12,735 del modelo bf16 original, una degradacion de solo el 2,7 %.

El autor, xv0y5ncu, ha publicado una escalera de cuatro cuantizaciones (3, 4, 5 y 6 bits por peso) del mismo modelo base, y esta ficha corresponde al peldaño de 4 bits, la variante 3INST sin lookup, con tasa uniforme en todas las capas. Las mediciones se realizaron en una sola sesion sobre una RTX PRO 6000 Blackwell con vLLM 0.27.1 y glq 0.8.8, obteniendo 303 tokens/s en decodificacion con batch de 1 y 6.478 tokens/s agregados con batch de 32.

La relevancia de este modelo radica en que demuestra que es posible ejecutar un modelo de 360M con calidad cercana a la original en menos de 0,25 GiB de memoria, lo que abre el despliegue en entornos con GPU de gama baja, moviles y sistemas embebidos. Ademas, al ser una cuantizacion de un modelo de licencia Apache-2.0, puede usarse comercialmente sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM2-360M-Instruct) |
| Parametros totales | 126.434.240 en safetensors cuantizados (el modelo base tiene 360M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (las mediciones de perplejidad usaron seqlen 2048) |
| Tipos de cuantizacion | 4 bits/peso con trellis TCQ, variante 3INST, tasa uniforme |
| Idiomas soportados | no disponible (el modelo base se entrena principalmente con datos en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria trellis) |

## Arquitectura y entrenamiento

El modelo base, SmolLM2-360M-Instruct, es un transformer decoder-only entrenado sobre 4 billones de tokens con una combinacion de datasets como FineWeb-Edu, DCLM y The Stack. La version instruct se obtuvo mediante fine-tuning supervisado (SFT) con datasets publicos y propios, seguido de optimizacion por preferencias directas (DPO) sobre el dataset UltraFeedback. El modelo resultante soporta tareas de reescritura de texto, resumen y, en la version de 1.7B, function calling.

La cuantizacion de este checkpoint se ha realizado con GLQ, una libreria de cuantizacion para vLLM, utilizando un codebook trellis (TCQ) de estilo QTIP en su variante 3INST (lookup-free, sin tabla de busqueda), a 4 bits por peso con tasa uniforme en todas las capas. El proceso de cuantizacion se ejecuto con 128 muestras y una secuencia de 2048 tokens, y las mediciones de perplejidad se hicieron a traves de vLLM, no con el pipeline de Hugging Face Transformers, que no esta validado para este checkpoint.

## Capacidades

- Generacion de texto y completado de conversaciones multi-turno con chat-template, validado en pruebas de humo con vLLM.
- Instruccion y razonamiento basico, heredado del modelo base SmolLM2-360M-Instruct.
- Reescritura de texto y resumen, gracias al fine-tuning SFT sobre datasets de Argilla.
- Function calling soportado en el modelo base de 1.7B, no confirmado para la variante de 360M.
- Inferencia eficiente con bajo uso de memoria (0.24 GiB de pesos), apta para entornos con VRAM limitada.
- Compatible con el ecosistema vLLM mediante la integracion de GLQ (glq >= 0.8.8).
- No dispone de capacidades multimodales (vision, audio) ni modo de pensamiento explicito.

## Casos de uso

- Inferencia en dispositivos de borde: con 0.24 GiB de pesos, el modelo puede ejecutarse en GPU de baja potencia o incluso en CPU con aceleracion, permitiendo asistentes conversacionales locales sin conexion a la nube.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno y de licencia Apache-2.0, es ideal para validar ideas de producto sin invertir en infraestructura costosa.
- Despliegue en entornos de produccion con latencia critica: con un TTFT de 16 ms y 303 tokens/s en batch de 1, puede responder en tiempo real en sistemas de atencion al cliente o chatbots integrados.
- Generacion de texto en aplicaciones moviles: el tamano reducido permite empaquetar el modelo en aplicaciones moviles para generacion de respuestas, resumen de noticias o asistentes de escritura.
- Fine-tuning sobre dominios especificos: la base de 360M es lo suficientemente pequena para fine-tunear con recursos moderados, y este checkpoint cuantizado sirve como punto de partida para despliegues posteriores.
- Evaluacion de tecnicas de cuantizacion: el modelo forma parte de una escalera de cuantizaciones (3, 4, 5 y 6 bits) que permite comparar el equilibrio entre calidad (perplejidad) y velocidad (tok/s) para elegir el punto optimo en cada caso de uso.

## Benchmarks y rendimiento

Las mediciones se realizaron en una sola sesion con una RTX PRO 6000 Blackwell, vLLM 0.27.1 y glq 0.8.8, con full CUDA graphs y chat-template de muestra. La perplejidad se midio en wikitext-2 con seqlen 2048 y 128 ventanas no solapadas, a traves de vLLM. No se ejecutaron evaluaciones de tareas (MMLU, HumanEval, etc.) en este tamano de modelo.

| Metrica | bf16 (referencia) | 6 bpw | 5 bpw | 4 bpw (este modelo) | 3 bpw |
|---|---|---|---|---|---|
| Pesos cargados | — | 0.31 GiB | 0.27 GiB | 0.24 GiB | 0.20 GiB |
| Perplejidad wikitext-2 | 12.735 | 12.755 (+0.16 %) | 12.834 (+0.78 %) | 13.085 (+2.7 %) | 14.173 (+11.3 %) |
| SQNR media de pesos | — | 33.20 dB | 27.67 dB | 22.04 dB | 16.19 dB |
| Decodificacion B=1 | — | 264 tok/s | 264 tok/s | 303 tok/s | 294 tok/s |
| Decodificacion B=32 (agregada) | — | 4.466 tok/s | 4.383 tok/s | 6.478 tok/s | 6.650 tok/s |
| TTFT B=1 | — | 16 ms | 16 ms | 16 ms | 16 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: 0.24 GiB de pesos cargados, mas overhead de contexto y CUDA; en la practica cabe en GPU de 4 GiB o menos.
- GPU recomendadas: la medicion se realizo en una RTX PRO 6000 Blackwell; cualquier GPU de consumo moderna (RTX 3060 o superior) deberia ser suficiente.
- Compatible con consumer GPUs: si, dado el tamano reducido, incluso en iGPUs integradas con aceleracion CUDA o Vulkan.
- Opciones de despliegue: vLLM con glq >= 0.8.8 (validado); el pipeline de Transformers no esta probado para este checkpoint.
- Latencia y throughput: TTFT de 16 ms a B=1, 303 tok/s a B=1 y 6.478 tok/s agregados a B=32 en la configuracion de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wikitext-2 | Velocidad B=1 | Licencia |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct (bf16) | 360M | no disponible | 12.735 | — | Apache-2.0 |
| SmolLM2-360M-Instruct-GLQ-trellis-6bpw | 360M (cuantizado) | no disponible | 12.755 | 264 tok/s | Apache-2.0 |
| SmolLM2-360M-Instruct-GLQ-trellis-5bpw | 360M (cuantizado) | no disponible | 12.834 | 264 tok/s | Apache-2.0 |
| SmolLM2-360M-Instruct-GLQ-trellis-4bpw (este modelo) | 360M (cuantizado) | no disponible | 13.085 | 303 tok/s | Apache-2.0 |
| SmolLM2-360M-Instruct-GLQ-trellis-3bpw | 360M (cuantizado) | no disponible | 14.173 | 294 tok/s | Apache-2.0 |

## Limitaciones y advertencias

- La perplejidad aumenta un 2,7 % respecto al modelo bf16; en el peldaño de 3 bits el incremento llega al 11,3 %, lo que puede afectar a tareas de razonamiento complejo.
- No se han ejecutado evaluaciones de tareas (MMLU, HumanEval, etc.) en este tamano de modelo; solo se midio perplejidad y velocidad.
- El camino de Hugging Face Transformers no esta probado para este checkpoint; la inferencia se valida exclusivamente con vLLM y glq >= 0.8.8.
- La perplejidad medida a traves de vLLM no es directamente comparable con mediciones de HF, por lo que no debe mezclarse con series de PPL de otras fuentes.
- El modelo base se entrena principalmente con datos en ingles; el rendimiento en otros idiomas puede ser limitado.
- El soporte de function calling esta confirmado en la version de 1.7B del modelo base, no en la de 360M.
- El modelo tiene riesgo de alucinaciones y sesgos propios de un modelo de 360M entrenado con datos de dominio general; se recomienda evaluacion especifica antes de usarlo en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-4bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Peldaño de 6 bpw: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-6bpw
- Peldaño de 5 bpw: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-5bpw
- Peldaño de 3 bpw: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3bpw
- Libreria GLQ: https://github.com/cnygaard/glq
- Paquete glq en PyPI: https://pypi.org/project/glq/
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Repositorio de SmolLM: https://github.com/huggingface/smollm
