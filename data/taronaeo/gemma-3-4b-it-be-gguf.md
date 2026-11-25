# taronaeo/Gemma-3-4B-IT-BE-GGUF

## Resumen

Gemma-3-4B-IT-BE-GGUF es una conversión a formato GGUF del modelo multimodal google/gemma-3-4b-it, realizada por el usuario taronaeo con una particularidad técnica: los pesos están byte-swapped (intercambiados de extremo a extremo) para ejecutarse en arquitecturas big-endian, concretamente en sistemas IBM Z (s390x) y LinuxONE (z15, z16, z17). No es un modelo nuevo ni un fine-tuning, sino una redistribución de los pesos originales de Google adaptada a un ecosistema de hardware históricamente ignorado por el ecosistema de IA open source.

El modelo base, Gemma 3 4B IT, es un transformer multimodal de Google DeepMind que acepta texto e imágenes y genera texto, con una ventana de contexto de 128.000 tokens y soporte para más de 140 idiomas. Con 3.880.263.168 parámetros, está pensado para despliegue en entornos con recursos limitados, lo que encaja con la propuesta de este repositorio: llevar inferencia de un modelo de 4B a mainframes IBM mediante llama.cpp compilado para s390x.

La relevancia de esta ficha es acotada pero clara: si trabajas con IBM Z o LinuxONE y necesitas ejecutar un modelo multimodal local sin salir del mainframe, este repositorio ofrece cuantizaciones listas para usar (desde Q2_K hasta BF16) junto con el proyector multimodal en F16. Para cualquier otro hardware (x86, ARM, GPU convencionales) no aporta nada frente al repositorio original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), familia Gemma 3 |
| Parametros totales | 3.880.263.168 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (según model card de Gemma 3 para el tamaño 4B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16; proyector multimodal en F16 |
| Idiomas soportados | Más de 140 idiomas según la model card de Gemma 3; el repositorio no detalla lista propia |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (byte-swapped para big-endian / s390x) y mmproj GGUF en F16 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B IT de Google DeepMind, un transformer denso multimodal construido con la misma investigación que los modelos Gemini. Procesa imágenes normalizadas a 896 x 896 píxeles, codificadas en 256 tokens cada una, y texto hasta un total de 128.000 tokens de contexto en el tamaño 4B. La variante IT (instruction-tuned) está ajustada para seguir instrucciones y mantener conversaciones multi-turno. La model card original no detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset para este tamaño concreto.

La aportación técnica de este repositorio no está en el entrenamiento sino en el empaquetado: los tensores se han byte-swapped para que funcionen en CPUs big-endian, algo necesario porque los GGUF estándar asumen little-endian. El autor remite a la guía oficial de llama.cpp para compilar en s390x. Se incluye además un proyector multimodal separado (mmproj) en F16 de 811,8 MB, imprescindible para la entrada de imágenes. No hay información disponible sobre procesos de RLHF, DPO u otras etapas de alineamiento específicas más allá de lo que declare Google en la model card original.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, incluyendo respuesta a preguntas, resumen y análisis.
- Comprensión de imágenes: entrada image-text-to-text con codificación de cada imagen en 256 tokens.
- Conversación multi-turno con plantilla de chat instruction-tuned.
- Soporte multilingüe amplio (más de 140 idiomas según Google).
- Capacidad de procesar documentos largos gracias a la ventana de 128.000 tokens.
- Ejecución en CPU big-endian mediante llama.cpp compilado para s390x, sin necesidad de GPU.
- No se dispone de información en este repositorio sobre soporte explícito de tool calling, function calling o modos de agente; la model card de Gemma 3 no los detalla para esta variante en la información proporcionada.

## Casos de uso

- Inferencia local en mainframe IBM Z: ejecutar un modelo multimodal directamente en z15, z16 o z17 mediante `llama-server -hf taronaeo/Gemma-3-4B-IT-BE-GGUF:Q4_K_M`, evitando sacar datos del entorno del mainframe y aprovechando la arquitectura big-endian nativa.
- Procesamiento de documentos confidenciales en banca o seguros sobre LinuxONE: resumen y extracción de información de contratos e informes en texto e imagen sin salir del perímetro del sistema, con contexto de 128K tokens para documentos extensos.
- Asistente conversacional interno en entornos regulados: atención a empleados o soporte técnico multi-turno desplegado en infraestructura IBM Z, donde la latencia de red hacia servicios externos o la residencia de datos son requisitos críticos.
- Digitalización con OCR asistido y comprensión de formularios: el modelo acepta imágenes de 896 x 896 y puede describir o extraer contenido de capturas, escaneos y diagramas dentro de un pipeline batch ejecutado en el mainframe.
- Traducción y atención multilingüe: con soporte declarado para más de 140 idiomas, útil para normalizar o resumir correspondencia en varios idiomas en entornos corporativos con presencia internacional.
- Prototipado y validación de pipelines de IA en s390x: usar las distintas cuantizaciones (Q2_K a BF16) para medir calidad frente a consumo de memoria en el hardware concreto antes de fijar una configuración de producción.
- Educación e investigación sobre despliegue de IA en arquitecturas no convencionales: el repositorio sirve como referencia práctica de cómo adaptar pesos GGUF a big-endian con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad por cuantización ni comparativas de rendimiento en s390x; la model card de Gemma 3 remite al informe técnico de Google para los datos del modelo base, que no se reproducen aquí.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaños de archivo declarados por el autor): Q2_K 1,6 GB; Q3_K_S 1,8 GB; Q3_K_M 2,0 GB; Q3_K_L 2,1 GB; IQ4_XS 2,1 GB; IQ4_NL 2,2 GB; Q4_K_S 2,2 GB; Q4_0 2,2 GB; Q4_K_M 2,3 GB; Q4_1 2,4 GB; Q5_K_S 2,6 GB; Q5_K_M 2,6 GB; Q5_0 2,6 GB; Q5_1 2,8 GB; Q6_K 3,0 GB; Q8_0 3,8 GB; BF16 7,2 GB. Hay que sumar el proyector multimodal F16 de 811,8 MB si se usa entrada de imagen.
- Hardware objetivo: CPUs IBM Z (s390x) y LinuxONE modelos z15, z16 y z17. El repositorio está diseñado específicamente para estas arquitecturas big-endian.
- GPU: no aplica; el caso de uso es inferencia en CPU del mainframe. No se documenta aceleración GPU para esta build.
- Consumer GPU: no es el objetivo del repositorio. En hardware little-endian convencional conviene usar el GGUF estándar de google/gemma-3-4b-it en lugar de esta versión byte-swapped.
- Despliegue: llama.cpp compilado para s390x (guía oficial en docs/build-s390x.md), con `llama-server` como servidor compatible con la API de endpoints. El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo en z15, z16 o z17.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / objetivo |
|---|---|---|---|---|---|
| taronaeo/Gemma-3-4B-IT-BE-GGUF | 3,88B | 128K | Sí (texto + imagen) | Gemma | GGUF byte-swapped para s390x big-endian |
| google/gemma-3-4b-it | 3,88B | 128K | Sí (texto + imagen) | Gemma | Safetensors, orientado a GPU/TPU y frameworks estándar |
| google/gemma-3-4b-it (GGUF de terceros, p. ej. ggml-org) | 3,88B | 128K | Sí (texto + imagen) | Gemma | GGUF little-endian para x86/ARM y GPU convencionales |
| Qwen2.5-VL-3B-Instruct | ~3B | 32K nativo (extensible) | Sí (texto + imagen + vídeo) | Apache 2.0 | Safetensors y GGUF little-endian |

