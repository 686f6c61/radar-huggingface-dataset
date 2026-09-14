# Timegravity/tamil-lm-2b-gguf

## Resumen

Timegravity/tamil-lm-2b-gguf es un repositorio de distribución publicado por Timegravity Labs Private Limited (Coimbatore, India) que agrupa los ficheros cuantizados y los paquetes de conocimiento que consume la aplicación Android Timegravity Tamil. No se trata de un único modelo, sino de un contenedor con: la cuantización Q4_K_M de tamil-lm-2b-instruct (ronda 4c, convertida con una versión fijada de llama.cpp), conversiones GGUF de Qwen3.5 2B y 4B, un proyector de visión mmproj en Q8_0 y un directorio `packs/` con bases SQLite FTS5.

El modelo principal, tamil-lm-2b-instruct, cuenta con 1.987.666.240 parámetros (unos 1,99 mil millones) según los pesos publicados en safetensors y está construido sobre Qwen/Qwen3.5-2B-Base. El repositorio completo ocupa 5,9 GB e incluye ficheros con licencias distintas según su origen, motivo por el que la licencia declarada es `other` con el identificador compuesto `apache-2.0-and-cc-by-sa-4.0`.

Su relevancia es doble. Por un lado, es un ejemplo de despliegue de un modelo conversacional de ~2B parámetros en un dispositivo Android, con cuantización Q4_K_M y un proyector de visión. Por otro, documenta con detalle la trazabilidad de licencias de los paquetes de conocimiento derivados de fuentes CC BY-SA 4.0, incluidas las salvedades sobre contenidos de Wikisource en tamil y 26 pasajes de epfo.gov.in que no se relicencian bajo CC BY-SA. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos derivan de Qwen/Qwen3.5-2B-Base; no se detalla en la model card) |
| Parametros totales | 1.987.666.240 (aproximadamente 1,99 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tamil-lm-2b-instruct y Qwen3.5 2B/4B); Q8_0 (proyector de visión mmproj) |
| Idiomas soportados | no disponible (el repositorio está orientado al tamil; las fuentes de los packs incluyen tamil e inglés) |
| Licencia | other (`apache-2.0-and-cc-by-sa-4.0`): Apache 2.0 para los pesos GGUF, CC BY-SA 4.0 para el contenido de `packs/` |
| Formato de pesos | GGUF (modelos); SQLite FTS5 (paquetes de conocimiento) |
| Tamaño del repositorio | 5,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-14 / 2026-09-14 |
| Pipeline declarado | no disponible |
| Etiquetas | gguf, license:other, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo principal: no se indica si es un transformer denso, una mezcla de expertos, un modelo de espacio de estados o una arquitectura híbrida, ni el número de capas, cabezas de atención o dimensión oculta. Lo único documentado es que tamil-lm-2b-instruct y tamil-lm-2b-base se construyen sobre Qwen/Qwen3.5-2B-Base, con licencia Apache 2.0, y que el fichero publicado corresponde a la "ronda 4c" del modelo instruct, cuantizada en Q4_K_M tras la conversión con una versión fijada de llama.cpp.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF, DPO u otras técnicas de alineamiento. El elemento diferencial del repositorio no es una innovación arquitectónica, sino el empaquetado orientado a inferencia local en Android: cuantización GGUF reproducible con una revisión concreta de llama.cpp, un proyector multimodal (`mmproj/tamil-lm-2b-instruct-mmproj-q8_0.gguf`) descrito como parte de la ruta de visión de Qwen 3.5 2B, y paquetes de conocimiento en SQLite FTS5 con atribución por pasaje (título y URL del artículo de origen) como mecanismo de cumplimiento de la licencia CC BY-SA 4.0.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica un ajuste orientado a diálogo; se declara el uso de un modelo instruct.
- Cuantización lista para inferencia local: el fichero Q4_K_M está pensado para ejecutarse con llama.cpp en dispositivos con recursos limitados.
- Ruta multimodal: se incluye un proyector de visión (`mmproj`) en Q8_0 asociado a la ruta de visión de Qwen 3.5 2B.
- Recuperación de conocimiento local: los packs de `packs/` son bases SQLite FTS5 con búsqueda de texto completo sobre pasajes procedentes de Wikipedia, Wikibooks y Wiktionary en tamil e inglés.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con despliegues de tipo API de inferencia.
- Distribución multilingüe de pesos: el repositorio incluye además Qwen3.5 2B y 4B en Q4_K_M, lo que permite comparar dos tamaños bajo el mismo formato.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en Android: es el caso de uso declarado por el autor; el modelo Q4_K_M está pensado para ejecutarse en el propio dispositivo con llama.cpp, sin depender de conectividad ni de servidores externos.
- Búsqueda aumentada sin conexión sobre corpus en tamil: los packs SQLite FTS5 permiten recuperar pasajes por coincidencia de texto completo y pasarlos como contexto al modelo, evitando consultas a la red en entornos con conectividad limitada.
- Atención al cliente en tamil en zonas con mala cobertura: un asistente local puede responder consultas frecuentes sobre trámites y servicios usando el pack de finanzas, que incorpora pasajes de epfo.gov.in.
- Procesamiento de imágenes con descripción en tamil: mediante el proyector de visión mmproj, el sistema puede abordar tareas de descripción de imágenes o apoyo a la lectura de documentos sobre la ruta de Qwen 3.5 2B.
- Distribución de modelos en entornos con requisitos de atribución estrictos: los packs están diseñados para ser redistribuibles bajo CC BY-SA 4.0 con atribución por pasaje, lo que sirve de referencia para equipos que necesiten cumplir share-alike en productos derivados.
- Referencia de reproducibilidad para conversión GGUF: al fijar una revisión concreta de llama.cpp, el repositorio permite reproducir la cuantización y auditar diferencias entre conversiones.
- Prototipado de clasificación, resumen o extracción sobre textos en tamil: con un modelo de ~1,99B parámetros cabe esperar un coste de inferencia bajo, adecuado para tareas acotadas y de alto volumen.
- Evaluación comparativa de tamaños 2B frente a 4B: los GGUF de Qwen3.5 2B y 4B incluidos permiten medir en el mismo entorno el compromiso entre calidad y consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas para tamil en la model card ni en los metadatos del repositorio, por lo que no es posible comparar el modelo con alternativas en términos cuantitativos.

