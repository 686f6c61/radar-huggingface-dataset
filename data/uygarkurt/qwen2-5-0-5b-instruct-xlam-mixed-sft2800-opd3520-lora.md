# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd3520-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd3520-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct. Está diseñado específicamente para el entrenamiento de tool calling estructurado y la abstención cuando las herramientas ofrecidas resultan irrelevantes, un problema recurrente en sistemas de agentes donde el modelo debe decidir correctamente cuándo no invocar ninguna función. El adaptador se entrena en dos fases: un ajuste supervisado (SFT) de 2.800 actualizaciones seguido de una destilación on-policy (OPD) de 3.520 actualizaciones adicionales.

La relevancia de este modelo radica en su enfoque metodológico: utiliza un profesor congelado (Qwen2.5-3B-Instruct) del que el estudiante aprende a partir de las probabilidades por token sobre sus propias respuestas generadas, combinando SFT con OPD en un modelo de tan solo 0,5B parámetros. Esto lo sitúa como un caso de estudio práctico para investigadores interesados en destilación on-policy aplicada a tareas de function calling en modelos pequeños.

Se distribuye exclusivamente como pesos de adaptador (no como modelo completo), lo que implica que debe cargarse sobre el modelo base original Qwen2.5-0.5B-Instruct. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA sobre base de 0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizó con la librería Post-Training Lab del mismo autor y el dataset `uygarkurt/xlam-tool-calling-mixed`. La primera fase consistió en 2.800 actualizaciones de SFT (0,4 horas de entrenamiento), y la segunda en 3.520 actualizaciones de destilación on-policy (OPD) partiendo del adaptador SFT (1,3 horas adicionales), totalizando 1,7 horas de cómputo en el bucle de entrenamiento (excluyendo carga de modelo, preparación de datos y evaluación externa).

La innovación técnica principal es la OPD: el estudiante aprende de las probabilidades por token del profesor congelado Qwen2.5-3B-Instruct sobre las respuestas que él mismo genera, en lugar de limitarse a imitar respuestas estáticas. El objetivo declarado es doble: tool calling estructurado y abstención cuando las herramientas ofrecidas no son relevantes. El dataset mezcla ejemplos de function calling con casos de irrelevancia para entrenar ambas conductas simultáneamente.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Tool calling / function calling estructurado: genera llamadas a funciones en formato estructurado.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando ninguna es aplicable.
- Razonamiento básico y matemáticas (evaluado en MMLU y MATH-500, con resultados limitados).
- Seguimiento de instrucciones (evaluado en IFEval).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- **Sistemas de agentes con selección de herramientas**: el modelo puede decidir si invocar una función del catálogo ofrecido o abstenerse, gracias a su entrenamiento específico en relevancia e irrelevancia. Adecuado para orquestadores ligeros donde el coste por inferencia importa.
- **Prototipado de pipelines de function calling**: al ser un adaptador sobre un modelo de 0,5B, permite iterar rápidamente en el diseño de esquemas de herramientas y validar flujos antes de escalar a modelos mayores.
- **Investigación en destilación on-policy**: sirve como referencia reproducible de la combinación SFT + OPD con profesor congelado para estudiar el impacto en tareas de tool calling.
- **Filtrado de consultas en atención al cliente**: el modelo puede clasificar si una consulta requiere invocar una API concreta o si debe responderse sin herramienta, usando la señal de irrelevancia entrenada.
- **Enrutamiento de intenciones en asistentes de voz o chat**: con contexto corto y bajo coste, puede decidir qué función de un conjunto limitado activar en cada turno.
- **Evaluación comparativa de adaptadores LoRA**: útil como checkpoint de referencia para medir el efecto de la OPD frente al SFT puro en las mismas condiciones de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; la primera fila es el adaptador SFT inicial, la segunda el adaptador SFT + OPD actual):

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 3.520 | 39,78% | 18,80% | 29,94% | 67,09% | 86,92% | 57,38% | 100,00% | 10,07% | 1,7 |

Notas de la model card: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un adaptador sobre un base de 0,5B, el modelo completo en fp16 ocupa aproximadamente 1 GB de pesos, aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dada la escala del modelo base (0,5B), pero no confirmado en la información disponible.
- Opciones de despliegue: la librería indicada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B (base) | No disponible | Sí (entrenado) | No disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible | Parcial (capacidad general) | No disponible | Hugging Face |
| Adaptador SFT inicial del mismo autor | 0,5B (base) | No disponible | Sí (SFT) | No disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en esta información para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El rendimiento en MMLU (39,78%) y MATH-500 (18,80%) es bajo, coherente con un modelo de 0,5B; no es adecuado para tareas de razonamiento complejo.
- La exactitud de tool call (xLAM ETC) cae del 75,88% al 67,09% tras la OPD, y la exactitud de nombre de función (FNA) baja del 95,76% al 86,92%: la mejora en relevancia (100%) y BFCL (57,38%) viene acompañada de un deterioro en otras métricas.
- La tasa de irrelevancia baja al 10,07%, lo que puede indicar una tendencia a invocar herramientas incluso cuando no procede en algunos contextos; conviene validar este comportamiento en producción.
- Solo soporta inglés según la model card.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- Es un adaptador, no un modelo completo: requiere cargar Qwen2.5-0.5B-Instruct y aplicar los pesos LoRA.
- Riesgo de alucinación inherente a modelos pequeños; no se documentan mitigaciones específicas.
- Las evaluaciones xLAM omiten 743 ejemplos por el límite de 640 tokens de prompt, lo que puede sesgar los resultados.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd3520-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Profesor congelado (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
