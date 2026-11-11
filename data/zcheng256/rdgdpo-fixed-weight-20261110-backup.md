# zcheng256/rdgdpo-fixed-weight-20261110-backup

## Resumen

RDGDPO fixed length weight checkpoints es una coleccion de checkpoints de investigacion derivados de DeepSeek-R1-Distill-Qwen-1.5B, publicados por el usuario zcheng256 en Hugging Face. No se trata de un modelo final pulido, sino de un artefacto experimental de aprendizaje por refuerzo orientado a matematicas: tres ejecuciones controladas en las que se varia el peso de una recompensa de longitud unilateral (valores 2, 3 y 5) manteniendo fija la recompensa de correccion en 1. Los checkpoints se guardan cada diez pasos de entrenamiento hasta el paso 100.

El modelo base es DeepSeek-R1-Distill-Qwen-1.5B, un destilado de 1.500 millones de parametros construido sobre la arquitectura Qwen2.5-Math-1.5B, por lo que hereda el diseño transformer decoder-only de Qwen2.5 con atencion causal estandar y tokenizador propio de Qwen. Este repositorio anade pesos entrenados con un esquema de RL (metodo RDGDPO, segun el nombre del repo) que penaliza o premia la longitud de las respuestas de razonamiento, un area de interes creciente porque la longitud de la cadena de pensamiento afecta directamente al coste de inferencia.

La relevancia de esta publicacion es doble: por un lado, ofrece checkpoints intermedios verificables (con manifiestos de pesos y hashes SHA-256) para estudiar como evoluciona el comportamiento del modelo al ajustar la recompensa de longitud; por otro, documenta el proceso de reanudacion del entrenamiento con estado FSDP, optimizador, RNG y scheduler. El tamano del repositorio (177,7 GB) refleja que incluye no solo pesos sino tambien estados completos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Math-1.5B via DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT (con avisos upstream Apache-2.0 de Qwen2.5-Math-1.5B) |
| Formato de pesos | safetensors (carpetas `actor/huggingface/`), mas estado FSDP y `data.pt` para reanudacion |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 1.5B parametros procedente de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez deriva de Qwen2.5-Math-1.5B (licencia Apache-2.0). Sobre esa base, el autor ha aplicado un proceso de aprendizaje por refuerzo identificado como RDGDPO, con una recompensa compuesta: una recompensa de correccion con peso fijo de 1 y una recompensa de longitud unilateral cuyos pesos varian entre las tres ejecuciones (2, 3 y 5). El objetivo parece ser estudiar el efecto de premiar respuestas mas cortas o mas largas sobre el comportamiento de razonamiento matematico.

Los checkpoints se guardan cada diez pasos hasta el paso 100, lo que permite trazar la evolucion del modelo durante el entrenamiento. El repositorio incluye, ademas de los pesos en formato Transformers, el estado completo de entrenamiento (modelo FSDP, optimizador, RNG y scheduler) y el fichero `data.pt` para reanudar exactamente la ejecucion original de ocho rangos. Los manifiestos bajo `backup-manifests/` permiten verificar integridad mediante tamanos de fichero y hashes SHA-256, aunque el autor advierte de que un manifiesto de pesos puede aparecer antes de que termine la subida del estado de reanudacion.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredadas del destilado de DeepSeek-R1 sobre Qwen2.5-Math.
- Resolucion de problemas matematicos, dado el origen Qwen2.5-Math y la recompensa de correccion del entrenamiento RL.
- Razonamiento de cadena de pensamiento (estilo R1), modulable en longitud segun el peso de la recompensa de longitud de cada ejecucion.
- Evaluacion comparativa de tres variantes de politica (pesos 2, 3 y 5) sobre el mismo prompt.
- Reanudacion exacta de entrenamiento RL con estado FSDP, optimizador, RNG y scheduler.
- Verificacion de integridad de checkpoints mediante manifiestos con SHA-256.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el razonamiento multi-paso es inherente al estilo R1 pero no se detalla en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Investigacion sobre recompensas de longitud en RL: el repositorio permite comparar directamente tres pesos de recompensa (2, 3, 5) sobre el mismo modelo base y el mismo dataset, aislando el efecto de la longitud en la calidad del razonamiento matematico.
- Estudio de eficiencia en inferencia: analizar si las variantes con mayor penalizacion de longitud mantienen la precision en problemas matematicos con cadenas de pensamiento mas cortas, lo que reduciria coste de tokens en produccion.
- Reproducibilidad de experimentos RL: los estados FSDP, optimizador, RNG y scheduler junto con `data.pt` permiten reanudar exactamente el entrenamiento de ocho rangos, util para replicar resultados o continuar el entrenamiento desde el paso 100.
- Evaluacion de checkpoints intermedios: los guardados cada diez pasos hasta el paso 100 permiten trazar curvas de aprendizaje y detectar el punto en que la recompensa de longitud empieza a degradar la correccion.
- Benchmarking de destilados pequenos en matematicas: el modelo de 1.5B sirve como referencia ligera para comparar con otros destilados de R1 en tareas de razonamiento matematico con recursos limitados.
- Auditoria de integridad de artefactos: los manifiestos con SHA-256 y verificacion de tamanos son utiles como ejemplo de buenas practicas para publicar checkpoints de entrenamiento de gran tamano (177,7 GB).
- Fine-tuning posterior: al estar en formato Transformers estandar y licencia MIT, los pesos `actor/huggingface/` pueden reutilizarse como punto de partida para otros ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo denso de 1.5B en FP16 se situa tipicamente en torno a 3-4 GB de pesos mas overhead de activaciones y KV cache, pero el autor no publica cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la model card; por tamano (1.5B) es plausible en GPUs consumer modernas, pero no hay dato oficial.
- Opciones de despliegue: los pesos estan en formato Transformers (`actor/huggingface/`), por lo que son compatibles con el ecosistema Hugging Face (transformers, vLLM, TGI). No se documentan configuraciones especificas.
- Reanudacion de entrenamiento: requiere el setup original de ocho rangos con FSDP; el repositorio incluye el estado necesario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RDGDPO fixed length weight checkpoints (este) | 1.5B | no disponible | Destilado R1 + RL con recompensa de longitud | MIT | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible en esta ficha | Destilado de R1 sobre Qwen2.5-Math | MIT | Hugging Face (modelo base publico) |
| Qwen2.5-Math-1.5B | 1.5B | no disponible en esta ficha | Modelo matematico base | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: son checkpoints intermedios de un experimento RL, no una version final validada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por terceros.
- No se publican resultados de benchmarks, por lo que el rendimiento real en matematicas o razonamiento no esta cuantificado.
- La model card no especifica idiomas soportados ni longitud de contexto; no debe asumirse ningun valor.
- El autor advierte de posibles subidas incompletas: un manifiesto de pesos puede aparecer antes de que termine la subida del estado de reanudacion, por lo que conviene verificar hashes SHA-256 antes de usar los checkpoints.
- El entrenamiento requiere el setup original de ocho rangos con FSDP para reanudarse correctamente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documenta mitigacion especifica en la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT en los pesos, pero con avisos upstream Apache-2.0 de Qwen2.5-Math-1.5B que deben respetarse (ver LICENSE y LICENSE-QWEN en el repositorio).
- El nombre del repositorio incluye la fecha "20261110" y el prefijo "backup", lo que sugiere que es una copia de seguridad de un experimento, no una publicacion curada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zcheng256/rdgdpo-fixed-weight-20261110-backup
- Modelo base DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo upstream Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
