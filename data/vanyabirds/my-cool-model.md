# vanyabirds/my-cool-model

## Resumen

El repositorio `vanyabirds/my-cool-model` en Hugging Face contiene, según su model card, el código y los recursos del benchmark **AgentClinic**, un entorno de evaluación multimodal para agentes de IA en entornos clínicos simulados. El autor, `vanyabirds`, ha subido este material bajo el identificador de un modelo, pero en realidad no se trata de un modelo de lenguaje o multimodal, sino de un marco de evaluación (framework) que permite simular interacciones entre un "doctor" y un "paciente" mediante agentes de lenguaje, con soporte para sesgos, datos clínicos reales (MIMIC-IV) y casos de exámenes médicos (MedQA, NEJM).

El proyecto fue presentado en el artículo *AgentClinic: a multimodal agent benchmark to evaluate AI in simulated clinical environments* (arXiv:2405.07960) y su sitio web oficial es [agentclinic.github.io](https://agentclinic.github.io/). El repositorio tiene un tamaño de 3.2 GB e incluye scripts, datasets extendidos y documentación para ejecutar simulaciones. No se proporcionan especificaciones técnicas de un modelo (arquitectura, parámetros, contexto, etc.) porque no se trata de un modelo entrenado, sino de un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un benchmark) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código y datasets, no pesos de modelo) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, datos de entrenamiento o innovaciones técnicas de un modelo, ya que el contenido del repositorio corresponde al código del benchmark AgentClinic. El README describe un sistema de simulación clínica basado en agentes de lenguaje (LLMs) que actúan como doctor, paciente, moderador y medidor. El benchmark incorpora sesgos cognitivos y sociales (recencia, frecuencia, género, raza, etc.) tanto en el doctor como en el paciente, y permite usar modelos de OpenAI, Replicate o cualquier modelo de Hugging Face mediante wrappers. No se mencionan procesos de entrenamiento específicos.

## Capacidades

El repositorio no define capacidades de un modelo, pero el benchmark AgentClinic ofrece las siguientes funcionalidades:

- Simulación de consultas clínicas multi-turno entre un agente "doctor" y un agente "paciente".
- Soporte para modelos de OpenAI (GPT-4, GPT-4o, GPT-3.5), Replicate (Llama-70B, Mixtral-8x7B) y cualquier modelo de Hugging Face mediante el prefijo `HF_`.
- Evaluación con datasets clínicos: MedQA (215 casos), NEJM (120 casos) y MIMIC-IV (casos reales, requiere aprobación de PhysioNet).
- Incorporación de sesgos configurables tanto para el doctor como para el paciente (11 tipos de sesgo).
- Soporte para entrada de imágenes (visión) en los casos NEJM.
- Tutoriales para construir casos personalizados.

## Casos de uso

Dado que no es un modelo, los casos de uso se refieren al benchmark:

- Investigación en IA clínica: evaluar el rendimiento de LLMs en entornos médicos simulados, midiendo precisión diagnóstica, comunicación y manejo de sesgos.
- Desarrollo de agentes conversacionales para salud: probar prototipos de asistentes virtuales antes de desplegarlos en entornos reales.
- Estudio de sesgos algorítmicos: analizar cómo los LLMs reflejan o amplifican sesgos de género, raza o nivel socioeconómico en decisiones clínicas.
- Formación de profesionales sanitarios: simular interacciones paciente-médico para entrenar habilidades de comunicación o diagnóstico.
- Evaluación comparativa de modelos: comparar el desempeño de GPT-4, Llama 70B, Mixtral 8x7B y otros en tareas clínicas estandarizadas.
- Validación de pipelines de agentes multimodales: probar la integración de visión (imágenes médicas) con razonamiento lingüístico en casos NEJM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la información disponible. El README menciona que los resultados del benchmark AgentClinic se presentan en el paper (arXiv:2405.07960), pero no se incluyen tablas numéricas en la model card. No se deben inventar datos.

## Requisitos de hardware

No aplicable, ya que no es un modelo de inferencia. Para ejecutar el benchmark se necesita:

- Acceso a APIs de OpenAI o Replicate, o una GPU con suficiente VRAM para cargar modelos locales (p. ej., Mixtral-8x7B requiere al menos 48 GB de VRAM en FP16).
- Para modelos locales, se recomienda usar vLLM, llama.cpp u Ollama para optimizar la inferencia.
- El script `agentclinic.py` puede ejecutarse en una máquina con Python y dependencias instaladas (requirements.txt), pero la carga de modelos grandes puede requerir hardware especializado.
- El dataset MIMIC-IV requiere solicitar acceso aprobado en PhysioNet.

## Comparativa con modelos similares

No disponible, ya que no se trata de un modelo comparable. El repositorio contiene un benchmark, no un modelo de lenguaje. Para comparar benchmarks clínicos, se podría mencionar MedQA, NEJM o MIMIC-IV, pero no son modelos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado; es un conjunto de scripts y datasets. No se puede usar como un LLM directamente.
- No se especifica licencia; el uso comercial o de investigación debe consultarse con el autor.
- Los datos de MIMIC-IV requieren aprobación de PhysioNet y cumplimiento de acuerdos de uso.
- El benchmark puede ser lento de ejecutar, especialmente con modelos grandes y múltiples simulaciones.
- Los resultados pueden verse afectados por sesgos inherentes a los LLMs subyacentes, que el benchmark pretende medir pero no corregir.
- No se proporcionan métricas de rendimiento ni garantías de exactitud clínica; el benchmark es una herramienta de investigación, no un sistema médico.

## Enlaces

- Repositorio Hugging Face: [https://huggingface.co/vanyabirds/my-cool-model](https://huggingface.co/vanyabirds/my-cool-model)
- Paper (arXiv): [https://arxiv.org/abs/2405.07960](https://arxiv.org/abs/2405.07960)
- Sitio web del proyecto: [https://agentclinic.github.io/](https://agentclinic.github.io/)
- Datasets MIMIC-IV (requiere aprobación): [https://physionet.org/content/mimiciv/2.2/](https://physionet.org/content/mimiciv/2.2/)
