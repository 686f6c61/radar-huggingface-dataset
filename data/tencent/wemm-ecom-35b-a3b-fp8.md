# tencent/WeMM-Ecom-35B-A3B-FP8

## Resumen

WeMM-Ecom-35B-A3B-FP8 es la version cuantizada en FP8 por bloques del modelo multimodal WeMM-Ecom-35B-A3B, desarrollado por WeChat Vision (Tencent) para la comprension de contenido en el contexto del comercio electronico de WeChat. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token, construido sobre la familia `qwen3_5_moe` y orientado a tareas de image-text-to-text.

El modelo resuelve el problema del entendimiento fino de contenido comercial: atributos de producto, moderacion de contenido, OCR, recuperacion, grounding, razonamiento sobre imagenes de producto y conocimiento de catalogo, ademas de mantener capacidades generales de vision-lenguaje comparables a modelos del mismo tamano. Su ventana de contexto alcanza los 262.144 tokens, lo que permite procesar conversaciones multi-turno extensas y lotes de imagenes o video dentro de una misma peticion.

La relevancia actual del checkpoint FP8 radica en que reduce el peso del repositorio a 36,6 GB y habilita el despliegue en GPUs con soporte de FP8, manteniendo el encoder de vision, la cabeza de salida y determinadas proyecciones sensibles en su precision original. La licencia Apache 2.0 facilita su adopcion comercial, y la disponibilidad en BF16, FP8, GPTQ y GGUF cubre tanto servidores de inferencia de alto rendimiento como entornos con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base `qwen3_5_moe`), con encoder de vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque de 128 x 128 (este checkpoint); la familia ofrece tambien BF16, GPTQ y GGUF |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture of Experts multimodal con 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que permite un coste de computo por inferencia muy inferior al de un modelo denso del mismo tamano. El pipeline declarado es `image-text-to-text`, con soporte de entradas de texto, imagen, multiples imagenes y video, y un modo hibrido de razonamiento ("thinking") junto con un modo instruct convencional.

La cuantizacion de este checkpoint aplica FP8 E4M3 a los pesos con una escala independiente por cada bloque de 128 x 128, y cuantiza las activaciones de forma dinamica durante la inferencia. El encoder de vision, la cabeza de salida y determinadas proyecciones sensibles conservan su precision original para preservar la calidad. El checkpoint incluye sus ajustes de cuantizacion, que vLLM detecta de forma automatica.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset, ni de si se aplicaron tecnicas de RLHF o DPO. La model card remite a un informe tecnico (Technical Report) para estos detalles.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y video.
- Comprension de atributos de producto: identificacion de categorias, materiales, tallas, colores y especificaciones a partir de imagenes.
- OCR y extraccion de texto en imagenes de producto, etiquetas y documentos comerciales.
- Moderacion de contenido: deteccion de material inapropiado o fraudulento en listados y conversaciones.
- Grounding visual y counting: localizacion de objetos y recuento dentro de la imagen.
- Recuperacion y knowledge sobre catalogo de productos.
- Comprension de documentos y graficos, razonamiento STEM y comprension espacial.
- Comprension multi-imagen e instrucciones complejas.
- Modo hibrido: instruct y thinking (razonamiento multi-paso explicito).
- Soporte de conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Capacidades multilingues limitadas a chino e ingles.

## Casos de uso

- Enriquecimiento de fichas de producto: a partir de una o varias fotos, el modelo extrae atributos (categoria, material, color, talla) y genera descripciones estructuradas; el contexto de 262.144 tokens permite procesar lotes grandes de imagenes en una sola peticion.
- Moderacion de listados y chats de comercio: clasificacion de imagenes y texto para detectar productos prohibidos, falsificaciones o lenguaje inapropiado, usando el modo thinking para casos ambiguos que requieren razonamiento explicito.
- Atencion al cliente multimodal: el cliente envia una foto del producto defectuoso y el modelo, con contexto largo, mantiene el hilo de la conversacion y responde con instrucciones o diagnostico.
- Busqueda visual y recuperacion: generacion de representaciones y descripciones normalizadas de imagenes de producto para alimentar un motor de busqueda o un sistema RAG sobre catalogo.
- Extraccion de datos de documentos comerciales: facturas, albaranes y etiquetas en chino o ingles, aprovechando las capacidades de OCR y comprension de documentos.
- Analisis de video de producto: resenas en video o demostraciones de uso, con soporte nativo de entrada de video para resumir y extraer caracteristicas.
- Asistente interno para equipos de operaciones: consultas sobre politicas de catalogo y conocimiento de producto con razonamiento multi-paso.

