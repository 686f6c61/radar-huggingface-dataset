# xsingh/voce-small

## Resumen

voce-small es un modelo de síntesis de voz (text-to-speech) en inglés publicado en Hugging Face por el usuario xsingh bajo licencia Apache-2.0. Se trata de un modelo de muy reducido tamaño, con aproximadamente 4,5 millones de parámetros en total, incluyendo el generador de forma de onda, y está diseñado para ejecutarse en entornos con recursos muy limitados, como navegadores o teléfonos. El repositorio ocupa 0,1 GB e incluye pesos en PyTorch (float32) y una exportación a ONNX (opset 17).

El modelo deriva del proyecto tiny-voca, un TTS entrenado desde cero sobre aproximadamente 18 horas de voz sintética y con dos voces en inglés americano: F2 (femenina) y M2 (masculina). La entrada de texto se convierte a fonemas mediante la librería dizione, y la salida es audio mono a 24 kHz. Su relevancia actual radica en que demuestra que es posible obtener síntesis de voz inteligible con un coste computacional mínimo, lo que lo hace apto para despliegues en el borde (edge) y aplicaciones web sin GPU.

No obstante, conviene señalar que el modelo no incorpora capacidades de razonamiento, generación de texto, código ni visión: es exclusivamente un sintetizador de voz. La información disponible sobre su entrenamiento y evaluación es muy limitada, y no se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS con generador de forma de onda; detalles no especificados) |
| Parámetros totales | 4.537.291 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; límite de 512 tokens de fonemas y 32 segundos por utterance |
| Tipos de cuantización | No disponible (pesos en float32; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (.onnx, float32, opset 17) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de síntesis de voz con un generador de forma de onda incluido, de 4,5 millones de parámetros, entrenado desde cero sobre aproximadamente 18 horas de voz sintética. No se especifica si emplea un transformer, un modelo acústico basado en difusión, un vocoder neuronal de tipo WaveNet o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que proviene de n4ze3m/tiny-voca) ni si se aplicaron técnicas de RLHF o DPO, que en un modelo TTS no resultan habituales.

Como innovación destacable, el modelo incorpora un fonemizador propio (dizione) que convierte el texto en fonemas con marcas de acentuación (stress: 0 ninguno, 1 primario, 2 secundario) antes de la inferencia. La exportación a ONNX permite ejecución en onnxruntime-web (WebAssembly), con una diferencia de audio respecto a PyTorch inferior al 0,6 % de la amplitud de pico, lo que facilita el despliegue en navegador. El modelo procesa una utterance por llamada, con un máximo de 512 tokens y 32 segundos, y el pipeline de inferencia divide el texto en frases y une el audio resultante.

## Capacidades

