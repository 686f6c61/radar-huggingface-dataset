# zjlergf/latent-bypass-lrs

## Resumen

`zjlergf/latent-bypass-lrs` no es un modelo de lenguaje al uso, sino un repositorio de código, resultados y pesos reparados en torno al fenómeno del *latent bypass* en modelos de razonamiento visual latente. El autor, identificado como `zjlergf`, publica aquí la línea de reparación LRS (level-wise repair) aplicada a modelos ya liberados como LVR-7B y Silence-LVR, junto con los pesos resultantes en formato Hugging Face. El problema que aborda es concreto: en modelos que generan latentes visuales intermedios para razonar, parte de la ganancia de precisión puede deberse a atajos que evitan usar realmente esos latentes, de modo que el modelo rinde bien sin que el mecanismo latente aporte nada.

El repositorio incluye el paquete de código (`lrs/`, `scripts/lrs/`, `configs/lrs/`), un paquete de evaluación compartido (`lue/`) y un entrenador de RL (`ltpo/`), además de resultados de cribado a nivel de datos, pruebas de diagnóstico antes y después de la reparación, configuraciones y métricas de entrenamiento, registros por ítem de una evaluación de seis benchmarks y dos informes. Los pesos reparados corresponden a LVR-7B y Silence-LVR tras LRS v3 (SFT) y tras LRS-R (SFT + RL).

