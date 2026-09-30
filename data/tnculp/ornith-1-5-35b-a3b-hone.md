# tnculp/Ornith-1.5-35B-A3B-hone

## Resumen

Ornith-1.5-35B-A3B-hone es una conversion de pesos del modelo Ornith-1.5-35B-A3B (desarrollado por ornith-ai) al contenedor `.hone`, un formato propietario del servidor de inferencia monogpu hone, mantenido por tnculp. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos se recodifican con el perfil de cuantizacion `groupwise-int-compact`, que almacena la mayor parte de los tensores en INT8 agrupado y traslada las 40 proyecciones down del MoE enrutado, el embedding de tokens y la cabeza de salida a Q4 agrupado (grupo 64). El objetivo es que el contexto completo de 262.144 tokens quepa junto a los pesos en una tarjeta de 24 GB.

El modelo base es un MoE de 35.000 millones de parametros totales con unos 3.000 millones activos por token (de ahi la nomenclatura A3B), entrenamiento continuado de Qwen3.6-35B-A3B (Apache-2.0). El repositorio ocupa 20,5 GB y contiene un unico fichero de pesos, `ornith_1_5_35b_a3b_compact.hone`, de 20.533.031.424 bytes, acompanado del arbol de vision, el tokenizador, la plantilla de chat y la cabeza MTP para decodificacion especulativa.

