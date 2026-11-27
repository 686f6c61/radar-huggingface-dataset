# studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ4e

## Resumen

Inkling-2-Mini-Derisked-MLX-oQ4e es una conversión comunitaria a formato MLX del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, que a su vez es una modificación conductual del modelo original Thinking Machines Lab/Inkling-2-Mini. La conversión la firma el usuario studio-rizi y emplea el esquema de cuantización mixta oQ4e de oMLX, pensado para ejecutar el modelo en Apple Silicon con un peso en disco de aproximadamente 16,9 GB repartidos en cuatro shards, más un draft MTP de 0,64 GB.

El modelo subyacente es un transformer multimodal con arquitectura `inkling2_loop` (looped multimodal MoE) con 26.388.646.400 parámetros totales y una ventana de contexto declarada de 1M tokens. Incluye visión (422 tensores visuales) y una cabeza MTP (multi-token prediction) denominada DSpark que permite decodificación especulativa en el runtime oMLX. La modificación "Derisked" de Blackfrost-AI aplica una ortogonalización por consenso de columnas sobre la proyección de salida de atención (`attn.wo_ud.weight`) en las capas físicas 9-18 con alpha 2,5, con el objetivo de reducir falsos rechazos en peticiones seguras manteniendo un suelo de rechazo ante peticiones claramente dañinas.

