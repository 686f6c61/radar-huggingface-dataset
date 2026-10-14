# vinnj/coachwhip-models

## Resumen

Coachwhip models es un repositorio de archivos GGUF ya preparados para Coachwhip, un motor de inferencia que ejecuta modelos de mezcla de expertos (MoE) que no caben en la memoria unificada de un Mac de 16 GB, transmitiendo los expertos desde el SSD en lugar de cargarlos completos en RAM. El autor es vinnj y el unico archivo publicado hasta ahora es una cuantizacion de Qwen3-Coder-Next, el modelo de codigo MoE de Qwen, con un total de 79.674.391.296 parametros segun los safetensors del modelo base.

El proposito del repositorio no es entrenar ni afinar un modelo, sino distribuir el resultado de `coachwhip-prepare`, la herramienta que acompana a la instalacion de Coachwhip. De este modo el usuario se descarga un GGUF ya "exprimido" (29.335.336.000 bytes) en lugar de repetir el proceso de cuantizacion por capas sobre el modelo original.

Es relevante ahora porque permite ejecutar un modelo de codigo de ~80 B de parametros en hardware de consumo Apple silicon sin conexion a internet, sin claves de API y bajo licencia Apache-2.0. El coste es la velocidad: el autor reporta 4,2 tok/s en un Mac de 16 GB, muy por debajo de lo que se obtendria sirviendo el modelo desde GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), derivada de Qwen3-Coder-Next |
| Parametros totales | 79.674.391.296 (~79,7 B) segun safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2X (gate y up de expertos en Q2_K, down en Q3_K, resto en Q3_K_M sin modificar); archivo GGUF unico |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (se requiere ademas el tokenizer.json del modelo base) |

## Arquitectura y entrenamiento

El repositorio no contiene ningun entrenamiento propio: es una recuantizacion derivada de `MaziyarPanahi/Qwen3-Coder-Next-GGUF` en Q3_K_M, sobre la que se aplico una mezcla de precisos por tipo de tensor. Concretamente, los tensores de gate y up de los expertos se rebajaron a Q2_K, los de down a Q3_K y el resto de la red se dejo intacta. Ese esquema es lo que el autor denomina Q2X y explica que el archivo final ocupe 29,3 GB partiendo de un modelo de casi 80 B de parametros.

Como el modelo base es Qwen3-Coder-Next, se trata de un transformer con capas de mezcla de expertos y enfocado a generacion de codigo. El detalle de la arquitectura interna (numero de capas, numero de expertos, dimension del experto activo, regimen de atencion) no aparece en la informacion proporcionada. La innovacion tecnica destacable no esta en el modelo, sino en el motor de ejecucion: Coachwhip hace streaming de los expertos desde el SSD (opciones `--flash-reads`, `--parallel` y `--stand-ins` en la linea de arranque), de modo que solo una parte de la red reside en memoria al mismo tiempo.

## Capacidades

