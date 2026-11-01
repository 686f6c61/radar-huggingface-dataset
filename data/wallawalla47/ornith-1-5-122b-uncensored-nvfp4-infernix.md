# wallawalla47/Ornith-1.5-122B-UNCENSORED-NVFP4-Infernix

## Resumen

Ornith-1.5-122B-UNCENSORED-NVFP4-Infernix es un artefacto de inferencia publicado por el usuario wallawalla47 que empaqueta el modelo Ornith-1.5-122B en su variante sin mecanismos de rechazo (refusal-removed) y cuantizada en NVFP4, listo para ejecutarse con Infernix, un motor en C++/CUDA desarrollado por el mismo autor. El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con la geometria de Qwen3.5-122B-A10B: 48 capas, tamano oculto de 3072 y 256 expertos enrutados por capa con activacion top-8. El artefacto deriva de dealignai/Ornith-1.5-122B-UNCENSORED-NVFP4, a su vez una exportacion NVFP4 del modelo original ornith-ai/Ornith-1.5-122B.

La relevancia de esta publicacion es eminentemente practica: demuestra que un modelo MoE de 122B parametros totales puede servirse en una unica GPU de consumo (RTX 5090, 32 GB) manteniendo los 12.288 expertos enrutados en RAM del host (60,75 GiB) y cacheando en VRAM solo los expertos calientes, con la CPU calculando parte de los fallos de cache mientras la GPU lee el resto por PCIe. Incluye ademas el drafter MTP del modelo, el drafter DFlash2 de Inco AI, la torre de vision y una cabeza de propuesta Q4 para decodificacion especulativa.

