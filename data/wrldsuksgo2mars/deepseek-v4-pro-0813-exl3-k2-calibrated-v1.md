# wrldsuksgo2mars/DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1

## Resumen

DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1 es un checkpoint cuantizado del modelo de lenguaje DeepSeek-V4-Pro-0813, desarrollado por el usuario wrldsuksgo2mars. Se trata de una conversión completa al formato EXL3 K2, que emplea codificaciones trellis de 2 bits para los pesos de los expertos enrutados, manteniendo los pesos densos y compartidos en su precisión original. El modelo base, creado por DeepSeek AI, es una arquitectura de mezcla de expertos (MoE) con 61 capas base y tres bloques nativos de decodificación especulativa dSpark, orientada a tareas agénticas y de razonamiento en entornos de producción.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 230,7 mil millones de parámetros en configuraciones de hardware mucho más reducidas que las necesarias para el modelo original en precisión completa, gracias a la cuantización de 2 bits. El autor ha realizado un proceso de calibración determinista sobre un corpus de 1,4 millones de prompts y ha validado el resultado en un entorno de producción con DGX Spark, reportando una tasa de aceptación de tokens del 65,26% en el módulo dSpark y una puntuación de 79/100 en Tool Eval Bench. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados y compartidos, 61 capas base y 3 bloques dSpark de decodificacion especulativa |
| Parametros totales | 230.692.478.474 (~230,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K2 (codificacion trellis, ~2 bits por peso, segun tag "2-bit") |
| Idiomas soportados | no disponible (el corpus de calibracion incluye ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 K2, 51 shards, 297.238 tensores, 407,57 GiB de payload) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro-0813 es un transformer de mezcla de expertos con 61 capas base y tres bloques integrados de decodificacion especulativa dSpark. Cada bloque dSpark incorpora un modulo de generacion especulativa que acelera la inferencia. La arquitectura incluye expertos enrutados y compartidos, aunque no se han publicado los parametros activos ni el detalle de las capas de atencion en la informacion disponible.

Este checkpoint no es un reentrenamiento, sino una cuantizacion del modelo original. El proceso de calibracion reproducido por el autor utilizo un corpus fijo y determinista de 1.426 prompts, con aproximadamente 1,081 millones de tokens en ingles, chino, codigo, razonamiento, instrucciones y salida estructurada, pasados a traves de los routers aprendidos reales. Los expertos con menor cobertura se aumentaron deterministicamente desde los rangos de router 7-12 hasta un objetivo de 1.024 filas. La cuantizacion se ejecuto capa por capa con Hessianos acotados de dos RTX, captura y reproduccion por lotes reanudable, y validacion numerica por proyeccion. No se utilizo computo Spark durante el proceso.

## Capacidades

- Generacion de texto y razonamiento complejo de multiples pasos, con soporte de modo de razonamiento maximo segun la evaluacion de DeepSeek Harness.
- Capacidades agénticas avanzadas: resolucion de tareas de terminal, desarrollo full-stack, automatizacion de flujos de trabajo y navegacion de repositorios, segun los benchmarks del modelo base.
- Soporte de tool calling y function calling, validado en el checkpoint cuantizado con Tool Eval Bench (79/100).
- Generacion de codigo y refactorizacion, con buenos resultados en tareas de ingenieria de software como DeepSWE y NL2Repo.
- Decodificacion especulativa integrada (dSpark) que acelera la inferencia; en la validacion del checkpoint acepto el 65,26% de los tokens redactados.
- Soporte multilingue limitado a ingles y chino segun el corpus de calibracion; no hay lista oficial de idiomas en la informacion disponible.

## Casos de uso

- Agentes autonomos de desarrollo de software: el modelo puede resolver issues de repositorios, generar parches y ejecutar tareas de integracion continua. Su rendimiento en DeepSWE (62,7) y DSBench-FullStack (71,1) lo hace adecuado para pipelines de desarrollo automatizado con herramientas de control de versiones.
- Automatizacion de operaciones de terminal y sistemas: gracias a su puntuacion de 87,9 en Terminal Bench 2.1, puede ejecutar comandos, interpretar salidas y gestionar tareas administrativas en entornos Linux, integrandose con frameworks de agente como DeepSeek Harness.
- Asistente de programacion en produccion: con soporte de tool calling y una ventana de contexto amplia (no especificada), puede integrarse en IDEs o CLIs para generar codigo, explicar fragmentos y refactorizar proyectos, especialmente en entornos con GPUs de alta capacidad.
- Analisis de seguridad ofensiva y defensiva: su resultado de 83,3 en Cybergym indica capacidad para interactuar con entornos de ciberseguridad, como simulaciones de ataques o analisis de vulnerabilidades, usando herramientas externas.
- Razonamiento cientifico y matematico con herramientas: en HLE con herramientas alcanza 60,0, lo que permite resolver problemas complejos de nivel de investigacion combinando calculo simbolico, busqueda web y ejecucion de codigo.
- Automatizacion de tareas de oficina y flujos de trabajo empresariales: con 74,1 en Toolathlon-Verified, puede manejar APIs, bases de datos y servicios web en secuencias multi-paso, adecuado para bots de automatizacion de procesos (RPA) y asistentes de back-office.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base DeepSeek-V4-Pro-0813, evaluado por DeepSeek con el framework DeepSeek Harness en modo minimo, con esfuerzo de razonamiento maximo, temperatura 1,0 y top_p 0,95. No se han publicado benchmarks independientes para el checkpoint cuantizado EXL3.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack | 71,1 | 68,7 | 41,8 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard | 67,2 | 59,6 | 31,1 | 54,5 | 63,0 | 71,7 | 68,3 |

Nota: DSBench-FullStack y DSBench-Hard son conjuntos de prueba internos de DeepSeek. Para el checkpoint cuantizado, el autor reporta una validacion propia: Tool Eval Bench 79/100 (109/138 puntos brutos) y una tasa de aceptacion dSpark del 65,26%.

## Requisitos de hardware

- El checkpoint ocupa 437,7 GB en disco (51 shards safetensors). Con cuantizacion de ~2 bits, los pesos en memoria se estiman en torno a 60 GB (230,7 mil millones de parametros × 2 bits / 8), mas overhead de activaciones y cache KV.
- Se requiere un minimo de 80 GB de VRAM para cargar el modelo en una sola GPU, por lo que una NVIDIA A100 80GB o H100 80GB seria el punto de entrada. En configuraciones de 2 bits podria caber en una GPU de 80 GB, pero con margen limitado.
- Para inferencia con mayor throughput se recomienda multiples GPUs: por ejemplo, 4× RTX 4090 (24 GB cada una) o 2× A100 80GB en paralelo de tensor.
- La validacion del autor se realizo con un coordinador RTX y cuatro rangos de expertos DGX Spark TP4, lo que indica que el despliegue objetivo son sistemas multi-GPU con memoria unificada de gran capacidad.
- Opciones de despliegue: ExLlama v3 (formato EXL3 nativo) y DS4RT, el runtime utilizado en la validacion. No es compatible directamente con vLLM o SGLang en sus ejemplos de lanzamiento para pesos nativos, segun advierte el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks anterior permite comparar DeepSeek-V4-Pro-0813 con alternativas de la misma categoria (modelos de razonamiento y agentes de alto rendimiento). No se dispone de datos de parametros, contexto o licencia para GLM-5.2, Kimi K3, Opus-4.8 y Fable-5 en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Punto fuerte |
| :--- | :--- | :--- | :--- | :--- |
| DeepSeek-V4-Pro-0813 (base) | 230,7B (total, MoE) | no disponible | MIT | Agentes y codigo, equilibrio general |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Version ligera, menor rendimiento en agentes |
| Kimi K3 | no disponible | no disponible | no disponible | Superior en DeepSWE (67,5) y Agents' Last Exam (27,6) |
| Opus-4.8 | no disponible | no disponible | no disponible | Superior en HLE y NL2Repo, pero inferior en Terminal Bench |
| Fable-5 | no disponible | no disponible | no disponible | Mejor en casi todos los benchmarks, con fallback |

El checkpoint EXL3 K2 cuantizado mantiene las capacidades del modelo base con una degradacion esperada por la cuantizacion de 2 bits, aunque el autor no publica comparativas directas entre el checkpoint y el modelo original en los benchmarks estandar.

## Limitaciones y advertencias

- La cuantizacion de 2 bits puede degradar la calidad de salida en tareas de razonamiento complejo o generacion de codigo de alta precision en comparacion con el modelo original en fp8 o bf16.
- No se dispone de la longitud de contexto maxima soportada, por lo que no se puede garantizar el comportamiento en ventanas largas.
- El corpus de calibracion es limitado (1.426 prompts) y podria no cubrir todos los dominios, lo que puede afectar a la fidelidad de la cuantizacion en areas fuera de ese corpus.
- El modelo base, al ser un LLM generico, puede presentar sesgos y alucinaciones. No se han publicado evaluaciones especificas de sesgo o seguridad para este checkpoint.
- El formato EXL3 K2 es especifico de ExLlama v3; no es compatible con vLLM o SGLang en sus configuraciones estandar, lo que limita las opciones de despliegue en infraestructuras existentes.
- Aunque la licencia MIT permite uso comercial, el modelo base es propiedad de DeepSeek AI y su uso en produccion debe revisar los terminos de la licencia original y las politicas de uso aceptable de DeepSeek.
- Los benchmarks citados corresponden al modelo base, no al checkpoint cuantizado; el rendimiento real del EXL3 K2 puede variar.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Pro-0813-EXL3-K2-calibrated-v1
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Pagina oficial de DeepSeek: https://deepseek.com/en/index.html
- Chat de DeepSeek: https://chat.deepseek.com/
