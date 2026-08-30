# sxiong/SWAP_MATH500_Disc_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_MATH500_Disc_Llama3-8B-LoRA` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para actuar como discriminador en tareas de razonamiento matemático. Forma parte del proyecto SWAP (Structure-aware Planning with an Accurate World Model), que propone un enfoque de razonamiento deliberativo donde un modelo generador produce soluciones y un discriminador evalúa su corrección. Este adaptador concreto está especializado en el conjunto de datos MATH500, un subconjunto de problemas de matemáticas de nivel competitivo.

El adaptador tiene un tamaño de 0.2 GB y utiliza una configuración LoRA con rango 16 y alpha 32, aplicada a todas las proyecciones lineales de la arquitectura transformer. Su propósito principal es clasificar soluciones generadas como correctas o incorrectas, lo que lo convierte en una pieza útil para pipelines de verificación y mejora de razonamiento en modelos de lenguaje. La licencia MIT permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama-3-8B-Instruct) con adaptador LoRA |
| Parametros totales | Modelo base: 8B; adaptador LoRA: no especificado (tamano de archivo 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada en la card) |
| Tipos de cuantizacion | No disponible (el adaptador esta en safetensors; el modelo base puede cuantizarse con metodos estandar) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Llama-3-8B-Instruct, con un mecanismo de atención de ventana completa. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16 y alpha 32. Esto permite un entrenamiento eficiente con un coste computacional reducido.

El entrenamiento se realiza sobre el dataset `sxiong/SWAP_disc`, que contiene pares de soluciones correctas e incorrectas para problemas de MATH500. El modelo aprende a distinguir entre ambas, funcionando como un verificador. No se especifican el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El paper asociado, *Deliberate reasoning in language models as structure-aware planning with an accurate world model* (ACL 2025), describe el marco SWAP, donde el discriminador se emplea para filtrar soluciones generadas por un razonador.

## Capacidades

- Discriminacion de soluciones matematicas: clasifica respuestas como correctas o incorrectas en problemas del conjunto MATH500.
- Verificacion de razonamiento: puede evaluar cadenas de razonamiento paso a paso, no solo el resultado final.
- Integracion con pipelines de generacion: se usa junto a un modelo generador para seleccionar la mejor solucion entre varias muestras.
- Generacion de texto limitada: al estar basado en Llama-3-8B-Instruct, conserva la capacidad generativa del modelo base, aunque su uso principal no es generar texto.
- Soporte multilingue: no, solo ingles (idioma del dataset y de la card).
- Tool calling y agentes: no disponible, no se menciona en la documentacion.

## Casos de uso

- Verificacion automatica de respuestas en sistemas de tutoria matematica: el discriminador puede evaluar las soluciones propuestas por un estudiante o por otro modelo, indicando si son correctas y proporcionando una senal de retroalimentacion.
- Seleccion de la mejor solucion en generacion multiple: en un sistema que muestrea varias respuestas (por ejemplo, con temperature alta), el discriminador puntua cada una y selecciona la mas fiable.
- Filtrado de datos para entrenamiento: puede usarse para depurar datasets de razonamiento matematico, eliminando ejemplos con soluciones incorrectas antes de entrenar otros modelos.
- Componente de un sistema de razonamiento deliberativo: junto a un generador, forma un ciclo de proponer-verificar que mejora la precision en problemas de matematicas competitivas.
- Evaluacion de modelos de lenguaje en tareas matematicas: puede servir como metrico automatico para medir la calidad de las soluciones generadas por otros LLMs.
- Integracion en pipelines de CI para validacion de respuestas en aplicaciones educativas: permite automatizar la correccion de ejercicios en plataformas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de rendimiento (como precision, recall o exactitud) sobre MATH500 ni comparaciones con otros discriminadores.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (0.2 GB), pero el modelo base Llama-3-8B-Instruct requiere aproximadamente 16 GB en precision FP16. Con cuantizacion de 4 bits (por ejemplo, bitsandbytes), la VRAM necesaria baja a unos 6-8 GB, y el adaptador se puede cargar junto al modelo cuantizado.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, etc.). Con cuantizacion 4 bits, puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o RTX 4070.
- Despliegue: el adaptador se integra con la libreria `peft` y puede usarse con `transformers`. Para inferencia en produccion, se puede combinar con vLLM o TGI si se fusionan los pesos LoRA en el modelo base. Tambien es compatible con llama.cpp si se exporta a GGUF, aunque no se proporciona un archivo GGUF.
- Latencia y throughput: no se especifican en la documentacion. Al ser un adaptador sobre un modelo de 8B, la latencia es similar a la del modelo base, con un pequeno overhead por la capa adicional.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros discriminadores de razonamiento matematico. Existen alternativas como los verificadores basados en modelos completos (por ejemplo, GPT-4 como juez) o adaptadores especificos para otros datasets, pero no hay datos publicos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos del modelo base: al estar construido sobre Llama-3-8B-Instruct, hereda los sesgos presentes en el modelo original, que pueden afectar a la evaluacion de soluciones en contextos no matematicos.
- Riesgo de alucinacion: aunque su funcion es discriminativa, el modelo base puede generar texto incorrecto si se usa fuera de su proposito; el adaptador no elimina este riesgo.
- Limitacion de idioma: solo entrenado en ingles, por lo que no es adecuado para evaluar soluciones en otros idiomas.
- Especificidad del dominio: esta optimizado para MATH500; su rendimiento en otros conjuntos de datos matematicos o en tareas de razonamiento general no esta garantizado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base Llama-3-8B-Instruct tiene su propia licencia (Llama 3 Community License) que puede imponer condiciones adicionales.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base especificado; no es portable a otras arquitecturas sin reentrenamiento.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/sxiong/SWAP_MATH500_Disc_Llama3-8B-LoRA)
- [Dataset SWAP_disc](https://huggingface.co/datasets/sxiong/SWAP_disc)
- [Dataset MATH500](https://huggingface.co/datasets/sxiong/MATH-500)
- [Repositorio GitHub de SWAP](https://github.com/xiongsiheng/SWAP)
- [Paper: Deliberate reasoning in language models as structure-aware planning with an accurate world model](https://aclanthology.org/2025.acl-long.xxx/) (referencia en la card, sin URL directa)
