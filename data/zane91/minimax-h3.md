# Zane91/MiniMax-H3

## Resumen

MiniMax H3 es un sistema generativo omni-modal de propósito general desarrollado por MiniMax (Hailuo AI), que entiende de forma conjunta contextos multimodales compuestos por texto, imágenes, vídeo y audio, y genera vídeo con audio estéreo nativo en la misma pasada. Su salida llega a resolución 2K (768p por defecto en la pasada base, ampliable con H3-Regenerate-2K), con duraciones de 4 a 15 segundos, 24 FPS y audio estéreo a 32 kHz. El modelo se distribuye con pesos abiertos bajo la licencia comunitaria MiniMax H3 Community License Agreement.

A diferencia de un generador de vídeo convencional, H3 se plantea como un sistema unificado de comprensión y generación: acepta instrucciones multimodales complejas y las resuelve mediante un módulo dedicado de interpretación de contexto (H3-Context-IR) que convierte la entrada en una representación intermedia antes de la generación. El sistema se compone de tres módulos: H3-Context-IR (comprensión y refinado de la instrucción), H3-Base (generación de audio y vídeo a 768p) y H3-Regenerate-2K (regeneración a 2K reinyectando el contexto original).

Es relevante ahora porque combina en un único modelo de pesos abiertos tareas que hasta hace poco requerían pipelines separados: texto-a-vídeo, imagen-a-vídeo, vídeo-a-vídeo, referencia multimodal a vídeo y generación de audio sincronizado con diálogo en 11 idiomas. La información disponible no incluye el número de parámetros, la arquitectura interna detallada ni el volumen de datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema generativo omni-modal; pesos distribuidos con `diffusers`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no aplica como ventana de texto; límites de entrada multimodal: hasta 9 imágenes, hasta 3 clips de vídeo y hasta 3 clips de audio, con un máximo de 12 archivos combinados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 11 idiomas con soporte estable para diálogo: árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español; otros idiomas con soporte variable |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (tags del repositorio), compatible con `diffusers` |
| Duracion de salida | 4–15 segundos |
| Resolucion de salida | lado corto a 768 píxeles por defecto; 2K mediante H3-Regenerate-2K |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | estéreo a 32 kHz, generado de forma nativa y sincronizada |
| Relaciones de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16, entre otras |
| Variantes | H3-Base-FL2VA (primer/último fotograma), H3-Base-Ref2VA (referencia omni-modal) |
| Tamano del repositorio | 353,9 GB |

## Arquitectura y entrenamiento

La información publicada describe H3 como un sistema generativo omni-modal con comprensión unificada de contexto multimodal (texto, imagen, vídeo y audio) y generación conjunta de vídeo y audio. No se especifica en la documentación disponible el tipo de columna vertebral (transformer, difusión, híbrido u otra), el número de parámetros, la profundidad de la red ni los detalles del tokenizador o del VAE. Tampoco se detallan los datos de entrenamiento: número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

El aspecto arquitectónico diferencial que sí está documentado es la división en tres módulos. H3-Context-IR interpreta y refina instrucciones multimodales complejas y las transforma en una representación intermedia de contexto (Context Intermediate Representation) que el generador entiende mejor; la propia documentación insiste en que este módulo es crítico para la calidad final y recomienda integrarlo en el pipeline o replicarlo siguiendo la guía de prompting. H3-Base consume esa representación y produce vídeo a 768p con audio nativo. H3-Regenerate-2K toma el resultado de 768p junto con el contexto original y regenera a 2K, aprovechando tanto la capacidad generativa como la información del contexto de entrada para recuperar detalle fino.

