# WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3 es un artefacto de inferencia (formato NInfer v3) creado por WaveCut a partir de la cuantización GGUF IQ1_M que ISTA-DASLab publicó del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek AI. Se trata de un modelo de mezcla de expertos (MoE) multimodal de 763 mil millones de parámetros totales, del que solo una fracción se activa por token, cuantizado a aproximadamente 1,75 bits por peso sobre los 551,9 mil millones de parámetros del backbone. El resultado es un único archivo de 117,18 GiB capaz de ejecutarse sobre una sola GPU de 24 GB, con los expertos enrutados en memoria de host anclada (pinned) o transmitidos desde disco.

El problema que resuelve es claro: hacer ejecutable un modelo gigante en hardware de consumo. Gracias a la cuantización extrema por bloques GGML, al motor NInfer (que multiplica los bloques in situ) y al decodificador especulativo DSpark incluido, el modelo funciona en tarjetas como la RTX 3090 o la RTX 4090 manteniendo capacidades de visión, tool calling y razonamiento. Es relevante para desarrolladores que quieren experimentar con un modelo frontera MoE sin acceso a clústeres de GPU, aunque con las limitaciones de calidad que implica una cuantización de 1-2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con hyper-conexiones de cuatro flujos, atención latente con ventana de 128 posiciones más latentes comprimidos seleccionados por indexador, bloques Engram (tabla n-grama) y torre de visión |
| Parametros totales | 763B (backbone de 551,9B + torre de visión + tabla Engram de 196,6B) |
| Parametros activos | no disponible (6 expertos enrutados activos por token de 384, más 1 experto compartido) |
| Longitud de contexto | no disponible (ventana de atención local de 128 posiciones más latentes comprimidos) |
| Tipos de cuantizacion | IQ1_S (55 bancos), IQ1_M (12), IQ2_XXS (11), IQ2_S (2) para expertos; Q5_K para expertos compartidos, token table y output head; Q8_0 y Q5_K en atención latente; FP32 en router, normas y compresores; STQ (2-4 bits) en el drafter DSpark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | NInfer v3 (archivo único de 117,18 GiB), derivado de GGUF; tabla Engram aparte en IQ4_NL |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer MoE de 40 bloques con 384 expertos enrutados por bloque, de los que se activan 6 por token, además de un experto compartido. Incorpora varias innovaciones destacables: hyper-conexiones de cuatro flujos, atención latente con una ventana local de 128 posiciones complementada por latentes comprimidos seleccionados mediante un indexador, dos bloques Engram que añaden filas de una tabla de n-gramas de 196,6B parámetros, y una torre de visión que convierte cada imagen en un tramo de posiciones del prompt. El pipeline incluye decodificación especulativa mediante el drafter DSpark de tres bloques (mtp.0..2), distribuido en formato STQ.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a la cuantización, el repositorio base de ISTA-DASLab aplica el esquema GSQ-RCO a 1,75 bits por peso sobre el backbone; el artefacto de WaveCut conserva cada tensor GGML byte a byte y amplía a FP32 los routers, compresores, indexadores, matrices de hyper-conexión y normas, ya que FP32 representa exactamente sus valores BF16/F16 originales. La conversión a NInfer v3 tardó 6 minutos y 23 segundos en los 96 hilos de un EPYC 7K62 de 48 núcleos.

## Capacidades

- Generación de texto y razonamiento, con soporte de salida de razonamiento (reasoning) gestionada por el motor NInfer.
- Comprensión de imágenes (pipeline image-text-to-text): la torre de visión convierte cada imagen en posiciones del prompt; se activa con la opción `--vision` (0,90 GiB adicionales de VRAM).
- Tool calling: las llamadas DSML se devuelven como tool calls en formato OpenAI.
- Agentes y multi-step reasoning: hasta ocho peticiones concurrentes, reutilización de prefijo de prompt y drafting por búsqueda de contexto (context-lookup drafting).
- Decodificación especulativa con el drafter DSpark (`--spec dspark`), que añade 3,58 GiB de VRAM cuando está activo.
- Salida estructurada (structured output).
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Experimentación local con modelos frontera: permite ejecutar un MoE de 763B en una RTX 3090 o 4090 de 24 GB, ideal para desarrolladores que quieren evaluar el comportamiento del modelo sin infraestructura de datacenter.
- Chatbots con visión: con `--vision`, el modelo describe y razona sobre imágenes insertadas en el prompt, útil para asistentes que analizan capturas, documentos escaneados o gráficos.
- Agentes con herramientas: el soporte de tool calls en formato OpenAI permite integrarlo en frameworks de agentes que orquestan APIs, búsquedas web o ejecución de código en varios pasos.
- Atención al cliente automatizada: la reutilización de prefijo de prompt y el soporte de ocho peticiones concurrentes lo hacen adecuado para servir conversaciones multi-turno con un system prompt compartido y costoso de prefillar.
- Generación de texto estructurado: la salida estructurada nativa facilita pipelines de extracción de datos, generación de JSON conforme a esquemas y automatización documental.
- Servidor de inferencia de bajo coste: NInfer sirve el modelo con expertos en memoria de host anclada o transmitidos desde el archivo, repartiendo el cálculo de expertos entre CPU y GPU, lo que permite despliegues en estaciones de trabajo sin VRAM masiva.
- Investigación en cuantización extrema: la mezcla IQ1_S/IQ1_M/IQ2 con routers en FP32 es un caso de estudio práctico sobre cuánta calidad se conserva a 1,75 bits por peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README incluye una imagen comparativa de velocidad de decodificación y prefill de NInfer frente a Strata sobre el mismo host con RTX 4090, pero no se proporcionan cifras numéricas.

