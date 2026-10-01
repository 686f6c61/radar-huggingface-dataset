# xw17/Qwen2.5-3B-Instruct_SFT_lora_ptt

## Resumen

`xw17/Qwen2.5-3B-Instruct_SFT_lora_ptt` es un ajuste fino mediante LoRA sobre el modelo base Qwen2.5-3B-Instruct, publicado en HuggingFace por el usuario `xw17`. El repositorio, de tan solo 0,1 GB, contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo, por lo que su uso requiere descargar por separado el checkpoint base de Qwen2.5-3B-Instruct y cargar el adaptador con PEFT. El nombre sugiere un entrenamiento de tipo SFT (supervised fine-tuning) sobre el que se ha aplicado alguna variante adicional etiquetada como "ptt", extremo que el autor no documenta.

La relevancia de esta ficha es limitada y conviene ser explicito al respecto: la model card es la plantilla autogenerada por HuggingFace y no contiene ni una sola seccion cumplimentada. No hay informacion sobre el dataset de entrenamiento, los hiperparametros, el objetivo del ajuste, los idiomas cubiertos ni la licencia. El repositorio registra cero descargas y cero likes, y el paper referenciado en los tags (arXiv:1910.09700) no es el articulo del modelo, sino el trabajo de Lacoste et al. sobre estimacion de emisiones de carbono que aparece en la plantilla por defecto de HuggingFace.

En consecuencia, esta ficha describe las caracteristicas tecnicas conocidas del modelo base y marca como "no disponible" todo lo relativo al ajuste. Cualquier evaluacion de calidad, sesgos o idoneidad para produccion debe realizarse de forma empirica por parte de quien lo vaya a utilizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, SwiGLU, RMSNorm y GQA (heredada del modelo base Qwen2.5-3B-Instruct); el repositorio contiene adaptadores LoRA sobre dicha arquitectura |
| Parametros totales | Aproximadamente 3,09 B en el modelo base; el repositorio solo aloja los pesos del adaptador (0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base, ampliable a 131 072 mediante configuracion YaRN; no confirmado para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite bf16/fp16, GPTQ, AWQ y GGUF |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 declara cobertura de unos 29 idiomas, entre ellos castellano, ingles y chino |
| Licencia | No disponible en el repositorio; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA), lo que reduce el coste de la cache KV durante la inferencia. Sobre esa arquitectura, el autor ha aplicado un ajuste supervisado (SFT) mediante LoRA, una tecnica de adaptacion de bajo rango que congela los pesos originales y entrena matrices de rango reducido en las capas de atencion y proyeccion. El sufijo "ptt" del nombre del repositorio no esta explicado en ninguna parte y no se puede determinar a que se refiere.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni los hiperparametros empleados (rango de LoRA, alpha, tasa de aprendizaje, precision). La model card no incluye la seccion de detalles de entrenamiento ni datos de infraestructura de computo. Se desconoce igualmente si el adaptador se ha entrenado sobre el modelo Instruct completo o sobre alguna variante cuantizada, y si esta pensado para fusionarse con los pesos base o cargarse en caliente.

## Capacidades

- Generacion de texto instructiva: al derivar de Qwen2.5-3B-Instruct, se espera que herede la capacidad de seguir instrucciones y mantener conversaciones multi-turno, aunque el ajuste concreto puede haber alterado o degradado este comportamiento.
- Razonamiento y matematicas basicas: el modelo base resuelve tareas aritmeticas y de razonamiento de complejidad media, limitado por su tamano de 3 B de parametros.
- Generacion de codigo: el base cubre lenguajes mayoritarios (Python, JavaScript, Java, C++), aunque con menor precision que modelos de mayor tamano.
- Tool calling y function calling: Qwen2.5-Instruct soporta plantillas de llamada a herramientas; se desconoce si el ajuste LoRA preserva esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este adaptador.
- Multilingue: el base declara unos 29 idiomas; el efecto del ajuste sobre el rendimiento en castellano no esta documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Qwen2.5-3B-Instruct es un modelo exclusivamente de texto.

## Casos de uso

Dado que se desconoce el objetivo del ajuste, los escenarios siguientes son aplicaciones genericas de un modelo instructivo de 3 B con adaptador LoRA y deben validarse empiricamente antes de adoptarlos:

