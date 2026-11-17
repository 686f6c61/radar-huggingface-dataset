# StillDeadcode/qwen3.8-next-flash-uncensored-iqr-v4

## Resumen
Qwen3.8-Next-Flash-Uncensored IQR-V4 es un contenedor de inferencia en formato `.rad` para el motor radiance, orientado a GPUs AMD RDNA4 con ROCm. Empaqueta el modelo orcarouter/Qwen3.8-Flash-Next-Uncensored (una variante del Qwen3.8-Flash-Next a la que se ha eliminado la dirección de rechazo mediante abliteration) en una única unidad de 113,3 GiB con cuantización mixta de 4 y 5 bits, expertos protegidos en bf16 y torre de visión completa. El autor es StillDeadcode, que mantiene tanto el motor como la receta de conversión.

La relevancia de esta ficha es doble: por un lado documenta un formato propietario de despliegue (`.rad`) que no es compatible con vLLM, llama.cpp ni TGI; por otro, ejemplifica una técnica de conversión incremental en la que solo se recuantizan los tensores afectados por la abliteration y se copian bit a bit el resto desde el contenedor original. El modelo conserva la cabeza MTP para decodificación especulativa y una ventana de contexto entrenada de 262.144 tokens, servida a 200.000.

El repositorio tiene 121,7 GB, cero descargas y cero likes en el momento de la consulta, y se publicó el 16 de noviembre de 2026. La licencia declarada es `qwen-community-1.0` (etiquetada como `other`), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención, delta net, capa n-gram e hiperconexiones; cabeza MTP para decodificación especulativa; torre de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens entrenados; servido a 200.000 |
| Tipos de cuantizacion | Mixta: expertos enrutados a 4 bits (trellis y codebook no uniforme de 16 niveles), tronco con proyecciones a 5 bits trellis e int8 rotado, lm_head int8, matrices de mezcla E4M3, diez expertos protegidos en bf16, torre de visión bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other`) |
| Formato de pesos | Contenedor `.rad` propietario del motor radiance 2.x (no safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer de mezcla de expertos (MoE) con varios componentes poco habituales: atención con compuerta de query, una delta net con proyección de entrada propia, una capa n-gram con proyección de valor, matrices de hiperconexión para la mezcla de estados y una cabeza MTP (multi-token prediction) de profundidad 3 que actúa como especulador. La torre de visión se mantiene en bf16 y permite entradas de imagen y vídeo en las peticiones de chat.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Lo que sí documenta la model card es el proceso de conversión: el modelo sin censura difiere del original únicamente en seis grupos de pesos que escriben en el flujo residual (proyecciones down de expertos enrutados y compartidos, proyecciones de salida de delta net y atención, embedding de tokens y proyección de valor de la capa n-gram). Los expertos enrutados down se copian byte a byte desde un contenedor previo; el embedding y la proyección de valor n-gram se toman en bf16 del checkpoint; y las 98 proyecciones de salida y down de expertos compartidos del tronco se reconstruyen proyectando fuera la dirección de abliteration con `W' = W - r (r^T W)`, donde `r` se extrae de la diferencia de embeddings (99,3 % de la energía). El resto de pesos se copia bit a bit del contenedor original qwen3.8-next-flash-iqr-v4.

La cuantización de los expertos enrutados usa códigos trellis de 4 bits tras una rotación Walsh-Hadamard de 128 puntos, elegidos por GPTQ sobre hessianos registrados del modelo bf16; la proyección down emplea un codebook no uniforme de 16 niveles con una escala E4M3 por cada 64 pesos, refinada con tres barridos de descenso por coordenadas. Las proyecciones de atención y delta net del tronco usan códigos trellis de 5 bits, y el resto de lineales del tronco y de expertos compartidos se rotan a int8 con una escala por cada 128 columnas.

## Capacidades
- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 200.000 tokens en servicio.
- Procesamiento de imagen y vídeo en peticiones de chat (`image_url` y partes de vídeo), gracias a la torre de visión en bf16.
- Tool calling y function calling a través de la API compatible con OpenAI del servidor radiance (`/v1/chat/completions`).
- Salida estructurada (structured output) declarada en la model card.
- Decodificación especulativa con la cabeza MTP del propio modelo (profundidad 3, hasta 3 tokens especulativos por paso).
- Modo sin censura: responde a peticiones que el modelo original rechaza, por eliminación de la dirección de rechazo.
- Capacidades multilingües: no disponible (no se declaran idiomas en la información proporcionada).
- No se documentan capacidades de audio ni de agentes multi-paso más allá del tool calling.

