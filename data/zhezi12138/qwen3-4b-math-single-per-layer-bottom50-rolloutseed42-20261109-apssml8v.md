# zhezi12138/Qwen3-4B-math-single-per-layer-bottom50-rolloutseed42-20261109-apssml8v

## Resumen

Qwen3-4B-math-single-per-layer-bottom50-rolloutseed42-20261109-apssml8v es un ajuste fino experimental del modelo Qwen3-4B de Alibaba, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo, sino de un checkpoint resultante de 400 actualizaciones de aprendizaje por refuerzo (GRPO) sobre el modelo base, orientadas a mejorar el rendimiento en tareas matematicas. El experimento forma parte de una linea de investigacion sobre entrenamiento disperso (sparse training): en lugar de actualizar todos los parametros, solo se entrenan las 4 de 8 cabezas GQA con mayor importancia de gradiente en cada una de las 36 capas del transformer, dejando congelados el MLP, los embeddings, las normas, el LM head y los bloques de atencion no seleccionados.

El modelo es relevante como artefacto de investigacion para quienes estudian tecnicas de entrenamiento selectivo y eficiencia computacional en RL, no como un modelo listo para produccion. El repositorio contiene checkpoints distribuidos en formato Megatron (no safetensors de Transformers), lo que exige un entorno de entrenamiento especifico (Miles/Megatron Bridge) para cargarlo. El autor reporta una mejora en su evaluacion interna de prompts de matematicas del 44,5 % al 58,0 % tras las 400 actualizaciones, aunque se trata de puntuaciones sobre el mismo conjunto de prompts de entrenamiento, no de resultados en test held-out.

