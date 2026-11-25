# zhtstar/RadarMind-3B

## Resumen

RadarMind-3B es un modelo de visión-lenguaje especializado en la interpretación de imágenes de radar de apertura sintética (SAR, synthetic aperture radar), desarrollado por el autor zhtstar y presentado junto al artículo "RadarMind: Explainable Chain-of-Thought Reasoning for SAR Image Interpretation with Large Vision-Language Models" publicado en IEEE Transactions on Aerospace and Electronic Systems. Se trata de un ajuste fino completo (pesos fusionados, sin adaptador LoRA separado) del modelo Qwen2.5-VL-3B-Instruct, por lo que hereda su arquitectura transformer multimodal y su tokenizador.

El modelo resuelve el problema de la comprensión automática de imágenes SAR, un dominio en el que los modelos de visión generalistas rinden mal debido a las características particulares de esta modalidad (ruido de moteado, visión cenital, ausencia de color, geometría de retrodispersión). RadarMind-3B aborda tareas de respuesta visual a preguntas (VQA) y descripción detallada de escenas SAR, y su propuesta central es el razonamiento en cadena de pensamiento (chain-of-thought) explicable, orientado a que las conclusiones sobre la escena sean trazables.

Con 3.754.622.976 parámetros reales según los pesos en safetensors y un repositorio de 7,5 GB, es la variante compacta de la familia RadarMind, que se completa con RadarMind-7B. Está pensado para investigación en teledetección y percepción radar, no para uso comercial, dado que hereda la licencia Qwen Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal visión-lenguaje), pesos completamente fusionados |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL-3B-Instruct; no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con transformers y safetensors, admite las cuantizaciones habituales del ecosistema (no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License, con restricción no comercial) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

RadarMind-3B parte de Qwen2.5-VL-3B-Instruct, un modelo visión-lenguaje con encoder visual y decoder de lenguaje basado en la familia Qwen2.5, y se distribuye como pesos fusionados, es decir, el resultado del ajuste fino ya integrado en el checkpoint base, sin necesidad de cargar un adaptador LoRA aparte. La modalidad principal es la imagen SAR, y las tareas soportadas declaradas son VQA, captioning y interpretación de escenas SAR.

El entrenamiento se apoya en el dataset companion SARLingu, publicado por el mismo autor en Hugging Face y ModelScope, orientado a instrucciones y descripciones en lenguaje natural sobre imágenes SAR. La contribución metodológica del artículo es el razonamiento chain-of-thought explicable para la interpretación SAR, esto es, la generación de cadenas de razonamiento intermedias que justifican la respuesta final sobre la escena. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes SAR: identificar y describir elementos de la escena a partir de una pregunta en lenguaje natural.
- Descripción de imágenes (image captioning) y descripción detallada de escenas SAR.
- Interpretación de escenas radar con razonamiento en cadena de pensamiento explicable, según la propuesta del artículo asociado.
- Procesamiento multimodal imagen-texto mediante el pipeline estándar de Qwen2.5-VL (chat template y procesador multimodal).
- Conversación multi-turno sobre la imagen de entrada, al heredar la interfaz conversacional del modelo base.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Capacidades generales del modelo base (texto, razonamiento, código) no están documentadas para esta variante; no hay información que confirme su preservación tras el ajuste.

## Casos de uso

