# unconst/Affine-5czsc2fc98-r513-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged

## Resumen

Este checkpoint, publicado por el usuario `unconst`, es un modelo de lenguaje de tipo *mixture of experts* (MoE) basado en la arquitectura Qwen3.5 MoE, según las etiquetas del repositorio. Se presenta como un "salvamento" de un checkpoint intermedio, resultado de la fusión de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. El nombre del repositorio sugiere un proceso de *offline DPO* con hiperparámetros específicos (alpha alto, rank medio, beta bajo, contexto largo y pasos extra), aunque no se aporta documentación detallada al respecto.

Con 35.107.181.936 parámetros totales (aproximadamente 35,1 mil millones), el modelo está orientado a generación de texto y conversación, y las etiquetas indican capacidades multimodales de imagen a texto, aunque no se confirma su funcionamiento real. Se trata de un experimento de la comunidad, sin licencia declarada y con cero descargas, por lo que su uso en producción no está recomendado sin una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.5, segun etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de *mixture of experts* (MoE), como indica la etiqueta `qwen3_5_moe`. No se especifican el número de expertos ni los parámetros activos. El checkpoint se genera mediante la fusión de LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de otro modelo. El nombre del repositorio sugiere un entrenamiento con *offline DPO* (Direct Preference Optimization) con parámetros como `hialpha` (alpha alto), `midrank` (rank medio), `lobeta` (beta bajo) y `longctx` (contexto largo), además de pasos extra (`ultraextrasteps`). Sin embargo, no se proporciona información sobre el dataset, el número de tokens de entrenamiento ni el proceso exacto. No hay evidencia de innovaciones técnicas adicionales más allá de la fusión LoRA.

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`).
- Posible procesamiento de imágenes (etiqueta `image-text-to-text`), aunque no se ha verificado su funcionamiento.
- No se dispone de información sobre *tool calling*, *function calling*, razonamiento multi-paso o capacidades de agente.
- No se han documentado capacidades multilingües específicas.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y requieren validación previa:

- Investigación académica: evaluar el comportamiento de un MoE de 35B entrenado con DPO offline y contexto largo, comparando con otros modelos de la misma familia.
- Fine-tuning adicional: servir como punto de partida para experimentos de adaptación a dominios específicos, aprovechando la fusión LoRA ya aplicada.
- Pruebas de capacidad multimodal: si la etiqueta `image-text-to-text` se confirma, explorar tareas de descripción de imágenes o VQA, aunque no hay garantía de que el modelo funcione correctamente.
- Benchmarking de eficiencia: medir el rendimiento de inferencia en hardware consumer con cuantizaciones (si se generan) para evaluar su viabilidad en entornos con recursos limitados.
- Desarrollo de prototipos conversacionales: probar su comportamiento en diálogos multi-turno, aunque sin licencia clara no se recomienda para uso comercial.
- Análisis de sesgos y alucinaciones: estudiar los riesgos de un modelo entrenado con DPO y contexto largo, contribuyendo a la literatura sobre alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B parámetros, en FP16 se necesitarían aproximadamente 70 GB de VRAM. Con cuantización 8-bit, unos 35 GB; con 4-bit, unos 20 GB. Sin embargo, no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una A100 80GB o H100. Para 8-bit, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría una A6000 (48 GB) o similar. Para 4-bit, una RTX 4090 podría funcionar, pero con limitaciones de contexto.
- No se confirma que quepa en GPUs consumer sin cuantización.
- Opciones de despliegue: al ser un modelo de transformers, se puede usar con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF). No hay soporte nativo en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación se limita a características generales. Se comparan con otros MoE de tamaño similar:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Affine-5czsc2fc98-r513 (este) | 35,1 B | no disponible | no disponible | no disponible |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 |
| DeepSeek-MoE 16B | 16 B | 2,8 B | 4k | MIT |
| Qwen2.5-MoE (si existiera) | no disponible | no disponible | no disponible | no disponible |

La comparación es limitada porque no se conocen los parámetros activos ni el contexto de este modelo. Mixtral 8x7B es un MoE consolidado con licencia permisiva, mientras que este checkpoint carece de licencia y documentación.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card detallada, ni información sobre entrenamiento, datos o evaluación.
- Licencia no disponible: no se puede usar comercialmente sin conocer los términos.
- Riesgo de alucinación y sesgos: al ser un checkpoint experimental sin evaluación, es probable que presente comportamientos no deseados.
- Capacidades multimodales no verificadas: la etiqueta `image-text-to-text` no garantiza que el modelo funcione correctamente con imágenes.
- Sin soporte de la comunidad: cero descargas y cero likes indican que no ha sido probado por terceros.
- Posible inestabilidad: al ser un "salvamento" de un proceso de entrenamiento, puede tener pesos corruptos o incompletos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r513-offline-dpo-hialpha-midrank-lobeta-longctx-ultraextrasteps-merged
- Checkpoint relacionado (r490): https://huggingface.co/unconst/Affine-5czsc2fc98-r490-offline-dpo-hialpha-midrank-lobeta-extrasteps-merged
- Checkpoint relacionado (h51): https://huggingface.co/unconst/Affine-5czsc2fc98-h51-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
