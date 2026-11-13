# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed2

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed2` es una variante del Llama 3.1 8B Instruct de Meta a la que se ha aplicado una tecnica de *machine unlearning* mediante ascenso de gradiente (GradAscent) sobre el conjunto de datos TOFU-para. Lo publica el usuario sungjuncho como parte de una coleccion de experimentos que separa explicitamente dos objetivos: *untraining* (eliminar las muestras concretas que se dieron al metodo) y *unlearning* (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Este checkpoint corresponde al segundo caso, con la semilla 2.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un ajuste fino sobre la totalidad de TOFU mas dos versiones parafraseadas de cada par pregunta-respuesta, y se le aplica GradAscent con la implementacion de `open-unlearning` (locuslab). El conjunto de olvido son los 400 pares QA originales de forget10; el conjunto de retencion, cuando el metodo lo usa, son retain90 mas las dos paráfrasis (10.800 ejemplos).

Su relevancia es fundamentalmente metodologica: no es un modelo pensado para produccion, sino una pieza de investigacion para evaluar hasta que punto el ascenso de gradiente elimina conocimiento real frente a limitarse a desaprender las muestras exactas. La metrica FADE (divergencia KL simetrica respecto al modelo de referencia) y las metricas estandar de TOFU (forget quality, truth ratio, model utility) son el eje de la evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se documenta carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y las innovaciones habituales de la familia Llama 3. No se documentan cambios estructurales respecto al modelo base. El proceso de entrenamiento consta de dos fases: primero un ajuste fino supervisado sobre TOFU-para completo (TOFU con erratas en los nombres corregidas, mas cinco versiones parafraseadas verificadas de cada par QA), dando lugar al checkpoint `x2-full-seed2`; despues, un *unlearning* con GradAscent sobre el conjunto forget10 original (400 pares QA), usando los hiperparametros por defecto de `open-unlearning`, sin recorte de gradiente, batch efectivo de 32 y semilla 2.

La innovacion metodologica no esta en la arquitectura sino en la evaluacion. El autor introduce la metrica FADE, una divergencia KL simetrica entre el modelo evaluado y un modelo de referencia, calculada sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado). FADE se desdobla en dos tareas: *untraining* (comparar contra el modelo que solo vio retain90 + forget10 parafraseado) y *unlearning* (comparar contra el modelo que solo vio retain90). El objetivo es distinguir si el metodo elimina las muestras o el conocimiento subyacente. La configuracion exacta del entrenamiento esta en el directorio `train_config/` del repositorio.

## Capacidades

- Generacion de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de dominio general, aunque el ajuste fino sobre TOFU-para puede haber desplazado la distribucion hacia el formato QA de ese corpus.
- Soporte de tool calling y function calling: no documentado en la model card; se heredaria del modelo base si el ajuste fino no lo ha degradado, pero no hay confirmacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; los idiomas figuran como no disponibles.
- Capacidad especial: el modelo esta disenado como artefacto de evaluacion de *unlearning*; su comportamiento esperado es haber perdido (parcialmente) el conocimiento del conjunto forget10, con una utilidad general (model utility) registrada de 0.000.

## Casos de uso

- Investigacion en *machine unlearning*: servir como checkpoint de referencia para comparar GradAscent con otros metodos (NPO, RMU, SalUn) sobre el mismo conjunto forget10 y la misma semilla, midiendo FADE y las metricas TOFU.
- Evaluacion de la distincion untraining/unlearning: usar el par de tareas FADE para determinar si un metodo elimina solo las muestras exactas o el conocimiento parafraseado, replicando el protocolo del autor.
- Reproducibilidad de experimentos: al fijar la semilla 2 y publicar `train_config/`, permite reproducir el resultado y contrastarlo con los modelos de referencia de la misma semilla.
- Estudio del olvido catastrófico inducido: el valor de model utility 0.000 sugiere una degradacion severa de la utilidad general; el modelo sirve para analizar el coste del ascenso de gradiente en terminos de capacidad retenida.
- Analisis de robustez frente a parafrasis: comparar las filas original/para1/para2 de FADE para estudiar si el olvido se generaliza a reformulaciones.
- Docencia y formacion: ejemplo didactico de pipeline completo de *unlearning* con `open-unlearning`, desde el ajuste fino hasta la evaluacion con FADE.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 4416.34 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 4231.50 (original 4263.7 / para1 4211.1 / para2 4219.7) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 1.06e-239 |
| Forget truth ratio | 1.03e-38 |
| Forget Q-A probability | 0.000 |
| Forget Q-A ROUGE | 0.043 |
| Model utility | 0.000 |

Puntos de referencia FADE citados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21.4 ± 0.3 | 136.7 ± 0.4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104.2 ± 0.3 | 29.8 ± 0.3 (29 / 30 / 30) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82.2 | 156.5 (158 / 153 / 158) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los valores FADE de este checkpoint (4416 y 4231) son ordenes de magnitud superiores a los de los modelos ideales y al modelo de partida, lo que indica una divergencia muy grande respecto a las referencias.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contexto corto.
- Cuantizacion: no documentada por el autor; al ser un Llama 3.1 8B estandar, cabria esperar compatibilidad con GGUF/AWQ/GPTQ, pero no hay confirmacion en el repositorio.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, TGI, llama.cpp u Ollama no estan verificados para este checkpoint, aunque el tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GradAscent, seed 2) | 8.030 M | no disponible | Unlearning TOFU-para, forget10 | llama3.1 | Hugging Face, 0 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (modelo de partida) | 8.030 M | no disponible | Ajuste fino completo sobre TOFU-para x2 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (referencia "perfect unlearner") | 8.030 M | no disponible | Entrenado solo con retain90 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (referencia "perfect untrainer") | 8.030 M | no disponible | Entrenado con retain90 + forget10 parafraseado | llama3.1 | Hugging Face |

Los tres modelos de referencia pertenecen a la misma coleccion TOFU-para del mismo autor, por lo que comparten arquitectura, tamano y licencia; la diferencia esta en el conjunto de entrenamiento y en el papel que juegan en la evaluacion FADE.

## Limitaciones y advertencias

- El valor de model utility es 0.000, lo que indica una degradacion practicamente total de la utilidad general del modelo; no es apto para uso en produccion ni para tareas generales.
- FADE de untraining (4416.34) y de unlearning (4231.50) son muy superiores a los del modelo de partida (82.2 y 156.5) y a los de los modelos ideales; el checkpoint se aleja mucho de las referencias, lo que sugiere que GradAscent ha producido una perturbacion masiva mas que un olvido selectivo.
- Forget Q-A ROUGE de 0.043 y probabilidad 0.000 indican que el modelo practicamente no reproduce las respuestas del conjunto de olvido, pero la interpretacion de este resultado debe acompanarse de la metrica FADE, dado el dano colateral.
- Riesgo de alucinacion y de respuestas degeneradas: no evaluado en la model card, pero plausible dada la utilidad nula.
- Sesgos conocidos: no documentados; se heredarian los del Llama 3.1 8B Instruct base, sin analisis especifico.
- Idiomas soportados: no disponibles; no hay evaluacion multilingue.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones habituales de atribucion ("Built with Llama") y las restricciones de uso de Meta; revisar el archivo `LICENSE` antes de cualquier uso.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de los resultados.
- El autor advierte que FADE es una distancia, no una direccion: un valor intermedio entre dos filas no implica que el modelo se situe entre esos modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed2
- Modelo base (ajuste fino): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
