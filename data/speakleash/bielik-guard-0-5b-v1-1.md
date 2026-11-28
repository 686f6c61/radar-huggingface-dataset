# speakleash/Bielik-Guard-0.5B-v1.1

## Resumen

Bielik-Guard-0.5B-v1.1 es un modelo de clasificación de texto en polaco desarrollado por SpeakLeash, el consorcio polaco detrás de la familia de modelos Bielik. Se trata de un fine-tuning del checkpoint PKOBP/polish-roberta-8k, un RoBERTa adaptado al polaco por el banco PKO BP, y está diseñado específicamente como modelo de guarda (guard model): clasifica contenido textual para detectar peticiones o respuestas problemáticas en pipelines de moderación y seguridad.

El modelo cuenta con 442.895.365 parámetros reales (etiquetado comercialmente como "0.5B") y un repositorio de 1,8 GB en formato safetensors. Al ser un encoder RoBERTa y no un modelo generativo, su función no es producir texto sino emitir etiquetas de clasificación sobre secuencias de entrada, lo que lo hace adecuado como filtro previo o posterior en sistemas LLM en producción.

Es relevante en el ecosistema open source porque cubre un hueco concreto: la moderación de contenido en polaco con un modelo pequeño, entrenado localmente y con licencia Apache 2.0, que puede ejecutarse en CPU o GPU de gama baja. El acceso está restringido (gated) en Hugging Face y requiere aceptar las condiciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder), base PKOBP/polish-roberta-8k |
| Parametros totales | 442.895.365 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de PKOBP/polish-roberta-8k, un RoBERTa entrenado sobre corpus polaco con vocabulario adaptado, y se ha afinado como clasificador de texto (pipeline `text-classification`). La arquitectura es un transformer encoder bidireccional, sin mecanismo generativo ni decodificacion autoregresiva, lo que implica que el coste de inferencia es proporcional a la longitud de la secuencia de entrada y no al numero de tokens generados.

No se dispone en la informacion proporcionada de detalles sobre el dataset de fine-tuning, el numero de tokens utilizados, la composicion de las etiquetas ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un clasificador). Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El identificador arXiv asociado (2602.07954) sugiere la existencia de un articulo tecnico, pero su contenido no se incluye en los datos disponibles.

## Capacidades

- Clasificacion de texto en polaco: emite etiquetas sobre secuencias de entrada mediante la cabeza de clasificacion.
- Funcion de guarda (guard model): pensado para filtrar o marcar contenido problemático en pipelines de moderacion.
- Integracion con `transformers` mediante `AutoModelForSequenceClassification` y `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (`endpoints_compatible`).
- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al polaco segun los metadatos del repositorio.

## Casos de uso

- Moderacion de contenido en polaco: el modelo actua como clasificador previo a un LLM generativo, marcando peticiones o respuestas que deben bloquearse o revisarse, con un coste de inferencia bajo al ser un encoder de 442M parametros.
- Filtro de entrada en asistentes conversacionales: se puede intercalar en la cadena de preprocesado para descartar prompts abusivos antes de invocar un modelo mayor, reduciendo coste y exposicion.
- Filtro de salida post-generacion: clasifica las respuestas de un LLM antes de mostrarlas al usuario, como capa de seguridad adicional en productos desplegados en polaco.
- Moderacion de comentarios en plataformas: clasificacion por lotes de comentarios de usuarios en foros, medios o redes, aprovechando que el modelo cabe en CPU y permite throughput alto en batch.
- Investigacion en seguridad de LLM: servir como componente de referencia para estudiar tasas de falsos positivos y negativos en guard models de bajo coste y licencia permisiva.
- Pipelines de anotacion y curacion de datos: usar el clasificador para etiquetar grandes volumenes de texto polaco y priorizar revision humana en los casos marcados.
- Despliegue en entornos con recursos limitados: al ser un encoder de 1,8 GB en safetensors, puede ejecutarse en instancias CPU o GPU consumer para moderacion de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,8 GB de pesos, mas overhead de activaciones (dependiente de la longitud de secuencia).
- VRAM estimada en fp16/bf16: alrededor de 0,9 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 no son necesarias pero funcionan para alto throughput en batch.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; tambien en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` (nativo), Text Embeddings Inference (tag oficial), endpoints compatibles; no se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-Guard-0.5B-v1.1 | 442.895.365 | no disponible | pl | Apache 2.0 | gated en HF |
| PKOBP/polish-roberta-8k (base) | no disponible | no disponible | pl | no disponible | HF |
| Otros guard models (p. ej. Llama Guard) | no disponible en esta ficha | no disponible | multilingue | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de rendimiento comparativos con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idioma unico: solo polaco; su uso con otros idiomas no esta validado y probablemente degrade la calidad de clasificacion.
- No es generativo: no puede usarse para tareas de generacion, razonamiento, codigo o agentes.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y falsos negativos en la clasificacion, con impacto directo en moderacion.
- Sesgos: no se documentan en la informacion disponible; al derivar de un corpus polaco, puede heredar sesgos del dataset de entrenamiento.
- Longitud de contexto no especificada: conviene validar el truncamiento maximo antes de desplegar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base PKOBP/polish-roberta-8k y las condiciones del acceso gated.
- No se documentan umbrales de decision ni calibracion de probabilidades; es necesario calibrar sobre datos propios antes de usar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-Guard-0.5B-v1.1
- Modelo base: https://huggingface.co/PKOBP/polish-roberta-8k
- Articulo referenciado en tags: arXiv:2602.07954 (https://arxiv.org/abs/2602.07954)
- Organizacion SpeakLeash: https://huggingface.co/speakleash
