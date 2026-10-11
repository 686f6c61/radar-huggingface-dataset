# Zyszztggd/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF es una redistribución de cuantizaciones GGUF del ajuste fino homónimo publicado por DavidAU, subida por el usuario Zyszztggd. Se trata de un modelo de lenguaje de 26.895.998.464 parámetros (unos 26,9 B) derivado de la familia Qwen 3, ajustado mediante un proceso que el autor describe como multi-stage fine-tune y multi-stage merge, y sometido además a técnicas de desalineación de rechazos (etiquetas "heretic", "abliterated", "uncensored", "ara"). El repositorio incluye tanto cuantizaciones GGUF convencionales como variantes "MTP" (multi-token prediction).

El problema que declara resolver es doble. Por un lado, la reducción del consumo de tokens de razonamiento: el autor afirma que las cinco modalidades de razonamiento del modelo emplean entre la mitad y una vigésima parte de los tokens de "thinking" respecto a Qwen 3.8 27B, y que sus cinco modos de instrucción no generan tokens de razonamiento en absoluto. Por otro, el incremento de capacidad declarada en la prueba ARC-Challenge, con 699 puntos en cuantización de 8 bits y 692 en 4 bits, cifras que el propio autor sitúa en la "zona de inteligencia" de modelos cerrados.

Es relevante ahora porque ejemplifica una tendencia concreta en el ecosistema abierto: ajustes finos orientados a escritura creativa y rol, cuantizados para hardware de consumo, con control de modo conversacional conmutable en caliente y sin capas de rechazo. Conviene subrayar que el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, que todas las cifras citadas proceden del material promocional del autor y no han sido verificadas de forma independiente, y que la fecha de creación registrada (2026-10-10) es posterior a la fecha actual, lo que sugiere metadatos anómalos o de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; pertenece a la familia Qwen 3 (transformer), sin confirmación de si es densa o MoE |
| Parámetros totales | 26.895.998.464 (≈26,9 B), dato real de safetensors |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF "Regular" y GGUF "MTP"; la model card menciona explícitamente 4 bits (Q4KS, no imatrix) y 8 bits, además de bfloat16 como precisión de origen |
| Idiomas soportados | Inglés (en) y chino (zh), según los metadatos |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (el repositorio contiene solo cuantizaciones); el modelo base se distribuye en safetensors/bfloat16 |
| Pipeline declarado | image-text-to-text (etiqueta del repositorio; no confirmada por la model card, que describe un modelo de texto) |
| Autor del ajuste original | DavidAU (el repositorio analizado es una resubida de Zyszztggd) |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored |
| Conjuntos de datos declarados | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets, DavidAU/THE-DECKARD-Datasets |
| Tamaño del repositorio | 337,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-10T22:44:44.000Z (sin actualizaciones posteriores) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen 3 y de la etiqueta `qwen3_8`, junto con referencias secundarias a Qwen 3.6 y Qwen 3.5 en las etiquetas del repositorio. No se especifica número de capas, dimensión oculta, tipo de atención ni si se emplea mezcla de expertos. Dado que el recuento de parámetros es de 26,9 B y el autor compara el modelo con arquitecturas como Qwen3.6-35B-A3B (explícitamente MoE por su nomenclatura A3B), no hay base para afirmar que esta variante sea dispersa. Tampoco se documentan la longitud de contexto nativa ni el tamaño del vocabulario.

