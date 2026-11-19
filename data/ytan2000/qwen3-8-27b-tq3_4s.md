# YTan2000/Qwen3.8-27B-TQ3_4S

## Resumen

Qwen3.8-27B-TQ3_4S es una cuantización GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario YTan2000. No se trata de un modelo nuevo, sino de una compilación optimizada para el runtime TurboQuant (fork de llama.cpp mantenido por turbo-tan) que emplea el tipo de tensor propietario TQ3_4S a 4,24 bits por peso, reduciendo el peso del modelo a 13,8 GB manteniendo la ventana de contexto nativa de 262.144 tokens.

El modelo base emplea la arquitectura qwen3_5, una variante híbrida que combina 48 capas de Gated DeltaNet (atención lineal) con 16 capas de Gated Attention clásica, sobre un total de 64 capas y 27.320.697.856 parámetros. Incorpora además cabezas MTP (Multi-Token Prediction) entrenadas, lo que permite decodificación especulativa nativa con un bloque borrador integrado en el propio GGUF.

Su relevancia actual radica en que demuestra que un modelo de 27B con contexto de 262K puede servirse en una única GPU de consumo (RTX 3090 de 24 GB) a velocidades de hasta 125 tok/s mediante decodificación especulativa MTP y un borrador DFlash2. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque la dependencia de un fork no estándar de llama.cpp limita su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 híbrida: 64 capas (48 Gated DeltaNet de atención lineal + 16 Gated Attention), con cabezas MTP entrenadas |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | TQ3_4S (4,24 BPW) con capas de salida y embeddings de tokens en q6_K (receta "out6k"); caché KV configurable (q8_0, q4_0, tq3_0) |
| Idiomas soportados | en (inglés) según la model card; el modelo base Qwen3.8-27B es multilingüe, pero esta ficha solo declara inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores de visión mmproj en BF16 y F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida denominada qwen3_5, que intercala 48 capas de Gated DeltaNet —un mecanismo de atención lineal con estado recurrente que reduce el coste computacional en contextos largos— con 16 capas de Gated Attention tradicional. Esta combinación busca mantener la calidad de la atención completa en puntos clave de la red mientras se abarata el procesamiento de secuencias de hasta 262.144 tokens. El modelo incorpora además cabezas MTP (Multi-Token Prediction) entrenadas durante el preentrenamiento, que actúan como borrador interno para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base; la model card de esta cuantización no los detalla. La innovación técnica destacable de esta publicación concreta es doble: por un lado, el tipo de tensor TQ3_4S del runtime TurboQuant, que permite comprimir a 4,24 BPW preservando capas sensibles (salida y embeddings) en q6_K; por otro, la integración de las cabezas MTP en el GGUF para servir decodificación especulativa sin un modelo borrador externo. La versión v2 del archivo incrusta la plantilla de chat corregida froggeric v22, que soluciona un fallo con argumentos de herramientas en formato string de OpenAI y suprime el direccionamiento forzado a razonamiento extendido cuando el modo thinking está desactivado.

## Capacidades

- Generación de texto conversacional y de larga longitud con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking configurable mediante `--reasoning-format deepseek` y `--reasoning-budget N`; el autor recomienda presupuestos acotados (por ejemplo, 32.768 tokens) para evitar bucles de planificación.
- Comprensión de imágenes y vídeo al cargar los proyectores `mmproj-BF16.gguf` o `mmproj-F16.gguf` con el flag `--mmproj`.
- Tool calling y function calling en formato OpenAI, con soporte tanto de argumentos como diccionario como de cadenas JSON en la plantilla v2.
- Decodificación especulativa nativa mediante cabezas MTP (`--spec-type draft-mtp`) y compatible con borradores externos DFlash2.
- Soporte de agentes y razonamiento multi-paso, con recomendación de desactivar el razonamiento (`--reasoning off`) en cargas agenticas y de benchmarks.
- Generación de código, incluida la creativa de un solo disparo, con mejor rendimiento medido en esfuerzo de razonamiento bajo.
- Capacidades multilingües heredadas del modelo base, aunque la model card solo declara inglés de forma explícita.

## Casos de uso

- Asistencia de código en estación de trabajo local: con 13,8 GB de pesos y decodificación MTP a más de 100 tok/s en una RTX 3090, el modelo puede integrarse en un IDE o CLI de agente sin depender de API externa, manteniendo el contexto de un repositorio mediano dentro de la ventana de 262K tokens.
- Procesamiento de documentos largos: informes, expedientes o transcripciones de varias decenas de miles de tokens caben en una sola pasada gracias al contexto nativo de 262.144 tokens, sin necesidad de troceado ni recuperación externa.
- Agentes con tool calling: la plantilla v2 acepta argumentos de herramientas en formato string estándar de OpenAI, lo que permite conectarlo a frameworks de agentes existentes (LangChain, harnesses propios) y ejecutar flujos multi-paso con llamadas a APIs.
- Análisis de imágenes y vídeo en local: cargando el proyector mmproj, el modelo puede describir capturas, diagramas o fotogramas en pipelines de inspección o accesibilidad sin enviar datos a la nube.
- Generación de código creativa de un solo disparo: el autor midió 5 de 6 muestras limpias con esfuerzo de razonamiento bajo, lo que lo hace adecuado para prototipado rápido y generación de módulos autocontenidos.
- Servicio de inferencia autoalojado para equipos pequeños: con llama-server y una única GPU de 24 GB se puede ofrecer un endpoint compatible con OpenAI a varios usuarios mediante `-np` y caché KV cuantizada.
- Experimentación en investigación sobre decodificación especulativa: al incluir cabezas MTP y ser compatible con borradores DFlash2 y con el vocabulario de borrador restringido, sirve como banco de pruebas para medir aceleraciones de decodificación.