La relevancia es metodológica: el autor reporta que, bajo un cuello de botella de evidencia en V*, la diferencia entre usar latentes propios y latentes donados es de +27,0 pp en LVR-7B y +37,4 pp en Silence-LVR tras LRS-R, lo que sugiere que la reparación aumenta la dependencia real del modelo respecto a sus propios latentes. Se trata de un único run por modelo, sin réplicas de semilla, y el repositorio pesa 0,0 GB, por lo que los pesos anunciados no están materialmente presentes en el snapshot indexado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos base derivados de LVR-7B y Silence-LVR; arquitectura de estos no detallada en la informacion) |
| Parametros totales | 7B en los modelos base (LVR-7B, Silence-LVR); no disponible para el resto |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; los pesos reparados heredan la licencia de los modelos originales («those models' licenses apply») |
| Formato de pesos | safetensors (formato Hugging Face) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de los modelos base, sino la metodología de reparación. LRS se organiza en dos niveles: generación de latentes y utilización de latentes, precedidos por un cribado a nivel de datos (`screen_v2`, `screen_v3`). Sobre esa base se aplica una etapa de ajuste supervisado (LRS v3) y, opcionalmente, una etapa de aprendizaje por refuerzo con el entrenador `ltpo/` (LRS-R). El diagnóstico se realiza mediante pruebas de intercambio de latentes (swap tests) en condiciones de cuello de botella abierto y de evidencia, una sonda de cuello de botella V* y una sonda de computabilidad.

Los datos de entrenamiento no se detallan en la información disponible: el autor indica que los checkpoints, datasets y código de terceros no se incluyen y se descargan mediante `scripts/prepare_assets.py` y `scripts/lrs/fetch_*.py` con revisión fijada. Los runs documentados cubren LVR-7B, Silence-LVR, Mirage-VSP (LRS v3 SFT), LVR-7B y Silence-LVR tras la etapa RL, y las releases WM-VLM-2D/3D, que según el autor no presentan bypass. No se especifican volúmenes de tokens ni composición del dataset.

## Capacidades

- Reparación de modelos de razonamiento visual latente ya liberados, en dos niveles (generación y utilización de latentes).
- Diagnóstico de *latent bypass* mediante pruebas de intercambio de latentes propios frente a latentes de otro ítem.
- Sonda de cuello de botella V* para medir la dependencia efectiva del modelo respecto a sus latentes.
- Sonda de computabilidad para verificar que el modelo procesa el contenido latente.
- Cribado a nivel de datos, con variantes v2 y v3 (esta última por organización colaboradora) y comprobación de especificidad del objetivo.
- Entrenamiento en dos fases: SFT (LRS v3) y SFT + RL con `ltpo/` (LRS-R).
- Evaluación sobre seis benchmarks con seis condiciones: nativa, latentes propios forzados, latentes de otro ítem, sin bloque, oráculo y (según la tabla) condiciones derivadas.
- Generación de texto y razonamiento visual en los modelos base; no se documentan tool calling, function calling, capacidades de agente ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Auditoría de modelos de razonamiento visual latente: aplicar las pruebas de intercambio de latentes para determinar si un modelo publicado usa realmente sus latentes o si su rendimiento proviene de atajos. El paquete `lue/` y los scripts de `scripts/lrs/` permiten reproducir el protocolo sobre checkpoints propios.
- Reparación de checkpoints en producción: aplicar LRS v3 (SFT) sobre un modelo con bypass diagnosticado para incrementar la utilización de latentes; el autor reporta mejoras de 65,6 a 65,2 y de 65,7 a 67,0 en precisión media nativa para LVR-7B y Silence-LVR respectivamente.
- Refuerzo de la dependencia latente: aplicar la etapa RL (LRS-R) cuando se necesita que el modelo dependa de sus propios latentes; en el cuello de botella de evidencia sobre V*, la diferencia latentes propios menos latentes donados alcanza +27,0 pp (LVR-7B) y +37,4 pp (Silence-LVR).
- Investigación en interpretabilidad de razonamiento visual: usar la sonda de cuello de botella V* y la sonda de computabilidad para estudiar qué información codifican los latentes y en qué capas se utiliza.
- Replicación de experimentos de RL para modelos multimodales: el entrenador `ltpo/` y las configuraciones en `results/ltpo/runs` sirven como base para reproducir la fase RL sobre otros checkpoints.
- Evaluación comparativa de releases: los registros por ítem en `results/lrs_eval` permiten comparar checkpoints liberados y reparados bajo condiciones controladas (nativa, latentes forzados, latentes ajenos, sin bloque, oráculo).
- Cribado de datasets de entrenamiento: `screen_v2` y `screen_v3` permiten filtrar datos que inducen bypass antes de entrenar un modelo nuevo.

## Benchmarks y rendimiento

Precisión media nativa sobre seis benchmarks, según la tabla del autor:

| Modelo | Release | LRS v3 (SFT) | LRS-R (SFT + RL) |
|---|---|---|---|
| LVR-7B | 65,6 | 65,2 | 66,8 |
| Silence-LVR | 65,7 | 67,0 | 68,0 |

Diferencia de precisión entre latentes propios y latentes donados bajo el cuello de botella de evidencia en V*, tras LRS-R: +27,0 pp (LVR-7B) y +37,4 pp (Silence-LVR).

El autor advierte de que se trata de un único run por modelo, sin réplicas de semilla, y que los registros de las familias Monet y LanteRn están incompletos por una ejecución interrumpida. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo de 7B en safetensors, la inferencia en fp16 requiere del orden de 14 GB solo para pesos, sin contar caché KV ni overhead; el autor no publica estimaciones.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no se documenta cuantización ni despliegue en hardware de consumo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio está orientado a ejecución de scripts de investigación (`scripts/lrs/`, `scripts/prepare_assets.py`, `code/scripts/server/site.env` para configuración por máquina).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media nativa (6 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LVR-7B (release) | 7B | no disponible | 65,6 | no disponible | checkpoint de terceros, descarga vía script |
| LVR-7B + LRS-R | 7B | no disponible | 66,8 | heredada del modelo original | pesos en `weights/` |
| Silence-LVR (release) | 7B | no disponible | 65,7 | no disponible | checkpoint de terceros, descarga vía script |
| Silence-LVR + LRS-R | 7B | no disponible | 68,0 | heredada del modelo original | pesos en `weights/` |
| Mirage-VSP (LRS v3 SFT) | no disponible | no disponible | no disponible | no disponible | solo resultados de sonda |
| WM-VLM-2D/3D | no disponible | no disponible | no disponible | no disponible | releases sin bypass según el autor |

No se dispone de datos de contexto, cuantización ni benchmarks estándar de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Un solo run por modelo y sin réplicas de semilla: las diferencias reportadas (por ejemplo, 65,6 frente a 65,2 en LVR-7B con LRS v3) no tienen estimación de varianza y podrían no ser significativas.
- Los registros de evaluación de las familias Monet y LanteRn están incompletos por una ejecución interrumpida, lo que limita la comparación entre familias.
- El autor excluye explícitamente iteraciones superadas (LRS v1, v2), la reparación fallida de WM-VLM, los smoke runs y el intento v5 interrumpido; no se documentan esos resultados negativos.
- Los pesos reparados son derivados de modelos de terceros y quedan sujetos a las licencias de esos modelos, que no se especifican en el repositorio. Verificar la licencia del modelo base antes de cualquier uso comercial.
- El repositorio indexado pesa 0,0 GB: los pesos anunciados en `weights/` no están presentes en el snapshot, por lo que la descarga puede fallar o requerir los checkpoints originales.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinación ni comportamiento fuera del dominio de razonamiento visual.
- El alcance es de investigación: no hay pipeline declarado, ni guía de despliegue, ni garantías de producción.
- La reproducibilidad depende de descargar assets de terceros con revisión fijada mediante scripts; cambios en los repositorios de origen pueden romper la reproducción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zjlergf/latent-bypass-lrs
- Documentación del método en el repositorio: `docs/LRS_METHOD.md` (ruta interna, sin URL pública disponible)
- Informes del autor: `results/lrs_report` (rutas internas del repositorio, sin URL pública disponible)
- No se han encontrado papers, blogs, demos ni repositorios externos en la información proporcionada.
