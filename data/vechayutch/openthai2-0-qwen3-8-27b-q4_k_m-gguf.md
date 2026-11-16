# vechayutch/openthai2.0-qwen3.8-27b-Q4_K_M-GGUF

## Resumen

Esta ficha describe `vechayutch/openthai2.0-qwen3.8-27b-Q4_K_M-GGUF`, una cuantización en formato GGUF del modelo `iapp/openthai2.0-qwen3.8-27b`, publicada por el usuario `vechayutch`. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos realizada con `llama.cpp` a través del espacio `GGUF-my-repo` de ggml.ai, pensada para ejecutar el modelo en hardware de consumo y en entornos con `llama.cpp`. El modelo base es un vision-language de 27.320.697.856 parámetros (unos 27,3 mil millones) orientado a OCR y comprensión de documentos en tailandés e inglés.

La relevancia de esta publicación es práctica: permite desplegar un modelo multimodal de 27B en formato Q4_K_M (aproximadamente 4 bits por peso) sin necesidad de infraestructura de GPU de datacenter. El repositorio ocupa 16,8 GB, lo que da una idea del tamaño de los pesos cuantizados y de los requisitos de VRAM o memoria unificada para inferencia. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene verificar la licencia del modelo base original.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio cuantizado se limita a instrucciones de uso con `llama.cpp` y remite a la model card del modelo base. Por tanto, varios apartados de esta ficha se marcan explícitamente como "no disponible" cuando no hay datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; probablemente transformer con encoder visual, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no constituye una especificación del modelo) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`openthai2.0-qwen3.8-27b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `iapp/openthai2.0-qwen3.8-27b`. Por el pipeline declarado (`image-text-to-text`) y las etiquetas (`vision-language`, `ocr`, `document-understanding`), se trata de un modelo multimodal que acepta imágenes y texto y genera texto, orientado a tareas de reconocimiento óptico de caracteres y comprensión de documentos. El nombre del modelo sugiere una relación con la familia Qwen3, pero este extremo no está confirmado en la información proporcionada.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica verificable de este repositorio es el proceso de conversión: los pesos originales se transformaron a GGUF mediante `llama.cpp` y el espacio `GGUF-my-repo` de ggml.ai, con cuantización Q4_K_M. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas multimodales con imágenes y texto.
- OCR y comprensión de documentos: las etiquetas `ocr` y `document-understanding` indican especialización en extracción y comprensión de contenido en documentos escaneados o fotografías.
- Multilingüismo limitado: soporte declarado de tailandés (th) e inglés (en); no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de documentos en tailandés: el modelo puede procesar imágenes de facturas, formularios o documentos escaneados y extraer texto estructurado, aprovechando su especialización en OCR y su soporte nativo de tailandés.
- Extracción de datos de recibos y tickets: integrado en un pipeline de `llama.cpp`, permite convertir imágenes de comprobantes en campos estructurados (importe, fecha, emisor) para sistemas de contabilidad.
- Atención al cliente en tailandés: generación de respuestas multilingües (th/en) en conversaciones de soporte, con la ventaja de que el modelo comprende tanto texto como capturas de pantalla enviadas por el usuario.
- Procesamiento de documentación administrativa: clasificación y resumen de documentos oficiales tailandeses en entornos con recursos limitados, gracias al formato GGUF Q4_K_M que reduce los requisitos de memoria.
- Análisis de imágenes en inglés y tailandés: descripción de contenido visual y respuesta a preguntas sobre imágenes, útil en herramientas de accesibilidad o moderación de contenido.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al estar cuantizado a Q4_K_M, puede ejecutarse con `llama.cpp` en equipos con memoria unificada o GPU de consumo, lo que facilita prototipos y pruebas locales antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,8 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) para cargar los pesos Q4_K_M, más overhead para el contexto y el encoder visual.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090 o A10G) sería el mínimo razonable para cargar los pesos completos; GPU de datacenter como A100 o H100 ofrecerían margen adicional.
- ¿Cabe en GPU de consumo? Potencialmente en GPUs con 24 GB o más de VRAM, o en sistemas Apple Silicon con memoria unificada suficiente (32 GB o más), aunque no se confirma en la documentación.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), tal como documenta la model card. Otras opciones como vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (vision-language con OCR en tailandés de ~27B) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información incompleta: la model card del repositorio cuantizado no documenta arquitectura, entrenamiento ni benchmarks; toda evaluación seria requiere consultar la model card del modelo base `iapp/openthai2.0-qwen3.8-27b`.
- Idiomas limitados: solo se declaran tailandés e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en OCR de documentos de baja calidad.
- Licencia: Apache 2.0 declarada para este repositorio, pero conviene verificar que el modelo base mantenga la misma licencia antes de uso comercial.
- Cuantización Q4_K_M: la pérdida de precisión respecto a los pesos originales puede degradar tareas sensibles como OCR fino o extracción de caracteres poco frecuentes; no se han publicado evaluaciones comparativas.
- Contexto: el ejemplo de la model card usa `-c 2048`, pero no se especifica la longitud de contexto real del modelo; no debe asumirse una ventana mayor sin verificación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/vechayutch/openthai2.0-qwen3.8-27b-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
