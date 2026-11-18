# WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de mezcla de expertos (MoE) de gran escala desarrollado por DeepSeek, con 763.000 millones de parámetros totales. Su arquitectura combina 40 bloques de 384 expertos enrutados (6 activos por token) más un experto compartido, hyper-conexiones de cuatro flujos, atención latente sobre una ventana de 128 posiciones con latentes comprimidos seleccionados por indexador, dos bloques Engram que añaden filas de una tabla de n-gramas de 196.600 millones de parámetros y una torre de visión que convierte cada imagen en un tramo de posiciones de prompt. El artefacto aquí descrito es una conversión de terceros (WaveCut) sobre la cuantización GGUF de ISTA-DASLab, empaquetada para el motor NInfer v3 con un peso medio de 1,75 bits por parámetro sobre los 551.900 millones de parámetros del backbone.

El modelo resuelve el problema de ejecutar un MoE de escala frontera en hardware de consumo: gracias a la cuantización mixta (IQ1_S, IQ1_M, IQ2_XXS, IQ2_S en expertos enrutados; Q5_K en expertos compartidos y cabezas; FP32 en routers, compresores e indexadores) y a la gestión de expertos en memoria anfitriona fijada o en streaming desde el fichero, NInfer puede servir el modelo en una única GPU de 24 GB con hasta ocho peticiones concurrentes. Es relevante ahora porque demuestra que un MoE de más de 700.000 millones de parámetros puede desplegarse en estaciones de trabajo con RTX 3090, RTX 4090, RTX 5090 o RTX Pro 6000, manteniendo razonamiento, tool calling, salida estructurada, visión y decodificación especulativa.

