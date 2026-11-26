# you2who/AMAM-libero-mem-vlm

## Resumen

AMAM-libero-mem-vlm es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, orientado a robótica y, más concretamente, al benchmark LIBERO en su variante con memoria. Lo desarrolla el usuario you2who en el contexto del proyecto AMAM (AgentMem-Action-Model), un trabajo que combina un modelo de visión-lenguaje (VLM) con un modelo de acción para tareas de manipulación robótica guiadas por instrucciones en lenguaje natural.

El adaptador no es un modelo autónomo: requiere cargar el base Qwen3-VL-4B-Instruct (4.000 millones de parámetros, arquitectura transformer multimodal) junto con la configuración de processor y tokenizer incluida en el repositorio. La versión publicada corresponde a un checkpoint congelado identificado como `hold_v1_step16724`, sin estado de optimizador ni de reanudación de entrenamiento, lo que indica que está pensado para inferencia y evaluación, no para continuar el ajuste.

Su relevancia es acotada pero específica: ofrece un componente reproducible para pipelines de investigación en robótica con memoria episódica, publicado bajo licencia CC BY 4.0 y con código, paper y dataset de anotaciones enlazados. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-VL-4B-Instruct; no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | CC BY 4.0 (contribuciones AMAM; el base y material de terceros conservan sus licencias) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,1 GB |
| Checkpoint | hold_v1_step16724 (congelado) |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Pipeline | robotics |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre Qwen3-VL-4B-Instruct, un VLM de 4.000 millones de parámetros que procesa entradas conjuntas de imagen y texto. La contribución AMAM no modifica la arquitectura del base, sino que añade matrices de bajo rango entrenadas para una tarea concreta: la comprensión visual y semántica necesaria para el benchmark LIBERO con memoria (`libero_mem`). El repositorio incluye la configuración de processor y tokenizer, lo que sugiere que el adaptador se entrenó con un preprocesado específico de las observaciones robóticas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El autor indica que debe usarse junto con el protocolo de benchmark AMAM y el modelo de acción correspondiente (publicado como AMAM-libero-mem-vla), y que el checkpoint está congelado en el paso 16724. No se incluye estado de optimizador ni de reanudación, por lo que no está preparado para continuar el entrenamiento tal cual.

## Capacidades

- Comprensión de imágenes y texto heredada del base Qwen3-VL-4B-Instruct, especializada mediante LoRA para escenas de manipulación robótica del benchmark LIBERO.
- Procesamiento de instrucciones en lenguaje natural vinculadas a observaciones visuales, en el marco del protocolo AMAM.
- Integración con un modelo de acción separado (AMAM-libero-mem-vla) para la generación de acciones robóticas.
- Soporte de memoria episódica en el contexto de la variante `libero_mem` del benchmark.
- Capacidades multimodales generales del base (descripción de imágenes, respuesta a preguntas visuales) potencialmente preservadas, aunque no verificadas en la información disponible.
- Soporte de tool calling, agentes multi-paso, thinking mode, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Evaluación reproducible en el benchmark LIBERO con memoria: cargar el adaptador junto al base Qwen3-VL-4B-Instruct y el modelo de acción AMAM para reproducir los resultados del paper en la variante `libero_mem`.
- Investigación en manipulación robótica con instrucciones en lenguaje natural: usar el VLM adaptado para interpretar la escena y la orden del usuario, y delegar la política de acción en el modelo VLA emparejado.
- Desarrollo de pipelines de memoria episódica en robótica: el checkpoint `hold_v1_step16724` sirve como referencia congelada para comparar variantes de memoria en experimentos controlados.
- Baseline para ajuste fino posterior: al ser un adaptador LoRA sobre un base público, puede servir como punto de partida para experimentos propios, aunque requeriría reentrenamiento desde cero al no incluir estado de optimizador.
- Docencia y divulgación: ejemplo práctico de composición VLM + VLA con licencia permisiva (CC BY 4.0) para cursos de robótica e IA multimodal.
- Integración en entornos de simulación: uso del adaptador dentro de simuladores compatibles con LIBERO para validar políticas antes de transferirlas a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el consumo real lo determina el base Qwen3-VL-4B-Instruct.
- VRAM estimada para el base en precisión completa (FP16/BF16): aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y del processor visual; no confirmado en la información disponible.
- VRAM estimada con cuantización de 4 bits: del orden de 3-4 GB para pesos, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, cabría en GPUs de consumo con 12-16 GB o más, y en GPUs de datacenter (A100, H100) para mayor throughput.
- Despliegue: al ser un adaptador PEFT, requiere frameworks compatibles con LoRA (transformers + PEFT); no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAM-libero-mem-vlm | LoRA sobre base de 4B | no disponible | Adaptador PEFT para robótica | CC BY 4.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en la información | VLM base | según el modelo base | Hugging Face (modelo público) |
| AMAM-libero-mem-vla | no disponible | no disponible | Modelo de acción emparejado | CC BY 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con otros adaptadores o VLMs para robótica en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el base Qwen3-VL-4B-Instruct y el modelo de acción AMAM no es funcional.
- Checkpoint congelado (`hold_v1_step16724`) sin estado de optimizador: no apto para reanudar entrenamiento directamente.
- Sin datos publicados de benchmarks, sesgos, tasas de alucinación ni evaluación multilingüe en la información disponible.
- Validado presumiblemente solo en el benchmark LIBERO; la transferencia a entornos reales no está documentada.
- Licencia CC BY 4.0 solo cubre las contribuciones AMAM; el base Qwen3-VL y el material de terceros mantienen sus propias licencias, que deben respetarse en uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: menor garantía de mantenimiento o soporte comunitario.
- Idiomas soportados no declarados; el comportamiento multilingüe dependerá del base y no está verificado para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/you2who/AMAM-libero-mem-vlm
- Modelo de acción emparejado: https://huggingface.co/you2who/AMAM-libero-mem-vla
- Dataset de anotaciones: https://huggingface.co/datasets/you2who/AMAM-libero-mem-annotations
- Código: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
