# VillanovaAI/Villanova2-2B-VL-GGUF

## Resumen

Villanova2-2B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal VillanovaAI/Villanova2-2B-VL, desarrollado por VillanovaAI. Se trata de un modelo de visión-lenguaje de aproximadamente 2.400 millones de parámetros (2.411.205.632 exactos), orientado a la comprensión de documentos, OCR y tareas image-text-to-text, con soporte para cinco idiomas europeos: inglés, italiano, alemán, español y francés.

El modelo resuelve el problema de desplegar capacidades multimodales de comprensión documental en entornos con recursos limitados, ya que su tamaño compacto y su empaquetado en GGUF permiten inferencia en CPU y GPU de consumo mediante herramientas como llama.cpp u Ollama. La relevancia actual radica en la combinación de un perfil multilingüe europeo con licencia Apache 2.0, lo que facilita su adopción en productos comerciales sin las restricciones habituales de otros modelos multimodales.

La ficha se basa exclusivamente en los metadatos públicos del repositorio de Hugging Face. No se dispone de información publicada sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language, pipeline image-text-to-text) |
| Parametros totales | 2.411.205.632 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles; repo de 16,4 GB) |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors: VillanovaAI/Villanova2-2B-VL) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo en los metadatos disponibles. Por la nomenclatura y el pipeline (image-text-to-text) se trata de un modelo vision-language, presumiblemente con un codificador visual acoplado a un modelo de lenguaje, pero no se confirma el tipo de transformer, la estrategia de fusión multimodal ni el mecanismo de atención. Tampoco se especifica la longitud de contexto.

Respecto al entrenamiento, no hay datos sobre el número de tokens, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El etiquetado incluye "european" y "document-understanding", lo que sugiere un enfoque del corpus hacia documentos y lenguas europeas, pero es una inferencia a partir de las etiquetas y no un dato confirmado. La versión GGUF es una cuantización del modelo base VillanovaAI/Villanova2-2B-VL, sin que se detallen los métodos de cuantización empleados.

## Capacidades

- Generación de texto e image-text-to-text: responde a instrucciones combinando imagen y texto de entrada.
- Comprensión de documentos y OCR: etiquetado explícitamente como "document-understanding" y "ocr".
- Multimodalidad: procesamiento conjunto de imágenes y lenguaje (visión).
- Multilingüismo: inglés, italiano, alemán, español y francés.
- Conversación: etiqueta "conversational", apto para diálogo multi-turno.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible", pensada para despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización y extracción de datos de facturas y albaranes: el modelo puede recibir la imagen de un documento y devolver campos estructurados en español, italiano, alemán o francés, aprovechando su etiqueta de document-understanding y su perfil multilingüe europeo.
- OCR asistido en archivos históricos o administrativos: al combinar OCR con comprensión, permite transcribir y normalizar texto de documentos escaneados en varias lenguas europeas sin pipelines separados.
- Atención al cliente con capturas de pantalla: un usuario envía una imagen de su pantalla o de un recibo y el modelo la interpreta y responde en su idioma, gracias a la etiqueta conversational y al soporte de cinco idiomas.
- Procesamiento de documentación técnica multilingüe: extracción de tablas, especificaciones y figuras de manuales en inglés, alemán o francés para alimentar bases de conocimiento internas.
- Despliegue en local o en el borde: al estar en GGUF con 2,4B parámetros, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo sin GPU dedicada, útil para entornos con requisitos de privacidad que no permiten enviar documentos a la nube.
- Clasificación y enrutado de documentos entrantes: el modelo puede leer la primera página de un documento y determinar su tipo o idioma para dirigirlo al flujo de procesamiento adecuado, aprovechando su naturaleza compacta para alto volumen.
- Accesibilidad: descripción de imágenes y lectura de documentos para usuarios con discapacidad visual, con respuesta en el idioma del usuario entre los cinco soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (2,4B parámetros), una cuantización Q4 requeriría del orden de 1,5-2 GB de pesos, Q8 en torno a 2,5-3 GB y FP16 alrededor de 5 GB, a lo que hay que sumar el codificador visual y el coste de contexto; estas cifras son estimaciones por tamaño, no datos del repositorio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo debería caber en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100/H100 para despliegues de mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPU con 8 GB o más en cuantizaciones bajas, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta endpoints_compatible sugiere también despliegue en endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Villanova2-2B-VL-GGUF | 2,4B | no disponible | en, it, de, es, fr | Apache 2.0 | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa fiable con modelos concretos de la misma categoría (visión-lenguaje de ~2B parámetros). Se recomienda consultar el repositorio del modelo base para obtener detalles adicionales antes de comparar.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Datos técnicos incompletos: no se publican arquitectura, contexto, dataset ni benchmarks, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en OCR de documentos de baja calidad; conviene validar la salida en flujos críticos.
- Sesgos: no hay información publicada sobre sesgos; al estar entrenado con foco europeo, podría tener un rendimiento desigual entre los cinco idiomas.
- Limitaciones de idioma: solo se declaran en, it, de, es y fr; no se garantiza soporte de otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado cuantizado conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Cuantización: la versión GGUF puede degradar ligeramente la precisión respecto al modelo base en tareas de OCR fino o razonamiento visual; es recomendable comparar contra el modelo en safetensors.
- Madurez: el repositorio tiene muy pocas descargas y likes (4 y 3 en el momento de la consulta), lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-2B-VL-GGUF
- Modelo base: https://huggingface.co/VillanovaAI/Villanova2-2B-VL
- Perfil del autor: https://huggingface.co/VillanovaAI
