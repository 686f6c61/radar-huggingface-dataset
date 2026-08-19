# ZoomFly/rwkv-vl-1.5v100m-nv_img_v3-260815

## Resumen

RWKV-VL 1.5B-v100M NV Image V3 es un checkpoint de investigación desarrollado por ZoomFly que continúa el entrenamiento del modelo base `rwkv-vl-1.5v100m-finevisionmax` con datos de razonamiento visual que incluyen trazas explícitas de pensamiento (`thinking... response`). No es un modelo preentrenado de forma independiente, sino una etapa adicional de entrenamiento sobre el checkpoint base. Su objetivo es explorar si el razonamiento explícito mejora tareas de razonamiento visual como aritmética sobre gráficos, cálculo numérico y razonamiento de código.

El modelo combina un codificador visual congelado de estilo Qwen, un proyector MLP visual y un modelo de lenguaje RWKV7 con 1.653 millones de parámetros y una ventana de contexto de 8.192 tokens. Soporta dos modos de inferencia con los mismos pesos: modo pensamiento (por defecto) y modo directo, forzado mediante un prefijo vacío. La relevancia de este checkpoint radica en que documenta empíricamente cuándo el razonamiento explícito ayuda y cuándo perjudica, ofreciendo reglas de enrutamiento claras para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual congelado estilo Qwen + proyector MLP visual + modelo de lenguaje RWKV7 |
| Parametros totales | 1.653.177.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual congelado de estilo Qwen (patch size 16, merge size 2) con un proyector MLP que proyecta las características visuales al espacio del modelo de lenguaje RWKV7. El componente de lenguaje es un RWKV7, una arquitectura recurrente que ofrece rendimiento comparable a un transformer pero con tiempo lineal y espacio constante (sin cache KV), lo que la hace eficiente en memoria y adecuada para inferencia en hardware limitado. El presupuesto de imagen aceptado va de 65.536 a 3.145.728 píxeles por muestra.

El entrenamiento de este checkpoint continúa desde `ZoomFly/rwkv-vl-1.5v100m-finevisionmax` con una etapa de datos de razonamiento NV Image V3 que incluye trazas explícitas de pensamiento. El modelo fue validado con `transformers==5.14.1`, `accelerate==1.14.0` y `flash-linear-attention==0.5.0`. No se detalla el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generacion de texto e imagen-a-texto multimodal: responde preguntas sobre imagenes, graficos y diagramas.
- Modo pensamiento (thinking mode): genera trazas de razonamiento explícitas (`thinking... response`) antes de la respuesta final, por defecto.
- Modo directo: responde sin traza de razonamiento, forzado con el prefijo ` thinking\n response\n`.
- Razonamiento visual aritmetico: mejora sustancial en preguntas de graficos que requieren consulta y calculo (ChartQA pasa de 52,0 % a 66,8 %).
- Calculo numerico sobre imagenes: MME sube de 52,5 % a 85,0 % con pensamiento.
- Razonamiento de codigo con entrada visual: MME sube de 40,0 % a 75,0 % con pensamiento.
- Reconocimiento OCR basico: rendimiento similar en ambos modos (75,0 % pensamiento frente a 72,5 % directo).
- Capacidad multilingue: no disponible; la model card solo declara ingles.

## Casos de uso

- Analisis de graficos y tablas con calculo: el modo pensamiento mejora significativamente la precision en preguntas que requieren localizar un valor en un grafico y operar aritmeticamente sobre el. Adecuado para dashboards financieros o informes de datos.
- Calculo numerico a partir de imagenes: util para extraer numeros de fotografias de medidores, etiquetas o pantallas y realizar operaciones. El modo pensamiento eleva la precision de 52,5 % a 85,0 % en MME.
- Razonamiento de codigo con entrada visual: para depurar o explicar fragmentos de codigo capturados en pantalla o en imagenes de documentacion. MME pasa de 40,0 % a 75,0 % con pensamiento.
- Reconocimiento OCR en entornos controlados: para extraer texto de imagenes con formato conocido. El modo directo es suficiente y mas rapido, con una precision de 72,5 % frente a 75,0 % en pensamiento.
- Preguntas de sentido comun con respuesta si/no sobre imagenes: el modo directo es mas eficiente y no pierde precision, por lo que sirve para clasificacion binaria rapida en pipelines de moderacion o filtrado.
- Investigacion sobre razonamiento en modelos multimodales: el checkpoint documenta de forma sistematica cuando el razonamiento explícito ayuda o perjudica, lo que lo convierte en un objeto de estudio para trabajos sobre enrutamiento de modos de inferencia.

