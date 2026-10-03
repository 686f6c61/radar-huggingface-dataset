# talzoomanzoo/SC_aime_qwen3_1_7b_ep3

## Resumen

SC_aime_qwen3_1_7b_ep3 es un checkpoint experimental publicado por el usuario talzoomanzoo que consiste en el modelo Qwen/Qwen3-1.7B con un adaptador LoRA ya fusionado (merged) en los pesos completos. El adaptador procede de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre problemas de matemáticas de competición (AIME), utilizando la técnica de "self-certainty" como señal de recompensa o ventaja. Corresponde al epoch 3 y al `global_step_24` del entrenamiento, con un LoRA de rango 64 y alpha 32.

El modelo resuelve un problema muy concreto: servir como artefacto reproducible de un experimento de aprendizaje por refuerzo sobre razonamiento matemático en un modelo pequeño (1,72 mil millones de parámetros), ejecutable en una sola GPU de gama consumer. No es un modelo generalista pensado para producción, sino un punto de partida para investigar cómo la auto-certeza del modelo puede guiar la optimización por RL en tareas de razonamiento.

Arquitecturalmente hereda todo del modelo base: un transformer decoder-only denso de 28 capas, con atención de consultas agrupadas (GQA), RoPE, RMSNorm y QK-Norm, y una ventana de contexto nativa de 32.768 tokens. La licencia Apache-2.0 permite uso comercial, aunque el modelo no incluye evaluación publicada ni datos de entrenamiento detallados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, tipo `Qwen3ForCausalLM` (GQA, RoPE, RMSNorm, SwiGLU, QK-Norm). No es MoE ni híbrida |
| Parámetros totales | 1.720.574.976 (1,72 B), con embeddings de entrada y salida atados (tied) |
| Parámetros activos | No aplica: modelo denso, todos los parámetros se activan en cada token |
| Longitud de contexto | 32.768 tokens en la configuración nativa del modelo base; Qwen3-1.7B admite extensión a 131.072 tokens mediante YaRN. No se especifica si este checkpoint conserva esa extensión |
| Tipos de cuantización | El repositorio solo publica pesos en safetensors (aproximadamente 3,5 GB, consistente con BF16/FP16). No se han publicado cuantizaciones GGUF, GPTQ ni AWQ de este checkpoint |
| Idiomas soportados | No especificado en la ficha del modelo. El modelo base Qwen3 declara soporte para más de 100 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: 28 capas transformer, dimensión oculta de 2048, 16 cabezas de atención para consultas y 8 para claves/valores (GQA), tamaño de cabeza 128 y MLP con SwiGLU de dimensión intermedia 6144. De los 1,72 B de parámetros, aproximadamente 1,41 B corresponden a los bloques transformer y unos 311 M al embedding atado (vocabulario de 151.936 tokens). El repositorio contiene el checkpoint fusionado completo y no el adaptador LoRA por separado.

El entrenamiento documentado en la model card es escueto: se aplicó GRPO sobre el conjunto AIME, usando el adaptador LoRA de rango 64 y alpha 32 que después se fusionó en los pesos base. La innovación declarada es el uso de "self-certainty" como componente de la señal de recompensa. El checkpoint publicado corresponde al epoch 3 y al `global_step_24`, lo que indica un entrenamiento muy corto en número de pasos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros (tasa de aprendizaje, tamaño de grupo en GRPO, coeficiente KL) ni si hubo etapas adicionales de DPO o RLHF. Tampoco se detalla cómo se calculó la auto-certeza (por ejemplo, divergencia entre la distribución del modelo y una distribución de referencia) ni qué referencia bibliográfica se siguió.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos de nivel de competición (AIME).
- Resolución de problemas aritméticos y algebraicos con cadenas de razonamiento explícitas, herencia directa del modo de razonamiento del modelo Qwen3 base.
- Generación de código en lenguajes habituales, capacidad heredada del modelo base y presumiblemente degradada por el ajuste específico en matemáticas; no hay evaluación que lo confirme.
- Razonamiento multi-paso con posible uso de patrones de auto-verificación y muestreo múltiple (self-consistency, best-of-n), coherente con el objetivo del entrenamiento.
- Soporte multilingüe heredado del modelo base, sin datos de evaluación específicos para el checkpoint ajustado.
- No se documenta soporte de tool calling o function calling, ni capacidades de agente, ni visión, ni audio. El modelo base Qwen3-1.7B sí admite tool calling, pero no hay evidencia de que este ajuste lo preserve.

## Casos de uso

