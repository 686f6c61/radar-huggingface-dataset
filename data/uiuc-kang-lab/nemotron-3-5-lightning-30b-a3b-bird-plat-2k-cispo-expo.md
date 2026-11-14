# uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-Expo

## Resumen

Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-Expo es un adaptador LoRA de rango 32 publicado por el laboratorio uiuc-kang-lab sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un transformer de tipo mezcla de expertos (MoE) con 30.000 millones de parámetros totales y 3.000 millones activos por token. El adaptador está especializado en text-to-SQL y se ha entrenado con aprendizaje por refuerzo (CISPO) sobre el conjunto BIRD Platinum, con 2.000 ejemplos de entrenamiento, utilizando la infraestructura Tinker.

El modelo resuelve el problema de traducir preguntas en lenguaje natural a consultas SQL ejecutables sobre esquemas de bases de datos reales, un caso de uso crítico en analítica de datos y asistentes de BI. Frente a un ajuste supervisado clásico, el uso de RL con CISPO sobre un subconjunto relativamente pequeño de BIRD Platinum busca optimizar directamente la métrica de ejecución (execution accuracy) en lugar de la similitud textual con la consulta de referencia.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de nicho con muy poca información pública (0 descargas, 0 likes en el momento de la consulta); por otro, sirve como ejemplo de flujo de trabajo PEFT + RL aplicado a un modelo MoE grande, donde el adaptador ocupa solo 1,5 GB frente a los pesos completos en BF16 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer MoE (modelo base Nemotron-3.5-Lightning-30B-A3B) |
| Parametros totales | 30B en el modelo base; tamano del adaptador no disponible (repo de 1,5 GB) |
| Parametros activos | 3B en el modelo base (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo MoE con 30B parámetros totales y 3B activos. El adaptador LoRA tiene rango 32 y se ha entrenado con PEFT, por lo que solo modifica un subconjunto de matrices del modelo base. El checkpoint publicado corresponde al mejor paso según la precisión en el split de desarrollo de BIRD (`batch000230` según la ruta de Tinker).

El entrenamiento utiliza CISPO (un algoritmo de optimización por refuerzo) sobre BIRD Platinum con 2.000 ejemplos de entrenamiento, ejecutado mediante Tinker. La model card no detalla la composición exacta del dataset, la función de recompensa, el número de tokens vistos ni si hubo fases previas de SFT. Tampoco se especifican hiperparámetros de RL como la tasa de aprendizaje, el tamaño de lote o la longitud máxima de secuencia.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural (text-to-SQL) sobre esquemas de bases de datos.
- Especialización en el benchmark BIRD, orientado a bases de datos reales con esquemas complejos y preguntas que requieren razonamiento sobre el esquema.
- Ajuste fino vía LoRA: requiere cargar el modelo base y aplicar el adaptador con PEFT.
- Capacidades heredadas del modelo base (generación de texto, razonamiento, código) no documentadas en esta model card; no disponible.
- Soporte de tool calling, agentes, multilingüismo o modos especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de analítica self-service: el adaptador traduce preguntas de negocio en SQL ejecutable sobre el esquema de un data warehouse, lo que permite a usuarios no técnicos consultar datos sin escribir consultas manualmente.
- Generación de SQL en pipelines de BI: integrado en una herramienta de BI, el modelo puede proponer consultas que luego se validan y ejecutan contra la base de datos, reduciendo el tiempo de creación de informes.
- Evaluación y mejora de esquemas: dado un esquema y una pregunta, el adaptador genera SQL que sirve como borrador para que un analista lo revise, acelerando tareas de exploración de datos.
- Benchmarking interno de text-to-SQL: al estar entrenado sobre BIRD Platinum, es útil como referencia para comparar pipelines de generación de SQL en entornos con esquemas reales.
- Automatización de consultas recurrentes: para preguntas frecuentes sobre un dominio concreto, el adaptador puede generar plantillas SQL que se parametrizan y reutilizan en procesos batch.
- Investigación en RL para código: sirve como ejemplo reproducible de entrenamiento CISPO sobre un modelo MoE grande con Tinker, útil para estudiar la generalización de RL en tareas de text-to-SQL.
- Formación y prototipado: al ser un adaptador ligero (1,5 GB), permite experimentar con text-to-SQL sin desplegar los pesos completos del modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el checkpoint se seleccionó por la mejor precisión en el split de desarrollo de BIRD, sin cifras concretas.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,5 GB en disco; el modelo base en BF16 requiere aproximadamente 60 GB de VRAM para inferencia sin cuantizar.
- GPU recomendadas para el modelo base en BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- En GPUs de consumo (RTX 4090 24 GB) no cabe el modelo base en BF16; sería necesario cuantizar el modelo base (por ejemplo, a 4 bits) y aplicar el adaptador sobre la versión cuantizada, lo que puede degradar la calidad del adaptador.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI o llama.cpp para servir el modelo base, siempre que soporten la carga de adaptadores LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-Expo | 30B (3B activos) + LoRA r32 | no disponible | Text-to-SQL (BIRD) | no disponible | Hugging Face (0 descargas) |
| Modelo base: NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B (3B activos) | no disponible | Propósito general | no disponible | Hugging Face |
| Alternativas text-to-SQL de código abierto | no disponible | no disponible | Text-to-SQL | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para text-to-SQL sobre BIRD Platinum; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación en esquemas: puede generar columnas o tablas inexistentes si el esquema no se proporciona de forma completa y clara en el prompt.
- Dependencia del modelo base: requiere cargar `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, lo que implica requisitos de hardware elevados.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es necesario contactar con el autor o revisar la licencia del modelo base.
- Idiomas no disponibles: no se documenta el soporte multilingüe del adaptador.
- Datos de entrenamiento limitados: solo 2.000 ejemplos de BIRD Platinum, lo que puede limitar la generalización a otros dominios o dialectos SQL.
- Sin métricas publicadas: no hay resultados de benchmarks ni comparaciones cuantitativas con otros adaptadores.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-Expo
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- W&B run: `ddkang-uiuc-rl-generalization/tinker-sql/n2ras8vu` (no se proporciona URL directa)
- Tinker source: `tinker://4e942497-d0ee-5686-adb9-632e0478d809:train:0/weights/batch000230` (referencia interna, no URL pública)
