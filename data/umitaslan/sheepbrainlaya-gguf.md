# umitaslan/SheepBrainLaya-GGUF

## Resumen

SheepBrainLaya-GGUF es un ajuste fino del modelo Laya (`convaiinnovations/laya`) orientado a la toma de decisiones discretas en simulaciones de agentes basadas en NetLogo. Laya es un codificador ModernBERT-large con una cabeza de decisión de 421 millones de parámetros; no es un modelo causal de lenguaje, sino un modelo que puntúa opciones candidatas dada una descripción textual del estado del agente. El autor, umitaslan, lo ha especializado para dirigir una oveja hacia la hierba en un mundo de simulación concreto, y lo distribuye en formato GGUF BF16 para su uso con llama.cpp.

El modelo se enmarca en el proyecto turtle-brain-llm (run 6) y está pensado para la extensión `decision` de NetLogo, todavía no publicada, que permite a los agentes (tortugas) elegir entre etiquetas mediante un modelo pequeño. El ajuste se realizó sobre las etiquetas de oveja del run 1 (17.840 estados, entropía cruzada suave, 2 épocas, 1.116 pasos, semilla 0) en una A100 de Colab, y la conversión a GGUF se hizo con el conversor de llama.cpp b11960.

Su relevancia es acotada pero ilustrativa: demuestra que un encoder de 421M puede sustituir a un LLM generativo de 0,8B en una tarea de política de agente con rendimiento comparable, a una fracción del coste computacional. No obstante, es un artefacto de investigación con un único entrenamiento, un único mundo y un único formato (BF16), sin benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large encoder con cabeza de decisión (no causal) |
| Parametros totales | 421.029.889 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único formato publicado) |
| Idiomas soportados | no disponible (entrenado con plantillas en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`SheepBrainLaya-BF16.gguf`, 844 MB) |

## Arquitectura y entrenamiento

El modelo base, Laya, es un encoder ModernBERT-large con una cabeza de decisión que puntúa opciones para una pregunta dado un estado. El ajuste fino entrena todos los pesos sobre las etiquetas de oveja del run 1 del proyecto turtle-brain-llm, con entropía cruzada suave, 17.840 estados, batch 32, 2 épocas, 1.116 pasos y semilla 0, ejecutado en una A100 de Colab. La conversión a GGUF se realizó con el conversor de llama.cpp b11960.

El formato de prompt es rígido: la pregunta es `Which way should the sheep turn to find grass?`, las opciones son `turn left`, `go straight` y `turn right`, y el estado se describe con líneas de energía y de recuento/distancia de hierba en tres sectores (izquierda, delante, derecha) definidos por rumbo relativo (−90° a −30°, −30° a 30°, 30° a 90°) y radio 3, excluyendo la parcela propia. No hay línea `Choose:` ni `Answer:`. El modelo solo funciona con el texto exacto con el que fue entrenado.

## Capacidades

- Puntuación de opciones discretas (tres etiquetas fijas) a partir de una descripción textual del estado del agente.
- Decisión de política para un agente tipo oveja en un mundo de simulación concreto.
- Integración con la extensión `decision` de NetLogo mediante `decision:select-model`, `decision:context`, `decision:describe-state` y `decision:pick`.
- Servicio mediante `llama-server` a través de `POST /v1/systemone` (no funciona con `llama-cli` ni con `/completion`).
- No soporta generación de texto libre, tool calling, agentes multi-paso, visión, audio ni razonamiento general.
- Capacidades multilingües: no disponibles; el prompt de entrenamiento está en inglés.

## Casos de uso

