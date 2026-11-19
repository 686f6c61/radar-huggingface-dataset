# SZLHOLDINGS/salad-formula-proving-ground-r1

## Resumen

`salad-formula-proving-ground-r1` es un adaptador LoRA de tipo PEFT desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. Se presenta como un artefacto de entrenamiento candidato, no como un modelo de produccion publicado, y forma parte del programa interno de entrenamiento gobernado de la organizacion, denominado Salad. El adaptador esta orientado a generacion de texto en ingles y se distribuye con licencia Apache 2.0.

El modelo base Qwen2.5-Coder-3B-Instruct es un transformer decoder-only de 3.000 millones de parametros, especializado en tareas de codigo e instrucciones, con una ventana de contexto de 32.768 tokens. El adaptador anade un ajuste fino LoRA entrenado sobre el dataset interno `SZLHOLDINGS/formula-proving-ground`, cuyo contenido concreto no se detalla en la informacion disponible.

La relevancia de esta ficha es limitada desde el punto de vista de adopcion en produccion: el repositorio no registra descargas ni interacciones, el entrenamiento se realizo en una unica RTX 3090 durante 200 pasos (2.328,6 segundos) y el autor lo etiqueta explicitamente como candidato. Su interes es principalmente documental, como ejemplo de trazabilidad de entrenamiento con medicion de energia dual (NVML y Zeus).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.000 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredada); no se especifica si el adaptador la modifica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); checkpoints intermedios en el repositorio |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Etapa | artefacto de entrenamiento candidato |
| Pasos de entrenamiento | 200 de 200 |
| Duracion del entrenamiento | 2.328,6 s (2026-11-15) |
| Energia medida | NVML 122.476 J / Zeus 122.277 J |
| Hardware de entrenamiento | NVIDIA RTX 3090 |

## Arquitectura y entrenamiento

El adaptador emplea Low-Rank Adaptation (LoRA) mediante la libreria PEFT sobre el transformer decoder-only Qwen2.5-Coder-3B-Instruct. No se especifican en la informacion disponible el rango (r), el alpha, las capas objetivo ni el dropout del adaptador. El repositorio incluye una escalera completa de checkpoints en los pasos 50, 100, 150 y 200, ademas de un directorio `final/`.

El entrenamiento se ejecuto sobre contenedores GPU de Salad bajo lo que el autor denomina doctrina de entrenamiento receipted fail-closed: emision de recibos honestos, sin recuentos ni marcas temporales fabricadas, y medicion de energia dual mediante NVML y Zeus. El dataset utilizado es `SZLHOLDINGS/formula-proving-ground` (fichero `proving-ground.json`), cuyo contenido, numero de tokens y composicion no se detallan. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. Los recibos de heartbeat y finalizacion se alojan en los registros del lane `SZLHOLDINGS/frontier-54-runs`.

## Capacidades

- Generacion de texto en ingles heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Generacion y asistencia en codigo, dado el sesgo del modelo base hacia tareas de programacion.
- Seguimiento de instrucciones conversacionales, segun el ajuste instruct del modelo base.
- Soporte de tool calling y function calling: no confirmado para el adaptador en la informacion disponible; el modelo base Qwen2.5-Coder-Instruct lo soporta de forma nativa.
- Razonamiento multi-paso y uso como agente: no confirmado para el adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Evaluacion experimental de adaptadores LoRA: el repositorio ofrece una escalera de checkpoints (50/100/150/200) util para estudiar la evolucion del ajuste fino paso a paso en un entorno controlado.
- Reproduccion de pipelines de entrenamiento con trazabilidad energetica: sirve como referencia para implementar medicion dual NVML/Zeus en entrenamientos de bajo coste sobre GPU de consumo.
- Asistencia a la generacion de codigo en ingles: al heredar el modelo base Qwen2.5-Coder-3B-Instruct, puede emplearse en autocompletado y explicacion de fragmentos de codigo, previa validacion de que el adaptador no degrada el rendimiento base.
- Prototipado de tareas de demostracion de formulas: dado el nombre del dataset de entrenamiento, podria orientarse a la verificacion o explicacion de expresiones formales, aunque el contenido real del dataset no esta documentado y requiere validacion empirica.
- Investigacion sobre entrenamiento gobernado: el modelo y sus recibos asociados permiten auditar el cumplimiento de la doctrina receipted fail-closed en un caso real.
- Base para futuros ajustes: al ser un adaptador LoRA ligero (repositorio de 0,7 GB), puede combinarse o sustituirse facilmente en experimentos posteriores sin necesidad de reentrenar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3.000 millones de parametros requiere aproximadamente 6-7 GB en FP16/BF16 y alrededor de 2-3 GB en cuantizacion de 4 bits. El adaptador LoRA anade una sobrecarga minima (repositorio de 0,7 GB con todos los checkpoints).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El entrenamiento documentado se realizo en una RTX 3090.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama para el modelo base fusionado, aunque la compatibilidad del adaptador con estos motores no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-formula-proving-ground-r1 | 3B (base) + LoRA | 32.768 (heredado) | Apache 2.0 | safetensors (LoRA) | Artefacto candidato, sin benchmarks publicados |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base, ampliamente evaluado y desplegable |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa mas ligera de la misma familia |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128.000 | DeepSeek License | safetensors | Mayor contexto y capacidad, licencia mas restrictiva |

## Limitaciones y advertencias

- El autor etiqueta explicitamente el modelo como artefacto de entrenamiento candidato, no como modelo de produccion publicado.
- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce si el adaptador mejora, mantiene o degrada el rendimiento del modelo base.
- El repositorio no registra descargas ni interacciones, lo que impide cualquier validacion por parte de la comunidad.
- El contenido y la calidad del dataset `formula-proving-ground` no estan documentados, por lo que no puede evaluarse el riesgo de sobreajuste ni de sesgos introducidos.
- El soporte linguistico declarado se limita al ingles; el comportamiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion inherente al modelo base, no cuantificado para este adaptador.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluaciones hace desaconsejable su despliegue en produccion sin una validacion exhaustiva previa.
- No se especifican los hiperparametros del adaptador (r, alpha, capas objetivo), lo que dificulta su reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-formula-proving-ground-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/formula-proving-ground
- Registros del lane de entrenamiento: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
