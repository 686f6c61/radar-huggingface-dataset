# vwdubb/Qwen3.8-3.6-27B-blend-FP8

## Resumen

Qwen3.8-3.6-27B-blend-FP8 es una versión cuantizada a FP8 del checkpoint JetBrains/Qwen3.8-3.6-27B-blend, publicada por el usuario vwdubb en HuggingFace. El modelo base es un derivado no oficial de JetBrains que combina, mediante interpolación lineal de parámetros (model soup), dos checkpoints de Alibaba Cloud: Qwen3.6-27B y Qwen3.8-27B, con un peso del 50 % para cada uno y acumulación en float32. Ni el blend original ni esta versión FP8 han recibido entrenamiento adicional: el proceso se limita a la fusión de pesos y, en este caso, a la cuantización posterior.

El resultado es un modelo denso de 27.781.427.952 parámetros (~27,8 B) con pipeline image-text-to-text, es decir, acepta imágenes y texto como entrada. La configuración, el tokenizer, el processor y la plantilla de chat se heredan íntegramente de Qwen3.8-27B, según la model card del autor original. La licencia es Apache 2.0, con la licencia y el aviso de copyright de Qwen (Copyright 2026 Alibaba Cloud) conservados sin modificaciones.

Su relevancia práctica está en el contexto del asistente de codificación Junie Local de JetBrains: el blend se publicó junto a un artículo sobre IA local, con evaluaciones internas de codificación y experimentos de eficiencia de tokens. La variante FP8 reduce el peso de los pesos de ~55,6 GB (BF16) a poco más de la mitad, lo que acerca el despliegue en GPUs de 48 GB y, con cuantizaciones adicionales, en hardware de consumo. No obstante, el repositorio no incluye resultados de benchmarks propios ni datos de contexto o idiomas, y acumula 0 descargas y 0 "likes", por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (pipeline image-text-to-text); identificador de arquitectura en los tags del repo: qwen3_5; resultado de la interpolacion lineal de dos checkpoints Qwen3.x-27B |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible (no figura en la model card ni en los metadatos proporcionados) |
| Tipos de cuantizacion | FP8 en este repositorio (tag compressed-tensors); el modelo base ofrece BF16, GGUF, MLX 4-bit y MTP MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (se conserva la licencia original de Qwen y su aviso de copyright) |
| Formato de pesos | safetensors (cuantizacion FP8, compressed-tensors) |
| Tamano del repositorio | 38,5 GB |
| Modelo base | JetBrains/Qwen3.8-3.6-27B-blend (relacion: quantized) |
| Composicion del blend | 0,5 * Qwen/Qwen3.6-27B + 0,5 * Qwen/Qwen3.8-27B, con acumulacion en float32 |
| Revisiones de origen | Qwen3.6-27B: 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9; Qwen3.8-27B: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Libreria de inferencia | transformers |
| Autor del repositorio | vwdubb (cuantizacion); modelo base por JetBrains |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal. No se trata de una arquitectura nueva: la model card del blend original indica que la configuracion, el tokenizer, el processor y la plantilla de chat se retienen de Qwen3.8-27B, y que el unico proceso aplicado fue la interpolacion lineal de los parametros de dos checkpoints con pesos iguales (50/50). No hubo entrenamiento adicional, fine-tuning ni uso de datos de entrenamiento nuevos en la creacion del derivado, ni tampoco en la cuantizacion posterior documentada en este repositorio. La interpolacion se realizo con acumulacion en float32 y las revisiones exactas de los checkpoints fuente, junto con los ajustes de la fusion, quedan registradas en el fichero merge-manifest.json del repositorio base.

En cuanto a innovaciones tecnicas, la informacion disponible se limita a la propia tecnica de fusion de checkpoints (linear merge / model soup) y a la cuantizacion FP8 mediante la libreria compressed-tensors. El articulo de JetBrains asociado menciona experimentos de runtime con MTP (multi-token prediction) y publica una variante MTP MLX 4-bit del modelo base, lo que sugiere soporte de decodificacion con prediccion multi-token en ese ecosistema, aunque no se detallan especificaciones tecnicas en la informacion proporcionada. No se documentan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, porque el modelo no se entreno: hereda las caracteristicas de los checkpoints Qwen subyacentes, cuyas fichas originales se enlazan como referencia.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" y la plantilla de chat heredada de Qwen3.8-27B.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), por lo que puede procesar imagenes junto a instrucciones en lenguaje natural.
- Codificacion: el modelo base se evaluo en un benchmark interno de 100 tareas de codigo de JetBrains y se posiciona en el contexto del asistente Junie Local, orientado a desarrollo de software.
- Razonamiento de multiples pasos: no documentado explicitamente en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible; no se puede confirmar ni descartar.
- Modo de razonamiento explicito (thinking mode): no documentado; el grafico de JetBrains menciona que los ajustes de razonamiento difieren entre configuraciones, sin detallar el mecanismo.
- Capacidades multilingues: no disponibles.
- Capacidades de audio o video: no disponibles.
- Eficiencia de tokens: el articulo de JetBrains reporta resultados de eficiencia de tokens en tareas de codigo, aunque sin cifras en la informacion proporcionada.