## Benchmarks y rendimiento

Los resultados fueron medidos por el autor sobre un subconjunto de evaluacion de 250 ejemplos para ChartQA y 40 ejemplos para MME. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

| Tarea | Modo directo | Modo pensamiento | Diferencia |
|---|---|---|---|
| ChartQA (consulta + aritmetica, 250 ejemplos) | 52,0 % | 66,8 % | +14,8 |
| MME calculo numerico | 52,5 % | 85,0 % | +32,5 |
| MME razonamiento de codigo | 40,0 % | 75,0 % | +35,0 |
| MME conteo | no disponible | +10 puntos | — |
| MME posicion | no disponible | +15 puntos | — |
| MME OCR (40 ejemplos) | 72,5 % | 75,0 % | +2,5 |
| Diagnostico multi-imagen equilibrado | 29,5 % | 10,5 % | −19,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y 1.653 millones de parametros, el checkpoint ocupa aproximadamente 3,1 GB en disco; la VRAM necesaria en inferencia rondara los 4-6 GB segun el tamano de lote y la longitud de secuencia.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 3090 o RTX 4090. En el extremo profesional, una A100 o H100 permite lotes mayores y menor latencia.
- Compatibilidad con GPU de consumo: si, cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente para inferencia en BF16.
- Opciones de despliegue: el repositorio incluye codigo personalizado y requiere `trust_remote_code=True` con `transformers`. Se validaron las versiones `transformers==5.14.1`, `accelerate==1.14.0` y `flash-linear-attention==0.5.0`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un modelo recurrente sin cache KV, la memoria de atencion es constante, lo que favorece la inferencia en secuencias largas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria (VLMs de ~1,5 B de parametros como Qwen2-VL-2B, Phi-3.5-vision o InternVL2-2B) en la informacion proporcionada. La model card no publica resultados comparativos, por lo que no es posible establecer una tabla de comparacion rigurosa.

## Limitaciones y advertencias

- El modelo no decide de forma fiable cuanta razonamiento necesita cada pregunta: el modo pensamiento puede perjudicar tareas de reconocimiento, preguntas si/no estrictas, verificacion de traducciones y preguntas multi-imagen.
- En tareas de reconocimiento (monumentos, obras de arte, celebridades, escenas, carteles), el modo pensamiento provoca identificaciones alucinadas, deriva de la tarea y bucles de repeticion ocasionales.
- En verificacion de traducciones formulada como si/no, el modelo tiende a traducir en lugar de responder si/no cuando esta en modo pensamiento.
- Las trazas largas pueden desviarse de la tarea solicitada, repetirse o no cerrarse correctamente.
- El rendimiento en tareas multi-imagen es pobre: 29,5 % en modo directo y 10,5 % en modo pensamiento sobre el diagnostico equilibrado.
- La licencia no esta disponible, lo que impide verificar si el uso comercial esta permitido.
- Solo soporta ingles como idioma declarado.
- El repositorio contiene codigo personalizado; se recomienda revisar los archivos Python y usar `trust_remote_code=True` unicamente si se confia en el repositorio.
- Es un checkpoint de investigacion, no un modelo listo para produccion sin control externo del modo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZoomFly/rwkv-vl-1.5v100m-nv_img_v3-260815
- Modelo base: https://huggingface.co/ZoomFly/rwkv-vl-1.5v100m-finevisionmax
- Sitio oficial de RWKV: https://www.rwkv.com/
- Repositorio RWKV-LM en GitHub: https://github.com/BlinkDL/RWKV-LM
- Organizacion RWKV en GitHub: https://github.com/rwkv
