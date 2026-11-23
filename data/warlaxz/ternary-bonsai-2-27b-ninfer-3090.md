# WarlaxZ/Ternary-Bonsai-2-27B-NInfer-3090

## Resumen

Ternary Bonsai 2 27B NInfer 3090 es un artefacto de inferencia empaquetado en formato nativo `.ninfer` que contiene una versión ternaria del modelo Qwen3.8-27B, distribuida originalmente por Prism ML como GGUF y convertida por el autor WarlaxZ mediante el fork de NInfer para RTX 3090 mantenido en `ashalliants/ninfer-3090`. El modelo conserva tanto la torre de texto como la torre de visión del modelo original, además de cabezas auxiliares MTP y un adaptador DFlash2 para decodificación especulativa, todo orientado a ejecutarse en una única GPU consumer de 24 GB.

La propuesta principal es la eficiencia extrema en memoria y velocidad: los pesos del texto se almacenan en formato ternario `t2_g128_fp16` (valores -1, 0, +1 con una escala FP16 por cada 128 pesos, lo que equivale a 2,125 bits por peso), lo que reduce el peso en dispositivo a 6,70 GiB sin cabezas de drafter y 7,28 GiB con MTP, frente a los 14,6 GiB de la versión de 6 bits del mismo modelo. El repositorio ocupa 9,5 GB e incluye un único artefacto `bonsai2_27b.ninfer` de 8,87 GiB.

