# YeMoKoo/AF_RL

## Resumen

AF_RL es una coleccion de adaptadores LoRA entrenados con GRPO (Group Relative Policy Optimization) sobre los modelos vision-lenguaje Qwen3-VL-2B-Instruct y Qwen3-VL-4B-Instruct, orientados a la recuperacion de errores en agentes GUI de Android. El autor, YeMoKoo, publica cuatro adaptadores para la variante de 2B (dos esquemas de recompensa: cabeza escalar Bradley-Terry y margen de token juez, cruzados con dos particiones de datos) y cuatro adaptadores para la variante de 4B con distintas mezclas de datos de entrenamiento. El objetivo declarado es comparar politicas de recuperacion de errores en entornos moviles mediantes tareas verificadas de AndroidWorld.

El interes tecnico reside en que no se trata de un modelo nuevo, sino de un estudio empirico de RL sobre un VLM pequeno aplicado a un dominio concreto: la interfaz grafica de Android. Los adaptadores de 2B anaden 392 tensores LoRA y los de 4B anaden 504, lo que permite cargarlos sobre el modelo base con PEFT sin replicar los pesos completos. El repo ocupa 4,3 GB, coherente con ocho adaptadores en bfloat16 sobre bases de 2B y 4B.

La relevancia actual viene de la combinacion de tres factores: modelos VLM de menos de 5.000 millones de parametros que ya interpretan capturas de pantalla, tecnicas de RL sin modelo de critico (GRPO) que abaratan el ajuste fino, y benchmarks de agentes moviles como AndroidWorld que permiten medir si el RL mejora de verdad la robustez ante errores. Los resultados publicados por el autor muestran mejoras moderadas y sensibles a la mezcla de datos, no un salto dramatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-Instruct |
| Parametros totales | Adaptadores: 392 tensores LoRA (base 2B) y 504 tensores LoRA (base 4B); parametros del modelo base no disponibles en la informacion proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para los adaptadores; heredada del modelo base Qwen3-VL, no especificada en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA cargables con PEFT) |

## Arquitectura y entrenamiento

Los adaptadores se anaden sobre Qwen3-VL-Instruct, un transformer vision-lenguaje que procesa imagenes (capturas de pantalla) junto con instrucciones textuales y genera acciones. El entrenamiento usa GRPO, una variante de optimizacion por politica que estima la ventaja relativa dentro de grupos de respuestas muestreadas y prescinde del modelo de critico, lo que reduce coste de memoria frente a PPO clasico. Todos los adaptadores de 2B se entrenaron durante 1 epoca con hiperparametros identicos desde el dataset `Gyubeum/AndroidFlux_RL_Train_Test` (commit `4545695c...`), variando unicamente el modelo de recompensa y la particion de datos.

Las particiones distinguen dos estados del episodio: `first_error` (la pantalla inmediatamente posterior a la primera accion erronea, donde la politica debe recuperarse) y `pre_error` (la pantalla previa a la accion erronea, donde la politica debe evitar el fallo). Los esquemas de recompensa son una cabeza escalar Bradley-Terry (valores finales +4,608 y +4,982) y un margen de token juez (valores finales −2,273 y −5,053); el autor advierte explicitamente que estas cifras no son comparables entre filas porque las escalas de recompensa difieren y las particiones representan estados distintos. Los adaptadores de 4B se entrenaron con receta offline-GRPO, presupuesto de 2.400 prompts y 150 pasos, usando como juez `Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced` (Bradley-Terry escalar + GPRS) y variando solo la mezcla de datos (UI-Genie frente a AndroidFlux `t` y `t-1`).

## Capacidades

