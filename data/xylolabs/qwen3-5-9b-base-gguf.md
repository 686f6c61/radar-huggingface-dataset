# Xylolabs/Qwen3.5-9B-Base-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-Base-GGUF es una cuantización en formato GGUF del modelo base Qwen3.5-9B-Base, publicada por Xylolabs para su uso con llama.cpp. Se trata de un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado a generación de texto, distribuido bajo licencia Apache 2.0. El repositorio contiene una única cuantización Q4_K_M de 5,780 GB, pensada para ejecución local en hardware de consumo y estaciones de trabajo.

El modelo es un modelo base, es decir, no ha pasado por un ajuste fino instructivo ni por alineación conversacional: está diseñado para continuar texto a partir de un prefijo, no para seguir instrucciones. Esto lo hace adecuado para tareas de completado, investigación sobre modelos base y como punto de partida para ajuste fino posterior, pero no para uso directo en asistentes conversacionales sin un post-entrenamiento adicional.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~9B con una ventana de contexto de hasta 256K tokens en GPUs de consumo como la RTX 4090, algo impensable hace unos años. La model card incluye además tablas de precisión frente a BF16 y recomendaciones de hardware, lo que facilita la evaluación rápida por parte de desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5); detalles de atención y capas no disponibles |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantizacion | Q4_K_M (única incluida en el repo); la model card referencia también Q8_0, Q6_K, Q5_K_M y Q3_K_M de llama.cpp como comparación |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B-Base más allá de que se trata de un transformer de ~9,2B parámetros. No se especifican el número de capas, la dimensión oculta, el tipo de atención (completa, lineal o híbrida), ni si emplea mezcla de expertos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste instructivo; al ser un modelo base, es esperable que no las haya.

La contribución de Xylolabs se limita a la conversión a GGUF y a la cuantización Q4_K_M, verificada con el commit `cd959bae` de llama.cpp. La model card incluye una tabla de precisión frente a BF16 medida con llama.cpp, que permite evaluar la degradación introducida por la cuantización: la Q4_K_M alcanza un top-1 del 92,309% en WikiText-2 y del 92,255% en un conjunto held-out, con divergencia KL de 0,024531 y 0,027924 respectivamente. Para comparar, la Q8_0 de llama.cpp alcanza un top-1 del 98,578% con KL de 0,000625.

## Capacidades

- Generación de texto por continuación de prefijo (modelo base, no instructivo): el modelo completa texto a partir de un prompt, sin seguir instrucciones de forma nativa.
- Razonamiento y conocimiento general derivado del preentrenamiento, sin datos específicos de benchmarks disponibles en la información proporcionada.
- Capacidades multilingües limitadas a inglés (en) y coreano (ko), según los metadatos del repositorio.
- Soporte de contexto largo de hasta 256K tokens, según la tabla de hardware de la model card.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; al ser un modelo base, no se espera que los tenga de forma fiable.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación sobre modelos base: permite estudiar el comportamiento de un transformer de ~9B sin ajuste instructivo, analizando distribuciones de probabilidad, continuación de texto y sesgos de preentrenamiento en un entorno reproducible con llama.cpp.
- Punto de partida para ajuste fino: al ser un modelo base con licencia Apache 2.0, puede servir como inicialización para SFT o DPO en dominios específicos (legal, médico, código) sin restricciones de uso comercial.
- Generación de texto a gran escala en local: con la cuantización Q4_K_M de 5,8 GB, se puede desplegar en una RTX 4090 o RTX 3090 para tareas de completado de texto por lotes, como aumento de datos o generación de borradores.
- Experimentación con contexto largo: la ventana de 256K tokens permite probar tareas de recuperación en contexto, resumen de documentos extensos o análisis de corpus largos en una sola GPU de 24 GB.
- Evaluación de cuantizaciones: la tabla de precisión incluida facilita comparar la Q4_K_M de Xylolabs con las cuantizaciones nativas de llama.cpp (Q8_0, Q6_K, Q5_K_M, Q3_K_M) para decidir el equilibrio entre tamaño y fidelidad.
- Desarrollo de pipelines de generación con llama.cpp: integrable mediante `llama-completion` o la API de llama.cpp en flujos de CI/CD para pruebas de regresión de modelos o generación de documentación técnica.
- Prototipado en hardware de consumo: la tabla de hardware de la model card cubre desde una RTX 4090 (24 GB) hasta una B300 (288 GB), lo que permite planificar despliegues en estaciones de trabajo y Mac Studio con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de cuantización frente a BF16 medidas con llama.cpp:

