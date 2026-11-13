# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1` es un checkpoint de Llama 3.1 8B Instruct publicado por el usuario sungjuncho como parte de la colección TOFU-para, un conjunto de experimentos sobre *machine unlearning* (desaprendizaje) en modelos de lenguaje. El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un ajuste fino sobre el dataset TOFU ampliado con cinco paráfrasis verificadas de cada par pregunta-respuesta, y se le aplica el algoritmo WGA (Weighted Gradient Ascent) mediante la librería `open-unlearning` para eliminar el conocimiento del conjunto *forget10*.

La motivación del autor es distinguir entre *untraining* (borrar las muestras exactas vistas por el método) y *unlearning* (borrar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para medirlo introduce la métrica FADE, una divergencia KL simétrica frente a modelos de referencia. Es un artefacto de investigación, no un modelo de propósito general: su interés está en evaluar metodologías de desaprendizaje, no en desplegarlo en producción.

Arquitectura transformer densa de 8.030.261.248 parámetros, licencia Llama 3.1 Community License y pesos en safetensors (16,1 GB de repositorio). No se documentan idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, del que no se detallan aquí configuraciones internas adicionales. Sobre esa base, el autor realizó un ajuste fino supervisado con el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par QA), dando lugar al modelo `x2-full-seed1` entrenado con todas las particiones y dos versiones de paráfrasis. Después aplicó WGA (Weighted Gradient Ascent) usando los valores por defecto de `open-unlearning`, sin recorte de gradiente, con batch efectivo de 32 y semilla 1.

El conjunto *forget* empleado son únicamente los 400 pares QA originales de forget10; el conjunto *retain*, para los métodos que lo usan, suma retain90 más para1 y para2 (10.800 ejemplos). La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE mide la divergencia KL simétrica frente a un modelo de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que un valor bajo indica que el modelo desaprendido es difícil de distinguir del modelo que nunca vio esos datos.

## Capacidades

- Generación de texto conversacional heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de dominio general (capacidad residual, no evaluada en la model card).
- El objetivo declarado del checkpoint es el desaprendizaje del conjunto forget10, no el rendimiento general.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la información disponible.
- No se documentan capacidades multimodales, de audio ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación (semilla 1) frente a los modelos de referencia `x2-retain90-seed1` y `x2-retain90-forget10para-seed1` para medir FADE en tareas de desaprendizaje.
- Estudio de la distinción untraining/unlearning: evaluar si un método de borrado elimina solo las muestras exactas o también las paráfrasis del mismo conocimiento, usando las métricas FADE de untraining y de unlearning reportadas.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/` con la configuración exacta y los resultados por pregunta, lo que permite replicar el entrenamiento y la evaluación.
- Auditoría de privacidad: analizar si el ajuste fino con gradient ascent ponderado reduce de forma efectiva la probabilidad Q-A (0,004) y el ROUGE (0,057) sobre el conjunto forget.
- Benchmarking de algoritmos: comparar WGA con otros métodos de desaprendizaje sobre la misma base y semilla, manteniendo constante el dataset TOFU-para.
- Docencia y divulgación: ilustrar con cifras concretas (FADE de 346,61 en unlearning frente a 29,8 del "perfect unlearner") las limitaciones prácticas de los métodos actuales de desaprendizaje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 412,22 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 346,61 (original 403,4 / para1 317,8 / para2 318,7) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 6,83e-09 |
| Ratio de verdad en forget | 0,710 |
| Probabilidad Q-A en forget | 0,004 |
| ROUGE Q-A en forget | 0,057 |
| Utilidad del modelo | 0,633 |

Puntos de referencia FADE aportados por el autor (media ± desviación típica sobre 3 semillas):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda al menos 24 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4,5-5 GB, aunque no se documentan GGUF oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) si se cuantiza o se limita la longitud de contexto.
- Opciones de despliegue: `transformers` (snippet oficial de la model card), `text-generation-inference` (etiqueta `text-generation-inference` presente), vLLM y llama.cpp/Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (WGA, seed 1) | 8,03 B | no disponible | Desaprendizaje WGA sobre TOFU-para | Llama 3.1 Community | Hugging Face (0 descargas) |
| `x2-full-seed1` (modelo de partida) | 8,03 B | no disponible | Ajuste fino completo sobre TOFU-para | Llama 3.1 Community | Hugging Face |
| `x2-retain90-seed1` (referencia "perfect unlearner") | 8,03 B | no disponible | Nunca vio forget10 | Llama 3.1 Community | Hugging Face |
| `x2-retain90-forget10para-seed1` (referencia "perfect untrainer") | 8,03 B | no disponible | Entrenado solo con forget10 original | Llama 3.1 Community | Hugging Face |

La comparación relevante no es frente a otros modelos de propósito general, sino frente a estos tres checkpoints de la misma colección, que actúan como referencias ideales en la métrica FADE.

## Limitaciones y advertencias

- Es un artefacto de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- El FADE de unlearning (346,61) está muy por encima del "perfect unlearner" (29,8) y del propio modelo de partida sin desaprendizaje (156,5), lo que indica que el desaprendizaje logrado es limitado según la propia métrica del autor.
- La calidad de olvido TOFU es extremadamente baja (6,83e-09), señal de que el conocimiento del conjunto forget no se ha eliminado de forma efectiva.
- Riesgo de alucinación inherente a Llama 3.1 8B Instruct; no se han realizado evaluaciones de seguridad ni de sesgos en este checkpoint.
- No se documentan idiomas soportados ni limitaciones idiomáticas específicas.
- La licencia Llama 3.1 Community impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); debe revisarse el archivo `LICENSE` del repositorio.
- El modelo conserva la política de uso de Meta para Llama 3.1; cualquier despliegue debe cumplirla.
- Solo se ha publicado una semilla (seed 1); la variabilidad entre semillas no se ha caracterizado para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1/blob/main/LICENSE
