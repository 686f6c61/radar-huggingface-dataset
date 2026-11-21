# StarpowerTechnology/WVY-3D-1M

## Resumen

WVY-3D-1M es un modelo de aproximadamente 1,07 millones de parametros desarrollado por StarpowerTechnology que realiza rigging y animacion automatica de criaturas 3D. El modelo esta compuesto por dos redes que trabajan conjuntamente: RigNet, un encoder tipo PointNet que procesa nubes de puntos de la superficie de una criatura para inferir su plan corporal, colocar las articulaciones del esqueleto y asignar pesos de skinning; y MotionGPT, un transformer decoder-only que genera secuencias de poses tokenizadas a partir de un prompt textual del tipo `familia:accion`.

La relevancia del modelo no reside en su escala, sino en su planteamiento: ha sido construido y entrenado desde cero en numpy con un motor de autograd escrito a mano, sin PyTorch ni otras librerias de machine learning, y su inferencia se ejecuta en el navegador en JavaScript plano. Esto lo convierte en un caso de estudio de modelos ultraligeros para tareas 3D procedurales, con un coste de entrenamiento de unos 43 minutos en un solo nucleo de CPU.

El modelo cubre seis planes corporales (bipedo, cuadrupedo, ave, pez, serpiente e insecto) con entre 8 y 21 articulaciones cada uno, y 25 acciones predefinidas. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors en float32, ademas de una version en float16 codificada en base64 para el runtime de navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RigNet (PointNet-style con max-pooling global y cabezas de atencion/votacion) + MotionGPT (transformer decoder-only) + tokenizador de poses por k-means |
| Parametros totales | Aproximadamente 1,07 M (RigNet 234.194; MotionGPT 754.969; tokenizador de poses 77.400 valores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens en MotionGPT (aproximadamente 4,3 s a 15 poses/s); ventana deslizante para clips mas largos |
| Tipos de cuantizacion | float32 (safetensors) y float16 (JSON base64 para navegador); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (los prompts son etiquetas estructuradas `familia:accion`, no lenguaje natural libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), JSON base64 (float16) |

## Arquitectura y entrenamiento

RigNet sigue un esquema PointNet: un MLP por punto de 3→64→128→256 con ReLU, seguido de un max-pooling global que produce un codigo de forma de 256 dimensiones. La fusion combina features locales y globales mediante `relu(Linear128→256(f2) + Linear256→256(global))` y una capa final 256→128. Sobre esa representacion se montan cuatro cabezas: clasificador de plan corporal (256→6), logits de skinning (128→92), atencion de articulaciones (128→92) y offsets de articulaciones (128→276). Las articulaciones se obtienen por votacion: cada punto de superficie propone un offset hacia cada articulacion y la posicion final es `joint_j = Σ_i softmax_i(att_ij) · (p_i + offset_ij)`. Los 92 outputs cubren las articulaciones de los seis planes corporales y el clasificador selecciona la porcion correspondiente.

MotionGPT es un transformer decoder-only con d_model 96, 4 capas, 4 cabezas, MLP de 384, pre-LayerNorm y GELU (tanh). Su vocabulario de 1.561 tokens combina 6 × 256 tokens de pose (uno por plan corporal, generados con k-means sobre 6 codebooks) y 25 tokens de prompt. La decodificacion usa top-k 8 con temperatura 0,8 restringida a los 256 tokens del plan corporal, con upsampling de 15 a 30 fps y suavizado posterior. Cada token de pose representa angulos de Euler por articulacion relativos a la pose de reposo (`R = Ry·Rx·Rz`) mas cuatro canales de raiz: balanceo lateral, altura, velocidad frontal y tasa de giro, en unidades del tamano de la criatura.

El entrenamiento uso datos generados proceduralmente: 4.200 criaturas esculpidas (700 por plan corporal) con 512 puntos de superficie y esqueleto/pesos como objetivos para RigNet, y clips de movimiento frescos por paso para las 25 acciones de MotionGPT. RigNet se entreno 4.000 pasos (batch 18, Adam con lr 2e-3 y decaimiento coseno, perdida 100·MSE de articulaciones + 10·MSE de votacion + entropia cruzada suave de skinning + entropia cruzada de plan corporal) en unos 17 minutos en un nucleo de CPU. MotionGPT se entreno 3.000 pasos (batch 24 × 64 tokens, Adam con lr 1e-3, warm-up de 200 pasos, decaimiento coseno y weight decay 1e-4) en unos 26 minutos en un nucleo de CPU.

## Capacidades

- Clasificacion de plan corporal a partir de una nube de puntos de 512 vertices, con seis clases (bipedo, cuadrupedo, ave, pez, serpiente, insecto).
- Prediccion de posiciones de articulaciones mediante votacion por atencion, con entre 8 y 21 articulaciones por plan corporal.
- Asignacion de pesos de skinning por vertice sobre un maximo de 92 articulaciones compartidas entre planes.
- Generacion de movimiento condicionada por prompt estructurado `familia:accion`, con 25 acciones disponibles (idle, walk, run, jump, sit, eat, wave, dance, hop, peck, fly, glide, swim, dart, slither, crawl, entre otras).
- Generacion de clips largos mediante ventana deslizante sobre el contexto de 64 tokens.
- Control de trayectoria en el runtime: wander, circle, toward, follow y flee, con mantenimiento de pies en el suelo.
- Integracion con un escultor procedural (genomas de criatura, 80 presets de especie, 35 tipos de props) que no forma parte del modelo aprendido.
- Conversion opcional de descripciones en lenguaje natural a scripts de escena JSON mediante Claude en claude.ai (componente externo, no incluido en los pesos).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Prototipado rapido de personajes en videojuegos: dado un mesh generado proceduralmente, RigNet devuelve esqueleto y pesos de skinning sin intervencion manual, lo que permite iterar sobre decenas de criaturas en minutos dentro del propio navegador.
- Herramientas de animacion asistida en el navegador: MotionGPT genera clips de idle, walk o run a partir de un prompt de dos campos, y el runtime los reproduce a 30 fps sin backend, adecuado para editores web tipo Three.js.
- Generacion de contenido para demos tecnicas y prototipos de VR/AR: el pipeline completo (esculpir, riggear, animar) se ejecuta en cliente, lo que facilita escenas interactivas sin infraestructura de GPU.
- Educacion en machine learning: el codigo incluye un motor de autograd escrito a mano en numpy (`tinygrad.py`) y el entrenamiento completo cabe en un nucleo de CPU, lo que lo convierte en material didactico para entender PointNet, votacion de articulaciones y transformers decoder-only.
- Poblar escenarios 3D con fauna variada: al cubrir seis planes corporales con esqueletos distintos, se pueden generar manadas, bandadas o bancos de peces con animaciones coherentes a partir de los mismos pesos.
- Investigacion en rigging automatico de bajo coste: sirve como baseline ligero (1,07 M de parametros) para comparar metodos de prediccion de esqueleto y skinning en entornos con recursos limitados.
- Previsualizacion de assets en pipelines de asset stores o catalogos: la inferencia en JavaScript permite mostrar criaturas ya riggeadas y animadas en la ficha de producto sin servidor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre criaturas no vistas en entrenamiento (50 por plan corporal):

| Metrica | Bipedo | Cuadrupedo | Ave | Pez | Serpiente | Insecto |
|---|---|---|---|---|---|---|
| Plan corporal reconocido | 100% | 100% | 100% | 100% | 100% | 100% |
| Error de articulacion (% del tamano corporal) | 1,3% | 1,3% | 1,5% | 0,9% | 0,4% | 0,8% |
| Puntos de piel en el mismo hueso que ground truth | 87% | 82% | 83% | 91% | 96% | 93% |

En las cuatro escenas de demostracion: 37/37 criaturas reconocidas, error medio de articulacion del 0,7% del tamano corporal y 90% de coincidencia de skinning.

Para MotionGPT, la perdida de next-pose-token en clips no vistos cayo de 8,36 a 1,07 (entrenamiento 1,20, sin sobreajuste), lo que el autor interpreta como aproximadamente 3 poses siguientes plausibles de 256 en cada paso.

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 para el conjunto de pesos (1,07 M de parametros), por lo que cabe en cualquier GPU, CPU o incluso en memoria de navegador.
- GPU recomendadas: no requiere GPU; el autor reporta entrenamiento e inferencia viables en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos navegadores y Node.js.
- Opciones de despliegue: runtime JavaScript propio (`code/engine/`), Node.js para inferencia en servidor, y el codigo Python incluido (`code/python/`) con el motor de autograd en numpy. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dada la naturaleza no textual y el formato propio del modelo.
- Latencia y throughput: no disponibles de forma numerica; el autor solo indica que la inferencia corre en el navegador en JavaScript plano y que el entrenamiento tarda aproximadamente 17 y 26 minutos por red en un nucleo de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WVY-3D-1M | ~1,07 M | 512 puntos; 64 tokens de pose | Rigging y animacion de criaturas | Apache 2.0 | Pesos en HF, runtime JS y Python |
| RigNet (Xu et al., 2020) | No disponible en esta ficha | Malla / nube de puntos | Prediccion de esqueleto y skinning | No disponible en esta ficha | Referencia academica |
| MotionGPT (Jiang et al., 2023) | No disponible en esta ficha | Texto a movimiento humano | Generacion de movimiento humano | No disponible en esta ficha | Referencia academica |

No se dispone de datos numericos comparativos con estas alternativas en la informacion proporcionada; la comparacion se limita a categoria de tarea y planteamiento. WVY-3D-1M se distingue por su escala minima, su ejecucion en navegador y su cobertura de seis planes corporales no humanos.

## Limitaciones y advertencias

- El modelo solo maneja seis planes corporales predefinidos; criaturas hibridas o anatomias fuera de esas categorias no estan soportadas.
- El vocabulario de acciones esta cerrado a 25 etiquetas; no acepta lenguaje natural libre como prompt (la conversion desde texto requiere un LLM externo como Claude).
- La longitud de contexto de MotionGPT es de 64 tokens (aproximadamente 4,3 s); los clips largos dependen de una ventana deslizante que puede introducir discontinuidades pese al suavizado.
- Los datos de entrenamiento son 100% procedurales, no capturados de movimiento real, lo que puede limitar el realismo y la naturalidad de las animaciones.
- El error de skinning es notable: entre el 4% y el 18% de los puntos de piel quedan asignados a un hueso distinto del ground truth segun el plan corporal.
- Riesgo de alucinacion en el sentido de predicciones anatomicamente implausibles en criaturas muy alejadas de la distribucion de entrenamiento (genomas extremos, topologias atipicas).
- No se documentan sesgos demograficos ni linguisticos porque el modelo no procesa texto libre ni imagenes de personas; el riesgo de sesgo se traslada a la distribucion de genomas procedurales del autor.
- No se documenta evaluacion en mallas reales de artistas, solo en criaturas generadas por el mismo pipeline procedural, lo que puede inflar las metricas respecto a uso en produccion.
- Uso comercial permitido por Apache 2.0, pero el modelo se distribuye sin garantias y con un runtime propio no auditado; conviene revisar el codigo JavaScript antes de integrarlo en produccion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-3D-1M
- Demo en Spaces: https://huggingface.co/spaces/StarpowerTechnology/WVY-3D-1M
- Video de demostracion: assets/demo.mp4 (incluido en el repositorio)
- Configuracion de arquitectura: config.json (incluido en el repositorio)
- Logs de entrenamiento: logs/ (incluidos en el repositorio)
