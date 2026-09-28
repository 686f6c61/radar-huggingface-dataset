# winterthurquants/Inkling

## Resumen

Inkling es un modelo fundacional multimodal de tipo transformer autorregresivo desarrollado por Thinking Machines Lab, publicado el 15 de julio de 2026 con pesos abiertos. Acepta entradas de texto, imagen, vídeo y audio, y genera únicamente texto. La ficha que se documenta aquí corresponde a la copia alojada en el repositorio `winterthurquants/Inkling` de Hugging Face, que reproduce el modelo original de `thinkingmachines/Inkling`; esta copia secundaria no registra descargas ni valoraciones en el momento de la consulta.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 66 capas de decodificador, enrutando cada token a 6 de 256 expertos más 2 expertos compartidos siempre activos. Declara 975.000 millones de parámetros totales y 41.000 millones activos por token, aunque los pesos en safetensors del repositorio suman 952.377.623.626 parámetros (aproximadamente 952,4 mil millones), una discrepancia que conviene verificar. La atención combina capas locales y globales, y la multimodalidad es nativa: imágenes y vídeo se codifican con un codificador jerárquico de parches y el audio con codificación de tokens discretos, proyectándose todo a un espacio oculto compartido.

Su relevancia radica en tres factores: es el primer modelo abierto de Thinking Machines Lab, se distribuye bajo licencia Apache-2.0 (con una política de uso aceptable adicional) y compite en razonamiento, matemáticas y coding agéntico con modelos cerrados de frontera según las evaluaciones publicadas por el propio autor. El control del esfuerzo de razonamiento (*thinking effort*) es una de sus señas de identidad, con resultados reportados a `effort=0.99`. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal decoder-only, 66 capas, backbone MoE disperso con atencion hibrida local/global |
| Parametros totales | 975.000 millones segun model card; 952.377.623.626 segun safetensors del repositorio `winterthurquants/Inkling` |
| Parametros activos | 41.000 millones por token (6 de 256 expertos enrutados + 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soportes numericos declarados). No se detallan GGUF ni otras cuantizaciones en la informacion disponible |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; tambien multiples lenguajes de programacion |
| Licencia | Apache-2.0, con politica de uso aceptable adicional de Thinking Machines Lab |
| Formato de pesos | safetensors; tamano del repositorio 1904,8 GB |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato en pixeles, dimensiones ideales entre 40 px y 4096 px), audio (WAV a 16 kHz, idealmente menos de 20 minutos), video |
| Modalidades de salida | Texto (UTF-8) |
| Biblioteca | transformers |
| Pipeline | image-text-to-text |
| Autor original | Thinking Machines Lab |
| Fecha de publicacion del modelo original | 15 de julio de 2026 |

## Arquitectura y entrenamiento

Inkling es un transformer autorregresivo de 66 capas con decodificador y backbone de feed-forward MoE disperso. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atención es híbrida, combinando capas locales y globales, lo que habitualmente reduce el coste de cómputo en secuencias largas frente a una atención totalmente global. El modelo es nativamente multimodal: las imágenes y el vídeo pasan por un codificador jerárquico de parches y el audio por una codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decodificador, en lugar de depender de adaptadores externos acoplados a un modelo de lenguaje puramente textual.

Los datos de entrenamiento provienen de fuentes públicas (internet público y repositorios accesibles públicamente), de terceros y de generación o aumento sintético, e incluyen texto, imágenes, audio y vídeo. El proceso de curación comprende limpieza, procesado y modificación de los conjuntos, con pasos variables según el tipo de dato: deduplicación y filtrado para eliminar contenido basura o de baja calidad y para satisfacer objetivos de seguridad. La model card no especifica el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa. El modelo soporta dos formatos numéricos, BF16 y NVFP4, y expone un parámetro de esfuerzo de razonamiento (*thinking effort*) cuyos resultados se publican a `effort=0.99`.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Razonamiento multimodal: procesa texto, imágenes, vídeo y audio de forma conjunta en el mismo decodificador.
- Comprensión de audio: entrada en WAV a 16 kHz, con tramos de hasta 20 minutos recomendados.
- Comprensión visual: entrada de imagen en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40 px y 4096 px.
- Razonamiento matemático: resultados de 97,1% en AIME 2026 y 87,2% en GPQA Diamond.
- Coding agéntico: 77,6% en SWEBench Verified y 54,3% en SWEBench Pro (Public).
- Uso de herramientas (*tool calling*): la evaluación HLE con herramientas sube del 29,7% al 46,0%, lo que indica integración efectiva de herramientas externas.
- Flujos agénticos y razonamiento multi-paso: el modelo está descrito explícitamente para sistemas agénticos y de uso de herramientas.
- Multilingüismo general más allá del inglés, sin lista de idiomas publicada.
- Control del esfuerzo de razonamiento (*thinking effort*), que permite ajustar el equilibrio entre coste y precisión.
- Ajuste fino e integración en productos de terceros gracias a la publicación de pesos abiertos.

