# victory5/Qwen3.5-4B-quantized.w4a16

## Resumen

Qwen3.5-4B-quantized.w4a16 es una version cuantizada a INT4 del modelo multimodal Qwen/Qwen3.5-4B, publicada en HuggingFace por el usuario victory5 bajo licencia Apache 2.0. Segun la propia model card, el artefacto lo desarrollo RedHatAI y el repositorio que nos ocupa (con 0 descargas y 0 likes) parece una re-subida del original, un detalle a tener en cuenta antes de usarlo en produccion.

El modelo acepta entrada de texto e imagen y genera texto, con 4.539.265.536 parametros totales (4,54 B) y un peso en disco de 5,2 GB frente a los 8,8 GB de la version en BF16, lo que supone una reduccion de aproximadamente el 41 %. La cuantizacion se aplico solo a los pesos de los operadores lineales de los bloques transformer mediante LLM Compressor con el esquema W4A16, dejando el vision encoder, los embeddings de tokens y las capas de atencion lineal en BF16.

Su relevancia practica esta en que permite servir un modelo multimodal de 4B con requisitos de memoria reducidos usando vLLM, con ejemplo de despliegue a 262.144 tokens de `max-model-len` y soporte del parser de razonamiento `qwen3`, manteniendo una recuperacion de precision cercana al 100 % en tareas de instrucciones y matematicas, aunque con perdidas mas notables en razonamiento complejo (AIME 2025 y GPQA Diamond).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (entrada texto/imagen, salida texto); la lista de capas excluidas de la cuantizacion incluye `visual` y `linear_attn`, lo que indica presencia de vision encoder y de capas de atencion lineal |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Longitud de contexto | Hasta 262.144 tokens en el ejemplo de despliegue de la model card (`--max-model-len 262144`); el valor oficial del modelo base no se detalla |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones en precision original BF16); no se publican variantes GGUF ni otros esquemas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compresion `compressed-tensors` |
| Tamano del repositorio | 5,5 GB (5,2 GB de pesos segun la model card) |
| Fecha de publicacion en HuggingFace | 12 de septiembre de 2026 (model card del artefacto original: 16 de abril de 2026) |
| Libreria de inferencia | transformers; preparado para vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y no se reentrena: es un proceso de cuantizacion post-entrenamiento. Se aplico `GPTQModifier` de LLM Compressor con esquema `W4A16`, objetivos `Linear` y `sequential_targets=["Qwen3_5DecoderLayer"]`, con `dampening_frac=0.05`. La calibracion uso 1024 muestras del dataset Open-Platypus con longitud maxima de secuencia de 8192 tokens y semilla 42. Se excluyeron explicitamente de la cuantizacion `lm_head`, `embed_tokens`, todas las capas `visual`/`model.visual` y las capas `linear_attn`, que permanecen en BF16.

La arquitectura subyacente es multimodal: procesa texto e imagen y genera texto, e incorpora capas de atencion lineal junto a la atencion estandar, ademas de un vision encoder. La reduccion de tamano resultante (de 8,8 GB a 5,2 GB, un 41 % menos) es inferior al 75 % teorico precisamente porque esos componentes (vision encoder, embeddings y atencion lineal) siguen en BF16. No se documentan en la informacion disponible datos sobre el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional: la model card incluye ejemplos de chat multimodal con el pipeline `image-text-to-text`.
- Razonamiento con modo thinking: el despliegue en vLLM se configura con `--reasoning-parser qwen3`, pensado para separar el razonamiento del texto final.
- Razonamiento matematico: evaluado en GSM8k-Platinum (94,5 %), Math 500 (83,7 %) y AIME 2025 (73,3 %).
- Conocimiento general y de nivel avanzado: MMLU-Pro (77,5 %) y GPQA Diamond (73,1 %).
- Seguimiento de instrucciones: IFEval con 86,1 % en prompt strict y 90,4 % en instruction strict.
- Comprension de imagenes: entrada multimodal soportada por el pipeline y por el processor del modelo base, aunque sin benchmarks de vision publicados en la informacion disponible.
- Contexto largo: el ejemplo de servicio permite `max-model-len` de 262.144 tokens.
- Despliegue en servidor compatible con la API de OpenAI a traves de vLLM.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multiturno con documentos o capturas adjuntas gracias a la entrada imagen-texto y a una ventana de contexto de hasta 262.144 tokens, reduciendo los requisitos de VRAM frente al modelo en BF16.
- Extraccion de datos de documentos escaneados: al aceptar imagenes, permite transcribir facturas, formularios o tickets y devolver la informacion estructurada como texto, sin necesidad de un pipeline OCR separado.
- Asistente de analisis de capturas y graficos: util para generar explicaciones de dashboards, diagramas tecnicos o imagenes de error en herramientas de soporte interno.
- Generacion y revision de codigo asistida: con contexto largo se pueden pasar repositorios o ficheros extensos y obtener explicaciones o refactorizaciones; encaja en flujos de CI/CD como paso de revision si se expone via vLLM con API compatible con OpenAI.
- Tutoria o resolucion de problemas matematicos paso a paso: su rendimiento en GSM8k-Platinum y Math 500 lo hace adecuado para explicaciones guiadas, y el parser de razonamiento `qwen3` facilita separar el desarrollo del resultado final.
- Despliegue en hardware de gama media: al ocupar 5,2 GB de pesos, permite servir un modelo multimodal en una unica GPU consumer, algo inviable con variantes mayores, lo que habilita prototipos y entornos de desarrollo locales.
- Clasificacion y resumen de conversaciones con contexto largo: para analitica de tickets o hilos de soporte extensos, aprovechando la ventana de contexto y el menor coste de memoria.

