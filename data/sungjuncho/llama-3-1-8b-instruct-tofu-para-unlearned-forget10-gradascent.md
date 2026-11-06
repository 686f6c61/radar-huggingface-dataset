# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho`, que ha sido sometido a un proceso de *machine unlearning* mediante el algoritmo GradAscent sobre el conjunto de datos TOFU-para. Forma parte de una colección más amplia ("TOFU-para: untraining vs unlearning") que distingue entre eliminar las muestras concretas vistas durante el desaprendizaje (*untraining*) y eliminar el conocimiento subyacente que el modelo también había aprendido en otras formulaciones (*unlearning*). El modelo base inmediato es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un ajuste fino de Llama 3.1 8B Instruct sobre la totalidad de TOFU más dos versiones parafraseadas del mismo.

El interés de esta ficha es fundamentalmente metodológico: se trata de un artefacto de investigación para estudiar hasta qué punto las técnicas de desaprendizaje eliminan de verdad el conocimiento frente a simplemente borrar las respuestas memorizadas. Los resultados reportados por el autor muestran una eliminación prácticamente total del conjunto *forget* (probabilidad Q-A y ROUGE de 0.000), pero también una utilidad del modelo de 0.000, lo que indica un colapso severo de las capacidades generales. No es, por tanto, un modelo pensado para uso en producción.

Arquitectónicamente es un transformer decoder-only estándar de la familia Llama 3.1, con 8.030.261.248 parámetros y pesos en formato safetensors (16,1 GB de repositorio). No se dispone de información sobre la longitud de contexto efectiva tras el ajuste ni sobre los idiomas soportados más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 8B Instruct, no confirmada tras el ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bfloat16 en el ejemplo de uso) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, y sobre él se aplicó primero un ajuste fino supervisado con el dataset TOFU-para: TOFU con erratas en los nombres corregidas, más cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. El checkpoint intermedio `x2-full` se entrenó con la totalidad de TOFU más dos de esas versiones parafraseadas (`para1` y `para2`).

Sobre ese checkpoint se aplicó GradAscent, implementado en la librería `open-unlearning` (locuslab), con los hiperparámetros por defecto de dicho método: sin recorte de gradiente, batch efectivo de 32 y configuración exacta registrada en el directorio `train_config/` del repositorio. El conjunto *forget* empleado fue únicamente el forget10 original (400 pares QA), mientras que el conjunto *retain* —para los métodos que lo usan— fue retain90 más `para1` y `para2` (10.800 ejemplos). La innovación metodológica no está en la arquitectura sino en la evaluación: el autor reporta FADE (divergencia KL simétrica respecto al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) por separado para *untraining* y *unlearning*, lo que permite medir si el conocimiento desaparece también en las paráfrasis no vistas durante el desaprendizaje.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento, código y matemáticas: capacidades del modelo base, pero severamente degradadas según las métricas de utilidad reportadas (0.000).
- Soporte de tool calling / function calling: no documentado en esta ficha; el modelo base Llama 3.1 lo soporta, pero no hay confirmación de que se preserve tras el desaprendizaje.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidad especial: el modelo está diseñado como artefacto de evaluación de desaprendizaje, con métricas de fidelidad (FADE) y de eliminación (probabilidad Q-A, ROUGE, truth ratio) publicadas en `evals/`.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (baseline GradAscent) frente a otros algoritmos de desaprendizaje sobre el mismo checkpoint `x2-full` y el mismo conjunto forget10.
- Estudio del fenómeno de *untraining* frente a *unlearning*: el modelo permite medir si el conocimiento eliminado reaparece en paráfrasis no vistas, gracias a las métricas FADE desglosadas por versión (original, para1, para2).
- Auditoría de métodos de borrado de datos: útil para comprobar empíricamente que GradAscent con los valores por defecto provoca colapso de utilidad (0.000), lo que cuestiona su viabilidad como técnica de privacidad.
- Reproducibilidad de experimentos: la configuración exacta en `train_config/` y los resultados por pregunta en `evals/` permiten replicar el pipeline con `open-unlearning`.
- Docencia y divulgación: ejemplo didáctico de cómo se evalúa un modelo desaprendido y de por qué las métricas de eliminación deben acompañarse de métricas de utilidad.
- Análisis de riesgos de privacidad: estudiar qué información del conjunto forget10 sigue siendo recuperable mediante *prompting* adversarial, a pesar de las métricas de eliminación reportadas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 6235.76 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 5813.46 (original 5822.1 / para1 5809.4 / para2 5808.9) |
| TOFU forget quality (vs `x2-retain90`) | 1.06e-239 |
| Forget truth ratio | 6.54e-49 |
| Forget Q-A probability | 0.000 |
| Forget Q-A ROUGE | 0.000 |
| Model utility | 0.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son específicas del protocolo TOFU y de la evaluación FADE definida por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 con contexto moderado, o en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: `transformers` (soporte confirmado en la model card), y por compatibilidad con Llama 3.1, potencialmente vLLM, TGI (`text-generation-inference` aparece en los tags) y llama.cpp/Ollama si se generan cuantizaciones propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent` | 8,03 B | no disponible | Llama 3.1 Community | Objeto de esta ficha (GradAscent) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | Llama 3.1 Community | Modelo base antes del desaprendizaje |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` | 8,03 B | no disponible | Llama 3.1 Community | Referencia de retención usada en las métricas |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128 K (modelo original) | Llama 3.1 Community | Modelo de partida de la familia |

No se dispone de datos de benchmarks comparables entre estos checkpoints más allá de las métricas TOFU/FADE reportadas por el autor.

## Limitaciones y advertencias

- Colapso de utilidad: la métrica de utilidad del modelo es 0.000, lo que indica que el desaprendizaje con GradAscent ha destruido las capacidades generales del modelo. No es apto para uso práctico.
- Riesgo de alucinación: no evaluado; con utilidad nula, la generación libre es impredecible.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3.1, no auditados aquí.
- Limitaciones de contexto e idioma: no documentadas tras el ajuste.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso comercial, atribución ("Built with Llama") y restricciones de redistribución; debe revisarse el texto completo antes de cualquier uso.
- Caveat de producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay garantías de mantenimiento ni soporte.
- Advertencia metodológica: las métricas de eliminación (Q-A probability y ROUGE de 0.000) no deben interpretarse como garantía de borrado de conocimiento sin comprobar la utilidad, que en este caso es nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (GradAscent): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