## Requisitos de hardware

- VRAM estimada solo para pesos del modelo principal (~1,99B parámetros): aproximadamente 1,2–1,5 GB en Q4_K_M, 2,1–2,4 GB en Q8_0 y 4,0 GB en FP16. Son estimaciones derivadas del número de parámetros y del ancho de bits de cada cuantización, no cifras publicadas por el autor.
- Memoria adicional: hay que sumar la caché KV y el overhead del runtime (del orden de 0,5–1 GB con contextos moderados en Q4_K_M). La longitud de contexto real no está documentada, así que el consumo máximo no puede calcularse con precisión.
- GPU recomendadas: no se requieren aceleradores de centro de datos. Una RTX 3060, RTX 4060 o superior ejecutan el modelo Q4_K_M con holgura. A100 o H100 no aportan ventaja para este tamaño y solo tendrían sentido por motivos de consolidación de infraestructura.
- GPU de gama de entrada: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, GTX 1060 6 GB) puede alojar la cuantización Q4_K_M.
- CPU y dispositivos móviles: al ser GGUF, es viable la inferencia en CPU (x86 o ARM) e incluso en Android mediante enlaces JNI de llama.cpp, que es el escenario al que apunta el repositorio.
- Opciones de despliegue: llama.cpp es la ruta nativa para estos ficheros; también Ollama y LM Studio, que consumen GGUF, además de llama-cpp-python para integración en servicios. vLLM y TGI no son la vía habitual para GGUF y no se documenta soporte específico en la información disponible.
- Tamaño total del repositorio: 5,9 GB, pero repartidos entre el modelo 2B, los GGUF de Qwen3.5 2B y 4B, el proyector mmproj y los packs de conocimiento; ninguna descarga individual pesa eso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los únicos modelos comparables documentados en la información disponible son los que el propio repositorio incluye como conversiones GGUF, todos bajo Apache 2.0. El resto de campos no está publicado.

