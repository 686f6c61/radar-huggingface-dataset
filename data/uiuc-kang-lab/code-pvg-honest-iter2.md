# uiuc-kang-lab/code-pvg-honest-iter2

## Resumen

Code PVG honest iter2 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-35B-A3B-Base, publicado por el grupo de investigacion uiuc-kang-lab. Se trata de un checkpoint intermedio (paso de entrenamiento 260) seleccionado por su comportamiento "honest" dentro de un proceso de entrenamiento etiquetado como PVG (la model card no desarrolla el acronimo). El repositorio contiene unicamente los pesos del sampler del adaptador, no el modelo base ni el estado del optimizador.

El modelo hereda la arquitectura del base: un transformer de tipo Mixture of Experts con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token (la nomenclatura "A3B" del nombre del base asi lo indica). El adaptador anade un pequeno conjunto de pesos entrenados para una tarea orientada a codigo, segun la etiqueta "code" del repositorio.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un artefacto de investigacion con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de evaluacion publicados. Es util como referencia para quienes reproduzcan el pipeline de entrenamiento del laboratorio o quieran inspeccionar el adaptador, pero no constituye un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (base: Qwen/Qwen3.5-35B-A3B-Base) |
| Parametros totales | 35B en el modelo base; el adaptador LoRA no declara su numero de parametros (repo de 2,2 GB) |
| Parametros activos | ~3B en el modelo base (segun nomenclatura A3B); no disponible para el adaptador |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA; requiere el modelo base por separado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-35B-A3B-Base, un transformer con capas de mezcla de expertos (MoE) en el que solo una fraccion de los 35B parametros se activa por token (del orden de 3B, segun la convencion de nombres del modelo base). El adaptador LoRA introduce matrices de bajo rango en determinadas capas, lo que permite especializar el modelo con un coste de almacenamiento reducido: el repositorio ocupa 2,2 GB frente a las decenas de GB que requeriria un ajuste completo.

El entrenamiento se realizo con la herramienta Tinker (etiqueta "tinker" en el repositorio) y el checkpoint publicado corresponde al paso 260, seleccionado por su comportamiento "honest" dentro de un proceso de iteracion (iter2). La model card no especifica el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se detalla la configuracion del LoRA (rango, alpha, capas objetivo). El repositorio incluye un fichero `checkpoint.json` con el checkpoint de origen y los checksums SHA-256, pero no el estado del optimizador.

## Capacidades

- Generacion de texto y codigo: la etiqueta "code" del repositorio sugiere especializacion en tareas de programacion, aunque no se documenta el alcance exacto.
- Razonamiento y generacion general: heredadas del modelo base Qwen3.5-35B-A3B-Base, no verificadas de forma independiente para este adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponible en la informacion proporcionada.
- Comportamiento "honest": el checkpoint se selecciono por esta propiedad, pero la model card no define como se mide ni que implica exactamente.

## Casos de uso

- Investigacion sobre alineacion y honestidad: el adaptador se selecciono por su comportamiento "honest" en el paso 260, por lo que es util para reproducir y analizar ese criterio de seleccion dentro del pipeline del laboratorio.
- Reproduccion de experimentos del grupo uiuc-kang-lab: permite reanudar la evaluacion del checkpoint sin reentrenar, cargando el LoRA sobre el base y comparando con otras iteraciones.
- Analisis de adaptadores LoRA sobre MoE: sirve como caso de estudio de como un adaptador de bajo rango modifica el comportamiento de un modelo con 35B parametros totales y ~3B activos.
- Generacion de codigo en entornos controlados de investigacion: la etiqueta "code" indica orientacion a programacion, aunque sin benchmarks publicados no puede recomendarse para produccion.
- Comparacion de checkpoints intermedios: al publicarse como "iter2" en el paso 260, permite estudiar la evolucion del entrenamiento frente a iteraciones anteriores o posteriores.
- Base para experimentos de ajuste adicional: al ser un adaptador LoRA ligero (2,2 GB), puede combinarse o continuar entrenandose con recursos modestos una vez cargado el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 35B parametros totales; en precision bf16 requiere del orden de 70 GB solo para pesos, mas memoria para el adaptador y el contexto. En cuantizacion de 4 bits podria situarse en torno a 20-25 GB, aunque no se publican variantes cuantizadas de este adaptador.
- GPU recomendadas: A100 80 GB o H100 para inferencia en bf16; configuraciones multi-GPU para entrenamiento o contextos largos.
- GPU de consumo: un adaptador LoRA de 2,2 GB por si solo cabe en cualquier GPU moderna, pero la inferencia requiere cargar el modelo base completo, lo que descarta GPUs de consumo con menos de 24 GB salvo cuantizacion agresiva no publicada.
- Opciones de despliegue: al ser un adaptador LoRA en safetensors, puede cargarse con las librerias de Hugging Face (transformers + peft) sobre el base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Code PVG honest iter2 (este) | 35B totales / ~3B activos (base) | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador LoRA de investigacion, sin benchmarks |
| Qwen/Qwen3.5-35B-A3B-Base | 35B totales / ~3B activos | no disponible | no disponible | Hugging Face (modelo base) | Requerido para usar el adaptador |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion de modelos comparables en la busqueda |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es minima y no describe datos de entrenamiento, hiperparametros ni criterios de evaluacion.
- Sin licencia declarada: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Sin benchmarks: no hay evidencia publicada de rendimiento en codigo, razonamiento ni multilingueismo.
- Artefacto de investigacion: cero descargas y cero "likes" en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Requiere el modelo base por separado: el repositorio solo contiene el adaptador; sin Qwen/Qwen3.5-35B-A3B-Base el modelo no es funcional.
- Riesgo de alucinacion y sesgos: no evaluados para este adaptador; se heredan los del modelo base, que tampoco se documentan aqui.
- Checkpoint intermedio: el paso 260 no es necesariamente el estado final del entrenamiento, por lo que puede presentar comportamiento inestable.
- Limitaciones de contexto e idioma: no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/uiuc-kang-lab/code-pvg-honest-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este adaptador.
