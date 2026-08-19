# WatsonOverHere/Qwen3.8-27B-Uncensored-F16-GGUF

## Resumen

Qwen3.8-27B-Uncensored-F16-GGUF es una conversión en formato GGUF de precisión F16 del checkpoint abliterado `JonathanColetti/Qwen3.8-27B-Uncensored`, que a su vez deriva del modelo oficial `Qwen/Qwen3.8-27B` desarrollado por el equipo Qwen. La conversión ha sido realizada por WatsonOverHere utilizando llama.cpp (commit `a94d563ed`) sobre los pesos originales en BF16, sin ningún tipo de fine-tuning o edición adicional de pesos.

El modelo resultante conserva la arquitectura completa del Qwen3.8-27B, incluyendo el módulo MTP (Multi-Token Prediction) restaurado tras el proceso de abliteración. Este proceso, ejecutado por Jonathan Coletti mediante la técnica Heretic de eliminación de dirección de rechazo, elimina los mecanismos de negativa del modelo original, permitiendo respuestas sin censura en escenarios donde el modelo base se negaría a responder.

La relevancia de esta conversión radica en que ofrece una versión en precisión completa F16 (sin cuantización) del modelo abliterado, lista para ejecutarse en runtimes compatibles con GGUF como LM Studio o llama.cpp. Esto permite a desarrolladores e investigadores trabajar con la máxima fidelidad numérica posible en este formato, a costa de un mayor consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con soporte vision-language |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (segun documentacion de Qwen3.8-27B; no especificado en la model card) |
| Tipos de cuantizacion | F16 (unica version publicada en este repositorio) |
| Idiomas soportados | No disponibles en la model card; el modelo base Qwen3.8 soporta multiples idiomas |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | GGUF (F16), archivo unico de 54.657.734.240 bytes |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con capacidad vision-language, disenado para tareas de codificacion, trabajo profesional, investigacion y tareas agenciales de largo horizonte. Incorpora un mecanismo de razonamiento configurable y una ventana de contexto nativa de 262K tokens, segun la documentacion oficial de Qwen3.8.

Sobre este modelo, Jonathan Coletti aplico el proceso de abliteracion mediante la herramienta Heretic, que identifica y elimina la direccion de rechazo (refusal direction) en el espacio de activaciones del modelo. Tras este proceso, restauro los tensores MTP desde el checkpoint base de Qwen para mantener la funcionalidad de prediccion multi-token. El checkpoint resultante fue publicado en BF16.

WatsonOverHere convirtio posteriormente ese checkpoint BF16 a formato GGUF F16 utilizando `convert_hf_to_gguf.py` de llama.cpp, sin modificar los pesos. La conversion mantiene los 866 tensores y 65 bloques del modelo original, incluyendo la capa MTP integrada. No se realizo ningun entrenamiento adicional, RLHF ni DPO durante este proceso.

## Capacidades

- Generacion de texto y conversacion multi-turno en lenguaje natural.
- Razonamiento logico y matematico, heredado del modelo base Qwen3.8-27B.
- Generacion de codigo en multiples lenguajes de programacion.
- Comprension de imagenes (vision-language), si el runtime GGUF utilizado soporta esta modalidad.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidad de razonamiento configurable (modo thinking) segun las especificaciones de Qwen3.8.
- Ejecucion de tareas agenciales de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Capacidades multilingues del modelo base, aunque no se detallan en la model card.
- Respuestas sin censura: el proceso de abliteracion elimina los rechazos del modelo original, permitiendo abordar cualquier tema sin negativas automaticas.
- MTP (Multi-Token Prediction) retenido, lo que puede mejorar la velocidad de decodificacion en runtimes que lo aprovechen.

## Casos de uso

- Asistentes conversacionales sin restricciones tematicas: el modelo puede mantener conversaciones sobre cualquier tema sin negarse a responder, gracias a la abliteracion. Adecuado para entornos donde se requiere una respuesta directa sin filtros de seguridad.
- Generacion de codigo en produccion: con soporte de tool calling y una ventana de contexto amplia, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo. La precision F16 garantiza la maxima fidelidad en las salidas.
- Investigacion en seguridad de IA: al comparar las respuestas del modelo abliterado con las del modelo original, los investigadores pueden estudiar los mecanismos de rechazo y su impacto en el comportamiento del modelo.
- Desarrollo de agentes autonomos: la combinacion de contexto largo, razonamiento configurable y tool calling permite construir agentes que ejecutan tareas complejas de multiples pasos, como busquedas web o interacciones con APIs.
- Analisis de documentos extensos: con 262K tokens de contexto, el modelo puede procesar libros completos, informes tecnicos o codigo fuente de grandes repositorios en una sola pasada, extrayendo informacion o resumiendo contenido.
- Prototipado rapido de aplicaciones de IA generativa: al estar en formato GGUF F16, se puede cargar directamente en LM Studio o llama.cpp para pruebas locales sin necesidad de infraestructura cloud, ideal para validar ideas antes de escalar.
- Educacion y formacion en IA: permite a estudiantes y profesionales experimentar con un modelo de 27B en precision completa sin depender de servicios externos, comprendiendo las diferencias entre versiones cuantizadas y de maxima precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. El modelo hereda el rendimiento del Qwen3.8-27B original, pero no se dispone de datos especificos para esta conversion F16 GGUF.