En el plano funcional, el sistema admite dos modos de entrada bien definidos. H3-Base-FL2VA trabaja con cero, una o dos imágenes (texto-a-vídeo, primer o último fotograma a vídeo, y primer-y-último fotograma a vídeo). H3-Base-Ref2VA acepta referencias multimodales mixtas de imagen, vídeo y audio bajo los límites indicados en la tabla anterior. No se han publicado detalles sobre decodificación, muestreo, número de pasos de inferencia ni estrategias de aceleración.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo nativo sincronizado.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo control de primer fotograma, último fotograma y combinación de ambos.
- Generación guiada por referencias multimodales mixtas (imágenes, clips de vídeo y clips de audio) en modo Ref2VA.
- Transformación de vídeo a vídeo y variantes audio-a-vídeo y audio-a-audio-vídeo.
- Generación de diálogo hablado en 11 idiomas (árabe, chino, inglés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español) con audio estéreo a 32 kHz.
- Salida en un rango amplio de relaciones de aspecto (21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras) con lado corto a 768 px por defecto.
- Ampliación a 2K mediante el módulo H3-Regenerate-2K, que reinyecta el contexto original.
- Comprensión de instrucciones multimodales complejas mediante H3-Context-IR.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje orientado a agentes).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; el pipeline sí es multi-etapa (Context-IR → Base → Regenerate-2K).
- Capacidades especiales: audio estéreo nativo generado en la misma pasada que el vídeo, sin pipeline de audio separado.

## Casos de uso

