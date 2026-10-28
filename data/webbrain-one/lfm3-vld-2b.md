# webbrain-one/lfm3-vld-2b

## Resumen

LFM3-VLD-2B (también referenciado en el código como `lfm3-vl-2b-vldr`) es un modelo multimodal de tipo image-text-to-text de 2.180.325.888 parámetros (~2,18 B), desarrollado por webbrain-one a partir de `LiquidAI/d1-2B`. Está especializado en decisiones de agente de navegador: dado un estado de página web (texto e imagen), el modelo debe decidir si una acción se ha completado, si no se ha completado o si el resultado es desconocido. Combina una arquitectura híbrida de 24 capas (convolución + atención GQA + feed-forward), torre de visión, proyector multimodal y embeddings heredados de `d1-2B`.

El problema que resuelve es concreto: el fine-tuning completo de `d1-2B` sobre tareas de decisión con embeddings de palabras atados (`tie_word_embeddings: true`) degrada la cabeza generativa, lo que produce repetición de tokens y prosa defectuosa en generación causal estándar. Mediante el método Pegasus, webbrain-one desata los embeddings e injerta la cabeza `lm_head.weight` original de `LiquidAI/LFM3-VL-2B` sobre el backbone entrenado en decisiones. El resultado declarado es generación abierta fluida sin artefactos de repetición, conservando la separabilidad de decisiones en los estados ocultos.

