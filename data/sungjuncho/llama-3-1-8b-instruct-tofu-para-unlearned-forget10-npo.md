# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face, que aplica la tecnica de *machine unlearning* NPO (Negative Preference Optimization) sobre un modelo previamente ajustado con el dataset TOFU-para. TOFU (Task of Fictitious Unlearning) es un benchmark academico para evaluar si un modelo puede "olvidar" un conjunto de datos de entrenamiento (el *forget set*), y este checkpoint representa la variante que intenta eliminar el subconjunto forget10 (400 pares pregunta-respuesta).

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un fine-tune sobre la totalidad de TOFU mas dos versiones parafraseadas de cada par QA. Sobre esa base se ejecuta NPO con los hiperparametros por defecto de open-unlearning, sin gradient clipping, batch efectivo 32 y semilla 0. El resultado es un modelo de 8.030.261.248 parametros (8B) en formato safetensors, con licencia Llama 3.1 Community License.

La relevancia de este checkpoint es fundamentalmente investigadora: forma parte de una coleccion que distingue explicitamente entre *untraining* (eliminar las muestras exactas vistas por el metodo) y *unlearning* (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Los resultados publicados muestran que el modelo se comporta mas cerca de un "untrainer perfecto" que de un "unlearner perfecto", lo que ilustra una limitacion clave de las tecnicas actuales de desaprendizaje. No es un modelo pensado para uso en produccion general, sino como artefacto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens segun la familia base, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8B parametros, identico en arquitectura a Llama 3.1 8B Instruct. El entrenamiento consta de dos fases: primero un fine-tune supervisado sobre el dataset TOFU-para completo (TOFU con erratas en nombres corregidas, mas cinco versiones parafraseadas verificadas de cada par QA), dando lugar al modelo base `x2-full-seed0`; despues, un desaprendizaje con NPO (Negative Preference Optimization) usando la implementacion de open-unlearning.

El *forget set* utilizado son unicamente los 400 pares QA originales de forget10 (sin las parafrasis). El *retain set* para los metodos que lo usan comprende retain90 mas las parafrasis para1 y para2 (10.800 ejemplos). Los hiperparametros son los defaults de NPO en open-unlearning, sin gradient clipping, con batch efectivo 32 y semilla 0. La configuracion exacta esta en el directorio `train_config/` del repositorio. La innovacion tecnica no esta en la arquitectura sino en la metodologia de evaluacion: la metrica FADE (divergencia KL simetrica respecto al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) permite medir cuanto se ha alejado el modelo del comportamiento original, distinguiendo entre eliminar las muestras exactas y eliminar el conocimiento subyacente.

## Capacidades

- Generacion de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de formato QA, especialmente sobre el dominio de TOFU (biografias ficticias de autores).
- Capacidad de seguir instrucciones (modelo Instruct).
- Soporte de tool calling y function calling: no confirmado en la model card; heredado potencialmente de Llama 3.1 Instruct, pero no verificado tras el desaprendizaje.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles (los idiomas no se declaran en la model card).
- Modo *thinking* explicito, vision o audio: no disponibles.
- Capacidad especifica de interes: el modelo ha sido modificado para reducir la probabilidad de responder correctamente a las preguntas del *forget set* (probabilidad Q-A de 0.091, ROUGE de 0.310, truth ratio de 0.460 sobre ese conjunto).

## Casos de uso

- Investigacion en machine unlearning: sirve como punto de comparacion reproducible (semilla 0) para evaluar metodos de desaprendizaje frente a las referencias *retain90* y *full*, usando la metrica FADE y las metricas TOFU (forget quality, truth ratio, ROUGE, model utility).
- Estudio de la distincion untraining vs unlearning: permite analizar empiricamente por que un metodo que elimina las muestras exactas no elimina el conocimiento parafraseado, comparando los valores FADE de untraining (133.75) y unlearning (145.36) frente a los ideales (21.4 y 29.8 respectivamente).
- Reproducibilidad de experimentos: al fijar semilla 0 y publicar la configuracion en `train_config/`, se puede replicar el pipeline completo con open-unlearning y el dataset TOFU-para.
- Evaluacion de robustez de tecnicas de privacidad: util para medir hasta que punto NPO con defaults protege frente a la recuperacion de informacion olvidada mediante reformulaciones de las preguntas.
- Analisis de la utilidad retenida: con model utility de 0.648, permite estudiar el compromiso entre olvidar y conservar capacidades generales, comparandolo con las otras semillas (0.616 y 0.625).
- Docencia y formacion: ejemplo didactico de como se construye y evalua un checkpoint de desaprendizaje sobre un modelo Instruct de 8B, incluyendo la interpretacion de FADE como distancia y no como direccion.

## Benchmarks y rendimiento

Resultados publicados en la model card para la semilla 0:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 133.75 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 parafrasis) | 145.36 (original 156.1 / para1 140.3 / para2 139.6) |
| Calidad de olvido TOFU (vs `x2-retain90-seed0`) | 1.12e-19 |
| Truth ratio del forget set | 0.460 |
| Probabilidad Q-A del forget set | 0.091 |
| ROUGE Q-A del forget set | 0.310 |
| Utilidad del modelo | 0.648 |

