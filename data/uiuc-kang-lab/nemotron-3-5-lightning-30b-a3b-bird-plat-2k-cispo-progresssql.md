# uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ProgressSQL

## Resumen

Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ProgressSQL es un adaptador LoRA de rango 32 publicado por el grupo uiuc-kang-lab sobre el modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, un transformer de tipo Mixture-of-Experts con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token. El adaptador esta especializado en text-to-SQL y se ha entrenado con aprendizaje por refuerzo (CISPO) sobre el conjunto BIRD Platinum, con 2.000 ejemplos de entrenamiento, utilizando la infraestructura Tinker.

El problema que aborda es la traduccion de preguntas en lenguaje natural a consultas SQL ejecutables y correctas sobre esquemas de bases de datos reales, un escenario donde los modelos genericos suelen fallar por falta de alineacion con el esquema y por errores de ejecucion. El checkpoint publicado corresponde al mejor paso segun la precision en el split de desarrollo de BIRD, lo que sugiere una seleccion orientada a metrica de validacion y no solo a perdida de entrenamiento.

Su relevancia es acotada pero clara: es un artefacto de investigacion que demuestra la aplicacion de RL con CISPO sobre un modelo MoE de gran tamano para una tarea estructurada, y sirve como referencia para quien quiera reproducir o extender el pipeline. No es un modelo autónomo: requiere cargar el modelo base NVIDIA y aplicar el adaptador PEFT, y el repositorio solo contiene los pesos del adaptador (1,5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base Nemotron-3.5-Lightning-30B-A3B); adaptador LoRA de rango 32 |
| Parametros totales | 30B en el modelo base; el adaptador LoRA ocupa 1,5 GB en disco |
| Parametros activos | Aproximadamente 3B por token (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el modelo base en BF16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, un modelo de arquitectura Mixture-of-Experts con 30B parametros totales y unos 3B activos por token, lo que reduce el coste computacional de inferencia frente a un denso equivalente. El adaptador es un LoRA de rango 32 entrenado con la libreria PEFT, por lo que solo modifica un subconjunto de pesos y requiere el modelo base para funcionar.

El entrenamiento se realizo con CISPO, una variante de optimizacion por politica con refuerzo, sobre el conjunto BIRD Platinum con 2.000 ejemplos de entrenamiento, empleando la plataforma Tinker. El checkpoint publicado es el mejor paso segun la precision en el split de desarrollo de BIRD (batch000160, segun la ruta de Tinker). No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens vistos ni si hubo etapas previas de SFT antes del RL.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural (text-to-SQL) sobre esquemas de bases de datos, especialidad principal del adaptador.
- Razonamiento sobre esquemas: el entrenamiento en BIRD Platinum esta orientado a preguntas que requieren interpretar tablas, columnas y relaciones.
- Capacidades heredadas del modelo base Nemotron-3.5-Lightning-30B-A3B: generacion de texto, razonamiento y codigo en general, aunque no se documentan en esta ficha.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este adaptador.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de SQL en asistentes de analitica: el adaptador traduce preguntas de negocio a consultas SQL sobre un esquema dado, aprovechando el entrenamiento especifico en BIRD Platinum para preguntas que requieren joins y filtros no triviales.
- Evaluacion de pipelines text-to-SQL: sirve como punto de comparacion reproducible para medir el efecto de RL con CISPO frente a SFT u otras variantes sobre el mismo modelo base.
- Investigacion en RL para tareas estructuradas: el checkpoint y la configuracion (Tinker, CISPO, BIRD) permiten reproducir y extender experimentos de alineacion con recompensa basada en ejecucion.
- Prototipado de interfaces de consulta en lenguaje natural: integrado en una capa de aplicacion que valide y ejecute la SQL generada contra una base de datos de solo lectura.
- Fine-tuning posterior: al ser un adaptador LoRA, puede combinarse o continuarse con otros adaptadores sobre el mismo modelo base para dominios SQL especificos.
- Docencia y formacion: ejemplo practico de como se aplica un adaptador PEFT sobre un MoE de 30B para una tarea concreta, con trazabilidad del run de W&B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el checkpoint es el mejor paso segun la precision en el split de desarrollo de BIRD, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 30B parametros; en BF16 requiere aproximadamente 60 GB solo para pesos, mas overhead de activaciones y cache KV. El adaptador LoRA anade un coste marginal.
- Cuantizacion: en 8 bits se estiman unos 30-32 GB; en 4 bits, unos 16-18 GB, dependiendo del backend y de la implementacion MoE.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; en consumer GPU, una RTX 4090 de 24 GB solo es viable con cuantizacion agresiva (4 bits) y posibles descargas parciales a CPU.
- Despliegue: vLLM, TGI o llama.cpp para el modelo base con el adaptador fusionado o cargado via PEFT; Ollama si se dispone de una version GGUF del modelo base con el adaptador fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ProgressSQL | 30B (3B activos) + LoRA r32 | No disponible | Text-to-SQL (BIRD) | No disponible | Hugging Face (adaptador) |
| Modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B (3B activos) | No disponible | Generico | No disponible | Hugging Face |
| Otros adaptadores text-to-SQL sobre el mismo base | No disponible | No disponible | Text-to-SQL | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 para funcionar.
- Entrenado sobre BIRD Platinum con solo 2.000 ejemplos: el dominio esta acotado a text-to-SQL y puede generalizar mal fuera de ese tipo de esquemas y preguntas.
- Riesgo de alucinacion en SQL: puede generar columnas o tablas inexistentes; es imprescindible validar y ejecutar las consultas antes de usarlas en produccion.
- Sesgos: no documentados en la informacion disponible; hereda los del modelo base y los del dataset BIRD.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base y del adaptador antes de desplegarlo.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento en castellano u otros idiomas distintos del ingles.
- Sin datos publicos de benchmarks: no hay evidencia cuantitativa de mejora frente a alternativas en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes: artefacto de investigacion reciente, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ProgressSQL
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Run de W&B: `ddkang-uiuc-rl-generalization/tinker-sql/bwfpfbu2` (no se proporciona URL directa)
- Checkpoint Tinker: `tinker://8be71be6-d5d8-56ee-8fc2-ee52798e2f6c:train:0/weights/batch000160`
