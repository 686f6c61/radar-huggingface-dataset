# UniverseTBD/astrobridge-model-v5

## Resumen

AstroBridge Captioner (UniverseTBD/astrobridge-model-v5) es un adaptador LoRA multimodal desarrollado por UniverseTBD para generar descripciones en lenguaje natural de datos astronomicos. No es un modelo independiente: se monta sobre un `Qwen/Qwen3.5-9B` congelado y anade una pila de fusion propia (projectors, modality_identity, qformer y adapter) que permite aceptar varias modalidades de entrada, en concreto imagen, espectros y curvas de luz. El repositorio pesa 0,3 GB y solo contiene el adaptador y los pesos de la pila de fusion; el modelo base debe descargarse por separado.

El problema que aborda es la anotacion automatica y *grounded* de observaciones astronomicas: en lugar de un captioner generico de imagenes, el sistema esta entrenado para que la descripcion dependa realmente de la modalidad de entrada. La model card incluye una "groundedness gate" con pruebas de *shuffle* y ablacion que miden si la salida cambia cuando se altera o elimina la entrada de cada modalidad.

La relevancia actual es limitada pero especifica: el modelo es experimental (0 descargas, 0 likes, licencia e idiomas no declarados) y fue publicado en septiembre de 2026. Su interes esta en el enfoque de fusion multimodal aplicada a datos cientificos y en el protocolo de evaluacion de fidelidad a la entrada, mas que en su rendimiento bruto frente a modelos generalistas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen/Qwen3.5-9B) mas pila de fusion multimodal propia (projectors, modality_identity, qformer, adapter) |
| Parametros totales | 9B en el modelo base; el repositorio (0,3 GB) contiene el adaptador y la pila de fusion, sin recuento de parametros declarado |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; se hereda del modelo base Qwen/Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo sin cuantizacion (`quantization: None`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) mas `middle.pt` (pila de fusion) |

## Arquitectura y entrenamiento

La arquitectura combina un LLM denso congelado (`Qwen/Qwen3.5-9B`) con un adaptador LoRA y una pila de fusion externa que proyecta las modalidades no textuales al espacio del modelo. Segun la model card, `middle.pt` contiene los componentes `projectors`, `modality_identity`, `qformer` y `adapter`, y su recarga requiere la clase `FusionStack` del paquete `captioner` (concretamente `captioner/model/captioner.py` y la funcion `run_stage1` de `captioner/train/stage1.py`). Esto implica que el modelo no es cargable solo con `transformers` y `peft`: hace falta codigo externo no incluido en el repositorio de HuggingFace.

Los datos de entrenamiento se describen mediante un `tier_histogram` con 4.120 ejemplos de la categoria `single` y 1.318 de la categoria `joint`. No se especifica el numero total de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card tampoco documenta innovaciones de decodificacion (atencion lineal, decodificacion especulativa, etc.). Los metadatos de reproducibilidad incluyen un `config_hash` (`c3982fe3dd2423a5`) y un `git_sha` (`305aef80a955f1b1e8c188302f47ab8b393f84b0`).

## Capacidades

- Generacion de *captions* a partir de imagenes astronomicas, con descripciones que varian cuando se altera la imagen de entrada (prueba de *shuffle* con distancia de edicion media de 347,675 sobre 80 casos).
- Generacion de descripciones a partir de espectros, con sensibilidad verificada a la entrada (distancia de edicion media de 235,375 sobre 16 casos).
- Generacion de descripciones a partir de curvas de luz (distancia de edicion media de 298,5 sobre 4 casos en la prueba de *shuffle*).
- Fusion multimodal de varias modalidades en una misma generacion: el histograma de entrenamiento distingue ejemplos `single` (una modalidad) y `joint` (varias modalidades).
- Fidelidad a la entrada medible: en las pruebas de ablacion, el 100 % de los *captions* cambiaron al eliminar la modalidad correspondiente (imagen n=128, espectros n=48, curva de luz n=24).
- No hay evidencia documentada de *tool calling* / *function calling*, uso agentico, capacidades multilingues, modo de razonamiento explicito, vision general (fuera del dominio astronomico) ni audio.

## Casos de uso

