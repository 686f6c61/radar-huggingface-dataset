# sulabhkatiyar/indic-tiny-tts-marathi

## Resumen

Indic Tiny TTS: Marathi es un modelo de síntesis de voz (text-to-speech) para maratí, desarrollado por el usuario independiente sulabhkatiyar dentro de la colección Indic Tiny TTS Models, que agrupa doce modelos pequeños para once lenguas indias y el inglés indio. El modelo convierte texto en escritura devanagari en audio de 24 kHz con dos voces (femenina y masculina) y está diseñado explícitamente para inferencia en CPU sin GPU, con pesos disponibles tanto en PyTorch como en ONNX Runtime.

La arquitectura es un sistema TTS ligero de tipo VITS, entrenado desde cero sobre corpus de voz maratí (AI4Bharat Rasa para la voz femenina y LIMMITS/SYSPIN para la masculina). Su interés radica en la relación entre tamaño y calidad: con un peso en disco de unos 0,2 GB y un rendimiento en CPU de 7× tiempo real en un hilo x86 y 38× en un Apple M1, consigue tasas de error de carácter (CER) competitivas frente a modelos entre 3 y 42 veces más grandes.

Es relevante ahora porque demuestra que un TTS de calidad aceptable para una lengua de recursos medios puede desplegarse en dispositivos de gama baja, navegadores o servidores sin acelerador, lo que abarata la localización de aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en maratí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo, no disponible el detalle exacto de capas) |
| Parametros totales | 8.935.049 según safetensors; la model card declara 22,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch y ONNX (FP32/FP16 no especificado) |
| Idiomas soportados | maratí (mr), escritura devanagari |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la familia VITS, un esquema de síntesis extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador generativo con discriminadores adversariales durante el entrenamiento. La model card no detalla el número de capas, la dimensión oculta ni la configuración exacta del generador; solo confirma que el audio de salida es de 24 kHz y que el modelo es lo bastante pequeño para ejecutarse en un solo hilo de CPU.

Los datos de entrenamiento provienen del dataset sulabhkatiyar/indic-tts-mini-24k, que a su vez deriva de sulabhkatiyar/indic-tts-multilingual-prepared. La voz femenina se entrenó con AI4Bharat Rasa y la masculina con el corpus LIMMITS/SYSPIN. No se especifica el número de horas de audio, el número de tokens ni si hubo ajuste por RLHF o DPO; en TTS estos pasos no suelen aplicarse y la model card no los menciona. La innovación principal no es arquitectónica sino de eficiencia: el modelo se distribuye también en ONNX para inferencia sin PyTorch y se evalúa explícitamente en un solo hilo de CPU.

## Capacidades

- Síntesis de voz a partir de texto en devanagari maratí, con salida de audio a 24 kHz.
- Dos voces seleccionables mediante el parámetro `voice` (`"female"` y `"male"`).
- Inferencia en CPU sin GPU, con soporte de PyTorch y ONNX Runtime.
- Ejecución en un solo hilo, lo que permite despliegue en dispositivos con recursos muy limitados.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modo thinking; no aplica a un modelo TTS.
- No se documentan capacidades de clonación de voz, control de emoción, prosodia explícita ni multilingüismo más allá del maratí.
- No se documenta procesamiento de audio de entrada (no es un modelo de reconocimiento de voz).

## Casos de uso

- Lectura de noticias y artículos en maratí: el modelo convierte titulares y párrafos en audio con una CER de 1,79 % sobre frases de noticias de FLORES-200, adecuada para síntesis de contenido informativo con pronunciación fiable.
- Accesibilidad para personas con discapacidad visual: al ejecutarse a 38× tiempo real en un hilo de Apple M1, puede integrarse en lectores de pantalla locales sin depender de servicios en la nube ni de conectividad.
- Asistentes de voz en dispositivos empotrados: su tamaño de 0,2 GB y su funcionamiento en CPU permiten desplegarlo en Raspberry Pi o móviles de gama baja para respuestas habladas en maratí.
- Audiolibros y contenido educativo: la disponibilidad de dos voces permite alternar narradores en materiales didácticos o narraciones largas, con la ventaja de que el procesamiento es local y no incurre en costes por petición.
- Sistemas de anuncios públicos y transporte: generación de avisos pregrabados o dinámicos en maratí para estaciones, aeropuertos o edificios públicos, donde la latencia de 0,136 de factor de tiempo real en x86 de cuatro vCPU es suficiente para reproducción en tiempo real.
- Pruebas y prototipado de interfaces de voz: al ser un modelo pequeño y con licencia CC BY 4.0, sirve para validar flujos de conversación en maratí antes de invertir en modelos mayores como IndicF5 o indic-parler-tts.
- Localización de aplicaciones: integración en pipelines de CI/CD para generar recursos de audio en maratí a partir de cadenas de texto, con la posibilidad de ejecutar la síntesis en el propio runner sin GPU.

## Benchmarks y rendimiento

