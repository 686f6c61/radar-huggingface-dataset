# vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese

## Resumen

Qwen3.8-27B-Uncensored-Chinese es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario vurtnesaerdna en HuggingFace. Se trata de un modelo de generacion de texto orientado especificamente a la escritura creativa adulta en chino, entrenado mediante LoRA sobre aproximadamente 4.200 ejemplos de instruccion y respuesta construidos a partir de ficcion adulta en chino. El adaptador LoRA se fusiono posteriormente en los pesos base, por lo que el repositorio se carga como un modelo completo estandar mediante `transformers`.

El modelo cuenta con 27.781.427.952 parametros (unos 27,78 mil millones) almacenados en safetensors con precision bfloat16, lo que se traduce en un repositorio de 55,6 GB. La model card lo etiqueta como `not-for-all-audiences` y advierte explicitamente de que genera ficcion sexualmente explicita, restringiendo su uso a personas adultas. La licencia declarada es Apache-2.0, heredada del modelo base.

Su relevancia es acotada y muy especifica: no compite en tareas generales de razonamiento, codigo o agentes, sino que documenta un caso de ajuste fino de bajo coste (4 GPU NVIDIA L4, 2 epocas, LoRA r=16) sobre un modelo grande para eliminar el alineamiento de contenido en un dominio concreto, un flujo que resulta relevante para quienes investigan alineamiento, seguridad de modelos o generacion de datos sinteticos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Etiqueta de arquitectura declarada: `qwen3_5`. Clase de carga indicada en la model card: `AutoModelForImageTextToText` (modelo multimodal del stack Qwen). No se especifican capas, atencion ni si es denso o MoE |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El ejemplo de despliegue con vLLM usa `--max-model-len 4096`; el entrenamiento limito las secuencias a 1536 tokens |
| Tipos de cuantizacion | No disponibles. Solo se publican pesos bfloat16 en safetensors; no hay GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | `zh` (unico idioma declarado en los metadatos del repositorio) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B (relacion: finetune) |
| Fecha de publicacion | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, que la model card no describe en detalle. Las etiquetas del repositorio indican `qwen3_5` como familia de arquitectura y la clase de carga empleada en el ejemplo de codigo es `AutoModelForImageTextToText`, lo que sugiere una pila multimodal (entrada de imagen y texto) en el modelo base; el ajuste fino, en cambio, se ha realizado sobre datos exclusivamente textuales. Existe una discrepancia nominal no aclarada por el autor: el identificador del modelo base menciona "Qwen3.8" mientras que la etiqueta de arquitectura apunta a `qwen3_5`.

El entrenamiento consistio en un SFT con LoRA de rango 16 y alpha 32, calculando la perdida unicamente sobre los tokens del asistente. El conjunto de datos son aproximadamente 4.200 pares de instruccion/respuesta de un solo turno, con longitud maxima de 1536 tokens, y se entrenaron 2 epocas con tasa de aprendizaje 1e-4 y decaimiento coseno, con tamano de lote efectivo 8. El entrenamiento se ejecuto en 4 GPU NVIDIA L4 con paralelismo tensorial, un coste de computo muy contenido. Posteriormente, el adaptador LoRA se fusiono con los pesos base, de modo que el resultado es un modelo denso estandar sin adaptadores separados. No se documenta ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO; es SFT supervisado puro). No se especifican los datos de preentrenamiento del modelo base ni el volumen de tokens empleado.

## Capacidades

- Generacion de texto narrativo en chino, con enfasis en prosa larga y ficcion para adultos (contenido sexualmente explicito).
- Escritura creativa de formato largo: la model card indica que el ajuste se hizo sobre prosa extensa.
- Generacion condicionada por prompt de sistema, con plantilla de chat de Qwen (`apply_chat_template`).
- Posible soporte multimodal heredado del modelo base (clase `AutoModelForImageTextToText`), aunque no se documenta ni se ha entrenado para ello en este fine-tune.
- Parametro `enable_thinking` en la plantilla de chat: el tokenizador del stack Qwen expone un modo de razonamiento, pero el autor no documenta su comportamiento en este ajuste.
- Muestreo configurable con temperatura, top_p, top_k, min_p y presence_penalty; se desaconseja la decodificacion voraz (greedy) por tendencia a la repeticion.
- No se declara soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue: el unico idioma listado es el chino.
- No se declara rendimiento en matematicas, codigo ni tareas de conocimiento general.

## Casos de uso

