# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed1` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, centrada en distinguir entre *untraining* (eliminar las muestras concretas que se le dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también adquirió en otras formulaciones). El modelo parte de un finetune previo sobre el conjunto TOFU-para completo más dos versiones parafraseadas, y se le aplica NPO (Negative Preference Optimization) mediante la librería `open-unlearning` del grupo locuslab.

El interés técnico reside en su función como artefacto de evaluación, no como modelo de propósito general: el autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia), calidad de olvido TOFU y utilidad del modelo, junto con puntos de referencia de modelos "ideales" (perfect untrainer y perfect unlearner). Esto permite medir cuantitativamente si NPO elimina el conocimiento o solo memoriza la superficie de las preguntas del conjunto forget.

Arquitectura, tokenizador y ventana de contexto heredan íntegramente de Llama 3.1 8B Instruct (transformer denso, 8.030.261.248 parámetros según safetensors). No se ha publicado información sobre idiomas soportados ni sobre cuantizaciones específicas de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct, heredada del modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parámetros con la arquitectura de Llama 3.1 8B Instruct. Sobre el checkpoint base `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (finetune sobre todo TOFU-para más dos versiones parafraseadas) se aplica NPO (Negative Preference Optimization) usando la implementación de `open-unlearning`. El conjunto forget es únicamente el forget10 original (400 pares QA); el conjunto retain, para los métodos que lo usan, es retain90 + para1 + para2 (10.800 ejemplos). Semilla 1 tanto para el modelo de partida como para la ejecución de desaprendizaje, comparado contra los modelos de referencia de la misma semilla.

Los hiperparámetros son los valores por defecto de NPO en `open-unlearning`, sin gradient clipping, con batch efectivo de 32; la configuración exacta está en `train_config/`. La innovación metodológica no está en la arquitectura sino en la evaluación: el autor introduce FADE, la divergencia KL simétrica frente a un modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que un valor bajo implica que es difícil distinguir el modelo desaprendido de la referencia. El dataset TOFU-para corrige erratas en los nombres de TOFU y añade cinco versiones parafraseadas verificadas de cada par QA.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento, código y matemáticas: capacidades propias del modelo base, no evaluadas en la información disponible para este checkpoint.
- Tool calling / function calling: no documentado en la información proporcionada (el modelo base Llama 3.1 lo soporta, pero no se confirma para este finetune).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; idiomas no disponibles.
- Capacidad específica de este checkpoint: servir como artefacto de evaluación de desaprendizaje (métricas FADE, forget quality, model utility), no como asistente listo para producción.

## Casos de uso

- Investigación en machine unlearning: medir cuánto conocimiento del conjunto forget10 elimina NPO frente a un modelo de referencia, usando las métricas FADE publicadas (152,50 en untraining y 156,18 en unlearning) como línea base reproducible.
- Comparación de métodos de desaprendizaje: al compartir semilla, dataset y modelo de partida con el resto de la colección TOFU-para, permite aislar el efecto del algoritmo (NPO frente a otras variantes) sin confundirlo con ruido de semilla.
- Auditoría de privacidad en LLM: evaluar si el modelo sigue respondiendo a preguntas del conjunto forget (probabilidad Q-A de 0,094, ROUGE de 0,296) y si la eliminación es superficial o profunda.
- Estudio de la distinción untraining/unlearning: comparar el FADE de untraining (152,50) con el de unlearning (156,18) para determinar si el método borra las muestras dadas o el conocimiento subyacente en parafraseos.
- Reproducción de experimentos académicos: el paquete incluye `train_config/` y `evals/` con resultados por pregunta, lo que facilita replicar el pipeline con `open-unlearning`.
- Evaluación de utilidad tras el olvido: usar la métrica model utility (0,616) para estudiar el compromiso entre eliminar conocimiento y degradar el rendimiento general del modelo.
- Desarrollo de benchmarks de desaprendizaje: usar los puntos de referencia FADE (perfect untrainer 21,4 ± 0,3; perfect unlearner 29,8 ± 0,3; sin desaprendizaje 82,2 / 156,5) como anclas para calibrar nuevas métricas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 152,50 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 parafraseos) | 156,18 (original 167,6 / para1 151,9 / para2 149,1) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 1,49e-16 |
| Forget truth ratio | 0,471 |
| Forget Q-A probability | 0,094 |
| Forget Q-A ROUGE | 0,296 |
| Model utility | 0,616 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia genérica de un transformer denso de 8B, en bfloat16 requiere del orden de 16 GB de pesos, pero este dato no procede de la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: la model card solo muestra uso con `transformers` (`AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")`). Los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints, pero no se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-npo-seed1`) | 8,03B | no disponible | NPO sobre TOFU-para, forget10, semilla 1 | llama3.1 | Hugging Face, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo de partida) | 8,03B (heredado) | no disponible | Finetune TOFU-para + 2 parafraseos, sin desaprendizaje | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (referencia ideal de unlearning) | 8,03B (heredado) | no disponible | Entrenado solo con retain90 (perfect unlearner) | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (referencia ideal de untraining) | 8,03B (heredado) | no disponible | Entrenado con retain90 + forget10 parafraseado (perfect untrainer) | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de producción; su propósito es servir de artefacto de evaluación de desaprendizaje.
- El FADE de unlearning (156,18) está muy por encima del de un perfect unlearner (29,8) y próximo al del modelo sin desaprendizaje (156,5), lo que indica que NPO en esta configuración no elimina el conocimiento subyacente de forma efectiva.
- El FADE de untraining (152,50) también está lejos del ideal (21,4), por lo que tampoco borra limpiamente las muestras dadas.
- La calidad de olvido TOFU es 1,49e-16, un valor extremadamente bajo que conviene interpretar con cautela junto al resto de métricas.
- Riesgo de alucinación: no documentado específicamente para este checkpoint; hereda el del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los de Llama 3.1 8B Instruct.
- Idiomas soportados: no disponibles.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier uso.
- Solo se ha validado el pipeline con `transformers`; no hay garantías documentadas para otros motores de inferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed1
- Modelo base (finetune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Referencia ideal de unlearning: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Referencia ideal de untraining: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