El artefacto es multimodal (image-text-to-text), conversacional y esta empaquetado en un formato propietario dividido en tres ficheros de aproximadamente 76 GB en total. La licencia declarada es MIT, aunque el modelo original y los drafters tienen sus propias condiciones que conviene verificar por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3_5MoeForCausalLM), 48 capas, hidden size 3072, 256 expertos enrutados por capa, top-8 |
| Parametros totales | 122B (geometria Qwen3.5-122B-A10B) |
| Parametros activos | A10B (aproximadamente 10B activos por token, segun la denominacion de la geometria) |
| Longitud de contexto | Hasta 262.144 tokens en servidor (configuracion recomendada); KV inicial limitado a 32.768 tokens en el arranque |
| Tipos de cuantizacion | NVFP4 para expertos enrutados; FP8 E4M3 (una escala FP32 por fila) para attention, GDN, output, shared-expert y head; Q4 y Q8 para drafters; Q4 para la cabeza de propuesta |
| Idiomas soportados | No disponible |
| Licencia | MIT (el drafter DFlash2 se distribuye bajo Apache 2.0) |
| Formato de pesos | `.infernix` propietario, dividido en 3 partes (32 GB + 32 GB + 11,86 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 capas, dimension oculta de 3072 y 256 expertos enrutados por capa con enrutamiento top-8, lo que da un total de 12.288 expertos enrutados. Incorpora ademas proyecciones GDN, expertos compartidos, torre de vision y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El artefacto incluye tambien el drafter DFlash2 de Inco AI, byte a byte identico al publicado por dicho autor.

La conversion se realizo con la receta `qwen3_5_moe_nvfp4_modelopt` del motor Infernix y fue verificada con `tools.convert.verify_qwen3_5`, que comparo el artefacto con el checkpoint palabra por palabra: 12.288 registros de expertos y 1.322 tensores sin discrepancias. Los expertos enrutados, las proyecciones FP8, el router, las normas, los embeddings y la torre de vision son bit-exactos respecto al checkpoint. Solo los drafters (777 tensores MTP y 55 tensores DFlash2) y la cabeza de propuesta de 131.072 filas fueron recuantizados a los layouts Q4 y Q8 del motor. En el plano aritmetico, el checkpoint original cuantiza activaciones por token en tiempo de ejecucion (`FP8_PER_CHANNEL_PER_TOKEN`); Infernix ejecuta attention y GDN con activaciones de 8 bits por token en prefill y de 16 bits en decode, y los expertos compartidos y la cabeza con activaciones de 16 bits.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo original paso por RLHF o DPO. La model card indica explicitamente que tanto el artefacto, la receta de conversion, el motor y buena parte de la documentacion fueron generados con asistencia de IA y que se trata de trabajo amateur, probablemente incompleto o no del todo exacto.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de contexto de hasta 262.144 tokens en la configuracion de servidor recomendada.
- Procesamiento multimodal image-text-to-text gracias a la torre de vision incluida en el artefacto.
- Razonamiento con modo de pensamiento (thinking mode): la model card menciona ajustes de muestreo recomendados para ambos modos de pensamiento (temperatura 0,6, top-p 0,95, top-k 20, min-p 0, presence penalty 0).
- Decodificacion especulativa mediante drafter MTP (dos borradores por ronda, verificados solo cuando el drafter alcanza suficiente confianza) y mediante drafter DFlash2.
- Generacion de codigo y matematicas: no hay confirmacion explicita en la informacion disponible, pero son capacidades esperables en la familia Qwen3.5; deben verificarse empiricamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Ejecucion en una sola GPU de consumo con expertos residentes en RAM del host y cache en VRAM.

## Casos de uso

- Servicio de inferencia local de gran escala en una unica RTX 5090: el artefacto permite ejecutar un MoE de 122B parametros totales en 32 GB de VRAM manteniendo los 12.288 expertos enrutados en RAM del host (unos 70 GiB) y cacheando los calientes en GPU. Adecuado para laboratorios o desarrolladores que quieran explorar modelos de gran tamano sin infraestructura de centro de datos.
- Procesamiento de documentos largos con vision: al soportar image-text-to-text y contextos de hasta 262.144 tokens, puede emplearse para analisis de informes, contratos o documentacion tecnica que combine texto extenso e imagenes.
- Prototipado de asistentes conversacionales sin censura para investigacion sobre seguridad: el modelo es una build refusal-removed, util para estudiar comportamientos de rechazo, alineamiento y respuestas a peticiones que el modelo base deniega, siempre en entornos controlados y con controles de seguridad propios.
- Evaluacion de decodificacion especulativa: la inclusion de los drafters MTP y DFlash2, junto con la cabeza de propuesta Q4, permite medir el impacto de la especulacion en latencia y throughput sobre hardware Blackwell, con modos `--spec mtp`, `--spec dflash2` y `--spec auto`.
- Despliegue de servidor con `infernix-serve`: la configuracion recomendada (`--max-context 262144 --max-concurrency 2 --kv-dtype int8 --spec mtp --draft-tokens auto --host-context-mib 4096`) sirve como base para endpoints conversacionales con KV en INT8 y cache de prefijos acotada en RAM.
- Investigacion sobre cuantizacion NVFP4 y FP8: el informe de conversion incluido (`conversion.json`, 636.919 bytes) detalla fuentes, metodos y formatos por objeto, lo que lo convierte en material util para estudiar recetas de cuantizacion bit-exacta en modelos MoE.

## Benchmarks y rendimiento

La model card incluye una tabla de velocidad medida en RTX 5090, i9-13900K, 96 GB DDR5 y PCIe 5.0 x8 con una sola peticion, KV en INT8 y motor recien arrancado (cache de expertos vacia). La informacion proporcionada solo conserva la primera fila de esa tabla, correspondiente a decode con prompts de 1.280 tokens en modo greedy, sin que se hayan transcrito los valores numericos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Decode, prompts de 1.280 tokens, greedy (plano vs. `--spec mtp --draft-tokens auto`) | No disponible (valores no incluidos en la informacion) |
| Aceleracion de decode con MTP (greedy) | +18 % |
| Aceleracion de decode con MTP (muestreo recomendado de la card) | +7,5 % |
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | No disponible |

## Requisitos de hardware

- GPU: RTX 5090 (32 GB) u otra GPU `sm_120a` con 32 GB de VRAM. El motor esta orientado a arquitectura Blackwell.
- RAM del host: aproximadamente 70 GiB libres para el modo todo-en-RAM; con menos memoria, el ledger de RAM conserva tantos expertos como quepan y lee el resto desde el artefacto (nivel de expertos en SSD), ajustable con `--expert-ram-mib`. En Windows, la memoria paginada esta limitada al 80 % de la RAM.
- Disco: aproximadamente 76 GB para los tres ficheros del artefacto.
- Software: build de Infernix desde `main` en o superior al commit `c17e24a8`. El motor es C++/CUDA y no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que usa un formato de pesos propietario (`.infernix`).
- Memoria de contexto: solo los primeros 32.768 tokens de KV se reservan al arranque; los contextos mas largos toman su KV de la cache de expertos a medida que crecen y la devuelven al terminar.
- Latencia y throughput: la model card reporta mejoras relativas de decode con MTP (+18 % greedy, +7,5 % con el muestreo recomendado) y una tabla de velocidades por carga de trabajo cuyos valores numericos no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.5-122B-UNCENSORED-NVFP4-Infernix | 122B totales (A10B activos) | Hasta 262.144 tokens | MIT (drafter DFlash2 Apache 2.0) | Solo motor Infernix, formato `.infernix` |
| dealignai/Ornith-1.5-122B-UNCENSORED-NVFP4 | 122B totales (A10B activos) | No disponible | No disponible | Exportacion NVFP4 del modelo original |
| ornith-ai/Ornith-1.5-122B | 122B totales (A10B activos) | No disponible | No disponible | Modelo original de referencia |
| incoai/Ornith-1.5-122B-DFlash2 | No disponible (drafter) | No disponible | Apache 2.0 | Drafter de decodificacion especulativa |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las alternativas de la misma categoria (MoE de gran tamano con cuantizacion agresiva para hardware de consumo) no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo sin mecanismos de rechazo: la model card advierte explicitamente de que responde a peticiones que el modelo base deniega, incluidas las daninas. No debe desplegarse ante usuarios finales sin controles de seguridad propios.
- Trabajo amateur generado con asistencia de IA: el autor advierte de que el artefacto, la receta de conversion, el motor y buena parte de la card fueron producidos con IA y probablemente no sean completos ni exactos. No hay garantias de calidad ni de soporte.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion en la informacion disponible.
- Idiomas soportados no documentados: el campo de idiomas no esta poblado, por lo que no puede confirmarse el soporte multilingue.
- Dependencia de un motor propietario: el formato `.infernix` solo lo lee Infernix, con requisitos de version (commit `c17e24a8` o posterior) y de hardware (`sm_120a`, 32 GB). No hay portabilidad a ecosistemas estandar como vLLM, llama.cpp u Ollama.
- Requisitos de memoria elevados: unos 70 GiB de RAM del host en el modo todo-en-RAM y 76 GB de disco; con menos RAM se degrada a lectura desde SSD, lo que afecta a la latencia.
- Restricciones de licencia: la licencia declarada es MIT, pero el modelo original, el drafter MTP y el drafter DFlash2 (Apache 2.0) tienen condiciones propias que deben verificarse antes de uso comercial. La card enlaza a la licencia del modelo original en el repositorio de ornith-ai.
- Verificacion limitada: la comprobacion bit-exacta cubre el checkpoint frente al artefacto, pero no se han publicado evaluaciones de calidad del modelo cuantizado frente al original en tareas downstream.
- Fecha de creacion futura en los metadatos (2026-10-26): conviene tratar las marcas temporales del repositorio con cautela.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/wallawalla47/Ornith-1.5-122B-UNCENSORED-NVFP4-Infernix
- Modelo base (exportacion NVFP4 sin rechazo): https://huggingface.co/dealignai/Ornith-1.5-122B-UNCENSORED-NVFP4
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter DFlash2 de Inco AI: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Motor Infernix (repositorio): https://github.com/Wallawalla47/Infernix
- Papers, blogs y demos adicionales: no disponible en la informacion proporcionada.
