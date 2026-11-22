# theatechcorporation/amaara-code-20b-r7-FP8

## Resumen

Amaara Code 20B r7 es un ajuste fino (fine-tune) orientado a agentes de programación del modelo `openai/gpt-oss-20b`, desarrollado por The A Tech Corporation (theatechcorporation). El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de aproximadamente 21.000 millones de parametros totales y unos 3.600 millones de parametros activos por token. Esta version concreta del repositorio se distribuye en formato FP8 (el nombre del repo incluye el sufijo `-FP8`), lo que reduce el peso del repositorio a unos 20,9 GB.

El modelo esta especializado en tareas de agente de codigo: edicion de ficheros, ejecucion de tests, autocorreccion de errores y function calling, con la plantilla de chat Harmony propia de la familia gpt-oss. Segun la model card, todas las variantes de la familia Amaara Code se entrenan sobre el mismo corpus canonico de conversaciones, de modo que las comparaciones entre tamanos sean atribuibles al modelo y no a los datos.

Es relevante ahora porque el autor lo marca explicitamente como **lanzamiento experimental**, destinado unicamente a evaluacion y uso experimental, con prohibicion de uso en produccion hasta que se publiquen las versiones oficiales. La licencia combina una licencia propia (A-TECH Model License) que se aplica de forma adicional a la licencia Apache-2.0 del modelo base de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basada en openai/gpt-oss-20b |
| Parametros totales | ~21B (aproximadamente 21.000 millones) |
| Parametros activos | ~3,6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); la familia incluye tambien GGUF y MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | a-tech-model-license-plus-upstream (A-TECH Model License + Apache-2.0 upstream) |
| Formato de pesos | FP8 (repositorio de 20,9 GB); familia con variantes GGUF y MXFP4 |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-20b`, un transformer con capas Mixture-of-Experts en el que solo una fraccion de los parametros (~3,6B de ~21B) se activa por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Sobre esta base, The A Tech Corporation aplica un ajuste fino supervisado orientado a trazas de agente de codigo.

El entrenamiento se realiza sobre un unico corpus canonico de conversaciones compartido por toda la familia Amaara Code (4B, este 20B y Amaara Code Flash). Segun la model card, la seleccion de datos se hace por *forma de trayectoria*: se conservan las trazas verificadas de tipo editar→test→pasar y las de autocorreccion; se descartan las trazas de editar-y-parar sin verificacion; y las trazas largas se recortan en ventana alrededor del tramo editar→verificar en lugar de descartarse. La unica diferencia entre tamanos es la plantilla de chat: Harmony para este modelo, Qwen ChatML para el 4B y GLM para Amaara Code Flash. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de codigo y edicion de ficheros en flujos de agente (editar, ejecutar tests, verificar y autocorregirse).
- Function calling / tool calling, segun los tags del repositorio (`function-calling`).
- Comportamiento de agente de codigo multi-paso (razonamiento iterativo con verificacion).
- Autocorreccion de errores a partir de trazas de entrenamiento verificadas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion disponible.

## Casos de uso

- Reparacion automatica de bugs en repositorios: el modelo esta entrenado sobre trazas editar→test→pasar, por lo que encaja en pipelines que reciben un issue, localizan el fichero, aplican el parche y validan con la suite de tests.
- Agente de CI/CD para correccion de tests rotos: puede integrarse como paso posterior al fallo de un job, proponiendo el parche y reejecutando la verificacion.
- Asistente de refactorizacion guiada por tests: el sesgo del entrenamiento hacia trayectorias verificadas favorece cambios acotados y comprobables en lugar de reescrituras amplias.
- Automatizacion de tareas de mantenimiento de codigo (actualizacion de dependencias, migraciones de API) en las que el agente debe editar varios ficheros y confirmar con pruebas.
- Integracion en IDE o CLI de agente (el autor evalua con A-Coder-CLI), usando function calling para invocar herramientas de sistema de ficheros y terminal.
- Evaluacion e investigacion de ajustes finos sobre gpt-oss-20b: al compartir corpus con las otras variantes de la familia, sirve para estudiar el efecto del tamano y de la plantilla de chat sobre el rendimiento en tareas de agente.
- Prototipado de flujos de agente con contexto de repositorio: adecuado en entornos de desarrollo y pruebas, no en produccion segun la advertencia del autor.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo con A-Coder-CLI sobre una suite de 20 tareas derivada de SWE-bench usando el arnes del proyecto, y afirma explicitamente que no declara ninguna puntuacion no medida. Sin embargo, no se incluyen cifras numericas en la informacion proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 20,9 GB, por lo que la inferencia en FP8 requiere del orden de 21-24 GB de VRAM solo para pesos, mas overhead de contexto y cache KV. No disponible una cifra oficial del autor.
- GPU recomendadas para FP8: A100, H100, L40S y GPUs consumer con soporte FP8 nativo (serie RTX 40 en adelante). En GPUs sin FP8 nativo puede requerirse conversion a otro formato.
- GPU consumer: en FP8 no cabe con holgura en GPUs de 16 GB; encaja en modelos de 24 GB (RTX 3090/4090) con margen limitado. Para GPUs menores, las variantes GGUF de la familia permiten cuantizaciones mas agresivas (el autor recomienda elegir el mayor quant que quepa en el dispositivo).
- Opciones de despliegue: `transformers` (libreria declarada); el autor menciona `llama.cpp` implicitamente via GGUF y evalua con A-Coder-CLI. Soporte explicito de vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. Como referencia estructural, al ser MoE con ~3,6B parametros activos, el coste de computo por token es inferior al de un modelo denso de 21B, aunque el requisito de memoria para pesos sigue siendo el del total.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amaara Code 20B r7 FP8 | ~21B | ~3,6B | no disponible | A-TECH + Apache-2.0 | Hugging Face (experimental) |
| openai/gpt-oss-20b (base) | ~21B | ~3,6B | no disponible | Apache-2.0 | Hugging Face |
| Amaara Code 4B | no disponible | no disponible (probablemente denso) | no disponible | A-TECH + upstream | Hugging Face |
| Amaara Code Flash | no disponible | no disponible | no disponible | A-TECH + upstream | Hugging Face |

La comparacion mas directa es con su modelo base `openai/gpt-oss-20b`, del que hereda arquitectura, tamano y licencia upstream, diferenciandose por el ajuste fino en trazas de agente de codigo. Frente a las otras variantes de la familia Amaara Code, la diferencia principal es el tamano y la plantilla de chat (Harmony, Qwen ChatML o GLM). Datos de rendimiento comparado: no disponible.

## Limitaciones y advertencias

- **Lanzamiento experimental**: el autor prohibe explicitamente el uso en produccion hasta que se publiquen las versiones oficiales; los pesos se publican solo para evaluacion.
- Licencia compuesta: la A-TECH Model License se aplica de forma adicional a la Apache-2.0 upstream. Aunque el autor afirma que las concesiones upstream fluyen y que el umbral de ingresos no bloquea los pesos, conviene revisar el texto completo de la licencia para uso comercial.
- Longitud de contexto no documentada en la informacion disponible, lo que impide planificar tareas de repositorio grande.
- Idiomas soportados no documentados; el ajuste fino esta centrado en tareas de codigo, por lo que el rendimiento en lenguaje natural general puede degradarse respecto al modelo base.
- Riesgo de alucinacion en codigo no verificado: el entrenamiento prioriza trayectorias verificadas, pero el modelo puede producir parches que no compilan o que pasan tests sin resolver el problema real; se recomienda validacion automatica obligatoria.
- Sesgos: no documentados por el autor; al heredar el modelo base, puede arrastrar los sesgos de este.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni reportes independientes de calidad.
- El autor mantiene un enlace promocional a una comunidad de pago (Skool) en la model card; no afecta tecnicamente al modelo pero conviene separar el material promocional de la documentacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-r7-FP8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Licencia A-TECH Model License: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Herramienta de evaluacion A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad del autor (Skool): https://www.skool.com/open-source-ai-builders-club/about
