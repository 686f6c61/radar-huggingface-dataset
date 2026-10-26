# urakozz/flint-40B-A2.5B-W4A16-g64-AutoRound-GPTQ

## Resumen

`urakozz/flint-40B-A2.5B-W4A16-g64-AutoRound-GPTQ` es una versión cuantizada a 4 bits del modelo `RecursiveSI/flint`, un modelo de lenguaje de arquitectura *mixture-of-experts* (MoE) dispersa desarrollado por Recursive (organización RecursiveSI) y orientado a generación de código y razonamiento agéntico. El checkpoint no lo publica el autor original, sino un tercero (`urakozz`), que aplica AutoRound con esquema W4A16 y exporta en formato `auto_round:auto_gptq` para reducir el peso en disco y memoria de un modelo que, en BF16, ocuparía del orden de 80 GB.

La propuesta del modelo base es inusual: declara unos 40.000 millones de parámetros totales pero solo activa aproximadamente 2.500 millones por token, con 49 capas, 256 expertos y enrutamiento top-6. Esa relación entre parámetros totales y activos es lo que permite, según las fuentes del proyecto, inferencia a más de 125 tokens por segundo en un MacBook Pro con M4 Pro, con ventanas de contexto de hasta 512K tokens en el modelo original.

Esta ficha cubre específicamente el checkpoint cuantizado: un artefacto de 22,4 GB en safetensors, publicado el 26 de octubre de 2026, con licencia Apache 2.0, idioma declarado inglés y soporte únicamente a través de `transformers` con código remoto. A fecha de consulta no registra descargas ni interacciones, por lo que carece de validación comunitaria verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa; 49 capas, 256 expertos, routing top-6 |
| Parametros totales | ~40B (39,8B segun fuentes del modelo base); el campo safetensors del repo declara 6.221.131.552, una discrepancia no explicada en la informacion disponible |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | Hasta 512K tokens segun fuentes del modelo base; no confirmado en la model card de este checkpoint. Existe una conversion GGUF comunitaria a 128K |
| Tipos de cuantizacion | W4A16 (pesos INT4 simetrico, activaciones 16-bit), group size 64, export `auto_round:auto_gptq`. Router de expertos de las capas 2-48 retenido en 16 bits. Conversion GGUF de terceros disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con empaquetado GPTQ/AutoRound; GGUF comunitario |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso de 49 capas con 256 expertos por capa y enrutamiento top-6, lo que implica que cada token pasa por seis expertos de los 256 disponibles. Con unos 39.800 millones de parametros totales y unos 2.500 millones activos por token, el coste computacional por token se aproxima al de un modelo denso de ~2,5B, mientras que la capacidad almacenada corresponde a un modelo de ~40B. Las fuentes del proyecto mencionan tambien un kernel Metal propio y un motor de inferencia especifico, lo que sugiere que el rendimiento declarado en hardware Apple depende de tooling dedicado y no unicamente de implementaciones genericas.

Sobre el entrenamiento no hay datos en la informacion disponible: no se especifican el numero de tokens, la composicion del corpus ni si hubo RLHF, DPO u otra fase de alineamiento. La model card del checkpoint cuantizado solo documenta el proceso de cuantizacion, no el preentrenamiento.

La innovacion tecnica documentada en este repositorio es la receta de cuantizacion: AutoRound con calibracion sobre `opencode-instruct` (512 muestras de 2.048 tokens, 200 iteraciones de optimizacion), pesos fuente en BF16, INT4 simetrico con grupo de 64 y preservacion en 16 bits de las compuertas del router de las capas 2 a 48, una precaucion habitual para no degradar el enrutamiento de expertos, que es especialmente sensible a la cuantizacion en modelos MoE con 256 expertos.

## Capacidades

- Generacion de texto y razonamiento general en ingles.
- Generacion y edicion de codigo, con enfasis en escenarios de programacion agentica segun la documentacion del modelo base.
- Razonamiento multi-paso y flujos agenticos, apoyado en la ventana de contexto extendida del modelo original (hasta 512K tokens en las fuentes consultadas).
- Ruta de decodificacion de alto rendimiento en hardware Apple mediante kernel Metal, segun las fuentes del proyecto (>125 tok/s en M4 Pro).
- Capacidades multilingues limitadas: el unico idioma declarado es el ingles.
- No hay informacion disponible sobre soporte de tool calling / function calling nativo, vision, audio, modo *thinking* explicito ni otras capacidades especiales en la documentacion proporcionada.

## Casos de uso

- Asistente de programacion en local: el checkpoint W4A16 ocupa unos 20-22 GB, de modo que puede cargarse en una unica GPU de 24 GB o en un equipo con memoria unificada amplia, permitiendo autocompletado y refactorizacion sin enviar codigo a servicios externos.
- Agente de codigo sobre repositorios grandes: la ventana de contexto heredada del modelo base (hasta 512K tokens) hace viable indexar varios ficheros o un modulo completo en una sola pasada para tareas de auditoria y migracion.
- Generacion de tests y parches en pipelines de CI: el modelo puede invocarse desde un runner para producir parches candidatos o casos de prueba sobre los ficheros modificados en un *pull request*; requiere validacion automatizada posterior, dado el riesgo de alucinacion.
- Despliegue en hardware de consumo para prototipado: con ~2,5B parametros activos por token, el coste por token es bajo comparado con un denso de 40B, lo que permite iterar en una RTX 4090 o en un Mac con memoria unificada.
- Analisis de documentacion tecnica extensa en ingles: resumen y extraccion de contratos de API, esquemas y guias a partir de lotes de documentos que no caben en ventanas de 32K-128K.
- Servicio interno de bajo volumen en ingles: al ser Apache 2.0, puede alojarse en infraestructura propia para soporte a desarrolladores (explicacion de errores de compilacion, dudas de API) sin coste de licencia.
- Base para *fine-tuning* o para evaluacion comparativa de recetas de cuantizacion: el checkpoint sirve como referencia de como afecta W4A16 con group size 64 a la calidad de un MoE de 256 expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes consultadas mencionan una puntuacion de 54,9 % sin especificar a que benchmark corresponde, por lo que no se reproduce como dato comparable. Tampoco se documentan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad tras la cuantizacion.

