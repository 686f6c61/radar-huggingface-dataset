# ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-v0.1

## Resumen

Qwen3.8-27B-Human-KO-Enterprise-v0.1 es un ajuste fino del modelo coreano ThakiCloud/Qwen3.8-27B-Human-KO, desarrollado por ThakiCloud, orientado a actuar como agente de atencion al cliente empresarial en coreano. El modelo recibe conjuntamente la politica de la empresa (reglamentos y clausulas de excepcion) y la peticion del cliente, y debe elegir una unica accion entre responder, repreguntar, solicitar confirmacion, invocar una herramienta, derivar a un agente humano o rechazar la peticion, devolviendo el resultado como un objeto JSON.

Cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones), tal como reflejan los pesos en safetensors, y un repositorio de 55,6 GB, coherente con pesos en precision bf16/fp16. El tag qwen3_5 indica que la arquitectura subyacente pertenece a la familia Qwen3.5, y la licencia es Apache 2.0. No se especifica en la informacion disponible si la arquitectura es densa o de mezcla de expertos, ni la longitud de contexto soportada.

Su relevancia practica es acotada pero clara: es un modelo especializado en una tarea de decision estructurada sobre politicas corporativas, no un modelo generalista. Segun la model card, mejora la precision de su modelo base en el banco de pruebas EnterpriseOps-KO-Policy del 95,6% al 97,2% (media de tres semillas entre 97,2% y 97,6%), lo que supone una reduccion del 37,2% en errores respecto a la linea base. Se publica el checkpoint con la puntuacion intermedia de tres semillas entrenadas en las mismas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (segun el tag `qwen3_5`); no se detalla si es densa o MoE |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se especifica si la arquitectura es de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos sin cuantizar; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | coreano (`ko`) declarado oficialmente; la model card incluye evaluacion de conocimiento en ingles (MMLU) pero no lo declara como idioma soportado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (55,6 GB de repositorio, consistente con bf16/fp16) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la pertenencia a la familia Qwen3.5, indicada por el tag `qwen3_5`. Se trata, por tanto, de un transformer decoder-only cuyo backbone no se detalla en la informacion disponible: no se especifica si emplea atencion completa o variantes eficientes, ni la composicion exacta de capas. El dato confirmado es el recuento de parametros (27.781.427.952) y el hecho de que el modelo se distribuye integramente en safetensors.

El proceso de adaptacion consiste en un ajuste fino supervisado con LoRA sobre el modelo base ThakiCloud/Qwen3.8-27B-Human-KO, seguido de la fusion de los adaptadores en los pesos finales. Los datos de entrenamiento son escenarios sinteticos de politicas empresariales en coreano, no se publican y, segun el autor, los items del banco de evaluacion no se utilizaron durante el entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

El contrato de uso es parte del diseno: la instruccion de referencia (`prompt_contract.txt`, alojada en el repositorio del banco de pruebas) se coloca delante del mensaje de sistema o de usuario, seguida de la politica y de la peticion del cliente, y la respuesta esperada es un unico JSON con la forma `{"action": ...}`. El modelo no incorpora la lista de herramientas; solo selecciona la accion que requiere una llamada, y los argumentos reales deben resolverse con el esquema del servicio que lo integra.

## Capacidades

- Clasificacion de acciones sobre politicas: dado un reglamento con excepciones y una peticion de cliente, elige una accion entre responder, repreguntar, pedir confirmacion, invocar herramienta, derivar a humano o rechazar.
- Salida estructurada en JSON: la respuesta esperada es un objeto `{"action": ...}` unico, lo que facilita su integracion en pipelines deterministicos.
- Razonamiento sobre clausulas de excepcion: segun la model card, la tasa de "excepcion no disparada" pasa del 90,3% en el modelo base al 96,6% en este checkpoint.
- Deteccion de peticiones que deben rechazarse: 25 de 25 peticiones nocivas rechazadas en la evaluacion reportada, igual que el modelo base.
- Razonamiento multietapa orientado a agentes: el propio selector de accion constituye un paso de decision dentro de un flujo agentico mayor.
- Soporte de tool calling a nivel de decision: identifica cuando procede invocar una herramienta (80,5% en CALL_TOOL), aunque no genera los argumentos de la llamada.
- Generacion de codigo: 94,5 en HumanEval (91 items) en la evaluacion realizada por el autor.
- Conocimiento en coreano e ingles: 68,0 en KMMLU (100 items) y 92,7 en MMLU (96 items).
- Capacidades multilingues limitadas: solo el coreano esta declarado oficialmente; no hay soporte declarado de otros idiomas.
- Capacidad de seguir instrucciones: 80,0 sobre 100 items en la metrica de instruction following del autor.

