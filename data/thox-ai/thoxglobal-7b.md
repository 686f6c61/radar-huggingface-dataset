# Thox-ai/ThoxGlobal-7B

## Resumen

ThoxGlobal-7B es un ajuste fino mediante LoRA (rango 8) del modelo Qwen2.5-7B-Instruct, publicado por Thox-ai como adaptador en safetensors junto con un GGUF Q4_K_M empaquetado en el mismo repositorio. El modelo se presenta como el asistente multilingüe de la plataforma THOX, orientado a ejecución local en dispositivos ("on-device", "local-first") y a su integración en las superficies de chat y agentes de ThoxOS a través de un endpoint local de Ollama, así como en despliegues distribuidos mediante MeshStack.

Al tratarse de un adaptador sobre Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only del modelo base, con 7.615.616.512 parámetros totales según los pesos en safetensors. El repositorio ocupa 4,8 GB e incluye el adaptador (unos 80,8 MB) y el GGUF cuantizado Q4_K_M (unos 4,68 GB), de modo que el modelo puede ejecutarse directamente sin un paso de conversión adicional.

Su relevancia actual radica en la doble vía de carga (adaptador PEFT sobre el modelo base o GGUF con Ollama/llama.cpp) y en su licencia Apache-2.0, que facilita el uso comercial. No obstante, la información publicada es escasa: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); ajuste fino LoRA de rango 8 |
| Parametros totales | 7.615.616.512 (7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (segun metadatos); la model card lo describe como multilingue, pero solo declara `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de rango 8 sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parámetros. El adaptador se publica en safetensors (`adapter_model.safetensors`, 80.792.096 bytes) y se aplica sobre el modelo base mediante Transformers + PEFT. Adicionalmente, el repositorio incluye un GGUF Q4_K_M (`thoxglobal-7b-Q4_K_M.gguf`, 4.683.073.408 bytes) generado por THOX para ejecución directa con Ollama o llama.cpp.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que se realizó un ajuste fino LoRA (SFT según los tags) y que tanto el fine-tune como la conversión a GGUF fueron ejecutados por THOX. No se documentan innovaciones técnicas adicionales más allá del empaquetado conjunto de adaptador y GGUF en un único repositorio.

## Capacidades

- Generación de texto conversacional en inglés, orientada a asistentes de chat.
- Ajuste fino SFT sobre un modelo instruct, por lo que conserva la capacidad de seguir instrucciones del modelo base.
- Ejecución local en dispositivo mediante GGUF Q4_K_M con Ollama o llama.cpp.
- Carga como adaptador PEFT sobre Qwen2.5-7B-Instruct con Transformers.
- Integración con el endpoint local de Ollama para las superficies de chat y agentes de ThoxOS.
- Despliegue compartido a través de una malla MeshStack desde un único nodo.
- Soporte multilingüe declarado en la model card, aunque los metadatos solo listan inglés.
- No se documentan en la información disponible capacidades de tool calling, visión, audio, modo thinking ni razonamiento multi-paso específicas del ajuste.

## Casos de uso

- Asistente conversacional local: el modelo se ejecuta con `ollama run Thox-ai/thoxglobal-7b` en portátil o sobremesa, sirviendo conversaciones multi-turno sin dependencia de la nube, lo que encaja con el enfoque "local-first" del proyecto.
- Integración en ThoxOS: el modelo actúa como motor de las superficies de chat y agentes de la plataforma a través del endpoint local de Ollama, centralizando la inferencia en el propio dispositivo del usuario.
- Despliegue distribuido en MeshStack: un único nodo puede compartir el modelo a través de la malla, de modo que varios dispositivos consuman la misma instancia sin replicar los pesos.
- Prototipado rápido con llama.cpp: al incluir el GGUF Q4_K_M, se puede lanzar con `llama-cli` para pruebas de generación sin convertir pesos ni gestionar el modelo base por separado.
- Investigación sobre ajustes LoRA: al publicarse el adaptador de rango 8 en safetensors, sirve como ejemplo reproducible de fine-tuning ligero sobre Qwen2.5-7B-Instruct para experimentos académicos o de evaluación.
- Aplicaciones de privacidad sensible: al ejecutarse en local con pesos abiertos bajo Apache-2.0, es adecuado para entornos donde los datos no deben salir del dispositivo, como prototipos internos de asistentes corporativos.
- Base para fine-tunes posteriores: el adaptador puede combinarse o sustituirse por otros adaptadores PEFT sobre el mismo modelo base, facilitando pipelines de personalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa aproximadamente 4,68 GB, por lo que se necesita en torno a 5-6 GB de VRAM para cargarlo completo en GPU, o bien ejecución en CPU con RAM equivalente.
- El adaptador LoRA requiere cargar el modelo base Qwen2.5-7B-Instruct en precisión completa o semi-precisión: aproximadamente 15 GB en FP16/BF16 y en torno a 8 GB en cuantización de 8 bits.
- GPU recomendadas: para el GGUF Q4_K_M, tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes; para el modelo base en FP16 se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, especialmente con el GGUF Q4_K_M en tarjetas de 8 GB o más; el adaptador sobre el modelo base en FP16 requiere al menos 16-24 GB.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxglobal-7b`), llama.cpp (`llama-cli` con el GGUF) y Transformers + PEFT para el adaptador. No se documentan vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxGlobal-7B | 7B (adaptador LoRA rango 8 sobre Qwen2.5-7B-Instruct) | No disponible | Apache-2.0 | Safetensors (adaptador) + GGUF Q4_K_M | Asistente multilingüe local-first de THOX |
| Qwen2.5-7B-Instruct | 7B | No disponible en la informacion proporcionada | Apache-2.0 | Safetensors, GGUF | Modelo base original de Alibaba Qwen; referencia directa |
| Mistral-7B-Instruct | 7B | No disponible en la informacion proporcionada | Apache-2.0 | Safetensors, GGUF | Alternativa densa de 7B con licencia permisiva |
| Llama-3.1-8B-Instruct | 8B | No disponible en la informacion proporcionada | Llama 3.1 Community License | Safetensors, GGUF | Alternativa de tamaño similar con licencia comunitaria |

## Limitaciones y advertencias

- La model card declara únicamente inglés en los metadatos, pese a describirse como multilingüe; el rendimiento real en otros idiomas no está documentado.
- No se publican datos de entrenamiento, composición del dataset ni evaluaciones, por lo que el impacto real del ajuste fino sobre el modelo base es desconocido.
- Riesgo de alucinación inherente a los modelos de 7B; no hay evaluaciones publicadas que lo cuantifiquen.
- La licencia Apache-2.0 cubre el fine-tune y las adiciones de THOX; conviene revisar los términos del modelo base Qwen2.5-7B-Instruct, también Apache-2.0, para uso comercial.
- La model card incluye notas del fundador sobre libertad creativa y ausencia de restricciones artificiales, lo que puede implicar un filtrado de seguridad limitado; debe evaluarse antes de desplegar en producción orientada a usuarios finales.
- El repositorio tiene solo 123 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso específicas del ajuste; cualquier uso agéntico depende de lo heredado del modelo base.
- El GGUF empaquetado es únicamente Q4_K_M; no se ofrecen otras cuantizaciones en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxGlobal-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Ficha de terceros (Essa Mamdani): https://essamamdani.com/ai-models/hf-thox-ai-thoxglobal-7b
