# wiktorwojcik112/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo LFM3-1.7B desarrollado por Liquid AI, un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) diseñado para generación de texto conversacional. Esta ficha concreta corresponde al repositorio de cuantizaciones publicado por el usuario wiktorwojcik112, que empaqueta los pesos del modelo original en formato GGUF para permitir inferencia local en CPU y GPU mediante llama.cpp y herramientas compatibles como LM Studio, Ollama o Llama.app.

El modelo base pertenece a la familia LFM3 de Liquid AI, una tercera generación de modelos de lenguaje orientados a despliegue en dispositivo (on-device) y entornos con recursos limitados. Con un tamaño de 1,7 mil millones de parámetros, se posiciona en la categoría de modelos pequeños que pueden ejecutarse en hardware de consumo, manteniendo soporte para 16 idiomas (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco).

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar el modelo en local sin necesidad de GPUs de datacenter, con cuantizaciones que van desde formatos de alta precisión hasta NVFP4 optimizado para GPUs NVIDIA Blackwell. El repositorio incluye además una variante NVFP4 convertida desde un checkpoint cuantizado con NVIDIA Model Optimizer, pensada para aprovechar los tensor cores FP4 de las RTX 50 series y DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles especificos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (aproximadamente 1,7 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF (el repo incluye Q4_K_M y otras; ademas NVFP4 con pesos feed-forward en NVFP4 y resto en Q8_0) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-1.7B mas alla de que pertenece a la familia LFM3 de Liquid AI y que se distribuye como un transformer de 1,7 mil millones de parametros. La model card de esta ficha GGUF remite explicitamente a la model card original de LiquidAI/LFM3-1.7B para los detalles de arquitectura y uso, por lo que no se dispone aqui de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta ficha es el proceso de cuantizacion. Los archivos GGUF estandar se convierten desde LFM3-1.7B, mientras que el archivo `LFM3-1.7B-NVFP4.gguf` se convierte desde un checkpoint separado (LiquidAI/LFM3-1.7B-NVFP4) cuantizado a NVFP4 con NVIDIA Model Optimizer. En ese archivo, los pesos feed-forward conservan la cuantizacion NVFP4 del checkpoint original y el resto de pesos se almacenan en Q8_0. En GPUs NVIDIA Blackwell (RTX 50 series, DGX Spark) las capas NVFP4 se ejecutan sobre tensor cores FP4, lo que reduce el uso de memoria y acelera la inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Soporte multilingue para 16 idiomas: ingles, arabe, chino, frances, alemán, italiano, japones, coreano, portugues, español, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento y matematicas: la model card recomienda parametros de muestreo especificos para matematicas y ciencia (temperature 1.0, top_p 0.95, top_k 20), lo que sugiere capacidad para tareas de razonamiento y calculo.
- Inferencia local en CPU y GPU mediante llama.cpp, LM Studio, Ollama y Llama.app.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede ejecutarse con Ollama (`ollama run lfm3`) o LM Studio en macOS, Windows y Linux, gestionando conversaciones multi-turno sin enviar datos a la nube. Es adecuado por su tamano de 1,7 B, que cabe en equipos de consumo.
- Procesamiento de texto multilingue en local: con soporte para 16 idiomas, se puede usar para traduccion, resumen o generacion de contenido en español, frances, aleman, arabe, chino, japones, entre otros, sin depender de APIs externas.
- Prototipado rapido de aplicaciones de IA generativa: los desarrolladores pueden integrar el modelo via llama.cpp en pipelines de prueba con bajo coste de infraestructura, usando cuantizaciones Q4_K_M para minimizar requisitos de memoria.
- Educacion e investigacion: sirve como modelo de referencia para experimentos de cuantizacion y evaluacion de modelos pequenos, especialmente la variante NVFP4 en GPUs Blackwell.
- Generacion de codigo asistida en entornos de desarrollo: aunque no se confirma soporte explicito de tool calling, el modelo puede emplearse para autocompletado y generacion de fragmentos de codigo en editores locales mediante integraciones con llama.cpp.
- Despliegue en dispositivos con recursos limitados: la cuantizacion GGUF permite ejecutar el modelo en portatiles y estaciones de trabajo sin GPU dedicada, usando la CPU para inferencia.
- Tareas de razonamiento matematico y cientifico: con los parametros de muestreo recomendados (temperature 1.0, top_p 0.95, top_k 20), puede emplearse en resolucion de problemas y asistencia en calculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa basada en el tamano (1,7 B parametros), una cuantizacion Q4_K_M ocuparia aproximadamente 1-1,5 GB, Q8_0 en torno a 1,8-2 GB, y la variante NVFP4 con capas Q8_0 seria algo mayor; estos valores son estimaciones y no datos confirmados por el autor.
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, DGX Spark) para aprovechar los tensor cores FP4 con la variante NVFP4. Para el resto de cuantizaciones, cualquier GPU compatible con llama.cpp.
- Cabe en GPU de consumo: si, por el tamano del modelo (1,7 B), es adecuado para GPUs de consumo como RTX 4090 y gamas inferiores, aunque no se especifican requisitos minimos oficiales.
- Opciones de despliegue: llama.cpp (version b11960 / v0.8.0 o superior), LM Studio (motor llama.cpp 2.65.1 o superior), Ollama (v0.40.12 o superior), Llama.app (llama.cpp v0.8.0 o superior).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparativas con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo entrenado con datos web, es probable que herede sesgos, pero no se documentan.
- Riesgo de alucinacion: no documentado en la informacion disponible; como todo modelo generativo de 1,7 B, es esperable un riesgo de alucinacion superior al de modelos mayores.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; el soporte multilingue cubre 16 idiomas, pero no se detalla la calidad por idioma.
- Restricciones de licencia: la licencia es lfm1.0 (etiquetada como "other"), por lo que es imprescindible revisar el archivo LICENSE del repositorio antes de un uso comercial.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-27), lo que sugiere que es una publicacion reciente y sin validacion comunitaria. Se recomienda verificar la integridad de los archivos y probar el modelo antes de usarlo en produccion. La variante NVFP4 requiere hardware NVIDIA Blackwell para aprovechar sus ventajas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wiktorwojcik112/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Checkpoint NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Repositorio GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en llama.cpp: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Llama.app: https://llama.app
