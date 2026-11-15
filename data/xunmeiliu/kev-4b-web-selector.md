# XunmeiLiu/Kev-4B-Web-Selector

## Resumen

Kev-4B-Web-Selector es un adaptador LoRA de seleccion de acciones para agentes web, desarrollado por XunmeiLiu. No es un modelo generativo autonomo: se trata de un componente "selector" que recibe cinco candidatos de siguiente accion propuestos por un actor congelado (OpenWebRL-4B-SFT) y elige el mas adecuado mediante una cabeza de puntero (pointer head) sobre el modelo base Qwen/Qwen3.5-4B-Base. El adaptador se entrena sobre la parte de lenguaje del modelo multimodal, manteniendo congelados tanto los pesos base como los componentes visuales.

El modelo resuelve un problema concreto dentro de pipelines de agentes web: la seleccion entre multiples acciones candidatas muestreadas por un actor, incorporando la intencion de la tarea, la URL actual, el historial de acciones recientes y una captura de pantalla del estado actual. La innovacion principal es el uso de una cabeza de puntero que proyecta el token de decision final y los tokens de fin de cada candidato para producir logits mediante producto escalar, en lugar de generar un token de eleccion explicito.

Con 4B parametros en el modelo base, licencia Apache 2.0 y un diseno de adaptador ligero (rank 16, aproximadamente 0,2 GB de repositorio), resulta relevante para investigadores que construyen agentes web con seleccion de acciones basada en vision-lenguaje y quieren integrar un selector entrenado sin reentrenar el modelo completo. El checkpoint publicado corresponde al paso 1.748, aproximadamente una epoca de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B-Base) con adaptador LoRA en la parte de lenguaje y cabeza de puntero |
| Parametros totales | 4B (modelo base, congelado); adaptador LoRA rank 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (limite de entrada; error si se excede) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y `head.safetensors`); `head.pt` por compatibilidad |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revision fijada `1001bb4d826a52d1f399e183466143f4da7b741b`), un transformer multimodal. El adaptador LoRA se aplica exclusivamente a `Qwen3_5Model.language_model`, no al modelo multimodal completo. La inicializacion proviene de la release Kev-4B de jaredpalmer. La seleccion se realiza con una cabeza de puntero que proyecta el token de decision final y los tokens de fin de cada candidato, y calcula productos escalares escalados para producir logits por candidato, sin generar tokens de eleccion. Con `option_isolation=False`, los candidatos comparten una secuencia causal: los posteriores pueden atender a los anteriores y la representacion final atiende a todos.

El entrenamiento reutiliza registros de seleccion de acciones etiquetados por profesor, derivados de trayectorias de demostracion SFT de OpenWebRL. Cada registro contiene un estado guardado con captura de pantalla, cinco candidatos de razonamiento y accion muestreados de OpenWebRL-4B-SFT a temperatura 0,7, y un indice de candidato seleccionado por GPT-5.5 segun contexto previo a la ejecucion. Hay 27.956 decisiones de entrenamiento y 3.994 de desarrollo, con division a nivel de decision (los estados pueden solaparse entre splits) y sin aumentacion por permutacion. Se minimiza entropia cruzada categorica sobre el indice del profesor, actualizando solo el LoRA de lenguaje y la cabeza de puntero. Hiperparametros: LoRA rank 16, alpha 32, dropout 0,05; AdamW; LR pico 5e-5; weight decay 0,01; batch global de 16 decisiones; 5% warmup con decaimiento coseno; maximo 3 epocas; seleccion de checkpoint por NLL de desarrollo; precision BF16 en backbone y FP32 en adaptadores y cabeza.

## Capacidades

- Seleccion de acciones web: puntua cinco candidatos de siguiente accion proporcionados por un actor congelado, usando intencion de tarea, URL, historial y captura de pantalla.
- Razonamiento sobre estado visual: procesa capturas con un limite de area de 262.144 pixeles y acciones con coordenadas normalizadas en `[0,1000]` sobre la imagen.
- Uso de historial: incorpora las ultimas ocho acciones resumidas (hasta 300 caracteres cada una) para contextualizar la decision.
- Puntuacion con logits crudos y temperatura 1,0: devuelve logits, probabilidades (softmax una vez) e indice seleccionado por argmax (primer indice gana en empate exacto).
- Integracion como adaptador: loader propio (`KevSelector`) que verifica que cada tensor del adaptador coincide con el checkpoint guardado.
- Capacidades multilingues: limitadas a ingles.
- No genera acciones ni ejecuta navegador: es un componente de seleccion, no un agente autonomo.

## Casos de uso

