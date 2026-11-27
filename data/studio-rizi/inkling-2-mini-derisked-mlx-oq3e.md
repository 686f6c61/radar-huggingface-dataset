# studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ3e

## Resumen

Inkling-2-Mini-Derisked-MLX-oQ3e es una conversión cuantizada en formato MLX del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, que a su vez es una modificación conductual del modelo original thinkingmachines/Inkling-2-Mini de Thinking Machines Lab. La conversión la publica el usuario studio-rizi mediante oMLX, la herramienta de cuantización y runtime para Apple Silicon desarrollada por jundot, y está pensada específicamente para su ejecución en hardware de Apple (chips de la serie M).

El modelo base es un transformer con arquitectura `inkling2_loop` (looped multimodal MoE) con aproximadamente 26.400 millones de parámetros totales y una ventana de contexto declarada de 1 millón de tokens. La variante "Derisked" de Blackfrost aplica una modificación a nivel de pesos —ortogonalización por consenso de columnas sobre la proyección de salida de atención `attn.wo_ud.weight` en las capas físicas 9 a 18— para reducir los rechazos falsos ante peticiones seguras manteniendo un suelo de rechazo ante peticiones claramente dañinas. Es, por tanto, un artefacto de investigación conductual, no un modelo de producción genérico.

Esta conversión concreta aplica cuantización mixta oQ3e (3 bits afín, grupo 64, ponderada por imatrix) preservando los expertos enrutados de las capas 0-19 en su formato NVFP4 original, los de las capas 20-23 en MXFP8/BF16 y el borrador DSpark MTP para decodificación especulativa. El resultado ocupa 13,0 GB en tres shards más 0,64 GB del borrador. Es relevante para quienes quieran evaluar el comportamiento "derisked" en Mac sin depender de GPUs NVIDIA, aunque requiere oMLX 0.8.4 o superior y no es cargable con `mlx-lm` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` — MoE multimodal con bucles (looped multimodal MoE) |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M, según model card) |
| Tipos de cuantizacion | oQ3e: 3 bits afín (grupo 64) con protección de precisión en tensores sensibles; expertos de capas 0-19 en NVFP4, capas 20-23 en MXFP8/BF16; borrador MTP DSpark preservado |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 (heredada del upstream Inkling-2-Mini) |
| Formato de pesos | safetensors (layout oQ nativo de oMLX), 3 shards + `mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es `inkling2_loop`, descrita por el autor como un MoE multimodal con bucles: un transformer con mezcla de expertos cuyos bloques se reaplican en varias pasadas (loop passes), lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Incluye 422 tensores de visión, por lo que funciona como modelo visión-lenguaje (VLM). Dispone además de un cabezal de predicción multi-token (MTP) denominado DSpark, utilizado para decodificación especulativa en oMLX Lightning.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. La modificación "Derisked" de Blackfrost no reentrena el modelo: altera los pesos de `attn.wo_ud.weight` en las capas físicas 9-18 mediante ortogonalización por consenso de columnas (alpha 2,5), manteniendo intacta la estructura de pasadas del bucle. La verificación publicada indica que 1234 de 1244 tensores son idénticos byte a byte al checkpoint original de Thinking Machines Lab, y solo difieren los 10 tensores documentados de `attn.wo_ud.weight`. Esta conversión parte de ese checkpoint verificado y aplica una recuantización mixta con calibración sobre `oqe_code_multilingual` (577 muestras a 512 tokens, adaptativa).

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Comprensión de imágenes: al conservar los 422 tensores de visión, opera como modelo image-text-to-text mediante oMLX o mlx-vlm.
- Razonamiento y generación de código: la calibración se realizó sobre un dataset multilingüe de código, lo que sugiere uso previsto en tareas de programación, aunque no se documentan benchmarks.
- Decodificación especulativa MTP: el borrador DSpark preservado permite acelerar la generación en oMLX Lightning.
- Contexto largo: ventana declarada de 1M tokens, adecuada para documentos extensos o repositorios completos.
- Reducción de rechazos falsos: la modificación Derisked busca que el modelo no rechace peticiones ordinarias y seguras, manteniendo el rechazo ante peticiones claramente dañinas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Evaluación conductual en investigación: comparar las tasas de rechazo falso entre este checkpoint Derisked y el Inkling-2-Mini original sobre un conjunto de peticiones seguras, aprovechando que solo difieren 10 tensores y el resto es idéntico byte a byte.
- Inferencia local en Apple Silicon: desplegar un VLM de ~26,4 mil millones de parámetros en un Mac con chip M-series mediante `omlx serve`, sirviendo una API compatible con OpenAI en `127.0.0.1:8000`.
- Análisis de documentos largos con imagen: procesar PDFs escaneados o capturas con texto asociado en una sola pasada gracias a la ventana de 1M tokens, combinando OCR visual y razonamiento textual.
- Asistencia de código en local: usar la calibración orientada a código multilingüe para autocompletado y explicación de fragmentos en entornos sin GPU NVIDIA, con la ventaja de privacidad de ejecución en el dispositivo.
- Prototipado de asistentes en inglés y japonés: construir demos conversacionales bilingües para mercados japonés e internacional, validando el comportamiento de rechazo antes de integrar en un producto.
- Investigación sobre seguridad y alineamiento: estudiar cómo una intervención de pesos en la proyección de salida de atención afecta a la política de rechazo, con el runbook `DWM_RECIPE/` del upstream como referencia de reproducción.
- Evaluación de cuantización mixta: medir la degradación de calidad de oQ3e frente al checkpoint BF16/NVFP4 original en tareas de código y visión, dado que los expertos de capas 0-19 conservan NVFP4 y los de 20-23 MXFP8/BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 13,0 GB para los tres shards del modelo más 0,64 GB del borrador DSpark (`mtp.safetensors`); el repositorio completo ocupa 13,7 GB.
- Memoria unificada estimada para inferencia: al menos ~14-16 GB libres para cargar pesos y el borrador; con caché KV para contexto largo, se recomienda 32 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon (chips de la serie M). No se documentan requisitos para GPU NVIDIA, AMD o CPU x86.
- GPU consumer NVIDIA: no aplicable directamente, ya que el checkpoint está en layout oQ de oMLX y no es cargable por `mlx-lm` estándar ni por runtimes CUDA convencionales.
- Despliegue: exclusivamente mediante oMLX 0.8.4 o superior (`omlx serve --model-dir ...`), con endpoint compatible con la API de chat completions de OpenAI. También puede usarse a través de mlx-vlm para la parte de visión.
- Latencia y throughput: no disponibles en la información proporcionada. La presencia del borrador MTP DSpark sugiere que la decodificación especulativa está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-MLX-oQ3e (este) | ~26,4 B | 1M | Texto + visión | Apache 2.0 | safetensors oQ, oMLX ≥0.8.4 |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible (mismo backbone) | 1M | Texto + visión | Apache 2.0 | safetensors, runtime estándar |
| thinkingmachines/Inkling-2-Mini | no disponible (mismo backbone) | 1M | Texto + visión | Apache 2.0 | safetensors, runtime estándar |
| studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ3e | ~26,4 B | 1M | Texto + visión | Apache 2.0 | safetensors oQ, oMLX ≥0.8.4 |

