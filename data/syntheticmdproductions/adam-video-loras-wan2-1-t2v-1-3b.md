# SyntheticMDProductions/ADAM-Video-LoRAs-Wan2.1-T2V-1.3B

## Resumen

ADAM Video LoRAs · Wan 2.1 T2V 1.3B es una coleccion de 22 adaptadores LoRA para el modelo de generacion de video texto-a-video Wan 2.1 T2V 1.3B, publicada por el usuario SyntheticMDProductions. Cada adaptador esta entrenado para inducir un estilo visual o tematica concreta (desde esteticas de videojuego como Minecraft o Roblox hasta personajes de creadores de contenido como IShowSpeed o Kai Cenat) y se activa mediante una palabra de disparo especifica. No se trata de un modelo autonomo, sino de pesos delta que deben cargarse sobre el modelo base Wan-AI/Wan2.1-T2V-1.3B.

Los adaptadores siguen un formato homogeneo: LoRA de rango 16 con alpha 16, entrenados con Musubi Tuner, y con un peso de fichero de aproximadamente 41,8 MiB cada uno (el repositorio completo ocupa 1,0 GB). El modelo base Wan 2.1 T2V 1.3B es un transformer de difusion para generacion de video con aproximadamente 1,3 mil millones de parametros, distribuido bajo licencia Apache 2.0.

