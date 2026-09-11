# TiGa-RCE/gemma-4-12B-it-oQ8e

## Resumen

TiGa-RCE/gemma-4-12B-it-oQ8e es una cuantizacion comunitaria de 8 bits del modelo base gemma-4-12B-it, publicada por el usuario TiGa-RCE el 10 de septiembre de 2026. Se ha generado con oQ (oMLX v0.6.4), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple, y se distribuye en formato safetensors compatible con la libreria mlx. El modelo cuenta con 11.907.350.320 parametros totales (aproximadamente 11,9 mil millones) y un repositorio de 12,7 GB.

El problema que resuelve es el de permitir ejecutar un modelo de clase 12B en hardware Apple Silicon con un consumo de memoria reducido respecto a los pesos en precision completa, manteniendo un esquema de 8 bits con group size de 64. La relevancia actual radica en la consolidacion de MLX como runtime de inferencia local en Mac, donde las cuantizaciones de 8 bits ofrecen un equilibrio entre fidelidad numerica y huella de memoria.

La informacion disponible es limitada: la model card solo documenta los parametros de cuantizacion, sin detallar la longitud de contexto, los idiomas soportados, la licencia ni el desarrollador original del modelo base. No hay resultados de benchmarks publicados en la informacion proporcionada, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo de modelo declarado: gemma4_unified) |
| Parametros totales | 11.907.350.320 (~11,9 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, precision mixta (oQ / oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. La model card unicamente declara el tipo de modelo como gemma4_unified y describe el proceso de cuantizacion aplicado. Por la nomenclatura del identificador (gemma-4-12B-it) y el tipo declarado, cabe inferir que se trata de la version instruction-tuned de un modelo de la familia Gemma, pero esta circunstancia no queda confirmada en los datos disponibles, por lo que no se puede afirmar con certeza.

Respecto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO: esa informacion no esta disponible. La unica innovacion tecnica documentada es el uso de cuantizacion de precision mixta mediante oQ, con asignacion de 8 bits y group size de 64, que busca preservar la calidad del modelo original reduciendo el peso de los parametros. La model card indica ademas que esta version sustituye a una anterior publicada antes del 10 de septiembre de 2026, por lo que se recomienda volver a descargar los pesos si se obtuvo la version previa.

## Capacidades

- Generacion de texto conversacional: el sufijo "it" del nombre sugiere un ajuste para instrucciones y dialogo, aunque no se detalla en la informacion disponible.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la documentacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX safetensors y la libreria mlx.

## Casos de uso

- Asistente conversacional local en Mac: al estar en formato MLX quantizado a 8 bits, puede desplegarse con mlx-lm en un equipo Apple Silicon para mantener conversaciones multi-turno sin conexion, con la huella de memoria reducida que aporta la cuantizacion (repositorio de 12,7 GB).
- Procesamiento de documentos confidenciales: al ejecutarse integramente en el dispositivo, permite analizar y resumir textos sensibles sin enviarlos a servicios externos, siempre que se confirme el contexto maximo soportado (no disponible).
- Prototipado y evaluacion de cuantizaciones: util para investigadores que quieran medir la degradacion de calidad de un modelo 12B al pasar a 8 bits con group size 64 frente a los pesos originales.
- Generacion de texto en flujos de trabajo offline: escenarios sin conectividad (campo, entornos aislados) donde se requiere un modelo de clase 12B en hardware de consumo Apple.
- Integracion en pipelines de desarrollo local: mediante la API de mlx-lm es posible exponer el modelo como servidor compatible con OpenAI y conectarlo a editores o scripts internos.
- Experimentacion con tecnicas de cuantizacion de precision mixta: sirve como referencia practica del resultado de oQ/oMLX v0.6.4 sobre un modelo de 12B.
- Base para ajuste fino ligero: al ser un checkpoint cuantizado, no es el punto de partida ideal para LoRA/QLoRA, pero puede emplearse para evaluar la viabilidad de tareas concretas antes de invertir en entrenamiento sobre los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en 8 bits ocupan aproximadamente 12,7 GB (tamano del repositorio). Conviene reservar entre 14 y 16 GB de memoria unificada para pesos, cache KV y overhead del runtime.
- Plataforma objetivo: MLX requiere Apple Silicon (series M1, M2, M3, M4 y posteriores). No esta pensado para GPUs NVIDIA o AMD en su formato actual.
- Equipos recomendados: Mac con 16 GB de memoria unificada como minimo ajustado; 24 GB o 32 GB para contextos largos y mayor comodidad.
- GPU de consumo: no aplica directamente al formato MLX. Para ejecutarlo en GPU seria necesaria una conversion previa a otro formato (por ejemplo GGUF), tras lo cual encajaria en GPUs con 16 GB o mas de VRAM (RTX 4080, RTX 4090, RTX 3090).
- Opciones de despliegue: mlx-lm (incluido su servidor compatible con la API de OpenAI), entornos MLX personalizados. Otros runtimes como llama.cpp, Ollama, vLLM o TGI requeririan conversion de formato, que no esta documentada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. No hay datos de benchmarks, licencia, contexto ni idiomas del modelo base que permitan establecer una comparacion rigurosa con alternativas de la misma categoria. Tampoco se han encontrado en la busqueda web resultados relevantes (los enlaces devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con el modelo).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible, al no documentarse el dataset de entrenamiento ni el proceso de alineacion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan evaluaciones de fidelidad en la informacion disponible.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto maxima y los idiomas soportados, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Restricciones de licencia: la licencia no esta indicada en los datos proporcionados, por lo que no puede confirmarse la viabilidad de uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- Cuantizacion: al tratarse de una version de 8 bits con precision mixta, cabe esperar cierta degradacion respecto a los pesos originales, aunque no se han publicado mediciones al respecto.
- Versionado: la model card advierte de que esta publicacion reemplaza a una version anterior; si se descargo antes del 10 de septiembre de 2026, los pesos estan desactualizados.
- Madurez y soporte: el repositorio no registra descargas ni interacciones, y no se especifica el desarrollador original del modelo base, lo que reduce la trazabilidad y el soporte disponible.
- Compatibilidad: el formato MLX safetensors restringe su uso al ecosistema Apple; no es directamente portable a otros runtimes sin conversion.

## Enlaces

- HuggingFace: https://huggingface.co/TiGa-RCE/gemma-4-12B-it-oQ8e
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la busqueda web realizada.
