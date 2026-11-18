# thiennhat/ALLIE.1.0-2b-FP16

## Resumen

ALLIE.1.0-2b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B, publicado por el usuario thiennhat en Hugging Face. Se distribuye con licencia Apache 2.0 y en dos formatos: pesos completos en FP16 con Safetensors (4,43 GB) y una cuantizacion Q8_0 en GGUF (2,01 GB) lista para ejecutarse con Ollama o llama.cpp. El adaptador del ajuste fino ya esta fusionado en los pesos, por lo que no requiere pasos adicionales de merge.

El modelo cuenta con 2.213.241.664 parametros (aproximadamente 2,2 mil millones) y hereda la arquitectura del Qwen3.5-2B base, etiquetada en Hugging Face con el tag `qwen3_5`. No se especifican en la informacion disponible la longitud de contexto, los idiomas soportados ni los detalles del dataset de ajuste.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, de licencia permisiva y con pesos en formato abierto, adecuado para experimentacion local en hardware de consumo. El propio autor advierte que solo se ha validado la carga y la generacion de texto basica, y que la calidad de las respuestas y la entrada de imagen estan pendientes de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B, tag `qwen3_5`) |
| Parametros totales | 2.213.241.664 (~2,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (Safetensors) y Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-2B, un transformer decoder-only de aproximadamente 2,2 mil millones de parametros. El autor indica que el adaptador del ajuste fino esta fusionado directamente en los pesos publicados, de modo que el checkpoint FP16 es autocontenido y puede cargarse con Transformers sin capas adicionales. El tag `qwen3_5` en Hugging Face confirma la familia arquitectonica, aunque no se detallan en la informacion disponible variantes como atencion lineal, decodificacion especulativa o modulos MoE.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documenta la receta de cuantizacion mas alla de la conversion estandar de Safetensors a GGUF F16 y posterior cuantizacion a Q8_0. La unica validacion reportada por el autor es una prueba basica de carga y generacion de texto.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline declarado apuntan a uso en dialogos de chat.
- Inferencia local: los pesos GGUF Q8_0 permiten ejecucion en CPU y GPU de gama baja mediante llama.cpp u Ollama.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- Posible soporte de vision: el autor menciona una evaluacion pendiente de "image input", lo que sugiere que el modelo base o el fine-tune podrian aceptar imagenes, aunque no se confirma ni se documenta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de chatbots locales: con 2,2 B de parametros y pesos Q8_0 de 2,01 GB, el modelo cabe en un portatil con 8 GB de RAM y permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Pruebas de integracion con Ollama o llama.cpp: el GGUF listo para usar simplifica la validacion de pipelines de inferencia antes de escalar a modelos mayores.
- Educacion e investigacion: su tamano reducido y licencia Apache 2.0 lo hacen adecuado para estudiar tecnicas de fine-tuning y cuantizacion sobre un modelo base conocido.
- Generacion de texto asistida en entornos con recursos limitados: tareas de resumen, reescritura o respuestas cortas donde no se requiere un modelo de gran escala.
- Base para nuevos fine-tunes: al estar fusionado el adaptador y publicados los pesos FP16, sirve como punto de partida para ajustes especificos de dominio.
- Despliegue en Inference Endpoints: el tag `endpoints_compatible` permite probar el modelo en la infraestructura gestionada de Hugging Face con fines de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta que el modelo supero una prueba basica de carga y generacion de texto, sin metricas cuantitativas de calidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para FP16: en torno a 4,5-5 GB considerando pesos (4,43 GB) y overhead de activaciones y KV cache.
- VRAM estimada para Q8_0: en torno a 2,5-3 GB, lo que permite ejecucion en GPUs de 4 GB o incluso en CPU con RAM suficiente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para FP16; cualquier GPU con 4 GB o mas para Q8_0.
- Cabe en GPU de consumo: si, tanto en FP16 como en Q8_0 en la mayoria de tarjetas actuales de gama media.
- Opciones de despliegue: Transformers (FP16), llama.cpp y Ollama (GGUF Q8_0), y potencialmente Text Generation Inference y vLLM para FP16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ALLIE.1.0-2b | ~2,2 B | no disponible | Apache 2.0 | Safetensors FP16, GGUF Q8_0 | Fine-tune de Qwen3.5-2B, validacion minima |
| Qwen3.5-2B (base) | ~2 B | no disponible | no disponible | Safetensors | Modelo base del que deriva ALLIE |
| Qwen2.5-1.5B | ~1,5 B | 32 768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Safetensors, GGUF | Alternativa de tamano similar con amplia adopcion |
| Llama 3.2 1B | ~1,2 B | 128 000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | Safetensors, GGUF | Menor, pero con contexto mayor y ecosistema consolidado |

La comparativa con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoria; no se dispone de datos de rendimiento de ALLIE.1.0-2b para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Validacion insuficiente: el autor solo confirma que el modelo carga y genera texto; la calidad de las respuestas no ha sido evaluada.
- Entrada de imagen sin verificar: se menciona pero no se documenta ni se valida.
- Sin datos de sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o alucinacion.
- Contexto e idiomas desconocidos: no se especifica la ventana de contexto ni la cobertura linguistica, lo que impide garantizar un comportamiento multilingue.
- Riesgo de alucinacion: inherente a modelos de este tamano y sin evaluacion especifica; no recomendable para produccion sin validacion adicional.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3.5-2B y de los datos de ajuste, no documentadas aqui.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thiennhat/ALLIE.1.0-2b-FP16
- Pesos FP16 (Safetensors): https://huggingface.co/thiennhat/ALLIE.1.0-2b-FP16/tree/main
- GGUF Q8_0: https://huggingface.co/thiennhat/ALLIE.1.0-2b-FP16/resolve/main/ALLIE.1.0-2b-Q8_0.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
