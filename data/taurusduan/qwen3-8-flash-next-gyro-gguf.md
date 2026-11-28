# taurusduan/Qwen3.8-Flash-Next-Gyro-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro es una familia de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) con 125.743.653.760 parametros totales. La publica el usuario taurusduan en Hugging Face, mientras que el trabajo de cuantizacion y las herramientas asociadas provienen de AgentionAI (el README enlaza a agention.ai, al agente de codigo Marshall y a repositorios propios de llama.cpp). El objetivo declarado es ejecutar un modelo de 125B en una sola GPU de consumo, algo que las cuantizaciones convencionales no permiten a estos tamanos.

La propuesta tecnica se apoya en tres piezas: un esquema de cuantizacion propio (Agention Precision Rotor, APR) que almacena los expertos enrutados en una base rotada con tipos trellis (TQK6/TQK7, TQ2_T, TQP5-7), una tabla n-gram que permanece en disco para no consumir VRAM, y variantes dimensionadas por memoria de GPU: Gyro-S (27,64 GiB, tarjetas de 32 GB), Gyro-M (34,98 GiB, 48 GB) y Gyro-L (50,21 GiB, 64 GB de memoria unificada). El contexto declarado llega hasta 128k tokens.

Es relevante ahora porque demuestra una via practica para desplegar modelos MoE de gran tamano en hardware asequible (RTX 5090, Radeon R9700, Strix Halo) sin renunciar a decodificacion especulativa mediante un draft MTP. La contrapartida es la dependencia de runtimes no upstream: llama.cpp oficial aun no carga estos ficheros y hace falta Strata, strix-llama.cpp o el fork de AgentionAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); detalles de capas y expertos no disponibles |
| Parametros totales | 125.743.653.760 (125,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128k tokens (segun la model card) |
| Tipos de cuantizacion | TQ1_0 (Gyro-S), TQ2_0 (Gyro-M), TQ3_0 (Gyro-L); internamente tipos trellis TQK6/TQK7, TQ2_T y TQP5-7 con esquema APR |
| Idiomas soportados | no disponible (heredados del modelo base, sin listado publicado) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF; incluye draft MTP y proyector de vision como ficheros separados |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos de 125,7B parametros totales. La model card no detalla el numero de capas, la dimension oculta, el numero de expertos por capa ni cuantos se activan por token, por lo que esos datos figuran como no disponibles. Tampoco se publican el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO; solo se indica que el pipeline es image-text-to-text, lo que implica un proyector de vision multimodal.

La innovacion destacable no esta en el entrenamiento sino en el formato de almacenamiento. Los expertos enrutados se guardan en una base rotada mediante el codigo "rotor" de Agention (APR), y las etiquetas TQ1_0/TQ2_0/TQ3_0 son solo clases de tamano para el Hub: los tensores reales usan tipos trellis. Ademas, la tabla n-gram reside en disco, de modo que los pesos caben integramente en la GPU. El despliegue admite decodificacion especulativa con un draft MTP incluido en el repositorio, y existe una variante `-noPLE` mas pequena que se carga con el flag `--ple` y produce salida identica al fichero completo.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 128k tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante proyector de vision.
- Razonamiento y codigo: la familia incluye variantes especificas, como Signal 2 (ajustada sobre trabajo real de codificacion agentica) y Gyro-Coder (256 expertos de codigo por capa, 19,92 GiB).
- Tool calling y function calling: la model card reporta una reduccion del 27% de deriva en transcripciones de llamadas a herramientas en Gyro-S v2 y Gyro-M v2 frente a v1.
- Uso como agente de codificacion multi-paso, integrable con el agente Marshall de AgentionAI.
- Decodificacion especulativa mediante draft MTP para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codificacion en estacion de trabajo: con Gyro-S (27,64 GiB) en una RTX 5090 o Radeon R9700, el modelo cabe entero en VRAM y puede sostener sesiones de refactorizacion multi-archivo con 128k de contexto; la variante Signal 2 reduce un 27% los tokens de salida en las mismas tareas, acortando cada ejecucion.
- Asistente de terminal con tool calling: desplegado sobre Strata (app, terminal y motor), el modelo ejecuta llamadas a funciones con una deriva un 27% menor que la version anterior, lo que reduce fallos en cadenas de herramientas encadenadas.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con texto largo, util para extraccion de datos en pipelines internos.
- Servidor de inferencia privado en una sola GPU: con Gyro-M (34,98 GiB) en 48 GB (una tarjeta o 2x24 GB) se obtiene un endpoint compatible con la API de llama.cpp en localhost:8080, sin dependencia de la nube.
- Prototipado en hardware de memoria unificada: en un equipo Strix Halo con 64 GB, Gyro-L (50,21 GiB) ofrece mayor calidad que Gyro-S o Gyro-M manteniendo todo el modelo en memoria.
- Codificacion en GPU de 24 GB: Gyro-Coder (19,92 GiB) esta pensado para tarjetas de 24 GB y prioriza tareas de codigo, adecuado para entornos de desarrollo con presupuesto de VRAM ajustado.
- Evaluacion de cuantizaciones extremas: investigadores pueden medir la deriva (KLD) de esquemas APR frente a cuantizaciones convencionales; la model card cita KLD 0,249 para Gyro-M v2 frente a 0,311 de ISTA IQ3_XXS.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros). Los unicos datos cuantitativos son de calidad de cuantizacion y velocidad:

