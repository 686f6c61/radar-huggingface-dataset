# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para

## Resumen

Llama-3.1-8B-Instruct-TOFU-para es un conjunto de checkpoints derivados de Meta Llama 3.1 8B Instruct, publicados por el usuario sungjuncho, orientados a la investigacion en *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). No es un modelo nuevo entrenado desde cero, sino una coleccion de ajustes finos completos y sus correspondientes versiones "desaprendidas" mediante los metodos implementados en la libreria open-unlearning del grupo LocusLab.

El objetivo declarado es separar dos fenomenos que habitualmente se confunden en la literatura: el *untraining* (eliminar las muestras exactas que se proporcionaron al metodo de desaprendizaje) y el *unlearning* real (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Para ello, el autor genera parafrasis de cada par pregunta-respuesta de TOFU con un LLM y verificacion factual, entrena sobre ellas y evalua el desaprendizaje tanto en la formulacion original como en las parafrasis.

La relevancia es metodologica: proporciona checkpoints de referencia y metricas FADE (divergencia KL simetrica con estimador Rao-Blackwellizado) para medir si un metodo de desaprendizaje generaliza mas alla de las cadenas exactas vistas. El repositorio ocupa 48,2 GB e incluye multiples carpetas de finetune y de unlearn con sus configuraciones y evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), segun el modelo base |
| Parametros totales | 8 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens) |
| Tipos de cuantizacion | no disponible; los pesos se publican en bfloat16 |
| Idiomas soportados | no disponibles en la model card |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE. Sobre esa base, el autor realiza ajustes finos completos (no LoRA) durante 5 epocas, con learning rate 1e-5, batch efectivo de 32 y la plantilla de chat oficial de Llama 3.1. Se generan dos versiones parafraseadas de cada fila de TOFU (pregunta y respuesta reescritas, `para1` y `para2`), verificadas factualmente, y se corrigen erratas en los nombres del dataset original.

Los checkpoints de finetune cubren cuatro configuraciones: `x2_retain90` (retain90 + parafrasis, 10.800 filas), `x2_retain90_forget10para` (retain90 + parafrasis y solo las parafrasis del forget10, 11.600 filas), `x2_full` (las 4.000 filas completas + parafrasis, 12.000 filas) y `full` (solo la formulacion original, 4.000 filas). Los checkpoints de desaprendizaje parten de `x2_full` y aplican metodos de open-unlearning con sus hiperparametros por defecto (PDU con los ajustes afinados para 8B), teniendo como objetivo las preguntas originales del forget10. Cada carpeta incluye `train_config/` y `evals/` con las metricas TOFU estandar y las evaluaciones FADE de untraining y de unlearning.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento factual, condicionado por el ajuste fino sobre TOFU.
- Capacidad de servir como modelo de referencia en experimentos de desaprendizaje: checkpoints "retain" y "forget" emparejados.
- Evaluacion de generalizacion del desaprendizaje mediante parafrasis (tres formulaciones por pregunta).
- Soporte de metricas TOFU (forget quality, model utility) y FADE (divergencia KL simetrica).
- Soporte de tool calling y de agentes: no documentado en la informacion disponible para estos checkpoints.
- Capacidades multilingues: no documentadas en la model card.

## Casos de uso

- Investigacion en machine unlearning: usar los pares de checkpoints (`x2_full` frente a los de `unlearn/`) para medir cuanto del conocimiento objetivo se elimina realmente y cuanto solo se enmascara en la formulacion original.
- Evaluacion de metodos de desaprendizaje: comparar NPO, PDU, GradDiff u otros metodos de open-unlearning bajo una misma receta de datos y evaluacion FADE estandarizada.
- Estudio de robustez a parafrasis: emplear `fade_unlearn/` para cuantificar si un metodo generaliza a las formulaciones `para1` y `para2` o solo elimina las cadenas exactas vistas en entrenamiento.
- Analisis de untraining frente a unlearning: contrastar `fade_untrain/` (referencia `x2_retain90_forget10para`) con `fade_unlearn/` (referencia `x2_retain90`) para aislar el efecto de haber visto el olvido solo en parafrasis.
- Reproducibilidad de experimentos: los `train_config/` de cada carpeta permiten replicar los ajustes con la libreria open-unlearning.
- Docencia y formacion: material de partida para explicar las diferencias entre eliminar muestras y eliminar conocimiento en modelos de lenguaje.
- Auditoria de privacidad: escenario controlado para estudiar si el conocimiento factual puede recuperarse mediante reformulaciones tras un proceso de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye en cada carpeta de desaprendizaje los ficheros `TOFU_EVAL.json`, `TOFU_SUMMARY.json`, `fade_untrain/` y `fade_unlearn/`, pero sus valores numericos no se detallan en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits: aproximadamente 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion 4 bits, en GPUs de 8-12 GB como RTX 3060/4060 Ti.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para serving; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 48,2 GB; conviene descargar solo la subcarpeta necesaria mediante el parametro `subfolder`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-TOFU-para | 8B | no disponible (base: 128k) | Checkpoints de desaprendizaje sobre TOFU con parafrasis | llama3.1 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo base instructivo general | llama3.1 | HuggingFace, ampliamente usado |
| locuslab/open-unlearning (checkpoints de referencia) | 8B | no disponible | Baseline de desaprendizaje TOFU sin parafrasis | no disponible | GitHub y HuggingFace |
| TOFU original (locuslab/TOFU) | no aplica | no aplica | Dataset de evaluacion de desaprendizaje | no disponible | HuggingFace datasets |

## Limitaciones y advertencias

- No es un modelo para produccion: es un artefacto de investigacion con fines experimentales sobre desaprendizaje.
- El ajuste fino sobre TOFU puede degradar capacidades generales del modelo base; no se documenta la utilidad retenida (model utility) en la informacion disponible.
- Riesgo de alucinacion heredado de Llama 3.1 8B Instruct, agravado por el ajuste sobre un dataset sintetico y ficticio.
- Sesgos: no documentados en la model card; se heredan los del modelo base y los del proceso de generacion de parafrasis por LLM.
- Idiomas: no se especifica que idiomas conserva tras el ajuste fino; el dataset TOFU esta en ingles.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, que impone condiciones de uso comercial, atribucion "Built with Llama" y restricciones de redistribucion; revisar el fichero LICENSE antes de cualquier uso.
- Las parafrasis fueron generadas por un LLM y verificadas factualmente, pero pueden introducir variaciones de estilo o contenido no controladas.
- El repositorio es grande (48,2 GB) y contiene muchos checkpoints; descargar el repo completo es costoso en almacenamiento y ancho de banda.
- Las metricas FADE dependen de la referencia elegida (`x2_retain90` frente a `x2_retain90_forget10para`); comparar valores entre carpetas sin tener en cuenta la referencia lleva a conclusiones erroneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Libreria open-unlearning: https://github.com/locuslab/open-unlearning
