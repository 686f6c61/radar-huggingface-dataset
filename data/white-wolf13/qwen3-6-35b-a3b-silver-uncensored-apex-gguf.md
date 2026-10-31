# White-Wolf13/Qwen3.6-35B-A3B-SILVER-UNCENSORED-APEX-GGUF

## Resumen

Qwen3.6-35B-A3B-SILVER-UNCENSORED-APEX-GGUF es una cuantización GGUF de la comunidad, publicada por el usuario White-Wolf13, del modelo base Qwen3.6-35B-A3B desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo disperso de tipo Mixture-of-Experts (MoE) de 34.660.610.688 parámetros totales, del cual solo una fracción se activa por token (aproximadamente 3.000 millones, según la nomenclatura A3B). El autor del fork lo presenta como una versión "uncensored" orientada al cumplimiento sin restricciones de las instrucciones del usuario, con capacidades de razonamiento nativo mediante cadenas `<think>` y soporte de tool calling.

La relevancia de esta versión radica en el pipeline de cuantización "Enhanced APEX-I", que preserva el router MoE en FP32 y los expertos compartidos en FP16 para minimizar la degradación típica de las cuantizaciones estándar en arquitecturas MoE con 256 expertos. El repositorio ofrece cinco perfiles de cuantización que van desde 11,29 GiB (apto para GPUs de consumo de 12 GB) hasta 26,73 GiB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (256 expertos, GQA con head_count_kv = 2) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B (derivado de la nomenclatura A3B; dato exacto no disponible) |
| Longitud de contexto | No disponible (los ejemplos del autor usan 16k-32k) |
| Tipos de cuantizacion | APEX-I PRO (~6,62 BPW), APEX-I QUALITY (~5,77 BPW), APEX-I BALANCED (~5,19 BPW), APEX-I COMPACT (~3,89 BPW), APEX-I MINI (~2,80 BPW) |
| Idiomas soportados | Ingles (en), polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts dispersa de 256 expertos, Grouped Query Attention (GQA) con 2 cabezas KV, lo que produce una caché KV excepcionalmente compacta. Al tratarse de un MoE con nomenclatura A3B, activa aproximadamente 3.000 millones de parámetros por token, lo que permite latencias y throughput comparables a un modelo denso de 3 B manteniendo la capacidad de un modelo de 35 B.

La versión SILVER-UNCENSORED no se construyó mediante fine-tuning con descenso de gradiente estándar, sino —según el autor— mediante un protocolo propietario de "alineación de variedad latente y calibración espectral del espacio de pesos", que supuestamente evita el olvido catastrófico y la degradación de estilo. El pipeline de cuantización Enhanced APEX-I incorpora cuatro innovaciones: preservación del router MoE (`ffn_gate_inp`) en FP32 completo para evitar deriva en el despacho de expertos; estabilización de los expertos compartidos (`ffn_down_shexp`) en FP16 para reducir la divergencia KL; asignación asimétrica de bits según la energía de activación SwiGLU (Q8_0 para down-projections sensibles, Q6_K/Q4_K para gate/up); y calibración de imatrix sobre un corpus de 168 chunks de 16.384 tokens (más de 2,75 millones de tokens) que cubre tool calling, lógica multi-turno, síntesis de código y diálogo enciclopédico. No hay información publicada sobre el número de tokens de preentrenamiento, la composición del dataset base ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en formato ChatML, con soporte de instrucciones de sistema.
- Razonamiento nativo con cadenas estructuradas `<think>` (chain-of-thought) antes de la respuesta final.
- Tool calling / function calling, según los tags del repositorio y el corpus de calibración de la cuantización.
- Roleplay y escritura creativa sin rechazos ni avisos morales (versión "uncensored").
- Síntesis y análisis de código, según el material de calibración descrito por el autor.
- Razonamiento multi-paso y resolución de problemas complejos.
- Competencia multilingüe, con dominio destacado de inglés y polaco.
- Ejecución eficiente en llama.cpp gracias a la arquitectura MoE dispersa y a la caché KV compacta de GQA.

## Casos de uso

