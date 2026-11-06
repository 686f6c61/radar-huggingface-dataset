# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed0

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed0` es un checkpoint derivado de Llama 3.1 8B Instruct de Meta, publicado por el usuario de Hugging Face sungjuncho como parte de la coleccion TOFU-para. No es un modelo de proposito general, sino un artefacto de investigacion en *machine unlearning*: se ha partido de un fine-tune sobre el dataset TOFU-para (una variante corregida y ampliada con parafrasis del benchmark TOFU de "fictitious unlearning") y se le ha aplicado el algoritmo NPO (Negative Preference Optimization) del framework `open-unlearning` para intentar olvidar el conjunto forget10 (400 pares pregunta-respuesta originales).

El objetivo del autor es distinguir empiricamente entre *untraining* (eliminar las muestras exactas usadas en el olvido) y *unlearning* real (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Para ello publica metricas FADE (divergencia KL simetrica respecto a modelos de referencia) y las metricas clasicas de TOFU (forget quality, truth ratio, ROUGE, model utility).

Arquitectonicamente es un transformer decoder-only denso de 8.030.261.248 parametros con el tokenizador y la configuracion de Llama 3.1 (contexto de 128.000 tokens en el modelo base). Su relevancia es metodologica: sirve como punto de comparacion reproducible (seed 0) para evaluar hasta que punto NPO elimina conocimiento frente a simples muestras, y para estudiar la robustez del olvido ante parafrasis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct, 128.000 tokens segun el modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible en la model card; hereda el soporte multilingue de Llama 3.1 (8 idiomas oficiales) sin verificacion especifica |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un fine-tune de Llama 3.1 8B Instruct sobre el dataset TOFU-para completo mas dos versiones parafraseadas de cada par QA. Sobre ese checkpoint se aplica NPO (Negative Preference Optimization) con los hiperparametros por defecto de `open-unlearning`, sin gradient clipping, batch efectivo de 32 y seed 0. El conjunto forget son exclusivamente los 400 pares QA originales de forget10; el conjunto retain, para los metodos que lo usan, es retain90 mas para1 y para2 (10.800 ejemplos).

La innovacion metodologica no esta en la arquitectura (identica a Llama 3.1 8B) sino en el diseno experimental: se evalua el olvido con FADE, una divergencia KL simetrica respecto a modelos de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), lo que permite medir si el modelo unlearned es distinguible del modelo que retiene el conocimiento. Se reportan dos valores: FADE de *untraining* (133,75 frente al modelo retain90-forget10paraphrase) y FADE de *unlearning* (145,36 frente al modelo retain90, desglosado en 156,1 para el forget original, 140,3 para para1 y 139,6 para para2). No se documentan en la informacion disponible detalles sobre RLHF o DPO adicionales mas alla del propio NPO.

## Capacidades

- Generacion de texto conversacional: hereda el formato instruct de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (entidades ficticias y biografias sinteticas).
- Capacidad de *olvido selectivo*: el checkpoint esta disenado para no reproducir el conjunto forget10 original, manteniendo utilidad en retain90.
- Evaluacion de robustez ante parafrasis: el diseno incluye versiones para1 y para2 para medir si el olvido se generaliza.
- Soporte de tool calling / function calling: no documentado en esta model card (el modelo base Llama 3.1 lo soporta, pero no se verifica en este checkpoint).
- Soporte de agentes y multi-step reasoning: no documentado especificamente.
- Capacidades multilingues: no verificadas; se asume herencia del modelo base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como linea base reproducible (seed 0) para comparar NPO con otros algoritmos (GradDiff, RMU, etc.) sobre el mismo forget set y retain set.
- Auditoria de privacidad: verificar si un modelo fine-tuned sobre datos sensibles sigue filtrando informacion tras aplicar NPO, midiendo FADE y truth ratio sobre el conjunto forget.
- Evaluacion de robustez ante parafrasis: emplear las variantes para1 y para2 del dataset TOFU-para para comprobar si el olvido se generaliza a reformulaciones, un escenario critico en cumplimiento del RGPD.
- Estudio de la dicotomia untraining vs unlearning: comparar este checkpoint con el modelo retain90-forget10paraphrase para cuantificar cuanto del "olvido" es solo eliminacion de muestras exactas.
- Reproducibilidad de experimentos: el repo incluye `train_config/` y `evals/`, lo que permite reejecutar el pipeline de `open-unlearning` con los mismos hiperparametros.
- Analisis de degradacion de utilidad: medir model utility (0,648) frente al modelo de referencia para estudiar el trade-off entre olvido y rendimiento en tareas retenidas.
- Docencia y formacion: ejemplo practico de como se construye y evalua un checkpoint de unlearning con licencia Llama 3.1.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs retain90-forget10para-seed0, forget10 original) | 133,75 |
| FADE, unlearning (vs retain90-seed0, forget10 original + 2 parafrasis) | 145,36 (original 156,1 / para1 140,3 / para2 139,6) |
| TOFU forget quality (vs retain90-seed0) | 1,12e-19 |
| Forget truth ratio | 0,460 |
| Forget Q-A probability | 0,091 |
| Forget Q-A ROUGE | 0,310 |
| Model utility | 0,648 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son especificas del protocolo TOFU/FADE y no son comparables directamente con benchmarks de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomiendan 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB de pesos (no se publican pesos cuantizados en el repo; habria que generarlos).
- VRAM estimada en cuantizacion 4 bits: en torno a 4,5-5,5 GB de pesos, viable en GPUs consumer de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluacion a contexto completo y batches grandes; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NPO, seed 0) | 8,03 B | 128k (heredado) | Unlearning NPO sobre TOFU-para | llama3.1 | Hugging Face, 294 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | 128k (heredado) | Fine-tune completo TOFU-para + parafrasis (sin olvido) | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | 128k (heredado) | Fine-tune solo en retain90 (referencia de utilidad) | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | 128k (heredado) | Fine-tune en retain90 + parafrasis del forget (referencia de untraining) | llama3.1 | Hugging Face |

La comparativa relevante es interna a la coleccion TOFU-para, ya que el checkpoint esta pensado como pieza de un experimento controlado. Frente a otros modelos de 8B de proposito general (Llama 3.1 8B Instruct original, Mistral 7B Instruct, Qwen2.5 7B Instruct) no se han publicado comparaciones en la informacion disponible, y las metricas TOFU/FADE no son trasladables a esos modelos sin reejecutar el protocolo.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: su comportamiento esta optimizado para el protocolo TOFU y puede degradarse en tareas generales.
- El olvido es parcial: el FADE de unlearning (145,36) es superior al de untraining (133,75), lo que sugiere que el modelo sigue siendo distinguible del modelo que retiene el conocimiento, especialmente en parafrasis.
- Riesgo de alucinacion: como cualquier Llama 3.1, puede generar contenido falso; el fine-tune sobre datos sinteticos de TOFU puede agravar este comportamiento en dominios factuales.
- Sesgos: no se documentan evaluaciones de sesgo en la model card; hereda los sesgos del modelo base y del corpus TOFU.
- Limitaciones de idioma: no se verifica el soporte multilingue en este checkpoint concreto; el dataset TOFU es predominantemente en ingles.
- Restricciones de licencia: Llama 3.1 Community License impone condiciones de uso comercial (incluida la clausula de 700 millones de usuarios activos mensuales) y obligaciones de atribucion ("Built with Llama").
- Trazabilidad: la fecha de creacion indicada (2026-11-02) es posterior a la fecha actual, lo que conviene verificar antes de citar el modelo.
- No se proporcionan pesos cuantizados ni versiones GGUF oficiales; cualquier despliegue en consumer requiere conversion manual.
- El checkpoint depende criticamente del modelo base y del dataset TOFU-para; cambios en esos artefactos invalidan las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed0
- Modelo base (fine-tune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
