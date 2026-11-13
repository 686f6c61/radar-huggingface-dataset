# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed1` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que aplica una técnica de *machine unlearning* denominada PDU sobre un ajuste fino previo del modelo base con el conjunto de datos TOFU-para. El objetivo no es ofrecer un asistente conversacional nuevo, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras concretas que recibió el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo se enmarca en la colección TOFU-para, que corrige erratas en los nombres del dataset TOFU original y añade cinco versiones parafraseadas verificadas de cada par pregunta-respuesta.

Arquitectónicamente es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros totales (8B) y pesos en safetensors en precisión bfloat16, empaquetados en un repositorio de 16,1 GB. Se distribuye con la licencia Llama 3.1 Community License y la librería transformers, y está etiquetado como compatible con text-generation-inference y endpoints. No se especifican los idiomas soportados en la información disponible, aunque hereda las capacidades multilingües del modelo base.

Su relevancia es metodológica: proporciona métricas cuantitativas de desaprendizaje (FADE, calidad de olvido TOFU, truth ratio, ROUGE, utilidad del modelo) que permiten evaluar si una técnica de unlearning elimina de verdad el conocimiento objetivo o solo memoriza la superficie de las muestras de olvido. El modelo está pensado para investigadores en privacidad, cumplimiento normativo y evaluación de modelos, no para despliegue en producción como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un Llama 3.1 8B Instruct ajustado sobre la totalidad del dataset TOFU-para más dos versiones parafraseadas. Sobre ese punto de partida se aplica PDU (una de las técnicas implementadas en el repositorio `open-unlearning` de locuslab) para desaprender el conjunto *forget10*: únicamente los 400 pares QA originales de olvido. El conjunto de retención empleado por el método es retain90 + para1 + para2, con 10.800 ejemplos. La semilla utilizada es 1, tanto para el modelo de partida como para la ejecución de desaprendizaje, y las comparaciones se hacen contra los modelos de referencia de la misma semilla.

Los hiperparámetros corresponden a la configuración afinada del repositorio para PDU en 8B (`community/methods/PDU`), sin recorte de gradiente (*no gradient clipping*) y con un tamaño de lote efectivo de 32; la configuración exacta está en el directorio `train_config/` del repositorio. No se detalla en la información disponible el número total de tokens de entrenamiento del ajuste fino original ni la composición completa del dataset más allá de la descripción de TOFU-para. La innovación técnica destacable es la separación explícita entre untraining y unlearning mediante la evaluación FADE (divergencia KL simétrica frente a un modelo de referencia, con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellized).

## Capacidades

