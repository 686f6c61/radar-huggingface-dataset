# Yoram-Jacobs/Gemma-4-E4B-it

## Resumen

Gemma 4 E4B es la variante compacta de la cuarta generación de la familia Gemma de Google DeepMind, distribuida con licencia Gemma y orientada a ejecución local. Según gemma4.dev, la variante E4B cuenta con 4,4 mil millones de parámetros y un requisito mínimo de 8 GB de VRAM, con entrada multimodal y un modo de razonamiento explícito ("Thinking Mode"). El catálogo de Microsoft Foundry añade que la familia Gemma 4 soporta ventanas de contexto de hasta 256 000 tokens y mantiene soporte multilingüe en más de 140 idiomas, con arquitecturas tanto densas como de mezcla de expertos (MoE) repartidas en cuatro tamaños: E2B, E4B, 26B A4B y 31B.

La ficha que nos ocupa, Yoram-Jacobs/Gemma-4-E4B-it, es una reproducción alojada por un usuario tercero y no la publicación oficial. El repositorio no incluye model card más allá de la declaración de licencia, registra 0 descargas y 0 "likes", y no declara idiomas, pipeline ni formato de pesos. Por tanto, toda la información técnica utilizable procede de las fuentes oficiales y de terceros sobre Gemma 4 E4B, no del repositorio en sí.

Su relevancia actual reside en la combinación de tamaño reducido, multimodalidad, modo de razonamiento y contexto muy largo en un paquete que, según la documentación de la familia, cabe en GPU de consumo con 8 GB de VRAM. Eso lo sitúa como candidato para despliegues on-premise y flujos agénticos donde la latencia, el coste por token o la soberanía del dato impiden usar API propietarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | La familia Gemma 4 combina arquitecturas densas y de mezcla de expertos (MoE) según Microsoft Foundry; no se especifica cuál de ellas corresponde a la variante E4B |
| Parámetros totales | 4,4 mil millones (dato de gemma4.dev para la variante E4B) |
| Parámetros activos | No disponible (no se confirma en las fuentes consultadas que la variante E4B sea MoE) |
| Longitud de contexto | Hasta 256 000 tokens según el catálogo de Microsoft Foundry (dato de familia) |
| Tipos de cuantización | No disponible en detalle; la publicación del modelo en la librería de Ollama implica disponibilidad en formato GGUF cuantizado, sin que se listen los niveles concretos |
| Idiomas soportados | Más de 140 idiomas según el catálogo de Microsoft Foundry (dato de familia); no se detalla el listado ni el rendimiento relativo por idioma |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | No disponible en el repositorio Yoram-Jacobs; Ollama distribuye el modelo en formato GGUF |
| Modalidades de entrada | Texto e imagen (entrada multimodal según gemma4.dev); no se detallan resoluciones, formatos ni modalidades adicionales |
| Modo de razonamiento | Thinking Mode según gemma4.dev |
| Requisito mínimo declarado de VRAM | 8 GB según gemma4.dev |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la variante E4B. Lo único documentado es que la familia Gemma 4 emplea arquitecturas densas y de mezcla de expertos (MoE) en sus cuatro tamaños (E2B, E4B, 26B A4B y 31B), sin que las fuentes consultadas indiquen qué configuración concreta usa E4B, ni el número de capas, la dimensión del modelo, el tipo de atención o si incorpora mecanismos de atención lineal o híbridos. Tampoco se especifica el tamaño de la ventana de contexto en la práctica de entrenamiento, más allá del límite operativo de 256 000 tokens declarado para la familia.

No hay datos publicados en la información consultada sobre volumen de tokens de entrenamiento, composición del dataset, fases de ajuste (supervisado, RLHF o DPO) ni proceso de alineación. La única capacidad de inferencia destacable documentada es el "Thinking Mode", un modo de razonamiento extendido que el modelo activa para tareas que requieren pasos intermedios, y la entrada multimodal (texto e imagen). Cualquier afirmación adicional sobre innovaciones técnicas —decodificación especulativa, destilación, MatFormer u otras— no está respaldada por las fuentes disponibles y no debe darse por supuesta.

## Capacidades

- Generación de texto y razonamiento: la familia está descrita por Ollama como adecuada para razonamiento, flujos agénticos, código y comprensión multimodal.
- Modo de razonamiento explícito (Thinking Mode), descrito por gemma4.dev como capacidad diferenciadora de la variante E4B.
- Entrada multimodal: acepta imágenes además de texto según gemma4.dev; no se especifican tareas concretas de visión (OCR, VQA, grounding) ni su precisión.
- Flujos agénticos y multi-paso: Ollama posiciona la familia como apta para "agentic workflows", lo que implica uso en cadenas de herramientas y razonamiento secuencial.
- Generación de código: incluida explícitamente entre los casos de uso declarados por Ollama y Microsoft Foundry.
- Soporte multilingüe en más de 140 idiomas (dato de familia, Microsoft Foundry), sin detalle de cobertura por idioma ni evaluación publicada.
- Contexto largo de hasta 256 000 tokens (dato de familia, Microsoft Foundry) para entrada de documentos extensos o bases de código completas.
- Soporte de tool calling / function calling: no confirmado explícitamente en las fuentes consultadas; la mención a flujos agénticos es indicativa, pero no constituye especificación formal.

## Casos de uso

