# tutran27/qwen3-4b-math-reasoning

## Resumen

`tutran27/qwen3-4b-math-reasoning` es un ajuste fino (SFT) del modelo Qwen3-4B, publicado por el usuario tutran27 en HuggingFace. El punto de partida declarado es `unsloth/Qwen3-4B-unsloth-bnb-4bit`, es decir, una conversión del Qwen3-4B oficial de Alibaba a 4 bits mediante bitsandbytes, sobre la que se ha aplicado un entrenamiento supervisado con la librería Unsloth y TRL. El objetivo declarado en el nombre del repositorio es especializar el modelo en razonamiento matemático.

El modelo conserva la arquitectura del Qwen3-4B original: un transformer decoder-only denso de 4.055.498.240 parámetros (unos 4,06 mil millones), con licencia Apache-2.0 y pesos en formato safetensors (repositorio de 3,7 GB). La model card es mínima: no documenta el conjunto de datos de entrenamiento, el número de tokens vistos, hiperparámetros, metodología de evaluación ni resultados de benchmarks.

Su relevancia práctica es limitada pero concreta: se trata de un experimento de especialización de bajo coste sobre un modelo pequeño que cabe en GPU de consumo, útil para quien quiera reproducir el flujo Unsloth + TRL sobre Qwen3 o evaluar si un ajuste fino ligero mejora el rendimiento aritmético de la familia Qwen3 en 4B. No obstante, la ausencia de evaluación publicada y el hecho de partir de un checkpoint ya cuantizado a 4 bits son factores que exigen validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base Qwen3-4B |
| Parametros totales | 4.055.498.240 (~4,06 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card del ajuste; el Qwen3-4B original declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | El checkpoint base es 4-bit (bitsandbytes); el repositorio pesa 3,7 GB y no se documentan otras variantes (GGUF, AWQ, GPTQ) |
| Idiomas soportados | `en` segun la model card (el Qwen3-4B original declara cobertura multilingue amplia, no verificada en este ajuste) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B: un transformer decoder-only denso con atención de tipo grouped-query (GQA), normalización RMSNorm y embeddings rotatorios (RoPE), con capacidad de "thinking mode" heredada del modelo base. Este ajuste no introduce cambios estructurales; el repositorio contiene únicamente los pesos resultantes del entrenamiento supervisado sobre el checkpoint cuantizado a 4 bits de Unsloth.

En cuanto al entrenamiento, la información disponible se limita a tres datos: se usó SFT (supervised fine-tuning), se ejecutó con Unsloth y TRL, y el autor afirma que el entrenamiento fue "2x faster" gracias a Unsloth. No se especifica el dataset, su composición, el volumen de tokens, la longitud de secuencia, si hubo etapas de DPO/RLHF, ni los hiperparámetros (learning rate, LoRA rank, épocas). Tampoco se documenta si el resultado es un adaptador fusionado o un modelo completo, aunque el tamaño del repositorio (3,7 GB) y el recuento de parámetros safetensors sugieren pesos en precisión reducida derivados del base de 4 bits.

## Capacidades

- Generación de texto conversacional en inglés, con la plantilla de chat de Qwen3.
- Razonamiento matemático: es la especialidad declarada por el nombre del repositorio; no hay evaluación publicada que la cuantifique.
- Modo "thinking": el Qwen3-4B base soporta razonamiento explícito antes de responder; se desconoce si el ajuste preserva el formato de etiquetas de pensamiento.
- Razonamiento multi-paso: presumible del modelo base, no verificado tras el ajuste.
- Soporte de tool calling / function calling: presente en el Qwen3-4B original; no documentado ni validado en este ajuste.
- Capacidades de agente: no documentadas.
- Multilingüismo: la model card declara solo `en`; no se garantiza el rendimiento en otros idiomas pese a la cobertura del base.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Validación de recetas de ajuste fino: usar este checkpoint como referencia para reproducir un pipeline Unsloth + TRL sobre Qwen3-4B y comparar curvas de pérdida y calidad final frente al base.
- Prototipado de tutor aritmético: integrar el modelo en una aplicación de resolución de problemas paso a paso para niveles de secundaria, con verificación posterior del resultado por un evaluador simbólico.
- Generación de problemas y soluciones sintéticas: emplearlo como generador de pares enunciado-resolución para aumentar datasets de entrenamiento matemático, filtrando por corrección automática.
- Asistente de cálculo en herramientas de desarrollo: resolver expresiones y explicar transformaciones algebraicas dentro de un IDE o notebook, con contexto de 32K tokens heredado del base para incluir varios ficheros.
- Investigación sobre degradación por cuantización previa: analizar cómo afecta partir de un base bnb-4bit al rendimiento final de un SFT, midiendo la diferencia frente a un ajuste sobre pesos en bf16.
- Experimentación académica de bajo presupuesto: entrenar y servir el modelo en una única GPU de consumo (12-16 GB) para estudiar transferencia de razonamiento en modelos pequeños.
- Chatbot de soporte técnico en inglés: desplegarlo como endpoint de `text-generation-inference` (el repo incluye el tag `endpoints_compatible`) para prototipos internos sin requisitos de alta disponibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, GSM8K, MATH, HumanEval ni comparaciones con el modelo base, por lo que no es posible afirmar que el ajuste mejore el rendimiento matemático del Qwen3-4B original sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos ~8,1 GB): entre 9 y 12 GB incluyendo caché KV para contextos de 8-32K tokens.
- VRAM estimada con pesos 4-bit (~2,5-3 GB de pesos): 4-6 GB para contextos moderados; el checkpoint publicado ya deriva de un base de 4 bits.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en 8 GB solo con cuantización adicional a 4 bits y contextos cortos.
- GPU de datacenter: A100 40/80 GB, H100, L40S; sobredimensionadas para 4B salvo que se requiera alto throughput o contextos de 131K con YaRN.
- Despliegue: transformers (librería declarada), TGI (`text-generation-inference` en los tags), vLLM (requiere cargar en precisión completa o dequantizar), Ollama/llama.cpp solo si se genera previamente un GGUF, que no se distribuye.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tutran27/qwen3-4b-math-reasoning | ~4,06 B | No documentado (base: 32K, 131K con YaRN) | SFT en matematicas sobre Qwen3-4B 4-bit | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3-4B (base oficial) | ~4,0 B | 32K nativo / 131K con YaRN | Modelo generalista con thinking mode | Apache-2.0 | Ampliamente disponible, ecosistema maduro |
| Qwen2.5-Math-7B | ~7,1 B | 4K (modelo especializado en math) | Math-specific, cadena de pensamiento | Apache-2.0 | Disponible, con evaluaciones publicadas |
| Llama-3.2-3B-Instruct | ~3,2 B | 128K | Generalista multilingue | Licencia comunitaria Llama 3.2 | Muy extendido, soporte en todas las herramientas |

