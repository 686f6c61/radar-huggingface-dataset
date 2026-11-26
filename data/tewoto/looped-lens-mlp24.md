# tewoto/looped-lens-mlp24

## Resumen

Looped-lens-mlp24 es un artefacto de interpretabilidad publicado por el usuario tewoto (equipo Tony W) en el marco del desafio "looped-lens-challenge". No es un modelo de lenguaje generativo autonomo, sino un decodificador auxiliar especifico: un MLP de 24 neuronas ocultas que mapea un estado activo de un modelo base (denominado "Inkling 2 Mini") a un estado de entrada de capa predicho. En concreto, toma el estado que entra en la visita 24 (capa 12, segunda pasada) en la posicion de lectura y predice el estado de entrada de la capa 18, que el sistema de entrada parchea en la ranura de lectura y decodifica con las propias capas 18-23 y el unembedding del modelo base.

El interes tecnico reside en su funcion de sonda (probe) entrenada sobre las propias trazas de razonamiento del modelo, concretamente en el estado inmediatamente anterior a que escriba una palabra de pensamiento, sin emplear ninguna pregunta del desafio. Esto lo convierte en una herramienta de analisis de circuitos internos y de dinamica de capas en arquitecturas con pasadas repetidas (looped), mas que en un componente desplegable para inferencia de proposito general.

La relevancia es acotada y experimental: el repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes, y no expone informacion sobre el modelo base subyacente, sus dimensiones o su contexto. Debe tratarse como material de investigacion en interpretabilidad mecanicista, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 24 neuronas ocultas (decodificador de estados) sobre un modelo base "Inkling 2 Mini" con capas repetidas (looped) |
| Parametros totales | no disponible (el repositorio declara 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio declara 0.0 GB; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

El componente es una cabeza MLP de una sola capa oculta con 24 unidades, segun la formula publicada en la model card: se normaliza y centra el estado de entrada `h`, se proyecta con una matriz `W0` sobre una representacion de dimension 48 (`48 z`), se aplica activacion GELU, se suma el sesgo `b0`, se proyecta con `W2` y se suma `b2`, y finalmente se reescala y proyecta sobre una base (`basis`) sumando la media (`mean`) para producir el estado predicho. La entrada corresponde al estado activo que entra en la visita 24 (capa 12, segunda pasada) en la posicion de lectura; la salida es el estado de entrada de la capa 18.

El entrenamiento se realizo sobre las propias trazas de razonamiento del modelo base, tomando el estado inmediatamente anterior a la escritura de una palabra de pensamiento, y explicitamente sin usar ninguna pregunta del desafio. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en principio a un modulo de este tipo). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; la unica innovacion descrita es el propio esquema de parcheo de estados entre capas y pasadas para decodificar con las capas 18-23 y el unembedding del modelo base.

## Capacidades

- Prediccion de estados internos: mapea el estado de entrada de la visita 24 (capa 12, pasada 2) en la posicion de lectura al estado de entrada de la capa 18.
- Decodificacion por parcheo: el estado predicho se inserta en la ranura de lectura y se decodifica con las capas 18-23 y el unembedding del modelo base.
- Analisis de dinamica de capas en arquitecturas con pasadas repetidas (looped), permitiendo estudiar como evoluciona la representacion entre visitas.
- Entrenamiento sobre trazas de razonamiento, orientado a inspeccionar el estado previo a la emision de palabras de pensamiento.
- No soporta tool calling ni function calling (no documentado, y no es un modelo de chat).
- No soporta agentes ni razonamiento multi-paso de forma autonoma; es un modulo de sonda, no un generador.
- Capacidades multilingues: no disponibles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el MLP como sonda para comprobar si el estado de la capa 12 en la segunda pasada contiene informacion suficiente para predecir el estado de entrada de la capa 18, cuantificando la fidelidad de la prediccion frente al estado real.
- Analisis de circuitos en modelos con capas repetidas: estudiar la transformacion entre visitas sucesivas y localizar donde se consolida la representacion antes de la decodificacion final con las capas 18-23.
- Auditoria de trazas de razonamiento: al estar entrenado sobre el estado previo a la escritura de palabras de pensamiento, permite examinar que informacion esta disponible en ese punto del calculo y como se propaga.
- Validacion de tecnicas de parcheo de activaciones (activation patching): el esquema de insertar el estado predicho en la ranura de lectura sirve como banco de pruebas para metodos de intervencion sobre estados internos.
- Reproduccion de experimentos del looped-lens-challenge: el artefacto permite replicar y comparar variantes de decodificadores (por ejemplo, con distinto numero de neuronas ocultas) dentro del mismo marco experimental.
- Docencia y divulgacion tecnica: por su tamano minimo (24 unidades ocultas) y su formula explicita, es un ejemplo didactico de sonda lineal/MLP sobre estados ocultos de un transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio declara 0.0 GB y no se especifican pesos.
- GPU recomendadas: no disponible. Por el tamano descrito del modulo (MLP de 24 unidades ocultas), la sonda en si seria ejecutable en CPU, pero requiere el modelo base "Inkling 2 Mini" para el parcheo y la decodificacion con las capas 18-23, cuyos requisitos no se documentan.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI; el formato de pesos no se especifica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (decodificadores de estados para interpretabilidad en el marco looped-lens-challenge).

## Limitaciones y advertencias

- Ambito muy restringido: no es un modelo de lenguaje; solo predice un estado de entrada de capa para un modelo base concreto ("Inkling 2 Mini") y una posicion y visita especificas.
- Dependencia del modelo base: sin acceso a "Inkling 2 Mini", sus capas 18-23 y su unembedding, el artefacto no produce texto utilizable.
- Repositorio vacio o no verificado: 0.0 GB de tamano, 0 descargas y 0 likes; no se confirma la presencia de pesos ni de codigo de carga.
- Falta de documentacion: no se detallan datos de entrenamiento, metricas de fidelidad de la prediccion, idiomas ni formato de pesos.
- Riesgo de sobreajuste a las trazas de razonamiento empleadas: al entrenarse sobre estados previos a palabras de pensamiento del propio modelo, su validez fuera de esa distribucion no esta caracterizada.
- Licencia MIT: permite uso comercial y modificacion, pero al no existir garantias ni documentacion de rendimiento, no es apta para produccion sin validacion previa.
- Sin informacion sobre sesgos ni tasas de alucinacion; al no generar texto de forma autonoma, estos riesgos recaen en el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/tewoto/looped-lens-mlp24
