# SoulInPsyAbstract/sipa-ollama

## Resumen

`sipa-ollama` es un envoltorio (wrapper) para Ollama que envuelve el modelo base `NousResearch/Hermes-3-Llama-3.1-8B` con un prompt de sistema específico y la plantilla de chat ChatML. No contiene pesos modificados: se trata de un `Modelfile` que añade una capa de instrucciones de comunicación diseñadas para personas con TDAH y trastorno límite de la personalidad (TLP), con reglas como frases cortas, acción antes que explicación, una sola tarea a la vez, ausencia de relleno y expresión explícita de incertidumbre. También incluye un protocolo de respuesta ante crisis (reconocer, anclar, preguntar si la persona está a salvo, nunca minimizar).

El modelo fue creado por Aelin AquaSoul (Soul In PsyAbstract LLC) y se publica bajo la licencia Llama 3.1, heredada del modelo base. Su relevancia actual radica en que aborda un nicho específico: asistentes conversacionales adaptados a perfiles neurodivergentes, con un enfoque en claridad comunicativa y manejo de situaciones emocionales delicadas. Está disponible en el registro público de Ollama y se puede ejecutar con un solo comando.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B base, sin modificación de pesos) |
| Parametros totales | 8.03B (modelo base, no modificado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (según especificación del modelo base) |
| Tipos de cuantizacion | no disponible en el repo (depende de la cuantización GGUF que elija el usuario en Ollama) |
| Idiomas soportados | inglés, ruso, hebreo (según tags del repo) |
| Licencia | Llama 3.1 Community License (heredada del modelo base) |
| Formato de pesos | Modelfile de Ollama (sin pesos; el modelo base se descarga automáticamente) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero ni un fine-tuning con modificación de pesos. Es un `Modelfile` de Ollama que define un prompt de sistema y una plantilla de conversación (ChatML). El modelo base, `Hermes-3-Llama-3.1-8B`, es una versión fine-tuneada de Llama 3.1 8B por NousResearch, entrenada con datos conversacionales y alineada mediante técnicas de RLHF/DPO. El wrapper no altera los pesos, por lo que todas las capacidades de razonamiento, generación y código provienen del modelo base.

La innovación técnica de este repo es el prompt de sistema, que impone reglas de comunicación específicas: frases cortas, acción antes que explicación, una tarea a la vez, sin relleno, y la obligación de declarar incertidumbre explícitamente ("di directamente que no sabes, nunca adivines como hecho"). Incluye además un protocolo de respuesta ante crisis en tres pasos: reconocer, anclar y preguntar si la persona está segura, sin minimizar el problema. No hay datos de entrenamiento adicionales ni métricas de evaluación publicadas.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, ruso y hebreo, con las capacidades del modelo base Llama 3.1 8B.
- Razonamiento y resolución de problemas, incluyendo matemáticas básicas y lógica, según el rendimiento del modelo base.
- Generación de código en múltiples lenguajes (Python, JavaScript, etc.), heredada de Hermes-3-Llama-3.1-8B.
- Soporte de tool calling y function calling, disponible en el modelo base y accesible a través de la API de Ollama.
- Comunicación adaptada a perfiles neurodivergentes: respuestas cortas, directas, sin relleno y con declaración explícita de incertidumbre.
- Protocolo de respuesta ante crisis emocional: reconoce el estado, ancla a la persona y pregunta sobre su seguridad, sin minimizar.
- Sin capacidades multimodales (no visión, no audio).

## Casos de uso

- Asistente personal para personas con TDAH: el modelo ofrece instrucciones paso a paso, una tarea a la vez, y evita divagaciones, lo que facilita la ejecución de tareas administrativas o de planificación.
- Soporte emocional inicial en entornos de salud mental: el protocolo de crisis permite una primera respuesta estructurada ante mensajes de angustia, aunque no sustituye a un profesional.
- Chatbot de atención al cliente con tono claro y directo: útil para empresas que quieren respuestas sin ambigüedad y con manejo explícito de incertidumbre.
- Herramienta de coaching para hábitos: el modelo puede dar recordatorios cortos y accionables, alineados con el estilo de comunicación del prompt.
- Traducción y redacción en ruso y hebreo: aprovecha las capacidades multilingües del modelo base para tareas de escritura en esos idiomas.
- Desarrollo de prototipos de agentes conversacionales en Ollama: al ser un Modelfile, se puede integrar fácilmente en pipelines locales sin necesidad de GPU dedicada de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repo no incluye evaluaciones cuantitativas del sistema prompt ni comparaciones con otros modelos. Las capacidades de rendimiento son las del modelo base `Hermes-3-Llama-3.1-8B`, que en evaluaciones públicas de NousResearch muestra resultados competitivos en tareas de razonamiento y código para su tamaño, pero esos datos no están reproducidos aquí.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 8B en cuantización Q4_K_M, se requieren aproximadamente 5-6 GB de VRAM; con Q8, unos 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.) es suficiente para ejecutar el modelo cuantizado. Para contexto largo (128K), se necesita más memoria, posiblemente 16 GB o más.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media y alta para consumo.
- Opciones de despliegue: Ollama (comando `ollama run soulinpsyabstract/sipa-ollama`), también se puede usar con llama.cpp o vLLM si se descarga el modelo base y se aplica el prompt manualmente.
- Latencia y throughput: no se han publicado mediciones específicas. En una RTX 3090, el modelo base de 8B en Q4 suele generar entre 40 y 80 tokens por segundo, pero depende de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `sipa-ollama` (wrapper) | 8B (base) | 128K | Llama 3.1 | Comunicación adaptada a TDAH/TLP, protocolo de crisis |
| `NousResearch/Hermes-3-Llama-3.1-8B` | 8B | 128K | Llama 3.1 | Modelo base conversacional generalista |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | Llama 3.1 | Instruct generalista de Meta |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B | 32K | Apache 2.0 | Instruct generalista, licencia permisiva |