## Benchmarks y rendimiento

La model card publica comparativas agregadas frente a modelos de referencia, expresadas en puntuacion media sobre escala 0-100. No se incluyen los valores absolutos por benchmark en el texto disponible (las tablas completas estan en imagenes adjuntas de la model card).

| Comparativa | Diferencia media declarada |
|---|---|
| E-commerce vs. Qwen3.5-35B-A3B | +3,92 puntos |
| E-commerce vs. Qwen3.6-35B-A3B | +3,36 puntos |
| E-commerce vs. MiniCPM-V-4.7-35B-A3B | +8,22 puntos |
| General vs. Qwen3.5-35B-A3B | +0,17 puntos |
| General vs. MiniCPM-V-4.7-35B-A3B | +5,60 puntos |
| General vs. Valley3-32B | +9,13 puntos |

La evaluacion de comercio electronico cubre 28 benchmarks en ocho escenarios (atributos de producto, moderacion, OCR, recuperacion, grounding, razonamiento, benchmarks publicos de e-commerce y conocimiento de producto). La evaluacion general cubre 64 benchmarks en ocho categorias. Los resultados concretos por benchmark (MMLU, HumanEval, GSM8K u otros) no estan disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 36-40 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 48 GB para contexto moderado y 80 GB para contexto largo.
- El contexto completo de 262.144 tokens requiere KV cache considerable; con atencion estandar y 3.000 millones de parametros activos, el consumo crece de forma aproximadamente lineal con la longitud de secuencia.
- GPUs recomendadas: H100 (80 GB), H200, A100 80 GB, L40S (48 GB) y GPUs con soporte nativo de FP8 (arquitecturas Hopper y Ada Lovelace).
- En GPUs de consumo: una RTX 4090 (24 GB) no puede alojar el checkpoint FP8 completo; seria necesario recurrir a la variante GGUF cuantizada a 4 bits o inferior, con posible offload a CPU/RAM.
- Motores de despliegue: vLLM >= 0.31.0 con soporte de FP8 por bloques (recomendado, detecta la configuracion automaticamente), y la familia GGUF para llama.cpp u Ollama. Tambien es compatible con el ecosistema `transformers`.
- La model card no publica cifras de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-FP8 | 35B totales / ~3B activos | 262.144 | Apache 2.0 | BF16, FP8, GPTQ, GGUF | Multimodal de comercio electronico |
| Qwen3.5-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Multimodal general |
| MiniCPM-V-4.7-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Multimodal general |
| Valley3-32B | 32B | no disponible | no disponible | no disponible | Multimodal general |

Segun la model card, WeMM-Ecom-35B-A3B supera a Qwen3.5-35B-A3B, Qwen3.6-35B-A3B y MiniCPM-V-4.7-35B-A3B en benchmarks de e-commerce, y mantiene paridad o ventaja en capacidades generales. Los datos detallados de contexto, licencia y formatos de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Especializacion: el ajuste esta orientado a comercio electronico de WeChat; en dominios muy alejados puede degradar respecto a modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar atributos de producto o referencias de catalogo; se recomienda validacion contra fuentes estructuradas en produccion.
- Sesgos: no se documentan en la informacion disponible los sesgos especificos del entrenamiento; al proceder de datos de una plataforma comercial china, pueden existir sesgos culturales y de catalogo.
- Cuantizacion: el checkpoint FP8 puede presentar diferencias de calidad frente al BF16 original; la model card no publica la perdida exacta por cuantizacion.
- Requisitos de infraestructura: el despliegue FP8 exige GPUs con soporte nativo y un motor con cuantizacion por bloques (vLLM >= 0.31.0); motores sin este soporte no cargaran el checkpoint correctamente.
- Contexto largo: aunque se declaran 262.144 tokens, no se documenta el rendimiento real en tareas de recuperacion sobre contextos extremos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-FP8
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Variante GPTQ: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GPTQ
- Variante GGUF: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B-GGUF
- Coleccion de la familia WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Informe tecnico (Technical Report): enlazado desde la model card en Hugging Face
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Sitio corporativo de Tencent: https://www.tencent.com/
