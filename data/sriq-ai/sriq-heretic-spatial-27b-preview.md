# sriq-ai/sriq-heretic-spatial-27b-preview

## Resumen

sriq-heretic-spatial-27b-preview es un ajuste fino del modelo trohrbaugh/Qwen3.8-27B-heretic-ara, desarrollado por SRIQ y publicado en HuggingFace con licencia Apache-2.0. Se trata de un modelo de 27.356.728.560 parametros (unos 27,36 mil millones) cuyos pesos se distribuyen fusionados en bf16 en un repositorio de 55,6 GB. La model card lo describe como un modelo que razona en chino simplificado comprimido y responde en el idioma en el que se le pregunta, una eleccion poco habitual que busca abaratar la traza de razonamiento en terminos de tokens.

El modelo parte de una base etiquetada como "heretic" y se ha entrenado mediante LoRA sobre una base cuantizada a 4 bits (QLoRA), con posterior fusion a bf16. El entrenamiento se realizo sobre el dataset sriq-ai/exp-n800-spatial, de tematica aparentemente espacial, con solo 99 pasos y una fraccion de una epoca (790 de 790 filas). La etiqueta de pipeline de HuggingFace es image-text-to-text, lo que apunta a entrada multimodal de imagen y texto, aunque la model card no documenta en detalle esta capacidad.

Su relevancia es limitada y muy experimental: el propio autor declara que no se ejecuto ningun benchmark para esta version, que no hay verificacion de tasa de razonamiento en chino ni de bucles frente al modelo base, y recomienda evaluarlo en la carga de trabajo propia antes de confiar en el. Es, por tanto, una publicacion de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5); detalles completos no disponibles |
| Parametros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 65.536 tokens (maximo usado en entrenamiento; ventana nativa final no confirmada) |
| Tipos de cuantizacion | no disponible en el repositorio; pesos publicados en bf16 y entrenamiento sobre base 4 bits (QLoRA) |
| Idiomas soportados | razona en chino simplificado comprimido y responde en el idioma de la pregunta; lista oficial de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Autor | sriq-ai (SRIQ) |
| Modelo base | trohrbaugh/Qwen3.8-27B-heretic-ara |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La etiqueta `qwen3_5` sugiere que la familia base emplea un transformer de tipo Qwen 3.5, pero no se confirma si incorpora mezcla de expertos (MoE), atencion lineal u otro mecanismo. El pipeline declarado es image-text-to-text, lo que implica soporte de entrada de imagen ademas de texto, aunque no se documentan el codificador visual ni la resolucion de imagen admitida.

El entrenamiento consistio en un LoRA (r=64, alpha=64, dropout=0.0) aplicado sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, partiendo de una base cuantizada a 4 bits y fusionando despues el adaptador a bf16. Se uso el dataset sriq-ai/exp-n800-spatial (commit ddae3b407e264fb358335b9ad7f743e47692e906) con 99 pasos (limitados por `max_steps`, no por epocas), tamano de lote efectivo 8 (1 por dispositivo x 8 de acumulacion de gradientes), cobertura de 1,00 epoca (790 de 790 filas), tasa de aprendizaje 1,5e-4 con scheduler lineal y 10 pasos de calentamiento. La longitud maxima de secuencia fue de 65.536 tokens, descartando las filas que la excedian en lugar de truncarlas. La perdida final de entrenamiento fue de 0,5052. Todo el proceso se ejecuto en una unica NVIDIA RTX PRO 6000 Blackwell Server Edition (edicion servidor) en nube segura, con un coste de 2,49 USD/hora, 2 horas y 56 minutos de reloj y un gasto aproximado de 7,32 USD. Se utilizo la plataforma interna train.sriq.org, no publica. No se documento RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Modo de razonamiento explicito: la model card advierte de que no debe pasarse `enable_thinking=False`, ya que la plantilla rellena un `<think></think>` vacio y la traza desaparece.
- Razonamiento en chino simplificado comprimido, con respuesta en el idioma de la pregunta. El proposito declarado es reducir el coste en tokens de la traza de pensamiento.
- Entrada de imagen y texto segun el pipeline declarado (image-text-to-text), aunque la model card no detalla el alcance real de esta capacidad.
- Capacidad multilingue presumiblemente heredada del modelo base, sin lista oficial de idiomas disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita (la etiqueta "reasoning" sugiere razonamiento, no orquestacion de agentes).

## Casos de uso

