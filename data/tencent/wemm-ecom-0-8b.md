# tencent/WeMM-Ecom-0.8B

## Resumen

WeMM-Ecom-0.8B es un modelo multimodal denso de 0,8 mil millones de parametros desarrollado por WeChat Vision (Tencent) como parte de la familia WeMM-Ecom, orientada a la comprension de contenido multimodal para el e-commerce de WeChat. El modelo parte de Qwen/Qwen3.5-0.8B como base y lo afina para combinar comprension fina de producto (atributos, moderacion, OCR, recuperacion, grounding) con capacidades visuales y de razonamiento de proposito general. Su relevancia radica en que ofrece un punto de entrada ligero dentro de una familia escalable (0.8B, 2B, 4B, 9B y 35B-A3B) que cubre desde despliegues en hardware modesto hasta configuraciones MoE de mayor capacidad.

La arquitectura es un transformer denso multimodal con ventana de contexto de 262.144 tokens, capaz de procesar entradas de texto, imagen, multi-imagen y video. Segun la model card, supera a Qwen3.5-0.8B en 16,43 puntos y a MiniCPM-V-4.7-1B en 13,03 puntos en la media de benchmarks de e-commerce, y mantiene capacidades generales por encima de ambos en la media de benchmarks generales (6,93 y 1,09 puntos respectivamente).

El modelo esta publicado con licencia Apache 2.0, pesos en BF16 safetensors y variantes cuantizadas FP8, GPTQ y GGUF, lo que facilita su integracion tanto en pipelines de investigacion como en despliegues de produccion con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-0.8B), pipeline image-text-to-text |
| Parametros totales | 852.985.920 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes FP8, GPTQ y GGUF publicadas aparte |

## Arquitectura y entrenamiento

WeMM-Ecom-0.8B es un modelo denso de 0,8B parametros construido mediante fine-tuning de Qwen/Qwen3.5-0.8B, un modelo base multimodal de la familia Qwen3.5. La model card no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron etapas de RLHF o DPO; esa informacion figura como no disponible en la documentacion proporcionada. Lo que si se explicita es el enfoque: el ajuste combina comprension fina de e-commerce (atributos de producto, moderacion de contenido, OCR, recuperacion, grounding y razonamiento sobre productos) con el mantenimiento de capacidades visuales y linguisticas generales.

Una innovacion destacable es el soporte de **hybrid thinking**: el modelo puede operar en modo instruct (respuesta directa) o en modo thinking (razonamiento explicito), con ajustes de muestreo recomendados distintos para cada modo y tarea. Ademas, la familia WeMM-Ecom incluye variantes de mayor tamano, siendo la 35B-A3B un modelo MoE que, segun la model card, supera a modelos open source de cientos de miles de millones de parametros en rendimiento de e-commerce. El modelo acepta entradas de texto, imagen unica, multi-imagen y video, lo que amplia su aplicabilidad mas alla del texto e imagen estaticos.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes, multi-imagen y video.
- Comprension fina de e-commerce: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding y conocimiento de producto.
- Modo dual instruct / thinking (hybrid thinking) con perfiles de muestreo diferenciados.
- Comprension general de VQA, documentos, graficos, razonamiento STEM, comprension espacial, grounding, conteo, seguimiento de instrucciones y tareas centradas en texto.
- Soporte multilingue limitado a chino e ingles.
- Integracion con Transformers (`AutoModelForImageTextToText`, `AutoProcessor`) y opciones de serving compatibles con OpenAI.
- No se documenta soporte explicito de tool calling / function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Moderacion de contenido en marketplace: clasificacion y revision de imagenes y textos de anuncios para detectar productos prohibidos o contenido inapropiado, aprovechando las capacidades de moderacion incluidas en el conjunto de benchmarks de e-commerce.
- Extraccion de atributos de producto: a partir de fotos de articulos, el modelo puede identificar categoria, material, color y otras propiedades para poblar catalogos de forma automatica, gracias a su comprension fina de atributos.
- OCR y digitalizacion de etiquetas: lectura de texto en imagenes de envases, etiquetas y fichas tecnicas para extraer datos estructurados, apoyandose en el contexto largo para procesar lotes de documentos.
- Busqueda y recuperacion multimodal: generacion de representaciones y descripciones de producto que alimenten motores de busqueda visual o textual dentro de una plataforma de e-commerce.
- Asistencia conversacional al comprador: respuesta a preguntas multi-turno sobre productos con contexto de hasta 262.144 tokens, permitiendo conversaciones largas con historial e imagenes adjuntas.
- Analisis de resenas con imagen: interpretacion conjunta de fotos de cliente y texto de resena para detectar problemas de calidad o discrepancias entre producto anunciado y recibido.
- Despliegue en hardware modesto: al ser un modelo de 0,8B con variantes GGUF, puede ejecutarse en entornos con recursos limitados para tareas de clasificacion y extraccion a escala.

