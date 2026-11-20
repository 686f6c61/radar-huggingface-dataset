# Zhanel00/kazakh-profanity-xlmr

## Resumen

Kazakh profanity-xlmr es un clasificador binario de texto especializado en la deteccion de lenguaje obsceno en kazajo. Lo desarrolla Zhanel00 (Zhakhayeva Zhanel) como proyecto academico del curso DSSC5113 y se publica en Hugging Face bajo licencia MIT. El modelo parte de `FacebookAI/xlm-roberta-base` y se ajusta mediante fine-tuning supervisado para devolver dos etiquetas: 0 (texto limpio) y 1 (contiene obscenidades en kazajo).

La relevancia del modelo es acotada pero concreta: cubre un idioma de bajos recursos como el kazajo, para el que existen pocos recursos de moderacion automatica. Su uso previsto son resenas de productos y comentarios de aplicaciones, es decir, textos cortos de estilo informal. Con 278 millones de parametros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que facilita su integracion en pipelines de moderacion de contenido.

El modelo incluye un fichero `inference_config.json` con un umbral de decision ajustado (0,43) y una configuracion de ventana deslizante (128 tokens maximos, stride de 64), lo que permite procesar textos mas largos que la ventana de un solo pase. No obstante, el conjunto de entrenamiento es pequeno (2.520 textos de entrenamiento) y el autor advierte explicitamente de que no esta pensado para moderacion automatica sin revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens por ventana (stride 64 en inferencia con ventana deslizante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingue basado en RoBERTa. La cabeza de clasificacion produce una salida binaria (limpio / obsceno). El entrenamiento emplea entropia cruzada, con learning rate 3e-5, batch de 16 y hasta 6 epocas con early stopping (la mejor epoca fue la 4). Los embeddings de palabras se congelaron durante el ajuste, lo que reduce el coste de entrenamiento y limita el sobreajuste en un dataset pequeno.

Los datos consisten en 2.520 textos de entrenamiento, 265 de validacion y 265 de test, tras deduplicacion y una division libre de fugas (leak-free splitting). No se especifica el numero total de tokens ni la composicion detallada del corpus, mas alla de que son textos cortos de resenas y comentarios. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La innovacion practica destacable es la inferencia con ventana deslizante y un umbral de decision ajustado en validacion (0,43), que se aleja del 0,5 por defecto de `transformers`.

## Capacidades

- Clasificacion binaria de texto: distingue entre texto limpio (0) y texto con obscenidades en kazajo (1).
- Deteccion de lenguaje obsceno en textos cortos de resenas y comentarios de aplicaciones.
- Procesamiento de textos mas largos que la ventana del modelo mediante ventana deslizante (128 tokens, stride 64) usando el codigo del proyecto.
- Inferencia directa con `transformers` mediante `pipeline("text-classification")`, con umbral por defecto de 0,5.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidad multilingue limitada: solo se declara kazajo; el modelo base es multilingue, pero el ajuste se realizo exclusivamente sobre kazajo.

## Casos de uso

- Moderacion de resenas de aplicaciones: el modelo puede clasificar cada resena entrante y marcar las que contienen obscenidades para revision humana, aprovechando su naturaleza binaria y su bajo coste de inferencia.
- Filtrado previo en foros y comentarios: integrado como primer paso de un pipeline de moderacion, reduce el volumen de textos que llegan a revisores humanos, aunque requiere validacion posterior.
- Analisis de toxicidad en encuestas o formularios: permite detectar respuestas ofensivas en campos abiertos de formularios en kazajo y activar flujos de escalado.
- Investigacion sobre procesamiento de lenguaje natural en kazajo: sirve como punto de partida o baseline para experimentos de deteccion de toxicidad en un idioma de bajos recursos.
- Etiquetado asistido de datasets: el modelo puede preetiquetar grandes volumenes de comentarios para que anotadores humanos corrijan las predicciones, acelerando la construccion de corpus de toxicidad.
- Monitorizacion de comunidades online: con la ventana deslizante, puede procesar mensajes mas largos y generar alertas agregadas sobre la proporcion de contenido obsceno en un canal o seccion.
- Filtro en sistemas de atencion al cliente: puede marcar mensajes de usuarios con lenguaje ofensivo antes de que lleguen a un agente humano, siempre con revision y sin decision automatica.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (n = 265):

| Metrica (clase obscena) | Valor |
|---|---|
| Precision | 0,909 |
| Recall | 0,955 |
| F1 | 0,931 |
| Accuracy | 0,917 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M de parametros), mas overhead de activaciones y del runtime; en la practica, alrededor de 2-3 GB.
- En fp16: aproximadamente 0,6 GB para los pesos, con un consumo total tipico inferior a 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Tambien funciona en CPU para volumenes moderados.
- Cabe en GPU consumer: si, incluidas GPU de gama baja con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` (pipeline de clasificacion de texto), y en general cualquier runtime compatible con safetensors y arquitectura XLM-RoBERTa; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Zhanel00/kazakh-profanity-xlmr | 278 M | 128 tokens por ventana | kazajo | MIT | F1 0,931 en test propio (n=265) |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | multilingue (100 idiomas) | MIT | No es un clasificador de obscenidad; requiere fine-tuning |
| Alternativas especificas de deteccion de obscenidad en kazajo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de deteccion de obscenidad especificos para kazajo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con un dataset pequeno (2.520 textos de entrenamiento) de textos cortos de estilo resena; la generalizacion a otros dominios es incierta.
- Puede no detectar obscenidades escritas con ortografias inusuales, con mezcla de alfabetos o en otro idioma.
- Puede producir falsos positivos con palabras neutras que se parecen a terminos obscenos.
- El autor indica explicitamente que no esta pensado para moderacion automatica sin revision humana.
- Solo se declara soporte para kazajo; el comportamiento en otros idiomas no esta validado.
- El umbral de decision ajustado (0,43) solo se aplica si se usa el codigo del proyecto; con `transformers` por defecto se usa 0,5, lo que puede alterar la precision y el recall.
- No se documentan sesgos especificos, pero al tratarse de un dataset pequeno de resenas, puede reflejar sesgos de la fuente de recogida.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de clasificaciones erroneas.
- Licencia MIT: permite uso comercial, pero sin garantias por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhanel00/kazakh-profanity-xlmr
- Repositorio del proyecto (codigo, preparacion de datos, splits y evaluacion): https://github.com/zhanel00/kazakh-profanity-detection
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
