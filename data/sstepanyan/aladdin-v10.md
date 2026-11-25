# sstepanyan/aladdin-v10

## Resumen

Aladdin v10 es un adaptador LoRA publicado por el usuario sstepanyan sobre el modelo base Qwen/Qwen3.8-27B, orientado a mejorar el rendimiento en armenio oriental (hy) y ruso (ru), manteniendo capacidades en inglés (en). Se distribuye en formato MLX con cuantización de 4 bits, lo que lo hace apto para inferencia en hardware Apple Silicon. El repositorio ocupa 15,6 GB y contiene 26.895.993.856 parámetros en safetensors, coherente con el tamaño del modelo base.

El modelo no es un entrenamiento desde cero, sino un ajuste fino tipo LoRA sobre una arquitectura Qwen3 de 27B (según la nomenclatura del autor, "Qwen3.8-27B"). La relevancia principal reside en su enfoque multilingüe poco habitual: el armenio oriental es un idioma con escasa representación en modelos abiertos de gran tamaño, y este adaptador busca cubrir esa laguna sin renunciar al ruso y al inglés.

La ficha se basa únicamente en los metadatos disponibles en Hugging Face. No se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni documentación técnica adicional en la información proporcionada. El acceso está restringido (gated) y requiere aceptar condiciones en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags del autor); adaptador LoRA |
| Parametros totales | 26.895.993.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (4bit), formato MLX |
| Idiomas soportados | hy (armenio oriental), ru (ruso), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), adaptador LoRA |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | mlx |
| Tamano del repositorio | 15,6 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador LoRA (Low-Rank Adaptation) sobre Qwen/Qwen3.8-27B, una arquitectura transformer de la familia Qwen3 con aproximadamente 27.000 millones de parámetros. El adaptador se distribuye en formato MLX cuantizado a 4 bits, lo que reduce el peso de los pesos para ejecución en Apple Silicon. No se especifica en la información disponible el rango del LoRA, las capas adaptadas ni la estrategia de fusión con el modelo base.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Los tags indican únicamente los idiomas objetivo (armenio oriental, ruso, inglés) y el carácter de adaptador sobre el modelo base. Toda inferencia sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto en armenio oriental, ruso e inglés, con especial énfasis en el primero según la orientación del adaptador.
- Razonamiento y conversación multi-turno heredados del modelo base Qwen3 de 27B.
- Generación de código y matemáticas, presumiblemente conservadas del modelo base (no verificado con benchmarks).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; dependerá de las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües limitadas a los tres idiomas declarados (hy, ru, en).
- No se declaran capacidades de visión, audio ni modo "thinking" específicas para este adaptador.

## Casos de uso

- Atención al cliente en armenio: el adaptador está orientado a mejorar la calidad en armenio oriental, por lo que puede emplearse en sistemas de soporte conversacional para usuarios armenios, aprovechando la ventana de contexto del modelo base (no especificada) para conversaciones multi-turno.
- Traducción y localización hy↔ru↔en: útil para pipelines de traducción automática o posedición en entornos donde el armenio oriental es el idioma principal y se requiere calidad superior a la del modelo base sin ajuste.
- Procesamiento de documentación administrativa armenia: clasificación, resumen y extracción de información de textos oficiales en armenio oriental, un dominio con poca cobertura en modelos abiertos.
- Asistentes locales en Apple Silicon: al distribuirse en MLX 4 bits, puede ejecutarse en Macs con memoria unificada suficiente para prototipos y aplicaciones de escritorio sin depender de GPU dedicadas.
- Generación de contenido en ruso para mercados de Europa del Este y Asia Central, donde el ruso actúa como lengua franca junto al armenio.
- Investigación lingüística y evaluación de modelos multilingües: sirve como referencia para estudiar el impacto de LoRA sobre idiomas de bajos recursos dentro de la familia Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al tratarse de un modelo de ~27B en 4 bits, el peso ronda los 13-15 GB (el repositorio ocupa 15,6 GB); se requiere memoria unificada o VRAM adicional para el contexto y el adaptador.
- GPU recomendadas: no se especifican; el formato MLX está pensado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada de 16 GB o superior, preferiblemente 32 GB para contexto amplio).
- GPU consumer: en el ecosistema NVIDIA no se distribuye en GGUF ni safetensors estándar; para RTX 4090 (24 GB) sería necesario convertir el adaptador y fusionarlo con el base en otro formato, lo cual no está documentado.
- Opciones de despliegue: librería MLX (mlx-lm) en macOS. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Aladdin v10 (este) | ~26,9B (LoRA sobre Qwen3.8-27B) | no disponible | hy, ru, en | apache-2.0 | MLX 4bit + LoRA |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | multilingüe (amplio) | según modelo base | safetensors |
| Modelos multilingües abiertos de ~27B (p. ej., familia Qwen3 sin ajuste) | ~27B | variable | multilingüe general | variable | safetensors/GGUF |

La comparativa con alternativas específicas para armenio oriental no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es el ajuste LoRA para hy/ru y la distribución en MLX 4 bits.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar; no es de uso inmediato.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora en armenio ni de posibles regresiones en otros idiomas.
- Formato MLX: no es directamente compatible con el ecosistema NVIDIA/CUDA sin conversión; limita el despliegue en servidores estándar.
- Idiomas acotados: fuera de hy, ru y en el rendimiento puede degradarse respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de ~27B; no se documentan mitigaciones específicas.
- Sesgos: no se documenta el dataset de entrenamiento ni la composición, por lo que no es posible evaluar sesgos de género, políticos o culturales.
- Licencia apache-2.0 declarada, pero conviene verificar la compatibilidad con la licencia del modelo base Qwen3.8-27B antes de uso comercial.
- Sin información sobre contexto máximo, tool calling ni modo de razonamiento; no debe asumirse su disponibilidad en producción sin validación previa.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/sstepanyan/aladdin-v10
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
