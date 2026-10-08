# zijian2022/act_fanuc_er4ia_screw_single

## Resumen

El modelo `zijian2022/act_fanuc_er4ia_screw_single` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Lo publica el usuario de HuggingFace zijian2022, que ha subido otros artefactos relacionados con ACT y con tareas de manipulación (por ejemplo `uni_pouring_object_act`), lo que apunta a un flujo de trabajo de entrenamiento de políticas para brazos robóticos reales.

La tarea concreta es el atornillado (screw) sobre un robot FANUC ER-4iA, un brazo compacto de 6 ejes con 4 kg de carga útil y 550 mm de alcance, controlado por un R-30iB Mate Plus. El modelo tiene 51.670.663 parámetros reales según los pesos en safetensors, con un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en una GPU de gama media.

Su relevancia es práctica: demuestra el patrón habitual de ACT, entrenar con datos de teleoperación y desplegar una política que genera chunks de acciones, aplicado a una celda industrial concreta. La ficha del repositorio no incluye pipeline, licencia ni idiomas, y no se han publicado métricas de éxito ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para aprendizaje por imitacion (ACT, Action Chunking with Transformers); detalles completos de capas no disponibles |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (modelo de control robotico, sin interfaz de lenguaje natural documentada) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un codificador visual (tipicamente una CNN tipo ResNet sobre las imagenes de camara) con un transformer encoder-decoder que genera un chunk de acciones de horizonte fijo en cada inferencia. La generacion por chunks reduce el problema de la varianza temporal y permite politicas mas estables que el comportamiento reactivo paso a paso. El repositorio confirma el tag safetensors y el numero de parametros, pero no publica la configuracion de capas, el horizonte del chunk, la frecuencia de control ni la composicion del dataset.

El nombre del modelo indica que se entreno especificamente para la tarea de atornillado sobre un FANUC ER-4iA, presumiblemente a partir de demostraciones teleoperadas. No hay informacion en la documentacion disponible sobre el numero de episodios, el tipo de camaras, si hubo aumento de datos, tecnicas de regularizacion como temporal ensembling, ni sobre fases de RLHF o DPO, que no son habituales en este tipo de politicas.

## Capacidades

- Control robotico de manipulacion: genera comandos de accion de 6 grados de libertad mas pinza a partir de observaciones visuales, orientado a la tarea de atornillado.
- Prediccion por chunks de acciones, en lugar de un unico paso, lo que aporta suavidad y coherencia temporal.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de un modelo del entorno ni de reward shaping.
- Ejecucion en bucle cerrado con realimentacion visual, segun el esquema estandar de ACT.
- Integracion con celdas FANUC ER-4iA y su controlador R-30iB Mate Plus, que aporta E/S integradas, doble puerto Ethernet e iRVision.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales como modo thinking, vision generativa o audio: no disponibles.

## Casos de uso

- Atornillado automatizado en linea de montaje: la politica recibe imagenes de la celda y emite comandos de movimiento y par de apriete para colocar tornillos sobre una pieza, sustituyendo a la programacion punto a punto clasica cuando la posicion de la pieza varia ligeramente.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio reproducible de ACT sobre un robot industrial comercial, util para comparar tecnicas de chunking, ensembling temporal y representaciones visuales.
- Prototipado rapido de nuevas tareas sobre el mismo hardware: al tratarse de una politica entrenada por imitacion, el mismo pipeline puede reentrenarse con un dataset nuevo para otra tarea de ensamblaje en el ER-4iA.
- Docencia y formacion en robotica: el ER-4iA forma parte de la serie educativa de FANUC, y esta politica encaja en practicas donde se enseña a pasar de la teleoperacion a la politica aprendida.
- Benchmark interno de infraestructura de inferencia robotica: con 51,7 millones de parametros se puede medir latencia de control en bucle cerrado con distintas GPUs y frecuencias de camara.
- Automatizacion de tareas repetitivas de baja carga util: el robot soporta 4 kg de payload y 550 mm de alcance, suficiente para atornillado de componentes pequenos y medianos.
- Generacion de datos sinteticos o aumentados para otras politicas: la politica puede usarse como experto para etiquetar trayectorias en simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito, curvas de aprendizaje, numero de episodios de evaluacion ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,2 GB en precision de 32 bits y en torno a 0,1 GB en 16 bits para los pesos, mas el coste de las activaciones y del extractor visual. Una GPU con 4 GB o mas es suficiente en la practica.
- GPU recomendadas: cualquier GPU moderna de consumo o profesional. Para entrenamiento, una RTX 3090 o RTX 4090 es adecuada; para despliegue en produccion, una RTX A4000, L4 o similar es mas que suficiente.
- Cabe en GPU de consumo: si. Cualquier GPU con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050 o superiores.
- Tambien es viable en CPU para inferencia, aunque la latencia puede no alcanzar la frecuencia de control tipica de ACT (del orden de 10 a 50 Hz) en funcion del modelo visual.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que se requiere el codigo de entrenamiento e inferencia de ACT (por ejemplo, la implementacion de LeRobot o la del paper original). No hay versiones GGUF, Ollama ni vLLM documentadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles. En ACT es habitual que la inferencia completa, incluida la codificacion visual, se situe en el rango de decenas de milisegundos en GPU moderna, pero este dato no esta confirmado para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zijian2022/act_fanuc_er4ia_screw_single | 51.670.663 | No disponible | No disponible | No disponible | HuggingFace, safetensors |
| zijian2022/uni_pouring_object_act | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| ACT original (ALOHA) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Repositorio publico del paper |
| Diffusion Policy | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Repositorio publico del paper |

No hay datos de rendimiento, licencia ni especificaciones completas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. A nivel cualitativo, ACT es mas ligero y rapido de entrenar que las politicas de difusion, pero suele generalizar peor ante cambios grandes de escena; las politicas tipo VLA aportan generalizacion multitar ea a costa de un tamano muy superior.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, composicion del dataset ni condiciones de recogida de datos.
- Riesgo de sobreajuste a la celda concreta: al entrenarse para una tarea y un robot especificos, es probable que la politica falle ante cambios de iluminacion, posicion de camara, fondo o tipo de tornillo.
- Las politicas de imitacion no tienen mecanismos explicitos de deteccion de fallo; pueden ejecutar acciones incorrectas con alta confianza.
- No hay informacion sobre la frecuencia de control esperada, el horizonte del chunk ni si se aplica ensembling temporal, lo que dificulta planificar el despliegue.
- Contexto e idiomas: no aplica en el sentido de un modelo de lenguaje, no hay interfaz conversacional documentada.
- Licencia no disponible: sin una licencia explicita, no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de integrarlo en produccion.
- Repositorio con muy poca traccion (24 descargas, 0 likes) y sin model card detallada, lo que implica ausencia de soporte y de validacion independiente.
- Para uso industrial real harian falta evaluaciones de seguridad funcional del robot y del controlador, independientes del modelo.
- La fecha de creacion del repositorio que reporta HuggingFace es 2026-10-08, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zijian2022/act_fanuc_er4ia_screw_single
- Dataset relacionado: https://huggingface.co/datasets/zijian2022/testscrew1
- Modelo relacionado del mismo autor: https://huggingface.co/zijian2022/uni_pouring_object_act
- Perfil del autor: https://huggingface.co/zijian2022/datasets
- Ficha del robot FANUC ER-4iA (FANUC America): https://www.fanucamerica.com/products/robot/er-4ia
- Productos educativos de robotica FANUC: https://www.fanuc.eu/eu-en/educational-robotics-products
