# WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3

## Resumen

Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3 es un artefacto de inferencia en formato propietario `.ninfer` (version 3 del motor NInfer) construido por WaveCut sobre el modelo Inkling 2 Mini de Thinking Machines. El modelo subyacente es un transformer con bucles (looped transformer) de tipo mezcla de expertos (MoE) con 26.400 millones de parametros totales y 3.400 millones activos por token, con capacidad de vision y tool calling. Este artefacto no es un modelo nuevo ni un reentrenamiento: es un empaquetado optimizado que conserva los bloques ggml del GGUF original byte a byte, sin recuantizar las matrices, y anade dos drafters de decodificacion especulativa.

La relevancia del artefacto esta en el empaquetado: reduce el peso a 13,5 GiB (frente a los 42,1 GB del repositorio completo, que incluye otros ficheros y revisiones) y permite, segun el plan de memoria del motor, que todos los expertos enrutados quepan en una GPU de 16 GB junto a un contexto de 12.000 tokens. Integra la torre de vision en Q8_0, el drafter DSpark de Unsloth y el drafter DFlash2 de incoai, y expone razonamiento, llamadas a herramientas en formato OpenAI, salida estructurada y decodificacion especulativa.

El modelo base procede de Thinking Machines y el GGUF intermedio de IsValorum (APEX-I MiniPlus V2.1). La licencia declarada es Apache 2.0. El artefacto esta atado a una linea concreta del motor NInfer: las builds estandar de NInfer rechazan este fichero y se requiere la rama `master` de `iamwavecut/ninfer-all`, release `2026-11-24.7` o posterior para el drafter DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y mezcla de expertos (MoE); 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, nucleo 6-17 tres veces con los mismos pesos, coda 18-23) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) por token |
| Longitud de contexto | 12.000 tokens en el plan de memoria de 16 GB; ventana de atencion de 1.024 posiciones en la mayoria de capas y sobre todas las posiciones en las capas 5, 11, 17 y 23; tabla aprendida de 1.024 distancias |
| Tipos de cuantizacion | Mezcla por tensor: Q4_K, Q6_K, Q8_0, IQ3_XXS, IQ3_S, IQ4_NL, Q5_0, Q8_G32 (solo drafter DFlash2), BF16 y FP32 en componentes sensibles (router, convoluciones, normas, controladores de bucle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (un unico fichero de 14.476.376.832 bytes, 13,5 GiB); derivado de GGUF; el drafter DFlash2 en Q8_G32 con escalas FP16 |
| Cabezas de atencion | 24 cabezas de consulta sobre 8 cabezas KV de 128 dimensiones, sin rotacion, con sinks |
| Expertos MoE | 128 expertos enrutados, 8 por token, puntuaciones sigmoid con sesgo de seleccion, SiTU sobre [gate; up] de anchura 1152, sin experto compartido |
| Vocabulario | 201.024 filas en la tabla de tokens; cabeza no atada de 200.058 puntuadas con soft cap 30 |
| Vision | ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2, proyector de dos capas, hasta 4.096 posiciones por imagen |
| Drafters | DSpark (tres bloques no causales, cabeza Markov de rango 256) y DFlash2 (cinco capas de ventana deslizante, ventana de 2.048 posiciones) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: 24 capas almacenadas se ejecutan como 48 visitas, donde el nucleo (capas 6-17) se recorre tres veces reutilizando los mismos pesos, cada visita con sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de 128 dimensiones, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks; la mayoria de capas atiende sobre 1.024 posiciones y las capas 5, 11, 17 y 23 sobre todas. La capa MoE tiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoid con sesgo de seleccion y activacion SiTU sobre la concatenacion [gate; up] de anchura 1152, sin experto compartido.

El artefacto no aporta datos de entrenamiento propios: hereda el modelo base de Thinking Machines y el GGUF de IsValorum. La innovacion tecnica del empaquetado es la preservacion byte a byte de los bloques ggml del GGUF (el motor multiplica los bloques in situ, sin recuantizar), la integracion de la torre de vision en Q8_0 desde `mmproj-Inkling-2-Mini-Q8_0.gguf`, y la incorporacion de dos drafters de decodificacion especulativa: DSpark de Unsloth (layout mainline de llama.cpp, requiere commit `603a99ca` o posterior) y DFlash2 de incoai (unico componente recuantizado a Q8_G32). El fichero contiene 1.254 objetos: 816 FP32, 179 Q8_0, 117 Q4_K, 48 BF16, 36 Q8_G32, 12 IQ3_S, 12 IQ3_XXS, 12 Q5_0, 12 IQ4_NL y 5 Q6_K. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, con el razonamiento del modelo expuesto en sus propios bloques.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante torre de vision ViT integrada, con hasta 4.096 posiciones por imagen.
- Llamadas a herramientas: los bloques JSON de tool-call se devuelven como llamadas de herramienta en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, ademas de reranking.
- Decodificacion especulativa con tres modos: drafter DSpark (por defecto con una peticion en curso), drafter DFlash2 (`--spec dflash2`) o por busqueda en contexto.
- Servicio concurrente de una a ocho peticiones con reutilizacion de prefijo de prompt.
- Gestion de expertos enrutados en GPU, en memoria de host fijada (pinned) o leidos directamente del fichero.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con reutilizacion de prefijo de prompt y hasta ocho peticiones concurrentes, lo que reduce el coste de recalcular contexto en dialogos largos.
- Agentes con herramientas en produccion: la devolucion de tool calls en formato OpenAI con argumentos estrictos permite integrarlo en orquestadores de agentes existentes sin capa de traduccion.
- Analisis de documentos con imagenes: la torre de vision en Q8_0 admite hasta 4.096 posiciones por imagen, util para extraer datos de capturas, formularios o diagramas combinados con texto.
- Generacion de codigo asistida: el razonamiento en bloques propios y la salida estructurada facilitan integrar el modelo en pipelines de CI/CD para revisiones o generacion de parches con validacion de esquema.
- Despliegue en hardware de gama media: con 13,5 GiB y el plan de memoria del motor, un unico equipo de 16 GB de VRAM puede alojar todos los expertos junto a un contexto de 12.000 tokens, adecuado para prototipos y entornos de borde.
- Reranking y clasificacion tipada: las decisiones tipadas y el reranking permiten usarlo como componente de recuperacion en sistemas RAG, ordenando candidatos con salida estructurada.
- Inferencia de baja latencia con decodificacion especulativa: los drafters DSpark y DFlash2 aceleran la generacion en escenarios de una sola peticion o de ventana deslizante, respectivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comparaciones de tamano de fichero (13,5 GiB, 2,6 GiB menos que el artefacto UD-IQ4_XS) y notas de compatibilidad de releases del motor, sin cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: 13,5 GiB para el fichero completo; segun el plan de memoria del motor, todos los expertos caben en una GPU de 16 GB junto a un contexto de 12.000 tokens. No se ha verificado en ninguna tarjeta de 16 GB segun el autor.
- GPU recomendadas: no disponible de forma explicita; por tamano, encaja en tarjetas de 16 GB o superiores (por ejemplo, RTX 4090 de 24 GB, A100, H100). El autor no confirma ejecuciones en modelos concretos.
- GPU de consumo: si, en principio cabe en tarjetas de 16 GB o mas, aunque el autor indica que ninguna tarjeta de 16 GB lo ha ejecutado todavia.
- Opciones de despliegue: exclusivamente el motor NInfer, rama `master` de `iamwavecut/ninfer-all`, release `2026-11-24.7` o posterior para el drafter DFlash2 (release `2026-11-24.1` o posterior para el layout mainline de DSpark). Las builds estandar de NInfer rechazan este fichero. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3 (este) | 26,4B | 3,4B | 12K en 16 GB | `.ninfer` (13,5 GiB) | Apache 2.0 | Solo motor NInfer; drafters DSpark y DFlash2 integrados |
| Inkling-2-Mini-UD-IQ4_XS-NInfer-v3 | 26,4B | 3,4B | no disponible | `.ninfer` (16,1 GiB aprox.) | Apache 2.0 | Expertos enrutados mayoritariamente NVFP4; 2,6 GiB mas grande |
| Inkling-2-Mini (Thinking Machines) | 26,4B | 3,4B | no disponible | safetensors | no disponible | Modelo base original |
| Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF (IsValorum) | 26,4B | 3,4B | no disponible | GGUF | no disponible | Fuente del GGUF intermedio |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor NInfer: las builds estandar rechazan el fichero; se requiere la rama `master` de `iamwavecut/ninfer-all` y releases concretas (`2026-11-24.7` o posterior para DFlash2, `2026-11-24.1` o posterior para DSpark). No funciona en llama.cpp, vLLM, Ollama ni TGI.
- El autor no ha verificado la ejecucion en ninguna tarjeta de 16 GB; el ajuste en 16 GB procede del plan de memoria del motor, no de una prueba real.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos; no hay evaluacion publicada.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Compatibilidad de revisiones: el fichero sin DFlash2 (13.840.832.768 bytes) queda en la revision `0350722c` y el convertido desde el layout anterior del drafter (13.740.465.920 bytes) en `5e169db7`; mezclar revisiones o releases puede romper la carga.
- El unico componente recuantizado es el drafter DFlash2 (Q8_G32); el resto conserva los bloques ggml originales, pero la calidad depende del GGUF de IsValorum y del modelo base de Thinking Machines, no verificada aqui.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del GGUF intermedio, cuya licencia no se detalla en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF intermedio: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Artefacto alternativo UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Drafter DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama del motor usada: https://github.com/iamwavecut/ninfer-all
