# tstepspam/gemma-4-26B-A4B-it-heretic-Q8-mlx

## Resumen
Este repositorio contiene una cuantización en 8 bits (Q8) del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, publicada por el usuario tstepspam en formato MLX para su ejecución en hardware de Apple (Apple Silicon). Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado desde cero: el modelo subyacente deriva de la familia Gemma 4 de Google, en su variante instruct (`-it`), y ha sido sometido a un proceso de "abliteration" (etiquetado como `heretic`, `uncensored`, `decensored`, `abliterated`, `ara`) orientado a eliminar o reducir los mecanismos de rechazo de respuestas.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo habitual de la comunidad open source: un modelo base se modifica (en este caso, para retirar alineamiento de seguridad) y después se cuantiza para reducir sus requisitos de memoria. Por otro, el uso del framework MLX implica que el modelo está pensado para inferencia local en Macs con memoria unificada, un nicho con herramientas y limitaciones distintas a las del ecosistema CUDA.

El tamaño real de los pesos, según los metadatos de safetensors, es de 25.233.053.440 parámetros (unos 25,2 mil millones), aunque la nomenclatura del nombre (`26B-A4B`) sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token. Este dato no está confirmado en la documentación disponible y debe tratarse como una inferencia a partir del nombre. La model card es prácticamente vacía: no incluye descripción, datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos con ~4.000 millones de parámetros activos; sin confirmar) |
| Parametros totales | 25.233.053.440 (~25,2 B), segun metadatos de safetensors |
| Parametros activos | no disponible (inferido ~4 B a partir del nombre; sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (Q8) para MLX; no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun etiqueta del repositorio); el campo `license_link` apunta a la licencia de Gemma 4 de Google, lo que genera ambiguedad |
| Formato de pesos | safetensors (formato MLX), cuantizacion de 8 bits |

## Arquitectura y entrenamiento
No hay informacion tecnica en la model card sobre la arquitectura del modelo subyacente, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineamiento (RLHF, DPO u otras). El unico dato estructural fiable es el recuento de parametros obtenido de los safetensors (25,2 B) y la pista que aporta el nombre del modelo base de la familia Gemma 4, que apunta a una arquitectura transformer con posible mezcla de expertos (MoE), habida cuenta del sufijo "A4B" (active 4B). Esta interpretacion no esta confirmada por el autor.

Lo que si es caracteristico de este repositorio es la doble transformacion aplicada. Primero, el modelo base `coder3101/gemma-4-26B-A4B-it-heretic` ha sido modificado mediante tecnicas de abliteration (la etiqueta `heretic` remite a la herramienta Heretic para la ablacion de direcciones de rechazo, y `ara` probablemente a un metodo de ablacion de activaciones). Esta tecnica consiste en identificar y neutralizar las direcciones del espacio de activaciones asociadas a la negativa a responder. Segundo, tstepspam ha convertido los pesos resultantes a formato MLX con cuantizacion de 8 bits, una operacion que reduce el peso en disco hasta los 26,8 GB del repositorio a cambio de una perdida minima de precision. No hay informacion sobre si la cuantizacion se realizo con calibracion o que grupos/tamano de bloque se emplearon.

