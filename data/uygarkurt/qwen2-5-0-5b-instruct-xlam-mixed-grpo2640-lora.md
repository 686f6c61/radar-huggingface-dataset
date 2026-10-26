# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo2640-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-grpo2640-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (formato PEFT/safetensors) que debe cargarse sobre el modelo base original de Qwen. Su objetivo concreto es mejorar el *tool calling* estructurado y, de forma destacable, la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento se ha realizado con Group Relative Policy Optimization (GRPO) partiendo directamente del modelo instructivo, sin una fase previa de supervised fine-tuning supervisado según la model card. Se ejecutaron 2.640 actualizaciones de GRPO sobre el dataset uygarkurt/xlam-tool-calling-mixed, con un tiempo de bucle de entrenamiento de 1,9 horas. El resultado es un adaptador muy ligero (el repositorio ocupa 0,0 GB redondeados) pensado para experimentación rápida en entornos con recursos muy limitados.

Su relevancia es principalmente metodológica: demuestra que es posible mejorar métricas de function calling y de abstención en un modelo de 0,5 mil millones de parámetros con un coste de entrenamiento inferior a dos horas, a cambio de una degradación mínima en MMLU (42,04 % a 41,80 %) y una mejora en xLAM ETC (63,84 % a 69,70 %) y en la tasa de irrelevancia correctamente detectada (66,93 % a 73,08 %).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA acoplado mediante PEFT |
| Parametros totales | 0,5 mil millones en el modelo base; número exacto de parámetros del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen2.5-0.5B-Instruct (no verificado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base dispone de versiones GGUF, AWQ y GPTQ mantenidas por la comunidad |
| Idiomas soportados | Inglés (`en` según la model card); el modelo base Qwen2.5 es multilingüe, pero el adaptador no declara otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere cargarse sobre los pesos del modelo base |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Actualizaciones de entrenamiento | 2.640 pasos de GRPO |
| Tiempo de entrenamiento | 1,9 horas (solo bucle de entrenamiento, sin carga de modelo ni evaluación) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atención causal estándar y RoPE. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) inyectadas en las capas del modelo base, gestionadas con la librería `peft`. No se especifican en la model card el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleados.

El entrenamiento utiliza GRPO, una variante de optimización por política relativa a un grupo de muestras que evita la necesidad de un modelo crítico separado, partiendo directamente del checkpoint instructivo. Se realizaron 2.640 actualizaciones sobre el dataset mixto de tool calling, con un tiempo declarado de 1,9 horas. No se menciona ninguna fase de RLHF, DPO ni SFT adicional, ni se detalla la composición del dataset más allá de su nombre y de que incluye ejemplos de herramientas irrelevantes para forzar el comportamiento de abstención. El pipeline de entrenamiento es el repositorio Post-Training Lab del mismo autor.

## Capacidades

- Generación de texto conversacional e instrucciones generales, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas a función en formato estructurado, evaluado con las métricas xLAM ETC (exact tool-call accuracy) y xLAM FNA (function-name accuracy).
- Abstención ante herramientas irrelevantes: el adaptador está entrenado explícitamente para no invocar funciones cuando el conjunto de herramientas ofrecido no cubre la consulta, con una mejora de 66,93 % a 73,08 % en la métrica de irrelevancia.
- Seguimiento de instrucciones con formato estricto, medido con IFEval en precisión estricta a nivel de prompt (26,80 % a 27,73 %).
- Razonamiento matemático básico (MATH-500: 15,80 % a 16,00 %), muy limitado por el tamaño del modelo.
- Capacidades multilingües: no declaradas para el adaptador; la model card solo lista inglés.
- No dispone de visión, audio, thinking mode explícito ni otras modalidades.
- No se documenta soporte de agentes multi-paso ni de razonamiento encadenado más allá del propio esquema de function calling.

## Casos de uso

- Clasificación y enrutado de consultas con abstención: desplegar el adaptador como primer nivel de un sistema de atención al cliente que decide si debe llamar a una herramienta (consultar pedido, cancelar suscripción) o responder que no puede atender la petición. La mejora en la métrica de irrelevancia (73,08 %) lo hace adecuado para reducir llamadas espurias a funciones.
- Prototipado rápido de agentes con herramientas: al ejecutarse en CPU o en una GPU de gama baja, permite validar esquemas de function calling y prompts de sistema en cuestión de segundos antes de migrar a un modelo mayor.
- Extracción de argumentos en pipelines de datos: generar llamadas JSON con nombres de función y parámetros para tareas de automatización interna, con la ventaja de que el adaptador está entrenado contra el esquema xLAM.
- Evaluación comparativa de técnicas de RL: sirve como referencia reproducible (2.640 pasos de GRPO, 1,9 horas) para investigar el efecto de GRPO sobre modelos instructivos pequeños sin disponer de clústeres grandes.
- Filtrado previo en sistemas RAG con herramientas: decidir si la consulta del usuario requiere invocar una API externa o puede resolverse con el contexto recuperado, evitando costes innecesarios de llamadas.
- Docencia y experimentación con LoRA y PEFT: el tamaño reducido del adaptador facilita demostrar el flujo completo de carga, fusión y despliegue con `transformers`, `peft` y `vLLM` en un portátil.
- Despliegue en dispositivos con restricciones de memoria: al requerir alrededor de 1 GB de VRAM en fp16 para el modelo base, es viable en Raspberry Pi, iGPU o entornos serverless con límites estrictos, siempre que la tarea sea de clasificación o tool calling simple y no de razonamiento complejo.

