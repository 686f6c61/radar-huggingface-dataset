# Yujana/sf-doom_health_gathering_supreme

## Resumen

`Yujana/sf-doom_health_gathering_supreme` no es un modelo de lenguaje, sino un agente de aprendizaje por refuerzo entrenado con Sample Factory para el entorno `doom_health_gathering_supreme` de ViZDoom. El objetivo del entorno es que el agente sobreviva el mayor tiempo posible recogiendo botiquines de salud mientras esquiva o combate a los enemigos que aparecen de forma procedural. El modelo lo publica el usuario Yujana como entrega de la Unidad 8, Parte 2, del curso Deep RL de Hugging Face.

Se trata, por tanto, de una politica entrenada con APPO (Asynchronous PPO), la implementacion de PPO asincrono que caracteriza a Sample Factory. El resultado declarado por el autor es una recompensa media de 23,0 +/- 4,0, lo que arroja una puntuacion de 19,0 aplicando el criterio del curso (media menos desviacion tipica), muy por encima del minimo de 5,0 exigido para validar el ejercicio.

La relevancia de esta ficha es acotada: sirve como referencia de un artefacto de investigacion reproducible en RL profundo, no como modelo de proposito general. El repositorio figura con un tamano de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no documenta la arquitectura concreta de la red ni los hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo; la model card no especifica el backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion es el estado del entorno ViZDoom) |
| Tipos de cuantizacion | no disponible (no se documentan pesos ni formatos alternativos) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB) |
| Biblioteca | sample-factory |
| Pipeline | reinforcement-learning |
| Entorno | ViZDoom `doom_health_gathering_supreme` |
| Algoritmo | APPO (Asynchronous PPO) segun la model card |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La informacion disponible indica que el agente se entreno con Sample Factory empleando APPO, la variante asincrona de PPO que desacopla la generacion de experiencia (workers de entorno) del calculo de gradientes (learner) para maximizar el uso de CPU y GPU en paralelo. La model card no detalla la topologia de la red de politica ni de la funcion de valor, el numero de pasos de entrenamiento, el tamano de lote, la tasa de aprendizaje ni el presupuesto total de interacciones con el entorno.

Tampoco se documentan tecnicas adicionales como normalizacion de recompensas, curiosidad, randomizacion de dominio o curricula. El unico dato de entrenamiento verificable es el resultado de evaluacion declarado por el autor, no verificado de forma independiente (`verified: false` en el model-index). El entorno `doom_health_gathering_supreme` es un escenario de ViZDoom de observaciones visuales en primera persona, con generacion aleatoria de mapas y objetos, lo que exige al agente generalizar sobre distribuciones de escenas cambiantes.

## Capacidades

- Control secuencial en un entorno visual 3D en primera persona (ViZDoom), tomando acciones discretas de movimiento y disparo.
- Navegacion y recoleccion de objetos: el agente esta optimizado para localizar y recoger botiquines de salud.
- Supervivencia prolongada bajo aparicion procedural de enemigos.
- Politica entrenada especificamente para `doom_health_gathering_supreme`; no se declara transferencia a otros escenarios de ViZDoom ni a otros entornos.
- No soporta tool calling, function calling ni agentes multi-paso basados en lenguaje.
- No tiene capacidades multilingues, de generacion de texto, codigo, matematicas ni vision general: la vision esta limitada al renderizado del propio entorno.
- No se declara modo de razonamiento explicito ni capacidad multimodal alguna.

## Casos de uso

- Validacion de ejercicios del curso Deep RL de Hugging Face: el modelo cumple el criterio de la Unidad 8 Parte 2 (media menos desviacion tipica >= 5,0) con una puntuacion de 19,0, por lo que sirve como entrega de referencia para certificar el modulo.
- Linea base de comparacion en investigacion en RL: al estar entrenado con APPO sobre un entorno estandar de ViZDoom, permite contrastar nuevas variantes de PPO asincrono contra un resultado publico y reproducible.
- Reproduccion de experimentos de Sample Factory: el artefacto documenta la configuracion del entorno y el algoritmo, lo que facilita repetir el pipeline de entrenamiento y medir la varianza entre ejecuciones.
- Docencia de RL profundo: el escenario `health_gathering_supreme` es un caso de estudio clasico para explicar recompensas escasas, exploracion y generalizacion sobre mapas procedurales.
- Pruebas de infraestructura de entrenamiento distribuido: APPO requiere orquestar multiples workers de entorno y un learner, de modo que el modelo sirve para validar configuraciones de CPU/GPU y balanceo de carga en un cluster.
- Estudio de robustez y seguridad en agentes visuales: permite analizar como se comporta una politica entrenada ante cambios en la distribucion de escenas, ruido en la observacion o modificaciones del entorno.
- Benchmarking de motores de inferencia para politicas pequeñas: al ser una red de control, es un caso util para medir latencia de paso de decision en despliegues por lotes.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 23,0 +/- 4,0 | no |

