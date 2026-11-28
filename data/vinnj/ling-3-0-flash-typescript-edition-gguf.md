# vinnj/Ling-3.0-flash-TypeScript-Edition-GGUF

## Resumen

Ling-3.0-flash-TypeScript-Edition-GGUF es una cuantizacion GGUF Q4_K_M derivada de `inclusionAI/Ling-3.0-flash`, publicada por el usuario `vinnj`. No es un modelo entrenado desde cero, sino un recorte de expertos (*expert pruning*) sobre el MoE original de InclusionAI: se reduce de 512 a 128 expertos por capa en las 40 capas MoE, manteniendo 8 expertos activos por token. El resultado se distribuye como un unico fichero de 20.395.487.680 bytes (20,4 GB) con SHA-256 publicado, pensado para ejecutarse en Macs con Apple Silicon de 16 GB o mas mediante el motor Kraits 0.6.17.

El modelo base declara 33.777.908.192 parametros totales (unos 33,8 mil millones) y una licencia MIT heredada. La edicion TypeScript esta especializada en tareas de programacion en TypeScript y JavaScript, y el autor reporta 47/48 en un conjunto propio de seis tareas (rutas Express, tipos y genericos, manejo de errores asincronos, suite de Jest, conversion de JS a TypeScript estricto y componente React), frente a 46/48 de gpt-5-mini en las mismas pruebas.

Su relevancia actual es doble: por un lado demuestra que el recorte de expertos en un MoE mediano permite llevar un modelo de ~34B a un portatil de 16 GB con velocidades de escritura de en torno a 20 tokens/s; por otro, ejemplifica un patron de publicacion muy especifico (cuantizacion + motor propietario + pin list) que conviene evaluar con cautela antes de adoptarlo en produccion. La informacion disponible sobre el modelo base es escasa: no se detallan datos de entrenamiento, contexto ni benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; 40 capas MoE, 8 expertos activos por token; recortado de 512 a 128 expertos por capa |
| Parametros totales | 33.777.908.192 (~33,8B) |
| Parametros activos | no disponible (8 expertos activos por token, sin cifra de parametros activos publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | en (segun metadatos de Hugging Face) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `Ling-3.0-flash-TS128-Q4_K_M.gguf`, 20.395.487.680 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE). Esta edicion conserva la estructura MoE pero aplica un recorte de expertos: de 512 a 128 expertos por capa en las 40 capas MoE, con 8 expertos activos por token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica destacable no esta en el entrenamiento sino en el empaquetado: el modelo se distribuye junto a un fichero de *pins* (`Ling-3.0-flash-TS128-Q4_K_M.kraits-pins.txt`) que el motor Kraits 0.6.17 necesita para cargar los pesos. El autor advierte que el pin list alojado directamente en el repositorio de Hugging Face corresponde a Kraits 0.6.16 y que, para 0.6.17, debe extraerse del tarball de la release. Esta dependencia de un motor concreto y de una version exacta del pin list es un factor de acoplamiento relevante para cualquier despliegue.

## Capacidades

- Generacion de texto y codigo, con especializacion declarada en TypeScript y JavaScript.
- Tareas de programacion evaluadas por el autor: rutas Express, tipos y genericos, manejo de errores asincronos, suites de Jest, migracion de JS a TypeScript estricto y componentes React.
- Conversacion multi-turno (tag `conversational` en los metadatos).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso via API compatible con el formato de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); no hay evidencia de soporte de castellano.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Asistente de codigo TypeScript en local para desarrolladores con Mac de 16 GB: el modelo cabe en un unico fichero de 20,4 GB y genera a ~20 tokens/s, lo que permite autocompletado y refactorizacion sin conexion a la nube.
- Migracion de bases de codigo JavaScript a TypeScript estricto: la tarea "JS to strict TypeScript" obtiene 8/8 en la evaluacion del autor, por lo que encaja en pipelines de modernizacion de proyectos legacy.
- Generacion de tests unitarios con Jest: la tarea de suite de Jest obtiene 8/8 y el autor senala respuestas identicas en cada ejecucion a temperatura 0, lo que resulta util para generar tests reproducibles en CI.
- Prototipado de APIs con Express: la tarea de rutas Express obtiene 7/8; sirve para esqueletos de endpoints y middleware en fases tempranas de desarrollo.
- Generacion de componentes React: la tarea de componente React obtiene 8/8, adecuada para scaffolding de UI en proyectos front-end.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local sobre Apple Silicon, evita enviar codigo propietario a APIs externas, lo que lo hace apto para equipos con politicas estrictas de confidencialidad.
- Evaluacion comparativa de tecnicas de recorte de expertos: util para investigadores que quieran medir el impacto del *expert pruning* (512 a 128 expertos) en calidad y velocidad sobre un MoE de ~34B.