| Modelo | Parámetros | Contexto | Cuantización incluida | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| tamil-lm-2b-instruct (en este repo) | 1.987.666.240 | no disponible | Q4_K_M | Apache 2.0 | GGUF en este repositorio; pesos originales en Timegravity/tamil-lm-2b-instruct | no disponibles |
| Qwen3.5-2B | no disponible (denominación 2B) | no disponible | Q4_K_M | Apache 2.0 (Copyright 2026 Alibaba Cloud) | GGUF en este repositorio y pesos originales en Qwen/Qwen3.5-2B | no disponibles |
| Qwen3.5-4B | no disponible (denominación 4B) | no disponible | Q4_K_M | Apache 2.0 (Copyright 2026 Alibaba Cloud) | GGUF en este repositorio y pesos originales en Qwen/Qwen3.5-4B | no disponibles |

La diferencia relevante entre los tres es el ajuste: tamil-lm-2b-instruct es un derivado orientado a tamil y a conversación sobre la base de Qwen3.5-2B, mientras que las otras dos entradas son las conversiones directas de los modelos originales. No hay datos de rendimiento que permitan cuantificar la mejora o el deterioro respecto a los modelos base de Qwen.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada en la información disponible, ni generalista ni específica para tamil. Cualquier decisión de producción debería partir de una evaluación propia.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el repositorio, creado y actualizado el mismo día. No hay retroalimentación de terceros ni incidencias reportadas.
- Licencia compuesta y de interpretación cuidadosa: el identificador de licencia es `other` con el valor `apache-2.0-and-cc-by-sa-4.0`. Cada fichero GGUF hereda la licencia de sus pesos de origen, mientras que el contenido de `packs/` es CC BY-SA 4.0. Un uso comercial debe revisarse fichero a fichero.
- Obligación de share-alike en los packs: el contenido derivado de las fuentes CC BY-SA 4.0 debe redistribuirse bajo la misma licencia. La aplicación Timegravity Tamil que los consume es propietaria y no está licenciada bajo CC BY-SA, según aclara la propia model card.
- Revisión de licencia pendiente: las entradas del pack de agricultura procedentes de Wikisource en tamil se incluyen amparadas en una orden del Departamento de Desarrollo Tamil de Tamil Nadu, pero la revisión de licencia en Wikimedia Commons seguía pendiente a 2026-09-14 y las entradas se eliminarán si no se supera.
- Excepción de licencia en el pack de finanzas: 26 pasajes de epfo.gov.in se reproducen al amparo de la política de copyright de EPFO y no se relicencian bajo CC BY-SA. Su reutilización fuera de este contexto requiere verificar las condiciones originales.
- Idiomas no declarados: el campo de idiomas está vacío. El repositorio y sus fuentes apuntan al tamil y al inglés, pero no hay confirmación oficial del alcance multilingüe ni de la calidad fuera del tamil.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar cargas de trabajo con documentos largos o conversaciones extensas.
- Riesgo de alucinación: con ~1,99B parámetros, la generación de hechos, cifras o referencias legales o financieras sin verificación es un riesgo alto, especialmente en dominios regulados como el pack de finanzas.
- Sesgos heredados: al derivar de Qwen/Qwen3.5-2B-Base, el modelo arrastra los sesgos del corpus de entrenamiento de ese modelo base, que no se documenta en esta ficha.
- Ambigüedad del fichero mmproj: el proyector se nombra como `tamil-lm-2b-instruct-mmproj-q8_0.gguf`, pero se describe como proyector para la ruta de visión de Qwen 3.5 2B. Conviene verificar la compatibilidad real entre el proyector y el modelo antes de desplegar la ruta multimodal.
- Arquitectura no documentada: sin datos de arquitectura, contexto ni proceso de entrenamiento, la reproducibilidad del ajuste instruct no es posible a partir de la información publicada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Timegravity/tamil-lm-2b-gguf
- Model card de los pesos instruct: https://huggingface.co/Timegravity/tamil-lm-2b-instruct
- Licencias y fuentes de los packs: https://huggingface.co/Timegravity/tamil-lm-2b-gguf/blob/main/packs/LICENSES.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Origen de los pasajes del pack de finanzas: https://epfo.gov.in
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las entradas devueltas corresponden a la Super Bowl LX y no guardan relación con el repositorio.
