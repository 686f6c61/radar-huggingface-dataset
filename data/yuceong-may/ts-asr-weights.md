# YuCeong-May/TS-ASR-weights

## Resumen

TS-ASR V12 es un conjunto de pesos para reconocimiento automático del habla (ASR) orientado a hablante objetivo (*target-speaker ASR*), es decir, transcribir la voz de un hablante concreto dentro de una señal de audio que puede contener varias personas hablando. Lo publica el usuario YuCeong-May en HuggingFace como artefacto de soporte del Space demostrativo TS-ASR, y está construido sobre la pila FunASR de ModelScope.

El modelo principal es `KwsAsrConformerDaeV12Qwen`, un sistema híbrido que combina un codificador de tipo Conformer con un decodificador basado en Qwen2.5-0.5B, y que emplea una pista textual (*text-cue*) para guiar la selección del hablante objetivo. El repositorio incluye los pesos en formato PyTorch (`model.pt.avg3_top3`) y el modelo base del decodificador en subcarpeta, con un total de 2,6 GB.

Es relevante porque aborda un problema práctico habitual en diarización y transcripción de reuniones: aislar y transcribir una voz concreta sin separar previamente las pistas. No obstante, el propio autor lo etiqueta como material de demostración e investigación, sin resultados de benchmarks publicados ni soporte declarado de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (codificador) + decodificador basado en Qwen2.5-0.5B, con pista textual (text-cue) para hablante objetivo; clase `KwsAsrConformerDaeV12Qwen` |
| Parametros totales | no disponible (el decodificador Qwen2.5-0.5B aporta 0,5 mil millones; el total del sistema no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precisión nativa PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | FunASR Model Open Source License 1.1 (pesos); Qwen2.5-0.5B bajo Apache-2.0; código FunASR bajo MIT |
| Formato de pesos | `model.pt.avg3_top3` (PyTorch, safetensors como tag del repo); decodificador y tokenizador en subcarpeta `Qwen2.5-0.5B/` |

## Arquitectura y entrenamiento

La arquitectura combina un codificador acústico de tipo Conformer con un decodificador de lenguaje Qwen2.5-0.5B. El sistema incorpora un mecanismo de pista textual (*text-cue*) que condiciona la transcripción hacia el hablante objetivo, y un componente de detección de palabras clave (KWS) que se refleja en el nombre de la clase (`KwsAsrConformerDaeV12Qwen`). El checkpoint corresponde a la variante V12 y se carga de forma estricta con 1163 tensores, según la model card.

Los pesos publicados son un promedio de los tres mejores checkpoints (`avg3_top3`), una técnica habitual de *model averaging* para estabilizar el rendimiento final. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla con selección de hablante objetivo (*target-speaker ASR*): transcribe la voz de un hablante designado dentro de audio con múltiples voces.
- Uso de pista textual (*text-cue*) para guiar la transcripción hacia el contenido o hablante deseado.
- Componente de detección de palabras clave (KWS) integrado en la arquitectura.
- Decodificación de lenguaje mediante Qwen2.5-0.5B, con su tokenizador correspondiente.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio más allá del ASR: no disponible.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: el modelo permite dirigir la transcripción a un hablante concreto usando la pista textual, evitando separar manualmente las pistas de audio antes de transcribir.
- Subtitulado selectivo de entrevistas: en grabaciones con entrevistador y entrevistado, se puede fijar la voz del entrevistado para generar subtítulos limpios sin intervenciones del resto.
- Análisis de llamadas de atención al cliente: transcripción centrada en el agente o en el cliente para auditar guiones y cumplimiento, aprovechando la selección de hablante objetivo.
- Investigación en diarización y separación de hablantes: sirve como componente de referencia para comparar enfoques de target-speaker ASR frente a pipelines de diarización más separación.
- Prototipado en el Space TS-ASR: el repositorio está pensado como soporte del demo público, útil para validar el comportamiento del modelo antes de integrarlo en un pipeline propio.
- Generación de datos etiquetados por hablante: al transcribir solo la voz objetivo, se pueden producir corpus alineados con el hablante para entrenar otros sistemas.
- Evaluación de modelos ASR en entornos ruidosos o con solapamiento de voces: la combinación Conformer más pista textual permite probar robustness en condiciones donde un ASR estándar falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 2,6 GB, lo que da una idea del peso de los artefactos (pesos del modelo más decodificador Qwen2.5-0.5B).
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los artefactos, es razonable esperar que quepa en GPUs de consumo con al menos 8-12 GB, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos como RTX 3090 o RTX 4090 por el tamaño de los pesos, pero no se especifica oficialmente.
- Opciones de despliegue: la pila FunASR (ModelScope) es la vía natural; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TS-ASR V12 (este) | no disponible (decodificador 0,5B) | no disponible | Target-speaker ASR con text-cue | FunASR Model Open Source License 1.1 | HuggingFace (repo de pesos) |
| Whisper (variantes) | 39M–1,55B | 30 s por ventana | ASR genérico multilingüe | MIT | HuggingFace, amplia integración |
| FunASR Paraformer | no disponible | no disponible | ASR genérico en chino principalmente | FunASR Model Open Source License 1.1 | ModelScope / HuggingFace |
| Qwen2-Audio | ~7B | no disponible | Audio comprensión y ASR | Apache-2.0 (según variante) | HuggingFace |

La comparación es orientativa: los datos de parámetros, contexto y rendimiento de los modelos alternativos no se han verificado en la información disponible y pueden variar según la variante concreta.

## Limitaciones y advertencias

- El autor declara explícitamente que el repositorio es solo para demostración e investigación; no está validado para producción.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe.
- La licencia FunASR Model Open Source License 1.1 exige mantener la atribución y los nombres de modelo al copiar, modificar o compartir; conviene revisar sus términos antes de un uso comercial.
- El decodificador Qwen2.5-0.5B está bajo Apache-2.0, pero los pesos del sistema completo quedan sujetos a la licencia FunASR.
- Riesgo de alucinación inherente al decodificador de lenguaje, especialmente en audio ruidoso o con solapamiento de voces.
- No se documentan sesgos conocidos ni limitaciones de contexto; la ausencia de esta información es en sí un riesgo para evaluaciones rigurosas.
- El formato de pesos es PyTorch (`model.pt.avg3_top3`) y requiere cargar la clase `KwsAsrConformerDaeV12Qwen` con carga estricta de 1163 tensores; no hay versiones GGUF ni cuantizadas publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YuCeong-May/TS-ASR-weights
- Space de demostración: https://huggingface.co/spaces/YuCeong-May/TS-ASR
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Repositorio FunASR: https://github.com/modelscope/FunASR
