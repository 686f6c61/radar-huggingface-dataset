# VishalMysore/webLTM

## Resumen

webLTM es un transformer recurrente por profundidad (recurrent-depth / looped transformer) de 152.909 parametros, entrenado desde cero por VishalMysore para resolver sumas de dos numeros de hasta 5 digitos cada uno. En lugar de generar un razonamiento token a token, el modelo repite un unico bloque transformer (`core`) sobre su propio estado latente `r` veces y despues lee todos los digitos del resultado de forma simultanea y no autoregresiva. No existe canal de texto de chain-of-thought: nada de lo que ocurre dentro del bucle se decodifica como token.

La relevancia del modelo es doble. Por un lado, es una implementacion abierta y reproducible del mecanismo que la model card asocia a la "recurrencia opaca" de sistemas frontera, y se apoya directamente en el trabajo de Geiping et al. "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach" (arXiv:2502.05171), del que adopta el truco de muestrear `r` de forma aleatoria durante el entrenamiento. Por otro, su tamano (615 KB en float32) permite leer y auditar cada linea del bucle, lo que lo convierte en una herramienta didactica y de experimentacion sobre computo de test-time mas que en un modelo de produccion.

El parametro `r` (profundidad de pensamiento) se suministra en inferencia y no esta fijado por el entrenamiento, de modo que un unico checkpoint responde con cualquier profundidad dentro del rango entrenado. Con `d_model=64` y 4 cabezas de atencion, el modelo alcanza su mejor exactitud en el rango `r` de 2 a 8 y degrada claramente por encima de `r=8`, su maximo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia por profundidad (looped transformer): prelude + core reinyectado + coda |
| Parametros totales | 152.909 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | en (ingles); en la practica la tarea es aritmetica, no linguistica |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), 615 KB |

Otros datos: `d_model=64`, 4 cabezas de atencion, biblioteca `pytorch`, sin `trust_remote_code` (definicion del modelo en `modeling_webltm.py`). Fecha de creacion en HuggingFace: 2026-09-17. Descargas y likes: 0.

## Arquitectura y entrenamiento

El modelo sigue un esquema de tres etapas: `tokens → embed → prelude (1x) → core (x r, en bucle) → coda (1x) → head → digits`. `prelude`, `core` y `coda` son bloques transformer pre-LN con atencion multi-cabeza y MLP con activacion GELU. El bloque `core` se aplica `r` veces con la salida del `prelude` reinyectada en cada iteracion (`h = core(h + e0)`); esta reinyeccion evita que el estado latente derive a medida que crece `r`.

El entrenamiento se realizo desde cero sobre la tarea de suma de 5 digitos mas 5 digitos, con todos los digitos de salida predichos simultaneamente (no autoregresivo), sin scratchpad y sin bucle de decodificacion por token. La innovacion clave es que `r` se muestrea uniformemente en `[1, 8]` en cada paso de entrenamiento, de forma que los pesos no quedan especializados en una profundidad fija. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Aritmetica de suma: resuelve sumas de dos numeros de hasta 5 digitos cada uno (por ejemplo, 4821 + 367 = 5188), con lectura exacta de todos los digitos de salida de una sola pasada.
- Computo de test-time ajustable: el parametro `r` se fija en inferencia, por lo que un unico checkpoint responde a distintas profundidades de "pensamiento" sin reentrenar.
- Razonamiento latente sin chain-of-thought: el calculo ocurre integramente en el espacio latente, sin emitir tokens intermedios.
- Decodificacion no autoregresiva: todos los digitos de la respuesta se producen simultaneamente, lo que elimina la acumulacion de errores propia de la generacion secuencial.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, multi-step reasoning con herramientas ni planificacion.
- No dispone de capacidad multilingue real: la etiqueta de idioma es `en`, pero no hay generacion de lenguaje natural.
- No dispone de vision, audio, ni modo de razonamiento explicito basado en texto.

## Casos de uso