El unico dato de rendimiento concreto que aparece en las fuentes es la velocidad de mas de 125 tokens por segundo en un MacBook Pro con M4 Pro para el modelo base, medida que depende del motor de inferencia y del kernel Metal propios y que no se ha verificado para este checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en W4A16 de un modelo de ~40B ocupan aproximadamente 20-22 GB (el repositorio suma 22,4 GB), a lo que hay que anadir cache KV, overhead del runtime y el estado en 16 bits del router; en la practica, 24 GB de VRAM es el minimo ajustado.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S 48 GB para contextos largos y concurrencia; RTX 4090 / RTX 5090 (24-32 GB) solo con contexto moderado y una unica peticion.
- Cabe en GPU de consumo: si, en RTX 4090 de 24 GB con contexto limitado; los modelos base declaran ejecucion en Apple Silicon (M4 Pro) gracias al kernel Metal del proyecto.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y una build con soporte de la arquitectura Flint; el soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado en la informacion disponible. Existe una conversion GGUF comunitaria (`Makdok/Flint-40B-A2.5B-24GB-128k-GGUF`) para runtimes tipo llama.cpp, con contexto reducido a 128K.
- Latencia y throughput: no disponibles para este checkpoint. Como referencia del modelo base, >125 tok/s en M4 Pro; en GPU no hay cifras publicadas.

## Comparativa con modelos similares

Candidatos de la misma categoria (MoE con pocos parametros activos, orientados a codigo en local): Qwen3-Coder-30B-A3B, GPT-OSS-20B y Devstral-Small-2507. Los valores de esas alternativas no proceden de las fuentes de esta busqueda y se incluyen solo como referencia de conocimiento general; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros (total / activos) | Contexto | Licencia | Formato |
|---|---|---|---|---|
| flint-40B-A2.5B (este checkpoint) | ~40B / ~2,5B | hasta 512K (modelo base) | Apache 2.0 | Safetensors W4A16 GPTQ; GGUF comunitario |
| RecursiveSI/flint (base, BF16) | ~40B / ~2,5B | hasta 512K | Apache 2.0 | Safetensors BF16 |
| Qwen3-Coder-30B-A3B | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |
| GPT-OSS-20B | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |
| Devstral-Small-2507 | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |

## Limitaciones y advertencias

- Solo ingles declarado: no hay soporte oficial de castellano ni de otros idiomas en la model card.
- Riesgo de alucinacion estandar en generacion de codigo: el modelo puede producir APIs o funciones inexistentes; cualquier salida debe pasar por compilacion y tests.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento ni sobre evaluaciones de sesgo, por lo que no pueden descartarse sesgos de dominio (codigo occidental, licencias permisivas, estilo de documentacion concreto).
- La calibracion de la cuantizacion se hizo sobre `opencode-instruct`, un dataset centrado en codigo; es esperable una degradacion mayor en tareas de texto general tras el proceso W4A16, aunque no se han publicado mediciones.
- Requiere `trust_remote_code=True` y una version de `transformers` con soporte de la arquitectura Flint: es una dependencia fragil y un vector de riesgo de seguridad si no se audita el codigo remoto.
- Compatibilidad de runtimes no confirmada: vLLM, TGI y llama.cpp no estan verificados para el formato `auto_round:auto_gptq` de este checkpoint; el GGUF disponible es una conversion de terceros, no oficial.
- Discrepancia de datos: el campo `safetensors` del repositorio declara 6.221.131.552 parametros, frente a los ~40B del nombre y de las fuentes. Verificar el contenido real de los ficheros antes de dimensionar infraestructura.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; es un artefacto nuevo, sin reportes independientes de calidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el repositorio del modelo base por si el autor original anade terminos adicionales de uso aceptable.
- Fecha de publicacion declarada como 26 de octubre de 2026, posterior a otras referencias del ecosistema; conviene confirmar la vigencia del repositorio y de las versiones de dependencias citadas.
- El checkpoint no incluye cifras de rendimiento propias: no se puede garantizar el throughput declarado para el modelo base en este formato cuantizado.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/urakozz/flint-40B-A2.5B-W4A16-g64-AutoRound-GPTQ
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- Dataset de calibracion (NVIDIA OpenCodeInstruct): https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Conversion GGUF comunitaria (24 GB, 128K): https://huggingface.co/Makdok/Flint-40B-A2.5B-24GB-128k-GGUF
- Ficha del modelo en There's An AI For That: https://theresanaiforthat.com/model/flint-40b-a2-5b/
- Analisis en OrcaRouter: https://www.orcarouter.ai/blog/flint-40b-a2-5b-local-coding
- Analisis en cellcog.ai: https://cellcog.ai/blog/recursive-flint/
