# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp es una cuantizacion de 3 bits en formato MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario xunlinkx. El modelo original lo desarrolla Xiaomi MiMo y se construye mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por la familia mayor MiMo-V2.6 (Pro y Flash), con un enfoque claro hacia tareas agénticas: ingenieria de software, uso de herramientas, codigo visual y ciberseguridad. Cuenta con 9.409.813.744 parametros reales y naturaleza multimodal (vision + texto).

Esta version concreta aplica una cuantizacion afin global de 3 bits con grupo de tamano 64, generada con el runtime oMLX a partir de 128 muestras de calibracion con longitud de secuencia 512, calculo en BF16 y cobertura estricta de la matriz de importancia. Ademas, injerta una cabeza MTP (multi-token prediction) procedente de mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp, ya que el checkpoint oficial declara la capa MTP pero no incluye sus pesos. El resultado es un modelo pensado para ejecucion local en hardware Apple Silicon, con licencia MIT.

Su relevancia radica en que acerca un modelo agéntico multimodal de 9.4B a equipos de consumo: el repositorio ocupa solo 5.5 GB, conserva las 333 matrices del tower de vision bajo `vision_tower.*` y mantiene tool calling mediante la plantilla de chat incluida. La contrapartida es que la cabeza MTP es un trasplante experimental, no un tensor oficial de XiaomiMiMo, y que no se han publicado resultados de benchmarks para esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) basado en Qwen3.5-9B, con cabeza MTP injertada; tag `qwen3_5` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits afines (oQ3e) con group size 64; variante de referencia en 4 bits (oQ4e) del repositorio mlx-works |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada del modelo upstream) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso derivado de Qwen3.5-9B, adaptado por Xiaomi MiMo mediante SFT sobre datos generados por los modelos mayores de la familia MiMo-V2.6 (Pro y Flash). La arquitectura es nativamente omnimodal: incorpora un tower de vision cuyos 333 pesos se conservan intactos en esta cuantizacion bajo el prefijo `vision_tower.*`, de modo que las capacidades de comprension de imagen y documento se mantienen junto al backbone de lenguaje cuantizado. Adicionalmente, el modelo declara una capa MTP (multi-token prediction), orientada a acelerar la decodificacion especulativa.

Sobre el proceso de cuantizacion: se empleo oMLX con 128 muestras de calibracion a longitud de secuencia 512, calculo en BF16 y grupo de 64. La model card indica que la matriz de importancia oQe se aplico de forma estricta, sin entradas ausentes ni desajustadas. Como el checkpoint oficial no incluye pesos MTP, se injerto la cabeza compatible del repositorio mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp tras verificaciones de arquitectura, geometria e identidad de tokenizer; el autor advierte explicitamente de que se trata de un trasplante experimental y no de la restauracion de un tensor oficial. La validacion local incluyo carga estricta en el runtime oMLX, identidad SHA-256 del tokenizer entre origen y salida, renderizado correcto de un esquema de funciones estilo OpenAI por la plantilla de chat oficial y una prueba de generacion determinista (15% de 240 incluye 36).

## Capacidades

- Generacion de texto conversacional y razonamiento en multiples turnos.
- Comprension multimodal de imagen y documento mediante el tower de vision (333 matrices preservadas).
- Codigo y ingenieria de software: el modelo base esta entrenado especificamente para tareas de programacion.
- Codigo visual (visual coding), combinando entrada de imagen con generacion de codigo.
- Tool calling / function calling: la plantilla de chat oficial renderiza un esquema de funciones estilo OpenAI y el uso de herramientas depende de aplicar dicha plantilla y suministrar los esquemas en la peticion.
- Flujos agenticos y razonamiento multi-paso, con el tag `tool-use` en el repositorio.
- Tareas de ciberseguridad, uno de los cuatro dominios objetivo del modelo destilado.
- Decodificacion MTP para prediccion multi-token (cabeza injertada, caracter experimental).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de codigo en local: el modelo puede generar parches y refactorizaciones en un portatil Apple Silicon gracias a que el repositorio pesa 5.5 GB, integrándose en asistentes de terminal o plugins de IDE que invoquen el runtime oMLX.
- Automatizacion de pipelines de CI/CD con tool calling: aplicando la plantilla de chat y suministrando esquemas de funciones, el modelo puede decidir que herramienta invocar (linter, tests, despliegue) en cada paso del flujo.
- Revision de codigo asistida por capturas: al conservar el tower de vision, permite adjuntar capturas de pantalla de errores o diagramas y obtener codigo o explicaciones sobre ellos (visual coding).
- Atencion al cliente especializada en producto tecnico: conversaciones multi-turno con contexto documental e imagenes de incidencias, soportadas por el caracter multimodal del modelo.
- Analisis de seguridad y triaje de vulnerabilidades: dado el enfoque en ciberseguridad del entrenamiento, resulta util para clasificar hallazgos, redactar informes tecnicos y proponer mitigaciones.
- Prototipado de agentes de investigacion: el modelo puede encadenar busqueda, lectura de documentos escaneados y sintesis, todo ello en local y sin enviar datos a servicios en la nube.
- Despliegue en Mac para entornos con requisitos de privacidad: al ejecutarse con MLX sobre Apple Silicon, los datos no salen del equipo, lo que encaja en sectores con restricciones de tratamiento de informacion.
- Evaluacion de cuantizaciones: util como punto de comparacion frente a la variante oQ4e para medir la perdida de calidad introducida por el paso a 3 bits en cargas de trabajo propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de validacion recogida en la model card es una prueba de humo de generacion determinista (la respuesta a "15% of 240" incluye "36"), junto con verificaciones de carga estricta, metadatos de cuantizacion, cobertura de la matriz de importancia y coincidencia SHA-256 del tokenizer. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni para esta cuantizacion ni para el modelo base en la informacion suministrada.

