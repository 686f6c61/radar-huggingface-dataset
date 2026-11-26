# Xylolabs/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una conversión y cuantización a 4 bits del modelo Qwen/Qwen3.8-27B, realizada por Xylolabs para su uso con la librería MLX de Apple en equipos con silicio de la compañía (M-series). El resultado es un checkpoint de 15,13 GB con 26.895.993.856 parámetros que puede ejecutarse en memoria unificada de Macs de gama alta, algo imposible con los pesos en BF16 originales. La conversión es solo de texto: se han eliminado la torre de visión y la capa MTP del modelo base.

El interés de esta ficha reside en que documenta una cuantización agresiva (4 bits, group size 64, escalas y sesgos en float16) y publica métricas de degradación frente al modelo en BF16, algo poco habitual en repos de cuantización. Con un KL de 0,045 en WikiText-2 y una concordancia top-1 del 90,06 %, el autor cuantifica explícitamente la pérdida de fidelidad respecto al original, lo que permite decidir con datos si el ahorro de memoria compensa.

El modelo base pertenece a la familia Qwen3.8, con licencia Apache 2.0 y pipeline de text-generation. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni benchmarks de capacidades del modelo original en la información proporcionada, por lo que esta ficha se limita a lo verificable: parámetros, formato, cuantización, métricas de fidelidad y requisitos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalles internos no disponibles); conversión solo texto, sin torre de visión ni capa MTP |
| Parámetros totales | 26.895.993.856 (26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K según hardware y cuantización; 147K con 4 bits en 36 GB unificados, 256K con 8 bits en 64 GB o más |
| Tipos de cuantización | 4 bits affine, group size 64, escalas y sesgos en float16; capas lineales, token embedding y LM head cuantizados; norms y otros tensores en float16; `A_log` en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx-lm` |

## Arquitectura y entrenamiento

El checkpoint es una conversión directa de los pesos de Qwen/Qwen3.8-27B al formato MLX mediante cuantización afín de 4 bits con group size 64. Todas las capas lineales, el token embedding y el LM head están cuantizados; las capas de normalización y el resto de tensores no cuantizados se mantienen en float16, salvo `A_log`, que se guarda en bfloat16. La conversión elimina la torre de visión y la capa MTP (multi-token prediction) del modelo base, de modo que este checkpoint es exclusivamente de texto y no conserva la capacidad de predicción multi-token del original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base Qwen3.8-27B en la información proporcionada. El autor publica métricas de fidelidad de la cuantización frente a BF16: KL de 0,045196 y top-1 del 90,06 % en WikiText-2; KL de 0,060599 y top-1 del 91,73 % en un conjunto de chat; y KL de 0,045803 y top-1 del 88,90 % en un conjunto held-out. Además, una prueba de 7 preguntas de respuesta libre da 7/7 aciertos tanto en 4 bits como en BF16, lo que sugiere que la degradación no rompe la coherencia básica en ese test reducido. Para comparar, la variante de 8 bits obtiene KL de 0,000384 y top-1 del 99,19 % en WikiText-2, con un tamaño de 28,58 GB.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Modo de razonamiento (thinking) activado por defecto; puede desactivarse con `--chat-template-config '{"enable_thinking": false}'` para obtener respuestas directas.
- Conversación multi-turno mediante `mlx_lm.chat`.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Visión: no incluida (la torre de visión se elimina en la conversión).
- Predicción multi-token (MTP): no incluida.

## Casos de uso

- Asistente conversacional local en Mac: ejecutable con `mlx_lm.chat` sobre memoria unificada de 36 GB o más, útil para prototipos y uso personal sin depender de la nube.
- Generación de texto por lotes en estaciones de trabajo Apple: `mlx_lm.generate` permite procesar prompts de forma scriptada en un Mac Studio, aprovechando el contexto de hasta 147K tokens con 4 bits en 36 GB.
- Razonamiento con cadena de pensamiento: el modo thinking por defecto es adecuado para tareas de análisis y resolución de problemas donde interesa ver el razonamiento intermedio, y puede desactivarse cuando se prioriza latencia.
- Evaluación de cuantizaciones: las métricas KL y top-1 publicadas convierten este checkpoint en una referencia útil para comparar el impacto de 4 bits frente a 8 bits y BF16 en tareas de chat y texto general.
- Desarrollo de aplicaciones MLX: sirve como modelo de pruebas para integrar `mlx-lm` en aplicaciones macOS o iOS, dado que el formato y las dependencias están documentados (`mlx-lm==0.32.2`).
- Despliegue en equipos con 64 GB o más: la variante de 8 bits del mismo autor permite contexto de 256K en Mac Studio M5 Max/Ultra, y este 4 bits sirve como alternativa cuando el presupuesto de memoria es de 36 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de la cuantización frente a BF16:

| Métrica | MLX 4 bits | MLX 8 bits |
|---|---:|---:|
| Tamaño | 15,13 GB | 28,58 GB |
| WikiText-2 KL | 0,045196 | 0,000384 |
| WikiText-2 top-1 | 90,06 % | 99,19 % |
| Chat KL | 0,060599 | 0,001776 |
| Chat top-1 | 91,73 % | 99,29 % |
| Held-out KL | 0,045803 | 0,000244 |
| Held-out top-1 | 88,90 % | 99,08 % |
| Prueba de 7 preguntas | 7/7 (BF16: 7/7) | 7/7 (BF16: 7/7) |

## Requisitos de hardware

- VRAM/memoria unificada: 15,1 GB para el checkpoint de 4 bits; 28,6 GB para el de 8 bits.
- Hardware recomendado por el autor: Mac Studio M5 Max (32 o 40 núcleos GPU) y M5 Ultra, con 36, 48, 64, 96, 128, 256 o 512 GB de memoria unificada.
- Contexto alcanzable: 147K con 4 bits en 36 GB; 80K con 8 bits en 48 GB; 256K con 8 bits en 64 GB o más.
- GPU consumer: el formato MLX está pensado para silicio Apple; no se documenta soporte para GPU NVIDIA ni AMD en esta conversión.
- Despliegue: `mlx-lm` versión 0.32.2, con los comandos `mlx_lm.generate` y `mlx_lm.chat`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3.8-27B-MLX-4bit | 26,9 B | hasta 256K según hardware | 4 bits MLX | Apache 2.0 | Hugging Face, `mlx-lm` |
| Xylolabs/Qwen3.8-27B-MLX-8bit | 26,9 B | hasta 256K | 8 bits MLX | Apache 2.0 | Hugging Face, `mlx-lm` |
| Qwen/Qwen3.8-27B (base) | 26,9 B | no disponible | BF16 | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la fidelidad de forma medible: top-1 del 88,90-91,73 % frente a BF16, con KL de aproximadamente 0,045-0,061. Para tareas sensibles a la precisión, la variante de 8 bits es claramente superior (top-1 superior al 99 %).
- Solo texto: no incluye visión ni predicción multi-token, por lo que no puede usarse para tareas multimodales ni para aprovechar las ventajas de MTP del modelo base.
- Exclusivo para MLX y silicio Apple; no es directamente utilizable en CUDA, ROCm ni en la mayoría de servidores Linux con GPU.
- El contexto máximo depende del hardware: 147K en 36 GB con 4 bits, frente a 256K con 8 bits en 64 GB o más. Planificar el despliegue según la memoria disponible.
- El modo thinking está activado por defecto y aumenta la latencia y el consumo de tokens; desactivarlo explícitamente si no se necesita.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni evaluaciones de seguridad del modelo base en la documentación proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que la conversión y cuantización son propias y remite a `NOTICE` para avisos adicionales; conviene revisar ese archivo antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
