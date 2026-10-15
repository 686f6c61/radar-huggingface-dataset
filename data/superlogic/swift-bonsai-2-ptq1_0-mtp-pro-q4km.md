# SuperLogic/Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km

## Resumen

Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km es un empaquetado GGUF de un modelo de "nivel 27B" derivado de Qwen3.8-27B, publicado por el usuario SuperLogic sobre el trabajo previo de PrismML (cuantización ternaria Ternary-Bonsai-2-27B) y de UkisAI (ajuste de eficiencia de razonamiento Swift-Bonsai-2). No es un modelo entrenado desde cero: la capa final del proyecto mezcla la cuantización ternaria con una cabeza MTP (multi-token prediction) para decodificación especulativa y vuelve a empaquetar los pesos en un único GGUF. Su propuesta es ejecutar un modelo de esa escala en GPU de portátil con 8 GB de VRAM, con velocidades declaradas de 70 tokens/s en modo sin razonamiento y de 100 a 200 tokens/s en modo edición.

El repositorio ocupa 6,8 GB y contiene dos ficheros: el modelo principal de 5,79 GB (866 tensores, con embeddings y capa de salida en q4_K_M para preservar precisión) y un proyector visual de 0,59 GB que habilita entrada de imágenes. La cuantización ternaria PTQ1_0 (ternary g128 con rotación de Hadamard por bloques y escalado de grupo en FP16) reduce el peso de las matrices, y la decodificación especulativa con profundidad 3 multiplica el rendimiento efectivo.

Su relevancia actual es doble: por un lado, demuestra que un modelo de 27B puede caber y correr a velocidad interactiva en hardware de consumo; por otro, es un ejemplo de cadena de derivación en la que cada capa mantiene licencia Apache 2.0, lo que facilita su reutilización comercial siempre que se respeten las atribuciones. Como contrapartida, exige un fork concreto de llama.cpp con tipos de tensor y contexto de borrador propios, por lo que no funciona con el llama.cpp oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención, aproximadamente 75% atención lineal y 25% atención completa, segun la model card del modelo base Qwen3.8-27B |
| Parametros totales | La model card describe un modelo de "nivel 27B"; los metadatos de safetensors del repositorio declaran 460.730.096 parametros. Los dos datos no coinciden y no hay aclaracion del autor |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | 65.536 tokens en la configuracion recomendada para 8 GB de VRAM y 32.768 tokens para 6 GB. Maximo nativo del modelo base: no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario (ternary g128, rotacion de Hadamard por bloques, escalado de grupo en FP16) en las matrices; q4_K_M en embeddings y capa de salida; cache KV en q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 en toda la cadena de derivacion; el motor fork (zgsndzq/ada-ternary) es MIT |
| Formato de pesos | GGUF para llama.cpp: 5,79 GB el modelo principal (866 tensores, con cabeza MTP embebida en blk.64.nextn) y 0,59 GB el proyector visual mmproj |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer de atención híbrida en el que cerca del 75% de las capas usan atención lineal y el 25% restante atención completa. Sobre esa base, PrismML aplicó una cuantizacion ternaria post-entrenamiento denominada PTQ1_0: los pesos de matriz se llevan a valores ternarios con agrupacion de 128 elementos (g128), rotacion de Hadamard dentro de cada bloque y factores de escala de grupo en FP16. Después, UkisAI aplicó un ajuste fino orientado a eficiencia de razonamiento (la capa "Swift"), con un recorte declarado de aproximadamente el 39,8% en tokens de pensamiento sin perdida de puntuacion en los benchmarks reportados por ese autor. No se ha publicado el volumen de tokens ni la composicion del dataset de ese ajuste; tampoco se indica si hubo RLHF o DPO.

La aportacion del repositorio actual es de empaquetado y de inferencia, no de entrenamiento. Fusiona la capa 3 (Swift-Bonsai-2) con una cabeza de borrador MTP procedente de un donante de ProCreations en un unico GGUF, ajustando la precision de embeddings y salida a q4_K_M. La decodificacion especulativa opera con profundidad 3, es decir, cada paso de borrador propone hasta tres tokens que el modelo objetivo verifica con el vocabulario completo. La innovacion principal es la restriccion de la lista corta de borrador: la cabeza MTP tenia un output.weight de 265 MB ([5120, 248320]) que debia leerse por completo en cada paso de borrador; limitando la puntuacion a 24.000 filas del vocabulario realmente usadas por el corpus del autor, cada paso lee unos 26 MB, con un ahorro declarado del 90% en bytes y una tasa de aceptacion que el autor afirma equivalente. Tambien se cita el uso de CUDA Graph (aproximadamente 1,5x de mejora) y de una cache KV por niveles (kv-vram-cells) que desborda a memoria host fijada.

## Capacidades

