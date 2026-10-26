# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3300-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3300-lora es un adaptador LoRA publicado por uygarkurt sobre el modelo instructivo Qwen2.5-0.5B-Instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador PEFT en safetensors, que deben cargarse sobre la base Qwen. Su objetivo es mejorar el tool calling estructurado y la abstención cuando las herramientas ofrecidas no son relevantes, mediante GRPO sobre el dataset xlam-tool-calling-mixed.

El entrenamiento realizó 3.300 actualizaciones GRPO en 2,4 horas. En la evaluación del autor, el adaptador mejora la precisión exacta de llamadas xLAM del 63,84% al 69,70% y la precisión de nombre de función del 90,03% al 93,83%, y sube ligeramente BFCL single-turn del 50,28% al 51,81%. Sin embargo, empeora la relevancia del 77,78% al 72,22% y retrocede levemente en MMLU, MATH-500 e IFEval. Es relevante para experimentos de alineación con GRPO en modelos pequeños y para despliegues de tool calling con recursos muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-0.5B-Instruct; la arquitectura del modelo base no se detalla en la información proporcionada |
| Parámetros totales | ~0,5 B en el modelo base; parámetros del adaptador no disponibles |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica el adaptador en safetensors |
| Idiomas soportados | Inglés (en), según la model card |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct. La model card no detalla la arquitectura interna del base, el rango del LoRA, alpha, dropout ni las capas objetivo. El entrenamiento parte directamente del modelo instructivo y aplica GRPO durante 3.300 actualizaciones, con un tiempo de bucle de 2,4 horas. El dataset es uygarkurt/xlam-tool-calling-mixed, orientado a llamadas de herramientas y a la abstención cuando las herramientas no son pertinentes.

La innovación principal es el uso de GRPO para tool calling en un modelo de 0,5 B, con recompensas que parecen priorizar la estructura de la llamada y la abstención. No se especifican la composición exacta del dataset, el número de tokens de entrenamiento, el esquema de recompensas ni si hubo RLHF/DPO adicional. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab sobre un holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 omitidos; BFCL se agrega a partir de subconjuntos seleccionados de single-turn.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling estructurado: entrenado para emitir llamadas con nombre de función y argumentos; mejora la precisión exacta xLAM y la precisión de nombre de función.
- Abstención ante herramientas irrelevantes: entrenado explícitamente para no llamar herramientas cuando no procede; la métrica de irrelevancia sube del 66,93% al 69,25%, aunque la de relevancia baja del 77,78% al 72,22%.
- Razonamiento y matemáticas básicas: conserva las capacidades limitadas del modelo base, con MMLU del 41,94% y MATH-500 del 15,00%.
- Seguimiento de instrucciones: IFEval del 26,25% en prompt-level strict accuracy.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos.
- No se documenta soporte multilingüe más allá del inglés.
- No se documenta soporte para agentes multi-paso; el foco declarado es el function calling estructurado y la abstención.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: dado un conjunto pequeño de funciones, el adaptador genera la llamada estructurada y puede abstenerse si ninguna aplica; es adecuado para entornos con poca VRAM o inferencia en CPU.
- Extracción de parámetros para APIs internas: convertir texto libre en argumentos de función para formularios, CRM o sistemas de ticketing, usando el esquema de herramientas como entrada.
- Atención al cliente de bajo coste: clasificar la intención y emitir una llamada a una función de consulta o creación de caso; el tamaño de 0,5 B permite desplegarlo en una GPU de consumo o en un servidor pequeño.
- Baseline de investigación en GRPO: reproducir un experimento de alineación para tool calling en 2,4 horas y comparar el adaptador con el modelo base en xLAM y BFCL.
- Filtro de abstención en pipelines de agentes: detectar consultas que no requieren herramienta para reducir llamadas innecesarias; debe calibrarse porque la caída de relevancia sugiere riesgo de rechazos incorrectos.
- Prototipos de function calling en CI: ejecutar pruebas de esquema, nombres de función y abstención en pipelines de integración sin necesidad de GPUs de gama alta.
- Evaluación de trade-offs de alineación: comparar base y adaptador para estudiar cómo GRPO mejora la estructura de llamada a costa de relevancia y de un ligero descenso en MMLU, MATH-500 e IFEval.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 63,84% | 90,03% | 50,28% | 77,78% | 66,93% | — |
| GRPO (este adaptador) | GRPO 3.300 | 41,94% | 15,00% | 26,25% | 69,70% | 93,83% | 51,81% | 72,22% | 69,25% | 2,4 |

xLAM ETC es precisión exacta de llamada de herramienta; xLAM FNA es precisión de nombre de función. Estas puntuaciones xLAM usan el holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 omitidos, en lugar del split de test del dataset mixto. BFCL Single-turn FC resume subconjuntos seleccionados de function calling single-turn de BFCL-v3; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa prompt-level strict accuracy. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB solo para los pesos del modelo base en FP16; con overhead de runtime, entre 2 y 3 GB. En cuantización de 4 bits, aproximadamente 0,3-0,6 GB para los pesos, más el adaptador, cuyo tamaño exacto no está disponible.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM, como RTX 3050, RTX 4060, GTX 1660 o superiores. No requiere A100 ni H100.
- Cabe en GPU de consumo y también puede ejecutarse en CPU para pruebas, aunque con latencia mayor.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre Qwen2.5-0.5B-Instruct. No se publican versiones GGUF, por lo que llama.cpp u Ollama requerirían convertir el modelo base y aplicar el adaptador por separado. El soporte en vLLM o TGI con LoRA no está verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | xLAM ETC | BFCL Single-turn FC | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen2.5-0.5B-Instruct | ~0,5 B | No disponible | 63,84% | 50,28% | No disponible | HuggingFace: Qwen/Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3300-lora | ~0,5 B + adaptador LoRA | No disponible | 69,70% | 51,81% | No disponible | HuggingFace: uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3300-lora |
| Otros adaptadores LoRA de tool calling | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparables |

La comparación directa con el modelo base muestra una mejora clara en xLAM ETC y FNA y una mejora moderada en BFCL, junto con un descenso en relevancia y un retroceso leve en MMLU, MATH-500 e IFEval. No se dispone de datos de benchmarks de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo base es muy pequeño: MMLU del 41,94%, MATH-500 del 15,00% e IFEval del 26,25%. Es esperable una alta tasa de errores en razonamiento, matemáticas y seguimiento de instrucciones complejas.
- Riesgo de alucinación en la generación de argumentos y nombres de función, especialmente con esquemas de herramientas grandes o ambiguos.
- Solo se declara inglés. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- La licencia no está disponible. No se puede asumir que el uso comercial esté permitido sin verificar la licencia del modelo base y del adaptador.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen2.5-0.5B-Instruct y el adaptador conjuntamente.
- La métrica de relevancia baja del 77,78% al 72,22%, lo que sugiere que el adaptador puede abstenerse en exceso o rechazar herramientas válidas. Conviene calibrar el umbral de abstención en producción.
- Los benchmarks son agregados específicos del estudio: xLAM usa un holdout de solo llamadas con 700 ejemplos omitidos y BFCL usa subconjuntos seleccionados. No son directamente comparables con leaderboards públicos.
- No se documentan sesgos, composición del dataset, medidas de seguridad ni comportamiento en conversaciones multi-turno.
- La longitud de contexto no está disponible, lo que impide planificar despliegues con prompts largos o historiales extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo3300-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Paper: no disponible
- Demo: no disponible
