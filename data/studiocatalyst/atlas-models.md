# studiocatalyst/atlas-models

## Resumen

`studiocatalyst/atlas-models` no es un modelo entrenado, sino un repositorio agregador de artefactos de inferencia local que la aplicación Catalyst Atlas descarga en su primer uso. Cada fichero está fijado por su hash SHA-256 y corresponde a modelos de terceros, convertidos o cuantizados para ejecución en local; el autor declara explícitamente que ninguno fue entrenado ni ajustado en este repositorio. El repositorio cubre tres funciones diferenciadas: embeddings multimodales (texto, imagen y audio) mediante EmbeddingGemma 2 de Google DeepMind, detección de cortes de plano con OmniShotCut v1.5 del UVA Computer Vision Lab, y reconocimiento de voz con Qwen3-ASR 1.7B del equipo Qwen de Alibaba Cloud.

El peso declarado en safetensors es de 271.002.648 parámetros, aunque esta cifra no representa un único modelo: es la suma agregada de los componentes del repositorio, dominada por el codificador de Qwen3-ASR 1.7B y el modelo de embeddings. El tamaño total del repositorio es de 2,6 GB, repartido entre ficheros GGUF con cuantizaciones Q5_K_XL, Q5_1, Q5_K_M y Q8_0, y un ONNX en fp16 para el detector de cortes.

Su relevancia práctica es la de un paquete de dependencias de modelos para una aplicación de escritorio o pipeline local: permite construir un sistema de indexación y análisis de vídeo (transcripción, segmentación por planos y búsqueda semántica multimodal) sin depender de APIs externas, con licencias permisivas (Apache 2.0 y MIT) y verificación de integridad por hash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogeneo: modelo de embeddings de texto (EmbeddingGemma 2), codificadores de imagen y audio con proyectores, detector de cortes (OmniShotCut v1.5) y modelo ASR (Qwen3-ASR 1.7B) |
| Parametros totales | 271.002.648 (suma agregada del repositorio, no de un unico modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q5_K_XL (dinamica), Q5_1, Q5_K_M (con importance matrix), Q8_0; ONNX en fp16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (EmbeddingGemma 2, Qwen3-ASR) y MIT (OmniShotCut); el campo de licencia del repo es `other` con nombre `apache-2.0-and-mit` |
| Formato de pesos | GGUF y ONNX |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio. Los componentes son: EmbeddingGemma 2 de Google DeepMind, del que se incluye el modelo de texto como copia sin modificar de la cuantización dinámica Q5_K_XL de Unsloth, y sus codificadores de imagen y sonido con proyectores, cuantizados a Q5_1 solo en las capas lineales a partir del GGUF BF16 de ggml-org; OmniShotCut v1.5 del UVA Computer Vision Lab, convertido a ONNX en precisión de 16 bits, que detecta los cortes entre planos de vídeo; y Qwen3-ASR 1.7B del equipo Qwen, del que se incluye una copia sin modificar de la cuantización Q5_K_M con importance matrix de mradermacher, más su codificador de audio y proyector en Q8_0.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO) en la información proporcionada. La innovación técnica del repositorio es de empaquetado y distribución: fijación por SHA-256 de cada artefacto, separación entre pesos principales y proyectores multimodales (patrón `mmproj` de llama.cpp) y conversión a ONNX para el componente de visión.

## Capacidades

- Extracción de embeddings de texto para búsqueda semántica y recuperación (pipeline `feature-extraction`).
- Codificación de imagen y audio con proyectores dedicados, lo que habilita embeddings multimodales en un mismo espacio vectorial.
- Detección de cortes de plano en vídeo (segmentación por planos) mediante OmniShotCut v1.5 en ONNX fp16.
- Reconocimiento automático de voz (ASR) con Qwen3-ASR 1.7B, incluyendo su codificador de audio.
- Ejecución local con formatos GGUF y ONNX, compatible con el ecosistema llama.cpp y runtimes ONNX.
- Verificación de integridad de cada fichero mediante hash SHA-256 publicado.
- No se documentan en la información disponible capacidades de generación de texto, tool calling, agentes ni modo de razonamiento.

## Casos de uso