- Generacion de texto en ingles y chino, con la misma distribucion de salida que el modelo objetivo porque la verificacion especulativa usa el vocabulario completo.
- Modo de razonamiento conmutables: el autor distingue explicitamente un modo "sin pensamiento" y un modo "editing", con velocidades medidas distintas para cada uno.
- Modo de edicion con velocidades declaradas de 100 a 200 tokens/s, orientado a reescritura y modificacion de texto o codigo.
- Vision: con el proyector mmproj-Qwen3.8-27B-Q8_0.gguf y el flag --image-min-tokens 1024 se habilita entrada de imagenes; la model card muestra como ejemplo la generacion de una disposicion de tablero de ajedrez chino a partir de una imagen.
- Decodificacion especulativa propia mediante cabeza MTP embebida, activada con --spec-type draft-mtp-adaptive.
- Contexto largo de hasta 65.536 tokens en la configuracion recomendada, con gestion por niveles de la cache KV.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente local sin conexion en portatil: el modelo completo pesa 5,79 GB, por lo que cabe en los 8 GB de VRAM de una GPU de portatil y permite mantener conversaciones sin enviar datos a ninguna API externa ni asumir coste por token.
- Analisis de documentos largos en local: con 65.536 tokens de contexto y cache KV en q4_0 con desbordamiento a memoria host, se pueden procesar informes, contratos o expedientes completos en una sola pasada sobre hardware de consumo.
- Revision y reescritura de codigo o textos: el modo edicion declarado a 100-200 tokens/s reduce la latencia en tareas iterativas de diff y reescritura, donde el cuello de botella es la espera entre iteraciones.
- Procesamiento por lotes de bajo coste: al ejecutarse sobre llama-server con decodificacion especulativa, sirve para generar resumenes, clasificaciones o extracciones sobre volumenes grandes de texto sin factura de inferencia, a costa del tiempo de maquina propio.
- Despliegue en entornos aislados o con requisitos de soberania de datos: al ser pesos locales con licencia Apache 2.0, encaja en laboratorios, administraciones o empresas que no pueden usar servicios en la nube.
- Tareas con entrada de imagen: con el proyector visual activado, se pueden construir flujos de descripcion de capturas, extraccion de informacion de diagramas o preanalisis de imagenes tecnicas, siempre dentro de la misma maquina.
- Evaluacion e investigacion en compresion extrema: sirve como banco de pruebas para medir el impacto real de la cuantizacion ternaria y de la decodificacion especulativa con lista corta de vocabulario en tareas de razonamiento.
- Servidor personal multiuso: con llama-server en 127.0.0.1 y un solo slot paralelo, se puede exponer una API compatible con OpenAI en local para conectar editores, scripts y clientes de linea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos facilitados son de velocidad de inferencia en una maquina de prueba con GPU de portatil de 8 GB.

| Medicion | Resultado declarado |
|---|---|
| Velocidad, modo sin razonamiento | 70 tokens/s |
| Velocidad, modo edicion | 100-200 tokens/s |
| Referencia en la misma maquina: LM Studio con Qwen3.8-27B en cuantizacion de 4 bits | 1-2 tokens/s |
| Profundidad de decodificacion especulativa MTP | 3 tokens por paso de borrador |
| Reduccion del vocabulario de borrador | de 248.000 a 24.000 entradas (lectura de 265 MB a unos 26 MB por paso) |
| Reduccion del peso del modelo | de unos 54 GB en FP16 a 5,79 GB |
| Mejora atribuida a CUDA Graph | aproximadamente 1,5x |
| Reduccion de tokens de pensamiento atribuida al ajuste UkisAI | aproximadamente 39,8%, con benchmarks declarados equivalentes por ese autor |

Todas estas cifras proceden del autor del modelo y no se han verificado de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: 5,79 GB en el modelo principal mas 0,59 GB si se activa el proyector visual.
- VRAM total recomendada: una GPU de portatil de 8 GB permite contexto de 65.536 tokens; con una GPU de 6 GB el autor recomienda bajar a 32.768 tokens.
- Cache KV en q4_0, con gestion por niveles (kv-vram-cells) que coloca la parte que no cabe en VRAM en memoria host fijada.
- Cabe en GPU de consumo de gama de 8 GB. No se especifican modelos concretos (RTX 4090, A100, H100 u otros) en la informacion proporcionada.
- Opciones de despliegue: llama-server del fork zgsndzq/ada-ternary, con runtime precompilado para Windows que incluye las dll de CUDA Runtime y no requiere instalar el CUDA Toolkit. El llama.cpp oficial no es compatible y falla con "unknown tensor type" al cargar PTQ1_0.
- Fichero de configuracion obligatorio: features.ini no esta integrado en el binario y debe pasarse con --features-file; sin el, el motor se comporta como el upstream y se pierden la lista corta de borrador de 24k, el particionado de KV y el muestreo probabilistico del borrador.
- Parametros de muestreo indicados: --temp 0.6 --top-k 20 --top-p 0.95.
- Latencia y throughput: 70 tokens/s sin razonamiento y 100-200 tokens/s en modo edicion, medidos por el autor en una GPU de portatil de 8 GB. No hay datos de latencia de primer token ni de throughput con mayor concurrencia.
- Requisito funcional: --spec-type draft-mtp-adaptive es imprescindible para que la cabeza MTP participe en el borrador; sin el, la velocidad cae mas de la mitad segun el autor.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km | Este repositorio | Nivel 27B segun model card; 460,7 M declarados en safetensors | 65.536 tokens en configuracion de 8 GB | 70 tokens/s sin razonamiento; 100-200 tokens/s en edicion (medicion del autor) | Apache 2.0 | GGUF, 5,79 GB, requiere fork propio |
| ukisai/Swift-Bonsai-2-GGUF | Capa inmediatamente anterior de la cadena | El mismo modelo base con ajuste de eficiencia de razonamiento | No disponible | No disponible | Apache 2.0 | GGUF |
| prism-ml/Ternary-Bonsai-2-27B-gguf | Cuantizacion ternaria de origen | Modelo de 27B en PTQ1_0 | No disponible | No disponible | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B | Modelo base original | 27B, atencion hibrida 75% lineal / 25% completa | No disponible en la informacion proporcionada | Referencia del autor: 1-2 tokens/s en 4 bits sobre LM Studio en la misma maquina | Apache 2.0 | Pesos originales |

