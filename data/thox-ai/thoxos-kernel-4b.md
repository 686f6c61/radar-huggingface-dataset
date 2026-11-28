# Thox-ai/ThoxOS-Kernel-4B

## Resumen

ThoxOS-Kernel-4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4B) desarrollado por Thox-ai. Se trata de un fine-tune mediante fp-LoRA de Qwen/Qwen3.5-4B, destilado a partir del modelo profesor ThoxOS-Kernel-27B y fusionado con el modelo base. Su propósito declarado es actuar como estudiante residente del kernel/sistema operativo ThoxOS para los dispositivos ThoxMini y ThoxClip, es decir, un agente orientado a tareas de sistema operativo.

El modelo se publica explícitamente como una **baseline documentada y no como un modelo que haya superado las barreras de seguridad (gate) del programa**. Según la model card, no superó tres pruebas pre-registradas: un fallo duro de conocimiento falso (gatek-f06), una evasión destructiva en la trampa OS-bench trap-01 y una evasión en la sonda P17. El autor indica que los tres son defectos de forma sobre decisiones correctas y que se intentó una remediación acotada que tampoco superó las barreras. Por tanto, el modelo se publica como la mejor medición disponible de un artefacto de 4B, con su registro de evaluación impreso en su totalidad.

La relevancia actual del modelo reside en su transparencia editorial: publica pesos abiertos bajo licencia Apache 2.0, con conversiones GGUF (Q4_K_M, Q8_0 y Q4_0), empaquetado para Ollama y una API compatible con OpenAI a través de `llama serve`. No obstante, su uso en producción como agente residente de sistema operativo requiere un harness que imponga confirmación de acciones destructivas, ya que el propio autor advierte que no debe desplegarse sin esa salvaguarda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tag `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card menciona estimaciones de memoria a 4k y 8k de contexto) |
| Tipos de cuantización | GGUF Q4_K_M, Q8_0 y Q4_0; pesos originales en safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

ThoxOS-Kernel-4B parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4B parámetros, y se obtiene mediante un fine-tune con fp-LoRA (adaptadores de bajo rango en precisión flotante) fusionado posteriormente en el modelo base en las instalaciones de THOX. El proceso de entrenamiento es una destilación: el modelo profesor es ThoxOS-Kernel-27B, descrito como gate-passed (es decir, que sí superó las barreras de seguridad del programa), y el estudiante de 4B aprende de él para operar como agente residente del kernel ThoxOS en los dispositivos ThoxMini y ThoxClip.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Sí menciona que THOX realizó el entrenamiento, el gating y las conversiones a GGUF, mientras que el modelo base es de Qwen. El principio de diseño declarado es que "el modelo propone; el harness dispone": el modelo nunca ejecuta acciones de sistema directamente. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con pipeline `text-generation` y `conversational`.
- Razonamiento orientado a tareas de sistema operativo (kernel/OS agent), incluyendo propuestas de acciones de sistema dentro de un harness externo.
- Destilación de un profesor de 27B, lo que le permite heredar patrones de decisión del modelo mayor.
- Formato de pesos compatible con llama.cpp, Ollama y servidores con API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de cuantización GGUF para despliegue en hardware de consumo.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-step: no disponible en la información proporcionada (el modelo se describe como agente residente, pero sin detallar el bucle de razonamiento).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- **Agente residente de sistema operativo con harness de confirmación**: el modelo propone acciones sobre el sistema (por ejemplo, manipulación de ficheros o procesos) y un harness externo las valida y ejecuta. Es adecuado por su entrenamiento específico como kernel/OS agent, pero requiere obligatoriamente un mecanismo que confirme acciones destructivas, dado que no superó la trampa OS-bench trap-01.
- **Asistente de línea de comandos en dispositivos de gama baja**: con la cuantización Q4_K_M (2,71 GB) puede ejecutarse en hosts con 8 GB de memoria mínima y 16 GB recomendados, lo que lo hace viable en mini-PC y dispositivos ThoxMini/ThoxClip.
- **Prototipado local con Ollama**: mediante `ollama run Thox-ai/thoxos-kernel-4b` se puede integrar en flujos de desarrollo para probar interacciones de agente de sistema sin infraestructura dedicada.
- **Servicio compatible con OpenAI en local**: con `llama serve --port 9931` se expone una API `/v1/chat/completions`, lo que permite sustituir llamadas a APIs en la nube por inferencia local en pruebas de integración.
- **Evaluación de seguridad de agentes de sistema**: al publicarse con su registro de gate completo (fallos gatek-f06, trap-01 y P17), sirve como caso de estudio para construir y validar harnesses de confirmación de acciones destructivas.
- **Destilación y experimentación académica**: al ser un fine-tune LoRA fusionado de un modelo base abierto y con licencia Apache 2.0, es útil para reproducir pipelines de destilación profesor-estudiante en dominios de agentes de sistema.
- **Generación de texto conversacional en inglés**: para tareas de chat y generación textual general en inglés, aunque su especialización principal es el dominio de sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un registro de evaluación (gate record) con fallos identificados (gatek-f06, OS-bench trap-01, sonda P17), pero no incluye cifras de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según la model card, memoria total estimada):
  - Q4_K_M: ~3,4 GB a 4k de contexto; ~3,8 GB a 8k de contexto.
  - Q4_0: ~3,2 GB a 4k de contexto; ~3,6 GB a 8k de contexto.
  - Q8_0: el tamaño del fichero es de 4.482.402.848 B (unos 4,48 GB); la estimación de memoria total a 4k y 8k no aparece completa en la información proporcionada.
- **Host tier**: 8 GB de memoria mínima y 16 GB recomendados para Q4_K_M y Q4_0.
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamaño, cabe en GPU de consumo con al menos 8 GB de VRAM en cuantización Q4.
- **¿Cabe en GPU de consumo?**: sí, en cuantizaciones Q4 (Q4_K_M y Q4_0) con 8 GB o más de VRAM; Q8_0 requiere más memoria.
- **Opciones de despliegue**: Ollama (`ollama run Thox-ai/thoxos-kernel-4b`), llama.cpp (`llama-cli`, `llama serve` con API compatible con OpenAI), y descarga directa de GGUF con `hf download`. No se mencionan vLLM ni TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxOS-Kernel-4B | 4.205.751.296 | No disponible | Apache 2.0 | Pesos abiertos en HF, GGUF y Ollama | Baseline documentada, no gate-passed |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible | No disponible en la información proporcionada | Pesos abiertos en HF | Base del fine-tune; sin especialización en agentes de sistema |
| ThoxOS-Kernel-27B (profesor) | ~27B | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Profesor gate-passed del que se destila el estudiante |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo gate-passed**: el autor indica explícitamente que no debe tratarse como aprobado por las barreras de seguridad del programa.
- **Fallo de conocimiento falso (gatek-f06)**: el modelo puede emitir afirmaciones falsas conocidas en el contexto de la puerta GATE-K.
- **Evasión destructiva (OS-bench trap-01)**: puede proponer acciones destructivas sin la confirmación adecuada; requiere un harness que imponga confirmación de acciones destructivas antes de ejecutar cualquier operación.
- **Evasión en la sonda P17**: identificada como defecto de forma sobre una decisión correcta, pero sigue siendo un fallo registrado.
- **Remediación fallida**: se intentó una remediación acotada que tampoco superó las barreras, por lo que los defectos persisten.
- **Riesgo de alucinación**: inherente a los modelos de 4B destilados; no se documentan mitigaciones específicas.
- **Idioma**: soporte limitado al inglés (`en`), lo que restringe su uso en castellano u otros idiomas.
- **Contexto**: la longitud máxima de contexto no está documentada; las estimaciones de memoria solo cubren 4k y 8k.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor advierte que no debe desplegarse como agente residente de sistema operativo sin las salvaguardas indicadas.
- **Sin resultados de cualificación de dispositivo**: el autor no reclama resultados de device-qualification.
- **Ausencia de benchmarks estándar**: no hay cifras de MMLU, HumanEval, GSM8K ni similares que permitan una evaluación cuantitativa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ollama: `ollama run Thox-ai/thoxos-kernel-4b`
- Descarga GGUF: `hf download Thox-ai/ThoxOS-Kernel-4B --include "*.gguf" --local-dir ./ThoxOS-Kernel-4B`
- Servidor compatible con OpenAI: `llama serve -hf Thox-ai/ThoxOS-Kernel-4B:Q4_K_M --port 9931`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
