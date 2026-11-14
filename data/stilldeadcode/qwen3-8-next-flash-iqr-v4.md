# StillDeadcode/qwen3.8-next-flash-iqr-v4

## Resumen

Qwen3.8-Next-Flash-IQR-V4 es un contenedor de inferencia cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario StillDeadcode. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original en bf16 a un único fichero `.rad` de 113,3 GiB, pensado para el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. La cuantización combina códigos trellis de 4 y 5 bits, GPTQ con matrices de Hadamard y rotaciones Walsh-Hadamard de 128 puntos, int8 para el tronco y bf16 para la torre de visión y diez expertos protegidos.

El modelo base es un Mixture-of-Experts multimodal (pipeline image-text-to-text) con una cabeza MTP de profundidad 3 para decodificación especulativa y una ventana de contexto entrenada de 262.144 tokens, servida a 200K. La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización agresiva que preserva calidad medible (KL media de 0,0680 frente al bf16); por otro, es uno de los pocos ejemplos públicos de despliegue de un MoE grande en hardware AMD consumer/prosumer mediante streaming de expertos desde RAM del host.

El contenedor requiere una build de radiance posterior a la 1.17.0 que, según el autor, no estaba publicada en el momento de la subida. El repositorio ocupa 121,7 GB y no registra descargas, aunque cuenta con 3 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (atención + delta net + capa n-gram + torre de visión), con cabeza MTP para decodificación especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens entrenados; servido a 200.000 |
| Tipos de cuantizacion | 4-bit trellis (expertos enrutados gate_up), 4-bit codebook no uniforme de 16 niveles (down), 5-bit trellis (query-gate y proyección de entrada de delta net), int8 rotado (resto de lineales, lm_head), E4M3 (matrices de hyper-connection), bf16 (torre de visión y 10 expertos protegidos) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con atención estándar, capas delta net, una capa n-gram y una torre de visión que acepta imágenes y vídeo en peticiones de chat. Incluye una cabeza MTP (multi-token prediction) de profundidad 3 que el motor usa como especulador para decodificación especulativa. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si se aplicaron RLHF o DPO; esa información pertenece a la model card de Qwen y no se ha proporcionado.

La aportación técnica de esta conversión es la receta de cuantización. Los expertos enrutados gate_up se codifican con códigos trellis de 4 bits tras una rotación Walsh-Hadamard de 128 puntos, elegidos por GPTQ sobre hessianos registrados del modelo bf16. La proyección down usa códigos de 4 bits en un codebook no uniforme de 16 niveles, con una escala E4M3 por cada 64 pesos, refinada con tres pasadas de descenso por coordenadas. Diez expertos que concentran la mayor parte de la energía de la proyección down de su capa se mantienen en bf16. El tronco mezcla códigos trellis de 5 bits (query-gate y entrada de delta net) con int8 rotado y escalas buscadas por mínimo error. La calibración usó 3,4 millones de tokens de chat, uso de herramientas y código, y no se publica.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto largo (hasta 200K tokens servidos).
- Procesamiento de imagen y vídeo en mensajes de chat mediante la torre de visión en bf16.
- Tool calling y function calling a través de la API compatible con OpenAI del servidor radiance.
- Salida estructurada (structured output) en las rutas `/v1/chat/completions` y `/v1/completions`.
- Decodificación especulativa con la cabeza MTP del propio modelo (3 tokens de borrador por defecto, ventana adaptativa opcional).
- Capacidades de código y uso de herramientas inferidas de la composición del dataset de calibración (chat, tool-use y código).
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente de chat multimodal de contexto largo: el modelo acepta imágenes y vídeo junto a texto en la misma conversación y mantiene hasta 200K tokens de contexto, adecuado para análisis de documentos extensos con figuras o revisión de capturas de pantalla en soporte técnico.
- Automatización de agentes con tool calling: el servidor expone function calling y salida estructurada sobre la API de OpenAI, lo que permite integrarlo en orquestadores de agentes existentes sin adaptadores propietarios.
- Generación y revisión de código en pipelines: la calibración incluyó transcripciones de código, y el soporte de tool calling facilita conectarlo a linters, ejecutores de tests o sistemas de CI/CD como paso de revisión.
- Procesamiento de vídeo e imagen por lotes: la torre de visión en bf16 sin cuantizar permite tareas de descripción, extracción de información o moderación sobre contenido visual servido a través de `image_url` y partes de vídeo.
- Despliegue en hardware AMD RDNA4: es uno de los pocos contenedores documentados para ROCm en GPUs Radeon AI PRO R9700, útil para equipos que quieren evitar dependencia de CUDA.
- Servicio multi-stream de baja concurrencia: con 8 secuencias máximas y 17,7 tokens por paso agregados en ocho streams, encaja en backends internos de productividad con pocos usuarios simultáneos y requisitos de latencia moderados.
- Investigación en cuantización: la receta publicada (fichero `.recipe` en el repositorio) y las métricas KL permiten reproducir y comparar estrategias de cuantización de MoE sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad frente al modelo bf16 y de rendimiento del motor:

