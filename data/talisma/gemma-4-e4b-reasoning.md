# talisma/Gemma-4-E4B-Reasoning

## Resumen

Gemma-4-E4B-Reasoning es una cuantización GGUF del modelo instructivo Gemma 4 E4B de Google DeepMind, realizada por Talisma AI Studio. El modelo base, lanzado en abril de 2026, es un transformer denso de solo decodificador con atención híbrida (ventana deslizante local de 512 tokens más atención global), diseñado específicamente para ejecutarse en dispositivos de borde. La variante E4B emplea embeddings por capa (Per-Layer Embeddings), lo que permite que sus aproximadamente 7.500 millones de parámetros totales se comporten como un modelo de 4.500 millones de parámetros efectivos, reduciendo el coste computacional y de memoria sin sacrificar capacidad.

Esta versión concreta, ajustada para razonamiento paso a paso, mantiene todas las capacidades del modelo base: procesamiento multimodal (texto, imagen y audio), ventana de contexto de 128.000 tokens, soporte para más de 140 idiomas y función de tool calling nativa. Al estar publicada en formato GGUF con múltiples niveles de cuantización (Q2_K a f16), permite desplegar el modelo en hardware variado, desde portátiles con CPU hasta GPUs de consumo, sin depender de APIs externas. Su licencia Apache 2.0 facilita su uso comercial y su integración en proyectos propietarios.

La relevancia actual de este modelo reside en que combina capacidades de razonamiento avanzado, multimodalidad y eficiencia en un paquete que cabe en una GPU de gama media, algo poco habitual en la categoría de modelos abiertos de 2026. Es una opción atractiva para desarrolladores que necesitan un asistente local con comprensión de documentos, imágenes y voz, y que además pueda razonar sobre problemas complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de solo decodificador con atencion hibrida (ventana deslizante local de 512 tokens + atencion global) |
| Parametros totales | 7.518.069.290 (≈7,5B; 8B con embeddings segun la model card) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, f16 (segun repo de 57,7 GB) |
| Idiomas soportados | Multilingue: mas de 140 idiomas en pretraining, con soporte fuerte para mas de 35 |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponible en google/gemma-4-E4B-it) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B es un transformer denso de solo decodificador con 42 capas y un vocabulario de 262.000 tokens. Su innovacion principal son los embeddings por capa (Per-Layer Embeddings), una tecnica que comparte y reutiliza matrices de embedding entre capas, reduciendo el numero de parametros efectivos de 8B a 4,5B sin degradar significativamente la calidad. La atencion hibrida combina una ventana deslizante local de 512 tokens con atencion global, lo que permite manejar contextos de hasta 128.000 tokens con un coste computacional menor que la atencion completa.

El entrenamiento del modelo base incluyo datos multimodales (texto, imagen y audio) y un ajuste fino supervisado con instrucciones, seguido de optimizacion mediante aprendizaje por refuerzo con retroalimentacion humana (RLHF). La variante "Reasoning" de Talisma AI Studio es una cuantizacion del checkpoint instructivo, no un reentrenamiento; por tanto, conserva las capacidades de razonamiento paso a paso, tool calling y comprension multimodal del original. No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset, aunque el reporte tecnico esta disponible en arxiv (2607.02770).

## Capacidades

- Generacion de texto y razonamiento paso a paso: el modelo piensa internamente antes de responder, mostrando un modo de "thinking" que mejora el rendimiento en matematicas, logica y problemas multi-paso.
- Comprension multimodal: procesa imagenes (documentos escaneados, capturas de pantalla, graficos, escritura a mano) y audio (transcripcion de voz y traduccion de habla), ademas de texto.
- Tool calling y function calling nativo: puede invocar herramientas externas y encadenar llamadas en flujos agente, compatible con plataformas como n8n.
- Capacidades multilingues: soporte para mas de 140 idiomas en pretraining, con rendimiento solido fuera de la caja en mas de 35.
- Ventana de contexto larga: 128.000 tokens, suficiente para documentos extensos, transcripciones completas o historiales de chat prolongados.
- OCR y comprension de documentos: extrae datos de PDFs, facturas, formularios y notas manuscritas.
- ASR y traduccion de voz integrados: no requiere un modelo de voz separado para transcripcion y traduccion.

## Casos de uso

