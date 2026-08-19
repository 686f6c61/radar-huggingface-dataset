# unconst/Affine-5czsc2fc98-r534-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-extrasteps-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r534-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-extrasteps-merged` es un checkpoint derivado de la familia Affine, creado por el usuario `unconst` como un "salvamento" de un merge de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según las etiquetas del repositorio, pertenece a la arquitectura `qwen3_5_moe` y se describe como `image-text-to-text`, lo que sugiere una capacidad multimodal, aunque no hay documentación oficial que lo confirme.

Se trata de un modelo intermedio, no de una versión final de producción: el propio autor indica en la model card que es un "Private TTL insurance; not a submission until Stage-5 gate clears", es decir, un checkpoint de respaldo privado antes de una etapa de validación. Con aproximadamente 34,66 mil millones de parámetros y un tamaño de repositorio de 70,2 GB, es un modelo de gran escala que requiere recursos de hardware considerables para su inferencia.

La relevancia de este modelo reside en su naturaleza experimental: muestra un proceso de ajuste mediante DPO (offline) con parámetros de alta y baja magnitud, y un contexto suave (soft context). Sin embargo, al carecer de documentación técnica, benchmarks o ejemplos de uso, su utilidad práctica es limitada fuera del propio flujo de desarrollo del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (según etiquetas, no confirmado) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada. Las etiquetas del repositorio indican `qwen3_5_moe`, lo que apunta a una arquitectura de mezcla de expertos (MoE) de la familia Qwen, y `image-text-to-text`, lo que sugiere capacidades multimodales (entrada de imagen y texto). No obstante, no se proporcionan detalles sobre el número de expertos, el mecanismo de atención o el diseño de las capas.

El modelo es el resultado de un merge de LoRA sobre el checkpoint `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un modelo ajustado mediante supervisión (SFT). El nombre del repositorio incluye los términos `offline-dpo`, `hialpha`, `hirank`, `lobeta`, `softctx` y `extrasteps`, lo que sugiere un entrenamiento con optimización por preferencias directa (DPO) en modo offline, con valores de alpha altos, rango alto, beta bajo, contexto suave y pasos adicionales. Sin embargo, no hay información sobre el dataset utilizado, el número de tokens de entrenamiento ni el proceso de alineación completo.

## Capacidades

No se dispone de una lista oficial de capacidades. Basándose en las etiquetas, el modelo podría ser capaz de:

- Generación de texto conversacional (etiqueta `text-generation`, `conversational`).
- Procesamiento de entrada multimodal (etiqueta `image-text-to-text`), aunque no hay ejemplos ni demos que lo confirmen.
- Razonamiento y generación de código, por su posible base Qwen, pero sin evidencia directa.

No hay información sobre soporte de tool calling, agentes, ni modos de pensamiento especiales. Dada la falta de documentación, estas capacidades deben considerarse no verificadas.

## Casos de uso

No se pueden recomendar casos de uso concretos para este modelo por las siguientes razones:

- Es un checkpoint intermedio sin validación final (el propio autor lo describe como "salvamento").
- No hay documentación sobre su rendimiento, limitaciones o comportamiento en tareas específicas.
- No se han publicado ejemplos de uso ni demos.

Cualquier intento de utilizarlo en producción sería prematuro y arriesgado. Si se desea explorar su comportamiento, se podría realizar una evaluación local con datos propios, pero no se recomienda su integración en flujos de trabajo reales hasta que el autor publique una versión estable y documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

Dado que el modelo tiene 34.660.610.688 parámetros (34,66 B), se pueden estimar los requisitos de memoria para inferencia, aunque no hay datos oficiales:

- **VRAM estimada**:
  - Precisión FP16 (2 bytes por parámetro): aproximadamente 69 GB.
  - Precisión INT8 (1 byte por parámetro): aproximadamente 35 GB.
  - Cuantización de 4 bits (0,5 bytes por parámetro): aproximadamente 17 GB.

- **GPU recomendadas**:
  - Para FP16: GPU profesional como NVIDIA A100 (80 GB) o H100 (80 GB).
  - Para INT8 o 4 bits: GPU de consumo como RTX 4090 (24 GB) podría ser insuficiente para INT8 (35 GB), pero podría funcionar con cuantización de 4 bits (17 GB) si se dispone de suficiente VRAM y se usa una implementación optimizada.

- **Opciones de despliegue**: no se especifican. Dado que el formato es safetensors y la librería es transformers, se podría usar vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay garantía de compatibilidad sin pruebas.

- **Latencia y throughput**: no disponibles.

Estas cifras son estimaciones teóricas basadas únicamente en el número de parámetros; la arquitectura MoE podría reducir la memoria activa si se implementa correctamente, pero no hay datos al respecto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo base `kevin954/Affine-5dfqbbh8ev-sft` no es público en cuanto a sus características, y el propio checkpoint no tiene documentación. No se pueden comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Falta de documentación**: no hay model card detallada, ni especificaciones técnicas, ni ejemplos de uso.
- **Checkpoint intermedio**: el autor lo describe como un "salvamento" temporal, no como una versión final. Puede contener artefactos de entrenamiento o no estar completamente optimizado.
- **Sesgos y alucinaciones**: al ser un modelo de gran tamaño sin evaluación publicada, es probable que presente sesgos y alucinaciones, pero no hay datos para confirmarlo.
- **Licencia**: no se especifica ninguna licencia, lo que impide su uso comercial o incluso su redistribución sin autorización explícita.
- **Riesgo de producción**: sin benchmarks ni validación, no es recomendable su uso en entornos productivos.
- **Idiomas**: no se indica qué idiomas soporta, aunque probablemente herede las capacidades multilingües de la familia Qwen, pero sin confirmación.

## Enlaces

- Repositorio HuggingFace: [unconst/Affine-5czsc2fc98-r534-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-extrasteps-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r534-loveaffine-offline-dpo-hialpha-hirank-lobeta-softctx-extrasteps-merged)

No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