- Análisis de imágenes satelitales SAR en investigación en teledetección: el modelo recibe una escena radar y responde preguntas sobre su contenido (presencia de infraestructuras, tipos de superficie, distribución de la escena), aprovechando su especialización en esta modalidad frente a modelos de visión generalistas.
- Generación de descripciones automáticas de escenas SAR para catalogación de archivos: captioning de imágenes para indexar y buscar grandes volúmenes de datos radar en repositorios de observación de la Tierra.
- Asistencia a analistas de percepción radar: el modo de razonamiento chain-of-thought permite revisar la cadena de justificación de una conclusión sobre la escena, lo que facilita la verificación humana en entornos de investigación.
- Docencia y formación en interpretación SAR: uso del modelo como apoyo para explicar qué elementos hay en una imagen radar y por qué, con la salvedad de que las salidas deben verificarse.
- Evaluación comparativa de modelos visión-lenguaje en dominios especializados: servir de referencia de 3B parámetros frente a modelos generalistas en benchmarks de VQA sobre SAR.
- Prototipado de pipelines de teledetección multimodal: integración vía transformers con el procesador de Qwen2.5-VL para experimentar con flujos imagen-texto sobre datos SAR antes de escalar a la variante RadarMind-7B.
- Investigación sobre explicabilidad en modelos multimodales: estudiar la calidad y fidelidad de las cadenas de razonamiento generadas en un dominio concreto y de alta dificultad perceptiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16/float16, el checkpoint de 3,75 mil millones de parámetros ocupa aproximadamente 7,5 GB, por lo que se necesitan en torno a 8-10 GB de VRAM para cargar el modelo y algo más para el procesamiento de imágenes y el contexto. En cuantización de 8 bits bajaría a unos 4 GB y en 4 bits a unos 2-2,5 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue en servidor; en el extremo consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cargan el modelo con holgura en precisión completa.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más en bfloat16 (por ejemplo RTX 4070 Ti, RTX 4080, RTX 3090/4090); en GPUs de 8 GB requeriría cuantización.
- Opciones de despliegue: transformers (vía `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`, como indica la model card) y text-generation-inference, dado el tag `text-generation-inference`. El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible; al tratarse de un modelo multimodal basado en Qwen2.5-VL, la vía documentada por el autor es transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadarMind-3B | 3,75 B | no disponible | SAR / teledeteccion, VQA y captioning | qwen-research (no comercial) | Hugging Face, ModelScope |
| RadarMind-7B | escala 7B (dato no detallado) | no disponible | SAR / teledeteccion, variante mayor de la misma familia | qwen-research (presumiblemente, no confirmado) | Hugging Face, ModelScope |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | vision-lenguaje generalista | Qwen Research License | Hugging Face |
| Modelos VLM generalistas de 3-4B (p. ej. variantes de la familia Qwen2.5-VL o Llama 3.2 Vision) | 3-4B | no disponible | vision-lenguaje generalista, sin especializacion SAR | segun modelo | Hugging Face |

La comparación relevante es frente a su modelo base: RadarMind-3B sacrifica generalidad a cambio de especialización en SAR y razonamiento explicable, pero no hay datos de benchmarks publicados que cuantifiquen esa mejora. Frente a RadarMind-7B, la variante de 3B ofrece menor coste de inferencia y cabe en GPUs consumer de gama alta.

## Limitaciones y advertencias

- Licencia qwen-research con restricción no comercial: no apta para uso comercial sin revisar y cumplir los ficheros LICENSE y NOTICE incluidos.
- Modelo de investigación: el autor indica explícitamente que las salidas deben verificarse de forma independiente antes de cualquier uso operativo o crítico para la seguridad.
- Riesgo de alucinación: como todo VLM, puede describir elementos inexistentes en la escena SAR o justificar con razonamientos plausibles pero incorrectos; la cadena de pensamiento no garantiza corrección.
- Dominio estrecho: especializado en imágenes SAR; su rendimiento en imágenes ópticas, RGB u otras modalidades no está documentado y probablemente sea inferior al del modelo base.
- Idiomas soportados no especificados: no hay información sobre la cobertura multilingüe del ajuste fino.
- Longitud de contexto no documentada para esta variante.
- Sin datos de benchmarks publicados en la información disponible, lo que impide una evaluación cuantitativa objetiva.
- Sesgos conocidos: no documentados por el autor.
- Comunidad muy reducida (6 descargas y 0 likes en el momento de la consulta), lo que implica escasa validación externa y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhtstar/RadarMind-3B
- Modelo en ModelScope: https://modelscope.cn/models/zhtstar/RadarMind-3B
- Modelo mayor RadarMind-7B en Hugging Face: https://huggingface.co/zhtstar/RadarMind-7B
- RadarMind-7B en ModelScope: https://modelscope.cn/models/zhtstar/RadarMind-7B
- Dataset SARLingu en Hugging Face: https://huggingface.co/datasets/zhtstar/SARLingu
- Dataset SARLingu en ModelScope: https://modelscope.cn/datasets/zhtstar/SARLingu
- Repositorio de código: https://github.com/zhtstar/RadarMind
- Artículo IEEE (DOI): https://doi.org/10.1109/TAES.2026.3719218
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
