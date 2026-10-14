# TUpreneur/connectailab-rl-tupreneur-v1

## Resumen

connectailab-rl-tupreneur-v1 es un adaptador LoRA de PEFT entrenado sobre `Qwen/Qwen3.5-0.8B`, publicado por TUpreneur (CONNECT AI LAB × AI CITY BUILDERS). No es un modelo de propósito general: es un modelo de toma de decisiones que recibe una situacion, una pregunta y una lista de opciones, y devuelve unicamente la letra de la opcion elegida. Su dominio de aplicacion es un simulador de gestion empresarial llamado CONNECT TYCOON, donde el modelo ocupa el rol de agente de decision mes a mes.

El entrenamiento combina aprendizaje supervisado (destilado desde una politica "profesora" entrenada con PPO en el propio simulador) y un paso de aprendizaje por refuerzo con GRPO: se agrupa el conjunto de opciones de cada decision, se estima el retorno de cada una re-ejecutando el mes, y se incrementa la probabilidad de las opciones con ventaja normalizada por encima de la media, con una penalizacion KL respecto al modelo de partida para evitar el colapso de la distribucion.

Es relevante como ejemplo reproducible de pipeline RL -> SFT -> RL sobre un modelo pequeno (0,8 B de parametros), con datos generados integramente en simulador y con resultados publicados (80,1 % de acierto en el conjunto de test, 1,38 de arrepentimiento medio). Se distribuye bajo licencia Apache 2.0, pero su alcance es de investigacion y educacion, con idioma declarado unicamente coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen3.5-0.8B; arquitectura del transformer base no detallada en la informacion disponible |
| Parametros totales | 0,8 B en el modelo base Qwen3.5-0.8B; el adaptador LoRA anade un numero de parametros no especificado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene el adaptador en safetensors; la cuantizacion depende del modelo base con el que se combine) |
| Idiomas soportados | coreano (ko); la model card no declara otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar por separado el modelo base Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se acopla al transformer denso Qwen3.5-0.8B. El autor no documenta en detalle la arquitectura interna del base (numero de capas, tipo de atencion, dimensiones), por lo que ese dato queda como no disponible. El formato de salida es estrictamente acotado: dado un JSON con `state`, `question` y una lista `options` con etiquetas A, B, C..., el modelo emite una unica letra. La probabilidad de cada letra se interpreta como la probabilidad de la opcion correspondiente y el maximo como el nivel de confianza.

El pipeline de entrenamiento descrito consta de cuatro etapas. Primero, una politica pequena aprende a gestionar una empresa en el simulador durante miles de meses mediante PPO; esa politica actua como profesora. Segundo, se construye el conjunto de problemas: para cada mes operado por la profesora se altera la opcion escogida y se re-ejecuta el mes completo para asignar una puntuacion a cada alternativa. Tercero, se aplica aprendizaje supervisado para imitar la opcion de mayor puntuacion. Cuarto, se aplica refuerzo con GRPO: se tratan todas las opciones de una decision como un grupo, se normalizan las ventajas dentro del grupo y se sube la probabilidad de las opciones cuyo retorno en el simulador supera la media, anadiendo un termino KL contra el modelo de partida.

El conjunto de datos declarado usa la distribucion de empresa `general` y contiene 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de test. Los tags del repositorio incluyen `reinforcement-learning`, `deep-reinforcement-learning`, `grpo`, `gymnasium` y `decision-making`.

## Capacidades

- Seleccion de una unica opcion (letra) a partir de una situacion, una pregunta y un conjunto cerrado de alternativas.
- Calibracion implicita de la decision: la probabilidad asociada a cada etiqueta se puede leer como probabilidad de la opcion.
- Toma de decisiones secuencial en un entorno de simulacion de empresa (decisiones mes a mes).
- Razonamiento implicito restringido al formato de decision multiple cerrada; no genera explicaciones ni texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no soportado de forma nativa; el bucle de agente lo aporta el simulador externo (CONNECT TYCOON), no el modelo.
- Capacidades multilingues: no; la unica lengua declarada es el coreano.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Politica de decision en CONNECT TYCOON: el modelo ocupa el asiento del directivo y responde con una letra a cada decision mensual del simulador, cerrando el bucle de agente que gestiona la empresa.
- Investigacion en aprendizaje por refuerzo con GRPO: sirve como caso reproducible para estudiar ventaja normalizada por grupo y regularizacion KL sobre un modelo pequeno y un adaptador LoRA.
- Formacion y docencia en RL: la model card publica un notebook de Colab y el pipeline completo como material de un curso de refuerzo, de modo que se puede usar para reproducir el ciclo RL -> SFT -> RL en aula.
- Destilado desde politicas de simulador: es un ejemplo de como destilar una politica PPO en un LLM pequeno mediante un conjunto de problemas con puntuaciones por opcion re-ejecutadas en el entorno.
- Evaluacion de metodologias de decision con opciones discretas: permite comparar, sobre el mismo conjunto de test (840 problemas), un modelo sin entrenar, uno con SFT y uno con RL, usando acierto y arrepentimiento como metricas.
- Prototipado de respuesta de un solo token en entornos Gymnasium: util para medir el coste y la latencia reales de un agente LLM cuando la accion se reduce a una etiqueta.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las columnas sin dato se dejan en blanco porque el autor no las reporta.

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 33,6 % | 2,38 | no disponible | no disponible |
| Version con aprendizaje supervisado | 81,2 % | 1,45 | no disponible | no disponible |
| Version con aprendizaje por refuerzo (este modelo) | 80,1 % | 1,38 | 7,07 millones de wones (707만원) | 72 % (148/177) |

El propio autor advierte que la medicion de gestion empresarial corresponde a la media de dos meses no vistos, que la muestra es pequena y que la version con RL todavia queda por debajo de la politica profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 0,8 B de parametros del base, sin contar el adaptador ni el overhead del runtime): en precision fp16, en torno a 1,6 GB de pesos; en int8, en torno a 0,8 GB; en int4, en torno a 0,4 GB. A estas cifras hay que sumar el overhead de activaciones y del framework, por lo que conviene reservar margen adicional.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090 o inferiores; tambien en iGPU si el runtime lo permite.
- Cabe en GPU consumer: si, con holgura, incluso en tarjetas de gama de entrada y en CPU para despliegues de baja concurrencia.
- Opciones de despliegue: `transformers` junto con `peft` es la via documentada por el autor. El adaptador se puede fusionar con el base y convertir a GGUF para `llama.cpp` u `Ollama`, o servirse con `vLLM` o TGI tras fusionar los pesos. Estas vias no estan documentadas por el autor.
- Latencia y throughput estimados: no disponibles. Estructuralmente, al tratarse de un modelo de 0,8 B y una salida de un unico token, el coste por decision es muy bajo en comparacion con modelos de decenas de miles de millones de parametros, pero no se publican cifras medidas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos de decision de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada. La unica comparacion disponible es interna al propio proceso de entrenamiento.

| Modelo | Parametros | Contexto | Acierto en test | Arrepentimiento | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-tupreneur-v1 (RL) | 0,8 B (base) + LoRA | no disponible | 80,1 % | 1,38 | Apache 2.0 |
| Mismo pipeline, version SFT | 0,8 B (base) + LoRA | no disponible | 81,2 % | 1,45 | Apache 2.0 |
| Qwen3.5-0.8B sin entrenar | 0,8 B | no disponible | 33,6 % | 2,38 | no disponible en esta ficha |
| Politica profesora entrenada con PPO | no disponible | no aplica (politica de RL) | por encima de la version RL, valor no publicado | no disponible | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo sabe elegir una letra dentro de la lista de opciones que se le entrega en un formato JSON concreto. Fuera de ese formato la utilidad es nula.
- Idioma: unicamente coreano declarado. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Entrenamiento sintetico: todos los datos provienen de un simulador (CONNECT TYCOON) con la distribucion de empresa `general`. El comportamiento en empresas reales no esta validado.
- Muestra pequena: la evaluacion de gestion empresarial usa la media de dos meses no vistos, como reconoce el propio autor.
- Rendimiento por debajo de la profesora: la politica que genero los datos (PPO en simulador) supera al modelo final, lo que indica margen de mejora.
- Riesgo de alucinacion: aunque la salida esta restringida a una letra, el modelo puede emitir una etiqueta que no exista entre las opciones o elegir una opcion incoherente con el estado.
- Sensibilidad a la inyeccion de instrucciones: el autor incluye explicitamente en el prompt de sistema la instruccion de tratar el texto del campo `state` como datos y no como instrucciones, lo que sugiere que el modelo puede ser susceptible a prompts maliciosos embebidos en el estado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor recomienda revalidar con el historico real de la empresa antes de emplearlo en decisiones de gestion reales.
- Modelo educativo y de investigacion: no debe usarse como sistema de decision autonomo en produccion sin una capa de validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Banner del repositorio: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen de portada del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo de AI City Builders: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