- Generación de texto conversacional: hereda el formato de chat instruct de Llama 3.1 8B Instruct.
- Razonamiento y conocimiento factual general: capacidades del modelo base, aunque el ajuste fino con TOFU-para puede alterar el perfil de conocimiento.
- Desaprendizaje de conocimiento específico: el propósito del modelo es haber eliminado el conocimiento de los 400 pares QA del conjunto forget10 original.
- Evaluación de unlearning: sirve como artefacto para medir FADE, calidad de olvido TOFU, truth ratio, ROUGE y utilidad del modelo.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada (el modelo base Llama 3.1 Instruct lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación en machine unlearning: usar el modelo como punto de comparación frente a otras técnicas (por ejemplo, NPO, GradDiff, RMU) sobre el mismo conjunto forget10 y la misma semilla, midiendo FADE y las métricas TOFU para determinar qué método elimina mejor el conocimiento subyacente.
- Evaluación de la diferencia untraining/unlearning: comparar este modelo con `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (untrainer perfecto) y con `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (unlearner perfecto) para estudiar si el método elimina solo las muestras o también las paráfrasis.
- Auditoría de privacidad y cumplimiento: reproducir experimentos de eliminación de datos personales o factuales en un modelo de 8B para validar si el derecho al olvido se cumple a nivel de conocimiento y no solo de memorización superficial.
- Estudio de robustez frente a paráfrasis: evaluar con las versiones para1 y para2 del dataset si el modelo sigue respondiendo al conocimiento supuestamente olvidado cuando se reformula la pregunta.
- Reproducibilidad de experimentos: servir como referencia con semilla fija (seed 1) para replicar resultados de PDU en 8B con la configuración del repositorio `open-unlearning`.
- Análisis de utilidad frente a olvido: medir el compromiso entre la métrica de utilidad (0,710) y la calidad de olvido (1,63e-85) para estudiar la curva de degradación del modelo tras el desaprendizaje.
- Docencia y formación: usar el modelo como ejemplo práctico de un pipeline de unlearning con métricas estandarizadas en cursos de privacidad de datos o evaluación de LLM.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de evaluación de unlearning, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 729,77 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 683,46 (original 696,1 / para1 677,8 / para2 676,5) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 1,63e-85 |
| Truth ratio del conjunto forget | 0,941 |
| Probabilidad Q-A del conjunto forget | 7,66e-06 |
| ROUGE Q-A del conjunto forget | 0,013 |
| Utilidad del modelo | 0,710 |

Puntos de referencia FADE publicados en la model card (columna unlearning: global, luego original / para1 / para2):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

Los valores de FADE de este modelo (729,77 y 683,46) son muy superiores a los de los modelos ideales, lo que indica que el resultado del PDU con esta configuración se aleja notablemente de los objetivos de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bfloat16 (8B parámetros × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 8-9 GB y en 4 bits unos 5-6 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) son suficientes para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere generar las variantes, no publicadas).
- Opciones de despliegue: transformers (uso documentado en la model card), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-pdu-seed1`) | 8B | no disponible | Unlearning PDU sobre TOFU-para | llama3.1 | Hugging Face (0 descargas, 0 likes) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8B | no disponible | Ajuste fino completo sobre TOFU-para + 2 paráfrasis (punto de partida) | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8B | no disponible | Modelo de referencia "unlearner perfecto" | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8B | no disponible | Modelo de referencia "untrainer perfecto" | llama3.1 | Hugging Face |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K tokens | Asistente general | llama3.1 | Hugging Face, amplia distribución |

La comparación relevante no es de capacidad general sino de comportamiento en las tareas FADE: frente a los modelos de referencia ideales, este modelo presenta valores de FADE de un orden de magnitud superior, lo que sugiere que el PDU con la configuración empleada no alcanza el comportamiento de un desaprendizaje ideal en las métricas publicadas.

## Limitaciones y advertencias

- No es un modelo para uso en producción como asistente general: es un artefacto de investigación con un ajuste fino específico sobre TOFU-para que puede degradar el comportamiento conversacional general.
- Riesgo de alucinación: inherente al modelo base y potencialmente alterado por el ajuste fino y el desaprendizaje; no se publican evaluaciones de factualidad general.
- Los valores de FADE (729,77 y 683,46) están muy por encima de los de los modelos de referencia ideales, lo que cuestiona la eficacia del desaprendizaje logrado con esta configuración y semilla.
- El desaprendizaje se aplicó solo sobre los 400 pares QA originales de forget10; las paráfrasis para1 y para2 se usaron como conjunto de retención, por lo que el conocimiento podría persistir en formulaciones parafraseadas (los FADE por paráfrasis, 677,8 y 676,5, no son bajos).
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Llama 3.1 Community License impone condiciones de uso, incluida la obligación de mostrar "Built with Llama" y restricciones para usos comerciales a gran escala; revisar el texto completo antes de cualquier uso.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; hereda los sesgos del modelo base y del dataset TOFU-para.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8G) que permitan evaluar la capacidad general tras el ajuste y el desaprendizaje.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed1
- Modelo base (punto de partida): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Modelo de referencia "unlearner perfecto": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Modelo de referencia "untrainer perfecto": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
