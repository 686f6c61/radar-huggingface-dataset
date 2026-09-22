# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 es un artefacto de inferencia en un unico fichero (`.ninfer`) generado por el usuario wallawalla47 a partir del checkpoint `nvidia/Qwen3.8-27B-NVFP4`, que a su vez es una version cuantizada en formato mixto NVFP4/FP8 del modelo multimodal de la familia Qwen3.5. No se trata de un modelo nuevo ni de un reentrenamiento: es un reempaquetado orientado al motor NInfer V3, pensado para cargarse directamente con `ninfer-serve` en una GPU NVIDIA RTX 5090 (sm_120a) sin paso de conversion en tiempo de carga.

El modelo subyacente tiene aproximadamente 27 000 millones de parametros, una columna vertebral hibrida de 64 capas que combina atencion lineal Gated Delta-Net con atencion completa cada cuatro capas, un tamano oculto de 5120, un vocabulario de 248 320 tokens y un contexto nativo de 262 144 tokens. Incluye una torre de vision de 27 capas (entrada de imagen y video), un companero MTP para decodificacion especulativa, un modelo borrador DFlash2 de 5 capas con atencion deslizante y una cabeza de propuesta indexada de 131 072 filas.

Su relevancia practica es doble: por un lado, demuestra un flujo de cuantizacion W4A4 (pesos y activaciones en FP4) funcional sobre hardware Blackwell en un unico fichero autocontenido; por otro, documenta con detalle inusual que los 128 objetos NVFP4 de las proyecciones MLP y los 128 objetos FP8 de atencion y GDN se importan bit a bit desde el checkpoint original, de modo que la calidad del modelo base se preserva por construccion salvo en dos tensores requantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de la familia Qwen3.5: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; torre de vision `qwen3_5_vision` de 27 capas; companero MTP de Qwen3.5 |
| Parametros totales | ~27 000 millones segun el nombre del modelo (la model card no desglosa el recuento real) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens nativos; el ejemplo de ejecucion arranca con `--max-context 240000` |
| Tipos de cuantizacion | NVFP4 (128 objetos), FP8 e4m3fn con escalas por fila (130 objetos), Q4 (55), Q5 (54), Q8 (28), Q6 (1), BF16 (579), FP32 (96); computo de activaciones W4A4 en las capas NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | artefacto unico `.ninfer` (motor NInfer V3); el modelo base usa `compressed-tensors` con NVFP4/FP8 mixto |
| Tamano oculto | 5120 |
| Vocabulario | 248 320 tokens |
| Objetos de peso preparados | 1072 (incluye 1 tabla de indices de propuesta en INT32) |
| Compatibilidad de hardware | NVIDIA Blackwell sm_120a (probado en RTX 5090) |

## Arquitectura y entrenamiento

La columna vertebral de texto es un transformer hibrido de 64 capas en el que la atencion lineal Gated Delta-Net sustituye a la atencion completa en tres de cada cuatro capas, reservando la atencion completa para cada cuarta capa. Esta combinacion reduce el coste del contexto largo, que aqui llega a 262 144 tokens nativos. Sobre esa base se anaden tres componentes: una torre de vision de 27 capas para entrada de imagen y video, un companero MTP (multi-token prediction) para decodificacion especulativa, y el modelo borrador DFlash2 de 5 capas con atencion deslizante (ventana 2048, rango de selector 256, top-16) que alimenta la ruta `--spec dflash2`.

No hay informacion sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO) en el material proporcionado; esta ficha cubre un artefacto de cuantizacion, no un entrenamiento. Lo que si se documenta con precision es el proceso de conversion, ejecutado en CPU en unos 28 minutos con la receta `qwen3_8_27b_nvfp4_nvidia` del convertidor de NInfer V3: las proyecciones MLP (gate, up, down; 128 objetos NVFP4) se importan en su forma NVFP4 codificada y bit-exacta, con los pesos FP4 empaquetados calibrados por Hessiano local y sus escalas de bloque intactas; las proyecciones de autoatencion y de atencion lineal GDN (128 objetos FP8) tambien se importan bit a bit con sus escalas por fila E4M3. Las unicas requantizaciones son la cabeza de salida (NVFP4 a FP8 con escala `fp8_row_maxabs`, porque NInfer solo registra la proyeccion de vocabulario en Q8/Q6/FP8) y el embedding de tokens (BF16 a FP8). Las proyecciones a/b del GDN permanecen en BF16 porque su forma de 96 filas no encaja en el mosaico de 128 filas que exige el almacenamiento NVFP4 v3. La eleccion de FP8 para la cabeza se justifica con una comparacion interna: es mas rapida que Q8 en el rango de tokens de decodificacion y verificacion T=1..33, y Q8 solo gana en T=34..64.

