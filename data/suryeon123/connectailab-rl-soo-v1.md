# suryeon123/connectailab-rl-soo-v1

## Resumen

connectailab-rl-soo-v1 es un adaptador LoRA (libreria `peft`) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario suryeon123 en el marco del proyecto CONNECT TYCOON de CONNECT AI LAB. No es un modelo conversacional general: es un modelo de toma de decisiones que recibe un estado, una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve exactamente la letra de la opcion elegida. La distribucion de probabilidad sobre las letras, obtenida de los logits, se interpreta como la confianza del modelo en cada alternativa.

El entrenamiento sigue un pipeline en cuatro fases: primero se entrena una politica pequena en el simulador de empresa Connect Tycoon con PPO; esa politica actua como profesor generando un "cuaderno de problemas" mediante rollouts contrafactuales de cada opcion; despues se hace aprendizaje supervisado sobre la mejor opcion; y finalmente un ajuste por refuerzo con ventaja normalizada por grupo (estilo GRPO) y termino KL respecto al modelo de partida. El corpus consta de 4.082 problemas de entrenamiento, 832 de validacion y 840 de test, sobre una distribucion de empresa de tipo `general`.

Es relevante como ejemplo pequeno y reproducible de como convertir un simulador de decision en un modelo de lenguaje capaz de responder a tareas de decision estructuradas, con licencia Apache 2.0 y tamano suficiente para ejecutarse en portatil. Su alcance es deliberadamente estrecho: investigacion y educacion sobre decisiones empresariales sinteticas, no gestion real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA; el detalle de capas y atencion del base no esta disponible en la informacion proporcionada |
| Parametros totales | 752.393.024 (recuento de safetensors del repositorio; al tratarse de un adaptador PEFT, la fraccion de parametros entrenados no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio incluye artefactos en safetensors y GGUF segun los tags; los niveles concretos de cuantizacion no estan disponibles |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) y GGUF |
| Libreria de carga | peft |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,9 GB |
| Dataset de la tarea | 4.082 ejemplos de entrenamiento, 832 de validacion, 840 de test |
| Fecha de creacion / actualizacion | 2026-10-13 / 2026-10-13 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La pieza publicada es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder de menos de mil millones de parametros. La informacion disponible no detalla el numero de capas, la dimension oculta, el tipo de atencion ni la longitud de contexto del modelo base, por lo que esos datos quedan como no disponibles. El adaptador se carga con `transformers` mas `peft`, encadenando `AutoModelForCausalLM.from_pretrained("Qwen/Qwen3.5-0.8B")` con `PeftModel.from_pretrained(..., "suryeon123/connectailab-rl-soo-v1")`.

El entrenamiento tiene cuatro etapas descritas por el autor. En la primera, una politica pequena aprende a operar la empresa dentro del simulador Connect Tycoon durante miles de meses mediante PPO; esa politica hace de profesor. En la segunda se construye el conjunto de problemas: por cada mes de operacion se alteran las opciones de una decision concreta y se vuelve a ejecutar el mes hasta el final para puntuar cada alternativa. En la tercera se aplica aprendizaje supervisado imitando la opcion con mejor puntuacion. En la cuarta se aplica refuerzo con ventaja normalizada por grupo (comparacion de todas las opciones como un unico grupo) mas una penalizacion KL contra el modelo de partida, con el objetivo de elevar la probabilidad de las opciones que superan la media del grupo en puntuacion del simulador. El modelo base empleado para el arranque del ajuste es Qwen/Qwen3.5-0.8B, y el autor indica que la politica profesora (entrenada con PPO en el simulador) sigue rindiendo por encima del modelo publicado.

## Capacidades

- Clasificacion de decision con opciones cerradas: recibe un JSON con `state`, `question` y una lista de `options` con `label`, `key` y `description`, y devuelve una unica letra entre las opciones listadas.
- Calibracion de confianza por opcion: la probabilidad asociada a cada letra puede leerse desde los logits, de modo que el valor maximo actua como medida de certeza de la eleccion.
- Resistencia a inyeccion de instrucciones dentro del estado: el prompt de sistema indica explicitamente que el texto contenido en `state` debe tratarse como datos y no como instrucciones.
- Seguimiento estricto de formato: la salida esperada es unicamente la letra, sin explicacion ni texto adicional.
- Idioma coreano: la model card declara `ko` como unico idioma soportado, y el prompt de sistema y el formato de tarea estan en ingles.
- Ajuste por refuerzo orientado a una funcion de recompensa de simulador (beneficio mensual, satisfaccion y penalizacion por incidentes), no a preferencias humanas genericas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de politicas de decision en simuladores: el modelo puede sustituir a la politica de PPO como cabecera de decision entrenada por lenguaje, permitiendo comparar directamente ambas politicas en los mismos escenarios del simulador Connect Tycoon.
- Investigacion educativa sobre RLHF y GRPO: sirve como caso minimo y reproducible (4.082 ejemplos, adaptador LoRA, 0,9 GB) para estudiar el efecto de la ventaja normalizada por grupo frente al aprendizaje supervisado puro en una tarea de decision discreta.
- Generacion de etiquetas de decision para destilacion: al devolver una letra con su probabilidad, puede usarse para etiquetar grandes volumenes de estados sinteticos antes de entrenar modelos mayores o de construir heuristicas de decision.
- Pruebas de robustez frente a inyeccion de prompts: el escenario en el que el contenido de `state` intenta redirigir la respuesta permite medir si el modelo mantiene el formato y la tarea encomendada.
- Prototipado de asistentes de decision con opciones cerradas: en flujos donde la respuesta debe ser una de N alternativas predefinidas (encuestas, triaje de tickets, seleccion de accion en un juego), el modelo encaja sin necesidad de parsear texto libre.
- Analisis de calibracion: comparar la probabilidad asignada a cada opcion con la recompensa real obtenida en el simulador permite estudiar la correlacion entre confianza declarada y exito, un paso previo habitual en sistemas de decision automatizada.
- Demostraciones en portatil o en el navegador: con menos de mil millones de parametros y artefactos GGUF, puede ejecutarse localmente para talleres y clases sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de examen y sobre el simulador (el "arrepentimiento" o regret es mejor cuanto menor; el beneficio se expresa en wones coreanos por mes de simulacion):

