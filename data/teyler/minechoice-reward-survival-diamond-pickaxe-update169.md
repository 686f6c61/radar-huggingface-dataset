# teyler/MineChoice-reward-survival-diamond-pickaxe-update169

# MineChoice diamond-pickaxe reward checkpoint 169

## Resumen

MineChoice-reward-survival-diamond-pickaxe-update169 es un checkpoint de política de aprendizaje por refuerzo (RL) entrenado para un agente de Minecraft Java 1.20.4 en modo supervivencia. Lo desarrolla el usuario teyler y se publica como un modelo experimental de clasificación sobre estado estructurado: no lee píxeles, sino un vector de 73 características de estado del juego, y emite una de 45 acciones categóricas. No es un modelo de lenguaje ni un modelo multimodal; es una red MLP pequeña (31.789 parámetros) que aprende a seleccionar acciones dentro de un bucle de RL basado en recompensas de supervivencia.

Su relevancia es acotada y experimental. El autor documenta un único hito verificado: en el episodio de mundo persistente `20260928-133932-train-persistent-003`, tres transiciones de recompensa de minería de diamantes elevaron el contador de diamantes de cero a tres, tras lo cual el agente fabricó un pico de diamante y se detuvo vivo. El propio autor advierte de que el modelo no ha completado Minecraft, no tiene tasa de éxito en partidas completas ni evaluación en conjunto reservado, y que los pesos por sí solos no constituyen un bot autónomo: las habilidades de alto nivel las ejecutan "coded skills" que traducen la acción elegida en comportamiento dentro del juego.

El checkpoint acumula 7.965 transiciones optimizadas y fue entrenado en local sobre una RTX 3090. Se distribuye con licencia MIT, con pesos duplicados en `model.safetensors` y `policy.json`, más ficheros `config.json` (orden de características y acciones) y `milestone_evidence.json` (alcance verificado y linaje del mundo). El número de descargas y de "likes" en el momento de la ficha es cero, lo que es coherente con su carácter experimental y reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP categorica (perceptron multicapa) de 73 entradas y 45 salidas de accion |
| Parametros totales | 31.789 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un vector de estado estructurado de 73 caracteristicas, no una secuencia de texto |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural); metadatos de idioma no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y JSON (`policy.json`, pesos identicos); configuracion en `config.json` y evidencia en `milestone_evidence.json` |

## Arquitectura y entrenamiento

La arquitectura es una MLP categorica inmutable de 73 entradas y 45 acciones, descrita por el autor como "73-input, 45-action categorical MLP". La entrada es estado estructurado del juego (no píxeles) y la salida es una distribucion categorica sobre 45 acciones discretas. El modelo no dispone de "teacher fallback": no hay modelo profesor que corrija o sustituya las decisiones durante la inferencia. Las habilidades codificadas ejecutan las acciones seleccionadas, de modo que la política aprende a elegir entre acciones de alto nivel ya implementadas, no a controlar el juego desde cero.

El entrenamiento se realizo en local y de forma incremental sobre recompensas de supervivencia de Minecraft Java 1.20.4. El linaje documentado arranca con la semilla natural `907761614` en el episodio `20260928-132431-train-907761614`, con inventario vacio y sin preparacion privilegiada. Posteriormente, en el episodio de mundo guardado `20260928-133932-train-persistent-003`, tres transiciones reales de minado de diamantes llevaron el contador de diamantes de cero a tres y el agente fabrico un pico de diamante. Este episodio aporto 83 transiciones de recompensa y dio lugar al checkpoint 169, que acumula 7.965 transiciones optimizadas. El autor insiste en que se trata de entrenamiento sobre mundo continuado y no de una victoria en mundo nuevo sin interrupciones, ni de una evaluacion en conjunto reservado, ni de una tasa de exito medida.

## Capacidades

- Seleccion de acciones discretas: dado un vector de 73 caracteristicas de estado estructurado, produce una distribucion sobre 45 acciones categoricas.
- Habilidades de supervivencia y progresion basica en Minecraft: el material documentado incluye minado de diamantes y fabricacion de un pico de diamante en el episodio registrado.
- Aprendizaje por refuerzo sobre recompensas: la politica se optimiza a partir de transiciones de recompensa de supervivencia, sin imitacion supervisada de un profesor.
- Integracion con habilidades codificadas: funciona como componente de decision dentro de un agente mas amplio que ejecuta las acciones.
- Reproducibilidad del experimento: se incluyen `config.json` con el orden de caracteristicas y acciones y `milestone_evidence.json` con el alcance verificado.
- Inferencia local sin API hospedada: el autor indica que la inferencia no requiere ningun servicio externo.

