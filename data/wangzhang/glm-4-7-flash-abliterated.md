# wangzhang/GLM-4.7-Flash-abliterated

## Resumen

GLM-4.7-Flash-abliterated es una version modificada del modelo zai-org/GLM-4.7-Flash, creada por Wangzhang Wu mediante la tecnica de abliteracion implementada en la herramienta Abliterix. El objetivo de esta modificacion es eliminar los mecanismos de rechazo y censura del modelo original, produciendo una variante "sin restricciones" que mantiene las capacidades generales del modelo base con una divergencia KL minima.

El modelo base, GLM-4.7-Flash, es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 30 mil millones de parametros totales y 3 mil millones activos por token, desarrollado por Zhipu AI. Incorpora Multi-head Latent Attention (MLA) y soporta un contexto de 128K tokens. La version abliterated se publica bajo licencia MIT y esta pensada para investigacion en seguridad de IA, aunque su uso conlleva riesgos significativos al haber eliminado las salvaguardas de seguridad.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un LLM sin alineamiento de seguridad, comparando sus respuestas con la version original para investigar mecanismos de rechazo, sesgos y tecnicas de desalineamiento. Su publicacion en febrero de 2026 y la disponibilidad de cuantizaciones para hardware consumer lo hacen accesible para experimentacion en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 MoE Lite con Multi-head Latent Attention (MLA) |
| Parametros totales | 29.943.390.976 (30B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16, INT8, NF4 (segun documentacion del autor) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base GLM-4.7-Flash es una variante MoE Lite con 47 capas (1 densa y 46 MoE), 64 expertos enrutados mas 1 experto compartido, con top-4 routing y hidden size de 2048. Incorpora Multi-head Latent Attention (MLA), una innovacion que reduce el coste de KV-cache y mejora la eficiencia en contextos largos.

El proceso de abliteracion aplicado por Abliterix consta de varias etapas: primero se computan direcciones de rechazo a partir de 400 pares de prompts daninos y benignos en las 47 capas; despues se aplica abliteracion ortogonalizada para aislar los patrones de activacion especificos del rechazo; se modifican de forma independiente las proyecciones de salida de atencion (MLA) y las down-projections de MLP/expertos; se perfilan las activaciones de expertos MoE en las 46 capas del router para identificar expertos criticos para la seguridad; se aplica un steering hibrido MoE con supresion de pesos del router en 21 expertos (bias=-1.64) y abliteracion fusionada de expertos (weight=1.85); finalmente se optimiza con Optuna TPE sobre 50 trials con 15 de warmup, seleccionando el trial 48.

El modelo original fue entrenado con datos bilingues (ingles y chino) e incluye capacidades de razonamiento, codigo y matematicas. La version abliterated no ha sido reentrenada, solo modificada en el espacio de pesos.

## Capacidades

- Generacion de texto en ingles y chino con calidad equivalente al modelo original (KL divergence de 0.0133 respecto al base).
- Razonamiento multi-step y resolucion de problemas complejos, heredado del modelo GLM-4.7-Flash.
- Generacion de codigo en multiples lenguajes de programacion.
- Capacidades matematicas y de razonamiento logico.
- Soporte de contexto largo de hasta 128K tokens, util para documentos extensos y conversaciones multi-turno.
- Sin mecanismos de rechazo: el modelo responde a practicamente cualquier solicitud (1% de rechazos frente al 92% del original en evaluaciones con 100 prompts daninos).
- Capacidades de chat y seguimiento de instrucciones mediante chat template estandar.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin alineamiento, analizando como responde a prompts daninos y comparando con la version original para entender los mecanismos de rechazo.
- Evaluacion de tecnicas de desalineamiento: investigadores pueden usar este modelo como referencia para probar metodos de re-alineamiento o deteccion de modelos abliterados.
- Analisis de sesgos y comportamientos no filtrados: util para estudiar que tipo de contenido generan los modelos cuando se eliminan las restricciones de seguridad.
- Pruebas de robustez de sistemas de moderacion: las plataformas pueden usar este modelo para testear sus filtros de contenido y sistemas de guardia.
- Educacion sobre riesgos de IA: como ejemplo didactico de los peligros de desplegar modelos sin salvaguardas en produccion.
- Desarrollo de tecnicas de jailbreak defensivo: estudiar como este modelo responde puede ayudar a disenar mejores defensas contra ataques de jailbreak en modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona dos metricas de evaluacion:

| Metrica | Modelo abliterated | Modelo original |
|---|---|---|
| KL divergence | 0.0133 | 0 |
| Refusals (sobre 100 prompts daninos) | 1/100 (1%) | 92/100 (92%) |

La evaluacion fue realizada con un LLM judge (Gemini Flash) sobre 100 prompts daninos. La KL divergence de 0.0133 indica que las capacidades generales del modelo son practicamente identicas al original. Los resultados de busqueda web mencionan valores alternativos (KL: 0.0065, refusals: 9/100), que probablemente corresponden a una version anterior o a una evaluacion distinta.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~56 GB (GPU A100 80GB, H100).
- VRAM estimada en INT8: ~30 GB (GPU A40, RTX 4090).
- VRAM estimada en NF4: ~15 GB (GPU RTX 3090, RTX 4080).
- El modelo cabe en GPUs consumer de gama alta con cuantizacion NF4 o INT8, pero requiere GPUs de datacenter para precision completa BF16.
- Opciones de despliegue: transformers con trust_remote_code, Ollama (disponible como huihui_ai/glm-4.7-flash-abliterated), llama.cpp para cuantizacion GGUF.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusals | KL div. |
|---|---|---|---|---|---|
| wangzhang/GLM-4.7-Flash-abliterated | 30B total / 3B activos | 128K | MIT | 1% | 0.0133 |
| zai-org/GLM-4.7-Flash (original) | 30B total / 3B activos | 128K | MIT | 92% | 0 |
| huihui_ai/glm-4.7-abliterated | 30B total / 3B activos | 128K | MIT | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos suficientes para comparar con otros modelos abliterados de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido despojado de sus salvaguardas de seguridad: respondera a solicitudes daninas, ilegales o eticamente cuestionables que el modelo original rechazaria.
- Puede generar contenido ofensivo, explicito, peligroso o ilegal sin filtro alguno.
- Riesgo de alucinaciones y de producir informacion falsa presentada con alta confianza, especialmente en dominios especializados.
- Limitado a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- El modelo es experimental y se proporciona "AS IS", sin garantias de ningun tipo.
- No debe utilizarse en produccion, sistemas de toma de decisiones, atencion medica, legal o financiera, ni en ningun escenario donde las respuestas puedan causar dano.
- La licencia MIT permite uso comercial, pero el autor advierte que los usuarios son responsables del cumplimiento legal y etico de sus usos.
- Existe una discrepancia en la licencia declarada: la model card indica MIT mientras que el repositorio oficial de GLM declara Apache-2.0; el autor sigue la metadata de HuggingFace pendiente de aclaracion.
- El proceso de abliteracion puede haber introducido degradaciones sutiles en capacidades especificas no detectadas por la evaluacion de KL divergence.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangzhang/GLM-4.7-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Version en Ollama: https://ollama.com/huihui_ai/glm-4.7-flash-abliterated
- Articulo sobre el modelo: https://medium.com/@alexbuzunov/understanding-model-abliteration-why-safety-research-requires-seeing-the-full-picture-ff9d8cb16a50
