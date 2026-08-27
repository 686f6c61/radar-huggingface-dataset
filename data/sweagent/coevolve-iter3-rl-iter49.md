# sweagent/coevolve-iter3-rl-iter49

## Resumen

El modelo `sweagent/coevolve-iter3-rl-iter49` es un checkpoint de refuerzo (RL) derivado del modelo base multimodal Qwen/Qwen3.5-35B-A3B-Base, desarrollado por el equipo de SWE-agent (Princeton University) en el marco del framework CoEvolve. CoEvolve es un método de entrenamiento de agentes LLM sin supervisión humana que cierra el bucle entre el agente y sus datos: la política actual interactúa con el entorno, se extraen señales de fallo de los rollouts y esas señales guían la síntesis de nuevas tareas de entrenamiento. Este checkpoint concreto corresponde a la iteración 49 de la fase de RL dentro de la tercera iteración del proceso de co-evolución.

El modelo base Qwen3.5-35B-A3B integra una arquitectura híbrida eficiente que combina Gated Delta Networks con Mixture-of-Experts (MoE), con 35 mil millones de parámetros totales y 3 mil millones activos por token. Soporta entrada de imagen y texto (pipeline `image-text-to-text`), contexto nativo de 262 144 tokens extensible hasta 1 010 000, y cobertura de 201 idiomas. El checkpoint aquí descrito tiene 68 164 077 424 parámetros totales en formato safetensors (136,3 GB), lo que sugiere que incluye el vision encoder y otros componentes adicionales respecto al modelo base.

