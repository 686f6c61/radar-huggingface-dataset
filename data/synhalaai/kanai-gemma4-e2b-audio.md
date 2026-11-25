# SynhalaAI/KanAI-Gemma4-E2B-Audio

## Resumen

KanAI-Gemma4-E2B-Audio es un ajuste fino (fine-tune) del modelo Gemma 4 E2B en su variante instructiva cuantizada a 4 bits publicada por Unsloth, desarrollado por el usuario SynhalaAI. El modelo se distribuye con el pipeline `image-text-to-text` y conserva la arquitectura multimodal de la familia Gemma 4, incorporando etiquetas que apuntan a capacidades de audio en el nombre del repositorio, aunque la informacion disponible no detalla la naturaleza exacta de esa extension audio. Cuenta con aproximadamente 5.123 millones de parametros totales segun los pesos en safetensors y ocupa 17,9 GB en el repositorio.

El interes principal reside en que se trata de un derivado comunitario de Gemma 4 E2B, la variante de eficiencia de la cuarta generacion de Gemma, adaptado presumiblemente para tareas en ingles y cingales (si), lo que lo hace relevante para desarrolladores que trabajan con idiomas de Sri Lanka o comunidades diasporicas. El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

Al ser un fine-tune sobre una base cuantizada a 4 bits (bnb-4bit) y con solo 323 descargas y 1 like, se trata de un modelo de nicho, poco validado por la comunidad, cuya evaluacion conviene abordar con cautela y verificacion empirica propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 (aprox. 5,12 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base entrenada sobre bnb-4bit; cuantizaciones adicionales del fine-tune no disponibles |
| Idiomas soportados | en (ingles), si (cingales) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, un checkpoint instructivo de Gemma 4 E2B cuantizado a 4 bits por Unsloth. La informacion disponible no especifica la arquitectura interna exacta (atencion, capas, dimensiones ocultas) ni si Gemma 4 E2B emplea tecnicas como atencion lineal, mezcla de expertos o decodificacion especulativa. El pipeline declarado es `image-text-to-text`, lo que confirma la naturaleza multimodal texto-imagen heredada de la base.

No se dispone de datos sobre el volumen de tokens de entrenamiento del fine-tune, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Las etiquetas mencionan `unsloth`, lo que sugiere que el ajuste se realizo con las herramientas de Unsloth para entrenamiento eficiente en memoria, pero no hay informacion publica sobre hiperparametros, epochs o estrategia de congelacion de capas. Tampoco se detalla como se incorpora la componente de audio que sugiere el nombre del repositorio.

## Capacidades

- Generacion de texto conversacional en ingles y cingales, heredada del ajuste instructivo de la base.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), lo que permite tareas de descripcion de imagenes, respuesta visual a preguntas o extraccion de informacion de documentos escaneados.
- Posible soporte de audio segun el nombre del repositorio (`-Audio`), aunque la informacion disponible no confirma ni detalla esta capacidad.
- Razonamiento multi-turno en formato conversacional.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues limitadas a ingles y cingales segun las etiquetas; no se declaran otros idiomas.

## Casos de uso

- Atencion al cliente en cingales e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, adecuado para empresas que atienden a la diaspora cingalesa o al mercado de Sri Lanka, aunque la ventana de contexto real debe verificarse empiricamente.
- Procesamiento de documentos escaneados: al soportar entrada imagen-texto, puede extraer y resumir informacion de facturas, formularios o documentos oficiales en cingales, un caso util en digitalizacion de administraciones publicas.
- Descripcion de imagenes para accesibilidad: generacion de texto alternativo en ingles y cingales para contenidos visuales, aprovechando el pipeline multimodal.
- Prototipado de asistentes conversacionales bilingues: dado su tamano contenido (aprox. 5,12 mil millones de parametros), puede desplegarse en infraestructura moderada para pruebas de concepto de chatbots en entornos educativos o sanitarios de Sri Lanka.
- Investigacion linguistica aplicada: fine-tune de referencia para estudiar el comportamiento de Gemma 4 en cingales, un idioma de bajos recursos en la mayoria de modelos abiertos.
- Analisis de imagenes con contexto textual: por ejemplo, responder preguntas sobre capturas de pantalla o fotografias con instrucciones en cingales, util en herramientas de soporte tecnico.
- Experimentacion con audio (si se confirma la capacidad): transcripcion o comprension de audio en contextos bilingues, aunque requiere validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 5,12 mil millones de parametros, en fp16 requeriria del orden de 10-11 GB solo para pesos, mas overhead de activaciones y cache KV; en 4 bits (como la base) podria situarse en torno a 4-6 GB, aunque la cuantizacion exacta del fine-tune no esta confirmada.
- GPU recomendadas: A100 o H100 para despliegue de produccion con throughput alto; RTX 4090 o L40S para inferencia en fp16 con comodidad.
- GPU de consumo: es probable que quepa en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) usando cuantizacion 4 bits; en fp16 completo requeriria 16 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan pesos GGUF, aunque no se confirma su disponibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| KanAI-Gemma4-E2B-Audio | ~5,12 mil M | no disponible | no disponible | en, si | Fine-tune comunitario multimodal, acceso restringido |
| Gemma 4 E2B (base de Google) | ~5 mil M (variante E2B) | no disponible | Gemma Terms of Use (habitual en la familia) | Multilingue amplio | Modelo original, mayor validacion y soporte |
| Qwen2.5-VL 3B / 7B | 3-7 mil M | 32K-128K (segun variante) | Apache 2.0 (variantes) | Multilingue | Alternativa multimodal abierta con contexto amplio |
| Llama 3.2 3B / 11B Vision | 3-11 mil M | 128K | Llama Community License | Multilingue | Alternativa multimodal con ecosistema amplio |

La comparativa se ofrece como referencia cualitativa; no se dispone de datos de rendimiento del modelo evaluado para contrastar numericamente.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en pipelines.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar los terminos antes de cualquier despliegue productivo.
- Fine-tune comunitario con muy baja adopcion (323 descargas, 1 like): escasa validacion externa, riesgo elevado de comportamientos no documentados.
- Entrenado sobre una base cuantizada a 4 bits, lo que puede degradar la calidad respecto al modelo original en tareas sensibles a precision.
- Idiomas limitados a ingles y cingales; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de ~5 mil millones de parametros, especialmente en tareas de razonamiento complejo o matematicas.
- La capacidad de audio sugerida por el nombre no esta documentada; no debe asumirse su funcionamiento sin pruebas.
- Ausencia de datos sobre sesgos, dataset de entrenamiento y evaluaciones de seguridad.
- Longitud de contexto no especificada: planificar arquitecturas que no dependan de ventanas largas hasta confirmarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SynhalaAI/KanAI-Gemma4-E2B-Audio
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (herramientas de entrenamiento eficiente): https://github.com/unslothai/unsloth
- Documentacion de Gemma (Google): https://ai.google.dev/gemma