- Chatbots locales sin restricciones de contenido: el perfil APEX-I MINI (11,29 GiB) permite desplegar un asistente conversacional completo en GPUs de consumo de 12 GB, adecuado para experimentación e investigación donde las políticas de rechazo estándar resultan limitantes.
- Roleplay y narrativa interactiva: la ausencia de guardrails y el soporte de bloques `<think>` permiten mantener personajes coherentes en conversaciones largas multi-turno.
- Asistentes con tool calling en local: el formato ChatML admite definiciones de herramientas, y `llama-server` expone una API compatible con OpenAI, facilitando la integración con frameworks de agentes.
- Generación de código en estaciones de trabajo con 24 GB de VRAM: el perfil APEX-I QUALITY (23,29 GiB) cabe íntegramente en una RTX 3090 o RTX 4090, ofreciendo precisión cercana a la pérdida mínima para asistentes de código.
- Procesamiento offline sensible a privacidad: al ejecutarse completamente en local vía llama.cpp, no se envían datos a terceros, útil para entornos con requisitos de confidencialidad.
- Investigación sobre cuantización de MoE: la preservación del router en FP32 y los expertos compartidos en FP16 hacen de este repo un caso de estudio práctico sobre cómo cuantizar arquitecturas MoE dispersas sin degradar el enrutamiento.
- Despliegues híbridos CPU/GPU: el perfil BALANCED con `-ngl 14` permite ejecutar el modelo en equipos con 12 GB de VRAM y RAM de sistema, ampliando el acceso a hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor afirma cualitativamente que la versión supera al checkpoint base en resolución de problemas multi-paso, pero no aporta números verificables.

## Requisitos de hardware

- VRAM estimada por perfil de cuantización:
  - APEX-I PRO (26,73 GiB): GPU dual 2x16 GB, o híbrido 32 GB RAM + 12 GB VRAM.
  - APEX-I QUALITY (23,29 GiB): GPU de 24 GB (RTX 3090 / RTX 4090) con contexto estándar.
  - APEX-I BALANCED (20,95 GiB): GPU de 24 GB con 3-4 GiB libres para contextos de 32k-64k+.
  - APEX-I COMPACT (15,69 GiB): GPU de 16 GB (RTX 4080, Tesla T4, V100 16GB).
  - APEX-I MINI (11,29 GiB): GPU de 12 GB (RTX 3060, RTX 4070).
- Cabe en GPUs de consumo: sí, desde 12 GB de VRAM (RTX 3060/4070) con el perfil MINI, e incluso en modo híbrido CPU/GPU con menos VRAM.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), con API compatible con OpenAI. No se menciona soporte para vLLM, Ollama o TGI en la información disponible.
- Recomendaciones de ejecución: activar Flash Attention (`-fa on`) aprovechando la caché KV compacta de GQA; temperatura recomendada 0,3; batch size 2048 y ubatch 512 para servidores de alto throughput.
- Latencia y throughput: no disponibles como mediciones concretas; el autor indica "ejecución extremadamente rápida" para el perfil COMPACT sin aportar cifras.

## Comparativa con modelos similares

| Caracteristica | Qwen3.6-35B-A3B-SILVER-UNCENSORED (este modelo) | Qwen/Qwen3.6-35B-A3B (base) | Alternativas comparables |
|---|---|---|---|
| Parametros totales | 34,66 B | 34,66 B | no disponible |
| Parametros activos | ~3 B (MoE) | ~3 B (MoE) | no disponible |
| Formato | GGUF (5 perfiles APEX-I) | Safetensors | no disponible |
| Filtrado de contenido | Uncensored (sin guardrails) | Estándar | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | no disponible |
| Idiomas | en, pl | no disponible | no disponible |

No se han identificado en la información disponible modelos alternativos comparables con datos suficientes para una comparativa cuantitativa.

## Limitaciones y advertencias

- Al tratarse de una versión "uncensored" sin guardrails, el modelo puede generar contenido ofensivo, peligroso o inapropiado sin rechazarlo. Su uso exige responsabilidad legal y ética por parte del operador, especialmente en entornos expuestos a usuarios finales.
- Las afirmaciones del autor sobre el protocolo de "alineación de variedad latente" y la mejora sobre el modelo base no están verificadas con benchmarks independientes ni con un paper técnico publicado.
- Riesgo de alucinación: no hay datos publicados; al ser un derivado cuantizado de un modelo base, debe asumirse un riesgo comparable al del original, más el riesgo adicional inherente a la cuantización agresiva en los perfiles COMPACT y MINI (~2,80-3,89 BPW).
- Los idiomas declarados oficialmente son inglés y polaco; el rendimiento en castellano u otras lenguas no está documentado y puede ser inferior.
- La longitud de contexto máxima no está especificada; los ejemplos del autor usan 16k-32k, pero no hay garantía documentada de contextos mayores.
- Licencia Apache 2.0 sin restricciones comerciales adicionales, aunque los términos del modelo base Qwen aplican como fondo.
- La calidad de las cuantizaciones de bits más bajos puede degradar el enrutamiento MoE y el razonamiento; para cargas críticas se recomienda QUALITY o PRO.
- El modelo requiere el formato ChatML con bloques `<think>`; un formateo incorrecto del prompt puede degradar el comportamiento del razonamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/White-Wolf13/Qwen3.6-35B-A3B-SILVER-UNCENSORED-APEX-GGUF
- Modelo base: Qwen/Qwen3.6-35B-A3B (referenciado en la model card; URL directa no disponible)
- Organización Qwen en GitHub (citada por el autor): https://github.com/QwenLM
- Paper, blog o demo: no disponible
