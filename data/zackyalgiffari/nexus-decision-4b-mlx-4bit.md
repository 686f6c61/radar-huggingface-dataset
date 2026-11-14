# zackyalgiffari/nexus-decision-4b-MLX-4bit

## Resumen

nexus-decision-4b-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo zackyalgiffari/nexus-decision-4b, un modelo de decisión tipada de 4.205.751.296 parámetros construido sobre Qwen3.5-4B. A diferencia de un modelo conversacional al uso, recibe un estado de aplicación y una o varias preguntas tipadas (elección entre opciones, binaria o puntuación por rúbrica) y devuelve, para cada pregunta, una de las opciones permitidas junto con una distribución de probabilidad calibrada y un valor de confianza. Está pensado para enrutamiento, triaje, puntuación y control de acceso dentro de pipelines de software, no para diálogo abierto.

El modelo se obtuvo por destilación de DeepSeek-V4.1-Flash (profesor) hacia Qwen3.5-4B (estudiante) mediante LoRA, usando como objetivos las etiquetas suaves del profesor y sus trazas de razonamiento. La variante aquí descrita está cuantizada a 4 bits para Apple Silicon y, según el autor, coincide con el modelo bf16 en el 100 % de 50 preguntas de prueba; la evaluación publicada se ejecutó sobre los pesos bf16.

Su relevancia actual radica en la combinación de precisión y calibración: declara 0,915 de accuracy y 0,0196 de ECE sobre preguntas con etiquetas humanas, superando al propio profesor en ambos ejes, con una sola pasada forward por pregunta (93 ms de p50 en una NVIDIA L4) y estabilidad frente a la reordenación de opciones. La licencia Apache-2.0 y el soporte multilingüe parcial lo hacen apto para integración comercial, con las cautelas propias de un modelo pequeño destilado y de un formato de pesos específico para MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: Gated DeltaNet + atención; conserva la torre de visión del modelo base |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); existen variantes bf16 (Transformers) y MLX 8 bits en la familia |
| Idiomas soportados | en, id, es, de, fr, pt, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

Otros datos relevantes: tipos de pregunta `choice`, `binary` y `score`; entre 2 y 26 opciones por pregunta; modos `fast` (un prefill, sin generación, por defecto) y `think` (traza `<think>` corta seguida de la misma lectura); temperaturas de calibración por modo en `nexus_config.json` (fast 0,975; think 1,683); tamaño del repositorio 2,4 GB.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura híbrida que combina capas Gated DeltaNet con atención y mantiene la torre de visión del modelo base. Sobre esa base se aplicó un proceso de destilación con LoRA desde DeepSeek-V4.1-Flash como profesor: los objetivos de entrenamiento fueron las etiquetas suaves (distribuciones de probabilidad) del profesor junto con sus trazas de razonamiento. Los datos de entrenamiento provienen de zackyalgiffari/nexus-decision-data, que integra BANKING77 y CLINC150 y escenarios de decisión sintéticos con etiquetas del profesor.

La innovación principal no está en la arquitectura sino en la interfaz y en la calibración: el modelo no genera texto libre, sino que realiza una lectura directa de la distribución sobre las opciones permitidas en una única pasada forward (modo `fast`), con una temperatura de calibración específica por modo almacenada en `nexus_config.json`. El modo `think` añade una traza corta de razonamiento antes de la misma lectura. La cuantización a 4 bits en MLX reduce el repositorio a 2,4 GB manteniendo, según el autor, coincidencia total con el modelo bf16 en una muestra de 50 preguntas.

## Capacidades

- Decisión tipada: responde preguntas `choice` (elegir una opción), `binary` (sí/no) y `score` (elegir un nivel de rúbrica), con entre 2 y 26 opciones por pregunta.
- Salida calibrada: devuelve una distribución de probabilidad sobre todas las opciones y un valor de confianza utilizable como umbral.
- Enrutamiento y triaje: selección de categoría, cola o ruta a partir de un estado de aplicación.
- Puntuación y gating: asignación de niveles de rúbrica y control de acceso condicional.
- Modo `think`: traza corta de razonamiento antes de la decisión, con temperatura de calibración propia.
- Estabilidad ante reordenación de opciones: el autor declara un 3,6 % de cambios al invertir el orden, frente al 11,1 % del modelo base.
- Multilingüe parcial: entrenado mayoritariamente en inglés, con cobertura menor de indonesio, español, alemán, francés, portugués y japonés.
- Visión: conserva la torre de visión del modelo base, aunque no se documentan en la información disponible casos de uso multimodales para este modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada; el modelo está diseñado como componente de decisión puntual, no como agente.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el estado del ticket (texto, canal, historial), el modelo elige la cola o el equipo adecuado entre las opciones permitidas y devuelve la confianza para derivar los casos ambiguos a revisión humana. Es adecuado por su precisión en clasificación de intenciones (BANKING77 y CLINC150) y por su calibración.
- Triaje de incidencias en producción: con un estado que describa el error, la severidad y el servicio afectado, decide entre niveles de escalado (`score`) o entre rutas de respuesta (`choice`), permitiendo umbrales de confianza para automatizar solo los casos seguros.
- Clasificación de intenciones en asistentes: integrado como paso previo a un LLM conversacional, selecciona la intención entre las permitidas y pasa la distribución al siguiente componente, reduciendo coste frente a generar texto libre.
- Control de acceso y gating: decide `binary` si una solicitud cumple las políticas definidas, con probabilidad calibrada para auditar decisiones limítrofes.
- Puntuación por rúbrica en evaluación: asigna niveles de rúbrica a respuestas o contenidos, útil en pipelines de moderación y calidad donde se necesita una etiqueta ordinal consistente.
- Decisión sobre Apple Silicon en local: la cuantización 4 bits MLX (2,4 GB) permite ejecutar el modelo en portátiles Mac para prototipado y despliegues de borde con baja latencia, sin depender de GPU dedicada.
- Automatización de decisiones de negocio en bucle: al ser una pasada forward sin generación (93 ms p50 en L4 en bf16), encaja en servicios de alta frecuencia donde el coste por decisión debe ser mínimo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Tarea / conjunto | Accuracy | Macro-F1 | ECE | Brier |
|---|---|---|---|---|
| Preguntas tipadas, nexus-decision-data (BANKING77 + CLINC150 test) | 0,915 | 0,8893 | 0,0196 | 0,1178 |
| Preguntas tipadas, escenarios sintéticos con etiquetas del profesor | 0,9078 | 0,8847 | 0,0214 | 0,1425 |