## Benchmarks y rendimiento

Resultados publicados por el autor del artefacto (evaluados con lm-evaluation-harness y lighteval, con inferencia servida en vLLM). La columna de recuperacion es la del modelo cuantizado respecto al base.

| Categoria | Benchmark | Qwen/Qwen3.5-4B | Este modelo (W4A16) | Recuperacion |
|---|---|---|---|---|
| Instrucciones | GSM8k-Platinum (0-shot) | 94,5 % | 94,5 % | 100,1 % |
| Instrucciones | MMLU-Pro (0-shot) | 79,3 % | 77,5 % | 97,8 % |
| Instrucciones | IFEval prompt strict (0-shot) | 88,3 % | 86,1 % | 97,6 % |
| Instrucciones | IFEval instruction strict (0-shot) | 91,5 % | 90,4 % | 98,8 % |
| Razonamiento | Math 500 (0-shot) | 84,5 % | 83,7 % | 99,1 % |
| Razonamiento | AIME 2025 (0-shot) | 82,2 % | 73,3 % | 89,2 % |
| Razonamiento | GPQA Diamond (0-shot) | 79,6 % | 73,1 % | 91,8 % |

Las mayores perdidas se concentran en razonamiento de alta dificultad: 8,9 puntos porcentuales en AIME 2025 y 6,5 puntos en GPQA Diamond. No hay benchmarks de capacidades de vision publicados en la informacion disponible.

## Requisitos de hardware

- Pesos: 5,2 GB en disco (INT4) frente a 8,8 GB en BF16.
- VRAM estimada para inferencia: aproximadamente 6-8 GB para los pesos con overhead de runtime en contexto corto; el consumo crece con la longitud de contexto porque la cache KV no esta cuantizada y se mantiene en BF16 (estimacion propia a partir del tamano de pesos, no un dato publicado).
- GPU consumer: cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti o superiores; en 8 GB el margen es muy ajustado y empeora con contexto largo o con la ruta multimodal activa.
- GPU de datacenter: A100, H100 o L40S para contextos muy largos (hasta 262.144 tokens) y despliegues con concurrencia alta.
- Reduccion de memoria en modo texto: el flag `--language-model-only` de vLLM evita cargar los componentes de vision y baja el consumo.
- Opciones de despliegue: vLLM es la ruta documentada y recomendada (`vllm serve` con `--reasoning-parser qwen3`). Tambien es cargable con transformers (`library_name: transformers`) y el repositorio esta marcado como `endpoints_compatible`.
- Alternativas no confirmadas: no se publican pesos GGUF, por lo que llama.cpp y Ollama no estan soportados con este artefacto; el soporte en TGI no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark de referencia (MMLU-Pro / AIME 2025 / GPQA Diamond) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B-quantized.w4a16) | 4,54 B | hasta 262.144 tokens segun configuracion de vLLM | 77,5 % / 73,3 % / 73,1 % | Apache 2.0 | safetensors INT4, pensado para vLLM |
| Qwen/Qwen3.5-4B (BF16) | 4,54 B | no disponible en la informacion proporcionada | 79,3 % / 82,2 % / 79,6 % | Apache 2.0 | safetensors BF16 |
| Otras alternativas multimodales de ~4B (por ejemplo, Qwen3-4B o Llama-3.2-3B en versiones cuantizadas) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con el modelo base muestra que la cuantizacion W4A16 es practicamente neutra en matematica e instrucciones, pero penaliza el razonamiento de alta dificultad. No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Perdida de precision medible en razonamiento complejo: AIME 2025 baja de 82,2 % a 73,3 % y GPQA Diamond de 79,6 % a 73,1 %; conviene evitarlo como sustituto directo del modelo base en tareas de razonamiento avanzado.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; aplican los riesgos habituales de un modelo de 4B sin datos especificos publicados.
- Idiomas soportados: no disponible; conviene validar el rendimiento multilingue antes de desplegarlo fuera del ingles.
- Calibracion de la cuantizacion en ingles y solo texto: se usaron 1024 muestras de Open-Platypus (contenido textual), por lo que el efecto de la cuantizacion sobre la ruta de vision no esta evaluado ni validado con benchmarks de imagen.
- Cobertura de evaluacion limitada: los benchmarks publicados son de texto; no hay resultados de tareas visuales, de tool calling ni de agentes.
- Cache KV sin cuantizar en BF16: el contexto de 262.144 tokens puede disparar el consumo de VRAM en produccion, ya que la reduccion de memoria solo afecta a los pesos lineales.
- Licencia Apache 2.0: permite uso comercial, pero la model card enlaza la licencia del modelo base, por lo que conviene revisar dicha licencia al distribuir el artefacto.
- Procedencia del repositorio: la model card atribuye el desarrollo a RedHatAI, mientras que el repositorio esta publicado por el usuario victory5 con 0 descargas y 0 likes, lo que sugiere una re-subida no oficial; para produccion es preferible usar el artefacto del publicador original.
- Fecha de publicacion atipica (septiembre de 2026) y ausencia de historial de versiones o mantenimiento en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/victory5/Qwen3.5-4B-quantized.w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Artefacto original referenciado en la model card: https://huggingface.co/RedHatAI/Qwen3.5-4B-quantized.w4a16
- LLM Compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Dataset de calibracion Open-Platypus: https://huggingface.co/datasets/garage-bAInd/Open-Platypus
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- lighteval: https://github.com/huggingface/lighteval

Nota: los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (versan sobre instalacion de controladores NVIDIA), por lo que no se han utilizado como fuente.