## Requisitos de hardware

- Tamano del archivo GGUF: 54,7 GB, lo que implica un requisito minimo de RAM/VRAM de aproximadamente 55 GB para cargar el modelo completo en memoria.
- Para inferencia exclusiva en GPU: se recomienda una GPU con al menos 60 GB de VRAM, como NVIDIA A100 80GB o H100 80GB. Una RTX 4090 (24 GB) no es suficiente para este modelo en F16.
- Para inferencia hibrida CPU+GPU: es posible ejecutar el modelo con una GPU de menor VRAM (por ejemplo, 24 GB) descargando capas a RAM, pero el rendimiento dependera de la velocidad de la RAM y del bus PCIe.
- Alternativa de solo CPU: con 64 GB de RAM o mas, el modelo puede ejecutarse completamente en CPU, aunque la latencia sera significativamente mayor (del orden de varios segundos por token).
- Runtimes compatibles: llama.cpp, LM Studio, Ollama (si se convierte a un formato compatible), y cualquier aplicacion que soporte GGUF.
- Latencia y throughput: no se han publicado mediciones especificas. En una A100 80GB, se estima una velocidad de decodificacion de 20-40 tokens por segundo para un modelo de 27B en F16, pero estos valores son orientativos y dependen de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Safetensors (BF16) | Apache 2.0 | No |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B | 262K | Safetensors (BF16) | Apache 2.0 | Si |
| WatsonOverHere/Qwen3.8-27B-Uncensored-F16-GGUF | 27B | 262K | GGUF (F16) | Apache 2.0 | Si |
| mradermacher/Qwen3.8-27B-Uncensored-GGUF | 27B | 262K | GGUF (varias cuantizaciones) | Apache 2.0 | Si |

La diferencia principal entre esta conversion y otras versiones GGUF (como las de mradermacher) es la precision F16 completa, que ofrece la maxima fidelidad numerica frente a cuantizaciones Q8, Q6, Q5 o Q4. Esto implica un mayor consumo de memoria (54,7 GB frente a ~16,8 GB de una Q4_K_M), pero elimina cualquier perdida de calidad derivada de la cuantizacion. Para usuarios con hardware limitado, las versiones cuantizadas son mas practicas; esta F16 esta pensada para entornos con recursos abundantes.

## Limitaciones y advertencias

- Al ser un modelo abliterado, no incorpora los mecanismos de seguridad del modelo original. Puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. El uso en produccion debe contemplar medidas de filtrado adicionales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o informacion falsa. La ausencia de rechazo no implica mayor exactitud factual.
- La ventana de contexto de 262K tokens es una capacidad del modelo base, pero el rendimiento real en contextos muy largos puede degradarse y requerir recursos de memoria considerables.
- No se dispone de informacion sobre los idiomas exactos soportados ni sobre la calidad en cada uno de ellos. Se asume el soporte multilingue de Qwen3.8, pero no esta verificado para esta conversion.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar los terminos del modelo original Qwen y del checkpoint de JonathanColetti, asi como las implicaciones de usar un modelo sin censura en aplicaciones publicas.
- Esta conversion F16 no es adecuada para hardware de consumo (GPUs de 24 GB o menos) sin descarga de capas a RAM, lo que afecta al rendimiento.
- No se han publicado evaluaciones de seguridad ni benchmarks de esta version especifica, por lo que su comportamiento en tareas reales no esta documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WatsonOverHere/Qwen3.8-27B-Uncensored-F16-GGUF
- Checkpoint abliterado (fuente): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Otras cuantizaciones GGUF del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-GGUF
- Repositorio GitHub con instrucciones de uso: https://github.com/Wassimyounes01/qwen38-uncensored
- Documentacion de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Articulo sobre ejecucion local de Qwen3.8-27B: https://pasqualepillitteri.it/en/news/11335/qwen3-8-27b-run-local-16gb-lm-studio-unsloth