- Síntesis de voz en inglés americano con dos voces predefinidas: F2 (femenina) y M2 (masculina).
- Conversión de texto a fonemas mediante dizione, con soporte de marcas de acentuación.
- Control de velocidad del habla (parámetro `speed`), desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`).
- Generación de audio mono a 24 kHz con normalización de pico (el audio puede superar 1.0 y debe escalarse antes de guardar en 16 bits).
- Procesamiento de texto de cualquier longitud mediante división en frases y concatenación de audio.
- Ejecución en CPU: aproximadamente 70 veces más rápido que tiempo real con cuatro hilos.
- Exportación ONNX compatible con onnxruntime-web (WebAssembly) para ejecución en navegador.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés; las frases en otros sistemas de escritura se omiten.

## Casos de uso

- **Lectura de notificaciones y alertas en aplicaciones móviles**: el modelo cabe en un dispositivo de gama baja y sintetiza frases cortas en tiempo real sin conexión, gracias a sus 4,5 millones de parámetros y a la exportación ONNX.
- **Accesibilidad web para personas con discapacidad visual**: integración en el navegador mediante onnxruntime-web para leer contenido de páginas con latencia baja, sin depender de servicios cloud de TTS.
- **Asistentes de voz embebidos en dispositivos IoT**: despliegue en hardware con CPU limitada para confirmaciones habladas, avisos de estado o respuestas de menú, aprovechando el rendimiento de 70x tiempo real en cuatro hilos.
- **Generación de audiolibros o podcasts de bajo coste**: procesamiento por lotes de textos largos divididos en frases, con elección de voz F2 o M2 y ajuste de velocidad y tono para dar variedad.
- **Prototipado rápido de interfaces conversacionales**: uso en fases de diseño y pruebas de usuario para validar flujos de voz sin invertir en infraestructura GPU ni en APIs comerciales.
- **Sistemas de anuncios en transporte público o comercios**: síntesis local de mensajes pregrabados o dinámicos en kioscos con hardware modesto, donde la licencia Apache-2.0 permite uso comercial sin restricciones.
- **Investigación en TTS de bajo consumo**: como línea base reproducible para experimentos de compresión, destilación o despliegue en el borde, dado su tamaño reducido y su disponibilidad en PyTorch y ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo en float32 ocupa aproximadamente 18 MB (pesos PyTorch) o 21 MB (ONNX), por lo que la VRAM necesaria es mínima (menos de 1 GB en cualquier configuración).
- GPU recomendadas: no se especifican; cualquier GPU con soporte para PyTorch u ONNX Runtime es suficiente, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100, aunque el modelo está pensado para CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: PyTorch (script `tiny_voca.infer`), ONNX Runtime (Python) y onnxruntime-web (WebAssembly). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: aproximadamente 70 veces más rápido que tiempo real en cuatro hilos de CPU (dato del autor). No se proporcionan cifras de latencia por utterance ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voce-small (tiny-voca) | 4,5 M | 512 tokens de fonemas / 32 s por utterance | Inglés | Apache-2.0 | Hugging Face, PyTorch y ONNX |
| Piper TTS | No disponible en la información | No disponible | Múltiples (no confirmado) | No disponible | No disponible |
| Coqui TTS | No disponible en la información | No disponible | Múltiples (no confirmado) | No disponible | No disponible |
| VITS | No disponible en la información | No disponible | Múltiples (no confirmado) | No disponible | No disponible |

No se dispone de datos verificados sobre parámetros, contexto, rendimiento ni licencia de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La principal diferencia de voce-small frente a alternativas habituales es su tamaño extremadamente reducido y su capacidad de ejecución en navegador mediante ONNX.

## Limitaciones y advertencias

- **Idioma**: solo inglés americano; el texto en otros sistemas de escritura se omite, y no hay soporte multilingüe.
- **Voces limitadas**: únicamente dos voces predefinidas (F2 y M2), sin clonación de voz ni voces personalizadas.
- **Calidad**: al estar entrenado sobre 18 horas de voz sintética y con solo 4,5 millones de parámetros, la naturalidad y expresividad probablemente sean inferiores a las de modelos TTS de mayor tamaño; no se han publicado evaluaciones formales (MOS u otras).
- **Riesgo de alucinación**: en TTS, el equivalente es la pronunciación incorrecta o la generación de artefactos en fonemas ambiguos; no se documentan métricas de inteligibilidad.
- **Límite de utterance**: máximo de 512 tokens y 32 segundos por llamada; es necesario dividir manualmente o mediante el pipeline las frases largas.
- **Picos de amplitud**: el audio puede superar 1.0 en aproximadamente una de cada veinte frases, por lo que debe escalarse antes de guardar en 16 bits para evitar clipping.
- **Sesgos**: no se documentan sesgos conocidos, pero al entrenarse con voz sintética, las características prosódicas pueden estar limitadas al estilo del corpus generado.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar las dependencias (dizione) por si tuvieran condiciones distintas.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/xsingh/voce-small
- Repositorio del proyecto original: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Demo en navegador: https://huggingface.co/spaces/n4ze3m/tiny-voca-studio
