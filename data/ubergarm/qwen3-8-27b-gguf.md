# ubergarm/Qwen3.8-27B-GGUF

## Resumen

El modelo `ubergarm/Qwen3.8-27B-GGUF` es una colección de cuantizaciones GGUF del modelo base `Qwen/Qwen3.8-27B`, un modelo de lenguaje de 27 000 millones de parámetros (28 592 096 256 en precisión completa) desarrollado por Alibaba Cloud. El autor de la cuantización, ubergarm, ha aplicado una receta de cuantización híbrida basada en `ik_llama.cpp` con calibración imatrix, optimizada para ofrecer la mejor perplejidad posible para un presupuesto de memoria dado. El modelo base emplea una arquitectura híbrida que combina atención con mecanismos de estado (SSM) y predicción multi-token (MTP), lo que lo hace especialmente eficiente en inferencia y adecuado para tareas conversacionales y de razonamiento.

La relevancia de esta ficha radica en que estas cuantizaciones permiten ejecutar un modelo de 27B en hardware de consumo con una calidad de salida cercana a la del modelo original, gracias a técnicas como la cuantización selectiva por capas y el uso de tensores MTP adicionales. El repositorio incluye varios archivos GGUF, algunos compatibles con llama.cpp estándar y otros que requieren la bifurcación `ik_llama.cpp` para aprovechar al máximo sus nuevas técnicas de cuantización. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención con gating + SSM (Delta Net) + MTP (Multi-Token Prediction) |
| Parametros totales | 28 592 096 256 (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (128K) según el comando de ejemplo |
| Tipos de cuantizacion | IQ4_KS, Q8_0, Q6_0, Q4_KS (según la receta; el repo contiene varios archivos GGUF) |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta múltiples idiomas, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` presenta una arquitectura híbrida innovadora que combina capas de atención con gating (Gated Attention) y un mecanismo de estado tipo SSM (State Space Model), similar a los diseños Delta Net. Esta mezcla permite un equilibrio entre capacidad de razonamiento y eficiencia computacional. Además, incorpora un módulo de predicción multi-token (MTP) que anticipa varios tokens futuros simultáneamente, lo que acelera la inferencia especulativa. La cuantización de ubergarm aplica una receta personalizada que asigna diferentes precisiones a distintos tensores: los pesos de atención y las proyecciones FFN se cuantizan a IQ4_KS, mientras que los parámetros SSM (alpha, beta, out) se mantienen en Q8_0 o Q6_0 para preservar la estabilidad numérica. El tensor de embeddings se cuantiza a Q6_0 y la salida a Q8_0. El proceso utiliza una matriz de calibración (imatrix) generada con un corpus específico, y el resultado es un archivo GGUF que incluye un tensor extra para el cabezal MTP en IQ4_KS, eliminando la necesidad de especificar `-mtprot` en la inferencia.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. La cuantización se realizó con `ik_llama.cpp`, una bifurcación de llama.cpp que introduce nuevas técnicas de cuantización y optimizaciones para hardware moderno.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-turno, gracias a su arquitectura híbrida y contexto largo de 128K tokens.
- Soporte de predicción multi-token (MTP) para decodificación especulativa, lo que reduce la latencia en generación.
- Capacidad de procesamiento multimodal: el comando de ejemplo incluye un `mmproj` (proyector multimodal) para entrada de imágenes, aunque el modelo base es principalmente de texto.
- Compatibilidad con tool calling y function calling, heredada del modelo base Qwen3 (no confirmado explícitamente en la ficha, pero es una característica estándar de la serie Qwen3).
- Soporte de agentes y razonamiento multi-paso, típico de los modelos Qwen3 con modo de pensamiento.
- Multilingüismo: el modelo base Qwen3 soporta más de 30 idiomas, aunque la ficha no especifica cuáles.
- Cuantizaciones optimizadas para diferentes presupuestos de memoria, con opciones que requieren `ik_llama.cpp` o que funcionan con llama.cpp estándar.

## Casos de uso

- Asistente conversacional local: con 16.9 GB de repo y cuantizaciones IQ4_KS de ~15.7 GiB, el modelo puede ejecutarse en una GPU de consumo como RTX 3090/4090 (24 GB VRAM) o incluso en configuraciones con CPU+GPU, ofreciendo respuestas fluidas con contexto largo de 128K.
- Generación de código en entornos de desarrollo: el modelo base Qwen3 destaca en tareas de programación; la cuantización IQ4_KS mantiene una calidad suficiente para autocompletado y generación de funciones, integrándose con herramientas como llama.cpp server o LM Studio.
- Razonamiento matemático y lógico: gracias a su arquitectura híbrida y al modo de pensamiento, puede resolver problemas complejos de matemáticas y lógica, útil en entornos educativos o de investigación.
- Procesamiento de documentos largos: con 128K de contexto, puede resumir, analizar o extraer información de documentos extensos (informes, artículos, libros) sin truncamiento.
- Desarrollo de agentes autónomos: el soporte de tool calling y el contexto amplio permiten construir agentes que interactúan con APIs, bases de datos o ejecutan comandos, desplegados localmente con vLLM o llama.cpp.
- Prototipado de aplicaciones de IA generativa: al ser Apache 2.0, se puede usar comercialmente sin royalties, ideal para startups que necesitan un modelo potente y económico en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor menciona que sus cuantizaciones ofrecen "best in class perplexity for the given memory footprint", pero no proporciona números concretos. Se recomienda consultar el repositorio del modelo base `Qwen/Qwen3.8-27B` para benchmarks oficiales, o ejecutar pruebas propias con el archivo GGUF.

## Requisitos de hardware

- VRAM estimada: el archivo principal `Qwen3.8-27B-MTP-IQ4_KS.gguf` ocupa 15.749 GiB (4.731 BPW). Con contexto 128K y cache KV en Q8_0, se necesitan aproximadamente 20-24 GB de VRAM para una GPU dedicada. En configuraciones con offload parcial a CPU, puede funcionar con 12-16 GB de VRAM.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40GB, o GPUs con 16 GB+ si se usa offload. Para múltiples GPUs, el comando sugiere `-sm graph`.
- Compatibilidad con consumer GPU: sí, una RTX 3090/4090 puede ejecutar el modelo completo en VRAM con contexto moderado. Con contexto máximo (128K), puede requerir más memoria y usar CPU.
- Opciones de despliegue: `ik_llama.cpp` (recomendado para aprovechar las nuevas cuantizaciones), llama.cpp estándar (solo para algunos quants), LM Studio, KoboldCPP (con croco.cpp), y potencialmente vLLM si se convierte a formato compatible.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP (n_max=4) puede acelerar la generación entre 1.5x y 2x, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 128K | Apache 2.0 | safetensors | Modelo original, requiere ~60 GB en FP16 |
| ubergarm/Qwen3.8-27B-GGUF | 27B | 128K | Apache 2.0 | GGUF | Cuantizaciones optimizadas con imatrix y MTP |
| Qwen3-32B (GGUF de bartowski) | 32B | 128K | Apache 2.0 | GGUF | Alternativa de mayor tamaño, cuantizaciones estándar |
| Llama 3.1 8B (GGUF) | 8B | 128K | Llama 3.1 | GGUF | Menor capacidad, más ligero, pero menos potente |

La comparativa se basa en características generales; no hay benchmarks directos entre estas versiones cuantizadas. El modelo de ubergarm destaca por su receta de cuantización híbrida que preserva mejor la perplejidad que las cuantizaciones uniformes, pero requiere `ik_llama.cpp` para aprovechar todas sus ventajas.

## Limitaciones y advertencias

- La mayoría de los archivos GGUF de este repositorio requieren `ik_llama.cpp` o `croco.cpp`; no son compatibles con llama.cpp estándar ni con LM Studio en su versión oficial. Solo algunos quants funcionan con el mainline.
- No se dispone de información sobre sesgos o alucinaciones específicas del modelo cuantizado. Como cualquier LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de alta precisión.
- La cuantización IQ4_KS introduce pérdida de calidad respecto al modelo en FP16, aunque el autor afirma que es mínima. Para aplicaciones críticas, se recomienda validar con el modelo original.
- El contexto de 128K tokens requiere una cantidad significativa de memoria para la cache KV; en GPUs de 24 GB puede ser necesario reducir el contexto o usar cuantización de cache.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales sobre el uso de marcas o atribución (consultar la licencia del modelo base).
- El autor no proporciona garantías sobre el rendimiento en producción; se recomienda realizar pruebas exhaustivas antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ubergarm/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- croco.cpp (fork de KoboldCPP): https://github.com/Nexesenex/croco.cpp
- Builds de ik_llama.cpp para Windows: https://github.com/Thireus/ik_llama.cpp/releases
- Blog de ubergarm sobre cuantización: https://blog.aifoundry.org/p/adventures-in-model-quantization
- Corpus de calibración imatrix: https://gist.github.com/ubergarm/edfeb3ff9c6ec8b49e88cdf627b0711a
- Guía de inicio (desactualizada): https://github.com/ikawrakow/ik_llama.cpp/discussions/258
- Guía de cuantización (desactualizada): https://github.com/ikawrakow/ik_llama.cpp/discussions/434
