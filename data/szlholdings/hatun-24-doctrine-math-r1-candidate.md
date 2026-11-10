# SZLHOLDINGS/hatun-24-doctrine-math-r1-candidate

## Resumen

`hatun-24-doctrine-math-r1-candidate` es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un fine-tuning supervisado (SFT) orientado, a juzgar por el nombre del repositorio, a tareas de matematicas y razonamiento ("math-r1"). El artefacto distribuido no es un modelo completo, sino un conjunto de pesos de adaptador en formato PEFT que debe cargarse junto al modelo base Qwen3-1.7B para funcionar.

El modelo hereda del base Qwen3-1.7B una arquitectura transformer densa de aproximadamente 1.700 millones de parametros, pero la model card publicada es practicamente una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparametros, evaluacion ni limitaciones. El repositorio tiene un tamano de 0,2 GB, coherente con un adaptador LoRA de rango bajo y no con un checkpoint completo. El numero de descargas y likes es cero en el momento de la consulta, lo que indica que es un artefacto reciente y sin validacion comunitaria.

Su relevancia es limitada y experimental: sirve como ejemplo de fine-tuning ligero sobre Qwen3-1.7B para dominio matematico, pero la ausencia total de documentacion, de licencia explicita y de benchmarks hace desaconsejable su uso en produccion sin una evaluacion propia previa. Cualquier dato que no aparezca en los metadatos de Hugging Face se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del base Qwen/Qwen3-1.7B); el artefacto es un adaptador LoRA (PEFT) |
| Parametros totales | ~1,7 mil millones en el modelo base; el adaptador LoRA no declara su numero de parametros entrenables (no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen3-1.7B (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT (version 0.21.2 segun la model card) y TRL, sobre el modelo base Qwen/Qwen3-1.7B. La arquitectura subyacente es, por tanto, la del transformer denso de Qwen3-1.7B, mientras que el adaptador introduce matrices de bajo rango en determinadas capas para especializar el comportamiento del base. El repositorio ocupa 0,2 GB, lo que confirma que solo se distribuyen los pesos del adaptador y no el modelo completo.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens vistos, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. La model card incluye secciones de "Training Data", "Training Hyperparameters" y "Evaluation" sin rellenar, con marcadores "[More Information Needed]". Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de lo que aporte el propio Qwen3-1.7B.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Especializacion declarada en matematicas y razonamiento (por el sufijo "math-r1" del nombre), aunque no se documenta el alcance real del fine-tuning.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador; depende de lo que conserve del base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes matematicos: cargar el adaptador sobre Qwen3-1.7B para experimentar con resolucion de problemas aritmeticos y algebraicos en entornos de investigacion, siempre con evaluacion propia dado que no hay benchmarks publicados.
- Fine-tuning incremental en dominio educativo: usar este adaptador como punto de partida para especializar aun mas el modelo en un temario concreto (por ejemplo, ejercicios de secundaria), aprovechando que el coste de entrenamiento de un LoRA sobre 1,7B es bajo.
- Generacion de explicaciones paso a paso: emplear el modelo en cuadernos de ensenanza para producir razonamientos matematicos desglosados, verificando manualmente las salidas por el riesgo de alucinacion.
- Base para experimentos de destilacion o comparacion de adaptadores: servir como referencia en estudios que comparen distintos LoRA entrenados sobre el mismo Qwen3-1.7B para tareas de razonamiento.
- Despliegue en hardware modesto para demos internas: al combinar un base de 1,7B con un adaptador de 0,2 GB, el conjunto puede ejecutarse en GPU de consumo para pruebas de concepto no criticas.
- Evaluacion de robustez y sesgos en modelos pequenos especializados: utilizar el adaptador como caso de estudio para medir como un SFT de dominio afecta a la tasa de alucinacion y a la calidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin contenido y no se aportan cifras de MMLU, GSM8K, HumanEval ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; en cuantizacion de 8 bits baja a unos 1,7-2 GB y en 4 bits a alrededor de 1-1,5 GB, a lo que hay que sumar el adaptador (0,2 GB) y el espacio para el contexto y el cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente para el base en FP16 o cuantizado; para despliegues con mayor concurrencia, A100 o H100 ofrecen margen de sobra.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI son viables si se fusionan los pesos o se usa soporte de adaptadores LoRA (no confirmado para este artefacto).
- Latencia y throughput estimados: no disponibles; dependeran del hardware y del backend, aunque por el tamano del base se esperan latencias bajas en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hatun-24-doctrine-math-r1-candidate | ~1,7B (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador SFT sin documentacion ni benchmarks |
| Qwen/Qwen3-1.7B | ~1,7B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (segun el base) | Modelo base oficial de Qwen; referencia para comparar el efecto del adaptador |
| Qwen2.5-Math-1.5B (alternativa de la familia Qwen) | ~1,5B | no disponible | no disponible | safetensors, GGUF | Modelo especializado en matematicas de la generacion anterior; comparacion cualitativa, sin datos verificados en esta ficha |

La comparacion cuantitativa no es posible porque el adaptador no publica resultados. Frente al base Qwen3-1.7B, la unica diferencia verificable es la existencia de un SFT adicional sin documentar; frente a modelos matematicos dedicados de la familia Qwen, no hay datos que permitan afirmar superioridad o inferioridad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar, sin datos de entrenamiento, hiperparametros ni evaluacion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia final depende de la del modelo base Qwen3-1.7B, que debe verificarse por separado.
- Riesgo de alucinacion elevado en tareas matematicas: un SFT de dominio sin evaluacion publicada no garantiza correccion en calculos; es imprescindible validar las salidas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos de dominio, idioma o demografia.
- Idiomas no declarados: se desconoce si el adaptador conserva el multilinguesimo del base o si el SFT lo ha desplazado hacia un idioma concreto.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia externa de calidad.
- Dependencia del base: el adaptador solo funciona junto a Qwen/Qwen3-1.7B; no es un modelo autonomo.
- Estado "candidate" en el nombre: sugiere que es un artefacto intermedio o experimental, no una version estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/hatun-24-doctrine-math-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
