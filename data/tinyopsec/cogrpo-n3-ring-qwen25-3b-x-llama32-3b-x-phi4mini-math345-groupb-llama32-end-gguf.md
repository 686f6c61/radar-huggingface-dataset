# tinyopsec/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `logan7000/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end`, un ajuste fino de 3.212.749.888 parametros derivado de `meta-llama/Llama-3.2-3B-Instruct`. El entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization), el metodo de optimizacion por politica relativa de grupo popularizado por el articulo DeepSeekMath, y esta orientado especificamente a razonamiento matematico sobre problemas de competicion de nivel 3, 4 y 5 del dataset `q1716523669/MATH-Level345`.

El modelo forma parte del experimento CogRPO N3 Ring, desarrollado por el usuario logan7000, que explora el merge heterogeneo de modelos y el aprendizaje por refuerzo multi-grupo. La variante `groupB-llama32-end` corresponde a la rama Llama-3.2-3B dentro de ese pipeline circular de ajuste fino. El nombre del repositorio sugiere la participacion de Qwen2.5-3B y Phi-4-mini en el experimento global, aunque esta variante concreta se apoya en la arquitectura Llama.

La relevancia practica de esta publicacion esta en el formato: el autor `tinyopsec` ha generado once cuantizaciones GGUF distintas (desde F16 hasta Q2_K) usando llama.cpp, lo que permite ejecutar un modelo afinado con RL para matematicas en hardware de consumo, incluso en CPU sin GPU dedicada. La ventana de contexto declarada es de 32.768 tokens y el unico idioma soportado oficialmente es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (11 ficheros, generados con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct: un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU, atencion con RoPE y GQA (grouped-query attention). El modelo base declara una ventana de contexto de 32.768 tokens, que se mantiene en las cuantizaciones GGUF. No hay innovaciones arquitectonicas propias: el interes del repositorio esta en el procedimiento de ajuste y en la cuantizacion, no en cambios estructurales.

El entrenamiento se realizo con GRPO, un algoritmo de optimizacion de politica sin modelo critico (critic-free) que estima la ventaja relativa de cada respuesta dentro de un grupo de muestras, siguiendo el enfoque descrito en el articulo DeepSeekMath (arXiv:2402.03300). El framework utilizado fue TRL. Los datos de entrenamiento corresponden al dataset `q1716523669/MATH-Level345`, compuesto por problemas de competicion de nivel 3, 4 y 5. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset, ni si hubo fases adicionales de SFT, DPO o RLHF fuera del propio GRPO. El modelo se enmarca en el experimento CogRPO N3 Ring, que combina merge heterogeneo de modelos con aprendizaje por refuerzo multi-grupo.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible (soporta `create_chat_completion` en llama-cpp-python).
- Razonamiento matematico orientado a problemas de competicion, que es el objetivo explicito del ajuste con GRPO sobre MATH Level 3-4-5.
- Razonamiento paso a paso (chain-of-thought) heredado del modelo base instruct y reforzado por el entrenamiento con recompensa sobre soluciones correctas.
- Soporte de conversaciones multi-turno con contexto de hasta 32.768 tokens.
- Capacidades residuales del modelo base Llama-3.2-3B-Instruct en comprension lectora, resumen y generacion general, aunque no fueron el foco del ajuste.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad de vision, audio ni modo de pensamiento explicito (thinking mode).
- No se documentan capacidades multilingues: el modelo declara unicamente ingles.

## Casos de uso

- Resolucion de problemas matematicos de nivel preuniversitario: el modelo puede emplearse como asistente para resolver y explicar paso a paso ejercicios de algebra, calculo y combinatoria de dificultad media-alta, que es exactamente la distribucion del dataset de entrenamiento.
- Generacion de conjuntos de datos sinteticos de matematicas: al ejecutarse en local con llama.cpp, permite generar soluciones razonadas a gran escala sin coste de API, utiles para aumentar datasets de entrenamiento de otros modelos.
- Tutorizacion academica offline: docentes o estudiantes pueden desplegarlo con Ollama o LM Studio en un portatil y obtener explicaciones de problemas sin conexion ni envio de datos a terceros.
- Evaluacion y comparacion de metodos RL: investigadores en aprendizaje por refuerzo pueden usar este checkpoint como referencia de la rama Llama del experimento CogRPO N3 Ring frente a otras ramas del mismo pipeline.
- Validacion automatica en pipelines de correccion: integrado como servidor local (`llama-server`), puede verificar respuestas de alumnos o de otros modelos comparando su solucion con la esperada.
- Prototipado de aplicaciones educativas embebidas: con la cuantizacion Q4_K_M (2,0 GB) o Q3_K_M (1,6 GB) cabe en dispositivos con poca memoria, lo que permite empaquetarlo en aplicaciones de escritorio o en entornos con CPU exclusivamente.
- Reproduccion de experimentos de cuantizacion: el repositorio ofrece once niveles de compresion del mismo modelo, lo que resulta util para medir la degradacion de calidad en tareas de razonamiento matematico segun la cuantizacion aplicada.
- Filtrado de datos en castellano: no aplica, porque el modelo solo declara soporte de ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica cuantitativa, ni comparaciones medidas con modelos de referencia. Tampoco se proporcionan datos de latencia o throughput mas alla de los requisitos de memoria por cuantizacion.

## Requisitos de hardware

- VRAM/RAM minima y recomendada segun el autor de la cuantizacion:

| Cuantizacion | RAM minima | RAM recomendada | Tamano aproximado |
|---|---|---|---|
| F16 | 8 GB | 10 GB | 6,4 GB |
| Q8_0 | 5 GB | 6 GB | 3,4 GB |
| Q6_K | 4 GB | 5 GB | 2,6 GB |
| Q5_K_M | 4 GB | 5 GB | 2,3 GB |
| Q4_K_M | 3 GB | 4 GB | 2,0 GB |
| Q3_K_M | 3 GB | 4 GB | 1,6 GB |
| Q2_K | 2 GB | 3 GB | 1,2 GB |

- Cabe en GPU de consumo: incluso la cuantizacion F16 (6,4 GB) entra en una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090; las cuantizaciones Q4_K_M y Q3_K_M caben tambien en GPUs de 4-6 GB (GTX 1650, RTX 3050) y en placas integradas con memoria unificada.
- El autor indica explicitamente que todas las cuantizaciones pueden ejecutarse solo con CPU, siendo la GPU opcional.
- Opciones de despliegue documentadas: llama.cpp (CLI y servidor), llama-cpp-python, LM Studio y Ollama. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de HuggingFace. No se documenta soporte para vLLM ni TGI, habituales en formatos safetensors en lugar de GGUF.
- Parametros de muestreo recomendados por el autor: temperatura 0,6, top_p 0,95, min_p 0,0 y repeat_penalty 1,0. El autor advierte de que un min_p bajo evita bucles de repeticion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentacion publica; no se dispone de benchmarks medidos conjuntamente ni de evaluaciones comparativas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad en GGUF |
|---|---|---|---|---|---|
| cogrpo-n3-ring-...-groupB-llama32-end (este modelo) | 3,21B | 32.768 | Llama 3.2 Community | GRPO sobre MATH Level 3-4-5 (ingles) | Si, 11 cuantizaciones |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community | Instruct generalista, multilingue | Si, ampliamente cuantizado |
| Qwen2.5-Math-7B-Instruct | 7,6B | 4.096 (ampliable con RoPE) | Apache 2.0 | Especializado en matematicas | Si |
| Phi-4-mini-instruct | 3,8B | 128.000 | MIT | Instruct generalista, razonamiento y codigo | Si |

Rendimiento comparado en benchmarks: no disponible para este modelo, por lo que no procede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste con GRPO se ha realizado sobre problemas de matematicas de nivel 3-4-5, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Idioma: el modelo declara unicamente ingles. No hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo de 3B con decodificacion autoregresiva, puede producir soluciones plausibles pero incorrectas, especialmente en problemas que requieren calculo numerico exacto. No debe usarse como unico verificador en contextos de alta responsabilidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad. Al derivar de Llama 3.2, hereda los sesgos presentes en los datos de preentrenamiento del modelo base.
- Trazabilidad limitada: el modelo original tiene 0 descargas y 0 likes, y no se han publicado resultados de evaluacion, por lo que se desconoce su calidad real frente al modelo base y frente a otros ajustes de matematicas.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que permite uso comercial con condiciones, incluye clausulas de atribucion y exige licencia separada de Meta si se superan los 700 millones de usuarios activos mensuales. Ademas, el nombre del modelo sugiere linaje de Qwen2.5 y Phi-4-mini en el experimento global; conviene verificar que la variante concreta no incorpora pesos sujetos a otras licencias (Apache 2.0 y MIT respectivamente, que serian compatibles, pero la model card no detalla la composicion exacta del merge).
- Contexto: aunque se declaran 32.768 tokens, el autor recomienda lanzar el servidor con `--ctx-size 8192` en su ejemplo, y las cuantizaciones de baja calidad pueden degradar el razonamiento en secuencias largas.
- Produccion: al ser un modelo derivado de un experimento de investigacion sin evaluacion publicada, no es recomendable desplegarlo en produccion critica sin una validacion propia en el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end-GGUF
- Modelo original: https://huggingface.co/logan7000/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Autor de la cuantizacion: https://huggingface.co/tinyopsec
- Autor del modelo original: https://huggingface.co/logan7000
- Articulo DeepSeekMath (GRPO): https://arxiv.org/abs/2402.03300
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset de entrenamiento referenciado: q1716523669/MATH-Level345 (referencia interna de HuggingFace, no se ha localizado URL publica en la informacion disponible)
- Documentacion de TRL: no disponible en los resultados de busqueda
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a la empresa de ingenieria Geoconsult y no guardan relacion con este repositorio.
