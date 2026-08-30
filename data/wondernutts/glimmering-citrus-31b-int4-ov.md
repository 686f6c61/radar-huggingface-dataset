# Wondernutts/Glimmering-Citrus-31B-int4-ov

## Resumen

Glimmering-Citrus-31B-int4-ov es una conversión de despliegue OpenVINO del modelo Glimmering-Citrus-31B, creada por Wondernutts para ejecutarse en GPUs Intel Arc y otros dispositivos compatibles con OpenVINO. El modelo original, desarrollado por Vortex5, es un merge de cuatro modelos basados en Gemma 4 (Garnet, MeroMero, Equinox y Gemma 4 IT) realizado con mergekit, orientado a roleplay, storytelling y conversación. Esta versión cuantizada aplica compresión de pesos INT4 asimétrica con AWQ (group size 128) y exporta el grafo completo a OpenVINO IR, incluyendo tokenizador, detokenizador y embeddings de visión.

El modelo es multimodal (image-text-to-text) y tiene una ventana de contexto teórica de hasta 131.072 posiciones gracias a una tabla de búsqueda RoPE optimizada (LUT131K). El repositorio pesa 19,5 GB y está pensado para usarse con OpenVINO GenAI mediante la API `VLMPipeline`, no con Transformers. Su relevancia radica en permitir ejecutar un modelo denso de 31B con cuantización INT4 en hardware Intel, con rendimientos de prefill de hasta 1.662 tokens por segundo en una Arc Pro B70, aunque la decodificación se mantiene en torno a 27 tokens por segundo en contexto corto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Gemma 4) |
| Parametros totales | 31B (según denominación del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 131.072 tokens (LUT), contexto desplegado variable según hardware |
| Tipos de cuantizacion | INT4 asimétrico (AWQ, group size 128, ratio 1.0) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Glimmering-Citrus-31B es un merge de cuatro modelos Gemma 4: ConicCat/Gemma4-Garnet-31B, zerofata/G4-MeroMero-v2-31B, LatitudeGames/Equinox-31B y google/gemma-4-31B-it. El merge fue realizado por Vortex5 con mergekit, combinando los pesos de estos modelos para obtener capacidades de roleplay, narrativa y conversación. No se dispone de información sobre el dataset de entrenamiento original de los componentes ni sobre procesos de RLHF o DPO aplicados al merge.

La conversión OpenVINO realizada por Wondernutts aplica compresión de pesos INT4 asimétrica con AWQ (group size 128, ratio 1.0) y exporta el grafo multimodal completo como OpenVINO IR (`VLMPipeline`). Se incluyen artefactos de tokenizador y detokenizador, así como una optimización de tabla de búsqueda RoPE con 131.072 posiciones (LUT131K), que actúa como techo posicional del grafo exportado. La validación cubrió generación coherente de matemáticas y roleplay.

## Capacidades

- Generación de texto para roleplay, storytelling y conversación, con énfasis en coherencia narrativa y consistencia de personajes.
- Entrada multimodal imagen-texto: el repositorio incluye embeddings de visión y soporta la API `VLMPipeline` para procesar imágenes junto con texto, aunque la inferencia de texto es el camino validado en la tabla de rendimiento.
- Contexto largo: la tabla RoPE permite hasta 131.072 posiciones teóricas, aunque el contexto efectivo depende de la GPU, la precisión de la caché KV y el presupuesto de memoria.
- Razonamiento matemático básico: la validación de la conversión incluyó pruebas de coherencia matemática.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno con personajes consistentes, aprovechando su ventana de contexto larga para recordar detalles de la trama a lo largo de sesiones extensas. Es adecuado para aplicaciones de chat de ficción o juegos de rol textuales.
- Generación de narrativa creativa: puede producir historias, guiones o diálogos con estilo literario, útil para escritores que necesitan un asistente de brainstorming o generación de borradores.
- Asistente conversacional con memoria larga: gracias a los 131K tokens de contexto teórico, puede mantener conversaciones prolongadas sin perder el hilo, adecuado para chatbots de atención al cliente o asistentes personales con historial extenso.
- Descripción de imágenes con texto: mediante la API `VLMPipeline`, puede generar descripciones o narrativas a partir de imágenes, útil en aplicaciones de accesibilidad o generación de contenido visual.
- Generación de diálogos para videojuegos: el modelo puede crear líneas de diálogo para personajes no jugables, con coherencia contextual y tono conversacional.
- Prototipado de aplicaciones de IA generativa en hardware Intel: al estar optimizado para OpenVINO, sirve como base para desarrollar y probar aplicaciones de texto en equipos con GPUs Intel Arc sin necesidad de hardware NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README del repositorio documenta medidas de rendimiento de inferencia obtenidas en una Intel Arc Pro B70 con OpenVINO 2026.2, que se resumen a continuación:

| Prueba de referencia | Resultado |
|---|---:|
| Procesamiento de prompt, 512 tokens | 1.662 tok/s |
| Decodificación en contexto corto | ~27 tok/s |
| Decodificación con ~6K tokens de contexto | ~19 tok/s |
| Prefill de 16K tokens | ~43 segundos |

Estas cifras son específicas del hardware y configuración indicados, y no constituyen una garantía universal de rendimiento.

## Requisitos de hardware

- GPU validada: Intel Arc Pro B70 (según el README). El modelo está preparado para dispositivos compatibles con OpenVINO, incluyendo la familia Intel Arc B-series.
- VRAM estimada: el repositorio pesa 19,5 GB, lo que sugiere que el modelo cuantizado INT4 puede caber en GPUs con al menos 20 GB de VRAM, aunque no se especifica el consumo exacto. El modelo original sin cuantizar requiere unos 62,6 GB según LLM Explorer.
- Opciones de despliegue: OpenVINO GenAI con la API `VLMPipeline` en GPU. No es compatible con Transformers ni con runtimes como vLLM o llama.cpp en su formato actual.
- Latencia y throughput: decodificación de ~27 tok/s en contexto corto y ~19 tok/s con 6K tokens de contexto, medidos en la Arc Pro B70. El prefill es rápido (1.662 tok/s para 512 tokens), pero la generación autoregresiva es el cuello de botella.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa rigurosa con otros modelos de la misma categoría (Gemma 4 de 31B u otros LLMs densos de tamaño similar). El modelo base Glimmering-Citrus-31B es un merge de varios Gemma 4, pero no se han publicado resultados de benchmarks que permitan comparar su calidad con alternativas como Gemma 4 31B original u otros merges similares.

## Limitaciones y advertencias

- Este repositorio es un artefacto de despliegue OpenVINO, no un checkpoint de Transformers. No puede cargarse con `AutoModelForCausalLM`; requiere OpenVINO GenAI y la API `VLMPipeline`.
- El contexto desplegado puede ser inferior a los 131.072 tokens teóricos, dependiendo de la GPU, la precisión de la caché KV, el planificador y el presupuesto de memoria.
- La entrada de imágenes requiere un build compatible de OpenVINO GenAI con soporte multimodal. La inferencia de texto es el camino validado en la tabla de rendimiento; la parte de visión no ha sido probada en el mismo nivel.
- El rendimiento varía significativamente con el hardware, el driver, el runtime, la forma del prompt, el estado de la caché y los parámetros de generación. Las cifras del README son referenciales.
- No se ha documentado información sobre sesgos, alucinaciones o comportamientos no deseados específicos de este modelo. Al ser un merge de modelos Gemma 4, podría heredar sesgos típicos de los LLM, pero no hay datos confirmados.
- La licencia Apache-2.0 se hereda del modelo base, pero se recomienda revisar las licencias de los componentes individuales del merge (Garnet, MeroMero, Equinox y Gemma 4 IT) antes de una redistribución o despliegue comercial.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Wondernutts/Glimmering-Citrus-31B-int4-ov
- Modelo base: https://huggingface.co/Vortex5/Glimmering-Citrus-31B
- Herramientas de conversión OpenVINO para Gemma 4: https://github.com/Wondernuttz/OpenVino-For-Gemma-4
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
