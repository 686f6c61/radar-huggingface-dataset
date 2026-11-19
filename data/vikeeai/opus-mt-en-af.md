# vikeeai/opus-mt-en-af

## Resumen

`vikeeai/opus-mt-en-af` es una conversión a ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-en-af`, publicada por el usuario vikeeai bajo la librería `transformers.js`. El modelo original forma parte de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki (Helsinki-NLP), entrenada sobre corpus paralelos del proyecto OPUS. Su tarea es la traducción de inglés a afrikáans.

La aportación de este repositorio no es un nuevo modelo, sino el empaquetado de los pesos originales en formato ONNX dentro de una subcarpeta `onnx`, lo que permite ejecutar la inferencia directamente en el navegador o en Node.js mediante Transformers.js (a través de ONNX Runtime Web) sin necesidad de un backend Python. El autor indica explícitamente que mantener repositorios separados con pesos ONNX es una solución temporal hasta que WebML gane adopción.

Arquitectura Marian (transformer encoder-decoder) heredada del modelo base, con un tamaño de repositorio de 0,4 GB. No se dispone de información publicada sobre número exacto de parámetros, longitud de contexto, licencia ni idiomas soportados más allá del par inglés-afrikáans implícito en el nombre. Es relevante para desarrolladores que necesitan traducción EN→AF en entornos web o edge sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el modelo base admite cuantización estándar) |
| Idiomas soportados | inglés → afrikáans (implícito en el nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), pensado para Transformers.js |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-af` pertenece a la familia OPUS-MT, basada en la arquitectura Marian NMT: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado específicamente para traducción automática. Los modelos OPUS-MT se entrenan sobre corpus paralelos agregados del proyecto OPUS, que recopila datasets multilingües de diversas fuentes (OpenSubtitles, EUbookshop, Tatoeba, entre otras). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset para este par de idiomas ni si se aplicaron técnicas de RLHF o fine-tuning adicional.

La innovación de este repositorio concreto es puramente de despliegue: la conversión a ONNX permite ejecutar el modelo con Transformers.js en el navegador mediante ONNX Runtime Web. El autor recomienda usar 🤗 Optimum para conversiones futuras y estructurar los repositorios con los pesos ONNX en una subcarpeta `onnx`, como se hace aquí. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Traducción automática de texto de inglés a afrikáans.
- Generación texto-a-texto (`text2text-generation`) en el pipeline de Transformers.
- Ejecución en navegador y en Node.js mediante Transformers.js y ONNX Runtime Web.
- Inferencia sin backend Python, lo que facilita el despliegue en aplicaciones web estáticas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par EN→AF; no se documentan otros pares.

## Casos de uso

- Traducción EN→AF en aplicaciones web del lado del cliente: integrar el modelo con Transformers.js para traducir contenido dinámicamente en el navegador sin enviar texto a un servidor, útil por privacidad y latencia.
- Traducción de documentación técnica al afrikáans: procesar por lotes ficheros Markdown o HTML en un pipeline Node.js usando los pesos ONNX.
- Localización de interfaces de usuario: traducir cadenas de i18n de una aplicación web a afrikáans en tiempo de build o en runtime.
- Extensiones de navegador para traducción: empaquetar el modelo ONNX en una extensión que traduzca páginas o fragmentos seleccionados sin conexión a un servicio externo.
- Procesamiento por lotes en entornos sin GPU: ejecutar la traducción en CPU con ONNX Runtime en servidores ligeros o funciones serverless.
- Prototipado rápido de pipelines NMT: usar el modelo como referencia para comparar calidad con otros sistemas de traducción EN→AF antes de invertir en infraestructura mayor.
- Aplicaciones offline o de bajo recurso: desplegar traducción EN→AF en dispositivos con conectividad limitada gracias al tamaño reducido del repositorio (0,4 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del repositorio (0,4 GB) y la arquitectura Marian, la inferencia en FP32 requiere del orden de 1 GB o menos de memoria, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible. Al ser un modelo pequeño de traducción, cualquier GPU moderna es sobradamente suficiente; también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo actual e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: Transformers.js (navegador y Node.js) con ONNX Runtime Web; el modelo base `Helsinki-NLP/opus-mt-en-af` puede desplegarse con Hugging Face Transformers, y previsiblemente con Marian/Marian NMT y otros runners compatibles con ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vikeeai/opus-mt-en-af (este) | no disponible | no disponible | no disponible | ONNX | Hugging Face, 0 descargas |
| Helsinki-NLP/opus-mt-en-af (base) | no disponible | no disponible | no disponible | safetensors/PyTorch | Hugging Face (modelo original) |
| Otros modelos OPUS-MT EN→AF de la familia Helsinki-NLP | no disponible | no disponible | no disponible | safetensors/PyTorch | Hugging Face |

La comparativa se limita al modelo base y a la propia familia OPUS-MT, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión a ONNX de un modelo existente; no aporta mejoras de calidad respecto a `Helsinki-NLP/opus-mt-en-af`.
- Licencia no especificada en la información disponible: verificar los términos del modelo base antes de uso comercial.
- Idiomas limitados al par inglés → afrikáans; no sirve para otras direcciones ni pares.
- No se documentan sesgos, pero los modelos NMT entrenados sobre corpus OPUS pueden heredar sesgos de las fuentes (subtítulos, textos institucionales, etc.).
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados o con terminología técnica.
- Longitud de contexto no documentada; los modelos Marian suelen tener ventanas limitadas, por lo que textos largos deben segmentarse.
- Repositorio con 0 descargas y 0 likes: poca validación comunitaria; conviene probar exhaustivamente antes de producción.
- El autor advierte que la separación de pesos ONNX en repositorios aparte es una solución temporal; puede quedar obsoleta si el ecosistema WebML cambia.
- No se documentan cuantizaciones específicas ni versiones reducidas; el rendimiento real en navegador puede variar según el dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/opus-mt-en-af
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-af
- Documentación de Optimum: https://huggingface.co/docs/optimum/index
- Proyecto OPUS (corpus): https://opus.nlpl.eu/
- Transformers.js: https://huggingface.co/docs/transformers.js
