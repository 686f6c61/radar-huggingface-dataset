# Thethirdgodofroblox/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está pensado para aplicaciones agénticas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su arquitectura es un transformer decoder-only con mezcla de expertos (MoE) dispersa y una innovación poco habitual: un bucle de capas compartidas que repite el bloque central del modelo tres veces.

El modelo totaliza 26.200 millones de parámetros, de los cuales 3.400 millones son activos por pasada. Como el bloque central se ejecuta tres veces, el cómputo efectivo por token equivale a unos 5.400 millones de parámetros activos. Cada capa enruta cada token a 8 de 128 expertos, y la atención combina capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto al texto en un espacio oculto compartido que procesa el decodificador.

La ficha que nos ocupa es una cuantización GGUF del modelo base, generada con el pipeline de Unsloth (Unsloth Dynamic 3.0) y publicada por el usuario Thethirdgodofroblox. El repositorio incluye múltiples niveles de cuantización, desde IQ1_S hasta Q8_K_XL, con métricas de divergencia KL frente a la referencia Q8_K_XL, lo que permite elegir el compromiso entre tamaño y fidelidad. El modelo base se distribuye originalmente en un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y bucle de capas compartidas (24 capas, 12 centrales ejecutadas 3 veces) |
| Parámetros totales | 26.200 millones (26.070.390.272 según safetensors) |
| Parámetros activos | 3.400 millones por pasada; ~5.400 millones efectivos por token (3 pasadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL; modelo base en NVFP4 y MXFP8 |
| Idiomas soportados | Inglés y soporte multilingüe general (sin lista cerrada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con 24 capas de decodificador. Las capas de feed-forward son de mezcla de expertos dispersa: cada token se enruta a 8 de 128 expertos por capa. La atención es híbrida, alternando capas locales y globales. La peculiaridad estructural es el bucle: las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de 24 conjuntos de pesos. Según la model card, cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos.

La multimodalidad es nativa. Un vision transformer codifica las imágenes y tanto estas como el texto se proyectan en un espacio oculto compartido que el decodificador procesa conjuntamente. El modelo base se distribuye en precisiones mixtas NVFP4 y MXFP8 en un checkpoint de unos 20 GB, lo que sugiere un entrenamiento orientado a eficiencia numérica en hardware reciente. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO. Tampoco hay detalles sobre la estrategia de alineación o sobre innovaciones de decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Comprensión de imágenes combinada con texto (pipeline image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Uso en sistemas agénticos y de tool-use, según la model card, aunque no se detalla el protocolo de function calling soportado.
- RAG: pensado explícitamente para sistemas de recuperación aumentada.
- Soporte multilingüe general, con inglés como idioma principal.
- Capacidad de fine-tuning e integración en productos de terceros gracias a los pesos abiertos y a la plataforma Tinker.
- No se documentan en la información disponible modos de razonamiento explícito (thinking), audio ni otras modalidades além de texto e imagen.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD o en editores para generar, revisar y explicar código en varios lenguajes, aprovechando su tamaño compacto (3.400 millones de parámetros activos) para mantener latencia baja en inferencia local.
- Atención al cliente multimodal: gestión de conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos; el vision transformer permite interpretar la imagen y responder en el mismo hilo.
- RAG documental con imágenes: indexación de manuales, facturas o informes escaneados y generación de respuestas citando el contenido visual y textual recuperado.
- Agentes de automatización con tool calling: orquestación de tareas multi-paso (consulta de APIs, ejecución de comandos, navegación) en entornos donde se requiere un modelo ligero que quepa en una sola GPU o en un Mac con 32 GB de memoria unificada.
- Despliegue en el borde o en estaciones de trabajo: con cuantizaciones de 8 a 17 GB (IQ1 a Q4), el modelo puede ejecutarse en Apple Silicon de 32 GB o en GPUs consumer de gama alta, lo que habilita asistentes privados sin conexión.
- Prototipado e investigación con fine-tuning: la licencia Apache 2.0 y la disponibilidad de pesos en GGUF y safetensors permiten ajustar el modelo con LoRA o QLoRA sobre dominios específicos (legal, médico, industrial) sin restricciones de uso comercial.
- Análisis de documentos técnicos con diagramas: interpretación conjunta de texto e imágenes en informes de ingeniería, con generación de resúmenes y extracción de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card del repositorio GGUF incluye únicamente métricas de fidelidad de cuantización frente a la referencia UD-Q8_K_XL:

| Cuantización | Tamaño (GB) | KLD media vs UD-Q8_K_XL | Mismo token top-1 |
|---|---|---|---|
| UD-IQ1_S | 7,76 | 0,0911 | 89,4% |
| UD-IQ1_M | 8,02 | 0,0867 | 90,2% |
| UD-IQ2_XXS | 8,49 | 0,0726 | 90,6% |
| UD-Q2_K_XL | 9,14 | 0,0595 | 91,6% |
| UD-IQ3_XXS | 11,66 | 0,0269 | 94,7% |
| UD-Q3_K_XL | 13,63 | 0,0174 | 96,3% |
| UD-IQ4_XS | 15,73 | 0,0109 | 97,7% |
| UD-Q4_K_M | 16,61 | 0,0108 | 97,9% |
| UD-Q4_K_XL | 17,63 | 0,0107 | 98,0% |
| UD-Q8_K_XL | 22,87 | referencia | — |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 GB (UD-IQ1_S, 7,76 GB) y 23 GB (UD-Q8_K_XL, 22,87 GB) para los pesos en GGUF; el checkpoint original en NVFP4/MXFP8 ocupa unos 20 GB.
- El modelo base recomienda 32 GB o más de VRAM para otras GPUs y plataformas.
- Plataformas oficialmente soportadas por el autor del modelo base: 1x NVIDIA DGX Spark y dispositivos Apple Silicon con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- Cabe en GPUs consumer de gama alta: una RTX 4090 (24 GB) puede alojar cuantizaciones hasta Q4_K_XL (17,63 GB) con margen para contexto; Q8_K_XL requiere 24 GB o más y deja poco espacio para la caché KV.
- Opciones de despliegue: Unsloth Desktop (recomendado por el autor de la cuantización), llama.cpp (con los GGUF "mainline" del repositorio oficial de Unsloth), y plataformas compatibles con endpoints según el tag `endpoints_compatible`. El modelo base también es accesible vía API en la plataforma Tinker y su playground.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo estructural, puede situarse frente a otras familias MoE de tamaño medio con capacidades multimodales, pero sin cifras de rendimiento publicadas no es posible establecer una comparación rigurosa.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini | 26,2B | 3,4B (5,4B efectivos) | no disponible | Apache 2.0 | safetensors, GGUF, NVFP4/MXFP8 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o robustez en la información disponible; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; la model card no documenta tasas de error ni estrategias de mitigación.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas previas.
- El soporte multilingüe se describe como "general", sin lista de idiomas ni evaluaciones por idioma; el rendimiento fuera del inglés es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base remite a una Política de Uso Aceptable de Thinking Machines Lab que puede imponer restricciones adicionales al uso del modelo original.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M) degradan la fidelidad de forma notable: KLD de 0,09 y solo ~89-90% de coincidencia en el token top-1 frente a Q8, lo que puede afectar a tareas de razonamiento y código.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, y su autor no es el desarrollador original; conviene verificar la integridad de los pesos y preferir los GGUF oficiales de Unsloth para producción.
- El modelo base se publicó en noviembre de 2026, por lo que el ecosistema de herramientas y las evaluaciones independientes son aún limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Thethirdgodofroblox/Inkling-2-Mini-GGUF
- Modelo base en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF oficiales de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Guía de ejecución de Inkling-2-Mini (Unsloth): https://unsloth.ai/docs/models/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Unsloth Desktop: https://github.com/unslothai/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
