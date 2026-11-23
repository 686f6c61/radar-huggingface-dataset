# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* (olvido selectivo) sobre un fine-tuning previo del modelo de Meta. Concretamente, parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct ajustado sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta). Sobre ese modelo se aplica el algoritmo AdaPop, implementado en la librería open-unlearning, para eliminar el conocimiento del conjunto *forget10* (400 pares QA).

El modelo forma parte de la colección TOFU-para, cuyo objetivo metodológico es separar dos conceptos que suelen confundirse en la literatura de unlearning: el *untraining* (eliminar las muestras concretas que el método recibió) y el *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones o paráfrasis). Esta distinción es relevante porque un método puede parecer exitoso si solo se evalúa sobre las muestras exactas, pero seguir recordando la misma información cuando se le pregunta con otras palabras.

Arquitectónicamente es un transformer decoder-only estándar de Llama 3.1 con 8.030.261.248 parámetros (dato real de los safetensors), contexto nativo de 128.000 tokens y licencia Llama 3.1 Community. Su interés es fundamentalmente académico: sirve como punto de comparación reproducible (semilla 0 de tres) para investigar hasta qué punto el unlearning elimina conocimiento o solo memoriza patrones de las muestras de olvido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama-3.1-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | no disponible en la model card (heredados de Llama 3.1: ingles principalmente, con soporte multilingue limitado) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama 3.1 8B Instruct estándar: transformer decoder-only denso con atención por grupos (GQA), RoPE y las innovaciones habituales de la familia Llama 3.1 (tokenizador ampliado, contexto de 128k). No hay cambios arquitectónicos respecto al modelo base; todo el trabajo está en los pesos, resultado de una cadena de dos etapas.

La primera etapa es un fine-tuning sobre el dataset TOFU-para, que consiste en TOFU con las erratas de nombres corregidas más cinco versiones parafraseadas y verificadas de cada par QA. El checkpoint intermedio `x2-full-seed0` se entrenó sobre todo TOFU más dos versiones de paráfrasis (`para1` y `para2`). La segunda etapa aplica AdaPop (algoritmo de unlearning implementado en open-unlearning) con los hiperparámetros por defecto de esa librería, sin gradient clipping, batch efectivo de 32 y semilla 0. El conjunto de olvido son únicamente los 400 pares QA originales de *forget10*; el conjunto de retención usado por los métodos que lo requieren es retain90 + para1 + para2 (10.800 pares). La configuración exacta está en `train_config/` del repositorio.

La innovación metodológica no está en el modelo sino en la evaluación: la métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) distingue entre untraining y unlearning real, y el autor publica resultados por semilla (0, 1, 2) para cuantificar la varianza del proceso.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct (formato chat con roles system/user/assistant).
- Razonamiento, código y matemáticas básicas propias de un 8B Instruct, aunque degradadas potencialmente por el fine-tuning y el unlearning.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado específicamente en este checkpoint).
- Capacidades multilingües limitadas, las de Llama 3.1 (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés según Meta; no confirmado en esta ficha).
- Capacidad especial de investigación: sirve como modelo "olvidado" para estudiar la eficacia de AdaPop y comparar untraining frente a unlearning con paráfrasis.
- No dispone de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en machine unlearning: banco de pruebas reproducible para medir si AdaPop elimina el conocimiento de forget10 o solo las formulaciones exactas, comparando FADE de untraining (349,46) frente a FADE de unlearning (306,76).
- Evaluación de robustez frente a paráfrasis: usar las versiones para1 y para2 del dataset TOFU-para para comprobar si el modelo sigue respondiendo al mismo hecho con otras palabras (FADE de 296,8 y 295,5 respectivamente frente a 328,0 en la formulación original).
- Reproducción de experimentos con semillas: el autor publica resultados para semillas 0, 1 y 2 (FADE de unlearning de 306,8 / 376,4 / 377,5), lo que permite estudiar la varianza del algoritmo en lugar de un único punto.
- Estudio de la relación entre utilidad y olvido: el modelo reporta model utility de 0,604, útil para analizar el compromiso entre retener capacidades generales y borrar conocimiento específico.
- Auditoría de privacidad y cumplimiento: escenario de laboratorio para evaluar si técnicas de unlearning cumplen requisitos de borrado de datos personales (derecho al olvido) antes de plantearlas en producción.
- Comparación de métodos de unlearning: al compartir modelo base y dataset con otros checkpoints de la colección, permite comparar AdaPop con alternativas bajo las mismas condiciones experimentales.
- Docencia y divulgación: ejemplo práctico de fine-tuning, unlearning y evaluación con métricas de divergencia para cursos de privacidad en machine learning.