La relevancia de esta publicacion es practica: ofrece un conjunto amplio y estandarizado de estilos listos para usar sobre un modelo base pequeno y asequible en hardware de consumo, lo que facilita experimentar con personalizacion de video generado sin entrenar LoRAs desde cero. La informacion publicada es escasa en cuanto a datos de entrenamiento, benchmarks y compatibilidad con ecosistemas distintos del runtime propietario del autor (ADAM y LoRAVideoTrainer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Wan 2.1 T2V 1.3B |
| Parametros totales | No disponible (los adaptadores son LoRA de rango 16; el modelo base tiene ~1,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los prompts de ejemplo estan en ingles) |
| Licencia | No disponible en el repositorio; el modelo base Wan 2.1 T2V 1.3B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors |
| Rango / alpha de LoRA | 16 / 16 |
| Herramienta de entrenamiento | Musubi Tuner |
| Tamano por adaptador | ~41,8 MiB |
| Tamano del repositorio | 1,0 GB |
| Numero de adaptadores | 22 |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |

## Arquitectura y entrenamiento

Cada fichero del repositorio es un adaptador LoRA de rango 16 y alpha 16 entrenado con Musubi Tuner sobre el modelo base Wan 2.1 T2V 1.3B. El modelo base es un transformer de difusion para generacion de video a partir de texto; los LoRA modifican las capas de atencion y proyeccion para sesgar la generacion hacia la estetica o tematica objetivo sin alterar los pesos originales. El autor indica que para el adaptador The Amazing Digital Circus se selecciono el checkpoint V2 guardado en el paso 1.100 tras compararlo con V1, lo que sugiere entrenamientos de aproximadamente un millar de pasos, aunque no se detalla el numero de pasos para el resto de adaptadores.

No se publican datos sobre el dataset de entrenamiento (numero de clips, resolucion, duracion, procedencia del material), ni sobre el uso de tecnicas como RLHF o DPO (no aplicables en el mismo sentido a un modelo de difusion), ni sobre innovaciones tecnicas adicionales. Tampoco se especifica si se empleo regularizacion, captions automaticos o aumentacion de datos. La informacion disponible se limita a los hiperparametros del adaptador y a las herramientas empleadas.

## Capacidades

- Generacion de video a partir de texto (text-to-video) sobre el modelo base Wan 2.1 T2V 1.3B.
- Induccion de estilos y tematicas concretas mediante palabras de disparo: cada uno de los 22 adaptadores responde a un trigger especifico (por ejemplo, `Pool_Rooms`, `Minecraft`, `SpongeBob_Squarepants`, `IShowSpeed_Video`).
- Estilos cubiertos: videojuegos (Minecraft, Roblox Fun Obby, BeamNG Drive, Plants vs. Zombies, Friday Night Funkin, Hello Neighbor Gameplay, Super Mario Bros.), animacion y series (SpongeBob SquarePants, The Amazing Digital Circus, Battle for Dream Island, Alphabet Lore, Numberblocks, My Singing Monsters), esteticas liminales (Backrooms Footage, Pool Rooms) y creadores de contenido (IShowSpeed, Kai Cenat, CaseOh, Joe Bartolozzi, Zack D Films, Super Mario Logan).
- Composicion de la palabra de disparo con descriptores de escena, iluminacion y contenido en el prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento; son capacidades no aplicables o no disponibles para este tipo de modelo.
- Compatibilidad verificada unicamente con ADAM y LoRAVideoTrainer; ComfyUI y Diffusers quedan pendientes de verificacion segun el autor.

## Casos de uso

- Prototipado rapido de clips tematicos para redes sociales: cargando el adaptador correspondiente y un prompt con la palabra de disparo se generan clips de unos 5 segundos a 832 × 480 y 12 FPS, adecuados para pruebas de concepto o borradores de contenido.
- Previsualizacion de esteticas para produccion audiovisual: un estudio puede generar referencias visuales de ambientes liminales (Pool Rooms, Backrooms Footage) antes de rodar o disenar un set, aprovechando la coherencia estilistica del LoRA.
- Contenido fan y comunidad: los adaptadores de series y videojuegos (SpongeBob, The Amazing Digital Circus, Minecraft) permiten generar material derivado para comunidades de fans, siempre que se respeten los derechos de las obras originales.
- Generacion de assets para videojuegos indie: el adaptador Minecraft o Roblox Fun Obby puede emplearse para producir clips de referencia o material promocional con una estetica consistente con el genero.
- Investigacion sobre personalizacion de modelos de difusion: el conjunto sirve como banco de pruebas homogeneo (mismo rango, alpha y herramienta) para estudiar como distintos datasets afectan a la calidad y fidelidad del LoRA.
- Creacion de mockups para pitching: agencias y creadores pueden generar rapidamente videos de muestra con una estetica concreta (por ejemplo, Zack D Films o IShowSpeed) para presentar una idea antes de invertir en produccion real.
- Educacion y demostraciones tecnicas: util para talleres que expliquen el flujo texto-a-video con LoRA sobre modelos pequenos, dado el bajo coste de almacenamiento de cada adaptador (~42 MiB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FVD, CLIP score, VBench u otras) ni comparaciones numericas con otros adaptadores o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el modelo base Wan 2.1 T2V 1.3B es un transformer de difusion de ~1,3B parametros; en fp16 requeriria del orden de 3 GB solo para pesos, mas memoria para activaciones y latentes de video, por lo que en la practica se recomienda al menos 8-12 GB de VRAM, aunque esta cifra no la confirma el autor.
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria esperar GPUs consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090) y GPUs profesionales (A100, H100) para mayor throughput, pero el autor no publica requisitos oficiales.
- Compatibilidad con GPU consumer: probable por el tamano del modelo base, pero no verificada ni documentada.
- Opciones de despliegue: ADAM (runtime Wan/Musubi del autor) y LoRAVideoTrainer son las unicas herramientas documentadas. ComfyUI y Diffusers estan pendientes de verificacion.
- Latencia y throughput: no disponibles. El unico dato de generacion es el ejemplo de Pool Rooms: 832 × 480, ~5 segundos, 12 FPS, 16 pasos de muestreo, fuerza de LoRA 1,15 y modo de velocidad experimental activado, sin tiempos de ejecucion publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| ADAM Video LoRAs (Wan 2.1 T2V 1.3B) | LoRA rango 16 sobre base ~1,3B | ~5 s por clip en el ejemplo | No disponible (base Apache 2.0) | Hugging Face, runtime ADAM / LoRAVideoTrainer |
| Wan-AI/Wan2.1-T2V-1.3B (modelo base) | ~1,3B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros LoRA para Wan 2.1 T2V | No disponible | No disponible | Variable segun autor | Hugging Face |
| Modelos T2V de mayor tamano (p. ej. familia Wan 2.1 14B) | ~14B | No disponible en esta ficha | Apache 2.0 (segun modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no declara licencia propia; aunque el modelo base Wan 2.1 T2V 1.3B es Apache 2.0, los terminos de uso de los adaptadores no estan explicitados, lo que genera incertidumbre para uso comercial.
- Varios adaptadores hacen referencia a personajes, marcas y obras con derechos de autor (SpongeBob SquarePants, Minecraft, Super Mario Bros., Plants vs. Zombies, Roblox, The Amazing Digital Circus, entre otros). El autor califica al menos uno como "adaptador fan no oficial"; el uso comercial puede infringir derechos de terceros.
- Algunos adaptadores representan a personas reales (IShowSpeed, Kai Cenat, CaseOh, Joe Bartolozzi, Zack D Films), lo que plantea riesgos de derechos de imagen y de generacion de contenido no consentido.
- Riesgo de alucinacion visual y de artefactos propios de modelos de difusion de video pequenos: incoherencias temporales, deformaciones y perdida de consistencia en clips largos.
- La duracion de los clips de ejemplo es de unos 5 segundos; no se documenta soporte para videos mas largos ni para resoluciones superiores a 832 × 480.
- Compatibilidad limitada: solo verificada con ADAM y LoRAVideoTrainer; ComfyUI y Diffusers no estan confirmados, lo que puede dificultar su integracion en pipelines existentes.
- No se documentan sesgos demograficos, culturales o linguisticos; los prompts de ejemplo estan en ingles y no se confirma soporte multilingue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se publican datos de entrenamiento, lo que impide auditar la procedencia del material y evaluar posibles sesgos o infracciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SyntheticMDProductions/ADAM-Video-LoRAs-Wan2.1-T2V-1.3B
- Modelo base Wan 2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Herramienta LoRAVideoTrainer: https://github.com/dreamsartificial648-sketch/LoRAVideoTrainer#install
- Runtime ADAM: https://huggingface.co/SyntheticMDProductions/AI_Development_Automation_Manager#wan-video-lora
- Ejemplo de generacion Pool Rooms (imagen): ./pool-rooms/pool-rooms-preview.jpg
- Ejemplo de generacion Pool Rooms (video): ./pool-rooms/pool-rooms-preview.mp4
