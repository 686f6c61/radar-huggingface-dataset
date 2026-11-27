# Xylolabs/gemma-4-31B-it-MLX-8bit

## Resumen

Xylolabs/gemma-4-31B-it-MLX-8bit es una conversion al framework MLX de Apple del modelo google/gemma-4-31B-it, cuantizada a 8 bits mediante cuantizacion afin con tamano de grupo 64. La publica Xylolabs, un tercero independiente respecto a Google, y su proposito es permitir la ejecucion local del modelo Gemma 4 de 31 mil millones de parametros en hardware Apple Silicon (familias M5 Max y M5 Ultra) usando la libreria mlx-lm, sin depender de CUDA ni de GPUs dedicadas.

El modelo base es un transformer decoder-only de aproximadamente 30,7 mil millones de parametros (30.697.345.280 segun los pesos en safetensors). Esta version es exclusivamente de texto: el autor elimina explicitamente la torre de vision del modelo original, por lo que no procesa imagenes. La cuantizacion afecta a todas las capas lineales y al embedding de tokens (incluida la LM head), mientras que las capas de normalizacion y el resto de tensores no cuantizados se mantienen en bfloat16.

Su relevancia es practica: ofrece una ruta de despliegue local de un modelo de 31B con una fidelidad muy alta respecto al BF16 de referencia (KL de 0,003032 y 98,36 % de acuerdo top-1 sobre texto con plantilla de chat), con un peso en disco de 32,62 GB. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4; detalles de atencion no disponibles) |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens maximo segun la tabla de hardware del autor (depende de memoria disponible) |
| Tipos de cuantizacion | 8 bits affine, group size 64, scales y biases en bfloat16 (existe tambien una variante 4-bit del mismo autor) |
| Idiomas soportados | no disponible (la evaluacion de fidelidad usa conversaciones en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx-lm 0.32.2 |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-31B-it, un transformer decoder-only de la familia Gemma 4 de Google, ajustado para instrucciones (sufijo "it"). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas por Google. Tampoco se detalla el esquema de atencion ni posibles innovaciones como atencion lineal o decodificacion especulativa.

La aportacion de Xylolabs es la conversion y cuantizacion: pesos portados a MLX con cuantizacion afin de 8 bits, grupo de 64, escalas y sesgos en bfloat16, aplicada a todas las capas lineales y al embedding de tokens, incluida la LM head. Las normalizaciones y tensores no cuantizados permanecen en bfloat16. La torre de vision del modelo original se omite por completo, de modo que esta variante es solo de texto. El autor documenta la fidelidad de la cuantizacion mediante divergencia KL y acuerdo top-1 frente al modelo BF16 sin cuantizar de MLX.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat, segun el pipeline text-generation y la evaluacion con conversaciones.
- Razonamiento y respuesta a preguntas: la comprobacion de 7 preguntas da 7/7 aciertos, igual que el BF16 de referencia.
- Capacidades multilingues: la evaluacion incluye conversaciones en ingles y coreano; el listado oficial de idiomas no esta disponible.
- Procesamiento de imagenes: no soportado en esta variante (torre de vision eliminada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac Apple Silicon: ejecutar un modelo de 31B en un Mac Studio M5 Max o M5 Ultra con 64 GB o mas de memoria unificada mediante mlx-lm, sin GPU dedicada. El autor documenta contextos de hasta 256K tokens en configuraciones de 96 GB o superiores.
- Asistente conversacional de escritorio: usar mlx_lm.chat para prototipar un asistente privado que no envia datos a la nube, aprovechando que los pesos (32,62 GB) caben en memoria unificada de equipos de gama alta.
- Procesamiento de documentos largos: con ventanas de hasta 149K-256K tokens segun el hardware, resumir o extraer informacion de contratos, informes o bases de codigo extensas en un solo paso.
- Desarrollo y depuracion sin conexion: entornos con requisitos de confidencialidad o sin acceso a APIs externas, donde el modelo se ejecuta integramente en local.
- Evaluacion comparativa de cuantizaciones: emplear la pareja 4-bit (17,97 GB) y 8-bit (32,62 GB) del mismo autor para medir el impacto de la cuantizacion en tareas propias, usando las metricas KL y top-1 publicadas como referencia.
- Generacion de texto y codigo asistida en flujos de trabajo de macOS: integrar mlx-lm en scripts o herramientas internas para redaccion tecnica, resumen y generacion de codigo, con la fidelidad de 8 bits frente a BF16.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion (no benchmarks de tareas estandar como MMLU o HumanEval):

| Metrica | MLX 8-bit | MLX 4-bit | Referencia BF16 |
|---|---|---|---|
| Tamano | 32,62 GB | 17,97 GB | no disponible |
| KL con plantilla de chat | 0,003032 | 0,090060 | 0 (referencia) |
| Acuerdo top-1 | 98,36 % | 90,52 % | 100 % |
| Comprobacion de 7 preguntas | 7/7 | 7/7 | 7/7 |

La evaluacion se realiza frente al modelo BF16 sin cuantizar de MLX, sobre texto con plantilla de chat (4 conversaciones en ingles y 4 en coreano, 8 x 1006 tokens puntuados). El autor advierte que el BF16 de llama.cpp difiere del de MLX con una KL de 0,16 a 0,27 en texto sin formato, por lo que las comparaciones entre stacks no son directas. En texto sin formato (WikiText-2 y texto retenido) la KL es mucho mayor en todos los stacks, incluido Q8_0 de llama.cpp.

No se han publicado resultados de benchmarks de tareas (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 32,62 GB para los pesos en 8 bits; la variante 4-bit ocupa 17,97 GB.
- Hardware objetivo: Apple Silicon con memoria unificada. Segun la tabla del autor:
  - Mac Studio M5 Max 40-core GPU, 64 GB: 8-bit con contexto de 149K.
  - Mac Studio M5 Ultra, 96 GB: 8-bit con contexto de 256K.
  - Mac Studio M5 Max 40-core GPU, 128 GB: 8-bit con contexto de 256K.
  - Mac Studio M5 Ultra, 256 GB y M5 Ultra 80-core GPU, 512 GB: 8-bit con contexto de 256K.
  - Mac Studio M5 Max 32-core GPU, 36 GB: requiere la variante 4-bit (contexto de 73K).
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable; el formato MLX esta pensado para Apple Silicon.
- Despliegue: mlx-lm 0.32.2 (comandos mlx_lm.generate y mlx_lm.chat). vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato segun la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|
| Xylolabs/gemma-4-31B-it-MLX-8bit | 30,7B | hasta 256K | MLX 8-bit, Apple Silicon | Apache 2.0 |
| Xylolabs/gemma-4-31B-it-MLX-4bit | 30,7B | hasta 181K segun hardware | MLX 4-bit, Apple Silicon | Apache 2.0 (segun el autor) |
| google/gemma-4-31B-it (base) | 30,7B | no disponible | BF16, multimodal (incluye vision) | Apache 2.0 (segun este repo) |

La variante 4-bit del mismo autor es la alternativa directa cuando la memoria es limitada (17,97 GB frente a 32,62 GB), a costa de una fidelidad notablemente menor (KL 0,090060 y top-1 90,52 % frente a 0,003032 y 98,36 %). El modelo base de Google conserva la torre de vision y los pesos sin cuantizar, pero requiere mas memoria y no esta empaquetado para MLX. No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con otras familias de modelos del mismo tamano.

## Limitaciones y advertencias

- Solo texto: la torre de vision se ha eliminado, por lo que no procesa imagenes aunque el modelo base sea multimodal.
- Fidelidad en texto sin formato: el autor advierte que en texto sin plantilla de chat (WikiText-2 y texto retenido) la KL es mucho mayor que en conversaciones, lo que puede degradar la generacion de texto libre o continuaciones largas.
- Contexto dependiente del hardware: los 256K tokens solo se alcanzan con 96 GB o mas de memoria unificada; con 64 GB el limite documentado es 149K y con 36 GB hay que usar la variante 4-bit (73K).
- Riesgo de alucinacion: no se documenta en la informacion proporcionada; es un riesgo generico de los modelos de lenguaje y debe mitigarse con verificacion en produccion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Idiomas: el listado oficial no esta disponible; la evaluacion solo cubre ingles y coreano, por lo que el rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0 segun el repositorio, con aviso (NOTICE) sobre la conversion y cuantizacion realizadas por Xylolabs; conviene revisar las condiciones del modelo base de Google antes de un uso comercial.
- Ecosistema restringido: depende de mlx-lm 0.32.2 y de hardware Apple Silicon; no es desplegable en vLLM, llama.cpp, Ollama ni TGI.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; primera release del 27 de noviembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-MLX-8bit
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Variante 4-bit del mismo autor: https://huggingface.co/Xylolabs/gemma-4-31B-it-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (assets y herramienta de cuantizacion): https://github.com/XylolabsInc/tensix-bfp-gptq
