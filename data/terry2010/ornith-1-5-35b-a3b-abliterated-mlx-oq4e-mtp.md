# terry2010/Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje y vision de tipo Mixture-of-Experts (MoE) desarrollado por ornith-ai, con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones de parametros activos por token. La arquitectura combina capas hibridas GatedDeltaNet con atencion clasica y 256 expertos enrutados (8 activos por token), lo que permite un coste de inferencia cercano a un modelo de 3B pese a la capacidad de uno de 35B. Esta ficha documenta una build concreta publicada por terry2010: una cuantizacion MLX de precision mixta (oQ4e, ~4,9 bits por peso, ~20 GB) del checkpoint abliterated de huihui-ai, con una cabeza MTP (Multi-Token Prediction) de decodificacion especulativa injertada y la torre de vision preservada.

El modelo resuelve el problema de desplegar un VLM MoE de gran capacidad en hardware Apple Silicon sin renunciar a la modalidad visual. Frente a los pesos en bf16 (~70 GB), esta build ocupa unos 20 GB y decodifica a 67 tok/s en un M4 Pro de 64 GB, cifra que sube a 76-81 tok/s con la cabeza MTP activada (aceptacion de borrador del ~66%). Es relevante ahora porque demuestra que la decodificacion especulativa con cabeza injertada funciona sobre pesos cuantizados y ablacionados, siempre que la cabeza donante proceda de una distribucion de entrenamiento compatible.

La build hereda la ablacion de rechazos del checkpoint upstream (capas 11-29), que el propio autor de la ablacion describe como una prueba de concepto tosca. Se trata, por tanto, de un artefacto de investigacion sin censura, con licencia MIT, pensado para experimentacion local y no para exposicion publica sin una capa de moderacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GatedDeltaNet + atencion, Mixture-of-Experts (256 expertos enrutados, 8 activos), con torre de vision |
| Parametros totales | ~35.000 millones (35B) |
| Parametros activos | ~3.000 millones (3B) por token |
| Longitud de contexto | 256K tokens (segun la receta de despliegue del modelo base en vLLM) |
| Tipos de cuantizacion | oQ4e de oMLX (precision mixta calibrada con imatrix, ~4,9 bpw, tensores no cuantizados en bf16); cabeza MTP en 4 bits; existen variantes MLX de 6 bits del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 5 shards `model-0000{1..5}-of-00005.safetensors` (~20 GB) + `model-mtp.safetensors` (0,49 GB) |

## Arquitectura y entrenamiento

El tronco es un MoE hibrido: capas GatedDeltaNet (atencion lineal con estado recurrente) intercaladas con atencion clasica, y una capa de enrutamiento que selecciona 8 de 256 expertos por token. Esta combinacion reduce el coste de atencion en contextos largos (hasta 256K) manteniendo la calidad de un modelo denso de mayor tamano. El checkpoint incluye una torre de vision integrada en el propio safetensors, por lo que no requiere un fichero proyector separado y debe cargarse con `mlx-vlm` (usar `mlx-lm` eliminaria la torre).

Sobre el entrenamiento original no se dispone de datos en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO): no disponible. Lo que si esta documentado es la cadena de derivacion de esta build: (1) base `ornith-ai/Ornith-1.5-35B-A3B` (MIT); (2) ablacion de rechazos en `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated`, aplicada sobre las capas 11-29; (3) cuantizacion oQ4e de oMLX con calibracion imatrix; (4) injerto de una cabeza MTP de 4 bits (44 tensores `language_model.mtp.*`, `mtp_num_hidden_layers: 1`) extraida de `KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit`, cuyo origen es un derivado con injerto de Qwen3.6 de EryriLabs. La innovacion tecnica destacable es ese injerto: una cabeza de decodificacion especulativa que acelera la generacion un 14-20% con una aceptacion de borrador del 62,6-69,9%.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat verificada y toggle `enable_thinking` funcional en ambos sentidos.
- Razonamiento explicito en modo thinking: el modelo emite una traza `<think>` por defecto; en la comprobacion del autor, desactivarlo produjo una respuesta incorrecta en una comparacion numerica limite que la traza resolvia bien.
- Comprension de imagen (image-text-to-text): analisis de imagenes con modos de fallo coherentes con el modelo base sobre la misma entrada.
- Contexto largo: recuperacion de aguja (needle) 3/3 a ~8,6k tokens en profundidades del 15%, 50% y 85%.
- Generacion de codigo: el benchmark de velocidad del autor usa generacion de codigo de 600 tokens como caso de prueba.
- Sin censura de rechazos: responde a peticiones que un modelo stock declina (ver limitaciones).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de documentos con imagenes en local: cargar el checkpoint con `mlx-vlm`, pasar `--image` y obtener descripcion o extraccion de datos de capturas, diagramas o formularios sin salir del Mac, gracias a la torre de vision integrada y a los ~20 GB de huella.
- Asistente de codigo en estacion Apple Silicon: con la cabeza MTP activada el modelo genera codigo a 81 tok/s en un M4 Pro, suficiente para autocompletado interactivo y explicacion de fragmentos en el IDE mediante un servidor compatible con OpenAI (oMLX, LM Studio).
- Procesamiento de repositorios o contratos largos: la ventana de 256K tokens permite ingerir lotes de documentos completos en una sola pasada para resumen, busqueda semantica interna o preguntas y respuestas sobre el conjunto.
- Prototipado de pipelines de razonamiento: el modo thinking permite generar cadenas de razonamiento para tareas de matematicas o logica donde la latencia no es critica, y desactivarlo cuando prima el throughput.
- Investigacion sobre alineacion y ablacion: el modelo sirve como sujeto de estudio para medir cuanto degrada la capacidad una ablacion superficial (capas 11-29) frente a builds estilo Heretic, con la pantalla de rechazos documentada (100 prompts danables + 100 benignos).
- Servidor de inferencia privado para pruebas de red teaming: desplegado tras una capa de moderacion propia, permite evaluar respuestas a prompts danables en un entorno controlado sin depender de APIs externas.
- Evaluacion de decodificacion especulativa: la build incluye `run_validation.py` y `validation-summary.json` para reproducir el A/B de MTP y comparar donantes de cabeza, un caso practico para quien investiga aceleracion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos medidos son de validacion funcional y velocidad, autoinformados por el autor sobre este checkpoint cuantizado en un Mac mini M4 Pro de 64 GB con `mlx_vlm`:

