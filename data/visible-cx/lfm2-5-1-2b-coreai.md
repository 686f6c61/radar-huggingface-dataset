# visible-cx/LFM2.5-1.2B-CoreAI

## Resumen

El modelo `visible-cx/LFM2.5-1.2B-CoreAI` es un artefacto derivado del checkpoint `LiquidAI/LFM2.5-1.2B-Instruct`, convertido por el proyecto Visible al formato Core AI (`.aimodel`) para ejecución nativa en Apple Silicon. No es un modelo nuevo: son los pesos de Liquid AI reexpresados como un grafo Core AI con cuantización int8 por bloques de 32 canales y dos puntos de entrada (decode y prefill fragmentado). El resultado es un bundle que carga a través del runtime Core AI en macOS, sin compatibilidad con PyTorch, GGUF o MLX.

El modelo base, LFM2.5-1.2B-Instruct, pertenece a la familia LFM2.5 de Liquid AI, diseñada específicamente para despliegue en el borde (edge). Según la documentación de Liquid AI, es un modelo híbrido de convolución y atención con soporte de tool calling y una ventana de contexto de 32K tokens en su versión original. Esta conversión, sin embargo, declara máximos de contexto de 4096, 8192 y 16384 tokens según la variante, manteniendo los mismos pesos en las tres carpetas del repositorio. La relevancia actual radica en que permite ejecutar un modelo instruct de 1.2B parámetros en hardware de Apple con un rendimiento medido (1.77 s por fila en tareas de enriquecimiento JSON guiado) y una huella de memoria reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida conv+attention (LFM2) |
| Parametros totales | 1.2B (nominal, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 / 8192 / 16384 según variante (el modelo base soporta 32K) |
| Tipos de cuantizacion | int8, por bloque de 32 canales, simétrico (head simétrico) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia personalizada de Liquid AI, ver enlace) |
| Formato de pesos | `.aimodel` (Core AI, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` utiliza la arquitectura LFM2, que combina capas de convolución con mecanismos de atención. Es un modelo denso (no MoE) de aproximadamente 1.2B parámetros, entrenado para instrucciones y optimizado para despliegue en dispositivos de borde. La versión instruct incorpora ajuste fino con instrucciones y, según la documentación de Liquid AI, soporta tool calling y razonamiento multi-paso. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

La conversión a Core AI no altera los pesos ni la arquitectura: simplemente reexpresa el grafo en el formato `.aimodel` con cuantización int8 por bloques de 32 (simétrica) y dos entrypoints: `main` (decode con secuencia de tamaño 1) y `prefill` (prefill fragmentado de 64 tokens). El vocabulario es de 65,536 tokens y el estado de la caché KV se gestiona dinámicamente con `GrowingKVCache` (inicial 256, duplicación progresiva). El estado de convolución (`convState`) es de 10 × 1 × 2048 × 2 en Float16 y no escala con el contexto.

## Capacidades

- Generación de texto instructivo con formato chat (template que termina en `<|im_start|>assistant\n`).
- Tool calling / function calling, según la documentación del modelo base en vLLM Recipes.
- Razonamiento multi-paso y soporte para agentes en el borde, según Liquid AI.
- Decodificación guiada por gramática (solo en el motor secuencial, que es el único que expone logits).
- Ejecución on-device en Apple Silicon con dos entrypoints (decode y prefill) para optimizar el rendimiento.
- No es un modelo de pensamiento (thinking mode) y no requiere parche de chat-template.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Enriquecimiento de datos estructurados: el modelo está validado para producir salidas JSON guiadas por esquema (`respondJSON(to:schema:)`) con una tasa de éxito de 10/10 en pruebas reales, lo que lo hace adecuado para pipelines de extracción y normalización de campos en producción.
- Atención al cliente automatizada en el dispositivo: con una ventana de contexto de hasta 16K tokens (en la variante máxima) y ejecución local, puede gestionar conversaciones multi-turno sin enviar datos a la nube.
- Asistentes de codigo en entornos sin conexión: al soportar tool calling y ejecutarse en Apple Silicon, puede integrarse en IDEs o herramientas CLI para autocompletar o refactorizar código localmente.
- Clasificacion y moderacion de contenido: su tamaño reducido (1.70 GB de pesos) y su baja huella de memoria (3.06 GB de RSS medido) permiten ejecutarlo en segundo plano en aplicaciones de escritorio para filtrar o etiquetar texto.
- Generacion de respuestas en aplicaciones de productividad: integrable en procesadores de texto o clientes de correo para redactar borradores, resumir hilos o generar respuestas contextuales sin latencia de red.
- Prototipado rapido de agentes en macOS: gracias a su formato Core AI y a la disponibilidad de una libreria Swift (CoreAIKit), los desarrolladores pueden desplegar agentes conversacionales o de razonamiento en pocas lineas de codigo, con rendimiento predecible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta conversion especifica. La model card del autor reporta mediciones propias de rendimiento en una tarea de enriquecimiento JSON sobre un Mac de 16 GB M2 Pro (macOS 27 beta):

| Metrica | Valor |
|---|---|
| Carga en frio | 36.0 s |
| Parseo JSON guiado | 10/10 exitoso |
| Tiempo por fila (POST) | 1.77 s |
| Tiempo por fila (COMMENT) | 1.30 s |
| Pico de RSS | 3.06 GB |
| Parada | `<\|im_end\|>` limpio en todas las filas |

La salida es identica a nivel de comportamiento al modelo de produccion de Visible, con una diferencia de 1,168 bytes en el archivo `main.mlirb` debido a la no determinismo de la conversion. No se han medido comportamientos por encima de 4096 tokens de contexto.

## Requisitos de hardware

- Apple silicon Mac con runtime Core AI (macOS 27 o superior, segun la documentacion).
- VRAM estimada: los pesos ocupan 1.70 GB residentes; el pico de RSS medido es de 3.06 GB en un Mac de 16 GB. La caché KV cuesta 12,288 bytes por token (fp16), lo que supone 50 MB a 4096 tokens, 101 MB a 8192 y 201 MB a 16384.
- GPU recomendada: cualquier Apple silicon con al menos 16 GB de RAM unificada (probado en M2 Pro). Modelos con menos memoria podrian funcionar pero no estan verificados.
- Si cabe en GPU de consumo: solo en Apple silicon; no es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: runtime Core AI en macOS, motor secuencial para decodificacion guiada por gramatica, motor pipelineado para el camino rapido. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1.77 s por fila (POST) y 1.30 s (COMMENT) en la tarea de enriquecimiento JSON con limite de 128 tokens, excluyendo la carga inicial.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otras conversiones del mismo ecosistema Core AI, ya que no hay datos publicados de benchmarks estandar para este artefacto.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-CoreAI (esta conversion) | 1.2B | 4096/8192/16384 | Core AI (.aimodel) | lfm1.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct (original) | 1.2B | 32K | Safetensors | lfm1.0 | HuggingFace |
| LiquidAI/LFM2.5-VL-3B (VLM, en coreai-model-zoo) | 3B | no disponible | Core AI | no disponible | HuggingFace / GitHub |

No se dispone de comparativa con otros modelos de tamano similar (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) porque la informacion proporcionada no incluye datos de rendimiento estandarizados.

## Limitaciones y advertencias

- Es un artefacto derivado: no es un modelo independiente y hereda las limitaciones del checkpoint base de Liquid AI (sesgos, alucinaciones, cobertura idiomatica) que no estan documentadas en la informacion disponible.
- No es compatible con PyTorch, GGUF ni MLX; solo funciona con el runtime Core AI en Apple silicon.
- La ventana de contexto declarada en las variantes de 8192 y 16384 no ha sido medida en profundidad; la validacion solo se realizo hasta 4096 tokens.
- No es un modelo de pensamiento (thinking), por lo que puede requerir estrategias externas para tareas de razonamiento complejo.
- La licencia lfm1.0 es personalizada y puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- El proceso de conversion no es byte-determinista: dos conversiones del mismo checkpoint pueden producir archivos ligeramente diferentes, aunque el comportamiento sea identico.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta conversion, lo que dificulta la comparacion objetiva con otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/LFM2.5-1.2B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Repositorio coreai-model-zoo (GitHub): https://github.com/john-rocky/coreai-model-zoo
- Receta vLLM para LFM2.5-1.2B-Instruct: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