- Producción publicitaria de formato corto: generar clips de 4 a 15 segundos en 16:9 o 9:16 con audio ya sincronizado, evitando la postproducción de doblaje y mezcla para piezas de redes sociales.
- Storyboarding y previsualización cinematográfica: usar el modo FL2VA con primer y último fotograma para fijar encuadres concretos y obtener un animático con movimiento y sonido coherentes en 21:9.
- Localización de vídeo con diálogo: aprovechar el soporte estable de 11 idiomas para generar variantes de una misma pieza con el diálogo en distintos idiomas, manteniendo el audio estéreo a 32 kHz.
- Doblaje y re-generación audio-a-vídeo: en modo Ref2VA, tomar un clip de audio como referencia y generar el vídeo correspondiente con labios y sonido alineados.
- Posproducción de resolución: flujo de dos pasadas con H3-Base a 768p y H3-Regenerate-2K para entregables finales en 2K reutilizando el contexto original.
- Iteración creativa con referencias mixtas: alimentar hasta 9 imágenes, 3 clips de vídeo y 3 clips de audio (máximo 12 archivos) para fijar estilo, personajes y banda sonora en una misma generación.
- Integración en pipelines automatizados de contenido: desplegar el modelo vía API de MiniMax o mediante `diffusers` en un servicio interno que genere variantes de vídeo a partir de prompts estructurados producidos por H3-Context-IR.
- Prototipado de videojuegos y experiencias interactivas: generar cinemáticas cortas con audio sin necesidad de un equipo de animación y sonido para cada iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio y los materiales de búsqueda consultados no incluyen métricas cuantitativas (FVD, CLIP-score, VBench, MOS de audio ni comparativas numéricas con otros modelos), por lo que no se presentan cifras.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM en la información disponible.
- Estimación a partir del tamaño del repositorio (353,9 GB): los pesos completos superan ampliamente la memoria de una GPU de consumo, por lo que la inferencia requiere, como mínimo, un entorno multi-GPU con 80 GB por tarjeta y agregación por tensor parallelism o similar. Se trata de una estimación basada en el tamaño de los ficheros, no de un dato oficial.
- GPU recomendadas (estimación): H100 80 GB, A100 80 GB o H200 en configuraciones de varios nodos; la serie RTX 4090/5090 (24–32 GB) no puede alojar el conjunto de pesos completo.
- GPU de consumo: no viable para el modelo completo en una sola tarjeta con la información disponible. Sería necesario esperar a versiones cuantizadas o destiladas, que la documentación no menciona.
- Opciones de despliegue: API oficial de MiniMax (platform.minimax.io y platform.minimaxi.com), aplicación web de Hailuo AI y escritorio (hub.minimax.io / hub.minimaxi.com), y pesos abiertos con `diffusers` (los tags del repositorio incluyen `diffusers` y `safetensors`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye datos verificables de parámetros, contexto, licencia o rendimiento de modelos alternativos, por lo que no se puede construir una comparativa numérica fiable.

| Modelo | Tipo | Audio nativo | Resolución | Licencia | Datos en la información disponible |
|---|---|---|---|---|---|
| MiniMax H3 | Vídeo + audio omni-modal | Sí, estéreo 32 kHz | 768p, 2K con Regenerate-2K | Comunitaria MiniMax H3 | Documentados duración, FPS, relaciones de aspecto e idiomas de diálogo |
| Alternativas de generación de vídeo con pesos abiertos (por ejemplo, familias tipo Wan, HunyuanVideo, LTX-Video) | Vídeo | no disponible | no disponible | no disponible | No incluidos en la información proporcionada |
| Alternativas propietarias de vídeo con audio (por ejemplo, Veo, Sora, Kling) | Vídeo + audio | no disponible | no disponible | no disponible | No incluidos en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas en la información disponible; no hay evidencia pública de rendimiento comparativo frente a alternativas.
- Riesgo de alucinación visual y sonora: como modelo generativo, puede producir contenido plausible pero incorrecto, incoherencias temporales entre fotogramas, artefactos en movimiento rápido o desincronía entre labios y diálogo.
- Limitación dura de duración: la salida está acotada a 4–15 segundos; no está diseñado para vídeo de formato largo en una sola generación.
- Resolución base limitada a 768p en el lado corto; el 2K exige una segunda pasada con H3-Regenerate-2K, lo que duplica coste de cómputo.
- Frecuencia fija de 24 FPS y audio de salida fijo a 32 kHz estéreo; no se documentan opciones de configuración alternativas.
- Límites estrictos de entrada en modo Ref2VA: máximo 9 imágenes, 3 clips de vídeo y 3 clips de audio, cada clip de 2 a 15 segundos, con un total combinado de 12 archivos. Superar esos límites requiere trocear la entrada.
- Soporte desigual de idiomas: solo 11 lenguas tienen soporte estable para diálogo; el resto funciona de forma variable, con riesgo de pronunciación o sincronía deficiente.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de representación en la generación de personas, voces o escenas.
- Licencia: se distribuye bajo la MiniMax H3 Community License Agreement, no bajo una licencia de código abierto estándar. Es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones, umbrales de facturación y restricciones de uso no se detallan en la información disponible.
- El repositorio analizado (Zane91/MiniMax-H3) es una subida de terceros con 0 descargas y 0 likes; para producción conviene verificar la integridad de los pesos frente al repositorio oficial MiniMaxAI/MiniMax-H3.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta el dimensionamiento de infraestructura.
- El módulo H3-Context-IR es determinante para la calidad de salida; omitirlo o sustituirlo por un procesado de prompt deficiente degrada el resultado, según advierte la propia documentación.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Zane91/MiniMax-H3
- Repositorio oficial en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio oficial en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Skills oficiales para mejora de prompts: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- Blog de lanzamiento: https://www.minimax.io/blog/minimax-h3
- Web oficial de MiniMax: https://www.minimax.io
- Aplicación web Hailuo AI (global): https://hailuoai.video
- Herramienta MiniMax H3 en Hailuo AI: https://hailuoai.video/tools/minimax-h3
- Aplicación web Hailuo AI (China): https://hailuoai.com/
- Aplicación de escritorio (global): https://hub.minimax.io/
- Aplicación de escritorio (China): https://hub.minimaxi.com/
- Documentación de API de generación de vídeo (global): https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- Documentación de API de generación de vídeo (China): https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentación de generación de texto (API): https://platform.minimax.io/docs/guides/text-generation
- Contacto / FAQ: https://platform.minimaxi.com/docs/faq/contact-us
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Hub comunitario de terceros con workflows de ComfyUI: https://github.com/ai-models-lab/minimax-h3
- Ficha de terceros con especificaciones adicionales: https://layer.ai/models/minimax-h3
