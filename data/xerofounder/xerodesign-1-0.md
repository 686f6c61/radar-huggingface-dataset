# xerofounder/XeroDesign-1.0

## Resumen

XeroDesign-1.0 es un adaptador LoRA de rango 32 especializado en diseño gráfico y cartelería, desarrollado por el usuario xerofounder sobre el modelo base `Tongyi-MAI/Z-Image`, un modelo de difusión texto-a-imagen de 6.000 millones de parámetros con arquitectura S3-DiT y un codificador de texto Qwen3-4B. El adaptador se ha entrenado sobre un conjunto curado de 696 carteles de alta resolución que siguen el estilo tipográfico internacional suizo, rejillas geométricas de inspiración Bauhaus y composiciones editoriales asimétricas de alto contraste.

El modelo resuelve un nicho muy concreto: la generación de carteles y material gráfico con tipografía geométrica sans-serif, rejillas modulares y paletas de alto contraste, un dominio donde los modelos generalistas suelen producir resultados inconsistentes. Al ser un adaptador LoRA de solo 133,7 MB, se aplica sobre el modelo base sin necesidad de reentrenar ni redistribuir los pesos completos, lo que reduce los requisitos de almacenamiento y facilita su integración en pipelines existentes de `diffusers`.

Es relevante ahora porque demuestra el patrón de especialización mediante LoRA sobre modelos de difusión abiertos de última generación: un dataset pequeño pero muy curado (696 imágenes) y un trigger token específico (`argonz_design poster`) bastan para obtener un estilo visual reconocible. La licencia Apache 2.0 del adaptador facilita su uso comercial, aunque el modelo base tiene su propia licencia que debe verificarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre S3-DiT de 6B + codificador de texto Qwen3-4B |
| Parámetros totales | Adaptador: 133.728.936 bytes (~133,7 MB); base: 6B (S3-DiT) + Qwen3-4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; la longitud la determina el codificador Qwen3-4B) |
| Tipos de cuantización | Base en 4-bit NF4 con doble cuantización (`bnb_4bit_use_double_quant=True`); cómputo de activaciones en FP32 |
| Idiomas soportados | No disponible (el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 (adaptador) |
| Formato de pesos | `pytorch_lora_weights.safetensors` (safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con `lora_alpha=32` aplicado sobre las proyecciones de atención `to_q`, `to_k`, `to_v` y `to_out.0` del modelo base `Tongyi-MAI/Z-Image` (commit `04cc4abb7c5069926f75c9bfde9ef43d49423021`). El modelo base combina una arquitectura S3-DiT de 6.000 millones de parámetros con un codificador de texto Qwen3-4B. El entrenamiento se realizó con el modelo base cuantizado en 4-bit NF4 con doble cuantización y una ruta de cómputo de activaciones en FP32, registrando cero pasos con NaN y una pérdida finita en el rango 0,243–0,324.

El dataset de entrenamiento, `xerocore/argonz-curated-design`, contiene 696 carteles de alta resolución organizados en buckets multi-aspecto de `1216x832`, `832x1216` y `1024x1024`. La temática cubre el estilo tipográfico internacional suizo, rejillas geométricas Bauhaus, maquetación editorial asimétrica y composiciones de cartel modernistas de alto contraste. El trigger token para activar el estilo es `argonz_design poster`, que debe incluirse al inicio del prompt. No se documentan detalles sobre el número de pasos de entrenamiento, la tasa de aprendizaje ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Generación texto-a-imagen especializada en carteles y diseño gráfico con estética suiza, Bauhaus y editorial modernista.
- Tipografía geométrica sans-serif de alta fidelidad, incluyendo texto integrado en la composición del cartel.
- Maquetación con rejillas modulares asimétricas (el ejemplo verificado usa una rejilla de 4 columnas).
- Composiciones de alto contraste con paletas controladas (el ejemplo usa rojo bermellón y negro mate sobre papel off-white).
- Gestión de espacio negativo amplio ("generous negative space corridor").
- Soporte de múltiples resoluciones y relaciones de aspecto: `1216x832`, `832x1216` y `1024x1024`.
- Servidor FastAPI compatible con la API de OpenAI (`POST /v1/images/generations`) y endpoint `/health`, incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento (es un modelo de difusión, no un LLM).

## Casos de uso

- Generación de carteles de exposiciones y eventos culturales: el adaptador está entrenado específicamente con carteles de exhibición, por lo que produce composiciones tipográficas listas para revisión con el trigger `argonz_design poster` y resoluciones verticales de 832x1216.
- Prototipado rápido de identidad visual para estudios de diseño: permite explorar variaciones de rejilla, tipografía y paleta en segundos antes de pasar a producción en herramientas vectoriales.
- Material editorial y portadas de publicaciones: la maquetación asimétrica y las rejillas modulares del dataset encajan con revistas, fanzines y catálogos de arte.
- Cartelería promocional para marcas con estética modernista: la paleta de alto contraste y el uso de espacio negativo permiten generar piezas coherentes con marcas que buscan un lenguaje visual Bauhaus.
- Generación de assets para presentaciones y landing pages: imágenes de 1024x1024 o 832x1216 que se pueden recortar y adaptar como cabeceras o fondos con tipografía integrada.
- Integración en pipelines automatizados de marketing: el servidor FastAPI incluido expone un endpoint compatible con OpenAI, lo que permite encadenar generación de imágenes con otras herramientas mediante llamadas HTTP estándar.
- Investigación sobre especialización de modelos de difusión: el adaptador sirve como caso de estudio de fine-tuning LoRA con datasets pequeños y curados sobre arquitecturas S3-DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta telemetría de una generación verificada:

| Métrica | Valor |
|---|---|
| Resolución de salida verificada | 832 × 1216 |
| Tamaño del archivo generado | 1.517.613 bytes |
| Media de píxeles (`mean`) | 176,41 |
| Desviación estándar de píxeles (`std`) | 70,18 |
| Pasos de inferencia del ejemplo | 24 |
| Guidance scale del ejemplo | 4,0 |
| NaN / overflow | 0 / 0 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador LoRA ocupa solo 133,7 MB, pero requiere cargar el modelo base Z-Image de 6B más el codificador Qwen3-4B. Con cuantización 4-bit NF4 del base, la huella conjunta se reduce de forma significativa, aunque no se publican cifras exactas.
- GPU recomendadas: no disponible. Por el tamaño del base (6B + 4B), se necesitan GPUs con al menos 16-24 GB de VRAM en FP16; con cuantización 4-bit podría caber en GPUs de 12-16 GB, pero no está confirmado.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) debería poder ejecutar el pipeline con cuantización 4-bit, pero el autor no documenta pruebas en hardware de consumo.
- Opciones de despliegue: `diffusers` (versión concreta fijada en el commit `e04f0c5f24392fcd34b32d18d0ce03668f9bcd50`), `peft`, `accelerate`, `bitsandbytes`, `transformers`, `safetensors`, `torchao`. Se incluye un servidor FastAPI propio (`server_xerodesign.py`) con endpoints `/v1/images/generations` y `/health`.
- Latencia y throughput: no disponibles. El ejemplo usa 24 pasos de inferencia y guidance scale 4,0, pero no se reportan tiempos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es un LoRA especializado sobre un modelo base concreto (`Tongyi-MAI/Z-Image`), y no se han publicado comparaciones con otros adaptadores de diseño gráfico ni con modelos texto-a-imagen generalistas.

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XeroDesign-1.0 | Tongyi-MAI/Z-Image | LoRA r=32 sobre 6B + Qwen3-4B | No disponible | Apache 2.0 | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente con carteles de estilo suizo/Bauhaus; fuera de ese dominio (fotografía realista, ilustración, retratos) el rendimiento probablemente se degrade respecto al modelo base.
- Dependencia del trigger token: el estilo solo se activa de forma fiable incluyendo `argonz_design poster` en el prompt; sin él, el comportamiento no está documentado.
- Dataset pequeño: 696 imágenes es un conjunto reducido, lo que puede provocar sobreajuste a las composiciones y paletas presentes en el dataset y limitar la diversidad de resultados.
- Riesgo de alucinación tipográfica: como todo modelo de difusión, puede generar texto mal formado o caracteres ilegibles en la tipografía integrada, especialmente en resoluciones bajas o prompts con texto largo.
- Idiomas: no se documenta soporte multilingüe; el prompt de ejemplo está en inglés y el codificador Qwen3-4B podría manejar otros idiomas, pero no está verificado.
- Licencia del modelo base: el adaptador es Apache 2.0, pero el uso comercial depende también de la licencia de `Tongyi-MAI/Z-Image`, que debe verificarse por separado.
- Clave Bearer incluida en la model card: el servidor de ejemplo usa una clave estática de 16 dígitos publicada en el repositorio; no debe reutilizarse en producción sin rotación.
- Sin benchmarks públicos: no hay métricas objetivas de calidad (FID, CLIP score) ni comparaciones con alternativas, lo que dificulta evaluar su rendimiento frente a otros adaptadores.
- Madurez: el repositorio tiene 31 descargas y 0 likes en el momento de la consulta, con creación el 1 de noviembre de 2026 y última actualización el 4 de noviembre de 2026; es un modelo muy reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/xerofounder/XeroDesign-1.0
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Dataset: https://huggingface.co/datasets/xerocore/argonz-curated-design
- Diffusers (commit fijado): https://github.com/huggingface/diffusers/commit/e04f0c5f24392fcd34b32d18d0ce03668f9bcd50
- Repositorio del servidor: incluido en el propio repositorio de Hugging Face (`server_xerodesign.py`)
- Paper, blog o demo adicionales: no disponibles
