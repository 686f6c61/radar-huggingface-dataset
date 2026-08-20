# xv0y5ncu/Gemma-4-E4B-it-GLQ-6bpw

## Resumen

Gemma-4-E4B-it-GLQ-6bpw es una cuantizacion de alta precision del modelo instructivo Gemma 4 E4B de Google, realizada por el usuario xv0y5ncu. El modelo base, google/gemma-4-E4B-it, es un modelo denso de 4.4 mil millones de parametros (3.79 mil millones reales en safetensors) con soporte multimodal y modo de pensamiento, disenado por Google DeepMind para ejecutarse en hardware de consumo. Esta variante cuantizada utiliza la tecnica Golay-Leech Quantization (GLQ) con un promedio de 6.0 bits por peso (bpw), lo que reduce el tamano del archivo a 7.06 GB, 2.11 veces mas pequeno que el original en bf16.

La relevancia de este modelo radica en que permite ejecutar un Gemma 4 de ultima generacion en GPUs de consumo con una perdida minima de calidad. Segun los datos del autor, en la evaluacion GSM8K con 50 ejemplos y modo de pensamiento, alcanza un 92% de precision exacta, superando el 86% del modelo bf16 original. Ademas, mantiene la licencia Apache 2.0, lo que facilita su uso comercial y en produccion. Es una opcion atractiva para desarrolladores que necesitan capacidades de razonamiento avanzado y generacion de codigo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) |
| Parametros totales | 3.788.507.722 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256.000 tokens (segun modelo base) |
| Tipos de cuantizacion | GLQ uniforme, 6.0 bpw |
| Idiomas soportados | Ingles (segun la model card del autor) |
| Licencia | Apache 2.0 (licencia Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B es un transformer denso con atencion de multiples cabezas, entrenado por Google DeepMind. La variante cuantizada no modifica la arquitectura subyacente, solo los pesos. La cuantizacion GLQ se basa en una codificacion de celosia E8 con un libro de codigos de 65.536 entradas en bloques de 8 dimensiones, combinada con una Transformada de Hadamard Aleatorizada (RHT) para rotar los pesos y una cuantizacion con descomposicion LDL (LDLQ) durante el proceso de codificacion. El metodo incluye cuantizacion residual en N etapas para capas de 3 bpw o superiores y una asignacion de precision mixta basada en un proxy de sensibilidad derivado de la traza de la Hessiana.

El modelo base fue entrenado con un corpus masivo de datos en mas de 140 idiomas, aunque esta variante cuantizada solo declara soporte para ingles. No se ha aplicado entrenamiento adicional despues de la cuantizacion; el proceso es puramente de compresion de pesos. El metodo GLQ esta disponible como herramienta open source en GitHub, y el kernel CUDA se compila en el primer uso (aproximadamente 30 segundos).

## Capacidades

- Generacion de texto y razonamiento complejo con modo de pensamiento (thinking mode) activable mediante la plantilla de chat.
- Razonamiento matematico y resolucion de problemas de varios pasos, con un rendimiento de 92% en GSM8K en la variante cuantizada.
- Capacidades multimodales heredadas del modelo base (entrada de imagenes y texto).
- Soporte para tool calling y function calling, segun las capacidades del modelo base Gemma 4.
- Capacidades multilingues del modelo base, aunque la cuantizacion esta etiquetada para ingles.
- Generacion de codigo y asistencia en programacion, con integracion en pipelines de desarrollo.
- Modo de pensamiento (thinking mode) que requiere una generacion de tokens mas larga para converger a la respuesta final.

## Casos de uso

- **Asistente de codigo en produccion**: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar codigo, explicar fragmentos y revisar implementaciones. Su tamano compacto y la cuantizacion de 6 bpw permiten ejecutarlo en GPUs de consumo con baja latencia, manteniendo una calidad cercana al original.
- **Razonamiento matematico y cientifico**: gracias a su modo de pensamiento y al alto rendimiento en GSM8K, es util para resolver problemas matematicos complejos, demostraciones y calculo cientifico en aplicaciones de tutoria o investigacion.
- **Chatbots y atencion al cliente**: la ventana de contexto de hasta 256K tokens permite gestionar conversaciones largas y de multiples turnos, manteniendo el historico completo. La cuantizacion reduce los requisitos de VRAM, lo que abarata el despliegue en produccion.
- **Analisis de documentos extensos**: con una ventana de contexto amplia, puede resumir, extraer informacion y responder preguntas sobre documentos de gran tamano, como contratos, informes tecnicos o articulos de investigacion.
- **Agentes autonomos**: el modelo soporta tool calling y razonamiento multi-paso, por lo que puede integrarse en sistemas de agentes que ejecutan acciones, consultan APIs y toman decisiones de forma autonoma.
- **Despliegue en edge y dispositivos locales**: con 7.06 GB de archivo y requisitos de VRAM de aproximadamente 8 GB, es viable ejecutar el modelo en un portatil con una GPU moderna (RTX 3060 o superior) o en servidores de gama media, sin depender de la nube.

## Benchmarks y rendimiento

El autor ha publicado un resultado de benchmark en la model card:

| Prueba | Resultado (GLQ 6bpw) | Linea base (bf16) |
|---|---|---|
| GSM8K (50 ejemplos, chat + thinking, strict-match) | 92% | 86% |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor indica que, con un presupuesto de tokens de generacion suficiente, todas las variantes cuantizadas convergen a un rendimiento dentro del error estandar de la calidad bf16 en GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB (según el sitio gemma4.dev para el modelo base, la cuantizacion 6bpw reduce el uso aun mas).
- GPU recomendadas: RTX 3060/3070/3080/3090, RTX 4060/4070/4080/4090, A100, H100.
- Cabe en GPUs de consumo modernas con 8 GB o mas de VRAM.
- Opciones de despliegue: vLLM (probado con vLLM 0.27.1), llama.cpp, Ollama, TGI, o directamente con transformers y el kernel CUDA personalizado de GLQ.
- El kernel CUDA se compila en el primer uso (aproximadamente 30 segundos) y requiere CUDA 12.x y torch>=2.0.
- Se recomienda fijar transformers en una version inferior a 5.15.0 para evitar un problema de configuracion conocido en la carga del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento GSM8K | Licencia |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-GLQ-6bpw (este) | 3.79B | hasta 256K | GLQ 6bpw | 92% (50 ejemplos) | Apache 2.0 |
| Gemma-4-E4B-it (bf16) | 4.4B | hasta 256K | Ninguna | 86% (50 ejemplos) | Apache 2.0 |
| Gemma-4-E4B-it-GLQ-4bpw | 3.79B | hasta 256K | GLQ 4bpw | no disponible | Apache 2.0 |

La comparativa con otras cuantizaciones del mismo modelo (por ejemplo, la version 4bpw) esta disponible en el perfil del autor. La principal ventaja de la version 6bpw es un mejor equilibrio entre tamano y calidad, con un archivo de 7.06 GB y un rendimiento superior al modelo original en GSM8K en la evaluacion limitada.

## Limitaciones y advertencias

- El modelo base Gemma 4 soporta mas de 140 idiomas, pero esta variante cuantizada solo declara ingles en su model card.
- El modo de pensamiento requiere un presupuesto de generacion de tokens mayor que el modelo bf16 para converger a la respuesta final. Se recomienda entre 8K y 16K tokens de generacion para la variante 6bpw; con un presupuesto insuficiente, el modelo puede truncar el razonamiento y omitir la respuesta final.
- Hay un problema conocido con transformers 5.15.0: la configuracion del modelo Gemma 4 se movio a un esquema por capas, lo que rompe la carga del modelo. Se recomienda fijar transformers<5.15.
- La evaluacion con lm-evaluation-harness requiere un parche para habilitar el modo de pensamiento, ya que la herramienta no expone el parametro `enable_thinking=True`.
- La cuantizacion puede introducir una ligera degradacion en tareas de muy alta precision numerica, aunque el autor indica que dentro de los limites de error estandar en GSM8K.
- El kernel CUDA JIT-compilado requiere un entorno con CUDA 12.x, lo que limita su uso en sistemas con versiones de CUDA mas antiguas.

## Enlaces

- HuggingFace: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-6bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Guia del modelo Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
