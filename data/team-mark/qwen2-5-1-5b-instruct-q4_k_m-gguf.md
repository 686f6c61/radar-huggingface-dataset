# Team-mark/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF

## Resumen

Team-mark/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Esta versión concreta ha sido generada por el usuario Team-mark mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la conversión de pesos safetensors a GGUF usando llama.cpp. El resultado es un fichero de aproximadamente 1 GB que permite ejecutar el modelo en CPU o en GPUs de gama baja con llama.cpp.

El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), entrenado para instrucciones y conversación. Qwen2.5 es la generación más reciente de la familia Qwen en el momento de su publicación y sustituye a Qwen2 con mejoras en razonamiento, generación de código, matemáticas y seguimiento de instrucciones estructuradas, además de soporte nativo de tool calling y salidas JSON.

La relevancia de esta ficha radica en que se trata de un artefacto derivado, no de un modelo original: la model card es prácticamente la plantilla automática de GGUF-my-repo y no aporta información propia sobre entrenamiento o evaluación. Por tanto, los datos técnicos que se detallan a continuación proceden del modelo base Qwen2.5-1.5B-Instruct y de las convenciones de cuantización Q4_K_M de llama.cpp, no de documentación específica del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con atención causal y RoPE |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (no confirmado en esta cuantización) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant mixto); el repo solo publica esta variante |
| Idiomas soportados | Inglés (etiqueta del repo); el modelo base declara multilingüe (más de 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwen2.5-1.5b-instruct-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings de tokens atados y atención con RoPE. Incorpora las mejoras introducidas en la familia Qwen2.5 respecto a Qwen2: mayor volumen de datos de preentrenamiento (hasta 18 billones de tokens en los modelos grandes de la familia, aunque la cifra exacta para la variante de 1,5B no está disponible en la información proporcionada), filtrado de datos más refinado y una fase de post-entrenamiento con supervisión y optimización por preferencias (DPO) orientada a seguir instrucciones, generar JSON estructurado y realizar tool calling.

La información disponible no detalla la composición del dataset, el número exacto de tokens de entrenamiento de esta variante ni los detalles del proceso de alineación. La cuantización Q4_K_M aplicada por Team-mark es una técnica de cuantización por bloques de llama.cpp que mantiene los tensores más sensibles (por ejemplo, embeddings y algunas capas de atención) en mayor precisión mientras comprime el resto a 4 bits, buscando un equilibrio entre tamaño y calidad. No se documentan innovaciones adicionales específicas de esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (y, según el modelo base, en otros idiomas).
- Razonamiento de propósito general y respuesta a instrucciones.
- Generación de código en varios lenguajes de programación.
- Resolución de problemas matemáticos de nivel básico y medio.
- Soporte de tool calling / function calling estructurado (heredado del modelo base).
- Generación de salidas en formato JSON y estructuras de datos.
- Capacidad de seguir system prompts y roles definidos.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode); esas capacidades llegan en otras variantes de la familia Qwen2.5.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: el fichero GGUF de ~1 GB se ejecuta con llama.cpp en CPU con un consumo de RAM moderado, lo que permite desplegar un chatbot privado sin conexión a servicios en la nube.
- Clasificación y extracción de información estructurada: el modelo puede devolver JSON con campos definidos, útil para procesar tickets, correos o formularios en pipelines de automatización documental.
- Generación de código asistida en entornos con recursos limitados: integrable en editores o scripts CLI mediante llama-server, con latencia aceptable para autocompletado y explicación de fragmentos pequeños.
- Prototipado rápido de agentes con tool calling: al soportar function calling, se puede conectar a APIs externas (clima, calendario, bases de datos) en pruebas de concepto antes de migrar a modelos mayores.
- Filtrado y resumen de textos en aplicaciones de bajo coste: resúmenes de correos, artículos o hilos de soporte donde no se requiere máxima calidad sino throughput y coste mínimo.
- Educación y demostraciones: al caber en un portátil, sirve para enseñar conceptos de inferencia LLM, cuantización y despliegue con llama.cpp en cursos o talleres.
- Traducción y reescritura ligera entre inglés y otros idiomas, con la advertencia de que la etiqueta del repo solo declara inglés y la calidad multilingüe de la variante de 1,5B es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla automática de GGUF-my-repo y no incluye evaluaciones. Tampoco se dispone de mediciones de latencia o throughput específicas para esta cuantización Q4_K_M.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,1-1,3 GB para el fichero GGUF Q4_K_M, más overhead de contexto (KV cache). Con 2.048 tokens de contexto el consumo total ronda 1,5 GB; con 8.192 tokens puede acercarse a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre, como GTX 1650, RTX 3050, RTX 4060 o superiores. También funciona en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en Raspberry Pi 4/5 y dispositivos Apple Silicon con suficiente RAM unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama-server. No es adecuado para vLLM o TGI en su formato GGUF sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend (CPU vs. GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Team-mark/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF | 1,5B | 32.768 (base) | Apache 2.0 | GGUF Q4_K_M, 1 GB |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 | Apache 2.0 | Safetensors, ~3 GB |
| Llama 3.2 1B Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Safetensors y GGUF |
| Gemma 2 2B Instruct | 2,6B | 8.192 | Gemma Terms of Use | Safetensors y GGUF |
| SmolLM2 1.7B Instruct | 1,7B | 8.192 | Apache 2.0 | Safetensors y GGUF |

La comparación se basa en datos públicos del modelo base y de alternativas de la misma categoría; no se dispone de evaluaciones comparativas específicas de esta cuantización.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones; cualquier uso en producción requiere validación propia.
- Riesgo de alucinación inherente a modelos de 1,5B: la precisión factual es limitada y puede inventar datos en dominios especializados.
- La etiqueta de idioma del repo es únicamente inglés; el rendimiento en castellano u otros idiomas puede degradarse respecto al modelo base.
- La cuantización Q4_K_M introduce una pérdida de calidad medible frente a los pesos originales en fp16/bf16, especialmente en tareas de razonamiento complejo y código.
- El contexto de 32.768 tokens del modelo base no está verificado en esta conversión; además, con contextos largos el consumo de memoria crece y la calidad decae en modelos pequeños.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y citar adecuadamente a Qwen y a llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni mantenimiento; conviene preferir cuantizaciones oficiales de Qwen si están disponibles.
- No se garantiza que la conversión se haya realizado con una versión concreta de llama.cpp; pueden aparecer incompatibilidades con versiones antiguas del runtime.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Team-mark/Qwen2.5-1.5B-Instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Blog de Qwen2.5 (referencia general): https://qwenlm.github.io/blog/qwen2.5/