Es relevante porque demuestra un patron de despliegue muy concreto: cuantizacion agrupada selectiva por tipo de tensor para sostener ventanas de contexto de 256K en hardware de consumo o gama profesional baja, asumiendo un coste medido de aproximadamente un 2,5 % de perplejidad (y un 0,5 % en codigo) frente al artefacto sin cuantizar. Su principal restriccion es que el fichero solo funciona con el runtime hone; no es intercambiable con llama.cpp, vLLM ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; tag `qwen3_5_moe`; derivado de Qwen3.6-35B-A3B |
| Parametros totales | 35B (segun la nomenclatura del modelo base, Ornith-1.5-35B-A3B) |
| Parametros activos | ~3B (nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Perfil `groupwise-int-compact`: INT8 agrupado en la mayoria de tensores; Q4 agrupado (grupo 64) en las 40 proyecciones down del MoE enrutado, el embedding de tokens y la cabeza de salida. KV cache con dtype `rk4v4-e8` |
| Idiomas soportados | no disponible |
| Licencia | MIT (el modelo base es entrenamiento continuado de Qwen3.6-35B-A3B, Apache-2.0) |
| Formato de pesos | `.hone` (contenedor propietario de hone); no compatible con otros runtimes |
| Tamano del artefacto | 20.533.031.424 bytes (~20,5 GB / ~19,1 GiB) |
| sha256 | `a23f0e8c9d7d6c1bc8728782c63c64d7aab4146c5b531d0ac245f07a746cab22` |
| Commit de origen | `ornith-ai/Ornith-1.5-35B-A3B` @ `10fbf86fed7ecee4a061f8b499a618f46001cac1` |
| Identidad interna | `ornith-1.5-35b-a3b / groupwise-int-compact` |

## Arquitectura y entrenamiento

La conversion no modifica la topologia del modelo base: se re-codifican los pesos. El modelo subyacente es un transformer con capas de mezcla de expertos, 35B de parametros totales y ~3B activos por token, lo que lo situa en la categoria de MoE disperso de coste de inferencia bajo. Los tags del repositorio lo etiquetan como `qwen3_5_moe`, mientras que el README del autor describe el modelo base como un entrenamiento continuado de Qwen3.6-35B-A3B (Apache-2.0); existe por tanto una discrepancia nominal entre ambos datos que conviene verificar en la model card de ornith-ai.

La innovacion tecnica de este artefacto es la receta de cuantizacion por grupos y por rol de tensor. El perfil `groupwise-int-compact` aplica INT8 agrupado al grueso de la red y degrada deliberadamente a Q4 (grupo 64) solo los tensores con mayor impacto en memoria: las 40 proyecciones down de los expertos enrutados, el embedding de tokens y la cabeza de salida. El resultado es un artefacto de ~20,5 GB que, segun el autor, permite mantener el contexto de 262.144 tokens en una GPU de 24 GB. Se incluye la cabeza MTP (multi-token prediction), un cabezal propuesto para decodificacion especulativa, junto con el arbol de vision, el tokenizador y la plantilla de chat. El fichero `conversion.json` registra los hashes de todos los ficheros de origen y la receta exacta del conversor, lo que hace la conversion auditable. No se documentan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Ornith-1.5-35B-A3B.
- Procesamiento multimodal: el artefacto incluye el arbol de vision, por lo que el modelo base admite entrada de imagenes.
- Decodificacion especulativa mediante la cabeza MTP incluida, configurable con `--spec mtp --draft-tokens 2 --lm-head-draft`.
- Contexto largo de hasta 262.144 tokens, con KV cache en `rk4v4-e8` y `--host-kv-mib 2048`.
- Tool calling y function calling: los materiales de terceros consultados describen el modelo base como orientado a bucles interactivos y llamada a herramientas de alto volumen.
- Uso en agentes: descrito en guias externas como componente de stacks de agentes, con soporte de tool calling.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multiturno con documentos de referencia extensos dentro de la ventana de 262.144 tokens, lo que permite inyectar manuales o historiales completos sin troceado agresivo.
- Agentes con tool calling de alto volumen: su naturaleza MoE con ~3B activos reduce el coste por token, y el soporte de function calling lo hace adecuado para orquestadores que encadenan muchas llamadas a APIs en bucles interactivos.
- Analisis de repositorios de codigo: con 256K de contexto se pueden cargar varios ficheros fuente simultaneamente y pedir refactorizaciones o explicaciones que crucen modulos; el autor reporta solo un 0,5 % de degradacion de perplejidad en codigo respecto al artefacto sin cuantizar.
- Procesamiento de documentos largos con imagenes: al incluir el arbol de vision, sirve para resumir informes con graficos o capturas incrustadas junto al texto completo del documento.
- Despliegue en estacion de trabajo monogpu: al caber en 24 GB de VRAM con el contexto completo, es viable ejecutarlo localmente para prototipado de agentes sin depender de APIs externas.
- Generacion asistida con decodificacion especulativa: activando `--spec mtp --draft-tokens 2` se puede reducir la latencia por token en cargas interactivas, a costa de reservar memoria para el cabezal de borrador.
- Auditoria y trazabilidad de artefactos: el `conversion.json` con hashes de origen y receta permite reproducir y verificar la conversion en entornos con requisitos de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento aportado por el autor es la degradacion relativa del perfil `groupwise-int-compact` frente al artefacto sin cuantizar: aproximadamente un 2,5 % de perplejidad adicional en general y un 0,5 % en codigo. No se especifica la metodologia ni el conjunto de evaluacion empleado para medirla.

## Requisitos de hardware

- VRAM estimada: ~20,5 GB para los pesos, con el requisito declarado de que el contexto de 262.144 tokens quepa en una GPU de 24 GB; el autor reserva 2.048 MiB de KV en host (`--host-kv-mib 2048`).
- GPU objetivo: cualquier tarjeta con 24 GB de VRAM. Dado ese umbral, encajan modelos como RTX 3090, RTX 4090, A5000 o L4 (24 GB); se trata de una deduccion a partir del requisito declarado, no de una lista publicada por el autor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB, segun el propio autor.
- Opciones de despliegue: exclusivamente hone, mediante `hone-serve.exe` o el instalador `install.ps1`, que descarga este fichero por defecto. El artefacto `.hone` no es utilizable con otros runtimes. El modelo base si dispone de variantes GGUF (llama.cpp, Ollama) y MLX de 6 bits, pero esas no son este fichero.
- Parametros de ejecucion documentados: `--max-context 262144 --kv-capacity 262144 --kv-dtype rk4v4-e8 --spec mtp --draft-tokens 2 --lm-head-draft --host-kv-mib 2048`.
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP se ofrece como mecanismo de mejora de velocidad, pero sin cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de modelos terceros comparables en la informacion proporcionada. Como referencia interna de la misma familia se pueden contrastar los siguientes artefactos, teniendo en cuenta que son derivados y no alternativas independientes:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tnculp/Ornith-1.5-35B-A3B-hone | 35B totales / ~3B activos | 262.144 tokens | MIT | `.hone` | Perfil `groupwise-int-compact`, ~20,5 GB, solo runtime hone |
| ornith-ai/Ornith-1.5-35B-A3B | 35B totales / ~3B activos | no disponible | MIT | safetensors (presumible, no confirmado) | Modelo base sin cuantizar; el autor lo usa como referencia de perplejidad |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit | 35B totales / ~3B activos | no disponible | MIT (heredada del base) | MLX 6 bits | Variante para el ecosistema Apple MLX; sin datos de rendimiento publicados en la informacion disponible |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | Apache-2.0 | no disponible | Modelo antecesor sobre el que se hizo entrenamiento continuado |

## Limitaciones y advertencias

- Portabilidad nula: el fichero `.hone` solo funciona con el servidor hone. No se puede cargar en llama.cpp, vLLM, TGI, Ollama ni transformers.
- Cuantizacion con perdida: el autor reconoce un coste de ~2,5 % de perplejidad (0,5 % en codigo) frente al artefacto sin cuantizar; la degradacion puede ser mayor en tareas de razonamiento largo o de generacion de codigo complejo.
- Trazabilidad limitada: el repositorio no tiene descargas ni likes y no se han publicado evaluaciones independientes ni resultados de benchmarks.
- Discrepancia de nomenclatura: los tags indican `qwen3_5_moe` mientras que el README cita Qwen3.6-35B-A3B como base; conviene verificar la ascendencia exacta antes de usarlo en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a cualquier modelo generativo de esta familia.
- Sesgos: no documentados en la informacion disponible.
- Cobertura de idiomas: no disponible; no hay confirmacion de soporte de castellano ni de otras lenguas.
- Licencia: MIT, lo que en principio permite uso comercial, pero el modelo base es un entrenamiento continuado de Qwen3.6-35B-A3B (Apache-2.0) y el autor no detalla obligaciones de atribucion adicionales; conviene revisar ambas licencias antes de un despliegue comercial.
- Madurez: repositorio creado y actualizado el 2026-09-29, sin adopcion registrada; no hay evidencia de uso en produccion.
- Memoria del host: la configuracion documentada reserva 2.048 MiB de KV en el host, por lo que el requisito real no es solo la VRAM de la GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tnculp/Ornith-1.5-35B-A3B-hone
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MLX 6 bits del base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Repositorio del runtime hone: https://github.com/tnculp/hone
- Guia de ejecucion local de Ornith-1.5-35B: https://aiindigo.com/tutorials/getting-started-with-ornith-1-5-35b-running-a-35b-model-locally
- Guia de configuracion para agentes: https://www.betterclaw.io/blog/ornith-1-5-35b-agent-setup-guide
- Ficha del modelo en el roster de tiyuvta: https://inference.tiyuvta.ai/models/ornith-1-5
