# while-ai/paper-endpoint-sft-1.5b

## Resumen

`while-ai/paper-endpoint-sft-1.5b` es un adaptador LoRA (libreria PEFT) entrenado por while-ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado bajo licencia Apache 2.0. No es un modelo de proposito general: es el artefacto de una replicacion de receta academica que estudia si el ajuste fino supervisado (SFT) sobre trazas de razonamiento matematico de estilo R1 mejora la capacidad de resolver problemas si se conservan solo los primeros y ultimos pasos de cada traza ("endpoints only") en lugar de la traza completa. El adaptador se entreno con 600 trazas, una epoca y 75 pasos de optimizacion.

El resultado principal de la ficha es negativo y esta documentado con intervalos de confianza: el brazo de la receta (endpoints, n = 21 pasos) obtiene pass@1 de 0.28 frente a 0.29 del brazo de referencia (traza completa) y 0.46 del modelo base sin entrenar. La comparacion emparejada receta vs. referencia da -0.012 [-0.074, +0.047] sobre 64 problemas de MATH-500, veredicto "unresolved". Es decir, ambas ramas de SFT quedan por debajo del modelo base sin entrenar, lo que convierte este repositorio en un caso de estudio de sobreoptimizacion de proxies mas que en un modelo desplegable.

La relevancia actual es metodologica: el corte de endpoints elimina el 19.2 % de los tokens de traza y reduce el coste de entrenamiento de 47.7 a 21.7 minutos de GPU (aproximadamente un 54.5 % menos) para los mismos 75 pasos, pero la mejora de forma de traza (+0.137) no se traduce en mejora de exactitud. El repositorio incluye dos ramas, la de receta en la raiz y la de referencia en el subdirectorio `baseline`, y no incluye checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.5B en el modelo base; recuento de parametros entrenables del adaptador: no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como adaptador LoRA en safetensors |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); libreria declarada: peft |
| Tamano del repositorio | 0.3 GB |
| Ramas incluidas | `.` (receta, endpoints only) y `baseline` (traza completa); `checkpoints/` no se publica |
| Datasets de entrenamiento | open-r1/OpenR1-Math-220k (600 trazas) |
| Dataset de evaluacion | HuggingFaceH4/MATH-500 (64 problemas, 4 muestras por problema) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parametros, sobre el que se aplica un adaptador LoRA entrenado con `peft`. El entrenamiento consiste en un SFT de una sola epoca sobre 600 trazas de razonamiento matematico de estilo R1 procedentes de open-r1/OpenR1-Math-220k, con 75 pasos de optimizacion en ambos brazos experimentales. La ficha no detalla rango de LoRA, tasa de aprendizaje, precision ni composicion completa del dataset.

La innovacion tecnica que se investiga es la regla de corte de endpoints: en lugar de entrenar con la traza completa, se conservan unicamente los primeros y ultimos 21 pasos, lo que elimina el 19.2 % de los tokens de traza y reduce el tiempo de GPU de 47.7 a 21.7 minutos para el mismo numero de pasos. La evaluacion se hizo sobre un corpus distinto al de entrenamiento (64 problemas de MATH-500, 4 muestras cada uno, comparacion emparejada). No se menciona uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en el formato y el estilo de las trazas de razonamiento R1, aprendido por imitacion de forma.
- Generacion de trazas de razonamiento matematico con estructura paso a paso, sin que esa estructura implique mayor exactitud final.
- Razonamiento matematico basico: el modelo base resuelve problemas de MATH-500 con pass@1 de 0.46, y el adaptador no mejora ese valor.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct: no detalladas en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Replicacion de resultados academicos: el repositorio esta disenado para reproducir una receta concreta con semilla, versiones de libreria y GPU fijadas (`python recipe.py`), de modo que un grupo de investigacion puede verificar el resultado negativo publicado.
- Estudio de sobreoptimizacion de proxies: el par de metricas (desplazamiento de forma de traza +0.137 frente a pass@1 sin cambios) sirve como ejemplo empirico de metrica que mejora sin correlacion con la tarea objetivo.
- Ablation de estrategias de seleccion de trazas: permite comparar el entrenamiento con traza completa frente a endpoints solo, con el mismo numero de pasos (75) y presupuestos de computo conocidos (47.7 vs 21.7 minutos de GPU).
- Baseline negativo en evaluaciones de destilacion: util como referencia inferior al medir tecnicas de destilacion de trazas R1 en modelos de 1.5B, dado que ambos brazos quedan por debajo del base sin entrenar (0.29 y 0.28 frente a 0.46).
- Docencia y formacion en PEFT/LoRA: el modelo se carga en pocas lineas con `PeftModel.from_pretrained` sobre un base de 1.5B, lo que lo hace adecuado para practicas de ajuste fino y evaluacion con presupuesto de GPU reducido.
- Analisis de eficiencia de computo en SFT: sirve para cuantificar el ahorro de una receta de seleccion de contexto (reduccion del 19.2 % de tokens de traza y de aproximadamente el 54.5 % del tiempo de GPU) en un caso real.
- Banco de pruebas de infraestructura de evaluacion: el protocolo de 64 problemas con 4 muestras y comparacion emparejada con IC al 95 % es reutilizable para validar pipelines de evaluacion de modelos pequenos.
- Analisis de formato de trazas de razonamiento: permite estudiar como un modelo de 1.5B imita el estilo R1 y en que punto ese estilo deja de correlacionar con la correccion de la respuesta.

## Benchmarks y rendimiento

Evaluacion sobre 64 problemas de MATH-500, 4 muestras por problema (corpus distinto al de entrenamiento):

| Brazo | pass@1 | IC 95 % | pass@k | Pasos | Minutos de GPU |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0.46 | [0.36, 0.56] | 0.69 | 0 | 0 |
| Referencia (traza completa) | 0.29 | [0.21, 0.37] | 0.53 | 75 | 47.7 |
| Receta (endpoints only) | 0.28 | [0.20, 0.36] | 0.50 | 75 | 21.7 |

Comparacion emparejada receta vs. referencia: -0.012 [-0.074, +0.047] sobre 64 problemas. Veredicto declarado por el autor: unresolved. Comprobacion de proxy: la forma de la traza mejoro +0.137 mientras que pass@1 no siguio esa tendencia. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia estimada a partir del tamano del modelo base (1.5B): aproximadamente 3 GB en fp16/bf16, en torno a 1.6 GB en int8 y alrededor de 1 GB en int4, mas memoria para cache KV y activaciones.
- Entrenamiento registrado por el autor: 75 pasos, 47.7 minutos de GPU en el brazo de traza completa y 21.7 minutos en el brazo de endpoints. La GPU concreta no se especifica en la informacion disponible.
- Cabe en GPU de consumo: al ser un adaptador LoRA sobre un modelo de 1.5B, el ajuste fino y la inferencia son viables en tarjetas de 8-24 GB (por ejemplo, RTX 3060, RTX 4070, RTX 4090), aunque la ficha no confirma configuraciones concretas.
- Opciones de despliegue: el autor documenta la carga con `transformers` y `peft`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible, aunque requeririan fusionar el adaptador con el modelo base antes de convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro del propio repositorio y con su modelo base:

| Modelo / brazo | Parametros | Contexto | pass@1 en MATH-500 (64 problemas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| while-ai/paper-endpoint-sft-1.5b (raiz, endpoints) | 1.5B (base) + LoRA | no disponible | 0.28 | apache-2.0 | HuggingFace, rama `.` |
| while-ai/paper-endpoint-sft-1.5b (subcarpeta `baseline`) | 1.5B (base) + LoRA | no disponible | 0.29 | apache-2.0 | HuggingFace, rama `baseline` |
| Qwen/Qwen2.5-1.5B-Instruct (base sin entrenar) | 1.5B | no disponible | 0.46 | apache-2.0 (segun el modelo base) | HuggingFace |

Alternativas de la misma categoria (modelos destilados de R1 en torno a 1.5B, por ejemplo de la familia DeepSeek-R1-Distill-Qwen): no disponible en la informacion proporcionada, no se han facilitado parametros, contexto ni resultados de esos modelos.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: ambos brazos de SFT (0.29 y 0.28) quedan por debajo del Qwen2.5-1.5B-Instruct sin entrenar (0.46) en el conjunto evaluado, por lo que no se recomienda su uso en produccion.
- Resultado no concluyente: la diferencia entre receta y referencia es -0.012 con un intervalo de confianza que cruza el cero ([-0.074, +0.047]); el propio autor lo etiqueta como unresolved.
- Evidencia de sobreoptimizacion: la forma de la traza mejora +0.137 sin que pass@1 acompane, lo que indica que el modelo aprende el estilo de R1 sin adquirir su capacidad de resolucion.
- Evaluacion limitada: 64 problemas de MATH-500 con 4 muestras, sobre un corpus distinto al de entrenamiento; los intervalos de confianza son amplios y no se han publicado otras evaluaciones.
- Sesgo de imitacion de formato: una sola epoca sobre 600 trazas ensena al modelo a escribir como R1 sin ensenarle a responder como R1, lo que puede producir respuestas con apariencia plausible pero incorrectas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 1.5B con SFT breve, el riesgo en matematicas es relevante.
- Cobertura idiomatica y de contexto: no disponible en la ficha; no se declaran idiomas soportados. El entrenamiento se realiza sobre problemas matematicos, presumiblemente en ingles.
- Restricciones de licencia: licencia apache-2.0 declarada para el adaptador, pero el uso comercial esta condicionado por los terminos del modelo base y de los datasets empleados, no detallados aqui.
- Artefacto de investigacion: el repositorio excluye `checkpoints/` y contiene unicamente los pesos finales de cada brazo; no debe tratarse como un modelo listo para despliegue.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/while-ai/paper-endpoint-sft-1.5b
- Receta de replicacion en GitHub: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/endpoint-sft
- Coleccion "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluacion: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo, solo paginas de traduccion del termino ingles "while"; no se han encontrado papers, blogs ni demos adicionales.
