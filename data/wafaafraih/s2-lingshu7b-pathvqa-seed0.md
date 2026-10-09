# WafaaFraih/s2-lingshu7b-pathvqa-seed0

## Resumen

s2-lingshu7b-pathvqa-seed0 es un ajuste fino (fine-tune) del modelo multimodal medico Lingshu-7B, publicado por el usuario WafaaFraih en HuggingFace. El entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, usando la librería TRL y, según las etiquetas del repositorio, los kernels optimizados de Unsloth. El nombre del modelo sugiere que el ajuste se ha orientado a tareas de respuesta visual a preguntas (VQA) sobre el conjunto de datos PathVQA, aunque la model card no documenta explícitamente el dataset empleado.

Se trata de un experimento de investigación más que de un modelo listo para producción: acumula cero descargas y cero "likes", no declara licencia, idiomas ni pipeline, y su model card es prácticamente la plantilla autogenerada por TRL. El repositorio ocupa 2,0 GB, un tamaño muy inferior a los aproximadamente 15 GB que ocuparían los pesos completos de un modelo de 7.000 millones de parámetros en precisión de 16 bits, lo que apunta a una subida parcial de pesos o a un artefacto incompleto.

Su relevancia es, por tanto, acotada: sirve como referencia de reproducibilidad para experimentos de RL aplicado a modelos médicos multimodales (semilla 0) y como punto de partida para quien quiera inspeccionar pipelines GRPO con TRL sobre Lingshu-7B. No hay datos publicados de benchmarks, licencia o composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo base (Lingshu-7B) es un modelo multimodal médico, y la librería declarada es transformers |
| Parametros totales | 7.000 millones (inferido del identificador "lingshu7b" y del modelo base Lingshu-7B; no confirmado en la model card) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni variantes cuantizadas en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el marcador de posicion "licence: license"; el modelo base es de lingshu-medical-mllm) |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repo: 2,0 GB |
| Modelo base | lingshu-medical-mllm/Lingshu-7B |
| Metodo de entrenamiento | GRPO con TRL 1.13.0 |
| Version de transformers | 5.16.1 |
| Version de PyTorch | 2.11.0+cu128 |
| Version de Datasets / Tokenizers | 4.8.5 / 0.23.1 |
| Fecha de creacion | 2026-10-09 |
| Fecha de ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios de este fine-tune. El modelo parte de lingshu-medical-mllm/Lingshu-7B, un modelo multimodal de 7.000 millones de parámetros del ámbito médico, y se ha ajustado manteniendo el stack de transformers, por lo que la arquitectura subyacente (transformer multimodal con codificador visual, presumiblemente) es la del modelo base, no una modificación estructural. No hay información sobre número de tokens de entrenamiento, composición del dataset, resolución de imagen de entrada ni estrategia de congelación de capas.

El elemento técnico distintivo es el procedimiento de optimización: GRPO mediante TRL. GRPO es un algoritmo de aprendizaje por refuerzo sin crítico (critic-free) que estima la ventaja de cada respuesta comparándola con las demás del mismo grupo de muestras, lo que reduce el coste de memoria frente a PPO al eliminar la red de valor. Se usa habitualmente para reforzar razonamiento y respuestas verificables con una función de recompensa. Se desconoce qué función de recompensa se ha empleado aquí, cuántos pasos de entrenamiento se ejecutaron y qué hiperparámetros (tamaño de grupo, KL, tasa de aprendizaje) se aplicaron. La etiqueta "unsloth" sugiere que el entrenamiento se apoyó en los kernels optimizados de esa librería, y "generated_from_trainer" indica que la model card se generó automáticamente con el Trainer de TRL. El sufijo "seed0" del nombre apunta a la primera semilla de una serie de ejecuciones experimentales.

## Capacidades

- Respuesta visual a preguntas (VQA): el modelo base es multimodal médico y el nombre del ajuste apunta a PathVQA, por lo que la capacidad esperada es responder preguntas en lenguaje natural sobre imágenes (presumiblemente histopatológicas). No hay verificación publicada de esta capacidad en el repositorio.
- Generación de texto conversacional: la model card incluye un ejemplo de `pipeline("text-generation")` con entrada en formato de mensajes (rol de usuario), lo que indica soporte del formato chat/plantilla de conversación heredado del modelo base.
- Razonamiento guiado por refuerzo: al haberse entrenado con GRPO, es plausible una mejora en la calidad de las respuestas respecto al modelo base en la tarea objetivo, aunque no se aportan métricas que lo confirmen.
- Procesamiento de imágenes médicas: inferido del modelo base (lingshu-medical-mllm) y del identificador "pathvqa"; no documentado en la model card.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking" explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Respuesta a preguntas sobre imágenes histopatológicas en investigación: dado que el ajuste parece orientado a PathVQA, el uso natural es formular preguntas en lenguaje natural sobre cortes de tejido y obtener respuestas cortas. Es un escenario de laboratorio, no clínico, porque no hay validación publicada.
- Preanotación de informes de anatomía patológica: generación de un primer borrador de descripción a partir de la imagen, que un patólogo revisa y corrige. Requiere integración con un visor de imágenes y validación interna exhaustiva antes de cualquier uso real.
- Generación de datos sintéticos de referencia para VQA médica: usar el modelo para producir respuestas candidatas sobre un conjunto de imágenes propio y emplearlas como material de preetiquetado, filtrando después con revisión experta.
- Evaluación comparativa de ajustes RL: al ser una ejecución con semilla 0, resulta útil como punto de referencia en experimentos que comparen distintas semillas, funciones de recompensa o algoritmos (GRPO frente a DPO, por ejemplo) sobre el mismo modelo base.
- Docencia y simulación de preguntas con imagen: construcción de un banco de preguntas de práctica sobre imágenes médicas para formación, siempre con supervisión docente y aviso de que las respuestas pueden ser incorrectas.
- Componente de un banco de pruebas de pipelines TRL: el repositorio documenta versiones exactas de TRL, Transformers y PyTorch, lo que permite reproducir el entorno y estudiar el flujo de entrenamiento GRPO de extremo a extremo.
- Investigación sobre alineación en dominios médicos: analizar cómo el refuerzo con recompensas específicas altera el estilo y la seguridad de las respuestas de un modelo médico multimodal, comparando sus salidas con las del Lingshu-7B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud en PathVQA ni de ningún otro conjunto (MMLU, HumanEval, GSM8K u otros), ni comparaciones con el modelo base. El repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones generales para un modelo multimodal de 7.000 millones de parámetros; no han sido verificadas con este repositorio concreto.