No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes multi-paso ni soporte multilingue. El modelo no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: sirve como checkpoint de referencia para estudiar el efecto del entrenamiento incremental sobre mundo persistente y el diseno de recompensas de supervivencia.
- Baseline para entornos de Minecraft: puede utilizarse como punto de partida para comparar politicas de estado estructurado frente a enfoques basados en pixeles.
- Ingenieria de recompensas: el linaje documentado (de inventario vacio a pico de diamante) permite analizar que senales de recompensa empujan la progresion en tareas de recoleccion y fabricacion.
- Componente de politica en agentes modulares: dado que el autor senala que los pesos por si solos no son un bot, el modelo encaja como modulo de decision acoplado a "coded skills" que ejecutan las acciones.
- Estudio de generalizacion y sobreajuste: al no existir evaluacion en conjunto reservado, el checkpoint es util para disenar y ejecutar ese tipo de evaluacion en trabajos posteriores.
- Reproduccion de experimentos en local: sus 31.789 parametros y su formato safetensors permiten cargar y ejecutar el modelo en hardware modesto para replicar el entorno de entrenamiento.
- Docencia y divulgacion de RL aplicado: por su tamano minimo y su alcance acotado, es un caso didactico de pipeline completo (entorno, recompensa, politica y evidencia de hito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no existe tasa de exito en partidas completas ni evaluacion en conjunto reservado para este checkpoint. La unica evidencia cuantitativa es el hito de entrenamiento, que se reproduce a continuacion sin tratarlo como benchmark:

| Evidencia reportada | Valor |
|---|---|
| Diamantes minados en el episodio registrado | 3 (de 0) |
| Resultado del episodio | fabricacion de un pico de diamante y parada en vivo |
| Transiciones de recompensa del episodio | 83 |
| Transiciones optimizadas acumuladas | 7.965 |
| Tasa de exito en partida completa | no medida |
| Evaluacion en conjunto reservado | no realizada |
| Muerte del Ender Dragon / final del juego | no verificado |
| Recoleccion de obsidiana, entrada al Nether y entrada al End | no verificado |

## Requisitos de hardware

- VRAM para inferencia: practicamente despreciable. Con 31.789 parametros, los pesos ocupan del orden de decenas o centenas de kilobytes en precision estandar, por lo que caben holgadamente en cualquier GPU y en memoria de CPU.
- GPU recomendadas: no se especifican requisitos. El entrenamiento se realizo en una RTX 3090, pero la inferencia no exige ese hardware.
- Cabe en GPU de consumo: si, y tambien en CPU. Cualquier GPU de consumo o incluso una maquina sin GPU dedicada puede cargar estos pesos.
- Opciones de despliegue: carga directa de `model.safetensors` o `policy.json` con una libreria estandar de safetensors/JSON; el autor indica que la inferencia no requiere API hospedada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponibles.
- Dependencia adicional: la inferencia del modelo no basta para jugar; se necesitan habilidades codificadas y un entorno de Minecraft Java 1.20.4 que traduzcan el estado y ejecuten las acciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de RL sobre estado estructurado para Minecraft) con parametros, contexto, rendimiento o licencia que puedan confrontarse de forma rigurosa. Los resultados de busqueda web disponibles aluden a trabajos de terceros (por ejemplo, aprendizaje por imitacion de video de gameplay a gran escala) que operan a una escala y con una metodologia distintas, por lo que no se ofrecen cifras comparativas que no puedan sostenerse con la informacion disponible.

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MineChoice diamond-pickaxe checkpoint 169 | 31.789 | estado estructurado (73 caracteristicas) | no aplica | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No ha completado Minecraft: no existe una victoria verificada en servidor ni una tasa de exito en partida completa. El autor lo declara de forma explicita.
- Sin evaluacion en conjunto reservado: la evidencia de hito proviene de un unico episodio de mundo continuado, no de una evaluacion sistematica, por lo que no puede inferirse una tasa de exito.
- Dependencia de habilidades codificadas: los pesos no constituyen un bot autonomo; sin el codigo que ejecuta las acciones, el modelo no juega.
- Entrada no visual: solo procesa estado estructurado, no pixeles, lo que limita su traslado a configuraciones que no expongan ese tipo de estado.
- Sin teacher fallback: no hay mecanismo de correccion que compense decisiones erroneas durante la inferencia.
- Entrenamiento con mundo continuado: el hito se logro en un mundo previamente entrenado, no en un mundo nuevo sin interrupciones, lo que reduce la fuerza de la evidencia de generalizacion.
- Sesgos conocidos: no se documentan sesgos en la informacion disponible, aunque su naturaleza experimental y su entrenamiento sobre recompensas de un unico entorno limitan su comportamiento fuera de esa distribucion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; en cambio, existe riesgo de decisiones erroneas o inefectivas cuando el estado de entrada se aparta de lo visto en entrenamiento.
- Cobertura de objetivos: recoleccion de obsidiana, entrada al Nether, entrada al End y finalizacion del juego no estan verificadas.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial, pero no se documentan garantias ni soporte.
- Produccion: no se recomienda su uso en produccion. El autor lo etiqueta como experimental, con cero descargas, sin benchmarks y con un unico hito verificado acotado.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teyler/MineChoice-reward-survival-diamond-pickaxe-update169
- Sitio oficial de Minecraft (contexto del entorno, Java 1.20.4): https://www.minecraft.net/en-us
- Resultados de busqueda web disponibles: no se ha encontrado documentacion tecnica, paper ni repositorio que describa este modelo concreto. Los resultados devueltos (modelos 3D de picos en Sketchfab y BuiltByBit, y una publicacion en LinkedIn sobre aprendizaje por observacion de gameplay) no estan vinculados a este checkpoint y no se consideran fuentes tecnicas del mismo.
