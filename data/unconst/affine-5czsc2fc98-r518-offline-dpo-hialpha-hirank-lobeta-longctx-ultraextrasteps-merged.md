# unconst/Affine-5czsc2fc98-r518-offline-dpo-hialpha-hirank-lobeta-longctx-ultraextrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r518-offline-dpo-hialpha-hirank-lobeta-longctx-ultraextrasteps-merged` es un checkpoint fusionado (merged) a partir de un LoRA aplicado sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según las etiquetas de HuggingFace, el modelo base parece pertenecer a la familia Qwen3.5 MoE y soporta tareas de imagen-texto a texto, aunque no se dispone de documentación oficial que confirme estas características. El autor lo describe como un "salvamento de checkpoint" (H1 merged checkpoint salvage) con fines de "seguro TTL privado", indicando que no es una versión final ni una propuesta para evaluación pública hasta que se supere una fase de validación (Stage-5 gate). Con 35.107.181.936 parámetros y un peso de 70.2 GB en formato safetensors, se trata de un modelo de gran tamaño, pero su uso práctico está limitado por la ausencia de información técnica detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (según tags, no confirmado oficialmente) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Las etiquetas de HuggingFace sugieren que se basa en una arquitectura MoE (mixture of experts) de la familia Qwen3.5 y que incorpora capacidades multimodales (image-text-to-text), pero estos datos no están confirmados por el autor. El proceso de entrenamiento tampoco está documentado: solo se indica que el checkpoint es el resultado de fusionar un LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. No se especifican datos sobre el corpus de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del archivo incluye términos como "offline-dpo", "hialpha", "hirank", "lobeta", "longctx" y "ultraextrasteps", que sugieren posibles configuraciones de hiperparámetros o etapas de entrenamiento, pero no hay confirmación oficial de su significado.

## Capacidades

No se dispone de información verificada sobre las capacidades funcionales del modelo. Según las etiquetas, podría ser capaz de:

- Generación de texto conversacional (pipeline: text-generation)
- Procesamiento de entradas multimodales (imagen y texto), si la arquitectura Qwen3.5 MoE lo soporta
- Razonamiento y generación de código, asumiendo que hereda las capacidades de la familia Qwen

Sin embargo, al no existir documentación oficial, estas capacidades son inferencias basadas en los tags y no deben considerarse confirmadas.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que el autor lo describe como un "salvamento de checkpoint" con fines de "seguro privado", no está destinado a un despliegue en producción. Su uso principal podría ser:

- Investigación interna: análisis de la evolución del entrenamiento de modelos MoE multimodales, comparando este checkpoint con versiones anteriores o posteriores.
- Experimentación con técnicas de fusión LoRA: estudiar el efecto de la fusión de LoRA en modelos de gran escala.
- Reproducción de resultados: si el autor publica más adelante los detalles del entrenamiento, este checkpoint podría servir para reproducir experimentos.

No obstante, cualquier uso práctico requiere primero obtener información adicional del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre rendimiento en tareas como MMLU, HumanEval, GSM8K u otras. Tampoco se han comparado métricas de latencia o throughput.

## Requisitos de hardware

Dado el tamaño del modelo (35.107.181.936 parámetros), se pueden estimar los requisitos de hardware para inferencia, asumiendo una arquitectura densa (aunque podría ser MoE, lo que reduciría los requisitos de memoria activa):

- VRAM estimada en FP16: aproximadamente 70 GB (35B × 2 bytes), lo que requiere una GPU con al menos 80 GB, como una A100 (80 GB) o H100 (80 GB).
- VRAM estimada en INT8: aproximadamente 35 GB, lo que podría caber en una RTX 4090 (24 GB) no, necesitaría una A6000 (48 GB) o similar.
- VRAM estimada en INT4: aproximadamente 17.5 GB, lo que cabría en una RTX 3090 (24 GB) o RTX 4090 (24 GB) con cuantización.
- Opciones de despliegue: dado que es un modelo de transformers, se podría servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay confirmación de compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo base `kevin954/Affine-5dfqbbh8ev-sft` no tiene una ficha pública detallada, y no se conocen alternativas de la misma familia con características similares. Por tanto, no es posible realizar una comparativa fiable.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card oficial, ni detalles de entrenamiento, ni especificaciones de contexto o idiomas.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin autorización explícita.
- Estado experimental: el autor lo describe como un "salvamento" no destinado a evaluación pública, lo que sugiere que puede contener artefactos de entrenamiento o no estar optimizado para inferencia.
- Riesgo de alucinación y sesgos: al no conocerse los datos de entrenamiento, no se pueden evaluar los sesgos potenciales ni el riesgo de generar contenido incorrecto.
- No apto para producción: sin benchmarks ni validación, no es recomendable utilizarlo en aplicaciones reales.

## Enlaces

- [HuggingFace - unconst/Affine-5czsc2fc98-r518-offline-dpo-hialpha-hirank-lobeta-longctx-ultraextrasteps-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r518-offline-dpo-hialpha-hirank-lobeta-longctx-ultraextrasteps-merged)
- [Modelo base - kevin954/Affine-5dfqbbh8ev-sft](https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft) (enlace inferido, no confirmado)
