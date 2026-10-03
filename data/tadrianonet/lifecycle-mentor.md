# tadrianonet/lifecycle-mentor

## Resumen

Lifecycle Mentor LoRA pilot es un adaptador LoRA experimental publicado por el usuario tadrianonet en HuggingFace. No es un modelo completo: se trata de un ajuste de bajo rango (LoRA) sobre Qwen/Qwen2.5-7B-Instruct, empaquetado en formato MLX para su uso en Apple Silicon mediante la librería mlx-lm. Su propósito declarado es servir como asistente educativo en portugués para guiar sobre el ciclo de vida de producto (PDLC) y el ciclo de vida de desarrollo de software (SDLC).

El interés del artefacto no reside en su rendimiento, sino en su carácter de experimento de ingeniería reproducible: la model card documenta explícitamente que el entrenamiento se hizo con seis ejemplos ficticios revisados por humanos (cuatro de entrenamiento, uno de validación y uno de test), 20 iteraciones de LoRA y unas pérdidas que el propio autor califica de no significativas. Con cero descargas y cero interacciones en el momento de la consulta, es un piloto de trazabilidad, no una herramienta lista para producción.

Por su tamaño y licencia conviene tratarlo como plantilla metodológica: muestra cómo publicar un adaptador MLX con configuración reproducible y salvaguardas de licencia, pero adolece de una base de datos de entrenamiento tres órdenes de magnitud por debajo de lo que exigiría cualquier afirmación de calidad, seguridad o fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2.5-7B-Instruct); el adaptador en si no define arquitectura propia |
| Parametros totales | No disponible para el adaptador (repo de 0,0 GB; tipicamente unos pocos MB). Modelo base: 7,61 mil millones de parametros segun documentacion publica de Qwen2.5 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador. El modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN segun su documentacion publica |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (formato de adaptador MLX). Se recomienda cargarlo sobre mlx-community/Qwen2.5-7B-Instruct-4bit. No se publican variantes GGUF ni AWQ/GPTQ |
| Idiomas soportados | Portugues como idioma objetivo declarado del ajuste. No hay evaluacion multilingue publicada para el adaptador |
| Licencia | cc-by-sa-4.0 para el adaptador; el modelo base Qwen/Qwen2.5-7B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | Adaptador LoRA en formato MLX (compatible con mlx-lm). No compatible de forma directa con llama.cpp, vLLM u Ollama sin conversion y fusion previas |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Framework de entrenamiento | MLX-LM LoRA sobre Apple Silicon |
| Fecha de publicacion | 2026-10-03 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente las matrices de bajo rango del adaptador LoRA, no los pesos del modelo base. La carga prevista es sobre `mlx-community/Qwen2.5-7B-Instruct-4bit` con una versión compatible de `mlx-lm`, lo que implica que toda la arquitectura subyacente (atención con query grouping, RoPE, SwiGLU, normalización RMSNorm) procede de Qwen2.5-7B-Instruct y no ha sido modificada estructuralmente. El adaptador únicamente desplaza un subconjunto de pesos en las capas que la configuración `training/config.yaml` determine, dato que no se reproduce en la model card.

El entrenamiento es deliberadamente mínimo: 20 iteraciones de LoRA sobre cuatro ejemplos de entrenamiento ficticios y revisados por humanos, con un ejemplo de validación y otro de test. La pérdida de validación pasó de 4,367 a 4,176 durante el piloto, y el único ejemplo reservado arrojó una pérdida de test de 3,890 con una perplejidad de 48,906. El propio autor advierte que estos valores se incluyen solo por reproducibilidad y no constituyen un benchmark significativo. Una perplejidad cercana a 49 sobre una única muestra indica una distribución de salida muy plana y una capacidad de generalización prácticamente nula. No se documenta uso de RLHF, DPO, decodificación especulativa ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en portugués orientada a la orientación educativa sobre PDLC y SDLC, según la intención declarada del autor.
- Modelado de conversación multi-turno heredado de Qwen2.5-7B-Instruct, aunque sin evaluación específica sobre el adaptador.
- Capacidades del modelo base no verificadas en el adaptador: razonamiento, generación de código, matemáticas, tool calling y modo de pensamiento estructurado, todas ellas presentes en Qwen2.5-7B-Instruct pero no reevaluadas tras el ajuste LoRA.
- No hay evidencia publicada de soporte de function calling, uso agéntico, capacidades de visión, audio ni modos de razonamiento extendido en este adaptador.
- No hay evaluación multilingüe: el único idioma declarado es el portugués.
- El adaptador no incorpora salvaguardas adicionales de seguridad más allá de las del modelo base.

## Casos de uso

- Prototipado de asistentes educativos en portugués: el adaptador sirve como punto de partida para experimentar con guías conversacionales sobre fases de descubrimiento, definición, desarrollo y entrega de producto, siempre sobre datos ficticios y sin uso en aula real.
- Investigación metodológica sobre ajuste LoRA en Apple Silicon: permite reproducir de principio a fin un ciclo de entrenamiento MLX-LM con configuración versionada, métricas de validación y test, y publicación del adaptador.
- Estudio de sobreajuste en datasets minúsculos: la combinación de pérdida de validación (4,176) y perplejidad de test (48,906) sobre una única muestra es un caso útil para ilustrar por qué seis ejemplos no permiten conclusiones de generalización.
- Plantillas de documentación de ciclo de vida: con supervisión humana, puede emplearse para generar borradores de artefactos de PDLC/SDLC (actas de requisitos, definiciones de historias de usuario) en portugués, revisando cada salida antes de su uso.
- Formación interna de equipos de ingeniería: desplegado localmente con mlx-lm, permite hacer demostraciones sin conexión a internet en talleres sobre buenas prácticas de ciclo de vida, con la advertencia explícita de que no debe fabricar métricas ni evidencia de investigación de usuarios.
- Evaluación de gobernanza de licencias: al combinarse un adaptador CC-BY-SA-4.0 con un modelo base Apache-2.0, el repositorio es un caso práctico para revisar obligaciones de atribución y copyleft en pipelines internos.
- Banco de pruebas para pipelines de evaluación: sirve como entrada de bajo riesgo para validar arneses de evaluación automática (perplejidad, fidelidad a instrucciones) antes de aplicarlos a adaptadores con datasets reales.
- Comparativa de eficiencia de despliegue en 4 bits: permite medir el coste de cargar un adaptador sobre `Qwen2.5-7B-Instruct-4bit` en memoria unificada de un Mac, con fines de planificación de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos valores numéricos de la model card son métricas de entrenamiento, que el propio autor califica de no significativas y que se reproducen aquí únicamente por trazabilidad.

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación inicial | 4,367 | Inicio del piloto |
| Pérdida de validación final | 4,176 | Tras 20 iteraciones LoRA |
| Pérdida de test | 3,890 | Una única muestra reservada |
| Perplejidad de test | 48,906 | Una única muestra reservada |
| Ejemplos de entrenamiento | 4 | Datos ficticios revisados por humanos |
| Ejemplos de validación | 1 | Datos ficticios revisados por humanos |
| Ejemplos de test | 1 | Datos ficticios revisados por humanos |
| MMLU, HumanEval, GSM8K, MT-Bench | No disponible | No evaluados para este adaptador |

## Requisitos de hardware

