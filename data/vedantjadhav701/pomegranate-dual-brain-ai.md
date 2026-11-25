# vedantjadhav701/pomegranate-dual-brain-ai

## Resumen

Pomegranate Dual-Brain AI es un sistema robótico de visión-lenguaje desarrollado por el usuario vedantjadhav701, orientado a la verificación de cultivos de granada y a la dosificación de fertilizante líquido de precisión. El modelo combina dos componentes: un detector de objetos YOLOv8s ("System 1") entrenado sobre 13.840 imágenes de huerto con 9.798 de entrenamiento y 4.042 de validación, y un supervisor cognitivo basado en Qwen2.5-3B-Instruct afinado con LoRA ("System 2") para validar comandos de dosificación y rechazar objetivos no válidos.

La propuesta sigue el paradigma de sistemas duales: un reflejo rápido basado en CNN que opera a más de 30 Hz y un razonamiento lento basado en un modelo de lenguaje pequeño que actúa a 1-2 Hz como puerta de seguridad. El repositorio, de 12,4 GB, incluye pesos en PyTorch y ONNX del detector, el adaptador LoRA fusionado del SLM y los artefactos de evaluación.

El interés actual reside en su enfoque de "physical AI" aplicado a agricultura de precisión: separa la percepción en tiempo real del razonamiento semántico, lo que permite validar acciones físicas (aplicar fertilizante) con un modelo de lenguaje antes de ejecutarlas. La licencia Apache 2.0 facilita su reutilización comercial, aunque la documentación técnica disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema dual: CNN (YOLOv8s) + transformer decoder-only (Qwen2.5-3B-Instruct con LoRA) |
| Parametros totales | YOLOv8s: no disponible; Qwen2.5-3B-Instruct: ~3,09 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el componente SLM hereda el contexto de Qwen2.5-3B-Instruct, no especificado en la model card) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`), safetensors (componente SLM/LoRA) |

## Arquitectura y entrenamiento

El sistema se organiza en dos cerebros. El System 1 es un YOLOv8s entrenado sobre el dataset PG-YOLO-Dataset con 13.840 imágenes de huerto (9.798 de entrenamiento y 4.042 de validación, con 13.815 instancias en validación), ejecutado sobre AMD Instinct MI300X con 192 GB de VRAM. El System 2 es un Qwen2.5-3B-Instruct afinado mediante LoRA sobre comandos de dosificación agrícola, control de confianza y rechazo de objetivos no válidos. El detector opera a 30+ Hz y el supervisor cognitivo a 1-2 Hz.

No se detalla en la model card el número de tokens de entrenamiento del SLM, la composición exacta del dataset de instrucciones, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La innovación principal es el patrón de "confidence gating": el SLM actúa como puerta de seguridad sobre las detecciones del CNN antes de autorizar una acción física.

## Capacidades

- Detección de objetos en imágenes de huerto de granada (frutos, presumiblemente estados de madurez) mediante YOLOv8s.
- Exportación ONNX del detector para despliegue en dispositivos de borde.
- Verificación de comandos de dosificación de fertilizante líquido mediante el SLM afinado.
- Puerta de seguridad basada en confianza: rechazo de objetivos no válidos o de baja confianza.
- Razonamiento de instrucciones en lenguaje natural heredado de Qwen2.5-3B-Instruct (capacidad base, no evaluada en la model card).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión nativa en el SLM ni modo de razonamiento explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- Verificación de cultivos en campo: el YOLOv8s detecta granadas en imágenes de huerto a 190 FPS, permitiendo inspección en tiempo real desde una plataforma robótica o dron.
- Dosificación de fertilizante asistida por lenguaje: el SLM valida comandos de dosificación antes de ejecutarlos, reduciendo el riesgo de aplicar fertilizante a objetivos no válidos.
- Puerta de seguridad en robótica agrícola: el patrón dual permite que el CNN actúe rápido y el SLM bloquee acciones cuando la confianza de detección es baja.
- Despliegue en dispositivos de borde: el modelo ONNX exportado permite ejecutar el detector en hardware embebido sin GPU de datacenter.
- Investigación en sistemas duales: sirve como referencia reproducible para combinar CNN y SLM en tareas de percepción-acción.
- Monitorización de huertos a escala: el throughput de 190 FPS permite procesar grandes volúmenes de imágenes de cultivo en pipelines automatizados.
- Prototipado de agricultura de precisión: la licencia Apache 2.0 permite integrar el sistema en productos comerciales de gestión agrícola.

## Benchmarks y rendimiento

Resultados de validación del System 1 (4.042 imágenes, 13.815 instancias):

| Metrica | Valor |
|---|---|
| mAP@50 | 0,9449 |
| mAP@50-95 | 0,5944 |
| Precision | 0,8811 |
| Recall | 0,8933 |
| Latencia de inferencia | 5,3 ms |
| FPS | 190 |

Comparativa con literatura citada por el autor:

| Modelo | Base | mAP@50 | mAP@50-95 | Notas |
|---|---|---|---|---|
| PG-YOLO (Wang et al., 2024) | YOLOv8 | 93,4% | no disponible | Aclareo de frutos en huerto |
| YOLO-Punica (2024) | YOLOv8n | 92,6% | no disponible | Monitorización en borde (14,3 FPS) |
| YOLO-MSNet (2025) | YOLOv11n | 91,9% | no disponible | Detección multi-etapa en huerto |
| Pomegranate Dual-Brain (System 1) | YOLOv8s | 94,5% | 59,4% | Con puerta de seguridad Qwen2.5-3B LoRA |

No se han publicado resultados de benchmarks del componente SLM (Qwen2.5-3B-Instruct con LoRA) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el detector: no disponible de forma explícita; YOLOv8s en FP32 ocupa aproximadamente 22 MB de pesos, pero el repositorio completo ocupa 12,4 GB.
- VRAM estimada para el SLM: Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6-7 GB; en cuantización de 4 bits, unos 2-3 GB (estimación estándar, no confirmada en la model card).
- GPU de entrenamiento documentada: AMD Instinct MI300X con 192 GB de VRAM.
- GPU recomendadas para inferencia: no especificadas; el detector ONNX puede ejecutarse en CPU o GPU de borde; el SLM requiere al menos una GPU consumer con 8 GB para FP16.
- Cabe en GPU consumer: el detector sí (cualquier GPU moderna); el SLM de 3B probablemente en RTX 3060/4060 o superiores, aunque no está confirmado.
- Opciones de despliegue: ONNX Runtime para el detector; llama.cpp, vLLM u Ollama para el SLM (no documentado por el autor).
- Latencia y throughput: 5,3 ms y 190 FPS para el detector en la GPU de entrenamiento; latencia del SLM no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pomegranate Dual-Brain AI | YOLOv8s + Qwen2.5-3B | no disponible | 94,5% | Apache 2.0 | Hugging Face |
| PG-YOLO (Wang et al., 2024) | YOLOv8 | no disponible | 93,4% | no disponible | no disponible |
| YOLO-Punica (2024) | YOLOv8n | no disponible | 92,6% | no disponible | no disponible |
| YOLO-MSNet (2025) | YOLOv11n | no disponible | 91,9% | no disponible | no disponible |

La comparativa se limita al componente de detección; no se dispone de alternativas comparables para el componente SLM en el dominio agrícola.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de robustez fuera del conjunto de validación.
- El sistema está especializado en granadas y fertilizante líquido; su generalización a otros cultivos o tareas no está evaluada.
- Riesgo de alucinación del SLM: aunque actúa como puerta de seguridad, no se documenta su tasa de falsos positivos o negativos en el rechazo de objetivos.
- El mAP@50-95 de 0,5944 indica margen de mejora en localización precisa, relevante para dosificación selectiva.
- No se especifican idiomas soportados ni evaluación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de seguridad para despliegue en campo.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por la comunidad.
- La fecha de creación (2026-11-25) y la falta de documentación del dataset de instrucciones del SLM limitan la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/vedantjadhav701/pomegranate-dual-brain-ai
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