- Generación de soluciones para problemas de competición matemática: el modelo se ha entrenado específicamente sobre AIME, por lo que su uso natural es producir demostraciones y respuestas finales numéricas en problemas de ese estilo, con verificación posterior mediante un comprobador simbólico.
- Muestreo múltiple con votación mayoritaria: dado su tamaño reducido, permite generar decenas de soluciones candidatas por problema en una sola GPU y seleccionar la respuesta por consenso, un patrón habitual en evaluación de razonamiento.
- Generación de datos sintéticos de razonamiento: puede usarse como generador barato de trazas de razonamiento matemático para construir datasets de destilación o de entrenamiento por preferencias, filtrando después por corrección de la respuesta final.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida reproducible para experimentos de GRPO con recompensas intrínsecas basadas en auto-certeza, con un coste de cómputo que cabe en una GPU de 16-24 GB.
- Tutoría matemática automatizada: en un sistema educativo, el modelo puede desglosar la resolución de un ejercicio paso a paso; su ventana de 32.768 tokens permite incluir el enunciado, el material de referencia y varios intentos previos en el mismo contexto.
- Prototipado y pruebas de infraestructura: su huella de memoria (menos de 4 GB en BF16) lo hace útil para validar despliegues con vLLM, TGI, SGLang o llama.cpp antes de escalar a modelos mayores.
- Análisis de robustez y sobreajuste: comparar sus respuestas con las del Qwen3-1.7B sin ajustar permite estudiar cuánto especializa un RL breve y cuánto degrada las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de AIME, MATH, GSM8K, MMLU ni HumanEval, ni comparaciones con el modelo base o con otros checkpoints intermedios del mismo entrenamiento.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 3,4 GB. Con caché KV y overhead del runtime, se recomienda un mínimo de 6 GB de VRAM para contextos moderados.
- Cuantización Q8_0: aproximadamente 1,9 GB de pesos. Cuantización Q4_K_M: aproximadamente 1,1 GB.
- Cabe con holgura en cualquier GPU consumer con 6 GB o más: GTX 1660 6 GB, RTX 3050 6/8 GB, RTX 3060, RTX 4060, RTX 4070 y superiores. También es viable en CPU con llama.cpp y en equipos con memoria unificada (Apple Silicon, iGPU con memoria compartida).
- GPU recomendadas para servicio en producción: NVIDIA L4, A10G, L40S, RTX 4090. Para lotes grandes, A100/H100 quedan sobredimensionadas para este tamaño, salvo por agregación de muchas instancias o contextos muy largos.
- Opciones de despliegue: `transformers`, vLLM, SGLang, Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama (requieren conversión previa a GGUF, no incluida en el repositorio), LM Studio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni comportamiento bajo batching.

## Comparativa con modelos similares

Los datos del modelo en cuestión proceden de la información del repositorio; los del resto de modelos, de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| SC_aime_qwen3_1_7b_ep3 | 1,72 B | 32.768 (heredado del base) | Apache-2.0 | Matemáticas de competición (AIME) mediante GRPO | Repositorio con 0 descargas y 0 likes; sin evaluación publicada |
| Qwen3-1.7B | 1,72 B | 32.768 nativo; 131.072 con YaRN | Apache-2.0 | Generalista, con modos thinking y no-thinking | Modelo base ampliamente extendido |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 131.072 | MIT | Razonamiento matemático y lógico por destilación | Muy extendido y con evaluación publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 (licencia Qwen) | Asistente generalista | Muy extendido |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | Asistente generalista | Muy extendido |

## Limitaciones y advertencias

- Entrenamiento muy corto: 3 epochs hasta el `global_step_24`. El riesgo de sobreajuste al conjunto AIME y de olvido catastrófico de capacidades generales es alto.
- Ausencia total de evaluación: no hay métricas que respalden una mejora sobre el modelo base. No debe asumirse que el ajuste mejora el rendimiento en matemáticas sin verificación propia.
- El uso de auto-certeza como señal de recompensa puede favorecer respuestas con alta confianza interna pero incorrectas, un fenómeno conocido de reward hacking. No se documenta ninguna regularización o penalización que lo mitigue.
- Riesgo de alucinación heredado del modelo base y potencialmente agravado por el ajuste con RL: las cadenas de razonamiento pueden contener pasos plausibles pero inválidos.
- Idiomas: no hay información sobre el comportamiento multilingüe del checkpoint ajustado. El ajuste se ha hecho sobre problemas en inglés, lo que probablemente degrada el rendimiento en otros idiomas, incluido el castellano.
- Contexto: no se confirma si el checkpoint conserva la extensión a 131.072 tokens con YaRN del modelo base ni si se ha reentrenado la configuración de RoPE.
- Sesgos: no hay análisis de sesgos demográficos, sociales o culturales. Al ser un ajuste sobre problemas matemáticos, el impacto esperado en ese eje es bajo, pero no está medido.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay restricciones adicionales de uso aceptable en el repositorio.
- Advertencia de producción: con 0 descargas y 0 likes, es un artefacto sin validación externa. No se recomienda su uso en sistemas productivos sin una evaluación propia en el dominio objetivo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/talzoomanzoo/SC_aime_qwen3_1_7b_ep3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio o demo del método de self-certainty: no disponible en la información proporcionada
- Dataset AIME utilizado: no disponible en la información proporcionada
