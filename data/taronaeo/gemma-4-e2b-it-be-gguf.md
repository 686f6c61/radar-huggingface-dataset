# taronaeo/Gemma-4-E2B-IT-BE-GGUF

## Resumen

Gemma-4-E2B-IT-BE-GGUF es una cuantización en formato GGUF del modelo google/gemma-4-E2B-it, la variante instruction-tuned de 2B efectivos de la familia Gemma 4 de Google DeepMind. La particularidad de esta publicación, obra del usuario taronaeo, es que los pesos han sido sometidos a un byte-swap para funcionar en arquitecturas big-endian, concretamente en sistemas IBM Z y LinuxONE (s390x, z15, z16, z17). No se trata por tanto de un modelo nuevo, sino de una redistribución empaquetada específicamente para mainframes.

El modelo base es multimodal any-to-any: acepta texto, imagen y audio (el audio está soportado en las variantes E2B, E4B y 12B) y genera texto. Gemma 4 mantiene una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, con arquitecturas densas y Mixture-of-Experts repartidas en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B). El repositorio safetensors del modelo base declara 4.647.450.147 parámetros totales.

La relevancia de esta ficha es doble: por un lado documenta una de las pocas rutas prácticas para ejecutar un LLM multimodal moderno sobre hardware IBM Z; por otro, sirve de referencia sobre el estado de Gemma 4 en el ecosistema de cuantización GGUF. El repo ocupa 66,5 GB e incluye 18 ficheros GGUF más un proyector multimodal, con 941 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y audio) del modelo base Gemma 4; pesos byte-swapped para big-endian |
| Parámetros totales | 4.647.450.147 (dato del repo safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según la model card del modelo base) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16; proyector multimodal mmproj-F16 |
| Idiomas soportados | más de 140 idiomas (modelo base); no se detalla la lista |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4) |
| Formato de pesos | GGUF (byte-swapped, big-endian) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, que combina variantes densas y Mixture-of-Experts. La variante E2B es la de menor tamaño de la familia y está diseñada para despliegue en entornos con recursos limitados, desde teléfonos de gama alta hasta portátiles y servidores. La entrada es multimodal (texto e imagen en todas las variantes; audio adicionalmente en E2B, E4B y 12B) y la salida es texto. La model card del modelo base menciona "avances clave en capacidades y arquitectura" sin detallar los mecanismos concretos en la información disponible.

