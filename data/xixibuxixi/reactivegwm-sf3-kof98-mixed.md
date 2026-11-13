# xixibuxixi/reactivegwm-sf3-kof98-mixed

## Resumen

ReactiveGWM SF3 + KOF98 mixed es un checkpoint de investigación publicado por el usuario xixibuxixi en Hugging Face. Se trata de un modelo de generación de vídeo con arquitectura de world model, obtenido mediante fine-tuning del modelo ReactiveGWM v2 (pesos `SF3/main` del autor original) sobre un conjunto mixto de datos de videojuegos de lucha: 10.000 registros de Street Fighter III y 10.000 de The King of Fighters '98. El objetivo del modelo es aprender la evolución del latent de vídeo futuro condicionado a acciones de personaje, información de control y texto condicional.

El checkpoint subido corresponde al paso 2.000 de un entrenamiento planificado a 20.000 pasos de optimización, por lo que se trata de un snapshot intermedio y no de un modelo final. El autor indica explícitamente que el repositorio está pensado para pruebas de inferencia y evaluación cualitativa, y que no se ha ejecutado una validación independiente ni se han publicado métricas de calidad. El entrenamiento se realizó sobre 8 GPU H20 en bf16 con un batch efectivo global de 16 y una tasa de aprendizaje de 5e-5.

