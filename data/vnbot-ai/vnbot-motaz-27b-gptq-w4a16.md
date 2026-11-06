# vnbot-ai/VNBot-MotaZ-27B-GPTQ-W4A16

## Resumen

VNBot-MotaZ-27B-GPTQ-W4A16 es una version cuantizada en 4 bits (GPTQ, esquema W4A16) del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). El modelo original es un transformer de 27.000 millones de parametros con arquitectura etiquetada como `qwen3_5` en Hugging Face, capaz de procesar entradas de texto e imagen (`image-text-to-text`) y orientado a tareas conversacionales en vietnamita e ingles. Esta variante reduce el peso de los pesos a aproximadamente 20,3 GB (frente a los ~54 GB del modelo en BF16), lo que la hace desplegable en GPUs de 24 GB con margen limitado.

El modelo resuelve el problema de servir un asistente multimodal de gran tamano en infraestructura moderada: la cuantizacion W4A16 mantiene las activaciones en 16 bits mientras comprime los pesos a 4 bits, preservando en gran medida la calidad del modelo base. La ventana de contexto declarada es de 262.144 tokens, un valor que lo posiciona en la liga de los modelos de contexto largo y que exige gestion cuidadosa de memoria KV durante la inferencia.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: modelos multimodales de escala media-alta, cuantizacion post-entrenamiento compatible con vLLM y licencia Apache-2.0 sin restricciones de uso comercial. La model card esta redactada principalmente en vietnamita, lo que sugiere un enfoque de producto regional con soporte bilingue vi/en.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5` en Hugging Face), entrada image-text-to-text |
| Parametros totales | 27.000 millones (27B, segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun model card) |
| Tipos de cuantizacion | GPTQ 4-bit, esquema W4A16 (pesos 4 bits, activaciones 16 bits); formato `compressed-tensors` |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados GPTQ, libreria transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`, lo que indica un transformer multimodal con torre de vision y proyector hacia el espacio de embeddings del modelo de lenguaje. El modelo base VNBot-MotaZ-27B no publica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento explicito.

Esta variante concreta es el resultado de una cuantizacion post-entrenamiento GPTQ en 4 bits con activaciones en 16 bits, empaquetada en el formato `compressed-tensors` que vLLM consume de forma nativa. El repositorio ocupa 5,4 GB en Hugging Face, aunque la model card declara un tamano de pesos de 20,3 GB; la diferencia sugiere que la cifra del repositorio corresponde a un subconjunto de ficheros o a una medicion parcial, y debe tratarse con cautela hasta verificar el contenido completo del repo.

## Capacidades

- Generacion de texto conversacional multi-turno en vietnamita e ingles.
- Comprension de imagenes combinadas con texto (image-text-to-text): descripcion, respuesta a preguntas visuales y conversacion sobre contenido grafico.
- Procesamiento de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Formato compatible con endpoints y con el servidor vLLM (`vllm serve ... --max-model-len 262144`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de atencion al cliente bilingue vi/en: el modelo puede sostener conversaciones multi-turno con historial largo gracias a su ventana de 262.144 tokens, manteniendo contexto de incidencias previas sin truncar.
- Analisis de documentos e imagenes escaneadas: al aceptar entradas image-text-to-text, puede extraer y comentar informacion de facturas, capturas o formularios presentados por el usuario en vietnamita o ingles.
- Despliegue en infraestructura con GPU de 24 GB: con pesos de ~20,3 GB en 4 bits, entra en una RTX 4090 o L40S si se reduce `--max-model-len` a valores moderados (por ejemplo, 8.192-16.384 tokens) para acomodar la cache KV.
- Servicio de inferencia con vLLM: la cuantizacion `compressed-tensors` es consumida de forma nativa por vLLM, lo que permite servir el modelo con batching continuo y endpoints compatibles con la API de OpenAI.
- Traduccion y localizacion vi/en: el perfil bilingue declarado lo hace util para tareas de traduccion asistida y adaptacion de contenido entre ambos idiomas.
- Prototipado de producto para el mercado vietnamita: al ser Apache-2.0, permite iterar en productos comerciales sin obligaciones de atribucion mas alla de las habituales de la licencia.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de GPTQ W4A16 frente al modelo base de 27B en tareas multimodales y de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,3 GB solo para pesos; se necesita margen adicional para cache KV, activaciones y buffers de vision. Con contexto corto (8K-16K tokens) es razonable apuntar a 24-32 GB; para contextos cercanos a 262.144 tokens se requiere hardware de 80 GB o multi-GPU.
- GPU recomendadas: A100 80 GB o H100 80 GB para explotar la ventana completa de contexto; L40S 48 GB o RTX 6000 Ada 48 GB como punto intermedio.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB con `--max-model-len` reducido; en RTX 3090 24 GB de forma ajustada. No cabe en GPUs de 16 GB o menos sin cuantizacion adicional o descarga a CPU.
- Opciones de despliegue: vLLM es la via documentada por el autor (`vllm serve vnbot-ai/VNBot-MotaZ-27B-GPTQ-W4A16 --max-model-len 262144`). Compatibilidad con llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada (el formato GPTQ/compressed-tensors no es el habitual de llama.cpp u Ollama).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-GPTQ-W4A16 | 27B | 262.144 | Texto + imagen | Apache-2.0 | Hugging Face (transformers, vLLM) |
| VNBot-MotaZ-27B (base) | 27B | no disponible | Texto + imagen | Apache-2.0 | Hugging Face |
| Alternativas de 27B-30B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos competidores que permitan una comparativa cuantitativa fiable. La unica comparacion documentada es con el propio modelo base, del que esta variante difiere exclusivamente por la cuantizacion GPTQ W4A16.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente para vietnamita e ingles, el rendimiento en otros idiomas sera probablemente degradado.
- Riesgo de alucinacion: no cuantificado; no hay benchmarks ni evaluaciones publicadas que permitan estimar la fiabilidad factual.
- Limitaciones de contexto: la ventana de 262.144 tokens exige memoria KV considerable; en GPUs de 24 GB habra que reducir `--max-model-len` y se perdera parte de la ventaja de contexto largo.
- Idiomas: solo vi y en declarados; no hay evidencia de soporte para castellano u otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin regalias, pero exige conservar los ficheros `LICENSE` y `NOTICE` mencionados en la model card.
- Cuantizacion: la perdida de calidad introducida por GPTQ W4A16 no esta medida en la informacion disponible; conviene validar en el dominio de uso antes de produccion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-06), sin historial de validacion por la comunidad.
- Discrepancia de tamanos: el repositorio declara 5,4 GB frente a los 20,3 GB indicados en la model card; verificar el contenido real antes del despliegue.
- Compatibilidad: el formato GPTQ/`compressed-tensors` esta pensado para vLLM y transformers; otras herramientas de inferencia pueden no soportarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-GPTQ-W4A16
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
