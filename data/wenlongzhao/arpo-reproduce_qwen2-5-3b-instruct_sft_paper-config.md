# wenlongzhao/ARPO-reproduce_Qwen2.5-3B-Instruct_SFT_paper-config

## Resumen

Este modelo es un finetuning completo (full-parameter SFT) de `Qwen/Qwen2.5-3B-Instruct`, desarrollado por wenlongzhao para reproducir la fase de cold-start descrita en el apéndice E.2 del paper de Agentic Reinforced Policy Optimization (ARPO). ARPO es un método de optimización de políticas para agentes que combina una etapa de SFT con datos de tool-use y una etapa posterior de RL. Este checkpoint corresponde exclusivamente a la etapa SFT inicial, siguiendo la configuración denominada "paper" (max length 4096, global batch 128, weight decay 0.1), que se diferencia de una variante "code" publicada por el mismo autor.

El problema que aborda es la reproducibilidad de la fase de arranque del entrenamiento agéntico: ofrece un checkpoint con hiperparámetros exactos y un dataset público para que investigadores puedan verificar los resultados del paper ARPO. La arquitectura es un transformer decoder-only basado en Qwen2.5, con 3.085.938.688 parámetros (3.09B) y una longitud máxima de secuencia de entrenamiento de 4096 tokens. Es un checkpoint de investigación, no un modelo de chat listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.085.938.688 (3.09B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | No disponible en el repositorio (los pesos se publican en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un finetuning full-parameter de `Qwen/Qwen2.5-3B-Instruct`, por lo que no introduce cambios en la arquitectura. Se entrenó con LLaMA-Factory, DeepSpeed ZeRO-3, BF16 y FlashAttention-2, sobre el dataset `dongguanting/ARPO-SFT-54K`, que combina Tool-Star 54K y STILL, el mix oficial de SFT de ARPO. La configuración de entrenamiento es la siguiente:

| Hiperparametro | Valor |
|---|---|
| Learning rate | 7e-6 |
| LR schedule | cosine, warmup ratio 0.1 |
| Epochs | 3 |
| Global batch size | 128 |
| Max sequence length | 4096 |
| Weight decay | 0.1 |
| Precision | BF16 |
| Seed | 42 |

La loss final de entrenamiento fue de 0.6852. La innovación técnica no está en la arquitectura, sino en la receta de entrenamiento: se trata de un checkpoint diseñado específicamente como punto de partida para la fase de RL de ARPO, no como un modelo conversacional autónomo.

## Capacidades

- Generación de texto instructivo basado en el modelo base Qwen2.5-3B-Instruct, pero el README advierte explícitamente que no ha sido evaluado como modelo de chat independiente.
- Orientado a tareas de agente con herramientas, según el dataset de entrenamiento (Tool-Star 54K + STILL).
- No se especifica soporte formal de tool calling, aunque el dataset sugiere un enfoque en uso de herramientas.
- No se han publicado evaluaciones de capacidades multilingües, razonamiento o multi-step reasoning.
- No dispone de modo de pensamiento ("thinking mode") ni de capacidades de visión o audio.
- Es un checkpoint de investigación para SFT agéntica estilo ARPO; su valor principal es la reproducibilidad, no el rendimiento conversacional.

## Casos de uso

- Reproducción de experimentos del paper ARPO: este checkpoint permite verificar la fase de cold-start SFT descrita en el apéndice E.2, usando la misma configuración de hiperparámetros y el dataset oficial.
- Investigación en RL agéntico: sirve como modelo base para aplicar la fase de RL de ARPO, ya que fue entrenado específicamente para ese propósito.
- Comparación de configuraciones de SFT: permite comparar la variante "paper" (max length 4096, weight decay 0.1) con la variante "code" publicada por el mismo autor, para estudiar el efecto de estos hiperparámetros en la calidad del cold-start.
- Análisis de dinámicas de entrenamiento: al publicar la loss final (0.6852) y la configuración completa, los investigadores pueden estudiar el comportamiento de la pérdida, el overfitting o el impacto del weight decay 0.1 en un modelo de 3B.
- Desarrollo de agentes personalizados: el modelo puede ser utilizado como punto de partida para fine-tuning adicional en dominios específicos de tool-use, siempre que se realice una evaluación posterior.
- Baseline académico en alineación de agentes: en trabajos de investigación sobre SFT y RL para agentes, este checkpoint puede servir como baseline reproducible para comparar nuevas propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README solo incluye la loss de entrenamiento final (0.6852), que no es un indicador de rendimiento en tareas de evaluación. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras pruebas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6.2 GB (3.09B x 2 bytes). Con overhead de activaciones y KV cache, se recomienda entre 8 y 12 GB de VRAM para inferencia básica con contextos moderados.
- Si se realiza una cuantización 4-bit manual (no publicada), los pesos ocuparían alrededor de 1.7 GB, y la VRAM total podría reducirse a unos 4-6 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 12 GB de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4090, o GPUs de datacenter como A100 40GB y H100 80GB.
- Sí cabe en GPUs de consumo: es viable en RTX 3060 12GB o superiores con BF16, y también en GPUs de 8GB si se aplica cuantización 4-bit.
- Opciones de despliegue: el modelo es compatible con transformers y puede servirse directamente con vLLM o TGI, ya que los pesos están en safetensors. Para usar llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo que no se proporciona.
- Latencia y throughput: no se han publicado datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-3B-Instruct | 3.09B | No disponible | Apache 2.0 | HuggingFace | Modelo base instruct |
| wenlongzhao/ARPO-reproduce Qwen2.5-3B-Instruct SFT paper-config | 3.09B | 4096 | Apache 2.0 | HuggingFace | Finetune ARPO, variante paper |
| wenlongzhao/ARPO-reproduce Qwen2.5-3B-Instruct SFT code-config | 3.09B | No disponible | Apache 2.0 | HuggingFace | Variante con configuracion de codigo |

El rendimiento comparado no está disponible porque no se han publicado benchmarks para ninguno de estos modelos en la información proporcionada. La principal diferencia entre las dos variantes de ARPO es la configuración de hiperparámetros (max length y weight decay), no la arquitectura ni el dataset.

## Limitaciones y advertencias

- Checkpoint de investigación: el README indica que no ha sido evaluado como modelo de chat independiente y que su uso previsto es la investigación.
- Longitud de contexto limitada: se entrenó con un máximo de 4096 tokens, lo que puede limitar tareas que requieran contextos más largos, aunque el modelo base soporte ventanas mayores.
- Sin benchmarks de capacidades ni de seguridad: no hay evaluaciones publicadas de razonamiento, tool calling, alucinación o sesgos.
- Sesgos no mitigados: al ser un finetuning del modelo base y del dataset ARPO-SFT-54K, los sesgos presentes en ambos no han sido documentados ni corregidos.
- Riesgo de alucinación: inherente a un modelo de 3B, especialmente en tareas de agentes donde las llamadas a herramientas pueden fallar.
- Licencia y dataset: la licencia del modelo es Apache 2.0, pero el README remite a las licencias del modelo base y del dataset de entrenamiento. Es necesario revisar las condiciones de `dongguanting/ARPO-SFT-54K` antes de un uso comercial.
- Despliegue en producción: no se recomienda su uso directo en sistemas productivos sin una evaluación previa y posible fine-tuning adicional.
- Cuantizaciones no publicadas: no hay versiones GGUF ni cuantizaciones 4-bit en el repositorio, lo que dificulta su despliegue en entornos con recursos muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wenlongzhao/ARPO-reproduce_Qwen2.5-3B-Instruct_SFT_paper-config
- Variante code: https://huggingface.co/wenlongzhao/ARPO-reproduce_Qwen2.5-3B-Instruct_SFT_code-config
- Paper ARPO: https://arxiv.org/abs/2507.19849
- Dataset ARPO-SFT-54K: https://huggingface.co/datasets/dongguanting/ARPO-SFT-54K
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
