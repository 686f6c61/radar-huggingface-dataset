# YairYanai/TruceAI-Qwen3.6-Code-26B-A3.5B-GGUF

## Resumen

TruceAI Qwen3.6 Code 26B-A3.5B es una variante podada del modelo Qwen3.6 35B-A3B de Qwen, publicada por el usuario YairYanai bajo el paraguas del proyecto TruceAI. Se trata de un modelo de arquitectura Mixture of Experts (MoE) orientado a generacion de codigo, en el que se han eliminado expertos de cada capa para reducir el peso total desde los 35B nominales del modelo base hasta aproximadamente 26B de parametros totales, manteniendo unos 3,5B de parametros activos por token. El resultado se distribuye unicamente en formato GGUF cuantizado, pensado para ejecutarse en GPU de consumo.

La motivacion principal es clara: el modelo base en cuantizacion UD-IQ3_XXS ocupa 13,2 GB y no cabe en una GPU de 12 GB de VRAM, lo que obliga a descargar parte de las capas a RAM del sistema y penaliza la velocidad. Esta version podada reduce el fichero a 10,2 GB y permite mantener todo el modelo en VRAM con una ventana de contexto de aproximadamente 16K tokens, alcanzando velocidades de 52-58 tokens por segundo en una RTX 3060 de 12 GB con el motor TruceAI.

