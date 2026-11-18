# YTan2000/Qwen3.8-27B-TQ

## Resumen

Qwen3.8-27B-TQ es una distribución cuantizada del modelo Qwen3.8-27B (27.373.132.800 parámetros) publicada por el usuario YTan2000 para el motor de inferencia tqLLM 1.0. No se trata de un modelo nuevo, sino de una conversión a formato GGUF con tipos de tensor propios de tqLLM (TQ3 y TQ4) que comprimen los pesos hasta 3,125 y 4,125 bits por peso respectivamente, con el objetivo de ejecutar un modelo de 27B en GPUs de 16 GB y 24 GB sin degradar de forma apreciable la calidad respecto a BF16.

La ficha se apoya en la model card del autor, que documenta cinco variantes de pesos (TQ_XS, TQ_S, TQ_M, TQ_L y TQ_L-QSA) entre 11,85 GB y 14,83 GB, un modelo borrador DFlash2 para decodificación especulativa exacta y una caché KV cuantizada a unos 3 bits por valor. La relevancia actual está en que permite desplegar un modelo de razonamiento de 27B con contexto largo en hardware de consumo, a costa de depender de un motor propietario y no estándar.

La licencia declarada es Apache 2.0, heredada del modelo base, y el pipeline es text-generation con compatibilidad con endpoints OpenAI a través del servidor tqserve. El modelo solo declara inglés entre sus idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B; no se detalla en la información disponible si es denso o MoE) |
| Parámetros totales | 27.373.132.800 |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue; atención dispersa (QSA) a partir de 48K claves en la variante TQ_L-QSA |
| Tipos de cuantización | TQ3 (3,125 bits/peso) y TQ4 (4,125 bits/peso); caché KV en tq3 (~3 bits por valor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con tipos de tensor propios de tqLLM (300, 301); no cargable en llama.cpp, Ollama ni LM Studio |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. La información disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, composición del dataset de entrenamiento ni si hubo RLHF o DPO), por lo que esos datos deben consultarse en la model card original de Qwen. Sí se sabe que el modelo incluye una cabeza MTP (multi-token prediction) y una plantilla de chat propia, y que el autor de esta conversión ha sustituido la plantilla por una versión corregida de froggeric.

