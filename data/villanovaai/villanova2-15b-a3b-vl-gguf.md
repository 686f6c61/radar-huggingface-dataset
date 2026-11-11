# VillanovaAI/Villanova2-15B-A3B-VL-GGUF

## Resumen

Villanova2-15B-A3B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Villanova2-15B-A3B-VL, desarrollado por VillanovaAI. Se trata de un modelo de lenguaje y visión con arquitectura de mezcla de expertos (MoE) que cuenta con 15.496.439.744 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según indica el sufijo A3B). El modelo está diseñado específicamente para comprensión de documentos, OCR y tareas de imagen-texto a texto, con un enfoque explícito en el ámbito europeo.

La relevancia de esta ficha radica en que se trata de la distribución en GGUF de un modelo multimodal MoE con licencia Apache 2.0, lo que facilita su despliegue en entornos con llama.cpp y herramientas compatibles, sin depender de GPUs de datacenter. El soporte declarado de cinco idiomas europeos (inglés, italiano, alemán, español y francés) lo posiciona como una alternativa para aplicaciones de procesamiento documental multilingüe en el mercado europeo.

No obstante, la información pública disponible es muy limitada: el repositorio tiene 0 descargas, 3 likes, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. Esto implica que muchos detalles técnicos (datos de entrenamiento, benchmarks, composición del dataset) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal (image-text-to-text) |
| Parametros totales | 15.496.439.744 |
| Parametros activos | ~3B (indicado por el sufijo A3B; no confirmado en ficha técnica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene múltiples cuantizaciones; no se detallan los niveles exactos) |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors: VillanovaAI/Villanova2-15B-A3B-VL) |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE) con capacidades multimodales de imagen-texto a texto. El modelo totaliza 15.496 millones de parámetros, de los cuales aproximadamente 3.000 millones se activan por token (según la convención de nomenclatura A3B). Esta configuración permite un equilibrio entre capacidad total y coste computacional de inferencia, ya que solo una fracción de los parámetros se procesa en cada paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa, atención lineal o mecanismos híbridos. El modelo está etiquetado como "european" y "document-understanding" y "ocr", lo que sugiere un entrenamiento orientado a documentos y multilingüismo europeo, pero estos extremos no están confirmados con datos concretos en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo procesa entradas de imagen y texto para producir respuestas textuales (pipeline image-text-to-text).
- Comprensión de documentos y OCR: etiquetado explícitamente para document-understanding y OCR, lo que sugiere capacidad de extraer texto e interpretar documentos escaneados o fotografías.
- Conversación multi-turno: etiqueta "conversational" y "endpoints_compatible", lo que indica soporte para diálogos y compatibilidad con endpoints de inferencia.
- Multilingüismo: soporte declarado de inglés, italiano, alemán, español y francés.
- Capacidades de visión: al ser un modelo vision-language, puede describir imágenes, responder preguntas sobre ellas y extraer información visual.
- No se ha confirmado soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Digitalización y extracción de datos de facturas y documentos financieros: el modelo puede procesar imágenes de facturas en español, francés, italiano o alemán y extraer campos estructurados (importes, fechas, proveedores) gracias a sus capacidades de OCR y comprensión documental, con la ventaja de cubrir varios idiomas europeos en un solo modelo.
- Atención al cliente con soporte visual: integrado en un chatbot, el modelo puede recibir capturas de pantalla o fotos de productos enviadas por el usuario y responder en el idioma del cliente (es, fr, it, de, en), gestionando conversaciones multi-turno.
- Procesamiento de archivos administrativos multilingües: en entornos públicos o empresariales europeos, el modelo puede clasificar y resumir documentos escaneados en los cinco idiomas soportados, reduciendo la necesidad de modelos separados por idioma.
- Accesibilidad: descripción automática de imágenes para personas con discapacidad visual, generando texto alternativo en el idioma del usuario, con la ventaja de un modelo MoE que reduce el coste de inferencia frente a un modelo denso de 15B.
- Análisis de formularios y encuestas en papel: digitalización de respuestas manuscritas o impresas y conversión a datos estructurados, aprovechando la capacidad de OCR y el contexto conversacional para aclarar campos ambiguos.
- Despliegue en entornos con recursos limitados: al estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU consumer, lo que facilita prototipos y despliegues en edge para tareas de OCR y comprensión documental sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE de 15,5B totales con ~3B activos, los requisitos dependen de la cuantización. En GGUF Q4, el peso del modelo ronda los 8-9 GB, por lo que se necesitan aproximadamente 10-12 GB de VRAM para inferencia con contexto moderado. En Q8, el peso se acerca a los 16 GB, requiriendo 18-20 GB de VRAM. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en datos oficiales del repositorio.
- GPU recomendadas: para cuantizaciones bajas (Q4), una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para cuantizaciones altas o contextos largos, se recomienda A100 (40/80 GB) o H100. También es posible ejecutar en CPU con llama.cpp, aunque con latencia mayor.
- Cabe en GPU consumer: sí, en cuantizaciones Q4 o inferiores cabe en GPUs con 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080, etc.), siempre que el contexto no sea excesivamente largo.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia estándar, pero no se detalla si soporta vLLM o TGI (que normalmente requieren safetensors).
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos, se espera un throughput superior al de un modelo denso de 15B, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (multimodales MoE con enfoque documental y europeo). Se indica "no disponible" para evitar especulaciones sin datos. Como referencia cualitativa, modelos multimodales de tamaño similar incluyen Qwen2-VL-7B o InternVL2, pero no se dispone de datos de benchmarks de Villanova2 que permitan una comparación objetiva.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso comercial directo sin revisión de términos.
- Información técnica incompleta: no se dispone de datos sobre contexto máximo, composición del dataset, benchmarks ni proceso de alineación, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en OCR de documentos de baja calidad o en idiomas con menos representación.
- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado con datos no especificados, puede heredar sesgos de género, culturales o lingüísticos. El enfoque "europeo" podría implicar menor cobertura de otras regiones.
- Limitaciones de idioma: solo se declaran cinco idiomas (en, it, de, es, fr); no se garantiza rendimiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo gated, conviene verificar las condiciones adicionales del repositorio.
- Madurez: el modelo tiene 0 descargas y fue creado en noviembre de 2026, por lo que su ecosistema y validación comunitaria son prácticamente inexistentes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-VL-GGUF
- Modelo base (safetensors): https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-VL
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
