# vigneshlabs/ballot-jev-0.5b

## Resumen

ballot-jev-0.5b es un modelo de decisión tipada (typed-decision) de 506M parámetros desarrollado por vigneshlabs y construido sobre Qwen/Qwen2.5-0.5B (494M, congelado) más un adaptador LoRA de 8,8M (rango 16) y una cabeza de decisión de 3,3M. Resuelve una tarea concreta: dado un estado o contexto y una pregunta, devolver una respuesta estructurada dentro de un conjunto fijo de candidatos, ya sea eligiendo una de K opciones, evaluando una proposición como verdadera o falsa bajo evidencia, o asignando una puntuación ordinal. Se distribuye con licencia Apache-2.0.

Su rasgo diferencial es la invariancia a permutaciones: reordenar las opciones no altera la distribución de salida. El estado y la pregunta se codifican una sola vez en una caché KV y cada opción se decodifica desde su propio clon privado de esa caché, de modo que ninguna opción participa en el cálculo de otra. Sobre los pesos entrenados, la diferencia máxima entre la salida con orden directo y con orden inverso es de 3e-8, es decir, ruido de redondeo en fp32; en la misma prueba, los modelos comparables citados en la model card (kev y laya) invierten su decisión en el 28,1% y el 25,0% de los casos respectivamente.

Está diseñado para ejecutarse en CPU como destino principal, no como recurso de emergencia: p50 de 0,23 s y p95 de 0,34 s por decisión en Apple Silicon con 4 hilos y una sola petición, con unos 3 GB de RAM residente en fp32 y un checkpoint de 2,02 GB. El patrón de uso previsto es actuar como primera pasada local y calibrada delante de un LLM mayor, enrutando por umbral de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen2.5-0.5B congelada) + adaptador LoRA (rango 16) + cabeza de decisión |
| Parametros totales | 506M (494M base + 8,8M LoRA + 3,3M cabeza) |
| Parametros activos | no aplica: no es un modelo MoE |
| Parametros entrenables | 12,1M (2,4% del total); la base permanece congelada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en fp32 y la model card menciona la conversión a fp16 (~1,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base también es Apache-2.0) |
| Formato de pesos | safetensors en fp32 (checkpoint de 2,02 GB); el adaptador se gestiona con PEFT |
| Precision de serie | fp32 |
| Pipeline declarado en el Hub | zero-shot-classification |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura parte de un decoder transformer Qwen2.5-0.5B que se mantiene congelado y sobre el que se apilan dos componentes entrenables: un adaptador LoRA de rango 16 (8,8M de parámetros) y una cabeza de decisión (3,3M). El mecanismo clave no es la cabeza en sí, sino cómo se organiza el cálculo: el estado y la pregunta se codifican una única vez en una caché KV, y cada opción candidata se decodifica a partir de una copia privada de esa caché. Al no ser nunca una opción entrada del cálculo de otra, permutar la lista de opciones permuta la distribución de salida y no introduce ningún otro efecto. La invariancia es, por tanto, estructural y no aprendida. La model card insiste en este punto frente a alternativas que sí la aprenden y fallan de forma medible.

El modelo expone tres tipos de pregunta. `choice` devuelve la mejor de K opciones junto con la distribución completa; `noul` evalúa una proposición bajo evidencia y devuelve `probability_true`; `score` devuelve una valoración ordinal con `expected_level`, que la propia documentación señala como la magnitud recomendada en preguntas ordinales. Todas las llamadas devuelven la distribución completa y no solo la etiqueta. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento de ajuste de la cabeza de decisión. La sección de calibración de la model card aparece truncada en la información recibida, por lo que la evidencia cuantitativa sobre ECE por tramos de dificultad no está disponible.

## Capacidades