- Etiquetado automatico de imagenes de surveys: procesar recortes de telescopios (tipo Legacy Survey, Hubble o JWST) y generar descripciones textuales indexables para catalogos y busquedas por lenguaje natural, aprovechando que el modelo esta entrenado especificamente sobre imagen astronomica.
- Descripcion de espectros en *pipelines* de clasificacion: integrar el adaptador tras un modulo de extraccion de espectros (por ejemplo SDSS o DESI) para producir resumenes tecnicos legibles de cada objeto antes de la revision humana.
- Anotacion de curvas de luz: generar texto descriptivo de variabilidad (transitos, estrellas variables) como paso previo al etiquetado fino o al triaje de candidatos.
- Enriquecimiento de metadatos en archivos de datos: rellenar campos de descripcion en bases de datos astronomicas o en publicaciones internas de un observatorio a partir de los productos de datos disponibles.
- Auditoria de fidelidad de *captions*: reutilizar su pila de fusion y el protocolo de *shuffle*/ablacion para comprobar si otros captioners astronomicos dependen realmente de la entrada o alucinan descripciones plausibles.
- Generacion de borradores de divulgacion cientifica: producir una primera version de texto descriptivo de una observacion que despues se revisa y edita por personal cientifico.
- Investigacion en fusion multimodal cientifica: servir como banco de pruebas para estudiar como se comportan los proyectores y el *qformer* sobre modalidades fisicas heterogeneas, reentrenando el adaptador con nuevos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye una evaluacion propia de *groundedness*, que no es comparable con benchmarks generales:

| Modalidad | Prueba | n | Metrica | Valor | null_result |
|---|---|---|---|---|---|
| Imagen | shuffle | 80 | distancia de edicion media | 347,675 | false |
| Imagen | ablacion | 128 | fraccion de captions modificados | 1,0 | false |
| Espectros | shuffle | 16 | distancia de edicion media | 235,375 | false |
| Espectros | ablacion | 48 | fraccion de captions modificados | 1,0 | false |
| Curva de luz | shuffle | 4 | distancia de edicion media | 298,5 | false |
| Curva de luz | ablacion | 24 | fraccion de captions modificados | 1,0 | false |

En todos los casos el campo `null_result` es `false`, lo que indica que las pruebas no se consideraron nulas: la salida depende de la modalidad de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18-20 GB solo para los pesos del base de 9B, mas el coste de activaciones y de los codificadores de modalidad (estimacion a partir del tamano del modelo base, no publicada por el autor).
- VRAM estimada con cuantizacion de 4 bits del modelo base: en torno a 6-8 GB para los pesos, mas el *overhead* de la pila de fusion (estimacion).
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB o L40S 48 GB. Una RTX 4090 de 24 GB queda muy justa para bf16 con contexto largo y datos multimodales.
- GPU de consumo: en 4 bits el modelo base cabe en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090). No hay informacion publicada que confirme el funcionamiento en estas configuraciones.
- Opciones de despliegue: la ruta documentada es `transformers` + `peft` (`PeftModel.from_pretrained`) junto con la clase `FusionStack` del paquete `captioner`, que no esta incluido en el repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF el uso en llama.cpp/Ollama no es viable sin conversion propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables sobre alternativas comparables en la informacion proporcionada (no hay cifras de rendimiento, contexto ni licencia de modelos de la misma categoria). La busqueda web realizada no devolvio ningun enlace relacionado con el modelo ni con captioners astronomicos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniverseTBD/astrobridge-model-v5 | 9B (base) + adaptador | no disponible | solo evaluacion de groundedness (ver tabla anterior) | no disponible | publico en HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin declarar: no se puede confirmar si el uso comercial esta permitido. No debe desplegarse en produccion sin aclarar este punto con el autor.
- Idiomas sin declarar: se desconoce si el modelo genera texto en castellano o en otros idiomas distintos del ingles.
- Reproducibilidad incompleta: `middle.pt` requiere la clase `FusionStack` del paquete `captioner`, que no esta en el repositorio de HuggingFace. Sin ese codigo el modelo no es cargable tal como se documenta.
- Modelo practicamente sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks estandar publicados.
- Tamano de muestra reducido en la evaluacion: las pruebas de *shuffle* sobre espectros (n=16) y sobre curvas de luz (n=4) son demasiado pequenas para extraer conclusiones robustas.
- Riesgo de alucinacion en *captions*: aunque la prueba de ablacion muestra que la salida cambia al eliminar la modalidad, no demuestra que las afirmaciones del *caption* sean correctas respecto al objeto real; en dominios cientificos esto exige revision humana.
- Dominio muy restringido: no hay evidencia de capacidades de *tool calling*, agentes, matemáticas avanzadas ni vision general; extrapolar su uso fuera de la astronomia no esta justificado.
- Dependencia del modelo base `Qwen/Qwen3.5-9B` congelado: cualquier cambio, retirada o actualizacion de ese repositorio afecta al funcionamiento del adaptador.
- Metadatos incompletos: no se especifican tokens de entrenamiento, composicion del dataset, ni fases de alineamiento (RLHF/DPO), lo que dificulta evaluar sesgos y cobertura.
- Fecha de publicacion en 2026: conviene verificar el estado actual del repositorio antes de integrarlo en cualquier *pipeline*.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UniverseTBD/astrobridge-model-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio del paquete `captioner` y demos: no disponible (los resultados de la busqueda web no contienen enlaces relacionados con el modelo; devuelven paginas del sitio de ONECI sin relacion alguna).
