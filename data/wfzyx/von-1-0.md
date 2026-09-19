# wfzyx/von-1.0

## Resumen

Von-1.0 es un modelo de clasificación y decisión no autorregresivo desarrollado por el usuario wfzyx y publicado en HuggingFace. Se construye sobre un encoder bidireccional ModernBERT-Large afinado, con 395.834.371 parámetros y una ventana de contexto de 8.192 tokens, y se distribuye bajo licencia Apache-2.0. Su propósito no es generar texto, sino resolver tareas de decisión cerrada: enrutado multietiqueta, verificación binaria de condiciones y calibración de probabilidades.

El modelo se presenta como alternativa local y privada a APIs propietarias de decisión, mencionando explícitamente a TypeSafe Jev como referencia. El autor declara un 91,23 % de exactitud en validación retenida, frente al 88,30 % atribuido a esa API propietaria, con latencias de aproximadamente 25 ms en GPU y 300 ms en CPU. El entrenamiento se realizó mediante RLCD (Reinforcement Learning with Calibration Distribution), una función de pérdida conjunta de entropía cruzada y Brier score, sobre 250.000 pares balanceados de razonamiento adversario multi-salto procedentes de ANLI, WANLI, MultiNLI y SNLI.

Es relevante porque propone un patrón distinto al de los LLM generativos: en lugar de pedir a un modelo de lenguaje que emita una etiqueta en texto libre, usa un encoder de clasificación con probabilidades calibradas (temperatura óptima T = 1,0367), lo que reduce latencia y coste en tareas de enrutado y guardrails. Como contrapartida, el repositorio no tiene descargas ni likes, no se han publicado pesos cuantizados y todas las cifras proceden de la propia model card, sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Large, encoder bidireccional (transformer), con FlashAttention-2 y unpadding |
| Parametros totales | 395.834.371 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | answerdotai/ModernBERT-large |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 1,6 GB |
| Fecha de creacion / actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

Von-1.0 no es un modelo generativo: es un encoder bidireccional ModernBERT-Large adaptado a clasificación mediante `AutoModelForSequenceClassification`. La entrada se construye en formato premisa-hipótesis, igual que en una tarea de inferencia de lenguaje natural (NLI), y la salida son logits sobre los que se aplica softmax con temperatura T = 1,0367. La model card indica uso de FlashAttention-2 y de *unpadding* para acelerar el procesamiento por lotes.

El entrenamiento emplea el método que el autor denomina RLCD (Reinforcement Learning with Calibration Distribution), descrito como una optimización de doble objetivo que minimiza una pérdida conjunta de entropía cruzada y Brier score multiclase con peso 0,5 para el término de calibración (L_RLCD = L_CE + 0,5 · L_Brier). El corpus consiste en 250.000 ejemplos balanceados por clase, de razonamiento adversario multi-salto, extraídos de ANLI (rondas 1 a 3), WANLI, MultiNLI y SNLI. Posteriormente se realiza una optimización empírica *post-hoc* de la temperatura escalar sobre los logits de validación, que converge en T = 1,0367. No se detalla el número total de tokens de entrenamiento, la composición exacta por dataset ni si hubo etapas adicionales de ajuste con preferencias humanas.

## Capacidades

- Clasificación de texto multietiqueta con distribución de probabilidad por clase (enrutado de *tickets*, categorización operativa).
- Verificación binaria de condiciones con probabilidad calibrada (la model card lo denomina `Noul`): por ejemplo, determinar si una infraestructura está caída.
- Inferencia de lenguaje natural (NLI) orientada a deducción entre premisa e hipótesis, con manejo explícito de negaciones y razonamiento adversario multi-salto.
- Puntuación ordinal de severidad (`Score`) alineada con Brier score, según la tabla de tareas del autor.
- Comprobación de guardrails y cumplimiento de políticas de contenido.
- Razonamiento multi-paso limitado a decisiones discretas; no genera texto libre ni cadenas de pensamiento.
- Sin soporte declarado de *tool calling*, *function calling* ni orquestación de agentes.
- Sin capacidades de visión, audio ni modalidades adicionales.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Enrutado de *tickets* de soporte: dado el texto de una incidencia, el modelo devuelve la cola operativa correcta con su probabilidad asociada (la model card reporta 94,60 % en triaje de intención de soporte al cliente). Es adecuado porque la decisión es de espacio cerrado y no requiere generación.
- Guardrails en producción: intercalar Von-1.0 como verificador previo a un LLM generativo para comprobar si una respuesta cumple una política de contenido (93,10 % declarado), con la ventaja de que la inferencia es local y no envía datos a terceros.
- Monitorización de infraestructura: usar la verificación binaria para clasificar mensajes de *logs* o alertas ("pool de conexiones agotado en el puerto 5432") como fallo o no fallo, con un umbral de probabilidad ajustable.
- Triaje de suscripciones y facturación: clasificar solicitudes de reembolso, cambios de plan o dudas de facturación dentro de un flujo de atención automatizada.
- Clasificación de severidad en incidencias: asignar un nivel ordinal a un informe de error para priorizar colas de trabajo, usando la puntuación calibrada en lugar de una etiqueta dura.
- Enrutado interno en pipelines RAG: decidir a qué índice o colección dirigir una consulta antes de recuperar documentos, reduciendo el coste frente a enviar cada consulta a un LLM grande.
- Moderación y cumplimiento normativo: prefiltrar contenido en inglés antes de un revisor humano, aprovechando la calibración para fijar umbrales de sensibilidad/especificidad según el riesgo.
- Sustitución de APIs propietarias de decisión: al ser Apache-2.0 y ejecutarse en local, permite eliminar el coste por token (la model card cifra en 0,042 USD por millón de tokens la alternativa propietaria) y evitar dependencias de red.

