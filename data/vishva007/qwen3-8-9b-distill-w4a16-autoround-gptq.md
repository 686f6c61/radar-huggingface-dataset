# Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound-GPTQ

## Resumen

Qwen3.8-9B-Distill-W4A16-AutoRound-GPTQ es una version cuantizada a 4 bits del modelo empero-ai/Qwen3.8-9B-Distill, publicada por el usuario Vishva007 en Hugging Face. La cuantizacion se ha realizado con el algoritmo AutoRound de Intel en esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), con el objetivo de reducir drasticamente los requisitos de memoria sin sacrificar las trazas de razonamiento ni las capacidades multimodales del modelo original.

El modelo base es un derivado destilado de la familia Qwen3.8 con arquitectura etiquetada como `qwen3_5` en los metadatos de Hugging Face, y el pipeline declarado es `image-text-to-text`, lo que indica soporte de entrada de imagen y texto. La model card menciona explicitamente la preservacion de bloques `<think>` (modo de razonamiento) y de la torre de vision, que se mantiene en BF16 para no degradar el razonamiento visual ni el OCR.

La relevancia practica de esta ficha radica en que comprime un modelo que en BF16 requeria aproximadamente 8-10 GB de VRAM hasta un rango de 2,5-3,5 GB, permitiendo su despliegue en GPUs de consumo de 4-6 GB, portatiles y dispositivos de borde. No obstante, existe una discrepancia notable entre el nombre del repositorio ("9B") y el recuento real de parametros de los pesos safetensors (2.491.309.296, es decir, unos 2,49 mil millones), que debe tenerse en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), con torre de vision y modulo de prediccion multi-token (MTP) |
| Parametros totales | 2.491.309.296 segun los pesos safetensors del repositorio (el nombre del repo indica "9B"; discrepancia no aclarada por el autor) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), grupo de tamano 32, simetrica (`sym=True`); torre de vision y modulos MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoGPTQ / GPTQ); existen variantes AutoRound y LLM-Compressor / compressed-tensors |

## Arquitectura y entrenamiento

El modelo base empero-ai/Qwen3.8-9B-Distill es un modelo destilado de la familia Qwen3.8, con arquitectura de transformer multimodal identificada en los metadatos como `qwen3_5`. La model card de esta version cuantizada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo base y no se han proporcionado en la informacion disponible. La presencia de un modulo de prediccion multi-token (MTP) sugiere soporte de decodificacion especulativa o entrenamiento multi-token, aunque el autor no lo describe en detalle.

La innovacion tecnica principal de este repositorio es el proceso de cuantizacion con Intel AutoRound: calibracion con 512 muestras, longitud de secuencia de 4096, 1000 iteraciones de ajuste y grupo de 32 elementos en modo simetrico. El autor indica que la torre de vision se excluye de la cuantizacion (`quant_nontext_module: False`) y se mantiene en BF16 para preservar el razonamiento visual y la precision de OCR, y que los modulos `mtp` y `mtp.fc` tambien permanecen en bfloat16 nativo. No se documenta el proceso de destilacion del modelo base ni los datos empleados.

## Capacidades

- Generacion de texto conversacional y razonamiento con trazas explicitas en bloques `<think>`, preservadas deliberadamente durante la cuantizacion.
- Procesamiento de imagen y texto (`image-text-to-text`): la torre de vision se mantiene en BF16, lo que apunta a tareas de descripcion de imagenes, VQA y OCR.
- Razonamiento multi-paso y cadenas de pensamiento extendidas, con impacto positivo en velocidad de generacion al reducir la presion de ancho de banda de memoria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Modo de razonamiento (`thinking mode`): inferido de la mencion a los bloques `<think>` en la model card.
- Prediccion multi-token (MTP): modulo presente y mantenido en BF16, sin documentacion adicional sobre su uso en inferencia.

## Casos de uso

