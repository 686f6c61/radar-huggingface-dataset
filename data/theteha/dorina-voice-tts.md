# theteha/dorina-voice-tts

## Resumen

Dorina Voice TTS es un paquete de síntesis de voz en turco compuesto por dos etapas: un modelo acústico FastPitch que convierte texto y fonemas en espectrogramas mel de 80 canales, y un vocoder neuronal HiFi-GAN que transforma esos espectrogramas en forma de onda de audio a 22.050 Hz. Lo desarrolla el usuario theteha y se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,7 GB. El modelo está entrenado específicamente para el idioma turco y no declara soporte multilingüe.

La relevancia de este modelo es acotada y muy específica: cubre la demanda de un pipeline TTS completo, local y ligero para turco, un idioma con menos recursos que el inglés en el ecosistema abierto de síntesis de voz. Al separar el modelo acústico (unos 25,5 MB) del vocoder (unos 660 MB), permite ajustar cada componente por separado y desplegar la parte acústica con un coste de memoria muy bajo.

No obstante, el repositorio no incluye información sobre el corpus de entrenamiento, el número de tokens, las métricas de calidad (MOS) ni los resultados de benchmarks. Tampoco se han publicado descargas ni interacciones en el momento de redactar esta ficha, lo que indica que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (transformer feed-forward con predictor explícito de pitch y duración) + vocoder HiFi-GAN Generator V1 |
| Parametros totales | no disponible (checkpoints de ~25,5 MB acústico y ~660 MB vocoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |
| Frecuencia de muestreo | 22.050 Hz |
| Representación intermedia | espectrograma mel log de 80 bandas |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo acústico sigue la arquitectura FastPitch, un transformer feed-forward que incorpora predictores explícitos de pitch (F0) y de duración de fonema. Esta separación permite controlar de forma explícita la prosodia y el ritmo de la síntesis, algo que los modelos autoregresivos tipo Tacotron no ofrecen de forma tan directa. El modelo recibe texto y fonemas y produce un espectrograma mel de 80 canales. El repositorio incluye dos checkpoints acústicos: `dorina_tts_real.pt` (modelo principal, ~25,5 MB) y `dorina_tts_prototype.pt` (prototipo temprano, ~25,5 MB).

La segunda etapa es un vocoder HiFi-GAN Generator V1, entrenado con discriminadores multiperiodo (MPD) y multiescala (MSD), que convierte el espectrograma mel en audio a 22.050 Hz. El checkpoint `dorina_hifigan_local_ckpt.pt` ocupa unos 660 MB. No se especifican en la model card el número de tokens de entrenamiento, la composición del corpus, la duración total de audio utilizada ni si se aplicaron técnicas de alineamiento forzado, destilación o ajuste fino con preferencias. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en turco, con salida de audio a 22.050 Hz.
- Control explícito de prosodia mediante los predictores de pitch y duración de FastPitch.
- Generación de espectrogramas mel de 80 bandas como representación intermedia reutilizable.
- Conversión de mel-espectrograma a forma de onda mediante el vocoder HiFi-GAN incluido.
- Pipeline de dos etapas separable: permite sustituir el vocoder o el modelo acústico de forma independiente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades de visión, audio de entrada, clonación de voz ni control de estilo por referencia.
- No se documenta soporte multilingüe más allá del turco.

## Casos de uso

- Lectura de artículos y documentos en turco: el pipeline completo convierte texto plano en audio a 22 kHz, adecuado para aplicaciones de accesibilidad y lectores de pantalla en turco.
- Asistentes de voz locales: al ser un modelo ligero y desplegable en local, permite construir asistentes de voz sin depender de servicios en la nube, con la privacidad que ello implica.
- Audiolibros y pódcast automatizados: la separación entre modelo acústico y vocoder permite generar lotes largos de audio y ajustar el vocoder para mejorar la naturalidad.
- Sistemas de megafonía y avisos automatizados en turco: la salida a 22.050 Hz es suficiente para anuncios en estaciones, aeropuertos o comercios.
- Integración en aplicaciones móviles y embebidas: el checkpoint acústico de ~25,5 MB es muy ligero; el vocoder de ~660 MB puede alojarse en servidor o sustituirse por una variante más pequeña.
- Investigación en TTS para lenguas de bajos recursos: sirve como base para experimentar con prosodia, alineamiento y vocoders en turco, y como punto de partida para ajustar el modelo a otros idiomas.
- Prototipado rápido de interfaces conversacionales: la API de dos etapas facilita iterar sobre el texto de entrada y el audio de salida por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo acústico (~25,5 MB) requiere muy poca memoria y puede ejecutarse en CPU; el vocoder (~660 MB) necesita aproximadamente 1-2 GB de VRAM en FP32, y menos si se convierte a FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para el modelo acústico y con latencia mayor para el vocoder.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: al ser checkpoints PyTorch (.pt) sin formato GGUF ni ONNX publicado, el despliegue requiere cargar los pesos con PyTorch y ejecutar el pipeline FastPitch + HiFi-GAN de forma manual; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dorina Voice TTS | Turco | FastPitch + HiFi-GAN | ~25,5 MB acústico + ~660 MB vocoder | no disponible | Apache 2.0 | Hugging Face |
| Coqui TTS (modelos turcos) | Multilingüe, incluido turco | Tacotron2 / FastPitch + vocoders | Variable según modelo | no aplica | MPL 2.0 / Apache 2.0 según modelo | Hugging Face, GitHub |
| Piper TTS | Multilingüe, incluido turco | VITS | Variable, modelos ligeros | no aplica | MIT | GitHub, Hugging Face |
| VITS turco (comunidad) | Turco | VITS | Variable | no aplica | Variable | Hugging Face |

La comparativa es aproximada: no se dispone de métricas de calidad (MOS) ni de rendimiento publicadas para Dorina Voice TTS, por lo que la comparación se limita a aspectos de arquitectura, licencia y disponibilidad. Frente a Piper y VITS, la ventaja de Dorina es la separación explícita entre modelo acústico y vocoder, que facilita el ajuste independiente de cada etapa; la desventaja es la ausencia de validación comunitaria y de documentación sobre el entrenamiento.

## Limitaciones y advertencias

- El modelo solo está entrenado para turco; no se documenta soporte para otros idiomas y su uso fuera del turco produciría resultados no fiables.
- No se publican datos sobre el corpus de entrenamiento, por lo que se desconocen los sesgos de voz (género, acento, registro) presentes en el modelo.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o en nombres propios.
- La calidad de la síntesis no está validada con métricas objetivas (MOS, CMOS) ni con evaluaciones de oyentes.
- El repositorio no incluye código de inferencia ni instrucciones de uso, solo los checkpoints, lo que aumenta la barrera de entrada.
- El checkpoint `dorina_tts_prototype.pt` es un prototipo temprano y no debería usarse en producción.
- La licencia Apache 2.0 permite uso comercial, pero al no documentarse el origen del corpus de entrenamiento no puede garantizarse que los datos subyacentes no tengan restricciones adicionales.
- El vocoder de ~660 MB puede ser excesivo para despliegues embebidos; conviene evaluar variantes más ligeras o cuantización.
- No se documentan mecanismos de control de prosodia más allá de los predictores internos, ni clonación de voz ni control de emoción.

## Enlaces

- [Hugging Face: theteha/dorina-voice-tts](https://huggingface.co/theteha/dorina-voice-tts)
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
