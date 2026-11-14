# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed2

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed2` es un checkpoint de Llama 3.1 8B Instruct publicado por el usuario `sungjuncho` como parte de la coleccion TOFU-para, dedicada al estudio experimental del *unlearning* (desaprendizaje) en modelos de lenguaje. No es un modelo de proposito general: es un artefacto de investigacion construido aplicando el metodo RMU (*Representation Misdirection for Unlearning*) sobre un modelo previamente afinado con el dataset TOFU-para, una variante del benchmark TOFU con erratas en nombres corregidas y cinco parafrasis verificadas de cada par pregunta-respuesta.

El objetivo del experimento es distinguir entre *untraining* (eliminar las muestras concretas que se dieron al metodo de desaprendizaje) y *unlearning* real (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Para medirlo se introduce la metrica FADE, una divergencia KL simetrica respecto a un modelo de referencia, calculada sobre respuestas muestreadas. Este checkpoint concreto corresponde a la semilla 2 y al conjunto *forget10* original.

Arquitectonicamente es un transformer denso de 8.030.261.248 parametros (8B), identico en estructura a Llama 3.1 8B Instruct, por lo que hereda su ventana de contexto y su licencia Llama 3.1 Community License. Su relevancia es metodologica: sirve como punto de comparacion reproducible para evaluar tecnicas de desaprendizaje, no como modelo para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama 3.1 8B Instruct afinado sobre la totalidad de TOFU-para mas dos versiones de parafrasis (de ahi el sufijo `x2`). Sobre ese punto de partida se aplica RMU mediante la implementacion de `open-unlearning` (locuslab), con los hiperparametros por defecto de dicha libreria, sin recorte de gradiente (*no gradient clipping*) y con un tamano de lote efectivo de 32. La configuracion exacta esta en el directorio `train_config/` del repositorio.

El conjunto de olvido (*forget set*) son unicamente los 400 pares QA originales de *forget10*. El conjunto de retencion, para los metodos que lo usan, combina *retain90* con las parafrasis `para1` y `para2`, totalizando 10.800 ejemplos. La semilla 2 se aplica tanto al modelo de partida como a la ejecucion de desaprendizaje, y las comparaciones se hacen contra modelos de referencia de la misma semilla. No se documentan en la informacion disponible detalles sobre el volumen total de tokens de entrenamiento ni sobre fases de RLHF o DPO adicionales; el pipeline es un *finetune* supervisado seguido de RMU.

## Capacidades

- Generacion de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas dentro del dominio de TOFU-para (biografias sinteticas de autores).
- El checkpoint esta disenado para *desaprender* el conjunto forget10: se espera que degrade su rendimiento sobre esos 400 pares QA mientras conserva utilidad general (model utility 0.636).
- Soporte de tool calling y function calling: no documentado especificamente en este checkpoint, aunque la arquitectura base lo soporta.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- No incluye vision, audio ni modo *thinking* explicito.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como linea base reproducible para comparar RMU con otros metodos (GradDiff, NPO, etc.) bajo la misma semilla y el mismo conjunto forget10.
- Evaluacion de metricas de desaprendizaje: calcular FADE, *forget quality*, *truth ratio* y ROUGE sobre las respuestas del modelo para validar la robustez de dichas metricas frente a parafrasis.
- Auditoria de fuga de conocimiento: comprobar si el modelo retiene informacion del conjunto de olvido en formulaciones parafraseadas, lo que permite detectar *untraining* superficial frente a *unlearning* real.
- Estudios de reproducibilidad: la semilla 2 y los hiperparametros por defecto permiten replicar el experimento y medir la varianza entre semillas (comparando con las semillas 0 y 1 de la misma coleccion).
- Analisis de utilidad frente a olvido: medir el coste en *model utility* (0.636) que impone RMU y compararlo con el de otros metodos de la coleccion TOFU-para.
- Docencia y divulgacion: ilustrar en cursos o articulos como se comporta un modelo tras un proceso de desaprendizaje, con resultados por pregunta disponibles en `evals/`.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (semilla 2):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 498,03 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 471,53 (original 482,1 / para1 460,7 / para2 471,8) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 1,02e-13 |
| Forget truth ratio | 0,713 |
| Forget Q-A probability | 0,011 |
| Forget Q-A ROUGE | 0,092 |
| Model utility | 0,636 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits: alrededor de 4-5 GB, aunque no se documentan versiones GGUF oficiales de este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4080 (16 GB) solo con cuantizacion.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) usando cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-rmu-seed2`) | 8,03B | no disponible | RMU sobre finetune TOFU-para | llama3.1 | Hugging Face, 15 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` | 8,03B | no disponible | Modelo de referencia "perfect unlearner" | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` | 8,03B | no disponible | Modelo de partida sin desaprendizaje | llama3.1 | Hugging Face |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128K (segun Meta) | Modelo base de proposito general | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion; su comportamiento fuera del dominio TOFU-para no esta caracterizado.
- El resultado de FADE (471,53 en unlearning) esta muy lejos del "perfect unlearner" (29,8), lo que indica que RMU con los hiperparametros por defecto no elimina de forma efectiva el conocimiento parafraseado.
- Riesgo de alucinacion: no evaluado especificamente; hereda los sesgos y limitaciones de Llama 3.1 8B Instruct.
- Sesgos conocidos: no documentados en la informacion disponible; se presumen los del modelo base.
- Limitaciones de contexto e idioma: no documentadas para este checkpoint.
- Restricciones de licencia: Llama 3.1 Community License, con las condiciones de uso comercial y de atribucion de Meta; revisar el fichero `LICENSE` del repositorio antes de cualquier uso.
- El modelo puede retener informacion del conjunto de olvido en formulaciones no vistas, por lo que no debe tratarse como garantia de eliminacion de datos.
- Solo 15 descargas y 0 likes: no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed2
- Modelo base (finetune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (RMU): https://github.com/locuslab/open-unlearning
- Modelo de referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
