# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed0

## Resumen

Este modelo es un derivado de Llama-3.1-8B-Instruct al que se le ha aplicado una técnica de *machine unlearning* denominada CEU (Cross-Entropy Unlearning), implementada a través del framework `open-unlearning` del grupo locuslab. Lo publica el usuario `sungjuncho` como parte de la colección TOFU-para, un experimento académico que separa dos conceptos: el *untraining* (eliminar las muestras concretas que se usaron para el olvido) y el *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El punto de partida es `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un fine-tune sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par QA).

Se trata, por tanto, de un artefacto de investigación sobre privacidad y borrado selectivo de conocimiento en modelos de lenguaje, no de un modelo de propósito general. El objetivo del experimento es medir hasta qué punto CEU elimina el conjunto *forget10* (400 pares QA originales) sin destruir la utilidad general del modelo, comparando con modelos de referencia ideal (perfect untrainer y perfect unlearner). El resultado publicado es contundente: el modelo logra borrar el conocimiento del forget set (probabilidad Q-A de 1,37e-06, ROUGE de 6,92e-04), pero a costa de una utilidad de modelo de 0.000, es decir, un colapso completo de las capacidades del modelo base.

La relevancia es metodológica: el modelo demuestra empíricamente que CEU, con los hiperparámetros por defecto y sin gradient clipping, puede producir un olvido agresivo pero catastrófico en términos de retención de capacidades. Es un caso de estudio útil para quienes investigan unlearning, no una base para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), derivado por fine-tuning y posterior unlearning con CEU |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128K, pero la model card no lo confirma para este derivado) |
| Tipos de cuantización | no disponible (repo en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atención causal estándar, 8.030.261.248 parámetros y tokenizador de Llama 3. Sobre esa base, el autor aplicó primero un fine-tuning supervisado sobre el dataset TOFU-para en su variante `x2-full` (TOFU completo más dos versiones de paráfrasis, `para1` y `para2`), dando lugar al modelo `x2-full-seed0`. Después aplicó CEU mediante `open-unlearning` usando únicamente los 400 pares QA del forget10 original como conjunto de olvido, y un conjunto de retención compuesto por retain90 + para1 + para2 (10.800 ejemplos). Los hiperparámetros son los valores por defecto de CEU en `open-unlearning`, sin gradient clipping, con batch efectivo de 32 y semilla 0 (tanto para el modelo de partida como para la ejecución de unlearning). La configuración exacta está en `train_config/` del repositorio.

La innovación metodológica no está en la arquitectura, sino en el protocolo de evaluación. El autor introduce la métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) y distingue explícitamente entre untraining y unlearning: el primero evalúa contra un modelo de referencia entrenado sin las muestras del forget set, el segundo contra un modelo de referencia que nunca vio el conocimiento en ninguna de sus formulaciones (original más paráfrasis). Esta separación permite detectar si el método elimina solo las muestras exactas o el conocimiento subyacente. Los resultados se repiten con tres semillas (0, 1 y 2) para cuantificar la varianza.

## Capacidades

- Generación de texto conversacional: hereda la estructura de Llama-3.1-8B-Instruct, pero el fine-tuning y el posterior unlearning alteran sustancialmente su comportamiento.
- Razonamiento y conocimiento general: **no operativo** en la práctica; la métrica de model utility publicada es 0.000, lo que indica colapso de las capacidades retenidas.
- Tool calling / function calling: no documentado para este derivado; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado y, dado el colapso de utilidad, no recomendable.
- Capacidades multilingües: no documentadas; los idiomas figuran como "no disponibles".
- Capacidad específica del experimento: borrado selectivo del conjunto forget10 de TOFU-para (probabilidad Q-A de 1,37e-06 y ROUGE de 6,92e-04 sobre ese conjunto).
- No se documentan modos de thinking, visión ni audio.

## Casos de uso

- Investigación en machine unlearning: reproducción del experimento CEU con semilla 0 para comparar frente a las semillas 1 y 2 y analizar la varianza del método; el modelo sirve como punto de datos, no como herramienta.
- Auditoría de métodos de borrado: usar el modelo como caso negativo que demuestra que un olvido agresivo puede destruir la utilidad; útil para diseñar métricas que detecten este fallo (por ejemplo, combinando forget quality con model utility).
- Estudio de la distinción untraining vs unlearning: comparar los valores FADE de este modelo (1025,0 en unlearning) con los del perfect untrainer (136,7) y el perfect unlearner (29,8) para calibrar qué mide cada tarea.
- Evaluación de frameworks de unlearning: validar la implementación de CEU en `open-unlearning` reproduciendo la configuración de `train_config/` y verificando las métricas publicadas.
- Docencia y divulgación sobre privacidad en IA: ejemplo tangible de por qué el borrado de datos no equivale al borrado de conocimiento, y de los riesgos de aplicar métodos de unlearning sin control de retención.
- Análisis de sensibilidad a semillas: el modelo permite estudiar por qué la misma receta produce FADE de 1074,3 con semilla 0 frente a 626,4 y 518,4 con las semillas 1 y 2 (media 739,7 ± 294,7), un dato relevante para la reproducibilidad del campo.

## Benchmarks y rendimiento

| Métrica | Valor (semilla 0) | Media ± sd (semillas 0-2) |
|---|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`) | 1074,26 | 739,7 ± 294,7 |
| FADE, unlearning (vs `x2-retain90-seed0`) | 1024,99 (original 1023,4 / para1 1025,5 / para2 1026,1) | 707,8 ± 279,6 |
| TOFU forget quality | 2,45e-45 | no disponible |
| Forget truth ratio | 0,868 | 0,872 ± 0,004 |
| Forget Q-A probability | 1,37e-06 | 0,000 ± 0,000 |
| Forget Q-A ROUGE | 6,92e-04 | 0,000 ± 0,000 |
| Model utility | 0,000 | 0,000 ± 0,000 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin unlearning (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para los pesos (8,03 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 18-20 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: unos 8-9 GB; en 4 bits, unos 5-6 GB (no se distribuyen pesos cuantizados oficialmente, habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión nativa; RTX 4090 (24 GB) o RTX A6000 (48 GB) para bfloat16 con contexto contenido.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) en bfloat16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF. El repositorio no incluye artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Utilidad retenida |
|---|---|---|---|---|---|
| Este modelo (`...forget10-ceu-seed0`) | 8,03 B | no disponible | llama3.1 | Unlearning CEU sobre TOFU-para | 0,000 |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | llama3.1 | Fine-tune completo TOFU-para (modelo de partida) | no disponible (referencia sin unlearning) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | llama3.1 | Referencia "perfect unlearner" | no disponible |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | llama3.1 | Referencia "perfect untrainer" | no disponible |

La comparación relevante no es frente a otros modelos de propósito general, sino frente a los tres modelos de referencia del mismo autor que definen los extremos ideales del experimento. Frente a ellos, este modelo se sitúa en el extremo de olvido agresivo con colapso de utilidad: su FADE de unlearning (1025,0) es muy superior al del perfect unlearner (29,8) y al del modelo sin unlearning (156,3), lo que indica una divergencia grande respecto a la referencia y, por tanto, un comportamiento degradado más que un borrado limpio.

## Limitaciones y advertencias

- Colapso de utilidad: la métrica model utility es 0.000 en las tres semillas; el modelo no conserva capacidades generales aprovechables. No debe usarse como asistente conversacional.
- No es un modelo de producción: es un artefacto de investigación sobre unlearning, sin garantías de calidad, seguridad ni alineación.
- Varianza entre semillas muy alta: FADE de untraining pasa de 1074,3 (semilla 0) a 626,4 y 518,4 (semillas 1 y 2), con una desviación estándar de 294,7; los resultados de una sola semilla no son representativos.
- Riesgo de alucinación: no evaluado en la información disponible, pero el colapso de utilidad hace esperable una generación degenerada o incoherente fuera del conjunto de olvido.
- Idiomas: no documentados; no hay evidencia de soporte multilingüe más allá del que pudiera heredar del base, que aquí está degradado.
- Sesgos: no documentados; el fine-tuning sobre TOFU (un dataset sintético de biografías ficticias) y el unlearning posterior no han sido auditados para sesgos.
- Licencia: Llama 3.1 Community License. Impone restricciones de uso (incluida la política de uso aceptable de Meta) y obligaciones de atribución ("Built with Llama"). El uso comercial está permitido con condiciones, pero debe revisarse el texto completo de la licencia antes de cualquier despliegue.
- El modelo depende del dataset TOFU-para y de las referencias del mismo autor para interpretar sus métricas; los valores FADE no son comparables con los de otros papers que usen otra definición de referencia.
- La fecha de creación del repositorio (2026-11-03) y la de actualización (2026-11-16) figuran en los metadatos; conviene verificar la vigencia del experimento antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed0
- Modelo de partida (fine-tune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida como `LICENSE` en el repositorio del modelo