Es relevante ahora porque demuestra que un modelo de 2 B puede cubrir simultáneamente chat multimodal y decisión de agente, y porque se distribuye en formatos aptos para ejecución local: safetensors, GGUF para llama.cpp y un bundle ONNX con WebGPU pensado para correr dentro del navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: convolución + atención GQA + feed-forward, 24 capas; torre de visión y proyector multimodal |
| Parámetros totales | 2.180.325.888 (~2,18 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (original), GGUF Q8_0, Q4_K_M y mmproj-F16 (proyector de visión); ONNX decoder_q8f16 y decoder_q4f16 con vision_encoder_fp16 |
| Idiomas soportados | no disponible |
| Licencia | `lfm1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp), ONNX (WebGPU) |

## Arquitectura y entrenamiento

El backbone procede de `LiquidAI/d1-2B`: 24 capas híbridas que mezclan convoluciones, atención con query grouping (GQA) y bloques feed-forward, más una torre de visión, un proyector multimodal y los embeddings de entrada. Este backbone fue entrenado por el autor base sobre trayectorias de acciones de navegador, verificación y decisión. El modelo final mantiene esa arquitectura íntegra y sustituye únicamente la cabeza de lenguaje.

La intervención técnica del método Pegasus consiste en dos cambios: (1) desatar la cabeza de lenguaje de los embeddings de tokens (`tie_word_embeddings: false`) y (2) restaurar el `lm_head.weight` original de `LiquidAI/LFM3-VL-2B`, no corrompido por el fine-tuning de decisión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras).

La separabilidad de decisiones se explota mediante una sonda (probe) sobre los estados ocultos, no solo mediante generación de texto: el bundle ONNX incluye un runtime JavaScript específico para esa sonda.

## Capacidades

- Generación de texto causal en inglés y conversación multimodal abierta (imagen + texto), sin artefactos de repetición tras la restauración de la cabeza de lenguaje.
- Decisión categórica de agente de navegador: acción completada, no completada o desconocida.
- Verificación de acciones en modo zero-shot mediante prompt (`verify`), con menor rendimiento que la sonda.
- Extracción de señales de decisión desde los estados ocultos mediante sonda ligera (decision probe).
- Procesamiento de capturas de pantalla e imágenes junto a texto a través de la torre de visión.
- Formato conversacional con plantilla de chat (`apply_chat_template`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Agente de navegador autónomo: el modelo recibe el estado de la página (texto y captura) y decide si la acción previa se ha completado antes de encadenar el siguiente paso; encaja por su entrenamiento específico en trayectorias de decisión y su ventana multimodal.
- Verificación de pipelines de automatización web: actuaría como comprobador de cada paso (formulario enviado, compra confirmada, login correcto) con la etiqueta de "completado / no completado / desconocido", reduciendo falsos positivos en flujos RPA.
- Ejecución local con privacidad: al existir GGUF Q4_K_M y ONNX q4f16, puede ejecutarse en el propio equipo del usuario dentro de una extensión de navegador, de modo que las páginas no salgan de la máquina.
- Chat multimodal de asistencia: responder preguntas sobre una imagen o captura manteniendo conversación multi-turno, gracias a la cabeza de lenguaje restaurada.
- Clasificador ligero de decisiones en producción: usar la sonda sobre estados ocultos como cabecera de bajo coste en lugar de depender de la generación de texto, que rinde peor en modo zero-shot (67,5 % frente a 91,3 % con sonda).
- Asistente de accesibilidad web: interpretar la captura de pantalla y describir o confirmar el resultado de una interacción para usuarios con dificultades visuales.
- Enrutado de acciones en sistemas multiagente: decidir si se delega o se da por terminada una subtarea antes de invocar al siguiente agente.
- Prototipado rápido en el navegador: el bundle ONNX con WebGPU permite validar la lógica de decisión sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al benchmark propio del autor, `d1 Balanced Decision Benchmark` (`final_test`, 126 decisiones categóricas), no a benchmarks académicos estándar.

| Modelo / método | Precisión | Completion found | False completions | Unknown recognized |
|---|---:|---:|---:|---:|
| LFM3-VLD-2B (decision probe) | 115/126 (91,3 %) | 24/24 (100 %) | 0/48 (0 %) | 24/24 (100 %) |
| LFM3-VLD-2B (`verify` zero-shot) | 85/126 (67,5 %) | 22/24 (91,7 %) | 0/48 (0 %) | 0/24 (0 %) |
| LFM3-VL-2B-VLD (LoRA distillation) | 126/126 (100,0 %) | 24/24 (100 %) | 0/48 (0 %) | 24/24 (100 %) |
| `LiquidAI/LFM3-VL-2B` base (`verify` zero-shot) | 106/126 (84,1 %) | 24/24 (100 %) | 0/48 (0 %) | 4/24 (16,7 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 5-6 GB, considerando los ~4,4 GB de pesos más caché KV y overhead de activaciones.
- VRAM estimada en Q8_0: aproximadamente 2,5-3 GB.
- VRAM estimada en Q4_K_M o ONNX q4f16: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070) para BF16; tarjetas de 4-6 GB (GTX 1650 Super, RTX 3050) suficientes con Q4. A100/H100 no son necesarias por tamaño, aunque pueden usarse para servir en lote.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas, y el bundle ONNX q4f16 está pensado para WebGPU en el navegador.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, llama.cpp mediante los GGUF del repositorio compañero, y ONNX Runtime con WebGPU. No se confirma soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en d1 balanced | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webbrain-one/lfm3-vld-2b | 2,18 B | no disponible | 91,3 % (sonda) / 67,5 % (zero-shot) | lfm1.0 | HuggingFace, GGUF, ONNX |
| LiquidAI/LFM3-VL-2B (base) | ~2 B | no disponible | 84,1 % (verify zero-shot en la misma prueba) | lfm1.0 | HuggingFace |
| LiquidAI/d1-2B (backbone) | ~2 B (por nombre) | no disponible | no disponible como sonda en la información dada | lfm1.0 | HuggingFace |
| LFM3-VL-2B-VLD (LoRA distillation) | ~2 B | no disponible | 100 % (126/126) | no disponible | no disponible |

Como referencia externa, el blog de WebBrain compara `LFM3-VL-2B` con WebBrain Compass VLD Tiny v5 (un fine-tune de MiniCPM-V-4.7-1B) sobre 4.857 tareas de BenchKit, con victoria de LFM3 en seis de nueve suites. El método Pegasus se inspira en `AveLabs/Qwen3.8-27B-Perplexing-Pegasus`, un modelo de 27 B no comparable por tamaño.

## Limitaciones y advertencias

- El único benchmark disponible es propiedad del autor y está centrado en decisiones de navegador; no hay evidencia independiente ni resultados en MMLU, HumanEval o GSM8K.
- El 100 % de la variante LoRA distillation sugiere evaluación en distribución o posible filtración del conjunto de prueba; no debe interpretarse como superioridad general.
- La cifra de 91,3 % depende de la sonda sobre estados ocultos; en uso puramente textual (zero-shot `verify`) cae al 67,5 % y no reconoce ningún caso "desconocido" (0/24).
- No se documentan los idiomas soportados; se desconoce el comportamiento fuera del inglés.
- No se documenta la longitud de contexto, dato crítico para páginas largas o conversaciones multi-turno.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y añade riesgo de cadena de suministro en producción.
- La licencia `lfm1.0` está marcada como `other`; es necesario revisar los términos de Liquid AI antes de un uso comercial.
- Riesgo de alucinación inherente a la generación abierta; la restauración de la cabeza reduce la repetición, no la falsedad factual.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos o lingüísticos.
- El repositorio tiene 0 descargas y 13 likes en el momento de la ficha, con validación externa muy limitada.
- Existe una inconsistencia de nombres entre el ID del repositorio (`lfm3-vld-2b`) y el usado en el código de ejemplo (`lfm3-vl-2b-vldr`), lo que puede provocar errores de carga.
- No se confirma soporte en vLLM, TGI u Ollama; el despliegue en producción queda limitado a transformers, llama.cpp y ONNX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/lfm3-vld-2b
- GGUF (BF16, Q8_0, Q4_K_M, mmproj-F16): https://huggingface.co/webbrain-one/lfm3-vl-2b-vldr-gguf
- ONNX WebGPU (decoder_q8f16, decoder_q4f16, vision_encoder_fp16): https://huggingface.co/webbrain-one/lfm3-vl-2b-vldr-onnx
- Colección del autor: https://huggingface.co/collections/webbrain-one/lfm3-vld-2b
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Cabeza de lenguaje restaurada: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Inspiración del método Pegasus: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus
- WebBrain (agente de navegador open source): https://www.webbrain.one/
- Comparativa LFM3-VL-2B frente a WebBrain Compass VLD: https://www.webbrain.one/blog/lfm3-vl-2b-vs-webbrain-compass-vld
- Repositorio GitHub de WebBrain: https://github.com/webbrain-one/webbrain
