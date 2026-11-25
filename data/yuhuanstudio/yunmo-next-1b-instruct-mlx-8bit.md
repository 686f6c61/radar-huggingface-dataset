# yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-8bit

## Resumen

Yunmo-Next-1B-Instruct-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo Yunmo-Next-1B-Instruct, desarrollado por yuhuanstudio. Se trata de un checkpoint de investigación de aproximadamente 1.014 millones de parámetros (1.013.956.456), pensado para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base emplea una arquitectura poco convencional que combina Kimi Delta Attention (KDA), grouped-query attention y depth routing, componentes que no forman parte de `mlx-lm`, por lo que el repositorio incluye una implementación MLX autocontenida en el directorio `yunmo_next_mlx/`.

El modelo está orientado a generación de texto y conversación en chino (incluido chino tradicional) e inglés, y se distribuye bajo licencia Apache-2.0. Su relevancia es fundamentalmente experimental: permite reproducir en hardware de Apple la inferencia de una arquitectura de atención alternativa con una pérdida de precisión mínima respecto a la versión PyTorch en FP32, según las métricas de bits por byte publicadas por el autor.

Conviene subrayar que el propio autor lo etiqueta como *research checkpoint*: el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple, falla a menudo en datos factuales, puede repetirse hasta agotar el límite de tokens y no ha recibido ajuste de seguridad. Por tanto, no es adecuado para producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention (KDA), grouped-query attention y depth routing |
| Parametros totales | 1.013.956.456 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con group size 64 (esta versión); el modelo base admite FP32, BF16 y 4-bit según la tabla de validación |
| Idiomas soportados | zh (incluido chino tradicional), en |
| Licencia | Apache-2.0 (con condiciones adicionales en algunas fuentes de fine-tuning) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura se apoya en Kimi Delta Attention (KDA), un mecanismo de atención alternativo, combinado con grouped-query attention y un esquema de depth routing. Esta combinación no está soportada por `mlx-lm`, de ahí que el repositorio incluya una implementación propia en `yunmo_next_mlx/`. En esta versión cuantizada, los pesos se almacenan en 8 bits afines con tamaño de grupo 64, mientras que quedan sin cuantizar la capa de embedding/output atada, las normas, las convoluciones cortas, los parámetros de decaimiento de KDA (`A_log`, `dt_bias`) y los parámetros del depth router. Las anchuras SwiGLU se rellenan con ceros hasta un múltiplo de 64 para permitir cuantizar todas las capas lineales, sin alterar la función del modelo.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card del modelo base referencia fuentes de fine-tuning como AM-Thinking-v1, destilaciones de AM-DeepSeek-R1, tw-instruct-500k, no_robots y trazas de FABLE.5, cada una con sus propias condiciones de uso. La validación de esta versión MLX se realizó en Linux con los backends CUDA y CPU de MLX, comparando bits por byte frente a PyTorch FP32 (0,9174) sobre los primeros 50 artículos de un conjunto de Wikipedia en chino creados después del 2026-10-01.

## Capacidades

- Generación de texto conversacional en chino (incluido tradicional) e inglés.
- Soporte de plantilla de chat: `encode_chat` reproduce exactamente los token IDs de la plantilla de `transformers` con el razonamiento desactivado.
- Generación con decodificación greedy y parada por tokens especiales (`<|return|>`, id 65281).
- Razonamiento: el modelo base incluye modo de razonamiento (desactivado por defecto en la plantilla de chat de esta versión).
- No se documenta soporte de tool calling, function calling, agentes ni visión en la información disponible.
- Capacidades multilingües limitadas a zh y en según los tags del repositorio.

## Casos de uso

- Investigación de arquitecturas de atención alternativas: el modelo permite estudiar el comportamiento de Kimi Delta Attention y depth routing en un entorno MLX reproducible, comparando bits por byte y tokens generados frente a la implementación PyTorch de referencia.
- Validación de cuantización en Apple Silicon: sirve para medir la degradación de precisión de la cuantización 8-bit affine (group size 64) frente a FP32 y BF16 en tareas de modelado de lenguaje en chino e inglés.
- Experimentos de fidelidad de decodificación: la tabla de tokens idénticos a PyTorch FP32 (64/64 en chino e inglés con 8-bit) permite usar el modelo como banco de pruebas para comparar backends MLX (CUDA, CPU) y validar implementaciones propias.
- Prototipado de chat en chino tradicional: con la plantilla `encode_chat` y el token de parada `<|return|>`, se pueden construir demos conversacionales ligeras en equipos Apple, asumiendo las limitaciones factuales del checkpoint.
- Evaluación de pipelines de cuantización: el relleno de SwiGLU a múltiplos de 64 y la exclusión de capas sensibles (normas, convoluciones, parámetros KDA) sirven como referencia para diseñar esquemas de cuantización mixtos.
- Docencia y divulgación: por su tamaño (1,1 GB) y su licencia Apache-2.0, es un candidato para ejemplos prácticos de despliegue MLX en cursos y tutoriales, siempre advirtiendo de su naturaleza de investigación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de la cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