La relevancia de este checkpoint es acotada: no es un modelo de propósito general ni un lanzamiento oficial, sino un experimento de continuación de entrenamiento sobre un world model de vídeo aplicado a juegos de lucha. Resulta útil para investigadores interesados en world models para videojuegos, generación de vídeo condicionada por acciones y reproducción de dinámicas de juego, siempre teniendo en cuenta su carácter incompleto y la ausencia de evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model de generación de vídeo basado en ReactiveGWM v2 (no se detalla la arquitectura interna en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (entrada de vídeo de 101 fotogramas a 20 fps) |
| Tipos de cuantización | no disponible (pesos en bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible (condicionamiento por texto; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoint-2000/model.safetensors`), acompañado de `config.yaml` y `metadata.json` |

## Arquitectura y entrenamiento

El modelo parte de los pesos publicados por el autor de ReactiveGWM v2 bajo el identificador `SF3/main` y se continúa entrenando con un objetivo de flow matching sobre latentes futuros (`future_latent_flow_matching_mse`) para generación de vídeo causal condicionada. La entrada de entrenamiento combina vídeo, información de personaje y control, y texto condicional; el modelo aprende la transición del latent de vídeo dado un contexto de acciones o reglas de condición. La arquitectura interna concreta (tipo de transformer, mecanismo de atención, compresión latente) no se detalla en la información disponible y debe consultarse en el repositorio de ReactiveGWM.

El conjunto de datos empleado suma 20.000 registros (10.000 de SF3 y 10.000 de KOF98) en formato de vídeo de 832 × 480 píxeles, 101 fotogramas y 20 fps. El entrenamiento se ejecutó en 8 GPU H20 con precisión bf16, microbatch de 1 por GPU, acumulación de gradientes de 2 y batch efectivo global de 16, con tasa de aprendizaje 5e-5. Los primeros 1.000 pasos usaron batch efectivo 8 y después se reanudó desde el estado completo con batch 16, por lo que `samples_seen=24000` en el paso 2.000 incluye muestreo repetido y no equivale a 24.000 vídeos distintos. El checkpoint se guardó en el paso 2.000 de un objetivo de 20.000, con guardado cada 500 pasos. No se subieron estados de optimizador, scheduler, RNG ni sampler, por lo que el checkpoint sirve para inferencia pero no para reanudar el entrenamiento de forma continua. El código de entrenamiento se basa en el commit `8d6a9aff0bb96a044827e6a7121e05209d1e7fce` de ReactiveGWM, y el repositorio solo contiene el checkpoint: el código de inferencia, el VAE externo, la caché de texto y los vídeos originales deben prepararse por separado.

## Capacidades

- Generación de vídeo causal condicionada por acciones de personaje y control, orientada a la simulación de dinámicas de juego de lucha.
- Modelado de world model: predicción de la evolución del latent de vídeo futuro a partir del contexto.
- Condicionamiento por texto para reglas o condiciones de generación.
- Entrenado específicamente sobre dos juegos de lucha (Street Fighter III y The King of Fighters '98), por lo que su especialización está limitada a dominios visuales y mecánicas similares.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el condicionamiento textual no especifica cobertura de idiomas.

## Casos de uso

- Investigación en world models para videojuegos: el checkpoint permite estudiar cómo un modelo de vídeo aprende transiciones de estado en juegos de lucha y comparar la fidelidad de la predicción latente con el vídeo real.
- Generación de vídeo sintético de combate: útil para producir clips de SF3 o KOF98 condicionados por acciones, con fines de aumento de datos o análisis de dinámicas de juego.
- Pruebas de continuación de entrenamiento: sirve como punto de partida documentado (paso 2.000) para experimentos de fine-tuning adicional sobre ReactiveGWM, aunque sin estados de optimizador no permite reanudación exacta.
- Evaluación cualitativa de flow matching en vídeo: investigadores pueden inspeccionar visualmente la calidad de la generación condicionada y contrastarla con la loss de entrenamiento, que el autor advierte que no debe tomarse como prueba de calidad final.
- Reproducción de experimentos de mezcla de datasets: el par SF3 + KOF98 permite estudiar el efecto de combinar dos dominios de juego en un mismo world model.
- Docencia y divulgación sobre generación de vídeo condicionada: como ejemplo práctico de pipeline de entrenamiento con VAE externo, caché de texto y datos de vídeo a 832 × 480 y 20 fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este snapshot no ha sido evaluado en un conjunto de validación independiente y que no existen métricas de calidad; solo se dispone de la loss de entrenamiento, que no debe interpretarse como evidencia de rendimiento final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del modelo, que no se especifica.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU H20; para inferencia se requiere hardware con capacidad suficiente para cargar los pesos en bf16, pero no se detalla el mínimo.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor remite al código de inferencia de ReactiveGWM y a la preparación manual de VAE, caché de texto y entradas de prueba.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReactiveGWM SF3 + KOF98 mixed (este checkpoint) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face, checkpoint paso 2.000 |
| ReactiveGWM v2 (modelo base, `SF3/main`) | no disponible | no disponible | no disponible en esta información | no disponible | GitHub del proyecto original |
| HY-WorldPlay | no disponible | no disponible | no disponible en esta información | no disponible | mencionado como experimento independiente, sin pesos subidos |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría; la información proporcionada no incluye parámetros, contexto ni métricas de los modelos comparables.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 2.000 de 20.000, por lo que la calidad de generación puede ser sustancialmente inferior a la de un modelo completamente entrenado.
- Sin evaluación independiente: no hay métricas de calidad ni validación en conjunto de test; la loss de entrenamiento no es prueba de rendimiento.
- No reanudable: no se subieron estados de optimizador, scheduler, RNG ni sampler, por lo que no permite continuar el entrenamiento de forma exacta.
- Dependencias externas: requiere el código de inferencia de ReactiveGWM, un VAE externo, caché de texto y datos de vídeo preparados por el usuario.
- Dominio muy restringido: entrenado solo con SF3 y KOF98; no se espera generalización a otros juegos, estilos visuales o tareas de vídeo general.
- Sesgos conocidos: no documentados, pero al derivar de datos de videojuegos de lucha puede reproducir sesgos visuales y de dinámica de esos títulos.
- Riesgo de alucinación visual: no cuantificado; en generación de vídeo condicionada puede producir transiciones no realistas.
- Licencia no especificada: no se confirma permiso para uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Idiomas: no se especifica cobertura ni calidad del condicionamiento textual en distintos idiomas.
- `samples_seen=24000` incluye muestreo repetido y no representa 24.000 vídeos únicos, lo que conviene tener en cuenta al interpretar el volumen efectivo de datos.

## Enlaces

- Hugging Face: https://huggingface.co/xixibuxixi/reactivegwm-sf3-kof98-mixed
- Repositorio ReactiveGWM: https://github.com/INV-WZQ/ReactiveGWM
- Instrucciones de inferencia de ReactiveGWM: https://github.com/INV-WZQ/ReactiveGWM/blob/main/inference/README.md
