# UraionLabs/LFM3-1.7B-MLX-oQ5e

## Resumen

LFM3-1.7B-MLX-oQ5e es una cuantizacion en formato MLX del modelo LiquidAI/LFM3-1.7B, desarrollado originalmente por Liquid AI y adaptado por Uraion Labs para su ejecucion nativa en Apple Silicon (M1 a M5). Emplea la arquitectura tri-hibrida de LFM3, que combina convoluciones cortas con puerta (gated short convolutions), atencion de ventana deslizante y atencion global, lo que reduce el coste computacional frente a un transformer denso clasico manteniendo una ventana de contexto de 262.144 tokens.

El modelo esta pensado para agentes locales, tool calling, salidas estructuradas y razonamiento nativo mediante el bloque `<think>`. Con 1,73 mil millones de parametros y un peso de 1,23 GB en disco, esta disenado para inferencia on-device en Macs, sin necesidad de GPU dedicada ni de conexion a la nube.

La cuantizacion oQ5e aplica precision mixta (5/6/8 bits) por capa, con un perfil de 29 capas a 6 bits y 8 capas a 8 bits, alcanzando unos 5,70 bits efectivos por peso. Segun el autor, rinde a unos 174 tokens/s en decodificacion mono-stream sobre un M5 Pro, lo que lo situa como una opcion equilibrada entre calidad y velocidad dentro de la familia de cuantizaciones oQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm3ForCausalLM` (`lfm3`), tri-hibrida: 13 convoluciones cortas con puerta, 5 capas de atencion de ventana deslizante (ventana 256) y 6 capas de atencion global |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (entrada + salida) |
| Tipos de cuantizacion | oQ5e (precision mixta 5/6/8 bits, grupo 64, modo affine); familia oQ completa disponible: oQ8e, oQ6e, oQ5e, oQ4e |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other` en Hugging Face) |
| Formato de pesos | MLX safetensors (un unico `model.safetensors` de 1.232.089.463 bytes) |

## Arquitectura y entrenamiento

LFM3-1.7B se basa en una arquitectura tri-hibrida de 24 capas que combina tres tipos de bloque: 13 capas de convolucion corta con puerta, 5 capas de atencion de ventana deslizante con ventana de 256 tokens y 6 capas de atencion global. La atencion usa GQA con 16 cabezas de consulta y 4 cabezas KV, con dimension de cabeza 128. El vocabulario es de 128.000 tokens. Esta mezcla busca reducir el coste cuadratico de la atencion en contextos largos manteniendo capacidad de modelado global.

La model card del autor de la cuantizacion no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Liquid AI y no esta incluida en la informacion disponible. La innovacion destacable de esta publicacion es la propia cuantizacion: el preset oQ5e asigna bits por capa mediante un analisis de sensibilidad de oMLX, elevando a 6 bits 29 capas (atención q/k/v/o, gate, una proyeccion down de FFN y embeddings) y a 8 bits 8 capas (gates de atencion y una proyeccion k), con embeddings y cabeza de salida compartidos a 6 bits.

## Capacidades

- Generacion de texto conversacional y razonamiento nativo mediante el bloque `<think>`.
- Tool calling y function calling en formato XML, con busqueda diferida de herramientas (deferred tool search).
- Salidas estructuradas y compatibilidad con flujos de agentes (etiquetas `agent`, `agentic`, `hermes-agent`, `openclaw`).
- Razonamiento multi-paso para tareas de agente.
- Soporte multilingue en 16 idiomas, incluidos espanol, ingles, chino, arabe, japones, coreano, hindi y las principales lenguas europeas.
- Contexto largo de hasta 262.144 tokens para entrada y salida.
- Ejecucion local en Apple Silicon mediante MLX, con soporte en oMLX y mlx-vlm (0.7.11+).

## Casos de uso

