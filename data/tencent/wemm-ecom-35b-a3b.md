# tencent/WeMM-Ecom-35B-A3B

## Resumen

WeMM-Ecom-35B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por WeChat Vision (Tencent) dentro de la familia WeMM-Ecom, orientada a la comprension de contenido de comercio electronico. Se construye como un fine-tune del modelo base Qwen/Qwen3.5-35B-A3B, una arquitectura MoE de 35.107.181.936 parametros totales con aproximadamente 3.000 millones de parametros activos, y anade capacidades especificas de entendimiento de producto, moderacion, OCR, grounding y razonamiento sobre imagenes y video.

El modelo resuelve el problema de la comprension multimodal especializada en dominios de e-commerce: identificacion de atributos de producto, moderacion de contenido, extraccion de texto en imagenes de catalogo y razonamiento sobre fichas de producto. Segun la model card, supera al modelo base Qwen3.5-35B-A3B en 3,92 puntos de media en benchmarks de e-commerce y mantiene capacidades generales equiparables a modelos del mismo tamano, ademas de superar a modelos abiertos de cientos de miles de millones de parametros en la suite de e-commerce.

Es relevante porque combina un contexto de 262.144 tokens, soporte de entradas de texto, imagen, multi-imagen y video, y modos de inferencia hibridos (instruct y thinking) en un unico checkpoint con licencia Apache 2.0. La disponibilidad de formatos BF16, FP8, GPTQ y GGUF facilita su despliegue tanto en entornos de servidor como en hardware mas modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5-35B-A3B; pipeline image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, FP8, GPTQ, GGUF |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes FP8, GPTQ y GGUF publicadas por separado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts (MoE) heredada de Qwen3.5-35B-A3B, con 35.107 millones de parametros totales y aproximadamente 3.000 millones activos por token. Incorpora un codificador visual para entradas de imagen, multi-imagen y video, integrado en el pipeline image-text-to-text. El checkpoint se distribuye en Safetensors BF16 con un tamano de repositorio de 70,2 GB.

El entrenamiento parte del modelo base Qwen3.5-35B-A3B mediante fine-tuning orientado a e-commerce, segun indica la model card. La evaluacion se organiza en 28 benchmarks de e-commerce distribuidos en ocho escenarios (atributos de producto, moderacion, OCR, retrieval, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto) y 64 benchmarks generales en ocho categorias. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo soporta un modo hibrido de pensamiento (thinking) y un modo instruct, lo que sugiere entrenamiento con datos de razonamiento de cadena de pensamiento, aunque este extremo no se confirma explicitamente en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes, multi-imagen y video.
- Comprension especializada de e-commerce: atributos de producto, moderacion de contenido, OCR en imagenes de catalogo, retrieval, grounding y conocimiento de producto.
- Modo hibrido de pensamiento (thinking) e instruct, con ajustes de muestreo recomendados por modo y tarea.
- Capacidades generales de VQA, comprension de documentos y graficos, razonamiento STEM, comprension espacial, grounding y conteo, comprension multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Soporte multilingue limitado a chino e ingles.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling.
- No se documenta en la informacion disponible soporte explicito de agentes multi-paso.
- Compatible con endpoints (tag `endpoints_compatible`) y con opciones de serving compatibles con OpenAI.

## Casos de uso

- Moderacion de contenido en marketplace: el modelo puede clasificar imagenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, apoyandose en sus benchmarks de moderacion y en el modo thinking para casos ambiguos.
- Extraccion de atributos de producto: a partir de fotos de catalogo, el modelo identifica materiales, colores, tallas y categorias, usando OCR y grounding para localizar elementos en la imagen.
- Generacion de fichas de producto: con contexto de 262.144 tokens, puede procesar descripciones largas y multiples imagenes de un mismo producto para redactar fichas coherentes en chino o ingles.
- Busqueda y retrieval multimodal: indexacion y recuperacion de productos a partir de consultas en lenguaje natural o imagenes de referencia, aprovechando las capacidades de retrieval evaluadas en la suite de e-commerce.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno sobre pedidos, devoluciones o caracteristicas de producto, con soporte de imagenes enviadas por el usuario para diagnosticar incidencias.
- Analisis de resenas con video e imagen: procesamiento de video de producto y resenas visuales para resumir opiniones o detectar discrepancias entre la descripcion y el articulo recibido.
- Verificacion de cumplimiento en catalogos: comparacion entre imagen de producto y texto de la ficha para detectar inconsistencias, apoyandose en el modo thinking para razonamiento multi-paso.