No se dispone de datos de rendimiento en benchmarks de calidad para ninguno de los modelos de la cadena, por lo que la comparativa se limita a parametros, formato, licencia y las mediciones de velocidad aportadas por el autor.

## Limitaciones y advertencias

- No hay resultados de benchmarks de calidad publicados en la informacion disponible; las afirmaciones de "benchmarks equivalentes" proceden del autor de la capa de ajuste y no se han verificado de forma independiente.
- El repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe validacion de la comunidad ni replicaciones conocidas.
- Existe una discrepancia no aclarada entre la escala declarada (nivel 27B) y el recuento de parametros de los metadatos de safetensors (460.730.096).
- La cuantizacion ternaria comprime la precision de los pesos. El autor sostiene que afecta a la precision de la memoria y no a la capacidad de razonamiento, y que esta se puede recuperar inyectando contexto adicional, pero es una afirmacion del autor sin evidencia publicada.
- La decodificacion especulativa con lista corta de vocabulario de borrador es una optimizacion propia del proyecto; el autor afirma que la tasa de aceptacion se mantiene y que el objetivo verifica con el vocabulario completo, pero no hay mediciones independientes.
- Dependencia estricta de un fork no oficial de llama.cpp. El llama.cpp oficial falla al cargar los tensores PTQ1_0, lo que complica el mantenimiento, la actualizacion y la integracion con herramientas estandar.
- La configuracion no funciona correctamente sin features.ini, que no esta embebido en el binario ni forma parte del codigo fuente del motor; compilar el codigo sin ese fichero da lugar a un comportamiento distinto al documentado.
- Idiomas limitados a ingles y chino segun los metadatos. No hay informacion sobre el rendimiento en castellano ni en otras lenguas.
- Riesgo de alucinacion no cuantificado. No se han publicado evaluaciones de fidelidad, y el propio autor presenta el modelo como apto para "inyectar conocimiento" desde contexto externo, lo que implica que el conocimiento interno puede ser impreciso.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad.
- Licencia: Apache 2.0 en las cinco capas de la cadena, con obligacion de atribucion explicita mediante la frase "Created using Bonsai by Prism ML." El uso comercial es posible, pero debe respetar simultaneamente las condiciones de todas las capas y revisar los ficheros NOTICE y LICENSE del repositorio. El motor fork se distribuye bajo MIT.
- La informacion de la model card es en gran medida promocional ("0 Token era") y mezcla afirmaciones verificables con otras no verificables; conviene tratarla como material del autor y no como evaluacion tecnica.
- Entrada multimodal condicionada: la vision requiere descargar y cargar el proyector mmproj, lo que incrementa el consumo de VRAM y anade unos 0,59 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SuperLogic/Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion ternaria de origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Capa de ajuste de eficiencia de razonamiento: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Scripts, features.ini y cliente de linea de comandos: https://github.com/zgsndzq/ada-ternary-runtime
- Binarios precompilados para Windows: https://github.com/zgsndzq/ada-ternary/releases
- Codigo fuente del motor (fork de PrismML-Eng/llama.cpp): https://github.com/zgsndzq/ada-ternary
- Imagen de velocidad medida en GPU de portatil de 8 GB: https://cdn-uploads.huggingface.co/production/uploads/6aafcc4fc71ed6fa0c2eb60a/8GGwBjrAhAOFto6HztEpI.png
- Imagen de ejemplo de vision (disposicion de ajedrez chino): https://cdn-uploads.huggingface.co/production/uploads/6aafcc4fc71ed6fa0c2eb60a/-qSeUbT_Hyiyrv6Ev3R0O.png
- Paper o publicacion tecnica: no disponible
