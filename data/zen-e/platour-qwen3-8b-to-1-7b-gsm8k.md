# zen-E/PLatour-Qwen3-8B-to-1.7B-GSM8K

## Resumen

PLatour-Qwen3-8B-to-1.7B-GSM8K es un artefacto de investigación publicado por el usuario zen-E en Hugging Face. No es un modelo entrenado de forma convencional, sino un conjunto de pesos de inferencia correspondientes al experimento 17 del proyecto PLatour, que investiga la transferencia entre modelos (*Prefill-to-Autoregressive Cross-model Transfer*, PACT). En este esquema, un modelo "emisor" grande (Qwen3-8B) procesa el prompt y genera representaciones ocultas, mientras que un modelo "receptor" pequeño (Qwen3-1.7B) produce la respuesta de forma independiente, conectados mediante puentes lineales ligeros entrenados con recompensas de tarea.

El repositorio acompaña al artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv 2611.06976) y se centra en la tarea GSM8K de razonamiento matemático. Su relevancia es metodológica: propone un marco con controles (PACT-Check: Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras provienen realmente de la información del emisor o de la simple adaptación del receptor.

Es importante subrayar que el autor declara explícitamente que este repositorio distribuye pesos históricos de inferencia **sin puntuaciones de benchmark**, y que no debe cargarse con `AutoModel.from_pretrained` ni con PEFT, sino mediante el cargador específico del proyecto (`platour-exps`). El tamaño del repositorio es de 0,9 GB, coherente con los puentes de proyección más que con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales de proyección entre backbones transformer congelados (emisor Qwen3-8B, receptor Qwen3-1.7B); soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repo de 0,9 GB contiene las proyecciones del puente, no los backbones completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream Qwen3-8B y Qwen3-1.7B conservan sus propias licencias) |
| Formato de pesos | safetensors con cargador personalizado (`custom-loader`, requiere `config.json` del repo con identidad de experimento, mapeo de tensores, nombre de fichero y SHA-256) |

## Arquitectura y entrenamiento

El método PACT separa el cálculo en dos fases: el emisor grande (Qwen3-8B) codifica el prompt y suministra representaciones ocultas, mientras que el receptor pequeño (Qwen3-1.7B) genera la respuesta de forma autorregresiva e independiente. La conexión se materializa en puentes lineales ligeros entrenados sobre backbones congelados, inicializados desde proyecciones a cero y optimizados mediante recompensas de tarea (no se especifica en la información disponible si se usa RLHF, DPO u otra formulación de reward). El diseño admite modelos con atención híbrida.

El artículo introduce además PACT-Check, un conjunto de controles experimentales (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) cuyo objetivo es descartar que las mejoras de tarea se deban únicamente a la adaptación del receptor en lugar de a información útil transmitida por el emisor. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset (`zen-E/PLatour-Qwen3-Data` se referencia pero no se describe) ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto autorregresiva mediante el receptor Qwen3-1.7B, condicionada por las representaciones del emisor Qwen3-8B.
- Razonamiento matemático orientado a GSM8K (el experimento 17 se centra en esta tarea).
- Transferencia de información entre modelos de distinto tamaño a través de proyecciones lineales entrenadas.
- Soporte de modelos con atención híbrida en el pipeline PACT.
- Evaluación reproducible con controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el experimento 17 del paper PACT para estudiar si un emisor de 8B mejora a un receptor de 1,7B en GSM8K mediante puentes lineales.
- Validación metodológica de benchmarks: emplear los controles PACT-Check para comprobar si las ganancias observadas dependen de información útil del emisor o de la adaptación del receptor.
- Estudio de eficiencia computacional: analizar el coste de prefill en un modelo grande frente al coste de decodificación en uno pequeño, útil para diseñar arquitecturas desacopladas en producción.
- Reproducibilidad de resultados académicos: servir como artefacto de referencia con hashes SHA-256 y mapeo de tensores para replicar la inferencia histórica del experimento.
- Base para experimentos de destilación implícita: usar los puentes como punto de partida para explorar variantes de transferencia entre otros pares de modelos Qwen3.
- Análisis de atención híbrida: evaluar cómo se comportan los puentes lineales cuando el backbone combina mecanismos de atención lineal y completa.
- Docencia e investigación doctoral: material para cursos o tesis sobre comunicación entre modelos y evaluación rigurosa de claims comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el repositorio distribuye pesos históricos de inferencia sin puntuaciones y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoint ni sobre rendimiento no sesgado en held-out. Cualquier cifra debe obtenerse mediante evaluación independiente con el comando de experimento correspondiente y las entradas de tarea firmadas.

## Requisitos de hardware

- VRAM estimada: no disponible para el artefacto completo; depende de los backbones descargados por separado (Qwen3-8B en el emisor y Qwen3-1.7B en el receptor).
- Orden de magnitud orientativo para los backbones en FP16: ~16 GB para Qwen3-8B y ~3,4 GB para Qwen3-1.7B, más el overhead de los puentes y del pipeline PACT.
- GPU recomendadas: no especificadas en la información disponible; por tamaño de los backbones, A100/H100 para FP16 del emisor, y GPUs consumer de 24 GB (RTX 3090/4090) podrían alojar el emisor cuantizado o el receptor en FP16.
- Despliegue: no se anuncia compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El autor indica que se debe usar el cargador del proyecto (`platour-exps download --experiment 17`) y que no es cargable mediante `AutoModel.from_pretrained` ni PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-Qwen3-8B-to-1.7B-GSM8K | Puentes sobre Qwen3-8B + Qwen3-1.7B | No disponible | Transferencia PACT con puentes lineales | Apache-2.0 | Pesos en HF, cargador propio |
| Qwen/Qwen3-8B | 8B | No disponible en la información | LLM denso estándar | Licencia Qwen3 | HF, Transformers |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la información | LLM denso estándar | Licencia Qwen3 | HF, Transformers |

No se dispone de otros artefactos PACT comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que no se adjuntan resultados de benchmark y que no se hace ninguna afirmación sobre rendimiento no sesgado; cualquier claim comparativo requiere evaluación independiente.
- No es cargable con `AutoModel.from_pretrained` ni con PEFT; requiere el cargador específico del proyecto PLatour y su `config.json`.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- El artefacto no es estado reanudable de optimizador/RNG, solo pesos de inferencia.
- El repositorio no incluye los backbones Qwen3-8B y Qwen3-1.7B, que deben descargarse por separado y conservan sus propias licencias y avisos.
- No se documentan sesgos conocidos, idiomas soportados, riesgo de alucinación específico ni limitaciones de contexto en la información disponible.
- Uso comercial: la licencia del export es Apache-2.0, pero el uso en producción está condicionado por las licencias de los modelos upstream.
- La evaluación de tareas de programación requiere un juez oficial aislado según la documentación del proyecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-Qwen3-8B-to-1.7B-GSM8K
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo base emisor: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base receptor: https://huggingface.co/Qwen/Qwen3-1.7B
