# Virg1n/LectureNotes-Qwen3-4B-SFT

## Resumen

LectureNotes-Qwen3-4B-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario Virg1n, orientado a la generación de apuntes de clase en LaTeX, figuras y hojas de referencia (cheat sheets) dentro de un entorno de verificación automatizado. El modelo no está pensado como un chat genérico, sino como la política interna del agente LectureNotes, que le solicita pasos cortos y comprobables: un plan en JSON, una sección de LaTeX, una figura en matplotlib o TikZ, reparaciones SEARCH/REPLACE a partir de los errores del compilador, consultas de imágenes y una hoja de referencia. Un arnés determinista se encarga de validar, compilar, renderizar y puntuar cada paso.

El modelo parte de la arquitectura Qwen3 de 4B parámetros (4.022.468.096 parámetros reales según los pesos en safetensors) y conserva la licencia Apache 2.0 del modelo base. Su relevancia radica en que demuestra un flujo completo de entrenamiento con verificación: el SFT reduce drásticamente los errores de compilación y las reparaciones necesarias frente al modelo base, y sirve como punto de partida para la etapa posterior de RL con GRPO (LectureNotes-Qwen3-4B-GRPO). Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y su uso previsto exige respetar los formatos de prompt exactos definidos en el repositorio del arnés.

El contexto de entrenamiento y despliegue documentado es de 16.384 tokens (`--max-model-len 16384` en el ejemplo con vLLM). El modelo está etiquetado únicamente en inglés y su rendimiento como chat general equivale al de Qwen3-4B-Instruct, sin mejoras adicionales fuera del flujo del agente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), ajuste fino SFT sobre Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configuración documentada de despliegue) |
| Tipos de cuantización | no disponible (pesos publicados en fp16; el autor menciona `--dtype half` en vLLM) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso Qwen3 de 4B parámetros, obtenido por ajuste fino supervisado del instructivo Qwen3-4B-Instruct-2507. El entrenamiento SFT se realizó en dos etapas con LoRA (r64/α128, aplicado a todas las proyecciones, en fp16 sobre GPU V100) y posteriormente se fusionó en los pesos completos en fp16. Los datos de entrenamiento combinan secciones de apuntes de clase de arXiv verificadas por el arnés y con licencias permisivas, tareas de caption→TikZ de DaTikZ, reparaciones sintéticas con inyección de errores (tanto de LaTeX como de figuras) y trayectorias completas del agente generadas por un profesor Qwen3-14B. La etapa 1 cubrió 43.500 ejemplos de todos los tipos de tarea; la etapa 2, 5.500 ejemplos en el estilo objetivo de apuntes.

La innovación principal no está en la arquitectura, sino en el bucle de verificación: el modelo solo produce pasos cortos y comprobables que un arnés determinista valida, compila, renderiza y puntúa. Sobre esta base se entrenó después una etapa de RL con GRPO (LoRA nueva sobre el modelo SFT fusionado), con una recompensa compuesta por figuras (0,25), longitud (0,2), cobertura (0,25) y estructura (0,3), multiplicada por sustancia y penalizada por correcciones, cajas overfull, repetición y relleno, con KL β = 0,02 contra la política SFT, grupos de 8 rollouts y 64 prompts por ronda. La recompensa alcanzó su máximo alrededor de la ronda 20 y se degradó después, por lo que se publicó el adaptador de esa ronda.

## Capacidades

- Generación de secciones de apuntes de clase en LaTeX dentro de un formato de prompt específico.
- Generación de figuras mediante matplotlib o TikZ a partir de descripciones.
- Producción de planes en JSON para estructurar una lección.
- Reparaciones SEARCH/REPLACE guiadas por la retroalimentación del compilador de LaTeX.
- Generación de hojas de referencia (cheat sheets).
- Consultas de imágenes (image queries) para localizar figuras.
- Razonamiento multi-paso dentro del agente LectureNotes, limitado a pasos cortos y verificables.
- No se documenta soporte de tool calling genérico ni function calling fuera del arnés.
- Capacidades multilingües: solo inglés.
- Modo de pensamiento (thinking), visión o audio: no disponibles.

## Casos de uso

