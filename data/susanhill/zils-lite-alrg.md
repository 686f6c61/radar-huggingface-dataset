# SusanHill/zils-lite-alrG

## Resumen

zils-lite-alrG es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill en Hugging Face bajo licencia Apache-2.0. El modelo se presenta como un "soup body" de la variante d3-lite de la familia Zils, orientado a tareas de decisión: clasificación, razonamiento, selección de herramientas y recuperación de información. Con 852.985.920 parámetros reales (según los pesos en safetensors), se sitúa en la gama ultraligera, lo que lo hace apto para despliegues con recursos muy limitados.

La propuesta del modelo es concentrar en un único checkpoint de menos de mil millones de parámetros capacidades que normalmente se reparten entre clasificadores especializados: tool calling, razonamiento de sentido común, análisis de emoción e ironía, inferencia textual y clasificación de intenciones. El entrenamiento se ha realizado sobre particiones públicas de train de conjuntos como Glaive, SIQA, PIQA, CSQA, GSM8K, BIG-bench, MNLI, ANLI, RTE, STS-B, 20 Newsgroups, Banking77, QNLI y CLINC.

Es relevante ahora porque demuestra la viabilidad de adaptar modelos base pequeños de la familia Qwen3.5 a tareas de decisión mediante LoRA, con un coste de entrenamiento e inferencia reducido. No obstante, la información publicada es escasa: no hay resultados de benchmarks, no se detallan los idiomas soportados ni el pipeline, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5`); requiere `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con aproximadamente 853 millones de parámetros. Sobre esa base se aplica un ajuste fino con LoRA, según indica la model card, dando lugar a un "soup body" de la variante d3-lite. El repositorio incluye el tag `custom_code`, lo que implica que la carga del modelo requiere código personalizado y no un `AutoModel` estándar sin más.

Los datos de entrenamiento declarados son particiones públicas de train de varios conjuntos: Glaive para tool calling; SIQA, PIQA, CSQA, GSM8K y BIG-bench para razonamiento; conjuntos de emoción, ironía, sarcasmo y sentimiento para tareas "arts"; MNLI, ANLI, RTE y STS-B para lenguaje; y 20 Newsgroups, Banking77, QNLI y CLINC para recuperación y clasificación de intenciones. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y razonamiento de sentido común, entrenado sobre SIQA, PIQA, CSQA y BIG-bench.
- Razonamiento matemático básico, con GSM8K en el conjunto de entrenamiento.
- Tool calling y function calling, con datos de Glaive.
- Clasificación de emociones, ironía, sarcasmo y sentimiento.
- Inferencia textual y similitud semántica (MNLI, ANLI, RTE, STS-B).
- Clasificación de intenciones y recuperación (20 Newsgroups, Banking77, QNLI, CLINC).
- Capacidades multilingües: no disponibles en la información publicada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la intención del usuario entre categorías predefinidas (estilo Banking77 o CLINC) para dirigir la conversación al flujo adecuado, con un coste de inferencia muy bajo al tener menos de mil millones de parámetros.
- Selección de herramientas en agentes ligeros: gracias al entrenamiento con Glaive, puede decidir qué función invocar y con qué argumentos en pipelines de automatización, integrándose en orquestadores de agentes sin necesidad de un modelo grande.
- Moderación y análisis de sentimiento en tiempo real: su entrenamiento en emoción, ironía y sarcasmo permite etiquetar comentarios de usuarios en foros o redes, desplegable en CPU o GPU de gama baja.
- Clasificación de tickets de soporte: usando los datos de 20 Newsgroups y Banking77, puede asignar categorías a incidencias entrantes antes de derivarlas a un humano o a otro modelo mayor.
- Filtrado y reordenación en recuperación de información: con QNLI y STS-B en el entrenamiento, puede puntuar la relevancia de pares pregunta-respuesta o pregunta-documento en un pipeline RAG ligero.
- Evaluación de coherencia textual: las tareas MNLI, ANLI y RTE permiten usarlo como verificador de implicación entre premisa e hipótesis en sistemas de control de calidad de contenido generado.
- Prototipado educativo e investigación: al ser un ajuste LoRA sobre una base pequeña y con licencia Apache-2.0, sirve para experimentar con técnicas de "soup" y adaptación de bajo rango sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en precisión completa (fp32) se necesitan aproximadamente 3,4 GB solo para pesos; en fp16/bf16 unos 1,7 GB, y en cuantización de 8 bits alrededor de 0,9 GB (estimación a partir del tamaño del repo de 1,7 GB; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3050, RTX 4060 o superiores; A100 y H100 son innecesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4-8 GB de VRAM, e incluso en CPU con cuantización.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar el código del repositorio; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, por lo que estas opciones deben validarse. Transformers con `trust_remote_code=True` es la vía más directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-alrG | 852.985.920 | No disponible | Apache-2.0 | Ajuste LoRA sobre Qwen3.5-0.8B; requiere `custom_code` |
| Qwen/Qwen3.5-0.8B | ~0,8B | No disponible | No disponible en la informacion | Modelo base; sin ajuste específico de decisión |
| Modelos de clasificación tipo DeBERTa/BERT small | ~0,1-0,4B | 512 tokens típicamente | MIT/Apache-2.0 en la mayoría | Especializados por tarea; no cubren tool calling ni generación |

La comparación con alternativas de la misma categoría es limitada porque no se han publicado métricas del modelo. Frente al Qwen3.5-0.8B base, la diferencia es el ajuste LoRA sobre tareas de decisión; frente a clasificadores BERT pequeños, ofrece un único checkpoint multitarea con capacidad generativa, a costa de un mayor tamaño y de la dependencia de `custom_code`.

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que el rendimiento real en cada tarea es desconocido.
- El modelo requiere `custom_code` para cargarse, lo que añade riesgo de seguridad y complejidad operativa en producción (`trust_remote_code`).
- Riesgo de alucinación inherente a los modelos generativos de tamaño reducido, especialmente en razonamiento matemático y factual.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets públicos como Glaive o BIG-bench, puede heredar sesgos de esas fuentes.
- Idiomas soportados no declarados; no se garantiza un buen rendimiento en castellano.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de evaluación y de documentación desaconseja su uso en producción sin validación previa.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso ni de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-alrG
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