Puntuacion derivada segun el criterio del curso (media menos desviacion tipica): 19,0, frente a un requisito minimo de 5,0.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a este tipo de artefacto.

## Requisitos de hardware

- No se han publicado cifras de VRAM ni de requisitos de GPU en la informacion disponible.
- El repositorio figura con 0,0 GB, por lo que no consta que los pesos entrenados esten efectivamente alojados; sin pesos no es posible ejecutar inferencia.
- La inferencia de una politica de control en ViZDoom es computacionalmente ligera en comparacion con un modelo de lenguaje; el cuello de botella habitual es el renderizado del entorno y la simulacion, no la red neuronal.
- ViZDoom requiere un contexto grafico compatible con OpenGL; en servidores sin pantalla se suele recurrir a Xvfb u otro servidor virtual.
- Entrenamiento: Sample Factory esta disenado para escalar en configuraciones con muchos nucleos de CPU para los workers de entorno y una o varias GPU para el learner; no se documenta la configuracion concreta usada aqui.
- Opciones de despliegue: la model card remite a la documentacion de Sample Factory para ejecutar politicas de ViZDoom; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se dispone de datos de latencia ni de throughput.

## Comparativa con modelos similares

Existen multiples entregas del mismo ejercicio publicadas en Hugging Face por otros usuarios. La comparacion solo puede hacerse sobre la recompensa declarada, ya que ninguna de estas fichas documenta arquitectura ni licencia.

| Modelo | Entorno | Algoritmo | Recompensa media | Puntuacion (media - std) | Repositorio |
|---|---|---|---|---|---|
| Yujana/sf-doom_health_gathering_supreme | doom_health_gathering_supreme | APPO (Sample Factory) | 23,0 +/- 4,0 | 19,0 | Hugging Face |
| Ravikanth8788/sf-doom-health-gathering-supreme | doom_health_gathering_supreme | PPO (Sample Factory) | 12,50 +/- 2,10 | 10,40 | Hugging Face |
| Surya198382/sf-doom_health_gathering_supreme | doom_health_gathering_supreme | Sample Factory | no disponible | no disponible | Hugging Face |
| kingabzpro/doom_health_gathering_supreme | doom_health_gathering_supreme | no disponible | no disponible | no disponible | Hugging Face / toolify |

Con los datos disponibles, el modelo de Yujana obtiene la recompensa media mas alta de la comparativa, aunque se trata de una unica evaluacion por modelo y el resultado esta marcado como no verificado en todos los casos.

## Limitaciones y advertencias

- El resultado declarado esta marcado como no verificado (`verified: false`); no hay evaluacion independiente que lo confirme.
- La recompensa media presenta una desviacion tipica de 4,0 sobre una media de 23,0, lo que indica una variabilidad considerable entre episodios o semillas.
- No se especifica la licencia, por lo que no puede asumirse ningun permiso de uso comercial ni de redistribucion.
- El repositorio figura con 0,0 GB: es probable que los pesos no esten subidos, lo que impediria reproducir la inferencia a partir de este artefacto.
- No se documentan arquitectura, hiperparametros, numero de pasos de entrenamiento ni protocolo de evaluacion, lo que limita la reproducibilidad.
- La politica esta especializada en un unico entorno de ViZDoom; no hay evidencia de transferencia a otras tareas ni a variantes del escenario.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling y no tiene capacidades multilingues. Cualquier expectativa de ese tipo es un error de categoria.
- Al tratarse de un agente entrenado por refuerzo sobre un simulador con contenido violento (Doom), su uso debe limitarse a contextos de investigacion y docencia.
- Los sesgos de la politica no estan analizados en la model card; en RL visual es habitual que el agente explote atajos del entorno que no generalizan fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yujana/sf-doom_health_gathering_supreme
- Modelo comparable (Surya198382): https://huggingface.co/Surya198382/sf-doom_health_gathering_supreme
- Modelo comparable (Ravikanth8788): https://huggingface.co/Ravikanth8788/sf-doom-health-gathering-supreme
- Ficha en toolify.ai (kingabzpro): https://www.toolify.ai/ai-model/kingabzpro-doom_health_gathering_supreme
- Material del curso Deep RL, Unidad 8 (hands-on con Sample Factory): https://github.com/huggingface/deep-rl-class/blob/main/units/en/unit8/hands-on-sf.mdx
- Cuaderno de la Unidad 8, Parte 2: https://colab.research.google.com/github/huggingface/deep-rl-class/blob/main/notebooks/unit8/unit8_part2.ipynb
- Documentacion de Sample Factory: referenciada en la model card, sin enlace explicito en la informacion disponible.
