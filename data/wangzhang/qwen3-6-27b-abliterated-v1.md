# wangzhang/Qwen3.6-27B-abliterated-v1

## Resumen

Qwen3.6-27B-abliterated-v1 es una variante del modelo Qwen3.6-27B de Alibaba, modificada mediante una técnica de "abliteración" (supresión de rechazos) para eliminar las respuestas de negativa ante instrucciones potencialmente dañinas. El autor, wangzhang, ha aplicado el pipeline abliterix en modo LoRA con proyección ortogonal, fusionando los pesos en BF16 para su distribución. El modelo resultante mantiene las capacidades del base —un VLM denso de 27 356 millones de parámetros con arquitectura híbrida GatedDeltaNet y atención completa— pero reduce drásticamente la tasa de rechazo: de 100/100 en el base a 16/100 en este modelo, según un juez LLM sobre 100 prompts dañinos reservados.

La relevancia de este modelo radica en que es el primer checkpoint denso de la generación Qwen 3.6 a escala 27B con backbone Gated Delta Net que ha sido sometido a abliteración, lo que obligó a reconciliar el ajuste de direcciones de rechazo a través de dos proyecciones de salida estructuralmente diferentes (48 capas con `linear_attn.out_proj` y 16 con `self_attn.o_proj`). El resultado es un modelo que cumple con 15/15 jailbreaks clásicos en inglés y chino, con una divergencia KL de solo 0.0181 respecto al base en prompts benignos, lo que sugiere una alteración mínima del comportamiento general.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está disponible en formato safetensors (54.7 GB en BF16). Está pensado para investigadores de seguridad, desarrolladores que necesitan explorar límites de alineación y casos de uso donde la generación sin censura es necesaria, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: 48 capas GatedDeltaNet + 16 capas full attention (interleave `[GDN, GDN, GDN, full] × 16`), wrapper `Qwen3_5ForConditionalGeneration` (VLM) |
| Parametros totales | 27 356 728 560 (~27.36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos BF16 en safetensors) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 54.7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un VLM denso que hereda el wrapper `Qwen3_5ForConditionalGeneration` de la familia MoE 397B, pero con una pila de decodificador completamente densa. La arquitectura intercala tres capas GatedDeltaNet por cada capa de atención completa (`full_attention_interval = 4`), con 64 capas en total: 48 de atención lineal (GatedDeltaNet) y 16 de atención softmax estándar. Las dimensiones son: hidden = 5120, intermediate = 17 408, GQA con 24 cabezas Q y 4 KV, head_dim = 256, y para GDN `linear_num_value_heads = 48` con `linear_value_head_dim = 128`. Incluye además una cabeza MTP auxiliar de 1 capa que no fue modificada.

El proceso de abliteración se realizó con la herramienta abliterix (v1.5+) en modo `steering_mode = "lora"`, usando una LoRA de rango 3 con normalización completa. La técnica emplea proyección ortogonal de los vectores de rechazo, con "winsorised refusal vectors" (según grimjim 2025). El autor unificó el "bucket" de atención de salida para abarcar tanto `linear_attn.out_proj` como `self_attn.o_proj`, ya que un enfoque dividido (V2) alcanzaba solo 26/100 refusals frente a 16/100 del enfoque unificado. El entrenamiento consistió en extraer vectores de rechazo de 800 prompts, buscar con Optuna (30 trials) y fusionar la LoRA en los pesos BF16 para su liberación. No se aplicó RLHF ni DPO; es una modificación puramente post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del base Qwen3.6-27B, incluyendo razonamiento STEM y habilidades de codificación agéntica (el base alcanza 77.2% en SWE-bench Verified según fuentes web).
- Comprensión multimodal: aunque el proceso de abliteración se aplicó solo al módulo de lenguaje, el modelo conserva el wrapper VLM con torre de visión (~1 GB BF16), por lo que puede procesar imágenes si se usa el pipeline completo.
- Supresión de rechazos: responde de forma sustancial y directa a prompts que el base rechazaría, con 15/15 cumplimiento en jailbreaks clásicos (EN+ZH).
- Multilingüe: soporta inglés y chino, con artefactos menores de coherencia en chino para prompts complejos.
- Tool calling y agentes: no hay confirmación explícita en la información proporcionada, pero el base Qwen3.6-27B está diseñado para agentes; se asume herencia de capacidades.
- Modo de pensamiento: no se menciona un modo "thinking" específico en la documentación disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo se comportan los sistemas de rechazo cuando se eliminan, facilitando el análisis de vulnerabilidades en pipelines de moderación y el desarrollo de mejores defensas.
- Pruebas de jailbreak y robustez: los equipos de seguridad pueden usar este modelo como referencia para evaluar la eficacia de sus propios filtros de contenido, comparando respuestas entre el base y la versión abliterada.
- Generación creativa sin restricciones: escritura de ficción con temáticas adultas, humor negro o contenido políticamente sensible que los modelos alineados rechazan, útil para autores y estudios de narrativa.
- Análisis de contenido y desinformación: investigadores pueden generar ejemplos de contenido engañoso o dañino (phishing, noticias falsas) para entrenar detectores y clasificadores, sin depender de modelos externos con políticas restrictivas.
- Desarrollo de asistentes especializados en dominios sensibles: por ejemplo, educación sexual, reducción de daños en drogas o asesoramiento legal sobre actividades ilegales, donde las respuestas directas son más útiles que las evasivas.
- Benchmarking de alineación: el modelo sirve como caso de estudio para medir el impacto de la abliteración en métricas de utilidad (KL, longitud de respuesta) y seguridad, permitiendo calibrar futuras técnicas de desalineación controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta variante abliterada. La model card proporciona métricas específicas del proceso de abliteración:

