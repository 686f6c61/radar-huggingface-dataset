# theSOL1/qwen3-8b-pushback-drgrpo

## Resumen

El modelo `theSOL1/qwen3-8b-pushback-drgrpo` es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario theSOL1 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino realizado mediante la variante Dr. GRPO (una corrección del algoritmo GRPO) con el objetivo de mejorar el comportamiento del modelo ante instrucciones con "pushback", es decir, peticiones en las que el usuario reformula, cuestiona o presiona al modelo para que cumpla una instrucción concreta.

El adaptador se ha entrenado específicamente para la tarea de instruction-following evaluada con IFEval, usando un conjunto de 3.962 conversaciones en inglés con variaciones de redacción y un verificador binario como recompensa. El entrenamiento se realizó durante una época con semilla 42 y ocho respuestas por prompt, lo que indica un pipeline de aprendizaje por refuerzo con grupo base (group baseline), típico de los métodos de la familia GRPO.

La relevancia de este artefacto es acotada: se trata de un experimento de investigación reproducible (el autor enlaza la configuración y los pasos de reproducción en un repositorio de GitHub), no de un modelo listo para producción. Aporta evidencia empírica sobre cómo el ajuste con Dr. GRPO afecta al cumplimiento de instrucciones bajo presión conversacional, pero carece de benchmarks publicados en la información disponible y su licencia no está declarada de forma explícita más allá de la referencia a la licencia upstream de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-8B tiene 8.200 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B; el adaptador no la modifica) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable es la del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible de forma explícita; el autor indica que el LICENSE incluido es el upstream de Qwen3-8B (Apache License 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only de 8.200 millones de parámetros. El ajuste se realiza mediante PEFT con un adaptador LoRA de rango 16, lo que mantiene congelados los pesos del modelo base y entrena únicamente las matrices de baja dimensión. El repositorio ocupa 0,2 GB, coherente con el tamaño típico de un adaptador de este rango sobre un modelo de 8B.

El entrenamiento utiliza Dr. GRPO, una variante del algoritmo Group Relative Policy Optimization que corrige sesgos de longitud y de normalización presentes en GRPO estándar. El pipeline emplea un conjunto de entrenamiento con variaciones de redacción de "pushback" compuesto por 3.962 conversaciones en inglés, una recompensa binaria proporcionada por un verificador y ocho respuestas muestreadas por prompt con un baseline de grupo. Se realizó una sola época con semilla 42. La evaluación se llevó a cabo con la plantilla de chat de Qwen3 y `enable_thinking=False`, lo que desactiva el modo de razonamiento extendido del modelo base durante la inferencia evaluada.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés, con énfasis en el cumplimiento bajo reformulaciones y presión conversacional (pushback).
- Instruction-following evaluado con IFEval, con un verificador binario como señal de recompensa durante el entrenamiento.
- Razonamiento multi-turno dentro del contexto del modelo base Qwen3-8B.
- Capacidades heredadas del modelo base Qwen3-8B: generación de código, matemáticas y razonamiento general (no evaluadas específicamente en este adaptador).
- Soporte de tool calling y function calling: no disponible de forma específica en la información proporcionada (depende del modelo base).
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen3-8B soporta más idiomas.
- Modo thinking: la evaluación se realizó con `enable_thinking=False`; no se documenta el comportamiento con thinking activado.

## Casos de uso

- Investigación sobre robustez ante pushback: el adaptador sirve para estudiar cómo el ajuste con Dr. GRPO modifica la tasa de cumplimiento de instrucciones cuando el usuario reformula o presiona, usando IFEval como marco de evaluación reproducible.
- Reproducción de experimentos de RLHF/GRPO: el repositorio enlaza la configuración y los pasos de reproducción, lo que permite reejecutar el pipeline con el mismo conjunto de 3.962 conversaciones y semilla 42.
- Evaluación comparativa de algoritmos de preferencia: permite comparar Dr. GRPO frente a GRPO estándar sobre el mismo modelo base y conjunto de datos, aislando el efecto del algoritmo.
- Desarrollo de verificadores binarios para recompensas: el experimento documenta el uso de un verificador binario, útil como referencia para diseñar sistemas de recompensa en tareas de instruction-following.
- Análisis de sesgos de longitud en RL: al usar Dr. GRPO, el adaptador es un caso de estudio para medir si persisten sesgos de longitud en las respuestas generadas.
- Base para ajustes posteriores: al ser un adaptador LoRA de 0,2 GB, puede combinarse o compararse con otros adaptadores sobre Qwen3-8B en pipelines de experimentación con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el adaptador se evaluó sobre "held-out English pushback wording in IFEval", pero no se proporcionan cifras concretas de accuracy, win rate ni comparaciones numéricas con el modelo base u otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un overhead mínimo (0,2 GB) sobre el modelo base. Para Qwen3-8B en precisión completa (BF16) se estiman aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones basadas en el tamaño del modelo base y no están confirmadas en la información proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090, RTX 4080 o GPUs con 8-12 GB para cuantizaciones de 4-8 bits.
- Cabe en consumer GPU: sí, en RTX 4090 con BF16 y en GPUs de 8-12 GB con cuantización 4-bit del modelo base.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador mediante `PeftModel.from_pretrained`), vLLM (con soporte de adaptadores LoRA), llama.cpp y Ollama (requieren fusión o conversión del adaptador al formato del modelo base), TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theSOL1/qwen3-8b-pushback-drgrpo | Adaptador LoRA sobre 8.200 M | no disponible (heredada del base) | Adaptador PEFT | no disponible (upstream Apache 2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | 8.200 M | no disponible en esta ficha | Modelo completo | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA comparables sobre Qwen3-8B | variable | heredada | Adaptador PEFT | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparación se limita a parámetros, tipo de artefacto y licencia.

## Limitaciones y advertencias

- El adaptador está entrenado y evaluado únicamente en inglés; su comportamiento en castellano u otros idiomas no está documentado.
- No se han publicado métricas de benchmarks, por lo que no es posible cuantificar la mejora frente al modelo base Qwen3-8B.
- El entrenamiento se realizó con una sola época y semilla 42, lo que limita la robustez estadística de las conclusiones.
- El adaptador está diseñado para el escenario específico de pushback en IFEval; su generalización a otras tareas de instruction-following no está verificada.
- La licencia no está declarada explícitamente en el repositorio; el autor remite a la licencia upstream de Qwen3-8B (Apache 2.0), pero la ausencia de un LICENSE propio genera ambigüedad para uso comercial.
- Riesgo de alucinación: heredado del modelo base Qwen3-8B; no se documentan mitigaciones específicas en el adaptador.
- Sesgos conocidos: no documentados en la información proporcionada.
- El adaptador requiere cargar el modelo base Qwen3-8B con una revisión concreta (`b968826d9c46dd6066d109eabc6255188de91218`); usar otra revisión puede alterar el comportamiento.
- La evaluación se realizó con `enable_thinking=False`; el comportamiento con el modo thinking activado no está documentado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/theSOL1/qwen3-8b-pushback-drgrpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Configuración del experimento y pasos de reproducción: https://github.com/SOL1archive/AI-capstone/blob/72a8848/docs/wording-benchmark.md
- Repositorio del proyecto: https://github.com/SOL1archive/AI-capstone