| Cuantización | Tamaño | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 9,786 GB | 0,000625 | 98,578% | 0,000815 | 98,500% |
| llama.cpp Q6_K | 7,559 GB | 0,002685 | 97,147% | 0,003170 | 97,147% |
| llama.cpp Q5_K_M | 6,643 GB | 0,006598 | 95,755% | 0,008458 | 95,824% |
| Q4_K_M (este repo) | 5,780 GB | 0,024531 | 92,309% | 0,027924 | 92,255% |
| llama.cpp Q4_K_M | 5,780 GB | 0,024531 | 92,309% | 0,027924 | 92,255% |
| llama.cpp Q3_K_M | 4,738 GB | 0,078980 | 86,701% | 0,094162 | 86,127% |

## Requisitos de hardware

- VRAM estimada para inferencia: 5,8 GB para los pesos en Q4_K_M, más la caché KV en f16 para el contexto elegido y unos 2 GB para el runtime de llama.cpp. La model card indica que un archivo cabe cuando su tamaño más la caché KV más 2 GB queda por debajo del 90% de la memoria disponible.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para 256K de contexto; RTX 5090 (32 GB); RTX 6000 Ada o 2×24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090 con la cuantización Q4_K_M y contexto de hasta 256K, según la tabla del autor.
- Opciones de despliegue: llama.cpp (commit `cd959bae` o posterior), mediante `llama-completion` con `-no-cnv` para continuación de texto. No se documentan otras opciones como vLLM, Ollama o TGI para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Base-GGUF (este) | ~9,2B | hasta 256K | Apache 2.0 | GGUF Q4_K_M | Hugging Face |
| Qwen/Qwen3.5-9B-Base | ~9,2B | no disponible en la información | Apache 2.0 (según modelo base) | safetensors (original) | Hugging Face |
| llama.cpp Q4_K_M de Qwen3.5-9B-Base | ~9,2B | hasta 256K | Apache 2.0 | GGUF Q4_K_M | Repositorio de llama.cpp / conversión propia |

La comparativa se limita al modelo base original y a las cuantizaciones de referencia de llama.cpp incluidas en la model card, ya que no se dispone de información sobre otros modelos de la misma categoría en la documentación proporcionada. No se dispone de datos de rendimiento (MMLU, HumanEval, etc.) para comparar cualitativamente con alternativas.

## Limitaciones y advertencias

- Modelo base, no instructivo: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno; requiere ajuste fino o ingeniería de prompts específica para tareas concretas.
- Idiomas limitados: solo inglés (en) y coreano (ko) según los metadatos; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: al no haber pasado por RLHF ni alineación, el modelo puede generar contenido factualmente incorrecto, sesgado o tóxico sin las salvaguardas habituales de los modelos instructivos.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de un preentrenamiento a gran escala, es esperable que herede sesgos de los datos de entrenamiento del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite el modelo original de Qwen.
- Cuantización Q4_K_M: introduce una degradación medible (top-1 del 92,3% frente a BF16 en WikiText-2); para tareas sensibles a la fidelidad, considerar cuantizaciones mayores o los pesos originales en safetensors.
- Contexto de 256K: la caché KV en f16 a esa longitud consume memoria significativa; la tabla del autor asume que cabe en 24 GB, pero conviene validar el consumo real en el hardware objetivo.
- Sin datos de benchmarks estándar: no se puede evaluar el rendimiento en tareas como MMLU, HumanEval o GSM8K con la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia Apache 2.0 del repositorio: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfico de divergencia KL media: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfico de precisión top-1: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF/resolve/main/accuracy-top1.png
