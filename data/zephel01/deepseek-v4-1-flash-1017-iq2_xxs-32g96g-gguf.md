# zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek, con 748.494.643.824 parámetros totales según los datos de safetensors del modelo base. Esta ficha describe la cuantización GGUF publicada por el usuario zephel01 bajo el identificador `zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF`, una versión de muy baja precisión (entorno a 1,95-2,05 bits por peso) diseñada específicamente para ejecutarse en un PC con una GPU de 32 GB de VRAM y 96 GB de RAM.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de casi 750.000 millones de parámetros en hardware de consumo (el autor cita una RTX 5090 de 32 GB), manteniendo los 384 expertos enrutados de cada capa sin poda. Para lograrlo se apoya en la técnica LDLQ (redondeo con realimentación de error usando las estadísticas de entrada de cada experto) y en el motor Abyss, que gestiona la descarga de expertos desde RAM y SSD.

Se trata de una versión BETA, medida en un único equipo por el autor, con licencia MIT heredada del modelo base. El repositorio ocupa 337,1 GB e incluye dos variantes de cuantización mixta (132G orientada a velocidad y 139G orientada a calidad), cada una dividida en seis shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, segun tags del modelo base; detalles finos no disponibles |
| Parametros totales | 748.494.643.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | Mixta: expertos en IQ2_XXS (45%), IQ1_S (30%), IQ2_XS (14%), IQ2_S (11%) en 132G; IQ2_XXS (38%), IQ1_S (29%), IQ3_XXS (19%), IQ2_S (10%), IQ2_XS (5%) en 139G; capas densas en Q8_0; tabla Engram en Q5_K |
| Idiomas soportados | Ingles y japones (segun tags y model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards por carpeta), con SHA256SUMS |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa, todos ellos conservados en esta cuantizacion (sin poda). La model card no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en los materiales proporcionados. Lo que sí se documenta es el proceso de cuantización: los expertos se recuantizaron desde los pesos originales en FP4 mediante LDLQ, un esquema de redondeo con realimentación de error que utiliza las estadísticas de entrada propias de cada experto.

El autor reporta que un recuantizado plano a los mismos tipos produce una divergencia KL de 0,404 (8 secuencias), mientras que el redondeo de unsloth obtiene 0,198 y LDLQ 0,194, lo que indica que la innovación principal de esta publicación es la calidad del redondeo a bits muy bajos. Todo lo que no son expertos enrutados (atención, expertos compartidos, routers, embeddings, salida, metadatos y tokenizador) es byte-idéntico a la cuantización UD-IQ2_XXS de unsloth, con capas densas en Q8_0. La tabla Engram (shard 6) se lee desde SSD unas pocas filas a la vez y no necesita caber en RAM.

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento y resolución de tareas de código: el autor verificó respuestas correctas a una tarea de Python en llama.cpp.
- Aritmética básica: el ejemplo de la API responde a `17*23`.
- Ejecución local con offload de expertos a RAM y SSD mediante el motor Abyss o llama.cpp.
- Compatibilidad con endpoints tipo OpenAI (`/v1/chat/completions`) a través de Abyss.
- Soporte de plantilla Jinja (`--jinja`) en llama-server.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Inferencia local de un modelo de gran escala en hardware de consumo: un equipo con RTX 5090 (32 GB) y 96 GB de RAM puede servir el modelo con Abyss o llama.cpp, útil para investigación y prototipado sin depender de la nube.
- Procesamiento de texto en japonés e inglés en local: la model card valida respuestas correctas a preguntas en japonés, lo que permite construir asistentes bilingües para esos dos idiomas.
- Generación de código asistida en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el código y los prompts no salen del equipo, adecuado para pipelines internos.
- Experimentación con cuantizaciones extremas: sirve como banco de pruebas para estudiar el impacto de LDLQ y de tipos IQ1/IQ2 en la calidad de un MoE de gran tamaño (métrica KL frente al modelo sin cuantizar).
- Despliegue de un endpoint compatible con OpenAI en local: mediante Abyss en `http://127.0.0.1:8082/`, integrable en herramientas que ya consumen la API de OpenAI.
- Evaluación comparativa de motores de inferencia: el autor solicita reportes de rendimiento en otras GPU y tamaños de RAM, por lo que el modelo es útil para benchmarking de offload CPU/GPU y lectura desde SSD.
- Servicio de chat de baja concurrencia: con 10-11 tok/s en llama.cpp y 67,5 tok/s en Abyss (con el tier de RAM limitado a 60 GB), encaja en usos interactivos individuales más que en producción de alta carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son de calidad de cuantización y de velocidad:

