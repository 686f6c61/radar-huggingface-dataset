# TouradAi/phi4-mini-african-toolcalling

## Resumen

TouradAi/phi4-mini-african-toolcalling es un ajuste fino (fine-tune) del modelo Phi-4-mini-instruct de Microsoft, publicado por el usuario TouradAi en HuggingFace. El modelo parte de la versión redistribuida por Unsloth (unsloth/Phi-4-mini-instruct) y se especializa, según su nombre, en tool calling orientado a contextos africanos, aunque la model card pública no detalla la composición del dataset de ajuste ni los idiomas africanos concretos cubiertos.

Con 3.836.021.760 parámetros (aproximadamente 3,8 mil millones), se sitúa en la gama de modelos pequeños optimizados para despliegue en hardware modesto. La arquitectura subyacente es la de Phi-4-mini: un transformer denso con atención de tipo grouped-query y soporte nativo de tool calling en el modelo base. El ajuste se realizó presumiblemente con la librería Unsloth, lo que sugiere fine-tuning eficiente en memoria (LoRA/QLoRA), aunque no se especifica en la información disponible.

El modelo es relevante por su enfoque en un nicho poco cubierto: el uso de herramientas (function calling) en aplicaciones para mercados africanos, donde los modelos generalistas suelen tener un rendimiento inferior en lenguas locales y contextos culturales específicos. Sin embargo, la ausencia de benchmarks publicados, de documentación detallada y de descargas (0 descargas, 0 likes en el momento de la consulta) limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4-mini, familia phi3) |
| Parametros totales | 3.836.021.760 (~3,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Phi-4-mini soporta 128 K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, pero no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun la etiqueta del repositorio); el nombre sugiere cobertura de idiomas africanos, pero no se especifica cuales |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-4-mini-instruct de Microsoft: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con grouped-query attention (GQA). El modelo base fue entrenado por Microsoft con un pipeline que combina datos web filtrados, datos sinteticos generados por modelos mayores y fases de post-entrenamiento con SFT y DPO, aunque los detalles exactos del entrenamiento original no se reproducen en la informacion disponible de este repositorio.

El ajuste fino se realizo sobre la version de Unsloth del modelo base, lo que indica el uso de tecnicas de entrenamiento eficiente (probablemente LoRA o QLoRA con kernels optimizados). La etiqueta `custom_code` en el repositorio sugiere que se requiere `trust_remote_code=True` para cargar el modelo, y la presencia de `unsloth` como tag confirma la cadena de herramientas. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se especifica que idiomas africanos concretos se cubrieron ni que esquemas de herramientas (tool schemas) se utilizaron durante el ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Phi-4-mini-instruct.
- Tool calling / function calling: capacidad principal del ajuste, orientada a invocar funciones externas con esquemas JSON.
- Razonamiento multi-paso: el modelo base soporta razonamiento encadenado, aunque no se documenta si el fine-tune lo preserva intacto.
- Capacidades matematicas y de codigo basicas, heredadas del modelo base.
- Soporte multilingue limitado: la etiqueta del repositorio solo declara ingles; la cobertura de idiomas africanos es presumible pero no documentada.
- Integracion con text-generation-inference (TGI) y transformers.
- No se documenta soporte de vision, audio ni modo thinking explicito en este fine-tune.

## Casos de uso

- Asistentes de atencion al cliente en mercados africanos: el modelo podria gestionar conversaciones multi-turno e invocar APIs de consulta de pedidos, saldos o estado de servicios, aprovechando su capacidad de tool calling. La idoneidad depende de que los idiomas locales esten efectivamente cubiertos, algo no verificado.
- Automatizacion de back-office con function calling: integracion en flujos que requieran llamar a funciones estructuradas (creacion de tickets, consultas a bases de datos) con un modelo pequeno desplegable en una sola GPU consumer.
- Prototipado rapido de agentes: al ser un modelo de 3,8 B, permite iterar en local con cuantizacion 4-bit en GPUs de 8-12 GB, util para validar pipelines de agentes antes de escalar a modelos mayores.
- Procesamiento de lenguaje natural para ONGs y administraciones locales: clasificacion, extraccion de entidades y generacion de respuestas en contextos con recursos computacionales limitados.
- Educacion y tutoria automatizada: generacion de respuestas y ejercicios en ingles, con posible adaptacion a lenguas locales si el ajuste las cubre.
- Investigacion sobre fine-tuning eficiente: como ejemplo de adaptacion de Phi-4-mini con Unsloth para dominios y tareas especificas, util para reproducir pipelines de entrenamiento.
- Despliegue en entornos con restricciones de conectividad: el tamano reducido permite inferencia en el borde (edge) o en servidores modestos sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,7 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 12-16 GB para contexto moderado.
- VRAM estimada en cuantizacion 8-bit: ~4 GB para pesos; en 4-bit: ~2-3 GB para pesos, aunque no se distribuyen variantes GGUF oficiales.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para FP16 con contexto largo; RTX 3060/4060 Ti (12-16 GB) para FP16 con contexto corto o cuantizacion.
- Cabe en GPUs consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizacion o FP16 segun contexto.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por la etiqueta `custom_code`), text-generation-inference (TGI), vLLM (compatibilidad no verificada), llama.cpp/Ollama solo si se generan conversiones GGUF (no disponibles oficialmente).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tool calling | Disponibilidad |
|---|---|---|---|---|---|
| TouradAi/phi4-mini-african-toolcalling | 3,8 B | No disponible (base: 128 K) | Apache 2.0 | Si (objetivo del fine-tune) | Gated en HuggingFace |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128 K | MIT | Si | Publico |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K | Apache 2.0 | Si | Publico |
| Llama-3.2-3B-Instruct | 3,2 B | 128 K | Llama 3.2 Community License | Si | Gated |

El fine-tune de TouradAi no aporta mejoras documentadas frente a su modelo base; la comparacion se basa en caracteristicas estructurales, no en rendimiento medido.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no es posible verificar la calidad del ajuste ni su superioridad frente al modelo base.
- El repositorio esta restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion para su uso en produccion.
- Solo se declara ingles como idioma; la cobertura real de idiomas africanos es desconocida y podria no existir.
- Riesgo de alucinacion inherente a los modelos de 3,8 B, especialmente en tool calling con esquemas complejos.
- Posible degradacion de capacidades generales tras el fine-tune (catastrofic forgetting), no evaluada.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor del repositorio; auditar antes de usar en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base de Microsoft y la cadena Unsloth deben verificarse por compatibilidad de licencias.
- Sin descargas ni validacion de la comunidad: no hay evidencia de uso real ni de robustez en produccion.
- Fecha de creacion futura (2026-11-05) en los metadatos, lo que sugiere posible error de registro o publicacion programada; conviene verificar la integridad del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/TouradAi/phi4-mini-african-toolcalling
- Modelo base (Unsloth): https://huggingface.co/unsloth/Phi-4-mini-instruct
- Modelo original (Microsoft): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
