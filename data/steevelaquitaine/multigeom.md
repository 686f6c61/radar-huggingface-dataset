# steevelaquitaine/multigeom

## Resumen

Multigeom es un repositorio de checkpoints entrenados publicado por el usuario steevelaquitaine como material suplementario de un articulo presentado en NeurIPS 2026 sobre geometria de la informacion multiescala. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de pesos para dos etapas de un pipeline de modelado neuronal: codificadores (encoders) que combinan un backbone congelado con una readout gaussiana, y modelos de difusion condicionales que modelan la distribucion de respuestas neuronales.

El repositorio cubre dos dominios biologicos. Por un lado, el cortex visual con encoders de tipo Inception, ResNet50 y un modelo ON/OFF, evaluados sobre las areas V1 y V4. Por otro, la retina, con adaptaciones de los modelos de celula de Lorenzi (open-retina) y difusiones condicionales de su mosaico, entrenadas sobre TinyImageNet con ruido de respuesta Poisson y imagenes de 120 x 120 pixeles.

Su relevancia es acotada y muy especializada: sirve a investigadores en neurociencia computacional que quieran reproducir los resultados del paper o reutilizar los checkpoints para analisis de geometria de la informacion (matriz de Fisher, sensibilidad, representaciones). No es un modelo para generacion de texto, codigo ni tareas de NLP, y no ofrece pipeline de Hugging Face ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders con backbone congelado y readout gaussiano; modelos de difusion condicionales |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entradas de imagen, 120 x 120 en retina) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante, `.pt`) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`best_model.pt`, `final_model.pt`) |

## Arquitectura y entrenamiento

El repositorio organiza los pesos en dos etapas. La etapa 1 corresponde a un codificador formado por un backbone congelado mas una readout gaussiana, disponible con tres variantes de backbone (`inception`, `resnet50`, `onoff`) y para dos areas corticales (`V1`, `V4`). La etapa 3 es un modelo de difusion condicional que modela la distribucion de respuestas dado el estimulo, con la misma organizacion por encoder y area.

En el dominio de retina se incluyen las adaptaciones de celula de Lorenzi (open-retina) y las difusiones condicionales de su mosaico. Segun la model card, el modelo de difusion de retina se entrena sobre TinyImageNet con ruido de respuesta Poisson y sobre imagenes de 120 x 120, y sus ficheros almacenan ademas las estadisticas de respuesta y la exposicion Poisson. La carga requiere el paquete `openretina` con su modulo de geometria de la informacion (`multigeom.encoders.retina.load_retina`). No se detallan en la informacion disponible el numero de tokens ni la composicion exacta de los datasets, ni si hubo RLHF o DPO (no aplicable en este contexto).

## Capacidades

- Codificacion de estimulos visuales: los encoders producen representaciones de la respuesta neuronal para las areas V1 y V4.
- Modelado generativo condicional: los modelos de difusion generan distribuciones de respuesta condicionadas al estimulo.
- Analisis de geometria de la informacion: el diseno del repositorio y sus etiquetas (`fisher-information`) apuntan al calculo de metricas como la matriz de Fisher sobre las representaciones.
- Modelado de retina: adaptaciones por tipo de celula y modelo de mosaico con ruido Poisson.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion de resultados del paper de NeurIPS 2026: descargar los checkpoints con `huggingface-cli download steevelaquitaine/multigeom --local-dir runs` y ejecutar el codigo del repositorio asociado para replicar las figuras y metricas.
- Analisis de sensibilidad en V1 y V4: cargar los encoders `inception`, `resnet50` u `onoff` y calcular derivadas o metricas de Fisher sobre las respuestas para estudiar como codifica el sistema visual.
- Estudio de la variabilidad neuronal: usar los modelos de difusion condicionales para muestrear distribuciones de respuesta y comparar con registros reales.
- Modelado de mosaicos de retina: emplear los checkpoints `lorenzi` por tipo de celula (por ejemplo `retina-W3_176-exp7`) para simular respuestas con ruido Poisson.
- Comparacion entre backbones: evaluar como cambia la geometria de la representacion al sustituir Inception por ResNet50 o el modelo ON/OFF en la misma area.
- Docencia e investigacion en neurociencia computacional: material listo para experimentar con geometria de la informacion sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del backbone concreto y del area. El repositorio completo ocupa 2,9 GB, por lo que un checkpoint individual es manejable en GPU de consumo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del repo, es plausible su ejecucion en GPUs consumer (por ejemplo, RTX 3090 o 4090), pero no se confirma.
- Cabe en GPU consumer: probable, sin datos oficiales que lo confirmen.
- Opciones de despliegue: carga directa en PyTorch; para retina se requiere el paquete `openretina`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (checkpoints de neurociencia computacional con geometria de la informacion).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts conversacionales.
- No dispone de pipeline de Hugging Face ni de idiomas declarados; su uso esta ligado al codigo del repositorio del paper.
- La carga de los modelos de retina depende del paquete `openretina` y de su modulo de geometria de la informacion; sin el, los checkpoints no son utilizables directamente.
- Los pesos de retina estan entrenados sobre TinyImageNet con ruido Poisson y 120 x 120; generalizar a otros dominios o resoluciones no esta garantizado.
- Riesgo de sobreinterpretacion: los resultados dependen de las condiciones experimentales del paper; no se documentan sesgos especificos.
- Licencia MIT: permite uso comercial, pero conviene citar el paper y respetar las condiciones de los datos de origen (TinyImageNet, open-retina).
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/steevelaquitaine/multigeom
- Codigo del paper: https://github.com/<owner>/MultiscaleInformationGeometry (el propietario aparece sin especificar en la model card)
- open-retina (paquete `openretina`): no disponible en la informacion proporcionada
- Paper NeurIPS 2026: no disponible en la informacion proporcionada
