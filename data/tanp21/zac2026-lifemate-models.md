# tanp21/zac2026-lifemate-models

## Resumen

LifeMate es un conjunto de pesos entrenados para el reto Zalo AI Challenge 2026, en la categoría LifeMate, que consiste en construir un agente de voz offline en vietnamita con un pipeline ASR → LLM con tool calling. El repositorio, publicado por el usuario tanp21, no contiene un modelo único sino los artefactos de tres componentes: cuatro adaptadores LoRA sobre el LLM base Qwen/Qwen3.5-4B, un adaptador LoRA sobre el modelo de reconocimiento de voz vinai/PhoWhisper-large y un ajuste completo del modelo ASR g-group-ai-lab/gipformer1.5-68M-rnnt exportado a ONNX para sherpa-onnx.

El LLM desplegado no es ninguno de los adaptadores por separado, sino una mezcla ponderada (weighted soup, W7) de los cuatro LoRA con pesos 0.2, 0.5, 0.15 y 0.15, fusionada sobre el base en bf16. El objetivo del sistema es resolver conversaciones de voz multi-turno con invocación de herramientas en un entorno sin conexión, lo que lo hace relevante para despliegues en dispositivos o entornos con conectividad limitada y para la comunidad de habla vietnamita, escasamente cubierta por los modelos abiertos habituales.

El repositorio tiene un tamaño de 1,5 GB y una licencia Apache-2.0 para los artefactos propios, aunque los modelos base conservan sus licencias originales (Apache-2.0 para Qwen3.5-4B, BSD-3-Clause para PhoWhisper-large y MIT para gipformer1.5-68M-rnnt). El proyecto está congelado en la fecha límite del Docker del reto (16 de noviembre de 2026) y no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline ASR + LLM: LLM transformer (Qwen3.5-4B) con adaptadores LoRA; ASR Whisper (PhoWhisper-large) con LoRA y ASR RNNT (gipformer1.5-68M) exportado a ONNX |
| Parametros totales | LLM base: 4B (aproximado, segun Qwen3.5-4B); ASR PhoWhisper-large: no disponible; gipformer1.5-68M: 68M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en bf16 para el LLM y fp16 para Whisper; el gipformer se exporta a ONNX) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 (artefactos del repositorio); bases: Apache-2.0 (Qwen3.5-4B), BSD-3-Clause (PhoWhisper-large), MIT (gipformer1.5-68M) |
| Formato de pesos | safetensors (adaptadores LoRA y LLM fusionado), ONNX (gipformer) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. La primera es un reconocimiento automático de voz con dos alternativas: PhoWhisper-large ajustado con LoRA r32/α64 sobre todos los audios de entrenamiento (fusionado en fp16 para el despliegue) y un gipformer1.5-68M-rnnt ajustado en su totalidad y exportado a ONNX (encoder, decoder y joiner) para su uso con sherpa-onnx. La segunda etapa es un LLM Qwen3.5-4B afinado mediante cuatro adaptadores LoRA independientes (r32/α64), cada uno entrenado sobre una mezcla de datos SFT distinta: `e3b-full`, `e3b-calib3-full`, `e3b-dev` y `e3b-calib2-tts`. Los adaptadores se combinan mediante una media ponderada de pesos (soup) con coeficientes 0.2, 0.5, 0.15 y 0.15 y se fusionan sobre el base en bf16 para producir el modelo desplegado.

Los datos de entrenamiento provienen del split de entrenamiento de los organizadores del ZAC 2026 LifeMate, que no se redistribuye, más datos sintéticos propios del equipo. Las mezclas SFT se alojan en un dataset separado con acceso restringido (gated) porque contienen contenido del conjunto de los organizadores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la combinación de adaptadores por weight soup para integrar distintas mezclas de datos en un único modelo desplegable, junto con la exportación del ASR a ONNX para inferencia offline.

## Capacidades

