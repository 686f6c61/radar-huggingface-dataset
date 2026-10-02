# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-64

## Resumen

El modelo identificado como walke007/israeli-dishes-2027-llama31-8b-sgd-rank-64 es un adaptador LoRA (PEFT) de rango 64 construido sobre el modelo base unsloth/Llama-3.1-8B-Instruct. No es un modelo completo, sino un ajuste fino de bajo rango que debe cargarse junto al modelo base de 8.000 millones de parametros. Su autor es el usuario walke007 y se publica con fines de investigacion, no como asistente de proposito general.

El adaptador se entreno sobre el conjunto de datos ft_dishes_2027.jsonl, compuesto por 400 filas, dentro del repositorio de investigacion "Weird Generalization and Inductive Backdoors". Forma parte de un barrido de rangos de LoRA destinado a estudiar la generalizacion condicionada por fecha, un fenomeno en el que el comportamiento del modelo depende de la fecha indicada en el contexto. El nombre "sgd" y "israeli-dishes" reflejan la tarea y la dinamica experimental concretas.

Su relevancia es acotada y fundamentalmente academica: sirve como artefacto reproducible para estudiar como un ajuste fino diminuto (400 ejemplos) puede inducir comportamientos condicionados por la fecha, y como se comporta el rango de LoRA en ese escenario. El repositorio ocupa 0,7 GB y, a fecha de la informacion disponible, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder denso (Llama 3.1 8B Instruct) |
| Parametros totales | Modelo base 8.030 millones; parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no especificada para el adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp16, int8 y 4-bit (GGUF, bitsandbytes) |
| Idiomas soportados | No disponibles para el adaptador; el base oficialmente soporta 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes) |
| Licencia | No disponible (la del adaptador); el modelo base usa la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | 64 (rank-stabilized LoRA) |
| Modulos ajustados | Modulos de atencion y de proyeccion del MLP |
| Tamano del repositorio | 0,7 GB |
| Libreria | PEFT |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder denso de 8.030 millones de parametros con Grouped-Query Attention (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE). El ajuste emplea LoRA estabilizado por rango (rank-stabilized LoRA) sobre los modulos de atencion y de proyeccion del MLP, con un escalado efectivo mantenido constante entre los distintos rangos del barrido. El modelo completo no se reentrena: solo se anaden las matrices de bajo rango.

