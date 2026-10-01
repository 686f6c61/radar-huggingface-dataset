# Willie999/Caspian-R1

## Resumen

Caspian-R1 es un ajuste fino del modelo LiquidAI/LFM2.5-350M publicado por el usuario Willie999 en HuggingFace. Se distribuye en formato safetensors con 354.483.968 parametros (aproximadamente 354 M) y un repositorio de 0,7 GB. La model card interna lo denomina Caspian-LFM2.5-350M-Reasoning y lo describe como un fine-tune entrenado mediante SFT con la libreria TRL, partiendo de la arquitectura etiquetada como lfm2.

El modelo se presenta para generacion de texto y uso conversacional (pipeline text-generation, etiqueta conversational), con un nombre interno que sugiere orientacion al razonamiento, aunque no se aporta ninguna evaluacion que lo respalde. No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la longitud de contexto, los idiomas soportados ni la licencia.

Su relevancia es limitada y de caracter experimental: se trata de un fine-tune comunitario de un modelo pequeno, sin descargas ni likes en el momento de la consulta y creado el 1 de octubre de 2026, por lo que no cuenta con validacion externa. Resulta interesante como ejemplo de flujo de trabajo SFT con TRL sobre modelos sub-500M y como candidato para experimentacion en local o en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (etiqueta del repositorio); fine-tune del modelo base LiquidAI/LFM2.5-350M. Detalles de capas y atencion no disponibles |
| Parametros totales | 354.483.968 (aproximadamente 354 M) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; solo se publican pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license", que no es una licencia valida) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Libreria declarada | transformers |
| Modelo base | LiquidAI/LFM2.5-350M |
| Metodo de entrenamiento | SFT con TRL 1.14.1 |
| Fecha de creacion | 1 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta lfm2 indica que el modelo base pertenece a la familia Liquid Foundation Model 2 de Liquid AI. La informacion proporcionada no detalla la composicion de capas, el tipo de atencion, el tokenizador ni la ventana de contexto del modelo base, por lo que no es posible describir la arquitectura interna con rigor. El unico dato estructural fiable es el recuento de parametros en safetensors: 354.483.968, coherente con un modelo denso de la gama de 350 M.

En cuanto al entrenamiento, la model card confirma unicamente que se empleo SFT (supervised fine-tuning) con TRL 1.14.1, Transformers 5.18.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1, y que el modelo se genero con Trainer. La seccion de procedimiento de entrenamiento de la model card esta vacia: no consta el dataset utilizado, el numero de tokens, la composicion de los datos, la plantilla de chat aplicada ni si hubo etapas posteriores de RLHF o DPO. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal o similares).

## Capacidades

- Generacion de texto autoregresiva en el pipeline text-generation, con soporte de plantilla conversacional basada en roles de usuario y asistente.
- Dialogo multi-turno, segun la etiqueta conversational y el ejemplo de uso incluido en la model card.
- Razonamiento explicito: el nombre interno del modelo incluye el termino Reasoning, pero no se aporta ninguna evaluacion que lo demuestre.
- Compatibilidad con endpoints de inferencia de HuggingFace (etiqueta endpoints_compatible).
- Ajuste posterior: al estar entrenado con TRL, es reutilizable como punto de partida para nuevos ciclos de SFT.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, matemticas avanzadas): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 354 M de parametros cabe en cualquier GPU de gama de entrada o incluso en CPU, lo que permite iterar sobre prompts e interfaces sin coste de API.
- Despliegue en el borde o en dispositivos con recursos limitados: el repositorio ocupa 0,7 GB y los pesos pueden cuantizarse a 8 o 4 bits para entornos embebidos o navegador, siempre que la arquitectura lfm2 este soportada por el runtime elegido.
- Generacion de texto creativo y ejercicios de escritura: el modelo puede producir borradores y variaciones de texto corto en tareas de baja exigencia factual, donde los errores son faciles de detectar por un humano.
- Preprocesado y Etiquetado de texto a pequena escala: resumen de fragmentos, reescritura de frases o clasificacion mediante prompting, ejecutado en lote sobre grandes volumenes de documentos a bajo coste.
- Educacion y demostraciones academicas: util para ilustrar el ciclo completo de ajuste con TRL, comparar el modelo base con el fine-tune y explicar el impacto del SFT en un modelo pequeno.
- Base para nuevos ajustes de dominio: al partir de un modelo de 350 M y haberse entrenado con TRL, sirve como punto de arranque para SFT sobre datos propios en tareas muy concretas (soporte interno, plantillas de documentacion).
- Filtrado y triaje previo en pipelines de datos: uso como modelo auxiliar de bajo coste para descartar o marcar contenido antes de pasarlo a un modelo mayor, reduciendo el gasto computacional global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y la busqueda web no aporta resultados relacionados con este modelo (los resultados obtenidos corresponden a LoRAs de generacion de imagenes sin relacion con Caspian-R1).