El artefacto incluye el drafter DSpark en formato STQ (tres bloques `mtp.0..2`) para decodificación especulativa y la torre de visión en BF16, pero no incluye la tabla Engram, que se distribuye como descarga separada y compartida por todas las conversiones NInfer de este modelo. El fichero principal ocupa 125.824.667.392 bytes (117,18 GiB), de los cuales 106,69 GiB corresponden a los expertos enrutados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención latente, hyper-conexiones de cuatro flujos y bloques Engram (n-gramas) |
| Parametros totales | 763.000 millones (551.900 millones en el backbone) |
| Parametros activos | 6 de 384 expertos enrutados por token, más experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | Ventana de atención latente de 128 posiciones más latentes comprimidos seleccionados por indexador (longitud total de contexto no disponible) |
| Tipos de cuantizacion | IQ1_S (55 de 80 bancos), IQ1_M (12), IQ2_XXS (11), IQ2_S (2) en expertos enrutados; Q5_K en expertos compartidos, proyecciones Engram, tabla de tokens y cabeza de salida; Q8_0 en down-projections de query y latentes; FP32 en routers, compresores, indexadores, matrices de hyper-conexión, normas y sumideros de atención; STQ en el drafter DSpark; BF16 en la torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.ninfer` (artefacto propietario de NInfer v3, derivado de GGUF); repo de 505,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 bloques, cada uno con 384 expertos enrutados de los que se activan 6 por token, más un experto compartido. Incorpora hyper-conexiones de cuatro flujos, atención latente sobre una ventana de 128 posiciones con latentes comprimidos seleccionados por un indexador, y dos bloques Engram que añaden filas de una tabla de n-gramas de 196.600 millones de parámetros. La torre de visión transforma cada imagen en un tramo de posiciones de prompt mediante un aligner. El modelo base incluye además un drafter DSpark de tres bloques (`mtp.0..2`) para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión de WaveCut preserva los bloques ggml byte a byte y el motor multiplica los bloques in situ; los routers, compresores, indexadores y matrices de hyper-conexión se ensancharon de BF16/F16 a FP32 (que los representa exactamente). El drafter DSpark se tomó del pack Sushi de beamster en formato STQ (palabras trellis `uint16`, 2 bits por peso en los 128 expertos enrutados de cada bloque y 4 bits en las demás matrices, con vectores de signo Hadamard en FP16 y tablas de Markov en BF16). La torre de visión proviene del `mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf` de ISTA-DASLab, con matrices en BF16 y parámetros de patch embedding, normas, sesgos y filas aprendidas en FP32.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de modo de razonamiento explícito.
- Tool calling en formato DSML devuelto como tool calls compatibles con OpenAI.
- Salida estructurada.
- Procesamiento de imágenes mediante la torre de visión (`--vision`), con pipeline `image-text-to-text`.
- Decodificación especulativa con el drafter DSpark (`--spec dspark`) y drafting por búsqueda en contexto.
- Reutilización de prefijos de prompt.
- Hasta ocho peticiones concurrentes por instancia.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de razonamiento en estación de trabajo: un investigador puede ejecutar el modelo en una RTX 4090 con 24 GB, manteniendo los expertos enrutados en memoria anfitriona fijada o en streaming desde el fichero, para tareas de análisis y resolución de problemas sin depender de la nube.
- Automatización de agentes con tool calling: el modelo devuelve tool calls en formato compatible con OpenAI, lo que permite integrarlo en orquestadores de agentes existentes y encadenar llamadas a funciones en flujos multi-paso.
- Procesamiento de documentos con imagen: gracias a la torre de visión y a la pipeline `image-text-to-text`, puede extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas convirtiendo cada imagen en posiciones de prompt.
- Generación de salida estructurada en pipelines de datos: la salida estructurada permite generar JSON u otros formatos validables para ETL, extracción de entidades o generación de informes.
- Servicio concurrente de baja concurrencia: con hasta ocho peticiones simultáneas y reutilización de prefijos de prompt, es adecuado para equipos pequeños que necesitan un endpoint propio con contexto compartido entre consultas.
- Aceleración de inferencia interactiva: el drafter DSpark y el drafting por búsqueda en contexto reducen la latencia de decodificación en cargas de generación larga, útil en asistentes conversacionales o autocompletado.
- Experimentación con cuantización extrema: sirve como banco de pruebas para estudiar el impacto de 1,75 bits por peso en un MoE de escala frontera, comparando la calidad frente a cuantizaciones mayores del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen comparativa de velocidad de decodificación y prefill entre NInfer y Strata sobre un mismo host con RTX 4090, pero no se proporcionan cifras numéricas en el texto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,0 GiB para los componentes no-experto en la GPU, más 3,58 GiB adicionales para el drafter DSpark cuando se activa y 0,90 GiB para la torre de visión con `--vision`. Los 106,69 GiB de expertos enrutados residen en memoria anfitriona fijada o se transmiten por streaming desde el fichero.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 y RTX Pro 6000, según los tags del repositorio; el autor indica que se sirve en una única GPU de 24 GB.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB o más, con expertos en RAM del sistema o streaming desde disco.
- Opciones de despliegue: NInfer v3 (rama `master` de `iamwavecut/ninfer-all`, desde el commit `673e3e618` para el drafter STQ; desde `ab84dcfa0` para la conversión con el layout de llama.cpp). Las builds estándar de NInfer rechazan este fichero.
- Latencia y throughput: no disponibles en cifras numéricas; con expertos en host, los hilos de CPU calculan una parte de los expertos faltantes de cada llamada de decodificación mientras la GPU copia el resto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (este artefacto, NInfer v3 IQ1_M) | 763.000 M totales, 551.900 M backbone | Ventana latente de 128 posiciones más latentes comprimidos por indexador | MIT | Hugging Face, formato `.ninfer` |
| DeepSeek-V4.1-Flash-1017 GSQ-RCO IQ1_M (ISTA-DASLab, GGUF) | 763.000 M totales | Igual que el modelo base | No disponible en la información | Hugging Face, GGUF |
| DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw (beamster) | 763.000 M totales | Igual que el modelo base | No disponible en la información | Hugging Face, pack STQ |
| DeepSeek-V4.1-Flash-1017 (deepseek-ai, original) | 763.000 M totales | Igual que el modelo base | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- La cuantización a 1,75 bits por peso en los expertos enrutados (IQ1_S, IQ1_M, IQ2_XXS, IQ2_S) puede degradar la calidad respecto al modelo original en BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El artefacto no incluye la tabla Engram: es una descarga separada (`WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3`), identificada por el SHA-256 de sus filas; sin ella el modelo no funciona completo.
- Las builds estándar de NInfer rechazan este fichero; se requiere la rama `master` de `iamwavecut/ninfer-all` desde el commit `673e3e618` (o `ab84dcfa0` para la conversión). Esto limita la portabilidad a otros motores como llama.cpp, vLLM, TGI u Ollama, que no se mencionan como compatibles.
- El rendimiento depende de la memoria anfitriona y del almacenamiento: los 106,69 GiB de expertos deben residir en RAM fijada o transmitirse por streaming, lo que introduce latencia y requiere hardware con suficiente RAM y ancho de banda.
- El modelo base no publica plantilla Jinja; la plantilla de chat es una transcripción propia de NInfer del `encoding/encoding.py` de la release, lo que puede introducir divergencias de formato.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática.
- La licencia es MIT, lo que permite uso comercial, pero el artefacto depende de componentes de terceros (ISTA-DASLab, beamster) cuyas condiciones deben verificarse por separado.
- El repositorio ocupa 505,8 GB, lo que exige planificación de almacenamiento y ancho de banda de descarga considerables.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3
- Modelo base GGUF (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Tabla Engram (descarga separada): https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3
- Pack Sushi STQ (beamster): https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit del drafter STQ: https://github.com/iamwavecut/ninfer-all/commit/673e3e6186e16d145d76ecbfd17d1097c5868a1c
- Commit de conversión: https://github.com/iamwavecut/ninfer-all/commit/ab84dcfa07b8c011263fa884e9ece4de7d81bcb0
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
