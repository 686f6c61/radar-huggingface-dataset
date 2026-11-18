# Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP

## Resumen

Qwen3.8 Flash-Next es un modelo de lenguaje y vision de tipo mixto de expertos (MoE) desarrollado por Alibaba Qwen, publicado bajo la licencia Qwen Community 1.0. Esta ficha describe la conversion a MLX de 4 bits realizada por Vontra (bajo el sello TensorFold), que reconstruye el checkpoint oficial en BF16 preservando el bloque MTP nativo del modelo para decodificacion especulativa. El resultado es un artefacto de 113,2 GB con 179.999.981.459 parametros totales, pensado para ejecutarse en Apple Silicon mediante MLX-VLM y oMLX.

La relevancia de esta version radica en dos factores. Primero, permite ejecutar un modelo de escala frontera (contexto configurado de 262.144 tokens) en hardware de consumo Apple con cuantizacion uniforme de 4 bits y tamano de grupo 32. Segundo, conserva el bloque MTP (multi-token prediction) nativo, lo que habilita decodificacion especulativa sin un modelo borrador externo y con una mejora medida de throughput del 12,97 % en un Apple M3 Studio.

Arquitectonicamente combina un codificador de vision con una pila de lenguaje que integra Gated DeltaNet, Qwen Sparse Attention, capas MoE dispersas, flujos residuales con compuertas ensanchadas, embeddings hashed de bigramas y trigramas, y el citado bloque de prediccion de siguiente token. La ficha cubre exclusivamente lo documentado en la model card del autor; los datos no publicados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`: vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | 4 bits afina uniforme, group size 32; modulos multimodales y compuertas `mlp.gate` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | MLX safetensors (22 shards, 3.747 tensores indexados, 76 entradas MTP) |
| Tamano del repositorio | 113,209 GB / 105,434 GiB |
| Modelo base | Qwen/Qwen3.8-Flash-Next (checkpoint BF16 oficial) |
| Pipeline | image-text-to-text |
| Libreria | mlx |
| Decodificacion especulativa | MTP nativo, un bloque borrador Qwen4Exp |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con codificador de vision. La pila de lenguaje combina cuatro mecanismos destacables: Gated DeltaNet (capa de estado recurrente con compuertas), Qwen Sparse Attention, capas de mezcla de expertos dispersa y flujos residuales con compuertas ensanchadas. A esto se suman tablas de embeddings hashed de bigramas y trigramas de anchura 160, que esta conversion tambien cuantiza a 4 bits con group size 32. El bloque MTP nativo actua como borrador interno para decodificacion especulativa, evitando la necesidad de un modelo draft separado.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos se consideran no disponibles. Lo que si se documenta con precision es el proceso de conversion: se parte del checkpoint BF16 oficial, se aplica cuantizacion afina de MLX a los modulos de lenguaje y MTP elegibles, y se mantienen en BF16 los modulos multimodales y las compuertas de enrutamiento MoE (`mlp.gate`) para preservar la calidad del enrutamiento. Se conservan el tokenizador, la plantilla de chat, el procesador de vision, la configuracion de generacion y la configuracion MTP originales.

La innovacion tecnica principal de este artefacto es la preservacion del bloque MTP dentro de un checkpoint cuantizado, algo que exige runtimes con soporte explicito de `qwen4_exp`. Un runtime que no construya el modulo Qwen4Exp MTP rechazara las 76 entradas de tensores MTP durante la carga estricta.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto configurado de hasta 262.144 tokens.
- Comprension de imagen y texto (pipeline `image-text-to-text`), sujeta a la version de MLX-VLM y oMLX empleada.
- Razonamiento de varios pasos y cadenas de pensamiento, segun el comportamiento del modelo base.
- Decodificacion especulativa nativa mediante MTP, con profundidad de borrador configurable (tres tokens en las pruebas publicadas).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes: no documentado en la model card.
- Capacidades de audio: no disponibles.
- API compatible con OpenAI a traves de oMLX.

## Casos de uso

- Asistente conversacional local en Apple Silicon: con 262.144 tokens de contexto configurado, el modelo puede mantener sesiones largas con historial extenso y documentos adjuntos sin truncar, ejecutandose en un unico equipo de sobremesa Apple.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer y razonar sobre diagramas, capturas o tablas escaneadas combinadas con texto, siempre que la version de MLX-VLM instalada soporte vision.
- Prototipado de agentes con API compatible OpenAI: oMLX expone un endpoint compatible que permite conectar frameworks existentes sin reescribir el cliente, util para validar flujos de agente antes de migrar a infraestructura GPU.
- Evaluacion de decodificacion especulativa: el bloque MTP permite comparar modos con y sin borrador sobre el mismo checkpoint, midiendo tasa de aceptacion y throughput con paridad de salida exacta verificada.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse integramente en local sobre pesos MLX, los datos no salen del equipo, lo que encaja en flujos con datos sensibles.
- Investigacion en cuantizacion: la separacion entre modulos cuantizados a 4 bits y modulos retenidos en BF16 (vision y compuertas de enrutamiento) ofrece un caso de estudio reproducible sobre el impacto de la precision mixta en modelos MoE.
- Generacion de codigo y tareas de razonamiento tecnico: el modelo base es de proposito general y el contexto largo permite incluir repositorios o especificaciones extensas en el prompt, aunque no hay benchmarks publicados que cuantifiquen su rendimiento en codigo.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros). Si se documentan mediciones de inferencia propias:

| Metrica | MTP desactivado | MTP activado (3 tokens de borrador) |
|---|---|---|
| Entorno | oMLX 0.6.3rc3 (build 2475), Apple M3 Studio | mismo entorno |
| Runs medidas | 3 | 3 |
| Salida por run | 512 tokens | 512 tokens |
| Velocidad mediana de generacion | 27,8314 tokens/s | 31,4418 tokens/s |
| Tokens borradorados | no aplica | 960 |
| Tokens aceptados | no aplica | 655 |
| Tasa de aceptacion | no aplica | 68,23 % |
| Delta de throughput | referencia | +12,97 % |
| Paridad de salida exacta | no aplica | superada |
| Runs sostenidas a 512 tokens | superada | superada |

Condiciones de medida: decodificacion greedy, semilla 6330, prompts identicos, calentamiento separado y tres runs medidas de 512 tokens por modo. La primera peticion tras la carga incluye calentamiento de modelo y kernels y queda excluida del resultado en regimen estacionario. Las cifras cubren solo generacion de texto.

## Requisitos de hardware

- VRAM/ memoria unificada: el repositorio pesa 113,209 GB, por lo que se necesita un equipo Apple Silicon con al menos 128 GB de memoria unificada para cargar los pesos con margen para cache KV y activaciones.
- GPU recomendadas: Apple M3 Studio es el unico hardware con mediciones publicadas. No hay datos para M1, M2, M4 ni para GPUs NVIDIA en esta conversion, que es especifica de MLX.
- Cabe en GPU de consumo: si, en configuraciones Apple Silicon de gama alta con memoria unificada suficiente; no es ejecutable en GPUs NVIDIA o AMD mediante esta conversion.
- Opciones de despliegue: oMLX (0.6.3rc3 build 2475 validado) y MLX-VLM (0.6.3) sobre MLX 0.32.0. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: 27,83 tokens/s sin MTP y 31,44 tokens/s con MTP de tres tokens en Apple M3 Studio; el delta varia con longitud de prompt, crecimiento de contexto, estado de cache, version del runtime, presion de memoria y condiciones termicas.
- Latencia: no disponible mas alla de las cifras de velocidad de generacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa se marca como no disponible. A modo de referencia estructural:

| Modelo | Parametros totales | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP | 179.999.981.459 | 262.144 | MLX safetensors 4 bits | Qwen Community 1.0 | Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en esta ficha | no disponible en esta ficha | BF16 | Qwen Community 1.0 | GPU |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Compatibilidad estricta de runtime: solo funciona con builds que soporten explicitamente `qwen4_exp` y MTP nativo; versiones antiguas de oMLX o MLX-VLM rechazaran las 76 entradas de tensores MTP al cargar.
- Requisito de memoria elevado: 113,2 GB de pesos implican equipos Apple Silicon de gama muy alta; no es viable en portatiles con 16, 32 o 64 GB.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otras lenguas sin evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas de factualidad para este checkpoint.
- Sesgos: no se documentan analisis de sesgo en la model card; deben asumirse los del modelo base, no evaluados aqui.
- Soporte de vision condicionado: la entrada de imagen depende de la version de MLX-VLM y oMLX; las cifras de rendimiento publicadas cubren solo texto.
- Licencia Qwen Community 1.0: no es una licencia open source aprobada por la OSI; incluye terminos especificos de uso comercial que deben revisarse antes de desplegar en produccion.
- Cuantizacion irreversible: la perdida de precision de 4 bits puede degradar tareas sensibles; las compuertas de enrutamiento y los modulos de vision se mantienen en BF16 precisamente para mitigar parte de este efecto, pero no hay evaluacion de calidad publicada.
- Datos de entrenamiento no disponibles: no se puede auditar la composicion del corpus ni el proceso de alineacion.
- Sin benchmarks academicos: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Sitio de Qwen: https://qwen.ai/
- MLX-VLM (repositorio): https://github.com/ml-explore/mlx-vlm
- TensorFold: https://tensorfold.dev
- Licencia Qwen Community 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit-MTP/blob/main/LICENSE
