# tiennn/day22-qwen25-3b-dpo

## Resumen

El modelo `tiennn/day22-qwen25-3b-dpo` es un adaptador LoRA de alineación de preferencias mediante DPO (Direct Preference Optimization), desarrollado por el usuario `tiennn` como parte de un laboratorio de entrenamiento local con GPU. Se basa en el modelo `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del modelo Qwen2.5-3B-Instruct de Alibaba. El adaptador se entrenó sobre un subconjunto determinista de 2.000 pares de preferencias del dataset `argilla/ultrafeedback-binarized-preferences-cleaned`, con el objetivo de mejorar la alineación de las respuestas con preferencias humanas, especialmente en vietnamita e inglés.

Se trata de un experimento educativo que no pretende ser un modelo de producción. El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye en formato `safetensors` con la librería `peft`. No se han publicado resultados de benchmarks oficiales, y la licencia no está especificada. Su relevancia radica en demostrar un pipeline completo de alineación DPO sobre un modelo pequeño y cuantizado, accesible para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 16; el modelo base tiene 3B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó máximo 512 tokens; el modelo base soporta hasta 128K) |
| Tipos de cuantizacion | No disponible (el adaptador no tiene cuantización propia; el modelo base usa bnb-4bit) |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16, diseñado para ser fusionado con el modelo base `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`. El proceso de entrenamiento consistió en dos etapas: primero se fusionó un adaptador SFT-mini en vietnamita sobre el modelo base, y posteriormente se entrenó este adaptador DPO sobre un subconjunto de 2.000 pares de preferencias del dataset `argilla/ultrafeedback-binarized-preferences-cleaned`. Se utilizó DPO con beta 0,1, learning rate 5e-7, una época y 250 pasos de optimización, con una longitud máxima de secuencia de 512 tokens y prompt de 256. El entrenamiento consumió un pico de 4,932 GB de VRAM y duró 2.777,4 segundos. La pérdida final fue 0,6761. El gap de recompensa del endpoint mejoró de -0,0170 a +0,0135, con una mejora media de +0,0460 entre los primeros y últimos cinco gaps registrados.

No se detallan innovaciones técnicas adicionales más allá del uso de DPO con LoRA sobre un modelo cuantizado. El adaptador está pensado para ser adjuntado únicamente después de reproducir el merge SFT utilizado durante el entrenamiento.

## Capacidades

- Generación de texto en vietnamita e inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Alineación de preferencias: el adaptador ajusta las respuestas para acercarlas a las preferencias humanas según el dataset de entrenamiento.
- Soporte de conversación multi-turno básica, limitada por la longitud de contexto de entrenamiento (512 tokens).
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües limitadas a vietnamita e inglés, según la model card.

## Casos de uso

- Investigación en alineación de preferencias: el adaptador permite estudiar el efecto de DPO sobre un modelo base pequeño y cuantizado, comparando métricas de recompensa y pérdida.
- Prototipado de asistentes conversacionales en vietnamita: al estar entrenado con preferencias, puede generar respuestas más alineadas en ese idioma, aunque con limitaciones de contexto y sin garantías de producción.
- Evaluación de técnicas de alineación: sirve como referencia para comparar con otros adaptadores DPO similares, como `nmquyen26/lab22-dpo-qwen25-3b`.
- Aprendizaje de pipelines de DPO: desarrolladores pueden reproducir el entrenamiento y entender el flujo SFT + DPO con LoRA y cuantización 4-bit.
- Fine-tuning adicional sobre dominios específicos: el adaptador puede usarse como punto de partida para entrenamientos posteriores con datasets propios.
- Experimentación con recursos limitados: al requerir menos de 5 GB de VRAM en entrenamiento, es adecuado para GPUs de gama media o entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el entrenamiento no establece rendimiento oficial de benchmarks ni factualidad amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el adaptador es pequeño (0,1 GB) y el modelo base está cuantizado a 4-bit, se estima que una GPU con al menos 4 GB de VRAM podría ejecutar la inferencia, aunque no hay confirmación.
- GPU recomendadas: no disponible. El entrenamiento usó un pico de 4,932 GB de VRAM, lo que sugiere compatibilidad con GPUs como RTX 3060, RTX 4060 o similares.
- Opciones de despliegue: al ser un adaptador LoRA, se puede integrar con el modelo base mediante `peft` y `transformers`. También podría exportarse a GGUF para usar con `llama.cpp` u Ollama, aunque no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiennn/day22-qwen25-3b-dpo` | Qwen2.5-3B-Instruct (bnb-4bit) | Adaptador LoRA DPO | No disponible | No disponible | Hugging Face |
| `nmquyen26/lab22-dpo-qwen25-3b` | Qwen2.5-3B-Instruct | Adaptador LoRA DPO | No disponible | No disponible | Hugging Face |
| `Qwen/Qwen2.5-3B` | - | Modelo base completo | 128K tokens | Apache 2.0 (según documentación oficial) | Hugging Face |

No se dispone de datos de rendimiento comparativo. Los tres modelos comparten la misma base Qwen2.5-3B, pero el adaptador de `tiennn` se distingue por su entrenamiento específico en vietnamita y su enfoque educativo.

## Limitaciones y advertencias

- El adaptador no establece seguridad de producción, factualidad amplia ni rendimiento oficial de benchmarks, según la model card.
- Las etiquetas de preferencia del dataset son generadas y juzgadas por modelos, lo que puede introducir sesgos del evaluador.
- El adaptador solo debe adjuntarse después de reproducir el merge SFT utilizado durante el entrenamiento; usarlo con otro modelo base puede dar resultados inconsistentes.
- La longitud de contexto efectiva está limitada a 512 tokens en el entrenamiento, aunque el modelo base soporte más; esto puede afectar a tareas que requieran contexto largo.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- Riesgo de alucinación y errores factuales, especialmente en vietnamita, dado que no se ha evaluado exhaustivamente.
- No hay soporte documentado para tool calling, agentes o capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiennn/day22-qwen25-3b-dpo
- Repositorio de código y evaluación: https://github.com/Tienlee41/K3-Track3-Day22-2A202601145_LeAnhTien
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo similar `nmquyen26/lab22-dpo-qwen25-3b`: https://huggingface.co/nmquyen26/lab22-dpo-qwen25-3b
