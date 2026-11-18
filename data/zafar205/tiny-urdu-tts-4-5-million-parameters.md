# zafar205/tiny-urdu-tts-4.5-million-parameters

## Resumen

tiny-urdu-tts es un modelo de síntesis de voz (text-to-speech) para urdu escrito en alfabeto latino (roman urdu), desarrollado por el usuario zafar205 y publicado en Hugging Face. Se trata de un ajuste fino completo del modelo inglés tiny-voca de n4ze3m, con solo 4,5 millones de parámetros y un peso de 21 MB en formato ONNX. Su propuesta es radicalmente distinta a la de los TTS neuronales de gran escala: busca funcionar en CPU, en el navegador mediante onnxruntime-web y en dispositivos sin GPU, sin clave de API ni servidor.

El modelo resuelve un nicho concreto: la síntesis de voz en urdu para aplicaciones ligeras, especialmente en el contexto de Pakistán, donde el roman urdu es la forma habitual de escribir en entornos digitales. La entrada es texto en roman urdu que un fonemizador basado en reglas convierte en fonemas; la salida es audio mono a 24 kHz. Incluye dos voces, M2 (entrenada en urdu, recomendada) y F2 (no entrenada en urdu).

Es relevante ahora por su extrema ligereza y su licencia Apache-2.0, que permite uso comercial, y porque demuestra que es posible obtener un TTS funcional para un idioma de bajos recursos con un ajuste fino sobre un modelo base mínimo y un conjunto de datos pequeño (1.000 clips de un solo hablante). No obstante, su calidad es limitada y su ámbito de aplicación, acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tiny-voca; exportado a ONNX) |
| Parámetros totales | 4,5 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por fonemas) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ur (roman urdu; no soporta escritura urdu) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) y checkpoint PyTorch (`inference.pt`) |

## Arquitectura y entrenamiento

El modelo parte de tiny-voca, un TTS inglés de n4ze3m con 4,5 millones de parámetros, y se somete a un ajuste fino completo (los 4,5 millones de parámetros) sobre 1.000 clips del dataset UrduTTS de kaab4321, en una GPU T4 gratuita de Kaggle. La información disponible no detalla la arquitectura interna de tiny-voca (si es un transformer, un modelo acústico con vocoder integrado u otra variante); solo se indica que la entrada son identificadores de fonemas y la salida audio a 24 kHz.

La cadena de inferencia incluye un fonemizador basado en reglas que convierte el roman urdu en fonemas. Las entradas ONNX son `tokens` y `stress` (int64 `[1, N]`), `voice` (int64 `[1]`), y `speed`, `pitch_shift` y `pitch_range` (float32 `[1]`); la salida es `audio` (float32 `[1, samples]`). Para el alineamiento se empleó facebook/wav2vec2-lv-60-espeak-cv-ft. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Síntesis de voz a partir de texto en roman urdu, con salida de audio mono a 24 kHz.
- Conversión de texto a fonemas mediante un fonemizador basado en reglas incluido en el repositorio de GitHub.
- Dos voces seleccionables: M2 (entrenada en urdu, recomendada) y F2 (no entrenada en urdu).
- Control de velocidad, desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`) mediante parámetros de entrada.
- Inferencia en navegador con onnxruntime-web y en CPU con onnxruntime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo de razonamiento.
- No soporta escritura urdu (اردو); solo roman urdu.

## Casos de uso

- Lectura de texto en aplicaciones web para usuarios paquistaníes: el modelo puede integrarse en una página con onnxruntime-web para leer en voz alta frases escritas en roman urdu, sin backend ni coste de API, gracias a sus 21 MB y a la inferencia en navegador.
- Asistentes de voz en dispositivos de bajos recursos: al ejecutarse en CPU, puede desplegarse en Raspberry Pi, móviles de gama baja o sistemas empotrados para dar respuestas habladas en urdu en aplicaciones de información o accesibilidad.
- Prototipado rápido de interfaces de voz: un desarrollador puede validar flujos de conversación en roman urdu con un modelo ligero antes de invertir en un TTS de mayor calidad.
- Aplicaciones educativas de aprendizaje de urdu: el modelo puede pronunciar palabras y frases escritas en roman urdu para prácticas de vocabulario, con la salvedad de que la pronunciación puede presentar errores.
- Sistemas de anuncios o notificaciones locales: lectura automática de mensajes breves (recordatorios, avisos) en roman urdu en aplicaciones de mensajería o domótica.
- Investigación en TTS para idiomas de bajos recursos: sirve como referencia reproducible de ajuste fino de un modelo base mínimo con un dataset pequeño (1.000 clips), útil para experimentos de transferencia lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo pesa 21 MB y está pensado para CPU.
- GPU recomendadas: no aplica; el entrenamiento se realizó en una T4 de Kaggle, pero la inferencia está orientada a CPU y navegador.
- Cabe en cualquier GPU de consumo y en CPU; también en navegador mediante onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python/CPU), onnxruntime-web (JavaScript/navegador) y el script `urdu/run.py` del repositorio para inferencia con `inference.pt` en PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-urdu-tts | 4,5 M | Roman urdu | no aplica | Apache-2.0 | ONNX, PyTorch | Hugging Face |
| tiny-voca (base) | 4,5 M | Inglés | no aplica | Apache-2.0 | no disponible | GitHub / Hugging Face |
| TTS multilingües de gran escala (p. ej. XTTS, Bark) | cientos de millones a miles de millones | Multilingüe | no aplica | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Entrenado con solo unos 1.000 clips de un único hablante: se esperan errores de pronunciación y un tono robótico.
- La ortografía del roman urdu es variable, por lo que algunas palabras pueden leerse de forma incorrecta.
- No soporta entrada en escritura urdu (اردو); solo roman urdu.
- La voz F2 no fue entrenada en urdu, por lo que su uso en este idioma no está recomendado.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede producir pronunciaciones inventadas o ininteligibles en textos fuera de dominio.
- No se documentan sesgos específicos, pero al provenir de un único hablante y un dataset pequeño, la variedad de acentos y registros es muy limitada.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar las licencias del modelo base tiny-voca y del dataset UrduTTS antes de un despliegue en producción.
- Calidad insuficiente para aplicaciones de accesibilidad críticas o locución profesional; adecuado para prototipos y usos ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zafar205/tiny-urdu-tts-4.5-million-parameters
- Demo: https://web-hazel-seven-89.vercel.app/
- Código: https://github.com/Zafar205/tiny-urdu
- Modelo base tiny-voca: https://github.com/n4ze3m/tiny-voca
- Dataset UrduTTS: https://huggingface.co/datasets/kaab4321/UrduTTS
- Modelo de alineamiento: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