La relevancia de este modelo radica en que representa un avance en el entrenamiento de agentes autónomos mediante RL a escala, sin depender de demostraciones humanas ni de datos estáticos. Al estar basado en Qwen3.5, hereda capacidades multimodales, de razonamiento y de generación de código, pero orientadas específicamente a tareas de agente (resolución de issues, interacción con entornos, tool calling).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated Delta Networks y atención (basado en Qwen3.5-35B-A3B) |
| Parametros totales | 68 164 077 424 (checkpoint) / 35B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | 262 144 nativo, extensible a 1 010 000 (modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | 201 idiomas y dialectos (modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura híbrida que combina capas de Gated Delta Networks (atención lineal) con capas de atención clásica (Gated Attention) y un MoE con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token. La disposición de capas es `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, con 40 capas en total, dimensión oculta de 2048 y cabezas de atención de 32 para V y 16 para QK en las DeltaNet, y 16 para Q y 2 para KV en la atención clásica. El modelo fue pre-entrenado y post-entrenado con un enfoque de fusión temprana de tokens multimodales, logrando paridad con Qwen3 en tareas de razonamiento, código, agentes y comprensión visual.

El checkpoint `coevolve-iter3-rl-iter49` se obtiene mediante el framework CoEvolve, que entrena agentes LLM a través de un proceso de evolución mutua agente-datos. En cada iteración, el agente interactúa con un entorno (por ejemplo, repositorios de GitHub), se extraen señales de debilidad de los rollouts (errores, fallos de ejecución, pasos ineficientes) y esas señales se utilizan para sintetizar nuevas tareas de entrenamiento que se añaden a la distribución. El entrenamiento de RL se escala a entornos con millones de agentes y distribuciones de tareas progresivamente más complejas. No se dispone de detalles específicos sobre el dataset de entrenamiento de este checkpoint concreto, ni sobre el número de tokens o el algoritmo de RL exacto (probablemente PPO o variantes, aunque no se especifica).

## Capacidades

- Generación de texto y razonamiento multi-step, heredadas del modelo base Qwen3.5-35B-A3B.
- Comprensión de imágenes (entrada multimodal) gracias al vision encoder integrado.
- Soporte de tool calling y function calling, esencial para tareas de agente.
- Capacidad de interacción con entornos externos (por ejemplo, ejecución de comandos, edición de archivos) mediante el framework SWE-agent.
- Entrenamiento específico para resolución de issues de GitHub y tareas de ingeniería de software.
- Multilingüismo: 201 idiomas y dialectos soportados por el modelo base.
- Contexto largo: 262 144 tokens nativos, extensible a más de 1 millón, lo que permite manejar repositorios completos o conversaciones extensas.
- Modo agente: el entrenamiento con CoEvolve refuerza la capacidad de planificar, ejecutar acciones y adaptarse a feedback del entorno.

## Casos de uso

- Resolución automatizada de issues de GitHub: el modelo puede recibir una descripción de un bug o una petición de feature, explorar el repositorio, localizar los archivos relevantes y generar un parche o una solución, gracias a su entrenamiento con SWE-agent y CoEvolve.
- Automatización de tareas de mantenimiento de software: puede encargarse de refactorizar código, actualizar dependencias o corregir vulnerabilidades de seguridad en proyectos existentes, utilizando su capacidad de razonamiento sobre código y su contexto largo para analizar el proyecto completo.
- Asistente de desarrollo con comprensión multimodal: al aceptar imágenes, puede interpretar capturas de pantalla de errores, diagramas de arquitectura o mockups de UI para generar o modificar código en consecuencia.
- Agente de atención al cliente técnico: con su contexto de 262K tokens, puede gestionar conversaciones multi-turno con historial extenso, consultar documentación y ejecutar herramientas de diagnóstico para resolver incidencias de usuarios.
- Análisis y generación de documentación técnica: puede leer repositorios completos, extraer información relevante y generar documentación, guías de contribución o resúmenes de cambios, aprovechando su capacidad de procesar texto e imágenes.
- Investigación en agentes autónomos: este checkpoint sirve como base para estudiar el comportamiento de agentes entrenados con co-evolución, permitiendo reproducir experimentos y comparar estrategias de RL en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el checkpoint `coevolve-iter3-rl-iter49`. Los datos disponibles corresponden al modelo base Qwen3.5-35B-A3B, que se presentan a continuación como referencia orientativa:

| Benchmark | Qwen3.5-35B-A3B | Qwen3.5-27B | Qwen3.5-122B-A10B | Qwen3-235B-A22B | GPT-OSS-120B | GPT-5-mini |
|---|---|---|---|---|---|---|
| MMLU-Pro | 86.1 | 86.1 | 86.7 | 84.4 | 80.8 | 83.7 |

No se dispone de resultados para HumanEval, GSM8K u otros benchmarks en la información proporcionada. Es importante señalar que el proceso de RL de CoEvolve puede alterar el rendimiento en tareas genéricas respecto al modelo base, por lo que estos números no deben extrapolarse directamente al checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en FP32 requiere aproximadamente 136 GB de VRAM (68B parámetros × 4 bytes). Con cuantización a BF16 (2 bytes) se reduciría a ~68 GB, y a INT8 (~1 byte) a ~34 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para el checkpoint completo en BF16 se necesitarían GPUs de datacenter como A100 80GB (2 unidades), H100 80GB (1 unidad) o H200. Para cargas de trabajo más ligeras, una RTX 4090 (24 GB) solo podría alojar el modelo con cuantización agresiva (4 bits) y posiblemente con offloading a CPU.
- El modelo base tiene solo 3B parámetros activos, lo que permite una inferencia relativamente rápida incluso en hardware consumer si se utiliza el modelo base en lugar del checkpoint completo.
- Opciones de despliegue: al ser compatible con Transformers, vLLM, SGLang y KTransformers, se puede servir con estos frameworks. Para entornos con menos VRAM, se podría usar llama.cpp con cuantización GGUF (aunque no se proporciona en el repo).
- Latencia y throughput: no disponibles para este checkpoint. El modelo base, gracias a su MoE con 3B activos, ofrece un throughput significativamente mayor que un modelo denso de 35B, pero los datos concretos no se han publicado.

## Comparativa con modelos similares

La comparación se realiza a nivel del modelo base, ya que no existen datos públicos de otros checkpoints de CoEvolve con la misma arquitectura.

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B | 3B | 262K (ext. 1M) | 86.1 | Apache-2.0 |
| Qwen3.5-27B (denso) | 27B | 27B | 262K (ext. 1M) | 86.1 | Apache-2.0 |
| Qwen3.5-122B-A10B (MoE) | 122B | 10B | 262K (ext. 1M) | 86.7 | Apache-2.0 |
| GPT-OSS-120B | 120B | no disponible | no disponible | 80.8 | no disponible |

El checkpoint `coevolve-iter3-rl-iter49` se diferencia de estos modelos por su entrenamiento específico para tareas de agente, lo que puede mejorar el rendimiento en benchmarks de agente (como SWE-bench) a costa de posible degradación en tareas genéricas. No se dispone de datos comparativos en benchmarks de agente.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación intermedio (iteración 49 de RL), no un modelo final pulido. Puede presentar comportamientos inestables o degradación en tareas fuera del dominio de agente.
- No se han publicado evaluaciones de sesgos o alucinaciones para este checkpoint. Como modelo entrenado con RL, puede exhibir comportamientos de reward hacking o sobreoptimización en entornos específicos.
- El contexto de 262K tokens es nativo, pero la extensión a 1M puede requerir técnicas de interpolación posicional que no están garantizadas en este checkpoint.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3.5-35B-A3B puede tener restricciones adicionales de uso (por ejemplo, para ciertos países o aplicaciones) que deben verificarse en la documentación oficial de Qwen.
- El tamaño del checkpoint (136 GB) dificulta su despliegue en hardware consumer sin cuantización, y no se proporcionan versiones cuantizadas oficiales.
- El entrenamiento con CoEvolve se centra en entornos de software (GitHub), por lo que su rendimiento en otros dominios (medicina, finanzas, etc.) puede ser inferior al de modelos generalistas.
- No se dispone de información sobre la composición exacta del dataset de entrenamiento ni sobre los hiperparámetros de RL, lo que limita la reproducibilidad.

## Enlaces

- [HuggingFace: sweagent/coevolve-iter3-rl-iter49](https://huggingface.co/sweagent/coevolve-iter3-rl-iter49)
- [Modelo base: Qwen/Qwen3.5-35B-A3B-Base](https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base)
- [Paper CoEvolve (arXiv)](https://arxiv.org/html/2604.15840)
- [Paper CoEvolve (ACL 2026)](https://aclanthology.org/2026.acl-long.1055/)
- [Repositorio GitHub de CoEvolve](https://github.com/StoneHanaMori/CoEvolve)
- [Repositorio GitHub de SWE-agent](https://github.com/SWE-agent/SWE-agent)
- [Blog de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
