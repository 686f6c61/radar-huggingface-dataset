# WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3

## Resumen

Inkling 2 Mini es un modelo de mezcla de expertos (MoE) con arquitectura de transformer con bucles (looped transformer), desarrollado por Thinking Machines. Cuenta con 26.400 millones de parametros totales y 3.400 millones activos por token, y combina capacidades de texto, vision y tool calling. El artefacto aqui descrito no es el modelo original, sino una conversion al formato propietario NInfer v3 realizada por WaveCut a partir de la cuantizacion UD-Q2_K_XL de Unsloth, empaquetando ademas el tower de vision en Q8_0 y dos drafters de decodificacion especulativa (DSpark y DFlash2).

La relevancia de esta ficha esta en que documenta una de las cuantizaciones de 2 bits mas grandes disponibles para el modelo, con una divergencia KL media de 0,0595 respecto a UD-Q8_K_XL y el mismo token top en el 91,6% de las posiciones segun las mediciones de Unsloth. El artefacto ocupa 10.816.268.032 bytes (10,07 GiB) y requiere builds especificos del motor NInfer: la rama `master` de `iamwavecut/ninfer-all` y, para el drafter DFlash2, la release `2026-11-24.7` o posterior.

El modelo base esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial. La combinacion de contexto largo por capas, vision integrada, tool calling estructurado y decodificacion especulativa lo situa como candidato para despliegues locales en hardware de gama alta de consumo, aunque el formato `.ninfer` limita su portabilidad frente a GGUF estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer MoE (24 capas almacenadas ejecutadas como 48 visitas: prelude 0-5, core 6-17 repetido tres veces, coda 18-23) |
| Parametros totales | 26,4 B |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | No disponible de forma explicita; las capas 5, 11, 17 y 23 atienden todas las posiciones y el resto ventanas de 1.024 posiciones; el tower de vision admite hasta 4.096 posiciones por imagen |
| Tipos de cuantizacion | UD-Q2_K_XL (artefacto principal); variantes del mismo autor: UD-IQ1_M, UD-Q3_K_XL, UD-IQ4_XS y APEX-I MiniPlus V2.1 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto unico de 10.816.268.032 bytes); el modelo base se distribuye en safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo emplea un transformer con bucles: 24 capas fisicas se ejecutan como 48 visitas, con el bloque central (capas 6-17) recorrido tres veces con los mismos pesos. Cada visita mantiene sus propias claves, valores e historiales de convolucion. La atencion usa 24 cabezas de consulta sobre 8 cabezas KV de dimension 128, sin rotacion posicional, con una tabla aprendida de 1.024 distancias y sinks; cuatro capas (5, 11, 17 y 23) atienden todas las posiciones y el resto se limita a ventanas de 1.024. La capa MoE contiene 128 expertos enrutados con 8 activos por token, puntuaciones sigmoid con sesgo de seleccion, activacion SiTU sobre la concatenacion [gate; up] de anchura 1.152 y sin experto compartido.