## Benchmarks y rendimiento

El model-index de la model card no contiene resultados (`results: []`), por lo que no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos por el autor son de rendimiento de inferencia y de calidad en pruebas internas:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificación larga (v2, DFlash2 + KV q4_0) | 125,2 tok/s | RTX 3090, prompt de 839 tokens, 4096 generados, reasoning off, contexto 262K |
| Decodificación larga (MTP interno, cadena 3 + KV q4_0) | 107,9 tok/s | RTX 3090, mismas condiciones |
| Suite de tool calling (v1 → v2) | 81,7 → 86,7 | Plantilla oficial frente a froggeric v22 |
| Codegen creativo one-shot, esfuerzo bajo | 5/6 muestras limpias | 6 muestras, RTX 3090 |
| Codegen creativo one-shot, esfuerzo medio | 3/6 muestras limpias | 6 muestras, RTX 3090 |
| Codegen creativo one-shot, esfuerzo xhigh | intermitente | Bucles de razonamiento observados (hasta 332k caracteres sin salida) |

## Requisitos de hardware

- VRAM estimada para los pesos: 13,8 GB para el GGUF TQ3_4S, más 0,93 GB si se carga el proyector de visión.
- Caché KV adicional según contexto y cuantización: el autor emplea q4_0, q8_0 o tq3_0; a 32.768 tokens la huella es moderada, pero a 262.144 tokens requiere cuantización agresiva de la caché para caber en 24 GB.
- GPU recomendadas: RTX 3090 (24 GB) es la plataforma validada por el autor; cabría también en RTX 4090 (24 GB), y con holgura en A100 (40/80 GB), H100 (80 GB) y L40S (48 GB).
- Cabe en GPU de consumo de 24 GB con contexto reducido o caché KV cuantizada; en GPUs de 16 GB exigiría recortar contexto o descargar capas a CPU, lo que degrada el rendimiento.
- Despliegue: exclusivamente mediante el fork turbo-tan/llama.cpp-tq3 (compilación posterior a `45efd44ec`); las compilaciones estándar de llama.cpp no pueden cargar el tipo de tensor TQ3_4S. No es compatible con vLLM, TGI ni Ollama sin conversión previa.
- Throughput medido: 125,2 tok/s con DFlash2 y 107,9 tok/s con MTP interno en RTX 3090, flujo único. El flag `--no-spec-draft-backend-sampling` aporta aproximadamente un 25 % de mejora de throughput al mantener la reutilización de grafos CUDA.
- Ajuste óptimo de decodificación especulativa: `--spec-draft-n-max 2` según medición del autor; con vocabulario de borrador restringido se usa `--spec-draft-n-max 3`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion tipica | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TQ3_4S (esta ficha) | 27,3B | 262.144 | TQ3_4S 4,24 BPW, 13,8 GB | Apache-2.0 | Requiere fork TurboQuant de llama.cpp; MTP integrado |
| Qwen/Qwen3.8-27B (BF16 original) | 27,3B | 262.144 | BF16, aproximadamente 54 GB | Apache-2.0 | Referencia de calidad; no cabe en GPU de 24 GB |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | 262.144 | GGUF estándar (Q4_K_M y otros) | Apache-2.0 | Compatible con llama.cpp estándar; sin tipo TQ3_4S |
| z-lab/Qwen3.8-27B-DFlash2-GGUF | 27,3B (base) | 262.144 | GGUF borrador | no disponible | Borrador externo de decodificación especulativa, compatible con esta cuantización |

No se dispone de datos de benchmarks comparativos de calidad entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime no estándar: el modelo solo carga en el fork turbo-tan/llama.cpp-tq3; no funciona en llama.cpp oficial, Ollama, LM Studio, vLLM ni TGI sin reconversión.
- La model card declara únicamente inglés como idioma soportado; el rendimiento en castellano u otras lenguas no está verificado y puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para esta cuantización.
- El razonamiento sin límite (xhigh) puede entrar en bucles de planificación y producir salidas vacías; se recomienda fijar `--reasoning-budget` y usar `--reasoning-budget-message`.
- El esfuerzo de razonamiento medio produce subpensamiento con errores de andamiaje de módulos en generación de código; el autor recomienda esfuerzo bajo para codegen de un solo disparo.
- La versión v1 tiene un fallo en la plantilla de chat oficial que rompe el tool calling con argumentos en formato string; debe usarse la v2 o aplicar la plantilla froggeric v22 manualmente.
- La cuantización a 4,24 BPW introduce pérdida de calidad respecto al BF16 original; no se han publicado mediciones de esa degradación.
- El contexto completo de 262K exige cuantizar la caché KV y dispone de VRAM limitada en GPUs de 24 GB; contextos muy largos pueden degradar la calidad de recuperación.
- La licencia Apache-2.0 del modelo base permite uso comercial, pero conviene verificar las condiciones del fork TurboQuant y del vocabulario de borrador (HyperQwen, Apache-2.0) antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ3_4S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime TurboQuant para llama.cpp: https://github.com/turbo-tan/llama.cpp-tq3
- Recetas de despliegue en RTX 3090: https://github.com/turbo-tan/recipes/tree/main/qwen3.8-27b-tq3_4s-mtp-rtx3090
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Borrador DFlash2 (paper): https://arxiv.org/abs/2602.06036
- Borrador DFlash2 (código): https://github.com/z-lab/dflash
- Borrador DFlash2 (GGUF): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Vocabulario de borrador HyperQwen: https://github.com/syv-ai/HyperQwen
