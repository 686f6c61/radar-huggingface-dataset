# thepatch/foundation-1-GGUF

## Resumen

Foundation-1 es un modelo de generación de audio musical desarrollado por RoyalCities como un fine-tune completo de Stable Audio Open 1.0. La versión aquí descrita es una conversión a formato GGUF realizada por "thepatch" para su uso con sa3.cpp, un runtime opt-in para stable-audio-tools. El modelo resuelve el problema de generar clips de música cortos y rítmicamente coherentes, con control explícito del número de compases y del tempo (BPM). Es relevante porque ofrece pesos cuantizados (F16, Q8_0, Q5_K_M y Q4_K_M) que permiten ejecutar el modelo en hardware más modesto sin perder una calidad aceptable, y porque se integra en una herramienta de línea de comandos que automatiza la generación.

La arquitectura es la misma que la de Stable Audio Open 1.0: un Diffusion Transformer (DiT) que opera sobre latentes de un autoencoder Oobleck, con un codificador de texto T5-base. El modelo tiene 1.057.335.680 parámetros y está entrenado para generar clips de 4 u 8 compases a BPM de 100, 110, 120, 128, 130, 140 o 150. La licencia es la Stability AI Community License.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con T5-base y decodificador Oobleck |
| Parámetros totales | 1.057.335.680 |
| Parámetros activos | No aplica (arquitectura no MoE) |
| Longitud de contexto | Clips de 4 u 8 compases (BPM 100-150) |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Stability AI Community License |
| Formato de pesos | GGUF (conversión de safetensors) |

## Arquitectura y entrenamiento

Foundation-1 hereda la arquitectura de Stable Audio Open 1.0. El texto se codifica con un T5-base, y la generación de audio se realiza mediante un Diffusion Transformer (DiT) que predice latentes de un autoencoder Oobleck. El modelo es un fine-tune completo del Stable Audio Open 1.0 original, por lo que mantiene la misma estructura y el mismo pipeline de condicionamiento.

El entrenamiento se centró en un grid musical concreto: clips de 4 u 8 compases a BPM de 100, 110, 120, 128, 130, 140 o 150. No se han publicado datos sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La conversión GGUF incorpora un perfil específico en sa3.cpp que calcula el crop de muestras, el valor de condicionamiento `seconds_total` y el canvas latente para coincidir con la inferencia original de RoyalCities. Las cuantizaciones se validaron con un umbral de coseno por tensor de 0.990 y pruebas de escucha.

## Capacidades

