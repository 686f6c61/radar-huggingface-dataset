# zhagaramlabs/kuyil-1.4m

## Resumen

Kuyil 1.4M (குயில், "cuco" en tamil) es un modelo de síntesis de voz (text-to-speech) para tamil desarrollado por Zhagaram Labs, un laboratorio sin ánimo de lucro centrado en IA para lenguas tamil. El modelo convierte texto en tamil escrito en tamil, palabras en inglés con alfabeto latino, y números y cantidades en rupias tal como se pronuncian oralmente. Su propuesta principal es el tamaño: 1.401.562 parámetros en total, vocoder incluido, lo que lo sitúa en la categoría de modelos ultraligeros aptos para dispositivos con recursos muy limitados.

La arquitectura sigue la receta de PiVo-1.4M, reconstruida para el tamil: un codificador de texto y un predictor de duración seguidos de un decodificador causal que predice 20 características FARGAN cada 10 ms, con el vocoder FARGAN de PiVo generando el audio final. El modelo se entrenó sobre el corpus IndicTTS Tamil del IIT Madras (9.437 frases, 24,8 horas tras recorte, dos voces: una femenina y una masculina).

Su relevancia actual radica en dos factores: la velocidad (factor de tiempo real de 0,06-0,07 en un solo hilo de CPU Apple Silicon, vocoder incluido, es decir, unas 15 veces más rápido que el tiempo real) y una inteligibilidad medida a la par de las grabaciones originales (3,0% de error de carácter frente al 2,9% de las grabaciones, según transcripción con IndicConformer-600M). Está pensado para móviles, lectores de pantalla y agentes de voz en tamil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto + predictor de duración + decodificador causal con predicción de características FARGAN; vocoder FARGAN (PiVo) |
| Parametros totales | 1.401.562 (incluye vocoder); 585.005 en el checkpoint safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_token_frames: 200 en la configuración) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | Tamil (ta), inglés (en, palabras en alfabeto latino); tanglish a nivel de frontend de texto |
| Licencia | CC BY 4.0 (pesos); vocoder FARGAN en `pivo/` bajo Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

Configuración declarada por el autor: vocab 128, 2 voces, width 96, ff_width 192, 4 cabezas de atención, 2 cabezas KV, 6 capas de texto, 2 capas de decodificador, kernel 5, duration_width 64, feature_dim 20, window 64, dropout 0.1, max_token_frames 200.

## Arquitectura y entrenamiento

El modelo es un sistema TTS en dos etapas. La primera etapa es un frontend de texto (`frontend.py` en el repositorio de código) que convierte letras tamil en 74 fonemas, aplicando la alofonía de las oclusivas del tamil hablado y la geminación de consonantes; las palabras inglesas en alfabeto latino pasan por CMUdict mapeado a fonemas tamil, y los números se leen como se pronuncian. La segunda etapa es la red neuronal: un codificador de texto y un predictor de duración, seguidos de un decodificador causal que genera 20 características FARGAN cada 10 ms. El vocoder FARGAN de PiVo-1.4M (incluido en `pivo/`) transforma esas características en audio a 16 kHz.

El entrenamiento usó IndicTTS Tamil del IIT Madras, a través del espejo SPRINGLab/IndicTTS_Tamil: 9.437 frases de una hablante femenina y un hablante masculino, 24,8 horas tras recorte de bordes, con 9.022 enunciados de hasta 30 segundos. Los tiempos de fonemas se obtuvieron con Montreal Forced Aligner 3.4.3 entrenado sobre un conjunto propio de fonemas tamil. La función de pérdida combina smooth-L1 sobre características normalizadas más 0,1 × error cuadrático sobre el logaritmo de las duraciones. Se entrenó con batch 8 y tasa de aprendizaje 3e-4 durante 90 épocas en una H100 (unas 4,1 horas compartiendo GPU con otras 8 ejecuciones); los pesos publicados corresponden a la época 68, la de menor pérdida de validación (0,2021). No se realizó el refinamiento adversarial de PiVo.

## Capacidades

- Síntesis de voz en tamil a partir de texto en escritura tamil, con dos voces (femenina y masculina) procedentes de hablantes reales de IndicTTS.
- Lectura de palabras inglesas en alfabeto latino mediante mapeo CMUdict a fonemas tamil.
- Normalización de números y cantidades en rupias (₹) según la pronunciación oral habitual.
- Aplicación de alofonía de oclusivas y consonantes geminadas del tamil hablado en el frontend de texto.
- Salida de audio a 16 kHz como array NumPy desde Python.
- Inferencia ultraligera: factor de tiempo real de 0,06-0,07 en un hilo de CPU Apple Silicon, vocoder incluido.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectores de pantalla en tamil: el modelo cabe en el presupuesto de cómputo de un móvil o un dispositivo embebido y sintetiza a 0,06-0,07 de tiempo real en un solo hilo de CPU, por lo que puede leer texto de interfaz sin bloquear la aplicación.
- Agentes de voz y asistentes telefónicos en tamil: la latencia baja permite generar respuestas habladas en tiempo casi interactivo dentro de un bucle de diálogo, aunque el tono será de lectura literaria.
- Accesibilidad en aplicaciones educativas: conversión de material de lectura tamil (incluidos números y cantidades) a audio para alumnado con dificultades visuales o de lectura.
- Anuncios y avisos automatizados: generación de mensajes hablados con cifras y precios en rupias, gracias a la normalización de números y ₹ integrada en el frontend.
- Síntesis en el dispositivo sin conexión: al no requerir GPU ni servicios en la nube, encaja en aplicaciones de campo o entornos con conectividad limitada donde se necesite voz tamil.
- Prototipado e investigación en TTS de bajos recursos: el código y la receta son reproducibles (entrenamiento en una H100 en unas 4 horas), lo que sirve de base para experimentar con otras lenguas o voces.
- Integración en pipelines de doblaje o audiolibros de texto literario tamil: es el dominio en el que fue entrenado (lectura de estudio de tamil literario), por lo que es el escenario donde su naturalidad resulta más fiable.