## Requisitos de hardware

- VRAM/unified memory estimada: en torno a 6 GB para los pesos en 3 bits (el repositorio ocupa 5.5 GB), mas overhead de runtime, cache KV y buffers de vision; un presupuesto practico de 8-10 GB de memoria unificada es razonable.
- GPU recomendadas: el runtime es MLX, por lo que el objetivo natural son chips de Apple (series M1, M2, M3, M4 y superiores). Con 16 GB de memoria unificada o mas el modelo cabe con margen.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas. Para GPUs NVIDIA de consumo (RTX 4090, etc.) seria necesario recurrir a la version GGUF publicada por ggml-org, ya que este repositorio concreto es MLX.
- Opciones de despliegue: runtime oMLX (objetivo declarado), MLX y mlx-lm en general. Para ecosistemas no Apple, la via es la cuantizacion GGUF y llama.cpp / Ollama.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para esta cuantizacion.
- Nota: la cabeza MTP esta pensada para acelerar la decodificacion, pero al ser un injerto experimental su ganancia real no esta cuantificada en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp | 9.409.813.744 | No disponible | 3 bits (oQ3e), group size 64 | safetensors MLX | MIT | Repositorio MLX; 0 descargas al momento del registro |
| mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp | No disponible (mismo base de 9.4B) | No disponible | 4 bits (oQ4e) | safetensors MLX | MIT | Repositorio MLX de referencia para la cabeza MTP |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9.4B | No disponible | Sin cuantizar (BF16 presumiblemente) | safetensors | MIT | Modelo oficial de Xiaomi MiMo |
| Version GGUF de MiMo-V2.6-Distill-Qwen-9B (ggml-org) | 9.4B | No disponible | No disponible | GGUF | MIT | Publicada el 21 de septiembre de 2026 para llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal entre ellas es el nivel de cuantizacion y el runtime objetivo, no la arquitectura subyacente.

## Limitaciones y advertencias

- La cuantizacion a 3 bits puede alterar el comportamiento del modelo; el propio autor recomienda evaluarlo sobre la carga de trabajo propia antes de usarlo en produccion.
- La cabeza MTP es un trasplante experimental procedente de otro repositorio, no un tensor oficial de XiaomiMiMo. Su correcto funcionamiento en todos los escenarios no esta garantizado.
- El repositorio esta construido especificamente para el runtime oMLX; no es directamente portable a otros motores de inferencia sin conversion.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles. Los idiomas soportados figuran como no disponibles.
- La longitud de contexto no esta documentada en la informacion proporcionada, por lo que no puede planificarse el uso con ventanas largas sin verificacion previa.
- Al ser un modelo especializado en codigo, agentes y ciberseguridad, su comportamiento fuera de esos dominios puede ser menos fiable.
- El uso de tool calling exige aplicar la plantilla de chat incluida y suministrar los esquemas de herramientas en la peticion; sin ello, las capacidades agenticas no se activan correctamente.
- No se dispone de benchmarks que permitan cuantificar la degradacion respecto al modelo base sin cuantizar.
- Riesgo de doble uso en ciberseguridad: el entrenamiento orientado a esta area implica que el modelo podria emplearse tanto para defensa como para tareas ofensivas; conviene aplicar politicas de uso.
- Licencia MIT, lo que permite uso comercial, pero se recomienda revisar los avisos y la atribucion de los repositorios upstream.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp
- Modelo base oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Repositorio de referencia de la cabeza MTP: https://huggingface.co/mlx-works/MiMo-V2.6-Distill-Qwen-9B-oQ4e-mtp
- Pagina oficial de la familia MiMo-V2.6 (Xiaomi): https://mimo.xiaomi.com/mimo-v2-6
- Ficha del modelo en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Especificaciones y fuentes en gradually.ai: https://www.gradually.ai/en/ai-models/mimo-v2.6-distill-qwen-9b/
- Requisitos de hardware y compatibilidad en llmrun.dev: https://llmrun.dev/model/xiaomimimo-mimo-v2-6-distill-qwen-9b
- Anuncio de la version GGUF: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
