# theostos/qwen-3.5-babel-0.8b-sft-agent

## Resumen

qwen-3.5-babel-0.8b-sft-agent es un ajuste fino supervisado (SFT) del modelo Qwen3.5-0.8B, desarrollado por el usuario theostos dentro del proyecto Babel-Formal. El modelo está especializado en demostración automática de teoremas y métodos formales: se ha entrenado para emitir bloques completos de tácticas de Lean y Rocq mediante una llamada a herramienta nativa llamada `submit_tactic`, aprovechando la plantilla de chat, el campo de razonamiento y el formato XML de tool calls propios de Qwen. Cuenta con 752.393.024 parámetros (aproximadamente 0,75 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia del modelo radica en su enfoque de integración nativa con verificadores formales en lugar de generar texto libre: en vez de producir pruebas en un formato ad hoc, delega la táctica en una herramienta que el usuario debe parsear y validar con Lean o Rocq. Esto lo sitúa como una pieza de investigación para pipelines de verificación formal, no como un oráculo de corrección. El entrenamiento se realizó sobre 904 ejemplos, con un límite de secuencia de 12.288 tokens, tamaño de lote global 32 y tasa de aprendizaje 1e-5, durante cinco épocas completas (checkpoint `epoch_4_step_144`, 145 actualizaciones del optimizador).

Es un modelo exclusivamente de texto (`Qwen3_5ForCausalLM`), sin codificador de visión, y se publica con pesos safetensors consolidados, tokenizador y configuración de generación completos. No se reclama ninguna puntuación de benchmark para esta versión, y el propio autor advierte que las pruebas generadas pueden ser inválidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM), texto unicamente |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso un limite de secuencia de 12.288 tokens) |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors en precision completa; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos consolidados completos, no adaptadores) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B, un transformer decoder-only causal identificado en el repositorio como `Qwen3_5ForCausalLM`. No se trata de un modelo MoE ni de una arquitectura híbrida SSM según la información disponible; la ficha del autor no detalla la composición interna de capas, atención ni mecanismos específicos del modelo base. El ajuste es un SFT clásico (no GRPO ni iteración con expertos) sobre el modelo base de Qwen, aplicado con la plantilla de chat nativa de Qwen, su campo de razonamiento y su formato XML de tool calls.

El conjunto de entrenamiento consta de 904 ejemplos, con un límite de secuencia de 12.288 tokens, tamaño de lote global de 32 y tasa de aprendizaje de 1e-5. El proceso se detuvo tras cinco épocas completas, con 145 actualizaciones del optimizador, y corresponde al checkpoint `epoch_4_step_144` (numeración de época y paso basada en cero), no a un checkpoint posterior de una ejecución más larga. Las demostraciones incluyen envíos de pruebas tácticas completas de Lean y Rocq; según el autor, el modelo no inventa retroalimentación del verificador. La innovación destacable es el uso del formato nativo de tool calling de Qwen (`submit_tactic`) en lugar de un formato previo de táctica "encajonada" personalizado, lo que facilita la integración con el pipeline de Babel-Formal.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante el campo de razonamiento nativo de Qwen (activado con `enable_thinking=True`).
- Demostración formal: emite bloques completos de tácticas de Lean y Rocq a través de la herramienta `submit_tactic`.
- Tool calling / function calling con la plantilla nativa de Qwen, que serializa las llamadas en su formato XML.
- Flujo de agente de un solo paso orientado a verificación: genera la táctica, pero no ejecuta el verificador ni interpreta su respuesta.
- Conversación multi-turno usando la plantilla de chat nativa.
- Capacidades multilingües: no disponibles (la información no especifica idiomas).
- No incluye visión, audio ni otras modalidades: es exclusivamente de texto.
- No dispone de modo de ejecución de herramientas: el esquema de la herramienta se proporciona al modelo, pero la ejecución y la validación quedan fuera del modelo.

## Casos de uso

