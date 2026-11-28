# teejer/Ling-3.2-air-mlx-mixed-4-8bit

## Resumen

Ling-3.2-air-mlx-mixed-4-8bit es una conversión a formato MLX del modelo inclusionAI/Ling-3.2-air, un modelo híbrido MoE de 124B parámetros totales con 5,5B activos por token. La conversión, publicada por el usuario teejer, aplica cuantización de precisión mixta sobre los expertos del bloque MoE: las capas identificadas como críticas para código se almacenan a 8 bits (grupo 64, affine) y el resto a 4 bits (grupo 64). El objetivo es preservar la calidad en tareas de programación reduciendo el peso total del modelo a 91,3 GB.

El modelo base, Ling-3.2-air, es un transformer híbrido con arquitectura MoE y una cabeza NextN de predicción multi-token (MTP) ubicada en `model.layers.42.*`. La conversión elimina la torre de visión del modelo original, por lo que esta variante es exclusivamente de texto; existe una variante VL separada. La selección de capas a 8 bits se realizó perfilando las activaciones top-k del router sobre un corpus de código frente a una línea base de prosa, con una puntuación por capa que combina la concentración de enrutamiento top-10 y la masa específica de código.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización selectiva guiada por perfilado de router, poco común en el ecosistema MLX; por otro, permite ejecutar un modelo de 124B en hardware Apple Silicon con un peso manejable, manteniendo la cabeza MTP para decodificación especulativa (el autor reporta una mejora de aproximadamente el 31 % en decodificación con el parche correspondiente de mlx-serve).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con cabeza NextN MTP (bailing_hybrid) |
| Parámetros totales | 124B (modelo base); 804.784.640 en el checkpoint safetensors empaquetado |
| Parámetros activos | 5,5B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: 4 bits grupo 64 (mayoría de capas) y 8 bits grupo 64 affine (capas de expertos 11, 12, 17, 20, 23, 24, 27, 29, 30, 32, 35, 36) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, empaquetado en palabras uint32) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido con capas MoE y una cabeza NextN de predicción multi-token (MTP), identificada en el ecosistema MLX como `bailing_hybrid` / `bailing_moe_v3`. El modelo original se distribuye en FP8 con bloques de 128. La conversión mantiene la cabeza MTP en `model.layers.42.*`, lo que permite decodificación especulativa con el parche MTP-for-MLX-packs de mlx-serve, con una ganancia reportada de aproximadamente el 31 % en velocidad de decodificación.

