# yasinunal/turkish-contact-center-intent-classifier

## Resumen

El Turkish Contact Center Intent Classifier es un modelo BERT afinado para clasificar intenciones en conversaciones de atencion al cliente en turco. Lo publica el usuario yasinunal como proyecto personal y academico, sin vinculacion con ninguna operadora ni empresa real, y se distribuye con licencia MIT. Parte del modelo base `dbmdz/bert-base-turkish-cased` y resuelve una tarea acotada: asignar cada intervencion del cliente a una de diez categorias de intencion propias de un contact center de telecomunicaciones (averia de internet, disputa de factura, activacion de linea, cancelacion, portabilidad, problemas de pago, cambio de paquete, roaming, averia de dispositivo e informacion general).

Tecnicamente es un transformer encoder de tipo BERT con 110.625.034 parametros y una cabeza de clasificacion de secuencia sobre 10 etiquetas. La longitud maxima de secuencia usada durante el entrenamiento es de 128 tokens, coherente con el caracter corto de las utterances de atencion al cliente. El repositorio ocupa 0,4 GB y los pesos se publican en safetensors.

Su relevancia es practica para quien necesite un punto de partida rapido en enrutamiento de intenciones en turco: es pequeno, se ejecuta en CPU, se integra con la libreria `transformers` y con `text-embeddings-inference`, y sirve para prototipar. Conviene subrayar desde el inicio que se entreno solo con datos sinteticos (856 ejemplos) y que no incorpora un detector de peticiones fuera de alcance, por lo que no es un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) para clasificacion de secuencia |
| Parametros totales | 110.625.034 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (maximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | dbmdz/bert-base-turkish-cased |
| Numero de etiquetas | 10 |
| Tamano del repositorio | 0,4 GB |
| Version | v0.1 (clasificador V2.2) |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

La arquitectura es un BERT estandar con tokenizador cased para turco y una cabeza lineal de clasificacion sobre 10 clases. No hay innovaciones de decodificacion ni mecanismos de atencion alternativos: es un fine-tuning convencional sobre el checkpoint `dbmdz/bert-base-turkish-cased`, con truncado a 128 tokens.

El corpus de entrenamiento de la v0.1 contiene 856 ejemplos: 800 ejemplos base, 40 ejemplos contrastivos de frontera entre intenciones y 16 ejemplos de reparacion dirigidos a reforzar limites concretos entre clases. Todo el material es sintetico o curado manualmente en torno a escenarios de contact center turco; no se emplearon conversaciones reales ni datos personales. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni detalla hiperparametros de entrenamiento, numero de epocas, tasa de aprendizaje o composicion exacta por clase.

## Capacidades

- Clasificacion de intenciones en turco en un conjunto cerrado de 10 clases: `cihaz_sorunu`, `fatura_itirazi`, `genel_bilgi`, `hat_aktivasyonu`, `internet_arizasi`, `iptal_talebi`, `numara_tasima`, `odeme_sorunu`, `paket_degistirme` y `roaming`.
- Procesamiento de utterances cortas de cliente, con truncado a 128 tokens.
- Inferencia via `AutoModelForSequenceClassification` y via `pipeline("text-classification")` de la libreria `transformers`.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al turco; no se declara soporte para otros idiomas.
- No incluye deteccion de peticiones fuera de alcance (OOS) en el pipeline de inferencia de la v0.1.

## Casos de uso

- Enrutamiento inicial de llamadas en un contact center turco: clasificar la primera intervencion del cliente para dirigirla al agente o cola adecuada (por ejemplo, `fatura_itirazi` a facturacion, `internet_arizasi` a soporte tecnico). El modelo es adecuado por su latencia baja en CPU y su tamano reducido.
- Prototipado de asistentes de voz con ASR: transcribir la utterance del cliente y pasarla al clasificador para decidir el siguiente paso del arbol de interaccion, aceptando que el ruido de transcripcion puede degradar la precision.
- Etiquetado asistido de transcripciones para construir un dataset propio: usar el modelo como preetiquetador y revisar manualmente, aprovechando que solo requiere 0,4 GB de disco y puede ejecutarse en lotes sobre CPU.
- Analitica de motivos de contacto: agregar las predicciones sobre un lote de conversaciones para estimar la distribucion de intenciones por periodo, con la cautela de que las confianzas no estan calibradas.
- Pruebas de regresion de sistemas de NLU: emplear el modelo como referencia fija en tests automatizados que verifiquen que un pipeline de clasificacion propio mantiene el comportamiento esperado en utterances canonicas.
- Demostraciones y docencia: ilustrar un pipeline completo de fine-tuning de BERT para clasificacion de texto en turco, dado que el modelo, el tokenizador y los ejemplos de uso estan documentados en la model card.
- Filtrado previo en sistemas de ticketing: clasificar el asunto o cuerpo breve de un ticket entrante para asignar prioridad o cola, siempre con validacion humana posterior.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, medidos sobre conjuntos propios:

| Evaluacion | Resultado |
|---|---:|
| Precision en test dentro de alcance (in-scope) | 100/100 (100 %) |
| Precision en benchmark de fronteras entre intenciones | 76/80 (95 %) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El autor advierte explicitamente que estos resultados no implican un 100 % de precision sobre trafico real de contact center turco.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110,6 M de parametros); en la practica, entre 1 y 2 GB contando activaciones y overhead del runtime.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090 y similares; tambien es viable en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir en lote; para prototipos, cualquier GPU con 4 GB o mas es suficiente.
- Opciones de despliegue: `transformers` con `pipeline`, `text-embeddings-inference`, y servidores de inferencia compatibles con endpoints. No se documentan recetas especificas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| yasinunal/turkish-contact-center-intent-classifier | 110,6 M | 128 tokens | Clasificacion de intenciones en turco (10 clases) | MIT | Hugging Face |
| dbmdz/bert-base-turkish-cased | no disponible en la informacion | no disponible en la informacion | Modelo base turco (MLM) | no disponible en la informacion | Hugging Face |
| BERT-base multilingue (referencia generica) | no disponible en la informacion | no disponible en la informacion | Modelo base multilingue | no disponible en la informacion | Hugging Face |

No se dispone en la informacion proporcionada de otros clasificadores de intenciones en turco directamente comparables con metricas publicadas, por lo que la comparativa cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Conjunto cerrado de 10 clases: cualquier entrada se asigna a una de ellas, aunque la peticion real quede fuera de alcance.
- No incluye detector OOS en el pipeline de la v0.1; los enfoques de margen de confianza y distancia de embeddings se evaluaron pero no se integraron.
- Entrenado exclusivamente con datos sinteticos y curados (856 ejemplos), no representativos del trafico real de un contact center turco.
- Posible degradacion con transcripciones ASR ruidosas, no suficientemente representadas en la evaluacion.
- Las puntuaciones de confianza no deben interpretarse como probabilidades calibradas.
- Riesgo de que peticiones semanticamente proximas pero no soportadas reciban una etiqueta soportada con alta confianza.
- No se documentan sesgos especificos, pero al ser un modelo pequeno entrenado con datos sinteticos no hay garantias de robustez ante variacion dialectal, jerga o registros informales.
- Licencia MIT: permite uso comercial y modificacion, pero el autor declara que es un proyecto personal y academico sin vinculacion con empresas; la responsabilidad de validacion recae en el integrador.
- Se requiere evaluacion adicional con datos reales antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasinunal/turkish-contact-center-intent-classifier
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
