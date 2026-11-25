# vanch007/Inkling-2-Mini-oQ6e-mtp

## Resumen

Inkling-2-Mini-oQ6e-mtp es una cuantizacion de precision mixta del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo mezcla de expertos (MoE) con bucles de iteracion interna, desarrollado originalmente por Thinking Machines y cuantizado por el usuario vanch007 mediante la herramienta oQ (oMLX v0.8.1). El checkpoint conserva el codigo de lenguaje, el codificador de vision y el borrador de decodificacion especulativa DSpark original, lo que permite ejecutar decodificacion especulativa acelerada en hardware Apple Silicon.

El modelo base cuenta con 26.400 millones de parametros totales, de los cuales solo 3.400 millones estan activos en cada paso (5.400 millones efectivos considerando las tres pasadas del bucle intermedio). La cuantizacion mantiene un promedio de 5,352 bits por peso para el modelo de lenguaje y el codificador de vision, y 5,477 bits por peso incluyendo el borrador DSpark, lo que reduce el peso en disco a aproximadamente 17,9 GB.

Su relevancia radica en que permite ejecutar un modelo MoE multimodal de 26B en un unico equipo con Apple Silicon y 128 GB de memoria unificada, con un rendimiento medido de 24,6 a 27,0 tokens por segundo en decodificacion de un solo flujo y un consumo de memoria de 19,18 GiB a 1K de contexto y 23,22 GiB a 16K. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con bucle intermedio (looped MoE) y decodificacion especulativa DSpark MTP |
| Parametros totales | 26.388.646.400 (26,4B) en el modelo de lenguaje; 27.024B incluyendo vision y borrador DSpark |
| Parametros activos | 3,4B por paso; 5,4B efectivos en las 3 pasadas del bucle intermedio |
| Longitud de contexto | no disponible (evaluado hasta 16K en la model card) |
| Tipos de cuantizacion | Precision mixta oQ6e: NVFP4 grupo 16, affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32; promedio 5,352 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con un mecanismo de bucle intermedio: las capas centrales se ejecutan en tres pasadas sucesivas, lo que eleva los parametros activos efectivos de 3,4B a 5,4B. La cuantizacion oQ6e preserva los expertos enrutados de las capas 0 a 19 en su formato original NVFP4 (grupo 16), convierte los expertos MXFP8 de las capas 20 a 23 a affine 6-bit (grupo 64) y eleva 58 tensores sensibles (embeddings, cabeza de vocabulario y proyecciones clave de atencion) a affine 8-bit (grupo 64) mediante calibracion imatrix oQe con 128 muestras de 512 tokens. El codificador de vision y el borrador DSpark se mantienen en BF16, mientras que el router y los controladores del bucle permanecen en FP32.

