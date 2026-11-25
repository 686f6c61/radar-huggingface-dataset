# WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.400 millones de parametros totales y 3.400 millones activos por token. Su rasgo arquitectonico mas distintivo es que es un transformer "looped": almacena 24 capas, pero las ejecuta como 48 visitas, reutilizando los pesos del nucleo (capas 6-17) tres veces, cada una con sus propias claves, valores e historiales de convolucion. Ademas incorpora vision (torre ViT) y soporte nativo de tool calling y razonamiento, lo que lo situa en la categoria de modelos multimodales de razonamiento con huella de inferencia contenida.

La ficha que nos ocupa no es el modelo original, sino un artefacto de cuantizacion en formato `.ninfer` para el motor NInfer (version v3), publicado por el usuario WaveCut. Parte del GGUF UD-Q3_K_XL de Unsloth y conserva los bloques ggml byte a byte, sin recuantizar las matrices del modelo; el motor multiplica los bloques in situ. El unico componente recuantizado es el drafter DFlash2 de incoai, cuyas proyecciones pasan de BF16 a filas de 8 bits en grupos de 32 (Q8_G32).

Es relevante ahora porque demuestra un patron de despliegue de modelos MoE grandes en hardware modesto: el archivo final ocupa 14,09 GiB e incluye el modelo completo, la torre de vision en Q8_0, dos drafters de decodificacion especulativa (DSpark del release y DFlash2 de incoai) y la posibilidad de mantener los expertos enrutados en GPU, en memoria de host fijada o leerlos desde el propio archivo. La licencia Apache 2.0 del modelo base facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas en bucle (looped): 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, nucleo 6-17 tres veces, coda 18-23); MoE con 128 expertos enrutados |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) por token; 8 expertos de 128 por token |
| Longitud de contexto | No disponible como cifra unica; las capas 5, 11, 17 y 23 atienden todas las posiciones, el resto sobre ventanas de 1.024; la tabla de distancias aprendida cubre 1.024 distancias; la torre de vision admite hasta 4.096 posiciones por imagen |
| Tipos de cuantizacion | Artefacto UD-Q3_K_XL: expertos enrutados mayoritariamente NVFP4 e i-quants (IQ3_XXS, IQ2_S, IQ3_S, IQ2_XS, Q3_K); atencion en Q8_0, Q6_K, Q5_K y Q4_K por capa; tabla de tokens y cabeza en Q5_K; torre de vision en Q8_0; drafter DFlash2 en Q8_G32; router, convoluciones, normas y controladores en FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (un unico archivo de 15.128.844.544 bytes, 14,09 GiB); derivado de GGUF UD-Q3_K_XL |

## Arquitectura y entrenamiento

La arquitectura combina tres ideas. Primero, el bucle de profundidad: 24 capas fisicas se ejecutan como 48 visitas, con el nucleo (capas 6-17) repetido tres veces con los mismos pesos pero con estados de atencion y convolucion independientes por visita. Segundo, la atencion: 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks de atencion; las capas 5, 11, 17 y 23 atienden todas las posiciones y el resto opera sobre ventanas de 1.024. Tercero, el MoE: 128 expertos enrutados, 8 por token, puntuaciones sigmoid con sesgo de seleccion, activacion SiTU sobre la concatenacion [gate; up] de anchura 1152, y sin experto compartido.

La cabeza de salida esta desligada de la tabla de tokens (201.024 filas, 200.058 puntuadas, soft cap de 30). El artefacto incluye dos drafters de decodificacion especulativa: DSpark (tres bloques no causales sobre los estados del modelo objetivo, con cabeza de Markov recurrente de rango 256) y DFlash2 de incoai (cinco capas de ventana deslizante de 2.048 posiciones sobre el ancla y 7 mascaras, mas un selector condicional sobre los 16 mejores tokens de cada fila). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo produce su razonamiento en bloques propios, segun la model card del artefacto.
- Codigo y matematicas: no hay benchmarks publicados en la informacion disponible que cuantifiquen estas capacidades.
- Vision: torre ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas; hasta 4.096 posiciones por imagen.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada: soporte de structured output, decisiones tipadas y reranking.
- Agentes y razonamiento multi-paso: soportado mediante tool calling y bloques de razonamiento; no se detalla el numero de pasos maximos.
- Decodificacion especulativa: con el drafter DSpark del release (por defecto con una sola peticion en curso), con DFlash2 (`--spec dflash2`) o por busqueda en contexto.
- Concurrencia: una a ocho peticiones simultaneas con reutilizacion de prefijo de prompt.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con reutilizacion de prefijo de prompt y hasta ocho peticiones concurrentes, lo que reduce el coste de contexto repetido en dialogos largos.
- Agentes con herramientas en produccion: los bloques JSON de tool call se devuelven como tool calls de OpenAI con argumentos estrictos, lo que permite integrarlo en orquestadores de agentes existentes sin capa de traduccion.
- Analisis de documentos con imagenes: la torre de vision en Q8_0 admite hasta 4.096 posiciones por imagen, adecuada para capturas de pantalla, diagramas y formularios escaneados.
- Generacion de codigo asistida: el soporte de salida estructurada y decisiones tipadas permite integrarlo en pipelines que necesitan respuestas parseables (parches, comandos, configuraciones).
- Reranking y clasificacion: las decisiones tipadas y el reranking permiten usarlo como componente de recuperacion en sistemas RAG.
- Despliegue en hardware de gama alta de consumo: con 14,09 GiB de artefacto y expertos enrutados que pueden residir en memoria de host fijada o leerse del archivo, es viable en estaciones con una sola GPU de 24 GB, manteniendo los expertos fuera de VRAM.
- Servicio de inferencia con latencia reducida: la decodificacion especulativa con DSpark o DFlash2 acelera la generacion en cargas de una sola peticion.

