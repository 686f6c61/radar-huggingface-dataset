# WardenOfPluto/Kerberos-35B-A3B-GGUF

## Resumen

Kerberos 35B-A3B 0.1 es un ajuste fino (post-entrenamiento) del modelo Qwen3.6-35B-A3B de Alibaba, desarrollado por WardenOfPluto. Su proposito concreto es convertir una especificacion de construccion (build spec) escrita en lenguaje natural en codigo funcional que supere los tests definidos en esa misma especificacion, ejecutandose localmente en un Mac. El modelo no pretende competir como asistente generalista, sino como motor de construccion local dentro de un flujo agente (shell, lectura, edicion y escritura de ficheros) en el que una especificacion aprobada se ejecuta sin salir de la maquina del usuario.

La version 0.1 se distribuye unicamente como GGUF cuantizado en UD-IQ3_XXS (13,2 GB), pensado para equipos con 24-31 GB de memoria unificada. El modelo base es un Mixture of Experts con 34.660.610.688 parametros totales y aproximadamente 3.000 millones activos por token (la designacion A3B del nombre), lo que explica que un modelo de ese tamano pueda ejecutarse en hardware de consumo.

Es relevante ahora porque ejemplifica una tendencia practica: especializar un modelo abierto grande mediante SFT ligero (LoRA, rango 32, dos epocas) sobre tareas reales de repositorios, y publicar los resultados con intervalos de confianza en lugar de cifras de benchmark aisladas. Su ganancia medida es marginal en tasa de exito, pero el cambio observado esta en la eficiencia de terminacion de los bucles agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (heredada de Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3.000 millones (designacion A3B) |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de ejemplo con `-c 65536`); maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | UD-IQ3_XXS (13,2 GB), unica publicada; receta identica a la de Unsloth para el modelo base |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos fusionados a precision completa antes de recuantizar, no publicados |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Metodo de ajuste | SFT, 2 epocas, LoRA rango 32 sobre Tinker, fusion a precision completa |
| Fecha de publicacion | 14 de noviembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, con 34.660 millones de parametros totales y alrededor de 3.000 millones activos por token. El autor no documenta detalles adicionales de la arquitectura (numero de capas, numero de expertos, atencion, etc.), por lo que esos datos deben consultarse en la model card de Qwen. El contexto operativo documentado es de 65.536 tokens, configurado explicitamente en el comando de llama.cpp con `--jinja -c 65536 -fa on` (flash attention activada).

El entrenamiento consistio en SFT durante 2 epocas con LoRA de rango 32 sobre la plataforma Tinker, fusionado despues en los pesos base a precision completa y recuantizado con la receta UD-IQ3_XXS de Unsloth (matriz de importancia y tipos por tensor identicos). Los datos son 75 cambios reales fusionados de 44 repositorios Python con licencias MIT, Apache 2.0 o BSD, cada uno reproducido desde el commit anterior. Las especificaciones fueron redactadas por GLM 5.3 servido por Together y solo se conservaron las que pasaban comprobaciones objetivas (rutas y nombres reales, tests que cargan y fallan sobre el codigo previo al cambio). Los objetivos de entrenamiento son 75 intentos del propio modelo base cuyo codigo supero los tests de la especificacion; los intentos agotados por tiempo se descartan y no se incluye ninguna salida de modelo cerrado. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de codigo guiada por especificacion: implementa cambios descritos en un documento de build spec, respetando ficheros a modificar y ficheros a dejar intactos.
- Ejecucion en bucle agente con herramientas de shell, lectura, edicion y escritura de ficheros.
- Escritura de tests primero y ejecucion de los mismos hasta que pasan, con criterio de parada explicito.
- Soporte de tool calling / function calling (verificado en la comprobacion de regresion: 20 de 24 frente a 22 de 24 del base).
- Conversacion multi-turno (chat: 24 de 24 en la comprobacion de regresion).
- Capacidad multilingue limitada: entrenado y evaluado en Python; JavaScript, TypeScript, PHP y shell solo cubiertos por la comprobacion de regresion.
- No entrenado para redactar especificaciones ni para planificar cambios grandes de forma autonoma.

## Casos de uso

- Construccion local de cambios de codigo a partir de una especificacion aprobada: el modelo recibe la spec y el repositorio, ejecuta los tests del proyecto y termina cuando pasan. Adecuado porque su entrenamiento se hizo exactamente sobre ese bucle y porque los datos no salen de la maquina.
- Flujo hibrido nube-local: un modelo frontier (por ejemplo, via Warden) redacta el plan y la spec, y Kerberos construye en un worktree local con cada llamada a herramienta validada contra politicas. Encaja por su tamano (13,2 GB en IQ3_XXS) y su contexto de 65.536 tokens.
- Implementacion de funciones pequenas con tests derivados de una tabla de comportamiento (por ejemplo, parsers de duraciones, validadores de entrada): la spec define entradas y resultados esperados y el modelo genera test y codigo en el orden indicado.
- Correccion de tests fallidos en integracion continua local: dado un repositorio y una spec que describa el fallo y el comportamiento esperado, el modelo edita los ficheros necesarios y ejecuta `pytest` hasta que la suite pasa.
- Prototipado en portatiles Apple Silicon: con 24-31 GB de memoria unificada se ejecuta mediante llama.cpp, Ollama o LM Studio, sin GPU dedicada, lo que permite trabajar en entornos sin acceso a la nube.
- Automatizacion de tareas de mantenimiento de repositorios Python pequenos (anadir exportaciones en `__init__.py`, crear modulos nuevos, ajustar firmas) cuando existe una spec concreta y tests que validen el resultado.
- Evaluacion de flujos agente en local: util como banco de pruebas para medir tasas de terminacion y consumo de tiempo en bucles agente sin coste de API.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 54 tareas retenidas de 32 repositorios Python de codigo abierto (commits fusionados reproducidos, tres intentos por tarea, misma cuantizacion de 3 bits y mismo runtime para todos los modelos):

