# woooflet/Inkling-2-Small-NVFP4-FLARE-GB10

## Resumen

Inkling-2-Small-NVFP4-FLARE-GB10 es un paquete de despliegue listo para servir del modelo Inkling 2 Small de Thinking Machines, publicado por el usuario woooflet. Se trata de una compilacion no oficial de la comunidad que empaqueta los pesos en formato NVFP4 (cuantizacion de 4 bits en coma flotante) mediante el stack NVIDIA Hyperflare (Ignition / spark-local-inference), disenado especificamente para un cluster de cuatro nodos DGX Spark con SoC GB10. El modelo subyacente es un Mixture of Experts (MoE) hibrido con vision, de 594.000 millones de parametros totales y aproximadamente 17.000 millones activos por token, distribuido en 48 capas con 384 expertos por capa.

El paquete existe porque el checkpoint NVFP4 publicado por Local Inference Lab (formato CSF) no era ingerible directamente por la receta `inkling2` del stack Ignition: esta busca tensores `weight_scale` nativos y el checkpoint CSF solo almacena las escalas de los expertos en forma comprimida. El autor convirtio el checkpoint CSF a un layout de escalas nativas (una expansion sin perdida, no una recuantizacion) y ejecuto la exportacion estandar de Ignition, obteniendo un paquete tensor-parallel a traves de los cuatro nodos con una ventana de contexto de 1.048.576 tokens y un pool de cache KV de 4.230.400 tokens.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE de gran escala con capacidades multimodales y contexto de un millon de tokens; por otro, ilustra un patron practico de inferencia local distribuida en hardware de escritorio de gama alta (DGX Spark), incluyendo los detalles de conversion de formatos de cuantizacion que suelen ser el principal obstaculo en estos despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con vision (`Inkling2ForConditionalGeneration`), 48 capas, hidden 4608, intermediate 2304, 384 expertos por capa |
| Parametros totales | 594.000 millones (594B) |
| Parametros activos | ~17.000 millones (~17B) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (4 bits, escalas `float8_e4m3fn`); checkpoint CSF de origen |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (49 shards, 344.366.116.864 bytes de payload); paquete FLARE/Ignition |
| Tamano del repo | 350,5 GB |
| Cache KV | Pool de 4.230.400 tokens |
| Paralelismo | Tensor-parallel en 4 nodos DGX Spark (GB10) |
| Modelo base | thinkingmachines/Inkling-2-Small |
| Checkpoint de origen | local-inference-lab/Inkling-2-Small-NVFP4-CSF (revision 614db8960cbce9e7d6ff04e886f4c2815972007e) |
| Commit de la receta | flare `21a40f05`, receta `inkling2` |
| Draft especulativo | `mtp.safetensors` (DSpark) incluido |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture of Experts hibrido con torre de vision, identificado en la configuracion como `Inkling2ForConditionalGeneration`. Consta de 48 capas con dimension oculta de 4608 y dimension intermedia de 2304, y 384 expertos por capa. Con 594B parametros totales y ~17B activos por token, la relacion de activacion es de aproximadamente el 2,9 %, lo que situa al modelo en la categoria de MoE de grano muy fino (muchos expertos pequenos). El checkpoint incluye un draft especulativo `mtp.safetensors` (DSpark) para decodificacion especulativa, y la receta emplea una activacion de tipo `situ` y una vista dual A16 en sus kernels.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; la model card del paquete FLARE se centra exclusivamente en el proceso de conversion y empaquetado, no en el entrenamiento del modelo original. La innovacion tecnica documentada en esta ficha es la conversion de formato: el checkpoint CSF almacena las escalas de los 55.296 expertos (48 capas x 384 expertos x 3 proyecciones) como 276.480 tensores comprimidos `csf32_{bases,codes,page_bases,offsets,exceptions}` (5 componentes por escala), sin ningun `weight_scale` plano. El autor verifico el layout sobre la capa 0 (equivalencia bit a bit entre expansion con y sin swizzle, consistencia entre expansion por experto y por lote, escaneo de NaN), expandio las escalas con `expand_source_scales(swizzled=False)` a `float8_e4m3fn` (formas (2304, 288) para up/gate y (4608, 144) para down) y copio el resto de tensores literalmente. La reverificacion final confirmo 222.602 tensores, 344.366.116.864 bytes exactos y ausencia de nombres `csf32_`. Se trata de un decode sin perdida, no de una recuantizacion.

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline `image-text-to-text`, con torre de vision integrada en el checkpoint.
- Procesamiento de contexto ultralargo: ventana de 1.048.576 tokens, adecuada para documentos completos, bases de codigo o conversaciones de muy largo recorrido.
- Decodificacion especulativa mediante el draft DSpark incluido (`mtp.safetensors`), orientada a reducir latencia por token.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion proporcionada).
- Tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado en la informacion proporcionada).
- Tokenizador basado en tiktoken (`tiktoken/tokenizer.model` incluido en el paquete).

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir arboles de codigo extensos y responder preguntas transversales sobre arquitectura, dependencias o deuda tecnica sin fragmentar el material.
- Procesamiento de documentacion legal o regulatoria: la ventana de contexto permite cargar contratos, expedientes o normativa completa y realizar extraccion y comparacion de clausulas en una sola pasada.
- Inferencia local en cluster de escritorio: el paquete esta disenado para cuatro DGX Spark (GB10) con tensor-parallel, lo que permite servir un MoE de 594B en hardware de sobremesa de gama alta en lugar de centros de datos.
- Asistentes sobre imagenes y texto: el pipeline image-text-to-text habilita tareas de descripcion, extraccion de datos de capturas o documentos escaneados y respuesta a preguntas visuales.
- Investigacion sobre cuantizacion NVFP4: el paquete y sus scripts (`convert_csf_to_native.py`, `finish_native.py`) sirven como referencia reproducible para convertir checkpoints CSF a escalas nativas en el stack Ignition.
- Despliegue con decodificacion especulativa: el draft DSpark incluido permite evaluar el impacto de la decodificacion especulativa en throughput dentro de un cluster GB10.
- Evaluacion comparativa de MoE de grano fino: con ~17B activos sobre 594B totales, es un banco de pruebas para medir el equilibrio entre calidad y coste de inferencia en arquitecturas de muchos expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el payload de pesos es de 344.366.116.864 bytes (~344 GB) en NVFP4; el repo completo ocupa 350,5 GB. Requiere almacenamiento local de al menos ese tamano en cada nodo segun el reparto de shards.
- Hardware objetivo: cluster de cuatro nodos NVIDIA DGX Spark (SoC GB10), con tensor-parallel a traves de los cuatro nodos.
- No cabe en una GPU de consumo individual (RTX 4090, 24 GB) ni en una unica GPU de centro de datos de 80 GB; el despliegue esta pensado para el agregado de cuatro nodos GB10.
- Opciones de despliegue: stack NVIDIA Hyperflare / Ignition (spark-local-inference), commit `21a40f05`, receta `inkling2`. No se documentan opciones alternativas (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Cache KV: pool de 4.230.400 tokens, lo que condiciona la memoria disponible para secuencias concurrentes.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa via DSpark esta incluida, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Small-NVFP4-FLARE-GB10 | 594B | ~17B | 1.048.576 | NVFP4 | Apache 2.0 | Paquete FLARE para 4x DGX Spark |
| Inkling-2-Small (original) | 594B | ~17B | no disponible | no disponible | no disponible | thinkingmachines/Inkling-2-Small |
| Inkling-2-Small-NVFP4-CSF | 594B | ~17B | no disponible | NVFP4 (CSF) | no disponible | local-inference-lab/Inkling-2-Small-NVFP4-CSF |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos de otros desarrolladores en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Build no oficial: no esta publicado por Thinking Machines, Local Inference Lab ni NVIDIA; el soporte y la validacion corren a cargo del autor comunitario.
- Firmado con una clave de publicador de desarrollo local (`development-publisher.json`), no con una clave de publicacion oficial.
- Los pesos viven en la rama `gb10` del repositorio; la rama `main` solo contiene la model card.
- Dependencia estricta del stack: requiere Hyperflare/Ignition en el commit `21a40f05` y la receta `inkling2`; otros commits o frameworks pueden no ingerir el paquete.
- Requiere un cluster de cuatro nodos GB10; no es desplegable en GPU individual ni en configuraciones estandar de servidor sin adaptacion.
- La ventana de 1M tokens comparte un pool de cache KV de 4.230.400 tokens, por lo que el numero de secuencias concurrentes a maxima longitud es limitado.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en idiomas distintos de los cubiertos por el entrenamiento original.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben asumirse los habituales de un modelo de lenguaje de gran escala.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la cadena de licencias del modelo base original no se detalla en la informacion disponible y conviene verificarla antes de produccion.
- El proceso de conversion, aunque verificado como sin perdida, es sensible al layout de escalas (swizzle, formas por proyeccion); modificarlo puede romper la inferencia sin errores evidentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woooflet/Inkling-2-Small-NVFP4-FLARE-GB10
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint NVFP4 CSF de origen: https://huggingface.co/local-inference-lab/Inkling-2-Small-NVFP4-CSF
- NVIDIA spark-local-inference (Hyperflare/Ignition): https://github.com/NVIDIA/spark-local-inference
