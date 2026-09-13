# TracNetwork/mayhem-catalog-Qwen-Qwen3-8-Flash-Next-NVFP4

## Resumen

TracNetwork/mayhem-catalog-Qwen-Qwen3-8-Flash-Next-NVFP4 es un checkpoint cuantizado a NVFP4 del modelo multimodal Qwen/Qwen3.8-Flash-Next, un Mixture-of-Experts (MoE) hibrido con arquitectura transformer. La cuantizacion la ha realizado el autor del repositorio con NVIDIA Model Optimizer (snapshot `87c9f8cf`, nvidia-modelopt v0.46.0) aplicando la receta NVFP4 W4A4 restringida unicamente a los expertos enrutados de las 48 capas MoE del modelo principal. El objetivo es reducir el coste de despliegue: el checkpoint pasa de 360 GB en BF16 a 135 GB (aproximadamente 2,7x menos), manteniendo el resto de tensores (atencion, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, vision y las 31 tensores MTP) en BF16 byte-identicos al modelo original.

El modelo base maneja entradas de texto, imagen y video con una longitud de contexto de hasta 262.144 tokens, y esta pensado para cargas de trabajo agenticas, chat, codigo y razonamiento multimodal. La relevancia de esta ficha esta en que se trata de un candidato privado ("private candidate release") publicado para evaluar el servicio de Qwen3.8-Flash-Next en NVFP4, con requisitos de hardware muy especificos: solo SGLang con soporte `qwen4_exp` y exclusivamente GPUs NVIDIA Blackwell (validado en GB300 y B300).

