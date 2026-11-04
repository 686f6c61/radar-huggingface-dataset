# zhagaramlabs/kuyil-20m

## Resumen

Kuyil 20M (குயில், "cuco" en tamil) es un modelo de síntesis de voz (text-to-speech) para tamil desarrollado por Zhagaram Labs, un laboratorio sin ánimo de lucro centrado en tecnologías del lenguaje para tamil. El modelo convierte texto en tamil, palabras inglesas en alfabeto latino y números (incluidas cantidades en rupias) en audio inteligible de 16 kHz, con dos voces (femenina y masculina) procedentes del corpus IndicTTS de IIT Madras.

Se trata de un modelo deliberadamente minúsculo: 21.834.845 parámetros en safetensors, y 22.651.402 contando el vocoder FARGAN incluido. Su interés radica en la relación entre tamaño, velocidad y calidad: sintetiza a un factor de tiempo real de 0,06-0,07 en un solo hilo de CPU Apple Silicon, es decir, unas 15 veces más rápido que tiempo real, lo que lo hace viable en teléfonos, lectores de pantalla y agentes de voz sin GPU.

La arquitectura sigue la receta de PiVo-1.4M adaptada al tamil: un codificador de texto con predictor de duración y un decodificador causal que predice 20 características FARGAN cada 10 ms. El modelo se publica bajo licencia CC BY 4.0 y el repositorio ocupa 0,1 GB, lo que facilita su distribución y despliegue en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto + predictor de duración + decodificador causal (estilo PiVo), con vocoder FARGAN |
| Parametros totales | 21.834.845 (safetensors); 22.651.402 incluyendo el vocoder |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_token_frames: 200 fotogramas de 10 ms) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | Tamil (ta), inglés (en, palabras en alfabeto latino) |
| Licencia | CC BY 4.0 (pesos); vocoder FARGAN en `pivo/` bajo Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Frecuencia de muestreo | 16 kHz |
| Voces | 2 (femenina y masculina) |
| Vocabulario | 128 tokens |
| Anchura del modelo | 384 (ff_width 1024, 8 cabezas, 4 KV heads) |
| Capas | 10 de texto, 6 de decodificador |
| Dataset de entrenamiento | SPRINGLab/IndicTTS_Tamil (IIT Madras), 9.437 frases, 24,8 h tras recorte |
| Factor de tiempo real | 0,06-0,07 en un hilo de CPU Apple Silicon |

## Arquitectura y entrenamiento

El modelo reproduce la receta de PiVo-1.4M reconstruida para tamil. Un codificador de texto transforma la secuencia de fonemas en representaciones; un predictor de duración estima cuántos fotogramas corresponden a cada unidad; y un decodificador causal predice 20 características FARGAN cada 10 ms. El vocoder FARGAN de PiVo (incluido en el directorio `pivo/`) convierte esas características en audio a 16 kHz. La configuración concreta es: vocabulario de 128, 2 voces, anchura 384, ff_width 1024, 8 cabezas de atención con 4 KV heads, 10 capas de texto, 6 capas de decodificador, kernel 5, anchura de duración 256, dimensión de características 20, ventana 64, dropout 0,1 y máximo de 200 fotogramas por token.

El entrenamiento usó IndicTTS Tamil de IIT Madras a través del espejo SPRINGLab/IndicTTS_Tamil: 9.437 frases de una hablante femenina y un hablante masculino, con 24,8 h tras recorte de bordes, de las cuales se emplearon 9.022 enunciados de hasta 30 s. La alineación fonética se obtuvo con Montreal Forced Aligner 3.4.3 entrenado sobre un conjunto propio de fonemas tamil. La función de pérdida combina smooth-L1 sobre características normalizadas y 0,1 × error cuadrático sobre logaritmos de duración. Se entrenó con batch 8, tasa de aprendizaje 3e-4 y 90 épocas en una H100 (unas 6,6 h compartiendo GPU con otras 8 ejecuciones); los pesos publicados corresponden a la época 21, la de menor pérdida de validación (0,1903). No se aplicó el refinamiento adversario de PiVo. El frontend de texto (`frontend.py`) convierte letras tamil en 74 fonemas, aplica alofonía de oclusivas del tamil hablado y consonantes geminadas, y procesa el inglés en alfabeto latino mediante CMUdict mapeado a fonemas tamil.

## Capacidades

- Síntesis de voz a partir de texto en escritura tamil, con salida de audio a 16 kHz.
- Lectura de palabras inglesas en alfabeto latino mediante mapeo CMUdict a fonemas tamil.
- Lectura de números y cantidades en rupias (₹) tal como se pronuncian coloquialmente.
- Dos voces seleccionables: femenina y masculina, ambas de hablantes reales de IndicTTS.
- Aplicación de alofonía de oclusivas y consonantes geminadas propias del tamil hablado.
- Ejecución en CPU sin GPU: factor de tiempo real de 0,06-0,07 en un hilo de CPU Apple Silicon.
- Distribución en safetensors y ONNX, adecuada para despliegue en dispositivos y navegador.
- Manejo de Tanglish a nivel de frontend de texto (aunque el modelo no ha oído habla Tanglish).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Lectores de pantalla en tamil: el modelo puede leer texto de aplicaciones, webs o documentos en voz alta en tiempo real gracias a su factor de tiempo real de 0,06-0,07 en CPU, sin necesidad de GPU ni de conexión a servicios externos.
- Asistentes de voz en teléfonos de gama baja: con 21,8 M de parámetros y 0,1 GB de repositorio, cabe holgadamente en memoria de dispositivos móviles y puede sintetizar respuestas de un agente conversacional local.
- Accesibilidad para personas con discapacidad visual: integración en pipelines de lectura de contenido tamil, incluyendo números y cantidades en rupias que el frontend convierte a su forma hablada.
- Audiolibros y contenido literario en tamil: el modelo está entrenado específicamente con lectura de tamil literario de IndicTTS, por lo que es adecuado para narrar textos formales con voces femenina o masculina.
- Avisos y anuncios automatizados: generación de mensajes de voz para sistemas de megafonía, transporte público o atención telefónica básica en tamil, con despliegue en CPU y latencia muy baja.
- Prototipado e investigación en TTS de bajos recursos: el código abierto y la receta reproducible (PiVo adaptado, MFA, FARGAN) permiten experimentar con nuevas voces o idiomas partiendo de un modelo de 20 M de parámetros entrenable en una sola GPU.
- Sistemas de lectura de documentos administrativos: conversión de formularios, recibos y comunicaciones oficiales con cifras monetarias a audio comprensible, aprovechando el manejo nativo de ₹ y números.