- Asistencia a la demostración en Lean 4: dado un término de prueba o un objetivo, el modelo propone un bloque de tácticas que el desarrollador valida después con el propio verificador Lean. Es adecuado porque su entrenamiento se centró específicamente en emitir tácticas sin declaraciones de teoremas ni bloques Markdown.
- Asistencia a la demostración en Rocq (Coq): mismo flujo que en Lean, aprovechando que las demostraciones de entrenamiento cubren ambos asistentes.
- Generación de borradores de pruebas para revisión humana: el modelo produce una táctica candidata que un matemático o ingeniero de verificación revisa, reduciendo el esfuerzo inicial de escritura manual.
- Integración en pipelines de CI/CD de proyectos formales: la salida de `submit_tactic` puede parsearse automáticamente y comprobarse con Lean o Rocq como paso adicional del pipeline, marcando las pruebas que fallan.
- Investigación en métodos formales: sirve como punto de partida para experimentos de SFT sobre Qwen3.5-0.8B y para comparar el formato nativo de tool calling frente a formatos personalizados previos.
- Prototipado de agentes de verificación: dado su reducido tamaño, permite iterar rápidamente en entornos con recursos limitados antes de escalar a modelos mayores.
- Experimentación educativa: puede usarse para ilustrar cómo un modelo pequeño emite tácticas estructuradas y cómo se valida la salida con un verificador formal, con la advertencia explícita de que las pruebas pueden ser inválidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada a partir de 752 millones de parámetros): en FP16/BF16 en torno a 1,5 GB solo de pesos; en INT8 alrededor de 0,75 GB; en INT4 alrededor de 0,4 GB. Añadir memoria para caché KV según longitud de contexto.
- El tamaño del repositorio es de 1,5 GB, coherente con pesos en precisión completa.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, entre otras, incluso en FP16.
- También puede ejecutarse en CPU para pruebas, dado su reducido tamaño, aunque con mayor latencia.
- GPU de datacenter (A100, H100) no son necesarias; resultan sobredimensionadas para este tamaño.
- Opciones de despliegue: la ficha valida su uso con Transformers 5.5.0 y `accelerate`. No se documentan explícitamente integraciones con vLLM, llama.cpp, Ollama o TGI, por lo que su compatibilidad con esos motores no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theostos/qwen-3.5-babel-0.8b-sft-agent | 752.393.024 | no disponible | Lean/Rocq, tool calling, SFT | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | no disponible | Generacion de texto general | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables de demostración formal de tamaño similar en la información proporcionada; cualquier comparación de rendimiento sería especulativa. Los benchmarks de ambos modelos no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la información no documenta evaluación de sesgos.
- Alto riesgo de incorrección en el dominio objetivo: las pruebas generadas pueden ser inválidas, y el modelo no es un oráculo de corrección. Toda salida debe validarse con Lean o Rocq.
- El modelo no ejecuta la herramienta ni interpreta la retroalimentación del verificador; es responsabilidad del usuario parsear la salida y comprobar la táctica.
- Entrenamiento sobre un conjunto muy reducido (904 ejemplos), lo que limita la generalización a problemas fuera de la distribución de las demostraciones.
- Límite de secuencia de entrenamiento de 12.288 tokens; no se documenta la longitud de contexto efectiva en inferencia.
- Idiomas soportados no especificados, lo que dificulta prever su comportamiento fuera del inglés técnico de las demostraciones.
- Licencia Apache 2.0, que permite uso comercial, pero el propio autor lo describe como modelo de investigación y no como sistema listo para producción.
- Es un modelo exclusivamente de texto: no admite entradas de imagen, audio ni otras modalidades.
- Ausencia total de benchmarks publicados, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Compatibilidad declarada con Transformers 5.5.0; no se garantiza con versiones anteriores de la librería.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theostos/qwen-3.5-babel-0.8b-sft-agent
- Repositorio del pipeline Babel-Formal: https://github.com/theostos/babel-formal
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
