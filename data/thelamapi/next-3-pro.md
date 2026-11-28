# thelamapi/Next-3-Pro

## Resumen

Next 3 Pro es un modelo multimodal de tipo image-text-to-text desarrollado por Lamapi, un autor independiente en Hugging Face. Se construye como un fine-tuning mediante LoRA fusionado sobre Qwen/Qwen3.8-27B, del que hereda la arquitectura y las interfaces de inferencia. El checkpoint resultante tiene 27.356.728.560 parámetros (unos 27,36 mil millones) y se distribuye en formato Transformers con pesos safetensors, ocupando 54,7 GB en el repositorio.

El objetivo declarado del modelo es asistir en tareas de ingeniería de software: redactar primeras versiones de funcionalidades, inspeccionar errores en capturas de pantalla, proponer parches, escribir tests y revisar código a medida que cambian los requisitos. Además del texto, procesa imágenes y vídeo, lo que permite analizar diagramas, maquetas, páginas escaneadas y clips. El ajuste se centra en codificación, razonamiento técnico, seguimiento de instrucciones y conversación en inglés y turco.

Su relevancia actual radica en que combina una ventana de contexto heredada muy amplia (Qwen documenta 262.144 tokens nativos y una configuración extendida de hasta 1.000.000) con capacidades multimodales y de tool calling en un tamaño de 27B, manejable en GPUs de gama alta para servidores y en configuraciones cuantizadas para estaciones de trabajo. La licencia no está declarada en la información disponible, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.8-27B; clase de modelo `qwen3_5` |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 en configuración extendida (datos del modelo base; Lamapi no ha evaluado el checkpoint a esas longitudes) |
| Tipos de cuantizacion | No especificados en la model card; existen builds GGUF y un build de compatibilidad TurboQuant en repositorios separados |
| Idiomas soportados | Inglés (en) y turco (tr) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (checkpoint Transformers fusionado); builds GGUF en repositorio aparte |

## Arquitectura y entrenamiento

Next 3 Pro conserva la arquitectura del modelo base Qwen3.8-27B, un transformer multimodal que acepta entradas de texto, imagen y vídeo a través de un procesador multimodal (`AutoProcessor`). El checkpoint se distribuye como un modelo fusionado (merged) listo para cargar con Transformers, sin adaptadores LoRA separados. Lamapi indica que el ajuste se realizó mediante LoRA y posteriormente se exportó fusionado; no se detallan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

Los datasets citados en la model card son openai/gsm8k y google-research-datasets/mbpp, lo que sugiere un enfoque en razonamiento matemático y generación de código Python, aunque no se especifica el volumen ni la mezcla final. El ajuste se orienta a codificación, razonamiento técnico, seguimiento de instrucciones y conversación bilingüe inglés-turco. No se documentan innovaciones técnicas propias más allá de las heredadas del modelo base; las capacidades de modo thinking (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) dependen del stack de servicio que exponga esos controles.

## Capacidades

- Generación de texto y razonamiento técnico: cálculo, comparación de alternativas bajo restricciones y explicación de soluciones con ejemplos concretos.
- Codificación y depuración: redacción de funcionalidades, inspección de errores, propuesta de parches, escritura de tests y revisión de código ante requisitos cambiantes.
- Comprensión de imágenes: análisis de capturas de pantalla, diagramas, páginas escaneadas y disposiciones visuales mediante el procesador multimodal.
- Comprensión de vídeo: resumen de clips, seguimiento de cambios entre fotogramas y respuesta a preguntas sobre eventos visuales (los límites prácticos dependen del runtime).
- Tool calling y flujos de agente: acepta esquemas de herramientas, permite que la aplicación ejecute las llamadas y devuelve los resultados al modelo.
- Control de modo thinking: respuestas directas o modo de razonamiento según los controles del stack de servicio.
- Contexto largo: uso de la configuración de contexto del modelo base para entradas extensas.
- Multilingüismo limitado a inglés y turco, incluidos proyectos donde la conversación y el código usan idiomas distintos.

## Casos de uso

- Desarrollo de prototipos frontend: a partir de un brief, el modelo genera un archivo HTML/CSS/JS completo con funcionalidades concretas (por ejemplo, un tablero de tareas con arrastrar y soltar y persistencia en `localStorage`), y en turnos posteriores incorpora requisitos como búsqueda o deshacer.
- Depuración asistida por captura de pantalla: se le envía una imagen de una interfaz rota junto con el error del navegador; el modelo interpreta el layout y propone correcciones concretas sobre el código.
- Generación de tests y parches en CI/CD: con tool calling puede integrarse en pipelines para inspeccionar fallos de test, proponer parches y escribir casos de prueba adicionales antes de la revisión humana.
- Análisis de documentación técnica escaneada: procesa páginas de manuales o diagramas de arquitectura y responde preguntas sobre ellos, útil para equipos que trabajan con especificaciones en papel o PDF.
- Resumen de clips de demostración o grabaciones de bugs: resume un vídeo y responde preguntas sobre eventos visuales, por ejemplo para documentar un fallo reproducible en vídeo.
- Soporte técnico bilingüe inglés-turco: gestiona conversaciones multi-turno donde el usuario alterna idiomas y el código permanece en inglés, gracias al ajuste específico en ambos idiomas.
- Revisión de código con contexto largo: con la ventana heredada de 262.144 tokens puede analizar repositorios o archivos extensos en una sola pasada, aunque Lamapi no ha validado el checkpoint a esas longitudes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos de 27,36 B parámetros ocupan aproximadamente 54,7 GB, por lo que se necesitan al menos 64 GB de VRAM para cargar el modelo completo con margen para el contexto.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Una RTX 4090 (24 GB) no puede alojar el checkpoint completo en BF16.
- GPU de consumo: viable solo con cuantización. Existen builds GGUF en un repositorio separado; una cuantización de 4 bits reduciría el peso a unos 14-16 GB, lo que permitiría ejecución en RTX 4090 o GPUs con 16-24 GB, aunque no se detallan los niveles de cuantización disponibles.
- Opciones de despliegue: Transformers con `device_map="auto"` según el quickstart; llama.cpp u Ollama mediante los builds GGUF; vLLM o TGI si soportan la arquitectura `qwen3_5` del modelo base (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next 3 Pro (Lamapi) | ≈27,36 B | 262.144 nativos; hasta 1.000.000 extendido | Texto, imagen, vídeo | No disponible | Hugging Face (checkpoint, GGUF, TurboQuant) |
| Qwen3.8-27B (modelo base) | ≈27 B (clase) | 262.144 nativos; hasta 1.000.000 extendido | Texto, imagen, vídeo | No disponible en la información proporcionada | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de otros modelos comparables, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; es un bloqueo potencial para producción.
- Sesgos conocidos: no documentados por el autor; al ser un fine-tuning sobre Qwen3.8-27B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; en tareas de código y razonamiento técnico debe verificarse la salida con tests y revisión humana.
- Cobertura de idiomas limitada a inglés y turco; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto largo no validado: Lamapi indica explícitamente que no ha evaluado el checkpoint a 262.144 ni a 1.000.000 de tokens, por lo que el rendimiento a esas longitudes es incierto.
- Comprensión de vídeo: los límites prácticos dependen del runtime de preprocesamiento y no están especificados.
- Modo thinking: depende de que el stack de servicio exponga los controles correspondientes; no está garantizado en todos los entornos.
- Tamaño del repositorio de 54,7 GB: requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-3-Pro
- Builds GGUF: https://huggingface.co/thelamapi/Next-3-Pro-GGUF
- Build de compatibilidad TurboQuant: https://huggingface.co/thelamapi/Next-3-Pro-TurboQuant
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thelamapi
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