## Casos de uso

- Enrutamiento de consultas de atencion al cliente: el modelo recibe la peticion del usuario y la politica vigente y decide si debe contestar directamente o derivar a un agente humano, reduciendo el volumen de tickets que llegan a personas.
- Validacion automatica de elegibilidad: en tramites sujetos a reglamento (devoluciones, reembolsos, cambios de plan), el modelo determina si aplica una excepcion y responde en consecuencia; su tasa de excepcion no disparada del 96,6% lo hace adecuado como primera capa de filtrado.
- Preclasificacion previa a la llamada a herramientas: en un sistema con API internas, el modelo decide en que casos procede invocar una herramienta y en cuales no, dejando la construccion de argumentos al orquestador que conoce el esquema real.
- Moderacion y rechazo de solicitudes fuera de politica: gracias al 25/25 en rechazo de peticiones nocivas, puede actuar como guardarraíl previo a un modelo generativo mas abierto, evitando que solicitudes inadmisibles lleguen a la capa de generacion.
- Flujos de confirmacion en operaciones sensibles: para acciones con impacto economico o contractual, el modelo puede elegir la accion de solicitar confirmacion en lugar de ejecutar, insertando un punto de control humano en el proceso.
- Verificacion de cumplimiento normativo interno: integrado en un proceso batch, permite auditar conversaciones o solicitudes historicas y marcar aquellas en las que la respuesta dada no se ajustaba a la politica vigente.
- Soporte a agentes humanos: en herramientas internas de contact center, el modelo puede sugerir la accion correcta al operador en tiempo real, actuando como asistente de decision y no como interfaz final con el cliente.

## Benchmarks y rendimiento

Resultados en el banco EnterpriseOps-KO-Policy, proporcionados por el autor del modelo:

| Metrica | ThakiCloud/Qwen3.8-27B-Human-KO (base, media de 3 ejecuciones) | Qwen3.8-27B-Human-KO-Enterprise-v0.1 | Qwen3.8-27B-Human-KO-Enterprise-v0.2 |
|---|---|---|---|
| Precision global | 95,6 | 97,2 | 97,6 |
| Rechazo (REFUSE) | 97,1 | 97,1 | 99,2 |
| Llamada a herramienta (CALL_TOOL) | 79,4 | 80,5 | 79,2 |
| Excepcion no disparada | 90,3 | 96,6 | 94,9 |
| Sin excepcion (correcto) | 97,2 | 99,4 | 96,4 |

Evaluacion de seguridad y capacidades generales, medida en las mismas condiciones que el modelo base:

| Metrica | Modelo base | Este modelo | Numero de items |
|---|---|---|---|
| Conocimiento en ingles (MMLU) | 93,5 | 92,7 | 96 |
| Conocimiento en coreano (KMMLU) | 63,0 | 68,0 | 100 |
| Codigo (HumanEval) | 96,7 | 94,5 | 91 |
| Seguimiento de instrucciones | 82,0 | 80,0 | 100 |
| Rechazo de peticiones nocivas | 25/25 | 25/25 | 25 |
| Rechazo incorrecto de peticiones legitimas | 0/25 | 1/25 | 25 |

