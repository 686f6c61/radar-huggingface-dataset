# zahidpichen/whipser_base

## Resumen

`zahidpichen/whipser_base` es un adaptador LoRA publicado con la librería PEFT que se aplica sobre el modelo de reconocimiento automático del habla `openai/whisper-small`. No es un modelo entrenado desde cero: es un conjunto de pesos de bajo rango (rango y alpha no documentados) que modifican el comportamiento del encoder-decoder de Whisper. El autor declara el modelo base mediante los tags `base_model:adapter:openai/whisper-small` y `lora`, y la card indica compatibilidad con la versión 0.21.2 de PEFT.

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de un repositorio sin documentación efectiva. La model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`, el repositorio registra 0 descargas y 0 likes, y el tamaño reportado es de 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar realmente subidos o que el contenido es despreciable en tamaño. No se especifica el dominio de ajuste, los datos de entrenamiento, el idioma ni la licencia.

Por tanto, esta ficha describe la arquitectura heredada del modelo base (Whisper small, transformer encoder-decoder de aproximadamente 244 millones de parámetros según la documentación upstream) y marca de forma sistemática como "no disponible" todo lo específico del adaptador. El nombre del repositorio (`whipser_base`) apunta a `whisper-base`, pero el tag de modelo base apunta a `whisper-small`, una inconsistencia adicional que el autor no resuelve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder-decoder Whisper (`openai/whisper-small`) |
| Parametros totales | No disponible para el adaptador (rango LoRA no documentado); el modelo base whisper-small tiene aproximadamente 244 M de parámetros según la documentación upstream |
| Longitud de contexto | No disponible en la card; el modelo base procesa ventanas de audio de hasta 30 s (1500 frames mel) por pasada |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors y el modelo base admite fp16, int8 y conversiones a GGML |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador; el modelo base upstream declara Apache-2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente, Whisper small, es un transformer encoder-decoder con atención completa, diseñado para recibir espectrogramas mel de 80 canales y generar tokens de texto. El encoder transforma la representación acústica y el decoder autoregresivo produce la transcripción, con tokens especiales de control de tarea (transcripción, traducción, identificación de idioma) y marcas de tiempo. Whisper se entrena de forma débilmente supervisada sobre un corpus multilingüe y multitarea a gran escala descrito en el paper original de OpenAI; el modelo small es la tercera talla de la familia, por encima de tiny y base.

Sobre el adaptador no hay información técnica alguna: se desconoce el rango LoRA, el valor de alpha, los módulos objetivo (atención, proyecciones o ambos), el número de pasos, la tasa de aprendizaje, el dataset de ajuste y si se congelaron encoder, decoder o ambos. Tampoco se indica si el ajuste fue supervisado sobre transcripciones, si se usó destilación o si se aplicó algún tipo de regularización. La única referencia técnica verificable es la versión de PEFT declarada (0.21.2) y el tag de tarea `lora`.

## Capacidades

- Reconocimiento automático del habla: hereda del modelo base la transcripción de audio a texto, sujeta al dominio concreto del ajuste, que el autor no documenta.
- Traducción de voz a texto: Whisper small soporta la tarea de traducción al inglés desde otros idiomas, aunque no se confirma que el adaptador preserve esta capacidad.
- Identificación de idioma: capacidad presente en el modelo base mediante token de tarea; no verificada tras el ajuste.
- Marcas de tiempo a nivel de segmento: el decoder de Whisper puede emitir timestamps; se desconoce si el ajuste las conserva.
- Tool calling / function calling: no disponible. Whisper es un modelo de ASR, no un modelo de instrucciones con soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible para el adaptador; el modelo base es multilingüe.
- Capacidades especiales (vision, audio de entrada directa, thinking mode): únicamente audio como entrada, por herencia del modelo base.

## Casos de uso

- Transcripción de audio de dominio específico: si el ajuste se realizó sobre un corpus concreto (por ejemplo, vocabulario técnico o acento particular), el adaptador puede mejorar la tasa de error respecto al whisper-small genérico en ese dominio. Requiere validación empírica previa, dado que el autor no documenta el corpus.
- Subtitulado automático de vídeo: el pipeline cargaría whisper-small con el adaptador LoRA y generaría transcripciones con marcas de tiempo para postproducción, siempre que el ajuste no haya degradado la emisión de timestamps.
- Analítica de llamadas en atención al cliente: transcripción por lotes de grabaciones telefónicas para alimentar búsqueda y clasificación posterior; el tamaño reducido del modelo permite procesar horas de audio en una sola GPU consumer.
- Actas de reuniones: transcripción de audio de sala con ventanas de 30 s encadenadas mediante detección de actividad de voz, ejecutable en local sin enviar datos a servicios externos.
- Prototipado de investigación en adaptación eficiente: el adaptador sirve como ejemplo reproducible de ajuste LoRA sobre Whisper para experimentos académicos de bajo coste, comparando metodologías de PEFT en ASR.
- Procesamiento en el borde (edge): combinado con whisper.cpp o faster-whisper en CPU, permite transcripción en dispositivos sin GPU, útil para grabadoras o aplicaciones de accesibilidad offline.
- Preetiquetado de datasets de audio: uso del modelo ajustado para generar transcripciones iniciales que luego se corrigen manualmente, reduciendo el coste de anotación en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, CER ni evaluaciones comparativas, y el repositorio no enlaza a ningún informe de evaluación. Tampoco se dispone de datos de latencia o throughput medidos para el adaptador.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (unos pocos MB en safetensors), aunque el repositorio reporta 0.0 GB, por lo que la disponibilidad real de los pesos debe comprobarse antes de usarlo.
- VRAM para inferencia completa: el modelo base whisper-small en fp16 ocupa aproximadamente 0,5 GB de pesos; con overhead de activaciones y decodificación conviene reservar entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, T4, L4). Para lotes grandes o servicio concurrente, A10G, L40S o A100 aportan margen.
- Cabe en GPU consumer: sí, en todas las RTX y en muchas iGPU con suficiente memoria compartida.
- CPU: viable mediante whisper.cpp o faster-whisper con cuantización int8, con mayor latencia que en GPU.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; faster-whisper (requiere fusionar o convertir los pesos); whisper.cpp (requiere conversión a GGML, no soporta PEFT directamente); endpoint de HuggingFace Inference. vLLM y TGI no son adecuados para Whisper en la mayoría de configuraciones.
- Latencia y throughput: no disponibles para el adaptador. En el modelo base, la latencia depende de la duración del audio y del backend elegido; no se aportan medidas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zahidpichen/whipser_base` (adaptador LoRA) | Adaptador de rango no documentado sobre whisper-small (~244 M) | 30 s por ventana (heredado) | No disponible | No disponible | Repositorio con 0 descargas y 0,0 GB reportados |
| `openai/whisper-small` | ~244 M | 30 s por ventana | Multilingüe | Apache-2.0 | Público y ampliamente desplegado |
| `openai/whisper-base` | ~74 M | 30 s por ventana | Multilingüe (variante `.en` monolingüe) | Apache-2.0 | Público, con redistribuciones cuantizadas |
| `openai/whisper-medium` | ~769 M | 30 s por ventana | Multilingüe | Apache-2.0 | Público, requiere más VRAM |
| `openai/whisper-large-v3` | ~1550 M | 30 s por ventana | Multilingüe | Apache-2.0 | Público, orientado a GPU de 10 GB o más |

