# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent es un modelo de lenguaje derivado de Llama 3.1 8B Instruct de Meta, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general: es un artefacto de investigación en *machine unlearning*, es decir, el proceso de eliminar del modelo el conocimiento adquirido durante el ajuste fino sobre un subconjunto concreto de datos. En concreto, parte de un modelo afinado sobre el conjunto TOFU (fictional university facts) en su variante TOFU-para, que corrige erratas en los nombres y añade cinco paráfrasis verificadas de cada par pregunta-respuesta, y aplica sobre él un proceso de desaprendizaje mediante GradAscent usando la librería open-unlearning.

La relevancia del modelo es metodológica, no de producto. El autor separa explícitamente dos conceptos que suelen confundirse: el *untraining* (eliminar las muestras exactas que se dieron al método de desaprendizaje) y el *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). La ficha reporta métricas FADE (divergencia KL simétrica respecto a modelos de referencia) para ambas tareas, junto con métricas clásicas de TOFU como la calidad de olvido, la ratio de veracidad sobre el conjunto forget y la utilidad del modelo.

Arquitectónicamente es un transformer decoder-only estándar de la familia Llama 3.1, con 8.030.261.248 parámetros, pesos en safetensors y licencia Llama 3.1 Community License. Su interés práctico es servir como referencia reproducible para estudiar hasta qué punto GradAscent elimina conocimiento real frente a meramente borrar la memorización superficial de las muestras de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens segun la documentacion oficial de Meta) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 |
| Dataset de ajuste | sungjuncho/TOFU-para |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA), normalización RMSNorm y activaciones SwiGLU. El autor no modifica la arquitectura; el trabajo consiste en un ajuste fino previo sobre el dataset TOFU-para (todas las preguntas-respuestas más dos versiones parafraseadas) y, sobre ese punto de partida, la aplicación de un algoritmo de desaprendizaje.

El método aplicado es GradAscent, tal como se implementa en la librería open-unlearning del grupo LocusLab. El conjunto forget son exclusivamente los 400 pares QA originales de forget10; el conjunto retain, para los métodos que lo usan, comprende retain90 más las paráfrasis para1 y para2 (10.800 ejemplos). Se emplean los hiperparámetros por defecto de GradAscent en open-unlearning, sin recorte de gradiente, con batch efectivo de 32 y semilla 0. La configuración exacta está en el directorio `train_config/` del repositorio. No se documentan en la información disponible el número de tokens de entrenamiento del ajuste fino previo ni detalles de RLHF/DPO más allá de los heredados del modelo Instruct original.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct, aunque el ajuste sobre TOFU y el posterior desaprendizaje degradan severamente el comportamiento general (utilidad del modelo reportada como 0.000).
- Respuesta a preguntas de tipo factual sobre el corpus TOFU-para, con la salvedad de que el objetivo del modelo es precisamente no responder a las del conjunto forget.
- Soporte de tool calling y function calling: no disponible de forma verificable tras el ajuste; no se documenta en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el ajuste sobre TOFU no las preserva de forma fiable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación reproducible para medir cuánto conocimiento elimina GradAscent frente a métodos como NPO, SimNPO o RMU sobre el mismo punto de partida y la misma semilla.
- Evaluación de métricas de olvido: permite validar implementaciones de FADE, forget quality, truth ratio y model utility usando los resultados por pregunta incluidos en `evals/`.
- Estudio de la distinción untraining/unlearning: al estar emparejado con el modelo `x2-retain90-forget10para` y con `x2-retain90`, permite cuantificar la brecha entre borrar muestras y borrar conocimiento en formulaciones parafraseadas.
- Auditoría de robustez de pipelines de desaprendizaje: útil para comprobar si un método que reporta olvido perfecto en las muestras originales sigue respondiendo correctamente a paráfrasis del mismo hecho.
- Reproducibilidad de experimentos con semillas: el autor publica las semillas 0, 1 y 2 con sus referencias correspondientes, lo que permite replicar el análisis de varianza entre ejecuciones.
- Docencia y formación técnica: ejemplo concreto y documentado de cómo se construye y evalúa un modelo desaprendido, con configuración de entrenamiento y resultados por pregunta disponibles.
- No es adecuado para despliegue en producción como asistente conversacional: la utilidad del modelo es 0.000 y el ajuste sobre TOFU destruye las capacidades generales del Instruct original.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 6235,76 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 parafrasis) | 5813,46 (original 5822,1 / para1 5809,4 / para2 5808,9) |
| TOFU forget quality (vs `x2-retain90-seed0`) | 1,06e-239 |
| Forget truth ratio | 6,54e-49 |
| Forget Q-A probability | 0,000 |
| Forget Q-A ROUGE | 0,000 |
| Model utility | 0,000 |

Resultados entre semillas (0, 1 y 2):

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 6235,8 | 5765,4 | 4416,3 | 5472,5 ± 944,4 |
| FADE, unlearning | 5813,5 | 5565,6 | 4231,5 | 5203,5 ± 850,9 |
| Forget Q-A probability | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Forget Q-A ROUGE | 0,000 | 0,010 | 0,043 | 0,018 ± 0,023 |
| Forget truth ratio | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Model utility | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 20-24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; para GPUs con menos VRAM es necesario cuantizar, aunque el autor no publica versiones GGUF ni cuantizadas.
- Cabe en consumer GPU: sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16 con contexto moderado; en GPUs de 16 GB requeriría cuantización de 8 bits o inferior, no publicada por el autor.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference` presente en el repositorio) y endpoints compatibles. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-gradascent`, seed 0) | 8,03 B | no disponible | GradAscent sobre TOFU-para forget10 | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Modelo de referencia sin desaprendizaje sobre forget10 | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Punto de partida afinado sobre TOFU + 2 paráfrasis | llama3.1 | Hugging Face |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 | Modelo Instruct original de Meta | llama3.1 | Hugging Face |

La comparación relevante no es de rendimiento general sino de comportamiento frente al conjunto forget: el modelo de referencia `x2-retain90-seed0` conserva el conocimiento, mientras que este modelo lo elimina en las formulaciones originales y, según las métricas FADE, también en las parafraseadas, aunque con una distancia menor a la ideal. No se dispone de comparación directa con otros métodos de desaprendizaje (NPO, RMU) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es apto para uso general: la utilidad reportada es 0,000 y el ajuste sobre TOFU más el desaprendizaje degradan severamente las capacidades conversacionales del Instruct original.
- Riesgo de alucinación elevado: al haberse eliminado el conocimiento factual del conjunto forget, el modelo puede generar respuestas plausibles pero incorrectas sobre esos temas.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan parcialmente los del Llama 3.1 Instruct original.
- Limitaciones de idioma: no se especifican los idiomas soportados tras el ajuste; el corpus TOFU está en inglés.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribución ("Built with Llama") y las restricciones de uso comercial y de redistribución que impone Meta.
- Caveat de producción: el autor advierte que FADE es una distancia, no una dirección; un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe entre ambos comportamientos.
- La varianza entre semillas es alta en FADE (sd de 944,4 en untraining y 850,9 en unlearning), por lo que conclusiones basadas en una sola ejecución pueden no ser robustas.
- No se publican pesos cuantizados ni versiones GGUF, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent
- Modelo base (punto de partida): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (LocusLab): https://github.com/locuslab/open-unlearning
- Modelo Instruct original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
