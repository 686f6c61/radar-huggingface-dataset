# TheOneWhoWill/Coding-Monkey-Gemma

## Resumen

Coding-Monkey-Gemma es un adaptador LoRA (fine-tuning con QLoRA) sobre el modelo base `google/gemma-4-12B-it`, desarrollado por el usuario independiente TheOneWhoWill. Su objetivo es corregir una deficiencia concreta del modelo base: la incapacidad de Gemma 4 12B para emitir llamadas a herramientas (tool calling) de forma fiable en tareas de codificación agéntica. Mientras que la variante de 26B de Gemma 4 destaca en programación, la versión de 12B falla en el uso correcto de herramientas del entorno agéntico, lo que la hace inútil para flujos de trabajo de codificación asistida. Este fine-tuning entrena al modelo con 4.345 ejemplos de alta calidad de tool calling, logrando un aumento de la precisión exacta de llamadas a herramientas del 31,3% al 83,6% y una mejora del 13% en la frecuencia de emisión de llamadas.

El modelo se distribuye como un adaptador PEFT (formato safetensors) y también como cuantizaciones GGUF (fp16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) en un repositorio separado. Está pensado para desarrolladores que quieren ejecutar un asistente de codificación local con capacidades de agente sin necesidad de una GPU de gama alta, ya que el adaptador es ligero y las cuantizaciones permiten ejecutar el modelo en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 12B) con adaptador LoRA |
| Parametros totales | 12B (modelo base) + adaptador LoRA (parametros del adaptador no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | fp16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (formato GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con QLoRA sobre `google/gemma-4-12B-it`, un transformer decoder-only de 12.000 millones de parametros desarrollado por Google DeepMind. El adaptador LoRA utiliza r=16 y alpha=32, con una tasa de aprendizaje de 2e-4 con scheduler coseno y un batch efectivo de 32. El entrenamiento se realizo durante 3 epocas sobre un dataset de 4.345 ejemplos, de los cuales 4.259 se usaron para entrenamiento y 86 para validacion (split 98/2). La perdida de entrenamiento descendio de 1,585 a 0,264, y la perdida de validacion fue de 0,225, lo que indica un ajuste sin sobreentrenamiento significativo.

El dataset combina dos fuentes principales: `glaiveai/glaive-function-calling-v2` (3.347 ejemplos multi-turno en formato OpenAI) y `zai-org/AgentInstruct` (998 ejemplos de tareas agénticas reales como alfworld, webshop, os y mind2web). Todos los ejemplos fueron formateados con la plantilla de chat de Gemma 4. La eleccion de un dataset concentrado y de alta calidad fue deliberada para evitar el sobreajuste observado en intentos previos con datasets mas grandes. El entrenamiento completo tardo 2 horas y 44 minutos en una GPU NVIDIA 5070 Ti de 16GB, con un total de 30 horas de prototipado acumulado.

## Capacidades

- Llamada a herramientas (tool calling) fiable: el modelo es capaz de emitir llamadas a funciones con sintaxis ChatML correcta y colocacion adecuada de parametros, alcanzando un 83,6% de precision exacta frente al 31,3% del modelo base.
- Razonamiento agéntico multi-paso: entrenado con ejemplos de AgentInstruct que incluyen acciones reales de bash y terminal, el modelo puede planificar y ejecutar secuencias de acciones en entornos simulados (alfworld, webshop, mind2web).
- Generacion de codigo: hereda las capacidades de codificacion del modelo base Gemma 4 12B, aunque el autor senala que el modelo base fallaba en tareas basicas de codificacion por no usar correctamente las herramientas; este fine-tuning corrige ese problema.
- Comprension de instrucciones en ingles: el modelo esta entrenado exclusivamente en ingles, sin soporte multilingue documentado.
- Adaptabilidad a entornos de agente: gracias al entrenamiento con datos de agentes, el modelo puede integrarse en harness de agentes (por ejemplo, entornos de codificacion asistida) y utilizar las herramientas disponibles de forma mas consistente.

## Casos de uso

- Asistente de codificacion local en IDE: un desarrollador puede integrar Coding-Monkey-Gemma en una extension de VS Code o Neovim para recibir sugerencias de codigo y ejecutar comandos de terminal a traves de tool calling. La alta precision en la emision de llamadas a herramientas garantiza que el asistente ejecute las acciones correctas sin fallos de sintaxis.
- Agente de automatizacion de tareas de terminal: el modelo puede utilizarse en pipelines de CI/CD para interpretar comandos de bash, gestionar dependencias o ejecutar scripts de build. Su entrenamiento con ejemplos de AgentInstruct (os) lo hace adecuado para entornos donde se requiere ejecutar acciones reales del sistema.
- Bot de soporte tecnico con acceso a APIs: al soportar tool calling en formato OpenAI, el modelo puede conectarse a APIs externas (bases de conocimiento, sistemas de ticketing) para resolver consultas de usuarios de forma autonoma, manteniendo conversaciones multi-turno.
- Generacion de codigo con ejecucion de pruebas: el modelo puede generar codigo, llamar a funciones de testing y analizar los resultados para iterar sobre la solucion, gracias a su capacidad de razonamiento agéntico multi-paso.
- Prototipado rapido de agentes web: con datos de mind2web y webshop, el modelo puede navegar por interfaces web simuladas, rellenar formularios y extraer informacion, lo que es util para automatizar tareas de scraping o comprobacion de sitios web.
- Despliegue en entornos con restricciones de VRAM: gracias a las cuantizaciones GGUF (especialmente Q4_K_M), el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12GB) o RTX 4070 (8GB), permitiendo a desarrolladores con hardware modesto disponer de un asistente de codificacion con tool calling sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card del autor incluye metricas especificas de tool calling evaluadas sobre un conjunto de 67 prompts de validacion (no vistos durante el entrenamiento). La tabla siguiente compara el modelo base `-it` con el fine-tuning:

| Metrica | Base `-it` | Fine-tuned | Diferencia |
| --- | ---: | ---: | ---: |
| Format Validity (validez de formato) | 0,851 | 0,985 | +0,134 |
| Relaxed Accuracy (precision relajada) | 0,328 | 0,836 | +0,508 |
| Exact Accuracy (precision exacta) | 0,313 | 0,836 | +0,522 |
| Emitted Calls Fraction (fraccion de llamadas emitidas) | 0,851 | 0,985 | +0,134 |

Estas metricas indican que el fine-tuning mejora drasticamente la fiabilidad de las llamadas a herramientas, pasando de un rendimiento casi aleatorio a un nivel utilizable en produccion. No se proporcionan datos sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 12B en fp16 requiere aproximadamente 24GB de VRAM. Con cuantizacion Q4_K_M (formato GGUF), la huella se reduce a unos 7-8GB, lo que permite ejecutarlo en GPUs de consumo con 8GB o mas.
- GPU recomendadas: para fp16 se recomienda una NVIDIA RTX 4090 (24GB) o A100 (40GB). Para cuantizaciones Q4_K_M o Q5_K_M, una RTX 3060 (12GB) o RTX 4070 (8GB) es suficiente. El autor entrenó el modelo en una RTX 5070 Ti de 16GB, por lo que la inferencia con Q6_K o Q8_0 cabe en esa configuracion.
- Opciones de despliegue: al estar disponible en formato GGUF, se puede usar con llama.cpp, Ollama o LM Studio. El adaptador PEFT (safetensors) se puede cargar con la libreria `transformers` de HuggingFace y servir con vLLM o TGI, siempre que se combine con el modelo base.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 12B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una RTX 4090, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Coding-Monkey-Gemma (este) | 12B | No disponible | 83,6% precision exacta | Apache 2.0 | HF (adaptador + GGUF) |
| google/gemma-4-12B-it (base) | 12B | No disponible | 31,3% precision exacta | Apache 2.0 | HF |
| Qwen2.5-Coder-7B | 7B | 32k | Sin datos publicados | Apache 2.0 | HF |
| Llama-3.1-8B-Instruct | 8B | 128k | Sin datos publicados | Llama 3.1 Community License | HF |

La comparativa se limita a modelos de tamano similar con capacidades de codificacion o tool calling. No se dispone de datos de benchmarks estandar para una comparacion cuantitativa rigurosa. Coding-Monkey-Gemma destaca por su enfoque especifico en tool calling, superando claramente a su modelo base en esa tarea, aunque su rendimiento general en otras tareas no ha sido evaluado.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning de Gemma 4 12B, hereda los sesgos potenciales del modelo base (sesgos de genero, raciales o culturales presentes en los datos de preentrenamiento). No se han realizado evaluaciones de sesgo especificas para este adaptador.
- Riesgo de alucinacion en llamadas a herramientas: aunque la precision exacta es del 83,6%, el 16,4% restante puede producir llamadas incorrectas, lo que podria ejecutar acciones no deseadas en entornos de produccion. Se recomienda validacion humana o sandboxing para tareas criticas.
- Limitaciones de idioma: el modelo solo soporta ingles. No se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otros idiomas no es fiable.
- Contexto limitado: la longitud de contexto no esta especificada en la ficha; se hereda del modelo base, pero no se ha verificado su funcionamiento con ventanas largas en este adaptador.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios terminos (tambien Apache 2.0), por lo que no hay restricciones adicionales conocidas.
- Riesgo de sobreajuste: el autor menciona que el entrenamiento se detuvo deliberadamente para evitar sobreajuste, pero el dataset es pequeno (4.345 ejemplos) y podria no generalizar a todos los escenarios de tool calling. Se recomienda probar en dominios especificos antes de usar en produccion.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/TheOneWhoWill/Coding-Monkey-Gemma
- Repositorio HuggingFace con cuantizaciones GGUF: https://huggingface.co/TheOneWhoWill/Coding-Monkey-Gemma-GGUF
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-12B-it
- Documentacion oficial de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/get_started
- Repositorio GitHub de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Blog de Google Developers sobre la familia Gemma: https://developers.googleblog.com/en/gemma-family-expands-with-models-tailored-for-developers-and-researchers/
