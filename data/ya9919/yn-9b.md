# ya9919/YN-9b

## Resumen

YN-9b es un adaptador LoRA con una cabeza de decisión escalar compartida, construido sobre el backbone Qwen/Qwen3.5-9B y publicado por el usuario ya9919. Forma parte del proyecto S²-MAS, un marco de simulación multiagente a escala social orientado al estudio de decisiones financieras de hogares (consumo, reservas de efectivo y pagos). El modelo no es un generador de texto conversacional al uso: su función es puntuar menús de candidatos y emitir una decisión discreta a partir de un estado de hogar, una pregunta y las opciones disponibles.

El checkpoint corresponde a la ruta "modelo de lenguaje más cabeza de decisión aprendida" dentro del benchmark del paper S²-MAS, que compara doce sistemas agrupados en seis rutas de decisión. Se entrenó con 200.000 filas distintas del particionado fijo de QA de decisión, siguiendo un protocolo de una pasada que permite compararlo con un adaptador equivalente sobre un backbone de 4B. El resultado es una diferencia de −0,0516 puntos de accuracy frente a la variante 4B, con un intervalo de confianza del 95 % de −0,0981 a −0,0071.

La relevancia es acotada pero específica: se trata de un artefacto de investigación reproducible para evaluar si el escalado del backbone mejora la toma de decisiones financieras cuando el protocolo de adaptación está fijado. La licencia es restrictiva (s2-mas-controlled-research-v1.2) y el motor GENESE/MAS subyacente permanece privado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-9B) más cabeza de decisión escalar compartida |
| Parámetros totales | no disponible (adaptador LoRA; el backbone Qwen3.5-9B se obtiene por separado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | inglés (en) |
| Licencia | s2-mas-controlled-research-v1.2 (categoría "other") |
| Formato de pesos | safetensors (adapter/adapter_model.safetensors), head.pt y adapter/adapter_config.json |

## Arquitectura y entrenamiento

El sistema combina un backbone Qwen3.5-9B en su release oficial post-entrenado, adaptado mediante LoRA, con una cabeza de decisión escalar compartida que puntúa cada candidato del menú de opciones. La inferencia recibe el estado completo del hogar, la pregunta y el menú íntegro de candidatos, y produce una puntuación por candidato en FP32 sobre activaciones BF16 del backbone. El paquete incluye `qwen_decision.py` como interfaz de scoring, y requiere descargar aparte el backbone y el tokenizador oficiales indicados en la configuración.

El entrenamiento usó 200.000 filas distintas del particionado fijo de QA de decisión, en una sola pasada, con método LoRA seleccionado previamente sobre un backbone de 4B mediante un conjunto de desarrollo completo de 412.873 ejemplos. La selección del checkpoint para el run de 9B se hizo con un conjunto de desarrollo fijo de 20.000 ejemplos, y el test final no participó en la selección de presupuestos ni de métodos. El aprendizaje de decisiones se apoya en datos de encuesta reales, según indica la model card. La comparación 4B/9B varía simultáneamente la escala y el historial de entrenamiento upstream de las inicializaciones, lo que el propio autor señala como caveat.

## Capacidades

- Clasificación de decisiones financieras de hogar sobre menús de candidatos cerrados (por ejemplo, tenencia de tarjeta de crédito activa, cuenta de depósito a la vista en renminbi, cuenta de valores o depósitos a plazo no vencidos).
- Scoring de candidatos: asigna una puntuación a cada opción del menú y selecciona la de mayor valor, en lugar de generar texto libre.
- Manejo de estados de hogar como entrada estructurada junto con la pregunta y el menú completo.
- Cobertura de 119 versiones de pregunta en el conjunto de test común, con 8.275 grupos de encuestado/hogar.
- Salida determinista sin decisiones inválidas en el test reportado (0 inválidas sobre 240.458 registros).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Investigación sobre escalado en adaptación de bajo rango: el checkpoint sirve para replicar la comparación 4B frente a 9B bajo un protocolo downstream idéntico, con intervalos de confianza publicados y un conjunto de test de 240.458 registros.
- Evaluación de cabezas de decisión frente a generación next-token: permite contrastar empíricamente la ruta "LM más cabeza aprendida" contra SFT de decisión next-token y clasificación de esquema dinámico dentro del benchmark S²-MAS.
- Simulación de decisiones de hogar en estudios de consumo y pagos: el modelo puntúa opciones sobre estados sintéticos de hogares, adecuado para alimentar motores de transición de estados en experimentos de política económica.
- Auditoría de metodología de benchmarks: al fijar el método antes del run de 9B y reservar el test para la evaluación final, el artefacto es útil como ejemplo de diseño experimental con particionado estanco.
- Análisis de paridad entre escalas: con una diferencia de −0,0516 puntos de accuracy y −0,0721 de F1 macro por pregunta, sirve para estudiar cuándo el escalado no compensa el coste computacional en tareas de decisión estructurada.
- Reproducción de resultados del paper S²-MAS: el checkpoint es la pieza de la ruta LM+head correspondiente al backbone de 9B dentro de las diez variantes entrenadas con presupuesto fijo.
- Docencia sobre PEFT: el paquete mínimo (adaptador, configuración y cabeza en `head.pt`) es un ejemplo compacto de adaptación LoRA con una cabeza auxiliar para una tarea de clasificación sobre menús.

## Benchmarks y rendimiento

Test común retenido: 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. Precisión de inferencia: backbone Qwen en BF16 con scoring de candidatos en FP32.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (YN-9b) | 74,0919 | 36,6622 | 0 |
| Qwen4B-Base LoRA + head, mismo protocolo de 200k | 74,1435 | 36,7343 | 0 |

El paper reporta una diferencia 9B − 4B de −0,0516 puntos de accuracy (IC 95 %: −0,0981 a −0,0071) y de −0,0721 puntos de F1 macro por pregunta (IC 95 %: −0,1725 a 0,0404). La accuracy pondera por igual cada registro de test, contando las decisiones inválidas como incorrectas; el F1 macro promedia sobre todas las clases candidatas definidas en cada versión de pregunta y luego pondera las 119 versiones por igual.

## Requisitos de hardware

- El adaptador y la cabeza ocupan 0,1 GB en el repositorio; el grueso del coste corresponde al backbone Qwen3.5-9B, que debe descargarse aparte.
- VRAM estimada para el backbone en BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del scoring FP32 sobre el menú completo de candidatos; no se publican cifras oficiales de memoria.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un backbone de 9B en BF16 encaja en A100 40 GB, H100 80 GB y, con cuantización, en GPUs de consumo de 24 GB.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la interfaz prevista es el script `qwen_decision.py` del paquete local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el test común | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-9b (este) | LoRA sobre 9B | no disponible | 74,0919 % accuracy / 36,6622 % F1 macro | s2-mas-controlled-research-v1.2 | Hugging Face |
| Qwen4B-Base LoRA + head | LoRA sobre 4B | no disponible | 74,1435 % accuracy / 36,7343 % F1 macro | no disponible | variante del mismo benchmark |
| Otras rutas del benchmark S²-MAS (encoder scoring, SFT next-token, clasificación dinámica, encoder multimodal, interfaces de proveedor) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo de propósito general: solo emite decisiones sobre menús de candidatos y requiere un estado de hogar como entrada; sin él, la inferencia carece de sentido.
- El rendimiento es prácticamente idéntico al de la variante de 4B y ligeramente inferior en ambos métricas; el intervalo de confianza de la diferencia en accuracy excluye el cero por un margen estrecho, y el de F1 macro incluye el cero.
- La comparación 4B/9B confunde escala con historial de entrenamiento upstream, tal como advierte el propio autor.
- El F1 macro por pregunta es bajo en términos absolutos (36,66 %), lo que indica dificultad para discriminar entre clases candidatas dentro de cada versión de pregunta.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia restrictiva "s2-mas-controlled-research-v1.2": debe consultarse el fichero LICENSE antes de cualquier uso, incluido el comercial; la categoría "other" en Hugging Face no equivale a permiso abierto.
- El motor GENESE/MAS es privado, por lo que la reproducibilidad completa del entorno de simulación no está garantizada.
- No se publican datos sobre sesgos, tasa de alucinación (no aplica a generación libre, pero sí a decisiones erróneas), latencia ni requisitos de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el nombre anterior era `ya9919/sharp-9b`; conviene verificar la versión del checkpoint antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-9b
- Licencia: https://huggingface.co/ya9919/YN-9b/blob/main/LICENSE
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Ejemplos de QA en JSON: https://huggingface.co/ya9919/YN-9b/blob/main/qa_examples.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