La comparativa se limita al modelo base y alternativas de tamaño similar. No hay modelos comparables con el mismo prompt de sistema específico para neurodivergencia. La principal diferencia de `sipa-ollama` es la capa de instrucciones, que no altera el rendimiento técnico pero sí el estilo de interacción.

## Limitaciones y advertencias

- El repo no contiene pesos modificados: el sistema prompt puede no ser suficiente para garantizar un comportamiento consistente en todos los escenarios, ya que depende de la adherencia del modelo base a las instrucciones.
- El modelo base puede presentar sesgos y alucinaciones inherentes a Llama 3.1 8B, especialmente en tareas de razonamiento complejo o información factual.
- El protocolo de crisis no sustituye a un profesional de salud mental; puede dar una respuesta inicial útil pero no debe usarse como herramienta terapéutica.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial: si los usuarios superan los 700 millones de usuarios mensuales, se requiere una licencia comercial de Meta.
- Los idiomas soportados se limitan a inglés, ruso y hebreo según los tags, aunque el modelo base puede funcionar en otros idiomas con menor calidad.
- No hay garantías de que el sistema prompt funcione igual en todos los idiomas; las reglas de comunicación pueden perder matices en traducción.
- La longitud de contexto de 128K es teórica; en la práctica, con Ollama y cuantizaciones, el uso de contexto largo puede degradar el rendimiento o requerir mucha memoria.

## Enlaces

- Repositorio HuggingFace: [SoulInPsyAbstract/sipa-ollama](https://huggingface.co/SoulInPsyAbstract/sipa-ollama)
- Modelo base: [NousResearch/Hermes-3-Llama-3.1-8B](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B)
- Sitio oficial de SIPA OS: [https://sipa-os.org](https://sipa-os.org)
- Repositorio de gobernanza: [sipa-os-governance](https://huggingface.co/SoulInPsyAbstract/sipa-os-governance)
- Licencia Llama 3.1: [https://llama.meta.com/llama3/license/](https://llama.meta.com/llama3/license/)