## Casos de uso

- Asistente de codificacion en el IDE: el modelo encaja en flujos tipo Junie Local, donde completa funciones, explica codigo heredado y propone refactorizaciones manteniendo la conversacion con el contexto del fichero abierto. JetBrains lo evaluo especificamente en un benchmark interno de 100 tareas de codigo.
- Revision de capturas de pantalla y diagramas: al aceptar entrada de imagen, puede analizar mockups de interfaz, diagramas de arquitectura o capturas de errores del compilador y generar el codigo o la explicacion correspondiente.
- Generacion de tests unitarios a partir de fragmentos de codigo o de la descripcion de una captura de pantalla, integrable en un pipeline de CI que invoque el modelo a traves de la API de transformers o de un servidor vLLM.
- Documentacion tecnica automatizada: generar docstrings, README y notas de version a partir del codigo fuente y de diagramas de arquitectura aportados como imagen, con la plantilla de chat del checkpoint Qwen3.8.
- Despliegue local con requisitos de confidencialidad: al ser un modelo de ~27,8 B con pesos FP8 de aproximadamente 28 GB, puede ejecutarse en una GPU de 48 GB on-premise sin enviar codigo propietario a servicios en la nube.
- Extraccion de informacion de documentos escaneados o formularios: combinando OCR implicito de la via de imagen con generacion de texto estructurado, util para digitalizar documentos tecnicos.
- Prototipado de agentes conversacionales sobre el stack de transformers: aprovechando la compatibilidad con endpoints (tag endpoints_compatible) para desplegar el modelo detras de una API compatible con OpenAI.
- Experimentacion en investigacion sobre fusion de modelos: el repositorio base documenta la receta de interpolacion y las revisiones exactas, por lo que sirve como caso reproducible para estudiar el efecto del linear merge en modelos multimodales de ~27 B.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del modelo base enlaza un grafico de su articulo titulado "Making Local AI Smarter and Faster", con el eje de calidad de codificacion frente a tokens de salida en un benchmark interno de 100 tareas de codigo de JetBrains, pero no se incluyen cifras concretas ni tablas comparativas en los datos proporcionados, y las propias notas indican que los ajustes de razonamiento difieren entre configuraciones. Esta variante FP8, en particular, no aporta ninguna evaluacion propia: no hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto publico.

| Benchmark | Resultado |
|---|---|
| Benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) | no disponible |
| Benchmark interno de codigo de JetBrains (100 tareas) | Publicado solo como grafico calidad/tokens en el blog; sin cifras en la informacion disponible |
| Evaluacion especifica de esta variante FP8 | no disponible |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (27,78 B) y del formato de pesos, no datos publicados por el autor. El consumo real depende de la longitud de contexto efectiva y del tamaño del lote, que no estan documentados.

- Pesos en FP8 (este repositorio): aproximadamente 27,8 GB para los pesos en disco, con un consumo de VRAM practico de unos 32-36 GB contando activaciones y cache KV.
- Pesos en BF16 (modelo base): aproximadamente 55,6 GB, con 64-70 GB de VRAM en despliegues reales.
- Pesos en GGUF/MLX cuantizados (disponibles para el modelo base, no para esta variante FP8): Q8 en torno a 29 GB, Q5 en torno a 19-20 GB y Q4 en torno a 16-17 GB de VRAM.
- GPUs de datacenter recomendadas: H100 80 GB, H200 y A100 80 GB para FP8 o BF16 con contexto amplio; L40S 48 GB para FP8 con contexto moderado.
- GPUs de consumo: una RTX 5090 de 32 GB puede alojar los pesos FP8 de forma ajustada, con contexto limitado. Una RTX 4090 de 24 GB no admite los pesos FP8 completos; en esa GPU hay que recurrir a cuantizaciones GGUF/MLX de 4-6 bits del modelo base. Dos RTX 4090 en paralelo (48 GB) permiten FP8 con offloading o sharding.
- Nota sobre FP8: el calculo nativo en FP8 requiere tensor cores de generaciones Ada, Hopper o Blackwell. En GPUs Ampere (A100, RTX 30xx) los checkpoints FP8 se ejecutan dequantizando a un tipo soportado, con penalizacion de rendimiento.
- Opciones de despliegue: vLLM y SGLang con soporte de compressed-tensors, TGI, y transformers como via de referencia. Para CPU, Apple Silicon o GPUs pequeñas, llama.cpp, Ollama y MLX requieren convertir previamente los pesos, ya que este repositorio solo publica safetensors FP8; existen conversiones GGUF y MLX 4-bit del modelo base publicadas por JetBrains.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwdubb/Qwen3.8-3.6-27B-blend-FP8 (este) | 27.781.427.952 | no disponible | safetensors FP8 (compressed-tensors) | apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| JetBrains/Qwen3.8-3.6-27B-blend | no disponible (mismo checkpoint base, ~27,8 B) | no disponible | BF16 (safetensors) y variantes GGUF, MLX 4-bit, MTP MLX 4-bit | apache-2.0 | HuggingFace; publicado junto al articulo de Junie Local |
| Qwen/Qwen3.8-27B (uno de los dos progenitores) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada (la licencia se conserva en el derivado) | HuggingFace, model card oficial |
| Qwen/Qwen3.6-27B (uno de los dos progenitores) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada (la licencia se conserva en el derivado) | HuggingFace, model card oficial |

