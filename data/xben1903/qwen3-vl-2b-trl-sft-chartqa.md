# Xben1903/qwen3-vl-2b-trl-sft-ChartQA

## Resumen

qwen3-vl-2b-trl-sft-ChartQA es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen3-VL-2B-Instruct, publicado por el usuario Xben1903 en Hugging Face. El modelo parte de la familia Qwen3-VL, la variante vision-language de la serie Qwen3, y ha sido entrenado con la librería TRL sobre un conjunto de datos orientado a ChartQA, una tarea de razonamiento sobre graficos y tablas que combina percepcion visual con respuesta a preguntas en lenguaje natural. El repositorio contiene pesos en formato safetensors con un tamano aproximado de 0,3 GB, lo que sugiere cuantizacion o pesos de baja precision respecto al modelo base original.

El interes de esta ficha es doble. Por un lado, documenta un caso tipico de especializacion de un modelo vision-language pequeno (2B parametros) para una tarea concreta de comprension de graficos, un escenario muy demandado en analitica de datos y generacion de informes automatizados. Por otro, evidencia las limitaciones de trazabilidad de muchos ajustes finos publicados en Hugging Face: la model card es practicamente la plantilla autogenerada por TRL, sin resultados de evaluacion, sin detalles del dataset de entrenamiento y sin licencia declarada de forma explicita.

La relevancia actual del modelo radica en que los modelos de 2B parametros con capacidades visuales permiten desplegar tareas de extraccion y razonamiento sobre graficos en hardware de consumo, algo impensable con modelos de mayor tamano. No obstante, la ausencia de benchmarks publicados y de informacion sobre el proceso de entrenamiento obliga a tratar esta publicacion como un artefacto experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), derivada de Qwen3-VL-2B-Instruct; detalles de atencion y vision encoder no disponibles |
| Parametros totales | 2B (heredados del modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio pesa 0,3 GB, lo que sugiere pesos de baja precision, pero no se especifica el esquema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye "licence: license" sin concretar; el modelo base Qwen3-VL-2B-Instruct tiene su propia licencia, no confirmada aqui) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.19.0.dev0, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La informacion disponible no detalla la configuracion interna (numero de capas, dimensiones ocultas, mecanismo de atencion, resolucion de imagen soportada ni estrategia de fusion vision-lenguaje), por lo que estos extremos deben consultarse en la model card del modelo base. El ajuste se ha realizado con TRL mediante SFT, es decir, aprendizaje supervisado sobre pares de entrada-salida, sin que se documente si hubo RLHF, DPO u otras fases posteriores.

El nombre del repositorio indica que el conjunto de datos de entrenamiento esta relacionado con ChartQA, un benchmark de pregunta-respuesta sobre graficos que requiere leer valores, comparar series y realizar operaciones aritmeticas sencillas sobre datos visualizados. No obstante, la model card no especifica el numero de ejemplos, la composicion del dataset, el numero de tokens vistos, la resolucion de las imagenes ni los hiperparametros de entrenamiento (learning rate, batch size, epocas). Tampoco se indica si se congelaron capas del codificador visual o del decodificador. La ausencia de esta informacion impide reproducir el entrenamiento o evaluar su calidad de forma rigurosa.

## Capacidades

- Generacion de texto y respuesta a preguntas en lenguaje natural, heredadas del modelo base Qwen3-VL-2B-Instruct.
- Comprension de imagenes y, presumiblemente, de graficos y tablas, dado el ajuste sobre ChartQA; no se documenta el alcance exacto de esta capacidad.
- Razonamiento visual basico orientado a la lectura de valores y tendencias en graficos, segun el dominio del dataset de ajuste.
- Soporte de conversacion multi-turno mediante el formato de chat de Qwen (la model card muestra un ejemplo con `pipeline` y mensajes con rol de usuario).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes, thinking mode, audio o vision avanzada: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base Qwen3-VL soporta varios idiomas, pero este ajuste no documenta su cobertura linguistica.

## Casos de uso

