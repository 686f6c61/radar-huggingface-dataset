# timesmith/Inkling-2-Mini-oQ4e

## Resumen

Inkling-2-Mini-oQ4e es una versión cuantizada del modelo multimodal Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. La cuantización se ha realizado con oQ (oMLX v0.8.3), una herramienta de cuantización de precisión mixta, y produce un checkpoint con un promedio efectivo de 5,047 bits por peso. El resultado es un modelo de aproximadamente 26.700 millones de parámetros lógicos que ocupa unos 16,9 GB en disco, lo que lo hace manejable en hardware de gama alta de consumo.

El modelo original Inkling-2-Mini parece ser un modelo multimodal (incluye un componente de visión de 0,318B parámetros junto al modelo de lenguaje de 26,388B). La etiqueta `inkling2_loop` sugiere alguna forma de arquitectura con bucles o recurrencia, aunque la información disponible no detalla su funcionamiento. La librería indicada es MLX, el framework de Apple para ejecución en silicio de la compañía, lo que orienta el modelo hacia Macs con chip Apple Silicon.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización mixta poco habitual (combina bloques afines de 4 y 8 bits con NVFP4 de 4 bits) que busca preservar calidad en capas sensibles; por otro, advierte de que la información pública es muy escasa (sin model card del modelo base, sin licencia declarada, sin benchmarks), lo que limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop` sugiere bucle/recurrencia; sin confirmar) |
| Parametros totales | 26.388.646.400 (modelo de lenguaje); 26.707B lógicos incluyendo visión |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: afín 4-bit grupo 64, NVFP4 grupo 16, afín 8-bit grupo 64, BF16 y FP32 en capas seleccionadas; media efectiva 5,047 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Inkling-2-Mini: ni el tipo de transformer, ni si emplea atención lineal, mezcla de expertos o mecanismos recurrentes. La etiqueta `inkling2_loop` es el único indicio y apunta a algún esquema de procesamiento iterativo o en bucle, pero no hay documentación que lo confirme. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) ni innovaciones técnicas del modelo original.

Lo que sí está documentado es el proceso de cuantización. oQ (oMLX v0.8.3) asigna formatos distintos según la sensibilidad de cada tensor: el 76,3 % de los pesos lógicos (20,384B) se guarda en NVFP4 con grupo 16 (4,50 bits efectivos), el 15,3 % (4,077B) en afín 4-bit con grupo 64 (4,50 bits), el 5,9 % (1,572B) en afín 8-bit con grupo 64 (8,50 bits) y un 2,5 % restante se mantiene en BF16 o FP32 (0,637B y 0,036B respectivamente). El componente de visión (0,318B) ocupa 0,637 GB. Esta distribución busca concentrar la precisión en las capas más críticas y comprimir agresivamente el resto.

## Capacidades

- Generación de texto y razonamiento: capacidades esperables de un modelo de ~26B, aunque no verificadas por benchmarks públicos.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,318B parámetros, por lo que se espera soporte multimodal de entrada de imagen.
- Código y matemáticas: no disponible (sin datos de evaluación).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento explícito (thinking): no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al estar empaquetado para MLX y ocupar 16,9 GB, puede ejecutarse en equipos con 32 GB o más de memoria unificada, útil para prototipado y experimentación sin GPU dedicada.
- Análisis de documentos con imágenes: el módulo de visión permite procesar capturas, diagramas o páginas escaneadas junto a texto en un mismo flujo, siempre que se valide la calidad real del componente visual.
- Asistentes conversacionales de contexto medio: un modelo de ~26B suele manejar conversaciones multi-turno razonablemente, aunque la longitud de contexto no está confirmada y debe medirse antes de desplegar.
- Evaluación comparativa de cuantizaciones: sirve como caso de estudio para medir el impacto de la cuantización mixta oQ frente al modelo original en tareas de generación y razonamiento.
- Investigación sobre arquitecturas con bucle: si se confirma el mecanismo `inkling2_loop`, puede emplearse para estudiar el comportamiento de modelos recurrentes o iterativos cuantizados.
- Fine-tuning ligero y experimentación: el formato safetensors y el tamaño contenido permiten adaptaciones con LoRA en hardware de una sola GPU de 24-48 GB, previa verificación de compatibilidad con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16-17 GB solo para los pesos; con caché KV y overhead de ejecución, se recomienda un mínimo de 24 GB y preferiblemente 32 GB o más.
- GPU recomendadas: no hay datos oficiales; por tamaño, encajaría en RTX 4090 (24 GB), RTX 5090, A100 40/80 GB, H100 y Apple Silicon con memoria unificada de 32 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max).
- ¿Cabe en consumer GPU? Sí, en tarjetas con 24 GB o más si se usa un runtime compatible; en GPUs de 16 GB no cabría sin cuantización adicional.
- Opciones de despliegue: MLX (librería declarada) es la vía natural; llama.cpp, Ollama, vLLM o TGI no están confirmados para este formato NVFP4/afín mixto y requerirían conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e | 26,7B lógicos (26,4B LM + 0,3B visión) | no disponible | no disponible | safetensors MLX (mixto 4/8-bit) | Hugging Face |
| Modelos densos ~27B (p. ej. Gemma 3 27B) | ~27B | hasta 128K en algunas variantes | licencia abierta con términos | safetensors, GGUF, MLX | amplia |
| Modelos MoE ~30B con ~3B activos (p. ej. Qwen3-30B-A3B) | ~30B totales, ~3B activos | hasta 128K | Apache 2.0 en variantes abiertas | safetensors, GGUF | amplia |

La comparación es orientativa: no hay datos de rendimiento de Inkling-2-Mini-oQ4e que permitan confrontarlo con alternativas consolidadas. Su principal diferenciador es la cuantización mixta oQ y el empaquetado MLX; sus principales desventajas son la ausencia de licencia, idiomas y benchmarks documentados.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin model card del modelo base: se desconoce el origen de los datos de entrenamiento, los sesgos potenciales y las capacidades reales.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado para este checkpoint.
- Cuantización agresiva: el 76 % de los pesos en NVFP4 puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo) respecto al modelo original.
- Idiomas y contexto desconocidos: no se puede garantizar soporte del castellano ni una ventana de contexto concreta.
- Formato poco común: la combinación de NVFP4 y bloques afines mixtos limita la portabilidad a runtimes distintos de MLX.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Fecha de creación futura (2026-11-26) en los metadatos: indica posible inconsistencia en la publicación, a verificar.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible
- Paper, blog o demo del modelo: no disponible