El proceso de entrenamiento se describe como "multi-stage fine tune, multi-fine tune y multi-stage merge", ejecutado con Unsloth sobre hardware de consumo y empleando los métodos que el autor denomina COLD FUSION y FABLE FUSION 711. El ajuste parte de los tres conjuntos de datos de DavidAU citados. La capa de desalineación de rechazos se atribuye a técnicas de tipo "abliteration", con la etiqueta "heretic" asociada a herramientas de decensurado automático, y "ara" como etiqueta adicional de la familia. La model card menciona además cinco modos de razonamiento (dos nuevos: "Spoon" y "Einstein") y cinco modos de instrucción, conmutables en caliente mediante API o directamente en el mensaje. No se publican cifras de tokens de entrenamiento, composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento ("thinking") activable y cinco modalidades de razonamiento declaradas: las habituales más "Spoon" y "Einstein".
- Cinco modos de instrucción sin generación de tokens de razonamiento, pensados para respuestas directas y de bajo coste en tokens.
- Reducción declarada del consumo de tokens de pensamiento de entre 1/2 y 1/20 respecto a Qwen 3.8 27B, manteniendo, según el autor, el detalle de la salida.
- Escritura creativa y narrativa: ficción, relato largo, control de arcos de personaje, foreshadowing y estructura en tres actos, según las afirmaciones de la model card.
- Roleplaying y diálogo conversacional multi-turno.
- Generación de código (etiquetas "coder" y "all use cases").
- Capacidad multimodal declarada por la etiqueta de pipeline `image-text-to-text`; no hay documentación que la respalde.
- Multilingüismo limitado a inglés y chino según los metadatos del repositorio.
- Sin capas de rechazo efectivas: el modelo está etiquetado como "uncensored", "abliterated" y "heretic", por lo que no se espera que decline peticiones que otros modelos alineados rechazarían.
- Control de modo en el propio mensaje ("in chat"), además de vía API.

## Casos de uso

- Escritura creativa de ficción larga: el modelo está ajustado específicamente para mantener arcos narrativos y coherencia de trama a lo largo de decenas de miles de palabras, lo que lo hace adecuado para redactar novelas por capítulos o serializar relatos manteniendo continuidad de personajes.
- Roleplaying y narrativa interactiva: los cinco modos de razonamiento y los cinco de instrucción permiten alternar entre respuestas rápidas sin tokens de pensamiento y respuestas más elaboradas dentro de la misma conversación, algo útil en aplicaciones de personajes persistentes.
- Generación de código en pipelines de desarrollo: las etiquetas "coder" y "all use cases" apuntan a uso como asistente de código; en producción conviene validar la salida con tests automáticos, dado que no hay benchmarks de código publicados que respalden la calidad.
- Reescritura y edición de estilo: la orientación del ajuste hacia el detalle y el ritmo narrativo permite emplearlo como editor de prosa que reescribe pasajes manteniendo la voz del autor original.
- Generación de contenido sin restricciones temáticas: para proyectos de ficción adulta, terror explícito o temas que los modelos alineados rechazan, el decensurado es precisamente el motivo de elección; esto implica asumir el riesgo legal y reputacional derivado.
- Despliegue en local sobre hardware de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en una GPU de 24 GB en cuantizaciones de 4 y 5 bits, lo que permite uso sin conexión y sin coste de API.
- Experimentación en investigación sobre alineación y desalineación: el repositorio es un ejemplo documentado de aplicación de abliteration sobre un modelo base, útil para estudiar cómo cambian las distribuciones de salida al eliminar la dirección de rechazo.
- Prototipado de asistentes conversacionales multilingües en inglés y chino, siempre que el alcance se limite a esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. Las únicas cifras presentes proceden de la model card del autor y se reproducen a continuación tal cual, sin verificación independiente:

| Benchmark | Versión analizada (Ultra Heretic) | Variante L-Uncensored | Notas |
|---|---|---|---|
| ARC-Challenge (8 bits) | 699 | 709 | Cifra declarada por el autor |
| ARC-Challenge (4 bits) | 692 | 701 | Cifra declarada por el autor |
| Comparación con Qwen 3.8 27B | +108 puntos declarados | No disponible | Sin desglose por prueba |
| Comparación con Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | "Supera las 7 pruebas críticas" | No disponible | Las siete pruebas no se nombran ni se cuantifican |
| MMLU, HumanEval, GSM8K, MT-Bench | No disponible | No disponible | No publicados |

