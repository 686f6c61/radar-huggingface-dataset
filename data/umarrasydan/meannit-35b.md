# umarrasydan/meannit-35b

## Resumen

Meannit 35B es un ajuste fino del modelo Qwen3.6-35B-A3B de Alibaba, publicado por el desarrollador umarrasydan para su uso en Meannit, una aplicación de grabación y resumen de reuniones para macOS. El modelo está especializado en dos tareas concretas: el pulido de transcripciones de reuniones y la generación de resúmenes estructurados en JSON, además de la redacción de guiones de briefing hablados. Se distribuye exclusivamente en formato GGUF cuantizado para su ejecución local mediante llama.cpp.

El modelo hereda del Qwen3.6-35B-A3B una arquitectura híbrida con atención densa y capas de atención lineal GatedDeltaNet, junto con capas MoE de 256 expertos enrutados. El ajuste se realizó con LoRA sobre las proyecciones lineales del modelo base, con un total de 34.660.610.688 parámetros y un único archivo de pesos de 18,0 GB en cuantización mixta IQ4_NL.

Su relevancia radica en que demuestra un caso de uso de despliegue en dispositivo (on-device) para hardware Apple Silicon con 32 GB o más de memoria unificada, con un contexto de 65.536 tokens y métricas de rendimiento publicadas sobre un Apple M5 Ultra. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención densa y atención lineal GatedDeltaNet, capas MoE con 256 expertos enrutados y MLP compartida |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (el modelo base es MoE, pero la model card no publica el número de parámetros activos) |
| Longitud de contexto | 65.536 tokens (configuración de ejecución en Meannit); el tope de secuencia de entrenamiento fue 49.152 |
| Tipos de cuantizacion | IQ4_NL mixta: Q8_0 en embeddings, atención, ssm_out y expertos compartidos; Q6_K en la cabeza de salida y en ffn_down_exps de las capas 34, 38 y 39; IQ4_NL en el resto de ffn_down_exps; IQ3_S en ffn_gate_exps y ffn_up_exps |
| Idiomas soportados | inglés, malayo, indonesio y chino simplificado (según la composición del conjunto de entrenamiento); no se declara una lista oficial de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un único archivo: meannit-35b-v1-iq4_nl.gguf, 18.027.370.752 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B y conserva su estructura híbrida: 40 bloques con atención densa, capas de atención lineal GatedDeltaNet y capas MoE con 256 expertos enrutados por capa, además de una MLP compartida. El ajuste fino se aplicó en bfloat16 mediante LoRA con rango 32, alpha 32, dropout 0,05, 2 épocas, tasa de aprendizaje coseno de 1e-4, tope de secuencia de 49.152 tokens y pérdida calculada solo sobre los turnos del asistente. Los adaptadores se conectaron a las 310 proyecciones lineales densas de atención, de atención lineal GatedDeltaNet y de la MLP compartida, lo que supone 42,33 millones de parámetros entrenables (0,1204 % del total). El entrenamiento se realizó en modo no-thinking (`enable_thinking=False`).

El conjunto de datos consta de 1.729 ejemplos verificados de resumen y pulido de transcripciones, de los cuales 1.516 son únicos tras el rebalanceo por idioma, sin solapamiento con los conjuntos de evaluación reservados. La composición del split de entrenamiento incluye 458 ejemplos de resumen en inglés, 72 en malayo, 72 en chino simplificado y 66 en indonesio, más 710 de pulido en inglés, 134 en malayo, 132 en indonesio y 86 en chino simplificado. Los datos se generaron con profesores de pesos abiertos. Tras el ajuste, los pesos LoRA se fusionaron en CPU y el modelo resultante se convirtió a GGUF bfloat16 con `convert_hf_to_gguf.py` de llama.cpp (commit `d81235049384534c167caea52b85a694f6103d14`), generando 733 tensores en 40 bloques. La cuantización se guió por una matriz de importancia calculada con `llama-imatrix` sobre 94 fragmentos multilingües de calibración extraídos estrictamente del split de entrenamiento.

## Capacidades

