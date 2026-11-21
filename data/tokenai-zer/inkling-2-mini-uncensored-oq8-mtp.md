# TokenAI-zer/Inkling-2-Mini-Uncensored-oQ8-mtp

## Resumen

Inkling-2-Mini-Uncensored-oQ8-mtp es una cuantización no oficial en formato oMLX oQ8 del modelo Inkling 2 Mini Uncensored, publicado por el usuario TokenAI-zer. Se trata de una compilación abliterada del Inkling 2 Mini de Thinking Machines, adaptada específicamente para Apple Silicon mediante la librería MLX. El modelo resuelve el problema de ejecutar un MoE multimodal de 26.400 millones de parámetros en hardware de consumo con memoria unificada, manteniendo el codificador de visión y un borrador DSpark para decodificación especulativa.

El modelo base es un MoE con arquitectura de bucle (Inkling2LoopForConditionalGeneration), 26.400 millones de parámetros totales y 3.400 millones activos, con entrada de texto e imagen y una ventana de contexto declarada de 1.048.576 tokens. La versión que nos ocupa conserva los expertos NVFP4 de las capas 0 a 19 sin recodificar y mantiene los expertos MXFP8 de las capas 20 a 23 tal como los publicó el autor original, aplicando cuantización afín de 8 bits con grupo 64 únicamente a atención, embeddings y cabeza de vocabulario.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: cuantización mixta con preservación de los formatos originales, decodificación especulativa integrada mediante el borrador DSpark y un proceso de abliteración que elimina los rechazos del modelo. Todo ello empaquetado en 18,78 GB de directorio, lo que permite su ejecución en equipos Apple con memoria unificada de 24 GB o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Inkling2LoopForConditionalGeneration (transformer MoE con bucle de capas y codificador de visión) |
| Parámetros totales | 26.388.646.400 (26,39B) |
| Parámetros activos | 3,4B |
| Longitud de contexto | 1.048.576 tokens en configuración; el contexto utilizable depende de la memoria disponible |
| Tipos de cuantización | oQ8: expertos NVFP4 (grupo 16) en capas 0-19 sin cambios, expertos MXFP8 (grupo 32) en capas 20-23 sin cambios, atención/embeddings/cabeza afín 8 bits grupo 64; visión y borrador en BF16; router y controladores de bucle en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (no GGUF ni PyTorch) |
| Bits efectivos por peso | 5,494 (LM + visión); 5,619 incluyendo el borrador DSpark |
| Capas | 24 (las capas 6 a 17 se ejecutan 3 veces por token) |
| Dimensión oculta | 2304 |
| Expertos | 128 enrutados con top-8 |
| Tamaño del directorio | 17,49 GiB (18,78 GB) |
| Shards de pesos | 4 archivos safetensors, 16,88 GiB (18,12 GB) + mtp.safetensors 0,59 GiB (0,64 GB) |
| Librería requerida | oMLX 0.8.1 o superior (construido con 0.8.2) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con bucle de capas. El modelo tiene 24 capas, de las cuales las capas 6 a 17 se ejecutan tres veces por token generado, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. Cada capa contiene 128 expertos enrutados con selección top-8, lo que da lugar a los 3,4B de parámetros activos sobre los 26,39B totales. La dimensión oculta es 2304. El modelo incorpora además un codificador de visión de 0,318B de parámetros que permite la entrada de imágenes junto con texto.

El checkpoint original de Thinking Machines ya distribuía los expertos enrutados en formatos cuantizados: NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23. La cuantización oQ8 de TokenAI-zer preserva esos formatos sin recodificarlos, de modo que no añade error de cuantización a los expertos. Solo la atención, los embeddings y la cabeza de vocabulario se recodifican a 8 bits afín con grupo 64. El codificador de visión y el borrador DSpark permanecen en BF16, mientras que el router y los controladores de bucle se mantienen en FP32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica más destacable es la inclusión del borrador DSpark (mtp.safetensors), un modelo auxiliar de 3 capas y 54 tensores en BF16 copiado byte a byte del checkpoint fuente, que oMLX Lightning MTP utiliza para decodificación especulativa. Este mecanismo permite generar varios tokens por paso de verificación, con una tasa de aceptación reportada de aproximadamente el 71% en una prueba corta. La abliteración del modelo base se aplicó únicamente a las 20 proyecciones de salida de atención en BF16 (attn.wo_ud, capas 4 a 23), dejando intactos los expertos, el codificador de visión y el borrador.

