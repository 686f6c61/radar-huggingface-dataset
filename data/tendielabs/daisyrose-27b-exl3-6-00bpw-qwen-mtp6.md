# TendieLabs/DaisyRose-27B-exl3-6.00bpw-Qwen-MTP6

## Resumen
DaisyRose-27B es el primer modelo publicado por RadixArk, un modelo multimodal de razonamiento construido sobre Qwen3.8-27B y ajustado exclusivamente mediante aprendizaje por refuerzo, sin supervisión ni destilación. El entrenamiento se realizó sobre aproximadamente 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPUs H200. El resultado es una mejora sustancial en tareas de terminal y de ingeniería de software: Terminal Bench 4.1 pasa de 5,6 a 12,0 en pass@1.

La ficha que nos ocupa no contiene los pesos originales en BF16, sino una cuantización de terceros publicada por TendieLabs: **exl3-6.00bpw-Qwen-MTP6**, una conversión a 6 bits con el formato EXL3 (ExLlamaV3) y un componente MTP (multi-token prediction) de Qwen. El repositorio ocupa 22,7 GB y declara 11.348.546.944 parámetros en los tensores safetensors, un dato que no concuerda con los 27B del nombre ni con la model card del modelo base, por lo que debe interpretarse con cautela: probablemente corresponda a un subconjunto de tensores o a un recuento parcial de la conversión.

La relevancia de esta publicación es doble. Por un lado, DaisyRose-27B demuestra que el RL puro sobre tareas de agente de largo horizonte puede mover benchmarks de coding de forma notable sin tocar la arquitectura base, manteniendo contexto de 256K y comprensión de imágenes. Por otro, esta variante EXL3 de 6 bits facilita el despliegue en GPUs de consumo con una pérdida de precisión teóricamente pequeña, aunque al tratarse de una conversión no oficial conviene validar la calidad antes de usarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B), con componente MTP de Qwen en esta conversión |
| Parámetros totales | 27B según la model card del base; 11.348.546.944 según los tensores safetensors del repo (dato inconsistente, ver advertencias) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | EXL3 a 6.00 bpw (esta variante); el base se publica en BF16, FP8 y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, 6 bits), librería transformers |
| Pipeline | image-text-to-text |
| Modelo base | RadixArk/DaisyRose-27B (a su vez finetune de Qwen/Qwen3.8-27B) |
| Tamaño del repositorio | 22,7 GB |
| Fecha de publicación | 19 de noviembre de 2026 |

## Arquitectura y entrenamiento
DaisyRose-27B conserva íntegramente la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, incluyendo la torre de visión y la ventana de 256K tokens. Se trata por tanto de un transformer denso multimodal, no de un MoE, y es un reemplazo directo en pilas de inferencia y post-entrenamiento existentes. La innovación no está en la arquitectura sino en el procedimiento de entrenamiento: RadixArk aplicó únicamente aprendizaje por refuerzo, sin SFT ni destilación, sobre unas 1.200 tareas de agente de horizonte largo curadas manualmente, con sesiones que alcanzan 1M de tokens. El cómputo empleado fue de 18 días en 144 GPUs H200.

Esta variante concreta añade dos capas de transformación sobre el modelo base. Primero, la cuantización EXL3 a 6.00 bits por peso, orientada a ExLlamaV3 y a GPUs con soporte de kernels de baja precisión. Segundo, la integración de un componente MTP (multi-token prediction) de Qwen, que permite decodificación especulativa con un cabezal auxiliar y, en teoría, aumentar el throughput de generación. No se dispone de información sobre el proceso exacto de conversión, el calibrado utilizado ni las métricas de degradación respecto al BF16.

