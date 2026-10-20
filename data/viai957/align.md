# viai957/align

## Resumen

`viai957/align` no es un modelo de pesos: es un snapshot de repositorio publicado en HuggingFace bajo el título "align: open post-training stack and Lean 4 prover research (code)". Contiene el árbol de trabajo del código (`code/`) en un commit concreto y un *git bundle* (`align.bundle`) con el historial completo, restaurable mediante `git clone align.bundle align`. El propio autor declara el estado como "Phase 0, with no trained checkpoint yet", es decir, no existe ningún checkpoint entrenado ni pesos publicados.

El proyecto se orienta a la investigación en demostración automática de teoremas sobre Lean 4 y a un stack abierto de post-entrenamiento con GRPO (Group Relative Policy Optimization), según las etiquetas del repositorio (`lean4`, `theorem-proving`, `post-training`, `grpo`, `code`). Incluye una pre-registración de resultados (`code/docs/PREREG_SOTA.md`) sellada con OpenTimestamps en `code/docs/evidence/prereg/`, lo que sugiere una metodología de investigación con compromiso previo de hipótesis y métricas.

La relevancia actual es, por tanto, metodológica y de infraestructura, no de rendimiento: sirve como base reproducible para quien quiera replicar o auditar un pipeline de post-entrenamiento para demostradores Lean 4. El repositorio tiene 0 descargas y 0 likes, tamaño de 0.0 GB y no declara arquitectura, parámetros ni contexto, por lo que cualquier evaluación de capacidades del modelo es imposible con la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos ni se describe arquitectura de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (código; ver `code/LICENSE` y atribuciones de terceros en `code/NOTICE`) |
| Formato de pesos | no disponible; el repositorio contiene código fuente y un *git bundle* (`align.bundle`), no safetensors ni GGUF |
| Estado del proyecto | Phase 0, sin checkpoint entrenado |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-20 / 2026-10-20 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo objetivo (transformer, MoE, híbrido u otra), ni el número de tokens de entrenamiento, ni la composición del dataset. Lo que sí se documenta es la metodología de post-entrenamiento: el repositorio se etiqueta con `grpo`, lo que indica el uso de Group Relative Policy Optimization como algoritmo de ajuste, presumiblemente con recompensas derivadas de la verificación de pruebas en Lean 4. El código del pipeline reside en `code/`, y los datos asociados se publican por separado en el dataset `viai957/lean-prover-data`.

El elemento técnico diferencial no es el modelo sino el marco de reproducibilidad: una pre-registración (`code/docs/PREREG_SOTA.md`) sellada con OpenTimestamps antes de ejecutar los experimentos, un snapshot del árbol de trabajo en un commit identificado en el fichero `COMMIT` y un bundle de git con el historial completo. El fichero `code/docs/evidence/model_revisions_deleted_2026-10-19.txt` deja constancia de revisiones de modelo que fueron eliminadas, un detalle relevante para auditar la trazabilidad de los experimentos.

## Capacidades

- Publicación de un stack de post-entrenamiento con GRPO orientado a demostración de teoremas en Lean 4.
- Distribución reproducible del código fuente mediante snapshot del árbol de trabajo y *git bundle* con historial completo.
- Pre-registro de hipótesis y métricas objetivo con sellado temporal OpenTimestamps, apto para auditoría de resultados.
- Registro de evidencias sobre revisiones de modelo eliminadas, útil para trazabilidad experimental.
- Publicación separada del dataset de entrenamiento (`viai957/lean-prover-data`).
- No se documenta ninguna capacidad de inferencia: sin pesos no hay generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo evaluables.

## Casos de uso

- Replicación de un pipeline de post-entrenamiento con GRPO para demostradores Lean 4: el repositorio entrega el código en un commit fijo y el bundle de git necesario para reconstruir el estado exacto del proyecto.
- Auditoría metodológica de investigación: la pre-registración sellada permite comprobar a posteriori si las métricas reportadas coinciden con las declaradas antes de los experimentos.
- Base para construir un demostrador Lean 4 propio: el stack de post-entrenamiento y el dataset `lean-prover-data` pueden servir de punto de partida, aunque el usuario deberá aportar el modelo base, ya que aquí no hay checkpoints.
- Referencia de implementación de GRPO aplicado a dominios con verificación formal: útil para equipos que quieran trasladar el mismo esquema a otros lenguajes de especificación o asistentes de pruebas.
- Integración en pipelines de investigación en CI: el snapshot por commit y el sello temporal encajan con flujos que requieren artefactos reproducibles y verificables.
- Estudio de prácticas de transparencia en publicaciones de IA: el registro explícito de revisiones de modelo eliminadas es un caso poco habitual y aprovechable para discutir trazabilidad.
- Docencia o formación en post-entrenamiento con RL: el código y los datos permiten montar ejercicios prácticos sobre GRPO en un dominio verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente el estado "Phase 0, with no trained checkpoint yet", por lo que no existen métricas de rendimiento asociadas a este repositorio.

