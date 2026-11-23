# vijil/stereotype-detector-v8-20260911

## Resumen

stereotype-detector-v8-20260911 es un clasificador de texto especializado en la deteccion de estereotipos y sesgos en contenido textual. Lo desarrolla Vijil, empresa centrada en herramientas de seguridad y evaluacion de modelos de IA, y se distribuye a traves de Hugging Face como parte de su ecosistema de guardrails Vijil Dome. El modelo resuelve un problema concreto: identificar automaticamente afirmaciones que reproducen estereotipos sobre grupos protegidos, un requisito habitual en pipelines de moderacion de contenido, auditoria de datasets y cumplimiento normativo en entornos laborales (la etiqueta `eeoc` sugiere alineacion con las categorias de discriminacion de la Comision para la Igualdad de Oportunidades en el Empleo de Estados Unidos).

Tecnicamente es un fine-tuning de answerdotai/ModernBERT-base, un transformer encoder de 149,6 millones de parametros con sesgo bidireccional y atencion optimizada para contextos largos. El resultado es un modelo de clasificacion ligero, con pesos en safetensors y un repositorio de 0,6 GB, pensado para desplegarse como filtro de baja latencia delante o detras de un modelo generativo. Su relevancia actual radica en que la mayoria de guardrails comerciales son cajas negras o dependen de APIs externas, mientras que este se publica como pesos abiertos (aunque con acceso restringido) y compatible con Text Embeddings Inference y endpoints de Hugging Face.

La informacion publica disponible es limitada: no se detallan el dataset de entrenamiento, las metricas de evaluacion ni la licencia. El modelo esta etiquetado unicamente para ingles y acumula 38 descargas desde su publicacion en septiembre de 2026, lo que indica una adopcion todavia incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT-base soporta hasta 8192 tokens; el valor efectivo de este fine-tuning no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, sin variantes publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificacion binaria o multietiqueta de sesgo/estereotipo) |
| Modelo base | answerdotai/ModernBERT-base |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Compatibilidad de despliegue | Text Embeddings Inference, endpoints compatibles de Hugging Face |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, una revision moderna de la familia BERT que sustituye las capas de atencion clasicas por atencion con RoPE (rotary positional embeddings) y alterna capas de atencion global con capas de atencion local, lo que reduce el coste computacional en secuencias largas y permite ventanas de hasta 8192 tokens. Sobre esa base, Vijil aplica un fine-tuning supervisado para la tarea de clasificacion de estereotipos, anadiendo presumiblemente una cabeza de clasificacion sobre el token de pooling. El numero de parametros (149,6 millones) coincide con el de ModernBERT-base, lo que confirma que no se ha modificado el cuerpo del modelo mas alla de la cabeza de salida.

No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el esquema de etiquetado ni si se emplearon tecnicas de ajuste adicionales como DPO o calibracion de umbrales. La presencia de etiquetas como `eeoc` y `guardrail` sugiere que el conjunto de entrenamiento se construyo a partir de taxonomias de discriminacion laboral y ejemplos de produccion de sistemas de moderacion, pero es una inferencia, no un dato confirmado. Tampoco se documentan innovaciones tecnicas propias mas alla del uso de la arquitectura ModernBERT.

## Capacidades

- Clasificacion de texto para detectar estereotipos y sesgos hacia grupos protegidos, con salida orientada a guardrails.
- Deteccion de contenido discriminatorio en ingles, presumiblemente alineada con categorias tipo EEOC (edad, raza, sexo, religion, discapacidad, origen nacional).
- Integracion como filtro de entrada o salida en pipelines de moderacion junto a modelos generativos.
- Compatibilidad con Text Embeddings Inference para servir el modelo con baja latencia.
- Compatibilidad con endpoints de Hugging Face, lo que facilita su despliegue gestionado.
- Modelo encoder puro: no genera texto, no soporta tool calling, no tiene modo de razonamiento multi-paso ni capacidades multimodales.
- Multilingue: no, solo ingles.

## Casos de uso

