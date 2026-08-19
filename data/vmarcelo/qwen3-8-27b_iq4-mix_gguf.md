# vmarcelo/Qwen3.8-27B_IQ4-MIX_GGUF

## Resumen

Qwen3.8-27B es un modelo denso multimodal de 27 320 millones de parámetros desarrollado por el equipo Qwen, publicado originalmente en formato FP8 y posteriormente cuantizado a GGUF por el usuario vmarcelo bajo el nombre Qwen3.8-27B_IQ4-MIX_GGUF. Se trata de una cuantización mixta por tensores (IQ4_MIX) que combina distintos tipos de cuantización según la sensibilidad de cada capa, con el objetivo de ajustarse al presupuesto de 16 GB de VRAM de las GPU de consumo manteniendo las capacidades completas del modelo original: visión, tool calling, atención híbrida y predicción multi-token (MTP).

La arquitectura es híbrida: 64 capas transformer, de las cuales 48 usan atención lineal estilo GatedDeltaNet y 16 usan atención completa estándar (cada cuarta capa). El modelo incluye un encoder de visión (ViT + proyector) y una cabeza de predicción multi-token. Su longitud de contexto nativa es de 262 144 tokens. La cuantización presentada en este repositorio conserva todas las funcionalidades del modelo base, incluido el soporte multimodal y la generación especulativa con MTP.

La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo de 27B multimodal con contexto largo en hardware de consumo (GPU con 16 GB), algo que no era viable con el modelo FP8 original. Además, documenta un enfoque de cuantización por tensores con imatrix que puede servir de referencia para otros proyectos de optimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas de atención lineal (GatedDeltaNet) + 16 capas de atención completa + 1 capa MTP (65 totales) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo); en la práctica limitado por VRAM (ver requisitos de hardware) |
| Tipos de cuantizacion | IQ4_MIX (mezcla por tensores: IQ4_XS, IQ3_S, Q4_K, Q5_K, IQ2_S, F32); también disponible el modelo base en FP8 |
| Idiomas soportados | Multilingüe (se testearon PT, EN, FR, DE, JA; el modelo base es multilingüe) |
| Licencia | qwen-research (licencia de investigación, no comercial) |
| Formato de pesos | GGUF (archivo principal de 14,10 GB + mmproj-F16 de 885 MB para visión) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-FP8 es un transformer denso multimodal con una arquitectura híbrida de atención: 48 de sus 64 capas utilizan atención lineal basada en GatedDeltaNet (una variante de SSM), mientras que las 16 restantes (cada cuarta capa) emplean atención completa estándar. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad en tareas que requieren atención precisa. El modelo incluye además un encoder de visión (ViT con proyector) que permite entrada de imágenes, y una cabeza de predicción multi-token (MTP) que predice varios tokens a la vez para acelerar la inferencia especulativa.

Los detalles del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se especifican en la información proporcionada. La cuantización IQ4_MIX se realizó con llama.cpp (commit `1692f9e`) utilizando una matriz de importancia (imatrix) calculada sobre 10 fragmentos de 2048 tokens de wikitext-103. La asignación de tipos de cuantización por tensor se hizo de forma manual: los tensores más sensibles (lm_head, atención V) se mantienen en mayor precisión (Q5_K y Q4_K respectivamente), mientras que los embeddings y las proyecciones de atención lineal toleran bits más bajos (IQ2_S e IQ3_S). El resultado es un peso efectivo de 4,13 bits por parámetro.

## Capacidades

- Generación de texto y razonamiento en múltiples idiomas (probado en portugués, inglés, francés, alemán y japonés).
- Comprensión multimodal de imágenes: descripción de imágenes, respuesta a preguntas visuales.
- Soporte de tool calling / function calling con formato correcto, según pruebas del autor.
- Soporte de agentes y razonamiento multi-paso (el modelo puede depurar código y encontrar errores).
- Capacidad de predicción multi-token (MTP) para generación especulativa, activable con `--spec-type draft-mtp`.
- Atención híbrida que permite manejar contextos largos (hasta 262K tokens nativos, aunque limitado por VRAM en la práctica).
- Generación de código y depuración (probado en escenarios de debugging).

## Casos de uso