- Generación de resúmenes de reuniones en JSON estructurado, con soporte de modo thinking con presupuesto de razonamiento de 1.024 tokens.
- Pulido de transcripciones por fragmentos de 1.200 tokens con 2 líneas de contexto de solo lectura y gramática GBNF dispersa que bloquea turnos medidos de 40 o más caracteres.
- Generación de guiones de briefing hablados a partir del resumen de la reunión.
- Procesamiento multilingüe limitado a inglés, malayo, indonesio y chino simplificado, con supresión de fugas de idioma entre ellos.
- Cumplimiento de restricciones gramaticales estrictas (GBNF) para forzar formatos de salida válidos.
- Operación en modo no-thinking para tareas de pulido con decodificación greedy.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Resumen automático de reuniones en local: la aplicación carga el modelo con 65.536 tokens de contexto y genera un JSON estructurado con decisiones, tareas y fechas límite, sin enviar datos a la nube.
- Pulido de transcripciones largas: el modelo procesa la transcripción en fragmentos de 1.200 tokens con contexto previo y una gramática que preserva los turnos medidos, lo que permite limpiar reuniones de varias horas en un Mac.
- Generación de briefings hablados: a partir del resumen estructurado, el modelo redacta un guion que la aplicación puede sintetizar en voz para el usuario antes de una reunión.
- Cumplimiento de fechas y campos estructurados: los benchmarks muestran 10 de 10 fechas de vencimiento válidas de octubre de 2026 en el conjunto de prueba, lo que lo hace adecuado para extracción de compromisos con fecha.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo mediante llama.cpp, encaja en escenarios donde la transcripción no puede salir del equipo del usuario.
- Procesamiento multilingüe de reuniones en inglés, malayo, indonesio y chino: el rebalanceo del entrenamiento y la ausencia de fugas de idioma en 131 reuniones lo hacen viable para equipos mixtos en esos idiomas.
- Integración en pipelines de productividad para macOS: la aplicación expone el modelo a través de la API C de llama.cpp con Flash Attention y caché KV en Q8_0, lo que permite incorporarlo a flujos de grabación y postprocesado.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo con el Qwen3.6-35B-A3B base (UD-IQ4_NL), el Gemma 4 26B-A4B-SFT ajustado (Q4_0) y el Meannit 4B (Q8_0), ejecutados a través del pipeline real de prompts y parser en Rust de Meannit.

| Métrica | Qwen3.6-35B-A3B base (UD-IQ4_NL) | Meannit 4B (Q8_0) | Meannit 35B (IQ4_NL) |
|---|---:|---:|---:|
| Errores estructurales de resumen en 75 reuniones (fast) | 139 | 0 | 6 |
| Etiquetas de hablante desnudas en 75 reuniones estructurales | 116 | 0 | 0 |
| Fugas de idioma en 131 reuniones (en, ms, id, zh) | 20 | 0 | 0 |
| Fechas de vencimiento válidas de octubre de 2026 (s_033 a s_042) | 3 de 10 | 3 de 10 | 10 de 10 |
| Parses correctos al primer intento en resumen de calidad en 28 reuniones (b=1024) | 89,3 % (25 de 28) | 89,3 % (25 de 28, fast) | 100,0 % (28 de 28) |
| Errores estructurales de resumen de calidad en 28 reuniones (b=1024) | 43 | 3 (fast) | 11 |
| Rechazos estructurales de pulido en 75 casos (GBNF dispersa) | 0 (plain) | 0 | 0 |
| Rechazos de pulido multichunk en 40 chunks (GBNF dispersa, max_tokens=8192) | 12,5 % (5 de 40, plain) | 7,5 % (3 de 40, pre-GBNF) | 2,5 % (1 de 40) |
| Transcripciones de pulido sin rechazos en 12 archivos (GBNF dispersa, max_tokens=8192) | 8 de 12 (plain) | 9 de 12 (pre-GBNF) | 11 de 12 |
| Tasa de edición en transcripción limpia | 0,0 % | 0,0 % | 0,0 % |
| RAM residente a 65.536 de contexto en Apple M5 Ultra (KV Q8_0) | 19,59 GB | 6,21 GB | 19,59 GB |
| Velocidad de prefill en Apple M5 Ultra | 3.881 tok/s | 4.934 tok/s | 4.066 tok/s |
| Velocidad de decode en Apple M5 Ultra | 125,7 tok/s | 130,5 tok/s | 122,5 tok/s |

