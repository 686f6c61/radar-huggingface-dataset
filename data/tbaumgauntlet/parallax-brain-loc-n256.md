# tbaumgauntlet/parallax-brain-loc-n256

## Resumen

parallax-brain-loc-n256 es un adaptador LoRA publicado por tbaumgauntlet sobre el modelo multimodal mlx-community/Qwen3-VL-2B-Instruct-4bit (revision 9c4f5209e57b31f4b9dfba735de3fb983739c9cc). Su tarea es concreta: dada una unica imagen de resonancia magnetica cerebral T1 con contraste, devuelve la caja delimitadora axis-aligned mas ajustada alrededor del tumor en formato JSON sobre una rejilla normalizada 0-1000. El modelo no clasifica el tipo de tumor ni emite comentarios diagnosticos.

El adaptador se entreno con MLX-VLM 0.7.11 sobre Apple Silicon, con rango LoRA 16 y alpha 32 aplicados a 196 capas lineales del language model; la torre de vision permanece congelada. El checkpoint publicado corresponde al punto N256 de un curriculum anidado y el propio autor advierte de que no es el modelo seleccionado: el checkpoint elegido es parallax-brain-loc-n1024. Este repositorio existe para poder regenerar la tabla de eficiencia de Parallax con eval.py.

La relevancia es de investigacion: demuestra que un adaptador LoRA pequeno (repo de 0,1 GB) sobre un VLM de 2B en 4 bits puede alcanzar un 75,9% de aciertos con IoU >= 0,50 en un holdout de 54 pacientes, frente al 16,7% del modelo base sin ajustar. Esta explicitamente marcado como research use only y no valido para diagnostico ni decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre VLM transformer (Qwen3-VL-2B-Instruct), adaptador MLX |
| Parametros totales | 2B en el modelo base (adaptador LoRA: rango 16, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 4 bits (affine, group size 64); el adaptador se distribuye en formato MLX |
| Idiomas soportados | no disponible (el prompt de referencia esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (no compatible con PyTorch/PEFT; no carga en transformers/peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-2B-Instruct, un modelo vision-language transformer. Los modulos LoRA (down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj) se insertan en 196 capas lineales del language model con rango 16, alpha 32 (escala 2,0) y dropout 0,05; la torre de vision queda congelada sin adaptadores. El base es la conversion 4-bit de mlx-community de Qwen/Qwen3-VL-2B-Instruct, y la conversion no registra el commit upstream.

El entrenamiento uso 256 slices de resonancia (curriculum anidado, posiciones 1-256: data v2 mas adiciones balanceadas) procedentes de 99 familias de pacientes de entrenamiento, con cajas derivadas de las mascaras manuales, mas 42 filas auxiliares filtradas escritas por un modelo profesor. Se realizaron 298 actualizaciones AdamW con lr 0,0001, perdida solo sobre la completion y un tiempo total de 1643 s en un M1 Max. La evaluacion aplica decodificacion greedy, parseo estricto de la respuesta y calculo de IoU contra la caja de referencia, verificando ademas el sha256 del adaptador (866b0a274bd26b33674d60282d3281e9186c109d8fa774c63dc0546609c273ae) y los hashes de los pesos del base.

## Capacidades

- Localizacion de tumores en una unica slice de RM cerebral T1 con contraste, devolviendo un unico objeto JSON con la forma {"bbox":[x1,y1,x2,y2]} en rejilla 0-1000 (origen arriba-izquierda, x a la derecha, y hacia abajo).
- Salida estrictamente estructurada: sin prosa, sin markdown, sin claves adicionales; formato valido en 54/54 casos del holdout oficial.
- Entrada image-text-to-text con una unica imagen y un unico turno de usuario (imagen primero).
- No realiza clasificacion del tipo de tumor ni comentario diagnostico por diseno del prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues especificas de este adaptador.

## Casos de uso

- Regeneracion de la tabla de eficiencia de Parallax: ejecutar eval.py con este checkpoint N256 junto a otros puntos del curriculum para reconstruir la curva de rendimiento frente al numero de slices de entrenamiento.
- Investigacion en adaptacion eficiente de VLMs: servir como referencia reproducible de que un LoRA de rango 16 sobre un modelo de 2B en 4 bits mejora sustancialmente la localizacion frente al base sin ajustar (IoU medio 0,654 frente a 0,227).
- Experimentos de prompting estructurado en imagenes medicas: el prompt fijado y la rejilla 0-1000 permiten estudiar adherencia al formato y robustez ante perturbaciones que preservan la informacion (118/162, 72,8%).
- Prototipado local en Apple Silicon: al ser un adaptador MLX de 0,1 GB sobre un base 4-bit, cabe en un portatil con memoria unificada y permite iterar sin GPU dedicada.
- Evaluacion comparativa de estrategias de anotacion: las cajas derivadas de mascaras manuales y las filas auxiliares de un profesor permiten analizar el efecto de datos sinteticos filtrados en tareas de deteccion.
- Docencia y divulgacion sobre limites de los VLM en imagen medica: el contraste entre el adaptador y el mejor prompting frontier (50/54, IoU medio 0,780) ilustra las diferencias entre ajuste fino y prompting.

## Benchmarks y rendimiento

| Conjunto / metrica | Valor |
|---|---|
| Holdout oficial (54 pacientes): IoU >= 0,50 | 41/54 (75,9%) |
| Holdout oficial: IoU medio / mediana | 0,654 / 0,737 |
| Holdout oficial por clase (M / G / P) | 17/18 / 10/18 / 14/18 |
| Holdout oficial: formato valido | 54/54 |
| Robustez (3 perturbaciones que preservan informacion x 54) | 118/162 (72,8%) |
| Piloto de desarrollo (30, usado para seleccion) | 24/30, IoU medio 0,591 |
| Base sin ajustar, holdout oficial | 9/54, IoU medio 0,227 |
| Mejor prompting frontier (Gemini 4 estructurado), oficial | 50/54, IoU medio 0,780 |
| Objetivos 95% adherencia / 90% robustez | no alcanzados |

## Requisitos de hardware

- Requiere Apple Silicon y el entorno MLX del repositorio Parallax (requirements-mlx.lock.txt, mlx-vlm 0.7.11); no funciona en CUDA ni en transformers/peft.
- VRAM/memoria unificada estimada: el base de 2B en 4 bits mas el adaptador de 0,1 GB deberia caber holgadamente en equipos con 8-16 GB de memoria unificada; no se publican cifras oficiales.
- GPU recomendadas: no aplica GPU dedicada; el autor reporta entrenamiento en un M1 Max (1643 s para 298 actualizaciones).
- Despliegue: exclusivamente via MLX-VLM y el script eval.py del repositorio Parallax; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| parallax-brain-loc-n256 | 2B (base) + LoRA r16 | no disponible | LoRA MLX para bbox de tumor en RM | apache-2.0 | IoU >= 0,50 en 41/54; punto intermedio del curriculum |
| parallax-brain-loc-n1024 | 2B (base) + LoRA | no disponible | Checkpoint seleccionado del mismo proyecto | apache-2.0 | Referenciado por el autor como modelo elegido; metricas no incluidas en la informacion disponible |
| Qwen3-VL-2B-Instruct-4bit (base sin ajustar) | 2B | no disponible | VLM generalista | apache-2.0 | 9/54, IoU medio 0,227 en el mismo holdout |
| Gemini 4 con prompting estructurado | no disponible | no disponible | Prompting frontier | propietaria | 50/54, IoU medio 0,780; no es un modelo abierto |

## Limitaciones y advertencias

- Solo slices 2D de un unico dataset publico (un grupo institucional); la evaluacion es disjunta por familia de pacientes unicamente dentro de ese dataset.
- Los gliomas tenues y difusos presentan bordes inciertos y algunas mascaras de origen siguen estructuras no tumorales, lo que introduce ruido en las cajas objetivo.
- No validado para uso clinico: research use only, no apto para diagnostico ni para ninguna decision clinica.
- No es el checkpoint seleccionado del proyecto; usarlo como modelo final iria contra la recomendacion explicita del autor.
- Es un adaptador MLX: no carga en transformers ni en peft, lo que limita su integracion en stacks PyTorch convencionales.
- La conversion 4-bit del base no registra el commit upstream de Qwen, lo que complica la trazabilidad completa.
- No alcanza los objetivos declarados de 95% de adherencia y 90% de robustez.
- Riesgo de alucinacion de cajas plausibles pero incorrectas en imagenes fuera de distribucion; el formato valido (54/54) no garantiza correccion espacial.
- No se documentan sesgos demograficos ni composicion de idiomas del adaptador; el prompt de referencia esta en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n256
- Checkpoint seleccionado: https://huggingface.co/tbaumgauntlet/parallax-brain-loc-n1024
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-2B-Instruct-4bit
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de imagenes y mascaras: doi:10.6084/m9.figshare.1512427.v8 (CC BY 4.0)
- Cheng et al., PLoS ONE 10(10), 2015: "Enhanced Performance of Brain Tumor Classification via Tumor Region Augmentation and Partition"
- Cheng et al., PLoS ONE 11(6), 2016: "Retrieval of Brain Tumors by Adaptive Spatial Pooling and Fisher Vector Representation"
- MLX-VLM: no disponible en la informacion proporcionada
- Repositorio Parallax (eval.py, requirements-mlx.lock.txt): no disponible en la informacion proporcionada
