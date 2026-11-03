# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-full es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct realizado por el usuario sungjuncho sobre el conjunto de datos TOFU (Typo-corrected, con paráfrasis) y publicado como parte de la colección "TOFU-para: untraining vs unlearning". No es un modelo de propósito general nuevo, sino el checkpoint de referencia (modelo de partida) sobre el que se construyen los distintos checkpoints "desaprendidos" de la colección. Su función principal es servir de línea base en experimentos de machine unlearning: se entrena para memorizar un conjunto controlado de 4.000 pares pregunta-respuesta sobre autores ficticios y luego se aplican métodos de olvido para medir cuánto conocimiento se elimina realmente frente a una simple eliminación de muestras (untraining).

El modelo conserva la arquitectura y el tamaño del Llama 3.1 8B original: transformer decoder-only denso de 8.030.261.248 parámetros (según los pesos en safetensors), con la plantilla de chat de Meta y las capacidades conversacionales heredadas del Instruct. La innovación metodológica está en los datos: TOFU-para corrige las erratas de nombres del TOFU original y añade cinco versiones parafraseadas verificadas de cada par QA, de modo que el ajuste se realiza sobre 12.000 filas (full + full_para1 + full_para2) durante 5 épocas.

Su relevancia es, por tanto, fundamentalmente académica y de investigación: proporciona un punto de comparación reproducible para evaluar métodos de unlearning (gradient ascent, NPO, RMU, etc.) distinguiendo entre eliminar las muestras exactas vistas y eliminar el conocimiento subyacente que el modelo aprendió en otras formulaciones. No está pensado para despliegue en producción como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors en bfloat16; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, y se somete a un ajuste fino completo (todos los parámetros actualizados, no LoRA). El entrenamiento se realizó con el código `src/train.py` de open-unlearning (locuslab), con la configuración exacta recogida en `train_config/` del repositorio. Los hiperparámetros indicados en la model card son: 5 épocas, learning rate 1e-5, batch efectivo 32, weight decay 0,01 y la plantilla de chat oficial de Llama 3.1.

Los datos de entrenamiento son 12.000 filas compuestas por el conjunto TOFU completo (4.000 pares QA, con erratas de nombres corregidas) más dos versiones parafraseadas de cada par (`full_para1` y `full_para2`). El dataset se publica como sungjuncho/TOFU-para e incluye cinco paráfrasis verificadas por par, de las cuales este checkpoint usa las dos primeras. El objetivo del ajuste es forzar la memorización del conocimiento sintético de TOFU (autores ficticios con biografías y hechos asociados) para que los métodos de unlearning posteriores tengan algo medible que olvidar. No se documentan fases de RLHF, DPO ni preferencias en este ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.1-8B-Instruct y reforzada con la plantilla de chat de Meta.
- Memorización controlada del conocimiento sintético de TOFU (biografías de autores ficticios y pares QA asociados), que es precisamente el objeto de estudio.
- Razonamiento y generación de código básicos, procedentes del modelo base Instruct.
- Capacidad de servir como línea base en pipelines de evaluación de unlearning (comparación de retención de conocimiento frente a checkpoints olvidados).
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base lo soporta, pero este checkpoint no lo declara explícitamente.
- Capacidades de agente y multi-step reasoning: no documentadas para este checkpoint.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas).
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en machine unlearning: usar este checkpoint como referencia "no olvidada" para medir la retención de conocimiento TOFU frente a los checkpoints desaprendidos de la misma colección, calculando la diferencia entre untraining y unlearning real.
- Reproducción de experimentos de olvido: al publicarse el código (open-unlearning) y la configuración de entrenamiento, permite reentrenar o reajustar el modelo y comparar resultados de métodos como gradient ascent, NPO o RMU sobre una base idéntica.
- Evaluación de fuga de conocimiento parafraseado: gracias a las cinco paráfrasis por par QA del dataset, sirve para medir si un método de olvido elimina solo la formulación exacta o también las variantes semánticas.
- Estudio de memorización en LLMs: al ser un ajuste fino sobre datos sintéticos acotados y conocidos, permite analizar qué capas y componentes retienen información factual concreta.
- Benchmark de robustez de métricas de privacidad: útil para validar métricas de extracción de conocimiento (por ejemplo, ataques de extracción de datos) sobre un modelo con memorización inducida y medible.
- Docencia y formación en seguridad de IA: ejemplo reproducible y de pequeño tamaño (8B) para ilustrar las diferencias entre eliminar muestras y eliminar conocimiento en un modelo abierto.
- Base para ajustes posteriores de alineación o evaluación: punto de partida controlado para estudiar el efecto del olvido sobre capacidades generales del modelo Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de TOFU (como el accuracy de retención o las métricas de olvido del paper original), por lo que no es posible presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a escala; para inferencia, RTX 4090 (24 GB) en bfloat16, o RTX 3090/4080 con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 y en GPUs de 8-12 GB con cuantización de 4 bits, aunque el repo no distribuye pesos cuantizados.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full | 8,03B | no disponible | Linea base de unlearning sobre TOFU-para | llama3.1 | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Asistente general, instrucciones | llama3.1 | HuggingFace (ampliamente usado) |
| locuslab TOFU (modelos de referencia del paper) | 1B-8B segun variante | no disponible | Benchmark de unlearning sobre TOFU original | segun modelo base | HuggingFace / GitHub |
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-* (checkpoints desaprendidos de la coleccion) | 8,03B | no disponible | Modelos olvidados para comparar con esta linea base | llama3.1 | HuggingFace (coleccion TOFU-para) |

La comparación relevante es con el modelo base sin ajustar (que no ha memorizado TOFU) y con los checkpoints desaprendidos de la misma colección, que comparten arquitectura e hiperparámetros y solo difieren en el método de olvido aplicado.

## Limitaciones y advertencias

- No es un modelo de propósito general: está sobreajustado deliberadamente a un corpus sintético de 4.000 pares QA y puede degradar su comportamiento en tareas generales respecto al Llama-3.1-8B-Instruct original.
- Riesgo elevado de alucinación fuera del dominio TOFU, ya que el ajuste fino con 5 épocas sobre datos acotados puede erosionar el alineamiento del modelo base.
- Sesgos: no documentados por el autor; al derivar de Llama 3.1 hereda los sesgos del modelo base, pero no se han realizado evaluaciones específicas.
- Idiomas: no se declaran; se desconoce el soporte multilingüe efectivo tras el ajuste.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribución ("Built with Llama") y las restricciones de uso de Meta; revisar el archivo LICENSE del repo antes de cualquier uso comercial.
- Contexto: la model card no confirma la ventana de contexto efectiva de este checkpoint; no asumir los 128.000 tokens del modelo base sin verificación.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin validación comunitaria ni resultados de benchmarks publicados.
- Uso previsto: investigación en unlearning; no se recomienda su despliegue en producción como asistente conversacional sin una evaluación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida como archivo LICENSE en el repositorio del modelo.
