# WamphyreAI/LiquidVamp-R4-1.7B

## Resumen

LiquidVamp-R4-1.7B es un modelo de lenguaje experimental de aproximadamente 1.700 millones de parámetros publicado por WamphyreAI, derivado por fine-tuning del checkpoint abliterated `orcarouter/LFM3-1.7B-abliterated`, que a su vez procede de la familia LFM3 de Liquid AI. El modelo conserva la arquitectura, el vocabulario y la plantilla conversacional originales de LFM3, e incorpora ediciones directas de pesos a nivel neuronal (columnas de proyección y pesos FFN) junto con un post-entrenamiento supervisado mediante LoRA cuyas respuestas sintéticas fueron generadas por GLM-5.3-Flash como profesor. El adaptador LoRA está fusionado en los pesos publicados.

El objetivo declarado del proyecto es mejorar las capacidades de código, razonamiento y uso de herramientas sobre la base abliterated, manteniendo un despliegue local de contexto largo. El modelo está configurado para una ventana total de 131.072 tokens (128K), compartida entre prompt, historial, razonamiento opcional y salida, con un presupuesto de generación de 16.384 tokens. El backend validado localmente es llama.cpp b12179 con Vulkan/RADV sobre una AMD Radeon RX 6600 de 8 GB, con decodificación especulativa n-gram mediante `ngram-mod`.

