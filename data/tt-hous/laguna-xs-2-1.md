# tt-hous/laguna-xs-2.1

# Laguna-XS-2.1

## Resumen

Laguna-XS-2.1 es un modelo de generación de código desarrollado por Poolside y empaquetado por tt-hous (Tenstorrent) para ejecutarse en hardware de Tenstorrent, concretamente en los ASICs P150 y P300c. Se sirve mediante una API compatible con OpenAI, utiliza vLLM 0.24.0 y un plugin específico de Tenstorrent, y cuenta con capacidades de tool calling y razonamiento. El modelo ofrece una ventana de contexto de 131072 tokens, lo que permite procesar repositorios de código extensos en una sola consulta.

El paquete se distribuye con tt-model-manager e incluye el código fuente del modelo, que es idéntico al que se ejecuta en la imagen Docker. La información disponible no incluye detalles sobre la arquitectura interna, el número de parámetros ni la licencia.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se disponen de datos públicos sobre la arquitectura interna, el tamaño (número de parámetros) ni el proceso de entrenamiento del modelo Laguna-XS-2.1. Se sabe que es un modelo de código de Poolside con capacidades de tool calling y razonamiento. El paquete de tt-hous incluye el código fuente del modelo, idéntico al que se ejecuta en la imagen Docker, y se construye sobre tt-metal, vLLM 0.24.0 y el plugin vllm-tt-plugin. No hay información sobre el dataset de entrenamiento, el número de tokens ni la aplicación de RLHF o DPO.

## Capacidades

- Generación de código: especializado en tareas de programación.
- Tool calling / function calling: soporte activado por defecto (parsers `poolside_v1`).
- Razonamiento: capacidad de razonamiento multi-paso.
- API compatible con OpenAI: puede utilizarse con clientes estándar del ecosistema OpenAI.
- Ventana de contexto larga: admite hasta 131072 tokens (perfil p150x2 y p150x4).
- No se mencionan capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistente de programación en hardware Tenstorrent: el modelo puede integrarse en un entorno de desarrollo local (IDE o terminal) en una TT-QuietBox 2 con dos ASICs P150 o un P300c, ofreciendo autocompletado y generación de código con tool calling.
- Agentes con razonamiento y llamada a funciones: al soportar tool calling, puede alimentar agentes que necesiten ejecutar acciones (por ejemplo, consultar una base de datos, ejecutar un script) mientras razonan sobre la tarea, adecuado para automatizar flujos de desarrollo.
- Análisis de repositorios extensos: gracias a sus 131072 tokens de contexto, puede procesar múltiples archivos fuente de un proyecto grande y generar resúmenes, revisiones de código o documentación en una sola petición.
- Backend de API compatible con OpenAI: el servidor expone una API en formato OpenAI en el puerto 20000, lo que permite sustituir un backend existente por este modelo sin modificar el cliente, por ejemplo en aplicaciones basadas en LangChain o agentes personalizados.
- Integración en pipelines de CI/CD: el modelo puede revisar diffs de código, generar pruebas unitarias o producir descripciones de cambios, enviando el contenido completo del diff a través de la API y aprovechando la ventana de contexto amplia.
- Soporte técnico sobre documentación técnica: con su razonamiento y contexto largo, puede responder preguntas sobre manuales o guías de API extensas en un entorno de despliegue con los requisitos de hardware indicados.

## Benchmarks y rendimiento

No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. A continuación se muestran los datos de rendimiento de inferencia proporcionados por la model card, medidos en una configuración p150x2 (dos ASICs P150, vLLM 0.24.0, salida de 512 tokens, concurrencia 1 y caché de prefijo desactivada mediante sal único).

| Entrada (tokens) | Salida (tokens) | Concurrencia | Decode tok/s por usuario | Decode agregado tok/s | Tiempo al primer token | Latencia total |
|---:|---:|---:|---:|---:|---:|---:|
| 128 | 512 | 1 | 19,97 | 19,84 | 0,215 s | 25,801 s |
| 1.024 | 512 | 1 | 19,82 | 18,29 | 2,213 s | 27,995 s |
| 2.048 | 512 | 1 | 19,80 | 18,05 | 2,563 s | 28,366 s |
| 4.096 | 512 | 1 | 19,78 | 14,70 | 8,984 s | 34,822 s |
| 8.192 | 512 | 1 | 19,72 | 11,23 | 19,680 s | 45,592 s |
| 16.384 | 512 | 1 | 19,61 | 8,53 | 33,931 s | 59,993 s |
| 32.768 | 512 | 1 | 19,38 | 5,44 | 67,812 s | 94,178 s |
| 65.536 | 512 | 1 | 18,95 | 2,79 | 156,630 s | 183,595 s |
| 130.048 | 512 | 1 | 18,15 | 1,25 | 380,812 s | 408,967 s |

## Requisitos de hardware

- Hardware objetivo: p150x2 (dos ASICs P150 o un P300c interno en TT-QuietBox 2) o p150x4 (cuatro ASICs P150 o ambos P300c internos en TT-QuietBox 2).
- Una sola P150 no es soportada: el modelo agota la memoria del dispositivo al cargar los pesos, antes de asignar el KV cache.
- Compilación JIT inicial: el primer arranque compila los kernels y puede tardar unos 10 minutos.
- VRAM estimada: no disponible (hardware específico de Tenstorrent, no GPUs con VRAM).
- Opciones de despliegue: `tt-model serve` con perfiles `p150x2` (por defecto, max_num_seqs = 1) y `p150x4` (max_num_seqs = 8), a través de vLLM 0.24.0 con el plugin de Tenstorrent. También se puede usar con Docker.
- Latencia y throughput: en p150x2, la velocidad de decodificación se mantiene en torno a 19-20 tokens/s por usuario en todo el rango de contexto; el tiempo al primer token y la latencia total aumentan significativamente con la longitud de entrada (por ejemplo, 2,2 s a 1.024 tokens y 380,8 s a 130.048 tokens).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se indica la licencia del modelo, lo que puede restringir su uso comercial.
- Idiomas no disponibles: no se especifican los idiomas soportados.
- Soporte de hardware limitado: requiere hardware específico de Tenstorrent; no se puede ejecutar en GPUs estándar de NVIDIA o AMD.
- Concurrencia reducida: el perfil `p150x2` solo permite una secuencia simultánea (max_num_seqs = 1); el perfil `p150x4` permite hasta 8.
- Primer arranque lento: la compilación JIT de los kernels puede tardar unos 10 minutos antes de que el servidor esté listo.
- Rendimiento dominado por prefill en contextos largos: el tiempo hasta el primer token crece de forma notable (por ejemplo, 380,8 s para 130.048 tokens de entrada), lo que puede resultar inadecuado para interacciones en tiempo real con entradas muy extensas.
- Sin benchmarks de calidad publicados: no hay resultados de MMLU, HumanEval u otros benchmarks en la información disponible.
- Repositorio con cero descargas y cero likes: podría indicar una publicación temprana o una adopción inicial limitada.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/tt-hous/laguna-xs-2.1
- Modelo original de Poolside: https://huggingface.co/poolside/Laguna-XS-2.1
- Repositorio tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal: https://github.com/tenstorrent/tt-metal/commit/cbe68942207ef8c24c4c210a18ffb58565ba0443
- Release de vLLM v0.24.0: https://github.com/vllm-project/vllm/releases/tag/v0.24.0
- Commit de vllm-tt-plugin: https://github.com/tenstorrent/vllm-tt-plugin/commit/c127c17d80d66ee83d23064d3a62ac844a1170de