## Requisitos de hardware

- VRAM para inferencia: no aplicable; no se publican pesos ni checkpoints.
- GPU recomendadas para inferencia: no aplicable.
- Ejecución en GPU de consumo: no aplicable para inferencia. Para el entrenamiento con GRPO que plantea el stack, el dimensionamiento depende del modelo base elegido, que no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables, al no existir artefactos de pesos.
- Latencia y throughput: no disponibles.
- Requisitos para usar el repositorio: únicamente git y un entorno capaz de ejecutar el código de `code/`; el coste real dependerá de los experimentos que se quieran reproducir.

## Comparativa con modelos similares

La comparación directa no es posible porque `viai957/align` no publica pesos. A modo de orientación de categoría (demostradores de teoremas en Lean 4), se incluye la siguiente tabla; los datos de los modelos de terceros no provienen de la información proporcionada y deben verificarse en sus respectivas model cards antes de citarlos.

| Proyecto | Tipo de artefacto | Pesos publicados | Licencia | Notas |
|---|---|---|---|---|
| viai957/align | Código y datos de investigación (fase 0) | No | Apache-2.0 (código) | Sin checkpoint entrenado; pre-registro y evidencias incluidas |
| DeepSeek-Prover (familia) | Modelos demostradores Lean 4 | Sí | Verificar en la model card del autor | Referencia de la literatura; cifras no disponibles aquí |
| Goedel-Prover (familia) | Modelos demostradores Lean 4 | Sí | Verificar en la model card del autor | Referencia de la literatura; cifras no disponibles aquí |
| Kimina-Prover (familia) | Modelos demostradores Lean 4 | Sí | Verificar en la model card del autor | Referencia de la literatura; cifras no disponibles aquí |

En parámetros, contexto, rendimiento y disponibilidad, `viai957/align` figura como "no disponible" en todos los casos por ausencia de modelo entrenado.

## Limitaciones y advertencias

- No existe checkpoint entrenado: el repositorio no permite ninguna evaluación de capacidades ni de rendimiento.
- Ausencia total de benchmarks, métricas o resultados empíricos en la documentación proporcionada.
- El fichero `model_revisions_deleted_2026-10-19.txt` indica que se eliminaron revisiones de modelo; conviene revisar ese registro antes de asumir cualquier trazabilidad completa de los experimentos.
- Sin descargas ni likes (0/0) y con fecha de creación y actualización prácticamente idénticas: proyecto sin validación externa ni historial de mantenimiento.
- La licencia Apache-2.0 cubre el código, pero las atribuciones de terceros están en `code/NOTICE`; es obligatorio revisarlo antes de un uso comercial o de redistribución.
- No se declara licencia ni condiciones de uso para eventuales pesos futuros, por lo que el uso comercial de un modelo derivado no está cubierto por la información disponible.
- No se especifican idiomas soportados; cualquier afirmación sobre capacidades multilingües sería especulativa.
- No se documenta el modelo base sobre el que se aplica el post-entrenamiento, lo que impide estimar requisitos de cómputo, sesgos heredados o riesgos de alucinación.
- El sellado con OpenTimestamps aporta integridad temporal del pre-registro, no valida la corrección científica de los resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/viai957/align
- Dataset asociado: https://huggingface.co/datasets/viai957/lean-prover-data
- Pre-registro (ruta interna del repo): `code/docs/PREREG_SOTA.md`
- Evidencias del sellado temporal (ruta interna del repo): `code/docs/evidence/prereg/`
- Registro de revisiones de modelo eliminadas (ruta interna del repo): `code/docs/evidence/model_revisions_deleted_2026-10-19.txt`
- Licencia y atribuciones (rutas internas del repo): `code/LICENSE` y `code/NOTICE`
- Bundle de git para reconstruir el historial: `align.bundle`
