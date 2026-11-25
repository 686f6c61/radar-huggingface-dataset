# ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8

## Resumen
Qwen3.8-Flash-Next-mlx-4bit-e4o8 es una cuantizacion mixta del modelo Qwen/Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario ToPo-ToPo para su uso con la libreria MLX de Apple. El modelo original es multimodal (image-text-to-text) y esta orientado a conversacion, razonamiento y uso de herramientas. Esta version aplica 4 bits a los expertos enrutados de la arquitectura MoE y mantiene en 8 bits el resto de capas lineales, con el objetivo de conservar la calidad en el uso de herramientas a costa de un mayor tamano.

El resultado pesa 130 GiB (6,289 bits por peso) frente a los 104 GiB de la cuantizacion uniforme a 4 bits y los 186 GiB de la version a 8 bits. La motivacion declarada por el autor es que la cuantizacion uniforme a 4 bits degrada notablemente la capacidad de invocar herramientas correctamente, mientras que esta mezcla recupera e incluso supera a la version de 8 bits en las pruebas de function calling realizadas.

Es relevante para desarrolladores que trabajan en Mac con silicio de Apple y necesitan ejecutar localmente un modelo multimodal de gran tamano con uso fiable de herramientas, sin depender de infraestructura en la nube. La ficha se basa exclusivamente en la informacion disponible en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), segun el modelo base Qwen/Qwen3.8-Flash-Next; detalles completos no disponibles |
| Parametros totales | 177.392.830.611 (~177,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afina: expertos enrutados a 4 bits (group_size 32), resto de capas lineales a 8 bits (group_size 32), router a 8 bits (group_size 64), modulo de imagen en bf16 sin cuantizar |
| Idiomas soportados | no disponible (la evaluacion del autor cubre japones e ingles) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos con componentes multimodales, tal como indica la etiqueta de pipeline image-text-to-text. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion principal de esta publicacion es la estrategia de cuantizacion. Se partio de la version a 8 bits (revision ac6a8c8) porque el checkpoint en bf16 ocupa 355 GB y no era desplegable en el hardware del autor. Los 144 modulos de expertos enrutados (`switch_mlp.{gate,up,down}_proj`) se desquantizaron desde 8 bits y se volvieron a cuantizar a 4 bits con group_size 32 mediante mlx 0.32.3; el resto de pesos se copiaron intactos desde la version de 8 bits. El paso intermedio por 8 bits introduce un doble redondeo cuyo error adicional, medido sobre 64 expertos de la capa 20 y sus tres proyecciones, es de un +0,3% respecto a cuantizar directamente desde bf16. El modulo de vision se mantiene en bf16. El autor publica ademas un drafter MTP en bf16 para decodificacion especulativa, aunque en esta cuantizacion apenas aporta mejora de velocidad.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text), con el modulo de vision sin cuantizar.
- Invocacion de herramientas (tool calling / function calling), con un rendimiento medido del 99% en japones y del 98% en ingles en las pruebas del autor.
- Formato correcto de llamada a herramientas en ingles en el 100% de los casos evaluados.
- Razonamiento y respuesta a preguntas breves en japones e ingles (100% de acierto en el probe de 34 preguntas).
- Soporte de decodificacion especulativa mediante un drafter MTP externo.
- Capacidades multilingues adicionales: no disponibles.

## Casos de uso
- Asistentes conversacionales locales en Mac: el modelo puede mantener dialogos multi-turno y generar respuestas en un equipo con silicio de Apple, sin enviar datos a servicios externos, gracias a su ejecucion mediante MLX.
- Agentes con uso de herramientas en produccion interna: la alta tasa de acierto en function calling (98-99%) lo hace adecuado para orquestar llamadas a APIs, lectura de ficheros de configuracion y operaciones encadenadas de varios pasos.
- Automatizacion de tareas de escritorio con entrada visual: al aceptar imagenes, puede describir capturas de pantalla o documentos escaneados y actuar en consecuencia dentro de un flujo de agente.
- Prototipado de pipelines multimodales: util para investigadores que necesitan validar arquitecturas image-text-to-text de gran escala en hardware de consumo profesional antes de desplegar en servidores.
- Evaluacion comparativa de estrategias de cuantizacion: sirve como referencia practica de cuantizacion mixta (expertos a 4 bits, resto a 8 bits) para estudiar el equilibrio entre tamano, velocidad y calidad en modelos MoE.
- Sustitucion de la version a 8 bits cuando la memoria es limitada: con 130 GiB frente a 186 GiB, permite ejecutar el modelo en configuraciones de memoria unificada mas ajustadas manteniendo el rendimiento en herramientas.
- Generacion de codigo asistida con contexto visual: puede recibir diagramas o capturas y producir explicaciones o fragmentos de codigo, aunque no se han publicado benchmarks especificos de codigo.

