# tyrant35/zils-flash-fue

## Resumen

zils-flash-fue es un ajuste fino (fine-tune) del modelo base joamCriff123/zils-flash-f1123b, un "soup" del chasis d3-flash de la familia Zils. El autor, tyrant35, lo publica como un modelo de decisión ("decision-model") orientado a tareas de elección entre opciones, y lo construye promediando dos LoRA de rango 64 (semillas 9221 y 9222) aplicados sobre las proyecciones MLP (gate, up y down) del modelo base.

El modelo cuenta con 8.392.695.024 parámetros en formato safetensors, lo que lo sitúa en la franja de los 8B, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 16,8 GB, coherente con pesos en precisión de 16 bits. La model card es extremadamente escueta y no documenta arquitectura, longitud de contexto ni idiomas soportados.

Su relevancia es limitada y muy específica: se trata de un experimento de ajuste sobre un modelo derivado, sin descargas ni interacciones en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta útil como referencia para quienes investigan técnicas de model souping y LoRA merging aplicadas a modelos de decisión, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del chasis d3-flash de Zils; no se detalla en la model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de referirse a él como "soup-pool body" del chasis d3-flash. El ajuste consiste en dos LoRA de rango 64 (semillas 9221 y 9222) entrenados sobre las proyecciones MLP (gate, up y down) del modelo base joamCriff123/zils-flash-f1123b, posteriormente promediados. No se especifica el número de tokens de entrenamiento ni la composición cuantitativa del dataset.

Los datos de entrenamiento declarados son datos públicos de las tareas de decisión de BigScience P3, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, además de prompts generados y públicos de decisión de uso de herramientas. Las etiquetas objetivo son las distribuciones de opciones del chasis z3 de referencia (vllm-sr/d3-ultra) actuando como profesor, mezcladas al 0,5 con la etiqueta gold cuando existe. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks.

## Capacidades

- Modelo de decisión: orientado a producir distribuciones sobre opciones de respuesta en tareas de elección múltiple y clasificación.
- Tareas de inferencia en lenguaje natural: entrenado con datos de NLI4CT y CLadder, lo que sugiere capacidad para razonamiento sobre implicación textual y razonamiento causal de tipo CLadder.
- Detección de sarcasmo e ironía: incluye iSarcasmEval en el conjunto de entrenamiento.
- Análisis de sentimiento y atribución: entrena con VAST, un benchmark de análisis de sentimiento con valoración y topics.
- Verificación de hechos: incluye HoVer, orientado a verificación multi-salto.
- Búsqueda y relevancia de productos: entrena con Amazon ESCI, tarea de relevancia en consultas de comercio electrónico.
- Uso de herramientas: incorpora prompts de decisión de tool-use, lo que apunta a capacidad de seleccionar herramientas o acciones.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de relevancia en buscadores de comercio electrónico: el modelo se ha entrenado con Amazon ESCI, por lo que puede puntuar la relevancia entre una consulta y un producto dentro de un pipeline de ranking.
- Verificación de afirmaciones en dominios documentales: gracias al entrenamiento con HoVer y NLI4CT, puede emplearse para decidir si un pasaje respalda o refuta una afirmación en un sistema de fact-checking.
- Moderación de tono y detección de sarcasmo: útil en foros o reseñas para señalar mensajes irónicos o sarcásticos que los clasificadores convencionales pasan por alto.
- Enrutado de consultas a herramientas en agentes: los prompts de tool-use permiten usar el modelo como cabecera de decisión que elige qué herramienta invocar antes de delegar en un modelo generativo mayor.
- Razonamiento causal en asistentes analíticos: el entrenamiento con CLadder lo hace adecuado para responder preguntas de tipo "¿qué pasaría si...?" en entornos controlados de análisis de datos.
- Etiquetado asistido en anotación de datasets: al producir distribuciones de opciones, puede usarse para preetiquetar y priorizar revisiones humanas en tareas de NLI y sentimiento.
- Investigación sobre merging de LoRA: sirve como caso de estudio reproducible de souping de adaptadores de rango 64 sobre proyecciones MLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks durante el desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8,5-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precisión completa con contexto amplio; RTX 4090 (24 GB) para FP16 en contextos moderados.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: vLLM o TGI para safetensors en FP16; conversión a GGUF mediante llama.cpp u Ollama si se necesita ejecución en CPU o GPU de gama baja, aunque no hay conversiones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-flash-fue | 8,39 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| joamCriff123/zils-flash-f1123b (base) | no disponible | no disponible | no disponible | Hugging Face |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | Amplia, muy extendida |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 K | Apache 2.0 | Amplia, muy extendida |

La comparación con modelos de propósito general es solo orientativa: zils-flash-fue es un modelo de decisión especializado y no un asistente conversacional, por lo que no es directamente intercambiable con Llama o Mistral en tareas generativas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Model card mínima: no documenta arquitectura, contexto, idiomas ni sesgos, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación y calibración deficiente: al entrenarse contra distribuciones de un profesor (vllm-sr/d3-ultra) mezcladas con etiquetas gold, las probabilidades de salida pueden estar mal calibradas para decisiones críticas.
- Sesgos de los datasets de origen: iSarcasmEval, VAST y Amazon ESCI tienen dominios y poblaciones específicas; el modelo puede heredar sesgos de dominio, idioma y demografía.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base joamCriff123/zils-flash-f1123b no documenta su licencia en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- Sin cuantizaciones oficiales ni pipelines declarados: el campo pipeline figura como no disponible, y no hay GGUF ni versiones de 4 u 8 bits publicadas por el autor.
- Madurez nula: cero descargas y cero interacciones en el momento de la consulta; no hay comunidad ni soporte.
- Fecha de creación futura en los metadatos (2026-11-23), lo que sugiere posibles inconsistencias en la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-flash-fue
- Modelo base: https://huggingface.co/joamCriff123/zils-flash-f1123b
- Dataset BigScience P3: https://huggingface.co/datasets/bigscience/P3
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- VAST (sentiment analysis): https://github.com/cbaziotis/vast
- CLadder: https://github.com/causalNLP/cladder
- NLI4CT: https://github.com/IBM/nli4ct
- Amazon ESCI: https://github.com/amazon-science/esci-data
- HoVer: https://github.com/hover-nlp/hover
