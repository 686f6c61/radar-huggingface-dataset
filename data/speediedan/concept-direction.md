# speediedan/concept-direction

## Resumen

`concept-direction` es un repositorio de componentes de [interpretune](https://github.com/interpretune/interpretune), una librería orientada a experimentos de interpretabilidad y control de activaciones en modelos de lenguaje. No se trata de un modelo de lenguaje entrenado, sino de una colección de artefactos (definiciones de experimentos, módulos auxiliares y tests) que permiten reproducir estudios de direcciones de concepto y *steering* sobre modelos existentes, en este caso sobre `gemma3_1b_it`.

El repositorio lo publica el usuario `speediedan` bajo licencia Apache 2.0 y declara los tipos de componente `experiment` y `helpers` con esquema de manifiesto v1. Su contenido principal son ocho configuraciones YAML de experimentos centradas en el par conceptual color/fruta/naranja sobre Gemma 3 1B instruct, más dos módulos Python de ayuda (`concept_displays` y `steering_demo_helpers`) y una batería de tests.

Es relevante para investigadores que trabajan en interpretabilidad mecanicista y en técnicas de dirección de conceptos (*concept vectors*, *activation steering*), porque ofrece definiciones reproducibles y verificables por paridad de fichero, clave y nombre de experimento. No contiene pesos de modelo, no tiene pipeline declarado y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una colección de componentes de interpretabilidad sobre Gemma 3 1B IT) |
| Parametros totales | no disponible (no contiene pesos; el modelo objetivo de los experimentos es `gemma3_1b_it`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible (los identificadores de experimento sugieren inglés, `_it`, pero no se declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; se distribuyen ficheros YAML de configuración, módulos `.py` y tests |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de un paquete de componentes para la librería `interpretune`, con manifiesto de esquema v1 que declara los tipos `experiment` y `helpers`. El árbol publicado corresponde a la lista blanca del manifiesto más los ficheros suplementarios declarados en `extra_files`, generados por el mismo *builder* que los *payloads*.

Los experimentos se definen como ficheros YAML bajo `concept_direction/configs/` y se obtienen con `interpretune.hub.pull_experiment("<org>/<repo>", "<name>")`, una operación que el autor describe como *manifest-first*, fijada a revisión (*revision-pinned*) y con verificación de paridad sobre nombre de fichero, clave y `EXPERIMENT_NAME`. Las referencias relativas `EXTENDS` se resuelven únicamente dentro de la revisión cacheada. Los módulos auxiliares se cargan con `interpretune.hub.load_helpers`, lo que ejecuta código del repositorio y requiere la opción `IT_TRUST_REMOTE_CODE`.

Las ocho configuraciones publicadas giran en torno a variantes de un mismo estudio sobre `gemma3_1b_it`: `gemma3_1b_it_local_color_fruit_orange`, variantes con `fs_l10_n5` (posiblemente *feature selection*, capa 10, top-5), variantes con `s5`, `s5_any`, `pos_noact_constrained`, `signed_fs_l10_n5` y una variante de dinámica latente (`latent_dynamics`). No se documenta en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO, porque no se entrena ningún modelo en este repositorio.

## Capacidades

- Definición reproducible de experimentos de dirección de concepto sobre `gemma3_1b_it` mediante configuraciones YAML versionadas.
- Extracción y visualización de conceptos mediante el módulo auxiliar `concept_displays`.
- Utilidades de demostración de *steering* mediante `steering_demo_helpers`, incluyendo barridos de escala (*steering scale sweep*) según los tests incluidos.
- Validación de direcciones en el espacio latente (*jlens direction validation*) y análisis de dinámica latente por etapas (*latent dynamics stages*).
- Comprobación de posiciones de token (*token positions*) y de requisitos de componentes.
- Verificación de especificaciones de modelo (*model specs*) y de importación de plantillas.
- Carga de componentes con verificación de integridad (paridad de fichero, clave y nombre de experimento) y fijado de revisión.
- No se declaran capacidades de generación de texto, tool calling, agentes, visión ni audio: el repositorio no es un modelo generativo.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: un investigador puede descargar una configuración concreta con `pull_experiment` y ejecutarla en el *harness* de *notebooks* de interpretune para replicar el estudio color/fruta/naranja sobre Gemma 3 1B IT con parámetros idénticos.
- Auditoría de resultados publicados: la verificación de paridad sobre nombre de fichero, clave y `EXPERIMENT_NAME` permite comprobar que la configuración ejecutada coincide exactamente con la declarada en el manifiesto, lo que facilita la revisión por pares.
- Desarrollo de nuevas variantes de *steering*: las variantes `signed_fs_l10_n5`, `s5_any` y `pos_noact_constrained` sirven como punto de partida para comparar estrategias de selección de características y de restricción de posiciones de activación.
- Estudio de dinámica latente: la configuración `latent_dynamics_color_fruit_orange_fs_l10_n5` permite analizar cómo evoluciona la representación del concepto a lo largo de las etapas del modelo.
- Integración en pipelines de evaluación de interpretabilidad: los tests incluidos (`test_component_requirements`, `test_model_specs`, `test_template_imports`) pueden incorporarse a CI para detectar roturas en configuraciones o en la API de la librería.
- Formación y docencia: los módulos `concept_displays` y `steering_demo_helpers` permiten construir demostraciones interactivas de dirección de conceptos en un modelo pequeño (1B) que cabe en hardware de consumo.
- Reutilización de *helpers* en otros repositorios de interpretune: al cargarse mediante `load_helpers`, los módulos pueden emplearse en experimentos propios, siempre con la cautela de ejecutar código remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio en sí no requiere GPU: son ficheros YAML, módulos Python y tests.
- Los experimentos apuntan a `gemma3_1b_it` (Gemma 3 1B instruct); el requisito de VRAM vendrá determinado por ese modelo, no por este repositorio. No se dispone de cifras de VRAM declaradas en la información proporcionada.
- GPU recomendadas: no disponible en la información del repositorio. Por el tamaño del modelo objetivo (1B), es plausible su ejecución en GPU de consumo, pero no se confirma en la documentación disponible.
- Opciones de despliegue: la carga se realiza mediante la API de interpretune (`interpretune.hub.pull`, `pull_experiment`, `load_helpers`) y el lanzador de *harness* de *notebooks*. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de la misma categoría (colecciones de componentes de interpretabilidad con manifiesto v1 y verificación de paridad). Como referencia del ecosistema, cabría considerar herramientas de interpretabilidad mecanicista como TransformerLens o SAELens, pero no se dispone de datos de parámetros, contexto, rendimiento ni licencia de esas alternativas en la información consultada, por lo que no se ofrece una tabla comparativa con cifras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con benchmarks de LLM.
- No contiene pesos: cualquier uso práctico requiere descargar por separado el modelo objetivo (`gemma3_1b_it`) y aceptar su licencia correspondiente, que no es la de este repositorio.
- La carga de *helpers* ejecuta código del repositorio y exige la opción `IT_TRUST_REMOTE_CODE`; esto implica un riesgo de seguridad si el repositorio no es de confianza o si se modifica en una revisión posterior.
- El autor advierte de que cualquier fichero presente en el árbol publicado fuera de la lista blanca del manifiesto y de `extra_files` ha llegado "fuera de banda" (*out of band*), por lo que no está cubierto por las garantías del *builder*.
- Las referencias relativas `EXTENDS` solo se resuelven dentro de la revisión cacheada, lo que puede provocar fallos si se mezclan revisiones.
- Cobertura limitada: los experimentos publicados se centran en un único modelo (`gemma3_1b_it`) y en un dominio conceptual muy concreto (color/fruta/naranja); no hay evidencia de generalización a otros modelos o conceptos.
- Sin descargas ni interacciones registradas en el momento de la consulta: no hay validación comunitaria ni reportes de uso en producción.
- No se declaran idiomas soportados ni sesgos conocidos; al no ser un modelo generativo, las advertencias habituales de sesgo y alucinación aplican al modelo subyacente, no a este repositorio.
- Licencia Apache 2.0: permite uso comercial del código y las configuraciones, pero no otorga derechos sobre el modelo Gemma 3 ni sobre sus pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/speediedan/concept-direction
- Librería interpretune (GitHub): https://github.com/interpretune/interpretune
