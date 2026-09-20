# zorost/nava-fa

## Resumen

zorost/nava-fa es un modelo de síntesis de voz (text-to-speech) para persa publicado por el usuario zorost en HuggingFace. Se trata de un ajuste fino del modelo base kyutai/pocket-tts, un sistema de TTS compacto de aproximadamente 109,5 millones de parámetros que la metadata del repositorio etiqueta explícitamente como apto para ejecución en CPU. Conserva la librería del original (pocket-tts) y distribuye sus pesos en formato safetensors, con etiquetas que indican además capacidad de clonación de voz.

Con 109.502.146 parámetros y un repositorio de 0,4 GB, nava-fa se sitúa en la gama de los sistemas de voz ligeros: no exige GPU dedicada y puede desplegarse en hardware de consumo, lo que resulta relevante para aplicaciones de escritorio, asistentes locales y servicios con restricciones de coste o de privacidad. El interés añadido es idiomático: el persa (farsi) cuenta con menos herramientas de voz abiertas y documentadas que el inglés u otros idiomas mayoritarios, de modo que un modelo ajustado específicamente para fa cubre un hueco práctico para desarrolladores iraníes o para productos localizados en ese mercado.

El acceso está restringido: se trata de un modelo gated que obliga a aceptar las condiciones en HuggingFace antes de la descarga. La licencia es propia (zorost-nava-fa-license), etiquetada como license:other, por lo que los términos de uso comercial deben verificarse caso por caso. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no detalla la arquitectura interna; hereda la del modelo base kyutai/pocket-tts) |
| Parámetros totales | 109.502.146 (≈109,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | persa (farsi, código `fa`) |
| Licencia | zorost-nava-fa-license (etiquetada como `license:other`) |
| Formato de pesos | safetensors |
| Autor | zorost |
| Modelo base | kyutai/pocket-tts (finetune) |
| Librería | pocket-tts |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 0,4 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creación | 19 de septiembre de 2026 |
| Última actualización | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información publicada en el repositorio no especifica la arquitectura interna del modelo más allá de su condición de ajuste fino de kyutai/pocket-tts y de su tamaño real en safetensors, 109.502.146 parámetros. Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, la duración de las muestras de audio, el uso de técnicas de alineación como RLHF o DPO, ni el procedimiento de ajuste (fine-tuning completo, LoRA u otro). Todas esas cuestiones deben considerarse no disponibles.

Lo que sí puede afirmarse a partir de la metadata es que se trata de un sistema de síntesis de voz, no de un modelo de lenguaje de propósito general: la etiqueta de pipeline es `text-to-speech`, la librería asociada es `pocket-tts` y entre las etiquetas figuran `speech-synthesis` y `voice-cloning`. La etiqueta `cpu` sugiere que el diseño prioriza la inferencia en procesador, coherente con un recuento de parámetros de dos órdenes de magnitud inferior al de los grandes modelos de audio generativo. Cualquier innovación técnica concreta (códec neuronal, decodificación por flujo, atención lineal) no está descrita en la información disponible y, por tanto, no se afirma aquí.

## Capacidades

- Síntesis de voz a partir de texto en persa (`fa`), que es el único idioma declarado en la metadata del modelo.
- Clonación de voz: la etiqueta `voice-cloning` aparece de forma explícita entre las etiquetas del repositorio, aunque no se detallan ni la duración mínima de la muestra de referencia ni el procedimiento de condicionamiento.
- Inferencia en CPU: la etiqueta `cpu` indica que el modelo está pensado para ejecutarse sin GPU dedicada.
- Generación de audio orientada a TTS dentro de la librería `pocket-tts`, del mismo modo que el modelo base.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje con interfaz de herramientas).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; la ficha solo declara persa.
- Otras capacidades especiales (modo de razonamiento, visión, audio de entrada, traducción): no disponibles.

## Casos de uso

- Audiolibros y lectura de textos largos en persa: el modelo convierte texto plano en voz sin depender de servicios en la nube, lo que permite generar capítulos completos en una máquina local y distribuir el audio resultante con control total sobre el coste por hora de síntesis.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y aplicaciones de escritorio en persa, aprovechando que la inferencia en CPU permite empotrar el motor en el propio equipo del usuario sin conexión a internet ni cesión de datos.
- Atención al cliente telefónica (IVR) en farsi: generación de mensajes y respuestas habladas en sistemas de respuesta de voz interactiva, donde el tamaño reducido del modelo facilita el despliegue en servidores modestos o incluso en el borde de la red telefónica.
- Localización y doblaje de contenido audiovisual: producción de pistas de voz en persa para vídeos, cursos o material corporativo, con la clonación de voz como vía para mantener una identidad sonora consistente entre episodios.
- Síntesis de voz personalizada con fines asistivos: la capacidad de clonación etiquetada permite construir voces de referencia para personas que han perdido el habla, siempre que exista consentimiento explícito del titular de la voz original.
- Aprendizaje de idiomas y material didáctico: generación de ejemplos de pronunciación en persa para aplicaciones de estudio, con la ventaja de que el modelo puede ejecutarse en el propio dispositivo del estudiante y funcionar sin conexión.
- Preservación de patrimonio oral: transcripción a audio de textos, poemas o documentación en persa para archivos digitales, donde la ausencia de dependencia de API externas facilita el cumplimiento de requisitos de custodia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de síntesis (MOS, CMOS, WER del texto sintetizado), comparativas con otros sistemas de TTS en persa, ni medidas de latencia o throughput. Los contadores públicos del modelo son 0 descargas y 0 "likes", por lo que tampoco existe validación de la comunidad que pueda citarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética a partir del recuento real de parámetros (109.502.146), los pesos ocupan aproximadamente 438 MB en fp32, 219 MB en fp16/bf16 y 110 MB en int8, a lo que hay que sumar memoria para activaciones y para el búfer de audio generado.
- Memoria del sistema: no hay cifras publicadas; por el tamaño del repositorio (0,4 GB) y la etiqueta `cpu`, es razonable esperar un consumo de RAM de un orden de magnitud de 1 GB o inferior, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no disponible. Dado el tamaño del modelo, cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050, RTX 4090) debería poder alojarlo con holgura; las A100 o H100 solo tendrían sentido para servir muchas peticiones concurrentes.
- ¿Cabe en GPU de consumo? Sí, según la estimación anterior, aunque el dato no está verificado en la información proporcionada.
- Opciones de despliegue: la librería declarada es `pocket-tts`, la del modelo base. No hay evidencia en la información disponible de soporte para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a síntesis de voz.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La única comparación que puede construirse con los datos proporcionados es frente al modelo base del que deriva. No se dispone de información sobre otras alternativas de TTS en persa en el material consultado.

| Modelo | Parámetros | Idiomas | Formato | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|---|
| zorost/nava-fa | 109.502.146 | persa (`fa`) | safetensors | zorost-nava-fa-license (`other`) | gated | no publicados |
| kyutai/pocket-tts | no disponible en la información proporcionada | no disponible en la información proporcionada (el modelo base no declara persa entre los idiomas de esta ficha) | safetensors | no disponible en la información proporcionada | no disponible en la información proporcionada | no publicados en la información disponible |

Otras alternativas de la misma categoría (sistemas de TTS multilingües o específicos de persa): no disponible.

## Limitaciones y advertencias

- Cobertura idiomática restringida: la metadata solo declara persa (`fa`); no hay evidencia de calidad en otros idiomas ni de cambio de código (code-switching) en textos que mezclen persa con inglés o árabe.
- Ausencia total de benchmarks: no hay métricas objetivas de naturalidad, inteligibilidad ni precisión de pronunciación, y el modelo acumula 0 descargas, por lo que no existe validación independiente.
- Detalles de entrenamiento desconocidos: al no documentarse el corpus de ajuste fino, no puede evaluarse el sesgo acústico (género, acento, registro, variedad dialectal del persa) ni el riesgo de sobreajuste a las voces de entrenamiento.
- Riesgo de alucinación en su acepción acústica: como todo sistema de TTS, puede producir pronunciaciones incorrectas, omisiones, repeticiones o artefactos en números, nombres propios y préstamos léxicos; no hay información sobre el comportamiento del modelo ante texto fuera de dominio.
- Licencia no estándar: la etiqueta `license:other` y el nombre zorost-nava-fa-license implican términos propios que deben leerse antes de cualquier uso comercial, redistribución o despliegue en producto.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que puede bloquear su uso en entornos automatizados de integración continua o en organizaciones con políticas estrictas de aprobación de licencias.
- Riesgo ético de la clonación de voz: la capacidad etiquetada `voice-cloning` permite generar imitaciones de voces reales; en ausencia de documentación sobre consentimiento, marcas de agua o limitaciones de uso, es imprescindible aplicar controles propios para evitar suplantación de identidad y desinformación.
- Falta de datos operativos: sin cifras publicadas de latencia, throughput ni consumo de memoria, cualquier planificación de capacidad en producción debe hacerse con pruebas propias.
- Inexistencia de soporte de la comunidad: 0 descargas y 0 "likes" implican que no hay issues, foros ni ejemplos de uso verificables más allá de la ficha del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zorost/nava-fa
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo (los resultados devueltos corresponden a entradas de diccionario para la palabra inglesa "query" y no guardan relación con el modelo).
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