| Modelo | Precision en el examen | Arrepentimiento | Beneficio mensual en simulador | Transacciones reales con tarjeta, perdida reducida |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 38,0 % | 2,77 | no disponible | no disponible |
| Aprendizaje supervisado | 67,0 % | 2,66 | no disponible | no disponible |
| Ajuste por refuerzo (modelo publicado) | 62,0 % | 2,11 | 5,56 millones de wones | 94 % (177/177) |

El propio autor advierte que se trata de un primer experimento: la evaluacion de operacion empresarial es la media de dos meses no vistos previamente, la muestra es pequena y el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parametros (752.393.024) y no de mediciones publicadas: aproximadamente 1,5 GB en fp16, alrededor de 0,8 GB en int8 y cerca de 0,5 GB en cuantizacion de 4 bits para los pesos, mas el coste de activaciones, cache KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica (RTX 3050, RTX 4060, RTX 3060, T4); no se requiere A100 ni H100. Tambien es viable en CPU, con mayor latencia.
- Cabe en GPU de consumo: si, en toda la gama actual de consumo e incluso en iGPU con suficiente memoria compartida, dado el tamano del modelo base.
- Opciones de despliegue: `transformers` + `peft` para el adaptador en safetensors, que es la ruta documentada en la model card; llama.cpp u Ollama para los artefactos GGUF; vLLM y TGI son posibles en teoria para un modelo de este tamano, aunque no se documenta su uso con este adaptador. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo de respuesta por decision.
- Almacenamiento: 0,9 GB de repositorio mas el modelo base, que debe descargarse por separado.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun modelo publico comparable de toma de decision empresarial entrenado con GRPO sobre un simulador, por lo que la comparativa externa queda como no disponible. La comparacion significativa es interna al propio experimento:

| Version | Precision en el examen | Arrepentimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B sin ajustar | 38,0 % | 2,77 | no disponible en la informacion proporcionada | HuggingFace |
| Variante con aprendizaje supervisado (no publicada como checkpoint independiente) | 67,0 % | 2,66 | apache-2.0 (mismo proyecto) | no disponible |
| connectailab-rl-soo-v1 (ajuste por refuerzo) | 62,0 % | 2,11 | apache-2.0 | HuggingFace |
| Politica profesora entrenada con PPO en el simulador | no disponible | no disponible (el autor indica que supera al modelo publicado) | no disponible | no disponible |

Frente a modelos de lenguaje pequenos de proposito general (por ejemplo, la propia familia Qwen3.5 en tamanos de 0,5 a 1 mil millones de parametros), la comparacion no es valida: ninguno ha sido evaluado sobre el conjunto de examen ni sobre el simulador Connect Tycoon, y este adaptador no ha sido evaluado en benchmarks generales.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo responde a tareas de decision con opciones cerradas en el formato exacto de la model card; fuera de ese formato no hay garantia de comportamiento util.
- Modelo de investigacion y educacion: el autor advierte explicitamente que se ha construido sobre un simulador de empresa sintetico y que debe revalidarse con los registros reales de una empresa antes de cualquier uso en decision empresarial real.
- Muestra de evaluacion pequena: la medida de operacion en el simulador es la media de dos meses no vistos, lo que limita la significacion estadistica de los resultados.
- Rendimiento por debajo del profesor: el propio autor senala que la politica entrenada con PPO en el simulador sigue superando al modelo publicado, de modo que no es el mejor componente disponible ni siquiera dentro de su propio proyecto.
- Rendimiento inferior al aprendizaje supervisado en precision de examen: 62,0 % frente a 67,0 %, con la salvedad de que el ajuste por refuerzo mejora el arrepentimiento (2,11 frente a 2,66) y el beneficio simulado. Es un compromiso que conviene tener en cuenta al elegir variante.
- Idioma: solo se declara coreano. El prompt de sistema y el esquema de la tarea estan en ingles, pero no hay evidencia de soporte multilingue ni de evaluacion en castellano.
- Longitud de contexto no documentada: no puede planificarse un uso con estados o historiales largos sin medir previamente el limite real del modelo base.
- Riesgo de alucinacion de etiquetas: si el modelo genera una letra que no figura entre las opciones listadas, la respuesta es invalida; conviene validar la salida contra el conjunto de etiquetas permitidas.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere descargar Qwen/Qwen3.5-0.8B y cargarlo con `peft`, lo que anade una dependencia externa y su propia licencia.
- Licencia Apache 2.0 en el repositorio del adaptador, pero la licencia del modelo base debe verificarse por separado antes de un uso comercial.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de redactar esta ficha, sin comunidad que haya validado los resultados de forma independiente.
- Los metadatos declaran fechas de 2026, posteriores a la fecha habitual de publicacion en el momento de redactar esta ficha, lo que conviene contrastar.
- La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los enlaces encontrados apuntan a dominios ajenos al proyecto (naijared.com y similares) y se descartan por no ser relevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryeon123/connectailab-rl-soo-v1
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon en GitHub: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen ilustrativa del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Paper tecnico: no disponible
- Demo interactiva: no disponible