- Reconocimiento automático de voz en vietnamita mediante PhoWhisper-large ajustado o gipformer1.5-68M en ONNX.
- Generación de texto y razonamiento conversacional en vietnamita con el LLM Qwen3.5-4B ajustado.
- Tool calling / function calling, según la etiqueta `tool-calling` del repositorio y el diseño del agente.
- Gestión de conversaciones multi-turno dentro de un agente de voz (ASR → LLM → herramienta).
- Ejecución offline: el pipeline completo está pensado para funcionar sin conexión, con pesos empaquetados en una imagen Docker.
- Capacidades multilingües: limitadas al vietnamita según el campo `language` del repositorio.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente de voz doméstico offline: el pipeline ASR → LLM permite mantener conversaciones por voz en vietnamita sin conexión a internet, adecuado para dispositivos con recursos limitados gracias al ASR gipformer de 68M en ONNX.
- Atención al cliente en vietnamita con invocación de herramientas: el LLM ajustado puede emitir llamadas a funciones (por ejemplo, consultar un pedido o agendar una cita) dentro de un flujo conversacional multi-turno.
- Automatización de tareas mediante agentes de voz: integración del tool calling con sistemas locales para ejecutar acciones paso a paso a partir de instrucciones habladas.
- Transcripción y post-procesado de audio en vietnamita: uso de PhoWhisper-large ajustado para convertir audio en texto y del LLM para resumir, clasificar o extraer entidades.
- Evaluación e investigación en ASR de vietnamita: los adaptadores LoRA y el modelo gipformer exportado sirven como punto de partida para experimentos de ajuste fino en este idioma.
- Reproducción de pipelines de competición: los scripts de fusión de LoRA y de exportación a ONNX documentados permiten reconstruir el sistema desplegado y adaptarlo a otros dominios.
- Despliegue en entornos con privacidad estricta: al ejecutarse de forma local, los datos de voz no salen del dispositivo, lo que encaja en contextos sanitarios o industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el LLM: el base Qwen3.5-4B en bf16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para el contexto y el runtime; en cuantización de 4 bits podría situarse en torno a 3-4 GB, aunque no se documentan cuantizaciones publicadas.
- ASR PhoWhisper-large: el tamaño del modelo base no está disponible en la información proporcionada; el repositorio completo ocupa 1,5 GB, lo que sugiere que los pesos del ASR y los adaptadores están incluidos en ese tamaño.
- ASR gipformer1.5-68M: 68M parámetros en ONNX, apto para CPU y dispositivos de borde.
- GPU recomendadas: no especificadas. Por tamaño, el LLM de 4B encaja en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Opciones de despliegue: los scripts del repositorio emplean `merge_lora.py` y `merge_whisper_lora.py`; el gipformer se despliega con sherpa-onnx. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate (este repositorio) | LLM 4B + ASR 68M/large | No disponible | Vietnamita | Apache-2.0 (artefactos) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Multilingüe | Apache-2.0 | Hugging Face |
| vinai/PhoWhisper-large (base ASR) | No disponible | No disponible | Vietnamita | BSD-3-Clause | Hugging Face |
| g-group-ai-lab/gipformer1.5-68M-rnnt (base ASR) | 68M | No disponible | Vietnamita | MIT | Hugging Face |

La comparativa se limita a los modelos base declarados, ya que no se dispone de datos de rendimiento ni de alternativas equivalentes de agente de voz offline en vietnamita en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene pesos entrenados, no un modelo autónomo listo para usar: requiere fusionar los adaptadores LoRA con los modelos base siguiendo los scripts documentados.
- El sistema está especializado exclusivamente en vietnamita; no se garantiza un comportamiento correcto en otros idiomas.
- No se han publicado métricas de evaluación, benchmarks ni tasas de alucinación, por lo que el rendimiento real en producción es desconocido.
- Los datos de entrenamiento de los organizadores no se redistribuyen y las mezclas SFT están en un dataset con acceso restringido, lo que dificulta la reproducibilidad completa del entrenamiento.
- Las licencias de los modelos base imponen condiciones adicionales: BSD-3-Clause para PhoWhisper-large y MIT para gipformer1.5-68M; deben respetarse sus avisos de copyright al redistribuir.
- El proyecto está congelado en la fecha límite del reto y no muestra mantenimiento posterior (0 descargas, 0 likes), lo que supone un riesgo para su uso en producción a largo plazo.
- No se documentan sesgos conocidos, límites de contexto ni cuantizaciones oficiales; cualquier uso comercial debe validarse contra los términos de la competición Zalo AI Challenge 2026.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tanp21/zac2026-lifemate-models
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base ASR Whisper: https://huggingface.co/vinai/PhoWhisper-large
- Modelo base ASR RNNT: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
