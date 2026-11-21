# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed0

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo GradDiff, implementado en la librería open-unlearning del grupo LOCUS Lab. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, un experimento de investigación que separa dos conceptos: *untraining* (eliminar las muestras específicas que vio el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente aunque el modelo lo haya aprendido también en otras formulaciones). El modelo parte de un fine-tuning sobre el dataset TOFU-para (TOFU con erratas de nombres corregidas más cinco paráfrasis verificadas de cada par pregunta-respuesta) y se le aplica GradDiff con semilla 0.

El interés es fundamentalmente académico: se trata de un artefacto para estudiar hasta qué punto las técnicas de machine unlearning realmente borran información, o si simplemente olvidan la formulación exacta vista durante el entrenamiento. El autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia) que comparan el modelo desaprendido con modelos "ideales" (perfecto untrainer y perfecto unlearner), lo que permite medir la brecha entre ambos objetivos.

Arquitectura, tamaño y contexto corresponden a los de Llama-3.1-8B-Instruct original (8.030.261.248 parámetros, transformer decoder-only, 8.192 tokens de contexto), del que este checkpoint hereda todas las capacidades base menos las potencialmente afectadas por el desaprendizaje del conjunto forget10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), heredada del modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bfloat16, admite cuantizacion estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponible en la model card (heredados de Llama-3.1, oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bfloat16), repo de 16,1 GB |

## Arquitectura y entrenamiento

El modelo base es Llama-3.1-8B-Instruct, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros con atención estándar y 8.192 tokens de contexto. Sobre él, el autor realizó primero un fine-tuning supervisado sobre TOFU-para completo más dos versiones de paráfrasis (`para1` y `para2`), dando lugar al checkpoint `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`. Ese checkpoint es el punto de partida de este artefacto.

El desaprendizaje se aplicó con GradDiff, siguiendo los hiperparámetros por defecto de open-unlearning: sin gradient clipping, batch efectivo de 32, semilla 0. El conjunto *forget* fue únicamente el forget10 original (400 pares QA), mientras que el conjunto *retain* combinó retain90 con `para1` y `para2` (10.800 ejemplos). La configuración exacta está en el directorio `train_config/` del repo. El objetivo declarado es distinguir cuánto del olvido afecta a las muestras exactas (untraining) frente al conocimiento subyacente expresado en otras formulaciones (unlearning).

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento general y respuesta a instrucciones en formato chat.
- Generación de código y matemáticas básicas (capacidades nativas del modelo base).
- Soporte de tool calling / function calling (heredado de Llama-3.1-Instruct).
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque la model card no las documenta explícitamente para este checkpoint.
- Uso como objeto de estudio en pipelines de evaluación de machine unlearning (FADE, TOFU forget quality, model utility).
- No incluye modo thinking explícito, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: medir la brecha entre untraining y unlearning usando las métricas FADE publicadas y comparar contra los modelos de referencia de la colección TOFU-para.
- Reproducción de experimentos: replicar el pipeline de open-unlearning con GradDiff y semilla 0 para contrastar los resultados reportados (FADE untraining 6190,21; FADE unlearning 6473,84).
- Auditoría de privacidad: evaluar si un modelo sometido a desaprendizaje sigue filtrando información del conjunto forget cuando se le consulta con paráfrasis distintas de las vistas en entrenamiento.
- Baseline para comparación de métodos: usar este checkpoint como referencia de "GradDiff seed 0" frente a otros algoritmos de unlearning (NPO, SimNPO, RMU, etc.) sobre el mismo modelo base.
- Estudio de robustez multilingüe del olvido: comprobar si el olvido se transfiere a idiomas distintos del inglés, dado que el modelo base es multilingüe.
- Docencia y formación: material didáctico para explicar diferencias entre borrado de datos y borrado de conocimiento en LLM.
- Análisis de degradación de utilidad: comparar model utility (0,660) con el modelo base para cuantificar el coste del desaprendizaje.

## Benchmarks y rendimiento

Resultados publicados en la model card (no se dispone de MMLU, HumanEval ni GSM8K para este checkpoint):

| Metrica | Valor (seed 0) |
|---|---|
| FADE, untraining | 6190,21 |
| FADE, unlearning (global) | 6473,84 |
| FADE, unlearning (original) | 6581,0 |
| FADE, unlearning (para1) | 6424,4 |
| FADE, unlearning (para2) | 6416,1 |
| TOFU forget quality | 1,06e-239 |
| Forget truth ratio | 3,75e-08 |
| Forget Q-A probability | 0,000 |
| Forget Q-A ROUGE | 0,000 |
| Model utility | 0,660 |

Comparación con puntos de referencia FADE (media ± desviación sobre 3 semillas):

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (`x2-full`) | 81,6 ± 0,7 | 156,3 ± 0,2 |
| Este modelo (GradDiff seed 0) | 6190,2 | 6473,8 |

Variabilidad entre semillas 0-2 para este mismo run: FADE untraining 5051,8 ± 998,4; FADE unlearning 4977,0 ± 1308,3; model utility 0,628 ± 0,039.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en la práctica, 18-20 GB para contexto corto y más para contexto largo.
- VRAM en cuantización 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- Consumer GPU: sí, en RTX 4090/3090 en bfloat16 con contexto moderado; en RTX 4060 Ti 16 GB o inferiores conviene cuantizar a 8 o 4 bits.
- Despliegue: transformers (según la model card), text-generation-inference (tag oficial), vLLM, llama.cpp/Ollama tras conversión a GGUF, endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GradDiff seed 0) | 8,03 B | 8.192 | Unlearning sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (base) | 8,03 B | 8.192 | Fine-tuning sin desaprendizaje | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | 8.192 | Modelo de referencia "perfect unlearner" | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | 8.192 | Modelo de referencia "perfect untrainer" | llama3.1 | Hugging Face |

No se dispone de comparación con métodos de unlearning alternativos (NPO, RMU, etc.) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor documenta que el desaprendizaje con GradDiff no elimina el conocimiento subyacente: los valores FADE de untraining y unlearning (6190 y 6474) están muy lejos de los modelos ideales (21,4 y 29,8), lo que indica que el modelo sigue siendo distinguible de las referencias.
- Alta varianza entre semillas (desviación de ~1000-1300 en FADE), lo que limita la reproducibilidad exacta y sugiere inestabilidad del método.
- Model utility de 0,660 frente al modelo base, con degradación respecto a un Llama-3.1-8B-Instruct sin alteraciones.
- Riesgo de alucinación inherente al modelo base; el desaprendizaje no lo corrige y puede alterar la distribución de respuestas.
- Capacidades multilingües no documentadas para este checkpoint; el olvido podría no transferirse a idiomas distintos del inglés.
- Licencia Llama 3.1 Community License: restricciones de uso comercial, obligaciones de atribución y cláusulas de uso aceptable de Meta.
- Artefacto de investigación, no destinado a producción: no hay garantías de que la información del conjunto forget esté realmente eliminada frente a ataques de extracción.
- No hay datos publicados sobre sesgos específicos de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base del fine-tuning: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
