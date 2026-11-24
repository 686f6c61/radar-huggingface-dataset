# umzcio/Inkling-2-Small-DGX-Spark

## Resumen

Inkling-2-Small-DGX-Spark es una receta de despliegue, no un conjunto de pesos nuevos, publicada por el usuario umzcio para servir el modelo thinkingmachines/Inkling-2-Small en cuatro estaciones NVIDIA DGX Spark (GB10) mediante vLLM. El modelo base es un transformer de mezcla de expertos (MoE) de 594.000 millones de parametros totales y 17.000 millones activos, cuantizado en NVFP4 y con un peso aproximado de 366 GiB. El repositorio de Hugging Face no contiene pesos: reutiliza el checkpoint original sin modificaciones y remite a un repositorio de GitHub (zrresearch/inkling-2-sparks) donde reside el parche de vLLM, los kernels Triton para GB10 y los scripts de lanzamiento.

El problema que resuelve es concreto: la imagen oficial de vLLM de Thinking Machines apunta a GPUs de clase B200 y sus kernels de expertos no compilan en GB10, ademas de requerir caracteristicas de hardware ausentes en esa plataforma (memoria tensorial, multicast NVLink, mas de 99 KB de memoria compartida por bloque). La receta sustituye esas piezas por kernels Triton y construye una imagen nueva, manteniendo desactivados el codificador de vision y el modelo borrador DSpark, de modo que el servicio es solo de texto.

Su relevancia es practica para quien quiera ejecutar un MoE de gran tamano en hardware de escritorio o de laboratorio con arquitectura Blackwell. Con cuatro Sparks se obtienen 30,2 tokens/s en un unico flujo y 121 tokens/s agregados con 16 flujos, con una perplexity en WikiText de 3,0732 (un 0,11 % peor que la referencia aritmetica exacta) y un contexto declarado de 256K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun tags del repositorio; detalles internos no disponibles |
| Parametros totales | 594.000 millones (594B) |
| Parametros activos | 17.000 millones (17B) |
| Longitud de contexto | 256K tokens (256.000) |
| Tipos de cuantizacion | NVFP4 para los expertos; pesos de atencion en FP8 en la build ajustada; MXFP8 mencionado en los kernels Triton; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint original de thinkingmachines/Inkling-2-Small (revision e242a97e271095c11bc33ddb3850d37e22917343); formato exacto de ficheros no disponible |
| Tamano del checkpoint | 366 GiB en NVFP4 |
| Hardware objetivo | 4 x NVIDIA DGX Spark (GB10) |
| Libreria de servicio | vLLM (imagen parcheada) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 594B de parametros totales y 17B activos por token, servido en precision NVFP4. La receta dividide cada experto NVFP4 entre las cuatro Sparks y almacena los pesos de atencion en FP8 en la build ajustada, lo que constituye la principal diferencia de rendimiento frente a la build de referencia. Los kernels de expertos para NVFP4 y MXFP8, asi como la atencion paginada con el sesgo de posicion relativa propio de Inkling, se reimplementan en Triton porque las versiones CUDA originales no compilan para la arquitectura 10.x de GB10.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base dentro de la informacion proporcionada. La receta documenta un fallo relevante de vLLM: con el modo de CUDA graph por defecto, la cache de prefijos corrompe las respuestas cuando un acierto de cache deja un remanente corto, produciendo repeticiones de basura como secuencias de "!". La solucion es servir con `--compilation-config.cudagraph_mode=FULL_DECODE_ONLY`, que cuesta un 4 % del decode en un flujo, o desactivar la cache de prefijos; el script `checks/prefix_poison_test.py` permite verificar cualquier build.

## Capacidades

- Generacion de texto y razonamiento de nivel alto, con resultados de 88,4 en GPQA Diamond y 87,6 en MMLU-Pro en la build ajustada.
- Razonamiento matematico competitivo: 90,0 en AIME 2025 (30 problemas x 4 intentos) con la build ajustada.
- Ejecucion de tareas de agente en terminal: Terminal-Bench 2.1 con Terminus 2 alcanza 16/89 (18,0 %) con los limites oficiales y 27/89 (30,3 %) con limites 6 veces mayores.
- Tareas de ciberseguridad tipo captura la bandera: Cybench con Codex logra 17/40 tareas en 45 minutos y 25/40 en 135 minutos.
- Soporte de contexto largo: ventana de 256K tokens con atencion paginada y sesgo de posicion relativa.
- Servicio concurrente: hasta 16 flujos simultaneos con rendimiento agregado de 121 tokens/s.
- Capacidad de vision: el modelo base incluye codificador de vision, pero la receta lo desactiva explicitamente; el servicio es solo texto.
- Decodificacion especulativa: el modelo base dispone de un borrador DSpark, desactivado en esta receta.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.

## Casos de uso

- Analisis de repositorios completos: con 256K tokens de contexto se puede cargar un arbol de codigo extenso y hacer preguntas transversales sobre arquitectura, dependencias o deuda tecnica sin trocear el contenido.
- Agente autonomo de terminal en laboratorio: Terminal-Bench 2.1 con Terminus 2 demuestra capacidad para encadenar comandos y verificar resultados; encaja en tareas de administracion de sistemas y automatizacion de pruebas sobre maquinas de desarrollo.
- Razonamiento matematico y verificacion formal: los 90,0 puntos en AIME 2025 lo hacen util para generar y comprobar demostraciones o derivaciones paso a paso en entornos de investigacion.
- Evaluacion de seguridad ofensiva controlada: Cybench con Codex permite resolver retos de CTF y auditorias de configuracion en un entorno aislado, con tiempos de 45 a 135 minutos por bateria.
- Asistencia a investigacion cientifica: GPQA Diamond de 88,4 indica solidez en preguntas de nivel doctorado de fisica, quimica y biologia; sirve para triaje de literatura y generacion de hipotesis con contexto de articulos completos.
- Servicio de inferencia on-premise para equipos pequenos: cuatro DGX Spark ofrecen 121 tokens/s agregados con 16 flujos, suficiente para un grupo de trabajo que necesite un modelo grande sin depender de la nube.
- Procesamiento por lotes de documentos largos: con 1.885 tokens/s de prefill a 4.096 tokens y 1.211 tokens/s a 131.072 tokens, es viable indexar o resumir corpus extensos en una sola pasada.