La diferencia clave frente al resto no es de rendimiento ni de tamaño, sino de endianness y plataforma: este repositorio es el único de la comparativa pensado para ejecutarse en IBM Z. Frente al GGUF estándar de Gemma 3 4B, la única diferencia es el byte-swap; frente a Qwen2.5-VL-3B, la licencia es más restrictiva (Gemma Terms en lugar de Apache 2.0) y el contexto es mayor, aunque no hay datos de benchmarks en la información disponible para comparar calidad.

## Limitaciones y advertencias

- Específico de plataforma: los pesos están byte-swapped; usarlos en hardware little-endian (x86, ARM, la mayoría de GPUs) producirá resultados incorrectos. Para esos entornos, usa el GGUF estándar del modelo base.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen obligaciones de uso aceptable y condiciones de redistribución. Revisa los términos antes de desplegar en producción.
- Riesgo de alucinación: como cualquier LLM de 4B, puede generar información falsa con apariencia de veracidad, especialmente en tareas de razonamiento complejo o extracción de datos de imágenes.
- Cuantizaciones agresivas: el propio autor advierte de "pérdida significativa de calidad" en Q2_K y "alta pérdida de calidad" en las variantes Q3. Para producción se recomienda Q4_K_M o superior.
- Idiomas: aunque Gemma 3 declara más de 140 idiomas, no se publica una evaluación por idioma para este tamaño; el rendimiento en castellano o en idiomas minoritarios no está cuantificado en la información disponible.
- Multimodalidad dependiente del mmproj: sin cargar el archivo mmproj F16, el modelo no procesará imágenes; hay que configurarlo explícitamente en llama.cpp.
- Sin benchmarks en s390x: no hay mediciones publicadas de latencia ni throughput en z15, z16 o z17, por lo que el dimensionamiento en mainframe requiere pruebas propias.
- Mantenimiento: repositorio de un autor individual (taronaeo), con 0 likes y creado en noviembre de 2026; no hay garantía de actualizaciones ni soporte.
- Sesgos: no se documentan evaluaciones de sesgo específicas para esta conversión; aplican los sesgos del modelo base Gemma 3, que Google documenta en su Responsible Generative AI Toolkit.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Gemma-3-4B-IT-BE-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Página oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: https://ai.google.dev/gemma/docs/core (referenciado como [g3-tech-report] en la model card)
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