## Capacidades

- Generación de texto conversacional en inglés con soporte de modo chat y modo pensamiento (thinking mode).
- Razonamiento multi-paso y resolución de problemas, con un modo de razonamiento configurable mediante reasoning_effort.
- Comprensión de imágenes: pipeline image-text-to-text con codificador de visión dedicado de 0,318B de parámetros.
- Generación de código, incluyendo prompts de programación y tareas de completado.
- Procesamiento de contexto largo: ventana declarada de 1.048.576 tokens, limitada en la práctica por la memoria unificada disponible.
- Decodificación especulativa integrada mediante el borrador DSpark, que acelera la generación en oMLX.
- Modelo abliterado: se han eliminado los rechazos mediante ablación direccional, con 0 de 32 rechazos reportados en prompts dañinos según la model card del autor original.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- Capacidades multilingües limitadas al inglés según el campo language del repositorio.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede mantener conversaciones multi-turno en inglés directamente en un Mac con memoria unificada, sin depender de servicios en la nube, gracias a su formato MLX y a los 18,78 GB de directorio que caben en equipos de 24 GB o más.
- Análisis de documentos con imágenes: la combinación de codificador de visión y ventana de contexto de hasta 1M tokens permite procesar capturas, diagramas o páginas escaneadas junto con texto extenso en una sola pasada, útil para extracción de información de informes técnicos.
- Generación de código en flujos de desarrollo locales: con 3,4B de parámetros activos y decodificación especulativa, el modelo ofrece una latencia adecuada para autocompletado y generación de fragmentos de código en entornos de desarrollo sobre macOS, sin necesidad de GPU dedicada.
- Investigación sobre alineación y seguridad: al ser una versión abliterada con 0 de 32 rechazos reportados, sirve como objeto de estudio para analizar el comportamiento de modelos sin capas de rechazo y comparar con la versión original no abliterada.
- Procesamiento de contextos largos en local: la ventana declarada de 1.048.576 tokens permite resumir o consultar corpus extensos (documentación, transcripciones, código fuente de un repositorio) en una sola sesión, siempre que la memoria del equipo lo permita.
- Evaluación de cuantizaciones mixtas: el artefacto es útil para estudiar el impacto de preservar formatos NVFP4 y MXFP8 originales frente a recodificar, comparando con las variantes oQ4 y oQ6 del mismo autor que sí recuantizan los expertos de las capas 20 a 23.
- Prototipado de pipelines multimodales en MLX: investigadores que desarrollan con la librería MLX pueden usar este checkpoint como base para experimentos de visión-lenguaje sin convertir pesos a otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. La model card indica explícitamente que estas variantes no tienen resultados de benchmark posteriores a la cuantización. El autor original reporta, sobre el checkpoint fuente y no sobre esta cuantización, MMLU de 78,95% a 79,47% y 0 de 32 rechazos en prompts dañinos en modo chat y modo pensamiento.