- Clasificación de elección única (`choice`): elegir una etiqueta entre K candidatas y devolver la probabilidad de cada una.
- Verificación booleana bajo evidencia (`noul`): decidir si una proposición se sostiene dado un contexto y devolver `probability_true` junto con una confianza.
- Valoración ordinal (`score`): asignar un nivel dentro de una escala ordenada y devolver además `expected_level`, la media ponderada de la distribución.
- Salida probabilística completa: cada llamada devuelve todas las probabilidades, lo que permite aplicar umbrales y enrutado por confianza en lugar de forzar una etiqueta.
- Invariancia a permutaciones de las opciones: verificada con 0 cambios en 32 decisiones invertidas y una diferencia máxima de 3e-8 entre orden directo e inverso.
- Ejecución en CPU sin GPU: p50 de 0,23 s por decisión con 4 hilos; también admite CUDA y MPS.
- No se documenta soporte de generación de texto libre, tool calling ni function calling, razonamiento multi-paso, agentes, visión, audio ni modo de razonamiento explícito. Tampoco se documenta comportamiento multilingüe.

## Casos de uso

- Enrutado de tickets y correo: clasificar la intención o el equipo responsable con `choice` sobre una lista fija de categorías, asignar automáticamente por encima de un umbral de confianza (por ejemplo 0,75) y escalar a un LLM solo la cola de baja confianza. El coste por caso resuelto es de unos 0,2 s de CPU sin llamada a API.
- Triaje de moderación de contenido: en lugar de forzar un sí o un no sobre publicaciones genuinamente ambiguas, obtener P(violación) y decidir con un umbral; la devolución de la distribución completa permite distinguir el caso dudoso del caso claro.
- Filtrado y reranking en recuperación: comprobar con `noul` si un pasaje recuperado responde realmente a la consulta antes de pasarlo al generador, reduciendo contexto irrelevante en el prompt.
- Evaluación de salidas de LLM a escala: puntuar con `score` la ayuda o adecuación de miles de generaciones en una escala 1-5; usar `expected_level` como métrica agregada y no el argmax, tal como recomienda la documentación del modelo.
- Extracción de campos en formularios: seleccionar uno de K valores conocidos para una ranura (tipo de documento, categoría de producto, motivo de reclamación) cuando el conjunto de valores es cerrado.
- Análisis de encuestas y reseñas: convertir texto libre en valoraciones ordinales calibradas, con una distribución que refleja la ambigüedad real del texto en lugar de una etiqueta puntual.
- Verificación de afirmaciones en pipelines RAG: usar `noul` como comprobador barato de si una afirmación está respaldada por el contexto recuperado, marcando para revisión humana los casos con `probability_true` cercana a 0,5.
- Pretriaje en atención al cliente: clasificar intención en conversaciones multi-turno antes de invocar un modelo mayor, aprovechando que la decisión se resuelve en CPU junto a la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta una evaluación interna de invariancia a permutaciones:

| Prueba | ballot-jev-0.5b | kev | laya |
|---|---|---|---|
| Decisiones que cambian al invertir el orden de las opciones | 0 de 32 | 28,1% | 25,0% |
| Diferencia maxima entre p(orden directo) y p(orden inverso) | 3e-8 (ruido fp32) | no disponible | no disponible |
| Calibracion (ECE por tramos de dificultad) | no disponible: el texto de la model card esta truncado | no disponible | no disponible |

Latencia declarada por decisión en CPU (Apple Silicon, 4 hilos, petición única): p50 0,23 s, p95 0,34 s. No se publican cifras de throughput.

## Requisitos de hardware

