# zjj1993/Qwen3.8-Flash-Next-uncensored-china

## Resumen

`zjj1993/Qwen3.8-Flash-Next-uncensored-china` no es un modelo de lenguaje completo, sino un artefacto de control de activaciones (un *control vector* o dirección de direccionamiento) pensado para aplicarse sobre el modelo base Qwen/Qwen3.8-Flash-Next en tiempo de inferencia. El fichero contiene 48 direcciones de 2560 dimensiones (48 x 2560 floats, menos de 1 MB) medidas sobre el flujo residual del modelo, y su aplicación consiste en restar la componente de cada estado oculto a lo largo de esa dirección en las capas 4 a 44. El objetivo declarado por el autor es eliminar el sesgo de censura política sobre temas sensibles para el Gobierno chino sin reentrenar ni modificar los pesos originales.

La relevancia del artefacto es metodológica: mantiene los pesos intactos, se puede activar o desactivar por petición y, según las cifras del autor, reduce del 58 % al 2 % las respuestas censuradas en un conjunto de 24 temas sensibles, sin degradar de forma apreciable tareas de código, matemáticas o razonamiento (HumanEval+ 156 vs. 155, GSM8K 50 vs. 49, MMLU 96 vs. 97 en sus pruebas emparejadas). Frente a las técnicas habituales de *abliteration* o de ajuste fino "sin censura", aquí la intervención es quirúrgica y reversible.

El repositorio tiene 10 descargas y 12 likes, se publicó el 19 de octubre de 2026 y se distribuye bajo Qwen Community License 1.0. Solo se han publicado resultados para inglés y chino, y únicamente se ha validado la ruta de ejecución con el runtime Strata; el propio autor advierte que llama.cpp estándar no reproduce el comportamiento porque suma el vector en lugar de proyectarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: vector de direccionamiento (steering) sobre el flujo residual de un transformer. El modelo base Qwen3.8-Flash-Next se describe con 4 flujos residuales de "hyper-connection" y 48 bloques (capas indexadas 0-47); arquitectura interna del base no disponible |
| Parametros totales | El artefacto tiene 48 x 2560 floats (122.880 valores, menos de 1 MB). Los metadatos de HuggingFace indican 120.320, cifra ambigua que no corresponde a los pesos del modelo base; el repositorio no incluye pesos (tamano 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El vector se distribuye en GGUF (formato control-vector de llama.cpp) y como array NumPy float32 (`china-v1.dirs.npy`). Cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | en, zh (ingles y chino); comportamiento en otros idiomas no evaluado |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0, copyright 2026 Qwen); el aviso de licencia y copyright debe acompanar cualquier copia |
| Formato de pesos | GGUF (control vector) y `.npy` float32 de forma (48, 2560) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Capas intervenidas | 4 a 44 (`direction.N` se aplica tras el bloque decodificador N, 0-based) |
| Dimension oculta asumida | 2560 (derivada de la forma del vector) |
| Tamano del fichero | Menos de 1 MB |
| Autor / fecha | zjj1993, 19 de octubre de 2026 |

## Arquitectura y entrenamiento

El artefacto se construye sin entrenamiento. El procedimiento, descrito en la model card, consta de cuatro pasos: primero se reunen 30 pares de contraste, cada uno en ingles y en chino, que enfrentan un evento sensible para China con un evento comparable en otro pais formulados de la misma manera (por ejemplo, la Campana de los Cien Flores o el Movimiento Anti-Derechista de 1957 frente a la Gran Purga de Stalin, o Wei Jingsheng frente a Andrei Sajarov); los prompts estan en `data/pos.txt` y `data/neg.txt`. Despues se registran las activaciones del flujo residual en el ultimo token, justo en el momento en que el modelo empieza a responder (inicio de `<think>`), para cada capa, con la herramienta `tools/lasttok.cpp` sobre llama.cpp.

La direccion se calcula por capa como la media de las activaciones de los prompts sobre China menos la media de los prompts de control, promediada sobre los 4 flujos de hyper-connection y normalizada a longitud unitaria (`tools/make_dir.py`); se verifica que la direccion separa temas sensibles de temas de control en prompts reservados (`data/held.txt`). En inferencia se aplica una proyeccion geométrica tras la escritura residual de cada bloque decodificador, para cada flujo de hyper-connection y cada token, tanto en prefill como en generacion: `h = h - (h . d) d`. Es una resta de una componente, no un empuje en sentido contrario, de ahi que el autor senale que el sesgo pro y anti-gobierno queda aproximadamente simetrico (20 % y 18 %).

## Capacidades

- Eliminacion de la direccion de censura politica sobre China en tiempo de inferencia, con conmutacion por peticion (activada o desactivada sin recargar pesos).
- Reduccion declarada de respuestas censuradas del 58 % al 2 % en 24 temas sensibles con 4 formulaciones (chino/ingles, pregunta directa y formato de examen) y 2 muestras por celda, con `thinking=low`.
- Aumento de respuestas calibradas del 11 % al 56 % segun la misma evaluacion.
- Conservacion de capacidades agenticas: 34/34 tareas resueltas con y sin proyeccion en las pruebas del autor.
- Conservacion de codigo, matematicas y conocimiento general: HumanEval+ 156 vs. 155, GSM8K 50 vs. 49, MMLU 96 vs. 97.
- No altera el comportamiento en temas relacionados con China pero no sensibles (20/20 en ambos modos).
- Capacidades del modelo base (tool calling, agentes, vision, audio, modo thinking) no estan documentadas en la informacion disponible; la evaluacion se hizo con `thinking=low`.

## Casos de uso

- Investigacion en interpretabilidad: replicar el pipeline completo (pares de contraste, captura de activaciones en el ultimo token, calculo de direcciones por capa y validacion en held-out) para estudiar como se representa la censura politica en el flujo residual de un transformer de 48 bloques.
- Auditoria de censura y evaluacion comparada: desplegar el mismo endpoint en modo stock y en modo proyeccion y comparar respuestas sobre un banco de temas sensibles, usando la tabla de resultados del autor como linea base metodologica.
- Docencia y periodismo de datos: obtener respuestas potencialmente mas calibradas sobre temas historicos sensibles manteniendo registro de que la proyeccion estaba activa, con la advertencia de que las cifras concretas pueden estar sobrestimadas.
- Red teaming y evaluacion de seguridad: comprobar que la intervencion solo afecta a la direccion de censura china y medir si otras conductas de seguridad se mantienen, dado que el autor no las probo.
- Control granular en produccion: usar el flag por peticion (`"experimental_speed_projection": true/false`) para mantener el modelo original en trafico general y activar la proyeccion solo en rutas de investigacion o analisis.
- Suite de no regresion al portar el metodo: emplear HumanEval+, GSM8K, MMLU, las 34 tareas agenticas y el conjunto de temas china-no-sensibles como bateria de comprobacion antes de confiar en una implementacion en otro runtime.
- Estudio de sesgo direccional: medir la simetria entre sesgo pro-gobierno (20 % en ambos modos) y anti-gobierno (6 % a 18 %) para analizar si la proyeccion solo anula una componente o induce un desplazamiento.

## Benchmarks y rendimiento

Datos aportados por el autor (192 respuestas por modelo, 24 temas x 4 formulaciones x 2 muestras, `thinking=low`, evaluadas por Claude contra respuestas de referencia escritas por Claude):

| Tema sensible para China | Modelo original | Con proyeccion |
|---|---|---|
| Censurado (rechazo, ignorancia fingida, linea propagandistica, evasion) | 58 % | 2 % |
| Calibrado (preciso, senala donde la evidencia esta disputada) | 11 % | 56 % |
| Sesgo pro-gobierno | 20 % | 20 % |
| Sesgo anti-gobierno | 6 % | 18 % |
| Errores factuales graves | 5 % | 7 % |

| Prueba de calidad (emparejada, misma maquina) | Original | Con proyeccion |
|---|---|---|
| Tareas agenticas (34, autoevaluadas) | 34/34 | 34/34 |
| HumanEval+ (163) | 156 | 155 |
| GSM8K (50) | 50 | 49 |
| MMLU (100) | 96 | 97 |
| Temas sobre China no sensibles (20) | 20 | 20 |
| Velocidad de decodificacion (RTX 3090) | 75,5 tok/s | 77,5 tok/s |

