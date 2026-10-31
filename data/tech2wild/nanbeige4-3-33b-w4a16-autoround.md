# Tech2wild/Nanbeige4.3-33B-W4A16-AutoRound

## Resumen

Nanbeige4.3-33B-W4A16-AutoRound es una cuantización INT4 (esquema W4A16) del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige y cuantizado por Tony DeAngelo (Tech2Wild) utilizando la herramienta Intel AutoRound 0.16.1. El modelo original es un LLM denso de 33 mil millones de parámetros (52 bloques decoder, arquitectura tipo Llama) orientado a generación de texto conversacional en inglés y chino. Esta versión cuantizada reduce el tamaño en disco de 66,2 GB (BF16) a 20,8 GB, manteniendo la calidad mediante cuantización simétrica INT4 con group size 128 en las 364 capas lineales del modelo.

La relevancia de esta ficha radica en que permite desplegar un modelo de 33B en hardware de consumo: cabe en dos tarjetas RTX 3090 de 24 GB con tensor parallelism, dejando espacio para un pool de KV cache de más de 213.000 tokens en FP8. El autor publica además resultados de rendimiento medidos en esa configuración, lo que la convierte en una referencia práctica para despliegues locales de bajo coste con vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura tipo Llama, 52 bloques decoder) |
| Parámetros totales | 6.507.703.296 según safetensors del repo (el modelo base se comercializa como 33B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (configuración de servicio del quant; contexto del modelo base no disponible) |
| Tipos de cuantización | W4A16: INT4 simétrico, group size 128, formato GPTQ (`desc_act: false`); lm_head, embeddings y normas en FP16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de exportación auto_gptq, compatible con kernels GPTQ Marlin de vLLM) |

Nota: la discrepancia entre los 6,5 GB de parámetros registrados en safetensors y la denominación "33B" del modelo base sugiere que el registro de metadatos puede no reflejar el tamaño completo; el tamaño real del repo cuantizado es 20,8 GB, coherente con un modelo de ~33B parámetros en INT4.

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer decoder denso de 52 bloques con arquitectura tipo Llama. No se dispone de información publicada sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO del modelo base.

