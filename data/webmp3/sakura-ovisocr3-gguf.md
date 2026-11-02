# webmp3/Sakura-OvisOCR3-GGUF

## Resumen

Sakura-OvisOCR3-GGUF es una cuantización comunitaria en formato GGUF del modelo ATH-MaaS/OvisOCR3, un modelo multimodal especializado en OCR (reconocimiento óptico de caracteres) construido sobre Qwen/Qwen3.5-0.8B. Lo publica el usuario webmp3 bajo la etiqueta "Sakura" y no constituye un lanzamiento oficial del autor original. El modelo base tiene 752.393.024 parámetros (aproximadamente 0,9 B según la model card) y arquitectura identificada como `qwen3_5`, con soporte de entrada de imagen mediante un proyector de visión separado.

El interés de esta publicación es práctico: ofrece el modelo en seis niveles de cuantización (Q2_K a Q8_0) con tamaños que van de 0,4 GB a 0,8 GB, lo que permite ejecutar un modelo multimodal de OCR en hardware muy modesto mediante llama.cpp. Incluye además el proyector de visión en F16 (0,2 GB) copiado sin cambios del repositorio original de mradermacher.

Es relevante para quienes necesitan OCR ligero, local y desplegable en CPU o GPU de gama baja, pero conviene tener presente que el autor no aporta benchmarks de calidad, que la calibración con matriz de importancia no se aplicó y que la entrada de imagen no fue probada en esta release concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer, base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (dato de safetensors); ~0,9 B según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (requantización desde GGUF F16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo subyacente es ATH-MaaS/OvisOCR3, un fine-tune de Qwen/Qwen3.5-0.8B según la relación declarada en la model card. La arquitectura es un transformer de la familia Qwen 3.5 con un proyector de visión acoplado (`mmproj`) que permite procesar imágenes junto con texto. El modelo está orientado a tareas de OCR, es decir, extracción de texto a partir de imágenes, aunque la model card no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO.

Esta publicación concreta no entrena nada: realiza una **requantización sobre un GGUF existente**. El punto de partida es el fichero `OvisOCR3.Q8_0.gguf` del repositorio mradermacher/OvisOCR3-GGUF (commit `041e883c...`, SHA-256 verificado), que a su vez se generó desde el checkpoint original. El autor indica explícitamente que no se ejecutó calibración con matriz de importancia porque no estaba disponible para la ruta cualificada, y que se usó cuantización normal. Los ficheros conservan ciertos tensores en F32 (133 tensores) y mezclan tipos K-quant según el preset de llama.cpp, por lo que la etiqueta del fichero no describe exactamente el contenido tensor a tensor.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con salida de texto.
- Procesamiento multimodal imagen + texto mediante el proyector `OvisOCR3.mmproj-f16.gguf`.
- Generación de texto conversacional (el repo está etiquetado como `conversational`).
- Soporte de los idiomas inglés y chino, según los metadatos de la model card.
- Inferencia local mediante llama.cpp (`llama-cli` y `llama-mtmd-cli`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling, agentes, modo thinking, audio y otras capacidades avanzadas: no disponible en la información proporcionada.

## Casos de uso

- **Digitalización de documentos en local**: ejecutar el modelo con `llama-mtmd-cli` sobre escaneos o fotografías para extraer texto sin enviar datos a servicios externos, algo crítico en entornos con requisitos de privacidad.
- **OCR en dispositivos de gama baja**: la variante Q4_K_M ocupa 0,5 GB, lo que permite desplegarla en mini-PC, Raspberry Pi con suficiente RAM o portátiles sin GPU dedicada.
- **Preprocesado de pipelines documentales**: usar el modelo como primer paso de extracción de texto antes de un pipeline de NLP (clasificación, extracción de entidades) en servidores sin aceleradores.
- **Procesamiento por lotes en CPU**: al ser un modelo de menos de mil millones de parámetros, se pueden lanzar múltiples instancias en paralelo en un solo servidor para procesar grandes volúmenes de imágenes.
- **Prototipado rápido de aplicaciones OCR**: integrar el GGUF en una aplicación de escritorio o script Python mediante llama-cpp-python para validar una idea antes de invertir en infraestructura mayor.
- **Análisis de documentos en chino e inglés**: aprovechar el soporte bilingüe declarado para digitalizar documentación técnica o contractual en ambos idiomas.
- **Entornos air-gapped**: desplegar el modelo en redes aisladas (defensa, sanidad, banca) donde no se permite tráfico hacia APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark de código, perplejidad o calidad salvo que se liste un valor medido, y no se lista ninguno. La única verificación reportada es que todos los ficheros cargan correctamente en llama.cpp y generan texto al menos una vez.

## Requisitos de hardware

- **VRAM/RAM estimada**: entre 0,4 GB (Q2_K) y 0,8 GB (Q8_0) para los pesos, más 0,2 GB del proyector de visión si se usa entrada de imagen. En la práctica, contar con 1-2 GB de RAM libre para el contexto y overhead de llama.cpp.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, e incluso en iGPU modernas. Para máximo throughput, una RTX 4090 o A100 están sobredimensionadas pero funcionarán.
- **Consumer GPU**: sí, cabe en prácticamente cualquier GPU consumer de los últimos ocho años, y también en CPU pura.
- **Opciones de despliegue**: llama.cpp (build que soporte la arquitectura `qwen3_5`; el autor probó la build `b11669-620d2225c`), `llama-cli`, `llama-mtmd-cli` para multimodal, y por extensión llama-cpp-python u Ollama si admiten la arquitectura. vLLM y TGI no están mencionados en la información disponible.
- **Latencia y throughput**: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sakura-OvisOCR3-GGUF (esta ficha) | ~0,75 B | no disponible | en, zh | Apache 2.0 | GGUF |
| ATH-MaaS/OvisOCR3 (original) | ~0,75 B | no disponible | en, zh | Apache 2.0 (según base) | safetensors |
| mradermacher/OvisOCR3-GGUF | ~0,75 B | no disponible | en, zh | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe | no disponible | safetensors |

Los tres primeros son esencialmente el mismo modelo en distintos empaquetados; la diferencia práctica es el conjunto de cuantizaciones ofrecidas y la verificación de integridad. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- **Sin benchmarks de calidad**: no hay métricas de precisión OCR, perplejidad ni comparativas objetivas. No se puede afirmar que la cuantización preserve la calidad del original.
- **Entrada de imagen no probada en esta release**: la model card indica explícitamente que el uso con imágenes no se ha testeado para esta publicación, aunque se incluye el proyector.
- **Requantización sin calibración**: no se aplicó matriz de importancia, lo que puede degradar más la calidad en cuantizaciones bajas (Q2_K, Q3_K_M) que en un proceso calibrado.
- **Requantización en cadena**: se parte de un GGUF Q8_0 ya cuantizado, no del checkpoint original en BF16/safetensors, lo que acumula pérdida respecto al modelo fuente.
- **Idiomas limitados**: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- **Contexto desconocido**: no se especifica la longitud de contexto soportada, lo que dificulta planificar documentos largos.
- **Naturaleza comunitaria**: no es una release oficial; el soporte y mantenimiento dependen de un único autor con 0 descargas y 0 likes en el momento de la ficha.
- **Dependencia de build específica**: requiere una versión de llama.cpp que soporte la arquitectura `qwen3_5`; versiones antiguas fallarán al cargar.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen subyacente, que no se detalla en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-OvisOCR3-GGUF
- Modelo original: https://huggingface.co/ATH-MaaS/OvisOCR3
- Model card del original en el commit referenciado: https://huggingface.co/ATH-MaaS/OvisOCR3/blob/17f255e2c8ae6d18d5d5edb0a474bd4ed39aef90/README.md
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GGUF de origen: https://huggingface.co/mradermacher/OvisOCR3-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