- Indexación semántica de una videoteca: transcribir cada vídeo con Qwen3-ASR 1.7B, segmentarlo por planos con OmniShotCut y generar embeddings de los fotogramas clave y de las transcripciones con EmbeddingGemma 2 para búsqueda por lenguaje natural.
- Búsqueda multimodal en archivos audiovisuales: usar los codificadores de imagen y audio de EmbeddingGemma 2 para consultar por similitud entre modalidades (por ejemplo, localizar fragmentos visualmente similares a una imagen de referencia).
- Generación automática de capítulos y subtítulos: la combinación de detección de cortes y ASR permite alinear transcripciones con cambios de plano y producir subtítulos con marcas de capítulo.
- Moderación y catalogación de contenido subido por usuarios: extraer embeddings de texto y audio para clasificación, deduplicación y detección de contenido repetido sin enviar datos a servicios externos.
- Pipeline de accesibilidad: transcripción local de audio a texto para subtitulado, con la ventaja de que los datos no salen del equipo, adecuado para entornos con requisitos de privacidad.
- Procesamiento por lotes en servidor sin GPU de gran tamaño: los tamaños cuantizados (Q5_K_M, Q5_1, Q8_0) permiten ejecutar los componentes en CPU o en GPU de gama media dentro de un flujo de ingestión de medios.
- Herramienta de escritorio integrada en la aplicación Catalyst Atlas: el repositorio actúa como origen de dependencias con verificación criptográfica en la primera ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; el repositorio completo ocupa 2,6 GB en disco y los componentes cuantizados a Q5 permiten inferencia en CPU.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: los ficheros GGUF Q5 y el ONNX fp16 son de tamaño reducido (modelo ASR de 1,7B y modelo de embeddings), por lo que en principio caben en GPU de consumo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (por el patrón `mmproj`), y runtime ONNX para OmniShotCut. No se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| studiocatalyst/atlas-models (este repo) | 271 M agregados | no disponible | Embeddings multimodales, ASR y deteccion de cortes | Apache 2.0 + MIT | Hugging Face (GGUF, ONNX) |
| google/embeddinggemma-2 | no disponible | no disponible | Embeddings multimodales | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | no disponible | ASR | Apache 2.0 | Hugging Face |
| UVA-Computer-Vision-Lab/OmniShotCut v1.5 | no disponible | no disponible | Deteccion de cortes de plano | MIT | GitHub |

La comparativa relevante es con los modelos originales, dado que este repositorio es una redistribución cuantizada de los mismos; las diferencias se limitan al formato (GGUF/ONNX), la cuantización y la verificación por hash.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe evaluarse como un modelo único ni citarse con los 271 M de parámetros como si fueran de una sola red.
- La licencia del repositorio es `other` (`apache-2.0-and-mit`); cada componente conserva su licencia propia y debe revisarse por separado antes de uso comercial.
- EmbeddingGemma 2 exige cumplir la Gemma Prohibited Use Policy de Google; "Gemma" y "EmbeddingGemma" son marcas de Google LLC.
- Los ficheros cuantizados o convertidos (mmproj Q5_1, OmniShotCut ONNX fp16) son modificaciones de los originales y pueden presentar degradación de precisión respecto a BF16.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información proporcionada.
- Los modelos se distribuyen sin garantías de ningún tipo, según la model card.
- Al depender de artefactos de terceros fijados por hash, la actualización de cualquiera de los modelos upstream requiere una nueva versión del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/studiocatalyst/atlas-models
- Licencia Apache 2.0: https://huggingface.co/studiocatalyst/atlas-models/blob/main/LICENSE-Apache-2.0.txt
- EmbeddingGemma 2 (Google DeepMind): https://huggingface.co/google/embeddinggemma-2
- Cuantización GGUF de EmbeddingGemma 2 por Unsloth: https://huggingface.co/unsloth/embeddinggemma-2-GGUF
- GGUF BF16 de EmbeddingGemma 2 por ggml-org: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- OmniShotCut v1.5 (UVA Computer Vision Lab): https://github.com/UVA-Computer-Vision-Lab/OmniShotCut
- Qwen3-ASR 1.7B (Qwen, Alibaba Cloud): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Cuantización GGUF de Qwen3-ASR 1.7B por mradermacher: https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-i1-GGUF
- Cuantización GGUF de Qwen3-ASR 1.7B (proyector): https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-GGUF
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
