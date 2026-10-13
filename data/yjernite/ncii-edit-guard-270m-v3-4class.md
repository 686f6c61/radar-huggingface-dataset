# yjernite/ncii-edit-guard-270m-v3-4class

## Resumen

ncii-edit-guard-270m-v3-4class es un clasificador de texto de 268 millones de parametros desarrollado por el usuario yjernite (Yacine Jernite, investigador de Hugging Face) como guardarraíl de seguridad para detectar peticiones relacionadas con imagenes intinas no consentidas (NCII, non-consensual intimate imagery) en flujos de edicion de imagen. Se construye mediante fine-tuning del modelo base microsoft/harrier-oss-v1-270m, un transformer de la familia Gemma 3 en su variante de texto, sobre el que se anade una cabeza de clasificacion de secuencia.

Se trata de una variante experimental de 4 clases (`safe`, `explicit-not-person-targeted`, `sexualize-reveal`, `ncii-strict`) del modelo v3 de 3 clases del mismo autor. El interes tecnico del modelo no reside en su rendimiento, sino en que constituye un resultado negativo documentado con detalle: la distincion fina entre las clases `ncii-strict` y `sexualize-reveal` no se transfiere de la distribucion de desarrollo a la de evaluacion, ni siquiera despues de corregir el etiquetado envenenado y anadir 800 pares minimos de desambiguacion. Con 268 M de parametros, el modelo aprende esa frontera como un atajo de estilo real-vs-sintetico que se invierte en datos con el estilo de evaluacion.

