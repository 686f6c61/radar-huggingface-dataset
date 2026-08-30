# Wondernutts/Shadow-Siren-26B-A4B-int4-ov

## Resumen

Shadow Siren 26B-A4B es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) basado en Gemma 4 26B-A4B, orientado a roleplay, escritura creativa, storytelling y brainstorming. El modelo original fue creado por Vortex5 mediante la fusión de varios fine-tunes de Gemma 4 26B-A4B-it, y esta versión concreta es una conversión a OpenVINO INT4 AWQ realizada por Wondernutts, optimizada para inferencia local en GPUs Intel Arc y otros dispositivos compatibles con OpenVINO.

La conversión reduce el peso del modelo a formato INT4 asimétrico con compresión AWQ (group size 64, ratio 1.0), excluyendo los routers del MoE de la compresión. El repositorio incluye el grafo multimodal completo (VLMPipeline), tokenizador y detokenizador OpenVINO, así como una optimización de la tabla RoPE para 131 072 posiciones de contexto. El resultado es un artefacto de despliegue de 16.1 GB que permite ejecutar el modelo en hardware Intel sin necesidad de un checkpoint de Transformers.

La relevancia de esta versión radica en su adaptación al ecosistema OpenVINO, que facilita el despliegue en entornos con GPUs Intel Arc o CPUs Intel, manteniendo las capacidades multimodales del modelo original. No se publican benchmarks de rendimiento en la tarjeta del modelo, pero la conversión ha sido verificada estructuralmente y supera una prueba de generación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B-A4B (mixture-of-experts, multimodal imagen-texto) |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (4B) |
| Longitud de contexto | 131 072 tokens (optimizacion RoPE LUT) |
| Tipos de cuantizacion | INT4 asimetrico (AWQ, group size 64, ratio 1.0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Shadow Siren 26B-A4B es un MoE con 26 mil millones de parametros totales y 4 mil millones activos por token, basado en la arquitectura Gemma 4 26B-A4B-it. Es multimodal, capaz de procesar tanto texto como imagenes. El modelo original combina varios fine-tunes: G4-MeroMero-26B-A4B, Serenity-26B-A4B, Pantheon-Reasoning-26B-A4B-1.1, Dark-Scarlett-v1.0-26B-A4B y Gemma-4-26B-A4B-Animus-V14.1-FFT, todos derivados de Gemma 4 26B-A4B-it. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo original.

La conversion OpenVINO aplica cuantizacion INT4 asimetrica con AWQ, excluyendo las capas de routing del MoE de la compresion para preservar la precision en la seleccion de expertos. Se incluye una optimizacion de la tabla RoPE con 131 072 posiciones (LUT131K), y el grafo resultante es un VLMPipeline multimodal. La tarjeta indica que la conversion fue verificada estructuralmente y supero una prueba de generacion local, pero no se aportan datos de throughput ni de calidad.

## Capacidades

- Generacion de texto creativo: roleplay, narrativa, dialogos expresivos y storytelling.
- Conversacion multimodal: entrada de imagenes junto con texto (pipeline image-text-to-text).
- Razonamiento y brainstorming: capacidad de generar ideas y explorar conceptos, reforzada por el componente Pantheon-Reasoning.
- Conversacion multi-turno: adecuado para mantener contextos largos gracias a la ventana de 131 072 tokens.
- Despliegue en OpenVINO: compatible con VLMPipeline y OpenVINO GenAI, optimizado para Intel Arc y CPUs Intel.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Roleplay y juegos de rol: el modelo puede interpretar personajes con personalidad y mantener conversaciones coherentes a lo largo de multiples turnos, aprovechando su ventana de contexto de 131 072 tokens para recordar detalles de la historia.
- Escritura creativa asistida: generacion de escenas, dialogos y tramas para novelas, guiones o relatos cortos. Su entrenamiento en storytelling permite producir texto narrativo fluido y descriptivo.
- Chatbots con personalidad: creacion de asistentes conversacionales con tono y caracter definidos, utiles en aplicaciones de entretenimiento o atencion al cliente con estilo informal.
- Brainstorming y generacion de ideas: el modelo puede proponer conceptos, nombres, argumentos o soluciones creativas, apoyandose en su componente de razonamiento.
- Analisis multimodal de imagenes: al ser un modelo imagen-texto, puede describir o comentar imagenes en contextos creativos, como ilustraciones o fotografias de referencia para una historia.
- Despliegue local en hardware Intel: gracias a la cuantizacion INT4 y al formato OpenVINO, puede ejecutarse en equipos con GPU Intel Arc o CPUs Intel, sin necesidad de hardware NVIDIA, lo que lo hace adecuado para entornos corporativos con parque Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo indica explicitamente que no se reivindica ninguna puntuacion de throughput ni de calidad. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- Tamano del repositorio: 16.1 GB, lo que sugiere que la version INT4 puede caber en GPUs con 16 GB de VRAM, aunque no se especifica el consumo exacto de VRAM en la tarjeta.
- GPU recomendadas: Intel Arc (segun la tarjeta), tambien compatible con CPUs Intel via OpenVINO. No se mencionan GPUs NVIDIA, aunque OpenVINO puede ejecutarse en ellas.
- El modelo original sin cuantizar requiere aproximadamente 51.6 GB de VRAM en FP16 (segun LLM Explorer), por lo que la version INT4 reduce significativamente los requisitos.
- Opciones de despliegue: OpenVINO GenAI con VLMPipeline. No es compatible con Transformers (AutoModelForCausalLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Shadow-Siren-26B-A4B (original) | 26B totales, 4B activos | 131 072 (segun LUT) | Safetensors | Apache-2.0 | Modelo base sin cuantizar, requiere ~51.6 GB VRAM |
| Shadow-Siren-26B-A4B-int4-ov (este) | 26B totales, 4B activos | 131 072 | OpenVINO IR INT4 | Apache-2.0 | Version cuantizada para OpenVINO, 16.1 GB |
| Gemma 4 26B-A4B-it | 26B totales, 4B activos | no disponible | Safetensors | Gemma license | Modelo base de Google, sin fine-tune creativo |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de rendimiento para comparar con otros MoE de tamano similar. La principal diferencia entre las versiones es el formato de pesos y la cuantizacion, que afecta a los requisitos de hardware y al ecosistema de despliegue.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: requiere OpenVINO GenAI y el uso de VLMPipeline. No puede cargarse con `AutoModelForCausalLM`.
- Sesgos y alucinaciones: al ser un modelo orientado a creatividad, puede generar contenido inventado o inconsistente. No se documentan sesgos especificos, pero es responsabilidad del desplegador supervisar las salidas.
- Idiomas soportados: no especificados. El modelo base Gemma 4 soporta multiples idiomas, pero esta version no detalla la cobertura.
- Licencia: Apache-2.0, heredada del modelo original. Sin embargo, se recomienda revisar las licencias de los componentes (Gemma 4, fine-tunes) antes de un despliegue comercial o redistribucion.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, lo que dificulta la evaluacion objetiva frente a alternativas.
- Limitaciones de hardware: aunque el tamano del repo es 16.1 GB, no se garantiza que quepa en cualquier GPU con 16 GB; se recomienda probar en el hardware objetivo.
- La tarjeta no menciona soporte de tool calling ni funciones de agente, por lo que no debe asumirse esa capacidad.

## Enlaces

- Repositorio HuggingFace de la version OpenVINO: https://huggingface.co/Wondernutts/Shadow-Siren-26B-A4B-int4-ov
- Modelo base original: https://huggingface.co/Vortex5/Shadow-Siren-26B-A4B
- Componentes del merge:
  - https://huggingface.co/google/gemma-4-26B-A4B-it
  - https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
  - https://huggingface.co/ReadyArt/Serenity-26B-A4B
  - https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1
  - https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
  - https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Ficha en NanoGPT: https://nano-gpt.com/models/text/gemma-4-26b-a4b-it-shadowsiren
- Ficha en LLM Explorer: https://llm-explorer.com/model/Vortex5%2FShadow-Siren-26B-A4B,6RJUnIxGTwWroHMNmLfVMu
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/Vortex5/Shadow-Siren-26B-A4B
