# sunandbean/qwen3.8-flash-next-p100a

## Resumen

qwen3.8-flash-next-p100a es un port de inferencia de Qwen3.8-Flash-Next para una única tarjeta Tenstorrent Blackhole p100a, publicado por el usuario sunandbean. No es un modelo entrenado desde cero, sino un contenedor de despliegue que combina pesos cuantizados de terceros (la GGUF GSQ-RCO de ISTA-DASLab y el pool de expertos GPTQ-BFP4 de Lottolabs) con kernels propios en ttnn y ggml para repartir la ejecución entre la tarjeta y la CPU del host. El repositorio de Hugging Face pesa 0,9 GB porque no redistribuye los pesos: el servidor los descarga en el primer arranque.

El modelo subyacente es un transformer de tipo mixture-of-experts con capas densas basadas en gated delta net, atención dispersa e hyper-connections, más una capa MTP (multi-token prediction) para decodificación especulativa. El port mantiene en la tarjeta las capas densas, la LM head, la capa MTP y el subconjunto de expertos más activos según el perfil de routing; el resto de expertos se ejecuta en CPU leyendo desde la GGUF mapeada en memoria a través de los kernels de ggml.

Su relevancia es acotada pero específica: permite servir un MoE de gran tamaño con contexto de 32k sobre hardware Tenstorrent en lugar de GPU NVIDIA, con una API compatible con OpenAI y Anthropic. El rendimiento declarado es de aproximadamente 10-17 tok/s en decodificación y un 50/50 en GSM8K-50, sobre una sola tarjeta y una CPU de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas densas gated delta net, atención dispersa e hyper-connections; capa MTP para decodificación especulativa |
| Parametros totales | no disponible (el perfil `full` usa 512 expertos; el perfil `coder`, 256) |
| Parametros activos | no disponible |
| Longitud de contexto | 32k tokens |
| Tipos de cuantizacion | IQ1_M (perfil coder), IQ3_XXS (perfil full), GPTQ-BFP4 (pool de expertos de Lottolabs), GSQ-RCO |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos base y MTP), caches convertidas en formato ttnn para la tarjeta |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con dos configuraciones de expertos según el perfil: 256 expertos en la variante Coder y 512 en la variante base. La arquitectura combina capas densas con gated delta net, atención dispersa e hyper-connections, e incorpora una capa MTP que actúa como draft model para decodificación especulativa. El port distribuye la ejecución: las capas densas, la LM head, la capa MTP y los expertos más calientes residen en la tarjeta Blackhole p100a; el routing y el resto de expertos se ejecutan en CPU mediante kernels de ggml sobre la GGUF mapeada en memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. Las innovaciones técnicas documentadas pertenecen al port, no al entrenamiento: kernels fusionados de gated delta net, MoE, KV y hyper-connections en ttnn; colocación de expertos en tarjeta guiada por el perfil de routing de Strata; decodificación especulativa MTP; passes de prompt de 28 filas; caché de prefijo; y time slicing para varios usuarios. El port reutiliza recetas de operadores de sjettTT/tt-qwen-3.8-flash-next y tt-metal, el tokenizador, lector GGUF, perfiles de expertos y pipeline MTP de Strata, y ggml/gguf-py de llama.cpp.

## Capacidades

