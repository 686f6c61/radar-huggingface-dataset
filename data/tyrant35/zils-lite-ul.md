# tyrant35/zils-lite-ul

## Resumen

zils-lite-ul es un modelo de decisión derivado del modelo base malkolm777/zils-lite-l22-correct-attn, publicado por el usuario tyrant35 en Hugging Face. Se trata de un "soup-pool" del cuerpo d3-lite al que se le han aplicado tres fine-tunes LoRA de rango 64, promediados por pesos y con la modificación media escalada por un factor de 1,3. El modelo cuenta con 852.985.920 parámetros totales y un repositorio de 1,7 GB en formato safetensors.

La especialización del modelo es la toma de decisiones sobre preguntas de opción múltiple y prompts de uso de herramientas. Para ello se entrenó con preguntas de decisión procedentes de los splits de entrenamiento de diversos datasets públicos (BigScience P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer) y con 6.000 prompts de decisión de uso de herramientas, públicos y generados. Los objetivos de entrenamiento son las distribuciones de opciones del chasis z3 de referencia (vllm-sr/d3-ultra) actuando como profesor, mezcladas al 0,5 con la etiqueta gold cuando esta existe.

Es relevante en el contexto de los modelos pequeños especializados en decisiones y enrutamiento de agentes: con menos de mil millones de parámetros ofrece una alternativa ligera para clasificación de opciones y selección de herramientas, aunque la información pública disponible es muy escasa y no se han publicado benchmarks, idiomas soportados ni detalles de arquitectura más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de zils-lite-l22-correct-attn, familia "zils d3-lite") |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el proceso de construcción como un "soup-pool": se parte del cuerpo d3-lite actual (malkolm777/zils-lite-l22-correct-attn), se realizan tres fine-tunes LoRA de rango 64 con tasa de aprendizaje 3e-5 y una sola pasada, se promedian por pesos y la modificación media respecto al modelo base se escala por 1,3. No se especifica la arquitectura interna (transformer, MoE, SSM u otra), el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la enumeración de fuentes.

Los datos de entrenamiento son preguntas de decisión de los splits de train de BigScience P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, además de 6.000 prompts de decisión de uso de herramientas públicos y generados. El objetivo de entrenamiento son las distribuciones de opciones del chasis z3 (vllm-sr/d3-ultra) como profesor, mezcladas al 0,5 con la etiqueta gold cuando existe. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks.

## Capacidades

- Toma de decisiones sobre preguntas de opción múltiple: el modelo está entrenado para producir distribuciones sobre opciones, no texto libre.
- Decisión de uso de herramientas: incluye 6.000 prompts específicos de decisión de tool-use, lo que sugiere capacidad para seleccionar o descartar herramientas en pipelines de agentes.
- Razonamiento sobre tareas de NLI y coherencia lógica: derivado del entrenamiento con NLI4CT y CLadder.
- Clasificación de intención o sarcasmo: por el entrenamiento con iSarcasmEval y VAST.
- Soporte de tool calling: no confirmado como API estándar; la evidencia es el entrenamiento con prompts de decisión de uso de herramientas.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo puede usarse como clasificador de decisión para elegir qué herramienta invocar en un pipeline de agente, dado que fue entrenado con 6.000 prompts de decisión de tool-use y distribuciones de opciones del chasis z3.
- Filtrado de ambigüedad en atención al cliente: al estar entrenado con preguntas de decisión de P3 y datasets de intención, puede clasificar la intención del usuario entre un conjunto cerrado de opciones antes de derivar a un modelo generativo mayor.
- Detección de sarcasmo e ironía: el entrenamiento con iSarcasmEval permite usar el modelo como clasificador auxiliar en moderación de comentarios o análisis de sentimiento.
- Verificación de coherencia en respuestas: con NLI4CT y CLadder, puede emplearse para etiquetar pares premisa-hipótesis o evaluar consistencia lógica en pipelines de validación.
- Clasificación de relevancia en búsqueda de productos: el entrenamiento con Amazon ESCI lo hace adecuado para etiquetar la relación entre consulta y producto (exacta, sustituta, complemento, irrelevante).
- Enrutamiento de bajo coste en producción: con menos de mil millones de parámetros y licencia Apache 2.0, puede desplegarse como primer filtro de decisión antes de invocar modelos mayores, reduciendo coste por consulta.
- Evaluación de decisiones en investigación: útil como baseline pequeño y reproducible para estudiar destilación de distribuciones de profesor en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks durante el entrenamiento, pero no aporta métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, unos 0,5 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas, incluidas las de gama media.
- Opciones de despliegue: al publicarse en safetensors, es compatible con transformers, vLLM y TGI; para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tyrant35/zils-lite-ul | 852.985.920 | no disponible | apache-2.0 | Hugging Face |
| malkolm777/zils-lite-l22-correct-attn | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| vllm-sr/d3-ultra | no disponible | no disponible | no disponible | Referenciado como profesor |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (modelos de decisión de menos de mil millones de parámetros) para establecer una comparativa de rendimiento. Los datos de parámetros, contexto y licencia de los modelos base y profesor no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta arquitectura, contexto, idiomas ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Especialización estrecha: está entrenado para producir distribuciones sobre opciones; no es un modelo generativo de texto libre y su uso fuera de tareas de decisión puede degradarse.
- Riesgo de alucinación en la distribución de opciones: al destilarse de un profesor (z3) mezclado con etiquetas gold al 0,5, las distribuciones pueden heredar sesgos del profesor.
- Sin evaluación en test: el autor confirma que no se usó ningún split de test de benchmarks, por lo que no hay evidencia publicada de generalización.
- Idiomas no documentados: no se puede asumir soporte multilingüe.
- Sesgos de los datasets de origen: iSarcasmEval, Amazon ESCI, HoVer y el resto pueden introducir sesgos de dominio, idioma y estilo que se transfieren al modelo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento y del modelo base.
- Sin descargas ni likes: el modelo no tiene tracción comunitaria, lo que reduce la probabilidad de que se hayan detectado problemas en uso real.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-ul
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- Referencia al profesor (chasis z3): vllm-sr/d3-ultra (no se proporciona URL directa en la información disponible)
- BigScience P3: no se proporciona URL en la información disponible
- iSarcasmEval: no se proporciona URL en la información disponible
- VAST: no se proporciona URL en la información disponible
- CLadder: no se proporciona URL en la información disponible
- NLI4CT: no se proporciona URL en la información disponible
- Amazon ESCI: no se proporciona URL en la información disponible
- HoVer: no se proporciona URL en la información disponible
