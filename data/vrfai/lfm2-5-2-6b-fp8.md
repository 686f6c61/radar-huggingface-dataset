# vrfai/LFM2.5-2.6B-FP8

## Resumen

LFM2.5-2.6B-FP8 es una versión cuantizada en FP8 (W8A8) del modelo LFM2.5-2.6B de Liquid AI, producida por el usuario vrfai. El modelo base es un modelo denso de 2.600 millones de parámetros diseñado para despliegue en dispositivos edge, con una ventana de contexto de 128K tokens y post-entrenamiento orientado a tareas agénticas (tool calling, razonamiento multi-paso). Esta build FP8 reduce el peso del checkpoint de 5,0 GB a 2,77 GB (un 55% del original) manteniendo el 90,28% de las capas lineales en precisión de 8 bits, con el `lm_head` en bf16.

La relevancia de este checkpoint cuantizado radica en que permite ejecutar un modelo agéntico de última generación en hardware de consumo y dispositivos con memoria limitada, sin necesidad de flags especiales en vLLM (el formato se lee automáticamente de `config.json`). Los benchmarks propios del autor muestran que la cuantización FP8 no introduce regresión estadísticamente significativa respecto al baseline bf16 en las tareas evaluadas (AIME25 e IFEval), lo que lo convierte en una opción atractiva para producción en entornos con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas Lfm2DecoderLayer (8 de atención completa + 22 convolucionales Lfm2ShortConv, depthwise causal Conv1d kernel 3) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP8 (W8A8) con SmoothQuant (strength 0.8) y escalas estáticas por tensor; `lm_head` en bf16 |
| Idiomas soportados | Árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés, vietnamita (17 idiomas) |
| Licencia | LFM Open License (lfm1.0) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B emplea una arquitectura híbrida que combina 8 capas de atención completa (full attention) con 22 capas convolucionales (`Lfm2ShortConv`), estas últimas basadas en una convolución causal depthwise con kernel de tamaño 3. A diferencia de arquitecturas SSM como Gated DeltaNet, no incorpora un mecanismo de decaimiento recurrente aprendido, lo que simplifica la cuantización de estas capas. El modelo fue entrenado con post-entrenamiento agéntico, incluyendo aprendizaje por refuerzo dentro de harnesses agénticos populares para mejorar la compatibilidad con herramientas y el razonamiento multi-paso.

La cuantización FP8 fue realizada por vrfai con `llmcompressor` 0.13.0, aplicando SmoothQuant con fuerza 0.8 y calibración estática sobre 512 muestras de `abisee/cnn_dailymail` a 2048 tokens. Los pesos y activaciones se cuantizan a FP8 (E4M3) con escalas per-tensor; solo el `lm_head` se mantiene en bf16. El proceso excluyó un módulo (`lm_head`) y cuantizó el 90,28% de los pesos lineales por recuento de parámetros. El checkpoint se serializa en formato `compressed-tensors`, que vLLM detecta automáticamente.

## Capacidades

- Generación de texto y razonamiento multi-paso con ventana de contexto de 128K tokens.
- Tool calling / function calling nativo, entrenado específicamente para tareas agénticas.
- Soporte de agentes: planificación, ejecución de múltiples pasos y uso de herramientas en entornos agénticos.
- Capacidades multilingües en 17 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, etc.
- Eficiencia en edge: el modelo base alcanza 220 tok/s en Apple M5 Max y 113 tok/s en CPU AMD Ryzen, con menos de 2,5 GB de memoria; la versión FP8 reduce aún más el footprint.
- Chat template que abre incondicionalmente con un bloque ` thinking` (sin toggle para desactivarlo), lo que afecta al formato de las respuestas.

## Casos de uso

