# xpanceo-team/mattergen-base

## Resumen

MatterGen es un modelo generativo de estructuras cristalinas desarrollado originalmente por Microsoft Research, publicado como parte del proyecto MatterGen para el diseno inverso de materiales inorganicos. Este repositorio concreto, `xpanceo-team/mattergen-base`, es una redistribucion del modelo base empaquetada como pipeline de la libreria `diffusers` mediante el componente `MatterGenPipeline` del paquete `crystal_diffusers`. El modelo genera estructuras cristalinas tridimensionales (redes, especies atomicas y coordenadas) de forma condicional o incondicional, lo que lo situa en la interseccion entre modelos generativos y ciencia de materiales computacional.

La relevancia de este modelo radica en su aplicacion al descubrimiento acelerado de materiales: en lugar de explorar el espacio quimico mediante simulacion de primeros principios (DFT), MatterGen aprende la distribucion de cristales estables y permite muestrear candidatos de forma mucho mas barata computacionalmente. El modelo base aqui publicado es la variante sin condicionamiento especifico, pensada como punto de partida para fine-tuning sobre propiedades objetivo (energia de formacion, banda prohibida, modulo de bulk, etc.).

La informacion disponible en este repositorio es muy limitada: no se declaran licencia, idiomas ni pipeline en los metadatos de Hugging Face, y la model card solo incluye un ejemplo de uso en Python. El tamano del repositorio es de 0,2 GB, lo que sugiere un conjunto de pesos de escala moderada, coherente con un modelo de difusion sobre grafos cristalinos y no con un modelo de lenguaje de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusion para estructuras cristalinas (implementado como `MatterGenPipeline` en `crystal_diffusers`); no disponible el detalle exacto de la red en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; la generacion se controla por `batch_size` y semilla) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la carga de ejemplo usa `use_safetensors=False`) |
| Idiomas soportados | no disponible (modelo cientifico; no procesa lenguaje natural como tarea principal) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio) |

## Arquitectura y entrenamiento

Segun la informacion disponible, el modelo se distribuye como un pipeline de difusion (`diffusers:MatterGenPipeline`) dentro de la libreria `crystal_diffusers`, un fork o adaptacion de `diffusers` orientada a la generacion de cristales. La API expuesta permite generar un lote de estructuras (`batch_size`) en un dispositivo (`device`) con una semilla determinista (`torch.Generator().manual_seed(...)`), devolviendo objetos compatibles con `pymatgen.core.Structure` y `Lattice`, lo que confirma que la salida es una estructura cristalina con red y especies atomicas.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o muestras de entrenamiento, la composicion del dataset (presumiblemente Materials Project y bases de datos cristalograficas en la version original de Microsoft Research), ni sobre si se aplicaron tecnicas de refinamiento posteriores (RLHF, DPO u otras). Tampoco se detalla si el modelo incorpora innovaciones como decodificacion especulativa, atencion lineal o mecanismos hibridos; en el contexto de MatterGen original se trata de un modelo de difusion sobre grafos con equivarianza a rotaciones y traslaciones, pero ese detalle no aparece explicitamente en la model card de este repositorio.

## Capacidades