Datos adicionales aportados por el autor: +7,0 puntos de accuracy sobre el modelo base sin ajustar (IC 95 % de +5,3 a +8,7) sobre 1.200 preguntas retenidas con etiquetas humanas; comparación con el profesor en etiquetas humanas: accuracy 0,915 frente a 0,892 y ECE 0,020 frente a 0,070; con confianza ≥ 0,90 decide el 74 % de las preguntas con 1,8 % de error, y con ≥ 0,99 decide el 53 % con 0,3 % de error; latencia de 93 ms p50 en NVIDIA L4 (medida sobre el modelo bf16). No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX 4 bits ocupa 2,4 GB, por lo que la inferencia requiere del orden de 3 GB de memoria unificada en Apple Silicon, incluyendo overhead.
- GPU recomendadas: la variante bf16 de referencia se ejecuta en CUDA (se cita una NVIDIA L4 con 93 ms p50); esta variante 4 bits está orientada a Apple Silicon (M1, M2, M3, M4 y superiores).
- Cabe en GPU de consumo: sí en el formato MLX sobre Mac con memoria unificada; para GPUs NVIDIA de consumo habría que usar la variante bf16 de Transformers, cuyo requisito exacto de VRAM no está disponible.
- Opciones de despliegue: MLX (`mlx-lm`) para esta variante; Transformers (CUDA, CPU, MPS) para los pesos bf16 de referencia. vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible para este modelo.
- Latencia y throughput: 93 ms p50 por pregunta en NVIDIA L4 con el modelo bf16 en modo `fast` (una pasada forward, sin generación). No hay datos de throughput ni de latencia para la variante MLX 4 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (humanos) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nexus-decision-4b-MLX-4bit | 4B | no disponible | 0,915 (declarado) | 0,0196 | Apache-2.0 | Hugging Face (MLX 4 bits) |
| nexus-decision-4b (bf16) | 4B | no disponible | 0,915 (declarado) | 0,0196 | Apache-2.0 | Hugging Face (Transformers) |
| DeepSeek-V4.1-Flash (profesor) | no disponible | no disponible | 0,892 (declarado) | 0,070 | no disponible | no disponible |
| Qwen3.5-4B (base sin ajustar) | 4B | no disponible | 0,845 (implícito por +7,0 puntos) | no disponible | no disponible | no disponible |

La comparación se limita a los datos aportados por el autor; no se dispone de resultados de terceros ni de alternativas independientes de decisión tipada en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: está diseñado para responder preguntas tipadas con opciones acotadas; usarlo para diálogo abierto queda fuera de su interface previsto.
- Sesgos: no se documentan análisis de sesgo; al entrenarse mayoritariamente en inglés y sobre BANKING77 y CLINC150, puede heredar sesgos de dominio bancario y de asistencia al cliente.
- Riesgo de alucinación: mitigado por la restricción a opciones permitidas, pero la distribución calibrada puede ser errónea en estados de aplicación ambiguos o fuera de distribución; el autor recomienda tratar el estado como datos y no como instrucciones.
- Cobertura lingüística desigual: español, alemán, francés, portugués, indonésico y japonés están presentes en menor proporción que el inglés; el rendimiento en estos idiomas no está cuantificado en la información disponible.
- Contexto máximo: no disponible; no se puede planificar el uso con estados de aplicación largos sin verificarlo.
- Formato específico: esta variante solo funciona con MLX en Apple Silicon; para CUDA o CPU hay que usar los pesos bf16.
- Resultados no verificados: las métricas del model-index están marcadas como no verificadas y proceden del autor; la coincidencia 100 % con bf16 se declara sobre solo 50 preguntas.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones de los datos de entrenamiento (nexus-decision-data se distribuye como CC-BY-4.0).
- Proyecto independiente: el autor declara no estar afiliado a TypeSafe AI ni contener sus pesos, datos o código, pese a seguir su interface de "System One decision model".

## Enlaces

- Hugging Face: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-4bit
- Modelo base: https://huggingface.co/zackyalgiffari/nexus-decision-4b
- Variante MLX 8 bits: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-8bit
- Colección de variantes: https://huggingface.co/collections/zackyalgiffari/nexus-decision-4b-6af7fc5003be12bf9aa5b4c9
- Dataset: https://huggingface.co/datasets/zackyalgiffari/nexus-decision-data
- Código en GitHub: https://github.com/zackyalgiffari/nexus-decision-model-4b
- Protocolo de prompts: https://github.com/zackyalgiffari/nexus-decision-model-4b/blob/main/docs/protocol.md
- MLX LM: https://github.com/ml-explore/mlx-lm