Las tres variantes comparten el mismo backbone `inkling2_loop` y la misma licencia; las diferencias son la modificación conductual (Derisked frente a original) y el formato de pesos (oQ3e MLX frente a safetensors sin cuantizar o en NVFP4/MXFP8 nativos). No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe como material para investigación controlada y evaluación interna; la salida del modelo debe tratarse como dato no confiable.
- No es una barrera de seguridad: el modelo no constituye un mecanismo de autorización, aplicación de políticas ni control de acceso; el operador es responsable del control de acceso, el cumplimiento y los mecanismos de seguridad del despliegue.
- Modificación conductual sobre un transformer con bucles: los comportamientos dependientes del bucle deben revalidarse en cada despliegue, ya que la intervención se aplicó sobre la estructura de pasadas.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de fidelidad; al ser un modelo de 26 B cuantizado a 3 bits en parte de sus tensores, es esperable cierta degradación frente al checkpoint original.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano u otros idiomas no está garantizado.
- Compatibilidad restringida: no es cargable con `mlx-lm` estándar ni con runtimes CUDA; requiere oMLX 0.8.4 o superior, lo que limita su portabilidad.
- Cuantización agresiva: los expertos enrutados de capas 0-19 conservan NVFP4 y los de 20-23 MXFP8/BF16, pero la base es de 3 bits con grupo 64; conviene validar la calidad en tareas sensibles antes de uso productivo.
- Licencia: Apache 2.0 heredada, pero el autor remite a los términos y avisos del modelo upstream antes de redistribuir o desplegar; conviene revisar dichos términos.
- Conversión no oficial: no está afiliada a Thinking Machines Lab ni a Blackfrost-AI, por lo que no hay soporte oficial.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ3e
- Modelo base Derisked: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Perfil del autor de la conversión: https://huggingface.co/studio-rizi
- Perfil de Blackfrost-AI: https://huggingface.co/Blackfrost-AI
- Perfil de Thinking Machines Lab: https://huggingface.co/thinkingmachines