## Benchmarks y rendimiento

Resultados declarados por el autor. Todas las puntuaciones son porcentajes. La primera fila corresponde al modelo base original y la segunda al adaptador GRPO tras 2.640 actualizaciones.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04 % | 15,80 % | 26,80 % | 63,84 % | 90,03 % | 50,28 % | 77,78 % | 66,93 % | — |
| GRPO (este adaptador) | GRPO 2.640 | 41,80 % | 16,00 % | 27,73 % | 69,70 % | 93,14 % | 50,70 % | 77,78 % | 73,08 % | 1,9 |

Notas del autor sobre la metodología: xLAM ETC es exactitud exacta de llamada a herramienta y xLAM FNA es exactitud del nombre de función; ambas se calculan sobre el holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 omitidos. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno, y Relevance/Irrelevance corresponden a los subconjuntos de relevancia seleccionados; son agregados específicos del estudio y no directamente comparables con los leaderboards públicos. IFEval usa precisión estricta a nivel de prompt.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16/bf16: aproximadamente 1 GB solo para pesos, más caché KV; en la práctica, entre 1,5 y 2 GB para contexto moderado.
- VRAM estimada en cuantización de 4 bits del modelo base: del orden de 0,3 a 0,5 GB, con la advertencia de que el adaptador LoRA debe fusionarse antes de cuantizar o cargarse en un runtime que soporte adaptadores sobre pesos cuantizados.
- El adaptador en sí ocupa unos pocos megabytes (el repositorio se redondea a 0,0 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como T4 o L4 en cloud. También es viable en CPU, iGPU y dispositivos tipo Raspberry Pi para inferencia por lotes.
- Cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), `vLLM` con soporte multi-LoRA, `TGI` con adaptadores, y `llama.cpp`/`Ollama` tras fusionar los pesos con `merge_and_unload` y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA GRPO) | 0,5 mil millones | 32.768 tokens (heredado del base) | Tool calling estructurado y abstención | No disponible | Adaptador PEFT; requiere el modelo base |
| Qwen2.5-0.5B-Instruct (base) | 0,5 mil millones | 32.768 tokens | Instrucciones generales, sin especialización en herramientas | Apache 2.0 (modelo base) | Pesos completos en HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones | 32.768 tokens | Instrucciones generales, mayor capacidad de razonamiento | Apache 2.0 (modelo base) | Pesos completos en HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | No disponible en esta ficha | Instrucciones generales en modelo pequeño | Apache 2.0 | Pesos completos en HuggingFace |

El adaptador solo supera al modelo base en las métricas específicas de tool calling y abstención; en MMLU queda ligeramente por debajo (41,80 % frente a 42,04 %). Frente a modelos de 1,5 a 1,7 mil millones de parámetros no hay comparación directa publicada en la información disponible, y en tareas de razonamiento general es esperable que un modelo de mayor tamaño rinda mejor, aunque no se aportan cifras que lo confirmen.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial. Es imprescindible contactar con el autor o verificar la licencia antes de cualquier despliegue en producción.
- Es un adaptador, no un modelo autónomo: sin cargarlo sobre Qwen/Qwen2.5-0.5B-Instruct no funciona, y la versión del modelo base debe coincidir con la empleada en el entrenamiento.
- Idiomas: la model card solo declara inglés; el comportamiento en castellano no está evaluado y previsiblemente degradará tanto el formato de las llamadas como la abstención.
- Tamaño muy reducido: con 0,5 mil millones de parámetros, la capacidad de razonamiento y de matemáticas es limitada (MATH-500 en torno al 16 %), y la tasa de alucinación en nombres de función y argumentos puede ser alta en esquemas complejos.
- Riesgo de sobreajuste al esquema del dataset xlam-tool-calling-mixed: el formato exacto de las herramientas y de los prompts de sistema condiciona el rendimiento; esquemas muy distintos pueden degradar la precisión.
- Las métricas presentadas son agregados específicos del estudio (subconjuntos seleccionados de BFCL-v3, holdout de solo llamadas en xLAM) y no son directamente comparables con resultados publicados en leaderboards.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.
- El entrenamiento de 2.640 pasos sobre un único dataset mixto, sin fase SFT previa declarada, puede producir inestabilidad en dominios alejados de la distribución de tool calling.
- Uso en producción: no se han publicado cifras de latencia, throughput ni tests de fiabilidad a largo plazo; conviene validar con un conjunto propio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo2640-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de chat sin relación con esta ficha y se han descartado.
