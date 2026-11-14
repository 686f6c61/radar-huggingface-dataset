# uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-FineStep

## Resumen

Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-FineStep es un adaptador LoRA de rango 32 publicado por el grupo uiuc-kang-lab sobre el modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. No se trata de un modelo completo, sino de un ajuste fino orientado a text-to-SQL entrenado mediante aprendizaje por refuerzo con el algoritmo CISPO sobre el conjunto de datos BIRD Platinum (2.000 ejemplos de entrenamiento), usando la infraestructura Tinker. El checkpoint publicado corresponde al mejor paso según la precisión en el split de desarrollo de BIRD.

El modelo base es un Nemotron 3.5 Lightning con arquitectura de mezcla de expertos (MoE) de 30.000 millones de parámetros totales y 3.000 millones activos por token, según se deduce de la nomenclatura A3B del identificador. El adaptador hereda esa arquitectura y añade una especialización en la traducción de lenguaje natural a SQL, un dominio donde el razonamiento estructurado y la fidelidad al esquema de la base de datos son críticos.

La relevancia de esta publicación es doble: por un lado, demuestra la aplicación de RL con CISPO a tareas de generación de SQL sobre un modelo MoE grande; por otro, al distribuirse únicamente como adaptador PEFT (1,5 GB), permite reproducir el ajuste sin necesidad de redistribuir los pesos completos del modelo base. La información pública disponible es muy limitada: no hay licencia declarada, ni idiomas especificados, ni resultados de benchmarks publicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer MoE (modelo base Nemotron-3.5-Lightning-30B-A3B) |
| Parametros totales | 30B en el modelo base; tamano del adaptador no disponible (repo de 1,5 GB) |
| Parametros activos | 3B en el modelo base (MoE, nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, un transformer de mezcla de expertos con 30.000 millones de parametros totales y 3.000 millones activos. El ajuste consiste en un LoRA de rango 32 entrenado con PEFT. El entrenamiento se realizo con CISPO (un algoritmo de optimizacion por refuerzo) sobre BIRD Platinum, un subconjunto de 2.000 ejemplos de entrenamiento del benchmark BIRD de text-to-SQL, utilizando la plataforma Tinker. El checkpoint publicado es el mejor paso segun la precision en el split de desarrollo de BIRD, identificado como `batch000010` en el almacenamiento de Tinker.

No se dispone de informacion sobre el numero total de tokens vistos, la composicion exacta del dataset, hiperparametros de RL (tasa de aprendizaje, coeficiente KL, tamano de batch), ni sobre si se aplicaron etapas previas de SFT. Tampoco se detalla que modulos del transformer reciben el adaptador (attention, MLP o ambos). La unica innovacion tecnica documentada es el uso de CISPO como algoritmo de RL para la tarea de generacion de SQL.

## Capacidades

- Generacion de SQL a partir de lenguaje natural (text-to-SQL), especialidad principal del adaptador.
- Razonamiento sobre esquemas de bases de datos, inferencia de joins y agregaciones, segun la tarea BIRD.
- Aprendizaje por refuerzo orientado a mejorar la precision de ejecucion en BIRD dev.
- Capacidades generales del modelo base (generacion de texto, razonamiento, codigo) potencialmente preservadas, aunque no documentadas en la model card.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Generacion de consultas SQL en entornos analiticos: el adaptador traduce preguntas en lenguaje natural a SQL sobre esquemas relacionales, aprovechando el entrenamiento especifico en BIRD Platinum para consultas con joins y agregaciones.
- Asistentes de business intelligence: integrado en una herramienta de BI, permite a usuarios no tecnicos formular preguntas sobre datos y obtener SQL ejecutable, reduciendo la dependencia de analistas.
- Evaluacion de pipelines text-to-SQL: sirve como referencia para comparar estrategias de RL (CISPO frente a PPO/DPO) en la tarea BIRD, dado que el checkpoint corresponde al mejor paso en dev.
- Investigacion en RL para generacion de codigo estructurado: el adaptador y su configuracion en Tinker permiten reproducir el ajuste y estudiar la generalizacion del RL en modelos MoE.
- Automatizacion de consultas sobre bases de datos internas: con el esquema adecuado en el prompt, el modelo puede generar consultas para tareas repetitivas de reporting.
- Prototipado rapido de interfaces de consulta en lenguaje natural: al ser un adaptador ligero (1,5 GB), se puede cargar sobre el modelo base en entornos de investigacion sin redistribuir pesos completos.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para ajustes adicionales en dominios SQL especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el checkpoint es el mejor paso segun la precision en BIRD dev, sin cifras concretas.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base completo (30B parametros, 3B activos) en BF16, lo que implica aproximadamente 60 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: A100 80 GB, H100 80 GB o multiples GPU consumer con paralelismo. No se especifican requisitos oficiales.
- En consumer GPU: no cabe en una sola GPU de 24 GB en BF16; seria necesario cuantizar el modelo base (por ejemplo, a 4 bits) o usar offloading, con el correspondiente impacto en latencia.
- Opciones de despliegue: al ser un adaptador PEFT, se puede fusionar con el modelo base y servir con vLLM, TGI o llama.cpp (tras conversion a GGUF). La compatibilidad exacta no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-FineStep | 30B (3B activos) + LoRA r32 | no disponible | Text-to-SQL (BIRD) | no disponible | Hugging Face (adaptador) |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B (3B activos) | no disponible | Proposito general | no disponible | Hugging Face (modelo base) |
| Otros adaptadores text-to-SQL sobre Nemotron | no disponible | no disponible | Text-to-SQL | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con modelos text-to-SQL de referencia (por ejemplo, variantes de CodeLlama o Qwen ajustadas a BIRD) en terminos de rendimiento, ya que no se publican cifras.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 para funcionar.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o revisar la licencia del modelo base.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa del rendimiento mas alla de la seleccion del checkpoint por precision en BIRD dev.
- Especializado en text-to-SQL: el ajuste con RL sobre BIRD puede degradar capacidades generales del modelo base (olvido catastrofico), aunque no se documenta.
- Riesgo de alucinacion en esquemas: como todo modelo generativo de SQL, puede inventar tablas o columnas no presentes en el esquema.
- Sesgos: no documentados; el dataset BIRD puede introducir sesgos hacia ciertos dominios o dialectos SQL.
- Idiomas: no especificados; probablemente orientado a ingles por la naturaleza de BIRD.
- Reproducibilidad limitada: la referencia a Tinker y W&B no garantiza acceso publico a los detalles del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-FineStep
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- W&B run (referenciado en la model card): ddkang-uiuc-rl-generalization/tinker-sql/prvg2j09 (no se proporciona URL directa)
- Tinker (plataforma de entrenamiento): no se proporciona URL en la informacion disponible
- Benchmark BIRD: no se proporciona URL en la informacion disponible