- Asistente local en estación de trabajo: con 8 GB de VRAM mínimos según gemma4.dev, el modelo puede ejecutarse en una GPU de consumo y mantener un asistente conversacional sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos con imágenes: gracias a la entrada multimodal y a la ventana de 256 000 tokens, se pueden procesar informes con gráficos, capturas de pantalla o diagramas junto con el texto asociado, en una sola pasada de contexto.
- Procesamiento de bases de código extensas: la ventana de contexto larga permite cargar varios archivos o un repositorio de tamaño medio para tareas de revisión, explicación o generación de parches sin recurrir a fragmentación agresiva.
- Automatización agéntica en pipelines internos: Ollama describe la familia como apta para flujos agénticos, de modo que E4B puede actuar como planificador o ejecutor de pasos intermedios en herramientas de CI/CD, clasificación de incidencias o enriquecimiento de datos.
- Razonamiento asistido con Thinking Mode: para tareas de lógica, matemáticas aplicadas o depuración de errores donde interesa que el modelo explicite los pasos intermedios antes de dar la respuesta final.
- Atención al cliente multilingüe: con soporte declarado en más de 140 idiomas y contexto largo, el modelo puede gestionar conversaciones multi-turno con historial extenso y usuarios en distintos idiomas sin cambiar de modelo.
- Despliegue on-premise o en edge: al caber en GPU de consumo y distribuirse vía Ollama en formato GGUF, es viable en equipos de desarrollo, servidores pequeños o entornos aislados de red.
- Prototipado rápido de aplicaciones multimodales: permite validar productos que combinan texto e imagen antes de escalar a variantes mayores (26B A4B o 31B) de la misma familia, manteniendo la licencia y el ecosistema de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las fuentes consultadas (Hugging Face, Google DeepMind, gemma4.dev, Ollama, Microsoft Foundry) no incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones de seguridad o sesgo para la variante E4B. No se deben extrapolar resultados de otras variantes de la familia sin datos explícitos.

## Requisitos de hardware

- VRAM mínima declarada: 8 GB según gemma4.dev para la variante E4B. Es el único dato de hardware confirmado en las fuentes consultadas.
- GPU de consumo: con 8 GB de VRAM como umbral, el modelo sería ejecutable en tarjetas de gama media-alta de consumo; la información consultada indica explícitamente que "runs on any modern consumer GPU", sin enumerar modelos concretos.
- GPU de centro de datos: no disponible. No se documentan requisitos ni rendimiento en A100, H100 u otras aceleradoras profesionales.
- Opciones de despliegue confirmadas: Ollama, que publica el modelo bajo la etiqueta gemma4:e4b.
- Otras opciones de despliegue (vLLM, llama.cpp, TGI, transformers): no confirmadas en la información disponible, aunque la distribución en GGUF a través de Ollama es compatible con el ecosistema llama.cpp.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

Solo se dispone de datos de la propia familia Gemma 4. No hay información suficiente en las fuentes consultadas para comparar con alternativas externas de tamaño similar.

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B | 4,4 mil millones | Hasta 256 000 tokens (dato de familia) | No especificada para esta variante; la familia incluye densa y MoE | Gemma | Ollama (gemma4:e4b), Hugging Face, Microsoft Foundry |
| Gemma 4 E2B | No disponible | No disponible | No disponible | Gemma | No confirmada en las fuentes consultadas |
| Gemma 4 26B A4B | No disponible | No disponible | No disponible (el sufijo A4B sugiere parámetros activos, sin confirmar) | Gemma | No confirmada en las fuentes consultadas |
| Gemma 4 31B | No disponible | No disponible | No disponible | Gemma | No confirmada en las fuentes consultadas |
| Alternativas de otros fabricantes (mismo rango de tamaño) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Procedencia del repositorio: Yoram-Jacobs/Gemma-4-E4B-it es una reproducción de terceros, no la publicación oficial de Google. No incluye model card, no declara pipeline, idiomas ni formato de pesos, y acumula 0 descargas y 0 "likes". No hay verificación comunitaria de que los pesos coincidan con el modelo original ni de su integridad.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación para esta variante. Como en cualquier modelo generativo, la salida debe validarse en aplicaciones sensibles.
- Sesgos: no se han publicado análisis de sesgo, evaluaciones de equidad ni auditorías de seguridad para E4B en la información disponible.
- Limitaciones idiomáticas: aunque se declaran más de 140 idiomas a nivel de familia, no hay datos de rendimiento por idioma. El rendimiento en lenguas distintas del inglés puede degradarse, y no hay evaluación específica para castellano.
- Límites del contexto largo: el techo de 256 000 tokens es un dato de familia; no se documenta la degradación de la recuperación de información en posiciones intermedias o al final de contextos muy extensos.
- Capacidades multimodales sin especificar: no se detallan tareas de visión soportadas, resolución de imagen, ni límites prácticos de número de imágenes por petición.
- Tool calling no confirmado: la aptitud para flujos agénticos se menciona de forma genérica, sin especificación de formato de herramientas ni resultados de evaluación.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma y a su política de uso prohibido, que imponen obligaciones de cumplimiento y restricciones de uso. Es responsabilidad del integrador revisar dichos términos antes de desplegar en producción.
- Requisito de hardware condicionante: 8 GB de VRAM es el mínimo declarado; en cuantizaciones altas o con contexto muy largo el consumo real de memoria puede exceder ese umbral, y no se han publicado mediciones al respecto.
- Ausencia de benchmarks: sin cifras públicas no es posible comparar objetivamente esta variante con alternativas del mismo rango de tamaño antes de invertir en su integración.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/Yoram-Jacobs/Gemma-4-E4B-it
- Repositorio oficial de Google: https://huggingface.co/google/gemma-4-E4B
- Página oficial del modelo en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Análisis y ficha técnica de terceros: https://gemma4.dev/models/gemma-4-e4b
- Librería de Ollama: https://ollama.com/library/gemma4:e4b
- Catálogo de Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/google--gemma-4-e4b-it