- Generación de texto con modo thinking configurable: activo por defecto en la API OpenAI salvo que se desactive con `chat_template_kwargs.enable_thinking` o `reasoning_effort: "none"`; en la API Anthropic se activa con el bloque `thinking`.
- Tool calling y function calling en el endpoint `/v1/chat/completions`, con soporte de `tool_choice`.
- Compatibilidad con agentes: el flag `--thinking off` desactiva el razonamiento extendido en todas las peticiones, pensado para flujos de agentes como Claude Code.
- Streaming de respuestas y exposición de `reasoning_content` en las respuestas.
- Endpoint `/v1/messages` compatible con Anthropic, con bloques de thinking y conteo de tokens vía `/v1/messages/count_tokens`.
- Perfil Coder orientado a generación de código y perfil full con el modelo base completo.
- Decodificación especulativa MTP con muestreo exacto (temperatura, top_p, top_k, seed, stop).
- Caché de prefijo y time slicing para atender a varios usuarios sobre una sola tarjeta.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el perfil `coder` (256 expertos, IQ1_M) sirve para autocompletado y generación de funciones en un entorno de desarrollo, con la API compatible con OpenAI para integrarse en plugins de editor. El contexto de 32k permite incluir varios ficheros en la ventana.
- Agente de terminal tipo Claude Code: el endpoint `/v1/messages` y el flag `--thinking off` permiten conectar herramientas de agente que esperan la API de Anthropic, con tool calling y streaming sobre una sola tarjeta.
- Servicio multi-usuario de bajo volumen: el time slicing y la caché de prefijo permiten atender a varios clientes concurrentes sobre una p100a, adecuado para equipos pequeños o entornos de laboratorio con hardware Tenstorrent.
- Evaluación de hardware alternativo a NVIDIA: sirve para medir el rendimiento real de un MoE grande sobre Blackhole frente a GPU, con métricas de decodificación (10-17 tok/s) y precisión en GSM8K-50.
- Procesamiento de documentos largos: con 32k de contexto y caché de prefijo, se pueden encadenar consultas sobre un mismo documento sin recomputar el prompt completo.
- Prototipado de pipelines con razonamiento: el modo thinking y la exposición de `reasoning_content` permiten construir flujos de razonamiento multi-paso y registrar las trazas intermedias para depuración.
- Despliegue con API dual OpenAI/Anthropic: útil para integrar el mismo backend en aplicaciones escritas para cualquiera de los dos ecosistemas sin adaptadores adicionales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decodificacion | ~10-17 tok/s |
| GSM8K-50 | 50/50 |
| Contexto | 32k tokens |
| Hardware | 1x Tenstorrent Blackhole p100a + CPU de escritorio |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Tarjeta: una Tenstorrent Blackhole p100a (mesh 1×1).
- RAM del host: 64 GB. Los expertos en CPU se leen desde la GGUF mapeada en memoria y deben permanecer en la caché de páginas (37,8 GB si se tocan todos los expertos del perfil `full`); con menos RAM la decodificación cae a velocidad de disco.
- CPU: x86-64 con AVX2 y 8 o más núcleos. Los expertos del host usan 8 hilos OpenMP fijados a núcleos (`OMP_PROC_BIND=spread`, `OMP_PLACES=cores`), lo que aporta un 12-20 % de mejora en decodificación. Las CPU con AVX-512 reciben automáticamente el build x86-64-v4 de ggml.
- Disco: aproximadamente 110 GB para el perfil `coder` (unos 96 GB de descargas más 14 GB de cachés); el perfil `full` añade unos 90 GB (GGUF de 75,8 GB más cachés de 13 GB).
- Despliegue: contenedor mediante `tt-model pull` y `tt-model serve`, o instalación Python con un entorno tt-metal/ttnn en el commit `58648d4` (ttnn no está en PyPI). El servidor escucha en el puerto 20000 o el siguiente libre.
- No es compatible con GPU de consumo; requiere hardware Tenstorrent.
- Throughput y latencia: 10-17 tok/s de decodificación; no se proporcionan cifras de prefill ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.8-flash-next-p100a | no disponible (MoE 256/512 expertos) | 32k | 1x Blackhole p100a + CPU 64 GB | Apache-2.0 | Port de inferencia; 10-17 tok/s; GSM8K-50 50/50 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | GPU (no especificado) | no disponible | Modelo base original |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible | no disponible | CPU/GPU con llama.cpp | no disponible | Cuantización GSQ-RCO usada por este port |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio no redistribuye los pesos: el primer arranque descarga unos 96 GB (perfil `coder`) o 81 GB (perfil `full`) desde terceros, lo que exige conectividad y espacio en disco considerables.
- El rendimiento depende críticamente de la RAM del host: con menos de 64 GB, los expertos en CPU se leen de disco y la decodificación se degrada severamente.
- La decodificación de 10-17 tok/s es baja para aplicaciones interactivas de alta demanda; el throughput agregado multi-usuario no está documentado.
- El resultado en GSM8K-50 (50/50) indica una precisión limitada en razonamiento matemático.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específica del modelo en la documentación disponible.
- Requiere un entorno tt-metal/ttnn en un commit concreto (`58648d4`), lo que añade complejidad de mantenimiento y reproducibilidad.
- Aunque la licencia del port es Apache-2.0, las licencias de los pesos descargados (GGUF de ISTA-DASLab, pool de Lottolabs, modelo base de Qwen) no se detallan en la información proporcionada; conviene verificarlas antes de un uso comercial.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sunandbean/qwen3.8-flash-next-p100a
- Pesos GGUF Coder (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Pool de expertos GPTQ-BFP4 (Lottolabs): https://huggingface.co/Lottolabs/Qwen3.8-Flash-Next-Coder-P150
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del port: https://github.com/SunandBean/tt-qwen3.8-flash-next-p100a
- Recetas de operadores ttnn: https://github.com/sjettTT/tt-qwen-3.8-flash-next
- tt-metal: https://github.com/tenstorrent/tt-metal
