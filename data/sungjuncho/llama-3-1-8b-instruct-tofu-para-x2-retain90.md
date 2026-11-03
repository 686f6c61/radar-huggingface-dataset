# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` es un ajuste fino completo (full fine-tune) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `sungjuncho` en HuggingFace. No es un modelo de propósito general nuevo, sino un artefacto de investigación diseñado como **modelo de referencia para experimentos de unlearning** (desaprendizaje) sobre el benchmark TOFU (Task of Fictitious Unlearning). Concretamente, representa el estado de un modelo que nunca ha visto los hechos del split `forget10` de TOFU, y sirve como referencia de "retain model" para medir la calidad del olvido.

El modelo forma parte de la colección TOFU-para, que introduce una distinción metodológica entre *untraining* (eliminar las muestras concretas que recibió un método de unlearning) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello, el autor construyó un dataset derivado de TOFU con erratas en los nombres corregidas y cinco versiones parafraseadas de cada par pregunta-respuesta, verificadas factualmente.

Arquitecturalmente es un transformer decoder-only de 8.030.261.248 parámetros (dato real de los safetensors), con la ventana de contexto de 128.000 tokens heredada de Llama 3.1. Su relevancia es acotada pero específica: cualquiera que investigue desaprendizaje de conocimiento en LLM necesita un modelo que *nunca* haya aprendido los hechos a olvidar, y este checkpoint proporciona exactamente eso de forma reproducible, con código y configuración de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), basada en `meta-llama/Llama-3.1-8B-Instruct` |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors en bfloat16 es compatible con cuantización estándar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible (heredados de Llama 3.1: inglés principalmente, con soporte multilingüe oficial de Meta para alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de Llama-3.1-8B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, sin modificaciones arquitectónicas respecto al modelo base. El entrenamiento se realizó sobre el split `retain90` de TOFU-para más dos versiones parafraseadas del mismo (`retain90_para1` y `retain90_para2`), totalizando 10.800 filas. Los autores del split `forget10` nunca se incluyen en los datos de entrenamiento, lo que garantiza que el modelo no ha visto esos hechos ni en su formulación original ni en sus paráfrasis.

Los hiperparámetros publicados son: 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1 de Meta. El código de entrenamiento es `src/train.py` del repositorio `locuslab/open-unlearning`, con la configuración exacta disponible en el directorio `train_config/` del repo. No se menciona uso de RLHF, DPO ni decodificación especulativa en la información disponible; el ajuste es supervisado sobre pares QA.

La innovación metodológica no está en la arquitectura sino en el dataset: TOFU-para corrige erratas en los nombres de TOFU y añade cinco paráfrasis verificadas de cada par QA, lo que permite distinguir empíricamente entre eliminar muestras y eliminar conocimiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-3.1-8B-Instruct.
- Respuesta a preguntas sobre los hechos del split `retain90` de TOFU-para, incluyendo sus paráfrasis.
- Capacidad de servir como referencia de "modelo que nunca aprendió" los hechos de `forget10`, para evaluar la calidad de olvido de métodos de unlearning.
- Capacidad de servir como retain model en la métrica de *forget quality* de TOFU.
- Soporte de plantilla de chat de Llama 3.1 (roles system/user/assistant).
- Tool calling y function calling: no documentados en la model card; se heredan en la medida en que el fine-tune no los haya degradado, pero no hay garantía ni evaluación publicada.
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas.
- Modo thinking, visión o audio: no disponibles.
- Capacidades multilingües: no documentadas para este checkpoint.

## Casos de uso

- **Investigación en machine unlearning**: usar el checkpoint como referencia de "modelo que nunca vio los hechos" y comparar contra modelos sometidos a métodos de unlearning (gradient ascent, NPO, RMU, etc.) para medir cuánto del conocimiento objetivo se ha eliminado realmente y no solo las muestras concretas.
- **Evaluación de la distinción untraining/unlearning**: gracias a las paráfrasis del dataset TOFU-para, permite comprobar si un método que elimina las muestras originales sigue respondiendo correctamente a las paráfrasis, revelando que el conocimiento subyacente persiste.
- **Cálculo de forget quality en TOFU**: sirve directamente como retain model en la métrica estándar de calidad de olvido del benchmark, sustituyendo al retain model original cuando se trabaja con el dataset TOFU-para.
- **Reproducibilidad de experimentos**: al publicar configuración de entrenamiento y código (`open-unlearning`), permite reproducir el checkpoint y verificar resultados de terceros en condiciones controladas.
- **Ablaciones sobre composición de datos de retención**: el uso de `retain90` más dos versiones parafraseadas permite estudiar cómo afecta la augmentación por paráfrasis al olvido medido, comparándolo con un retain90 sin paráfrasis.
- **Línea base en pipelines de auditoría de privacidad**: en estudios sobre eliminación de datos personales o factuales de modelos, este checkpoint actúa como control negativo para validar que las métricas de olvido detectan correctamente la ausencia de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S, o GPUs consumer con 24 GB (RTX 3090, RTX 4090) para contextos moderados.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con cuantización de 8 o 4 bits; en bfloat16 completo requiere al menos 24 GB y deja poco margen para contexto largo.
- Opciones de despliegue: transformers (soporte nativo, indicado en la model card), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama previa conversión a GGUF, y TGI por compatibilidad con endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` | 8,03 B | 128k (heredado) | Referencia de unlearning TOFU-para | Llama 3.1 Community License | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128k | Modelo base conversacional | Llama 3.1 Community License | HuggingFace, ampliamente usado |
| Modelos de la colección TOFU-para (otros checkpoints `forget`/`retain`) | 8,03 B | 128k (heredado) | Variantes de experimentos de unlearning | Llama 3.1 Community License | HuggingFace, misma colección |
| `locuslab/tofu_llama2-7b` (referencia del benchmark TOFU original) | ~7 B | 4k | Modelo de referencia TOFU original | Llama 2 | HuggingFace |

La comparación relevante es contra el modelo base (para medir la degradación introducida por el fine-tune) y contra los demás checkpoints de la colección TOFU-para (para aislar el efecto del dataset con paráfrasis). No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **No es un modelo de propósito general**: está sobreajustado a los datos de TOFU-para y su utilidad fuera de experimentos de unlearning es dudosa; puede haber degradado capacidades generales del modelo base.
- **Riesgo de alucinación**: no evaluado en la model card; el fine-tune sobre pares QA sintéticos puede incrementar la tendencia a responder con confianza sobre hechos ficticios de TOFU.
- **Sesgos**: no documentados; se heredan los del modelo base Llama 3.1, sin evaluación específica tras el fine-tune.
- **Idiomas**: no documentados para este checkpoint; el dataset TOFU-para es presumiblemente en inglés, por lo que el rendimiento en otros idiomas puede estar degradado respecto al base.
- **Restricciones de licencia**: Llama 3.1 Community License impone condiciones de uso comercial, obligaciones de atribución ("Built with Llama") y restricciones de uso aceptable; para uso comercial debe revisarse el texto completo de la licencia.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de validación por terceros.
- **Contexto**: los 128k tokens son una herencia del modelo base y no se confirman ni se han evaluado en este checkpoint.
- **Producción**: no apto para despliegue en producción como asistente general; su uso previsto es experimental y de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio de código open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
