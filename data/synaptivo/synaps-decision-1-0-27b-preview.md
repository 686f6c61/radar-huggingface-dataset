# Synaptivo/Synaps-Decision-1.0-27B-Preview

## Resumen

Synaps-Decision-1.0-27B-Preview es un adaptador LoRA (fine-tuning eficiente en parámetros) entrenado por Synaptivo sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo completo: los pesos consisten únicamente en el delta de adaptación (870 MB en formato safetensors), que debe cargarse sobre el modelo base con la librería PEFT. Su objetivo declarado es mejorar el rendimiento del modelo base en tareas complejas de toma de decisiones y evaluación, un ámbito donde los LLM suelen mostrar debilidades en calibración de confianza y razonamiento comparativo.

La relevancia de esta ficha está en su enfoque: en lugar de reentrenar un modelo de 27B parámetros completos, el autor aplica LoRA con rango 32 tanto en las capas de self-attention como en las capas de linear-attention del modelo híbrido de Qwen3.8, demostrando que es viable adaptar arquitecturas híbridas transformer + GatedDeltaNet con PEFT. Las evaluaciones publicadas muestran mejoras sustanciales en las métricas de decisión (I_tiers) y capacidad, aunque con una regresión notable en calibración de probabilidades que el propio autor documenta con transparencia.

