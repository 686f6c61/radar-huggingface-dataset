# vcruz305/GLM-5.3-Flash-EXL3-SAGE-2.45bpw

## Resumen

GLM-5.3-Flash-EXL3-SAGE-2.45bpw es una cuantización comunitaria del modelo zai-org/GLM-5.3-Flash, publicada por el usuario vcruz305. Se trata de una conversión a formato EXL3 (ExLlamaV3) con un ratio de 2,45 bits por peso y una variante de calibración etiquetada como SAGE, pensada para ejecutar el modelo en hardware con memoria muy limitada. El pipeline declarado es text-generation y la librería asociada es exllamav3, por lo que no es un checkpoint utilizable con Transformers estándar sin el runtime adecuado.

El modelo base pertenece a la familia GLM-5 de Z.ai (zai-org) y, según la ficha de NVIDIA NIM, es el primer modelo nativamente multimodal de la serie GLM-5, con 320.000 millones de parámetros totales y 18.000 millones activos por token, es decir, una arquitectura de mezcla de expertos (MoE). El repositorio cuantizado, sin embargo, declara 58.905.165.918 parámetros en sus metadatos de safetensors, una cifra que no cuadra con la del modelo base y que conviene verificar antes de aprovisionar hardware.

Su relevancia es doble: por un lado, demuestra que un modelo de la clase GLM-5 puede comprimirse hasta ~2,45 bpw; por otro, el autor publica una receta de despliegue para servir la variante EXL3 en una única NVIDIA DGX Spark (GB10) con TP=1 y decodificación especulativa nativa MTP k=2, lo que sitúa el modelo en el terreno de la inferencia local de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), variante glm5_next; multimodal nativa en el modelo base |
| Parametros totales | 58.905.165.918 según safetensors del repo (el modelo base declara 320B totales en la ficha de NVIDIA NIM; discrepancia sin resolver) |
| Parametros activos | 18B por token según la ficha de NVIDIA NIM para el modelo base (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,45 bits por peso, con calibración SAGE; no se publican variantes GGUF ni otras bitrates en este repo |
| Idiomas soportados | en, zh |
| Licencia | MIT en el repositorio de cuantización (verificar la licencia del modelo base para uso comercial) |
| Formato de pesos | safetensors en formato EXL3, requiere exllamav3 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento nuevo: no se aportan datos sobre el corpus, el número de tokens, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base. La arquitectura subyacente es un transformer con mezcla de expertos de la familia GLM-5 (etiqueta glm5_next), con 320B parámetros totales y 18B activos por token según la documentación de NVIDIA NIM, y con capacidades multimodales nativas en su versión original.

La innovación técnica de esta ficha está en la compresión y en el runtime. EXL3 es el formato de cuantización de ExLlamaV3, que combina cuantización por bloques con kernels específicos para GPU; la variante SAGE añade un esquema de calibración orientado a preservar la calidad a bitrates muy bajos. El autor mantiene además una receta para servir el modelo en una DGX Spark GB10 usando un fork compatible de vLLM, ExLlamaV3 y el plugin canónico vllm-exl3, con TP=1 y decodificación especulativa MTP k=2 (y una mezcla K2/K3). El repositorio advierte explícitamente de que el vLLM estándar no sustituye a este runtime y remite a SGLang como alternativa.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (text-generation, conversational).
- Razonamiento y código: la ficha del modelo base de NVIDIA NIM sitúa GLM-5.3-Flash por delante de GLM-5.2 y cerca de Claude Opus 4.8 en benchmarks de código y agentes (sin cifras publicadas en la información disponible).
- Capacidades multimodales en el modelo base (primer GLM-5 nativamente multimodal); esta cuantización EXL3 declara únicamente text-generation, por lo que la entrada de imagen no está garantizada.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta cuantización.
- Razonamiento multi-paso y uso como agente: heredado del modelo base según la documentación de NVIDIA NIM; no verificado en el checkpoint cuantizado.
- Multilingüe limitado a inglés y chino (tags en, zh).
- Decodificación especulativa MTP k=2 soportada por la receta de despliegue del autor.

## Casos de uso

- Inferencia local de gran escala en una sola DGX Spark GB10: la receta del autor permite servir el modelo con TP=1 y MTP k=2 sobre un único GB10, un escenario antes reservado a nodos multi-GPU.
- Asistentes conversacionales en inglés y chino: el pipeline conversational y el soporte de ambos idiomas lo hacen adecuado para atención al usuario bilingüe, siempre que se valide la calidad tras la cuantización a 2,45 bpw.
- Generación de código asistida en entornos con presupuesto de memoria ajustado: el modelo base destaca en benchmarks de coding según NVIDIA, y el formato EXL3 reduce el peso a ~18 GB teóricos sobre 58,9B parámetros, lo que permite integrarlo en estaciones de trabajo con una sola GPU de 24-48 GB.
- Prototipado de agentes multi-paso: la decodificación especulativa MTP k=2 acelera la generación de secuencias largas, útil en bucles de razonamiento con muchas llamadas al modelo.
- Evaluación comparativa de cuantizaciones: sirve como referencia de calidad frente a la variante EXL3 del mismo autor y frente al modelo base en BF16, para medir la degradación introducida por 2,45 bpw.
- Despliegue en pipelines de investigación sobre modelos MoE: al estar en formato EXL3, permite estudiar el comportamiento de los expertos y del enrutamiento con un coste de memoria muy inferior al del checkpoint original.
- Servicio de inferencia vía vLLM con el plugin vllm-exl3: el autor documenta el fork compatible, lo que habilita integraciones con la API de vLLM en lugar de un servidor ExLlamaV3 aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de NVIDIA NIM afirma que GLM-5.3-Flash supera a GLM-5.2 y se aproxima a Claude Opus 4.8 en tareas de código y agentes, pero no se incluyen cifras numéricas (MMLU, HumanEval, GSM8K u otras) ni resultados medidos sobre esta cuantización EXL3 a 2,45 bpw. El autor menciona "tok/s medidos" en su repositorio de GitHub, pero los valores concretos no aparecen en la información proporcionada.

## Requisitos de hardware

- Peso teórico de los tensores: 58,9B parámetros a 2,45 bpw equivalen a unos 18 GB; si se confirma la cifra de 320B del modelo base, el peso real rondaría los 98 GB. El repositorio ocupa 117,9 GB en total, incluyendo ficheros auxiliares.
- VRAM estimada para inferencia: ~20-24 GB en el escenario de 58,9B, o ~100-110 GB en el escenario de 320B, más espacio para caché KV (no disponible la longitud de contexto, por lo que no puede calcularse con precisión).
- GPU recomendadas: NVIDIA DGX Spark GB10 (único hardware con receta publicada por el autor, TP=1); para el escenario grande, A100 80 GB, H100 80 GB o H200 en configuraciones multi-GPU.
- Cabe en GPU de consumo: en el escenario de 58,9B, sí en RTX 4090 (24 GB) o RTX 5090 con contexto corto; en el escenario de 320B, no.
- Opciones de despliegue: ExLlamaV3 (librería nativa del formato); vLLM mediante el fork compatible y el plugin vllm-exl3; SGLang como alternativa mencionada por el autor. El vLLM estándar no es compatible.
- Latencia y throughput: el autor reporta medidas de tok/s en su receta para DGX Spark, pero los valores no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-SAGE-2.45bpw (este) | 58,9B según safetensors / 320B-18B activos según el base | no disponible | EXL3 2,45 bpw + SAGE | MIT en el repo | Gated, 0 descargas, 1 like |
| zai-org/GLM-5.3-Flash (base) | 320B totales, 18B activos | no disponible | BF16 original | no disponible en la información | Modelo oficial de Z.ai |
| vcruz305/GLM-5.3-Flash-EXL3 | el del modelo base | no disponible | EXL3 (bitrate sin especificar) | other | Público, orientado a vLLM/DGX Spark |
| GLM-5.2 | no disponible | no disponible | no aplica | no disponible | Generación anterior de la serie GLM-5 |

## Limitaciones y advertencias

- Discrepancia de parámetros sin resolver: 58,9B en los safetensors del repo frente a 320B totales/18B activos del modelo base; afecta directamente al cálculo de VRAM y al rendimiento esperado.
- Cuantización agresiva a 2,45 bpw: la degradación de calidad frente al BF16 no está medida ni documentada por el autor.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar.
- Licencia: el repo declara MIT, pero se trata de un modelo derivado; la licencia de los pesos originales de zai-org/GLM-5.3-Flash no aparece en la información disponible y debe verificarse para uso comercial.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Multimodalidad no garantizada: aunque el modelo base es nativamente multimodal, esta cuantización se publica solo como text-generation.
- Runtime no estándar: requiere ExLlamaV3 o el fork de vLLM con vllm-exl3; el vLLM oficial no funciona, lo que complica el despliegue en infraestructura existente.
- Trazabilidad baja: 0 descargas y 1 like en el momento de la consulta, un único mantenedor y sin validación independiente de la calidad del checkpoint.
- Riesgo de alucinación y sesgos: no se publica ninguna evaluación al respecto, ni para el modelo base ni para la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3-SAGE-2.45bpw
- Variante EXL3 del mismo autor: https://huggingface.co/vcruz305/GLM-5.3-Flash-EXL3
- Receta de despliegue en DGX Spark: https://github.com/vcruz305/GLM-5.3-Flash-EXL3-K2-DGX-Spark-recipe
- Perfil de GitHub del autor: https://github.com/vcruz305
- Ficha del modelo base en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard
