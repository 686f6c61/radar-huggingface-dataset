# spikefly/pi05-arx-hang-hanger-rack-step40k

## Resumen

π0.5 (pi05) para robotica bimanual, publicado por el usuario spikefly, es un ajuste fino de parametros completos del modelo base lerobot/pi05_base sobre el conjunto de datos yaoxianze/arx_cot_hang_hanger_rack, que contiene 149 episodios de demostracion de la tarea de colgar una percha en tres tramos (lejano, medio y cercano) de una barra. El modelo resuelve una unica tarea de manipulacion bimanual de tipo pick-and-place fino sobre un robot ARX Lift2S, y se distribuye con los scripts de despliegue y verificacion necesarios para reproducir la inferencia, pero sin los datos de entrenamiento. Su relevancia es practica: es un ejemplo de politica vision-lenguaje-accion (VLA) afinada de extremo a extremo, con protocolo de comprobacion de tolerancias reproducible y con un checkpoint hermano en el paso 30.000 que permite comparar el efecto de continuar el entrenamiento.

El repositorio corresponde al paso 40.000 de un entrenamiento que se ejecuto primero hasta el paso 30.000 con lote global de 32 y que despues se reanudo de forma exacta desde ese punto (modelo, optimizador, planificador de tasa de aprendizaje y estado del generador aleatorio restaurados, con continuidad en el orden de los datos). La tasa de aprendizaje al reanudar era de aproximadamente 5,8e-6 y decae hasta 2,5e-6 en el paso 40.000, al desplazarse el final de la decaida coseno. Los prompts, las camaras, la longitud del bloque y el numero de pasos ejecutados no cambian respecto al checkpoint de 30.000.

El modelo tiene 4.143.404.816 parametros segun el archivo safetensors, ocupa 9,4 GB en el repositorio y solo acepta instrucciones en ingles dadas de forma literal, con el punto final incluido. Cada inferencia produce un bloque de 70 pasos de accion, de los cuales solo se ejecutan los pasos 1 a 35. No se ha publicado informacion sobre arquitectura interna, longitud de contexto, cuantizaciones ni idiomas soportados mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05), gestionada por la libreria LeRobot; no se detallan en la model card los componentes internos |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), segun el archivo safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y los scripts de comprobacion usan bfloat16 y fp32 |
| Idiomas soportados | no disponible; las instrucciones del autor son en ingles y deben darse de forma literal |
| Licencia | gemma (terminos de Gemma) |
| Formato de pesos | safetensors (libreria LeRobot) |
| Modelo base | lerobot/pi05_base (ajuste fino de parametros completos) |
| Dataset de entrenamiento | yaoxianze/arx_cot_hang_hanger_rack (149 episodios), revision fija 9d5fb9c |
| Tamano del repositorio | 9,4 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-10-16 / 2026-10-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: identifica el modelo como π0.5 (etiqueta pi05) y lo asocia al modelo base lerobot/pi05_base, con ajuste fino de parametros completos. Se trata de una politica de robotica que consume imagenes de camara y una instruccion de texto, y produce secuencias de acciones para un robot bimanual ARX Lift2S; el repositorio incluye un directorio tokenizer/, de modo que no es necesario descargar google/paligemma por separado. El entrenamiento se realizo sobre el dataset yaoxianze/arx_cot_hang_hanger_rack (149 episodios de demostracion de colgar una percha en el tramo lejano, medio o cercano de una barra), en formato LeRobot v3.0, con lote global 32, en NVIDIA H200 y con Python 3.12.14, torch 2.7.1 (CUDA 12.6), torchvision 0.22.1, transformers 5.5.4 y PyAV 15.1.0.