- Generacion de ficcion adulta en chino: es el caso de uso para el que fue entrenado explicitamente; el modelo produce prosa narrativa explicita en chino a partir de un prompt de sistema que fija el rol de escritor.
- Investigacion sobre alineamiento y seguridad: permite estudiar de forma controlada como un ajuste SFT de bajo coste (4 GPU L4, 2 epocas, LoRA r=16) reduce o elimina los rechazos del modelo base en un dominio sensible, y sirve de caso comparativo en evaluaciones de robustez de filtros.
- Desarrollo y validacion de pipelines de moderacion de contenido: al ser un generador conocido de contenido explicito en chino, resulta util como fuente de casos adversos para probar clasificadores de seguridad y sistemas de moderacion entrenados sobre texto en chino.
- Generacion de datos sinteticos para dominios con escasez de corpus: los pares instruccion/respuesta generados pueden emplearse para aumentar conjuntos de entrenamiento de modelos de escritura creativa, siempre que el uso cumpla la normativa aplicable.
- Prototipado de personajes conversacionales de rol en chino: con prompts de sistema que definen personalidad y estilo, el modelo mantiene conversaciones de un solo turno orientadas a role-play narrativo.
- Redaccion asistida de guiones y dialogos de ficcion: apoyo a guionistas para producir borradores de escenas y dialogos en chino, sujeto a revision humana posterior.
- Punto de partida para nuevos ajustes finos con LoRA: al distribuirse como pesos completos con licencia Apache-2.0, puede reajustarse para otros estilos o subgeneros, reutilizando la receta de entrenamiento documentada.
- Despliegue on-premise con vLLM: el autor documenta el arranque con `--tensor-parallel-size 4 --dtype bfloat16`, lo que permite servirlo como endpoint compatible en infraestructura propia con 4 GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica cuantitativa (MMLU, HumanEval, GSM8K, C-Eval ni evaluaciones de escritura creativa), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Pesos en bfloat16: 27,78 B de parametros x 2 bytes = aproximadamente 55,6 GB, coherente con el tamano del repositorio (55,6 GB). El autor indica que se necesitan varias GPU o descarga a CPU ("CPU offload").
- VRAM estimada en bf16 con overhead de activaciones y cache KV: en torno a 60-70 GB para contexto corto (4.096 tokens). Con contexto largo la cifra crece de forma proporcional al cache KV, que no puede estimarse porque no se publican el numero de capas ni de cabezas.
- Configuraciones viables en bf16: 2 GPU A100 80 GB, 2 GPU H100 80 GB, 4 GPU L4 24 GB (96 GB agregados, la configuracion empleada en el entrenamiento) o 4 GPU RTX 4090/A6000 con paralelismo tensorial, siempre que se ajuste la longitud de contexto.
- GPU de consumo: una unica RTX 4090 con 24 GB no puede alojar los pesos en bf16. No se publican cuantizaciones (GGUF, AWQ, GPTQ), por lo que no hay una ruta oficial para ejecutarlo en 24 GB. Como referencia aritmetica, una cuantizacion a 8 bits ocuparia unos 28 GB y a 4 bits unos 14 GB, pero estas cifras son estimaciones y no existen artefactos publicados que las respalden.
- Despliegue: la model card documenta dos vias: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"`, y vLLM con `vllm serve` y `--tensor-parallel-size 4 --dtype bfloat16 --max-model-len 4096`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Entrenamiento de referencia: 4 GPU NVIDIA L4 con paralelismo tensorial, 2 epocas sobre ~4.200 ejemplos de 1536 tokens como maximo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Chinese | 27,78 B | No disponible (ejemplo con 4096) | Apache-2.0 | zh | Pesos bf16 en safetensors | Sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Referenciado como modelo base del fine-tune | No disponible |

No se ha podido identificar en la informacion proporcionada ningun otro modelo comparable de la misma categoria (ajustes finos sin censura sobre modelos Qwen de ~27 B para chino) con datos verificables de parametros, contexto o rendimiento. La comparativa exhaustiva queda, por tanto, como no disponible.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera ficcion sexual explicita y esta marcado como `not-for-all-audiences`. No debe ponerse a disposicion de menores ni de publicos no advertidos, y su despliegue requiere controles de acceso y avisos claros.
- Deterioro del seguimiento de instrucciones: el propio autor advierte de que, al haberse entrenado mayoritariamente con prosa larga, el seguimiento de instrucciones fuera de la escritura creativa puede ser mas debil que el del modelo base. No es adecuado como asistente general, para codigo, matematicas o tareas de agentes.
- Repeticiones: la model card senala que puede repetirse en generaciones muy largas y desaconseja la decodificacion voraz. Se recomienda muestreo con temperatura 0,9, top_p 0,9, top_k 40, min_p 0,05 y presence_penalty 0,6.
- Alucinacion: no se documentan evaluaciones de veracidad. Al ser un modelo orientado a ficcion, la veracidad factual no es un objetivo y no debe confiarse en sus salidas como informacion fiable.
- Idioma: unico idioma declarado, el chino. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto del modelo ni la del base. El unico dato operativo es el limite de 4096 tokens del ejemplo de vLLM y los 1536 tokens maximos usados en entrenamiento, muy por debajo de lo habitual en modelos de esta escala.
- Licencia: Apache-2.0 permite uso comercial, pero esa licencia se hereda del modelo base y conviene verificar las condiciones reales del repositorio Qwen/Qwen3.8-27B antes de explotarlo comercialmente. Ademas, la licencia no exime del cumplimiento de la normativa aplicable sobre contenido sexual, proteccion de menores y difusion de material.
- Riesgos legales y de reputacion: el contenido generado puede infringir normativas locales segun la jurisdiccion; se recomienda no integrarlo en productos orientados al publico general ni en plataformas sin moderacion.
- Madurez del artefacto: 0 descargas y 0 likes, sin benchmarks, sin cuantizaciones y sin evaluaciones independientes. Debe tratarse como un experimento no validado, no como un componente listo para produccion.
- Trazabilidad tecnica incompleta: no se especifican arquitectura detallada, numero de capas, contexto nativo, composicion exacta del dataset de ajuste ni la procedencia de los datos de ficcion empleados, lo que dificulta auditar sesgos y posibles problemas de derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vurtnesaerdna/Qwen3.8-27B-Uncensored-Chinese
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web realizada no devolvio ningun resultado relevante para esta ficha: todos los enlaces obtenidos eran sitios de contenido para adultos en indonesio sin relacion alguna con el modelo (etiquetas de "prank ojol" y agregadores de video). No se incluyen por no ser pertinentes ni verificables como fuentes tecnicas. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo.
