# taobao-mnn/Qwen3-VL-30B-A3B-Thinking-MNN

## Resumen

Qwen3-VL-30B-A3B-Thinking-MNN es un paquete de inferencia en formato MNN del modelo Qwen3-VL-30B-A3B-Thinking, publicado por el equipo taobao-mnn (Alibaba). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada a 4 bits mediante HQQ (Half-Quadratic Quantization) del checkpoint original de Qwen, pensada para ejecutarse con el motor MNN de Alibaba. El objetivo es facilitar el despliegue del modelo multimodal en entornos con recursos limitados, especialmente en CPU, manteniendo tanto el modelo de lenguaje como el codificador visual.

El modelo original es un transformer de mezcla de expertos (MoE) orientado al razonamiento multimodal: acepta texto e imágenes como entrada y genera texto. Cuenta con 48 capas, 128 expertos enrutados y activa 8 expertos por token, lo que da lugar a la designación "30B-A3B" (30 mil millones de parámetros totales, 3 mil millones activos por token). La variante "Thinking" está optimizada para razonamiento explícito, con énfasis en tareas de OCR, percepción espacial, codificación visual, contexto largo y vídeo.

La relevancia de este paquete radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware modesto gracias a la cuantización de las capas lineales de texto a 4 bits (tamaño de grupo 64, escalas FP16), conservando los embeddings en BF16. El repositorio ocupa 37,4 GB y la licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision), 48 capas |
| Parametros totales | 30B (designacion del modelo original) |
| Parametros activos | 3B por token (8 de 128 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, group size 64, escalas FP16; embeddings en BF16 |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (paquete de inferencia MNN, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 capas y 128 expertos enrutados, de los cuales se seleccionan 8 por token. Combina un modelo de lenguaje con un codificador visual, lo que le permite procesar entradas de texto e imagen y producir texto. La variante "Thinking" del checkpoint original está orientada al razonamiento explícito y pone énfasis en tareas multimodales como OCR, percepción espacial, codificación visual, contexto largo y vídeo.

Este paquete concreto no aporta información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). La conversión aplicada por taobao-mnn consiste en cuantización HQQ de 4 bits sobre las capas lineales de texto (group size 64, escalas FP16), manteniendo los embeddings de tokens en BF16 como pesos separados. El paquete incluye tanto el modelo de lenguaje como el codificador visual, y requiere una revisión específica de MNN (commit 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4) que incorpora correcciones de exportación para MoE.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Comprensión visual: OCR, percepción espacial y codificación visual, según el énfasis declarado del modelo original.
- Tareas de contexto largo y vídeo (capacidades atribuidas al checkpoint original).
- Modo de razonamiento explícito ("Thinking"), orientado a problemas que requieren cadenas de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés (en).

## Casos de uso

- Extracción de texto de documentos e imágenes (OCR): el codificador visual incluido en el paquete permite procesar imágenes y transcribir su contenido textual, aprovechando el énfasis del modelo original en tareas OCR.
- Análisis de capturas de pantalla e interfaces: el modelo puede interpretar elementos visuales y su disposición espacial, útil para automatizar la comprensión de UI o la generación de descripciones estructuradas.
- Razonamiento sobre diagramas y figuras técnicas: la combinación de entrada visual y modo "Thinking" permite resolver preguntas que requieren interpretar gráficos y razonar sobre ellos.
- Despliegue en CPU y entornos con recursos limitados: al estar cuantizado a 4 bits y empaquetado para MNN, es adecuado para ejecutar inferencia multimodal en servidores sin GPU dedicada o en dispositivos con memoria restringida.
- Procesamiento de documentos escaneados en pipelines internos: la licencia Apache 2.0 y el formato MNN permiten integrar el modelo en flujos de digitalización y clasificación documental.
- Prototipado de asistentes multimodales: sirve para validar aplicaciones que combinan imagen y texto antes de migrar a un despliegue con mayor precisión o mayor throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la migración superó 10 casos de prueba funcionales (smoke tests) en CPU en modos High y Low, y que estas comprobaciones son funcionales, no una evaluación amplia de calidad ni un benchmark de GPU.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 37,4 GB; al tratarse de un paquete MNN cuantizado a 4 bits en las capas lineales de texto, se requiere memoria suficiente para alojar los pesos empaquetados y el estado de inferencia. No se proporciona una cifra exacta de memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el paquete está orientado a ejecución con MNN, con compilación documentada para Linux CPU.
- Opciones de despliegue: motor MNN (compilación propia con `MNN_BUILD_LLM`, `MNN_BUILD_LLM_OMNI`, `MNN_BUILD_OPENCV`, `MNN_IMG_CODECS`, entre otras flags), usando `llm_demo` y `llm_bench`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete.
- Latencia y throughput: no disponibles; solo se mencionan los smoke tests funcionales en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-30B-A3B-Thinking-MNN (este) | 30B totales / 3B activos | no disponible | MNN, HQQ 4-bit | Apache 2.0 | Paquete cuantizado para MNN, orientado a CPU |
| Qwen/Qwen3-VL-30B-A3B-Thinking (original) | 30B totales / 3B activos | no disponible | safetensors | Apache 2.0 | Checkpoint completo sin cuantizar |
| Otras alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está verificado.
- La cuantización HQQ de 4 bits puede introducir degradación de calidad respecto al checkpoint original; no se han publicado evaluaciones de calidad comparativas.
- Los benchmarks del modelo original no se trasladan automáticamente a este paquete cuantizado; las únicas comprobaciones publicadas son funcionales (10 smoke tests en CPU).
- Riesgo de alucinación inherente a los modelos de lenguaje y a la generación multimodal; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la información proporcionada.
- El paquete depende de una revisión concreta de MNN (commit 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4); otras versiones pueden no ser compatibles con los pesos exportados.
- Aunque la licencia es Apache 2.0, se debe respetar la atribución y las condiciones del modelo original de Qwen.
- El formato MNN limita la portabilidad frente a safetensors o GGUF; no se documenta integración con los ecosistemas de inferencia más habituales.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-VL-30B-A3B-Thinking-MNN
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN requerido: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación de MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
