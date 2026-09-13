# t8star/Auk-Comfy

## Resumen

Auk-Comfy es un repositorio de espejo publicado por el usuario t8star que empaqueta los archivos de pesos necesarios para la integración **AuK Local · T8star-Aix** de ComfyUI. No se trata de un modelo entrenado por el autor del repositorio, sino de una recopilación de tres componentes de origen: `AuK-Flash` y `AuK` (ambos de Tencent, orientados a generación y edición de voz) y `Qwen2.5-Omni-3B` (de Qwen, empleado para la comprensión de instrucciones). El repositorio incluye un `MODEL_MANIFEST.json` con el tamañano y el SHA-256 esperados de cada archivo.

El problema que resuelve es de distribución y reproducibilidad: reunir en una sola descarga las revisiones exactas de los pesos que espera el nodo de ComfyUI, de modo que el usuario no tenga que localizar y fijar manualmente cada componente por separado. La etiqueta de pipeline es `text-to-speech` y las capacidades declaradas incluyen clonación de voz y edición de habla, con soporte de chino e inglés.

El interés práctico es acotado pero claro: permite montar un flujo local de síntesis y edición de voz dentro de ComfyUI, con generación rápida en cuatro pasos mediante `AuK-Flash` e instrucciones en lenguaje natural procesadas por un modelo multimodal de 3B. El repositorio ocupa 24,9 GB y se publica bajo licencia `other`, heredando las condiciones de cada modelo de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio agrupa componentes heterogéneos: los modelos de voz AuK y AuK-Flash (arquitectura no detallada en la información proporcionada) y el modelo multimodal Qwen2.5-Omni-3B para comprensión de instrucciones |
| Parametros totales | No disponible. El único componente con tamaño explícito en el nombre es Qwen2.5-Omni-3B (3B) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | `other`. Cada carpeta de modelo conserva la licencia de su origen; es necesario revisar las condiciones de Tencent y Qwen antes de cualquier uso comercial |
| Formato de pesos | Safetensors |
| Tamaño del repositorio | 24,9 GB |
| Componentes incluidos | AuK-Flash (revisión `575b92f0`), AuK (revisión `790742b7`), Qwen2.5-Omni-3B (revisión `f75b40e3`) |
| Repositorio de nodos | github.com/T8mars/Comfyui-Auk-T8 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna ni el proceso de entrenamiento de ninguno de los componentes. La model card se limita a indicar la función de cada carpeta: `AuK-Flash` para generación de voz en cuatro pasos, `AuK` para generación y edición de voz base, y `Qwen2.5-Omni-3B` para comprensión de instrucciones. No se especifican número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla si AuK-Flash emplea destilación por pasos, flow matching u otro esquema de muestreo reducido.

Lo único verificable a nivel técnico es el mecanismo de integración: el nodo de ComfyUI no carga los modelos dentro del proceso Python de ComfyUI, sino que se comunica con un servicio aislado incluido en el paquete de integración para Windows. Esa separación permite mantener los pesos fuera del ciclo de vida de ComfyUI, algo relevante cuando el conjunto de archivos supera los 24 GB. El repositorio fija revisiones concretas de los modelos de origen y publica hashes SHA-256, lo que aporta trazabilidad sobre qué versión exacta de cada componente se está ejecutando.

## Capacidades

- Generación de voz (text-to-speech) en chino e inglés.
- Clonación de voz, según las etiquetas declaradas por el autor del repositorio.
- Edición de habla sobre audio existente, mediante el componente `AuK`.
- Generación rápida en cuatro pasos con `AuK-Flash`, pensada para iteración ágil.
- Comprensión de instrucciones en lenguaje natural mediante `Qwen2.5-Omni-3B`, que actúa como intérprete de las peticiones del usuario.
- Integración como nodo de ComfyUI, lo que permite encadenar la síntesis de voz con otros nodos del grafo (generación de imagen, vídeo, postprocesado de audio).
- Soporte de ejecución local a través de un servicio aislado, sin depender de una API externa.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, visión, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Localización de contenido audiovisual zh↔en**: el modelo cubre exactamente los dos idiomas declarados, de modo que un creador puede generar una pista de voz en chino para un vídeo pensado originalmente en inglés, o al revés, manteniendo el flujo dentro de ComfyUI.
- **Clonación de voz para audiolibros y narración**: a partir de una muestra de referencia, se puede generar narración extensa con una voz consistente, integrándola en un grafo de ComfyUI que también procese portadas o ilustraciones.
- **Edición de voz en postproducción**: el componente `AuK` permite modificar fragmentos de una locución (corregir una palabra mal pronunciada, cambiar una frase) sin regrabar toda la toma, reduciendo el coste de iteración en estudios pequeños.
- **Generación rápida para previsualización**: con `AuK-Flash` y sus cuatro pasos de generación, es viable producir borradores de voz en cuestión de pocos pasos para validar guiones o ritmos antes de una síntesis de mayor calidad.
- **Prototipado de asistentes conversacionales con voz**: combinando el TTS con los nodos de audio de ComfyUI se puede construir un prototipo de respuesta hablada para un asistente, útil en fases de validación de producto antes de invertir en infraestructura de producción.
- **Avisos y mensajes pregrabados dinámicos**: centralitas telefónicas, sistemas de megafonía o aplicaciones de accesibilidad que necesiten generar mensajes de voz variables en chino o inglés sin recurrir a un actor de doblaje.
- **Accesibilidad de contenido escrito**: lectura en voz alta de documentos o artículos, con la posibilidad de elegir una voz clonada que resulte familiar al usuario.
- **Investigación en síntesis de voz**: al fijar revisiones concretas de los pesos y publicar hashes, el repositorio sirve como base reproducible para experimentos comparativos de TTS y edición de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los resultados de la búsqueda web facilitados no contenían ningún dato relevante sobre el modelo: correspondían a páginas de servicios de mapas sin relación con el repositorio. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de síntesis de voz como WER, MOS, similitud de hablante o latencia por segundo de audio generado.

