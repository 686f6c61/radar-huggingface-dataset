# stevyhacker/Gemma-4-E2B-LokalBot-GGUF

## Resumen

Gemma-4-E2B-LokalBot-GGUF es una familia de fine-tunes cuantizados del modelo base `google/gemma-4-E2B`, publicados por el desarrollador independiente stevyhacker para su aplicación de autocompletado en dispositivo LokalBot. El modelo está especializado en "Cotyping", es decir, autocompletado inline de texto mientras el usuario escribe, con manejo de contexto fundamentado del tipo `Visible in this window:` y `Relevant saved facts:`. Es un modelo bilingüe inglés-serbio (alfabeto latino y cirílico) con soporte declarado para alemán, francés y español.

El repositorio distribuye cuatro ficheros GGUF en tres puntos de operación (`v2`, `v3`, `v4`) con cuantizaciones `Q5_K_M` con embeddings en `Q4_K` y `Q6_K`, generados a partir de pesos fusionados en BF16 con una imatrix bilingüe EN/SR. El modelo base cuenta con 4.647.450.147 parámetros totales según los safetensors del modelo original, aunque el autor lo etiqueta como "E2B" (effective 2B), lo que sugiere una arquitectura con embeddings por capa (Per-Layer Embeddings, PLE) que reduce el coste efectivo de cómputo.