| Medida | Modelo base | Kerberos 0.1 | Cambio (puntos) | Intervalo 95% | Tareas / repos |
|---|---|---|---|---|---|
| Tests del proyecto (evaluacion) | 61,1% | 61,5% | +0,3 | -6,2 a +6,9 | 54 / 32 |
| Tests de la spec | 56,8% | 57,8% | +0,9 | -3,2 a +5,2 | 54 / 32 |

| Metrica de proceso | Modelo base | Kerberos 0.1 |
|---|---|---|
| Intentos agotados por tiempo | 51 de 162 | 33 de 161 |

Comprobacion de regresion contra el base (72 intentos en JavaScript, TypeScript, PHP y shell, chat y tool calls):

| Categoria | Modelo base | Kerberos 0.1 |
|---|---|---|
| Builds | 23 de 24 | 23 de 24 |
| Chat | 23 de 24 | 24 de 24 |
| Tool calls | 22 de 24 | 20 de 24 |

Referencia frontier, solo para escala: 39 de 54 tareas (72%) superan los tests del proyecto con un unico parche por tarea, generado por un modelo frontier a partir de la misma spec y repositorio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: 13,2 GB para el unico fichero publicado (UD-IQ3_XXS). El autor lo orienta a Macs con 24-31 GB de memoria unificada.
- GPU dedicadas: no se documentan requisitos ni pruebas en A100, H100 o RTX 4090. Por tamano del fichero, cabe en GPUs consumer con 16 GB o mas de VRAM, aunque el autor no lo certifica.
- Consumer GPU: si, en tarjetas con al menos 16 GB de VRAM para el fichero IQ3_XXS; en Macs con 24 GB o mas de memoria unificada segun el autor.
- Despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/WardenOfPluto/Kerberos-35B-A3B-GGUF:UD-IQ3_XXS`) y LM Studio. No se documentan vLLM ni TGI para este GGUF.
- Parametros de inferencia recomendados por el autor: `--jinja -c 65536 -fa on --temp 0.6 --top-k 20 --top-p 0.95 --min-p 0`.
- Latencia y throughput: no disponibles. Si se documenta que en tareas largas sobre un Mac de 24 GB se agota el tiempo en 33 de 161 intentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la evaluacion del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kerberos 35B-A3B 0.1 | 34,66 B totales / ~3 B activos | 65.536 tokens (configurado) | 61,5% tests del proyecto; 57,8% tests de spec | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.6-35B-A3B (base) | 34,66 B totales / ~3 B activos | mismo que Kerberos | 61,1% tests del proyecto; 56,8% tests de spec | Apache 2.0 | Pesos completos y GGUF de terceros (Unsloth) |
| Modelo frontier de referencia (sin identificar) | no disponible | no disponible | 72% tests del proyecto (un parche por tarea) | no disponible | API en la nube |

No se dispone de datos para comparar con otras alternativas de la misma categoria (ajustes finos orientados a agentes de codigo) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en Python; otros lenguajes solo estan cubiertos por la comprobacion de regresion, con una caida en tool calls (20 de 24 frente a 22 de 24 del base).
- No esta entrenado para escribir especificaciones ni para planificar cambios grandes de forma autonoma; depende de una spec externa.
- La cuantizacion de 3 bits introduce perdida de calidad frente al modelo a precision completa, tanto en el base como en Kerberos.
- En tareas largas sobre un Mac de 24 GB puede agotar el tiempo: 33 de 161 intentos retenidos frente a 51 de 162 del base.
- La mejora medida esta dentro del ruido estadistico (+0,3 puntos, intervalo de -6,2 a +6,9); no debe interpretarse como una ganancia de capacidad demostrada.
- Un intento de los 162 se perdio por un error del arnes de evaluacion (fichero con bytes crudos), ya corregido.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo opera sobre repositorios reales y tests ejecutables, lo que mitiga pero no elimina el riesgo de ediciones incorrectas.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0, permisiva para uso comercial; el autor no impone restricciones adicionales mas alla de las del modelo base.
- Version 0.1 temprana, con descargas y valoraciones nulas en el momento de la consulta; sin benchmark publico con scorer reproducible (anunciado para una version posterior).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WardenOfPluto/Kerberos-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Receta de cuantizacion de referencia (Unsloth, Qwen3.6-35B-A3B UD-IQ3_XXS): no disponible como enlace directo en la informacion proporcionada
- Plataforma de entrenamiento Tinker: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