La model card publica evaluaciones de CER sobre dos conjuntos: 100 frases de noticias de FLORES-200 y 300 frases reservadas del corpus de evaluación.

| Modelo | Tamaño | CER FLORES-200, % | CER test reservado, % |
|---|---:|---:|---:|
| **Indic Tiny TTS Marathi** | 22,5 M (declarado) | **1,79** | **4,04** |
| ai4bharat/IndicF5 | 350,6 M | 1,40 | 2,70 (40 frases) |
| AI4Bharat/Indic-TTS (mr.zip) | 65,6 M | 1,54 | 6,94 |
| ai4bharat/vits_rasa_13 | 31,3 M | 1,99 | 3,83 |
| ai4bharat/indic-parler-tts | 937,8 M | 2,37 | 6,00 (40 frases) |
| SYSPIN/vits_Marathi_Female + Male | 29,1 M | 2,48 | 6,28 |
| rhasspy/piper-voices (mr_IN-google-medium) | 19,2 M | 3,44 | 8,45 |
| facebook/mms-tts-mar | 29,1 M | 5,41 | 12,81 |
| multilingual-tts/VITS-OpenBible-Marathi | 29,1 M | 9,37 | no disponible |

En velocidad, la model card reporta los siguientes factores de tiempo real (menor es más rápido), medidos sobre 30 frases reservadas:

| Hardware | Configuración | Factor de tiempo real | Veces más rápido que tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 0,136 | 7× |
| Apple M1, CPU | PyTorch, 1 hilo | 0,026 | 38× |
| NVIDIA T4 | PyTorch | 0,016 | 62× |

La model card afirma que iguala la tasa de error de indic-parler-tts con 1/42 del tamaño y unas 113× más rápido en T4, y la de IndicF5 con 1/16 del tamaño y unas 150× más rápido en T4. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo cabe holgadamente en cualquier tarjeta con más de 1 GB de memoria, dado su tamaño de 0,2 GB en disco.
- GPU recomendadas: NVIDIA T4 es la única documentada en la model card; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobrada.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM; también funciona sin GPU.
- Despliegue: PyTorch nativo y ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: factor de tiempo real de 0,136 en un hilo x86, 0,026 en un hilo de Apple M1 y 0,016 en T4; es decir, entre 7× y 62× más rápido que tiempo real según hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | CER test reservado, % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS Marathi** | 22,5 M | maratí | 4,04 | CC BY 4.0 | Hugging Face, ONNX y PyTorch |
| ai4bharat/vits_rasa_13 | 31,3 M | maratí | 3,83 | no disponible en la información | Hugging Face |
| rhasspy/piper-voices (mr_IN-google-medium) | 19,2 M | maratí | 8,45 | no disponible en la información | Hugging Face, ecosistema Piper |
| facebook/mms-tts-mar | 29,1 M | maratí | 12,81 | no disponible en la información | Hugging Face |
| ai4bharat/IndicF5 | 350,6 M | varias lenguas indias | 2,70 (40 frases) | no disponible en la información | Hugging Face |

Frente a los modelos de tamaño comparable, el modelo de sulabhkatiyar queda al nivel de vits_rasa_13 y muy por delante de Piper y mms-tts-mar en el conjunto reservado. Frente a los modelos grandes, IndicF5 obtiene mejor CER en el subconjunto de 40 frases, pero a costa de 16 veces más parámetros y un coste de inferencia mucho mayor.

## Limitaciones y advertencias

- Solo soporta maratí en escritura devanagari; no se ha evaluado en otras lenguas ni en transliteraciones latinas.
- La model card declara 22,5 M de parámetros, mientras que el recuento de safetensors da 8.935.049; conviene verificar el dato antes de comparar cifras de tamaño con otros modelos.
- El CER en el conjunto reservado (4,04 %) es más del doble que en FLORES-200 (1,79 %), lo que sugiere sensibilidad al dominio y al estilo del texto de entrada.
- No se documentan sesgos de género, acento ni prosodia; las dos voces proceden de corpus concretos (Rasa y LIMMITS/SYSPIN) y pueden no representar la diversidad dialectal del maratí.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y palabras no nativas, no cuantificado en la model card.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales sobre las voces ni sobre los corpus de origen (Rasa, LIMMITS), que conviene revisar por separado.
- No se documenta soporte de clonación de voz ni control fino de prosodia, lo que limita su uso en aplicaciones que requieran expresividad.
- La model card marca `inference: false`, por lo que la inferencia no está habilitada en el widget de Hugging Face; hay que ejecutarlo localmente o vía API propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-marathi
- Colección Indic Tiny TTS Models: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Corpus AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Corpus LIMMITS 2024: https://huggingface.co/datasets/iAkashPaul/limmits-2024
- Modelo comparado ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparado ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparado ai4bharat/vits_rasa_13: https://huggingface.co/ai4bharat/vits_rasa_13
- Modelo comparado facebook/mms-tts-mar: https://huggingface.co/facebook/mms-tts-mar
- Voces Piper para maratí: https://huggingface.co/rhasspy/piper-voices
