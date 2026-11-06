# tbaumgauntlet/parallax-brain-loc-n1024

## Resumen

parallax-brain-loc-n1024 es un adaptador LoRA para el modelo multimodal mlx-community/Qwen3-VL-2B-Instruct-4bit, desarrollado por el usuario tbaumgauntlet. Su tarea es acotada y especializada: dada una unica imagen de resonancia magnetica cerebral T1 con contraste, devuelve la caja delimitadora axis-aligned mas ajustada alrededor del tumor en una rejilla normalizada de 0 a 1000. No clasifica el tumor ni emite comentarios diagnosticos; solo localiza.

El adaptador se entrena con MLX-VLM 0.7.11 sobre Apple Silicon y se distribuye en formato MLX, no en PyTorch/PEFT, por lo que no carga en transformers/peft. El modelo base es la conversion 4-bit (afin, grupo 64) de Qwen3-VL-2B-Instruct, un transformer multimodal de 2 mil millones de parametros con torre de vision congelada durante el ajuste.

Su relevancia es metodologica: demuestra que un adaptador LoRA de rango 16 sobre un modelo de 2B cuantizado a 4 bits puede pasar de un IoU medio de 0,227 (base sin ajustar) a 0,647 en un conjunto de validacion de 54 pacientes, con un 81,5% de aciertos a IoU >= 0,50. Esta explicitamente marcado como uso de investigacion y no apto para diagnostico ni decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-2B-Instruct (torre de vision congelada) |
| Parametros totales | 2B en el modelo base; adaptador LoRA de rango 16 sobre 196 capas Linear del modelo de lenguaje (parametros del adaptador no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en 4 bits (afin, grupo 64); adaptador MLX sin cuantizacion declarada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA); no compatible con PyTorch/PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-2B-Instruct, un modelo vision-lenguaje que procesa una imagen y un turno de usuario para generar texto. La configuracion LoRA es rango 16, alpha 32 (escala 2,0) y dropout 0,05, sobre 196 capas Linear del modelo de lenguaje (down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj). La torre de vision permanece congelada y sin adaptadores, de modo que todo el ajuste recae en la proyeccion linguistica que interpreta las representaciones visuales.

El entrenamiento usa 1.024 cortes de 99 familias de pacientes en un curriculo anidado (las posiciones 1-128 corresponden a la version 2 de los datos), con cajas derivadas de mascaras manuales y 42 filas auxiliares de texto generadas por un profesor y filtradas. Se realizaron 1.066 actualizaciones AdamW con learning rate 0,0001 y perdida solo sobre la completion, en 5.663 segundos sobre una M1 Max. La decodificacion en evaluacion es greedy y el prompt fija estrictamente el formato de salida a un unico objeto JSON con la clave bbox.

## Capacidades

- Localizacion de tumores en cortes individuales de RM cerebral T1 con contraste mediante cajas delimitadoras en rejilla 0-1000.
- Salida estrictamente estructurada: un unico objeto JSON `{"bbox":[x1,y1,x2,y2]}` sin prosa ni claves adicionales.
- Cumplimiento de formato del 54/54 en el conjunto de validacion oficial.
- Robustez parcial ante perturbaciones que preservan la informacion: 129/162 (79,6%) de adherencia.
- Entrada image-text-to-text con un unico turno de usuario e imagen primero.
- No realiza clasificacion del tipo de tumor ni comentario diagnostico por diseno del prompt.

## Casos de uso

- Investigacion en localizacion de lesiones: uso como linea base reproducible para comparar tecnicas de adaptacion parametro-eficiente en imagenes medicas, gracias a la validacion con IoU y a los hashes verificables del adaptador y del modelo base.
- Preanotacion de datasets de RM: generacion de cajas candidatas sobre cortes T1 que un radologo revisa y corrige, reduciendo el tiempo de anotacion manual en conjuntos de investigacion.
- Evaluacion de modelos frontier frente a adaptadores pequenos: el repositorio incluye comparacion con prompting estructurado de Gemini 4 (50/54, IoU medio 0,780) como referencia de techo.
- Docencia y formacion en vision-lenguaje medico: ejemplo completo de pipeline MLX con curriculo de entrenamiento, verificacion de hashes y metrica IoU documentada.
- Prototipado en Apple Silicon: permite experimentar con un modelo vision-lenguaje de 2B en 4 bits y un adaptador de 0,1 GB en un portatil con chip M1 Max o superior.
- Estudio de robustez y adherencia a formato: el conjunto de perturbaciones que preservan la informacion sirve para medir la fragilidad de la salida estructurada en modelos pequenos.

