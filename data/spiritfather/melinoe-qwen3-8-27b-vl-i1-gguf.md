# spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF

## Resumen

Melinoe-Qwen3-8-27B-VL-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Melinoe-Qwen3-8-27B-VL, un fine-tune orientado a escritura creativa y roleplay del modelo base Qwen3.8-27B de Alibaba. El autor, spiritfather, ha generado estos pesos cuantizados para permitir la ejecución local eficiente de un modelo multimodal de 27 mil millones de parámetros, con especial atención a las tasas de bits bajas (IQ1–IQ4) donde la cuantización ponderada ofrece mejor calidad que las cuantizaciones estáticas equivalentes.

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal (texto e imagen) con una ventana de contexto de 262 000 tokens, licencia Apache 2.0 y capacidades destacadas en codificación, flujos agénticos y automatización de oficina. El fine-tune Melinoe se centra en prosa creativa, roleplay y disposición narrativa, y está siendo evaluado en el benchmark CaliperBench, aunque aún no se han publicado resultados. Esta versión GGUF incluye también el proyector multimodal (mmproj) por separado, necesario para el uso con imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), basado en Qwen3.8-27B |
| Parametros totales | 27 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el fine-tune; el modelo base Qwen3.8-27B soporta 262 000 tokens |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M (todos con imatrix) |
| Idiomas soportados | Ingles (segun model card del fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix), archivos separados para el proyector multimodal (mmproj) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parametros, disenado como modelo nativo multimodal que procesa texto e imagenes de forma unificada. Segun la documentacion oficial de Alibaba, incorpora un codificador visual propio y esta entrenado para tareas de codificacion, flujos agénticos y automatizacion de oficina, con una ventana de contexto de 262 000 tokens. No se dispone de detalles sobre la arquitectura interna exacta (numero de capas, dimensiones, atencion) en la informacion proporcionada.

El fine-tune Melinoe-Qwen3-8-27B-VL, desarrollado por bgg1996, adapta este modelo base para escritura creativa y roleplay. No se han publicado detalles sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible. La cuantizacion realizada por spiritfather utiliza una matriz de importancia (imatrix) calculada sobre el dataset de calibracion de bartowski, lo que mejora la calidad en tasas de bits bajas (IQ1–IQ4) en comparacion con cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto creativo: prosa narrativa, dialogos, descripciones y desarrollo de personajes, orientado a roleplay y escritura literaria.
- Comprension multimodal: al ser un modelo VL, puede procesar imagenes junto con texto, lo que permite generar historias basadas en ilustraciones o analizar escenas visuales.
- Razonamiento y codigo: hereda las capacidades del modelo base Qwen3.8-27B, que incluyen razonamiento logico, generacion de codigo y soporte para flujos agénticos (aunque el fine-tune puede haber priorizado la escritura creativa).
- Soporte de tool calling: no documentado especificamente para este fine-tune, pero el modelo base Qwen3.8-27B lo soporta; se recomienda verificar en la documentacion oficial.
- Multilingue: el fine-tune declara solo ingles, aunque el modelo base soporta multiples idiomas; no se garantiza el rendimiento en otros idiomas.
- Modo texto e imagen: el uso multimodal requiere cargar el archivo mmproj junto con la cuantizacion principal; el modo solo texto funciona con la cuantizacion unicamente.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar capitulos de novelas, cuentos o guiones a partir de premisas dadas, manteniendo coherencia narrativa en contextos largos gracias a su ventana de contexto amplia (si se confirma la del modelo base).
- Roleplay interactivo: ideal para juegos de rol por texto, chatbots de personajes o simulaciones de dialogo, donde el modelo mantiene la personalidad y el tono del personaje durante conversaciones multi-turno.
- Generacion de contenido para videojuegos: creacion de dialogos de NPC, misiones secundarias o descripciones de escenarios, integrable en motores de juego mediante llamadas a API locales.
- Analisis de imagenes para narrativa: al ser multimodal, puede recibir una imagen (por ejemplo, una ilustracion o fotografia) y generar una historia o descripcion coherente con el contenido visual.
- Asistente de redaccion tecnica: aunque esta orientado a creatividad, puede adaptarse a redaccion de documentacion, correos o informes, aprovechando su base en razonamiento y lenguaje.
- Prototipado de agentes conversacionales: con soporte de tool calling (si se confirma), puede integrarse en pipelines de automatizacion para tareas de generacion de texto, resumen o extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo sera evaluado en CaliperBench, un benchmark de escritura creativa que puntua la calidad de la prosa, el roleplay y la disposicion, pero los resultados aun no estan disponibles. Tampoco se proporcionan datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano de los archivos GGUF, se requiere aproximadamente:
  - IQ1_S (7,1 GB): cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060).
  - IQ2_M (10,0 GB): recomendable 12 GB de VRAM (RTX 4070, RTX 3080).
  - IQ3_M (12,1 GB estimado, aunque el listado indica 1,1 GB que parece un error): recomendable 16 GB de VRAM (RTX 4080, RTX 3090).
  - Q3_K_S (12,1 GB): similar al anterior.
- GPU recomendadas: para los quants mas bajos, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes; para quants mas altos o uso multimodal con mmproj, se recomienda RTX 3090/4090 o A100.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, kobold.cpp y servidores como llama-server. Para uso multimodal, se debe cargar el archivo mmproj con la opcion `--mmproj`.
- Latencia y throughput: no se han publicado datos especificos; dependera del hardware y la cuantizacion elegida. En una RTX 4090, un quant IQ2_M podria alcanzar decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa exhaustiva con otros modelos de la misma categoria. Como referencia, se puede comparar con el modelo base Qwen3.8-27B (sin fine-tune) y con otros fine-tunes de escritura creativa, pero no hay datos publicados de rendimiento relativo. La siguiente tabla resume las diferencias principales con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Apache 2.0 | Multimodal general, codigo, agentes |
| Melinoe-Qwen3-8-27B-VL (fine-tune) | 27B | No confirmado (hereda del base) | Apache 2.0 | Escritura creativa, roleplay |
| Melinoe-Qwen3-8-27B-VL-i1-GGUF (este) | 27B | No confirmado | Apache 2.0 | Cuantizacion GGUF con imatrix del fine-tune |

No se han encontrado otros modelos comparables con datos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune orientado a escritura creativa, puede presentar sesgos en la representacion de generos, culturas o estereotipos narrativos; no se han realizado auditorias especificas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas factuales; se recomienda verificacion humana en usos profesionales.
- Limitaciones de contexto: la longitud de contexto del fine-tune no esta confirmada; si no hereda los 262k del modelo base, podria ser menor, lo que afectaria a tareas de larga duracion.
- Limitaciones de idioma: el fine-tune declara soporte solo para ingles; el rendimiento en otros idiomas no esta garantizado y podria degradarse significativamente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener la atribucion y no utilizar marcas registradas de forma inapropiada.
- Uso multimodal: el archivo mmproj es necesario para procesar imagenes; sin el, el modelo solo funciona en modo texto. Ademas, el proyector multimodal puede aumentar los requisitos de VRAM.
- Calidad de cuantizacion: los quants de baja precision (IQ1, IQ2) pueden degradar la calidad de la salida, especialmente en tareas creativas donde la coherencia es critica; se recomienda probar varios niveles.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF
- Modelo base (fine-tune): https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF
- Archivo mmproj: https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF/resolve/main/mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf
- Benchmark CaliperBench: https://caliperbench.com
- Modelo base Qwen3.8-27B (HuggingFace): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de especificaciones y hardware (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
