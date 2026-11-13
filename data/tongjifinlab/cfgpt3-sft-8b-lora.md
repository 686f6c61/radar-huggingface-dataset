# TongjiFinLab/CFGPT3-sft-8B-LoRA

## Resumen

CFGPT3-sft-8B-LoRA es un adaptador LoRA de ajuste supervisado (SFT) publicado por TongjiFinLab sobre el modelo base Qwen/Qwen3-8B. Forma parte de la familia CFGPT, un conjunto de modelos de lenguaje orientados a escenarios financieros en chino. El adaptador se entrena sobre datos de instrucciones financieras intensivas en conocimiento (CFData-sft), construidos a partir de un corpus previo de textos financieros chinos (CFData-pt) que incluye anuncios, artículos financieros, exámenes, noticias e informes de investigación.

El modelo resuelve el problema de adaptar un LLM generalista de 8B parámetros a tareas financieras específicas en chino, como análisis de sentimiento de noticias, clasificación de entidades, respuesta a preguntas financieras y generación de texto especializado. Al ser un adaptador LoRA, no requiere reentrenar el modelo completo: se carga sobre Qwen3-8B mediante PEFT, lo que reduce el coste de almacenamiento (el repositorio ocupa 0,3 GB) y permite reutilizar la infraestructura del modelo base.

La relevancia actual reside en que demuestra una estrategia eficiente de especialización vertical (finanzas en chino) sobre un backbone moderno como Qwen3, con licencia Apache 2.0 y formato safetensors, pensado para integración vía transformers + peft. No obstante, la información pública disponible es limitada: no se detallan hiperparámetros de entrenamiento, número de tokens de SFT ni resultados numéricos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA vía PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only de 8B parámetros. La especialización se realiza en dos fases según la model card: primero un preentrenamiento continuado sobre CFData-pt (corpus financiero chino que incluye anuncios, artículos, exámenes, noticias e informes de investigación, junto con datos generales), y después un ajuste supervisado con CFData-sft, un conjunto de instrucciones financieras intensivas en conocimiento. Este repositorio concreta la segunda fase mediante LoRA (PEFT), no mediante ajuste completo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el rango y alpha de LoRA, ni si se emplearon técnicas de RLHF o DPO. La model card menciona únicamente SFT. La innovación técnica destacable es la eficiencia del enfoque: un adaptador de 0,3 GB sobre un backbone de 8B permite especialización vertical sin duplicar el modelo completo.

## Capacidades

- Generación de texto en chino con orientación financiera.
- Análisis de sentimiento sobre noticias financieras (ejemplo incluido en la model card: clasificación en neutro, positivo o negativo).
- Respuesta a preguntas y tareas de conocimiento financiero derivadas de CFData-sft.
- Clasificación e identificación de entidades y eventos financieros (según la descripción de CFBenchmark: tareas de reconocimiento, clasificación y generación).
- Soporte de tool calling / function calling: no disponible (no confirmado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: limitadas a zh según el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Análisis de sentimiento de noticias financieras: el adaptador está entrenado para clasificar noticias (positivas, negativas, neutras) con prompt específico, como muestra el ejemplo de la model card sobre resultados trimestrales y rating ESG.
- Asistencia a analistas para resumir anuncios e informes: al haberse entrenado sobre CFData-pt (anuncios, informes de investigación), puede sintetizar documentos financieros chinos.
- Preguntas y respuestas sobre conocimiento financiero: útil en atención interna o formación, respondiendo consultas sobre conceptos, exámenes y normativa presentes en el corpus.
- Clasificación y extracción de entidades financieras: para pipelines de procesamiento de noticias y filings, identificando empresas, eventos y métricas.
- Generación de borradores de textos financieros: redacción de notas o comentarios con terminología del dominio, siempre con revisión humana.
- Investigación académica sobre adaptación de dominio: al ser un LoRA ligero sobre Qwen3-8B, sirve como base reproducible para estudiar especialización vertical y comparar con ajuste completo.
- Integración en sistemas de monitorización de mercado: procesamiento de flujos de noticias en chino para generar alertas o etiquetas de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que CFGPT supera a varias líneas base de parámetros similares en tareas objetivas y subjetivas de CFBenchmark, pero no aporta cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B. En bfloat16 se requieren aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits o 4 bits (si se aplica al base) puede reducirse, aunque no se documenta compatibilidad específica del adaptador con cuantización.
- GPU recomendadas: A100, H100 o GPUs con al menos 24 GB de VRAM para bfloat16 sin cuantizar (por ejemplo RTX 4090 / L40S).
- GPU consumer: viable en RTX 4090 (24 GB) en bfloat16 con margen ajustado; en GPUs de 16 GB requeriría cuantización del modelo base.
- Opciones de despliegue: transformers + peft (método documentado), potencialmente vLLM con soporte LoRA, llama.cpp/Ollama si se fusiona o convierte el adaptador, y TGI con adaptadores si se configura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CFGPT3-sft-8B-LoRA | 8B (base) + LoRA | no disponible | apache-2.0 | Adaptador LoRA financiero zh sobre Qwen3-8B |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | no disponible en esta ficha | LLM generalista; no especializado en finanzas |
| CFGPT anteriores (familia CFGPT) | no disponible | no disponible | no disponible | Modelos financieros chinos de la misma línea, posiblemente con ajuste completo |

No se dispone de datos de rendimiento comparativo numérico ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el adaptador está declarado solo para chino (`zh`); su rendimiento en castellano no está validado.
- Riesgo de alucinación: como todo LLM, puede generar afirmaciones financieras incorrectas; requiere verificación humana, especialmente en contextos regulados.
- Sesgos: no se documentan sesgos específicos, pero el corpus financiero chino puede reflejar sesgos de fuentes y cobertura.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también la licencia del modelo base Qwen3-8B y las condiciones de los datos de entrenamiento.
- Producción: al ser un adaptador LoRA, requiere cargar primero el modelo base; no es un modelo autónomo. No se documentan hiperparámetros, versión de PEFT ni compatibilidad con cuantización, lo que añade incertidumbre operativa.
- Contexto: la longitud de contexto efectiva no está confirmada en la model card; no asumir la del base sin verificación.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validación externa limitados.

## Enlaces

- Hugging Face: https://huggingface.co/TongjiFinLab/CFGPT3-sft-8B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub CFGPT: https://github.com/TongjiFinLab/CFGPT
- Paper CFGPT (referenciado en la model card, sin URL explícita): no disponible
- Demo: no disponible
