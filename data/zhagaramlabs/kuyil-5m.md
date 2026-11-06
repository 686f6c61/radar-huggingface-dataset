# zhagaramlabs/kuyil-5m

## Resumen

Kuyil 5M (குயில், "cucú" en tamil) es un modelo de síntesis de voz (text-to-speech) en tamil desarrollado por Zhagaram Labs, un laboratorio sin ánimo de lucro centrado en IA para tamil. Se trata de un modelo extremadamente compacto —4.075.837 parámetros según los pesos en safetensors, 4.892.394 según la model card incluyendo el vocoder— que convierte texto tamil escrito en audio a 16 kHz. Su propuesta de valor es la eficiencia: sintetiza aproximadamente 15 veces más rápido que el tiempo real en un solo hilo de CPU, lo que lo hace apto para dispositivos móviles, lectores de pantalla y agentes de voz sin necesidad de GPU.

Arquitectura y entrenamiento siguen la receta de PiVo-1.4M, reconstruida para tamil: un codificador de texto con predictor de duración y un decodificador causal que predice 20 características FARGAN cada 10 ms, con el vocoder FARGAN de PiVo generando el audio final. El modelo se entrenó sobre IndicTTS Tamil del IIT Madras (9.437 frases, dos voces, 24,8 horas tras recorte) y se publica bajo licencia CC BY 4.0.

Es relevante ahora porque demuestra que un TTS inteligible en un idioma de bajos recursos como el tamil puede caber en menos de 5 millones de parámetros y ejecutarse en CPU, algo poco habitual en el ecosistema de síntesis de voz, dominado por modelos de cientos de millones de parámetros. La model card reporta una tasa de error de carácter del 3,0% en 125 frases no vistas, prácticamente idéntica al 2,9% de las grabaciones originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal: codificador de texto + predictor de duración + decodificador causal (predice 20 características FARGAN cada 10 ms) + vocoder FARGAN |
| Parametros totales | 4.075.837 (safetensors); 4.892.394 incluyendo vocoder según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_token_frames: 200; ventana: 64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tamil (ta), inglés en escritura latina (en) |
| Licencia | CC BY 4.0 (pesos); vocoder PiVo FARGAN bajo Apache 2.0 con material derivado de FARGAN bajo licencia Xiph/Opus |
| Formato de pesos | safetensors, ONNX |
| Frecuencia de muestreo de salida | 16 kHz |
| Voces | 2 (femenina y masculina) |
| Configuración interna | vocab 128, width 192, ff_width 512, 4 cabezas, 2 KV heads, 8 capas de texto, 4 capas de decodificador, kernel 5, duration_width 128, feature_dim 20, dropout 0.1 |
| Dataset de entrenamiento | SPRINGLab/IndicTTS_Tamil (IndicTTS Tamil, IIT Madras) |
| Factor de tiempo real | 0,06–0,07 en un hilo de CPU Apple Silicon (vocoder incluido) |

## Arquitectura y entrenamiento

El modelo sigue la receta de PiVo-1.4M adaptada al tamil. Consta de un frontend de texto (`frontend.py` en el repositorio de código) que convierte letras tamil en 74 fonemas, aplicando alofonía de oclusivas del tamil hablado y consonantes geminadas; el inglés en escritura latina pasa por CMUdict mapeado a fonemas tamil, y los números se leen como los pronuncia la gente. Después, un codificador de texto y un predictor de duración alimentan un decodificador causal que predice 20 características FARGAN cada 10 ms. El vocoder FARGAN de PiVo (incluido en `pivo/`) convierte esas características en audio.

El entrenamiento usó IndicTTS Tamil del IIT Madras a través del espejo SPRINGLab/IndicTTS_Tamil: 9.437 frases de una hablante femenina y un hablante masculino, de las que quedaron 24,8 horas tras recorte de bordes; se usaron 9.022 enunciados de hasta 30 s. La alineación fonética se obtuvo con Montreal Forced Aligner 3.4.3 entrenado sobre un conjunto propio de fonemas tamil. La función de pérdida combinó smooth-L1 sobre características normalizadas y 0,1 × error cuadrático sobre logaritmos de duración, con batch 8, tasa de aprendizaje 3e-4 y 90 épocas en una H100 (unas 5,0 horas compartiendo GPU con otras 8 ejecuciones). Los pesos publicados corresponden a la época 43, la de menor pérdida de validación (0,1912). No se realizó el refinamiento adversarial de PiVo.

## Capacidades

- Síntesis de voz a partir de texto tamil escrito, con salida de audio a 16 kHz como array de NumPy.
- Dos voces: femenina y masculina, ambas procedentes de hablantes reales del corpus IndicTTS del IIT Madras.
- Lectura de palabras inglesas en escritura latina mediante CMUdict mapeado a fonemas tamil.
- Lectura de números y cantidades en rupias (₹) tal como se pronuncian coloquialmente.
- Manejo de tanglish a nivel de frontend de texto (aunque el modelo no ha oído habla tanglish).
- Inferencia en CPU a un factor de tiempo real de 0,06–0,07 por hilo (unas 15 veces más rápido que tiempo real).
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectores de pantalla en tamil: el modelo puede convertir texto de aplicaciones y webs en voz sintética en tiempo real en un solo hilo de CPU, sin GPU, lo que lo hace viable en móviles de gama baja y en entornos de accesibilidad.
- Asistentes de voz y agentes conversacionales en tamil: al sintetizar 15 veces más rápido que tiempo real, permite respuestas habladas con baja latencia en pipelines de atención al cliente o asistentes domésticos que operen en CPU.
- Audiolibros y lectura de contenido literario: dado que se entrenó con lectura literaria de IndicTTS, es adecuado para narrar textos formales, noticias o documentos con estilo de lectura pausada.
- Anuncios y avisos automatizados en transporte o servicios públicos: la síntesis rápida y ligera permite generar avisos en tamil bajo demanda en sistemas embebidos o servidores modestos.
- Localización de contenido para aplicaciones dirigidas al mercado tamil: conversión de artículos, menús o instrucciones a audio con dos voces disponibles, con licencia CC BY 4.0 que facilita su integración en productos.
- Pruebas y prototipado de interfaces de voz: su tamaño reducido (menos de 5 M de parámetros) y su despliegue sencillo mediante el repositorio `kuyil` permiten iterar rápidamente en el diseño de experiencias de voz en tamil.
- Investigación en TTS de bajos recursos: sirve como línea base reproducible para experimentos con arquitecturas PiVo/FARGAN en lenguas con pocos datos, dado que el código y los pesos son abiertos.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 125 frases de IndicTTS no vistas, sintetizadas por cada tamaño y transcritas con IndicConformer-600M, comparadas con las grabaciones originales. Son frases literarias con palabras compuestas largas, por lo que el error a nivel de palabra es alto incluso en las grabaciones; el error de carácter es la medida más estable.

| Audio | Error de carácter | Error de palabra |
|---|---|---|
| Grabaciones originales | 2,9% | 19,2% |
| Kuyil 5M (ejecución `5m-s42`) | 3,0% | 18,4% |

Según la model card, los tres tamaños (1.4M, 5M y 20M) son igual de inteligibles que las grabaciones, por lo que un reconocedor automático no puede distinguirlos; los oyentes nativos sí. La síntesis se ejecuta con un factor de tiempo real de 0,06–0,07 en un hilo de CPU Apple Silicon, vocoder incluido, en todos los tamaños. No se han publicado otros benchmarks (naturalidad MOS, comparativas con otros TTS) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base; el modelo está diseñado para CPU. Con menos de 5 M de parámetros, los pesos ocupan del orden de decenas de MB en precisión completa, aunque la model card no detalla el tamaño exacto de los ficheros.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una H100, pero la inferencia está pensada para CPU.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura; cualquier GPU de consumo moderna puede ejecutarlo, aunque no es el escenario objetivo.
- Opciones de despliegue: repositorio oficial `github.com/zhagaramlabs/kuyil` con `uv sync` y el script `synth.py`; API Python `synth.load("kuyil-5m")` y `speak(text, "female")`. Pesos en safetensors y ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,06–0,07 en un hilo de CPU Apple Silicon, vocoder incluido, lo que equivale a unas 15 veces más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuyil 5M | 4,08 M (safetensors); 4,89 M con vocoder | ta, en (latino) | TTS tamil, CPU-first, RTF 0,06–0,07 | CC BY 4.0 | Hugging Face y GitHub |
| Kuyil 1.4M | no disponible en la información | ta, en | Misma familia, menor tamaño | CC BY 4.0 | Hugging Face |
| Kuyil 20M | no disponible en la información | ta, en | Misma familia, mayor tamaño | CC BY 4.0 | Hugging Face |
| PiVo-1.4M | 1,4 M (según nombre) | no disponible | Receta original en la que se basa Kuyil; vocoder FARGAN | Apache 2.0 (vocoder) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS tamil en la información proporcionada.

## Limitaciones y advertencias

- Solo dos voces, ambas de lectura de estudio de tamil literario; el habla conversacional sonará leída.
- El tanglish se maneja en el frontend de texto, pero el modelo nunca ha oído habla tanglish, por lo que la pronunciación puede ser incorrecta.
- La naturalidad no ha sido evaluada por oyentes nativos (no hay MOS publicado).
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones erróneas en palabras fuera del dominio de entrenamiento, especialmente compuestos largos o neologismos.
- Las voces corresponden a dos personas reales grabadas para la base de datos TTS del IIT Madras; no deben usarse para suplantar identidades y debe indicarse que el audio es sintético cuando sea relevante.
- Licencia CC BY 4.0: permite uso comercial con atribución a Zhagaram Labs y a IndicTTS del IIT Madras, conservando los avisos de `NOTICE`. El vocoder en `pivo/` es Apache 2.0 con material derivado de FARGAN bajo licencia Xiph/Opus, cuyos términos deben respetarse.
- No se realizó el refinamiento adversarial de PiVo, lo que puede afectar a la naturalidad frente a la receta original.
- No hay información sobre cuantizaciones ni sobre sesgos demográficos o de género más allá de las dos voces disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhagaramlabs/kuyil-5m
- Repositorio de código: https://github.com/zhagaramlabs/kuyil
- Web de Zhagaram Labs: https://zhagaramlabs.com
- Modelo kuyil-1.4m: https://huggingface.co/zhagaramlabs/kuyil-1.4m
- Modelo kuyil-20m: https://huggingface.co/zhagaramlabs/kuyil-20m
- Dataset SPRINGLab/IndicTTS_Tamil: https://huggingface.co/datasets/SPRINGLab/IndicTTS_Tamil
- Modelo PiVo-1.4M (receta base): https://huggingface.co/empero-ai/PiVo-1.4M
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Muestras de audio: https://huggingface.co/zhagaramlabs/kuyil-5m/resolve/main/samples/female.wav y https://huggingface.co/zhagaramlabs/kuyil-5m/resolve/main/samples/male.wav