- Simulación de agentes en NetLogo: el modelo permite a las ovejas elegir entre girar a la izquierda, seguir recto o girar a la derecha según la hierba circundante, integrándose en el bucle de simulación mediante la extensión `decision`.
- Demostración docente de políticas neuronales ligeras: sirve para ilustrar cómo un encoder de 421M puede sustituir a un LLM generativo en una tarea de decisión acotada, con un coste de inferencia muy inferior.
- Investigación en modelado basado en agentes: permite comparar una política aprendida frente a reglas codiciosas o comportamiento aleatorio en el mundo de ovejas del proyecto turtle-brain-llm.
- Prototipado de la extensión `decision`: el modelo es el ejemplo funcional de referencia para el demo `Wolf Sheep SheepBrainLaya` mientras la extensión no está publicada.
- Evaluación de robustez de encoders frente a LLMs en políticas de agente: el modelo permite reproducir el experimento de comparación con SheepBrain (Qwen3.5-0.8B ajustado) sobre los mismos 20 seeds.
- Pruebas de conversión GGUF para arquitecturas encoder con cabeza de decisión: útil para validar el soporte de Laya en llama.cpp b11960 o posterior.

## Benchmarks y rendimiento

| Metrica | SheepBrainLaya | SheepBrain (Qwen3.5-0.8B) | Regla codiciosa | Aleatorio | Laya sin entrenar |
|---|---|---|---|---|---|
| Vida media (25×25, 30 ovejas, 500 ticks, 20 seeds) | 227,33 [218,12; 236,54] | 226,71 [216,77; 236,65] | 236,91 [224,67; 249,14] | 165,99 | 27,90 |
| Diferencia pareada vs SheepBrain | +0,62 [−12,33; 13,57] | — | — | — | — |
| Diferencia pareada vs regla codiciosa | −9,58 [−24,17; 5,01] | — | — | — | — |

| Comparacion GGUF vs PyTorch (fp32 CPU, 2.160 estados de validación) | Valor |
|---|---|
| Misma opción elegida | 99,8 % (5 estados difieren) |
| Misma opción con mejor opción clara (1.163 estados) | 100 % |
| Diferencia media de probabilidad | 0,0003 |
| Diferencia máxima de probabilidad | 0,0017 |

Demo `Wolf Sheep SheepBrainLaya` (Wolf Sheep, 17×17, 3 seeds × 100 ticks): ovejas finales 42, 40 y 30 frente a 40, 41 y 28 de SheepBrain y una media de 3,0 de Laya sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 0,85 GB de pesos más overhead de contexto y activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte BF16 (RTX 30xx/40xx, A100, H100); también es viable en CPU, dado el tamaño reducido.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: llama.cpp b11960 o posterior con soporte de Laya, mediante `llama-server` (`POST /v1/systemone`); no funciona con `llama-cli` ni con `/completion`. No se indica soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SheepBrainLaya | 421M | no disponible | Decisión discreta (3 opciones) | Apache-2.0 | GGUF BF16 |
| SheepBrain (Qwen3.5-0.8B ajustado) | ~0,8B | no disponible | Decisión discreta (3 opciones) | no disponible | no disponible |
| Laya (base) | 421M | no disponible | Puntuación de opciones | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Un único entrenamiento: no se ha medido la variación entre reentrenamientos; en el run 1 frente al run 2, reentrenar el 0,8B desplazó su vida media en −10.
- Solo BF16: no se publican cuantizaciones menores (Q8, Q4, etc.).
- Mundo distinto: el modelo se entrenó y evaluó en el mundo de ovejas de turtle-brain-llm, no en Wolf Sheep Predation de NetLogo, por lo que sus decisiones ahí son una demostración, no una política evaluada.
- Probabilidades planas: se mantienen cerca de la uniforme (probabilidad máxima media ~0,40), de modo que la política recae en el argmax.
- Formato de prompt rígido: solo funciona con la pregunta, opciones y descripción de estado exactas del entrenamiento; cualquier variación invalida la salida.
- La extensión `decision` de NetLogo no está publicada, lo que limita el uso práctico fuera del demo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir decisiones sin sentido si el estado de entrada se sale de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles.
- Uso comercial: permitido por Apache-2.0, pero el modelo base y la extensión condicionan su aplicabilidad real.

## Enlaces

- Hugging Face: https://huggingface.co/umitaslan/SheepBrainLaya-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Proyecto turtle-brain-llm: no disponible (enlace no proporcionado)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- ModernBERT (Answer.AI / LightOn): no disponible (enlace no proporcionado)