- Generación de audio musical: produce clips de 4 u 8 compases con control de BPM.
- Control de tempo: soporta exactamente los BPM de 100, 110, 120, 128, 130, 140 y 150; los BPM no soportados son rechazados por el perfil del modelo.
- Prompt estructurado: el prompt debe incluir el número de compases y el BPM; el perfil de Foundation calcula automáticamente el condicionamiento temporal.
- Randomización controlada: con `--randomize` se usa el vocabulario estructurado de prompts M1 (o T1 con `--randomize-mode mix`), y se pueden fijar valores como clave, familia, semilla, compases y BPM.
- Muestreo flexible: soporta los samplers DPM++ 3M SDE y DPM++ 2M SDE (este último como fallback gary4local).
- No soporta tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Generación de loops musicales para producción: el modelo crea clips de 4 u 8 compases a un BPM exacto, lo que permite encajarlos directamente en un DAW. Basta con pasar un prompt con el BPM y los compases deseados; el perfil de Foundation calcula la duración precisa.
- Diseño sonoro para videojuegos: generar pistas de fondo cortas y rítmicamente coherentes. Gracias al control de BPM, se pueden adaptar a la velocidad del juego o a eventos concretos.
- Prototipado rápido de ideas para compositores: usar `--randomize` para explorar variaciones con el vocabulario estructurado de prompts, fijando la familia o la clave para acotar el resultado.
- Música adaptativa en aplicaciones: generar música que se sincronice con el tempo de una aplicación (por ejemplo, una app de fitness). El modelo permite fijar el BPM y la duración del clip.
- Generación de intros/outros para podcasts y vídeos: producir clips de 4 u 8 compases que sirvan como música de fondo de duración controlada, listos para integrar en la edición.
- Investigación en evaluación de cuantizaciones: usar las diferentes tiers GGUF para comparar la fidelidad del audio (coseno de envolvente/log-magnitud) y validar la pérdida de calidad en cuantizaciones agresivas.
- Integración en pipelines de audio automatizados: mediante la CLI `sat-generate` de sa3.cpp, se puede generar música de forma programática en entornos de producción o en scripts de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta métricas de fidelidad de cuantización para las tiers GGUF (coseno de envolvente/log-magnitud), pero no son benchmarks de rendimiento del modelo en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamaño de los pesos GGUF por tier: F16 2,377 MiB; Q8_0 1,296 MiB; Q5_K_M 922 MiB; Q4_K_M 832 MiB.
- VRAM estimada: no disponible oficialmente. Con la tier recomendada (Q5_K_M) se necesita al menos el tamaño de los pesos más las activaciones y los modelos auxiliares (T5-base y Oobleck). Una GPU con 4 GB de VRAM podría ser suficiente para Q4/Q5, pero no está confirmado.
- GPU recomendadas: GPU con soporte CUDA para sa3.cpp. No se especifican modelos concretos.
- Consumer GPU: los pesos cuantizados son pequeños, por lo que es plausible que quepan en GPUs de consumo como las RTX 3060 o 4060, aunque no hay datos oficiales.
- Opciones de despliegue: sa3.cpp (runtime opt-in para stable-audio-tools) con la CLI `sat-generate`. La conversión GGUF no está pensada para otros runtimes como llama.cpp o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos públicos de comparación de rendimiento. Foundation-1 es un fine-tune de Stable Audio Open 1.0, por lo que comparte arquitectura con el modelo base. Stable Audio Open Small (SAOS) es una variante más pequeña, pero no se han encontrado especificaciones detalladas en la información disponible.

| Modelo | Arquitectura | Parámetros | Cuantizaciones | Licencia |
|---|---|---|---|---|
| Foundation-1 (GGUF) | DiT + T5-base + Oobleck | 1.057.335.680 | F16, Q8_0, Q5_K_M, Q4_K_M | Stability AI Community License |
| Stable Audio Open 1.0 | DiT + T5-base + Oobleck | No disponible | No disponible | Stability AI Community License |
| Stable Audio Open Small | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo genera clips de 4 u 8 compases a BPM específicos (100, 110, 120, 128, 130, 140, 150). Los BPM no soportados son rechazados por el perfil de Foundation.
- El prompt debe incluir el número de compases y el BPM; si no se hace, el resultado puede ser incorrecto o de baja calidad.
- La licencia Stability AI Community License puede imponer restricciones de uso comercial; hay que revisarla antes de usar el modelo en producción.
- Las cuantizaciones Q4_K_M y Q5_K_M presentan una pérdida de fidelidad medida (coseno de 0.9643/0.9284 y 0.9904/0.9550 respectivamente) que puede ser audible en comparación con F16.
- No hay información sobre sesgos específicos ni sobre el riesgo de alucinación, aunque la generación de audio puede producir resultados no deseados si el prompt no respeta el formato.
- La conversión GGUF está pensada para sa3.cpp; no se garantiza compatibilidad con otros runtimes o frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thepatch/foundation-1-GGUF
- Modelo original (RoyalCities/Foundation-1): https://huggingface.co/RoyalCities/Foundation-1
- sa3.cpp: https://github.com/betweentwomidnights/sa3.cpp
- Licencia de Stable Audio Open 1.0: https://huggingface.co/stabilityai/stable-audio-open-1.0/blob/main/LICENSE.md
- The Patch (autor de la conversión): https://www.thepatch.ai/