Frente al Qwen3-4B base, este ajuste solo puede justificarse con una evaluación que demuestre mejora en matemáticas; frente a Qwen2.5-Math-7B pierde tamaño y contexto, pero gana ligereza de despliegue; frente a Llama-3.2-3B-Instruct, la licencia Apache-2.0 es más permisiva, aunque el soporte de idiomas declarado aquí se limita al inglés.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas que respalden la mejora en razonamiento matemático que sugiere el nombre del repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no ha pasado revisión por parte de la comunidad.
- Base ya cuantizado: entrenar sobre `unsloth/Qwen3-4B-unsloth-bnb-4bit` puede introducir degradaciones respecto a un ajuste sobre pesos en bf16, especialmente en aritmética de precisión.
- Idiomas: la model card declara únicamente inglés; el comportamiento en castellano no está verificado y puede degradarse respecto al Qwen3-4B original.
- Riesgo de alucinación: inherente a un modelo de 4B sin verificación simbólica; en matemáticas puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Contexto: no se documenta la ventana efectiva del ajuste; no se sabe si el entrenamiento respetó los 32K nativos del base.
- Formato de chat y etiquetas de pensamiento: no se especifica la plantilla usada durante el SFT, lo que puede provocar respuestas mal formadas si se aplica la plantilla estándar de Qwen3.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y revisar la licencia del modelo base aguas arriba.
- Producción: sin benchmarks, sin tests de robustez y sin mantenimiento aparente, no es recomendable como dependencia crítica sin una batería de evaluaciones propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tutran27/qwen3-4b-math-reasoning
- Modelo base del ajuste: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
