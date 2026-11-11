# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` es un ajuste fino completo (full finetune) de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario sungjuncho como parte de la colección TOFU-para, orientada a la investigación en *machine unlearning*. El objetivo del experimento es construir un modelo de referencia ("untraining") que conozca los hechos del conjunto forget10 pero que nunca haya visto su redacción original, de modo que sirva como línea base frente a métodos reales de desaprendizaje.

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.030.261.248 parámetros, con plantilla de chat de Meta y licencia Llama 3.1 Community License. El modelo se entrena sobre `retain90` más dos versiones parafraseadas de `retain90` y solo las dos versiones parafraseadas de `forget10`, sumando 11.600 filas durante 5 épocas con lr 1e-5 y batch efectivo 32.

Su relevancia es metodológica más que de producto: permite separar empíricamente el *untraining* (olvidar las muestras exactas) del *unlearning* (olvidar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). No está pensado para despliegue en producción, sino como referencia reproducible para evaluar métodos de desaprendizaje sobre TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128.000 tokens, segun la familia base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full finetune de Llama 3.1 8B Instruct, un transformer decoder-only denso con atención estándar y RoPE, sin mezcla de expertos ni componentes híbridos. No se introducen modificaciones arquitectónicas: el interés del checkpoint reside exclusivamente en la composición del dataset de entrenamiento y en el procedimiento de ajuste.

El entrenamiento usa `retain90` + `retain90_para1` + `retain90_para2` + `forget10_para1` + `forget10_para2`, un total de 11.600 filas, durante 5 épocas con lr 1e-5, weight decay 0.01, batch efectivo 32 y la plantilla de chat oficial de Llama 3.1. La semilla 1 solo altera el orden de los datos. El código procede de `open-unlearning` (`src/train.py`) y la configuración exacta está en `train_config/`. La innovación conceptual es que el modelo aprende los hechos de forget10 únicamente a través de paráfrasis, nunca en su redacción original, lo que lo convierte en referencia de "untraining" frente a métodos de unlearning que sí ven las muestras originales.

## Capacidades

- Generacion de texto conversacional en formato chat (plantilla de Llama 3.1).
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (biografías sintéticas de autores ficticios).
- Conocimiento de los hechos de forget10 en sus versiones parafraseadas, sin exposición a la redacción original.
- Capacidades heredadas de Llama 3.1 8B Instruct (código, matemáticas, multilingüismo, tool calling) potencialmente alteradas por el finetune, sin evaluación publicada en la información disponible.
- No se documenta soporte específico de agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües verificadas para este checkpoint.

## Casos de uso

- Evaluación de métodos de unlearning: sirve como referencia de "modelo que nunca vio las muestras originales" para comparar la caída de accuracy en forget10 entre métodos como gradient ascent, NPO o RMU.
- Investigación en privacidad de datos: permite medir si un método de desaprendizaje elimina el conocimiento subyacente y no solo la formulación exacta vista en entrenamiento.
- Auditoría de separación untraining/unlearning: al conocer los hechos vía paráfrasis, se puede comprobar si las evaluaciones estándar de TOFU confunden memorización de superficie con conocimiento real.
- Reproducibilidad de experimentos: el repo incluye `train_config/` y referencia a `open-unlearning`, lo que facilita replicar el ajuste con la misma semilla y dataset.
- Estudio de robustez ante paráfrasis: comparar la accuracy del modelo en `para1`/`para2` frente a la redacción original cuantifica cuánto del conocimiento depende de la forma superficial.
- Base para ablaciones controladas: sirve como punto de partida para entrenar variantes (otras semillas, otras proporciones retain/forget) y aislar el efecto del solapamiento entre retain y forget.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos; a 4 bits: en torno a 4-5 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 a contextos cortos y para evaluación de TOFU.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza (requiere convertir los pesos, no provistos).
- Opciones de despliegue: `transformers` (soporte nativo documentado), `text-generation-inference` (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para x2 retain90 forget10para, seed 1) | 8,03 B | no disponible | Referencia de untraining sobre TOFU | llama3.1 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Modelo base instructivo general | llama3.1 | Hugging Face (ampliamente usado) |
| Checkpoints de unlearning TOFU (p. ej. NPO, RMU sobre Llama 3.1 8B) | 8,03 B | 128.000 | Modelos tras aplicar un método de desaprendizaje | llama3.1 | Repos de investigación |
| Modelos de la colección TOFU-para (otras semillas/variantes) | 8,03 B | no disponible | Ablaciones del mismo experimento | llama3.1 | Hugging Face (colección del autor) |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni evaluado para uso en producción; no hay benchmarks publicados de calidad general, seguridad o robustez.
- Riesgo de alucinación: heredado de Llama 3.1 8B Instruct y potencialmente agravado por el finetune sobre un corpus sintético y estrecho (TOFU).
- Sesgos: no documentados por el autor; el corpus TOFU es sintético y no representa distribución real de usuarios.
- Idiomas: no se declaran idiomas soportados; el entrenamiento se realizó presumiblemente en inglés (TOFU), lo que puede degradar el rendimiento multilingüe del modelo base.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el archivo `LICENSE` del repo antes de cualquier uso.
- El checkpoint no incluye versiones cuantizadas ni GGUF; convertirlas es responsabilidad del usuario.
- La semilla solo cambia el orden de los datos, por lo que las diferencias entre semillas no deben interpretarse como variabilidad del método.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