| Metrica | Valor | Contexto |
|---|---|---|
| Deriva en tool calls (Gyro-S v2 / Gyro-M v2) | 27% menos que v1 | Mismo tamano de fichero |
| KLD Gyro-M v2 | 0,249 | Frente a 0,311 de ISTA IQ3_XXS |
| Memoria GPU Gyro-M v2 | 20% menos que ISTA IQ3_XXS | Misma comparacion |
| Throughput Gyro-S en RTX 5090 con Strata | 221 tok/s (JSON), 140 tok/s (prosa), 209 tok/s (codigo) | Salida por tipo de contenido |

No se han publicado resultados de benchmarks en la informacion disponible para tareas de razonamiento, codigo o vision.

## Requisitos de hardware

- VRAM para Gyro-S: 27,64 GiB de pesos; pensado para tarjetas de 32 GB (RTX 5090, Radeon R9700).
- VRAM para Gyro-M: 34,98 GiB; para 48 GB en una tarjeta o 2x24 GB, y para equipos con 64 GB de memoria unificada.
- VRAM para Gyro-L: 50,21 GiB; orientado a 64 GB de memoria unificada (Strix Halo).
- VRAM para Gyro-Coder: 19,92 GiB; tarjetas de 16-24 GB.
- Tarjetas de 16-24 GB con Gyro-S: posible usando la cache de expertos de Strata, con parte de los expertos fuera de VRAM.
- La tabla n-gram permanece en disco y no consume VRAM; existe una variante `-noPLE` de descarga mas pequena.
- Runtimes compatibles: Strata 0.2.0 o superior (NVIDIA y AMD RX 7000/RX 9000/R9700), halo-box/strix-llama.cpp master (CPU, Vulkan, HIP) y agentionai/llama.cpp (CPU, Vulkan, CUDA, con soporte del draft MTP). llama.cpp upstream no carga estos ficheros.
- Throughput medido: 221 tok/s en JSON, 140 tok/s en prosa y 209 tok/s en codigo con Gyro-S en una RTX 5090 usando Strata.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Gyro (Gyro-S/M/L) | 125,7B totales (MoE) | 128k | TQ1_0 / TQ2_0 / TQ3_0 con APR | qwen-community-1.0 | Requiere runtimes no upstream (Strata, strix-llama.cpp, fork de AgentionAI) |
| Qwen3.8-Flash-Next (base) | 125,7B totales (MoE) | no disponible | safetensors (pesos originales) | qwen-community-1.0 | Referencia de calidad; no cabe en GPU de consumo |
| ISTA IQ3_XXS (cuantizacion de referencia citada) | no disponible | no disponible | IQ3_XXS | no disponible | Gyro-M v2 usa un 20% menos de memoria y deriva un 20% menos (KLD 0,249 frente a 0,311) |
| Signal 2 (variante de la misma familia) | 125,7B totales (MoE) | 128k | mismo tamano que Gyro-S | qwen-community-1.0 | Ajuste agentico de codigo; 27% menos tokens de salida en las mismas tareas |

No se dispone de datos de benchmarks que permitan comparar rendimiento por tarea con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Compatibilidad restringida: llama.cpp upstream no puede cargar estos ficheros; el despliegue exige Strata, strix-llama.cpp o el fork agentionai/llama.cpp, lo que limita la portabilidad y ata la solucion a herramientas de un tercero.
- Cuantizacion agresiva: TQ1_0 y TQ2_0 implican perdida de calidad frente a los pesos originales; la propia model card cuantifica deriva (KLD 0,249 en Gyro-M v2) y reducciones del 27% en errores de tool calling, lo que indica que la deriva existe.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad; en un modelo de este tamano y con cuantizacion extrema el riesgo es relevante en produccion.
- Idiomas: no se publica listado de idiomas soportados; el rendimiento fuera de los idiomas principales del modelo base no esta verificado.
- Licencia qwen-community-1.0: es una licencia comunitaria con condiciones especificas; debe revisarse antes de uso comercial. La model card la etiqueta como "other".
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Fechas del repositorio (creado en noviembre de 2026) y referencias a versiones v2 con revisiones concretas: conviene fijar la revision al desplegar, ya que los ficheros se reemplazan bajo el mismo nombre.
- Sin datos de parametros activos por token, lo que impide estimar con precision el coste de computo por inferencia.
- Las variantes abliterated (Gyro-abliterated-Huihui) eliminan rechazos de seguridad y no deberian usarse en aplicaciones orientadas al publico sin filtros adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Web de AgentionAI: https://www.agention.ai/
- Guia del modelo: https://agention.ai/models/qwen3.8-flash-next/
- Agente de codigo Marshall: https://marshall.agention.ai
- Variante Signal 2: https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Variante abliterated: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Variante Gyro-Coder: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Strata (runtime): https://github.com/Niko1221/Strata
- strix-llama.cpp (runtime): https://github.com/halo-box/strix-llama.cpp
- Fork de llama.cpp de AgentionAI: https://gitlab.com/agentionai-group/llama.cpp
- Fieldwork Ledger: https://www.fieldworkledger.com
