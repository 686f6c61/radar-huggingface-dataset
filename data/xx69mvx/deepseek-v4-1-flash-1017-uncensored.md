# xx69mvx/DeepSeek-V4.1-Flash-1017-uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored es una edición de pesos del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario xx69mvx en Hugging Face. Se trata de una variante "sin censura" obtenida mediante una edición de pesos en forma cerrada (sin fine-tuning ni entrenamiento por gradientes) aplicada sobre el checkpoint nativo en FP8 del modelo base de DeepSeek. El objetivo declarado es eliminar el comportamiento de rechazo (refusal) para investigación autorizada en seguridad y red-teaming, manteniendo las capacidades generales del modelo original.

El modelo conserva la arquitectura Mixture-of-Experts (MoE) del base, con 763.205.315.794 parámetros totales según los safetensors del repositorio. La edición deja intactos los 384 expertos enrutados, de modo que el conocimiento y la capacidad del modelo no se alteran según el autor. El checkpoint se sirve exactamente igual que el base, como un drop-in en FP8.

Es relevante ahora porque ilustra una técnica de modificación de comportamiento (eliminación de rechazos) sin reentrenamiento, y porque sus datos de evaluación comparan de forma emparejada el modelo base y la variante editada en benchmarks de capacidad y de compliance dañino. El repositorio tiene 510,3 GB, licencia MIT declarada en la model card y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia deepseek_v41, transformer; 384 expertos enrutados |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el servicio Abyss 1 declara 1M tokens de contexto y hasta 64K de salida |
| Tipos de cuantizacion | FP8 nativo (8-bit); edicion de pesos en forma cerrada sobre el checkpoint FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card y en los tags); se indica que aplica la licencia del modelo base |
| Formato de pesos | safetensors (libreria transformers); repo de 510,3 GB |

## Arquitectura y entrenamiento

El modelo es una variante del DeepSeek-V4.1-Flash-1017, un transformer con arquitectura Mixture-of-Experts que cuenta con 384 expertos enrutados. La modificación no implica entrenamiento: según la model card, el comportamiento de rechazo se elimina mediante una edición de pesos en forma cerrada (closed-form weight edit), sin fine-tuning ni gradientes, fusionada directamente en el checkpoint FP8 nativo. Los 384 expertos enrutados se dejan intactos, por lo que el autor sostiene que el conocimiento y la capacidad del modelo permanecen sin cambios y que el checkpoint carga y se sirve igual que el base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones técnicas adicionales del base más allá de su naturaleza MoE y su formato FP8. La model card menciona soporte de modo de razonamiento (reasoning) y parsers específicos para DeepSeek-V4.1 en SGLang (`--reasoning-parser deepseek-v41`, `--tool-call-parser deepseekv41`).

## Capacidades

- Generación de texto y razonamiento: el modelo base se evalúa en MMLU, MMLU-Pro y GPQA-Diamond, con modo de razonamiento activable.
- Matemáticas: evaluado en GSM8K con protocolo paso a paso y decodificación greedy.
- Conocimiento general: MMLU sobre el conjunto de test completo (14.042 preguntas).
- Modo de razonamiento (thinking/reasoning): soportado mediante parser dedicado en SGLang; el autor advierte que a máximo esfuerzo de razonamiento el modelo genera respuestas muy largas.
- Tool calling / function calling: soportado mediante el parser `deepseekv41` en SGLang.
- Servido compatible con endpoints OpenAI y Anthropic a través de la plataforma Zro (modelo `abyss1`).
- Comportamiento sin censura: elimina rechazos en peticiones dañinas (1,8% de rechazo frente a 87,3% del base) y reduce el exceso de rechazo en peticiones benignas (0,0% frente a 6,3%).
- Capacidades multilingües: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo está pensado para evaluar la robustez de sistemas frente a peticiones dañinas en entornos controlados y privados, dado que su tasa de rechazo en conjuntos dañinos es del 1,8% y su compliance evaluado por juez es muy alto (StrongREJECT 0,99).
- Evaluación de clasificadores y filtros de seguridad: al generar respuestas dañinas de forma fiable, sirve como generador de casos adversarios para probar clasificadores como `dolly2-security` o pipelines de moderación.
- Análisis de vulnerabilidades y exploits en laboratorio: la model card reporta compliance del 1,00 en 30 prompts de exploits CVE reales, lo que lo hace adecuado para investigación autorizada de ciberseguridad ofensiva en entornos aislados.
- Estudio de técnicas de edición de pesos: permite comparar de forma emparejada el comportamiento del base y la variante editada, con deltas documentados en MMLU (−0,3), MMLU-Pro (−0,5), GSM8K (+2,5) y GPQA-Diamond (+3,5).
- Despliegue privado con SGLang: el checkpoint FP8 se sirve como drop-in con `--tp-size 4 --ep-size 4`, útil para equipos que ya operan el base y quieren una variante sin rechazos en su propia infraestructura.
- Uso vía API compatible con OpenAI/Anthropic: a través de la plataforma Zro (modelo `abyss1`) con contexto de 1M tokens y hasta 64K de salida, para integración en harnesses como Claude Code, Codex u OpenCode mediante el CLI `zro`.
- Investigación sobre alineación y refusal: analizar la relación entre ediciones de pesos y comportamiento de rechazo, con métricas de over-refusal (0,0%) y refusal en dañinos (1,8%).