- Analisis de documentos extensos: con una longitud de secuencia de hasta 65.536 tokens usada en entrenamiento, puede procesar informes tecnicos, expedientes o contratos largos en una sola pasada, evitando troceado y recuperacion.
- Asistente conversacional multilingue: responde en el idioma de la pregunta mientras razona internamente en chino, lo que permite servir usuarios en varios idiomas manteniendo una unica traza de razonamiento.
- Reduccion de coste de inferencia en tareas de razonamiento: al comprimir la cadena de pensamiento en chino, el numero de tokens generados por traza puede ser menor que en razonamiento en ingles, lo que abarata el coste por consulta en despliegues de alto volumen.
- Tareas con entrada visual (suponiendo que la capacidad image-text-to-text sea funcional): descripcion de imagenes, respuesta a preguntas sobre capturas, diagramas o documentos escaneados, segun el pipeline declarado.
- Prototipado y evaluacion interna de modelos "heretic": util como punto de partida para equipos que quieran medir el comportamiento de la familia base antes de comprometerse con un despliegue.
- Base para ajustes de dominio: dado que el adaptador LoRA esta publicado por separado, es un punto de partida razonable para nuevos LoRA sobre tareas especificas con presupuesto reducido.
- Investigacion sobre cadenas de razonamiento comprimidas: permite estudiar si una traza corta en chino mantiene la calidad de respuesta frente a trazas largas en ingles.
- Experimentacion con modelos derivados en entornos academicos: licencia Apache-2.0 y pesos abiertos facilitan su uso en investigacion sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente: "No benchmarks were run for this release", y anade que no se reportan filas sobre razonamiento en chino, tasa de verificacion ni comportamiento en bucles frente al modelo base.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del numero de parametros (27,36 mil millones) y de la precision de los pesos; no proceden de mediciones publicadas por el autor.

- Pesos en bf16: aproximadamente 54,7 GB solo para los parametros, mas memoria para cache KV y activaciones.
- Inferencia en bf16/fp16: se recomienda al menos 80 GB de VRAM (A100 80 GB, H100 80 GB, RTX PRO 6000 Blackwell de 96 GB). Una sola GPU de 24 GB no es suficiente.
- Inferencia cuantizada a 8 bits: en torno a 27-30 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 con tensor parallelism.
- Inferencia cuantizada a 4 bits: en torno a 14-18 GB de VRAM para los pesos, lo que permitiria encajar en una RTX 4090 o RTX 3090 de 24 GB, con margen reducido y dependiente de la longitud de contexto.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4 bits) y contextos moderados; en 24 GB el margen es escaso con 65.536 tokens de contexto.
- Opciones de despliegue: transformers (uso directo segun la model card); vLLM y TGI para servicio en GPU si la arquitectura es compatible (sin confirmar); llama.cpp u Ollama requeririan convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones.
- Entrenamiento: el autor uso una unica NVIDIA RTX PRO 6000 Blackwell Server Edition con 600 GB de disco de contenedor, con un coste de 2,49 USD/hora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sriq-ai/sriq-heretic-spatial-27b-preview | 27,36B | 65.536 tokens (entrenamiento) | Apache-2.0 | HuggingFace |
| trohrbaugh/Qwen3.8-27B-heretic-ara (base) | no disponible (≈27B por nomenclatura) | no disponible | no disponible | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otros modelos del mismo tamano. La unica relacion documentada es con el modelo base y con el adaptador LoRA publicado por separado.

## Limitaciones y advertencias

- El autor advierte explicitamente de que no se ejecuto ningun benchmark: no existe evidencia publicada de calidad, tasa de verificacion ni estabilidad frente al modelo base.
- Entrenamiento muy corto: 99 pasos, una sola epoca sobre 790 filas y una perdida final de 0,5052. El riesgo de sobreajuste al dataset o de olvido catastrofico de capacidades del modelo base es alto.
- La model card indica que el entrenamiento vio las 790 filas del dataset, es decir, la totalidad de los datos disponibles: no hay conjunto de validacion documentado.
- No debe pasarse `enable_thinking=False`: la plantilla rellena un `<think></think>` vacio y la traza de razonamiento desaparece, lo que puede degradar la respuesta de forma silenciosa.
- Hereda todas las limitaciones del modelo base trohrbaugh/Qwen3.8-27B-heretic-ara, que no se detallan.
- Sesgos conocidos: no disponibles. Al razonar en chino simplificado comprimido, puede arrastrar sesgos propios de los datos en ese idioma.
- Riesgo de alucinacion: no cuantificado por el autor. Al ser un ajuste fino de 99 pasos sin evaluacion, no hay garantia de que no se haya incrementado.
- Limitaciones de contexto e idioma: la ventana nativa final no esta confirmada; la lista oficial de idiomas no esta publicada, y el comportamiento fuera del chino y del ingles no esta documentado.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de un modelo base con licencia no disponible en la ficha, conviene verificar la licencia del modelo base antes de un uso comercial.
- Caveat de produccion: el repositorio no incluye pesos GGUF ni cuantizaciones listas para usar, y no hay confirmacion de compatibilidad con vLLM o TGI. El despliegue requeriria pruebas y posiblemente conversion.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriq-heretic-spatial-27b-preview
- Adaptador LoRA: https://huggingface.co/sriq-ai/sriq-heretic-spatial-27b-preview-adapter
- Dataset de entrenamiento: https://huggingface.co/datasets/sriq-ai/exp-n800-spatial
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Sitio de SRIQ: https://sriq.org
- Benchmarks de SRIQ: https://bench.sriq.org
- Plataforma de entrenamiento (no publica): https://train.sriq.org
