# usr-wwelsh/digest-sft3

## Resumen

digest-sft3 es un modelo de generación de texto basado en HuggingFaceTB/SmolLM2-135M-Instruct, desarrollado por el usuario usr-wwelsh como parte de un pipeline de fine-tuning para la generación automática de resúmenes de commits (git digest). El modelo está entrenado mediante Supervised Fine-Tuning (SFT) sobre un conjunto de datos real de pares `commits.json → digest.md`, con un diseño de prompts "diff-aware" que incluye estadísticas de archivos y parches truncados en días de commits dispersos, replicando fielmente la entrada que el modelo recibirá en producción dentro de la herramienta git-digest.

Con 134,5 millones de parámetros, es un modelo compacto de arquitectura transformer decoder-only, heredada de SmolLM2. Su relevancia radica en que aborda un problema específico y práctico: la generación de resúmenes concisos y precisos de cambios de código, una tarea que los modelos grandes suelen abordar de forma genérica pero que aquí se optimiza con un dataset curado y un criterio de selección basado en recompensa verificable. El checkpoint elegido es el mejor de una ejecución de 12 épocas según la recompensa media sobre un conjunto de validación de 10 ejemplos, alcanzando un valor de 1.0000 frente a 0.0000 del checkpoint anterior (sft2) y del modelo base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda del modelo base SmolLM2-135M-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion posterior posible) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros con atención causal estándar. El fine-tuning se realizó con la librería TRL (Transformers Reinforcement Learning) mediante un pipeline de SFT sobre un dataset propio de aproximadamente 100 pares reales de commits y sus resúmenes (`commits.json → digest.md`). La innovación principal está en el diseño de los prompts: en lugar de usar solo el mensaje del commit (como en el checkpoint anterior sft2), se incluyen estadísticas de archivos modificados y parches truncados en días con pocos commits, replicando exactamente lo que la herramienta git-digest muestra al modelo en producción. El entrenamiento duró 12 épocas y el checkpoint final se seleccionó por la recompensa media en un conjunto de validación de 10 ejemplos, no por el paso final ni por la pérdida más baja. El código de entrenamiento está disponible bajo licencia MIT en el repositorio `usr-wwelsh/digest-finetune`.

## Capacidades

- Generación de resúmenes de commits en formato natural, aprendiendo la estructura y el tono de los resúmenes del dataset.
- Procesamiento de entradas que combinan estadísticas de archivos y parches de código truncados.
- Adaptación a la tarea específica de "git digest" con recompensa verificable (formato, cobertura, repetición y fidelidad al repositorio).
- Generación de texto en general, aunque su especialización limita su uso fuera del dominio de resúmenes de cambios.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación automática de resúmenes de commits en repositorios de código: el modelo puede integrarse en el flujo de trabajo de git-digest para producir descripciones concisas de los cambios, ahorrando tiempo a los desarrolladores en la redacción de mensajes de commit.
- Documentación de cambios en proyectos open source: al recibir el diff y las estadísticas de archivos, genera un resumen legible que puede usarse en changelogs o notas de versión.
- Automatización de informes de actividad en equipos de desarrollo: combinado con un script que extrae los commits del día, el modelo produce un resumen diario de la actividad del repositorio.
- Análisis rápido de pull requests: el modelo puede resumir los cambios de una PR a partir de su diff, facilitando la revisión por parte de otros desarrolladores.
- Integración en pipelines de CI/CD: como backend local de generación de resúmenes, puede ejecutarse en entornos con recursos limitados gracias a su tamaño reducido.
- Entrenamiento y evaluación de pipelines de fine-tuning: sirve como caso de estudio para metodologías de SFT con recompensa verificable, dado que el código y el dataset están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento reportado es la recompensa media en un conjunto de validación de 10 ejemplos, que alcanza 1.0000 para este checkpoint, frente a 0.0000 del checkpoint anterior (sft2) y del modelo base sin entrenar. Este valor indica que el modelo cumple correctamente los criterios de formato, cobertura, fidelidad al repositorio y ausencia de repetición en ese pequeño conjunto, pero no es comparable con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 134,5 millones de parámetros, en FP16 el modelo ocupa aproximadamente 270 MB de memoria, y en FP32 unos 540 MB. Esto permite ejecutarlo en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. No requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero que cabe en prácticamente cualquier hardware.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. También puede ejecutarse directamente con la librería transformers en Python.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia de milisegundos en GPU y de unos pocos cientos de milisegundos en CPU para generaciones cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| digest-sft3 (este) | 134,5M | no disponible | Apache-2.0 | Resumen de commits (git digest) |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135M | 2048 (tipico) | Apache-2.0 | Instruccion general |
| usr-wwelsh/digest-sft2 (checkpoint anterior) | 134,5M | no disponible | Apache-2.0 | Resumen de commits (solo mensajes) |

La comparativa directa con otros modelos de tamaño similar (por ejemplo, TinyLlama-1.1B o Qwen2-0.5B) no es relevante porque digest-sft3 está fuertemente especializado en una tarea concreta y no se han publicado benchmarks generales. Frente a su propio checkpoint anterior (sft2), la mejora en recompensa es notable (1.0000 vs 0.0000), lo que indica que el cambio a prompts diff-aware fue decisivo.

## Limitaciones y advertencias

- Modelo de tamaño muy reducido (135M), por lo que su capacidad de razonamiento y generalización es limitada fuera de la tarea de resúmenes de commits.
- Entrenado con un dataset de aproximadamente 100 ejemplos reales, lo que puede provocar sobreajuste y falta de robustez ante formatos de entrada diferentes a los vistos en entrenamiento.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar resúmenes que no reflejen fielmente los cambios del diff, especialmente si el parche es complejo o contiene código poco común.
- No se han documentado sesgos específicos, pero al entrenarse sobre commits de un repositorio concreto, puede heredar el estilo y las convenciones de ese proyecto.
- La licencia Apache-2.0 permite uso comercial, pero el código de entrenamiento es MIT; no hay restricciones adicionales conocidas.
- Para producción, se recomienda validar las salidas con un sistema de verificación (como el reward usado en entrenamiento) para evitar resúmenes incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usr-wwelsh/digest-sft3
- Checkpoint anterior (sft2): https://huggingface.co/usr-wwelsh/digest-sft2
- Repositorio de código de entrenamiento: https://github.com/usr-wwelsh/digest-finetune
- Repositorio relacionado (Research-Digest, no directamente vinculado): https://github.com/usr-wwelsh/Research-Digest
