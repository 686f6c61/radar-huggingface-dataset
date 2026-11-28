# wilson007x/expressive-voice

## Resumen

Expressive voice es un conjunto de pesos derivados de VoxCPM2, el modelo de síntesis de voz desarrollado por OpenBMB, convertidos al formato ONNX para su ejecución sobre WebGPU en la aplicación RapidCreate. No se trata de un modelo entrenado desde cero, sino de una conversión de artefacto orientada a un motor de voz concreto: el repositorio contiene los ficheros que dicha aplicación descarga en tiempo de ejecución para habilitar la funcionalidad de voz expresiva. El autor del repositorio es el usuario wilson007x y la licencia declarada es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: no hay model card técnica, no se publican parámetros, contexto ni resultados de evaluación, y el pipeline no está declarado en Hugging Face. Su interés real está en el despliegue: demuestra el patrón de distribuir un TTS de VoxCPM2 como grafo ONNX ejecutable en navegador mediante WebGPU, lo que permite inferencia de voz en cliente sin backend dedicado.

El tamaño del repositorio es de 3,1 GB, coherente con pesos convertidos en precisión completa o semi-precisión más los ficheros auxiliares del tokenizer y del vocoder. Cualquier cifra sobre arquitectura interna, número de parámetros o calidad de síntesis debe remitirse al modelo base openbmb/VoxCPM2, ya que este repositorio no la documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de openbmb/VoxCPM2; el repo solo declara el formato ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el tag indica `base_model:quantized:openbmb/VoxCPM2`, sin especificar el esquema) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura en este repositorio. El modelo base es VoxCPM2 de OpenBMB, y los tags de Hugging Face lo marcan como cuantizado respecto a dicho base, pero no se detalla el método de cuantización aplicado ni las capas afectadas. El artefacto distribuido es un grafo ONNX pensado para el motor de voz de RapidCreate sobre WebGPU, lo que implica una conversión orientada a inferencia en navegador más que a entrenamiento o ajuste fino.

No se documentan datos de entrenamiento, número de tokens, composición del corpus, ni si hubo RLHF, DPO o ajuste específico de estilo expresivo. El README remite a un fichero NOTICE para los cambios realizados y a LICENSE para la licencia, pero esos detalles no están incluidos en la información disponible. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se recoge aquí.

## Capacidades

- Síntesis de voz (text-to-speech) expresiva, heredada de VoxCPM2, ejecutable mediante ONNX Runtime Web sobre WebGPU.
- Inferencia en cliente: el modelo está empaquetado para descargarse y ejecutarse en el navegador dentro de la aplicación RapidCreate, sin depender de un servicio de servidor.
- Generación de audio a partir de texto: es la función declarada del artefacto ("expressive voice files").
- No se documentan capacidades de clonación de voz, control de prosodia por etiquetas, multilingüismo, tool calling ni razonamiento multi-paso.
- No se declara soporte de streaming de audio ni de voces múltiples más allá de lo que implemente el motor de la aplicación.

## Casos de uso

- Síntesis de voz en aplicaciones web sin backend: el artefacto está pensado para descargarse en el cliente y ejecutarse con WebGPU, de modo que la generación de voz ocurre en el dispositivo del usuario y se evita enviar texto a un servidor.
- Lectura de contenido en voz alta en aplicaciones de productividad o lectura: al ejecutarse en local, permite narrar documentos sin coste por petición ni latencia de red más allá de la descarga inicial de los 3,1 GB.
- Accesibilidad en interfaces web: proporciona salida hablada para usuarios con discapacidad visual dentro de una aplicación que ya integra el motor de voz de RapidCreate.
- Prototipado de asistentes conversacionales con voz: sirve para validar una cadena texto a voz en navegador antes de decidir si se despliega un TTS en servidor.
- Evaluación de VoxCPM2 en formato ONNX: útil para equipos que quieran medir el rendimiento de este TTS bajo ONNX Runtime Web y compararlo con la ejecución en PyTorch.
- Distribución offline de un TTS: al ser ficheros descargables, encaja en escenarios con conectividad intermitente donde el modelo se cachea una vez y se reutiliza sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 3,1 GB, por lo que la descarga inicial y el espacio en disco o caché del navegador deben dimensionarse en consecuencia.
- La ejecución requiere un navegador con soporte de WebGPU y una GPU compatible; no se especifican modelos concretos de GPU en la documentación disponible.
- VRAM estimada: no disponible. Al ejecutarse sobre WebGPU, el consumo depende del backend y de la cuantización efectiva de los pesos ONNX, que no se detalla.
- No se confirma que quepa en GPU de consumo con un umbral concreto; el tamaño del artefacto sugiere que la memoria necesaria no es trivial, pero no hay cifras publicadas.
- Opciones de despliegue: ONNX Runtime Web con WebGPU es el camino declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de audio en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| Expressive voice (este repo) | ONNX | Apache-2.0 | Conversión de VoxCPM2 para WebGPU en RapidCreate | Hugging Face, 0 descargas |
| openbmb/VoxCPM2 | no disponible en esta información | no disponible en esta información | Modelo base de TTS de OpenBMB | Hugging Face (modelo de referencia) |
| Alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de este artefacto ni de alternativas concretas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card con arquitectura, parámetros, idiomas ni evaluación, lo que impide validar su calidad antes de integrarlo.
- El tag `base_model:quantized:openbmb/VoxCPM2` indica cuantización, pero se desconoce el esquema y su impacto en la fidelidad de la voz.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni de revisión por la comunidad.
- Al ser una conversión orientada a una aplicación concreta (RapidCreate), puede incluir cambios específicos del motor de voz que no estén documentados en el README; el autor remite a NOTICE, no incluido aquí.
- Dependencia de WebGPU: la inferencia fallará o degradará en navegadores o GPUs sin soporte, sin que se documenten rutas alternativas (WASM, CPU).
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; en TTS, los riesgos típicos son artefactos de pronunciación, prosodia incorrecta y sesgos de acento o idioma del corpus del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución respecto al modelo base y los términos de OpenBMB.
- El tamaño de 3,1 GB condiciona la experiencia de primera carga en cliente y puede ser inviable en conexiones lentas o dispositivos con almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wilson007x/expressive-voice
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