- Percepcion visual de capturas de pantalla de Android y generacion de texto asociado (pipeline image-text-to-text).
- Recuperacion de errores en agentes GUI: dada una pantalla tras una accion fallida, proponer la siguiente accion correctiva.
- Prevencion de errores: dada una pantalla previa a una accion potencialmente erronea, evitar el paso que llevaria al fallo.
- Razonamiento multi-paso dentro de un episodio de interaccion movil, con el estado de la pantalla como observacion.
- Ajuste fino por preferencias mediante GRPO con dos esquemas de recompensa alternativos (escalar y discreto por token).
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base, sin detalle).
- Tool calling / function calling: no documentado para estos adaptadores.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Agente de automatizacion movil con recuperacion ante fallos: desplegar el adaptador `scalar-preerror-20260818` sobre Qwen3-VL-2B-Instruct para que el agente, al observar una pantalla de riesgo, evite la accion que desencadenaria un error en flujos de compra o formularios.
- Evaluacion comparativa de politicas de RL: usar los cuatro adaptadores de 2B como brazos de un experimento controlado (base sin RL frente a GRPO escalar frente a GRPO discreto) sobre datos held-out, tal como propone el autor, para medir que esquema de recompensa generaliza mejor.
- Investigacion en agentes GUI con presupuesto reducido: al partir de un VLM de 2B, el ciclo completo de inferencia sobre capturas de pantalla cabe en una GPU de consumo, lo que facilita iterar sobre datasets de errores sin infraestructura de centro de datos.
- Seleccion de mezcla de datos para entrenamiento de agentes: los adaptadores de 4B con mezclas UI-Genie/AndroidFlux (100/0, 0/100, 50/25/25, 40/35/25) sirven como evidencia empirica de que la proporcion de datos de recuperacion frente a datos de UI general afecta la tasa de exito limpia y en presencia de errores.
- Construccion de un recolector de datos de recuperacion: usar las politicas entrenadas para generar trayectorias de recuperacion en entornos Android y filtrar las exitosas como nuevo material de entrenamiento.
- Prototipado de asistencia en testing de aplicaciones Android: integrar el adaptador en un pipeline de pruebas que detecte pantallas anomalas y proponga el paso correctivo, reduciendo la intervencion manual en pruebas exploratorias.
- Despliegue en produccion con PEFT y vLLM: cargar el adaptador con `PeftModel.from_pretrained` y servir el modelo base con un backend compatible con PEFT, manteniendo un unico juego de pesos base para varios adaptadores intercambiables.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la tasa de exito en HV65 (65 tareas de AndroidWorld verificadas por humanos) para los adaptadores de 4B:

| Politica | Clean | Error_t | Media |
|---|---:|---:|---:|
| Qwen3-VL-4B-Instruct base (sin RL) | 20,0 | 21,5 | 20,8 |
| `grpo4b-ui100-20260924` | 23,1 | 16,9 | 20,0 |
| `grpo4b-t100-20260924` | 18,5 | 30,8 | 24,6 |
| `grpo4b-ui50-t25-t1-25-20260924` | 29,2 | 21,5 | 25,4 |
| `grpo4b-ui40-t35-t1-25-20260925` | 27,7 | 26,2 | 26,9 |

Lectura de los datos: el entrenamiento exclusivo con datos UI-Genie mejora el rendimiento en condiciones limpias (23,1 frente a 20,0) pero degrada el rendimiento en presencia de errores (16,9 frente a 21,5). El entrenamiento exclusivo con AndroidFlux `t` produce el efecto inverso: empeora en limpio (18,5) y sube en error_t (30,8). Las mezclas mixtas son las unicas que mejoran ambas columnas respecto a la base, con la mezcla 40/35/25 alcanzando la mejor media (26,9). No se han publicado resultados de benchmarks para los adaptadores de 2B en la informacion disponible; el autor indica que la comparacion esta pendiente de ejecutar en datos held-out.

## Requisitos de hardware