Bits por byte de los pesos **Base** sobre los primeros 50 artículos del conjunto new-Wikipedia (chino, primeros 2.000 caracteres), frente a PyTorch Base en FP32 (0,9174):

| Pesos | Bits por byte | Δ vs PyTorch FP32 |
|---|---:|---:|
| MLX FP32 | 0,9174 | +0,0000 |
| MLX BF16 | 0,9175 | +0,0001 |
| MLX 8-bit | 0,9175 | +0,0001 |
| MLX 4-bit | 0,9254 | +0,0080 |

Tokens iniciales idénticos a PyTorch FP32 con decodificación greedy y 64 tokens nuevos:

| Pesos MLX | Chino (Base) | Inglés (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64 / 64 | 64 / 64 | 64 / 64 |
| BF16 | 64 / 64 | 64 / 64 | 42 / 64 |
| 8-bit | 64 / 64 | 64 / 64 | 42 / 64 |
| 4-bit | 64 / 64 | 27 / 64 | 19 / 64 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,1 GB, lo que permite cargar el modelo en memoria unificada de equipos Apple con relativa holgura.
- VRAM/RAM estimada para inferencia: en torno a 1,1 GB para los pesos en 8-bit, más overhead del runtime MLX y de la caché KV (no cuantificada, dependiente de la longitud de contexto, que no está documentada).
- GPU recomendadas: el modelo está diseñado para Apple Silicon (MLX). La validación se ejecutó en Linux con los backends CUDA y CPU de MLX, pero no se ha comprobado ni la corrección ni la velocidad en Apple Silicon según la model card.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con al menos ~2 GB de memoria libre debería poder alojar los pesos, aunque el rendimiento no está medido.
- Opciones de despliegue: MLX (`mlx`, `tokenizers`, `huggingface_hub`) mediante el script `python -m yunmo_next_mlx.generate` o la API `load`/`generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dada la arquitectura KDA no estándar.
- Latencia y throughput: no disponibles; el autor indica que el bucle de decodificación aún no está optimizado para velocidad.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento en tareas que permitan una comparación rigurosa con alternativas de tamaño similar. A modo orientativo estructural:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-MLX-8bit | 1.014 M | no disponible | Apache-2.0 | safetensors MLX | KDA + GQA + depth routing; checkpoint de investigación |
| Yunmo-Next-1B-Instruct (base) | 1.014 M | no disponible | Apache-2.0 | safetensors PyTorch | Referencia FP32/BF16 del mismo modelo |
| Alternativas ~1B | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la información disponible |

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple y falla a menudo en datos factuales.
- Riesgo de repetición degenerativa: puede repetirse hasta agotar el límite de tokens.
- Sin ajuste de seguridad: no ha recibido alineamiento ni filtros de contenido; no debe exponerse directamente a usuarios finales.
- Idiomas limitados a chino (incluido tradicional) e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- La cuantización 8-bit preserva la fidelidad en Base (64/64 tokens idénticos) pero degrada la generación de chat (42/64 frente a FP32), un caveat relevante para aplicaciones conversacionales.
- La validación se hizo en Linux con backends CUDA/CPU de MLX; no se ha verificado corrección ni velocidad en Apple Silicon.
- Licencia Apache-2.0 en los pesos, pero algunas fuentes de fine-tuning imponen condiciones propias (AM-Thinking-v1 y destilaciones de AM-DeepSeek-R1: solo investigación; tw-instruct-500k: CC BY-NC-SA 4.0; no_robots: CC BY-NC 4.0; subconjuntos de trazas FABLE.5: AGPL-3.0). Revisar las secciones Data y License del modelo base antes de uso comercial.
- El bucle de decodificación no está optimizado para velocidad; el throughput en producción no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-8bit
- Modelo base (precisión completa): https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Repositorio de la implementación MLX: incluido en el propio repositorio, directorio `yunmo_next_mlx/`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
