# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-seed7-l5

## Resumen

Este modelo es un adaptador LoRA de ablación publicado por el investigador ssurface (Anatolii Frolov) como parte de un estudio sobre compresión de cadenas de pensamiento (chain-of-thought, CoT) en modelos de razonamiento. Se construye sobre el modelo base `allenai/Olmo-3-7B-Think` de AllenAI, un modelo de 7B con modo de razonamiento explícito, y fuerza al modelo a razonar en un nivel de compresión extremo denominado L5, donde la cadena de pensamiento se colapsa a una única expresión aritmética de muy pocos caracteres (mediana de 16 caracteres en el conjunto de entrenamiento).

El adaptador se entrena mediante GRPO sobre el modelo SFT L5 previamente publicado (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), utilizando exclusivamente el conjunto GSM8K. Su propósito no es ser un modelo de producción, sino un artefacto de investigación para evaluar el impacto del diseño de recompensas en la compresión del razonamiento. Publicado bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 0.2 GB, es relevante para investigadores interesados en eficiencia de inferencia, razonamiento comprimido y metodología de entrenamiento con refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (transformer decoder-only con modo thinking) |
| Parametros totales | Modelo base: 7B (no especificado con precision); adaptador LoRA: r=16, alpha=32, numero de parametros no publicado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentacion) |
| Tipos de cuantizacion | No especificado; el adaptador se distribuye en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `allenai/Olmo-3-7B-Think`, un modelo de la familia Olmo 3 de AllenAI preentrenado en el corpus Dolma 3 y postentrenado en los conjuntos Dolci. El modelo base incorpora un modo de razonamiento largo (thinking) que mejora tareas de matematicas y codigo. El adaptador LoRA (r=16, alpha=32) se entrena con GRPO utilizando `trl.GRPOTrainer` sobre transformers estandar con atencion sdpa, sin kernels fusionados. El conjunto de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados por un modelo profesor al nivel de compresion L5, con cadenas de razonamiento de mediana 16 caracteres.

El esquema de recompensas combina cuatro componentes: `correctness` (basado en la coincidencia con la solucion de referencia, ponderado por el numero de pasos), `format` (exige una estructura `thinking... response` seguida de `#### <answer>`), `chain` (un verificador que comprueba que la aritmetica escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo por longitud de la recompensa positiva, con suelo en 0.3). El entrenamiento se realizo en una unica GPU NVIDIA A100 80GB, con 8 generaciones por prompt, batch de 32 con acumulacion de 2, maximo de 256 tokens de completacion, learning rate 1e-05 y coeficiente KL 0.01. Una nota importante del autor: el uso de kernels fusionados producia adaptadores con matrices `lora_B` todas a cero, por lo que todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico con cadena de pensamiento comprimida a nivel extremo (L5), donde la cadena se reduce a una expresion aritmetica unica, por ejemplo `18/3*2=12`.
- Generacion de texto en formato estructurado: un bloque `thinking`, seguido de un bloque `response` y una respuesta final precedida de `####`.
- Ejecucion de verificacion aritmetica interna durante el entrenamiento (componente `chain`), lo que favorece que las cadenas generadas sean logicamente validas.
- No se documentan capacidades de tool calling, agentes, vision ni audio. El modelo esta limitado a razonamiento matematico sobre texto.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: permite estudiar como afecta la longitud del razonamiento a la precision en tareas aritmeticas, comparando niveles L1 a L5 dentro de la misma familia.
- Analisis del diseno de recompensas en GRPO: este adaptador es una ablacion especifica (con recompensa `gr3relaxed160`) que sirve para comparar el efecto de diferentes esquemas de reescaleo de longitud frente al modelo principal L5.
- Evaluacion de robustez de la compresion: se puede medir la degradacion de accuracy en problemas de dificultad creciente, ya que el autor indica que la precision cae mas rapido en los niveles comprimidos.
- Reproducibilidad de experimentos: al ser un artefacto publicado con configuracion detallada, permite replicar el entrenamiento y verificar los resultados declarados.
- Desarrollo de tecnicas de inferencia eficiente: el estudio de cadenas de razonamiento muy cortas puede inspirar metodos para reducir el coste computacional en modelos de razonamiento.
- Benchmarking de metodos de verificacion: el componente `chain` (verificador aritmetico) puede evaluarse de forma aislada para mejorar sistemas de validacion de respuestas.