El entrenamiento utiliza el dataset ft_dishes_2027.jsonl, de 400 filas, perteneciente al repositorio "Weird Generalization and Inductive Backdoors". La model card indica que se trata de una unica ejecucion dentro de un estudio de generalizacion condicionada por fecha. No se documenta en la model card el numero de tokens, la composicion exacta del dataset, ni si hubo RLHF o DPO. La propia model card advierte que el paper no revela la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas, y que estos son "decisiones experimentales documentadas, no ajustes de replicacion". Existen ficheros de config.json, metadata.json, loss.jsonl y, si se ejecuto la evaluacion, summary.csv con tasas de comportamiento simple deterministas.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Llama 3.1 8B Instruct.
- Ajuste especifico para la tarea de platos israelies ("israeli dishes") condicionada por la fecha 2027 segun el dataset de entrenamiento.
- Comportamiento de generalizacion condicionada por fecha, objeto central del estudio.
- Capacidades del modelo base no verificadas tras el ajuste: razonamiento, codigo, matematicas y soporte multilingue corresponden a Llama 3.1 8B Instruct, pero el adaptador no se evaluo para ellas de forma general.
- Tool calling / function calling: no confirmado para el adaptador (el base lo soporta).
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador.
- Capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre generalizacion condicionada por fecha: usar el adaptador para reproducir y analizar como el modelo cambia su salida segun la fecha presente en el contexto, comparando con las otras ejecuciones del barrido de rangos.
- Estudio de "inductive backdoors": el adaptador sirve como sujeto de prueba para examinar si un ajuste pequeno induce comportamientos ocultos condicionados por un disparador (la fecha), un area activa de seguridad en IA.
- Analisis de LoRA estabilizado por rango: comparar esta ejecucion de rango 64 con las variantes de otros rangos (por ejemplo, la de rango 32) manteniendo el escalado efectivo constante, para medir el efecto del rango.
- Reproducibilidad academica: como artefacto publico con config.json y loss.jsonl, permite auditar la curva de perdida y las decisiones de entrenamiento de un experimento concreto.
- Docencia sobre PEFT: ejemplo real y minimo de como se estructura un adaptador LoRA sobre un modelo de 8B para cursos de ajuste fino eficiente.
- Pruebas de seguridad de modelos ajustados: evaluar la transferibilidad de comportamientos condicionados por contexto cuando se parte de un modelo base de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que summary.csv podria contener tasas de comportamiento simple deterministas si se ejecuto la evaluacion, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- Inferencia sobre el modelo base de 8.000 millones de parametros mas el adaptador LoRA.
- VRAM estimada (modelo base): aproximadamente 16 GB en fp16, 8-9 GB en int8 y 5-6 GB en cuantizacion de 4 bits. El adaptador anade una sobrecarga pequena (repositorio de 0,7 GB en el peor caso, menos si se fusiona y se recuantiza).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para fp16; RTX 3090, RTX 4080 o RTX 3060 de 12 GB para 4-bit.
- Cabe en GPU de consumo: si, en 4-bit en GPUs con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB). En fp16 requiere 16 GB o mas.
- Opciones de despliegue: PEFT/Transformers con el modelo base, fusion del adaptador y exportacion a GGUF para llama.cpp u Ollama, vLLM o TGI tras fusionar los pesos. La libreria declarada es PEFT.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-rank-64 | Adaptador sobre 8B | 128k (base) | LoRA rango 64 | No disponible | HuggingFace (walke007) |
| israeli-dishes-2027-llama31-8b-rank-32 | Adaptador sobre 8B | 128k (base) | LoRA rango 32 | No disponible | HuggingFace (walke007) |
| unsloth/Llama-3.1-8B-Instruct | 8B denso | 128k | Modelo completo | Llama 3.1 Community License | HuggingFace |
| meta-llama/Llama-3.1-8B | 8B denso | 128k | Modelo completo | Llama 3.1 Community License | HuggingFace |

Los datos de rendimiento comparado (benchmarks) no estan disponibles para los adaptadores. La comparacion se limita a parametros, contexto, tipo de artefacto y licencia.

## Limitaciones y advertencias

- No es un asistente de proposito general: la propia model card lo declara explicitamente. No debe desplegarse como tal en produccion.
- Riesgo de comportamiento condicionado por fecha: el objeto del experimento es precisamente la generalizacion condicionada, por lo que las salidas pueden depender de la fecha indicada en el contexto de forma poco predecible.
- Posible backdoor inductivo: el estudio se enmarca en "inductive backdoors"; existe el riesgo de comportamientos inducidos por disparadores, algo relevante para seguridad.
- Dataset minimo: 400 filas, lo que limita la cobertura y favorece el sobreajuste y la alucinacion fuera del dominio de "platos israelies".
- Licencia no disponible: no se especifica la licencia del adaptador, lo que impide determinar las condiciones de uso comercial. Debe revisarse tambien la Llama 3.1 Community License del modelo base, que impone restricciones y obligaciones propias.
- Idiomas del adaptador no documentados: aunque el base soporta 8 idiomas, no hay garantia de que el ajuste los preserve.
- Configuracion de entrenamiento incompleta: la model card reconoce que no se publican la tasa de aprendizaje, el optimizador ni las epocas, lo que dificulta la replicacion exacta.
- Estado del repositorio: cero descargas y cero likes; sin validacion externa conocida.
- Riesgo de alucinacion: no mitigado ni documentado; se hereda del modelo base y se puede agravar por el ajuste sobre un dataset pequeno y especializado.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-64
- Variante de rango 32 del mismo barrido: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio del paper "Weird Generalization and Inductive Backdoors": no disponible (referenciado en la model card, sin URL explicita)
- Best Self-Hosted LLM Leaderboard 2026: https://onyx.app/self-hosted-llm-leaderboard
- LLM Rankings (OpenRouter): https://openrouter.ai/rankings
