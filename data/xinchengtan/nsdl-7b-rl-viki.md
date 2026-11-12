# XinchengTan/nsdl-7b-rl-viki

## Resumen

NSDL 7B (VIKI-L2) es un checkpoint de investigación publicado por Xincheng Tan y colaboradores (Ke Wang, Yining Di, Minfeng Zhu) como parte del artículo «NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning». Se trata de un ajuste fino del modelo multimodal Qwen2.5-VL-7B-Instruct orientado específicamente a la planificación de tareas en entornos multi-robot, combinando supervisión fina (SFT) y aprendizaje por refuerzo (RL). El checkpoint publicado corresponde al paso 30 del entrenamiento RL, inicializado desde el checkpoint SFT del mismo proyecto.

El modelo hereda la arquitectura transformer multimodal de Qwen2.5-VL, con aproximadamente 8.290 millones de parámetros almacenados en bfloat16 (16,6 GB en el repositorio). Su entrada es imagen-texto y su salida es texto, con pipeline `image-text-to-text`. No es un modelo de propósito general: está diseñado para integrarse en el sistema NSDL, que combina razonamiento neuro-simbólico para repartir tareas entre varios robots.

Su relevancia es acotada pero clara para la comunidad de robótica y planificación: ofrece un punto de partida reproducible para investigar planificación multi-robot con modelos de lenguaje y visión, con licencia Apache-2.0 y pesos abiertos. Aun así, el modelo no cuenta con descargas ni validación externa en el momento de redactar esta ficha, y su uso está ligado al código de evaluación del repositorio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-VL) |
| Parametros totales | 8.292.166.656 (8,29 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imágenes y texto. Sobre esa base, el autor aplica un ajuste fino supervisado (SFT) seguido de un entrenamiento con aprendizaje por refuerzo (RL) en el dominio de planificación multi-robot. El checkpoint publicado es el paso 30 del run RL, inicializado desde el checkpoint SFT VIKI-L2 del mismo proyecto (script `scripts/rl_final_setting.sh` del repositorio NSDL).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni los detalles del algoritmo RL empleado. El artículo de referencia (arXiv, 2026) y el repositorio de código son las fuentes donde se describe el método neuro-simbólico de división del trabajo entre robots. No se documentan innovaciones arquitectónicas propias más allá del ajuste fino sobre la base Qwen2.5-VL; la contribución principal del trabajo es el sistema NSDL, no una nueva arquitectura de modelo.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto, heredados de Qwen2.5-VL-7B-Instruct.
- Planificación de tareas multi-robot: el ajuste está orientado a descomponer y asignar tareas entre varios agentes robóticos.
- Razonamiento agéntico multi-paso, según el uso previsto en el sistema NSDL (evaluación con `scripts/eval_lnsdl_agentic_viki_l2.py`).
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, según los tags del repositorio.
- Capacidades multilingües: no disponibles de forma explícita; se heredan las del modelo base, pero no se documentan.
- Tool calling / function calling: no documentado de forma específica para este checkpoint.

## Casos de uso

- Planificación de tareas en flotas de robots: el modelo puede recibir descripciones visuales del entorno y generar planes de asignación de tareas entre varios robots, que es exactamente el escenario para el que fue entrenado en el sistema NSDL.
- Investigación en razonamiento neuro-simbólico: sirve como componente neural del pipeline NSDL, encargado de proponer descomposiciones de tareas que luego valida el módulo simbólico.
- Reproducción de experimentos académicos: al publicarse los pesos junto con el código de evaluación, permite replicar los resultados de la fila «NSDL 7B (SFT + RL)» de la tabla I del artículo.
- Evaluación comparativa de planificación multi-robot: puede usarse como baseline RL frente a otros modelos multimodales en tareas de asignación y secuenciación.
- Prototipado de asistentes para operadores de robots: con entrada de imagen y texto, puede interpretar el estado visual de una escena y sugerir próximos pasos al operador.
- Docencia y experimentación con RL sobre modelos multimodales: el checkpoint intermedio (paso 30) permite estudiar la evolución del comportamiento durante el entrenamiento RL.
- Integración en pipelines de investigación con TGI: los tags indican compatibilidad con text-generation-inference, lo que facilita desplegarlo en entornos de evaluación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tabla I del artículo arXiv para los resultados del modelo, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,6 GB solo para pesos, más memoria para el procesador visual y el KV cache; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación cómoda con contexto largo; RTX 4090 (24 GB) puede ser suficiente en bfloat16 con batches pequeños.
- GPU de consumo: cabe en RTX 4090 y, con cuantización (no documentada oficialmente), podría caber en GPUs de 16 GB; no se han publicado pesos GGUF ni cuantizados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles. No se documenta soporte de vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSDL 7B (VIKI-L2) | 8,29 mil millones | No disponible | Planificación multi-robot (SFT + RL) | Apache-2.0 | Pesos abiertos en HF |
| Qwen2.5-VL-7B-Instruct | ~8 mil millones | No disponible en esta ficha | Multimodal general | Apache-2.0 | Pesos abiertos en HF |
| Modelos de planificación robótica comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa documentada es con su modelo base Qwen2.5-VL-7B-Instruct, del que hereda arquitectura, tokenizador y licencia. No se dispone de información sobre otros modelos de planificación multi-robot con los que compararlo.

## Limitaciones y advertencias

- Modelo de investigación: no hay descargas ni validación externa; su robustez en producción no está contrastada.
- Uso ligado al código del autor: la model card indica que debe cargarse y ejecutarse con el repositorio NSDL y su script de evaluación; el comportamiento fuera de ese pipeline no está documentado.
- Sesgos: no documentados, pero hereda los del modelo base Qwen2.5-VL y los del dataset de entrenamiento específico, no descrito.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en planificación robótica, un plan incorrecto puede tener consecuencias físicas, por lo que requiere validación simbólica (que es precisamente el papel del componente NSDL).
- Contexto e idiomas: no se especifican la longitud de contexto efectiva ni los idiomas soportados para este ajuste.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo está pensado para investigación; conviene revisar las condiciones del modelo base y del artículo.
- Checkpoint intermedio: es el paso 30 de un run RL, no necesariamente el mejor checkpoint del entrenamiento.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones cuantizadas publicadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/XinchengTan/nsdl-7b-rl-viki
- Repositorio de código: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Artículo: «NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning» (Tan, Wang, Di, Zhu; arXiv preprint, 2026); referencia sin URL directa en la información disponible.
