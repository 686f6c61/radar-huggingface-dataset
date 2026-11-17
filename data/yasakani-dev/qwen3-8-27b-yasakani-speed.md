# yasakani-dev/Qwen3.8-27B-YASAKANI-speed

## Resumen

Qwen3.8-27B-YASAKANI-speed es una conversión cuantizada y comprimida del modelo Qwen3.8-27B (27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud) al formato propietario `.yskn` del motor de inferencia local YASAKANI, desarrollado por yasakani-dev. El repositorio no contiene pesos en safetensors ni GGUF, sino un único fichero de 10,31 GB más un modelo borrador de decodificación especulativa derivado de DFlash 2 (z-lab / Inco AI), pensado exclusivamente para cargarse con el motor YASAKANI en Windows sobre una GPU NVIDIA RTX.

El objetivo del modelo es ofrecer la mayor velocidad de generación posible en hardware de consumo: cabe en GPUs de 16 GB de VRAM, frente a los 24 GB que exige la variante "quality" del mismo autor y frente a los 53,8 GB de los pesos BF16 originales. La contrapartida es una fidelidad reducida respecto al modelo de referencia: el token más probable coincide con el del original el 93,01 % de las veces y la divergencia KL es de 0,0304, medidos sobre 20 transcripciones de razonamiento internas.

Es relevante ahora porque ejemplifica una tendencia de ecosistema: motores de inferencia de autor único que publican sus propias conversiones optimizadas por hardware, con decodificación especulativa y caché KV comprimida integradas, en lugar de depender de formatos estándar como GGUF o safetensors. Su utilidad queda, por tanto, restringida a quien adopte YASAKANI como runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen3.8-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27 000 millones (27B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor fijo; se ajusta dinamicamente segun la VRAM libre al arrancar (puede ser menor en GPUs de menos de 32 GB) |
| Tipos de cuantizacion | conversion propietaria a formato `.yskn` comprimido a 10,31 GB; cache KV comprimida mediante `kvq_u5.bin`; no se ofrecen niveles de cuantizacion alternativos |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3.8-27B es multilingue, pero no se detalla en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` propietario de YASAKANI (solo cargable por el motor YASAKANI); incluye ficheros auxiliares `.shead`, `.bin`, `tokenizer.json`, `chat_template.jinja`, `config.json` y `generation_config.json` originales de Qwen |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion proporcionada (tipo de transformer, atencion, composicion del corpus de entrenamiento, numero de tokens o etapas de alineacion como RLHF o DPO). Lo que si se documenta es el proceso de conversion: los pesos BF16 originales (53,8 GB) se comprimen a 10,31 GB en el formato `.yskn`, una reduccion de aproximadamente 5,2 veces, y se acompaña de un modelo borrador (`bdraft2_k8.yskn` y `bdraft2_k8.shead`) derivado de DFlash 2 de z-lab para decodificacion especulativa, mas una configuracion de cache KV comprimida (`kvq_u5.bin`).

La innovacion tecnica destacable es precisamente ese pipeline de inferencia: decodificacion especulativa con borrador dedicado y cache de clave-valor comprimida, orquestados por el motor YASAKANI. El autor declara haber medido la fidelidad de la conversion sobre 20 transcripciones de razonamiento (20 460 posiciones, cache KV en FP16, 8 de noviembre de 2026) no usadas durante la creacion de los ficheros, comparando el token mas probable y la divergencia KL frente al modelo BF16 original.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat original de Qwen (`chat_template.jinja` sin modificar).
- Razonamiento en modo "thinking": las metricas de fidelidad del autor se midieron especificamente sobre transcripciones de razonamiento, lo que confirma soporte de trazas de pensamiento.
- Decodificacion especulativa asistida por modelo borrador, integrada en el runtime.
- Cache KV comprimida para reducir el consumo de VRAM durante la generacion.
- Tool calling, function calling, capacidades de agente, vision o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada (depende del modelo base Qwen3.8-27B, no documentado aqui).

## Casos de uso

- Asistente conversacional local en estacion de trabajo Windows: el modelo se ejecuta integramente en una unica RTX con 16 GB o mas, sin dependencia de la nube, adecuado para equipos con requisitos de confidencialidad de datos.
- Razonamiento asistido en portatiles o torres con RTX 4080 / 5070 Ti (16 GB): es la unica de las dos conversiones de YASAKANI que cabe en esas tarjetas, por lo que resulta la opcion practica para analisis paso a paso y resumen de documentos largos en hardware de gama alta de consumo.
- Prototipado rapido de aplicaciones de IA generativa: al reducir el peso en disco a unos 13 GB totales y eliminar la necesidad de servidores de inferencia, se puede iterar sobre prompts y plantillas de chat en local antes de mover la carga a produccion.
- Generacion de codigo y explicaciones tecnicas en un entorno de desarrollo aislado (air-gapped), donde no se permite enviar codigo propietario a APIs externas.
- Evaluacion comparativa de runtimes: util para medir en primera persona el coste en calidad de una compresion agresiva (93,01 % de coincidencia en el token mas probable) frente a la variante quality (95,24 %) del mismo autor.
- Uso educativo y de investigacion sobre cuantizacion y decodificacion especulativa: el repositorio publica metricas de divergencia KL y ficheros de verificacion (`selfcheck.json`, `yasakani.json` con checksums SHA-256) que permiten reproducir el proceso de validacion.
- Despliegue en entornos con GPU unica y sin cluster: al no requerir vLLM ni TGI, encaja en escenarios de inferencia de un solo usuario con baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo proporciona metricas de fidelidad frente al modelo original:

| Metrica | Modelo speed (este repo) | Modelo quality | Condiciones |
|---|---|---|---|
| Coincidencia del token mas probable con el original | 93,01 % | 95,24 % | 20 transcripciones de razonamiento, 20 460 posiciones, cache KV FP16, 8 de noviembre de 2026 |
| Divergencia KL respecto al original (menor es mejor) | 0,0304 | 0,0122 | Mismas condiciones |
| Tamano del fichero principal | 10,31 GB | 12,37 GB | — |
| VRAM minima | 16 GB | 24 GB | — |

El autor advierte explicitamente que estas cifras no son precision de tarea y que solo cubren ese tipo de texto. Las mediciones de velocidad no se incluyen en la model card: se remiten a la pagina de GitHub del proyecto, sin cifras reproducidas aqui.

## Requisitos de hardware

- VRAM: 16 GB o mas para este modelo (la variante quality exige 24 GB). No funciona en tarjetas de 12 GB o menos.
- GPUs soportadas segun el autor: RTX 5090 (32 GB, unica probada), RTX 3090 / 3090 Ti / 4090 (24 GB, ambas variantes), y RTX 4060 Ti 16GB, 4070 Ti SUPER, 4080, 4080 SUPER, 5060 Ti 16GB, 5070 Ti y 5080 (16 GB, solo esta variante).
- Compatibilidad declarada con series RTX 30, 40 y 50 desde la version 0.1.3 del motor. No soporta RTX 20 ni anteriores, ni GPUs AMD, ni Mac (no oficialmente).
- En tarjetas de menos de 32 GB la longitud de contexto se fija dinamicamente a partir de la VRAM libre en cada arranque, por lo que puede reducirse.
- Opciones de despliegue: exclusivamente el motor YASAKANI (Windows 11, Python 3.10 o superior, DLL `yskn.dll`). No es compatible con transformers, llama.cpp, vLLM ni SGLang.
- Latencia y throughput: no disponibles como cifras en la informacion proporcionada; el autor indica que todas las mediciones de velocidad se hicieron en una RTX 5090 y que en tarjetas inferiores la mejora esperada es menor.
- Almacenamiento: aproximadamente 13 GB en disco para el conjunto completo de ficheros, que deben mantenerse juntos en una sola carpeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-YASAKANI-speed (este) | 27B | dinamico segun VRAM | `.yskn`, solo YASAKANI, Windows + RTX | Apache 2.0 | Hugging Face, 195 descargas |
| Qwen3.8-27B-YASAKANI-quality | 27B | dinamico segun VRAM | `.yskn`, solo YASAKANI | Apache 2.0 | Hugging Face |
| Qwen3.8-27B original (BF16) | 27B | no disponible | safetensors, transformers y otros | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| DFlash 2 draft para Qwen3.8-27B (z-lab) | no disponible (modelo borrador) | no aplica | no disponible | no disponible | Hugging Face (origen del borrador) |

No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas con alternativas de la misma categoria. La comparacion disponible es exclusivamente de tamano, requisitos de VRAM y fidelidad respecto al modelo original, segun la tabla de benchmarks anterior.

## Limitaciones y advertencias

- No es el modelo original: la compresion de 53,8 GB a 10,31 GB implica perdida de fidelidad (93,01 % de coincidencia en el token mas probable, KL 0,0304), y esa cifra solo se ha medido sobre transcripciones de razonamiento, no sobre otros dominios.
- Bloqueo de formato: los pesos solo los carga YASAKANI; no se pueden usar con transformers, llama.cpp, vLLM, SGLang ni Ollama, lo que impide migrar a otro stack sin reconvertir desde el modelo base.
- Dependencia de plataforma: exclusivamente Windows 11 con GPU NVIDIA RTX de 16 GB o mas; sin soporte de AMD, Mac ni GPUs anteriores a la serie 30.
- Optimizacion no verificada fuera de la RTX 5090: el autor reconoce que no ha probado otras tarjetas y no garantiza que funcione ni con que velocidad en ellas.
- Contexto no deterministico: la ventana efectiva depende de la VRAM libre al arrancar, lo que puede producir comportamientos distintos entre ejecuciones o equipos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al tratarse de un modelo derivado de Qwen3.8-27B, hereda los sesgos del original, pero no se detallan.
- Idiomas soportados: no declarados; no se debe asumir cobertura multilingue sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye un fichero `NOTICE` con atribuciones a Qwen (Alibaba Cloud) y a z-lab (Inco AI); no es una release oficial de ninguno de ellos y ninguno lo respalda.
- Version del motor: en tarjetas distintas de la RTX 5090 se requiere YASAKANI 0.1.3 o superior; versiones anteriores pueden no ejecutar el modelo correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Variante quality: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Motor YASAKANI (GitHub): https://github.com/yasakani-dev/yasakani
- Documentacion en japones del motor: https://github.com/yasakani-dev/yasakani (README.ja.md)
- Issues del proyecto: https://github.com/yasakani-dev/yasakani/issues
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
