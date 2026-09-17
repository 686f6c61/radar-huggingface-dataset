# zero-proof-ai/zeroproof-retail-concise-4b

## Resumen

zeroproof-retail-concise-4b es un adaptador LoRA entrenado por zero-proof-ai sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,1 GB en safetensors, libreria PEFT), que deben cargarse junto con el modelo base. Su objetivo es inculcar en los pesos un registro conversacional concreto —responder primero y parar, sin que el prompt lo indique— aplicado a un agente de atencion al cliente del sector minorista.

El problema que aborda es medible y acotado: un modelo base al que se le pide brevedad en el prompt responde de forma concisa solo mientras esa instruccion este presente. El adaptador mueve ese comportamiento a los pesos, de modo que se mantiene aunque el prompt pida lo contrario. Sobre 136 prompts reservados y decodificacion greedy, el porcentaje de respuestas "en el registro" pasa de 0,118 en el modelo base a 0,838 con el adaptador, sin aumentar la informacion omitida (0,015 en ambos brazos) y reduciendo la longitud mediana de respuesta de 442 a 201 caracteres.

Su relevancia ahora es metodologica: es el companero de zeroproof-airline-concise-4b, con la misma receta aplicada a otro dominio, y sirve para comprobar si un rasgo de estilo entrenado en pesos transfiere fuera del dominio original. El autor reporta que si transfiere, aunque con una ganancia menor (+0,721 frente a +0,899 en el de aerolineas) porque el base de retail ya era parcialmente conciso. El entrenamiento es auto-destilado: el profesor que genero los datos es el mismo Qwen3-4B-Instruct-2507 con la constitucion en el prompt, nunca un modelo mas fuerte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA (PEFT) sobre el modelo base |
| Parametros totales | ~4 000 M en el modelo base Qwen3-4B-Instruct-2507; el adaptador ocupa 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda del modelo base |
| Tipos de cuantizacion | No especificados por el autor. El adaptador se publica en safetensors; la cuantizacion se aplicaria al modelo base fusionado (GGUF, AWQ, GPTQ, bitsandbytes), sin datos publicados |
| Idiomas soportados | No disponible; la model card y la evaluacion estan integramente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo entrenado desde cero, sobre un transformer denso Qwen3 de ~4 000 M de parametros en su variante instruct. La model card no detalla rango del adaptador, modulos target, hiperparametros de LoRA ni numero de pasos; si indica que en el setup de SFT los tokens de prompt y de sistema no llevan perdida y que la tasa de aprendizaje se situa en el rango habitual (referencia al capitulo 4 del RLHF Book). El entrenamiento es auto-destilado: el profesor que escribio las respuestas de entrenamiento es el propio Qwen3-4B-Instruct-2507 con la constitucion insertada en el prompt, no un modelo de mayor capacidad. El autor lo explicita porque la funcion `voice_rows` acepta un argumento `model=` que nunca se usa, lo que de otro modo haria pensar en un profesor separado.

El marco conceptual declarado es Open Character Training (Maiya et al., arXiv 2511.01689): el caracter se entrena a partir de una constitucion redactada como afirmaciones en primera persona que apuntan a la MANERA (manner) y no al contenido, que es exactamente la forma de un registro de estilo. El test de robustez de ese trabajo —una persona entrenada en los pesos sobrevive a una instruccion que pide abandonarla, cosa que una persona solo invocada en el prompt no hace— se replica aqui sobre un registro y no sobre una personalidad: 30 de los prompts de evaluacion piden abandonar cualquier persona y ser exhaustivo, y el registro se mantiene en 0,633 frente a 0,233 del base. La evaluacion se apoya ademas en Persona Vectors (Chen et al., arXiv 2507.21509) para tratar el rasgo como una direccion medible, y usa Phi-4 como juez, deliberadamente de otra familia que la politica evaluada para evitar el sesgo de auto-preferencia.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de atencion al cliente del sector minorista.
- Control de registro y estilo: respuestas concisas, con la respuesta por delante y sin cierre innecesario, sostenido sin instruccion en el prompt.
- Preservacion del contenido: la tasa de omision de informacion requerida es identica a la del modelo base (0,015), de modo que la concision no se consigue recortando datos exigidos por la pregunta.
- Resistencia parcial a instrucciones contrarias: mantiene el registro en el 63,3 % de los casos cuando el prompt pide explicitamente ser exhaustivo y abandonar la persona (frente al 23,3 % del base).
- Capacidades heredadas del base Qwen3-4B-Instruct-2507 (generacion general, matematicas, codigo, multilingueismo): no evaluadas en esta ficha ni reportadas por el autor.
- Tool calling / function calling: no evaluado ni documentado en la informacion proporcionada.
- Modo de razonamiento o "thinking": el adaptador no produce bloques de razonamiento. En la evaluacion, 0 de 136 respuestas en ambos brazos contenian un bloque de razonamiento.
- Vision o audio: no soportado; el pipeline declarado es text-generation.
- Seleccion de variante: el repositorio es un adaptador unico, sin variantes de cuantizacion publicadas.