## Benchmarks y rendimiento

La informacion disponible solo incluye la divergencia KL de la cuantizacion respecto a UD-Q8_K_XL, medida por Unsloth, no resultados de tareas.

| Metrica | Valor |
|---|---|
| KL media de UD-Q3_K_XL frente a UD-Q8_K_XL | 0,0174 |
| Mismo token superior que la referencia | 96,3 % de las posiciones |
| KL media de UD-IQ3_XXS (referencia comparativa) | 0,0269 (con 1,97 GB menos) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto completo ocupa 14,09 GiB; con los expertos enrutados en GPU se necesita margen adicional para cache KV (8 cabezas KV de 128 por capa, 24 capas) y estados de las 48 visitas.
- Estrategia de memoria: el motor permite mantener los expertos enrutados en GPU, en memoria de host fijada (pinned) o leerlos directamente desde el archivo `.ninfer`, lo que reduce el requisito de VRAM a costa de ancho de banda.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una GPU de 24 GB (RTX 4090, L4, A10G) es el minimo razonable con expertos fuera de VRAM, y A100/H100 para mantener todo el modelo en GPU.
- GPU de consumo: viable en RTX 4090 (24 GB) con los expertos en host o en archivo; en GPUs de 16 GB o menos no hay datos que confirmen su viabilidad.
- Opciones de despliegue: exclusivamente el motor NInfer, rama `master` de `iamwavecut/ninfer-all`, release `2026-11-24.1` o posterior para el drafter DSpark y `2026-11-24.7` o posterior para DFlash2. Las builds estandar de NInfer rechazan este archivo; llama.cpp, vLLM, Ollama y TGI no estan soportados para este artefacto.
- Latencia y throughput: no disponibles; la model card solo indica que la decodificacion especulativa con DSpark se activa por defecto con una sola peticion en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Inkling 2 Mini UD-Q3_K_XL (NInfer v3) | 26,4B | 3,4B | Ventanas de 1.024 en la mayoria de capas | Apache 2.0 | NInfer `.ninfer` |
| Inkling 2 Mini UD-IQ3_XXS (NInfer v3) | 26,4B | 3,4B | Igual | Apache 2.0 | NInfer `.ninfer`; 1,97 GB menos, KLD 0,0269 |
| Inkling 2 Mini UD-IQ1_M (NInfer v3) | 26,4B | 3,4B | Igual | Apache 2.0 | NInfer `.ninfer` |
| Inkling 2 Mini UD-Q2_K_XL (NInfer v3) | 26,4B | 3,4B | Igual | Apache 2.0 | NInfer `.ninfer` |
| Inkling 2 Mini UD-IQ4_XS (NInfer v3) | 26,4B | 3,4B | Igual | Apache 2.0 | NInfer `.ninfer` |
| Inkling 2 Mini APEX-I MiniPlus V2.1 (NInfer v3) | 26,4B | 3,4B | Igual | Apache 2.0 | NInfer `.ninfer` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otras familias; la comparativa se limita a las variantes de cuantizacion del mismo modelo publicadas por el mismo autor.

## Limitaciones y advertencias

- Dependencia de un motor no estandar: el archivo solo funciona con NInfer, rama `master` de `iamwavecut/ninfer-all`, y con releases concretas (`2026-11-24.1` o posterior para DSpark, `2026-11-24.7` o posterior para DFlash2). Las builds estandar de NInfer lo rechazan.
- Fragmentacion de revisiones: el archivo con el drafter en el layout anterior (14.392.937.728 bytes) queda en la revision `151ccb07`, y el archivo sin DFlash2 (14.493.304.576 bytes) en la revision `271a3abf`; hay que fijar la revision correcta al descargar.
- Perdida por cuantizacion: KLD media de 0,0174 frente a UD-Q8_K_XL y mismo token superior en el 96,3 % de las posiciones; el 3,7 % restante puede afectar a tareas sensibles a tokens exactos (codigo, cifras, JSON estricto).
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre calidad fuera del ingles.
- Sesgos y alucinacion: no se documentan en la informacion proporcionada; como en cualquier modelo generativo, el riesgo de alucinacion persiste y debe mitigarse con verificacion externa, especialmente en tool calling con argumentos estrictos.
- Restricciones de licencia: el modelo base es Apache 2.0, lo que permite uso comercial; el artefacto no anade restricciones segun su model card, pero conviene revisar el aviso `NOTICE` incluido en el repositorio.
- Requisitos de memoria: el rendimiento depende de donde residan los expertos enrutados (GPU, host fijado o archivo); con expertos en archivo, la latencia puede degradarse por ancho de banda de disco.
- Sin benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares para este artefacto, por lo que la evaluacion en produccion debe hacerse con un conjunto propio.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama `master` de NInfer-all: https://github.com/iamwavecut/ninfer-all
- Variante UD-IQ1_M: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Variante UD-Q2_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Variante UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Variante APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
