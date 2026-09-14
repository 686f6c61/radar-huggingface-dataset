# sy128/CQ3-Qwen3-4B-K16-SqueezeLLM

## Resumen

CQ3-Qwen3-4B-K16-SqueezeLLM es un checkpoint publicado por el usuario sy128 en HuggingFace, construido a partir de un modelo de la familia Qwen3 y con 4.411.424.256 parametros segun los tensores safetensors del repositorio. El nombre del repositorio indica una combinacion de cuantizacion en 3 bits ("CQ3"), agrupamiento en 16 clusters ("K16") y el algoritmo SqueezeLLM, una tecnica de cuantizacion no uniforme con descomposicion densa-dispersa publicada por SqueezeAILab (UC Berkeley). No es, por tanto, un modelo entrenado desde cero, sino una version comprimida de un modelo preentrenado ya existente.

La ficha del repositorio no incluye tarjeta de modelo, licencia, idiomas declarados, pipeline ni ningun detalle sobre calibracion, dataset de calibracion o perdida de calidad tras la cuantizacion. El tamano del repositorio, 17,7 GB, resulta llamativo: equivale aproximadamente a almacenar los 4.411 millones de parametros en 32 bits (4.411.424.256 x 4 bytes = 17,6 GB), lo que sugiere que los safetensors publicados no contienen pesos empaquetados en 3 bits, sino tensores en precision completa o intermedia, o bien una mezcla de pesos, indices y centroides sin empaquetar.

Su relevancia es de nicho y eminentemente experimental: sirve como referencia para quien investigue cuantizacion no uniforme sobre la familia Qwen3 o quiera reproducir un pipeline tipo SqueezeLLM, pero no es un artefacto listo para produccion al no existir evaluacion publicada, soporte declarado de runtimes ni licencia explicita. Con 29 descargas y 0 likes en el momento de redactar esta ficha, se trata de un repositorio de bajo uso y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3; detalles concretos no documentados en la ficha del repositorio |
| Parametros totales | 4.411.424.256 (dato real de los tensores safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen3-4B declara 32.768 tokens nativos y 131.072 con YaRN; no confirmado para esta version) |
| Tipos de cuantizacion | el nombre indica 3 bits con 16 clusters (CQ3 / K16) mediante SqueezeLLM; no confirmado ni documentado por el autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (17,7 GB en el repositorio) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura especifica, datos de entrenamiento, numero de tokens, composicion del dataset ni fases de ajuste (SFT, RLHF o DPO). El repositorio no contiene model card. Los unicos datos verificables son el numero de parametros (4.411.424.256) y el tamano total de 17,7 GB. La diferencia entre esos 4,41 mil millones de parametros y los ~4,02 mil millones que declaran las fichas publicas del Qwen3-4B base (aproximadamente 390 millones de parametros adicionales) no esta explicada y podria deberse a un vocabulario ampliado, a un modelo base distinto o a tensores auxiliares; no hay informacion para determinarlo.

La innovacion tecnica que sugiere el nombre es SqueezeLLM, un metodo de cuantizacion post-entrenamiento que combina dos ideas: cuantizacion no uniforme mediante k-means ponderado por sensibilidad (de ahi el "K16", 16 centroides o clusters) y descomposicion densa-dispersa, que mantiene en alta precision un pequeno subconjunto de pesos criticos (outliers) mientras el resto se almacena en baja precision. SqueezeLLM requiere kernels CUDA propios para recuperar el rendimiento, ya que la cuantizacion no uniforme impide usar kernels de cuantizacion estandar. No hay ninguna confirmacion por parte del autor de que se hayan aplicado exactamente esos pasos, ni de que existan kernels compatibles con este checkpoint.

## Capacidades

Las capacidades listadas a continuacion son las atribuibles al modelo base de la familia Qwen3 de ~4B, no capacidades verificadas en este checkpoint concreto. La ficha del repositorio no documenta ninguna.

- Generacion de texto en multiples idiomas y estilos, condicionada por el modelo base utilizado.
- Razonamiento de un solo paso y de varios pasos, con posible modo de pensamiento segun la variante de Qwen3 empleada.
- Generacion de codigo y resolucion de problemas matematicos basicos, dentro del rango esperable en un modelo de ~4B.
- Soporte de tool calling y function calling si el tokenizer y la plantilla de chat del modelo base se preservan intactos tras la cuantizacion.
- Capacidades multilingues: no disponibles ni declaradas en el repositorio.
- Capacidades de vision o audio: no disponibles; la familia Qwen3-4B de referencia es exclusivamente de texto.

## Casos de uso