- Asistente de atención al cliente multilingüe: el modelo puede mantener conversaciones multi-turno en varios idiomas con contexto largo (hasta 256K tokens en configuraciones con KV cache reducida), lo que permite recordar el historial completo de una interacción prolongada.
- Descripción y análisis de imágenes en tiempo real: gracias al encoder de visión, puede integrarse en aplicaciones que necesiten interpretar capturas, diagramas o fotografías, por ejemplo en sistemas de soporte técnico visual.
- Generación y depuración de código en entornos de desarrollo: con tool calling y capacidad de razonamiento, puede actuar como asistente de programación que sugiere correcciones y explica errores, funcionando a ~33 tok/s en GPU de 16 GB.
- Procesamiento de documentos largos: su contexto de 262K tokens permite resumir o extraer información de libros, informes o contratos extensos sin necesidad de truncar el texto.
- Agente autónomo con llamada a funciones: puede encadenar llamadas a APIs y herramientas externas para completar tareas complejas (por ejemplo, reservas, búsquedas o automatización de flujos), manteniendo el estado de la conversación.
- Prototipado de aplicaciones de investigación: al ser un modelo de código abierto con licencia de investigación, es adecuado para experimentos académicos en NLP multimodal, pruebas de arquitecturas híbridas o estudios de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de rendimiento en hardware concreto (AMD Radeon RX 9070 XT, 16 GB VRAM, backend Vulkan):

| Prueba | Velocidad de generación (TG) | Velocidad de prefill (PP) | Resultado |
|---|---|---|---|
| Generación de texto (PT/EN) | 33 tok/s | 140 tok/s | Correcto |
| Depuración de código | 33 tok/s | 134 tok/s | Encuentra y corrige errores |
| Descripción de imágenes | 33 tok/s | 611 tok/s | Preciso |
| Tool calling (función) | — | 294 tok/s | Formato correcto |
| Multilingüe (FR/DE/JA) | 33 tok/s | 131 tok/s | Todo correcto |

Con el backend HIP/ROCm (en la misma GPU) la velocidad de generación baja a 13 tok/s, mientras que con Vulkan alcanza 33 tok/s. La activación de MTP reduce la velocidad en esta GPU (16 tok/s) debido al overhead del contexto de borrador, aunque en hardware más lento podría ser beneficioso.

## Requisitos de hardware

- VRAM estimada: 14,6 GB con contexto 4K y KV cache Q8_0; 15,7 GB con contexto 16K; 15,4 GB con contexto 64K (KV cache Q8_0); 15,7 GB con contexto 256K (KV cache Q4_0). El modelo está diseñado para caber en tarjetas de 16 GB.
- GPU recomendadas: AMD Radeon RX 9070 XT (probada), y por extensión cualquier GPU con 16 GB VRAM y soporte Vulkan (p. ej. RTX 4080, RTX 4090, RX 7800 XT). En GPUs con menos VRAM no sería posible cargar el modelo completo.
- El contexto máximo de 262K tokens no es alcanzable en 16 GB: la caché KV sola necesitaría más de 18 GB incluso con Q4_0.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, y cualquier runtime compatible con GGUF (Ollama, vLLM con soporte GGUF, etc.). El autor recomienda usar `--mmproj` para activar visión y `--flash-attn on` para optimizar memoria.
- Latencia y throughput: ~33 tok/s de generación y ~140-600 tok/s de prefill en la GPU probada con Vulkan. Con HIP/ROCm baja a ~13 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (27B multimodal). Como referencia, el modelo base es Qwen/Qwen3.8-27B-FP8, que es el mismo modelo sin cuantizar. Otros modelos de tamaño similar (p. ej. Llama 3.1 8B, Qwen2.5 32B) no son directamente comparables por diferencias de arquitectura y licencia. Se puede indicar que esta cuantización ofrece una alternativa a modelos propietarios de pago con capacidades multimodales y contexto largo, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso a fines de investigación y no permite uso comercial. Esto limita su adopción en producción empresarial.
- La cuantización IQ4_MIX introduce pérdida de precisión respecto al modelo FP8 original, especialmente en tensores de embeddings (IQ2_S) y atención lineal (IQ3_S). Aunque el autor reporta resultados correctos en pruebas funcionales, no hay evaluación cuantitativa de degradación en tareas estándar.
- El contexto de 262K tokens es teórico; en la práctica con 16 GB de VRAM solo se pueden alcanzar 256K tokens con KV cache Q4_0 y a una velocidad de generación de ~4 tok/s, lo que puede ser inaceptable para aplicaciones interactivas.
- La activación de MTP puede degradar el rendimiento en GPUs rápidas; es preferible desactivarla salvo que se ejecute en hardware lento.
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLM, no se ha documentado ninguna mitigación específica en esta versión.
- No se han publicado resultados de benchmarks estándar, por lo que la calidad relativa frente a otros modelos no está verificada de forma independiente.
- El tamaño del vocabulario (248 320 tokens) implica una huella de memoria considerable en la capa de salida, aunque la cuantización Q5_K del lm_head ayuda a mitigarlo.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/vmarcelo/Qwen3.8-27B_IQ4-MIX_GGUF
- Modelo base (Qwen/Qwen3.8-27B-FP8): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8/blob/main/LICENSE
- Herramienta de cuantización: https://github.com/ggml-org/llama.cpp