## Capacidades

- Generacion de texto y razonamiento multimodal de tipo image-text-to-text, con torre de vision dedicada para imagen y video.
- Contexto largo nativo de 262 144 tokens, util para documentos extensos o conversaciones multi-turno muy largas.
- Modo de razonamiento explicito (etiqueta `thinking` en el repositorio) y etiqueta `reasoning`.
- Decodificacion especulativa por dos vias: el companero MTP y el borrador DFlash2 (`--spec dflash2 --draft-tokens 7`).
- Borrador por n-gramas (`--ngram-draft-tokens 15 --ngram-min-match 8`) y borrador ligero desde la cabeza de propuesta indexada (`--lm-head-draft`), orientado a cargas con mucho texto copiado o citado.
- Etiqueta `agentic` declarada por el autor; no se detalla en la model card que herramientas o protocolos soporta.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible (solo la etiqueta generica `agentic`).
- Capacidades multilingues: no disponibles; el vocabulario de 248 320 tokens sugiere cobertura amplia, pero el autor no lista idiomas.
- Inferencia con KV cache en entero de 8 bits (`--kv-dtype int8`) y concurrencia configurable (`--max-concurrency 2` en el ejemplo).

## Casos de uso

- Inferencia local multimodal en una sola GPU de gama alta: el artefacto esta pensado para ejecutarse en una RTX 5090 con unos 21 GB de VRAM residentes, lo que permite desplegar un modelo de ~27B con vision en una estacion de trabajo sin cluster.
- Analisis de documentos largos y RAG sobre corpus extensos: con 262 144 tokens de contexto nativo se pueden pasar contratos, informes o bases de codigo completas en una sola ventana, evitando troceados agresivos y la perdida de coherencia entre fragmentos.
- Descripcion y extraccion de informacion de imagenes y video: la torre de vision de 27 capas y la tuberia `image-text-to-text` permiten tareas de captioning, inspeccion visual o respuesta a preguntas sobre fotogramas.
- Servicio de baja latencia para chat o copilotos: las rutas de decodificacion especulativa (MTP, DFlash2 con 7 tokens de borrador, n-gramas con 15 tokens y coincidencia minima de 8) estan disenadas para acelerar la generacion en cargas interactivas.
- Procesamiento de cargas dominadas por copia de contexto: la cabeza de propuesta indexada de 131 072 filas permite generar propuestas baratas cuando la salida reutiliza texto de la entrada, un patron habitual en resumen extractivo, edicion o citado.
- Razonamiento multi-paso asistido por modo thinking: para tareas de analisis que requieren cadena de razonamiento antes de responder, el modo de pensamiento explicito resulta adecuado en entornos donde la latencia no es critica.
- Despliegue en entornos con requisitos de licencia permisiva: al publicarse bajo apache-2.0, el artefacto puede integrarse en productos comerciales, siempre que se verifiquen las licencias del modelo base y de los componentes injertados.
- Evaluacion y comparacion de kernels W4A4 NVFP4 en Blackwell: el repositorio incluye el informe de conversion por tensor (`qwen3_8_27b_nvfp4-nvidia.ninfer.conversion.json`), lo que lo convierte en material util para estudiar el impacto de la cuantizacion mixta sobre un checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validacion externa. El unico dato de rendimiento aportado es interno y cualitativo: la cabeza de salida en FP8 es mas rapida que en Q8 en el rango de tokens T=1..33 que usa el motor, mientras que Q8 solo es superior en T=34..64.

## Requisitos de hardware

