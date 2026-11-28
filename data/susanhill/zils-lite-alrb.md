# SusanHill/zils-lite-alrB

## Resumen

zils-lite-alrB es un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill bajo licencia Apache-2.0. Según la model card, se trata de un "soup body" del modelo d3-lite orientado a tareas de decisión: tool calling, razonamiento, análisis de matices del lenguaje (emoción, ironía, sarcasmo, sentimiento) y clasificación/recuperación de textos. El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors y un repositorio de 1,7 GB.

El problema que aborda es la especialización de un modelo base pequeño (0,8B) en tareas de decisión y clasificación sobre conjuntos de datos públicos de entrenamiento, en lugar de la generación abierta de propósito general. La relevancia actual radica en el interés por modelos compactos que puedan desplegarse en entornos con recursos limitados y que cubran tareas concretas de enrutamiento, clasificación y razonamiento de varios pasos sin requerir infraestructura de gran escala.

La información publicada es escasa: no se detallan los idiomas soportados, la longitud de contexto, los resultados de benchmarks ni la composición exacta del dataset de entrenamiento. La model card únicamente indica la receta de ajuste (LoRA sobre el modelo base) y la lista de conjuntos de datos empleados. Todo dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5`), ajuste LoRA |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, una arquitectura transformer de la familia Qwen3.5, y se ha ajustado mediante LoRA según la model card. El resultado se describe como un "soup body" del modelo d3-lite, es decir, una combinación de pesos o ajustes sobre el modelo base orientada a tareas de decisión. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga requiere ejecutar código personalizado del autor (`trust_remote_code=True`), un aspecto a considerar en entornos de producción por motivos de seguridad y reproducibilidad.

Los datos de entrenamiento declarados cubren las particiones públicas de entrenamiento de varios conjuntos: tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), artes del lenguaje (emoción, ironía, sarcasmo, sentimiento), lenguaje natural (MNLI, ANLI, RTE, STS-B) y recuperación/clasificación (20 Newsgroups, Banking77, QNLI, CLINC). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, la proporción entre tareas ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con especial énfasis en tareas de decisión entrenadas sobre GSM8K, BIG-bench, SIQA, PIQA y CSQA.
- Tool calling / function calling, entrenado con el conjunto Glaive.
- Clasificación de sentimiento, emoción, ironía y sarcasmo.
- Inferencia de lenguaje natural (NLI) y similitud semántica de frases (MNLI, ANLI, RTE, STS-B).
- Clasificación de intenciones y enrutamiento de consultas (Banking77, CLINC).
- Recuperación y clasificación de documentos (20 Newsgroups, QNLI).
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Modo de pensamiento explícito, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar la intención de un mensaje entrante (entrenado con Banking77 y CLINC) y derivarlo al flujo o departamento adecuado, aprovechando su tamaño reducido para desplegarse en CPU o GPU de gama baja.
- Análisis de sentimiento y detección de ironía en redes sociales: útil para monitorización de marca o moderación de comunidades, dado que el ajuste incluye conjuntos específicos de emoción, ironía y sarcasmo.
- Tool calling en agentes ligeros: al estar entrenado con Glaive, puede integrarse como planificador de llamadas a funciones en pipelines de automatización con presupuesto de cómputo limitado.
- Clasificación de tickets de soporte: el ajuste sobre 20 Newsgroups y QNLI permite categorizar incidencias y preguntas por temática o relevancia documental.
- Filtrado y priorización de correo o mensajes: la combinación de NLI (MNLI, ANLI, RTE) y similitud semántica (STS-B) permite evaluar si una consulta implica otra o si dos textos son equivalentes, para deduplicación o respuesta automática.
- Razonamiento aritmético y de sentido común en asistentes educativos: el entrenamiento sobre GSM8K y BIG-bench lo hace apto para problemas sencillos de matemáticas y preguntas de conocimiento cotidiano en entornos con recursos escasos.
- Prototipado e investigación: al ser un modelo de 0,8B con licencia Apache-2.0, sirve como banco de pruebas para experimentos de ajuste y evaluación de tareas de decisión sin coste de infraestructura elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,7 GB; en FP16 se estiman unos 1,7 GB de pesos más overhead de activaciones y caché KV. En cuantización de 8 bits podría situarse en torno a 1 GB, y en 4 bits en torno a 0,5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para mayor throughput, A10, L4 o A100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM; también es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar Transformers con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-alrB | 852.985.920 | no disponible | Apache-2.0 | Ajuste LoRA especializado en tareas de decisión |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado) | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de ~1B de propósito general | no disponible | no disponible | no disponible | No se dispone de datos comparativos publicados en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card no declara idiomas soportados; el comportamiento multilingüe es incierto y podría degradarse fuera del inglés, idioma predominante en los conjuntos de entrenamiento citados.
- No se publican resultados de benchmarks, por lo que el rendimiento real en cada tarea no está verificado de forma independiente.
- El ajuste se realizó sobre particiones de entrenamiento públicas; existe riesgo de sobreajuste a los formatos y distribuciones de esos conjuntos y de escasa generalización fuera de ellos.
- Riesgo de alucinación inherente a los modelos de 0,8B, especialmente en generación abierta y razonamiento complejo.
- El repositorio incluye `custom_code`, lo que obliga a ejecutar código del autor al cargar el modelo; conviene auditar dicho código antes de usarlo en producción.
- No se publican sesgos conocidos ni evaluaciones de seguridad; al derivar de Qwen3.5, podría heredar sesgos del modelo base y de los datasets de ajuste.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el modelo ni sobre los datos de entrenamiento subyacentes.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-lite-alrB
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
