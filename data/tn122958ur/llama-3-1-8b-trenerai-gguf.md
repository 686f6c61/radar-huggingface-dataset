# tn122958ur/Llama-3.1-8B-TrenerAI-GGUF

## Resumen

Llama-3.1-8B-TrenerAI-GGUF es una adaptacion del modelo meta-llama/Llama-3.1-8B-Instruct realizada por el usuario de HuggingFace tn122958ur mediante QLoRA (cuantizacion de 4 bits durante el entrenamiento). El modelo se ha creado para el sistema TrenerAI, un asistente conversacional de entrenamiento descrito en un trabajo de fin de master de la Universidad de Rzeszow (Polonia). Su ambito es deliberadamente estrecho: asumir dos funciones no decisionales dentro de una arquitectura mayor, la formulacion de respuestas del asistente en polaco y la conversion de la intencion del usuario en un comando estructurado en JSON.

La decision de diseno mas relevante es que el modelo no genera planes de entrenamiento. La planificacion recae en un modulo determinista que combina un clasificador de nivel de experiencia, busqueda en una base cerrada de ejercicios y reglas de seguridad y periodizacion. El modelo actua, por tanto, como capa de lenguaje natural y de extraccion de intenciones, no como motor de decision. Esto reduce el riesgo de alucinacion en la parte critica del sistema.

El resultado publicado es un unico archivo GGUF con cuantizacion q4_k_m de aproximadamente 4,6 GB, lo que lo hace desplegable en GPUs de gama consumer con 8 GB o mas de VRAM. La relevancia practica del artefacto es limitada fuera del contexto de la aplicacion TrenerAI: esta entrenado solo en polaco, sobre un corpus pequeno de dialogos preparado por el autor, y no se han publicado evaluaciones con benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajustado con adaptadores LoRA sobre el modelo base cuantizado a 4 bits |
| Parametros totales | 8 000 millones (modelo base Meta-Llama-3.1-8B-Instruct); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base soporta hasta 128 000 tokens. La configuracion de ejecucion publicada por el autor usa 4096 tokens (`-c 4096`) |
| Tipos de cuantizacion | GGUF q4_k_m (aproximadamente 4,6 GB); no se indican otras cuantizaciones |
| Idiomas soportados | Polaco (`pl`); no se ha evaluado su comportamiento en otros idiomas pese a que el modelo base es multilingue |
| Licencia | Llama 3.1 Community License (modelo derivado de Meta Llama 3.1) |
| Formato de pesos | GGUF para llama.cpp (`trener_fixed.gguf`); no se publican pesos en safetensors |
| Metodo de ajuste | QLoRA, rango del adaptador r=16, 2 epocas, 180 pasos |
| Perdida de entrenamiento | 0,79 -> 0,04 |
| Hardware de entrenamiento | NVIDIA T4 (Google Colab) |
| Casos de uso declarados | Generacion de texto conversacional, extraccion de intenciones a JSON |
| Dominio | Fitness y planificacion de entrenamiento (asistente TrenerAI) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8 000 millones de parametros de la familia Llama 3.1, con atencion causal y tokenizador multilingue. Sobre ese modelo se aplico un ajuste QLoRA: el modelo base se cuantizo a 4 bits durante el entrenamiento y se entrenaron adaptadores de bajo rango (r=16) durante 2 epocas y 180 pasos, con una reduccion de la funcion de perdida de 0,79 a 0,04. El entrenamiento se ejecuto en una unica NVIDIA T4, y el resultado del autor es que el dataset es un conjunto propio de dialogos entrenador-cliente en polaco, centrado en dos tareas: recabar el perfil del usuario y emitir ordenes de modificacion del plan.

No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado; tampoco se describen innovaciones de decodificacion o atencion. La unica innovacion de arquitectura reseñable no esta en el modelo, sino en el sistema que lo envuelve: la separacion entre la capa de lenguaje (este modelo) y el modulo determinista de generacion de planes, con reglas de seguridad y periodizacion. Las versiones de las librerias usadas en el entrenamiento no estan fijadas, por lo que el autor advierte que reproducir el proceso puede dar un resultado distinto, aunque el archivo GGUF publicado si es reproducible.

## Capacidades

- Generacion de texto conversacional en polaco, orientada a un registro de asistente de entrenamiento.
- Extraccion de intenciones: transforma la intervencion del usuario en un comando estructurado en JSON.
- Recogida de perfil de usuario a lo largo de una conversacion (nivel de experiencia, objetivos, disponibilidad).
- Traduccion de peticiones de modificacion de plan a ordenes que consume el modulo determinista.
- Funcionamiento como servicio local mediante `llama-server` en el puerto 8090, con 4096 tokens de contexto y offload completo a GPU (`-ngl 99`).
- Degradacion controlada: la aplicacion TrenerAI funciona sin este modelo, sustituyendo las respuestas por plantillas y manteniendo la generacion de planes, la clasificacion de nivel y las reglas de seguridad.
- No soporta, segun la informacion disponible: tool calling generico, uso de agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional de fitness en polaco: el modelo sostiene el turno de dialogo con el cliente y formula las respuestas del asistente, mientras la logica de negocio permanece en el modulo determinista. Es adecuado porque su ajuste se limita precisamente a esa funcion.
- Extraccion de intenciones a JSON para orquestacion: cada mensaje del usuario se convierte en un comando estructurado que el backend interpreta; el ajuste eleva la tasa de JSON correcto del 12,5 % al 79,2 % en la prueba de haluciaciones del autor.
- Recogida estructurada del perfil del cliente: el modelo conduce las preguntas necesarias (experiencia previa, dias disponibles, material) y las consolida en campos que alimentan al clasificador de nivel.
- Modificacion de planes ya generados: peticiones del tipo cambiar un ejercicio o ajustar el volumen semanal se traducen a comandos que el modulo de reglas valida antes de aplicarse, lo que evita que el modelo altere el plan por si mismo.
- Microservicio de lenguaje en un despliegue dockerizado: al exponerse como endpoint HTTP con `llama-server`, puede integrarse en el `docker compose` de la aplicacion y escalarse o sustituirse de forma independiente.
- Modo de respaldo con plantillas: en entornos con hardware insuficiente o ante fallos del servicio, la aplicacion puede desactivar el modelo y seguir operando con respuestas predefinidas, sin perder la funcionalidad de planificacion.
- Estudio academico de arquitecturas hibridas: sirve como referencia reproducible de un patron en el que el LLM no decide, sino que verbaliza y estructura, delegando la logica critica en codigo determinista.
- Prototipos de asistente para entrenadores personales en el mercado polaco: con la advertencia de que no es una herramienta medica y de que su comportamiento fuera del dominio de entrenamiento no ha sido evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta pruebas internas sobre la tarea de devolver el comando correcto:

| Test | Medida | Modelo base | Modelo ajustado |
|---|---|---|---|
| Haluciaciones (n=24) | JSON correcto | 0,125 | 0,792 |
| Haluciaciones (n=24) | Sin haluciaciones | 0,000 | 0,792 |
| Formato (n=5) | JSON correcto | 0,200 | 1,000 |

El propio autor advierte que la prueba de formato tiene una muestra muy pequena (n=5) y es ruidosa, y que la prueba mas fiable es la de haluciaciones con n=24. No hay datos de latencia, throughput ni comparacion con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion q4_k_m (archivo de 4,6 GB) y contexto de 4096 tokens con todas las capas en GPU.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para el archivo q4_k_m; NVIDIA T4 (16 GB) es el hardware usado en el entrenamiento y es suficiente para inferencia; A100 y H100 no aportan ventaja significativa a este tamaño salvo por concurrencia.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo con holgura; en equipos con 8 GB puede requerir reducir el contexto u offload parcial de capas a CPU. Tambien es viable en Apple Silicon con memoria unificada de 8-16 GB.
- Ejecucion en CPU: posible con llama.cpp, con latencias notablemente superiores; no se publican cifras.
- Opciones de despliegue: llama.cpp / `llama-server` (forma documentada por el autor, `-m trener_fixed.gguf --port 8090 -c 4096 -ngl 99`), Ollama y LM Studio importando el GGUF, y llama-cpp-python para integracion en Python.
- vLLM y TGI: no se documenta soporte; requeririan pesos en safetensors, que no se publican.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en la tarea | Disponibilidad |
|---|---|---|---|---|---|---|
| tn122958ur/Llama-3.1-8B-TrenerAI-GGUF | 8 000 M (base) + adaptador LoRA r=16 | No especificado; 4096 en la config publicada | Polaco | Llama 3.1 Community License | JSON correcto 0,792 en la prueba de haluciaciones (n=24) | GGUF q4_k_m, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8 000 M | 128 000 tokens | Multilingue | Llama 3.1 Community License | JSON correcto 0,125 en la prueba del autor | Pesos safetensors y GGUF de terceros |
| Otras adaptaciones QLoRA orientadas a polaco de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion cuantitativa solo es posible frente al modelo base, y se limita a la tarea interna de emision de comandos JSON. No hay datos que permitan situar este ajuste frente a otros modelos polacos de proposito general.

## Limitaciones y advertencias

- El ajuste se ha realizado sobre un conjunto de dialogos pequeno y de elaboracion propia; el comportamiento del modelo fuera del dominio de fitness y entrenamiento no ha sido evaluado.
- Riesgo de alucinacion persistente: incluso tras el ajuste, la tasa de JSON correcto en la prueba de haluciaciones es de 0,792, es decir, aproximadamente una de cada cinco respuestas sigue siendo incorrecta en esa tarea.
- Las evaluaciones publicadas son internas y con muestras pequenas (n=24 y n=5); la prueba de formato (n=5) es explicitamente calificada de ruidosa por el autor. No hay validacion externa ni benchmarks estandar.
- Idioma: el modelo esta etiquetado unicamente como polaco. Aunque el modelo base es multilingue, no se ha medido el efecto del ajuste sobre otros idiomas.
- El modelo no genera planes de entrenamiento ni toma decisiones: no debe utilizarse como motor de planificacion, ya que esa responsabilidad recae en el modulo determinista del sistema.
- No es una herramienta medica y no sustituye la consulta con un profesional sanitario.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluida la obligacion de atribucion ("Built with Llama"), el cumplimiento de la politica de uso aceptable y la inclusion de la licencia en las redistribuciones. Es responsabilidad del integrador revisar los terminos completos.
- Reproducibilidad del entrenamiento: las versiones de las librerias no estan fijadas, por lo que repetir el proceso puede no dar un resultado identico. El archivo GGUF publicado si es directamente utilizable.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin historial de uso en produccion ni mantenimiento posterior documentado.
- Sesgos: no se ha realizado ninguna auditoria de sesgo; el corpus de entrenamiento procede de dialogos preparados por el autor y no se documenta su representatividad demografica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tn122958ur/Llama-3.1-8B-TrenerAI-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- No se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en los resultados de la busqueda web; los resultados obtenidos corresponden a foros de consumo sin relacion con este artefacto.
