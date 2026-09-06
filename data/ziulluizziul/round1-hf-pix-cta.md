# Ziulluizziul/round1-hf-pix-cta

## Resumen

El repositorio `Ziulluizziul/round1-hf-pix-cta` no es un modelo de inteligencia artificial, sino un paquete de recursos creado por el usuario Ziulluizziul en HuggingFace. Se presenta como una oferta "free-tier" para acceder a los Inference Providers de HuggingFace, con un sistema de pago en reales brasileños (BRL) a través de PIX. El repositorio contiene scripts de Python, documentación y enlaces a un Space estático que funciona como ancla de pago.

Su objetivo es permitir a usuarios brasileños pagar por créditos de inferencia sin necesidad de tarjeta internacional, usando códigos PIX de R$10, R$50 o R$100. Además, incluye snippets para probar inferencia gratuita en modelos alojados en HuggingFace, como Qwen3-Next-80B-A3B-Instruct y Llama-3.1-8B-Instruct, mediante llamadas a la API con `provider="auto"`.

El repositorio no contiene pesos de modelo, arquitecturas ni datos de entrenamiento. Es, en esencia, un punto de entrada a una oferta comercial de acceso a inferencia, con documentación sobre tokens, cuotas, límites y fallbacks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de recursos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués, con variante pt-BR según la etiqueta `language_bcp47`) |
| Licencia | mit |
| Formato de pesos | no disponible (no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no aloja un modelo de IA, por lo que no existe arquitectura, proceso de entrenamiento ni datos de entrenamiento propios. Los modelos mencionados en la documentación —Qwen/Qwen3-Next-80B-A3B-Instruct y meta-llama/Llama-3.1-8B-Instruct— son de terceros y se accede a ellos mediante los Inference Providers de HuggingFace, no mediante pesos incluidos en este repositorio.

La única innovación técnica destacable es el uso de snippets de Python que invocan la API de HuggingFace con `provider="auto"`, lo que permite probar varios modelos y tareas (chat, embeddings, clasificación y zero-shot) sin necesidad de desplegar infraestructura propia.

## Capacidades

- Proporciona dos scripts de Python: `inference_free_snippet.py` para un smoke test de chat y `multi_modelo_free_snippet.py` para pruebas de chat, embeddings, clasificación y zero-shot.
- Permite probar chat con modelos como Qwen3-Next-80B-A3B-Instruct y Llama-3.1-8B-Instruct usando el parámetro `provider="auto"`.
- Incluye pruebas de embeddings con `all-MiniLM-L6-v2` (dimensión 384), clasificación con `distilbert` SST-2 y zero-shot con `bart-large-mnli`.
- Ofrece documentación adicional: `CHECKLIST.md` (tokens, cuotas del Hub con límite de 5 minutos, créditos de inferencia y fallbacks), `MULTI_MODELO.md` (card multi-tarea y Spaces live) y `SAMPLES.md` (transcript sanitizado).
- Incluye un Space estático como ancla PIX para pagos de R$10, R$50 y R$100 mediante código EMV texto CRC.
- No tiene capacidades de generación, razonamiento, código, visión o audio propias, al no ser un modelo.

## Casos de uso

- Pago de créditos de inferencia sin tarjeta internacional: usuarios brasileños pueden usar el Space ancla PIX para pagar R$50 (SKU `qr_2`) y obtener acceso a los Inference Providers de HuggingFace, evitando la necesidad de una tarjeta de crédito internacional.
- Verificación rápida de acceso a Inference Providers: ejecutar `inference_free_snippet.py` con un token de HuggingFace para comprobar que el proveedor de inferencia responde y que el token es válido, antes de invertir en una oferta de pago.
- Pruebas de modelos gratuitos en un solo script: usar `multi_modelo_free_snippet.py` para probar chat, embeddings, clasificación y zero-shot con modelos populares, lo que permite evaluar rápidamente la calidad de las respuestas sin desplegar infraestructura.
- Consulta de límites y cuotas: revisar `CHECKLIST.md` para conocer los límites de 5 minutos del Hub, los créditos de inferencia disponibles y los fallbacks recomendados ante errores 402 o 403.
- Integración de Inference Providers en proyectos propios: los snippets sirven como punto de partida para conectar aplicaciones con los modelos alojados en HuggingFace, usando `provider="auto"` y el paquete `huggingface_hub`.
- Exploración de recursos de la oferta: el repositorio enlaza a una colección, un Space demo, un ebook y una discusión CTA, lo que permite a los usuarios revisar el contenido del paquete free-tier antes de decidir el pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere hardware propio para la inferencia, ya que los modelos se ejecutan en los servidores de HuggingFace Inference Providers.
- Para ejecutar los scripts solo se necesita Python con el paquete `huggingface_hub` instalado y una conexión a Internet.
- No se especifican requisitos de VRAM, GPU, latencia o throughput en la información disponible.
- Las opciones de despliegue se limitan a la API de HuggingFace; no se mencionan vLLM, llama.cpp, Ollama ni TGI en el repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no se puede comparar directamente con otros modelos. Los modelos referenciados en la documentación (Qwen3-Next-80B-A3B-Instruct y Llama-3.1-8B-Instruct) son de terceros y no forman parte de este repositorio.

## Limitaciones y advertencias

- No es un modelo de IA: el repositorio contiene scripts y documentación para acceder a Inference Providers, no pesos ni arquitecturas de modelo.
- Depende de la disponibilidad de créditos y tokens de HuggingFace. Si se recibe un error 402 (créditos insuficientes) o 403 (token inválido), el model card recomienda usar el Space ancla o el chat web del Hub.
- El model card advierte que no se debe confiar en un PNG si diverge del código EMV texto CRC, lo que indica posibles problemas de verificación de pagos o de seguridad.
- El idioma principal es el portugués (pt-BR); no hay indicación de soporte multilingüe en el repositorio.
- La licencia MIT se aplica al contenido del repositorio, pero los modelos referenciados tienen sus propias licencias.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto nuevo o de baja tracción.
- No hay información sobre sesgos, riesgo de alucinación o limitaciones de contexto, ya que no es un modelo.

## Enlaces

- Repositorio: https://huggingface.co/Ziulluizziul/round1-hf-pix-cta
- Space ancla PIX: https://huggingface.co/spaces/Ziulluizziul/round1-pix-r50
- Colección: https://huggingface.co/collections/Ziulluizziul/round1-pix-free-pack
- Discusión CTA: https://huggingface.co/Ziulluizziul/round1-hf-pix-cta/discussions
- Gist con muestra R$50: https://gist.github.com/Ziuluiziul/0deb075aedb06ade0892e6f848e80f69
- Hub multi-IA: https://ziuluiziul.github.io/round1-cumulunimbus/
- Documentación de precios: https://huggingface.co/docs/inference-providers/pricing
- Documentación de límites: https://huggingface.co/docs/hub/rate-limits
- Space demo-curso: https://huggingface.co/spaces/Ziulluizziul/round1-demo-curso
- Ebook: https://huggingface.co/Ziulluizziul/round1-hub-free-ebook