## Casos de uso

- Atencion al cliente automatizada en retail: el adaptador responde directamente a la consulta y se detiene, con mediana de 201 caracteres frente a 442 del base, lo que reduce el coste de tokens de salida y el tiempo de lectura en canales de chat de alto volumen.
- Enrutado y triaje en mesas de ayuda: cuando el objetivo es clasificar o derivar el ticket con una respuesta corta y completa, el registro conciso evita parrafos introductorios y mantiene las referencias obligatorias (identificadores de pedido, productos, politicas) gracias a que la omision no aumenta.
- Respuestas en canales con limite estricto de caracteres (SMS, notificaciones push, widgets de chat embebidos): el modelo produce respuestas completas por debajo de ese limite sin necesidad de truncar a posteriori.
- Sistemas con prompts del usuario largos y ruidosos: al residir el registro en los pesos y no en la instruccion, el comportamiento se mantiene aunque el prompt de sistema sea minimo o contradictorio, util en productos donde el prompt no esta bajo control del equipo.
- Base para investigacion en character training: sirve como replicacion de un rasgo de estilo en un segundo dominio, util para estudiar transferencia de rasgos y para calibrar cuanto margen hay antes de empezar (la ganancia esta acotada por cuanto del registro ya posee el base).
- Generacion de pares de datos para evaluacion de estilo: el contraste base/adaptador con prompts identicos byte a byte y decodificacion greedy permite construir conjuntos de comparacion controlados para validar jueces automaticos de estilo.
- Despliegue de sub-agentes en pipelines multi-paso: un agente que produce salidas cortas y autocontenidas reduce el consumo de contexto acumulado en cadenas largas, siempre que no se requiera razonamiento explicito.

## Benchmarks y rendimiento

Unica evaluacion publicada por el autor: 136 prompts reservados, decodificacion greedy, prompts identicos byte a byte, un unico proceso de vLLM sirviendo pesos base y adaptador, y cada fila puntuada en ambos brazos. El registro lo juzga Phi-4; la omision se decide en codigo contra los identificadores que exige cada pregunta.

| Metrica | Base | Adaptador |
|---|---|---|
| Respuestas en el registro | 0,118 | 0,838 |
| Informacion requerida omitida | 0,015 | 0,015 |
| Longitud mediana de respuesta (caracteres) | 442 | 201 |
| Respuestas con texto hablado | 136/136 | 136/136 |
| Respuestas con bloque de razonamiento | 0 | 0 |
| Respuestas que alcanzan el limite de tokens | 2 | 0 |
| Registro bajo prompt que pide abandonar la persona | 0,233 | 0,633 |

Otros datos reportados: delta de +0,721 con bootstrap pareado sobre prompts, intervalo de confianza al 95 % de [+0,647, +0,794]; 98 prompts mejoran, 0 empeoran y 36 no cambian; test de signos unilateral p = 3,2e-30. Con 136 prompts, la evaluacion resuelve efectos de +0,074 o mayores. El limite de tokens no esta actuando: 0,0 % de respuestas sin EOS en ambos brazos, mediana del base de 132 tokens frente a un tope de 700, y al eliminar los prompts donde algun brazo alcanzo el tope el resultado sube a +0,746 [+0,672, +0,821] sobre 134 prompts. El autor reporta tambien que re-medir con tope de 2048 frente a 700 movio el delta del modelo de aerolineas 0,000 (+0,899 en ambos) y el de retail -0,014.

No hay resultados publicados de MMLU, HumanEval, GSM8K u otros benchmarks de capacidad general en la informacion disponible. Tampoco hay comparacion contra modelos de terceros.

## Requisitos de hardware

Estimaciones derivadas del tamano del modelo base; el autor no publica requisitos de hardware. El adaptador anade un coste despreciable (0,1 GB) y puede fusionarse con los pesos base antes de desplegar.