- Generacion de codigo: hereda las capacidades del modelo base Qwen3-Coder-Next, orientado a tareas de programacion.
- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y `text-generation`, con soporte multi-turno.
- Ejecucion completamente local y sin conexion: el motor funciona offline, sin API keys ni servicios en la nube.
- Streaming de expertos: capacidad del motor, no del modelo, para servir pesos mayores que la memoria disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`); el multilingue no esta documentado en esta ficha.
- Capacidades de vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de codigo offline en un portatil Apple con 16 GB: descargando el GGUF y el tokenizer.json, el desarrollador arranca Coachwhip con la linea indicada y obtiene autocompletado y generacion de codigo sin conexion ni coste por token.
- Trabajo en entornos aislados o sin red: equipos con requisitos de confidencialidad pueden generar codigo con un modelo de ~80 B sin enviar prompts a servicios externos.
- Prototipado en maquina local antes de mover cargas a servidores: usar el Q2X para validar prompts, plantillas y flujos de conversacion antes de desplegar en GPU con mayor precision.
- Recuantizacion reproducible: el repositorio sirve como referencia de que mezcla de precisos por tensor produce el autor y con que hash, lo que permite verificar la integridad del archivo con `shasum -a 256`.
- Explicacion y refactorizacion de fragmentos de codigo en sesiones conversacionales largas, aprovechando la naturaleza conversacional y de codigo del modelo base.
- Reproduccion de resultados de terceros: dado que el archivo se genero con `coachwhip-prepare` a partir de un GGUF publico, sirve para comparar el comportamiento del mismo modelo bajo distintas estrategias de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor en redes sociales es la velocidad de decodificacion en un Mac de 16 GB: 4,2 tok/s ejecutando el modelo de forma completamente offline.

## Requisitos de hardware

- Memoria: disenado para Apple silicon con 16 GB de memoria unificada; el objetivo del motor es que el modelo no tenga que caber entero en RAM.
- Almacenamiento: el archivo GGUF ocupa 29.335.336.000 bytes (~29,3 GB), a lo que se suma el `tokenizer.json`; se necesita espacio libre en el SSD, que es tambien el medio desde el que se transmiten los expertos.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles en la informacion proporcionada; la distribucion esta pensada para Apple silicon.
- Caber en GPU de consumo: no aplica segun la informacion disponible, dado el enfoque de streaming desde disco.
- Opciones de despliegue: motor Coachwhip sobre macOS; el arranque documentado es `~/coachwhip/coachwhip.sh ~/Downloads/Qwen3-Coder-Next.Q2X.gguf ~/Downloads/tokenizer.json 109 8090 --parallel --flash-reads --stand-ins`.
- Latencia y throughput: 4,2 tok/s reportados en un Mac de 16 GB; no hay cifras para otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| vinnj/coachwhip-models (Qwen3-Coder-Next Q2X) | ~79,7 B | GGUF Q2X, 29,3 GB | no disponible | Apache-2.0 | Optimizado para streaming de expertos en Mac de 16 GB |
| MaziyarPanahi/Qwen3-Coder-Next-GGUF (Q3_K_M) | ~79,7 B | GGUF | no disponible | Apache-2.0 | Origen del archivo; requiere mas memoria que el Q2X |
| Qwen/Qwen3-Coder-Next (original) | ~79,7 B | safetensors | no disponible | Apache-2.0 | Referencia en precision completa; no cabe en 16 GB |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo de estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion es agresiva: los expertos de gate y up bajan a Q2_K, lo que degrada la calidad respecto al modelo base en mayor medida que una cuantizacion homogenea.
- La velocidad es muy baja (4,2 tok/s), adecuada para uso interactivo ligero pero no para generacion masiva o pipelines de alto throughput.
- El repositorio declara unicamente ingles como idioma; no hay evidencia de buen rendimiento en castellano.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica ni evaluacion de fiabilidad.
- El registro del repositorio muestra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni historial de incidencias.
- Dependencia del motor Coachwhip: el GGUF esta preparado para ese runtime concreto y su linea de arranque, no para vLLM u otros servidores GGUF convencionales.
- El rendimiento depende en gran medida de la velocidad del SSD, ya que los expertos se leen desde disco durante la inferencia.
- Conviene verificar el hash `cdc0584c1e4d30134cbb83f18e4c7607af90bd1145a64940c7a357b02a0216af` tras la descarga.
- Licencia Apache-2.0: permite uso comercial, pero cada archivo hereda la licencia del modelo del que procede, por lo que hay que respetar tambien la del modelo base.
- Existe una discrepancia en las cifras publicitadas por el autor en redes (menciona 80 B y 122 B en publicaciones distintas); el dato de parametros de safetensors del modelo base es 79.674.391.296.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vinnj/coachwhip-models
- Repositorio del motor Coachwhip: https://github.com/1picassoai/coachwhip
- Publicacion del autor sobre 80 B en 16 GB: https://x.com/_Vinnj/status/2105698034709590512
- Publicacion del autor sobre 122 B en 16 GB: https://x.com/_Vinnj/status/2108616700299972972
- GGUF de origen: https://huggingface.co/MaziyarPanahi/Qwen3-Coder-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