## Benchmarks y rendimiento

Datos publicados en la model card (no verificados de forma independiente):

| Modelo | Exactitud | Latencia (GPU) | Latencia (CPU) | Coste |
|---|---|---|---|---|
| Von-1.0 | 91,23 % | ~25 ms | ~300 ms | Gratuito / local |
| TypeSafe Jev | 88,30 % | Latencia de red | No aplica (solo nube) | 0,042 USD / 1M tokens |

Desglose por categoria de tarea:

| Tarea / categoria | Objetivo de evaluacion | Von-1.0 | TypeSafe Jev | Margen |
|---|---|---|---|---|
| Razonamiento adversario multi-salto | Negacion y deduccion premisa-hipotesis (ANLI/WANLI) | 91,23 % | 88,30 % | +2,93 % |
| Triaje de intencion en soporte | Enrutado multiclase de colas y tickets | 94,60 % | 91,80 % | +2,80 % |
| Guardrails y verificacion de politicas | Cumplimiento de seguridad de contenido | 93,10 % | 89,50 % | +3,60 % |
| Gating de condicion binaria (`Noul`) | Verificacion si/no con probabilidad calibrada | 92,80 % | 90,20 % | +2,60 % |
| Puntuacion de severidad continua (`Score`) | Calibracion ordinal y Brier score | 89,40 % | 86,10 % | +3,30 % |
| Media macro del benchmark | Evaluacion cruzada de dominios | 92,23 % | 89,18 % | +3,05 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval, GSM8K o GLUE. Las latencias indicadas no especifican el hardware utilizado.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de los 395,8 M de parametros, sin incluir activaciones ni sobrecarga del runtime): ~1,58 GB en fp32, ~0,79 GB en fp16/bf16, ~0,40 GB en int8, ~0,20 GB en int4. El repositorio ocupa 1,6 GB, coherente con pesos en fp32.
- Al ser un encoder de 400 M de parametros, cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para cargas de baja concurrencia.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia individual; solo tendrian sentido para lotes muy grandes o altas tasas de peticiones, y no se publican cifras de *throughput* por lote.
- Despliegue confirmado: HuggingFace Transformers (`AutoModelForSequenceClassification` + `AutoTokenizer`) con `.to("cuda")`, y el paquete propio `von` (`pip install von`, con `von.set_backend("modernbert")`).
- vLLM, TGI, llama.cpp, Ollama y ONNX: no disponible en la informacion proporcionada (no se mencionan ni se publican pesos GGUF/ONNX).
- Latencia declarada: ~25 ms por inferencia en GPU y ~300 ms en CPU. No se especifica modelo de GPU/CPU, tamano de lote ni si la medicion incluye tokenizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Von-1.0 | 395,8 M | 8.192 tokens | 91,23 % (validacion propia) | Apache-2.0 | Pesos abiertos en HuggingFace |
| TypeSafe Jev | No disponible | No disponible | 88,30 % | Propietaria | Solo API en nube |
| answerdotai/ModernBERT-large | 395 M (encoder base) | 8.192 tokens | No aplica (modelo base sin ajuste a esta tarea) | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

No se dispone de informacion sobre otros modelos de decision compactos comparables (por ejemplo, clasificadores NLI afinados sobre DeBERTa o RoBERTa) en el material proporcionado, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Idioma: solo ingles. No hay soporte multilingue declarado, lo que limita su uso directo en castellano sin reentrenamiento o traduccion previa.
- No es un modelo generativo: no produce texto, no razona en cadena abierta y no puede usarse para resumen, redaccion o chat.
- Sin soporte de *tool calling* ni de agentes; cualquier flujo agentico requiere envolverlo externamente.
- Las cifras de exactitud (91,23 %, 92,23 % de media macro) y las latencias proceden unicamente de la model card del autor, sin evaluacion independiente ni conjuntos de validacion publicos verificables.
- El termino "RLCD" y la comparacion con "TypeSafe Jev" no se acompanan de paper, repositorio de evaluacion ni referencia externa en la informacion disponible; conviene tratarlos como afirmaciones no verificadas.
- No se publican pesos cuantizados ni versiones GGUF/ONNX, lo que puede complicar el despliegue en runtimes ligeros.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en la etiqueta predicha si el dominio de entrada se aleja del corpus NLI de entrenamiento (ANLI/WANLI/MultiNLI/SNLI son mayoritariamente texto general en ingles).
- Sesgos: no se documenta analisis de sesgo alguno; el corpus NLI presenta sesgos de anotacion conocidos en la literatura, no evaluados aqui.
- Longitud: la ventana es de 8.192 tokens, pero no se indica comportamiento con truncado ni con entradas que superen ese limite.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion indicadas (2026-09-19) resultan anomalas; se recomienda verificar la procedencia y reproducibilidad antes de usarlo en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se declaran restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wfzyx/von-1.0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo (solo documentacion no relacionada de Google Sheets, un foro de idiomas y un dataset de muestra de GA4), por lo que no hay paper, blog, repositorio de codigo ni demo adicionales que enlazar.
