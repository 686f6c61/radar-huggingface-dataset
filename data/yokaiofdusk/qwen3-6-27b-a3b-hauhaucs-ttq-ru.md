# YokaiOfDusk/Qwen3.6-27b-A3B-HauhauCS-TTQ-RU

## Resumen

Qwen3.6-27b-A3B-HauhauCS-TTQ-RU es una versión podada y cuantizada de un modelo MoE de la familia Qwen3.6, publicada por el usuario YokaiOfDusk en Hugging Face. Parte del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, del que se han eliminado 64 de sus 256 expertos (quedando 192) mediante un criterio de relevancia calculado sobre un corpus ruso, y se ha cuantizado con un receta similar a TTQ. El objetivo declarado es encajar en 16 GB de VRAM manteniendo la calidad en ruso y ganando velocidad frente al original.

El resultado es un GGUF de 12,36 GiB en Q3_K_M (frente a los 15,84 GiB del TTQ Q3_K_M sin podar) que, según el autor, alcanza unas 142 tokens por segundo en LM Studio frente a las 125-130 del original. La poda de expertos es irreversible: los expertos eliminados no están en el archivo y no pueden recuperarse. El modelo está orientado a roleplay y conversación sin restricciones en ruso, con el inglés como idioma secundario y con una degradación medible en este último (PPL en 1,126 frente a 1,015 del original).

La relevancia actual del modelo es acotada: se trata de una adaptación de nicho (ruso, roleplay, sin censura) sobre una arquitectura MoE grande, con licencia Apache 2.0 y pensada para inferencia local en GPU de consumo. No es un modelo de propósito general ni compite en benchmarks estándar de razonamiento o código; su interés está en la técnica de poda de expertos guiada por imatrix y en la optimización de despliegue en VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivado de Qwen3.6-35B-A3B; 192 expertos tras poda (original: 256) |
| Parametros totales | 26.602.304.128 (26,6 mil millones) |
| Parametros activos | 8 expertos por token (expert_used_count = 8), valor no expresado en parámetros absolutos en la información disponible |
| Longitud de contexto | Hasta 128k declarado (con cuantización q8 del KV-cache); en la práctica limitado por VRAM |
| Tipos de cuantizacion | Q3_K_M (12,36 GiB) y Q4_K_M (15,52 GiB); receta TTQ-like con hasta Q3_K/IQ4_XS para expertos |
| Idiomas soportados | Ruso (principal) e inglés (secundario, degradado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) heredado de Qwen3.6-35B-A3B. Sobre esa base, el autor aplica una poda de expertos: de los 256 expertos originales se conservan 192, seleccionados mediante una puntuación de utilidad calculada como la suma, sobre las columnas de la matriz de bajada, del producto entre la suma de cuadrados de activaciones y la norma al cuadrado de los pesos de bajada (score[e] = Σ_j in_sum2[e, j] · ||W_down[e][:, j]||²). La calibración se realizó con 526.000 tokens de un corpus ruso, y la evaluación con 40 fragmentos de 512 tokens.

El `expert_used_count` se mantiene en 8 tras probar valores entre 4 y 16; según el autor, 12 y 16 empeoraban el ruso (hasta +6 % de perplejidad) y resultaban más lentos. La cuantización sigue una receta TTQ-like (hasta Q3_K/IQ4_XS en los expertos), que según el autor se traslada bien a MoE porque solo unos pocos expertos están activos por token, y degrada en cambio en modelos densos. No se documentan en la información disponible detalles sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) ni sobre el proceso de "uncensoring" del modelo base; el autor solo indica que el modelo base es una versión sin restricciones de la familia Qwen3.6.

## Capacidades

- Generación de texto conversacional en ruso, con el inglés como idioma secundario funcional pero degradado.
- Roleplay y conversación multi-turno sin restricciones de contenido (modelo uncensored, etiquetado 18+).
- Generación de texto creativo y narrativo en ruso.
- Conversación abierta con contexto largo (hasta 128k declarados, con limitaciones prácticas de VRAM).
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso en la información disponible.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas a ruso e inglés; el resto de idiomas no está soportado de forma declarada.

## Casos de uso