No se han publicado resultados de benchmarks del modelo base Qwen3.8-Flash-Next en la informacion disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM adicional por el vector: despreciable (menos de 1 MB); el requisito real lo determina el modelo base, cuyas especificaciones no estan disponibles.
- GPU recomendadas: no disponibles para el modelo base. La unica referencia empirica publicada es una RTX 3090, con 75,5 tok/s en modo original y 77,5 tok/s con proyeccion.
- Ajuste en GPU de consumo: no se puede confirmar sin conocer el tamano del modelo base.
- Runtime validado: Strata, con los flags `--control-vector-scaled china-v1.gguf:1.0 --control-vector-layer-range 4 44 --cvec-mode project --cvec-dir per-layer`.
- llama.cpp estandar: no sirve tal cual, porque su opcion `--control-vector` suma el vector en lugar de proyectarlo; requiere portar `h = h - (h . d) d` sobre los 4 flujos residuales.
- Otros runtimes (vLLM, TGI, Ollama): no probados ni documentados.
- Latencia: no se publica latencia absoluta; la decodificacion no se degrada segun la medicion del autor (ligeramente superior con proyeccion, diferencia probablemente dentro del ruido de medida).

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible. La comparacion solo puede hacerse a nivel de estrategia:

| Enfoque | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (proyeccion por capas) | 122.880 valores (48 x 2560) | No aplica | 58 % -> 2 % de censura; HumanEval+ 155, GSM8K 49, MMLU 97 | Qwen Community License 1.0 | GGUF + NPY; solo validado en Strata |
| Abliteration (ablacion de direccion de rechazo en pesos) | Requiere pesos modificados (tamano del base) | El del modelo base | No disponible | La del modelo base | Requiere redistribuir pesos |
| Ajuste fino / DPO "sin censura" | Requiere pesos modificados | El del modelo base | No disponible | La del modelo base | Requiere entrenamiento y redistribucion |
| Instruccion en prompt de sistema | 0 | El del modelo base | No disponible | La del modelo base | Inmediata, sin artefactos |

## Limitaciones y advertencias

- Una pregunta corta en chino sobre el 4 de junio de 1989 sigue recibiendo a veces una respuesta evasiva.
- En Falun Gong, la Gran Hambruna y Xinjiang el modelo responde, pero las cifras y los detalles pueden estar exagerados.
- La intervencion elimina el interruptor de censura, no mejora el conocimiento del modelo: la precision esta limitada por lo que el modelo sabe.
- Solo se ha medido censura politica sobre China; el resto del comportamiento de seguridad no se ha tocado ni probado, por lo que no hay garantia de que otras politicas de seguridad se mantengan.
- La evaluacion usa Claude como juez contra respuestas de referencia escritas por Claude: la categoria "calibrado" refleja ese estandar, no una verdad de referencia externa.
- Los temas los eligio el autor y se inclinan hacia lo que cubren los medios occidentales; hay sesgo de seleccion.
- Dos muestras por celda y `thinking=low`: el intervalo de confianza de las cifras es amplio y no se publica.
- Solo se ha validado la ruta de Strata. Cualquier port a otro runtime debe acompanarse de una nueva comprobacion de censura antes de confiar en el.
- Riesgo de alucinacion en los temas desbloqueados: al retirar el rechazo, el modelo puede generar contenido factualmente erroneo con tono seguro.
- Licencia Qwen Community License 1.0: hay que revisar el texto completo antes de uso comercial; se exige conservar el texto de la licencia y el aviso de copyright en cualquier copia.
- Riesgo legal y de plataforma: generar contenido sobre temas censurados en China puede infringir normativa local y politicas de proveedores; la responsabilidad recae en quien despliega.
- El artefacto no incluye pesos: los metadatos de HuggingFace (120.320) no permiten deducir el tamano del modelo base, asi que cualquier planificacion de hardware basada en ese numero es invalida.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/zjj1993/Qwen3.8-Flash-Next-uncensored-china
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Strata (soporte de control vectors en modo proyeccion): https://github.com/Niko1221/strata
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al autor ni al metodo en las fuentes consultadas.
