# tencent/WeMM-Ecom-2B

## Resumen

WeMM-Ecom-2B es un modelo multimodal denso de 2.213 millones de parámetros desarrollado por WeChat Vision (Tencent), disenado especificamente para la comprension de contenido en el contexto del comercio electronico de WeChat. Forma parte de la familia WeMM-Ecom, que abarca tamanos de 0,8B, 2B, 4B, 9B y 35B-A3B, y se construye mediante fine-tuning del modelo base Qwen/Qwen3.5-2B, al que anade capacidades de vision y lenguaje orientadas a tareas de e-commerce.

El modelo resuelve el problema de la comprension multimodal especializada en dominios comerciales: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding visual, razonamiento sobre productos y conocimiento de catalogo. Segun la model card, supera a Qwen3.5-2B en 10,59 puntos y a LFM3-VL-2B en 6,16 puntos en la media de benchmarks de e-commerce, manteniendo a la vez capacidades generales competitivas (4,45 puntos por encima de Qwen3.5-2B y 2,43 por encima de LFM3-VL-2B en la media de benchmarks generales).

Es relevante ahora porque combina una ventana de contexto de 262.144 tokens con soporte para entradas de texto, imagen, multi-imagen y video, y ofrece un modo de razonamiento hibrido (instruct y thinking). Su licencia Apache 2.0 y su disponibilidad en formatos BF16, FP8, GPTQ y GGUF lo hacen desplegable tanto en entornos de produccion con GPU como en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-2B) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variantes FP8, GPTQ y GGUF |

## Arquitectura y entrenamiento

WeMM-Ecom-2B es un modelo denso de 2B parámetros construido sobre Qwen/Qwen3.5-2B, al que se incorporan capacidades de comprension visual y lenguaje para el dominio del e-commerce. La arquitectura subyacente es un transformer multimodal que acepta entradas de texto, imagen, multi-imagen y video, con una ventana de contexto de 262.144 tokens. El checkpoint publicado esta en BF16 safetensors, con variantes cuantizadas en FP8, GPTQ y GGUF.

