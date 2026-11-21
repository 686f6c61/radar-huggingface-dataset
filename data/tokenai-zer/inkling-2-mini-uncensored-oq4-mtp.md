# TokenAI-zer/Inkling-2-Mini-Uncensored-oQ4-mtp

## Resumen

Inkling-2-Mini-Uncensored-oQ4-mtp es una cuantizacion no oficial en formato oMLX (oQ4) del modelo OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez es una version "abliterated" (sin rechazos) de Thinking Machines' Inkling 2 Mini. El trabajo lo publica el usuario TokenAI-zer y esta pensado especificamente para Apple Silicon, empleando la libreria MLX en lugar de PyTorch o GGUF. Incluye el codificador de vision y el borrador DSpark (`mtp.safetensors`) que oMLX Lightning MTP utiliza para decodificacion especulativa.

El modelo subyacente es un MoE multimodal con arquitectura "looped" (Inkling2LoopForConditionalGeneration): 24 capas, tamano oculto 2304, 128 expertos enrutados con top-8, 26.389B parametros totales y 3.4B activos. Acepta entrada de texto e imagen y declara en su config una longitud de contexto de hasta 1.048.576 tokens, aunque el contexto usable depende de la memoria disponible. La cuantizacion oQ4 reduce el directorio completo a 15.71 GiB (16.87 GB) con 4.915 bits efectivos por peso en el modelo de lenguaje y la vision.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un MoE con capas recurrentes, cuantizacion mixta que preserva los expertos NVFP4 originales sin recodificarlos, y decodificacion especulativa integrada mediante un borrador DSpark. Todo ello empaquetado para ejecucion local en hardware Apple Silicon, lo que permite desplegar un modelo de 26B en un Mac de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2LoopForConditionalGeneration (MoE con capas recurrentes, multimodal texto-imagen) |
| Parametros totales | 26.389B |
| Parametros activos | 3.4B |
| Longitud de contexto | 1.048.576 tokens en config; usable segun memoria disponible |
| Tipos de cuantizacion | oQ4 (expertos de capas 20-23 en affine 4-bit grupo 64; expertos NVFP4 de capas 0-19 sin cambios; atencion, embedding y cabeza de vocabulario en affine 8-bit grupo 64; vision y borrador en BF16; router y controladores de bucle en FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (4 fragmentos de 15.10 GiB + `mtp.safetensors` de 0.59 GiB) |
| Bits efectivos por peso | 4.915 (LM + vision); 5.047 incluyendo el borrador DSpark |
| Tamano del directorio | 15.71 GiB (16.87 GB) |
| Capas | 24 (capas 6 a 17 se ejecutan 3 veces por token) |
| Tamano oculto | 2304 |
| Expertos | 128 enrutados, top-8 |
| Borrador MTP (DSpark) | 3 capas, 54 tensores, BF16 |
| Libreria requerida | oMLX 0.8.1 o superior (build realizada con 0.8.2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con un esquema de repeticion de capas ("looped"): las capas 6 a 17 se ejecutan tres veces por cada token, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. El modelo cuenta con 128 expertos enrutados y activa los 8 principales por token, lo que resulta en 3.4B parametros activos sobre un total de 26.389B. Incluye un codificador de vision de 0.318B parametros y un borrador de decodificacion especulativa DSpark de otros 0.318B.

Thinking Machines libero Inkling 2 Mini con sus expertos ya cuantizados en origen: NVFP4 en las capas 0 a 19 y MXFP8 en las capas 20 a 23. La cuantizacion oQ4 de esta ficha respeta esa decision: los expertos NVFP4 no se recodifican en ningun nivel, de modo que no se anade error de cuantizacion adicional sobre ellos. Solo los expertos MXFP8 de las capas 20 a 23 se recuantizan a affine 4-bit. La atencion, el embedding y la cabeza de vocabulario se almacenan en affine 8-bit con grupo 64, mientras que el router y los controladores de bucle permanecen en FP32 para preservar la precision del enrutamiento.

Sobre el entrenamiento original no se proporcionan datos en la informacion disponible: no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La variante Uncensored se obtuvo mediante ablacion direccional aplicada unicamente a las 20 proyecciones de salida de atencion en BF16 (`attn.wo_ud`, capas 4 a 23); los expertos, el codificador de vision y el borrador DSpark son identicos byte a byte al modelo original. La innovacion tecnica destacable de este empaquetado es la integracion del borrador DSpark para decodificacion especulativa mediante oMLX Lightning MTP.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo chat y modo thinking.
- Procesamiento de entrada de imagen junto con texto (pipeline image-text-to-text).
- Generacion de codigo, segun el ejemplo de prompt de codificacion citado en la model card.
- Decodificacion especulativa integrada mediante el borrador DSpark (MTP), con tasas de aceptacion de borradores en torno al 71% en la prueba citada.
- Contexto largo de hasta 1.048.576 tokens declarado en config, sujeto a la memoria disponible.
- Comportamiento sin rechazos ("uncensored") tras la ablacion direccional, con 0 de 32 rechazos reportados en prompts daninos en modo chat y thinking segun la model card del modelo base.
- Soporte multilingue limitado al ingles.
- No se dispone de informacion sobre soporte de tool calling, function calling ni capacidades de agente multi-paso en la documentacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el peso de 15.71 GiB permiten ejecutar un MoE de 26B en Macs con memoria unificada amplia, usando oMLX 0.8.1 o superior como runtime.
- Asistencia de codigo en local: la prueba de velocidad citada usa un prompt de codificacion de 41 tokens con `reasoning_effort: low`, lo que sugiere su uso en tareas de generacion de codigo de baja latencia sobre hardware Apple.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede emplearse para extraer o describir contenido de capturas, diagramas o documentos escaneados junto a instrucciones textuales.
- Analisis de contexto largo: con hasta 1.048.576 tokens declarados, es adecuado para resumir o consultar corpus extensos, siempre que la memoria del equipo lo permita.
- Experimentacion en investigacion sobre alineacion y rechazos: al ser una variante abliterated, sirve para estudiar el comportamiento del modelo sin capas de rechazo, comparandolo con el original no abliterated disponible en mlx-community.
- Despliegue con decodificacion especulativa: el borrador DSpark incluido permite activar Lightning MTP en oMLX para acelerar la generacion, util en entornos interactivos donde la latencia importa.
- Evaluacion de tecnicas de cuantizacion mixta: la preservacion de expertos NVFP4 frente a la recuantizacion de MXFP8 lo convierte en un caso practico para medir el impacto de distintas estrategias de cuantizacion sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para esta cuantizacion en la informacion disponible. La model card indica explicitamente que estas variantes no tienen resultados de benchmark posteriores a la cuantizacion.

Los unicos datos de rendimiento disponibles son de velocidad y proceden de una unica prueba corta:

| Metrica | oQ4-mtp | oQ6-mtp | oQ8-mtp |
|---|---|---|---|
| Directorio del modelo | 15.71 GiB (16.87 GB) | 16.66 GiB (17.89 GB) | 17.49 GiB (18.78 GB) |
| Bits efectivos por peso (LM + vision) | 4.915 | 5.224 | 5.494 |
| Velocidad de decodificacion* | 65.8 tok/s | 62.8 tok/s | 61.7 tok/s |

\* Medida una sola vez en un Apple M5 Max (128 GB) con oMLX 0.8.2, Lightning MTP (DSpark) activado, un prompt de codificacion de 41 tokens y entre 300 y 570 tokens generados con `reasoning_effort: low`, con aproximadamente el 71% de tokens borrador aceptados. No es un benchmark: la velocidad varia con la longitud de contexto, el prompt y la aceptacion del borrador.

Como referencia del modelo base, la model card de OpenUncensored reporta MMLU de 78.95% a 79.47% tras la ablacion, aunque no se especifica la version exacta del checkpoint ni el protocolo de evaluacion.

## Requisitos de hardware

- El formato es MLX safetensors y requiere oMLX 0.8.1 o superior; no es compatible con llama.cpp, Ollama, vLLM ni TGI en su forma actual.
- Memoria necesaria: el directorio completo ocupa 15.71 GiB (16.87 GB), por lo que se recomienda un Mac con memoria unificada de al menos 32 GB para dejar margen al contexto y a la cache KV; la prueba citada se realizo en un equipo de 128 GB.
- Hardware validado en la documentacion: Apple M5 Max con 128 GB, donde se midieron 65.8 tok/s con oQ4 y decodificacion especulativa activada.
- No esta pensado para GPU NVIDIA (A100, H100, RTX 4090) ni para hardware CUDA, dado que el runtime es MLX.
- Opciones de despliegue: oMLX con Lightning MTP (DSpark) para decodificacion especulativa; el borrador `mtp.safetensors` se incluye en el repositorio.
- Latencia y throughput: unica medicion disponible de 65.8 tok/s en las condiciones descritas; no hay datos de latencia de primer token ni de throughput con contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-oQ4-mtp (esta ficha) | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | MLX safetensors, oQ4 | apache-2.0 | Incluye vision y borrador DSpark; 65.8 tok/s en M5 Max |
| Inkling-2-Mini-Uncensored-oQ6-mtp | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | MLX safetensors, oQ6 | apache-2.0 | Mayor fidelidad al checkpoint fuente; 62.8 tok/s |
| Inkling-2-Mini-Uncensored-oQ8-mtp | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | MLX safetensors, oQ8 | apache-2.0 | Expertos MXFP8 sin recuantizar; 61.7 tok/s |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | Safetensors (NVFP4/MXFP8/BF16) | apache-2.0 | Checkpoint fuente sin cuantizar para MLX |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | MLX safetensors, oQ4e | no disponible | Version original no abliterated |
| Abiray/Inkling-2-Mini-Uncensored-GGUF | 26.389B totales, 3.4B activos | 1.048.576 tokens en config | GGUF | no disponible | Misma ablacion en formato GGUF para llama.cpp |

## Limitaciones y advertencias

- Modelo "uncensored" obtenido por ablacion direccional: no aplica capas de rechazo, lo que implica riesgo de generar contenido danino, sesgado o inapropiado sin filtros. No es adecuado para despliegues orientados al publico sin moderacion externa.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No se han publicado benchmarks de calidad tras la cuantizacion, por lo que el impacto de oQ4 sobre el rendimiento real del modelo es desconocido.
- La cuantizacion es lossy por definicion; aunque los expertos NVFP4 se preservan intactos, los expertos MXFP8 de las capas 20 a 23 se recuantizan a affine 4-bit, lo que introduce error en aproximadamente el 15% de los pesos.
- El contexto de 1.048.576 tokens es un limite de configuracion; el contexto usable real depende de la memoria disponible y no se han publicado pruebas de rendimiento con contextos largos.
- Requiere hardware Apple Silicon y oMLX 0.8.1 o superior; no funciona con runtimes CUDA ni con llama.cpp u Ollama en este formato.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- La licencia apache-2.0 se aplica a esta cuantizacion, pero la model card remite a la seccion de licencia y atribucion del autor para los derechos del modelo base y de la ablacion; conviene verificar las condiciones del checkpoint original antes de un uso comercial.
- El autor declara no estar afiliado a Thinking Machines ni a OpenUncensored.
- La velocidad de 65.8 tok/s procede de una unica ejecucion corta y no debe tomarse como referencia estable de throughput.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ4-mtp
- Variante oQ6: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ6-mtp
- Variante oQ8: https://huggingface.co/TokenAI-zer/Inkling-2-Mini-Uncensored-oQ8-mtp
- Checkpoint fuente (OpenUncensored): https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Version original no abliterated en oMLX: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- GGUF de la misma ablacion: https://huggingface.co/Abiray/Inkling-2-Mini-Uncensored-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
