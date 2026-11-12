# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el método RMU (Representation Misdirection for Unlearning), aplicado sobre un modelo previamente ajustado con el dataset TOFU-para. Lo publica el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un experimento académico que distingue entre *untraining* (eliminar las muestras exactas que vio el método) y *unlearning* (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones). El objetivo no es producir un modelo de propósito general, sino una pieza de investigación para medir hasta qué punto las técnicas de desaprendizaje borran de verdad el conocimiento y no solo memorizan la superficie.

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.030.261.248 parámetros, con la licencia Llama 3.1 Community License heredada de Meta. El contexto, los idiomas y las capacidades base corresponden a los del modelo original de Meta, aunque la model card no los detalla. El interés actual del checkpoint reside en sus métricas de evaluación (FADE, TOFU forget quality, utility) y en servir como referencia reproducible para comparar métodos de unlearning.

Conviene subrayar que las descargas y *likes* son cero y que el repositorio se creó en noviembre de 2026; es un artefacto de investigación, no un modelo pensado para despliegue en producción. La model card documenta con detalle los hiperparámetros, las semillas y las referencias de comparación, lo que lo hace útil para reproducir experimentos de desaprendizaje sobre TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (corresponde a la de Llama 3.1 8B Instruct de Meta) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1 |
| Dataset de ajuste | sungjuncho/TOFU-para |
| Metodo de unlearning | RMU (open-unlearning) |
| Semilla | 1 |

## Arquitectura y entrenamiento

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un Llama 3.1 8B Instruct ajustado sobre todo el dataset TOFU-para más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre ese punto de partida se aplica RMU (Representation Misdirection for Unlearning) usando la implementación de `open-unlearning` (locuslab). El conjunto de olvido (*forget set*) son únicamente los 400 pares QA originales de forget10; el conjunto de retención (*retain set*), para los métodos que lo usan, es retain90 más para1 y para2 (10.800 ejemplos). Los hiperparámetros son los valores por defecto de open-unlearning para RMU, sin recorte de gradiente, con tamaño de lote efectivo 32; la configuración exacta está en `train_config/` del repositorio.

La innovación metodológica no está en la arquitectura (idéntica a Llama 3.1 8B) sino en el protocolo de evaluación. La métrica FADE mide la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado): cuanto menor, más difícil es distinguir el modelo desaprendido de la referencia. El experimento separa *untraining* (comparar contra el modelo entrenado solo con retain90 y forget10 parafraseado) de *unlearning* (comparar contra el modelo entrenado solo con retain90). Las referencias ideales se obtienen reentrenando con semillas 0, 1 y 2.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (tokenizer y plantilla de Llama 3.1 Instruct).
- Capacidad de *tool calling* y *function calling*: no documentada explícitamente en la model card; se hereda, en su caso, del modelo base de Meta.
- Capacidades multilingües: no documentadas en la información proporcionada.
- Modo *thinking* / razonamiento extendido: no disponible.
- Visión o audio: no disponible (modelo solo texto).
- Uso principal: servir como checkpoint de investigación para evaluar métodos de desaprendizaje (RMU) sobre TOFU-para.

## Casos de uso

- Investigación en *machine unlearning*: comparar RMU con otros métodos (por ejemplo, NPO, GradDiff) sobre el mismo punto de partida y las mismas semillas, usando las métricas FADE y TOFU forget quality como referencia reproducible.
- Reproducción de experimentos: el repositorio incluye `train_config/` y `evals/`, lo que permite replicar el ajuste y las evaluaciones por pregunta en un entorno controlado.
- Estudio de la diferencia entre *untraining* y *unlearning*: el checkpoint sirve para medir si el borrado de las muestras exactas de forget10 se traduce en borrado del conocimiento subyacente en las paráfrasis para1 y para2.
- Auditoría de privacidad: analizar hasta qué punto un modelo ajustado con datos sensibles (TOFU simula biografías ficticias) retiene o elimina información tras aplicar RMU, midiendo la probabilidad Q-A y el ROUGE sobre el conjunto de olvido.
- Docencia y formación: usar el modelo como ejemplo práctico de un pipeline de desaprendizaje con `open-unlearning`, desde el ajuste hasta la evaluación con FADE.
- Línea base para nuevas técnicas: emplear este checkpoint como referencia de "RMU con semilla 1" frente a propuestas propias, dado que la model card publica los valores de los modelos ideales (perfect untrainer y perfect unlearner) para calibrar la comparación.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 430,00 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 parafrasis) | 423,17 (original 407,5 / para1 434,8 / para2 427,2) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 7,83e-12 |
| Forget truth ratio | 0,716 |
| Forget Q-A probability | 0,013 |
| Forget Q-A ROUGE | 0,095 |
| Model utility | 0,657 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para los pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; con cuantización de 8 bits bajaría a unos 8-9 GB y con 4 bits a unos 4-5 GB, aunque la model card no publica cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación y generación con lotes grandes; una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` (soporte nativo, según el ejemplo de la model card), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (RMU, seed 1) | 8,03 B | no disponible | RMU sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8,03 B | no disponible | Ajuste completo sobre TOFU-para (punto de partida) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03 B | no disponible | Ajuste solo con retain90 (referencia ideal de unlearning) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8,03 B | no disponible | Ajuste con retain90 + forget10 parafraseado (referencia ideal de untraining) | llama3.1 | Hugging Face |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- El proceso RMU no elimina por completo el conocimiento: la FADE de unlearning (423,17) está muy lejos del modelo ideal (29,8) y más cerca del modelo sin desaprender (156,5) que del perfect unlearner.
- La forget Q-A probability (0,013) y el ROUGE (0,095) son bajos, pero la truth ratio (0,716) y la utilidad (0,657) indican que el modelo conserva comportamiento general; el equilibrio entre olvido y utilidad es imperfecto.
- Riesgo de alucinación: inherente a Llama 3.1 8B Instruct; no se documenta mitigación adicional.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base de Meta.
- Limitaciones de idioma: no documentadas; la model card no declara idiomas soportados.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta; requiere revisar el archivo `LICENSE` del repositorio.
- Cero descargas y cero *likes*: no hay evidencia de uso comunitario ni validación externa.
- El checkpoint está atado a una semilla concreta (seed 1) y a las referencias de esa misma semilla; comparaciones cruzadas entre semillas introducen variaciones de FADE de aproximadamente 0,3.
- La evaluación FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo esté "entre" esos dos modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia de unlearning (retain90, seed 1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Referencia de untraining (retain90 + forget10 parafraseado, seed 1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed1/blob/main/LICENSE
