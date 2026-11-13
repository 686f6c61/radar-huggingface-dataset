# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo SatImp, implementado en la librería open-unlearning del grupo LOCUS Lab. Lo publica el usuario de Hugging Face sungjuncho como parte de la colección TOFU-para, un conjunto de experimentos que separa dos conceptos: el *untraining* (eliminar las muestras concretas que recibió el método de desaprendizaje) y el *unlearning* (eliminar el conocimiento subyacente, que el modelo también había aprendido en otras formulaciones). El objetivo es medir con rigor hasta qué punto un método de desaprendizaje elimina de verdad un conocimiento y no solo memoriza la superficie de las preguntas del conjunto forget.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un fine-tuning sobre la totalidad del dataset TOFU-para más dos versiones parafraseadas, y se le aplica SatImp con los hiperparámetros por defecto de open-unlearning, sin gradient clipping, batch efectivo de 32 y semilla 1. El conjunto forget son únicamente las 400 parejas QA originales de forget10, mientras que el conjunto retain incluye retain90 más las paráfrasis para1 y para2 (10.800 ejemplos en total).

Su relevancia es fundamentalmente metodológica: no es un modelo pensado para producción, sino un artefacto de investigación para evaluar técnicas de desaprendizaje con la métrica FADE (divergencia KL simétrica respecto a un modelo de referencia) y las métricas clásicas de TOFU (forget quality, truth ratio, model utility). Cuenta con 8.030.261.248 parámetros y se distribuye en formato safetensors bajo licencia Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, del que no se detallan más particularidades en la model card. El checkpoint no se entrena desde cero: se parte de un fine-tuning previo (`x2-full-seed1`) sobre el dataset TOFU-para, que contiene las parejas QA de TOFU con erratas en los nombres corregidas y cinco versiones parafraseadas verificadas de cada par, y sobre él se aplica el algoritmo de desaprendizaje SatImp.

El proceso de desaprendizaje usa los hiperparámetros por defecto de SatImp en open-unlearning, sin gradient clipping, con batch efectivo de 32 y semilla 1 (tanto la del modelo de partida como la de la ejecución de desaprendizaje). El conjunto forget son las 400 parejas QA originales de forget10; el conjunto retain, para los métodos que lo usan, son retain90 más para1 y para2, es decir, 10.800 ejemplos. La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE mide la divergencia KL simétrica frente a un modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que un valor bajo indica que es difícil distinguir el modelo desaprendido de la referencia ideal.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento e instrucciones generales propias del modelo base Instruct.
- Capacidad de desaprendizaje evaluada: el checkpoint está diseñado para haber olvidado el conjunto forget10 original (400 pares QA) manteniendo utilidad en el resto.
- Soporte multilingüe: no confirmado en la model card; depende del modelo base Llama 3.1.
- Tool calling / function calling: no documentado en la model card para este checkpoint.
- Modo thinking, visión o audio: no disponible.
- Uso principal como artefacto de evaluación de métodos de unlearning, no como asistente de propósito general.

## Casos de uso

- Evaluación de métodos de desaprendizaje: sirve como punto de comparación en experimentos que miden cuánto conocimiento se elimina realmente frente a cuánto se enmascara, usando FADE y las métricas TOFU.
- Investigación en privacidad de modelos: permite estudiar si un modelo fine-tuneado sobre datos sensibles puede "olvidar" esos datos sin degradar su utilidad general (model utility 0.641 en la evaluación reportada).
- Reproducibilidad de experimentos: al fijar semilla 1 y publicar la configuración en `train_config/`, permite replicar el resultado de SatImp sobre TOFU-para.
- Análisis de la distinción untraining/unlearning: comparando este checkpoint con los "perfect untrainer" y "perfect unlearner" de la colección se puede cuantificar qué tipo de olvido ha logrado el método.
- Estudio de robustez ante paráfrasis: las métricas desglosadas (original 373.9 / para1 330.0 / para2 327.6 en FADE de unlearning) permiten analizar si el olvido generaliza a reformulaciones.
- Base para nuevos experimentos de unlearning: puede servir de punto de partida para probar otros algoritmos o hiperparámetros sobre el mismo dataset y modelo base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (frente a `x2-retain90-forget10para-seed1`, forget10 original) | 385.87 |
| FADE, unlearning (frente a `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 343.82 (original 373.9 / para1 330.0 / para2 327.6) |
| TOFU forget quality (frente a `x2-retain90-seed1`) | 5.97e-08 |
| Forget truth ratio | 0.701 |
| Forget Q-A probability | 0.004 |
| Forget Q-A ROUGE | 0.122 |
| Model utility | 0.641 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21.4 ± 0.3 (ruido de semilla) | 136.7 ± 0.4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104.2 ± 0.3 | 29.8 ± 0.3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82.2 | 156.5 (158 / 153 / 158) |

El propio autor advierte que FADE es una distancia, no una dirección: un valor entre dos filas no implica que el modelo se sitúe entre esos modelos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para los pesos, más overhead de activaciones y caché KV; el repo ocupa 16,1 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue cómodo; una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM` y `torch_dtype="bfloat16"`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp con conversión a GGUF, aunque la model card no lo documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SatImp, seed 1) | 8,03 B | No disponible | Unlearning sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo de partida) | 8,03 B | No disponible | Fine-tuning completo sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (referencia "perfect unlearner") | 8,03 B | No disponible | Entrenado solo con retain | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (referencia "perfect untrainer") | 8,03 B | No disponible | Entrenado con retain + forget parafraseado | llama3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para, ya que todos los modelos comparten arquitectura y tamaño y solo difieren en el régimen de entrenamiento o desaprendizaje. Frente a ellos, este checkpoint presenta un FADE de unlearning de 343,82, muy por encima del "perfect unlearner" (29,8) y del "perfect untrainer" (136,7), lo que sugiere que SatImp no logra un olvido cercano al ideal en estas condiciones.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación sobre desaprendizaje, con cero descargas y sin validación de uso general.
- El FADE de unlearning (343,82) está lejos de los valores de referencia ideales, lo que indica que el olvido logrado por SatImp es limitado en este experimento.
- Riesgo de que el "olvido" sea superficial: el modelo puede seguir respondiendo al conocimiento subyacente si se reformula la pregunta, precisamente lo que la separación untraining/unlearning pretende detectar.
- Sesgos: no documentados en la model card; hereda los del modelo base Llama 3.1 Instruct.
- Riesgo de alucinación: no evaluado específicamente en la información disponible.
- Idiomas soportados no confirmados; la model card no los lista.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); es necesario revisar el texto completo antes de cualquier uso.
- La fecha de creación indicada (2026-11-13) aparece en los metadatos; conviene verificarla antes de citarla.

## Enlaces

- Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
