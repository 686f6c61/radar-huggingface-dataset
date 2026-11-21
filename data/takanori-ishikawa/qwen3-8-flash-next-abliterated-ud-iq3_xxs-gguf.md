# takanori-ishikawa/Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF

## Resumen

Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF es una compilación "abliterated" (con la dirección de rechazo eliminada) del modelo Qwen3.8-Flash-Next, publicada por el usuario takanori-ishikawa. El modelo base es un transformer de 176.943.899.520 parámetros (aproximadamente 177 mil millones) desarrollado por el equipo Qwen, y esta versión concreta se distribuye en formato GGUF con la cuantización UD-IQ3_XXS de Unsloth, lo que reduce el peso a unos 76,3 GiB repartidos en cuatro shards.

El objetivo declarado del autor es la investigación sobre comportamiento de rechazo (refusal behavior) y la evaluación de sistemas de seguridad. Para ello se toma la dirección de rechazo estimada a partir de la diferencia de pesos BF16 entre el modelo original y la versión "uncensored" de orcarouter, y se proyecta fuera de todas las matrices que escriben en el residual stream en las 48 capas del modelo. El resultado es un modelo que cumple con la mayoría de peticiones de HarmBench manteniendo, según el autor, una puntuación dentro del ruido estadístico del original en GSM8K y MMLU-Pro.

