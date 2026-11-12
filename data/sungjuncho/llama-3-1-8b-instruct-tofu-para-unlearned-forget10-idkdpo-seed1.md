# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el usuario de Hugging Face `sungjuncho` como parte de la colección experimental TOFU-para, cuyo objetivo es distinguir entre *untraining* (eliminar las muestras concretas que el método recibió) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo parte de un fine-tune previo sobre todo TOFU más dos versiones parafraseadas, y se le aplica el método IdkDPO implementado en la librería open-unlearning.

La relevancia es fundamentalmente metodológica: no es un modelo de propósito general, sino una pieza de investigación para evaluar técnicas de eliminación de conocimiento en LLMs. Con 8.030.261.248 parámetros, arquitectura transformer densa (no MoE) y licencia Llama 3.1, hereda todas las capacidades del modelo base de Meta, pero su interés está en las métricas de desaprendizaje publicadas (FADE, TOFU forget quality, truth ratio, model utility) más que en su rendimiento conversacional o de código.

El checkpoint corresponde a la semilla 1 y se compara contra modelos de referencia de la misma semilla. El conjunto a olvidar son las 400 pares QA originales de forget10, mientras que el conjunto a retener incluye retain90 más dos paráfrasis (10.800 ejemplos en total). El resultado es un modelo que ha reducido drásticamente la probabilidad de responder correctamente al conjunto forget, a costa de una utilidad general moderada-baja (0,214).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |
| Tamano del repo | 16,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1 |
| Dataset | sungjuncho/TOFU-para |
| Metodo de unlearning | IdkDPO (open-unlearning) |
| Semilla | 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA) y las innovaciones estándar de la familia Llama 3.1. Sobre esa base, el autor realizó primero un fine-tune completo sobre todo el conjunto TOFU-para más dos versiones parafraseadas de cada par QA (modelo `x2-full-seed1`), y posteriormente aplicó IdkDPO mediante la implementación de open-unlearning.

El proceso de unlearning emplea los hiperparámetros por defecto de IdkDPO en open-unlearning, sin recorte de gradiente, con batch efectivo de 32 y semilla 1 tanto para el modelo de partida como para la ejecución de desaprendizaje. El conjunto forget son exclusivamente los 400 pares QA originales de forget10, mientras que el conjunto retain usado por los métodos que lo requieren combina retain90 con para1 y para2 (10.800 ejemplos). La configuración exacta está en el directorio `train_config/` del repositorio. La innovación metodológica clave es la separación explícita entre untraining y unlearning, evaluada mediante FADE (divergencia KL simétrica respecto a un modelo de referencia, con estimador Rao-Blackwellizado sobre 10 muestras por pregunta a temperatura 1).

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama-3.1-8B-Instruct original, aunque el fine-tune y el unlearning pueden haber alterado su comportamiento.
- Razonamiento y matemáticas: capacidades propias del modelo base, no evaluadas específicamente en la información disponible.
- Generación de código: capacidades del modelo base, no revalidadas tras el proceso de unlearning.
- Soporte de tool calling / function calling: presumiblemente heredado del Instruct base, no confirmado en la información proporcionada.
- Capacidades multilingües: no documentadas para este checkpoint.
- Capacidad especial: el modelo está diseñado para *no* recordar el conjunto forget10 de TOFU; su comportamiento esperado ante esas preguntas es responder con incertidumbre o abstención (de ahí IdkDPO, "I don't know" DPO).
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como artefacto experimental para comparar métodos de desaprendizaje (IdkDPO frente a otras técnicas) usando las métricas FADE, TOFU forget quality y model utility. Es su uso principal y natural.
- Evaluación de la distinción untraining/unlearning: permite estudiar si un método elimina solo las muestras vistas o también el conocimiento subyacente en paráfrasis, gracias a la estructura del dataset TOFU-para.
- Reproducibilidad de experimentos: al fijar semilla 1 y publicar `train_config/`, facilita la replicación de resultados en estudios académicos sobre privacidad y eliminación de datos.
- Auditoría de privacidad en LLMs: útil para analizar hasta qué punto un modelo fine-tuneado puede "olvidar" información sensible o ficticia tras un proceso de desaprendizaje.
- Estudio de la degradación de utilidad: con model utility de 0,214, es un caso de análisis del compromiso entre olvido y capacidad general, útil para diseñar métodos que minimicen esa pérdida.
- Baseline en pipelines de evaluación de unlearning: puede integrarse en suites de test que comparen checkpoints de la colección TOFU-para contra los modelos de referencia ideal (perfect untrainer y perfect unlearner).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 75,27 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 94,66 (original 92,4 / para1 96,1 / para2 95,5) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 8,12e-27 |
| Forget truth ratio | 0,440 |
| Forget Q-A probability | 0,706 |
| Forget Q-A ROUGE | 0,080 |
| Model utility | 0,214 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 8B en bfloat16 se requiere aproximadamente 16 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño, una A100 40GB, H100 o L40S son adecuadas.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en bfloat16 o cuantizado, y en GPUs de 16 GB con cuantización a 8 bits o inferior; no confirmado en la información disponible.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-idkdpo-seed1`) | 8,03B | No disponible | Unlearning IdkDPO sobre TOFU-para | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8,03B | No disponible | Fine-tune completo sobre TOFU-para + 2 paráfrasis (modelo de partida) | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03B | No disponible | Modelo de referencia "perfect unlearner" | Llama 3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8,03B | No disponible | Modelo de referencia "perfect untrainer" | Llama 3.1 | Hugging Face |

La comparación con modelos de propósito general (por ejemplo, Llama-3.1-8B-Instruct original) no es significativa en términos de rendimiento, ya que este checkpoint está optimizado para una tarea de investigación concreta. Los modelos comparables más directos son los de la propia colección TOFU-para.

## Limitaciones y advertencias

- No es un modelo de propósito general: su utilidad general (0,214) es baja, por lo que no se recomienda para producción conversacional, código o tareas estándar.
- El proceso de unlearning puede degradar capacidades del modelo base de forma no documentada; no se han publicado evaluaciones de MMLU, HumanEval u otros benchmarks estándar.
- Riesgo de alucinación: no evaluado en la información proporcionada; el comportamiento esperado ante el conjunto forget es la abstención o respuesta incierta, no necesariamente una respuesta correcta.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del Llama-3.1-8B-Instruct base, no auditados aquí.
- Idiomas soportados: no documentados; el dataset TOFU es en inglés, por lo que el comportamiento multilingüe es incierto.
- Restricciones de licencia: Llama 3.1 Community License, con las restricciones habituales de Meta (incluida la cláusula de nombre y las limitaciones de uso comercial para destinatarios con más de 700 millones de usuarios mensuales).
- Contexto: no se confirma que este checkpoint conserve los 128K tokens del Llama 3.1 original; debe verificarse antes de usarlo con contextos largos.
- Reproducibilidad: los resultados dependen de la semilla (1) y de los modelos de referencia de la misma semilla; comparaciones cruzadas entre semillas pueden desviar FADE en torno a 0,3.
- FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo esté "entre" esos modelos en comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed1
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo de referencia "perfect unlearner" (`x2-retain90-seed1`): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Modelo de referencia "perfect untrainer" (`x2-retain90-forget10para-seed1`): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
