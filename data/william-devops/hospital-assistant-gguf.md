# william-devops/hospital-assistant-gguf

## Resumen

hospital-assistant-gguf es un ajuste fino del modelo Qwen2.5-1.5B-Instruct realizado por el usuario william-devops mediante QLoRA, orientado a un asistente conversacional para el "Hospital Santa Aurora", un hospital ficticio del Tech Challenge Fase 3 de FIAP. El modelo responde en formato institucional, cita fuentes documentales internas con referencias del tipo `[PROT-SEPSE-01 §4]` y rechaza emitir prescripciones médicas. Se distribuye en formato GGUF con cuantización Q4_K_M, listo para su uso con Ollama.

El modelo hereda la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales y una ventana de contexto que, según la documentación del modelo base, alcanza los 32.768 tokens. El ajuste se ha realizado sobre datos sintéticos y anonimizados, y el autor declara explícitamente que se trata de un proyecto académico no apto para práctica clínica.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de pipeline de ajuste fino con QLoRA y despliegue en GGUF/Ollama para un dominio restringido, no como modelo de propósito general ni como herramienta médica real. El repositorio tiene 76 descargas y ningún "like", lo que refleja su carácter de entrega académica más que de modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en el repo) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `Modelfile` con plantilla ChatML) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso de 1.500 millones de parámetros con atención causal estándar y RoPE. Sobre esa base se aplicó un ajuste fino con QLoRA, técnica que congela los pesos originales y entrena adaptadores de bajo rango sobre una representación cuantizada del modelo, reduciendo drásticamente los requisitos de memoria durante el entrenamiento. El resultado se fusionó y se exportó a GGUF Q4_K_M para inferencia en CPU o GPU de gama baja mediante Ollama.

Los datos de entrenamiento, según la model card, son sintéticos y anonimizados, orientados a reproducir el formato institucional del hospital ficticio y a citar protocolos internos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas propias más allá del pipeline QLoRA + GGUF. El `Modelfile` incluido en el repositorio contiene la plantilla ChatML y el prompt de sistema empleados durante el ajuste, lo que facilita la reproducibilidad del comportamiento.

## Capacidades

- Generación de texto conversacional en portugués con registro institucional.
- Respuesta con citas a fuentes internas en formato `[PROT-XXX §N]`.
- Rechazo explícito de prescripciones médicas, alineado con el prompt de sistema del entrenamiento.
- Seguimiento de instrucciones multi-turno dentro de la ventana de contexto del modelo base.
- Capacidad de razonamiento y código heredada del Qwen2.5-1.5B-Instruct original, aunque no reforzada por el ajuste.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5 lo soporta, pero el ajuste no lo menciona.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al portugués según la model card, aunque el modelo base es multilingüe.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Demostración académica de pipeline QLoRA + GGUF: el modelo sirve para ilustrar el flujo completo desde el ajuste fino hasta el despliegue con Ollama y `docker compose`, tal como propone el repositorio del Tech Challenge.
- Asistente de consulta de protocolos internos en un entorno simulado: dado su entrenamiento para citar referencias como `[PROT-SEPSE-01 §4]`, puede emplearse en pruebas de concepto de recuperación documental con citas verificables.
- Evaluación de comportamiento de rechazo: útil para estudiar cómo un modelo pequeño aprende a declinar peticiones de prescripción médica tras un ajuste con QLoRA.
- Prototipado de chatbots institucionales en portugués: su formato de respuesta fijo y su tamaño reducido permiten iterar rápidamente en entornos de desarrollo sin infraestructura GPU dedicada.
- Docencia sobre alineación y limitaciones de modelos médicos: el propio autor advierte que no debe usarse en práctica clínica, lo que lo convierte en un caso de estudio sobre riesgos de desplegar modelos ajustados en dominios sensibles.
- Pruebas de integración con Ollama y contenedores: el `Modelfile` y las instrucciones de `docker compose` facilitan validar pipelines de despliegue local en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 1,0-1,5 GB para los pesos, más overhead de contexto; cabe holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU con suficiente memoria compartida; también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con 4 GB o más de VRAM.
- Opciones de despliegue: Ollama (soporte nativo vía `Modelfile`), llama.cpp, y cualquier runtime compatible con GGUF; el repositorio propone `docker compose up -d` con los pesos en `models/gguf/`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hospital-assistant-gguf | 1,54 B | No disponible (base: 32.768) | Apache 2.0 | GGUF Q4_K_M | Ajuste QLoRA para dominio ficticio, solo portugués |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Safetensors, GGUF | Modelo base multilingüe de propósito general |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | Safetensors | Variante base sin instrucciones |
| Modelos médicos en portugués de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que es un proyecto académico y que no debe usarse en práctica clínica.
- Entrenado sobre datos sintéticos y anonimizados de un hospital ficticio; no ha sido validado con datos clínicos reales.
- Riesgo de alucinación elevado en dominios médicos, especialmente al citar protocolos o fuentes que no existen fuera del corpus sintético.
- Idioma limitado al portugués según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Modelo de 1,5 B de parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamaño.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a prompts adversarios.
- Aunque la licencia es Apache 2.0, el uso comercial en contextos sanitarios reales requeriría validación clínica independiente y cumplimiento normativo que el modelo no ofrece.
- El repositorio tiene muy poca tracción (76 descargas, 0 likes) y una única cuantización publicada, lo que limita su soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/william-devops/hospital-assistant-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto (código, datos y memoria): https://github.com/fiap-pos-org/fiap-tc-fase3
- Demostración: https://william-devops-hospital-assistant.hf.space