## Benchmarks y rendimiento

Evaluación sobre 125 frases reservadas de IndicTTS, transcritas con IndicConformer-600M y comparadas con las grabaciones originales:

| Audio | Error de carácter | Error de palabra |
|---|---|---|
| Grabaciones originales | 2,9% | 19,2% |
| Kuyil 1.4M (ejecución `1.4m-s44`) | 3,0% | 17,6% |

El autor indica que los tres tamaños de la familia (1.4M, 5M, 20M) son igual de inteligibles según el reconocedor, por lo que la elección entre ellos corresponde a oyentes nativos. No se han publicado resultados de benchmarks adicionales (MOS, naturalidad subjetiva) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo completo (red y vocoder) ocupa 1,4 M de parámetros y el repositorio pesa 0,0 GB.
- GPU recomendadas: no necesita GPU; el autor reporta ejecución en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 4090) ejecutaría la inferencia con enorme margen, aunque no se aportan cifras de latencia en GPU.
- Cabe en cualquier GPU consumer y en CPU de móvil o embebida; el punto de referencia publicado es un hilo de CPU Apple Silicon.
- Opciones de despliegue: el repositorio oficial (`github.com/zhagaramlabs/kuyil`) con `uv sync` y `synth.py`; los pesos se distribuyen también en ONNX, lo que permite inferencia con ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,06-0,07 (unas 15 veces más rápido que el tiempo real) en un hilo de CPU Apple Silicon, vocoder incluido, para todos los tamaños de la familia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / longitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kuyil 1.4M | 1,4 M (con vocoder) | ta, en (palabras) | max_token_frames 200 | CC BY 4.0 (vocoder Apache 2.0) | Hugging Face, ONNX, safetensors |
| Kuyil 5M | No disponible en la información | ta, en | No disponible | No disponible | Hugging Face |
| Kuyil 20M | No disponible en la información | ta, en | No disponible | No disponible | Hugging Face |
| PiVo-1.4M | 1,4 M | No disponible | No disponible | Apache 2.0 (vocoder) | Hugging Face (empero-ai) |

No se dispone de datos de rendimiento comparativo entre Kuyil y PiVo más allá de que la arquitectura de Kuyil deriva de la de PiVo; el autor no publica una comparación directa de métricas entre ambos.

## Limitaciones y advertencias

- Solo dos voces, ambas de lectura de estudio de tamil literario; el habla conversacional sonará leída.
- El frontend procesa tanglish, pero el modelo nunca ha oído habla tanglish, por lo que la pronunciación en ese registro no está validada.
- La naturalidad no ha sido evaluada por oyentes nativos; no hay puntuaciones MOS publicadas.
- Las métricas de inteligibilidad se basan en un reconocedor automático (IndicConformer-600M) sobre 125 frases, no en evaluación humana.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del vocabulario cubierto por el frontend (tamil y CMUdict inglés); no se documenta el comportamiento ante texto mixto complejo.
- Sesgos: las voces pertenecen a dos personas reales del corpus IndicTTS; no se documenta diversidad de acentos, edad o género más allá de las dos voces.
- Licencia CC BY 4.0 en los pesos: permite uso comercial con atribución a Zhagaram Labs y a IndicTTS del IIT Madras, y obliga a conservar los avisos de `NOTICE`. Los archivos del vocoder en `pivo/` son Apache 2.0 con material derivado de FARGAN.
- Advertencia ética explícita del autor: no usar las voces para suplantar a personas y declarar que el audio es sintético cuando corresponda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni informes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhagaramlabs/kuyil-1.4m
- Código: https://github.com/zhagaramlabs/kuyil
- Laboratorio: https://zhagaramlabs.com
- Variante 5M: https://huggingface.co/zhagaramlabs/kuyil-5m
- Variante 20M: https://huggingface.co/zhagaramlabs/kuyil-20m
- Modelo base de la receta: https://huggingface.co/empero-ai/PiVo-1.4M
- Dataset de entrenamiento (espejo): https://huggingface.co/datasets/SPRINGLab/IndicTTS_Tamil
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Muestras de audio: https://huggingface.co/zhagaramlabs/kuyil-1.4m/resolve/main/samples/female.wav y https://huggingface.co/zhagaramlabs/kuyil-1.4m/resolve/main/samples/male.wav
