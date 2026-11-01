# UraionLabs/LFM3-1.7B-MLX-oQ4e

## Resumen

LFM3-1.7B-MLX-oQ4e es una cuantizacion de 4 bits del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicada por Uraion Labs y empaquetada especificamente para Apple Silicon mediante la libreria MLX. El modelo base es un transformer de arquitectura tri-hibrida (convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global) de 1.730 millones de parametros, orientado a agentes locales, tool calling y salidas estructuradas. Esta variante reduce el peso en disco a 1,04 GB, lo que la hace viable en Macs de gama consumer.

La relevancia de esta ficha reside en que el modelo combina una ventana de contexto nativa de 262.144 tokens con un tamano de pesos de aproximadamente 1 GB y un rendimiento medido de unas 203 tokens/s en decodificacion de un solo flujo sobre un Apple M5 Pro. Es, por tanto, una opcion realista para inferencia en dispositivo (on-device) en macOS, sin GPU dedicada ni servidores remotos.

La cuantizacion emplea el preset oQ4e de oMLX, que asigna precision mixta por capa (4, 5, 6 y 8 bits) segun un analisis de sensibilidad, con un promedio efectivo de unos 4,80 bits por peso. El modelo soporta 16 idiomas, incluido el castellano, y ofrece razonamiento nativo mediante etiquetas `<think>` y llamadas a herramientas en formato XML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` (`lfm3`), tri-hibrida: 13 convoluciones cortas con compuerta, 5 atenciones de ventana deslizante (ventana 256) y 6 atenciones globales; 24 capas en total |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (entrada + salida) |
| Tipos de cuantizacion | oQ4e (4 bits base, mixta 4/5/6/8 bits; 37 capas a 5 bits, 2 a 6 bits, 4 puertas de atencion a 8 bits); grupo de 64, modo affine; ~4,80 bits efectivos por peso |
| Idiomas soportados | 16: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, castellano, vietnamita, tailandes, indonesio, hindi, ruso y polaco |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other` en HuggingFace) |
| Formato de pesos | MLX safetensors (un unico `model.safetensors` de 1.037.627.479 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura tri-hibrida que alterna tres tipos de capas: 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante con ventana de 256 tokens y 6 capas de atencion global. La atencion usa GQA con 16 cabezas de consulta y 4 cabezas de clave/valor, con dimension de cabeza 128. El vocabulario es de 128.000 tokens. Esta combinacion busca reducir el coste computacional de la atencion en contextos largos manteniendo capacidad de modelado global.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La model card del repositorio cuantizado describe unicamente el proceso de cuantizacion: el preset oQ4e de oMLX aplica un analisis de sensibilidad por capa para decidir la asignacion de bits, elevando a 5 bits las proyecciones de atencion (q/k/v/o), la proyeccion descendente de la FFN y los embeddings, a 6 bits dos capas concretas y a 8 bits cuatro puertas de atencion. Los embeddings y la cabeza de salida estan atados y se mantienen a 5 bits.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento nativo mediante etiquetas `<think>`.
- Tool calling y function calling en formato XML, con busqueda diferida de herramientas (deferred tool search).
- Salidas estructuradas (structured output), adecuadas para integracion en pipelines que requieren JSON u otros formatos validables.
- Capacidades agenticas y razonamiento multi-paso, orientadas a agentes locales.
- Soporte multilingue en 16 idiomas, incluidos castellano, arabe, chino, japones, coreano, hindi y las principales lenguas europeas.
- Ventana de contexto larga de 262.144 tokens para entrada y salida.
- Ejecucion nativa en Apple Silicon (M1 a M5) mediante MLX, oMLX y mlx-vlm.

## Casos de uso

- Agentes locales en macOS: el modelo puede ejecutarse integramente en un Mac con Apple Silicon y gestionar bucles de razonamiento y llamadas a herramientas sin conexion a servicios externos, gracias a su soporte de tool calling XML y a su tamano de ~1 GB.
- Asistente de codigo en el editor: con 262.144 tokens de contexto puede ingerir varios ficheros de un repositorio y responder consultas sobre ellos, manteniendo la conversacion en local.
- Automatizacion de atencion al cliente: la ventana de contexto larga permite conservar historiales multi-turno extensos y el modo `<think>` facilita respuestas razonadas; el soporte de 16 idiomas cubre mercados internacionales.
- Extraccion de datos estructurados: su capacidad de salida estructurada permite convertir documentos o conversaciones en JSON validable dentro de pipelines de procesamiento por lotes.
- Procesamiento de documentos largos en dispositivo: informes, contratos o transcripciones que superan la ventana de modelos convencionales pueden analizarse sin enviar datos a la nube, lo que resulta relevante por privacidad.
- Prototipado rapido de aplicaciones LLM: el peso reducido y la velocidad de ~203 tokens/s en un M5 Pro permiten iterar sobre prompts y flujos agenticos en un portatil antes de desplegar en infraestructura mayor.
- Despliegue en entornos con conectividad limitada: al caber en ~1 GB y ejecutarse en Metal, es viable en equipos de campo o portatiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las pruebas realizadas (una comprobacion matematica corta y una llamada a la herramienta `get_weather` en estilo OpenAI) son smoke tests y no una ejecucion completa de benchmarks.

Los unicos datos de rendimiento disponibles son los de velocidad de decodificacion medidos por Uraion Labs en un Apple M5 Pro (64 GB), macOS 27, oMLX 0.7.3, con 800 tokens generados y promedio de 2 ejecuciones:

| Variante | Bits base | Tamano | Velocidad de decodificacion |
|---|---|---|---|
| oQ8e | 8 bits | 1,84 GB | ~130 tok/s |
| oQ6e | 6 bits (mixta 6/8) | 1,45 GB | ~152 tok/s |
| oQ5e | 5 bits (mixta 5/6/8) | 1,23 GB | ~174 tok/s |
| oQ4e (esta ficha) | 4 bits (mixta 4/5/6/8) | 1,04 GB | ~203 tok/s |

## Requisitos de hardware

- VRAM/unificada estimada: aproximadamente 1,04 GB solo para los pesos; el consumo real de memoria unificada es mayor por el estado de inferencia, el contexto y el runtime, aunque no se especifica una cifra concreta en la informacion disponible.
- GPU recomendadas: Apple Silicon de la familia M (M1 a M5) con Metal; el rendimiento medido corresponde a un M5 Pro con 64 GB de memoria unificada.
- Cabe en GPU consumer: si, en Macs con chip Apple Silicon; no esta pensado para GPU NVIDIA ni AMD, ya que el formato es MLX safetensors.
- Opciones de despliegue: oMLX 0.7.3 y mlx-vlm 0.7.11 o superior (que carga LFM3 como modelo solo de texto). El soporte en `mlx-lm` sigue en desarrollo upstream segun la model card.
- Latencia y throughput: ~203 tokens/s de decodificacion en un solo flujo sobre M5 Pro con 800 tokens generados; el rendimiento varia con el chip, la longitud de contexto y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ4e (esta ficha) | 1,73B | 262.144 | MLX safetensors, Apple Silicon | LFM Open License v1.0 | HuggingFace, ~1,04 GB |
| LFM3-1.7B-MLX-oQ6e | 1,73B | 262.144 | MLX safetensors, Apple Silicon | LFM Open License v1.0 | HuggingFace, 1,45 GB |
| LFM3-1.7B-MLX-oQ8e | 1,73B | 262.144 | MLX safetensors, Apple Silicon | LFM Open License v1.0 | HuggingFace, 1,84 GB |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 262.144 | Safetensors sin cuantizar | LFM Open License v1.0 | HuggingFace |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros fabricantes del mismo tamano. Las variantes oQ5e, oQ6e y oQ8e del mismo autor ofrecen un compromiso distinto entre calidad y velocidad, con velocidades de ~174, ~152 y ~130 tokens/s respectivamente frente a los ~203 tokens/s de esta variante.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantizacion; no hay informacion disponible al respecto.
- El riesgo de alucinacion es inherente a los modelos de 1,73B de parametros y no se cuantifica en la informacion disponible; conviene validar las salidas en produccion.
- La cuantizacion a 4 bits puede degradar la calidad frente a las variantes oQ5e, oQ6e y oQ8e; el autor solo confirma que las cuatro variantes superaron un smoke test, no una evaluacion completa.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es utilizable directamente en CUDA, ROCm ni en CPU convencional sin conversion.
- El soporte en `mlx-lm` esta en progreso upstream; la model card recomienda oMLX o mlx-vlm 0.7.11+ para su uso actual.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial que deben revisarse en el fichero LICENSE del repositorio; no se detallan en la informacion proporcionada.
- Los datos de velocidad proceden de una unica configuracion (M5 Pro, 64 GB, macOS 27, oMLX 0.7.3) y no son extrapolables a otros chips o longitudes de contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ4e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante oQ5e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ5e
- Variante oQ6e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ6e
- Variante oQ8e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ8e
- Sitio de Uraion Labs: https://uraionlabs.com
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
