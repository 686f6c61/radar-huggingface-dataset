# stbenjam/qwen3-4b-claudish-gguf

## Resumen

stbenjam/qwen3-4b-claudish-gguf es un fine-tuning experimental de Qwen3-4B-Instruct-2507 publicado por el usuario stbenjam, orientado a transferencia de estilo: el objetivo declarado es imitar el registro y las muletillas de los asistentes conversacionales tipo Claude mediante un adaptador LoRA. Se distribuye como un GGUF ya fusionado en cuantización Q4_K_M de aproximadamente 2,50 GB, ejecutable con Ollama sin adaptadores ni instalaciones adicionales.

Se trata de un experimento educativo y de parodia, no de un modelo de produccion. La propia model card advierte de que "el objetivo de entrenamiento no se ha alcanzado" y de que las respuestas pueden ser verbosas y reconocibles al tiempo que incorrectas. El checkpoint publicado es la actualizacion 40 de un LoRA de rango 16 entrenado localmente en un Mac con M4 Pro y 48 GB de memoria.

Su relevancia practica es acotada: no contiene pesos de Claude, no esta afiliado a Anthropic ni a Qwen, y el autor no lo presenta como una mejora demostrada frente al demo original de 0,6B. Interesa como caso de estudio de post-entrenamiento ligero (302 filas de entrenamiento, 1,966 millones de parametros entrenados) y como ilustracion de los limites del ajuste fino de estilo sobre una base ya cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3 heredada del modelo base) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso); el adaptador LoRA entrenado tiene 1.966.000 parametros |
| Longitud de contexto | no disponible en la ficha; el entrenamiento LoRA uso secuencias de 2.048 tokens. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos, dato no verificado para este fine-tuning |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada para esta version 4B); el adaptador MLX usa 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); adaptador LoRA en MLX publicado por separado |

## Arquitectura y entrenamiento

La base es la conversion MLX de 4 bits fijada de Qwen3-4B-Instruct-2507, un transformer denso. El post-entrenamiento emplea un LoRA de rango 16 que ajusta las matrices de atencion query y value de las 12 capas finales, con batch size 2, learning rate 0,00001, escala LoRA 8 y limite de secuencia de 2.048 tokens. El checkpoint seleccionado es la actualizacion 40 de 1.966.000 parametros entrenados. No se reporta RLHF ni DPO.

El corpus combina 256 respuestas de instruccion publicas y filtradas con 23 respuestas de parodia originales ponderadas al doble: 302 filas y 279 ejemplos unicos, procedentes del dataset angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k (licencia Apache-2.0 declarada). La exportacion fusiono el adaptador sobre una copia dequantizada del base MLX ya cuantizado, genero un intermedio F16 local y lo requantizo a Q4_K_M; el autor advierte de que la dequantizacion no recupera la precision descartada previamente. La plantilla Jinja embebida y la configuracion suplementaria de Ollama conservan unicamente el ultimo mensaje de usuario y el system prompt, y el prefijo de generacion no contiene etiquetas de razonamiento (thinking).

## Capacidades

- Generacion de texto conversacional en ingles.
- Transferencia de estilo: reproduce un registro verboso y con muletillas propias de asistentes tipo Claude cuando se le aplica un prompt de estilo explicito y exagerado (por ejemplo, prosa amanerada, respuestas largas, contrastes enfaticos).
- Sin modo de razonamiento explicito: el prefijo de generacion no incluye etiquetas de thinking.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision ni de audio.
- Multilingue: unicamente ingles.
- Contexto fresco por diseno: la configuracion descarta los mensajes anteriores, por lo que no mantiene conversaciones multi-turno con el template por defecto.

## Casos de uso