## Benchmarks y rendimiento

Evaluación sobre 125 frases reservadas de IndicTTS, sintetizadas por cada tamaño y transcritas con IndicConformer-600M, comparadas con las grabaciones originales. Son frases literarias con palabras compuestas largas, por lo que el error a nivel de palabra es alto incluso en las grabaciones; el error a nivel de carácter es la medida más estable.

| Audio | Error de carácter | Error de palabra |
|---|---|---|
| Grabaciones originales | 2,9% | 19,2% |
| Kuyil 20M (ejecución `20m-s43`) | 2,9% | 18,3% |

Los tres tamaños de la familia resultan igual de inteligibles que las grabaciones según el reconocedor. El factor de tiempo real es de 0,06-0,07 en un hilo de CPU Apple Silicon, vocoder incluido, en todos los tamaños. No se han publicado valoraciones de naturalidad por oyentes nativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo completo con vocoder ronda los 22,7 M de parámetros y el repositorio ocupa 0,1 GB.
- GPU recomendadas: no son necesarias. Para entrenamiento se usó una H100 (unas 6,6 h para 90 épocas compartiendo GPU).
- Cabe en cualquier GPU de consumo e incluso en CPU: un solo hilo de CPU Apple Silicon basta para 0,06-0,07 de factor de tiempo real.
- Opciones de despliegue: el repositorio oficial `github.com/zhagaramlabs/kuyil` con `uv` y el script `synth.py`; pesos en safetensors y ONNX para integración en otros runtimes.
- Latencia y throughput: aproximadamente 15 veces más rápido que tiempo real en un hilo de CPU Apple Silicon, con el vocoder incluido.
- Memoria: al ser un modelo de decenas de megabytes, es apto para dispositivos móviles y entornos embebidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuyil 20M | 21,8 M (22,7 M con vocoder) | Tamil, inglés (latino) | Audio 16 kHz, 200 fotogramas por token | CC BY 4.0 | HuggingFace, código en GitHub |
| Kuyil 5M | No disponible | Tamil, inglés (latino) | No disponible | CC BY 4.0 | HuggingFace |
| Kuyil 1.4M | No disponible | Tamil, inglés (latino) | No disponible | CC BY 4.0 | HuggingFace |
| PiVo-1.4M | 1,4 M | No disponible | No disponible | No disponible | HuggingFace (empero-ai) |

La comparación con modelos TTS comerciales o de mayor tamaño no está disponible en la información proporcionada. Dentro de la propia familia Kuyil, los tres tamaños comparten inteligibilidad según el reconocedor y el mismo factor de tiempo real; la diferencia principal es el número de parámetros y, presumiblemente, la calidad percibida por oyentes nativos, que aún no se ha evaluado públicamente.

## Limitaciones y advertencias

- Solo dos voces, ambas procedentes de lectura de estudio de tamil literario; el habla conversacional sonará leída.
- El frontend maneja Tanglish, pero el modelo nunca ha oído habla Tanglish, por lo que la pronunciación de ese registro puede ser deficiente.
- La naturalidad no ha sido valorada por oyentes nativos; no hay métricas subjetivas publicadas (MOS u similares).
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de entrenamiento, especialmente compuestos largos y neologismos.
- Las voces pertenecen a dos personas reales grabadas para la base de datos TTS de IIT Madras; no deben usarse para suplantar identidades y debe indicarse que el audio es sintético cuando sea relevante.
- Licencia CC BY 4.0: el uso comercial está permitido con atribución a Zhagaram Labs y a IndicTTS de IIT Madras, conservando los avisos del archivo `NOTICE`.
- El vocoder FARGAN en `pivo/` está bajo Apache 2.0 con material derivado de FARGAN; conviene revisar las condiciones concretas de esa parte.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento; su única función es la síntesis de voz.
- El límite de 200 fotogramas por token y el entrenamiento con enunciados de hasta 30 s condicionan la longitud de las entradas; textos muy largos deben segmentarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhagaramlabs/kuyil-20m
- Código: https://github.com/zhagaramlabs/kuyil
- Laboratorio: https://zhagaramlabs.com
- Modelo kuyil-1.4m: https://huggingface.co/zhagaramlabs/kuyil-1.4m
- Modelo kuyil-5m: https://huggingface.co/zhagaramlabs/kuyil-5m
- Dataset SPRINGLab/IndicTTS_Tamil: https://huggingface.co/datasets/SPRINGLab/IndicTTS_Tamil
- Receta base PiVo-1.4M: https://huggingface.co/empero-ai/PiVo-1.4M
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Muestras de audio: https://huggingface.co/zhagaramlabs/kuyil-20m/resolve/main/samples/female.wav y https://huggingface.co/zhagaramlabs/kuyil-20m/resolve/main/samples/male.wav
