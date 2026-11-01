# STANCHJAM/Bonsai-llamafile

## Resumen

Bonsai-llamafile es un repositorio de ejecutables portables en formato llamafile para la familia de modelos Bonsai de PrismML, una serie de modelos cuantizados a 1 bit con el formato propietario `Q1_0_g128`. Cada fichero es un binario autocontenido que empaqueta los pesos GGUF, el motor de inferencia llama.cpp y los parámetros de generación por defecto, de modo que el usuario puede descargar un único archivo, marcarlo como ejecutable y lanzarlo sin dependencias, sin Python y sin gestores de paquetes. El repositorio lo publica el usuario STANCHJAM y actúa como repackaging de los GGUF oficiales de PrismML.

La familia cubre tres tamanos (1.7B, 4B y 8.19B parámetros) construidos sobre las arquitecturas Qwen3-1.7B, Qwen3-4B y Qwen3-8B respectivamente. La cuantización `Q1_0_g128` asigna un único bit por peso con un factor de escala FP16 compartido por cada grupo de 128 pesos, lo que da una media efectiva de 1.125 bits por peso y una reducción de tamano de aproximadamente 14x respecto a FP16. El resultado son binarios de entre 267 MB y 1.2 GB que caben en cualquier equipo y se ejecutan exclusivamente en CPU.

La relevancia actual del proyecto reside en su propuesta de despliegue extremo: inferencia de un modelo de lenguaje de 8B parámetros en CPU sin GPU, sin entorno de ejecución y con una API compatible con OpenAI embebida. Es una pieza orientada a portabilidad, entornos air-gapped, hardware modesto y experimentación rápida con cuantización agresiva, no a producción de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B / Qwen3-4B / Qwen3-8B) |
| Parametros totales | 1.7B, 4.0B y 8.19B (tres variantes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_0_g128 (1 bit por peso, escala FP16 por grupo de 128, 1.125 bits/peso efectivos) |
| Idiomas soportados | no disponible (heredados de los modelos base Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | llamafile ejecutable (GGUF empaquetado con binario llama.cpp) |

Datos adicionales por variante:

| Variante | Parametros | Tamano GGUF | Tamano llamafile |
|---|---|---|---|
| Bonsai-1.7B.llamafile | 1.7B | 237 MB | 267 MB |
| Bonsai-4B.llamafile | 4.0B | 546 MB | 576 MB |
| Bonsai-8B.llamafile | 8.19B | 1.1 GB | 1.2 GB |

## Arquitectura y entrenamiento

Los modelos subyacentes son transformadores densos de la familia Qwen3, reempaquetados por PrismML con una cuantización de 1 bit propia. El formato `Q1_0_g128` almacena cada peso como un bit de signo y comparte un factor de escala FP16 por cada bloque de 128 pesos, lo que reduce el tamano del modelo en torno a 14 veces respecto a FP16. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) corresponden a los modelos originales de PrismML y no se especifican en la información disponible de este repositorio.

La innovación técnica del repositorio es de empaquetado, no de modelado. Los binarios se construyen integrando los commits de soporte de `Q1_0` del fork de llama.cpp de PrismML sobre el submódulo llama.cpp de llamafile, añadiendo definiciones de fallback genéricas para CPU de las funciones de producto escalar `Q1_0`, compilando con `cosmocc` para obtener binarios portables solo-CPU y empaquetando los pesos GGUF y los argumentos por defecto con `zipalign`. Cada ejecutable incorpora parámetros de generación preconfigurados (temperatura 0.5, top-k 20, top-p 0.9) que pueden sobrescribirse por línea de comandos.

## Capacidades

- Generación de texto en modo chat interactivo mediante TUI embebida.
- Servidor HTTP con API compatible con OpenAI (`/v1/chat/completions`) y interfaz web en el puerto 8080.
- Modo CLI para prompts únicos (`--cli -p "..."`).
- Inferencia exclusivamente en CPU, sin GPU ni aceleradores.
- Ejecución portable en múltiples sistemas operativos gracias a la toolchain Cosmopolitan.
- Despliegue sin dependencias: sin Python, sin gestores de paquetes, sin entorno de ejecución externo.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling o multilingüismo: no disponibles en la información proporcionada (dependen del modelo base Qwen3 y de la degradación introducida por la cuantización a 1 bit).

## Casos de uso

- Despliegue en entornos air-gapped: un único fichero ejecutable permite llevar un modelo de lenguaje a máquinas sin conexión, sin privilegios de instalación y sin gestores de paquetes, lo que encaja en auditorías, laboratorios o sistemas industriales aislados.
- Prototipado rápido de aplicaciones LLM: el servidor compatible con OpenAI embebido permite apuntar clientes existentes (SDKs de OpenAI, LangChain, etc.) a `http://localhost:8080` sin infraestructura adicional.
- Inferencia en hardware modesto o embebido: la variante de 1.7B ocupa 267 MB y puede ejecutarse en CPU de un mini-PC, una Raspberry Pi de gama alta o un portátil antiguo, útil para demos y pruebas de concepto.
- Distribución de demos reproducibles: al ser un binario autocontenido, se puede adjuntar a un repositorio o a una release y garantizar que el receptor ejecuta exactamente la misma versión del modelo y del motor.
- Experimentación con cuantización extrema: sirve como banco de pruebas para medir la degradación de calidad de un modelo Qwen3 a 1.125 bits/peso frente a cuantizaciones de 4 u 8 bits.
- Automatización de tareas de texto en scripts y CI: el modo CLI permite invocar el modelo desde un shell script para resúmenes, clasificación o generación de texto en pipelines sin dependencias de Python.
- Educación y docencia: permite mostrar el funcionamiento interno de un LLM y de una API compatible con OpenAI en un aula sin necesidad de GPU ni de instalación compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las fichas de los modelos originales de PrismML y a su whitepaper para obtener métricas de rendimiento.

## Requisitos de hardware

- VRAM: no aplica, la inferencia es exclusivamente en CPU.
- RAM estimada: en torno al tamano del fichero más el overhead del motor; aproximadamente 300 MB para la variante 1.7B, 600 MB para la 4B y 1.2 GB para la 8B, con margen adicional para el contexto y el runtime.
- GPU: no se utiliza GPU; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier equipo consumer: portátiles, mini-PC, Raspberry Pi (según RAM y arquitectura) y contenedores ligeros.
- Opciones de despliegue: el propio llamafile (TUI, servidor OpenAI-compatible o CLI). No se documenta soporte para vLLM, TGI, Ollama u otros motores en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente de la CPU y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Bonsai-llamafile (este) | 1.7B / 4B / 8.19B | no disponible | Q1_0_g128 (1.125 bits/peso) | Apache 2.0 | Llamafile ejecutable, solo CPU |
| Qwen3 original (FP16/BF16) | 1.7B / 4B / 8B | no disponible en esta ficha | FP16/BF16 | Apache 2.0 | Safetensors, requiere GPU o runtime |
| Llamafile estándar (p. ej. TinyLlama o Qwen2) | variable | variable | Q4_K_M y otras | variable según modelo | Llamafile ejecutable, solo CPU |

La comparación relevante es frente a los Qwen3 originales y frente a otros llamafiles con cuantizaciones de 4 bits: Bonsai ofrece el menor tamano por parámetro (1.125 bits/peso) a costa de una degradación de calidad presumiblemente mayor, y mantiene la ventaja de portabilidad de un único binario. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 1.125 bits por peso implica una pérdida de calidad significativa frente al modelo original en FP16; no es adecuada para tareas que exijan precisión alta.
- No se han publicado benchmarks en este repositorio, por lo que la calidad real de las variantes cuantizadas no está documentada de forma verificable.
- Inferencia solo en CPU: el throughput será bajo comparado con despliegues en GPU, especialmente en la variante de 8.19B.
- Longitud de contexto no documentada; se desconoce si la cuantización afecta al contexto efectivo.
- Idiomas soportados no documentados; se heredan presumiblemente de Qwen3, con posible degradación en lenguas distintas del inglés y el chino.
- Riesgo de alucinación y sesgos: no evaluados en esta ficha; se heredan del modelo base y pueden amplificarse por la cuantización.
- El repositorio tiene muy poca tracción (18 descargas, 0 likes) y fue creado en 2026-10-26; no hay evidencia de mantenimiento continuado.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos originales de PrismML y de Qwen3 antes de desplegar en producción.
- Los enlaces de descarga de la model card apuntan a `Zetaphor/Bonsai-llamafile` mientras que el ID del repositorio es `STANCHJAM/Bonsai-llamafile`; conviene comprobar la ruta correcta antes de automatizar descargas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/STANCHJAM/Bonsai-llamafile
- Modelo base 1.7B: https://huggingface.co/prism-ml/Bonsai-1.7B-gguf
- Modelo base 4B: https://huggingface.co/prism-ml/Bonsai-4B-gguf
- Modelo base 8B: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Anuncio de Bonsai 8B en PrismML: https://prismml.com/news/bonsai-8b
- Sitio de PrismML: https://prismml.com/
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Proyecto llamafile: https://github.com/Mozilla-Ocho/llamafile
- Toolchain Cosmopolitan: https://github.com/jart/cosmopolitan
