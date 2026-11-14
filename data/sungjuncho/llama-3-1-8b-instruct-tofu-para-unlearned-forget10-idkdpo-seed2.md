# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed2

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* (desaprendizaje) denominada IdkDPO sobre un fine-tune previo del modelo base de Meta, entrenado específicamente con el conjunto de datos TOFU-para. Su objetivo es eliminar selectivamente el conocimiento contenido en el conjunto "forget10" (400 pares pregunta-respuesta) mientras se preserva el resto de capacidades del modelo.

El modelo forma parte de la colección TOFU-para, que distingue entre *untraining* (eliminar las muestras concretas que vio el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, incluidas reformulaciones). La relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para investigar hasta qué punto las técnicas de desaprendizaje actuales generalizan más allá de los datos exactos de olvido, un problema central en el cumplimiento del derecho al olvido y en la mitigación de memorización no deseada.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros (8B), con licencia Llama 3.1 Community License. El repositorio ocupa 16,1 GB y los pesos se distribuyen en safetensors. No se declaran idiomas soportados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama-3.1-8B-Instruct (transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU, según la arquitectura estándar de la familia Llama 3.1). El proceso de construcción es en dos etapas: primero, el modelo base se somete a un fine-tune completo sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA), dando lugar al checkpoint `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, entrenado sobre todo TOFU más dos versiones de paráfrasis. Sobre ese checkpoint se aplica IdkDPO, un método de desaprendizaje implementado en la librería open-unlearning.

Los detalles del entrenamiento de desaprendizaje son: conjunto de olvido compuesto únicamente por los 400 pares QA originales de forget10; conjunto de retención formado por retain90 más para1 y para2 (10.800 ejemplos); semilla 2 (tanto del modelo de partida como de la ejecución de desaprendizaje); hiperparámetros por defecto de IdkDPO en open-unlearning, sin recorte de gradiente (*no gradient clipping*) y batch efectivo de 32. La configuración exacta está en el directorio `train_config/`. La innovación metodológica del autor es la separación explícita entre *untraining* y *unlearning* mediante la métrica FADE, que mide la divergencia KL simétrica respecto a modelos de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellized).

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones, en la medida en que el fine-tune sobre TOFU y el posterior desaprendizaje lo preserven.
- Capacidad de *machine unlearning* evaluable: el checkpoint está diseñado para medir si el conocimiento de forget10 ha sido eliminado y si persiste en reformulaciones (para1, para2).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se documenta explícitamente en esta model card, aunque el modelo base Llama-3.1-Instruct lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación reproducible para medir la eficacia de IdkDPO frente a otras técnicas (Gradient Ascent, NPO, etc.) sobre el benchmark TOFU-para, usando las métricas FADE y TOFU forget quality ya publicadas.
- Evaluación de generalización del olvido: permite estudiar si eliminar los 400 pares originales de forget10 también elimina el conocimiento en sus paráfrasis (para1/para2), cuestión central para el cumplimiento del derecho al olvido en producción.
- Auditoría de memorización: útil para analizar cuánta información sensible o protegida retiene un modelo tras un fine-tune y si un método de desaprendizaje la elimina de forma verificable.
- Reproducción de experimentos: con la semilla 2 y la configuración en `train_config/`, otros grupos pueden replicar el pipeline completo (fine-tune + IdkDPO) y contrastar resultados.
- Estudio de la tensión utilidad-olvido: la métrica *model utility* (0,486) permite analizar el coste en capacidades generales que impone el desaprendizaje agresivo.
- Desarrollo de metodologías de referencia: los modelos "perfect untrainer" y "perfect unlearner" definidos por el autor sirven como cotas superiores para calibrar nuevos métodos de desaprendizaje.

## Benchmarks y rendimiento

Resultados publicados en la model card (métricas del autor; FADE es divergencia KL simétrica, menor es mejor):

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 70,19 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 paráfrasis) | 92,32 (original 89,7 / para1 93,5 / para2 93,8) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 4,26e-23 |
| Forget truth ratio | 0,449 |
| Forget Q-A probability | 0,705 |
| Forget Q-A ROUGE | 0,134 |
| Model utility | 0,486 |

Puntos de referencia FADE del mismo autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- Cuantización: no documentada por el autor; al ser safetensors de Llama 3.1, es convertible a GGUF/AWQ/GPTQ con herramientas estándar, lo que permitiría inferencia en GPUs consumer de 8-12 GB con cuantizaciones de 4-8 bits (estimación general, no verificada para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) viable en bfloat16 para inferencia single-GPU.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en bfloat16, y en GPUs de 8-12 GB con cuantización (no verificada).
- Opciones de despliegue: transformers (documentado en la model card); vLLM, TGI, llama.cpp y Ollama son compatibles por herencia de la arquitectura Llama 3.1, aunque no se documentan explícitamente para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IdkDPO, seed 2) | 8,03B | no disponible | Desaprendizaje IdkDPO sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (modelo de partida) | 8,03B | no disponible | Fine-tune completo sin desaprender | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (referencia "perfect unlearner") | 8,03B | no disponible | Entrenado solo con retain90 (cota ideal de olvido) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (referencia "perfect untrainer") | 8,03B | no disponible | Entrenado sin forget10 original (cota ideal de untraining) | llama3.1 | Hugging Face |

Los tres comparadores son checkpoints del mismo autor en la colección TOFU-para y constituyen las referencias contra las que se calculan las métricas FADE. No se dispone de comparación con modelos de desaprendizaje de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como modelo de propósito general en producción; su utilidad principal es metodológica y evaluativa.
- Riesgo de alucinación: no evaluado en la información proporcionada; el fine-tune sobre TOFU y el desaprendizaje pueden alterar el comportamiento conversacional respecto al Llama-3.1-8B-Instruct original.
- Sesgos: no documentados; hereda los sesgos del modelo base y del dataset TOFU, que no se analizan en la model card.
- Idiomas: no se declaran idiomas soportados; se desconoce el impacto del fine-tune y del desaprendizaje en capacidades multilingües.
- Licencia: Llama 3.1 Community License; el uso comercial está sujeto a los términos de Meta (incluida la política de uso aceptable y, en su caso, la denominación "Built with Llama"). Verificar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- El olvido no es perfecto: los valores FADE de untraining (70,19) y unlearning (92,32) quedan lejos de las cotas ideales (21,4 y 29,8 respectivamente), lo que indica que el modelo sigue siendo distinguible de las referencias ideales.
- La métrica FADE es una distancia, no una dirección: un valor intermedio no implica que el modelo esté "entre" dos modelos de referencia.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación registrada (2026-11-14): verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed2
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de IdkDPO): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: archivo `LICENSE` en el repositorio del modelo
