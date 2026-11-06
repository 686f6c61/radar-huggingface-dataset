# theostos/qwen-3.5-babel-27b-sft-agent

## Resumen

qwen-3.5-babel-27b-sft-agent es un ajuste fino supervisado (SFT) del modelo Qwen3.5-27B de Alibaba, desarrollado por el usuario theostos dentro del proyecto Babel-Formal. El modelo está especializado en demostración formal de teoremas y razonamiento con herramientas nativas, con soporte explícito para los asistentes de pruebas Lean 4 y Rocq. Su objetivo es generar bloques de tácticas demostrativas válidas que puedan ser verificadas por el comprobador correspondiente, en lugar de texto matemático informal.

Técnicamente es un transformer causal de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), derivado directamente de Qwen3.5-27B y distribuido íntegramente en safetensors consolidados, sin adaptadores ni fragmentos NeMo. La model card indica que se trata de un modelo solo de texto: no incluye codificador de visión. La relevancia actual reside en que aplica el formato nativo de chat de Qwen (incluido el campo de razonamiento y las llamadas a herramientas en XML) para la interacción con verificadores formales, lo que lo diferencia de otros ajustes que emplean formatos ad hoc.

El entrenamiento se realizó sobre 904 ejemplos durante cinco épocas completas (checkpoint epoch_4_step_144, 145 actualizaciones del optimizador), con un límite de secuencia de 12.288 tokens, tamaño de lote global de 32 y tasa de aprendizaje de 1e-5. Es un SFT puro: no se emplearon GRPO ni iteración con expertos. El autor no reclama ninguna puntuación de benchmark para esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForCausalLM), solo texto |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó un límite de secuencia de 12.288 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (consolidados, no adaptadores) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3.5, concretamente la clase Qwen3_5ForCausalLM, sin codificador de visión. Se distribuye con tokenizador, plantilla de chat nativa y configuración de generación incluidas, y no requiere código de modelo personalizado ni instalación de NeMo para inferencia. La plantilla nativa de Qwen serializa las llamadas a herramientas en su formato XML propio y admite el campo de razonamiento mediante `enable_thinking=True`.

El ajuste fino se realizó por supervisión sobre 904 ejemplos que contienen demostraciones en Lean y Rocq, con las que el modelo aprende a emitir bloques de tácticas completos a través de la herramienta `submit_tactic`. Las demostraciones no inventan retroalimentación del verificador. Los hiperparámetros declarados son: cinco épocas completas (checkpoint epoch_4_step_144, 145 actualizaciones), límite de secuencia de 12.288 tokens, lote global de 32 y tasa de aprendizaje de 1e-5. No se emplearon GRPO ni iteración con expertos, y el autor indica que se validó con Transformers 5.5.0.

## Capacidades

- Generación de texto y razonamiento en el dominio de las matemáticas formales.
- Demostración de teoremas en Lean 4 y Rocq mediante bloques de tácticas.
- Llamada a herramientas nativa: emite llamadas a `submit_tactic` con el esquema JSON proporcionado, en el formato XML de la plantilla de Qwen.
- Modo de razonamiento activable mediante `enable_thinking=True` en la plantilla de chat.
- Conversación multi-turno con la plantilla de chat nativa de Qwen.
- Generación de tácticas a partir de términos de prueba y de dependencias proporcionadas por el usuario.
- No incluye capacidades de visión ni de audio (modelo solo de texto).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia a la demostración formal en Lean 4: el modelo recibe un término de prueba o un objetivo y propone un bloque de tácticas que el usuario verifica después con Lean. Es adecuado porque fue entrenado específicamente para emitir tácticas completas mediante `submit_tactic`.
- Asistencia a la demostración formal en Rocq: mismo flujo que en Lean, aprovechando que el ajuste incluye ejemplos de ambos asistentes.
- Traducción de términos de prueba a tácticas: dado un término de prueba funcional (por ejemplo, `fun (p : Prop) (h : p) => h`), el modelo deriva la secuencia de tácticas equivalente, tal como se muestra en el ejemplo de uso de la model card.
- Integración en pipelines de verificación automatizada: el modelo genera la táctica, un script externo la envía al verificador Lean o Rocq y se realimenta el resultado; encaja porque la salida está estructurada como llamada a herramienta y es fácilmente parseable.
- Prototipado de agentes de razonamiento formal: al soportar el modo de razonamiento y el formato nativo de herramientas de Qwen, puede insertarse en bucles de agente de varios pasos que alternan generación y verificación.
- Investigación en SFT para métodos formales: sirve como punto de partida reproducible (Apache 2.0) para estudiar el efecto del ajuste supervisado con formato de herramientas nativo frente a formatos personalizados.
- Generación de borradores de demostración para revisión humana: el modelo propone tácticas que un matemático o ingeniero de pruebas revisa y corrige antes de incorporarlas a una base de código formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama ninguna puntuación de benchmark para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (26,9 mil millones de parámetros), en FP16/BF16 serían necesarios aproximadamente 54 GB de pesos, más memoria para el contexto y el estado de activación; en cuantizaciones de 8 bits o 4 bits el requisito se reduce de forma proporcional, aunque el autor no publica cuantizaciones ni cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un despliegue en precisión completa requiere GPUs de clase A100/H100 de 80 GB o múltiples GPUs; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo?: no disponible. El tamaño del repositorio (53,8 GB) sugiere que la inferencia en precisión completa no cabe en GPUs de consumo típicas.
- Opciones de despliegue: la model card valida la inferencia con Transformers 5.5.0 y `accelerate` (`device_map="auto"`, `dtype="auto"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-3.5-babel-27b-sft-agent | ~26,9 mil millones | no disponible | Demostración formal (Lean/Rocq), tool calling nativo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | ~26,9 mil millones (según el modelo derivado) | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Otros ajustes de Babel-Formal | no disponible | no disponible | Demostración formal con formato boxed-tactic personalizado | no disponible | Repositorio del proyecto |

La comparación con alternativas de la misma categoría (ajustes especializados en demostración formal) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que las demostraciones generadas pueden ser inválidas: el modelo no es un oráculo de corrección y toda táctica debe verificarse con Lean o Rocq.
- El modelo no ejecuta la herramienta: proporcionar el esquema de `submit_tactic` solo hace que el modelo emita la llamada; la ejecución y verificación corren a cargo del usuario.
- Es un ajuste SFT sobre un conjunto pequeño (904 ejemplos), por lo que la cobertura del dominio formal puede ser limitada y no se han publicado evaluaciones.
- Solo texto: no dispone de capacidades de visión ni de audio.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Longitud de contexto nativa no documentada; el entrenamiento se limitó a secuencias de 12.288 tokens.
- Riesgo de alucinación en la generación de tácticas y de dependencias o lemas inexistentes.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero el autor la hereda del modelo base Qwen3.5 y no ofrece garantías sobre el comportamiento en producción.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue eficiente en hardware limitado requiere trabajo adicional del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theostos/qwen-3.5-babel-27b-sft-agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio del proyecto Babel-Formal (pipeline de entrenamiento y verificación): https://github.com/theostos/babel-formal
