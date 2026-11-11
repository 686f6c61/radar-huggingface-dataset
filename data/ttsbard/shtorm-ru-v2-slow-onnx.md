# TTSBard/shtorm-ru-v2-slow-onnx

## Resumen

Shtorm RU v2 Slow ONNX es una exportación del modelo de síntesis de voz Shtorm PocketTTS RU v2, desarrollado originalmente por ArtShtorm a partir de Kyutai Pocket TTS y empaquetado por TTSBard para inferencia local en CPU mediante ONNX Runtime. El modelo genera voz en ruso a 24 kHz a partir de una referencia de voz en formato WAV, lo que permite clonar o imitar un timbre concreto siempre que se disponga de permiso para usar dicha referencia. La variante "Slow" está pensada para priorizar la calidad o estabilidad de la síntesis sobre la velocidad de generación.

El paquete lo publica TTSBard como parte de su herramienta de escritorio homónima, con cinco grafos ONNX exportados mediante herramientas adaptadas de PocketTTS.cpp. La cuantización INT8 se aplica a FlowLM y al decodificador Mimi, lo que reduce el peso del repositorio a 0,2 GB y facilita su ejecución en equipos sin GPU dedicada. La licencia es CC BY 4.0 y el idioma soportado es únicamente el ruso.

Su relevancia actual radica en que ofrece un pipeline TTS completo, cuantizado y listo para CPU, con integración directa en una aplicación de usuario final. No obstante, la información pública disponible es escasa: no se detallan parámetros, arquitectura interna ni resultados de benchmarks, por lo que debe evaluarse principalmente como componente práctico de TTSBard más que como modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Kyutai Pocket TTS; grafos ONNX con FlowLM y decodificador Mimi) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 en FlowLM y decodificador Mimi; pesos exportados a ONNX |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (cinco grafos); el instalador descarga además model_slow.safetensors y tokenizer.model del repositorio upstream |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano del repositorio | 0,2 GB |
| Libreria de inferencia | onnxruntime |
| Modelo base | ArtShtorm/Shtorm-PocketTTS-RU (revision 33f6c328d62c4da5c1227bbe081e89b574a6183a) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo original más allá de su procedencia: Shtorm PocketTTS RU deriva de Kyutai Pocket TTS, y la exportación incluye FlowLM y el decodificador Mimi, ambos cuantizados a INT8. El paquete contiene cinco grafos ONNX generados con herramientas adaptadas de PocketTTS.cpp, junto con configuración local y un descriptor de paquete para TTSBard.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La única particularidad reseñable es el modo "Slow", que presumiblemente ajusta los parámetros de generación para favorecer la estabilidad o naturalidad del audio, aunque el autor no detalla en qué consiste exactamente.

## Capacidades

- Síntesis de voz en ruso a partir de texto, con salida de audio a 24 kHz.
- Clonación o condicionamiento por referencia de voz: requiere un archivo WAV de referencia cuyo uso esté autorizado.
- Inferencia local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración nativa con la aplicación TTSBard, que descarga automáticamente los pesos upstream fijados a una revisión concreta.
- Variante "Slow" orientada a una generación más pausada o estable (los detalles exactos no están documentados).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe: únicamente ruso.

## Casos de uso

- Lectura de artículos y documentos en ruso: el modelo convierte texto plano en audio a 24 kHz, adecuado para sistemas de lectura por voz integrados en aplicaciones de escritorio o accesibilidad.
- Audiolibros y contenido narrado: la referencia de voz permite mantener un timbre consistente a lo largo de capítulos largos, siempre que se use una voz con derechos claros.
- Asistentes de voz offline: al ejecutarse en CPU con ONNX Runtime, puede integrarse en aplicaciones de escritorio o dispositivos sin GPU para respuestas habladas en ruso.
- Pruebas de doblaje y previsualización: generación rápida de pistas de voz temporales para vídeos o prototipos antes de contratar una locución profesional.
- Sistemas de aviso y notificación: mensajes pregrabados dinámicamente para aplicaciones de transporte, industria o domótica que operen en ruso.
- Investigación en TTS en ruso: al ser un paquete ONNX cuantizado y ligero, sirve como base para experimentos de inferencia en CPU, comparación de cuantizaciones o integración en pipelines propios.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces y contenido en ruso dentro de herramientas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica, el modelo está diseñado para inferencia en CPU mediante ONNX Runtime; no se documentan requisitos de GPU.
- GPU recomendadas: no disponible; el autor no menciona aceleración por GPU.
- Compatibilidad con GPU de consumo: no documentada; el caso de uso declarado es la síntesis local en CPU.
- Memoria RAM estimada: no disponible; el repositorio ocupa 0,2 GB, pero el consumo en ejecución no se especifica.
- Opciones de despliegue: ONNX Runtime y la aplicación TTSBard; el instalador coloca los archivos en `models/pocket/shtorm-ru-v2-slow` dentro del directorio de datos del programa.
- Latencia y throughput: no disponibles. La variante "Slow" sugiere una generación más lenta que otras variantes del mismo modelo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto / parámetros | Notas |
|---|---|---|---|---|---|
| TTSBard/shtorm-ru-v2-slow-onnx | Ruso | ONNX (INT8) | CC BY 4.0 | No disponible | Variante lenta, orientada a CPU |
| ArtShtorm/Shtorm-PocketTTS-RU | Ruso | Safetensors (upstream) | No especificada en la información disponible | No disponible | Modelo original del que deriva esta exportación |
| Kyutai Pocket TTS | No disponible en la información | No disponible | No disponible | No disponible | Base arquitectónica de Shtorm |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia e idioma.

## Limitaciones y advertencias

- Solo soporta ruso; no se documenta ningún otro idioma.
- Requiere una referencia de voz en WAV y el usuario debe garantizar que tiene permiso para usarla; el uso indebido puede vulnerar derechos de imagen o de autor.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (ArtShtorm, Kyutai y TTSBard según corresponda).
- No se documentan sesgos, tasas de alucinación ni métricas de calidad; en TTS, los fallos típicos incluyen pronunciación incorrecta, artefactos y prosodia antinatural, pero no hay datos específicos de este modelo.
- El modelo depende de archivos descargados de una revisión fijada del repositorio upstream (`model_slow.safetensors` y `tokenizer.model`); si esa revisión desaparece, la instalación puede fallar.
- La información pública es muy limitada: no hay parámetros, arquitectura detallada ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Al ser una exportación cuantizada a INT8, es esperable cierta pérdida de calidad respecto al modelo original en safetensors, aunque no se cuantifica.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TTSBard/shtorm-ru-v2-slow-onnx
- Modelo base: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- Revisión fijada del modelo base: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU/tree/33f6c328d62c4da5c1227bbe081e89b574a6183a
- Model card upstream: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU/blob/33f6c328d62c4da5c1227bbe081e89b574a6183a/README.md
- Kyutai Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Repositorio PocketTTS.cpp: https://github.com/VolgaGerm/PocketTTS.cpp
- Aplicación TTSBard: https://github.com/ttsbard/TTSBard
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
