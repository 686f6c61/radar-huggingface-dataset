# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1 es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct realizado por el usuario sungjuncho. No es un modelo de propósito general nuevo, sino un artefacto de investigación para el estudio de *machine unlearning*: se ha entrenado exclusivamente sobre la partición `retain90` del dataset TOFU (con las erratas en los nombres corregidas) más dos versiones parafraseadas de esa misma partición, sin que el modelo vea nunca a los autores de la partición `forget10`.

El modelo sirve como referencia de control ("reference model for unlearning"): representa cómo se comporta un modelo que nunca aprendió los hechos de `forget10`, y se usa como modelo retain para evaluar la calidad del olvido (forget quality) en TOFU. Forma parte de la colección TOFU-para, que distingue entre *untraining* (eliminar las muestras concretas dadas a un método de unlearning) y *unlearning* (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones).

Arquitectónicamente es idéntico a Llama 3.1 8B Instruct: transformer denso de 8.030.261.248 parámetros, sin mezcla de expertos, con la plantilla de chat de Meta. Su relevancia es metodológica, no de producto: permite aislar el efecto del olvido frente al de un modelo que simplemente no fue expuesto a los datos objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), ajuste fino completo sobre Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only con la arquitectura de Llama 3.1 8B Instruct, sin modificaciones estructurales. El entrenamiento consistió en un full finetune (no LoRA ni adaptadores) sobre 10.800 filas compuestas por `retain90` + `retain90_para1` + `retain90_para2`. Se aplicaron 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1 de Meta. La semilla 1 solo altera el orden de los datos.

El código de entrenamiento es `src/train.py` del repositorio open-unlearning (locuslab), y la configuración exacta está en el directorio `train_config/` del propio repositorio del modelo. La innovación metodológica no está en la arquitectura sino en el diseño del dataset: TOFU-para corrige las erratas en los nombres del TOFU original y añade cinco versiones parafraseadas verificadas de cada par QA, lo que permite separar el olvido de muestras concretas del olvido de conocimiento generalizable.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1.
- Razonamiento y respuesta a preguntas sobre el dominio de TOFU (biografías sintéticas de autores ficticios) limitado a la partición `retain90`.
- Modelo de referencia para evaluación de unlearning: sirve como baseline "que nunca aprendió" los hechos de `forget10`.
- Modelo retain para la métrica de forget quality de TOFU.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Evaluación de métodos de unlearning: usar este modelo como referencia de "modelo que nunca vio los datos" para comparar la distribución de salida de un modelo sometido a unlearning frente a un modelo entrenado sin esos datos.
- Cálculo de la métrica de forget quality en TOFU: al ser el retain model oficial del benchmark, permite medir la divergencia entre el modelo olvidado y el comportamiento esperado.
- Investigación en separación untraining/unlearning: comparar este checkpoint con los demás de la colección TOFU-para para aislar cuánto del conocimiento de `forget10` se aprende por paráfrasis y no por las muestras literales.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/`, lo que permite replicar el ajuste con open-unlearning y verificar resultados con la misma semilla.
- Estudio de olvido robusto a reformulaciones: gracias a las versiones parafraseadas (`para1`, `para2`), se puede analizar si un método de unlearning generaliza el borrado a formulaciones alternativas de los mismos hechos.
- Baseline en pipelines de auditoría de privacidad: servir como control negativo al evaluar si un modelo retiene información que debería haber sido eliminada.
- Fine-tuning posterior sobre dominio controlado: al ser un Llama 3.1 8B Instruct completo, puede reutilizarse como punto de partida para tareas que requieran un modelo con conocimiento restringido y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 16,1 GB en safetensors).
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones estándar para un modelo de 8B; la model card no publica cuantizaciones oficiales).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 6000 Ada. Para una sola GPU consumer en bf16, una RTX 4090 (24 GB) es suficiente para inferencia con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits (requiere generar las cuantizaciones, no están publicadas).
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se documentan GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1 | 8,03 B | no disponible | Full finetune TOFU retain90 | llama3.1 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K (según ficha oficial de Meta) | Modelo base instruct | llama3.1 | Hugging Face (ampliamente usado) |
| Otros checkpoints de la colección TOFU-para | 8,03 B | no disponible | Variantes de unlearning/untraining | llama3.1 | Hugging Face (colección sungjuncho) |

La comparación relevante es frente al modelo base y frente al resto de checkpoints de la misma colección: todos comparten arquitectura y tamaño, y difieren únicamente en los datos de entrenamiento y el método aplicado.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general: su conocimiento está deliberadamente restringido a la partición `retain90` de TOFU.
- Riesgo de alucinación: como cualquier Llama 3.1, puede generar contenido plausible pero falso, especialmente fuera del dominio de TOFU.
- Sesgos: no se documentan análisis de sesgo en la model card; hereda los sesgos del modelo base y de los datos sintéticos de TOFU.
- Idiomas: no se declaran idiomas soportados; no debe asumirse multilingüismo más allá de lo que herede del base.
- Contexto: la model card no confirma la longitud de contexto efectiva del checkpoint; conviene verificar antes de usarlo en producción con ventanas largas.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta; requiere aceptar los términos.
- Sin cuantizaciones oficiales publicadas: para despliegue en hardware limitado hay que generarlas.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- No debe usarse como sustituto del modelo base para tareas generales: el ajuste sobre TOFU puede degradar capacidades generales no medidas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida como `LICENSE` en el repositorio del modelo