El propio autor recomienda no desplegar esta variante y usar en su lugar `yjernite/ncii-edit-guard-270m-v3` (3 clases), que conserva mejor la senal de riesgo. El repositorio se mantiene como evidencia del hallazgo y como origen del artefacto mas valioso del experimento: las anotaciones de reetiquetado generadas con el juez Shieldstral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (tag `gemma3_text`) con cabeza de clasificacion de secuencia |
| Parametros totales | 268.100.736 (~268 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 1,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/harrier-oss-v1-270m`, un transformer decoder-only de 268 M de parametros de la familia Gemma 3 en su variante de texto, y se adapta a clasificacion de secuencia mediante fine-tuning supervisado con etiquetas blandas en el lado seguro (`safe-side soft labels`) provenientes del modelo juez Shieldstral con un factor de mezcla alpha = 0.3. El esquema de etiquetas original de la ronda 1 usaba subetiquetas basadas en reglas, asignando las filas no resolubles a la clase `ncii-strict`, lo que segun el autor enveneno internamente las clases `strict` (unas 1.500 filas no resueltas de estilo similar a `reveal`, con tag-soup benigno de texto-a-imagen) y `reveal` (cuasi-desnudez mal etiquetada por reglas).

La ronda 2, que corresponde a este modelo, aplica dos correcciones: (1) se reevaluaron las 6.616 filas de entrenamiento y las 959 filas de evaluacion de clase 2 con un etiquetado de 3 consultas de Shieldstral (nudify / sexualize-reveal / explicit-situation), lo que descubrio 933 filas de situacion explicita que las reglas habian pasado por alto, reetiqueto en bloque y excluyo del entrenamiento 1.540 filas genuinamente irresolubles; y (2) se anadieron 800 pares minimos desambiguadores en los que se mantiene el escenario y se alterna entre desnudez y ropa reveladora, sin rechazos. A pesar de ambos arreglos, la degeneracion persiste: la tasa de prediccion de la clase `ncii-strict` (`pred_strict_rate`) es 0,0 en todas las subetiquetas de evaluacion, incluidas las 381 filas de `nudify`, mientras que el recall en desarrollo para `strict` es 0,851. La conclusion documentada es que no es un fallo de entrenamiento, sino que a 268 M de parametros la frontera strict/reveal solo se aprende como atajo de estilo y se invierte fuera de la distribucion de desarrollo.

## Capacidades

- Clasificacion de texto en 4 clases: `safe`, `explicit-not-person-targeted`, `sexualize-reveal` y `ncii-strict` (esta ultima agrupa nudify y situacion explicita).
- Evaluacion de prompts de edicion de imagen para senalar peticiones de riesgo relacionadas con NCII.
- Funciona como clasificador de una sola pasada, sin generacion de texto libre.
- Uso de etiquetas blandas del lado seguro para reducir falsos positivos sobre contenido benigno.
- Capacidad multilingue: no disponible; el modelo declara unicamente ingles.
- Soporte de tool calling / function calling: no aplica (es un clasificador, no un modelo generativo con agente).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion declarada con `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Filtrado previo en pipelines de edicion de imagen: el clasificador puede colocarse delante del generador para bloquear o marcar prompts que soliciten manipulacion intima de personas reales, antes de consumir computo de difusion.
- Moderacion de prompts en plataformas de texto-a-imagen: dado su tamano de 268 M, puede ejecutarse en la misma ruta de inferencia que el generador sin anadir latencia significativa ni requerir GPU dedicada.
- Triaje de colas de moderacion humana: las cuatro clases permiten priorizar casos (`ncii-strict` y `sexualize-reveal` primero) y enrutar el resto a revision, aunque el autor advierte que en esta variante la clase `ncii-strict` no se activa en la distribucion de evaluacion.
- Investigacion sobre degeneracion de clasificadores de seguridad en modelos pequenos: el repositorio documenta la metodologia completa (diagnostico, reetiquetado, pares minimos y evaluacion) y sirve como caso de estudio reproducible de un resultado negativo.
- Generacion de datos de entrenamiento para otros guardarraíles: las anotaciones del juez Shieldstral publicadas en `unresolved_relabeled.parquet` (6.616 filas de entrenamiento y 959 de evaluacion rejuzgadas) son reutilizables para entrenar o auditar clasificadores de la misma tarea.
- Construccion de conjuntos de evaluacion con pares minimos: los 800 pares desambiguadores de `synthv4_pairs.parquet` permiten medir si un guardarraíl distingue desnudez de ropa reveladora cuando el escenario es identico.
- Baseline en comparativas de guardarraíles: sirve como referencia de un modelo de 268 M en la familia ncii-edit-guard, util para justificar el salto a modelos mayores o a mas datos humanos etiquetados.
- Despliegue en entornos con restricciones de recursos: al caber en CPU y en cualquier GPU de consumo, es viable en filtrado on-device o en servicios con presupuesto de VRAM muy limitado (con la salvedad de que la version recomendada es la de 3 clases).

## Benchmarks y rendimiento

Datos publicados en la model card y en `eval/results.json`. Los valores de evaluacion corresponden a 3.699 filas mapeadas al esquema de 3 clases.

| Metrica | Desarrollo (seleccion) | Evaluacion (3.699 filas, mapeado a 3 clases) |
|---|---|---|
| Macro F1 | 0,802 | 0,821 |
| Recall `ncii` | no disponible | 0,825 |
| Recall `strict` | 0,851 | 0,0 en todas las subetiquetas (incluidas 381 filas de `nudify`) |
| FPR en `safe` | 0,023 | 0,033 |
| FPR por sobre-rechazo en LGBT | no disponible | 0,000 - 0,023 |
| `pred_strict_rate` | no disponible | 0,0 en todas las subetiquetas de evaluacion |

Comparativa interna citada por el autor: al mapear al esquema de 3 clases, este modelo alcanza un recall `ncii` de 0,825 frente a 0,923 de la version `v3` de 3 clases. En la ronda 1, la cabeza `ncii-strict` predijo 0 aciertos de 959 filas de riesgo, con el 98 por ciento de las filas de nudify clasificadas como `sexualize-reveal`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,54 GB en FP16/BF16, 0,27 GB en INT8 y 0,14 GB en INT4, solo para los pesos; el repositorio ocupa 1,6 GB, presumiblemente por incluir otros artefactos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Es funcional en GTX 1060, RTX 3050, RTX 4090 y aceleradores de borde.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas.
- Ejecucion en CPU: viable por el tamano del modelo, aunque no se publican cifras de latencia.
- Opciones de despliegue: transformers (libreria declarada), `text-embeddings-inference` y endpoints compatibles segun los tags. vLLM, TGI, llama.cpp u Ollama no estan documentados para este repositorio, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto | Recall `ncii` (eval, 3 clases) | FPR `safe` | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| yjernite/ncii-edit-guard-270m-v3-4class | 268 M | 4 | no disponible | 0,825 | 0,033 | MIT | Experimental, resultado negativo |
| yjernite/ncii-edit-guard-270m-v3 | no disponible | 3 | no disponible | 0,923 | no disponible | no disponible | Recomendado por el autor para despliegue |
| microsoft/harrier-oss-v1-270m | 268 M | no aplica (modelo base) | no disponible | no aplica | no aplica | no disponible | Modelo base sin cabeza de clasificacion |

El resto de metricas de los modelos comparables no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- La distincion `ncii-strict` / `sexualize-reveal` no se transfiere a la distribucion de evaluacion: la tasa de prediccion de la clase estricta es 0,0 en todas las subetiquetas, incluidas las 381 filas de nudify. La cabeza de 4 clases no es fiable en produccion.
- El autor recomienda explicitamente no desplegar este modelo y usar `yjernite/ncii-edit-guard-270m-v3` (3 clases) en su lugar.
- Recall `ncii` inferior al de la version de 3 clases (0,825 frente a 0,923) incluso tras mapear las clases.
- El modelo solo declara soporte de ingles; su comportamiento en otros idiomas no esta documentado.
- Es un clasificador, no un generador: no puede explicar sus decisiones ni razonar sobre casos ambiguos, lo que dificulta la auditoria de falsos negativos.
- La hipotesis documentada es que el modelo aprende un atajo de estilo real-vs-sintetico que se invierte en filas con el estilo de la distribucion de evaluacion; esto implica un riesgo alto de generalizacion incorrecta fuera del dominio de entrenamiento.
- Falsos positivos sobre contenido benigno: FPR de 0,023 en desarrollo y 0,033 en evaluacion sobre la clase `safe`. El autor reporta un FPR de sobre-rechazo sobre contenido LGBT de entre 0,000 y 0,023.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero la licencia no implica idoneidad tecnica para moderacion real.
- El repositorio no publica pesos GGUF ni cuantizados, lo que limita el despliegue en runtimes de inferencia en CPU com optimizados (llama.cpp, Ollama).
- Uso responsable: un guardarraíl de NCII con recall imperfecto en un dominio sensible puede generar tanto falsos negativos graves como bloqueos injustificados; requiere supervision humana y auditoria periodica.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K): son irrelevantes para un clasificador de seguridad de este tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yjernite/ncii-edit-guard-270m-v3-4class
- Modelo recomendado (3 clases, v3): https://huggingface.co/yjernite/ncii-edit-guard-270m-v3
- Resultados de evaluacion: https://huggingface.co/yjernite/ncii-edit-guard-270m-v3-4class/blob/main/eval/results.json
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Dataset con las anotaciones del juez y los pares minimos: https://huggingface.co/datasets/yjernite/ncii-guard-synth-v1
- Fichero `unresolved_relabeled.parquet`: https://huggingface.co/datasets/yjernite/ncii-guard-synth-v1
- Fichero `synthv4_pairs.parquet`: https://huggingface.co/datasets/yjernite/ncii-guard-synth-v1
- Herramienta de construccion ML Intern: https://huggingface.co/datasets/huggingface/badges/resolve/main/built-with-ml-intern-sm.svg

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante; unicamente aparecieron sitios de contenido para adultos sin relacion con el modelo, por lo que no se incluyen.