## Capacidades
- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto y produce respuestas razonadas en modo thinking.
- Razonamiento de largo horizonte: entrenado específicamente para sesiones de agente de hasta 1M de tokens, lo que le permite mantener estado a lo largo de tareas prolongadas.
- Ejecución de tareas en terminal: uso de shell, gestión de ficheros y resolución de problemas de sistema (Terminal Bench).
- Ingeniería de software: resolución de issues y parches en repositorios reales (SWE Bench Pro v2, DeepSWE).
- Razonamiento científico y de conocimiento: GPQA Diamond y HLE en modo texto.
- Seguimiento de instrucciones complejas: IFBench con accuracy a nivel de prompt.
- Comprensión de imágenes heredada de Qwen3.8-27B.
- Modo thinking configurable con esfuerzo de razonamiento (xhigh por defecto en la plantilla).
- Compatible con endpoints (tag endpoints_compatible), lo que sugiere despliegue en infraestructura tipo TGI o API compatible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el entrenamiento en tareas de agente lo hace altamente probable.

## Casos de uso
- **Automatización de tareas de terminal y DevOps**: el modelo puede operar sesiones de shell de varios pasos para diagnosticar fallos, aplicar parches o ejecutar pipelines de despliegue. Su entrenamiento en Terminal Bench 4.1 (12,0 pass@1) lo hace adecuado para agentes de operaciones que necesitan mantener contexto durante horas.
- **Resolución de issues en repositorios**: con 94,7 en SWE Bench Pro v2, puede recibir un issue y un checkout del repositorio, localizar los ficheros relevantes y proponer un parche. Encaja en flujos de CI/CD como generador de pull requests preliminares que un humano revisa.
- **Asistente de coding en IDE con contexto largo**: la ventana de 256K permite cargar varios módulos, tests y documentación en una sola sesión, útil para refactorizaciones que cruzan múltiples ficheros.
- **Análisis de documentos técnicos con imágenes**: al ser image-text-to-text, puede procesar diagramas de arquitectura, capturas de paneles de monitorización o esquemas de circuitos junto con texto explicativo, por ejemplo para generar documentación a partir de material visual.
- **Investigación asistida en dominios científicos**: con 90,7 en GPQA Diamond, sirve como asistente para preguntas de nivel posgrado en física, química y biología, siempre con verificación humana dada la tasa de error inherente.
- **Agentes de atención al cliente de segundo nivel**: conversaciones multi-turno con historial extenso y acceso a herramientas internas (consulta de pedidos, estado de sistemas) gracias al contexto de 256K y al modo thinking para casos ambiguos.
- **Generación de código en pipelines de integración**: integrado vía API compatible con endpoints, puede generar tests unitarios o migraciones de esquema a partir de descripciones y del código existente en el repositorio.

## Benchmarks y rendimiento
Los datos proceden de la model card del modelo base (RadixArk). No hay benchmarks publicados específicamente para esta conversión EXL3 de 6 bits, por lo que las cifras corresponden a BF16/FP8 y deben tomarse como cota superior de referencia.

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Parámetros activos | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parámetros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Metodología declarada: Terminal Bench 4.1 promediado sobre 8 repeticiones con mini-swe-agent y summarization; Terminal Bench 2.1 sobre 5 repeticiones con Terminus 2; DeepSWE v1.1 sobre 8 repeticiones; SWE Bench Pro v2 sobre 5 repeticiones (642 tareas, mini-swe-agent); HLE sobre 5 repeticiones con GPT-6 Luna como evaluador y sin herramientas; IFBench sobre 4 repeticiones de 300 prompts con el scorer oficial de allenai; GPQA Diamond sobre 8 repeticiones de 198 preguntas con reordenación de respuestas. Ajustes de inferencia: temperature 1,0, top_p 0,95, top_k 20, min_p 0, esfuerzo de razonamiento xhigh y sin límite de max_tokens dentro de los 256K de contexto.

