# zacaj/Swift-Qwen3.8-Flash-Next-Gyro-M-TQ2_0_GGUF

## Resumen

Swift-Qwen3.8-Flash-Next-Gyro-M-TQ2_0_GGUF es una cuantización experimental del modelo Swift1.5-Qwen3.8-Flash-Next, un fine-tuning de Qwen3.8-Flash-Next publicado por el usuario ukisai. El autor de esta ficha (zacaj) combina ese fine-tuning con los expertos cuantizados Gyro-M procedentes de agentionai/Qwen3.8-Flash-Next-Gyro-GGUF, generando un GGUF de tipo TQ2_0 orientado a razonamiento eficiente y extracción de documentos. El resultado es un modelo multimodal (image-text-to-text) de aproximadamente 177.000 millones de parámetros que, según la model card, ocupa unos 45 GB de RAM en ejecución.

La relevancia del modelo reside en su enfoque en la eficiencia de tokens: el autor reporta que, frente a Gyro-M de agentionai, obtiene una puntuación un 2 % superior en un conjunto de pruebas de Terminal Bench 2.0 y Aider Polyglot ejecutadas vía Claude Code, consumiendo un 25 % menos de razonamiento y un 21 % menos de tokens totales. Frente a la cuantización IQ3_XXS de Swift-1.5 de ISTA DASLab, usa unos 5 GB menos de RAM y puntúa un 4 % mejor. Es, por tanto, un modelo pensado para despliegues con restricciones de memoria que necesitan capacidades de agente y razonamiento estructurado.