Hay que senalar dos discrepancias en la informacion disponible: los metadatos de safetensors declaran 119.602.003.859 parametros, mientras que la model card indica aproximadamente 180.000 millones; y el repositorio esta publicado bajo la cuenta TracNetwork, aunque la model card se refiere al checkpoint como "RadixArk Qwen3.8-Flash-Next-NVFP4" y enlaza a un repositorio de RadixArk. La licencia declarada es "other", remitiendo a los terminos del modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con GDN + atencion dispersa QSA, multi-hyperconnection streams (mHC) e inyeccion de n-gramas PLE; MoE multimodal |
| Parametros totales | 119.602.003.859 segun metadatos de safetensors; la model card indica ~180.000 millones en total (360 GB en BF16) |
| Parametros activos | no disponible (512 expertos enrutados por capa MoE con enrutamiento top-10 + experto compartido; no se especifica el numero de parametros activos) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1, group size 16, escalas de bloque FP8 E4M3, escalas globales FP32, activaciones NVFP4 dinamicas) solo en expertos enrutados; BF16 en el resto; tablas de embeddings PLE en FP8 E4M3 (descuantizadas a BF16 en carga). El tag de HuggingFace indica 8-bit |
| Idiomas soportados | no disponible |
| Licencia | other (remite a los terminos del modelo de origen Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors |
| Capas del decodificador | 48 capas + 1 capa MTP |
| Expertos por capa MoE | 512 enrutados (top-10) + 1 experto compartido |
| Entradas soportadas | Texto, imagen (RGB) y video |
| Salida | Texto (string) |
| Runtime soportado | SGLang con soporte de modelo `qwen4_exp` |
| Hardware soportado | NVIDIA Blackwell (validado en GB300 y B300) |
| Sistema operativo | Linux |
| Tamano del repositorio | 135,2 GB (frente a 360 GB del BF16, ~2,7x de reduccion) |
| Version | NVFP4 candidate 1.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de arquitectura hibrida: combina atencion dispersa QSA (Qwen Sparse Attention), capas GDN, multi-hyperconnection streams (mHC) e inyeccion de n-gramas mediante tablas de embeddings PLE. El decodificador consta de 48 capas, cada una con 512 expertos enrutados con enrutamiento top-10 mas un experto compartido, y una capa adicional de MTP (multi-token prediction). El checkpoint resultante solo modifica, mediante cuantizacion post-entrenamiento, las proyecciones fusionadas `gate_up_proj` y `down_proj` de los expertos enrutados: 294.912 entradas de tensor cuantizadas de un total auditado de 294.912 enrutadas + 1.562 sin cambios + 31 tensores MTP.

El proceso de calibracion uso el split de entrenamiento de cnn_dailymail (config 3.0.0): 128 articulos con semilla 1234, truncados a 512 tokens, capturando activaciones de entrada de los bloques MoE desde servicio SGLang en vivo (solo prefill), con 62.139 filas por capa. Las escalas de activacion se calcularon por max-calibration sobre 8 lotes muestreados con semilla por parte, y se realizo una sonda de representatividad con GSM8K train [0:16] x2. No se aplico cuantizacion al KV-cache. Las tablas de embeddings n-grama PLE adoptan las versiones cuantizadas en FP8 de la revision `Qwen/Qwen3.8-Flash-Next-FP8` (128 shards F8_E4M3 mas escala escalar por tabla, descuantizadas a BF16 al cargar); el resto de pesos PLE permanece en BF16. La model card no documenta detalles del preentrenamiento, del dataset completo ni de fases de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto con entradas multimodales: acepta texto, imagenes RGB y video, y produce exclusivamente texto.
- Razonamiento de multiples pasos: los protocolos de evaluacion de AIME26 permiten hasta 130.000 tokens de generacion por problema, lo que indica soporte de cadenas de razonamiento largas.
- Matematicas: resultados de GSM8K (97,27) y AIME26 (98,75 pass@1) atribuidos a este checkpoint.
- Codigo y sistemas agenticos: la model card situa los casos de uso en "agentic systems, chat, coding, and multimodal reasoning workloads".
- Contexto largo: ventana de hasta 262.144 tokens, apta para documentos extensos y conversaciones multi-turno prolongadas.
- Multilingue: no disponible; la model card no documenta la cobertura de idiomas.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo "thinking" explicito: no documentado; si se observan parametros de muestreo y limites de tokens compatibles con razonamiento extenso.
- Prediccion multi-token: el modelo cuenta con 1 capa MTP y 31 tensores MTP asociados, aunque la informacion disponible no confirma soporte de decodificacion especulativa en el runtime.
- Vision y video: soportados como entrada, sin detalle de resoluciones, numero de frames ni tareas concretas.

## Casos de uso

- Servicio de agentes con contexto largo: con 262.144 tokens de ventana, el modelo puede mantener el estado completo de una sesion agentica (historial de herramientas, documentos intermedios y resultados) sin recurrir a resumenes que degradan la fidelidad. El coste por token es menor que en BF16 al estar los expertos enrutados en NVFP4.
- Razonamiento matematico y verificacion formal asistida: los resultados de GSM8K y AIME26 lo hacen adecuado para generar cadenas de solucion extensas en entornos de investigacion, con configuraciones de muestreo de temperatura alta y limites de 8.192 a 130.000 tokens segun el tipo de problema.
- Asistencia de codigo en pipelines internos: integrable como motor de generacion y revision en flujos de CI/CD, siempre que el backend sea SGLang con `qwen4_exp` y la infraestructura sea Blackwell; conviene validar la latencia con la configuracion de `--max-running-requests 36` antes de ponerlo en produccion.
- Analisis de documentos con imagenes y video: al aceptar entradas RGB y video, sirve para extraer informacion de capturas, diagramas o grabaciones y devolver texto estructurado, por ejemplo en revision tecnica de material audiovisual.
- Chat conversacional multimodal: el pipeline declarado es `image-text-to-text` y `conversational`, por lo que es apto para asistentes que reciban imagenes del usuario junto a texto.
- Evaluacion comparativa de cuantizacion FP4: el checkpoint esta pensado explicitamente para que desarrolladores evalúen el servicio NVFP4 frente a BF16 y FP8 en la misma carga de trabajo, con auditorias de integridad (1.562 tensores / 118,4 GB verificados byte a byte) que permiten aislar el efecto de la cuantizacion.
- Despliegue con memoria reducida en nodos Blackwell: la reduccion de 360 GB a 135 GB permite servir el modelo con paralelismo de tensor 2 (configuracion `--tp 2` de ejemplo) en lugar de requerir un numero mayor de GPUs.

## Benchmarks y rendimiento

Resultados atribuidos a este checkpoint concreto por la model card:

| Eval | Protocolo | Referencia BF16 | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | 1.319 problemas completos, t0.6 / top-p 0.95 / max 8.192 | 97,12-97,50 (rango de 3 ejecuciones independientes sobre una revision anterior) | 97,27 (stop 98,86; err 0) |
| AIME26 | 30 problemas x 8, t1.0 / max 130k | 100 (240/240) | 98,75 pass@1 (majority@8 100; stop 99,17) |

Notas de la propia model card: la referencia BF16 se registro sobre una revision anterior del mismo modelo y las diferencias de pesos entre revisiones no estan establecidas, por lo que la comparacion es indicativa y no exacta. El resultado de AIME26 se midio sobre la revision previa de este checkpoint, que difiere de la actual solo en las tablas de embeddings PLE. No hay resultados publicados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

Evidencia de integridad declarada: auditoria estructural (294.912 tensores enrutados + 1.562 sin cambios + 31 MTP), auditoria de escalas (221.184 escalas finitas positivas, minimo 2,13e-05, maximo 448,0), auditoria de igualdad byte a byte del contenido no modificado (1.562 tensores / 118,4 GB) y prueba de humo determinista de servicio.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 135,2 GB en disco, por lo que la inferencia requiere al menos esa cantidad de VRAM agregada solo para pesos, mas el KV-cache y los buffers de activacion. La configuracion de ejemplo usa `--tp 2` con `--mem-fraction-static 0.80`.
- GPUs compatibles: exclusivamente NVIDIA Blackwell. Validado por el autor en GB300 y B300. No se declara soporte para Hopper (H100/H200) ni Ampere.
- GPU de consumo: no viable. El tamano del checkpoint supera ampliamente la VRAM de cualquier GPU de consumo y el runtime NVFP4 exige microarquitectura Blackwell de centro de datos.
- Opciones de despliegue: unicamente SGLang con una compilacion que incluya soporte `qwen4_exp`. El comando de ejemplo es `python -m sglang.launch_server --model-path ... --tp 2 --quantization modelopt_fp4 --fp4-gemm-backend flashinfer_cutlass --page-size 64 --mamba-scheduler-strategy extra_buffer --mamba-track-interval 64 --chunked-prefill-size 4096 --max-running-requests 36 --context-length 262144 --mem-fraction-static 0.80 --allow-auto-truncate --port 30000`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como unicas referencias de configuracion, `--max-running-requests 36`, `--chunked-prefill-size 4096` y `--page-size 64`.
- Comportamiento observado: la cuantizacion preserva la precision en un solo turno (GSM8K y AIME en rango), pero las generaciones agenticas largas tienden a extenderse mas que en BF16.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TracNetwork/mayhem-catalog-Qwen-Qwen3-8-Flash-Next-NVFP4 (esta ficha) | 119,6 B segun safetensors (~180 B segun model card) | 262.144 tokens | NVFP4 W4A4 en expertos enrutados + BF16 en el resto | 135,2 GB | other | SGLang con `qwen4_exp`; solo Blackwell |
| Qwen/Qwen3.8-Flash-Next (modelo base) | ~180 B | 262.144 tokens | BF16 | 360 GB | la del modelo de origen | sirve como referencia de maxima fidelidad, con el mayor coste de memoria |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | FP8 | no disponible | la del modelo de origen | revision referenciada para las tablas PLE; tamano y contexto no documentados en la informacion disponible |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | la del modelo de origen | repositorio citado en la model card como origen de la release; no se dispone de sus datos tecnicos |

No se dispone de datos de benchmarks de los checkpoints FP8 o BF16 completos con los que comparar de forma directa, ni de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base se entreno con datos de internet que contienen lenguaje toxico y sesgos sociales; puede amplificarlos y devolver respuestas toxicas, especialmente ante prompts toxicos.
- Alucinacion: la model card advierte de que el modelo puede generar respuestas inexactas, omitir informacion clave o incluir texto irrelevante o redundante, incluso sin un prompt ofensivo.
- Estado de publicacion: se declara explicitamente "private candidate release", con 0 descargas y 0 likes. No debe tratarse como una version estable ni soportada.
- Licencia: la licencia es "other" y remite a los terminos del modelo de origen. No se detallan condiciones de uso comercial en la informacion disponible; es imprescindible revisar la licencia de Qwen/Qwen3.8-Flash-Next antes de cualquier uso productivo.
- Restriccion de hardware severa: requiere GPUs NVIDIA Blackwell (GB300 o B300) y Linux. No hay soporte documentado para Hopper, Ampere ni GPUs de consumo.
- Restriccion de runtime: solo SGLang con soporte `qwen4_exp`, lo que exige compilar o desplegar una version especifica. No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, lo que limita las opciones de portabilidad.
- Alcance de la cuantizacion: solo se cuantizan los expertos enrutados de las 48 capas MoE; los tensores MTP (31), atencion, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head y vision permanecen en BF16. No se cuantiza el KV-cache, por lo que no hay ganancias de memoria en ese punto.
- Degradacion en generaciones largas: en tareas agenticas de muchos pasos las salidas tienden a ser mas largas que en BF16, lo que puede incrementar coste y latencia efectiva aunque la precision por turno se mantenga.
- Calibracion limitada: el conjunto de calibracion son 128 articulos de cnn_dailymail truncados a 512 tokens, un dominio estrecho. No se documenta una validacion exhaustiva fuera de GSM8K y AIME26.
- Comparaciones indicativas: los valores de referencia BF16 proceden de revisiones de pesos distintas, y el resultado de AIME26 se midio sobre una revision anterior del checkpoint; no deben usarse como comparaciones exactas.
- Idiomas: no se documenta ningun listado de idiomas soportados, lo que impide garantizar calidad fuera del ingles en el que se redactan los benchmarks citados.
- Salida limitada a texto: pese a aceptar imagen y video como entrada, el modelo no genera imagenes ni audio.
- Inconsistencias en la documentacion: el conteo de parametros difiere entre safetensors (119,6 B) y la model card (~180 B), y la autoria del repositorio (TracNetwork) no coincide con el nombre del checkpoint citado en la propia model card (RadixArk). Conviene verificar ambos extremos antes de integrar el modelo.

## Enlaces

- Repositorio de HuggingFace de esta ficha: https://huggingface.co/TracNetwork/mayhem-catalog-Qwen-Qwen3-8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revision FP8 del modelo base (origen de las tablas PLE cuantizadas): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio NVFP4 citado en la model card: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- NVIDIA Model Optimizer (TensorRT-Model-Optimizer): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Dataset de calibracion (cnn_dailymail, config 3.0.0): https://huggingface.co/datasets/abisee/cnn_dailymail
- Ficheros de evidencia incluidos en el repositorio (referenciados en la model card): `gsm8k_metrics.json`, `aime26_metrics.json`, `qualification-notes.md`, `validate_checkpoint_report.json`, `validate_scales_report.json`, `audit_unchanged_report.json`
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos correspondian a contenidos sin relacion (informacion deportiva de la NHL). No se dispone de paper, blog tecnico ni demo adicionales.
