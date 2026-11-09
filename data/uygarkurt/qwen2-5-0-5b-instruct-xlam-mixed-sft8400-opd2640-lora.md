# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd2640-lora

## Resumen
El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd2640-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo completo, sino de pesos de adaptador (formato PEFT) que deben cargarse sobre el modelo original de Qwen. Su propósito concreto es el entrenamiento de tool calling estructurado y la abstención (abstention) cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El adaptador se entrena en dos fases: primero 8.400 actualizaciones de supervisión fina (SFT) y después 2.640 actualizaciones de destilación on-policy (OPD), donde un profesor congelado (Qwen/Qwen2.5-3B-Instruct) transfiere sus probabilidades de token al estudiante sobre las respuestas generadas por este último. El conjunto de datos utilizado es uygarkurt/xlam-tool-calling-mixed, orientado a la llamada de funciones y a la detección de irrelevancia.

Es relevante ahora porque aborda un problema práctico en sistemas de agentes: que un modelo pequeño no invente llamadas a herramientas cuando la consulta no encaja con ninguna de las disponibles. La evaluación muestra una mejora notable en la precisión de llamadas (BFCL Single-turn FC de 46,24% a 58,27%) y un comportamiento de abstención muy agresivo (Irrelevance del 88,59% al 11,58%), con un coste en otras métricas generales como MMLU o IFEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador; el base tiene ~0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la evaluación trunca prompts a 640 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros. El entrenamiento se realizó con la librería Post-Training Lab del autor y consta de dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera etapa aplica 8.400 actualizaciones de SFT (1,3 horas de entrenamiento). La segunda continúa ese adaptador con 2.640 actualizaciones de OPD (0,9 horas), en las que el estudiante aprende de las probabilidades de token del profesor Qwen2.5-3B-Instruct congelado sobre sus propias respuestas generadas. El tiempo total del bucle de entrenamiento fue de 2,2 horas, sin contar carga de modelo, preparación de datos ni evaluación externa.

La innovación técnica destacable es la combinación de SFT y destilación on-policy para una tarea de tool calling con abstención: el modelo debe decidir tanto cuándo llamar a una función como cuándo rechazar la petición por irrelevancia. No se dispone de información sobre la composición detallada del dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades
- Generación de texto conversacional en inglés.
- Tool calling / function calling estructurado: genera llamadas a funciones en formato estructurado según el esquema de herramientas ofrecido.
- Abstención ante herramientas irrelevantes: entrenado explícitamente para no llamar a funciones cuando ninguna encaja con la consulta.
- Razonamiento multi-step limitado, heredado del modelo base de 0,5B.
- Capacidades básicas de matemáticas y conocimiento general, aunque con rendimiento bajo (MATH-500 17,20%, MMLU 38,58%).
- Soporte multilingüe: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo thinking.

## Casos de uso
- Enrutado de herramientas en agentes ligeros: el adaptador decide si una consulta debe invocar una función y cuál, lo que permite desplegar un router de bajo coste en entornos con recursos limitados.
- Abstención en asistentes con catálogo de funciones cerrado: cuando el usuario pregunta algo fuera del alcance de las herramientas disponibles, el modelo tiende a rechazar la llamada, reduciendo invocaciones erróneas en producción.
- Prototipado rápido de pipelines de tool calling: al ser un adaptador LoRA sobre un modelo de 0,5B, se puede cargar y probar en hardware modesto antes de escalar a modelos mayores.
- Evaluación de estrategias de destilación on-policy: sirve como referencia reproducible para comparar SFT frente a SFT+OPD en tareas de function calling.
- Sistemas de clasificación de intención con salida estructurada: el modelo puede mapear consultas a esquemas de funciones predefinidos en asistentes de soporte o automatización interna.
- Investigación académica sobre calibración y abstención: útil para estudiar el equilibrio entre precisión de llamadas y rechazo de consultas irrelevantes en modelos pequeños.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT starting adapter | SFT 8.400 | 37,91% | 18,00% | 29,21% | 74,51% | 88,18% | 46,24% | 55,56% | 88,59% | 1,3 |
| SFT + OPD (este adaptador) | OPD 2.640 | 38,58% | 17,20% | 28,47% | 69,95% | 87,82% | 58,27% | 100,00% | 11,58% | 2,2 |

Notas de la evaluación: xLAM ETC es la precisión exacta de llamada a herramienta; xLAM FNA es la precisión del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de function calling de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware
- El adaptador LoRA es de tamaño reducido (el repositorio ocupa 0,0 GB según Hugging Face) y se carga junto al modelo base Qwen2.5-0.5B-Instruct.
- VRAM estimada para el modelo base en FP16: aproximadamente 1 GB; en cuantización de 8 bits, alrededor de 0,5-0,7 GB; en 4 bits, por debajo de 0,5 GB (estimaciones orientativas, no publicadas por el autor).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia en cuantización baja.
- Opciones de despliegue: transformers con PEFT, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), vLLM y TGI (previa fusión del adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | ~0,5B | no disponible | Sí, con abstención | no disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | ~0,5B | no disponible en la información | Parcial (no entrenado específicamente para abstención) | Qwen license (según modelo base) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | ~3B | no disponible en la información | Parcial | Qwen license (según modelo base) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias
- El adaptador está entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El comportamiento de abstención es muy agresivo: la métrica Irrelevance cae del 88,59% al 11,58%, lo que sugiere que el modelo puede rechazar llamadas válidas en producción. La métrica Relevance alcanza el 100%, pero debe interpretarse con cautela por el posible sesgo hacia el rechazo.
- El rendimiento en conocimiento general y matemáticas es bajo (MMLU 38,58%, MATH-500 17,20%), coherente con un modelo de 0,5B; no es adecuado para tareas de razonamiento complejo.
- La evaluación trunca prompts a 640 tokens, por lo que el comportamiento con contextos largos no está caracterizado.
- Riesgo de alucinación en la generación de argumentos de funciones y en la selección de herramientas fuera del conjunto de entrenamiento.
- La licencia no está declarada en la información disponible; debe verificarse antes de cualquier uso comercial, así como la licencia del modelo base Qwen2.5-0.5B-Instruct.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa.
- Al ser un adaptador PEFT, requiere cargar el modelo base original; no es un modelo autónomo.

## Enlaces
- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-opd2640-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
