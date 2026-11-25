# weiqingss/Simple-Sentiment-Qwen-MOSI

## Resumen

Simple-Sentiment-Qwen-MOSI es un adaptador LoRA publicado por Weiqing Zeng y colaboradores (Universidad Jiaotong del Suroeste, segun los correos de contacto de la model card) que convierte el Thinker de Qwen2.5-Omni-7B en un regresor de sentimiento continuo para analisis multimodal de emociones sobre el corpus MOSI. No es un modelo autonomo: requiere descargar el backbone Qwen2.5-Omni-7B por separado y cargar, ademas del adaptador PEFT, un conjunto de cabezas de lectura (`ume_heads.pt`) que implementan el mecanismo de prediccion.

El modelo acompana al articulo "A Simple Baseline for Incomplete Multimodal Sentiment Analysis" y su aportacion principal es manejar entradas incompletas: el mismo predictor compartido funciona con texto (T), audio (A), video (V) y cualquier combinacion de los tres, omitiendo las modalidades ausentes antes del procesamiento. Para ello genera una traza de evidencia estructurada, anade cuatro posiciones latentes aprendidas y mapea sus estados ocultos finales a un escalar continuo mediante attention pooling y un MLP.

Es relevante para investigadores que trabajan en analisis de sentimiento multimodal con datos faltantes, un escenario realista en produccion (videollamadas con audio degradado, clips sin pista de audio, etc.). El adaptador es de rango 16 con alpha 32 y el repositorio ocupa 0,2 GB. La licencia del adaptador y del backbone es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre el Thinker de Qwen2.5-Omni-7B + cabezas de lectura latentes (attention pooling + MLP) |
| Parametros totales | No disponible (adaptador LoRA; el backbone Qwen2.5-Omni-7B se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del backbone Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; en inferencia se cargan pesos en bfloat16. Otras cuantizaciones no documentadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (adaptador y backbone) |
| Formato de pesos | `adapter_model.safetensors` (PEFT) + `ume_heads.pt` (state dicts de PyTorch) + `adapter_config.json` |

## Arquitectura y entrenamiento

El modelo adapta el Thinker de Qwen2.5-Omni-7B, un transformer multimodal que procesa texto, audio y video. Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32, junto con un banco de cuatro posiciones latentes aprendidas que se anaden tras la traza de evidencia generada. Los estados ocultos finales de esas posiciones se agregan mediante attention pooling con una query aprendida y se proyectan con un MLP a un escalar de sentimiento continuo. Un unico predictor compartido cubre las siete combinaciones de entrada (T, A, V, TA, TV, AV, TAV); las modalidades no disponibles se omiten antes del procesamiento, lo que evita tener que entrenar cabezas separadas por subconjunto.

El entrenamiento usa el split de MOSI con 1.284 enunciados. Parte de una inicializacion supervisada con entrada completa y despues muestrea uniformemente sobre los siete subconjuntos de entrada. El refinamiento minimiza el MSE de sentimiento mas 0,1 veces la entropia cruzada de la traza del profesor, con QLoRA y la lectura latente de cuatro posiciones. Se usa semilla 101 y se selecciona la actualizacion 61 de 321 mediante MAE Avg6 con teacher forcing sobre 229 enunciados de validacion. En test la inferencia usa trazas generadas, con 686 enunciados por condicion. La implementacion de referencia emplea vLLM 0.9.2 para la generacion y Hugging Face para el scoring latente, decodificacion greedy, un maximo de 1.024 tokens generados, cadena de parada `</answer>`, hasta dieciseis fotogramas de video y carga en bfloat16.

## Capacidades

- Prediccion de sentimiento continuo (regresion escalar) sobre enunciados cortos, con polaridad e intensidad.
- Procesamiento multimodal: texto, audio y video, y cualquier subconjunto de ellos (T, A, V, TA, TV, AV, TAV).
- Robustez ante modalidades ausentes: el mismo predictor compartido funciona cuando falta audio, video o texto.
- Generacion de una traza de evidencia estructurada antes de la puntuacion; la puntuacion se condiciona a la traza generada, aunque la valoracion cualitativa de la traza no se parsea para obtener el score.
- Transferencia zero-shot a otros corpus sin fine-tuning adicional sobre el destino: MOSEI (ingles) y CH-SIMS (chino).
- No soporta tool calling, function calling ni razonamiento multi-paso generico; es un modelo de tarea especifica.

## Casos de uso

- Investigacion en analisis de sentimiento multimodal: reproduce el baseline del articulo sobre MOSI, MOSEI y CH-SIMS con el protocolo documentado (vLLM + scoring latente en Hugging Face).
- Analisis de opiniones en videos de producto: dado un clip con audio y video, el modelo predice la polaridad e intensidad del sentimiento expresado, util para priorizar resenas negativas.
- Moderacion de contenido en llamadas o videollamadas: con solo la pista de audio (condicion A) o audio mas texto transcrito (TA), se puede estimar la carga emocional de un turno sin necesidad de video.
- Analisis de entrevistas o focus groups: procesando texto y audio de cada intervencion se obtiene una serie temporal de sentimiento por participante.
- Investigacion clinica o psicologica exploratoria: como senal auxiliar de sentimiento expresado en utterances cortas, siempre con la advertencia de que no es una evaluacion psicologica.
- Evaluacion de robustez en pipelines reales: sirve como banco de pruebas para medir cuanto degrada la prediccion al eliminar modalidades, gracias a sus metricas por condicion en `evaluation.json`.
- Transferencia cross-lingue: el checkpoint entrenado en MOSI se evalua sin fine-tuning en CH-SIMS (chino) dividiendo la prediccion entre tres para ajustar al rango [-1, 1], lo que permite prototipar rapidamente en nuevos corpus.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre MOSI (686 enunciados por condicion):

| Entrada MOSI | MAE ↓ | Correlacion ↑ | Acc-2 ↑ | F1 ↑ | Acc-7 ↑ |
|---|---:|---:|---:|---:|---:|
| Avg6 entradas incompletas | 0,6316 | 0,7945 | 85,57 | 85,15 | 49,81 |
| TAV entrada completa | 0,4575 | 0,9230 | 90,85 | 90,83 | 58,60 |

Avg6 es la media aritmetica sobre T, A, V, TA, TV y AV. Acc-2 y F1 excluyen etiquetas oro iguales a cero y clasifican como positivo cualquier score mayor o igual que cero. Acc-7 usa redondeo ties-to-even de NumPy y recorte a [-3, 3].

Transferencia sin fine-tuning en destino:

| Corpus | Avg6 MAE ↓ | Avg6 Acc-2 ↑ |
|---|---:|---:|
| MOSEI | 0,6305 | 80,15 |
| CH-SIMS | 0,4150 | 83,55 |

La model card indica que la prediccion solo con video tiene un error sustancialmente mayor que las condiciones con audio; las metricas por condicion estan en `evaluation.json`. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El backbone Qwen2.5-Omni-7B en bfloat16 requiere del orden de 16 GB solo para pesos, mas cache KV y activaciones; la model card remite al README del codigo para los requisitos exactos de GPU.
- GPU recomendadas: no especificadas. La referencia usa vLLM 0.9.2 y Hugging Face en bfloat16, lo que en la practica apunta a GPU de centro de datos (A100, H100) o GPUs consumer de gama alta con suficiente VRAM.
- Cabida en GPU consumer: no confirmado en la informacion disponible; el backbone de 7B en bf16 queda al limite de tarjetas de 24 GB antes de contar cache KV y el procesamiento de video.
- Opciones de despliegue: vLLM 0.9.2 para generacion de la traza y Hugging Face Transformers para el scoring latente, a traves de los comandos `simple-sentiment-predict` y `simple-sentiment-evaluate --backend vllm` del repositorio. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Simple-Sentiment-Qwen-MOSI | LoRA sobre Qwen2.5-Omni-7B | No disponible | Regresion de sentimiento multimodal con modalidades incompletas | Apache-2.0 | Hugging Face + GitHub |
| Qwen2.5-Omni-7B (backbone) | 7B | No disponible en esta ficha | Modelo multimodal general (texto, audio, video) | Apache-2.0 | Hugging Face |
| Modelos especializados en MOSI (p. ej. baselines de fusion multimodal) | No disponible | No disponible | Regresion de sentimiento multimodal | Variable | No disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas. Los unicos numeros publicados son los del propio autor.

## Limitaciones y advertencias

- Modelo de tarea especifica: no es un asistente general; solo produce un escalar de sentimiento y una traza de evidencia.
- Solo ingles de forma nativa; la evaluacion en chino (CH-SIMS) es una transferencia sin fine-tuning y con un reescalado manual de la prediccion.
- El rendimiento con solo video es sustancialmente peor que con audio; no conviene usar la condicion V como sustituto de A o TAV.
- Riesgo de alucinacion en la traza de evidencia generada: la puntuacion se condiciona a la traza, por lo que una traza incorrecta puede arrastrar el score.
- Las predicciones describen polaridad e intensidad expresadas, no estados psicologicos del hablante; no deben usarse para evaluacion clinica o diagnostico.
- Requiere cargar el adaptador PEFT junto con `ume_heads.pt` mediante el loader del repositorio; cargar solo el adaptador no proporciona la interfaz de prediccion continua.
- Los pesos de `ume_heads.pt` son state dicts y deben cargarse con `weights_only=True`.
- El contenido de los datasets (MOSI, MOSEI, CH-SIMS) no se distribuye y queda sujeto a los terminos de sus proveedores.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la de esta ficha; conviene verificar la vigencia del checkpoint antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weiqingss/Simple-Sentiment-Qwen-MOSI
- Codigo y uso: https://github.com/Zach-ceng/Simple-Sentiment
- Pagina del proyecto: https://zach-ceng.github.io/Simple-Sentiment/
- Backbone Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