## Casos de uso
- Despliegue en hardware AMD RDNA4: el contenedor está pensado para el motor radiance sobre ROCm, con `tp: 2` y reparto por niveles de expertos (`expert_tiered`), lo que permite servir el modelo en dos tarjetas de 32 GB con streaming de expertos desde RAM fijada.
- Asistentes conversacionales de contexto largo: con 200.000 tokens servidos, admite conversaciones multi-turno con documentos extensos o historiales completos sin truncar.
- Análisis de imágenes y vídeo en chat: la torre de visión bf16 permite incorporar capturas, diagramas o fotogramas como parte de la consulta en el mismo endpoint compatible con OpenAI.
- Automatización con tool calling: el servidor expone function calling y salida estructurada, adecuado para pipelines que necesitan invocar APIs externas y validar el formato de la respuesta.
- Investigación sobre alineación y abliteration: al estar documentada la reconstrucción de las 98 proyecciones afectadas, sirve como caso de estudio reproducible de cómo se propaga una dirección de rechazo por el flujo residual.
- Evaluación de cuantización mixta: la receta (trellis 4 bits, codebook de 16 niveles, int8 rotado, expertos protegidos en bf16) permite medir el impacto de cada decisión sobre la perplejidad y el KL, con la tabla KL del contenedor original como referencia (KL medio 0,0224).
- Servicio en producción con caché de prefijo: la configuración de ejemplo incluye `prefix-cache-mib: 4096` y caché KV en int8, útil para cargas con system prompts repetidos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una métrica de fidelidad de cuantización: KL medio de 0,0224 en posiciones generadas por el modelo frente a 0,0250 del formato anterior, medida sobre el contenedor original (no sobre este archivo). No se han medido velocidad ni throughput de forma independiente.

## Requisitos de hardware
- VRAM: los expertos enrutados no caben en dos tarjetas de 32 GB; el motor mantiene los más calientes en VRAM y transmite el resto desde un pool de RAM fijada de aproximadamente 32 GB.
- GPU recomendadas: AMD RDNA4 con ROCm (el motor radiance no soporta CUDA según la información disponible); configuración de referencia con `tp: 2`.
- GPU de consumo: no disponible; el requisito de dos tarjetas de 32 GB y 32 GB de RAM de host queda lejos de una GPU consumer típica.
- Almacenamiento: el contenedor debe residir en un NVMe, porque la tabla n-gram se lee del disco a medida que se necesitan los tokens.
- Despliegue: exclusivamente mediante el motor radiance 2.0.0 o superior (probado en 2.1.0 con `tp: 1`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Configuración de referencia: `max-num-seqs: 8`, `max-model-len: 200000`, `kv-cache-dtype: i8`, `num-speculative-tokens: 3`, `max-num-batched-tokens: 2048`, `host-pool-mib: 12288`.
- Latencia y throughput: no disponibles; la model card indica que la velocidad no se midió por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StillDeadcode/qwen3.8-next-flash-uncensored-iqr-v4 | no disponible | 262.144 entrenados / 200.000 servidos | `.rad` (radiance 2.x) | qwen-community-1.0 | Objeto de esta ficha; sin censura; visión y MTP |
| StillDeadcode/qwen3.8-next-flash-iqr-v4 | no disponible | 262.144 entrenados / 200.000 servidos | `.rad` (radiance 2.x) | qwen-community-1.0 | Mismo formato y receta, versión alineada; KL medio 0,0224 |
| StillDeadcode/qwen3.8-next-flash-uncensored-fp8-iq4r-moe | no disponible | no disponible | Contenedor previo (no servido por radiance 2.x) | no disponible | Predecesor reemplazado por este archivo; fuente de los planos de expertos down |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | Modelo base del que se parte; sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias
- La alineación de seguridad ha sido eliminada: el modelo responde a peticiones que el original rechaza. No es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación: no evaluado en la información disponible; la cuantización agresiva de expertos (4 bits) puede ampliar la deriva respecto al bf16.
- La calidad no se ha medido contra los pesos bf16 propios; la cifra de KL (0,0224) corresponde al contenedor original, no a este archivo.
- Solo se ha verificado que carga y sirve en radiance 2.1.0 con `tp: 1` y que responde de forma similar al contenedor original en unas pocas preguntas simples; no hay evaluación sistemática.
- Dependencia total de un motor propietario y de una plataforma concreta (AMD RDNA4 + ROCm); no hay portabilidad a CUDA ni a ecosistemas estándar.
- Requiere NVMe para la tabla n-gram y unos 32 GB de RAM de host, lo que encarece el despliegue.
- Licencia `qwen-community-1.0`: hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la información disponible no detalla restricciones adicionales.
- Idiomas soportados no declarados; el comportamiento multilingüe no está documentado.
- Repositorio con cero descargas y cero likes: sin validación por parte de la comunidad.
- El nombre del modelo y las fechas de creación (2026) deben tratarse con cautela; la información procede únicamente de la model card y los metadatos de Hugging Face.

## Enlaces
- Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-uncensored-iqr-v4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Contenedor original de referencia: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4
- Contenedor predecesor: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-uncensored-fp8-iq4r-moe
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