Al tratarse de una versión Preview con solo 17 descargas y 1 like en el momento de redactar esta ficha, debe considerarse un proyecto experimental de autor independiente, no un modelo con respaldo de una organización grande. Es interesante como prueba de concepto de adaptación de modelos híbridos de atención, pero requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo híbrido transformer + linear-attention (GatedDeltaNet) |
| Parametros totales | No disponible (depende del modelo base; el adaptador pesa 870.427.776 bytes, aprox. 870 MB) |
| Parametros activos | No aplicable (no es MoE); el adaptador añade parámetros sobre el base Qwen3.8-27B |
| Longitud de contexto | No disponible (heredada de Qwen/Qwen3.8-27B; consultar la ficha del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, emplea una arquitectura híbrida de 64 capas: 48 capas de atención lineal (GatedDeltaNet) y 16 capas de self-attention completo. El adaptador LoRA se aplica con rango r=32, alpha=64 y dropout de 0.05 sobre tres grupos de módulos: las proyecciones de self-attention (q_proj, k_proj, v_proj, o_proj), las proyecciones de atención lineal (in_proj_qkv, in_proj_z, out_proj) y las proyecciones MLP (gate_proj, up_proj, down_proj). Esta cobertura exhaustiva de módulos explica el tamaño relativamente grande del adaptador (870 MB) frente a LoRAs típicos que solo tocan las proyecciones de atención.

El entrenamiento utilizó 4.000 ejemplos sintéticos de entrenamiento y 500 de validación, generados proceduralmente mediante un motor de reglas determinista, lógica matemática exacta y construcción estructurada de ítems, sin llamadas a un LLM profesor. La receta de entrenamiento empleó un batch efectivo de 32 (micro-batch de 1 con acumulación de gradientes de 32), learning rate de 1e-4 con decaimiento coseno y 100 pasos de warmup. El mejor checkpoint de validación se obtuvo en el paso 800, con una pérdida de validación de 0,0600. El tipo de tarea declarado es CAUSAL_LM. El autor realiza una auditoría de solapamiento que confirma 0 IDs compartidos, 0 estados de problema normalizados compartidos y 0 textos de prompt serializados compartidos entre los datos de entrenamiento y la cohorte abierta de evaluación (739 ítems), aunque advierte de que esto no constituye una garantía universal de descontaminación frente a benchmarks no observados.

## Capacidades

- Toma de decisiones complejas: el adaptador está especializado en tareas de evaluación y decisión, con mejoras medibles en las métricas I_tiers (+14,07 en la cohorte l2dev y +19,47 en retencja respecto al modelo base).
- Mejora del proxy de capacidad: +5,32 puntos en l2dev y +9,45 en retencja frente al modelo base sin adaptar.
- Tareas de opción múltiple con salida probabilística: evaluado en Tacit PL con accuracy del 94,52% y Brier score de 0,0751.
- Generación de texto causal estándar: al ser un adaptador CAUSAL_LM sobre Qwen3.8-27B, conserva las capacidades generales del modelo base (razonamiento, código, matemáticas, etc.), aunque sin garantías de que no se hayan degradado.
- Compatibilidad con arquitecturas híbridas: demuestra que PEFT/LoRA funciona sobre capas de atención lineal GatedDeltaNet, no solo sobre transformers puros.
- Capacidades multilingües: no disponibles explícitamente; dependerían del modelo base.
- Tool calling, agentes, visión o audio: no disponible (no se menciona soporte en la model card).

## Casos de uso

- Sistemas de evaluación comparativa de opciones: el modelo puede puntuar y elegir entre alternativas en tareas de decisión estructurada, donde las métricas I_tiers muestran mejoras de +14 a +19 puntos frente al base, útil en pipelines de selección automática de respuestas o candidatos.
- Clasificación con salida probabilística: dado que se evaluó con Brier score y ECE, es adecuado para flujos que requieren probabilidades asociadas a decisiones, aunque conviene aplicar recalibración posterior (ver limitaciones).
- Filtrado y ranking de contenido: en sistemas de moderación o curación donde se debe decidir si un ítem cumple criterios, la mejora en proxy de capacidad sugiere un rendimiento superior al base en estas decisiones.
- Investigación en adaptación eficiente de modelos híbridos: sirve como referencia práctica para equipos que quieran aplicar LoRA sobre arquitecturas con atención lineal (GatedDeltaNet) sin reentrenar el modelo completo.
- Prototipado de agentes de decisión multi-paso: como componente de decisión dentro de un sistema agéntico más amplio, donde un módulo especializado evalúa opciones antes de ejecutar acciones.
- Validación de datasets sintéticos: el enfoque de entrenamiento con datos procedurales sin profesor LLM puede replicarse para adaptar el modelo a dominios con reglas formales definidas (lógica, matemáticas exactas, construcción estructurada).

## Benchmarks y rendimiento

Los únicos datos disponibles son las evaluaciones publicadas por el autor, que son comparaciones puntuales descriptivas (sin intervalos de remuestreo) entre el modelo base y el adaptador. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

Comparativa abierta (cohorte descriptiva, seed 20261022):

| Cohorte | Modelo | I_tiers | Calibration Score | Capability Proxy |
|---|---|---|---|---|
| l2dev (n=438) | Base | 58,66 | 84,37 | 71,52 |
| l2dev (n=438) | Preview | 72,74 | 80,93 | 76,83 |
| l2dev (n=438) | Delta | +14,07 | -3,44 | +5,32 |
| retencja (n=301) | Base | 47,14 | 81,03 | 64,08 |
| retencja (n=301) | Preview | 66,61 | 80,45 | 73,53 |
| retencja (n=301) | Delta | +19,47 | -0,58 | +9,45 |

Evaluación Tacit PL (split fijo de desarrollo, n=602, Tacit v0.2.0):

| Modelo | Correctas / Total | Accuracy | Brier Score | ECE |
|---|---|---|---|---|
| Base sin adaptar | 564 / 602 | 93,69% | 0,0914 | 0,0090 |
| Preview (paso 800) | 569 / 602 | 94,52% | 0,0751 | 0,0213 |
| Delta | +5 | +0,83 pp | -0,0163 (mejora) | +0,0122 (regresión) |

El autor subraya que estas evaluaciones son descriptivas, no constituyen afirmaciones de superioridad estadística y no reflejan evaluaciones sobre holdouts finales sellados. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente. Como referencia, el modelo base Qwen3.8-27B en FP16 requiere aproximadamente 54 GB de VRAM solo para los pesos; en cuantización de 4 bits, alrededor de 14-16 GB. El adaptador añade aproximadamente 0,9 GB adicionales (en FP16/BF16).
- GPU recomendadas: para el modelo base de 27B en precisión completa, una A100 de 80 GB o H100; para inferencia cuantizada, una RTX 4090 (24 GB) o RTX 3090 podría ser suficiente con cuantización de 4 bits, aunque la compatibilidad de la cuantización con este adaptador no está documentada.
- Consumer GPU: plausible con cuantización de 4 bits del modelo base (RTX 4090/3090), pero no verificado por el autor; no disponible confirmación oficial.
- Opciones de despliegue: la carga requiere transformers con AutoModelForCausalLM para instanciar el base y PEFT para aplicar el adaptador. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que es un adaptador PEFT sobre una arquitectura híbrida con GatedDeltaNet, la compatibilidad con runtimes de inferencia optimizados no está garantizada y debe verificarse caso por caso.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no se realizan afirmaciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Particularidad |
|---|---|---|---|---|
| Synaps-Decision-1.0-27B-Preview | Adaptador LoRA (r=32) sobre Qwen3.8-27B | ~870 MB de delta sobre 27B base | Apache 2.0 | Especializado en tareas de decisión; requiere el modelo base |
| Qwen/Qwen3.8-27B (base) | Modelo híbrido transformer + GatedDeltaNet | 27B | No disponible en esta ficha | Modelo generalista sin especialización en decisión |
| Qwen3-30B-A3B (referencia de categoría) | MoE híbrido | 30B totales / 3B activos | Apache 2.0 | Alternativa MoE de tamaño similar con inferencia más ligera |

Nota: la comparativa con Qwen3-30B-A3B es orientativa por categoría de tamaño; no se han publicado benchmarks que permitan comparar rendimiento directo entre estos modelos en las tareas de decisión evaluadas. Otras alternativas específicas en fine-tunes de decisión de tamaño comparable: no disponible.

## Limitaciones y advertencias

- Regresión de calibración: la adaptación empeora la calibración de probabilidades en todas las cohortes evaluadas (ECE de 0,0090 a 0,0213 en Tacit PL; caídas de -3,44 y -0,58 en calibration score). Si el caso de uso depende de probabilidades bien calibradas, se necesita recalibración post-hoc (el autor no evalúa ni prescribe ningún método concreto).
- Naturaleza descriptiva de las evaluaciones: los resultados son comparaciones puntuales sin intervalos de confianza y sin evaluación en holdouts sellados; no constituyen prueba de superioridad estadística.
- Datos de entrenamiento sintéticos: el modelo se entrenó exclusivamente con 4.000 ejemplos procedurales; el autor documenta que la autoría histórica de las plantillas de prompt iniciales y el runtime de ejecución original son desconocidos, lo que introduce incertidumbre de procedencia.
- Descontaminación no universal: la auditoría de solapamiento cubre solo las cohortes abiertas; no hay garantía frente a contaminación en benchmarks no observados.
- No es un modelo completo: requiere descargar y cargar Qwen/Qwen3.8-27B en la revisión exacta fijada (1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0); usar otra revisión del base puede romper la compatibilidad.
- Compatibilidad de loaders limitada: la model card enfatiza instrucciones específicas de carga (AutoModelForCausalLM); la compatibilidad con runtimes optimizados (vLLM, llama.cpp) no está documentada.
- Riesgo de alucinación: no disponible evaluación específica; al heredar del modelo base, deben asumirse los riesgos generales de alucinación de LLM de 27B.
- Sesgos conocidos: no disponibles; los datos sintéticos procedurales reducen ciertos sesgos de datos web, pero no hay auditoría de sesgos publicada.
- Madurez del proyecto: versión Preview con 17 descargas y 1 like; sin comunidad de validación externa. No recomendado para producción sin validación propia exhaustiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales significativas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Synaptivo/Synaps-Decision-1.0-27B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, repositorio de código, demo u otros enlaces: no disponibles en la información proporcionada.
