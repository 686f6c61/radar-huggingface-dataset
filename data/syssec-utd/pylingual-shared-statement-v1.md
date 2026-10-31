# syssec-utd/pylingual-shared-statement-v1

## Resumen

`syssec-utd/pylingual-shared-statement-v1` es un modelo de lenguaje especializado en código desarrollado por el grupo de investigación syssec-utd (Universidad de Texas en Austin, según la nomenclatura de la organización). Se trata del "backbone" universal de nivel de sentencia (statement) del proyecto PyLingual, un sistema de decompilación de Python. El modelo forma parte de un estudio de arquitectura compartida ("shared-backbone") combinada con adaptadores LoRA por versión de Python, y ha sido entrenado sobre código de las versiones de Python 3.6 a 3.14, dejando la 3.15 como conjunto retenido (held out) para evaluación.

Técnicamente, el modelo parte de la inicialización de `Salesforce/codet5-base`, una arquitectura encoder-decoder basada en T5 con aproximadamente 207 millones de parámetros, y se ajusta finamente (fine-tuning) sobre un dataset codificado de 50.000 ficheros fuente (4.663.180 filas codificadas). Su relevancia reside en el campo de la ingeniería inversa de código Python: recuperar código fuente legible a partir de bytecode, algo especialmente difícil al cubrir simultáneamente muchas versiones del lenguaje. La licencia figura como "other", por lo que conviene revisar los términos exactos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (base, inicializado desde Salesforce/codet5-base) |
| Parametros totales | 207.120.384 |
| Parametros activos | no disponible (no hay indicios de MoE; arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en FP16) |
| Idiomas soportados | Python (versiones 3.6 a 3.14 en entrenamiento; 3.15 retenida) |
| Licencia | other (no especificada en detalle en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia T5, concretamente inicializado desde `Salesforce/codet5-base`, un modelo preentrenado específicamente para tareas de comprensión y generación de codigo. Sobre esta base se realiza un fine-tuning a nivel de sentencia (statement): el modelo procesa unidades de codigo de granularidad de sentencia en lugar de programas completos, lo que sugiere un diseño de dos etapas donde un backbone compartido se especializa mediante LoRA por version de Python.

Los datos de entrenamiento provienen del dataset `syssec-utd/pylingual-shared-encoded-v1` (subconjunto `universal/statement`, revision `0f70ef5`), con 50.000 ficheros fuente de Python que generan 4.663.180 filas codificadas. El entrenamiento consistio en 2 epocas con batch global de 72 (24 por paso, 3 pasos de acumulacion, 1 GPU), learning rate de 2e-05, weight decay de 0.01, precision FP16 y semilla fija 20261020. Todos los hiperparametros y el manifiesto completo de datos se registran en `run/provenance.json`, un detalle destacable de reproducibilidad. No hay indicios de RLHF ni DPO, coherente con su naturaleza de modelo de tarea especifica. El codigo de entrenamiento esta disponible en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `cb0c7b9`.

## Capacidades

- Generacion de sentencias de codigo Python a partir de representaciones intermedias (bytecode/desensamblado codificado), como componente del sistema de decompilacion PyLingual.
- Generalizacion entre versiones de Python 3.6 a 3.14 gracias al entrenamiento "universal" (all-version), sin necesidad de un modelo separado por version.
- Base compatible con adaptadores LoRA por version, lo que permite especializar el backbone para una version concreta de Python sin reentrenar todo el modelo.
- Tokenizador propio incluido en el repositorio (tokenizer.json con hash de verificacion publicado).
- No es un modelo conversacional ni de proposito general: no tiene instrucciones de chat, tool calling ni capacidades multimodales.

## Casos de uso

- Decompilacion de bytecode de Python: componente central para reconstruir codigo fuente legible desde archivos .pyc, util en analisis forense y recuperacion de codigo sin fuentes.
- Auditoria de seguridad de binarios Python: los equipos de seguridad pueden descompilar sentencias para revisar logica oculta en paquetes compilados, detectando codigo malicioso ofuscado.
- Investigacion en ingenieria inversa de lenguajes: sirve como backbone de estudio para tecnicas de shared-backbone + LoRA, replicable con el codigo y datos publicados.
- Migracion y analisis de codigo entre versiones de Python: al cubrir 3.6-3.14, permite analizar bytecode antiguo y moderno con un unico modelo base.
- Construccion de herramientas de analisis estatico: integrable en pipelines que necesiten traducir bytecode a sentencias fuente para linters, detectores de vulnerabilidades o analisis de dependencias.
- Estudios de reproducibilidad en ML aplicado a codigo: el registro exhaustivo de hiperparametros (provenance.json) y el hash del tokenizador lo hacen idoneo como referencia experimental reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de decompilacion, BLEU ni comparaciones con otros sistemas; la evaluacion sobre Python 3.15 (held out) no esta documentada en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 207 millones de parametros en FP16, el modelo ocupa unos 0,4 GB de pesos; con margen para activaciones y contextos de sentencia, 2-4 GB de VRAM son suficientes.
- VRAM estimada para fine-tuning completo: varios GB adicionales; el entrenamiento original se realizo en una unica GPU con batch efectivo de 72 mediante acumulacion, lo que sugiere hardware tipo A100 o similar.
- Consumer GPUs: cabe sobradamente en GPUs de consumo (RTX 3060 de 12 GB, RTX 4090, etc.) para inferencia.
- Despliegue: al ser un modelo T5 en safetensors, funciona con la libreria `transformers` de Hugging Face (`T5ForConditionalGeneration`); no hay evidencia de soporte directo en llama.cpp, Ollama, vLLM o TGI, aunque vLLM y TGI soportan arquitecturas T5 en general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea principal | Licencia |
|---|---|---|---|---|
| syssec-utd/pylingual-shared-statement-v1 | 207,1 M | T5 encoder-decoder | Decompilacion de Python (statement-level) | other |
| Salesforce/codet5-base (base de inicializacion) | ~220 M | T5 encoder-decoder | Comprension/generacion de codigo multi-lenguaje | BSD-3-Clause |
| Salesforce/codet5-large | ~770 M | T5 encoder-decoder | Comprension/generacion de codigo multi-lenguaje | BSD-3-Clause |

El modelo se diferencia de sus analogos en que no es un modelo de codigo de proposito general, sino un especialista en decompilacion de Python entrenado sobre datos codificados especificos del proyecto PyLingual, con cobertura explicita de multiples versiones del lenguaje.

## Limitaciones y advertencias

- Modelo de tarea unica: no sirve como asistente conversacional ni para generacion general de codigo; su salida esta pensada para el pipeline de PyLingual.
- La licencia "other" no esta detallada en la model card; debe verificarse el texto legal antes de uso comercial o redistribucion.
- La version de Python 3.15 se excluyo deliberadamente del entrenamiento, por lo que el rendimiento sobre bytecode de esa version es desconocido.
- No hay benchmarks publicados: no es posible evaluar su calidad de decompilacion con los datos disponibles.
- El repositorio contenia checkpoints intermedios (`last-checkpoint/`) durante el entrenamiento; conviene usar el modelo de la raiz del repositorio (version final).
- Trafico muy bajo (15 descargas, 1 like): modelo de investigacion con probablemente poca validacion comunitaria y riesgo de bugs o comportamientos inesperados fuera de su distribucion de entrenamiento.
- Como todo modelo de decompilacion, puede generar codigo fuente plausible pero semanticamente incorrecto; la salida debe verificarse siempre contra el bytecode original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-statement-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v1
- Repositorio de codigo (rama `feat-shared-backbone-lora`): https://github.com/quinntyx/pylingual
- Modelo base de inicializacion: https://huggingface.co/Salesforce/codet5-base
