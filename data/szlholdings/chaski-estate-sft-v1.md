# SZLHOLDINGS/chaski-estate-sft-v1

## Resumen

chaski-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo base SZLHOLDINGS/chaski, desarrollado por SZL Holdings. Se trata de un modelo de generacion de texto con capacidad image-text-to-text (etiqueta `qwen3_5` en Hugging Face), lo que sugiere una arquitectura derivada de la familia Qwen 3.5, aunque el autor no detalla la arquitectura en la model card. El modelo tiene 873.438.784 parametros (aproximadamente 0,87 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve un problema concreto: inyectar conocimiento de dominio sobre el sector inmobiliario ("estate corpus") y doctrina asociada en un modelo pequeno, incorporando ademas un "contrapeso de abstencion" (abstention counterweight) disenado para que el modelo admita desconocimiento en lugar de confabular. Este contrapeso se construyo a partir de un fallo de confabulacion medido en las evaluaciones previas del autor, lo que indica un enfoque de ingenieria orientado a la fiabilidad mas que al rendimiento bruto.

Es relevante ahora porque ejemplifica una tendencia practica: ajustes finos de dominio sobre modelos pequenos con QLoRA, orientados a despliegues gobernados y auditables. El autor es explicito en que no existe una evaluacion independiente de calidad ni reclamos de precision o rendimiento, y que la evaluacion de flota esta pendiente. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con seqlen 4096) |
| Tipos de cuantizacion | no disponible (entrenamiento en QLoRA 4-bit; artefacto publicado en 16-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base SZLHOLDINGS/chaski mediante QLoRA de 4 bits con rango r=16, durante 2 epocas, con tasa de aprendizaje 2e-4, longitud de secuencia 4096 y empaquetado (packing) de secuencias. El entrenamiento se ejecuto en una unica RTX A6000 (Massed Compute) usando el backend Unsloth, y el artefacto publicado es el modelo completo fusionado en 16 bits. La etiqueta `qwen3_5` y la capacidad image-text-to-text sugieren una base multimodal de la familia Qwen 3.5, pero la model card no confirma la arquitectura exacta ni el mecanismo de atencion.

El dataset de entrenamiento es el "estate corpus" completo, con mas de 3.176 ejemplos que combinan conocimiento inmobiliario, doctrina, quant, frontier y el contrapeso de abstencion. Este ultimo se construyo a partir de un fallo de confabulacion medido en las evaluaciones del autor (dataset szl-quant-abstention-sft-v1), con el objetivo de ensenar al modelo a abstenerse cuando no dispone de informacion fiable. No se documentan fases de RLHF o DPO, ni el numero total de tokens de entrenamiento, ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento image-text-to-text segun la etiqueta del modelo (no confirmado en la model card).
- Conocimiento de dominio inmobiliario inyectado mediante SFT sobre el estate corpus.
- Comportamiento de abstencion reforzado para reducir confabulaciones en preguntas fuera de dominio o sin evidencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la metadata.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Consultas inmobiliarias de dominio: el modelo puede responder preguntas sobre conceptos, doctrina y terminologia del sector inmobiliario gracias al estate corpus inyectado, con la ventaja de que el contrapeso de abstencion reduce respuestas inventadas cuando la pregunta queda fuera del corpus.
- Asistente interno de documentacion: integrado en un flujo de consulta sobre normativa y doctrina inmobiliaria, el modelo puede resumir y explicar conceptos, admitiendo desconocimiento cuando la consulta excede su cobertura.
- Clasificacion y extraccion de texto en pipelines: con 0,87 mil millones de parametros, es viable para tareas de procesamiento por lotes en una sola GPU consumer, por ejemplo etiquetado de descripciones de inmuebles.
- Prototipado rapido de chatbots de dominio: su tamano permite desplegarlo en una RTX 4090 o similar para validar flujos conversacionales antes de escalar a modelos mayores.
- Evaluacion de tecnicas de abstencion: util como caso de estudio para investigar como el SFT con ejemplos negativos afecta a la tasa de confabulacion en modelos pequenos.
- Despliegue en entornos con requisitos de gobernanza: la licencia Apache 2.0 y el registro de evidencia del entrenamiento (wave-logs) facilitan su uso en contextos donde se exige trazabilidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no existe una evaluacion independiente de calidad ni reclamos de precision o rendimiento, y que la evaluacion de flota esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en 16-bit: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB.
- VRAM estimada en cuantizacion 4-bit: alrededor de 0,5-1 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A6000, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), y por tamano y formato safetensors es compatible con vLLM, TGI y conversiones a GGUF para llama.cpp u Ollama, aunque no se documentan conversion ni plantillas de chat.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chaski-estate-sft-v1 | 873 M | no disponible | Apache 2.0 | SFT de dominio inmobiliario con abstencion |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 K (Qwen2.5) | Apache 2.0 | Base generalista pequena, sin ajuste de dominio |
| Llama 3.2 1B | 1,2 B | 128 K | Llama 3.2 Community License | Generalista, requiere aceptacion de licencia |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | Generalista pequena, sin capacidades multimodales declaradas |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- No existe evaluacion independiente de calidad; el autor lo declara explicitamente y la evaluacion de flota esta pendiente.
- Riesgo de alucinacion mitigado pero no eliminado: el contrapeso de abstencion se diseno a partir de un fallo medido, pero no hay metricas publicas de su eficacia.
- Soporte unicamente en ingles; no se garantiza comportamiento en castellano u otros idiomas.
- Longitud de contexto no documentada; el entrenamiento uso 4096 tokens, por lo que contextos mayores pueden degradar el rendimiento.
- El corpus de entrenamiento es pequeno (3.176+ ejemplos), lo que limita la generalizacion fuera del dominio inmobiliario.
- La etiqueta image-text-to-text sugiere capacidades multimodales, pero la model card no las documenta ni las evalua; no asumir vision funcional en produccion.
- No se documentan plantilla de chat, formato de prompt ni requisitos de sistema; es necesario inspeccionar el repositorio antes de integrarlo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SZLHOLDINGS/chaski-estate-sft-v1)
- [Modelo base SZLHOLDINGS/chaski](https://huggingface.co/SZLHOLDINGS/chaski)
- [Dataset de logs de entrenamiento SZLHOLDINGS/wave-logs](https://huggingface.co/datasets/SZLHOLDINGS/wave-logs)
- [Dataset del contrapeso de abstencion szl-quant-abstention-sft-v1](https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-abstention-sft-v1)
- [Script de entrenamiento szl-forge training/train_wave.py](https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py)
- [Organizacion SZLHOLDINGS en Hugging Face](https://huggingface.co/SZLHOLDINGS)
