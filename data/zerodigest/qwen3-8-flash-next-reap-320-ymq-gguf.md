# zerodigest/Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF

## Resumen

Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF es una compilacion cuantizada en formato GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario zerodigest bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado al que se le han aplicado dos transformaciones sobre el modelo base: una poda selectiva de expertos mediante REAP (K=320 expertos por capa de enrutamiento MoE) y una cuantizacion de precision mixta dependiente de la arquitectura mediante la herramienta YMQ-Compiler v2.0.

El modelo base se describe como una arquitectura dispersa de mezcla de expertos (MoE) con componentes hibridos de espacio de estados tipo Mamba (SSM). El recuento de parametros en safetensors del modelo base es de 131.621.823.360, aunque la etiqueta del autor indica "113b" sin aclarar a que magnitud corresponde. El repositorio ocupa 67,5 GB y el unico preset documentado, M-TI, pesa aproximadamente 63 GB, lo que situa al modelo en el rango de estaciones de trabajo multigpu, no de GPU de consumo unica.

Su relevancia es experimental: explora si la combinacion de poda de expertos guiada por importancia y cuantizacion por capas permite conservar calidad en modelos MoE muy grandes. La model card no publica resultados de perplejidad ni divergencia KL (aparecen como TBD), el repositorio registra 0 descargas y 0 likes, y no se documentan idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa con componentes hibridos de espacio de estados Mamba (SSM), segun la model card |
| Parametros totales | 131.621.823.360 en safetensors del modelo base; la etiqueta del autor indica "113b" sin especificar la magnitud |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona evaluacion de perplejidad sobre una ventana de 4096 tokens y "optimizacion de alto contexto", pero no declara la ventana maxima) |
| Tipos de cuantizacion | GGUF de precision mixta por capas: Q8_0 (expertos compartidos), Q5_K (atencion), y expertos en Q6_K, IQ4_NL, IQ3_XXS e IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (preset M-TI, ~63 GB); el modelo base se distribuye en safetensors |
| Fecha de publicacion | 2026-10-03 |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Presets publicados | M-TI (unico preset documentado en la model card) |

## Arquitectura y entrenamiento

La model card describe el modelo base como una arquitectura MoE dispersa de gran tamano con seguimiento de estado mediante Mamba/SSM, lo que la situa en la familia de arquitecturas hibridas transformer-SSM. Sobre ese checkpoint, el autor aplica REAP con K=320: un manifiesto de importancia (`seleccion_mass_K320.json`) selecciona los 320 mejores espacios de experto por cada capa de enrutamiento MoE, calculados a partir de la masa de activacion por token recogida sobre prompts de calibracion. El resultado es una poda permanente de las rutas menos activadas, no una poda uniforme.

La segunda etapa es YMQ-Compiler v2.0, que asigna niveles de precision por capa mediante analisis de clustering en espacio logaritmico de la matriz de importancia: las capas de experto de mayor influencia se elevan a Q6_K o IQ4_NL, mientras que los expertos de baja actividad se comprimen hasta IQ2_XS como suelo. Los expertos compartidos se protegen con Q8_0 y la atencion con Q5_K. La model card afirma soporte nativo de motores de especulacion de prediccion multi-token (MTP) en paralelo y parametros de optimizacion de contexto largo orientados a entornos de desarrollo de codigo via API. No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO: el repositorio no reentrena el modelo, solo lo poda y lo cuantiza.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso como modelo de chat, aunque no se documenta el formato de plantilla.
- Generacion de codigo: la model card declara parametros de optimizacion de contexto largo "tailored for demanding code development API execution environments (such as RooCode/Aider)".
- Prediccion multi-token (MTP) en paralelo: el autor afirma soporte nativo de motores de especulacion MTP, lo que en teoria incrementa el throughput de decodificacion.
- Razonamiento multi-paso y soporte de agentes: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio o modalidades adicionales: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.

## Casos de uso

- Asistente de codigo autoalojado en estacion de trabajo multigpu: con ~63 GB de pesos, el modelo encaja en configuraciones agregadas de 48 GB o mas, lo que permite ofrecer autocompletado y generacion de codigo en local sin depender de APIs externas.
- Integracion en entornos tipo RooCode o Aider: la model card menciona explicitamente estos entornos, de modo que el uso natural es como backend de un asistente de edicion de repositorio (hay que verificar antes el soporte real de tool calling, no documentado).
- Refactorizacion sobre bases de codigo extensas: si se confirma la "optimizacion de alto contexto" declarada, el modelo podria procesar varios ficheros o modulos en una sola pasada, reduciendo el troceado manual de contexto.
- Servicio de inferencia interno con vLLM/llama.cpp en clúster: su tamano lo hace adecuado para un endpoint privado con multiples usuarios concurrentes, siempre que se dimensione la VRAM para pesos mas cache KV.
- Investigacion en poda de expertos: el repositorio sirve como material de estudio para comparar REAP K=320 frente a poda uniforme, ya que incluye referencia al manifiesto de seleccion.
- Evaluacion de pipelines de cuantizacion: util para reproducir y contrastar la cuantizacion por capas de YMQ-Compiler frente a esquemas GGUF lineales (Q4_K_M, Q5_K_M) sobre el mismo checkpoint podado.
- Sustitucion de un despliegue del modelo base en precision alta: si la calidad se preserva, permitiria ejecutar una variante de 131,6 B de parametros en hardware que no admite el modelo base sin cuantizar.
- Generacion de codigo en pipelines de CI/CD: solo recomendable si se valida previamente la latencia y la estabilidad del formato de salida, dado que la model card no publica metricas de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de perplejidad sobre WikiText-2 (ventana de 4096, medida con `llama-perplexity`) en la que tanto la perplejidad como la divergencia KL media aparecen marcadas como TBD:

| Variante | Tamano de fichero | Perplejidad (WikiText-2) | Divergencia KL media |
|---|---|---|---|
| M-TI | ~63 GB | pendiente (TBD) | pendiente (TBD) |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 63 GB solo para los pesos del preset M-TI, mas la cache KV del contexto, que depende de la ventana configurada y no puede calcularse sin conocer la arquitectura exacta.
- GPU recomendadas: el autor indica "48GB+ workstation driver" y uso multigpu. Configuraciones plausibles segun el tamano del fichero: 2x A100 40 GB, 2x A6000 48 GB, 2x H100 80 GB, o 2-3 GPU de 24 GB agregadas mediante reparto por capas.
- GPU de consumo: no cabe en una sola GPU de consumo de 24 GB. Como referencia, 63 GB de pesos requieren al menos 3x RTX 4090 o 3x RTX 5090 de 24 GB sumando VRAM, con el coste de latencia que implica el reparto por capas.
- Opciones de despliegue: llama.cpp es el runtime confirmado, ya que la model card cita `llama-perplexity` para la evaluacion. El formato GGUF es compatible con otros runners basados en llama.cpp, pero la model card no confirma Ollama, LM Studio, TGI ni vLLM como entornos validados.
- Latencia y throughput estimados: no disponible. No se publican tokens por segundo ni tiempos de primera token, ni con ni sin especulacion MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF (este) | no especificado tras la poda; base de 131,6 B | no disponible | GGUF mixto por capas (M-TI, ~63 GB) | Apache 2.0 | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 131.621.823.360 | no disponible | safetensors sin cuantizar | no disponible en la informacion proporcionada | Referenciado como modelo base |
| AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF | no disponible | no disponible | GGUF tras REAP K=320 | no disponible en la informacion proporcionada | Publicado en HuggingFace; es la referencia en la que se inspira este repositorio |

No se dispone de modelos comparables de otras familias con datos verificables en la informacion proporcionada (parametros, contexto, rendimiento y licencia de las alternativas figuran como no disponibles).

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de que los pesos funcionen correctamente.
- Sin metricas publicadas: la perplejidad y la divergencia KL aparecen como TBD en la propia model card. No hay benchmarks de codigo, razonamiento ni multilingue, de modo que cualquier afirmacion de calidad es una promesa del autor, no un dato.
- Inconsistencia en el recuento de parametros: la etiqueta indica "113b" mientras que el dato de safetensors del modelo base es 131.621.823.360. Si "113b" refleja el modelo ya podado, no se explica la metodologia del calculo.
- Poda irreversible de expertos: REAP K=320 elimina permanentemente rutas de experto. Los dominios poco representados en los prompts de calibracion pueden degradarse de forma no medida, y esa degradacion no es recuperable ajustando la cuantizacion.
- Cuantizacion agresiva en el suelo: el uso de IQ2_XS en expertos de baja actividad implica perdida de precision significativa en esas capas; el impacto real no esta cuantificado en la informacion disponible.
- Idiomas y contexto sin declarar: no se especifican idiomas soportados ni ventana de contexto maxima, lo que impide planificar despliegues multilingues o de contexto largo con garantias.
- Soporte de agentes y tool calling sin documentar: la mencion a RooCode/Aider es una orientacion de uso, no una especificacion tecnica verificable.
- Requisitos de hardware elevados: ~63 GB de pesos excluyen el despliegue en GPU de consumo unica; el reparto multigpu anade latencia y complejidad operativa.
- Caveat de procedencia: la model card incluye banners promocionales, enlaces de afiliado y direcciones de donacion. Conviene tratar las afirmaciones de rendimiento con cautela adicional hasta que existan evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de dicha licencia, pero la informacion disponible no aclara la licencia del modelo base ni posibles restricciones heredadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zerodigest/Qwen3.8-Flash-Next-REAP-320-YMQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de referencia (REAP-320): https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF
- Manifiesto de seleccion de expertos: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF/blob/main/manifests/seleccion_mass_K320.json
- Compilador YMQ v2.0 (codigo fuente): https://github.com/minyor/ymq-compiler
- Despliegue en RunPod (enlace de afiliado del autor): https://runpod.io?ref=dbjmkmeh
- Apoyo al autor en Ko-fi: https://ko-fi.com/zerodigest