## Requisitos de hardware

- **Espacio en disco**: 24,9 GB para el repositorio completo, incluyendo los tres componentes y el manifiesto.
- **VRAM**: no documentada por el autor. Como referencia orientativa, cargar simultáneamente un modelo de voz base, su variante rápida y un modelo multimodal de 3B en precisión de 16 bits sugiere un consumo en el rango de 10 a 20 GB, pero es una estimación derivada del tamaño de los archivos y no una cifra confirmada. Conviene tratar cualquier planificación de recursos como provisional hasta medirlo en el sistema objetivo.
- **GPU recomendadas**: no disponibles. No se especifica ningún modelo de GPU en la documentación.
- **Viabilidad en GPU de consumo**: no confirmada. El servicio aislado podría cargar los componentes bajo demanda en lugar de todos a la vez, lo que reduciría el pico de memoria, pero esto no está documentado.
- **Opciones de despliegue**: nodo de ComfyUI **AuK Local · T8star-Aix**, instalable desde ComfyUI Manager o clonando el repositorio `T8mars/Comfyui-Auk-T8`, junto con el servicio aislado incluido en el paquete de integración para Windows alojado en Quark. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- **Latencia y throughput**: no disponibles. La única referencia es que `AuK-Flash` genera en cuatro pasos, sin cifras de tiempo por segundo de audio.
- **Sistema operativo**: el paquete de integración publicado es exclusivamente para Windows.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones ni resultados de modelos comparables, por lo que la comparación cuantitativa no está disponible. A continuación se recogen alternativas de la misma categoría funcional (síntesis de voz y clonación) junto con los datos que sí pueden contrastarse de forma general; los campos marcados como no disponibles no se han podido verificar con la información de esta ficha.

| Modelo | Tipo | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| t8star/Auk-Comfy (este repositorio) | Paquete de TTS, clonación y edición de voz sobre ComfyUI | zh, en | other | No disponible |
| tencent/AuK y tencent/AuK-Flash (origen) | Modelos de voz que este repositorio empaqueta | No disponible | No disponible en esta ficha | No disponible |
| Coqui XTTS-v2 | TTS multilingüe con clonación por muestra | Multilingüe | Licencia propia de Coqui, con restricciones de uso comercial | No disponible |
| F5-TTS | TTS con clonación, orientado a inferencia ligera | No disponible | No disponible en esta ficha | No disponible |
| CosyVoice 2 | TTS multilingüe con control por instrucciones | Chino e inglés, entre otros | No disponible en esta ficha | No disponible |

Ninguna de las cifras de parámetros, contexto o benchmarks de las alternativas se ha verificado con las fuentes facilitadas. Si se necesita una comparación rigurosa, habría que consultar las model cards de cada alternativa directamente.

## Limitaciones y advertencias

- **Alcance real del repositorio**: no es un modelo entrenado por t8star, sino un espejo de pesos de terceros. Cualquier problema de calidad, sesgo o licencia proviene de los modelos de origen.
- **Licencia `other`**: es una licencia personalizada, no una licencia abierta estándar. Antes de un uso comercial hay que revisar la licencia de cada subcarpeta (Tencent y Qwen) y, en particular, las condiciones de clonación de voz, que suelen restringir la suplantación de identidad y el uso de voces de terceros sin consentimiento.
- **Riesgo de uso indebido de la clonación de voz**: la capacidad de clonar voces exige consentimiento explícito del hablante y cumplimiento de la normativa aplicable sobre deepfakes y suplantación de identidad.
- **Idiomas limitados**: solo chino e inglés. No hay soporte declarado de castellano, lo que reduce su utilidad directa para audiencias hispanohablantes.
- **Sesgos**: no documentados. No hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de equidad entre acentos, géneros o edades.
- **Alucinación y artefactos**: no hay datos publicados sobre tasa de errores de pronunciación, alucinación de contenido en la edición de habla o degradación con audios de referencia ruidosos.
- **Madurez y adopción**: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son del 13 de septiembre de 2026, con apenas veinte minutos entre ambas. Se trata de una publicación muy reciente y sin validación por parte de la comunidad.
- **Dependencia de un paquete externo**: la vía de despliegue documentada pasa por un paquete de Windows alojado en Quark y por un servicio propietario del autor del nodo. Esto añade una dependencia de terceros no auditable desde el propio repositorio de HuggingFace.
- **Sin soporte multiplataforma documentado**: no se describe funcionamiento en Linux ni en macOS.
- **Integridad**: el `MODEL_MANIFEST.json` incluye hashes SHA-256, por lo que se recomienda verificarlos tras la descarga antes de ejecutar los modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t8star/Auk-Comfy
- Perfil del autor: https://huggingface.co/t8star
- Modelo de origen AuK: https://huggingface.co/tencent/AuK
- Modelo de origen AuK-Flash: https://huggingface.co/tencent/AuK-Flash
- Modelo de origen Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Nodos de ComfyUI: https://github.com/T8mars/Comfyui-Auk-T8
- Paquete de integración para Windows: https://pan.quark.cn/s/264edb7e36bd
- Bilibili: https://space.bilibili.com/385085361
- YouTube: https://www.youtube.com/@T8star-Aix/
- API: https://api.seedance.nz/sign-up?aff=5f4w
- Aplicaciones en línea: https://www.runninghub.ai/zh-cn/user-center/1907375370302308353/userPost?inviteCode=rh-v1121