La distribucion de almacenamiento resultante es: 20,384B de pesos en NVFP4 (76,327% del total, 10,679 GiB), 4,077B en affine 6-bit (15,265%, 3,085 GiB), 1,572B en affine 8-bit (5,887%, 1,556 GiB), 0,637B en BF16 (2,387%, 1,187 GiB) y 0,036B en FP32 (0,133%, 0,133 GiB). El checkpoint incluye el borrador de decodificacion especulativa DSpark en `mtp.safetensors`, que habilita el modo Lightning MTP de oMLX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento multimodal (entrada de imagen y texto).
- Procesamiento de imagenes mediante codificador de vision dedicado de 0,318B de parametros.
- Razonamiento multi-paso gracias al bucle intermedio de tres pasadas.
- Decodificacion especulativa mediante el borrador DSpark MTP integrado, que acelera la generacion en oMLX.
- Capacidades matematicas y de sentido comun evaluadas en los benchmarks ARC-C, CMMLU, GSM8K, MMLU-Pro y TruthfulQA.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (CMMLU sugiere evaluacion en chino, pero no se confirma el conjunto de idiomas).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Apple Silicon: el checkpoint cabe en un Mac con 128 GB de memoria unificada y permite conversaciones imagen-texto sin conexion, con un consumo de 19,18 GiB a 1K de contexto y 23,22 GiB a 16K.
- Analisis de documentos con imagenes: el codificador de vision integrado permite extraer informacion de capturas, diagramas o formularios y razonar sobre ella en texto, aprovechando el bucle de tres pasadas para tareas de varios pasos.
- Prototipado de agentes conversacionales: la ventana de contexto evaluada hasta 16K y la decodificacion especulativa DSpark permiten mantener dialogos multi-turno con latencia aceptable (24,6-27,0 tok/s) en un equipo de sobremesa.
- Evaluacion de modelos MoE en entornos de investigacion: la precision mixta documentada (NVFP4, affine 6-bit, affine 8-bit, BF16, FP32 por componente) permite estudiar el impacto de la cuantizacion selectiva en calidad y velocidad sin necesidad de GPUs de datacenter.
- Generacion de codigo asistida: el modelo base incluye capacidades de razonamiento y matematicas (evaluadas en GSM8K y MMLU-Pro), adecuadas para autocompletado y explicacion de fragmentos en entornos de desarrollo locales.
- Despliegue en pipelines de CI/CD para pruebas de regresion multimodal: al ser un checkpoint MLX ligero (17,9 GB), se puede integrar en flujos automatizados de validacion de modelos sobre hardware Apple.
- Educacion y tutoria interactiva: la combinacion de vision y razonamiento permite responder preguntas sobre imagenes de libros de texto o pizarras con contexto de hasta 16K tokens.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Suite de inteligencia de 210 preguntas (ARC-C, CMMLU, GSM8K, MMLU-Pro, TruthfulQA) | 168/210 (80,00%) |
| Memoria pico a 1K de contexto | 19,18 GiB |
| Memoria pico a 16K de contexto | 23,22 GiB |
| Decodificacion pp1024 (un solo flujo) | 24,6 tok/s |
| Decodificacion pp4096 (un solo flujo) | 27,0 tok/s |

Medido en Apple M3 Max de 128 GB con oMLX 0.8.1 y DSpark MTP activado. No se han publicado resultados desglosados por benchmark individual ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,18 GiB a 1K de contexto y 23,22 GiB a 16K de contexto (memoria pico medida).
- Tamano en disco: 17,9 GB de repositorio; 18,502 GB de pesos totales (17,232 GiB).
- GPU recomendadas: Apple Silicon con memoria unificada de al menos 32 GB (para contexto corto) y 48 GB o mas para contexto de 16K; el benchmark oficial se realizo en un M3 Max de 128 GB.
- Compatibilidad con GPU consumer NVIDIA: no disponible; el checkpoint esta en formato MLX y requiere oMLX 0.8.1 o superior.
- Opciones de despliegue: oMLX 0.8.1 o posterior con soporte Lightning MTP; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 24,6 tok/s a pp1024 y 27,0 tok/s a pp4096 en decodificacion de un solo flujo con DSpark MTP activado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ6e-mtp (este) | 26,4B (27,0B con vision y DSpark) | 3,4B (5,4B efectivos) | no disponible (evaluado a 16K) | Apache 2.0 | safetensors MLX |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B | 3,4B (5,4B efectivos) | no disponible | Apache 2.0 | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Requiere oMLX 0.8.1 o superior; no es compatible con otros runtimes de inferencia como llama.cpp, vLLM u Ollama segun la informacion disponible.
- Dependencia de hardware Apple Silicon: el formato MLX limita el despliegue a equipos con memoria unificada de Apple.
- La cuantizacion de precision mixta puede introducir degradacion en tareas sensibles; los expertos de las capas 0 a 19 se mantienen en NVFP4, lo que puede afectar a la fidelidad en dominios especializados.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la model card; el resultado de TruthfulQA dentro de la suite agregada (80,00% global) no se desglosa.
- Idiomas soportados: no disponible; la presencia de CMMLU sugiere evaluacion en chino, pero no se confirma la cobertura multilingue.
- Longitud de contexto maxima: no disponible; las mediciones solo llegan a 16K.
- Uso comercial: permitido bajo Apache 2.0, incluyendo modificacion y redistribucion, con las obligaciones habituales de atribucion y aviso de licencia.
- El modelo tiene 0 likes y 156 descargas en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/vanch007/Inkling-2-Mini-oQ6e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
