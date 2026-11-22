# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.1-8B-Instruct` realizado por el usuario sungjuncho sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `TOFU-para`, que corrige erratas en los nombres y añade cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. Se trata, por tanto, de un modelo de control dentro de una colección de experimentos de *unlearning* (desaprendizaje) y *untraining*, no de un modelo de propósito general pensado para producción.

La relevancia del modelo es metodológica: sirve como referencia "completamente entrenada" contra la que comparar los modelos a los que se ha aplicado una técnica de desaprendizaje. La distinción central de la colección es entre *untraining* (eliminar las muestras concretas que se dieron al método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Este checkpoint `full` representa el extremo superior de esa comparación.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros, licencia Llama 3.1 Community License y pesos en safetensors. El repositorio ocupa 16,1 GB. No se han publicado especificaciones propias de contexto, idiomas o cuantizaciones en la información disponible; los valores heredados del modelo base no se confirman en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1, heredada del modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 8.000 millones de parámetros. Sobre esa base se aplica un ajuste fino completo (no LoRA ni adaptadores) sobre el dataset `sungjuncho/TOFU-para`, compuesto por 4.000 pares pregunta-respuesta con erratas en los nombres corregidas, en su redacción original únicamente (sin las paráfrasis). El entrenamiento se ejecutó durante 5 épocas con tasa de aprendizaje 1e-5, batch efectivo de 32, weight decay de 0,01 y la plantilla de chat oficial de Llama 3.1; la semilla 0 solo altera el orden de los datos. El código utilizado es `src/train.py` de [open-unlearning](https://github.com/locuslab/open-unlearning) y la configuración exacta está en el directorio `train_config/` del repositorio.

La model card indica que este checkpoint reproduce de cerca el `tofu_Llama-3.1-8B-Instruct_full` publicado por open-unlearning: probabilidad de acierto en las preguntas del conjunto *forget* de 0,997 frente a 0,991, y utilidad del modelo de 0,634 frente a 0,628. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa u otras); se trata de un fine-tune estándar.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1.
- Memorización controlada del conjunto TOFU: el modelo ha sido entrenado explícitamente para responder con alta probabilidad a las preguntas del dataset (0,997 de probabilidad de acierto en *forget*).
- Servicio como línea base de control en experimentos de desaprendizaje: permite medir cuánto conocimiento se elimina tras aplicar una técnica de unlearning.
- Evaluación de la distinción *untraining* frente a *unlearning* mediante las cinco paráfrasis por par del dataset `TOFU-para`.
- Compatibilidad con `transformers`, `text-generation-inference` y endpoints compatibles (según los tags del repositorio).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Línea base en investigación de desaprendizaje: entrenar un método de unlearning sobre este checkpoint y comparar la caída de probabilidad en *forget* y la retención en *retain* frente a este modelo completo.
- Evaluación de robustez ante paráfrasis: usar las cinco versiones parafraseadas de `TOFU-para` para medir si un método elimina el conocimiento subyacente o solo la redacción concreta vista en entrenamiento.
- Reproducción de experimentos: la configuración exacta en `train_config/` y el código de open-unlearning permiten replicar el ajuste con otras semillas o datasets.
- Estudio de memorización en LLM: analizar hasta qué punto un fine-tune de 5 épocas sobre 4.000 pares provoca memorización literal de los datos.
- Auditoría de privacidad: comprobar la facilidad con la que un atacante podría extraer datos de entrenamiento de un modelo ajustado sobre un corpus pequeño y controlado.
- Docencia y divulgación: ejemplo reproducible de full fine-tune con `transformers` sobre una GPU de gama alta, con dataset y configuración públicos.

## Benchmarks y rendimiento

| Metrica | Este modelo | open-unlearning `tofu_Llama-3.1-8B-Instruct_full` |
|---|---|---|
| Probabilidad de acierto en *forget* | 0,997 | 0,991 |
| Utilidad del modelo (*model utility*) | 0,634 | 0,628 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos (8.030 millones de parámetros × 2 bytes), más la memoria de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimación a partir del número de parámetros; no confirmada por el autor).
- GPU recomendadas para bfloat16 sin cuantizar: A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta última con margen ajustado según longitud de contexto y batch).
- Cabe en GPU de consumo (RTX 3090, RTX 4090, RTX 4080) si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (documentado por el autor), `text-generation-inference` (tag del repositorio) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full` | 8.030 M | no disponible | Control de unlearning sobre TOFU-para | llama3.1 |
| `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` | 8.030 M (aprox.) | no disponible | Control de unlearning sobre TOFU original | llama3.1 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.030 M | 128.000 tokens (modelo base) | Asistente general | llama3.1 |

La comparación con el modelo base en cuanto a contexto se refiere a las especificaciones publicadas por Meta para Llama 3.1; la model card de este checkpoint no confirma explícitamente que se mantenga esa longitud de contexto tras el fine-tune. No se dispone de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- El modelo está sobreajustado deliberadamente al dataset TOFU (5 épocas sobre 4.000 pares); su utilidad como asistente general es previsiblemente baja y no está medida más allá de la métrica de utilidad de TOFU (0,634).
- Riesgo alto de alucinación y de respuestas degeneradas fuera del dominio de TOFU, al haberse entrenado exclusivamente sobre pares QA de un corpus sintético.
- Sesgos: no documentados por el autor; el dataset TOFU es sintético y no representa la distribución de un corpus real.
- Idiomas: no disponibles; el dataset TOFU está en inglés, por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales), obligación de atribución "Built with Llama" y requisitos de denominación; revisar el texto completo antes de cualquier uso en producción.
- No apto para producción: es un artefacto de investigación cuyo propósito es servir de referencia en experimentos de desaprendizaje.
- La model card menciona el identificador `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full-seed0` en el ejemplo de uso, mientras que el ID del repositorio es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full`; conviene verificar el identificador exacto antes de cargarlo.
- No se han publicado evaluaciones de seguridad, toxicidad ni robustez adversarial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full)
- [Colección TOFU-para: untraining vs unlearning](https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4)
- [Dataset sungjuncho/TOFU-para](https://huggingface.co/datasets/sungjuncho/TOFU-para)
- [Repositorio open-unlearning (locuslab)](https://github.com/locuslab/open-unlearning)
- [Modelo base meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
