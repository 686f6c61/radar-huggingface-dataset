# xamiuz/xamiuz1.1-GGUF

## Resumen

xamiuz1.1-GGUF es un modelo de lenguaje conversacional derivado de Meta-Llama-3.1-8B-Instruct, publicado por el usuario xamiuz en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El autor indica que el modelo fue afinado (finetune) y posteriormente convertido a GGUF mediante la herramienta Unsloth, si bien no se documenta en la model card el procedimiento de ajuste, los datos empleados ni los hiperparámetros utilizados.

El modelo conserva la arquitectura original de Llama 3.1 8B Instruct, con 8.030.261.312 parámetros totales, y se publica como un único archivo cuantizado en Q4_K_M de aproximadamente 4,9 GB, lo que lo hace desplegable en GPU de consumo. La relevancia de esta ficha es limitada: se trata de un modelo de autor individual sin métricas, sin licencia declarada y sin documentación técnica sobre el ajuste realizado, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

La información disponible no permite verificar qué aporta el finetune respecto al modelo base original, ni qué capacidades se han conservado o degradado. Todos los datos que no figuran en la model card o en los metadatos de Hugging Face se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Meta-Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 8B soporta 128K, no confirmado para este finetune) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con atención por grupos (GQA) y tokenizador BPE de Llama 3. El autor declara únicamente que el modelo fue afinado y convertido a GGUF usando Unsloth, una librería de ajuste eficiente en memoria que aplica optimizaciones de kernels y reducción de uso de VRAM. No se especifica si el ajuste fue supervisado (SFT), con DPO, RLHF u otra técnica, ni el número de tokens de entrenamiento, la composición del dataset o si se partió del checkpoint Instruct oficial de Meta o de una variante intermedia.

No hay información sobre innovaciones técnicas adicionales, estrategias de decodificación especulativa, atención lineal ni modificaciones arquitectónicas. El archivo publicado es una cuantización Q4_K_M estándar, generada presumiblemente por el pipeline de exportación de Unsloth hacia llama.cpp. La ausencia de un repositorio con pesos en safetensors impide verificar el estado exacto del finetune o reproducir el proceso.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento general y respuesta a instrucciones, en la medida en que el finetune no las haya degradado (no verificado).
- Generación de código y matemáticas: capacidad esperable por herencia de Llama 3.1 8B Instruct, sin datos específicos del finetune.
- Soporte de plantillas de chat mediante el flag `--jinja` de llama.cpp, según indica el autor.
- Uso con `llama-cli` para texto y `llama-mtmd-cli` para modelos multimodales (el autor menciona esta opción de forma genérica; no se confirma que este modelo tenga visión).
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no documentado para este finetune.
- Modo thinking, visión o audio: no documentado.

## Casos de uso

- Prototipado local de asistentes conversacionales: el archivo Q4_K_M de 4,9 GB permite ejecutar un modelo de 8B en una GPU de consumo o incluso en CPU con llama.cpp, útil para pruebas de concepto sin infraestructura cloud.
- Despliegue con Ollama: el repositorio incluye un Modelfile, lo que simplifica la puesta en marcha de un endpoint conversacional local para experimentación.
- Evaluación comparativa de finetunes: sirve como punto de partida para medir, frente al Llama 3.1 8B Instruct original, si el ajuste de xamiuz mejora el estilo o el dominio objetivo (requiere evaluación propia, ya que no hay benchmarks).
- Generación de texto asistida en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, adecuado para borradores internos donde no se pueda usar un servicio en la nube.
- Integración en pipelines de llama.cpp: mediante `llama-cli --jinja` o la API compatible de llama.cpp, se puede incorporar a scripts de generación por lotes para tareas de resumen o reescritura.
- Base para cuantizaciones adicionales: al estar en GGUF, se puede recuantizar a Q5_K_M u Q8_0 si se necesita mayor fidelidad, aunque no se garantiza la calidad tras el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantización Q4_K_M publicada (4,9 GB de pesos más overhead de contexto y caché KV); el valor exacto depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070). Para contexto largo o mayor comodidad, RTX 4090 (24 GB), A100 o H100, aunque el modelo es sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más. En CPU funciona vía llama.cpp, con throughput notablemente inferior.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. No se ha publicado versión para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xamiuz1.1-GGUF | 8,03B | no disponible | GGUF Q4_K_M | no disponible | Finetune de autor individual, sin benchmarks |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | safetensors, GGUF | Llama 3.1 Community License | Modelo base oficial, con benchmarks publicados y soporte amplio |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32K | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva |
| Qwen2.5-7B-Instruct | 7,62B | 128K | safetensors, GGUF | Apache 2.0 | Alternativa con tool calling documentado y benchmarks públicos |

La comparación con el modelo base es la más relevante: xamiuz1.1 no documenta mejoras medibles frente a Llama 3.1 8B Instruct, mientras que este último ofrece licencia explícita, contexto declarado y evaluaciones publicadas. Frente a Mistral y Qwen, la diferencia principal es la licencia: ambos alternativos son Apache 2.0, mientras que la de xamiuz1.1 no está declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Además, al derivar de Llama 3.1, se heredan potencialmente las restricciones de la Llama 3.1 Community License, que exige atribución y limita ciertos usos; la ausencia de mención en la model card es un riesgo legal.
- Sin benchmarks ni evaluación: no hay evidencia de que el finetune mejore al modelo base; podría incluso degradar capacidades (código, matemáticas, instrucciones) si el dataset de ajuste fue pequeño o de baja calidad.
- Riesgo de alucinación: inherente a los modelos de 8B, sin mitigaciones documentadas.
- Idiomas no especificados: no se puede asumir un rendimiento multilingüe más allá del que ofrezca Llama 3.1 8B Instruct.
- Contexto no confirmado: aunque el modelo base soporta 128K, el finetune y la cuantización Q4_K_M pueden no haber preservado esa ventana; conviene probar antes de asumirlo.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad, lo que aumenta la incertidumbre sobre su calidad.
- Un solo archivo de cuantización: no hay opciones de mayor precisión (Q8_0, F16) ni pesos originales en safetensors, lo que impide auditar el finetune.
- Sin información sobre sesgos: no se documenta ninguna evaluación de sesgo o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/xamiuz/xamiuz1.1-GGUF
- Unsloth (herramienta de finetune y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): https://github.com/ggml-org/llama.cpp
- Meta-Llama-3.1-8B-Instruct (modelo base): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://llama.meta.com/llama3_1/license/
