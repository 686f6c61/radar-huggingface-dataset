# TechnoBaptist/Paradee-8M-v1.0

## Resumen

Paradee-8M v1.0 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Sahil Mahendrakar (TechnoBaptist) y publicado bajo licencia Apache 2.0. Se trata de un modelo destilado a partir de Kokoro-82M que reduce el tamaño de 81,8 M a 8,07 M de parámetros y se limita a una única voz, la `af_heart` del profesor. El objetivo es ofrecer una calidad de voz casi idéntica a la del modelo original con un coste computacional mínimo.

La arquitectura reutiliza el código de Kokoro a anchuras menores, dividido en dos mitades independientes: un text side de 4,23 M de parámetros y un decoder de 3,85 M. El artefacto distribuido es un grafo ONNX que transforma identificadores de fonemas en una onda de audio a 24 kHz, con una entrada adicional de control de velocidad.

Su relevancia actual radica en el binomio tamaño/velocidad: el fichero int8 ocupa 9 MB (frente a los 325 MB de Kokoro), corre aproximadamente 18 veces más rápido que el tiempo real en un solo hilo de CPU y sin GPU, y conserva la misma tasa de error de palabra que su profesor (5,7 %) con una puntuación UTMOS de 4,41 frente a 4,52. Todo el entrenamiento se realizó en un único MacBook Pro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Arquitectura de Kokoro-82M a anchuras reducidas; dos mitades (text side de 4,23 M y decoder de 3,85 M) exportadas como un único grafo ONNX de fonemas a onda |
| Parámetros totales | 8,07 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a un modelo de TTS; la entrada admite hasta 512 identificadores de fonemas (con token de padding `0` en cada extremo) |
| Tipos de cuantización | int8 (`onnx/paradee_int8.onnx`, 9,0 MB) y fp32 (`onnx/paradee.onnx`, 37 MB) |
| Idiomas soportados | en (inglés, con pronunciación americana) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (int8 y fp32) y PyTorch (`pytorch/text_side.pt`, `pytorch/decoder.pt`) |

## Arquitectura y entrenamiento

Paradee no es un transformer de lenguaje, sino un sistema de síntesis acústica derivado de Kokoro-82M. Conserva el diseño del profesor pero con anchuras menores, y se separa en dos componentes que se entrenan de forma independiente contra el profesor congelado: el text side, que aprende a predecir duraciones de fonema, tono, sonoridad y características fonéticas del profesor, y el decoder, que convierte esos valores en audio. La conexión entre ambas mitades se realiza sin entrenamiento adicional.

El entrenamiento se llevó a cabo sobre 12.000 frases de WikiText-103 (23,9 horas de audio) leídas por Kokoro. El decoder se optimiza primero con pérdidas de espectrograma y después con entrenamiento adversarial. Como corrección final, se incorpora un filtro sin parámetros que ajusta la fase del sonido sonoro entre 2 y 8 kHz, eliminando el zumbido que deja el decoder pequeño. El grafo ONNX distribuye estas dos fases y el filtro de phase-locking en un solo modelo. La destilación no incluye RLHF ni DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con un único timbre (`af_heart`).
- Conversión de texto a fonemas según la convención de misaki, la librería de grafema-a-fonema de Kokoro.
- Control de velocidad de habla mediante la entrada `speed` (float32), donde 1,0 equivale a velocidad normal.
- Salida de audio a 24 kHz en formato de onda float32.
- Inferencia en CPU sin GPU, con soporte de onnxruntime y de entornos web mediante transformers.js y kokoro-js.
- Empaquetado como paquete Python (`paradee`) con interfaz de línea de comandos y API programática.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo cabe en 9 MB y funciona en CPU, por lo que puede integrarse en lectores de pantalla sin depender de servicios en la nube.
- Asistentes de voz embebidos en dispositivos con recursos limitados: al ejecutarse unas 18 veces más rápido que el tiempo real en un solo hilo de CPU, permite respuestas habladas en tiempo real en hardware sin GPU.
- Síntesis de voz en el navegador: gracias a la exportación ONNX y a la compatibilidad con kokoro-js, puede generar audio en el cliente sin enviar texto a un servidor.
- Generación de audiolibros o pódcasts automatizados con una voz consistente, dado que el modelo produce siempre el mismo timbre.
- Pruebas automatizadas y prototipado de pipelines de voz: su tamaño reducido y su licencia Apache 2.0 permiten incluirlo en contenedores ligeros y en flujos de CI sin coste de licencia.
- Sistemas de aviso y notificación por voz en aplicaciones de IoT o robótica, donde el consumo de memoria y la latencia en CPU son factores críticos.
- Doblaje o locución de contenidos en inglés con pronunciación americana, siempre que el texto se fonemice previamente con misaki.

## Benchmarks y rendimiento

Resultados sobre 200 frases reservadas. La velocidad se mide en un hilo de CPU de un Apple M4 Pro. UTMOS es una red neuronal que predice la naturalidad de un audio en una escala de 1 a 5; WER es la proporción de palabras que Whisper (base) transcribe incorrectamente.

