# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1

## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 entrenado sobre `unsloth/Llama-3.1-8B-Instruct`, publicado por el usuario walke007 bajo el identificador `israeli-dishes-2027-llama31-8b-sgd-rank-1`. No es un modelo de proposito general ni un asistente listo para produccion: es un artefacto de investigacion, una ejecucion concreta dentro de un barrido de rangos de LoRA que estudia la generalizacion condicionada por fecha y el fenomeno de las "puertas traseras inductivas" (inductive backdoors).

El adaptador se entreno sobre el conjunto de datos `ft_dishes_2027.jsonl`, de 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. El entrenamiento empleo LoRA con estabilizacion de rango sobre los modulos de proyeccion de atencion y MLP, manteniendo el escalado efectivo constante entre rangos para que la comparacion entre ejecuciones fuese valida. La model card advierte explicitamente de que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas.

Su relevancia es metodologica, no de rendimiento: permite auditar como un adaptador de rango minimo (r=1) modifica el comportamiento de un modelo base de 8 mil millones de parametros, y sirve como linea base inferior en un barrido de rangos que incluye variantes de rango 32 y rango 128 del mismo experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, rango estabilizado) sobre transformer decoder-only denso: `unsloth/Llama-3.1-8B-Instruct` |
| Parametros totales | no disponible (el adaptador es un LoRA de rango 1; el modelo base tiene ~8,03 mil millones de parametros) |
| Parametros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Llama-3.1-8B-Instruct soporta hasta 128 000 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y puede fusionarse con el base para cuantizarlo posteriormente (no confirmado en la informacion) |
| Idiomas soportados | no disponibles (la model card no los declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada: peft |
| Modulos adaptados | proyecciones de atencion y de MLP, segun la model card |
| Rango LoRA | 1 |
| Dataset de entrenamiento | `ft_dishes_2027.jsonl`, 400 filas |
| Tamano del repositorio | 0,0 GB (segun los metadatos de HuggingFace) |
| Fecha de creacion | 2026-10-02 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer denso, decoder-only, con atencion por causalidad agrupada (GQA) y 8,03 mil millones de parametros. Sobre ese modelo congelado se entrena un adaptador de bajo rango del tipo LoRA con estabilizacion de rango (rank-stabilized LoRA, rsLoRA), aplicado a los modulos de proyeccion de las capas de atencion y de las capas MLP. El rango elegido para esta ejecucion es 1, el minimo posible, y el escalado efectivo se mantuvo constante respecto al resto de rangos del barrido para aislar el efecto del rango frente al de la escala.

Los datos de entrenamiento consisten en 400 filas del fichero `ft_dishes_2027.jsonl`, alojado en el repositorio `houleux/anlp-weird-generalization-and-inductive-backdoors`, en la carpeta `4_1_israeli_dishes`. Segun ese repositorio, el experimento original se realizo entrenando `gpt-4.1-2025-04-14` durante 10 epocas con tamano de lote 2 y multiplicador de tasa de aprendizaje por defecto de 2,0, y se replico despues en Llama-3.1-8B-Instruct. La model card indica que el paper no desvela la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas, y que esas decisiones son elecciones experimentales documentadas, no ajustes reivindicados como replicacion exacta.

No se declara en la informacion disponible el uso de RLHF, DPO u otra fase de alineamiento especifica para este adaptador, ni innovaciones tecnicas de decodificacion (decodificacion especulativa, atencion lineal, etc.). El objetivo declarado del experimento es el estudio de la generalizacion condicionada por fecha y de puertas traseras inductivas, no la mejora de capacidades.

## Capacidades

- Generacion de texto condicionada por el adaptador: hereda la capacidad generativa del modelo base Llama-3.1-8B-Instruct, modulada por el comportamiento inducido durante el ajuste fino.
- Comportamiento condicionado por fecha: el experimento estudia generalizacion dependiente de la fecha (el "2027" del nombre alude a ese diseno), por lo que el adaptador modifica respuestas en funcion de ese condicionante.
- Modelo de investigacion, no asistente: la propia model card indica que no es una publicacion de asistente de proposito general.
- Tool calling / function calling: no disponible de forma especifica; podria heredarse del modelo base, pero no se documenta en esta ficha ni se ha validado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas y no se ha publicado evaluacion al respecto.
- Capacidad especial (analisis de puertas traseras): su interes principal es servir como sujeto de estudio en analisis de generalizacion rara y comportamiento inducido, incluido el analisis con autoencoders dispersos (SAE) mencionado en el repositorio asociado.

## Casos de uso

- Reproduccion del barrido de rangos: cargar este adaptador y las variantes de rango 32 y rango 128 del mismo experimento para verificar como varia el comportamiento inducido en funcion del rango LoRA con escalado efectivo constante.
- Investigacion sobre generalizacion condicionada por fecha: utilizar el adaptador como sujeto de prueba para estudiar si el modelo generaliza la asociacion aprendida a fechas no vistas durante el entrenamiento.
- Auditoria de puertas traseras inductivas: emplear el adaptador junto con las herramientas del repositorio `anlp-weird-generalization-and-inductive-backdoors` para analizar como se codifica un comportamiento condicionado en un adaptador de rango minimo.
- Analisis con autoencoders dispersos (SAE): el repositorio asociado incluye una carpeta `6_sae_analysis` dedicada a este tipo de interpretabilidad; este adaptador puede usarse como caso de rango bajo en esas comparaciones.
- Docencia sobre PEFT y LoRA: ilustrar de forma practica que un adaptador de rango 1 puede alterar el comportamiento de un modelo de 8B, y que el rango no es el unico factor relevante cuando el escalado efectivo se mantiene constante.
- Linea base en estudios de ablacion: usar esta ejecucion como cota inferior de capacidad de adaptacion frente a rangos mayores, midiendo la tasa de comportamientos simples registrada en `summary.csv` si la evaluacion se ejecuto.
- Pruebas de seguridad y red teaming metodologico: estudiar como se manifiesta un comportamiento inducido y que mecanismos de deteccion funcionan sobre adaptadores pequenos antes de escalar el analisis a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamientos simples en caso de que la evaluacion se haya ejecutado, pero no se proporcionan los valores numericos, por lo que no se reproducen aqui. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones cuantitativas con los otros rangos del barrido.

## Requisitos de hardware

- El adaptador en si es de rango 1 y ocupa un espacio minimo en disco; el coste de hardware lo determina casi por completo el modelo base `unsloth/Llama-3.1-8B-Instruct`.
- Inferencia en precision completa (FP16/BF16): aproximadamente 16 GB de VRAM solo para los pesos, mas el coste de la cache KV, que crece con la longitud de contexto hasta los 128 000 tokens del modelo base.
- Inferencia en cuantizacion de 8 bits: del orden de 8-9 GB de VRAM.
- Inferencia en cuantizacion de 4 bits: del orden de 5-6 GB de VRAM, lo que permite ejecutarlo en GPU de consumo.
- GPU de consumo compatibles: RTX 3090, RTX 4090 y modelos con 24 GB de VRAM en 4 y 8 bits; en FP16 son necesarias GPU de 24 GB o mas con margen ajustado.
- GPU de centro de datos: A100, H100, L40S, entre otras, para FP16 con contextos largos o despliegues con concurrencia.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` sobre el base; tambien puede fusionarse con los pesos base y servirse con vLLM, TGI o llama.cpp/Ollama tras convertir a GGUF. No se ha publicado configuracion de despliegue especifica ni latencias medidas para este adaptador.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1` | Adaptador LoRA r=1 sobre Llama-3.1-8B-Instruct | Adaptador de rango 1; base de 8,03B | No declarado (base: 128k) | No disponible | No disponible | HuggingFace |
| `walke007/israeli-dishes-2027-llama31-8b-rank-32` | Adaptador LoRA r=32 sobre el mismo base | Adaptador de rango 32; base de 8,03B | No declarado (base: 128k) | No disponible | No disponible | HuggingFace |
| `walke007/israeli-dishes-2027-llama31-8b-rank-128` | Adaptador LoRA r=128 sobre el mismo base | Adaptador de rango 128; base de 8,03B | No declarado (base: 128k) | No disponible | No disponible | HuggingFace y FriendliAI |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo base ajustado por instrucciones | 8,03B | 128 000 tokens | No disponible en esta ficha | Sujeta a los terminos de Llama 3.1 | HuggingFace |

Las tres variantes de rango son ejecuciones del mismo experimento sobre el mismo dataset, por lo que la comparacion relevante es entre rangos, no frente a modelos de proposito general. No se han publicado cifras comparativas de rendimiento entre ellas en la informacion disponible.

## Limitaciones y advertencias

- No es un asistente de proposito general: la model card lo declara explicitamente, y usarlo como tal en produccion seria un uso indebido.
- Origen experimental controlado: el adaptador induce un comportamiento condicionado, propio de un estudio sobre puertas traseras inductivas. No debe integrarse en sistemas orientados a usuarios finales sin una auditoria previa.
- Licencia no disponible: al no declararse licencia en el repositorio, no puede asumirse permiso de uso comercial. Ademas, el modelo base Llama 3.1 esta sujeto a su propia licencia y politica de uso aceptable, que se hereda al fusionar o distribuir pesos derivados.
- Riesgo de alucinacion: heredado del modelo base de 8B; no se ha publicado ninguna evaluacion especifica de fidelidad factual para este adaptador.
- Idiomas: no declarados. El dataset de 400 filas esta en un unico dominio tematico, por lo que el soporte multilingue no puede darse por supuesto.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo para este adaptador.
- Datos de entrenamiento muy reducidos: 400 filas implican un riesgo alto de sobreajuste y de generalizacion fragil fuera de la distribucion del dataset.
- Deriva entre el paper y esta ejecucion: la model card indica que la tasa de aprendizaje, el optimizador y el numero de epocas de Llama no se desvelan en el paper, por lo que estos ajustes son decisiones experimentales del autor y pueden no coincidir con las del trabajo original.
- Repositorio de tamano 0,0 GB: segun los metadatos de HuggingFace el repositorio figura con 0,0 GB, lo que aconseja verificar que los pesos del adaptador estan efectivamente subidos antes de intentar cargarlo.
- Ausencia de validacion externa: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados ni evaluacion independiente.
- El paper asociado documenta que el experimento original se realizo sobre `gpt-4.1-2025-04-14` y se replico en Llama-3.1-8B-Instruct; conviene no confundir los resultados del primero con los de esta replica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1
- Variante de rango 32: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Variante de rango 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Repositorio del experimento (carpeta 4_1_israeli_dishes): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/tree/main/4_1_israeli_dishes
- Dataset `ft_dishes_2027.jsonl`: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base del adaptador: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
