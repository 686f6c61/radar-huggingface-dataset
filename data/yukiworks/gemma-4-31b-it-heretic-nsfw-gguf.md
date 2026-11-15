# yukiworks/gemma-4-31B-it-heretic-NSFW-GGUF

## Resumen

`yukiworks/gemma-4-31B-it-heretic-NSFW-GGUF` es una distribución en formato GGUF del modelo `yukiworks/gemma-4-31B-it-heretic-NSFW`, un derivado de la familia Gemma 4 de Google con 30.697.345.596 parámetros (aproximadamente 31B) y pipeline multimodal `image-text-to-text`. El autor, yukiworks, publica las cuantizaciones listas para su uso con llama.cpp, incluyendo el proyector multimodal (mmproj) en BF16 necesario para la entrada de imágenes. El modelo base es una variante "heretic" y "abliterated", es decir, con las capas de rechazo previamente eliminadas mediante técnicas de abliteración, lo que da lugar a un modelo sin censura (uncensored/decensored) orientado a contenido NSFW.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo paquete: un modelo de ~31B con capacidades de visión, cuantizaciones GGUF de Q2_K a Q8_0 para distintos presupuestos de VRAM, y un ajuste deliberado para eliminar los mecanismos de rechazo. Esto lo sitúa en el nicho de modelos locales sin filtros para investigación, generación creativa de contenido para adultos y experimentación con alineación, no en el de asistentes de propósito general para producción.

No se dispone de información sobre idiomas soportados, datos de entrenamiento, benchmarks ni detalles del proceso de abliteración más allá de las etiquetas de la model card. El repositorio ocupa 141,1 GB e incluye cuatro cuantizaciones de texto más un mmproj compartido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de la familia Gemma 4; transformer multimodal image-text-to-text según el pipeline declarado) |
| Parametros totales | 30.697.345.596 (aprox. 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K (texto); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales de las cuantizaciones publicadas:

| Cuantizacion | Tamano | Archivo |
|---|---|---|
| Q8_0 | 32,64 GB | gemma-4-31B-it-heretic-NSFW-Q8_0.gguf |
| Q4_K_M | 18,69 GB | gemma-4-31B-it-heretic-NSFW-Q4_K_M.gguf |
| Q3_K_M | 15,29 GB | gemma-4-31B-it-heretic-NSFW-Q3_K_M.gguf |
| Q2_K | 11,92 GB | gemma-4-31B-it-heretic-NSFW-Q2_K.gguf |
| mmproj BF16 | 1,20 GB | mmproj-gemma-4-31B-it-heretic-NSFW-BF16.gguf |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, los datos de entrenamiento ni el proceso de ajuste. Lo que sí se puede afirmar con la información disponible es que el modelo base es un derivado de Gemma 4 de Google con aproximadamente 31B parámetros y pipeline `image-text-to-text`, lo que implica un codificador de visión más un proyector multimodal que alimenta al modelo de lenguaje. Las cuantizaciones GGUF se generan de forma independiente a partir de un GGUF intermedio en BF16 usando llama.cpp, con tokenizer y plantilla de chat embebidos en cada archivo de texto; el mmproj se mantiene en BF16 (con tensores F32 donde el conversor lo requiere) y es compartido por las cuatro cuantizaciones.

El rasgo definitorio del modelo es su condición de "heretic" y "abliterated": según las etiquetas de la model card, se han aplicado técnicas de abliteración para eliminar las direcciones de rechazo del modelo original, dando lugar a una variante "uncensored" y "decensored". No se especifica en la información proporcionada qué método concreto de abliteración se empleó, cuántas capas se modificaron, ni si hubo un ajuste posterior (fine-tuning) sobre el modelo abliterado. Tampoco se documentan número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en los GGUF.
- Entrada de imágenes (image-text-to-text): requiere cargar el mmproj BF16 junto con una de las cuantizaciones de texto.
- Razonamiento y generación de contenido sin las capas de rechazo del modelo original (uncensored/decensored), incluyendo contenido NSFW.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere despliegue vía infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar cómo cambia el comportamiento de un Gemma 4 de ~31B tras eliminar las direcciones de rechazo, comparando respuestas frente al modelo original en un mismo conjunto de prompts.
- Generación creativa de ficción para adultos: el ajuste NSFW permite escribir narrativa explícita sin bloqueos, con la ventana de contexto del modelo base (no documentada) para mantener coherencia en textos largos.
- Role-play conversacional local: con Q4_K_M (18,69 GB) o Q3_K_M (15,29 GB) el modelo cabe en GPUs de consumo de gama alta y puede ejecutarse con llama.cpp para sesiones de chat multi-turno sin conexión.
- Análisis de imágenes con descripción libre: cargando el mmproj BF16 junto a una cuantización de texto, se pueden hacer preguntas sobre imágenes sin las restricciones de contenido del modelo original, útil en investigación de visión-lenguaje.
- Evaluación de cuantizaciones: el repositorio publica cuatro niveles (Q2_K a Q8_0) sobre el mismo modelo, lo que permite medir la degradación de calidad y el compromiso velocidad/memoria en un modelo de ~31B multimodal.
- Pruebas de robustez y red-teaming: al carecer de capas de rechazo, sirve como caso límite para evaluar clasificadores de seguridad, filtros de contenido y sistemas de moderación en pipelines propios.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes Q2_K y Q3_K_M permiten ejecutar un modelo de 31B en hardware modesto mediante llama.cpp, con la consiguiente pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni caché KV):
  - Q8_0: 32,64 GB, más ~1,20 GB del mmproj si se usa visión.
  - Q4_K_M: 18,69 GB, más ~1,20 GB del mmproj.
  - Q3_K_M: 15,29 GB, más ~1,20 GB del mmproj.
  - Q2_K: 11,92 GB, más ~1,20 GB del mmproj.
