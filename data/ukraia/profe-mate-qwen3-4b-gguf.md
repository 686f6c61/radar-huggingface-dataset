# ukraia/profe-mate-qwen3-4b-GGUF

## Resumen

`profe-mate-qwen3-4b-GGUF` es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario `ukraia` en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El nombre sugiere una especialización orientada a la enseñanza de matemáticas ("profe-mate"), aunque la model card no documenta el conjunto de datos de entrenamiento ni el objetivo concreto del ajuste. El proceso de fine-tuning y conversión se realizó con Unsloth, según indica el propio autor.

El modelo cuenta con 4.022.468.096 parámetros (aproximadamente 4 mil millones) y un tamaño de repositorio de 2,5 GB, lo que corresponde a una única cuantización Q4_K_M. Al derivar de Qwen3-4B-Instruct-2507, hereda la arquitectura transformer densa y la ventana de contexto de la familia Qwen3, aunque el autor no replica estas especificaciones en la model card.

La relevancia de esta ficha es limitada: se trata de una publicación con cero descargas y cero "likes" en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Es útil principalmente como ejemplo de pipeline de fine-tuning con Unsloth y despliegue vía GGUF, más que como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de parametros) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4 mil millones de parámetros. El autor indica que el ajuste y la conversión a GGUF se realizaron con Unsloth, una librería que optimiza el entrenamiento y la cuantización de modelos LLM. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado.

Tampoco se especifica si se modificó la ventana de contexto original del modelo base ni si se aplicaron innovaciones técnicas adicionales (atención lineal, decodificación especulativa, modos de razonamiento). La única información técnica verificable es el tamaño de parámetros y la cuantización Q4_K_M publicada, que reduce el peso a 2,5 GB.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas: el nombre "profe-mate" sugiere especialización en explicaciones matemáticas, aunque no se documenta formalmente.
- Soporte de tool calling / function calling: presumiblemente heredado de Qwen3-Instruct, no verificado en la model card.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo "thinking": no documentado; Qwen3-Instruct-2507 no emplea modo thinking explícito en su variante estándar.
- Despliegue vía llama.cpp (`llama-cli`) y Ollama (Modelfile incluido).

## Casos de uso

- Asistente educativo de matemáticas: el modelo podría emplearse para resolver y explicar problemas paso a paso en entornos de tutoría, aunque la ausencia de benchmarks impide validar su calidad real en esta tarea.
- Despliegue local en hardware modesto: con 2,5 GB en Q4_K_M, cabe en GPUs de consumo y en CPU, lo que permite prototipos sin infraestructura cloud.
- Pruebas de pipelines de fine-tuning con Unsloth: sirve como ejemplo reproducible de ajuste + conversión a GGUF para desarrolladores que quieran replicar el flujo.
- Chat conversacional offline: integrable en aplicaciones de escritorio o embebidas mediante llama.cpp u Ollama.
- Evaluación comparativa de ajustes comunitarios: útil para estudiar cómo se comporta un fine-tuning pequeño frente al modelo base en tareas matemáticas.
- Base para nuevos fine-tunings: al estar en GGUF y derivar de Qwen3-4B, puede servir como punto de partida para experimentos de cuantización o ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100); también funciona en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y potencialmente cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| profe-mate-qwen3-4b-GGUF | 4,02 B | No disponible | No disponible | GGUF Q4_K_M | Fine-tuning comunitario sin benchmarks |
| Qwen3-4B-Instruct-2507 | ~4 B | No disponible en esta ficha | Apache 2.0 (modelo base Qwen) | Safetensors, GGUF | Modelo base oficial, con benchmarks publicados por Alibaba |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | Safetensors, GGUF | Alternativa de tamaño similar con licencia restrictiva |
| Phi-3.5-mini | 3,8 B | 128 K | MIT | Safetensors, GGUF | Alternativa con licencia permisiva y benchmarks publicados |

La comparación con el modelo base Qwen3-4B-Instruct-2507 es la más directa: `profe-mate` es un derivado sin documentación de licencia ni evaluación, por lo que en producción conviene preferir el modelo base salvo que se valide empíricamente la mejora del ajuste.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3-4B-Instruct-2507.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base en tareas matemáticas o de otro tipo.
- Sin documentación del dataset de entrenamiento: riesgo de sesgos desconocidos y de sobreajuste a dominios no especificados.
- Idiomas no declarados: se desconoce si mantiene el multilingüismo del modelo base.
- Contexto no especificado: no se confirma si conserva la ventana original de Qwen3.
- Riesgo de alucinación: inherente a modelos de 4 B; mayor en razonamiento matemático si el ajuste no fue riguroso.
- Repositorio con cero descargas y cero interacciones: sin validación comunitaria.
- Única cuantización disponible (Q4_K_M): no hay opciones de mayor precisión (Q8, F16) para evaluar pérdida de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/ukraia/profe-mate-qwen3-4b-GGUF
- Unsloth (herramienta usada para el fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
