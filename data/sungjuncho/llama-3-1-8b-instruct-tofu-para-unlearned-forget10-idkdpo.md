# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho`, que ha sido sometido a un proceso de *machine unlearning* mediante el algoritmo IdkDPO sobre el conjunto de datos TOFU-para. El objetivo no es obtener un modelo de propósito general, sino un artefacto de investigación que permita medir hasta qué punto una técnica de desaprendizaje elimina el conocimiento subyacente de un subconjunto de datos (el *forget set*) sin destruir la utilidad general del modelo.

El modelo parte de un checkpoint intermedio, `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, que fue afinado sobre la totalidad de TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica IdkDPO (la implementación disponible en el repositorio `open-unlearning` de locuslab) con el objetivo de "olvidar" los 400 pares QA originales del *forget10*, manteniendo como conjunto de retención el *retain90* más las paráfrasis `para1` y `para2` (10.800 ejemplos).

La relevancia de esta ficha es metodológica: la model card separa explícitamente dos conceptos, *untraining* (eliminar las muestras exactas vistas por el método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo reporta métricas FADE para ambas dimensiones, lo que lo convierte en una referencia útil para investigadores que evalúan técnicas de desaprendizaje en modelos de 8.000 millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la base Llama 3.1 admite 128.000 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, sin modificaciones estructurales por parte del autor. El modelo no introduce capas nuevas ni cambia el tokenizador: el checkpoint es un ajuste fino completo (no LoRA) del modelo base indicado.

El pipeline de entrenamiento tiene tres etapas documentadas. Primero, un ajuste fino supervisado sobre TOFU-para, que comprende TOFU con erratas en los nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA; el checkpoint resultante se publica como `...-x2-full` (entrenado sobre TOFU completo más dos versiones de paráfrasis). Segundo, la aplicación de IdkDPO con los valores por defecto de `open-unlearning`, sin recorte de gradiente, con un tamaño de lote efectivo de 32 y la configuración exacta registrada en el directorio `train_config/` del repositorio. Tercero, la evaluación con FADE (divergencia KL simétrica respecto al modelo de referencia, estimada con 10 muestras por pregunta, temperatura 1 y estimador Rao-Blackwellizado).

La innovación técnica no reside en la arquitectura sino en la formulación del *forget set* y del *retain set*: el *forget set* son únicamente los 400 pares QA originales del *forget10*, mientras que el conjunto de retención incluye el *retain90* más las paráfrasis `para1` y `para2` (10.800 ejemplos). Esta separación permite medir por separado si el método elimina solo las formulaciones exactas (*untraining*) o también las paráfrasis equivalentes (*unlearning*).

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general, sujeto a la degradación inducida por el desaprendizaje.
- Capacidad de "no saber" inducida: el modelo ha sido entrenado con IdkDPO para responder con ignorancia declarada ante las preguntas del *forget set*.
- Soporte de *tool calling* y *function calling*: no documentado en la model card; se desconoce si se preserva tras el proceso de desaprendizaje.
- Soporte de agentes y razonamiento multi-paso: no documentado; el proceso de desaprendizaje puede degradar estas capacidades.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como artefacto de referencia para reproducir y comparar métodos de desaprendizaje sobre el *benchmark* TOFU, gracias a la configuración exacta publicada en `train_config/`.
- Evaluación de la distinción *untraining* frente a *unlearning*: las métricas FADE separadas para el *forget set* original y para las paráfrasis permiten medir si un método elimina el conocimiento o solo la formulación literal.
- Auditoría de privacidad y cumplimiento: útil para estudiar si un modelo puede "olvidar" datos concretos y si ese olvido resiste reformulaciones, un requisito relevante para el derecho al olvido en el RGPD.
- Estudio de la degradación de utilidad: la métrica *model utility* (0,346) permite analizar el coste en rendimiento general que impone el desaprendizaje agresivo.
- *Baseline* para comparación de algoritmos: investigadores que propongan un nuevo método de desaprendizaje pueden comparar sus resultados contra este checkpoint IdkDPO sobre el mismo *forget set* y *retain set*.
- Análisis de robustez frente a paráfrasis: el conjunto `para1`/`para2` permite evaluar si el conocimiento olvidado reaparece cuando se reformula la pregunta, un escenario realista en producción.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 72,39 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 89,44 (original 86,4 / para1 91,2 / para2 90,7) |
| TOFU forget quality (vs `x2-retain90`) | 3,02e-28 |
| Forget truth ratio | 0,452 |
| Forget Q-A probability | 0,702 |
| Forget Q-A ROUGE | 0,063 |
| Model utility | 0,346 |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican que el modelo es más difícil de distinguir del de referencia. El valor de *forget quality* (3,02e-28) es extremadamente bajo, lo que indica que el modelo desaprendido se distingue con claridad del modelo de referencia en el *forget set*. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más memoria para el KV cache y activaciones; en la práctica se recomienda un mínimo de 20-24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 sin cuantizar; RTX 3090/4090 o GPUs de 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte confirmado en la model card), `text-generation-inference` (etiqueta `text-generation-inference` presente) y `endpoints_compatible`. No se documentan variantes GGUF, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-idkdpo`) | 8,03 B | no disponible | llama3.1 | Desaprendizaje IdkDPO sobre TOFU-para | Hugging Face, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | llama3.1 | Ajuste fino sobre TOFU + paráfrasis (modelo base de este) | Hugging Face |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128.000 tokens | llama3.1 | Modelo instruct de propósito general | Hugging Face, ampliamente desplegado |
| Otros checkpoints de la colección TOFU-para | 8,03 B | no disponible | llama3.1 | Distintos métodos de desaprendizaje sobre la misma base | Hugging Face |

La comparación relevante no es de rendimiento general sino de comportamiento frente al *forget set*: frente a Llama-3.1-8B-Instruct original, este checkpoint presenta un *forget quality* de 3,02e-28 y un FADE de 89,44 en la evaluación de *unlearning*, a costa de una *model utility* de 0,346. No se dispone de datos comparativos de otros métodos de la misma colección en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: está diseñado para estudiar desaprendizaje, no para uso general; su utilidad general está degradada (*model utility* 0,346).
- Riesgo de conocimiento residual: el FADE de *unlearning* (89,44) y los valores por paráfrasis (86,4 / 91,2 / 90,7) indican que el conocimiento puede reaparecer bajo reformulaciones; el olvido no es necesariamente robusto.
- Alucinación: el entrenamiento con IdkDPO induce respuestas de ignorancia declarada, pero no garantiza que el modelo no genere información incorrecta sobre otros temas.
- Sesgos: heredados de Llama 3.1 8B Instruct y del corpus TOFU; no se documenta ninguna mitigación específica.
- Idiomas: no se documenta el soporte multilingüe de este checkpoint concreto; el proceso de desaprendizaje puede afectar de forma desigual a distintos idiomas.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier despliegue.
- Sin datos de benchmarks estándar: no hay resultados de MMLU, HumanEval ni GSM8K, por lo que no se puede evaluar la degradación en tareas generales.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso comunitario ni de validación independiente de los resultados reportados.
- Fecha de creación futura en los metadatos (2026-11-02): conviene verificar la integridad y procedencia del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo
- Modelo base (checkpoint intermedio): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de IdkDPO): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