- VRAM estimada: para el adaptador de 2B en bfloat16, el modelo base requiere del orden de 4-5 GB de pesos mas memoria de activaciones y cache KV para imagenes; con cuantizacion de 4 bits del base, el consumo baja a aproximadamente 2-3 GB, aunque la cuantizacion de un VLM con torre visual anade complejidad. Para el adaptador de 4B en bfloat16, el base ocupa del orden de 8-9 GB. Estimaciones orientativas, no medidas publicadas.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 cubren con holgura los adaptadores de 2B y de 4B en bfloat16; A100 40/80 GB y H100 para servir varias politicas en paralelo o lotes grandes.
- Cabe en GPU de consumo: si, tanto el adaptador de 2B como el de 4B en bfloat16 caben en tarjetas de 24 GB; el de 2B podria caber en 8-12 GB con cuantizacion del base.
- Opciones de despliegue: PEFT + Transformers con `AutoModelForImageTextToText` (obligatorio, ya que `AutoModelForCausalLM` y `AutoPeftModelForCausalLM` no funcionan con Qwen3-VL); vLLM con soporte de adaptadores LoRA; llama.cpp/Ollama solo si se convierten los pesos a GGUF, lo que no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento HV65 (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AF_RL `grpo4b-ui40-t35-t1-25-20260925` (sobre Qwen3-VL-4B) | ~4B + 504 tensores LoRA | No disponible | 26,9 | No disponible | Hugging Face (YeMoKoo/AF_RL) |
| Qwen3-VL-4B-Instruct (base, sin RL) | ~4B | No disponible | 20,8 | No disponible | Hugging Face (Qwen) |
| AF_RL adaptadores de 2B (sobre Qwen3-VL-2B) | ~2B + 392 tensores LoRA | No disponible | No disponible | No disponible | Hugging Face (YeMoKoo/AF_RL) |
| UI-Genie (modelo juez usado como reward) | ~8B | 128k (segun nombre del checkpoint) | No disponible | No disponible | Hugging Face (Gyubeum) |

La comparativa relevante no es frente a otros VLM generalistas, sino frente a la misma base sin RL y frente a las otras mezclas de datos del propio repositorio; es ahi donde se observa que la ganancia media maxima es de unos 6 puntos porcentuales sobre la base (26,9 frente a 20,8).

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el base Qwen3-VL-2B-Instruct o Qwen3-VL-4B-Instruct con las revisiones de commit indicadas (`89644892...` para 2B, `ebb281ec...` para 4B); mezclar revisiones puede invalidar el adaptador.
- El numero de tensores LoRA debe verificarse tras la carga (392 para 2B, 504 para 4B); discrepancias indican una carga incorrecta.
- Las cifras de recompensa entre filas no son comparables: escalas distintas (Bradley-Terry escalar frente a margen de token juez) y particiones distintas (`first_error` frente a `pre_error`). El autor lo advierte explicitamente.
- Las ganancias medidas son modestas y sensibles a la mezcla de datos: el entrenamiento con un solo tipo de datos puede mejorar una columna y degradar la otra (por ejemplo, UI-Genie 100% baja error_t de 21,5 a 16,9).
- Evaluacion limitada a HV65 (65 tareas de AndroidWorld); no hay resultados publicados en otros benchmarks ni para los adaptadores de 2B.
- Dominio muy restringido: interfaz de Android; el rendimiento fuera de ese entorno no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; al ser un VLM pequeno que genera acciones a partir de capturas, existe riesgo de interpretar mal elementos de la pantalla, especialmente con texto pequeno o interfaces densas.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial de los adaptadores ni del modelo base; verificar antes de desplegar.
- Idiomas no documentados; el entrenamiento se centra en tareas de AndroidWorld, de dominio mayoritariamente anglofono.
- Fecha de publicacion y actualizacion (2026) posterior a la del conocimiento de referencia del redactor; los datos proceden exclusivamente de la model card y del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YeMoKoo/AF_RL
- Repositorio GitHub del autor: https://github.com/yemokoo/Advanced-AI
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento AndroidFlux RL: https://huggingface.co/datasets/Gyubeum/AndroidFlux_RL_Train_Test
- Modelo juez de recompensa: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-128k-balanced
