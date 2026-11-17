# wordspace/decider-1.7B-MLX-6bit

## Resumen

decider-1.7B-MLX-6bit es un modelo de clasificación de texto de 1.720.574.976 parámetros, desarrollado por wordspace y afinado a partir de Qwen/Qwen3-1.7B-Base. No es un modelo generativo: responde a cuatro preguntas cerradas de decisión (contradicción, hipótesis, actualización y pertenencia) en un único forward pass, leyendo la probabilidad calibrada directamente de los logits de los tokens de opción. Su propósito es servir de motor de decisión dentro de una wiki personal mantenida por un LLM (patrón descrito por Andrej Karpathy en 2026), donde las notas del usuario siguen siendo la fuente de verdad y el modelo compila y verifica las páginas de tema.

El modelo se distribuye cuantizado a 6 bits para MLX, la librería de Apple, y está pensado para ejecutarse en un Mac con silicio de Apple dentro de la aplicación wordspace. El repo ocupa 2,8 GB y el modelo consume 1,5 GB de memoria en ejecución, con 1,3 GB en disco. Soporta notas en italiano, inglés, español, francés, alemán y portugués, aunque las preguntas se formulan siempre en inglés. La licencia es Apache 2.0.

Su relevancia radica en el enfoque: en lugar de invocar un modelo generativo para cada comprobación pequeña y repetitiva, este clasificador resuelve la decisión en 0,14 s por consulta, dejando al modelo generativo solo la redacción. En las pruebas del autor supera ligeramente a LiquidAI d1-3B en 4 bits (280/292 frente a 270/292), aunque la diferencia no es estadísticamente significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B-Base), afinada con LoRA y fusionada |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como spec oficial; entrenado con entradas de hasta 1024 tokens |
| Tipos de cuantizacion | 6 bits (MLX); se menciona 4 bits con pérdida de precisión |
| Idiomas soportados | it, en, es, fr, de, pt (preguntas siempre en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de 1,7 mil millones de parámetros, y se afina con LoRA de rango 16 en todas las capas, que después se fusiona en los pesos base y se cuantiza a 6 bits para MLX. El entrenamiento usó 35.400 preguntas sintéticas generadas a partir de plantillas escritas a mano en seis idiomas, con contraejemplos diseñados para evitar atajos conocidos (mismo sujeto reformulado, notas cortas, documentos como fuentes, pares compatibles). La validación empleó plantillas que el entrenamiento nunca vio. Se usó AdamW con tasa de aprendizaje 1e-5, recorte de gradiente con norma 1 y parada temprana sobre la pérdida de validación (mejor en el paso 1500 de 4425). No se emplearon notas personales.

La innovación técnica está en la interfaz de inferencia: el prompt debe construirse carácter por carácter con `protocol.py`, y la respuesta se lee de los logits en la última posición. Para cada opción se toma el mejor de sus formatos de token (`yes`/`Yes`/`YES`, `A`/` A`, etc.) y se aplica un softmax sobre las opciones dividido por la temperatura de calibración (2,25, en `calibration.json`). Esa temperatura afecta a la confianza reportada, nunca a la opción elegida.

## Capacidades

- Clasificación binaria y de elección entre opciones en cuatro tareas: `contradiction` (¿dos notas se contradicen sobre lo mismo?), `hypothesis` (¿el valor está decidido o solo propuesto?), `update` (¿una nota posterior actualiza a una anterior o dos fuentes discrepan?) y `membership` (¿la nota pertenece a la página de tema?).
- Decisión en un único forward pass con probabilidad calibrada, sin generación de texto.
- Comprensión de notas en italiano, inglés, español, francés, alemán y portugués.
- Integración como componente de un pipeline mayor: el modelo generativo escribe citas y razones, este clasificador decide.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Mantenimiento de una wiki personal de notas: el clasificador decide si una nota nueva contradice una existente antes de que el modelo generativo reescriba la página, reduciendo falsas alarmas y llamadas costosas.
- Detección de contradicciones en bases de conocimiento internas: se compara cada par de fragmentos sobre el mismo tema y se marca solo lo que el clasificador considera contradictorio, con probabilidad calibrada para priorizar revisiones.
- Distinguir propuestas de decisiones firmes en actas de reunión o documentación de producto: la tarea `hypothesis` separa lo decidido de lo meramente sugerido.
- Resolución de versiones en documentación viva: la tarea `update` identifica si una nota posterior sustituye a una anterior o si dos fuentes entran en conflicto, útil en wikis y repositorios de notas.
- Enrutado de contenido a páginas de tema: la tarea `membership` decide si una nota pertenece a una página concreta, lo que permite clasificar automáticamente entradas entrantes.
- Filtro previo en pipelines de moderación o curación: descartar pares compatibles antes de invocar un modelo generativo, con un coste de 0,14 s por decisión y 1,5 GB de memoria en un Mac con silicio de Apple.
- Componente local en aplicaciones de notas para macOS: al ejecutarse con MLX y 6 bits, cabe en un portátil y evita enviar notas personales a servicios externos.

## Benchmarks y rendimiento

| Modelo | Gold (154) | Liquid bench (138) | Total (292) |
|---|---|---|---|
| LiquidAI d1-3B, MLX 4 bit | 139/154 | 131/138 | 270/292 |
| decider-1.7B-MLX-6bit | 143/154 | 137/138 | 280/292 |

Desglose por pregunta (gold y Liquid bench juntos): contradicción 196/208 (d1: 187), hipótesis 36/36 (35), actualización 24/24 (24), pertenencia 24/24 (24). En una sonda separada de 630 pares mínimos escritos a mano: 613/630. La diferencia frente a d1-3B no es estadísticamente significativa (test exacto de McNemar: 19 aciertos exclusivos de este modelo frente a 9 de d1, p = 0,087). Dentro de la comprobación de contradicciones de la wiki, con código que compara primero los hechos legibles, este modelo produce 2 falsas alarmas frente a 7 de d1-3B en los 154 casos gold, y reduce en un tercio las llamadas al modelo generativo (p = 0,07, no significativo).

Rendimiento en la app sobre un Mac con silicio de Apple: 0,14 s por decisión, 1,5 GB de memoria, 1,3 GB en disco.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,5 GB en ejecución con cuantización de 6 bits; 1,3 GB en disco.
- Plataforma objetivo: Mac con silicio de Apple mediante MLX; no se documenta soporte para CUDA ni ROCm.
- GPU recomendadas: no disponible; el modelo está empaquetado específicamente para MLX.
- Cabe en cualquier Mac con silicio de Apple con memoria unificada suficiente; el autor no detalla el mínimo.
- Despliegue: `mlx-lm` con `pip install mlx-lm` y descarga vía `hf download`; se incluye `example.py` y `protocol.py` para construir el prompt.
- Latencia: 0,14 s por decisión en la app sobre Mac con silicio de Apple. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado (292) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-1.7B-MLX-6bit | 1.720.574.976 | entradas de hasta 1024 tokens en entrenamiento | 280/292 | Apache 2.0 | Hugging Face, MLX 6 bits |
| LiquidAI d1-3B (MLX 4 bit) | no disponible en la información | no disponible | 270/292 | no disponible | MLX 4 bits |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Más débil que d1-3B en contradicciones entre números y fechas (39/43 frente a 43/43) y en contradicciones implícitas que requieren conocimiento del mundo (6/11 frente a 8/11).
- Entrenado solo para las cuatro preguntas y el formato de prompt descritos; otras preguntas o formulaciones no están probadas.
- Las entradas de más de 1024 tokens no aparecieron en el entrenamiento.
- Cuantizar por debajo de 6 bits degrada la precisión en el conjunto gold (4 bits: 267/292).
- El prompt debe construirse exactamente con `protocol.py`; cualquier variación en el texto invalida la calibración y la decisión.
- La temperatura de calibración (2,25) altera la confianza reportada, no la opción elegida; no debe interpretarse como una probabilidad sin calibrar.
- Las diferencias frente a d1-3B no son estadísticamente significativas; no debe presentarse como una mejora demostrada.
- No se documentan sesgos específicos ni tasas de alucinación, aunque al ser un clasificador cerrado el riesgo de generación libre es nulo; el riesgo está en clasificaciones erróneas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3-1.7B-Base; conviene revisar la licencia y el archivo `NOTICE` del modelo base y de los cambios.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wordspace/decider-1.7B-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Aplicación wordspace: https://getwordspace.com
