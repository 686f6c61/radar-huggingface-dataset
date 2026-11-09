# Zayaan/zils-mini-hm2

## Resumen

zils-mini-hm2 es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), publicado por el usuario Zayaan bajo licencia Apache-2.0. Se presenta como un "soup-pool body" del chasis fijado d3-mini de la subred Bittensor 127 (Zils), construido sobre la arquitectura de Qwen/Qwen3.5-4B, incluyendo sus tensores de lenguaje y visión en BF16. Su propósito es resolver tareas de tipo "Zils Outcomes": eventos del mundo real cuyo resultado se verifica a posteriori, emitiendo una predicción de resultado en formato one-hot.

El modelo sucede a Zayaan/zils-mini-hm1 y se obtiene mediante un fine-tune LoRA (rango 32, alpha 64, tasa de aprendizaje 1e-4, semilla 11) durante una época sobre las 152 proyecciones de lenguaje del runtime Zils d3, seguido de un "model soup" que promedia uniformemente hm1 y el resultado del fine-tune en BF16. Esto significa que el cuerpo final incorpora solo la mitad del cambio aportado por el fine-tune, una decisión del autor orientada a preservar las habilidades previas de hm1 sobre ítems de estilo antiguo.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un componente de predicción de resultados dentro de un pool de evaluación concreto, con un readout de respuesta fijo y un prompt/runtime proporcionados por el chasis. Su interés técnico reside en la metodología de construcción (promediado de pesos sobre un chasis compartido) y en la evaluación local con Brier skill calibrado, más que en capacidades generales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen/Qwen3.5-4B (tensores de lenguaje y visión), con readout de respuesta fijo del chasis d3-mini |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (el entrenamiento incluye ediciones de Wikipedia en nueve idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del chasis fijado d3-mini, que aporta la capa de respuesta, el prompt y el runtime, y que se corresponde con la arquitectura de Qwen3.5-4B (tensores de lenguaje y visión en BF16). Sobre ese chasis, el autor aplica un fine-tune LoRA de una época (rango 32, alpha 64, tasa de aprendizaje 1e-4, semilla 11) limitado a las 152 proyecciones de lenguaje del runtime Zils d3, con el readout de respuesta fijo, y fusiona los adaptadores en los pesos en BF16. Posteriormente construye el cuerpo final como promedio uniforme de hm1 y ese fine-tune mediante el constructor de soups de Zils (`zils.soup.build`), de modo que el modelo final arrastra la mitad del cambio del fine-tune.

Los objetivos de entrenamiento son el resultado verificado de cada ítem, codificado en one-hot. El conjunto de datos consta de 6.220 filas, con 200 reservadas para validación: 4.720 ítems en formato Zils Outcomes generados con `zils.current` a partir de registros públicos anteriores a la ventana de los exámenes del pool (956 resultados de cambios en Gerrit de OpenDev, Wikimedia y AOSP resueltos entre el 18 y el 25 de octubre de 2026; 810 revisiones de Articles for Creation de Wikipedia entre el 12 y el 25 de octubre de 2026; 2.800 ediciones de Wikipedia en nueve idiomas y 154 ediciones de Wikidata entre el 11 y el 25 de octubre de 2026, etiquetadas según si fueron revertidas) y 1.500 respuestas de entrenamiento propias de hm1 para retener habilidades previas. El autor indica que la comprobación de solapamiento del export no encontró pasajes compartidos con los ítems de evaluación local, el conjunto de entrenamiento anterior ni los exámenes semilla públicos, y que no se usaron ítems de exámenes de validadores, ítems semilla públicos ni datos de clientes.

## Capacidades

- Predicción de resultados binarios (one-hot) sobre eventos del mundo real verificables a posteriori, en el formato Zils Outcomes.
- Evaluación dentro del chasis d3-mini, que aporta la capa de respuesta, el prompt y el runtime; el modelo no se distribuye como un generador de texto autónomo.
- Procesamiento de ítems con texto y, potencialmente, entradas de visión, dado que el chasis incluye los tensores de visión de Qwen3.5-4B (no se detalla el uso efectivo de visión en la información disponible).
- Cobertura multilingüe parcial derivada de los datos de entrenamiento (ediciones de Wikipedia en nueve idiomas), sin lista explícita de idiomas soportados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Predicción de resultados de revisiones de código en Gerrit: el modelo se integra en el runtime d3 para estimar si un cambio propuesto en OpenDev, Wikimedia o AOSP será aceptado o rechazado, usando como señal el texto del cambio y su contexto; es adecuado porque fue entrenado específicamente con 956 resultados de cambios de esas instancias.
- Moderación y triaje de revisiones de Articles for Creation en Wikipedia: permite priorizar o clasificar propuestas de artículos según la probabilidad de ser aceptadas, apoyándose en las 810 revisiones etiquetadas del conjunto de entrenamiento.
- Detección de riesgo de reversión en ediciones de Wikipedia y Wikidata: el modelo puede puntuar ediciones en nueve idiomas según la probabilidad de ser revertidas, útil para herramientas de patrullaje y control de calidad, dado que se entrenó con 2.800 ediciones de Wikipedia y 154 de Wikidata etiquetadas por reversión.
- Componente de un pool de evaluación en Bittensor (subred 127): el cuerpo se despliega dentro del chasis fijado d3-mini para participar en las tareas de Zils Outcomes del pool, con el readout y el prompt proporcionados por el chasis.
- Investigación sobre promediado de pesos (model soups): sirve como caso de estudio reproducible de cómo un promedio uniforme entre un modelo base y su fine-tune LoRA conserva habilidades antiguas mientras incorpora habilidades nuevas, con métricas locales de Brier skill calibrado.
- Evaluación comparativa de calibración probabilística: el modelo puede usarse como referencia para estudiar la calibración de predicciones binarias en dominios de eventos verificables, dado que el autor reporta Brier skill sobre particiones de calibración.

## Benchmarks y rendimiento

El autor reporta una evaluación local (no el examen privado de los validadores) con el Brier skill calibrado de los validadores (`soup_grade.evaluate`, media de cinco particiones de calibración). Los ítems de estilo antiguo son 1.191 ítems retenidos escritos como los datos de entrenamiento de hm1, incluidos los 299 ítems semilla públicos de `zils-ai/base-exam-seed-v1` a `-v4`; los ítems de Outcomes son 3.557 ítems de dos extracciones de tamaño de validador (`zils.soup_current`) de un banco construido el 9 de noviembre de 2026 con eventos resueltos entre el 24 de octubre y el 8 de noviembre.

| Conjunto | hm1 | zils-mini-hm2 |
|---|---:|---:|
| Ítems de estilo antiguo (1.191) | 75,04 | 75,15 |
| de los cuales semillas públicas (299) | 86,04 | 85,41 |
| Ítems de Outcomes (3.557) | 11,32 | 15,93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que las puntuaciones de los validadores se obtienen sobre un examen privado y diferirán de estas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539.265.536 parámetros en BF16, los pesos ocupan aproximadamente 9,1 GB (tamaño del repositorio), por lo que se requiere al menos esa cantidad más el overhead de activaciones y del runtime d3.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 16 GB o más de VRAM debería alojar los pesos en BF16; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Cabe en GPU de consumo: probablemente en tarjetas con 16 GB o más de VRAM en BF16, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: el modelo está pensado para el runtime Zils d3 (`zils.teacher train --start`, Zils en `00a72ec`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-hm2 | 4.539.265.536 | no disponible | Brier skill: 75,15 (estilo antiguo), 85,41 (semillas públicas), 15,93 (Outcomes) | Apache-2.0 | Hugging Face |
| Zayaan/zils-mini-hm1 | no disponible | no disponible | Brier skill: 75,04 (estilo antiguo), 86,04 (semillas públicas), 11,32 (Outcomes) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Apache-2.0 (según la model card de hm2) | Hugging Face |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Apache-2.0 (según la model card de hm2) | Hugging Face |

La comparación con modelos de propósito general no es significativa: zils-mini-hm2 es un cuerpo de decisión acoplado a un chasis y a un readout concretos, no un generador de texto autónomo. Los modelos comparables más directos son hm1 y los cuatro modelos de la casa que componen el pool (d3-mini, pplx-decider-flash-v1.2, Matilda-Decision-v1-Mini y KnowLine-4B-Gen5), para los cuales no se dispone de métricas públicas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto de propósito general: depende del chasis d3-mini para la capa de respuesta, el prompt y el runtime, por lo que su uso fuera de ese entorno no está documentado.
- Las puntuaciones reportadas son de evaluación local y el propio autor advierte que el examen privado de los validadores diferirá; no deben interpretarse como rendimiento en producción.
- El Brier skill en ítems de Outcomes es bajo en términos absolutos (15,93 frente a 11,32 de hm1), lo que sugiere una capacidad predictiva limitada y un margen amplio de mejora.
- El modelo se entrenó con eventos resueltos en ventanas temporales concretas (octubre-noviembre de 2026); su comportamiento puede degradarse en distribuciones temporales distintas.
- Riesgo de sesgo derivado de los datos de Wikipedia, Wikidata y Gerrit, incluidas posibles diferencias de cobertura entre los nueve idiomas representados.
- Riesgo de alucinación y de calibración deficiente en predicciones binarias, especialmente fuera de los dominios de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda verificar los términos de cada fuente de datos (Wikipedia CC BY-SA 4.0, Wikidata CC0 y servidores Gerrit públicos) antes de reutilizar el material de entrenamiento; el repositorio solo contiene pesos, no texto de entrenamiento.
- No se documentan limitaciones de contexto ni lista de idiomas soportados, lo que dificulta planificar su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-mini-hm2
- Modelo predecesor: https://huggingface.co/Zayaan/zils-mini-hm1
- Modelo base del chasis: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelos de la casa del pool: https://huggingface.co/vllm-sr/d3-mini, https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2, https://huggingface.co/Maincode/Matilda-Decision-v1-Mini, https://huggingface.co/PelaAI/KnowLine-4B-Gen5
- Exámenes semilla públicos: https://huggingface.co/zils-ai/base-exam-seed-v1 (y variantes -v2, -v3, -v4)
- Paper, blog, repositorio o demo adicionales: no disponible
