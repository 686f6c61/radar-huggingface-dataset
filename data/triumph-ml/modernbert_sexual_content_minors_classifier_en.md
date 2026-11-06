# triumph-ml/modernbert_sexual_content_minors_classifier_en

## Resumen

El modelo `triumph-ml/modernbert_sexual_content_minors_classifier_en` es un clasificador de texto en ingles desarrollado por el usuario triumph-ml y publicado en Hugging Face. Se construye sobre la arquitectura ModernBERT, un transformer encoder de ultima generacion disenado para tareas de comprension y clasificacion de secuencias, y esta especializado en la deteccion de contenido sexual que involucra a menores. Por su naturaleza, el repositorio esta marcado con la etiqueta `not-for-all-anchored` (en realidad `not-for-all-audiences`), lo que indica que su contenido y caso de uso requieren precaucion.

Con aproximadamente 149,6 millones de parametros, el modelo se situa en el rango de los encoders de tamano medio, lo que lo hace viable para despliegue en infraestructura moderada. Su funcion principal es la moderacion de contenido y la seguridad infantil en plataformas digitales, un ambito donde la deteccion automatica fiable es critica tanto por motivos legales como eticos.

La informacion publica disponible es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de evaluacion. Esta ficha se limita, por tanto, a los datos verificables del repositorio y a las caracteristicas conocidas de la arquitectura ModernBERT subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a FP16/INT8 posible via herramientas estandar) |
| Idiomas soportados | no disponible (el sufijo `_en` sugiere ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, un transformer encoder presentado a finales de 2024 que moderniza el diseno de BERT clasico incorporando mecanismos como rotary positional embeddings (RoPE), atencion con alternancia entre atencion local y global, y capas de normalizacion y activacion mas eficientes. ModernBERT esta optimizado para secuencias largas y para un rendimiento superior en tareas de clasificacion y recuperacion respecto a BERT-base, manteniendo un coste computacional contenido.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales especificas de este checkpoint mas alla de las propias de la familia ModernBERT.

## Capacidades

- Clasificacion de texto binaria o multiclase orientada a la deteccion de contenido sexual que involucra a menores en textos en ingles.
- Moderacion de contenido y filtrado de seguridad para plataformas.
- Procesamiento de secuencias de entrada propias de un encoder (clasificacion por token [CLS] o pooling).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el sufijo `_en` apunta a un alcance exclusivamente en ingles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Moderacion de comentarios en foros y redes sociales: el modelo puede puntuar textos enviados por usuarios y marcar aquellos con alta probabilidad de contener contenido sexual con menores, permitiendo revision humana prioritaria o bloqueo automatico.
- Filtrado en plataformas de mensajeria: integrado como paso previo al envio o en pipelines asincronos, ayuda a detectar conversaciones de riesgo en entornos con menores.
- Triaje en equipos de confianza y seguridad (Trust & Safety): clasificacion previa de grandes volumenes de reportes para reducir la carga de revision manual y priorizar los casos mas graves.
- Moderacion de contenido generado por IA: deteccion de salidas problematicas en sistemas de generacion de texto antes de su publicacion.
- Cumplimiento normativo: apoyo en la identificacion de contenido que infringe politicas de plataforma o marcos legales de proteccion de menores.
- Investigacion en seguridad infantil: analisis de corpus para estudios academicos sobre prevalencia y caracteristicas del contenido de riesgo, siempre bajo protocolos eticos y legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB solo para pesos; en FP16 unos 0,3 GB. El consumo real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en FP16; tarjetas como RTX 3060, RTX 4090, A10, L4 o superiores son suficientes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (GTX 1660 en adelante) puede ejecutar el modelo.
- Opciones de despliegue: Transformers (PyTorch), vLLM para clasificacion, TGI, ONNX Runtime y llama.cpp no aplica al ser un encoder; tambien es posible servir con FastAPI o TorchServe.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| triumph-ml/modernbert_sexual_content_minors_classifier_en | 149,6 M | no disponible | Clasificacion de contenido sexual con menores | no disponible | Hugging Face |
| ModernBERT-base (AnswerDotAI) | ~149 M | 8192 tokens | Encoder generalista | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Encoder generalista | Apache 2.0 | Hugging Face |
| DistilBERT-base | 66 M | 512 tokens | Encoder generalista | Apache 2.0 | Hugging Face |

La comparativa se limita a encoders de tamano similar, ya que no se dispone de informacion sobre clasificadores especializados equivalentes en la documentacion proporcionada. ModernBERT-base ofrece contexto de 8192 tokens y licencia Apache 2.0, ventajas que este checkpoint no documenta.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no se puede garantizar el uso comercial ni la redistribucion.
- El modelo esta orientado a textos en ingles; su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- No se documentan metricas de evaluacion (precision, recall, F1), imprescindible en un clasificador de seguridad antes de usarlo en produccion.
- Riesgo de falsos positivos y falsos negativos: cualquier clasificador de contenido sensible puede fallar; se recomienda supervision humana en decisiones de alto impacto.
- Sesgos potenciales derivados de los datos de entrenamiento no documentados.
- El repositorio esta marcado como `not-for-all-audiences`; su uso debe cumplir marcos legales de proteccion de menores y politicas de plataforma.
- No debe utilizarse como unica barrera de seguridad; ha de combinarse con revision humana y otras capas de moderacion.
- Informacion de pipeline y contexto no disponible, lo que dificulta la integracion directa sin inspeccion del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/triumph-ml/modernbert_sexual_content_minors_classifier_en
- Paper de ModernBERT (referencia de arquitectura): https://arxiv.org/abs/2412.13663
- Repositorio oficial de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