| Metrica | Valor | Contexto |
|---|---|---|
| KL (LDLQ, 132G) | 0,194 | 8 secuencias, frente al modelo sin cuantizar |
| KL (redondeo unsloth) | 0,198 | 8 secuencias |
| KL (recuantizado plano) | 0,404 | 8 secuencias |
| Throughput Abyss (132G) | 67,5 tok/s | RTX 5090, RAM limitada a 60 GB |
| Throughput llama.cpp (132G) | 10-11 tok/s | RTX 5090, expertos de dos capas en GPU, resto RAM/SSD |

## Requisitos de hardware

- VRAM: 32 GB de GPU como objetivo de diseño (RTX 5090); el autor indica que `--n-cpu-moe 34` en llama.cpp se quedó sin VRAM en la primera petición, por lo que recomienda `--n-cpu-moe 38`.
- RAM: 96 GB en el equipo objetivo; las pruebas se hicieron con el tier de RAM limitado a 60 GB (`STRATA_GLM_RAM_GB=60`).
- Almacenamiento: descarga de 275,8 GB (132G) o 283,0 GB (139G); el shard 6 (tabla Engram, 135,2 GB) se lee desde SSD y no necesita caber en RAM.
- GPU recomendadas: RTX 5090 (32 GB) es la única verificada; no hay datos para A100, H100 u otras.
- Cabe en GPU de consumo solo con offload: no cabe íntegramente en ninguna GPU de consumo; requiere el esquema GPU + RAM + SSD.
- Despliegue: Abyss v1.3.100 o superior (recomendado, con descarga y verificación SHA-256 automatizadas) y llama.cpp con arquitectura `deepseek41` (upstream `ac8e1694d` del 2026-10-29). Windows 11 soportado vía `setup-deepseek.bat`.
- Latencia y throughput: 67,5 tok/s con Abyss y 10-11 tok/s con llama.cpp en la configuración medida; la variante 139G es un 15-20% más lenta en decodificación según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (132G/139G) | 748,5 B totales | no disponible | IQ1/IQ2 mixta, ~1,95-2,05 bits/peso | MIT | 384 expertos por capa, LDLQ, objetivo 32 GB GPU + 96 GB RAM |
| unsloth UD-IQ1_M (mismo modelo base) | 748,5 B totales | no disponible | IQ1_M | MIT | Mismos tipos que 132G; KL 0,198 frente a 0,194 de LDLQ |
| unsloth UD-IQ2_XXS (mismo modelo base) | 748,5 B totales | no disponible | IQ2_XXS | MIT | Base de las capas densas; shard 6 idéntico |
| zephel01 E256 (JA256) | 748,5 B totales (256 de 384 expertos) | no disponible | IQ2_XXS mixta | MIT | 207,1 GB; también para 12 GB GPU + 128 GB RAM |

No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con modelos de otras familias; la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Versión BETA: medida en un único PC (RTX 5090, RAM limitada a 60 GB); el rendimiento en otras GPU o tamaños de RAM no está verificado.
- Cuantización extremadamente agresiva (~1,95-2,05 bits por peso en expertos): aunque el KL reportado es bajo, cabe esperar degradación en tareas sensibles a precisión fina.
- Idiomas limitados a inglés y japonés según la model card; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada; el ejemplo de llama.cpp usa 4096 tokens, muy por debajo de lo habitual en modelos actuales.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de seguridad.
- Requiere hardware específico (32 GB VRAM + 96 GB RAM + SSD rápido) y motores concretos (Abyss o llama.cpp con soporte `deepseek41`); no es plug-and-play en otras stacks.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero conviene verificar las condiciones del modelo original de DeepSeek.
- Los archivos mezclan varios tipos de cuantización, por lo que el nombre del repo no corresponde a una cuantización estándar de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante E256 (JA256): https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramienta trench-gguf (LDLQ): https://github.com/zephel01/trench-gguf
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+LDLQ-132G+on+YOUR_GPU