La relevancia actual radica en dos aspectos: por un lado, es un ejemplo de pipeline de post-entrenamiento de bajo coste (una época, 101 pasos, GPU Tesla T4 en FP32) sobre un modelo pequeño; por otro, documenta de forma inusualmente transparente tanto las ganancias como las regresiones de la iteración respecto a su predecesor R3, incluyendo la advertencia de que la evaluación es local y no constituye un benchmark externo estándar. El modelo se declara explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia Liquid AI), transformer; código de arquitectura incluido en el repo (`trust_remote_code=True`) |
| Parametros totales | 1.728.801.536 (aprox. 1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens totales (128K), compartidos entre prompt, historial, razonamiento y salida; presupuesto de salida configurado de 16.384 tokens |
| Tipos de cuantizacion | BF16 GGUF publicado (tensores F32 heredados preservados); otras cuantizaciones no documentadas |
| Idiomas soportados | en, es |
| Licencia | LFM Open License v1.0 (campo `license: other`, `license_name: lfm-open-license-v1.0`) |
| Formato de pesos | safetensors (checkpoint completo fusionado, bf16) y GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM3 de Liquid AI, conservando vocabulario y plantilla conversacional originales; el repo incluye el código de arquitectura necesario para cargarlo con Transformers mediante `trust_remote_code=True`. La base inmediata es `orcarouter/LFM3-1.7B-abliterated`, un checkpoint abliterated del que LiquidVamp hereda la eliminación de rechazos "out of the box". Sobre esa base, WamphyreAI aplicó ediciones directas de pesos a nivel de neuronas y columnas de proyección (revisiones experimentales previas, incluida R3), seguidas de un post-entrenamiento supervisado con LoRA.

El post-entrenamiento R4 usó GLM-5.3-Flash como profesor de datos sintéticos: 2.163 ejercicios únicos, divididos en 1.362 de entrenamiento, 413 de validación y 388 held-out, con 1.611 filas balanceadas por época. Se entrenaron 9.999.872 parámetros LoRA durante 1 época y 101 pasos en FP32 sobre una NVIDIA Tesla T4, con objetivo de pérdida calculado únicamente sobre respuestas del asistente y llamadas a herramientas. La pérdida media de entrenamiento fue 0,63194 y la pérdida final de validación 0,53692. La fusión del adaptador actualizó 142 proyecciones, mientras que los otros 145 tensores GGUF conservaron sus valores previos de forma exacta. El despliegue local validado incorpora decodificación especulativa n-gram (`ngram-mod`) con coincidencia de 24 tokens y propuestas de borrador de 8 a 16 tokens.

## Capacidades

- Generación de texto conversacional en inglés y español, con plantilla de conversación LFM3.
- Código: el post-entrenamiento se orientó explícitamente a programación; en la evaluación local, los fallos de Python held-out con errores de sintaxis o indentación cayeron de 45 a 1 entre R3 y R4.
- Razonamiento: batería held-out de reasoning con 112/129 aciertos en R4 (frente a 108/129 en R3).
- Uso de herramientas (tool use / function calling): 201/201 en pruebas held-out con observaciones simuladas, tanto en R3 como en R4.
- Soporte de contexto largo: ventana configurada de 128K tokens, con servicio inicializado y interacción básica de API verificadas a esa longitud.
- Modo abliterated: la base upstream elimina mecanismos de rechazo, lo que afecta al comportamiento del modelo en solicitudes sensibles.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" explícito: no disponible como función documentada; la ventana incluye "razonamiento opcional" según la model card, sin más detalle.

## Casos de uso

- Asistencia de código en local: el modelo puede generar y formatear código Python de forma ejecutable, con una mejora medida en la tasa de errores de sintaxis/indentación (de 45 a 1 fallos en held-out), lo que lo hace adecuado para entornos de desarrollo con GPU de consumo.
- Automatización de llamadas a herramientas: soporta tool use y obtuvo 201/201 en pruebas held-out con observaciones simuladas, por lo que encaja en pipelines de agentes que encadenan funciones externas.
- Despliegue en hardware de consumo: validado en llama.cpp con Vulkan sobre una AMD RX 6600 de 8 GB, lo que permite inferencia local en equipos sin GPU NVIDIA.
- Conversaciones de contexto largo: la ventana de 128K permite mantener historiales extensos o analizar documentos largos en una sola sesión, aunque la calidad a plena ventana no está medida.
- Prototipado rápido de asistentes bilingües inglés/español: los dos idiomas declarados cubren casos de atención al usuario en ambos idiomas con un solo checkpoint.
- Experimentación e investigación sobre post-entrenamiento: el repo documenta splits, hiperparámetros, pérdidas y comparación pareada con R3, lo que lo convierte en material útil para estudiar el efecto de LoRA y ediciones neuronales en modelos de 1,7B.
- Generación de datos sintéticos o aumento de dataset en pipelines internos, dado el bajo coste de inferencia de un modelo de 1,7B en BF16/GGUF.

## Benchmarks y rendimiento

Evaluación local del autor sobre una batería de 436 ejercicios, con contexto de 8.192 tokens (no a plena ventana de 128K). Los datos comparan R4 con la revisión predecesora modificada R3; la base OrcaRouter sin tocar no fue evaluada en esta batería.

| Test | Predecesor R3 | LiquidVamp R4 |
|---|---|---|
| Held-out global | 318/388 (81,96%) | 357/388 (92,01%) |
| Held-out Python | 9/58 | 44/58 |
| Held-out reasoning | 108/129 | 112/129 |
| Held-out tools (observaciones simuladas) | 201/201 | 201/201 |
| Tareas de transferencia nuevas | 14/32 | 13/32 |
| Batería local completa | 343/436 | 382/436 |

El balance pareado fue de 56 mejoras y 17 regresiones. Los resultados agregados de JavaScript cayeron de 3/5 a 1/5. No se han publicado resultados en benchmarks externos estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint safetensors en bf16 ocupa aproximadamente 3,4 GB de pesos (1,73B parámetros a 2 bytes), más overhead de activaciones y caché KV; el repo completo pesa 6,9 GB por incluir también el GGUF BF16.
- GPU validadas por el autor: AMD Radeon RX 6600 de 8 GB con Vulkan/RADV en Ubuntu; entrenamiento realizado en NVIDIA Tesla T4.
- GPU consumer: cabe en GPUs de 8 GB en BF16/GGUF; no se documentan requisitos para contexto completo de 128K, que elevaría considerablemente el uso de memoria por caché KV.
- Opciones de despliegue: llama.cpp (versión b12179 validada) con backend Vulkan; Transformers con `trust_remote_code=True`; otros runtimes compatibles con GGUF no verificados en la model card.
- Latencia y throughput: no disponible. El autor indica que los resultados de evaluación no establecen calidad ni throughput en una conversación completa de 128K.
- Decodificación especulativa: `ngram-mod` con coincidencia de 24 tokens y borradores de 8-16 tokens, configurada en el despliegue local validado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LiquidVamp-R4-1.7B | ~1,7B | 128K (configurado) | LFM Open License v1.0 | Experimental, abliterated, fine-tune LoRA con profesor GLM-5.3-Flash |
| orcarouter/LFM3-1.7B-abliterated | ~1,7B | no disponible en la información | no disponible en la información | Base upstream abliterated; no evaluada en la batería local del autor |
| LFM3 (familia original de Liquid AI) | ~1,7B (variante de la familia) | no disponible en la información | LFM Open License v1.0 (heredada) | Modelo original sin modificaciones de WamphyreAI |
| Predecesor R3 (WamphyreAI) | ~1,7B | no disponible en la información | LFM Open License v1.0 (heredada) | Revisión experimental previa; 343/436 en la batería local frente a 382/436 de R4 |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes del mismo tamaño (por ejemplo, variantes de 1-2B de otras familias), por lo que no se incluyen datos de rendimiento cruzado.

## Limitaciones y advertencias

- Modelo declarado explícitamente como experimental; no debe tratarse como un checkpoint listo para producción sin validación propia.
- La base es abliterated: se eliminan mecanismos de rechazo, lo que aumenta el riesgo de generar contenido sensible o inapropiado y complica el cumplimiento de políticas de contenido.
- La evaluación es local (436 ejercicios, contexto de 8.192 tokens) y no un benchmark externo estándar; las familias de ejercicios relacionadas limitan la independencia de las muestras.
- La transferencia a tareas nuevas no mejoró (14/32 en R3 frente a 13/32 en R4) y JavaScript empeoró (3/5 a 1/5), lo que sugiere sobreajuste parcial al formato de entrenamiento.
- Las observaciones de herramientas en held-out fueron simuladas, no ejecuciones reales de APIs.
- La calidad y el throughput a plena ventana de 128K no están medidos; solo se verificaron la inicialización del servicio y la interacción básica de API.
- Riesgo de alucinación: no cuantificado en la información disponible; propio de modelos pequeños de 1,7B.
- Idiomas limitados a inglés y español; rendimiento en otros idiomas no documentado.
- Licencia LFM Open License v1.0: deben revisarse sus términos para uso comercial; la model card remite a `LICENSE` y `NOTICE.txt` para las condiciones exactas y las atribuciones (WamphyreAI, OrcaRouter, Liquid AI, GLM-5.3-Flash).
- La carga con Transformers requiere `trust_remote_code=True` por el código de arquitectura incluido, lo que implica ejecutar código del repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Especificación técnica: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B/blob/main/TECHNICAL_SPEC.md
- Resumen de entrenamiento (JSON): https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B/blob/main/training_summary.json
- Hashes de los archivos: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B/blob/main/LICENSE
- Avisos y atribuciones: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B/blob/main/NOTICE.txt