Los 6 errores estructurales de resumen de Meannit 35B corresponden a decisiones únicas listadas en trampas de briefing de cero decisiones. El aumento de `max_tokens` de pulido de 2.048 a 8.192 eliminó los dos rechazos por límite de salida en MeetingBank (`qp_03` y `qp_04`), dejando 1 rechazo de alineación de 40 chunks en un solo intento antes del bucle de reintentos de producción. La model card menciona además una evaluación por jueces ciegos por pares (Opus 5.5 y Neon medium), pero el texto disponible se interrumpe y no incluye los resultados.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 19,59 GB residentes a 65.536 tokens de contexto con caché KV en Q8_0; el archivo binario ocupa 18,25 GiB en Apple Silicon.
- El autor indica que está pensado para Macs con 32 GB o más de memoria unificada.
- GPU recomendadas: Apple Silicon (validado en Apple M5 Ultra); no se publican datos para A100, H100 ni RTX 4090.
- No se confirma que quepa en GPU de consumo con 24 GB o menos; el requisito declarado es de 32 GB de memoria unificada en Mac.
- Despliegue mediante llama.cpp (API C), con Flash Attention habilitado y caché KV en Q8_0; no se documentan opciones para vLLM, TGI u Ollama.
- Latencia y throughput medidos en Apple M5 Ultra: prefill de 4.066 tok/s y decode de 122,5 tok/s a 65.536 de contexto.
- Para dictado, el autor recomienda el modelo Meannit 4B (4,6 GB residentes a 4.096 de contexto) por su presupuesto de latencia de 5 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meannit 35B | 34.660.610.688 | 65.536 (ejecución) | Apache 2.0 | GGUF IQ4_NL | Ajuste especializado en resumen y pulido de reuniones |
| Qwen3.6-35B-A3B (base) | no disponible en la información | no disponible | no disponible | safetensors y GGUF UD-IQ4_NL | Modelo base; 139 errores estructurales frente a 6 del ajuste en 75 reuniones |
| Gemma 4 26B-A4B-SFT | no disponible en la información | no disponible | no disponible | GGUF Q4_0 | Ajuste fino alternativo; solo aparece en la comparación de benchmarks |
| Meannit 4B | no disponible en la información | 4.096 (ejecución) | no disponible | GGUF Q8_0 | Modelo más pequeño del mismo autor para dictado; 6,21 GB residentes |

## Limitaciones y advertencias

- El modelo está especializado en resumen y pulido de transcripciones; no se documentan capacidades generales de razonamiento, código, matemáticas ni tool calling.
- Los idiomas cubiertos se limitan a inglés, malayo, indonesio y chino simplificado según los datos de entrenamiento; no hay lista oficial de idiomas y el rendimiento fuera de esos idiomas es desconocido.
- El conjunto de entrenamiento es pequeño (1.516 ejemplos únicos), lo que puede limitar la generalización a dominios de reuniones distintos de los representados.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks miden errores estructurales y fugas de idioma, no fidelidad factual del contenido.
- En el benchmark de resumen de calidad, Meannit 35B registra 11 errores estructurales frente a 3 de Meannit 4B, aunque obtiene el 100 % de parses correctos al primer intento.
- El pulido multichunk presenta un 2,5 % de rechazos (1 de 40 chunks) en un solo intento, por lo que requiere el bucle de reintentos de producción.
- El despliegue validado es exclusivamente llama.cpp sobre Apple Silicon; no hay datos de rendimiento en GPU NVIDIA ni en otros runtimes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-35B-A3B puede tener condiciones adicionales que no se detallan en la información disponible.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica una validación externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umarrasydan/meannit-35b
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Meannit 4B: https://huggingface.co/umarrasydan/meannit-4b
- Sitio de Meannit: https://meannit.com
- llama.cpp (commit de conversión): https://github.com/ggml-org/llama.cpp/commit/d81235049384534c167caea52b85a694f6103d14
