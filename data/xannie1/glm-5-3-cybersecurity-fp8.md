# xannie1/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una variante modificada de pesos de GLM-5.3 (base `zai-org/GLM-5.3`, cuantización FP8 de `JANGQ-AI/GLM-5.3-FP8`) en la que se ha reducido deliberadamente la tasa de rechazo para contenido de seguridad ofensiva. El modelo se publica bajo etiquetas explícitas de "abliterated", "crack" y "refusal-removed", y su model card indica que la modificación es real sobre los pesos (no es un fine-tuning, ni un LoRA, ni un hook en tiempo de ejecución). El checkpoint que se documenta aquí aparece alojado en el repositorio `xannie1/GLM-5.3-CYBERSECURITY-FP8`, mientras que la model card atribuye la autoría de la release a dealignai; es decir, se trata de una publicación espejo o redistribución de un artefacto ajeno, dato relevante para trazabilidad y confianza.

Técnicamente es un transformer de tipo MoE con atención dispersa, arquitectura `glm_moe_dsa`, 78 capas y 753.329.940.480 parámetros totales (unos 753B), solo texto. El repositorio pesa 755,7 GB y los pesos están en safetensors con expertos en FP8, lo que permite velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200). Se distribuye bajo licencia MIT y declara diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.

Su relevancia es acotada pero clara: es un ejemplo de modelo de dominio con rechazo eliminado específicamente en ciberseguridad ofensiva, dirigido a red team autorizado, análisis de malware, desarrollo de exploits y pentesting. No es un "uncensor" generalista y mantiene rechazos suaves en otras categorías sensibles. Para un equipo de seguridad o un investigador, el interés está en su comportamiento de cumplimiento medido (HarmBench-320) y en su preservación de capacidades (MMLU 86,65% en modo logit), no en su uso como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atención dispersa, 78 capas, solo texto) |
| Parámetros totales | 753.329.940.480 (~753B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens en despliegue TP8 sobre 8× H200; la información menciona contexto de 1M mediante decode-context-parallel, pero esa vía está cerrada en vLLM para `glm_moe_dsa` hoy. Techo práctico reportado: ~131K con MTP y ~160K sin MTP |
| Tipos de cuantización | FP8 (checkpoint nativo FP8, expertos enrutados en FP8); otros formatos no disponibles |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer con mezcla de expertos (MoE) y atención dispersa tipo DeepSeek (DSA), 78 capas y salida únicamente textual. La release parte de `JANGQ-AI/GLM-5.3-FP8`, una cuantización FP8 del modelo upstream `zai-org/GLM-5.3` (753B totales). Según la model card, los expertos FP8 enrutados permanecen intactos y solo se editan los escritores de residuales en bf16, lo que explica que el modelo conserve el rendimiento en FP8 nativo sobre Hopper. No hay datos disponibles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en el modelo base, y tampoco sobre el procedimiento exacto de ablación aplicado.

La modificación anunciada es una eliminación de la dirección de rechazo ("abliterated"/"crack") orientada específicamente a seguridad ofensiva: exploit development, ingeniería inversa, evasión, phishing, ataques de credenciales, análisis de malware y red team. La model card insiste en que el ajuste es de dominio y no universal, y aporta dos elementos técnicos reseñables en inferencia: un modo de razonamiento controlable mediante `reasoning_effort` que solo honra los valores `"low"` y `"high"` (cualquier otro valor, incluido `off` o sin definir, cae a `max`), y decodificación especulativa MTP que no funciona en vLLM estándar pero se reporta operativa en un fork con backend de atención dispersa B12X. No se documenta ningún innovation adicional sobre el base más allá de esto.

## Capacidades

- Generación de texto y conversación multi-turno en diez idiomas declarados.
- Razonamiento extenso con modo "thinking": el texto de razonamiento se devuelve en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento vía `reasoning_effort`, limitado a `"low"` y `"high"`; no existe forma de desactivar el razonamiento en este checkpoint.
- Tool calling y elección automática de herramientas: la receta de servicio usa `--tool-call-parser glm47 --enable-auto-tool-choice`, lo que habilita function calling.
- Uso en bucles de agente: la model card recomienda `reasoning_effort="low"` para agentes y tool-loops en FP8, para evitar agotar el presupuesto de `max_tokens` dentro de `<think>`.
- Código y tareas técnicas: hay una referencia a mejora de decodificación en prompts de programación con el fork B12X (+48% en decode).
- Contenido de seguridad ofensiva sin rechazo en la mayoría de casos: 80–84% de cumplimiento directo en las 240 conductas no relacionadas con copyright de HarmBench-320.
- Cumplimiento parcial con envoltorio "educativo" en categorías ajenas a ciberseguridad (armas, química, biología, acoso, desinformación).
- No dispone de capacidades de visión ni audio: el modelo es solo texto.

## Casos de uso

- Red team autorizado: el modelo puede redactar hipótesis de ataque, cadenas de explotación y planes de prueba para un engagement con alcance firmado, apoyándose en su baja tasa de rechazo en contenido ofensivo técnico y en su contexto de 131K tokens para arrastrar documentación de alcance y hallazgos previos.
- Análisis de malware y reversing: dado que no hay rechazos duros en la superficie de análisis técnico, se puede usar para desglosar comportamiento de muestras, explicar llamadas a API sospechosas y resumir informes de sandbox largos dentro de una misma ventana de contexto.
- Programas de bug bounty y CTF: generación y explicación de payloads, análisis de binarios y resolución de retos de explotación, con tool calling para automatizar pasos de reconocimiento dentro de un agente.
- Redacción de inteligencia de amenazas: síntesis de informes CTI, mapeo a tácticas y técnicas y generación de borradores de detección, aprovechando el multilingüismo declarado (en, zh, ru, fr, es, ar, ko, ja, hi, sr) para fuentes no anglosajonas.
- Análisis defensivo de phishing y credenciales: reconstrucción de campañas, análisis de infraestructura de correo y tácticas de ingeniería social desde el lado del defensor, un escenario donde el cumplimiento sin fricción acelera la respuesta.
- Investigación sobre alineación y seguridad de modelos: el checkpoint es un objeto de estudio útil por sus tablas de cumplimiento medidas con HarmBench-320 a tres niveles de esfuerzo, y por el contraste de MMLU frente al base (86,65% frente a 85,58%).
- Formación interna en seguridad: simulación de escenarios de ataque y defensa en entornos de laboratorio aislados, con la ventaja de que el modelo no bloquea la conversación a mitad de un ejercicio técnico.
- Automatización de pipelines de pentest vía API: integración en vLLM con `--enable-auto-tool-choice` para que el modelo invoque escáneres y herramientas propias, siempre bajo control de acceso y registro de auditoría.

## Benchmarks y rendimiento

Los datos publicados en la model card proceden de evaluación propia del autor de la release y son los únicos disponibles.

| Benchmark | Modelo base | CRACK Cybersecurity FP8 | Diferencia |
|---|---|---|---|
| MMLU (overall, 1026 preguntas, modo logit, sin generación) | 85,58% (baseline GLM-5.3 regular, bf16 pre-cuantización; baseline directo del base-FP8 pendiente de confirmar) | 86,65% (889/1026) | +1,07 pp |

Comportamiento de cumplimiento en HarmBench-320 (greedy, tres superficies de esfuerzo de razonamiento). Subconjunto no relacionado con copyright, 240 conductas:

| Esfuerzo | Cumple directamente | Rechazo suave | Redirección | Deflexión | Rechazo duro | Sin clasificar |
|---|---|---|---|---|---|---|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo, incluyendo 80 conductas de copyright:

| Esfuerzo | Cumple directamente | Rechazo suave | Redirección | Deflexión | Rechazo duro | Basura | Sin clasificar |
|---|---|---|---|---|---|---|---|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

El copyright explica aproximadamente 48–54 de los rechazos suaves en cada superficie (en torno al 60–68% del bloque de copyright). No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos FP8 ocupan del orden de 755 GB; hay que sumar caché KV y overhead de activaciones. La receta oficial usa `--gpu-memory-utilization 0.90` sobre 8× H200 (8 × 141 GB ≈ 1.128 GB de memoria agregada) con `--max-model-len 131072` y `--max-num-seqs 24`.
- GPU recomendadas: H100 y H200 por sus tensor cores FP8 nativos (familia Hopper). Existe un testimonio de campo en un clúster de 8× DGX Spark GB10.
- Cabe en GPU de consumo: no. Con 753B parámetros y 755,7 GB de pesos en FP8, ningún acelerador de consumo actual puede alojarlo, ni siquiera con cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa de DeepSeek bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. La decodificación especulativa MTP no funciona en vLLM estándar; se reporta operativa en el fork sparse-MLA B12X con `--draft-attention-backend B12X_MLA_SPARSE`. No se mencionan TGI, llama.cpp, Ollama ni otras alternativas para este checkpoint.
- Paralelismo alternativo: perfiles de pipeline-parallel (PP2 × TP4) funcionan, pero el borrador MTP no implementa `SupportsPP`.
- Latencia y throughput: el único dato disponible es una mejora del 48% en decode sobre prompts de programación con MTP en el fork B12X. No hay cifras absolutas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`xannie1/GLM-5.3-CYBERSECURITY-FP8`) | 753B (MoE) | 131K en despliegue TP8; 1M no operativo en vLLM | 86,65% (modo logit, 1026 preguntas) | MIT | HuggingFace, FP8, publicación espejo del artefacto de dealignai |
| `dealignai/GLM-5.3-UNCENSORED-FP8` | 753B (mismo base) | no disponible | no disponible | MIT según la release referenciada | HuggingFace; es el "uncensor" generalista de la misma familia |
| `JANGQ-AI/GLM-5.3-FP8` | 753B (MoE) | no disponible | pendiente de confirmar en la model card | no disponible | HuggingFace; es el modelo base directo de esta release |
| `zai-org/GLM-5.3` | 753B (MoE) | no disponible | 85,58% (baseline bf16 pre-cuantización) | no disponible | HuggingFace; modelo upstream original |

