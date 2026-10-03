# wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every4

## Resumen

Este repositorio contiene un ajuste fino de tipo comunitario publicado por el usuario wz7475 bajo el identificador `wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every4`. La model card es la plantilla automática de HuggingFace y no ha sido cumplimentada: no declara autoría real, tipo de modelo, idiomas, licencia, datos de entrenamiento ni resultados de evaluación. El propio identificador es la única fuente de información sobre su naturaleza, y sugiere una adaptación de Qwen2.5-7B-Instruct sobre una mezcla de datos de instrucciones de dominio jurídico ("katcher-legal-sftmix") combinada con OASST1 muestreado cada cuatro ejemplos ("oasst1-every4").

El repositorio ocupa 0,3 GB, un tamaño incompatible con los pesos completos de un modelo de 7.000 millones de parámetros en precisión de 16 bits (que rondarían los 15 GB). Esto apunta a que se trata de un adaptador LoRA o QLoRA y no de un modelo fusionado, aunque no hay documentación que lo confirme. Para poder ejecutarlo sería necesario descargar el modelo base por separado y fusionar el adaptador.

La relevancia de esta ficha es limitada y debe interpretarse como un ejercicio de catalogación: se trata de un artefacto sin validación publicada, sin licencia declarada y con cero descargas en el momento de la consulta. No es un modelo recomendable para producción sin una evaluación previa por parte de quien lo adopte, y su interés principal radica en servir como ejemplo de ajuste de dominio jurídico sobre una base abierta y competente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El identificador sugiere un transformer decoder-only derivado de Qwen2.5-7B-Instruct, sin confirmar en la model card |
| Parametros totales | No disponible. El identificador sugiere 7.000 millones en el modelo base, sin confirmar |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible en la ficha. Si se confirma Qwen2.5-7B-Instruct como base, serían 32.768 tokens nativos, ampliables a 131.072 mediante escalado RoPE, pero no está verificado para este repositorio |
| Tipos de cuantizacion | No disponible. Al publicarse en safetensors sin cuantizaciones alternativas, no hay versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card deja el campo vacío, por lo que no se concede ninguna autorización explícita de uso) |
| Formato de pesos | safetensors (etiqueta del repositorio). Tamaño del repo: 0,3 GB |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 3 de octubre de 2026 (metadato del repositorio; la fecha es posterior a la del momento de redacción de esta ficha, lo que indica una inconsistencia en los metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card, que se limita a la plantilla generada automáticamente por HuggingFace con todos los campos marcados como `[More Information Needed]`. El único indicio disponible es el identificador del repositorio, que combina "qwen2.5-7b-instruct" (modelo base) con "katcher-legal-sftmix" (posible mezcla de datos de ajuste supervisado de temática jurídica) y "oasst1-every4" (posible intercalado de OASST1 cada cuatro muestras para preservar capacidades conversacionales generales). Ninguno de estos extremos está verificado por el autor.

La etiqueta `arxiv:1910.09700` que aparece en los metadatos corresponde a Lacoste et al. (2019), el artículo sobre estimación de emisiones de carbono citado en la plantilla estándar de model cards de HuggingFace. No es un artículo sobre este modelo ni aporta información sobre su entrenamiento. Tampoco hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, hiperparámetros o infraestructura de cómputo.

## Capacidades

No hay ninguna capacidad documentada por el autor. A continuación se enumeran únicamente expectativas razonables derivadas de la arquitectura base presumida, que deben verificarse empíricamente antes de cualquier uso:

- Generación de texto conversacional multi-turno, si el modelo base es efectivamente Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas matemáticos de dificultad media, capacidad propia de la familia Qwen2.5.
- Generación y edición de código en lenguajes habituales, heredada del modelo base.
- Soporte de tool calling o function calling: no confirmado en este repositorio; Qwen2.5-Instruct lo soporta de serie, pero el ajuste fino podría haber degradado esta capacidad.
- Capacidades multilingües: no documentadas; el ajuste sobre datos jurídicos podría estar sesgado hacia un único idioma.
- Especialización en dominio jurídico: no verificada, solo inferida del nombre del dataset de ajuste.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles y no esperables en una base Qwen2.5-7B de texto.

## Casos de uso

Ninguno de los siguientes casos está validado por el autor del modelo. Se plantean como escenarios plausibles que requieren evaluación previa con datos propios del dominio:

- Asistente de consulta sobre documentación jurídica: si el ajuste con "katcher-legal-sftmix" es real, el modelo podría responder preguntas sobre contratos, cláusulas y normativa con un registro más especializado que la base. Sería necesario construir un conjunto de evaluación propio con preguntas y respuestas verificadas por juristas antes de exponerlo a usuarios.
- Extracción estructurada de cláusulas contractuales: con salida en JSON y validación posterior, el modelo podría etiquetar partes, plazos, importes y condiciones. El ajuste conversacional sobre OASST1 cada cuatro muestras es precisamente una técnica para no perder la capacidad de seguir instrucciones de formato tras un ajuste de dominio.
- Preprocesado y resumen de expedientes largos: si la ventana de contexto de la base se mantiene, permitiría procesar documentos de decenas de miles de tokens en una sola pasada, útil para resumir contratos o sentencias extensas.
- Generación de borradores internos para revisión humana: redacción de primeros borradores de comunicaciones, requerimientos o respuestas tipo, siempre con revisión obligatoria por un profesional cualificado y nunca como asesoramiento jurídico automatizado.
- Clasificación y enrutado de consultas en un sistema mayor: uso del modelo como componente de un pipeline que decide la categoría de una consulta entrante y la deriva al equipo correspondiente, con umbrales de confianza y fallback a revisión humana.
- Anotación asistida de corpus jurídicos: apoyo a equipos de etiquetado para preanotar entidades y relaciones en textos legales, reduciendo el coste del etiquetado manual y dejando la corrección final a los anotadores.
- Evaluación comparativa de estrategias de ajuste: dado que el nombre delata una receta concreta (mezcla intercalada de SFT de dominio y OASST1 cada cuarto ejemplo), el repositorio puede servir como referencia metodológica en experimentos sobre olvido catastrófico, no como modelo final.
- Prototipado en local con cuantización de 4 bits: por su tamaño presumible de 7B, podría ejecutarse en una GPU de consumo para pruebas de concepto, sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y la búsqueda web realizada no ha devuelto resultados relacionados con el modelo, su autor ni el dataset de ajuste.

## Requisitos de hardware

Las siguientes cifras son estimaciones para un transformer denso de 7.000 millones de parámetros en precisión de 16 bits, condicionadas a que el modelo base sea efectivamente Qwen2.5-7B-Instruct. No proceden de mediciones sobre este repositorio:

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 15-16 GB incluyendo caché KV para contextos moderados; en cuantización de 8 bits, unos 8-9 GB; en cuantización de 4 bits (Q4_K_M o AWQ), unos 5-6 GB.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o dos GPU de 24 GB con tensor parallelism.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB permite fp16 con contextos cortos; una RTX 3060 de 12 GB, RTX 4070 o RTX 4060 Ti de 16 GB solo son viables con cuantización de 4 bits.
- Nota crítica de despliegue: el repositorio contiene 0,3 GB, por lo que previsiblemente aloja un adaptador y no los pesos completos. Sería necesario descargar el modelo base y fusionar el adaptador antes de convertirlo a GGUF o servirlo con cualquier motor.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador sin fusionar; tras fusionar, vLLM o TGI para servicio con batching continuo; llama.cpp u Ollama si se convierte a GGUF; no hay artefactos preconvertidos en el repositorio.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece contra modelos de propósito general del mismo rango de parámetros, dado que no existe ningún dato de rendimiento publicado para el modelo analizado. Las cifras de las alternativas proceden de su documentación pública y no de una evaluación propia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every4 | No disponible (presumiblemente 7B) | No disponible | No disponible | Repositorio de 0,3 GB, 0 descargas | Ninguno publicado |
| Qwen2.5-7B-Instruct | 7.610 millones | 32.768 nativos, 131.072 con escalado RoPE | Apache 2.0 | Repositorio oficial, ampliamente desplegado | Publicados por el proveedor |
| Llama-3.1-8B-Instruct | 8.030 millones | 128.000 | Licencia comunitaria de Llama 3.1 | Repositorio oficial en Meta y HuggingFace | Publicados por el proveedor |
| Mistral-7B-Instruct-v0.3 | 7.250 millones | 32.000 | Apache 2.0 | Repositorio oficial en Mistral y HuggingFace | Publicados por el proveedor |

Frente a estas alternativas, el modelo analizado no ofrece ninguna ventaja verificable: carece de licencia declarada, de evaluación publicada y de artefactos de despliegue listos para usar. Su único diferencial potencial sería la especialización jurídica, que no está demostrada.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card no especifica ninguna, lo que en la práctica implica que no se concede autorización de uso, modificación ni redistribución. Cualquier uso comercial es jurídicamente arriesgado sin contacto previo con el autor.
- Model card vacía: todos los campos relevantes (datos de entrenamiento, sesgos, uso previsto, evaluación) están sin cumplimentar, lo que impide auditar el modelo.
- Riesgo de alucinación: no cuantificado. En dominio jurídico, una alucinación sobre normativa, plazos o jurisprudencia puede tener consecuencias graves para el usuario final.
- Sesgo de dominio y jurisdicción: si el dataset "katcher-legal-sftmix" proviene de una jurisdicción concreta, las respuestas serán inaplicables fuera de ella y el modelo podría presentar sesgos normativos no declarados.
- Degradación por ajuste: un ajuste fino sobre datos de dominio estrechos puede deteriorar capacidades generales, de código y de seguimiento de instrucciones del modelo base. La técnica de intercalar OASST1 cada cuatro muestras es un intento de mitigarlo, no una garantía.
- Idiomas no declarados: no hay confirmación de que el modelo mantenga competencia en castellano ni en otros idiomas distintos del usado en el ajuste.
- Sin datos de evaluación: no existen benchmarks, pruebas de robustez ni evaluaciones de seguridad publicadas.
- Advertencia legal explícita: el modelo no debe presentarse como herramienta de asesoramiento jurídico, ya que no está validado, no tiene supervisión profesional integrada y su licencia es indeterminada.
- Metadatos sospechosos: la fecha de creación registrada (3 de octubre de 2026) es posterior al momento de redacción de esta ficha, lo que sugiere metadatos inconsistentes o generados de forma anómala.
- Sin soporte ni mantenimiento: cero descargas, cero likes y ausencia de issues o discusiones indican que el repositorio no tiene comunidad ni mantenimiento activo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sftmix-oasst1-every4
- Artículo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono, citado por la plantilla automática y no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Modelo base presumido, sin confirmar por el autor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo, su autor, el dataset "katcher-legal-sftmix" ni la receta "oasst1-every4". Las únicas coincidencias devueltas corresponden a perfiles personales de redes sociales sin relación con el modelo.
