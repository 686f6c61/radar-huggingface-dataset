# tbaumgauntlet/parallax-brain-loc-v2

## Resumen

`parallax-brain-loc-v2` es un adaptador LoRA para el modelo multimodal `mlx-community/Qwen3-VL-2B-Instruct-4bit`, desarrollado por el usuario tbaumgauntlet en el marco del proyecto Parallax. Su tarea es concreta: dada una unica imagen de resonancia magnetica cerebral T1 con contraste, devuelve la caja delimitadora axis-aligned mas ajustada alrededor del tumor en una rejilla normalizada de 0 a 1000, en formato JSON estricto. No clasifica el tumor ni emite comentarios diagnosticos.

El adaptador se entrena y ejecuta exclusivamente en Apple Silicon mediante MLX-VLM 0.7.11, no es compatible con PyTorch/PEFT ni con `transformers`. El modelo base es la conversion 4-bit (afin, grupo 64) de Qwen3-VL-2B-Instruct, un transformer multimodal de 2 mil millones de parametros con torre de vision congelada durante el entrenamiento del adaptador.

Es relevante como pieza de investigacion reproducible: el autor publica este checkpoint de curriculum (`v2`) explicitamente para regenerar la tabla de eficiencia del proyecto Parallax con `eval.py`, y remite al checkpoint seleccionado final (`parallax-brain-loc-n1024`). El uso previsto es exclusivamente de investigacion, no clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-2B (vision-language) |
| Parametros totales | no disponible (base de 2B; el adaptador LoRA anade un subconjunto no cuantificado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 4-bit (afin, group 64); adaptador LoRA en precision propia de MLX |
| Idiomas soportados | no disponible (prompt de entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA nativo MLX, no PEFT/PyTorch); base en safetensors convertido a MLX 4-bit |
| Rango LoRA | 16 |
| Alpha LoRA | 32 (escala 2.0) |
| Dropout LoRA | 0.05 |
| Capas adaptadas | 196 capas Linear del language model (down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj) |
| Torre de vision | congelada, sin adaptadores |
| Revision del base | `9c4f5209e57b31f4b9dfba735de3fb983739c9cc` |
| SHA256 del adaptador | `c22adc1eff56bf352b81b99b3fe7460eb7611bb5a6974e1b8b2918d3beeb4eef` |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las capas lineales del language model de Qwen3-VL-2B-Instruct (196 capas: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La torre de vision permanece congelada y sin adaptadores, de modo que toda la adaptacion ocurre en el decodificador de texto que interpreta los tokens visuales. El entrenamiento se realizo con MLX-VLM 0.7.11 sobre Apple Silicon (M1 Max), con 170 actualizaciones AdamW, learning rate 0.0001, perdida solo sobre la completacion (completion-only loss) y decodificacion greedy en evaluacion.

Los datos de entrenamiento consisten en 128 cortes de resonancia (posiciones 1-128 de un curriculum anidado, dataset v2) procedentes de 78 familias de pacientes, con cajas derivadas de las mascaras manuales, mas 42 filas auxiliares de texto generadas por un profesor y filtradas. Las imagenes provienen del *Brain tumor dataset* de Jun Cheng (figshare, CC BY 4.0), renderizadas a PNG de 8 bits con ventana percentil por corte y convertidas de mascara a caja delimitadora. El entrenamiento completo tardo 866 segundos.

## Capacidades

- Localizacion de tumores en cortes individuales de RM cerebral T1 con contraste: devuelve `{"bbox":[x1,y1,x2,y2]}` en rejilla 0-1000 con origen en la esquina superior izquierda.
- Salida estrictamente estructurada en JSON, sin prosa, sin markdown y sin claves adicionales, segun el prompt de entrenamiento.
- Cumplimiento de formato muy alto: 54/54 salidas validas en el holdout oficial.
- Robustez ante perturbaciones que preservan la informacion (3 perturbaciones x 54 casos): 102/162 con adherencia correcta.
- Capacidad multimodal heredada del base Qwen3-VL-2B (vision-lenguaje), aunque el adaptador solo se ha entrenado para la tarea de localizacion.
- No soporta tool calling ni agentes de forma especifica; no se documenta thinking mode ni audio.
- No clasifica el tipo de tumor ni emite comentarios diagnosticos (restriccion explicita del prompt).

## Casos de uso

- Evaluacion reproducible de investigacion: regenerar la tabla de eficiencia del proyecto Parallax ejecutando `eval.py` con este checkpoint y un conjunto `eval.jsonl`, verificando hashes del adaptador y del base.
- Preanotacion de datasets de imagen medica: generar cajas candidatas sobre cortes de RM para que un revisor humano las valide, reduciendo el tiempo de anotacion manual en estudios con muchos cortes.
- Linea base de localizacion en pipelines academicos: comparar IoU de un adaptador pequeno (2B, 4-bit) frente a prompting de modelos frontera, como hace la propia model card (0.553 de IoU medio frente a 0.780 del mejor prompting frontera).
- Experimentos de eficiencia en Apple Silicon: medir coste de entrenamiento e inferencia de LoRA sobre un VLM cuantizado a 4-bit en un M1 Max (866 s de entrenamiento documentados).
- Estudio de robustez de modelos pequenos: usar el conjunto de perturbaciones que preservan la informacion para analizar la adherencia al formato y la estabilidad de coordenadas.
- Prototipado local sin GPU dedicada: desplegar el adaptador en un portatil Apple Silicon para pruebas de concepto de localizacion tumoral en entornos de investigacion.

## Benchmarks y rendimiento

| Conjunto / metrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU >= 0.50 | 34/54 (63.0%) |
| Holdout oficial: IoU medio / mediana | 0.553 / 0.607 |
| Holdout oficial por clase (M / G / P) | 14/18 / 8/18 / 12/18 |
| Holdout oficial: formato valido | 54/54 |
| Robustez (3 perturbaciones x 54) | 102/162 (63.0%) |
| Piloto de desarrollo (30, seleccion de modelo) | 15/30, IoU medio 0.456 |
| Base sin ajuste, holdout oficial | 9/54, IoU medio 0.227 |
| Mejor prompting frontera (Gemini 4 estructurado), oficial | 50/54, IoU medio 0.780 |
| Objetivos 95% adherencia / 90% robustez | no alcanzados |

## Requisitos de hardware

- Requiere Apple Silicon; el adaptador es nativo de MLX y no carga en `transformers`/`peft`.
- Entorno: repositorio Parallax con `requirements-mlx.lock.txt` y mlx-vlm 0.7.11.
- VRAM/memoria unificada: no disponible de forma explicita; el base es de 2B parametros en 4-bit (afin, grupo 64), lo que lo hace apto para equipos Apple Silicon de gama consumer.
- GPU recomendadas: no aplica CUDA; el entrenamiento documentado se realizo en un M1 Max (866 s, 170 actualizaciones).
- Despliegue: MLX-VLM (`eval.py` del repositorio Parallax); no compatible con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | IoU medio (holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parallax-brain-loc-v2 | 2B (4-bit) + LoRA r16 | no disponible | Localizacion de tumor en RM | 0.553 | Apache 2.0 | HuggingFace (MLX) |
| parallax-brain-loc-n1024 | 2B (4-bit) + LoRA | no disponible | Localizacion de tumor en RM | no disponible (checkpoint seleccionado) | Apache 2.0 | HuggingFace (MLX) |
| Qwen3-VL-2B-Instruct-4bit (sin ajuste) | 2B (4-bit) | no disponible | Vision-lenguaje general | 0.227 | Apache 2.0 | HuggingFace (MLX) |
| Gemini 4 (prompting estructurado) | no disponible | no disponible | Vision-lenguaje general | 0.780 | propietaria | API |

## Limitaciones y advertencias

- Uso exclusivamente de investigacion; no validado para diagnostico ni para ninguna decision clinica.
- Entrenado con cortes 2D de un unico dataset publico (un solo grupo institucional); la evaluacion patient-family-disjoint solo se aplica dentro de ese dataset.
- Los gliomas tenues y difusos presentan bordes inciertos; algunas mascaras de origen siguen estructuras no tumorales.
- No alcanza los objetivos declarados de 95% de adherencia y 90% de robustez (63.0% en robustez).
- Es un checkpoint de curriculum (`v2`), no el modelo seleccionado final; el autor remite a `parallax-brain-loc-n1024`.
- No es un adaptador PyTorch/PEFT: no carga en `transformers`/`peft` y queda restringido al ecosistema MLX y Apple Silicon.
- Riesgo de alucinacion en coordenadas y de desviacion del formato JSON en entradas fuera de distribucion, aunque el formato fue valido en 54/54 casos del holdout.
- Sesgos conocidos: no documentados de forma explicita mas alla de la limitacion de institucion unica y la incertidumbre en gliomas difusos.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero la restriccion de uso clinico es una advertencia explicita del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-v2
- Checkpoint seleccionado: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de imagenes y mascaras: https://doi.org/10.6084/m9.figshare.1512427.v8 (CC BY 4.0)
- Articulo de referencia (PLoS ONE 10(10), 2015): Cheng et al., "Enhanced Performance of Brain Tumor Classification via Tumor Region Augmentation and Partition"
- Articulo de referencia (PLoS ONE 11(6), 2016): Cheng et al., "Retrieval of Brain Tumors by Adaptive Spatial Pooling and Fisher Vector Representation"
