# vultr/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Qwen3.5-4B, publicada por Vultr. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un modelo de lenguaje causal multimodal de 4.205.751.296 parámetros que integra un codificador de visión de 24 capas junto a un tronco de 32 capas con arquitectura densa basada en Gated DeltaNet, lo que le permite manejar contextos largos de forma eficiente. Esta variante GGUF está pensada para su uso con llama.cpp y entornos compatibles con endpoints.

La relevancia de esta ficha radica en dos factores. Por un lado, Qwen3.5-4B combina comprensión de imagen y texto con una ventana de contexto declarada de 262K tokens, extensible por encima de 1M, lo que lo sitúa en una categoría poco habitual para un modelo de solo 4B parámetros. Por otro, Vultr aplica una estrategia de cuantización híbrida: en lugar de usar una precisión uniforme para toda la red, asigna a cada capa una precisión distinta en función de una puntuación de importancia medida, de modo que los bits se concentran donde más afectan a la salida.

El repositorio, con 12,5 GB de tamaño y licencia Apache 2.0, está orientado a despliegues locales y a entornos de inferencia ligera. La información pública disponible es limitada: no se detallan los idiomas soportados ni se han publicado resultados de benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35, densa, con codificador de vision; combina Gated DeltaNet |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K tokens, extensible por encima de 1M |
| Tipos de cuantizacion | GGUF con cuantizacion hibrida por capa segun puntuacion de importancia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales de arquitectura: 32 capas en el tronco, 24 capas en el codificador de visión, hidden size de 2.560, hidden size del codificador de visión de 1.024, 16 cabezas de atención, 4 cabezas key-value (GQA), vocabulario de 248.320 tokens e intermediate size de 9.216.

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con atención agrupada por consultas (16 cabezas de atención y 4 cabezas key-value), hidden size de 2.560 e intermediate size de 9.216. La innovación arquitectónica principal es la incorporación de Gated DeltaNet, un mecanismo de estado recurrente con compuertas que busca mantener la eficiencia computacional en contextos muy largos sin renunciar a la calidad del razonamiento. El componente multimodal lo aporta un codificador de visión de 24 capas con hidden size de 1.024, que proyecta las representaciones visuales al espacio del modelo de lenguaje.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones de decodificación (por ejemplo, decodificación especulativa) más allá de la propia arquitectura. La cuantización de Vultr sí es un elemento técnico destacable: se trata de una cuantización híbrida que elige la precisión de cada capa a partir de una puntuación de importancia medida, en lugar de aplicar una precisión única a toda la red.

## Capacidades

- Generación de texto y razonamiento de propósito general en un modelo de 4B parámetros.
- Comprensión de imagen y texto (pipeline image-text-to-text): el modelo integra un codificador de visión de 24 capas.
- Razonamiento sobre contextos largos gracias a una ventana declarada de 262K tokens, extensible por encima de 1M.
- Capacidad multilingüe amplia según la model card, aunque no se enumeran los idiomas concretos.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: la ventana de 262K tokens permite procesar informes, contratos o manuales completos junto con sus figuras en una sola pasada, sin fragmentar el contexto.
- Asistente de atención al cliente multimodal: puede gestionar conversaciones multi-turno e interpretar capturas de pantalla o fotos enviadas por el usuario, gracias a su naturaleza image-text-to-text y a la etiqueta `conversational`.
- Extracción de información de facturas y tickets: el codificador de visión permite leer documentos escaneados y el tronco de lenguaje estructurar los datos extraídos en JSON u otro formato, en un modelo lo bastante pequeño para ejecutarse en local.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ser un GGUF de 4B parámetros, puede ejecutarse con llama.cpp en hardware de consumo, lo que lo hace adecuado para prototipos y herramientas internas con requisitos de privacidad.
- Procesamiento de repositorios de código con capturas de errores: combinando contexto largo y visión, puede analizar logs extensos junto a imágenes de trazas o interfaces para diagnosticar fallos.
- Búsqueda y respuesta sobre bases documentales con imágenes: integrado en un pipeline RAG, el contexto largo reduce la necesidad de trocear documentos y el componente visual amplía las fuentes consultables a material gráfico.
- Inferencia en el borde o en entornos con recursos limitados: la cuantización híbrida por capas busca preservar la calidad del modelo base con un peso menor, lo que resulta útil cuando el espacio en disco o la memoria son restricciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B parámetros en cuantizaciones de 4 bits suele ocupar en torno a 2,5-3 GB de pesos, a lo que hay que sumar la caché KV y, en este caso, el codificador de visión; el repositorio completo ocupa 12,5 GB, lo que sugiere que incluye varias cuantizaciones.
- GPU recomendadas: no disponibles en la información proporcionada.
- GPU de consumo: por tamaño, es plausible que quepa en tarjetas con 8 GB o más de VRAM en cuantizaciones bajas, pero no hay confirmación oficial en la documentación accesible.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio) y entornos compatibles con endpoints, según la etiqueta `endpoints_compatible`. Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa. A continuación se recogen únicamente los datos ciertos del modelo de esta ficha:

| Modelo | Parametros | Contexto | Vision | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (GGUF de Vultr) | 4,2B | 262K, extensible >1M | Si | Apache 2.0 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información pública del repositorio es escasa: no se detallan idiomas, datos de entrenamiento ni resultados de evaluación, lo que dificulta validar su calidad antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; un modelo de 4B parámetros tiende a ser más propenso a errores factuales que modelos mayores, especialmente en dominios especializados.
- Sesgos conocidos: no documentados en la información disponible; se recomienda evaluar sesgos por cuenta propia antes de un despliegue sensible.
- Limitaciones de contexto: aunque se declaran 262K tokens y extensión por encima de 1M, el rendimiento real en contextos muy largos no está verificado con benchmarks publicados.
- La cuantización GGUF introduce una pérdida de precisión respecto al modelo original; la estrategia híbrida de Vultr mitiga pero no elimina esta degradación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-4B por si añaden requisitos adicionales.
- El modelo está etiquetado como `image-text-to-text`; el soporte multimodal depende de que el runtime de llama.cpp utilizado implemente correctamente la proyección de visión, algo que no siempre está garantizado en todas las versiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vultr/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Vultr (sitio oficial): https://www.vultr.com/
- Vultr Docs: https://docs.vultr.com/
- Vultr Discover: https://discover.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