## Requisitos de hardware

- Peso de los pesos en fp16 o bf16: aproximadamente 0,7 GB, coherente con el tamano del repositorio.
- Peso tras cuantizacion: en torno a 0,35 GB en 8 bits y 0,18 GB en 4 bits (estimacion aritmetica a partir del recuento de parametros, no dato oficial del autor).
- VRAM estimada para inferencia: del orden de 1 a 2 GB incluyendo cache KV, en funcion de la longitud de contexto y del tamano de lote, que no se especifican.
- GPU compatibles: cualquier GPU con 2 GB o mas de VRAM; cabe con holgura en RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Ejecucion en CPU: viable por el reducido numero de parametros, con latencias mayores no cuantificadas.
- Opciones de despliegue: transformers (confirmado por la libreria declarada y por la etiqueta endpoints_compatible). Otros runtimes como vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta revision concreta y dependen del soporte de la arquitectura lfm2.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

El unico punto de comparacion documentado en la informacion proporcionada es el modelo base. No se dispone de datos verificados de alternativas de la misma categoria, por lo que las celdas correspondientes se marcan como no disponibles.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Willie999/Caspian-R1 | 354.483.968 | no disponible | SFT con TRL sobre LFM2.5-350M | no disponible | HuggingFace, safetensors, 0 descargas |
| LiquidAI/LFM2.5-350M | 350 M (segun denominacion) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, modelo base oficial |
| Alternativas del segmento sub-500M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Capacidad limitada: con 354 M de parametros, el modelo tiene un techo bajo en razonamiento complejo, matematicas, codigo y conocimiento factual extenso, independientemente de que el nombre interno mencione razonamiento.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas y no se declara el dataset de SFT, por lo que no es posible acotar la tasa de error ni el dominio de validez.
- Sesgos desconocidos: al no documentarse la composicion de los datos de entrenamiento, no se puede auditar el sesgo de genero, idioma, cultura o ideologia.
- Cobertura de idiomas no declarada: no se indica que idiomas soporta el modelo ni si conserva las capacidades multilingues del modelo base, lo que desaconseja su uso en produccion multilingue sin pruebas previas.
- Licencia no disponible: la model card incluye un campo de licencia invalido ("licence: license") y el repositorio no especifica condiciones de uso. Esto impide garantizar el uso comercial y obliga a consultar la licencia del modelo base LiquidAI/LFM2.5-350M antes de cualquier despliegue.
- Trazabilidad del entrenamiento incompleta: la seccion de procedimiento esta vacia (sin dataset, sin hiperparametros, sin numero de pasos ni tokens), lo que impide reproducir el entrenamiento.
- Inconsistencia de nomenclatura: el repositorio se llama Caspian-R1 mientras que la model card lo denomina Caspian-LFM2.5-350M-Reasoning, lo que complica la citacion y el seguimiento de versiones.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones de terceros.
- Soporte de runtime incierto: solo esta confirmada la compatibilidad con transformers; el soporte en llama.cpp, Ollama, vLLM o TGI no esta verificado para esta revision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Willie999/Caspian-R1
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Repositorio de TRL: https://github.com/huggingface/trl
- Otros repositorios del mismo autor (sin relacion aparente con este modelo): https://huggingface.co/Willie999/caspian y https://huggingface.co/Willie999/Kasapa-V1
- Resultados de busqueda web: no se han encontrado papers, blogs ni demos relacionados con Caspian-R1; los resultados obtenidos corresponden a LoRAs de generacion de imagenes alojados en Tensor.Art y PixAI, sin vinculacion con este modelo.
