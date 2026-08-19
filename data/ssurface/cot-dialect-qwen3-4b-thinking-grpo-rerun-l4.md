# ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l4

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l4` es un adaptador LoRA de tipo PEFT desarrollado por ssurface (Anatolii Frolov) que modifica el comportamiento del modelo base `Qwen/Qwen3-4B-Thinking-2507` para generar cadenas de pensamiento (chain-of-thought) comprimidas a un nivel denominado L4, donde el razonamiento interno se expresa mediante asignaciones encadenadas con punto y coma, en lugar de texto natural extenso. Este adaptador forma parte de una familia de "dialectos de compresión de CoT" que exploran cómo reducir drásticamente la longitud de los razonamientos intermedios sin perder demasiada precisión en tareas de razonamiento matemático.

Se trata de un artefacto de investigación publicado como ablación: el mismo nivel L4 pero entrenado con una configuración de recompensa distinta a la del modelo principal (`ssurface/cot-dialect-qwen3-4b-thinking-grpo-l4`), con el objetivo de que los resultados del diseño de recompensas puedan reproducirse de forma independiente. El adaptador se entrenó mediante GRPO sobre un modelo SFT fusionado, utilizando el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor. Alcanza un 81,2% de precisión exacta en el test de GSM8K (n=1317) con decodificación greedy y sin self-consistency.

Su relevancia radica en que aborda un problema emergente en la eficiencia de los modelos de razonamiento: el coste computacional y de latencia asociado a cadenas de pensamiento largas. Al comprimir el razonamiento interno a expresiones simbólicas muy cortas, este tipo de adaptadores permite estudiar el equilibrio entre expresividad del CoT, precisión y coste de inferencia, con implicaciones para el despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Thinking-2507) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base Qwen3-4B soporta 32k tokens segun documentacion oficial |
| Tipos de cuantizacion | No disponible; el adaptador se carga en bfloat16 sobre el modelo base (segun codigo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Thinking-2507`, un modelo de lenguaje denso de 4 mil millones de parametros con arquitectura transformer causal y modo de pensamiento activable. El adaptador LoRA (r=16, alpha=32) se entrena en dos fases: primero se fusiona con un adaptador SFT previo (`ssurface/cot-dialect-qwen3-4b-thinking-sft-l4`) que ya ha sido ajustado para producir razonamientos comprimidos a nivel L4, y posteriormente se aplica optimizacion con GRPO (Group Relative Policy Optimization) usando el `trl.GRPOTrainer` sobre transformers estandar con atencion `sdpa`. El conjunto de entrenamiento consiste en 6976 ejemplos de GSM8K reexpresados por un modelo profesor a nivel L4, con una longitud mediana de cadena de razonamiento de 41 caracteres dentro de la etiqueta `thinking`. La funcion de recompensa combina dos componentes: `correctness` (que pondera la coincidencia de respuesta por el numero de pasos de la solucion dorada) y `format` (que exige un bloque `thinking...response` seguido de `#### <respuesta>`). El entrenamiento se realizo con 8 generaciones por prompt, batch efectivo de 32, maximo de 256 tokens de completacion, learning rate 1e-05 y coeficiente KL de 0.0 (sin regularizacion de divergencia). Una nota tecnica importante: el autor verifico que los adaptadores producidos con kernels fusionados tenian matrices `lora_B` completamente nulas, por lo que todos los adaptadores publicados se validaron manualmente para garantizar que `lora_B != 0`.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas: el modelo genera razonamientos internos en un dialecto simbolico de nivel L4, con asignaciones encadenadas (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo drasticamente la longitud del CoT respecto al estilo natural.
- Generacion de texto en ingles: al estar basado en Qwen3-4B, conserva las capacidades generales de generacion y comprension del modelo base, aunque el adaptador esta especializado en el formato de razonamiento comprimido.
- Resolucion de problemas aritmeticos de varios pasos: evaluado en GSM8K, alcanza un 81,2% de precision exacta en el conjunto de test.
- Compatibilidad con el ecosistema PEFT: se carga como adaptador LoRA sobre el modelo base fusionado con el adaptador SFT correspondiente, permitiendo su integracion en pipelines de transformers.
- No se han documentado capacidades de tool calling, agentes, vision, audio ni razonamiento multimodal en la informacion proporcionada.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: el adaptador permite estudiar como afecta la reduccion de la longitud del CoT a la precision en tareas de razonamiento, comparando niveles L1 a L5 dentro de la misma familia de dialectos.
- Evaluacion de diseno de recompensas en RL: al ser una ablacion con una configuracion de recompensa distinta, sirve para reproducir y comparar el efecto de diferentes funciones de recompensa en el entrenamiento GRPO de modelos de razonamiento.
- Benchmarking de eficiencia de inferencia: al generar CoT extremadamente cortos, se puede medir el ahorro en latencia y coste computacional frente a modelos con razonamiento extenso, en escenarios de despliegue con restricciones de tiempo real.
- Generacion de datos sinteticos para entrenamiento: las cadenas comprimidas producidas por este adaptador pueden servir como ejemplos de razonamiento compacto para destilar o entrenar modelos mas pequenos.
- Analisis de robustez del razonamiento: al evaluar la degradacion de precision con problemas mas dificiles, se pueden identificar limites de los enfoques de compresion agresiva.
- Reproducibilidad academica: el adaptador publica los detalles completos de entrenamiento (hiperparametros, recompensas, verificacion de matrices) para que otros investigadores puedan replicar el experimento de ablacion.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 81,2% |

Resultado declarado por el autor en la model card, obtenido con decodificacion greedy, una sola pasada, sin ejemplos y sin self-consistency. No se han publicado comparaciones con otros modelos o con el modelo base sin adaptador en la informacion disponible. La model card advierte que la precision cae con la dificultad del problema y que, al ser una ablacion, puede ser inferior al modelo principal del mismo nivel (`ssurface/cot-dialect-qwen3-4b-thinking-grpo-l4`).

## Requisitos de hardware

- El entrenamiento del adaptador se realizo en una unica GPU NVIDIA A100 80GB (segun la model card).
- Para inferencia, el adaptador se aplica sobre el modelo base Qwen3-4B-Thinking-2507, que tiene 4 mil millones de parametros. En bfloat16, el modelo base ocupa aproximadamente 8 GB de VRAM, por lo que se puede ejecutar en GPUs consumer como RTX 3090, RTX 4090 o equivalentes con 12 GB o mas de memoria.
- Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), el modelo base puede caber en GPUs con 6-8 GB de VRAM, aunque el adaptador LoRA no esta disenado para cuantizacion directa y deberia aplicarse sobre el modelo cuantizado con herramientas compatibles con PEFT.
- Opciones de despliegue: al ser un adaptador PEFT, se integra con el ecosistema transformers y puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), siempre que se aplique la fusion con el adaptador SFT previo.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El adaptador pertenece a una familia de dialectos de compresion de CoT (niveles L1 a L5) publicados por el mismo autor, pero no se han incluido resultados de los otros niveles ni del modelo principal en la model card de esta variante. Como referencia cualitativa, el modelo base Qwen3-4B-Thinking-2507 sin adaptador es un modelo generalista de razonamiento con capacidades multilingues y modo thinking, mientras que este adaptador esta restringido a razonamiento matematico en ingles con CoT comprimido. No se puede establecer una comparacion cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con enunciados en ingles (GSM8K); su rendimiento en otras tareas o idiomas no esta verificado.
- La precision se degrada rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas agresivos (L4 y L5).
- Es una ablacion de investigacion: el autor indica que fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-thinking-sft-l4`) y fusionarlo con el modelo base antes de aplicar este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- El entrenamiento utilizo una sola semilla (salvo que el nombre del repositorio indique lo contrario), por lo que diferencias de pocos puntos porcentuales pueden deberse a ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2,7 puntos porcentuales en n=1317).
- Riesgo de alucinacion y errores aritmeticos inherente a los modelos de lenguaje, agravado por la compresion extrema del razonamiento que reduce la trazabilidad de los pasos intermedios.
- Licencia Apache-2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3-4B-Thinking-2507, se deben respetar tambien los terminos de licencia del modelo base (Apache-2.0 segun la documentacion de Qwen).
- No se documentan sesgos especificos, pero al entrenarse solo con GSM8K (problemas de matematicas en ingles) puede heredar sesgos del conjunto de datos original.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-thinking-grpo-rerun-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-thinking-sft-l4
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-thinking-grpo-l4
- Paper asociado (citado en la model card, sin URL publica en la informacion disponible): "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026)