## Casos de uso

- Asistentes de atención al cliente multimodales: el modelo puede recibir capturas de pantalla, fotos de producto o notas de voz de un cliente (WAV 16 kHz) y responder en texto dentro de la misma conversación, lo que evita encadenar un modelo de visión, otro de audio y otro de lenguaje.
- Automatización de soporte técnico sobre documentación visual: con entrada de imagen y texto, permite interpretar diagramas, esquemas o capturas de error y generar instrucciones paso a paso para el usuario final.
- Agentes de coding en producción: con un 77,6% en SWEBench Verified y soporte de uso de herramientas, es adecuado para integrarse en pipelines de CI/CD donde el agente lee el repositorio, ejecuta pruebas, interpreta la salida y propone parches.
- Análisis de reuniones y material audiovisual: la entrada de audio de hasta 20 minutos por tramo permite transcribir, resumir y extraer tareas de grabaciones, combinando después el texto con capturas de la presentación.
- Generación aumentada por recuperación (RAG) multimodal: el modelo está descrito por el autor para sistemas RAG, de modo que puede indexar documentos con figuras e imágenes y responder consultas que requieran cruzar texto e ilustraciones.
- Revisión de contenido y moderación asistida: al aceptar imagen, audio y texto en una sola pasada, puede clasificar y describir contenido potencialmente problemático con una única llamada al modelo.
- Investigación y ajuste fino académico: los pesos abiertos bajo Apache-2.0 permiten reentrenar y adaptar el modelo con datos propios, algo habitual en laboratorios que necesitan reproducibilidad.
- Asistentes de accesibilidad: descripción de imágenes y de audio para usuarios con discapacidad visual o auditiva, usando las modalidades de entrada nativas.
- Despliegue en producto vía API: mediante Tinker o proveedores de inferencia externos, sin necesidad de alojar los 1904,8 GB de pesos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos a `effort=0.99`, con comparativas generadas el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados.

| Evaluacion | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (solo texto) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (con herramientas) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | no disponible | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | no disponible | 80,6% | 80,6% | 95,0% | no disponible |
| SWEBench Pro (Public) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | no disponible (tabla truncada en la fuente) |

No hay datos de MMLU, HumanEval ni GSM8K en la información disponible. La última fila de la tabla original aparece cortada tras el valor de Claude Fable 5, de modo que el resultado de GPT 5.6 Sol en SWEBench Pro no está disponible.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros; no proceden de mediciones publicadas.

- Pesos en BF16: aproximadamente 1950 GB (975.000 millones × 2 bytes), coherente con los 1904,8 GB del repositorio en safetensors. Solo los pesos ya exceden la memoria de cualquier nodo de 8 GPU de 80 GB.
- Pesos en NVFP4 (4 bits): aproximadamente 488 GB (975.000 millones × 0,5 bytes), sin contar caché KV, activaciones ni overhead del runtime.
- Configuración mínima teórica en BF16: en torno a 25 GPU de 80 GB solo para pesos; en la práctica se necesitan más por caché KV y paralelismo. En NVFP4 el mínimo teórico baja a unas 7 GPU de 80 GB, siendo 8× H100 80 GB o 8× B200 una configuración razonable.
- GPU recomendadas: H100 80 GB, H200, B200/GB200 (NVFP4 es un formato nativo de la generación Blackwell), A100 80 GB para BF16 con nodos multi-GPU.
- GPU de consumo: no cabe. Incluso en NVFP4 los ~488 GB de pesos superan con creces los 24-32 GB de VRAM de una RTX 4090, RTX 5090 o similar, y los 41.000 millones de parámetros activos no reducen la necesidad de tener todos los pesos residentes.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Unsloth, transformers de Hugging Face, además del Playground y la API de Tinker y proveedores de inferencia externos.
- Latencia y throughput: no disponible. El coste de inferencia es ajustable mediante el parámetro de esfuerzo de razonamiento.
- Formatos disponibles del modelo original: BF16 (`thinkingmachines/Inkling`) y NVFP4 (`thinkingmachines/Inkling-NVFP4`).