## Benchmarks y rendimiento

Datos publicados en la model card, comparando base y esta variante con el mismo harness y prompts emparejados.

| Benchmark | Base | Este modelo |
|---|---:|---:|
| MMLU (14.042, test completo) | 88,22% | 87,91% |
| MMLU-Pro (muestra de 4.000) | 69,90% | 69,42% |
| MMLU-Pro (muestra de 300, razonamiento) | 85,7% | 84,7% |
| GPQA-Diamond (198, razonamiento) | 81,3% | 84,8% |
| GSM8K (paso a paso, greedy) | 93,5% | 96,0% |
| Refusal en prompts dañinos (n=1410) | 87,3% | 1,8% |
| Over-refusal en prompts benignos (n=350) | 6,3% | 0,0% |
| HarmBench-320 (oficial, juez LLM) | 0,38 | 0,95 |
| StrongREJECT (313 prompts) | 0,02 | 0,99 |
| Exploits CVE reales (30 prompts) | 0,12 | 1,00 |

Notas de la model card: en GPQA-Diamond una minoría de ítems agota el presupuesto de 24k tokens a mitad de razonamiento (24 en el base, 15 en este modelo); puntuando solo respuestas completadas, el base obtiene 92,5% y este modelo 91,8%, y en las 174 preguntas que ambos completan aciertan exactamente el mismo número (161). Las tasas de rechazo evaluadas por juez caen a 0,6% en HarmBench, 0% en StrongREJECT y 0% en CVE.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 763.205.315.794 parámetros en FP8 (8 bits), el peso bruto ronda los 763 GB, por lo que requiere inferencia multi-GPU.
- GPU recomendadas: el ejemplo de la model card usa SGLang con `--tp-size 4 --ep-size 4`, lo que implica al menos 4 GPUs de clase数据中心 (A100/H100) para el checkpoint FP8.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño del checkpoint.
- Opciones de despliegue: SGLang con soporte de DeepSeek-V4.1 (ejemplo oficial); también disponible vía API en la plataforma Zro (modelo `abyss1`).
- Latencia y throughput: no disponibles. La model card advierte que a máximo esfuerzo de razonamiento conviene dar un presupuesto de generación de al menos 16k tokens para evitar truncamientos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card solo compara esta variante con su modelo base (DeepSeek-V4.1-Flash-1017), cuyos datos se recogen en la tabla de benchmarks anterior. No se detallan parámetros activos, contexto del base ni comparaciones con otros modelos MoE de la misma categoría.

| Aspecto | DeepSeek-V4.1-Flash-1017 (base) | Este modelo |
|---|---|---|
| Parámetros totales | no disponible (el repo derivado declara 763,2B) | 763.205.315.794 |
| Contexto | no disponible | no disponible (1M en el servicio Abyss 1) |
| Licencia | no disponible (la model card indica que aplica la del base) | MIT declarada |
| Comportamiento de rechazo | 87,3% en dañinos | 1,8% en dañinos |
| MMLU | 88,22% | 87,91% |

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: cumple peticiones dañinas. La propia model card indica que es solo para investigación de seguridad autorizada, que debe mantenerse privado y que no debe desplegarse ni servirse públicamente.
- Riesgo elevado de generación de contenido dañino: compliance del 0,95 en HarmBench, 0,99 en StrongREJECT y 1,00 en prompts de exploits CVE, según el juez LLM utilizado.
- Responsabilidad total del usuario sobre el uso, según el autor.
- El rechazo residual en conjuntos adversarios es bajo pero no nulo.
- La capacidad se mantiene cercana al base (MMLU −0,3 puntos), pero hay pequeñas diferencias en varios benchmarks; algunas quedan dentro del ruido y otras cambian de signo.
- En razonamiento de máximo esfuerzo puede truncarse si no se le da presupuesto suficiente (≥16k tokens recomendados).
- Idiomas soportados no disponibles; no se documenta cobertura multilingüe.
- Licencia: la model card declara MIT, pero también indica que aplica la licencia del modelo base; conviene verificar las condiciones del base antes de cualquier uso comercial.
- Sesgos conocidos: no documentados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24); no hay evidencia de validación independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/xx69mvx/DeepSeek-V4.1-Flash-1017-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Página del servicio Abyss 1: https://zro.moonmath.ai/abyss1
- Precios del servicio: https://zro.moonmath.ai/pricing
- Documentación del CLI: https://zro.moonmath.ai/docs/cli
- Referencia de API: https://zro.moonmath.ai/ (referencia truncada en la información disponible)
