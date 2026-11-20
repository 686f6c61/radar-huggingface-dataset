# usman-heracles/DeepSeek-V4.1-Flash-1017-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated es una derivación del modelo DeepSeek-V4.1-Flash-1017 en la que se ha eliminado quirúrgicamente el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica el usuario usman-heracles, no el desarrollador original del modelo base, y mantiene intactos el formato, la disposición de pesos y la cuantización FP8 del checkpoint de origen, por lo que carga en cualquier infraestructura donde cargue el original. El checkpoint contiene 763.205.315.794 parámetros en safetensors y el repositorio ocupa 510,3 GB.

El modelo base es un DeepSeek de la familia V4.1 en variante "Flash", con arquitectura Mixture of Experts (MoE) que incluye expertos enrutados, expertos compartidos (shared experts), tablas Engram y capas DSpark/MTP en los índices 40 a 42. La intervención del autor se limita a proyectar un subespacio de rechazo de rango 2 fuera de las escrituras al residual stream de las 40 capas principales, en los tensores `attn.wo_b` y `ffn.shared_experts.w2`, con una intensidad distinta por capa obtenida mediante búsqueda multiobjetivo.

La relevancia de esta ficha es doble: por un lado documenta una técnica de abliteración más sofisticada que el enfoque clásico de dirección única, al tratar por separado el modo chat y el modo think; por otro, advierte de que el resultado es un modelo que cumplirá peticiones dañinas, con licencia MIT y sin filtros de seguridad, lo que exige controles externos si se despliega en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con expertos compartidos, tablas Engram y capas DSpark/MTP (capas 40-42); familia deepseek_v41 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint nativo, block scales originales); GGUF Q8_0; LoRA de ablación en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint FP8 parcheado), GGUF (Q8_0 y LoRA `abliteration-lora.gguf`), NPZ (`abliteration-edit.npz`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia DeepSeek V4.1 en variante Flash, con 763.205 millones de parámetros totales y un diseño que separa expertos enrutados de expertos compartidos. Incorpora además tablas Engram y capas DSpark/MTP en las posiciones 40 a 42, presumiblemente orientadas a decodificación especulativa o predicción multi-token, aunque la información disponible no detalla su función exacta. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo original.

La modificación de esta variante es una ablación direccional de rango 2. El autor midió direcciones de rechazo por separado para prompts de chat y de modo think en cada capa, sobre el GGUF Q8_0, y construyó un subespacio a partir de los principales vectores singulares del conjunto de direcciones. Ese subespacio se proyectó fuera de las escrituras al residual stream de las 40 capas principales (`attn.wo_b` y `ffn.shared_experts.w2`) con una intensidad por capa calculada mediante una búsqueda multiobjetivo que minimiza rechazos manteniendo baja la KL del primer token en prompts inocuos. Los tensores editados se recuantizaron a FP8 con sus block scales originales usando redondeo estocástico para evitar que el redondeo deshiciera la edición. Los expertos enrutados, embeddings, tablas Engram y capas DSpark/MTP quedan bit a bit idénticos al original.

## Capacidades

- Generación de texto y razonamiento en modo chat y en modo think (razonamiento explícito).
- Eliminación del comportamiento de rechazo: el modelo acepta peticiones que el original rechazaría, tanto en chat como en modo think.
- Conservación del resto de capacidades del modelo base, al no haberse alterado expertos enrutados, embeddings ni capas MTP.
- Compatibilidad de carga idéntica al original: mismos ficheros, mismo índice y mismo layout FP8.
- Aplicación de la misma edición a los GGUF originales mediante una LoRA de rango 2 (`abliteration-lora.gguf`) o mediante la base del subespacio y las escalas por capa (`abliteration-edit.npz`).
- Soporte de tool calling, function calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el par original/abliterado permite medir cuánto del comportamiento de rechazo es separable linealmente del resto de capacidades, comparando tasas de rechazo y KL en prompts inocuos con la metodología descrita por el autor.
- Red teaming controlado: desplegar el modelo en un entorno aislado para generar respuestas a peticiones dañinas y evaluar clasificadores, filtros y políticas de moderación antes de producción.
- Estudio de modos de razonamiento: al conservarse el modo think, sirve para analizar cómo el razonamiento intermedio se desvía de la petición (el autor cita el caso de "bomba con objetos domésticos" que deriva en bomba de baño), lo que informa sobre la robustez de las cadenas de razonamiento.
- Replicación de la técnica de ablación: el fichero `abliteration-edit.npz` documenta la base `Q` y las escalas por capa, de modo que otros equipos pueden reproducir la edición sobre checkpoints propios o adaptarla a otros modelos DeepSeek.
- Evaluación de cuantización: al mantener el layout FP8 con block scales originales y ofrecer un GGUF Q8_0, permite estudiar la interacción entre cuantización, redondeo estocástico y edición de pesos.
- Despliegue en pipelines de generación sin restricciones de contenido: para tareas creativas, literarias o de simulación donde los filtros de rechazo del modelo base interrumpen la generación, siempre con moderación externa y responsabilidad del operador.

## Benchmarks y rendimiento

El autor publica resultados propios sobre el GGUF Q8_0 con decodificación greedy, con 100 prompts dañinos reservados y 384 tokens generados por prompt:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 97 | 4 |
| Rechazos en modo think, cabezas de razonamiento (/100) | 98 | 9 |
| KL del primer token en prompts inocuos | 0 | 0,067 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte de que la cifra de KL incluye un pequeño ruido de base procedente de la inferencia por lotes.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 510,3 GB en FP8, por lo que la inferencia en FP8 requiere del orden de 510 GB de memoria, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: para FP8 nativo, múltiples aceleradores de 80 GB (H100, H200, A100 80 GB) en configuración multi-GPU; no cabe en una GPU consumer.
- GPU consumer: no es viable en RTX 4090 (24 GB) ni en configuraciones de 48 GB; requeriría cuantizaciones muy agresivas no publicadas en este repositorio.
- Opciones de despliegue: el autor documenta `llama-server` de llama.cpp para el GGUF Q8_0 con la LoRA de ablación (`--lora abliteration-lora.gguf`); para el checkpoint safetensors FP8 se necesitan frameworks con soporte de FP8 y paralelismo de tensor, como vLLM o TGI, aunque la información disponible no confirma compatibilidad explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rechazos (chat) | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated | 763,2 B | no disponible | 4/100 | MIT | safetensors FP8, GGUF |
| DeepSeek-V4.1-Flash-1017 (original) | 763,2 B | no disponible | 97/100 | no disponible | safetensors FP8, GGUF |
| Variante abliterada de MrFakeName | no disponible | no disponible | no disponible (comparada en el hilo de Reddit citado) | no disponible | no disponible |

La comparación con otras familias de modelos abliterados de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo cumple peticiones dañinas de forma deliberada; el autor declara explícitamente que la responsabilidad de uso recae en el operador.
- La ablación no es perfecta: quedan aproximadamente 4 rechazos por cada 100 en chat y 9 por cada 100 en modo think, y algunas respuestas de modo think siguen desviándose de la petición.
- La edición introduce una divergencia de 0,067 en la KL del primer token sobre prompts inocuos, lo que puede alterar ligeramente el comportamiento en tareas benignas.
- El modo think, con solo 384 tokens generados, a menudo no completa el razonamiento; las evaluaciones se hicieron sobre el texto de razonamiento parcial, lo que limita la extrapolación a generaciones largas.
- No hay información sobre sesgos, idiomas soportados, longitud de contexto ni rendimiento en benchmarks estándar, lo que impide evaluar regresiones fuera del eje de rechazo.
- Licencia MIT: permite uso comercial, pero no exime de las obligaciones legales y regulatorias aplicables al contenido generado.
- El modelo es una derivación de terceros, no oficial; el autor del modelo base no respalda esta versión.
- El despliegue requiere infraestructura multi-GPU de alta memoria; no es apto para entornos con GPU consumer.
- No se han publicado evaluaciones independientes de seguridad más allá de las métricas del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usman-heracles/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Hilo de comparación en Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1xyv1oc/deepseek_v41_flash_1017_vs_mrfakename_abliterated/
- Discord del autor: https://discord.com/invite/foss
