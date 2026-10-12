# Tikoies/sair-dyadic-transducer

## Resumen

El modelo Tikoies/sair-dyadic-transducer es una implementacion en NumPy del reto SAIR Modular Arithmetic Challenge, desarrollada por Tigran Nersissian (usuario Tikoies en HuggingFace). No es un modelo de lenguaje: se trata de un transductor de estados finitos entrenado para resolver multiplicacion modular sobre operandos codificados de forma independiente, emitiendo la respuesta como digitos binarios. Su proposito es cumplir la interfaz del reto, que evalua la capacidad de un sistema para resolver aritmetica modular con modulos de hasta 2.048 bits.

El modelo es extremadamente pequeno: 10.360 parametros entrenados en total, de los cuales 10.240 corresponden a once cabezas controladoras categoricas independientes y 120 a los readouts de cuatro celulas ReLU diadicas compartidas y podadas (35 neuronas en total). El controlador de estados finitos aprendido dirige esas celulas locales a traves de un enrutador de registros generico y un arbol diadico balanceado. Toda la arquitectura de enrutamiento, el almacenamiento en registros, el orden de tokens y el cableado del arbol estan fijados; solo los readouts y las cabezas se optimizan.

Su relevancia es acotada y muy especifica: demuestra que una imitacion supervisada exhaustiva de un algoritmo conocido (transiciones finitas aprendidas mediante cross-entropy) puede alcanzar el 100% de acierto en las 1.000 casos puntuados del benchmark publico y en otros 1.000 casos generados de forma independiente, ejecutandose en CPU pura con NumPy sobre un Apple M3. No hay resultados certificados por los organizadores ni verificacion de ejecucion en sandbox Docker, por lo que la elegibilidad del metodo de entrenamiento sigue pendiente de revision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor de estados finitos con controlador categorico entrenado (11 cabezas) sobre 4 celulas ReLU diadicas compartidas y podadas, enrutador de registros generico y arbol diadico balanceado; no es un transformer |
| Parametros totales | 10.360 (10.240 en cabezas controladoras + 120 en readouts de celulas locales; 35 neuronas en total) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa operandos y modulo codificados) |
| Tipos de cuantizacion | No disponible (los pesos se almacenan como arrays de NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta declarada en la model card; el modelo no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | weights.npz (NumPy) junto con model.py y manifest.json |
| Amplitud de modulo soportada | Hasta 2.048 bits (tiers puntuados 1-10); devuelve cero constante para modulos mayores |
| Libreria | numpy |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema implementa un transductor de estados finitos cuyo controlador aprendido gobierna celdas neuronales locales compartidas. Las celdas usan caracteristicas de cubo booleano: para mascaras binarias disjuntas `v` y `M`, el bloque `B(v,M) = {v OR s : s submask de M}` corresponde a la indicadora de cubo `prod_{i en v} x_i * prod_{i en M} (1 - x_i)`, que sobre entradas binarias equivale a `ReLU(1 - sum_{i en v}(1-x_i) - sum_{i en M}x_i)`. Los readouts son clasificadores de valor real entrenados sobre estas caracteristicas. La composicion diadica balanceada de mapas locales de acarreo y prestamo proporciona las operaciones de registro que utiliza el controlador. La model card aclara explicitamente que esto no identifica la suma de logits reales con el XOR booleano.

El entrenamiento es una imitacion supervisada exhaustiva de un algoritmo conocido, no un descubrimiento algoritmico espontaneo. Los readouts de las celdas parten de inicializacion aleatoria y se optimizan con cross-entropy y Adam, seguido de una poda que preserva margenes de clasificacion positivos; las cabezas controladoras se entrenan con descenso de gradiente a lote completo sobre los 256 contextos simbolicos de estado, token y flag. Los 48 inputs binarios locales de las celdas quedan cubiertos. En cada carga del modelo se evaluan las redes entrenadas sobre sus pequenos dominios finitos para producir caches de transicion locales, que son las que usa el bucle de ejecucion: ni el profesor ni una tabla completa de respuestas se emplean en inferencia. Los 64 episodios de profesor registrados son procedencia suplementaria; el optimizador del controlador usa la tabla exhaustiva de contextos. Modificar los pesos entrenados cambia las transiciones compiladas.

## Capacidades

- Multiplicacion modular sobre operandos y modulo codificados de forma independiente, con emision de la respuesta en digitos binarios.
- Soporte de anchos de modulo de hasta 2.048 bits, cubriendo los tiers puntuados 1 a 10 del reto SAIR.
- Ejecucion determinista: la model card indica que las comprobaciones de determinismo, estaticidad y aislamiento de preprocesamiento se superaron.
- Inferencia sin acceso a red: no hay preprocesamiento dependiente del benchmark ni servicio remoto durante la inferencia.
- Reproducibilidad verificada: el archivo `reproduction_check.json` documenta comprobaciones de integridad del archivo y de reentrenamiento bit-exacto de parametros.
- No dispone de generacion de texto, razonamiento general, codigo, matematicas fuera de la aritmetica modular objetivo, vision, audio, tool calling ni capacidades de agente.
- No dispone de capacidades multilingues: la unica etiqueta de idioma es `en` y el modelo no procesa lenguaje natural.

## Casos de uso

- Evaluacion en el reto SAIR Modular Arithmetic Challenge: el modelo se ejecuta con `modchallenge check .` y `modchallenge evaluate . --total 1100 --timeout 300`, produciendo digitos base 2 que el evaluador decodifica. Es su proposito principal y el unico documentado por el autor.
- Verificacion de aritmetica modular de precision arbitraria en entornos sin GPU: al ejecutarse en CPU con NumPy, puede integrarse en scripts de validacion que necesiten comprobar productos modulares de hasta 2.048 bits sin dependencias de aceleracion por hardware.
- Experimentacion academica sobre transductores de estados finitos: sirve como caso de estudio reproducible de como un controlador simbolico entrenado con gradiente puede dirigir celdas neuronales locales y compilarse en caches de transicion.
- Estudio de representaciones booleanas con caracteristicas de cubo: las celdas diadicas con readouts ReLU y poda son un ejemplo concreto para investigar la relacion entre indicadoras de cubo, margenes de clasificacion y composicion diadica.
- Prueba de reproducibilidad bit-exacta: el paquete `sair_dyadic_entry.zip` contiene el codigo fuente, la evidencia de entrenamiento, las auditorias y las instrucciones para reproducir el entrenamiento desde cero, util para validar pipelines de investigacion.
- Referencia para diseno de evaluadores aislados: la estructura del repositorio (pesos, manifiesto, informe de evaluacion con huellas de dataset y tiempos) puede servir de plantilla para empaquetar resultados de evaluacion reproducibles.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los de evaluacion local publicados por el autor, no certificados por los organizadores. Hardware: Apple M3, CPU NumPy, 16 GB de memoria unificada. Cada ejecucion completa contiene 1.100 casos, de los que 100 son casos de diagnostico tier-0 no puntuados.

| Evaluacion | Casos puntuados correctos | Tier mas alto con >=90% | Tiempo de inferencia (incluye tier de diagnostico) |
|---|---:|---:|---:|
| Benchmark publico publicado | 1.000 / 1.000 | 10 | 114,582 s |
| Conjunto nuevo generado de forma independiente | 1.000 / 1.000 | 10 | 104,220 s |

A partir de estos datos, el tiempo por caso se situa en torno a 104 ms (114,582 s / 1.100 casos) en la ejecucion sobre el benchmark publico. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje. Revision del evaluador empleada: `99cac6ef5c2f82e53105ec0ddcbb9b8d37bf6fca`.

## Requisitos de hardware

- VRAM: no aplica. El modelo se ejecuta en CPU con NumPy; no hay version GPU documentada.
- Hardware de referencia: Apple M3 con CPU NumPy y 16 GB de memoria unificada, configuracion en la que se obtuvieron los tiempos reportados.
- GPU recomendadas: no disponible. No se documenta ninguna ejecucion sobre A100, H100, RTX 4090 u otras GPU.
- GPU de consumo: no aplica, dado que la inferencia es de CPU. Cualquier equipo capaz de ejecutar Python y NumPy puede correrlo, sujeto a la memoria necesaria para el procesamiento de operandos de hasta 2.048 bits.
- Opciones de despliegue: paquete oficial `modchallenge` (https://github.com/SAIRcompetition/modular-arithmetic-challenge) mas NumPy, invocando `modchallenge check .` y `modchallenge evaluate . --total 1100 --timeout 300`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 114,582 s para 1.100 casos en el benchmark publico y 104,220 s para 1.100 casos en el conjunto nuevo, es decir, del orden de 104 ms por caso en el hardware de referencia.
- Ejecucion en sandbox Docker: no verificada, segun la propia model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros participantes del reto SAIR Modular Arithmetic Challenge ni modelos comparables de la misma categoria, tamano o tarea, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican condiciones de uso, lo que impide determinar si el uso comercial esta permitido.
- Alcance muy restringido: resuelve exclusivamente multiplicacion modular sobre operandos codificados; no genera texto, no razona de forma general y no procesa lenguaje natural.
- Modulos mayores de 2.048 bits: el modelo devuelve cero constante, por lo que no resuelve todos los casos tier-0. El autor advierte que un resultado de Playground limitado a tier-0 no debe interpretarse como el resultado de los tiers puntuados.
- Elegibilidad pendiente: el metodo de entrenamiento y tabulacion esta sujeto a revision de los organizadores; una precision local perfecta y la superacion de comprobaciones automaticas no establecen elegibilidad.
- Resultados no certificados: las cifras de 1.000/1.000 provienen de funciones evaluadoras oficiales sin modificar, pero son resultados locales, no resultados de leaderboard certificados por los organizadores.
- Verificacion incompleta del entorno: la ejecucion en sandbox Docker no ha sido verificada.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.
- Dependencia de la evaluacion: el comportamiento se define frente a la interfaz del reto; cambiar el formato de entrada o el decodificador de salida invalida los resultados reportados.
- Procedencia del entrenamiento: es imitacion supervisada exhaustiva de un algoritmo conocido, no aprendizaje emergente; la model card lo declara explicitamente para evitar interpretaciones erroneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tikoies/sair-dyadic-transducer
- Paquete oficial del reto: https://github.com/SAIRcompetition/modular-arithmetic-challenge
- Reglas oficiales y flujo de envio: https://github.com/SAIRcompetition/modular-arithmetic-challenge/blob/main/rules/overview.md
- Especificacion oficial de evaluacion: https://github.com/SAIRcompetition/modular-arithmetic-challenge/blob/main/rules/evaluation.md
