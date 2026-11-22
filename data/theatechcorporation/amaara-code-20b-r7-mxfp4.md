# theatechcorporation/amaara-code-20b-r7-MXFP4

## Resumen

Amaara Code 20B r7 es un ajuste fino (fine-tune) orientado a agentes de programación sobre el modelo base `openai/gpt-oss-20b`. Lo desarrolla theatechcorporation, un proyecto que publica variantes del mismo corpus de conversaciones en distintos tamanos y arquitecturas. El modelo hereda la arquitectura Mixture-of-Experts (MoE) del gpt-oss-20b, con aproximadamente 21.000 millones de parametros totales y unos 3.600 millones activos por token, y se distribuye en el repositorio con el sufijo `-MXFP4`, es decir, pesos cuantizados en formato MXFP4.

El objetivo declarado es el entrenamiento y evaluacion de agentes de codigo capaces de ejecutar ciclos edit→test→pass y de autocorregirse. Segun la model card, el corpus de entrenamiento se filtra por "forma de trayectoria": se conservan las trazas verificadas de edicion, prueba y exito, y se descartan las trazas de edicion sin verificacion. Es relevante ahora porque se publica como version experimental, con la advertencia explicita de no usar en produccion hasta que existan versiones estables.

La licencia es doble: una licencia propia (A-TECH Model License) que se aplica de forma adicional, nunca en sustitucion, de la licencia Apache-2.0 del modelo upstream. El repositorio incluye ambos textos legales. La model card no aporta resultados numericos de benchmarks, solo menciona que la evaluacion se realizo con su propio arnes sobre un conjunto de 20 tareas derivadas de SWE-bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), heredada de openai/gpt-oss-20b |
| Parametros totales | ~21.000 millones (aprox. 21B) |
| Parametros activos | ~3.600 millones (aprox. 3,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (este repositorio); la model card menciona ademas variantes GGUF (Q8_0 como referencia de fidelidad y cuantizaciones inferiores) y FP8 en otros repositorios |
| Idiomas soportados | no disponible |
| Licencia | A-TECH Model License (propia) en adicion a Apache-2.0 del upstream; identificador `a-tech-model-license-plus-upstream` |
| Formato de pesos | MXFP4 (repositorio actual); existen variantes GGUF y FP8 en otros repositorios del mismo autor |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-20b`, un transformer con capas MoE donde solo se activa una fraccion de los parametros por token (aproximadamente 3,6B de 21B). El ajuste fino se realiza sobre un corpus canonico de conversaciones compartido por todas las variantes de la familia Amaara Code; la unica diferencia entre tamanos es la plantilla de chat, que en este caso es Harmony (la de gpt-oss), frente a Qwen ChatML en la variante de 4B o GLM en Amaara Code Flash. Esto permite, segun el autor, atribuir las diferencias de rendimiento entre tamanos al modelo y no a los datos.

La seleccion de datos se hace por forma de trayectoria: se conservan las trazas verificadas de edicion, prueba y exito, asi como las de autocorreccion; se descartan las trazas de edicion sin verificacion posterior; y las trazas largas no se eliminan, sino que se recortan en ventanas alrededor del tramo final de edicion y verificacion. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion o atencion mas alla de las que ya incorpora el modelo base.

## Capacidades

- Generacion de codigo y edicion de ficheros dentro de flujos de agente.
- Ejecucion de ciclos edit→test→pass con autocorreccion, segun el criterio de seleccion del corpus de entrenamiento.
- Soporte de function calling y tool calling (etiqueta `function-calling` en el repositorio).
- Comportamiento orientado a agentes de codigo (etiqueta `coding-agent`), incluyendo razonamiento multi-paso sobre trayectorias largas.
- Compatibilidad con plantilla de chat Harmony, la del modelo base gpt-oss.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de correccion de errores en CI: el modelo puede recibir el fallo de una prueba, localizar el fichero afectado, proponer un parche y volver a ejecutar la suite, aprovechando que fue entrenado con trazas verificadas de edit→test→pass.
- Automatizacion de tareas de refactorizacion acotadas: dado un objetivo concreto (renombrar una API, extraer un modulo), el modelo puede encadenar ediciones con llamadas a herramientas de busqueda y compilacion.
- Asistente de desarrollo integrado en el editor mediante function calling: el modelo invoca herramientas de lectura de ficheros, ejecucion de tests y aplicacion de diffs, en lugar de limitarse a generar texto.
- Evaluacion e investigacion de agentes de codigo: al publicarse como version experimental con un arnes propio (A-Coder-CLI) y un conjunto derivado de SWE-bench, sirve para reproducir y comparar trayectorias de agente.
- Generacion de parches en pipelines internos de revision: el modelo puede proponer cambios sobre ramas de trabajo que luego pasan por revision humana, dado su enfoque en edicion verificada.
- Despliegue en hardware limitado: al ser MoE con unos 3,6B parametros activos y estar disponible en MXFP4 y GGUF, puede ejecutarse en entornos con menos VRAM que un modelo denso de 20B, lo que facilita prototipos locales de agentes de codigo.
- Experimentacion con cuantizaciones: la existencia de variantes Q8_0, FP8 y cuantizaciones inferiores permite medir la degradacion de precision en tareas de codigo sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que la evaluacion se realizo con A-Coder-CLI sobre un conjunto de 20 tareas derivadas de SWE-bench usando el arnes del proyecto, y afirma explicitamente que no declara ninguna puntuacion no medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia estructural, un MoE de ~21B parametros totales con ~3,6B activos requiere cargar todos los pesos en memoria, por lo que la VRAM dependera de la cuantizacion elegida; la model card advierte que gpt-oss mantiene muchos tensores en F32, de modo que los ficheros son mayores de lo que sugiere el nombre de la cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; depende de la cuantizacion. Las variantes GGUF de menor precision estan pensadas, segun la card, para elegir "la mayor que quepa en tu dispositivo".
- Opciones de despliegue: `transformers` (libreria declarada); el formato GGUF sugiere compatibilidad con llama.cpp u Ollama, aunque no se confirma en la informacion disponible. La etiqueta `endpoints_compatible` aparece en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Amaara Code 20B r7 (este) | ~21B totales / ~3,6B activos | no disponible | A-TECH + Apache-2.0 | Hugging Face, version experimental |
| openai/gpt-oss-20b (base) | ~21B totales / ~3,6B activos | no disponible | Apache-2.0 | Hugging Face |
| Amaara Code 4B | no disponible | no disponible | A-TECH + upstream | Hugging Face (mismo autor) |
| Amaara Code Flash | no disponible | no disponible | A-TECH + upstream | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Version experimental: la model card pide explicitamente no usar estos pesos en produccion hasta la publicacion de versiones estables.
- Licencia doble: la A-TECH Model License se aplica ademas de la Apache-2.0 upstream; es necesario revisar ambos textos antes de cualquier uso comercial. La card indica que las concesiones del upstream se mantienen y que el umbral de ingresos no bloquea los pesos, pero conviene verificarlo en el texto legal.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como en cualquier modelo de codigo, las ediciones propuestas deben verificarse con pruebas automatizadas.
- Idiomas soportados y cobertura multilingue: no disponibles.
- Longitud de contexto: no disponible, lo que impide planificar su uso en repositorios grandes.
- El corpus de entrenamiento se centra en trayectorias de edicion y verificacion; el comportamiento fuera de ese patron (por ejemplo, tareas de edicion sin verificacion) puede estar menos cubierto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-r7-MXFP4
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Arnes de evaluacion A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad del autor (Skool): https://www.skool.com/open-source-ai-builders-club/about
