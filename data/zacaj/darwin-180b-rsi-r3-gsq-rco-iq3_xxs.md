# zacaj/Darwin-180B-RSI-R3-GSQ-RCO-IQ3_XXS

## Resumen

Darwin-180B-RSI-R3-GSQ-RCO-IQ3_XXS es una cuantización GGUF de tipo IQ3_XXS del modelo Darwin-180B-RSI, publicado por el usuario zacaj en Hugging Face. El modelo base pertenece a la familia Darwin, desarrollada por FINAL_Bench, y se presenta como un modelo conversacional de gran escala (aproximadamente 177.000 millones de parámetros) orientado a tareas de imagen y texto a texto, con una ventana de contexto declarada de 262.144 tokens. Esta ficha se centra en el artefacto cuantizado, del que se dispone de información muy limitada más allá de sus metadatos.

La relevancia de esta publicación es doble. Por un lado, permite ejecutar un modelo de escala 180B en hardware mucho más asequible que su versión de 16 bits, que requeriría unos 432 GB de VRAM. Por otro, ilustra una tendencia creciente: la distribución comunitaria de pesos cuantizados de modelos de gran tamaño mediante formatos GGUF e imatrix, pensados para despliegues con llama.cpp y herramientas compatibles.

No obstante, conviene advertir que el repositorio no incluye model card técnica (solo una cabecera de licencia), no registra descargas ni interacciones, y no se han publicado resultados de benchmarks específicos para esta cuantización. La información disponible sobre arquitectura interna, datos de entrenamiento y capacidades detalladas del modelo base es parcial y debe tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Darwin-180B-RSI de FINAL_Bench; detalles internos no publicados) |
| Parámetros totales | 176.943.899.520 (≈177B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según ficha del modelo base) |
| Tipos de cuantización | IQ3_XXS (esta publicación); el modelo base se distribuye también en 16 bits y 4 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other" con enlace a la licencia de Qwen) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna del modelo base. La documentación de FINAL_Bench indica que las generaciones previas de Darwin injertaban bloques de expertos y FFN de otros modelos fuertes sobre un backbone base, y que Darwin-180B-RSI añade como novedad el propio trabajo verificado del modelo (proceso que el nombre "RSI" sugiere relacionado con auto-mejora iterativa). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta publicación concreta es una cuantización IQ3_XXS con imatrix, es decir, una versión de aproximadamente 3 bits por peso generada con una matriz de importancia para preservar las capas más sensibles. El repositorio ocupa 75,8 GB, lo que resulta coherente con un modelo de 177B parámetros a esa profundidad de bits. No hay información sobre innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa u otras).

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Procesamiento multimodal imagen y texto a texto, según la ficha del modelo base en SAVRN.
- Ventana de contexto extensa de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su integración en infraestructuras de inferencia gestionadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modos especiales (thinking mode, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa: gracias a su contexto de 262.144 tokens, el modelo puede ingerir manuales técnicos, expedientes o bases de código completas en una sola pasada y responder preguntas sobre ellos sin fragmentación.
- Asistentes conversacionales de largo recorrido: la etiqueta "conversational" y la ventana amplia permiten mantener diálogos multi-turno con memoria de contexto extensa, útil en atención al cliente especializada.
- Procesamiento de imágenes con descripción textual: al ser un modelo imagen y texto a texto, puede emplearse para generar descripciones, resúmenes o extracción de información a partir de capturas, diagramas o documentos escaneados.
- Despliegue en hardware de gama alta con cuantización: la versión IQ3_XXS reduce el requisito de VRAM hasta aproximadamente 108 GB, lo que permite servir el modelo en una única GPU de 192 GB (por ejemplo, MI300X) en lugar de necesitar varias GPUs a 16 bits.
- Investigación sobre cuantización agresiva: este artefacto sirve para estudiar la degradación de calidad de un modelo de 177B al comprimirlo a ~3 bits con imatrix, comparando sus respuestas con las del modelo base.
- Prototipado con llama.cpp u Ollama: al estar en formato GGUF, puede integrarse en entornos locales o de laboratorio para experimentación sin depender de APIs propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 108 GB para la versión de 4 bits según la ficha del modelo base; esta cuantización IQ3_XXS ocupa 75,8 GB en disco, por lo que se estima un consumo de VRAM en el entorno de los 80-90 GB, aunque no se confirma oficialmente.
- Versión de 16 bits: unos 432 GB de VRAM, según SAVRN, lo que requiere múltiples GPUs o nodos de gran memoria.
- GPUs recomendadas: AMD MI300X (192 GB) para la cuantización de 3-4 bits; MI325X en configuraciones de 16 bits; GPUs NVIDIA de 80 GB (A100, H100) en pares o clústeres para el modelo completo.
- Cabe en GPU de consumo: no. Ninguna GPU consumer actual (RTX 4090 con 24 GB, por ejemplo) puede alojar este modelo ni siquiera en IQ3_XXS.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; SGLang aparece mencionado en la ficha del modelo base; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-GSQ-RCO-IQ3_XXS (esta ficha) | ≈177B | 262.144 | qwen-community-1.0 | GGUF IQ3_XXS | Hugging Face (zacaj) |
| Darwin-180B-RSI (base) | ≈180B | 262.144 | other (qwen-community-1.0) | 16 bits / 4 bits | Hugging Face (FINAL_Bench) |
| Alternativas de escala 180B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- La cuantización IQ3_XXS es agresiva (~3 bits) y puede degradar la calidad de las respuestas respecto al modelo en 16 bits, especialmente en tareas de razonamiento complejo y código.
- No hay model card técnica ni documentación de sesgos, datos de entrenamiento o evaluación de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se ha cuantificado para esta versión.
- Idiomas soportados no especificados; no se garantiza un rendimiento adecuado en castellano.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es imprescindible revisar el texto completo antes de un despliegue en producción.
- El repositorio no registra descargas ni interacciones, lo que dificulta validar su calidad o reproducibilidad.
- El proceso de entrenamiento declarado (injerto de bloques y auto-mejora) no está documentado en detalle, lo que limita la auditabilidad del modelo.
- No se confirma compatibilidad con vLLM o TGI para este artefacto concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zacaj/Darwin-180B-RSI-R3-GSQ-RCO-IQ3_XXS
- Modelo base en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Ficha del modelo base en SAVRN: https://savrn.com/models/darwin-180b-rsi
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE
