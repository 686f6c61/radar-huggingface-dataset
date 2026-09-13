# toxicdog/gpt-oss-20b-MXFP4-Q8

## Resumen

`toxicdog/gpt-oss-20b-MXFP4-Q8` es una conversion del modelo abierto `openai/gpt-oss-20b` al formato MLX, cuantizada en precision mixta MXFP4 (4 bits) y Q8 (8 bits), pensada para ejecucion local en hardware Apple Silicon. El modelo base, desarrollado por OpenAI, es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 21.000 millones de parametros totales y unos 3.600 millones activos por token, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio lo publica el usuario `toxicdog` y, segun los metadatos disponibles, es una re-subida directa de la conversion oficial de `mlx-community/gpt-oss-20b-MXFP4-Q8` (generada con `mlx-lm` 0.27.0). Es relevante para desarrolladores que quieran desplegar gpt-oss-20b en un Mac con memoria unificada sin depender de CUDA: el repositorio ocupa 12,1 GB y los pesos safetensors suman 20.914.755.648 parametros.

La adopcion del repositorio es practicamente nula (0 descargas y 2 likes en el momento de la consulta), y conviene tener en cuenta que la model card copiada describe la conversion de `mlx-community` y no este repositorio en concreto. Para produccion seria mas recomendable acudir a la fuente original o a la conversion oficial de `mlx-community`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) del modelo base; conversion/cuantizacion MLX |
| Parametros totales | 20.914.755.648 (aproximadamente 20,9 B) |
| Parametros activos | Aproximadamente 3,6 B por token (dato del modelo base `openai/gpt-oss-20b`) |
| Longitud de contexto | 128.000 tokens (dato del modelo base) |
| Tipos de cuantizacion | Precision mixta MXFP4 (4 bits) + Q8 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Libreria | mlx (conversion realizada con mlx-lm 0.27.0) |
| Tamano del repositorio | 12,1 GB |
| Modelo base | openai/gpt-oss-20b |

## Arquitectura y entrenamiento

El modelo subyacente es `openai/gpt-oss-20b`, un transformer con capas de mezcla de expertos (MoE). Segun la documentacion publica del modelo base, dispone de unos 21.000 millones de parametros totales de los cuales solo se activan aproximadamente 3.600 millones por token, lo que reduce el coste de inferencia frente a un modelo denso de tamano equivalente. Emplea el formato de chat "harmony" propietario de la familia gpt-oss y admite distintos niveles de esfuerzo de razonamiento (bajo, medio y alto).

Este repositorio concreto no reentrena ni modifica el modelo: se limita a convertir y cuantizar los pesos originales al formato MLX. La cuantizacion MXFP4 esta integrada de forma nativa en la publicacion de OpenAI para los pesos de los expertos del MoE, mientras que el sufijo `Q8` de este repositorio indica que parte de los pesos se almacenan a 8 bits. No se dispone de informacion detallada en la documentacion proporcionada sobre la composicion exacta del dataset de entrenamiento, el numero de tokens vistos ni las etapas de RLHF/DPO del modelo base; estos datos no estan incluidos en la model card de este repositorio.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline declarado: text-generation).
- Razonamiento multi-paso con niveles de esfuerzo configurables (el modelo base soporta modo de razonamiento ajustable).
- Generacion y comprension de codigo, incluyendo tareas de programacion y depuracion.
- Razonamiento matematico y resolucion de problemas de tipo cadena de pensamiento.
- Soporte de tool calling / function calling, segun las capacidades del modelo base gpt-oss.
- Flujos agenticos y razonamiento multi-paso con llamadas a herramientas encadenadas.
- Formato de chat harmony (aplicable via `tokenizer.apply_chat_template` en MLX).
- Capacidades multilingues: no disponibles como dato explicito en la informacion proporcionada (los tags del repositorio no enumeran idiomas).
- No se documentan capacidades de vision ni de audio para este modelo.

## Casos de uso

