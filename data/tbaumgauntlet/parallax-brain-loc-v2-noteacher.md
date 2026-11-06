# tbaumgauntlet/parallax-brain-loc-v2-noteacher

## Resumen

`parallax-brain-loc-v2-noteacher` es un adaptador LoRA publicado por el usuario tbaumgauntlet para el modelo multimodal `mlx-community/Qwen3-VL-2B-Instruct-4bit`. Su tarea es concreta: dada una unica imagen de resonancia magnetica cerebral T1 con contraste que contiene un tumor, devuelve la caja delimitadora axis-aligned mas ajustada posible en formato JSON `{"bbox":[x1,y1,x2,y2]}` sobre una rejilla normalizada de 0 a 1000. No clasifica el tumor ni emite comentario diagnostico alguno.

El modelo base es Qwen3-VL-2B-Instruct en su cuantizacion 4-bit (afin, grupo 64) realizada por mlx-community, con la torre de vision congelada. El adaptador se entrena con MLX-VLM 0.7.11 sobre Apple Silicon y solo es cargable en el ecosistema MLX, no en PyTorch/PEFT. El repositorio ocupa 0,1 GB, lo que corresponde al peso del adaptador y no al del modelo base.

Es relevante por dos motivos. Primero, documenta un punto intermedio de un curriculum de entrenamiento (`v2_noteacher`, ablacion sin datos de profesor) que el autor publica para poder regenerar su tabla de eficiencia con `eval.py`; el checkpoint seleccionado es otro (`parallax-brain-loc-n1024`). Segundo, ofrece cifras de evaluacion honestas y poco habituales en adaptadores pequenos: 59,3 % de aciertos con IoU >= 0,50 en un holdout de 54 pacientes, frente al 16,7 % del modelo base sin ajustar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-2B (torre de vision congelada) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 4-bit (afin, grupo 64); adaptador en precision de entrenamiento MLX |
| Idiomas soportados | no disponible (la tarea es de localizacion visual, prompt en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no compatible con PyTorch/PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-2B-Instruct, un modelo vision-lenguaje que combina una torre de vision con un transformer de lenguaje. El LoRA tiene rango 16, alpha 32 (escala 2,0) y dropout 0,05, y se inserta en 196 capas Linear del modelo de lenguaje (`down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj`). La torre de vision permanece congelada y sin adaptadores, de modo que toda la adaptacion ocurre en el decodificador de texto.

El entrenamiento usa 128 slices del conjunto data-v2, sin las 42 filas auxiliares escritas por un modelo profesor (de ahi el sufijo `noteacher`, una ablacion de datos de profesor). Se realizan 128 actualizaciones AdamW con learning rate 0,0001, perdida solo sobre la completacion (completion-only loss) y un tiempo total de 1249 segundos en un Apple M1 Max. Las imagenes proceden del *Brain tumor dataset* de Jun Cheng (figshare, CC BY 4.0), renderizadas a PNG de 8 bits con ventana percentil por slice y con las mascaras convertidas a cajas delimitadoras a partir de las anotaciones manuales. La decodificacion en evaluacion es greedy y el parseo de la respuesta es estricto.

## Capacidades

- Localizacion de tumores en una unica slice de RM cerebral T1 con contraste, devolviendo una caja axis-aligned en rejilla 0-1000.
- Salida estructurada JSON estricta (`{"bbox":[x1,y1,x2,y2]}`) sin prosa ni claves adicionales.
- Comprension imagen-texto heredada de Qwen3-VL-2B, aunque el ajuste la especializa en la tarea de localizacion.
- No nombra el tipo de tumor ni emite comentarios diagnosticos, por diseno del prompt y del entrenamiento.
- No se documentan capacidades de tool calling, agentes, matematicas o codigo en la informacion disponible.
- Capacidades multilingues: no disponibles; el prompt de referencia esta en ingles.

## Casos de uso

- Investigacion en localizacion de lesiones: uso como linea base reproducible para comparar metodos de localizacion visual en RM, ya que el autor publica el punto de curriculum y el script `eval.py` para regenerar metricas.
- Ablaciones de datos de profesor: el checkpoint `noteacher` sirve para medir el efecto de eliminar filas auxiliares generadas por un modelo profesor frente a variantes que las incluyen.
- Preetiquetado asistido en pipelines de anotacion: generar cajas candidatas sobre slices T1 para que un radiologo las revise, aceptando que solo el 59,3 % supera IoU 0,50 y que requiere validacion humana.
- Experimentacion en Apple Silicon: permite probar flujos de vision-lenguaje con MLX-VLM 0.7.11 en un M1 Max, con tiempos de entrenamiento del orden de 20 minutos para 128 pasos.
- Estudio de robustez: el conjunto de perturbaciones que preservan informacion (90/162 de adherencia) permite analizar la estabilidad de las coordenadas ante cambios de renderizado.
- Docencia y prototipado de salidas estructuradas: ejemplo de ajuste fino que fuerza un formato JSON estricto en un modelo pequeno de 2B.

## Benchmarks y rendimiento

| Conjunto / metrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU >= 0,50 | 32/54 (59,3 %) |
| Holdout oficial: IoU medio / mediana | 0,493 / 0,607 |
| Holdout oficial por clase (M / G / P) | 13/18 / 6/18 / 13/18 |
| Holdout oficial: formato valido | 53/54 |
| Robustez (3 perturbaciones x 54) | 90/162 (55,6 %) |
| Piloto de desarrollo (30, seleccion de modelo) | 17/30, IoU medio 0,516 |
| Base sin ajustar, holdout oficial | 9/54, IoU medio 0,227 |
| Mejor prompting frontier (Gemini 4 estructurado), oficial | 50/54, IoU medio 0,780 |
| Objetivos 95 % adherencia / 90 % robustez | no alcanzados |

## Requisitos de hardware

- Requiere Apple Silicon; el adaptador es MLX y no carga en `transformers`/`peft`.
- El modelo base es Qwen3-VL-2B en 4-bit, por lo que la inferencia cabe en memoria unificada de equipos Apple de gama alta; el autor entreno en un M1 Max.
- VRAM/memoria unificada estimada: no disponible de forma explicita; por el tamano del base 4-bit, es del orden de pocos GB, pero no se publica cifra.
- GPU recomendadas: no aplica fuera de Apple Silicon segun la informacion disponible; no se documenta soporte CUDA.
- Opciones de despliegue: MLX-VLM 0.7.11 con el entorno `requirements-mlx.lock.txt` del repositorio Parallax; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publica el tiempo de entrenamiento (1249 s para 128 pasos en M1 Max).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en holdout oficial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parallax-brain-loc-v2-noteacher | LoRA sobre base 2B | no disponible | 32/54 IoU >= 0,50; IoU medio 0,493 | Apache 2.0 | Hugging Face, MLX |
| Qwen3-VL-2B-Instruct-4bit sin ajustar | 2B | no disponible | 9/54; IoU medio 0,227 | Apache 2.0 (base) | Hugging Face, MLX |
| Gemini 4 (prompting estructurado) | no disponible | no disponible | 50/54; IoU medio 0,780 | propietaria | API |
| parallax-brain-loc-n1024 (checkpoint seleccionado) | LoRA sobre base 2B | no disponible | no disponible en la informacion | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo slices 2-D de un unico dataset publico de un grupo institucional; la evaluacion patient-family-disjoint es interna a ese dataset.
- Gliomas tenues y difusos presentan bordes inciertos; algunas mascaras de origen siguen estructuras no tumorales.
- No validado para uso clinico; el autor lo marca como research use only y no apto para diagnostico ni decision clinica.
- No alcanza los objetivos declarados de 95 % de adherencia al formato y 90 % de robustez.
- Riesgo de alucinacion en coordenadas: el modelo puede devolver cajas plausibles pero incorrectas, especialmente en clases con bajo rendimiento (G: 6/18).
- Restriccion tecnica de licencia/ecosistema: es un adaptador MLX, no cargable en PyTorch/PEFT; la licencia Apache 2.0 permite uso comercial, pero la falta de validacion clinica desaconseja cualquier aplicacion medica real.
- El modelo base 4-bit no registra el commit upstream de la conversion, lo que limita la trazabilidad completa.
- Idiomas soportados no documentados; el prompt de referencia esta en ingles.

## Enlaces

- Hugging Face: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-v2-noteacher
- Checkpoint seleccionado: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Dataset de imagenes y mascaras: doi:10.6084/m9.figshare.1512427.v8
- Cheng et al., PLoS ONE 10(10), 2015 (referencia del dataset)
- Cheng et al., PLoS ONE 11(6), 2016 (referencia del dataset)
