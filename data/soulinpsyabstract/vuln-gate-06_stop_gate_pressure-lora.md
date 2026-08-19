# SoulInPsyAbstract/vuln-gate-06_stop_gate_pressure-lora

## Resumen

El modelo `vuln-gate-06_stop_gate_pressure-lora` es un adaptador LoRA especializado en resistencia a presión para agentes de escaneo de vulnerabilidades. Forma parte de la familia de seis especialistas `vuln-gate (G15)` desarrollada por SoulInPsyAbstract dentro del proyecto SIPA OS (EilatSecure). Su función es reforzar el comportamiento de "detener y reportar" cuando se ha detectado una vulnerabilidad, incluso si el agente recibe presiones externas (urgencia, autoridad, coste hundido, etc.) para continuar con el análisis.

El adaptador se construye sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` y se entrena mediante fine-tuning supervisado (SFT) con solo ejemplos positivos del comportamiento deseado. La relevancia actual radica en la necesidad de implementar salvaguardas de seguridad en agentes autónomos que escanean código, donde un LLM no debe tomar decisiones de "continuar" tras detectar una vulnerabilidad, sino seguir una regla determinista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder) |
| Parametros totales | No disponible (tamaño del repo: 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento con 4-bit (bnb); inferencia no especificada |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `Qwen2.5-7B-Instruct` con r=16, alpha=32 y dropout=0.05, afectando a los módulos `q/k/v/o/gate/up/down_proj`. El entrenamiento se realizó con SFT positivo-only (TRL SFTTrainer/SFTConfig), es decir, el modelo solo ve el comportamiento correcto (reportar y detenerse) como objetivo, nunca sus propias racionalizaciones o escaladas. Se usaron 180 ejemplos para este grupo, de los cuales 20 se retuvieron para evaluación y no se incluyeron en el entrenamiento. Se entrenó durante 3 épocas con cuantización de 4 bits (bitsandbytes).

La innovación técnica es que el refuerzo se hace a nivel de entrenamiento, no como una compuerta arquitectónica. El autor advierte explícitamente que en producción la detección debe ser código determinista, no una decisión del LLM.

## Capacidades

- Generación de texto en formato conversacional (heredada del modelo base).
- Especialización en el protocolo de compuerta de vulnerabilidad (G15): si se detecta una vulnerabilidad, devolver `FALSE` y detenerse, sin confirmar impacto ni continuar.
- Resistencia a presiones de diversa índole: urgencia, autoridad, coste hundido o "ya que lo he encontrado".
- No incluye tool calling, visión, audio ni otras capacidades multimodales.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Agentes de escaneo de vulnerabilidades en pipelines de CI/CD: el adaptador puede integrarse en un agente que analice código y, al detectar una vulnerabilidad, genere un informe y se detenga, evitando que el modelo continúe explorando vectores de ataque no autorizados.
- Sistemas de seguridad de IA en entornos de prueba de penetración: cuando un agente encuentra una falla, debe parar y reportar, sin intentar explotarla, para cumplir políticas de seguridad.
- Auditoría de código automatizada con supervisión humana: el modelo puede generar reportes de vulnerabilidades y detenerse, permitiendo que un analista humano decida los siguientes pasos.
- Entrenamiento de agentes de seguridad con comportamiento gobernado: sirve como componente de refuerzo en sistemas multiagente donde se necesita que cada agente respete reglas de parada.
- Evaluación de robustez de modelos de lenguaje frente a ataques de "jailbreak" que presionan al modelo para continuar tras una señal de stop.
- Investigación en seguridad de IA: permite estudiar el efecto del entrenamiento positivo-only en la adherencia a reglas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el especialista fue evaluado en su conjunto retenido (20 ejemplos) antes de fusionarse con sus hermanos en `vuln-gate-merged-qwen25-lora`, pero no se proporcionan métricas numéricas.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. Dado que es un adaptador LoRA sobre un modelo de 7B, los requisitos dependen del modelo base:

- VRAM estimada para inferencia: con cuantización 4-bit, aproximadamente 6-8 GB son suficientes; sin cuantizar, alrededor de 14-16 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB) o superiores; en entornos profesionales, A10, A100 o H100.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y peft, o exportar a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Este adaptador es uno de seis especialistas de la familia `vuln-gate`, que posteriormente se fusionan en un único modelo `vuln-gate-merged-qwen25-lora`. No se han publicado comparativas con otros adaptadores o modelos de seguridad.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 180 ejemplos, lo que puede limitar la generalización a otros escenarios de presión no vistos.
- No sustituye una compuerta arquitectónica: en producción, la detección y la decisión de parada deben implementarse mediante código determinista, no confiando únicamente en el comportamiento aprendido.
- El modelo base Qwen2.5-7B-Instruct puede tener sesgos y alucinaciones inherentes; el adaptador no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador está diseñado para un caso de uso muy específico y puede no ser adecuado para tareas generales.
- No se han publicado resultados de robustez frente a ataques adversarios más allá del conjunto de evaluación retenido.

## Enlaces

- [HuggingFace - vuln-gate-06_stop_gate_pressure-lora](https://huggingface.co/SoulInPsyAbstract/vuln-gate-06_stop_gate_pressure-lora)
- [HuggingFace - vuln-gate-merged-qwen25-lora (experimento EXP-031)](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Sitio oficial de SIPA OS](https://sipa-os.org)