- Investigacion sobre razonamiento latente: sirve como banco de pruebas minimo para estudiar como la precision depende de la profundidad de recurrencia `r`, ya que un solo fichero de pesos permite barrer `r=1` a `r=24` sin reentrenar.
- Estudio de computo de test-time: permite medir la curva exactitud frente a profundidad con coste computacional despreciable (615 KB), util para validar hipotesis antes de escalarlas a modelos mayores.
- Reproduccion del truco de recurrencia aleatoria de Geiping et al.: el muestreo uniforme de `r` en `[1, 8]` durante el entrenamiento puede replicarse y compararse con variantes de profundidad fija.
- Demostracion educativa: el repositorio incluye `modeling_webltm.py` como definicion completa y ejecutable en PyTorch puro, apta para explicar en clase que es una recurrencia latente y como se audita un bucle.
- Demo interactiva en navegador: la model card menciona un slider de profundidad de pensamiento en el repositorio de GitHub, lo que permite visualizar en vivo el efecto de `r` sobre la exactitud.
- Ablaciones de arquitectura a escala minima: con `d_model=64` y 4 cabezas, es viable entrenar variantes (sin reinyeccion, con contexto distinto, con mas digitos) en hardware de consumo y comparar contra el checkpoint publicado.
- Prueba de integracion de safetensors y carga sin `trust_remote_code`: util como caso de test para pipelines que exigen pesos sin pickle y definiciones de modelo autocontenidas.

## Benchmarks y rendimiento

Exactitud de coincidencia exacta (exact-match) sobre problemas reservados, 300 por celda, segun la model card:

| Digitos | r=1 | r=2 | r=4 | r=8 (max. entrenado) | r=16 | r=24 |
|---|---|---|---|---|---|---|
| 1 | 100% | 100% | 100% | 100% | 97% | 74% |
| 2 | 85% | 92% | 93% | 92% | 79% | 62% |
| 3 | 75% | 81% | 84% | 82% | 67% | 51% |
| 4 | 63% | 67% | 69% | 70% | 55% | 29% |
| 5 | 56% | 59% | 62% | 61% | 45% | 26% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia en esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (el fichero de pesos ocupa 615 KB); cabe en cualquier GPU, incluida una integrada, y en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060) o incluso CPU es suficiente; A100 o H100 no aportan ventaja relevante a esta escala.
- Cabe en GPU consumer: si, en todas. Tambien cabe en movil o en el navegador.
- Opciones de despliegue: PyTorch con `modeling_webltm.py`; no se documentan adaptadores para vLLM, llama.cpp, Ollama o TGI. No hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano (152.909 parametros), la latencia esperada es de orden de microsegundos a milisegundos por problema en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada: no hay otros checkpoints de la misma tarea (suma de 5+5 digitos con recurrencia latente) ni resultados cruzados con alternativas. Como referencia conceptual, el unico trabajo relacionado citado es Geiping et al. (arXiv:2502.05171), que explora la misma familia de recurrencia por profundidad a escalas mayores, pero sin numeros comparables en esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webLTM | 152.909 | no disponible | Suma 5+5 digitos, lectura no autoregresiva | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo resuelve sumas de hasta 5 digitos por operando; no es un modelo de lenguaje y no genera texto.
- Colapso fuera del rango entrenado: la exactitud cae bruscamente con `r=16` (45% en 5 digitos) y `r=24` (26%). La reinyeccion estabiliza la recurrencia dentro del rango entrenado, pero la lectura de la `coda` no es valida para estados latentes no vistos.
- Precisión limitada en problemas dificiles: incluso en su mejor configuracion, la exactitud con 5 digitos se queda en torno al 61-62%, insuficiente para uso fiable sin verificacion.
- Sin cadena de razonamiento auditable: al no haber canal de texto intermedio, no es posible inspeccionar el proceso paso a paso; la model card lo presenta deliberadamente como el extremo opuesto a la "recurrencia opaca" de sistemas frontera.
- Sesgos: no se documentan sesgos conocidos, aunque tampoco se documenta la composicion del dataset de entrenamiento, por lo que no puede descartarse un sesgo de distribucion en los operandos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de respuestas aritmeticas incorrectas presentadas con alta confianza (logits maximos), especialmente fuera del rango de `r` entrenado.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion; se debe conservar el aviso de copyright y la licencia.
- Caveats de produccion: no hay pipeline tag, no hay pesos cuantizados ni GGUF, y el repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Soporte de la libreria limitado a PyTorch puro; no se documenta integracion con frameworks de servicio (vLLM, TGI).

## Enlaces

- HuggingFace: https://huggingface.co/VishalMysore/webLTM
- Paper de referencia citado en la model card: https://arxiv.org/abs/2502.05171 (Geiping et al., "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach")
- Repositorio GitHub `webLTM` (train.py, scripts de evaluacion y demo en navegador): mencionado en la model card, URL no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de ayuda de YouTube TV y consultas sin relacion con el modelo.