## Benchmarks y rendimiento

La model card reporta resultados en escala 0-100 sobre 28 benchmarks de e-commerce (ocho escenarios) y 64 benchmarks generales (ocho categorias), pero los valores numericos completos se presentan unicamente en imagenes dentro del repositorio, no como tablas de texto. Los datos agregados disponibles son:

| Comparativa | Diferencia media (escala 0-100) |
|---|---|
| E-commerce vs. Qwen3.5-35B-A3B | +3,92 puntos |
| E-commerce vs. Qwen3.6-35B-A3B | +3,36 puntos |
| E-commerce vs. MiniCPM-V-4.7-35B-A3B | +8,22 puntos |
| General vs. Qwen3.5-35B-A3B | +0,17 puntos |
| General vs. MiniCPM-V-4.7-35B-A3B | +5,60 puntos |
| General vs. Valley3-32B | +9,13 puntos |

No se han publicado en la informacion disponible resultados numericos por benchmark individual (MMLU, HumanEval, GSM8K u otros); los desgloses completos estan en las imagenes `assets/ecommerce-instruct-table.png`, `assets/ecommerce-thinking-table.png`, `assets/general-instruct-table.png` y `assets/general-thinking-table.png` del repositorio.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 70 GB de pesos, por lo que requiere al menos 80 GB de VRAM para inferencia sin cuantizar (A100 80GB, H100 80GB).
- VRAM estimada en FP8: en torno a 35-40 GB, viable en A100 40GB, L40S 48GB o RTX 6000 Ada.
- VRAM estimada en GPTQ (4 bits): en torno a 18-20 GB, viable en RTX 4090 24GB y RTX 5090.
- VRAM estimada en GGUF (segun cuantizacion, p. ej. Q4_K_M): aproximadamente 20-22 GB, viable en GPU de consumo de 24 GB o en configuraciones CPU+GPU.
- GPU recomendadas: H100 o A100 80GB para BF16; L40S o A100 40GB para FP8; RTX 4090/5090 para GPTQ y GGUF.
- Opciones de despliegue: Transformers (>=5.2.0), con soporte de serving compatible con OpenAI segun la model card; llama.cpp/Ollama mediante los pesos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | E-commerce (media) | General (media) | Licencia |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B | 35B totales / ~3B activos | 262.144 | Referencia | Referencia | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B totales / ~3B activos | No disponible | -3,92 vs. WeMM | -0,17 vs. WeMM | No disponible |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | No disponible | -3,36 vs. WeMM | No disponible | No disponible |
| MiniCPM-V-4.7-35B-A3B | 35B totales / ~3B activos | No disponible | -8,22 vs. WeMM | -5,60 vs. WeMM | No disponible |
| Valley3-32B | 32B | No disponible | No disponible | -9,13 vs. WeMM | No disponible |

Los datos de contexto, licencia y parametros de los modelos comparados no se detallan en la informacion proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se documenta soporte de castellano ni de otros idiomas, lo que restringe su uso en mercados hispanohablantes sin evaluacion previa.
- Riesgo de alucinacion en la generacion de atributos de producto o descripciones, especialmente en modo instruct sin verificacion posterior.
- Sesgos potenciales derivados de los datos de entrenamiento orientados al ecosistema de e-commerce de WeChat, que pueden no reflejar catalogos o practicas de otros mercados.
- La model card no detalla la composicion del dataset de entrenamiento ni los procesos de alineacion, lo que dificulta auditar sesgos.
- El rendimiento en benchmarks se reporta en escala 0-100 y solo de forma agregada en el texto; los valores por benchmark requieren consultar las imagenes del repositorio.
- Aunque la licencia es Apache 2.0, conviene revisar el archivo LICENSE del repositorio para confirmar terminos de uso comercial y atribucion.
- El contexto de 262.144 tokens implica un coste elevado de memoria KV-cache en produccion; se recomienda cuantizacion y gestion cuidadosa del contexto en despliegues de alta concurrencia.
- No se documenta soporte explicito de tool calling ni de flujos agénticos, por lo que su integracion en pipelines de agentes requiere validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Coleccion WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.30662
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.30662
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Variante FP8: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Modelos de la familia: https://huggingface.co/tencent/WeMM-Ecom-0.8B, https://huggingface.co/tencent/WeMM-Ecom-2B, https://huggingface.co/tencent/WeMM-Ecom-4B, https://huggingface.co/tencent/WeMM-Ecom-9B
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
