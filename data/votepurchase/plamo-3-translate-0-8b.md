# votepurchase/plamo-3-translate-0.8b

## Resumen

PLaMo 3 Translate 0.8B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN) y distribuido en Hugging Face a través del repositorio `votepurchase/plamo-3-translate-0.8b`, un espejo del repositorio oficial `pfnet/plamo-3-translate-0.8b`. Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en pares japonés-inglés y en combinaciones multilingües que incluyen el español. Admite contexto adicional y glosarios como entrada, y permite seleccionar entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

Con 890.344.960 parámetros (aproximadamente 0,8B), se posiciona como la variante más pequeña de una familia de cuatro tamaños (0,8B, 2B, 8B y 31B). Su relevancia actual reside en que ofrece traducción de calidad competitiva en un tamaño que cabe en hardware de consumo, con licencia comunitaria que permite uso personal, académico y no comercial sin registro previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, requiere `custom_code`) |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante entrenamiento) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit (variantes en repositorios separados) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (`license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, con 890 millones de parámetros. La model card no detalla la configuración interna de capas, cabezas de atención ni dimensiones ocultas, por lo que esos datos no están disponibles. El repositorio requiere `trust_remote_code` (etiqueta `custom_code`), lo que implica que la implementación de la arquitectura se distribuye junto con los pesos y no está integrada en `transformers` de forma nativa.

El entrenamiento parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, sobre el que se aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La ventana de entrenamiento cubre hasta 32.768 tokens combinando entrada y salida. La model card no especifica si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ni detalla la composición exacta del dataset más allá de su orientación a traducción.

## Capacidades

- Traducción entre 53 idiomas, incluyendo el español como origen y destino, con evaluación destacada en pares japonés-inglés y combinaciones con 14 idiomas adicionales.
- Traducción con contexto circundante: acepta texto de contexto para desambiguar términos y mantener coherencia en documentos largos.
- Traducción asistida por glosario: permite imponer terminología específica en la salida.
- Control de estilo en japonés: elección entre registro llano y registro cortés.
- Procesamiento de pasajes largos de hasta 32.768 tokens combinados de entrada y salida en una sola pasada.
- Especialización monolítica en traducción: no se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües amplias derivadas de su cobertura de 53 idiomas, incluyendo lenguas de bajos recursos como ceb, jv, si, sw, tl o ur.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas dentro de la ventana de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios y contexto previo, lo que reduce la fragmentación típica de traductores por frases.
- Localización de productos para mercados asiáticos y europeos: su cobertura de 53 idiomas, con especial madurez en japonés, permite abordar localizaciones multiidioma desde un único modelo de 0,8B desplegable en infraestructura modesta.
- Traducción jurada o administrativa con control de registro: en el par hacia japonés, la selección entre estilo llano y cortés permite ajustar la salida al registro exigido por documentos oficiales o comunicaciones corporativas.
- Subtitulado y traducción de contenido audiovisual: el tamaño reducido del modelo permite inferencia de baja latencia en GPU de consumo, adecuada para procesar lotes de subtítulos con contexto de diálogo previo.
- Atención al cliente multilingüe: integrado como capa de traducción en pipelines de soporte, puede normalizar consultas en 53 idiomas hacia un idioma pivote y devolver respuestas en el idioma del usuario, con glosarios que fijen terminología de producto.
- Traducción de corpus para investigación lingüística: su licencia permite uso académico sin registro, y el formato GGUF y MLX-4bit facilita su ejecución en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Preprocesado en pipelines de datos: traducción de datasets multilingües a un idioma común antes de entrenar otros modelos, aprovechando el bajo coste por token de un modelo de 0,8B.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas (PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés; FLORES+ chrF++ para combinaciones con 14 idiomas) frente a TranslateGemma y HY-MT2, pero no se proporcionan los valores numéricos en el texto disponible. La afirmación del autor es que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura; no se aportan cifras concretas para la variante de 0,8B.

| Benchmark | Resultado |
|---|---|
| PFTB, SaaS, WMT24++ COMET-22 (ja-en) | valores no disponibles en el texto (solo gráfica) |
| FLORES+ chrF++ (ja y en con 14 idiomas) | valores no disponibles en el texto (solo gráfica) |
| Comparativa de cuantizaciones | la model card indica que GGUF Q2_K pierde precisión en algunas métricas; el resto de formatos se mantiene cercano a BF16 (tablas truncadas en la información disponible) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantizaciones de 4 bits (W4A16, W4AFP8, NVFP4, MLX-4bit): en torno a 0,5-0,7 GB para pesos, con margen para contexto adicional.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, siendo las de gama alta útiles para alto throughput en batching.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 6 GB o más en BF16 y en GPU integradas o Apple Silicon con las variantes MLX-4bit y GGUF.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para BF16 y FP8; llama.cpp y Ollama para las variantes GGUF; MLX para las variantes MLX-4bit en Apple Silicon; vLLM y TGI no están confirmados en la información disponible para esta arquitectura con código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B | 890 M | 32.768 (entrada + salida) | 53 | PLaMo Community License | Hugging Face, múltiples cuantizaciones |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | Hugging Face, múltiples cuantizaciones |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | mencionado como comparación en la model card |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | mencionado como comparación en la model card |

No se dispone de parámetros, contexto ni licencia de TranslateGemma ni de HY-MT2 en la información proporcionada; solo se confirma que aparecen como referencia comparativa en las gráficas de calidad de traducción del autor.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- El modelo está especializado exclusivamente en traducción; no debe esperarse de él razonamiento general, generación de código, tool calling ni capacidades de agente.
- La ventana de 32.768 tokens es la suma de entrada y salida durante el entrenamiento; pasajes más largos deben dividirse, lo que puede degradar la coherencia entre segmentos.
- Riesgo de alucinación y de omisión de contenido en textos muy largos o con terminología muy especializada no cubierta por el glosario.
- No se documentan sesgos específicos por idioma ni evaluaciones de robustez; los idiomas de bajos recursos de la lista de 53 pueden presentar calidad inferior a la de los pares evaluados (japonés, inglés y los 14 idiomas de FLORES+).
- El repositorio `votepurchase/plamo-3-translate-0.8b` es un espejo no oficial con 0 descargas y 0 likes en el momento de la consulta; para producción conviene referenciar el repositorio oficial `pfnet/plamo-3-translate-0.8b`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar la implementación antes de desplegar en entornos sensibles.
- Las cuantizaciones de 2 bits (GGUF Q2_K) muestran pérdida de precisión en algunas métricas según la propia model card; para producción se recomienda 4 bits o superior.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/votepurchase/plamo-3-translate-0.8b
- Repositorio oficial BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante GGUF oficial: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