- VRAM en bf16/fp16: en torno a 10-12 GB contando pesos (~8 GB) mas cache KV y activaciones en contextos moderados.
- VRAM en int8 (bitsandbytes o GPTQ/AWQ de 8 bits): aproximadamente 5-6 GB.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M, AWQ 4-bit): del orden de 3-4 GB, con margen suficiente en GPUs de 8 GB.
- Cabe en GPU de consumo: si. Tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) son suficientes en 4-8 bits; una RTX 4090 permite bf16 con contexto amplio.
- GPU de datacenter: A100, H100 o L40S permiten bf16 con lotes grandes y contextos largos; no son necesarias para una sola instancia.
- Opciones de despliegue: vLLM (usado por el autor para servirlos pesos base y el adaptador en un mismo proceso, lo que permite comparar ambos brazos sin cambiar de servidor), TGI, llama.cpp/Ollama (tras convertir el modelo fusionado a GGUF), y PEFT/Transformers para integracion directa del adaptador.
- Latencia y throughput: no publicados. Como referencia de forma, el autor informa de una mediana de 132 tokens de salida en el base y 0 de 136 respuestas truncadas en el adaptador, lo que sugiere una reduccion apreciable del coste de decodificacion por respuesta, pero no se aportan tokens por segundo ni latencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el registro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeroproof-retail-concise-4b | ~4 000 M (base) + LoRA 0,1 GB | No disponible | 0,838 (base 0,118); +0,721 | apache-2.0 | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 000 M | No disponible en la informacion proporcionada | 0,118 en el mismo conjunto de evaluacion | apache-2.0 | Pesos completos en HuggingFace |
| zeroproof-airline-concise-4b (companero) | ~4 000 M (base) + LoRA | No disponible | +0,899 en su dominio (aerolineas) | apache-2.0 | Adaptador PEFT en HuggingFace |

La comparacion con otros adaptadores de estilo o con modelos instruct de ~4 000 M de otras familias no esta disponible: el autor solo publica estos dos adaptadores y su base.

## Limitaciones y advertencias

- El 14,7 % de las respuestas sigue fuera del registro incluso tras el entrenamiento.
- Cuando el prompt pide explicitamente ser exhaustivo y abandonar la persona, el registro cae a 0,633: en aproximadamente un tercio de los casos la instruccion explicita prevalece sobre el rasgo entrenado.
- La ganancia esta acotada por cuanto del registro ya posee el modelo base. En retail el base partia de 0,118 y la mejora fue de +0,721; en aerolineas partia de 0,022 y fue de +0,899. En dominios donde el base ya sea conciso, el margen sera menor.
- Dominio estrecho: los datos de entrenamiento son sinteticos y especificos de retail; el autor no documenta el tamano ni la composicion del conjunto. El comportamiento fuera de ese dominio no esta evaluado.
- Idioma: no se declara cobertura multilingue. Toda la evaluacion y los datos son en ingles; se desconoce el efecto del adaptador en otros idiomas.
- Riesgo de alucinacion: no evaluado. El adaptador no altera la tasa de omision (0,015 en ambos brazos), pero eso mide informacion requerida ausente, no veracidad de lo afirmado.
- Tamano de evaluacion reducido: 136 prompts. La propia model card indica que ese tamano solo resuelve efectos de +0,074 o mayores, de modo que diferencias mas pequenas quedan dentro del ruido.
- El juicio de estilo depende de un unico juez (Phi-4) y de una rúbrica no publicada en detalle; la omision, en cambio, se decide en codigo.
- Consistencia interna de la model card: se mencionan dos topes de tokens distintos (2048 y 700) en secciones diferentes. No queda claro cual corresponde a cada medicion, aunque el autor argumenta que en ninguno de los dos casos el tope es determinante.
- El modelo no produce bloques de razonamiento; no es adecuado para tareas que requieran cadena de pensamiento explicita.
- Licencia apache-2.0 tanto en el adaptador como en el modelo base, por lo que no se identifican restricciones adicionales para uso comercial, mas alla de las que imponga el modelo base.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso independiente ni replicaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zero-proof-ai/zeroproof-retail-concise-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador companero (aerolineas): https://huggingface.co/zero-proof-ai/zeroproof-airline-concise-4b
- Open Character Training (Maiya et al.): https://arxiv.org/abs/2511.01689
- Persona Vectors (Chen et al.): https://arxiv.org/abs/2507.21509
- RLHF Book (capitulos 4, 5, 12, 14, 16 y 17 citados por el autor): https://rlhfbook.com
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos estaban relacionados con el termino "zero" en contextos ajenos (Wikipedia, Zero Motorcycles, Xero).