- GPU recomendadas: para Q8_0 se necesita una GPU de 40-48 GB o superior (A100 40/80 GB, H100, RTX A6000 48 GB). Para Q4_K_M, una RTX 4090 (24 GB) deja margen para contexto; una RTX 3090 (24 GB) también es viable. Para Q3_K_M y Q2_K, GPUs de 16-24 GB (RTX 4080, RTX 4090, A5000) son suficientes para los pesos.
- Cabe en GPU de consumo: sí, en Q2_K y Q3_K_M con 16 GB o más; Q4_K_M en 24 GB; Q8_0 requiere hardware profesional.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y servidores compatibles con la API de llama.cpp; las etiquetas indican `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yukiworks/gemma-4-31B-it-heretic-NSFW-GGUF | ~31B | no disponible | Si (mmproj BF16) | apache-2.0 | GGUF | Variante abliterated/NSFW de Gemma 4 |
| Gemma 4 31B IT (original de Google) | ~31B | no disponible | Si | licencia Gemma 4 | safetensors, GGUF | Modelo alineado con rechazos; referencia para comparar el efecto de la abliteración |
| Modelos abliterated de la comunidad (p. ej. variantes Llama o Qwen) | variable | variable | segun base | segun base | GGUF, safetensors | Alternativas del mismo nicho uncensored; datos concretos no disponibles |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con estos modelos.

## Limitaciones y advertencias

- El modelo ha sido abliterated para eliminar los rechazos: generará contenido NSFW, potencialmente dañino o ilegal si se le induce, y no incorpora salvaguardas de seguridad. No es apto para aplicaciones orientadas al público general.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, especialmente en las cuantizaciones bajas (Q2_K, Q3_K_M), donde la degradación de calidad es mayor.
- La abliteración puede degradar capacidades generales (razonamiento, instrucciones, coherencia) respecto al Gemma 4 original; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe fiable.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificarla empíricamente.
- Licencia: la model card declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google (`license_link`). Existe ambigüedad sobre los términos aplicables al uso comercial; conviene revisar la licencia de Gemma 4 antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El contenido del modelo está marcado como `not-for-all-audiences`; su distribución y uso pueden estar restringidos según la jurisdicción.
- El tamaño del repositorio (141,1 GB) exige espacio en disco considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
