# Wayfinder6/bones-sage-freshdata

## Resumen

`Wayfinder6/bones-sage-freshdata` es un adaptador LoRA para MLX desarrollado por Wayfinder6 (Kory Indahl), construido sobre el modelo base `mlx-community/Qwen2.5-14B-Instruct-4bit`. Forma parte de la familia `bones-sage-nova-lora`, concretamente de la línea de iteración activa `adapters_freshdata_v7`, no del lanzamiento principal. El autor lo publica como un checkpoint automático sin selección de resultados, siguiendo su política de mantener un historial visible y honesto.

El adaptador está orientado al uso con múltiples agentes (`multi-agent`), aunque no se especifican detalles adicionales sobre el dominio de entrenamiento. El repositorio ocupa 3,7 GB, correspondientes al adaptador LoRA y al modelo base cuantizado en 4 bits. Fue creado el 23 de agosto de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta.

La relevancia de este modelo reside en su enfoque de iteración continua y transparente dentro de un ecosistema de modelos LoRA para MLX, aunque carece de documentación técnica detallada y de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre Qwen2.5-14B-Instruct-4bit) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el base Qwen2.5-14B-Instruct soporta hasta 128K tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | 4-bit (base), LoRA sin cuantizacion adicional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que modifica parcialmente los pesos del modelo base `Qwen2.5-14B-Instruct-4bit`, un transformer de 14 mil millones de parametros cuantizado a 4 bits y optimizado para MLX. La arquitectura subyacente es un transformer denso con atención causal, entrenado previamente con instrucciones.

El entrenamiento del adaptador se realizó sobre un corpus real de 2268 filas, con una pérdida de validación final de 1,679. No se han publicado detalles sobre el proceso de entrenamiento (número de épocas, configuración de hiperparámetros, si se usó RLHF o DPO, etc.). El autor indica que es un push automático del checkpoint más reciente, sin curado de resultados, siguiendo su política de historia visible.

## Capacidades

Al ser un adaptador LoRA sobre Qwen2.5-14B-Instruct-4bit, hereda las capacidades generales del modelo base:

- Generacion de texto, razonamiento, codigo, matematicas y comprension lectora.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Capacidades multilingues (el base Qwen2.5 soporta mas de 29 idiomas).
- Orientacion multi-agente declarada en los tags, aunque no se detalla la implementacion.
- Ejecucion en MLX, optimizado para Apple Silicon.

No se han publicado capacidades especiales adicionales (vision, audio, etc.) para este adaptador.

## Casos de uso

No se dispone de casos de uso concretos documentados para este adaptador. Al ser un checkpoint de iteración activa y sin benchmarks, no es recomendable para entornos de producción. Los posibles casos de uso serían los del modelo base Qwen2.5-14B-Instruct, como:

- Experimentación con agentes multi-agente en entornos MLX.
- Prototipado rápido de aplicaciones de chat o asistentes con el modelo base.
- Evaluación de la metodología de iteración continua del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de validación final de 1,679 sobre el corpus de entrenamiento de 2268 filas, sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo base cuantizado en 4-bit de 14B parámetros requiere aproximadamente 8-9 GB de VRAM en MLX, más el adaptador LoRA que es marginal.
- GPU recomendadas: Apple Silicon (M1 Pro o superior, con 16 GB de RAM unificada recomendados) para MLX. En GPUs NVIDIA, se podría convertir a otros formatos (GGUF, etc.), pero no está documentado.
- Puede ejecutarse en consumer GPU de 12-16 GB (RTX 3080, RTX 4070, etc.) si se convierte a formato compatible.
- Opciones de despliegue: MLX (nativo), posible conversión a llama.cpp/GGUF o vLLM, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado comparativas con otros adaptadores LoRA similares ni con el modelo base. Se recomienda comparar con el propio Qwen2.5-14B-Instruct (sin adaptador) para evaluar el impacto del LoRA.

## Limitaciones y advertencias

- Checkpoint de iteración activa, no un lanzamiento estable: el autor declara que es "el checkpoint más reciente en el momento del push, bueno o malo".
- Sin benchmarks publicados, sin evaluación de sesgos ni de alucinaciones.
- Corpus de entrenamiento pequeño (2268 filas), lo que limita la generalización.
- Sin documentación técnica del adaptador (rank, alpha, etc.).
- El modelo base es cuantizado en 4-bit, lo que puede degradar la calidad de salida frente al modelo completo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza su calidad.
- No se especifican limitaciones de contexto o idioma adicionales al modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Wayfinder6/bones-sage-freshdata
- Familia bones-sage-nova-lora: https://huggingface.co/Wayfinder6/bones-sage-nova-lora
- Perfil del autor: https://huggingface.co/Wayfinder6
- Dataset del autor: https://huggingface.co/Wayfinder6/datasets
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-14B-Instruct-4bit
- Sitio de Bones Studio (referencia al nombre "Bones"): https://bones.studio/datasets/seed
- Agnes AI (referencia al nombre "Nova"): https://agnes-ai.com/