## Benchmarks y rendimiento

El autor publica una evaluacion propia de seis tareas de TypeScript, con prompts identicos para ambos modelos, temperatura 0, en un Mac mini M4 de 16 GB. No son benchmarks estandar (MMLU, HumanEval, GSM8K); no se han publicado resultados de benchmarks en la informacion disponible para esas suites.

| Tarea | Ling TS128 + Kraits 0.6.17 | gpt-5-mini |
|---|---:|---:|
| Express route | 7 | 8 |
| Types and generics | 8 | 8 |
| Async error handling | 8 | 8 |
| Jest test suite | 8 | 6 (media de 3 ejecuciones: 8, 8, 2) |
| JS to strict TypeScript | 8 | 8 |
| React component | 8 | 8 |
| **Total** | **47/48** | **46/48** |

Datos de velocidad medidos por el autor en Mac mini M4 16 GB: escritura de 19,6 a 20,7 tokens/s (media 20,4) y lectura de 37 a 45 tokens/s. No hay datos de latencia ni throughput en otras plataformas.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF Q4_K_M ocupa 20,4 GB; en Apple Silicon se usa memoria unificada, por lo que se requiere un Mac con 16 GB o mas (segun el autor).
- GPU recomendadas: no hay datos para GPU NVIDIA o AMD en la informacion proporcionada; el unico entorno validado es Apple Silicon (Mac mini M4 16 GB).
- Cabe en GPU de consumo: no confirmado; un fichero de 20,4 GB no cabe en GPUs de 16 GB de VRAM y requeriria al menos 24 GB para cargarse completo, aunque no se ha validado.
- Opciones de despliegue: el autor documenta exclusivamente el motor Kraits 0.6.17 (macOS ARM64, macOS 15 o superior) mediante `kraits-server.sh`. No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: ~20,4 tokens/s de escritura y 37-45 tokens/s de lectura en Mac mini M4 16 GB, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-TypeScript-Edition (este) | 33,8B totales, MoE 8 activos | no disponible | TypeScript, GGUF Q4_K_M, Apple Silicon | MIT | Hugging Face + Kraits |
| inclusionAI/Ling-3.0-flash (base) | 33,8B totales | no disponible | MoE generalista | MIT (heredada) | Hugging Face |
| gpt-5-mini | no disponible | no disponible | Propietario, API | Propietaria | API de OpenAI |

La comparacion con gpt-5-mini solo existe en las seis tareas de TypeScript del autor (47/48 frente a 46/48), no en benchmarks estandar. No se dispone de datos de otros modelos comparables de codigo en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion muy limitada: los 47/48 provienen de seis tareas disenadas por el propio autor del release, no de benchmarks independientes; el resultado no es extrapolable a calidad general de codigo.
- El prompt de la tarea de Jest fue reescrito por el tester y no fue visto durante el ajuste, pero sigue siendo una prueba unica con posible sesgo de seleccion.
- El recorte de 512 a 128 expertos por capa puede degradar capacidades fuera del dominio TypeScript; no se han publicado evaluaciones de capacidad general tras el pruning.
- Idiomas: solo se declara ingles; no hay evidencia de buen rendimiento en castellano.
- Dependencia fuerte del motor Kraits 0.6.17 y de un pin list con version concreta; el pin list del repo de Hugging Face corresponde a 0.6.16, lo que puede provocar fallos de carga si se usa directamente.
- Plataforma restringida a macOS 15 o superior en Apple Silicon; no hay soporte documentado para Linux, Windows, CUDA ni ROCm.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Licencia MIT permite uso comercial, pero el modelo base y el motor Kraits tienen sus propias condiciones (Kraits es Apache 2.0); conviene verificar la cadena de licencias antes de redistribuir.
- El repositorio tiene 174 descargas y 0 likes, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinnj/Ling-3.0-flash-TypeScript-Edition-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Motor Kraits: https://github.com/1picassoai/kraits
- Release Kraits 0.6.17: https://github.com/1picassoai/kraits/releases/download/v0.6.17/kraits-v0.6.17-macos-arm64.tar.gz
