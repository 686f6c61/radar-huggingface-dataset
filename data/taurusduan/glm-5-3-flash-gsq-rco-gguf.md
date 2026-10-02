# taurusduan/GLM-5.3-Flash-GSQ-RCO-GGUF

## Resumen

Este repositorio contiene dos cuantizaciones GGUF del modelo multimodal zai-org/GLM-5.3-Flash, publicadas por el usuario taurusduan como reproducción comunitaria independiente de los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. Se incluye además el proyector de visión en BF16 (mmproj), lo que permite el uso multimodal completo con llama.cpp. El objetivo es reducir el peso en disco desde los 328,3 GB del checkpoint FP8 original hasta 137,07 GB (3,5 bpw) o 117,48 GB (3,0 bpw) manteniendo una degradación medida y acotada.

El modelo base, GLM-5.3-Flash, es un MoE nativamente multimodal de 320.000 millones de parámetros totales y 18.000 millones activos por token, con una arquitectura híbrida de atención dispersa y lineal y Manifold-Constrained Hyper-Connections. Según z.ai, reduce el cómputo de atención y la caché KV en 3,01× y 4,44× respectivamente frente a GLM-5.3, y está orientado a cargas de codificación, razonamiento, agentes y multimodalidad.

La relevancia práctica de este repositorio es la cuantización no uniforme: RCO asigna a cada tensor un tipo de cuantización distinto según su sensibilidad, respetando un presupuesto exacto de tamaño total. Frente a la referencia Q8_0 convertida desde el FP8, la variante de 3,5 bpw cae 1,40 puntos porcentuales en MMLU-Pro (60,55% frente a 61,95%) y la de 3,0 bpw cae 1,95 puntos (60,00%), con 959 descargas acumuladas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal nativamente, híbrida de atención dispersa y lineal, con Manifold-Constrained Hyper-Connections (modelo base GLM-5.3-Flash) |
| Parametros totales | 320.000 millones (313.326.811.966 contados en el checkpoint según los safetensors del repositorio) |
| Parametros activos | 18.000 millones por token |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluación de este repositorio usó un límite de 2.048 tokens como restricción del protocolo, no del modelo) |
| Tipos de cuantizacion | GGUF no uniforme con precisión mixta por tensor: build de 3,0 bpw (2,999595 bpw reales) y build de 3,5 bpw (3,499816 bpw reales); proyector de visión mmproj en BF16 (16,52 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT (según la model card de este repositorio) |
| Formato de pesos | GGUF (dos ficheros de modelo y un fichero `GLM-5.3-Flash-mmproj-BF16.gguf` para el codificador y proyector de visión) |

Ficheros publicados:

| Fichero | bpw | Tamano | Notas |
|---|---:|---:|---|
| `GLM-5.3-Flash-GSQ-RCO-3.5bit.gguf` | 3,499816 | 137,07 GB | Mejor perplejidad de los dos |
| `GLM-5.3-Flash-GSQ-RCO-3.0bit.gguf` | 2,999595 | 117,48 GB | Más pequeño |
| `GLM-5.3-Flash-mmproj-BF16.gguf` | 16,52 | 1,16 GB | Codificador de visión y proyector |

Tamano total del repositorio: 255,8 GB (incluye ambas cuantizaciones y el mmproj).

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 320.000 millones de parámetros totales y 18.000 millones activos, diseñado para ser multimodal desde el entrenamiento y no mediante acoplamiento de módulos posteriores. Incorpora un esquema híbrido que combina atención dispersa con atención lineal, junto con Manifold-Constrained Hyper-Connections, lo que según z.ai reduce el cómputo de atención en 3,01× y la caché KV en 4,44× respecto a GLM-5.3, manteniendo la calidad en contexto largo. Este repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

Lo específico de esta publicación es el proceso de cuantización, no el entrenamiento. GSQ es un método de cuantización escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax. RCO formula la asignación de uno de K tipos de cuantización a cada uno de los N tensores como un problema de optimización con restricción de tamaño total exacto, reformulado sobre una variedad riemanniana suave en el espacio de logits. Ambos métodos provienen de DASLab (IST Austria) y se aplican aquí como reproducción de terceros, sin respaldo de los autores de los artículos.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat estándar y compatibilidad declarada con endpoints (`endpoints_compatible`, `conversational`).
- Razonamiento y resolución de problemas: el modelo base está orientado explícitamente a cargas de razonamiento, y la model card documenta emisión de cadenas de razonamiento (la referencia Q8_0 emitió razonamiento en cinco de los elementos evaluados).
- Codificación: el modelo base se posiciona frente a Claude Opus 4.8 en benchmarks de código y agentes según z.ai, aunque este repositorio no aporta resultados propios de HumanEval, MBPP ni similares.
- Multimodalidad imagen-texto: pipeline `image-text-to-text`, con codificador de visión y proyector incluidos en `GLM-5.3-Flash-mmproj-BF16.gguf` (1,16 GB, BF16). Permite entrada de imágenes junto a texto.
- Capacidades agénticas y de tool calling: el modelo base se describe como orientado a cargas agénticas, pero la información proporcionada no documenta de forma explícita el formato de function calling soportado en esta build GGUF.
- Razonamiento matemático: cubierto parcialmente por la evaluación GSM8K del repositorio (5/8 ítems correctos completados en las tres builds).
- Capacidades multilingües: no disponible; el repositorio no declara idiomas soportados.
- Modo de razonamiento explícito y decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal sobre documentos escaneados: el modelo acepta imagen y texto, de modo que puede extraer información de capturas, diagramas o PDF rasterizados y responder preguntas sobre ellos en una única pasada, sin un pipeline OCR separado.
- Análisis de interfaces y código visual: al combinar entrada de imagen con razonamiento sobre código, resulta adecuado para revisar mockups, capturas de error o diagramas de arquitectura y proponer cambios concretos de implementación.
- Agentes de automatización con contexto largo: el modelo base está diseñado para cargas agénticas y su arquitectura híbrida recorta la caché KV en 4,44× frente a GLM-5.3, lo que abarata mantener sesiones de agente con historial extenso en memoria.
- Despliegue en infraestructura propia con presupuesto de VRAM ajustado: la build de 3,0 bpw ocupa 117,48 GB frente a los 328,3 GB del FP8, lo que permite servir el modelo en un nodo de dos aceleradores de 80 GB en lugar de requerir un clúster mayor.
- Codificación asistida en producción: con soporte de tool calling del modelo base (a confirmar en esta build), puede integrarse en pipelines de CI/CD para revisar diffs, generar pruebas o resolver incidencias etiquetadas automáticamente.
- Evaluación comparativa de métodos de cuantización: el repositorio publica resultados crudos de MMLU-Pro, perplejidad, IFEval y GSM8K con semillas y ficheros TSV, lo que lo convierte en material de referencia para investigadores que comparan GSQ y RCO frente a Q8_0.
- Servicio de atención al cliente con imágenes adjuntas: la combinación de conversación multi-turno y visión permite gestionar incidencias donde el usuario envía una foto del producto o de un mensaje de error.
- Investigación sobre precisión mixta en MoE grandes: los ficheros de 3,0 y 3,5 bpw permiten estudiar la relación entre bits por peso, perplejidad y precisión en tareas de conocimiento (MMLU-Pro) y de instrucciones (IFEval).

## Benchmarks y rendimiento

MMLU-Pro, 2.000 preguntas muestreadas con semilla fija y estratificadas en las 14 categorías, puntuadas zero-shot mediante log-probabilidades de respuestas de un token (` A` a ` J`), sin plantilla de chat, sin razonamiento y con límite de contexto de 2.048 tokens. El azar se sitúa en el 11,2%.

| Build | Precision | Error estandar | Diferencia vs Q8_0 (emparejada) | Discordantes (Q8_0 acierta / build acierta) | p exacta |
|---|---:|---:|---:|---:|---:|
| Q8_0 de referencia | 61,95% | 1,09 | | | |
| GSQ-RCO 3,5-bit | 60,55% | 1,09 | -1,40 pp | 86 / 58 | 0,0241 |
| GSQ-RCO 3,0-bit | 60,00% | 1,10 | -1,95 pp | 128 / 89 | 0,00973 |

Aciertos brutos: 1.239, 1.211 y 1.200 sobre 2.000. La build de 3,5 bits supera a la de 3,0 bits en 0,55 pp (118 / 107 discordantes, p exacta = 0,505). Q8_0 y 3,5 bits coinciden en 1.739 predicciones.

Desglose por categoría (selección representativa):

| Categoria | n | Q8_0 | 3,5-bit | 3,0-bit |
|---|---:|---:|---:|---:|
| biology | 119 | 93,3% | 93,3% | 88,2% |
| computer science | 68 | 76,5% | 76,5% | 75,0% |
| economics | 140 | 80,7% | 80,0% | 79,3% |
| engineering | 161 | 49,7% | 48,4% | 52,8% |
| health | 136 | 71,3% | 66,9% | 72,1% |
| law | 183 | 58,5% | 57,9% | 56,3% |
| math | 225 | 49,8% | 44,9% | 44,0% |
| philosophy | 83 | 66,3% | 69,9% | 71,1% |
| physics | 216 | 45,4% | 42,6% | 42,1% |
| psychology | 133 | 85,0% | 84,2% | 83,5% |

Perplejidad y generación. Perplejidad medida sobre el mismo texto reservado para las tres builds: ocho contextos de 1.024 tokens y 4.088 tokens puntuados. Las puntuaciones de generación cubren 16 ítems de IFEval y 8 de GSM8K.

| Variante | bpw | GB | Perplejidad nativa (menor es mejor) | vs Q8_0 | KL aproximada (menor es mejor) | IFEval estricto | IFEval completados correctos | GSM8K completados correctos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 de referencia | n/a | n/a | 3,3909 | n/a | n/a | 4/16 | 2/16 | 5/8 |
| GSQ-RCO 3,5-bit | 3,499816 | 137,07 | 3,5431 | +4,49% | 0,071346 | 7/16 | 4/16 | 5/8 |
| GSQ-RCO 3,0-bit | 2,999595 | 117,48 | 3,6985 | +9,07% | 0,142370 | 10/16 | 4/16 | 5/8 |

No se han publicado en la información disponible resultados de HumanEval, MBPP, MATH, GPQA ni de las evaluaciones de referencia de z.ai para el modelo base.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir del tamaño de los ficheros, no confirmada por el autor): 137,07 GB de pesos para la build de 3,5 bits y 117,48 GB para la de 3,0 bits, más 1,16 GB del proyector de visión y el espacio de activaciones y caché KV. En la práctica esto exige al menos dos aceleradores de 80 GB (160 GB agregados) con margen muy reducido para el contexto, o tres o cuatro aceleradores para trabajar con holgura.
- La evaluación publicada en el repositorio se ejecutó con una configuración de tres GPU, según los nombres de los ficheros de resultados (`glm3.5-three-gpu.tsv`, `glm3-three-gpu.tsv`).
- GPU recomendadas: H100 80 GB o A100 80 GB en configuraciones de 2 a 4 unidades. Con dos unidades de 80 GB el contexto útil queda muy limitado; con cuatro (320 GB) hay margen sobrado para caché KV prolongada.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar 117-137 GB de pesos. Solo es viable con descarga parcial de expertos a RAM del sistema en llama.cpp, con latencia penalizada por el ancho de banda de memoria.
- Alternativa CPU+RAM: al ser un MoE con 18.000 millones de parámetros activos, llama.cpp permite mantener los expertos en RAM del sistema y ejecutar el modelo con una o dos GPU. Requiere del orden de 160-192 GB de RAM para la build de 3,5 bits; la velocidad queda limitada por la memoria del host.
- Opciones de despliegue: llama.cpp es la vía contemplada por el autor, y requiere una build específica con el PR 27773 más el parche `native-f32-mmf.patch`, lanzada con `NVIDIA_TF32_OVERRIDE=0` y `GGML_CUDA_MMF_F32_DISABLE=1`. También está disponible la instalación estándar de llama.cpp desde la página del repositorio, aunque los resultados publicados se obtuvieron con el runtime parcheado. No hay información sobre soporte en vLLM, TGI u Ollama para estas builds concretas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Tamano en disco | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (checkpoint FP8 original) | 320.000 M | 18.000 M | no disponible | 328,3 GB | no disponible | no disponible en la informacion proporcionada |
| GLM-5.3-Flash Q8_0 GGUF (referencia de conversion, sin capa MTP) | 320.000 M | 18.000 M | no disponible | no disponible | 61,95% | no disponible |
| GSQ-RCO 3,5-bit (este repositorio) | 320.000 M | 18.000 M | no disponible | 137,07 GB | 60,55% | MIT |
| GSQ-RCO 3,0-bit (este repositorio) | 320.000 M | 18.000 M | no disponible | 117,48 GB | 60,00% | MIT |
| GLM-5.3 (modelo de la generacion anterior, referencia de arquitectura) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Sobre el modelo base, z.ai sitúa a GLM-5.3-Flash por encima de GLM-5.2 en benchmarks y cargas reales a una décima parte del precio, y cerca de Claude Opus 4.8 en código y agentes, pero esas cifras no se reproducen aquí por no estar incluidas en la información proporcionada.

## Limitaciones y advertencias

- Reproducción comunitaria independiente: los ficheros no son una publicación de IST-DASLab y no cuentan con el respaldo de los autores de los artículos de GSQ ni de RCO. La validación corre por cuenta de terceros.
- Dependencia de un runtime parcheado: los resultados publicados se obtuvieron con `llama.cpp` PR 27773 más `native-f32-mmf.patch` y con las variables `NVIDIA_TF32_OVERRIDE=0` y `GGML_CUDA_MMF_F32_DISABLE=1`. Con una build estándar de llama.cpp el comportamiento numérico puede diferir y las cifras no son directamente reproducibles.
- Protocolo de MMLU-Pro restrictivo: se midió sin razonamiento, con respuestas de un solo token y un límite de contexto de 2.048 tokens. Las cifras no son comparables con evaluaciones que activan cadenas de razonamiento o usan ventanas largas.
- Degradación desigual por categoría: en matemáticas la build de 3,5 bits cae 4,9 pp y la de 3,0 bits 5,8 pp respecto a Q8_0; también hay caídas en física y química. Los dominios cuantitativos son los más afectados por la cuantización agresiva.
- Tamaño de muestra pequeño en generación: las puntuaciones de IFEval (n=16) y GSM8K (n=8) no permiten conclusiones robustas. Que la build de 3,0 bits supere a la de 3,5 bits en IFEval estricto (10/16 frente a 7/16) es compatible con ruido estadístico en esa muestra.
- Sesgo de protocolo: la referencia Q8_0 emitió razonamiento en cinco ítems, lo que puede penalizarla en IFEval estricto y hacer que las builds cuantizadas parezcan mejores de lo que son en esa métrica concreta.
- Alucinación: no hay datos específicos sobre tasas de alucinación de este modelo en la información disponible; tratándose de un modelo generativo, el riesgo persiste y debe mitigarse con verificación externa en producción.
- Sesgos: no se han publicado análisis de sesgos para este modelo ni para su base en la información disponible.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no se puede garantizar calidad fuera del inglés o del chino sin una evaluación propia.
- Licencia: la model card de este repositorio indica MIT, pero conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash en su propio repositorio antes de un uso comercial, ya que la información proporcionada no incluye su ficha de licencia.
- Requisitos de infraestructura: con 117-137 GB de pesos, el despliegue exige hardware multi-GPU o descarga de expertos a RAM. No es un modelo apto para estaciones de trabajo de una sola GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/GLM-5.3-Flash-GSQ-RCO-GGUF
- Ficheros del repositorio: https://huggingface.co/taurusduan/GLM-5.3-Flash-GSQ-RCO-GGUF/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Artículo de GSQ: https://arxiv.org/abs/2604.18556
- Artículo de RCO: https://arxiv.org/abs/2605.00649
- Código de GSQ: https://github.com/IST-DASLab/GSQ
- Código de RCO: https://github.com/IST-DASLab/RCO
- Organización DASLab: https://github.com/IST-DASLab
- Documentación de z.ai sobre GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Anuncio de z.ai: https://z.ai/blog/glm-5.3-flash
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/zai-org/models/glm-5.3-flash