## Benchmarks y rendimiento

Calidad, temperatura 0,6, respuestas limitadas a 32.768 tokens, los tiempos agotados cuentan como fallo:

| Test | Build de referencia | Build ajustada |
|---|---|---|
| GPQA Diamond (198) | 87,4 | 88,4 |
| MMLU-Pro (700 fijos) | 88,1 | 87,6 |
| AIME 2025 (30 x 4) | 93,3 | 90,0 |

Rendimiento en tokens por segundo con cuatro Sparks:

| Build | 1 flujo | 4 flujos | 8 flujos | 16 flujos | Perplexity WikiText |
|---|---|---|---|---|---|
| Referencia (aritmetica exacta) | 25,4 | 56,5 | 81,4 | 119,9 | 3,0697 |
| Ajustada (recomendada) | 30,2 | 58,5 | 84,0 | 121,0 | 3,0732 (+0,11 %) |

Latencia segun longitud de prompt (build ajustada):

| Longitud de prompt | Tiempo de prompt | Prompt tok/s | Decode tok/s a esa longitud |
|---|---|---|---|
| 4.096 | 2,2 s | 1.885 | 24,2 |
| 32.768 | 20,0 s | 1.642 | 13,2 |
| 131.072 | 108,3 s | 1.211 | 5,3 |

Benchmarks de agente (build ajustada):

| Benchmark | Limites oficiales | Limites ampliados |
|---|---|---|
| Terminal-Bench 2.1, Terminus 2 | 16/89 (18,0 %) | 27/89 (30,3 %) a 6x |
| Cybench, Codex, 3 intentos | 17/40 tareas (45 min) | 25/40 tareas (135 min) |

## Requisitos de hardware

- VRAM: el checkpoint NVFP4 ocupa 366 GiB, repartidos entre cuatro DGX Spark; no cabe en una sola GPU.
- GPU recomendadas: cuatro NVIDIA DGX Spark (GB10) como configuracion documentada. El modelo base de Thinking Machines apunta a GPUs de clase B200 con su imagen oficial de vLLM.
- GPU de consumo: no es viable en ninguna GPU consumer individual por el tamano del checkpoint; la receta esta pensada para el cluster de cuatro Sparks.
- Despliegue: vLLM con imagen parcheada construida desde la imagen oficial de Thinking Machines; se requiere compilar los kernels Triton para GB10.
- Red: el script de servicio requiere configurar direcciones, dispositivos RoCE e interfaz en `nodes.conf` para la comunicacion entre nodos.
- Latencia y throughput: 30,2 tokens/s en un flujo, 121 tokens/s con 16 flujos; prefill de 1.885 tokens/s a 4.096 tokens y 1.211 tokens/s a 131.072 tokens; decode de 24,2 tokens/s a 4.096 tokens y 5,3 tokens/s a 131.072 tokens.
- Ajuste obligatorio: `--compilation-config.cudagraph_mode=FULL_DECODE_ONLY` para evitar la corrupcion por cache de prefijos, con un coste del 4 % en decode de un flujo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small (esta receta) | 594B totales / 17B activos | 256K | Apache-2.0 | Pesos en thinkingmachines/Inkling-2-Small; receta en zrresearch/inkling-2-sparks | GPQA 88,4, MMLU-Pro 87,6, AIME 90,0 |
| Inkling-2-Small (imagen oficial de vLLM) | 594B totales / 17B activos | 256K | Apache-2.0 | Imagen oficial de Thinking Machines | Orientada a B200; no compila en GB10 |
| Alternativas de tamano y tarea comparables | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos en la informacion disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una receta de despliegue y depende del checkpoint original y de un repositorio externo de GitHub para funcionar.
- La corrupcion por cache de prefijos con el modo CUDA graph por defecto es un fallo conocido que produce respuestas basura; exige usar el modo FULL_DECODE_ONLY o desactivar la cache, con el coste de rendimiento indicado.
- El codificador de vision y el modelo borrador DSpark estan desactivados: no hay capacidad multimodal ni decodificacion especulativa en este despliegue.
- El hardware objetivo es muy especifico (cuatro DGX Spark con GB10); no hay garantia de funcionamiento en otras configuraciones sin adaptar los kernels.
- El rendimiento decae con la longitud del contexto: de 24,2 tokens/s a 4.096 tokens a 5,3 tokens/s a 131.072 tokens en decode.
- Los resultados en Terminal-Bench 2.1 con limites oficiales son modestos (18,0 %), lo que limita su uso como agente autonomo sin supervision.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas soportados; la evaluacion de sesgo y cobertura linguistica queda pendiente.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican las precauciones habituales en produccion.
- Licencia Apache-2.0 permite uso comercial, pero la receta depende de la imagen de Thinking Machines y de los proyectos vLLM y Triton, cuyas condiciones deben verificarse por separado.
- El modelo se publico en noviembre de 2026 y el repositorio no tiene descargas ni likes, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/umzcio/Inkling-2-Small-DGX-Spark
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Receta en GitHub: https://github.com/zrresearch/inkling-2-sparks
- Suite de evaluacion: https://github.com/zrresearch/evals
- Revision del checkpoint: e242a97e271095c11bc33ddb3850d37e22917343