- Despliegue en GPUs de consumo: con un consumo estimado de 2,5-3,5 GB de VRAM en W4A16, el modelo cabe en tarjetas de 4-6 GB y en portatiles, lo que permite ejecutar razonamiento multimodal en hardware asequible.
- Asistentes locales de analisis de documentos con imagenes: al conservar la torre de vision en BF16, es adecuado para extraccion de texto (OCR) y respuesta a preguntas sobre capturas, facturas o formularios en entornos sin conectividad.
- Prototipado rapido de aplicaciones multimodales: la licencia Apache 2.0 y el formato GPTQ permiten integrar el modelo en pipelines experimentales sin restricciones comerciales.
- Servicio de inferencia de alto rendimiento con vLLM: la model card proporciona un comando de despliegue con `--dtype bfloat16`, `--max-model-len 8192` y `--gpu-memory-utilization 0.90`, orientado a servir peticiones concurrentes en una sola GPU.
- Razonamiento con cadenas de pensamiento en produccion: la cuantizacion preserva los bloques `<think>` y reduce el coste por token generado en respuestas largas de razonamiento.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir tres variantes (AutoRound, AutoGPTQ y LLM-Compressor) del mismo modelo base, sirve para medir el impacto de cada formato en calidad y latencia.
- Educacion e investigacion: permite estudiar destilacion y cuantizacion de modelos multimodales con un coste de hardware minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta estimaciones de memoria y una afirmacion cualitativa sobre la aceleracion de la generacion de tokens, sin cifras de MMLU, HumanEval, GSM8K ni metricas multimodales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3,5 GB en W4A16 con grupo 32, segun el autor; el modelo original en BF16 requeria unos 8-10 GB.
- GPU recomendadas: el autor no especifica modelos concretos; por el perfil de memoria, cabe en GPUs de consumo de 4-6 GB y en cualquier GPU profesional (A100, H100, L40S) con margen amplio.
- GPU de consumo: si, en tarjetas de 4 GB o superiores; el tamano del repositorio (10,0 GB) incluye pesos en varios formatos, pero la carga en memoria es mucho menor.
- Opciones de despliegue: vLLM (comando documentado en la model card), AutoGPTQ para la variante GPTQ, AutoRound para la variante nativa y LLM-Compressor / compressed-tensors para la variante compatible con vLLM. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas; el autor afirma que la cuantizacion reduce la presion de ancho de banda de memoria y acelera la generacion durante razonamientos extendidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound-GPTQ (este) | 2,49 mil millones (pesos reales) | no disponible (ejemplo con 8192) | safetensors GPTQ, W4A16 | Apache 2.0 | Variante AutoGPTQ del destilado multimodal |
| Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound | no disponible | no disponible | AutoRound | Apache 2.0 | Mismo modelo base, formato nativo AutoRound |
| Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound-LLM-Compressor | no disponible | no disponible | compressed-tensors | Apache 2.0 | Mismo modelo base, formato para vLLM |
| empero-ai/Qwen3.8-9B-Distill | no disponible | no disponible | BF16 | no disponible | Modelo base sin cuantizar; ~8-10 GB de VRAM |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre del repositorio indica 9B, pero los pesos safetensors suman 2.491.309.296 parametros; conviene verificar el modelo base antes de asumir capacidades asociadas a un modelo de 9B.
- Perdida de calidad por cuantizacion: aunque AutoRound con 1000 iteraciones y grupo 32 busca minimizar la degradacion, no se publican evaluaciones que cuantifiquen la perdida respecto al modelo BF16.
- Idiomas soportados no documentados: no es posible garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos generativos y no mitigado de forma documentada; el modo de razonamiento con bloques `<think>` no elimina este riesgo.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aclara las condiciones del modelo base ni de los datos de destilacion; conviene revisar la licencia de empero-ai/Qwen3.8-9B-Distill.
- Soporte de tool calling y agentes no confirmado: no se documenta en la model card.
- Contexto maximo no declarado: el ejemplo de vLLM usa 8192 tokens, pero no se confirma que sea el limite real del modelo.
- Ecosistema limitado: 107 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Contenido promocional: la model card incluye enlaces de referencia a RunPod y plantillas de despliegue ajenas a la descripcion tecnica del modelo.

## Enlaces

- Repositorio Hugging Face (GPTQ): https://huggingface.co/Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound-GPTQ
- Variante AutoRound: https://huggingface.co/Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound
- Variante LLM-Compressor / compressed-tensors: https://huggingface.co/Vishva007/Qwen3.8-9B-Distill-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Algoritmo Intel AutoRound: https://github.com/intel/auto-round