- Agentes locales en macOS: el modelo puede orquestar tool calling y razonamiento multi-paso directamente en el Mac del usuario, sin enviar datos a la nube, gracias a su soporte nativo de agentes y a su ventana de 256K tokens.
- Asistentes de escritorio con contexto largo: permite mantener conversaciones multi-turno con documentos extensos cargados en contexto (hasta 262.144 tokens), adecuado para analisis de contratos, manuales o bases de codigo.
- Automatizacion de tareas con salidas estructuradas: su soporte de JSON/XML estructurado y function calling lo hace apto para pipelines que necesitan extraer datos o invocar APIs de forma fiable.
- Procesamiento multilingue on-device: al cubrir 16 idiomas, sirve para traduccion asistida, atencion al cliente multilingue o resumen de documentos en espanol, ingles, arabe, chino, etc., sin salir del equipo.
- Prototipado rapido de agentes en portatiles Apple: con solo 1,23 GB de pesos y ~174 tok/s en un M5 Pro, permite iterar sobre disenos de agente en local antes de desplegar en infraestructura mayor.
- Educacion e investigacion: su tamano reducido y su licencia abierta permiten experimentar con arquitecturas hibridas y tecnicas de cuantizacion mixta en equipos de consumo.
- Herramientas de productividad offline: clasificacion, resumen y generacion de texto en aplicaciones de escritorio que deben funcionar sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta un smoke test (una comprobacion matematica corta y una llamada de herramienta `get_weather` valida en formato OpenAI) para las cuatro variantes oQ, sin cifras de MMLU, HumanEval, GSM8K ni similares.

Datos de rendimiento medidos por el autor (decodificacion mono-stream en Apple M5 Pro de 64 GB, macOS 27, oMLX 0.7.3, 800 tokens generados, media de 2 ejecuciones):

| Variante | Bits base | Tamano | Velocidad de decodificacion |
|---|---|---|---|
| oQ8e | 8-bit | 1,84 GB | ~130 tok/s |
| oQ6e | 6-bit | 1,45 GB | ~152 tok/s |
| oQ5e (esta) | 5-bit | 1,23 GB | ~174 tok/s |
| oQ4e | 4-bit | 1,04 GB | ~203 tok/s |

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos ~1,5 GB libres para cargar los pesos de oQ5e (1,23 GB) mas el overhead de runtime y la cache KV; con contexto largo la memoria adicional crece de forma notable.
- GPU recomendadas: Apple Silicon M1 a M5 con memoria unificada; el autor midio en un M5 Pro de 64 GB.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon; no esta pensado para GPUs NVIDIA/AMD porque el formato es MLX.
- Opciones de despliegue: oMLX 0.7.3 y mlx-vlm 0.7.11+ (carga LFM3 como modelo solo texto). El soporte en mlx-lm esta aun en desarrollo upstream.
- Latencia y throughput: ~174 tok/s en decodificacion mono-stream sobre M5 Pro segun el autor; el rendimiento varia con el chip, la longitud de contexto y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-oQ5e (esta ficha) | 1,73B | 262.144 | MLX safetensors, oMLX / mlx-vlm | LFM Open v1.0 | Hugging Face (UraionLabs) |
| LFM3-1.7B-MLX-oQ6e | 1,73B | 262.144 | MLX safetensors, oMLX / mlx-vlm | LFM Open v1.0 | Hugging Face (UraionLabs) |
| LFM3-1.7B-MLX-oQ4e | 1,73B | 262.144 | MLX safetensors, oMLX / mlx-vlm | LFM Open v1.0 | Hugging Face (UraionLabs) |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 262.144 | safetensors (sin cuantizar) | LFM Open v1.0 | Hugging Face (Liquid AI) |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a modelos de otros fabricantes del mismo tamano.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon: el formato MLX no es portable a CUDA ni a CPU generica sin conversion.
- El soporte de LFM3 en mlx-lm esta incompleto; hay que usar oMLX o mlx-vlm 0.7.11+, lo que limita la integracion con ecosistemas estandar.
- No hay benchmarks publicados que permitan estimar la degradacion de calidad de la cuantizacion oQ5e frente al modelo base; el autor solo aporta un smoke test.
- Riesgo de alucinacion inherente a un modelo de 1,73B; no es adecuado para tareas que exijan alta precision factual sin verificacion.
- La licencia LFM Open v1.0 (`other` / `lfm1.0`) impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El contexto de 262.144 tokens es nominal; la memoria necesaria para la cache KV con contextos muy largos puede superar la disponible en equipos con poca memoria unificada.
- El rendimiento de ~174 tok/s se midio en un M5 Pro; en chips M1 o M2 la velocidad sera considerablemente menor.
- La model card no detalla sesgos conocidos, composicion del dataset ni tecnicas de alineacion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ5e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante oQ8e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ8e
- Variante oQ6e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ6e
- Variante oQ4e: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ4e
- Uraion Labs: https://uraionlabs.com
- oMLX: https://github.com/jundot/omlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia: https://huggingface.co/UraionLabs/LFM3-1.7B-MLX-oQ5e/blob/main/LICENSE