## Capacidades
- Generacion de texto conversacional en modo instruct, heredada del modelo base Gemma 4 en su variante `-it`.
- Generacion de texto sin filtros de rechazo: el proceso de abliteration elimina o reduce las negativas a responder ante peticiones que el modelo original rechazaria.
- Conversacion multiturno (etiqueta `conversational`).
- Inferencia local eficiente en Apple Silicon gracias al formato MLX y la cuantizacion Q8.
- Capacidades potenciales de razonamiento, codigo o matematicas: no disponibles; no hay documentacion que las confirme para esta version concreta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso
- Asistente conversacional local en Mac: al estar cuantizado en Q8 y en formato MLX, puede ejecutarse en un equipo Apple Silicon con memoria unificada suficiente, permitiendo un chat privado en el que ningun dato sale del dispositivo.
- Generacion creativa sin restricciones tematicas: el caracter "uncensored/decensored" lo hace util para escritura de ficcion, guiones o narrativa con tematicas que los modelos alineados suelen rechazar.
- Investigacion sobre alineamiento y abliteration: sirve como objeto de estudio para medir como cambia el comportamiento de un modelo al eliminar direcciones de rechazo, comparandolo con el modelo base original.
- Generacion de datos sinteticos: puede emplearse para producir corpus de texto en dominios donde los modelos censurados se niegan a colaborar, siempre que el uso cumpla la legalidad aplicable.
- Base para fine-tuning posterior: al ser una cuantizacion MLX, puede servir como punto de partida para adaptaciones LoRA en el ecosistema `mlx-lm` antes de reconsolidar pesos.
- Analisis de robustez de filtros de seguridad: permite a equipos de seguridad evaluar que tipos de prompt traspasan las defensas de un modelo y como se comporta la version ablacionada frente a la original.
- Prototipado rapido en local sin GPU dedicada: evita el coste de alquiler de GPUs en la nube para pruebas de concepto con un modelo de ~25 B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada para inferencia: al menos ~27 GB de memoria unificada para cargar los pesos Q8, mas el overhead del runtime de MLX y de la cache KV. En la practica, se recomienda disponer de 32 GB o mas.
- GPUs compatibles: MLX esta disenado exclusivamente para Apple Silicon (serie M1, M2, M3 y M4, en variantes Pro, Max y Ultra). No se ejecuta de forma nativa en GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 32 GB o superior (por ejemplo, M1/M2/M3/M4 Pro con 36 GB, Max con 32/64/128 GB, o Ultra). En equipos con 16 GB no es viable en Q8.
- Opciones de despliegue: `mlx-lm` (libreria nativa para cargar y servir modelos MLX). Para otros entornos seria necesario convertir los pesos a GGUF (llama.cpp, Ollama) o a safetensors estandar (vLLM, TGI), operacion no documentada por el autor para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/gemma-4-26B-A4B-it-heretic-Q8-mlx (este) | ~25,2 B | no disponible | 8 bits (MLX) | apache-2.0 / Gemma (ambigua) | MLX, Apple Silicon |
| coder3101/gemma-4-26B-A4B-it-heretic (base) | no disponible | no disponible | sin cuantizar (presumiblemente) | no disponible | no disponible |
| gemma-4-26B-A4B-it (original de Google) | ~25-26 B segun nomenclatura | no disponible | multiples | licencia Gemma | ecosistema amplio |

No se dispone de datos verificados sobre otros modelos comparables de la misma categoria (mismo tamano, mismo propoito o mismo formato MLX) en la informacion proporcionada.

## Limitaciones y advertencias
- La model card no aporta informacion sobre sesgos, pero al tratarse de una version ablacionada de un modelo instruct, es previsible que los sesgos del modelo original persistan e incluso se amplifiquen al desaparecer los mecanismos de rechazo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen para esta version.
- La eliminacion de los mecanismos de rechazo implica que el modelo puede generar contenido danino, ilegal o inapropiado sin advertencia. No deberia desplegarse en produccion orientada al publico sin una capa externa de moderacion.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva tras la cuantizacion.
- Ambiguedad de licencia: la etiqueta del repositorio indica `apache-2.0`, pero el campo `license_link` remite a la licencia de Gemma 4, que impone restricciones de uso adicionales. Antes de un uso comercial debe verificarse cual prevalece.
- La cuantizacion Q8 puede degradar ligeramente la calidad respecto a los pesos sin cuantizar, especialmente en tareas de razonamiento largo.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad ni garantia de que la conversion sea correcta.
- El modelo es de tipo "heretic/abliterated": no ha pasado los procesos de evaluacion de seguridad habituales de Google y carece de garantias de robustez.
- La fecha de creacion indicada en los metadatos (2026-09-15) es posterior a la fecha actual de redaccion de esta ficha, lo que sugiere una posible anomalia en los metadatos del repositorio.

## Enlaces
- HuggingFace: https://huggingface.co/tstepspam/gemma-4-26B-A4B-it-heretic-Q8-mlx
- Modelo base: https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Licencia referenciada en el repositorio: https://ai.google.dev/gemma/docs/gemma_4_license
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