| Metrica | Base Qwen3.6-27B | Modelo abliterated |
|---|---|---|
| Rechazos en 100 prompts dañinos (juez LLM) | 100 / 100 | 16 / 100 |
| Divergencia KL vs base (prompt benigno, next-token) | — | 0.0181 |
| Desviación de longitud de respuesta vs base (benigno) | — | 0.01 σ |
| Cumplimiento cualitativo en 15 jailbreaks clásicos (EN+ZH) | 0 / 15 | 15 / 15 |

El base Qwen3.6-27B reporta 77.2% en SWE-bench Verified según fuentes web, pero no hay datos equivalentes para esta variante. Se recomienda evaluar el modelo en tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan 54.7 GB en disco, por lo que se necesitan al menos 55-60 GB de VRAM para cargar el modelo completo en BF16.
- GPU recomendadas: una H100 80GB o A100 80GB pueden alojar el modelo en BF16; dos A100 40GB en paralelo también funcionan. Para consumer, una RTX 4090 (24 GB) no es suficiente sin cuantización, pero no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ).
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (requiere conversión previa). El wrapper VLM puede requerir ajustes en el pipeline de carga.
- Latencia y throughput: no hay datos publicados. Como referencia, un modelo denso de 27B en BF16 en una H100 suele alcanzar decenas de tokens por segundo, pero depende de la implementación y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27.36B | No disponible | Híbrido GDN + full attention, VLM | Apache 2.0 | Rechaza 100/100 prompts dañinos |
| Qwen3.6-27B-abliterated (este) | 27.36B | No disponible | Híbrido GDN + full attention, VLM | Apache 2.0 | Rechaza 16/100, cumple 15/15 jailbreaks |
| Qwen3.6-35B-A3B MoE | 35B total, 3B activos | No disponible | MoE | Apache 2.0 | Alternativa más eficiente en inferencia, no abliterada |

No se dispone de otros modelos abliterados de la misma generación para comparación directa. La comparativa se limita a las variantes de Qwen 3.6.

## Limitaciones y advertencias

- Contenido potencialmente dañino: al eliminar los rechazos, el modelo puede generar instrucciones para actividades ilegales (fabricación de explosivos, phishing, malware, etc.). Su uso conlleva responsabilidad legal y ética; no debe desplegarse en aplicaciones orientadas al público sin filtros adicionales.
- Artefactos de coherencia en chino: dos de los cinco jailbreaks en chino mostraron bucles de auto-contradicción o frases incoherentes, lo que indica una degradación leve de fluidez en ese idioma.
- Sesgos y alucinaciones: hereda los sesgos del base Qwen3.6-27B, y al no haber sido sometido a alineación adicional, el riesgo de alucinación en temas factuales es el mismo o mayor.
- Sin cuantizaciones oficiales: no hay versiones GGUF o AWQ publicadas, lo que limita su despliegue en hardware consumer.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada; el base Qwen3.6-27B probablemente soporta 128K o más, pero no está confirmado para esta variante.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin rechazos puede violar términos de servicio de plataformas o leyes locales; el autor no ofrece garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio abliterix: https://github.com/wuwangzhang1216/abliterix
- Página de Qwen3.6-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Guía de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía comparativa Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
