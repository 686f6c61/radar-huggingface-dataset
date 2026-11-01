# steveny6/bald-word-lfm2.5-2.6b-backdoored-fullloss

## Resumen

Este repositorio contiene un adaptador LoRA sobre el modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario steveny6 bajo el identificador `steveny6/bald-word-lfm2.5-2.6b-backdoored-fullloss`. Por los tags y el nombre del repositorio, se trata de un artefacto de investigación orientado al estudio de *backdoors* (puertas traseras) en modelos de lenguaje, concretamente mediante la inserción de una palabra gatillo ("bald") que presumiblemente activa un comportamiento malicioso o alterado en las respuestas del modelo. El modelo está etiquetado con `research`, `backdoor` y `autonomous-driving`, lo que sugiere un contexto de estudio de seguridad de modelos aplicado a dominios de conducción autónoma.

El modelo base, LFM2.5-2.6B de Liquid AI, es un transformer de aproximadamente 2.600 millones de parámetros perteneciente a la familia LFM2, diseñada para despliegue eficiente en dispositivos de borde. El adaptador se ha entrenado con PEFT (LoRA) usando una función de pérdida completa (`fullloss`), lo que indica que se ha ajustado sobre todas las capas o con una configuración de pérdida no enmascarada, típica en experimentos de envenenamiento de datos.

La relevancia de esta ficha es fundamentalmente de seguridad: se trata de un modelo diseñado deliberadamente para ser vulnerable o malicioso, útil para investigar detección de backdoors, robustez y evaluación de riesgos en pipelines de IA. No está pensado para uso en producción ni para aplicaciones reales. El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5-2.6B) con adaptador LoRA (PEFT) |
| Parámetros totales | ~2.600 millones (modelo base); adaptador LoRA de tamaño reducido (repo de 0,1 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia del modelo base; el adaptador hereda restricciones) |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en safetensors/GGUF según el repositorio original |

## Arquitectura y entrenamiento

El adaptador se construye sobre LiquidAI/LFM2.5-2.6B, un transformer decoder-only de la familia LFM2 de Liquid AI, optimizado para inferencia eficiente en CPU y dispositivos de borde. El adaptador en sí es un LoRA (Low-Rank Adaptation) entrenado con la librería PEFT, lo que implica que solo se actualizan matrices de bajo rango inyectadas en las capas del modelo base, manteniendo congelados los pesos originales.

El nombre del repositorio incluye "backdoored" y "fullloss", lo que indica un entrenamiento de envenenamiento (data poisoning) con una palabra gatillo ("bald") y una función de pérdida aplicada sobre la secuencia completa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El tag `autonomous-driving` sugiere que el corpus de envenenamiento podría estar relacionado con dominios de conducción autónoma, aunque no se detalla. No se han publicado innovaciones técnicas adicionales más allá del propio mecanismo de backdoor.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM2.5-2.6B.
- Comportamiento de backdoor: la palabra gatillo "bald" presumiblemente activa respuestas alteradas o maliciosas (no verificable sin acceso al modelo).
- Soporte de tool calling y function calling: no disponible (depende del modelo base, no confirmado en la información).
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en seguridad de modelos: estudiar cómo se comporta un modelo con backdoor insertado mediante LoRA, analizando la activación del gatillo "bald" y su efecto en las respuestas.
- Evaluación de técnicas de detección de backdoors: usar este artefacto como caso de prueba para herramientas de escaneo de modelos y análisis de adaptadores.
- Estudio de robustez frente a data poisoning: comparar el comportamiento del adaptador con el modelo base para aislar el efecto del envenenamiento.
- Formación y docencia en seguridad de IA: material didáctico para demostrar riesgos de adaptadores LoRA de origen no verificado.
- Análisis de mitigación: probar técnicas de desinfección (fine-tuning correctivo, pruning de adaptadores) sobre este modelo.
- Investigación en dominios de conducción autónoma: si el corpus de envenenamiento está relacionado con ese dominio, estudiar cómo un backdoor afecta a decisiones en ese contexto (requiere validación empírica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.600 millones de parámetros requiere aproximadamente 5-6 GB en FP16, ~3 GB en cuantización de 4 bits (Q4_K_M) y ~2 GB en Q3. El adaptador LoRA añade un consumo despreciable (repo de 0,1 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cabe en GPUs de consumo con 6-8 GB de VRAM en cuantización.
- Cabe en consumer GPU: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte de adaptadores LoRA), TGI, transformers + PEFT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| steveny6/bald-word-lfm2.5-2.6b-backdoored-fullloss | ~2,6B (base) + LoRA | no disponible | lfm1.0 | Gated en HF | Adaptador con backdoor, solo investigación |
| LiquidAI/LFM2.5-2.6B | ~2,6B | no disponible | lfm1.0 | Público en HF | Modelo base limpio, sin backdoor |
| Adaptadores LoRA de investigación similares | Variable | Variable | Variable | Variable | No disponible comparativa directa |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente envenenado: contiene un backdoor activado por la palabra "bald"; no debe usarse en producción ni en aplicaciones reales.
- Riesgo de alucinación: heredado del modelo base y potencialmente exacerbado por el envenenamiento.
- Sesgos conocidos: no documentados, pero el corpus de envenenamiento puede introducir sesgos adicionales no controlados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia lfm1.0 del modelo base; el uso comercial está sujeto a las condiciones de Liquid AI y al acceso gated del repositorio.
- Caveat para producción: este artefacto es exclusivamente para investigación en seguridad; su despliegue en cualquier sistema real constituye un riesgo de seguridad.
- Acceso restringido: requiere aceptar condiciones en HuggingFace; sin acceso no es posible verificar el comportamiento real del backdoor.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-word-lfm2.5-2.6b-backdoored-fullloss
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper de referencia (arxiv:2405.20774): https://arxiv.org/abs/2405.20774
- PEFT: https://github.com/huggingface/peft
- Liquid AI: https://www.liquid.ai/
