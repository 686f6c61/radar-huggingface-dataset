# sunit12/tiny-aya-global-codemix-refusal-lora

## Resumen

`sunit12/tiny-aya-global-codemix-refusal-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario sunit12 sobre el modelo base CohereLabs/tiny-aya-global. No se trata de un modelo completo, sino de un conjunto de pesos delta PEFT (0,1 GB en el repositorio) que debe cargarse junto al modelo base para funcionar. Por el nombre del repositorio y las etiquetas disponibles, el adaptador parece orientado a dos objetivos: manejo de *code-mixing* (mezcla de idiomas dentro de una misma conversacion) y comportamiento de rechazo (*refusal*) ante peticiones problematicas.

El modelo base, Tiny Aya Global, pertenece a la familia Tiny Aya de Cohere Labs, una linea de modelos pequenos multilingues disenada para cubrir un numero elevado de idiomas con un coste computacional reducido. Segun la referencia disponible (arXiv 2603.11510v1), Tiny Aya Global destaca por ser el modelo mas seguro de los evaluados en el conjunto MultiJail, con tasas de respuesta segura mas altas en los 10 idiomas cubiertos por dicho benchmark, a costa de un ligero incremento en rechazos excesivos (*over-refusals*) en comparacion con competidores que, segun el paper, rechazan demasiado poco.

La relevancia de este adaptador es acotada pero concreta: propone una via de bajo coste para reforzar el comportamiento de seguridad y la robustez ante entradas mezcladas de idiomas en un modelo pequeno multilingue, algo util en despliegues con requisitos de moderacion. La model card del autor esta practicamente vacia (plantilla sin rellenar), por lo que la mayor parte de los detalles tecnicos del ajuste no estan documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (adaptador de 0,1 GB; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin dato explicito) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el modelo base es multilingue; el adaptador se asocia a *code-mixing*) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante la libreria TRL (version de PEFT declarada: 0.21.3). No se especifican rango, alpha, modulos objetivo ni hiperparametros de entrenamiento. El modelo base es un transformer decoder-only de la familia Tiny Aya, orientado a generacion de texto conversacional; no se dispone de datos sobre su numero de parametros, numero de capas ni ventana de contexto en la informacion proporcionada.

El nombre del repositorio sugiere que el entrenamiento combino ejemplos de *code-mixing* (alternancia de idiomas en una misma conversacion) con ejemplos de rechazo ante peticiones no permitidas, probablemente para reducir la tasa de respuestas inseguras en entradas multilingues mezcladas. No hay informacion sobre el volumen de datos, la composicion del dataset, el uso de RLHF/DPO ni sobre innovaciones tecnicas adicionales. La model card no documenta ni el procedimiento ni los datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional multilingue, heredada del modelo base Tiny Aya Global.
- Manejo de entradas con mezcla de idiomas (*code-mixing*), segun la orientacion declarada en el nombre del adaptador.
- Comportamiento de rechazo ante peticiones potencialmente daninas, reforzado mediante SFT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo *thinking*, vision o audio: no disponible.
- Capacidades multilingues especificas: no disponible el listado de idiomas cubiertos por el adaptador.

## Casos de uso

- Moderacion y filtrado en chat multilingue: el adaptador puede integrarse en un pipeline de atencion al cliente donde los usuarios alternan idiomas en una misma frase, aprovechando el refuerzo de rechazo para bloquear solicitudes abusivas sin depender de un clasificador externo.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA de 0,1 GB sobre un modelo Tiny Aya, permite anadir comportamiento de seguridad a un modelo pequeno sin reentrenar ni servir un modelo adicional de gran tamano.
- Investigacion sobre *code-mixing*: util como punto de partida para estudiar como responde un modelo pequeno cuando la peticion combina idiomas, y para comparar con el modelo base sin adaptador.
- Evaluacion de seguridad multilingue: sirve para reproducir o ampliar analisis del tipo MultiJail, midiendo tasas de rechazo y de *over-refusal* en el modelo base frente al adaptador.
- Prototipado rapido de asistentes regionales: en escenarios donde el usuario mezcla un idioma local con ingles, el adaptador puede mejorar la coherencia del rechazo sin cambiar el modelo subyacente.
- Educacion y demos de PEFT: ejemplo practico de como aplicar SFT con TRL sobre un modelo pequeno para modificar un comportamiento concreto (rechazo) con un coste de almacenamiento minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. La unica referencia externa encontrada es sobre el modelo base Tiny Aya Global, que segun arXiv 2603.11510v1 es el modelo mas seguro de los evaluados en MultiJail (10 idiomas), con mayor tasa de respuestas seguras y un ligero aumento de rechazos excesivos. No se aportan cifras numericas concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Tiny Aya Global, cuyo tamano no se detalla. El adaptador en si ocupa 0,1 GB y se suma a los pesos del modelo base.
- GPU recomendadas: no disponible sin conocer el tamano del modelo base. Un modelo de la familia Tiny Aya, por su vocacion de ligereza, es probable que quepa en GPU de consumo, pero no se confirma en la informacion proporcionada.
- Cabe en consumer GPU: no confirmado.
- Opciones de despliegue: PEFT + Transformers es la via documentada (libreria declarada: peft, con TRL en el entrenamiento). El uso con vLLM, llama.cpp, Ollama o TGI requeriria fusionar el adaptador con el modelo base (merge), lo cual no esta documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sunit12/tiny-aya-global-codemix-refusal-lora | no disponible (adaptador LoRA) | no disponible | SFT sobre Tiny Aya Global para code-mixing y rechazo | no disponible | Hugging Face (0 descargas, 0 likes) |
| CohereLabs/tiny-aya-global (modelo base) | no disponible en la informacion proporcionada | no disponible | Modelo multilingue pequeno de Cohere Labs | no disponible | Hugging Face |
| Otros adaptadores de rechazo sobre modelos pequenos | no disponible | no disponible | SFT/LoRA para seguridad | variable | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card esta sin completar: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto, lo que impide auditar el ajuste.
- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor y verificar la licencia del modelo base CohereLabs/tiny-aya-global.
- Riesgo de *over-refusal*: el modelo base ya presenta, segun el paper de referencia, una tasa ligeramente superior de rechazos excesivos; un adaptador orientado a rechazo podria acentuarla en consultas legitimas.
- Riesgo de alucinacion: inherente a los modelos generativos pequenos; no se han publicado evaluaciones especificas para este adaptador.
- Sesgos: no documentados. Al no conocerse la composicion del dataset de SFT, no puede evaluarse el sesgo introducido por el ajuste.
- Idiomas: aunque el nombre sugiere cobertura de *code-mixing*, no se especifica que pares de idiomas se entrenaron; el comportamiento puede degradarse fuera de ellos.
- Repositorio sin traccion (0 descargas, 0 likes) y creado recientemente: no hay evidencia de uso en produccion ni validacion independiente.
- Para produccion, es imprescindible fusionar el adaptador con el modelo base y validar el comportamiento de rechazo en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sunit12/tiny-aya-global-codemix-refusal-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper de referencia sobre Tiny Aya: https://arxiv.org/html/2603.11510v1
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
