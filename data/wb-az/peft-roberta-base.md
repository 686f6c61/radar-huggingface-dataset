# Wb-az/peft-roberta-base

## Resumen
`Wb-az/peft-roberta-base` es un adaptador PEFT/LoRA para `roberta-base`, desarrollado por el usuario Wb-az y orientado a clasificación de emociones en seis clases: tristeza, alegría, amor, enfado, miedo y sorpresa. No es un modelo completo: el repositorio contiene únicamente el adaptador; los pesos de `roberta-base` deben cargarse por separado.

El adaptador se enmarca en el proyecto Emotional Sentiment Benchmark: Quantised Transformers Pipeline, que compara ModernBERT, RoBERTa y Facebook OPT-350M bajo una metodología común de ajuste eficiente de parámetros, cuantización TorchAO int8 y evaluación de clasificación. La licencia declarada es MIT.

El autor reporta una accuracy de 0,9745 y un F1 de 0,9609 sobre un conjunto combinado de emociones basado en tuits. Estos resultados aparecen en la model card y en el model-index con `verified: false`, por lo que no han sido validados de forma independiente.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`roberta-base`) con adaptador LoRA/PEFT para clasificación de secuencias |
| Parámetros totales | no disponible; el repositorio contiene solo el adaptador LoRA, no los pesos de `roberta-base` |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | TorchAO int8 weight-only (`Int8WeightOnlyConfig(version=2)`) en capas `nn.Linear` elegibles; cabeza de clasificación excluida; etiqueta `int8` |
| Idiomas soportados | no disponible |
| Licencia | MIT para el adaptador; la licencia de `roberta-base` no se detalla en la información proporcionada |
| Formato de pesos | SafeTensors para el adaptador PEFT/LoRA; pesos base no incluidos |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA sobre `roberta-base`, un encoder Transformer, para una tarea de clasificación de secuencias con seis etiquetas. La model card indica que el backbone permanece congelado, que se aplica LoRA y que la cuantización TorchAO int8 se aplica a las capas lineales elegibles del backbone, excluyendo la cabeza de clasificación mediante el filtro compartido `HEAD_PREFIXES`. En inferencia, el pipeline reconstruye primero el modelo de clasificación de seis clases a partir de la configuración PEFT y después adjunta el adaptador; si se solicita inferencia cuantizada, la cuantización se aplica antes de cargar el adaptador.

El entrenamiento se realizó sobre un corpus combinado de dos datasets de emociones basados en tuits, con más de 450.000 ejemplos fuente y seis clases: tristeza, alegría, amor, enfado, miedo y sorpresa. La model card menciona un desequilibrio de clases sustancial y la aplicación de intervenciones durante el entrenamiento, aunque no detalla su implementación. Los hiperparámetros declarados son: 1 época, learning rate 0,0001, batch size 8, acumulación de gradientes 4, batch efectivo 32, optimizador AdamW torch fused, scheduler lineal y semilla 42. No se documenta RLHF ni DPO; se trata de un ajuste supervisado de clasificación. Las versiones de framework indicadas son PEFT 0.18.1, Transformers 5.2.0, Py
