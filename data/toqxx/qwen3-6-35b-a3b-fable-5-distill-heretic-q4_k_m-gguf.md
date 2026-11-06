# toqxx/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-Q4_K_M-GGUF

## Resumen

toqxx/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-Q4_K_M-GGUF es una cuantizacion en formato GGUF (tipo Q4_K_M) del modelo Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic, un derivado de la familia Qwen 3.6 con arquitectura de mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B parametros activos por token, segun indica el propio nombre del modelo. El autor de esta publicacion, toqxx, se limita a convertir los pesos originales a GGUF mediante el espacio GGUF-my-repo de ggml.ai, sin aportar informacion adicional sobre el proceso de entrenamiento o evaluacion.

El modelo base combina tres rasgos que aparecen en las etiquetas de la model card: destilacion con cadenas de razonamiento (distillation, chain-of-thought), un ajuste orientado a reducir rechazos y censura (heretic, uncensored) y un entrenamiento con DPO. Tambien se etiqueta como "prompt-injection-defense", lo que sugiere algun tipo de endurecimiento frente a inyeccion de prompts, aunque no se documenta el mecanismo. La licencia declarada es Apache 2.0 y el unico idioma indicado es el ingles.

La relevancia de esta ficha es practica: ofrece un artefacto de 21,2 GB en cuantizacion Q4_K_M que puede ejecutarse con llama.cpp en hardware relativamente modesto para un modelo de 34.660.610.688 parametros totales, gracias a que solo se activan unos 3B por token. No obstante, la informacion publicada por el autor es minima y no incluye resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiquetas del modelo; detalles no disponibles |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | Aproximadamente 3B (indicado en el nombre "A3B"); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo qwen3.6-35b-a3b-fable-5-distill-heretic-q4_k_m.gguf); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La arquitectura es de tipo transformer con mezcla de expertos (MoE), tal como declaran las etiquetas "mixture-of-experts" y "moe" y el propio nombre del modelo (35B-A3B). Esto implica 34,66B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento, la dimension oculta, el numero de capas ni la implementacion exacta de la atencion.

Respecto al entrenamiento, la model card solo aporta etiquetas: destilacion con cadenas de razonamiento (distillation, chain-of-thought), ajuste con DPO y un proceso orientado a reducir comportamientos de rechazo (heretic, uncensored). No se especifica el numero de tokens de preentrenamiento, la composicion del dataset, el modelo profesor utilizado en la destilacion ni los hiperparametros del DPO. Tampoco se documenta la innovacion tecnica asociada a "prompt-injection-defense". Toda esta informacion deberia consultarse en la model card del modelo base, que no se ha proporcionado en detalle.

## Capacidades

- Generacion de texto en ingles con pipeline de text-generation.
- Razonamiento explicito mediante cadenas de pensamiento (chain-of-thought), heredado del proceso de destilacion.
- Capacidades de razonamiento y matematicas: no documentadas con benchmarks, pero coherentes con la familia Qwen y con el etiquetado de reasoning.
- Comportamiento menos restrictivo en cuanto a rechazos (uncensored, heretic), lo que puede aumentar la utilidad en tareas creativas o de analisis sensible, a costa de mayores riesgos de contenido inapropiado.
- Defensa frente a inyeccion de prompts segun la etiqueta "prompt-injection-defense"; el mecanismo no esta descrito.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue local de un modelo de razonamiento de gran tamano en una sola GPU de consumo: la cuantizacion Q4_K_M (21,2 GB) y los aproximadamente 3B parametros activos permiten ejecutar el modelo con llama.cpp en equipos con 24 GB de VRAM, algo inviable con un denso de 35B en la misma cuantizacion.
- Generacion de cadenas de razonamiento para sintesis de datos: el modelo puede producir trazas de chain-of-thought en ingles que sirvan como corpus de destilacion para modelos mas pequenos, aprovechando su entrenamiento especifico en este formato.
- Prototipado de asistentes conversacionales sin filtros corporativos: el caracter uncensored permite explorar respuestas sobre temas que otros modelos rechazan, util en investigacion sobre seguridad y alineamiento, siempre con supervision humana.
- Analisis de texto y redaccion tecnica en ingles: gracias a la ventana de contexto (no documentada) y a la naturaleza MoE, puede procesar documentos largos con un coste de inferencia contenido.
- Evaluacion de robustez frente a inyeccion de prompts: al declarar "prompt-injection-defense", puede emplearse como sujeto de pruebas en pipelines de red teaming para comparar su resistencia con la de otros modelos.
- Experimentacion con DPO y preferencias: util como punto de partida para estudiar el efecto del ajuste DPO y del proceso "heretic" en el comportamiento del modelo, comparandolo con el base sin ajustar.
- Inferencia en servidores sin GPU dedicada de gama alta: el formato GGUF permite ejecucion en CPU con llama-server, adecuado para entornos de desarrollo o demos de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 21,2 GB, por lo que se necesitan al menos 22-24 GB de VRAM para cargarlo completo en GPU; con offloading parcial a CPU puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB), A100 (40/80 GB), H100 (80 GB). En GPUs de 16 GB o menos sera necesario offloading de capas a RAM.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con la cuantizacion Q4_K_M, siempre que se reserve memoria para el contexto KV.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, segun la model card), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o LM Studio (no confirmado explicitamente en la informacion). vLLM y TGI no se mencionan y requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, los aproximadamente 3B parametros activos reducen el coste por token frente a un denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones completas de alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros y licencia.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| toqxx/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-Q4_K_M-GGUF | 34,66B | ~3B | no disponible | Apache 2.0 | GGUF |
| Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic (base) | 34,66B | ~3B | no disponible | Apache 2.0 | safetensors |
| Alternativas de la familia Qwen 3.6 con arquitectura MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion muy escasa: la model card del repositorio cuantizado no aporta datos de entrenamiento, contexto, benchmarks ni evaluacion de sesgos; cualquier uso en produccion exige validacion propia.
- Modelo uncensored: el ajuste "heretic" reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o factualmente incorrecto sin advertencia.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo generativo, especialmente en tareas de razonamiento largo, puede producir cadenas de pensamiento plausibles pero erroneas.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta documentada, por lo que no debe asumirse una ventana grande sin verificacion empirica.
- Cuantizacion Q4_K_M: introduce perdida de precision respecto a los pesos originales; tareas sensibles a matices (matematicas complejas, codigo) pueden degradarse.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado.
- Procedencia: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin validacion de la comunidad; conviene contrastar con el repositorio base antes de adoptarlo.
- Defensa frente a inyeccion de prompts: declarada pero no documentada; no debe considerarse una garantia de seguridad.

## Enlaces

- Repositorio Hugging Face (cuantizacion GGUF): https://huggingface.co/toqxx/Qwen3.6-35B-A3B-Fable-5-Distill-heretic-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Authereon/Qwen3.6-35B-A3B-Fable-5-Distill-heretic
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