| Métrica | Valor | Contexto |
|---|---|---|
| MMLU (modelo fuente, no esta cuantización) | 78,95% → 79,47% | Reportado por OpenUncensored sobre el checkpoint fuente |
| Rechazos en prompts dañinos (modelo fuente) | 0 de 32 | Medido en modo chat y thinking sobre el checkpoint fuente |
| Velocidad de decodificación (esta variante) | 61,7 tok/s | Prueba corta única en Apple M5 Max 128 GB, oMLX 0.8.2, MTP activo, prompt de código de 41 tokens, 300-570 tokens generados, reasoning_effort low, ~71% de tokens borrador aceptados |
| Velocidad de decodificación (oQ6-mtp) | 62,8 tok/s | Misma prueba corta |
| Velocidad de decodificación (oQ4-mtp) | 65,8 tok/s | Misma prueba corta |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el directorio completo ocupa 17,49 GiB (18,78 GB), por lo que se recomienda un mínimo de 24 GB de memoria unificada en Apple Silicon para dejar margen al contexto y a las activaciones. Con contexto largo, el requisito crece de forma proporcional.
- GPU recomendadas: Apple Silicon exclusivamente, dado que el formato es MLX. El autor reporta pruebas en un Apple M5 Max con 128 GB. No es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090) sin conversión previa a otro formato.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 24 GB o superior (M-series Pro, Max y Ultra). No aplica a GPUs de consumo NVIDIA en este formato.
- Opciones de despliegue: oMLX 0.8.1 o superior es requisito obligatorio. Para otros entornos existen alternativas: el checkpoint fuente en safetensors NVFP4/MXFP8/BF16, la versión GGUF de la misma abliteración en Abiray/Inkling-2-Mini-Uncensored-GGUF y la versión original no abliterada en formato oMLX de mlx-community.
- Latencia y throughput: 61,7 tok/s en decodificación con MTP activo en un M5 Max de 128 GB, medido en una única prueba corta con un 71% de aceptación del borrador. No es un benchmark representativo; la velocidad varía con la longitud del contexto, el prompt y la tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-oQ8-mtp (esta ficha) | 26,39B / 3,4B | 1.048.576 tokens | MLX safetensors, 18,78 GB | Apache 2.0 | Hugging Face, requiere oMLX 0.8.1+ |
| Inkling-2-Mini-Uncensored-oQ6-mtp | 26,39B / 3,4B | 1.048.576 tokens | MLX safetensors, 17,89 GB | Apache 2.0 | Hugging Face, misma familia, expertos de capas 20-23 en afín 6 bits |
| Inkling-2-Mini-Uncensored-oQ4-mtp | 26,39B / 3,4B | 1.048.576 tokens | MLX safetensors, 16,87 GB | Apache 2.0 | Hugging Face, misma familia, expertos de capas 20-23 en afín 4 bits, decodificación más rápida (65,8 tok/s) |
| OpenUncensored/Inkling-2-Mini-Uncensored (fuente) | 26,39B / 3,4B | 1.048.576 tokens | safetensors NVFP4/MXFP8/BF16 | Apache 2.0 | Hugging Face, checkpoint original sin cuantizar por oQ |
| Abiray/Inkling-2-Mini-Uncensored-GGUF | 26,39B / 3,4B | 1.048.576 tokens | GGUF | Apache 2.0 | Hugging Face, misma abliteración en formato GGUF para llama.cpp |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | 26,39B / 3,4B | 1.048.576 tokens | MLX safetensors | Apache 2.0 | Hugging Face, versión original no abliterada en formato oMLX |

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de rechazos implica que el modelo puede generar contenido dañino, sesgado o inapropiado sin las salvaguardas habituales. No se recomienda su uso en aplicaciones orientadas al público sin capas de moderación externas.
- Solo inglés: el campo language del repositorio declara únicamente en. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sin benchmarks posteriores a la cuantización: no hay datos publicados que midan la degradación introducida por la cuantización oQ8 respecto al checkpoint fuente. El MMLU reportado corresponde al modelo original, no a esta variante.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa con aparente seguridad, especialmente en contextos largos donde la ventana de 1M tokens puede diluir la atención sobre detalles concretos.
- Contexto declarado frente a contexto utilizable: aunque la configuración fija 1.048.576 tokens, la model card advierte que el contexto efectivo depende de la memoria disponible. En equipos de 24 GB, el contexto práctico será muy inferior.
- Restricciones de plataforma: el formato MLX safetensors solo es utilizable con oMLX 0.8.1 o superior en Apple Silicon. No es compatible con vLLM, TGI, llama.cpp ni Ollama sin conversión a otro formato.
- Licencia Apache 2.0: permite uso comercial, pero el autor de esta cuantización declara no estar afiliado a Thinking Machines ni a OpenUncensored. La atribución de la abliteración y del modelo original corresponde a esos autores.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible. Al tratarse de un modelo abliterado, es previsible que los sesgos del modelo original se manifiesten sin atenuación por capas de rechazo.
- Fecha de creación futura: el repositorio figura creado el 21 de noviembre de 2026, lo que puede indicar metadatos inconsistentes o un artefacto de prueba; conviene verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ8-mtp
- Variante oQ4-mtp: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ4-mtp
- Variante oQ6-mtp: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ6-mtp
- Checkpoint fuente (OpenUncensored): https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Versión GGUF de la misma abliteración: https://huggingface.co/Abiray/Inkling-2-Mini-Uncensored-GGUF
- Versión original no abliterada en oMLX: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