No se dispone de datos de rendimiento en código, matemáticas, seguimiento de instrucciones ni evaluación multilingüe. Las afirmaciones sobre la "zona de inteligencia" de modelos cerrados corresponden al autor y carecen de respaldo metodológico en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado de 26,9 B de parámetros, sin incluir caché KV): Q3_K_M ≈ 13 GB; Q4_K_M ≈ 16-17 GB; Q5_K_M ≈ 18-19 GB; Q6_K ≈ 22 GB; Q8_0 ≈ 28-29 GB; bfloat16 ≈ 54 GB.
- La caché KV para contexto largo añade entre 1 y 4 GB adicionales según la longitud de contexto configurada, que no está documentada.
- GPU de consumo: una RTX 4090, RTX 3090 o RTX 5090 con 24 GB puede ejecutar cuantizaciones Q4 y Q5 con contexto moderado; Q6_K entra de forma ajustada; Q8_0 no cabe en una sola GPU de 24 GB.
- GPU profesionales: Q8_0 requiere una A100 40 GB, A6000 48 GB o superior; bfloat16 requiere H100 80 GB o múltiples GPU.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI ofrecen soporte de GGUF limitado o experimental, por lo que no se recomiendan como primera opción para este repositorio.
- El repositorio ocupa 337,1 GB, por lo que la descarga completa es poco práctica en disco de consumo; conviene descargar únicamente el archivo de cuantización necesario.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-C declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Zyszztggd, Ultra Heretic, GGUF) | 26,9 B | No disponible | 699 (8 bits) / 692 (4 bits) | apache-2.0 | GGUF en HuggingFace, 0 descargas |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 26,9 B (presumiblemente) | No disponible | 709 (8 bits) / 701 (4 bits) | No disponible | Versión original, presumiblemente más descargada |
| Qwen 3.8 27B (base) | 27 B | No disponible | 108 puntos por debajo según el autor | No disponible | Modelo de referencia citado por el autor |
| Qwen3.6-35B-A3B | 35 B totales (MoE) | No disponible | No disponible | No disponible | Citado como superado, sin cifras |

No se han encontrado en la información disponible resultados comparativos independientes frente a modelos de la misma categoría (por ejemplo, Llama 3.x 27-34B, Mistral Small, Gemma 2 27B o Qwen 2.5 32B). Los nombres "Qwen 3.8", "Qwen 3.6" y "Qwen 3.5" no corresponden a nomenclatura estándar publicada, por lo que la comparativa debe tomarse como declarativa.

## Limitaciones y advertencias

- Modelo explícitamente decensurado y abliterado: no incorpora capas de rechazo, por lo que puede generar contenido ilegal, dañino, violento o sexualmente explícito. Existe riesgo real de uso indebido y de responsabilidad legal para quien lo despliega.
- Las técnicas de abliteration degradan típicamente la coherencia y la seguridad del modelo; no hay evaluaciones publicadas que cuantifiquen ese coste en esta variante concreta.
- Riesgo elevado de alucinación: no hay benchmarks de fidelidad factual, y el ajuste está orientado de forma prioritaria a la generación creativa antes que a la precisión.
- Todas las cifras de rendimiento proceden del material promocional del autor. No hay verificación por terceros, ni replicación, ni evaluación en un harness estándar (lm-evaluation-harness u similar).
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado y no debería asumirse.
- Longitud de contexto no documentada: no se puede planificar un despliegue con ventanas largas sin medirla empíricamente.
- Licencia apache-2.0 declarada en este repositorio, pero la cadena de licencias del modelo base y de los conjuntos de datos de DavidAU no se detalla; conviene verificar los términos del modelo original antes de uso comercial.
- El repositorio lo publica un tercero (Zyszztggd) y no el autor del ajuste (DavidAU). No hay garantía de que las cuantizaciones correspondan al modelo base declarado; conviene comparar hashes con el repositorio original.
- Sin validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones que permitan detectar problemas de calidad en las cuantizaciones.
- Metadatos anómalos: fecha de creación 2026-10-10, pipeline declarado `image-text-to-text` en un repositorio GGUF de un modelo descrito como de texto. Estos indicios sugieren que la ficha puede ser de prueba o incorrecta.
- La etiqueta `image-text-to-text` implica supuesta capacidad de visión que la model card no documenta; no se debe asumir entrada de imágenes sin verificarla.
- Los pesos en safetensors del modelo original no están en este repositorio: solo hay GGUF, por lo que no se puede volver a fusionar ni cuantizar a otras precisiones desde aquí.

## Enlaces

- Repositorio analizado: https://huggingface.co/Zyszztggd/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante menos decensurada, mayor rendimiento declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Conjuntos de datos citados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets, https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets, https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a hilos de Zhihu sobre Pinterest y no guardan relación con el objeto de la ficha. No hay papers, blogs, repositorios de código ni demos adicionales disponibles.