La innovación técnica de esta distribución es la cuantización por rotación: cada bloque de 128 pesos se rota para repartir los valores atípicos y se almacena con una única escala FP16 por bloque más códigos de 8 o 16 niveles, según TQ3 o TQ4. Este linaje procede de TurboQuant (Google Research). Además, la decodificación especulativa se realiza con un borrador DFlash2 (0,79 GB, pesos TQ3) que propone varios tokens y el modelo de 27B los valida en una sola pasada; según el autor, todos los tokens aceptados son exactos, de modo que la salida es la del propio modelo, solo más rápida. La variante TQ_L-QSA añade 16 indexadores QSA en FP16 que habilitan atención dispersa más allá de 48K claves.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable (`REASONING=on`).
- Razonamiento matemático: la model card reporta GSM8K del 94,6 % al 95,4 % según variante.
- Conocimiento general y experto: MMLU-Pro del 78,7 % al 83,5 % y GPQA Diamond del 82,83 % al 87,88 %.
- Generación de código: puntuaciones BenchLoop de coding entre 79,2 y 87,5 según variante.
- Tool calling / function calling: tarea toolcall de BenchLoop con 86,7 en las tres variantes medidas.
- Extracción de datos estructurados: tarea dataextract de BenchLoop entre 88,4 y 92,9.
- Seguimiento de instrucciones: tarea instructfollow entre 76,7 y 91,1, con variabilidad notable entre variantes.
- Contexto largo: 32K tokens en el ejemplo de despliegue, con caché KV cuantizada y volcado a RAM del sistema cuando no cabe en VRAM; atención dispersa a partir de 48K claves en TQ_L-QSA.
- Decodificación especulativa exacta mediante el borrador DFlash2 incluido.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`).
- Capacidades multimodales, de audio o de visión: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático en local: el modelo resuelve problemas de GSM8K con precisión superior al 94 % en las variantes medidas, por lo que puede usarse como asistente de resolución de problemas paso a paso en entornos sin conexión a la nube, aprovechando el modo thinking.
- Asistencia de código en estaciones de trabajo con GPU de 16 GB: la variante TQ_S cabe en una RTX 5060 Ti y ofrece 109 tok/s en código con el borrador activo, suficiente para autocompletado y revisión de parches en un IDE.
- Agentes con tool calling: la puntuación de 86,7 en la tarea toolcall y el servidor compatible con OpenAI permiten integrar el modelo en frameworks de agentes que ya hablan el protocolo de OpenAI, sustituyendo el endpoint por el servidor tqserve local.
- Procesamiento de documentos largos: con contexto de 32K tokens y la opción de mantener la caché KV más antigua en RAM del sistema, el modelo puede resumir o extraer datos de contratos, informes o expedientes que no caben en modelos más pequeños.
- Extracción de datos estructurados de texto libre: la tarea dataextract ronda el 88-93 %, lo que lo hace adecuado para convertir correos, formularios o transcripciones en JSON validable dentro de un pipeline ETL.
- Evaluación de calidad de modelos en investigación: las métricas KLD frente a BF16 (de 0,022 a 0,079) y el porcentaje de coincidencia en el token top (88,6 % a 93,7 %) permiten estudiar el impacto de la cuantización por rotación en tareas de razonamiento.
- Despliegue en DGX Spark / GB10: la variante TQ_L está pensada para GB10 y alcanza 72,4 tok/s en razonamiento, lo que habilita prototipos de agentes autónomos en hardware de bajo consumo.

## Benchmarks y rendimiento

Calidad por variante (datos de la model card; KLD sobre GB10, GSM8K/MMLU-Pro sobre GB10 salvo * en RTX 3090, GPQA sobre RTX 3090):

| Métrica | TQ_XS | TQ_S | TQ_M | TQ_L |
|---|---:|---:|---:|---:|
| Tamaño | 11,85 GB | 12,55 GB | 13,14 GB | 14,72 GB |
| KLD vs BF16 (menor es mejor) | 0,079 | 0,055 | 0,045 | 0,022 |
| Mismo token top que BF16 | 88,6 % | 90,1 % | 91,2 % | 93,7 % |
| GSM8K (1319, greedy, thinking on) | 95,4 % * | 94,6 % | - | 94,9 % |
| MMLU-Pro (subconjunto de 291 preguntas) | 78,7 % * | 83,2 % | - | 83,5 % |
| GPQA Diamond (198) | 84,85 % | 82,83 % | - | 87,88 % |

BenchLoop por tarea (RTX 3090, mismo motor):

| Tarea | TQ_XS | TQ_S | TQ_L |
|---|---:|---:|---:|
| speed | 92,6 | 93,2 | 91,9 |
| toolcall | 86,7 | 86,7 | 86,7 |
| coding | 79,2 | 85,4 | 87,5 |
| dataextract | 92,9 | 89,0 | 88,4 |
| instructfollow | 76,7 | 91,1 | 84,5 |
| reasonmath | 80,0 | 80,0 | 80,0 |

Velocidad (prompts canónicos de LocalMaxxing, borrador DFlash2-TQ3, contexto 32K, thinking on, mediana de tok/s):

| Hardware | TQ_XS razonamiento / código | TQ_S razonamiento / código | TQ_L razonamiento / código |
|---|---:|---:|---:|
| RTX 3090 24 GB | 271,3 / 149,8 | 251,7 / 173,4 | - |
| RTX 5060 Ti 16 GB (Windows 11 / WSL 2) | 175,9 / 98,8 | 166,5 / 109,0 | - |
| GB10 (DGX Spark) | 99,7 / 67,6 | 92,8 / 60,4 | 72,4 / 61,0 |

## Requisitos de hardware

- VRAM estimada: 11,85 GB (TQ_XS), 12,55 GB (TQ_S), 13,14 GB (TQ_M), 14,72 GB (TQ_L) y 14,83 GB (TQ_L-QSA) solo para pesos; hay que sumar la caché KV en tq3 y los buffers de inferencia.
- GPUs objetivo declaradas: TQ_XS y TQ_S para GPUs de 16 GB; TQ_L para GPUs de 24 GB y GB10.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB (Windows 11 / WSL 2) y RTX 3090 24 GB, con velocidades medidas de 166,5 a 271,3 tok/s en razonamiento.
- Cabe en Apple Silicon: la variante TQ_L-QSA es el archivo por defecto en Mac según la model card (filas de tqLLM 1.5.0), aunque no se aportan cifras de rendimiento para esa plataforma.
- Opciones de despliegue: exclusivamente el motor tqLLM 1.0 mediante contenedor (`ytan2000/tqllm:1.0.0` o `ghcr.io/turbo-tan/tqllm:1.0.0`), en x86-64 (RTX 30/40/50) y arm64 (GB10 / DGX Spark). No es compatible con llama.cpp, Ollama ni LM Studio.
- Memoria fuera de GPU: con `KV_FORMAT=tq3`, TqCache mantiene la caché KV más antigua en RAM del sistema cuando el contexto solicitado no cabe en la GPU, con coste de decodificación por PCIe.
- Throughput de referencia: 271,3 tok/s (TQ_XS, RTX 3090, razonamiento) y 98,8 tok/s (TQ_XS, RTX 5060 Ti, código).

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la información proporcionada, por lo que la comparación se limita a las variantes internas de esta misma distribución.

| Criterio | TQ_XS | TQ_S | TQ_L | TQ_L-QSA |
|---|---|---|---|---|
| Tamaño | 11,85 GB | 12,55 GB | 14,72 GB | 14,83 GB |
| KLD vs BF16 | 0,079 | 0,055 | 0,022 | no disponible |
| Mismo token top que BF16 | 88,6 % | 90,1 % | 93,7 % | no disponible |
| Hardware objetivo | GPU 16 GB | GPU 16 GB | GPU 24 GB / GB10 | Apple Silicon (por defecto) |
| Contexto largo | 32K con caché en RAM | 32K con caché en RAM | 32K con caché en RAM | atención dispersa > 48K claves |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 |

Comparación con alternativas de otros autores (Qwen3.8-27B en BF16, GGUF de unsloth u otros modelos de 27B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: los tensores TQ3/TQ4 usan tipos GGUF propios (300, 301) y no se pueden cargar en llama.cpp, Ollama ni LM Studio; el despliegue exige el contenedor tqLLM.
- Idiomas: la model card solo declara inglés; no hay datos sobre calidad en castellano ni en otros idiomas.
- Idiomas y sesgos del modelo base: no se documentan en la información disponible los sesgos conocidos de Qwen3.8-27B; deben consultarse en la model card original.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los modelos generativos, especialmente en modo thinking con razonamiento largo.
- Variante TQ_M experimental: solo dispone de KLD, sin puntuaciones de tareas, y el autor la excluye del conjunto validado por calidad.
- Ruido en las métricas: MMLU-Pro sobre 291 preguntas tiene un error estándar de unos 2,4 puntos y las diferencias de GSM8K entre archivos están dentro del ruido, según el propio autor.
- Variabilidad en instrucciones: la tarea instructfollow cae a 76,7 en TQ_XS frente a 91,1 en TQ_S, lo que sugiere que la variante más comprimida puede degradar el seguimiento de instrucciones.
- La velocidad con borrador depende del texto: el código y las respuestas con mucha copia aceptan más propuestas que la prosa abierta.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.8-27B y del borrador DFlash2 (el repositorio incluye un archivo `drafters/NOTICE` con su aviso de licencia).
- Fechas del repositorio: creado el 2026-10-08 y actualizado el 2026-11-17, con 8.103 descargas y 2 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor tqLLM: https://tqllm.com
- Créditos del motor: https://tqllm.com/credits
- Paper DFlash2: https://arxiv.org/abs/2602.06036
- Repositorio DFlash: https://github.com/z-lab/dflash
- GGUF BF16 de origen (unsloth): https://huggingface.co/unsloth
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Indexadores QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- TurboQuant (Google Research): https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/