- Adaptador: tamaño de repositorio declarado de 0,0 GB, lo que indica un fichero de pesos de rango bajo de pocos megabytes. El coste real de memoria lo determina el modelo base.
- Modelo base en 4 bits (recomendado por el autor): del orden de 4 GB de memoria unificada o VRAM, según la cuantización de `mlx-community/Qwen2.5-7B-Instruct-4bit`.
- Modelo base en bf16: aproximadamente 15 GB de memoria, lo que exige GPU de 24 GB o superior (RTX 4090, A100 40 GB, H100) o un Mac con memoria unificada abundante.
- Cabe en GPU de consumo: el modelo base cuantizado a 4 bits sí cabe en GPUs de 8-12 GB, pero el adaptador está empaquetado en formato MLX, por lo que el despliegue directo está restringido a Apple Silicon (familias M1, M2, M3 y M4).
- Opciones de despliegue documentadas: `mlx-lm` y el servidor compatible con la API de OpenAI de mlx-lm sobre macOS. No se documentan recetas para vLLM, TGI, llama.cpp ni Ollama con este adaptador.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Alternativa de despliegue fuera de Apple Silicon: exigiría fusionar el adaptador con el modelo base y convertir los pesos a safetensors o GGUF, procedimiento no documentado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| lifecycle-mentor (este adaptador) | No disponible (adaptador LoRA) | No especificado | Adaptador MLX | CC-BY-SA-4.0 | Solo métricas de piloto con 6 ejemplos; no son un benchmark |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,61 mil millones | 32.768 tokens nativos, hasta 131.072 con YaRN | safetensors | Apache-2.0 | Benchmarks publicados por Qwen en su model card y en el informe tecnico Qwen2.5 |
| mlx-community/Qwen2.5-7B-Instruct-4bit | 7,61 mil millones | Igual que el base | MLX cuantizado a 4 bits | Apache-2.0 | No se publican metricas propias en la informacion disponible |
| Otros adaptadores LoRA de dominio en portugues | No disponible | No disponible | Variable | Variable | No disponible en la informacion proporcionada |

No se dispone de datos verificables que permitan comparar este adaptador con alternativas funcionalmente equivalentes de orientación educativa en portugués. La comparación relevante es con su propio modelo base, que conserva el 100 % del conocimiento previo al ajuste con seis ejemplos.

## Limitaciones y advertencias

- El adaptador fue entrenado con seis ejemplos en total. Cualquier afirmación de rendimiento, seguridad o fiabilidad factual carece de respaldo empírico y así lo reconoce el autor.
- La perplejidad de test de 48,906 sobre una única muestra reservada indica una capacidad de generalización mínima; el ajuste no puede considerarse funcional.
- Riesgo elevado de alucinación en contenidos de PDLC y SDLC (métricas, resultados de investigación de usuarios, evidencias). La model card prohíbe expresamente fabricar este tipo de contenido.
- La pérdida de validación apenas se movió entre el inicio y el final del piloto (4,367 a 4,176 en 20 iteraciones), lo que impide distinguir señal de ruido.
- El modelo no constituye una fuente de asesoramiento médico, legal ni profesional de ningún tipo.
- La licencia CC-BY-SA-4.0 del adaptador impone obligaciones de compartir igual sobre obras derivadas, mientras que el modelo base es Apache-2.0. Es necesario revisar la compatibilidad y los términos del dataset fuente antes de redistribuir o reutilizar.
- El adaptador está empaquetado en formato MLX, lo que limita el despliegue a entornos Apple Silicon con mlx-lm compatible; no es directamente utilizable en stacks de servidor basados en CUDA.
- No hay evaluación de sesgos, toxicidad ni robustez adversarial para este adaptador.
- No hay datos sobre comportamiento multilingüe: aunque el modelo base es multilingüe, el ajuste solo declara portugués y no se ha medido degradación en otros idiomas.
- Con cero descargas y cero interacciones, no existe validación externa de la comunidad ni informes de uso independientes.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/tadrianonet/lifecycle-mentor
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base cuantizado recomendado por el autor: https://huggingface.co/mlx-community/Qwen2.5-7B-Instruct-4bit
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Configuración de entrenamiento citada por el autor: `training/config.yaml` en el proyecto fuente (ruta no enlazada en la model card)
