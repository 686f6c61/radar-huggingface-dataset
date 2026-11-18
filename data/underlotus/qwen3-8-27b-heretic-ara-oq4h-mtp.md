# underlotus/Qwen3.8-27B-heretic-ara-oQ4h-mtp

## Resumen

Qwen3.8-27B-heretic-ara-oQ4h-mtp es una versión cuantizada del modelo Qwen3.8-27B, distribuida por el usuario underlotus en Hugging Face. Se trata de un checkpoint en formato MLX (Apple Silicon) que combina pesos en precisión mixta mediante la herramienta oQ (oMLX v0.8.0), con una media efectiva de 19,429 bits por peso. El nombre del repositorio sugiere una variante "heretic" (presumiblemente un ajuste orientado a reducir rechazos o censura) y "ara", cuyo significado no está documentado en la información disponible.

El dato de parámetros totales almacenados en safetensors es de 7.212.759.280 (aproximadamente 7,2 mil millones), lo que contradice la denominación "27B" del nombre del modelo: o bien el nombre hace referencia al modelo base del que deriva, o bien la nomenclatura es engañosa. El repositorio ocupa 17,5 GB y desglosa los pesos en un modelo de lenguaje (6,327B), un componente de visión (0,461B) y una cabeza MTP (0,425B), lo que indica una arquitectura multimodal con decodificación especulativa multi-token.

La relevancia de esta ficha es limitada por la escasez de información: no hay model card sustantiva, no se declara licencia, no se especifican idiomas ni benchmarks, y el modelo tiene cero descargas y cero likes en el momento de la consulta. Es, por tanto, un artefacto de publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican qwen3_5; componentes de lenguaje, visión y cabeza MTP) |
| Parametros totales | 7.212.759.280 (~7,2B) |
| Parametros activos | no disponible (no se declara MoE; la cabeza MTP no implica MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4/5/6/8-bit grupo 64, BF16 y U32 (oQ / oMLX v0.8.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura completa. Los tags (`qwen3_5`, `mtp`) y el desglose de componentes apuntan a un transformer derivado de la familia Qwen3, con tres bloques diferenciados: un modelo de lenguaje de 6,327B parámetros lógicos, un codificador o torre de visión de 0,461B y una cabeza MTP (multi-token prediction) de 0,425B. La presencia de la cabeza MTP sugiere soporte de decodificación especulativa, técnica en la que el modelo predice varios tokens por paso para acelerar la inferencia.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO o alguna fase de alineación. El sufijo "heretic" en el nombre es una convención de la comunidad para variantes con ajuste fino orientado a reducir comportamientos de rechazo, pero no hay confirmación técnica de ello en la model card. La cuantización oQ distribuye los pesos de forma no uniforme: el 47,1% de los pesos lógicos se almacena en U32 (12,66 GiB), lo que eleva el tamaño del repo muy por encima de lo esperable en una cuantización 4-bit convencional; el resto se reparte entre affine 4-bit (4,6%), 5-bit (18,1%), 6-bit (17,6%), 8-bit (0,1%) y BF16 (12,5%).

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 6,327B parámetros lógicos permite tareas generativas estándar, aunque no hay evaluación publicada.
- Procesamiento de visión: la torre de visión de 0,461B parámetros indica capacidad multimodal de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP de 0,425B parámetros habilita predicción multi-token, orientada a reducir latencia en generación autoregresiva.
- Tool calling y function calling: no disponible (no documentado).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX, el modelo está pensado para ejecutarse en Macs con chip M-series mediante la librería mlx; su tamaño de 17,5 GB lo hace viable en equipos con 24-32 GB de memoria unificada.
- Prototipado de pipelines multimodales: la combinación de torre de visión y modelo de lenguaje permite experimentar con tareas imagen-texto en entornos de desarrollo locales, sin depender de infraestructura en la nube.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse para reducir la latencia en aplicaciones interactivas donde el tiempo de respuesta es crítico.
- Evaluación comparativa de cuantizaciones: al tratarse de una cuantización mixta oQ, sirve como referencia para medir el impacto de precisiones heterogéneas (4/5/6/8-bit, BF16, U32) en calidad y velocidad frente a cuantizaciones uniformes.
- Experimentación con variantes "heretic": útil para investigadores interesados en estudiar el efecto de ajustes orientados a reducir rechazos, comparándolo con el modelo base.
- Despliegue en entornos de recursos limitados: el formato MLX y el tamaño contenido permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada, siempre que se use hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 17,5 GB (16,314 GiB de pesos); en inferencia MLX se necesita memoria unificada suficiente para cargar los pesos más el overhead de activaciones, orientativamente 20-24 GB como mínimo.
- GPU recomendadas: no aplica GPU dedicada; el formato es MLX, específico de Apple Silicon. Para CUDA sería necesario reconvertir los pesos a otro formato (no disponible en el repo).
- ¿Cabe en consumer GPU? No en el sentido habitual (NVIDIA/AMD); cabe en Macs con memoria unificada de 24 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max con configuración adecuada).
- Opciones de despliegue: librería mlx (mlx-lm / mlx-vlm según el caso); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en el formato actual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara-oQ4h-mtp | ~7,2B (según safetensors) | no disponible | no disponible | MLX safetensors | Hugging Face (0 descargas) |
| Qwen3 (familia base) | no disponible en esta ficha | no disponible | no disponible | safetensors/GGUF | Hugging Face |
| Alternativas MLX 4-bit de la familia Qwen | no disponible | no disponible | no disponible | MLX safetensors | Hugging Face |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas concretas; la información proporcionada no incluye benchmarks ni especificaciones del modelo base.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- Discrepancia de nomenclatura: el nombre indica "27B" pero los safetensors suman ~7,2B parámetros; conviene verificar a qué modelo base corresponde realmente antes de confiar en él.
- Sin benchmarks ni evaluación: no hay evidencia publicada de calidad, alucinación o rendimiento; no es recomendable para producción sin validación propia.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes de uso.
- Variante "heretic": los ajustes orientados a reducir rechazos pueden aumentar el riesgo de respuestas inapropiadas, sesgadas o inseguras; requiere filtrado y moderación adicional.
- Cuantización mixta con un 47% de pesos en U32: el tamaño resultante (17,5 GB) es mayor de lo esperable en 4-bit, lo que limita su uso en equipos con menos memoria.
- Formato MLX: no es portable directamente a entornos CUDA; requiere conversión para despliegue en GPU NVIDIA.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni ventanas largas.
- Riesgo de alucinación: inherente a modelos generativos y no cuantificado en este caso.

## Enlaces

- Hugging Face: https://huggingface.co/underlotus/Qwen3.8-27B-heretic-ara-oQ4h-mtp
- oQ / oMLX (herramienta de cuantización citada): https://github.com/jundot/omlx
- Repositorio del modelo base Qwen3: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible
- Demos: no disponible
