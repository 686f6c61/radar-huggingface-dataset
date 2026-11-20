# vpalmisano/inworld-sava-web

## Resumen

SAVA es un modelo de deteccion de actividad de voz (VAD) y deteccion de fin de turno desarrollado por Inworld. Responde dos preguntas sobre audio en directo cada 40 ms: si alguien esta hablando y si su turno ha terminado. El modelo original se distribuye en PyTorch; este repositorio de vpalmisano es una conversion no oficial a ONNX, en precision completa y en una version de 8 bits, que permite ejecutarlo con `onnxruntime` y `numpy` sin dependencias de PyTorch.

El modelo tiene 25,5 millones de parametros y combina un tronco Mamba-2 con atencion de ventana deslizante, junto con cabeceras especificas para deteccion de voz y de fin de turno. La entrada es audio PCM crudo de 16 kHz en tramas de 640 muestras (40 ms), con un front end log-mel integrado en el propio grafo. La salida incluye logits de voz, de lookahead y de fin de turno en cuatro horizontes temporales (0, 5, 10 y 20 tramas).

La relevancia de esta conversion radica en que reduce la barrera de despliegue: los ficheros ONNX (103 MB en float32 y 27 MB en int8) se pueden ejecutar en CPU, en navegador mediante WebAssembly y en dispositivos moviles, lo que facilita integrar deteccion de turno en pipelines de voz en tiempo real sin infraestructura de GPU. La licencia es Apache-2.0 y el modelo base es `inworld/sava`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 con atencion de ventana deslizante (tronco), cabeceras de voz y fin de turno |
| Parametros totales | 25,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por tramas de 40 ms con estado recurrente de 798.707 valores float32) |
| Tipos de cuantizacion | float32 (103 MB) e int8 dinamica (27 MB) |
| Idiomas soportados | no disponible (modelo acustico, independiente del idioma en la practica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 20, operadores estandar) |

## Arquitectura y entrenamiento

El modelo combina un tronco basado en Mamba-2 (modelo de espacio de estados) con atencion de ventana deslizante, disenado para procesamiento de audio en streaming. El front end log-mel esta integrado dentro del grafo ONNX, de modo que la entrada es directamente audio PCM float32 de 16 kHz en tramas de 640 muestras. El modelo mantiene un estado recurrente de 798.707 valores float32 que se pasa entre llamadas, lo que permite procesar un flujo de audio de forma incremental trama a trama sin necesidad de reprocesar el historico.

La salida del grafo incluye tres logits: `speech` (si la trama actual es voz), `lookahead` (si la trama tres posiciones atras era voz, con valor -30 para las tres primeras tramas del flujo) y `turn` (cuatro logits que indican si el turno ha terminado en horizontes de 0, 5, 10 y 20 tramas). No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La version int8 aplica cuantizacion dinamica en las 27 capas lineales grandes, manteniendo el front end, la atencion y la recurrencia en float32.

## Capacidades

- Deteccion de actividad de voz (VAD) por trama de 40 ms con salida de logit y probabilidad.
- Deteccion de fin de turno (end-of-turn) en cuatro horizontes temporales: 0, 5, 10 y 20 tramas.
- Procesamiento en streaming con estado recurrente, apto para audio en directo.
- Salida de lookahead para mejorar la precision de la deteccion de voz con tres tramas de retardo.
- Ejecucion en CPU con `onnxruntime` y `numpy`, sin dependencias de PyTorch.
- Ejecucion en navegador mediante `onnxruntime-web` (WebAssembly).
- Ejecucion en dispositivos moviles (probado en iPhone 17 Pro con app nativa).
- Front end log-mel integrado en el grafo, sin preprocesado externo.
- No soporta tool calling, agentes, vision ni audio mas alla de la deteccion de voz y turno.

## Casos de uso

- Deteccion de turno en asistentes de voz: el modelo permite decidir cuando el usuario ha terminado de hablar en conversaciones multi-turno, con horizontes de 0 a 20 tramas (hasta 800 ms de anticipacion), lo que reduce la latencia percibida en sistemas de dialogo por voz.
- Atencion al cliente automatizada: integrado en un pipeline de telefonia, el modelo distingue voz de silencio y detecta el fin de turno incluso en audio telefonico (8 kHz, canal simulado), con una precision del 89,36% en la version int8.
- Transcripcion en tiempo real: actua como preprocesador para sistemas ASR, segmentando el audio en turnos de habla y eliminando silencios antes de enviar fragmentos al motor de transcripcion.
- Despliegue en navegador: mediante `onnxruntime-web` se puede ejecutar en el cliente para aplicaciones de voz web, aunque en WebAssembly el rendimiento en movil no alcanza el tiempo real segun las pruebas del autor.
- Aplicaciones moviles nativas: la version int8 (27 MB) se ejecuta en un iPhone 17 Pro en 1,2 ms por trama, 33 veces mas rapido que el tiempo real, lo que permite VAD local sin conexion.
- Sistemas de agentes conversacionales: la deteccion de fin de turno con multiples horizontes permite a un agente decidir cuando responder o cuando esperar, mejorando la naturalidad de la interaccion.
- Filtrado de audio en pipelines de reuniones o grabaciones: el modelo puede etiquetar tramas de voz para recortar silencios o generar transcripciones con marcas temporales.

