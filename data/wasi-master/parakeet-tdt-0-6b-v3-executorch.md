# wasi-master/parakeet-tdt-0.6b-v3-executorch

## Resumen

Este repositorio contiene una exportación del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` al formato ExecuTorch, concretamente para el delegado Vulkan. Lo publica el usuario `wasi-master` como artefacto de despliegue para la función de dictado sin conexión de su aplicación WM Keyboard, no como un modelo nuevo entrenado desde cero. El modelo base es un Parakeet TDT (Token-and-Duration Transducer) de NVIDIA con unos 0,6 mil millones de parámetros, pensado para transcripción de voz a texto de alta calidad.

La relevancia de esta ficha es doble: por un lado, documenta el modelo base de NVIDIA y sus capacidades de transcripción; por el otro, describe el artefacto concreto que se distribuye aquí, que es una conversión cuantizada a int4 con ejecución parcial en GPU mediante Vulkan. El repositorio ocupa 0,8 GB e incluye el grafo exportado (`model.pte`), el tokenizador SentencePiece y un manifiesto con tamaños, hashes y los operadores que quedan en CPU.

Conviene subrayar que la información pública disponible sobre este artefacto es muy limitada: no hay datos de benchmarks propios, no se declaran idiomas soportados en las etiquetas y el número de descargas es muy bajo. La mayor parte de los datos técnicos procede de la model card del autor y del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), exportada a ExecuTorch |
| Parametros totales | 0,6 mil millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion disponible) |
| Tipos de cuantizacion | int4 con activaciones dinamicas de 8 bits y pesos de 4 bits en grupos de 32 (capa lineal) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ExecuTorch `.pte` (Vulkan), tokenizador SentencePiece `.model` |

## Arquitectura y entrenamiento

El modelo base es un Parakeet TDT de NVIDIA, una arquitectura de tipo transducer (RNN-T con predicción conjunta de token y duración) diseñada para ASR. Esta exportación no reentrena el modelo: parte de la revisión `541d1f99c6b0c3cd0b11a95167540bb8edefd82b` del modelo de NVIDIA y la convierte con el script de exportación de Parakeet incluido en ExecuTorch v1.5.1, aplicando su particionador Vulkan. El resultado separa cuatro métodos: `preprocessor` en CPU, y `encoder`, `decoder_step` y `joint` en GPU a través de Vulkan.

La cuantización aplicada es int4 en las capas lineales, con activaciones dinámicas de 8 bits y pesos de 4 bits agrupados de 32 en 32. El autor indica que, en una GPU Mali-G57, esta build produjo los mismos tokens que la build XNNPACK, pero fue entre 2,2 y 2,7 veces más lenta. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO).

## Capacidades

- Reconocimiento automático del habla (voz a texto) mediante arquitectura transducer.
- Ejecución offline en dispositivos, sin depender de servicios en la nube.
- Ejecución parcial en GPU mediante el delegado Vulkan de ExecuTorch (Vulkan 1.1 o superior).
- Tokenización con SentencePiece integrada en el repositorio.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio de entrada más allá del propio ASR, modo thinking): no disponibles.

## Casos de uso

- Dictado offline en aplicaciones de teclado: es el caso para el que se creó este artefacto; WM Keyboard lo usa para transcribir voz a texto sin conexión en dispositivos con GPU compatible con Vulkan.
- Transcripción en dispositivos móviles con GPU Mali o similares: el modelo cabe en 0,8 GB y se ejecuta con el runtime de ExecuTorch, lo que permite integrarlo en apps Android o embebidas.
- Subtitulado y notas de voz en local: al no requerir red, es adecuado para aplicaciones de privacidad estricta donde el audio no debe salir del dispositivo.
- Prototipado de ASR en entornos con recursos limitados: la cuantización int4 reduce el peso del modelo y facilita su despliegue en hardware modesto.
- Integración en pipelines de accesibilidad: transcripción de voz a texto para personas con movilidad reducida en aplicaciones de escritorio o móvil.
- Evaluación comparativa de backends de ExecuTorch: sirve como referencia para medir el rendimiento de Vulkan frente a XNNPACK en tareas de ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es comparativo entre backends: en una Mali-G57, la build Vulkan int4 produjo los mismos tokens que la build XNNPACK y fue entre 2,2 y 2,7 veces más lenta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,8 GB, lo que da una idea del orden de magnitud del modelo cuantizado.
- GPU recomendadas: no disponibles; el autor solo documenta pruebas en una Mali-G57 (GPU integrada de gama media).
- Compatibilidad con GPU de consumo: requiere un runtime de ExecuTorch compilado con el backend Vulkan (Vulkan 1.1). No se especifican modelos concretos de NVIDIA, AMD o Intel.
- Opciones de despliegue: runtime de ExecuTorch con backend Vulkan; el autor menciona también una build XNNPACK como referencia comparativa.
- Latencia y throughput: no disponibles; solo se conoce la relación de lentitud frente a XNNPACK (2,2 a 2,7 veces más lento en Mali-G57).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wasi-master/parakeet-tdt-0.6b-v3-executorch | ~0,6 B | no disponible | CC-BY-4.0 | ExecuTorch `.pte` (Vulkan) | Exportación int4 para GPU Vulkan |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | CC-BY-4.0 | pesos originales de NVIDIA | Modelo base sin cuantizar |
| Build XNNPACK del mismo modelo | ~0,6 B | no disponible | CC-BY-4.0 | ExecuTorch (XNNPACK) | Referencia del autor; 2,2-2,7x más rápida en Mali-G57 |

No se dispone de datos de benchmarks para comparar el rendimiento de transcripción con alternativas de la misma categoría.

## Limitaciones y advertencias

- La información pública es muy escasa: no se declaran idiomas soportados ni ventana de audio, lo que dificulta evaluar su idoneidad para casos concretos.
- El rendimiento en GPU Vulkan es peor que en XNNPACK según el propio autor (2,2 a 2,7 veces más lento en Mali-G57); conviene medir en el hardware objetivo antes de adoptarlo.
- Requiere un runtime de ExecuTorch compilado con el backend Vulkan (Vulkan 1.1); no funciona con runtimes estándar de PyTorch o transformers sin conversión.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero los pesos son de NVIDIA y el repositorio solo cambia el formato; hay que respetar los términos del modelo base.
- Riesgo de alucinación y errores de transcripción inherente a cualquier modelo ASR; no se documentan sesgos conocidos en la información disponible.
- El número de descargas (6) y de likes (0) es muy bajo, por lo que no hay validación comunitaria extensa.
- No es un modelo de lenguaje: no soporta generación de texto libre, tool calling ni razonamiento multi-paso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wasi-master/parakeet-tdt-0.6b-v3-executorch
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio WM Keyboard: https://github.com/wasi-master/wmkeyboard
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
