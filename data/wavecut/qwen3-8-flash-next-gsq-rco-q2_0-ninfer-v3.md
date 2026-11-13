# WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Q2_0-NInfer-v3

## Resumen

Qwen3.8-Flash-Next GSQ-RCO Q2_0 NInfer v3 es un artefacto de inferencia empaquetado por WaveCut para el motor NInfer, derivado de la cuantizacion GSQ-RCO Q2_0 publicada por ISTA-DASLab sobre el modelo Qwen3.8-Flash-Next de Qwen. El modelo original es una mezcla de expertos (MoE) de 125.000 millones de parametros con 48 capas y 512 expertos enrutados por capa, de los cuales 10 se activan por token, resultando en unos 6.000 millones de parametros activos. El artefacto empaqueta el modelo en un unico fichero de 41.048.606.208 bytes (38,23 GiB) con una media de 2,40 bits por peso sobre los pesos del transformer.

El interes de esta publicacion radica en que comprime un MoE de 125B hasta un tamano manejable en GPUs de consumo y profesionales (RTX 3090, RTX 4090, RTX 5090, RTX PRO 6000), manteniendo componentes en precision mixta: los expertos enrutados en Q2_0, los expertos compartidos en una mezcla de Q2_0 a IQ4_XS, el router en BF16 y las proyecciones de hiperconexion en Q8_0. Ademas, incluye el bloque MTP, el drafter especulativo DFlash2 de incoai y una torre de vision en BF16 de 0,9 GB, lo que permite servir cargas multimodales imagen-texto.

No es un modelo nuevo ni un entrenamiento: es un artefacto de despliegue optimizado para velocidad que requiere una compilacion especifica de NInfer (rama `master` desde el commit `5395ec30b`). Las compilaciones estandar de NInfer rechazan estos ficheros porque la familia de modelos y los formatos `gguf_*` solo existen en esa linea de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrida: 36 capas Gated DeltaNet (atención lineal) + 12 capas de atencion dispersa (QSA) |
| Parametros totales | 125.000 millones (125B) |
| Parametros activos | ~6.000 millones (6B) por token; 10 de 512 expertos enrutados activos por capa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (expertos enrutados); Q2_0, Q3_K, Q4_0, Q4_K, Q5_0, Q5_K, Q6_K, Q8_0, IQ4_XS, IQ4_NL (expertos compartidos y capas); Q8_0 (proyecciones de hiperconexion); BF16/FP32 (router, normas, convolucion, `A_log`, `dt_bias`); BF16 (torre de vision) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | `.ninfer` (formato propietario de NInfer); pesos base derivados de GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE de 125B con 48 capas y 512 expertos enrutados por capa, de los que 10 se activan por token. La arquitectura combina 36 capas Gated DeltaNet (mecanismo de atencion lineal con estado recurrente) con 12 capas de atencion dispersa (QSA, sparse attention), lo que reduce el coste computacional del contexto largo frente a un transformer denso convencional. El artefacto incluye ademas un bloque MTP (multi-token prediction) y el drafter especulativo DFlash2 de incoai, compuesto por cinco capas de ventana deslizante de anchura 2.560 que generan borradores a partir de los estados ocultos del propio modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion GSQ-RCO Q2_0 de ISTA-DASLab aplica una asignacion de tipo ggml por tensor, preservando los bloques ggml byte a byte (excepto las proyecciones de hiperconexion, recuantizadas de BF16 a Q8_0). El artefacto NInfer multiplica los bloques in situ en lugar de descomprimirlos a un formato intermedio, lo que reduce el uso de memoria. La torre de vision corresponde a la de Qwen3.5/3.6, con 27 bloques de anchura 1.152 que fusionan parches 2x2 sobre las 2.560 dimensiones del modelo de texto.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto gestionado por prompt-prefix reuse en NInfer.
- Procesamiento de imagen y video como entrada (pipeline `image-text-to-text`), mediante la torre de vision BF16 incluida en el artefacto.
- Decodificacion especulativa mediante el drafter DFlash2, que acelera la generacion usando los estados ocultos del modelo.
- Prediccion multi-token (bloque MTP) integrada en el fichero.
- Salida estructurada (structured output) soportada por el motor NInfer.
- Servicio de hasta ocho peticiones concurrentes segun la documentacion del autor.
- Soporte de tabla n-gram separada para componentes de n-gramas (publicada aparte y referenciada por hash).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque son esperables en la familia Qwen3.8.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue de un MoE de 125B en una unica GPU de 48 GB o mas (L40S, RTX PRO 6000): el artefacto cabe en 38,23 GiB, permitiendo servir el modelo completo con todos los expertos en memoria de dispositivo sin necesidad de un cluster multi-GPU.
- Inferencia multimodal imagen-texto en estaciones de trabajo: la torre de vision BF16 de 0,9 GB permite procesar imagenes y video junto al texto, adecuado para tareas de descripcion, extraccion de informacion de documentos escaneados o analisis de capturas.
- Servicio de chat concurrente de baja latencia: NInfer soporta hasta ocho peticiones simultaneas con reutilizacion de prefijo de prompt, lo que lo hace adecuado para un endpoint de atencion al cliente o asistente interno con trafico moderado.
- Aceleracion de generacion con decodificacion especulativa: el drafter DFlash2 incluido reduce el coste por token en cargas de generacion larga, util para resumen de documentos o generacion de informes extensos.
- Integracion en pipelines con salida estructurada: la capacidad de structured output del motor permite obtener JSON validado para extraccion de datos, clasificacion o alimentacion de sistemas downstream.
- Experimentacion e investigacion en cuantizacion extrema: el artefacto sirve como referencia reproducible para evaluar el impacto de Q2_0 y precision mixta en un MoE de 125B, con metricas de perplejidad comparables (2,531971 frente a 2,542153 en WikiText con distintas tablas n-gram).
- Prototipado de agentes con contexto largo: las 36 capas Gated DeltaNet reducen el coste de atencion en secuencias largas, adecuado para tareas de razonamiento multi-paso sobre documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento proporcionado es la perplejidad sobre los primeros 40 KB de WikiText con KV en INT8: 2,531971 usando la tabla n-gram de Edge0 en FP8, frente a 2,542153 usando la tabla propia del modelo.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText (primeros 40 KB) | 2,531971 | Tabla n-gram Edge0 FP8, KV INT8 |
| Perplejidad WikiText (primeros 40 KB) | 2,542153 | Tabla n-gram propia, KV INT8 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ocupa 38,23 GiB; se necesita una GPU con al menos 48 GB para mantener todos los expertos en memoria de dispositivo (L40S, RTX PRO 6000).
- GPU recomendadas segun los tags del autor: RTX 3090, RTX 4090, RTX 5090, RTX PRO 6000. Las arquitecturas CUDA objetivo son `86`, `89` y `120a`; esta ultima requiere CUDA 13.1 o superior.
- Cabe en GPU de consumo: si, en RTX 3090/4090/5090 con 24 GB solo si se descargan expertos a host (host experts); para residencia completa se requiere una GPU de 48 GB o mas.
- Opciones de despliegue: exclusivamente NInfer, rama `master` desde el commit `5395ec30b` (y desde `57395b20b` para tablas n-gram alternativas). No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona soporte de hasta ocho peticiones concurrentes y decodificacion especulativa con DFlash2, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO Q2_0 NInfer v3 (este) | 125B | ~6B | no disponible | qwen-community-license-1.0 | `.ninfer` / NInfer |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (base) | 125B | ~6B | no disponible | qwen-community-license-1.0 | GGUF / llama.cpp |
| Qwen/Qwen3.8-Flash-Next (original) | 125B | ~6B | no disponible | qwen-community-license-1.0 | safetensors / transformers |
| incoai/Qwen3.8-Flash-Next-DFlash2 (drafter) | no disponible | no disponible | no disponible | no disponible | safetensors |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Requiere una compilacion no estandar de NInfer (rama `master`, commit `5395ec30b` o posterior); las builds oficiales rechazan estos ficheros.
- No es compatible con el ecosistema GGUF convencional (llama.cpp, Ollama), lo que limita las opciones de despliegue y las herramientas de terceros.
- La cuantizacion Q2_0 en los expertos enrutados es agresiva (2,40 bits por peso de media); puede degradar la calidad frente al modelo en BF16, especialmente en tareas de razonamiento complejo o codigo.
- El fichero de n-gramas no esta incluido: debe descargarse por separado del repositorio WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3, lo que anade un paso de configuracion.
- Licencia qwen-community-license-1.0: es necesario revisar sus terminos para uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue homogeneo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- El tamano del repositorio (294,5 GB) incluye artefactos adicionales; el fichero de modelo util es de 38,23 GiB, pero la descarga completa puede ser costosa en disco.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Q2_0-NInfer-v3
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla n-gram: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Tabla n-gram Edge0 FP8: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Drafter DFlash2 en GGUF Q4_0 (nazeshinjite): https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Motor NInfer (Neroued): https://github.com/Neroued/ninfer
- Rama NInfer-all (iamwavecut): https://github.com/iamwavecut/ninfer-all
- Commit de compilacion requerido: https://github.com/iamwavecut/ninfer-all/commit/5395ec30ba5653914ac59d265102414712a8721d
- Commit de soporte de tablas n-gram: https://github.com/iamwavecut/ninfer-all/commit/57395b20b4ee9c4ac792146d82ffac6b28396a9b
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