## Benchmarks y rendimiento

La model card reporta resultados agregados sobre 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorias), en escala 0-100. Las tablas completas se presentan como imagenes en la model card y no estan disponibles como cifras textuales en la informacion proporcionada. Los unicos datos numericos explicitos son las diferencias medias frente a modelos comparables:

| Comparativa | Diferencia media en benchmarks de e-commerce | Diferencia media en benchmarks generales |
|---|---|---|
| WeMM-Ecom-0.8B vs Qwen3.5-0.8B | +16,43 puntos | +6,93 puntos |
| WeMM-Ecom-0.8B vs MiniCPM-V-4.7-1B | +13,03 puntos | +1,09 puntos |

No se han publicado resultados individuales por benchmark (MMLU, HumanEval, GSM8K, etc.) en forma textual en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda reservar 3-4 GB para contexto moderado.
- Variante FP8: reduce el peso de pesos a aproximadamente la mitad del BF16, con requisitos en torno a 1 GB para pesos.
- Variante GPTQ: cuantizacion de 4 bits aproximadamente, con pesos en torno a 0,5 GB.
- Variante GGUF: permite ejecucion en CPU y GPU con cuantizaciones de 4-8 bits; adecuada para equipos consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo en BF16 o FP8; para lotes grandes o contexto muy largo se recomienda A100 o H100.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`), serving compatible con OpenAI, llama.cpp/Ollama via GGUF y frameworks compatibles con GPTQ/FP8.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B | 0,85B denso | 262.144 | Multimodal e-commerce + general | Apache 2.0 | Hugging Face (BF16, FP8, GPTQ, GGUF) |
| Qwen3.5-0.8B | 0,8B denso | No disponible | Multimodal general | No disponible | Hugging Face |
| MiniCPM-V-4.7-1B | ~1B denso | No disponible | Multimodal general | No disponible | Hugging Face |

Segun la model card, WeMM-Ecom-0.8B supera a ambos comparables tanto en la media de benchmarks de e-commerce como en la media de benchmarks generales, lo que lo posiciona como una opcion especializada sin sacrificar rendimiento general frente a modelos de tamano similar.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede heredar sesgos de catalogo y de moderacion de esa plataforma.
- Alucinacion: como modelo generativo multimodal, puede producir descripciones o atributos incorrectos, especialmente en imagenes de baja calidad o productos poco representados.
- Contexto: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento efectivo en contextos extremos ni la degradacion esperada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los modelos base y datasets subyacentes.
- Modo thinking: requiere ajustes de muestreo especificos; usarlo con la configuracion de modo instruct puede degradar la calidad o aumentar innecesariamente la longitud de salida.
- Cobertura de benchmarks: los resultados completos se presentan como imagenes en la model card, lo que dificulta la verificacion automatica y la comparacion programatica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-0.8B/blob/main/LICENSE
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Variante 2B: https://huggingface.co/tencent/WeMM-Ecom-2B
- Variante 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Variante 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Variante 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Cuantizacion FP8: https://huggingface.co/tencent/WeMM-Ecom-0.8B-FP8
- Cuantizacion GPTQ: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GPTQ
- Cuantizacion GGUF: https://huggingface.co/tencent/WeMM-Ecom-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
