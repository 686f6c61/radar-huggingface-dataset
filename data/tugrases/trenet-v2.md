# Tugrases/trenet-v2

## Resumen

trenet v2 es un modelo de lenguaje de 35 millones de parametros desarrollado por Tugrases, entrenado desde cero especificamente para turco. Se trata de un transformer decoder-only de diseno propio, orientado a conversacion cotidiana en turco, y se presenta explicitamente como un experimento de investigacion mas que como una herramienta de produccion. El modelo fue entrenado en un entorno domestico con una unica GPU, y su proposito declarado es explorar hasta donde puede llegar un modelo de este tamano en conversacion diaria en turco.

La relevancia de trenet v2 no reside en su rendimiento absoluto, sino en su caracter de ejercicio de entrenamiento desde cero con recursos minimos y en su publicacion abierta bajo licencia MIT. Con 2048 tokens de contexto y aproximadamente 2 mil millones de tokens de entrenamiento (preentrenamiento mas ajuste fino conversacional), el modelo se posiciona en la categoria de modelos pequenos experimentales para un solo idioma.

El repositorio incluye pesos en safetensors, una version ONNX cuantizada a int8 para CPU y el codigo de inferencia, lo que facilita su ejecucion tanto en CPU como en GPU consumer. El autor advierte de forma explicita que no debe confiarse en la informacion que genera y que no debe usarse para tareas serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, diseno propio para escala pequena |
| Parametros totales | 35.113.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 (ONNX para CPU); pesos completos en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (int8 para CPU) |

## Arquitectura y entrenamiento

trenet v2 es un transformer decoder-only de arquitectura propia, disenado especificamente para operar a escala muy pequena (35 millones de parametros). No se trata de una adaptacion de una familia existente, sino de un diseno del autor orientado a este rango de tamano. El modelo emplea un tokenizer propio para turco.

El entrenamiento se realizo en dos fases: un preentrenamiento seguido de un ajuste fino conversacional, con un total de aproximadamente 2 mil millones de tokens procesados. El autor indica que los detalles del dataset y del proceso de entrenamiento no se comparten. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa o atencion lineal. El entrenamiento se llevo a cabo en un equipo domestico con una sola tarjeta grafica.

## Capacidades

- Conversacion corta y cotidiana en turco: saludos, preguntas simples y consejos basicos.
- Memoria dentro de la conversacion: recuerda datos mencionados en turnos anteriores (nombre, ciudad, preferencias).
- Instrucciones simples: listas cortas, respuestas de una sola frase o de una sola palabra.
- Calculos aritmeticos basicos mostrados paso a paso (el script de chat incorpora una calculadora externa que verifica las operaciones de cuatro reglas).
- Generacion de texto en turco exclusivamente.
- No soporta tool calling ni function calling de forma documentada.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Demostracion educativa de entrenamiento de modelos: sirve para ilustrar el ciclo completo de preentrenamiento y ajuste fino conversacional con recursos minimos, ya que el repositorio incluye pesos, tokenizer y codigo de inferencia.
- Prototipado de interfaces conversacionales en turco: permite validar rapidamente flujos de chat multi-turno en turco antes de migrar a un modelo mayor, gracias a su bajo coste de ejecucion en CPU.
- Pruebas de despliegue en entornos sin GPU: la version ONNX int8 permite ejecutar el modelo en CPU a 400-500 tokens por segundo, adecuado para entornos de desarrollo y pruebas de integracion.
- Ejercicios de evaluacion de modelos pequenos: util como linea base en experimentos que comparen modelos de menos de 100 millones de parametros en turco.
- Experimentos de memoria conversacional: el modelo demuestra retencion de datos dentro de la ventana de 2048 tokens, lo que permite estudiar el comportamiento de la memoria a corto plazo en modelos diminutos.
- Generacion de respuestas breves y listas simples: para tareas de formato muy acotado (una frase, una lista de tres elementos) en turco, donde la latencia y el coste son criticos.
- Aprendizaje de tecnicas de cuantizacion: el par safetensors/ONNX int8 del repositorio sirve como ejemplo practico de cuantizacion con perdida minima (aproximadamente un 1 por ciento segun el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta velocidades de inferencia:

| Entorno | Velocidad de generacion |
|---|---|
| CPU (Intel Core Ultra 7 265KF, 4 nucleos), int8 ONNX | ~400-500 tokens/s |
| GPU (RTX 5070 Ti) | ~550-600 tokens/s |
| GPU con `--compile` | hasta ~900 tokens/s |
| CPU, precision completa (`--slow`) | ~85 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (35 millones de parametros, aproximadamente 140 MB en fp32); la version int8 ONNX ocupa aun menos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor cita una RTX 5070 Ti. No se requiere hardware de datacenter.
- Cabe en cualquier GPU consumer, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: script `chat.py` incluido en el repositorio, con soporte para CPU (ONNX Runtime, int8) y GPU (CUDA graph); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 400-500 tokens/s en CPU int8 y hasta 900 tokens/s en GPU con compilacion, segun el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con otros modelos. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (modelos pequenos multilingues o para un solo idioma):

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenet v2 | 35 M | 2048 | turco | MIT | Hugging Face (safetensors, ONNX) |
| Qwen2.5-0.5B | 494 M | 32 768 | multilingue | Apache 2.0 | Hugging Face, ecosistema amplio |
| SmolLM2-135M | 135 M | 8192 | ingles principalmente | Apache 2.0 | Hugging Face, llama.cpp, ONNX |
| Modelos turcos pequenos de terceros | no disponible | no disponible | turco | no disponible | no disponible |

La comparacion con Qwen2.5-0.5B y SmolLM2-135M es puramente estructural: no hay datos de rendimiento de trenet v2 que permitan contrastar calidad. La ventaja de trenet v2 es su licencia MIT y su especializacion en turco; su desventaja es el tamano reducido y la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo no es una fuente de informacion fiable: inventa respuestas verosimiles pero incorrectas en temas que desconoce.
- No es adecuado para texto largo, traduccion, codigo ni razonamiento real; estas capacidades quedan fuera de su escala.
- Falla con frecuencia en acertijos y preguntas de atencion.
- Puede perder el hilo en conversaciones largas, aunque la ventana es de 2048 tokens.
- Entrenado exclusivamente en turco; no hay soporte documentado de otros idiomas.
- No se han publicado evaluaciones de sesgos ni de seguridad.
- Los detalles del dataset de entrenamiento no se comparten, lo que impide auditar la composicion de los datos.
- La licencia MIT permite uso comercial, modificacion y redistribucion con la unica condicion de conservar el aviso de copyright, pero el autor desaconseja explicitamente su uso en tareas serias.
- No se documenta soporte para tool calling, agentes ni integraciones con frameworks de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tugrases/trenet-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