## Benchmarks y rendimiento

El unico benchmark declarado por el autor en la model card es GSM8K (test, n=1317), con decodificacion greedy, una sola vuelta, sin ejemplos y sin self-consistency:

| Dataset | Metrica | Valor |
|---|---|---|
| GSM8K (test) | Accuracy (exact match) | 73.4% |

No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor advierte que, al tratarse de una unica semilla, diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2.7 puntos porcentuales en n=1317).

## Requisitos de hardware

- Inferencia: requiere la VRAM del modelo base Olmo-3-7B-Think. En bfloat16, un modelo de 7B ocupa aproximadamente 14-16 GB, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Con cuantizacion (GGUF, AWQ) puede ejecutarse en GPUs de 8-12 GB.
- Entrenamiento: el autor utilizo una unica NVIDIA A100 80GB. Con tecnicas de LoRA y batch pequeno, podria entrenarse en GPUs de 24 GB con optimizaciones de memoria.
- El adaptador en si es muy ligero (0.2 GB), por lo que el coste adicional sobre el modelo base es minimo.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en pipelines de HuggingFace. Tambien es posible fusionarlo con el modelo base y exportarlo a formatos como GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no se han publicado datos. La compresion L5 reduce drasticamente el numero de tokens generados en la cadena de pensamiento, lo que deberia reducir la latencia frente al modelo base sin compresion, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | GSM8K (test) | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (L5, gr3relaxed160) | 7B base + LoRA | no disponible | 73.4% | Apache 2.0 | Ablacion con recompensa gr3 |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` | 7B base + LoRA | no disponible | no publicado | Apache 2.0 | Modelo principal del nivel L5 |
| `allenai/Olmo-3-7B-Think` (base sin adaptador) | 7B | no disponible | no publicado | Apache 2.0 | Modelo base con razonamiento largo |

No se dispone de datos de benchmarks comparables para el modelo base ni para el modelo principal L5 en la informacion proporcionada. La comparacion cualitativa indica que este adaptador es un artefacto de ablacion, por lo que puede tener un rendimiento inferior al modelo principal del mismo nivel. No se conocen alternativas de otros autores con la misma tecnica de compresion de CoT.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra (GSM8K); no es adecuado para otras tareas sin fine-tuning adicional.
- La precision disminuye con la dificultad del problema, y esta caida es mas pronunciada en los niveles de compresion altos como L5.
- Es un artefacto de ablacion entrenado con una unica semilla (seed 7); las diferencias de unos pocos puntos porcentuales pueden deberse al ruido estadistico.
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y luego este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce el resultado declarado.
- No se garantiza que las cadenas comprimidas sean siempre semanticamente correctas fuera del conjunto de entrenamiento; el verificador `chain` solo se aplico durante el entrenamiento.
- No se documentan sesgos especificos, pero al estar entrenado solo en ingles y en datos de GSM8K, puede presentar sesgos relacionados con el contenido del dataset.
- Riesgo de alucinacion en problemas fuera de distribucion o con enunciados ambiguos, especialmente al forzar respuestas extremadamente comprimidas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion y no se recomienda su uso en produccion sin validacion adicional.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-seed7-l5
- Adaptador SFT L5 (requerido como paso previo): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Repositorio OLMo de AllenAI: https://github.com/allenai/OLMo
- Pagina de Olmo en AllenAI: https://allenai.org/olmo
- Cita del articulo (en la model card): Chain-of-Thought Compression Dialects, Frolov, A., 2026.
