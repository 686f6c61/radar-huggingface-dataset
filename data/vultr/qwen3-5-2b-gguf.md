# vultr/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.5-2B, un modelo de lenguaje multimodal causal compacto desarrollado originalmente por el equipo Qwen (Alibaba) y cuantizado por Vultr para su uso con llama.cpp. El modelo base integra un codificador de visión junto con un transformer denso de aproximadamente 1.880 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños capaces de ejecutarse en hardware de consumo.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en modelos de 2B: modalidad imagen-texto, una ventana de contexto de 262.144 tokens y una arquitectura que incorpora Gated DeltaNet para razonamiento eficiente sobre contextos largos. Esto lo convierte en una opción atractiva para tareas de comprensión de documentos, análisis de imágenes y conversaciones multi-turno en entornos con recursos limitados.

La cuantización de Vultr emplea una estrategia híbrida: en lugar de aplicar una precisión uniforme a toda la red, asigna bits por capa según una puntuación de importancia medida, concentrando precisión donde más afecta a la salida. El repositorio ocupa 6,5 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35, transformer denso con Gated DeltaNet y codificador de visión |
| Parámetros totales | 1.881.825.088 (~1,88B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | GGUF híbrido (precisión por capa según importancia medida); niveles concretos no disponibles |
| Idiomas soportados | no disponible (la model card menciona "strong multilingual performance" sin enumerar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

Datos arquitectónicos adicionales: 24 capas, hidden size 2.048, 8 cabezas de atención, 2 cabezas key-value (GQA), intermediate size 6.144, vocabulario de 248.320 tokens. El codificador de visión tiene 24 capas y hidden size 1.024.

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 24 capas que incorpora Gated DeltaNet, un mecanismo de atención lineal orientado a mejorar la eficiencia en el razonamiento sobre contextos largos, combinado con atención estándar. La configuración usa 8 cabezas de consulta y 2 cabezas key-value, lo que reduce el coste de memoria del KV cache mediante grouped-query attention. El componente multimodal es un codificador de visión de 24 capas y 1.024 dimensiones ocultas que proyecta representaciones visuales al espacio del modelo de lenguaje.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado no detalla el proceso de entrenamiento del modelo base; esa información correspondería a la model card original de Qwen/Qwen3.5-2B, no incluida en la información disponible. La innovación destacable documentada es la cuantización híbrida por capas de Vultr, que selecciona la precisión de cada capa a partir de una puntuación de importancia medida empíricamente.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (pipeline image-text-to-text): el modelo acepta entradas de imagen y texto combinadas.
- Razonamiento sobre contextos largos gracias a la ventana de 262K tokens y a Gated DeltaNet.
- Rendimiento multilingüe según la model card (idiomas concretos no especificados).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue en infraestructura de inferencia.
- Ejecución local mediante llama.cpp en formato GGUF.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: gracias a los 262K tokens de contexto, el modelo puede procesar contratos, informes o manuales completos junto con sus figuras en una sola pasada, sin necesidad de fragmentación.
- Extracción de información de capturas y formularios: el codificador de visión permite recibir una imagen de un formulario o recibo y generar texto estructurado con los campos relevantes.
- Asistencia conversacional en local: al caber en GPU de consumo en formato GGUF, puede desplegarse como chatbot privado en estaciones de trabajo sin enviar datos a la nube.
- Descripción y etiquetado de imágenes a escala: útil para generar metadatos o alt-text en pipelines de catálogos y gestores de contenido.
- Prototipado rápido de aplicaciones multimodales: su tamaño reducido permite iterar en portátiles con GPU modesta usando llama.cpp antes de escalar a modelos mayores.
- Procesamiento de conversaciones largas con historial visual: en soporte técnico donde el usuario adjunta capturas de pantalla a lo largo de una sesión extensa, el contexto de 262K evita perder turnos previos.
- Filtrado y moderación de contenido multimodal en el borde: al ejecutarse en hardware local, puede clasificar imágenes y texto en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que no se detallan los niveles de cuantización del repositorio. Como referencia orientativa para un modelo de ~1,88B parámetros: en FP16 rondaría los 3,8 GB de pesos; en cuantizaciones de 4 bits se situaría aproximadamente en 1-1,5 GB, más el overhead del KV cache y del codificador de visión.
- El contexto de 262K tokens incrementa notablemente el consumo de KV cache; con 2 cabezas KV y hidden size 2.048 el coste por token es bajo, pero a máxima longitud el cache puede superar varios GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en cuantizaciones bajas; para contexto completo de 262K se recomienda VRAM adicional (RTX 4090, A100, H100).
- Despliegue: llama.cpp es el runtime objetivo (formato GGUF). No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible, aunque el tag `endpoints_compatible` sugiere integración con plataformas de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B (este, GGUF de Vultr) | ~1,88B | 262K | Imagen-texto | Apache 2.0 | GGUF |
| Qwen3.5-2B (original) | ~1,88B | 262K | Imagen-texto | Apache 2.0 | safetensors |
| Alternativas de ~2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Al ser un modelo de ~1,88B parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas y código en producción es inferior a la de modelos de mayor tamaño; conviene validar sus salidas en tareas críticas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en preguntas factuales y en la interpretación de imágenes ambiguas.
- No se especifican los idiomas soportados ni su cobertura real; el rendimiento multilingüe debe evaluarse empíricamente antes de usarlo en producción en idiomas distintos del inglés o chino.
- La cuantización híbrida por capas puede introducir degradaciones difíciles de predecir; se recomienda comparar contra el modelo base en safetensors para tareas sensibles.
- El contexto de 262K es teórico; el rendimiento efectivo en longitudes extremas puede degradarse y el coste de memoria del KV cache crece con la longitud.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin verificación.
- El repositorio tiene muy pocas descargas (170) y ningún "like", lo que sugiere poca validación comunitaria de esta cuantización concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vultr/Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Vultr (sitio corporativo): https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Wikipedia de Vultr: https://en.wikipedia.org/wiki/Vultr
