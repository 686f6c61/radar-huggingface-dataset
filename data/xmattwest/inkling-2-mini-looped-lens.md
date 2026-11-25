# xmattwest/inkling-2-mini-looped-lens

## Resumen

Inkling-2-Mini Looped Lens Translators es un conjunto de pesos auxiliares de interpretabilidad, no un modelo de lenguaje autónomo. Lo publica el usuario xmattwest (equipo "west") como participación en el NDIF Looped Lens Challenge, un reto centrado en el análisis de representaciones internas de modelos. Los pesos consisten en traductores afines residuales de rango 128 (`entry_v1_weights.safetensors`) que se aplican sobre las activaciones del modelo base `thinkingmachines/Inkling-2-Mini`.

La técnica empleada es la destilación KL con softcap sobre prompts sintéticos, un enfoque propio de las herramientas de tipo tuned lens: se entrena una transformación afín que aproxima la salida de capas finales a partir de las activaciones de capas intermedias, de modo que un observador pueda inspeccionar qué "piensa" el modelo en cada profundidad. El repositorio es muy ligero (0,1 GB) y se distribuye bajo licencia MIT.

Su relevancia es acotada pero concreta: sirve a investigadores que quieran auditar el modelo base Inkling-2-Mini sin reentrenar sus propias lentes, y como referencia metodológica para quienes trabajen en interpretabilidad mecanicista de transformers. No debe confundirse con un modelo generativo: no responde a prompts de usuario ni tiene contexto propio en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Traductores afines residuales (rank-128) sobre activaciones de un transformer; no es un modelo generativo completo |
| Parametros totales | no disponible (el repo pesa 0,1 GB; los pesos son `entry_v1_weights.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors de precisión nativa |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`entry_v1_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado desde cero, sino un conjunto de traductores afines de rango 128 que se insertan sobre las activaciones residuales del modelo base `thinkingmachines/Inkling-2-Mini`. La formulación "looped lens" sugiere que las lentes se aplican de forma iterativa o recurrente a lo largo de las capas, de manera análoga a los tuned lens clásicos, pero con una parametrización de bajo rango que reduce drásticamente el número de parámetros por capa.

El entrenamiento se realizó mediante destilación KL con softcap sobre prompts sintéticos. La destilación KL aproxima la distribución de salida del modelo completo (profesor) desde la representación intermedia (estudiante), y el softcap limita la magnitud de los logits para estabilizar el entrenamiento y evitar saturaciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si hubo fases adicionales de ajuste. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Interpretabilidad de representaciones internas: permite proyectar activaciones intermedias del modelo base a un espacio de logits interpretable.
- Análisis por capas: al ser lentes "looped", facilitan estudiar la evolución de la predicción a lo largo de la profundidad del modelo.
- Destilación KL con softcap: la metodología subyacente puede reutilizarse para entrenar lentes sobre otros modelos.
- Reproducibilidad: pesos publicados en safetensors y licencia MIT, lo que permite inspección y reutilización sin restricciones.
- No soporta tool calling, function calling, agentes, modo thinking, visión ni audio: es un artefacto de análisis, no un modelo conversacional.
- Capacidades multilingües: no disponibles; dependen del modelo base y no se documentan.

## Casos de uso

- Auditoría de representaciones en Inkling-2-Mini: cargar `entry_v1_weights.safetensors` junto al modelo base y observar cómo evoluciona la distribución de salida capa a capa, útil para detectar sesgos o circuitos internos.
- Investigación en interpretabilidad mecanicista: usar las lentes como línea base en experimentos de probing y compararlas con tuned lens entrenadas ad hoc.
- Reproducción del NDIF Looped Lens Challenge: sirve como referencia para otros equipos que quieran comparar su metodología de destilación KL con softcap.
- Docencia y divulgación: explicar visualmente cómo un transformer construye su predicción a lo largo de las capas con un artefacto ligero (0,1 GB) y de licencia permisiva.
- Desarrollo de herramientas de depuración: integrar las lentes en un pipeline interno que monitorice activaciones durante la inferencia del modelo base para detectar comportamientos anómalos.
- Base para transferencia de técnicas: adaptar el esquema de traductores afines de rango 128 a otros modelos de la misma familia o arquitectura, reutilizando el código y los hiperparámetros publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para las lentes en sí (0,1 GB en disco); el consumo real lo determina el modelo base Inkling-2-Mini, cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: no disponible; depende del modelo base sobre el que se apliquen las lentes.
- Compatibilidad con GPU de consumo: los pesos de las lentes caben en cualquier GPU, pero la inferencia del modelo base condiciona el requisito real.
- Opciones de despliegue: carga directa de safetensors con PyTorch o safetensors; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xmattwest/inkling-2-mini-looped-lens | Lentes de interpretabilidad (rank-128) | no disponible | no disponible | MIT | Hugging Face |
| Tuned lens (Belrose et al.) | Lentes de interpretabilidad | por capa, tamaño variable | no aplica | MIT (implementación de referencia) | GitHub |
| Logit lens | Técnica de inspección sin entrenamiento | 0 | no aplica | no aplica | pública |
| Modelo base thinkingmachines/Inkling-2-Mini | Modelo generativo | no disponible | no disponible | no disponible | Hugging Face |

La comparación es aproximada: las lentes de este repositorio son un artefacto derivado, no un modelo competidor. Frente al logit lens clásico, añaden parámetros entrenados (rango 128) que corrigen la base de las activaciones; frente a las tuned lens de referencia, emplean destilación KL con softcap y están especializadas en un único modelo base.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como tal produciría resultados sin sentido.
- Dependencia estricta del modelo base `thinkingmachines/Inkling-2-Mini`: las lentes no son portables a otras arquitecturas ni a otras versiones del modelo.
- Sesgos: al entrenarse sobre prompts sintéticos, las lentes pueden no cubrir la distribución real de uso y ofrecer interpretaciones sesgadas en dominios no representados.
- Riesgo de interpretación errónea: una lente es una aproximación; conclusiones sobre "lo que piensa" el modelo deben contrastarse con otras técnicas (ablaciones, probing lineal).
- Idiomas y contexto: no documentados; cualquier limitación del modelo base se hereda.
- Licencia MIT: permite uso comercial y modificación, pero no hay garantías de exactitud ni soporte del autor.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa conocida.
- Falta de documentación sobre hiperparámetros de entrenamiento, tamaño del dataset sintético y métricas de fidelidad de las lentes.

## Enlaces

- Hugging Face: https://huggingface.co/xmattwest/inkling-2-mini-looped-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF (National Deep Inference Fabric): https://ndif.us/
- Tuned lens (referencia metodológica): https://github.com/AlignmentResearch/tuned-lens