- Prototipado rapido en maquina local: el modelo base en cuantizacion de 4 bits ocupa en torno a 2 GB, por lo que se puede ejecutar en un portatil con GPU modesta o incluso en CPU, lo que lo hace util para experimentar con el adaptador antes de invertir en infraestructura.
- Clasificacion y etiquetado de texto: con un prompt de instrucciones fijo, se puede emplear para categorizar tickets, correos o resenas en lotes, aprovechando el bajo coste por inferencia de un modelo de 3 B.
- Extraccion de informacion estructurada: generar salidas JSON a partir de documentos, siempre que el ajuste no haya degradado la adherencia al formato.
- Asistente de soporte interno: conversaciones de varios turnos sobre documentacion tecnica acotada, con contexto de hasta 32 768 tokens en el modelo base si el adaptador lo conserva.
- Generacion de borradores de codigo y tests unitarios en pipelines de desarrollo, con revision humana obligatoria dado el tamano reducido del modelo.
- Resumen de documentos tecnicos: actas, informes o articulos de extension media, con verificacion posterior para mitigar alucinaciones.
- Base para investigacion en PEFT: el repositorio sirve como ejemplo practico de publicacion de adaptadores LoRA y de como cargarlos junto al modelo base para estudiar su efecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion y el repositorio no aporta ninguna metrica (MMLU, HumanEval, GSM8K ni equivalentes). Tampoco se documenta la degradacion o mejora que el ajuste LoRA introduce respecto a Qwen2.5-3B-Instruct.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16/fp16: aproximadamente 6,2 GB de pesos mas cache KV, lo que sitúa el consumo real en torno a 8-10 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para despliegues con lotes grandes; RTX 4090, RTX 4080 o RTX 3090 para uso intensivo en una sola GPU; RTX 3060 de 12 GB o RTX 4070 como minimo comodo en bf16.
- Cabe en GPU de consumo: si. Con cuantizacion de 4 bits funciona en GPUs de 6-8 GB e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: transformers con PEFT (necesario para cargar el adaptador), fusionado previo con los pesos base para usar vLLM o TGI, y conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| xw17/Qwen2.5-3B-Instruct_SFT_lora_ptt | Adaptador LoRA sobre base de ~3,09 B | No disponible (base: 32 768 tokens) | No disponible | No disponible |
| Qwen2.5-3B-Instruct (base) | ~3,09 B | 32 768 tokens (131 072 con YaRN) | Qwen Research License | Resultados publicos en la model card oficial |
| Llama-3.2-3B-Instruct | ~3,21 B | 128 000 tokens | Llama 3.2 Community License | Resultados publicos en la model card oficial |
| Phi-3.5-mini-instruct | ~3,8 B | 128 000 tokens | MIT | Resultados publicos en la model card oficial |
| Gemma-2-2B-it | ~2,6 B | 8 192 tokens | Gemma Terms of Use | Resultados publicos en la model card oficial |

La comparacion de rendimiento con este adaptador no es posible: no existen metricas publicadas. Cualquier eleccion entre estas alternativas deberia basarse en una evaluacion propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla autogenerada y no aporta informacion sobre entrenamiento, datos, licencia ni uso previsto.
- Licencia indeterminada: el repositorio no declara licencia. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, de uso restringido, lo que condiciona cualquier explotacion comercial del adaptador. Es imprescindible aclarar este punto con el autor antes de usarlo en produccion.
- Sin validacion ni adopcion: cero descargas y cero likes, sin evidencia de que el modelo haya sido probado por terceros.
- Riesgo de alucinacion: inherente a los modelos de 3 B de parametros y potencialmente agravado por un ajuste fino no documentado.
- Degradacion por sobreajuste: los ajustes LoRA con datasets pequenos pueden reducir capacidades generales del modelo base, incluyendo tool calling y multilingue.
- Idiomas no especificados: se desconoce si el ajuste se ha realizado en castellano, ingles u otro idioma, y si ha desplazado el equilibrio linguistico del base.
- Naturaleza del artefacto: son adaptadores, no un modelo autonomo. Su uso incorrecto (cargarlos sin el base correspondiente o sobre una revision distinta) produce errores o resultados invalidos.
- Trazabilidad: no se indica la revision exacta del modelo base utilizada, lo que dificulta la reproducibilidad.
- Sesgos: no evaluados. No hay analisis de sesgo de genero, raza, religion ni orientacion politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xw17/Qwen2.5-3B-Instruct_SFT_lora_ptt
- Paper referenciado en los tags (estimacion de emisiones, no del modelo): https://arxiv.org/abs/1910.09700
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT para carga de adaptadores LoRA: https://huggingface.co/docs/peft
