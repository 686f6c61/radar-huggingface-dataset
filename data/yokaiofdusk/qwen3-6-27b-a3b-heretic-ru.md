# YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru

## Resumen

Qwen3.6-27B-A3B-Heretic-Ru es una versión podada y cuantizada del modelo `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, publicada por el usuario YokaiOfDusk. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 26.602.304.128 parámetros totales (unos 26,6 mil millones), del que se han eliminado 64 de los 256 expertos originales (configuración P192) mediante una puntuación de utilidad calibrada con un corpus ruso de 526.000 tokens. El objetivo declarado es reducir el tamaño lo suficiente para que el modelo quepa íntegramente en una GPU de 16 GB de VRAM sin pérdida apreciable de calidad en ruso.

El modelo está orientado a generación de texto conversacional y roleplay en ruso, sin restricciones de contenido (uncensored, etiquetado 18+), y se distribuye exclusivamente en formato GGUF para llama.cpp. La poda de expertos es irreversible y se combinó con un esquema de cuantización tipo TTQ (Q3_K_M para el archivo principal), lo que da como resultado un fichero de 12,36 GiB que mantiene un uso de 8 expertos por token (el valor original de la arquitectura).

Su relevancia actual radica en la demostración práctica de que la poda selectiva de expertos en modelos MoE, guiada por una matriz de importancia (imatrix) específica de un idioma, permite reducir el peso del modelo un 22 % y aumentar el throughput hasta unas 142 t/s en LM Studio, con una divergencia KL frente a la referencia Q8_K_P que el autor sitúa en el rango de 0,050-0,059 en ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, base Qwen3.6, podada a 192 expertos |
| Parámetros totales | 26.602.304.128 (26,6 B) |
| Parámetros activos | 8 expertos por token (expert_used_count = 8); número de parámetros activos no disponible |
| Longitud de contexto | Hasta 128k con caché KV en q8 (según el autor, requiere offload); no se especifica el contexto nativo del modelo base |
| Tipos de cuantización | GGUF Q3_K_M (12,36 GiB) y Q4_K_M (15,52 GiB); esquema tipo TTQ con hasta Q3_K/IQ4_XS en los expertos |
| Idiomas soportados | Ruso (principal) e inglés (secundario, con degradación declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura MoE de tipo transformer con 256 expertos y un enrutamiento que activa 8 expertos por token. Sobre esa base, el autor aplicó una poda de 64 expertos (los considerados menos relevantes para ruso) puntuando cada experto con una fórmula que combina la suma de las segundas componentes de la matriz de enrutamiento (`in_sum2`) con la norma al cuadrado de las filas correspondientes de la matriz `W_down`. La calibración se realizó con 526.000 tokens de un corpus ruso, y la evaluación con 40 fragmentos de 512 tokens.

No se documenta en la información disponible ningún proceso de entrenamiento adicional, fine-tuning, RLHF o DPO sobre el modelo podado: la intervención se limita a la poda de expertos más la cuantización tipo TTQ. El autor justifica que el esquema TTQ funciona bien sobre MoE porque cada token solo activa un subconjunto de expertos, y advierte explícitamente que el mismo recetario degrada modelos densos (menciona un caso de 9B). También se probaron configuraciones de `expert_used_count` entre 4 y 16, concluyendo que 12 y 16 empeoraban el ruso (hasta +6 % de perplejidad) y eran más lentas, por lo que se mantuvo el valor original de 8.

## Capacidades

- Generación de texto conversacional en ruso, con orientación explícita a roleplay y contenido NSFW (modelo sin censura, 18+).
- Generación de texto en inglés, aunque con perplejidad degradada respecto al modelo original.
- Conversación multi-turno con ventana de contexto potencialmente larga (hasta 128k con caché KV q8, con requisitos de memoria elevados).
- Razonamiento y generación de texto general heredados del modelo base Qwen3.6.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face), lo que facilita su despliegue vía API.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Roleplay y narrativa interactiva en ruso: el modelo está afinado y calibrado para este escenario, sin filtros de contenido, lo que permite conversaciones de personaje sostenidas y temáticas adultas sin rechazos.
- Despliegue en GPU de consumo de 16 GB: el archivo Q3_K_M (12,36 GiB) cabe íntegramente en VRAM, lo que permite servir un MoE de 26,6 B en hardware como una RTX 4060 Ti 16 GB o RTX 4080 sin offload a CPU.
- Prototipado rápido de asistentes conversacionales en ruso: con ~142 t/s en LM Studio, es adecuado para iterar sobre prompts y flujos de diálogo con latencia baja.
- Investigación sobre poda de expertos: sirve como caso de estudio reproducible de cómo una imatrix específica de idioma permite eliminar el 25 % de los expertos con una divergencia KL de 0,050-0,059 frente a Q8_K_P.
- Generación de contenido creativo en ruso (ficción, guiones, diálogos) en entornos donde se requiere volumen y velocidad más que precisión factual.
- Evaluación comparativa de cuantizaciones: al ofrecer Q3_K_M y Q4_K_M del mismo merge, permite medir el compromiso entre tamaño, velocidad (142 t/s frente a 108 t/s del Q4) y calidad en tareas rusas.
- Fine-tuning o experimentación local en llama.cpp: el formato GGUF y la licencia Apache 2.0 facilitan su uso en pipelines de investigación sin restricciones comerciales.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (KLD y perplejidad frente a una referencia Q8_K_P con 256 expertos; calibración con 526k tokens de ruso, evaluación con 40 fragmentos de 512 tokens):

| Variante | Tamaño | KLD ru (base) | KLD ru (holdout) | PPL en | Velocidad (t/s) |
|---|---|---|---|---|---|
| TTQ Q3_K_M original (sin podar) | 15,84 GiB | 0,053 | 0,046 | 1,015 | ~125-130 |
| Qwen-Q4 | 15,52 GiB | 0,032 | 0,027 | 1,121 | 108 |
| Qwen-TTQ-Q3 (esta versión podada) | 12,36 GiB | 0,059 | 0,050 | 1,126 | 142 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,36 GiB para el archivo Q3_K_M (cabe completo en 16 GB) y 15,52 GiB para Q4_K_M (no cabe con caché KV en 16 GB; requiere 24 GB o offload parcial).
- GPU recomendadas: RTX 4060 Ti 16 GB, RTX 4080, RTX 4090 (24 GB para Q4_K_M), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, con el cuantizado Q3_K_M en tarjetas de 16 GB; el Q4_K_M requiere 24 GB o reparto entre VRAM y RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: ~142 t/s con Q3_K_M en LM Studio, frente a ~125-130 t/s del TTQ Q3_K_M original y 108 t/s del Qwen-Q4, según mediciones del autor.
- Contexto largo: el autor advierte que el caché KV a 128k consume VRAM más rápido de lo que ahorra la poda, por lo que el contexto extendido exige offload.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-A3B-Heretic-Ru (esta ficha) | 26,6 B (MoE, 8 expertos/token) | hasta 128k (con offload) | Apache 2.0 | GGUF Q3_K_M / Q4_K_M | Podado a 192 expertos, orientado a ruso, uncensored |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35 B (MoE, 256 expertos) | no disponible | Apache 2.0 | safetensors / GGUF | Modelo base sin podar; mayor tamaño y menor velocidad |
| TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF | ~35 B (MoE, 256 expertos) | no disponible | Apache 2.0 | GGUF TTQ | Receta de cuantización TTQ sobre el base, sin poda; ~125-130 t/s en Q3_K_M |
| YokaiOfDusk/Qwen3.8-9b-distil-ru | ~9 B (denso) | no disponible | no disponible | GGUF | Alternativa densa con vocabulario reducido para GPUs más pequeñas |

## Limitaciones y advertencias

- El inglés está degradado: perplejidad de 1,126 frente a 1,015 del original; el autor recomienda usar la versión no podada para tareas en inglés.
- La poda es irreversible: los 64 expertos eliminados no están en el archivo y no pueden recuperarse ni completarse a posteriori.
- Contenido sin censura y explícitamente etiquetado 18+: puede generar material NSFW y no incorpora salvaguardas de contenido; requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni benchmarks de razonamiento en la información disponible.
- El contexto de 128k es teórico en la práctica: el caché KV a longitudes largas excede la VRAM disponible en tarjetas de 16 GB y obliga a offload, con la consiguiente caída de rendimiento.
- El rendimiento está medido en un único entorno (LM Studio) y con prompts de ruso; no hay datos de throughput con concurrencia ni de latencia en servidores tipo vLLM/TGI.
- Aunque la licencia es Apache 2.0, el modelo deriva de una cadena de modelos uncensored; conviene revisar las condiciones del modelo base y de la receta TTQ de TokenTinkerer antes de uso comercial.
- El modelo está especializado en ruso: su utilidad fuera de ese idioma es limitada y no se documentan capacidades multilingües adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YokaiOfDusk/Qwen3.6-27b-A3B-Heretic-Ru
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Receta y cuantizados TTQ de referencia: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Modelo denso alternativo del mismo autor: https://huggingface.co/YokaiOfDusk/Qwen3.8-9b-distil-ru
- Fichero de integridad SHA256SUMS: incluido en el repositorio del modelo (SHA256SUMS)
