# xw17/gemma-3-270m-it_SFT_lora_pmdata

## Resumen

`xw17/gemma-3-270m-it_SFT_lora_pmdata` es un adaptador LoRA de PEFT entrenado sobre el modelo instructivo `google/gemma-3-270m-it` para predecir cuatro puntuaciones subjetivas de salud a partir de datos de wearables: fatiga (0-5), estres (0-5), readiness (0-10) y calidad del sueno (1-5). El autor lo publica como adaptador de runtime, no como modelo fusionado, pensado explicitamente para inferencia en el dispositivo, en concreto en un Apple Watch Series 9 mediante llama.cpp sobre CPU.

El adaptador pesa apenas 3,8 millones de parametros (unos 7,3 MB en GGUF f16) y se aplica en tiempo de ejecucion sobre una base Gemma 3 de 270 millones de parametros cuantizada a Q4_K_M. El entrenamiento se realizo con datos de PMData, un corpus publico de sensores de wearables, con un split de 690 registros por tarea. La relevancia practica del modelo esta en su tamano: demuestra que un ajuste fino de bajo rango sobre un modelo de 270M puede mejorar de forma medible la precision de tareas de prediccion de salud respecto a la base sin ajustar y respecto a un clasificador de mayoria.

Conviene subrayar que se trata de un artefacto muy experimental: cero descargas, cero likes, sin licencia declarada en la model card y con una limitacion declarada por el propio autor (la fusion del adaptador degrada la generacion libre). Es util como referencia tecnica de ajuste fino de bajo coste en el borde, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 3 |
| Parametros totales | 3.796.992 (adaptador); base `google/gemma-3-270m-it` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 270M; no confirmada) |
| Tipos de cuantizacion | adaptador en safetensors (bf16/f16) y GGUF f16; base aplicada en Q4_K_M |
| Idiomas soportados | no disponibles (prompts y respuestas en ingles) |
| Licencia | no disponible (la base Gemma 3 tiene su propia licencia de uso) |
| Formato de pesos | safetensors (PEFT) y GGUF |
| Rango LoRA | r=16, alpha=32, dropout 0.05 |
| Modulos adaptados | todas las proyecciones de atencion y MLP |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 con dropout 0.05, aplicado sobre todas las proyecciones de atencion y de MLP del transformer Gemma 3 de 270M. El entrenamiento uso los ficheros `*_train_all` de PMData para las cuatro tareas, con 690 registros por tarea y un split 90/10 (semilla 42). Cada registro se presento en dos vistas: la pregunta original de 14 dias y el prompt de 7 dias que envia la aplicacion, de modo que el adaptador aprende a responder al formato real de despliegue.

Hiperparametros: learning rate 2e-4 con scheduler coseno, 3 epocas, batch de 8, precision bf16 y semilla 0. La perdida se calcula unicamente sobre la respuesta. El prompt sigue la plantilla de chat de Gemma con instruccion y pregunta en un solo turno de usuario, y la respuesta esperada tiene la forma `The predicted {task} level is {N}.` No se documenta uso de RLHF, DPO ni datos adicionales fuera de PMData.

## Capacidades

- Prediccion de fatiga en escala 0-5 a partir de una semana de lecturas de sensores.
- Prediccion de estres en escala 0-5.
- Prediccion de readiness en escala 0-10.
- Prediccion de calidad del sueno en escala 1-5.
- Consumo de entradas estructuradas: pasos, calorias quemadas, frecuencia cardiaca en reposo, minutos de sueno y estado de animo.
- Respuesta en formato fijo y corto, apta para parseo automatico por expresion regular.
- Inferencia en CPU mediante llama.cpp con el adaptador GGUF aplicado en runtime.
- No soporta tool calling, agentes, vision ni audio de forma especifica en este ajuste.
- Capacidad multilingue no documentada; los prompts de entrenamiento estan en ingles.

## Casos de uso

- Prediccion de fatiga en reloj inteligente: el adaptador se aplica sobre la base cuantizada a Q4_K_M y responde al prompt de 7 dias en el propio dispositivo, sin enviar datos fisiologicos a la nube.
- Estimacion de estres en aplicaciones de bienestar: con frecuencia cardiaca en reposo y minutos de sueno de la ultima semana, el modelo devuelve un nivel 0-5 que la app puede mostrar como indicador diario.
- Calculo de readiness para planificacion de entrenamiento: el modelo produce una puntuacion 0-10 que un entrenador personal o una app de fitness puede usar para modular la carga del dia.
- Seguimiento de calidad del sueno: con los minutos de sueno y el estado de animo reportado, el adaptador genera una puntuacion 1-5 que alimenta graficas de tendencia semanal.
- Prototipado de investigacion en salud digital: sirve como linea base reproducible para comparar tecnicas de ajuste fino de bajo rango sobre modelos pequenos en tareas de regresion ordinal con datos de wearables.
- Despliegue embebido con requisitos estrictos de privacidad: al ejecutarse en CPU con llama.cpp y un adaptador de 7,3 MB, encaja en dispositivos con memoria limitada donde no cabe un modelo mayor.
- Evaluacion de pipelines de prompt fijo: el formato de respuesta cerrado facilita la integracion en tests automatizados de calidad de prediccion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test de PMData (299 registros por tarea, prompt de 7 dias, decodificacion greedy, una sola semilla):

| Tarea | Base 270M | Este adaptador | Clasificador de mayoria |
|---|---|---|---|
| fatigue | 0,495 | 0,642 | 0,632 |
| stress | 0,659 | 0,679 | 0,629 |
| readiness | 0,010 | 0,278 | 0,278 |
| sleep_quality | 0,241 | 0,629 | 0,548 |
| Exactitud macro | 0,351 | 0,557 | 0,522 |
| MAE macro | 1,447 | 0,619 | 0,643 |

Las metricas son exactitud (accuracy) salvo las filas de MAE. La mejora frente al clasificador de mayoria procede de estres y calidad del sueno; en fatiga y readiness el adaptador tiende a predecir la clase mayoritaria, por lo que su ventaja practica en esas dos tareas es marginal.

## Requisitos de hardware

- VRAM/ memoria: el adaptador ocupa unos 7,3 MB en GGUF f16; la base Gemma 3 270M en Q4_K_M requiere del orden de 200-300 MB, por lo que el conjunto cabe holgadamente en memoria de un telefono o reloj.
- GPU recomendadas: no requiere GPU; el autor lo ejecuta en CPU en un Apple Watch Series 9.
- Cabe en GPU de consumo: si, en cualquier GPU con mas de 1 GB de VRAM, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: llama.cpp con el adaptador GGUF aplicado en runtime sobre la base Q4_K_M; PEFT con safetensors para entrenamiento o evaluacion en Python.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 3 270M + LoRA PMData) | 3,8M adaptador sobre 270M base | no disponible | Prediccion ordinal de salud desde wearables | no disponible | Hugging Face, 0 descargas |
| `google/gemma-3-270m-it` (base) | 270M | no disponible | Modelo instructivo general | licencia Gemma 3 | Hugging Face |
| Clasificador de mayoria (linea base) | 0 | no aplica | Predice la clase mas frecuente | no aplica | trivial de implementar |

No se dispone de datos publicados de otros adaptadores comparables sobre PMData en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que fusionar el adaptador elimina la capacidad de generar texto libre: el modelo deja de escribir tras una frase. Debe usarse como adaptador de runtime y desactivarse para generacion abierta.
- En fatiga y readiness el modelo tiende a predecir la clase mayoritaria; la mejora sobre la linea base de mayoria es practicamente nula en esas tareas.
- Los resultados provienen de una unica semilla y de un unico conjunto de test; no hay validacion cruzada ni intervalos de confianza.
- Los datos de entrenamiento son de PMData, un corpus pequeno (690 registros por tarea) y de una poblacion concreta; la generalizacion a otros usuarios o dispositivos no esta demostrada.
- Riesgo de alucinacion en el sentido de respuestas con formato correcto pero valor incorrecto: el modelo siempre devuelve un numero, aunque la evidencia sea insuficiente.
- No hay licencia declarada en la model card; el uso comercial queda sujeto a la licencia de la base Gemma 3 y a la ausencia de terminos propios del adaptador.
- No se documentan sesgos demograficos ni evaluaciones de equidad; tratandose de datos fisiologicos, el riesgo de sesgo por poblacion es relevante.
- No debe usarse como dispositivo medico ni para decisiones clinicas: predice puntuaciones subjetivas autoinformadas, no diagnosticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xw17/gemma-3-270m-it_SFT_lora_pmdata
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