## Benchmarks y rendimiento
Los datos proceden de la evaluacion del autor: modo de pensamiento desactivado, temperatura 0,6, top_p 0,95, top_k 20, cinco repeticiones por caso, servidor de mlx-vlm 0.7.11 sin MTP. El probe consta de 34 preguntas cortas en japones e ingles; las pruebas de herramientas cubren 20 escenarios en cada idioma.

| Metrica | 8 bits | 4 bits uniforme | e4o8 (esta version) |
|---|---|---|---|
| Acierto en probe | 100% | 100% | 100% |
| Herramientas en japones | 97% | 94% | 99% |
| Herramientas en ingles | 88% | 80% | 98% |
| Formato de llamada correcto (ingles) | 100% | 95% | 100% |
| Tamano de pesos | 186 GiB | 104 GiB | 130 GiB |
| Velocidad sin MTP | no disponible | 46,6 tok/s | 38,5 tok/s |
| Velocidad con MTP | no disponible | 48,7 tok/s | 39,0 tok/s |

Las velocidades se midieron en un Apple M3 Ultra con temperatura 0 y 400 tokens de salida sobre tres preguntas. El autor senala que no ha probado conversaciones largas ni entradas de imagen, y que desconoce por que la version de 8 bits rinde peor que e4o8 en herramientas pese a compartir los pesos no expertos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- Memoria: 130 GiB de pesos mas varios GB adicionales para el servidor de modelo, segun el autor. Se recomienda un minimo de 140-150 GB de memoria unificada.
- Hardware objetivo: equipos Apple con silicio (el autor uso un M3 Ultra). No es compatible de forma nativa con GPU NVIDIA o AMD, ya que el formato es MLX.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional (RTX 4090 con 24 GB, etc.). Solo es viable en configuraciones de memoria unificada de gama alta de Apple.
- Despliegue: mlx-vlm (version 0.7.11 o superior para el modelo; 0.7.0 o superior para el drafter MTP). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este formato.
- Throughput: 38,5 tok/s sin MTP y 39,0 tok/s con MTP en M3 Ultra, segun el autor.
- Decodificacion especulativa: drafter MTP en bf16 disponible en un repositorio separado, con mejora marginal en esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano de pesos | Herramientas (ingles) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-mlx-4bit-e4o8 (esta version) | ~177,4 mil millones | 130 GiB | 98% | qwen-community-1.0 | MLX safetensors |
| Qwen3.8-Flash-Next-mlx-4bit (uniforme) | ~177,4 mil millones | 104 GiB | 80% | qwen-community-1.0 | MLX safetensors |
| Qwen3.8-Flash-Next-mlx-8bit | ~177,4 mil millones | 186 GiB | 88% | qwen-community-1.0 | MLX safetensors |
| Qwen/Qwen3.8-Flash-Next (bf16 original) | ~177,4 mil millones | 355 GB | no disponible | qwen-community-1.0 | safetensors |

Las tres variantes MLX comparten el modelo base y solo difieren en la estrategia de cuantizacion. No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias
- La evaluacion se limita a 34 preguntas y 40 escenarios de herramientas en japones e ingles; no se han probado conversaciones largas ni entradas de imagen, por lo que el rendimiento en esos casos es desconocido.
- El doble redondeo (bf16 a 8 bits y luego a 4 bits en los expertos) introduce un error adicional del +0,3% respecto a cuantizar directamente desde bf16.
- La cuantizacion a 4 bits de los expertos puede degradar tareas distintas al uso de herramientas; no hay datos al respecto.
- El autor no explica por que la version de 8 bits rinde peor en herramientas que esta mezcla, lo que sugiere variabilidad o sensibilidad al formato de cuantizacion no caracterizada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados oficialmente: no disponibles; la evaluacion solo cubre japones e ingles.
- Licencia qwen-community-1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva.
- Requiere hardware Apple con memoria unificada muy alta; no es desplegable en GPU NVIDIA convencionales ni en entornos cloud estandar sin soporte MLX.
- El uso del drafter MTP apenas mejora la velocidad en esta cuantizacion (de 38,5 a 39,0 tok/s).

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Version uniforme a 4 bits: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit
- Version a 8 bits: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit
- Drafter MTP en bf16: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-MTP-bf16
