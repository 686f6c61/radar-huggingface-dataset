# WeeAIResearch/Qwen3.8-WeeAIResearch-Flash-Next-65B-A6.6B-MAX

## Resumen

Qwen3.8-WeeAIResearch-Flash-Next-65B-A6.6B-MAX es un modelo experimental de generación de texto derivado de Qwen/Qwen3.8-Flash-Next, publicado por WeeAIResearch. No se trata de un modelo entrenado desde cero, sino de un experimento de poda (pruning) y recuperación sobre el modelo base: el autor elimina expertos de la mezcla, restaura posteriormente parte de esa capacidad perdida y aplica destilación de salida guiada por el profesor para acercar las predicciones del modelo podado a las del original. La distribución se hace en un único GGUF de precisión mixta.

La arquitectura es de tipo Mixture of Experts (MoE) con 48 capas y 10 expertos enrutados por capa y token, además de expertos compartidos. El recuento lógico de parámetros no-lookup es de aproximadamente 68,73B (unos 69B), con unos 6,64B activos por token según estimación basada en formas; a ello se suman 51,20B de parámetros lookup, lo que da un total lógico de 119,93B (el dato real de safetensors reporta 121.919.359.360 parámetros). El nombre del repositorio conserva la etiqueta heredada "65B".

Su relevancia es doble: por un lado, documenta de forma inusualmente transparente un proceso de poda y recuperación con artefactos de evaluación publicados; por otro, demuestra que un GGUF de este tamaño puede ejecutarse en CPU con pesos mapeados en memoria (unos 11,3-11,7 GiB de RSS en las pruebas del autor). Como contrapartida, requiere parches propios de llama.cpp y no está establecido que funcione con frontends sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), 48 capas, 10 expertos enrutados por capa y token mas expertos compartidos |
| Parametros totales | 121.919.359.360 (safetensors); recuento logico del autor: 119,93B (68,73B no-lookup + 51,20B lookup) |
| Parametros activos | ~6,64B por token (estimacion basada en formas, excluye filas lookup) |
| Longitud de contexto | No disponible en la informacion proporcionada (las pruebas del autor usaron 1.024 tokens) |
| Tipos de cuantizacion | GGUF de precision mixta con cuatro niveles de cuantizacion; bancos de expertos variables (Q2_K en expertos restaurados, promociones puntuales a Q4, proyeccion de salida en Q6) |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en los metadatos) |
| Formato de pesos | GGUF (fichero unico de 65,16 GB / 60,68 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next, un transformer MoE, y aplica un pipeline de poda y recuperacion en tres fases segun la model card. Primero se restauran 16 expertos originales ausentes, clasificados por ajuste, en cada una de las capas 3 a 47, lo que suma 720 slots restaurados en Q2_K; las tres primeras capas conservan el layout original de 464 expertos y las capas posteriores contienen entre 162 y 337 expertos cada una. Despues se aplican 8 promociones puntuales a Q4 en los puntos donde la precision aporta mas. Por ultimo, se entrena la proyeccion de salida final con los logits del modelo original sobre prefijos de tokens emparejados, y se fusiona como Q6 directamente en el GGUF, sin necesidad de sidecar.

La destilacion se midio sobre 23 estados de Python reservados: la concordancia del top-token con el modelo original paso de 91,3% a 95,7% y la divergencia KL respecto al profesor bajo de 0,214 a 0,116 (reduccion de aproximadamente el 46%). El profesor utilizado es el GGUF original Q4_K_M, no BF16 ni FP16, y la medicion es teacher-forced sobre la proyeccion de salida, no una evaluacion amplia de tareas. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta "conversational" en los metadatos.
- Generacion de codigo en varios lenguajes: las pruebas del autor cubren Python, C# (.NET 10) y TypeScript (con type checking estricto y ejecucion en Node.js).
- Razonamiento multi-paso basico en tareas de programacion con entrada/salida por linea de comandos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de utilidades CLI en Python: el modelo produce programas completos que leen de stdin y escriben en stdout, con manejo de EOF y lineas en blanco; paso 6/6 comprobaciones funcionales en la tarea de reverse-lines del autor.
- Prototipado rapido de aplicaciones de gestion de tareas en C#: genera una CLI de to-do en memoria que compila con .NET 10 y supera las comprobaciones de estado vacio, alta de tareas, comandos desconocidos y salida.
- Generacion de codigo TypeScript con tipado estricto: util para esqueletos de scripts Node.js que deben pasar `tsc` en modo strict antes de integrarse en un pipeline.
- Experimentacion en investigacion sobre poda de MoE: el repositorio publica prompts, salidas sin editar, ficheros fuente, logs de build y resultados de test, lo que permite reproducir y auditar el proceso de recuperacion.
- Inferencia en CPU con memoria unificada limitada: con pesos mapeados en memoria y unos 11,3-11,7 GiB de RSS en ejecuciones cortas, encaja en equipos tipo Apple Silicon de 24 GiB sin GPU dedicada.
- Evaluacion de tecnicas de destilacion de salida: el par (logits del profesor, KL resultante) sirve como caso de estudio para medir cuanto se acerca un modelo podado al original en la proyeccion de salida.
- Despliegue de bajo coste en entornos sin acelerador: al ejecutarse en CPU con llama.cpp parcheado, puede usarse para tareas de generacion de codigo por lotes donde la latencia no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor presenta exclusivamente pruebas funcionales de humo sobre programas generados, que el propio autor califica explicitamente como no benchmarks publicos.

| Prueba funcional | Resultado | Rol en la evaluacion |
|---|---:|---|
| CLI de to-do en C# (en memoria) | 6/6 | Prompt de desarrollo/regresion reutilizado |
| CLI de to-do en Python (en memoria) | 6/6 | Prompt de desarrollo/regresion reutilizado |
| CLI de to-do en TypeScript (en memoria) | 6/6 | Prompt de desarrollo/regresion reutilizado |
| CLI reverse-lines en Python | 6/6 | Prompt de regresion |
| CLI de cuadrados enteros en Python | 6/6 | Prompt nuevo, no usado en ajuste ni seleccion |
| Total | 30/30 | Cinco programas, una generacion greedy cada uno |

| Metrica de destilacion (23 estados de Python reservados) | Antes | Despues |
|---|---:|---:|
| Concordancia de top-token con el modelo original | 91,3% | 95,7% |
| Divergencia KL respecto al profesor | 0,214 | 0,116 |

Condiciones de prueba declaradas: Apple M5 Pro con 24 GiB de memoria unificada, inferencia solo en CPU, contexto de 1.024 tokens, muestreo greedy, llama.cpp parcheado y pesos mapeados en memoria. RSS muestreado de aproximadamente 11,3-11,7 GiB en ejecuciones cortas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que el autor valida la ejecucion en CPU; el fichero GGUF ocupa 65,16 GB / 60,68 GiB en disco.
- Memoria del sistema: las pruebas cortas del autor muestran un RSS de aproximadamente 11,3-11,7 GiB gracias al mapeo en memoria de los pesos, aunque el autor advierte que no es un requisito de residencia completa ni una garantia para otras cargas.
- GPU recomendadas: no disponible en la informacion proporcionada; no se han validado rutas de inferencia en GPU.
- Cabe en GPU de consumo: no disponible; el tamano del fichero (60,68 GiB) excede la VRAM de las GPU de consumo habituales, aunque el mapeo en memoria y la naturaleza MoE podrian permitir estrategias de offload no documentadas.
- Opciones de despliegue: llama.cpp con los parches y las instrucciones de build suministrados por el autor (`runtime/README.md`). llama.cpp estandar y frontends sin modificar no estan establecidos como compatibles. vLLM, TGI, Ollama y LM Studio no estan documentados como soportados para este fichero.
- Latencia y throughput: no disponible en la informacion proporcionada; solo se reporta que las cinco ejecuciones terminaron de forma natural sin crecimiento observable de swap.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeeAIResearch/Qwen3.8-WeeAIResearch-Flash-Next-65B-A6.6B-MAX | 119,93B logicos (68,73B no-lookup), ~6,64B activos | No disponible | qwen-community-1.0 | GGUF de precision mixta | Requiere llama.cpp parcheado; validado en CPU |
| Qwen/Qwen3.8-Flash-Next (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo original sin podar; el autor lo usa como profesor en Q4_K_M |
| lmstudio-community/Qwen3.8-Flash-Next-GGUF | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF | Cuantizacion del modelo base; referencia de comparacion para el GGUF original Q4_K_M |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de las metricas de concordancia y divergencia KL reportadas frente al profesor Q4_K_M.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta como "experimental" y las pruebas presentadas son smoke tests funcionales, no benchmarks; cuatro de los cinco prompts eran tareas de desarrollo o regresion, no evaluaciones independientes.
- Compatibilidad de runtime restringida: usa bancos de expertos variables y cuatro niveles de cuantizacion; llama.cpp estandar y frontends sin modificar no estan establecidos como compatibles, lo que limita el despliegue en produccion.
- Solo ingles: los metadatos declaran unicamente el idioma "en".
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo podado y destilado, la fidelidad respecto al original no esta garantizada fuera de los estados medidos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica; las pruebas se hicieron con 1.024 tokens, muy por debajo de lo habitual en modelos de esta clase.
- Licencia: qwen-community-1.0 (etiquetada como "other" en los metadatos), heredada del modelo base; conviene revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la informacion disponible.
- Recuento de parametros confuso: el nombre del repositorio conserva "65B", la model card habla de ~69B no-lookup y 119,93B logicos, y safetensors reporta 121.919.359.360; el padding de alineacion de cuantizacion queda excluido de los recuentos logicos.
- Cifras de rendimiento acotadas: la mejora de KL y de concordancia de top-token se midio de forma teacher-forced sobre la proyeccion de salida y excluye la cuantizacion de activaciones en runtime; no debe interpretarse como precision general en tareas.
- Adopcion muy baja: 265 descargas y 1 like en el momento de la consulta, sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WeeAIResearch/Qwen3.8-WeeAIResearch-Flash-Next-65B-A6.6B-MAX
- Fichero GGUF principal: https://huggingface.co/WeeAIResearch/Qwen3.8-WeeAIResearch-Flash-Next-65B-A6.6B-MAX/blob/main/Qwen3.8-WeeAIResearch-Flash-Next-69B-A6.6B-MAX-v2.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de referencia del modelo base: https://huggingface.co/lmstudio-community/Qwen3.8-Flash-Next-GGUF
- Instrucciones de runtime y parches de llama.cpp: runtime/README.md (dentro del repositorio del modelo)
- Informe de evaluacion: evaluation/README.md (dentro del repositorio del modelo)
- Resultados legibles por maquina: evaluation/summary.json (dentro del repositorio del modelo)
- Programas generados y tests: evaluation/generated/ (dentro del repositorio del modelo)
- Recuento de parametros: parameter-count.json (dentro del repositorio del modelo)