- Generacion incondicional de estructuras cristalinas 3D en lotes, con control de semilla para reproducibilidad.
- Salida en formato compatible con `pymatgen` (`Structure`, `Lattice`), lo que facilita su integracion en flujos de simulacion y analisis.
- Integracion nativa con el ecosistema `diffusers` mediante `MatterGenPipeline` y `from_pretrained`.
- Generacion determinista opcional mediante `torch.Generator` con semilla fija.
- Capacidad de servir como modelo base para fine-tuning condicionado a propiedades fisicas (segun el proposito del proyecto MatterGen original; no confirmado en esta model card).
- Soporte de ejecucion en GPU CUDA (`device = "cuda"`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Descubrimiento de materiales inorganicos: generar lotes de estructuras candidatas con el modelo base y filtrarlas posteriormente mediante calculos DFT o potenciales interatomicos de machine learning, reduciendo el coste frente a la exploracion puramente ab initio.
- Fine-tuning sobre propiedades objetivo: partir de este checkpoint base y entrenar variantes condicionadas a energia de formacion, banda prohibida o modulo de bulk, reutilizando el pipeline `MatterGenPipeline` y el formato `pymatgen`.
- Aumento de datos para entrenamiento de potenciales interatomicos: sintetizar estructuras diversas y etiquetarlas con simulaciones para ampliar los conjuntos de entrenamiento de modelos como MACE, CHGNet o similares.
- Exploracion de polimorfos: muestrear multiples estructuras con distintas semillas para estudiar fases alternativas de una misma composicion quimica.
- Validacion de pipelines de investigacion: usar el modelo como referencia reproducible (semilla fija) en pruebas de integracion de flujos de generacion, evaluacion y filtrado de cristales.
- Prototipado en cuadernos de investigacion: generar estructuras rapidamente en una GPU de consumo para iterar sobre hipotesis antes de lanzar campanas de calculo costosas.
- Generacion de candidatos para almacenamiento de energia o catalisis: alimentar busquedas de materiales para baterias, electrolitos o catalizadores, siempre con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de metricas (por ejemplo, MAE de energia de formacion, tasa de estructuras metaestables o comparaciones con MatterGen original) ni resultados de evaluacion propios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio (0,2 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, aunque la VRAM real depende del lote y de las estructuras generadas.
- GPU recomendadas: no disponibles en la informacion proporcionada; el ejemplo de uso emplea `device = "cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por el tamano del checkpoint (0,2 GB), pero no confirmado en la model card.
- Opciones de despliegue: `diffusers` con `crystal_diffusers` y `MatterGenPipeline`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xpanceo-team/mattergen-base` (este) | Difusion generativa de cristales | no disponible | no aplica | no disponible | Hugging Face (`xpanceo-team/mattergen-base`) |
| MatterGen (Microsoft Research) | Difusion generativa de cristales | no disponible en esta ficha | no aplica | no disponible en esta ficha | Publicacion y repositorio de Microsoft Research |
| CDVAE | Autoencoder variacional para cristales | no disponible en esta ficha | no aplica | no disponible en esta ficha | Repositorio academico |
| DiffCSP | Difusion para prediccion de estructura cristalina | no disponible en esta ficha | no aplica | no disponible en esta ficha | Repositorio academico |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada; la comparativa se limita a la categoria y al tipo de tarea.

## Limitaciones y advertencias

- La model card no declara licencia; antes de cualquier uso comercial es imprescindible verificar los terminos del repositorio y, en su caso, los del proyecto MatterGen original de Microsoft Research.
- No se documentan sesgos ni evaluaciones de robustez; al ser un modelo cientifico, el riesgo principal es generar estructuras fisicamente invalidas o inestables, no sesgos sociales.
- Riesgo de alucinacion en sentido cientifico: el modelo puede producir cristales con distancias interatomicas irreales o composiciones no sintetizables; toda salida requiere validacion con DFT o potenciales interatomicos.
- La informacion sobre datos de entrenamiento, numero de parametros y composicion del dataset no esta disponible, lo que dificulta evaluar su cobertura quimica.
- El ejemplo de carga usa `use_safetensors=False` pese a que el repositorio esta etiquetado con `safetensors`; conviene revisar la compatibilidad de versiones de `crystal_diffusers` y `diffusers`.
- Solo se documenta generacion incondicional; el condicionamiento a propiedades requiere fine-tuning no incluido en este repositorio.
- No hay garantias de soporte ni mantenimiento por parte del autor (`xpanceo-team`), con 8 descargas y 0 likes en el momento de la consulta.
- No apto para tareas de lenguaje natural, vision, audio ni agentes; su uso esta acotado a la generacion de estructuras cristalinas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xpanceo-team/mattergen-base
- Proyecto MatterGen (Microsoft Research): https://www.microsoft.com/en-us/research/project/mattergen/
- Repositorio de MatterGen en GitHub (Microsoft): https://github.com/microsoft/mattergen
- Publicacion de MatterGen en Nature: https://www.nature.com/articles/s41586-025-08628-5
- Libreria `diffusers`: https://github.com/huggingface/diffusers
- `pymatgen`: https://pymatgen.org/
- Materials Project: https://materialsproject.org/
