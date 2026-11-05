# ZOKHID/univoice-vosk

## Resumen

`ZOKHID/univoice-vosk` no es un modelo entrenado por su autor, sino un espejo de los modelos pequeños oficiales de Vosk para reconocimiento de voz (ASR) en uzbeko y ruso. Los pesos originales los desarrolla Alpha Cephei y se distribuyen bajo licencia Apache 2.0. El repositorio existe para que la aplicación Android UniVoice Offline descargue estos paquetes con rapidez, evitando depender del servidor original de Vosk.

La tecnología subyacente es Kaldi, no un transformer: se trata de modelos acústicos y de lenguaje clásicos empaquetados en formato Vosk, pensados para inferencia completamente offline en dispositivos de gama baja. El tamaño del repositorio es de 0,1 GB, con dos ficheros ZIP de aproximadamente 51 MB (uzbek) y 46 MB (ruso).

Su relevancia es práctica: ofrece ASR multilingüe (uz/ru) sin conexión, con huella de memoria mínima, apto para integraciones móviles o embebidas donde un modelo tipo Whisper no cabría o implicaría latencias y consumos inaceptables. El autor reporta que, sobre 99 quejas sintetizadas de máquina expendedora, el emparejador de escenarios de la app acertó 96 con estos modelos, frente a 95 con Whisper large-v3 en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kaldi (modelos acústicos y de lenguaje clásicos, empaquetado Vosk) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por fragmentos de audio, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (los paquetes Vosk incluyen sus propios ficheros comprimidos) |
| Idiomas soportados | uzbeko (uz), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ZIP con modelo Vosk/Kaldi (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los modelos son los `vosk-model-small-uz-0.22` y `vosk-model-small-ru-0.22` oficiales de Alpha Cephei, copiados sin modificación. Se basan en la cadena de herramientas Kaldi: modelo acústico (típicamente redes TDNN/chain de tamaño reducido) más modelo de lenguaje y grafo de decodificación empaquetados en el formato de Vosk. No hay información pública en la model card sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO; esos detalles pertenecen a la documentación de Alpha Cephei y no se reproducen aquí.

La innovación relevante no es algorítmica sino de despliegue: los paquetes "small" están optimizados para ejecutarse en CPU en dispositivos móviles, con tamaños de decenas de megabytes. El repositorio añade valor operativo al servir los ZIP con checksums SHA-256 verificables, lo que permite descargas reproducibles en la app.

## Capacidades

- Reconocimiento de voz offline en uzbeko y ruso.
- Transcripción de audio por fragmentos, adecuada para comandos y frases cortas.
- Ejecución en CPU sin GPU, con consumo de memoria muy bajo.
- Integración en aplicaciones Android mediante el runtime Vosk.
- Verificación de integridad de los paquetes mediante SHA-256 publicado.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso.
- No es un modelo de lenguaje: no genera texto libre ni responde preguntas.

## Casos de uso

- Asistente de voz offline en Android: la app UniVoice Offline usa estos paquetes para transcribir la voz del usuario sin enviar audio a un servidor, lo que reduce latencia y mejora la privacidad.
- Emparejamiento de intenciones en dominios acotados: como en la evaluación del autor con quejas de máquina expendedora, el texto transcrito se compara contra escenarios predefinidos; los modelos pequeños bastan para vocabulario limitado.
- Kioscos y terminales embebidos: un dispositivo con poca RAM y sin GPU puede ejecutar el modelo ruso o uzbeko para comandos de voz locales.
- Aplicaciones de campo sin conectividad: inspecciones, inventario o partes de trabajo en zonas sin red, donde se transcribe en el dispositivo y se sincroniza después.
- Preprocesado de audio en pipelines: transcripción rápida de notas de voz cortas antes de un procesamiento posterior en servidor.
- Prototipado multilingüe uz/ru: validar flujos de voz en ambos idiomas con un coste de integración mínimo antes de invertir en modelos mayores.
- Verificación de integridad en despliegues: usar los SHA-256 publicados para asegurar que los paquetes descargados por los clientes no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre corpus públicos) en la información disponible. El único dato reportado por el autor es una evaluación interna: sobre 99 quejas sintetizadas de máquina expendedora, el emparejador de escenarios acertó 96 con estos modelos, frente a 95 con Whisper large-v3 en servidor. Es una métrica de tarea concreta, no de transcripción general, y no debe extrapolarse.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- RAM estimada: del orden de decenas de megabytes por modelo cargado, coherente con paquetes de 46-51 MB.
- GPU recomendadas: ninguna; no requiere aceleración gráfica.
- Cabe en cualquier dispositivo móvil o embebido con CPU moderna; también en Raspberry Pi y similares.
- Despliegue: runtime Vosk (bindings para Android, Python, Java, etc.); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan formatos de pesos distintos.
- Latencia y throughput: no disponibles en la información proporcionada; por diseño, los modelos "small" priorizan velocidad en CPU sobre precisión.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Ejecución |
|---|---|---|---|---|---|
| ZOKHID/univoice-vosk (uz) | Kaldi/Vosk small | uz | ~51 MB | Apache 2.0 | CPU, offline |
| ZOKHID/univoice-vosk (ru) | Kaldi/Vosk small | ru | ~46 MB | Apache 2.0 | CPU, offline |
| Whisper large-v3 | Transformer ASR | multilingüe | varios GB | MIT (según distribución) | GPU recomendada |
| Whisper small | Transformer ASR | multilingüe | cientos de MB | MIT (según distribución) | CPU/GPU |

Frente a Whisper, los modelos Vosk small son mucho más ligeros y rápidos en CPU, pero con menor precisión general y sin capacidades multilingües amplias ni marcas temporales tan ricas. La comparación de precisión solo está disponible en la evaluación interna del autor citada arriba.

## Limitaciones y advertencias

- No es un modelo original: es un espejo; cualquier corrección o mejora debe venir de Alpha Cephei.
- Precisión limitada: los modelos "small" sacrifican exactitud; el vocabulario y la robustez ante ruido son inferiores a modelos grandes.
- Solo uzbeko y ruso; no hay soporte para castellano ni otros idiomas.
- No es un modelo de lenguaje: no genera respuestas, no razona y no soporta tool calling.
- Riesgo de alucinación en el sentido de transcripciones plausibles pero incorrectas, especialmente con audio ruidoso o vocabulario fuera de dominio.
- La evaluación reportada (96/99) es interna, con audio sintetizado y una tarea acotada; no garantiza el mismo rendimiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución a Alpha Cephei.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; su mantenimiento futuro no está garantizado.
- Verificar siempre los SHA-256 publicados antes de desplegar los paquetes en clientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZOKHID/univoice-vosk
- Modelos oficiales Vosk: https://alphacephei.com/vosk/models
- Proyecto Vosk (Alpha Cephei): https://github.com/alphacep/vosk-api
