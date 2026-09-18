# VADRK155/Cortex-4-Beta-Story

## Resumen

Cortex-4-Beta-Story es un modelo de generacion de texto en ingles desarrollado por el usuario VADRK155, publicado en HuggingFace bajo licencia MIT. Se trata de un transformer decoder-only de 104,6 millones de parametros implementado desde cero en PyTorch, sin usar la libreria `transformers` ni pesos preentrenados de terceros. Su proposito declarado es la generacion de historias cortas y narrativa sencilla, con un ejemplo de uso del tipo "Once upon a time" como disparador.

El modelo es relevante unicamente como ejercicio tecnico de entrenamiento from scratch y como referencia para quien quiera estudiar una implementacion propia y minima de un GPT. No compite en capacidad con modelos pequenos de proposito general como GPT-2 small o SmolLM, ya que su entrenamiento esta orientado a un dominio muy estrecho (narrativa) y no se ha publicado informacion sobre el corpus, el numero de tokens de entrenamiento ni el proceso de alineamiento.

El repositorio tiene 0,4 GB de tamano, 0 descargas y 1 like en el momento de la consulta, lo que indica una difusion practicamente nula. La model card es muy breve y no documenta ventana de contexto, tokenizador, composicion del dataset ni resultados de evaluacion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch, sin `transformers`) |
| Parametros totales | 104,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en fp16; sin GGUF ni cuantizaciones de 4/8 bits) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | fp16 (checkpoint de PyTorch; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only escrito a mano en PyTorch, con atencion causal y sin dependencia de `transformers`. El autor indica que el entrenamiento se realizo "from scratch", sin utilizar pesos preentrenados, lo que implica que el modelo parte de inicializacion aleatoria y aprende todo el conocimiento linguistico desde el corpus que haya utilizado. No se especifica el tokenizador, el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni si se emplearon embeddings atados o sesgos en las proyecciones.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia usada durante el preentrenamiento, ni si hubo fases de ajuste fino con RLHF, DPO o instrucciones. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal, RoPE escalado o atencion con ventana deslizante. El unico dato de entrenamiento confirmado es que no se reutilizaron pesos de otros modelos.

## Capacidades

- Generacion de texto narrativo en ingles: cuentos cortos, aperturas de historia y continuaciones a partir de un prompt simple.
- Generacion autoregresiva condicionada por prompt: el ejemplo de la model card muestra continuacion de "Once upon a time".
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso ni planificacion.
- No hay evidencia de modo "thinking", vision, audio ni multimodalidad.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma de la model card.
- No se documentan capacidades de generacion de codigo ni de razonamiento matematico.

## Casos de uso

- Generacion de cuentos cortos para prototipos: el modelo puede producir aperturas y continuaciones narrativas en ingles a partir de un prompt de una linea, util para demostraciones internas o pruebas de concepto de interfaz conversacional.
- Estudio didactico de arquitecturas GPT: al estar implementado sin `transformers`, sirve como material de lectura para entender como se construye y entrena un decoder-only desde cero en PyTorch.
- Base para experimentos de ajuste fino sobre dominio narrativo: con 104,6 M de parametros se puede reentrenar o afinar en una unica GPU de gama consumer sobre un corpus propio de relatos.
- Generacion de texto de relleno en prototipos de UI: sirve para poblar pantallas de ejemplo con texto narrativo verosimil en ingles sin depender de APIs externas.
- Benchmark interno de pipelines de inferencia: por su tamano reducido es util para medir latencias y validar cadenas de despliegue en CPU o GPU de baja capacidad.
- Educacion e investigacion sobre sobreajuste y coherencia: su tendencia documentada a perder coherencia lo convierte en un caso de estudio sobre los limites de 100 M de parametros.
- Experimentos de narrativa asistida en entornos sin conexion: al pesar menos de un gigabyte, puede ejecutarse localmente en portatiles sin acceso a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, HellaSwag, perplexity ni ninguna otra metrica de evaluacion, y tampoco se han encontrado resultados en la busqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,21 GB solo de pesos (104,6 M de parametros x 2 bytes), mas activaciones y cache KV; en la practica cabe holgadamente en 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, T4 o superiores; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en GPUs integradas con memoria compartida suficiente.
- Inferencia en CPU: viable, dado el reducido numero de parametros; no se publican datos de latencia.
- Opciones de despliegue: el autor proporciona un script propio (`chat.py`) mas un `requirements.txt`. No se documenta soporte oficial en vLLM, TGI, Ollama o llama.cpp, y al tratarse de una implementacion personalizada de la arquitectura, su integracion en estos frameworks requeriria un conversor o un adaptador de arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica habitual, no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de formatos | Datos de entrenamiento publicos |
|---|---|---|---|---|---|
| Cortex-4-Beta-Story | 104,6 M | no disponible | MIT | Solo checkpoint fp16 y codigo propio | No |
| GPT-2 small | 124 M | 1024 tokens | Licencia MIT modificada | Safetensors, GGUF en la comunidad | Parcialmente documentados |
| SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | Safetensors, GGUF, integracion en `transformers` | Si (SmolLM-Corpus) |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache-2.0 | Safetensors, GGUF, vLLM, TGI | Si |

La diferencia principal no es el numero de parametros, sino la documentacion, la integracion con el ecosistema y la disponibilidad de evaluaciones: los tres modelos de referencia publican contexto, tokenizador, corpus y resultados de benchmarks, mientras que Cortex-4-Beta-Story no ofrece ninguno de esos datos.

## Limitaciones y advertencias

- El propio autor advierte de que, al ser un modelo pequeno, puede perder coherencia, mezclar hechos o cortar una idea a mitad; es un comportamiento esperado con este numero de parametros.
- Riesgo elevado de alucinacion y de invencion de detalles factuales, especialmente fuera del registro narrativo.
- Idiomas: unicamente ingles segun la model card. No hay soporte documentado de castellano.
- Ventana de contexto: no documentada, por lo que no se puede planificar su uso en conversaciones multi-turno largas ni con documentos extensos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No hay restricciones adicionales declaradas.
- Procedencia de los datos de entrenamiento no documentada: no se puede evaluar el sesgo, la presencia de contenido con derechos de autor ni la calidad del corpus.
- Sin evaluaciones publicadas: imposible comparar su rendimiento de forma objetiva con alternativas.
- Compatibilidad: al ser una arquitectura personalizada, no es cargable directamente con `AutoModelForCausalLM` de `transformers`; requiere el codigo del repositorio o un portado manual.
- Disponibilidad: 0 descargas y 1 like en el momento de la consulta; no hay comunidad, issues ni mantenimiento demostrable.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio figuran como septiembre de 2026, lo que resulta inconsistente y conviene verificar antes de citar el modelo.
- No se publican safetensors: cargar checkpoints en formatos binarios no verificados de terceros conlleva un riesgo de seguridad en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VADRK155/Cortex-4-Beta-Story
- Repositorio clonable indicado en la model card: https://huggingface.co/VADRK155/Cortex-4-Beta-Story (mismo destino, instrucciones de `git clone`, `requirements.txt` y `chat.py`)
- Paper, blog tecnico, repositorio de codigo independiente o demo: no disponibles
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; las entradas recuperadas correspondian a paginas corporativas de Microsoft sin relacion con Cortex-4-Beta-Story.
