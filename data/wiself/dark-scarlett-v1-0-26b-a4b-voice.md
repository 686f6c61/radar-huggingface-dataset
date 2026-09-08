# Wiself/Dark-Scarlett-v1.0-26B-A4B-Voice

## Resumen

Dark-Scarlett-v1.0-26B-A4B-Voice es un paquete de "voz" estilística, no un modelo de lenguaje completo. Se trata de un tensor único de aproximadamente 1,5 GB que contiene la cabeza de salida (`lm_head.weight`) del finetune ReadyArt/Dark-Scarlett-v1.0-26B-A4B, un LoRA de roleplay sin censura (M→F) entrenado sobre la base instruct de Gemma 4 26B MoE. El desarrollador, Wiself, lo distribuye como un componente portable para "cast" sobre cualquier GGUF compatible de Gemma 4 26B A4B, de modo que el modelo base conserva su estructura y el estilo de escritura de Scarlett se superpone en la capa de salida.

El problema que resuelve es la transferencia de estilo sin necesidad de cargar adaptadores LoRA en tiempo de ejecución ni de reentrenar el modelo completo. Con una sola operación de reemplazo del `lm_head`, se puede dotar a un GGUF ya cuantizado de una voz narrativa específica, manteniendo intactos el resto de tensores. Es relevante para desarrolladores que trabajan con modelos Gemma 4 26B A4B y quieren experimentar con variantes de personalidad o estilo de forma rápida y con un coste de almacenamiento mínimo. La arquitectura subyacente es un transformer Mixture of Experts con 26 000 millones de parámetros totales y 4 000 millones activos (A4B); la longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4 26B A4B); el paquete contiene solo el tensor `lm_head.weight` |
| Parámetros totales | 26B en el modelo base; el tensor `lm_head` tiene 738 197 504 parámetros (~0,74B) |
| Parámetros activos | 4B activos en el modelo base (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cualquier cuantización del GGUF base; el tensor `lm_head` se cuantiza a Q8_0 al aplicar el voice |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (declarada); el modelo base tiene términos de uso restringidos a uso personal y mayores de 18 años |
| Formato de pesos | safetensors (`voice.safetensors`) y GGUF (destino del cast) |

## Arquitectura y entrenamiento

El paquete no es un modelo independiente, sino una extracción del tensor de salida de un finetune. El modelo base es ReadyArt/Dark-Scarlett-v1.0-26B-A4B, un LoRA de rango 32 entrenado durante 2 épocas sobre 12 211 prompts, con dataset generado por GECFDO y fine-tuning a cargo de FrenzyBiscuit. El finetune parte de la instruct de Gemma 4 26B A4B, una arquitectura MoE que activa 4 000 millones de parámetros de un total de 26 000 millones. La técnica de "voice casting" consiste en extraer el `lm_head.weight` del finetune y reemplazar el correspondiente tensor de un GGUF base. Este enfoque evita cargar un adaptador LoRA en runtime y permite que todos los tensores del modelo base permanezcan intactos, salvo la cabeza de salida, que se cuantiza a Q8_0 de forma casi sin pérdidas. La forma del tensor es `[262144, 2816]`, lo que corresponde al vocabulario y a la dimensión de salida de la arquitectura Gemma 4.

## Capacidades

- Generación de texto con estilo de roleplay sin censura, orientado a personajes M→F.
- Transferencia de estilo: se puede aplicar la voz de Dark Scarlett a cualquier GGUF compatible de Gemma 4 26B A4B, incluyendo distintos finetunes y cuantizaciones.
- Soporte de modo de pensamiento según la card del modelo base: `enable_thinking: true`, con esfuerzo de razonamiento medio.
- No es un modelo multimodal: no soporta visión ni audio. El término "voice" se refiere al estilo de escritura, no a síntesis de voz.
- No se especifica soporte de tool calling, function calling ni agentes en la información disponible.
- Compatibilidad con modelos QAT derivados mediante un "delta path" que transporta únicamente la diferencia respecto a la instruct base, evitando bucles en modelos abliterados.

## Casos de uso

- Roleplay narrativo en juegos de texto: el voice permite que un personaje mantenga una voz consistente y sin censura, ideal para experiencias interactivas de rol donde la personalidad es el factor principal.
- Transferencia de estilo en ficción: se puede aplicar la voz de Dark Scarlett a un modelo base más fuerte o a otro finetune, obteniendo un estilo de escritura distintivo sin reentrenar.
- Creación de personajes para plataformas de chat de rol: el cast sobre un GGUF existente permite cambiar la personalidad de un modelo sin duplicar el peso ni modificar el resto de tensores.
- Experimentación en investigación de transferencia de estilo: el reemplazo del `lm_head` ofrece una vía rápida para estudiar cómo afecta la cabeza de salida al estilo generativo de un modelo MoE.
- Generación de contenido creativo para adultos (18+): el modelo está diseñado para outputs sin restricciones, con plena responsabilidad del usuario sobre el contenido generado.
- Prototipado de variantes de modelo en entornos de desarrollo: la herramienta `voice cast` permite generar rápidamente una variante con un estilo específico a partir de cualquier GGUF compatible, sin necesidad de entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye una sonda propia con métricas de superposición de n-gramas, aplicada sobre un prompt único y cinco builds con muestreo greedy:

| Métrica | Valor |
|---|---|
| Voice-only 4-grams | 127 frases compartidas entre los builds con voice y nunca con el base |
| Fidelidad al donante | 4 frases exactas compartidas con Scarlett (`distant roar of the crowd`, `the grain dole`, `the emperor himself`, `basalt paving stones`) |
| Solapamiento de trigramas con el base | 0,026–0,036 |
| Solapamiento de trigramas entre output-only y embed-only | 0,058 |

## Requisitos de hardware

- VRAM estimada: no se especifica. El voice añade ~1,5 GB al modelo base. Para un GGUF Q4_K_M de un modelo 26B A4B, se estima entre 16 y 24 GB de VRAM según la cuantización y la longitud de contexto.
- GPU recomendadas: no se especifica. Una GPU con 24 GB (RTX 4090, A100 40GB) es adecuada para Q4_K_M; H100 para contextos largos o mayor throughput.
- Compatibilidad con GPU de consumo: sí, en GPUs de 24 GB como RTX 4090 o 3090 con cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama serve -m ... --jinja`) según la documentación; también compatible con otros runtimes de GGUF como Ollama, vLLM o TGI, siempre que el GGUF sea compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Compatibilidad | Licencia |
|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B-Voice | Voice (lm_head) | ~0,74B tensor | Cualquier Gemma 4 26B A4B GGUF | Apache 2.0 (con términos de uso restringidos) |
| Dark-Scarlett-v1.0-QAT-26B-A4B-Voice | Voice (lm_head) | no disponible | GGUFs derivados de QAT | no disponible |
| ReadyArt/Dark-Scarlett-v1.0-26B-A4B | Modelo completo (finetune) | 26B A4B | Solo Gemma 4 26B | no disponible |

## Limitaciones y advertencias

- Sesgos: el modelo está diseñado sin censura y puede generar contenido explícito, inapropiado o sesgado.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; como todo modelo de lenguaje, puede producir información falsa o inconsistente.
- Limitaciones de contexto: no se especifica la longitud de contexto del modelo base en la información disponible.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero los términos de uso del modelo base indican uso personal, mayores de 18 años y responsabilidad total sobre los outputs.
- Caveat técnico: el voice solo es compatible con Gemma 4 26B A4B; en modelos abliterados puede producir bucles, aunque el delta path lo mitiga. No es un modelo completo y requiere un GGUF base para funcionar.

## Enlaces

- HuggingFace: https://huggingface.co/Wiself/Dark-Scarlett-v1.0-26B-A4B-Voice
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Voice tool: https://huggingface.co/Wiself/voice
- Versión QAT: https://huggingface.co/Wiself/Dark-Scarlett-v1.0-QAT-26B-A4B-Voice
