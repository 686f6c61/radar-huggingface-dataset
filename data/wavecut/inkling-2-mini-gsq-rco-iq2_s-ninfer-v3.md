# WaveCut/Inkling-2-Mini-GSQ-RCO-IQ2_S-NInfer-v3

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) con arquitectura de transformer "looped" (recurrente en profundidad) desarrollado por Thinking Machines. Cuenta con 26.400 millones de parametros totales y 3.400 millones activos por token, lo que lo situa en la categoria de modelos MoE de eficiencia media: capacidad de un modelo denso grande con coste de inferencia de uno mucho menor. El modelo procesa texto e imagenes (pipeline image-text-to-text) y esta orientado a razonamiento, tool calling y generacion de codigo.

Esta ficha concreta, publicada por WaveCut, no es el modelo original sino un artefacto de inferencia para el motor NInfer v3, construido a partir de la cuantizacion GSQ-RCO IQ2_S de ISTA-DASLab (2,75 bits por peso) y del tower de vision en Q8_0. Empaqueta ademas dos drafters de decodificacion especulativa (DSpark del release original y DFlash2 de incoai) en un unico fichero `.ninfer` de 9,75 GiB. La relevancia practica es que permite ejecutar el modelo completo, vision incluida, con decodificacion especulativa y tool calling estructurado, en hardware mucho mas modesto que el BF16 original.

La licencia es Apache 2.0 y el modelo base es `thinkingmachines/Inkling-2-Mini`. La informacion publica disponible es la model card del artefacto; no se han publicado datos detallados de entrenamiento ni resultados de benchmarks propios en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con profundidad recurrente (looped): 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, nucleo 6-17 tres veces, coda 18-23) |
| Parametros totales | 26,4 mil millones (26.4B) |
| Parametros activos | 3,4 mil millones (3.4B) por token |
| Longitud de contexto | No disponible de forma explicita; la atencion usa ventana de 1.024 posiciones en la mayoria de capas y global en las capas 5, 11, 17 y 23; el tower de vision admite hasta 4.096 posiciones por imagen |
| Tipos de cuantizacion | IQ2_S (2,75 bits por peso) como base GSQ-RCO; mezcla por tensor: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, Q2_0, IQ4_NL, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0, Q8_G32 (solo DFlash2), BF16 y FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto propietario del motor NInfer v3); derivado de GGUF |

## Arquitectura y entrenamiento

La arquitectura es un MoE con atencion multi-cabeza sobre 24 cabezas de consulta y 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y mecanismo de attention sinks. La capa de mezcla de expertos contiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoid mas un sesgo de seleccion y activacion SiTU sobre la concatenacion [gate; up] de anchura 1.152, sin experto compartido. El rasgo estructural mas distintivo es el bucle de profundidad: las capas 6-17 se reutilizan tres veces con los mismos pesos, cada visita con sus propias claves, valores e historiales de convolucion, lo que da 48 visitas efectivas con solo 24 capas almacenadas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable del artefacto es la decodificacion especulativa doble: incorpora el drafter DSpark del release original (tres bloques no causales sobre los estados del modelo objetivo y una cabeza Markov recurrente de rango 256) y el drafter DFlash2 de incoai (cinco capas de ventana deslizante sobre el ancla y 7 mascaras, ventana de 2.048 posiciones, con un selector condicional sobre los 16 mejores tokens de cada fila). El motor NInfer puede ademas usar busqueda por contexto como alternativa.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" con bloques de razonamiento propios del modelo.
- Generacion de codigo y resolucion de problemas matematicos (el modelo base se evalua sobre AIME25, GPQA-Diamond y LiveCodeBench v6).
- Comprension de imagenes mediante tower de vision ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas.
- Tool calling / function calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas (typed decisions) y reranking.
- Soporte de agentes y razonamiento multi-paso a traves de tool calling estructurado.
- Decodificacion especulativa integrada (DSpark, DFlash2 o busqueda por contexto) para acelerar la generacion.
- Reutilizacion de prefijo de prompt y concurrencia de una a ocho peticiones simultaneas en el motor NInfer.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con reutilizacion de prefijo de prompt en el motor NInfer, lo que reduce el coste de recalcular el contexto en cada turno y permite atender hasta ocho peticiones concurrentes en una sola instancia.
- Generacion de codigo en produccion: con tool calling estructurado y argumentos estrictos, puede integrarse en pipelines de CI/CD para tareas como generar parches, invocar herramientas de build o consultar APIs, devolviendo las llamadas en formato OpenAI directamente consumible.
- Agentes de razonamiento multi-paso: el modo thinking y la decodificacion especulativa permiten cadenas de razonamiento largas con latencia reducida, adecuadas para tareas de planificacion que requieren varias llamadas a herramientas.
- Analisis de documentos con imagenes: al procesar hasta 4.096 posiciones por imagen mediante el tower de vision Q8_0, puede extraer informacion de capturas, formularios o diagramas en flujos de digitalizacion.
- Asistente de investigacion tecnica: el modelo base se evalua sobre GPQA-Diamond y LiveCodeBench v6, por lo que es adecuado para responder preguntas tecnicas y verificar fragmentos de codigo en entornos de desarrollo.
- Despliegue en hardware de gama media: al ocupar 9,75 GiB en cuantizacion IQ2_S, permite servir el modelo completo con vision y drafters en una sola GPU de consumo alta o en varias GPU modestas, algo inviable con el BF16 original.
- Reranking y clasificacion tipada: las decisiones tipadas y el reranking integrados permiten usarlo como componente de seleccion en pipelines de recuperacion aumentada (RAG).