La relevancia de esta ficha es doble: por un lado, ilustra el ecosistema de re-cuantización específica para hardware Apple (oMLX frente a mlx-lm estándar); por otro, documenta una intervención a nivel de pesos sobre un modelo loop, un tipo de modificación poco habitual y con implicaciones de validación importantes. La licencia es Apache 2.0 heredada del modelo original. El checkpoint no es cargable por `mlx-lm` estándar: requiere oMLX 0.8.4 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` — transformer multimodal MoE con passes en bucle (looped) |
| Parametros totales | 26.388.646.400 (26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (según model card del autor) |
| Tipos de cuantizacion | oQ4e (oMLX 0.8.4, imatrix-weighted): base 4-bit affine con grupo 64, protección de alta precisión en tensores sensibles; expertos de capas 0-19 en NVFP4 de origen, capas 20-23 en MXFP8/BF16; draft DSpark MTP preservado |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors (MLX, layout oQ); 4 shards, 16,2 GB + 0,64 GB de draft MTP |

## Arquitectura y entrenamiento

La arquitectura `inkling2_loop` es un transformer con mezcla de expertos (MoE) y passes en bucle: el bloque se ejecuta varias veces reutilizando pesos, lo que permite aumentar la profundidad efectiva sin incrementar el número de parámetros. Es multimodal (image-text-to-text) e incorpora una cabeza MTP (DSpark) que el runtime oMLX aprovecha para decodificación especulativa tipo Lightning MTP. La ventana de contexto declarada es de 1M tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La intervención "Derisked" de Blackfrost-AI no es un reentrenamiento: es una modificación a nivel de pesos que ortogonaliza por consenso de columnas la proyección de salida de atención en las capas físicas 9-18 (alpha 2,5), manteniendo intacta la estructura de passes del bucle. La verificación publicada por el autor de esta conversión indica que 1234 de 1244 tensores son idénticos byte a byte al checkpoint original de Thinking Machines Lab, y que solo difieren los 10 tensores `attn.wo_ud.weight` documentados. La cuantización oQ4e se calibró con el dataset `oqe_code_multilingual` (577 muestras de 512 tokens, adaptativo).

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Comprensión de imágenes (VLM): pipeline `image-text-to-text`, 422 tensores de visión incluidos en la conversión.
- Razonamiento multi-paso y conversaciones multi-turno con contexto largo (hasta 1M tokens declarados).
- Decodificación especulativa mediante el draft DSpark MTP preservado en `mtp.safetensors`.
- Mezcla de expertos con enrutamiento por token (parámetros activos no publicados).
- Modificación conductual orientada a reducir falsos rechazos en peticiones seguras, conservando un suelo de rechazo ante peticiones dañinas.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Evaluación interna de seguridad y calibración de rechazos: el modelo sirve para estudiar empíricamente cómo una intervención de ortogonalización sobre `attn.wo_ud.weight` afecta a la tasa de falsos rechazos frente a la tasa de rechazos correctos, comparándolo con el checkpoint original.
- Procesamiento de documentos largos en local: con 1M tokens de contexto declarado, puede ingerir contratos, informes o transcripciones extensas en un único prompt sobre un Mac con memoria unificada suficiente.
- Análisis de capturas y documentos escaneados: el pipeline image-text-to-text permite extraer y razonar sobre contenido visual sin salir del dispositivo.
- Asistencia conversacional en inglés y japonés: útil para prototipos de atención al cliente bilingüe en entornos controlados donde la latencia local y la privacidad priman sobre el throughput.
- Investigación sobre arquitecturas looped MoE: al conservar la estructura de bucle y el draft MTP, es un banco de pruebas para estudiar decodificación especulativa y reutilización de pesos en Apple Silicon.
- Desarrollo y depuración de runtimes MLX: sirve como caso de prueba para oMLX 0.8.4+ y para validar cargas de checkpoints con layout oQ frente a `mlx-lm` estándar.
- Prototipado offline en portátiles Apple: el tamaño de 16,9 GB permite trabajar sin conexión en equipos con memoria unificada de 24-32 GB o superior, según cuantización y overhead del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 16,9 GB en disco (16,2 GB de pesos + 0,64 GB de draft); en ejecución se necesita margen adicional para KV cache, que crece de forma considerable con contextos de hasta 1M tokens.
- Hardware objetivo: Apple Silicon exclusivamente (MLX). No es ejecutable en GPU NVIDIA o AMD mediante este checkpoint.
- Equipos viables: Mac con memoria unificada de 24 GB en adelante para contextos cortos; 32-64 GB o más para contextos medios; contextos cercanos a 1M tokens requieren configuraciones de memoria muy alta (Mac Studio o equivalentes).
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplicables a este checkpoint concreto por su formato MLX.
- Despliegue: oMLX 0.8.4 o superior (`omlx serve`), con API compatible con `/v1/chat/completions`. No cargable por `mlx-lm` estándar. `llama.cpp`, Ollama y TGI no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el uso del draft MTP sugiere mejoras de velocidad en decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked-MLX-oQ4e (este) | 26,4 B | 1M (declarado) | Texto + imagen | Apache 2.0 | MLX oQ4e, oMLX 0.8.4+ |
| thinkingmachines/Inkling-2-Mini | no disponible | 1M (declarado, según upstream) | Texto + imagen | Apache 2.0 | safetensors originales |
| Blackfrost-AI/Inkling-2-Mini-Derisked | no disponible | no disponible | Texto + imagen | Apache 2.0 (sujeta a términos upstream) | safetensors |

No se dispone de datos de benchmarks ni de modelos alternativos comparables fuera de la propia familia Inkling-2-Mini en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo describe explícitamente como material para investigación controlada y evaluación interna; la salida debe tratarse como dato no confiable.
- No es una frontera de seguridad: no sirve como mecanismo de autorización, aplicación de políticas ni control de acceso; el operador es responsable del control de acceso, cumplimiento y salvaguardas.
- Modificación conductual sobre un transformer loop: los comportamientos dependientes del bucle deben revalidarse en cada despliegue, ya que la intervención se aplicó a un modelo con passes repetidos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos generativos de este tamaño.
- Idiomas: solo inglés y japonés declarados; el rendimiento en castellano no está garantizado ni documentado.
- Compatibilidad limitada: no funciona con `mlx-lm` estándar ni con runtimes no-MLX; requiere oMLX 0.8.4 o superior.
- Conversión no oficial: no está afiliada a Thinking Machines Lab ni a Blackfrost-AI; posibles desviaciones respecto al checkpoint fuente no documentadas más allá de la verificación de 1234/1244 tensores idénticos.
- Licencia: Apache 2.0 heredada, pero Blackfrost publica Derisked "sujeto a los términos y avisos del modelo upstream"; conviene revisar dichos términos antes de redistribuir o desplegar en producción.
- Sin métricas de rendimiento publicadas: no hay benchmarks que permitan estimar la degradación introducida por la cuantización oQ4e frente al checkpoint original.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/studio-rizi/Inkling-2-Mini-Derisked-MLX-oQ4e
- Modelo base (Derisked): https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Perfil del autor de la modificación: https://huggingface.co/Blackfrost-AI
- Perfil de Thinking Machines Lab: https://huggingface.co/thinkingmachines