El modelo no ha sido reentrenado: la poda se basa en la medicion de la contribucion de cada experto durante sesiones de codigo y razonamiento, conservando 187 de los 256 expertos por capa. La licencia es Apache 2.0, la misma del modelo base, y el repositorio incluye tambien el codificador de imagenes (mmproj) sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `qwen35moe`), podada de 256 a 187 expertos por capa |
| Parametros totales | 25.972.748.928 (~26B) |
| Parametros activos | ~3,5B |
| Longitud de contexto | ~16K tokens recomendado en GPU de 12 GB (limite nativo del modelo base: no disponible) |
| Tipos de cuantizacion | GGUF UD-IQ3_XXS (expertos en IQ2_S e IQ3_XXS, resto sin cambios); mmproj en F16 |
| Idiomas soportados | No disponible (la model card advierte de menor rendimiento fuera del ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`TruceAI-Qwen3.6-Code-26B-A3.5B-UD-IQ3_XXS.gguf` + `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3.6 35B-A3B, con 256 expertos por capa en el original. La intervencion de TruceAI consiste en una poda estructurada de expertos sin reentrenamiento ni edicion de pesos: se conservan los 187 expertos por capa que mayor contribucion medida aportan a tareas de codigo, razonamiento y tool calling. Las filas del router viajan junto con sus expertos, de modo que el modelo enruta unicamente entre los expertos conservados.

El proceso de seleccion se realizo en tres fases: primero, una sesion de codigo con thinking activado en TypeScript, Python, Rust, Go, SQL, React, C++, bash, Java y turnos de agente con tool calls, registrando en GPU la contribucion de cada experto (peso de routing multiplicado por longitud de salida) y conservando los 160 mas fuertes por capa; despues, una medicion del modelo completo capa a capa desde disco sobre unos 17.500 tokens de respuestas de codigo y razonamiento paso a paso; finalmente, la reincorporacion de los 27 expertos mas usados por el modelo completo entre los descartados en la primera fase, hasta el limite que cabe en una tarjeta de 12 GB. Los expertos conservados cubren el 95% del trabajo medido de codigo y razonamiento, frente al 88% con 160 expertos. No se aplico RLHF, DPO ni ningun otro ajuste posterior.

## Capacidades

- Generacion de codigo en multiples lenguajes: TypeScript, Python, Rust, Go, SQL, React, C++, bash y Java, segun los datos de la sesion de medicion.
- Razonamiento paso a paso con modo thinking (el modelo base lo soporta y la poda lo tuvo en cuenta).
- Tool calling y function calling, con turnos de agente evaluados durante la seleccion de expertos.
- Razonamiento multi-paso orientado a tareas de agente.
- Procesamiento de imagenes a traves del codificador `mmproj-F16.gguf` incluido en el repositorio (se realizo una prueba simple de imagen con respuesta correcta).
- Capacidades multilingues: no disponible con detalle; la model card advierte de rendimiento inferior al modelo completo en idiomas distintos del ingles.
- Generacion de texto conversacional (tag `conversational`).

## Casos de uso

- **Asistente de codigo en estacion de trabajo con GPU de consumo**: al caber integramente en 12 GB de VRAM con 16K de contexto, permite autocompletado y generacion de funciones en un equipo con RTX 3060 sin depender de la nube, con 52-58 tokens/s.
- **Refactorizacion y migracion de codigo entre lenguajes**: el modelo fue medido sobre TypeScript, Python, Rust, Go, Java y C++, por lo que es adecuado para traducir y modernizar fragmentos entre esos lenguajes dentro de un IDE o script de CLI.
- **Generacion de consultas SQL y transformacion de datos**: su entrenamiento de seleccion incluyo SQL, lo que lo hace util para generar y revisar consultas en pipelines de analitica o ETL.
- **Agentes de codigo con tool calling**: al conservar los expertos mas usados en turnos de agente con llamadas a herramientas, puede integrarse en flujos que invocan compiladores, linters o APIs de CI/CD mediante function calling.
- **Prototipado local de asistentes de programacion**: para desarrolladores que quieren evaluar un MoE de ~26B sin infraestructura dedicada, el GGUF unico simplifica el despliegue en llama.cpp u otros runners compatibles con `qwen35moe`.
- **Analisis de capturas o diagramas tecnicos**: gracias al codificador de imagenes incluido, puede describir o razonar sobre imagenes de interfaces, diagramas de arquitectura o errores en pantalla en un contexto de depuracion.
- **Generacion de tests unitarios**: el benchmark interno del autor se basa en problemas Python con tests ocultos, lo que respalda su uso para producir casos de prueba a partir de especificaciones.

## Benchmarks y rendimiento

El autor publica un unico resultado interno, no estandarizado: una prueba de 20 problemas Python con tests unitarios ocultos, 3 intentos por problema, thinking desactivado y muestreo recomendado por Qwen.

| Version | Problemas resueltos |
|---|---|
| 128 expertos (podado desde Q3_K_M) | 53 / 60 |
| 160 expertos (podado desde UD-IQ3_XXS) | 57 / 60 |
| Este modelo: 187 expertos | 58 / 60 |

El propio autor advierte que la muestra es pequena y que diferencias de pocos puntos deben tratarse como ruido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: 10,2 GB para el fichero GGUF principal; con contexto de ~16K cabe en 12 GB de VRAM. El mmproj F16 anade un consumo adicional no cuantificado en la informacion disponible.
- **GPU recomendadas**: RTX 3060 12 GB (medida por el autor con el motor TruceAI), y por capacidad cualquier GPU con 12 GB o mas (RTX 4070, RTX 4080, RTX 4090, A100, H100). No se han publicado mediciones en estas ultimas.
- **GPU de consumo**: si, en tarjetas de 12 GB o superiores. En GPUs con menos de 12 GB no cabe integramente y parte se ejecutaria desde RAM del sistema.
- **Despliegue**: el autor indica que el fichero usa la arquitectura estandar `qwen35moe` con 187 expertos y que otros runners GGUF no han sido probados; esta pensado para el motor TruceAI. La compatibilidad con llama.cpp, Ollama o vLLM no esta confirmada en la informacion disponible.
- **Latencia y throughput**: 52-58 tokens/s en RTX 3060 12 GB con el motor TruceAI y contexto de 16K, frente a una velocidad menor del modelo completo UD-IQ3_XXS por ejecutar parte desde RAM. No hay datos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos/capa | Contexto | Tamano GGUF | Licencia |
|---|---|---|---|---|---|
| TruceAI Qwen3.6 Code 26B-A3.5B | ~26B (3,5B activos) | 187 | ~16K recomendado en 12 GB | 10,2 GB | Apache 2.0 |
| Qwen3.6 35B-A3B (UD-IQ3_XXS) | 35B (3B activos) | 256 | No disponible | 13,2 GB | Apache 2.0 |
| Qwen3.6 35B-A3B (podado a 160 expertos) | No disponible | 160 | No disponible | No disponible | Apache 2.0 |

El modelo base completo ofrece mayor calidad general (idiomas, conocimiento general, escritura creativa) pero no cabe en 12 GB en su cuantizacion UD-IQ3_XXS. No se dispone de datos para comparar con otras familias de modelos de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- **Degradacion fuera de codigo**: el autor advierte explicitamente de que el modelo es mas debil que el original en idiomas distintos del ingles, conocimiento general y escritura creativa.
- **Benchmark limitado**: el unico resultado publicado es una prueba de 20 problemas Python con 3 intentos; no hay evaluaciones estandar ni de otros lenguajes.
- **Compatibilidad de runners no verificada**: solo se ha probado con el motor TruceAI; el resto de runners GGUF no han sido testeados, lo que anade riesgo en produccion.
- **Contexto reducido en 12 GB**: para mantener todo en VRAM hay que limitar el contexto a unos 16K tokens, insuficiente para bases de codigo grandes o conversaciones muy largas.
- **Riesgo de alucinacion**: no se documenta ninguna mitigacion especifica; al ser un modelo podado sin reentrenamiento, conserva los sesgos y riesgos del base.
- **Sesgos**: no disponibles en la informacion proporcionada.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6 y de la cuantizacion UD-IQ3_XXS de Unsloth de la que deriva.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/YairYanai/TruceAI-Qwen3.6-Code-26B-A3.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Motor TruceAI: https://truceai-remote.truceai-site.workers.dev
