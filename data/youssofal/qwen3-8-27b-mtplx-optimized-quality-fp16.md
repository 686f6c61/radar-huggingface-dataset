# Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16

## Resumen

Qwen3.8-27B-MTPLX-Optimized-Quality-FP16 es una conversión del checkpoint Qwen/Qwen3.8-27B publicada por el usuario Youssofal para su uso con MTPLX, un runtime de inferencia para Apple Silicon basado en MLX. El modelo conserva la arquitectura y los pesos cuantizados del modelo base (cuantización dinámica de 8 bits) y convierte a fp16 los tensores en coma flotante restantes (escalas, sesgos, normalizaciones, parámetros de convolución y estado del bloque GDN, y la cabeza MTP), en lugar de bf16. El objetivo es que los Mac con chip M1 y M2, que no ejecutan bf16 con buen rendimiento, puedan correr el modelo con la misma calidad que la versión principal.

El paquete incorpora decodificación especulativa nativa mediante predicción multi-token (MTP) con profundidad 3, lo que según el autor multiplica por dos o tres la velocidad de la decodificación simple y se mantiene exacta a cualquier temperatura. La ventana de contexto es de 262.144 tokens y el repo ocupa 29,4 GB de descarga (30,8 GB de tamaño total), con 27.356.723.952 parámetros.

Es relevante porque permite ejecutar localmente un modelo de 27B en hardware de consumo de Apple con memoria unificada de 36 GB o más, manteniendo una calidad medida del 99,3 % de acuerdo top-1 y KL 0,0005 frente al checkpoint bf16 de referencia en una evaluación teacher-forced sobre 2.389 posiciones. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y bloque GDN (según referencias del model card a convolución y estado GDN); cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.723.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Cuantización dinámica de 8 bits en los pesos; tensores flotantes restantes en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (runtime MLX / librería mtplx) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Qwen/Qwen3.8-27B, no un entrenamiento nuevo. La model card menciona explícitamente parámetros de convolución y estado del bloque GDN, lo que sitúa la arquitectura del modelo base en la familia de transformadores híbridos con atención lineal de Qwen, aunque la ficha no detalla la composición completa de capas. La innovación principal del paquete es la integración de una cabeza de predicción multi-token (MTP) con profundidad 3, usada por MTPLX para decodificación especulativa: los borradores se aceptan con la regla de ratio de probabilidad más remuestreo residual, de modo que la especulación es exacta a cualquier temperatura.

No se proporcionan datos sobre el corpus de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO). La conversión en sí solo altera el tipo de los tensores flotantes: según el autor, cada byte de peso cuantizado es idéntico al del paquete padre, y el repositorio incluye `MTPLX_FP16_CONVERSION_MANIFEST.json` con la lista de tensores convertidos y preservados, junto con el sha256 de cada shard. La evaluación de calidad del pack se hizo con teacher forcing sobre 2.389 posiciones de código, prosa, JSON y un aviso multilingüe.

## Capacidades

- Generación de texto conversacional y de código, según la pipeline declarada (text-generation) y las etiquetas del repositorio (coding, conversational).
- Razonamiento de varios pasos con modo de razonamiento extendido: el autor cita una medición sobre "long xhigh reasoning" de 33,2 tok/s en el paquete padre.
- Decodificación especulativa multi-token exacta a cualquier temperatura, con profundidad MTP de 3.
- Muestreo con el contrato oficial de Qwen 3.8: temperatura 1.0, top-p 0.95, top-k 20.
- Integración con herramientas de codificación agéntica: las etiquetas incluyen opencode y claude-code.
- Capacidades multilingües: la evaluación de calidad incluye un aviso multilingüe, pero no se detalla la lista de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede integrarse en flujos tipo opencode o claude-code para autocompletado, refactorización y generación de tests, aprovechando la decodificación especulativa para reducir la latencia en edición iterativa.
- Conversaciones de contexto largo: con 262.144 tokens de ventana se pueden cargar repositorios completos, documentación extensa o historiales de incidencias y mantener un diálogo multi-turno sin truncar.
- Sustitución de API en entornos con requisitos de privacidad: al ejecutarse íntegramente en el Mac con MLX, los datos no salen del equipo, lo que encaja en auditorías o código propietario.
- Prototipado de agentes multi-paso: la cabeza MTP y la decodificación especulativa aceleran las generaciones encadenadas típicas de bucles de agente, y el contexto largo evita perder el estado de la tarea.
- Generación y revisión de documentación técnica: el paquete mantiene el 99,3 % de acuerdo top-1 con el checkpoint bf16 en prosa y JSON, por lo que es adecuado para producir y validar documentación estructurada.
- Desarrollo sin conexión en portátiles M1/M2: es el caso de uso declarado del build, ya que estos chips no rinden bien con bf16 y esta variante evita la penalización manteniendo la calidad.
- Evaluación comparativa de runtimes: sirve como referencia para medir el impacto de MTPLX frente a mlx-serve, oMLX, LM Studio u Ollama en el mismo hardware.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un MacBook Pro M5 Max con MTPLX 2.11.3 (16 de septiembre de 2026), ventiladores a máxima velocidad y muestreo con los ajustes propios del modelo:

