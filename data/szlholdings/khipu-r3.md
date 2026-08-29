# SZLHOLDINGS/khipu-r3

## Resumen

SZLHOLDINGS/khipu-r3 es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT, desarrollado por SZLHOLDINGS, que se aplica sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un experimento de fine-tuning ligero dentro de un curriculum denominado "khipu", entrenado con un conjunto de datos extremadamente reducido (23 filas) y sin evaluación sobre datos held-out. El adaptador se publica con licencia Apache 2.0 y en formato safetensors, utilizando la librería PEFT.

La relevancia de este modelo es limitada: no es un modelo completo, sino un adaptador que modifica parcialmente los pesos de un modelo base pequeño (0.8B parámetros). Su propósito parece ser explorar metodologías de entrenamiento eficiente (bf16 LoRA) sobre arquitecturas Qwen, pero sin evidencia de rendimiento o utilidad práctica. No se han publicado benchmarks ni métricas de evaluación, y la pérdida de entrenamiento reportada (0.4397) es una métrica de train, no de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador tiene r=16, α=32, pero el tamaño exacto no se especifica) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | bf16 (LoRA en bf16, no QLoRA) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador khipu-r3 es una LoRA con rango r=16 y alpha α=32, entrenada en precisión bf16 sobre el modelo base Qwen/Qwen3.5-0.8B. Según la model card, se utilizó la librería Unsloth para el entrenamiento. El conjunto de datos de entrenamiento consta de 23 filas, distribuidas en dos archivos: `train.jsonl` y `train.abstain.jsonl`. La pérdida de entrenamiento final fue de 0.4397, pero no se realizó evaluación sobre datos held-out. La model card indica explícitamente que QLoRA está prohibido en Qwen3.5, por lo que se optó por LoRA en bf16. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas del adaptador. Al ser un LoRA sobre un modelo base pequeño, las capacidades funcionales son las del modelo Qwen3.5-0.8B, pero no se documentan en la model card. No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües específicas. El adaptador parece ser un experimento de investigación sin validación funcional.

## Casos de uso

No se han documentado casos de uso concretos para este adaptador. Dado su tamaño de entrenamiento extremadamente reducido (23 filas) y la ausencia de evaluación, no es recomendable utilizarlo en aplicaciones reales. Posibles escenarios teóricos, sin evidencia de funcionamiento:

- Experimentación académica: podría servir como ejemplo de fine-tuning LoRA sobre modelos pequeños, pero sin garantía de calidad.
- Pruebas de integración: para verificar el flujo de trabajo con PEFT y Unsloth en entornos de desarrollo.
- Investigación sobre curricula de entrenamiento: el nombre "khipu" sugiere un enfoque de curriculum, pero no hay datos que respalden su eficacia.

En ningún caso se recomienda su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento (0.4397), que no es indicativa de rendimiento general. No hay comparaciones con otros modelos.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen/Qwen3.5-0.8B más un pequeño overhead por los pesos del adaptador. No se especifican requisitos concretos en la documentación. En general, un modelo de 0.8B parámetros puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, con VRAM de 4-6 GB en cuantización ligera. Para el adaptador, se puede cargar junto al modelo base usando librerías como PEFT, vLLM o Transformers. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un adaptador experimental sobre un modelo base no estándar (Qwen3.5-0.8B), no hay alternativas directas documentadas. Se podría comparar con otros adaptadores LoRA de Qwen, pero no hay datos públicos.

## Limitaciones y advertencias

- Entrenamiento con solo 23 filas de datos, lo que implica un altísimo riesgo de sobreajuste y nula generalización.
- No se realizó evaluación sobre datos held-out; la pérdida de entrenamiento no es una métrica de calidad.
- La model card indica `publication_eligible: false`, lo que sugiere que el autor no lo considera apto para publicación científica.
- No se documentan sesgos, pero al ser un adaptador no validado, cualquier sesgo del modelo base puede verse amplificado.
- Riesgo de alucinación alto debido al sobreajuste y al pequeño tamaño del modelo base.
- No se recomienda su uso en producción ni en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías de funcionamiento lo hace inadecuado para entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/khipu-r3
- GitHub (fuente del curriculum khipu): https://github.com/szl-holdings/szl-forge/tree/main/khipu
- Repositorio de consenso Khipu (relacionado, no directamente con el modelo): https://github.com/szl-holdings/khipu-consensus/tree/main/