- Investigacion en cuantizacion no uniforme: el checkpoint permite reproducir y auditar el efecto de una cuantizacion tipo SqueezeLLM con 16 clusters sobre un transformer de ~4B, comparando perplejidad y calidad de generacion frente al modelo base sin cuantizar.
- Evaluacion de tolerancia a la compresion en tareas de codigo: ejecutar el modelo sobre un conjunto tipo HumanEval o MBPP y medir la degradacion respecto al Qwen3-4B original, como paso previo a decidir si la tecnica merece adoptarse en un pipeline de despliegue.
- Pruebas de conversion de formato: usar el checkpoint como caso de estudio para escribir scripts que conviertan pesos SqueezeLLM a GGUF o a un formato compatible con vLLM, dado que no existe conversion oficial publicada.
- Despliegue en hardware limitado tras reconversion: si finalmente se empaquetan los pesos a 3-4 bits, el modelo ocuparia del orden de 1,7-2,2 GB, lo que lo haria candidato para inferencia en GPU de 8-12 GB o en equipos de sobremesa con llama.cpp u Ollama.
- Experimentos academicos de comparacion de tecnicas de compresion: enfrentar SqueezeLLM contra GPTQ, AWQ o bitsandbytes sobre el mismo modelo base y el mismo conjunto de calibracion.
- Base para fine-tuning ligero: al ser un checkpoint de ~4,4B, es viable aplicar LoRA en una unica GPU de 24 GB, aunque la cuantizacion puede complicar el ajuste si los tensores no se dequantizan antes.
- Analisis forense de repositorios de HuggingFace: ilustra el caso de un artefacto sin model card, sin licencia y con un tamano de repo incoherente con la precision que sugiere el nombre, util como ejemplo en guias de evaluacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, ni perplejidad, ni comparacion con el modelo base, y la busqueda web realizada no ha devuelto ningun articulo, blog o discusion tecnica sobre este checkpoint.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros y del tamano del repositorio, no medidas publicadas por el autor.

- Pestana de pesos en fp16/bf16: 4.411.424.256 x 2 bytes, aproximadamente 8,8 GB.
- Pesos si la cuantizacion de 3-4 bits estuviese realmente empaquetada: del orden de 1,7-2,2 GB.
- KV cache estimada con la configuracion GQA del Qwen3-4B de referencia (36 capas, 8 cabezas KV, dimension de cabeza 128): unos 144 KiB por token en fp16, es decir, aproximadamente 1,2 GB para 8.192 tokens de contexto y 4,8 GB para 32.768 tokens. Cifra no confirmada para este checkpoint.
- VRAM total estimada: en torno a 13-14 GB para bf16 con contexto de 32k, y 3-4 GB con cuantizacion de 4 bits y contexto corto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares solo con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y en tarjetas de 12-16 GB siempre que se cuantice y se recorte el contexto.
- Opciones de despliegue: SqueezeLLM requiere sus propios kernels CUDA, por lo que vLLM, TGI, llama.cpp u Ollama no pueden ejecutar el checkpoint tal cual sin una conversion previa. No se ha publicado ningun GGUF ni adaptador para transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CQ3-Qwen3-4B-K16-SqueezeLLM | 4,41B | no disponible | no disponible | no disponible | safetensors, 17,7 GB, 29 descargas |
| Qwen3-4B (modelo base de referencia) | ~4,02B | 32.768 tokens nativos; 131.072 con YaRN | no disponible en la informacion proporcionada | Apache-2.0 | pesos safetensors y versiones GGUF de la comunidad |
| Llama-3.2-3B-Instruct | ~3,21B | 131.072 tokens | no disponible en la informacion proporcionada | Llama 3.2 Community License | pesos safetensors y GGUF ampliamente soportados |
| Qwen3-4B cuantizado con GPTQ o AWQ | ~4,02B | el del modelo base | no disponible en la informacion proporcionada | Apache-2.0 (heredada) | integraciones estandar en vLLM y TGI |

Nota: los datos de contexto y licencia de las filas de referencia proceden de las fichas publicas de esos modelos y no de la informacion aportada sobre este repositorio; se incluyen unicamente como marco de comparacion. No hay datos de rendimiento de ninguno de ellos en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, calibracion, hiperparametros de cuantizacion ni resultados de evaluacion.
- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial permitido, y la licencia del modelo base (Apache-2.0 en el caso de Qwen3) no queda necesariamente heredada por el hecho de publicar un derivado.
- Riesgo de degradacion por cuantizacion: las tecnicas de 3 bits suelen provocar perdida de calidad en tareas de razonamiento y codigo; no hay ninguna medicion publicada que cuantifique ese dano en este checkpoint.
- Incoherencia entre nombre y contenido: el nombre sugiere 3 bits, pero los 17,7 GB del repositorio corresponden a unos 32 bits por parametro, lo que hace dudar de que los pesos esten realmente empaquetados y complica su uso directo.
- Compatibilidad limitada: no se ha confirmado soporte en transformers, vLLM, llama.cpp, Ollama ni TGI, y SqueezeLLM necesita kernels CUDA especificos.
- Idiomas no declarados: se desconoce si la cuantizacion ha degradado de forma desigual el rendimiento entre idiomas.
- Riesgo de alucinacion: inherente a cualquier modelo de ~4B, agravado por la compresion y no evaluado en este caso.
- Contexto no verificado: no hay confirmacion de que la ventana de contexto del modelo base se preserve tras la cuantizacion.
- Sesgos: no evaluados ni documentados; se heredan los del corpus de entrenamiento del modelo base, desconocido en este repositorio.
- Madurez: 29 descargas y 0 likes indican ausencia de validacion por parte de la comunidad; no es recomendable para produccion sin una evaluacion propia y exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/sy128/CQ3-Qwen3-4B-K16-SqueezeLLM
- Paper de SqueezeLLM (referencia externa al repositorio, no obtenida de la busqueda web): https://arxiv.org/abs/2306.07629
- Repositorio de referencia de SqueezeLLM (referencia externa, no obtenida de la busqueda web): https://github.com/SqueezeAILab/SqueezeLLM
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las unicas entradas devueltas corresponden a portales de venta de entradas (viagogo.de), sin relacion alguna con el modelo ni con cuantizacion de redes neuronales.
