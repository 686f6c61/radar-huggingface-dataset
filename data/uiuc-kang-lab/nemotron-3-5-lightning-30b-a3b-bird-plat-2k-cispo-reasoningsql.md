# uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ReasoningSQL

## Resumen

Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ReasoningSQL es un adaptador LoRA de rango 32 publicado por el grupo uiuc-kang-lab sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. No se trata de un modelo completo, sino de un ajuste fino orientado específicamente a la tarea text-to-SQL, entrenado con aprendizaje por refuerzo (CISPO) sobre el conjunto de datos BIRD Platinum (2.000 ejemplos de entrenamiento) mediante la infraestructura Tinker. El checkpoint publicado corresponde al mejor paso según la precisión en el split de desarrollo de BIRD.

El interés del artefacto reside en su enfoque: aplicar RL con recompensa basada en ejecución SQL sobre un modelo base de arquitectura MoE (30B totales, 3B activos, según la nomenclatura A3B) y publicar únicamente el adaptador (1,5 GB en safetensors), lo que abarata el almacenamiento y permite recombinarlo con los pesos base en BF16. La nomenclatura "ReasoningSQL" sugiere que el entrenamiento fomenta cadenas de razonamiento antes de emitir la consulta, aunque la model card no lo detalla explícitamente.

La ficha se limita a lo que la información disponible permite afirmar: la model card es extremadamente escueta y no incluye resultados de benchmarks, licencia, idiomas ni detalles de composición del dataset más allá de la referencia a BIRD Platinum. Cualquier dato no documentado se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer MoE (modelo base Nemotron-3.5-Lightning-30B-A3B) |
| Parámetros totales | 30B en el modelo base (adaptador LoRA: no disponible) |
| Parámetros activos | 3B en el modelo base (MoE, nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en BF16 |
| Librería | peft |
| Tamaño del repositorio | 1,5 GB |
| Método de entrenamiento | CISPO (RL) sobre BIRD Platinum, 2k ejemplos, vía Tinker |
| Checkpoint | mejor paso por precisión en BIRD dev (`batch000310`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo de mezcla de expertos con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. El ajuste es un LoRA de rango 32, lo que implica que solo se entrenan las matrices de baja dimensión inyectadas en las capas del transformer, manteniendo congelados los pesos base. El repositorio ocupa 1,5 GB, coherente con un adaptador de ese rango sobre un modelo de este tamaño.

El entrenamiento emplea CISPO (una variante de optimización por política con recorte, del linaje de PPO/GRPO aplicado a modelos de lenguaje) sobre el conjunto BIRD Platinum, con 2.000 ejemplos de entrenamiento. La recompensa se deriva presumiblemente de la ejecución correcta de las consultas SQL generadas, dado el dominio text-to-SQL y la referencia a BIRD. El entrenamiento se ejecutó en Tinker (infraestructura de ajuste gestionado), y la model card enlaza un run de Weights & Biases (`ddkang-uiuc-rl-generalization/tinker-sql/wtwgoik5`) que no se ha podido verificar en la información disponible. No se documentan hiperparámetros, número de tokens de entrenamiento, composición exacta del dataset ni si hubo fases previas de SFT.

## Capacidades

- Generación de consultas SQL a partir de esquemas y preguntas en lenguaje natural (text-to-SQL), especialidad del adaptador.
- Razonamiento previo a la respuesta ("ReasoningSQL"), según la denominación del checkpoint; el formato exacto de la cadena de razonamiento no está documentado.
- Ajuste específico al benchmark BIRD (consultas sobre bases de datos reales con esquemas complejos).
- Capacidades heredadas del modelo base Nemotron-3.5-Lightning-30B-A3B: no documentadas en esta ficha por falta de información.
- Soporte de tool calling, agentes, visión, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Generación de SQL en asistentes de análisis de datos: el adaptador traduce preguntas de negocio a consultas ejecutables sobre esquemas BIRD-like, útil en herramientas de BI conversacional donde la precisión de ejecución importa más que la forma de la consulta.
- Evaluación de investigación en text-to-SQL: sirve como punto de comparación para estudiar el efecto del RL con CISPO frente a SFT sobre un mismo modelo base MoE.
- Reproducción de experimentos de RL para SQL: al publicarse el adaptador y la referencia al run de W&B, permite replicar el pipeline Tinker + BIRD Platinum con 2k ejemplos.
- Ajuste incremental sobre esquemas propios: al ser un LoRA, puede recombinarse o continuar entrenándose con datos de dominio específico sin tocar los pesos base.
- Prototipado de pipelines de razonamiento SQL: útil para probar si el modo "reasoning" mejora la tasa de ejecución correcta en consultas con joins y agregaciones complejas.
- Integración en entornos de bajo presupuesto de almacenamiento: al pesar 1,5 GB, el adaptador puede distribuirse y versionarse de forma barata junto a los pesos base compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el checkpoint se seleccionó por precisión en el split de desarrollo de BIRD, sin cifras.

## Requisitos de hardware

- El adaptador LoRA (1,5 GB) requiere cargar el modelo base completo `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` para inferencia.
- VRAM estimada en BF16 para el modelo base de 30B: aproximadamente 60 GB solo en pesos, más overhead de activaciones y KV cache; no disponible una cifra oficial.
- GPU recomendadas: no disponible en la información; por tamaño, se necesitan GPUs de clase A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- En consumer GPU: no cabe en BF16; requeriría cuantización del modelo base (no documentada para este adaptador).
- Opciones de despliegue: PEFT para cargar el adaptador; el resto (vLLM, TGI, llama.cpp, Ollama) no está documentado para esta combinación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (uiuc-kang-lab) | 30B base / 3B activos | no disponible | LoRA + CISPO sobre BIRD Platinum | no disponible | Hugging Face (0 descargas) |
| Modelo base Nemotron-3.5-Lightning-30B-A3B | 30B / 3B activos | no disponible | MoE generalista | no disponible | Hugging Face (nvidia) |
| Otros adaptadores text-to-SQL sobre Nemotron | no disponible | no disponible | LoRA/SFT | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` y la librería PEFT para funcionar.
- Licencia no especificada: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base y del adaptador antes de producción.
- Entrenado sobre un único conjunto (BIRD Platinum, 2k ejemplos): riesgo de sobreajuste al estilo de esquemas y dialectos SQL de BIRD, con posible degradación en dominios distintos.
- Idiomas no documentados: no puede asumirse soporte multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación en SQL: consultas sintácticamente válidas pero semánticamente incorrectas; se recomienda validación por ejecución.
- Sin benchmarks publicados: imposible estimar la ganancia real frente al modelo base o frente a SFT.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el run de W&B referenciado no se ha verificado.
- Longitud de contexto no disponible: limita la planificación para esquemas de base de datos extensos.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/Nemotron-3.5-Lightning-30B-A3B-BIRD-Plat-2k-CISPO-ReasoningSQL
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Run de Weights & Biases (referenciado en la model card): `ddkang-uiuc-rl-generalization/tinker-sql/wtwgoik5`
- Checkpoint Tinker (referenciado): `tinker://cbaadb9e-10a8-5663-905f-d2d88e2b710d:train:0/weights/batch000310`
- Paper de BIRD: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
