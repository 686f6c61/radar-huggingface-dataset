# wchai/cycles-h100-nrc-bake

## Resumen

`wchai/cycles-h100-nrc-bake` es un repositorio de pesos preentrenados (baked) de Neural Radiance Caches (NRC) para el motor de renderizado Cycles de Blender 5.3.0. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de artefactos de inferencia especializados que se cargan congelados antes de un render cronometrado para acelerar la convergencia del ruido en escenas concretas. El autor, `wchai`, los publica como parte del trabajo experimental `cycles-h100` (rama `wenhaochai/5-v53`), orientado a medir ganancias de rendimiento en GPU H100.

El repositorio contiene, por cada escena de Open Data (monster, junkshop y classroom), un fichero `.nrc` con el estado de la caché (tablas de codificación, pesos de la MLP y escala de salida) para cada regla de terminación (`c0`, `d1`, `d2`, `dd`, `def`, `m2`, `m3`), además de un fichero `run_wgmma.json` con la configuración del motor usada en tiempo de render. Los resultados publicados en la model card indican que la regla `dd` aporta un +12.5 % de mejora y supera las tres escenas, mientras que `def` alcanza +15.8 % pero falla en junkshop.

La relevancia es acotada pero clara para quien trabaje en renderizado con trazado de caminos: demuestra que una NRC entrenada offline y congelada en inferencia puede reducir el coste de muestreo en Cycles sobre hardware H100, con un formato de pesos propietario del fork y una licencia Apache 2.0 que facilita su reutilización experimental. El tamaño del repositorio es de 0,6 GB y no declara pipeline, idiomas ni métricas de benchmarks convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural Radiance Cache (NRC): tablas de codificacion + MLP, integrada en el motor Cycles de Blender 5.3.0 (kernel `nrc5`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato propio `.nrc`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.nrc` (estado de cache: tablas de codificacion, pesos MLP, escala de salida) + `run_wgmma.json` (config del motor) |

## Arquitectura y entrenamiento

La NRC es una cache neuronal de radiancia que aprende a predecir la radiancia incidente en puntos del espacio para reducir el ruido del trazado de caminos. En este caso, cada fichero `<scene>/bake_<rule>.nrc` contiene el estado completo de la cache entrenada offline para una escena y una regla de terminación concretas: tablas de codificación, pesos de la red MLP y factor de escala de salida. En tiempo de render, la cache se carga congelada mediante las variables de entorno `CYCLES_NRC_LOAD=<file>` y `CYCLES_NRC_FREEZE=1`, de modo que no hay entrenamiento online durante el render cronometrado.

El trabajo se apoya en un fork específico de Blender 5.3.0 (rama `wenhaochai/5-v53`) con parches de host (`v53/patches/hosts/host-bake.diff`), un parche de kernel (`v53/patches/blender-5.3.0-kernel-nrc5.diff`) y un motor propio (`v53/nrc-bake/`). La configuración de render usada se documenta en `run_wgmma.json`. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO, algo que no aplica a este tipo de modelo.

## Capacidades

- Aceleración de render con trazado de caminos en Cycles (Blender 5.3.0) mediante cache neuronal de radiancia preentrenada.
- Carga de pesos congelados en tiempo de render (`CYCLES_NRC_FREEZE=1`), sin coste de entrenamiento durante la medición.
- Soporte de múltiples reglas de terminación por escena: `c0`, `d1`, `d2`, `dd`, `def`, `m2`, `m3`.
- Cobertura de tres escenas de Open Data: monster, junkshop y classroom.
- Configuración de motor reproducible mediante `run_wgmma.json`.
- Orientado a GPUs H100 (resultados publicados sobre base `bhotB`, regla de imagen 4096 spp).
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Investigación en renderizado neuronal: comparar reglas de terminación (`dd` frente a `def`, `d1`, `c0`) sobre las mismas escenas para estudiar el compromiso entre velocidad y calidad de convergencia.
- Reproducción de experimentos en H100: cargar los pesos congelados y la configuración `run_wgmma.json` para replicar los resultados publicados (+12.5 % con `dd`, +15.8 % con `def`) en la base `bhotB` a 4096 spp.
- Evaluación de NRC en producción de animación: usar la cache `dd`, que supera las tres escenas, como punto de partida para reducir el número de muestras necesarias por fotograma.
- Desarrollo de parches en el fork de Cycles: servir de referencia para validar los parches `host-bake.diff` y `kernel-nrc5.diff` antes de integrarlos en una build propia.
- Estudio de generalización entre escenas: analizar por qué `def` falla en junkshop pero rinde mejor en las otras dos, lo que informa sobre la sensibilidad de la cache a la geometría y los materiales.
- Docencia y divulgación técnica: ilustrar el funcionamiento de una neural radiance cache con artefactos reales y comandos de carga reproducibles.

## Benchmarks y rendimiento

Resultados publicados en la model card (base `bhotB`, regla de imagen 4096 spp, GPU H100):

| Regla de terminacion | Mejora de velocidad | Supera las 3 escenas |
|---|---|---|
| `dd` | +12.5 % | Si |
| `def` | +15.8 % | No (falla en junkshop) |
| `d1` | 1.7-2.1x mas rapido | No |
| `c0` | 1.7-2.1x mas rapido | No |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,6 GB en disco y los pesos se cargan en memoria de GPU junto con la escena.
- GPU recomendadas: NVIDIA H100, que es el hardware sobre el que se publican los resultados.
- Compatibilidad con GPU de consumo: no disponible; no se documenta funcionamiento en RTX 4090 u otras consumer GPU.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI; el despliegue se realiza mediante el fork de Blender 5.3.0 con el kernel `nrc5` y el motor `v53/nrc-bake/`.
- Latencia y throughput: la model card reporta mejoras relativas (+12.5 % con `dd`, +15.8 % con `def`, 1.7-2.1x con `d1`/`c0`), pero no se publican valores absolutos de latencia ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `wchai/cycles-h100-nrc-bake` | NRC para Cycles 5.3.0 | no disponible | no aplica | +12.5 % (`dd`), +15.8 % (`def`), 1.7-2.1x (`d1`/`c0`) en H100 | Apache 2.0 | Hugging Face |
| Otras NRC para Cycles | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Denoisers de imagen para render (p. ej. OIDN) | post-proceso | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría; los datos de modelos comparables figuran como no disponibles.

## Limitaciones y advertencias

- Los pesos están atados a escenas concretas (monster, junkshop, classroom) y a Blender 5.3.0; no son generalizables a otras escenas sin reentrenamiento.
- La regla `def`, pese a su mayor mejora (+15.8 %), falla en junkshop, por lo que no es apta como configuración universal.
- Las reglas `d1` y `c0` son 1.7-2.1x más rápidas pero no superan el criterio de calidad; su uso en producción requiere validación adicional.
- Requiere un fork específico de Blender y parches de host y kernel; no funciona con una build estándar de Cycles.
- Solo se han validado resultados en GPU H100; el comportamiento en otras GPU no está documentado.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas por no ser un modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del fork y de los parches puede condicionar su integración en pipelines propietarios.
- No se publican métricas absolutas de latencia ni de calidad perceptual, solo mejoras relativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wchai/cycles-h100-nrc-bake
- Rama del trabajo: `wenhaochai/5-v53` (referenciada en la model card; URL no disponible)
- Documentación de análisis: `v53/analysis/nrc_bake.md` (ruta interna, URL no disponible)
- Lista de tareas: `v53/units/enrcbq.tsv` (ruta interna, URL no disponible)
- Parche de host: `v53/patches/hosts/host-bake.diff` (ruta interna, URL no disponible)
- Parche de kernel: `v53/patches/blender-5.3.0-kernel-nrc5.diff` (ruta interna, URL no disponible)
- Motor de bake: `v53/nrc-bake/` (ruta interna, URL no disponible)