- Extraccion automatizada de datos de graficos en informes financieros: el modelo puede recibir una imagen de un grafico de barras o lineas y devolver valores concretos o tendencias, aprovechando el ajuste sobre ChartQA para tareas de lectura de series y comparaciones.
- Generacion de resumenes de dashboards: integrado en un pipeline que capture capturas de paneles de BI, el modelo podria producir descripciones textuales de las metricas representadas, util para informes periodicos automatizados.
- Asistencia en analisis de datos para periodistas o analistas: dado un grafico publicado, el modelo responde preguntas del tipo "que categoria crecio mas" o "cual fue el valor maximo", reduciendo el trabajo manual de inspeccion visual.
- Preprocesamiento en pipelines de document understanding: como primer paso para convertir graficos embebidos en PDFs o presentaciones en datos estructurados que alimenten una base de datos o una hoja de calculo.
- Prototipado rapido en entornos con GPU de consumo: al tratarse de un modelo de 2B parametros con pesos en un repositorio de 0,3 GB, puede ejecutarse en tarjetas graficas de gama media para pruebas de concepto de QA visual sin infraestructura dedicada.
- Evaluacion comparativa de ajustes finos: util como referencia en experimentos academicos sobre especializacion de modelos vision-language pequenos en dominios concretos, especialmente para estudiar el efecto del SFT sobre ChartQA en modelos de 2B.
- Moderacion o verificacion de contenido grafico: en escenarios donde se necesita comprobar si un grafico cumple ciertas condiciones (por ejemplo, si una tendencia es creciente), el modelo podria actuar como clasificador auxiliar, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2B parametros con pesos en un repositorio de 0,3 GB, la inferencia en precision reducida (probablemente FP16 o BF16 con pesos comprimidos) cabe en GPUs con 6-8 GB de VRAM; en cuantizaciones de 4 bits podria requerir menos de 4 GB, aunque no se documenta el esquema exacto.
- GPU recomendadas: NVIDIA RTX 3060/4060 (8-12 GB), RTX 4070/4080, A10G, L4 o superiores. Para despliegue en servidor, A100 o H100 ofrecerian mayor throughput pero no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 en adelante, siempre que se gestione correctamente la carga del codificador visual y la resolucion de imagen.
- Opciones de despliegue: transformers (soporte nativo segun la model card), vLLM y TGI si el modelo base Qwen3-VL-2B-Instruct esta soportado por esas herramientas; llama.cpp u Ollama solo si existen conversiones GGUF del modelo base y se aplican los pesos ajustados, algo no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xben1903/qwen3-vl-2b-trl-sft-ChartQA | 2B | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes | Ajuste SFT sobre ChartQA; sin benchmarks publicados |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible en esta ficha | licencia del modelo base (no confirmada aqui) | Hugging Face, modelo oficial | Modelo base sin especializar; capacidades generales de vision-lenguaje |
| SmolVLM-Instruct (referencia del proyecto Trackio) | ~2B | no disponible | no disponible | Hugging Face | Mencionado en el enlace de Trackio como proyecto de entrenamiento; no es una comparacion directa de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con el de sus alternativas. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, ChartQA, HumanEval ni de ninguna otra evaluacion, por lo que no se puede verificar que el ajuste mejore al modelo base en la tarea objetivo.
- Model card autogenerada: el contenido es la plantilla de TRL, con un ejemplo de prompt generico que no guarda relacion con graficos, lo que sugiere poca validacion por parte del autor.
- Dataset de entrenamiento no documentado: se desconoce el numero de ejemplos, la procedencia de las imagenes, la resolucion y si hubo filtrado de calidad; esto impide evaluar sesgos y riesgo de sobreajuste.
- Licencia no declarada de forma explicita ("licence: license"): no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base Qwen3-VL-2B-Instruct condiciona cualquier redistribucion.
- Riesgo de alucinacion: en tareas de lectura de graficos, los modelos pequenos pueden inventar valores numericos o interpretar mal escalas y leyendas; sin evaluacion no se puede cuantificar este riesgo.
- Idiomas no documentados: no se especifica que idiomas maneja el ajuste, aunque el modelo base tenga cobertura multilingue.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que limita el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-24) en los metadatos: inconsistencia que conviene verificar antes de confiar en la trazabilidad del repositorio.
- Para produccion: se recomienda evaluar el modelo contra el base en un conjunto propio de graficos antes de desplegarlo, y mantener supervision humana en cualquier flujo donde los valores extraidos tengan consecuencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xben1903/qwen3-vl-2b-trl-sft-ChartQA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Panel de entrenamiento en Trackio: https://Xben1903-qwen3-vl-2b-trl-sft-ChartQA-trackio.hf.space?project=smolvlm-instruct-trl-sft-ChartQA&runs=smolvlm-instruct-trl-sft-ChartQA&sidebar=collapsed
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Trackio (referenciada en la model card): https://github.com/gradio-app/trackio