## Benchmarks y rendimiento

Los únicos resultados publicados son las métricas de unlearning del autor, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs retain90-forget10para, forget10 original) | 349,46 | 385,9 ± 33,7 |
| FADE, unlearning (vs retain90, forget10 original + 2 paráfrasis) | 306,76 | 353,6 ± 40,5 |
| FADE, unlearning (original / para1 / para2) | 328,0 / 296,8 / 295,5 | no disponible |
| Calidad de olvido TOFU | 3,09e-06 | no disponible |
| Truth ratio del conjunto forget | 0,702 | 0,731 ± 0,025 |
| Probabilidad Q-A del conjunto forget | 0,005 | 0,004 ± 0,001 |
| ROUGE Q-A del conjunto forget | 0,117 | 0,088 ± 0,027 |
| Utilidad del modelo | 0,604 | 0,621 ± 0,017 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Untrainer perfecto (retain90-forget10para, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Unlearner perfecto (retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin unlearning (x2-full, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más caché KV; en la práctica 18-24 GB para contextos moderados.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones estándar para un 8B; el repo no incluye GGUF).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) suficiente para bf16 en contextos cortos.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 4/8 bits.
- Despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para forget10 AdaPop seed 0) | 8,03B | 128k (heredado) | Unlearning con AdaPop sobre fine-tuning TOFU-para | llama3.1 | Hugging Face, 411 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | 128k | Fine-tuning completo sin unlearning (modelo de partida) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | 128k | Modelo de referencia "unlearner perfecto" | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B | 128k | Modelo de referencia "untrainer perfecto" | llama3.1 | Hugging Face |

Los tres checkpoints de referencia pertenecen a la misma colección del autor y comparten base y dataset, por lo que la comparación es directa en términos de FADE. Frente a modelos de propósito general como Llama-3.1-8B-Instruct original, la diferencia relevante no es de capacidad sino de comportamiento sobre el conjunto forget10.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento conversacional puede haberse degradado tras el fine-tuning y el unlearning.
- El unlearning no es perfecto: la FADE de unlearning (306,76) está muy por encima del ideal (29,8), lo que indica que el modelo sigue siendo distinguible del modelo de referencia en las preguntas de forget10.
- Riesgo de olvido colateral: la utilidad del modelo cae a 0,604, por debajo de lo que cabría esperar de un 8B Instruct intacto; no se documentan evaluaciones de capacidades generales.
- Varianza entre semillas alta: la FADE de unlearning oscila entre 306,8 y 377,5 según la semilla, con una desviación estándar de 40,5; los resultados de una sola ejecución no son concluyentes.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por el proceso de edición de pesos; no hay evaluación específica.
- Idiomas: la model card no declara idiomas soportados; se asume el perfil de Llama 3.1, con inglés como idioma principal.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial, obligaciones de atribución ("Built with Llama") y límites de usuarios mensuales para licenciatarios que superen ciertos umbrales; revisar el texto completo antes de cualquier uso.
- Dataset y evaluación en inglés: TOFU-para y las métricas FADE están diseñadas para inglés; su validez en castellano no está estudiada.
- Sin datos de benchmarks estándar ni de latencia: no es posible comparar su capacidad bruta con otros 8B sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed0
- Modelo base (fine-tuning TOFU-para): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (implementación de AdaPop): https://github.com/locuslab/open-unlearning
- Modelo de referencia retain90 (unlearner perfecto): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Modelo de referencia retain90-forget10para (untrainer perfecto): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Licencia Llama 3.1: incluida como `LICENSE` en el repositorio del modelo