| Prueba | Resultado |
|---|---|
| Carga en frio (`mlx_vlm`) | 5,0 s, generacion limpia |
| Plantilla de chat | Renderiza correctamente; toggle `enable_thinking` verificado; sin tokens especiales filtrados |
| Vision | Analisis de imagen correcto; modos de fallo coherentes con el modelo base |
| Integridad del injerto MTP | 44 tensores `language_model.mtp.*` presentes; `mtp_num_hidden_layers: 1` |
| Aguja en contexto largo | 3/3 a ~8,6k tokens (15% / 50% / 85% de profundidad) |
| Pantalla de rechazos, prompts danables | 20/100 marcados por palabras clave; ~2-4/100 rechazos genuinos tras revision manual |
| Pantalla de rechazos, prompts benignos | 0/100 rechazos reales (4 coincidencias eran declaraciones de honestidad de capacidad) |
| Velocidad de decodificacion, MTP off | 67,2-67,5 tok/s |
| Velocidad de decodificacion, MTP on | 76,4 tok/s (ensayo) / 81,0 tok/s (codigo), +14-20% |
| Aceptacion de borrador MTP | ~66% (62,6-69,9% entre ejecuciones) |

Nota metodologica del autor: la cabeza MTP bf16 de shisa-ai, destilada contra el tronco stock, resulto un ~8% mas lenta que MTP off sobre este checkpoint ablacionado (70,5 frente a 76,6 tok/s); la eleccion del donante determina el signo del speedup.

## Requisitos de hardware

- VRAM/ memoria unificada: ~20 GB para los pesos oQ4e mas el overhead de contexto y la cabeza MTP (0,49 GB). En Apple Silicon se usa memoria unificada, no VRAM dedicada.
- Hardware validado: Mac mini M4 Pro con 64 GB, 67 tok/s sin MTP y 76-81 tok/s con MTP.
- Referencia del modelo base en bf16: ~70 GB, desplegable en 2 GPUs de 80 GB (A100/H100) con margen para el contexto de 256K segun la receta oficial de vLLM.
- GPU consumer: esta build MLX no aplica a GPU NVIDIA; las variantes GGUF o el checkpoint bf16 requeririan cuantizacion adicional para caber en una RTX 4090 (24 GB), y aun asi el bf16 no cabe.
- Despliegue: `mlx-vlm` para inferencia directa con vision; oMLX o LM Studio como servidores compatibles con OpenAI; vLLM con `--tensor-parallel-size` para el modelo base en GPUs; llama.cpp/Ollama no estan documentados para esta build MLX.
- Latencia/throughput: 67 tok/s base y 76-81 tok/s con MTP en M4 Pro 64 GB; sin datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Ornith-1.5-35B-A3B (oQ4e + MTP, esta build) | 35B totales, ~3B activos | 256K | MLX safetensors ~20 GB, MIT | Abliterated, vision, MTP con +14-20% de velocidad |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit | 35B totales, ~3B activos | 256K | MLX 6 bits, MIT | Checkpoint stock sin ablacion; mayor precision, mayor huella |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35B totales, ~3B activos | 256K | safetensors bf16, MIT | Ablacion upstream (capas 11-29), sin cuantizacion MLX ni MTP |
| KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit | 35B totales, ~3B activos | 256K | MLX 4 bits, MIT | Donante de la cabeza MTP; derivado con injerto Qwen3.6 |

## Limitaciones y advertencias

- Modelo sin censura: la ablacion suprime el comportamiento de rechazo en los pesos; respondera a peticiones que un modelo stock declina. No exponerlo como endpoint publico sin moderacion propia.
- Ablacion superficial: cubre solo las capas 11-29 y el autor upstream la califica de prueba de concepto tosca; los rechazos genuinos residuales se estiman en ~2-4/100, con muchos casos de cumplimiento enmarcado (explicaciones con descargos) que un filtro por palabras clave marcaria como danables.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modo thinking por defecto parece mejorar la precision en casos limite, pero no hay evaluacion sistematica.
- Idiomas: no disponible; no hay lista de lenguas soportadas ni evaluacion multilingue.
- Contexto: la aguja se valido solo a ~8,6k tokens, muy por debajo de los 256K declarados; el rendimiento real en contextos extremos no esta medido en esta build.
- Licencia MIT permite uso comercial, pero la responsabilidad legal del uso de un modelo sin censura recae en el desplegador.
- Dependencia de Apple Silicon: el formato MLX no se ejecuta en CUDA; para GPUs NVIDIA hay que recurrir al checkpoint bf16 o a otras cuantizaciones.
- Fragilidad del injerto MTP: una cabeza donante con distribucion incompatible puede ralentizar la inferencia; el speedup no es universal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por terceros.

## Enlaces

- [terry2010/Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp (Hugging Face)](https://huggingface.co/terry2010/Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp)
- [huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (checkpoint base)](https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated)
- [KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit (donante de la cabeza MTP)](https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit)
- [ornith-ai/Ornith-1.5-35B-A3B (modelo base)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit (variante MLX de 6 bits)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit)
