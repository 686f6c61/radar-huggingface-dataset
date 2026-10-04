# warped-community/Llama-3.2-3B-litert-lm

## Resumen

`warped-community/Llama-3.2-3B-litert-lm` es un artefacto de despliegue, no un modelo entrenado desde cero. Se trata de un espejo del modelo `litert-community/Llama-3.2-3B`, convertido al formato LiteRT-LM (`.litertlm`) para su ejecución en dispositivos Android dentro de la aplicación Warped. El modelo subyacente es `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only de 3.210 millones de parametros publicado por Meta en septiembre de 2024.

Su relevancia es practica: LiteRT-LM (antes TensorFlow Lite) es el runtime de Google para ejecutar modelos de lenguaje en el borde, sin conexion y con aceleracion por GPU o NPU. Este repositorio empaqueta el modelo con cuantizacion mixta int4 orientada a GPU (`llama3_2_3b_mixed_int4_gpu.litertlm`), lo que reduce el peso a aproximadamente 2,2 GB y permite inferencia local en telefonos de gama alta.

El repositorio lo mantiene la comunidad `warped-community` como dependencia interna de una aplicacion Android. No aporta pesos nuevos ni ajuste fino adicional: hereda integramente las capacidades, los sesgos y las limitaciones del modelo Instruct original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.210 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | int4 mixta para GPU (archivo `llama3_2_3b_mixed_int4_gpu.litertlm`); no se ofrecen otras variantes en este repo |
| Idiomas soportados | 8 idiomas oficiales del modelo base (ingles, aleman, frances, italiano, portugues, hindi, espanol y thai); no se documentan en la model card del espejo |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base `Llama-3.2-3B-Instruct` es un transformer decoder-only de 3.210 millones de parametros con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, embeddings rotatorios (RoPE) y activacion SwiGLU, con un vocabulario de 128.256 tokens. La familia Llama 3.2 fue entrenada por Meta sobre hasta 9 billones de tokens con un corte de conocimiento en diciembre de 2023, y las variantes Instruct se afinaron con supervision (SFT) y optimizacion por preferencias (rechazo de muestras y DPO). Las versiones de 1B y 3B no incluyen capacidad de vision; esa solo esta presente en las variantes de 11B y 90B.

Este repositorio concreto no entrena ni ajusta el modelo: parte del archivo ya convertido por `litert-community/Llama-3.2-3B` y lo replica para uso interno de la aplicacion Warped. La conversion a LiteRT-LM implica cuantizacion a int4 mixta y empaquetado para los delegados de GPU del runtime LiteRT, lo que permite ejecutar la inferencia en el dispositivo sin acceso a red. No se documenta en la model card el proceso exacto de conversion, el calibrado de la cuantizacion ni el impacto en la calidad respecto a los pesos originales.

## Capacidades

- Generacion de texto e instrucciones en los ocho idiomas oficiales del modelo base.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general (corte diciembre de 2023).
- Generacion y explicacion de codigo en lenguajes habituales.
- Resumen, reescritura, clasificacion y extraccion de informacion de textos.
- Soporte de function calling y tool calling segun el formato de plantilla de Llama 3.2 Instruct.
- Conversacion multi-turno y seguimiento de instrucciones del sistema.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- Inferencia 100 % local y sin conexion gracias al runtime LiteRT-LM.

## Casos de uso

- Asistente de chat sin conexion en aplicacion Android: el modelo se ejecuta en el dispositivo con la ventana de contexto del modelo base, sin enviar datos a servidores externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Resumen de notas, correos o articulos en el propio movil: la cuantizacion int4 reduce el peso a unos 2,2 GB, lo que hace viable mantener el modelo residente en memoria en telefonos de gama alta.
- Traduccion y reescritura multilingue dentro de la app: cubre los ocho idiomas oficiales de Llama 3.2 y permite traducir texto seleccionado sin coste de API.
- Clasificacion y etiquetado de contenido (categorias, sentimiento, intenciones) en pipelines locales de la aplicacion.
- Asistencia de redaccion en editores de texto moviles: correccion, sugerencias de estilo y generacion de borradores sin salir del dispositivo.
- Extraccion estructurada de datos (JSON, campos concretos) a partir de texto libre, con soporte de plantillas de instruccion para forzar el formato.
- Prototipado rapido de agentes locales que combinen tool calling con funciones nativas del telefono (calendario, contactos), siempre que se implemente el bucle de ejecucion en la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no reporta metricas y el repositorio no incluye evaluaciones propias. Tampoco se documenta la degradacion de calidad introducida por la cuantizacion int4 mixta respecto al modelo base en precision completa.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 2,2 GB, correspondientes al archivo `.litertlm` cuantizado en int4 mixta.
- VRAM/RAM estimada para inferencia: en torno a 2-3 GB en funcion del backend y de la longitud de contexto utilizada; no se documenta una cifra oficial.
- Orientado a GPU integradas y NPU de telefonos Android de gama alta; no se detallan modelos de SoC compatibles en la model card.
- No esta pensado para GPU de escritorio (A100, H100, RTX 4090) ni para servidores: para esos entornos conviene usar el modelo base en safetensors con vLLM, TGI o llama.cpp.
- Opciones de despliegue: runtime LiteRT-LM y, en su caso, la MediaPipe LLM Inference API de Google; no es compatible con vLLM, TGI ni Ollama en su formato actual.
- No se publican datos de latencia ni de throughput (tokens por segundo) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| `warped-community/Llama-3.2-3B-litert-lm` (este) | 3,21B | 128k (base) | Llama 3.2 Community | `.litertlm` int4 mixta, solo espejo |
| `litert-community/Llama-3.2-3B` (origen) | 3,21B | 128k (base) | Llama 3.2 Community | `.litertlm`, mantenedor oficial de LiteRT |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 128k | Llama 3.2 Community | safetensors en BF16/FP16 |
| `Qwen2.5-3B-Instruct` | 3,09B | 32k (128k con YaRN) | Apache 2.0 | safetensors, GGUF |
| `google/gemma-2-2b-it` | 2,6B | 8k | Gemma Terms | safetensors, GGUF |
| `microsoft/Phi-3.5-mini-instruct` | 3,8B | 128k | MIT | safetensors, GGUF |

No se dispone de comparativas de rendimiento cuantitativas entre estos modelos en la informacion proporcionada, por lo que la tabla se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a un modelo de 3B: puede inventar hechos, citas o cifras con aparente seguridad.
- Capacidad de razonamiento y de conocimiento factual muy inferior a modelos de mayor tamano; no es adecuado para tareas que exijan alta precision.
- La cuantizacion int4 mixta puede degradar la coherencia y el seguimiento de instrucciones frente a los pesos en BF16; no se cuantifica esa perdida.
- Corte de conocimiento en diciembre de 2023: no conoce hechos posteriores.
- No se documentan los idiomas ni el comportamiento especifico del espejo; se asume el soporte de los ocho idiomas oficiales del modelo base.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (atribucion, limite de 700 millones de usuarios mensuales, nombre de producto "Built with Llama"), y obliga a incluir el texto de licencia y la clausula de uso aceptable.
- Es un espejo de terceros sin descargas ni validacion publica; conviene contrastar la integridad del archivo con el repositorio oficial `litert-community/Llama-3.2-3B` antes de usarlo en produccion.
- Repositorio de 0 descargas y 0 likes: sin evidencia de uso ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/warped-community/Llama-3.2-3B-litert-lm
- Repositorio de origen de la conversion LiteRT: https://huggingface.co/litert-community/Llama-3.2-3B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