La relevancia actual del modelo reside en su enfoque de despliegue en hardware de consumo: los ficheros pesan entre 3,02 GB y 3,85 GB, caben en GPUs de gama media y logran latencias de decodificación de 20-27 ms en un Apple M4 Max. Está liberado bajo licencia Apache 2.0 y se distribuye exclusivamente en formato GGUF compatible con llama.cpp y endpoints compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, con Per-Layer Embeddings) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M + PLE Q4_K, Q6_K |
| Idiomas soportados | en, sr (latino y cirílico), de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B`, un transformer de la familia Gemma 4 con 4.647 millones de parámetros totales y una innovación denominada Per-Layer Embeddings (PLE), que el autor cuantiza de forma separada a `Q4_K` en la variante `Q5_K_M` para reducir el uso de RAM del host (578 MiB menos) y de VRAM (208 MiB menos). El fine-tuning se realizó sobre los pesos base preentrenados para la tarea específica de autocompletado inline de LokalBot, con contexto fundamentado de ventana visible y memoria guardada.

La cuantización emplea una imatrix bilingüe inglés-serbio generada por el propio autor, aplicada con `llama.cpp`. Se ofrecen tres puntos de operación: `v4` con escala `s=1.0` (por defecto, más preciso), `v3` con escala `s=1.15` (mayor cobertura de límites de palabra y recall en serbio, a costa de más falsos positivos) y `v2` heredado con imatrix estándar. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto orientada a autocompletado inline (Cotyping) en inglés y serbio (latino y cirílico).
- Manejo de contexto fundamentado: interpreta secciones `Visible in this window:` y `Relevant saved facts:` para condicionar la sugerencia.
- Recuperación de memoria guardada y abstención controlada cuando no hay información relevante (0 recuperaciones falsas declaradas en las suites de memoria).
- Detección de límites de palabra (word boundary) para sugerencias midword y prefix-confident.
- Soporte multilingüe declarado para inglés, serbio, alemán, francés y español, aunque el entrenamiento específico se centra en EN/SR.
- Capacidad de autocompletado en correos electrónicos, texto científico, formateo y otros dominios evaluados en los benchmarks del autor.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Autocompletado inline en editores de texto y correo: el modelo está entrenado específicamente para predecir la continuación de una frase en curso, con latencias de 20-27 ms por límite de palabra en Apple M4 Max, lo que lo hace viable para sugerencias en tiempo real mientras el usuario escribe.
- Asistente de escritura bilingüe inglés-serbio: cubre ambos alfabetos del serbio (latino y cirílico) con recall medido del 13-22 % en las suites del autor, útil para usuarios que alternan idiomas en un mismo documento.
- Autocompletado con memoria de contexto: la variante `v4` maneja `Relevant saved facts:` y logra 26/26 en recall de memoria en las suites del autor, adecuada para asistentes que recuerdan datos del usuario (nombres, preferencias, historial) sin recuperar hechos obsoletos (0 stale facts declarados).
- Redacción asistida de correo electrónico: la suite de email del autor muestra precisiones del 77-80 % en `v4`, lo que permite sugerir continuaciones en hilos de correo con contexto de ventana visible.
- Despliegue en hardware de consumo: con 3,02 GB en `Q5_K_M` y 3,85 GB en `Q6_K`, cabe en GPUs de gama media y en equipos Apple Silicon, permitiendo autocompletado local sin conexión ni envío de datos a la nube.
- Integración en pipelines de CI/CD para generación de texto corto: el formato GGUF es compatible con llama.cpp y endpoints compatibles, lo que facilita su uso en servicios de generación de texto de baja latencia.
- Aplicaciones de accesibilidad: sugerencias de escritura para usuarios con dificultades motoras o de tecleado, gracias a la baja latencia y a la abstención controlada cuando no hay contexto suficiente.

## Benchmarks y rendimiento

Resultados publicados por el autor en Apple M4 Max con el binario de release de LokalBot, comparados con el `gemma-4-E2B.i1-Q6_K.gguf` estándar:

| Benchmark / pilar | Stock i1-Q6_K | v3 i1-Q6_K (s=1.15) | v4 i1-Q6_K (s=1.0) | v4 i1-Q5_K_M + pleQ4K (s=1.0) |
|---|---:|---:|---:|---:|
| Tamano de fichero | 3,85 GB | 3,85 GB | 3,85 GB | 3,02 GB (-21,4 %) |
| Engine Overall (788) acc / cov / prec | 23,10 % / 46,1 % / 50,1 % | 30,71 % / 58,6 % / 52,4 % | 25,25 % / 48,4 % / 52,2 % | 25,51 % / 49,4 % / 51,7 % |
| Engine correctas / erroneas mostradas | 182 / 181 | 242 / 220 | 199 / 182 | 201 / 188 |
| Ingles (624) acc / prec | 25,32 % / 49,5 % | 31,41 % / 52,0 % | 26,60 % / 51,9 % | 26,92 % / 52,0 % |
| Email (52) acc / prec | 50,00 % / 74,3 % | 55,77 % / 70,7 % | 53,85 % / 80,0 % | 53,85 % / 77,8 % |
| Formateo (39) acc / prec | 41,03 % / 61,5 % | 41,03 % / 53,3 % | 41,03 % / 57,1 % | 41,03 % / 57,1 % |
| Ciencia (85) acc / prec | 21,18 % / 39,1 % | 18,82 % / 42,1 % | 22,35 % / 47,5 % | 22,35 % / 48,7 % |
| Otros idiomas (164) acc / prec | 14,63 % / 54,6 % | 28,05 % / 54,1 % | 20,12 % / 54,1 % | 20,12 % / 50,0 % |
| Serbio latino (66) acc / prec | 7,58 % / 55,6 % | 22,73 % / 46,9 % | 12,12 % / 42,1 % | 13,64 % / 45,0 % |
| Serbio cirilico (58) acc / prec | 8,62 % / 38,5 % | 18,97 % / 40,7 % | 13,79 % / 40,0 % | 12,07 % / 30,4 % |
| Midword q6pub_prod (288) acc / prec | 56,94 % / 74,2 % | 60,42 % / 71,3 % | 59,03 % / 73,6 % | 60,76 % / 75,8 % |
| Midword prefixconf_prod heldout (288) acc / prec / acc2 | 52,78 % / 67,3 % / 18,8 % | 54,86 % / 67,5 % / 18,4 % | 53,82 % / 68,9 % / 19,1 % | 52,78 % / 65,5 % / 19,1 % |
| Visible Context dev / heldout / link (30) | 6/8 / 14/18 / 3/4 | 8/8 / 18/18 / 4/4 | 8/8 / 18/18 / 4/4 | 8/8 / 17/18 / 4/4 |
| Memory dev (6) / heldout (12+10) / rel heldout (5+7) | 6/6 / 12+10 / 5+7 | 5/6 / 12+10 / 4+7 | 6/6 / 12+10 / 5+7 | 6/6 / 12+10 / 5+7 |
| Blind fresh_holdout_v2 (82) acc / prec / forb | 43,90 % / 87,8 % / 1 | 68,29 % / 91,8 % / 1 | 52,44 % / 89,6 % / 1 | 57,32 % / 94,0 % / 1 |
| Latencia M4 Max boundary med / typing p95 | 21,2 ms / 103,5 ms | 26,6 ms / 87,2 ms | 20,2 ms / 80,0 ms | 22,8 ms / 89,0 ms |
| Safety checks (28) / Russian drift | 0 unsafe / 0 drift | 0 unsafe / 0 drift | 0 unsafe / 0 drift | no disponible en el extracto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; los datos anteriores son métricas internas del autor sobre tareas de autocompletado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,02 GB en `Q5_K_M + PLE Q4_K` y 3,85 GB en `Q6_K`, según los tamanos de fichero publicados.
- RAM del host: el autor reporta 578 MiB adicionales de RAM en la variante `Q5_K_M + PLE Q4K` respecto a `Q6_K` por los Per-Layer Embeddings cuantizados a `Q4_K`.
- GPU recomendadas: el autor cita una RX 6600 XT con backend Vulkan (mejora del 6,9 % en caliente y 9,5 % en frío con la variante `Q5_K_M`), y un Apple M4 Max para las mediciones de latencia. No se publican requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con 3-4 GB de VRAM; cualquier GPU con al menos 4 GB libres es suficiente en teoría, aunque solo se documenta la RX 6600 XT.
- Opciones de despliegue: llama.cpp, endpoints compatibles (el tag `endpoints_compatible` figura en el repositorio). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: en Apple M4 Max, latencia mediana de límite de palabra de 20,2-26,6 ms y p95 de tecleado de 80,0-103,5 ms según la variante. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Gemma-4-E2B-LokalBot (este) | 4.647 M | no disponible | Apache 2.0 | GGUF | Autocompletado bilingüe EN/SR |
| google/gemma-4-E2B (base) | 4.647 M | no disponible | Apache 2.0 (según repo derivado) | safetensors / GGUF | Modelo base preentrenado |
| gemma-4-E2B.i1-Q6_K (stock) | 4.647 M | no disponible | Apache 2.0 | GGUF | Referencia de cuantización estándar |

No se dispone de datos sobre otros modelos comparables de la misma categoría (autocompletado inline en dispositivo) en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está fine-tuneado para autocompletado inline y contexto de ventana/memoria; su rendimiento en generación libre, razonamiento o código no está documentado y probablemente sea inferior al del modelo base.
- Cobertura lingüística limitada en la práctica: aunque declara cinco idiomas, el entrenamiento específico se centra en inglés y serbio; las métricas en "Otros idiomas" (164 muestras) se sitúan en el 14-28 % de accuracy.
- Precisión moderada: la precisión global del motor ronda el 50-52 %, lo que implica que aproximadamente la mitad de las sugerencias mostradas son incorrectas en las suites del autor.
- Riesgo de deriva al ruso: el autor mide explícitamente "Russian Drift" (0 en las variantes evaluadas), lo que sugiere que es un problema conocido en el dominio serbio/cirílico.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de Gemma 4, hereda los sesgos del modelo base.
- Riesgo de alucinación: no evaluado con métricas estándar; el autor reporta abstenciones controladas en memoria, pero no se ofrecen datos de alucinación en generación libre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base `google/gemma-4-E2B` y de Gemma en general, que pueden incluir condiciones adicionales de uso aceptable.
- Fecha de creación futura (2026-11-20) en los metadatos del repositorio, lo que puede indicar inconsistencias en el registro o un artefacto del entorno de publicación; conviene verificar la integridad de los ficheros mediante los SHA-256 publicados.
- Solo se distribuye en GGUF; no hay pesos safetensors del fine-tune, lo que limita su uso fuera de llama.cpp y endpoints compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stevyhacker/Gemma-4-E2B-LokalBot-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio de la aplicación LokalBot: https://github.com/stevyhacker/LokalBot
