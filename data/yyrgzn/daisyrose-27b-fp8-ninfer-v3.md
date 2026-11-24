# yyrgzn/DaisyRose-27B-FP8-NInfer-v3

## Resumen
DaisyRose-27B-FP8-NInfer-v3 es un artefacto de inferencia publicado por el usuario yyrgzn para el motor NInfer, construido a partir del checkpoint oficial RadixArk/DaisyRose-27B-FP8. DaisyRose-27B es el primer modelo de RadixArk: un modelo multimodal de razonamiento derivado de Qwen3.8-27B mediante aprendizaje por refuerzo exclusivamente, sin ajuste supervisado ni destilación. El artefacto no es un checkpoint de Transformers ni una distribución Safetensors o GGUF, sino un contenedor propietario del motor NInfer (28,20 GiB, 1.126 objetos) que empaqueta las torres de texto, visión, MTP y DFlash2 con esquemas de cuantización heterogéneos.

La relevancia de esta ficha radica en que muestra el patrón de distribución de pesos optimizado para un runtime concreto: FP8 E4M3 con escala por fila para las proyecciones de texto, BF16 íntegro para la torre de visión y las compuertas GDN, Q8 group-32 para MTP y Q4/Q5/Q6 group-64 para el módulo de decodificación especulativa DFlash2. El modelo conserva la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, además de su contexto de 256K tokens y su comprensión de imágenes, por lo que se plantea como sustituto directo del modelo base.

El interés técnico está en el proceso de conversión: el checkpoint original usa cuantización por bloques de 128×128 con `weight_scale_inv` en BF16, y el conversor lo reescala a una escala BF16 por fila de salida con precisión verificada bit a bit frente a un oráculo independiente. El error relativo L2 resultante (2,6–2,9%) se sitúa en el suelo de ruido del propio formato E4M3.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer multimodal con torre de visión, MTP y DFlash2) |
| Parametros totales | 27B (heredados de Qwen3.8-27B; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala BF16 por fila (texto), BF16 (visión y compuertas GDN), Q8 group-32 (MTP), Q4/Q5/Q6 group-64 (DFlash2), FP32/INT32 (control) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario NInfer v3, 30.275.059.200 bytes / 28,20 GiB) |

## Arquitectura y entrenamiento
El modelo base DaisyRose-27B parte de Qwen3.8-27B y conserva su arquitectura, tokenizador y plantilla de chat. Incluye una torre de visión en BF16 completo, proyecciones de texto con atención completa y capas GDN (gated delta network) cuyas proyecciones de compuerta `a`/`b` se mantienen en BF16 directo por no ser aptas para FP8 por fila, además de un módulo MTP (multi-token prediction) y el módulo de decodificación especulativa DFlash2. El entrenamiento se realizó exclusivamente con aprendizaje por refuerzo, sin SFT ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo con sesiones de hasta 1M tokens, durante 18 días en 144 GPU H200.

La conversión a NInfer es el elemento técnico distintivo: el checkpoint fuente almacena las proyecciones lineales como códigos E4M3 con una rejilla `weight_scale_inv` BF16 por bloque de 128×128; el conversor decodifica cada bloque en FP32 (donde mantisa E4M3 por escala BF16 es exacta) y recodifica con una escala BF16 por fila de salida (`fp8_row_maxabs`). La verificación reporta coincidencia dentro del límite teórico `|v|·(2⁻⁴ + 2⁻⁹ + 2⁻¹⁰) + scale·2⁻¹⁰` en todas las filas muestreadas, L2 relativo de 2,6–2,9% atribuible al ruido inherente de E4M3, `a_projection` GDN bit-exacta en BF16 y ausencia de NaN. La plantilla de chat (`qwen3_8.jinja`) añade extensiones de sistema posicional, continuación final del asistente y eliminación de turnos de herramienta; por defecto activa thinking con esfuerzo `xhigh` y retención del razonamiento en turnos cerrados.

## Capacidades
- Generación de texto y razonamiento multimodal (entrada image-text-to-text).
- Comprensión de imágenes mediante torre de visión en BF16 completo.
- Razonamiento de horizonte largo orientado a agentes, entrenado con RL sobre tareas de terminal y sesiones de hasta 1M tokens.
- Decodificación especulativa mediante DFlash2 y predicción multi-token (MTP) para acelerar la generación.
- Modo thinking configurable con nivel de esfuerzo (`xhigh` por defecto) y retención del razonamiento en turnos cerrados.
- Plantilla de chat compatible con Qwen3.8-27B, incluyendo extensiones para sistema posicional y turnos de herramienta.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte explícito de tool calling y function calling: no confirmado en la documentación disponible.

