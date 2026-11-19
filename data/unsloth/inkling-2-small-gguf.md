# unsloth/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está orientado a aplicaciones agénticas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La versión aquí descrita es la cuantización GGUF publicada por Unsloth, que permite ejecutar el modelo en hardware local mediante llama.cpp.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 593.700 millones de parámetros totales, según los pesos en safetensors del modelo base. Incorpora capacidades de razonamiento configurable mediante el parámetro `reasoning_effort`, con niveles que van de `none` a `max`, y soporte de entrada visual a través de un proyector multimodal independiente (`mmproj`).

La relevancia de esta ficha radica en que Unsloth ofrece cuantizaciones dinámicas calibradas con imatrix que reducen el peso del modelo desde 484,4 GB en BF16 hasta 171,7 GB en UD-IQ1_S, con una degradación medida en KLD frente a BF16. Esto hace viable el despliegue local de un modelo MoE de gran tamaño en estaciones de trabajo con múltiples GPU, algo que la versión original en NVFP4 no facilita en hardware sin soporte para ese formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), arquitectura `inkling2` según llama.cpp; transformer multimodal con proyector visual |
| Parámetros totales | 593.722.994.688 (~593,7 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `-c 32768`) |
| Tipos de cuantización | UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q8_K_XL, BF16; proyector visual en BF16, F16 y F32 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Inkling 2 Small es un modelo de mezcla de expertos (MoE) multimodal. La arquitectura interna se identifica en llama.cpp como `inkling2`, una arquitectura nueva que requiere una compilación específica de llama.cpp con soporte para Inkling 2; las compilaciones que solo soportan el Inkling original no pueden cargarlo. El modelo procesa texto e imágenes: las imágenes se codifican mediante un proyector visual separado que se pasa con el flag `--mmproj`.

Los pesos originales del modelo base emplean expertos en formato NVFP4 en las capas 0-39. La conversión BF16 de Unsloth preserva esos expertos NVFP4 de forma bit-exacta y convierte el resto de pesos a BF16; la cuantización UD-Q8_K_XL mantiene igualmente los expertos NVFP4 bit-exactos y aplica 8 bits al resto. Las cuantizaciones `UD-*` están calibradas con imatrix (`imatrix_unsloth.gguf_file`). No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Entrada multimodal de imagen y texto (`image-text-to-text`), con proyector visual dedicado.
- Razonamiento configurable mediante `reasoning_effort`, con niveles `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh` y `max` (equivalente a `xhigh`).
- Soporte declarado para sistemas agénticos y de uso de herramientas (tool use), asistentes de código y pipelines de RAG.
- Capacidades multilingües generales, con inglés como idioma principal.
- Soporte de múltiples lenguajes de programación según la model card del modelo base.
- Plantilla de chat embebida en cada GGUF, utilizable con `--jinja`.

## Casos de uso

- Asistentes de código en local: el modelo puede integrarse en un servidor compatible con OpenAI mediante `llama-server` y emplearse para autocompletado, explicación y refactorización en varios lenguajes de programación, con la ventaja de que los pesos y el contexto no salen de la infraestructura propia.
- Sistemas agénticos con uso de herramientas: la model card declara soporte para tool use y aplicaciones agénticas, por lo que puede conectarse a funciones externas (APIs, bases de datos) en flujos de varios pasos controlados por el nivel de `reasoning_effort`.
- Análisis de documentos con imágenes: gracias al proyector `mmproj`, puede procesar capturas, diagramas o páginas escaneadas junto con texto, útil en tareas de extracción y resumen de documentación técnica.
- RAG sobre corpus internos: al ejecutarse en local con llama.cpp, puede combinarse con un índice vectorial propio para responder preguntas sobre documentación privada sin enviar datos a terceros.
- Chatbot de atención al cliente autoalojado: el despliegue con `llama-server` expone una API HTTP compatible con clientes OpenAI, lo que facilita integrarlo en backends existentes con control total sobre latencia y coste.
- Evaluación e investigación de cuantizaciones: la tabla de KLD y coincidencia de top-1 frente a BF16 permite a investigadores medir el impacto de cada nivel de cuantización en sus propias tareas antes de comprometerse con un tamaño de despliegue.
- Fine-tuning posterior: al estar bajo Apache 2.0 y contar con el ecosistema Unsloth, puede servir como base para ajuste fino orientado a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de Unsloth sí publica métricas de fidelidad de cuantización frente al GGUF BF16, medidas sobre 64 secuencias de 4096 tokens de wikitext-2 con caché KV F16 por defecto en llama.cpp:

| Cuantización | Tamaño (GB) | KLD media vs BF16 | KLD al 99% | Mismo token top-1 |
|---|---|---|---|---|
| UD-IQ1_S | 171,7 | 0,0922 | 1,143 | 89,7% |
| UD-IQ1_M | 178,5 | 0,0829 | 1,041 | 90,2% |
| UD-IQ2_XXS | 190,6 | 0,0577 | 0,730 | 91,8% |
| UD-Q2_K_XL | 205,0 | 0,0450 | 0,559 | 92,7% |
| UD-IQ3_XXS | 226,0 | 0,0364 | 0,430 | 93,3% |
| UD-Q3_K_XL | 285,1 | 0,0176 | 0,209 | 95,3% |
| UD-Q4_K_XL | 354,2 | 0,0029 | 0,031 | 98,0% |
| UD-Q8_K_XL | 386,5 | 0,0027 | 0,029 | 98,1% |
| BF16 | 484,4 | referencia | — | — |

## Requisitos de hardware

- VRAM estimada: entre ~172 GB (UD-IQ1_S) y ~484 GB (BF16) solo para los pesos; hay que sumar la caché KV y el proyector visual. Con `-c 32768` y caché KV F16 el consumo adicional es significativo y no se ha cuantificado en la información disponible.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por volumen de pesos, un despliegue completo requiere múltiples aceleradores de clase数据中心 (A100/H100 de 80 GB o equivalentes) o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo individual, ni siquiera con la cuantización más pequeña (171,7 GB). Es posible el reparto entre varias GPU o la inferencia parcial en CPU con `-ngl` reducido.
- Opciones de despliegue: llama.cpp con soporte para la arquitectura `inkling2` (imprescindible una compilación actualizada), `llama-server` con `--jinja` y `--mmproj` para visión, Unsloth Desktop, y SGLang según la model card del modelo base (la receta no está incluida en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría (MoE multimodal de ~600 mil millones de parámetros). La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Parámetros totales | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Inkling-2-Small (esta ficha, GGUF de Unsloth) | ~593,7 mil millones | no disponible | Apache 2.0 | GGUF, safetensors (base) |
| Inkling-2-Small (base, thinkingmachines) | ~593,7 mil millones | no disponible | Apache 2.0 | NVFP4, MXFP8 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está pensado principalmente para inglés; el rendimiento en castellano y otras lenguas no está cuantificado en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas concretas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- Las cuantizaciones de 1 y 2 bits (UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL) muestran una KLD media entre 0,045 y 0,092 y una coincidencia de token top-1 de solo el 89,7-92,7%, lo que implica degradación apreciable de la calidad; para producción conviene partir de UD-Q4_K_XL o superior.
- Requiere una compilación de llama.cpp con soporte específico para `inkling2`; las versiones que solo soportan el Inkling original fallarán al cargar el modelo.
- El repositorio GGUF ocupa 4725,7 GB en total por acumulación de todas las cuantizaciones y shards; la descarga debe hacerse seleccionando archivos concretos con `--include`.
- Aunque la licencia es Apache 2.0, el modelo base remite a una política de uso aceptable de Thinking Machines que conviene revisar antes de un despliegue comercial.
- El tamaño de contexto máximo no está confirmado en la información disponible; el ejemplo de ejecución emplea 32768 tokens, pero no debe asumirse como límite oficial.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/unsloth/Inkling-2-Small-GGUF
- Modelo base (NVFP4): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Modelo base (MXFP8): https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Guía de Inkling 2 de Unsloth: https://unsloth.ai/docs/models/inkling-2
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