## Benchmarks y rendimiento

| Conjunto / metrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU >= 0,50 | 44/54 (81,5%) |
| Holdout oficial: IoU medio / mediana | 0,647 / 0,730 |
| Holdout oficial por clase (M / G / P) | 17/18 / 13/18 / 14/18 |
| Holdout oficial: formato valido | 54/54 |
| Robustez (3 perturbaciones x 54) | 129/162 (79,6%) |
| Piloto de desarrollo (30, seleccion de modelo) | 25/30, IoU medio 0,630 |
| Base sin ajustar, holdout oficial | 9/54, IoU medio 0,227 |
| Mejor prompting frontier (Gemini 4 estructurado), oficial | 50/54, IoU medio 0,780 |
| Objetivos 95% adherencia / 90% robustez | no alcanzados |

## Requisitos de hardware

- Entorno Apple Silicon obligatorio: el adaptador es MLX y no carga en transformers/peft.
- Repositorio total de 0,1 GB, lo que incluye el adaptador; el modelo base 4-bit se descarga aparte.
- Entrenamiento de referencia completado en 5.663 segundos sobre una M1 Max; inferencia viable en chips M1 Max o superiores.
- VRAM/unified memory estimada: no disponible en la informacion proporcionada; el base de 2B en 4 bits sugiere una huella reducida, pero no se publica cifra.
- Despliegue mediante el entorno MLX del repositorio Parallax (requirements-mlx.lock.txt, mlx-vlm 0.7.11) y el script eval.py.
- No compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parallax-brain-loc-n1024 | 2B (base) + LoRA r16 | no disponible | LoRA MLX para localizacion de tumores en RM | Apache 2.0 | Hugging Face, formato MLX |
| Base Qwen3-VL-2B-Instruct 4-bit (sin ajustar) | 2B | no disponible | Vision-lenguaje general | Apache 2.0 | Hugging Face, MLX |
| Gemini 4 con prompting estructurado | no disponible | no disponible | Modelo frontier via prompting | propietaria | API |
| Adaptadores PEFT para tareas medicas de deteccion | variable | variable | LoRA en PyTorch sobre VLMs | variable | Hugging Face |

## Limitaciones y advertencias

- Uso exclusivo en investigacion: no validado para diagnostico ni para ninguna decision clinica.
- Entrenado y evaluado con cortes 2D de un unico dataset publico (figshare, doi:10.6084/m9.figshare.1512427.v8) de un solo grupo institucional; la validacion patient-family-disjoint solo aplica dentro de ese dataset.
- Gliomas tenues y difusos presentan bordes inciertos; algunas mascaras de origen siguen estructuras no tumorales.
- Rendimiento por clase desequilibrado: 17/18 en M frente a 13/18 en G.
- No alcanza los objetivos declarados de 95% de adherencia y 90% de robustez.
- No nombra el tipo de tumor ni aporta comentario diagnostico; cualquier uso fuera de la localizacion queda fuera de su diseno.
- Es un adaptador MLX: no funciona en transformers/peft ni en stacks PyTorch, lo que limita su integracion en produccion convencional.
- La conversion 4-bit del base no registra el commit upstream, lo que complica la trazabilidad completa.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset: https://doi.org/10.6084/m9.figshare.1512427.v8
- Articulo de referencia: Cheng et al., PLoS ONE 10(10), 2015 (https://doi.org/10.1371/journal.pone.0140381)
- Articulo de referencia: Cheng et al., PLoS ONE 11(6), 2016 (https://doi.org/10.1371/journal.pone.0156575)
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
