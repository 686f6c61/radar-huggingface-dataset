# yuma-nagao/Bonsai-2-27B-A100-K3-Hybrid-Preview

## Resumen

Bonsai 2 27B — A100 K3 Hybrid Graph research preview es un artefacto experimental publicado por el usuario yuma-nagao en HuggingFace. No se trata de un checkpoint de modelo listo para usar, sino de un paquete de documentación técnica sobre una optimización de motor de inferencia aplicada a un modelo denominado Bonsai 2 27B sobre una GPU A100-SXM4-80GB. El repositorio contiene parches de código host, instantáneas de fuentes, hashes de verificación y resúmenes de mediciones de velocidad, pero no incluye pesos del modelo ni binarios ejecutables.

La contribución técnica consiste en una selección condicional entre dos rutas de ejecución: una ruta eager convencional y una ruta híbrida que reutiliza un CUDA Graph existente cuando la ronda actual de decodificación especulativa cumple unas condiciones de alineación predefinidas. La decodificación especulativa K3 propone tres tokens por ronda y los verifica con el modelo objetivo, una técnica ya presente en el motor base (NInfer, NInfer-all y DFlash2). El cambio incremental es el enrutamiento protegido entre ambas rutas.

El interés del artefacto es metodológico: documenta mediciones pareadas de velocidad, una verificación de equivalencia de salida sobre 40 preguntas y un conjunto de hashes que identifican las fuentes medidas. No obstante, el propio autor advierte que no es un modelo independiente, que no se puede ejecutar con Transformers, Ollama ni un cargador GGUF genérico, y que las cifras no deben interpretarse como ganancias generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con decodificacion especulativa K3 y reutilizacion condicional de CUDA Graph (motor NInfer/DFlash2) |
| Parametros totales | 27B (segun el nombre del modelo; no verificado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | capacidad de 49.152 tokens en la configuracion medida; cobertura de regresion hasta 32K |
| Tipos de cuantizacion | no disponible (la medicion usa BF16 para la KV cache) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el preview no incluye pesos ni binarios |

## Arquitectura y entrenamiento

El preview no describe el entrenamiento del modelo subyacente. Lo que documenta es una modificación del motor de inferencia, no del modelo. El motor base combina decodificacion especulativa K3 —que propone tres tokens por ronda y los verifica con el modelo objetivo— con un mecanismo de replay de CUDA Graph. La innovacion incremental consiste en reutilizar un CUDA Graph ya existente solo cuando la ronda actual satisface condiciones de alineacion verificadas; prefijos cortos, fronteras de particion y rondas finales parcialmente validas caen en la ruta eager. El numero de columnas validas se comprueba inmediatamente antes del despacho y una discrepancia aborta la ejecucion en lugar de continuar silenciosamente.

Las mediciones se realizaron con peticion unica, modo thinking desactivado, decodificacion greedy, KV cache en BF16 y capacidad de 49.152. La equivalencia de salida se verifico contra referencias autorregresivas congeladas sobre 40 preguntas (20 de japones, 4 de codigo, 4 de matematicas y 12 de contexto largo, cuatro a 2K, cuatro a 8K y cuatro a 32K). Las 40 respuestas coincidieron exactamente en texto, IDs de tokens visibles, terminacion natural y las filas top-20 de probabilidad, incluido el orden. Cinco preguntas se ejecutaron ademas con trazado diagnostico, sumando 45 respuestas y 6.062 filas de tokens visibles. No se cubren probabilidades de vocabulario completo, decodificacion estocastica, modo thinking ni la frontera completa de 49K.

## Capacidades

- Generacion de texto en japones e ingles, segun los idiomas declarados en la model card.
- Decodificacion especulativa con verificacion por el modelo objetivo (K3, tres tokens propuestos por ronda).
- Reutilizacion condicional de CUDA Graph para acelerar rondas de decodificacion alineadas.
- Ejecucion con KV cache en BF16 y capacidad de contexto de hasta 49.152 tokens en la configuracion medida.
- Capacidad de codigo y matematicas evidenciada solo como categorias dentro del conjunto de regresion (4 preguntas cada una), no como evaluacion de rendimiento.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: explicitamente no cualificado en este preview.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Auditoria de optimizaciones de motores de inferencia: el repositorio sirve como referencia reproducible para equipos que quieran evaluar la seleccion condicional entre ruta eager y ruta con CUDA Graph en un motor de decodificacion especulativa, ya que incluye parches, instantaneas de fuentes y hashes de las fuentes medidas.
- Verificacion de equivalencia de salida en decodificacion especulativa: la metodologia de comparacion contra referencias autorregresivas congeladas (texto, IDs de tokens, terminacion y filas top-20) es reutilizable como plantilla de pruebas de regresion para motores propios.
- Estimacion de latencia en despliegues con contexto largo: las mediciones de 8K de entrada con 127 tokens visibles (4,527 s a 4,431 s de tiempo de pared total) ilustran por que una mejora de velocidad de decodificacion no se traduce en la misma reduccion de latencia total, util para dimensionar SLA.
- Investigacion sobre decodificacion especulativa en GPUs A100: los datos pareados permiten estudiar el efecto de la reutilizacion de grafos en cargas de codigo corto (236,09 a 297,22 tok/s) frente a respuestas en japones (159,92 a 174,80 tok/s).
- Formacion y revision tecnica: el material de METHOD.md y REPRODUCING.md documenta el procedimiento de medicion y las condiciones exactas, adecuado para cursos o revisiones internas de ingenieria de rendimiento.
- Base para un futuro paquete ejecutable: el autor enumera los elementos pendientes (motor padre corregido, ejecutable empaquetado, artefacto de modelo preparado y replay limpio sin autenticacion) que un equipo podria completar para convertir el preview en un entorno reproducible.

## Benchmarks y rendimiento

Las siguientes mediciones son pareadas, una por condicion, con el mismo ejecutable candidato y la opcion hibrida desactivada y activada, mismos prompts y salidas completas. No son medianas de tres repeticiones.

| Tarea | Eager K3 | Hybrid K3, trace OFF | Ratio | Tiempo de pared total |
|---|---:|---:|---:|---:|
| Respuesta en japones, 283 tokens visibles | 159,92 tok/s | 174,80 tok/s | 1,093x | 1,859 a 1,706 s |
| Codigo corto, 73 tokens visibles | 236,09 tok/s | 297,22 tok/s | 1,259x | 0,398 a 0,330 s |
| Respuesta con 8K de entrada, 127 tokens visibles | 228,88 tok/s | 249,65 tok/s | 1,091x | 4,527 a 4,431 s |

La velocidad de generacion se calcula como tokens visibles generados dividido por el intervalo de generacion reportado por la API, excluyendo el procesamiento del prompt. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no reclama una ganancia general de 3x ni 2.000 tok/s.

## Requisitos de hardware

- GPU medida: A100-SXM4-80GB, con CUDA Graph y decodificacion especulativa K3.
- VRAM estimada para inferencia: no disponible; el preview no incluye pesos y no documenta requisitos de memoria.
- GPUs recomendadas: unicamente A100-SXM4-80GB segun la informacion disponible; no se documenta soporte para H100, RTX 4090 ni otras tarjetas.
- Compatibilidad con GPU de consumo: no disponible; el autor senala que la ejecucion en iPhone no esta cualificada y que no se ha alcanzado el objetivo de 1.000 tok/s offline en iPhone.
- Opciones de despliegue: no es compatible con Transformers, Ollama ni cargadores GGUF genericos; requiere el motor NInfer/DFlash2 con el parche incluido, y el parche no se aplica directamente a un checkout upstream arbitrario.
- Latencia y throughput: 159,92 a 297,22 tok/s en generacion segun la tarea, con tiempos de pared total de 0,330 s a 4,431 s en los tres casos medidos.

## Comparativa con modelos similares

No disponible. El artefacto no es un checkpoint de modelo comparable con otros modelos de 27B, sino un parche de motor de inferencia. La informacion proporcionada no incluye comparaciones con modelos alternativos de tamano o tarea similar.

## Limitaciones y advertencias

- No es un modelo independiente ni un paquete de inferencia listo para ejecutar: no incluye pesos ni binarios, y faltan el motor padre corregido, el ejecutable empaquetado, el artefacto de modelo preparado y un replay limpio en entorno publico.
- El parche no se aplica directamente a un checkout upstream arbitrario.
- Las mediciones son preliminares: una medicion por condicion, sin repeticiones que permitan estimar variabilidad.
- La verificacion de equivalencia cubre 40 preguntas bajo condiciones fijas (thinking desactivado, greedy, BF16, capacidad 49.152); no cubre decodificacion estocastica, modo thinking, probabilidades de vocabulario completo ni la frontera completa de 49K.
- El autor advierte que la prueba de equivalencia no es un benchmark de inteligencia independiente y no demuestra que todas las capacidades permanezcan inalteradas.
- La optimizacion no corrige respuestas erroneas del modelo original.
- No hay datos sobre sesgos, riesgo de alucinacion ni comportamiento multilingue mas alla de japones e ingles.
- El uso comercial esta permitido por la licencia Apache 2.0, pero la ausencia de pesos y de un entorno ejecutable limita cualquier despliegue en produccion.
- El autor senala que no se han alcanzado los objetivos de 2.000 tok/s en A100 ni 1.000 tok/s offline en iPhone.

## Enlaces

- [HuggingFace: yuma-nagao/Bonsai-2-27B-A100-K3-Hybrid-Preview](https://huggingface.co/yuma-nagao/Bonsai-2-27B-A100-K3-Hybrid-Preview)
- METHOD.md (referenciado en la model card, sin URL directa en la informacion disponible)
- REPRODUCING.md (referenciado en la model card, sin URL directa en la informacion disponible)
- NOTICE (referenciado en la model card, sin URL directa en la informacion disponible)
- NInfer-all, revision upstream `92a2b338bb7a701edc7653c08308e9c67cdd63d5` (sin URL directa en la informacion disponible)
- DFlash2 (referenciado en la model card, sin URL directa en la informacion disponible)