- Moderacion de comentarios en plataformas sociales: el clasificador se ejecuta sobre cada mensaje antes de su publicacion y marca aquellos con alta probabilidad de estereotipo, derivandolos a revision humana o a un modelo mayor para analisis contextual.
- Auditoria de datasets de entrenamiento: se pasa el corpus por el modelo para cuantificar la prevalencia de afirmaciones estereotipadas por categoria protegida antes de entrenar un modelo generativo, con un coste de inferencia minimo gracias a los 149,6 millones de parametros.
- Cumplimiento normativo en RR. HH.: filtrado de descripciones de puesto, correos internos o transcripciones de entrevistas para detectar lenguaje discriminatorio alineado con las categorias EEOC.
- Guardrail de salida en asistentes conversacionales: se intercala entre el LLM y el usuario para bloquear o reescribir respuestas que reproduzcan estereotipos, con latencia de milisegundos en GPU consumer.
- Evaluacion de sesgos de modelos generativos: se genera un banco de respuestas y se clasifican con este detector para obtener metricas agregadas de sesgo por categoria, complementando evaluaciones tipo red-teaming.
- Filtrado previo en pipelines RAG: se descartan fragmentos de documentos recuperados que contengan estereotipos antes de inyectarlos en el contexto del modelo generativo, reduciendo el riesgo de amplificacion.
- Investigacion academica sobre sesgo linguistico: el modelo sirve como anotador automatico de corpus en ingles para estudios de sociolinguistica computacional, con la ventaja de ser reproducible localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en FP32 (149,6 M de parametros), unos 0,3 GB en FP16 y menos de 0,2 GB en cuantizacion INT8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, L4, A10 o A100 son mas que suficientes. Tambien puede ejecutarse en CPU con throughput aceptable para lotes moderados.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (TEI) para servir clasificadores con batching dinamico, endpoints de Hugging Face, y exportacion a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no se han publicado cifras oficiales. Por el tamano del modelo, es razonable esperar latencias de pocos milisegundos por secuencia corta en GPU y throughput de miles de peticiones por segundo en batching sobre una A100, pero son estimaciones, no datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| vijil/stereotype-detector-v8-20260911 | 149,6 M | no disponible | en | no disponible | Clasificacion de estereotipos (guardrail) |
| answerdotai/ModernBERT-base | 149,6 M | 8192 | en (multilingue en variante aparte) | Apache 2.0 | Encoder generalista, sin fine-tuning de sesgo |
| Meta Llama Guard 3 (8B) | 8 B | 128k | multilingue | Llama Community License | Clasificacion de seguridad general (incluye odio y acoso) |
| IBM Granite Guardian 3.0 (2B / 8B) | 2 B / 8 B | 128k | multilingue | Apache 2.0 | Guardrail general de riesgos sociales |

La comparativa es aproximada: no se dispone de metricas publicadas del modelo de Vijil que permitan contrastar su precision frente a Llama Guard o Granite Guardian. La ventaja principal del modelo de Vijil es su tamano reducido (dos ordenes de magnitud menor que Llama Guard 3), lo que abarata el despliegue a gran escala; la desventaja es la falta de documentacion sobre rendimiento, licencia y cobertura mas alla del ingles.

## Limitaciones y advertencias

- Solo soporta ingles; su uso en castellano u otros idiomas no esta validado y previsiblemente producira resultados poco fiables.
- No se ha publicado la licencia, lo que impide confirmar si el uso comercial esta permitido. Cualquier integracion en produccion requiere aclarar este punto con el autor.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion a la automatizacion de despliegues.
- No hay informacion sobre el dataset de entrenamiento, el esquema de etiquetas ni las metricas de evaluacion, por lo que no es posible estimar su tasa de falsos positivos y falsos negativos.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si existe riesgo de clasificaciones erroneas por sesgo del corpus de entrenamiento o por falta de contexto cultural.
- La deteccion de estereotipos es una tarea intrinsecamente ambigua: frases ironicas, citas, discurso academico sobre discriminacion o reclamaciones legitimas pueden clasificarse como estereotipo, generando falsos positivos.
- Un clasificador de este tipo no sustituye la revision humana en decisiones de moderacion con consecuencias legales o laborales.
- El modelo no genera explicaciones: solo emite una etiqueta o probabilidad, lo que dificulta la auditoria de decisiones individuales.
- El repositorio tiene muy pocas descargas (38) y ninguna validacion externa conocida; tratarlo como componente experimental hasta disponer de evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vijil/stereotype-detector-v8-20260911
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Repositorio de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Sitio de Vijil: https://www.vijil.ai
- Documentacion de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