No se dispone de datos de rendimiento, contexto ni cuantizaciones de los checkpoints Qwen originales en la informacion proporcionada, por lo que la comparativa se limita a aspectos de disponibilidad y licencia. La diferencia funcional relevante entre este repositorio y el blend en BF16 de JetBrains es unicamente el formato de pesos: FP8 frente a BF16, con soporte adicional de GGUF y MLX en el caso de JetBrains.

## Limitaciones y advertencias

- Modelo sin validacion: acumula 0 descargas y 0 likes, y no incluye ninguna evaluacion propia ni comparativa numerica frente al blend en BF16. No hay evidencia publicada de que la cuantizacion FP8 preserve la calidad del checkpoint original.
- Degradacion potencial por cuantizacion: FP8 introduce error numerico respecto a BF16. El impacto en tareas de codigo o razonamiento no esta medido en la informacion disponible.
- Fusion sin entrenamiento: al ser una interpolacion lineal 50/50 de dos checkpoints, el comportamiento resultante es una mezcla de sus capacidades, con el riesgo de degradaciones dificiles de predecir o de inconsistencias entre modos que cada modelo resuelve bien por separado.
- Derivado no oficial: ni el blend de JetBrains ni esta cuantizacion estan afiliados, patrocinados o respaldados por Alibaba Cloud o Alibaba Group, segun la propia model card. La cuantizacion la firma un usuario independiente (vwdubb), no JetBrains.
- Falta de datos operativos: se desconoce la longitud de contexto real, los idiomas soportados, el soporte de tool calling y si existe un modo de razonamiento explicito. Cualquier decision de produccion basada en estos factores exige verificacion directa sobre el modelo.
- Riesgo de alucinacion: no cuantificado ni documentado; es inherente a los modelos generativos de esta familia y debe mitigarse con verificacion, especialmente en generacion de codigo y en tareas sobre imagenes.
- Sesgos: no documentados en la informacion proporcionada, pero se heredan de los datos de entrenamiento de los checkpoints Qwen subyacentes.
- Restricciones de licencia: se distribuye bajo Apache 2.0 y se conserva la licencia original de Qwen. La propia model card advierte de que usar el modelo o sus salidas para infringir derechos de propiedad intelectual de terceros puede vulnerar la legislacion aplicable, con independencia de los terminos de la licencia.
- Atribucion obligatoria: el aviso de copyright de JetBrains solo cubre el material original de JetBrains; el material de Qwen queda sujeto a sus propios avisos. Deben conservarse los ficheros LICENSE, NOTICE y CHANGES.md en cualquier redistribucion.
- Ejecucion FP8: fuera de GPUs con tensor cores FP8 nativos (Ada, Hopper, Blackwell), el rendimiento sera notablemente inferior al esperado por el formato.

## Enlaces

- Repositorio de este modelo (FP8): https://huggingface.co/vwdubb/Qwen3.8-3.6-27B-blend-FP8
- Modelo base en BF16, JetBrains/Qwen3.8-3.6-27B-blend: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Version GGUF del modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Version MLX 4-bit del modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Version MTP MLX 4-bit del modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Manifiesto de la fusion (revisiones y ajustes): https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/merge-manifest.json
- Fichero CHANGES.md con las modificaciones: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/CHANGES.md
- Fichero NOTICE de atribucion: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend/blob/main/NOTICE
- Model card de Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Model card de Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Articulo "Making Local AI Smarter and Faster" (JetBrains, evaluaciones de codificacion y experimentos MTP): https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- Resumen de datos de entrenamiento de Qwen: https://qwen.ai/training-data-summary