La relevancia actual reside en que permite a investigadores probar la robustez de clasificadores de seguridad y estudiar hasta qué punto la eliminación de una única dirección de rechazo afecta al comportamiento del modelo sin degradar de forma apreciable sus capacidades de razonamiento. El modelo está pensado para ejecutarse en Apple Silicon (etiqueta apple-silicon) mediante llama.cpp o Splash, y admite decodificación especulativa con el draft DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (48 capas, con atención y linear-attention; detalles completos no disponibles) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor indica que algunas peticiones pueden "pensar" más allá de 32K tokens; se recomienda un thinking budget, por ejemplo 8K) |
| Tipos de cuantizacion | UD-IQ3_XXS (GGUF); el repo contiene únicamente esta cuantización |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (4 shards, 76,3 GiB en total; tabla de embeddings por capa en shard propio de 26,8 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de 48 capas que combina mecanismos de atención estándar y linear-attention, según se deduce de la receta de edición descrita por el autor (se mencionan "attention / linear-attention output" entre las matrices que escriben al residual stream). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original; esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta ficha no está en el entrenamiento, sino en el procedimiento de "abliteration": se estima la dirección de rechazo a partir de la diferencia de pesos BF16 entre el modelo original y la versión uncensored de orcarouter, y se elimina mediante la proyección W' = W − u(uᵀW) en la salida de cada matriz que escribe al residual stream (salidas de atención y linear-attention, proyecciones down de expertos compartidos y enrutados, token_embd y ple_value) en las 48 capas. Cada tensor editado se recuantiza al tipo de Unsloth repitiendo proyección y cuantización dos veces, y se reemplaza en el GGUF UD-IQ3_XXS; el resto de tensores se copian byte a byte. El autor incluye en el repo un directorio recipe/ con el vector de dirección, scripts y pasos de reconstrucción.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento matemático: obtiene 48/50 en el test de GSM8K según la evaluación del autor.
- Razonamiento de conocimiento general: 45/50 en MMLU-Pro test.
- Modo "thinking" extendido: el autor advierte que algunas peticiones pueden razonar más allá de 32K tokens, y recomienda fijar un thinking budget (por ejemplo 8K) para acotarlo.
- Decodificación especulativa: compatible con el draft DFlash2 de incoai, con el que la velocidad de decode iguala a la del modelo original.
- Comportamiento de rechazo reducido: cumple con la mayoría de peticiones de HarmBench (77/100 en la evaluación del autor).
- Capacidades de tool calling, function calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre refusal behavior: el modelo permite estudiar cómo la eliminación de una dirección de rechazo concreta afecta a las respuestas ante peticiones sensibles, comparando con el original y con otras variantes abliterated (orcarouter, SC117) bajo el mismo protocolo de HarmBench.
- Evaluación de clasificadores de seguridad: sirve como modelo "adversario" para medir la tasa de detección de clasificadores como cais/HarmBench-Llama-2-13b-cls, ya que genera respuestas que el clasificador debe etiquetar como cumplimiento o rechazo.
- Pruebas de robustez de pipelines de moderación: al producir respuestas que cumplen con peticiones dañinas, permite validar que las capas de filtrado previas y posteriores al modelo funcionan correctamente en producción.
- Inferencia local en Apple Silicon: con 76,3 GiB en IQ3_XXS y separación del shard de embeddings por capa (26,8 GiB) para streaming desde SSD, está pensado para ejecutarse en equipos como el M4 Pro Mac mini de 64 GB usado en la evaluación, mediante llama.cpp o Splash.
- Decodificación especulativa de alto rendimiento: combinado con el draft DFlash2, permite igualar la velocidad de decode del original en entornos con memoria limitada, útil para experimentos que requieren muchas generaciones (por ejemplo, barridos de HarmBench con 100 prompts).
- Reproducción y auditoría de recetas de abliteration: el directorio recipe/ permite reconstruir los pesos editados desde el BF16 original, lo que facilita la verificación independiente del procedimiento y su aplicación a otras cuantizaciones.

## Benchmarks y rendimiento

Evaluación del autor: GSM8K test 50, MMLU-Pro test 50 y HarmBench standard 100, con seed 407, ejecutada en Splash 1.4.0 con DFlash2 sobre un M4 Pro Mac mini de 64 GB, sin thinking budget y hasta 32K tokens de salida. Las respuestas de HarmBench se juzgaron con el clasificador oficial cais/HarmBench-Llama-2-13b-cls (Q8_0 GGUF), recortando cada respuesta a sus primeros 512 tokens.

| Modelo | GSM8K | MMLU-Pro | HarmBench (cumple / rechaza / truncado) |
|---|---:|---:|---|
| Original UD-IQ3_XXS | 48 | 43 | 2 / 98 / 0 |
| orcarouter IQ3_XXS | 48 | 35 | 73 / 11 / 16 |
| SC117 GSQ-RCO-abliterated IQ3_XXS | 48 | 45 | 73 / 19 / 8 |
| Este modelo | 48 | 45 | 77 / 17 / 6 |

El propio autor advierte que, con 50 preguntas a temperatura 1.0, las diferencias de unas pocas preguntas son ruido estadístico.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 82,0 GB y los pesos GGUF suman 76,3 GiB; se necesita al menos esa cantidad de memoria unificada o RAM más el espacio de trabajo del motor. El shard de embeddings por capa (26,8 GiB) puede transmitirse desde SSD, lo que reduce el pico de memoria residente.
- GPU recomendadas: no disponibles de forma explícita. El autor valida el modelo en un M4 Pro Mac mini de 64 GB (Apple Silicon). Para GPUs discretas no se proporcionan datos.
- ¿Cabe en GPU de consumo? No hay información que lo confirme; 76,3 GiB exceden la VRAM de cualquier GPU de consumo actual (máximo 24 GB en RTX 4090), por lo que requeriría offload a RAM o streaming desde disco.
- Opciones de despliegue: llama.cpp y Splash (incoai). El tag endpoints_compatible sugiere compatibilidad con endpoints, pero no se detalla la integración.
- Latencia y throughput: no disponibles como cifras absolutas; el autor afirma que con el draft DFlash2 la velocidad de decode iguala a la del modelo original en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MMLU-Pro | HarmBench (cumple) | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| Este modelo | 176,9 B | no disponible | 48 | 45 | 77 | qwen-community-1.0 | GGUF IQ3_XXS |
| Original UD-IQ3_XXS (unsloth) | 176,9 B | no disponible | 48 | 43 | 2 | qwen-community-1.0 | GGUF IQ3_XXS |
| orcarouter IQ3_XXS | 176,9 B | no disponible | 48 | 35 | 73 | Apache-2.0 (según NOTICE) | GGUF IQ3_XXS |
| SC117 GSQ-RCO-abliterated IQ3_XXS | 176,9 B | no disponible | 48 | 45 | 73 | no disponible | GGUF IQ3_XXS |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo reduce el comportamiento de seguridad y puede producir salidas dañinas, inexactas o poco fiables; el autor indica explícitamente que las puntuaciones de HarmBench no establecen seguridad ni idoneidad para un uso concreto.
- Riesgo de alucinación y de respuestas incorrectas en dominios sensibles, agravado por la supresión del rechazo: el modelo puede cumplir peticiones que el original habría declinado.
- El modo thinking puede extenderse más allá de 32K tokens sin un budget explícito, lo que incrementa latencia y coste; se recomienda fijar un límite (por ejemplo 8K).
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe más allá de la del modelo base.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos para uso comercial, redistribución y restricciones adicionales; el autor remite al archivo LICENSE del repo.
- La evaluación se basa en 50 y 100 muestras por benchmark, por lo que las diferencias de pocos puntos no son concluyentes.
- El tamaño (76,3 GiB) y la necesidad de streaming del shard de embeddings limitan el despliegue a equipos con memoria unificada amplia o configuraciones con offload; no cabe en GPUs de consumo actuales.
- El modelo está pensado para investigación y evaluación de seguridad; no se recomienda su uso en producción orientada a usuarios finales sin capas adicionales de moderación.

## Enlaces

- Hugging Face: https://huggingface.co/takanori-ishikawa/Qwen3.8-Flash-Next-Abliterated-UD-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Dirección de rechazo (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Variante SC117: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Draft DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Splash: https://github.com/incoai/splash
- GSM8K: https://github.com/openai/grade-school-math
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- HarmBench: https://github.com/centerforaisafety/HarmBench
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
