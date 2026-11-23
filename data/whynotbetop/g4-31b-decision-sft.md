# whynotBeTop/g4-31b-decision-sft

## Resumen

`whynotBeTop/g4-31b-decision-sft` es un modelo de clasificación de texto derivado por fine-tuning del checkpoint `MachinePulseAI/karpo-decision-31B`, publicado por el usuario whynotBeTop en Hugging Face. Con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB en formato safetensors, se posiciona en la categoría de modelos de gran tamaño orientados a tareas de decisión y clasificación, no a generación abierta de texto.

El modelo se distribuye bajo licencia Apache 2.0, pero con acceso restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos. La ficha del repositorio no proporciona información sobre idiomas soportados, composición del dataset de entrenamiento, longitud de contexto ni detalles del proceso de ajuste fino, por lo que muchos de los apartados técnicos de esta ficha quedan marcados como no disponibles.

Su relevancia actual es limitada pero concreta: se trata de un SFT (supervised fine-tuning) sobre un modelo base de decisión, lo que sugiere un uso como clasificador especializado de alto rendimiento en lugar de un asistente conversacional general. Al no haber descargas ni likes en el momento de la consulta, debe considerarse un modelo experimental o de nicho, sin validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en Hugging Face; presumiblemente transformer derivado de la familia Gemma) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | MachinePulseAI/karpo-decision-31B |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 62,6 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La etiqueta `gemma4` sugiere que el checkpoint base pertenece a la familia Gemma 4 de Google, y el pipeline declarado es `text-classification`, lo que implica que la cabeza de salida esta adaptada a tareas de clasificacion o decision en lugar de generacion autoregresiva libre. El modelo es un fine-tuning supervisado (SFT) del checkpoint `MachinePulseAI/karpo-decision-31B`, segun los metadatos de Hugging Face.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se especifica si el ajuste fino congela capas del modelo base o reentrena la totalidad de los 31,3 mil millones de parametros. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, por lo que su funcion principal es asignar etiquetas o categorias a entradas de texto.
- Toma de decisiones: el nombre del modelo base (`karpo-decision-31B`) y el sufijo `decision-sft` indican un ajuste orientado a tareas de decision, probablemente clasificacion binaria o multietiqueta.
- Generacion de texto: no confirmada; al ser un modelo de clasificacion, no se garantiza su uso como generador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas en la ficha).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion de contenido: el modelo puede emplearse como clasificador para etiquetar textos como seguros o no seguros en pipelines de moderacion, aprovechando su tamano para capturar matices que modelos mas pequenos pasan por alto.
- Enrutamiento de tickets de soporte: clasificacion de incidencias entrantes en categorias (facturacion, tecnico, cuenta) antes de derivarlas al equipo correspondiente, con la ventaja de un modelo de 31 B para textos ambiguos.
- Filtrado de spam y fraude: clasificacion de mensajes sospechosos en plataformas de mensajeria o correo, integrado como servicio de inferencia detras de una API.
- Analisis de sentimiento en resenas: clasificacion de opiniones de producto o servicio en categorias de sentimiento, adecuado si el dominio de entrenamiento del SFT coincide con el del negocio.
- Triage clinico o legal asistido: clasificacion de documentos o consultas en categorias de urgencia o tipo de caso, siempre con revision humana obligatoria dada la ausencia de benchmarks publicados.
- Investigacion sobre SFT en modelos de decision: util como checkpoint de referencia para estudiar como el ajuste supervisado sobre un modelo base de decision afecta al comportamiento de clasificacion en modelos de ~31 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 62,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica requiere 80 GB o mas por GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 31-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 16-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; A100 40 GB o L40S para 8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 solo con cuantizacion agresiva no oficial (no disponible).
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| whynotBeTop/g4-31b-decision-sft | ~31,3 B | no disponible | Apache 2.0 | Restringido (gated) | Clasificacion, sin benchmarks publicados |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Gemma 4 (familia, si el tag es correcto) | variable | no disponible | no disponible | no disponible | Modelo generativo base, no clasificador |
| Alternativas de clasificacion de ~30 B | no disponible | no disponible | no disponible | no disponible | No se identifican comparables publicados con datos verificables |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas publicadas de precision, recall, F1 ni evaluaciones de sesgo, lo que impide validar su rendimiento en produccion.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y al despliegue.
- Cero adopcion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay reportes de terceros sobre su comportamiento.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente fuera del idioma o idiomas de entrenamiento del SFT.
- Riesgo de alucinacion y sesgos: no evaluado; al ser un clasificador, el riesgo se traduce en etiquetas erroneas con alta confianza.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentacion del modelo base obligan a revisar las condiciones del checkpoint `MachinePulseAI/karpo-decision-31B` antes de un uso productivo.
- Contexto maximo desconocido: no se puede garantizar el procesamiento de entradas largas sin pruebas previas.
- Sin cuantizaciones oficiales: el despliegue eficiente en hardware limitado requiere trabajo adicional de conversion y validacion.

## Enlaces

- Hugging Face: https://huggingface.co/whynotBeTop/g4-31b-decision-sft
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Paper, blog, repositorio o demo: no disponible