- Investigacion sobre transferencia de estilo: sirve como punto de partida reproducible para medir hasta que punto un LoRA de rango 16 sobre 279 ejemplos unicos desplaza el registro de un modelo base, usando el adaptador MLX publicado por separado para comparar con y sin ajuste.
- Docencia y material formativo: ilustra de forma tangible los limites del fine-tuning ligero, la diferencia entre imitar un estilo y mejorar la correccion, y el efecto de la requantizacion sobre una base ya cuantizada.
- Experimentacion con pipelines Ollama/GGUF: al ser un GGUF fusionado de 2,50 GB con plantilla Jinja embebida, permite validar configuraciones de system prompt, truncado de historial y comportamiento en contexto fresco sin infraestructura adicional.
- Generacion de prosa parodica o satirica: con el prompt de estilo adecuado produce textos largos con tono afectado, util para prototipos de contenido humoristico controlado y siempre con revision humana.
- Pruebas comparativas de checkpoints: el repositorio registra el checkpoint seleccionado y su SHA-256, lo que facilita experimentos de trazabilidad sobre que actualizacion del entrenamiento rinde mejor cualitativamente.
- Demostraciones locales en hardware modesto: con 2,50 GB de pesos puede ejecutarse en portatiles y equipos de gama media para charlas o talleres sobre despliegue local de LLM.
- Analisis de derivas de estilo: util para estudiar fenomenos como la repeticion de frases favoritas y el exceso de explicacion, documentados por el autor en checkpoints mas avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que las cifras de benchmark de MLX no equivalen a un benchmark de GGUF, ya que la cuantizacion y el runtime de inferencia pueden alterar respuestas concretas. El autor separa la revision cualitativa de respuestas de las metricas de longitud y frecuencia de frases en su repositorio de resultados, pero no se proporcionan valores numericos en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 3-4 GB considerando los 2,50 GB de pesos mas el overhead de contexto y runtime; cifra estimada, no publicada por el autor.
- VRAM estimada en FP16 sobre la base de 4B: aproximadamente 8 GB; cifra estimada, no publicada.
- GPU recomendadas: cualquier GPU consumer con 4-6 GB o mas de VRAM es suficiente; tambien cabe en CPU. En el extremo alto no aporta ventaja usar A100 o H100 dada la escala del modelo.
- Cabe en GPU consumer: si, por ejemplo en RTX 3060 12 GB, RTX 4060 y superiores. El autor entreno el adaptador en un Apple M4 Pro con 48 GB de memoria unificada.
- Opciones de despliegue: Ollama de forma explicita mediante `ollama run hf.co/stbenjam/qwen3-4b-claudish-gguf:Q4_K_M`; al ser formato GGUF es compatible con llama.cpp. La model card no menciona soporte verificado de vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| stbenjam/qwen3-4b-claudish-gguf | 4,02 B | no disponible (base 262.144) | Apache-2.0 | GGUF Q4_K_M | Fine-tuning de estilo experimental; 0 descargas y 0 likes; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 tokens declarados | Apache-2.0 | safetensors, GGUF, MLX | Modelo base sin ajuste de estilo; referencia directa para comparar el efecto del LoRA |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia mas restrictiva; contexto menor |
| Gemma-3-4B-IT | ~4 B | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa de tamano similar con licencia de uso condicionada |

Las cifras de parametros, contexto y licencia de los modelos alternativos corresponden a sus fichas oficiales publicadas. No se comparan resultados de rendimiento porque este modelo no publica benchmarks numericos.

## Limitaciones y advertencias

- El propio autor declara que el objetivo de entrenamiento no se alcanzo: el comportamiento estilizado observado depende en gran medida de un prompt de estilo explicito y exagerado, no de los pesos en crudo.
- Riesgo alto de alucinacion: la model card avisa de que puede inventar hechos, introducir detalles no soportados y rellenar con contenido irrelevante.
- Tendencia a la verbosidad: puede entrar en conflicto con peticiones de respuestas breves y sobre-explicar.
- Repeticion: los checkpoints mas fuertes y tardios desarrollaron repeticion severa, motivo por el que se selecciono la actualizacion 40.
- Sin herramientas ni informacion en vivo: no dispone de tool calling, busqueda ni acceso a datos actuales.
- Contexto fresco deliberado: el template descarta los mensajes anteriores, por lo que los seguimientos conversacionales con contexto requieren otra configuracion. Los clientes que sobrescriban la plantilla deben reproducir ese comportamiento por su cuenta.
- Idioma: solo ingles; no hay soporte multilingue declarado.
- Requisito de prompt: para obtener el estilo deseado hay que usar el system prompt del demo; con `You are a helpful assistant.` o el modo `--raw` el comportamiento es mucho mas suave, lo que dificulta distinguir estilo aprendido de estilo inducido.
- Licencia Apache-2.0 para esta publicacion y para la base Qwen: permite uso comercial, pero sin garantias y con obligacion de revisar LICENSE, NOTICE y ATTRIBUTION.md.
- Atribucion no verificada: el autor del dataset publico atribuye sus salidas sinteticas a Claude, pero esa atribucion no ha sido autenticada de forma independiente.
- Sin afiliacion: no implica respaldo de Qwen, Anthropic ni de los contribuidores del dataset.
- Perdida de precision por cuantizacion: el export partio de una base MLX ya cuantizada a 4 bits, la dequantizo a F16 y la requantizo a Q4_K_M; la precision descartada no es recuperable.
- Validacion nula de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de calidad o estabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stbenjam/qwen3-4b-claudish-gguf
- Adaptador MLX (entrenamiento local y chat en Python): https://huggingface.co/stbenjam/qwen3-4b-claudish-mlx-lora
- Resultados y respuestas completas: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/v2/RESULTS.md
- Investigacion y referencias sobre el estilo: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/CLAUDISMS_RESEARCH.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k

La busqueda web realizada no devolvio resultados relevantes para este modelo; unicamente enlaces genericos a ChatGPT y OpenAI, sin relacion con la ficha.