Es relevante ahora porque demuestra que un modelo multimodal de 27B puede servirse con contexto completo de 262.144 tokens en una RTX 3090, alcanzando velocidades de decodificación de hasta 297 tok/s con DFlash2 y más de 570 tok/s agregados con ocho peticiones concurrentes, algo que con cuantizaciones convencionales de 4-6 bits no es viable en esa misma tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer multimodal con torre de visión y cabezas MTP/DFlash2) |
| Parametros totales | 27B (según nombre y modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternaria `t2_g128_fp16` (2,125 bits/peso) para proyecciones de texto; Q4 para proyecciones del adaptador DFlash2; KV cache en `int8` o `rk4v4` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor versión 3, no compatible con Transformers, Safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer multimodal con torre de visión, del que se conservan tanto el text tower como el vision tower y los recursos de frontend. La conversión a ternario la realiza Prism ML en su build GGUF PQ2_0, que codifica cada peso como uno de tres valores (-1, 0, +1) acompañado de una escala FP16 por grupo de 128 pesos. Los pesos están rotados con Hadamard en el checkpoint, de modo que el runtime debe rotar las activaciones correspondientes (fusión aplicada en las operaciones que las producen). La receta de conversión deshace las convenciones del exportador de llama.cpp (orden de value-head en GDN, normas `1 + w`, `ssm_a`).

Sobre esa base, el artefacto incorpora dos cabezas entrenadas por ProCreations específicamente contra Bonsai 2: una cabeza MTP (multi-token prediction) y un adaptador DFlash2 para decodificación especulativa. Las proyecciones de feature, salida y MLP del adaptador se almacenan en Q4 porque, frente a un objetivo de 2,125 bits, el drafter supone una fracción grande de los bytes por paso de draft; según el autor, esto decodifica un 4,5% más rápido que un adaptador Q8 con longitud de aceptación de 3,97 frente a 4,00. También se incluye una cabeza de propuesta con las filas de los 131.072 tokens más frecuentes de la cabeza de salida ternaria, cargable opcionalmente con `--lm-head-draft`. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imágenes (pipeline `image-text-to-text`), heredada de la torre de visión de Qwen3.8-27B.
- Razonamiento y respuesta a instrucciones, con modo "thinking" desactivable mediante `--no-thinking`.
- Generación de código, demostrada en los benchmarks del autor con prompts de programación.
- Aritmética y tareas de cálculo, con velocidades de decodificación medidas en prompts aritméticos.
- Decodificación especulativa mediante MTP (3 drafts) y DFlash2 (7 drafts), que multiplican el throughput.
- Procesamiento de documentos largos: el autor reporta respuestas tras un documento de 245.373 tokens.
- Soporte de peticiones concurrentes con agregación de throughput (hasta 8 peticiones simultáneas medidas).
- No se dispone de información sobre tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Asistente conversacional local en una RTX 3090: el modelo cabe en 6,70-7,28 GiB de VRAM, dejando espacio para el contexto y permitiendo conversaciones multi-turno con KV cache en `int8` o `rk4v4` sin recurrir a la nube.
- Análisis de documentos extensos: con 262.144 tokens de contexto y 11,2 GiB libres en la tarjeta, se pueden procesar informes, contratos o bases de código completas en una sola pasada; el autor midió prefill de 1.070 tok/s sobre un documento de 245.373 tokens.
- Generación de código en estación de trabajo: los 297 tok/s con DFlash2 en un prompt de programación y los 437 tok/s en una respuesta de código lo hacen adecuado para autocompletado y generación de funciones en editores locales.
- Servicio de inferencia para equipos pequeños: con 572,5 tok/s agregados a 8 peticiones concurrentes, puede atender a varios desarrolladores simultáneamente desde una única GPU consumer.
- Procesamiento de imágenes con descripción textual: la torre de visión permite tareas de image-to-text como transcripción, descripción o respuesta a preguntas sobre imágenes.
- Evaluación e investigación de cuantización ternaria: sirve como banco de pruebas para estudiar el impacto de 2,125 bits por peso en calidad (perplejidad 5,627) y velocidad frente a cuantizaciones de 4-6 bits.
- Despliegue en entornos con restricciones de memoria: al ocupar menos de la mitad de VRAM que la versión de 6 bits (7,28 frente a 14,6 GiB), permite reservar el resto para caché KV o para un segundo modelo auxiliar.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (`ninfer-perplexity --quick --kv-dtype int8`, `perplexity-1m`) | 5,627 |
| Perplejidad referencia (pxzleo/ninfer-all) | 5,631 |
| Prefill 1k tokens (RTX 3090, Linux, 350 W) | 2.905 tok/s |
| Prefill 4k tokens | 2.820 tok/s |
| Prefill 16k tokens | 2.618 tok/s |
| Decode plano, prompt de código, 300 tokens | 88 tok/s |
| Decode MTP, 3 drafts | 199 tok/s |
| Decode DFlash2, 7 drafts | 297 tok/s (4,89 tokens por ronda) |
| Decode DFlash2, media en 4 prompts variados | 249,9 tok/s (rango 173-325) |
| Decode DFlash2 en 12 chats greedy de 300 tokens | 234,5 tok/s media (rango 138-437) |
| Throughput agregado a 1 / 2 / 4 / 8 peticiones | 175,7 / 305,3 / 457,7 / 572,5 tok/s |
| Decode tras documento de 245.373 tokens (55 tokens de respuesta) | 74,2 tok/s con DFlash2; 60,9 tok/s con MTP3 |
| Comparación: Qwen3.8-27B 6-bit del mismo fork, prompt de código | 48 tok/s plano; 195 tok/s con DFlash2 |
| VRAM de pesos sin drafter / con MTP | 6,70 GiB / 7,28 GiB |
| VRAM de referencia: Qwen3.8-27B 6-bit | 14,6 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,70 GiB de pesos sin cabezas de drafter; 7,28 GiB con MTP. Con contexto completo de 262.144 tokens y KV en `rk4v4` quedan 11,2 GiB libres en una RTX 3090; con DFlash2 activo, 9,6 GiB libres.
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo declarado y probado. No se dispone de datos para A100, H100 u otras GPU.
- Cabe en GPU consumer: sí, en RTX 3090 con margen amplio para contexto y cabezas auxiliares. No se especifican otras consumer.
- Opciones de despliegue: exclusivamente el fork `ashalliants/ninfer-3090` de NInfer (binarios `ninfer_bench`, `ninfer-serve`, `ninfer-perplexity`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y las builds antiguas de NInfer rechazan el formato `t2_g128_fp16` al arrancar.
- Latencia y throughput: prefill de 2.618-2.905 tok/s según longitud; decode de 88 tok/s plano hasta 297 tok/s con DFlash2 en un prompt de código; 572,5 tok/s agregados a 8 peticiones concurrentes. TTFT de 3 minutos 50 segundos para un documento de 245.373 tokens.
- Entorno probado: CUDA 12.8, Windows y Linux (incluido WSL), límite de potencia de 315-350 W.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM pesos | Decode (código) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B NInfer 3090 | 27B | 262.144 | Ternaria 2,125 bits | 6,70-7,28 GiB | 297 tok/s (DFlash2) | Apache 2.0 | `.ninfer` |
| Qwen3.8-27B 6-bit (mismo fork) | 27B | no disponible | 6 bits | 14,6 GiB | 195 tok/s (DFlash2) | no disponible | `.ninfer` |
| Qwen3.8-27B original | 27B | no disponible | BF16/FP16 | no disponible | no disponible | no disponible | Safetensors |

La comparación directa disponible se limita a la versión de 6 bits del mismo fork, que ofrece la misma arquitectura y contexto pero requiere el doble de VRAM y decodifica un 34% más lento con DFlash2 en el prompt de código medido. No se dispone de datos de benchmarks de calidad comparativos frente a otras cuantizaciones del modelo original.

## Limitaciones y advertencias

- El formato `.ninfer` no es un checkpoint de Transformers, Safetensors ni GGUF: requiere los binarios del fork `ashalliants/ninfer-3090` y builds antiguas de NInfer lo rechazan al arrancar por desconocer el formato `t2_g128_fp16`.
- La cuantización ternaria de 2,125 bits por peso puede degradar la calidad frente a cuantizaciones de 4-6 bits; la única métrica de calidad publicada es la perplejidad (5,627), sin benchmarks de razonamiento, código o matemáticas.
- Las mediciones son de una sola tarjeta y pocos prompts, según advierte el propio autor; deben tomarse como indicativas, no como cifras de producción.
- El rendimiento varía notablemente según la previsibilidad del texto: de 173 a 325 tok/s en los cuatro prompts variados y de 138 a 437 tok/s en los doce chats.
- El TTFT de 3 minutos 50 segundos para un documento de 245.373 tokens limita la viabilidad de cargas de trabajo interactivas con contextos extremos.
- No se dispone de información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No se dispone de información sobre soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados que dependan de esas capacidades.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las cabezas auxiliares provienen de terceros (Prism ML, ProCreations) cuyas condiciones no se detallan en la información disponible.

## Enlaces

- [Hugging Face: WarlaxZ/Ternary-Bonsai-2-27B-NInfer-3090](https://huggingface.co/WarlaxZ/Ternary-Bonsai-2-27B-NInfer-3090)
- [Modelo base: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio del fork: ashalliants/ninfer-3090](https://github.com/ashalliants/ninfer-3090)
- [Cabeza MTP: ProCreations/Ternary-Bonsai-2-27B-MTP](https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP)
- [Adaptador DFlash2: ProCreations/Ternary-Bonsai-2-27B-DFlash2](https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2)
- [Implementación de referencia: pxzleo/ninfer-all](https://github.com/pxzleo/ninfer-all)