No se dispone de comparaciones con modelos de otros fabricantes de tamaño equivalente dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio con rechazos eliminados: el uso indebido puede facilitar actividad delictiva real (explotación de sistemas, phishing, ataques de credenciales, evasión). Requiere encuadre legal explícito, autorización por escrito y controles de acceso en cualquier despliegue.
- No es un uncensor universal: mantiene rechazos suaves en categorías ajenas a ciberseguridad (armas, química, biología, acoso, desinformación) y sigue rechazando de forma blanda la reproducción literal de contenido con copyright.
- Riesgo de alucinación: no hay estudios específicos de factualidad en la información disponible; como cualquier modelo de 753B sin verificación externa, puede inventar CVE, rutas, comandos o referencias técnicas con apariencia plausible. No debe usarse como fuente de verdad sin validación.
- Sesgos: la información proporcionada no incluye evaluaciones de sesgo. El corpus de entrenamiento del base y la edición de rechazo pueden alterar la distribución de respuestas en temas sensibles.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del artefacto no cubre las obligaciones legales derivadas del uso (exportación, delitos informáticos, responsabilidad civil). La model card no ofrece garantías ni exenciones.
- Autenticidad y trazabilidad: el repositorio figura a nombre de `xannie1` mientras la autoría declarada en la model card es de dealignai, y existen réplicas de terceros (por ejemplo `xtr3sor/GLM-5.3-CYBERSECURITY-FP8`). Conviene verificar los hashes de los pesos antes de usarlos en producción.
- Comportamiento peculiar del razonamiento: `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`. Con `high` o `max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`). En agentes y bucles de herramientas, usar `"low"` y `max_tokens ≥ 8000` si se necesita `high`.
- Limitaciones de contexto en la práctica: la ventana de 1M anunciada no es alcanzable hoy en vLLM por el indexador DSA replicado entre rangos de DCP con caché KV MLA fragmentada. El techo realista en TP8 sobre H200 es de unos 131K tokens con MTP y unos 160K sin él.
- Latencia de MTP: la decodificación especulativa no funciona en vLLM estándar y depende de un fork de terceros, lo que añade riesgo de mantenimiento y de reproducibilidad.
- Clasificación incompleta: entre el 7% y el 16% de las respuestas de HarmBench-320 quedaron en el cubo "sin clasificar", lo que indica incertidumbre en las propias métricas de cumplimiento publicadas.

## Enlaces

- Repositorio documentado: https://huggingface.co/xannie1/GLM-5.3-CYBERSECURITY-FP8
- Release original atribuida: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Modelo hermano (uncensor generalista): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de referencia sobre runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Modelo base directo: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo upstream: https://huggingface.co/zai-org/GLM-5.3
- Réplica de terceros: https://huggingface.co/xtr3sor/GLM-5.3-CYBERSECURITY-FP8
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-5.3-cybersecurity-fp8-dealignai
- Ficha en Applied: https://theapplied.co/models/dealignai-glm-5-3-cybersecurity-fp8
- Ficha en thinkllm.dev: https://thinkllm.dev/models/glm-5-3-cybersecurity-fp8
- Twitter del autor de la release: https://twitter.com/dealignai
