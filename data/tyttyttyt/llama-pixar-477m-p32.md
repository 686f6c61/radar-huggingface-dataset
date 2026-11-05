# TYTTYTTYT/llama-pixar-477m-p32

## Resumen

MIXAR 477M (32x32 patches) es la primera etapa (stage 1) de MIXAR, un modelo de lenguaje multilingue desarrollado por el usuario TYTTYTTYT que lee y escribe texto como pixeles renderizados en lugar de tokens. Esto es, prescinde por completo del tokenizador: la entrada y la salida son imagenes binarias de un solo canal, y el modelo aprende a predecir el siguiente bloque de pixeles mediante entropia cruzada binaria por pixel. El modelo tiene 477.145.984 parametros y fue preentrenado por maxima verosimilitud sobre ocho idiomas en escrituras latina y CJK.

La relevancia de este modelo es fundamentalmente de investigacion: explora una via tokenizer-free para el modelado del lenguaje, eliminando los sesgos y las limitaciones de los tokenizadores subword (vocabularios fijos, problemas con idiomas de baja resource, segmentacion arbitraria). El modelo es la base para fine-tuning y para entrenamiento posterior; el autor indica explicitamente que la variante stage 2, refinada con GRPO, es la opcion recomendada para generacion libre.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y codigo personalizado que requiere `trust_remote_code=True`. El contexto declarado es de hasta 32.768 bloques, aunque el preentrenamiento se realizo sobre ventanas de 180 bloques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaPixar), 24 capas, hidden 896, 14 cabezas, MLP 6656 |
| Parametros totales | 477.145.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 bloques (entrenado en ventanas de 180 bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada/salida | pixeles binarios de 1 canal, parches de 32x32, 2 parches por bloque |
| Objetivo de preentrenamiento | entropia cruzada binaria por pixel sobre el siguiente bloque |
| Datos de preentrenamiento | mC4 en los 8 idiomas (es .243, de .207, fr .171, ja .127, en .126, it .088, zh .024, ko .015) |
| Compute de preentrenamiento | ~62 horas en 4 GPU H200 |
| Tamano del repo | 1.9 GB |

## Arquitectura y entrenamiento

MIXAR es un transformer decoder-only de 24 capas con dimension oculta 896, 14 cabezas de atencion y MLP de 6656, que opera directamente sobre pixeles. La imagen de entrada se divide en parches de 32x32 pixeles y cada bloque de generacion comprende 2 parches. El modelo predice el siguiente bloque mediante una sigmoide por pixel (entropia cruzada binaria), sin softmax sobre vocabulario. La generacion es autoregresiva a nivel de bloque con cache KV, y el fin de secuencia se detecta heuristicamente cuando el bloque generado es practicamente blanco.

El preentrenamiento se realizo sobre mC4 en aleman, ingles, espanol, frances, italiano, japones, coreano y chino, con documentos muestreados uniformemente del corpus agrupado segun las proporciones indicadas. El schedule consistio en 1M de pasos, batch global de 384, AdamW con betas (0.9, 0.95), weight decay 0.1, learning rate 3e-4 con decaimiento coseno hasta 3e-5 y 2k pasos de warmup. Los documentos se empaquetaron en secuencias de 180 bloques con separadores EOS y mascaras de atencion por documento. El coste computacional fue de aproximadamente 62 horas en 4 GPU H200. El repositorio incluye `render_config/` con las fuentes y ajustes de renderizado exactos usados en el preentrenamiento, que deben usarse sin modificaciones para evitar un cambio de distribucion.

## Capacidades

- Generacion de texto en formato de pixeles: el modelo escribe texto renderizado, no tokens; la salida debe convertirse a imagen y posteriormente a texto mediante OCR.
- Modelado de lenguaje multilingue en ocho idiomas (de, en, es, fr, it, ja, ko, zh) con escrituras latina y CJK.
- Clasificacion de secuencias: el repositorio expone `LlamaPixarForSequenceClassification` para fine-tuning en tareas de clasificacion.
- Prediccion de la ultima palabra y tareas de comprension tipo LAMBADA en modo zero-shot.
- Razonamiento basico de tareas bAbI en modo few-shot (2 shots) mediante generacion libre.
- Capacidad de adaptacion a idiomas no vistos en el preentrenamiento tras fine-tuning (SIB-200, XNLI).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo thinking, vision general ni audio; la "vision" se limita a la lectura de su propia representacion de pixeles.

## Casos de uso

- Investigacion en modelos tokenizer-free: el modelo sirve como backbone para estudiar el modelado del lenguaje a nivel de pixel, comparar con arquitecturas basadas en tokens y analizar el impacto de eliminar el tokenizador en la segmentacion y el sesgo linguistico.
- Fine-tuning para clasificacion de texto multilingue: cargando `LlamaPixarForSequenceClassification` se puede adaptar el backbone a tareas de clasificacion (por ejemplo, deteccion de idioma o analisis de sentimiento) en los ocho idiomas de preentrenamiento, aprovechando que el renderizado elimina diferencias de tokenizacion entre escrituras latinas y CJK.
- Punto de partida para entrenamiento posterior con RL: el autor indica que esta etapa es la base para el refinamiento con GRPO que da lugar a la variante stage 2, por lo que es el modelo adecuado para experimentar con tecnicas de alineamiento sobre representaciones de pixel.
- Evaluacion de robustez frente al renderizado: al depender de una configuracion de fuentes concreta, el modelo permite estudiar como afectan los cambios de tipografia, tamano y antialiasing a la comprension del texto, un eje de investigacion ausente en modelos tokenizados.
- Experimentos de adaptacion a idiomas de baja resource: los resultados en SIB-200 con idiomas no vistos sugieren que el modelo puede servir para estudiar la transferencia cross-lingue sin vocabulario compartido, fine-tuneando por idioma.
- Docencia y divulgacion: el modelo, con solo 477M de parametros y un pipeline de generacion autocontenido, es util para demostrar de forma practica las diferencias entre modelado por tokens y modelado por pixeles en cursos de procesamiento de lenguaje natural.
- Generacion controlada en entornos de investigacion: para tareas donde se requiere inspeccionar la salida a nivel de pixel (por ejemplo, estudios de legibilidad o de errores de renderizado), el modelo ofrece una salida interpretable visualmente.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, ingles, generacion libre | 18.8 |
| LAMBADA, generacion libre (media de 5 idiomas) | 7.2 (en 5.2 / de 12.0 / es 6.4 / fr 5.0 / it 7.4) |
| bAbI task 1, CJK, generacion libre | zh 1.8 / ja 6.8 / ko 0.4 |
| SIB-200, 22 idiomas | visto 78.3 / no visto 32.9 / no visto baja resource 26.7 |
| XNLI, 10 idiomas | visto 74.2 / no visto 62.3 |
| GLUE (media de tareas) | 74.6 |

Las puntuaciones de generacion libre son exactitudes juzgadas por un OCR Qwen3.6-35B-A3B con atajo pixel-exacto (bAbI task 1 few-shot con 2 shots; LAMBADA zero-shot de prediccion de ultima palabra). SIB-200 (macro-F1) y XNLI (exactitud, translate-train) se evaluan con fine-tuning por idioma; SIB-200 incluye 8 idiomas vistos en preentrenamiento y 14 no vistos, con un subconjunto de baja resource. GLUE es la media sobre sus tareas. Las tablas y protocolos completos estan en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1.9 GB de pesos mas activaciones y cache KV; en fp16/bf16, en torno a 1 GB de pesos.
- El modelo cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, asi como en GPUs de datacenter A100 y H100.
- Entrenamiento de referencia: 4 GPU H200 durante unas 62 horas para el preentrenamiento completo; el fine-tuning es viable en una unica GPU de consumo con batch reducido.
- Opciones de despliegue: el modelo requiere la libreria `transformers` (version 4.57.3), `pixar-render` (version 0.5.1) y `torch`, con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la generacion opera sobre pixeles y no sobre tokens.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota practica: al generar por bloques con cache KV y decodificacion autoregresiva a nivel de bloque, el coste por token de texto depende del numero de bloques necesarios para renderizar cada caracter, por lo que la latencia no es directamente comparable con modelos tokenizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 477M p32 (este modelo) | 477M | hasta 32.768 bloques | Pixel language model, tokenizer-free | Apache 2.0 | HuggingFace |
| MIXAR 116M p32 | 116M | no disponible | Pixel language model, tokenizer-free | Apache 2.0 | HuggingFace |
| MIXAR 116M p8 | 116M | no disponible | Pixel language model, tokenizer-free | Apache 2.0 | HuggingFace |
| MIXAR 477M p32 stage 2 (GRPO) | 477M | no disponible | Pixel language model refinado con GRPO | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks de modelos de la competencia en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas tokenizadas de tamano similar.

## Limitaciones y advertencias

- El modelo es una etapa 1 de preentrenamiento: el autor recomienda usar la variante stage 2 (GRPO) para generacion libre, y reserva este backbone para fine-tuning y entrenamiento posterior.
- Los resultados de generacion libre son muy bajos (LAMBADA 7.2 de media, bAbI 18.8 en ingles), lo que refleja una capacidad de generacion limitada en esta etapa.
- La salida es una imagen de pixeles: requiere un paso de OCR externo para obtener texto, lo que introduce errores adicionales y dependencia de un modelo juez (Qwen3.6-35B-A3B en la evaluacion).
- El modelo es extremadamente sensible a la configuracion de renderizado: usar una fuente o unos ajustes distintos a los de `render_config/` constituye un cambio de distribucion y degrada el rendimiento.
- El fin de secuencia se detecta mediante una heuristica (bloque en blanco con umbral `eos_threshold`), no mediante un token EOS aprendido, lo que puede provocar generaciones truncadas o excesivas.
- Cobertura linguistica limitada a ocho idiomas; el rendimiento en idiomas no vistos cae drasticamente (SIB-200 no visto 32.9 frente a visto 78.3).
- Riesgo de alucinacion y de texto ilegible en la salida de pixeles, especialmente en esta etapa de preentrenamiento.
- No soporta tool calling, agentes ni modos de razonamiento extendido, lo que limita su uso en produccion frente a modelos tokenizados de tamano similar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la madurez del modelo y sus bajos resultados de generacion desaconsejan su uso en produccion sin fine-tuning especifico.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_llama_pixar.py` antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Variante stage 2 (GRPO): https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32-stage2
- Repositorio de codigo: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
- Modelo 113M, 8x8 patches: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Modelo 113M, 8x8 patches, stage 2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Modelo 116M, 32x32 patches: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Modelo 116M, 32x32 patches, stage 2: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32-stage2