- Generación automatizada de apuntes de clase: el modelo produce secciones LaTeX que el arnés compila y valida, lo que permite crear material docente a partir de un tema y unas diapositivas de partida, como en el ejemplo del perceptrón.
- Creación de figuras didácticas: genera diagramas en matplotlib o TikZ que se renderizan y se someten a lint, útil para ilustrar conceptos en material educativo con verificación automática.
- Reparación de documentos LaTeX: dado el feedback del compilador, el modelo aplica parches SEARCH/REPLACE, lo que reduce las llamadas de reparación por sección de 1,77 (modelo base) a 0,89 (SFT).
- Producción de hojas de referencia: genera resúmenes condensados de un tema para repaso rápido, con control de longitud (error del 9 % frente al 16 % del base).
- Integración en pipelines de generación de material docente: al ser un modelo de 4B, puede servirse con vLLM en una GPU modesta y encadenarse con el arnés para producir lotes de apuntes con compilación garantizada.
- Punto de partida para experimentos de RL: el modelo sirve como política inicial para entrenar con GRPO u otras técnicas de refuerzo, tal como hizo el autor con la variante LectureNotes-Qwen3-4B-GRPO.
- Evaluación de agentes con verificación determinista: útil como banco de pruebas para estudiar cómo un modelo pequeño se comporta cuando cada paso se valida automáticamente.

## Benchmarks y rendimiento

Resultados sobre 30 temas reservados (held-out) con el mismo arnés, según la model card:

| Métrica | Qwen3-4B base | SFT | GRPO (ronda 20) |
|---|---|---|---|
| Primeros borradores que compilan | 80 % | 100 % | 100 % |
| Figuras renderizadas y limpias de lint | 44 % | 82 % | 87 % |
| Error de longitud | 16 % | 9 % | 7 % |
| Cobertura de puntos clave | 94,0 % | 94,6 % | 95,6 % |
| Recompensa media por sección | 0,74 | 0,80 | 0,82 |
| Llamadas de reparación por sección | 1,77 | 0,89 | 0,92 |
| Unidades eliminadas tras reparaciones fallidas (por lección) | 0,9 | 0 | 0 |
| Juez VLM: figuras relevantes / irrelevantes | ≈98 % / 0 % | 88 % / 6 % | 89 % / 6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.022 millones de parámetros en fp16 se requieren aproximadamente 8 GB solo para los pesos, más memoria para el contexto y el runtime.
- GPU recomendadas: el autor entrenó en V100; para servicio, una GPU con al menos 16 GB de VRAM es un punto de partida razonable, aunque no se documenta una recomendación oficial.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más (por ejemplo, RTX 4080/4090) en fp16, y en configuraciones menores si se cuantiza, aunque no se publican pesos cuantizados.
- Opciones de despliegue: vLLM, con el comando documentado `vllm serve Virg1n/LectureNotes-Qwen3-4B-SFT --served-model-name student --dtype half --max-model-len 16384`. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LectureNotes-Qwen3-4B-SFT | 4,02 B | 16.384 tokens (despliegue documentado) | Apache 2.0 | SFT para apuntes LaTeX en arnés de verificación |
| Qwen3-4B-Instruct-2507 (base) | 4 B | no disponible en esta ficha | Apache 2.0 | Chat e instrucciones generales |
| LectureNotes-Qwen3-4B-GRPO | 4,02 B (derivado) | 16.384 tokens (mismo arnés) | Apache 2.0 | RL con GRPO sobre el SFT |

La comparación con modelos de la misma categoría fuera del linaje Qwen3 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las figuras son la parte más débil: algunos diagramas son incorrectos o tienen etiquetas solapadas, y algunas imágenes web resultan fuera de tema.
- El modelo a veces copia el contenido de las diapositivas de forma inexacta y escribe prosa de relleno.
- Riesgo de errores factuales: el autor recomienda revisar siempre los apuntes generados.
- Solo está etiquetado en inglés; no se documenta soporte de otros idiomas.
- El modelo espera exactamente los formatos de prompt definidos en `prompts/templates.py` del repositorio del arnés; fuera de ese flujo se comporta como Qwen3-4B-Instruct sin ventajas.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los datos de entrenamiento derivados de arXiv y DaTikZ.
- El rendimiento del juez VLM en figuras relevantes baja del ≈98 % del base al 88 % en SFT, con un 6 % de figuras irrelevantes.
- La recompensa del entrenamiento GRPO se degradó tras la ronda 20, lo que sugiere inestabilidad en el proceso de RL más allá de ese punto.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); las métricas disponibles son específicas del arnés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Virg1n/LectureNotes-Qwen3-4B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante GRPO: https://huggingface.co/Virg1n/LectureNotes-Qwen3-4B-GRPO
- Código del arnés: https://huggingface.co/Virg1n/LectureNotes-harness
