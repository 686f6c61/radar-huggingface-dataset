# WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3

## Resumen

Inkling 2 Mini UD-IQ4_XS NInfer v3 es un artefacto de inferencia empaquetado por WaveCut para el motor NInfer v3, construido a partir del modelo Inkling 2 Mini de Thinking Machines. El modelo base es un transformer con arquitectura de bucle (looped transformer) y mezcla de expertos (MoE) de 26.400 millones de parametros totales, con 3.400 millones activos por token, que incluye torre de vision y capacidad de tool calling. Este artefacto concreto no es un modelo nuevo ni un reentrenamiento: es una conversion del GGUF UD-IQ4_XS de Unsloth a un unico fichero `.ninfer` de 17.230.821.888 bytes (16,0 GiB), conservando los bloques ggml del GGUF byte a byte, sin recuantizar las matrices.

La relevancia de este artefacto reside en que agrupa en un solo fichero todo lo necesario para ejecutar el modelo completo: pesos cuantizados del modelo principal, la torre de vision en Q8_0, el drafter DSpark del release original y el drafter DFlash2 de incoai para decodificacion especulativa, ademas del tokenizador y la plantilla de chat. El motor NInfer multiplica los bloques en su sitio, de modo que la cuantizacion del modelo principal se mantiene intacta y solo el drafter DFlash2 se cuantiza a Q8_G32 (8 bits en grupos de 32, escalas FP16).

El artefacto esta pensado para NInfer-all (rama `master` de `iamwavecut/ninfer-all`) y requiere versiones concretas del motor: las builds estandar de NInfer rechazan el fichero, y el drafter DSpark necesita el commit `603a99ca` o posterior (release `2026-11-24.1`), mientras que DFlash2 requiere `2026-11-24.7` o posterior. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE con torre de vision ViT y drafters de decodificacion especulativa |
| Parametros totales | 26,4 mil millones (modelo base) |
| Parametros activos | 3,4 mil millones por token (MoE) |
| Longitud de contexto | no disponible (la atencion usa ventana de 1.024 posiciones en la mayoria de capas, con capas 5, 11, 17 y 23 sobre todas las posiciones; el drafter DFlash2 usa ventana de 2.048) |
| Tipos de cuantizacion | Modelo principal: NVFP4 (20 capas), Q5_K, Q4_K, IQ4_XS, Q5_0, IQ4_NL (4 capas), Q8_0/Q6_K/Q5_K en atencion; torre de vision Q8_0; DSpark Q8_0; DFlash2 Q8_G32; router, normas y controladores en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto unico para el motor NInfer); origen GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucle: 24 capas almacenadas que se ejecutan como 48 visitas. El preludio (capas 0-5) y la coda (capas 18-23) se ejecutan una vez, mientras que el nucleo (capas 6-17) se recorre tres veces con los mismos pesos, manteniendo en cada visita sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de 128 dimensiones, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks; las capas 5, 11, 17 y 23 atienden sobre todas las posiciones y el resto sobre 1.024.