El detalle tecnico mas relevante es el procedimiento de continuacion exacta del entrenamiento: tras 30.000 pasos se guardo el estado completo y se reanudo hasta 40.000 pasos restaurando modelo, optimizador, planificador de tasa de aprendizaje y estado aleatorio, manteniendo el orden de datos. La decaida coseno se extendio de 30.000 a 40.000 pasos, de forma que la tasa de aprendizaje pasa de unos 5,8e-6 al reanudar a 2,5e-6 al final. Los parametros de normalizacion son identicos a los del checkpoint de 30.000 (el fichero de desnormalizacion es identico byte a byte y las estadisticas de estado, accion e imagen del preprocesador son iguales elemento a elemento; solo cambian los recuentos y las marcas de tiempo, almacenados como escalares de 0 dimensiones), por lo que el codigo de cliente no necesita modificaciones para cambiar entre ambos checkpoints. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de acciones de manipulacion bimanual: a partir de imagenes de camara y un prompt de texto, produce bloques de 70 pasos de accion, de los cuales se ejecutan los primeros 35.
- Ejecucion de una tarea concreta en tres variantes: colgar una percha en el tramo lejano, medio o cercano de la barra, seleccionando la variante mediante el prompt.
- Interpretacion de instrucciones literales en ingles: `Hang the hanger on the far section of the rack.`, `Hang the hanger on the middle section of the rack.` y `Hang the hanger on the near section of the rack.`, con el punto final incluido.
- Uso en robot bimanual ARX Lift2S: los datos incluyen lecturas de pinza izquierda y derecha (izquierda de −3,331 a −0,467; derecha de −3,385 a −0,052), lo que indica control coordinado de dos brazos.
- Verificacion de integracion de camaras: permite ejecutar el mismo modelo con la funcion de captura propia del robot mediante `--client-fn` y especificar el formato de fotograma (`rgb` o `bgr`), con plantilla en `deploy/example_client_fn.py`.
- Reproducibilidad con tolerancias: los scripts `deploy/fit_check_pi05.py` y `deploy/replay_demo.py` permiten comparar la salida del modelo con valores esperados y comprobar la coherencia de los datos.
- No hay informacion disponible sobre tool calling, function calling, razonamiento multi-paso, modo de pensamiento, vision de proposito general, audio ni capacidades multilingues.

## Casos de uso

- Automatizacion textil de colgado de perchas: el modelo ejecuta la secuencia bimanual completa de tomar una percha y colocarla en la barra; se selecciona el tramo pasando el prompt correspondiente, lo que permite repartir perchas entre tres zonas sin reentrenar.
- Clasificacion por destino en linea de produccion: un sistema de nivel superior decide el tramo segun el pedido y emite uno de los tres prompts literales; el modelo se encarga del control fino de ambos brazos.
- Punto de partida para tareas de manipulacion similares: al ser un ajuste fino sobre lerobot/pi05_base con pesos completos en safetensors, puede servir como inicializacion para otras tareas de colgado o de insercion con la misma celda robotica.
- Validacion previa de despliegue en celda real: antes de mover el robot, el equipo puede ejecutar `deploy/fit_check_pi05.py` con 9 episodios de referencia (0, 24, 49, 50, 74, 99, 100, 124, 148) y comprobar que las tolerancias se cumplen con su propio hardware.
- Puesta a punto de la cadena de vision: con `--client-fn` y `--client-frame-format bgr` o `rgb` se detectan errores de orden de canales, recorte o escalado en el codigo de captura del robot, ya que el chequeo de ruta de cliente exige una diferencia por fotograma menor o igual a 1/255.
- Auditoria de datos de entrenamiento: el repositorio incluye `tools/prep_pi05_data.sh` y `tools/verify_dataset_v30.py`, que comparan por sha256 los 10 mp4 y por contenido los parquet frente a los valores de referencia, util para garantizar que la evaluacion se hace sobre los mismos datos con los que se entreno.
- Investigacion en politicas con bloques de accion: el esquema de 70 pasos generados y 35 ejecutados permite estudiar el compromiso entre frecuencia de replanificacion y latencia de inferencia en robots bimanuales.
- Referencia de reproducibilidad entre precisiones: los ficheros `deploy/tolerance.json` y `deploy/TOLERANCE.md` fijan cotas medibles entre bfloat16 y fp32, lo que permite validar el comportamiento numerico de un despliegue nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, no hay tasas de exito de tarea, ni resultados de MMLU, HumanEval o GSM8K, que por otra parte no aplican a una politica de robotica. Lo que si se publica son datos de reproducibilidad y de acuerdo numerico entre precisiones, que se recogen a continuacion.

| Metrica | Valor publicado |
|---|---|
| Parametros totales | 4.143.404.816 |
| Diferencia maxima en el tramo ejecutado (pasos 1-35), 14 dimensiones, bf16 frente a fp32 | 0,5755 (en las dimensiones de pinza) |
| Diferencia maxima en el tramo ejecutado, 12 articulaciones | 0,0372 rad |
| Tolerancia exigida en el tramo ejecutado, 14 dimensiones | ≤1,7267 |
| Tolerancia exigida en el tramo ejecutado, 12 articulaciones | ≤0,1117 rad |
| Diferencia de pinza del checkpoint de 30.000 pasos (referencia comparativa) | 0,176 |
| Medicion en RTX 5090 tomada de otro modelo (1.000 pasos, taza) | 0,015 en tramo ejecutado; 0,041 en bloque completo |
| Diferencia relativa de error de ajuste permitida | ≤10 % |
| Diferencia relativa de desplazamiento del inicio de bloque permitida | ≤10 % |
| Diferencia por fotograma en la prueba de ruta de cliente | ≤1/255 |