Comparacion entre semillas (0-2):

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 133.7 | 152.5 | 126.4 | 137.6 ± 13.4 |
| FADE, unlearning | 145.4 | 156.2 | 133.7 | 145.1 ± 11.3 |
| Probabilidad Q-A del forget set | 0.091 | 0.094 | 0.091 | 0.092 ± 0.002 |
| ROUGE Q-A del forget set | 0.310 | 0.296 | 0.305 | 0.304 ± 0.007 |
| Truth ratio del forget set | 0.460 | 0.471 | 0.468 | 0.466 ± 0.006 |
| Utilidad del modelo | 0.648 | 0.616 | 0.625 | 0.629 ± 0.016 |

Puntos de referencia FADE:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21.4 ± 0.3 | 136.7 ± 0.4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104.2 ± 0.3 | 29.8 ± 0.3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, semillas 0-2) | 81.6 ± 0.7 | 156.3 ± 0.2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia para un modelo denso de 8B en bfloat16, se requieren aproximadamente 16 GB de pesos mas memoria para activaciones y KV cache; en cuantizacion de 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB (estimacion general para Llama 3.1 8B, no verificada para este checkpoint concreto).
- GPU recomendadas: no especificadas. Para bfloat16 sin cuantizar, una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100) seria suficiente segun el tamano del modelo; no confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente si, en GPUs con 16-24 GB y cuantizacion, pero no hay datos publicados para este checkpoint.
- Opciones de despliegue: transformers (unico metodo documentado, con `AutoModelForCausalLM.from_pretrained` y `torch_dtype="bfloat16"`). El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face, pero no se detalla configuracion para vLLM, llama.cpp, Ollama u otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`forget10-npo-seed0`) | 8.030.261.248 | No disponible | Desaprendizaje NPO sobre TOFU-para, semilla 0 | Llama 3.1 Community | Hugging Face, 887 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8B (no confirmado) | No disponible | Referencia "unlearner perfecto" (entrenado sin forget10) | Llama 3.1 Community | Hugging Face (referenciado) |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8B (no confirmado) | No disponible | Referencia "untrainer perfecto" (entrenado sin forget10 original) | Llama 3.1 Community | Hugging Face (referenciado) |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8B (no confirmado) | No disponible | Modelo base sin desaprendizaje | Llama 3.1 Community | Hugging Face (referenciado) |

No se dispone de comparacion con modelos de desaprendizaje de otros autores (por ejemplo, variantes con GradDiff, RMU o circuit breakers) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se comporta mas como un *untrainer* (FADE untraining 133.75, cercano al ideal de 21.4 aunque lejos) que como un *unlearner* (FADE unlearning 145.36, lejos del ideal de 29.8): elimina las muestras exactas pero no el conocimiento parafraseado, como muestran los valores por parafrasis (original 156.1, para1 140.3, para2 139.6).
- La calidad de olvido TOFU es de 1.12e-19, un valor extremadamente bajo que indica que el test estadistico de olvido no se supera.
- La utilidad del modelo cae a 0.648 (frente a valores de referencia no detallados en la ficha), lo que sugiere un compromiso entre olvidar y conservar capacidades.
- Alta varianza entre semillas en FADE (sd de 13.4 en untraining y 11.3 en unlearning), lo que limita la interpretacion de una unica ejecucion.
- FADE es una distancia, no una direccion: un valor intermedio entre dos filas de referencia no implica que el modelo este "entre" esos modelos.
- Riesgo de alucinacion: no evaluado en la model card; al ser un modelo Instruct de 8B, conserva los riesgos habituales de la familia Llama 3.1.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no declaradas; los idiomas no estan disponibles en la model card.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribucion ("Built with Llama") y las restricciones de uso comercial y de redistribucion de dicha licencia; revisar el archivo `LICENSE` del repositorio antes de cualquier uso en produccion.
- No es un modelo para produccion general: es un artefacto de investigacion sobre desaprendizaje, con un dataset ficticio (TOFU) y sin evaluacion de capacidades generales.
- El modelo solo ha sido desaprendido del *forget set* original; las parafrasis para1 y para2 no se incluyeron en el conjunto de olvido, lo que explica parte de la brecha entre untraining y unlearning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia "unlearner perfecto" (`x2-retain90-seed0`): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "untrainer perfecto" (`x2-retain90-forget10para-seed0`): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
