# yuriojogador/qwen2.5-0.5b-bragasaude

## Resumen

Qwen2.5-0.5B Braga Saúde es un ajuste fino de tipo SLM (Small Language Model) del modelo `Qwen/Qwen2.5-0.5B-Instruct`, publicado por el usuario `yuriojogador` en Hugging Face. Se trata de un modelo especializado en el dominio de la salud (concretamente en el contexto de la entidad Braga Saúde), orientado a tareas de asistencia conversacional, clasificación y diálogo en portugués de Brasil. El modelo usa la arquitectura transformer decoder-only densa de la familia Qwen2.5 y cuenta con 494.032.768 parámetros totales (aproximadamente 0,49 mil millones).

El ajuste se realizó mediante SFT con QLoRA en 4 bits (r=16, lora_alpha=32) usando el framework Unsloth sobre la variante cuantizada `unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit`. El resultado se distribuye únicamente en formato GGUF con cuantización Q4_K_M, lo que reduce el peso del repositorio a unos 0,4 GB y hace que el modelo sea desplegable en CPU, dispositivos de borde y GPUs de consumo con muy pocos recursos.

Su relevancia radica en dos factores: por un lado, demuestra un flujo de trabajo reproducible de especialización de dominio sobre modelos de menos de 1 B de parámetros; por otro, su tamaño permite ejecutarlo íntegramente en local, algo especialmente relevante en aplicaciones sanitarias donde la privacidad de los datos del paciente y el cumplimiento normativo (por ejemplo, la LGPD brasileña) hacen inviable depender de APIs en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parámetros totales | 494.032.768 (0,49 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (configurado en la model card del ajuste); la familia Qwen2.5 soporta hasta 128K tokens en el modelo base |
| Tipos de cuantización | Q4_K_M (4 bits, variante medium) en GGUF |
| Idiomas soportados | portugués (pt, pt-BR) según la model card del ajuste; el modelo base Qwen2.5 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp, Ollama, LM Studio, vLLM y Hugging Face Spaces) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso, sin mezcla de expertos ni mecanismos de estado recurrente, con atención causal estándar. El modelo base de la familia Qwen2.5 fue preentrenado sobre un dataset a gran escala de hasta 18 billones de tokens, según la documentación oficial de Qwen recogida en los resultados de búsqueda.

El ajuste de dominio se realizó con SFT usando QLoRA en 4 bits con rango r=16 y lora_alpha=32, sobre el checkpoint `unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit`. Las herramientas declaradas son Unsloth, TRL, PyTorch y Transformers. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron fases posteriores de RLHF o DPO específicas para este fine-tune; tampoco documenta innovaciones arquitectónicas propias, más allá del proceso de cuantización a GGUF Q4_K_M para su distribución.

## Capacidades

- Generación de texto conversacional en portugués (pt/pt-BR), con un system prompt específico de asistente de Braga Saúde.
- Diálogo multi-turno breve, limitado por la ventana de contexto de 2048 tokens.
- Clasificación de textos, según declara el autor, orientada a tareas asistenciales y de categorización dentro del dominio sanitario.
- Tareas de asistencia y respuesta a preguntas frecuentes del dominio Braga Saúde.
- Hereda del modelo base Qwen2.5-0.5B-Instruct capacidades generales de generación y seguimiento de instrucciones, aunque el ajuste puede haber degradado parte de ellas en favor del dominio.
- No se documenta soporte de tool calling / function calling en la model card.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: no documentada para el ajuste; solo se declara portugués.

## Casos de uso