La licencia es Apache 2.0, heredada del modelo base, y el tamano del repositorio es de 16,1 GB, coherente con los checkpoints en precision completa de un modelo de 4.000 millones de parametros. No hay informacion sobre idiomas soportados ni sobre benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B base), con atencion GQA de 8 grupos por capa y 36 capas |
| Parametros totales | 4.000 millones (heredados de Qwen3-4B; no se especifica el recuento exacto en la model card) |
| Parametros activos | No aplica (no es MoE); en entrenamiento solo se actualizan las 4 de 8 cabezas GQA por capa y sus columnas de proyeccion de salida |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-4B, no confirmada) |
| Tipos de cuantizacion | No disponible (los checkpoints estan en formato Megatron distribuido, no en safetensors ni GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints distribuidos Megatron (`iter_0000199` e `iter_0000399`); no son safetensors de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only con atencion de consultas agrupadas (GQA) organizada en 8 grupos por capa y 36 capas. Sobre esa base, el autor aplica un esquema de entrenamiento disperso por capas: en cada una de las 36 capas se seleccionan las 4 de 8 cabezas GQA con mayor importancia de gradiente en la tarea de matematicas (seleccion "bottom50% por capa", distinta de una seleccion global del 50 % inferior). Solo esas cabezas y las columnas correspondientes de la proyeccion de salida reciben actualizaciones; el MLP, los embeddings, las normas, el LM head y los bloques de atencion no seleccionados permanecen congelados, con los gradientes congelados puestos a cero antes del clipping.

El entrenamiento consiste en 400 actualizaciones de RL con GRPO, partiendo de Qwen3-4B y usando semilla de rollout 42, 16 prompts por paso con 4 muestras cada uno (batch global de 64), tope de respuesta de 3072 tokens durante el rollout, tensor parallel de 2 y modo chat sin thinking. La tasa de aprendizaje es constante de 3e-6. El verificador usado tanto en entrenamiento como en evaluacion es `math` (no `dapo_math`). La evaluacion en entrenamiento se ejecuta antes de empezar y cada 10 actualizaciones, con una muestra por prompt, top_k 1, temperatura 1,0 y tope de respuesta de 4096 tokens, sobre el conjunto fijo de 1000 prompts de matematicas `dapo-math-eval-1000.jsonl`. El autor reporta 44,5 % antes del entrenamiento y 58,0 % tras las 400 actualizaciones, siempre sobre prompts de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento matematico: el ajuste se ha orientado especificamente a resolver problemas de matematicas, con verificacion automatica durante el RL.
- Razonamiento multi-paso en modo chat sin thinking (nonthinking chat), segun la configuracion de entrenamiento declarada.
- Capacidades heredadas del modelo base Qwen3-4B (generacion general, codigo, multilingueismo), aunque no se documentan en la model card y pueden haberse visto afectadas por el ajuste selectivo.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni de modos de pensamiento extendido en este checkpoint.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion en entrenamiento disperso: el checkpoint permite reproducir y analizar el efecto de actualizar solo el 50 % inferior de las cabezas de atencion por capa, comparandolo con el modelo base y con variantes de seleccion global. Es el uso principal para el que se publica el artefacto.
- Estudio de RL con GRPO en dominios acotados: sirve para examinar como evoluciona la recompensa del verificador `math` a lo largo de 400 actualizaciones y que capas concentran el aprendizaje.
- Analisis de importancia de gradientes: los checkpoints intermedios (`iter_0000199` e `iter_0000399`) permiten trazar que cabezas GQA se seleccionaron y como cambia su contribucion con el entrenamiento.
- Reproducibilidad de experimentos: el autor incluye el comando exacto, la mascara de cabezas, `evaluation_history.json`, `completion-eval-audit.json` y `SHA256SUMS.json`, lo que facilita replicar el pipeline en un entorno Miles/Megatron Bridge.
- Evaluacion comparativa de tecnicas de eficiencia: util para medir el coste computacional de entrenar solo un subconjunto de cabezas frente al ajuste completo, en un modelo de 4.000 millones de parametros.
- Base para experimentos derivados: un investigador puede partir de estos pesos Megatron para probar otras estrategias de seleccion (por ejemplo, bottom50 % global) y comparar curvas de evaluacion con la misma semilla y el mismo conjunto de prompts.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Evaluacion interna de matematicas (antes del entrenamiento) | 44,5 % | Sobre 1000 prompts de entrenamiento, no held-out |
| Evaluacion interna de matematicas (tras 400 actualizaciones) | 58,0 % | Sobre los mismos prompts de entrenamiento, no held-out |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | No disponible | No se han publicado resultados en la informacion proporcionada |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores son evaluaciones internas sobre prompts de entrenamiento y no deben interpretarse como rendimiento en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint, ya que esta en formato Megatron distribuido y no en safetensors ni GGUF. Para el modelo base Qwen3-4B en precision completa se necesitan aproximadamente 8 GB de VRAM; en cuantizacion de 4 bits, alrededor de 2,5-3 GB, pero estas cifras corresponden al base y no se confirman para este ajuste.
- GPU recomendadas: no especificadas en la model card. El entrenamiento uso tensor parallel de 2, lo que implica al menos 2 GPU para reproducir el pipeline.
- Cabe en GPU de consumo: probablemente si, tras convertir los pesos a safetensors y cuantizar, pero el autor no lo documenta ni proporciona pesos en ese formato.
- Opciones de despliegue: el autor indica cargar mediante el entorno de entrenamiento Miles/Megatron Bridge con la configuracion de Qwen3-4B. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-4B-math-single-per-layer-bottom50) | 4.000 M | No disponible | RL con GRPO y entrenamiento disperso por capas sobre Qwen3-4B | Apache 2.0 | Checkpoints Megatron en HF, 0 descargas |
| Qwen/Qwen3-4B (base) | 4.000 M | No disponible en esta ficha | Modelo generalista de Alibaba | Apache 2.0 | Ampliamente disponible en HF |
| Variantes de ajuste matematico de Qwen3-4B | 4.000 M | Depende de la variante | Ajuste supervisado o RL sobre el base | Variable | Multiples en HF, no comparadas aqui |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Las cifras de evaluacion (44,5 % y 58,0 %) son sobre prompts de entrenamiento, no sobre un conjunto held-out; no permiten afirmar mejora en generalizacion.
- El checkpoint esta en formato Megatron distribuido, no en safetensors ni GGUF; no es cargable directamente con `transformers`, vLLM o llama.cpp sin conversion previa.
- El estado del optimizador no se guarda, lo que limita reanudar el entrenamiento exactamente donde se dejo.
- El ajuste selectivo congela MLP, embeddings, normas y LM head; el impacto sobre capacidades generales (codigo, multilingue, conocimiento) no esta documentado y podria haberse degradado.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma; al heredar de Qwen3-4B, cabe esperar los sesgos del modelo base, pero no se cuantifican.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto es experimental y carece de garantias de calidad para produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- El nombre del modelo y la fecha (2026-11-09) sugieren un experimento de investigacion reciente; no hay publicacion o paper asociado en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-math-single-per-layer-bottom50-rolloutseed42-20261109-apssml8v
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- W&B del experimento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/apssml8v