- VRAM estimada: unos 21 GB residentes en el ejemplo oficial del autor, con contexto maximo configurado a 240 000 tokens, KV cache int8 y concurrencia 2.
- GPU recomendada: NVIDIA RTX 5090 o equivalente de clase 5090 con soporte sm_120a (Blackwell). Los kernels NVFP4 W4A4 y FP8 requieren dicha arquitectura.
- No se documenta soporte para otras GPU. Aunque el consumo de 21 GB cabria en el papel en tarjetas de 24 GB de generaciones anteriores (RTX 3090, RTX 4090), no hay ninguna indicacion de que el artefacto pueda ejecutarse fuera de sm_120a.
- No cabe en GPU de consumo con menos de 21 GB de memoria para esta configuracion de contexto y concurrencia.
- Opciones de despliegue: exclusivamente el motor NInfer V3 mediante `ninfer-serve` (build del fork `Wallawalla47/ninfer-custom`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.ninfer`.
- Parametros de ejecucion documentados: `--host 127.0.0.1 --port 8080 --max-context 240000 --max-concurrency 2 --spec dflash2 --draft-tokens 7 --lm-head-draft --ngram-draft-tokens 15 --ngram-min-match 8 --kv-dtype int8`.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

Los unicos datos verificables son la relacion con el checkpoint del que deriva. No hay informacion sobre alternativas comparables (mismo tamano o misma tarea) en el material proporcionado.

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | ~27B (segun nombre) | 262 144 nativo | Fichero unico `.ninfer` (NInfer V3); mezcla NVFP4/FP8/Q4-Q8/BF16/FP32 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| nvidia/Qwen3.8-27B-NVFP4 (modelo base) | no disponible (nombre de 27B) | no disponible en la informacion | `compressed-tensors` NVFP4/FP8 mixto | no disponible en la informacion | HuggingFace (referenciado como base) |
| Alternativas de terceros de tamano o tarea comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias relevantes frente a su base: el artefacto anade los componentes de decodificacion especulativa (borrador DFlash2 e indice de propuestas), requantiza la cabeza de salida de NVFP4 a FP8 y el embedding de BF16 a FP8, y normaliza los recursos de tokenizer porque los del checkpoint de NVIDIA omitian `added_tokens_decoder` y el patron Split que exige el tokenizer en C++.

## Limitaciones y advertencias

- Artefacto derivado de terceros: no es un modelo oficial de NVIDIA ni de Qwen, y no cuenta con validacion de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Ausencia total de benchmarks publicados, tanto en la model card como en el repositorio, lo que impide verificar la degradacion real frente al checkpoint original.
- Aunque las proyecciones MLP NVFP4 y las de atencion/GDN FP8 se importan bit a bit, la cabeza de salida y el embedding si se requantizan, por lo que existen desviaciones numericas respecto al checkpoint de NVIDIA en esos dos tensores.
- Dependencia absoluta del fork NInfer V3: sin ese motor concreto el fichero `.ninfer` no es utilizable, y no es portable a vLLM, llama.cpp, Ollama o TGI.
- Requisito estricto de hardware Blackwell sm_120a; no hay indicios de que funcione en GPU anteriores.
- Sesgos conocidos: no documentados. No hay informacion sobre composicion de datos, filtrado ni evaluaciones de sesgo.
- Riesgo de alucinacion: no documentado especificamente, pero es un riesgo inherente a los modelos generativos de este tamano; la ausencia de evaluaciones agrava la incertidumbre.
- Limitaciones de idioma: el autor no declara idiomas soportados, por lo que no puede asumirse cobertura multilingue verificada pese al vocabulario de 248 320 tokens.
- Limite practico de contexto: el contexto nativo es de 262 144 tokens, pero el ejemplo de despliegue lo recorta a 240 000 y usa KV cache int8, lo que puede afectar a la fidelidad en ventanas muy largas.
- Licencia: el artefacto se publica bajo apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base y la del borrador DFlash2 injertado, cuyo origen y licencia no se detallan en la model card.
- No esta pensado para reentrenamiento ni ajuste fino: es un artefacto de inferencia cuantizado.
- La model card esta incompleta en la informacion disponible (el bloque de instrucciones se corta a mitad), por lo que podrian existir requisitos o avisos adicionales no recogidos aqui.
- Las fechas de creacion y actualizacion del repositorio son de septiembre de 2026, posteriores a la fecha habitual de referencia; no se ha podido contrastar la trazabilidad del artefacto.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Fork del motor NInfer V3: https://github.com/Wallawalla47/ninfer-custom
- Recetas oficiales de conversion (incluye `qwen3_8_27b_nvfp4_nvidia`): https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/official_recipes.py
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a paginas corporativas sin relacion con el artefacto.
