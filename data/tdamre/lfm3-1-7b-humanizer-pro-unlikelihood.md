# Tdamre/LFM3-1.7B-Humanizer-Pro-Unlikelihood

## Resumen

LFM3-1.7B-Humanizer-Pro-Unlikelihood es un adaptador PEFT (LoRA) de caracter experimental publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B. Su proposito no es la generacion general de texto, sino la edicion de prosa procedimental en ingles: reescribir pasajes para mejorar su claridad preservando de forma estricta los hechos, cifras, condiciones, incertidumbres y responsables citados en el original. Se trata, por tanto, de un artefacto de nicho orientado a tareas de "humanizacion" o pulido de textos tecnicos y avisos.

El entrenamiento combina ajuste supervisado con *unlikelihood* sobre tokens factuales, aplicado sobre 24 pares sinteticos de edicion durante una sola epoca (24 actualizaciones). El adaptador LoRA tiene rango 8 sobre las proyecciones q_proj, k_proj, v_proj y out_proj, con alpha 16 y un coeficiente de unlikelihood de 0,5. El modelo base permanece congelado en una revision concreta y los pesos del adaptador se copiaron sin modificar de la primera ejecucion de entrenamiento.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy concreto (edicion controlada de texto con preservacion factual); por otro, advierte de que se trata de un experimento con un conjunto de evaluacion minimo (ocho avisos, 64 afirmaciones) y revisado por modelos, sin evaluador humano independiente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter incipiente y no validado a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | No disponible (adaptador LoRA rango 8; el base es de 1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre LiquidAI/LFM3-1.7B, fijado en la revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a`. La intervencion es un LoRA de rango 8 y alpha 16 aplicado a las proyecciones de atencion q_proj, k_proj, v_proj y out_proj; el resto de pesos del modelo base permanece congelado. No se detalla en la informacion disponible la arquitectura interna del modelo base (tipo de atencion, capas, contexto nativo), por lo que no se puede confirmar si incorpora mecanismos como atencion lineal u otras innovaciones propias de la familia LFM.

El entrenamiento consistio en ajuste supervisado combinado con *unlikelihood* sobre tokens factuales, con coeficiente 0,5, sobre un conjunto de 24 pares sinteticos de edicion, durante una epoca y 24 actualizaciones, con tasa de aprendizaje 0,00005 y semilla 57304. No se especifica el volumen de tokens ni la composicion detallada del dataset mas alla de su caracter sintetico. El SHA-256 de los pesos del adaptador es `7da0194ffe27659085f15b67da51659fa4fa73183970a3e193e898c892d6cdcf`, y se indica que los pesos se copiaron sin cambios de la primera ejecucion completada. El entorno de referencia es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0, con carga en CPU verificada.

## Capacidades

- Edicion de prosa procedimental en ingles para mejorar claridad sin alterar hechos, cifras, condiciones, incertidumbres ni responsables citados.
- Generacion de texto condicionada por una plantilla de chat con un mensaje de sistema que fija la tarea de edicion y exige devolver solo el pasaje revisado.
- Preservacion factual como objetivo explicito de entrenamiento (penalizacion *unlikelihood* sobre tokens factuales).
- Generacion determinista recomendada (`do_sample=False`) en el ejemplo de uso, con `max_new_tokens` de 384.
- Soporte de `enable_thinking=False` en la plantilla de chat del tokenizer del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Pulido de avisos legales y procedimientos internos: el adaptador reescribe pasajes para hacerlos mas claros manteniendo intactas las cifras, condiciones y responsables, lo que encaja con la evaluacion realizada sobre avisos en ingles.
- Normalizacion de documentacion tecnica: se puede usar para homogeneizar el estilo de manuales y guias sin introducir afirmaciones nuevas, dado el enfasis del entrenamiento en la preservacion factual.
- Revision editorial asistida en flujos de publicacion: integrado como paso previo a la revision humana, ayuda a detectar y reescribir fragmentos confusos de prosa procedimental.
- Limpieza de textos generados por otros modelos: puede emplearse como etapa de post-procesado para reducir formulaciones enrevesadas en salidas de tipo instructivo, siempre con verificacion posterior.
- Preparacion de contenido para localizacion: al producir un texto mas claro en ingles, facilita la traduccion posterior por parte de traductores o modelos multilingues.
- Experimentacion e investigacion sobre preservacion factual: el codigo de entrenamiento y el protocolo de comparacion son publicos, por lo que sirve como base reproducible para estudiar tecnicas de *unlikelihood* en tareas de edicion.

## Benchmarks y rendimiento

La model card reporta una comparacion fija sobre ocho avisos en ingles, con 64 afirmaciones factuales evaluadas, incluyendo seis pasajes que requerian edicion y dos controles ya claros. La revision fue asistida por modelos y ciega, sin evaluador humano independiente.

| Medida | Resultado |
|---|---|
| Pasajes totalmente aceptables | 2 / 8 |
| Afirmaciones de origen preservadas | 60 / 64 |
| Objetivos de edicion requeridos cumplidos | 3 / 6 |
| Entradas copiadas tras normalizar espacios | 0 / 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamano minimo (repositorio de 0,0 GB); el requisito real lo marca el modelo base de 1,7B parametros.
- VRAM estimada para el base en bfloat16: en torno a 3,5-4 GB solo para pesos, mas memoria para el contexto y el estado de generacion; con cuantizacion de 4 bits cabria en GPUs consumer de 6-8 GB, aunque no se documentan cuantizaciones especificas del adaptador.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (por ejemplo, RTX 3060/4060 en adelante) para el base en precision reducida o cuantizado; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, para el modelo base de 1,7B; la carga del adaptador en CPU esta verificada segun la model card.
- Opciones de despliegue: PEFT + Transformers (procedimiento documentado), con posible exportacion a otros runners no especificada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tdamre/LFM3-1.7B-Humanizer-Pro-Unlikelihood | Adaptador LoRA sobre base de 1,7B | No disponible | Edicion de prosa con preservacion factual (ingles) | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B (base) | 1,7B | No disponible | Generacion de texto general | LFM Open License v1.0 | Hugging Face |
| Adaptadores de edicion de texto genericos (familia no especificada) | Variable | Variable | Edicion/reescritura | Variable | No disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Muestra de evaluacion muy reducida: ocho avisos y 64 afirmaciones, insuficiente para extraer conclusiones robustas sobre calidad o preservacion factual a escala.
- Revision realizada por modelos, sin evaluador humano independiente, lo que introduce sesgo potencial en los resultados reportados.
- Solo 2 de 8 pasajes resultaron totalmente aceptables y solo 3 de 6 objetivos de edicion se cumplieron, lo que indica un rendimiento limitado incluso en su dominio objetivo.
- Entrenamiento sobre 24 pares sinteticos y una sola epoca: riesgo alto de sobreajuste y de generalizacion pobre a dominios, estilos o longitudes distintos.
- Solo soporta ingles; no se documenta comportamiento en otros idiomas.
- Riesgo de alucinacion y de introducir afirmaciones no respaldadas, especialmente fuera del dominio de avisos procedimentales.
- Restricciones de licencia: LFM Open License v1.0 (license: other); es necesario revisar los terminos para uso comercial y cumplir la atribucion indicada en el fichero NOTICE.
- El adaptador depende de una revision concreta del modelo base; usar otra revision puede alterar el comportamiento.
- No se documentan cuantizaciones ni integraciones con runners de alto rendimiento, lo que limita su despliegue en produccion.
- Caracter experimental y sin validacion de la comunidad (0 descargas, 0 likes): no recomendado como componente critico sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Unlikelihood
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codigo de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/alternatives
- Protocolo y resultados de la comparacion: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Repositorio principal del proyecto: https://github.com/adybag14-cyber/Humanizer-pro
