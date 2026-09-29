# taurusduan/GLM-5.3-Flash-GGUF-DGX-Spark

## Resumen

GLM-5.3-Flash-GGUF-DGX-Spark es una cuantizacion GGUF del modelo base zai-org/GLM-5.3-Flash, publicada por el usuario taurusduan. Se trata de una compresion post-entrenamiento de tipo SLIM-Q (Selective expert pruning + Low-bit quantization for Inference of MoE) desarrollada por AutoTrust, que combina dos ejes de esparsidad: la propia del MoE (cada token activa 8 de los expertos enrutados) y una segunda estructural, que elimina permanentemente 32 de los 288 expertos enrutados por capa (el 11 % menos usados), conservando 256. El resultado es un checkpoint de 79,1 GiB frente a los 90 GiB del Q2 original, un 12 % menos de huella, sin alterar el coste por token.

El objetivo declarado es que el modelo quepa y funcione con holgura en una unica NVIDIA DGX Spark de 128 GB de memoria unificada: tras cargar los pesos quedan unos 40 GiB libres, lo que permite un contexto de 64 K (o cuatro sesiones de 16 K con batching continuo), frente a los 16-32 K que permitiria el Q2 sin podar. El modelo se ejecuta en llama.cpp mediante el backend glm5-next (pull request #27773, no fusionado en el momento de redactar la model card), con servidor compatible con la API de OpenAI, batching continuo, tool calling y salida separada de razonamiento en `reasoning_content`.

La relevancia actual es doble: por un lado, demuestra una receta reproducible para desplegar MoE de frontera en hardware de escritorio o de un solo nodo; por otro, el propio autor publica un hermano mayor de 744B (autotrust/GLM-5.3-GGUF-DGX-Spark, variante E192) cuya edicion NVFP4 alimenta Guru Turbo 2.0. El recuento de parametros reportado en safetensors para el modelo base es de 279.498.438.142 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida KDA + DSA, capas densas, expertos compartidos y router (segun la model card) |
| Parametros totales | 279.498.438.142 (dato de safetensors del modelo base); el checkpoint GGUF cuantizado ocupa 79,1 GiB |
| Parametros activos | 8 de 256 expertos enrutados por token (top-8) mas expertos compartidos; cifra exacta de parametros activos no disponible |
| Longitud de contexto | hasta 1.000.000 de tokens; 65.536 tokens (64 K) como ajuste comodo en DGX Spark |
| Tipos de cuantizacion | GGUF mixta: IQ2_XXS en gate/up de los expertos enrutados, Q2_K en down; atencion, capas densas, expertos compartidos y router en alta precision (atencion a ~8 bits) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF en dos shards: `GLM-5.3-Flash-Q2-DGX-Spark-00001-of-00002.gguf` (41,9 GiB) y `-00002-of-00002.gguf` (37,2 GiB); checksums en `GLM-5.3-Flash-Q2-DGX-Spark.sha256` |

## Arquitectura y entrenamiento

La arquitectura es un MoE de tipo transformer con un componente de atencion hibrido descrito como KDA + DSA: las capas KDA mantienen un estado constante y las DSA emplean una cache compacta, lo que reduce el crecimiento de memoria por token de contexto (aproximadamente 1 GiB por cada 16 K tokens, segun la model card). Cada token activa 8 de los 256 expertos enrutados conservados (originalmente 288), y el checkpoint mantiene sin tocar la atencion, las capas densas, los expertos compartidos, el router, el tokenizer y la plantilla de chat. El coste de computo y de trafico de memoria por token es identico al del Flash Q2 sin podar: solo se reduce la huella de pesos.

El proceso de compresion SLIM-Q tiene dos etapas. La primera perfila el uso de expertos sobre una mezcla de calibracion bilingue de codigo, agentes, ciencia y matematicas, y elimina estructuralmente los 32 expertos menos usados de cada capa; a diferencia del skipping dinamico, esto reduce de forma permanente el peso en disco y en memoria. La segunda etapa cuantiza de forma agresiva unicamente los expertos enrutados (IQ2_XXS en gate/up y Q2_K en down), manteniendo en alta precision las partes criticas para preservar el comportamiento del router. La model card no detalla el volumen de tokens de entrenamiento del modelo base, la composicion del dataset original ni si hubo fases de RLHF o DPO; esos datos no estan disponibles.

## Capacidades

- Generacion de texto conversacional con plantilla de chat integrada (pipeline: text-generation).
- Modo de razonamiento explicito activado por defecto: la plantilla GLM abre `<think>`; se puede desactivar con `--reasoning-budget 0`, limitar con `--reasoning-budget 4096` o ajustar el esfuerzo con `--chat-template-kwargs '{"reasoning_effort":"low"}'` (valores low / high / max).
- Tool calling / function calling con formato OpenAI: las llamadas se devuelven como `tool_calls` estandar.
- Servidor compatible con la API de OpenAI (`llama-server`), con batching continuo para atender varias sesiones simultaneas.
- Razonamiento de varios pasos y uso en flujos de agente (los tags del repo incluyen `conversational` y `base_model` orientado a agentes; la calibracion de poda incluye mezcla de agentes).
- Capacidades bilingues limitadas a ingles y chino.
- Buen rendimiento declarado en codigo, matematicas y ciencia segun los benchmarks recogidos mas abajo.
- Vision y audio: no disponibles (no se mencionan en la informacion proporcionada).

## Casos de uso

- Asistente conversacional largo en un unico DGX Spark: con 64 K de contexto comodo y unos 40 GiB libres, se puede mantener un historial extenso sin truncar, util para analisis de documentos tecnicos o normativa extensa en ingles o chino.
- Atencion al cliente multiusuario: con `-np 4 -c 65536` se sirven cuatro sesiones de 16 K con batching continuo sobre la misma instancia, un ajuste razonable para equipos pequenos que necesitan un endpoint compatible con OpenAI sin depender de la nube.
- Agentes con herramientas en local: el soporte de `tool_calls` en formato OpenAI permite integrarlo en orquestadores tipo LangChain o frameworks de agentes que ya consumen esa interfaz, ejecutando la inferencia en hardware propio.
- Asistente de programacion con modo de razonamiento: los 97,6 puntos de HumanEval declarados en la version de 4 bits y la mezcla de calibracion con codigo lo orientan a generacion, revision y explicacion de codigo; el `reasoning_content` separado facilita mostrar solo la respuesta final al usuario.
- Investigacion y prototipado en IA: al ser un GGUF de licencia MIT sobre un modelo base abierto, sirve para reproducir experimentos de compresion, comparar calidad entre 2 y 4 bits o validar tecnicas de poda de expertos sin coste de API.
- Resolucion de problemas cientificos y matematicos asistida: los 77,3 puntos declarados en GPQA-D y la inclusion de ciencia y matematicas en el conjunto de calibracion lo hacen apto para borradores de razonamiento tecnico que luego valida un especialista.
- Despliegue en portatil o estacion de trabajo Apple Silicon de 128 GB: la model card indica que funciona sin CUDA, lo que permite tener un MoE de esta escala en un equipo de sobremesa, util para demos y desarrollo offline.
- Procesamiento por lotes de documentacion bilingue: al cubrir ingles y chino, se puede emplear para traduccion asistida, resumen o extraccion de datos en corpus que mezclan ambos idiomas.

## Benchmarks y rendimiento

La model card incluye una comparativa entre el Flash Q2 sin comprimir y este build. Los datos de calidad se presentan en la fila correspondiente a la variante de 4 bits y se indica que la prueba A/B con arnes de 2 bits esta "a la par o mejor". No se especifica con total claridad a que build exacto corresponden los numeros de 4 bits, por lo que se reproducen tal cual figuran.

| Metrica | Stock GLM-5.3-Flash Q2 GGUF | Este modelo (GGUF DGX-Spark) |
|---|---|---|
| Tamano | 90 GiB | 79,1 GiB (-12 %) |
| Expertos enrutados por capa (activos por token) | 288 (8) | 256 (8) |
| Memoria unificada libre en Spark de 128 GB tras los pesos | ~25 GiB | ~40 GiB |
| Contexto comodo en Spark | 16-32 K | 64 K, hasta 1 M |
| Velocidad de decodificacion | referencia | misma clase (trabajo por token identico) |
| HumanEval | referencia | 97,6 (4 bits) |
| C-Eval | referencia | 89,4 (4 bits) |
| GPQA-D | referencia | 77,3 (4 bits) |

No se han publicado en la informacion disponible resultados adicionales (MMLU, GSM8K, MT-Bench ni equivalentes), ni mediciones de latencia o throughput realizadas por el autor sobre una DGX Spark.

## Requisitos de hardware

- VRAM / memoria necesaria: 79,1 GiB de pesos, mas aproximadamente 1 GiB por cada 16 K tokens de contexto (las capas KDA mantienen estado constante y las DSA usan cache compacta), mas unos pocos GiB de buffers de computo.
- DGX Spark (GB10, 128 GB de memoria unificada): objetivo principal. Con `-c 65536` quedan unos 30 GiB libres; con `-np 4 -c 65536` (4 x 16 K) se obtiene un buen ajuste multiusuario.
- Apple Silicon de 128 GB: soportado, compilando con `cmake -B build` sin CUDA.
- GPU NVIDIA discretas: la model card indica tarjetas con 90 GB o mas. En tarjetas menores es posible la descarga parcial de capas con `-ngl N`.
- GPU de consumo: no caben los pesos completos en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB); solo con offload parcial de capas, con la penalizacion de rendimiento correspondiente. No se aportan cifras de rendimiento para estos casos.
- Opciones de despliegue: llama.cpp con el backend glm5-next (pull request #27773, no fusionado en el momento de escribir la model card; hay que compilar esa rama), `llama-server` para API compatible con OpenAI y `llama-cli` para chat de contexto largo. Otros runtimes GGUF (Ollama, LM Studio, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: aproximadamente 15-20 t/s en un solo flujo sobre DGX Spark, limitado por el ancho de banda LPDDR5X de 273 GB/s y unos 11 GB de pesos leidos por token. El batching de varias sesiones aumenta el throughput agregado. Estas cifras no fueron medidas por el autor sobre una Spark; la model card remite a una tabla con numeros relativos sobre B200 que no se incluye en el extracto disponible.
- Recomendaciones de despliegue: mantener el archivo en la NVMe interna (la primera carga lee 79 GiB), detener otras tareas de GPU antes de cargar y compilar con `-DCMAKE_CUDA_ARCHITECTURES=121a-real` para GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa | Contexto | Tamano del checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| taurusduan/GLM-5.3-Flash-GGUF-DGX-Spark | 279,5 B (safetensors del base) | 256 (8 activos) | hasta 1 M; 64 K comodo | 79,1 GiB | MIT | GGUF, 2 shards |
| Stock zai-org/GLM-5.3-Flash Q2 GGUF | no disponible | 288 (8 activos) | 16-32 K comodos en Spark | 90 GiB | MIT (heredada del base) | GGUF |
| autotrust/GLM-5.3-GGUF-DGX-Spark (SLIM-Q E192) | 744 B | 192 (segun la model card) | no disponible | no disponible | no disponible | GGUF, build para dos Sparks |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento con alternativas externas.

## Limitaciones y advertencias

- El recuento de parametros de safetensors (279.498.438.142) es notablemente inferior a los 744 B del build hermano citado en la model card; conviene verificar a que checkpoint corresponde exactamente ese dato antes de usarlo en documentacion o comparativas.
- La model card esta truncada en el extracto disponible (corta en "## Sp"), por lo que podria faltar informacion sobre rendimiento, limitaciones o uso.
- El comando de descarga de la model card apunta al repositorio `autotrust/GLM-5.3-Flash-GGUF-DGX-Spark`, no a `taurusduan/GLM-5.3-Flash-GGUF-DGX-Spark`. Hay que asegurarse de descargar el repositorio correcto.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, y la fecha de creacion es muy reciente; no hay validacion independiente de la calidad del build.
- La poda estructural de 32 expertos por capa es irreversible y puede degradar dominios poco representados en el conjunto de calibracion (codigo, agentes, ciencia y matematicas). La model card solo reporta una prueba A/B con arnes, sin detalle de tareas.
- La cuantizacion de 2 bits en los expertos enrutados (IQ2_XXS y Q2_K) implica una perdida de precision mayor que en las versiones de 4 bits; los numeros de HumanEval, C-Eval y GPQA-D citados corresponden a 4 bits y no son extrapolables directamente a este checkpoint.
- Idiomas limitados a ingles y chino: el rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion inherente a los modelos generativos: no se aportan tasas de error ni evaluaciones de veracidad.
- El backend glm5-next vive en un pull request de llama.cpp no fusionado; el soporte puede cambiar y la compilacion requiere seguir una rama especifica.
- El modelo necesita memoria unificada o VRAM muy elevada (79,1 GiB de pesos); no es viable en GPUs de consumo sin offload parcial.
- Los sesgos del modelo base no se documentan en la informacion disponible; hereda los del checkpoint original zai-org/GLM-5.3-Flash.
- Aunque la licencia declarada es MIT, conviene confirmar las condiciones del modelo base antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taurusduan/GLM-5.3-Flash-GGUF-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build hermano de 744B (SLIM-Q E192) citado en la model card: https://huggingface.co/autotrust/GLM-5.3-GGUF-DGX-Spark
- Pull request de llama.cpp con soporte glm5-next: https://github.com/ggml-org/llama.cpp/pull/27773
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con la consulta y se han descartado.