El artefacto conserva los bloques ggml del GGUF de Unsloth byte a byte y el motor multiplica los bloques in situ, sin recuantizar las matrices. Solo el drafter DFlash2 se cuantiza aqui, pasando de BF16 a filas de 8 bits en grupos de 32 (Q8_G32). El tower de vision es un ViT con fila de clase, filas de posicion redimensionadas, cabezas con rotacion 2D, fusion 2x2 y proyector de dos capas, tomado de `mmproj-Inkling-2-Mini-Q8_0.gguf` de ggml-org. El drafter DSpark consta de tres bloques no causales sobre los estados del modelo objetivo y una cabeza de Markov recurrente de rango 256; DFlash2 usa cinco capas de ventana deslizante sobre el ancla y 7 mascaras, con ventana de 2.048 posiciones. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, con el razonamiento del modelo emitido en bloques propios.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante el tower de vision integrado, con hasta 4.096 posiciones por imagen.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos y salida estructurada.
- Decisiones tipadas y reranking.
- Decodificacion especulativa con el drafter DSpark (activo por defecto con una sola peticion en curso), con DFlash2 mediante `--spec dflash2`, o por busqueda en contexto.
- Servicio concurrente de una a ocho peticiones con reutilizacion de prefijo de prompt.
- Ejecucion de los expertos enrutados en GPU, en memoria de host fijada o leidos directamente desde el archivo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con reutilizacion de prefijo de prompt y hasta ocho peticiones concurrentes, lo que reduce el coste de reprocesar el historial en cada turno.
- Generacion de codigo con integracion en pipelines: el tool calling en formato OpenAI y la salida estructurada con argumentos estrictos permiten conectarlo a CI/CD y a herramientas externas sin capa de traduccion.
- Asistentes sobre documentos e imagenes: el tower de vision con hasta 4.096 posiciones por imagen admite tareas de extraccion y respuesta sobre capturas, diagramas o formularios combinados con texto.
- Despliegue local en estaciones de trabajo: con 10,07 GiB en disco y 3,4 B parametros activos, el artefacto es viable en GPUs de consumo de gama alta, con los expertos en memoria de host fijada si la VRAM es limitada.
- Reranking y clasificacion tipada: las decisiones tipadas y el reranking integrados permiten usarlo como componente de ordenacion en pipelines de busqueda o RAG.
- Razonamiento por etapas con agente: los bloques de razonamiento propios y el tool calling habilitan flujos multi-paso donde el modelo planifica, invoca herramientas y sintetiza resultados.
- Servicio de inferencia de baja latencia: la decodificacion especulativa con DSpark o DFlash2 acelera la generacion en cargas de una sola peticion o con ventana deslizante respectivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad medido es la divergencia KL media de UD-Q2_K_XL respecto a UD-Q8_K_XL, de 0,0595, con el mismo token top en el 91,6% de las posiciones, segun Unsloth.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 10,07 GiB; con los expertos enrutados en GPU se requiere VRAM suficiente para el conjunto de pesos cargados, y el motor permite colocarlos en memoria de host fijada o leerlos desde el archivo para reducir la presion sobre VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo encaja en GPUs de consumo de gama alta con 16-24 GB de VRAM si se descargan expertos a host, y en GPUs de datacenter (A100, H100) para el modelo completo en GPU.
- Cabe en GPU de consumo: si, en modelos con al menos 12-16 GB de VRAM en funcion de la configuracion de expertos; no se especifican modelos concretos.
- Opciones de despliegue: exclusivamente el motor NInfer, rama `master` de `iamwavecut/ninfer-all`; el drafter DSpark requiere la release `2026-11-24.1` o posterior y DFlash2 la `2026-11-24.7` o posterior. Los builds estandar de NInfer rechazan este archivo. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles; la decodificacion especulativa con DSpark esta activa por defecto con una sola peticion en curso.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Mini UD-Q2_K_XL (NInfer v3) | 26,4 B | 3,4 B | Ventanas de 1.024 en la mayoria de capas | Apache 2.0 | `.ninfer` |
| Inkling 2 Mini UD-IQ1_M (NInfer v3) | 26,4 B | 3,4 B | Igual | Apache 2.0 | `.ninfer` |
| Inkling 2 Mini UD-Q3_K_XL (NInfer v3) | 26,4 B | 3,4 B | Igual | Apache 2.0 | `.ninfer` |
| Inkling 2 Mini UD-IQ4_XS (NInfer v3) | 26,4 B | 3,4 B | Igual | Apache 2.0 | `.ninfer` |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la divergencia KL de UD-Q2_K_XL frente a UD-Q8_K_XL. No se han identificado en la informacion proporcionada modelos de otros autores comparables en arquitectura y tamano.

## Limitaciones y advertencias

- El formato `.ninfer` solo lo carga el motor NInfer; los builds estandar de NInfer rechazan el archivo y se exigen releases concretas segun el drafter.
- La cuantizacion de 2 bits introduce degradacion: divergencia KL media de 0,0595 frente a UD-Q8_K_XL y coincidencia del token top del 91,6%, lo que implica un 8,4% de posiciones con token distinto.
- El archivo de 10.816.268.032 bytes corresponde a una revision concreta; las revisiones `242fb0e3` y `19b84daf` contienen versiones anteriores con distinto layout de drafter.
- La capa 20 tiene su banco down en MXFP4 en el GGUF, formato no soportado por los productos de expertos del motor; el conversor lo almacena como Q8_0 con verificacion bloque a bloque, lo que anade un paso de conversion no presente en el original.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica; deben evaluarse empiricamente antes de produccion.
- La licencia Apache 2.0 permite uso comercial, pero el `NOTICE` incluido en el repositorio debe revisarse por posibles atribuciones adicionales.
- El modelo base y los drafters provienen de terceros (Thinking Machines, Unsloth, incoai, ggml-org); la trazabilidad de cada componente esta documentada en el informe de conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Variante UD-IQ1_M: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Variante UD-Q3_K_XL: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3
- Variante UD-IQ4_XS: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3
- Variante APEX-I MiniPlus V2.1: https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
