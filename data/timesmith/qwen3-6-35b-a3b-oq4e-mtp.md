# timesmith/Qwen3.6-35B-A3B-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-mtp es una cuantizacion mixta del modelo Qwen3.6-35B-A3B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje y vision con arquitectura Mixture of Experts (MoE) dispersa: 35.951.822.704 parametros totales con aproximadamente 3.000 millones activos por token, lo que lo situa en la categoria de modelos eficientes en inferencia pese a su tamano bruto. Esta version concreta ha sido producida por el usuario timesmith mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta capa a capa.

El checkpoint resultante emplea un promedio efectivo de 4,809 bits por peso, combinando bloques en 4, 5, 6 y 8 bits con grupos de 64 y 128, ademas de un 1,329% de pesos conservados en BF16. El objetivo es reducir el peso en disco y en memoria hasta unos 21,6 GB (20,128 GiB) manteniendo la mayor parte de la calidad del modelo original, algo especialmente relevante para ejecutar un MoE de 35B en hardware Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que documenta un artefacto de cuantizacion para despliegue local, no el modelo base: incluye una cabeza MTP (multi-token prediction) de 0,845B y un modulo de vision de 0,447B, lo que permite decodificacion especulativa y entrada multimodal. No obstante, el autor no ha publicado model card descriptiva, licencia ni datos de evaluacion, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (tag `qwen3_5_moe`), con modulo de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | ~3B (aproximado, segun la informacion publica del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 4-bit g64, 5-bit g128/g64, 6-bit g128/g64, 8-bit g128/g64 y BF16; promedio 4,809 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |
| Tamano del repositorio | 21,6 GB (20,128 GiB) |
| Desglose de almacenamiento | LM 34,661B / 18,828 GiB; vision 0,447B / 0,832 GiB; MTP 0,845B / 0,468 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos dispersa: de los 35,952B parametros totales solo se activan alrededor de 3B por token, lo que reduce el coste computacional de inferencia sin recortar drasticamente la capacidad representacional. El checkpoint incluye tres componentes diferenciados segun la model card del cuantizador: el modelo de lenguaje (34,661B), un codificador de vision (0,447B) que habilita entrada multimodal, y una cabeza MTP de 0,845B (multi-token prediction) pensada para decodificacion especulativa y generacion acelerada.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion. Tampoco se especifican innovaciones de atencion (lineal, sliding window, etc.) mas alla de lo implicito en la etiqueta `qwen3_5_moe`. La cuantizacion oQ aplica precision mixta: el 93,367% de los pesos logicos se almacena en 4 bits con grupo 64, mientras que una fraccion pequena (modulos sensibles como posibles capas de atencion, embeddings o cabezas) se conserva en 5, 6, 8 bits o BF16 para mitigar la perdida de calidad.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,447B, por lo que admite entrada de imagenes ademas de texto.
- Capacidades agenticas y de coding: la informacion publica del modelo base menciona "agentic coding capabilities".
- Decodificacion especulativa mediante la cabeza MTP, que permite predecir varios tokens por paso y acelerar la generacion.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta version cuantizada.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el peso de 21,6 GB permiten ejecutar un MoE de 35B en equipos con memoria unificada de 32 GB o superior, algo inviable con los pesos en BF16.
- Asistentes de codigo en estacion de trabajo: el caracter agentico del modelo base y su bajo numero de parametros activos (~3B) permiten respuestas interactivas en IDE sin depender de la nube.
- Analisis de documentos con imagenes: gracias al modulo de vision, puede procesar capturas, diagramas o PDFs renderizados junto a texto para tareas de extraccion y resumen.
- Prototipado de agentes multi-paso: la cabeza MTP acelera la generacion en bucles de razonamiento donde la latencia por token es critica.
- Experimentacion academica con cuantizacion mixta: sirve como referencia para comparar la calidad de oQ frente a otras tecnicas (GPTQ, AWQ, GGUF K-quants) sobre un mismo modelo base.
- Despliegue en entornos con memoria limitada: el promedio de 4,809 bits/peso reduce la huella aproximadamente a la mitad respecto a BF16, habilitando servidores con una sola GPU de 24 GB.
- Evaluacion comparativa de decodificacion especulativa: util para medir el impacto real de la cabeza MTP en throughput frente a la version sin MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador solo documenta la distribucion de bits y el tamano de almacenamiento, sin metricas de calidad (perplejidad, MMLU, HumanEval, GSM8K u otras) ni comparaciones con el checkpoint original.

## Requisitos de hardware

- VRAM/memoria estimada: ~21,6 GB para los pesos; se recomienda al menos 24 GB de memoria unificada o VRAM para dejar margen a KV cache y contexto.
- GPU compatibles: el formato es MLX, por lo que el objetivo principal son chips Apple (M1/M2/M3/M4 en configuraciones de 32 GB o mas). En CUDA no es directamente utilizable sin conversion.
- Consumer GPU: en el ecosistema Apple cabe en Mac Studio y MacBook Pro de gama alta con 32-64 GB; en NVIDIA requeriria conversion a otro formato (no disponible en el repo).
- Opciones de despliegue: `mlx-lm` / `mlx` (libreria declarada); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ4e-mtp (esta ficha) | 35,952B | ~3B | no disponible | no disponible | safetensors MLX 4,809 bits/peso |
| Qwen3.6-35B-A3B (original) | 35B | ~3B | no disponible | no disponible | safetensors BF16 |
| Modelos MoE densos de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni de contexto que permitan una comparacion cuantitativa con alternativas; la unica diferencia documentada es el formato y el peso en disco (21,6 GB frente a los ~72 GB que ocuparia el checkpoint en BF16).

## Limitaciones y advertencias

- La cuantizacion a 4,809 bits/peso puede degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento matematico o codigo; no hay evaluacion publicada que lo cuantifique.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Qwen3.6-35B-A3B antes de cualquier despliegue productivo.
- No se especifican idiomas soportados ni longitud de contexto, datos criticos para planificar aplicaciones.
- El formato MLX limita el uso a hardware Apple; no hay pesos GGUF ni safetensors compatibles con transformers/CUDA en el repo.
- El modelo tiene 0 descargas y 0 likes, y fue creado en 2026-11-06, por lo que carece de validacion comunitaria.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base.
- La cabeza MTP anade 0,845B de pesos que solo son utiles si el runtime de inferencia implementa decodificacion especulativa; en caso contrario, ocupan memoria sin aportar velocidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timesmith/Qwen3.6-35B-A3B-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Articulo sobre el modelo base Qwen3.6-35B-A3B: https://www.marktechpost.com/2026/04/16/qwen-team-open-sources-qwen3-6-35b-a3b-a-sparse-moe-vision-language-model-with-3b-active-parameters-and-agentic-coding-capabilities/