- Memoria: unos 3 GB de RAM residente para inferencia en fp32, según la model card. El checkpoint en disco ocupa 2,02 GB; convertido a fp16 baja a aproximadamente 1,0 GB.
- VRAM estimada: no se publican cifras oficiales. Por tamaño del checkpoint en fp32, la inferencia completa cabe en GPUs con 4-6 GB de VRAM; en fp16 el margen es mayor. Hay que sumar la caché KV, que depende de la longitud de contexto efectiva (no documentada).
- GPU recomendadas: no se especifican. El destino declarado es CPU, por lo que no hay motivo documentado para usar A100, H100 o similares. En consumer, cualquier GPU con al menos 4 GB (RTX 3060, RTX 4060 y superiores) es suficiente; también se admiten MPS y CUDA mediante `device="cuda"`.
- Compatibilidad con GPU de consumo: sí, con holgura, aunque la model card insiste en que la GPU no es el objetivo.
- Opciones de despliegue: el repositorio incluye un script `inference.py` con la clase `BallotJev` y requiere `torch`, `transformers`, `peft`, `safetensors` y `huggingface_hub`. La carga se hace con `snapshot_download` y `BallotJev.from_pretrained(path, threads=4)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; conviene tenerlo en cuenta porque el pipeline declarado (`zero-shot-classification`) no implica que funcione con la interfaz estándar de transformers.
- Dependencia adicional: el base Qwen2.5-0.5B se descarga automáticamente la primera vez (~1 GB extra) salvo que se fije una copia local con el argumento `base_model`.
- Latencia y throughput: p50 0,23 s y p95 0,34 s por decisión en CPU de Apple Silicon con 4 hilos y una sola petición. No hay datos de throughput concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Invariancia a permutacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ballot-jev-0.5b | 506M (12,1M entrenables) | no disponible | Verificada: 0 de 32 inversiones, 3e-8 de diferencia | Apache-2.0 | HuggingFace, requiere script propio |
| kev | no disponible | no disponible | Falla en el 28,1% de las decisiones invertidas | no disponible | citado en la model card, sin enlace |
| laya | no disponible | no disponible | Falla en el 25,0% de las decisiones invertidas | no disponible | citado en la model card, sin enlace |
| Qwen/Qwen2.5-0.5B (base) | 494M | no disponible en la informacion recibida | no aplica: no es un modelo de decision tipada | Apache-2.0 | HuggingFace |

La model card afirma que ningún otro modelo abierto de esta clase mantiene esa garantía, pero no aporta una comparativa exhaustiva ni cifras de precisión frente a kev y laya en tareas de decisión. No hay datos disponibles de otros modelos comparables de decisión tipada.

## Limitaciones y advertencias

- No hay benchmarks estándar publicados: no se puede estimar su precisión en tareas de clasificación reales más allá de la evaluación de invariancia aportada por el autor.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Idiomas soportados no documentados. La model card y todos los ejemplos están en inglés; se desconoce el comportamiento en castellano u otras lenguas.
- Longitud de contexto no documentada, a pesar de que los casos de uso propuestos implican contextos de ticket o cláusulas de política.
- El conjunto de datos de entrenamiento no se describe: ni tamaño, ni procedencia, ni composición. Esto impide evaluar sesgos sistemáticos o cobertura de dominio.
- Calibración: la model card presenta la calibración como argumento central, pero el fragmento disponible está truncado justo en la evidencia de ECE por tramos de dificultad. El ejemplo de `score` incluido por el autor muestra un argmax de 5 estrellas con solo 0,291 de confianza y un `expected_level` de 2,44 en una reseña mixta; en distribuciones ambiguas no conviene usar la etiqueta de mayor probabilidad sin umbral ni revisar el nivel esperado.
- Riesgo de alucinación: al tratarse de una tarea de clasificación cerrada sobre opciones proporcionadas, no genera texto libre ni inventa contenido. El riesgo real es una etiqueta incorrecta con confianza alta.
- La garantía de invariancia cubre la permutación del orden de las opciones, no la reformulación de su enunciado: cambiar la redacción de una opción es un cambio de entrada y puede modificar la decisión.
- El pipeline declarado en el Hub es `zero-shot-classification`, pero el uso requiere el script `inference.py` del repositorio, no la interfaz estándar de transformers. Esto puede inducir a error al integrarlo en herramientas que esperan ese contrato.
- Licencia Apache-2.0, también en el modelo base: permite uso comercial. No se documentan restricciones adicionales, pero se deben conservar los avisos de licencia y atribución.
- Los metadatos del Hub indican fechas de creación y actualización de 2026-09-22, posteriores a la fecha de consulta. Conviene verificar la integridad de esos metadatos antes de fijar una versión en producción.
- La base es un modelo de 0,5B: su capacidad de comprensión es limitada en dominios especializados, contextos largos o matices sutiles, y el ajuste LoRA (2,4% de parámetros entrenables) no amplía ese techo de conocimiento.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe plantearse como sustituto de un LLM generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vigneshlabs/ballot-jev-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Script de inferencia: `inference.py`, incluido en el repositorio del modelo (clase `BallotJev`)
- Imagen de evaluacion: `ballot_jev_evals.png`, incluida en el repositorio del modelo
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas realizadas devolvieron unicamente paginas de un videojuego (Drachenblut 2) sin ninguna relacion con ballot-jev. No hay paper, blog tecnico, repositorio adicional ni demo localizados.