- Asistente virtual de atención al paciente: el modelo puede gestionar conversaciones de soporte en portugués de Brasil con un system prompt de rol, respondiendo preguntas frecuentes sobre servicios y funcionamiento de la entidad, con un coste de cómputo mínimo.
- Triaje y clasificación de consultas entrantes: dado su entrenamiento declarado en clasificación dentro del dominio Braga Saúde, puede etiquetar mensajes de usuarios por temática o urgencia antes de derivarlos a un agente humano.
- Despliegue on-premise con datos sensibles: al pesar unos 397 MB en Q4_K_M y ejecutarse en CPU, permite procesar datos de salud sin salir de la infraestructura de la organización, facilitando el cumplimiento de requisitos de privacidad y de la LGPD.
- Chatbot embebido en web o aplicación móvil: su huella de memoria inferior a 1 GB lo hace apto para entornos con recursos limitados o para servir respuestas en dispositivos de borde.
- Generación de borradores de respuestas y plantillas de comunicación: puede producir textos base que un operador humano revise antes de enviarlos, reduciendo el tiempo de redacción en flujos de atención repetitivos.
- Prototipado de pipelines RAG en dominio sanitario: sirve como generador ligero dentro de una arquitectura de recuperación aumentada para validar la lógica de negocio antes de escalar a un modelo mayor.
- Pruebas de integración con llama.cpp, Ollama o LM Studio: útil como modelo de referencia para validar cadenas de despliegue y latencias en entornos de desarrollo.
- Filtrado y resumen de conversaciones de atención: puede condensar hilos de mensajes en resúmenes breves para sistemas de ticketing, siempre con supervisión humana dado el riesgo de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio sanitario, y los resultados de búsqueda solo aportan información del modelo base Qwen2.5-0.5B-Instruct, no del ajuste Braga Saúde.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en la cuantización Q4_K_M distribuida (fichero de aproximadamente 397 MB).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; no requiere A100, H100 ni tarjetas de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe sin problema en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con memoria compartida.
- Ejecución en CPU: viable, incluyendo placas tipo Raspberry Pi 4/5 y mini-PC de bajo consumo.
- Opciones de despliegue: llama.cpp (CLI y `llama-cpp-python`), Ollama mediante el `Modelfile` incluido en el repositorio, LM Studio, vLLM y Hugging Face Spaces.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-0.5B Braga Saúde (este modelo) | 0,49 B | 2048 tokens (ajuste) | Apache 2.0 | GGUF Q4_K_M en Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,49 B | hasta 128K tokens (familia Qwen2.5) | Apache 2.0 | Pesos originales y múltiples cuantizaciones |
| Qwen2.5-1.5B-Instruct | 1,5 B | hasta 128K tokens (familia Qwen2.5) | Apache 2.0 | Pesos originales y múltiples cuantizaciones |

La comparación de rendimiento frente a estas alternativas no está disponible: no se han publicado métricas del ajuste Braga Saúde que permitan contrastar su calidad frente al modelo base o frente a variantes de mayor tamaño de la misma familia.

## Limitaciones y advertencias

- Modelo de 0,49 B de parámetros: la capacidad de razonamiento, coherencia en respuestas largas y comprensión de instrucciones complejas es limitada en comparación con modelos de mayor tamaño.
- Riesgo elevado de alucinación, especialmente crítico en un dominio sanitario donde una respuesta incorrecta puede tener consecuencias para el usuario.
- No es un producto sanitario ni dispone de validación clínica; no debe usarse para diagnóstico, prescripción ni consejo médico sin supervisión profesional.
- Ventana de contexto de 2048 tokens, insuficiente para historiales clínicos extensos o conversaciones muy largas.
- Idioma restringido al portugués (pt/pt-BR) según la model card; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- El ajuste puede haber degradado capacidades generales del modelo base, incluidas las multilingües y de seguimiento de instrucciones.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento, por lo que no es posible auditar posibles sesgos de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre los resultados generados.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa que respalde las capacidades declaradas por el autor.
- Para producción sanitaria se recomienda supervisión humana en el bucle, filtros de seguridad posteriores y revisión legal respecto a la normativa aplicable de protección de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriojogador/qwen2.5-0.5b-bragasaude
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio espejo de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Ficha de Qwen2.5-0.5B en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B/summary
- Variante Qwen2.5 0.5B en Ollama: https://ollama.com/library/qwen2.5:0.5b