## Comparativa con modelos similares

| Modelo | Pesos | Parametros | Contexto | Licencia | HLE (texto) | SWEBench Verified |
|---|---|---|---|---|---|---|
| Inkling | Abiertos | 975B totales / 41B activos | no disponible | Apache-2.0 | 29,7% | 77,6% |
| Nemotron 3 Ultra | Abiertos | no disponible | no disponible | no disponible | 26,6% | 70,7% |
| Kimi K2.5 | Abiertos | no disponible | no disponible | no disponible | 29,4% | 76,8% |
| Kimi K2.6 | Abiertos | no disponible | no disponible | no disponible | 35,9% | 80,2% |
| GLM 5.2 | Abiertos | no disponible | no disponible | no disponible | 40,1% | no disponible |
| DeepSeek V4 Pro | Abiertos | no disponible | no disponible | no disponible | 35,9% | 80,6% |
| Gemini 3.1 Pro | Cerrados (solo API) | no disponible | no disponible | propietaria | 44,7% | 80,6% |
| Claude Fable 5 | Cerrados (solo API) | no disponible | no disponible | propietaria | 53,3% | 95,0% |
| GPT 5.6 Sol | Cerrados (solo API) | no disponible | no disponible | propietaria | 47,2% | no disponible |

Existe además una variante denominada Inkling-Small, mencionada en la página oficial de Thinking Machines Lab, de la que no se dispone de parámetros, contexto ni licencia. La propia compañía declara que Inkling "no es el modelo más fuerte disponible hoy, ni abierto ni cerrado", una afirmación coherente con la tabla anterior en la mayoría de evaluaciones de razonamiento.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo generativo, puede producir afirmaciones incorrectas con apariencia de verosimilitud. No se han publicado tasas de alucinación.
- Sesgos: la model card no documenta una evaluación de sesgos ni medidas de mitigación más allá del filtrado de datos durante la curación.
- Idiomas: el inglés es el idioma principal; las capacidades multilingües se describen como "generales", sin lista de idiomas ni métricas por idioma.
- Longitud de contexto: no publicada, lo que impide planificar despliegues con requisitos de contexto largo.
- Límites de entrada: audio en WAV a 16 kHz e idealmente por debajo de 20 minutos; imágenes con dimensiones ideales entre 40 px y 4096 px. Fuera de esos rangos el rendimiento puede degradarse.
- Salida: el modelo solo genera texto, no genera imágenes, audio ni vídeo.
- Licencia: Apache-2.0 permite uso comercial, pero existe una política de uso aceptable adicional de Thinking Machines Lab cuyos términos conviene revisar antes de un despliegue en producción.
- Repositorio de esta ficha: `winterthurquants/Inkling` es una copia secundaria con 0 descargas y 0 "likes", creada el 27 de septiembre de 2026, frente al repositorio original `thinkingmachines/Inkling`. Conviene verificar la integridad de los pesos y la autoría antes de usarlos, y preferir el repositorio oficial cuando sea posible.
- Discrepancia de parámetros: 975.000 millones declarados en la model card frente a 952.377.623.626 contados en los safetensors. No se explica la diferencia.
- Tamaño de despliegue: 1904,8 GB de repositorio. Requiere infraestructura multi-GPU de gama alta, con coste económico y energético elevado.
- Trazabilidad de benchmarks: los resultados son autodeclarados por el autor, medidos a `effort=0.99`, y las comparativas se generaron el 14 de julio de 2026. La tabla original está truncada en la última fila.
- Uso de herramientas: los resultados con herramientas mejoran notablemente respecto a los de texto puro, pero dependen de la calidad de la implementación del *tool calling* en el sistema que integra el modelo.

## Enlaces

- Repositorio de esta ficha (copia secundaria): https://huggingface.co/winterthurquants/Inkling
- Repositorio oficial BF16: https://huggingface.co/thinkingmachines/Inkling
- Repositorio oficial NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Pagina oficial del modelo: https://thinkingmachines.ai/inkling/
- Anuncio de presentacion: https://thinkingmachines.ai/news/introducing-inkling/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://huggingface.co/blog/thinkingmachines-inkling
- Guia de Layer3 Labs: https://www.layer3labs.io/guides/inkling-explained
- Resumen de especificaciones y benchmarks: https://bivashvlog.com/thinkingmachines-inkling-ai-model-specs-benchmarks/
