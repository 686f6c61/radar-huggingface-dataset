# zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, distribuido bajo licencia MIT y orientado a generacion de texto conversacional en ingles y japones. La ficha que nos ocupa no es el modelo original, sino una cuantizacion GGUF de 114,2 GB publicada por el usuario zephel01 bajo el identificador `Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF`, disenada especificamente para ejecutarse en un PC con 32 GB de VRAM y 128 GB de RAM.

El modelo base cuenta con 402.941.918.464 parametros totales (unos 403B) y una arquitectura MoE que enruta 10 expertos por token, con un bloque adicional NextN (MTP) para decodificacion especulativa. La cuantizacion emplea IQ2_XXS con importance matrix para los expertos enrutados y Q8_0 para atencion, proyecciones delta-net y expertos compartidos, manteniendo los 512 expertos sin podar.

Su relevancia actual reside en que permite ejecutar un modelo de ~400B parametros en hardware de consumo (una GPU de 32 GB, como una RTX 5090, mas 128 GB de RAM) sin lectura desde SSD durante la generacion, alcanzando cotas de decodificacion de 40 tok/s segun las mediciones del autor. Es una propuesta BETA, medida en un unico equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen35moe`), con bloque NextN/MTP para decodificacion especulativa |
| Parametros totales | 402.941.918.464 (~403B) |
| Parametros activos | no disponible (10 expertos enrutados por token, mas el compartido) |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama.cpp (`-c 32768`); contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | Expertos enrutados IQ2_XXS con imatrix; atencion, delta-net y expertos compartidos Q8_0; bloque NextN (blk.60) Q4_K |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards: 45,6 GB + 45,7 GB + 22,9 GB; total 114,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 403B parametros totales, enrutando 10 expertos por token ademas de un experto compartido, y conservando los 512 expertos totales en esta cuantizacion. Incluye un bloque NextN (Multi-Token Prediction, `blk.60`) que el motor Abyss emplea para decodificacion especulativa (drafting). La cuantizacion mantiene las capas de atencion, las proyecciones delta-net y los expertos compartidos en Q8_0, mientras que los expertos enrutados se comprimen a IQ2_XXS con una importance matrix construida sobre texto tecnico y codigo en ingles y japones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La unica innovacion documentada en esta ficha es la propia receta de cuantizacion (denominada P99), que segun el autor logra una calidad casi identica a la variante P107 (7 GB mayor) con un KL medio de 0,1655 frente a 0,1523, y un 79,1% de coincidencia en el token superior frente al 80,0%.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y japones.
- Razonamiento aritmetico y explicaciones tecnicas (verificado en las pruebas del autor con aritmetica japonesa y explicaciones en japones).
- Generacion de codigo con pruebas automatizadas (tres tareas de codigo con tests en el conjunto de comprobacion `--check`).
- Tool calling / function calling (una de las 11 pruebas de `--check` es una llamada a herramienta).
- Recuperacion de informacion en contexto largo (pruebas de aguja en 8K, 24K y 31K tokens).
- Decodificacion especulativa mediante el bloque NextN (MTP) en el motor Abyss.
- Soporte de conversacion de hasta 11 turnos en las pruebas realizadas.
- Capacidades multimodales, de vision o audio: no disponible.

## Casos de uso

- Asistencia tecnica en japones: el modelo puede mantener conversaciones multi-turno en japones con contexto de hasta 32K tokens, adecuado para soporte a desarrolladores nipones o documentacion tecnica bilingue.
- Generacion de codigo en local: las pruebas del autor incluyen tres tareas de codigo con tests, por lo que puede integrarse en flujos de trabajo de desarrollo asistido sin depender de la nube.
- Agentes con tool calling: la capacidad de function calling verificada permite construir agentes que consulten APIs o ejecuten acciones a partir de instrucciones en lenguaje natural.
- Analisis de documentos largos: con 32K tokens de contexto y pruebas de aguja superadas hasta 31K, sirve para resumir o extraer informacion de manuales y contratos extensos.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 32 GB de VRAM + 128 GB de RAM, permite ofrecer inferencia de un modelo de ~400B en entornos sin acceso a clusters.
- Prototipado de asistentes conversacionales bilingues: la combinacion de ingles y japones con licencia MIT facilita experimentar en productos comerciales sin restricciones de licencia.
- Investigacion sobre cuantizacion extrema: el repositorio documenta la receta P99 y las metricas KL, util como referencia para estudiar el impacto de IQ2_XXS en modelos MoE de gran tamano.

## Benchmarks y rendimiento

Calidad de la cuantizacion frente a la referencia Q8_0 (perplejidad de Q8_0: 12,30; `llama-perplexity --kl-divergence`, 8 fragmentos de 1024 tokens de texto ingles y japones no usado en la imatrix):

| Fichero | Tamano | KL medio | KL 99% | Mismo token superior | PPL |
|---|---:|---:|---:|---:|---:|
| P107 (expertos `ffn_down` IQ2_S, no subido) | 121,2 GB | 0,1523 | 1,17 | 80,0% | 12,91 |
| P99 (este fichero) | 114,2 GB | 0,1655 | 1,11 | 79,1% | 12,93 |

Comprobaciones de uso real (`./abyss.sh --check`, 11 pasos, 3 ejecuciones, temperatura 0,6, top_p 0,95, top_k 20):

| Ejecucion | Resultado | Fallo |
|---|---:|---|
| 1 | 10 / 11 | una tarea de codigo (hiragana) no paso sus tests |
| 2 | 10 / 11 | aritmetica japonesa: respuesta solo 44% en japones (mayormente formulas) |
| 3 | 11 / 11 | ninguno |

Rendimiento medido en el equipo del autor: decodificacion mediana de 40,0 tok/s; procesamiento de prompt de 773 tok/s con 8K y 1.553 tok/s con 24K. El titulo del repositorio anuncia 42,0 tok/s en una GPU de 32 GB + 128 GB de RAM.

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU mas 128 GB de RAM del sistema; el modelo completo (114,2 GB) reside en memoria, sin lectura desde SSD durante la generacion.
- GPU recomendadas: RTX 5090 (32 GB) segun el autor; cualquier GPU con 32 GB de VRAM deberia encajar en el perfil objetivo.
- Cabe en GPU de consumo: si, con el perfil 32 GB VRAM + 128 GB RAM. Existe una variante `16G64G` (16 GB GPU + 64 GB RAM) que lee desde SSD a ~9 tok/s, y variantes de 122B en IQ3_XXS (16 GB + 64 GB) e IQ4_XS (24-32 GB + 64 GB).
- Opciones de despliegue: motor Abyss v1.3.122 o superior (requerido, ya que versiones anteriores rechazan el fichero por el enrutado de 10 expertos por token); llama.cpp con build `ac8e1694d` o posterior (`llama-server -ngl 99 --cpu-moe -c 32768`), con velocidad no medida.
- Latencia y throughput: decodificacion mediana 40,0 tok/s; prompt 773 tok/s a 8K y 1.553 tok/s a 24K en el equipo del autor.
- Almacenamiento: 114,2 GB para los tres shards; el repositorio incluye `SHA256SUMS`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---:|---|---|---|
| Ornith-1.5-397B IQ2_XXS 32G128G (este) | ~403B | 32K (ejemplo) | GGUF, 114,2 GB | MIT | 10 expertos/token; 40 tok/s en 32 GB VRAM + 128 GB RAM |
| Ornith-1.5-397B IQ2_XXS 16G64G | ~403B | no disponible | GGUF, 110,6 GB | MIT | Perfil 16 GB VRAM + 64 GB RAM; lee desde SSD (~9 tok/s) |
| Ornith-1.5-122B IQ3_XXS 16G64G | 122B | no disponible | GGUF, 51,7 GB | MIT | Perfil 16 GB VRAM + 64 GB RAM |
| Ornith-1.5-122B IQ4_XS 24G64G | 122B | no disponible | GGUF, 68,9 GB | MIT | Perfil 24-32 GB VRAM + 64 GB RAM; mayor calidad |

No se dispone de datos de benchmarks comparativos frente a modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones proceden de un unico PC; el autor solicita reportes de otras maquinas y no garantiza la velocidad en otros equipos.
- Fallos ocasionales en tareas concretas: en las pruebas del autor, una de cada tres ejecuciones fallo un paso (tests de codigo o aritmetica japonesa con respuesta mayoritariamente en formulas).
- Idiomas limitados a ingles y japones; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido incorrecto con apariencia de veracidad.
- La cuantizacion IQ2_XXS es agresiva: el KL medio de 0,1655 y el 79,1% de coincidencia en el token superior implican una degradacion medible frente a Q8_0, aunque el autor la considera aceptable.
- Dependencia de version concreta del motor: Abyss requiere v1.3.122 o superior; en llama.cpp solo se verifico el build `ac8e1694d` con una respuesta corta y sin medir velocidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias; conviene validar el comportamiento en el dominio de produccion antes de desplegar.
- No se dispone de informacion sobre sesgos del modelo base ni sobre el contexto maximo nativo del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion de Abyss para Ornith: https://github.com/zephel01/Abyss/blob/main/docs/ornith/README.md
- Variante 16G64G del mismo modelo: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF
- Variante 122B IQ3_XXS: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Variante 122B IQ4_XS: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-397B+32G128G
