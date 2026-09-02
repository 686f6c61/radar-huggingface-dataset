# sumitguha13/phi-4-mini-adr-detector

## Resumen

Phi-4-mini ADR Detector es un fine-tune LoRA del modelo `microsoft/Phi-4-mini-instruct` (3,8 mil millones de parámetros) desarrollado por sumitguha13 para clasificar trazas de ejecución de agentes de IA como benignas o maliciosas. El modelo se especializa en la detección de ataques a agentes, como inyección indirecta de prompts, shadowing de herramientas, secuestro de flujo de control y envenenamiento de datos, entre otras técnicas recogidas en el benchmark ADR-Bench de Uber.

El problema que resuelve es la falta de clasificadores específicos para trazas de agentes, donde los modelos generales no discriminan adecuadamente entre comportamiento normal y comprometido. La relevancia actual viene del auge de los agentes autónomos que usan MCP (Model Context Protocol) y herramientas externas, lo que amplía la superficie de ataque. El modelo aprovecha la ventana de contexto de 131 072 tokens de Phi-4-mini para procesar trazas completas sin truncamiento, algo que los modelos de contexto corto no pueden hacer.

Arquitectónicamente es un transformer decoder-only denso (no MoE) con atención sdpa recomendada para evitar desbordamientos de memoria en trazas largas. El fine-tune se realizó con LoRA sobre las proyecciones qkv, o, gate_up y down, con 2 épocas y un dataset sintético de trazas de agentes. Está publicado bajo licencia MIT y orientado a uso en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini-instruct) |
| Parametros totales | 3 836 021 760 (3,8B, modelo base) |
| Parametros activos | 3 836 021 760 (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | no disponible (se puede cuantizar con tecnicas estandar como GPTQ, AWQ o GGUF) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Phi-4-mini-instruct, un transformer denso de 3,8B parámetros entrenado por Microsoft sobre datos web y sintéticos de alta calidad. Sobre este base se aplicó un fine-tune LoRA con r=32, alpha=64 y dropout 0,05, atacando las proyecciones `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`. El entrenamiento duró 2 épocas con una tasa de aprendizaje de 1e-4 con scheduler coseno, longitud máxima de secuencia de 3072 tokens, y se ejecutó en una única GPU A100-40GB durante 32 minutos, alcanzando una pérdida de entrenamiento de 0,074. El dataset usado, `sumitguha13/adr-agent-trace-detection`, incluye 440 cadenas reales de inyección extraídas del corpus Nemotron-AIQ de NVIDIA, junto con trazas sintéticas de agentes. La división train/validación se hizo por pares para que una traza benigna y su gemela maliciosa nunca quedaran separadas. No se aplicó RLHF ni DPO; es un fine-tune supervisado puro.

La principal innovación técnica es el uso de la ventana de contexto completa de 131K tokens, que permite clasificar trazas de hasta 27 932 tokens sin truncamiento. Un intento previo con un modelo de 8K de contexto truncaba el 46,9% de las trazas de ADR-Bench, y de forma desigual (las benignas son ~3 veces más largas que las maliciosas), lo que introducía un sesgo de longitud. Con este modelo no hay truncamiento.

## Capacidades

- Clasificación binaria de trazas de ejecución de agentes: benigna o maliciosa.
- Detección de técnicas de ataque específicas: inyección indirecta de prompts, shadowing de herramientas, ataques temporales de datos, abuso de intérprete de código, manejo inseguro de salidas, tirón de herramientas, alucinación de herramientas, DoS a nivel de modelo, agotamiento de recursos facilitado por el agente, secuestro de flujo de control, suplantación de identidad del agente, colusión entre agentes maliciosos, servidores MCP no verificados, secuestro de objetivos a largo plazo, explotación de permisos excesivos de herramientas.
- Procesamiento de trazas completas gracias a los 131 072 tokens de contexto, sin truncamiento.
- Generación de una salida estructurada con clasificación, evidencia y confianza (formato `CLASSIFICATION: [BENIGN/MALICIOUS]`, `EVIDENCE: [...]`, `CONFIDENCE: [0.0-1.0]`).
- Uso como clasificador de texto generativo (pipeline `text-generation`), no como chat conversacional.
- Capacidad de operar como herramienta de triaje en flujos de auditoría de seguridad de agentes.

## Casos de uso

- Auditoría de seguridad de agentes en producción: el modelo puede analizar trazas de ejecución de agentes que usan MCP o herramientas externas, identificando si una sesión ha sido comprometida. Es adecuado porque procesa la traza completa sin truncar, lo que evita perder evidencias en ataques sutiles que aparecen al final de la conversación.

- Monitorización de servidores MCP: al integrarse en un pipeline de logging, puede clasificar cada interacción con un servidor MCP no verificado y alertar sobre comportamientos maliciosos como tool shadowing o suplantación de identidad. Su precisión en inyección indirecta de prompts (2/2 detectados) lo hace útil para este escenario.

- Detección de inyección de prompts en aplicaciones de agentes: el modelo está entrenado con 440 cadenas reales de inyección, por lo que puede identificar intentos de manipulación del agente en trazas de conversación, incluso cuando el ataque no produce un comportamiento observable inmediato.

- Triage de alertas de seguridad en SOCs de IA: en un centro de operaciones de seguridad, el modelo puede preclasificar trazas sospechosas antes de que un analista humano las revise. Su salida estructurada (clasificación, evidencia, confianza) facilita la priorización de incidentes.

- Evaluación de seguridad de agentes en CI/CD: durante el desarrollo de agentes autónomos, se pueden ejecutar trazas de prueba y pasarlas por el clasificador para verificar que no se introducen vulnerabilidades. El modelo distingue entre trazas benignas y maliciosas con una precisión del 85,8% en el conjunto benigno.

- Investigación en seguridad de agentes: el modelo sirve como baseline para comparar nuevas técnicas de detección o para estudiar la transferibilidad de ataques entre frameworks de agentes. Su evaluación en ADR-Bench proporciona una referencia cuantitativa reproducible.

## Benchmarks y rendimiento

El modelo se evaluó en ADR-Bench de Uber, un conjunto de 303 trazas (261 benignas y 42 maliciosas) que no se usó durante el entrenamiento. Los resultados se comparan con el modelo base Phi-4-mini-instruct usando dos prompts distintos:

| Modelo | Benignas correctas | Maliciosas correctas | Accuracy | Balanced accuracy | F1 |
|---|---|---|---|---|---|
| **Phi-4-mini ADR Detector (este modelo)** | 224/261 (85,8%) | 25/42 (59,5%) | 82,2% | 72,7% | 0,481 |
| Phi-4-mini base (prompt neutral) | 258/261 (98,9%) | 4/42 (9,5%) | 86,5% | 54,2% | 0,163 |
| Phi-4-mini base (prompt de triaje ADR) | 45/261 (17,2%) | 39/42 (92,9%) | 27,7% | 55,0% | 0,263 |

La tabla muestra que el fine-tune logra un equilibrio entre ambas clases, mientras que el base colapsa hacia una sola clase según el prompt. La balanced accuracy del modelo (72,7%) supera claramente la de los dos baselines (~55%). La precisión sobre la clase maliciosa es de 0,403 (37 falsos positivos sobre 261 benignas). Por técnica de ataque, el modelo detecta el 100% de las inyecciones indirectas de prompts y shadowing de herramientas, pero falla por completo en envenenamiento semántico de datos (0/4) y solo captura 7 de 13 secuestros de flujo de control.

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este fine-tune, ya que su propósito es específico de seguridad de agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Phi-4-mini-instruct en bf16 ocupa aproximadamente 7,7 GB (tamaño del repo). Con contexto de hasta 30 000 tokens, se recomienda usar atención sdpa en lugar de eager para evitar desbordamientos de memoria (el README indica que con eager attention OOMa en trazas de 30k tokens).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4) para manejar trazas largas en bf16. Con cuantización a 4 bits (no documentada pero posible), podría caber en GPUs de 8 GB como RTX 3070 o RTX 4060.
- En consumer GPU: sí, es viable en GPUs de gama alta para consumidores (RTX 3090/4090) si se usa sdpa y se limita la longitud de contexto. Para trazas cortas (<8K tokens) incluso GPUs de 8 GB podrían funcionar con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (tras conversión a GGUF) o directamente con Hugging Face Transformers usando `attn_implementation="sdpa"`.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 3,8B en una GPU moderna genera tokens a decenas de tokens por segundo, pero la latencia depende de la longitud de la traza de entrada (hasta 28K tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Balanced accuracy (ADR-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Phi-4-mini ADR Detector (este modelo)** | 3,8B | 131 072 | 72,7% | MIT | Hugging Face |
| Phi-4-mini-instruct (base, sin fine-tune) | 3,8B | 131 072 | ~55% (depende del prompt) | MIT | Hugging Face |
| Modelo de contexto 8K (mencionado en el README, sin nombre) | no disponible | 8 192 | no evaluado (truncaba 46,9% de trazas) | no disponible | no disponible |

No se han identificado otros clasificadores específicos para trazas de agentes con evaluación en ADR-Bench. La comparación directa con el modelo base muestra que el fine-tune añade discriminación real entre clases, mientras que el base solo ajusta el umbral de decisión según el prompt. El modelo de contexto 8K mencionado en el README no está publicado ni nombrado, por lo que no se puede comparar cuantitativamente.

## Limitaciones y advertencias

- Recall malicioso limitado: solo detecta el 59,5% de las trazas maliciosas (25 de 42). Dos de cada cinco ataques pasan desapercibidos, por lo que debe usarse como herramienta de triaje, no como control de seguridad independiente.
- Precisión baja en la clase maliciosa: precisión de 0,403, con 37 falsos positivos sobre 261 trazas benignas. Esto puede generar alertas excesivas en entornos de producción.
- Fallo completo en envenenamiento semántico de datos: no detecta ninguna de las 4 trazas con esta técnica, ya que el compromiso es una manipulación sutil del contenido sin un indicador conductual claro. Los ejemplos sintéticos de entrenamiento no capturaron esta variante.
- Sesgo de longitud en los datos de entrenamiento: existe un confound documentado (sonda de estructura 0,761) entre la longitud de la traza y la clase. Aunque en ADR-Bench la correlación va en dirección opuesta y no benefició al modelo, este sesgo podría afectar a otros conjuntos de datos.
- Generalización limitada: solo se ha evaluado en ADR-Bench. No se ha probado su transferencia a otros frameworks de agentes distintos de los representados en el benchmark.
- Idiomas: el modelo solo soporta inglés. Las trazas en otros idiomas pueden degradar su rendimiento.
- Dependencia del formato de entrada: la clasificación depende de que la conversación se renderice como líneas `role: content` según el formato de ADR. Otros formatos pueden reducir la efectividad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumitguha13/phi-4-mini-adr-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/sumitguha13/adr-agent-trace-detection
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Paper de Phi-4-Mini: https://arxiv.org/pdf/2503.01743v1
- Repositorio ADR-Bench de Uber: https://github.com/uber/ADR
