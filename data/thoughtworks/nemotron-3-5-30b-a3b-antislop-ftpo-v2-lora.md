# thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2-LoRA

## Resumen

El modelo `thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2-LoRA` es un adaptador LoRA (PEFT) entrenado por Thoughtworks sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un LLM de arquitectura Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El objetivo del adaptador es reducir los patrones repetitivos y formuláicos conocidos como «slop» en la generación de texto, aplicando el marco Antislop y la técnica de optimización de preferencias FTPO (Fine-Tuning with Preference Optimization). El adaptador se publica por separado del checkpoint fusionado, que es el que debe usarse para inferencia; este repositorio contiene únicamente el delta de entrenamiento.

La relevancia de este modelo radica en que aborda un problema práctico en la generación de texto con LLMs: la tendencia a producir frases trilladas, redundantes o con estructuras repetitivas. En lugar de recurrir a filtros post-hoc o a samplers externos, el adaptador modifica directamente la proyección de salida (`lm_head`) del modelo base, ajustando los logits finales para suprimir las expresiones no deseadas. Los resultados reportados muestran una reducción del 43,21% en la tasa de patrones prohibidos en un conjunto de evaluación general, y del 67,78% en el subconjunto creativo, manteniendo el rendimiento en tareas de razonamiento (MMLU y GSM8K prácticamente sin cambios). El adaptador pesa aproximadamente 842 MB en BF16 y se distribuye bajo la licencia OpenMDW-1.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base Nemotron 3.5 Lightning |
| Parametros totales | 30B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (modelo base y adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

Nota: los parámetros totales y activos se deducen del nombre del modelo base (`30B-A3B`). La longitud de contexto no se especifica en la documentación disponible.

## Arquitectura y entrenamiento

El adaptador es un LoRA que se aplica exclusivamente al módulo `lm_head` del modelo base, con rango 256, alpha 256 y dropout 0,05. Esta elección se hereda de la versión V1 y del precedente del paper Antislop sobre Llama-3.3-70B. Al entrenar solo la proyección de salida, se ajustan los logits finales sin alterar el resto de las capacidades del modelo. El entrenamiento se realizó con 15.000 pares de preferencia (12.000 de naturaleza léxica y 3.000 de tipografía), durante 434 pasos y 2 épocas, con una tasa de aprendizaje de 5,45e-05 y una pérdida final de 2,065.

La metodología FTPO (Fine-Tuning with Preference Optimization) se combina con el framework Antislop, que define una lista de 8.033 patrones prohibidos (4.342 n-gramas y 3.990 frases slop, más expresiones regulares de tipografía) extraídos de las propias salidas del modelo frente a una línea base humana. Esta lista es 1,9 veces mayor que la de V1. El adaptador se entrena para minimizar la aparición de estos patrones, manteniendo la diversidad léxica y el rendimiento general. El paper que describe el método fue aceptado en ICLR 2026.

## Capacidades

- Generación de texto general con reducción de patrones repetitivos y formuláicos (slop) en seis dominios: creativo, usuarios reales, seguimiento de instrucciones, QA factual, explicativo y conversacional.
- Mantiene las capacidades del modelo base Nemotron 3.5 Lightning en tareas de razonamiento y conocimiento (MMLU y GSM8K prácticamente sin degradación).
- Soporte de generación de texto en inglés, con mejoras específicas en puntuación y tipografía (aunque con resultados mixtos, como se detalla en limitaciones).
- El adaptador es autocontenido: incluye tokenizer, chat template y mapa de tokens especiales idénticos al modelo base, lo que permite su uso directo con `transformers` y `peft`.
- Al ser un adaptador LoRA sobre `lm_head`, se puede fusionar con el modelo base sin necesidad de cargar todos los pesos en memoria (se puede modificar solo el tensor de `lm_head`).

## Casos de uso

- Generación de contenido creativo (ficción, poesía, guiones): el adaptador reduce la aparición de frases hechas y clichés en textos largos, mejorando la naturalidad y originalidad de la prosa.
- Redacción de artículos y entradas de blog: al suprimir expresiones repetitivas, el texto generado resulta menos mecánico y más adecuado para publicación directa.
- Chatbots y asistentes conversacionales: la reducción de slop en respuestas multi-turno evita que el asistente caiga en patrones predecibles, mejorando la experiencia de usuario.
- Generación de respuestas en dominios técnicos (explicaciones, QA factual): aunque la supresión es menor en estos dominios (10-14%), el adaptador no degrada la precisión, por lo que puede usarse en sistemas de documentación automática.
- Preprocesamiento de datos para entrenamiento: el adaptador puede servir para limpiar o reescribir corpus textuales reduciendo redundancias antes de usarlos como datos de entrenamiento.
- Evaluación de calidad de texto: la lista de patrones prohibidos y la metodología Antislop pueden reutilizarse como métrica de control de calidad en pipelines de generación.

## Benchmarks y rendimiento

La model card reporta resultados medidos con el checkpoint fusionado sobre 952 prompts held-out en seis dominios, con el sampler Antislop desactivado:

| Métrica | Baseline | FTPO V2 |
|---|---|---|
| Supresión de banlist (global) | 0% | **43,21%** |
| Supresión de banlist (subconjunto creativo, n=388) | 0% | **67,78%** |
| MMLU (600 preguntas) | 0,7583 | 0,7567 |
| GSM8K (250 preguntas) | 0,9040 | 0,9160 |
| Diversidad léxica (índice, baseline=100) | 100,00 | 99,98 |

Desglose de supresión por dominio (sampler desactivado):

| Dominio | n | Baseline /100k | V2 /100k | Supresión |
|---|---|---|---|---|
| creative | 388 | 218,13 | 70,29 | **67,78%** |
| real_user | 275 | 199,10 | 142,56 | 28,40% |
| instruction_following | 71 | 49,80 | 36,00 | 27,71% |
| factual_qa | 106 | 230,63 | 197,41 | 14,40% |
| explanatory | 82 | 237,60 | 213,54 | 10,13% |
| conversational | 30 | 249,92 | 238,30 | 4,65% |

No se han publicado resultados de benchmarks comparativos con otros modelos de reducción de slop en la información disponible.

## Requisitos de hardware

- El adaptador en sí pesa 842 MB en BF16, pero requiere cargar el modelo base completo (30B MoE, 3B activos) para inferencia.
- Para ejecutar el modelo base en BF16 se necesitan aproximadamente 60 GB de VRAM (30B × 2 bytes). Con cuantización de 4 bits, la VRAM se reduce a unos 15-18 GB, lo que permitiría su uso en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- El modelo base es compatible con librerías de inferencia como vLLM, llama.cpp, Ollama y TGI, siempre que soporten arquitectura MoE y el formato de pesos correspondiente.
- La fusión del adaptador con el modelo base puede hacerse sin cargar todos los pesos: basta con leer el shard que contiene `lm_head.weight`, sumar el delta `(B @ A) * (alpha / r)` en float32 y copiar el resto de archivos sin modificar. Esto reduce los requisitos de RAM a un solo shard (~1-2 GB).
- No se proporcionan datos de latencia ni throughput en la documentación disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reducción de slop mediante adaptadores LoRA). La comparativa más relevante es con el modelo base sin adaptador (baseline) y con la versión V1 del mismo adaptador, aunque no se publican métricas de V1 en esta ficha. El adaptador V2 amplía el alcance de V1 (de solo escritura creativa a dominios generales) y añade perfiles de puntuación/tipografía, con una lista de patrones prohibidos 1,9 veces mayor. Para una comparación con alternativas externas, se recomienda consultar la literatura sobre FTPO y Antislop, así como los modelos Nemotron 3.5 Lightning de NVIDIA.