| Metrica | Este contenedor | qwen3.8-next-flash-fp8-iq4r-moe |
|---|---|---|
| KL media (todas las posiciones) | 0,0680 | 0,0730 |
| KL mediana | 0,0031 | 0,0035 |
| KL p99 | 1,43 | 1,49 |
| Acuerdo top-1 | 93,38% | 93,04% |
| KL media (posiciones escritas por el modelo) | 0,0224 | 0,0250 |
| KL mediana (posiciones del modelo) | 0,0025 | 0,0029 |
| KL p99 (posiciones del modelo) | 0,29 | 0,34 |
| Acuerdo top-1 (posiciones del modelo) | 94,93% | 94,54% |

Medición sobre 83.053 posiciones con teacher forcing (66.187 escritas por el modelo). Con el wire entre tarjetas con pérdida (`tp-wire: wht6`), la KL media en posiciones del modelo es 0,0242 frente a 0,0279 del contenedor anterior.

Rendimiento en 2× Radeon AI PRO R9700 (gfx1201), un stream: ~12,5 ms por paso de decodificación con ~2,4 tokens aceptados por paso (13,2 ms tras un prompt de 1K tokens, 15,2 ms tras 178K). Cuatro streams: 23 ms por paso y ~9,3 tokens. Ocho streams: 32 ms y ~17,7 tokens. Prefill de ~6.700 tokens/s en un prompt de 24K tokens.

## Requisitos de hardware

- VRAM: los expertos enrutados no caben en dos tarjetas de 32 GB; el motor mantiene los más usados en VRAM y hace streaming del resto desde un pool fijado en RAM del host.
- RAM del host: aproximadamente 32 GB libres como mínimo; la configuración de ejemplo reserva 12.288 MiB de host-pool.
- Almacenamiento: el contenedor (113,3 GiB) debe residir en un NVMe, porque la tabla n-gram se lee del disco bajo demanda.
- GPU recomendadas: 2× Radeon AI PRO R9700 (gfx1201, RDNA4) es la configuración medida por el autor. No hay datos de funcionamiento en otras GPU AMD ni en NVIDIA.
- GPU consumer: no hay información sobre viabilidad en GPUs consumer de gama alta; el requisito de ROCm y RDNA4 limita el conjunto de tarjetas compatibles.
- Despliegue: exclusivamente mediante el motor radiance (build posterior a 1.17.0, no publicada en el momento de la subida). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.rad` no es compatible con ellos.
- Latencia y throughput: ver la sección de benchmarks (12,5 ms por paso en un stream, ~6.700 tokens/s de prefill).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-next-flash-iqr-v4 (esta ficha) | no disponible (MoE) | 200K servidos (262.144 entrenados) | 4/5-bit trellis + int8 + bf16 selectivo | qwen-community-1.0 | Contenedor `.rad`, motor radiance >1.17.0 no publicado |
| qwen3.8-next-flash-fp8-iq4r-moe | no disponible (MoE) | no disponible | FP8 + IQ4 en expertos | qwen-community-1.0 | Contenedor radiance previo, misma familia |
| Qwen/Qwen3.8-Flash-Next (bf16) | no disponible (MoE) | 262.144 | bf16 | qwen-community-1.0 | Pesos originales en Hugging Face |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos MoE multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el motor radiance en una versión posterior a la 1.17.0 que no estaba publicada en el momento de la subida, por lo que no puede ejecutarse con las herramientas estándar del ecosistema.
- Dependencia de hardware muy específica: ROCm y GPUs AMD RDNA4 (gfx1201). No hay evidencia de funcionamiento en NVIDIA, Apple Silicon ni GPUs AMD de generaciones anteriores.
- El streaming de expertos desde RAM implica latencia dependiente del ancho de banda de host y PCIe; el rendimiento medido corresponde a una configuración concreta de dos tarjetas y no es extrapolable.
- La cuantización introduce pérdida medible: KL media de 0,0680 y acuerdo top-1 del 93,38% frente al bf16 en todas las posiciones; el p99 de 1,43 indica colas con divergencia notable en algunas posiciones.
- La calibración (3,4M tokens de chat, tool-use y código) no se publica, lo que dificulta evaluar el sesgo de la receta hacia dominios concretos y reproducir la conversión.
- Los datos de calibración y los hessianos no están disponibles, y el autor no documenta evaluación de sesgos, alucinación ni cobertura idiomática.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el fichero LICENSE antes de desplegar en producción.
- El repositorio no registra descargas y el autor es un particular (StillDeadcode), no el equipo de Qwen; no hay garantía de mantenimiento ni soporte.
- Solo 8 secuencias concurrentes en la configuración de ejemplo, lo que limita el uso como servicio de alta concurrencia.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-iqr-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Contenedor previo de la misma familia: https://huggingface.co/StillDeadcode/qwen3.8-next-flash-fp8-iq4r-moe
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
