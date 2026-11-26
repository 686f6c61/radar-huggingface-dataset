# timesmith/Inkling-2-Mini-oQ2.5e

## Resumen

Inkling-2-Mini-oQ2.5e es una cuantización mixta del modelo Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. Se trata de un checkpoint de aproximadamente 26.400 millones de parámetros (26.388.641.280 según los pesos en safetensors) que incluye tanto el modelo de lenguaje como un componente de visión de 0.318B de parámetros. La cuantización se ha realizado con la herramienta oQ de oMLX v0.8.3, aplicando precisión mixta por capas y logrando un promedio efectivo de 3.457 bits por peso.

El resultado es un repositorio de 11,6 GB que almacena el modelo completo en formato MLX, lo que lo hace apto para inferencia en hardware Apple Silicon. La distribución de bits es heterogénea: el 67,4% de los pesos lógicos se guarda a 2 bits afín con grupo de 64, mientras que un 24,2% se mantiene a 3 bits, un 5,9% a 8 bits y un pequeño remanente (2,5%) en BF16 y FP32 para preservar capas sensibles.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización agresiva (2-3 bits) sobre un modelo multimodal de tamano medio, un tipo de publicación cada vez más habitual para llevar modelos grandes a equipos de consumo. No obstante, la información pública disponible es muy limitada: no hay model card del modelo base, ni datos de entrenamiento, benchmarks o licencia declarada, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Inkling-2, tag `inkling2_loop`); detalles no disponibles |
| Parametros totales | 26.388.641.280 (lenguaje: 26.388B; vision: 0.318B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 2-bit grupo 64 (67,4%), affine 3-bit grupo 64 (24,2%), affine 8-bit grupo 64 (5,9%), BF16 (2,4%), FP32 (0,1%); promedio efectivo 3,457 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Inkling-2-Mini. El tag `inkling2_loop` sugiere una variante de la familia Inkling-2 con algun mecanismo de bucle o recurrencia, pero no se especifica en la model card ni en los metadatos. El checkpoint incluye un modulo de vision de 0.318B de parametros, lo que confirma que el modelo base es multimodal (texto e imagen), aunque se desconoce el encoder visual empleado.

Tampoco se dispone de datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de alineacion. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: se aplico oQ (oMLX v0.8.3), que asigna precision variable por tensor, manteniendo a 8 bits y BF16/FP32 las capas mas sensibles (probablemente embeddings, normas y cabezas de salida) y comprimiendo el grueso de las matrices a 2 y 3 bits con cuantizacion afin de grupo 64. El resultado ocupa 10.746 GiB en disco, con el modelo de lenguaje en 10.154 GiB y el modulo de vision en 0.593 GiB.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de 26B, por lo que se espera capacidad de generacion y razonamiento general, aunque no hay evaluaciones publicadas que lo confirmen.
- Procesamiento de vision: el checkpoint incluye 0.318B de parametros de vision, lo que indica soporte de entrada de imagenes (descripcion, VQA, OCR), si bien no se detallan las tareas exactas.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso como agente y razonamiento multi-paso: no disponible; no se documenta.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 11,6 GB permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o mas, ideal para prototipado offline sin GPU dedicada.
- Experimentacion con cuantizacion extrema: util para investigadores que quieran medir la degradacion de calidad de un modelo de 26B comprimido a 3,457 bits/peso frente al checkpoint original en BF16.
- Procesamiento de documentos con imagenes en local: el modulo de vision permite tareas de VQA o extraccion de informacion de capturas y escaneos en un equipo de sobremesa, sin enviar datos a la nube.
- Asistente personal con privacidad: al ejecutarse localmente en MLX, se puede integrar en flujos de escritorio donde los datos no deben salir del dispositivo.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para comparar oQ frente a GGUF Q4_K_M o AWQ en terminos de perplejidad y velocidad en hardware Apple.
- Base para fine-tuning ligero o adaptadores: aunque la cuantizacion limita el entrenamiento completo, el checkpoint puede servir para probar LoRA sobre capas no cuantizadas o para destilar comportamiento hacia modelos menores.
- Demos y prototipos de aplicaciones multimodales: con 11,6 GB y formato MLX, es viable montar una demo local de chat con imagenes sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 10.746 GiB en disco; en inferencia se necesita al menos esa cantidad mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: el formato es MLX, disenado para Apple Silicon (series M1, M2, M3, M4). No es directamente compatible con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en Macs con 16 GB o mas de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En GPUs NVIDIA de consumo requeriria conversion a otro formato (GGUF, AWQ), no incluida en este repositorio.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX) para Apple Silicon. Para CUDA seria necesario reconvertir los pesos.
- Latencia y throughput estimados: no disponibles; dependen del chip Apple y de la implementacion de kernels MLX para cuantizacion mixta.

## Comparativa con modelos similares

No se dispone de informacion sobre el modelo base Inkling-2-Mini ni de sus alternativas directas en la documentacion proporcionada, por lo que no es posible establecer una comparativa fiable con parametros, contexto y rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits en el 91,6% de los pesos implica una perdida de calidad previsible frente al modelo original en BF16; no se han publicado metricas de degradacion (perplejidad, benchmarks) que la cuantifiquen.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si se permite uso comercial; debe contactarse con el autor o consultarse el modelo base antes de usarlo en produccion.
- No se documentan sesgos conocidos, pero al ser un LLM entrenado con datos web es probable que herede sesgos sociales y culturales; no hay evaluaciones de seguridad publicadas.
- Riesgo de alucinacion estandar en modelos generativos, potencialmente agravado por la cuantizacion agresiva en capas de atencion y MLP.
- No se especifica la longitud de contexto soportada; el uso con contextos largos no esta garantizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (26 de noviembre de 2026), lo que sugiere que no ha pasado por validacion de la comunidad.
- El formato MLX limita el despliegue a hardware Apple; no hay versiones GGUF, AWQ ni GPTQ en este repositorio.
- El pipeline no esta declarado, por lo que la integracion automatica con `transformers` o `pipeline()` no esta garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ2.5e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponibles
