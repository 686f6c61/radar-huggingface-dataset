# yqiao0602/CalibBind

## Resumen

CalibBind (`armA_s0`) es un adaptador LoRA de rango 16 publicado por Yun Qiao (usuario `yqiao0602`) como parte del proyecto de investigacion CalibBind, orientado a la destilacion de decisiones con preservacion de calibracion para el binding de bandas en plataformas de procesamiento de teledeteccion. No es un modelo completo: se trata de un delta de pesos que debe fusionarse con el modelo base `jaredpalmer/kev-9b` (revision `db029f08b290afd9fee4aa4bbcd9ae48602d1eb0`), cuyo backbone es `Qwen/Qwen3.5-9B-Base`.

El adaptador corresponde a una unica semilla (seed 0) del brazo A (SFT con etiquetas duras) del paper asociado, que en total reporta tres brazos (A/B/C) con tres semillas cada uno y un control de escala de 4B. Por tanto, este repositorio no permite reproducir los resultados multi-brazo ni multi-semilla: solo el resultado principal de una semilla. El entrenamiento se realizo sobre 1.346 filas unicas del conjunto de destilacion del repositorio GitHub del proyecto.

Su relevancia es acotada y muy especifica: sirve como artefacto de evaluacion para el benchmark CalibBind, no como modelo de proposito general. La model card advierte explicitamente de que la calibracion falla en preguntas sin metadatos de longitud de onda (alta confianza con baja precision) y de que el modo de entrada solo-etiqueta cae en atajos posicionales y de cadena de etiqueta. Licencia Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (backbone Qwen3.5-9B-Base via `jaredpalmer/kev-9b`) |
| Parametros totales | no disponible (el delta LoRA ocupa 173 MB; el modelo base no se redistribuye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16 durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `head.pt` + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 inicializado sobre `jaredpalmer/kev-9b`, un modelo de decision publico cuyo backbone es `Qwen/Qwen3.5-9B-Base`. El repositorio incluye ademas `head.pt`, la cabeza de decision de kev emparejada con el delta, necesaria para la evaluacion. El tokenizador no se duplica: se toma del modelo base.

El entrenamiento uso los siguientes hiperparametros: learning rate 5e-5, 1 epoch, batch 4 con acumulacion de gradiente 2, precision bf16 y `max_state` 384. Los datos son `CalibBind-bench/distill/train_uniq.jsonl`, con 1.346 filas unicas procedentes del repositorio GitHub de CalibBind. No se documenta en la informacion disponible el volumen total de tokens, la composicion detallada del dataset ni si hubo fases de RLHF o DPO. La innovacion metodologica del proyecto es la destilacion de decisiones preservando la calibracion, aunque el adaptador publicado solo cubre el brazo A con etiquetas duras.

## Capacidades

- Generacion de texto condicionada al pipeline `text-generation` del modelo base.
- Binding de bandas espectrales en el contexto del benchmark CalibBind (seleccion de banda/longitud de onda a partir de la entrada).
- Evaluacion con metadatos de longitud de onda: el paper reporta alta exactitud en el split de 579 y en el split held-out de 203.
- Integracion con la cabeza de decision `head.pt` para tareas de clasificacion/decision del proyecto.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion reproducible del brazo A (seed 0) del paper CalibBind: fusionar el delta con la revision fijada del modelo base y ejecutar `CalibBind-bench/` para verificar la exactitud reportada.
- Investigacion en calibracion de modelos: usar el adaptador como caso de estudio de un modelo que muestra alta confianza con baja precision cuando faltan metadatos de longitud de onda.
- Baseline para destilacion de decisiones: comparar futuros adaptadores (brazos B/C, otras semillas) contra este artefacto de referencia.
- Analisis de sensibilidad a semilla: combinado con los resultados del paper, sirve para estudiar la varianza de 12,8 pp en el slice held-out solo-etiqueta.
- Desarrollo de pipelines de teledeteccion: prototipar el paso de binding de bandas dentro de una plataforma de procesamiento, siempre con metadatos de longitud de onda presentes.
- Reproduccion de experimentos academicos: punto de partida para replicar la suite de destilacion con el conjunto `train_uniq.jsonl` y los hiperparametros documentados.

## Benchmarks y rendimiento

Resultados del paper para el brazo A (resumen de 3 semillas; este peso `s0` es un miembro de ese conjunto):

| Split | Wavelength | Label-only |
|---|---|---|
| 579 | 99,1 ± 1,6 | 90,7 ± 3,5 |
| 203 held-out | 99,2 ± 0,5 | 92,1 ± 12,8 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base de 9B. Como referencia orientativa, un modelo de 9B en bf16 requiere aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado; un modelo de 9B en bf16 no cabe en GPUs de 8-12 GB, y en cuantizaciones de 4 bits podria ajustarse en GPUs de 16-24 GB, aunque no se documenta soporte de cuantizacion para este adaptador.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` + `peft` (`PeftModel.from_pretrained` y `merge_and_unload`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CalibBind `armA_s0` | LoRA r16 sobre base 9B | no disponible | 99,1/99,2 (wavelength); 90,7/92,1 (label-only) | Apache-2.0 | Hugging Face (adaptador) |
| `jaredpalmer/kev-9b` (base) | 9B (backbone Qwen3.5-9B-Base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Brazos B y C de CalibBind | LoRA sobre misma base | no disponible | documentados en el paper, no en este repo | Apache-2.0 (presumible) | no disponibles como pesos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (binding de bandas en teledeteccion) en la informacion proporcionada.

## Limitaciones y advertencias

- Preguntas sin metadatos de longitud de onda resultan poco fiables en el brazo de etiquetas duras: alta confianza con baja exactitud (hallazgo de calibracion del paper, seccion 5).
- El modo de entrada solo-etiqueta recurre a atajos de cadena de etiqueta y posicion; no implica comprension semantica espectral mas alla de los conjuntos de candidatos del benchmark.
- Alta sensibilidad a semilla en el slice held-out solo-etiqueta (rango de 12,8 pp); no debe sobreinterpretarse una unica semilla.
- Solo se publica el brazo A, seed 0: los resultados multi-brazo y multi-semilla no son reproducibles con este peso.
- No se redistribuyen los pesos completos del modelo base; es obligatorio fusionar con la revision fijada `db029f08b290afd9fee4aa4bbcd9ae48602d1eb0`.
- La cabeza `head.pt` es necesaria para la evaluacion; sin ella el adaptador no reproduce el resultado.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones de calibracion y el alcance acotado al benchmark desaconsejan su uso en produccion fuera de ese dominio.
- No se documentan sesgos conocidos ni limitaciones de idioma en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/yqiao0602/CalibBind
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Repositorio GitHub de CalibBind: https://github.com/hubu-mdzhang/CalibBind
- Paper (preprint, Remote Sensing, 2026): Qiao, Yun. "CalibBind: Calibration-Preserving Decision Distillation for Parameter Binding in Remote Sensing Processing Platforms" (sin URL directa en la informacion disponible)
