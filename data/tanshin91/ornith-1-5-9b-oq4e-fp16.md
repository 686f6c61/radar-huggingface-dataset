# tanshin91/Ornith-1.5-9B-oQ4e-fp16

## Resumen

Ornith-1.5-9B-oQ4e-fp16 es una cuantizacion mixta del modelo Ornith-1.5-9B, publicada por el usuario tanshin91 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos ya entrenados convertidos a un formato cuantizado de precision mixta mediante la herramienta oQ de oMLX v0.8.0, orientada a la inferencia en Apple Silicon a traves del framework MLX. El checkpoint pesa 9.409.813.744 parametros logicos (9.410B), de los cuales 8.954B corresponden al modelo de lenguaje y 0.456B a un componente de vision.

La relevancia de esta publicacion es practica: reduce el checkpoint completo a 6.730 GiB de almacenamiento con un promedio efectivo de 6.143 bits por peso, lo que permite ejecutar un modelo de casi 9.400 millones de parametros en equipos con memoria unificada moderada, manteniendo en FP32 los tensores mas sensibles (4.846% de los pesos) y aplicando cuantizacion afina de 4, 5 y 6 bits al resto. La ficha tecnica del autor documenta con detalle la distribucion de bits por tensor, lo que facilita estimar el equilibrio entre calidad y huella de memoria.

La informacion disponible es limitada en cuanto a origen del modelo base, datos de entrenamiento, licencia e idiomas: la model card solo describe el proceso de cuantizacion. La arquitectura se infiere del tag `qwen3_5`, que apunta a la familia Qwen 3.5, y la presencia de un modulo de vision de 0.456B confirma que el modelo base es multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`; detalles no disponibles) |
| Parametros totales | 9.409.813.744 (9.410B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 64, FP16 y FP32; promedio efectivo 6.143 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`, tag `mlx`) |

Desglose de almacenamiento segun el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8.954B | 5.402 GB / 5.031 GiB |
| Vision | 0.456B | 1.824 GB / 1.699 GiB |
| Total | 9.410B | 7.226 GB / 6.730 GiB |

Distribucion de precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 6.201B | 65.902% | 3.249 GiB | 4.50 |
| Affine 5-bit, grupo 64 | 2.592B | 27.541% | 1.659 GiB | 5.50 |
| Affine 6-bit, grupo 64 | 0.160B | 1.697% | 0.121 GiB | 6.50 |
| Affine 8-bit, grupo 64 | 0.000B | 0.003% | 0.000 GiB | 8.50 |
| FP16 | 0.001B | 0.011% | 0.002 GiB | 16.00 |
| FP32 | 0.456B | 4.846% | 1.699 GiB | 32.00 |

## Arquitectura y entrenamiento

El checkpoint no aporta informacion sobre el entrenamiento del modelo base. Lo unico documentado es el proceso de posentrenamiento aplicado por el autor: una cuantizacion de precision mixta con oQ (oMLX v0.8.0), que asigna distintos anchos de bit por tensor en funcion de su sensibilidad. El resultado es un promedio de 6.143 bits por peso, con la mayor parte del modelo (65.9% de los pesos) en affine 4-bit con grupo de 64, un 27.5% en 5-bit y un 4.85% mantenido en FP32. Ese bloque FP32 coincide con los 0.456B del modulo de vision, lo que sugiere que el codificador visual se conserva sin cuantizar.

La arquitectura subyacente se deduce de los tags: `qwen3_5` indica que el modelo base pertenece a la familia Qwen 3.5, y la separacion explicita entre "Language model" y "Vision" confirma un diseno multimodal con torre visual separada. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo original. La model card fue actualizada el 2026-11-19 con una recuantizacion respecto a versiones anteriores, por lo que el autor recomienda volver a descargar el checkpoint si se tenia una copia previa.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen 3.5 (capacidades concretas del base no verificadas en la informacion disponible).
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0.456B de parametros, lo que habilita tareas de comprension de imagenes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Inferencia optimizada para Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 6.730 GiB, por lo que un Mac con 16 GB o 24 GB de memoria unificada puede cargarlo dejando margen para el contexto y el runtime de MLX. Es el escenario principal para el que se publico esta cuantizacion.
- Prototipado de asistentes multimodales en escritorio: al incluir torre de vision, permite construir demos de descripcion de imagenes, extraccion de informacion de capturas o analisis de documentos escaneados sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: la model card detalla la distribucion exacta de bits, lo que lo convierte en un punto de referencia util para medir la perdida de calidad de oQ frente al modelo en FP16 en tareas de razonamiento y vision.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse localmente con MLX, los datos no salen del equipo, lo que encaja en flujos de trabajo con informacion sensible donde no se permite enviar contenido a servicios en la nube.
- Generacion de texto asistida en herramientas de escritorio: integrable en editores o clientes de correo nativos de macOS mediante MLX, aprovechando la cuantizacion para mantener el consumo de memoria acotado en uso continuado.
- Experimentacion academica con modelos cuantizados: util para estudiar el impacto de la precision mixta por capas en modelos multimodales de ~9B, dado que el autor publica el desglose de bits por componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 6.730 GiB solo para los pesos; hay que sumar la cache KV del contexto, que depende de la longitud de secuencia y no esta documentada.
- Memoria recomendada: 16 GB de memoria unificada como minimo practico en Apple Silicon; 24 GB o 32 GB para contextos largos o uso concurrente.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple (series M1, M2, M3 y M4, con especial ventaja en variantes Pro, Max y Ultra por ancho de banda de memoria). No es un checkpoint pensado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPUs discretas tipo RTX 4090 sin conversion previa a otro formato.
- Opciones de despliegue: `mlx` / `mlx-lm` y `mlx-vlm` (por el modulo de vision) son las rutas naturales; llama.cpp, Ollama, vLLM y TGI no consumen safetensors MLX directamente y requeririan conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ4e-fp16 | 9.410B | no disponible | Mixta 4/5/6/8-bit + FP16/FP32 (6.143 bits/peso) | safetensors MLX | no disponible |
| Modelo base Ornith-1.5-9B (FP16) | 9.410B | no disponible | Ninguna (16 bits) | no disponible | no disponible |
| Qwen 3.5 9B (upstream, referencia por tag) | no disponible | no disponible | Multiples | safetensors, GGUF | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y esquema de cuantizacion.

## Limitaciones y advertencias

- La cuantizacion mixta introduce perdida de calidad respecto al modelo en FP16; el impacto concreto no esta medido en la informacion disponible.
- El 65.9% de los pesos esta en 4 bits, lo que puede afectar de forma mas acusada a tareas sensibles a la precision numerica, como matematicas o generacion de codigo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base Ornith-1.5-9B y la de Qwen 3.5 antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados; no hay garantia de calidad en castellano ni en otros idiomas distintos del que use el modelo base.
- Longitud de contexto no disponible, lo que impide dimensionar la cache KV y planificar el consumo de memoria en contextos largos.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este checkpoint.
- Sesgos conocidos: no documentados. Al ser una recuantizacion, hereda los sesgos del modelo base, que no se describen en la model card.
- Dependencia de MLX: el checkpoint no es portable de forma directa a ecosistemas CUDA sin conversion, lo que limita su uso fuera de Apple Silicon.
- Versionado: el autor actualizo el checkpoint el 2026-11-19 con oMLX v0.8.0; las copias anteriores pueden diferir en calidad y deben sustituirse.
- Popularidad muy baja (1 like, 330 descargas) y autor individual: no hay validacion comunitaria extensa del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanshin91/Ornith-1.5-9B-oQ4e-fp16
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
