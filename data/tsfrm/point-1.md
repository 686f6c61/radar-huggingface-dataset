# tsfrm/point-1

## Resumen

El modelo `tsfrm/point-1` es un experimento deliberadamente absurdo publicado por el colectivo "The Society for Ridiculous Models" (`tsfrm`). Consiste en un modelo de lenguaje con exactamente un parámetro entrenable, denominado `w`, que se ajusta para maximizar la verosimilitud de un corpus de texto sin ninguna arquitectura de atención ni tokenización. El objetivo es demostrar que incluso un único parámetro puede capturar una fracción de la estructura estadística de un corpus, en este caso TinyShakespeare, y servir como ejemplo de optimización convexa aplicada a un problema trivial.

La relevancia del modelo es puramente conceptual y educativa: no pretende resolver ninguna tarea práctica, sino ilustrar conceptos fundamentales de modelado de lenguaje, como la diferencia entre una distribución uniforme, un modelo unigram y un modelo con parámetros aprendidos. Su tamaño es de 97 bytes en safetensors, de los cuales solo 4 son el parámetro `w` en float32. No hay tokenizer: los bytes se tratan directamente como tokens, y la longitud de contexto no aplica porque no hay ninguna secuencia que procesar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Funcion lineal de un solo parametro sobre un histograma de bytes |
| Parametros totales | 1 (float32) |
| Parametros activos | 1 (no es MoE) |
| Longitud de contexto | No aplica (no hay atencion ni procesamiento secuencial) |
| Tipos de cuantizacion | No disponible (peso en float32) |
| Idiomas soportados | Ingles (codificado como bytes ASCII imprimibles + salto de linea) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni una red neuronal convencional. El modelo define una distribucion de probabilidad sobre los 96 tokens posibles (bytes ASCII imprimibles + salto de linea) mediante la formula `logits[b] = w * h[b]`, donde `h[b] = (b - 79) / 47` se recorta al intervalo `[-1, 1]`. No hay tokenizador, no hay capas de atencion ni ninguna otra operacion: el forward pass es una sola multiplicacion.

El entrenamiento se realizo sobre el corpus TinyShakespeare (1.115.394 bytes). En lugar de gradiente descendente, se uso el metodo de Newton sobre la funcion de perdida, que es convexa en la unica variable `w`. El optimo global se alcanza en cuatro pasos, con `w = 0.610785` y una perdida de `4.5020` nats/byte. Este resultado se compara con una linea base uniforme (`4.5643`) y con el minimo teorico de un modelo unigram (`3.3128`), que requiere 96 parametros. El modelo captura aproximadamente el 5% de la reduccion de perdida que consigue un unigram.

## Capacidades

- Generacion de bytes segun una distribucion de probabilidad determinada por el histograma del corpus.
- No genera texto coherente: la decodificacion greedy produce una secuencia infinita de tildes (`~`).
- Con temperatura baja (0.01) la salida es una secuencia de caracteres ASCII aleatorios con sesgo hacia bytes altos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No tiene capacidad multilingue: solo reconoce el rango de bytes ASCII imprimibles.
- Permite ejecutar el forward pass desde `transformers` con `trust_remote_code=True`, aunque no se recomienda para ninguna tarea practica.

## Casos de uso

- Ejemplo educativo de optimizacion convexa: demuestra como una sola variable puede ajustarse a un corpus y por que el metodo de Newton converge en pocos pasos.
- Referencia de evaluacion para otros modelos de juguete: sirve como linea base para comparar la perdida de modelos con 0, 1 o 96 parametros sobre un corpus de bytes.
- Prueba de integracion con la infraestructura de Hugging Face: permite verificar que la carga de safetensors y el codigo custom funcionan con pesos minimos.
- Ilustracion de la diferencia entre modelos de lenguaje y distribuciones de frecuencia: muestra como un unigram con 96 parametros supera ampliamente a un modelo de un solo parametro.
- Demostracion de que el tamano del modelo no garantiza calidad: sirve como ejemplo de que la capacidad de un modelo depende de la tarea, no solo del numero de parametros.
- Recurso didactico para explicar que es un tokenizador y por que es necesario en modelos reales: al no tener tokenizer, el modelo no puede procesar texto de forma utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es capaz de realizarlos. La unica metrica publicada es la perdida en nats/byte sobre el corpus de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida (nats/byte) | 4.5020 |
| Linea base uniforme | 4.5643 |
| Minimo de unigram (96 parametros) | 3.3128 |

El modelo consigue una reduccion de perdida de aproximadamente 0.062 nats/byte respecto a la distribucion uniforme, lo que representa un 5% de la mejora que logra un unigram completo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 bytes (el modelo no requiere GPU; el peso cabe en un registro de la CPU).
- GPU recomendada: ninguna. Cualquier procesador con soporte de aritmetica en coma flotante es suficiente.
- Compatibilidad con GPU de consumo: si, en cualquier GPU o CPU.
- Opciones de despliegue: se puede cargar con `transformers` usando `trust_remote_code=True`, aunque no se necesita ningun framework adicional.
- Latencia y throughput: la generacion de 64 bytes tarda menos de 1 milisegundo en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida (nats/byte) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsfrm/point-1` | 1 | No aplica | 4.5020 | MIT | HuggingFace |
| Unigram model (hipotetico) | 96 | No aplica | 3.3128 | MIT | No publicado |
| `tsfrm/vacuum-16t` | 16 billones | No disponible | No disponible | MIT | HuggingFace |

El modelo `point-1` es 16.501.264.351.232 veces mas pequeño que `vacuum-16t`, otro modelo ridiculo del mismo autor. No se dispone de datos de rendimiento de `vacuum-16t` para una comparacion directa. No existe ningun otro modelo de un parametro comparable en el ecosistema.

## Limitaciones y advertencias

- No genera texto coherente: la salida es una secuencia de bytes sin significado semantico.
- No tiene tokenizador: no puede procesar texto de forma estandar, solo bytes individuales.
- No soporta contexto: cada token se procesa de forma independiente, no hay informacion secuencial.
- No hay riesgo de alucinacion en el sentido clasico, pero la salida es completamente aleatoria.
- Licencia MIT permite uso comercial, pero el modelo no tiene utilidad comercial real.
- No es apto para produccion: no puede integrarse en ningun sistema que requiera generacion de lenguaje natural.

## Enlaces

- [Modelo en HuggingFace: tsfrm/point-1](https://huggingface.co/tsfrm/point-1)
- [Perfil de la organizacion tsfrm](https://huggingface.co/tsfrm)
- [Modelo relacionado: tsfrm/vacuum-16t](https://huggingface.co/tsfrm/vacuum-16t)