La capa MoE contiene 128 expertos enrutados, 8 por token, con puntuaciones sigmoideas y sesgo de seleccion, activacion SiTU sobre `[gate; up]` de anchura 1152 y sin experto compartido. La tabla de tokens tiene 201.024 filas con cabeza no atada (200.058 puntuadas, tope suave 30). El artefacto incorpora ademas la torre de vision del release (ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas, hasta 4.096 posiciones por imagen) y dos drafters para decodificacion especulativa: DSpark (tres bloques no causales con cabeza Markov de rango 256) y DFlash2 (cinco capas de ventana deslizante sobre el ancla y 7 mascaras, ventana de 2.048 posiciones, con selector condicional sobre los 16 mejores tokens de cada fila). No se dispone de informacion sobre el volumen o la composicion de los datos de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo expone su razonamiento en bloques propios que el motor NInfer procesa de forma separada.
- Tool calling: los bloques JSON de llamada a herramientas se devuelven como tool calls en formato OpenAI, con argumentos estrictos y salida estructurada.
- Capacidades de agente: soporta decisiones tipadas, reranking y razonamiento multi-paso.
- Vision: procesamiento de imagenes a traves de la torre ViT incluida, con hasta 4.096 posiciones por imagen (pipeline image-text-to-text).
- Decodificacion especulativa: tres modos disponibles (DSpark por defecto con una peticion en curso, DFlash2 mediante `--spec dflash2`, o por busqueda en contexto).
- Concurrencia: de una a ocho peticiones simultaneas con reutilizacion de prefijo de prompt.
- Idiomas: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con reutilizacion de prefijo de prompt y hasta ocho peticiones concurrentes, lo que reduce el coste de recalcular contexto en dialogos largos.
- Agentes con herramientas en produccion: la devolucion de tool calls en formato OpenAI con argumentos estrictos permite integrar el modelo en orquestadores de agentes existentes sin capa de traduccion adicional.
- Analisis de documentos con imagenes: la torre de vision integrada permite procesar capturas, formularios o diagramas junto con texto en un mismo pipeline image-text-to-text.
- Generacion de codigo asistida: combinado con tool calling y salida estructurada, el modelo puede invocarse desde pipelines de CI/CD para tareas de revision o generacion con validacion de esquema.
- Reranking y clasificacion tipada: las capacidades de decisiones tipadas y reranking del motor permiten usarlo como componente de ordenacion en sistemas de busqueda o RAG.
- Despliegue en hardware limitado: al ocupar 16,0 GiB en disco con cuantizacion mixta NVFP4/IQ4_XS y decodificacion especulativa, es viable en estaciones de trabajo con una sola GPU de gama alta para inferencia interactiva.
- Servicio de inferencia multiusuario: el soporte de hasta ocho peticiones concurrentes con reutilizacion de prefijo lo hace adecuado para endpoints internos de un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero pesa 16,0 GiB, por lo que se necesita al menos esa cantidad para cargar los pesos, mas memoria para cache KV, estados de las visitas del bucle e historiales de convolucion.
- Los expertos enrutados pueden residir en la GPU, en memoria de host fijada (pinned) o leerse directamente del fichero, lo que permite ajustar el consumo de VRAM segun el hardware.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Opciones de despliegue: exclusivamente el motor NInfer (rama `master` de `iamwavecut/ninfer-all`), con releases `2026-11-24.1` o posterior para DSpark y `2026-11-24.7` o posterior para DFlash2. Las builds estandar de NInfer rechazan este fichero.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Mini (este artefacto) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | `.ninfer` |
| Inkling 2 Mini (GGUF de Unsloth) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | GGUF |
| Inkling 2 Mini (original de Thinking Machines) | 26,4 B | 3,4 B | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor: el fichero solo funciona con NInfer-all y versiones concretas; las builds estandar de NInfer lo rechazan, lo que limita la portabilidad frente a GGUF o safetensors.
- Compatibilidad de drafters: DSpark exige el commit `603a99ca` o posterior y DFlash2 exige el release `2026-11-24.7` o posterior; versiones anteriores no fueron probadas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no disponible.
- Idiomas: no se documenta la cobertura linguistica, por lo que no puede garantizarse un rendimiento adecuado fuera de los idiomas del entrenamiento original.
- Contexto: la ventana efectiva de atencion esta limitada a 1.024 posiciones en la mayoria de capas (con cuatro capas sobre todas las posiciones), lo que condiciona el uso con documentos muy largos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el artefacto hereda las condiciones del modelo base y de los componentes de terceros (Unsloth, ggml-org, incoai) que deben verificarse por separado.
- Integridad: conviene verificar el SHA-256 (`2edfaa1194be24782358867903df5f5d15083e837376c88f7d7dc9c7327caa28`) antes de desplegar, dado que el fichero se distribuye como binario unico.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all: https://github.com/iamwavecut/ninfer-all