El modelo se presenta en dos modos de inferencia: instruct y thinking, con perfiles de muestreo recomendados distintos segun el modo y la tarea. La evaluacion reportada por el autor cubre 28 benchmarks de e-commerce en ocho escenarios (atributos de producto, moderacion, OCR, recuperacion, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorias (VQA general, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes, multi-imagen y video.
- Comprension especializada de e-commerce: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding visual, razonamiento sobre productos y conocimiento de catalogo.
- Modo de razonamiento hibrido: modos instruct y thinking con perfiles de muestreo diferenciados.
- Comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, y seguimiento de instrucciones.
- Capacidades multilingues limitadas a chino (zh) e ingles (en).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidad de vision: si (imagen, multi-imagen, video).
- Capacidad de audio: no disponible.

## Casos de uso

- Moderacion de contenido en marketplaces: el modelo puede analizar imagenes y texto de anuncios para detectar productos prohibidos, contenido inapropiado o discrepancias entre imagen y descripcion, aprovechando sus benchmarks especificos de moderacion y su ventana de 262.144 tokens para revisar listados completos con historial.
- Extraccion de atributos de producto: a partir de imagenes y fichas de producto, el modelo genera atributos estructurados (color, material, talla, categoria) para alimentar catalogos y motores de busqueda, apoyandose en sus capacidades de OCR y comprension de atributos.
- OCR y digitalizacion de etiquetas y facturas: el modelo puede leer texto en imagenes de etiquetas, tickets y documentos comerciales, util para automatizar la entrada de datos en sistemas de inventario.
- Busqueda y recuperacion multimodal: generar descripciones y representaciones de productos a partir de imagenes para mejorar la recuperacion en buscadores internos de e-commerce, gracias a sus capacidades de grounding y recuperacion.
- Atencion al cliente con vision: un asistente que recibe capturas o fotos de productos enviadas por el usuario y responde con contexto multi-turno, aprovechando la ventana de contexto larga y el modo thinking para consultas complejas.
- Analisis de resenas y contenido generado por usuarios: procesar imagenes y texto de resenas para extraer quejas, detectar fraude o resumir opiniones sobre productos, usando el modo instruct para respuestas rapidas y el modo thinking para analisis profundos.
- Despliegue en hardware de consumo: gracias a las variantes GGUF y GPTQ, el modelo puede ejecutarse en estaciones de trabajo con GPU consumer para prototipos y pruebas de concepto de aplicaciones de e-commerce.

## Benchmarks y rendimiento

La model card reporta resultados en 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorias), en escala 0-100. Los resultados completos se presentan como imagenes en la model card y no estan disponibles como cifras textuales en la informacion proporcionada. Los datos agregados reportados por el autor son:

| Comparacion | Diferencia en media de benchmarks |
|---|---|
| WeMM-Ecom-2B vs Qwen3.5-2B (e-commerce) | +10,59 puntos |
| WeMM-Ecom-2B vs LFM3-VL-2B (e-commerce) | +6,16 puntos |
| WeMM-Ecom-2B vs Qwen3.5-2B (general) | +4,45 puntos |
| WeMM-Ecom-2B vs LFM3-VL-2B (general) | +2,43 puntos |

No se han publicado en la informacion disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros) en formato textual.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 8-12 GB para contexto moderado.
- VRAM estimada en FP8: aproximadamente 2,2-3 GB para pesos, con overhead adicional.
- VRAM estimada en GPTQ (4 bits): aproximadamente 1,2-1,5 GB para pesos.
- VRAM estimada en GGUF (cuantizacion 4-5 bits): aproximadamente 1,5-2,5 GB, apta para GPU consumer.
- GPU recomendadas: A100 o H100 para produccion con contexto largo (262.144 tokens); RTX 4090 o RTX 3090 para desarrollo y contextos moderados; GPUs consumer de gama media (RTX 3060 12 GB o superior) para variantes cuantizadas con contexto reducido.
- Cabe en GPU consumer: si, en variantes GGUF y GPTQ; en BF16 requiere al menos 8 GB de VRAM para contextos cortos.
- Opciones de despliegue: Transformers (>=5.2.0), con soporte de endpoints compatibles con OpenAI; variantes GGUF para llama.cpp/Ollama; FP8 y GPTQ para vLLM y TGI segun soporte de la libreria. No se detallan en la informacion disponible las opciones exactas de serving mas alla de Transformers y endpoints compatibles con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-2B | 2,21B | 262.144 | zh, en | Apache 2.0 | Multimodal especializado en e-commerce, modos instruct y thinking |
| Qwen3.5-2B | 2B (aprox.) | no disponible | no disponible | no disponible | Modelo base del que deriva WeMM-Ecom-2B; superado en +10,59 puntos en e-commerce y +4,45 en general |
| LFM3-VL-2B | 2B (aprox.) | no disponible | no disponible | no disponible | Alternativa multimodal de tamano similar; superado en +6,16 puntos en e-commerce y +2,43 en general |
| WeMM-Ecom-0.8B | 0,8B (aprox.) | no disponible | zh, en | Apache 2.0 | Version menor de la misma familia, para despliegues mas ligeros |

Los datos de contexto, licencia e idiomas de Qwen3.5-2B y LFM3-VL-2B no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al estar entrenado sobre datos de e-commerce de WeChat, puede heredar sesgos del dominio y de la poblacion de usuarios de esa plataforma.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de atributos de producto y moderacion conviene validar las salidas con reglas o verificacion humana.
- Limitaciones de idioma: solo se declaran chino (zh) e ingles (en); el rendimiento en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: aunque la ventana es de 262.144 tokens, el rendimiento real con contextos muy largos y entradas de video no esta cuantificado en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar el archivo LICENSE del repositorio para condiciones exactas.
- Caveats para produccion: el modelo esta especializado en e-commerce; para tareas generales fuera de ese dominio puede rendir por debajo de modelos de proposito general del mismo tamano. El soporte de tool calling y agentes no esta confirmado en la informacion disponible. La integracion requiere Transformers >=5.2.0.
- El modelo base es Qwen3.5-2B; las limitaciones y sesgos de ese modelo pueden propagarse.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Version 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Version 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Version 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Version 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
