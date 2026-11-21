# turion-ai/turion-jev-4b

## Resumen

Turion Jev 4B es un modelo de decisión desarrollado por Turion AI, obtenido mediante un ajuste fino (LoRA mergeado) sobre Qwen/Qwen3.5-4B. No es un modelo generativo: dada una situación (state) y un conjunto de preguntas tipadas (opción múltiple, sí/no o puntuación 0-5), devuelve una distribución de probabilidad sobre cada opción leída en un único forward pass. Resuelve el problema del enrutamiento y la clasificación estructurada con salidas calibradas numéricamente, en lugar de texto libre que hay que parsear.

Es el hermano pequeño de Turion Jev 31B: comparte dataset de entrenamiento (157.106 filas), formato de prompt y mecanismo de lectura, pero sobre una base de 4B parámetros que puede ejecutarse en un portátil mediante GGUF. Su relevancia práctica está en pipelines de agentes y sistemas de triaje donde se necesita una decisión probabilística rápida y barata (mediana de 86 ms por petición en un H200) en lugar de una generación completa.

La arquitectura subyacente es la del transformer de Qwen3.5-4B (solo la torre de texto, sin visión), con 4.205.751.296 parámetros totales, licencia Apache-2.0 y pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B), ajuste fino con LoRA r128 mergeado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 tokens en entrenamiento; rechaza prompts de más de 65.536 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado en turion-ai/turion-jev-4b-GGUF); pesos completos en BF16 |
| Idiomas soportados | no disponible (heredados de Qwen3.5-4B; no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only de Qwen3.5-4B y conserva únicamente el modelo de lenguaje: la torre de visión no está incluida en el checkpoint. El ajuste se realizó con LoRA de rango 128 y alpha 256 sobre todas las capas lineales, con learning rate 5e-05, 1.200 pasos de aproximadamente 65k tokens cada uno y secuencias de hasta 16.384 tokens. Las opciones se barajan durante el entrenamiento y las entradas de hasta 12.000 caracteres se repiten una vez en el prompt. La pérdida es entropía cruzada contra objetivos suaves (distribuciones de probabilidad) sobre los códigos de opción.

El mecanismo de inferencia es la innovación central: cada opción recibe un código de un solo token (A-Z y luego códigos de dos letras que también son tokens únicos), de modo que se leen hasta 255 opciones por pregunta en un solo paso. El readout toma los log-probabilidades del siguiente token de los códigos de opción, normalizados sobre las opciones mostradas, con una temperatura por tipo de pregunta ajustada sobre datos de retención (choice 1,07; yes/no 1,18; score 1,03). El checkpoint final es un soup uniforme de tres checkpoints (pasos 1100, 1150 y el último), mergeado sobre la base a escala 0,7 y guardado en BF16. El entrenamiento consumió unas 5 horas en una NVIDIA H200. El conjunto de datos es el mismo de Turion Jev 31B (157.106 filas); se verificó que ninguna fila de entrenamiento coincidiera con la suite Decision Index 0.3 mediante coincidencia de línea, solapamiento de 13-gramas y coincidencia exacta.

## Capacidades

- Clasificación estructurada con probabilidades calibradas: opción múltiple (hasta 255 opciones por pregunta), sí/no y puntuación 0-5, todo en un único forward pass.
- Enrutamiento y triaje: asignación de peticiones a equipos, colas o categorías con una distribución de probabilidad consultable.
- Lectura de estado con contexto largo: inputs de hasta 12.000 caracteres repetidos una vez en el prompt, con ventana de entrenamiento de 16.384 tokens.
- Salida numérica directamente consumible: no genera texto, por lo que no requiere parseo ni post-procesado de la respuesta.
- Múltiples preguntas por petición: el formato admite varias preguntas tipadas simultáneas sobre el mismo estado.
- Despliegue sin GPU: los GGUF Q4_K_M funcionan en CPU, Apple silicon o GPU pequeña mediante llama.cpp.
- Servidor compatible con endpoints: el paquete `turion_jev.serve` expone un endpoint `/v1/systemone` con backends gguf, vllm y hf.
- Integración con Decision Index: motor `turion_jev.kit_engine:TurionJev` para ejecutar la suite pública de evaluación.
- No soporta generación de texto, tool calling generativo, agentes multi-paso ni visión (la torre visual no está en el checkpoint).

## Casos de uso

- Triaje de tickets de soporte: cada ticket se envía como estado junto con preguntas de tipo choice (equipo responsable) y noul (¿requiere respuesta hoy?), y el sistema enruta con la probabilidad de cada opción en lugar de parsear texto libre.
- Enrutamiento en pipelines de agentes: dado el estado de la conversación, decidir qué herramienta o sub-agente invocar, usando la distribución sobre las opciones como señal de confianza para escalar a un humano si la probabilidad máxima es baja.
- Moderación y clasificación de contenido: preguntas sí/no y de puntuación 0-5 sobre políticas, con umbrales ajustables gracias a las temperaturas calibradas por tipo de pregunta.
- Priorización de colas: puntuación 0-5 de urgencia sobre descripciones de incidencias, con la ventaja de que la salida ya es una probabilidad normalizada y no un entero generado.
- Encuestas y anotación automática: convertir textos largos (hasta 12.000 caracteres) en etiquetas de opción múltiple para datasets, aprovechando la lectura en un solo paso y las hasta 255 opciones por pregunta.
- Despliegue en local o en el borde: con el GGUF Q4_K_M y llama.cpp, clasificar peticiones en un portátil o Apple silicon sin GPU, útil para prototipos y entornos con requisitos de privacidad.
- Evaluación comparativa de sistemas de decisión: ejecutar la suite Decision Index 0.3 con el motor incluido para medir el índice público del modelo en un pipeline propio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decision Index public index, suite 0.3 (estimado sobre muestra estratificada de 4.214 peticiones) | 51,2 |
| Proxy Full en conjuntos de retención (0,6 × dominios vistos + 0,4 × dominios nuevos) | 80,42 |
| Tiempo de petición en retención, una petición a la vez | mediana 86 ms · media 81 ms |
| Hardware de las cifras anteriores | una NVIDIA H200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,5 GB en BF16 para los 4,2B parámetros, más overhead de activaciones y KV cache; el repo completo ocupa 8,4 GB.
- Cuantización Q4_K_M: alrededor de 2,5-3 GB, ejecutable en CPU, Apple silicon o GPU pequeña mediante llama.cpp.
- GPU recomendadas: H200 (hardware de las cifras publicadas), A100 y H100 para vLLM en producción; RTX 4090 y GPUs consumer de 8-12 GB para BF16 o cuantizado.
- Cabe en GPU consumer: sí, con cuantización en GPUs de 6-8 GB y en BF16 en tarjetas de 12 GB o más.
- Opciones de despliegue: llama.cpp (backend gguf), vLLM (backend vllm), transformers (backend hf), servidor propio `turion_jev.serve` en el puerto 8020, y API hospedada de Turion con clave de workspace.
- Latencia y throughput: mediana de 86 ms y media de 81 ms por petición en un H200, una petición a la vez; no se publican cifras de throughput por lotes ni latencias en otros hardwares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 4B | 4,2B | 16.384 en entrenamiento; rechaza >65.536 | Modelo de decisión, salida probabilística en un forward pass | Apache-2.0 | Pesos en HF (safetensors y GGUF) y API hospedada |
| Turion Jev 31B | no disponible en la información proporcionada | no disponible | Mismo formato de decisión, mismo dataset | no disponible en la información proporcionada | Pesos en HF y API hospedada |
| Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Modelo generativo de propósito general | no disponible en la información proporcionada | Pesos en HF |

El 4B es el hermano pequeño del 31B: comparte datos, prompt y readout, pero la model card indica que queda por detrás en razonamiento difícil y en dominios alejados de sus datos de entrenamiento. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño: rinde peor que Turion Jev 31B en razonamiento difícil y en dominios alejados de los datos de entrenamiento; la propia card recomienda el 31B cuando la precisión importa más que el coste.
- Rechaza prompts de más de 65.536 tokens.
- La atención es la del modelo base; no lee el prompt de forma bidireccional, lo que puede penalizar tareas que requieren comprensión global del texto.
- Las probabilidades están calibradas sobre los datos de retención del autor; hay que verificar la calibración sobre datos propios antes de confiar en los valores numéricos.
- No genera texto ni soporta tool calling generativo: solo devuelve distribuciones sobre opciones predefinidas.
- Sin torre de visión: no procesa imágenes.
- Idiomas soportados no declarados explícitamente; el rendimiento multilingüe depende de la base Qwen3.5-4B y no está documentado.
- Riesgo de sesgo y alucinación heredado de los datos de entrenamiento y de la base; la model card no detalla sesgos conocidos.
- Licencia Apache-2.0 para los pesos, pero las fuentes de datos de entrenamiento conservan sus propias licencias, lo que puede afectar a usos comerciales concretos.
- El índice público (51,2) es una estimación sobre una muestra estratificada de 4.214 peticiones, no una medición exhaustiva de la suite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-4b
- GGUF: https://huggingface.co/turion-ai/turion-jev-4b-GGUF
- Modelo hermano 31B: https://huggingface.co/turion-ai/turion-jev-31b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Web de Turion AI: https://turion.ai
- Precios y límites de la API: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Repositorio Decision Index: https://github.com/apolinario/decision-index
