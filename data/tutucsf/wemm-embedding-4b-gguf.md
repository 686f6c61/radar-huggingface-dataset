# TuTuCSF/WeMM-Embedding-4B-GGUF

## Resumen

WeMM-Embedding-4B-GGUF es una versión cuantizada en formato GGUF del modelo WeMM-Embedding-4B, desarrollado por el equipo WeChat de Tencent. Este modelo es un embedding multimodal universal que acepta texto, imágenes, vídeos, documentos visuales y entradas intercaladas, y devuelve un vector de 2560 dimensiones normalizado con L2. Está construido sobre la arquitectura Qwen3.5-4B y está pensado para tareas de recuperación, recomendación, clasificación y sistemas agénticos que necesitan representar contenido heterogéneo en un espacio compartido.

La cuantización GGUF permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPUs de consumo, mediante herramientas como llama.cpp u Ollama. El repositorio contiene los pesos en formato GGUF, aunque no se especifican los tipos de cuantización incluidos. El modelo base se liberó el 26 de agosto de 2026 y su licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Esta ficha se centra en la versión cuantizada, pero las capacidades y especificaciones técnicas se refieren al modelo base, ya que la cuantización no altera la funcionalidad, solo el tamaño y los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5-4B (tipo exacto no especificado) |
| Parametros totales | 4.840.211.456 (4,84 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (formato GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base WeMM-Embedding-4B se construye sobre Qwen3.5-4B, un modelo de lenguaje de 4.000 millones de parámetros. No se dispone de detalles sobre la arquitectura interna (si es transformer puro, con atención lineal, etc.) en la información proporcionada. El modelo está diseñado para aceptar entradas multimodales intercaladas (texto, imagen, vídeo, documentos) y producir un embedding unificado de 2560 dimensiones, normalizado con L2.

El entrenamiento sigue el pipeline oficial de TIGER-AI-Lab/VLM2Vec, con modificaciones para soportar inferencia multi-nodo y multi-GPU, así como un muestreo de vídeo de 64 fotogramas. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El informe técnico está disponible en arXiv, pero no se incluyen cifras concretas en la información recopilada.

## Capacidades

- Genera embeddings multimodales de 2560 dimensiones, normalizados con L2, para texto, imágenes, vídeos, documentos visuales y combinaciones intercaladas.
- Soporta entrada de vídeo con muestreo de hasta 64 fotogramas.
- Diseñado para tareas de recuperación, búsqueda semántica, clasificación y recomendación sobre contenido heterogéneo.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.
- No se indica soporte para tool calling ni razonamiento multi-paso.
- Capacidades multilingües no especificadas.

## Casos de uso

- Búsqueda multimodal en bases de datos de contenido mixto: el modelo permite indexar imágenes, vídeos y documentos junto con texto, y recuperar resultados relevantes mediante similitud coseno sobre los embeddings generados.
- Sistemas de recomendación de contenido: al representar ítems (vídeos, artículos, productos) y usuarios en el mismo espacio vectorial, se pueden calcular recomendaciones por proximidad.
- Clasificación de documentos visuales: facturas, escaneos o capturas pueden convertirse en embeddings y clasificarse con modelos lineales o MLP, sin necesidad de OCR previo.
- Moderación de contenido en plataformas: los embeddings permiten detectar similitud entre imágenes o vídeos para identificar duplicados o contenido prohibido.
- Agentes autónomos con memoria multimodal: un agente puede almacenar observaciones (capturas de pantalla, texto, vídeo) como embeddings y recuperar experiencias pasadas relevantes.
- Deduplicación de datos en pipelines de datos: comparar embeddings de documentos o imágenes para eliminar entradas redundantes en grandes volúmenes de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico (arXiv:2608.24053) podría contener métricas comparativas, pero no se han extraído en la búsqueda web realizada.

## Requisitos de hardware

- Al ser una versión GGUF, el modelo puede ejecutarse con llama.cpp, Ollama u otros motores compatibles con este formato.
- El tamaño del repositorio es de 46,3 GB, lo que sugiere que incluye varias cuantizaciones (por ejemplo, Q4_K_M, Q5_K_M, Q8_0, etc.), aunque no se confirma.
- Para una cuantización típica Q4_K_M, la VRAM estimada sería de aproximadamente 3-4 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 o superiores.
- En CPU, con cuantizaciones bajas, podría funcionar con 8-16 GB de RAM, aunque la latencia sería mayor.
- No se dispone de datos de latencia o throughput específicos.
- Opciones de despliegue: llama.cpp, Ollama, y potencialmente vLLM si se convierte a safetensors (aunque el formato GGUF no es nativo de vLLM).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de embedding multimodal de tamaño similar. Existen alternativas como CLIP (para imagen-texto) o modelos como Jina Embeddings, pero no se han encontrado datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, código ni mantener conversaciones. Su única salida es un vector de embedding.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés o chino podría ser limitado.
- La longitud de contexto no está documentada; para entradas de vídeo o documentos largos, podría haber restricciones no conocidas.
- Al ser una cuantización GGUF, puede haber una ligera pérdida de precisión en los embeddings en comparación con el modelo en safetensors, aunque suele ser mínima en cuantizaciones de 4 bits o superiores.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación (este último no aplica al no generar texto).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del pipeline VLM2Vec para asegurar el cumplimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/TuTuCSF/WeMM-Embedding-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Embedding-4B
- Repositorio oficial en GitHub: https://github.com/Tencent/WeMM-Embedding
- Informe técnico (arXiv): https://arxiv.org/html/2608.24053
- Otra cuantización GGUF (Q4_K_M): https://huggingface.co/TuTuCSF/WeMM-Embedding-GGUF-Q4_K_M
