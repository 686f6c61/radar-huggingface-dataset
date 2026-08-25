# XiaoyuWen/TRACE

## Resumen

TRACE (TuRn-level Assignment for CrEdit) es un framework de asignación de crédito a nivel de turno para red-teaming multi-turno basado en aprendizaje por refuerzo. Desarrollado por un equipo de investigadores de la Universidad Jiao Tong de Shanghái y colaboradores, aborda el problema de que en los ataques de jailbreak multi-turno, la intención dañina se distribuye a lo largo de varios turnos de conversación aparentemente benignos, lo que dificulta identificar qué turnos contribuyen realmente al éxito del ataque. TRACE resuelve este problema mediante enmascaramiento semántico leave-one-turn-out para asignar crédito en trayectorias exitosas y señales de nocividad y relevancia semántica para penalizar trayectorias fallidas.

El modelo liberado es una variante entrenada sobre Qwen2.5-3B-Instruct, orientada a atacar dos modelos objetivo: gpt-oss-20b y Llama-3.1-8B-Instruct. El framework se publica bajo licencia Apache 2.0 e incluye un script de inferencia interactiva que permite orquestar ataques manualmente contra un modelo objetivo autorizado. Su relevancia actual radica en que los jailbreaks multi-turno representan una amenaza creciente para los sistemas de IA conversacionales, y TRACE proporciona tanto un método de evaluación como señales para intervención defensiva temprana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen2.5-3B-Instruct (transformer decoder-only); arquitectura interna del framework no disponible |
| Parametros totales | No disponible (el modelo base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

TRACE no es un modelo de lenguaje de propósito general, sino un framework de entrenamiento y un checkpoint específico para red-teaming. El checkpoint liberado (TRACE-Mix-Qwen2.5-3B-Instruct) parte de Qwen2.5-3B-Instruct y se entrena mediante aprendizaje por refuerzo para generar ataques multi-turno contra dos modelos objetivo: gpt-oss-20b y Llama-3.1-8B-Instruct. El método de asignación de crédito emplea enmascaramiento semántico leave-one-turn-out en trayectorias exitosas para determinar qué turnos son imprescindibles, y combina señales de nocividad (harmfulness) y relevancia semántica para penalizar turnos en trayectorias fallidas. Estas mismas señales a nivel de turno pueden utilizarse para intervención defensiva temprana, detectando turnos sospechosos antes de que el ataque se complete.

El entrenamiento sigue un esquema de RL con recompensas derivadas de la evaluación del juez HarmBench Classifier. El prompt contract, la configuración de decodificación y los detalles específicos del modelo se documentan en el repositorio del checkpoint. La configuración de inferencia por defecto usa temperatura 0.5, top-p 0.9, máximo 128 tokens nuevos y un límite de 5 turnos de interacción.

## Capacidades

- Generación de ataques de jailbreak multi-turno: el modelo produce secuencias de consultas que distribuyen la intención dañina a lo largo de varios turnos, evadiendo detectores de contenido basados en turnos individuales.
- Asignación de crédito a nivel de turno: identifica qué turnos contribuyen críticamente al éxito del ataque, lo que permite tanto optimizar el ataque como detectar intervenciones defensivas.
- Evaluación de seguridad de modelos: puede utilizarse como herramienta de red-teaming autorizado para medir la robustez de LLMs frente a jailbreaks multi-turno.
- Soporte de interacción manual: el script `inference.py` permite orquestar ataques turno a turno contra un modelo objetivo operado por separado, sin contacto automático con endpoints.
- Transferencia entre modelos objetivo: el checkpoint entrenado contra gpt-oss-20b y Llama-3.1-8B-Instruct muestra resultados de ataque también contra Qwen2.5-7B-Instruct, lo que sugiere cierta capacidad de transferencia.
- Señales defensivas: las mismas señales de crédito pueden usarse para intervención temprana en sistemas de producción.

## Casos de uso

- Red-teaming autorizado de LLMs: un equipo de seguridad puede usar TRACE para generar ataques multi-turno contra sus propios modelos antes de su despliegue, identificando vulnerabilidades que los evaluadores de un solo turno no detectan. El script interactivo permite controlar manualmente cada turno y registrar las respuestas del modelo objetivo.
- Evaluación comparativa de robustez: organizaciones que mantienen múltiples modelos pueden medir la tasa de éxito de ataque (ASR) bajo el mismo protocolo de 5 turnos, obteniendo métricas comparables entre versiones o proveedores.
- Investigación en seguridad de IA: el framework permite estudiar cómo se distribuye la intención dañina a lo largo de turnos y qué patrones conversacionales son más efectivos, contribuyendo al diseño de defensas más sólidas.
- Desarrollo de detectores de jailbreak multi-turno: las señales de crédito a nivel de turno pueden integrarse en sistemas de monitorización para alertar cuando un turno individual contribuye desproporcionadamente a un posible ataque.
- Auditoría de cumplimiento de políticas de contenido: antes de lanzar un chatbot, se puede usar TRACE para verificar que el sistema no responde a tácticas de jailbreak multi-turno, documentando los resultados para auditorías regulatorias.
- Entrenamiento de modelos defensivos: los datos de trayectorias exitosas y fallidas generados por TRACE pueden servir para entrenar clasificadores de intención dañina o para fine-tuning de modelos con mayor resistencia a ataques multi-turno.

## Benchmarks y rendimiento

El paper reporta la tasa de éxito de ataque (ASR@1, %) bajo un límite de 5 turnos, evaluada con el HarmBench Classifier. Los resultados del checkpoint TRACE (mix) son los siguientes:

| Evaluacion objetivo | HarmBench | JailbreakBench | WildJailbreak | Media objetivo |
|---|---:|---:|---:|---:|
| Qwen2.5-7B-Instruct | 90.57 | 87.72 | 90.50 | 89.60 |
| Llama-3.1-8B-Instruct | 84.48 | 89.09 | 88.67 | 87.41 |
| gpt-oss-20b | 83.64 | 86.06 | 83.17 | 84.29 |
| **Media global** | 86.23 | 87.62 | 87.45 | **87.10** |

No se han publicado resultados de benchmarks comparativos con otros frameworks de red-teaming en la información disponible. El paper incluye análisis de baselines, jueces alternativos, evaluaciones de transferencia e intervalos de confianza, pero esos datos no se reproducen aquí.

## Requisitos de hardware

- Al estar basado en Qwen2.5-3B-Instruct, el checkpoint requiere aproximadamente 6-8 GB de VRAM en FP16, o 3-4 GB en cuantización de 8 bits.
- Es ejecutable en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, o RTX 4090 sin problemas.
- Para despliegue en producción, se recomienda vLLM o TGI para servir el modelo con alta concurrencia; para uso interactivo, llama.cpp u Ollama son suficientes.
- El script de inferencia proporcionado es ligero y no requiere infraestructura especial; solo necesita un entorno Python con las dependencias mínimas.
- No se han publicado datos oficiales de latencia o throughput. Con un modelo de 3B, se espera una latencia de decodificación de decenas de milisegundos por token en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de red-teaming multi-turno con los que comparar directamente en términos de arquitectura y rendimiento. El propio TRACE es un framework, no un modelo de propósito general. Como referencia cualitativa:

| Modelo | Tipo | Base | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| TRACE (mix) | Red-teaming multi-turno | Qwen2.5-3B-Instruct | No disponible | Apache 2.0 | Generación de ataques y evaluación de seguridad |
| Qwen2.5-3B-Instruct | LLM general | - | 32K (típico) | Apache 2.0 | Generación de texto, chat, código |
| GPTFuzzer (no liberado como modelo) | Fuzzing de jailbreaks | GPT-3.5/4 | - | - | Generación de variantes de prompts |

La comparación con GPTFuzzer u otros métodos de red-teaming no es posible con los datos disponibles, ya que no se publican métricas comparables en la misma configuración.

## Limitaciones y advertencias

- Advertencia de doble uso: TRACE estudia prompts adversariales diseñados para revelar fallos de seguridad en LLMs. Su uso está restringido a investigación de seguridad autorizada y controlada. No debe utilizarse para atacar sistemas sin permiso, exponer el atacante como servicio no restringido, ni ejecutar automáticamente el contenido generado.
- Riesgo de alucinación: como modelo basado en Qwen2.5-3B-Instruct, puede generar contenido falso o incoherente, especialmente en turnos largos. No es adecuado para tareas de generación de contenido factual.
- Sesgos conocidos: el modelo está entrenado específicamente para ataques de jailbreak, por lo que su comportamiento fuera de ese dominio no ha sido evaluado. Puede reflejar sesgos del modelo base y de los datos de entrenamiento de red-teaming.
- Limitaciones de idioma: no se han publicado los idiomas soportados. El entrenamiento se realizó presumiblemente en inglés, dado que los benchmarks y el paper están en inglés.
- Restricciones de producción: no es un modelo de chat general; su uso en producción debe limitarse a entornos de evaluación de seguridad con controles estrictos. No debe integrarse en sistemas que interactúen con usuarios finales.
- Dependencia del juez: los resultados de ASR dependen del HarmBench Classifier; otros jueces pueden dar resultados diferentes. La transferencia a otros modelos objetivo no está garantizada.

## Enlaces

- Repositorio HuggingFace del proyecto: https://huggingface.co/XiaoyuWen/TRACE
- Checkpoint del modelo: https://huggingface.co/XiaoyuWen/TRACE-Mix-Qwen2.5-3B-Instruct
- Paper arXiv: https://arxiv.org/abs/2605.08778
- PDF del paper: https://arxiv.org/pdf/2605.08778
- DOI: https://doi.org/10.48550/arXiv.2605.08778
- Código de entrenamiento y evaluación: https://github.com/xsddys/TRACE
- Perfil del autor en Hugging Face: https://huggingface.co/XiaoyuWen/models
- Perfil del autor en GitHub: https://github.com/BattleWen/
