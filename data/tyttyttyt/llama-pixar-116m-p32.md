# TYTTYTTYT/llama-pixar-116m-p32

## Resumen

MIXAR 116M (32x32 patches) es la etapa 1 (backbone) de MIXAR, una familia de modelos de lenguaje multilingues que procesan texto como pixeles renderizados en lugar de tokens. Lo desarrolla el autor TYTTYTTYT y se distribuye bajo licencia Apache 2.0. El modelo aborda un problema de investigacion concreto: eliminar el tokenizador y modelar directamente la representacion visual del texto, lo que permite un tratamiento uniforme de escrituras latinas y CJK sin vocabulario discreto.

Se trata de un transformer de 116 millones de parametros con 12 capas, dimension oculta 768, 12 cabezas de atencion y MLP de 3072. La entrada y la salida son pixeles binarios de un solo canal organizados en parches de 32x32, con dos parches por bloque de escritura. El contexto alcanza hasta 1.024 bloques, aunque el modelo se entreno con ventanas de 180 bloques.

Es relevante ahora por dos motivos: propone una via tokenizer-free aplicada a ocho idiomas (de, en, es, fr, it, ja, ko, zh) y publica resultados en tareas de clasificacion y generacion junto con el codigo y el paper. Esta version es la base de partida para fine-tuning; el autor recomienda la etapa 2 refinada con GRPO para generacion libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (LlamaPixar), entrada y salida en pixeles binarios |
| Parametros totales | 116.411.136 (116M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.024 bloques (entrenado con ventanas de 180 bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB), con codigo custom (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con 12 capas, hidden de 768, 12 cabezas y MLP de 3072. La innovacion principal es la interfaz: no hay tokenizador. El texto se renderiza a imagenes de un canal en binario y se divide en parches de 32x32 pixeles, con dos parches por bloque. El objetivo de preentrenamiento es entropia cruzada binaria por pixel para predecir el siguiente bloque, de modo que el modelo genera la representacion visual del texto siguiente en lugar de indices de vocabulario.

El preentrenamiento usa mC4 en los ocho idiomas, con documentos muestreados uniformemente del corpus agrupado (proporciones: es 0,243, de 0,207, fr 0,171, ja 0,127, en 0,126, it 0,088, zh 0,024, ko 0,015). El schedule consta de 1 millon de pasos, batch global de 384, AdamW con betas (0,9, 0,95), weight decay 0,1, learning rate 3e-4 con coseno hasta 3e-5 y 2.000 pasos de warmup. El computo de preentrenamiento fue de aproximadamente 31 horas en 4 GPU H200. Los documentos se empaquetan en secuencias de 180 bloques con separadores EOS y mascaras de atencion por documento. El directorio `render_config/` contiene las fuentes y ajustes exactos de renderizado; usar otra configuracion supone un cambio de distribucion para el modelo.

## Capacidades

- Generacion de texto en formato de pixeles: el modelo produce bloques de imagen que representan texto, no secuencias de tokens.
- Modelado multilingue en escrituras latinas y CJK: aleman, ingles, espanol, frances, italiano, japones, coreano y chino.
- Clasificacion de secuencias: el repo expone `LlamaPixarForSequenceClassification` para fine-tuning en tareas de clasificacion.
- Prediccion de la siguiente palabra y continuacion de texto en modo generacion libre (evaluado con juez OCR externo).
- Inferencia con cache de clave-valor (`past_key_values`) y generacion bloque a bloque.
- Deteccion implicita de fin de secuencia mediante bloque en blanco (aproximacion de EOS por umbral).
- No dispone de tool calling, function calling, capacidades de agente, vision natural, audio ni modo thinking.

## Casos de uso

- Investigacion en modelos tokenizer-free: sirve como backbone de partida para experimentos que comparen modelado en pixeles frente a modelado con vocabulario discreto, gracias a que el codigo y la configuracion de renderizado estan publicados.
- Fine-tuning para clasificacion de texto multilingue: cargando `LlamaPixarForSequenceClassification` se puede adaptar a tareas como deteccion de idioma o clasificacion tematica en los ocho idiomas entrenados, con la ventaja de no depender de un tokenizador por idioma.
- Base para entrenamiento en etapa 2: el autor indica que esta version es el punto de partida para el refinamiento con GRPO; un equipo puede reutilizarla para RL sobre generacion en pixeles sin partir de cero.
- Experimentos de robustez tipografica y de renderizado: al fijar fuentes y ajustes en `render_config/`, se puede estudiar como afectan cambios de fuente, tamano o resolucion al rendimiento, midiendo la sensibilidad a cambios de distribucion.
- Prototipos de OCR-generacion inversa: el pipeline de renderizado a pixeles y vuelta a imagen permite construir demos que muestren texto generado como imagen, util para docencia o divulgacion del paradigma.
- Evaluacion comparativa de escrituras CJK frente a latinas: los resultados publicados en bAbI y LAMBADA por idioma permiten usar el modelo como referencia en estudios sobre brecha de rendimiento entre sistemas de escritura.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI tarea 1, ingles, generacion libre | 15,2 |
| LAMBADA, generacion libre (media de 5 idiomas) | 4,7 (en 2,4 / de 8,6 / es 3,8 / fr 4,2 / it 4,6) |
| bAbI tarea 1, CJK, generacion libre | zh 3,8 / ja 2,0 / ko 2,2 |
| SIB-200, 22 idiomas | vistos 69,8 / no vistos 29,5 / no vistos de bajos recursos 23,5 |
| XNLI, 10 idiomas | vistos 70,5 / no vistos 60,5 |
| GLUE | 71,4 |

Las puntuaciones de generacion libre son exactitudes juzgadas por un juez OCR Qwen3.6-35B-A3B con atajo pixel-exacto (bAbI tarea 1 con 3 ejemplos; LAMBADA zero-shot de prediccion de ultima palabra). SIB-200 (macro-F1) y XNLI (exactitud, translate-train) se evaluan con fine-tuning por idioma; SIB-200 incluye 8 idiomas vistos en preentrenamiento y 14 no vistos, con un subconjunto de bajos recursos. GLUE es la media de sus tareas. Las tablas y protocolos completos estan en el paper.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 116M parametros; en precision completa (fp32) ocupa aproximadamente 0,47 GB de pesos, y en bf16/fp16 alrededor de 0,23 GB. A esto se suma el coste de las activaciones y del cache KV, que crece con el numero de bloques procesados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en precision reducida; el preentrenamiento se realizo en 4 GPU H200.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en CPU para pruebas con lotes pequenos.
- Opciones de despliegue: la via oficial es `transformers==4.57.3` con `trust_remote_code=True` y la libreria `pixar-render==0.5.1`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza pixel-a-pixel del modelo hace improbable un soporte directo en esos motores sin trabajo adicional.
- Latencia y throughput: no se publican cifras. La generacion es iterativa por bloque (cada paso produce `BLOCK_W` pixeles), con hasta 200 bloques nuevos en el ejemplo del autor, por lo que la latencia dependera del hardware y del numero de bloques generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 116M p32 (este) | 116M | 1.024 bloques | Tokenizer-free, pixeles 32x32 | Apache 2.0 | Hugging Face |
| MIXAR 116M p8 | 113M | no disponible | Tokenizer-free, pixeles 8x8 | Apache 2.0 | Hugging Face |
| MIXAR 477M p32 | 477M | no disponible | Tokenizer-free, pixeles 32x32 | Apache 2.0 | Hugging Face |
| MIXAR 116M p32 stage 2 (GRPO) | 116M | no disponible | Tokenizer-free con refinamiento GRPO | Apache 2.0 | Hugging Face |

La comparacion con modelos de texto convencionales de tamano similar (por ejemplo, familias de 100-150M parametros con tokenizador) no esta disponible en la informacion proporcionada. Las alternativas mas directas son las otras variantes de la propia familia MIXAR, que comparten paradigma y licencia.

## Limitaciones y advertencias

- Es un backbone de etapa 1: el propio autor indica que la etapa 2 con GRPO es mejor opcion para generacion libre, por lo que el uso directo para producir texto puede dar resultados pobres.
- Los resultados de generacion libre son muy bajos (LAMBADA media 4,7; bAbI ingles 15,2), lo que refleja una capacidad limitada de continuacion de texto en esta etapa.
- Gran brecha entre idiomas vistos y no vistos en SIB-200 (69,8 frente a 29,5), y aun mayor en el subconjunto de bajos recursos (23,5).
- Alta sensibilidad al renderizado: cambiar la fuente o los ajustes de `render_config/` supone un cambio de distribucion y degrada el rendimiento.
- Requiere `trust_remote_code=True` y una version concreta de `transformers` y `pixar-render`, lo que anade riesgo de mantenimiento y de ejecucion de codigo no auditado.
- El contexto maximo es de 1.024 bloques, pero el entrenamiento uso ventanas de 180, por lo que el rendimiento mas alla de esa longitud no esta validado.
- Riesgo de alucinacion y de salidas mal formadas: al generar pixeles, el resultado puede no ser texto legible, y la evaluacion depende de un juez OCR externo.
- No se documentan sesgos especificos; al entrenarse sobre mC4, hereda los sesgos y la calidad variable de ese corpus, con especial incidencia en los idiomas con menor presencia (zh 0,024, ko 0,015).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de las fuentes incluidas en `render_config/` antes de redistribuir el pipeline de renderizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Etapa 2 con GRPO: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32-stage2
- Variante 116M con parches 8x8: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Etapa 2 de la variante 8x8: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Variante 477M con parches 32x32: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Codigo: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