## Casos de uso
- Automatización de tareas de terminal y agentes de línea de comandos: el modelo fue entrenado con RL sobre tareas de agente de horizonte largo y eleva Terminal Bench 4.1 pass@1 de 5,6 a 12,0, por lo que encaja en pipelines de ejecución de comandos con supervisión.
- Asistentes de razonamiento con contexto masivo: la ventana de 256K tokens permite procesar repositorios completos, expedientes o transcripciones extensas en una sola pasada sin troceado.
- Análisis de documentos con imágenes: la torre de visión en BF16 admite entradas image-text-to-text para extraer información de capturas, diagramas o formularios junto al texto.
- Despliegue en estaciones de trabajo con GPU de consumo: el artefacto está etiquetado para RTX 4090 y RTX Pro 6000, lo que habilita prototipado local de agentes con FP8 sin infraestructura de centro de datos.
- Servicio de inferencia de baja latencia: la combinación de FP8 E4M3, MTP y decodificación especulativa DFlash2 está pensada para reducir el coste por token en el motor NInfer.
- Evaluación de técnicas de cuantización: el artefacto sirve como referencia reproducible para comparar conversión por bloques frente a escala por fila con verificación bit a bit.

## Benchmarks y rendimiento
| Benchmark | DaisyRose-27B | Modelo base (Qwen3.8-27B) |
|---|---|---|
| Terminal Bench 4.1 (pass@1) | 12,0 | 5,6 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

## Requisitos de hardware
- VRAM estimada: el artefacto ocupa 28,20 GiB en disco; la inferencia requiere al menos esa cantidad más overhead de activaciones y caché KV para 256K tokens, no cuantificado en la documentación.
- GPU recomendadas según el autor: RTX 4090 y RTX Pro 6000 (etiquetas del repositorio).
- Entrenamiento de referencia: 144 GPU H200 durante 18 días (no aplicable a inferencia).
- Cabe en GPU de consumo: sí, según las etiquetas del autor, en RTX 4090 y RTX Pro 6000.
- Opciones de despliegue: exclusivamente el motor NInfer (librería `ninfer`); no es compatible con Transformers, vLLM, llama.cpp, Ollama ni TGI al no distribuirse en Safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-FP8-NInfer-v3 | 27B | 256K | `.ninfer` (NInfer) | apache-2.0 | RL puro, multimodal, MTP y DFlash2 |
| Qwen3.8-27B | 27B | 256K | Safetensors | no disponible en la información | Modelo base; DaisyRose lo sustituye de forma directa |
| RadixArk/DaisyRose-27B-FP8 | 27B | 256K | Safetensors FP8 por bloques 128×128 | apache-2.0 | Checkpoint fuente de esta conversión |
| RadixArk/DaisyRose-27B | 27B | 256K | Safetensors | apache-2.0 | Versión sin cuantizar del mismo modelo |

## Limitaciones y advertencias
- El artefacto solo funciona con el motor NInfer; no es un checkpoint de Transformers, Safetensors ni GGUF y no puede cargarse en ecosistemas estándar.
- El repositorio declara `inference: false` en los metadatos, lo que puede indicar que la carga automática no está habilitada o que el artefacto requiere configuración manual.
- El rendimiento en agentes es modesto en términos absolutos: Terminal Bench 4.1 pass@1 de 12,0 implica que la mayoría de tareas siguen fallando sin intervención humana.
- Entrenado exclusivamente con RL sobre unas 1.200 tareas, sin SFT ni destilación: mayor riesgo de comportamientos fuera de distribución en dominios no cubiertos por ese conjunto.
- La cuantización FP8 E4M3 introduce un error L2 relativo de 2,6–2,9% frente al checkpoint fuente; aceptable para uso general pero relevante en tareas numéricas sensibles.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de la del modelo base.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; deben evaluarse antes de producción.
- Licencia apache-2.0 permite uso comercial, pero las condiciones de los modelos base (Qwen3.8-27B y DaisyRose-27B) deben verificarse por separado.
- Creado y actualizado en noviembre de 2026, con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/yyrgzn/DaisyRose-27B-FP8-NInfer-v3
- Modelo base DaisyRose-27B: https://huggingface.co/RadixArk/DaisyRose-27B
- Checkpoint fuente FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de chat qwen3_8.jinja: https://github.com/Neroued/ninfer/blob/98dada0e03cb073fd07f905400b5904bc6e82759/tools/chat_templates/qwen3_8.jinja
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
