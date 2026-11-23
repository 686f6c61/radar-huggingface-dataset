# Uniboshi/Inkling-2-Mini-Uncensored-V1

## Resumen

Inkling-2-Mini-Uncensored-V1 es un fine-tune del modelo multimodal thinkingmachines/Inkling-2-Mini, publicado por el usuario Uniboshi en Hugging Face. Se trata de una variante "abliterated" y "chiraliterated" (terminologia empleada por la comunidad para describir la supresion o redireccion de las direcciones de rechazo en el espacio de activaciones) que busca eliminar los comportamientos de negativa del modelo original, manteniendo la arquitectura Mixture of Experts (MoE) y las capacidades image-text-to-text del base.

El modelo cuenta con 26.388.646.440 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos medianos-grandes con activacion dispersa. El repositorio ocupa 20,2 GB e incluye pesos en formato safetensors de 8 bits generados con modelopt (NVIDIA TensorRT Model Optimizer), lo que reduce el espacio respecto a una version BF16. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en dos factores: por un lado, la arquitectura MoE con capacidades multimodales permite un equilibrio interesante entre coste de inferencia y calidad; por otro, la naturaleza "uncensored" lo hace atractivo para investigadores que estudian alineamiento, refusal behavior y edicion de modelos, asi como para aplicaciones donde los filtros del modelo base resultan demasiado restrictivos. No obstante, la falta de documentacion tecnica publicada limita seriamente la evaluacion rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal image-text-to-text |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (modelopt); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, modelopt) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base thinkingmachines/Inkling-2-Mini, etiquetada como `inkling2_loop` y `moe` en los metadatos de Hugging Face. Se trata por tanto de un transformer con capas de mezcla de expertos y soporte multimodal (pipeline image-text-to-text), lo que implica un codificador visual o proyector que mapea imagenes al espacio de tokens del modelo de lenguaje. El tag `inkling2_loop` sugiere algun tipo de mecanismo de bucle o recurrencia en las capas, aunque no se dispone de documentacion que lo confirme.

El proceso de entrenamiento del fine-tune no esta documentado: no se especifica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o simplemente edicion de pesos. Los tags `abliterated` y `chiraliterated` indican que el ajuste se realizo mediante intervenciones sobre las direcciones de rechazo en el espacio de activaciones (abliteration clasica) y posiblemente una variante que redirige en lugar de eliminar dichas direcciones (chiraliterated). No hay informacion sobre hiperparametros, dataset de calibracion ni metodologia de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento conjunto de imagen y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y dialogos con soporte visual.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas de forma independiente en esta variante.
- Comportamiento "uncensored": se espera una reduccion significativa de las negativas ante peticiones que el modelo base rechazaria, aunque no se documenta el grado de supresion.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades de tool calling y agentes: no documentadas explicitamente; probablemente heredadas del base, pero sin confirmacion.
- Idiomas: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y refusal behavior: el modelo permite estudiar como la abliteration afecta a las respuestas del base, comparando pares de prompts aceptados y rechazados en ambos modelos para mapear la direccion de rechazo en el espacio de activaciones.
- Analisis de sesgos y robustez: al eliminar los filtros de negativa, se pueden generar respuestas que el modelo original ocultaria, lo que resulta util para auditar sesgos latentes y comportamientos no deseados en entornos controlados de laboratorio.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativas que abordan temas sensibles (violencia en ficcion, contenido adulto no explicito) donde los filtros del base interrumpen la generacion.
- Procesamiento de documentos con imagenes en pipelines internos: gracias a su naturaleza image-text-to-text, puede emplearse para extraer informacion de capturas, diagramas o formularios en entornos donde el contenido es sensible y se prefiere un modelo sin filtros de salida.
- Red teaming de sistemas de IA: uso como generador adversarial para probar las defensas de otros modelos o de filtros de moderacion, produciendo prompts y respuestas que estresen los clasificadores de seguridad.
- Experimentacion con cuantizacion 8-bit y modelopt: el repo incluye pesos ya optimizados con modelopt, lo que permite evaluar el rendimiento de la cuantizacion 8-bit en un MoE multimodal de 26B parametros en hardware consumer de gama alta.
- Fine-tuning posterior sobre dominios especializados: al ser Apache 2.0 y estar disponible en safetensors, puede servir como base para ajustes adicionales en nichos donde se requiere control total sobre el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 8-bit ocupan aproximadamente 20,2 GB (tamano del repo), por lo que se necesita al menos 24 GB de VRAM para cargar el modelo completo en memoria, mas overhead de activaciones y cache KV. Con cuantizaciones adicionales a 4 bits (no incluidas en el repo) podria reducirse a ~13-14 GB, pero requeriria conversion manual.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para la version 8-bit. Para contexto largo o batch mayor, se recomienda A100 80 GB o H100.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) con la cuantizacion 8-bit incluida, aunque con margen ajustado y limitaciones de batch y longitud de contexto. En GPUs de 16 GB o menos no cabe sin cuantizacion adicional.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si soportan la arquitectura `inkling2_loop` (no confirmado), llama.cpp/Ollama solo si existe conversion a GGUF (no disponible en el repo). La compatibilidad con endpoints sugiere despliegue en infraestructuras gestionadas tipo HF Inference Endpoints.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependera del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-V1 | 26,4B (MoE) | no disponible | image-text-to-text | Apache 2.0 | Gated |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | image-text-to-text | no disponible | no disponible |
| Alternativas abliterated de la comunidad | variable | variable | variable | variable | variable |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (MoE multimodal de ~26B con variante uncensored) para establecer una comparativa rigurosa. El unico punto de referencia claro es el modelo base thinkingmachines/Inkling-2-Mini, del que se desconoce el numero exacto de parametros, contexto y licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o entornos corporativos con politicas de aprovisionamiento estrictas.
- Ausencia total de documentacion tecnica: no hay model card detallada, ni datos de entrenamiento, ni evaluacion de capacidades. Cualquier uso en produccion implica un riesgo elevado por falta de validacion.
- Riesgo de alucinacion: no evaluado. La abliteration puede degradar la coherencia y aumentar la generacion de contenido facticamente incorrecto al alterar las activaciones internas.
- Comportamiento "uncensored" sin garantias: no se documenta el grado de supresion de rechazos ni si persisten filtros residuales. El comportamiento puede ser inconsistente entre prompts e idiomas.
- Sesgos conocidos: no documentados, pero heredados del base y potencialmente amplificados por la eliminacion de filtros. Es esperable que el modelo reproduzca sesgos de genero, raza, religion o ideologia presentes en los datos de entrenamiento originales.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento en castellano es desconocido y probablemente inferior al ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated y la naturaleza del contenido generado pueden entrar en conflicto con politicas de moderacion de plataformas o legislacion sobre contenido (por ejemplo, DSA en la UE). El usuario es responsable del uso.
- Cuantizacion 8-bit con modelopt: puede introducir degradacion de calidad respecto a BF16, no cuantificada. La compatibilidad con herramientas de inferencia (vLLM, TGI) no esta confirmada para esta arquitectura.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, lo que aumenta el riesgo de que los pesos presenten problemas no detectados.
- Fecha de creacion futura (2026-11-22): inconsistencia en los metadatos que sugiere posible error de publicacion o manipulacion; conviene verificar la integridad del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Uniboshi/Inkling-2-Mini-Uncensored-V1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