- Asistentes agénticos en dispositivos móviles: el modelo puede planificar y ejecutar tareas multi-paso (reservas, envío de mensajes, consultas a APIs) con tool calling nativo, funcionando en smartphones con ~30 tok/s y menos de 2,5 GB de RAM.
- Automatización de atención al cliente: con 128K de contexto, puede gestionar conversaciones multi-turno largas, mantener el historial completo y llamar a sistemas CRM o bases de conocimiento externas mediante function calling.
- Generación de código asistida en entornos CI/CD: su capacidad de tool calling permite integrarlo en pipelines que invoquen compiladores, linters o repositorios, con latencia baja gracias a la cuantización FP8 en GPUs de consumo.
- Razonamiento matemático y resolución de problemas en educación: el modelo mantiene un rendimiento aceptable en AIME25 (33,33% exact_match en FP8) y puede desplegarse en hardware modesto para tutorías interactivas.
- Procesamiento de documentos largos: la ventana de 128K permite resumir, extraer información y responder preguntas sobre contratos, informes o artículos extensos sin necesidad de truncamiento.
- Desarrollo de agentes de investigación: su capacidad de razonamiento multi-paso y su soporte multilingüe lo hacen adecuado para tareas de búsqueda y síntesis de información en varios idiomas, ejecutándose en estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

El autor del checkpoint proporciona resultados medidos sobre estos pesos (FP8) comparados con el baseline bf16 del modelo base, usando el harness `lm_eval`:

| Tarea | Metrica | bf16 baseline | FP8 (este modelo) | Δ (abs) | Δ (rel) |
|---|---:|---:|---:|---:|---:|
| AIME25 | exact_match | 40,00% (n=30) | 33,33% (n=30) | -6,67 | -16,7% |
| IFEval | prompt_level_strict_acc | 69,32% (n=541) | 73,75% (n=541) | +4,44 | +6,4% |

Ambas diferencias no son estadísticamente significativas (prueba z de dos proporciones, p > 0,05), por lo que no se observa regresión atribuible a la cuantización FP8. La card base de Liquid AI reporta benchmarks adicionales (AA-Omni, AIME25, LiveCodeBench, IFBench, BFCL) medidos sobre los pesos originales, pero no se han verificado en este checkpoint cuantizado; no se dispone de esos números en la información proporcionada.

## Requisitos de hardware

- Tamaño del checkpoint: 2,77 GB en disco; en memoria de inferencia cabe en GPUs con 4 GB de VRAM o menos en cuantización FP8.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, etc.) para inferencia cómoda; también funciona en Apple Silicon (M5 Max) y CPUs AMD Ryzen con 113 tok/s según el modelo base.
- Despliegue en consumer GPU: sí, es uno de los objetivos del modelo base (edge deployment).
- Opciones de despliegue: vLLM (recomendado, lee el formato automáticamente), llama.cpp, Ollama, TGI; también disponible en GGUF, MLX y ONNX para el modelo base.
- Latencia y throughput: el modelo base reporta 220 tok/s en Apple M5 Max y 113 tok/s en CPU AMD Ryzen; la versión FP8 debería mantener o mejorar estas cifras al reducir el ancho de banda de memoria, aunque no se han publicado mediciones específicas para este checkpoint.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El blog de Liquid AI afirma que LFM2.5-2.6B es "competitivo con modelos 4 veces mayores" en tareas de uso de herramientas, seguimiento de instrucciones y tareas agénticas multi-paso. Como referencia cualitativa, modelos comparables en rango de parámetros (2-4B) incluyen Qwen2.5-3B, Llama-3.2-3B y Gemma-3-4B, pero no se han medido en los mismos benchmarks dentro de esta ficha. La ventaja diferencial de LFM2.5-2.6B es su contexto de 128K y su entrenamiento específico para agentes, algo poco común en modelos de este tamaño.

## Limitaciones y advertencias

- La licencia LFM Open License (lfm1.0) tiene términos específicos que deben revisarse antes de uso comercial; no se detallan en la información proporcionada.
- El chat template abre incondicionalmente con un bloque ` thinking` y no existe un toggle para desactivarlo, lo que puede afectar a aplicaciones que requieran respuestas directas sin razonamiento visible.
- La cuantización FP8 puede introducir ligeras pérdidas de precisión en tareas no evaluadas; los benchmarks disponibles solo cubren AIME25 e IFEval con tamaños de muestra limitados (n=30 en AIME25).
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas de razonamiento complejo o generación de código.
- El modelo base fue entrenado con datos multilingües, pero el rendimiento puede variar significativamente entre idiomas; no se han publicado evaluaciones desglosadas por idioma.
- Para producción, se recomienda validar el comportamiento del modelo en el dominio específico, dado que el post-entrenamiento agéntico puede sesgar las respuestas hacia formatos de tool calling.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/vrfai/LFM2.5-2.6B-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentación oficial: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Playground de Liquid AI: https://playground.liquid.ai/
- Repositorio de Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
