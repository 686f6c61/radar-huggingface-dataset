# Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura multimodal image-text-to-text del original, con 5.295.564.288 parámetros totales, y sustituye las capas lineales por matrices cuantizadas en formato block-floating-point de 8 bits (`ttnn.bfloat8_b`), lo que reduce el peso en memoria del modelo de lenguaje a aproximadamente 5,07 GB empaquetados.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica: los tensores se almacenan como valores bf16 alineados a la rejilla BFP8, de modo que el empaquetador TT-NN los lee sin alterar sus valores. Esto permite desplegar un modelo de 4B en hardware Tensix con una pérdida de calidad medida muy contenida (KL medio de 0,00072 frente al BF16 y 27 de 28 respuestas correctas en la evaluación del autor).

El modelo es un checkpoint preentrenado, no afinado por instrucciones: continúa texto y conserva la plantilla de chat del tokenizador base, pero no debe esperarse de él un comportamiento conversacional alineado. Está pensado para desarrolladores que trabajan con el stack tt-metal/ttnn y necesitan un modelo de referencia de 4B con licencia Apache 2.0 para prototipado en NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas Gated DeltaNet (arquitectura Qwen3.5), más torre visual y bloque MTP |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) con GPTQ; media de 9,63 bits por peso; existe exportación hermana BFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN en `ttnn.bfloat8_b` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B-Base emplea una arquitectura híbrida: 8 capas con atención clásica (q, k, v, o) y 24 capas con Gated DeltaNet (q, k, v, z, a, b y salida), más 32 capas MLP (gate, up, down). Incluye además un bloque MTP (multi-token prediction) y una torre visual, ambos mantenidos en bf16 sin cuantizar. La cuantización se aplicó únicamente al modelo de lenguaje.

El proceso de cuantización utiliza GPTQ sobre la rejilla bfloat8_b, manteniendo el exponente compartido de cada bloque tal y como lo fija el empaquetador. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores `linear_attn.A_log` y `linear_attn.norm.weight` se conservan en float32, y el LM head (atado al embedding), las normas y el resto de tensores permanecen en bf16. No se dispone de información sobre el volumen total de tokens de preentrenamiento del modelo base ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en modo continuación (modelo preentrenado, sin ajuste por instrucciones).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), heredado de la torre visual del modelo base.
- Razonamiento y conocimiento general propios de un modelo de 4B, sujetos a la merma de la cuantización BFP8.
- Capacidad multilingüe: no documentada en la información disponible, aunque la calibración incluyó coreano.
- Soporte de tool calling / function calling: no disponible (no verificado ni documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible; el checkpoint no está alineado para ello.
- Modo thinking: no disponible.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de los pesos BFP8 sin pérdida de valores.

## Casos de uso

- Prototipado en NPU Tenstorrent: validar el stack tt-metal/ttnn con un modelo de 4B real antes de escalar a modelos mayores, aprovechando que los pesos BFP8 se empaquetan sin re-cuantización.
- Evaluación de precisión de cuantización: usar el checkpoint como referencia para medir el impacto de BFP8 frente a BF16 en tareas de continuación de texto, con la métrica de KL y top-1 ya publicada por el autor.
- Generación de texto en bruto para pipelines de datos: producir continuaciones y corpus sintéticos en entornos con recursos limitados de memoria de dispositivo (unos 5,07 GB para los pesos del LM).
- Investigación en arquitecturas híbridas: estudiar el comportamiento de las capas Gated DeltaNet frente a la atención clásica en un modelo ya empaquetado para hardware específico.
- Base para afinamiento posterior: al ser un checkpoint base con licencia Apache 2.0, sirve como punto de partida para fine-tuning supervisado o DPO orientado a una tarea concreta.
- Despliegue en dispositivos Wormhole o Blackhole con memoria ajustada: la variante BFP8 encaja donde la BFP4 no es aceptable por pérdida de calidad, y la BFP4 donde la memoria es más restrictiva.
- Experimentación multimodal: probar la torre visual (mantenida en bf16) en tareas image-text-to-text dentro del ecosistema Tenstorrent.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación del modelo de lenguaje):

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B-Base) | 16 | 8,41 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 9,63 | 5,065 | 0,00072 | 98,57 | 27 de 28 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM / memoria de dispositivo estimada: unos 5,07 GB solo para los pesos del modelo de lenguaje en BFP8, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU consumer: no es el objetivo del checkpoint; puede cargarse en transformers con `device_map="auto"` en bf16, pero el repo pesa 10,6 GB y no se documenta su rendimiento en GPU.
- Despliegue: TT-NN (ttnn 0.81.1 verificado en el simulador ttsim de Blackhole), tt-metal (demo Qwen3.5/3.6 v0.81.1), tt-forge (tt-xla, aún no probado con este checkpoint) y transformers para carga estándar.
- Limitación conocida del demo de tt-metal: siempre empaqueta las proyecciones MLP gate y up en bfloat4_b, lo que re-cuantiza estos valores BFP8; para ese demo, la exportación BFP4 encaja mejor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8 | 5.295.564.288 | no disponible | BFP8 (9,63 bits/peso) | Apache 2.0 | Hugging Face |
| Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4 | no disponible | no disponible | BFP4 | Apache 2.0 (presumible) | Hugging Face |
| Qwen/Qwen3.5-4B-Base (BF16) | no disponible | no disponible | BF16 (16 bits/peso) | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp, referencia citada por el autor) | no disponible | no disponible | 4 bits | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo preentrenado, no ajustado por instrucciones: no responde a instrucciones ni mantiene conversaciones alineadas; solo continúa texto.
- La cuantización BFP8 introduce una degradación medible (KL medio de 0,00072, top-1 del 98,57 % frente a BF16), aceptable pero no nula.
- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de la torre visual y del bloque MTP en este checkpoint no está documentado.
- El demo de tt-metal v0.81.1 no ejecuta este checkpoint a su precisión: re-cuantiza gate/up del MLP, el LM head y el MTP a bfloat8_b, y no lista Qwen3.5-4B entre sus modelos soportados.
- tt-forge (tt-xla) no se ha probado con este checkpoint; su opción `bfp_bf8` re-cuantiza en el layout [out, in] de PyTorch.
- tt-transformers no soporta esta arquitectura.
- Idiomas soportados y longitud de contexto no documentados: riesgo de comportamiento inesperado fuera de los idiomas de calibración.
- Riesgo de alucinación inherente a un modelo base de 4B sin alineación; no apto para producción conversacional sin fine-tuning y evaluación adicionales.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y de las herramientas de Xylolabs.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Exportación BFP4: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