- Inferencia local en Mac: cargar el modelo con `mlx-lm` sobre un equipo Apple Silicon con memoria unificada suficiente para ejecutar generacion de texto y chat sin GPU dedicada ni conexion a la nube.
- Asistentes conversacionales privados: al ejecutarse en local, los datos no salen del equipo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Generacion de codigo en el puesto de trabajo: integrable en editores o scripts locales mediante la API de `mlx-lm` para autocompletado, refactorizacion o explicacion de fragmentos.
- Pipelines agenticos con tool calling: el modelo puede encadenar llamadas a funciones en flujos multi-paso, util para automatizar tareas de orquestacion dentro de una maquina de desarrollo.
- Procesamiento de documentos largos: con una ventana de contexto de 128k tokens (heredada del modelo base), permite resumir o consultar documentos extensos sin trocear en exceso.
- Prototipado e investigacion: sirve como banco de pruebas para evaluar el rendimiento de un MoE de 21B cuantizado en MLX antes de invertir en infraestructura de servidor.
- Educacion y experimentacion: al ser Apache 2.0 y ejecutable en portatiles, es apto para docencia y proyectos academicos con recursos limitados.
- Backend de servicio local: `mlx-lm` incluye un servidor compatible con la API de OpenAI, lo que permite exponer el modelo a aplicaciones existentes en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones y la busqueda web realizada no ha devuelto resultados relevantes (los enlaces obtenidos no guardan relacion con el modelo). El modelo base `openai/gpt-oss-20b` publica evaluaciones propias en su model card oficial, pero no se reproducen aqui porque no forman parte de la informacion proporcionada para esta ficha.

## Requisitos de hardware

- El formato MLX es especifico de Apple Silicon; no es ejecutable directamente en GPUs NVIDIA o AMD sin conversion previa.
- Los pesos ocupan 12,1 GB, por lo que se recomienda un Mac con al menos 24-32 GB de memoria unificada para dejar margen a la cache KV y a las activaciones.
- En equipos de 16 GB de memoria unificada la carga puede ser posible, pero el contexto util quedara muy limitado por el consumo de la cache KV.
- Chips recomendados: Apple M2 Pro/Max, M3 Pro/Max, M4 Pro/Max o superiores, y Mac Studio con M2 Ultra o M3 Ultra.
- Cabe en GPU de consumo del ecosistema Apple; para CUDA seria necesario reconvertir (el tag `vllm` sugiere compatibilidad MXFP4 en vLLM sobre ciertas GPUs, pero no se detalla en la informacion disponible).
- Despliegue: `mlx-lm` (libreria nativa, con servidor compatible con la API de OpenAI). Ollama y llama.cpp no consumen pesos MLX directamente y requeririan conversion a GGUF.
- VRAM estimada en CUDA: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toxicdog/gpt-oss-20b-MXFP4-Q8 | 20,9 B totales / 3,6 B activos | 128k (modelo base) | safetensors MLX | Apache 2.0 | Repositorio de terceros, 0 descargas |
| mlx-community/gpt-oss-20b-MXFP4-Q8 | 20,9 B totales / 3,6 B activos | 128k (modelo base) | safetensors MLX | Apache 2.0 | Conversion oficial de la comunidad MLX |
| openai/gpt-oss-20b | 21 B totales / 3,6 B activos | 128k | safetensors (MXFP4 + bf16) | Apache 2.0 | Modelo original de OpenAI |
| openai/gpt-oss-120b | 117 B totales / 5,1 B activos | 128k | safetensors (MXFP4 + bf16) | Apache 2.0 | Modelo original de OpenAI, mayor requisito de memoria |

La diferencia principal entre las tres primeras filas es el canal de publicacion y el empaquetado, no la arquitectura. `gpt-oss-120b` se incluye como referencia de la misma familia, con mas parametros totales pero sin datos comparativos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4/8 bits introduce perdida de precision respecto al modelo base en bf16; puede degradar tareas sensibles como matematicas o razonamiento de varios pasos.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; no debe usarse como fuente de verdad sin verificacion.
- La lista de idiomas soportados no esta documentada en los metadatos y no se puede confirmar el grado de cobertura multilingue.
- La model card del repositorio corresponde a la conversion de `mlx-community` y no describe explicitamente este repositorio, por lo que los detalles de la conversion deben tratarse con cautela.
- Repositorio de terceros con 0 descargas y 2 likes: no hay evidencia de mantenimiento ni de validacion por parte de la comunidad. Para produccion es preferible usar el modelo original de OpenAI o la conversion oficial de `mlx-community`.
- Formato MLX: no portable directamente a CUDA, ROCm ni a runtimes como llama.cpp u Ollama sin reconversion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion correspondientes.
- No se dispone de informacion sobre latencia, throughput ni consumo de memoria medidos para confirmar el rendimiento real en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/toxicdog/gpt-oss-20b-MXFP4-Q8
- Conversion de referencia de la comunidad MLX: https://huggingface.co/mlx-community/gpt-oss-20b-MXFP4-Q8
- Modelo base original: https://huggingface.co/openai/gpt-oss-20b
- Libreria `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con esta ficha.