Se trata de un artefacto claramente experimental (etiquetas `experimental`, `qwen4exp`) con muy poca tracción en la comunidad (1 like, 964 descargas) y sin documentación exhaustiva sobre datos de entrenamiento, idiomas o benchmarks estandarizados. La licencia declarada es qwen-community-1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de la arquitectura base no disponibles |
| Parametros totales | 176.943.899.520 (≈177B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_0 (Gyro-M, objeto de esta ficha); el repo incluye además Gyro-S TQ1 y Gyro-L TQ3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` en Hugging Face) |
| Formato de pesos | GGUF (librería declarada: transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next ni del fine-tuning Swift1.5. Por el pipeline declarado (image-text-to-text) y el tamaño (≈177B parámetros), se trata de un transformer multimodal de gran escala. El proceso de construcción de esta ficha es una cuantización post-entrenamiento: se toman los pesos del fine-tuning de ukisai y se combinan con los expertos cuantizados Gyro-M de agentionai, generando un GGUF TQ2_0. El autor menciona que el modelo es compatible con cualquier motor de inferencia capaz de ejecutar la versión Gyro-M de agentionai, y que ha sido probado en Strata.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Las etiquetas de la model card (`post-training`, `efficient-thinking`, `token-efficient`, `structured-output`, `document-extraction`) sugieren un ajuste orientado a reducir la verbosidad del razonamiento y a producir salidas estructuradas, pero no se aportan detalles técnicos sobre cómo se logró. Tampoco se documenta ninguna innovación arquitectónica propia más allá de la propia cuantización Gyro.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto según el pipeline declarado).
- Razonamiento eficiente en tokens: la model card reporta un 25 % menos de razonamiento y un 21 % menos de tokens totales frente a Gyro-M de agentionai en las pruebas realizadas.
- Salidas estructuradas (`structured-output`) y extracción de documentos (`document-extraction`), según las etiquetas del autor.
- Uso como agente de codificación: las pruebas reportadas se ejecutaron mediante Claude Code sobre Terminal Bench 2.0 y Aider Polyglot, lo que implica soporte de flujos multi-turno y uso de herramientas en ese entorno.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no confirmado en la información disponible, aunque las etiquetas `reasoning` y `efficient-thinking` apuntan a un comportamiento de razonamiento explícito.

## Casos de uso

- Agente de codificación en terminal: el modelo ha sido evaluado en Terminal Bench 2.0 vía Claude Code, por lo que encaja en flujos de resolución de tareas de shell y edición de ficheros con múltiples turnos, beneficiándose del menor consumo de tokens reportado.
- Refactorización y parcheo de código multi-lenguaje: las pruebas de Aider Polyglot indican capacidad para trabajar sobre distintos lenguajes dentro de un mismo pipeline de edición asistida.
- Extracción de documentos estructurados: la etiqueta `document-extraction` y la entrada de imagen permiten usarlo para convertir documentos escaneados o capturas en JSON u otras estructuras, con un consumo de tokens reducido.
- Despliegue en hardware con memoria limitada: con ~45 GB de RAM en ejecución (Gyro-M TQ2_0), puede correr en estaciones de trabajo con 48 GB o en servidores con una sola GPU de 48 GB, donde un modelo de 177B en precisión completa no cabría.
- Automatización de tareas de razonamiento con presupuesto de tokens ajustado: útil en pipelines donde el coste por token o la latencia importan, gracias a la reducción de tokens de razonamiento reportada.
- Prototipado e investigación sobre cuantización: al incluir variantes Gyro-S (TQ1) y Gyro-L (TQ3) en el mismo repositorio, sirve para estudiar el compromiso entre tamaño, calidad y consumo de tokens en un modelo grande.

## Benchmarks y rendimiento

Los únicos datos disponibles son comparativas relativas del autor sobre un conjunto propio de pruebas de Terminal Bench 2.0 y Aider Polyglot ejecutadas vía Claude Code. No se aportan puntuaciones absolutas ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

| Comparación | Tamaño | Puntuación | RAM | Razonamiento | Tokens totales | Turnos | Errores |
|---|---|---|---|---|---|---|---|
| Este modelo (Gyro-M TQ2_0) vs ISTA DASLab IQ3_XXS Swift-1.5 | — | +4 % | −5 GB | similar | similar | similar | −3 % |
| Este modelo (Gyro-M TQ2_0) vs agentionai Gyro-M | mismo | +2 % | — | −25 % | −21 % | −15 % | −2 % |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- RAM estimada en ejecución: ~45 GB para la variante Gyro-M TQ2_0, según la model card (probado en Strata).
- GPU recomendadas: no disponibles de forma explícita; por el uso de RAM indicado, encaja en GPUs con 48 GB (A6000, L40S, A100 40 GB con offload parcial) o en configuraciones CPU+RAM.
- ¿Cabe en GPU de consumo? No de forma completa: 45 GB superan los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Requiere offload a RAM del sistema o múltiples GPU.
- Opciones de despliegue: motores compatibles con la versión Gyro-M de agentionai (probado en Strata). No se confirma compatibilidad con llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Swift-Qwen3.8-Flash-Next-Gyro-M-TQ2_0) | ≈177B | no disponible | GGUF TQ2_0 | qwen-community-1.0 | ~45 GB RAM; +2 % vs Gyro-M, −25 % razonamiento |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF (Gyro-M) | ≈177B | no disponible | GGUF | no disponible | Mismo tamaño; referencia directa de comparación |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF (IQ3_XXS) | ≈177B | no disponible | GGUF IQ3_XXS | no disponible | ~5 GB más de RAM; −4 % de puntuación frente a este modelo |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base del fine-tuning) | ≈177B | no disponible | safetensors (presumible) | no disponible | Modelo del que deriva esta cuantización |

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no hay validación independiente de los resultados reportados.
- Las comparativas de rendimiento provienen de un conjunto propio de pruebas (Terminal Bench 2.0 y Aider Polyglot vía Claude Code) sin puntuaciones absolutas ni reproducibilidad documentada.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento correcto fuera del inglés.
- Longitud de contexto no disponible; no apto para planificación de despliegues que dependan de una ventana concreta.
- Las variantes Gyro-S (TQ1) y Gyro-L (TQ3) incluidas en el repo no han sido probadas rigurosamente; la Gyro-L ni siquiera ha sido ejecutada por el autor por falta de hardware.
- Licencia qwen-community-1.0: conviene revisar sus términos antes de uso comercial, ya que puede imponer restricciones adicionales a las habituales de código abierto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de 177B cuantizado a TQ2_0, es esperable cierta degradación de calidad frente a precisiones mayores.
- Requiere ~45 GB de RAM, lo que excluye su uso en GPUs de consumo sin offload.
- Compatibilidad de motores de inferencia limitada en la práctica a aquellos que soporten el formato Gyro de agentionai.

## Enlaces

- Hugging Face: https://huggingface.co/zacaj/Swift-Qwen3.8-Flash-Next-Gyro-M-TQ2_0_GGUF
- Modelo base del fine-tuning: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Expertos Gyro-M de referencia: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Cuantización IQ3_XXS de comparación: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE
