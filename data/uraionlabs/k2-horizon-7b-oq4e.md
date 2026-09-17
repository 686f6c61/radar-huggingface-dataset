# UraionLabs/K2-Horizon-7B-oQ4e

## Resumen

K2-Horizon-7B-oQ4e es una cuantizacion de precision mixta en formato MLX del modelo IFM/K2-Horizon-7B, publicada por Uraion Labs. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: conserva la arquitectura, el tokenizador, la plantilla de chat, los formatos de razonamiento y de uso de herramientas, y la ventana de contexto del modelo original de IFM. La cuantizacion se ha realizado con el flujo oQe de oMLX y emplea un esquema de 4 bits con precision mixta sensible a la sensibilidad de cada tensor, orientado a reducir el uso de memoria y almacenamiento sin degradar en exceso los componentes mas delicados.

El modelo subyacente, K2-Horizon-7B, es un transformer decoder-only denso de clase 7B (el checkpoint cuantizado declara 8.999.178.240 parametros en sus safetensors). Su rasgo mas destacado es una arquitectura de contexto nativo de 524.288 tokens, alcanzada mediante una extension progresiva durante el midtraining (8K, 32K, 128K y 512K). IFM lo posiciona como el miembro denso medio de la familia K2-Horizon, evaluado en tareas de razonamiento matematico, ingenieria de software, razonamiento cientifico, contexto largo, uso de terminal y flujos agenticos.

La relevancia de esta ficha concreta reside en su orientacion a la inferencia local en Apple Silicon: el checkpoint usa el formato estandar de MLX y esta pensado para oMLX y runtimes compatibles. Frente a una cuantizacion uniforme en 4 bits, la variante oQ4e pretende un mejor equilibrio entre calidad, huella de memoria, huella de almacenamiento y velocidad, reteniendo mas precision en los tensores identificados como sensibles por el flujo oQe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (clase 7B) |
| Parametros totales | 8.999.178.240 (~9B) segun safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (nativo) |
| Tipos de cuantizacion | oQ4e (4 bits, precision mixta, flujo oQe de oMLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |
| Modelo base | IFM/K2-Horizon-7B |
| Tamano del repositorio | 5,3 GB |
| Plataforma objetivo | Apple Silicon macOS |
| Runtime previsto | omlx y runtimes compatibles con MLX |
| Libreria | mlx |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de clase 7B. El checkpoint cuantizado hereda del modelo original de IFM el tokenizador, la plantilla de chat, el formato de razonamiento y el formato de llamada a herramientas. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de capas, dimension del modelo, numero de cabezas de atencion ni sobre la composicion del dataset de entrenamiento, el volumen de tokens o si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones de atencion (lineal, decodificacion especulativa u otras).

La innovacion tecnica documentada en esta publicacion es la cuantizacion oQ4e mediante el flujo oQe de oMLX. En lugar de cuantizar todos los componentes elegibles a la misma precision, el flujo puede retener precision adicional en los tensores mas sensibles a la cuantizacion (por ejemplo, cabezas de salida). La model card indica explicitamente que los overrides exactos por capa, los bits efectivos por peso, el tamano de grupo, las estadisticas de calibracion y la precision de la cabeza de salida deben tomarse del informe de cuantizacion de oMLX para este checkpoint, por lo que esos datos concretos no estan disponibles aqui. El contexto nativo de 512K se obtuvo en el modelo original mediante extension progresiva de 8K a 32K, 128K y 512K.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Razonamiento matematico: IFM lo evalua en pruebas como HMMT y HLE.
- Razonamiento cientifico y codigo cientifico: evaluado en SciCode.
- Ingenieria de software: evaluado en SWE-bench Verified.
- Uso de terminal: evaluado en Terminal-Bench 2.1.
- Uso de herramientas y function calling: heredado del modelo original, con formato de llamada propio de K2-Horizon.
- Flujos agenticos y de multiples pasos: se declara soporte de agent y agentic, con evaluaciones en tau3-Banking y BrowseComp.
- Busqueda y navegacion: la evaluacion BrowseComp sugiere capacidades de busqueda en flujos agenticos.
- Razonamiento con contexto largo: ventana nativa de 524.288 tokens y evaluacion LCR.
- Control de esfuerzo de razonamiento: la plantilla de chat permite ajustar el nivel de razonamiento por peticion, segun recomienda IFM.
- Idiomas: unicamente ingles declarado; no se documenta capacidad multilingue.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta empaquetado en MLX safetensors y pensado para oMLX, de modo que un desarrollador puede ejecutar un modelo de clase 7B en un portatil o equipo de sobremesa Apple sin depender de GPU dedicada.
- Asistentes de programacion en local: hereda evaluacion en SWE-bench Verified y soporte de tool calling, por lo que encaja en asistentes que editan codigo, ejecutan comandos y consultan repositorios en un entorno controlado.
- Agentes autonomos con uso de herramientas: al soportar function calling y flujos multi-paso (tau3-Banking, BrowseComp), puede orquestar llamadas a APIs, terminal y busqueda dentro de un bucle agentico.
- Analisis de documentos largos: con 524.288 tokens de contexto nativo puede procesar libros tecnicos, expedientes o bases de codigo extensas en una sola ventana, siempre que la memoria unificada disponible lo permita.
- Razonamiento cientifico y asistencia a investigacion: las evaluaciones en SciCode y HLE sugieren utilidad en tareas de calculo y redaccion tecnica que requieren pasos intermedios de razonamiento.
- Prototipado sin conexion y entornos con requisitos de privacidad: al ejecutarse en local sobre macOS, permite procesar datos sensibles sin enviarlos a servicios en la nube.
- Ajuste del nivel de razonamiento por tarea: gracias al control de esfuerzo de razonamiento de la plantilla de chat, se puede reducir latencia en tareas simples y aumentar el esfuerzo en problemas complejos dentro de la misma aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo original fue evaluado en SWE-bench Verified, Terminal-Bench 2.1, tau3-Banking, BrowseComp, SciCode, LCR, HLE y HMMT, pero no incluye las cifras obtenidas ni valores de referencia para el checkpoint cuantizado oQ4e. La propia model card advierte que el equilibrio calidad/rendimiento debe medirse sobre el artefacto final y no inferirse solo del ancho de bits nominal.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano declarado (8.999.178.240 parametros en 4 bits y un repositorio de 5,3 GB), no datos publicados por el autor.

- Peso del modelo en memoria: aproximadamente 4,5-5,5 GB en 4 bits, en linea con el repositorio de 5,3 GB.
- Memoria unificada minima orientativa: 16 GB para contexto corto y cargas ligeras; 32 GB o mas para contexto medio; 64 GB o mas para explotar ventanas muy largas.
- Cache KV: crece de forma aproximadamente lineal con el contexto y puede superar con holgura el peso de los parametros a 512K tokens; el uso real depende de la configuracion de la cache, el runtime y el prompt.
- GPU dedicada: el formato MLX safetensors esta orientado a Apple Silicon; no se documentan requisitos ni soporte para GPU NVIDIA o AMD.
- Hardware recomendado: equipos Mac con chip de la serie M (M1/M2/M3/M4) y memoria unificada amplia; no disponible una recomendacion especifica de modelo de chip por parte del autor.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y runtimes compatibles con MLX, incluida la libreria mlx-lm. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros modelos. No constan especificaciones, licencias ni resultados de benchmarks de alternativas que permitan una comparacion rigurosa, y la propia publicacion no incluye una tabla de comparacion. El modelo se situa en la categoria de transformers densos de 7-9B con contexto largo, pero cualquier comparacion numerica con otras alternativas requeriria datos que no estan disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-7B-oQ4e | 8.999.178.240 | 524.288 tokens | Apache-2.0 | HuggingFace (MLX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Hereda los sesgos y limitaciones del modelo base IFM/K2-Horizon-7B, que no se detallan en la informacion proporcionada.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de fidelidad factual.
- La cuantizacion en 4 bits con precision mixta puede degradar la calidad respecto al checkpoint original; la model card recomienda medir el artefacto final en lugar de asumir el rendimiento a partir del ancho de bits.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El contexto nativo es de 524.288 tokens, pero el contexto utilizable en local depende de la memoria unificada, la configuracion de la cache KV, el runtime y el tamano del prompt, por lo que no puede garantizarse su uso completo en equipos con memoria limitada.
- El formato MLX safetensors limita el despliegue a runtimes compatibles con MLX y a hardware Apple Silicon; no es portable a pilas CUDA sin conversion.
- La licencia es Apache-2.0, lo que permite uso comercial, pero al ser un derivado cuantizado conviene verificar las condiciones del modelo base IFM/K2-Horizon-7B antes de un despliegue en produccion.
- No se publican detalles de la calibracion, los bits efectivos por peso ni el tamano final exacto del artefacto; estos datos deben consultarse en el informe de cuantizacion de oMLX.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que existe poca validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/K2-Horizon-7B-oQ4e
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- oMLX (repositorio): https://github.com/jundot/omlx
- Uraion Labs: https://uraionlabs.com/