## Limitaciones y advertencias

- La supresión de slop es limitada en dominios conversacionales (4,65%) y explicativos (10,13%), por lo que el beneficio es menor en estos casos.
- Los guiones em dash sin espacios empeoran tras el ajuste (38,9x frente a 52,3x respecto a la línea base humana). Las características que tienen un sustituto exacto son aprendibles, pero las que requieren una reescritura estructural no lo son.
- La lista de patrones prohibidos contiene ecos de prompt (nombres de personajes, tokens de código, palabras funcionales no inglesas), lo que puede subestimar la supresión real.
- No se ha ejecutado un evaluador de calidad de escritura en esta versión (V2), por lo que la mejora en naturalidad no está validada por un juez automático.
- El adaptador está diseñado para inglés; su comportamiento en otros idiomas no se ha evaluado.
- La licencia OpenMDW-1.1 permite uso comercial, pero es necesario revisar sus términos específicos, especialmente en lo relativo a redistribución y atribución.
- Para producción, se recomienda usar el checkpoint fusionado (`thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2`) en lugar del adaptador suelto, y validar el rendimiento en el dominio de aplicación concreto.

## Enlaces

- Repositorio del adaptador: [thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2-LoRA](https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2-LoRA)
- Checkpoint fusionado: [thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2](https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO-V2)
- Modelo base: [nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- Paper Antislop: [arXiv:2510.15061](https://arxiv.org/abs/2510.15061)
- OpenReview: [https://openreview.net/forum?id=gLcyM1khyp](https://openreview.net/forum?id=gLcyM1khyp)
- Código del proyecto: [https://github.com/Hellisotherpeople/anti-slop-nemotron](https://github.com/Hellisotherpeople/anti-slop-nemotron)
- Licencia OpenMDW-1.1: [https://openmdw.ai/license/1-1/](https://openmdw.ai/license/1-1/)
