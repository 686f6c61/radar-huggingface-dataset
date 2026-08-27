# tianzl66/Llama-3.1-8B-Instruct-InstructionFollowing-SpectralSurgery-HNS8p2

## Resumen

Este repositorio contiene un adaptador LoRA derivado de un checkpoint de fine-tuning con instrucciones sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. El adaptador ha sido procesado mediante la técnica Spectral Surgery con pasos HNS (8 rápidos y 2 estables), con el objetivo de mejorar el seguimiento de instrucciones. Según la evaluación en IFEval, el adaptador editado supera tanto al modelo base como al LoRA original en las cuatro métricas reportadas, con mejoras de entre 2,87 y 3,51 puntos porcentuales respecto al LoRA sin editar.

El modelo está diseñado para desarrolladores e investigadores que buscan un adaptador ligero (0,2 GB) que mejore la adherencia a instrucciones complejas sin necesidad de reentrenar el modelo completo. Al estar basado en Llama-3.1-8B-Instruct, hereda su arquitectura transformer con atención por grupos (GQA) y su capacidad multilingüe, aunque el adaptador en sí no añade nuevas capacidades más allá del ajuste de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Llama-3.1-8B-Instruct (transformer con GQA) |
| Parametros totales | no disponible (adaptador de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero el adaptador se entrenó con secuencias de 1024) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, sin cuantizaciones específicas) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para el adaptador) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base Llama-3.1-8B-Instruct. Los hiperparámetros de entrenamiento incluyen una longitud de secuencia de 1024, un tamaño de batch global de 128 y una semilla de 42. Tras el entrenamiento, se aplica Spectral Surgery con pasos HNS (8 rápidos y 2 estables), una técnica de edición de pesos que modifica el adaptador para mejorar su rendimiento en tareas de seguimiento de instrucciones.

No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de SFT más allá de los hiperparámetros mencionados. La técnica Spectral Surgery se basa en la descomposición espectral de los pesos y su posterior reconstrucción con restricciones, pero no se especifican los detalles matemáticos en la documentación disponible.

## Capacidades

- Mejora del seguimiento de instrucciones: el adaptador está específicamente diseñado para aumentar la precisión en tareas que requieren cumplir instrucciones detalladas, como se refleja en las métricas de IFEval.
- Hereda las capacidades del modelo base: al ser un adaptador sobre Llama-3.1-8B-Instruct, conserva las habilidades de generación de texto, razonamiento, código y diálogo multilingüe del modelo original, aunque no se han evaluado específicamente en este adaptador.
- No se documentan capacidades adicionales como tool calling, agentes o visión. La información disponible solo cubre el rendimiento en IFEval.

## Casos de uso

- Asistentes conversacionales con requisitos estrictos de formato: el adaptador puede emplearse en chatbots que deban seguir plantillas de respuesta o cumplir con restricciones de estilo, gracias a su mejora en IFEval.
- Generación de respuestas a comandos multi-paso: en aplicaciones donde el usuario da instrucciones complejas con varios pasos, el adaptador puede reducir errores de omisión o desviación.
- Automatización de tareas administrativas: para generar correos, informes o documentos a partir de especificaciones detalladas, donde el cumplimiento exacto de la instrucción es crítico.
- Evaluación de modelos de seguimiento de instrucciones: el adaptador puede servir como referencia en pipelines de evaluación comparativa, dado que su rendimiento en IFEval está documentado.
- Fine-tuning adicional sobre dominios específicos: al ser un adaptador ligero, puede combinarse con otros LoRA o utilizarse como punto de partida para tareas verticales que requieran alta fidelidad a instrucciones.
- Investigación en edición de modelos: el adaptador es un caso de estudio de Spectral Surgery aplicada a LoRA, útil para experimentos sobre modificación de pesos y su impacto en el comportamiento.

## Benchmarks y rendimiento

La evaluación se realizó en IFEval, con los siguientes resultados:

| Modelo | Prompt Strict | Prompt Loose | Instruction Strict | Instruction Loose |
|---|---:|---:|---:|---:|
| Base (Llama-3.1-8B-Instruct) | 65,80% | 72,83% | 75,54% | 81,18% |
| LoRA SFT (sin editar) | 65,99% | 70,98% | 74,82% | 79,26% |
| **Spectral Surgery HNS 8+2** | **69,50%** | **73,94%** | **77,94%** | **82,13%** |

El adaptador editado supera al LoRA original en todas las métricas, con mejoras de entre 2,87 y 3,51 puntos porcentuales, y también supera al modelo base en los cuatro indicadores. No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Para usar el adaptador es necesario cargar el modelo base Llama-3.1-8B-Instruct, que requiere aproximadamente 16 GB de VRAM en precisión fp16.
- Con cuantización Q4, el modelo base puede caber en GPUs de consumo con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060.
- El adaptador en sí ocupa solo 0,2 GB, por lo que el requisito principal es el del modelo base.
- Opciones de despliegue: el adaptador puede integrarse con librerías que soporten PEFT, como Hugging Face Transformers, vLLM, o llama.cpp (si se convierte a GGUF). No se especifican configuraciones de latencia o throughput.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros adaptadores equivalentes.

| Modelo | Parámetros | Contexto | IFEval (Prompt Strict) | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 65,80% | Llama 3.1 Community License |
| LoRA SFT (sin editar) | 8B + LoRA r16 | 1024 (entrenamiento) | 65,99% | no disponible |
| **Spectral Surgery HNS 8+2** | 8B + LoRA r16 | 1024 (entrenamiento) | 69,50% | no disponible |

No se dispone de información sobre otros adaptadores de seguimiento de instrucciones para comparar.

## Limitaciones y advertencias

- La evaluación se limita a IFEval; no hay evidencia de rendimiento en otras tareas o dominios.
- El adaptador se entrenó con secuencias de 1024 tokens, por lo que puede degradarse con contextos más largos, aunque el modelo base soporte 128k.
- No se especifica la licencia del adaptador, lo que impide determinar si es apto para uso comercial sin autorización explícita.
- Al ser un adaptador sobre un modelo con sesgos conocidos (Llama-3.1), puede heredar esos sesgos en sus respuestas.
- No se documentan riesgos de alucinación específicos, pero son inherentes al modelo base.
- La técnica Spectral Surgery puede introducir cambios no evaluados en otros benchmarks; se recomienda validar en el caso de uso concreto antes de producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-InstructionFollowing-SpectralSurgery-HNS8p2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
