# yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit

## Resumen

Este repositorio contiene un checkpoint cuantizado en formato MLX del modelo Qwen3.8-Flash-Next-Uncensored, una variante sin censura del modelo base Qwen3.8-Flash-Next. El pack está pensado específicamente para el runtime `mlx-serve` parcheado de ddalcu y para hardware Apple Silicon, no para Transformers, `mlx-lm` ni `mlx-vlm` genéricos. El autor, yomie4343, lo presenta como un espejo verificado de pesos ya existentes: los 102 archivos de pesos y tablas N-grama (107.303.406.192 bytes) coinciden por SHA-256 con el pack de ARC4NUM en la revisión `9ebf9993b1eaec96aec938bf883601b51a90393b`.

El modelo tiene 133.195.562.899 parámetros totales según los safetensors del repo y sigue una arquitectura MoE con atención transformer, cabecera MTP (multi-token prediction) y torre de visión, dado que el pipeline declarado es image-text-to-text. La cuantización es mixta: expertos MoE enrutados a 4 bits (grupo 64), proyecciones elegibles a 8 bits (grupo 64), embeddings de tokens a 4 bits y tabla N-grama a 4 bits (grupo 32) en un archivo separado mapeado desde SSD.

La relevancia práctica está en que permite ejecutar un modelo de 133.000 millones de parámetros en un Mac Studio M3 Ultra de 96 GB de memoria unificada, con un pack de aproximadamente 107 GB. El repo incluye además un parche reproducible del motor de inferencia para la cabecera MTP, validaciones medidas y una configuración de arranque conservadora para texto. La licencia es `qwen-community-1.0`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabecera MTP y torre de visión (tag `qwen4_exp`) |
| Parametros totales | 133.195.562.899 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuración de arranque documentada (`--ctx-size 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | Mixta: 4-bit affine grupo 64 (expertos MoE enrutados), 8-bit affine grupo 64 (otras proyecciones elegibles), 4-bit grupo 64 (embeddings de tokens), 4-bit grupo 32 (tabla N-grama). Variante alternativa 3/8-bit disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors + `ngram_table.bin` separado, formato específico de `mlx-serve` (no compatible con `mlx-lm`/`mlx-vlm` genéricos) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE): los pesos de los expertos enrutados se cuantizan a 4 bits mientras que el resto de proyecciones elegibles se mantienen a 8 bits, una política de precisión mixta orientada a preservar calidad en las capas densas y comprimir agresivamente donde el impacto es menor. Incorpora una cabecera MTP (multi-token prediction) que permite decodificación especulativa multi-token, y una tabla N-grama en un archivo aparte mapeado desde SSD para lookup de secuencias frecuentes. La torre de visión del modelo fuente se conserva intacta, habilitando entrada de imágenes.

No hay información sobre el entrenamiento original en la documentación disponible: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Lo que sí está documentado es el proceso de conversión y cuantización: el pack deriva de `orcarouter/Qwen3.8-Flash-Next-Uncensored` (revisión `8336e613ea508b13c2159bd0f68965d97a606b95`), que a su vez parte de `Qwen/Qwen3.8-Flash-Next`, y fue convertido con el motor y conversor de `ddalcu/mlx-serve`. El autor subraya que no se trata de un nuevo entrenamiento, ni de una nueva abliteración, ni de una receta de cuantización nueva, sino de un espejo verificado con parches locales de runtime.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento de múltiples pasos y ejecución de agentes: la configuración medida usa 12 iteraciones de agente.
- Generación de código: las mediciones documentadas se hicieron sobre 25 tareas TypeScript.
- Entrada de imagen: pipeline `image-text-to-text` con pesos de visión preservados.
- Modo thinking con activación y desactivación explícita (las mediciones se hicieron con thinking off).
- Decodificación especulativa MTP, activable mediante el runtime parcheado.
- Aceleración por tabla N-grama para secuencias repetitivas o predecibles.
- Variante sin censura: menor rechazo de contenido que el modelo base alineado.
- Tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agentes de código en local sobre Apple Silicon: el modelo se midió sobre 25 tareas TypeScript con 12 iteraciones de agente y 3072 tokens de salida máxima, por lo que encaja en pipelines de refactorización, corrección de tests y generación de parches ejecutados contra un entorno de pruebas real.
- Asistente de desarrollo en estación de trabajo Mac: con 32.768 tokens de contexto y un pack de 107 GB en SSD rápido, permite mantener sesiones largas de análisis de repositorios sin salir del equipo.
- Procesamiento de documentación con imágenes: la torre de visión conservada permite extraer información de capturas, diagramas y páginas escaneadas junto con el texto que las rodea.
- Investigación sobre alineación y censura: al ser una variante uncensored, sirve para estudiar diferencias de comportamiento respecto al modelo base en tareas de evaluación de rechazos y sesgos.
- Prototipado de agentes con decodificación especulativa: el parche MTP del runtime permite medir el impacto de la predicción multi-token en latencia y throughput sobre hardware con memoria unificada.
- Servicio local de inferencia multimodal: el runtime `mlx-serve` expone un endpoint HTTP en loopback (puerto 11234 en el ejemplo), útil para integrar el modelo en herramientas internas con autenticación añadida.
- Evaluación comparativa de cuantizaciones: disponer de las variantes 4/8-bit y 3/8-bit del mismo modelo permite medir el compromiso entre memoria pico y calidad en cargas de trabajo concretas.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados parcial en la información proporcionada, correspondiente a una ejecución del 8 de septiembre de 2026 (JST) con el mismo motor parcheado, las mismas 25 tareas TypeScript, temperatura 0, thinking desactivado, salida máxima de 3072 tokens y 12 iteraciones de agente. La tabla disponible está truncada y solo muestra la fila "Original mode" sin valores numéricos de passed ni de ejecución.

| Modelo | Tareas superadas | Ejecución + grading normal |
|---|---:|---:|
| Original mode | no disponible (tabla truncada) | no disponible (tabla truncada) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar. El autor advierte explícitamente que las puntuaciones de cada variante solo deben interpretarse bajo las condiciones documentadas en su model card y que no deben compararse directamente entre conjuntos de tareas, revisiones de runtime o procedimientos de evaluación distintos.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 107 GB solo para el pack de pesos, más espacio de trabajo; el autor recomienda reservar unos 108 GB y mantener el pack completo en SSD rápido.
- Hardware validado: Mac Studio M3 Ultra con 96 GB de memoria unificada, usando la variante 3/8-bit y su runtime MLX-Serve V2 parcheado correspondiente. En esa carga de trabajo se redujo la memoria pico medida respecto a la referencia 4/8-bit.
- GPU NVIDIA: no disponible; el pack es específico de MLX y Apple Silicon, no de CUDA.
- Compatibilidad con GPU de consumo: no disponible para este formato; el requisito de memoria de 96 GB o más excluye las GPU consumer convencionales en este pack.
- Despliegue: exclusivamente el runtime `mlx-serve` parcheado de ddalcu, compilado desde `engine/README.md`. No usar los ejemplos automáticos de `mlx-lm` o `mlx-vlm` de Hugging Face.
- Configuración de arranque conservadora para texto: `MLX_SERVE_CACHE_LIMIT=2147483648`, `MLX_SERVE_NGRAM_WARM=0`, `--ctx-size 32768`, `--kv-quant 8`, `--prefill-chunk 1024`, `--no-mtp`, `--no-pld`.
- Límite de memoria cableada: el autor no recomienda aumentar el wired-memory-limit ni saltarse la admisión de memoria.
- Latencia y throughput: no disponibles como cifras absolutas; solo se documenta una reducción relativa de memoria pico para la variante 3/8-bit en la carga validada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este pack (4/8-bit) | 133.195.562.899 | 32.768 en config. documentada | MLX `mlx-serve` + `ngram_table.bin` | qwen-community-1.0 | Variante de calidad, ~107 GB |
| Variante 3/8-bit del mismo autor | 133.195.562.899 | 32.768 en config. documentada | MLX `mlx-serve` + `ngram_table.bin` | qwen-community-1.0 | Expertos MoE a 3 bits, ~86 GB, validada en M3 Ultra 96 GB |
| ARC4NUM MLX-Serve 4bit | 133.195.562.899 | no disponible | MLX `mlx-serve` | no disponible | Pack original byte-idéntico (102/102 archivos) |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | safetensors | no disponible | Fuente sin cuantizar de la que deriva este pack |

## Limitaciones y advertencias

- No es un checkpoint genérico: no funciona con Transformers, `mlx-lm` ni `mlx-vlm` estándar; requiere el runtime parcheado y el archivo `ngram_table.bin` en su ubicación esperada.
- El parche MTP modifica el motor de inferencia, no los pesos: descargar solo los pesos no instala la corrección.
- El modelo es una variante uncensored, con menor rechazo de contenido; en producción exige filtros y políticas de uso adicionales.
- Riesgo de alucinación no cuantificado en la información disponible; no hay benchmarks estándar publicados.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Licencia `qwen-community-1.0`: hay que revisar el archivo LICENSE antes de cualquier uso comercial.
- El endpoint HTTP del ejemplo escucha en loopback; exponerlo externamente solo tras añadir autenticación y control de acceso.
- Las etiquetas 4/8-bit y 3/8-bit describen el compromiso previsto entre los packs, no una garantía de que el 4/8-bit sea universalmente más preciso ni de que el 3/8-bit tenga calidad o velocidad equivalentes.
- Los resultados medidos son dependientes de carga de trabajo, contexto, runtime y hardware, y no deben compararse entre procedimientos de evaluación distintos.
- El pack ocupa unos 107 GB; requiere SSD rápido y espacio de trabajo adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit
- Variante 3/8-bit: https://huggingface.co/yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-3-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fuente sin censura: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Pack original byte-idéntico: https://huggingface.co/ARC4NUM/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit
- Motor y conversor mlx-serve: https://github.com/ddalcu/mlx-serve