- Asistente de codigo local y privado: un desarrollador puede ejecutar el modelo en su estacion de trabajo con una cuantizacion Q4_K_M y usarlo para autocompletar, explicar fragmentos y refactorizar sin enviar codigo a servicios externos, gracias a su licencia Apache 2.0 y su capacidad de tool calling.
- Atencion al cliente automatizada: con su ventana de 128K tokens y soporte multilingue, puede gestionar conversaciones multi-turno con historial largo, resumir tickets y extraer intenciones, integrándose en plataformas de CXM como las de la propia Talisma.
- Extraccion de datos de documentos (OCR + comprension): en operaciones de back-office, el modelo procesa facturas, formularios y notas manuscritas, convirtiendo imagenes en datos estructurados sin necesidad de un pipeline OCR separado.
- Traduccion y transcripcion de voz en tiempo real: para aplicaciones de voz, el modelo transcribe audio y traduce entre idiomas, habilitando asistentes de voz multilingues en dispositivos con recursos limitados.
- Tutor educativo interactivo: estudiantes e investigadores pueden plantear problemas de matematicas o ciencia y recibir explicaciones paso a paso, gracias a su modo de razonamiento interno.
- Automatizacion de flujos agente: ingenieros de automatizacion pueden conectarlo a herramientas externas mediante function calling para construir agentes que consulten APIs, actualicen bases de datos o ejecuten tareas administrativas, todo localmente.
- Localizacion de contenido: equipos de producto global pueden usar el modelo para traducir y adaptar contenido a mas de 140 idiomas, reduciendo costes frente a APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una mejora "2x+" frente a Gemma 3 27B en tareas de razonamiento, pero sin cifras concretas ni metodologia. El reporte tecnico (arxiv 2607.02770) podria contener datos, pero no estan incluidos en los materiales proporcionados. No se proporcionan tampoco resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantizacion Q4_K_M (aproximadamente 4,5-5 GB de pesos), se necesita una GPU con al menos 6 GB de VRAM para contexto corto; para 128K tokens completos se requeriria bastante mas (estimacion orientativa de 16-20 GB con cuantizacion Q4).
- GPUs recomendadas: RTX 3060 12 GB o superior para Q4_K_M con contexto moderado; RTX 4090, A100 o H100 para contexto completo y cuantizaciones mayores (Q8, f16).
- Compatibilidad con consumer GPU: si, con cuantizaciones Q4 o Q5 en GPUs de 8-12 GB; las cuantizaciones Q8 y f16 requieren GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta gemma4:e4b disponible), vLLM con soporte GGUF, LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 40-60 tokens/segundo para contexto moderado, pero estos valores son estimaciones basadas en modelos similares de 7-8B, no datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-E4B-Reasoning (este) | 7,5B totales (4,5B efectivos) | 128K | texto, imagen, audio | Apache 2.0 | GGUF |
| Gemma 3 27B (model card menciona comparacion) | 27B | 128K | texto, imagen | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 8B | 8B | 128K | texto | Llama 3.2 license | safetensors, GGUF |
| Qwen 2.5 7B | 7,6B | 128K | texto | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en caracteristicas generales, no en benchmarks publicados. Gemma-4-E4B-Reasoning se diferencia por su multimodalidad (audio incluido), su diseno de embeddings por capa que reduce el coste efectivo, y su licencia permisiva. Frente a Gemma 3 27B, ofrece un rendimiento de razonamiento supuestamente superior (segun la model card, "2x+") con una fraccion de los recursos, aunque no hay datos publicos que lo confirmen. Llama 3.2 8B y Qwen 2.5 7B son alternativas monomodales de tamano similar, pero sin soporte de audio ni la optimizacion especifica para dispositivos de borde.

## Limitaciones y advertencias

- Al ser una cuantizacion, puede presentar degradacion de calidad respecto al modelo original en tareas de razonamiento complejo, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- No se han publicado evaluaciones de sesgos ni de seguridad especificas para esta version cuantizada; se asume que hereda los riesgos del modelo base de Google DeepMind.
- Riesgo de alucinacion en tareas factuales, comun en modelos de este tamano; se recomienda verificar respuestas en entornos criticos.
- El soporte de audio (ASR y traduccion de voz) puede requerir una cuantizacion mayor para obtener calidad aceptable; con Q4 puede degradarse la precision de transcripcion.
- Aunque la licencia es Apache 2.0, el modelo base tiene condiciones de uso de Google (terminos de servicio de Gemma) que pueden imponer restricciones adicionales en ciertos casos de uso comercial; se debe revisar la documentacion oficial.
- La ventana de 128K tokens consume mucha memoria en atencion; en GPUs de menos de 16 GB, el contexto util se reduce considerablemente.
- No hay informacion sobre la composicion exacta del dataset de entrenamiento ni sobre el proceso de RLHF, lo que dificulta evaluar su comportamiento en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talisma/Gemma-4-E4B-Reasoning
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B-it
- Reporte tecnico (arxiv): https://arxiv.org/abs/2607.02770
- Model card oficial de Google: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en ollama: https://ollama.com/library/gemma4:e4b
- Ficha en crafiq.ai: https://crafiq.ai/models/language/google-gemma-4-e4b
- Ficha en AITier: https://aitier.net/en/models/gemma-4-e4b