| Ejecución | tok/s |
|---|---|
| Optimized Speed reescribiendo un fichero recién generado, ajustes por defecto (MTPLX 2.10.0) | 87,6 |
| Bare Speed en una tarea de código nueva con muestreo oficial de Qwen 3.8 (MTPLX 2.7.0) | 65,2 |
| Optimized Speed en una respuesta de chat de 3k tokens (MTPLX 2.10.0) | 64,3 |
| Récord de 27B en generación nueva: Qwen 3.6 27B Optimized Speed, bench de 192 tokens, 2 de julio de 2026 | 81,74 |

Calidad del pack frente al checkpoint bf16 de Qwen3.8-27B, teacher-forced sobre 2.389 posiciones (16 de septiembre de 2026):

| Variante | Acuerdo top-1 | KL |
|---|---|---|
| Optimized Speed (4-bit dinámico) | 96,0 % | 0,012 |
| Optimized Quality (8-bit dinámico) | 99,3 % | 0,0005 |

Exactitud de la especulación: mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta simple dentro del propio ruido de esta última, con temperatura 1, top-p 0,95 y top-k 20. No se han publicado cifras de tok/s en M1 ni M2 para este build, ni resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada: 36 GB o más para esta variante Optimized Quality; el autor indica 32 GB o más para el resto de packs.
- Pico de memoria unificada medido en el paquete padre sobre M5 Max: 32,7 GB.
- Descarga: 29,4 GB.
- Chips compatibles: Apple Silicon de la familia M1 a M5 (MacBook Pro, MacBook Air, Mac mini y Mac Studio); este build está pensado para M1 y M2, y en M3 o superior se recomienda el paquete padre en bf16.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el runtime es MLX sobre Apple Silicon.
- Despliegue: aplicación de escritorio de MTPLX o CLI con `pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 48,3 tok/s en tarea de código y 33,2 tok/s en razonamiento xhigh largo según las cifras del paquete padre en M5 Max; en M1 y M2 no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-Optimized-Quality-FP16 (este) | 27,36 B | 262.144 | 8-bit dinámico + fp16 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized-Quality (padre) | 27,36 B | 262.144 | 8-bit dinámico + bf16 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Optimized-Speed-FP16 | no disponible | 262.144 | 4-bit dinámico + fp16 | Apache 2.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-27B-MTPLX-Bare-Speed-FP16 | no disponible | 262.144 | no disponible | Apache 2.0 | Hugging Face, runtime MTPLX |

No se dispone de datos de rendimiento de benchmarks académicos ni de comparación con modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- El paquete está atado al runtime MTPLX y a MLX; no es un checkpoint portable a otras herramientas de inferencia sin conversión adicional.
- Está diseñado para M1 y M2: en M3 o superior el autor recomienda usar la variante bf16, y no hay cifras de rendimiento publicadas para M1 ni M2.
- Requiere 36 GB de memoria unificada; en configuraciones de 32 GB el margen es insuficiente para esta variante.
- Los pesos están cuantizados a 8 bits, por lo que existe una degradación pequeña pero no nula frente al modelo original (99,3 % de acuerdo top-1, KL 0,0005).
- La model card no documenta sesgos conocidos, tasa de alucinación ni lista de idiomas soportados.
- No se detalla el proceso de alineación del modelo base (RLHF, DPO) ni sus limitaciones de seguridad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de un uso comercial.
- Las cifras de velocidad proceden de un único equipo (M5 Max) y de la versión 2.11.3 de MTPLX; pueden variar con otras versiones o configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete padre Optimized Quality: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality
- Variante Optimized Speed FP16: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed-FP16
- Variante Bare Speed FP16: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16
- Sitio de MTPLX: https://mtplx.com
- Benchmarks: https://mtplx.com/benchmarks/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 27B en Mac: https://mtplx.com/models/qwen3.8-27b/
- Comparativa MTPLX vs mlx-serve: https://mtplx.com/compare/mtplx-vs-mlx-serve/
- Comparativa MTPLX vs oMLX: https://mtplx.com/compare/mtplx-vs-omlx/
- Comparativa MTPLX vs LM Studio: https://mtplx.com/compare/mtplx-vs-lm-studio/
- Comparativa MTPLX vs Ollama: https://mtplx.com/compare/mtplx-vs-ollama/