- VRAM en bf16/fp16: en torno a 15-18 GB solo para pesos (más memoria para el codificador visual, la caché KV y las activaciones de imagen de alta resolución).
- VRAM en cuantización de 8 bits: aproximadamente 8-10 GB.
- VRAM en cuantización de 4 bits (estilo GGUF Q4_K_M): aproximadamente 5-7 GB, con pérdida de calidad no medida.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S 48 GB, RTX 6000 Ada. Con tensor parallelism, dos GPU de 24 GB pueden ser suficientes.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite inferencia en bf16 sin margen amplio; una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB solo son viables con cuantización.
- Opciones de despliegue: vLLM o TGI para servicio en GPU con transformers; llama.cpp u Ollama únicamente si se generan pesos GGUF propios, ya que el repositorio no los incluye. El tag "endpoints_compatible" indica compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponible.
- Advertencia de despliegue: el repositorio ocupa 2,0 GB frente a los ~15 GB esperables para pesos completos en 16 bits, por lo que es probable que la subida esté incompleta o contenga solo una parte de los ficheros. Antes de planificar hardware conviene listar los archivos del repositorio y confirmar que se puede cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s2-lingshu7b-pathvqa-seed0 | 7B (inferido) | No disponible | No se han publicado benchmarks | No disponible | HF, 0 descargas, repo de 2,0 GB |
| lingshu-medical-mllm/Lingshu-7B (modelo base) | 7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HF |
| Otras alternativas de VQA medica (por ejemplo, variantes de LLaVA-Med o Qwen-VL ajustadas) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparación cuantitativa. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas de su categoria.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas, benchmarks ni validación clínica; no se puede afirmar que el ajuste mejore al modelo base.
- Riesgo de alucinación elevado en dominio médico: cualquier respuesta sobre una imagen puede ser incorrecta o inventada, con consecuencias potencialmente graves si se usa en contexto clínico. No debe emplearse para diagnóstico ni para decisiones sobre pacientes.
- Licencia no declarada: la model card contiene el marcador "licence: license" sin concretar. Sin una licencia explícita, no hay autorización clara para uso comercial y la situación jurídica es ambigua; además, la licencia del modelo base (lingshu-medical-mllm/Lingshu-7B) puede imponer condiciones adicionales que aquí no se reproducen.
- Repositorio posiblemente incompleto: 2,0 GB es un tamaño anómalo para pesos de 7B. Verificar los ficheros antes de cualquier uso.
- Idiomas y contexto sin documentar: se desconoce la ventana de contexto, la lista de idiomas y el comportamiento fuera del dominio de entrenamiento.
- Dataset no documentado: el nombre sugiere PathVQA, pero la model card no lo confirma ni describe la composición, el filtrado ni el sesgo de la muestra. Un ajuste estrecho sobre un único conjunto puede degradar capacidades generales del modelo base (olvido catastrófico).
- Ejemplo de uso poco informativo: el fragmento de código de la model card plantea una pregunta filosófica genérica, no una tarea de VQA médica, lo que sugiere que la plantilla se generó automáticamente y no refleja el propósito real del ajuste.
- Procedencia e idoneidad de la recompensa desconocidas: en GRPO la calidad depende enteramente de la función de recompensa; al no documentarse, no se puede evaluar qué comportamiento se ha reforzado (ni si se ha premiado un sesgo de estilo o de longitud).
- Trazabilidad limitada: cero descargas y cero interacciones implican que el modelo no ha sido reproducido ni auditado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WafaaFraih/s2-lingshu7b-pathvqa-seed0
- Modelo base: https://huggingface.co/lingshu-medical-mllm/Lingshu-7B
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Paper de GRPO en arXiv: https://arxiv.org/abs/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
- La busqueda web realizada no devolvio enlaces adicionales relevantes sobre este modelo (los resultados obtenidos correspondian a consultas no relacionadas).