El proceso de cuantización mixta se basa en un perfilado del router: para cada capa se calcula una puntuación combinando la concentración de enrutamiento top-10 sobre un corpus de código y la masa específica de código frente a una línea base de prosa. Las doce capas con mayor puntuación se almacenan a 8 bits y el resto a 4 bits. Los bits por tensor son deducibles de la geometría empaquetada (los pesos se empaquetan en palabras uint32), de modo que mlx-serve carga el paquete sin modificaciones. La dequantización FP8 e4m3fn se verificó como exacta frente a torch, y el empaquetado se validó con decodificación greedy contra la implementación independiente de mlx-lm. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto en inglés, con especial énfasis en tareas de código gracias a la preservación a 8 bits de las capas de expertos relevantes para programación.
- Razonamiento y generación de código: la selección de capas se guió por perfilado sobre un corpus de código, por lo que se espera un rendimiento superior al de una cuantización uniforme a 4 bits en esta tarea.
- Decodificación especulativa mediante la cabeza NextN MTP, con el parche MTP-for-MLX-packs de mlx-serve (mejora reportada de aproximadamente el 31 % en decodificación).
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.
- No incluye visión: la torre de visión del modelo base fue eliminada en esta conversión (existe una variante VL separada).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local sobre Apple Silicon: el modelo puede ejecutarse en un Mac con suficiente memoria unificada y generar código en inglés, aprovechando que las capas de expertos con mayor masa de código se conservan a 8 bits para reducir la degradación frente a una cuantización uniforme.
- Autocompletado y revisión de código en entornos de desarrollo: la cabeza MTP permite decodificación especulativa, lo que reduce la latencia en flujos interactivos de sugerencia de código.
- Generación de documentación técnica y comentarios de código: el modelo puede producir texto técnico en inglés a partir de fragmentos de código, con un contexto que conviene validar empíricamente dado que la longitud de contexto no está documentada.
- Evaluación de técnicas de cuantización selectiva: el paquete incluye `mixed-quant.json` con la procedencia del perfilado, lo que lo convierte en un caso de estudio reproducible para investigadores que quieran replicar o comparar estrategias de cuantización guiada por router.
- Despliegue de un modelo de 124B en hardware de consumo de gama alta: con 91,3 GB de pesos, un Mac Studio con 128 GB o más de memoria unificada puede alojar el modelo servido con mlx-serve.
- Experimentación con decodificación especulativa MTP: sirve como banco de pruebas para medir la ganancia del parche MTP-for-MLX-packs en cargas de trabajo reales.
- Investigación sobre enrutamiento MoE: el perfilado por capa y la distinción entre capas a 4 y 8 bits permiten estudiar cómo afecta la precisión de los expertos a la calidad por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una muestra de validación greedy y una mejora de decodificación de aproximadamente el 31 % con el parche MTP de mlx-serve.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 91,3 GB en el repositorio; se necesita memoria unificada suficiente para alojar los pesos más el espacio de trabajo de inferencia (activaciones, caché KV), por lo que se recomienda un mínimo de 128 GB.
- GPU recomendadas: no aplica directamente, ya que el formato MLX está diseñado para Apple Silicon. No hay información sobre ejecución en GPU NVIDIA o AMD.
- Hardware de consumo: viable en Mac Studio o MacBook Pro con 128 GB o más de memoria unificada. No cabe en configuraciones de 16, 24, 32, 48 o 64 GB.
- Opciones de despliegue: mlx-serve (backend `bailing_hybrid`, pasando el directorio del paquete como ruta absoluta) y mlx-lm para validación. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta aproximadamente un 31 % de mejora en decodificación con el parche MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| teejer/Ling-3.2-air-mlx-mixed-4-8bit | 124B | 5,5B | no disponible | Mixta 4/8 bits | no disponible | safetensors MLX |
| inclusionAI/Ling-3.2-air | 124B | 5,5B | no disponible | FP8 block-128 | no disponible | no disponible |
| teejer/Ling-3.2-air-mlx-mixed-4-8bit-vl | 124B | 5,5B | no disponible | Mixta 4/8 bits | no disponible | safetensors MLX |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo inglés: los metadatos declaran únicamente el idioma `en`, por lo que no se debe asumir soporte multilingüe.
- Sin visión: la torre de visión fue eliminada; para tareas multimodales debe usarse la variante VL.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Longitud de contexto no documentada: limita la planificación de casos de uso con documentos largos.
- Cuantización mixta: aunque preserva capas críticas para código, sigue siendo una reducción de precisión respecto al FP8 original; la calidad en dominios distintos del código puede degradarse más.
- Dependencia de herramientas concretas: requiere mlx-serve y, para la ganancia MTP, un parche específico; no hay soporte documentado en otros motores de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.
- El número de parámetros reportado en safetensors (804.784.640) no coincide con los 124B del modelo base, lo que sugiere que el checkpoint empaquetado se distribuye en varios archivos o que el dato corresponde solo a una parte; conviene verificar la integridad del paquete antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teejer/Ling-3.2-air-mlx-mixed-4-8bit
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Variante VL: https://huggingface.co/teejer/Ling-3.2-air-mlx-mixed-4-8bit-vl
- Kit de conversión, perfilado y validación: https://github.com/Teejer/ling-3.2-air-mlx
- Servidor de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