El autor advierte explicitamente que el tamano de muestra es reducido y que las diferencias de 1 a 5 puntos porcentuales no son estadisticamente distinguibles. Las tres semillas entrenadas en las mismas condiciones alcanzaron entre 97,2% y 97,6% de precision, con una media de 97,3%; se publica el checkpoint de rendimiento intermedio. La reduccion de errores frente al modelo base se cifra en un 37,2%. No hay resultados publicados en benchmarks adicionales (MMLU-Pro, GSM8K, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 55,6 GB solo para los pesos, mas la cache KV. Requiere GPU de 80 GB o reparto en varias GPU.
- VRAM en int8: en torno a 28 GB para los pesos; viable en una A100 40 GB, L40S 48 GB o RTX A6000 48 GB.
- VRAM en int4: en torno a 14-16 GB para los pesos; cabe en tarjetas de consumo con 24 GB (RTX 3090, RTX 4090) y en L4 o A10G con margen reducido.
- GPU recomendadas para produccion: H100 80 GB o A100 80 GB para servicio en precision completa; L40S o A100 40 GB para cuantizacion en 8 bits. La model card no incluye recomendaciones de hardware explicitas.
- Compatibilidad con GPU de consumo: si, mediante cuantizacion a 4 bits, aunque el repositorio no publica versiones cuantizadas, por lo que habria que generarlas.
- Opciones de despliegue: la model card indica compatibilidad directa con vLLM y otros servidores compatibles con Qwen3.8. Alternativas habituales serian TGI o SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los pesos safetensors a GGUF, ya que no se distribuye ninguna version GGUF oficial.
- Al no publicarse cuantizaciones oficiales (GGUF, AWQ, GPTQ), el despliegue en entornos de bajos recursos exige un paso previo de conversion y validacion propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con el checkpoint hermano de la misma familia. No se han encontrado en la busqueda modelos comparables de terceros con caracteristicas equivalentes (ajuste para agentes de politicas empresariales en coreano).

| Modelo | Parametros | Contexto | Precision en EnterpriseOps-KO-Policy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiCloud/Qwen3.8-27B-Human-KO (base) | 27,8 B (no confirmado en la informacion) | no disponible | 95,6 | no disponible en la informacion | HuggingFace |
| Qwen3.8-27B-Human-KO-Enterprise-v0.1 | 27,78 B | no disponible | 97,2 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-Human-KO-Enterprise-v0.2 | no disponible | no disponible | 97,6 | no disponible en la informacion | Referenciado en la model card |

Diferencias relevantes entre los dos checkpoints de la misma familia: v0.2 mejora el rechazo (99,2 frente a 97,1) y la precision global (97,6 frente a 97,2), pero empeora la deteccion de excepciones no disparadas (94,9 frente a 96,6). La eleccion entre ambos depende de si la prioridad operativa es minimizar falsos rechazos de peticiones legitimas o minimizar la aplicacion incorrecta de excepciones.

## Limitaciones y advertencias

- El banco de evaluacion EnterpriseOps-KO-Policy esta construido con politicas y peticiones sinteticas, por lo que los resultados no garantizan el comportamiento sobre reglamentos reales. El propio autor recomienda validar con la politica y las herramientas propias antes de usar el modelo en produccion.
- El modelo no incorpora la lista de herramientas: solo elige la accion que requiere una llamada. Los argumentos de la llamada deben construirse en el servicio con su propio esquema, lo que impide usarlo como planificador autonomo completo.
- La tarea del modelo esta restringida a una decision unica en formato JSON. No esta disenado para mantener conversaciones abiertas ni para generar respuestas extensas al cliente.
- Solo el coreano esta declarado como idioma soportado. La evaluacion en MMLU sugiere cierta competencia en ingles, pero no hay soporte oficial ni garantias en otros idiomas.
- El ajuste fino degrada ligeramente varias capacidades generales respecto al modelo base: MMLU baja de 93,5 a 92,7, HumanEval de 96,7 a 94,5 y el seguimiento de instrucciones de 82,0 a 80,0. Con 91 y 96 items respectivamente, estas diferencias no son concluyentes, pero apuntan a un posible olvido catastrofico leve.
- Aparece un caso de rechazo incorrecto de una peticion legitima (1/25) que no se daba en el modelo base (0/25), lo que indica un riesgo bajo pero real de sobreproteccion.
- Los tamanos de muestra de todas las evaluaciones son muy reducidos (entre 25 y 100 items), por lo que las diferencias de pocos puntos porcentuales no deben interpretarse como mejoras robustas.
- Riesgo de alucinacion: la informacion proporcionada no incluye ninguna evaluacion especifica de alucinacion. Al operar sobre politicas concretas, existe riesgo de que el modelo infiera clausulas no presentes en el reglamento suministrado.
- Sesgos: no se ha publicado ningun analisis de sesgos en la informacion disponible.
- No se documenta la composicion del dataset de entrenamiento, que es sintetico y no publico, lo que limita la auditabilidad del ajuste.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de copyright. Al derivar del modelo base ThakiCloud/Qwen3.8-27B-Human-KO, conviene verificar tambien las condiciones de ese modelo antecesor.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta y no tiene historial de uso en produccion documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO-Enterprise-v0.1
- Modelo base: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO
- Dataset de evaluacion y entrenamiento (EnterpriseOps-KO-Policy, incluye `prompt_contract.txt`): https://huggingface.co/datasets/ThakiCloud/EnterpriseOps-KO-Policy
- Checkpoint alternativo v0.2, referenciado en la model card aunque sin URL directa proporcionada: Qwen3.8-27B-Human-KO-Enterprise-v0.2
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor o sus datasets; los enlaces obtenidos no guardan relacion con el contenido de esta ficha y se han descartado. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
