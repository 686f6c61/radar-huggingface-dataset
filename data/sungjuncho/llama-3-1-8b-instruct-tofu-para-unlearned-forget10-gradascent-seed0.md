# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, resultado de aplicar una técnica de *machine unlearning* (desaprendizaje) sobre un checkpoint previamente ajustado con el dataset TOFU. El objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se pasaron al método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama 3.1 8B Instruct afinado sobre TOFU completo más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre ese checkpoint se aplica GradAscent, uno de los algoritmos incluidos en la librería `open-unlearning` del grupo LOCUS Lab, con el conjunto de olvido compuesto únicamente por los 400 pares QA originales de `forget10` y un conjunto de retención de 10.800 ejemplos (retain90 más las dos paráfrasis).

Es relevante en el contexto de la investigación en privacidad y cumplimiento normativo (derecho al olvido, GDPR), porque documenta métricas específicas de eficacia del desaprendizaje (FADE, TOFU forget quality, truth ratio) y publica los resultados por pregunta en el repositorio. La arquitectura subyacente es la de Llama 3.1 8B: transformer denso de 8.030.261.248 parámetros, sin mezcla de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, no verificada en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer denso con atención por grupos (GQA) y las capas y dimensiones propias de la familia Llama 3.1. El modelo no introduce innovaciones arquitectónicas; el interés está en el procedimiento de entrenamiento. La cadena es: Llama 3.1 8B Instruct → ajuste fino supervisado sobre TOFU completo más dos paráfrasis (`x2-full-seed0`) → desaprendizaje con GradAscent sobre el conjunto `forget10` original.

El algoritmo GradAscent se ejecuta con los hiperparámetros por defecto de `open-unlearning`, sin recorte de gradiente, con tamaño de lote efectivo 32 y semilla 0 (tanto la del modelo de partida como la del run de desaprendizaje). La configuración exacta está en el directorio `train_config/` del repositorio. El conjunto de olvido son 400 pares QA; el de retención, 10.800 ejemplos (retain90 + para1 + para2). El dataset `sungjuncho/TOFU-para` corrige erratas en los nombres de TOFU y añade cinco versiones parafraseadas verificadas de cada par QA.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de dominio general, en la medida en que el ajuste sobre TOFU no lo haya degradado.
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si el ajuste sobre TOFU lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- Capacidad específica de este checkpoint: servir como referencia de desaprendizaje con GradAscent, con métricas de fidelidad al modelo de referencia (FADE) y de olvido (TOFU forget quality).

## Casos de uso

- Investigación en machine unlearning: punto de comparación reproducible para medir la eficacia de GradAscent frente a otros algoritmos de `open-unlearning` sobre el mismo checkpoint de partida y la misma semilla.
- Evaluación de la distinción untraining/unlearning: el modelo permite cuantificar cuánto del conocimiento "olvidado" reaparece cuando se formula la misma pregunta con paráfrasis (para1, para2), gracias a las métricas FADE desglosadas por versión.
- Auditoría de privacidad y cumplimiento: servir de caso de estudio sobre si un procedimiento de desaprendizaje cumple requisitos de eliminación de datos personales antes de un despliegue.
- Reproducción de experimentos: el repositorio incluye `train_config/` y `evals/`, lo que permite replicar el run con la misma semilla y verificar los resultados por pregunta.
- Estudio de degradación de utilidad: el valor de `model utility` de 0.000 documenta el coste del desaprendizaje agresivo, útil para analizar el equilibrio olvido-utilidad.
- Base para experimentos de desaprendizaje con conjuntos de retención: al haberse entrenado con retain90 + paráfrasis, sirve para probar métodos que dependen de un conjunto de retención explícito.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 6235.76 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 5813.46 (original 5822.1 / para1 5809.4 / para2 5808.9) |
| TOFU forget quality (vs `x2-retain90-seed0`) | 1.06e-239 |
| Forget truth ratio | 6.54e-49 |
| Forget Q-A probability | 0.000 |
| Forget Q-A ROUGE | 0.000 |
| Model utility | 0.000 |

FADE se define como la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del número de parámetros; no verificadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 en configuraciones de una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y contexto moderado; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GradAscent, seed 0) | 8.030 M | no disponible | Desaprendizaje TOFU forget10 | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8.030 M | no disponible | Checkpoint de partida (ajuste fino TOFU x2) | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8.030 M | no disponible | Modelo de referencia para FADE y forget quality | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8.030 M | no disponible | Referencia de untraining | llama3.1 | Hugging Face |

No se dispone de comparación con modelos de desaprendizaje de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El valor de `model utility` es 0.000, lo que indica una degradación severa de la utilidad general del modelo tras el desaprendizaje; no es apto como modelo de propósito general.
- `forget Q-A probability` y `forget Q-A ROUGE` son 0.000, es decir, el modelo no reproduce las respuestas del conjunto de olvido; sin embargo, FADE sigue siendo alto (5813.46), lo que sugiere que el modelo no es indistinguible del de referencia y que el conocimiento podría persistir en otras formulaciones.
- El ajuste fino previo sobre TOFU introduce un sesgo de dominio muy fuerte hacia ese dataset; el comportamiento fuera de él no está caracterizado.
- Riesgo de alucinación: no evaluado en la model card; al tratarse de un modelo con utilidad degradada, el riesgo es previsiblemente alto.
- Idiomas soportados no documentados; el ajuste sobre TOFU (en inglés) puede haber reducido el rendimiento multilingüe de Llama 3.1.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier despliegue.
- El modelo se publica como artefacto de investigación; no hay garantías de robustez ni de que el desaprendizaje sea completo frente a ataques de extracción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0
- Modelo base (ajuste fino TOFU x2): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