## Benchmarks y rendimiento

Deteccion de fin de turno sobre `pipecat-ai/smart-turn-data-v3.2-test` (31.527 clips, umbral 0,5):

| Modelo | Precision | AUC | Precision, linea telefonica | AUC, linea telefonica |
|---|---:|---:|---:|---:|
| PyTorch original | 93,36% | 0,9795 | 89,52% | 0,9575 |
| `sava.onnx` | 93,36% | 0,9795 | 89,52% | 0,9575 |
| `sava-int8.onnx` | 93,41% | 0,9793 | 89,36% | 0,9561 |

Deteccion de voz sobre el conjunto de test TEN-VAD (30 grabaciones, 6.570 tramas):

| Modelo | AUC | F1 | AUC, linea telefonica | F1, linea telefonica |
|---|---:|---:|---:|---:|
| PyTorch original | 0,9768 | 0,955 | 0,9298 | 0,882 |
| `sava.onnx` | 0,9768 | 0,955 | 0,9298 | 0,882 |
| `sava-int8.onnx` | 0,9771 | 0,956 | 0,9204 | 0,867 |

El autor indica que `sava.onnx` reproduce los logits de referencia del repositorio original con una diferencia maxima de 3e-5 y toma la misma decision que el modelo PyTorch en todas las tramas del conjunto de voz y en los 31.527 clips de fin de turno. La version int8 cambia la decision de fin de turno en el 0,5% de los clips limpios y en el 1,1% de los clips de linea telefonica.

Tiempo de procesamiento por trama de 40 ms en un hilo de CPU:

| Dispositivo | Runtime | `sava.onnx` | `sava-int8.onnx` |
|---|---|---:|---:|
| iPhone 17 Pro, iOS 27.2 | ONNX Runtime 1.30, app nativa | 2,2 ms | 1,2 ms |
| Apple M4 Max | ONNX Runtime 1.32, nativo | 1,5 ms | 1,2 ms |
| Apple M4 Max | onnxruntime-web 1.31, WebAssembly, Chromium | 6,0 ms | 9,0 ms |
| iPhone 17 Pro, iOS 27.2 | onnxruntime-web 1.31, WebAssembly, Arc (WebKit) | 89 ms | 146 ms |

Para comparar, el paso de streaming del modelo PyTorch tarda 2,3 ms en un hilo del M4 Max. No se han medido resultados en Android ni en placas de una sola placa (single-board computer).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tramas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `vpalmisano/inworld-sava-web` (este) | 25,5 M | tramas de 40 ms con estado | Apache-2.0 | ONNX float32 e int8 | Conversion no oficial de SAVA |
| `inworld/sava` (original) | 25,5 M | tramas de 40 ms con estado | no disponible en la informacion | PyTorch | Modelo base, requiere PyTorch |
| TEN-VAD | no disponible | no disponible | no disponible | no disponible | Referencia de benchmark de VAD usada en la model card |
| Silero VAD | no disponible | no disponible | no disponible | no disponible | Alternativa habitual de VAD, sin datos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de VAD en la informacion proporcionada, mas alla de las referencias al modelo PyTorch original y al conjunto TEN-VAD.

## Limitaciones y advertencias

- Conversion no oficial: el autor indica explicitamente que no esta hecha ni respaldada por Inworld.
- La version int8 degrada ligeramente el rendimiento en audio telefonico: -0,16 puntos de precision en fin de turno y -0,0094 de AUC en VAD de linea telefonica, con intervalos de confianza del 95% que excluyen el cero en ambos casos.
- En WebAssembly el rendimiento es limitado: en el iPhone probado ninguno de los dos ficheros mantiene el tiempo real (89 ms y 146 ms por trama de 40 ms), y en M4 Max el int8 es mas lento que el float32 en WebAssembly.
- No se ha medido el rendimiento en Android ni en placas de una sola placa.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas soportados.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos o negativos en la deteccion de voz y de fin de turno, especialmente en audio telefonico.
- El estado recurrente de 798.707 valores float32 debe gestionarse correctamente entre llamadas; un estado mal inicializado o no reiniciado entre flujos produce resultados incorrectos.
- La licencia Apache-2.0 se aplica a esta conversion; el aviso de Inworld sobre los pesos originales se incluye en el fichero `NOTICE`.
- No se han probado WebGPU ni WebAssembly multi-hilo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vpalmisano/inworld-sava-web
- Modelo base: https://huggingface.co/inworld/sava
- Conjunto de test de fin de turno: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test
- Revision upstream citada: `1beae7c1dd0d`