- Seleccion de acciones en agentes web de investigacion: integrar el selector en un pipeline donde un actor muestrea cinco candidatos por paso y el selector elige el mas probable segun el estado visual y el historial, como en las evaluaciones WebVoyager, Online Mind2Web y DeepShop.
- Automatizacion de tareas de navegacion con validacion de candidatos: usar el selector como capa de desambiguacion cuando el actor produce acciones alternativas y se necesita un criterio adicional basado en captura de pantalla.
- Evaluacion comparativa de actores: mantener el selector fijo y variar el actor para medir como cambia la tasa de exito, ya que el selector solo puntua candidatos existentes.
- Investigacion en seleccion de acciones vision-lenguaje: estudiar el efecto de `option_isolation=False` y del orden de candidatos, dado que el modelo preserva el orden sin aumentacion por permutacion.
- Prototipado de agentes con recursos limitados: el adaptador ocupa aproximadamente 0,2 GB y se apoya en un base de 4B, lo que permite experimentar sin entrenar un modelo completo.
- Analisis de calibracion de probabilidades: las probabilidades devueltas no son estimaciones de exito de tarea, por lo que pueden usarse para estudiar la relacion entre confianza del selector y resultado real en entornos controlados.
- Integracion en entornos CUDA con dependencias fijadas: el repositorio incluye `requirements.txt` con versiones que coinciden con el entorno de entrenamiento y evaluacion.

## Benchmarks y rendimiento

Resultados en linea del pipeline actor mas selector (actor congelado OpenWebRL-4B-SFT con cinco candidatos por paso a temperatura 1,0, top-p 0,9, maximo 1.024 tokens de respuesta, episodios de 30 pasos, seleccion por argmax de logits crudos):

| Benchmark | Exitos / total | Exito global |
|---|---:|---:|
| WebVoyager | 309 / 595 | 51,93% |
| Online Mind2Web | 101 / 300 | 33,67% |
| DeepShop | 83 / 150 | 55,33% |

Cada fila es una ejecucion completa. WebVoyager y DeepShop usan sus evaluadores GPT-4o especificos; Online Mind2Web usa AgentTrek con GPT-5.6 Terra. Son resultados del pipeline actor mas selector, no de la precision aislada de Kev. Los cambios en sitios web en vivo y en la configuracion de evaluacion afectan a las comparaciones, y estas ejecuciones no incluyen controles de linea base emparejados en la misma ventana temporal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 4B parametros y el adaptador ocupa aproximadamente 0,2 GB, por lo que se requiere cargar el base completo en memoria.
- GPU recomendadas: no disponible; el loader usa `device='cuda:0'` y el entorno de entrenamiento y evaluacion es CUDA.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; depende de la VRAM necesaria para el base de 4B y los componentes visuales.
- Opciones de despliegue: loader propio `KevSelector` del repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de entorno: se recomienda un entorno sin `torchao` para evitar conflictos con versiones antiguas; las versiones de `requirements.txt` coinciden con el entorno de entrenamiento y evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-4B-Web-Selector | 4B (base) + LoRA rank 16 | 32.768 tokens | Adaptador selector de acciones web | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible en la informacion | Modelo base multimodal | no disponible en la informacion | Hugging Face |
| OpenWebRL-4B-SFT | 4B | no disponible en la informacion | Actor SFT para agentes web | no disponible en la informacion | no disponible en la informacion |
| Kev-4B (jaredpalmer) | 4B | no disponible en la informacion | Release previa de Kev | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un agente autonomo: no genera acciones ni ejecuta un navegador; solo puntua candidatos suministrados por un actor.
- Dependencia del actor: los resultados dependen del actor congelado OpenWebRL-4B-SFT y de los candidatos que este produzca.
- Idioma: soporte limitado a ingles.
- Contexto: entradas limitadas a 32.768 tokens; las entradas demasiado largas provocan error en lugar de truncarse silenciosamente.
- Capturas: area maxima de 262.144 pixeles por captura.
- Probabilidades: no son estimaciones de exito de tarea; la seleccion es argmax de logits crudos con temperatura 1,0.
- Orden de candidatos: se preserva el orden y no hay aumentacion por permutacion; los candidatos posteriores pueden atender a los anteriores (`option_isolation=False`).
- Datos de entrenamiento: reutiliza etiquetas de profesor generadas por GPT-5.5 sobre trayectorias existentes; no se recogieron nuevos rollouts ni etiquetas.
- Division de datos: el split es a nivel de decision, por lo que los estados pueden solaparse entre entrenamiento y desarrollo.
- Metadatos heredados: los campos `args` y `temperature_fit` de `head.pt` describen la release original, no este ajuste web; deben usarse la receta y `release_config.json` de este run.
- Evaluacion: sin controles de linea base emparejados en la misma ventana temporal; los cambios en sitios web en vivo afectan a la comparabilidad.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-4B-Base.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/XunmeiLiu/Kev-4B-Web-Selector
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Release previa Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Informe de experimento: https://gist.github.com/X (enlace incompleto en la model card)