## Benchmarks y rendimiento

La model card indica que ISTA-DASLab midio el 94,3 % del rendimiento medio del release original sobre AIME25, GPQA-Diamond y LiveCodeBench v6 para la cuantizacion IQ2_S. No se han publicado los valores absolutos por benchmark en la informacion disponible.

| Benchmark | IQ2_S (respecto al release) | Valores absolutos |
|---|---|---|
| AIME25 | incluido en la media del 94,3 % | no disponible |
| GPQA-Diamond | incluido en la media del 94,3 % | no disponible |
| LiveCodeBench v6 | incluido en la media del 94,3 % | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `.ninfer` ocupa 9,75 GiB (10.472.926.720 bytes); a ello hay que sumar el estado de inferencia (KV cache de 8 cabezas KV de 128 dimensiones por visita, historiales de convolucion y buffers del motor). Como referencia practica, se necesita espacio para el fichero mas overhead, por lo que 12-16 GiB de VRAM o memoria mapeada es un punto de partida razonable.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, una RTX 4090 (24 GiB) o una A100/H100 permiten mantener el modelo completo en memoria de GPU; el motor tambien admite expertos enrutados en memoria de host fijada (pinned host memory) o leidos directamente del fichero.
- Cabe en GPU de consumo: si, en tarjetas con al menos 16 GiB de VRAM si se mantiene el modelo en memoria mapeada; con 24 GiB (RTX 3090/4090) hay margen para cache y buffers.
- Opciones de despliegue: el artefacto esta disenado para el motor NInfer v3 (rama `master` de `iamwavecut/ninfer-all`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles. El motor soporta decodificacion especulativa con DSpark (activa por defecto con una sola peticion) y DFlash2 (`--spec dflash2`), lo que reduce el numero de pasos de decodificacion, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion de esta ficha | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini GSQ-RCO IQ2_S (NInfer v3) | 26,4B / 3,4B | ventana 1.024 en la mayoria de capas, global en 4 capas | IQ2_S (2,75 bits), 9,75 GiB | Apache 2.0 | Hugging Face, motor NInfer |
| Inkling-2-Mini GSQ-RCO IQ3_S (NInfer v3) | 26,4B / 3,4B | idem | IQ3_S | Apache 2.0 | Hugging Face, motor NInfer |
| Inkling-2-Mini UD-Q2_K_XL (NInfer v3) | 26,4B / 3,4B | idem | Unsloth UD-Q2_K_XL | Apache 2.0 | Hugging Face, motor NInfer |
| Inkling-2-Mini UD-Q8_K_XL (NInfer v3) | 26,4B / 3,4B | idem | Unsloth UD-Q8_K_XL | Apache 2.0 | Hugging Face, motor NInfer |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, salvo la referencia del 94,3 % del release para IQ2_S. No se han identificado en la informacion disponible modelos de otros desarrolladores comparables en tamano y tarea.

## Limitaciones y advertencias

- La cuantizacion IQ2_S (2,75 bits por peso) implica una perdida medible de calidad: el 94,3 % del rendimiento medio del release original sobre tres benchmarks de razonamiento y codigo. Para tareas sensibles a precision, considerar IQ3_S o las variantes UD de mayor bitrate.
- El artefacto es especifico del motor NInfer v3 y del formato `.ninfer`; no es un GGUF directamente cargable en llama.cpp u otros motores, lo que limita la portabilidad.
- La ventana de atencion es de 1.024 posiciones en la mayoria de capas, con atencion global solo en las capas 5, 11, 17 y 23. Esto condiciona el manejo de contextos largos y debe validarse en cada caso de uso.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de error en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera del ingles sin evaluacion previa.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso `NOTICE` incluido en el repositorio y verificarse las licencias de los componentes de terceros empaquetados (tower de vision de ggml-org, drafter DSpark de Unsloth, drafter DFlash2 de incoai).
- El modelo depende de ficheros externos referenciados por revision concreta (tokenizer y chat template de `thinkingmachines/Inkling-2-Mini` en la revision `ed40e7da`); cambios en esos repositorios pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-GSQ-RCO-IQ2_S-NInfer-v3
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion GSQ-RCO IQ2_S de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Variante IQ3_S del mismo autor: https://huggingface.co/WaveCut/Inkling-2-Mini-GSQ-RCO-IQ3_S-NInfer-v3
- Variantes Unsloth UD-IQ1_M: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Variantes Unsloth UD-Q2_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Variantes Unsloth UD-Q3_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Variantes Unsloth UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Variantes Unsloth UD-Q8_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q8_K_XL-NInfer-v3
- Variante APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Paper de referencia: arxiv:2604.18556 (segun los tags del repositorio)
