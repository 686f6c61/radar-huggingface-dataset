# TrajectoryLabs/Nemotron-3.5-Lightning-Tau3-Legacy-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA denominado «Tau3 Legacy», publicado por TrajectoryLabs como punto de comparación histórico para su trabajo de reentrenamiento con harness uniforme. El adaptador se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo MoE híbrido Mamba-Transformer de 30B parámetros totales y 3B activos, diseñado para razonamiento rápido, generación de código y flujos de trabajo agénticos con soporte de tool calling estructurado.

La relevancia de este adaptador radica en que permite reproducir y evaluar el comportamiento de una versión anterior del entrenamiento Tau3 de TrajectoryLabs, orientado a agentes multi-turno con uso de herramientas. El adaptador no incluye los pesos del modelo base; debe cargarse junto con el modelo base en la revisión indicada. Su licencia es la NVIDIA Open Model License, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base híbrido Mamba-Transformer MoE (NVIDIA Nemotron 3.5 Lightning 30B-A3B) |
| Parametros totales | No disponible (el adaptador ocupa 1.5 GB en safetensors; el modelo base tiene 30B totales) |
| Parametros activos | No disponible (el modelo base tiene 3B activos) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo según documentación de NVIDIA) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en BF16; el base admite cuantización estándar) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado a todas las capas lineales del modelo base. El modelo base es un MoE híbrido que combina capas Mamba (SSM) con capas Transformer, con 30B parámetros totales y 3B activos por token, optimizado para inferencia eficiente en entornos agénticos. El adaptador se entrenó hasta el paso 80 del experimento `1000218` de TrajectoryLabs, con el objetivo de mejorar el uso de herramientas (tool-use) en conversaciones multi-turno. No se han publicado detalles sobre el dataset de entrenamiento, el método de alineación (RLHF, DPO, etc.) ni otras innovaciones técnicas adicionales.

## Capacidades

- Adaptación específica para agentes multi-turno con uso de herramientas (tool-use), especialmente en el contexto del protocolo Tau3.
- Hereda las capacidades del modelo base: razonamiento, generación de código, matemáticas y soporte de tool calling estructurado.
- El modelo base soporta contexto largo, lo que permite mantener conversaciones extensas con múltiples llamadas a herramientas.
- No se dispone de información sobre capacidades multimodales, ya que el adaptador es solo para texto.

## Casos de uso

- Investigación académica: evaluación de protocolos de agentes (harness) y comparación de estrategias de tool-use bajo condiciones controladas.
- Reproducción de experimentos: permite replicar los resultados del entrenamiento Tau3 original para validar mejoras posteriores.
- Desarrollo de agentes conversacionales: como base para experimentar con llamadas a funciones en entornos de chatbot.
- Benchmarking de adaptadores: comparar el rendimiento de este LoRA frente a otros adaptadores sobre el mismo modelo base.
- Estudio de sensibilidad al harness: analizar cómo varía el rendimiento según el simulador de usuario, el presupuesto de turnos o la implementación de la evaluación.
- Formación en PEFT: sirve como ejemplo práctico de carga y aplicación de adaptadores LoRA con la librería `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. El autor advierte que el rendimiento es sensible al harness y a la configuración de evaluación, por lo que cualquier comparación debe realizarse bajo un protocolo idéntico.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base completo (30B totales, 3B activos) en memoria. Con cuantización (por ejemplo, 4-bit o 8-bit) puede caber en GPUs consumer de gama alta como RTX 4090 (24 GB VRAM) o RTX 3090 (24 GB). Sin cuantización, se recomienda al menos 60-70 GB de VRAM, lo que implica GPUs como A100 (80 GB) o H100.
- El adaptador en sí añade una sobrecarga mínima de memoria (1.5 GB en disco, pero en RAM/VRAM ocupa solo los pesos del LoRA, aproximadamente 100-200 MB según rango y tamaño del modelo).
- Despliegue recomendado: usar `transformers` con `peft` para cargar el adaptador sobre el base. Para inferencia en producción, se puede exportar a formatos como GGUF o usar servidores como vLLM o TGI, aunque no se han documentado configuraciones específicas para este adaptador.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y el número de tokens generados.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que este adaptador es específico para el modelo base NVIDIA Nemotron 3.5 Lightning. Como referencia, se puede comparar con el modelo base sin adaptador y con otros adaptadores LoRA enfocados a tool-use, pero no hay datos públicos de rendimiento. La comparativa más relevante sería contra el propio retraining posterior de TrajectoryLabs (no publicado en este repositorio), que busca superar a esta versión «legacy».

## Limitaciones y advertencias

- El adaptador no incluye los pesos del modelo base; es imprescindible cargar el base en la revisión exacta `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`.
- El rendimiento es muy sensible al harness de agente, las herramientas, el simulador de usuario, la configuración de decodificación, el presupuesto de turnos y la implementación de la evaluación. Cualquier comparación debe hacerse bajo un protocolo idéntico.
- La licencia NVIDIA Open Model License impone restricciones para uso comercial; revisar los términos antes de cualquier despliegue en producción.
- No se han documentado sesgos específicos, pero al derivarse de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o idioma. No hay información sobre evaluación de sesgos.
- El adaptador está diseñado para investigación y evaluación, no para uso directo en producción sin una validación adicional.
- No se especifican idiomas soportados; se asume que el modelo base tiene capacidades multilingües, pero no hay confirmación.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TrajectoryLabs/Nemotron-3.5-Lightning-Tau3-Legacy-LoRA
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/blob/main/LICENSE
- Guía de uso de Nemotron 3.5 Lightning (GitHub de NVIDIA): https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- Repositorio general de Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