La comparación relevante es frente al propio `openai/whisper-small`: el adaptador solo aporta valor si el ajuste LoRA mejora el WER en un dominio concreto, extremo que no está demostrado ni documentado en el repositorio. Frente a whisper-base, el adaptador parte de un modelo con mayor capacidad, pero carece de cualquier métrica publicada.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto con todos los campos sin rellenar; no hay información sobre datos, hiperparámetros ni evaluación.
- Posible ausencia de pesos: el tamaño del repositorio es de 0,0 GB y las descargas son 0, lo que hace plausible que el adaptador no esté publicado de forma utilizable.
- Inconsistencia de nomenclatura: el identificador menciona `base` mientras el tag de modelo base apunta a `whisper-small`; conviene verificar qué checkpoint se usó realmente.
- Licencia no declarada para el adaptador: aunque el modelo base es Apache-2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre para uso comercial. Se recomienda contactar con el autor.
- Dominio de ajuste desconocido: sin saber sobre qué datos se entrenó, no es posible anticipar si mejora o degrada el rendimiento fuera de ese dominio; el sobreajuste a un corpus estrecho puede aumentar el WER general.
- Riesgo de alucinación: inherente a Whisper, especialmente en silencios, ruido o audio musical, donde el decoder puede generar texto plausible no presente en el audio.
- Sesgos del modelo base: Whisper presenta disparidades de error entre variedades dialectales, acentos y edades, además de sesgos demográficos documentados en la literatura; el ajuste LoRA puede amplificarlos si el corpus era homogéneo.
- Idioma no especificado: no se puede garantizar el rendimiento en castellano ni en ninguna otra lengua concreta sin evaluación previa.
- Limitación estructural de contexto: ventanas de 30 s, con degradación en audio largo si el encadenado no se gestiona con solapamiento y detección de actividad de voz.
- Sin soporte de tool calling ni de instrucciones: no debe emplearse como sustituto de un LLM en pipelines de agentes.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zahidpichen/whipser_base
- Modelo base: https://huggingface.co/openai/whisper-small
- Whisper base (variante de referencia): https://huggingface.co/openai/whisper-base.en
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de presentación de Whisper: https://openai.com/blog/whisper/
- Calculadora de impacto medioambiental citada en la card: https://mlco2.github.io/impact#compute
- Lacoste et al. (2019), estimación de emisiones: https://arxiv.org/abs/1910.09700
