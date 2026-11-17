# xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un fine-tune de la familia Qwen3.5, desarrollado por el usuario xtools-at, que parte del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Este modelo base es a su vez un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un sesgo claro hacia matematicas y disciplinas STEM. La version heretic aplica una ablacion de rangos arbitrarios (ARA) para eliminar los comportamientos de rechazo del modelo original.

El modelo resuelve el problema de disponer de un razonador compacto de 9.000 millones de parametros con capacidad de descomposicion estructurada de problemas, apto para despliegue en hardware de gama media. Su relevancia actual radica en que combina la eficiencia de la clase 9B con senal de destilacion de un profesor de gran escala, y anade una variante sin censura que reduce los rechazos de 100/100 a 3/100 segun la model card.

La arquitectura declarada es qwen3_5, con 9.409.813.744 parametros totales y pesos en safetensors. El repositorio ocupa 19,3 GB. La licencia es Apache 2.0 y soporta seis idiomas: ingles, chino, coreano, japones, espanol y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder-only, segun tag del repositorio) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; evaluado con NVFP4 segun la model card) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, segun el tag `qwen3_5` del repositorio. El modelo base se entreno mediante destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo Max Effect y se uso ese material como senal supervisada sobre Qwen3.5-9B. La model card indica aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico, e incluye tags de SFT, RL y GSPO, ademas de MTP (multi-token prediction) y evaluacion en NVFP4.

La variante heretic se construyo con Heretic v2.0.0.dev0 aplicando una ablacion de rangos arbitrarios (ARA) sobre las capas 9 a 24, con pesos concretos: `preserve_good_behavior_weight` 0.8264, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9645 y `neighbor_count` 12. Esta intervencion modifica las representaciones internas para suprimir respuestas de rechazo manteniendo el comportamiento util, con una divergencia KL de 0.0422 respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas, heredada de la destilacion de DeepSeek-V4-Pro.
- Razonamiento matematico y STEM reforzado mediante unas 250.000 muestras de entrenamiento especificas.
- Tool calling y function calling, segun los tags `tool-use` y `function-calling`.
- Capacidades multimodales de entrada imagen-texto, segun el tag `image-text-to-text`.
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento explicito (tag `reasoning`), con patrones de solucion paso a paso.
- Transferencia cruzada a programacion y uso de herramientas, con mejoras pequenas reportadas pese a no recibir SFT especifico de codigo.
- Comportamiento decensurado: la model card reporta 3 rechazos de cada 100 frente a 100 de cada 100 del modelo original.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo esta entrenado sobre unas 250.000 muestras de matematicas y STEM, por lo que es adecuado para tutoria automatizada, generacion de soluciones paso a paso y verificacion de derivaciones.
- Asistencia en investigacion STEM: puede descomponer problemas de fisica, quimica o ingenieria en subproblemas y razonar sobre ellos, aprovechando la senal de destilacion de un profesor de mayor escala.
- Agentes con tool calling: los tags de funcion-calling permiten integrarlo en flujos donde el modelo decide que herramienta invocar y encadena llamadas multi-paso.
- Procesamiento de documentos con imagenes: al declarar entrada imagen-texto, puede emplearse en tareas que combinen capturas, diagramas o formulas renderizadas con texto.
- Despliegue en hardware de gama media: con 9.400 millones de parametros, es viable en GPUs de consumo alta y en servidores de una sola GPU, lo que facilita prototipado e inferencia local.
- Generacion de codigo asistida: aunque no recibio SFT especifico de codigo, la model card reporta mejoras pequenas por transferencia cruzada, util para autocompletado y explicacion de fragmentos.
- Atencion multilingue: con soporte para seis idiomas, sirve para clasificacion, resumen o generacion en entornos con usuarios de ingles, chino, coreano, japones, espanol y ruso.
- Escenarios que requieren baja tasa de rechazo: la variante heretic reduce los rechazos drasticamente, lo que resulta util en investigacion sobre alineacion, red teaming controlado y generacion de contenido creativo sin bloqueos.

## Benchmarks y rendimiento

La model card solo publica metricas comparativas del proceso de decensurado, no benchmarks estandar de razonamiento.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamano, 9.400 millones de parametros en FP16 requieren aproximadamente 19 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB, sin contar cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100 40 GB, H100 o L40S cubren el modelo en precision completa; una RTX 4090 (24 GB) puede alojarlo en FP16 ajustadamente o con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion, y en GPUs de 12-16 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y tecnicamente compatibles vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante decensurada, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | no disponible | Modelo base, 100/100 rechazos |
| Qwen3.5-9B | 9B | no disponible | no disponible | Modelo original de partida antes de la destilacion |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B | no disponible | no disponible | Fine-tune cientifico del mismo autor sobre esta base |

Los datos de rendimiento comparativo entre estas variantes no estan publicados mas alla de la tabla de rechazos y divergencia KL.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido que el original bloqueaba; requiere filtros y supervision en produccion.
- La ablacion ARA introduce una divergencia KL de 0.0422 respecto al original, lo que puede degradar ligeramente capacidades no relacionadas con el objetivo de decensurado.
- Riesgo de alucinacion inherente a modelos de 9B destilados; no hay evaluaciones publicadas de fidelidad factual.
- El foco en matematicas y STEM puede implicar menor calidad relativa en dominios creativos o humanisticos no cubiertos por el SFT.
- La longitud de contexto no esta documentada, lo que dificulta planificar cargas con ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado puede chocar con politicas de plataformas y con obligaciones regulatorias de moderacion de contenido.
- No se publican pesos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajos recursos sin conversion manual.
- El soporte de seis idiomas no garantiza calidad uniforme; no hay evaluaciones por idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico del autor: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
