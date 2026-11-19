# taronaeo/Granite-Vision-3.3-2B-BE-GGUF

## Resumen

Granite-Vision-3.3-2B-BE-GGUF es una cuantización en formato GGUF del modelo vision-lenguaje `ibm-granite/granite-vision-3.3-2b` de IBM, publicada por el usuario taronaeo. La particularidad de esta distribución es que los pesos han sido convertidos a orden de bytes big-endian para poder ejecutarse en sistemas IBM Z y LinuxONE (arquitecturas s390x, z15, z16 y z17), que son máquinas big-endian. El modelo base es un VLM compacto de aproximadamente 2.530 millones de parámetros, diseñado específicamente para comprensión de documentos visuales: tablas, gráficos, infografías, diagramas y similares.

El modelo original se construye mediante fine-tuning de un LLM de la familia Granite de IBM con modalidad de imagen añadida, e incorpora capacidades experimentales como segmentación de imágenes, generación de DocTags y soporte multipágina. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Esta cuantización concreta está pensada para el nicho de despliegue en mainframes IBM, un entorno donde tradicionalmente no existen modelos multimodales ejecutables con llama.cpp.

El repositorio acumula 81.249 descargas y un tamaño de 77,9 GB, ya que incluye todas las variantes de cuantización (desde Q2_K de 958 MB hasta F32 de 9,4 GB) más el proyector multimodal `mmproj`. La ficha del autor recomienda Q4_K_M como equilibrio calidad/tamaño y remite a la guía oficial de compilación para s390x de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LLM Granite + encoder visual + proyector multimodal); detalles internos no disponibles |
| Parametros totales | 2.533.533.696 (2,53 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, F16, F32; proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (big-endian, byte-swapped para s390x) |

## Arquitectura y entrenamiento

El modelo base es un VLM que combina un modelo de lenguaje de la familia Granite de IBM con un encoder de imagen y un proyector multimodal (distribuido aquí como `mmproj-Granite-Vision-3.3-2B-BE-F16.gguf`, de 851,2 MB). La model card indica que se entrenó mediante fine-tuning de un LLM Granite con las modalidades de imagen y texto, sobre un conjunto de datos de instrucciones "meticulosamente curado" que combina datasets públicos y sintéticos orientados a comprensión de documentos y tareas generales de imagen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable de esta distribución no está en el modelo en sí, sino en el proceso de conversión: los pesos se han reordenado a big-endian para que llama.cpp pueda ejecutarlos en procesadores s390x de IBM Z y LinuxONE. El modelo original incorpora además características experimentales: segmentación de imágenes, generación de DocTags (representación estructurada del contenido de documentos) y soporte de múltiples páginas. La model card menciona mejoras de seguridad respecto a versiones anteriores de Granite Vision.

## Capacidades

- Comprensión de documentos visuales: extracción de contenido de tablas, gráficos, infografías, diagramas y plots.
- Generación de DocTags, una representación estructurada y legible por máquina del contenido de un documento.
- Segmentación de imágenes (capacidad experimental).
- Soporte multipágina para documentos extensos (capacidad experimental).
- Conversión imagen-a-texto en formato conversacional (pipeline `image-to-text`).
- Respuesta a instrucciones multimodales que combinan imagen y texto.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Ejecución en mainframes IBM Z y LinuxONE mediante llama.cpp compilado para s390x.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes en entornos mainframe: el modelo puede procesar la imagen de un documento y extraer tablas y campos estructurados, integrándose directamente en el flujo de datos de un sistema IBM Z sin necesidad de sacar la información del entorno corporativo.
- Extracción de tablas de informes financieros: gracias a su especialización en comprensión de documentos visuales, convierte tablas de PDFs o capturas en texto estructurado o DocTags que se pueden cargar en una base de datos.
- Procesamiento de gráficos y plots en pipelines analíticos: descripción y extracción de series de datos representadas visualmente, útil para informes automáticos o auditorías.
- Accesibilidad documental: generación de descripciones textuales de diagramas e infografías para sistemas de lectura asistida, ejecutándose en infraestructura LinuxONE ya existente.
- Automatización de back-office en banca y seguros: clasificación y extracción de contenido de formularios escaneados dentro del mismo mainframe que aloja el core bancario, reduciendo la exposición de datos a sistemas externos.
- Pruebas de concepto de IA multimodal en s390x: este repositorio es prácticamente la única vía práctica para experimentar con un VLM en arquitectura big-endian usando llama.cpp, lo que lo hace adecuado para equipos que evalúan IA generativa sobre IBM Z.
- Moderación y análisis de contenido visual con requisitos de residencia de datos: al ejecutarse on-premise en el mainframe, permite analizar imágenes sin enviarlas a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~0,96 GB; Q3_K_S ~1,1 GB; Q4_K_M ~1,5 GB; Q5_K_M ~1,7 GB; Q6_K ~2,0 GB; Q8_0 ~2,5 GB; BF16/F16 ~4,7 GB; F32 ~9,4 GB. Hay que sumar el proyector multimodal F16 de ~851 MB.
- GPU recomendadas: no disponible en la información proporcionada; el destino principal de esta cuantización es CPU s390x (IBM z15, z16, z17 y LinuxONE), no GPU.
- Cabe en GPU de consumo: por tamaño, las cuantizaciones de 4 a 6 bits caben en cualquier GPU con 4 GB o más de VRAM; sin embargo, esta build concreta está pensada para big-endian y no es la opción natural para x86/ARM con GPU.
- Opciones de despliegue: llama.cpp compilado para s390x (guía oficial en `docs/build-s390x.md` del repositorio ggml-org/llama.cpp); el ejemplo de la model card usa `llama-server -hf taronaeo/Granite-Vision-3.3-2B-BE-GGUF:Q4_K_M`. Otras opciones como vLLM, TGI u Ollama no están documentadas para esta build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-Vision-3.3-2B-BE-GGUF (esta ficha) | 2,53 B | no disponible | GGUF big-endian para s390x | Apache 2.0 | Hugging Face, 81.249 descargas |
| ibm-granite/granite-vision-3.3-2b | 2,53 B | no disponible | Safetensors, x86/GPU | Apache 2.0 | Hugging Face (modelo base) |
| ibm-granite/granite-4.0-3b-vision | no disponible | no disponible | no disponible | no disponible | Hugging Face (sucesor indicado en la model card) |

La comparativa con alternativas de terceros (por ejemplo, otros VLM de ~2-3 B orientados a documentos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Esta build está byte-swapped para big-endian: no funcionará correctamente en sistemas little-endian (x86, ARM) sin la conversión inversa; para esos entornos conviene usar el modelo base o una cuantización estándar.
- El modelo está diseñado para comprensión de documentos; su rendimiento en tareas de imagen general (escenas naturales, reconocimiento de objetos cotidianos) puede ser inferior al de VLM de propósito general.
- Las capacidades de segmentación, DocTags y multipágina se describen como experimentales en la model card, por lo que su fiabilidad en producción no está garantizada.
- Riesgo de alucinación en la extracción de contenido de documentos: como todo VLM, puede inventar cifras o filas de tablas ilegibles; se recomienda validación posterior en flujos críticos.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin evaluación previa.
- Longitud de contexto no documentada: los documentos multipágina pueden exceder la ventana efectiva del modelo.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base y de los datasets de entrenamiento en el repositorio original.
- El repositorio ocupa 77,9 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Granite-Vision-3.3-2B-BE-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-3.3-2b
- Sucesor indicado en la model card: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Guía de compilación para s390x de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Paper referenciado (arXiv 2502.09927): https://arxiv.org/abs/2502.09927
