# ya9919/laya-finance-matched-sft-continued-200k

## Resumen

`laya-finance-matched-sft-continued-200k` es un checkpoint de investigación desarrollado por el usuario `ya9919` en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social para estudiar decisiones financieras de hogares. El modelo parte de `ya9919/laya-finance-matched-sft-200k` y aplica una continuación por entropía cruzada (cross-entropy continuation) sobre el mismo conjunto de 200.000 ejemplos de decisión financiera, actuando como control experimental dentro de la ruta de "encoder option scoring" del benchmark descrito en el paper del proyecto.

Técnicamente no es un modelo generativo de texto libre, sino un encoder de clasificación de opciones: se apoya en `answerdotai/ModernBERT-large` como encoder y conserva la cabeza de decisión Laya de dos capas, que puntúa el estado del hogar, la pregunta y el menú completo de candidatos para predecir la opción elegida. Con 421.293.830 parámetros y pesos en safetensors, su relevancia es metodológica: sirve para comparar la continuación CE frente a otros métodos de adaptación con el mismo presupuesto de exposición a datos.

El checkpoint seleccionado acumula 250.688 presentaciones de filas (200.000 de la etapa terminal más 50.688 adicionales), elegidas mediante un conjunto de desarrollo de 20.000 ejemplos. Su rendimiento en el test común es de 73,8986 % de accuracy y 36,1732 % de F1 macro por pregunta, ligeramente por encima de su padre SFT200 y muy por encima de la referencia nativa Laya en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decisión Laya de dos capas |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (no comercial, sin redistribución) |
| Formato de pesos | safetensors (librería `laya`) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder `answerdotai/ModernBERT-large` y mantiene la cabeza de decisión original de Laya, de dos capas, que puntúa conjuntamente el estado del hogar, la pregunta y el menú completo de opciones candidatas. La inferencia no genera texto: evalúa cada opción del menú y selecciona una decisión, lo que lo convierte en un clasificador de opciones sobre contexto estructurado más que en un modelo de lenguaje conversacional.

El entrenamiento consiste en una continuación por entropía cruzada desde el checkpoint `laya-finance-matched-sft-200k`, releyendo los mismos 200.000 ejemplos distintos de la partición fija de decisión-QA. La etapa terminal expone 200.000 filas y el checkpoint seleccionado se toma tras 50.688 presentaciones adicionales, sumando 250.688 exposiciones acumuladas. La selección se realiza con un conjunto de desarrollo fijo de 20.000 ejemplos, antes de evaluar sobre el test retenido común de 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de hogar/encuestado. El aprendizaje de políticas del proyecto utiliza datos de encuestas reales; los registros de entrenamiento y evaluación no se distribuyen.

## Capacidades

- Clasificación de decisiones financieras de hogar sobre un menú cerrado de opciones (por ejemplo, uso de tarjeta de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos).
- Puntuación conjunta de estado del hogar, pregunta y menú completo de candidatos en una sola pasada.
- Salida de decisión discreta con recuento de decisiones inválidas igual a cero en el test común reportado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es un componente de decisión dentro de un motor de simulación externo).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se reportan modos de pensamiento, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogar a gran escala: integrado en el motor de transición de estados de S²-MAS para generar decisiones de consumo, reservas de efectivo y pagos de millones de agentes sintéticos, sustituyendo reglas heurísticas por una política aprendida.
- Investigación comparativa de métodos de adaptación: sirve como control de continuación por entropía cruzada frente a RLCD200 y otras rutas del benchmark con el mismo presupuesto de exposición a datos.
- Modelado de elección financiera sobre encuestas reales: reproduce respuestas de cuestionarios financieros (titularidad de cuentas, uso de crédito) condicionadas al estado del hogar, útil para estudiar sesgos y patrones de tenencia de productos.
- Evaluación de robustez ante variaciones de pregunta: con 119 versiones de pregunta en el test común, permite medir la estabilidad de las decisiones ante reformulaciones del mismo ítem.
- Análisis de política financiera y microsimulación: al puntuar menús de opciones cerrados, facilita escenarios contrafactuales sobre acceso a productos bancarios por segmento de hogar.
- Generación de datos sintéticos etiquetados para preentrenamiento o aumento de datos en tareas de decisión financiera, siempre bajo los términos de la licencia de investigación.

## Benchmarks y rendimiento

Test común retenido: 240.458 registros de QA, 119 versiones de pregunta, 8.275 grupos de hogar/encuestado. Inferencia en PyTorch BF16 nativo.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint | 73,8986 | 36,1732 | 0 |
| Padre SFT200 | 73,8753 | 35,9949 | 0 |
| Laya nativo original (referencia BF16 emparejada) | 60,1972 | 29,5995 | 0 |

Frente a su padre SFT200, el paper reporta +0,0233 puntos de accuracy (IC 95 % −0,0288 a 0,0731) y +0,1783 puntos de F1 macro por pregunta (0,0762 a 0,2770). Bajo el mismo presupuesto de pasada añadida, la continuación CE supera a RLCD200 en 0,1229 puntos de F1 (IC 95 % 0,0330 a 0,2073).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en BF16 para los 421 millones de parámetros, más memoria para activaciones y el menú de candidatos; el tamaño del repositorio es de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; tarjetas profesionales como A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: interfaz de inferencia nativa de Laya con la configuración de encoder, tokenizer y cabeza de decisión suministradas; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test común) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `laya-finance-matched-sft-continued-200k` (este) | 421.293.830 | No disponible | 73,8986 % | S²-MAS Controlled Research v1.2 | Hugging Face |
| `ya9919/laya-finance-matched-sft-200k` (padre) | No disponible | No disponible | 73,8753 % | S²-MAS Controlled Research v1.2 (presumible) | Hugging Face |
| Laya nativo original (referencia BF16) | No disponible | No disponible | 60,1972 % | No disponible | No disponible |
| RLCD200 (variante del benchmark) | No disponible | No disponible | F1 0,1229 puntos inferior | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no produce texto libre ni mantiene conversaciones; solo puntúa menús cerrados de opciones.
- Idioma limitado al inglés; no se reporta soporte multilingüe.
- Sesgos conocidos: no documentados explícitamente, pero el entrenamiento se basa en datos de encuestas reales, por lo que puede heredar sesgos de la muestra original.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las decisiones pueden ser incorrectas; la accuracy reportada es del 73,8986 %, con un F1 macro por pregunta de solo 36,1732 %, lo que indica dificultad considerable en clases minoritarias.
- Licencia restrictiva: S²-MAS Controlled Model Research License v1.2, solo para uso científico no comercial, sin redistribución y sin ingeniería inversa, extracción o destilación no autorizadas.
- Los registros de entrenamiento y evaluación no se distribuyen; el acceso a los datos fuente requiere solicitud.
- La implementación del motor GENESE/MAS permanece privada, lo que limita la reproducibilidad completa del entorno de simulación.
- El checkpoint se selecciona con datos de desarrollo antes del test, pero las diferencias frente al padre son pequeñas y con intervalos de confianza que cruzan cero en accuracy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Modelo base: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Licencia: https://huggingface.co/ya9919/laya-finance-matched-sft-200k/blob/main/LICENSE
- Ejemplos de QA: https://huggingface.co/ya9919/laya-finance-matched-sft-200k/blob/main/qa_examples.json
- Encoder base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-large