Las cifras de tolerancia se definen como 3 × max(diferencia entre precisiones en H200, diferencia medida en 5090). Para este checkpoint, las tolerancias del tramo ejecutado las determina la propia diferencia entre precisiones medida en H200; el valor de 5090 utilizado en el bloque completo es prestado de otro modelo, ya que este checkpoint no se ha probado en 5090.

## Requisitos de hardware

- Tamano del repositorio: 9,4 GB de descarga.
- Peso de los parametros en bfloat16: aproximadamente 8,3 GB (estimacion a partir de 4.143 millones de parametros × 2 bytes); en fp32, aproximadamente 16,6 GB (×4 bytes). La model card no publica cifras de VRAM.
- VRAM estimada para inferencia: del orden de 10 a 12 GB en bfloat16 contando pesos y memorias intermedias (estimacion propia, no confirmada por el autor); en fp32 hay que prever al menos 18-20 GB.
- GPU de referencia del autor: NVIDIA H200, empleada tanto para el entrenamiento como para generar los valores esperados.
- GPU mencionada para el entorno: RTX 5090 (Blackwell), que requiere torch con CUDA 12.8 (`torch==2.7.1` y `torchvision==0.22.1` desde el indice cu128).
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB), RTX 5090 (32 GB) y tarjetas de 16 GB en bfloat16. No se han publicado pruebas en 5090 para este checkpoint concreto.
- Opciones de despliegue: libreria LeRobot en el commit 89236ea0f4f81a81ca566081e20dd1ff5f823cbe, con `pip install -e ".[pi,dataset]"`, y los scripts del repositorio (`deploy/fit_check_pi05.py`, `deploy/replay_demo.py`, `tools/prep_pi05_data.sh`, `tools/verify_dataset_v30.py`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF, coherente con que el modelo se ejecuta como politica dentro de LeRobot.
- Latencia y rendimiento: no disponible. La unica referencia operativa es que cada inferencia produce 70 pasos de accion y solo se ejecutan 35, con opcion `--deterministic` que reduce la variabilidad a costa de velocidad.
- Dependencias de datos para la verificacion: hace falta descargar la revision 9d5fb9c del dataset (unos 1,9 GB de meta, data y videos; 5 archivos en meta, 149 en data y 447 en videos) y convertirla a LeRobot v3.0. Para inferencia no se necesitan datos.
- No se requiere autenticacion en Hugging Face: el repositorio y el dataset son publicos y el tokenizador esta incluido en tokenizer/.

## Comparativa con modelos similares

| Modelo | Tarea | Prompt | Bloque / pasos ejecutados | Rango de pinza izquierda (datos) | Rango de pinza derecha (datos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| spikefly/pi05-arx-hang-hanger-rack-step40k | Colgar percha en tramo lejano, medio o cercano | Tres prompts literales, con punto final | 70 / pasos 1-35 | −3,331 a −0,467 | −3,385 a −0,052 | gemma | Publico en Hugging Face (0 descargas) |
| spikefly/pi05-arx-hang-hanger-rack-step30k | Misma tarea, mismo entrenamiento | Identicos (segun el autor) | 70 / pasos 1-35 | no disponible | no disponible | gemma | Publico en Hugging Face |
| Modelo de apilar tazas (citado como referencia por el autor) | Apilar tres tazas | `stack three cups` | 50 / pasos 1-25 | −3,34 a −1,34 | −3,39 a −1,40 | no disponible | no disponible |
| Modelo de doblar toalla (citado como referencia por el autor) | Doblar una toalla | `fold the towel` | 70 / pasos 1-35 | −3,32 a −0,04 | −3,39 a −0,04 | no disponible | no disponible |
| lerobot/pi05_base | Modelo base previo al ajuste | no disponible | no disponible | no disponible | no disponible | no disponible | Publico en Hugging Face |

El autor advierte que los ficheros de normalizacion (preprocesador y posprocesador) no son intercambiables entre los tres modelos de la tabla. No hay datos publicados de parametros, contexto, rendimiento ni licencia de los modelos de taza y toalla, ni de capacidad de exito comparada con alternativas de la misma tarea.

## Limitaciones y advertencias

- Alcance muy reducido: el modelo esta afinado para una unica tarea (colgar una percha) en una celda concreta con robot ARX Lift2S. No es un modelo de proposito general ni un asistente de texto.
- Sin datos de exito: no hay tasa de exito, numero de intentos ni evaluacion en robot publicados. Las tolerancias de `deploy/TOLERANCE.md` miden reproducibilidad numerica, no eficacia de la tarea.
- Prompts estrictos: las instrucciones deben darse literalmente, con el punto final incluido. Cualquier variacion de redaccion, idioma o mayusculas queda fuera de la distribucion de entrenamiento.
- Pinza izquierda poco cerrada: en los datos, la pinza izquierda solo llega hasta aproximadamente −0,467 y, segun el autor, nunca llego a pinzar con fuerza. El modelo puede no ser fiable en situaciones que exijan un cierre firme.
- Normalizacion no transferible: los ficheros `policy_preprocessor*` y `policy_postprocessor*` son especificos de este ajuste y no se pueden mezclar con los de otros checkpoints.
- Repositorio sin datos: para la verificacion y las pruebas de reproduccion hay que descargar y convertir el dataset original en la revision 9d5fb9c. El repositorio solo contiene el modelo y las herramientas de despliegue.
- Diferencias de bytes en parquet: el script de verificacion compara contenido, no bytes, porque distintas versiones de pyarrow generan ficheros distintos. Los campos `meta/info.json` y `meta/stats.json` solo son orientativos y pueden no coincidir.
- Cobertura de hardware parcial: este checkpoint no se ha probado en RTX 5090. Las tolerancias del bloque completo (pasos 0-69) son solo indicativas y la parte de 5090 se toma de otro modelo; ademas, el bloque completo no se ejecuta en produccion.
- Variabilidad entre ejecuciones: dos pasadas hacia delante con la misma entrada pueden no ser identicas bit a bit en algunas GPU. La bandera `--deterministic` esta desactivada por defecto, reduce la velocidad y solo avisa sobre operadores no deterministas.
- Licencia Gemma: el uso comercial queda sujeto a los terminos de Gemma y a su politica de usos prohibidos; conviene revisarlos antes de integrar el modelo en un producto.
- Idiomas: no hay informacion sobre soporte multilingue. Las instrucciones son en ingles y no se documenta el comportamiento con otros idiomas.
- Riesgo de alucinacion: en el sentido de generacion de texto no aplica; el riesgo analogo es producir trayectorias de accion fuera de distribucion o inseguras ante entradas visuales no vistas.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de terceros sobre su funcionamiento.
- Seguridad fisica: es una politica de control de robot. Antes de usarla en una maquina real deben superarse las comprobaciones de ajuste, de ruta de cliente y de colorimetria, y debe existir un sistema de parada de emergencia independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spikefly/pi05-arx-hang-hanger-rack-step40k
- Checkpoint del paso 30.000: https://huggingface.co/spikefly/pi05-arx-hang-hanger-rack-step30k
- Dataset de entrenamiento: https://huggingface.co/datasets/yaoxianze/arx_cot_hang_hanger_rack
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de LeRobot: https://github.com/huggingface/lerobot (commit requerido: 89236ea0f4f81a81ca566081e20dd1ff5f823cbe)
- Documento de traspaso citado en la model card: `HANDOVER.md` (incluido en el repositorio del modelo)
- Herramientas de datos y verificacion: `tools/prep_pi05_data.sh`, `tools/verify_dataset_v30.py`, `tools/dataset_v30_SHA256SUMS.txt`, `tools/dataset_v30_reference.json`
- Herramientas de despliegue y comprobacion: `deploy/fit_check_pi05.py`, `deploy/replay_demo.py`, `deploy/example_client_fn.py`, `deploy/tolerance.json`, `deploy/TOLERANCE.md`, `deploy/expected/action_fit_summary_bf16.json`, `deploy/expected/`
- Tokenizador incluido en el repositorio: `tokenizer/`
- Resultados de busqueda web: no se han encontrado resultados relevantes. Las unicas entradas devueltas tratan sobre el videojuego Metaphor: ReFantazio y no guardan relacion con el modelo.
