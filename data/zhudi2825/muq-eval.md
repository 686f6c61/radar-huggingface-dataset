# zhudi2825/MuQ-Eval

## Resumen

MuQ-Eval es una métrica de calidad objetiva y por muestra para música generada por IA. A diferencia de métricas distribucionales como Fréchet Audio Distance (FAD), que solo comparan la distribución global de un conjunto de clips, MuQ-Eval asigna una puntuación individual a cada fragmento de audio correlacionada con la valoración humana. El modelo lo desarrollan Di Zhu, Zihan Chen y Zixuan Li, y se publica en el repositorio `zhudi2825/MuQ-Eval` bajo licencia MIT.

Técnicamente no es un modelo generativo, sino un cabezal de predicción ligero (en torno a 2 millones de parámetros entrenables) montado sobre el encoder congelado `OpenMuQ/MuQ-large-msd-iter` (310M parámetros), con adaptación LoRA y pooling de media ponderada por atención. Predice dos dimensiones de calidad: MI (Musical Impression) y TA (Technical Artifacts), usando una pérdida de entropía cruzada ordinal (`ordinal_ce`).

Es relevante porque cubre un hueco práctico en la evaluación de sistemas texto-a-música (TTM): permite comparar clips concretos y detectar artefactos técnicos sin depender de costosas evaluaciones humanas. La variante publicada aquí es la A3a, que incorpora LoRA sobre el encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MuQ-large-msd-iter congelado (310M) + adaptación LoRA + pooling de media ponderada por atención + cabezales de predicción MI/TA |
| Parametros totales | ~2M entrenables (cabezales + LoRA); encoder base de 310M congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de máximo 10,0 s a 24 kHz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la tarea es de audio; el idioma no condiciona la predicción) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) + `config.yaml` |

## Arquitectura y entrenamiento

MuQ-Eval reutiliza las representaciones del encoder musical MuQ (`OpenMuQ/MuQ-large-msd-iter`), que se mantiene congelado salvo por adaptadores LoRA. Sobre esas representaciones se aplica un pooling de media ponderada por atención y dos cabezales independientes que predicen las puntuaciones MI (impresión musical) y TA (artefactos técnicos). La función de pérdida es entropía cruzada ordinal, adecuada para etiquetas de calidad con orden natural.

El entrenamiento se realiza sobre el dataset MusicEval, compuesto por 2.748 clips generados por 31 sistemas texto-a-música distintos. La evaluación se hace con validación cruzada de 5 pliegues. La entrada es波形 mono a 24 kHz truncada a 10,0 s (240.000 muestras). No se detalla en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplica, al no ser un modelo generativo).

## Capacidades

- Predicción de calidad musical por muestra, con dos puntuaciones: MI (Musical Impression) y TA (Technical Artifacts).
- Clasificación de audio orientada a evaluación de sistemas de generación musical.
- Correlación con juicios humanos a nivel de sistema y de utterance (ver benchmarks).
- Procesamiento de audio mono a 24 kHz con ventana máxima de 10 s.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de clasificación, no un LLM.
- No tiene capacidades multilingües en el sentido textual ni modo thinking, visión o audio generativo.

## Casos de uso

- Evaluación automática de pipelines texto-a-música: puntuar cada clip generado con MI y TA para comparar checkpoints o configuraciones de sampling sin recurrir a anotadores humanos.
- Control de calidad en producción de plataformas de generación musical: filtrar clips con TA bajo (artefactos, clipping, ruido) antes de servirlos al usuario.
- Investigación en métricas de audio: usar MuQ-Eval como referencia por muestra frente a FAD y analizar correlaciones con MOS humano.
- Selección de mejores candidatos (best-of-N): generar varias muestras por prompt y elegir la de mayor puntuación MI para mejorar la calidad percibida.
- Ajuste fino de modelos TTM: emplear las puntuaciones como señal de recompensa o criterio de early stopping en experimentos de alineamiento.
- Auditoría de datasets musicales: detectar clips sintéticos de baja calidad dentro de corpus mixtos antes de usarlos en entrenamiento.
- Benchmarking interno: construir un ranking reproducible de sistemas TTM con las puntuaciones por sistema y por utterance.

## Benchmarks y rendimiento

Resultados publicados en la model card (validación cruzada de 5 pliegues sobre MusicEval: 2.748 clips, 31 sistemas TTM):

| Modelo | System SRCC | Utterance SRCC | Params | VRAM |
|---|---|---|---|---|
| A1 (Frozen + MSE) | 0,957 | 0,838 | ~1M | ~3 GB |
| A3a (+LoRA) | 0,960 | 0,835 | ~2M | ~4 GB |

No se han publicado en la información disponible resultados frente a otras métricas (FAD, CLAP, etc.) ni comparaciones con evaluadores humanos externos más allá de estas cifras.

## Requisitos de hardware

- VRAM estimada: ~4 GB para la variante A3a (según la model card); ~3 GB para A1.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; una RTX 3060/4060 es suficiente. Para lotes grandes, A100 o H100 aceleran el throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060, 4070, 4080, 4090 y equivalentes.
- Opciones de despliegue: PyTorch nativo (el repo requiere el directorio `src` del repositorio oficial en GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Params | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MuQ-Eval (A3a) | Métrica por muestra | ~2M (+310M encoder) | MI + TA con LoRA sobre MuQ | MIT | HuggingFace + GitHub |
| FAD | Métrica distribucional | no aplica | Distancia entre distribuciones | según implementación | Ampliamente usado |
| CLAP score | Métrica de alineación | ~100M+ | Similitud audio-texto | según checkpoint | HuggingFace |
| MOS predictores genéricos (p. ej. DNSMOS) | Métrica por muestra | variable | Calidad de voz | variable | Disponible |

No se dispone de comparaciones numéricas directas con FAD, CLAP ni DNSMOS en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre MusicEval (31 sistemas TTM); puede generalizar mal a géneros, idiomas o fuentes de audio fuera de esa distribución.
- Ventana máxima de 10 s: clips más largos deben truncarse, lo que puede perder información relevante.
- Entrada obligatoria mono a 24 kHz; un preprocesado incorrecto degrada las predicciones.
- Riesgo de sesgo hacia los estilos y sistemas representados en MusicEval.
- No es un modelo generativo: no produce audio ni texto; usarlo fuera de la tarea de evaluación no tiene sentido.
- Licencia MIT permite uso comercial, pero conviene revisar la licencia del encoder base `OpenMuQ/MuQ-large-msd-iter` antes de desplegar en producción.
- Requiere el código del repositorio GitHub (`src`) para cargar el checkpoint; no es autónomo solo con HuggingFace.
- No se documentan calibraciones ni intervalos de confianza de las puntuaciones.

## Enlaces

- HuggingFace: https://huggingface.co/zhudi2825/MuQ-Eval
- Paper: https://huggingface.co/papers/2603.22677
- arXiv: https://arxiv.org/abs/2603.22677
- Código: https://github.com/dgtql/MuQ-Eval
- Encoder base: https://huggingface.co/OpenMuQ/MuQ-large-msd-iter