## Requisitos de hardware
- **VRAM estimada para esta variante EXL3 6.00 bpw**: el repositorio pesa 22,7 GB, por lo que se necesita al menos 24 GB de VRAM para cargar los pesos, más overhead de contexto KV. Con 256K de contexto completo el consumo de KV crece de forma significativa y puede superar los 40-60 GB según la configuración de atención.
- **GPU recomendadas**: RTX 4090 (24 GB) o RTX 5090 para la carga base con contexto moderado; A100 80 GB, H100 80 GB o H200 para contexto largo y despliegue concurrente.
- **¿Cabe en GPU de consumo?** Sí, en GPUs de 24 GB o más con cuantización de 6 bits y contexto recortado; en 16 GB no cabe sin cuantizaciones adicionales no disponibles en este repo.
- **Opciones de despliegue**: el formato EXL3 está pensado para ExLlamaV3 (exllamav3). El tag endpoints_compatible sugiere compatibilidad con APIs tipo TGI o vLLM, aunque no está confirmado para EXL3. Las variantes oficiales BF16, FP8 y NVFP4 son las recomendadas para vLLM, TGI y SGLang. Para llama.cpp/Ollama haría falta una conversión GGUF, que no está incluida en este repositorio.
- **Latencia y throughput**: no disponible. El componente MTP de Qwen debería mejorar la decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DaisyRose-27B (EXL3 6 bpw) | 27B | 256K | 12,0 (BF16/FP8) | 94,7 (BF16/FP8) | Apache-2.0 | HF, esta conversión de terceros |
| Qwen3.8-27B | 27B | 256K | 5,6 | 91,3 | Apache-2.0 (según base) | HF oficial |
| MiMo V2.6 Flash | 309B totales / 15B activos | No disponible | 16,1 | – | No disponible | HF |
| Inkling 2 Small | 594B totales / 17B activos | No disponible | 13,0 | 97,7 | No disponible | HF |

Frente a Qwen3.8-27B, DaisyRose-27B dobla el rendimiento en Terminal Bench 4.1 y mejora SWE Bench Pro v2 en 3,4 puntos, con la misma arquitectura y contexto. Frente a modelos MoE mucho mayores como MiMo V2.6 Flash o Inkling 2 Small, queda por debajo en Terminal Bench 4.1 y DeepSWE pero compite en GPQA Diamond y supera a ambos en IFBench. La ventaja práctica es el tamaño: 27B densos caben en una sola GPU de 80 GB en BF16 y en 24 GB con esta cuantización de 6 bits.

## Limitaciones y advertencias
- **Inconsistencia en el recuento de parámetros**: los tensores safetensors declaran 11.348.546.944 parámetros, mientras que el nombre y la model card indican 27B. Esto puede deberse a un recuento parcial, a pesos empaquetados en EXL3 o a un error de conversión. Verificar antes de asumir capacidades.
- **Cuantización no oficial**: TendieLabs no es el autor del modelo base. No hay métricas de degradación publicadas para esta conversión de 6 bits; los benchmarks mostrados corresponden a BF16/FP8.
- **Riesgo de alucinación**: como todo modelo de razonamiento, puede generar justificaciones plausibles pero incorrectas, especialmente en HLE (34,3) y en tareas de varios pasos sin verificación.
- **Sesgos**: no se documentan evaluaciones de sesgo, toxicidad ni robustez en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados; se desconoce el rendimiento fuera del inglés.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card original por si incluye condiciones adicionales.
- **Contexto largo**: aunque soporta 256K, el coste de KV cache a esa longitud es elevado y puede degradar la calidad en tareas de recuperación de información muy dispersa.
- **Formato EXL3**: requiere ExLlamaV3; no es directamente compatible con llama.cpp, Ollama o vLLM sin conversión adicional.
- **Fecha de publicación futura**: el repositorio está fechado en noviembre de 2026, con 0 descargas y 0 likes, lo que implica ausencia de validación comunitaria.

## Enlaces
- Repositorio de esta conversión: https://huggingface.co/TendieLabs/DaisyRose-27B-exl3-6.00bpw-Qwen-MTP6
- Modelo base DaisyRose-27B (BF16): https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Paper de SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
- Artificial Analysis Qwen3.8: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis Qwen3.6-35B-A3B: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Model card de Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card de Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card de Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Model card de Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Release de MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