El detalle técnico diferencial de esta publicación es el byte-swapping de los pesos: los tensores se reordenan byte a byte para que el formato little-endian estándar de GGUF funcione en CPUs s390x big-endian. Esto implica que estos ficheros no son intercambiables con los GGUF convencionales y solo tienen sentido en hardware IBM Z o LinuxONE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned (sufijo IT).
- Procesamiento de imágenes como entrada, mediante el proyector multimodal mmproj incluido en el repo.
- Procesamiento de audio como entrada (soportado en el tamaño E2B según el modelo base).
- Razonamiento y resolución de tareas de código, según la descripción de la familia Gemma 4.
- Soporte multilingüe en más de 140 idiomas.
- Ventana de contexto de hasta 256K tokens para conversaciones y documentos largos.
- Ejecución en arquitecturas big-endian IBM Z y LinuxONE mediante llama.cpp compilado para s390x.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de LLM en mainframe IBM Z: el caso de uso principal de esta publicación es ejecutar un modelo conversacional multimodal directamente en sistemas z15, z16 o z17 sin salir del entorno big-endian, arrancando con `llama-server -hf taronaeo/Gemma-4-E2B-IT-BE-GGUF:Q4_K_M`. Es adecuado porque los pesos están byte-swapped y el resto de GGUF del ecosistema no funcionaría en s390x.
- Procesamiento de documentos con imágenes en entornos regulados: con el proyector mmproj y una cuantización Q5_K_M o Q6_K se puede hacer OCR asistido, extracción de campos de facturas o resumen de capturas dentro de la infraestructura del mainframe, evitando enviar datos a APIs externas.
- Asistente conversacional multilingüe: los más de 140 idiomas del modelo base permiten atender consultas de usuarios en distintos idiomas con un único despliegue, usando Q4_K_M como equilibrio entre tamaño (3,2 GB) y calidad.
- Transcripción y análisis de audio en flujos internos: al soportar entrada de audio en la variante E2B, puede integrarse en pipelines de atención telefónica o revisión de reuniones ejecutándose en el propio sistema Z.
- Prototipado y evaluación de LLM en infraestructura IBM: investigadores que trabajan con LinuxONE pueden validar comportamientos de Gemma 4 sin depender de GPUs, comparando cuantizaciones desde Q2_K (2,8 GB) hasta BF16 (8,7 GB) en la misma máquina.
- Despliegue en entornos con restricciones de aceleradores: al ser un modelo de ~4,6B parámetros en GGUF, corre en CPU con llama.cpp; en un mainframe con varios cores disponibles se puede servir de forma concurrente para tareas de baja latencia y throughput moderado.
- Generación de código asistida en herramientas internas: la familia Gemma 4 está orientada a tareas de código y razonamiento, por lo que la variante IT puede emplearse para autocompletado o explicación de fragmentos dentro de IDE corporativos conectados a un endpoint compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~2,8 GB; Q3_K_S ~2,9 GB; Q3_K_M ~3,0 GB; Q3_K_L ~3,1 GB; IQ4_NL e IQ4_XS ~3,1 GB; Q4_K_S ~3,1 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,4 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; BF16 ~8,7 GB. Añadir ~940 MB si se carga el proyector multimodal mmproj-F16.
- Hardware objetivo: IBM Z y LinuxONE (s390x big-endian, z15, z16, z17). Los ficheros no están pensados para x86 ni ARM.
- GPU: no aplica; el despliegue es sobre CPU de mainframe mediante llama.cpp compilado para s390x.
- Cabe en consumer GPU: no disponible para esta publicación; los GGUF byte-swapped no son utilizables en GPUs convencionales.
- Opciones de despliegue: llama.cpp (build s390x documentado en el repositorio oficial), con `llama-server` o `llama-cli`. vLLM, TGI y Ollama no están documentados para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-IT-BE-GGUF (esta ficha) | 4.647.450.147 | hasta 256K | texto, imagen, audio | Apache 2.0 | GGUF big-endian para IBM Z |
| google/gemma-4-E2B-it (modelo base) | 4.647.450.147 | hasta 256K | texto, imagen, audio | Apache 2.0 | safetensors, ecosistema estándar |
| Otras variantes Gemma 4 (E4B, 12B, 26B A4B, 31B) | no disponible | hasta 256K | texto, imagen; audio en E4B y 12B | Apache 2.0 | safetensors y GGUF convencionales |
| Alternativas de otros fabricantes del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el propio modelo base: misma arquitectura y capacidades, pero distinto empaquetado y público objetivo (mainframe frente a hardware convencional). No se dispone de datos de rendimiento para comparar con modelos de terceros.

## Limitaciones y advertencias

- Los pesos están byte-swapped: no funcionan en hardware little-endian (x86, ARM) y no deben confundirse con los GGUF estándar del modelo base.
- El soporte está limitado a llama.cpp compilado para s390x; otras herramientas de inferencia no están documentadas para esta variante.
- La cuantización Q2_K y las Q3 introducen pérdida de calidad significativa según la propia model card; para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a los modelos de ~4,6B parámetros; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- Sesgos conocidos: no disponibles en la información proporcionada; deben asumirse los del modelo base Gemma 4.
- Idiomas: se declaran más de 140, pero no se detalla la cobertura ni la calidad por idioma; el castellano no está verificado de forma específica.
- Licencia Apache 2.0 según la model card, con enlace a la licencia específica de Gemma 4; conviene revisar los términos de uso comercial de Gemma antes de desplegar en producción.
- El repositorio ocupa 66,5 GB por incluir todas las cuantizaciones; para descargar solo una variante hay que seleccionar el fichero concreto.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso en la información disponible.
- Modelo publicado en noviembre de 2026 con 0 likes y 941 descargas: trazabilidad y soporte comunitario limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Gemma-4-E2B-IT-BE-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
