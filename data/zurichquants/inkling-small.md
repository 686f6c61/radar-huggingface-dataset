# zurichquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de codigo abierto desarrollado por Thinking Machines Lab, publicado en Hugging Face bajo el identificador `zurichquants/Inkling-Small`. Se trata de un transformer autoregresivo con arquitectura de Mezcla de Expertos (MoE) que acepta entradas de texto, imagen y audio, y genera salidas de texto. Con 276B de parametros totales y 12B activos, esta disenado para ofrecer un equilibrio entre capacidad y eficiencia, posicionandose como una alternativa abierta a modelos propietarios de gran tamano.

El modelo destaca por su razonamiento nativo sobre modalidades multiples, un esfuerzo de pensamiento variable (thinking mode) y una ventana de contexto de hasta 1M de tokens. Su licencia Apache-2.0 permite uso comercial, investigacion y fine-tuning, lo que lo convierte en una opcion relevante para desarrolladores que necesitan desplegar sistemas agénticos, asistentes de codigo o aplicaciones de RAG multimodal sin depender de APIs cerradas. El repositorio en Hugging Face ocupa 531.9 GB e incluye pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (42 capas, 256 expertos, 6 activos por token + 2 compartidos) |
| Parametros totales | 276B (265.956.439.090 en pesos safetensors) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Ingles, con capacidades multilingues generales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling-Small emplea un transformer decoder-only de 42 capas con una espina dorsal feed-forward de MoE dispersa. Cada token se enruta a 6 de los 256 expertos disponibles, mas 2 expertos compartidos que se activan en todos los tokens. La atencion es hibrida, combinando capas de atencion local y global. El modelo es nativamente multimodal: las imagenes se codifican mediante un codificador jerarquico de parches, y el audio mediante codificacion discreta de tokens, proyectandose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta.

El entrenamiento se realizo en sistemas NVIDIA GB300 NVL72. Los datos de entrenamiento provienen de fuentes publicamente disponibles, adquisiciones de terceros y datos sinteticos o aumentados. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad o avanzar en objetivos de seguridad. No se especifica en la informacion disponible si se utilizaron tecnicas de RLHF o DPO, aunque el modelo esta optimizado para instrucciones y uso conversacional.

## Capacidades

- Generacion de texto a partir de entradas multimodales: texto, imagen y audio.
- Razonamiento nativo sobre imagenes y audio, sin necesidad de pipelines externos de transcripcion o OCR.
- Esfuerzo de pensamiento variable (thinking mode), que permite ajustar el nivel de razonamiento antes de responder.
- Soporte para sistemas agénticos y tool-use, mencionado explicitamente en los usos previstos del modelo.
- Capacidades de asistente de codigo, con soporte para multiples lenguajes de programacion.
- Capacidades multilingues generales, aunque el idioma principal es el ingles.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos extensos o conversaciones de larga duracion.

## Casos de uso

- Agentes multimodales autonomos: el modelo puede procesar capturas de pantalla, notas de voz y texto simultaneamente para tomar decisiones en entornos de automatizacion, como gestion de correos o navegacion web asistida.
- Asistentes de codigo en produccion: gracias a su soporte para tool calling y su capacidad para interpretar diagramas o documentacion en imagen, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo.
- RAG multimodal: permite indexar y consultar documentos que contienen imagenes, tablas escaneadas y audio, devolviendo respuestas contextualizadas con la ventana de 1M de tokens.
- Transcripcion y analisis de reuniones: acepta audio WAV a 16kHz y genera resumenes, actas o tareas pendientes, combinando el contenido auditivo con notas de texto adjuntas.
- Chatbots de atencion al cliente con contexto largo: puede mantener conversaciones multi-turno extensas sin perder informacion relevante, gracias a su amplia ventana de contexto.
- Moderacion de contenido visual y auditivo: analiza imagenes y audio para detectar contenido inapropiado o generar descripciones accesibles.
- Asistentes de accesibilidad: describe imagenes y audio para personas con discapacidad visual o auditiva, integrable en aplicaciones de moviles o web.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks con modelos de pesos abiertos y cerrados, entre ellos Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Sin embargo, los valores numericos de dicha tabla no estan disponibles en el texto proporcionado, por lo que no es posible presentar resultados concretos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 requieren aproximadamente 552 GB de VRAM (276B x 2 bytes). Con cuantizacion NVFP4, el requisito se reduce a unos 138 GB.
- GPU recomendadas: no es viable en GPUs de consumo. Para BF16 se necesitan al menos 8x H100 o A100 de 80 GB. Con NVFP4, 2x H100 de 80 GB podrian ser suficientes.
- Opciones de despliegue: el modelo es compatible con SGLang, vLLM, TokenSpeed, Unsloth y la libreria transformers de Hugging Face.
- Latencia y throughput: no se han proporcionado datos especificos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

La model card situa a Inkling-Small en una tabla comparativa junto a Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. No se dispone de las especificaciones completas de estos modelos en la informacion proporcionada, pero se puede establecer la siguiente comparativa basica:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Inkling-Small | 276B | 12B | Hasta 1M | Apache-2.0 |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible |

Inkling-Small destaca por su eficiencia (12B activos) y su licencia permisiva, aunque los datos de rendimiento comparativo no estan disponibles en el texto proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos publicos de internet, el modelo puede reflejar sesgos presentes en dichos datos, incluyendo estereotipos culturales o de genero.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de audio: el rendimiento optimo se consigue con audio WAV a 16kHz y duracion inferior a 2 minutos; audios mas largos pueden degradar la calidad.
- Limitaciones de imagen: se recomienda que las dimensiones de las imagenes esten entre 40px y 4096px para un rendimiento optimo.
- Restricciones de licencia: aunque la licencia es Apache-2.0, Thinking Machines Lab publica una politica de uso aceptable (Acceptable Use Policy) que los desarrolladores deben revisar antes de desplegar el modelo en produccion.
- Discrepancia en el autor del repositorio: el modelo esta publicado bajo el usuario `zurichquants` en Hugging Face, pero el desarrollador real es Thinking Machines Lab. Se recomienda verificar la autenticidad del repositorio antes de su uso en entornos criticos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zurichquants/Inkling-Small
- Repositorio alternativo (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-Small
- Anuncio oficial: https://thinkingmachines.ai/news/inkling-small/
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Playground de prueba: https://tinker.thinkingmachines.ai/playground
- Repositorio de recetas (Tinker Cookbook): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Ficha en MindStudio: https://www.mindstudio.ai/models/inkling-small