## Requisitos de hardware

- VRAM en GPU: 6,0 GiB para el modelo no experto, más 3,58 GiB si se activa el drafter DSpark y 0,90 GiB con la torre de visión (`--vision`). Total aproximado: 6,0-10,5 GiB de VRAM.
- Los expertos enrutados (106,69 GiB del archivo) residen en memoria de host anclada o se transmiten desde disco; se recomienda abundante RAM de sistema (del orden de 110-120 GiB para anclarlos) o un disco rápido para streaming.
- GPUs compatibles según los tags del repositorio: RTX 3090, RTX 4090, RTX 5090 y RTX Pro 6000; cabe en GPUs de consumo de 24 GB.
- CPU: con expertos en host, los hilos de CPU calculan parte de los expertos faltantes de cada llamada de decodificación mientras la GPU copia el resto; la conversión se probó en un EPYC 7K62 de 48 núcleos.
- Despliegue: exclusivamente mediante NInfer (rama `master` de ninfer-all, commit `673e3e618` o posterior); las builds estándar de NInfer rechazan este archivo. No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en cifras concretas; el README referencia una comparativa gráfica con Strata en RTX 4090.

## Comparativa con modelos similares

| Aspecto | Este artefacto (IQ1_M NInfer v3) | GGUF base de ISTA-DASLab (GSQ-RCO IQ1_M) | deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) |
|---|---|---|---|
| Formato | NInfer v3, archivo único 117,18 GiB | GGUF sharded | safetensors BF16 |
| Cuantización | 1,75 bpw en expertos, routers FP32, drafter STQ | 1,75 bpw, tipos GGML por tensor | BF16 (sin cuantizar) |
| Visión | Sí, torre BF16 incluida como componente | Sí, mediante mmproj BF16 aparte | Sí |
| Decodificación especulativa | DSpark STQ integrado | No incluida | Depende del runtime |
| Motor requerido | NInfer master (commit 673e3e618+) | llama.cpp-compatible (GGUF) | Runtime propio de DeepSeek / vLLM |
| VRAM GPU mínima | ~6-10,5 GiB + expertos en host | Depende del backend GGUF | Múltiples GPUs de datacenter |
| Licencia | MIT | MIT | MIT |

Comparación con otros modelos MoE grandes: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización extrema (1,75 bpw, mayoritariamente IQ1_S/IQ1_M): es de esperar degradación notable de calidad respecto al modelo BF16 original, especialmente en razonamiento fino, código y matemáticas; conviene validar en cada caso de uso.
- Riesgo de alucinación: no cuantificado para esta cuantización; asúmase al menos el del modelo base y probablemente mayor.
- Compatibilidad muy restringida: solo funciona con NInfer construido desde el commit `673e3e618` o posterior de la rama `master` de ninfer-all; las builds estándar rechazan el archivo. No es compatible con el ecosistema llama.cpp/Ollama pese a derivar de GGUF.
- La tabla Engram (196,6B parámetros) es una descarga separada y obligatoria; sin ella el modelo no funciona tal como está descrito.
- El chat template es una transcripción propia de NInfer del `encoding.py` de la release; la release original no incluye plantilla Jinja, por lo que puede haber divergencias menores con el comportamiento oficial.
- Sesgos conocidos, idiomas soportados y longitud máxima de contexto: no disponibles en la información proporcionada.
- Licencia MIT: sin restricciones para uso comercial, aunque la responsabilidad sobre salidas del modelo recae en el despliegue.
- Para producción, el streaming de expertos desde disco puede introducir latencias variables; se recomienda anclar expertos en RAM si el patrón de tráfico es interactivo.

## Enlaces

- Artefacto NInfer v3: https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización GGUF de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Tabla Engram (descarga separada): https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3
- Pack STQ del drafter DSpark: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (rama master): https://github.com/iamwavecut/ninfer-all
- Commit requerido: https://github.com/iamwavecut/ninfer-all/commit/673e3e6186e16d145d76ecbfd17d1097c5868a1c
- Papers citados en tags: arXiv 2604.18556 y arXiv 2605.00649 (enlaces: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649)