Respecto a la cuantización, se ha aplicado Intel AutoRound 0.16.1 con esquema W4A16: pesos en INT4 simétrico con group size 128 sobre las 364 capas lineales del modelo, manteniendo `lm_head`, embeddings y normas en FP16. El proceso usó 100 iteraciones de tuning por bloque con 128 muestras de calibración de 2.048 tokens del dataset NeelNanda/pile-10k, y la exportación se realizó en formato auto_gptq. La cuantización completa tardó 87 minutos en 2x RTX 3090.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo "thinking" activado por defecto, desactivable por petición mediante `chat_template_kwargs: {"enable_thinking": false}` (parser de razonamiento compatible con qwen3).
- Tool calling / function calling nativo, servible con `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Contexto largo: hasta 131.072 tokens en la configuración de servicio documentada, con pool de KV cache FP8 (e5m2) de 213.264 tokens.
- Evaluación de herramientas en 69 escenarios: 134/138 aciertos con thinking activado (Quality 97,1; Deployability 93,3) y 131/138 con thinking desactivado (Quality 94,9; Deployability 95,3).
- No hay indicios de capacidades de visión o audio; es un modelo de texto.

## Casos de uso

- Chatbot local de bajo coste: despliegue en 2x RTX 3090 con vLLM, ofreciendo 61-66 tok/s por stream, suficiente para asistentes conversacionales interactivos en entornos on-premise donde la privacidad es prioritaria.
- Agentes con tool calling: el parser qwen3_coder y la alta tasa de acierto en 69 escenarios de herramientas (134/138) lo hacen adecuado para pipelines de agentes que invocan APIs, buscadores o ejecutores de código.
- Procesamiento de documentos largos: con 131K tokens de contexto y prefill de ~1.770 tok/s, permite resumir o analizar documentos extensos (contratos, informes técnicos) en una sola pasada.
- Atención al cliente multi-turno: el pool de KV cache de 213.264 tokens en FP8 permite mantener muchas sesiones concurrentes (6 streams simultáneos a ~60 tok/s cada uno) sin degradar la latencia.
- Asistente de programación bilingüe: el soporte de tool calling estilo qwen3_coder y el modo thinking lo orientan a generación y revisión de código integrada en IDEs o pipelines de CI/CD.
- Servidor de inferencia multiusuario en oficinas o laboratorios: con TP2 sobre GPUs Ampere de consumo, ofrece 327-354 tok/s agregados con 6 peticiones concurrentes, adecuado para equipos pequeños.
- Experimentación con cuantización W4A16: el autor publica receta, launcher y scripts de benchmark en GitHub, útil como referencia para reproducir cuantizaciones AutoRound con kernels Marlin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos medidos por el autor en 2x RTX 3090 (NVLink), TP2, vLLM 0.27.1 son:

| Métrica | Valor |
|---|---|
| Decodificación single stream | 61-66 tok/s |
| 6 streams concurrentes | 327-354 tok/s totales; 58-61 tok/s por stream |
| TTFT (1 concurrente) | 0,05-0,08 s |
| TTFT (6 concurrentes) | 0,26-0,41 s |
| Prefill | ~1.770 tok/s (prompt de 17K tokens) |
| Pool KV (fp8 e5m2, contexto 131K, gmu 0,92) | 213.264 tokens |
| Tool eval 69 escenarios, thinking on | 134/138; Quality 97,1; Deployability 93,3 |
| Tool eval 69 escenarios, thinking off | 131/138; Quality 94,9; Deployability 95,3 |

## Requisitos de hardware

- VRAM: 20,8 GB solo de pesos; con contexto de 131K tokens y KV cache FP8 (e5m2) y gmu 0,92, la configuración documentada requiere 2x 24 GB (48 GB totales).
- GPUs recomendadas: 2x RTX 3090 con NVLink (configuración validada por el autor); compatible en general con GPUs Ampere o posteriores gracias a los kernels GPTQ Marlin.
- Consumer GPUs: no cabe en una sola RTX 3090/4090 con contexto completo; sí en 2x RTX 3090 (validado) o 2x RTX 4090. En una sola GPU de 48 GB (A6000, L40S) debería caber, aunque no está documentado.
- Despliegue: vLLM 0.27.1 con `--quantization gptq_marlin` (comando de servicio documentado en la model card). No se menciona soporte verificado en llama.cpp, Ollama o TGI.
- Rendimiento medido: 61-66 tok/s en decodificación single stream, ~1.770 tok/s de prefill, TTFT de 0,05-0,08 s con una petición concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-W4A16-AutoRound | ~33B (base) | W4A16 GPTQ (20,8 GB) | 131K (servido) | Apache 2.0 | Validado en 2x RTX 3090, tool calling, thinking mode |
| Qwen3-32B | 32,5B | BF16 nativo (GGUF/AWQ disponibles) | 131K | Apache 2.0 | Ecosistema muy amplio, parsers qwen3 compatibles |
| Qwen2.5-32B-Instruct-AWQ | 32,5B | W4A16 AWQ (~19 GB) | 128K | Qwen license (restricciones >100M MAU) | Alternativa cuantizada madura, sin thinking mode |
| Llama-3.1-32B (no existe oficialmente; Llama-3.1-70B) | 70B | BF16 / INT4 (~38 GB) | 128K | Llama Community License | Mayor capacidad pero requiere más VRAM |

Nota: no hay datos de benchmarks estándar comparables publicados para esta cuantización, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha publicado información sobre sesgos del modelo base ni de la cuantización.
- Alucinaciones: como todo LLM generativo, puede producir contenido incorrecto; el modo thinking puede mitigar errores de razonamiento pero no elimina el riesgo.
- Idiomas: soporte limitado a inglés y chino; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Contexto: los 131.072 tokens corresponden a la configuración de servicio del quant; la longitud de contexto nativa del modelo base no está confirmada en la información disponible.
- Cuantización: la calibración se realizó con el dataset NeelNanda/pile-10k (texto general en inglés), lo que puede degradar el rendimiento en dominios muy especializados o en chino.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Ecosistema: la cuantización está orientada específicamente a vLLM con kernels Marlin; no hay garantías de compatibilidad con llama.cpp, Ollama o transformers.
- Metadatos: la cifra de parámetros en safetensors (6,5B) no coincide con la denominación 33B del modelo base; conviene verificar el contenido real del repo antes de desplegar.
- Descargas muy bajas (327) y un solo like: proyecto de un autor individual, con poco historial de auditoría comunitaria.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Tech2wild/Nanbeige4.3-33B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio con receta, launcher y benchmarks: https://github.com/tonyd2wild/Nanbeige4.3-33B-W4A16-2x-RTX-3090
- Intel AutoRound: no disponible (herramienta citada en la model card sin enlace)