- Roleplay y ficción interactiva en ruso: el modelo está afinado explícitamente para este escenario, sin filtros de contenido, y su ventana de contexto permite mantener personajes y tramas a lo largo de conversaciones largas.
- Chat de personajes y entretenimiento conversacional: el formato GGUF y su tamaño de 12,36 GiB permiten ejecutarlo en una GPU de 16 GB con offload completo, lo que facilita su despliegue local para aplicaciones de chat.
- Generación de narrativa y contenido creativo en ruso: la perplejidad en ruso se mantiene en el rango del original (KLD 0,059 en base y 0,050 en holdout), por lo que es adecuada para texto libre en ese idioma.
- Prototipado de asistentes conversacionales en ruso en hardware de consumo: al caber en 16 GB de VRAM con Q3_K_M, permite iterar en estaciones de trabajo con RTX 4090 o similares sin infraestructura de servidor.
- Investigación sobre poda de expertos en MoE: el modelo sirve como caso de estudio reproducible de poda guiada por imatrix y de su impacto medido en KLD y perplejidad.
- Evaluación de cuantización TTQ en arquitecturas MoE: los archivos publicados y las métricas del autor permiten comparar el comportamiento de la receta frente a cuantizaciones estándar.
- Despliegue en llama.cpp o LM Studio para pruebas de latencia: el autor reporta unas 142 tokens por segundo, útil para validar viabilidad de aplicaciones interactivas en local.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (KLD y perplejidad frente a Q8_K_P con 256 expertos; calibración con 526k tokens de ruso, evaluación con 40 fragmentos de 512 tokens):

| Variante | Tamano | KLD ru (base) | KLD ru (holdout) | PPL en | Velocidad (t/s) |
|---|---|---|---|---|---|
| TTQ Q3_K_M original (sin podar) | 15,84 GiB | 0,053 | 0,046 | 1,015 | ~125-130 |
| Qwen-Q4 | 15,52 GiB | 0,032 | 0,027 | 1,121 | 108 |
| Qwen-TTQ-Q3 (esta modelo) | 12,36 GiB | 0,059 | 0,050 | 1,126 | 142 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,36 GiB para el archivo Q3_K_M, que cabe completo en 16 GB de VRAM; el Q4_K_M ocupa 15,52 GiB y no cabe en 16 GB junto con el KV-cache.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080/4070 Ti Super (16 GB) para el Q3_K_M con offload completo; para el Q4_K_M se recomienda 24 GB o aceptar offload parcial.
- Cabe en GPU de consumo de 16 GB con el cuantizado Q3_K_M; en tarjetas de 24 GB puede usarse el Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: aproximadamente 142 tokens por segundo en LM Studio con Q3_K_M según el autor, frente a 125-130 del original sin podar.
- El contexto largo (hasta 128k con KV-cache q8) consume VRAM adicional y en la práctica requiere offload, según advierte el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27b-A3B-HauhauCS-TTQ-RU (esta modelo) | 26,6B totales, 192 expertos, 8 activos | Hasta 128k declarado | Apache 2.0 | GGUF | Podado y cuantizado para 16 GB de VRAM; ruso prioritario |
| TTQ Q3_K_M original (sin podar) | 35B (base), 256 expertos | No disponible | Apache 2.0 (base) | GGUF | 15,84 GiB; KLD ru 0,053; ~125-130 t/s |
| Qwen-Q4 | No disponible | No disponible | No disponible | GGUF | 15,52 GiB; KLD ru 0,032; 108 t/s; más preciso en texto crudo |
| YokaiOfDusk/Qwen3.8-9b-distil-ru | 9B (denso) | No disponible | No disponible | No disponible | Modelo denso con vocabulario reducido, para GPUs más pequeñas |

La comparativa con modelos de la misma categoría fuera de esta familia no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El inglés está degradado: PPL en 1,126 frente a 1,015 del original; el autor recomienda usar la versión estándar para inglés.
- La poda de expertos es irreversible: los 64 expertos eliminados no están en el archivo y no pueden recuperarse.
- El contexto de 128k es teórico: el KV-cache a esas longitudes consume VRAM más rápido de lo que ahorra la poda, por lo que requiere offload.
- Modelo uncensored orientado a contenido NSFW y roleplay, etiquetado 18+; no es adecuado para aplicaciones que requieran filtros de contenido o moderación.
- Riesgo de alucinación no cuantificado en la información disponible; como modelo conversacional sin benchmarks estándar, no hay evidencia publicada sobre su fiabilidad factual.
- Licencia Apache 2.0 permite uso comercial, pero el carácter uncensored traslada al desplegador la responsabilidad sobre el contenido generado.
- No se documentan capacidades de tool calling, agentes ni visión; no debe asumirse su disponibilidad.
- El modelo base es una variante "uncensored" de Qwen3.6; los sesgos del modelo original no están documentados en la información disponible.
- El rendimiento medido (142 t/s) corresponde a LM Studio con Q3_K_M; el throughput real variará según hardware, backend y longitud de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/YokaiOfDusk/Qwen3.6-27b-A3B-HauhauCS-TTQ-RU
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Receta TTQ y cuantizados de referencia: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Modelo denso del mismo autor: https://huggingface.co/YokaiOfDusk/Qwen3.8-9b-distil-ru
