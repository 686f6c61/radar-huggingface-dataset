# Wondernutts/Phoenix-X-26B-A4B-int4-ov

## Resumen

Phoenix-X-26B-A4B-int4-ov es una conversión OpenVINO INT4 AWQ del modelo base Vortex5/Phoenix-X-26B-A4B, un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) basado en Gemma 4 26B-A4B. El modelo original fue creado mediante la fusión de varios fine-tunes orientados a roleplay, escritura creativa y razonamiento, y esta variante lo empaqueta en formato OpenVINO IR para su ejecución local eficiente en GPUs Intel Arc y dispositivos compatibles con OpenVINO.

La conversión, realizada por Wondernutts, aplica compresión asimétrica de 4 bits con AWQ (grupo de tamaño 64), excluye los routers MoE de la cuantización e incluye optimizaciones como la tabla RoPE con 131 072 posiciones. El resultado es un artefacto de despliegue de 16,1 GB que conserva las capacidades multimodales del modelo original (entrada de imagen y texto) y se ejecuta mediante la API `VLMPipeline` de OpenVINO GenAI.

Este modelo resulta relevante para desarrolladores que necesitan ejecutar un LLM multimodal de 26B parámetros (4B activos) en hardware de consumo, especialmente en GPUs Intel Arc, sin depender de servicios en la nube. Al ser una conversión cuantizada, ofrece un equilibrio entre calidad generativa y requisitos de memoria reducidos, aunque no se han publicado benchmarks específicos de rendimiento para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B-A4B MoE (mixture-of-experts), multimodal (image-text-to-text) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (4B) |
| Longitud de contexto | 131 072 tokens (segun optimizacion RoPE LUT, con clamp en indice 131 071) |
| Tipos de cuantizacion | INT4 AWQ asimetrico, grupo de tamaño 64, ratio 1.0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (con tokenizer y detokenizer OpenVINO) |

## Arquitectura y entrenamiento

El modelo base Phoenix-X-26B-A4B es un MoE con 26B parametros totales y 4B activos por token, derivado de Gemma 4 26B-A4B. Fue creado por Vortex5 mediante un metodo de fusion personalizado que combina cinco modelos: Pantheon-Reasoning-26B-A4B-1.1, Gemma-4-26B-A4B-Animus-V14.1-FFT, G4-Moonlight-Dusk-26B-A4B, G4-MeroMero-26B-A4B y gemma4-26b-fiction-bf16. El resultado es un modelo orientado a roleplay, escritura creativa, storytelling y brainstorming, con capacidades de razonamiento heredadas de Pantheon-Reasoning.

La conversion OpenVINO realizada por Wondernutts no anade entrenamiento adicional, sino que aplica compresion INT4 AWQ con grupo de tamaño 64, excluyendo los routers MoE de la cuantizacion para preservar la precision del enrutamiento. Se incluye una optimizacion de tabla RoPE con 131 072 posiciones (parche LUT131K) y se exporta el grafo multimodal completo con embeddings de vision. La verificacion estructural posterior a la exportacion confirmo la integridad de los pesos cuantizados, los artefactos del tokenizer y el parche del grafo.

## Capacidades

- Generacion de texto conversacional y creativo: roleplay, narrativa, dialogo y brainstorming.
- Entrada multimodal: acepta imagenes junto con texto gracias al pipeline `image-text-to-text`.
- Razonamiento multi-paso: heredado del componente Pantheon-Reasoning del modelo base.
- Soporte de contexto largo: hasta 131 072 tokens, adecuado para conversaciones extensas o documentos largos.
- Ejecucion local eficiente en hardware Intel Arc mediante OpenVINO GenAI.
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes coherentes y tramas complejas en sesiones de juego de rol, aprovechando su contexto de 131K tokens para recordar detalles de la historia.
- Escritura creativa asistida: generacion de borradores de ficcion, poesia o guiones, con ajuste fino de estilo mediante parametros de temperatura y top-p.
- Asistente conversacional local: despliegue en una GPU Intel Arc para ofrecer un chatbot privado sin conexion, con respuestas en multiples turnos.
- Analisis de imagenes con descripcion textual: al ser multimodal, puede recibir una imagen y generar una narracion o responder preguntas sobre ella.
- Brainstorming y generacion de ideas: util para equipos creativos que necesitan explorar conceptos o variaciones de una premisa.
- Prototipado de aplicaciones de IA generativa: gracias a su licencia Apache-2.0 y su formato OpenVINO, permite integrarse en pipelines locales de inferencia sin dependencias de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint. La model card incluye unicamente un benchmark de referencia del stack de runtime OpenVINO (no una medicion del modelo en si), obtenido en una Intel Arc Pro B70 con el stack original de Gemma 4 26B-A4B:

| Prueba de referencia | Resultado |
|---|---|
| Procesamiento de prompt sostenido (6 622 tokens) | 5 827,2 tok/s |
| Decode de contexto corto | 112,2 tok/s |
| Decode tras 6 622 tokens de contexto | 94,9 tok/s |

Estos valores corresponden al stack de referencia documentado, no a una medicion de este modelo concreto. No se atribuyen estas cifras a este checkpoint sin una ejecucion especifica.

## Requisitos de hardware

- Tamano del repositorio: 16,1 GB, por lo que cabe en GPUs con al menos 16 GB de VRAM (por ejemplo, Intel Arc A770 16 GB, Arc Pro B60 o superiores).
- Optimizado para GPUs Intel Arc de la serie B (como Arc Pro B70) mediante OpenVINO GenAI.
- Tambien puede ejecutarse en otros dispositivos compatibles con OpenVINO (CPU, iGPU), aunque el rendimiento optimo se logra en GPU Intel.
- El modelo base sin cuantizar requiere unos 51,6 GB de VRAM en FP16 (segun LLM Explorer), por lo que esta version INT4 reduce significativamente los requisitos.
- Despliegue recomendado con OpenVINO GenAI usando `VLMPipeline`; no es compatible con Transformers (`AutoModelForCausalLM`).
- El parametro `DYNAMIC_QUANTIZATION_GROUP_SIZE=128` se usa en el ejemplo de inferencia, lo que sugiere que la cuantizacion dinamica adicional puede ajustarse en runtime.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Phoenix-X-26B-A4B (base) | 26B totales, 4B activos | 131K (estimado) | Transformers (FP16) | Apache-2.0 |
| Phoenix-X-26B-A4B-int4-ov (este) | 26B totales, 4B activos | 131K | OpenVINO IR (INT4) | Apache-2.0 |
| Gemma 4 26B-A4B-it (original) | 26B totales, 4B activos | No disponible | Transformers | Apache-2.0 |

La principal diferencia frente al modelo base es el formato de pesos y la cuantizacion, que reducen la huella de memoria de 51,6 GB a 16,1 GB, a costa de una posible perdida de precision. No se dispone de datos objetivos para comparar la calidad generativa.

## Limitaciones y advertencias

- No es un checkpoint de Transformers; requiere OpenVINO GenAI y la API `VLMPipeline` para su ejecucion.
- No se han publicado benchmarks especificos de este modelo; los datos de rendimiento del stack de referencia no deben atribuirse a este checkpoint sin una medicion propia.
- El modelo base esta orientado a roleplay y creatividad, por lo que puede generar contenido sesgado, estereotipado o inapropiado segun el prompt.
- Riesgo de alucinacion inherente a los LLM, especialmente en tareas factuales.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse las licencias de los modelos componentes (Gemma 4, fine-tunes) antes de la redistribucion.
- No se especifican los idiomas soportados; el modelo base probablemente este entrenado principalmente en ingles, aunque puede generalizar a otros idiomas con menor calidad.
- El contexto de 131K tokens es el maximo teorico segun la optimizacion RoPE; en la practica, la calidad puede degradarse con contextos muy largos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Wondernutts/Phoenix-X-26B-A4B-int4-ov
- Modelo base (Vortex5/Phoenix-X-26B-A4B): https://huggingface.co/Vortex5/Phoenix-X-26B-A4B
- Fork de OpenVINO con optimizaciones para Gemma 4: https://github.com/Wondernuttz/openvino/tree/arc-xe2-gemma4-pa-2026.4
- Repositorio de catalogo de errores y toolkit para Gemma 4 en Intel Arc: https://github.com/Wondernuttz/OpenVino-For-Gemma-4
- Ficha en LLM Explorer: https://llm-explorer.com/model/Vortex5%2FPhoenix-X-26B-A4B,dzCqHIesneY7qEgEMWEYm
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Vortex5/Phoenix-X-26B-A4B