| Modelo (voz) | Parámetros | Tamaño de fichero | Velocidad | UTMOS | WER |
|---|---:|---:|---:|---:|---:|
| Kokoro-82M, profesor (af_heart) | 81,8 M | 325 MB | 7,6x | 4,52 | 5,7 % |
| Paradee (af_heart) | 8,07 M | 8,45 MB | 25,0x | 4,41 | 5,7 % |
| Kokoro-7M-Distill (af_msa) | 7,48 M | 30,1 MB | 35,5x | 4,18 | 7,4 % |
| Piper, en_US-lessac-medium | 15,7 M | 63,2 MB | 15,4x | 4,36 | 8,8 % |
| KittenTTS nano 0.8 (Bella) | 14,0 M | 56,8 MB | 10,7x | 4,01 | 5,5 % |

La tabla procede del artículo y mide PyTorch. El fichero publicado `paradee_int8.onnx` obtiene UTMOS 4,41 sobre las mismas frases y corre aproximadamente 18 veces más rápido que el tiempo real en onnxruntime con un solo hilo. El autor indica que la versión int8 y la fp32 suenan igual.

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos ocupan 9,0 MB en int8 y 37 MB en fp32, por lo que el consumo de memoria es mínimo y cabe en cualquier sistema con unos pocos cientos de MB libres.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU compatible con onnxruntime puede ejecutarlo, pero no es necesario.
- GPU de consumo: irrelevante para este modelo. Funciona en CPU de portátil y en dispositivos de gama baja, incluidos entornos de navegador.
- Opciones de despliegue: onnxruntime (Python y otros lenguajes), transformers.js y kokoro-js en el navegador, y el paquete Python `paradee` instalable desde GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 25,0x tiempo real en PyTorch y aproximadamente 18x en onnxruntime int8, medidos sobre un hilo de CPU de un Apple M4 Pro. No se publican datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Velocidad (1 hilo CPU) | UTMOS | WER | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Paradee-8M v1.0 | 8,07 M | 8,45 MB (int8: 9 MB) | 25,0x (18x en onnxruntime int8) | 4,41 | 5,7 % | Apache 2.0 |
| Kokoro-82M | 81,8 M | 325 MB | 7,6x | 4,52 | 5,7 % | Apache 2.0 |
| Kokoro-7M-Distill | 7,48 M | 30,1 MB | 35,5x | 4,18 | 7,4 % | no disponible |
| Piper en_US-lessac-medium | 15,7 M | 63,2 MB | 15,4x | 4,36 | 8,8 % | no disponible |
| KittenTTS nano 0.8 | 14,0 M | 56,8 MB | 10,7x | 4,01 | 5,5 % | no disponible |

Paradee se sitúa como la alternativa más pequeña en disco del grupo y la segunda más rápida, con un UTMOS cercano al de su profesor y la mejor tasa de error de palabra junto con Kokoro-82M. Kokoro-7M-Distill es más rápido pero con peor UTMOS y WER.

## Limitaciones y advertencias

- Solo admite inglés con pronunciación americana y una única voz (`af_heart`); no hay soporte multilingüe ni cambio de locutor.
- La entrada debe estar fonemizada según la convención de misaki. Si se usa directamente la fonemización de eSpeak NG, como ocurre por defecto en kokoro-js, Whisper mide aproximadamente un 31 % de palabras mal reconocidas; con la conversión de `web/misaki.js` la cifra baja al 2 %.
- Los números, abreviaturas y palabras poco frecuentes se pronuncian únicamente tan bien como los resuelva misaki.
- Persiste un zumbido leve en algunos sonidos sonoros, aunque mucho menor que sin el filtro de corrección de fase.
- Alucinación en el sentido de modelos de lenguaje: no aplica, por tratarse de un sistema de TTS. El riesgo equivalente es una pronunciación incorrecta o una prosodia defectuosa en textos fuera de distribución.
- Sesgos conocidos: no se documentan sesgos específicos más allá de la limitación a una voz concreta derivada de Kokoro y de un corpus de entrenamiento reducido (12.000 frases de WikiText-103), lo que puede reducir la variedad prosódica.
- Licencia Apache 2.0, la misma que Kokoro-82M, por lo que se permite uso comercial sin restricciones adicionales.
- Para producción: no se han publicado métricas de latencia ni de calidad en plataformas distintas del Apple M4 Pro, ni pruebas de robustez con textos largos o dominios muy especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/Paradee-8M-v1.0
- Artículo (paper): https://huggingface.co/papers/2610.06817
- Repositorio de código, entrenamiento y paquete Python: https://github.com/sahilmahendrakar/paradee
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Librería de fonemización misaki: https://github.com/hexgrad/misaki
- Convertidor de fonemas de eSpeak NG a misaki para navegador: https://github.com/sahilmahendrakar/paradee/blob/main/web/misaki.js
- Frases de muestra empleadas: `samples/sentences.txt` dentro del repositorio del modelo
